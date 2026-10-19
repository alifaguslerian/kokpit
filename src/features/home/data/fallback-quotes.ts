export interface QuoteItem {
  id: string;
  content: string;
  author: string | null;
  mood: string;
  sourceType: 'ai' | 'fallback' | 'custom';
}

export const FALLBACK_QUOTES: QuoteItem[] = [
  {
    id: 'quote-1',
    content: 'The room is quiet, the tea is warm, and that is enough for tonight.',
    author: null,
    mood: 'calm',
    sourceType: 'fallback',
  },
  {
    id: 'quote-2',
    content: 'A problem half-understood is just noise with a deadline.',
    author: null,
    mood: 'student',
    sourceType: 'fallback',
  },
  {
    id: 'quote-3',
    content: 'Some days you build cathedrals; other days you just fix a loose bracket.',
    author: null,
    mood: 'developer',
    sourceType: 'fallback',
  },
  {
    id: 'quote-4',
    content: 'Rest is not a penalty for running out of momentum.',
    author: null,
    mood: 'rest',
    sourceType: 'fallback',
  },
  {
    id: 'quote-5',
    content: 'Every messy draft carries the seed of something coherent.',
    author: null,
    mood: 'creative',
    sourceType: 'fallback',
  },
  {
    id: 'quote-6',
    content: 'One clean commit at a time. The rest can wait until morning.',
    author: null,
    mood: 'developer',
    sourceType: 'fallback',
  },
  {
    id: 'quote-7',
    content: 'Quiet hours yield the clearest thinking.',
    author: null,
    mood: 'reflective',
    sourceType: 'fallback',
  },
];
