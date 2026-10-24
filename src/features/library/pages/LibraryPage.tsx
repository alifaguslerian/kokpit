import { useRef, useState, useMemo } from 'react';
import { Bookmark, Plus, Star, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/lib/cn';
import { useQuickLinks, useReorderQuickLinks } from '../api/use-quick-links';
import { QuickLinkCard } from '../components/QuickLinkCard';
import { QuickLinkModal } from '../components/QuickLinkModal';
import type { QuickLink } from '../types';

export function LibraryPage() {
  const reordering = useRef(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);

  const { data: links = [], isLoading, isError, refetch } = useQuickLinks();
  const reorderMutation = useReorderQuickLinks();

  // Extract all unique group names
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => {
      if (l.groupName) set.add(l.groupName);
    });
    return Array.from(set).sort();
  }, [links]);

  // Filter links
  const filteredLinks = useMemo(() => {
    if (selectedFilter === 'all') return links;
    if (selectedFilter === 'favorites') return links.filter((l) => l.isFavorite);
    return links.filter((l) => l.groupName === selectedFilter);
  }, [links, selectedFilter]);

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link: QuickLink) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleMove = (currentIndex: number, targetIndex: number) => {
    if (reordering.current) return;
    if (targetIndex < 0 || targetIndex >= filteredLinks.length) return;
    const currentItem = filteredLinks[currentIndex];
    const targetItem = filteredLinks[targetIndex];
    if (!currentItem || !targetItem) return;

    // Swap positions in full links array
    const newOrderedIds = [...links.map((l) => l.id)];
    const fromPos = newOrderedIds.indexOf(currentItem.id);
    const toPos = newOrderedIds.indexOf(targetItem.id);
    if (fromPos === -1 || toPos === -1) return;

    newOrderedIds.splice(fromPos, 1);
    newOrderedIds.splice(toPos, 0, currentItem.id);

    reordering.current = true;
    reorderMutation.mutate(newOrderedIds, {
      onSettled: () => {
        reordering.current = false;
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quick Launch & Portals"
        title="Library"
        description="Personal shortcuts, daily links, and portals."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void refetch()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenAddModal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Shortcut
            </Button>
          </div>
        }
      />

      {/* Category Tabs */}
      <section aria-label="Shortcut categories" className="pt-2">
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[var(--kokpit-border-subtle)]">
          <button
            type="button"
            aria-pressed={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            className={cn(
              'max-w-full min-h-9 break-words [overflow-wrap:anywhere] text-left px-3 py-1.5 rounded-lg text-sm font-ui border transition-colors cursor-pointer',
              selectedFilter === 'all'
                ? 'bg-[var(--kokpit-surface-3)] text-[var(--kokpit-text-primary)] border-[var(--kokpit-border-strong)] font-medium shadow-xs'
                : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)]',
            )}
          >
            All ({links.length})
          </button>

          <button
            type="button"
            aria-pressed={selectedFilter === 'favorites'}
            onClick={() => setSelectedFilter('favorites')}
            className={cn(
              'inline-flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-ui border transition-colors cursor-pointer',
              selectedFilter === 'favorites'
                ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/50 font-medium shadow-xs'
                : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)]',
            )}
          >
            <Star className={cn('w-3.5 h-3.5', selectedFilter === 'favorites' && 'fill-current')} />
            <span>Favorites</span>
          </button>

          {availableGroups.map((group) => {
            const isSelected = selectedFilter === group;
            return (
              <button
                key={group}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedFilter(group)}
                className={cn(
                  'max-w-full min-h-9 break-words [overflow-wrap:anywhere] text-left px-3 py-1.5 rounded-lg text-sm font-ui border transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[var(--kokpit-surface-3)] text-[var(--kokpit-text-primary)] border-[var(--kokpit-border-strong)] font-medium'
                    : 'bg-[var(--kokpit-surface-1)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)]',
                )}
              >
                {group}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid of Shortcuts */}
      <section aria-label="Shortcuts list" className="pt-2">
        {reorderMutation.isError && (
          <p role="alert" className="mb-3 text-sm text-[var(--kokpit-text-primary)]">
            Could not reorder shortcuts. Please try moving the shortcut again.
          </p>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[90rem]:grid-cols-4 gap-4 min-[90rem]:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="min-h-64 min-w-0 bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col items-start gap-5"
              >
                <Skeleton className="w-14 h-14 rounded-xl" />
                <div className="w-full space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load shortcuts"
            message="Please check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : filteredLinks.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<Bookmark className="w-6 h-6 text-[var(--kokpit-accent)]" />}
              title={
                selectedFilter === 'all'
                  ? 'Your library is empty'
                  : `No shortcuts in ${selectedFilter}`
              }
              description={
                selectedFilter === 'all'
                  ? 'Add your most visited tools, courses, and daily websites to launch them with one click.'
                  : 'No shortcuts match this category filter. Try selecting "All" or create a new one.'
              }
              action={
                <Button size="sm" onClick={handleOpenAddModal}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Shortcut
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[90rem]:grid-cols-4 gap-4 min-[90rem]:gap-6">
            {filteredLinks.map((link, idx) => (
              <QuickLinkCard
                key={link.id}
                link={link}
                onEdit={handleOpenEditModal}
                onMoveUp={
                  idx > 0
                    ? () => {
                        void handleMove(idx, idx - 1);
                      }
                    : undefined
                }
                onMoveDown={
                  idx < filteredLinks.length - 1
                    ? () => {
                        void handleMove(idx, idx + 1);
                      }
                    : undefined
                }
                canMoveUp={idx > 0 && !reorderMutation.isPending}
                canMoveDown={idx < filteredLinks.length - 1 && !reorderMutation.isPending}
              />
            ))}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="min-h-64 min-w-0 flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--kokpit-border-default)] bg-transparent p-5 text-sm font-ui text-[var(--kokpit-text-muted)] hover:bg-[var(--kokpit-surface-1)] hover:text-[var(--kokpit-text-primary)] hover:border-[var(--kokpit-border-strong)] transition-colors cursor-pointer"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--kokpit-surface-2)]">
                <Plus className="h-6 w-6" aria-hidden="true" />
              </span>
              Add Shortcut
            </button>
          </div>
        )}
      </section>

      {/* Add / Edit Modal */}
      <QuickLinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLink(null);
        }}
        link={editingLink}
      />
    </PageContainer>
  );
}
