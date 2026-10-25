import { Link, Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { KokpitLogo } from '@/components/shared/KokpitLogo';

export function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="room-shell" data-room={pathname === '/home' ? 'home' : 'feature'}>
      <img
        src="/images/room-background.webp"
        alt=""
        aria-hidden="true"
        className="room-background"
        width={1920}
        height={1280}
        decoding="async"
        fetchPriority="high"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
      <div className="room-shade" aria-hidden="true" />
      <a href="#main-content" className="skip-navigation">
        Skip to content
      </a>
      <header className="room-brand">
        <Link to="/home" aria-label="Kokpit home">
          <KokpitLogo size={32} showTagline={false} />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1} className="room-content">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
