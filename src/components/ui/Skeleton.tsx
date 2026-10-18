import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({
  className,
  width,
  height,
  circle = false,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-[var(--kokpit-surface-2)] animate-pulse',
        circle ? 'rounded-full' : 'rounded-[var(--radius-sm)]',
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
