import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CourseEditor } from './CollegeEditors';
import { DeleteCollegeDialog } from './CollegeLayout';
import { useDeleteCourse } from '../api/use-college';
import type { Course } from '../types';

export function CourseRow({
  course,
  first,
  last,
  moving,
  onMove,
  onDeleted,
}: {
  course: Course;
  first: boolean;
  last: boolean;
  moving: boolean;
  onMove: (direction: -1 | 1) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const remove = useDeleteCourse();
  return (
    <li className="min-w-0 rounded-md border border-kokpit-border-subtle bg-kokpit-surface-2/50 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-kokpit-accent-bg text-kokpit-accent">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold">
            <Link
              to={`/college/courses/${encodeURIComponent(course.id)}`}
              className="hover:text-kokpit-accent"
            >
              {course.name}
            </Link>
          </h3>
          {(course.code || course.lecturer) && (
            <p className="mt-1 break-words text-xs text-kokpit-text-secondary">
              {[course.code, course.lecturer].filter(Boolean).join(' · ')}
            </p>
          )}
          {course.description && (
            <p className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-kokpit-text-secondary">
              {course.description}
            </p>
          )}
        </div>
        <details
          className="relative shrink-0"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}
        >
          <summary
            aria-label={`Options for ${course.name}`}
            className="flex min-h-9 min-w-9 cursor-pointer list-none items-center justify-center rounded-md text-kokpit-text-secondary hover:bg-kokpit-surface-hover"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 z-10 mt-1 flex w-40 flex-col gap-1 rounded-md border border-kokpit-border-strong bg-kokpit-surface-1 p-2 shadow-[var(--shadow-soft)]">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit course
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleting(true)}>
              Delete course
            </Button>
          </div>
        </details>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-kokpit-border-subtle pt-2">
        <Link
          to={`/college/courses/${encodeURIComponent(course.id)}`}
          className="inline-flex min-h-9 items-center gap-1 text-xs text-kokpit-accent"
        >
          Open course <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Move ${course.name} up`}
            disabled={first || moving}
            onClick={() => onMove(-1)}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Move ${course.name} down`}
            disabled={last || moving}
            onClick={() => onMove(1)}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {editing && (
        <CourseEditor
          course={course}
          semesterId={course.semesterId}
          onClose={() => setEditing(false)}
        />
      )}
      {deleting && (
        <DeleteCollegeDialog
          kind="course"
          name={course.name}
          onClose={() => setDeleting(false)}
          onDelete={async () => {
            await remove.mutateAsync(course.id);
            onDeleted();
          }}
        />
      )}
    </li>
  );
}
