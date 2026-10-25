import { HomeHero } from '../components/HomeHero';
import { MusicPreview } from '../components/previews/MusicPreview';
import { CollegePreview } from '../components/previews/CollegePreview';
import { IdeasPreview } from '../components/previews/IdeasPreview';
import { NewsPreview } from '../components/previews/NewsPreview';
import { QuickLinksPreview } from '../components/previews/QuickLinksPreview';

export function HomePage() {
  return (
    <div className="home-page">
      <HomeHero />
      <div className="home-preview-grid">
        <MusicPreview />
        <CollegePreview />
        <IdeasPreview />
        <NewsPreview />
        <QuickLinksPreview />
      </div>
    </div>
  );
}
