import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm text-foreground">{label}</label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-3 py-2 rounded-md bg-background border border-border-muted',
            'focus:outline-none focus:ring-1 focus:ring-border',
            'text-foreground placeholder:text-foreground-muted',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';