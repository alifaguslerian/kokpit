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
    <div className="mt-4 pt-4 border-t border-[var(--kokpit-border-subtle)] flex flex-col gap-2 max-w-xl">
      <p
        className="font-display italic text-xl sm:text-2xl text-[var(--kokpit-text-primary)] leading-relaxed"
        aria-live="polite"
      >
        “{currentQuote?.content}”
      </p>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-ui text-xs text-[var(--kokpit-text-muted)]">
          Temporary thought · Unattributed
        </span>
        <button
          type="button"
          onClick={() => setQuoteIndex((previous) => (previous + 1) % quotes.length)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-accent)] transition-colors py-1 px-2 rounded-md hover:bg-[var(--kokpit-surface-hover)]"
          title="Show another temporary thought for this session"
        >
          <RotateCw className="w-3 h-3" aria-hidden="true" />
          <span>Another thought</span>
        </button>
      </div>
    </div>
  );
}
