import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, leftIcon, rightIcon, id, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 font-ui">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--kokpit-text-secondary)] select-none"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative flex items-center h-11 w-full bg-[var(--kokpit-surface-2)] rounded-[12px] border transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)]',
          error
            ? 'border-[var(--kokpit-danger)] focus-within:ring-2 focus-within:ring-[var(--kokpit-danger-bg)]'
            : 'border-[var(--kokpit-border-default)] focus-within:border-[var(--kokpit-accent-muted)] focus-within:ring-3 focus-within:ring-[var(--kokpit-accent-bg)]',
          disabled && 'opacity-50 cursor-not-allowed bg-[var(--kokpit-surface-1)]',
          className,
        )}
      >
        {leftIcon && (
          <div className="pl-3.5 pr-1 flex items-center text-[var(--kokpit-text-muted)] shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full h-full bg-transparent text-sm text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] outline-none px-3.5',
            leftIcon ? 'pl-1' : undefined,
            rightIcon ? 'pr-1' : undefined,
            'disabled:cursor-not-allowed',
          )}
          {...props}
        />

        {rightIcon && (
          <div className="pr-3.5 pl-1 flex items-center text-[var(--kokpit-text-muted)] shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--kokpit-danger)] mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
