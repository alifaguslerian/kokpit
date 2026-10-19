import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Music, Newspaper, Lightbulb, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface NavItemConfig {
  path: string;
  label: string;
  icon: typeof Home;
}

export const navItems: NavItemConfig[] = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/college', label: 'College', icon: GraduationCap },
  { path: '/music', label: 'Music', icon: Music },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb },
  { path: '/library', label: 'Library', icon: BookOpen },
];

export interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-[260px] lg:w-[280px] shrink-0 bg-[var(--kokpit-bg-sidebar)]/95 backdrop-blur-md border-r border-[var(--kokpit-border-subtle)] flex flex-col justify-between p-6 select-none',
        className,
      )}
    >
      <div className="flex flex-col gap-8">
        {/* Header / Brand matching Stitch */}
        <div className="flex items-center justify-between">
          <NavLink
            to="/home"
            className="group flex items-center gap-3.5 focus-visible:outline-none"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#27201b] via-[#1a1614] to-[#12100f] border border-[var(--kokpit-accent)]/40 flex items-center justify-center shrink-0 shadow-md group-hover:border-[var(--kokpit-accent)]/70 transition-all p-2">
              <div className="absolute inset-0 rounded-xl bg-[var(--kokpit-accent)]/15 blur-xs opacity-70 group-hover:opacity-100 transition-opacity" />
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[var(--kokpit-accent)] relative z-10 drop-shadow-[0_2px_8px_rgba(215,160,109,0.3)] transform group-hover:scale-105 transition-transform"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="opacity-40"
                />
                <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                <path
                  d="M12 3V7.5M12 16.5V21M3 12H7.5M16.5 12H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-display text-2xl font-normal text-[var(--kokpit-text-primary)] leading-none tracking-tight">
                Kokpit
              </span>
              <span className="font-ui text-[9px] uppercase tracking-wider text-[var(--kokpit-text-muted)] font-semibold mt-1">
                A CALMER MIND FOR A FULLER LIFE.
              </span>
            </div>
          </NavLink>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="md:hidden p-1.5 text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] rounded-[8px] hover:bg-white/[0.04]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center h-11 px-3.5 gap-3.5 rounded-[12px] font-ui text-sm transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--kokpit-accent)] focus-visible:outline-offset-1',
                    isActive
                      ? 'bg-[#26211d]/90 text-[var(--kokpit-text-primary)] font-medium border border-[var(--kokpit-accent)]/30 shadow-sm'
                      : 'text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.035] border border-transparent',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-5 h-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-[var(--kokpit-accent)] stroke-[2px]'
                          : 'text-[var(--kokpit-text-muted)] stroke-[1.75px]',
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Atmospheric Lower Card matching Stitch Screenshot */}
      <div className="pt-6">
        <div className="relative overflow-hidden rounded-[18px] border border-[var(--kokpit-border-default)] bg-[var(--kokpit-surface-1)] p-5 text-center shadow-[var(--shadow-card)]">
          {/* Glowing amber lamp orb */}
          <div className="w-3 h-3 rounded-full bg-[var(--kokpit-accent)] shadow-[0_0_12px_var(--kokpit-accent)] mx-auto mb-2.5" />
          <p className="font-display text-lg text-[var(--kokpit-text-primary)] leading-tight font-normal">
            Same Mind.
            <br />
            A Kinder
            <br />
            Tomorrow.
          </p>
          <span className="mt-3 text-[10px] uppercase tracking-widest text-[var(--kokpit-text-soft)] font-ui font-semibold block">
            NIGHT SESSION
          </span>
        </div>
      </div>
    </aside>
  );
}
