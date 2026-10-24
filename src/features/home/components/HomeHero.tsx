import { useRealtimeClock } from '../hooks/useRealtimeClock';
import { Clock } from './Clock';
import { DynamicQuote } from './DynamicQuote';

export function HomeHero() {
  const { time, dateString, context } = useRealtimeClock();

  return (
    <section
      aria-label="Your room"
      className="relative w-full rounded-[22px] overflow-hidden bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-subtle)]"
    >
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none hidden md:block"
        aria-hidden="true"
      >
        <img
          src="/images/room-hero.jpg"
          alt=""
          width={512}
          height={279}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--kokpit-surface-1)] to-transparent" />
      </div>
      <div className="relative p-5 sm:p-6 min-[90rem]:p-8 min-h-[280px] min-[90rem]:min-h-[320px]">
        <h1 className="font-ui text-sm text-[var(--kokpit-text-secondary)] mb-2">
          {context.greeting}
        </h1>
        <Clock time={time} />
        <div className="flex items-center gap-2 mt-3 font-ui text-xs text-[var(--kokpit-text-muted)] flex-wrap">
          <span className="text-[var(--kokpit-text-secondary)]">{dateString}</span>
          <span aria-hidden="true">·</span>
          <span>{context.roomStatus}</span>
        </div>
        <DynamicQuote />
      </div>
    </section>
  );
}
