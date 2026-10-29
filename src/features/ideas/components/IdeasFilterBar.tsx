import { Search, Pin } from 'lucide-react';
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
  const canonical = [
    { value: null, label: 'All' },
    { value: 'Idea', label: 'Ideas' },
    { value: 'Question', label: 'Questions' },
    { value: 'Random', label: 'Random' },
  ];
  const custom = availableTags.filter((tag) => !canonical.some((item) => item.value === tag));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {canonical.map((item) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={selectedTag === item.value}
              onClick={() => onTagSelect(item.value)}
              className={cn(
                'min-h-11 rounded-full px-3 text-sm transition-colors',
                selectedTag === item.value
                  ? 'bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)]'
                  : 'text-[var(--kokpit-text-secondary)] hover:bg-[var(--kokpit-surface-hover)]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-full min-w-0 sm:max-w-xs">
          <label
            htmlFor="ideas-search"
            className="mb-1 block text-xs text-[var(--kokpit-text-secondary)]"
          >
            Search thoughts
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--kokpit-text-muted)]"
            />
            <input
              id="ideas-search"
              type="search"
              maxLength={200}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search ideas…"
              className="min-h-11 w-full rounded-xl border border-[var(--kokpit-border-default)] bg-[var(--kokpit-surface-1)] pl-9 pr-3 text-sm text-[var(--kokpit-text-primary)] placeholder:text-[var(--kokpit-text-muted)]"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={pinnedOnly}
          onClick={() => onPinnedOnlyChange(!pinnedOnly)}
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--kokpit-border-default)] px-3 text-xs',
            pinnedOnly
              ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)]'
              : 'text-[var(--kokpit-text-secondary)]',
          )}
        >
          <Pin className="size-3.5" />
          Pinned Only
        </button>
        {custom.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selectedTag === tag}
            onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
            className={cn(
              'min-h-9 max-w-full break-words rounded-full border border-[var(--kokpit-border-default)] px-3 text-xs [overflow-wrap:anywhere]',
              selectedTag === tag
                ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)]'
                : 'text-[var(--kokpit-text-secondary)]',
            )}
          >
            #{tag}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--kokpit-text-muted)]">{totalCount} loaded</span>
      </div>
    </div>
  );
}
