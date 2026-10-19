import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap } from 'lucide-react';

export function CollegePreview() {
  return (
    <div className="bg-[#161413]/85 backdrop-blur-xl rounded-[18px] p-4 sm:p-5 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between group hover:border-[var(--kokpit-accent)]/35 transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--kokpit-accent)] shrink-0" />
            <h3 className="font-ui font-medium text-sm text-[var(--kokpit-text-primary)]">
              College
            </h3>
          </div>

          <Link
            to="/college"
            className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Go to College</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Semester & Week pill */}
        <div className="flex items-center gap-2 mt-3.5">
          <h4 className="font-ui font-bold text-base text-[var(--kokpit-text-primary)]">
            Spring 2025
          </h4>
          <span className="px-2 py-0.5 rounded-full bg-[var(--kokpit-surface-2)] text-[10px] text-[var(--kokpit-text-muted)] border border-[var(--kokpit-border-subtle)] font-ui font-medium">
            Week 9 of 14
          </span>
        </div>

        {/* Inner Card Container matching Stitch */}
        <div className="mt-3 bg-[var(--kokpit-surface-2)] rounded-xl p-3 border border-[var(--kokpit-border-default)] flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[var(--kokpit-surface-3)] shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=200&q=80"
              alt="University campus tower"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kokpit-accent)]" />
              <span className="font-ui text-[11px] text-[var(--kokpit-text-muted)]">
                CS 180 • Computer Science
              </span>
            </div>
            <h5 className="font-ui text-sm font-semibold text-[var(--kokpit-text-primary)] truncate mt-0.5">
              Data Structures and Algorithms
            </h5>
            <p className="font-ui text-[11px] text-[var(--kokpit-text-soft)] mt-0.5 truncate">
              Next up: Lecture 8 — Trees • Tue, Apr 22
            </p>
          </div>
        </div>
      </div>

      {/* Bottom link matching Stitch: View Syllabus ↗ */}
      <div className="mt-3 flex justify-end">
        <Link
          to="/college"
          className="inline-flex items-center gap-1 font-ui text-xs text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors"
        >
          <span>View Syllabus</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
