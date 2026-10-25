import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { FALLBACK_QUOTES, type QuoteItem } from '../data/fallback-quotes';

interface DynamicQuoteProps {
  initialQuote?: QuoteItem;
}

export function DynamicQuote({ initialQuote }: DynamicQuoteProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotes = initialQuote
    ? [initialQuote, ...FALLBACK_QUOTES.filter((quote) => quote.id !== initialQuote.id)]
    : FALLBACK_QUOTES;
  const currentQuote = quotes[quoteIndex % quotes.length];

  return (
    <div className="home-quote">
      <p className="home-quote-text" aria-live="polite">
        “{currentQuote?.content}”
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <span className="font-ui text-xs text-[var(--kokpit-text-secondary)]">
          Temporary thought · Unattributed
        </span>
        <button
          type="button"
          onClick={() => setQuoteIndex((previous) => (previous + 1) % quotes.length)}
          className="home-panel-link min-h-9 rounded-md"
          title="Show another temporary thought for this session"
        >
          <RotateCw className="w-3 h-3" aria-hidden="true" />
          <span>Another thought</span>
        </button>
      </div>
    </div>
  );
}
