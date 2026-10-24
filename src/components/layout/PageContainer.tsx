import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-[1360px] mx-auto px-4 py-5 md:px-6 md:py-[22px] min-[90rem]:px-10 min-[90rem]:py-8 flex flex-col gap-5 min-[90rem]:gap-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
