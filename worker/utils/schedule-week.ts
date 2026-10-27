export function scheduleWeek(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  // Calendar dates advance in UTC after resolving the owner's local day, avoiding DST-hour arithmetic.
  const today = new Date(Date.UTC(part('year'), part('month') - 1, part('day')));
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + index);
    return { weekday: index + 1, date: day.toISOString().slice(0, 10) };
  });
  return {
    today: today.toISOString().slice(0, 10),
    start: days[0]!.date,
    end: days[6]!.date,
    days,
  };
}
