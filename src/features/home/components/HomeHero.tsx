import { useRealtimeClock } from '../hooks/useRealtimeClock';

export function HomeHero() {
  const { time, dateString } = useRealtimeClock();

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden bg-[#161413]/75 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_36px_rgba(0,0,0,0.5)] transition-all select-none">
      {/* Background ambient lighting overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Official Stitch warm atmospheric room at night with glowing table lamp */}
        <div
          className="w-full h-full bg-cover bg-right md:bg-[position:75%_center] opacity-65 scale-105 filter brightness-105 contrast-110 saturate-110"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4VEdmichqbIcorgA2kd_m62fGApK0oEK_ACA9PXAF5pVgnRm10SqKXcwECQGgaQEEAqE51KVZY93iu00SFX2pu1SY5GQsRKDpT9bBl9cS5z-g0XTKuQWgEdAz3kNKCec-BZBEAVk16KQnf3LlMxitvHoy_K89CLZ7uOgV3JvMDRtTXW66HMBQ63fffSHrf3VcIHHeNLJ4Bh0vi9G4bWbPredZMN3Xc_afne4StGGb')`,
          }}
        />
        {/* Soft horizontal gradient fading to dark on the left behind the clock */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #11100f 0%, #11100f 35%, rgba(17,16,15,0.7) 55%, transparent 80%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,15,0.2) 0%, transparent 60%, rgba(17,16,15,0.7) 100%)',
          }}
        />
        {/* Radial Warm Glow Overlay on right side matching Stitch */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-72 h-72 bg-[var(--kokpit-accent)]/30 rounded-full blur-3xl pointer-events-none" />
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
          <div className="mt-4 border-l-2 border-[var(--kokpit-accent)]/40 pl-3.5 flex flex-col gap-0.5 max-w-md">
            <p className="font-display italic text-sm sm:text-base text-[var(--kokpit-text-primary)]/90 leading-snug font-light">
              “A calmer mind makes a brighter tomorrow.”
            </p>
            <span className="font-ui text-[9px] text-[var(--kokpit-text-soft)] uppercase tracking-widest mt-0.5">
              — UNKNOWN
            </span>
          </div>
        </div>

        {/* Right Column: Floating Plaque "Good Ideas Brighter Days" matching Stitch */}
        <div className="hidden md:flex self-center relative z-20">
          <div className="relative overflow-hidden rounded-[18px] bg-black/45 backdrop-blur-xl border border-[var(--kokpit-accent)]/30 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex flex-col items-end justify-center min-w-[150px] sm:min-w-[170px] rotate-1 hover:rotate-0 transition-transform">
            <div className="flex flex-col text-right font-display text-xl sm:text-2xl font-light text-[#f3ebdd] leading-[1.15] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="text-[var(--kokpit-accent-hover)] font-medium">Good</span>
              <span className="text-[var(--kokpit-accent)]">Ideas</span>
              <span className="text-[#f3ebdd]/90">Brighter</span>
              <span className="text-[var(--kokpit-accent-hover)]">Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
