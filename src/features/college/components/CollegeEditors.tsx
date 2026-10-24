import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CollegeFormDialog, useCollegeActionGuard } from './CollegeLayout';
import {
  useCreateSemester,
  useUpdateSemester,
  useCreateCourse,
  useUpdateCourse,
  useCreateWeek,
  useUpdateWeek,
} from '../api/use-college';
import type { Semester, Course, Week } from '../types';

export function SemesterEditor({
  semester,
  onClose,
  onCreated,
}: {
  semester?: Semester;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState(semester?.name ?? '');
  const [year, setYear] = useState(semester?.academicYear ?? '');
  const [term, setTerm] = useState(semester?.termNumber?.toString() ?? '');
  const [active, setActive] = useState(semester?.isActive ?? false);
  const create = useCreateSemester();
  const update = useUpdateSemester();
  const canSelect = useCollegeActionGuard();
  const save = async () => {
    const input = {
      name: name.trim(),
      academicYear: year.trim() || null,
      termNumber: term ? Number(term) : null,
      isActive: active,
    };
    const saved = semester
      ? await update.mutateAsync({ id: semester.id, input })
      : await create.mutateAsync(input);
    if (canSelect()) onCreated(saved.id);
  };
  return (
    <CollegeFormDialog
      title={semester ? 'Edit semester' : 'Add semester'}
      submitLabel={semester ? 'Save changes' : 'Create semester'}
      onClose={onClose}
      onSave={save}
    >
      <Input
        label="Semester name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={200}
        required
        pattern=".*\S.*"
        autoFocus
      />
      <Input
        label="Academic year"
        value={year}
        onChange={(event) => setYear(event.target.value)}
        maxLength={50}
        placeholder="e.g. 2026/2027"
      />
      <Input
        label="Term number"
        type="number"
        min={1}
        max={Number.MAX_SAFE_INTEGER}
        step={1}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 accent-[var(--kokpit-accent)]"
        />
        Use as active semester
      </label>
      <p className="text-xs text-kokpit-text-muted">
        The active semester appears on Home. Choosing one replaces the previous active semester.
      </p>
    </CollegeFormDialog>
  );
}

export function CourseEditor({
  semesterId,
  course,
  onClose,
}: {
  semesterId: string;
  course?: Course;
  onClose: () => void;
}) {
  const [name, setName] = useState(course?.name ?? '');
  const [code, setCode] = useState(course?.code ?? '');
  const [lecturer, setLecturer] = useState(course?.lecturer ?? '');
  const create = useCreateCourse();
  const update = useUpdateCourse();
  return (
    <CollegeFormDialog
      title={course ? 'Edit course' : 'Add course'}
      submitLabel={course ? 'Save changes' : 'Create course'}
      onClose={onClose}
      onSave={async () => {
        const input = {
          name: name.trim(),
          code: code.trim() || null,
          lecturer: lecturer.trim() || null,
        };
        if (course) await update.mutateAsync({ id: course.id, input });
        else await create.mutateAsync({ semesterId, input });
      }}
    >
      <Input
        label="Course name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={200}
        required
        pattern=".*\S.*"
        autoFocus
      />
      <Input
        label="Course code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        maxLength={50}
      />
      <Input
        label="Lecturer"
        value={lecturer}
        onChange={(event) => setLecturer(event.target.value)}
        maxLength={200}
      />
    </CollegeFormDialog>
  );
}

export function WeekEditor({
  courseId,
  week,
  nextNumber,
  onClose,
}: {
  courseId: string;
  week?: Week;
  nextNumber: number;
  onClose: () => void;
}) {
  const [number, setNumber] = useState(String(week?.weekNumber ?? nextNumber));
  const [title, setTitle] = useState(week?.title ?? '');
  const [notes, setNotes] = useState(week?.notes ?? '');
  const create = useCreateWeek();
  const update = useUpdateWeek();
  return (
    <CollegeFormDialog
      title={week ? 'Edit week' : 'Add week'}
      submitLabel={week ? 'Save changes' : 'Create week'}
      onClose={onClose}
      onSave={async () => {
        const input = {
          weekNumber: Number(number),
          title: title.trim() || null,
          notes: notes.trim() || null,
        };
        if (week) await update.mutateAsync({ id: week.id, input });
        else await create.mutateAsync({ courseId, input });
      }}
    >
      <Input
        label="Week number"
        type="number"
        min={1}
        max={Number.MAX_SAFE_INTEGER}
        step={1}
        required
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        autoFocus
      />
      <Input
        label="Week title"
        maxLength={200}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Textarea
        label="Notes"
        maxLength={2000}
        rows={4}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
    </CollegeFormDialog>
  );
}
