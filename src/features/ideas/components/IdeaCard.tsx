import { useState } from 'react';
import { Pin, Pencil, Trash2, Star, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format-time';
import { useTogglePinIdea, useDeleteIdea, useUpdateIdea } from '../api/use-ideas';
import type { Idea } from '../types';

export function IdeaCover({ url, className }: { url: string | null; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!url || failed === url) return null;
  return (
    <img src={url} alt="" loading="lazy" className={className} onError={() => setFailed(url)} />
  );
}

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function IdeaCard({ idea, onEdit, onTagClick, className }: IdeaCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const pin = useTogglePinIdea();
  const favorite = useUpdateIdea();
  const deletion = useDeleteIdea();
  const control =
    'flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-[var(--kokpit-surface-hover)] disabled:opacity-50';
  return (
    <article
      aria-label={idea.title || 'Saved thought'}
      className={cn(
        'min-w-0 rounded-[var(--radius-md)] border bg-[var(--kokpit-surface-1)] font-ui flex flex-col',
        idea.isPinned
          ? 'border-[var(--kokpit-border-strong)]'
          : 'border-[var(--kokpit-border-default)]',
        className,
      )}
    >
      <button
        type="button"
        disabled={deletion.isPending}
        onClick={() => onEdit(idea)}
        aria-label={`Open thought ${idea.title || 'Untitled'}`}
        className="w-full text-left hover:bg-[var(--kokpit-surface-hover)]"
      >
        <IdeaCover
          url={idea.coverUrl}
          className="h-32 w-full rounded-t-[var(--radius-md)] object-cover"
        />
        <span className="block p-4 pb-2">
          {idea.title && (
            <h3 className="mb-2 block break-words font-semibold leading-snug [overflow-wrap:anywhere]">
              {idea.title}
            </h3>
          )}
          <span className="line-clamp-5 block whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--kokpit-text-secondary)] [overflow-wrap:anywhere]">
            {idea.content}
          </span>
        </span>
      </button>
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-2">
          {idea.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              title={`Filter by #${tag}`}
              className="min-h-[30px] max-w-full rounded-full border border-[var(--kokpit-border-default)] bg-[var(--kokpit-accent-bg)] px-2.5 text-left text-xs text-[var(--kokpit-text-secondary)] break-words [overflow-wrap:anywhere] hover:text-[var(--kokpit-accent-hover)]"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-1 px-2 py-2">
        <time dateTime={idea.createdAt} className="pl-2 text-xs text-[var(--kokpit-text-muted)]">
          {formatRelativeDate(idea.createdAt)}
        </time>
        <div className="flex flex-wrap items-center">
          <button
            type="button"
            onClick={() => pin.mutate({ id: idea.id, isPinned: !idea.isPinned })}
            disabled={pin.isPending}
            aria-label={idea.isPinned ? 'Unpin thought' : 'Pin thought to top'}
            aria-pressed={idea.isPinned}
            className={cn(
              control,
              idea.isPinned ? 'text-[var(--kokpit-accent)]' : 'text-[var(--kokpit-text-muted)]',
            )}
          >
            <Pin className={cn('size-4', idea.isPinned && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={() =>
              favorite.mutate({ id: idea.id, input: { isFavorite: !idea.isFavorite } })
            }
            disabled={favorite.isPending}
            aria-label={idea.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            aria-pressed={idea.isFavorite}
            className={cn(
              control,
              idea.isFavorite ? 'text-[var(--kokpit-accent)]' : 'text-[var(--kokpit-text-muted)]',
            )}
          >
            <Star className={cn('size-4', idea.isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(idea)}
            aria-label="Edit thought"
            disabled={deletion.isPending}
            className={cn(control, 'text-[var(--kokpit-text-secondary)]')}
          >
            <Pencil className="size-4" />
          </button>
          <details className="relative">
            <summary
              aria-label="Thought actions"
              className={cn(
                control,
                'cursor-pointer list-none text-[var(--kokpit-text-secondary)] [&::-webkit-details-marker]:hidden',
              )}
            >
              <MoreHorizontal className="size-4" />
            </summary>
            <div className="absolute right-0 bottom-full z-10 mb-1 w-40 rounded-xl border border-[var(--kokpit-border-strong)] bg-[var(--kokpit-surface-2)] p-1 shadow-[var(--shadow-soft)]">
              <button
                type="button"
                onClick={() => onEdit(idea)}
                disabled={deletion.isPending}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm hover:bg-[var(--kokpit-surface-hover)]"
              >
                <Pencil className="size-4" />
                Edit this thought
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                aria-label="Delete thought"
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm hover:bg-[var(--kokpit-danger-bg)]"
              >
                <Trash2 className="size-4" />
                Delete thought
              </button>
            </div>
          </details>
        </div>
      </div>
      {showConfirmDelete && (
        <div className="space-y-2 border-t border-[var(--kokpit-border-default)] p-4">
          <p className="text-sm">Delete this thought and its private cover?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => deletion.mutate(idea.id)}
              disabled={deletion.isPending}
              className="min-h-11 rounded-xl border border-[var(--kokpit-border-default)] bg-[var(--kokpit-danger-bg)] px-3 text-sm"
            >
              Delete?
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="min-h-11 rounded-xl px-3 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {(pin.isError || favorite.isError || deletion.isError) && (
        <p role="alert" className="px-4 pb-4 text-sm">
          {deletion.isError ? 'Could not delete this thought.' : 'Could not update this thought.'}{' '}
          Please try again.
        </p>
      )}
    </article>
  );
}
