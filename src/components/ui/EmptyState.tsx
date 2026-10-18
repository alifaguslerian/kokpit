import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-lg)] border border-dashed border-[var(--kokpit-border-default)] bg-[var(--kokpit-surface-1)]/50 font-ui',
        className,
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-[var(--kokpit-surface-2)] flex items-center justify-center text-[var(--kokpit-text-muted)] mb-3 border border-[var(--kokpit-border-subtle)]">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-medium text-[var(--kokpit-text-primary)] mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-[var(--kokpit-text-secondary)] max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
