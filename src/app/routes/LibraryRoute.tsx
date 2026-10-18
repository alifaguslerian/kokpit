import { Bookmark } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function LibraryRoute() {
  return (
    <PageContainer>
      <header>
        <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
          Quick Launch
        </span>
        <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
          Library
        </h1>
        <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
          Personal shortcuts, daily links, and quick portals.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <EmptyState
            icon={<Bookmark className="w-5 h-5 text-[var(--kokpit-accent)]" />}
            title="Shortcuts Library"
            description="Portal grid, custom icons, groupings, and quick link management will be implemented in Milestone 3."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
