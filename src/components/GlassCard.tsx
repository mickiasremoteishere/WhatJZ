import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  className?: string;
  delay?: number;
}

export const GlassCard = ({ 
  children, 
  variant = 'default', 
  className, 
  delay = 0,
  ...props 
}: GlassCardProps) => {
  const variants = {
    default: 'glass-card',
    elevated: 'glass-card shadow-2xl',
    subtle: 'bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
