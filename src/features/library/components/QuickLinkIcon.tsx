import { useState } from 'react';
import { Book, Code, Bookmark, Terminal, FileText } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuickLinkIconProps {
  iconType: string;
  iconValue: string | null;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function QuickLinkIcon({
  iconType,
  iconValue,
  name,
  className,
  size = 'md',
}: QuickLinkIconProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const iconKey = (iconValue || '').toLowerCase();
  const isBrand = iconType === 'brand' || iconType === 'platform';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-12 h-12',
  };

  if ((iconType === 'favicon' || iconType === 'custom') && iconValue && failedImage !== iconValue) {
    let imageUrl: URL | null = null;
    try {
      imageUrl = new URL(iconValue);
    } catch {
      /* Object references have no image endpoint in V1. */
    }
    if (imageUrl && ['https:', 'http:'].includes(imageUrl.protocol)) {
      return (
        <img
          src={imageUrl.href}
          alt=""
          referrerPolicy="no-referrer"
          className={cn(sizeClasses[size], 'object-contain', className)}
          onError={() => setFailedImage(iconValue)}
        />
      );
    }
  }

  // Platform SVG logos
  if (isBrand && iconKey === 'github') {
    return (
      <svg
        className={cn(sizeClasses[size], 'fill-current', className)}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }

  if (isBrand && iconKey === 'notion') {
    return (
      <span
        className={cn(
          'font-ui font-bold select-none leading-none flex items-center justify-center',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-4xl' : 'text-sm',
          className,
        )}
      >
        N
      </span>
    );
  }

  if (isBrand && iconKey === 'drive') {
    return (
      <svg
        className={cn(sizeClasses[size], 'shrink-0', className)}
        fill="none"
        viewBox="0 0 87.3 78"
        aria-hidden="true"
      >
        <path
          d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
          fill="#0066DA"
        />
        <path
          d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 49.35C.4 50.75 0 52.3 0 53.85h27.5z"
          fill="#00AC47"
        />
        <path
          d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.95 10.3z"
          fill="#EA4335"
        />
        <path
          d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z"
          fill="#00832D"
        />
        <path
          d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z"
          fill="#2684FC"
        />
        <path
          d="M73.4 26.5 59.65 2.7C58.3 3.5 57.15 4.6 56.35 6L39.85 34.6 43.65 41.2 59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5z"
          fill="#FFBA00"
        />
      </svg>
    );
  }

  if (isBrand && iconKey === 'mail') {
    return (
      <svg
        className={cn(sizeClasses[size], 'shrink-0', className)}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"
          stroke="#EA4335"
          strokeWidth="2"
        />
        <path d="M2 7l10 7 10-7" stroke="#EA4335" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (isBrand && iconKey === 'youtube') {
    return (
      <svg
        className={cn(sizeClasses[size], 'text-[#FF0000] fill-current shrink-0', className)}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (isBrand && iconKey === 'figma') {
    return (
      <svg
        className={cn(sizeClasses[size], 'shrink-0', className)}
        viewBox="0 0 38 57"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
          fill="#1ABCFE"
        />
        <path
          d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
          fill="#0ACF83"
        />
        <path
          d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
          fill="#FF7262"
        />
        <path
          d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
          fill="#F24E1E"
        />
        <path
          d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
          fill="#A259FF"
        />
      </svg>
    );
  }

  if (isBrand && iconKey === 'discord') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn(sizeClasses[size], 'fill-current', className)}
      >
        <path d="M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5l-.6 1.2a18.3 18.3 0 0 0-5.6 0l-.6-1.2a19.8 19.8 0 0 0-4.9 1.5C.6 9 .2 13.4.4 17.8a20 20 0 0 0 6 3l1.2-2a12.8 12.8 0 0 1-1.9-.9l.5-.4a14.1 14.1 0 0 0 11.6 0l.5.4a12.8 12.8 0 0 1-1.9.9l1.2 2a20 20 0 0 0 6-3c.4-5.1-.8-9.5-3.3-13.4ZM8.1 15.1c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Zm7.8 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Z" />
      </svg>
    );
  }

  if (isBrand && iconKey === 'spotify') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn(sizeClasses[size], 'fill-current', className)}
      >
        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .3c-2.8-1.7-6.3-2.1-10.5-1.1a.75.75 0 1 1-.4-1.5c4.6-1 8.5-.6 11.6 1.3.4.2.5.7.3 1Zm1.5-3.4a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.6-11.9-1.4a.94.94 0 1 1-.5-1.8c4.3-1.3 9.7-.7 13.4 1.6.5.3.6.8.3 1.3Zm.1-3.5C15.3 8.1 9 7.9 5.3 9a1.13 1.13 0 1 1-.7-2.1c4.3-1.3 11.2-1.1 15.7 1.5a1.13 1.13 0 0 1-1.2 2Z" />
      </svg>
    );
  }

  // Lucide icon choices
  if (iconType === 'lucide') {
    if (iconKey === 'book') return <Book className={cn(sizeClasses[size], className)} />;
    if (iconKey === 'code') return <Code className={cn(sizeClasses[size], className)} />;
    if (iconKey === 'terminal') return <Terminal className={cn(sizeClasses[size], className)} />;
    if (iconKey === 'file') return <FileText className={cn(sizeClasses[size], className)} />;
    if (iconKey === 'bookmark') return <Bookmark className={cn(sizeClasses[size], className)} />;
  }

  // Default Monogram / Letter Mark if no known logo
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={cn(
        'font-ui font-semibold text-[var(--kokpit-text-secondary)] select-none flex items-center justify-center',
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-4xl' : 'text-sm',
        className,
      )}
    >
      {initial}
    </span>
  );
}
