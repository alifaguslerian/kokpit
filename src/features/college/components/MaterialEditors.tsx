import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { ApiClientError } from '@/lib/api-client';
import { CollegeFormDialog } from './CollegeLayout';
import { useMaterialActions } from '../api/use-materials';
import { useSemesters, useCourses, useWeeks } from '../api/use-college';
import type { Material } from '../types';

const selectClass =
  'min-h-11 w-full min-w-0 rounded-md border border-kokpit-border-default bg-kokpit-surface-2 px-3 text-sm';
const materialError = (error: unknown) =>
  error instanceof ApiClientError && [400, 409, 413, 415].includes(error.status)
    ? error.message
    : 'Could not save this material. Your changes are here; please try again.';

export function AddMaterialDialog({
  weekId,
  kind,
  onClose,
}: {
  weekId: string;
  kind: 'file' | 'link';
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const actions = useMaterialActions();
  return (
    <CollegeFormDialog
      title={kind === 'file' ? 'Upload material' : 'Add material link'}
      submitLabel={kind === 'file' ? 'Upload' : 'Save link'}
      onClose={onClose}
      errorMessage={materialError}
      onSave={async () => {
        if (kind === 'link')
          return actions.createLink.mutateAsync({ weekId, title: title.trim(), url: url.trim() });
        if (!file || file.size === 0)
          throw new ApiClientError('INVALID_FILE', 'Choose a nonempty file.', 400);
        if (file.size > 50 * 1024 * 1024)
          throw new ApiClientError('FILE_TOO_LARGE', 'Files must be 50 MB or smaller.', 413);
        return actions.upload.mutateAsync({ weekId, file, title });
      }}
    >
      {kind === 'file' && (
        <>
          <Input
            label="File"
            type="file"
            required
            autoFocus
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              if (!title) setTitle(selected?.name ?? '');
            }}
          />
          <p className="text-xs text-kokpit-text-secondary">
            PDF, images, Office documents, UTF-8 text or code. Up to 50 MB per file.
          </p>
        </>
      )}
      <Input
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        pattern=".*\S.*"
        maxLength={255}
        autoFocus={kind === 'link'}
      />
      {kind === 'link' && (
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          pattern="https?://.*"
          maxLength={4096}
          placeholder="https://…"
        />
      )}
      {actions.upload.isPending && (
        <p role="status" className="text-sm text-kokpit-text-secondary">
          Uploading file… Keep this page open until it finishes.
        </p>
      )}
    </CollegeFormDialog>
  );
}

export function EditMaterialDialog({
  material,
  onClose,
}: {
  material: Material;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(material.title);
  const [url, setUrl] = useState(material.externalUrl ?? '');
  const [semesterId, setSemesterId] = useState(material.semesterId);
  const [courseId, setCourseId] = useState(material.courseId);
  const [weekId, setWeekId] = useState(material.weekId);
  const semesters = useSemesters();
  const courses = useCourses(semesterId);
  const weeks = useWeeks(courseId);
  const actions = useMaterialActions();
  const destinationError = semesters.isError || courses.isError || weeks.isError;
  return (
    <CollegeFormDialog
      title="Edit material"
      submitLabel="Save changes"
      onClose={onClose}
      errorMessage={materialError}
      onSave={async () => {
        if (destinationError || !weekId)
          throw new ApiClientError(
            'DESTINATION_UNAVAILABLE',
            'Choose an available destination week before saving.',
            400,
          );
        await actions.update.mutateAsync({
          id: material.id,
          input: {
            title: title.trim(),
            weekId,
            ...(material.type === 'link' ? { externalUrl: url.trim() } : {}),
          },
        });
      }}
    >
      <Input
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        pattern=".*\S.*"
        maxLength={255}
        autoFocus
      />
      {material.type === 'link' && (
        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
          pattern="https?://.*"
          maxLength={4096}
        />
      )}
      <p className="text-sm text-kokpit-text-secondary">
        Keep this material here or move it to another week.
      </p>
      <label className="block space-y-2 text-sm">
        Destination semester
        <select
          className={selectClass}
          value={semesterId}
          required
          onChange={(event) => {
            setSemesterId(event.target.value);
            setCourseId('');
            setWeekId('');
          }}
        >
          <option value="">Choose semester</option>
          {semesters.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2 text-sm">
        Destination course
        <select
          className={selectClass}
          value={courseId}
          required
          disabled={!semesterId || courses.isPending}
          onChange={(event) => {
            setCourseId(event.target.value);
            setWeekId('');
          }}
        >
          <option value="">Choose course</option>
          {courses.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-2 text-sm">
        Destination week
        <select
          className={selectClass}
          value={weekId}
          required
          disabled={!courseId || weeks.isPending}
          onChange={(event) => setWeekId(event.target.value)}
        >
          <option value="">Choose week</option>
          {weeks.data?.map((item) => (
            <option key={item.id} value={item.id}>
              Week {item.weekNumber}
              {item.title ? ` · ${item.title}` : ''}
            </option>
          ))}
        </select>
      </label>
      {destinationError && (
        <div role="alert" className="text-sm text-kokpit-text-secondary">
          Destinations could not load.{' '}
          <button
            type="button"
            className="text-kokpit-accent underline"
            onClick={() => {
              void semesters.refetch();
              if (semesterId) void courses.refetch();
              if (courseId) void weeks.refetch();
            }}
          >
            Retry destinations
          </button>
        </div>
      )}
    </CollegeFormDialog>
  );
}
