import { useState } from 'react';
import { Star, ExternalLink, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { QuickLinkIcon } from './QuickLinkIcon';
import { useToggleFavoriteQuickLink, useDeleteQuickLink } from '../api/use-quick-links';
import type { QuickLink } from '../types';

interface QuickLinkCardProps {
  link: QuickLink;
  onEdit: (link: QuickLink) => void;
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
  canMoveUp?: boolean | undefined;
  canMoveDown?: boolean | undefined;
  className?: string | undefined;
}

export function QuickLinkCard({
  link,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  className,
}: QuickLinkCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const toggleFavoriteMutation = useToggleFavoriteQuickLink();
  const deleteMutation = useDeleteQuickLink();

  const domain = (() => {
    try {
      return new URL(link.url).hostname.replace(/^www\./, '');
    } catch {
      return link.url;
    }
  })();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate({
      id: link.id,
      isFavorite: !link.isFavorite,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(link.id);
  };

  return (
    <div
      className={cn(
        'relative min-h-64 min-w-0 bg-[var(--kokpit-surface-1)] border rounded-[var(--radius-lg)] flex flex-col transition-colors duration-[var(--motion-default)] hover:border-[var(--kokpit-border-strong)]',
        link.isFavorite
          ? 'border-[var(--kokpit-accent)]/30'
          : 'border-[var(--kokpit-border-subtle)]',
        className,
      )}
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${link.name}`}
        className="group/link relative flex min-w-0 flex-1 flex-col items-start gap-5 rounded-[var(--radius-lg)] p-5 cursor-pointer focus-visible:outline-offset-[-4px]"
        title={`Open ${link.name} (${link.url})`}
      >
        <div className="w-14 h-14 rounded-xl bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-secondary)] flex items-center justify-center border border-[var(--kokpit-border-subtle)] group-hover/link:border-[var(--kokpit-border-strong)] transition-colors shrink-0">
          <QuickLinkIcon
            iconType={link.iconType}
            iconValue={link.iconValue}
            name={link.name}
            size="lg"
          />
        </div>

        <ExternalLink
          aria-hidden="true"
          className="absolute right-5 top-5 h-3.5 w-3.5 text-[var(--kokpit-text-muted)] group-hover/link:text-[var(--kokpit-accent)] transition-colors"
        />

        <div className="min-w-0 w-full space-y-1.5">
          <h3 className="font-ui font-medium text-base text-[var(--kokpit-text-primary)] group-hover/link:text-[var(--kokpit-accent)] transition-colors break-words [overflow-wrap:anywhere] min-w-0 max-w-full">
            {link.name}
          </h3>
          {link.groupName && (
            <p className="font-ui text-xs text-[var(--kokpit-text-secondary)] max-w-full break-words [overflow-wrap:anywhere]">
              {link.groupName}
            </p>
          )}
          <p className="font-ui text-xs text-[var(--kokpit-text-muted)] break-words [overflow-wrap:anywhere]">
            {domain}
          </p>
        </div>
      </a>

      <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-2 border-t border-[var(--kokpit-border-subtle)] px-3 py-2">
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center gap-1 text-[var(--kokpit-text-muted)]">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={onMoveUp}
              aria-label="Move link up"
              title="Move link up"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--kokpit-surface-hover)] hover:text-[var(--kokpit-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={onMoveDown}
              aria-label="Move link down"
              title="Move link down"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--kokpit-surface-hover)] hover:text-[var(--kokpit-accent)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteMutation.isPending}
            aria-label={link.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            aria-pressed={link.isFavorite}
            title={link.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
              link.isFavorite
                ? 'text-[var(--kokpit-accent)] hover:bg-[var(--kokpit-accent-bg)]'
                : 'text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-surface-hover)]',
            )}
          >
            <Star className={cn('w-4 h-4', link.isFavorite && 'fill-current')} />
          </button>

          {showConfirmDelete ? (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="min-h-8 px-2 py-1 rounded bg-[var(--kokpit-danger-bg)] text-[var(--kokpit-text-primary)] text-xs font-ui border border-[var(--kokpit-danger)]/30 hover:border-[var(--kokpit-danger)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Delete?
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="min-h-8 px-1.5 py-1 rounded text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(link)}
                aria-label="Edit shortcut"
                title="Edit shortcut"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-surface-hover)] transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                aria-label="Delete shortcut"
                title="Delete shortcut"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-danger)] hover:bg-[var(--kokpit-danger-bg)] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {(toggleFavoriteMutation.isError || deleteMutation.isError) && (
        <p role="alert" className="px-5 pb-4 text-sm text-[var(--kokpit-text-primary)]">
          {deleteMutation.isError
            ? 'Could not delete this shortcut. Please try again.'
            : 'Could not update this favorite. Please try again.'}
        </p>
      )}
    </div>
  );
}
