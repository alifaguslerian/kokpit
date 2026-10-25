import type { FormattedTime } from '@/lib/format-time';

interface ClockProps {
  time: FormattedTime;
}

export function Clock({ time }: ClockProps) {
  return (
    <div className="home-clock select-none">
      <time
        className="home-clock-time"
        aria-label={`Current time: ${time.hours}:${time.minutes}${time.period ? ` ${time.period}` : ''}`}
      >
        {time.hours}:{time.minutes}
      </time>
      {time.period && (
        <span className="font-ui text-sm text-[var(--kokpit-accent)]">{time.period}</span>
      )}
    </div>
  );
}
