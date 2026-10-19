import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
  url: string;
}

const SAMPLE_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'OpenAI releases new reasoning model with stronger real-world coding performance',
    source: 'The Verge',
    timeAgo: '3h ago',
    imageUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80',
    url: 'https://theverge.com',
  },
  {
    id: 'news-2',
    title:
      'Global renewable electricity generation sets new quarterly record across European grids',
    source: 'Reuters',
    timeAgo: '6h ago',
    imageUrl:
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=150&q=80',
    url: 'https://reuters.com',
  },
];

export function NewsPreview() {
  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-5 sm:p-6 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[var(--kokpit-accent)]" />
            <h3 className="font-ui font-semibold text-base text-[var(--kokpit-text-primary)]">
              News
            </h3>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-1 font-ui text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>See News</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Editorial articles feed */}
        <div className="mt-3 flex flex-col divide-y divide-[var(--kokpit-border-subtle)]">
          {SAMPLE_NEWS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="py-3 flex items-center gap-3.5 group/item hover:bg-[var(--kokpit-surface-hover)] px-2 rounded-lg transition-colors"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--kokpit-surface-2)] shadow-sm">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-ui text-xs sm:text-sm text-[var(--kokpit-text-primary)] group-hover/item:text-[var(--kokpit-accent)] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="font-ui text-[11px] text-[var(--kokpit-text-soft)] mt-1">
                  {item.source} • {item.timeAgo}
                </p>
              </div>

              <ExternalLink className="w-4 h-4 text-[var(--kokpit-text-soft)] group-hover/item:text-[var(--kokpit-accent)] opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1" />
            </a>
          ))}
        </div>
      </div>

      {/* Quiet footer */}
      <div className="pt-3 border-t border-[var(--kokpit-border-subtle)] flex justify-between items-center text-[var(--kokpit-text-soft)] font-ui text-[11px]">
        <span>Quiet curation • Distraction-free</span>
        <span>Updated 12m ago</span>
      </div>
    </div>
  );
}
