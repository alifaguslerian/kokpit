import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CollegeLoading,
  CollegeUnavailable,
  DeleteCollegeDialog,
  useCollegeActionGuard,
} from '../components/CollegeLayout';
import { SemesterEditor, CourseEditor } from '../components/CollegeEditors';
import {
  useSemesters,
  useCourses,
  useUpdateSemester,
  useDeleteSemester,
  useReorderCourses,
} from '../api/use-college';

export function CollegePage() {
  const [params, setParams] = useSearchParams();
  const canNavigate = useCollegeActionGuard();
  const [editor, setEditor] = useState<'semester' | 'edit-semester' | 'course' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const moving = useRef(false);
  const semestersQuery = useSemesters();
  const semesters = semestersQuery.data ?? [];
  const selected =
    semesters.find((semester) => semester.id === params.get('semester')) ??
    semesters.find((semester) => semester.isActive) ??
    semesters[0];
  const coursesQuery = useCourses(selected?.id ?? '');
  const courses = coursesQuery.data ?? [];
  const activate = useUpdateSemester();
  const remove = useDeleteSemester();
  const reorder = useReorderCourses();
  const select = (id: string) => {
    setActionError('');
    setParams({ semester: id });
  };
  const move = async (from: number, to: number) => {
    if (moving.current || !selected || to < 0 || to >= courses.length) return;
    const ids = courses.map((course) => course.id);
    const [id] = ids.splice(from, 1);
    if (!id) return;
    ids.splice(to, 0, id);
    moving.current = true;
    setActionError('');
    try {
      await reorder.mutateAsync({ semesterId: selected.id, ids });
    } catch {
      setActionError('Could not reorder courses. Please try again.');
    } finally {
      moving.current = false;
    }
  };
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Academic workspace"
        title="College"
        description="A place for your courses, one week at a time."
        actions={
          <Button
            disabled={activate.isPending}
            onClick={() => setEditor('semester')}
            leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          >
            Add semester
          </Button>
        }
      />
      {semestersQuery.isPending ? (
        <CollegeLoading label="Loading semesters…" />
      ) : semestersQuery.isError && !semestersQuery.data ? (
        <CollegeUnavailable
          error={semestersQuery.error}
          retry={() => void semestersQuery.refetch()}
        />
      ) : !selected ? (
        <EmptyState
          title="No semesters yet"
          description="Create a semester, then give each course its own space."
        />
      ) : (
        <>
          {semestersQuery.isError && (
            <CollegeUnavailable
              error={semestersQuery.error}
              retry={() => void semestersQuery.refetch()}
            />
          )}
          <section
            aria-label="Semester workspace"
            className="min-w-0 rounded-lg border border-kokpit-border-default bg-kokpit-surface-1 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0 w-full md:flex-1">
                <label
                  htmlFor="college-semester"
                  className="block text-xs font-medium text-kokpit-text-secondary mb-2"
                >
                  Semester
                </label>
                <select
                  id="college-semester"
                  value={selected.id}
                  onChange={(event) => select(event.target.value)}
                  className="min-h-11 w-full max-w-lg rounded-md border border-kokpit-border-default bg-kokpit-surface-2 px-3 text-sm"
                >
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                      {semester.isActive ? ' · Active' : ''}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-kokpit-text-muted">
                  {selected.isActive ? (
                    <span className="rounded-pill bg-kokpit-accent-bg px-3 py-1 text-kokpit-accent">
                      Active semester
                    </span>
                  ) : (
                    <span>Browsing semester</span>
                  )}
                  {selected.academicYear && (
                    <span className="break-all">{selected.academicYear}</span>
                  )}
                  {selected.termNumber !== null && <span>Term {selected.termNumber}</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!selected.isActive && (
                  <Button
                    variant="secondary"
                    isLoading={activate.isPending}
                    onClick={() => {
                      setActionError('');
                      activate.mutate(
                        { id: selected.id, input: { isActive: true } },
                        {
                          onError: () =>
                            setActionError(
                              'Could not change the active semester. Please try again.',
                            ),
                        },
                      );
                    }}
                  >
                    Make active
                  </Button>
                )}
                <Button
                  variant="ghost"
                  disabled={activate.isPending}
                  onClick={() => setEditor('edit-semester')}
                >
                  Edit semester
                </Button>
                <Button
                  variant="ghost"
                  disabled={activate.isPending}
                  onClick={() => setDeleting(true)}
                >
                  Delete semester
                </Button>
              </div>
            </div>
          </section>
          {actionError && (
            <p role="alert" className="text-sm text-kokpit-text-primary">
              {actionError}
            </p>
          )}
          <section aria-labelledby="college-courses-title" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="college-courses-title" className="text-lg font-semibold">
                Courses
              </h2>
              <Button
                onClick={() => setEditor('course')}
                leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
              >
                Add course
              </Button>
            </div>
            {coursesQuery.isPending ? (
              <CollegeLoading label="Loading courses…" />
            ) : coursesQuery.isError && !coursesQuery.data ? (
              <CollegeUnavailable
                error={coursesQuery.error}
                retry={() => void coursesQuery.refetch()}
              />
            ) : (
              <>
                {coursesQuery.isError && (
                  <CollegeUnavailable
                    error={coursesQuery.error}
                    retry={() => void coursesQuery.refetch()}
                  />
                )}
                {courses.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
                    title="No courses yet"
                    description="Add a course to start organizing its weekly materials."
                  />
                ) : (
                  <ul className="grid list-none grid-cols-1 gap-4 xl:grid-cols-2 min-[90rem]:gap-6">
                    {courses.map((course, index) => (
                      <li
                        key={course.id}
                        className="min-w-0 rounded-lg border border-kokpit-border-default bg-kokpit-surface-1 p-5 sm:p-6"
                      >
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-kokpit-accent-bg text-kokpit-accent">
                          <BookOpen className="h-5 w-5" aria-hidden="true" />
                        </div>
                        {course.code && (
                          <p className="text-xs text-kokpit-text-muted break-all mb-1">
                            {course.code}
                          </p>
                        )}
                        <h3 className="text-base font-semibold break-words">
                          <Link
                            to={`/college/courses/${encodeURIComponent(course.id)}`}
                            className="hover:text-kokpit-accent"
                          >
                            {course.name}
                          </Link>
                        </h3>
                        {course.lecturer && (
                          <p className="mt-2 text-sm text-kokpit-text-secondary break-words">
                            {course.lecturer}
                          </p>
                        )}
                        <div className="mt-5 flex items-center justify-between gap-2 border-t border-kokpit-border-subtle pt-3">
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
                              disabled={index === 0 || reorder.isPending}
                              onClick={() => void move(index, index - 1)}
                            >
                              <ArrowUp className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Move ${course.name} down`}
                              disabled={index === courses.length - 1 || reorder.isPending}
                              onClick={() => void move(index, index + 1)}
                            >
                              <ArrowDown className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </>
      )}
      {(editor === 'semester' || (editor === 'edit-semester' && selected)) && (
        <SemesterEditor
          key={editor === 'edit-semester' ? selected?.id : 'new'}
          {...(editor === 'edit-semester' && selected ? { semester: selected } : {})}
          onClose={() => setEditor(null)}
          onCreated={select}
        />
      )}
      {editor === 'course' && selected && (
        <CourseEditor key={selected.id} semesterId={selected.id} onClose={() => setEditor(null)} />
      )}
      {deleting && selected && (
        <DeleteCollegeDialog
          key={selected.id}
          kind="semester"
          name={selected.name}
          onClose={() => setDeleting(false)}
          onDelete={async () => {
            await remove.mutateAsync(selected.id);
            if (canNavigate()) setParams({});
          }}
        />
      )}
    </PageContainer>
  );
}
