-- =============================================================================
-- TOXIC / PARRHESIA - INITIAL SEED DATA
-- Populates all tables with the website's default content.
-- =============================================================================

-- 1. SEED: tours
INSERT INTO tours (id, date, time, venue, city, country, status, ticket_url, rsvp_url, description, images, is_featured, visible, created_at)
VALUES
  ('evt_101', '2026-10-24', '20:00', 'Sick New World Festival', 'Fort Worth', 'TX, USA', 'SATIŞTA', 'https://tickets.example.com/snw', '', 'Headline Stage Performance', '{}', true, true, '2026-08-10T12:00:00.000Z'),
  ('evt_102', '2026-11-15', '21:00', 'Accor Stadium', 'Sydney', 'Australia', 'SATIŞTA', 'https://tickets.example.com/sydney', '', 'Oceania Tour Opening Night', '{}', false, true, '2026-08-10T12:30:00.000Z'),
  ('evt_103', '2026-12-05', '20:30', 'O2 Brixton Academy', 'London', 'UK', 'TÜKENDİ', 'https://tickets.example.com/london', '', 'Winter Solstice Special Show', '{}', true, true, '2026-08-10T13:00:00.000Z'),
  ('evt_104', '2025-05-18', '20:00', 'Wembley Arena', 'London', 'UK', 'TÜKENDİ', '', '', 'Sanguivore Ritual Tour', ARRAY['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'], false, true, '2025-05-01T10:00:00.000Z'),
  ('evt_105', '2025-03-12', '21:00', 'Bataclan', 'Paris', 'France', 'TÜKENDİ', '', '', 'European Headline Tour', ARRAY['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80'], false, true, '2025-03-01T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED: releases
INSERT INTO releases (id, title, artist, year, release_date, type, cover_url, description, status, featured, created_at)
VALUES
  ('rel_9mm_hate', '9MM HATE', 'TOXIC', '2026', '18 OCAK 2026', 'ALBUM', 'https://i.imgur.com/ADvecY4.gif', 'Toxic''s flagship 2026 dark alternative / gothic rock album featuring 8 raw, high-contrast tracks.', 'PUBLISHED', true, '2026-01-18T10:00:00.000Z'),
  ('rel_cruel', 'CRUEL', 'TOXIC', '2025', '05 KASIM 2025', 'SINGLE', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 'Heavy guitar riffs and visceral vocals leading the Sanguivore Era.', 'PUBLISHED', false, '2025-11-05T10:00:00.000Z'),
  ('rel_its_the_way', 'IT''S THE WAY', 'TOXIC', '2025', '14 AĞUSTOS 2025', 'SINGLE', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', 'Atmospheric post-punk anthem with sweeping synth basslines.', 'PUBLISHED', false, '2025-08-14T10:00:00.000Z'),
  ('rel_survive', 'SURVIVE', 'TOXIC', '2025', '20 ŞUBAT 2025', 'EP', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', 'The foundational 3-track EP defining Toxic''s signature gothic sound.', 'PUBLISHED', false, '2025-02-20T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED: tracks
INSERT INTO tracks (id, release_id, title, duration, duration_sec, audio_url, track_order)
VALUES
  ('trk_101', 'rel_9mm_hate', 'Parrhesia!', '03:56', 236, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 1),
  ('trk_102', 'rel_9mm_hate', 'Wasn''t Me', '03:23', 203, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 2),
  ('trk_103', 'rel_9mm_hate', 'Betrayal', '03:34', 214, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 3),
  ('trk_104', 'rel_9mm_hate', 'I''m Not Okay', '03:25', 205, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 4),
  ('trk_105', 'rel_9mm_hate', 'For the Night', '03:25', 205, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 5),
  ('trk_106', 'rel_9mm_hate', 'Way to Heaven', '05:57', 357, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 6),
  ('trk_107', 'rel_9mm_hate', 'Still Standing', '04:12', 252, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 7),
  ('trk_108', 'rel_9mm_hate', 'No Longer Quiet', '03:45', 225, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 8),
  ('trk_201', 'rel_cruel', 'Cruel', '04:15', 255, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 1),
  ('trk_202', 'rel_cruel', 'Cruel (Instrumental)', '04:15', 255, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 2),
  ('trk_301', 'rel_its_the_way', 'It''s the Way', '03:48', 228, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 1),
  ('trk_401', 'rel_survive', 'Survive', '04:02', 242, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 1),
  ('trk_402', 'rel_survive', 'Darkness Echoes', '03:50', 230, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 2),
  ('trk_403', 'rel_survive', 'Bloodline', '04:30', 270, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 3)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED: updates
INSERT INTO updates (id, date, category, title, body, image, meta, status, featured, tracklist, links, created_at)
VALUES
  ('upd_104', '12 AUG 2026', 'ESSAY // DISCOGRAPHY', 'THE ANALOG RESONANCE OF 9MM HATE', 
   'The tape machine doesn''t forgive. In an era dominated by surgical digital precision, 9MM HATE was built on physical friction, magnetic tape saturation, and room spill. Every track was tracked live through custom valve preamps directly to a vintage 24-track 2-inch tape machine.\n\nWe spent weeks tuning the room to reflect raw low-frequency pressure without losing the high-register guitar decay. What you hear on the record is the unedited sonic footprint of three human beings occupying the same room at midnight.',
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
   'LONDON // ANALOG SESSION 04', 'PUBLISHED', false,
   ARRAY['01 Parrhesia!', '02 Wasn''t Me', '03 Betrayal', '04 I''m Not Okay'],
   '[{"name": "SPOTIFY", "url": "https://spotify.com"}, {"name": "APPLE MUSIC", "url": "https://apple.com"}, {"name": "BANDCAMP", "url": "https://bandcamp.com"}]'::jsonb,
   '2026-08-12T10:00:00.000Z'),

  ('upd_101', '11 AUG 2026', 'STUDIO DIARY', 'WE''RE STILL HERE. ROOM LOUDNESS & SPECTRUM.',
   'The room has been getting louder. Tape reels spinning late into the morning. Analog synths warming up for the upcoming European tour cycle. We built this space to test sound pressure limits and emotional boundaries.\n\nNo pitch correction, no quantization grids. Just heavy bass frequencies bouncing off brutalist concrete walls.',
   'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
   '01:42 // TOXIC STUDIO', 'PUBLISHED', false,
   ARRAY['01 Sound Test Alpha', '02 Sub-bass Feedback'],
   '[{"name": "SPOTIFY", "url": "https://spotify.com"}, {"name": "SOUNDCLOUD", "url": "https://soundcloud.com"}]'::jsonb,
   '2026-08-11T01:42:00.000Z'),

  ('upd_102', '04 AUG 2026', 'ESSAY // NOISE ARCHIVE', 'NO NEWS. JUST PURE UNFILTERED NOISE.',
   'Reflections on modern music aesthetics, feedback loops, and dynamic tension. Why raw noise remains the purest expression of unfiltered truth in recorded audio.\n\nWhen silence breaks, it shouldn''t apologize. It should demand full presence.',
   'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
   '03:15 // NIGHT TRANSMISSION', 'PUBLISHED', false,
   ARRAY['01 Feedback Loop I', '02 Industrial Decay'],
   '[{"name": "BANDCAMP", "url": "https://bandcamp.com"}]'::jsonb,
   '2026-08-04T03:15:00.000Z'),

  ('upd_103', '28 JUL 2026', 'PHOTOGRAPHY // FIELD RECORDINGS', 'BERLIN INDUSTRIAL SOUNDSCAPE SESSIONS',
   'Field recordings captured across abandoned industrial complexes in East Berlin. Low-frequency hums, resonant acoustic cavities, and metallic decay merged into the atmospheric layers of our upcoming releases.',
   'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
   'BERLIN // FIELD RECORDINGS', 'PUBLISHED', false,
   ARRAY['01 Berlin Ambient Decay'],
   '[{"name": "YOUTUBE", "url": "https://youtube.com"}]'::jsonb,
   '2026-07-28T22:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED: products
INSERT INTO products (id, name, category, price, currency, stock_status, stock_label, sizes, default_size, primary_image, secondary_image, gallery, season, tagline, description, material, size_guide, shipping_info, returns_info)
VALUES
  ('prod_tee_logo', 'TOXIC LOGO TİŞÖRT', 'T-SHIRTS', 45, '€', 'IN_STOCK', 'STOKTA VAR',
   '[{"size": "S", "available": true, "status": "AVAILABLE"}, {"size": "M", "available": true, "status": "AVAILABLE"}, {"size": "L", "available": true, "status": "AVAILABLE"}, {"size": "XL", "available": true, "status": "AVAILABLE"}]'::jsonb,
   'M', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
   ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80'],
   'SONBAHAR/KIŞ 2026', 'İmza Ağır Gramaj Tipografik Grup Tişörtü',
   '240 GSM ağır organik pamuktan üretilmiş, yüksek kontrastlı Toxic arşiv tipografisine ve eskitme dokuya sahip tişört. Rahat ve şık kutu kesim (boxy fit) kalıp.',
   '%100 Taranmış Organik Pamuk, 240 GSM, Önceden yıkanmış vintage yıkama doku.',
   'Sokak modasına uygun kutu kalıp (boxy fit). Günlük rahat duruş için kendi bedeninizi, daha salaş (oversized) bir görünüm için bir beden büyüğünü tercih edin.',
   '2-4 iş günü içerisinde takip kodlu kargo ile gönderim. 120€ üzeri siparişlerde kargo ücretsizdir.',
   'Teslimat tarihinden itibaren 14 gün içinde koşulsuz iade ve değişim garantisi. Ürünler giyilmemiş ve etiketleri sökülmemiş olmalıdır.'),

  ('prod_tee_maybe_sin', 'MADE OF SIN TİŞÖRT', 'T-SHIRTS', 50, '€', 'LOW_STOCK', 'SON ADETLER',
   '[{"size": "S", "available": true, "status": "AVAILABLE"}, {"size": "M", "available": true, "status": "AVAILABLE"}, {"size": "L", "available": true, "status": "LOW STOCK"}, {"size": "XL", "available": false, "status": "SOLD OUT"}]'::jsonb,
   'M', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
   ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80'],
   'SINIRLI ÖZEL SERİ', 'Ön ve Arka Yüksek Çözünürlüklü İpek Baskı',
   'Made of Sin albüm dönemine özel limitli seri tişört. Arkada yüksek yoğunluklu parlak ipek baskı ve eskitme vintage yaka detayı.',
   '%100 Premium Ağır Pamuk, 260 GSM.',
   'Düşük omuzlu salaş (oversized) kesim. Standart kalıp tercih ediyorsanız bir beden küçük seçebilirsiniz.',
   'Özel mat siyah biyolojik olarak parçalanabilir ambalajda, resmi koleksiyoncu kartpostalıyla birlikte gönderilir.',
   'Sınırlı sayıda üretilen ürün. Stok durumuna bağlı olarak 14 gün içinde iade ve değişim yapılabilir.'),

  ('prod_tee_blackout', 'BLACKOUT GRAFİK TİŞÖRT', 'T-SHIRTS', 48, '€', 'IN_STOCK', 'STOKTA VAR',
   '[{"size": "S", "available": true, "status": "AVAILABLE"}, {"size": "M", "available": true, "status": "AVAILABLE"}, {"size": "L", "available": true, "status": "AVAILABLE"}, {"size": "XL", "available": true, "status": "AVAILABLE"}]'::jsonb,
   'L', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
   ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'],
   'TEMEL KOLEKSİYON', 'Monokrom Endüstriyel Ton Sür Ton Baskı',
   'Stüdyo makaraları ve underground beton estetiğinden ilham alan mat siyah üzerine koyu gri ton sür ton grafik baskı.',
   '%100 Organik Ring İplik Pamuk, 220 GSM.',
   'Standart sokak modası rahat kesim.',
   'Dünya geneline standart ve hızlı kargo seçenekleri mevcuttur.',
   '14 gün içinde standart iade ve değişim hakkı.'),

  ('prod_hoodie_heavy', 'TOXIC AĞIR HOODIE', 'HOODIES', 90, '€', 'IN_STOCK', 'STOKTA VAR',
   '[{"size": "S", "available": true, "status": "AVAILABLE"}, {"size": "M", "available": true, "status": "AVAILABLE"}, {"size": "L", "available": true, "status": "AVAILABLE"}, {"size": "XL", "available": true, "status": "AVAILABLE"}]'::jsonb,
   'L', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
   'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
   ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80'],
   'FW26 KOLEKSİYONU', 'Ultra Ağır Gramaj 480 GSM Fransız Havlu Kumaş',
   'Orijinal Toxic sanat çalışmalarını içeren ağır gramajlı kapüşonlu sweatshirt. Çift katmanlı kapüşon ve nervürlü yan paneller.',
   '%100 Fransız Havlu Pamuk (French Terry), 480 GSM.',
   'Hafif dökümlü düşük omuz kalıp. Üzerinize tam oturması için bir beden küçük tercih edebilirsiniz.',
   'Özel korumalı kargo paketi. 120€ üzeri siparişlerde takip numaralı ücretsiz kargo.',
   'Orijinal ambalajında 14 gün içerisinde iade imkanı.')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED: about_slides (Zine Archive & Editorial Slides)
INSERT INTO about_slides (id, title, description, image_url, url, caption, display_order, slide_order)
VALUES
  ('slide_1', '01 // REHEARSAL & NOISE', 'Ham gitar geribildirimi ve analog mikser distorsiyon ayarları sırasında kaydedilen 35mm kontakt baskı.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', '01 // REHEARSAL & NOISE', 1, 1),
  ('slide_2', '02 // STAGE CATHARSIS', 'Yoğun sis, kırmızı spot ışıkları ve 1/60s deklanşör hızıyla yakalanan ham sahne enerjisi.', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80', '02 // STAGE CATHARSIS', 2, 2),
  ('slide_3', '03 // DARKROOM TEXTURE', 'Made of Sin albüm kapağı ve editoryal koleksiyon için karanlık odada elle basılan ilk prova negatifi.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', '03 // DARKROOM TEXTURE', 3, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  url = EXCLUDED.url,
  caption = EXCLUDED.caption,
  display_order = EXCLUDED.display_order,
  slide_order = EXCLUDED.slide_order;

-- 7. SEED: media_items
INSERT INTO media_items (id, name, url, type, size, dimensions)
VALUES
  ('med_101', '9MM HATE Cover Artwork', 'https://i.imgur.com/ADvecY4.gif', 'IMAGE', '1.4 MB', '1200 x 1200'),
  ('med_102', 'Cruel Single Artwork', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 'IMAGE', '850 KB', '1200 x 800'),
  ('med_103', 'It''s The Way Cover', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80', 'IMAGE', '920 KB', '1200 x 800'),
  ('med_104', 'Survive EP Cover', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', 'IMAGE', '780 KB', '1200 x 800'),
  ('med_105', 'Berlin Studio Session Photo', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80', 'IMAGE', '1.1 MB', '1200 x 800')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED: social_links
INSERT INTO social_links (id, name, title, url, target_url, icon_url, display_order, sort_order)
VALUES
  ('soc_1', 'Facebrowser', 'Facebrowser', 'https://face-tr.gta.world/page/parrhesia', 'https://face-tr.gta.world/page/parrhesia', '/icons/facebrowser.ico', 1, 1),
  ('soc_2', 'Youtube', 'Youtube', 'https://www.youtube.com/@thetoxicband', 'https://www.youtube.com/@thetoxicband', '/icons/youtube.png', 2, 2),
  ('soc_3', 'Soundloop', 'Soundloop', 'https://soundloop.app', 'https://soundloop.app', '/icons/soundloop.png', 3, 3),
  ('soc_4', 'LS Chat', 'LS Chat', 'https://chat-tr.gta.world/app/s/107/5398', 'https://chat-tr.gta.world/app/s/107/5398', '/icons/lschat.svg', 4, 4),
  ('soc_5', 'SanMail', 'SanMail', 'https://mail-tr.gta.world/compose?to=mail%40parrhesia.com', 'https://mail-tr.gta.world/compose?to=mail%40parrhesia.com', '/icons/sanmail.png', 5, 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  url = EXCLUDED.url,
  target_url = EXCLUDED.target_url,
  icon_url = EXCLUDED.icon_url,
  display_order = EXCLUDED.display_order,
  sort_order = EXCLUDED.sort_order;

-- 9. SEED: activity_logs
INSERT INTO activity_logs (id, action, details, user_identifier, timestamp)
VALUES
  ('act_1', 'RELEASE CREATED', 'Release "9MM HATE" (Album) published', 'ADMIN', now() - interval '2 hours'),
  ('act_2', 'TOUR DATE UPDATED', 'Tour Event "Sick New World Festival" set to SATIŞTA', 'ADMIN', now() - interval '5 hours'),
  ('act_3', 'TRANSMISSION PUBLISHED', 'Transmission "THE ANALOG RESONANCE OF 9MM HATE" published', 'ADMIN', now() - interval '12 hours')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED: site_settings
INSERT INTO site_settings (
  id, site_title, site_description, artist_name, hero_album_title, contact_email, maintenance_mode, auto_publish_schedule, default_player_volume,
  bio_paragraphs, footer_line1, footer_line2, footer_line4, privacy_policy_url, terms_conditions_url, ai_usage_url
)
VALUES (
  'default',
  'toxic - the band',
  '',
  'TOXIC',
  'MADE OF SIN',
  'booking@toxic.com',
  false,
  true,
  0.80,
  ARRAY[
    'Toxic is an alternative / gothic rock entity existing at the intersection of raw sonic aggression, atmospheric textures, and uncompromising artistic expression.',
    'Formed in shadow, the band merges heavy distorted baritone instrumentation with hypnotic editorial visual aesthetics. Every record, performance, and visual transmission is created as a complete atmospheric experience.',
    'Truth spoken clearly without compromise. No news, just noise.'
  ],
  '© DEVIL''S GRIN RECORDS 2026',
  'MADE OF SIN',
  '© 2026 Toxic',
  '#',
  '#',
  '#'
)
ON CONFLICT (id) DO UPDATE SET
  site_title = EXCLUDED.site_title,
  site_description = EXCLUDED.site_description,
  artist_name = EXCLUDED.artist_name,
  hero_album_title = EXCLUDED.hero_album_title,
  contact_email = EXCLUDED.contact_email,
  footer_line4 = EXCLUDED.footer_line4;
