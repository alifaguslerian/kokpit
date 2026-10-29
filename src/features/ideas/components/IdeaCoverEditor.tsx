import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { IdeaCover } from './IdeaCard';
import type { Idea } from '../types';

export function IdeaCoverEditor({ idea, onBusy }: { idea: Idea; onBusy: (busy: boolean) => void }) {
  const client = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState(idea.coverUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const save = async (remove: boolean) => {
    if (pending.current || (!remove && !file)) return;
    pending.current = true;
    setBusy(true);
    onBusy(true);
    setError('');
    setMessage('');
    try {
      if (remove) {
        await apiClient.delete(`/api/ideas/${idea.id}/cover`);
        setCoverUrl(null);
        setMessage('Cover removed.');
      } else if (file) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
          throw new Error('Choose a JPEG, PNG or WebP image.');
        if (file.size > 50 * 1024 * 1024) throw new Error('The image must be 50 MB or smaller.');
        let image: ImageBitmap;
        try {
          image = await createImageBitmap(file);
        } catch {
          throw new Error('This image could not be read. Choose a valid JPEG, PNG or WebP image.');
        }
        const tooLarge = image.width > 2048 || image.height > 2048;
        image.close();
        if (tooLarge)
          throw new Error(
            'Resize the image to 2,048 pixels or fewer on each side before uploading.',
          );
        const form = new FormData();
        form.append('file', file);
        const response = await apiClient.put<{ data: Idea }>(`/api/ideas/${idea.id}/cover`, form);
        setCoverUrl(response.data.coverUrl);
        setMessage('Cover saved.');
        setFile(null);
        if (input.current) input.current.value = '';
      }
      await client.invalidateQueries({ queryKey: ['ideas'] });
    } catch (cause) {
      setError(
        cause instanceof ApiClientError
          ? cause.status === 413
            ? 'The image must be 50 MB or smaller.'
            : 'Could not update this cover. Check the image and try again.'
          : cause instanceof Error
            ? cause.message
            : 'Could not update this cover. Please try again.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
      onBusy(false);
    }
  };
  return (
    <section
      aria-label="Private idea cover"
      className="space-y-2 border-t border-[var(--kokpit-border-default)] pt-3"
    >
      <label htmlFor="idea-cover" className="block text-sm">
        Cover image
      </label>
      <p className="text-xs leading-relaxed text-[var(--kokpit-text-muted)]">
        Optional private JPEG, PNG or WebP. Maximum 50 MB and 2,048 pixels per side. Cover changes
        save separately from your text.
      </p>
      <IdeaCover url={coverUrl} className="max-h-40 w-full rounded-xl object-cover" />
      <input
        id="idea-cover"
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(event) => {
          setFile(event.target.files?.[0] ?? null);
          setError('');
          setMessage('');
        }}
        className="block w-full min-w-0 text-xs file:mr-2 file:min-h-11 file:rounded-lg file:border-0 file:bg-[var(--kokpit-surface-2)] file:px-3 file:text-[var(--kokpit-text-primary)]"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!file || busy}
          onClick={() => void save(false)}
        >
          {busy ? 'Saving cover…' : coverUrl ? 'Replace cover' : 'Upload cover'}
        </Button>
        {coverUrl && (
          <Button type="button" variant="ghost" disabled={busy} onClick={() => void save(true)}>
            Remove cover
          </Button>
        )}
      </div>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
