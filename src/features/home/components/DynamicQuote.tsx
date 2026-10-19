import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { FALLBACK_QUOTES, type QuoteItem } from '../data/fallback-quotes';

interface DynamicQuoteProps {
  initialQuote?: QuoteItem;
}

export function DynamicQuote({ initialQuote }: DynamicQuoteProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotes = FALLBACK_QUOTES;
  const currentQuote = initialQuote ?? quotes[quoteIndex % quotes.length];

  const handleNextThought = () => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  return (
    <div className="pt-4 border-t border-[var(--kokpit-border-subtle)] flex flex-col gap-2 max-w-xl">
      <p className="font-display italic text-lg sm:text-xl text-[var(--kokpit-text-primary)]/95 leading-relaxed font-light">
        “{currentQuote?.content}”
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-ui text-xs text-[var(--kokpit-text-soft)] tracking-wider uppercase font-medium">
          {currentQuote?.author
            ? `— ${currentQuote.author}`
            : `Kokpit · ${currentQuote?.mood ?? 'thought'}`}
        </span>

        <button
          type="button"
          onClick={handleNextThought}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--kokpit-text-muted)] hover:text-[var(--kokpit-accent)] transition-colors py-1 px-2 rounded-md hover:bg-[var(--kokpit-surface-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kokpit-accent)]"
          title="Cycle to another thought for this session"
        >
          <RotateCw className="w-3 h-3 text-[var(--kokpit-accent)]" />
          <span>another thought</span>
        </button>
      </div>
    </div>
  );
}
