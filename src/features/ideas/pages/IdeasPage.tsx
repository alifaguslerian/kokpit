import { useState, useMemo } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { useIdeas } from '../api/use-ideas';
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
    data: ideas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useIdeas({
    q: searchQuery.trim() || undefined,
    tag: selectedTag || undefined,
    pinned: pinnedOnly ? true : undefined,
  });

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
    <PageContainer>
      {/* Editorial Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--kokpit-accent)] font-medium">
            Personal Notes & Thinking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--kokpit-text-primary)] mt-1 font-normal tracking-tight">
            Ideas & Reflections
          </h1>
          <p className="font-ui text-sm text-[var(--kokpit-text-secondary)] mt-1 max-w-xl">
            A quiet space for spontaneous thoughts, questions, and notes. Pinned items stay at the
            top.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="self-start sm:self-auto text-xs"
        >
          Refresh
        </Button>
      </header>

      {/* Prominent Frictionless Composer */}
      <section aria-label="Compose new thought">
        <IdeaComposer />
      </section>

      {/* Filter and Search Bar */}
      <section aria-label="Filter and search thoughts" className="pt-2">
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

      {/* Content Stream / Grid */}
      <section aria-label="Ideas list" className="pt-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
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
        ) : isError ? (
          <ErrorState
            title="Failed to load ideas"
            message={error instanceof Error ? error.message : 'Please check your connection.'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
