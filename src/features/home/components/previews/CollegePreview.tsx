import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

export function CollegePreview() {
  return (
    <div className="bg-[var(--kokpit-surface-1)] rounded-[18px] p-5 sm:p-6 border border-[var(--kokpit-border-default)] shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--kokpit-border-strong)] transition-all">
      <div>
        {/* Header pattern */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--kokpit-border-subtle)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--kokpit-accent)]" />
            <h3 className="font-ui font-semibold text-base text-[var(--kokpit-text-primary)]">
              College
            </h3>
          </div>
          <Link
            to="/college"
            className="inline-flex items-center gap-1 font-ui text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors group-hover:translate-x-0.5"
          >
            <span>Go to College</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Semester & Course Highlight */}
        <div className="flex items-start gap-4 mt-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--kokpit-surface-2)] shadow-md">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=200&q=80"
              alt="University library study hall"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-ui text-xs font-semibold text-[var(--kokpit-text-secondary)]">
                Spring 2026
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent)] font-ui text-[11px] border border-[var(--kokpit-border-subtle)]">
                Week 9 of 14
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 font-ui text-xs text-[var(--kokpit-text-soft)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--kokpit-accent)]" />
              <span>CS 180 • Computer Science</span>
            </div>
            <h4 className="font-ui text-sm text-[var(--kokpit-text-primary)] font-medium mt-1 leading-snug">
              Data Structures and Algorithms
            </h4>
          </div>
        </div>
      </div>

      {/* Next Upcoming Material / Continuation */}
      <div className="mt-5 bg-[var(--kokpit-surface-2)]/80 rounded-xl p-3 flex items-center justify-between border border-[var(--kokpit-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--kokpit-surface-3)] flex items-center justify-center text-[var(--kokpit-accent)] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-ui text-xs text-[var(--kokpit-text-primary)] font-medium truncate">
              Next: Lecture 8 — Balanced Trees
            </span>
            <span className="font-ui text-[11px] text-[var(--kokpit-text-soft)]">
              Tue • 10:30 AM • Hall 204
            </span>
          </div>
        </div>

        <Link
          to="/college"
          className="px-2.5 py-1 rounded-lg bg-[var(--kokpit-surface-3)] hover:bg-[var(--kokpit-surface-hover)] text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] font-ui text-xs font-medium transition-colors border border-[var(--kokpit-border-subtle)] shrink-0 ml-2"
        >
          Materials
        </Link>
      </div>
    </div>
  );
}
