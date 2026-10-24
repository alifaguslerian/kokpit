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
    togglePinMutation.mutate({
      id: idea.id,
      isPinned: !idea.isPinned,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(idea.id);
  };

  return (
    <article
      aria-label={idea.title || 'Saved thought'}
      className={cn(
        'min-w-0 flex flex-col font-ui',
        idea.isPinned
          ? 'rounded-[var(--radius-lg)] border border-[var(--kokpit-border-strong)] bg-[var(--kokpit-surface-2)] p-5 sm:p-6'
          : 'border-b border-[var(--kokpit-border-default)] px-1 py-5 sm:px-2 sm:py-6',
        className,
      )}
    >
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--kokpit-text-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePin}
              disabled={togglePinMutation.isPending}
              aria-label={idea.isPinned ? 'Unpin thought' : 'Pin thought to top'}
              aria-pressed={idea.isPinned}
              title={idea.isPinned ? 'Unpin thought' : 'Pin thought to top'}
              className={cn(
                'inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 transition-colors cursor-pointer disabled:cursor-wait',
                idea.isPinned
                  ? 'text-[var(--kokpit-accent)] bg-[var(--kokpit-accent-bg)] font-medium'
                  : 'text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-secondary)]',
              )}
            >
              <Pin className={cn('w-3.5 h-3.5', idea.isPinned && 'fill-current')} />
              <span className="text-xs font-medium">{idea.isPinned ? 'Pinned' : 'Pin'}</span>
            </button>

            <time dateTime={idea.createdAt} className="text-xs">
              {formatRelativeDate(idea.createdAt)}
            </time>
          </div>

          <div className="flex items-center gap-1">
            {showConfirmDelete ? (
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="min-h-9 rounded-[var(--radius-md)] bg-[var(--kokpit-danger-bg)] px-3 text-xs text-[var(--kokpit-text-primary)] border border-[var(--kokpit-border-default)] hover:bg-[var(--kokpit-surface-hover)] transition-colors cursor-pointer disabled:cursor-wait"
                >
                  Delete?
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="min-h-9 rounded-[var(--radius-md)] px-3 text-xs text-[var(--kokpit-text-secondary)] hover:bg-[var(--kokpit-surface-hover)] hover:text-[var(--kokpit-text-primary)] transition-colors cursor-pointer"
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
                  className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-surface-hover)] transition-colors cursor-pointer"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  aria-label="Delete thought"
                  title="Delete thought"
                  className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-danger-bg)] transition-colors cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {idea.title && (
          <h3 className="max-w-[64ch] break-words text-lg font-semibold text-[var(--kokpit-text-primary)] mb-2 leading-snug">
            {idea.title}
          </h3>
        )}

        <p
          className={cn(
            'max-w-[72ch] text-[var(--kokpit-text-secondary)] leading-relaxed whitespace-pre-wrap break-words',
            idea.isPinned ? 'text-base' : 'text-sm',
          )}
        >
          {idea.content}
        </p>
      </div>

      {(togglePinMutation.isError || deleteMutation.isError) && (
        <p role="alert" className="mt-3 text-sm text-[var(--kokpit-text-primary)]">
          {deleteMutation.isError
            ? 'Could not delete this thought. Please try again.'
            : 'Could not update the pin. Please try again.'}
        </p>
      )}

      {idea.tags && idea.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {idea.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              title={`Filter by #${tag}`}
              className="min-h-[30px] max-w-full break-all text-left inline-flex items-center px-3 rounded-full text-xs bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)] border border-[var(--kokpit-border-default)] transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
