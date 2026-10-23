import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Link2 } from 'lucide-react';
import { useQuickLinks } from '@/features/library/api/use-quick-links';
import { QuickLinkIcon } from '@/features/library/components/QuickLinkIcon';

const DEFAULT_SHORTCUTS = [
  {
    id: 'def-1',
    name: 'GitHub',
    url: 'https://github.com',
    iconType: 'platform',
    iconValue: 'github',
  },
  {
    id: 'def-2',
    name: 'Notion',
    url: 'https://notion.so',
    iconType: 'platform',
    iconValue: 'notion',
  },
  {
    id: 'def-3',
    name: 'Drive',
    url: 'https://drive.google.com',
    iconType: 'platform',
    iconValue: 'drive',
  },
  {
    id: 'def-4',
    name: 'Gmail',
    url: 'https://mail.google.com',
    iconType: 'platform',
    iconValue: 'mail',
  },
  {
    id: 'def-5',
    name: 'YouTube',
    url: 'https://youtube.com',
    iconType: 'platform',
    iconValue: 'youtube',
  },
];

export function QuickLinksPreview() {
  const { data: links = [] } = useQuickLinks();

  // If user has saved links, use them (favorites first, then position order, up to 5)
  const displayLinks =
    links.length > 0
      ? [...links]
          .sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            return a.position - b.position;
          })
          .slice(0, 5)
      : DEFAULT_SHORTCUTS;

  return (
    <div className="bg-[#161413]/85 backdrop-blur-xl rounded-[18px] p-4 sm:p-5 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-[var(--kokpit-accent)]/35 transition-all">
      {/* Header pattern */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" />
          <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)]">
            Quick Links
          </h3>
        </div>

        <Link
          to="/library"
          className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
        >
          <span>Library</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Row of 6 square icon tiles matching Stitch */}
      <div className="grid grid-cols-6 gap-2 sm:gap-2.5 mt-3.5">
        {displayLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.name}
            className="aspect-square rounded-xl bg-[var(--kokpit-surface-2)] flex items-center justify-center border border-[var(--kokpit-border-default)] hover:scale-105 hover:border-[var(--kokpit-accent-muted)] hover:shadow-md transition-all group/tile"
          >
            <QuickLinkIcon
              iconType={link.iconType}
              iconValue={link.iconValue}
              name={link.name}
              size="md"
              className="text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors"
            />
          </a>
        ))}

        {/* Add Shortcut tile */}
        <Link
          to="/library"
          title="Manage shortcuts in Library"
          className="aspect-square rounded-xl bg-[var(--kokpit-surface-2)]/50 flex items-center justify-center border border-dashed border-[var(--kokpit-border-strong)] hover:border-[var(--kokpit-accent)] hover:scale-105 transition-all group/add cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--kokpit-text-soft)] group-hover/add:text-[var(--kokpit-accent)] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
