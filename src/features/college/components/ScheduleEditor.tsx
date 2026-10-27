import { useId, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { ApiClientError } from '@/lib/api-client';
import { CollegeFormDialog } from './CollegeLayout';
import { useScheduleActions } from '../api/use-schedule';
import { minuteLabel, parseClassTime, weekdays } from '../schedule-format';
import type { Course, ScheduleEntry } from '../types';

export function ScheduleEditor({
  courses,
  entry,
  onClose,
}: {
  courses: Course[];
  entry?: ScheduleEntry;
  onClose: () => void;
}) {
  const formId = useId();
  const [courseId, setCourseId] = useState(entry?.courseId ?? courses[0]?.id ?? '');
  const [weekday, setWeekday] = useState(entry?.weekday ?? 1);
  const [start, setStart] = useState(entry ? minuteLabel(entry.startMinute) : '09:00');
  const [end, setEnd] = useState(
    entry && entry.endMinute !== 1440 ? minuteLabel(entry.endMinute) : '10:00',
  );
  const [midnight, setMidnight] = useState(entry?.endMinute === 1440);
  const [room, setRoom] = useState(entry?.room ?? '');
  const actions = useScheduleActions();
  const selectClass =
    'min-h-11 w-full min-w-0 rounded-md border border-kokpit-border-default bg-kokpit-surface-2 px-3 text-sm';
  return (
    <CollegeFormDialog
      title={entry ? 'Edit class' : 'Add class'}
      submitLabel={entry ? 'Save class' : 'Create class'}
      onClose={onClose}
      description="Repeats each week in your saved timezone. Enter overnight classes as separate days."
      errorMessage={(error) =>
        error instanceof ApiClientError && [400, 404, 409].includes(error.status)
          ? error.message
          : 'Could not save this class. Your changes are here; please try again.'
      }
      onSave={async () => {
        const input = {
          weekday,
          startMinute: parseClassTime(start),
          endMinute: midnight ? 1440 : parseClassTime(end),
          room: room.trim() || null,
        };
        if (input.startMinute >= input.endMinute)
          throw new ApiClientError(
            'INVALID_INTERVAL',
            'End time must follow start time within the same day.',
            400,
          );
        if (entry)
          await actions.update.mutateAsync({ id: entry.id, input: { ...input, courseId } });
        else await actions.create.mutateAsync({ courseId, input });
      }}
    >
      <div className="space-y-2 text-sm">
        <label className="block" htmlFor={`${formId}-course`}>
          Course
        </label>
        <select
          id={`${formId}-course`}
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          className={selectClass}
          required
          autoFocus
        >
          <option value="">Choose course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 text-sm">
        <label className="block" htmlFor={`${formId}-day`}>
          Day
        </label>
        <select
          id={`${formId}-day`}
          value={weekday}
          onChange={(event) => setWeekday(Number(event.target.value))}
          className={selectClass}
        >
          {weekdays.map((day, index) => (
            <option key={day} value={index + 1}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Start time"
          type="time"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          required
          step={60}
        />
        <Input
          label="End time"
          type="time"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          required={!midnight}
          disabled={midnight}
          step={60}
        />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--kokpit-accent)]"
          checked={midnight}
          onChange={(event) => setMidnight(event.target.checked)}
        />
        Ends at midnight (24:00)
      </label>
      <Input
        label="Room (optional)"
        value={room}
        onChange={(event) => setRoom(event.target.value)}
        maxLength={120}
      />
    </CollegeFormDialog>
  );
}
