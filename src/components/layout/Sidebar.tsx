import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Disc3, Newspaper, Lightbulb, Bookmark, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { KokpitLogo } from '@/components/shared/KokpitLogo';

export interface NavItemConfig {
  path: string;
  label: string;
  icon: typeof Home;
}

export const navItems: NavItemConfig[] = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/college', label: 'College', icon: GraduationCap },
  { path: '/music', label: 'Music', icon: Disc3 },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb },
  { path: '/library', label: 'Library', icon: Bookmark },
];

export interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'w-[280px] shrink-0 bg-[var(--kokpit-bg-sidebar)] border-r border-[var(--kokpit-border-subtle)] flex flex-col justify-between p-6 select-none',
        className,
      )}
    >
      <div className="flex flex-col gap-8">
        {/* Header / Brand */}
        <div className="flex items-center justify-between">
          <NavLink to="/home" className="group block focus-visible:outline-none">
            <KokpitLogo />
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
                    'flex items-center h-11 px-3.5 gap-3 rounded-[12px] font-ui text-sm transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--kokpit-accent)] focus-visible:outline-offset-1',
                    isActive
                      ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)] font-medium border border-[var(--kokpit-accent)]/30 shadow-sm'
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

      {/* Atmospheric Lower Card per DESIGN_SYSTEM.md */}
      <div className="pt-6">
        <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--kokpit-border-subtle)] bg-gradient-to-b from-[#1c1714]/80 to-[#120f0d] p-3.5 text-center shadow-inner">
          <div className="w-6 h-6 mx-auto rounded-full bg-[var(--kokpit-accent)]/20 flex items-center justify-center mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--kokpit-accent)] shadow-[0_0_8px_var(--kokpit-accent)]" />
          </div>
          <p className="font-display italic text-sm text-[var(--kokpit-accent-hover)] leading-snug">
            A quiet room for focus.
          </p>
          <span className="mt-1.5 text-[10px] uppercase tracking-widest text-[var(--kokpit-text-soft)] font-ui font-medium block">
            Kokpit V1
          </span>
        </div>
      </div>
    </aside>
  );
}
