import { Newspaper } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function NewsRoute() {
  return (
    <PageContainer>
      <header>
        <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
          Editorial Briefings
        </span>
        <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
          News
        </h1>
        <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
          Curated tech dispatches, software developments, and world discovery.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <EmptyState
            icon={<Newspaper className="w-5 h-5 text-[var(--kokpit-accent)]" />}
            title="News & Dispatches"
            description="Multi-source ingestion, AI relevance ranking, and clean editorial feeds will be implemented in Milestone 6."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
