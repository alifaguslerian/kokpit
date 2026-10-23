import { Link } from 'react-router-dom';
import { ArrowUpRight, Newspaper } from 'lucide-react';

export function NewsPreview() {
  return (
    <section
      aria-labelledby="home-news-title"
      className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-subtle)]"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" aria-hidden="true" />
          <h2 id="home-news-title" className="font-ui font-semibold text-sm">
            News
          </h2>
        </div>
        <Link
          to="/news"
          className="inline-flex items-center gap-1 text-xs text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)]"
        >
          See News <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="py-4">
        <p className="text-sm text-[var(--kokpit-text-secondary)]">
          Your news feed is not available yet.
        </p>
        <p className="mt-1 text-xs text-[var(--kokpit-text-muted)]">
          There are no articles to show.
        </p>
      </div>
    </section>
  );
}
