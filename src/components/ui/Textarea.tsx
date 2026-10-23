import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, id, disabled, rows = 3, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="w-full flex flex-col gap-1.5 font-ui">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-[var(--kokpit-text-secondary)] select-none"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full bg-[var(--kokpit-surface-2)] text-sm text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] rounded-[12px] p-3.5 border outline-none resize-y transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)]',
          error
            ? 'border-[var(--kokpit-danger)] focus:ring-2 focus:ring-[var(--kokpit-danger-bg)]'
            : 'border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent-muted)] focus:ring-3 focus:ring-[var(--kokpit-accent-bg)]',
          disabled && 'opacity-50 cursor-not-allowed bg-[var(--kokpit-surface-1)]',
          className,
        )}
        {...props}
      />

      {error && (
        <p className="text-xs text-[var(--kokpit-danger)] mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
