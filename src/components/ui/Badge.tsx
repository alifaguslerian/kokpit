import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-secondary)] border border-[var(--kokpit-border-subtle)]',
  accent:
    'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)] border border-[var(--kokpit-accent)]/20',
  success:
    'bg-[var(--kokpit-success-bg)] text-[var(--kokpit-success)] border border-[var(--kokpit-success)]/20',
  warning:
    'bg-[var(--kokpit-warning-bg)] text-[var(--kokpit-warning)] border border-[var(--kokpit-warning)]/20',
  danger:
    'bg-[var(--kokpit-danger-bg)] text-[var(--kokpit-danger)] border border-[var(--kokpit-danger)]/20',
  info: 'bg-[var(--kokpit-info-bg)] text-[var(--kokpit-info)] border border-[var(--kokpit-info)]/20',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-medium font-ui tracking-wide select-none',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
