import { useState, useMemo } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useInfiniteIdeas } from '../api/use-ideas';
import { IdeaComposer } from '../components/IdeaComposer';
import { IdeaCard } from '../components/IdeaCard';
import { IdeasFilterBar } from '../components/IdeasFilterBar';
import { IdeaEditModal } from '../components/IdeaEditModal';
import type { Idea } from '../types';

export function IdeasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteIdeas({
    q: searchQuery.trim() || undefined,
    tag: selectedTag || undefined,
    pinned: pinnedOnly ? true : undefined,
  });
  const ideas = useMemo(() => data?.pages.flat() ?? [], [data]);

  // Extract all unique tags across existing ideas
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((idea) => {
      idea.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [ideas]);

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedTag || pinnedOnly);

  return (
    <PageContainer className="max-w-[1040px]!">
      <PageHeader
        eyebrow="Personal Notes & Thinking"
        title="Ideas & Reflections"
        description="A quiet space for spontaneous thoughts, questions, and notes. Pinned items stay at the top."
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      <section aria-label="Compose new thought" className="space-y-3">
        <h2 className="font-ui text-base font-medium text-[var(--kokpit-text-primary)]">
          Capture a thought
        </h2>
        <IdeaComposer className="border-[var(--kokpit-border-strong)] bg-[var(--kokpit-surface-2)] p-5 sm:p-6 [&_textarea]:min-h-32 [&_textarea]:bg-[var(--kokpit-surface-1)] [&_textarea]:text-base" />
      </section>

      <section aria-label="Filter and search thoughts">
        <IdeasFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          pinnedOnly={pinnedOnly}
          onPinnedOnlyChange={setPinnedOnly}
          availableTags={availableTags}
          totalCount={ideas.length}
        />
      </section>

      <section aria-label="Ideas list" className="space-y-4">
        <h2 className="font-ui text-lg font-semibold text-[var(--kokpit-text-primary)]">
          Saved thoughts
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] rounded-[var(--radius-lg)] p-5 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="w-16 h-4" />
                  <Skeleton className="w-12 h-4" />
                </div>
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-12" />
                <div className="flex gap-1.5 pt-2">
                  <Skeleton className="w-12 h-5 rounded" />
                  <Skeleton className="w-16 h-5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError && ideas.length === 0 ? (
          <ErrorState
            title="Failed to load ideas"
            message="Please check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : ideas.length === 0 ? (
          <div className="py-8">
            {hasActiveFilters ? (
              <EmptyState
                icon={<Lightbulb className="w-6 h-6 text-[var(--kokpit-text-muted)]" />}
                title="No thoughts found"
                description="No saved thoughts match your search or selected tags. Try clearing filters."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                      setPinnedOnly(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Lightbulb className="w-6 h-6 text-[var(--kokpit-accent)]" />}
                title="Your desk is quiet"
                description="Use the composer above to jot down your first spontaneous thought, quote, or reminder."
              />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEdit={(item) => setEditingIdea(item)}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        )}
        {ideas.length > 0 && (hasNextPage || isFetchNextPageError) && (
          <div className="mt-5 flex flex-col items-center gap-2">
            {isFetchNextPageError && (
              <p role="alert" className="text-sm text-[var(--kokpit-text-primary)]">
                Could not load more thoughts. Your loaded thoughts are still here.
              </p>
            )}
            <Button
              variant="secondary"
              isLoading={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchNextPageError ? 'Retry loading more' : 'Load more thoughts'}
            </Button>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <IdeaEditModal
        idea={editingIdea}
        isOpen={Boolean(editingIdea)}
        onClose={() => setEditingIdea(null)}
      />
    </PageContainer>
  );
}
