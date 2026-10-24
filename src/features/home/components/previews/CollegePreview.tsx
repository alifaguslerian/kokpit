import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
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
    <section
      aria-labelledby="home-college-title"
      className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-4 sm:p-5 border border-[var(--kokpit-border-subtle)]"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2">
          <GraduationCap
            className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0"
            aria-hidden="true"
          />
          <h2 id="home-college-title" className="font-ui font-semibold text-sm">
            College
          </h2>
        </div>
        <Link
          to="/college"
          className="inline-flex items-center gap-1 text-xs text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)]"
        >
          Go to College <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="py-5">
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
          <div className="space-y-3 min-w-0">
            <p className="text-xs text-kokpit-text-muted break-words">{semester.name}</p>
            {course ? (
              <>
                <Link
                  to={`/college/courses/${encodeURIComponent(course.id)}`}
                  className="block text-sm font-medium break-words hover:text-kokpit-accent"
                >
                  {course.name}
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
              </>
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
