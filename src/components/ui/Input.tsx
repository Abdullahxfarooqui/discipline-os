// Input Component - Form input with validation states
'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-white mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full h-10 px-3 rounded-lg bg-discipline-dark border transition-colors duration-200',
            'text-white placeholder:text-discipline-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            error
              ? 'border-failure focus:ring-failure'
              : 'border-discipline-border hover:border-discipline-muted',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-failure">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
