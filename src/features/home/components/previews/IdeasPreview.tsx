import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ArrowRight, ArrowUp } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

const SUGGESTED_TAGS = ['Idea', 'Question', 'College', 'Project', 'Random'];

export function IdeasPreview() {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Fast capture demonstration in V1 package 2.3
    setIsSaved(true);
    setTimeout(() => {
      setContent('');
      setSelectedTag(null);
      setIsSaved(false);
    }, 1200);
  };

  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-5 sm:p-6 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[var(--kokpit-accent)]" />
            <h3 className="font-ui font-semibold text-base text-[var(--kokpit-text-primary)]">
              Ideas
            </h3>
          </div>
          <Link
            to="/ideas"
            className="inline-flex items-center gap-1 font-ui text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Open Ideas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick capture form */}
        <form onSubmit={handleSubmit} className="mt-4 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jot down a thought, idea, or reminder..."
            rows={3}
            className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] p-3.5 pr-12 rounded-xl border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kokpit-accent-bg)] transition-all resize-none font-ui text-sm shadow-inner"
          />

          <button
            type="submit"
            disabled={!content.trim()}
            aria-label="Save idea"
            className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {isSaved && (
          <p className="text-xs text-[var(--kokpit-success)] mt-2 font-ui" role="status">
            Captured to local thoughts.
          </p>
        )}
      </div>

      {/* Quick tags row */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2">
        {SUGGESTED_TAGS.map((tag) => (
          <Chip
            key={tag}
            isSelected={selectedTag === tag}
            onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
            className="text-xs"
          >
            {tag}
          </Chip>
        ))}
      </div>
    </div>
  );
}
