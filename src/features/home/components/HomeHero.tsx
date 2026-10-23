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
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4VEdmichqbIcorgA2kd_m62fGApK0oEK_ACA9PXAF5pVgnRm10SqKXcwECQGgaQEEAqE51KVZY93iu00SFX2pu1SY5GQsRKDpT9bBl9cS5z-g0XTKuQWgEdAz3kNKCec-BZBEAVk16KQnf3LlMxitvHoy_K89CLZ7uOgV3JvMDRtTXW66HMBQ63fffSHrf3VcIHHeNLJ4Bh0vi9G4bWbPredZMN3Xc_afne4StGGb')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--kokpit-surface-1)] to-transparent" />
      </div>
      <div className="relative p-5 sm:p-6 lg:p-8 min-h-[280px]">
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
