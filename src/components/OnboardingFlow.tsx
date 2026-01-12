import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { GraduationCap, Shield, Lock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: GraduationCap,
    title: 'Welcome to ExamSecure',
    description: 'Your trusted Grade 12 Examination Portal for secure and fair assessments.',
    color: 'from-primary to-emerald-600',
  },
  {
    icon: Shield,
    title: 'Anti-Cheating Protection',
    description: 'Advanced monitoring detects tab switching, screenshots, and copy-paste attempts.',
    color: 'from-emerald-600 to-teal-600',
  },
  {
    icon: Lock,
    title: 'Secure Image Questions',
    description: 'Questions are displayed as protected images to prevent AI assistance tools.',
    color: 'from-teal-600 to-cyan-600',
  },
  {
    icon: CheckCircle,
    title: 'Ready to Begin',
    description: 'Sign in with your student ID to access your scheduled examinations.',
    color: 'from-cyan-600 to-primary',
  },
];

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold && currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else if (info.offset.x > threshold && currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Background gradient */}
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
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
        onClick={onComplete}
      >
        Skip
      </motion.button>

      {/* Slide content */}
      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
          >
            {/* Icon */}
            <motion.div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center shadow-2xl mb-8`}
              style={{ boxShadow: '0 20px 60px -15px hsl(152 70% 45% / 0.5)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="w-14 h-14 text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              {currentSlideData.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
              {currentSlideData.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="w-12 h-12 rounded-full p-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleNext}
            className="flex-1 btn-gradient py-6 rounded-2xl font-semibold text-lg"
          >
            {currentSlide === slides.length - 1 ? (
              <>
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-xs text-muted-foreground"
      >
        Swipe to navigate
      </motion.p>
    </motion.div>
  );
};
