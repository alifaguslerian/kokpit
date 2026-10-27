import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CollegeBreadcrumbs,
  CollegeLoading,
  CollegeUnavailable,
  DeleteCollegeDialog,
  isMissingCollege,
  useCollegeActionGuard,
} from '../components/CollegeLayout';
import { CourseEditor, WeekEditor } from '../components/CollegeEditors';
import { useCourse, useSemester, useWeeks, useDeleteCourse } from '../api/use-college';

export function CoursePage() {
  const { courseId = '' } = useParams();
  return <CourseWorkspace key={courseId} courseId={courseId} />;
}

function CourseWorkspace({ courseId }: { courseId: string }) {
  const canNavigate = useCollegeActionGuard();
  const navigate = useNavigate();
  const [editor, setEditor] = useState<'course' | 'week' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const courseQuery = useCourse(courseId);
  const course = courseQuery.data;
  const semesterQuery = useSemester(course?.semesterId ?? '');
  const weeksQuery = useWeeks(course ? courseId : '');
  const remove = useDeleteCourse();
  const weeks = weeksQuery.data ?? [];
  const nextNumber = Math.min(Number.MAX_SAFE_INTEGER, (weeks.at(-1)?.weekNumber ?? 0) + 1);
  return (
    <PageContainer>
      {courseQuery.isPending ? (
        <CollegeLoading label="Loading course…" />
      ) : courseQuery.isError && (!course || isMissingCollege(courseQuery.error)) ? (
        <CollegeUnavailable error={courseQuery.error} retry={() => void courseQuery.refetch()} />
      ) : (
        course && (
          <>
            <CollegeBreadcrumbs
              items={[
                {
                  label: semesterQuery.data?.name ?? 'Semester',
                  to: `/college?semester=${encodeURIComponent(course.semesterId)}`,
                },
                { label: course.name },
              ]}
            />
            {courseQuery.isError && (
              <CollegeUnavailable
                error={courseQuery.error}
                retry={() => void courseQuery.refetch()}
              />
            )}
            <PageHeader
              eyebrow={course.code || 'Course workspace'}
              title={course.name}
              {...(course.lecturer ? { description: course.lecturer } : {})}
              actions={
                <>
                  <Button variant="secondary" onClick={() => setEditor('course')}>
                    Edit course
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(true)}>
                    Delete course
                  </Button>
                </>
              }
            />
            {course.description && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-kokpit-text-secondary">
                {course.description}
              </p>
            )}
            <section
              aria-labelledby="course-weeks-title"
              className="space-y-4 border-t border-kokpit-border-subtle pt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="course-weeks-title" className="text-lg font-semibold">
                    Weekly materials
                  </h2>
                  <p className="mt-1 text-sm text-kokpit-text-secondary">
                    Keep each week's reading and resources together.
                  </p>
                </div>
                <Button
                  onClick={() => setEditor('week')}
                  leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
                >
                  Add week
                </Button>
              </div>
              {weeksQuery.isPending ? (
                <CollegeLoading label="Loading weeks…" />
              ) : weeksQuery.isError && !weeksQuery.data ? (
                <CollegeUnavailable
                  error={weeksQuery.error}
                  retry={() => void weeksQuery.refetch()}
                />
              ) : (
                <>
                  {weeksQuery.isError && (
                    <CollegeUnavailable
                      error={weeksQuery.error}
                      retry={() => void weeksQuery.refetch()}
                    />
                  )}
                  {weeks.length === 0 ? (
                    <EmptyState
                      title="No weeks yet"
                      description="Add your first week. There is no fixed limit to the number of weeks in a course."
                    />
                  ) : (
                    <ul className="list-none divide-y divide-kokpit-border-subtle rounded-lg border border-kokpit-border-default bg-kokpit-surface-1">
                      {weeks.map((week) => (
                        <li key={week.id} className="min-w-0">
                          <Link
                            to={`/college/weeks/${encodeURIComponent(week.id)}`}
                            className="group flex items-center justify-between gap-4 p-5 sm:p-6 hover:bg-kokpit-surface-hover rounded-lg"
                          >
                            <div className="min-w-0">
                              <p className="text-xs text-kokpit-accent">Week {week.weekNumber}</p>
                              <h3 className="mt-1 text-base font-medium break-words">
                                {week.title || `Week ${week.weekNumber} materials`}
                              </h3>
                              {week.notes && (
                                <p className="mt-2 line-clamp-2 text-sm text-kokpit-text-muted break-words">
                                  {week.notes}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight
                              className="h-4 w-4 shrink-0 text-kokpit-text-muted group-hover:text-kokpit-accent"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
            {editor === 'course' && (
              <CourseEditor
                course={course}
                semesterId={course.semesterId}
                onClose={() => setEditor(null)}
              />
            )}
            {editor === 'week' && (
              <WeekEditor
                courseId={course.id}
                nextNumber={nextNumber}
                onClose={() => setEditor(null)}
              />
            )}
            {deleting && (
              <DeleteCollegeDialog
                kind="course"
                name={course.name}
                onClose={() => setDeleting(false)}
                onDelete={async () => {
                  await remove.mutateAsync(course.id);
                  if (canNavigate())
                    void navigate(`/college?semester=${encodeURIComponent(course.semesterId)}`);
                }}
              />
            )}
          </>
        )
      )}
    </PageContainer>
  );
}
