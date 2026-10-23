import { useRef, useState, type FormEvent } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
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

function validateShortcutUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/[\s\\]/.test(trimmed)) return 'Enter a valid URL without spaces or backslashes.';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  if (hasScheme && !/^https?:\/\/[^/]/i.test(trimmed)) return 'Use an http or https URL.';
  try {
    const parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'Use an http or https URL.';
    if (parsed.username || parsed.password) return 'Remove the username and password from the URL.';
    if (!parsed.hostname) return 'Enter a valid website URL.';
    return '';
  } catch {
    return 'Enter a valid website URL.';
  }
}

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
  const submitting = useRef(false);
  const [name, setName] = useState(link?.name ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [groupName, setGroupName] = useState(link?.groupName ?? '');
  const [iconValue, setIconValue] = useState(link?.iconValue ?? '');
  const [isFavorite, setIsFavorite] = useState(link?.isFavorite ?? false);
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useCreateQuickLink();
  const updateMutation = useUpdateQuickLink();

  const isPending = createMutation.isPending || updateMutation.isPending;
  const urlError = validateShortcutUrl(url);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    setErrorMsg('');

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setErrorMsg('Name is required.');
      return;
    }

    if (!trimmedUrl) {
      setErrorMsg('URL is required.');
      return;
    }

    if (urlError) {
      return;
    }

    submitting.current = true;
    const iconType =
      iconValue &&
      iconValue === link?.iconValue &&
      ['brand', 'lucide', 'favicon', 'custom'].includes(link.iconType)
        ? link.iconType
        : iconValue
          ? [
              'github',
              'notion',
              'drive',
              'mail',
              'youtube',
              'figma',
              'discord',
              'spotify',
            ].includes(iconValue)
            ? 'brand'
            : 'lucide'
          : undefined;
    try {
      if (link) {
        await updateMutation.mutateAsync({
          id: link.id,
          input: {
            name: trimmedName,
            url: trimmedUrl,
            groupName: groupName.trim() || null,
            iconValue: iconValue || null,
            iconType,
            isFavorite,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          url: trimmedUrl,
          groupName: groupName.trim() || null,
          iconValue: iconValue || undefined,
          iconType,
          isFavorite,
        });
      }
      onClose();
    } catch {
      setErrorMsg('Could not save this shortcut. Your changes are here; please try again.');
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
      labelledBy="modal-title"
      className="max-w-md"
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
          disabled={isPending}
          onClick={onClose}
          aria-label="Close dialog"
          className="p-1 rounded text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mt-3 p-2.5 rounded-lg bg-[var(--kokpit-danger-bg)] border border-[var(--kokpit-danger)]/30 text-xs text-[var(--kokpit-text-primary)]"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3.5">
        <fieldset disabled={isPending} className="min-w-0 space-y-3.5">
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
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-sm transition-colors"
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
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? 'shortcut-url-error' : undefined}
              maxLength={2000}
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] px-3 py-2 rounded-lg border border-[var(--kokpit-border-default)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs transition-colors"
            />
            {urlError && (
              <p
                id="shortcut-url-error"
                role="alert"
                className="mt-1 text-xs text-[var(--kokpit-text-primary)]"
              >
                {urlError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="shortcut-group"
              className="block font-ui text-xs text-[var(--kokpit-text-secondary)] mb-1"
            >
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
              id="shortcut-group"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Or type custom category..."
              maxLength={50}
              className="w-full bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] placeholder-[var(--kokpit-text-muted)] px-3 py-1.5 rounded-lg border border-[var(--kokpit-border-subtle)] focus:border-[var(--kokpit-accent)] focus:outline-none font-ui text-xs"
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
              {iconValue && !POPULAR_ICONS.some((icon) => icon.value === iconValue) && (
                <option value={iconValue}>Current icon</option>
              )}
              {POPULAR_ICONS.map((icon) => (
                <option
                  key={icon.value}
                  value={icon.value}
                  className="bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)]"
                >
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--kokpit-border-subtle)]">
            <button
              type="button"
              onClick={() => setIsFavorite((prev) => !prev)}
              aria-pressed={isFavorite}
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
        </fieldset>
      </form>
    </Dialog>
  );
}

export function QuickLinkModal({ isOpen, onClose, link }: QuickLinkModalProps) {
  if (!isOpen) return null;
  return <QuickLinkForm key={link?.id ?? 'new'} link={link} onClose={onClose} />;
}
