import { useState, useEffect } from 'react';
import {
  formatClockTime,
  formatHomeDate,
  getTimeContext,
  type FormattedTime,
} from '@/lib/format-time';

export interface UseRealtimeClockResult {
  now: Date;
  time: FormattedTime;
  dateString: string;
  context: {
    greeting: string;
    roomStatus: string;
  };
  is24Hour: boolean;
  toggle24Hour: () => void;
}

export function useRealtimeClock(initial24Hour = false): UseRealtimeClockResult {
  const [now, setNow] = useState(() => new Date());
  const [is24Hour, setIs24Hour] = useState(initial24Hour);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggle24Hour = () => setIs24Hour((prev) => !prev);
  const time = formatClockTime(now, is24Hour);
  const dateString = formatHomeDate(now);
  const context = getTimeContext(now);

  return {
    now,
    time,
    dateString,
    context,
    is24Hour,
    toggle24Hour,
  };
}
