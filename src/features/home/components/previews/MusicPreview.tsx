import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  ArrowRight,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export function MusicPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleFavorite = () => setIsFavorite((prev) => !prev);
  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-5 sm:p-6 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[var(--kokpit-accent)]" />
            <h3 className="font-ui font-semibold text-base text-[var(--kokpit-text-primary)]">
              Now Playing
            </h3>
          </div>
          <Link
            to="/music"
            className="inline-flex items-center gap-1 font-ui text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Open Music</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Track details row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-[var(--kokpit-surface-2)]">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80"
              alt="Midnight drive track artwork"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--kokpit-surface-1)]/60 to-transparent" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-ui text-sm font-semibold text-[var(--kokpit-text-primary)] truncate">
              midnight drive
            </h4>
            <p className="font-ui text-xs text-[var(--kokpit-text-secondary)] truncate mt-0.5">
              Wave to Earth
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-muted)] font-ui text-[11px] mt-2 border border-[var(--kokpit-border-subtle)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kokpit-accent)]" />
              <span>Quiet sanctuary mix</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-danger)] hover:bg-[var(--kokpit-surface-hover)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kokpit-accent)]"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                isFavorite
                  ? 'fill-[var(--kokpit-danger)] text-[var(--kokpit-danger)]'
                  : 'text-[var(--kokpit-text-soft)]',
              )}
            />
          </button>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="mt-5 flex flex-col gap-3">
        {/* Progress track */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-1.5 bg-[var(--kokpit-surface-3)] rounded-full overflow-hidden cursor-pointer relative">
            <div
              className="h-full bg-[var(--kokpit-accent)] rounded-full transition-all duration-300"
              style={{ width: '42%' }}
            />
          </div>
          <div className="flex justify-between items-center font-mono text-[11px] text-[var(--kokpit-text-soft)]">
            <span>1:37</span>
            <span>3:52</span>
          </div>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            type="button"
            aria-label="Shuffle"
            className="text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Previous track"
            className="text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(215,160,109,0.25)] cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next track"
            className="text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Repeat"
            className="text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] transition-colors p-1"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Accessible Volume Control (Required by PRD and Design System) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--kokpit-border-subtle)] text-[var(--kokpit-text-soft)]">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
            className="hover:text-[var(--kokpit-text-secondary)] transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[var(--kokpit-danger)]" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            aria-label="Volume slider"
            className="w-20 h-1 accent-[var(--kokpit-accent)] bg-[var(--kokpit-surface-3)] rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
