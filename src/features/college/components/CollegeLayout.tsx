import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiClientError } from '@/lib/api-client';

export function isMissingCollege(error: unknown) {
  return error instanceof ApiClientError && error.status === 404;
}

export function useCollegeActionGuard() {
  const location = useLocation();
  const currentLocation = useRef(location.key);
  const mounted = useRef(false);
  useEffect(() => {
    currentLocation.current = location.key;
  }, [location.key]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // A completed write may refresh caches, but must not undo later browser navigation.
  return () => mounted.current && currentLocation.current === location.key;
}

export function CollegeBreadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-kokpit-text-secondary">
      <ol className="flex list-none flex-wrap items-center gap-2">
        <li>
          <Link to="/college" className="hover:text-kokpit-accent">
            College
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-center gap-2">
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            {item.to ? (
              <Link to={item.to} className="break-all hover:text-kokpit-accent">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="break-all">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CollegeLoading({ label = 'Loading College…' }: { label?: string }) {
  return (
    <div role="status" className="space-y-4">
      <p className="text-sm text-kokpit-text-muted">{label}</p>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function CollegeUnavailable({ error, retry }: { error: unknown; retry: () => void }) {
  const missing = isMissingCollege(error);
  return (
    <ErrorState
      title={missing ? 'This College page is unavailable' : 'College could not load'}
      message={
        missing
          ? 'It may have been removed or is not accessible. Return to College to choose another course.'
          : 'Your content is still saved. Please try again.'
      }
      onRetry={retry}
      action={
        <Link to="/college" className="text-sm text-kokpit-accent">
          Back to College
        </Link>
      }
    />
  );
}

export function CollegeFormDialog({
  title,
  submitLabel,
  onClose,
  onSave,
  children,
  description,
  danger = false,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSave: () => Promise<unknown>;
  children?: ReactNode;
  description?: string;
  danger?: boolean;
}) {
  const id = useId();
  const submitting = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const close = () => {
    if (!submitting.current) onClose();
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      await onSave();
      if (mounted.current) onClose();
    } catch (cause) {
      if (!mounted.current) return;
      setError(
        cause instanceof ApiClientError && cause.status === 409
          ? danger
            ? 'This contains stored files or inaccessible content and cannot be deleted yet.'
            : 'This week number already exists in this course. Choose another number.'
          : danger
            ? 'Could not delete this item. It is still saved; please try again.'
            : 'Could not save this change. Your changes are here; please try again.',
      );
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return (
    <Dialog isOpen onClose={close} labelledBy={id} className="max-w-md">
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-kokpit-text-secondary break-words">{description}</p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-kokpit-danger p-3 text-sm text-kokpit-text-primary"
        >
          {error}
        </p>
      )}
      <form onSubmit={(event) => void submit(event)} className="mt-5">
        <fieldset disabled={pending} className="min-w-0 space-y-4">
          {children}
          <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-kokpit-border-subtle">
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant={danger ? 'danger' : 'primary'} isLoading={pending}>
              {submitLabel}
            </Button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

export function DeleteCollegeDialog({
  kind,
  name,
  onDelete,
  onClose,
}: {
  kind: 'semester' | 'course' | 'week';
  name: string;
  onDelete: () => Promise<unknown>;
  onClose: () => void;
}) {
  return (
    <CollegeFormDialog
      title={`Delete ${kind}?`}
      submitLabel={`Delete ${kind}`}
      onSave={onDelete}
      onClose={onClose}
      danger
      description={`Delete “${name}”${kind === 'week' ? '' : ' and everything inside it'}? This cannot be undone.`}
    />
  );
}
