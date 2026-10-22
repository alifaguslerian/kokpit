import { useState } from 'react';
import { Pin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format-time';
import { useTogglePinIdea, useDeleteIdea } from '../api/use-ideas';
import type { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function IdeaCard({ idea, onEdit, onTagClick, className }: IdeaCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const togglePinMutation = useTogglePinIdea();
  const deleteMutation = useDeleteIdea();

  const handleTogglePin = () => {
    void togglePinMutation.mutateAsync({
      id: idea.id,
      isPinned: !idea.isPinned,
    });
  };

  const handleDelete = () => {
    void deleteMutation.mutateAsync(idea.id);
  };

  return (
    <div
      className={cn(
        'group bg-[var(--kokpit-surface-1)] border rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-card)] flex flex-col justify-between transition-all duration-[var(--motion-default)]',
        idea.isPinned
          ? 'border-[var(--kokpit-accent)]/35 shadow-[0_4px_24px_rgba(217,119,6,0.06)]'
          : 'border-[var(--kokpit-border-default)] hover:border-[var(--kokpit-border-strong)]',
        className,
      )}
    >
      <div>
        {/* Top meta & action bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--kokpit-border-subtle)] text-xs text-[var(--kokpit-text-muted)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePin}
              disabled={togglePinMutation.isPending}
              aria-label={idea.isPinned ? 'Unpin thought' : 'Pin thought to top'}
              title={idea.isPinned ? 'Unpin thought' : 'Pin thought to top'}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                idea.isPinned
                  ? 'text-[var(--kokpit-accent)] bg-[var(--kokpit-accent-bg)] font-medium'
                  : 'text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-secondary)]',
              )}
            >
              <Pin className={cn('w-3.5 h-3.5', idea.isPinned && 'fill-current')} />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {idea.isPinned ? 'Pinned' : 'Pin'}
              </span>
            </button>

            <span className="text-[var(--kokpit-text-soft)]">•</span>
            <time dateTime={idea.createdAt} className="font-ui text-[11px]">
              {formatRelativeDate(idea.createdAt)}
            </time>
          </div>

          {/* Quick Card Actions */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-2 py-0.5 rounded bg-[var(--kokpit-danger-bg)] text-[var(--kokpit-danger)] text-[11px] font-ui border border-[var(--kokpit-danger)]/30 hover:bg-[var(--kokpit-danger)] hover:text-white transition-colors cursor-pointer"
                >
                  Delete?
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-1.5 py-0.5 rounded text-[11px] text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(idea)}
                  aria-label="Edit thought"
                  title="Edit thought"
                  className="p-1 rounded text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  aria-label="Delete thought"
                  title="Delete thought"
                  className="p-1 rounded text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-danger)] hover:bg-[var(--kokpit-danger-bg)] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title if present */}
        {idea.title && (
          <h3 className="font-serif text-lg font-medium text-[var(--kokpit-text-primary)] mb-1.5 leading-snug">
            {idea.title}
          </h3>
        )}

        {/* Body content */}
        <p className="font-ui text-sm text-[var(--kokpit-text-secondary)] leading-relaxed whitespace-pre-wrap break-words">
          {idea.content}
        </p>
      </div>

      {/* Tags footer */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-[var(--kokpit-border-subtle)] flex flex-wrap items-center gap-1.5">
          {idea.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              title={`Filter by #${tag}`}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-ui bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] hover:border-[var(--kokpit-accent)]/30 border border-[var(--kokpit-border-subtle)] transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
