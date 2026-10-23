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
    void toggleFavoriteMutation.mutateAsync({
      id: link.id,
      isFavorite: !link.isFavorite,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    void deleteMutation.mutateAsync(link.id);
  };

  return (
    <div
      className={cn(
        'group relative bg-[var(--kokpit-surface-1)] border rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-card)] flex items-center justify-between gap-3 transition-all duration-[var(--motion-default)] hover:border-[var(--kokpit-border-strong)] hover:shadow-md',
        link.isFavorite
          ? 'border-[var(--kokpit-accent)]/30'
          : 'border-[var(--kokpit-border-default)]',
        className,
      )}
    >
      {/* Left Icon and Details */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3.5 flex-1 min-w-0 group/link cursor-pointer"
        title={`Open ${link.name} (${link.url})`}
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--kokpit-surface-2)] flex items-center justify-center border border-[var(--kokpit-border-default)] group-hover/link:border-[var(--kokpit-accent)]/50 group-hover/link:scale-105 transition-all shrink-0 shadow-xs">
          <QuickLinkIcon
            iconType={link.iconType}
            iconValue={link.iconValue}
            name={link.name}
            size="md"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)] group-hover/link:text-[var(--kokpit-accent)] transition-colors truncate">
              {link.name}
            </h3>
            {link.groupName && (
              <span className="font-ui text-[10px] text-[var(--kokpit-text-muted)] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] shrink-0">
                {link.groupName}
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-[var(--kokpit-text-muted)] truncate mt-0.5">
            {domain}
          </p>
        </div>
      </a>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Reorder Arrows */}
        {(onMoveUp || onMoveDown) && (
          <div className="hidden sm:flex items-center flex-col opacity-40 group-hover:opacity-80 transition-opacity">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={onMoveUp}
              aria-label="Move link up"
              className="p-0.5 hover:text-[var(--kokpit-accent)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={onMoveDown}
              aria-label="Move link down"
              className="p-0.5 hover:text-[var(--kokpit-accent)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={toggleFavoriteMutation.isPending}
          aria-label={link.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          title={link.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          className={cn(
            'p-1.5 rounded-lg transition-colors cursor-pointer',
            link.isFavorite
              ? 'text-[var(--kokpit-accent)] hover:bg-[var(--kokpit-accent-bg)]'
              : 'text-[var(--kokpit-text-soft)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04]',
          )}
        >
          <Star className={cn('w-4 h-4', link.isFavorite && 'fill-current')} />
        </button>

        {/* External Launch */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${link.name}`}
          title={`Open ${link.name}`}
          className="p-1.5 rounded-lg text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Edit & Delete Controls */}
        {showConfirmDelete ? (
          <div className="flex items-center gap-1 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-2 py-1 rounded bg-[var(--kokpit-danger-bg)] text-[var(--kokpit-danger)] text-xs font-ui border border-[var(--kokpit-danger)]/30 hover:bg-[var(--kokpit-danger)] hover:text-white transition-colors cursor-pointer"
            >
              Delete?
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-1.5 py-1 rounded text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              aria-label="Delete shortcut"
              title="Delete shortcut"
              className="p-1.5 rounded-lg text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-danger)] hover:bg-[var(--kokpit-danger-bg)] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
