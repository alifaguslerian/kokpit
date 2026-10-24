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
        'w-[280px] md:w-[220px] min-[90rem]:w-[280px] shrink-0 bg-[var(--kokpit-bg-sidebar)] border-r border-[var(--kokpit-border-subtle)] flex flex-col p-6 select-none overflow-y-auto',
        className,
      )}
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <NavLink to="/home" onClick={onClose} className="group rounded-lg">
            <KokpitLogo size={42} showTagline={true} />
          </NavLink>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="md:hidden p-1.5 text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-text-primary)] rounded-[8px] hover:bg-[var(--kokpit-surface-hover)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

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
                      ? 'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)] font-medium'
                      : 'text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-[var(--kokpit-surface-hover)]',
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
    </aside>
  );
}
