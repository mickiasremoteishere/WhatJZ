import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SplashScreen } from '@/components/SplashScreen';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ONBOARDING_COMPLETE_KEY = 'examsecure_onboarding_complete';

const Index = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  useEffect(() => {
    // Check if onboarding was already completed
    const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    
    // Auto-hide splash after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (onboardingComplete === 'true') {
        setShowMain(true);
      } else {
        setShowOnboarding(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    setShowOnboarding(false);
    setShowMain(true);
  };

  const handleLogoClick = useCallback(() => {
    if (isHoldingRef.current) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (newCount >= 5) {
      toast.success('Teacher portal access!', { description: 'Login with TCH2024001 / teacher123' });
      navigate('/login', { state: { prefillRole: 'teacher' } });
      setClickCount(0);
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  }, [clickCount, navigate]);

  const handleLogoMouseDown = useCallback(() => {
    isHoldingRef.current = false;
    
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      toast.success('Admin portal access!', { description: 'Login with ADM2024001 / admin123' });
      navigate('/login', { state: { prefillRole: 'admin' } });
      setClickCount(0);
    }, 5000);
  }, [navigate]);

  const handleLogoMouseUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  }, []);

  return (
    <>
      <SplashScreen isVisible={showSplash} onComplete={() => setShowSplash(false)} />
      
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {showMain && (
          <motion.div 
            key="main"
            className="min-h-screen relative overflow-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background gradient orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <motion.div
                className="absolute w-96 h-96 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, hsl(152 70% 45% / 0.4), transparent 70%)',
                  top: '-10%',
                  left: '-10%',
                }}
                animate={{
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              <motion.div
                className="absolute w-80 h-80 rounded-full opacity-15"
                style={{
                  background: 'radial-gradient(circle, hsl(142 76% 36% / 0.3), transparent 70%)',
                  bottom: '-5%',
                  right: '-5%',
                }}
                animate={{
                  x: [0, -30, 0],
                  y: [0, -50, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Main Content - Centered */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12 safe-area-inset">
              {/* Logo with secret navigation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl cursor-pointer select-none mb-6"
                style={{ boxShadow: '0 20px 60px -15px hsl(152 70% 45% / 0.5)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogoClick}
                onMouseDown={handleLogoMouseDown}
                onMouseUp={handleLogoMouseUp}
                onMouseLeave={handleLogoMouseUp}
                onTouchStart={handleLogoMouseDown}
                onTouchEnd={handleLogoMouseUp}
              >
                <GraduationCap className="w-12 h-12 md:w-14 md:h-14 text-primary-foreground" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 text-center"
              >
                ExamSecure
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base text-muted-foreground mb-10 text-center"
              >
                Grade 12 Examination Portal
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-xs"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="btn-gradient w-full text-lg py-6 rounded-2xl font-semibold"
                >
                  Sign In
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Demo credentials hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/30 max-w-xs w-full"
              >
                <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials</p>
                <p className="text-xs text-foreground text-center font-mono">STU2024001 / password123</p>
              </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 text-center safe-area-bottom">
              <p className="text-xs text-muted-foreground">
                Secured with Anti-Cheating Technology
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
