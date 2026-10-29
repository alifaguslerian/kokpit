import { useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { useChangeCollection, useIdeaCollections } from '../api/use-idea-collections';

export function CollectionManager({ onClose }: { onClose: () => void }) {
  const { data: collections = [], isLoading, isError, refetch } = useIdeaCollections();
  const change = useChangeCollection();
  const pending = useRef(false);
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [rename, setRename] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const run = async (input: Parameters<typeof change.mutateAsync>[0], done?: () => void) => {
    if (pending.current) return;
    pending.current = true;
    setError('');
    try {
      await change.mutateAsync(input);
      done?.();
    } catch (cause) {
      setError(
        cause instanceof ApiClientError && cause.status === 409
          ? 'That collection name is already in use. Choose another name.'
          : 'Could not update collections. Your changes are here; please try again.',
      );
    } finally {
      pending.current = false;
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) void run({ type: 'create', name: name.trim() }, () => setName(''));
  };
  const move = (index: number, next: number) => {
    const ids = collections.map((item) => item.id);
    [ids[index], ids[next]] = [ids[next]!, ids[index]!];
    void run({ type: 'reorder', ids });
  };
  const inputClass =
    'w-full min-h-11 rounded-xl border border-[var(--kokpit-border-default)] bg-[var(--kokpit-surface-2)] px-3 text-sm';
  return (
    <Dialog
      isOpen
      onClose={() => {
        if (!pending.current) onClose();
      }}
      labelledBy="collections-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="collections-title" className="text-lg font-medium">
          Collections
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={change.isPending}
          aria-label="Close collections"
          className="flex size-11 items-center justify-center rounded-xl hover:bg-[var(--kokpit-surface-hover)]"
        >
          <X className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-sm text-[var(--kokpit-text-secondary)]">
        Keep related thoughts together. Deleting a collection keeps its ideas.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="mt-5 space-y-2">
        <label htmlFor="collection-name" className="block text-sm">
          Collection name
        </label>
        <input
          id="collection-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          disabled={change.isPending}
          className={inputClass}
        />
        <Button type="submit" disabled={!name.trim()} isLoading={change.isPending}>
          Create collection
        </Button>
      </form>
      {isLoading && (
        <p role="status" className="mt-5 text-sm">
          Loading collections…
        </p>
      )}
      {isError && (
        <div className="mt-5">
          <p role="alert">Could not load collections.</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry collections
          </Button>
        </div>
      )}
      <ul className="mt-5 divide-y divide-[var(--kokpit-border-default)]">
        {collections.map((collection, index) => (
          <li key={collection.id} className="min-w-0 py-4">
            {renaming === collection.id ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (rename.trim())
                    void run({ type: 'rename', id: collection.id, name: rename.trim() }, () =>
                      setRenaming(null),
                    );
                }}
              >
                <label htmlFor="rename-collection" className="block text-sm">
                  Rename collection
                </label>
                <input
                  id="rename-collection"
                  value={rename}
                  onChange={(event) => setRename(event.target.value)}
                  maxLength={80}
                  required
                  disabled={change.isPending}
                  className={inputClass}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={!rename.trim() || change.isPending}>
                    Save name
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={change.isPending}
                    onClick={() => setRenaming(null)}
                  >
                    Cancel rename
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">
                  {collection.name}
                </p>
                <p className="mt-1 text-xs text-[var(--kokpit-text-muted)]">
                  {collection.ideaCount} {collection.ideaCount === 1 ? 'idea' : 'ideas'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-label={`Move ${collection.name} up`}
                    disabled={index === 0 || change.isPending}
                    onClick={() => move(index, index - 1)}
                    className="flex size-11 items-center justify-center rounded-xl hover:bg-[var(--kokpit-surface-hover)] disabled:opacity-40"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${collection.name} down`}
                    disabled={index === collections.length - 1 || change.isPending}
                    onClick={() => move(index, index + 1)}
                    className="flex size-11 items-center justify-center rounded-xl hover:bg-[var(--kokpit-surface-hover)] disabled:opacity-40"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <Button
                    variant="ghost"
                    aria-label={`Rename ${collection.name}`}
                    disabled={change.isPending}
                    onClick={() => {
                      setRenaming(collection.id);
                      setRename(collection.name);
                      setDeleting(null);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label={`Delete ${collection.name}`}
                    disabled={change.isPending}
                    onClick={() => setDeleting(collection.id)}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
            {deleting === collection.id && (
              <div className="mt-3 space-y-2">
                <p className="text-sm">
                  Delete this collection? Its ideas will remain uncollected.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={change.isPending}
                    onClick={() =>
                      void run({ type: 'delete', id: collection.id }, () => setDeleting(null))
                    }
                  >
                    Confirm delete collection
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={change.isPending}
                    onClick={() => setDeleting(null)}
                  >
                    Keep collection
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!isLoading && !isError && !collections.length && (
        <p className="mt-5 text-sm text-[var(--kokpit-text-secondary)]">
          No collections yet. Create one above when a few thoughts belong together.
        </p>
      )}
    </Dialog>
  );
}
