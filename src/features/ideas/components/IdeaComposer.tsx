import { useId, useRef, useState, type KeyboardEvent, type FormEvent } from 'react';
import { Pin, Plus, X, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useCreateIdea } from '../api/use-ideas';

const SUGGESTED_TAGS = ['Idea', 'Question', 'To-do', 'College', 'Personal', 'Music'];

interface IdeaComposerProps {
  onSuccess?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function IdeaComposer({ onSuccess, className, autoFocus = false }: IdeaComposerProps) {
  const formId = useId();
  const submitting = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const createIdeaMutation = useCreateIdea();

  const handleToggleTag = (tag: string) => {
    if (createIdeaMutation.isPending) return;
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 20 ? [...prev, tag] : prev,
    );
  };

  const handleAddCustomTag = () => {
    if (createIdeaMutation.isPending) return;
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (
      trimmed &&
      trimmed.length <= 50 &&
      selectedTags.length < 20 &&
      !selectedTags.includes(trimmed)
    ) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
    setShowCustomTagInput(false);
  };

  const handleCustomTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    } else if (e.key === 'Escape') {
      setShowCustomTagInput(false);
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting.current) return;
    submitting.current = true;
    setErrorMessage('');
    try {
      await createIdeaMutation.mutateAsync({
        title: title.trim() ? title.trim() : null,
        content: trimmedContent,
        isPinned,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setContent('');
      setTitle('');
      setShowTitleInput(false);
      setSelectedTags([]);
      setCustomTagInput('');
      setShowCustomTagInput(false);
      setIsPinned(false);
      onSuccess?.();
    } catch {
      setErrorMessage('Could not save your thought. Your draft is here; please try again.');
    } finally {
      submitting.current = false;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-default)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-card)] transition-all duration-[var(--motion-default)] hover:border-[var(--kokpit-border-strong)]',
        className,
      )}
    >
      <form onSubmit={(e) => void handleSubmit(e)}>
        {errorMessage && (
          <p role="alert" className="mb-3 text-sm text-[var(--kokpit-text-primary)]">
            {errorMessage}
          </p>
        )}
        <fieldset disabled={createIdeaMutation.isPending} className="min-w-0">
          {/* Optional Title input */}
          {showTitleInput ? (
            <>
              <label
                htmlFor={`${formId}-title`}
                className="block mb-1 text-xs text-[var(--kokpit-text-secondary)]"
              >
                Title (optional)
              </label>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  id={`${formId}-title`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)..."
                  maxLength={200}
                  className="min-w-0 flex-1 bg-transparent border-b border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent)] font-ui text-lg text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] pb-1.5 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setShowTitleInput(false);
                  }}
                  title="Remove title"
                  aria-label="Remove title"
                  className="p-1 text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : null}

          {/* Main Content Textarea */}
          <div className="relative">
            <label
              htmlFor={`${formId}-content`}
              className="block mb-1 text-xs text-[var(--kokpit-text-secondary)]"
            >
              Thought
            </label>
            <textarea
              id={`${formId}-content`}
              maxLength={10000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Jot down a fleeting thought, observation, or question..."
              rows={3}
              autoFocus={autoFocus}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] p-3 rounded-[var(--radius-md)] border border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent-muted)] focus:outline-none transition-all resize-none font-ui text-sm shadow-inner leading-relaxed"
            />
          </div>

          {/* Tags Selection Row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  aria-pressed={isSelected}
                  disabled={!isSelected && selectedTags.length >= 20}
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-ui border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/50 font-medium'
                      : 'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:border-[var(--kokpit-border-default)] hover:text-[var(--kokpit-text-primary)]',
                  )}
                >
                  #{tag}
                </button>
              );
            })}

            {/* Render extra custom tags */}
            {selectedTags
              .filter((t) => !SUGGESTED_TAGS.includes(t))
              .map((customTag) => (
                <button
                  key={customTag}
                  type="button"
                  onClick={() => handleToggleTag(customTag)}
                  className="max-w-full break-all inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-ui bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border border-[var(--kokpit-accent)]/50 font-medium transition-all cursor-pointer"
                >
                  <span>#{customTag}</span>
                  <X className="w-3 h-3 opacity-70 hover:opacity-100" />
                </button>
              ))}

            {/* Add custom tag button or input */}
            {showCustomTagInput ? (
              <div className="inline-flex flex-wrap items-center gap-1">
                <label
                  htmlFor={`${formId}-tag`}
                  className="text-xs text-[var(--kokpit-text-secondary)]"
                >
                  Custom tag
                </label>
                <input
                  id={`${formId}-tag`}
                  maxLength={50}
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagKeyDown}
                  onBlur={handleAddCustomTag}
                  autoFocus
                  placeholder="tag name..."
                  className="w-24 px-2 py-0.5 rounded text-xs bg-[var(--kokpit-surface-3)] text-[var(--kokpit-text-primary)] border border-[var(--kokpit-accent)] focus:outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomTagInput(true)}
                disabled={selectedTags.length >= 20}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-ui text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tag</span>
              </button>
            )}
          </div>

          {/* Actions & Submit Row */}
          <div className="mt-4 pt-3 border-t border-[var(--kokpit-border-subtle)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!showTitleInput && (
                <button
                  type="button"
                  onClick={() => setShowTitleInput(true)}
                  className="inline-flex items-center gap-1 text-xs font-ui text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-secondary)] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Title</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPinned((prev) => !prev)}
                aria-label={isPinned ? 'Unpin idea on save' : 'Pin idea on save'}
                aria-pressed={isPinned}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-ui border transition-colors cursor-pointer',
                  isPinned
                    ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/40 font-medium'
                    : 'bg-transparent text-[var(--kokpit-text-muted)] border-transparent hover:text-[var(--kokpit-text-secondary)] hover:bg-white/[0.04]',
                )}
              >
                <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
                <span>{isPinned ? 'Pinned' : 'Pin'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 font-ui text-[11px] text-[var(--kokpit-text-muted)]">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--kokpit-surface-2)] border border-[var(--kokpit-border-subtle)] text-[10px]">
                  Ctrl/⌘
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--kokpit-surface-2)] border border-[var(--kokpit-border-subtle)] text-[10px]">
                  <CornerDownLeft className="w-3 h-3 inline" />
                </kbd>
              </span>

              <Button
                type="submit"
                size="sm"
                isLoading={createIdeaMutation.isPending}
                disabled={!content.trim()}
                className="px-4"
              >
                Save Thought
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
