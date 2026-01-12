import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types/exam';
import { BiometricService, BiometricCredentials } from '@/services/biometric.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  login: (admissionId: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  setupBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  checkBiometricAvailability: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  'STU2024001': {
    password: 'password123',
    user: {
      id: '1',
      admissionId: 'STU2024001',
      name: 'John Smith',
      email: 'john.smith@school.edu',
      role: 'student',
      biometricEnabled: false,
    },
  },
  'TCH2024001': {
    password: 'teacher123',
    user: {
      id: '2',
      admissionId: 'TCH2024001',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      role: 'teacher',
      biometricEnabled: false,
    },
  },
  'ADM2024001': {
    password: 'admin123',
    user: {
      id: '3',
      admissionId: 'ADM2024001',
      name: 'Admin User',
      email: 'admin@school.edu',
      role: 'admin',
      biometricEnabled: false,
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await BiometricService.isAvailable();
      setIsBiometricAvailable(available);
      
      if (available) {
        const hasCredentials = await BiometricService.hasBiometricCredentials();
        setIsBiometricEnabled(hasCredentials);
      }
    };
    
    checkBiometric();
  }, []);

  const login = useCallback(async (admissionId: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userData = mockUsers[admissionId];
    if (userData && userData.password === password) {
      const loggedInUser = userData.user;
      setUser(loggedInUser);
      
      if (rememberMe && isBiometricAvailable) {
        try {
          await BiometricService.saveCredentials({
            username: admissionId,
            password: password,
            role: loggedInUser.role
          });
          setIsBiometricEnabled(true);
        } catch (error) {
          console.error('Failed to save biometric credentials:', error);
          // Don't fail login if biometric setup fails
        }
      }
      
      return true;
    }
    return false;
  }, [isBiometricAvailable]);

  const logout = useCallback(async () => {
    setUser(null);
    // Optionally clear biometric credentials on logout
    // await BiometricService.removeCredentials();
  }, []);

  const setupBiometric = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // This will trigger the biometric prompt
      await BiometricService.verifyIdentity({
        reason: 'Setup biometric login',
        title: 'Enable Biometric Login',
        subtitle: 'Verify your identity to enable biometric login',
        description: ''
      });
      
      // If we get here, biometric verification was successful
      setIsBiometricEnabled(true);
      return true;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return false;
    }
  }, [user]);

  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const credentials = await BiometricService.getCredentials();
      if (!credentials) return false;
      
      // Use the stored credentials to log in
      return await login(credentials.username, credentials.password, false);
    } catch (error) {
      console.error('Biometric login failed:', error);
      return false;
    }
  }, [login]);
  
  const checkBiometricAvailability = useCallback(async (): Promise<boolean> => {
    const available = await BiometricService.isAvailable();
    setIsBiometricAvailable(available);
    return available;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isBiometricAvailable,
        isBiometricEnabled,
        login,
        logout,
setupBiometric,
        loginWithBiometric,
        checkBiometricAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
