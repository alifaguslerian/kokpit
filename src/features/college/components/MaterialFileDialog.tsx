import { useEffect, useId, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import type { Material } from '../types';

export function MaterialFileDialog({
  material,
  onClose,
}: {
  material: Material;
  onClose: () => void;
}) {
  const id = useId();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const url = `/api/files/${encodeURIComponent(material.id)}`;
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!controller.signal.aborted)
          setState(response.ok ? 'ready' : response.status === 404 ? 'missing' : 'error');
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('error');
      });
    return () => controller.abort();
  }, [url, attempt]);
  return (
    <Dialog isOpen onClose={onClose} labelledBy={id} className="max-w-md">
      <h2 id={id} className="break-words text-lg font-semibold">
        {material.title}
      </h2>
      <p className="mt-2 break-all text-sm text-kokpit-text-secondary">
        {material.originalFilename}
      </p>
      {state === 'loading' ? (
        <p role="status" className="mt-5 text-sm">
          Checking private file…
        </p>
      ) : state === 'ready' ? (
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-kokpit-accent">
          <a
            className="inline-flex min-h-11 items-center underline"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open file
          </a>
          <a
            className="inline-flex min-h-11 items-center underline"
            href={`${url}?download=true`}
            download
          >
            Download file
          </a>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <p role="alert" className="text-sm">
            {state === 'missing'
              ? 'This file is unavailable. It may have been removed.'
              : 'Could not read this file. Please try again.'}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setState('loading');
              setAttempt((value) => value + 1);
            }}
          >
            Retry file
          </Button>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}
