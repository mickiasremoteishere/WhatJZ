import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Fingerprint,
  ScanFace
} from 'lucide-react';
import { toast } from 'sonner';
import { BiometricService } from '@/services/biometric.service';

const Login = () => {
  // State management
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricOptions, setShowBiometricOptions] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    user, 
    isBiometricAvailable: isBiometricAvailableContext,
    loginWithBiometric,
    checkBiometricAvailability
  } = useAuth();

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await checkBiometricAvailability();
      setIsBiometricAvailable(available);
      
      // Try biometric login if available and credentials exist
      if (available) {
        const hasCredentials = await BiometricService.hasBiometricCredentials();
        if (hasCredentials) {
          handleBiometricLogin();
        }
      }
    };
    
    checkBiometric();
  }, [checkBiometricAvailability]);

  // Pre-fill based on navigation state
  useEffect(() => {
    const state = location.state as { prefillRole?: string } | null;
    if (state?.prefillRole === 'teacher') {
      setAdmissionId('TCH2024001');
      setPassword('teacher123');
    } else if (state?.prefillRole === 'admin') {
      setAdmissionId('ADM2024001');
      setPassword('admin123');
    } else if (state?.prefillRole === 'student') {
      setAdmissionId('STU2024001');
      setPassword('student123');
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
        // Show biometric options if available and not already enabled
        if (isBiometricAvailable && !user?.biometricEnabled) {
          setShowBiometricOptions(true);
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
      const success = await loginWithBiometric();
      if (success) {
        toast.success('Biometric login successful!');
        navigateBasedOnRole();
      } else {
        toast.error('Biometric authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast.error('An error occurred during biometric login');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricOptions(false);
    navigateBasedOnRole();
  };

  const handleSetupBiometric = async (type: 'face' | 'fingerprint') => {
    try {
      setIsBiometricLoading(true);
      // This will trigger the biometric setup flow
      const success = await BiometricService.verifyIdentity({
        reason: `Register your ${type} for quick login`,
        title: `Register ${type === 'face' ? 'Face ID' : 'Fingerprint'}`,
        subtitle: 'Follow the on-screen instructions',
      });

      if (success) {
        toast.success(`${type === 'face' ? 'Face ID' : 'Fingerprint'} setup complete!`);
        // In a real app, you would update the user's biometric status in your backend here
        // For now, we'll just navigate to the dashboard
        navigateBasedOnRole();
      } else {
        toast.error(`Failed to setup ${type === 'face' ? 'Face ID' : 'Fingerprint'}. Please try again.`);
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      toast.error('An error occurred during biometric setup');
    } finally {
      setIsBiometricLoading(false);
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

  const renderLoginForm = () => (
    <motion.form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-center text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admissionId">Admission ID</Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="admissionId"
              type="text"
              placeholder="Enter your admission ID"
              value={admissionId}
              onChange={(e) => setAdmissionId(e.target.value)}
              className="pl-9 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="remember" className="text-sm font-medium leading-none">
              Remember me
            </Label>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => toast.info('Please contact your administrator to reset your password.')}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
        
        {isBiometricAvailable && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        )}
        
        {isBiometricAvailable && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleBiometricLogin}
            disabled={isBiometricLoading}
          >
            {isBiometricLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Fingerprint className="mr-2 h-4 w-4" />
            )}
            Sign in with {navigator.userAgent.includes('Mac') ? 'Touch ID' : 'Biometrics'}
          </Button>
        )}
      </div>
    </motion.form>
  );

  const renderBiometricSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <GlassCard className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Enable Biometric Login</h1>
          <p className="text-muted-foreground">
            Speed up your next login with {isBiometricAvailable ? 'Face ID, Touch ID, or device passcode' : 'biometric authentication'}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleSetupBiometric('face')}
            className="w-full justify-start space-x-3 h-14"
            variant="outline"
            disabled={isBiometricLoading}
          >
            <ScanFace className="h-5 w-5" />
            <span>Use Face ID</span>
          </Button>
          
          <Button
            onClick={() => handleSetupBiometric('fingerprint')}
            className="w-full justify-start space-x-3 h-14"
            variant="outline"
            disabled={isBiometricLoading}
          >
            <Fingerprint className="h-5 w-5" />
            <span>Use Fingerprint</span>
          </Button>
          
          <Button 
            onClick={handleSkipBiometric}
            variant="ghost"
            className="w-full mt-4"
            disabled={isBiometricLoading}
          >
            Skip for now
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );

  const renderBiometricLoginPrompt = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <FloatingParticles />
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <Fingerprint className="h-12 w-12 mx-auto text-primary" />
        </div>
        <p className="text-lg font-medium">Waiting for biometric verification...</p>
        <p className="text-sm text-muted-foreground">Please verify your identity to continue</p>
      </div>
    </div>
  );

  if (isBiometricAvailable && isBiometricLoading) {
    return renderBiometricLoginPrompt();
  }

  if (showBiometricOptions) {
    return renderBiometricSetup();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <FloatingParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6 md:p-8">
          {renderLoginForm()}
          <motion.div 
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>Don't have an account?{' '}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => toast.info('Please contact your administrator to create an account.')}
              >
                Contact Admin
              </button>
            </p>
          </motion.div>
          <motion.div 
            className="mt-8 flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setAdmissionId('STU2024001');
                setPassword('student123');
              }}
            >
              Demo Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setAdmissionId('TCH2024001');
                setPassword('teacher123');
              }}
            >
              Demo Teacher
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setAdmissionId('ADM2024001');
                setPassword('admin123');
              }}
            >
              Demo Admin
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;