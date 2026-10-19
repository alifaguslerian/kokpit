import { useRealtimeClock } from '../hooks/useRealtimeClock';

export function HomeHero() {
  const { time, dateString } = useRealtimeClock();

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] transition-all select-none">
      {/* Background ambient lighting overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="w-full h-full bg-cover bg-right md:bg-center opacity-35 scale-105 filter blur-[0.5px]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1600&q=80')`,
            filter: 'brightness(0.68) saturate(0.85) contrast(1.05)',
          }}
        />
        {/* Horizontal dark gradient to ensure text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(17,16,15,0.98) 0%, rgba(17,16,15,0.85) 50%, rgba(17,16,15,0.3) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,15,0.3) 0%, transparent 60%, rgba(17,16,15,0.8) 100%)',
          }}
        />
      </div>

      {/* Hero content region - compact vertical footprint */}
      <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 min-h-[230px]">
        {/* Left Column: Clock, Date, and Quote */}
        <div className="flex flex-col max-w-xl">
          {/* Clock: 11:22:43 PM */}
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[52px] sm:text-[68px] md:text-[76px] lg:text-[84px] font-light tracking-tight text-[var(--kokpit-text-primary)] leading-none drop-shadow-sm">
              {time.hours}:{time.minutes}:{time.seconds}
            </span>
            <span className="font-display text-xl sm:text-2xl md:text-3xl font-normal text-[var(--kokpit-accent)] tracking-normal uppercase ml-1 opacity-90">
              {time.period || 'PM'}
            </span>
          </div>

          {/* Date & Context line */}
          <div className="flex items-center gap-2 mt-2 font-ui text-xs text-[var(--kokpit-text-muted)] flex-wrap">
            <span className="font-medium text-[var(--kokpit-text-secondary)]">{dateString}</span>
            <span className="text-[var(--kokpit-text-soft)]">•</span>
            <span className="text-[var(--kokpit-text-muted)] italic font-display text-sm">
              Same room. A little further.
            </span>
          </div>

          {/* Quote matching Stitch */}
          <div className="mt-4 pt-3 border-t border-[var(--kokpit-border-subtle)] flex flex-col gap-0.5 max-w-md">
            <p className="font-display italic text-sm sm:text-base text-[var(--kokpit-text-primary)]/90 leading-snug font-light">
              “A calmer mind makes a brighter tomorrow.”
            </p>
            <span className="font-ui text-[9px] text-[var(--kokpit-text-soft)] uppercase tracking-widest mt-0.5">
              — UNKNOWN
            </span>
          </div>
        </div>

        {/* Right Column: Floating Plaque "Good Ideas Brighter Days" matching Stitch */}
        <div className="hidden md:flex self-center">
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#2a221d]/90 via-[#1e1814]/95 to-[#13100e]/95 border border-[var(--kokpit-accent)]/20 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col items-end justify-center min-w-[150px] sm:min-w-[170px]">
            <div className="flex flex-col text-right font-display text-xl sm:text-2xl font-light text-[var(--kokpit-accent-hover)] leading-[1.15] tracking-tight">
              <span>Good</span>
              <span>Ideas</span>
              <span>Brighter</span>
              <span>Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
