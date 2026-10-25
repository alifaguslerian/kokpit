import { Link } from 'react-router-dom';
import { ArrowUpRight, Newspaper } from 'lucide-react';

export function NewsPreview() {
  return (
    <section aria-labelledby="home-news-title" className="room-panel home-news">
      <div className="home-panel-header">
        <div className="home-panel-title">
          <Newspaper className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id="home-news-title" className="font-ui font-medium">
            News
          </h2>
        </div>
        <Link to="/news" className="home-panel-link">
          See News <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex min-h-28 items-center gap-4 py-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-kokpit-border-default bg-kokpit-accent-bg"
          aria-hidden="true"
        >
          <Newspaper className="h-9 w-9 text-kokpit-text-muted" strokeWidth={1} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-kokpit-text-secondary">Your news feed is not available yet.</p>
          <p className="mt-1 text-xs text-kokpit-text-muted">There are no articles to show.</p>
        </div>
      </div>
    </section>
  );
}
