/**
 * PARRHESIA SOCIAL MEDIA LINKS DATA SERVICE
 * Fully powered by Supabase PostgreSQL social_links table.
 */
import { supabase } from '../lib/supabase.js';

export const BUILTIN_SVGS = {
  generic: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`
};

export const DEFAULT_SOCIAL_LINKS = [
  {
    id: 'soc_1',
    name: 'Facebrowser',
    title: 'Facebrowser',
    url: 'https://face-tr.gta.world/page/parrhesia',
    target_url: 'https://face-tr.gta.world/page/parrhesia',
    icon_url: '/icons/facebrowser.ico',
    display_order: 1
  },
  {
    id: 'soc_2',
    name: 'Youtube',
    title: 'Youtube',
    url: 'https://www.youtube.com/@thetoxicband',
    target_url: 'https://www.youtube.com/@thetoxicband',
    icon_url: '/icons/youtube.png',
    display_order: 2
  },
  {
    id: 'soc_3',
    name: 'Soundloop',
    title: 'Soundloop',
    url: 'https://soundloop.app',
    target_url: 'https://soundloop.app',
    icon_url: '/icons/soundloop.png',
    display_order: 3
  },
  {
    id: 'soc_4',
    name: 'LS Chat',
    title: 'LS Chat',
    url: 'https://chat-tr.gta.world/app/s/107/5398',
    target_url: 'https://chat-tr.gta.world/app/s/107/5398',
    icon_url: '/icons/lschat.svg',
    display_order: 4
  },
  {
    id: 'soc_5',
    name: 'SanMail',
    title: 'SanMail',
    url: 'https://mail-tr.gta.world/compose?to=mail%40parrhesia.com',
    target_url: 'https://mail-tr.gta.world/compose?to=mail%40parrhesia.com',
    icon_url: '/icons/sanmail.png',
    display_order: 5
  }
];

export const HEADER_SOCIAL_LINKS = DEFAULT_SOCIAL_LINKS;

const SOCIAL_STORAGE_KEY = 'site_social_links';

function getInitialSocialLinks() {
  try {
    const cached = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Social links cache read error:', e);
  }
  return [...DEFAULT_SOCIAL_LINKS];
}

let inMemorySocialLinks = getInitialSocialLinks();

export function getHeaderSocialLinks() {
  return HEADER_SOCIAL_LINKS;
}

/**
 * Helper to resolve icon URL from platform/item name or URL when icon_url is missing
 */
function resolveSocialIconSrc(item) {
  let iconSrc = item.icon_url || item.iconUrl || item.icon || '';
  if (typeof iconSrc === 'string') iconSrc = iconSrc.trim();

  if (!iconSrc || iconSrc.length < 2) {
    const urlKey = (item.target_url || item.url || item.link || '').toLowerCase();
    const nameKey = (item.title || item.name || '').toLowerCase().replace(/[\s_-]+/g, '');

    if (nameKey.includes('facebrowser') || urlKey.includes('face-tr.gta.world') || urlKey.includes('facebrowser')) {
      return '/icons/facebrowser.ico';
    } else if (nameKey.includes('youtube') || urlKey.includes('youtube.com') || urlKey.includes('youtu.be')) {
      return '/icons/youtube.png';
    } else if (nameKey.includes('soundloop') || urlKey.includes('soundloop.app')) {
      return '/icons/soundloop.png';
    } else if (nameKey.includes('chat') || urlKey.includes('chat-tr.gta.world') || urlKey.includes('lschat')) {
      return '/icons/lschat.svg';
    } else if (nameKey.includes('mail') || urlKey.includes('mail-tr.gta.world') || urlKey.includes('sanmail')) {
      return '/icons/sanmail.png';
    }
  }
  return iconSrc;
}

/**
 * Returns isolated Header Social Icon HTML (restores original 17px design & hover effects)
 */
export function getHeaderSocialIconHTML(item) {
  const iconSrc = resolveSocialIconSrc(item);
  const finalUrl = item.target_url || item.url || item.link || 'https://google.com';

  if (iconSrc) {
    if (iconSrc.startsWith('<svg')) {
      return iconSrc;
    }
    return `<img src="${escapeHtml(iconSrc)}" alt="${escapeHtml(item.title || item.name || 'Social Icon')}" class="header-social-icon-img" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${encodeURIComponent(finalUrl)}&sz=64';" />`;
  }

  return BUILTIN_SVGS.generic;
}

/**
 * Returns isolated Footer Social Icon HTML (22px replica brutalist styling)
 * Guaranteed to match platform icons and never be invisible
 */
export function getFooterSocialIconHTML(item) {
  const iconSrc = resolveSocialIconSrc(item);
  const finalUrl = item.target_url || item.url || item.link || 'https://google.com';

  if (iconSrc) {
    if (iconSrc.startsWith('<svg')) {
      return iconSrc;
    }
    return `<img src="${escapeHtml(iconSrc)}" alt="${escapeHtml(item.title || item.name || 'Social Icon')}" class="footer-replica-icon-img footer-social-img" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${encodeURIComponent(finalUrl)}&sz=64';" />`;
  }

  return BUILTIN_SVGS.generic;
}

export function getSocialIconHTML(item) {
  return getHeaderSocialIconHTML(item);
}

/**
 * Returns current in-memory social links (guaranteed fallback to DEFAULT_SOCIAL_LINKS)
 */
export function getSocialLinks() {
  if (Array.isArray(inMemorySocialLinks) && inMemorySocialLinks.length > 0) {
    return inMemorySocialLinks;
  }
  return DEFAULT_SOCIAL_LINKS;
}

/**
 * Fetches latest social links from Supabase social_links table
 */
export async function fetchSocialLinksFromSupabase() {
  if (!supabase) {
    console.error('Supabase Social Links: client is not initialized.');
    return getSocialLinks();
  }

  try {
    let linksData = null;
    const { data: orderData, error: orderError } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (orderError) {
      console.warn('Supabase display_order fetch attempt:', orderError);
      // Fallback query if table only had sort_order
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!fallbackError && Array.isArray(fallbackData) && fallbackData.length > 0) {
        linksData = fallbackData;
      }
    } else if (Array.isArray(orderData) && orderData.length > 0) {
      linksData = orderData;
    }

    if (Array.isArray(linksData) && linksData.length > 0) {
      inMemorySocialLinks = linksData.map((row, idx) => {
        const title = row.title || row.name || 'Social Link';
        const targetUrl = row.target_url || row.url || row.link || '#';
        const iconUrl = row.icon_url || row.icon || '';
        const orderNum = Number(row.display_order ?? row.sort_order ?? (idx + 1));

        return {
          id: String(row.id || `soc_${idx + 1}`),
          title: title,
          name: title,
          target_url: targetUrl,
          url: targetUrl,
          link: targetUrl,
          icon_url: iconUrl,
          iconUrl: iconUrl,
          icon: iconUrl,
          display_order: orderNum,
          sort_order: orderNum,
          createdAt: row.created_at || new Date().toISOString()
        };
      });

      try {
        localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(inMemorySocialLinks));
      } catch (e) {}
    }

    window.dispatchEvent(new CustomEvent('socials-data-updated'));
    return getSocialLinks();
  } catch (err) {
    console.error('Supabase Social Links Hatası (Network):', err);
    return getSocialLinks();
  }
}

/**
 * Upserts a single social link in Supabase
 */
export async function upsertSocialLink({ id, title, name, target_url, url, icon_url, iconUrl, display_order, sort_order }) {
  if (!supabase) {
    const err = new Error('Supabase client is not initialized.');
    console.error('Supabase Social Link Hatası:', err);
    throw err;
  }

  const linkId = id || ('soc_' + Date.now());
  const finalTitle = title || name || 'Social Link';
  const finalUrl = target_url || url || '#';
  const finalIcon = icon_url || iconUrl || '';
  const orderNum = Number(display_order ?? sort_order ?? 1);

  const payload = {
    id: linkId,
    title: finalTitle,
    name: finalTitle,
    target_url: finalUrl,
    url: finalUrl,
    icon_url: finalIcon,
    display_order: orderNum,
    sort_order: orderNum,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('social_links')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase Social Link Upsert Hatası:', error);
      throw error;
    }

    console.log('Supabase Social Link Upsert Edildi:', data);

    const saved = {
      id: linkId,
      title: finalTitle,
      name: finalTitle,
      target_url: finalUrl,
      url: finalUrl,
      icon_url: finalIcon,
      iconUrl: finalIcon,
      display_order: orderNum,
      sort_order: orderNum,
      createdAt: new Date().toISOString()
    };

    const existingIdx = inMemorySocialLinks.findIndex(s => s.id === linkId);
    if (existingIdx !== -1) {
      inMemorySocialLinks[existingIdx] = saved;
    } else {
      inMemorySocialLinks.push(saved);
    }

    inMemorySocialLinks.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(inMemorySocialLinks));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('socials-data-updated'));
    return saved;
  } catch (err) {
    console.error('Supabase Social Link Hatası:', err);
    throw err;
  }
}

/**
 * Batch saves multiple social links into Supabase
 */
export async function saveSocialLinksBatch(links) {
  if (!supabase) {
    const err = new Error('Supabase client is not initialized.');
    console.error('Supabase Social Links Batch Hatası:', err);
    throw err;
  }

  const payloads = links.map((link, idx) => {
    const linkId = link.id || `soc_${idx + 1}`;
    const finalTitle = link.title || link.name || 'Social Link';
    const finalUrl = link.target_url || link.url || '#';
    const finalIcon = link.icon_url || link.iconUrl || '';
    const orderNum = Number(link.display_order ?? link.sort_order ?? (idx + 1));

    return {
      id: linkId,
      title: finalTitle,
      name: finalTitle,
      target_url: finalUrl,
      url: finalUrl,
      icon_url: finalIcon,
      display_order: orderNum,
      sort_order: orderNum,
      created_at: new Date().toISOString()
    };
  });

  try {
    const { data, error } = await supabase
      .from('social_links')
      .upsert(payloads, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase Social Links Batch Hatası:', error);
      throw error;
    }

    console.log('Supabase Social Links Batch Upsert Edildi:', data);

    inMemorySocialLinks = payloads.map(p => ({
      ...p,
      iconUrl: p.icon_url,
      createdAt: p.created_at
    }));

    inMemorySocialLinks.sort((a, b) => (a.display_order || 1) - (b.display_order || 1));
    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(inMemorySocialLinks));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('socials-data-updated'));
    return inMemorySocialLinks;
  } catch (err) {
    console.error('Supabase Social Links Batch Hatası:', err);
    throw err;
  }
}

export async function addSocialLink({ name, title, url, target_url, iconUrl, icon_url, display_order }) {
  return upsertSocialLink({
    id: 'soc_' + Date.now(),
    title: title || name,
    name: name || title,
    target_url: target_url || url,
    url: url || target_url,
    icon_url: icon_url || iconUrl,
    display_order
  });
}

export async function updateSocialLink(id, { name, title, url, target_url, iconUrl, icon_url, display_order }) {
  return upsertSocialLink({
    id,
    title: title || name,
    name: name || title,
    target_url: target_url || url,
    url: url || target_url,
    icon_url: icon_url || iconUrl,
    display_order
  });
}

export async function deleteSocialLink(id) {
  if (!supabase) {
    const err = new Error('Supabase client is not initialized.');
    console.error('Supabase Social Link Hatası:', err);
    throw err;
  }

  try {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Social Link Silme Hatası:', error);
      throw error;
    }

    inMemorySocialLinks = inMemorySocialLinks.filter(item => item.id !== id);
    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(inMemorySocialLinks));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('socials-data-updated'));
  } catch (err) {
    console.error('Supabase Social Link Silme Hatası:', err);
    throw err;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Initial fetch from Supabase on startup
fetchSocialLinksFromSupabase();

