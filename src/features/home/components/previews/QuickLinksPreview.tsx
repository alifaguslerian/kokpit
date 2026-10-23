import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Link2 } from 'lucide-react';
import { useQuickLinks } from '@/features/library/api/use-quick-links';
import { QuickLinkIcon } from '@/features/library/components/QuickLinkIcon';

export function QuickLinksPreview() {
  const { data: links = [], isLoading, isError, refetch } = useQuickLinks();
  const displayLinks = [...links]
    .sort(
      (first, second) =>
        Number(second.isFavorite) - Number(first.isFavorite) || first.position - second.position,
    )
    .slice(0, 5);

  return (
    <section
      aria-labelledby="home-links-title"
      className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-subtle)]"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" aria-hidden="true" />
          <h2 id="home-links-title" className="font-ui font-semibold text-sm">
            Quick Links
          </h2>
        </div>
        <Link
          to="/library"
          className="inline-flex items-center gap-1 text-xs text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)]"
        >
          Library <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      {isLoading ? (
        <p className="mt-4 text-xs text-[var(--kokpit-text-muted)]" role="status">
          Loading your links…
        </p>
      ) : null}
      {isError ? (
        <div className="mt-4 text-xs text-[var(--kokpit-text-secondary)]">
          <p role="alert">Could not load your links.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 text-[var(--kokpit-accent)]"
          >
            Try again
          </button>
        </div>
      ) : !isLoading && displayLinks.length === 0 ? (
        <p className="mt-4 text-xs text-[var(--kokpit-text-muted)]">No links saved yet.</p>
      ) : null}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {displayLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.name} (opens in a new tab)`}
            title={link.name}
            className="min-w-0 rounded-xl bg-[var(--kokpit-surface-2)] flex flex-col items-center justify-center gap-2 p-2 border border-[var(--kokpit-border-default)] hover:border-[var(--kokpit-accent-muted)] transition-colors"
          >
            <QuickLinkIcon
              iconType={link.iconType}
              iconValue={link.iconValue}
              name={link.name}
              size="md"
            />
            <span className="text-[11px] text-[var(--kokpit-text-secondary)] w-full truncate text-center">
              {link.name}
            </span>
          </a>
        ))}
        <Link
          to="/library"
          aria-label="Add a link in Library"
          title="Add a link in Library"
          className="min-h-16 rounded-xl bg-[var(--kokpit-surface-2)] flex items-center justify-center border border-dashed border-[var(--kokpit-border-strong)] hover:border-[var(--kokpit-accent)] transition-colors"
        >
          <Plus className="w-4 h-4 text-[var(--kokpit-text-muted)]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
