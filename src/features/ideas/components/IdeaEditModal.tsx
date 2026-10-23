import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { X, Pin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { useUpdateIdea } from '../api/use-ideas';
import type { Idea } from '../types';

interface IdeaEditModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
}

interface IdeaEditFormProps {
  idea: Idea;
  onClose: () => void;
}

function IdeaEditForm({ idea, onClose }: IdeaEditFormProps) {
  const submitting = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState(idea.title ?? '');
  const [content, setContent] = useState(idea.content);
  const [tags, setTags] = useState<string[]>([...idea.tags]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(idea.isPinned);

  const updateIdeaMutation = useUpdateIdea();

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && trimmed.length <= 50 && tags.length < 20 && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting.current) return;
    submitting.current = true;
    setErrorMessage('');
    try {
      await updateIdeaMutation.mutateAsync({
        id: idea.id,
        input: {
          title: title.trim() ? title.trim() : null,
          content: trimmedContent,
          isPinned,
          tags,
        },
      });
      onClose();
    } catch {
      setErrorMessage('Could not save your changes. Your draft is here; please try again.');
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Dialog
      isOpen
      onClose={() => {
        if (!submitting.current) onClose();
      }}
      labelledBy="edit-idea-title"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <h2
          id="edit-idea-title"
          className="font-ui font-medium text-base text-[var(--kokpit-text-primary)]"
        >
          Edit Thought
        </h2>
        <button
          type="button"
          disabled={updateIdeaMutation.isPending}
          onClick={onClose}
          aria-label="Close dialog"
          className="p-1 rounded text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
        {errorMessage && (
          <p role="alert" className="text-sm text-[var(--kokpit-text-primary)]">
            {errorMessage}
          </p>
        )}
        <fieldset disabled={updateIdeaMutation.isPending} className="min-w-0 space-y-3.5">
          <div>
            <label
              htmlFor="edit-idea-title-input"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Title (Optional)
            </label>
            <input
              id="edit-idea-title-input"
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thought a title..."
              maxLength={200}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-base transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="edit-idea-content-input"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Content
            </label>
            <textarea
              id="edit-idea-content-input"
              maxLength={10000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] p-3 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-sm transition-colors resize-none leading-relaxed"
            />
          </div>

          <div>
            <label
              htmlFor="edit-idea-tag-input"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Tags ({tags.length}/20)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="max-w-full break-all inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border border-[var(--kokpit-accent)]/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3 shrink-0" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-idea-tag-input"
                maxLength={50}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag and press Enter..."
                className="min-w-0 flex-1 bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] px-3 py-1.5 rounded-lg border border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={tags.length >= 20}
                onClick={handleAddTag}
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--kokpit-border-subtle)]">
            <button
              type="button"
              onClick={() => setIsPinned((prev) => !prev)}
              aria-pressed={isPinned}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui border transition-colors cursor-pointer',
                isPinned
                  ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/40 font-medium'
                  : 'bg-transparent text-[var(--kokpit-text-muted)] border-transparent hover:text-[var(--kokpit-text-secondary)] hover:bg-white/[0.04]',
              )}
            >
              <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
              <span>{isPinned ? 'Pinned' : 'Pin thought'}</span>
            </button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={updateIdeaMutation.isPending}
                disabled={!content.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

export function IdeaEditModal({ idea, isOpen, onClose }: IdeaEditModalProps) {
  if (!isOpen || !idea) return null;
  return <IdeaEditForm key={idea.id} idea={idea} onClose={onClose} />;
}
