/**
 * TOXIC BACKSTAGE ADMIN YÖNETİM PANELİ MODÜLÜ
 * Turne, Müzik, Haberler, Medya Kütüphanesi, Hakkımızda ve Sistem Ayarları Yönetimi.
 */

import {
  getCategorizedTourEvents,
  getTourEvents,
  addTourEvent,
  updateTourEvent,
  deleteTourEvent,
  toggleTourEventVisibility,
  fetchTourEventsFromSupabase
} from './data/tour.js';

import {
  getReleases,
  addRelease,
  updateRelease,
  deleteRelease,
  getAllTracks
} from './data/music.js';

import {
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  fetchJournalEntriesFromSupabase
} from './data/updates.js';

import {
  getAboutData,
  upsertAboutSlide,
  saveAboutSlidesBatch,
  addSlide,
  updateSlide,
  deleteSlide,
  updateBioParagraphs,
  cleanImageUrl,
  fetchAboutDataFromSupabase
} from './data/about.js';

import {
  getHomePanoItems,
  upsertHomePanoItem,
  saveAllHomePanoItems,
  deleteHomePanoItem,
  addHomePanoItem,
  cleanPanoImageUrl,
  fetchHomePanoFromSupabase
} from './data/pano.js';

import {
  getSocialLinks,
  upsertSocialLink,
  saveSocialLinksBatch,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSocialIconHTML,
  fetchSocialLinksFromSupabase
} from './data/socials.js';

import {
  getMediaItems,
  addMediaItem,
  getMediaUsage,
  deleteMediaItem
} from './data/media.js';

import {
  getActivities,
  logActivity
} from './data/activity.js';

import {
  getSettings,
  saveSettings
} from './data/settings.js';

import {
  getFooterData,
  updateFooterData
} from './data/footer.js';

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  fetchProductsFromSupabase
} from './data/merch.js';

import { supabase } from './lib/supabase.js';

export function showAdminToast(message, type = 'success') {
  let toastContainer = document.getElementById('admin-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'admin-toast-container';
    toastContainer.className = 'admin-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type === 'danger' ? 'toast-danger' : 'toast-success'}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'danger' ? '✕' : '✓'}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

let currentAdminSession = null;

export async function checkAdminAuth() {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data || !data.session) {
      currentAdminSession = null;
      return false;
    }
    currentAdminSession = data.session;
    return true;
  } catch (err) {
    console.error('Supabase Oturum Kontrol Hatası:', err);
    currentAdminSession = null;
    return false;
  }
}

export function initAdminPortal() {
  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      currentAdminSession = session;
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/')) {
        handleAdminRouting();
      }
    });
  }

  handleAdminRouting();

  window.addEventListener('popstate', () => {
    handleAdminRouting();
  });
}

export async function handleAdminRouting() {
  const path = window.location.pathname;
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/');

  const mainSiteContainer = document.querySelector('.site-container');
  const mobileHeader = document.querySelector('.mobile-header');
  const adminRoot = document.getElementById('admin-portal-root');

  if (!adminRoot) return;

  if (isAdminRoute) {
    if (mainSiteContainer) mainSiteContainer.classList.add('hidden');
    if (mobileHeader) mobileHeader.classList.add('hidden');

    adminRoot.classList.remove('hidden');

    const isAuthed = await checkAdminAuth();

    // Oturum yoksa doğrudan /admin sayfasında giriş formunu göster
    if (!isAuthed) {
      renderAdminLogin(adminRoot);
      return;
    }

    if (path === '/admin/tour') {
      renderAdminTour(adminRoot);
    } else if (path === '/admin/music' || path.startsWith('/admin/music/')) {
      renderAdminMusic(adminRoot);
    } else if (path === '/admin/updates' || path === '/admin/news') {
      renderAdminUpdates(adminRoot);
    } else if (path === '/admin/store' || path === '/admin/merch') {
      renderAdminStore(adminRoot);
    } else if (path === '/admin/media') {
      renderAdminMedia(adminRoot);
    } else if (path === '/admin/about') {
      renderAdminAbout(adminRoot);
    } else if (path === '/admin/pano' || path === '/admin/home-pano') {
      renderAdminHomePano(adminRoot);
    } else if (path === '/admin/socials' || path === '/admin/social') {
      renderAdminSocials(adminRoot);
    } else if (path === '/admin/footer') {
      renderAdminFooter(adminRoot);
    } else if (path === '/admin/settings') {
      renderAdminSettings(adminRoot);
    } else {
      renderAdminDashboard(adminRoot);
    }
  } else {
    if (mainSiteContainer) mainSiteContainer.classList.remove('hidden');
    if (mobileHeader) mobileHeader.classList.remove('hidden');

    adminRoot.classList.add('hidden');
    adminRoot.innerHTML = '';
  }
}

function navigateAdmin(path) {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
  handleAdminRouting();
}

/**
 * Yönetici Giriş Ekranı (Supabase Auth E-Posta + Şifre)
 */
function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="admin-login-wrapper login-screen" id="login-screen">
      <div class="admin-login-card login-modal">
        <div class="admin-login-logo-wrap">
          <img src="https://i.imgur.com/RjfqAhE.png" alt="TOXIC" class="admin-login-logo" />
        </div>
        <div class="admin-login-title">TOXIC YÖNETİM PANELİ</div>
        <div class="admin-login-sub">ADMİN GİRİŞİ</div>
        <form id="admin-login-form">
          <div class="admin-form-group">
            <label class="admin-label" for="admin-email-input">Yönetici E-Posta Adresi</label>
            <input 
              type="email" 
              id="admin-email-input" 
              class="admin-input" 
              placeholder="admin@toxic.com" 
              autocomplete="email" 
              autofocus 
              required 
            />
          </div>
          <div class="admin-form-group">
            <label class="admin-label" for="admin-password-input">Şifre</label>
            <input 
              type="password" 
              id="admin-password-input" 
              class="admin-input" 
              placeholder="••••••••" 
              autocomplete="current-password" 
              required 
            />
          </div>
          <button type="submit" class="admin-btn admin-btn-primary" style="width: 100%;">PANELE GİRİŞ YAP</button>
          <div id="admin-error" class="admin-error-msg" style="color: #e05656; font-size: 0.8rem; margin-top: 0.75rem; text-align: center;"></div>
        </form>
      </div>
    </div>
  `;

  const form = container.querySelector('#admin-login-form');
  const emailInput = container.querySelector('#admin-email-input');
  const passwordInput = container.querySelector('#admin-password-input');
  const errorMsg = container.querySelector('#admin-error');

  if (form && emailInput && passwordInput) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'GİRİŞ YAPILIYOR...';
      }
      if (errorMsg) errorMsg.textContent = '';

      if (!supabase) {
        if (errorMsg) errorMsg.textContent = 'Supabase istemcisi başlatılamadı.';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'PANELE GİRİŞ YAP';
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw error;
        }

        console.log('Supabase Giriş Başarılı:', data);
        logActivity('GİRİŞ', `Yönetici (${email}) panele giriş yaptı`);
        showAdminToast('✓ GİRİŞ BAŞARILI');
        handleAdminRouting();
      } catch (err) {
        console.error('Supabase Giriş Hatası:', err);
        if (errorMsg) errorMsg.textContent = err.message || 'Geçersiz e-posta adresi veya şifre.';
        passwordInput.value = '';
        passwordInput.focus();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'PANELE GİRİŞ YAP';
        }
      }
    });
  }
}

/**
 * Ortak Admin Yan Menü (Sidebar) Şablonu
 */
function getAdminSidebarHTML(activeRoute) {
  return `
    <aside id="admin-sidebar" class="admin-sidebar">
      <div>
        <div class="admin-sidebar-brand">
          <div class="admin-brand-title">TOXIC CMS</div>
          <div class="admin-brand-sub">İçerik & Site Yönetim Merkezi</div>
        </div>

        <div class="admin-nav-group">
          <div class="admin-nav-heading">GENEL BAKIŞ</div>
          <ul class="admin-nav-list">
            <li class="admin-nav-item">
              <a href="/admin/dashboard" class="admin-link ${activeRoute === '/admin' || activeRoute === '/admin/dashboard' ? 'active' : ''}">Kontrol Paneli</a>
            </li>
          </ul>
        </div>

        <div class="admin-nav-group">
          <div class="admin-nav-heading">İÇERİK YÖNETİMİ</div>
          <ul class="admin-nav-list">
            <li class="admin-nav-item">
              <a href="/admin/tour" class="admin-link ${activeRoute === '/admin/tour' ? 'active' : ''}">Turne & Konserler</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/music" class="admin-link ${activeRoute === '/admin/music' ? 'active' : ''}">Müzik & Diskografi</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/updates" class="admin-link ${activeRoute === '/admin/updates' ? 'active' : ''}">Haberler & Yazılar</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/store" class="admin-link ${activeRoute === '/admin/store' || activeRoute === '/admin/merch' ? 'active' : ''}">Mağaza (Store)</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/about" class="admin-link ${activeRoute === '/admin/about' ? 'active' : ''}">Hakkımızda & Slaytlar</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/pano" class="admin-link ${activeRoute === '/admin/pano' || activeRoute === '/admin/home-pano' ? 'active' : ''}">Ana Sayfa Panosu</a>
            </li>
          </ul>
        </div>

        <div class="admin-nav-group">
          <div class="admin-nav-heading">MEDYA</div>
          <ul class="admin-nav-list">
            <li class="admin-nav-item">
              <a href="/admin/media" class="admin-link ${activeRoute === '/admin/media' ? 'active' : ''}">Medya Kütüphanesi</a>
            </li>
          </ul>
        </div>

        <div class="admin-nav-group">
          <div class="admin-nav-heading">SİSTEM AYARLARI</div>
          <ul class="admin-nav-list">
            <li class="admin-nav-item">
              <a href="/admin/footer" class="admin-link ${activeRoute === '/admin/footer' ? 'active' : ''}">Alt Bilgi (Footer)</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/socials" class="admin-link ${activeRoute === '/admin/socials' ? 'active' : ''}">Sosyal Medya Linkleri</a>
            </li>
            <li class="admin-nav-item">
              <a href="/admin/settings" class="admin-link ${activeRoute === '/admin/settings' ? 'active' : ''}">Site Ayarları</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-footer">
        <button id="admin-logout-btn" class="admin-logout-link">Çıkış Yap</button>
      </div>
    </aside>
  `;
}

function bindAdminNavEvents(container) {
  const adminLinks = container.querySelectorAll('.admin-link');
  adminLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPath = link.getAttribute('href');
      navigateAdmin(targetPath);
    });
  });

  const mobileToggleBtn = container.querySelector('#admin-mobile-toggle-btn');
  const sidebar = container.querySelector('#admin-sidebar');
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
    });
  }

  const logoutBtn = container.querySelector('#admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Supabase Çıkış Hatası:', e);
        }
      }
      logActivity('ÇIKIŞ', 'Yönetici oturumu kapattı');
      showAdminToast('✓ ÇIKIŞ YAPILDI');
      handleAdminRouting();
    });
  }
}

/**
 * Yönetim Paneli Genel Bakış (Dashboard) Ekranı
 */
function renderAdminDashboard(container) {
  const tours = getTourEvents();
  const upcomingTours = tours.filter(t => t.visible && (t.status === 'SATIŞTA' || t.status === 'UPCOMING'));
  const releases = getReleases();
  const totalTracks = getAllTracks();
  const transmissions = getJournalEntries();
  const mediaItems = getMediaItems();
  const activities = getActivities().slice(0, 8);

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Genel Bakış</h1>
            <p class="admin-page-desc">İçerik ve Sistem İşlem Özeti</p>
          </div>
        </div>

        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-label">KONSER ETKİNLİKLERİ</div>
            <div class="admin-stat-val">${tours.length}</div>
            <div class="admin-stat-sub">${upcomingTours.length} gelecek konser</div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-label">DİSKOGRAFİ</div>
            <div class="admin-stat-val">${releases.length}</div>
            <div class="admin-stat-sub">${totalTracks.length} parça yayında</div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-label">HABERLER & YAZILAR</div>
            <div class="admin-stat-val">${transmissions.length}</div>
            <div class="admin-stat-sub">Kayıtlı yazı ve makale</div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-label">MEDYA DOSYALARI</div>
            <div class="admin-stat-val">${mediaItems.length}</div>
            <div class="admin-stat-sub">Yüklenen görsel ve medya</div>
          </div>
        </div>

        <div class="admin-content-section" style="margin-top: 2.5rem;">
          <h2 class="admin-section-subtitle">SON İŞLEM GEÇMİŞİ</h2>
          <div class="admin-activity-list">
            ${activities.length > 0 ? activities.map(act => `
              <div class="admin-activity-item">
                <div class="activity-left">
                  <span class="activity-badge">${escapeHtml(act.action)}</span>
                  <span class="activity-details">${escapeHtml(act.details)}</span>
                </div>
                <span class="activity-time">${new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${new Date(act.timestamp).toLocaleDateString('tr-TR')}</span>
              </div>
            `).join('') : '<div class="admin-empty-state">Kayıtlı son işlem bulunmuyor.</div>'}
          </div>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);
}

/**
 * --------------------------------------------------------------------------
 * TURNE & KONSER YÖNETİMİ GÖRÜNÜMÜ (/admin/tour)
 * --------------------------------------------------------------------------
 */
let activeTourFilter = 'ALL';
let tourSearchQuery = '';

function renderAdminTour(container) {
  const events = getTourEvents();
  const todayStr = new Date().toISOString().split('T')[0];

  let filtered = events.filter(evt => {
    if (activeTourFilter === 'UPCOMING') return evt.date >= todayStr;
    if (activeTourFilter === 'PAST') return evt.date < todayStr;
    if (activeTourFilter === 'SOLD_OUT') return evt.status === 'TÜKENDİ' || evt.status === 'SOLD OUT';
    if (activeTourFilter === 'DRAFT') return !evt.visible;
    if (activeTourFilter === 'PUBLISHED') return evt.visible;
    return true;
  });

  if (tourSearchQuery.trim()) {
    const q = tourSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(e => 
      (e.venue && e.venue.toLowerCase().includes(q)) || 
      (e.city && e.city.toLowerCase().includes(q)) || 
      (e.country && e.country.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/tour')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Turne & Konser Yönetimi</h1>
            <p class="admin-page-desc">Gelecek ve Geçmiş Konser Etkinliklerini Yönetin</p>
          </div>
          <div class="admin-header-actions" style="display: flex; gap: 0.75rem;">
            <button id="btn-add-upcoming-event" class="admin-btn admin-btn-primary">+ YENİ GELECEK KONSER</button>
            <button id="btn-add-past-event" class="admin-btn admin-btn-secondary" style="border-color: #d92b2b; color: #ffffff; background: rgba(217, 43, 43, 0.15);">+ GEÇMİŞ ETKİNLİK ARŞİVİ</button>
          </div>
        </div>

        <div class="admin-toolbar">
          <div class="admin-search-box">
            <input type="text" id="tour-search-input" class="admin-input" placeholder="Etkinlik, mekan veya şehir ara..." value="${escapeHtml(tourSearchQuery)}" />
          </div>

          <div class="admin-filter-tabs">
            <button class="admin-filter-btn ${activeTourFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">TÜMÜ (${events.length})</button>
            <button class="admin-filter-btn ${activeTourFilter === 'UPCOMING' ? 'active' : ''}" data-filter="UPCOMING">GELECEK KONSERLER</button>
            <button class="admin-filter-btn ${activeTourFilter === 'PAST' ? 'active' : ''}" data-filter="PAST">GEÇMİŞ KONSERLER</button>
            <button class="admin-filter-btn ${activeTourFilter === 'SOLD_OUT' ? 'active' : ''}" data-filter="SOLD_OUT">TÜKENDİ</button>
            <button class="admin-filter-btn ${activeTourFilter === 'PUBLISHED' ? 'active' : ''}" data-filter="PUBLISHED">YAYINDA</button>
            <button class="admin-filter-btn ${activeTourFilter === 'DRAFT' ? 'active' : ''}" data-filter="DRAFT">TASLAKLAR</button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ZAMAN / DÖNEM</th>
                <th>TARİH</th>
                <th>MEKAN & ETKİNLİK</th>
                <th>ŞEHİR / ÜLKE</th>
                <th>DURUM</th>
                <th>FOTOĞRAFLAR</th>
                <th>YAYIN DURUMU</th>
                <th>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              ${renderAdminEventRows(filtered, todayStr)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const searchInput = container.querySelector('#tour-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      tourSearchQuery = e.target.value;
      renderAdminTour(container);
    };
  }

  const filterBtns = container.querySelectorAll('.admin-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      activeTourFilter = btn.getAttribute('data-filter') || 'ALL';
      renderAdminTour(container);
    };
  });

  const addUpcomingBtn = container.querySelector('#btn-add-upcoming-event');
  if (addUpcomingBtn) addUpcomingBtn.onclick = () => openEventModal(null, container, 'UPCOMING');

  const addPastBtn = container.querySelector('#btn-add-past-event');
  if (addPastBtn) addPastBtn.onclick = () => openEventModal(null, container, 'PAST');

  const editBtns = container.querySelectorAll('.btn-edit-event');
  editBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getTourEvents().find(e => e.id === id);
      if (item) openEventModal(item, container);
    };
  });

  const toggleBtns = container.querySelectorAll('.btn-toggle-event');
  toggleBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await toggleTourEventVisibility(id);
      logActivity('KONSER GÜNCELLENDİ', `Konser görünürlüğü değiştirildi: ${id}`);
      showAdminToast('✓ KONSER YAYIN DURUMU GÜNCELLENDİ');
      renderAdminTour(container);
    };
  });

  const deleteBtns = container.querySelectorAll('.btn-delete-event');
  deleteBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getTourEvents().find(e => e.id === id);
      if (item) openDeleteConfirmModal(item, 'TOUR', container);
    };
  });
}

function renderAdminEventRows(events, todayStr) {
  if (events.length === 0) {
    return `<tr><td colspan="8" class="admin-empty-cell">Filtreye uygun etkinlik bulunamadı.</td></tr>`;
  }

  return events.map(evt => {
    const isPast = evt.date < todayStr;
    const photoCount = (evt.images || []).length;
    const displayStatus = isPast ? 'TAMAMLANDI' : (evt.status || 'SATIŞTA');
    const statusBadgeClass = isPast ? 'badge-subtle' : (displayStatus === 'TÜKENDİ' ? 'badge-danger' : 'badge-success');

    return `
      <tr>
        <td>
          <span class="admin-badge ${isPast ? 'badge-subtle' : 'badge-warning'}">${isPast ? 'GEÇMİŞ ETKİNLİK' : 'GELECEK ETKİNLİK'}</span>
        </td>
        <td><strong>${escapeHtml(evt.date)}</strong></td>
        <td>
          <div class="admin-row-title">${escapeHtml(evt.venue)}</div>
          <div class="admin-sub-text">${escapeHtml(evt.description || 'Konser Etkinliği')}</div>
        </td>
        <td>${escapeHtml(evt.city)}, ${escapeHtml(evt.country)}</td>
        <td><span class="admin-badge ${statusBadgeClass}">${escapeHtml(displayStatus)}</span></td>
        <td><strong>${photoCount > 0 ? `📷 ${photoCount} Fotoğraf` : '—'}</strong></td>
        <td>
          <span class="admin-badge ${evt.visible ? 'badge-active' : 'badge-muted'}">${evt.visible ? 'YAYINDA' : 'TASLAK'}</span>
        </td>
        <td>
          <div class="admin-action-btns">
            <button class="admin-action-btn btn-edit-event" data-id="${evt.id}">Düzenle</button>
            <button class="admin-action-btn btn-toggle-event" data-id="${evt.id}">${evt.visible ? 'Yayından Kaldır' : 'Yayınla'}</button>
            <button class="admin-action-btn btn-danger btn-delete-event" data-id="${evt.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openEventModal(eventToEdit, rootContainer, forcedPeriod = null) {
  const isEdit = !!eventToEdit;
  const todayStr = new Date().toISOString().split('T')[0];

  let initialPeriod = 'UPCOMING';
  if (forcedPeriod) {
    initialPeriod = forcedPeriod;
  } else if (eventToEdit) {
    initialPeriod = eventToEdit.date < todayStr ? 'PAST' : 'UPCOMING';
  }

  let initialDate = eventToEdit ? eventToEdit.date : todayStr;
  if (!eventToEdit && initialPeriod === 'PAST') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    initialDate = yesterday.toISOString().split('T')[0];
  }

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal admin-modal-wide" style="max-height: 90vh; display: flex; flex-direction: column;">
      <div class="admin-modal-header" style="position: sticky; top: 0; background: #141418; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem 2rem; z-index: 10;">
        <h2 class="admin-modal-title">${isEdit ? 'KONSER ETKİNLİĞİNİ DÜZENLE' : 'YENİ KONSER ETKİNLİĞİ EKLE'}</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="tour-event-form" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="admin-modal-body" style="padding: 2rem;">
          <div class="admin-form-grid">
            <div class="admin-form-group span-2">
              <label class="admin-label">Etkinlik Dönemi / Kategorisi*</label>
              <select id="evt-period-category" class="admin-input" ${isEdit ? 'disabled' : ''}>
                <option value="UPCOMING" ${initialPeriod === 'UPCOMING' ? 'selected' : ''}>GELECEK ETKİNLİK (Bilet Satışı Aktif)</option>
                <option value="PAST" ${initialPeriod === 'PAST' ? 'selected' : ''}>GEÇMİŞ ETKİNLİK (Arşiv & Fotoğraf Galerisi)</option>
              </select>
            </div>

            <div class="admin-form-group span-2">
              <label class="admin-label">Etkinlik Tarihi (YYYY-AA-GG)*</label>
              <input type="date" id="evt-date" class="admin-input" value="${initialDate}" required />
            </div>

            <div class="admin-form-group span-2">
              <label class="admin-label">Mekan Adı*</label>
              <input type="text" id="evt-venue" class="admin-input" placeholder="Örn: KüçükÇiftlik Park / O2 Brixton Academy" value="${eventToEdit ? escapeHtml(eventToEdit.venue) : ''}" required />
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Şehir*</label>
              <input type="text" id="evt-city" class="admin-input" placeholder="Örn: İstanbul / Londra" value="${eventToEdit ? escapeHtml(eventToEdit.city) : ''}" required />
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Ülke*</label>
              <input type="text" id="evt-country" class="admin-input" placeholder="Örn: Türkiye / İngiltere" value="${eventToEdit ? escapeHtml(eventToEdit.country) : ''}" required />
            </div>

            <div class="admin-form-group" id="evt-status-group">
              <label class="admin-label">Bilet Satış Durumu</label>
              <select id="evt-status" class="admin-input">
                <option value="SATIŞTA" ${eventToEdit && eventToEdit.status === 'SATIŞTA' ? 'selected' : ''}>SATIŞTA</option>
                <option value="TÜKENDİ" ${eventToEdit && eventToEdit.status === 'TÜKENDİ' ? 'selected' : ''}>TÜKENDİ (Sold Out)</option>
                <option value="YEDEK LİSTE" ${eventToEdit && eventToEdit.status === 'YEDEK LİSTE' ? 'selected' : ''}>YEDEK LİSTE</option>
                <option value="İPTAL EDİLDİ" ${eventToEdit && eventToEdit.status === 'İPTAL EDİLDİ' ? 'selected' : ''}>İPTAL EDİLDİ</option>
                <option value="YAKINDA" ${eventToEdit && eventToEdit.status === 'YAKINDA' ? 'selected' : ''}>YAKINDA SATIŞTA</option>
              </select>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Yayın Durumu</label>
              <select id="evt-visible" class="admin-input">
                <option value="true" ${!eventToEdit || eventToEdit.visible ? 'selected' : ''}>YAYINDA (Herkes Görebilir)</option>
                <option value="false" ${eventToEdit && !eventToEdit.visible ? 'selected' : ''}>TASLAK (Gizli)</option>
              </select>
            </div>

            <div class="admin-form-group span-2" id="evt-ticket-url-group">
              <label class="admin-label">Bilet Satış Linki (URL)</label>
              <input type="url" id="evt-ticket-url" class="admin-input" placeholder="https://biletino.com/..." value="${eventToEdit ? escapeHtml(eventToEdit.ticketUrl || '') : ''}" />
            </div>

            <div class="admin-form-group span-2">
              <label class="admin-label">Etkinlik Açıklaması / Alt Başlık</label>
              <input type="text" id="evt-desc" class="admin-input" placeholder="Örn: Headline Canlı Performans" value="${eventToEdit ? escapeHtml(eventToEdit.description || '') : ''}" />
            </div>

            <div class="admin-form-group span-2">
              <label class="admin-label">Geçmiş Etkinlik Fotoğraf Galerisi (Her satıra 1 resim URL'si ekleyin)</label>
              <textarea id="evt-images-textarea" class="admin-input" rows="3" placeholder="https://i.imgur.com/example1.jpg\nhttps://i.imgur.com/example2.jpg">${eventToEdit && eventToEdit.images ? eventToEdit.images.join('\n') : ''}</textarea>
            </div>
          </div>
        </div>

        <div class="admin-modal-footer" style="position: sticky; bottom: 0; background: #0e0e11; border-top: 1px solid rgba(255, 255, 255, 0.15); padding: 1.25rem 2rem; display: flex; justify-content: flex-end; gap: 1rem; z-index: 10;">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary" style="background: #d92b2b; color: #ffffff; padding: 0.75rem 1.8rem; font-size: 0.82rem; font-weight: 700;">KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const periodSelect = modalOverlay.querySelector('#evt-period-category');
  const statusGroup = modalOverlay.querySelector('#evt-status-group');
  const ticketUrlGroup = modalOverlay.querySelector('#evt-ticket-url-group');

  const updateModalFieldsByPeriod = () => {
    const isPast = periodSelect.value === 'PAST';
    if (statusGroup) statusGroup.style.display = isPast ? 'none' : 'block';
    if (ticketUrlGroup) ticketUrlGroup.style.display = isPast ? 'none' : 'block';
  };

  periodSelect.onchange = updateModalFieldsByPeriod;
  updateModalFieldsByPeriod();

  const form = modalOverlay.querySelector('#tour-event-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ KAYDEDİLİYOR...';
    }

    const selectedPeriod = modalOverlay.querySelector('#evt-period-category').value;
    let dateVal = modalOverlay.querySelector('#evt-date').value;
    const todayStr = new Date().toISOString().split('T')[0];

    if (selectedPeriod === 'PAST' && dateVal >= todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      dateVal = yesterday.toISOString().split('T')[0];
    } else if (selectedPeriod === 'UPCOMING' && dateVal < todayStr) {
      dateVal = todayStr;
    }

    const rawImages = modalOverlay.querySelector('#evt-images-textarea').value;
    const imagesList = rawImages.split('\n').map(s => cleanImageUrl(s.trim())).filter(Boolean);

    const data = {
      date: dateVal,
      time: '',
      venue: modalOverlay.querySelector('#evt-venue').value,
      city: modalOverlay.querySelector('#evt-city').value,
      country: modalOverlay.querySelector('#evt-country').value,
      status: selectedPeriod === 'PAST' ? 'TAMAMLANDI' : modalOverlay.querySelector('#evt-status').value,
      visible: modalOverlay.querySelector('#evt-visible').value === 'true',
      ticketUrl: selectedPeriod === 'PAST' ? '' : modalOverlay.querySelector('#evt-ticket-url').value,
      description: modalOverlay.querySelector('#evt-desc').value,
      images: imagesList
    };

    try {
      if (isEdit) {
        await updateTourEvent(eventToEdit.id, data);
        logActivity('KONSER GÜNCELLENDİ', `Konser güncellendi: "${data.venue}" (${data.city})`);
        showAdminToast('✓ KONSER BAŞARIYLA GÜNCELLENDİ');
      } else {
        await addTourEvent(data);
        logActivity('KONSER OLUŞTURULDU', `Yeni konser eklendi: "${data.venue}" (${data.city})`);
        showAdminToast('✓ YENİ KONSER BAŞARIYLA OLUŞTURULDU');
      }
    } catch (err) {
      console.error('Konser kaydetme hatası:', err);
      showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
    } finally {
      closeModal();
      renderAdminTour(rootContainer);
    }
  };
}

/**
 * --------------------------------------------------------------------------
 * MÜZİK & DİSKOGRAFİ YÖNETİMİ GÖRÜNÜMÜ (/admin/music)
 * --------------------------------------------------------------------------
 */
let activeMusicTab = 'ALL';
let musicSearchTerm = '';

function renderAdminMusic(container) {
  const releases = getReleases();

  let filtered = releases.filter(r => {
    if (activeMusicTab === 'ALBUMS') return r.type === 'ALBUM';
    if (activeMusicTab === 'SINGLES') return r.type === 'SINGLE';
    if (activeMusicTab === 'EPS') return r.type === 'EP';
    if (activeMusicTab === 'DRAFTS') return r.status === 'DRAFT';
    return true;
  });

  if (musicSearchTerm.trim()) {
    const q = musicSearchTerm.toLowerCase().trim();
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
  }

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/music')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Müzik & Diskografi Yönetimi</h1>
            <p class="admin-page-desc">Albümler, Single'lar, EP'ler, Şarkı Listeleri ve Ses Dosyaları</p>
          </div>
          <button id="btn-add-release" class="admin-btn admin-btn-primary">+ YENİ YAYIN / ALBÜM EKLE</button>
        </div>

        <div class="admin-toolbar">
          <div class="admin-search-box">
            <input type="text" id="music-search-input" class="admin-input" placeholder="Albüm adı, şarkı veya tür ara..." value="${escapeHtml(musicSearchTerm)}" />
          </div>

          <div class="admin-filter-tabs">
            <button class="admin-filter-btn ${activeMusicTab === 'ALL' ? 'active' : ''}" data-filter="ALL">TÜM YAYINLAR (${releases.length})</button>
            <button class="admin-filter-btn ${activeMusicTab === 'ALBUMS' ? 'active' : ''}" data-filter="ALBUMS">ALBÜMLER</button>
            <button class="admin-filter-btn ${activeMusicTab === 'SINGLES' ? 'active' : ''}" data-filter="SINGLES">SINGLE'LAR</button>
            <button class="admin-filter-btn ${activeMusicTab === 'EPS' ? 'active' : ''}" data-filter="EPS">EP'LER</button>
            <button class="admin-filter-btn ${activeMusicTab === 'DRAFTS' ? 'active' : ''}" data-filter="DRAFTS">TASLAKLAR</button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>KAPAK</th>
                <th>YAYIN ADI</th>
                <th>TÜR</th>
                <th>YAYIN TARİHİ</th>
                <th>PARÇALAR</th>
                <th>DURUM</th>
                <th>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              ${renderAdminReleaseRows(filtered)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const searchInput = container.querySelector('#music-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      musicSearchTerm = e.target.value;
      renderAdminMusic(container);
    };
  }

  const filterBtns = container.querySelectorAll('.admin-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      activeMusicTab = btn.getAttribute('data-filter') || 'ALL';
      renderAdminMusic(container);
    };
  });

  const addBtn = container.querySelector('#btn-add-release');
  if (addBtn) addBtn.onclick = () => openReleaseModal(null, container);

  const editBtns = container.querySelectorAll('.btn-edit-release');
  editBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getReleases().find(r => r.id === id);
      if (item) openReleaseModal(item, container);
    };
  });

  const featureBtns = container.querySelectorAll('.btn-feature-release');
  featureBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const item = getReleases().find(r => r.id === id);
      if (item) {
        const newFeatured = !item.featured;
        btn.disabled = true;
        btn.textContent = '...';
        await updateRelease(id, { featured: newFeatured });
        logActivity('YAYIN GÜNCELLENDİ', `Yayın "${item.title}" öne çıkarılma durumu: ${newFeatured ? 'Öne Çıkarıldı' : 'Normal'}`);
        showAdminToast(newFeatured ? '★ YAYIN ÖNE ÇIKARILDI (LATEST RELEASE YAPILDI)' : '✓ ÖNE ÇIKARMA KALDIRILDI');
        renderAdminMusic(container);
      }
    };
  });

  const toggleBtns = container.querySelectorAll('.btn-toggle-release');
  toggleBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const item = getReleases().find(r => r.id === id);
      if (item) {
        const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        await updateRelease(id, { status: newStatus });
        logActivity('YAYIN GÜNCELLENDİ', `Yayın "${item.title}" durumu değiştirildi: ${newStatus}`);
        showAdminToast('✓ YAYIN DURUMU GÜNCELLENDİ');
        renderAdminMusic(container);
      }
    };
  });

  const deleteBtns = container.querySelectorAll('.btn-delete-release');
  deleteBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getReleases().find(r => r.id === id);
      if (item) openDeleteConfirmModal(item, 'RELEASE', container);
    };
  });
}

function renderAdminReleaseRows(releases) {
  if (releases.length === 0) {
    return `<tr><td colspan="7" class="admin-empty-cell">Filtreye uygun yayın bulunamadı.</td></tr>`;
  }

  return releases.map(rel => {
    const trackCount = (rel.tracks || []).length;
    return `
      <tr>
        <td>
          <img src="${rel.coverUrl}" alt="Kapak" class="admin-thumb-img" />
        </td>
        <td>
          <div class="admin-row-title">${escapeHtml(rel.title)} ${rel.featured ? '<span class="admin-badge badge-warning">ÖNE ÇIKAN</span>' : ''}</div>
          <div class="admin-sub-text">${escapeHtml((rel.artist && rel.artist.toUpperCase().includes('SINNERS')) ? 'TOXIC' : (rel.artist || 'TOXIC'))}</div>
        </td>
        <td><span class="admin-badge badge-subtle">${rel.type}</span></td>
        <td>${escapeHtml(rel.releaseDate || rel.year)}</td>
        <td><strong>${trackCount} ${trackCount === 1 ? 'Parça' : 'Parça'}</strong></td>
        <td>
          <span class="admin-badge ${rel.status === 'PUBLISHED' ? 'badge-active' : 'badge-muted'}">${rel.status === 'PUBLISHED' ? 'YAYINDA' : 'TASLAK'}</span>
        </td>
        <td>
          <div class="admin-action-btns">
            <button class="admin-action-btn btn-feature-release" data-id="${rel.id}" title="${rel.featured ? 'Öne çıkarmayı kaldır' : 'Öne Çıkar (Latest Release Yap)'}" style="${rel.featured ? 'background: #eab308; color: #000; font-weight: 700; border-color: #eab308;' : ''}">
              ${rel.featured ? '★ Öne Çıkan' : '☆ Öne Çıkar'}
            </button>
            <button class="admin-action-btn btn-edit-release" data-id="${rel.id}">Düzenle</button>
            <button class="admin-action-btn btn-toggle-release" data-id="${rel.id}">${rel.status === 'PUBLISHED' ? 'Yayından Kaldır' : 'Yayınla'}</button>
            <button class="admin-action-btn btn-danger btn-delete-release" data-id="${rel.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openReleaseModal(releaseToEdit, rootContainer) {
  const isEdit = !!releaseToEdit;
  let tracksState = releaseToEdit && releaseToEdit.tracks ? JSON.parse(JSON.stringify(releaseToEdit.tracks)) : [
    { id: 'trk_' + Date.now(), title: 'Yeni Şarkı', duration: '03:30', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }
  ];
  let deletedTrackIds = [];

  let testAudioObj = null;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  const renderModalContent = () => {
    modalOverlay.innerHTML = `
      <div class="admin-modal admin-modal-wide">
        <div class="admin-modal-header">
          <h2 class="admin-modal-title">${isEdit ? 'YAYINI VE ŞARKI LİSTESİNİ DÜZENLE' : 'YENİ MÜZİK YAYINI EKLE'}</h2>
          <button type="button" class="admin-modal-close">&times;</button>
        </div>
        <form id="release-form">
          <div class="admin-modal-body admin-grid-layout">
            <div class="admin-modal-main-col">
              <div class="admin-form-grid">
                <div class="admin-form-group span-2">
                  <label class="admin-label">Yayın / Albüm Adı*</label>
                  <input type="text" id="rel-title" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.title) : ''}" required placeholder="Örn: MADE OF SIN" />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Sanatçı Adı*</label>
                  <input type="text" id="rel-artist" class="admin-input" value="${releaseToEdit ? escapeHtml((releaseToEdit.artist && releaseToEdit.artist.toUpperCase().includes('SINNERS')) ? 'TOXIC' : (releaseToEdit.artist || 'TOXIC')) : 'TOXIC'}" required />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Yayın Türü*</label>
                  <select id="rel-type" class="admin-input">
                    <option value="ALBUM" ${releaseToEdit && releaseToEdit.type === 'ALBUM' ? 'selected' : ''}>ALBÜM</option>
                    <option value="SINGLE" ${releaseToEdit && releaseToEdit.type === 'SINGLE' ? 'selected' : ''}>SINGLE</option>
                    <option value="EP" ${releaseToEdit && releaseToEdit.type === 'EP' ? 'selected' : ''}>EP</option>
                  </select>
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Yayın Tarihi Metni*</label>
                  <input type="text" id="rel-date" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.releaseDate) : '18 OCAK 2026'}" placeholder="Örn: 18 OCAK 2026" required />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Yıl*</label>
                  <input type="text" id="rel-year" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.year) : new Date().getFullYear().toString()}" required />
                </div>

                <div class="admin-form-group span-2">
                  <label class="admin-label">Açıklama / Biyografi Notu</label>
                  <textarea id="rel-desc" class="admin-input" rows="2" placeholder="Yayın hakkında kısa açıklama...">${releaseToEdit ? escapeHtml(releaseToEdit.description) : ''}</textarea>
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Spotify Linki</label>
                  <input type="url" id="rel-spotify" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.spotifyUrl || '') : ''}" placeholder="https://open.spotify.com/..." />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Apple Music Linki</label>
                  <input type="url" id="rel-apple" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.appleUrl || '') : ''}" placeholder="https://music.apple.com/..." />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">YouTube Linki</label>
                  <input type="url" id="rel-youtube" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.youtubeUrl || '') : ''}" placeholder="https://youtube.com/..." />
                </div>

                <div class="admin-form-group">
                  <label class="admin-label">Bandcamp / Mağaza Linki</label>
                  <input type="url" id="rel-bandcamp" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.bandcampUrl || '') : ''}" placeholder="https://bandcamp.com/..." />
                </div>
              </div>

              <div class="admin-tracklist-editor" style="margin-top: 2rem;">
                <div class="admin-section-header-row">
                  <h3>ŞARKI LİSTESİ (${tracksState.length} PARÇA)</h3>
                  <button type="button" id="btn-add-track-row" class="admin-btn admin-btn-secondary">+ PARÇA EKLE</button>
                </div>

                <div class="admin-table-container">
                  <table class="admin-table admin-table-compact">
                    <thead>
                      <tr>
                        <th style="width: 30px;">#</th>
                        <th>PARÇA ADI</th>
                        <th style="width: 80px;">SÜRE</th>
                        <th>SES DOSYASI / STREAM URL</th>
                        <th style="width: 110px;">ÖN DİNLEME / İŞLEM</th>
                      </tr>
                    </thead>
                    <tbody id="tracklist-rows-body">
                      ${tracksState.map((t, idx) => `
                        <tr>
                          <td><strong>${idx + 1}</strong></td>
                          <td>
                            <input type="text" class="admin-input input-track-title" data-idx="${idx}" value="${escapeHtml(t.title)}" placeholder="Şarkı adı..." required />
                          </td>
                          <td>
                            <input type="text" class="admin-input input-track-dur" data-idx="${idx}" value="${escapeHtml(t.duration)}" placeholder="03:45" required />
                          </td>
                          <td>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                              <input type="text" class="admin-input input-track-url" data-idx="${idx}" value="${escapeHtml(t.audioUrl)}" placeholder="https://... veya yerel MP3 yükle" required />
                              <label class="admin-file-upload-btn" style="display: inline-block; font-size: 0.72rem; padding: 2px 6px; cursor: pointer; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 3px; text-align: center;">
                                🎵 MP3 Dosyası Yükle
                                <input type="file" class="input-track-file hidden" data-idx="${idx}" accept="audio/*" />
                              </label>
                            </div>
                          </td>
                          <td>
                            <div style="display: flex; gap: 4px; align-items: center;">
                              <button type="button" class="admin-action-btn btn-test-play-audio" data-idx="${idx}" title="Sesi Test Et">▶</button>
                              <button type="button" class="admin-action-btn btn-danger btn-remove-track" data-idx="${idx}">&times;</button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="admin-modal-side-col">
              <div class="admin-form-group">
                <label class="admin-label">Kapak Görseli URL / Yükleme*</label>
                <input type="text" id="rel-cover-url" class="admin-input" value="${releaseToEdit ? escapeHtml(releaseToEdit.coverUrl) : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}" required />
                <label class="admin-btn admin-btn-secondary" style="display: block; width: 100%; margin-top: 6px; text-align: center; cursor: pointer; box-sizing: border-box;">
                  📷 Kapak Resmi Yükle
                  <input type="file" id="rel-cover-file" class="hidden" accept="image/*" />
                </label>
                <div class="admin-img-preview-box" style="margin-top: 0.75rem;">
                  <img id="rel-cover-preview" src="${releaseToEdit ? releaseToEdit.coverUrl : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}" alt="Önizleme" />
                </div>
              </div>

              <div class="admin-form-group" style="margin-top: 1.5rem;">
                <label class="admin-label">Yayın Durumu</label>
                <select id="rel-status" class="admin-input">
                  <option value="PUBLISHED" ${!releaseToEdit || releaseToEdit.status === 'PUBLISHED' ? 'selected' : ''}>YAYINDA (Herkes Görebilir)</option>
                  <option value="DRAFT" ${releaseToEdit && releaseToEdit.status === 'DRAFT' ? 'selected' : ''}>TASLAK (Gizli)</option>
                </select>
              </div>

              <div class="admin-form-group" style="margin-top: 1rem;">
                <label class="admin-checkbox-label">
                  <input type="checkbox" id="rel-featured" ${releaseToEdit && releaseToEdit.featured ? 'checked' : ''} />
                  <span>Ana Öne Çıkan Yayın Olarak Belirle</span>
                </label>
              </div>
            </div>
          </div>

          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
            <button type="submit" class="admin-btn admin-btn-primary">YAYINI KAYDET</button>
          </div>
        </form>
      </div>
    `;

    const stopTestAudio = () => {
      if (testAudioObj) {
        testAudioObj.pause();
        testAudioObj = null;
      }
    };

    const closeModal = () => {
      stopTestAudio();
      modalOverlay.remove();
    };

    modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
    modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

    const coverInput = modalOverlay.querySelector('#rel-cover-url');
    const coverFileInput = modalOverlay.querySelector('#rel-cover-file');
    const coverPreview = modalOverlay.querySelector('#rel-cover-preview');

    if (coverInput && coverPreview) {
      coverInput.oninput = (e) => {
        coverPreview.src = cleanImageUrl(e.target.value);
      };
    }

    if (coverFileInput && coverInput && coverPreview) {
      coverFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            coverInput.value = evt.target.result;
            coverPreview.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const trackFileInputs = modalOverlay.querySelectorAll('.input-track-file');
    trackFileInputs.forEach(input => {
      input.onchange = (e) => {
        const idx = parseInt(input.getAttribute('data-idx'));
        const file = e.target.files[0];
        if (file) {
          const urlInput = modalOverlay.querySelector(`.input-track-url[data-idx="${idx}"]`);
          const durInput = modalOverlay.querySelector(`.input-track-dur[data-idx="${idx}"]`);
          const reader = new FileReader();

          reader.onload = (evt) => {
            if (urlInput) urlInput.value = evt.target.result;
            if (tracksState[idx]) tracksState[idx].audioUrl = evt.target.result;

            const tempAudio = new Audio(evt.target.result);
            tempAudio.onloadedmetadata = () => {
              const m = Math.floor(tempAudio.duration / 60);
              const s = Math.floor(tempAudio.duration % 60);
              const formattedDur = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
              if (durInput) durInput.value = formattedDur;
              if (tracksState[idx]) tracksState[idx].duration = formattedDur;
            };
          };
          reader.readAsDataURL(file);
        }
      };
    });

    const testPlayBtns = modalOverlay.querySelectorAll('.btn-test-play-audio');
    testPlayBtns.forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        syncTracksFromInputs();
        const trk = tracksState[idx];
        if (!trk || !trk.audioUrl) {
          showAdminToast('⚠️ Lütfen önce bir ses bağlantısı (URL) girin veya MP3 yükleyin!');
          return;
        }

        if (testAudioObj && testAudioObj.src === trk.audioUrl && !testAudioObj.paused) {
          testAudioObj.pause();
          btn.textContent = '▶';
        } else {
          stopTestAudio();
          testAudioObj = new Audio(trk.audioUrl);
          testAudioObj.play().then(() => {
            btn.textContent = '⏸';
          }).catch(err => {
            showAdminToast('⚠️ Ses dosyası oynatılamadı: ' + err.message);
          });
          testAudioObj.onended = () => {
            btn.textContent = '▶';
          };
        }
      };
    });

    const addTrackBtn = modalOverlay.querySelector('#btn-add-track-row');
    if (addTrackBtn) {
      addTrackBtn.onclick = () => {
        syncTracksFromInputs();
        tracksState.push({ id: 'trk_' + Date.now(), title: 'Yeni Şarkı', duration: '03:30', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' });
        renderModalContent();
      };
    }

    const removeTrackBtns = modalOverlay.querySelectorAll('.btn-remove-track');
    removeTrackBtns.forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        syncTracksFromInputs();
        const removed = tracksState[idx];
        if (removed && removed.id) {
          deletedTrackIds.push(removed.id);
        }
        tracksState.splice(idx, 1);
        renderModalContent();
      };
    });

    const form = modalOverlay.querySelector('#release-form');
    form.onsubmit = async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ KAYDEDİLİYOR...';
      }

      stopTestAudio();
      syncTracksFromInputs();

      const releaseTitle = modalOverlay.querySelector('#rel-title').value;
      const releaseType = modalOverlay.querySelector('#rel-type').value;

      const formattedTracks = tracksState.map(t => ({
        ...t,
        releaseTitle: releaseTitle,
        type: releaseType
      }));

      const data = {
        title: releaseTitle,
        artist: modalOverlay.querySelector('#rel-artist').value,
        type: releaseType,
        releaseDate: modalOverlay.querySelector('#rel-date').value,
        year: modalOverlay.querySelector('#rel-year').value,
        description: modalOverlay.querySelector('#rel-desc').value,
        spotifyUrl: modalOverlay.querySelector('#rel-spotify').value,
        appleUrl: modalOverlay.querySelector('#rel-apple').value,
        youtubeUrl: modalOverlay.querySelector('#rel-youtube').value,
        bandcampUrl: modalOverlay.querySelector('#rel-bandcamp').value,
        coverUrl: cleanImageUrl(modalOverlay.querySelector('#rel-cover-url').value),
        status: modalOverlay.querySelector('#rel-status').value,
        featured: modalOverlay.querySelector('#rel-featured').checked,
        tracks: formattedTracks
      };

      try {
        if (isEdit) {
          await updateRelease(releaseToEdit.id, data, deletedTrackIds);
          logActivity('YAYIN GÜNCELLENDİ', `Yayın güncellendi: "${data.title}" (${data.type})`);
          showAdminToast('✓ YAYIN VE ŞARKI LİSTESİ BAŞARIYLA KAYDEDİLDİ');
        } else {
          await addRelease(data);
          logActivity('YAYIN OLUŞTURULDU', `Yeni yayın eklendi: "${data.title}" (${data.type})`);
          showAdminToast('✓ YENİ YAYIN BAŞARIYLA OLUŞTURULDU');
        }
      } catch (err) {
        console.error('Yayın kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        closeModal();
        renderAdminMusic(rootContainer);
      }
    };
  };

  const syncTracksFromInputs = () => {
    const titleInputs = modalOverlay.querySelectorAll('.input-track-title');
    const durInputs = modalOverlay.querySelectorAll('.input-track-dur');
    const urlInputs = modalOverlay.querySelectorAll('.input-track-url');

    titleInputs.forEach((inp, idx) => {
      if (tracksState[idx]) {
        tracksState[idx].title = inp.value;
        tracksState[idx].duration = durInputs[idx] ? durInputs[idx].value : '03:30';
        tracksState[idx].audioUrl = urlInputs[idx] ? urlInputs[idx].value : '';
      }
    });
  };

  document.body.appendChild(modalOverlay);
  renderModalContent();
}

/**
 * --------------------------------------------------------------------------
 * HABERLER & YAZILAR YÖNETİMİ GÖRÜNÜMÜ (/admin/updates)
 * --------------------------------------------------------------------------
 */
let activeUpdateFilter = 'ALL';
let updateSearchQuery = '';

function renderAdminUpdates(container) {
  const entries = getJournalEntries();

  let filtered = entries.filter(e => {
    if (activeUpdateFilter === 'PUBLISHED') return e.status !== 'DRAFT';
    if (activeUpdateFilter === 'DRAFT') return e.status === 'DRAFT';
    if (activeUpdateFilter === 'FEATURED') return e.featured;
    return true;
  });

  if (updateSearchQuery.trim()) {
    const q = updateSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(e => (e.title && e.title.toLowerCase().includes(q)) || (e.category && e.category.toLowerCase().includes(q)));
  }

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/updates')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Haberler & Yazılar Yönetimi</h1>
            <p class="admin-page-desc">Haber, Stüdyo Günlüğü, Makale ve Duyuruları Yönetin</p>
          </div>
          <button id="btn-add-journal" class="admin-btn admin-btn-primary">+ YENİ HABER / YAZI OLUŞTUR</button>
        </div>

        <div class="admin-toolbar">
          <div class="admin-search-box">
            <input type="text" id="update-search-input" class="admin-input" placeholder="Yazı başlığı veya kategori ara..." value="${escapeHtml(updateSearchQuery)}" />
          </div>

          <div class="admin-filter-tabs">
            <button class="admin-filter-btn ${activeUpdateFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">TÜMÜ (${entries.length})</button>
            <button class="admin-filter-btn ${activeUpdateFilter === 'PUBLISHED' ? 'active' : ''}" data-filter="PUBLISHED">YAYINDA</button>
            <button class="admin-filter-btn ${activeUpdateFilter === 'DRAFT' ? 'active' : ''}" data-filter="DRAFT">TASLAKLAR</button>
            <button class="admin-filter-btn ${activeUpdateFilter === 'FEATURED' ? 'active' : ''}" data-filter="FEATURED">ÖNE ÇIKANLAR</button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>TARİH</th>
                <th>YAZI BAŞLIĞI</th>
                <th>KATEGORİ</th>
                <th>DURUM</th>
                <th>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              ${renderJournalAdminRows(filtered)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const searchInput = container.querySelector('#update-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      updateSearchQuery = e.target.value;
      renderAdminUpdates(container);
    };
  }

  const filterBtns = container.querySelectorAll('.admin-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      activeUpdateFilter = btn.getAttribute('data-filter') || 'ALL';
      renderAdminUpdates(container);
    };
  });

  const addBtn = container.querySelector('#btn-add-journal');
  if (addBtn) addBtn.onclick = () => openJournalModal(null, container);

  const editBtns = container.querySelectorAll('.btn-edit-journal');
  editBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getJournalEntries().find(e => e.id === id);
      if (item) openJournalModal(item, container);
    };
  });

  const previewBtns = container.querySelectorAll('.btn-preview-journal');
  previewBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getJournalEntries().find(e => e.id === id);
      if (item) openTransmissionPreviewModal(item);
    };
  });

  const toggleBtns = container.querySelectorAll('.btn-toggle-journal');
  toggleBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const item = getJournalEntries().find(e => e.id === id);
      if (item) {
        const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        await updateJournalEntry(id, { status: newStatus });
        logActivity('YAZI GÜNCELLENDİ', `Yazı "${item.title}" durumu değiştirildi: ${newStatus}`);
        showAdminToast('✓ YAZI YAYIN DURUMU GÜNCELLENDİ');
        renderAdminUpdates(container);
      }
    };
  });

  const deleteBtns = container.querySelectorAll('.btn-delete-journal');
  deleteBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getJournalEntries().find(e => e.id === id);
      if (item) openDeleteConfirmModal(item, 'TRANSMISSION', container);
    };
  });
}

function renderJournalAdminRows(entries) {
  if (entries.length === 0) {
    return `<tr><td colspan="5" class="admin-empty-cell">Filtreye uygun yazı kaydı bulunamadı.</td></tr>`;
  }

  return entries.map(item => {
    return `
      <tr>
        <td><strong>${escapeHtml(item.date)}</strong></td>
        <td>
          <div class="admin-row-title">${escapeHtml(item.title)} ${item.featured ? '<span class="admin-badge badge-warning">ÖNE ÇIKAN</span>' : ''}</div>
          <div class="admin-sub-text">${escapeHtml(item.meta || 'Haber Yazısı')}</div>
        </td>
        <td><span class="admin-badge badge-subtle">${escapeHtml(item.category || 'HABER')}</span></td>
        <td><span class="admin-badge ${item.status === 'DRAFT' ? 'badge-muted' : 'badge-active'}">${item.status === 'DRAFT' ? 'TASLAK' : 'YAYINDA'}</span></td>
        <td>
          <div class="admin-action-btns">
            <button class="admin-action-btn btn-edit-journal" data-id="${item.id}">Düzenle</button>
            <button class="admin-action-btn btn-preview-journal" data-id="${item.id}">Önizle</button>
            <button class="admin-action-btn btn-toggle-journal" data-id="${item.id}">${item.status === 'DRAFT' ? 'Yayınla' : 'Yayından Kaldır'}</button>
            <button class="admin-action-btn btn-danger btn-delete-journal" data-id="${item.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openJournalModal(itemToEdit, rootContainer) {
  const isEdit = !!itemToEdit;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal admin-modal-wide">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">${isEdit ? 'YAZIYI DÜZENLE' : 'YENİ HABER / YAZI OLUŞTUR'}</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="journal-entry-form">
        <div class="admin-modal-body admin-grid-layout">
          <div class="admin-modal-main-col">
            <div class="admin-form-grid">
              <div class="admin-form-group span-2">
                <label class="admin-label">Yazı Başlığı*</label>
                <input type="text" id="j-title" class="admin-input" value="${itemToEdit ? escapeHtml(itemToEdit.title) : ''}" required placeholder="Örn: YENİ ALBÜM STÜDYO KAYIT SÜRECİ" />
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Tarih Metni*</label>
                <input type="text" id="j-date" class="admin-input" value="${itemToEdit ? escapeHtml(itemToEdit.date) : '12 AĞU 2026'}" required placeholder="Örn: 12 AĞU 2026" />
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Kategori Etiketi*</label>
                <input type="text" id="j-category" class="admin-input" value="${itemToEdit ? escapeHtml(itemToEdit.category || 'MAKALE // DİSKOGRAFİ') : 'MAKALE // DİSKOGRAFİ'}" required />
              </div>
              <div class="admin-form-group span-2">
                <label class="admin-label">Konum / Stüdyo Bilgisi</label>
                <input type="text" id="j-meta" class="admin-input" value="${itemToEdit ? escapeHtml(itemToEdit.meta || '') : ''}" placeholder="Örn: İSTANBUL // STÜDYO SEANSI 04" />
              </div>
              <div class="admin-form-group span-2">
                <label class="admin-label">Yazı / Makale İçeriği (Paragraflar için çift enter kullanın)*</label>
                <textarea id="j-body" class="admin-input" rows="8" required placeholder="Haber metnini veya stüdyo günlüğünü buraya yazın...">${itemToEdit ? escapeHtml(itemToEdit.body) : ''}</textarea>
              </div>
            </div>
          </div>

          <div class="admin-modal-side-col">
            <div class="admin-form-group">
              <label class="admin-label">Kapak / Görsel URL*</label>
              <input type="url" id="j-image" class="admin-input" value="${itemToEdit ? escapeHtml(itemToEdit.image || '') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'}" required />
              <div class="admin-img-preview-box" style="margin-top: 0.75rem;">
                <img id="j-image-preview" src="${itemToEdit ? itemToEdit.image : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'}" alt="Önizleme" />
              </div>
            </div>

            <div class="admin-form-group" style="margin-top: 1.5rem;">
              <label class="admin-label">Yayın Durumu</label>
              <select id="j-status" class="admin-input">
                <option value="PUBLISHED" ${!itemToEdit || itemToEdit.status === 'PUBLISHED' ? 'selected' : ''}>YAYINDA (Herkes Görebilir)</option>
                <option value="DRAFT" ${itemToEdit && itemToEdit.status === 'DRAFT' ? 'selected' : ''}>TASLAK (Gizli)</option>
              </select>
            </div>

            <div class="admin-form-group" style="margin-top: 1rem;">
              <label class="admin-checkbox-label">
                <input type="checkbox" id="j-featured" ${itemToEdit && itemToEdit.featured ? 'checked' : ''} />
                <span>Öne Çıkan Yazı Olarak Belirle</span>
              </label>
            </div>

            <div style="margin-top: 2rem;">
              <button type="button" id="btn-preview-modal-trigger" class="admin-btn admin-btn-secondary" style="width: 100%;">CANLI ÖNİZLEME</button>
            </div>
          </div>
        </div>

        <div class="admin-modal-footer">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary">YAZIYI KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const imgInput = modalOverlay.querySelector('#j-image');
  const imgPreview = modalOverlay.querySelector('#j-image-preview');
  if (imgInput && imgPreview) {
    imgInput.oninput = (e) => imgPreview.src = cleanImageUrl(e.target.value);
  }

  const previewTrigger = modalOverlay.querySelector('#btn-preview-modal-trigger');
  if (previewTrigger) {
    previewTrigger.onclick = () => {
      const previewData = {
        title: modalOverlay.querySelector('#j-title').value,
        date: modalOverlay.querySelector('#j-date').value,
        category: modalOverlay.querySelector('#j-category').value,
        meta: modalOverlay.querySelector('#j-meta').value,
        body: modalOverlay.querySelector('#j-body').value,
        image: cleanImageUrl(modalOverlay.querySelector('#j-image').value)
      };
      openTransmissionPreviewModal(previewData);
    };
  }

  const form = modalOverlay.querySelector('#journal-entry-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ KAYDEDİLİYOR...';
    }

    const data = {
      title: modalOverlay.querySelector('#j-title').value,
      date: modalOverlay.querySelector('#j-date').value,
      category: modalOverlay.querySelector('#j-category').value,
      meta: modalOverlay.querySelector('#j-meta').value,
      body: modalOverlay.querySelector('#j-body').value,
      image: cleanImageUrl(modalOverlay.querySelector('#j-image').value),
      status: modalOverlay.querySelector('#j-status').value,
      featured: modalOverlay.querySelector('#j-featured').checked
    };

    try {
      if (isEdit) {
        await updateJournalEntry(itemToEdit.id, data);
        logActivity('YAZI GÜNCELLENDİ', `Yazı güncellendi: "${data.title}"`);
        showAdminToast('✓ YAZI BAŞARIYLA GÜNCELLENDİ');
      } else {
        await addJournalEntry(data);
        logActivity('YAZI OLUŞTURULDU', `Yeni yazı eklendi: "${data.title}"`);
        showAdminToast('✓ YENİ YAZI BAŞARIYLA OLUŞTURULDU');
      }
    } catch (err) {
      console.error('Yazı kaydetme hatası:', err);
      showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
    } finally {
      closeModal();
      renderAdminUpdates(rootContainer);
    }
  };
}

function openTransmissionPreviewModal(transmissionData) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  const paragraphs = (transmissionData.body || '').split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');

  modalOverlay.innerHTML = `
    <div class="admin-modal admin-modal-wide admin-preview-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">CANLI ÖNİZLEME — /news</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <div class="admin-modal-body" style="background: #f5f3ee; color: #111113; padding: 2.5rem;">
        <div class="transmission-magazine-spread" style="margin: 0;">
          <div class="spread-left-col">
            <div class="spread-meta-header">
              <span class="spread-cat">${escapeHtml(transmissionData.category || 'HABER')}</span>
              <span class="spread-date">${escapeHtml(transmissionData.date)}</span>
            </div>
            <h2 class="spread-title">${escapeHtml(transmissionData.title)}</h2>
            ${transmissionData.meta ? `<div class="spread-meta-location">${escapeHtml(transmissionData.meta)}</div>` : ''}
            
            <div class="spread-body-text">
              ${paragraphs}
            </div>
          </div>

          <div class="spread-right-col">
            <div class="spread-artwork-box">
              <img src="${escapeHtml(transmissionData.image)}" alt="${escapeHtml(transmissionData.title)}" class="spread-artwork-img" />
            </div>
          </div>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="admin-btn admin-btn-secondary admin-modal-close-btn">ÖNİZLEMEYİ KAPAT</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-close-btn').onclick = closeModal;
}

/**
 * --------------------------------------------------------------------------
 * MAĞAZA & ÜRÜN YÖNETİMİ GÖRÜNÜMÜ (/admin/store)
 * --------------------------------------------------------------------------
 */
let activeStoreFilter = 'ALL';
let storeSearchQuery = '';

function renderAdminStore(container) {
  const products = getProducts();

  let filtered = products.filter(p => {
    if (activeStoreFilter === 'T-SHIRTS') return p.category === 'T-SHIRTS';
    if (activeStoreFilter === 'HOODIES') return p.category === 'HOODIES';
    if (activeStoreFilter === 'VINYL') return p.category === 'VINYL';
    if (activeStoreFilter === 'CASSETTES') return p.category === 'CASSETTES';
    if (activeStoreFilter === 'ACCESSORIES') return p.category === 'ACCESSORIES';
    if (activeStoreFilter === 'IN_STOCK') return p.stockStatus === 'IN_STOCK';
    if (activeStoreFilter === 'LOW_STOCK') return p.stockStatus === 'LOW_STOCK';
    if (activeStoreFilter === 'SOLD_OUT') return p.stockStatus === 'SOLD_OUT';
    return true;
  });

  if (storeSearchQuery.trim()) {
    const q = storeSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.season && p.season.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/store')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Mağaza & Ürün Yönetimi</h1>
            <p class="admin-page-desc">Resmi Giyim, Plaklar, Kasetler, Bedenler ve Stok Durumunu Yönetin</p>
          </div>
          <div class="admin-header-actions" style="display: flex; gap: 0.75rem; align-items: center;">
            <a href="/store-vault" target="_blank" class="admin-btn admin-btn-secondary" style="border-color: #d92b2b; color: #ffffff; background: rgba(217, 43, 43, 0.15); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>👁 MAĞAZAYI CANLI ÖNİZLE</span>
            </a>
            <button id="btn-add-product" class="admin-btn admin-btn-primary">+ YENİ ÜRÜN EKLE</button>
          </div>
        </div>

        <div class="admin-toolbar">
          <div class="admin-search-box">
            <input type="text" id="store-admin-search-input" class="admin-input" placeholder="Ürün adı, kategori veya sezon ara..." value="${escapeHtml(storeSearchQuery)}" />
          </div>

          <div class="admin-filter-tabs">
            <button class="admin-filter-btn ${activeStoreFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">TÜMÜ (${products.length})</button>
            <button class="admin-filter-btn ${activeStoreFilter === 'T-SHIRTS' ? 'active' : ''}" data-filter="T-SHIRTS">TİŞÖRT</button>
            <button class="admin-filter-btn ${activeStoreFilter === 'HOODIES' ? 'active' : ''}" data-filter="HOODIES">KAPÜŞONLU</button>
            <button class="admin-filter-btn ${activeStoreFilter === 'VINYL' ? 'active' : ''}" data-filter="VINYL">PLAK</button>
            <button class="admin-filter-btn ${activeStoreFilter === 'CASSETTES' ? 'active' : ''}" data-filter="CASSETTES">KASET</button>
            <button class="admin-filter-btn ${activeStoreFilter === 'ACCESSORIES' ? 'active' : ''}" data-filter="ACCESSORIES">AKSESUAR</button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>GÖRSEL</th>
                <th>ÜRÜN ADI & SEZON</th>
                <th>KATEGORİ</th>
                <th>FİYAT</th>
                <th>STOK DURUMU</th>
                <th>BEDENLER</th>
                <th>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              ${renderProductAdminRows(filtered)}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const searchInput = container.querySelector('#store-admin-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      storeSearchQuery = e.target.value;
      renderAdminStore(container);
    };
  }

  const filterBtns = container.querySelectorAll('.admin-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      activeStoreFilter = btn.getAttribute('data-filter') || 'ALL';
      renderAdminStore(container);
    };
  });

  const addBtn = container.querySelector('#btn-add-product');
  if (addBtn) addBtn.onclick = () => openProductAdminModal(null, container);

  const editBtns = container.querySelectorAll('.btn-edit-product');
  editBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const prod = getProducts().find(p => p.id === id);
      if (prod) openProductAdminModal(prod, container);
    };
  });

  const deleteBtns = container.querySelectorAll('.btn-delete-product');
  deleteBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const prod = getProducts().find(p => p.id === id);
      if (prod && confirm(`"${prod.name}" ürününü Supabase veritabanından kalıcı olarak silmek istediğinize emin misiniz?`)) {
        try {
          await deleteProduct(id);
          logActivity('ÜRÜN SİLİNDİ', `Ürün silindi: "${prod.name}"`);
          showAdminToast('✓ ÜRÜN BAŞARIYLA SİLİNDİ');
        } catch (err) {
          showAdminToast('⚠ Ürün silinemedi: ' + err.message, 'danger');
        } finally {
          renderAdminStore(container);
        }
      }
    };
  });
}

function renderProductAdminRows(products) {
  if (products.length === 0) {
    return `<tr><td colspan="7" class="admin-empty-cell">Filtreye uygun ürün bulunamadı.</td></tr>`;
  }

  return products.map(prod => {
    let stockBadgeClass = 'badge-success';
    let stockBadgeText = prod.stockLabel || 'STOKTA VAR';
    if (prod.stockStatus === 'SOLD_OUT') {
      stockBadgeClass = 'badge-danger';
      stockBadgeText = 'TÜKENDİ';
    } else if (prod.stockStatus === 'LOW_STOCK') {
      stockBadgeClass = 'badge-warning';
      stockBadgeText = prod.stockLabel || 'SON ADETLER';
    }

    const sizesText = (prod.sizes || []).map(s => s.size).join(', ') || 'STANDART';

    return `
      <tr>
        <td>
          <img src="${prod.primaryImage}" alt="${escapeHtml(prod.name)}" class="admin-cell-thumb" style="width:48px; height:60px; object-fit:cover; border:1px solid rgba(255,255,255,0.1);" />
        </td>
        <td>
          <div class="admin-row-title">${escapeHtml(prod.name)}</div>
          <div class="admin-sub-text">${escapeHtml(prod.season || 'SONBAHAR/KIŞ 2026')}</div>
        </td>
        <td><span class="admin-badge badge-subtle">${escapeHtml(prod.category)}</span></td>
        <td><strong>${prod.currency || '€'}${prod.price}</strong></td>
        <td><span class="admin-badge ${stockBadgeClass}">${escapeHtml(stockBadgeText)}</span></td>
        <td><span style="font-size:0.75rem; color:#aaa;">${escapeHtml(sizesText)}</span></td>
        <td>
          <div class="admin-action-btns">
            <button class="admin-action-btn btn-edit-product" data-id="${prod.id}">Düzenle</button>
            <button class="admin-action-btn btn-danger btn-delete-product" data-id="${prod.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openProductAdminModal(productToEdit, rootContainer) {
  const isEdit = !!productToEdit;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal admin-modal-wide" style="max-height: 90vh; display: flex; flex-direction: column;">
      <div class="admin-modal-header" style="position: sticky; top: 0; background: #141418; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem 2rem; z-index: 10;">
        <h2 class="admin-modal-title">${isEdit ? 'ÜRÜNÜ DÜZENLE' : 'YENİ ÜRÜN EKLE'}</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="product-admin-form" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="admin-modal-body admin-grid-layout" style="padding: 2rem;">
          <div class="admin-modal-main-col">
            <div class="admin-form-grid">
              <div class="admin-form-group span-2">
                <label class="admin-label">Ürün Adı / Başlığı*</label>
                <input type="text" id="prod-name" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.name) : ''}" required placeholder="Örn: MADE OF SIN TİŞÖRT" />
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Kategori*</label>
                <select id="prod-category" class="admin-input">
                  <option value="T-SHIRTS" ${productToEdit && productToEdit.category === 'T-SHIRTS' ? 'selected' : ''}>TİŞÖRT</option>
                  <option value="HOODIES" ${productToEdit && productToEdit.category === 'HOODIES' ? 'selected' : ''}>KAPÜŞONLU</option>
                  <option value="VINYL" ${productToEdit && productToEdit.category === 'VINYL' ? 'selected' : ''}>12" PLAK</option>
                  <option value="CASSETTES" ${productToEdit && productToEdit.category === 'CASSETTES' ? 'selected' : ''}>KASET</option>
                  <option value="ACCESSORIES" ${productToEdit && productToEdit.category === 'ACCESSORIES' ? 'selected' : ''}>AKSESUAR</option>
                </select>
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Fiyat*</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="prod-currency" class="admin-input" style="width: 60px;" value="${productToEdit ? escapeHtml(productToEdit.currency || '€') : '€'}" required />
                  <input type="number" step="0.01" id="prod-price" class="admin-input" value="${productToEdit ? productToEdit.price : '45'}" required />
                </div>
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Stok Durumu*</label>
                <select id="prod-stock-status" class="admin-input">
                  <option value="IN_STOCK" ${!productToEdit || productToEdit.stockStatus === 'IN_STOCK' ? 'selected' : ''}>STOKTA VAR</option>
                  <option value="LOW_STOCK" ${productToEdit && productToEdit.stockStatus === 'LOW_STOCK' ? 'selected' : ''}>AZ STOK (Son Adetler)</option>
                  <option value="SOLD_OUT" ${productToEdit && productToEdit.stockStatus === 'SOLD_OUT' ? 'selected' : ''}>TÜKENDİ</option>
                </select>
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Stok Etiket Metni</label>
                <input type="text" id="prod-stock-label" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.stockLabel || 'STOKTA VAR') : 'STOKTA VAR'}" placeholder="Örn: STOKTA VAR / SON ADETLER" />
              </div>

              <div class="admin-form-group span-2">
                <label class="admin-label">Sezon / Koleksiyon Adı</label>
                <input type="text" id="prod-season" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.season || 'SONBAHAR/KIŞ 2026') : 'SONBAHAR/KIŞ 2026'}" placeholder="Örn: SONBAHAR/KIŞ 2026 / SINIRLI ÖZEL SERİ" />
              </div>

              <div class="admin-form-group span-2">
                <label class="admin-label">Kısa Slogan / Tagline</label>
                <input type="text" id="prod-tagline" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.tagline || '') : ''}" placeholder="Örn: İmza Ağır Gramaj Tipografik Grup Tişörtü" />
              </div>

              <div class="admin-form-group span-2">
                <label class="admin-label">Ürün Açıklaması</label>
                <textarea id="prod-desc" class="admin-input" rows="3" placeholder="Ürünün detaylı açıklaması...">${productToEdit ? escapeHtml(productToEdit.description) : ''}</textarea>
              </div>

              <div class="admin-form-group span-2">
                <label class="admin-label">Kumaş & Materyal Özellikleri</label>
                <input type="text" id="prod-material" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.material || '%100 Organik Pamuk, 240 GSM') : '%100 Organik Pamuk, 240 GSM'}" />
              </div>

              <div class="admin-form-group span-2">
                <label class="admin-label">Beden & Kalıp Rehberi</label>
                <input type="text" id="prod-size-guide" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.sizeGuide || 'Sokak modasına uygun rahat boxy fit kalıp.') : 'Sokak modasına uygun rahat boxy fit kalıp.'}" />
              </div>

              <div class="admin-form-group">
                <label class="admin-label">Kargo Bilgisi</label>
                <input type="text" id="prod-shipping" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.shippingInfo || '1-3 iş günü içinde kargoya verilir.') : '1-3 iş günü içinde kargoya verilir.'}" />
              </div>

              <div class="admin-form-group">
                <label class="admin-label">İade Koşulu</label>
                <input type="text" id="prod-returns" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.returnsInfo || '14 gün içinde koşulsuz iade.') : '14 gün içinde koşulsuz iade.'}" />
              </div>
            </div>
          </div>

          <div class="admin-modal-side-col">
            <div class="admin-form-group">
              <label class="admin-label">Ana Görsel URL*</label>
              <input type="url" id="prod-primary-img" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.primaryImage || '') : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}" required />
              <div class="admin-img-preview-box" style="margin-top: 0.75rem; aspect-ratio: 4/5;">
                <img id="prod-primary-preview" src="${productToEdit ? productToEdit.primaryImage : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}" alt="Önizleme" style="width:100%; height:100%; object-fit:cover;" />
              </div>
            </div>

            <div class="admin-form-group" style="margin-top: 1.5rem;">
              <label class="admin-label">İkincil Görsel URL (Hover Görseli)</label>
              <input type="url" id="prod-secondary-img" class="admin-input" value="${productToEdit ? escapeHtml(productToEdit.secondaryImage || '') : ''}" placeholder="https://..." />
            </div>

            <div class="admin-form-group" style="margin-top: 1.5rem;">
              <label class="admin-label">Galeri Görselleri (Her satıra 1 URL)</label>
              <textarea id="prod-gallery" class="admin-input" rows="4" placeholder="https://...\nhttps://...">${productToEdit && productToEdit.gallery ? productToEdit.gallery.join('\n') : ''}</textarea>
            </div>
          </div>
        </div>

        <div class="admin-modal-footer">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary">ÜRÜNÜ KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const imgInput = modalOverlay.querySelector('#prod-primary-img');
  const imgPreview = modalOverlay.querySelector('#prod-primary-preview');
  if (imgInput && imgPreview) {
    imgInput.oninput = (e) => imgPreview.src = cleanImageUrl(e.target.value);
  }

  const form = modalOverlay.querySelector('#product-admin-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const primaryImgUrl = cleanImageUrl(modalOverlay.querySelector('#prod-primary-img').value);
    const secondaryImgUrl = cleanImageUrl(modalOverlay.querySelector('#prod-secondary-img').value);
    const galleryLines = modalOverlay.querySelector('#prod-gallery').value.split('\n').map(l => cleanImageUrl(l.trim())).filter(Boolean);

    const data = {
      name: modalOverlay.querySelector('#prod-name').value,
      category: modalOverlay.querySelector('#prod-category').value,
      price: parseFloat(modalOverlay.querySelector('#prod-price').value) || 0,
      currency: modalOverlay.querySelector('#prod-currency').value.trim() || '€',
      stockStatus: modalOverlay.querySelector('#prod-stock-status').value,
      stockLabel: modalOverlay.querySelector('#prod-stock-label').value.trim() || 'STOKTA VAR',
      season: modalOverlay.querySelector('#prod-season').value.trim(),
      tagline: modalOverlay.querySelector('#prod-tagline').value.trim(),
      description: modalOverlay.querySelector('#prod-desc').value.trim(),
      material: modalOverlay.querySelector('#prod-material').value.trim(),
      sizeGuide: modalOverlay.querySelector('#prod-size-guide').value.trim(),
      shippingInfo: modalOverlay.querySelector('#prod-shipping').value.trim(),
      returnsInfo: modalOverlay.querySelector('#prod-returns').value.trim(),
      primaryImage: primaryImgUrl,
      secondaryImage: secondaryImgUrl,
      gallery: galleryLines.length > 0 ? galleryLines : [primaryImgUrl].filter(Boolean),
      sizes: productToEdit && productToEdit.sizes ? productToEdit.sizes : [
        { size: 'S', available: true, status: 'AVAILABLE' },
        { size: 'M', available: true, status: 'AVAILABLE' },
        { size: 'L', available: true, status: 'AVAILABLE' },
        { size: 'XL', available: true, status: 'AVAILABLE' }
      ],
      defaultSize: productToEdit && productToEdit.defaultSize ? productToEdit.defaultSize : 'M'
    };

    try {
      if (isEdit) {
        await updateProduct(productToEdit.id, data);
        logActivity('ÜRÜN GÜNCELLENDİ', `Ürün güncellendi: "${data.name}"`);
        showAdminToast('✓ ÜRÜN BAŞARIYLA GÜNCELLENDİ');
      } else {
        await addProduct(data);
        logActivity('ÜRÜN EKLENDİ', `Yeni ürün eklendi: "${data.name}"`);
        showAdminToast('✓ YENİ ÜRÜN BAŞARIYLA EKLENDİ');
      }
    } catch (err) {
      console.error('Ürün kaydetme hatası:', err);
      showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
    } finally {
      closeModal();
      renderAdminStore(rootContainer);
    }
  };
}

/**
 * --------------------------------------------------------------------------
 * MEDYA KÜTÜPHANESİ GÖRÜNÜMÜ (/admin/media)
 * --------------------------------------------------------------------------
 */
let mediaSearchQuery = '';

function renderAdminMedia(container) {
  const items = getMediaItems();

  let filtered = items;
  if (mediaSearchQuery.trim()) {
    const q = mediaSearchQuery.toLowerCase().trim();
    filtered = items.filter(m => m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q));
  }

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/media')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Medya Kütüphanesi</h1>
            <p class="admin-page-desc">Turne, Müzik ve Yazılar İçin Merkezi Görsel ve Dosya Deposu</p>
          </div>
          <button id="btn-add-media" class="admin-btn admin-btn-primary">+ YENİ MEDYA EKLE</button>
        </div>

        <div class="admin-toolbar">
          <div class="admin-search-box">
            <input type="text" id="media-search-input" class="admin-input" placeholder="Dosya adı veya link ara..." value="${escapeHtml(mediaSearchQuery)}" />
          </div>
        </div>

        <div class="admin-media-grid">
          ${filtered.length > 0 ? filtered.map(item => `
            <div class="admin-media-card">
              <div class="media-thumb-box">
                <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" class="media-thumb-img" />
              </div>
              <div class="media-card-info">
                <div class="media-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
                <div class="media-meta">${item.size} • ${item.dimensions}</div>
                <div class="media-card-actions">
                  <button type="button" class="admin-action-btn btn-copy-url" data-url="${escapeHtml(item.url)}">Linki Kopyala</button>
                  <button type="button" class="admin-action-btn btn-danger btn-delete-media" data-id="${item.id}">Sil</button>
                </div>
              </div>
            </div>
          `).join('') : '<div class="admin-empty-state">Medya dosyası bulunamadı.</div>'}
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const searchInput = container.querySelector('#media-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      mediaSearchQuery = e.target.value;
      renderAdminMedia(container);
    };
  }

  const addBtn = container.querySelector('#btn-add-media');
  if (addBtn) addBtn.onclick = () => openMediaUploadModal(container);

  const copyBtns = container.querySelectorAll('.btn-copy-url');
  copyBtns.forEach(btn => {
    btn.onclick = () => {
      const url = btn.getAttribute('data-url');
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = 'Kopyalandı!';
        setTimeout(() => btn.textContent = 'Linki Kopyala', 2000);
      });
    };
  });

  const deleteBtns = container.querySelectorAll('.btn-delete-media');
  deleteBtns.forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = getMediaItems().find(m => m.id === id);
      if (item) openDeleteMediaModal(item, container);
    };
  });
}

function openMediaUploadModal(rootContainer) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">YENİ MEDYA EKLE</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="media-upload-form">
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label class="admin-label">Medya Başlığı / Dosya Adı*</label>
            <input type="text" id="med-name" class="admin-input" placeholder="Örn: Konser Sahne Fotoğrafı" required />
          </div>
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label class="admin-label">Görsel URL (Imgur veya direkt resim linki)*</label>
            <input type="url" id="med-url" class="admin-input" placeholder="https://..." required />
          </div>
        </div>
        <div class="admin-modal-footer">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary">MEDYAYI KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const form = modalOverlay.querySelector('#media-upload-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = modalOverlay.querySelector('#med-name').value;
    const url = cleanImageUrl(modalOverlay.querySelector('#med-url').value);

    addMediaItem({ name, url });
    logActivity('MEDYA EKLENDİ', `Yeni medya yüklendi: "${name}"`);
    showAdminToast('✓ MEDYA DOSYASI BAŞARIYLA EKLENDİ');
    closeModal();
    renderAdminMedia(rootContainer);
  };
}

function openDeleteMediaModal(mediaItem, rootContainer) {
  const usage = getMediaUsage(mediaItem.url);

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  const usageHTML = usage.length > 0 ? `
    <div class="admin-warning-box">
      <strong>⚠️ DİKKAT: BU MEDYA ŞU ANDA AŞAĞIDAKİ ALANLARDA KULLANILMAKTADIR:</strong>
      <ul>
        ${usage.map(u => `<li>${escapeHtml(u)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  modalOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">MEDYAYI SİL</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <div class="admin-modal-body">
        <p><strong>"${escapeHtml(mediaItem.name)}"</strong> adlı medya dosyasını kalıcı olarak silmek istediğinize emin misiniz?</p>
        ${usageHTML}
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
        <button type="button" id="btn-confirm-delete-media" class="admin-btn admin-btn-danger">MEDYAYI SİL</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  modalOverlay.querySelector('#btn-confirm-delete-media').onclick = () => {
    deleteMediaItem(mediaItem.id);
    logActivity('MEDYA SİLİNDİ', `Medya dosyası silindi: "${mediaItem.name}"`);
    showAdminToast('✓ MEDYA DOSYASI SİLİNDİ', 'danger');
    closeModal();
    renderAdminMedia(rootContainer);
  };
}

/**
 * --------------------------------------------------------------------------
 * HAKKIMIZDA & SLAYTLAR YÖNETİMİ GÖRÜNÜMÜ (/admin/about)
 * --------------------------------------------------------------------------
 */
function renderAdminAbout(container) {
  const aboutData = getAboutData();
  const slides = Array.isArray(aboutData.slides) ? aboutData.slides : [];

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/about')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Hakkımızda & Slayt Yönetimi (/about)</h1>
            <p class="admin-page-desc">/about sayfasındaki bağımsız slayt gösterisi görsellerini ve biyografi paragraflarını düzenleyin.</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button id="btn-save-all-slides" class="admin-btn admin-btn-primary">💾 TÜM SLAYTLARI KAYDET</button>
            <button id="btn-add-slide" class="admin-btn admin-btn-secondary">+ YENİ SLAYT EKLE</button>
          </div>
        </div>

        <div class="admin-content-section">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h2 class="admin-section-subtitle" style="margin-bottom: 0;">/ABOUT SLAYTLARI (${slides.length} SLAYT)</h2>
            <span style="font-family: monospace; font-size: 0.72rem; color: #888;">Supabase: about_slides tablosu ile tam senkron</span>
          </div>
          <p class="admin-input-help" style="margin-bottom: 1.25rem;">
            /about sayfasındaki fotoğraf slayt gösterisi görsellerini ve başlıklarını buradan yönetebilirsiniz. Ana sayfa fotoğraf panosu bu listeden tamamen bağımsızdır.
          </p>

          <div class="admin-slide-cards-grid">
            ${slides.length === 0 ? `
              <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; border: 1px dashed rgba(255,255,255,0.15); background: rgba(255,255,255,0.02);">
                <p style="font-size: 0.95rem; color: #888; margin-bottom: 1rem;">// Henüz kayıtlı slayt fotoğrafı bulunmuyor.</p>
                <button type="button" id="btn-add-slide-empty" class="admin-btn admin-btn-secondary">+ İLK FOTOĞRAFI EKLE</button>
              </div>
            ` : slides.map((slide, idx) => {
              const cleanedUrl = cleanImageUrl(slide.image_url || slide.url || '');
              const cardOrder = slide.display_order || slide.slide_order || (idx + 1);

              return `
                <div class="admin-slide-card-editor" data-slide-id="${slide.id}">
                  <div class="admin-slide-card-header">
                    <div class="admin-slide-card-badge">
                      <span>●</span> SLAYT #${String(cardOrder).padStart(2, '0')}
                    </div>
                    <div class="admin-slide-card-id">${slide.id}</div>
                  </div>

                  <div class="admin-slide-card-body">
                    <div class="admin-form-group">
                      <label class="admin-label">Görsel Bağlantısı (image_url)*</label>
                      <input type="url" 
                             class="admin-input slide-field-url" 
                             data-id="${slide.id}" 
                             value="${escapeHtml(cleanedUrl)}" 
                             placeholder="https://images.unsplash.com/... veya https://i.imgur.com/..." 
                             required />
                    </div>

                    <div class="admin-form-group">
                      <label class="admin-label">Canlı Önizleme</label>
                      <div class="admin-slide-preview-box" id="preview-box-${slide.id}">
                        <img src="${escapeHtml(cleanedUrl)}" 
                             alt="Slayt ${cardOrder}" 
                             class="admin-slide-preview-img" 
                             id="preview-img-${slide.id}" 
                             style="${cleanedUrl ? '' : 'display: none;'}" />
                        <span class="admin-slide-preview-empty" 
                              id="preview-empty-${slide.id}" 
                              style="${cleanedUrl ? 'display: none;' : ''}">// GÖRSEL BAĞLANTISI GİRİN</span>
                      </div>
                    </div>
                  </div>

                  <div class="admin-slide-card-footer" style="display: flex; gap: 0.65rem; margin-top: 0.75rem;">
                    <button type="button" 
                            class="admin-btn admin-btn-primary btn-save-single-slide" 
                            data-id="${slide.id}" 
                            data-order="${cardOrder}" 
                            style="flex: 1; margin-top: 0;">
                      💾 KAYDET
                    </button>
                    <button type="button" 
                            class="admin-btn btn-delete-single-slide" 
                            data-id="${slide.id}" 
                            style="background-color: #d92b2b; color: #ffffff; border: 1px solid #d92b2b; padding: 0.6rem 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                      🗑️ KARTI SİL
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="admin-content-section" style="margin-top: 3rem;">
          <h2 class="admin-section-subtitle">BİYOGRAFİ METNİ / PARAGRAFLAR</h2>
          <form id="about-bio-form">
            <div class="admin-form-group">
              <label class="admin-label">Grup Biyografisi (Paragrafları boş satır bırakarak ayırın)</label>
              <textarea id="about-bio-textarea" class="admin-input" rows="8" required>${escapeHtml(aboutData.bioParagraphs.join('\n\n'))}</textarea>
            </div>
            <div style="margin-top: 1rem;">
              <button type="submit" class="admin-btn admin-btn-primary">BİYOGRAFİYİ KAYDET</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  // Setup real-time image preview listeners
  slides.forEach(slide => {
    const urlInput = container.querySelector(`.slide-field-url[data-id="${slide.id}"]`);
    const previewImg = container.querySelector(`#preview-img-${slide.id}`);
    const previewEmpty = container.querySelector(`#preview-empty-${slide.id}`);

    if (urlInput && previewImg && previewEmpty) {
      const updateBox = () => {
        const raw = urlInput.value.trim();
        if (!raw) {
          previewImg.style.display = 'none';
          previewEmpty.style.display = 'block';
          previewEmpty.textContent = '// GÖRSEL BAĞLANTISI GİRİN';
          previewEmpty.style.color = '#666';
          return;
        }

        const cleaned = cleanImageUrl(raw);
        previewImg.src = cleaned;
        previewImg.style.display = 'block';
        previewEmpty.style.display = 'none';
      };

      urlInput.oninput = updateBox;
      urlInput.onblur = () => {
        const cleaned = cleanImageUrl(urlInput.value.trim());
        if (cleaned && cleaned !== urlInput.value) {
          urlInput.value = cleaned;
          updateBox();
        }
      };

      previewImg.onerror = () => {
        previewImg.style.display = 'none';
        previewEmpty.style.display = 'block';
        previewEmpty.textContent = '⚠ Geçersiz veya yüklenemeyen görsel linki';
        previewEmpty.style.color = '#d92b2b';
      };
      previewImg.onload = () => {
        previewImg.style.display = 'block';
        previewEmpty.style.display = 'none';
      };
    }
  });

  // Delete single slide directly via Supabase delete and local state filter
  const singleDeleteBtns = container.querySelectorAll('.btn-delete-single-slide');
  singleDeleteBtns.forEach(btn => {
    btn.onclick = async () => {
      const slideId = btn.getAttribute('data-id');

      if (!confirm('Bu slayt fotoğrafını silmek istediğinize emin misiniz?')) {
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ SİLİNİYOR...';

      try {
        await deleteSlide(slideId);
        logActivity('SLAYT SİLİNDİ', 'Slayt fotoğrafı silindi.');
        showAdminToast('✓ SLAYT BAŞARIYLA SİLİNDİ');
        renderAdminAbout(container);
      } catch (err) {
        console.error('Slayt silme hatası:', err);
        showAdminToast('⚠ Silme hatası: ' + (err.message || 'Supabase hatası'), 'danger');
        btn.disabled = false;
        btn.textContent = '🗑️ KARTI SİL';
      }
    };
  });

  // Save single slide directly via Supabase upsert
  const singleSaveBtns = container.querySelectorAll('.btn-save-single-slide');
  singleSaveBtns.forEach(btn => {
    btn.onclick = async () => {
      const slideId = btn.getAttribute('data-id');
      const orderVal = parseInt(btn.getAttribute('data-order') || '1', 10);
      const urlInput = container.querySelector(`.slide-field-url[data-id="${slideId}"]`);
      const rawUrl = urlInput ? urlInput.value.trim() : '';
      const cleanedUrl = cleanImageUrl(rawUrl);

      if (!cleanedUrl) {
        showAdminToast('⚠ Görsel linki boş olamaz.', 'danger');
        if (urlInput) urlInput.focus();
        return;
      }

      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = '⏳ KAYDEDİLİYOR...';

      try {
        const payload = {
          id: slideId,
          title: `Slide ${orderVal}`,
          description: '',
          image_url: cleanedUrl,
          url: cleanedUrl,
          caption: `Slide ${orderVal}`,
          display_order: orderVal,
          slide_order: orderVal,
          created_at: new Date().toISOString()
        };

        if (supabase) {
          const { data, error } = await supabase
            .from('about_slides')
            .upsert(payload, { onConflict: 'id' })
            .select();

          if (error) throw error;
          console.log('Supabase Slide Kaydedildi:', data);
        }

        // Also update local in-memory store
        await upsertAboutSlide({
          id: slideId,
          title: `Slide ${orderVal}`,
          description: '',
          image_url: cleanedUrl,
          display_order: orderVal
        });

        logActivity('SLAYT GÜNCELLENDİ', `Slayt #${orderVal} kaydedildi.`);
        showAdminToast('✓ SLAYT BAŞARIYLA KAYDEDİLDİ');
      } catch (err) {
        console.error('Slayt kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };
  });

  // Save All Slides button
  const saveAllBtn = container.querySelector('#btn-save-all-slides');
  if (saveAllBtn) {
    saveAllBtn.onclick = async () => {
      saveAllBtn.disabled = true;
      saveAllBtn.textContent = '⏳ TÜMÜ KAYDEDİLİYOR...';

      try {
        const updatedSlidesList = slides.map((slide, idx) => {
          const urlInput = container.querySelector(`.slide-field-url[data-id="${slide.id}"]`);
          const rawUrl = urlInput ? urlInput.value.trim() : (slide.image_url || slide.url || '');
          const cleanedUrl = cleanImageUrl(rawUrl);
          const orderNum = idx + 1;

          return {
            id: slide.id,
            title: `Slide ${orderNum}`,
            description: '',
            image_url: cleanedUrl,
            url: cleanedUrl,
            caption: `Slide ${orderNum}`,
            display_order: orderNum,
            slide_order: orderNum,
            created_at: new Date().toISOString()
          };
        });

        if (supabase) {
          const { data, error } = await supabase
            .from('about_slides')
            .upsert(updatedSlidesList, { onConflict: 'id' })
            .select();

          if (error) throw error;
          console.log('Supabase All Slides Kaydedildi:', data);
        }

        await saveAboutSlidesBatch(updatedSlidesList);
        logActivity('TÜM SLAYTLAR GÜNCELLENDİ', `${updatedSlidesList.length} slayt kaydedildi.`);
        showAdminToast('✓ TÜM SLAYTLAR BAŞARIYLA KAYDEDİLDİ');
      } catch (err) {
        console.error('Tüm slaytları kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        saveAllBtn.disabled = false;
        saveAllBtn.textContent = '💾 TÜM SLAYTLARI KAYDET';
      }
    };
  }

  // Add new slide button
  const addSlideBtn = container.querySelector('#btn-add-slide');
  if (addSlideBtn) {
    addSlideBtn.onclick = () => openSlideModal(null, container);
  }
  const addSlideEmptyBtn = container.querySelector('#btn-add-slide-empty');
  if (addSlideEmptyBtn) {
    addSlideEmptyBtn.onclick = () => openSlideModal(null, container);
  }

  // Bio form submission
  const bioForm = container.querySelector('#about-bio-form');
  if (bioForm) {
    bioForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = bioForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ KAYDEDİLİYOR...';
      }

      const rawText = container.querySelector('#about-bio-textarea').value;
      const paragraphs = rawText.split('\n\n').map(p => p.trim()).filter(Boolean);

      try {
        await updateBioParagraphs(paragraphs);
        logActivity('BİYOGRAFİ GÜNCELLENDİ', 'Grup biyografi metni güncellendi');
        showAdminToast('✓ BİYOGRAFİ METNİ BAŞARIYLA KAYDEDİLDİ');
      } catch (err) {
        console.error('Biyografi kaydetme hatası:', err);
        showAdminToast('⚠ Biyografi kaydedilemedi: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        renderAdminAbout(container);
      }
    };
  }

  const bioTextarea = container.querySelector('#about-bio-textarea');
  const onBioDataUpdated = () => {
    if (bioTextarea && (!bioTextarea.value.trim() || document.activeElement !== bioTextarea)) {
      const current = getAboutData();
      if (current.bioParagraphs && current.bioParagraphs.length > 0) {
        bioTextarea.value = current.bioParagraphs.join('\n\n');
      }
    }
  };
  window.addEventListener('about-data-updated', onBioDataUpdated, { once: true });
}

function openSlideModal(slideItem, rootContainer) {
  const isEdit = !!slideItem;
  const initialUrl = slideItem ? cleanImageUrl(slideItem.image_url || slideItem.url) : '';
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">${isEdit ? 'SLAYT GÖRSELİNİ DÜZENLE' : 'YENİ SLAYT FOTOĞRAFI EKLE'}</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="slide-form">
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label class="admin-label">Görsel Bağlantısı (image_url)*</label>
            <input type="url" id="slide-url" class="admin-input" value="${escapeHtml(initialUrl)}" placeholder="https://i.imgur.com/... veya https://images.unsplash.com/..." required />
            <p class="admin-input-help" style="font-size: 0.75rem; color: #888; margin-top: 4px;">Imgur sayfa linkleri otomatik olarak direkt resim linkine dönüştürülür.</p>
          </div>
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label class="admin-label">Görsel Canlı Önizleme</label>
            <div class="admin-img-preview-box" style="width: 100%; height: 180px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; position: relative;">
              <img id="slide-preview-img" src="${initialUrl}" style="width: 100%; height: 100%; object-fit: cover; ${initialUrl ? '' : 'display: none;'}" alt="Slayt Önizleme" />
              <span id="slide-preview-placeholder" style="color: #666; font-size: 0.78rem; font-family: monospace; ${initialUrl ? 'display: none;' : ''}">// GÖRSEL ÖNİZLEMESİ</span>
            </div>
          </div>
        </div>
        <div class="admin-modal-footer">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary">SLAYTI KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const urlInput = modalOverlay.querySelector('#slide-url');
  const previewImg = modalOverlay.querySelector('#slide-preview-img');
  const previewPlaceholder = modalOverlay.querySelector('#slide-preview-placeholder');

  const updatePreview = () => {
    const rawVal = urlInput.value.trim();
    if (!rawVal) {
      previewImg.style.display = 'none';
      previewPlaceholder.style.display = 'block';
      previewPlaceholder.textContent = '// GÖRSEL ÖNİZLEMESİ';
      previewPlaceholder.style.color = '#666';
      return;
    }

    const cleaned = cleanImageUrl(rawVal);
    previewImg.src = cleaned;
    previewImg.style.display = 'block';
    previewPlaceholder.style.display = 'none';
  };

  if (previewImg) {
    previewImg.onerror = () => {
      previewImg.style.display = 'none';
      previewPlaceholder.style.display = 'block';
      previewPlaceholder.textContent = '⚠ Geçersiz veya yüklenemeyen görsel linki';
      previewPlaceholder.style.color = '#d92b2b';
    };
    previewImg.onload = () => {
      previewImg.style.display = 'block';
      previewPlaceholder.style.display = 'none';
    };
  }

  if (urlInput) {
    urlInput.oninput = updatePreview;
    urlInput.onblur = () => {
      const cleaned = cleanImageUrl(urlInput.value.trim());
      if (cleaned && cleaned !== urlInput.value) {
        urlInput.value = cleaned;
        updatePreview();
      }
    };
  }

  const form = modalOverlay.querySelector('#slide-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ KAYDEDİLİYOR...';
    }

    const rawUrl = urlInput.value.trim();
    const cleanedUrl = cleanImageUrl(rawUrl);

    try {
      if (isEdit) {
        await updateSlide(slideItem.id, { image_url: cleanedUrl, url: cleanedUrl, title: '', caption: '', description: '' });
        logActivity('SLAYT GÜNCELLENDİ', `Slayt güncellendi: ${slideItem.id}`);
        showAdminToast('✓ SLAYT GÖRSELİ GÜNCELLENDİ');
      } else {
        await addSlide({ image_url: cleanedUrl, url: cleanedUrl, title: '', caption: '', description: '' });
        logActivity('SLAYT EKLENDİ', 'Yeni slayt fotoğrafı eklendi.');
        showAdminToast('✓ YENİ SLAYT BAŞARIYLA EKLENDİ');
      }
    } catch (err) {
      console.error('Slayt kaydetme hatası:', err);
      showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
    } finally {
      closeModal();
      renderAdminAbout(rootContainer);
    }
  };
}

/**
 * --------------------------------------------------------------------------
 * ANA SAYFA FOTOĞRAF PANOSU YÖNETİMİ (/admin/pano)
 * Ana sayfadaki 3'lü bantlı/polaroid editoryal zine kolajını bağımsız yönetir.
 * Supabase home_pano tablosu ile tam senkron çalışır.
 * --------------------------------------------------------------------------
 */
function renderAdminHomePano(container) {
  const panoItems = getHomePanoItems();

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/pano')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Ana Sayfa Fotoğraf Panosu (Home Pano)</h1>
            <p class="admin-page-desc">Ana sayfadaki yatay scroll içindeki estetik polaroid/bantlı kolaj kartlarını düzenleyin.</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button id="btn-save-all-pano" class="admin-btn admin-btn-primary">💾 TÜM KARTLARI KAYDET</button>
            <button id="btn-add-pano-card" class="admin-btn" style="background-color: #d92b2b; color: #ffffff; border: 1px solid #d92b2b; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">+ YENİ PANO KARTI EKLE</button>
          </div>
        </div>

        <div class="admin-content-section">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <h2 class="admin-section-subtitle" style="margin-bottom: 0;">KOLAJ YERLEŞİM KARTLARI (${panoItems.length} KART)</h2>
            <span style="font-family: monospace; font-size: 0.72rem; color: #888;">Supabase: home_pano tablosu ile bağımsız senkron</span>
          </div>
          <p class="admin-input-help" style="margin-bottom: 1.25rem;">
            Bu kartlar ana sayfanın görsel arşiv panosunda asimetrik editoryal düzende sergilenir. /about slaytlarından tamamen bağımsızdır ve eklenen/silinen kartlar ana sayfada anında güncellenir.
          </p>

          <div class="admin-slide-cards-grid">
            ${panoItems.length === 0 ? `
              <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; border: 1px dashed rgba(255,255,255,0.15); background: rgba(255,255,255,0.02);">
                <p style="font-size: 0.95rem; color: #888; margin-bottom: 1rem;">// Henüz kayıtlı pano kartı bulunmuyor.</p>
                <button type="button" id="btn-add-pano-empty" class="admin-btn" style="background-color: #d92b2b; color: #ffffff; border: 1px solid #d92b2b; font-weight: 700; cursor: pointer;">+ İLK PANO KARTINI EKLE</button>
              </div>
            ` : panoItems.map((item, idx) => {
              const cleanedUrl = cleanPanoImageUrl(item.image_url || item.url || '');
              const locationText = item.location_text || item.meta_location || '';
              const slotNum = idx + 1;

              return `
                <div class="admin-slide-card-editor" data-slot="${slotNum}" data-id="${item.id}">
                  <div class="admin-slide-card-header">
                    <div class="admin-slide-card-badge">
                      <span>●</span> PANO KART #${String(slotNum).padStart(2, '0')}
                    </div>
                    <div class="admin-slide-card-id">${item.id}</div>
                  </div>

                  <div class="admin-slide-card-body">
                    <div class="admin-form-group">
                      <label class="admin-label">Görsel Bağlantısı (image_url)*</label>
                      <input type="url" 
                             class="admin-input pano-field-url" 
                             data-slot="${slotNum}" 
                             value="${escapeHtml(cleanedUrl)}" 
                             placeholder="https://images.unsplash.com/... veya https://i.imgur.com/..." 
                             required />
                    </div>

                    <div class="admin-form-group">
                      <label class="admin-label">Görsel Canlı Önizleme</label>
                      <div class="admin-slide-preview-box" id="pano-preview-box-${slotNum}">
                        <img src="${escapeHtml(cleanedUrl)}" 
                             alt="Pano Slot ${slotNum}" 
                             class="admin-slide-preview-img" 
                             id="pano-preview-img-${slotNum}" 
                             style="${cleanedUrl ? '' : 'display: none;'}" />
                        <span class="admin-slide-preview-empty" 
                              id="pano-preview-empty-${slotNum}" 
                              style="${cleanedUrl ? 'display: none;' : ''}">// GÖRSEL BAĞLANTISI GİRİN</span>
                      </div>
                    </div>

                    <div class="admin-form-group">
                      <label class="admin-label">Alt Metin / Konum-Zaman Satırı (location_text)*</label>
                      <input type="text" 
                             class="admin-input pano-field-loc" 
                             data-slot="${slotNum}" 
                             value="${escapeHtml(locationText)}" 
                             placeholder="Örn: BERLİN STÜDYO 03:42 AM" 
                             required />
                      <p class="admin-input-help" style="font-size: 0.75rem; color: #888; margin-top: 4px;">Fotoğrafın hemen altında görünecek dinamik konum/zaman yazısıdır.</p>
                    </div>

                    <div class="admin-form-group">
                      <label class="admin-label">Bant / Damga Metni (BADGE_TEXT)</label>
                      <input type="text" 
                             class="admin-input pano-field-badge" 
                             data-slot="${slotNum}" 
                             value="${escapeHtml(item.badge_text || '')}" 
                             placeholder="${slotNum % 3 === 1 ? 'Örn: LIMITED ARCHIVE // VOL.01' : slotNum % 3 === 2 ? 'Örn: DEVIL\'S GRIN // CONFIDENTIAL' : 'Örn: DARKROOM // RAW PRINT'}" />
                      <p class="admin-input-help" style="font-size: 0.75rem; color: #888; margin-top: 4px;">Kart sırasına göre otomatik monokromatik tema (1: Siyah, 2: Beyaz, 3: Füme) ve asimetrik açıyla organik uygulanır (Boş bırakılırsa damga görünmez).</p>
                    </div>
                  </div>

                  <div class="admin-slide-card-footer" style="display: flex; gap: 0.65rem; margin-top: 0.75rem;">
                    <button type="button" 
                            class="admin-btn admin-btn-primary btn-save-single-pano" 
                            data-slot="${slotNum}" 
                            data-id="${item.id}"
                            style="flex: 1; margin-top: 0;">
                      💾 KAYDET
                    </button>
                    <button type="button" 
                            class="admin-btn btn-delete-single-pano" 
                            data-slot="${slotNum}" 
                            data-id="${item.id}"
                            style="background-color: #d92b2b; color: #ffffff; border: 1px solid #d92b2b; padding: 0.6rem 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
                      🗑️ KARTI SİL
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  // Real-time image preview
  panoItems.forEach((item, idx) => {
    const slotNum = idx + 1;
    const urlInput = container.querySelector(`.pano-field-url[data-slot="${slotNum}"]`);
    const previewImg = container.querySelector(`#pano-preview-img-${slotNum}`);
    const previewEmpty = container.querySelector(`#pano-preview-empty-${slotNum}`);

    if (urlInput && previewImg && previewEmpty) {
      const updateBox = () => {
        const raw = urlInput.value.trim();
        if (!raw) {
          previewImg.style.display = 'none';
          previewEmpty.style.display = 'block';
          previewEmpty.textContent = '// GÖRSEL BAĞLANTISI GİRİN';
          previewEmpty.style.color = '#666';
          return;
        }

        const cleaned = cleanPanoImageUrl(raw);
        previewImg.src = cleaned;
        previewImg.style.display = 'block';
        previewEmpty.style.display = 'none';
      };

      urlInput.oninput = updateBox;
      urlInput.onblur = () => {
        const cleaned = cleanPanoImageUrl(urlInput.value.trim());
        if (cleaned && cleaned !== urlInput.value) {
          urlInput.value = cleaned;
          updateBox();
        }
      };

      previewImg.onerror = () => {
        previewImg.style.display = 'none';
        previewEmpty.style.display = 'block';
        previewEmpty.textContent = '⚠ Geçersiz veya yüklenemeyen görsel linki';
        previewEmpty.style.color = '#d92b2b';
      };
      previewImg.onload = () => {
        previewImg.style.display = 'block';
        previewEmpty.style.display = 'none';
      };
    }
  });

  // Delete single pano card handler
  const singleDeleteBtns = container.querySelectorAll('.btn-delete-single-pano');
  singleDeleteBtns.forEach(btn => {
    btn.onclick = async () => {
      const cardId = btn.getAttribute('data-id');
      const slotNum = btn.getAttribute('data-slot');

      if (!confirm('Bu pano kartını silmek istediğinize emin misiniz?')) {
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ SİLİNİYOR...';

      try {
        await deleteHomePanoItem(cardId);
        logActivity('PANO KARTI SİLİNDİ', `Ana sayfa pano kartı (${cardId}) silindi.`);
        showAdminToast('✓ PANO KARTI BAŞARIYLA SİLİNDİ');

        // Anında arayüzü yeniden render et
        renderAdminHomePano(container);
      } catch (err) {
        console.error('Pano kartı silme hatası:', err);
        showAdminToast('⚠ Silme hatası: ' + (err.message || 'Supabase hatası'), 'danger');
        btn.disabled = false;
        btn.textContent = '🗑️ KARTI SİL';
      }
    };
  });

  // Single card save handler
  const singleSaveBtns = container.querySelectorAll('.btn-save-single-pano');
  singleSaveBtns.forEach(btn => {
    btn.onclick = async () => {
      const slotNum = parseInt(btn.getAttribute('data-slot'), 10);
      const cardId = btn.getAttribute('data-id') || `pano_${slotNum}`;

      const urlInput = container.querySelector(`.pano-field-url[data-slot="${slotNum}"]`);
      const locInput = container.querySelector(`.pano-field-loc[data-slot="${slotNum}"]`);
      const badgeInput = container.querySelector(`.pano-field-badge[data-slot="${slotNum}"]`);

      const rawUrl = urlInput ? urlInput.value.trim() : '';
      const locationText = locInput ? locInput.value.trim() : '';
      const badgeText = badgeInput ? badgeInput.value.trim() : '';
      const cleanedUrl = cleanPanoImageUrl(rawUrl);

      if (!cleanedUrl) {
        showAdminToast('⚠ Görsel linki boş olamaz.', 'danger');
        if (urlInput) urlInput.focus();
        return;
      }

      btn.disabled = true;
      const origText = btn.textContent;
      btn.textContent = '⏳ KAYDEDİLİYOR...';

      try {
        await upsertHomePanoItem({
          id: cardId,
          slot_index: slotNum,
          display_order: slotNum,
          location_text: locationText,
          meta_location: locationText,
          badge_text: badgeText,
          image_url: cleanedUrl
        });

        logActivity('PANO KARTI GÜNCELLENDİ', `Ana sayfa pano slot ${slotNum} ("${locationText || 'Görsel'}") kaydedildi.`);
        showAdminToast(`✓ SLOT #${slotNum} BAŞARIYLA KAYDEDİLDİ`);
      } catch (err) {
        console.error('Pano kartı kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        btn.disabled = false;
        btn.textContent = origText;
      }
    };
  });

  // Save all pano cards at once
  const saveAllBtn = container.querySelector('#btn-save-all-pano');
  if (saveAllBtn) {
    saveAllBtn.onclick = async () => {
      saveAllBtn.disabled = true;
      saveAllBtn.textContent = '⏳ TÜMÜ KAYDEDİLİYOR...';

      try {
        const updatedList = panoItems.map((item, idx) => {
          const slotNum = idx + 1;
          const urlInput = container.querySelector(`.pano-field-url[data-slot="${slotNum}"]`);
          const locInput = container.querySelector(`.pano-field-loc[data-slot="${slotNum}"]`);
          const badgeInput = container.querySelector(`.pano-field-badge[data-slot="${slotNum}"]`);

          const rawUrl = urlInput ? urlInput.value.trim() : (item.image_url || item.url || '');
          const locationText = locInput ? locInput.value.trim() : (item.location_text || item.meta_location || '');
          const badgeText = badgeInput ? badgeInput.value.trim() : (item.badge_text || '');

          return {
            ...item,
            id: item.id || `pano_${slotNum}`,
            slot_index: slotNum,
            display_order: slotNum,
            location_text: locationText,
            meta_location: locationText,
            badge_text: badgeText,
            image_url: cleanPanoImageUrl(rawUrl)
          };
        });

        await saveAllHomePanoItems(updatedList);
        logActivity('TÜM PANO KARTLARI GÜNCELLENDİ', `Ana sayfa fotoğraf panosundaki ${updatedList.length} kart kaydedildi.`);
        showAdminToast('✓ TÜM PANO KARTLARI BAŞARIYLA KAYDEDİLDİ');
      } catch (err) {
        console.error('Tüm pano kartlarını kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        saveAllBtn.disabled = false;
        saveAllBtn.textContent = '💾 TÜM KARTLARI KAYDET';
      }
    };
  }

  // Add new pano card handler
  const handleAddNewPanoCard = async (triggerBtn) => {
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.textContent = '⏳ EKLENİYOR...';
    }

    try {
      const newId = `pano_${Date.now()}`;
      const newCard = {
        id: newId,
        image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        meta_location: 'YENİ KONUM // MEKAN',
        location_text: 'YENİ KONUM // MEKAN',
        badge_text: "DEVIL'S GRIN // CONFIDENTIAL",
        slot_index: panoItems.length + 1,
        display_order: panoItems.length + 1
      };

      await addHomePanoItem(newCard);
      logActivity('YENİ PANO KARTI EKLENDİ', `Yeni ana sayfa pano kartı (${newId}) eklendi.`);
      showAdminToast('✓ YENİ PANO KARTI BAŞARIYLA EKLENDİ');

      // Re-render admin panel so the new card appears immediately
      renderAdminHomePano(container);

      // Focus the newly added card's URL input
      setTimeout(() => {
        const newCardEl = container.querySelector(`.admin-slide-card-editor[data-id="${newId}"]`);
        if (newCardEl) {
          newCardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inp = newCardEl.querySelector('.pano-field-url');
          if (inp) inp.focus();
        }
      }, 100);
    } catch (err) {
      console.error('Yeni pano kartı ekleme hatası:', err);
      showAdminToast('⚠ Ekleme hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = '+ YENİ PANO KARTI EKLE';
      }
    }
  };

  const addPanoBtn = container.querySelector('#btn-add-pano-card');
  if (addPanoBtn) {
    addPanoBtn.onclick = () => handleAddNewPanoCard(addPanoBtn);
  }

  const addPanoEmptyBtn = container.querySelector('#btn-add-pano-empty');
  if (addPanoEmptyBtn) {
    addPanoEmptyBtn.onclick = () => handleAddNewPanoCard(addPanoEmptyBtn);
  }
}

/**
 * --------------------------------------------------------------------------
 * SOSYAL MEDYA LİNKLERİ GÖRÜNÜMÜ (/admin/socials)
 * 5 Sosyal Medya İkonu ve Linki (Supabase social_links Tablosu)
 * --------------------------------------------------------------------------
 */
function renderAdminSocials(container) {
  const links = getSocialLinks();
  const displayLinks = (links && links.length > 0) ? links : [
    { id: 'soc_1', title: 'Facebrowser', name: 'Facebrowser', target_url: 'https://face-tr.gta.world/page/parrhesia', icon_url: '/icons/facebrowser.ico', display_order: 1 },
    { id: 'soc_2', title: 'Youtube', name: 'Youtube', target_url: 'https://www.youtube.com/@thetoxicband', icon_url: '/icons/youtube.png', display_order: 2 },
    { id: 'soc_3', title: 'Soundloop', name: 'Soundloop', target_url: 'https://soundloop.app', icon_url: '/icons/soundloop.png', display_order: 3 },
    { id: 'soc_4', title: 'LS Chat', name: 'LS Chat', target_url: 'https://chat-tr.gta.world/app/s/107/5398', icon_url: '/icons/lschat.svg', display_order: 4 },
    { id: 'soc_5', title: 'SanMail', name: 'SanMail', target_url: 'https://mail-tr.gta.world/compose?to=mail%40parrhesia.com', icon_url: '/icons/sanmail.png', display_order: 5 }
  ];

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/socials')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Sosyal Medya Linkleri</h1>
            <p class="admin-page-desc">Header & Footer Sosyal Medya İkonları ve Yönlendirme Linkleri (Supabase social_links)</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button id="btn-add-social" class="admin-btn admin-btn-secondary">+ YENİ LİNK EKLE</button>
            <button id="btn-save-all-socials" class="admin-btn admin-btn-primary">💾 TÜM SOSYAL LİNKLERİ KAYDET</button>
          </div>
        </div>

        <div class="admin-social-cards-grid">
          ${displayLinks.map((item, idx) => {
            const num = String(item.display_order || (idx + 1)).padStart(2, '0');
            const titleVal = escapeHtml(item.title || item.name || '');
            const targetUrlVal = escapeHtml(item.target_url || item.url || '');
            const iconUrlVal = escapeHtml(item.icon_url || item.iconUrl || '');
            const orderVal = item.display_order || (idx + 1);
            const iconPreview = getSocialIconHTML(item);

            return `
              <div class="admin-social-card-editor" data-id="${item.id}">
                <div class="admin-social-card-header">
                  <div class="admin-social-card-badge">
                    <span>${num} // ${titleVal.toUpperCase()}</span>
                  </div>
                  <div class="admin-social-icon-preview">
                    ${iconPreview}
                  </div>
                </div>

                <div class="admin-social-card-body">
                  <div class="admin-form-group">
                    <label class="admin-label">Başlık / Platform Adı (title)*</label>
                    <input type="text" class="admin-input social-field-title" data-id="${item.id}" value="${titleVal}" placeholder="Örn: Facebrowser" required />
                  </div>

                  <div class="admin-form-group">
                    <label class="admin-label">Yönleneceği Link (target_url)*</label>
                    <input type="url" class="admin-input social-field-url" data-id="${item.id}" value="${targetUrlVal}" placeholder="https://..." required />
                    <p class="admin-input-help" style="font-size: 0.72rem; color: #70707c; margin-top: 4px;">Tıklandığında yeni sekmede açılacak tam web adresi.</p>
                  </div>

                  <div class="admin-form-group">
                    <label class="admin-label">İkon URL (icon_url)</label>
                    <input type="text" class="admin-input social-field-icon" data-id="${item.id}" value="${iconUrlVal}" placeholder="/icons/facebrowser.ico" />
                  </div>

                  <div class="admin-form-group">
                    <label class="admin-label">Görüntüleme Sırası (display_order)</label>
                    <input type="number" min="1" max="99" class="admin-input social-field-order" data-id="${item.id}" value="${orderVal}" />
                  </div>
                </div>

                <div class="admin-social-card-footer">
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${targetUrlVal ? `<a href="${targetUrlVal}" target="_blank" rel="noopener noreferrer" class="admin-btn admin-btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;" title="Linki Yeni Sekmede Aç">Test Et ↗</a>` : ''}
                    ${displayLinks.length > 5 ? `<button type="button" class="admin-action-btn btn-danger btn-delete-social" data-id="${item.id}" title="Linki Sil">Sil</button>` : ''}
                  </div>
                  <button type="button" class="admin-btn admin-btn-primary btn-save-social-single" data-id="${item.id}">KAYDET</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  // Bind individual save buttons
  const saveSingleBtns = container.querySelectorAll('.btn-save-social-single');
  saveSingleBtns.forEach(btn => {
    btn.onclick = async () => {
      const socId = btn.getAttribute('data-id');
      const card = container.querySelector(`.admin-social-card-editor[data-id="${socId}"]`);
      if (!card) return;

      const titleInput = card.querySelector('.social-field-title');
      const urlInput = card.querySelector('.social-field-url');
      const iconInput = card.querySelector('.social-field-icon');
      const orderInput = card.querySelector('.social-field-order');

      const title = titleInput ? titleInput.value.trim() : '';
      const targetUrl = urlInput ? urlInput.value.trim() : '';
      const iconUrl = iconInput ? iconInput.value.trim() : '';
      const displayOrder = orderInput ? parseInt(orderInput.value.trim(), 10) || 1 : 1;

      if (!title || !targetUrl) {
        showAdminToast('⚠ Lütfen başlık ve yönleneceği linki eksiksiz doldurun.', 'warning');
        return;
      }

      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ KAYDEDİLİYOR...';

      try {
        const payload = {
          id: socId,
          title: title,
          name: title,
          target_url: targetUrl,
          url: targetUrl,
          icon_url: iconUrl,
          display_order: displayOrder,
          sort_order: displayOrder,
          created_at: new Date().toISOString()
        };

        if (supabase) {
          const { data, error } = await supabase
            .from('social_links')
            .upsert(payload, { onConflict: 'id' })
            .select();

          if (error) throw error;
          console.log('Supabase Social Link Kaydedildi:', data);
        }

        await upsertSocialLink({
          id: socId,
          title,
          name: title,
          target_url: targetUrl,
          url: targetUrl,
          icon_url: iconUrl,
          display_order: displayOrder
        });

        logActivity('SOSYAL LİNK GÜNCELLENDİ', `"${title}" sosyal linki Supabase'e kaydedildi: ${targetUrl}`);
        showAdminToast(`✓ "${title}" BAŞARIYLA KAYDEDİLDİ`);
      } catch (err) {
        console.error('Sosyal link kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };
  });

  // Save All Social Links batch button
  const saveAllBtn = container.querySelector('#btn-save-all-socials');
  if (saveAllBtn) {
    saveAllBtn.onclick = async () => {
      saveAllBtn.disabled = true;
      saveAllBtn.textContent = '⏳ TÜMÜ KAYDEDİLİYOR...';

      try {
        const updatedList = displayLinks.map((item, idx) => {
          const card = container.querySelector(`.admin-social-card-editor[data-id="${item.id}"]`);
          const titleInput = card ? card.querySelector('.social-field-title') : null;
          const urlInput = card ? card.querySelector('.social-field-url') : null;
          const iconInput = card ? card.querySelector('.social-field-icon') : null;
          const orderInput = card ? card.querySelector('.social-field-order') : null;

          const title = titleInput ? titleInput.value.trim() : (item.title || item.name || 'Social Link');
          const targetUrl = urlInput ? urlInput.value.trim() : (item.target_url || item.url || '#');
          const iconUrl = iconInput ? iconInput.value.trim() : (item.icon_url || '');
          const displayOrder = orderInput ? parseInt(orderInput.value.trim(), 10) || (idx + 1) : (idx + 1);

          return {
            id: item.id,
            title,
            name: title,
            target_url: targetUrl,
            url: targetUrl,
            icon_url: iconUrl,
            display_order: displayOrder,
            sort_order: displayOrder,
            created_at: new Date().toISOString()
          };
        });

        if (supabase) {
          const { data, error } = await supabase
            .from('social_links')
            .upsert(updatedList, { onConflict: 'id' })
            .select();

          if (error) throw error;
          console.log('Supabase All Social Links Kaydedildi:', data);
        }

        await saveSocialLinksBatch(updatedList);
        logActivity('TÜM SOSYAL LİNKLER GÜNCELLENDİ', `${updatedList.length} sosyal link Supabase'e kaydedildi.`);
        showAdminToast('✓ TÜM SOSYAL LİNKLER BAŞARIYLA SUPABASE\'E KAYDEDİLDİ');
      } catch (err) {
        console.error('Tüm sosyal linkleri kaydetme hatası:', err);
        showAdminToast('⚠ Kayıt hatası: ' + (err.message || 'Supabase hatası'), 'danger');
      } finally {
        saveAllBtn.disabled = false;
        saveAllBtn.textContent = '💾 TÜM SOSYAL LİNKLERİ KAYDET';
      }
    };
  }

  // Add new social link button
  const addBtn = container.querySelector('#btn-add-social');
  if (addBtn) addBtn.onclick = () => openSocialModal(null, container);

  // Delete buttons
  const deleteBtns = container.querySelectorAll('.btn-delete-social');
  deleteBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      try {
        await deleteSocialLink(id);
        logActivity('SOSYAL LİNK SİLİNDİ', `Sosyal medya linki silindi: ${id}`);
        showAdminToast('✓ SOSYAL MEDYA LİNKİ SİLİNDİ', 'danger');
      } catch (err) {
        showAdminToast('⚠ Silme hatası: ' + err.message, 'danger');
      } finally {
        renderAdminSocials(container);
      }
    };
  });
}

function openSocialModal(item, rootContainer) {
  const isEdit = !!item;
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  modalOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">${isEdit ? 'SOSYAL MEDYA LİNKİNİ DÜZENLE' : 'YENİ SOSYAL MEDYA LİNKİ EKLE'}</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <form id="social-form">
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label class="admin-label">Başlık / Platform Adı (title)*</label>
            <input type="text" id="soc-title" class="admin-input" value="${item ? escapeHtml(item.title || item.name || '') : ''}" placeholder="Örn: Instagram, Spotify, Facebrowser" required />
          </div>
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label class="admin-label">Yönleneceği Link (target_url)*</label>
            <input type="url" id="soc-target-url" class="admin-input" value="${item ? escapeHtml(item.target_url || item.url || '') : ''}" placeholder="https://..." required />
          </div>
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label class="admin-label">İkon URL / Dosyası (icon_url)</label>
            <input type="text" id="soc-icon-url" class="admin-input" value="${item ? escapeHtml(item.icon_url || '') : ''}" placeholder="/icons/... veya https://..." />
          </div>
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label class="admin-label">Görüntüleme Sırası (display_order)</label>
            <input type="number" id="soc-order" min="1" max="99" class="admin-input" value="${item ? (item.display_order || 1) : 1}" />
          </div>
        </div>
        <div class="admin-modal-footer">
          <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
          <button type="submit" class="admin-btn admin-btn-primary">KAYDET</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  const form = modalOverlay.querySelector('#social-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = modalOverlay.querySelector('#soc-title').value.trim();
    const targetUrl = modalOverlay.querySelector('#soc-target-url').value.trim();
    const iconUrl = modalOverlay.querySelector('#soc-icon-url').value.trim();
    const displayOrder = parseInt(modalOverlay.querySelector('#soc-order').value.trim(), 10) || 1;

    try {
      if (isEdit) {
        await updateSocialLink(item.id, { title, target_url: targetUrl, icon_url: iconUrl, display_order: displayOrder });
        logActivity('SOSYAL LİNK GÜNCELLENDİ', `Sosyal link güncellendi: ${title}`);
        showAdminToast('✓ SOSYAL MEDYA LİNKİ GÜNCELLENDİ');
      } else {
        await addSocialLink({ title, target_url: targetUrl, icon_url: iconUrl, display_order: displayOrder });
        logActivity('SOSYAL LİNK EKLENDİ', `Yeni sosyal link eklendi: ${title}`);
        showAdminToast('✓ YENİ SOSYAL MEDYA LİNKİ EKLENDİ');
      }
    } catch (err) {
      console.error('Sosyal link modal kaydetme hatası:', err);
      showAdminToast('⚠ Kayıt hatası: ' + err.message, 'danger');
    } finally {
      closeModal();
      renderAdminSocials(rootContainer);
    }
  };
}

/**
 * Genel Silme Onayı Modalı
 */
function openDeleteConfirmModal(item, type, rootContainer) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'admin-modal-backdrop';

  const title = item.title || item.venue || item.name || 'Öğe';
  let typeLabel = 'öğeyi';
  if (type === 'TOUR') typeLabel = 'konser etkinliğini';
  else if (type === 'RELEASE') typeLabel = 'müzik yayınını';
  else if (type === 'TRANSMISSION') typeLabel = 'yazı kaydını';

  modalOverlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-header">
        <h2 class="admin-modal-title">SİLME ONAYI</h2>
        <button type="button" class="admin-modal-close">&times;</button>
      </div>
      <div class="admin-modal-body">
        <p><strong>"${escapeHtml(title)}"</strong> adlı ${typeLabel} kalıcı olarak silmek istediğinize emin misiniz?</p>
        <p class="admin-sub-text" style="margin-top: 0.5rem;">Bu işlem geri alınamaz ve sitede anında güncellenir.</p>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="admin-btn admin-btn-secondary admin-modal-cancel">İptal</button>
        <button type="button" id="btn-confirm-delete" class="admin-btn admin-btn-danger">KALICI OLARAK SİL</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  modalOverlay.querySelector('.admin-modal-close').onclick = closeModal;
  modalOverlay.querySelector('.admin-modal-cancel').onclick = closeModal;

  modalOverlay.querySelector('#btn-confirm-delete').onclick = async () => {
    if (type === 'TOUR') {
      await deleteTourEvent(item.id);
      logActivity('KONSER SİLİNDİ', `Konser silindi: ${item.id}`);
      showAdminToast('✓ KONSER ETKİNLİĞİ SİLİNDİ', 'danger');
      renderAdminTour(rootContainer);
    } else if (type === 'RELEASE') {
      await deleteRelease(item.id);
      logActivity('YAYIN SİLİNDİ', `Müzik yayını silindi: "${title}"`);
      showAdminToast('✓ MÜZİK YAYINI SİLİNDİ', 'danger');
      renderAdminMusic(rootContainer);
    } else if (type === 'TRANSMISSION') {
      await deleteJournalEntry(item.id);
      logActivity('YAZI SİLİNDİ', `Yazı kaydı silindi: "${title}"`);
      showAdminToast('✓ YAZI KAYDI SİLİNDİ', 'danger');
      renderAdminUpdates(rootContainer);
    }
    closeModal();
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * --------------------------------------------------------------------------
 * ALT BİLGİ (FOOTER) YÖNETİMİ GÖRÜNÜMÜ (/admin/footer)
 * --------------------------------------------------------------------------
 */
function renderAdminFooter(container) {
  const currentFooter = getFooterData();

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/footer')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Alt Bilgi (Footer) Yönetimi</h1>
            <p class="admin-page-desc">Plak Şirketi Telif Metni, Slogan ve Yasal Bildirimler</p>
          </div>
        </div>

        <div class="admin-form-container">
          <form id="admin-footer-form" class="admin-form">
            <div class="admin-form-group">
              <label class="admin-label">PLAK ŞİRKETİ / TELİF SATIRI (SATIR 1)</label>
              <input type="text" id="footer-line1-input" class="admin-input" value="${escapeHtml(currentFooter.line1)}" required placeholder="Örn: © DEVIL'S GRIN RECORDS 2026" />
              <p class="admin-input-help">Tüm alt bilgilerin en üstünde yer alan birincil plak şirketi başlığı.</p>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">SLOGAN / ALINTI (SATIR 2)</label>
              <textarea id="footer-line2-input" class="admin-textarea" rows="2" required placeholder="Örn: MADE OF SIN">${escapeHtml(currentFooter.line2)}</textarea>
              <p class="admin-input-help">Plak şirketi satırının hemen altında yer alan alt başlık sloganı.</p>
            </div>

            <div class="admin-form-group">
              <label class="admin-label">TELİF HAKKI SAHİBİ SATIRI (SATIR 4)</label>
              <input type="text" id="footer-line4-input" class="admin-input" value="${escapeHtml(currentFooter.line4)}" required placeholder="Örn: © 2026 Toxic" />
              <p class="admin-input-help">Gizlilik ve Koşullar linklerinin üstündeki yasal telif hakkı bildirimi.</p>
            </div>

            <div class="admin-form-actions">
              <button type="submit" class="admin-btn admin-btn-primary">FOOTER AYARLARINI KAYDET</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const form = container.querySelector('#admin-footer-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const line1 = container.querySelector('#footer-line1-input').value.trim();
      const line2 = container.querySelector('#footer-line2-input').value.trim();
      const line4 = container.querySelector('#footer-line4-input').value.trim();

      updateFooterData({
        line1,
        line2,
        line4
      });

      logActivity('FOOTER GÜNCELLENDİ', `Alt bilgi güncellendi: "${line1}"`);
      showAdminToast('✓ FOOTER AYARLARI BAŞARIYLA KAYDEDİLDİ', 'success');
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * GENEL SİTE AYARLARI GÖRÜNÜMÜ (/admin/settings)
 * --------------------------------------------------------------------------
 */
function renderAdminSettings(container) {
  const settings = getSettings();

  container.innerHTML = `
    <div class="admin-cms-layout">
      <div class="admin-mobile-header">
        <div class="admin-mobile-title">TOXIC CMS</div>
        <button id="admin-mobile-toggle-btn" class="admin-mobile-toggle">☰</button>
      </div>

      ${getAdminSidebarHTML('/admin/settings')}

      <main class="admin-main-content">
        <div class="admin-page-header">
          <div>
            <h1 class="admin-page-title">Genel Site Ayarları</h1>
            <p class="admin-page-desc">Site Başlığı, Grup Adı ve Sistem Tercihleri</p>
          </div>
        </div>

        <form id="cms-settings-form" style="max-width: 650px;">
          <div class="admin-form-group">
            <label class="admin-label">Resmi Site Başlığı (Sekme Başlığı)</label>
            <input type="text" id="set-title" class="admin-input" value="${escapeHtml(settings.siteTitle)}" required />
          </div>

          <div class="admin-form-group" style="margin-top: 1.25rem;">
            <label class="admin-label">Sanatçı / Grup Adı</label>
            <input type="text" id="set-artist" class="admin-input" value="${escapeHtml(settings.artistName)}" required />
          </div>

          <div class="admin-form-group" style="margin-top: 1.25rem; padding: 1.25rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 4px;">
            <label class="admin-label" style="color: #ffffff; font-weight: 700;">Anasayfa Hero / Albüm Başlığı (MADE OF SIN)</label>
            <input type="text" id="set-hero-title" class="admin-input" value="${escapeHtml(settings.heroAlbumTitle !== undefined && settings.heroAlbumTitle !== null ? settings.heroAlbumTitle : '')}" placeholder="Örn: MADE OF SIN (İsteğe bağlı, boş bırakılabilir)" />
            <p class="admin-hint" style="margin-top: 0.5rem; font-size: 0.8rem; color: #888892; line-height: 1.4;">Anasayfada Toxic logosunun altında yer alan büyük başlık metnini belirler. Boş bırakırsanız başlık alanı ön yüzde gizlenir ve logo dikeyde dengelenir.</p>
          </div>

          <div class="admin-form-group" style="margin-top: 1.25rem;">
            <label class="admin-label">İletişim & Booking E-Postası</label>
            <input type="email" id="set-email" class="admin-input" value="${escapeHtml(settings.contactEmail)}" required />
          </div>

          <div class="admin-form-group" style="margin-top: 1.5rem;">
            <label class="admin-checkbox-label">
              <input type="checkbox" id="set-maintenance" ${settings.maintenanceMode ? 'checked' : ''} />
              <span>Bakım Modunu Aktif Et (Sistem Bildirimi)</span>
            </label>
          </div>

          <div style="margin-top: 2rem;">
            <button type="submit" class="admin-btn admin-btn-primary">SİSTEM AYARLARINI KAYDET</button>
            <span id="settings-saved-msg" class="admin-success-msg"></span>
          </div>
        </form>
      </main>
    </div>
  `;

  bindAdminNavEvents(container);

  const form = container.querySelector('#cms-settings-form');
  const msgEl = container.querySelector('#settings-saved-msg');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        siteTitle: container.querySelector('#set-title').value,
        artistName: container.querySelector('#set-artist').value,
        heroAlbumTitle: container.querySelector('#set-hero-title').value.trim(),
        contactEmail: container.querySelector('#set-email').value,
        maintenanceMode: container.querySelector('#set-maintenance').checked
      };

      saveSettings(updated);
      logActivity('AYARLAR GÜNCELLENDİ', 'Genel sistem ayarları güncellendi');
      showAdminToast('✓ SİSTEM AYARLARI BAŞARIYLA KAYDEDİLDİ');

      if (msgEl) {
        msgEl.textContent = 'Ayarlar başarıyla kaydedildi!';
        setTimeout(() => msgEl.textContent = '', 3000);
      }
    });
  }
}
