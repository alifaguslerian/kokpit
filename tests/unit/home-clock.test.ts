import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatClockTime, formatHomeDate, getTimeContext } from '../../src/lib/format-time';
import { FALLBACK_QUOTES } from '../../src/features/home/data/fallback-quotes';

describe('Home Clock & Content Unit Tests', () => {
  describe('formatClockTime', () => {
    test('formats 12-hour morning time with AM period', () => {
      const date = new Date(2026, 9, 19, 9, 5, 8); // 09:05:08 AM
      const formatted = formatClockTime(date, false);

      assert.strictEqual(formatted.hours, '09');
      assert.strictEqual(formatted.minutes, '05');
      assert.strictEqual(formatted.seconds, '08');
      assert.strictEqual(formatted.period, 'AM');
    });

    test('formats 12-hour afternoon/evening time with PM period', () => {
      const date = new Date(2026, 9, 19, 21, 30, 45); // 09:30:45 PM
      const formatted = formatClockTime(date, false);

      assert.strictEqual(formatted.hours, '09');
      assert.strictEqual(formatted.minutes, '30');
      assert.strictEqual(formatted.seconds, '45');
      assert.strictEqual(formatted.period, 'PM');
    });

    test('formats midnight (00:00) as 12 AM in 12-hour mode', () => {
      const date = new Date(2026, 9, 19, 0, 15, 0);
      const formatted = formatClockTime(date, false);

      assert.strictEqual(formatted.hours, '12');
      assert.strictEqual(formatted.period, 'AM');
    });

    test('formats noon (12:00) as 12 PM in 12-hour mode', () => {
      const date = new Date(2026, 9, 19, 12, 0, 0);
      const formatted = formatClockTime(date, false);

      assert.strictEqual(formatted.hours, '12');
      assert.strictEqual(formatted.period, 'PM');
    });

    test('formats 24-hour mode without period', () => {
      const date = new Date(2026, 9, 19, 22, 14, 9);
      const formatted = formatClockTime(date, true);

      assert.strictEqual(formatted.hours, '22');
      assert.strictEqual(formatted.minutes, '14');
      assert.strictEqual(formatted.seconds, '09');
      assert.strictEqual(formatted.period, '');
    });
  });

  describe('formatHomeDate', () => {
    test('formats date in standard editorial format', () => {
      const date = new Date(2026, 9, 19); // Oct 19, 2026 (Monday)
      const formatted = formatHomeDate(date);

      assert.ok(formatted.includes('Oct'));
      assert.ok(formatted.includes('19'));
      assert.ok(formatted.includes('2026'));
    });
  });

  describe('getTimeContext', () => {
    test('resolves appropriate greeting for different day periods', () => {
      const morning = getTimeContext(new Date(2026, 9, 19, 8, 0, 0));
      assert.strictEqual(morning.greeting, 'Morning focus');

      const afternoon = getTimeContext(new Date(2026, 9, 19, 14, 0, 0));
      assert.strictEqual(afternoon.greeting, 'Afternoon rhythm');

      const evening = getTimeContext(new Date(2026, 9, 19, 19, 0, 0));
      assert.strictEqual(evening.greeting, 'Evening calm');

      const lateNight = getTimeContext(new Date(2026, 9, 19, 23, 30, 0));
      assert.strictEqual(lateNight.greeting, 'Late night');
    });
  });

  describe('Emergency Fallback Quotes', () => {
    test('provides a healthy pool of compliant fallback quotes', () => {
      assert.ok(FALLBACK_QUOTES.length >= 5);

      for (const quote of FALLBACK_QUOTES) {
        assert.ok(quote.id);
        assert.ok(quote.content && quote.content.length > 10);
        assert.strictEqual(quote.sourceType, 'fallback');
        assert.ok(quote.mood);

        // Ensure word length conforms to CONTENT_SOURCES.md (6-45 words)
        const wordCount = quote.content.trim().split(/\s+/).length;
        assert.ok(
          wordCount >= 6 && wordCount <= 45,
          `Quote "${quote.content}" has invalid word count: ${wordCount}`,
        );
      }
    });
  });
});
