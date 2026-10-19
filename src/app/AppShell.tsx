import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { KokpitLogo } from '@/components/shared/KokpitLogo';

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0908] text-[var(--kokpit-text-primary)] flex font-ui relative overflow-hidden">
      {/* Ambient Atmospheric Photo & Lighting Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Cozy atmospheric study and ambient room photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 filter contrast-115 brightness-90 saturate-[1.1] scale-105 transition-opacity duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2560&q=85')`,
          }}
        />
        {/* Warm ambient lamp diffusion glow (upper right) */}
        <div className="absolute -top-32 right-1/4 w-[900px] h-[900px] bg-gradient-to-br from-[#e6964b]/30 via-[#d7a06d]/20 to-transparent rounded-full blur-[140px]" />
        {/* Secondary cozy hearth glow (lower left) */}
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-[#c68e5a]/25 via-[#a47043]/15 to-transparent rounded-full blur-[120px]" />
        {/* Rich cinematic vignette gradients allowing ambient photo depth to shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0908]/85 via-[#0b0908]/45 to-[#0b0908]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0908]/40 via-transparent to-[#0b0908]/85" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0 relative z-20">
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-[var(--kokpit-bg-sidebar)]/90 backdrop-blur-md border-b border-[var(--kokpit-border-subtle)] flex items-center justify-between px-4 sticky top-0 z-30">
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
