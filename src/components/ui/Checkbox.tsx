// Checkbox Component - Task completion checkbox with animation
'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onChange, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'flex items-start gap-3 cursor-pointer group',
          className
        )}
      >
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              checked
                ? 'bg-safe border-safe'
                : 'bg-transparent border-discipline-border group-hover:border-discipline-muted'
            )}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  checked ? 'text-discipline-muted line-through' : 'text-white'
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-discipline-muted mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
