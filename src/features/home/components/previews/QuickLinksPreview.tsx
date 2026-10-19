import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Link2 } from 'lucide-react';

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
              <svg
                className="w-4 h-4 group-hover/tile:scale-110 transition-transform shrink-0"
                fill="none"
                viewBox="0 0 87.3 78"
              >
                <path
                  d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
                  fill="#0066DA"
                />
                <path
                  d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 49.35C.4 50.75 0 52.3 0 53.85h27.5z"
                  fill="#00AC47"
                />
                <path
                  d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.95 10.3z"
                  fill="#EA4335"
                />
                <path
                  d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z"
                  fill="#00832D"
                />
                <path
                  d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z"
                  fill="#2684FC"
                />
                <path
                  d="M73.4 26.5 59.65 2.7C58.3 3.5 57.15 4.6 56.35 6L39.85 34.6 43.65 41.2 59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5z"
                  fill="#FFBA00"
                />
              </svg>
            )}
            {link.icon === 'mail' && (
              <svg
                className="w-4 h-4 group-hover/tile:scale-110 transition-transform shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"
                  stroke="#EA4335"
                  strokeWidth="2"
                />
                <path d="M2 7l10 7 10-7" stroke="#EA4335" strokeLinecap="round" strokeWidth="2" />
              </svg>
            )}
            {link.icon === 'youtube' && (
              <svg
                className="w-4 h-4 text-[#FF0000] fill-current group-hover/tile:scale-110 transition-transform shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            )}
          </a>
        ))}

        {/* Add Shortcut tile */}
        <Link
          to="/library"
          title="Add shortcut in Library"
          className="aspect-square rounded-xl bg-[var(--kokpit-surface-2)]/50 flex items-center justify-center border border-dashed border-[var(--kokpit-border-strong)] hover:border-[var(--kokpit-accent)] hover:scale-105 transition-all group/add cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--kokpit-text-soft)] group-hover/add:text-[var(--kokpit-accent)] transition-colors" />
        </Link>
      </div>
    </div>
  );
}
