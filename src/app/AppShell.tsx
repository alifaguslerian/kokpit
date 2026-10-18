import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { KokpitLogo } from '@/components/shared/KokpitLogo';

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--kokpit-bg-app)] text-[var(--kokpit-text-primary)] flex font-ui">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-[var(--motion-default)] ease-[var(--ease-default)] md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-[var(--kokpit-bg-sidebar)] border-b border-[var(--kokpit-border-subtle)] flex items-center justify-between px-4 sticky top-0 z-30">
          <KokpitLogo size={28} showTagline={false} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] rounded-[8px] hover:bg-white/[0.04]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Route Viewport */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
