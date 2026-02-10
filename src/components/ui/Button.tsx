import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-hd-yellow text-hd-black hover:bg-hd-yellow/90 border-hd-yellow',
  secondary:
    'bg-transparent text-hd-yellow hover:bg-hd-yellow/10 border-hd-yellow/50 hover:border-hd-yellow',
  danger:
    'bg-hd-red/20 text-hd-red hover:bg-hd-red/30 border-hd-red/50',
  ghost:
    'bg-transparent text-hd-white hover:bg-hd-white/5 border-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, onClick, disabled }, ref) => {
    const { menuClick } = useAudio();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      menuClick();
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-heading font-semibold uppercase tracking-wider
          border rounded transition-colors duration-150
          disabled:opacity-40 disabled:pointer-events-none
          cursor-pointer
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        onClick={handleClick}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
