import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const SplashScreen = ({ isVisible, onComplete }: SplashScreenProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onAnimationComplete={(definition) => {
            if (definition === 'exit') onComplete();
          }}
        >
          {/* Background gradient orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, hsl(152 70% 45% / 0.4), transparent 70%)',
              top: '-10%',
              left: '-10%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            className="absolute w-80 h-80 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, hsl(142 76% 36% / 0.3), transparent 70%)',
              bottom: '-5%',
              right: '-5%',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Logo Animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 1,
            }}
          >
            <motion.div
              className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 20px 60px -15px hsl(152 70% 45% / 0.5)' }}
              animate={{
                boxShadow: [
                  '0 20px 60px -15px hsl(152 70% 45% / 0.3)',
                  '0 25px 80px -15px hsl(152 70% 45% / 0.6)',
                  '0 20px 60px -15px hsl(152 70% 45% / 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <GraduationCap className="w-14 h-14 md:w-16 md:h-16 text-primary-foreground" />
            </motion.div>
          </motion.div>

          {/* App Name */}
          <motion.h1
            className="mt-6 text-2xl md:text-3xl font-display font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            ExamSecure
          </motion.h1>

          <motion.p
            className="mt-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Grade 12 Examination Portal
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            className="mt-8 flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
