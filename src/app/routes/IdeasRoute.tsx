import { Lightbulb } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function IdeasRoute() {
  return (
    <PageContainer>
      <header>
        <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
          Thought Capture
        </span>
        <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
          Ideas
        </h1>
        <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
          Fast thought capture, tags, search, and quiet reflection.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <EmptyState
            icon={<Lightbulb className="w-5 h-5 text-[var(--kokpit-accent)]" />}
            title="Ideas Capture"
            description="Frictionless text composer, tags, search, and pinning will be implemented in Milestone 3."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
