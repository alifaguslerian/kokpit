import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSystemHealth } from '@/features/system/api/use-system-health';

export function HomeRoute() {
  const { data, isLoading, error } = useSystemHealth();

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <header>
          <span className="text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
            Room Overview
          </span>
          <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
            Home
          </h1>
          <p className="text-sm text-[var(--kokpit-text-secondary)] mt-1">
            Your personal digital room for work, music, ideas, and college.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>System & Connectivity</CardTitle>
                <CardDescription>Real-time backend state check</CardDescription>
              </div>
              {isLoading && <Badge variant="default">Checking</Badge>}
              {error && <Badge variant="danger">Offline</Badge>}
              {data && <Badge variant="success">Online</Badge>}
            </CardHeader>
            <CardContent>
              <div className="bg-[var(--kokpit-surface-2)] p-4 rounded-[12px] border border-[var(--kokpit-border-subtle)] text-sm flex items-center justify-between">
                <span className="text-[var(--kokpit-text-secondary)]">Local Worker API</span>
                <span className="text-[var(--kokpit-text-primary)] font-mono text-xs">
                  {data ? `status: ${data.status}` : error ? error.message : 'waiting...'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Workspace Foundation</CardTitle>
                <CardDescription>Milestone 2.2 Navigation active</CardDescription>
              </div>
              <Badge variant="accent">V1 Shell</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--kokpit-text-secondary)] leading-relaxed">
                AppShell and Sidebar navigation are active. The next package (2.3) implements the
                Home Hero, live clock, dynamic quotes, and feature previews.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
