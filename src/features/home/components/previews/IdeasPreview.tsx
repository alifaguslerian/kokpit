import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowUp, Lightbulb, HelpCircle, CheckSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setContent('');
    setSelectedTag(null);
  };

  return (
    <div className="bg-[#161413]/85 backdrop-blur-xl rounded-[18px] p-4 sm:p-5 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between group hover:border-[var(--kokpit-accent)]/35 transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
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

        {/* Input box with square copper submit button */}
        <form onSubmit={handleSubmit} className="mt-3.5 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jot down a thought, idea, or reminder..."
            rows={2}
            className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] p-3 pr-10 rounded-xl border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent-muted)] focus:outline-none transition-all resize-none font-ui text-xs shadow-inner"
          />

          <button
            type="submit"
            disabled={!content.trim()}
            aria-label="Send thought"
            className="absolute right-2.5 bottom-3 w-6 h-6 rounded-md bg-[var(--kokpit-accent)] text-[#2d1600] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Pill tags matching Stitch */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {SUGGESTED_TAGS.map((tag) => {
          const TagIcon = tag.icon;
          const isSelected = selectedTag === tag.label;
          return (
            <button
              key={tag.label}
              type="button"
              onClick={() => setSelectedTag((prev) => (prev === tag.label ? null : tag.label))}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-ui border transition-all cursor-pointer',
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
    </div>
  );
}
