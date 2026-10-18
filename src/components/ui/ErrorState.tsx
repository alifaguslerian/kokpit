import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-[var(--radius-lg)] border border-[var(--kokpit-danger)]/20 bg-[var(--kokpit-danger-bg)]/30 font-ui',
        className,
      )}
    >
      <div className="w-8 h-8 rounded-full bg-[var(--kokpit-danger-bg)] flex items-center justify-center text-[var(--kokpit-danger)] mb-2.5">
        <svg
          aria-hidden="true"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h4 className="text-sm font-medium text-[var(--kokpit-text-primary)] mb-1">{title}</h4>

      <p className="text-xs text-[var(--kokpit-text-secondary)] max-w-sm mb-4 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
