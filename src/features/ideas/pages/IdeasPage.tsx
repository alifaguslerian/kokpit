import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, RefreshCw, Folder, Star, Plus, Grid2X2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInfiniteIdeas, useIdeas, useUpdateIdea, useUnavailableIdeaIds } from '../api/use-ideas';
import { useIdeaCollections } from '../api/use-idea-collections';
import { IdeaComposer } from '../components/IdeaComposer';
import { IdeaCard, IdeaCover } from '../components/IdeaCard';
import { IdeasFilterBar } from '../components/IdeasFilterBar';
import { IdeaEditModal } from '../components/IdeaEditModal';
import { CollectionManager } from '../components/CollectionManager';
import type { Idea } from '../types';

function FavoriteRow({
  idea,
  onEdit,
  unavailable,
}: {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  unavailable: boolean;
}) {
  const favorite = useUpdateIdea();
  return (
    <li className="flex min-w-0 flex-wrap items-center gap-2 border-t border-[var(--kokpit-border-default)] py-3">
      <button
        type="button"
        aria-label={`Open thought ${idea.title || 'Untitled'}`}
        onClick={() => onEdit(idea)}
        disabled={unavailable}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
      >
        <IdeaCover url={idea.coverUrl} className="size-16 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0">
          <span className="line-clamp-2 break-words text-sm font-medium [overflow-wrap:anywhere]">
            {idea.title || idea.content}
          </span>
          {idea.title && (
            <span className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-[var(--kokpit-text-secondary)] [overflow-wrap:anywhere]">
              {idea.content}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${idea.title || 'thought'} from favorites`}
        disabled={favorite.isPending || unavailable}
        onClick={() => favorite.mutate({ id: idea.id, input: { isFavorite: false } })}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[var(--kokpit-accent)] hover:bg-[var(--kokpit-surface-hover)] disabled:opacity-50"
      >
        <Star className="size-5 fill-current" />
      </button>
      {favorite.isError && (
        <p role="alert" className="w-full text-xs">
          Could not update favorite. Try again.
        </p>
      )}
    </li>
  );
}

export function IdeasPage() {
  const [params, setParams] = useSearchParams();
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [manager, setManager] = useState(false);
  const unavailableIds = useUnavailableIdeaIds();
  const openIdea = (idea: Idea) => {
    if (!unavailableIds.includes(idea.id)) setEditingIdea({ ...idea });
  };
  if (editingIdea && unavailableIds.includes(editingIdea.id)) setEditingIdea(null);
  const [previousQuery, setPreviousQuery] = useState(params.toString());
  if (previousQuery !== params.toString()) {
    setPreviousQuery(params.toString());
    setEditingIdea(null);
  }
  const searchQuery = (params.get('q') ?? '').slice(0, 200);
  const selectedTag = params.get('tag');
  const pinnedOnly = params.get('pinned') === 'true';
  const favoriteOnly = params.get('favorite') === 'true';
  const collectionId = params.get('collection');
  const collections = useIdeaCollections();
  const collection = collections.data?.find((item) => item.id === collectionId);
  const selectionUnknown = Boolean(collectionId && collections.isSuccess && !collection);
  const filters = {
    q: searchQuery.trim() || undefined,
    tag: selectedTag || undefined,
    pinned: pinnedOnly ? true : undefined,
    favorite: favoriteOnly ? true : undefined,
    collectionId: collectionId || undefined,
  };
  const list = useInfiniteIdeas(filters);
  const ideas = useMemo(() => list.data?.pages.flat() ?? [], [list.data]);
  const favorites = useIdeas({ favorite: true, sort: 'updated', limit: 3 });
  const availableTags = useMemo(
    () =>
      [
        ...new Set([...ideas.flatMap((idea) => idea.tags), ...(selectedTag ? [selectedTag] : [])]),
      ].sort(),
    [ideas, selectedTag],
  );
  const changeFilter = (key: string, value: string | null) => {
    setEditingIdea(null);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };
  const clear = () => {
    setEditingIdea(null);
    setParams({});
  };
  const panel =
    'min-w-0 rounded-[var(--radius-lg)] border border-[var(--kokpit-border-strong)] bg-[var(--kokpit-room-panel)] p-4 sm:p-5';
  return (
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-ui text-[28px] min-[90rem]:text-[34px] font-medium leading-tight tracking-tight break-words">
            Ideas
          </h1>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-normal italic text-[var(--kokpit-text-secondary)] sm:text-3xl">
            A place for thoughts to land.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void list.refetch();
            void collections.refetch();
            void favorites.refetch();
          }}
          leftIcon={<RefreshCw className="size-3.5" />}
        >
          Refresh
        </Button>
      </header>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-4">
          <section aria-label="Compose new thought">
            <IdeaComposer paper />
          </section>
          <section aria-label="Ideas list" className={panel}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <Grid2X2 className="size-5" />
                {favoriteOnly ? 'Favorite Ideas' : 'All Ideas'}
              </h2>
              {(collectionId || favoriteOnly) && (
                <Button variant="ghost" size="sm" onClick={clear}>
                  Back to all ideas
                </Button>
              )}
            </div>
            {collection && (
              <p className="mb-3 break-words text-sm text-[var(--kokpit-accent-hover)] [overflow-wrap:anywhere]">
                Collection: {collection.name}
              </p>
            )}
            <IdeasFilterBar
              searchQuery={searchQuery}
              onSearchChange={(value) => changeFilter('q', value)}
              selectedTag={selectedTag}
              onTagSelect={(value) => changeFilter('tag', value)}
              pinnedOnly={pinnedOnly}
              onPinnedOnlyChange={(value) => changeFilter('pinned', value ? 'true' : null)}
              availableTags={availableTags}
              totalCount={ideas.length}
            />
            <div className="mt-4">
              {selectionUnknown ? (
                <EmptyState
                  title="Collection unavailable"
                  description="This collection no longer exists or is not available in your room."
                  action={
                    <Button variant="secondary" onClick={clear}>
                      Back to all ideas
                    </Button>
                  }
                />
              ) : list.isLoading ? (
                <div
                  role="status"
                  aria-label="Loading ideas"
                  className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"
                >
                  {[1, 2, 3].map((value) => (
                    <Skeleton key={value} className="h-56 w-full rounded-xl" />
                  ))}
                </div>
              ) : list.isError && !ideas.length ? (
                <ErrorState
                  title="Failed to load ideas"
                  message="Please check your connection and try again."
                  onRetry={() => void list.refetch()}
                />
              ) : !ideas.length ? (
                <EmptyState
                  icon={<Lightbulb className="size-6" />}
                  title={params.size ? 'No thoughts found' : 'Your desk is quiet'}
                  description={
                    params.size
                      ? 'No saved thoughts match these filters.'
                      : 'Write a thought above before it disappears.'
                  }
                  action={
                    params.size ? (
                      <Button variant="secondary" onClick={clear}>
                        Clear All Filters
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid items-start gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onEdit={openIdea}
                      onTagClick={(value) => changeFilter('tag', value)}
                    />
                  ))}
                </div>
              )}
            </div>
            {list.isError && ideas.length > 0 && (
              <p role="alert" className="mt-3 text-sm">
                Ideas could not refresh. Your loaded thoughts are still here.
              </p>
            )}
            {ideas.length > 0 && (list.hasNextPage || list.isFetchNextPageError) && (
              <div className="mt-5 flex flex-col items-center gap-2">
                {list.isFetchNextPageError && (
                  <p role="alert" className="text-sm">
                    Could not load more thoughts. Your loaded thoughts are still here.
                  </p>
                )}
                <Button
                  variant="secondary"
                  isLoading={list.isFetchingNextPage}
                  onClick={() => void list.fetchNextPage()}
                >
                  {list.isFetchNextPageError ? 'Retry loading more' : 'Load more thoughts'}
                </Button>
              </div>
            )}
          </section>
        </div>
        <div className="min-w-0 space-y-4">
          <section aria-label="Collections" className={panel}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <Folder className="size-5 text-[var(--kokpit-accent)]" />
                Collections
              </h2>
              <Button
                variant="ghost"
                size="sm"
                aria-label="View all collections"
                onClick={() => setManager(true)}
              >
                View all
              </Button>
            </div>
            {collections.isLoading ? (
              <p role="status" className="text-sm">
                Loading collections…
              </p>
            ) : collections.isError ? (
              <ErrorState
                title="Collections unavailable"
                message="Please try loading collections again."
                onRetry={() => void collections.refetch()}
              />
            ) : collections.data?.length ? (
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                {collections.data.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Filter collection ${item.name}`}
                    aria-pressed={collectionId === item.id}
                    onClick={() => changeFilter('collection', item.id)}
                    className="flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-[var(--kokpit-border-default)] bg-[var(--kokpit-surface-1)] p-3 text-left text-sm hover:bg-[var(--kokpit-surface-hover)] aria-pressed:border-[var(--kokpit-accent)]"
                  >
                    <Folder className="size-7 shrink-0 text-[var(--kokpit-accent)]" />
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                      {item.name}
                      <span className="mt-1 block text-xs text-[var(--kokpit-text-muted)]">
                        {item.ideaCount} {item.ideaCount === 1 ? 'idea' : 'ideas'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--kokpit-text-secondary)]">
                No collections yet. Give related thoughts a place when you need one.
              </p>
            )}
            <Button
              variant="secondary"
              className="mt-3 w-full"
              leftIcon={<Plus className="size-4" />}
              onClick={() => setManager(true)}
            >
              New collection
            </Button>
          </section>
          <section aria-label="Favorite Ideas" className={panel}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <Star className="size-5 text-[var(--kokpit-accent)]" />
                Favorite Ideas
              </h2>
              <Button
                variant="ghost"
                size="sm"
                aria-label="View all favorites"
                onClick={() => {
                  setEditingIdea(null);
                  setParams({ favorite: 'true' });
                }}
              >
                View all
              </Button>
            </div>
            {favorites.isLoading ? (
              <p role="status" className="text-sm">
                Loading favorite ideas…
              </p>
            ) : favorites.isError ? (
              <ErrorState
                title="Favorites unavailable"
                message="Please try loading favorites again."
                onRetry={() => void favorites.refetch()}
              />
            ) : favorites.data?.length ? (
              <ul>
                {favorites.data.map((idea) => (
                  <FavoriteRow
                    key={idea.id}
                    idea={idea}
                    onEdit={openIdea}
                    unavailable={unavailableIds.includes(idea.id)}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--kokpit-text-secondary)]">
                Star a thought to keep it close. Pins and favorites are separate.
              </p>
            )}
          </section>
        </div>
      </div>
      <IdeaEditModal
        idea={editingIdea}
        isOpen={Boolean(editingIdea)}
        onClose={() => setEditingIdea((current) => (current === editingIdea ? null : current))}
      />
      {manager && <CollectionManager onClose={() => setManager(false)} />}
    </PageContainer>
  );
}
