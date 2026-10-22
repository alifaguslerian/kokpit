import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowUp,
  Lightbulb,
  HelpCircle,
  CheckSquare,
  Sparkles,
  Pin,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format-time';
import { useIdeas, useCreateIdea } from '@/features/ideas/api/use-ideas';

interface TagConfig {
  label: string;
  icon: typeof Lightbulb;
}

const SUGGESTED_TAGS: TagConfig[] = [
  { label: 'Idea', icon: Lightbulb },
  { label: 'Question', icon: HelpCircle },
  { label: 'To-do', icon: CheckSquare },
  { label: 'Random', icon: Sparkles },
];

export function IdeasPreview() {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: ideas = [], isLoading } = useIdeas({ limit: 1 });
  const createIdeaMutation = useCreateIdea();

  const activeIdea = ideas[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || createIdeaMutation.isPending) return;

    await createIdeaMutation.mutateAsync({
      content: trimmed,
      tags: selectedTag ? [selectedTag] : undefined,
    });

    setContent('');
    setSelectedTag(null);
  };

  return (
    <div className="bg-[#161413]/85 backdrop-blur-xl rounded-[18px] p-4 sm:p-5 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between group hover:border-[var(--kokpit-accent)]/35 transition-all flex-1 min-h-0">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" />
            <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)]">
              Ideas & Notes
            </h3>
          </div>

          <Link
            to="/ideas"
            className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Open Ideas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Input box with copper submit button */}
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-3 relative">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Jot down a thought, idea, or reminder..."
              rows={2}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] p-2.5 pr-10 rounded-xl border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent-muted)] focus:outline-none transition-all resize-none font-ui text-xs shadow-inner leading-relaxed"
            />

            <button
              type="submit"
              disabled={!content.trim() || createIdeaMutation.isPending}
              aria-label="Send thought"
              className="absolute right-2 bottom-2.5 w-6 h-6 rounded-md bg-[var(--kokpit-accent)] text-[#2d1600] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Pill tags placed directly below input */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const TagIcon = tag.icon;
              const isSelected = selectedTag === tag.label;
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => setSelectedTag((prev) => (prev === tag.label ? null : tag.label))}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-ui border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)] font-medium shadow-xs'
                      : 'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-secondary)] border-[var(--kokpit-border-subtle)] hover:border-[var(--kokpit-border-default)] hover:text-[var(--kokpit-text-primary)]',
                  )}
                >
                  <TagIcon
                    className={cn(
                      'w-3 h-3',
                      isSelected ? 'text-[var(--kokpit-accent)]' : 'text-[var(--kokpit-text-soft)]',
                    )}
                  />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </form>
      </div>

      {/* Pinned / Recent thought snippet filling the lower card naturally */}
      <div className="mt-3 pt-2.5 border-t border-[var(--kokpit-border-subtle)]/70">
        {isLoading ? (
          <div className="space-y-1.5 py-1">
            <div className="w-24 h-3 bg-white/[0.05] rounded animate-pulse" />
            <div className="w-full h-4 bg-white/[0.05] rounded animate-pulse" />
          </div>
        ) : activeIdea ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Pin
                  className={cn(
                    'w-3 h-3 text-[var(--kokpit-accent)] shrink-0',
                    activeIdea.isPinned && 'fill-current',
                  )}
                />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
                  {activeIdea.isPinned ? 'Pinned Reflection' : 'Recent Thought'}
                </span>
              </div>
              <span className="font-ui text-[11px] text-[var(--kokpit-text-muted)]">
                {formatRelativeDate(activeIdea.createdAt)}
              </span>
            </div>

            <Link
              to="/ideas"
              className="block group/thought rounded-lg p-2 -mx-2 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-ui font-medium text-xs text-[var(--kokpit-text-primary)] group-hover/thought:text-[var(--kokpit-accent)] transition-colors truncate">
                  {activeIdea.title ||
                    (activeIdea.content.length > 36
                      ? activeIdea.content.slice(0, 36) + '...'
                      : activeIdea.content)}
                </h4>
                {activeIdea.tags && activeIdea.tags[0] && (
                  <span className="font-ui text-[10px] text-[var(--kokpit-text-muted)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] shrink-0">
                    #{activeIdea.tags[0]}
                  </span>
                )}
              </div>
              <p className="font-ui text-[11px] text-[var(--kokpit-text-secondary)] line-clamp-2 leading-relaxed mt-0.5">
                {activeIdea.content}
              </p>
            </Link>
          </div>
        ) : (
          <Link
            to="/ideas"
            className="block group/thought rounded-lg p-2 -mx-2 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-ui font-medium text-xs text-[var(--kokpit-text-muted)] group-hover/thought:text-[var(--kokpit-accent)] transition-colors">
                Your desk is quiet
              </h4>
            </div>
            <p className="font-ui text-[11px] text-[var(--kokpit-text-soft)] line-clamp-2 leading-relaxed mt-0.5">
              Jot down a quick thought above to save it to your desk.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
