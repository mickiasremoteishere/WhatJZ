import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface SecretNavLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

export const SecretNavLogo = ({ size = 'md', showText = true, subtitle }: SecretNavLogoProps) => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-12 h-12',
  };

  const handleClick = useCallback(() => {
    if (isHoldingRef.current) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Check if 5 clicks reached
    if (newCount >= 5) {
      toast.success('Teacher portal access granted!');
      navigate('/login', { state: { prefillRole: 'teacher' } });
      setClickCount(0);
      return;
    }

    // Reset click count after 2 seconds of inactivity
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  }, [clickCount, navigate]);

  const handleMouseDown = useCallback(() => {
    isHoldingRef.current = false;
    
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      toast.success('Admin portal access granted!');
      navigate('/login', { state: { prefillRole: 'admin' } });
      setClickCount(0);
    }, 5000);
  }, [navigate]);

  const handleMouseUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    handleMouseDown();
  }, [handleMouseDown]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center cursor-pointer select-none`}
        style={{ boxShadow: size === 'lg' ? '0 20px 60px -15px hsl(152 70% 45% / 0.5)' : undefined }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <GraduationCap className={`${iconSizes[size]} text-primary-foreground`} />
      </motion.div>
      {showText && (
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground">ExamSecure</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};
