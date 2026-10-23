import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { KokpitLogo } from '@/components/shared/KokpitLogo';
import { Dialog } from '@/components/ui/Dialog';

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMobileMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--kokpit-bg-app)] text-[var(--kokpit-text-primary)] flex font-ui">
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>
      <Dialog
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        labelledBy="mobile-navigation-title"
        className="!m-0 !h-dvh !max-h-dvh !w-auto !max-w-full !rounded-none !border-0 !p-0"
      >
        <h2 id="mobile-navigation-title" className="sr-only">
          Navigation
        </h2>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} className="h-dvh" />
      </Dialog>
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="md:hidden h-14 bg-[var(--kokpit-bg-sidebar)] border-b border-[var(--kokpit-border-subtle)] flex items-center justify-between px-4 sticky top-0 z-30">
          <KokpitLogo size={28} showTagline={false} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={isMobileMenuOpen}
            className="p-2 text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] rounded-[8px] hover:bg-[var(--kokpit-surface-hover)]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
