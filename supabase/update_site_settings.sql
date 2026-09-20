-- =============================================================================
-- TOXIC - UPDATE SITE SETTINGS & RELEASES MIGRATION SCRIPT
-- Run this script in your Supabase SQL Editor to update live database records.
-- =============================================================================

-- 1. Ensure site_settings columns exist and allow empty/null hero_album_title
ALTER TABLE site_settings 
  ADD COLUMN IF NOT EXISTS site_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_album_title TEXT DEFAULT 'MADE OF SIN';

ALTER TABLE site_settings 
  ALTER COLUMN hero_album_title DROP NOT NULL;

-- 2. Update default row in site_settings
INSERT INTO site_settings (
  id, site_title, site_description, artist_name, hero_album_title, contact_email, maintenance_mode, auto_publish_schedule, default_player_volume, footer_line1, footer_line2, footer_line4
)
VALUES (
  'default', 'toxic - the band', '', 'TOXIC', 'MADE OF SIN', 'booking@toxic.com', false, true, 0.80, '© DEVIL''S GRIN RECORDS 2026', 'MADE OF SIN', '© 2026 Toxic'
)
ON CONFLICT (id) DO UPDATE SET
  site_title = 'toxic - the band',
  site_description = '',
  artist_name = 'TOXIC',
  hero_album_title = 'MADE OF SIN',
  contact_email = 'booking@toxic.com',
  footer_line4 = '© 2026 Toxic',
  updated_at = now();

-- 3. Update existing releases and tracks artist to TOXIC
UPDATE releases 
SET artist = 'TOXIC',
    description = REPLACE(description, 'The Sinners', 'Toxic')
WHERE artist ILIKE '%SINNERS%' OR description ILIKE '%The Sinners%';

-- 4. Update products names and descriptions to TOXIC
UPDATE products
SET name = REPLACE(name, 'THE SINNERS', 'TOXIC'),
    description = REPLACE(description, 'The Sinners', 'Toxic')
WHERE name ILIKE '%SINNERS%' OR description ILIKE '%The Sinners%';

-- 5. Update studio diary updates to TOXIC
UPDATE updates
SET description = REPLACE(description, 'THE SINNERS', 'TOXIC')
WHERE description ILIKE '%THE SINNERS%';

-- 6. Update YouTube social link to @thetoxicband
UPDATE social_links
SET url = 'https://www.youtube.com/@thetoxicband',
    target_url = 'https://www.youtube.com/@thetoxicband'
WHERE url ILIKE '%youtube%' OR target_url ILIKE '%youtube%' OR name ILIKE '%youtube%' OR title ILIKE '%youtube%';

