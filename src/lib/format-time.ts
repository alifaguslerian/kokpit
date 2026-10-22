export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
}

export function formatClockTime(date: Date, use24Hour = false): FormattedTime {
  const rawHours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (use24Hour) {
    const hours = String(rawHours).padStart(2, '0');
    return { hours, minutes, seconds, period: '' };
  }

  const period = rawHours >= 12 ? 'PM' : 'AM';
  const hours12 = rawHours % 12 || 12;
  const hours = String(hours12).padStart(2, '0');

  return { hours, minutes, seconds, period };
}

export function formatHomeDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export function getTimeContext(date: Date): {
  greeting: string;
  roomStatus: string;
} {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Morning focus',
      roomStatus: 'Morning light • Quiet focus',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Afternoon rhythm',
      roomStatus: 'Midday rhythm • Natural light',
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Evening calm',
      roomStatus: 'Amber lamp • Soft transition',
    };
  }
  return {
    greeting: 'Late night',
    roomStatus: 'Quiet room • Deep focus',
  };
}

export function formatRelativeDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
