import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Link2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollegeFormDialog } from './CollegeLayout';
import { EditMaterialDialog } from './MaterialEditors';
import { MaterialFileDialog } from './MaterialFileDialog';
import { useMaterialActions } from '../api/use-materials';
import type { Material } from '../types';

export function MaterialList({
  materials,
  compact = false,
}: {
  materials: Material[];
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<{
    material: Material;
    action: 'edit' | 'delete' | 'open';
  } | null>(null);
  const actions = useMaterialActions();
  return (
    <>
      <ul className="list-none divide-y divide-kokpit-border-subtle">
        {materials.map((material) => (
          <li key={material.id} className="flex min-w-0 items-start gap-3 py-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-kokpit-accent-bg text-kokpit-accent"
              aria-hidden="true"
            >
              {material.type === 'file' ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Link2 className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              {material.type === 'link' && material.externalUrl ? (
                <a
                  className="block min-h-7 break-words text-left text-sm font-medium hover:text-kokpit-accent"
                  href={material.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {material.title}
                </a>
              ) : (
                <button
                  className="block min-h-7 w-full break-words text-left text-sm font-medium hover:text-kokpit-accent"
                  onClick={() => setSelected({ material, action: 'open' })}
                >
                  {material.title}
                </button>
              )}
              <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-kokpit-text-secondary">
                <Link
                  className="break-words hover:text-kokpit-accent"
                  to={`/college/courses/${encodeURIComponent(material.courseId)}`}
                >
                  {material.courseName}
                </Link>
                <Link
                  className="hover:text-kokpit-accent"
                  to={`/college/weeks/${encodeURIComponent(material.weekId)}`}
                >
                  Week {material.weekNumber}
                </Link>
              </p>
              {!compact && (
                <p className="mt-2 break-all text-xs text-kokpit-text-muted">
                  {material.type === 'file'
                    ? `${material.originalFilename} · ${((material.sizeBytes ?? 0) / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB`
                    : 'External link'}{' '}
                  · Updated {new Date(material.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {!compact && (
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Edit ${material.title}`}
                  onClick={() => setSelected({ material, action: 'edit' })}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${material.title}`}
                  onClick={() => setSelected({ material, action: 'delete' })}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {selected?.action === 'edit' && (
        <EditMaterialDialog
          key={selected.material.id}
          material={selected.material}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.action === 'open' && (
        <MaterialFileDialog
          key={selected.material.id}
          material={selected.material}
          onClose={() => setSelected(null)}
        />
      )}
      {selected?.action === 'delete' && (
        <CollegeFormDialog
          title="Delete material?"
          submitLabel="Delete material"
          danger
          onClose={() => setSelected(null)}
          description={`Permanently delete “${selected.material.title}”${selected.material.type === 'file' ? ' and its stored file' : ''}? This cannot be undone.`}
          onSave={() => actions.remove.mutateAsync(selected.material.id)}
        />
      )}
    </>
  );
}
