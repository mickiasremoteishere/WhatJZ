import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/react';

export interface BiometricCredentials {
  username: string;
  password: string;
  role: string;
  biometricType?: 'face' | 'fingerprint';
  lastUsed?: number;
}

export interface AvailableBiometricTypes {
  face: boolean;
  fingerprint: boolean;
}

export class BiometricService {
  private static readonly STORAGE_KEY = 'biometric_credentials';
  private static readonly BIOMETRIC_TYPE_KEY = 'biometric_type';

  /**
   * Get the available biometric types on the device
   */
  static async getAvailableBiometricTypes(): Promise<AvailableBiometricTypes> {
    if (!Capacitor.isNativePlatform()) {
      // For web, return both as available for demo purposes
      return { face: true, fingerprint: true };
    }

    try {
      const result = await NativeBiometric.isAvailable();
      const biometryType = String(result.biometryType || '').toLowerCase();
      return {
        face: biometryType.includes('face'),
        fingerprint: biometryType.includes('finger') || biometryType.includes('touch')
      };
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return { face: false, fingerprint: false };
    }
  }

  /**
   * Get the currently stored biometric type
   */
  static async getStoredBiometricType(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      const stored = localStorage.getItem(this.BIOMETRIC_TYPE_KEY);
      return stored ? JSON.parse(stored) : null;
    }

    const { value } = await Preferences.get({ key: this.BIOMETRIC_TYPE_KEY });
    return value ? JSON.parse(value) : null;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Running in web mode - using mock biometrics');
        return true; // Enable mock biometrics for web
      }

      const result = await NativeBiometric.isAvailable();
      return result.isAvailable;
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  /**
   * Save user credentials for biometric authentication
   */
  static async saveCredentials(credentials: BiometricCredentials): Promise<void> {
    try {
      const credsWithTimestamp = {
        ...credentials,
        lastUsed: Date.now()
      };

      if (!Capacitor.isNativePlatform()) {
        // Mock save for web
        console.log('Mock saving credentials for web');
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credsWithTimestamp));
        if (credentials.biometricType) {
          localStorage.setItem(this.BIOMETRIC_TYPE_KEY, JSON.stringify(credentials.biometricType));
        }
        return;
      }

      // Save to secure storage
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(credsWithTimestamp)
      });

      // Store the biometric type separately for quick access
      if (credentials.biometricType) {
        await Preferences.set({
          key: this.BIOMETRIC_TYPE_KEY,
          value: JSON.stringify(credentials.biometricType)
        });
      }
      // For native, we'll use the biometric plugin's built-in storage
      if (Capacitor.isNativePlatform()) {
        await NativeBiometric.setCredentials({
          username: credentials.username,
          password: credentials.password,
          server: 'whatj-app',
        });
      }
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      throw new Error('Failed to save biometric credentials');
    }
  }

  /**
   * Verify user identity using biometric authentication
   */
  static async verifyIdentity(options: {
    reason: string;
    title?: string;
    subtitle?: string;
  }): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Mock verification for web
        console.log('Mock biometric verification');
        return new Promise((resolve) => {
          // Simulate biometric verification with a delay
          setTimeout(() => resolve(true), 1000);
        });
      }

      await NativeBiometric.verifyIdentity({
        reason: options.reason,
        title: options.title || 'Verify Identity',
        subtitle: options.subtitle || '',
        description: '',
        useFallback: true // Allow device PIN/pattern/password as fallback
      });

      return true;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  }

  /**
   * Retrieve saved credentials using biometric authentication
   */
  static async getCredentials(): Promise<BiometricCredentials | null> {
    try {
      // First, verify biometrics
      const verified = await this.verifyIdentity({
        reason: 'Authenticate to access your account',
        title: 'Biometric Login',
        subtitle: 'Verify your identity',
      });

      if (!verified) {
        return null;
      }

      // Get stored credentials
      if (!Capacitor.isNativePlatform()) {
        const value = localStorage.getItem(this.STORAGE_KEY);
        if (!value) return null;
        
        const credentials = JSON.parse(value) as BiometricCredentials;
        // Update last used timestamp
        credentials.lastUsed = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
        return credentials;
      }
      
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (!value) return null;
      
      // Update last used timestamp
      const credentials = JSON.parse(value) as BiometricCredentials;
      credentials.lastUsed = Date.now();
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(credentials)
      });
      
      return credentials;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  }

  /**
   * Check if valid biometric credentials exist
   */
  static async hasBiometricCredentials(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Mock check for web
        return !!localStorage.getItem(this.STORAGE_KEY);
      }
      
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (!value) return false;
      
      // Check if credentials are expired (30 days)
      const credentials = JSON.parse(value) as BiometricCredentials;
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (credentials.lastUsed && (Date.now() - credentials.lastUsed) > THIRTY_DAYS) {
        await this.removeCredentials();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking biometric credentials:', error);
      return false;
    }
  }

  /**
   * Remove saved biometric credentials
   */
  static async removeCredentials(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // Mock remove for web
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.BIOMETRIC_TYPE_KEY);
        return;
      }
      
      await Promise.all([
        Preferences.remove({ key: this.STORAGE_KEY }),
        Preferences.remove({ key: this.BIOMETRIC_TYPE_KEY }),
        NativeBiometric.deleteCredentials({
          server: 'whatj-app',
        }).catch(() => {
          // Ignore errors if credentials don't exist
        })
      ]);
    } catch (error) {
      console.error('Failed to remove biometric credentials:', error);
      throw error;
    }
  }
}