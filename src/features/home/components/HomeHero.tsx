import { Clock } from './Clock';
import { DynamicQuote } from './DynamicQuote';
import { useRealtimeClock } from '../hooks/useRealtimeClock';

export function HomeHero() {
  const { time, dateString, context, is24Hour, toggle24Hour } = useRealtimeClock();

  return (
    <div className="relative w-full rounded-[22px] overflow-hidden bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] mb-6 transition-all">
      {/* Ambient background art with atmospheric lighting and soft scrims */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="w-full h-full bg-cover bg-right md:bg-center opacity-35 scale-105 filter blur-[0.5px]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1600&q=80')`,
            filter: 'brightness(0.68) saturate(0.85) contrast(1.05)',
          }}
        />
        {/* Horizontal readability gradient per DESIGN_SYSTEM.md */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(17,16,15,0.98) 0%, rgba(17,16,15,0.85) 45%, rgba(17,16,15,0.30) 100%)',
          }}
        />
        {/* Vertical subtle vignette gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,15,0.4) 0%, transparent 60%, rgba(17,16,15,0.8) 100%)',
          }}
        />
      </div>

      {/* Hero content region */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 min-h-[280px]">
        <div className="flex flex-col max-w-xl">
          {/* Real-time Clock */}
          <Clock time={time} is24Hour={is24Hour} onToggleFormat={toggle24Hour} />

          {/* Date & Contextual status */}
          <div className="flex items-center gap-2 mt-2 font-ui text-xs sm:text-sm text-[var(--kokpit-text-muted)] flex-wrap">
            <span className="font-medium text-[var(--kokpit-text-secondary)]">{dateString}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--kokpit-text-soft)]" />
            <span className="text-[var(--kokpit-text-muted)] italic font-display text-sm sm:text-base">
              Same room. A little further.
            </span>
          </div>

          {/* Dynamic Quote */}
          <DynamicQuote />
        </div>

        {/* Ambient room indicator (Desktop) */}
        <div className="hidden lg:flex flex-col items-end gap-2 text-right select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--kokpit-surface-2)]/80 backdrop-blur-md border border-[var(--kokpit-border-subtle)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--kokpit-accent)]" />
            <span className="font-ui text-xs text-[var(--kokpit-text-secondary)] tracking-wider uppercase font-semibold">
              {context.greeting}
            </span>
          </div>
          <p className="font-ui text-xs text-[var(--kokpit-text-soft)] max-w-[220px]">
            {context.roomStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
