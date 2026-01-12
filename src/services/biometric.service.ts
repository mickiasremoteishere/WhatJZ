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
      if (!isPlatform('capacitor')) {
        // Mock save for web
        console.log('Mock saving credentials for web');
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
        return;
      }
      
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
        // Enhanced mock for web with better UI
        return new Promise((resolve) => {
          // Create a more styled dialog for web
          const dialog = document.createElement('div');
          dialog.style.position = 'fixed';
          dialog.style.top = '0';
          dialog.style.left = '0';
          dialog.style.right = '0';
          dialog.style.bottom = '0';
          dialog.style.backgroundColor = 'rgba(0,0,0,0.5)';
          dialog.style.display = 'flex';
          dialog.style.justifyContent = 'center';
          dialog.style.alignItems = 'center';
          dialog.style.zIndex = '1000';
          
          const content = document.createElement('div');
          content.style.background = 'white';
          content.style.padding = '20px';
          content.style.borderRadius = '8px';
          content.style.maxWidth = '400px';
          content.style.width = '90%';
          content.style.textAlign = 'center';
          
          const title = document.createElement('h3');
          title.textContent = options.title || 'Biometric Verification';
          title.style.marginTop = '0';
          title.style.color = '#333';
          
          const message = document.createElement('p');
          message.textContent = options.reason;
          message.style.marginBottom = '20px';
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'flex';
          buttonContainer.style.justifyContent = 'center';
          buttonContainer.style.gap = '10px';
          
          const confirmBtn = document.createElement('button');
          confirmBtn.textContent = 'Verify';
          confirmBtn.style.padding = '8px 16px';
          confirmBtn.style.border = 'none';
          confirmBtn.style.borderRadius = '4px';
          confirmBtn.style.background = '#4CAF50';
          confirmBtn.style.color = 'white';
          confirmBtn.style.cursor = 'pointer';
          
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.style.padding = '8px 16px';
          cancelBtn.style.border = '1px solid #ccc';
          cancelBtn.style.borderRadius = '4px';
          cancelBtn.style.background = 'white';
          cancelBtn.style.cursor = 'pointer';
          
          content.appendChild(title);
          if (options.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.textContent = options.subtitle;
            subtitle.style.color = '#666';
            content.appendChild(subtitle);
          }
          content.appendChild(message);
          
          buttonContainer.appendChild(confirmBtn);
          buttonContainer.appendChild(cancelBtn);
          content.appendChild(buttonContainer);
          dialog.appendChild(content);
          document.body.appendChild(dialog);
          
          // Handle button clicks
          const cleanup = () => {
            document.body.removeChild(dialog);
            confirmBtn.removeEventListener('click', confirm);
            cancelBtn.removeEventListener('click', cancel);
          };
          
          const confirm = () => {
            cleanup();
            resolve(true);
          };
          
          const cancel = () => {
            cleanup();
            resolve(false);
          };
          
          confirmBtn.addEventListener('click', confirm);
          cancelBtn.addEventListener('click', cancel);
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
      if (!isPlatform('capacitor')) {
        const value = localStorage.getItem(this.STORAGE_KEY);
        return value ? JSON.parse(value) as BiometricCredentials : null;
      }
      
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
      if (!isPlatform('capacitor')) {
        // Mock check for web
        return !!localStorage.getItem(this.STORAGE_KEY);
      }
      
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
      if (!isPlatform('capacitor')) {
        // Mock remove for web
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }
      
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