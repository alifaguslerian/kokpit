import { useState, type FormEvent } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useCreateQuickLink, useUpdateQuickLink } from '../api/use-quick-links';
import type { QuickLink } from '../types';

const PRESET_GROUPS = ['Daily', 'Study', 'Work', 'Tools', 'Media', 'Personal'];

const POPULAR_ICONS = [
  { label: 'Auto-detect', value: '' },
  { label: 'GitHub', value: 'github' },
  { label: 'Notion', value: 'notion' },
  { label: 'Drive', value: 'drive' },
  { label: 'Mail', value: 'mail' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Figma', value: 'figma' },
  { label: 'Discord', value: 'discord' },
  { label: 'Spotify', value: 'spotify' },
  { label: 'Book', value: 'book' },
  { label: 'Code', value: 'code' },
  { label: 'Terminal', value: 'terminal' },
];

interface QuickLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: QuickLink | null | undefined;
}

interface QuickLinkFormProps {
  link?: QuickLink | null | undefined;
  onClose: () => void;
}

function QuickLinkForm({ link, onClose }: QuickLinkFormProps) {
  const [name, setName] = useState(link?.name ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [groupName, setGroupName] = useState(link?.groupName ?? '');
  const [iconValue, setIconValue] = useState(link?.iconValue ?? '');
  const [isFavorite, setIsFavorite] = useState(link?.isFavorite ?? false);
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useCreateQuickLink();
  const updateMutation = useUpdateQuickLink();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = name.trim();
    let trimmedUrl = url.trim();

    if (!trimmedName) {
      setErrorMsg('Name is required.');
      return;
    }

    if (!trimmedUrl) {
      setErrorMsg('URL is required.');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setErrorMsg('Please enter a valid URL.');
      return;
    }

    try {
      if (link) {
        await updateMutation.mutateAsync({
          id: link.id,
          input: {
            name: trimmedName,
            url: trimmedUrl,
            groupName: groupName.trim() || null,
            iconValue: iconValue || null,
            isFavorite,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          url: trimmedUrl,
          groupName: groupName.trim() || null,
          iconValue: iconValue || undefined,
          isFavorite,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save shortcut.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-[var(--kokpit-surface-1)] border border-[var(--kokpit-border-strong)] rounded-[var(--radius-lg)] p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
          <h2
            id="modal-title"
            className="font-ui font-medium text-base text-[var(--kokpit-text-primary)]"
          >
            {link ? 'Edit Shortcut' : 'Add New Shortcut'}
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

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-[var(--kokpit-danger-bg)] border border-[var(--kokpit-danger)]/30 text-xs text-[var(--kokpit-danger)]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="shortcut-name"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Name
            </label>
            <input
              id="shortcut-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GitHub, Notion, College Portal"
              maxLength={100}
              autoFocus
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-sm transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="shortcut-url"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              URL
            </label>
            <input
              id="shortcut-url"
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-mono text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1">
              Category / Group
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {PRESET_GROUPS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGroupName(groupName === preset ? '' : preset)}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-ui border transition-colors cursor-pointer',
                    groupName === preset
                      ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/40 font-medium'
                      : 'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-muted)] border-[var(--kokpit-border-subtle)] hover:text-[var(--kokpit-text-primary)]',
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Or type custom category..."
              maxLength={50}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-soft)] px-3 py-1.5 rounded-lg border border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="shortcut-icon"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
              Icon Representation
            </label>
            <select
              id="shortcut-icon"
              value={iconValue}
              onChange={(e) => setIconValue(e.target.value)}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs"
            >
              {POPULAR_ICONS.map((icon) => (
                <option key={icon.value} value={icon.value} className="bg-[#1c1917] text-white">
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--kokpit-border-subtle)]">
            <button
              type="button"
              onClick={() => setIsFavorite((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui border transition-colors cursor-pointer',
                isFavorite
                  ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] border-[var(--kokpit-accent)]/40 font-medium'
                  : 'bg-transparent text-[var(--kokpit-text-muted)] border-transparent hover:text-[var(--kokpit-text-secondary)] hover:bg-white/[0.04]',
              )}
            >
              <Star className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
              <span>{isFavorite ? 'Favorite' : 'Add to favorites'}</span>
            </button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isPending}>
                {link ? 'Save Changes' : 'Create Shortcut'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function QuickLinkModal({ isOpen, onClose, link }: QuickLinkModalProps) {
  if (!isOpen) return null;
  return <QuickLinkForm key={link?.id ?? 'new'} link={link} onClose={onClose} />;
}
