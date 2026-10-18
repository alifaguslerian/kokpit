import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive = false, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] rounded-[var(--radius-lg)] p-5 text-[var(--kokpit-text-primary)] shadow-[var(--shadow-card)] transition-all duration-[var(--motion-default)] ease-[var(--ease-default)]',
        interactive &&
          'hover:-translate-y-[1px] hover:border-[var(--kokpit-border-strong)] hover:shadow-[var(--shadow-float)] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-ui font-semibold text-base text-[var(--kokpit-text-primary)] leading-tight',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[var(--kokpit-text-secondary)] mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 pt-3 border-t border-[var(--kokpit-border-subtle)] flex items-center justify-between text-xs text-[var(--kokpit-text-muted)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
