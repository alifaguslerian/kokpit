import { Disc3 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function MusicRoute() {
  return (
    <PageContainer>
      <header>
        <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
          Audio Library
        </span>
        <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
          Music
        </h1>
        <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
          Personal music library, persistent audio playback, and curated playlists.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <EmptyState
            icon={<Disc3 className="w-5 h-5 text-[var(--kokpit-accent)]" />}
            title="Music Player & Archival Hub"
            description="Persistent playback engine, playlists, and private track streaming will be implemented in Milestone 5."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
