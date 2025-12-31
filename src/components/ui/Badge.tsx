// Badge Component - Status badges and labels
'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'safe' | 'warning' | 'failure' | 'muted' | 'accent';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-discipline-border text-white',
      safe: 'bg-safe-bg text-safe border border-safe-muted',
      warning: 'bg-warning-bg text-warning border border-warning-muted',
      failure: 'bg-failure-bg text-failure border border-failure-muted',
      muted: 'bg-discipline-card text-discipline-muted border border-discipline-border',
      accent: 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30',
    };
    
    const sizes = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-xs px-2 py-1',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-md',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
