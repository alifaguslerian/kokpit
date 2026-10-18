import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { Providers } from '@/app/providers';
import '@/styles/globals.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Kokpit root element is missing.');
}

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
