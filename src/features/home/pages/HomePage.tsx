import { HomeHero } from '../components/HomeHero';
import { MusicPreview } from '../components/previews/MusicPreview';
import { CollegePreview } from '../components/previews/CollegePreview';
import { IdeasPreview } from '../components/previews/IdeasPreview';
import { NewsPreview } from '../components/previews/NewsPreview';
import { QuickLinksPreview } from '../components/previews/QuickLinksPreview';

export function HomePage() {
  return (
    <div className="flex flex-col w-full pb-10 animate-fade-in">
      {/* Visual focal point: Spacious Clock & Atmospheric Hero */}
      <HomeHero />

      {/* Two Vertical Columns matching Stitch Reference Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch mt-1">
        {/* Left Column: Now Playing stacked directly on Ideas & Notes */}
        <div className="flex flex-col gap-5 h-full">
          <MusicPreview />
          <IdeasPreview />
        </div>

        {/* Right Column: College stacked on News stacked on Quick Links */}
        <div className="flex flex-col gap-5 h-full justify-between">
          <CollegePreview />
          <NewsPreview />
          <QuickLinksPreview />
        </div>
      </div>
    </div>
  );
}
