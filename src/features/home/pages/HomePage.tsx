import { HomeHero } from '../components/HomeHero';
import { MusicPreview } from '../components/previews/MusicPreview';
import { CollegePreview } from '../components/previews/CollegePreview';
import { IdeasPreview } from '../components/previews/IdeasPreview';
import { NewsPreview } from '../components/previews/NewsPreview';
import { QuickLinksPreview } from '../components/previews/QuickLinksPreview';

export function HomePage() {
  return (
    <div className="flex flex-col w-full pb-16 animate-fade-in">
      {/* Visual focal point: Spacious Clock & Atmospheric Hero */}
      <HomeHero />

      {/* Highlights Grid: Two balanced columns on desktop per DESIGN_SYSTEM.md */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Row 1: Music & College */}
        <MusicPreview />
        <CollegePreview />

        {/* Row 2: Ideas & News */}
        <IdeasPreview />
        <NewsPreview />
      </div>

      {/* Spanning Row: Quick Links */}
      <QuickLinksPreview />
    </div>
  );
}
