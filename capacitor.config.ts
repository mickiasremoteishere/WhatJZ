import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examapp.biometric',
  appName: 'Exam App with Biometric',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BiometricAuth: {
      // Android-specific configuration
      android: {
        // Optional: Customize the authentication prompt
        title: 'Biometric Login',
        subtitle: 'Log in using your biometric credential',
        description: 'Use your fingerprint or face to log in',
        // Optional: Set the maximum number of attempts
        maxAttempts: 3,
        // Optional: Set the authentication validity duration (in seconds)
        validityDuration: 30,
      },
      // iOS-specific configuration
      ios: {
        // Optional: Customize the authentication prompt
        reason: 'Log in using your biometric credential',
        // Optional: Allow fallback to device passcode
        allowDeviceCredential: true,
      },
    },
  },
};

export default config;
