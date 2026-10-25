import { Link } from 'react-router-dom';
import { ArrowUpRight, Music, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export function MusicPreview() {
  return (
    <section aria-labelledby="home-music-title" className="room-panel home-music">
      <div className="home-panel-header">
        <div className="home-panel-title">
          <Music className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id="home-music-title" className="font-ui font-medium">
            Now Playing
          </h2>
        </div>
        <Link to="/music" className="home-panel-link">
          Open Music <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="home-music-body">
        <div className="home-music-cover" aria-hidden="true">
          <Music className="h-12 w-12 text-kokpit-text-muted" strokeWidth={1} />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <p className="font-ui text-lg font-medium text-kokpit-text-primary">Nothing playing.</p>
          <p id="home-playback-unavailable" className="mt-1 text-xs text-kokpit-text-secondary">
            Playback is not available yet.
          </p>
          <fieldset disabled aria-describedby="home-playback-unavailable" className="mt-6 min-w-0">
            <legend className="sr-only">Music playback</legend>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={0}
              aria-label="Seek playback"
              className="home-music-range w-full"
            />
            <div
              className="mt-1 flex justify-between text-[11px] text-kokpit-text-muted"
              aria-hidden="true"
            >
              <span>0:00</span>
              <span>0:00</span>
            </div>
            <div className="home-music-transport mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous track"
                  className="flex h-9 w-9 items-center justify-center text-kokpit-text-secondary"
                >
                  <SkipBack className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Play"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-kokpit-border-strong bg-kokpit-accent-bg text-kokpit-accent"
                >
                  <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next track"
                  className="flex h-9 w-9 items-center justify-center text-kokpit-text-secondary"
                >
                  <SkipForward className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Volume2
                  className="h-4 w-4 shrink-0 text-kokpit-text-secondary"
                  aria-hidden="true"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={50}
                  aria-label="Volume"
                  className="home-music-range w-16"
                />
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
