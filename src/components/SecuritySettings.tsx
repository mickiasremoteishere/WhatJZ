// src/components/SecuritySettings.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Fingerprint, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BiometricService } from '@/services/biometric.service';
import { useAuth } from '@/contexts/AuthContext';

const SecuritySettings = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const available = await BiometricService.isAvailable();
        setIsBiometricAvailable(available);
        
        if (available) {
          const hasCredentials = await BiometricService.hasBiometricCredentials();
          setIsBiometricEnabled(hasCredentials);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      }
    };
    
    checkBiometrics();
  }, []);

  const handleBiometricToggle = async (checked: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (checked) {
        // First verify the user's identity with biometrics
        const verified = await BiometricService.verifyIdentity({
          reason: 'Enable biometric login',
          title: 'Verify Identity',
          subtitle: 'Verify your identity to enable biometric login'
        });
        
        if (!verified) {
          throw new Error('Biometric verification failed or was canceled');
        }
        
        // For demo purposes, we're using a placeholder password
        // In a real app, you would get this from your auth system
        await BiometricService.saveCredentials({
          username: user.id,
          password: 'biometric_placeholder_password', // This should be the user's actual password
          role: user.role
        });
        
        toast.success('Biometric authentication enabled successfully');
      } else {
        // Disable biometric authentication
        await BiometricService.removeCredentials();
        toast.success('Biometric authentication disabled');
      }
      setIsBiometricEnabled(checked);
    } catch (error) {
      console.error('Error toggling biometric authentication:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update biometric settings');
      setIsBiometricEnabled(!checked); // Revert the toggle state on error
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBiometricAvailable) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-medium mb-2">Biometric Authentication</h3>
        <p className="text-sm">Biometric authentication is not available on this device.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">Biometric Authentication</h3>
            <p className="text-sm text-muted-foreground">
              {isBiometricEnabled 
                ? 'Use your fingerprint or face to log in' 
                : 'Enable for faster, more secure access'}
            </p>
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={isBiometricEnabled}
            onCheckedChange={handleBiometricToggle}
            disabled={isLoading}
          />
        )}
      </div>

      <div className="p-4 bg-muted/10 rounded-lg text-sm space-y-2">
        <h4 className="font-medium">How it works</h4>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Enable biometric authentication for faster, more secure access to your account</li>
          <li>Use your device's fingerprint sensor or face recognition to log in</li>
          <li>You can disable this feature at any time in your security settings</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;