import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight, Plus, Mail, Video, Cloud } from 'lucide-react';

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
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-5 sm:p-6 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] group hover:border-[var(--kokpit-border-strong)] transition-all">
      {/* Header pattern */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[var(--kokpit-accent)]" />
          <h3 className="font-ui font-semibold text-base text-[var(--kokpit-text-primary)]">
            Quick Links
          </h3>
        </div>
        <Link
          to="/library"
          className="inline-flex items-center gap-1 font-ui text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
        >
          <span>View Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of shortcut tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mt-5">
        {SHORTCUTS.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group/tile p-2 rounded-xl hover:bg-[var(--kokpit-surface-2)] transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-[14px] bg-[var(--kokpit-surface-2)] flex items-center justify-center border border-[var(--kokpit-border-default)] group-hover/tile:scale-105 group-hover/tile:border-[var(--kokpit-accent-muted)] group-hover/tile:shadow-[0_4px_16px_rgba(215,160,109,0.15)] transition-all">
              {link.icon === 'github' && (
                <svg
                  className="w-6 h-6 text-[var(--kokpit-text-primary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors fill-current"
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
                <span className="font-display font-bold text-lg text-[var(--kokpit-text-primary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors">
                  N
                </span>
              )}
              {link.icon === 'drive' && (
                <Cloud className="w-6 h-6 text-[var(--kokpit-accent)] group-hover/tile:scale-110 transition-transform" />
              )}
              {link.icon === 'mail' && (
                <Mail className="w-6 h-6 text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors" />
              )}
              {link.icon === 'youtube' && (
                <Video className="w-6 h-6 text-[var(--kokpit-text-secondary)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors" />
              )}
            </div>
            <span className="font-ui text-xs text-[var(--kokpit-text-muted)] group-hover/tile:text-[var(--kokpit-text-primary)] transition-colors">
              {link.name}
            </span>
          </a>
        ))}

        {/* Add Shortcut tile */}
        <Link
          to="/library"
          className="flex flex-col items-center gap-2 group/tile p-2 rounded-xl hover:bg-[var(--kokpit-surface-2)] transition-all duration-200"
          title="Add shortcut in Library"
        >
          <div className="w-14 h-14 rounded-[14px] bg-[var(--kokpit-surface-2)]/60 flex items-center justify-center border border-dashed border-[var(--kokpit-border-strong)] group-hover/tile:scale-105 group-hover/tile:border-[var(--kokpit-accent)] transition-all">
            <Plus className="w-5 h-5 text-[var(--kokpit-text-soft)] group-hover/tile:text-[var(--kokpit-accent)] transition-colors" />
          </div>
          <span className="font-ui text-xs text-[var(--kokpit-text-soft)] group-hover/tile:text-[var(--kokpit-text-primary)] transition-colors">
            Add
          </span>
        </Link>
      </div>
    </div>
  );
}
