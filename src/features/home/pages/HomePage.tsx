import { HomeHero } from '../components/HomeHero';
import { MusicPreview } from '../components/previews/MusicPreview';
import { CollegePreview } from '../components/previews/CollegePreview';
import { IdeasPreview } from '../components/previews/IdeasPreview';
import { NewsPreview } from '../components/previews/NewsPreview';
import { QuickLinksPreview } from '../components/previews/QuickLinksPreview';

export function HomePage() {
  return (
    <div className="flex flex-col w-full pb-10 animate-fade-in">
      <HomeHero />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start mt-5">
        <div className="lg:col-start-1 lg:row-start-1">
          <MusicPreview />
        </div>
        <div className="lg:col-start-2 lg:row-start-1">
          <CollegePreview />
        </div>
        <div className="lg:col-start-1 lg:row-start-2 lg:row-span-2">
          <IdeasPreview />
        </div>
        <div className="lg:col-start-2 lg:row-start-2">
          <NewsPreview />
        </div>
        <div className="lg:col-start-2 lg:row-start-3">
          <QuickLinksPreview />
        </div>
      </div>
    </div>
  );
}
