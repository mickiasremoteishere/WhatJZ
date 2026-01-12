import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Camera, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ScreenshotAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
  warningCount: number;
  maxWarnings: number;
}

export const ScreenshotAlert = ({ isVisible, onDismiss, warningCount, maxWarnings }: ScreenshotAlertProps) => {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Flash effect when screenshot detected
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 200);
      
      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {/* Initial white flash */}
      {showFlash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] bg-white pointer-events-none"
        />
      )}

      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Red overlay with border effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.98)' }}
          />

          {/* Pulsing red border */}
          <motion.div
            className="absolute inset-0 border-[16px] md:border-[24px]"
            animate={{
              borderColor: ['rgba(255, 0, 0, 1)', 'rgba(139, 0, 0, 1)', 'rgba(255, 0, 0, 1)'],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />

          {/* Flashing overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundColor: ['rgba(220, 38, 38, 0.98)', 'rgba(127, 29, 29, 0.98)', 'rgba(220, 38, 38, 0.98)'],
            }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />

          {/* Corner warning icons */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <ShieldAlert className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
          </div>
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Camera className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            >
              <Camera className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
            >
              <ShieldAlert className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 max-w-lg w-full text-center"
          >
            {/* Alert icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -15, 15, -15, 0],
              }}
              transition={{ duration: 0.4, repeat: Infinity }}
              className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center"
            >
              <AlertTriangle className="w-14 h-14 md:w-16 md:h-16 text-white" />
            </motion.div>

            {/* Warning text */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-display font-black text-white mb-4 tracking-tight"
            >
              🚨 SCREENSHOT DETECTED! 🚨
            </motion.h1>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xl md:text-2xl font-bold text-white/90 mb-2"
            >
              VIOLATION RECORDED
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/90 mb-6"
            >
              Taking screenshots during the exam is <strong>STRICTLY PROHIBITED</strong> and has been logged. Your instructor has been notified.
            </motion.p>

            {/* Warning counter */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 border-4 border-white/40"
            >
              <p className="text-3xl md:text-4xl font-black text-white">
                ⚠️ WARNING {warningCount} of {maxWarnings} ⚠️
              </p>
              <p className="text-base md:text-lg text-white/90 mt-2 font-semibold">
                {warningCount >= maxWarnings 
                  ? '❌ YOU HAVE BEEN DISQUALIFIED!' 
                  : `${maxWarnings - warningCount} more warning(s) until DISQUALIFICATION`}
              </p>
            </motion.div>

            {/* Dismiss button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onDismiss}
                className="bg-white text-red-600 hover:bg-white/90 font-black px-10 py-7 text-lg md:text-xl rounded-2xl shadow-2xl"
                size="lg"
              >
                <X className="w-6 h-6 mr-2" />
                I UNDERSTAND - THIS WON'T HAPPEN AGAIN
              </Button>
            </motion.div>

            {/* Footer warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl bg-black/30"
            >
              <p className="text-sm md:text-base text-white/90 font-medium">
                📋 This incident has been logged with timestamp and will be reviewed.
              </p>
              <p className="text-xs md:text-sm text-white/70 mt-1">
                IP Address, Device Info, and Time recorded for academic integrity review.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
