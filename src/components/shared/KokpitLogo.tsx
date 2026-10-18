import { cn } from '@/lib/cn';

export interface KokpitLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export function KokpitLogo({ className, size = 36, showTagline = true }: KokpitLogoProps) {
  return (
    <div className={cn('flex items-center gap-3.5 select-none', className)}>
      <div
        style={{ width: size, height: size }}
        className="relative rounded-xl bg-gradient-to-br from-[#27201b] via-[#1a1614] to-[#12100f] border border-[var(--kokpit-accent)]/40 flex items-center justify-center shrink-0 shadow-md p-1.5 transition-all duration-[var(--motion-fast)] group-hover:border-[var(--kokpit-accent)]/70"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--kokpit-accent)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(215,160,109,0.3)]"
          aria-hidden="true"
        >
          {/* Kokpit geometric aperture / compass room mark */}
          <circle cx="12" cy="12" r="9" stroke="var(--kokpit-accent)" strokeOpacity="0.4" />
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <circle cx="12" cy="12" r="2.5" fill="var(--kokpit-accent)" />
        </svg>
      </div>

      <div className="min-w-0">
        <span className="font-display text-2xl font-normal tracking-wide text-[var(--kokpit-text-primary)] leading-none block">
          Kokpit
        </span>
        {showTagline && (
          <span className="text-[10px] text-[var(--kokpit-text-muted)] mt-1 leading-snug font-ui tracking-widest uppercase block opacity-80">
            Personal Digital Room
          </span>
        )}
      </div>
    </div>
  );
}
