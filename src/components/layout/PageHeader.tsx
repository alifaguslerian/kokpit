import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 w-full sm:flex-1">
        {eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-kokpit-accent break-words">
            {eyebrow}
          </p>
        )}
        <h1 className="font-ui text-[28px] min-[90rem]:text-[34px] font-medium leading-tight tracking-tight break-words">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-kokpit-text-secondary break-words">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
