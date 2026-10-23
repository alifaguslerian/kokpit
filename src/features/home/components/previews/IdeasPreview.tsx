import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowUp,
  Lightbulb,
  HelpCircle,
  CheckSquare,
  Shuffle,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format-time';
import { useIdeas, useCreateIdea } from '@/features/ideas/api/use-ideas';

const SUGGESTED_TAGS = [
  { label: 'Idea', icon: Lightbulb },
  { label: 'Question', icon: HelpCircle },
  { label: 'To-do', icon: CheckSquare },
  { label: 'Random', icon: Shuffle },
];

export function IdeasPreview() {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const { data: ideas = [], isLoading, isError, refetch } = useIdeas({ limit: 1 });
  const createIdeaMutation = useCreateIdea();
  const activeIdea = ideas[0];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || createIdeaMutation.isPending) return;
    setSaveError(false);
    try {
      await createIdeaMutation.mutateAsync({
        content: trimmed,
        tags: selectedTag ? [selectedTag] : undefined,
      });
      setContent('');
      setSelectedTag(null);
    } catch {
      setSaveError(true);
    }
  };

  return (
    <section
      aria-labelledby="home-ideas-title"
      className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-subtle)]"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" aria-hidden="true" />
          <h2 id="home-ideas-title" className="font-ui font-semibold text-sm">
            Ideas
          </h2>
        </div>
        <Link
          to="/ideas"
          className="inline-flex items-center gap-1 text-xs text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)]"
        >
          Open Ideas <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-3"
        aria-busy={createIdeaMutation.isPending}
      >
        <label
          htmlFor="home-quick-thought"
          className="block text-xs text-[var(--kokpit-text-secondary)] mb-2"
        >
          Quick thought
        </label>
        <fieldset disabled={createIdeaMutation.isPending} className="min-w-0">
          <div className="relative">
            <textarea
              id="home-quick-thought"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Jot down a thought, idea, or reminder…"
              rows={3}
              maxLength={10000}
              aria-describedby={saveError ? 'home-thought-error' : undefined}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] p-3 pr-12 rounded-xl border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent-muted)] resize-none font-ui text-sm leading-relaxed disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={!content.trim() || createIdeaMutation.isPending}
              aria-label="Save thought"
              className="absolute right-2 bottom-3 w-8 h-8 rounded-md bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)] flex items-center justify-center hover:bg-[var(--kokpit-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Thought tags">
            {SUGGESTED_TAGS.map(({ label, icon: TagIcon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={selectedTag === label}
                onClick={() => setSelectedTag((previous) => (previous === label ? null : label))}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-ui border transition-colors',
                  selectedTag === label
                    ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]'
                    : 'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-secondary)] border-[var(--kokpit-border-subtle)] hover:border-[var(--kokpit-border-default)]',
                )}
              >
                <TagIcon className="w-3 h-3" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        {createIdeaMutation.isPending && (
          <p role="status" className="mt-2 text-xs text-[var(--kokpit-text-muted)]">
            Saving thought…
          </p>
        )}
        {saveError && (
          <p
            id="home-thought-error"
            role="alert"
            className="mt-2 text-xs text-[var(--kokpit-danger)]"
          >
            Could not save your thought. Your draft is still here. Try again.
          </p>
        )}
      </form>
      <div className="mt-4 pt-3 border-t border-[var(--kokpit-border-subtle)]">
        {isLoading ? (
          <p role="status" className="text-xs text-[var(--kokpit-text-muted)]">
            Loading your thoughts…
          </p>
        ) : isError ? (
          <div className="text-xs text-[var(--kokpit-text-secondary)]">
            <p role="alert">Could not load your thoughts.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-[var(--kokpit-accent)]"
            >
              Try again
            </button>
          </div>
        ) : activeIdea ? (
          <Link
            to="/ideas"
            className="block rounded-lg hover:bg-[var(--kokpit-surface-hover)] p-2 -m-2"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-[var(--kokpit-text-muted)] mb-2">
              <span className="inline-flex items-center gap-1.5">
                {activeIdea.isPinned && (
                  <Pin className="w-3 h-3 text-[var(--kokpit-accent)]" aria-hidden="true" />
                )}
                {activeIdea.isPinned ? 'Pinned thought' : 'Recent thought'}
              </span>
              <span>{formatRelativeDate(activeIdea.updatedAt)}</span>
            </div>
            {activeIdea.title && (
              <h3 className="font-ui font-medium text-sm truncate">{activeIdea.title}</h3>
            )}
            <p className="font-ui text-xs text-[var(--kokpit-text-secondary)] line-clamp-2 leading-relaxed">
              {activeIdea.content}
            </p>
          </Link>
        ) : (
          <p className="text-xs text-[var(--kokpit-text-muted)]">
            No thoughts saved yet. Start with a quick thought above.
          </p>
        )}
      </div>
    </section>
  );
}
