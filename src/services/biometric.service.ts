import { NativeBiometric } from 'capacitor-native-biometric';
import { Preferences } from '@capacitor/preferences';
import { isPlatform } from '@ionic/react';

export interface BiometricCredentials {
  username: string;
  password: string;
  role: string;
}

export class BiometricService {
  private static readonly STORAGE_KEY = 'biometric_credentials';

  /**
   * Check if biometric authentication is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (!isPlatform('capacitor')) {
        console.log('Biometric auth not available on web platform');
        return false;
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
      // Save to secure storage using Capacitor's Preferences
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(credentials)
      });

      // Set up biometric authentication
      await NativeBiometric.setCredentials({
        username: credentials.username,
        password: credentials.password,
        server: 'exam-app',
      });
    } catch (error) {
      console.error('Failed to save biometric credentials:', error);
      throw error;
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
      if (!isPlatform('capacitor')) {
        // Simulate biometric verification on web
        return new Promise((resolve) => {
          const confirmed = window.confirm(`${options.reason}\n\nThis is a web preview. In a real app, you would see a native biometric prompt.`);
          resolve(!!confirmed);
        });
      }

      await NativeBiometric.verifyIdentity({
        reason: options.reason,
        title: options.title || 'Authentication Required',
        subtitle: options.subtitle,
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
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as BiometricCredentials;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  }

  /**
   * Check if biometric credentials exist for the user
   */
  static async hasBiometricCredentials(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      return !!value;
    } catch (error) {
      console.error('Failed to check biometric credentials:', error);
      return false;
    }
  }

  /**
   * Remove saved biometric credentials
   */
  static async removeCredentials(): Promise<void> {
    try {
      await Preferences.remove({ key: this.STORAGE_KEY });
      await NativeBiometric.deleteCredentials({
        server: 'exam-app',
      });
    } catch (error) {
      console.error('Failed to remove biometric credentials:', error);
      throw error;
    }
  }
}