import { Search, X, Pin } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IdeasFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
  pinnedOnly: boolean;
  onPinnedOnlyChange: (pinned: boolean) => void;
  availableTags: string[];
  totalCount: number;
}

export function IdeasFilterBar({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  pinnedOnly,
  onPinnedOnlyChange,
  availableTags,
  totalCount,
}: IdeasFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search & Pinned Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--kokpit-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search thoughts by title, text, or topic..."
            className="w-full bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] pl-9 pr-9 py-2 rounded-[var(--radius-md)] border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-sm transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls right */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPinnedOnlyChange(!pinnedOnly)}
            aria-pressed={pinnedOnly}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-ui border transition-colors cursor-pointer select-none',
              pinnedOnly
                ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/50 font-medium'
                : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-secondary)] border-[var(--kokpit-border-default)] hover:text-[var(--kokpit-text-primary)]',
            )}
          >
            <Pin className={cn('w-3.5 h-3.5', pinnedOnly && 'fill-current')} />
            <span>Pinned Only</span>
          </button>

          <span className="font-mono text-xs text-[var(--kokpit-text-muted)] ml-2">
            {totalCount} {totalCount === 1 ? 'thought' : 'thoughts'}
          </span>
        </div>
      </div>

      {/* Tag filter chips */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => onTagSelect(null)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-ui border transition-all cursor-pointer',
              selectedTag === null
                ? 'bg-[var(--kokpit-surface-3)] text-[var(--kokpit-text-primary)] border-[var(--kokpit-border-strong)] font-medium'
                : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)]',
            )}
          >
            All
          </button>

          {availableTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagSelect(isSelected ? null : tag)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-ui border transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/50 font-medium'
                    : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)] hover:border-[var(--kokpit-border-default)]',
                )}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
