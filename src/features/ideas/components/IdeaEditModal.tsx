import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { X, Pin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  const [title, setTitle] = useState(idea.title ?? '');
  const [content, setContent] = useState(idea.content);
  const [tags, setTags] = useState<string[]>([...idea.tags]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(idea.isPinned);

  const updateIdeaMutation = useUpdateIdea();

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
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
    if (!trimmedContent || updateIdeaMutation.isPending) return;

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
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-idea-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-strong)] rounded-[var(--radius-lg)] p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
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
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="edit-idea-title-input"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Title (Optional)
            </label>
            <input
              id="edit-idea-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thought a title..."
              maxLength={200}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-serif text-base transition-colors"
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] p-3 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-sm transition-colors resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border border-[var(--kokpit-accent)]/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag and press Enter..."
                className="flex-1 bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] px-3 py-1.5 rounded-lg border border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--kokpit-border-subtle)]">
            <button
              type="button"
              onClick={() => setIsPinned((prev) => !prev)}
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
        </form>
      </div>
    </div>
  );
}

export function IdeaEditModal({ idea, isOpen, onClose }: IdeaEditModalProps) {
  if (!isOpen || !idea) return null;
  return <IdeaEditForm key={idea.id} idea={idea} onClose={onClose} />;
}
