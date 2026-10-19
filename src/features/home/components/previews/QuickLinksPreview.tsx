import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Mail, Video, Cloud } from 'lucide-react';

interface QuickLinkItem {
  id: string;
  name: string;
  url: string;
  icon: 'github' | 'notion' | 'drive' | 'mail' | 'youtube';
}

const SHORTCUTS: QuickLinkItem[] = [
  { id: '1', name: 'GitHub', url: 'https://github.com', icon: 'github' },
  { id: '2', name: 'Notion', url: 'https://notion.so', icon: 'notion' },
  { id: '3', name: 'Drive', url: 'https://drive.google.com', icon: 'drive' },
  { id: '4', name: 'Gmail', url: 'https://mail.google.com', icon: 'mail' },
  { id: '5', name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
];

export function QuickLinksPreview() {
  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] group hover:border-[var(--kokpit-border-strong)] transition-all">
      {/* Header pattern */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-[4px] border border-[var(--kokpit-text-muted)] flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-[var(--kokpit-text-muted)] rounded-full" />
          </span>
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
        {SHORTCUTS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            title={link.name}
            className="aspect-square rounded-xl bg-[var(--kokpit-surface-2)] flex items-center justify-center border border-[var(--kokpit-border-default)] hover:scale-105 hover:border-[var(--kokpit-accent-muted)] hover:shadow-md transition-all group/tile"
          >
            {link.icon === 'github' && (
              <svg
                className="w-4 h-4 text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors fill-current"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            )}
            {link.icon === 'notion' && (
              <span className="font-display font-bold text-sm text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors">
                N
              </span>
            )}
            {link.icon === 'drive' && (
              <Cloud className="w-4 h-4 text-[var(--kokpit-accent)] group-hover/tile:scale-110 transition-transform" />
            )}
            {link.icon === 'mail' && (
              <Mail className="w-4 h-4 text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors" />
            )}
            {link.icon === 'youtube' && (
              <Video className="w-4 h-4 text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors" />
            )}
          </a>
        ))}

        {/* Add Shortcut tile */}
        <Link
          to="/library"
          title="Add shortcut in Library"
          className="aspect-square rounded-xl bg-[var(--kokpit-surface-2)]/50 flex items-center justify-center border border-dashed border-[var(--kokpit-border-strong)] hover:border-[var(--kokpit-accent)] hover:scale-105 transition-all group/add"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--kokpit-text-soft)] group-hover/add:text-[var(--kokpit-accent)] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
