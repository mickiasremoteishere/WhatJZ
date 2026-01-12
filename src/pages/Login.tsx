import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BiometricService } from '@/services/biometric.service';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  Fingerprint as FingerprintIcon
} from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  // State management
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'biometric-setup' | 'success'>('login');
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | null>(null);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    setupBiometric, 
    loginWithBiometric, 
    isBiometricAvailable, 
    isBiometricEnabled,
    checkBiometricAvailability,
    user 
  } = useAuth();

  // Check for biometric availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const available = await BiometricService.isAvailable();
        
        if (available) {
          const hasCredentials = await BiometricService.hasBiometricCredentials();
          
          // Auto-login with biometrics if available and enabled
          if (hasCredentials) {
            const success = await loginWithBiometric();
            if (success) {
              toast.success('Welcome back!');
            }
          }
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      }
    };
    
    checkBiometrics();
  }, [loginWithBiometric]);

  // Pre-fill based on navigation state
  useEffect(() => {
    const state = location.state as { prefillRole?: string } | null;
    if (state?.prefillRole === 'teacher') {
      setAdmissionId('TCH2024001');
      setPassword('teacher123');
    } else if (state?.prefillRole === 'admin') {
      setAdmissionId('ADM2024001');
      setPassword('admin123');
    }
  }, [location.state]);

  // Event handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionId || !password) {
      toast.error('Please enter your admission ID and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(admissionId, password, rememberMe);
      
      if (success) {
        toast.success('Login successful!');
        
        // Only show biometric setup if it's available and not already enabled
        if (isBiometricAvailable && !isBiometricEnabled && rememberMe) {
          setStep('biometric-setup');
        } else {
          navigateBasedOnRole();
        }
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!isBiometricAvailable) return;
    
    setIsBiometricLoading(true);
    try {
      // First verify the user's identity with biometrics
      const verified = await BiometricService.verifyIdentity({
        reason: 'Authenticate to access your account',
        title: 'Biometric Authentication',
        subtitle: 'Verify your identity to continue'
      });
      
      if (verified) {
        // If verification succeeds, proceed with login
        const success = await loginWithBiometric();
        if (success) {
          toast.success('Welcome back!');
          return;
        }
      }
      
      toast.error('Biometric authentication failed. Please try again.');
    } catch (error) {
      console.error('Biometric login error:', error);
      toast.error('Failed to authenticate with biometrics');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleBiometricSetup = async (type: 'fingerprint' | 'face') => {
    setBiometricType(type);
    setIsLoading(true);
    
    try {
      // First verify the user's identity with biometrics
      const verified = await BiometricService.verifyIdentity({
        reason: 'Verify your identity to enable biometric login',
        title: 'Confirm Your Identity',
        subtitle: 'This will allow you to log in with biometrics in the future.'
      });
      
      if (!verified) {
        throw new Error('Biometric verification failed');
      }
      
      // Save the credentials first
      await BiometricService.saveCredentials({
        username: admissionId,
        password: password,
        role: user?.role || 'student'
      });
      
      // Then set up biometric verification
      const success = await setupBiometric();
      
      if (success) {
        setStep('success');
        setTimeout(() => {
          navigateBasedOnRole();
        }, 2000);
      } else {
        throw new Error('Failed to save biometric credentials');
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      toast.error('Failed to set up biometric authentication. Please try again.');
      setIsLoading(false);
    }
  };

  const navigateBasedOnRole = () => {
    if (!user) {
      console.error('No user data available for navigation');
      return;
    }
    
    // Clear any sensitive data from state
    setPassword('');
    
    // Navigate based on role
    if (user.role === 'teacher') {
      navigate('/teacher');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSkipBiometric = () => {
    // Clear any partial biometric setup
    BiometricService.removeCredentials().catch(console.error);
    navigateBasedOnRole();
  };

  // Render the login UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 mb-4"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            ExamSecure
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Grade 12 Examination Portal
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'login' && (
            <GlassCard key="login" className="p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-5 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Enter your credentials to access your exams
                  </p>
                </div>

                {isBiometricAvailable && isBiometricEnabled && (
                  <div className="space-y-4 mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleBiometricLogin}
                      disabled={isBiometricLoading}
                    >
                      {isBiometricLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FingerprintIcon className="h-5 w-5" />
                      )}
                      Sign in with Biometrics
                    </Button>
                    <div className="relative flex justify-center">
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500 dark:bg-gray-800">Or continue with</span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionId">Admission ID</Label>
                    <div className="relative">
                      <Input
                        id="admissionId"
                        placeholder="Enter your admission ID"
                        value={admissionId}
                        onChange={(e) => setAdmissionId(e.target.value)}
                        className="pl-10"
                        autoComplete="username"
                        disabled={isLoading || isBiometricLoading}
                      />
                      <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => toast.info('Please contact support to reset your password')}
                        disabled={isLoading || isBiometricLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                        autoComplete="current-password"
                        disabled={isLoading || isBiometricLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isBiometricLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading || isBiometricLoading}
                      />
                      <Label htmlFor="rememberMe" className="text-sm font-medium leading-none">
                        Remember me
                      </Label>
                    </div>
                    
                    {isBiometricAvailable && !isBiometricEnabled && rememberMe && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <FingerprintIcon className="mr-1 h-3 w-3" />
                        <span>Will enable biometric login</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || isBiometricLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    
                    {isBiometricAvailable && !isBiometricEnabled && rememberMe && (
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        You'll be prompted to set up biometric login after signing in
                      </p>
                    )}
                  </div>
                </form>
              </motion.div>
            </GlassCard>
          )}

          {step === 'biometric-setup' && (
            <GlassCard key="biometric-setup" className="p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FingerprintIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Set Up Biometric Login
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  For faster and more secure access to your account
                </p>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBiometricSetup('fingerprint')}
                    disabled={isLoading}
                  >
                    <FingerprintIcon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Fingerprint</div>
                      <div className="text-xs text-muted-foreground">Use your fingerprint to log in</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBiometricSetup('face')}
                    disabled={isLoading}
                  >
                    <FingerprintIcon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Face ID</div>
                      <div className="text-xs text-muted-foreground">Use facial recognition to log in</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={handleSkipBiometric}
                    disabled={isLoading}
                  >
                    Skip for now
                  </Button>
                </div>
              </motion.div>
            </GlassCard>
          )}

          {step === 'success' && (
            <GlassCard key="success" className="p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Biometric Login Set Up
                </h2>
                <p className="text-sm text-muted-foreground">
                  You can now use your {biometricType === 'face' ? 'Face ID' : 'fingerprint'} to log in next time.
                </p>
                <div className="mt-6">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Redirecting you to your dashboard...</p>
                </div>
              </motion.div>
            </GlassCard>
          )}
        </AnimatePresence>

        <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border/50 space-y-2">
          <p className="text-[10px] md:text-xs text-center text-muted-foreground">
            <strong>Student:</strong> STU2024001 / password123
          </p>
          <p className="text-[10px] md:text-xs text-center text-muted-foreground">
            <strong>Teacher:</strong> TCH2024001 / teacher123
          </p>
          <p className="text-[10px] md:text-xs text-center text-muted-foreground">
            <strong>Admin:</strong> ADM2024001 / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;