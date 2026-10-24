import { useLayoutEffect, useRef } from 'react';
import { HomeHero } from '../components/HomeHero';
import { MusicPreview } from '../components/previews/MusicPreview';
import { CollegePreview } from '../components/previews/CollegePreview';
import { IdeasPreview } from '../components/previews/IdeasPreview';
import { NewsPreview } from '../components/previews/NewsPreview';
import { QuickLinksPreview } from '../components/previews/QuickLinksPreview';

export function HomePage() {
  const previews = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = previews.current;
    if (!grid) return;
    const items = Array.from(grid.children) as HTMLElement[];
    const measure = () => {
      const gap = parseFloat(getComputedStyle(grid).columnGap);
      for (const item of items) {
        const content = item.firstElementChild;
        if (!content) continue;
        item.style.setProperty(
          '--preview-rows',
          String(Math.ceil(content.getBoundingClientRect().height + gap)),
        );
      }
    };
    // One-pixel rows let each column follow its content without reordering the DOM or remounting drafts.
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    for (const item of items) {
      if (item.firstElementChild) observer.observe(item.firstElementChild);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-5 min-[90rem]:gap-6">
      <HomeHero />
      <div
        ref={previews}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:auto-rows-[1px] lg:grid-flow-row-dense lg:gap-y-0 min-[90rem]:gap-x-6 items-start"
      >
        <div className="min-w-0 lg:col-start-1 lg:row-span-[var(--preview-rows)]">
          <MusicPreview />
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-[var(--preview-rows)]">
          <CollegePreview />
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-span-[var(--preview-rows)]">
          <IdeasPreview />
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-[var(--preview-rows)]">
          <NewsPreview />
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-[var(--preview-rows)]">
          <QuickLinksPreview />
        </div>
      </div>
    </div>
  );
}
