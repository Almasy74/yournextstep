#!/usr/bin/env node
/**
 * YourNextStep.ai — Static Site Generator
 * Reads data/decisions.json → generates dist/ with HTML pages, sitemap, robots.txt
 */

const fs = require('fs-extra');
const path = require('path');

const SRC = __dirname;
const DIST = path.join(SRC, 'dist');
const DATA = path.join(SRC, 'data', 'decisions.json');
const SITE_URL = 'https://yournextstep.ai';
const SITE_NAME = 'YourNextStep.ai';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const ITEMS_PER_PAGE = 30;
const ASSET_VERSION = String(Math.floor(Date.now() / 1000));

function asset(pathname) {
  return `${pathname}?v=${ASSET_VERSION}`;
}

const ICONS = {
  compass: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  banknote: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5c2.2 1.62 3 5 3 5 .19-1.53 2.14-3.51 5-5"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><polyline points="20 6 9 17 4 12"/></svg>`,
  circleX: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>`,
  brain: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.97-3.06 2.5 2.5 0 0 1-2.51-4.58 2.5 2.5 0 0 1 .53-3.64 2.5 2.5 0 0 1 3.17-2.78A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.97-3.06 2.5 2.5 0 0 0 2.51-4.58 2.5 2.5 0 0 0-.53-3.64 2.5 2.5 0 0 0-3.17-2.78A2.5 2.5 0 0 0 14.5 2Z"/></svg>`,
  thumbsUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>`,
  thumbsDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>`,
  headphones: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/><line x1="10" x2="14" y1="13" y2="13"/><line x1="10" x2="14" y1="17" y2="17"/><line x1="8" x2="8" y1="9" y2="9"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="site-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};

const CATEGORIES = {
  'career-decisions': { title: 'Career Decisions', icon: 'compass', description: 'Navigate job changes, promotions, and career pivots with structured analysis.' },
  'ai-and-jobs': { title: 'AI & Jobs', icon: 'cpu', description: 'Understand how AI is reshaping your industry and what moves to make.' },
  'learning': { title: 'Learning', icon: 'book', description: 'Decide which skills, courses, and credentials are actually worth your time.' },
  'money-decisions': { title: 'Money Decisions', icon: 'banknote', description: 'Evaluate financial choices with frameworks, not feelings.' },
  'side-hustles': { title: 'Side Hustles', icon: 'rocket', description: 'Assess side income opportunities with realistic timelines and tradeoffs.' }
};

// ─── Schema Normalization ───────────────────────────────────
// Ensures every entry has safe defaults for optional fields
function normalizeEntry(d) {
  // Audio defaults
  if (!d.audio) d.audio = {};
  if (!d.audio.script) d.audio.script = '';
  if (d.audio.audioUrl === undefined) d.audio.audioUrl = '';
  if (d.audio.durationSec === undefined) d.audio.durationSec = null;
  if (!d.audio.voice) d.audio.voice = '';
  if (!d.audio.provider) d.audio.provider = '';
  // Core defaults
  if (!d.primaryIntent) d.primaryIntent = derivePrimaryIntent(d.category);
  if (!d.readingTime) d.readingTime = estimateReadingTime(d);
  if (!d.relatedSlugs) d.relatedSlugs = [];
  if (!d.version) d.version = 1;
  if (!d.id) d.id = d.slug; // fallback: slug-as-id
  if (d.noindex === undefined) d.noindex = false;
  // Template variant: deterministic from slug hash
  if (!d.templateVariant) {
    const hash = d.slug.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    d.templateVariant = ['A', 'B', 'C'][hash % 3];
  }
  return d;
}

function derivePrimaryIntent(category) {
  const map = {
    'career-decisions': 'career-service',
    'ai-and-jobs': 'course-affiliate',
    'learning': 'course-affiliate',
    'money-decisions': 'tool-affiliate',
    'side-hustles': 'tool-affiliate'
  };
  return map[category] || 'general';
}

function estimateReadingTime(d) {
  const words = JSON.stringify(d).split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200));
}

function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(dateObj) {
  const now = new Date();
  return Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));
}

// ─── QA Gate (strict thresholds for scale) ──────────────────
function qaCheck(d) {
  const errors = [];
  const warnings = [];
  if (d.confidence < 0 || d.confidence > 100) errors.push(`confidence ${d.confidence} out of 0-100`);
  if (d.confidence > 95) warnings.push(`confidence ${d.confidence}% suspiciously high — review`);
  if (d.confidence < 30) warnings.push(`confidence ${d.confidence}% suspiciously low — review`);
  if (!d.pros || d.pros.length < 5) errors.push(`pros has ${(d.pros || []).length} items (min 5)`);
  if (!d.cons || d.cons.length < 5) errors.push(`cons has ${(d.cons || []).length} items (min 5)`);
  if (!d.scorecard || d.scorecard.length < 6) errors.push(`scorecard has ${(d.scorecard || []).length} factors (min 6)`);
  if (!d.faq || d.faq.length < 6) errors.push(`faq has ${(d.faq || []).length} items (min 6)`);
  const scriptWords = (d.audio && d.audio.script) ? d.audio.script.split(/\s+/).length : 0;
  if (scriptWords < 250) errors.push(`audio script has ${scriptWords} words (min 250)`);
  // Scenario depth: each scenario must have ≥30 words
  if (d.scenarios) {
    d.scenarios.forEach((s, i) => {
      const words = (s.description || '').split(/\s+/).length;
      if (words < 20) errors.push(`scenario ${i + 1} has ${words} words (min 20)`);
    });
  }
  if (!['Yes', 'No', 'Depends'].includes(d.verdict)) errors.push(`verdict "${d.verdict}" invalid`);
  if (!d.slug) errors.push('missing slug');
  if (!d.title) errors.push('missing title');
  if (!d.publishedDate) errors.push('missing publishedDate');
  if (!d.updatedDate) errors.push('missing updatedDate');

  const publishedDate = parseISODate(d.publishedDate);
  const updatedDate = parseISODate(d.updatedDate);
  if (!publishedDate) errors.push(`invalid publishedDate "${d.publishedDate}" (expected YYYY-MM-DD)`);
  if (!updatedDate) errors.push(`invalid updatedDate "${d.updatedDate}" (expected YYYY-MM-DD)`);
  if (publishedDate && updatedDate && updatedDate < publishedDate) {
    errors.push('updatedDate is earlier than publishedDate');
  }
  if (updatedDate) {
    const ageDays = daysSince(updatedDate);
    if (ageDays > 120) warnings.push(`content is ${ageDays} days old - refresh recommended`);
    if (ageDays > 365) errors.push(`content is stale (${ageDays} days since update)`);
  }

  const sourcesCount = (d.sources || []).length;
  if (sourcesCount < 4) warnings.push(`sources has ${sourcesCount} items (recommended min 4)`);
  const urlLikeSources = (d.sources || []).filter((s) => /^https?:\/\//i.test(String(s).trim())).length;
  if (urlLikeSources < 1) warnings.push('sources contain no direct source URLs');

  // Affiliate count guard (hard rule: max 3)
  const affiliateCount = (d.nextSteps || []).filter(ns => ns.affiliateUrl).length;
  if (affiliateCount > 3) errors.push(`${affiliateCount} affiliate links exceeds hard limit of 3`);
  return { errors, warnings };
}

// ─── Deterministic Related Links ────────────────────────────
// Filters out dead slugs, then backfills from same-category pages
function resolveRelatedSlugs(d, allPublished) {
  const slugSet = new Set(allPublished.map(x => x.slug));
  // Keep only slugs that actually exist
  const valid = (d.relatedSlugs || []).filter(s => slugSet.has(s) && s !== d.slug);
  // Backfill from same-category if under 2
  if (valid.length < 2) {
    const sameCategory = allPublished
      .filter(x => x.category === d.category && x.slug !== d.slug && !valid.includes(x.slug))
      .map(x => x.slug);
    while (valid.length < Math.min(3, sameCategory.length + valid.length) && sameCategory.length > 0) {
      valid.push(sameCategory.shift());
    }
  }
  // Cap at 5
  return valid.slice(0, 5);
}

// ─── HTML Helpers ───────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function verdictClass(v) {
  if (v === 'Yes') return 'verdict-yes';
  if (v === 'No') return 'verdict-no';
  return 'verdict-depends';
}
function verdictTagClass(v) {
  if (v === 'Yes') return 'tag-yes';
  if (v === 'No') return 'tag-no';
  return 'tag-depends';
}

function merchantFromUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return host || 'external-merchant';
  } catch {
    return 'external-merchant';
  }
}

function affiliateSlotFor(index) {
  if (index === 0) return 'top-of-content';
  if (index === 1) return 'mid';
  return 'footer';
}

function jsonLD_FAQ(faq) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faq.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
    }))
  });
}

function jsonLD_Article(d) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/${d.slug}/#article`,
    'mainEntityOfPage': `${SITE_URL}/${d.slug}/`,
    'headline': d.title,
    'description': d.metaDescription,
    'datePublished': d.publishedDate,
    'dateModified': d.updatedDate,
    'author': { '@type': 'Organization', 'name': SITE_NAME },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/favicon.svg`
      }
    },
    'image': DEFAULT_OG_IMAGE
  });
}

function jsonLD_Breadcrumb(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url
    }))
  });
}

function jsonLD_Organization() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    'name': SITE_NAME,
    'url': SITE_URL,
    'logo': `${SITE_URL}/favicon.svg`
  });
}

function jsonLD_WebSite() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    'url': SITE_URL,
    'name': SITE_NAME,
    'publisher': { '@id': `${SITE_URL}/#organization` }
  });
}

// ─── Shell: wraps every page ────────────────────────────────
function shell({ title, description, canonical, bodyClass, content, noindex, jsonLdBlocks, ogType, ogImage, twitterCard }) {
  const robotsMeta = noindex ? '<meta name="robots" content="noindex, nofollow">' : '';
  const mergedJsonLdBlocks = [jsonLD_Organization(), jsonLD_WebSite(), ...(jsonLdBlocks || [])];
  const jsonLd = mergedJsonLdBlocks.map(j => `<script type="application/ld+json">${j}</script>`).join('\n');
  const resolvedOgType = ogType || 'website';
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedTwitterCard = twitterCard || 'summary_large_image';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="${asset('/favicon.svg')}">
  <title>${esc(title)} — ${SITE_NAME}</title>
  <meta name="description" content="${esc(description)}">
  ${robotsMeta}
  <meta name="author" content="${SITE_NAME}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${resolvedOgType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${resolvedOgImage}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="YourNextStep.ai">
  <meta name="twitter:card" content="${resolvedTwitterCard}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${resolvedOgImage}">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${asset('/style.css')}">
  ${jsonLd}
</head>
<body class="${bodyClass || ''}">
  <a href="#main" class="skip-link">Skip to main content</a>
  ${navHTML()}
  <main id="main">
    ${content}
  </main>
  ${footerHTML()}
  <script src="${asset('/script.js')}"></script>
</body>
</html>`;
}

function navHTML() {
  return `<header class="site-header">
    <div class="container site-header-inner">
      <div class="site-header-left">
        <a href="/" class="site-logo" aria-label="YourNextStep.ai home">
          <img src="${asset('/logo-header-noai.png')}" class="site-logo-image" alt="YourNextStep.ai" width="191" height="44" style="height:44px;width:auto;max-height:44px;">
        </a>
      </div>
      
      <div class="nav-actions">
        <button class="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-bar">${ICONS.search}</button>
        <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">${ICONS.menu}</button>
      </div>

      <nav id="main-nav">
        <ul class="nav-links" role="list">
          <li><a href="/career-decisions/">Career</a></li>
          <li><a href="/ai-and-jobs/">AI & Jobs</a></li>
          <li><a href="/learning/">Learning</a></li>
          <li><a href="/money-decisions/">Money</a></li>
          <li><a href="/side-hustles/">Side Hustles</a></li>
          <li><a href="/best-of/">Best Of</a></li>
          <li><a href="/about.html">About</a></li>
        </ul>
      </nav>
    </div>

    <!-- Expanded Search Bar -->
    <div id="search-bar" class="search-bar-expanded hide" role="search">
      <div class="container">
        <div class="search-expanded-inner">
          <div class="search-input-wrapper">
            <span class="search-icon-inline">${ICONS.search}</span>
            <input type="text" id="search-input" placeholder="Search categories and decisions..." aria-label="Search across all categories" autocomplete="off">
            <button id="search-clear" class="hide" aria-label="Clear search">${ICONS.x}</button>
          </div>
          <button class="search-close" aria-label="Close search">Close</button>
        </div>
        <div id="search-results" class="search-results hide" role="listbox"></div>
      </div>
    </div>
  </header>`;
}

function footerHTML() {
  return `<footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo">YourNextStep<span>.ai</span></a>
        <p>AI-powered decision intelligence for career, learning, and financial choices.</p>
      </div>
      <div class="footer-col">
        <h4>Categories</h4>
        <ul role="list">
          <li><a href="/career-decisions/">Career Decisions</a></li>
          <li><a href="/ai-and-jobs/">AI & Jobs</a></li>
          <li><a href="/learning/">Learning</a></li>
          <li><a href="/money-decisions/">Money Decisions</a></li>
          <li><a href="/side-hustles/">Side Hustles</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Trust</h4>
        <ul role="list">
          <li><a href="/about.html">About</a></li>
          <li><a href="/how-scoring-works.html">How Scoring Works</a></li>
          <li><a href="/sources-update-policy.html">Sources & Updates</a></li>
          <li><a href="/disclaimer.html">Disclaimer</a></li>
          <li><a href="/best-of/">Best Of Guides</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul role="list">
          <li><a href="/disclaimer.html">Terms &amp; Disclaimer</a></li>
          <li><a href="/affiliate-disclosure/">Affiliate Disclosure</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} YourNextStep.ai. AI-generated analysis. Not professional advice. <a href="/disclaimer.html">Full disclaimer</a>.</p>
    </div>
  </footer>`;
}

// ─── Template Variant Sections ──────────────────────────────
// Breaks the "scaled template pattern" with 3 layout variants
function templateVariantHTML(d) {
  const variant = d.templateVariant || 'A';
  if (variant === 'A' && d.scorecard && d.scorecard.length >= 2) {
    // Variant A: Comparison table (top 3 vs bottom 3 factors)
    const sorted = [...d.scorecard].sort((a, b) => (b.weight * b.score) - (a.weight * a.score));
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3);
    return `<section class="decision-section" aria-label="Key comparison">
        <h2>What Matters Most vs. Least</h2>
        <div class="who-grid">
          <div class="who-card who-should">
            <h3>💪 Strongest Factors</h3>
            <ul role="list">${top3.map(f => `<li><strong>${esc(f.factor)}</strong> — scored ${f.score}/10 (weight: ${f.weight})</li>`).join('')}</ul>
          </div>
          <div class="who-card who-shouldnt">
            <h3>⚡ Weakest Factors</h3>
            <ul role="list">${bottom3.map(f => `<li><strong>${esc(f.factor)}</strong> — scored ${f.score}/10 (weight: ${f.weight})</li>`).join('')}</ul>
          </div>
        </div>
      </section>`;
  } else if (variant === 'B') {
    // Variant B: Common mistakes block
    return `<section class="decision-section" aria-label="Common mistakes">
        <h2>Common Mistakes People Make</h2>
        <div class="risk-list">
          <div class="risk-card"><span class="risk-icon" aria-hidden="true">1</span><p>Deciding purely on emotion without weighing the factors above. Use the scorecard before committing.</p></div>
          <div class="risk-card"><span class="risk-icon" aria-hidden="true">2</span><p>Ignoring the "worst case" scenario. If you can't survive it, the decision carries more risk than you think.</p></div>
          <div class="risk-card"><span class="risk-icon" aria-hidden="true">3</span><p>Skipping the "who should NOT" section. The best decisions start by eliminating bad fits.</p></div>
        </div>
      </section>`;
  } else {
    // Variant C: Conditional advice
    return `<section class="decision-section" aria-label="Conditional advice">
        <h2>If You're in This Situation, Do This</h2>
        <div class="scenarios-grid">
          <div class="scenario-card"><h4>🎯 If you're early-career</h4><p>Focus on the "Who Should" criteria above. Your risk tolerance is higher and recovery time from a wrong move is shorter.</p></div>
          <div class="scenario-card"><h4>🏠 If you have dependents</h4><p>Prioritize the financial factors in the scorecard. The "Realistic Case" scenario should be your planning baseline, not the best case.</p></div>
          <div class="scenario-card"><h4>⏰ If you're on a deadline</h4><p>Skip straight to "Recommended Next Steps" and take the first action within 48 hours. Analysis paralysis is the biggest risk.</p></div>
        </div>
      </section>`;
  }
}

// ─── Decision Page Template ─────────────────────────────────
function decisionPageHTML(d, allDecisions) {
  const catMeta = CATEGORIES[d.category] || { title: d.category, icon: 'fileText' };
  const vClass = verdictClass(d.verdict);
  const isYMYL = d.category === 'money-decisions';

  // Related decisions (already resolved by build to real slugs)
  const related = (d.relatedSlugs || [])
    .map(s => allDecisions.find(x => x.slug === s))
    .filter(Boolean);

  // Scorecard totals
  const totalWeight = d.scorecard.reduce((s, r) => s + r.weight, 0);
  const weightedScore = d.scorecard.reduce((s, r) => s + (r.weight * r.score), 0);
  const maxWeightedScore = d.scorecard.reduce((s, r) => s + (r.weight * 10), 0);
  const overallPct = Math.round((weightedScore / maxWeightedScore) * 100);

  // Check if page has affiliate links (for conditional disclosure)
  const hasAffiliateLinks = (d.nextSteps || []).slice(0, 3).some(ns => ns.affiliateUrl);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL + '/' },
    { name: catMeta.title, url: `${SITE_URL}/${d.category}/` },
    { name: d.title, url: `${SITE_URL}/${d.slug}/` }
  ];

  const jsonLdBlocks = [
    jsonLD_Breadcrumb(breadcrumbItems),
    jsonLD_Article(d)
  ];
  // Only add FAQ schema if questions are substantive (>=5)
  if (d.faq && d.faq.length >= 5) {
    jsonLdBlocks.push(jsonLD_FAQ(d.faq));
  }

  const content = `
    <div class="container">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a> <span class="separator">›</span>
        <a href="/${d.category}/">${esc(catMeta.title)}</a> <span class="separator">›</span>
        <span aria-current="page">${esc(d.title)}</span>
      </nav>

      ${isYMYL ? `<div class="ymyl-banner" role="alert">
        <span class="ymyl-banner-icon" aria-hidden="true">⚠️</span>
        <p><strong>Disclaimer:</strong> This analysis is educational and does not constitute financial advice. We present frameworks and alternatives — not specific investment recommendations. <a href="/disclaimer.html">Full disclaimer</a>.</p>
      </div>` : ''}

      <!-- Verdict Banner -->
      <section class="verdict-banner ${vClass}" aria-label="Verdict">
        <p class="verdict-label">Our Verdict</p>
        <h1 class="verdict-text">${esc(d.title)}</h1>
        <p class="verdict-subtitle">
          <strong style="font-size:1.3em">${esc(d.verdict)}</strong>
        </p>
        <div class="verdict-meta">
          <span>Confidence: ${d.confidence}%
            <span class="confidence-bar" role="meter" aria-valuenow="${d.confidence}" aria-valuemin="0" aria-valuemax="100" aria-label="Confidence ${d.confidence}%">
              <span class="confidence-fill" style="width:${d.confidence}%"></span>
            </span>
          </span>
          <span>${d.readingTime} min read</span>
          <span>Updated ${d.updatedDate}</span>
        </div>
      </section>

      <!-- Audio Briefing -->
      <section class="decision-section" aria-label="Audio briefing">
        <div class="audio-player">
          <h3>${ICONS.headphones} 3-Minute Audio Briefing</h3>
          <p class="audio-player-subtitle">${d.audio.audioUrl ? 'Listen to the summary' : 'Audio coming soon — read the transcript below'}</p>
          ${d.audio.audioUrl ? `<audio preload="metadata" src="${esc(d.audio.audioUrl)}"></audio>
          <div class="audio-controls">
            <button class="btn-play" aria-label="Play audio briefing">${ICONS.play}</button>
            <div class="audio-progress">
              <div class="progress-bar"><div class="progress-fill"></div></div>
              <div class="audio-time"><span class="time-current">0:00</span><span class="time-duration">0:00</span></div>
            </div>
          </div>` : ''}
          <button class="audio-script-toggle" aria-expanded="false">Read transcript ▼</button>
          <div class="audio-script" role="region" aria-label="Audio transcript">
            <p>${esc(d.audio.script)}</p>
          </div>
        </div>
      </section>

      <!-- Who Should / Shouldn't -->
      <section class="decision-section" aria-label="Who this is for">
        <h2>Who Is This For?</h2>
        <div class="who-grid">
          <div class="who-card who-should">
            <h3>${ICONS.check} You should if…</h3>
            <ul role="list">${d.whoShould.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
          </div>
          <div class="who-card who-shouldnt">
            <h3>${ICONS.circleX} You should NOT if…</h3>
            <ul role="list">${d.whoShouldNot.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>

      <!-- Decision Scorecard -->
      <section class="decision-section" aria-label="Decision scorecard">
        <h2>Decision Scorecard</h2>
        <div class="scorecard">
          <div class="scorecard-header">
            <span class="scorecard-col-factor">Factor</span>
            <span class="scorecard-col-weight">Weight</span>
            <span class="scorecard-col-score">Score</span>
            <span class="scorecard-col-weighted">Weighted</span>
          </div>
          ${d.scorecard.map(row => {
    const weighted = row.weight * row.score;
    const maxW = row.weight * 10;
    const pct = Math.round((weighted / maxW) * 100);
    return `<div class="scorecard-row">
              <span class="scorecard-cell scorecard-cell-factor" data-label="Factor">${esc(row.factor)}</span>
              <span class="scorecard-cell scorecard-cell-weight" data-label="Weight">${row.weight}/10</span>
              <span class="scorecard-cell scorecard-cell-score" data-label="Score">${row.score}/10</span>
              <span class="scorecard-cell scorecard-cell-weighted" data-label="Weighted">
                <span class="scorecard-weighted-value">${weighted}/${maxW}</span>
                <div class="scorecard-bar"><div class="scorecard-bar-fill" style="width:${pct}%"></div></div>
              </span>
            </div>`;
  }).join('')}
          <div class="scorecard-total">
            <span>Overall Score</span>
            <span>${overallPct}% (${weightedScore}/${maxWeightedScore})</span>
          </div>
        </div>
      </section>

      <!-- Pros & Cons -->
      <section class="decision-section" aria-label="Pros and cons">
        <h2>Pros & Cons</h2>
        <div class="proscons-grid">
          <div class="proscons-column">
            <h3>${ICONS.thumbsUp} Pros</h3>
            ${d.pros.map(p => `<div class="proscons-item"><h4>${esc(p.title)}</h4><p>${esc(p.detail)}</p></div>`).join('')}
          </div>
          <div class="proscons-column">
            <h3>${ICONS.thumbsDown} Cons</h3>
            ${d.cons.map(c => `<div class="proscons-item"><h4>${esc(c.title)}</h4><p>${esc(c.detail)}</p></div>`).join('')}
          </div>
        </div>
      </section>

      <!-- Risks -->
      <section class="decision-section" aria-label="Risks people underestimate">
        <h2>Risks People Underestimate</h2>
        <div class="risk-list">
          ${d.risksUnderestimated.map(r => `<div class="risk-card"><span class="risk-icon" aria-hidden="true">${ICONS.alertTriangle}</span><p>${esc(r)}</p></div>`).join('')}
        </div>
      </section>

      <!-- Scenarios -->
      <section class="decision-section" aria-label="Realistic scenarios">
        <h2>3 Realistic Scenarios</h2>
        <div class="scenarios-grid">
          ${d.scenarios.map(s => `<div class="scenario-card"><h4>${s.title}</h4><p>${esc(s.description)}</p></div>`).join('')}
        </div>
      </section>

      <!-- Next Steps -->
      <section class="decision-section" aria-label="Recommended next steps">
        <h2>Recommended Next Steps</h2>
        ${hasAffiliateLinks ? `<div class="affiliate-disclosure" role="note" aria-label="Advertising disclosure">
          <strong>Ad</strong> · Some links below are advertising (affiliate) links. If you use them, we may earn a commission. Our analysis is independent. <a href="/affiliate-disclosure/">Full disclosure</a>.
        </div>` : ''}
        <div class="next-steps-list">
          ${d.nextSteps.slice(0, 3).map((ns, index) => {
    const isPrimary = ns.isPrimary ? ' primary' : '';
    const slot = affiliateSlotFor(index);
    const merchant = ns.affiliateUrl ? merchantFromUrl(ns.affiliateUrl) : '';
    const ctaHTML = ns.affiliateUrl
      ? `<a href="${esc(ns.affiliateUrl)}" class="next-step-cta affiliate-link" rel="sponsored nofollow noopener noreferrer" target="_blank" data-affiliate="true" data-slot="${slot}" data-merchant="${esc(merchant)}" data-page-path="/${d.slug}/" data-item-id="${d.slug}-${index + 1}" data-item-title="${esc(ns.action)}" aria-label="${esc(`Advertising link: ${merchant}. ${ns.affiliateLabel || 'View offer'}`)}">${esc(ns.affiliateLabel || 'View offer')} <span class="sr-only">(advertising link, opens in new tab)</span></a>`
      : '';
    return `<div class="next-step-card${isPrimary}">
              <div class="next-step-info"><h4>${ns.isPrimary ? ICONS.star + ' ' : ''}${esc(ns.action)}</h4></div>
              ${ctaHTML}
            </div>`;
  }).join('')}
        </div>
      </section>

      <!-- FAQ -->
      <section class="decision-section" aria-label="Frequently asked questions">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          ${d.faq.map(f => `<details class="faq-item">
            <summary>${esc(f.q)}</summary>
            <div class="faq-answer"><p>${esc(f.a)}</p></div>
          </details>`).join('')}
        </div>
      </section>



      <!-- Template Variant Section (breaks pattern) -->
      ${templateVariantHTML(d)}

      <!-- Sources -->
      <section class="decision-section" aria-label="Sources">
        <h2>Sources & Assumptions</h2>
        <ol class="sources-list">
          ${d.sources.map(s => `<li>${esc(s)}</li>`).join('')}
        </ol>
      </section>

      <!-- Related Decisions -->
      ${related.length > 0 ? `<section class="decision-section" aria-label="Related decisions">
        <h2>Related Decisions</h2>
        <div class="related-grid">
          ${related.map(r => `<a href="/${r.slug}/" class="related-card">
            <h4>${esc(r.title)}</h4>
            <span class="related-verdict ${verdictTagClass(r.verdict)}">${r.verdict} · ${r.confidence}%</span>
          </a>`).join('')}
        </div>
      </section>` : ''}

      <section class="decision-section" aria-label="Explore more guides">
        <h2>Explore More Guides</h2>
        <p style="color:var(--text-secondary);">Browse the <a href="/best-of/">Best Of hub</a> or continue in <a href="/${d.category}/">${esc(catMeta.title)}</a>.</p>
      </section>
    </div>`;

  return shell({
    title: d.title,
    description: d.metaDescription,
    canonical: `${SITE_URL}/${d.slug}/`,
    bodyClass: 'page-decision',
    ogType: 'article',
    content,
    noindex: d.noindex,
    jsonLdBlocks
  });
}

// ─── Category Index Page ────────────────────────────────────
function categoryPageHTML(catSlug, decisions, page, totalPages) {
  const cat = CATEGORIES[catSlug];
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL + '/' },
    { name: cat.title, url: `${SITE_URL}/${catSlug}/` }
  ];

  // Count verdict distribution for hero stats
  const yesCount = decisions.filter(d => d.verdict === 'Yes').length;
  const noCount = decisions.filter(d => d.verdict === 'No').length;
  const dependsCount = decisions.filter(d => d.verdict === 'Depends').length;
  const avgConfidence = decisions.length > 0
    ? Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length)
    : 0;

  const paginationHTML = totalPages > 1 ? `<nav class="pagination" aria-label="Category pages">
    ${page > 1 ? `<a href="/${catSlug}/${page === 2 ? '' : 'page/' + (page - 1) + '/'}\" rel="prev">Prev</a>` : ''}
    ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
    const href = p === 1 ? `/${catSlug}/` : `/${catSlug}/page/${p}/`;
    return p === page ? `<span class="current">${p}</span>` : `<a href="${href}">${p}</a>`;
  }).join('')}
    ${page < totalPages ? `<a href="/${catSlug}/page/${page + 1}/" rel="next">Next</a>` : ''}
  </nav>` : '';

  const prevLink = page > 1 ? `<link rel="prev" href="${SITE_URL}/${catSlug}/${page === 2 ? '' : 'page/' + (page - 1) + '/'}">` : '';
  const nextLink = page < totalPages ? `<link rel="next" href="${SITE_URL}/${catSlug}/page/${page + 1}/">` : '';

  const content = `
    <section class="category-hero">
      <div class="category-hero-bg" aria-hidden="true"></div>
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span class="separator">›</span>
          <span aria-current="page">${esc(cat.title)}</span>
        </nav>
        <div class="category-hero-icon">${ICONS[cat.icon]}</div>
        <h1>${esc(cat.title)}</h1>
        <p class="category-hero-desc">${esc(cat.description)}</p>
        <div class="category-stats">
          <div class="category-stat">
            <span class="category-stat-value">${decisions.length}</span>
            <span class="category-stat-label">Decision Guides</span>
          </div>
          <div class="category-stat">
            <span class="category-stat-value" style="color:var(--verdict-yes)">${yesCount}</span>
            <span class="category-stat-label">Verdict: Yes</span>
          </div>
          <div class="category-stat">
            <span class="category-stat-value" style="color:var(--verdict-depends)">${dependsCount}</span>
            <span class="category-stat-label">Verdict: Depends</span>
          </div>
          <div class="category-stat">
            <span class="category-stat-value" style="color:var(--verdict-no)">${noCount}</span>
            <span class="category-stat-label">Verdict: No</span>
          </div>
          <div class="category-stat">
            <span class="category-stat-value">${avgConfidence}%</span>
            <span class="category-stat-label">Avg. Confidence</span>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container container--wide">
        <div class="decision-card-grid">
          ${decisions.map(d => {
    const cat = CATEGORIES[d.category] || { icon: 'fileText' };
    const shortDesc = d.metaDescription ? (d.metaDescription.length > 115 ? d.metaDescription.substring(0, 112) + '…' : d.metaDescription) : '';
    const vTag = verdictTagClass(d.verdict);
    const vColor = d.verdict === 'Yes' ? 'var(--verdict-yes)' : d.verdict === 'No' ? 'var(--verdict-no)' : 'var(--verdict-depends)';
    return `<a href="/${d.slug}/" class="decision-card">
              <div class="decision-card-top">
                <span class="decision-card-verdict ${vTag}">${d.verdict}</span>
                <span class="decision-card-confidence">${d.confidence}% confidence</span>
              </div>
              <h3 class="decision-card-title">${esc(d.title)}</h3>
              <p class="decision-card-desc">${esc(shortDesc)}</p>
              <div class="decision-card-footer">
                <div class="decision-card-meter" role="meter" aria-valuenow="${d.confidence}" aria-valuemin="0" aria-valuemax="100" aria-label="Confidence ${d.confidence}%">
                  <div class="decision-card-meter-fill" style="width:${d.confidence}%; background:${vColor}"></div>
                </div>
                <span class="decision-card-meta">${d.readingTime || 7} min read</span>
              </div>
            </a>`;
  }).join('')}
        </div>
        ${paginationHTML}
      </div>
    </section>`;

  const canonical = page === 1 ? `${SITE_URL}/${catSlug}/` : `${SITE_URL}/${catSlug}/page/${page}/`;

  return shell({
    title: `${cat.title} — Decision Guides`,
    description: cat.description,
    canonical,
    bodyClass: 'page-category',
    content,
    jsonLdBlocks: [jsonLD_Breadcrumb(breadcrumbItems)]
  });
}

// ─── Homepage ───────────────────────────────────────────────
function homepageHTML(allDecisions) {
  const recentDecisions = allDecisions.slice(0, 6);
  const categoryCounts = {};
  for (const d of allDecisions) {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  }

  const content = `
    <section class="hero">
      <div class="hero-content container">
        <span class="hero-badge">${ICONS.brain} AI Decision Intelligence</span>
        <h1>Should I <span class="gradient-text">_____</span> ?<br>Get a real answer.</h1>
        <p class="hero-subtitle">Structured AI analysis for career, learning, and financial decisions. No fluff — just data-driven verdicts, weighted scorecards, and actionable next steps.</p>
        <a href="#categories" class="hero-cta">Explore Decisions ↓</a>
      </div>
    </section>

    <section class="section" id="how-it-works">
      <div class="container container--wide">
        <div class="section-header">
          <h2>How It Works</h2>
          <p>Every decision page follows a rigorous analysis framework.</p>
        </div>
        <div class="steps-grid">
          <div class="step">
            <h3>Ask</h3>
            <p>Find your "Should I ___?" question across career, learning, money, and side hustle categories.</p>
          </div>
          <div class="step">
            <h3>Analyze</h3>
            <p>Get a weighted scorecard, honest pros/cons, risk assessment, and three realistic scenarios.</p>
          </div>
          <div class="step">
            <h3>Act</h3>
            <p>Follow specific next steps with vetted resources. Listen to a 3-minute audio briefing on the go.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="categories">
      <div class="container container--wide">
        <div class="section-header">
          <h2>Decision Categories</h2>
          <p>Choose your area or browse all decisions below.</p>
        </div>
        <div class="card-grid">
          ${Object.entries(CATEGORIES).map(([slug, cat]) => `
            <a href="/${slug}/" class="card">
              <div class="card-icon">${ICONS[cat.icon]}</div>
              <h3>${esc(cat.title)}</h3>
              <p>${esc(cat.description)}</p>
              <span class="card-count">${categoryCounts[slug] || 0} decision guides</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="trust-block">
          <h2>Built on Analysis, Not Opinions</h2>
          <p style="color:var(--text-secondary); max-width:500px; margin:var(--space-4) auto 0;">Every page uses a weighted scoring framework, cites its sources, and clearly states assumptions. <a href="/how-scoring-works.html">See how scoring works</a>.</p>
          <div class="trust-features">
            <div class="trust-feature">
              <span class="trust-feature-icon">${ICONS.trendingUp}</span>
              <span>Weighted Scorecards</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">${ICONS.fileText}</span>
              <span>Cited Sources</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">${ICONS.headphones}</span>
              <span>Audio Briefings</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">${ICONS.thumbsUp}</span>
              <span>Pro/Con Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${recentDecisions.length > 0 ? `<section class="section">
      <div class="container container--wide">
        <div class="section-header">
          <h2>Recent Decision Guides</h2>
          <p>The latest questions analyzed by our AI decision engine.</p>
        </div>
        <div class="card-grid">
          ${recentDecisions.map(d => {
    const cat = CATEGORIES[d.category];
    return `<a href="/${d.slug}/" class="card">
              <div class="card-icon">${cat ? ICONS[cat.icon] : ICONS.fileText}</div>
              <h3>${esc(d.title)}</h3>
              <p style="margin-bottom:var(--space-3);">${esc(d.metaDescription.substring(0, 120))}…</p>
              <span class="verdict-tag ${verdictTagClass(d.verdict)}">${d.verdict} · ${d.confidence}%</span>
            </a>`;
  }).join('')}
        </div>
        <p style="margin-top:var(--space-6); text-align:center;"><a href="/best-of/" class="hero-cta" style="display:inline-flex;">Browse best of guides</a></p>
      </div>
    </section>` : ''}`;

  return shell({
    title: 'AI-Powered Decision Guides for Career, Learning & Money',
    description: 'Should I ___? Get structured AI analysis with weighted scorecards, honest pros & cons, risk assessments, and actionable next steps for career, learning, and financial decisions.',
    canonical: SITE_URL + '/',
    bodyClass: 'page-home',
    content
  });
}

function bestOfPageHTML(allDecisions) {
  const topByConfidence = [...allDecisions]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12);
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL + '/' },
    { name: 'Best Of', url: SITE_URL + '/best-of/' }
  ];

  const content = `<div class="container container--wide">
      <section class="section">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span class="separator">›</span>
          <span aria-current="page">Best Of</span>
        </nav>
        <h1>Best Of Decision Guides</h1>
        <p style="color:var(--text-secondary); max-width:760px; margin-top:var(--space-3);">A curated set of high-confidence decision guides to help you start with the most actionable topics.</p>
      </section>
      <section class="section">
        <div class="decision-card-grid">
          ${topByConfidence.map(d => {
    const vTag = verdictTagClass(d.verdict);
    return `<a href="/${d.slug}/" class="decision-card">
              <div class="decision-card-top">
                <span class="decision-card-verdict ${vTag}">${d.verdict}</span>
                <span class="decision-card-confidence">${d.confidence}% confidence</span>
              </div>
              <h2 class="decision-card-title">${esc(d.title)}</h2>
              <p class="decision-card-desc">${esc((d.metaDescription || '').slice(0, 130))}...</p>
            </a>`;
  }).join('')}
        </div>
      </section>
    </div>`;

  return shell({
    title: 'Best Of Decision Guides',
    description: 'Start with the highest-confidence decision guides across career, AI, learning, and money topics.',
    canonical: SITE_URL + '/best-of/',
    bodyClass: 'page-best-of',
    content,
    jsonLdBlocks: [jsonLD_Breadcrumb(breadcrumbItems)]
  });
}

// ─── Trust Pages ────────────────────────────────────────────
function aboutPageHTML() {
  return shell({
    title: 'About',
    description: 'Learn about YourNextStep.ai — our mission, methodology, and editorial standards.',
    canonical: SITE_URL + '/about.html',
    bodyClass: 'page-about',
    content: `<div class="container"><section class="section">
      <h1>About YourNextStep.ai</h1>
      <p style="color:var(--text-secondary); font-size:var(--fs-lg); max-width:640px; margin-bottom:var(--space-8);">We build AI-powered decision guides for professionals navigating career, learning, and financial choices.</p>
      <h2>Our Mission</h2>
      <p>Every day, millions of professionals face high-stakes decisions: Should I switch careers? Learn AI? Start a side hustle? Most content online offers vague motivation or clickbait listicles. We believe you deserve structured, data-informed analysis.</p>
      <h2 style="margin-top:var(--space-8);">How We're Different</h2>
      <ul style="color:var(--text-secondary); display:flex; flex-direction:column; gap:var(--space-3); margin-top:var(--space-4);">
        <li><strong>Verdict-first:</strong> Every page leads with a clear Yes / No / Depends answer and a confidence percentage.</li>
        <li><strong>Weighted scorecards:</strong> We don't just list pros and cons. We weigh decision factors and score them transparently.</li>
        <li><strong>Scenario modeling:</strong> Best case, realistic case, worst case — so you can calibrate expectations.</li>
        <li><strong>Sources cited:</strong> We cite the data behind every claim. <a href="/sources-update-policy.html">See our source policy</a>.</li>
        <li><strong>Audio briefings:</strong> Every guide comes with a 3-minute audio summary you can listen to on the go.</li>
      </ul>
      <h2 style="margin-top:var(--space-8);">Editorial Independence</h2>
      <p>Some pages contain affiliate links to courses, tools, or services. These links are always clearly disclosed and placed after the analysis — never before. Our verdicts and scores are never influenced by affiliate partnerships. <a href="/disclaimer.html">Full disclosure</a>.</p>
    </section></div>`
  });
}

function scoringPageHTML() {
  return shell({
    title: 'How Scoring Works',
    description: 'Understand how YourNextStep.ai scores decisions — our weighted scorecard methodology, factor selection, and confidence ratings explained.',
    canonical: SITE_URL + '/how-scoring-works.html',
    bodyClass: 'page-scoring',
    content: `<div class="container"><section class="section">
      <h1>How Scoring Works</h1>
      <p style="color:var(--text-secondary); font-size:var(--fs-lg); max-width:640px; margin-bottom:var(--space-8);">Transparency is core to our process. Here's exactly how we arrive at verdicts and scores.</p>
      <h2>The Decision Scorecard</h2>
      <p>Every decision page features a weighted scorecard with 6–10 factors. Each factor receives:</p>
      <ul style="color:var(--text-secondary); margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2);">
        <li><strong>Weight (1–10):</strong> How important this factor is for this specific decision. A weight of 10 means "critical."</li>
        <li><strong>Score (1–10):</strong> How favorable the evidence is. A score of 10 means "strongly positive."</li>
        <li><strong>Weighted Score:</strong> Weight × Score. Summed and compared to the maximum possible to produce an overall percentage.</li>
      </ul>
      <h2 style="margin-top:var(--space-8);">Verdict Logic</h2>
      <p>Verdicts are assigned based on the overall score and qualitative judgment:</p>
      <ul style="color:var(--text-secondary); margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2);">
        <li><strong>Yes:</strong> The analysis strongly favors action for the target audience.</li>
        <li><strong>No:</strong> The analysis finds risks or downsides that outweigh benefits for most people.</li>
        <li><strong>Depends:</strong> The answer varies significantly based on individual circumstances.</li>
      </ul>
      <h2 style="margin-top:var(--space-8);">Confidence Rating</h2>
      <p>The confidence percentage (0–100%) reflects how strongly we can defend the verdict — not how correct it is. High confidence means strong, convergent evidence. Lower confidence means the evidence is mixed or the decision is highly personal.</p>
      <h2 style="margin-top:var(--space-8);">What This Is NOT</h2>
      <p>Our scoring is heuristic, not predictive. We are not modeling your specific outcome. We're providing a structured framework to help you think through the decision. Your circumstances, risk tolerance, and goals should always override any generic analysis.</p>
    </section></div>`
  });
}

function sourcesPageHTML() {
  return shell({
    title: 'Sources & Update Policy',
    description: 'How YourNextStep.ai sources data, updates content, and maintains accuracy across all decision guides.',
    canonical: SITE_URL + '/sources-update-policy.html',
    bodyClass: 'page-sources',
    content: `<div class="container"><section class="section">
      <h1>Sources & Update Policy</h1>
      <p style="color:var(--text-secondary); font-size:var(--fs-lg); max-width:640px; margin-bottom:var(--space-8);">How we source data, verify claims, and keep content current.</p>
      <h2>Source Standards</h2>
      <p>We prioritize primary and reputable secondary sources:</p>
      <ul style="color:var(--text-secondary); margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2);">
        <li>Government labor statistics (BLS, EU agencies)</li>
        <li>Peer-reviewed research and academic publications</li>
        <li>Industry surveys from established organizations (McKinsey, Gallup, LinkedIn, Stack Overflow)</li>
        <li>Official regulatory texts (EU AI Act, IRS guidelines)</li>
      </ul>
      <p style="margin-top:var(--space-4);">We avoid blog posts, opinion pieces, and marketing materials as primary sources.</p>
      <h2 style="margin-top:var(--space-8);">Update Cadence</h2>
      <ul style="color:var(--text-secondary); margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2);">
        <li><strong>Quarterly review:</strong> All published pages are reviewed for accuracy every 90 days.</li>
        <li><strong>Event-driven updates:</strong> Major industry changes (new regulations, market shifts) trigger immediate review of affected pages.</li>
        <li><strong>Date stamping:</strong> Every page shows its last updated date. We never hide staleness.</li>
      </ul>
      <h2 style="margin-top:var(--space-8);">What We Don't Claim</h2>
      <ul style="color:var(--text-secondary); margin-top:var(--space-4); display:flex; flex-direction:column; gap:var(--space-2);">
        <li>We don't claim our verdicts are objectively correct — they are structured opinions.</li>
        <li>We don't claim our data is exhaustive — it's representative.</li>
        <li>We don't provide professional advice (financial, legal, medical). <a href="/disclaimer.html">Full disclaimer</a>.</li>
      </ul>
    </section></div>`
  });
}

function disclaimerPageHTML() {
  return shell({
    title: 'Disclaimer',
    description: 'YourNextStep.ai disclaimer: this is an AI-powered educational resource, not professional advice.',
    canonical: SITE_URL + '/disclaimer.html',
    bodyClass: 'page-disclaimer',
    content: `<div class="container"><section class="section">
      <h1>Disclaimer</h1>
      <h2>Not Professional Advice</h2>
      <p>YourNextStep.ai provides AI-generated analysis for educational purposes. Nothing on this site constitutes professional financial, legal, career, or medical advice. Always consult qualified professionals for decisions involving significant risk or legal implications.</p>
      <h2 style="margin-top:var(--space-8);">AI-Generated Content</h2>
      <p>Content on this site is generated and curated with the assistance of AI tools. While we apply quality assurance checks and cite sources, AI-generated content may contain errors, outdated information, or biases from training data. We strive for accuracy but cannot guarantee it.</p>
      <h2 style="margin-top:var(--space-8);">Affiliate Disclosure</h2>
      <p>Some pages contain affiliate links. When you use these links to purchase products or services, we may earn a commission at no additional cost to you. Affiliate relationships are always disclosed on the relevant pages. Our editorial verdicts and scores are never influenced by affiliate partnerships.</p>
      <h2 style="margin-top:var(--space-8);">No Guarantees</h2>
      <p>Past performance, statistics, and trends cited on this site do not guarantee future outcomes. Decision scorecards and confidence ratings are heuristic frameworks — not predictions. Your results depend on your individual circumstances, effort, and external factors beyond our analysis.</p>
      <h2 style="margin-top:var(--space-8);">Contact</h2>
      <p>For questions about our content, methodology, or this disclaimer, contact us at <a href="mailto:hello@yournextstep.ai">hello@yournextstep.ai</a>.</p>
    </section></div>`
  });
}


function affiliateDisclosurePageHTML() {
  return shell({
    title: 'Affiliate Disclosure',
    description: 'How affiliate links work on YourNextStep.ai, our independence policy, and transparency commitment.',
    canonical: SITE_URL + '/affiliate-disclosure/',
    bodyClass: 'page-affiliate-disclosure',
    content: `<div class="container"><section class="section">
      <h1>Affiliate Disclosure</h1>

      <h2>How Affiliate Links Work</h2>
      <p>Some pages on YourNextStep.ai contain advertising (affiliate) links to courses, tools, and services. If you click one of these links and make a purchase, we may receive a commission from the provider at no additional cost to you.</p>
      <p>Affiliate links are always clearly labeled with an <strong>"Ad"</strong> tag and only appear in the "Recommended Next Steps" section &mdash; never inside our analysis, verdict, or FAQ sections.</p>

      <h2 style="margin-top:var(--space-8);">Our Independence</h2>
      <p>Affiliate partnerships do not influence our editorial content in any way. Our verdicts, confidence scores, and decision scorecards are generated using the YNS Decision Framework &mdash; an objective, weighted analysis of multiple factors. We do not adjust scores to favor products or services that pay us commissions.</p>
      <p>Pages with and without affiliate links use exactly the same analysis methodology and quality standards.</p>

      <h2 style="margin-top:var(--space-8);">How We Select Recommendations</h2>
      <p>Recommended tools and services are selected based on relevance to the decision topic, user reviews, market reputation, and editorial judgement. We only recommend services we believe provide genuine value. Having an affiliate program is not a requirement for recommendation &mdash; many of our "next steps" do not include affiliate links.</p>

      <h2 style="margin-top:var(--space-8);">No Guarantees</h2>
      <p>We make no guarantees about any recommended product or service. Results depend on your individual circumstances. Always do your own research before making purchasing decisions.</p>

      <h2 style="margin-top:var(--space-8);">Transparency</h2>
      <p>We are committed to full transparency about our commercial relationships. If you have questions about our affiliate practices, contact us at <a href="mailto:hello@yournextstep.ai">hello@yournextstep.ai</a>.</p>

      <p style="margin-top:var(--space-8); color:var(--text-muted); font-size:var(--fs-sm);">This disclosure complies with applicable Norwegian marketing law (markedsf&oslash;ringsloven) and EU consumer protection directives. Last updated: ${new Date().toISOString().slice(0, 10)}.</p>
    </section></div>`
  });
}

function page404HTML() {
  return shell({
    title: '404 — Page Not Found',
    description: 'The page you are looking for does not exist.',
    canonical: SITE_URL + '/404.html',
    bodyClass: 'page-404',
    noindex: true,
    content: `<div class="container" style="text-align:center; padding:var(--space-24) 0;">
      <h1 style="font-size:var(--fs-6xl); margin-bottom:var(--space-4);">404</h1>
      <p style="font-size:var(--fs-xl); color:var(--text-secondary); margin-bottom:var(--space-8);">This page doesn't exist — but your next decision does.</p>
      <a href="/" class="hero-cta">Go to Homepage →</a>
    </div>`
  });
}

// ─── Build ──────────────────────────────────────────────────
async function build() {
  console.log('🔨 YourNextStep.ai — Building...\n');

  // Clean
  await fs.remove(DIST);
  await fs.ensureDir(DIST);

  // Read data
  const allDecisions = JSON.parse(await fs.readFile(DATA, 'utf8'));
  const includeDrafts = process.argv.includes('--include-drafts');

  // Normalize all entries (safe defaults)
  for (let i = 0; i < allDecisions.length; i++) {
    allDecisions[i] = normalizeEntry(allDecisions[i]);
  }

  // QA Gate
  const report = { published: [], rejected: [], skipped: [], warnings: [] };
  const publishable = [];

  for (const d of allDecisions) {
    if (d.status !== 'published' && !includeDrafts) {
      report.skipped.push({ slug: d.slug, reason: `status: ${d.status}` });
      continue;
    }
    const { errors, warnings } = qaCheck(d);
    if (warnings.length > 0) {
      report.warnings.push({ slug: d.slug, warnings });
      warnings.forEach(w => console.log(`  ⚠️  WARNING: ${d.slug} → ${w}`));
    }
    if (errors.length > 0) {
      report.rejected.push({ slug: d.slug, errors });
      console.log(`  ❌ REJECTED: ${d.slug}`);
      errors.forEach(e => console.log(`     → ${e}`));
    } else {
      report.published.push(d.slug);
      publishable.push(d);
    }
  }

  // Resolve related links deterministically (filter dead, backfill from category)
  for (const d of publishable) {
    d.relatedSlugs = resolveRelatedSlugs(d, publishable);
  }

  console.log(`\n  ✅ Published: ${report.published.length}`);
  console.log(`  ❌ Rejected: ${report.rejected.length}`);
  console.log(`  ⚠️  Warnings: ${report.warnings.length}`);
  console.log(`  ⏩ Skipped: ${report.skipped.length}\n`);

  // Write build report
  await fs.writeFile(path.join(DIST, 'build-report.json'), JSON.stringify(report, null, 2));

  // Copy static assets
  for (const f of ['style.css', 'script.js', 'favicon.svg', 'logo.png', 'logo-header.png', 'logo-header-noai.png', 'og-default.svg', 'og-default.png', 'google1a314224e4d44867.html']) {
    await fs.copy(path.join(SRC, f), path.join(DIST, f));
  }

  // Copy audio assets
  const audioSrc = path.join(SRC, 'audio');
  if (await fs.pathExists(audioSrc)) {
    await fs.copy(audioSrc, path.join(DIST, 'audio'));
  }

  // Generate homepage
  await fs.writeFile(path.join(DIST, 'index.html'), homepageHTML(publishable));
  console.log('  📄 index.html');

  // Generate decision pages
  for (const d of publishable) {
    const dir = path.join(DIST, d.slug);
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'index.html'), decisionPageHTML(d, publishable));
    console.log(`  📄 ${d.slug}/index.html`);
  }

  // Generate category pages with pagination
  const sitemapUrls = [
    { url: SITE_URL + '/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/best-of/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/about.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/how-scoring-works.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/sources-update-policy.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/disclaimer.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/affiliate-disclosure/', lastmod: new Date().toISOString().slice(0, 10) }
  ];

  for (const [catSlug, catMeta] of Object.entries(CATEGORIES)) {
    const catDecisions = publishable.filter(d => d.category === catSlug);
    const totalPages = Math.max(1, Math.ceil(catDecisions.length / ITEMS_PER_PAGE));

    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const pageDecisions = catDecisions.slice(start, start + ITEMS_PER_PAGE);
      const dirParts = page === 1 ? [DIST, catSlug] : [DIST, catSlug, 'page', String(page)];
      const dir = path.join(...dirParts);
      await fs.ensureDir(dir);
      await fs.writeFile(path.join(dir, 'index.html'), categoryPageHTML(catSlug, pageDecisions, page, totalPages));
      console.log(`  📄 ${catSlug}/${page === 1 ? '' : 'page/' + page + '/'}index.html`);

      const catUrl = page === 1 ? `${SITE_URL}/${catSlug}/` : `${SITE_URL}/${catSlug}/page/${page}/`;
      sitemapUrls.push({ url: catUrl, lastmod: new Date().toISOString().slice(0, 10) });
    }
  }

  // Decision page URLs to sitemap
  for (const d of publishable) {
    sitemapUrls.push({ url: `${SITE_URL}/${d.slug}/`, lastmod: d.updatedDate });
  }

  // Trust pages
  const bestOfDir = path.join(DIST, 'best-of');
  await fs.ensureDir(bestOfDir);
  await fs.writeFile(path.join(bestOfDir, 'index.html'), bestOfPageHTML(publishable));
  await fs.writeFile(path.join(DIST, 'about.html'), aboutPageHTML());
  await fs.writeFile(path.join(DIST, 'how-scoring-works.html'), scoringPageHTML());
  await fs.writeFile(path.join(DIST, 'sources-update-policy.html'), sourcesPageHTML());
  await fs.writeFile(path.join(DIST, 'disclaimer.html'), disclaimerPageHTML());
  await fs.writeFile(path.join(DIST, '404.html'), page404HTML());

  // Affiliate disclosure page
  const affDir = path.join(DIST, 'affiliate-disclosure');
  await fs.ensureDir(affDir);
  await fs.writeFile(path.join(affDir, 'index.html'), affiliateDisclosurePageHTML());
  console.log('  📄 affiliate-disclosure/index.html');
  console.log('  📄 best-of/index.html');
  console.log('  📄 about.html, how-scoring-works.html, sources-update-policy.html, disclaimer.html, 404.html');

  // Sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url><loc>${u.url}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemapXml);
  console.log('  🗺️  sitemap.xml');

  // Robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await fs.writeFile(path.join(DIST, 'robots.txt'), robotsTxt);
  console.log('  🤖 robots.txt');

  // Search index (for future client-side search)
  const searchIndex = publishable.map(d => ({
    slug: d.slug,
    title: d.title,
    category: d.category,
    verdict: d.verdict,
    confidence: d.confidence,
    description: d.metaDescription
  }));
  await fs.writeFile(path.join(DIST, 'search-index.json'), JSON.stringify(searchIndex));
  console.log('  🔍 search-index.json');

  // Netlify _redirects
  const redirects = `# Netlify redirects\n/sitemap /sitemap.xml 301\n`;
  await fs.writeFile(path.join(DIST, '_redirects'), redirects);

  console.log('\n✅ Build complete! Output in dist/');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
