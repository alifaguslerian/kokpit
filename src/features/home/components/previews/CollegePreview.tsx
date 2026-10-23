import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap } from 'lucide-react';

export function CollegePreview() {
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
        <p className="text-sm text-[var(--kokpit-text-secondary)]">
          No college content to show yet.
        </p>
        <p className="mt-1 text-xs text-[var(--kokpit-text-muted)]">
          Your semester and courses will appear here.
        </p>
      </div>
    </section>
  );
}
