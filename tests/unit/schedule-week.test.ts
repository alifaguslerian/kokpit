import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleWeek } from '../../worker/utils/schedule-week';
import {
  minuteLabel,
  parseClassTime,
  scheduleDateLabel,
} from '../../src/features/college/schedule-format';

test('local Monday weeks handle date lines, year boundaries, leap days and daylight saving', () => {
  const cases = [
    ['2026-01-04T12:30:00Z', 'Pacific/Kiritimati', '2026-01-05', '2026-01-05', '2026-01-11'],
    ['2026-01-04T12:30:00Z', 'America/Adak', '2026-01-04', '2025-12-29', '2026-01-04'],
    ['2026-03-09T03:30:00Z', 'America/New_York', '2026-03-08', '2026-03-02', '2026-03-08'],
    ['2026-03-09T04:30:00Z', 'America/New_York', '2026-03-09', '2026-03-09', '2026-03-15'],
    ['2026-11-01T06:30:00Z', 'America/New_York', '2026-11-01', '2026-10-26', '2026-11-01'],
    ['2028-02-29T00:00:00Z', 'UTC', '2028-02-29', '2028-02-28', '2028-03-05'],
  ];
  for (const [instant, timezone, today, start, end] of cases) {
    const result = scheduleWeek(new Date(instant!), timezone!);
    assert.equal(result.today, today);
    assert.equal(result.start, start);
    assert.equal(result.end, end);
    assert.deepEqual(
      result.days.map((day) => day.weekday),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(new Set(result.days.map((day) => day.date)).size, 7);
  }
});
test('schedule labels preserve minute precision, midnight and calendar dates', () => {
  assert.equal(minuteLabel(0), '00:00');
  assert.equal(minuteLabel(1439), '23:59');
  assert.equal(minuteLabel(1440), '24:00');
  assert.equal(parseClassTime('08:05'), 485);
  assert.equal(scheduleDateLabel('2026-01-01'), 'Jan 1');
  assert.throws(() => scheduleWeek(new Date('2026-01-01'), 'Invalid/Timezone'), RangeError);
});
