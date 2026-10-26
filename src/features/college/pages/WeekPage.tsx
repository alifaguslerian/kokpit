import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { WeekMaterials } from '../components/MaterialWorkspace';
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
            <PageHeader
              eyebrow={`Week ${week.weekNumber}`}
              title={week.title || `Week ${week.weekNumber}`}
              actions={
                <>
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    Edit week
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(true)}>
                    Delete week
                  </Button>
                </>
              }
            />
            {week.notes && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-kokpit-text-secondary">
                {week.notes}
              </p>
            )}
            <WeekMaterials weekId={weekId} />
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
