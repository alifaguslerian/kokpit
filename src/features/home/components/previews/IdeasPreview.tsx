import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';

const SUGGESTED_TAGS = ['Idea', 'Question', 'To-do', 'Random'];

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
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-[4px] border border-[var(--kokpit-text-muted)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[var(--kokpit-text-muted)] rounded-full" />
            </span>
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
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-ui border transition-all cursor-pointer',
              selectedTag === tag
                ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)] font-medium'
                : 'bg-transparent text-[var(--kokpit-text-secondary)] border-[var(--kokpit-border-default)] hover:border-[var(--kokpit-border-strong)] hover:text-[var(--kokpit-text-primary)]',
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
