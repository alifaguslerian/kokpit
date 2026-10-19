import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
  url: string;
}

const NEWS_STORIES: NewsItem[] = [
  {
    id: 'news-1',
    title: 'OpenAI releases new reasoning model with stronger real-world performance',
    source: 'The Verge',
    timeAgo: '3h ago',
    imageUrl:
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=180&q=80',
    url: 'https://theverge.com',
  },
  {
    id: 'news-2',
    title: 'Earth just had its warmest March on record, EU climate monitor says',
    source: 'Reuters',
    timeAgo: '6h ago',
    imageUrl:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=180&q=80',
    url: 'https://reuters.com',
  },
];

export function NewsPreview() {
  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-[4px] border border-[var(--kokpit-text-muted)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[var(--kokpit-text-muted)] rounded-full" />
            </span>
            <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)]">News</h3>
          </div>

          <Link
            to="/news"
            className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>See News</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stories list matching Stitch */}
        <div className="mt-2.5 flex flex-col divide-y divide-[var(--kokpit-border-subtle)]">
          {NEWS_STORIES.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 flex items-center gap-3 group/story hover:bg-[var(--kokpit-surface-2)]/60 px-1.5 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--kokpit-surface-2)] shadow-sm">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-ui text-xs text-[var(--kokpit-text-primary)] font-medium group-hover/story:text-[var(--kokpit-accent)] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="font-ui text-[10px] text-[var(--kokpit-text-soft)] mt-0.5">
                  {item.source} • {item.timeAgo}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
