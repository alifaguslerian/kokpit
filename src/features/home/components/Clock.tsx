import type { FormattedTime } from '@/lib/format-time';

interface ClockProps {
  time: FormattedTime;
  is24Hour?: boolean;
  onToggleFormat?: () => void;
}

export function Clock({ time, is24Hour, onToggleFormat }: ClockProps) {
  return (
    <div className="flex items-baseline gap-2 md:gap-3 select-none">
      <span
        className="font-display text-[72px] sm:text-[88px] md:text-[104px] lg:text-[112px] font-normal tracking-tight text-[var(--kokpit-text-primary)] leading-none drop-shadow-sm"
        aria-live="polite"
        aria-label={`Current time: ${time.hours}:${time.minutes}:${time.seconds} ${time.period}`}
      >
        {time.hours}:{time.minutes}
        <span className="text-[var(--kokpit-text-soft)] text-[0.45em] ml-1.5 md:ml-2 font-light">
          :{time.seconds}
        </span>
      </span>

      {!is24Hour && time.period && (
        <button
          type="button"
          onClick={onToggleFormat}
          title="Click to toggle 12h/24h format"
          className="font-ui text-xs md:text-sm font-semibold tracking-wider uppercase text-[var(--kokpit-accent)] bg-[var(--kokpit-accent-bg)] px-2 py-0.5 rounded-full border border-[var(--kokpit-border-subtle)] hover:bg-[var(--kokpit-accent-bg-hover)] transition-colors self-center mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kokpit-accent)]"
        >
          {time.period}
        </button>
      )}
    </div>
  );
}
