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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  // State management
  const [admissionId, setAdmissionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

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
        navigateBasedOnRole();
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <FloatingParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6 md:p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold mb-2 text-foreground"
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="admissionId">Admission ID</Label>
              <Input
                id="admissionId"
                type="text"
                placeholder="Enter your admission ID"
                value={admissionId}
                onChange={(e) => setAdmissionId(e.target.value)}
                className="h-11"
                required
              />
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

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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