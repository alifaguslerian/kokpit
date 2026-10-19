import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, SkipBack, SkipForward, Play, Pause, Bookmark } from 'lucide-react';

export function MusicPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const togglePlay = () => setIsPlaying((prev) => !prev);

  // Decorative vintage tape equalizer ticks matching Stitch screenshot
  const eqTicks = [2, 4, 3, 7, 4, 6, 9, 5, 11, 6, 3, 8, 5, 4, 7, 5, 10, 6, 4, 5, 2, 4, 6, 3];

  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-[4px] border border-[var(--kokpit-accent)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[var(--kokpit-accent)] rounded-full" />
            </span>
            <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)]">
              Now Playing
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[var(--kokpit-surface-3)] text-[10px] text-[var(--kokpit-text-muted)] border border-[var(--kokpit-border-subtle)] font-mono">
              <span className="text-[var(--kokpit-accent)] font-semibold">HQ</span> Lossless
            </span>
          </div>

          <Link
            to="/music"
            className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Open Music</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Track info row */}
        <div className="flex items-center gap-3.5 mt-3.5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md shrink-0 bg-[var(--kokpit-surface-2)]">
            <img
              src="https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=200&q=80"
              alt="Midnight drive artwork"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kokpit-accent)]" />
              <span className="font-ui text-[9px] font-semibold uppercase tracking-wider text-[var(--kokpit-accent)]">
                ACOUSTIC TAPE
              </span>
            </div>
            <h4 className="font-ui text-sm font-semibold text-[var(--kokpit-text-primary)] truncate mt-0.5">
              midnight drive
            </h4>
            <p className="font-ui text-xs text-[var(--kokpit-text-muted)] truncate">
              Wave to Earth
            </p>
          </div>

          <button
            type="button"
            aria-label="Bookmark track"
            className="text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Vintage Acoustic Tape / Warmth Graphic Bar matching Stitch */}
        <div className="mt-3.5 bg-[var(--kokpit-surface-2)]/90 rounded-xl p-2.5 border border-[var(--kokpit-border-subtle)] flex flex-col gap-1.5">
          {/* Tick bars */}
          <div className="flex items-end justify-between h-5 px-1">
            {eqTicks.map((val, idx) => (
              <div
                key={idx}
                className="w-1 bg-[var(--kokpit-accent)]/40 rounded-full transition-all"
                style={{
                  height: `${val * 1.5}px`,
                  backgroundColor:
                    idx % 3 === 0 ? 'var(--kokpit-accent)' : 'rgba(215, 160, 109, 0.4)',
                }}
              />
            ))}
          </div>

          {/* Analog calibration labels */}
          <div className="flex items-center justify-between text-[9px] font-mono text-[var(--kokpit-text-soft)] pt-1 border-t border-[var(--kokpit-border-subtle)]">
            <span>WARMTH +2.4dB</span>
            <span>ROOM: NIGHT RESIN</span>
            <span>VINYL STYLUS</span>
          </div>
        </div>
      </div>

      {/* Progress & Big Play Button matching Stitch */}
      <div className="mt-3.5 flex flex-col gap-2.5">
        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] text-[var(--kokpit-text-soft)]">1:37</span>
          <div className="flex-1 h-1 bg-[var(--kokpit-surface-3)] rounded-full overflow-hidden relative cursor-pointer">
            <div
              className="h-full bg-[var(--kokpit-accent)] rounded-full"
              style={{ width: '42%' }}
            />
          </div>
          <span className="font-mono text-[10px] text-[var(--kokpit-text-soft)]">3:52</span>
        </div>

        {/* Transport controls with large circular play button */}
        <div className="flex items-center justify-center gap-5 pt-0.5">
          <button
            type="button"
            aria-label="Previous track"
            className="text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-[var(--kokpit-accent)] text-[#2d1600] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(215,160,109,0.35)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            aria-label="Next track"
            className="text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
