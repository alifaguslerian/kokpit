import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

export function Chip({
  className,
  isSelected = false,
  leftIcon,
  children,
  type = 'button',
  disabled = false,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center h-[30px] px-3 gap-1.5 rounded-[var(--radius-pill)] text-xs font-ui transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)] cursor-pointer select-none border',
        'focus-visible:outline-2 focus-visible:outline-[var(--kokpit-accent)] focus-visible:outline-offset-1',
        isSelected
          ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)] border-[var(--kokpit-accent)]/30 font-medium'
          : 'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-surface-hover)]',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="text-[14px] shrink-0">{leftIcon}</span>}
      <span>{children}</span>
    </button>
  );
}
