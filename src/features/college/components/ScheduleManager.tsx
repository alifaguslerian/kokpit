import { useId, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CollegeFormDialog } from './CollegeLayout';
import { ScheduleEditor } from './ScheduleEditor';
import { useScheduleActions } from '../api/use-schedule';
import { minuteLabel, weekdays } from '../schedule-format';
import type { Course, ScheduleEntry } from '../types';

export function ScheduleManager({
  courses,
  entries,
  onClose,
}: {
  courses: Course[];
  entries: ScheduleEntry[];
  onClose: () => void;
}) {
  const id = useId();
  const [editor, setEditor] = useState<ScheduleEntry | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ScheduleEntry | null>(null);
  const actions = useScheduleActions();
  return (
    <>
      <Dialog isOpen onClose={onClose} labelledBy={id} className="max-w-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id={id} className="text-lg font-semibold">
            Edit schedule
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close schedule
          </Button>
        </div>
        <p className="mt-2 text-sm text-kokpit-text-secondary">
          Recurring classes for this semester. Overlapping classes are kept separately.
        </p>
        <Button className="mt-4" onClick={() => setEditor('new')} disabled={courses.length === 0}>
          Add class
        </Button>
        {!courses.length && (
          <p className="mt-3 text-sm text-kokpit-text-secondary">
            Add a course before creating its classes.
          </p>
        )}
        {!entries.length && (
          <p className="mt-4 text-sm text-kokpit-text-secondary">No classes scheduled yet.</p>
        )}
        <ul className="mt-4 list-none divide-y divide-kokpit-border-subtle">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{entry.courseName}</p>
                <p className="mt-1 text-xs text-kokpit-text-secondary">
                  {weekdays[entry.weekday - 1]} · {minuteLabel(entry.startMinute)}–
                  {minuteLabel(entry.endMinute)}
                </p>
                {entry.room && (
                  <p className="mt-1 break-words text-xs text-kokpit-text-secondary">
                    {entry.room}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label={`Edit ${entry.courseName} ${weekdays[entry.weekday - 1]} ${minuteLabel(entry.startMinute)}`}
                  onClick={() => setEditor(entry)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${entry.courseName} ${weekdays[entry.weekday - 1]} ${minuteLabel(entry.startMinute)}`}
                  onClick={() => setDeleting(entry)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Dialog>
      {editor && (
        <ScheduleEditor
          key={editor === 'new' ? 'new' : editor.id}
          courses={courses}
          {...(editor === 'new' ? {} : { entry: editor })}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && (
        <CollegeFormDialog
          title="Delete class?"
          submitLabel="Delete class"
          danger
          description={`Remove this recurring ${weekdays[deleting.weekday - 1]} class for “${deleting.courseName}”? Course materials will stay saved.`}
          onClose={() => setDeleting(null)}
          onSave={() => actions.remove.mutateAsync(deleting.id)}
        />
      )}
    </>
  );
}
