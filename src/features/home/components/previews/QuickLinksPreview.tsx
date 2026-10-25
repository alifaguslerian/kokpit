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
    <section aria-labelledby="home-links-title" className="room-panel home-links">
      <div className="home-panel-header">
        <div className="home-panel-title">
          <Link2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id="home-links-title" className="font-ui font-medium">
            Quick Links
          </h2>
        </div>
        <Link to="/library" className="home-panel-link">
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
      <div className="mt-3 flex flex-wrap items-stretch gap-2">
        {displayLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.name} (opens in a new tab)`}
            title={link.name}
            className="home-link-tile flex min-h-11 min-w-0 max-w-full flex-[0_1_8rem] items-center justify-center gap-2 rounded-lg border border-kokpit-border-default px-3 py-2 text-kokpit-text-secondary hover:border-kokpit-accent-muted"
          >
            <QuickLinkIcon
              iconType={link.iconType}
              iconValue={link.iconValue}
              name={link.name}
              size="md"
              className="shrink-0"
            />
            <span className="min-w-0 break-words text-xs [overflow-wrap:anywhere]">
              {link.name}
            </span>
          </a>
        ))}
        <Link
          to="/library"
          aria-label="Add a link in Library"
          title="Add a link in Library"
          className="home-link-tile flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-kokpit-border-default hover:border-kokpit-accent"
        >
          <Plus className="w-4 h-4 text-[var(--kokpit-text-muted)]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
