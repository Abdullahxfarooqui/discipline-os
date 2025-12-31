// Card Component - Container for content sections
'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'safe' | 'warning' | 'failure';
  animate?: boolean;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', animate = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-discipline-card border border-discipline-border',
      elevated: 'bg-discipline-card border border-discipline-border shadow-lg shadow-black/20',
      outlined: 'bg-transparent border border-discipline-border',
      safe: 'bg-safe-bg border border-safe-muted',
      warning: 'bg-warning-bg border border-warning-muted',
      failure: 'bg-failure-bg border border-failure-muted',
    };
    
    const Component = animate ? motion.div : 'div';
    
    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-xl p-4',
          variants[variant],
          className
        )}
        variants={animate ? cardVariants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        {...(props as any)}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Header
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1 pb-3 border-b border-discipline-border mb-3', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-discipline-muted', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-3 border-t border-discipline-border mt-3', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
