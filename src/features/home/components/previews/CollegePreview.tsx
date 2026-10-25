import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, ChevronRight } from 'lucide-react';
import { useSemesters, useCourses, useWeeks } from '@/features/college/api/use-college';

export function CollegePreview() {
  const semesters = useSemesters();
  const semester = semesters.data?.find((item) => item.isActive);
  const courses = useCourses(semester?.id ?? '');
  const course = courses.data?.[0];
  const weeks = useWeeks(course?.id ?? '');
  const week = weeks.data?.[0];
  const loading =
    semesters.isPending ||
    (Boolean(semester) && courses.isPending) ||
    (Boolean(course) && weeks.isPending);
  const failed =
    semesters.isError ||
    (Boolean(semester) && courses.isError) ||
    (Boolean(course) && weeks.isError);
  const retry = () => {
    if (semesters.isError) void semesters.refetch();
    if (semester && courses.isError) void courses.refetch();
    if (course && weeks.isError) void weeks.refetch();
  };
  return (
    <section aria-labelledby="home-college-title" className="room-panel home-college">
      <div className="home-panel-header">
        <div className="home-panel-title">
          <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id="home-college-title" className="font-ui font-medium">
            College
          </h2>
        </div>
        <Link to="/college" className="home-panel-link">
          Go to College <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="pt-3 pb-1">
        {failed && (
          <div role="alert" className="mb-3 text-xs text-kokpit-text-secondary">
            <p>College could not refresh.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-2 text-kokpit-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <p role="status" className="text-sm text-kokpit-text-muted">
            Loading College…
          </p>
        ) : !semester && semesters.isError ? null : !semester ? (
          <>
            <p className="text-sm text-kokpit-text-secondary">No active semester yet.</p>
            <p className="mt-1 text-xs text-kokpit-text-muted">
              Choose an active semester in College to see it here.
            </p>
          </>
        ) : (
          <div className="min-w-0 space-y-3">
            <p className="break-words text-xs text-kokpit-text-secondary">{semester.name}</p>
            {course ? (
              <div className="flex min-w-0 items-start gap-3 rounded-md border border-kokpit-border-default bg-kokpit-accent-bg p-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kokpit-accent-bg text-kokpit-text-secondary"
                  aria-hidden="true"
                >
                  <BookOpen className="h-5 w-5" strokeWidth={1.4} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    to={`/college/courses/${encodeURIComponent(course.id)}`}
                    className="flex items-center justify-between gap-2 break-words text-sm font-medium hover:text-kokpit-accent"
                  >
                    <span className="min-w-0">{course.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                  {week ? (
                    <Link
                      to={`/college/weeks/${encodeURIComponent(week.id)}`}
                      className="block text-xs text-kokpit-text-secondary break-words hover:text-kokpit-accent"
                    >
                      Week {week.weekNumber}
                      {week.title ? ` · ${week.title}` : ''}{' '}
                      <ArrowUpRight className="inline h-3 w-3" aria-hidden="true" />
                    </Link>
                  ) : weeks.isError ? null : (
                    <p className="text-xs text-kokpit-text-muted">
                      No weeks yet. Open this course to add one.
                    </p>
                  )}
                </div>
              </div>
            ) : courses.isError ? null : (
              <p className="text-sm text-kokpit-text-secondary">
                No courses yet. Add a course in College.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
