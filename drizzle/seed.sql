-- Kokpit local owner seed
INSERT INTO users (id, email, display_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'owner@example.com',
  'Owner',
  'owner',
  datetime('now'),
  datetime('now')
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_settings (
  user_id,
  timezone,
  locale,
  clock_format,
  quote_rotation_minutes,
  news_refresh_preference_minutes,
  music_volume,
  sidebar_collapsed,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Asia/Jakarta',
  'id-ID',
  '24h',
  60,
  NULL,
  0.70,
  0,
  datetime('now'),
  datetime('now')
)
ON CONFLICT (user_id) DO NOTHING;
