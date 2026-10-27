import { Fragment, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CollegeLoading, CollegeUnavailable } from './CollegeLayout';
import { ScheduleManager } from './ScheduleManager';
import { useSchedule } from '../api/use-schedule';
import { minuteLabel, scheduleDateLabel, weekdays } from '../schedule-format';
import type { Course, ScheduleEntry, ScheduleResponse } from '../types';
import '../schedule.css';

function ClassLink({ entry }: { entry: ScheduleEntry }) {
  return (
    <Link
      to={`/college/courses/${encodeURIComponent(entry.courseId)}`}
      className="block min-w-0 rounded-md border border-kokpit-border-default bg-kokpit-accent-bg p-2.5 hover:border-kokpit-accent"
    >
      <span className="block break-words text-sm font-medium">{entry.courseName}</span>
      <span className="mt-1 block text-xs text-kokpit-text-secondary">
        {minuteLabel(entry.startMinute)}–{minuteLabel(entry.endMinute)}
      </span>
      {entry.room && (
        <span className="mt-1 block break-words text-xs text-kokpit-text-secondary">
          {entry.room}
        </span>
      )}
    </Link>
  );
}
function ScheduleCalendar({ schedule }: { schedule: ScheduleResponse }) {
  const days = schedule.week.days.slice(
    0,
    schedule.data.some((entry) => entry.weekday > 5) ? 7 : 5,
  );
  const starts = [...new Set(schedule.data.map((entry) => entry.startMinute))].sort(
    (a, b) => a - b,
  );
  return (
    <div className="college-schedule-calendar">
      <div
        className="schedule-grid-wrap mt-4"
        role="region"
        aria-label="Weekly timetable"
        tabIndex={0}
      >
        <table
          className="w-full table-fixed border-collapse text-left"
          style={{ minWidth: `${days.length * 7.5 + 3.5}rem` }}
        >
          <caption className="sr-only">
            Weekly classes grouped by local start time. Each block shows its full time range.
          </caption>
          <colgroup>
            <col style={{ width: '3.5rem' }} />
            {days.map((day) => (
              <col key={day.weekday} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="pb-3 text-xs font-normal text-kokpit-text-secondary">
                Start
              </th>
              {days.map((day) => (
                <th
                  key={day.weekday}
                  scope="col"
                  className="pb-3 text-center text-xs font-medium"
                  aria-current={day.date === schedule.week.today ? 'date' : undefined}
                >
                  <span className="block">{weekdays[day.weekday - 1]?.slice(0, 3)}</span>
                  <span className="mt-1 block font-normal text-kokpit-text-secondary">
                    {scheduleDateLabel(day.date)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {starts.map((start) => (
              <tr key={start}>
                <th
                  scope="row"
                  className="align-top pt-3 text-xs font-normal text-kokpit-text-secondary"
                >
                  {minuteLabel(start)}
                </th>
                {days.map((day) => (
                  <td
                    key={day.weekday}
                    className="align-top border-t border-kokpit-border-subtle p-1.5"
                  >
                    <div className="grid gap-2">
                      {schedule.data
                        .filter(
                          (entry) => entry.weekday === day.weekday && entry.startMinute === start,
                        )
                        .map((entry) => (
                          <ClassLink key={entry.id} entry={entry} />
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="schedule-agenda mt-4 space-y-5">
        {days
          .filter((day) => schedule.data.some((entry) => entry.weekday === day.weekday))
          .map((day) => (
            <section key={day.weekday} aria-label={`${weekdays[day.weekday - 1]} classes`}>
              <h3
                className="mb-2 text-sm font-medium"
                aria-current={day.date === schedule.week.today ? 'date' : undefined}
              >
                {weekdays[day.weekday - 1]}{' '}
                <span className="ml-2 text-xs font-normal text-kokpit-text-secondary">
                  {scheduleDateLabel(day.date)}
                </span>
              </h3>
              <ul className="grid min-w-0 list-none grid-cols-1 gap-2">
                {schedule.data
                  .filter((entry) => entry.weekday === day.weekday)
                  .map((entry) => (
                    <li key={entry.id} className="min-w-0">
                      <ClassLink entry={entry} />
                    </li>
                  ))}
              </ul>
            </section>
          ))}
      </div>
    </div>
  );
}
export function WeeklySchedule({
  semesterId,
  courses,
  canEdit,
}: {
  semesterId: string;
  courses: Course[];
  canEdit: boolean;
}) {
  const location = useLocation();
  return (
    <SchedulePanel
      key={`${semesterId}:${location.key}`}
      semesterId={semesterId}
      courses={courses}
      canEdit={canEdit}
    />
  );
}
function SchedulePanel({
  semesterId,
  courses,
  canEdit,
}: {
  semesterId: string;
  courses: Course[];
  canEdit: boolean;
}) {
  const query = useSchedule(semesterId);
  const [editing, setEditing] = useState(false);
  const schedule = query.data;
  const earliest = schedule?.data.reduce(
    (value, entry) => Math.min(value, entry.startMinute),
    1440,
  );
  const latest = schedule?.data.reduce((value, entry) => Math.max(value, entry.endMinute), 0);
  return (
    <section aria-labelledby="college-schedule-title" className="room-panel min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="college-schedule-title" className="flex items-center gap-2 text-lg font-semibold">
          <CalendarDays className="h-5 w-5 text-kokpit-accent" aria-hidden="true" />
          Weekly Schedule
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setEditing(true)}
          disabled={!canEdit || !schedule || query.isError}
        >
          Edit schedule
        </Button>
      </div>
      {query.isPending ? (
        <CollegeLoading label="Loading schedule…" />
      ) : query.isError ? (
        <CollegeUnavailable error={query.error} retry={() => void query.refetch()} />
      ) : (
        schedule && (
          <>
            <p className="mt-3 break-words text-xs text-kokpit-text-secondary">
              {scheduleDateLabel(schedule.week.start)}–
              {scheduleDateLabel(schedule.week.end, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              · {schedule.timezone}
            </p>
            {!schedule.data.length ? (
              <EmptyState
                title="No classes scheduled"
                description="Add recurring classes for your courses. Course materials stay organized by week."
              />
            ) : (
              <Fragment>
                <p className="mt-2 text-xs text-kokpit-text-secondary">
                  {minuteLabel(earliest!)}–{minuteLabel(latest!)} · Full time ranges shown for every
                  class
                </p>
                <ScheduleCalendar schedule={schedule} />
              </Fragment>
            )}
          </>
        )
      )}
      {editing && schedule && (
        <ScheduleManager
          courses={courses}
          entries={schedule.data}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}
