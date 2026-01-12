// src/components/SecuritySettings.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Fingerprint, ScanFace, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BiometricService, type AvailableBiometricTypes } from '@/services/biometric.service';
import { useAuth } from '@/contexts/AuthContext';

type BiometricType = 'face' | 'fingerprint' | null;

const SecuritySettings = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<AvailableBiometricTypes>({ face: false, fingerprint: false });
  const [activeBiometricType, setActiveBiometricType] = useState<BiometricType>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [selectedBiometricType, setSelectedBiometricType] = useState<BiometricType>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        setIsLoading(true);
        const [available, availableTypes, storedType] = await Promise.all([
          BiometricService.isAvailable(),
          BiometricService.getAvailableBiometricTypes(),
          BiometricService.getStoredBiometricType()
        ]);
        
        setIsBiometricAvailable(available);
        setAvailableTypes(availableTypes);
        
        if (available) {
          const hasCredentials = await BiometricService.hasBiometricCredentials();
          setIsBiometricEnabled(hasCredentials);
          
          if (hasCredentials && storedType) {
            setActiveBiometricType(storedType as BiometricType);
          }
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
        toast.error('Failed to check biometric settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkBiometrics();
  }, []);

  const startBiometricSetup = (type: BiometricType) => {
    setSelectedBiometricType(type);
    setIsSettingUp(true);
  };

  const cancelBiometricSetup = () => {
    setSelectedBiometricType(null);
    setIsSettingUp(false);
  };

  const completeBiometricSetup = async () => {
    if (!user || !selectedBiometricType) return;
    
    setIsLoading(true);
    try {
      // Verify the user's identity with biometrics
      const verified = await BiometricService.verifyIdentity({
        reason: `Enable ${selectedBiometricType} login`,
        title: `Enable ${selectedBiometricType === 'face' ? 'Face ID' : 'Fingerprint'}`,
        subtitle: 'Verify your identity to continue'
      });
      
      if (!verified) {
        throw new Error('Biometric verification failed or was canceled');
      }
      
      // Save user credentials for biometric login
      await BiometricService.saveCredentials({
        username: user.username,
        password: user.password, // In a real app, use a secure token instead
        role: user.role,
        biometricType: selectedBiometricType
      });
      
      setIsBiometricEnabled(true);
      setActiveBiometricType(selectedBiometricType);
      setIsSettingUp(false);
      setSelectedBiometricType(null);
      
      toast.success(`${selectedBiometricType === 'face' ? 'Face ID' : 'Fingerprint'} enabled successfully`);
    } catch (error) {
      console.error('Error setting up biometric login:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to set up biometric login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableBiometrics = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await BiometricService.removeCredentials();
      setIsBiometricEnabled(false);
      setActiveBiometricType(null);
      toast.success('Biometric login disabled');
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      toast.error('Failed to disable biometric login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBiometricAvailable) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Biometric Authentication</CardTitle>
          </div>
          <CardDescription>
            Secure your account with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">
                Biometric authentication is not available on this device or has not been set up.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Biometric Authentication</CardTitle>
          </div>
          <CardDescription>
            {isBiometricEnabled 
              ? `Using ${activeBiometricType === 'face' ? 'Face ID' : 'Fingerprint'} for secure login`
              : 'Enable biometric login for faster, more secure access to your account.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Biometric Login</h3>
              <p className="text-sm text-muted-foreground">
                {isBiometricEnabled 
                  ? 'Enabled for quick access'
                  : 'Sign in with your face or fingerprint'}
              </p>
            </div>
            <Switch
              checked={isBiometricEnabled}
              onCheckedChange={(checked) => 
                checked ? startBiometricSetup(availableTypes.face ? 'face' : 'fingerprint') : handleDisableBiometrics()
              }
              disabled={isLoading}
            />
          </div>

          <AnimatePresence>
            {isSettingUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="text-sm font-medium">Choose a biometric method:</div>
                <div className="grid gap-3">
                  {availableTypes.face && (
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-14"
                      onClick={() => startBiometricSetup('face')}
                      disabled={isLoading}
                    >
                      <ScanFace className="w-5 h-5" />
                      <span>Use Face ID</span>
                      {activeBiometricType === 'face' && (
                        <CheckCircle className="ml-auto w-4 h-4 text-green-500" />
                      )}
                    </Button>
                  )}
                  
                  {availableTypes.fingerprint && (
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-14"
                      onClick={() => startBiometricSetup('fingerprint')}
                      disabled={isLoading}
                    >
                      <Fingerprint className="w-5 h-5" />
                      <span>Use Fingerprint</span>
                      {activeBiometricType === 'fingerprint' && (
                        <CheckCircle className="ml-auto w-4 h-4 text-green-500" />
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelBiometricSetup}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={completeBiometricSetup}
                    disabled={!selectedBiometricType || isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </motion.div>
            )}
            
            {isBiometricEnabled && !isSettingUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-muted/10 rounded-lg border space-y-3">
                  <div className="flex items-center gap-3">
                    {activeBiometricType === 'face' ? (
                      <ScanFace className="w-5 h-5 text-green-500" />
                    ) : (
                      <Fingerprint className="w-5 h-5 text-green-500" />
                    )}
                    <span className="text-sm">
                      {activeBiometricType === 'face' 
                        ? 'Face ID is enabled for this account.' 
                        : 'Fingerprint is enabled for this account.'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleDisableBiometrics}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Disabling...' : 'Disable Biometric Login'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Always keep your device's operating system up to date</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Use a strong device passcode in addition to biometrics</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Regularly review active devices and sessions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;