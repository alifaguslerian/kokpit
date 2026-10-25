import { useRealtimeClock } from '../hooks/useRealtimeClock';
import { Clock } from './Clock';
import { DynamicQuote } from './DynamicQuote';

export function HomeHero() {
  const { time, dateString, context } = useRealtimeClock();
  return (
    <section aria-label="Your room" className="home-hero">
      <div className="home-time">
        <h1 className="home-greeting">{context.greeting}</h1>
        <Clock time={time} />
        <p className="home-date">{dateString}</p>
      </div>
      <DynamicQuote />
    </section>
  );
}
