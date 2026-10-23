import { cn } from '@/lib/cn';

export interface KokpitLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export function KokpitLogo({ className, size = 38, showTagline = true }: KokpitLogoProps) {
  return (
    <div className={cn('flex items-center gap-3.5 select-none group', className)}>
      <div
        style={{ width: size, height: size }}
        className="rounded-[12px] bg-[var(--kokpit-surface-2)] border border-[var(--kokpit-border-default)] flex items-center justify-center shrink-0 p-1.5"
      >
        <img
          src="/kokpit-icon.png"
          alt=""
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      <div className="min-w-0">
        <span className="font-ui text-xl font-medium tracking-wide text-[var(--kokpit-text-primary)] leading-none block">
          Kokpit
        </span>
        {showTagline && (
          <span className="text-[10px] text-[var(--kokpit-text-muted)] mt-1 leading-snug font-ui tracking-wide block font-medium">
            A CALMER MIND FOR A FULLER LIFE.
          </span>
        )}
      </div>
    </div>
  );
}
