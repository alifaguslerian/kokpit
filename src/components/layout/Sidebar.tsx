import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, Music, Newspaper, Lightbulb, BookOpen, X } from 'lucide-react';
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
          <NavLink to="/home" className="group focus-visible:outline-none">
            <KokpitLogo size={42} showTagline={true} />
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
