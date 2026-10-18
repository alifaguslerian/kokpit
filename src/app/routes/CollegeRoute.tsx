import { GraduationCap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

export function CollegeRoute() {
  return (
    <PageContainer>
      <header>
        <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
          Academic Workspace
        </span>
        <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
          College
        </h1>
        <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
          Semester, course syllabi, weekly guides, and study materials.
        </p>
      </header>

      <Card>
        <CardContent className="pt-2">
          <EmptyState
            icon={<GraduationCap className="w-5 h-5 text-[var(--kokpit-accent)]" />}
            title="College Module"
            description="Course hierarchy (Semester → Course → Week → Material) and private storage will be implemented in Milestone 4."
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
