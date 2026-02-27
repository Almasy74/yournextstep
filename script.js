/* =======================================
   YourNextStep.ai — Client-Side JS
   FAQ accordion, audio player, mobile nav
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAudioPlayer();
  initAudioScriptToggle();
  initSearch();
  initAffiliateTracking();
  initCWVMetrics();
});

/* --- Mobile Navigation --- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('active');
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('active');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('active')) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('active');
      toggle.focus();
    }
  });
}

/* --- Audio Player --- */
function initAudioPlayer() {
  const player = document.querySelector('.audio-player');
  if (!player) return;

  const audio = player.querySelector('audio');
  const btnPlay = player.querySelector('.btn-play');
  const progressBar = player.querySelector('.progress-bar');
  const progressFill = player.querySelector('.progress-fill');
  const timeCurrent = player.querySelector('.time-current');
  const timeDuration = player.querySelector('.time-duration');

  if (!audio || !btnPlay) return;

  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const ICONS_SVG = {
    play: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    pause: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>`
  };

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btnPlay.innerHTML = ICONS_SVG.pause;
      btnPlay.setAttribute('aria-label', 'Pause audio briefing');
    } else {
      audio.pause();
      btnPlay.innerHTML = ICONS_SVG.play;
      btnPlay.setAttribute('aria-label', 'Play audio briefing');
    }
  });

  // Keyboard: Space/Enter to toggle play
  btnPlay.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      btnPlay.click();
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (timeDuration) timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    btnPlay.innerHTML = ICONS_SVG.play;
    btnPlay.setAttribute('aria-label', 'Play audio briefing');
    if (progressFill) progressFill.style.width = '0%';
  });

  // Click to seek
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // Keyboard seek on progress bar
    progressBar.setAttribute('tabindex', '0');
    progressBar.setAttribute('role', 'slider');
    progressBar.setAttribute('aria-label', 'Audio progress');
    progressBar.addEventListener('keydown', (e) => {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
      } else if (e.key === 'ArrowLeft') {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
      }
    });
  }
}

/* --- Audio Script Toggle --- */
function initAudioScriptToggle() {
  const btn = document.querySelector('.audio-script-toggle');
  const script = document.querySelector('.audio-script');
  if (!btn || !script) return;

  btn.addEventListener('click', () => {
    const visible = script.classList.toggle('visible');
    btn.textContent = visible ? 'Hide transcript ▲' : 'Read transcript ▼';
    btn.setAttribute('aria-expanded', String(visible));
  });
}

/* --- Search Functionality --- */
function initSearch() {
  const searchToggle = document.querySelector('.search-toggle');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchClear = document.getElementById('search-clear');
  const searchClose = document.querySelector('.search-close');

  if (!searchToggle || !searchBar || !searchInput || !searchResults) return;

  let searchIndex = null;
  let selectedIndex = -1;

  async function loadSearchIndex() {
    if (searchIndex) return;
    try {
      const resp = await fetch('/search-index.json');
      searchIndex = await resp.json();
    } catch (err) {
      console.error('Failed to load search index', err);
    }
  }

  function toggleSearchBar(force) {
    const isClosing = force === false || !searchBar.classList.contains('hide');
    searchBar.classList.toggle('hide', force === false);
    searchToggle.setAttribute('aria-expanded', !isClosing);

    if (!isClosing) {
      loadSearchIndex();
      setTimeout(() => searchInput.focus(), 100);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = '';
      if (force === false) {
        searchInput.value = '';
        searchResults.classList.add('hide');
        searchClear.classList.add('hide');
      }
      selectedIndex = -1;
    }
  }

  searchToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSearchBar();
  });

  if (searchClose) {
    searchClose.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSearchBar(false);
    });
  }

  function renderResults(query) {
    if (!searchIndex) return;

    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 15);

    if (results.length === 0) {
      searchResults.innerHTML = `<div class="search-no-results">No results for "${query}"</div>`;
      searchResults.classList.remove('hide');
      selectedIndex = -1;
      return;
    }

    // Grouping
    const groups = {};
    results.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    const categoryNames = {
      'career-decisions': 'Career Decisions',
      'ai-and-jobs': 'AI & Jobs',
      'learning': 'Learning',
      'money-decisions': 'Money Decisions',
      'side-hustles': 'Side Hustles'
    };

    let html = '';
    Object.keys(groups).forEach(cat => {
      html += `<div class="search-group-title">${categoryNames[cat] || cat}</div>`;
      groups[cat].forEach(item => {
        html += `
          <a href="/${item.slug}/" class="search-item" data-slug="${item.slug}">
            <span class="search-item-title">${item.title}</span>
            <span class="search-item-desc">${item.description}</span>
          </a>`;
      });
    });

    searchResults.innerHTML = html;
    searchResults.classList.remove('hide');
    selectedIndex = -1;
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
      searchResults.classList.add('hide');
      searchClear.classList.add('hide');
      return;
    }
    searchClear.classList.remove('hide');
    renderResults(query);
  });

  searchClear.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.value = '';
    searchResults.classList.add('hide');
    searchClear.classList.add('hide');
    searchInput.focus();
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-item');

    if (e.key === 'Escape') {
      toggleSearchBar(false);
      return;
    }

    if (searchResults.classList.contains('hide') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        e.preventDefault();
        items[selectedIndex].click();
      }
    }
  });

  function updateSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (searchBar.classList.contains('hide')) return;
    if (!searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
      toggleSearchBar(false);
    }
  });
}

/* --- Affiliate Tracking --- */
function initAffiliateTracking() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a.next-step-cta[data-affiliate="true"]');
    if (!anchor) return;
    if (isDuplicateAffiliateClick(anchor)) return;

    const payload = {
      url: anchor.href,
      merchant: anchor.dataset.merchant || 'unknown',
      page_path: anchor.dataset.pagePath || window.location.pathname,
      slot: anchor.dataset.slot || 'unknown',
      item_id: anchor.dataset.itemId || '',
      item_title: anchor.dataset.itemTitle || ''
    };

    trackAffiliateClick(payload);
  }, true);
}

function trackAffiliateClick(payload) {
  sendAnalyticsEvent('affiliate_click', payload);

  window.dispatchEvent(new CustomEvent('yournextstep:affiliate_click', { detail: payload }));

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.info('[affiliate_click]', payload);
  }
}

/* --- Core Web Vitals RUM --- */
function initCWVMetrics() {
  if (typeof PerformanceObserver === 'undefined') return;
  const metrics = { lcp: null, cls: 0, inp: null };
  const sent = new Set();

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) metrics.lcp = Math.round(last.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {
    // no-op for unsupported browsers
  }

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) metrics.cls += entry.value;
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (_) {
    // no-op for unsupported browsers
  }

  try {
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const current = Math.round(entry.duration);
        metrics.inp = Math.max(metrics.inp || 0, current);
      }
    });
    inpObserver.observe({ type: 'event', durationThreshold: 40, buffered: true });
  } catch (_) {
    // no-op for unsupported browsers
  }

  function flushCWV() {
    const payloads = [
      { metric: 'LCP', value: metrics.lcp },
      { metric: 'CLS', value: Number(metrics.cls.toFixed(4)) },
      { metric: 'INP', value: metrics.inp }
    ];

    payloads.forEach((m) => {
      if (m.value === null || m.value === undefined) return;
      const dedupeKey = `${m.metric}:${m.value}`;
      if (sent.has(dedupeKey)) return;
      sent.add(dedupeKey);
      sendAnalyticsEvent('cwv_metric', {
        metric_name: m.metric,
        metric_value: m.value,
        page_path: window.location.pathname
      });
    });
  }

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushCWV();
  });
  window.addEventListener('pagehide', flushCWV);
}

function sendAnalyticsEvent(eventName, payload) {
  if (!isAffiliateTrackingAllowed()) return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  if (typeof window.plausible === 'function') {
    window.plausible(eventName, { props: payload });
  }

  if (Array.isArray(window._paq)) {
    const label = payload.slot && payload.merchant ? `${payload.slot}:${payload.merchant}` : (payload.metric_name || eventName);
    window._paq.push(['trackEvent', 'site', eventName, label, 1]);
  }

  if (window.analytics && typeof window.analytics.track === 'function') {
    window.analytics.track(eventName, payload);
  }
}

function isDuplicateAffiliateClick(anchor) {
  const now = Date.now();
  const prev = Number(anchor.dataset.lastAffiliateClickTs || 0);
  anchor.dataset.lastAffiliateClickTs = String(now);
  return now - prev < 600;
}

function isAffiliateTrackingAllowed() {
  // Explicit consent object from CMP/app state.
  if (window.ynsConsent && typeof window.ynsConsent.analytics === 'boolean') {
    return window.ynsConsent.analytics;
  }

  // Optional explicit app-level enable flag.
  if (typeof window.ynsEnableAnalytics === 'boolean') {
    return window.ynsEnableAnalytics;
  }

  // If TCF exists but no mapped consent, fail closed.
  if (typeof window.__tcfapi === 'function') return false;

  if (window.gtag && typeof window.gtag === 'function' && window['ga-disable'] === true) return false;
  return false;
}
