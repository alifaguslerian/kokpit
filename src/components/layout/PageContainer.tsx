import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[1400px] mx-auto px-6 py-6 md:px-8 md:py-8 lg:px-10 lg:py-8 flex flex-col gap-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
