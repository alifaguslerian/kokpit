import { useSystemHealth } from '@/features/system/api/use-system-health';

export function App() {
  const { data, isLoading, error } = useSystemHealth();

  return (
    <div className="min-h-screen bg-[var(--kokpit-bg-app)] text-[var(--kokpit-text-primary)] p-8 flex flex-col items-center justify-center font-ui">
      <main className="w-full max-w-xl bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-card)]">
        <header className="mb-6">
          <span className="text-[12px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
            Personal Digital Room
          </span>
          <h1 className="font-display text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal">
            Kokpit
          </h1>
          <p className="text-sm text-[var(--kokpit-text-secondary)] mt-2">
            Dark Cozy Editorial Workspace. Visual foundation active.
          </p>
        </header>

        <section className="bg-[var(--kokpit-surface-2)] border border-[var(--kokpit-border-subtle)] rounded-[var(--radius-md)] p-4 text-sm flex items-center justify-between">
          <span className="text-[var(--kokpit-text-secondary)]">Backend connection</span>
          <span className="inline-flex items-center gap-2">
            {isLoading && (
              <span className="text-[var(--kokpit-text-muted)]">Checking system...</span>
            )}
            {error && (
              <span className="text-[var(--kokpit-danger)]">Offline ({error.message})</span>
            )}
            {data && (
              <span className="text-[var(--kokpit-success)] font-medium">
                Online ({data.status})
              </span>
            )}
          </span>
        </section>

        <footer className="mt-6 pt-4 border-t border-[var(--kokpit-border-subtle)] flex items-center justify-between text-xs text-[var(--kokpit-text-muted)]">
          <span>Milestone 2.1: Visual Foundation</span>
          <span className="font-display italic text-[var(--kokpit-text-secondary)]">
            Cormorant Garamond & Inter
          </span>
        </footer>
      </main>
    </div>
  );
}
