import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
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
import { WeekEditor } from '../components/CollegeEditors';
import { useWeek, useCourse, useSemester, useDeleteWeek } from '../api/use-college';

export function WeekPage() {
  const { weekId = '' } = useParams();
  return <WeekWorkspace key={weekId} weekId={weekId} />;
}

function WeekWorkspace({ weekId }: { weekId: string }) {
  const canNavigate = useCollegeActionGuard();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const weekQuery = useWeek(weekId);
  const week = weekQuery.data;
  const courseQuery = useCourse(week?.courseId ?? '');
  const course = courseQuery.data;
  const semesterQuery = useSemester(course?.semesterId ?? '');
  const remove = useDeleteWeek();
  return (
    <PageContainer>
      {weekQuery.isPending ? (
        <CollegeLoading label="Loading week…" />
      ) : weekQuery.isError && (!week || isMissingCollege(weekQuery.error)) ? (
        <CollegeUnavailable error={weekQuery.error} retry={() => void weekQuery.refetch()} />
      ) : (
        week && (
          <>
            <CollegeBreadcrumbs
              items={[
                ...(course
                  ? [
                      {
                        label: semesterQuery.data?.name ?? 'Semester',
                        to: `/college?semester=${encodeURIComponent(course.semesterId)}`,
                      },
                    ]
                  : []),
                {
                  label: course?.name ?? 'Course',
                  to: `/college/courses/${encodeURIComponent(week.courseId)}`,
                },
                { label: `Week ${week.weekNumber}` },
              ]}
            />
            {weekQuery.isError && (
              <CollegeUnavailable error={weekQuery.error} retry={() => void weekQuery.refetch()} />
            )}
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 w-full sm:flex-1">
                <p className="text-xs uppercase tracking-wider text-kokpit-accent">
                  Week {week.weekNumber}
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-medium break-words">
                  {week.title || `Week ${week.weekNumber}`}
                </h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit week
                </Button>
                <Button variant="ghost" onClick={() => setDeleting(true)}>
                  Delete week
                </Button>
              </div>
            </header>
            {week.notes && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-kokpit-text-secondary">
                {week.notes}
              </p>
            )}
            <section
              aria-labelledby="week-materials-title"
              className="border-t border-kokpit-border-subtle pt-6 space-y-4"
            >
              <h2 id="week-materials-title" className="text-lg font-semibold">
                Materials
              </h2>
              <EmptyState
                title="No materials yet"
                description="This week's space is ready. Private files and material links will be available here soon."
              />
            </section>
            {editing && (
              <WeekEditor
                week={week}
                courseId={week.courseId}
                nextNumber={week.weekNumber}
                onClose={() => setEditing(false)}
              />
            )}
            {deleting && (
              <DeleteCollegeDialog
                kind="week"
                name={week.title || `Week ${week.weekNumber}`}
                onClose={() => setDeleting(false)}
                onDelete={async () => {
                  await remove.mutateAsync(week.id);
                  if (canNavigate())
                    void navigate(`/college/courses/${encodeURIComponent(week.courseId)}`);
                }}
              />
            )}
          </>
        )
      )}
    </PageContainer>
  );
}
