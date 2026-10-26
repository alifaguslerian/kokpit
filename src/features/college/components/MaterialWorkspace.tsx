import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CollegeLoading, CollegeUnavailable, isMissingCollege } from './CollegeLayout';
import { AddMaterialDialog } from './MaterialEditors';
import { MaterialList } from './MaterialList';
import { useRecentMaterials, useSemesterMaterials, useWeekMaterials } from '../api/use-materials';

export function WeekMaterials({ weekId }: { weekId: string }) {
  const location = useLocation();
  return <WeekMaterialContent key={`${weekId}:${location.key}`} weekId={weekId} />;
}
function WeekMaterialContent({ weekId }: { weekId: string }) {
  const query = useWeekMaterials(weekId);
  const [adding, setAdding] = useState<'file' | 'link' | null>(null);
  const materials = isMissingCollege(query.error) ? [] : (query.data?.pages.flat() ?? []);
  return (
    <section
      aria-labelledby="week-materials-title"
      className="min-w-0 rounded-lg border border-kokpit-border-default bg-kokpit-surface-1 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="week-materials-title" className="text-lg font-semibold">
          Materials
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setAdding('file')}
            leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />}
          >
            Upload file
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAdding('link')}
            leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          >
            Add link
          </Button>
        </div>
      </div>
      {query.isPending ? (
        <CollegeLoading label="Loading materials…" />
      ) : (
        <>
          {query.isError && (
            <CollegeUnavailable error={query.error} retry={() => void query.refetch()} />
          )}
          {!query.isError && materials.length === 0 && (
            <EmptyState
              title="No materials yet"
              description="Upload a private file or save a link for this week."
            />
          )}
          <MaterialList materials={materials} />
          {query.hasNextPage && (
            <Button
              variant="secondary"
              isLoading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              Load more materials
            </Button>
          )}
        </>
      )}
      {adding && (
        <AddMaterialDialog weekId={weekId} kind={adding} onClose={() => setAdding(null)} />
      )}
    </section>
  );
}

export function RecentMaterials({ semesterId }: { semesterId: string }) {
  const query = useRecentMaterials(semesterId);
  return (
    <section
      aria-labelledby="recent-materials-title"
      className="min-w-0 rounded-lg border border-kokpit-border-default bg-kokpit-surface-1 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="recent-materials-title" className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-kokpit-accent" aria-hidden="true" />
          Recent Files &amp; Notes
        </h2>
        <Link
          to={`/college?semester=${encodeURIComponent(semesterId)}&view=materials`}
          className="inline-flex min-h-11 items-center text-sm text-kokpit-accent"
        >
          View materials
        </Link>
      </div>
      {query.isPending ? (
        <CollegeLoading label="Loading recent materials…" />
      ) : query.isError ? (
        <CollegeUnavailable error={query.error} retry={() => void query.refetch()} />
      ) : !query.data?.data.length ? (
        <EmptyState
          title="No recent materials"
          description="Open a course and week to add your first file or link."
        />
      ) : (
        <MaterialList compact materials={query.data.data} />
      )}
    </section>
  );
}

export function SemesterMaterials({ semesterId }: { semesterId: string }) {
  const query = useSemesterMaterials(semesterId);
  const materials = isMissingCollege(query.error)
    ? []
    : (query.data?.pages.flatMap((page) => page.data) ?? []);
  return (
    <section
      aria-labelledby="all-materials-title"
      className="min-w-0 rounded-lg border border-kokpit-border-default bg-kokpit-surface-1 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="all-materials-title" className="text-lg font-semibold">
          All materials
        </h2>
        <Link
          to={`/college?semester=${encodeURIComponent(semesterId)}`}
          className="inline-flex min-h-11 items-center text-sm text-kokpit-accent"
        >
          Back to courses
        </Link>
      </div>
      <p className="mt-2 text-sm text-kokpit-text-secondary">
        Most recently updated first. Open a week to add material.
      </p>
      {query.isPending ? (
        <CollegeLoading label="Loading materials…" />
      ) : (
        <>
          {query.isError && (
            <CollegeUnavailable error={query.error} retry={() => void query.refetch()} />
          )}
          {!query.isError && materials.length === 0 && (
            <EmptyState
              title="No materials yet"
              description="Open a course, choose a week, then upload a file or add a link."
            />
          )}
          <MaterialList materials={materials} />
          {query.hasNextPage && (
            <Button
              variant="secondary"
              isLoading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              Load more materials
            </Button>
          )}
        </>
      )}
    </section>
  );
}
