import type { FormattedTime } from '@/lib/format-time';

interface ClockProps {
  time: FormattedTime;
}

export function Clock({ time }: ClockProps) {
  return (
    <div className="flex items-baseline gap-2 select-none">
      <time
        className="font-display text-[64px] sm:text-[80px] md:text-[88px] lg:text-[112px] font-normal tracking-tight text-[var(--kokpit-text-primary)] leading-none whitespace-nowrap"
        aria-label={`Current time: ${time.hours}:${time.minutes}:${time.seconds} ${time.period}`}
      >
        {time.hours}:{time.minutes}
        <span className="text-[var(--kokpit-text-muted)] text-[0.45em] ml-1.5">
          :{time.seconds}
        </span>
      </time>
      {time.period && (
        <span className="font-ui text-sm text-[var(--kokpit-accent)]">{time.period}</span>
      )}
    </div>
  );
}
