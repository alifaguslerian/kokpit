import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Lightbulb, HelpCircle, CheckSquare, Shuffle, Pin } from 'lucide-react';
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
    <section aria-labelledby="home-ideas-title" className="home-ideas paper-panel">
      <div className="home-panel-header">
        <div className="home-panel-title">
          <h2 id="home-ideas-title" className="font-ui font-medium">
            Ideas
          </h2>
        </div>
        <Link to="/ideas" className="home-panel-link">
          Open Ideas <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="paper-composer mt-4"
        aria-busy={createIdeaMutation.isPending}
      >
        <label
          htmlFor="home-quick-thought"
          className="mb-1 block text-xs text-[var(--kokpit-paper-ink)]"
        >
          Quick thought
        </label>
        <fieldset disabled={createIdeaMutation.isPending} className="min-w-0">
          <textarea
            id="home-quick-thought"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Jot down a thought, idea, or reminder…"
            rows={2}
            maxLength={10000}
            aria-describedby={saveError ? 'home-thought-error' : undefined}
            className="paper-input w-full resize-none bg-transparent font-ui text-sm text-[var(--kokpit-paper-ink)] placeholder:text-[var(--kokpit-paper-muted)] disabled:opacity-70"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5" aria-label="Thought tags">
              {SUGGESTED_TAGS.map(({ label, icon: TagIcon }) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selectedTag === label}
                  onClick={() => setSelectedTag((previous) => (previous === label ? null : label))}
                  className="paper-tag inline-flex min-h-8 items-center gap-1 px-2.5 py-1 font-ui text-xs"
                >
                  <TagIcon className="w-3 h-3" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!content.trim() || createIdeaMutation.isPending}
              aria-label="Save thought"
              className="paper-save ml-auto min-h-9 rounded-lg px-4 py-2 font-ui text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save thought
            </button>
          </div>
        </fieldset>
        {createIdeaMutation.isPending && (
          <p role="status" className="mt-2 text-xs text-[var(--kokpit-paper-muted)]">
            Saving thought…
          </p>
        )}
        {saveError && (
          <p
            id="home-thought-error"
            role="alert"
            className="mt-2 text-xs text-[var(--kokpit-paper-ink)]"
          >
            Could not save your thought. Your draft is still here. Try again.
          </p>
        )}
      </form>
      <div className="paper-thought mt-4 border-t border-[var(--kokpit-paper-rule)] pt-3">
        {isLoading ? (
          <p role="status" className="text-xs text-[var(--kokpit-paper-muted)]">
            Loading your thoughts…
          </p>
        ) : isError ? (
          <div className="text-xs text-[var(--kokpit-paper-ink)]">
            <p role="alert">Could not load your thoughts.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-[var(--kokpit-paper-accent)] underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : activeIdea ? (
          <Link to="/ideas" className="paper-note-link rounded-lg text-[var(--kokpit-paper-ink)]">
            <div className="paper-note-meta flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--kokpit-paper-muted)]">
              <span className="inline-flex items-center gap-1.5">
                {activeIdea.isPinned && (
                  <Pin className="h-3 w-3 text-[var(--kokpit-paper-accent)]" aria-hidden="true" />
                )}
                {activeIdea.isPinned ? 'Pinned thought' : 'Recent thought'}
              </span>
              <span>{formatRelativeDate(activeIdea.updatedAt)}</span>
            </div>
            {activeIdea.title && (
              <h3 className="font-ui font-medium text-sm truncate">{activeIdea.title}</h3>
            )}
            <p className="line-clamp-2 font-ui text-xs leading-relaxed text-[var(--kokpit-paper-muted)]">
              {activeIdea.content}
            </p>
          </Link>
        ) : (
          <p className="text-xs text-[var(--kokpit-paper-muted)]">
            No thoughts saved yet. Start with a quick thought above.
          </p>
        )}
      </div>
    </section>
  );
}
