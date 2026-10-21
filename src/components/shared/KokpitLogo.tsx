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
        className="relative rounded-[12px] bg-gradient-to-br from-[#241e1a] via-[#161413] to-[#0f0e0d] border border-[var(--kokpit-accent)]/40 flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-1.5 transition-all duration-[var(--motion-fast)] group-hover:border-[var(--kokpit-accent)]/80 group-hover:shadow-[0_0_20px_rgba(211,155,122,0.25)]"
      >
        <div className="absolute inset-0 rounded-[12px] bg-[var(--kokpit-accent)]/10 blur-[2px] opacity-60 group-hover:opacity-100 transition-opacity" />
        <img
          src="/kokpit-icon.png"
          alt="Kokpit"
          className="w-full h-full object-contain relative z-10 transform group-hover:scale-105 transition-transform duration-[var(--motion-fast)] drop-shadow-[0_2px_8px_rgba(211,155,122,0.3)]"
          loading="eager"
        />
      </div>

      <div className="min-w-0">
        <span className="font-display text-2xl font-normal tracking-wide text-[var(--kokpit-text-primary)] leading-none block">
          Kokpit
        </span>
        {showTagline && (
          <span className="text-[9px] text-[var(--kokpit-text-muted)] mt-1 leading-snug font-ui tracking-wider uppercase block opacity-80 font-medium">
            A CALMER MIND FOR A FULLER LIFE.
          </span>
        )}
      </div>
    </div>
  );
}
