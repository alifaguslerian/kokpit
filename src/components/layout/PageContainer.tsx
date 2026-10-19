import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[1360px] mx-auto px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 flex flex-col gap-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
