import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Music,
  Newspaper,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/college', label: 'College', icon: GraduationCap },
  { path: '/music', label: 'Music', icon: Music },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb },
  { path: '/library', label: 'Library', icon: BookOpen },
];

export function BottomNavigation() {
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className="navigation-dock" data-collapsed={isHidden}>
      <nav
        id="bottom-navigation-links"
        aria-label="Main Navigation"
        className="bottom-navigation"
        hidden={isHidden}
      >
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `bottom-navigation-link${isActive ? ' is-active' : ''}`}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="dock-toggle"
        aria-label={isHidden ? 'Show navigation' : 'Hide navigation'}
        aria-controls="bottom-navigation-links"
        aria-expanded={!isHidden}
        title={isHidden ? 'Show navigation' : 'Hide navigation'}
        onClick={() => setIsHidden((previous) => !previous)}
      >
        {isHidden ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
        {isHidden && <span>Navigation</span>}
      </button>
    </div>
  );
}
