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
const ITEMS_PER_PAGE = 30;

const CATEGORIES = {
  'career-decisions': { title: 'Career Decisions', icon: '🧭', description: 'Navigate job changes, promotions, and career pivots with structured analysis.' },
  'ai-and-jobs': { title: 'AI & Jobs', icon: '🤖', description: 'Understand how AI is reshaping your industry and what moves to make.' },
  'learning': { title: 'Learning', icon: '📚', description: 'Decide which skills, courses, and credentials are actually worth your time.' },
  'money-decisions': { title: 'Money Decisions', icon: '💰', description: 'Evaluate financial choices with frameworks, not feelings.' },
  'side-hustles': { title: 'Side Hustles', icon: '🚀', description: 'Assess side income opportunities with realistic timelines and tradeoffs.' }
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
  // Affiliate count guard
  const affiliateCount = (d.nextSteps || []).filter(ns => ns.affiliateUrl).length;
  if (affiliateCount > 3) warnings.push(`${affiliateCount} affiliate links (max 3 recommended)`);
  if (affiliateCount === 0) warnings.push('no affiliate links — check monetization');
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
    'headline': d.title,
    'description': d.metaDescription,
    'datePublished': d.publishedDate,
    'dateModified': d.updatedDate,
    'author': { '@type': 'Organization', 'name': 'YourNextStep.ai' },
    'publisher': { '@type': 'Organization', 'name': 'YourNextStep.ai' }
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

// ─── Shell: wraps every page ────────────────────────────────
function shell({ title, description, canonical, bodyClass, content, noindex, jsonLdBlocks }) {
  const robotsMeta = noindex ? '<meta name="robots" content="noindex, nofollow">' : '';
  const jsonLd = (jsonLdBlocks || []).map(j => `<script type="application/ld+json">${j}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(title)} — YourNextStep.ai</title>
  <meta name="description" content="${esc(description)}">
  ${robotsMeta}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/og-default.png">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="/style.css">
  ${jsonLd}
</head>
<body class="${bodyClass || ''}">
  <a href="#main" class="skip-link">Skip to main content</a>
  ${navHTML()}
  <main id="main">
    ${content}
  </main>
  ${footerHTML()}
  <script src="/script.js"></script>
</body>
</html>`;
}

function navHTML() {
  return `<header class="site-header">
    <div class="container">
      <a href="/" class="logo" aria-label="YourNextStep.ai home">YourNextStep<span>.ai</span></a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">☰</button>
      <nav id="main-nav">
        <ul class="nav-links" role="list">
          <li><a href="/career-decisions/">Career</a></li>
          <li><a href="/ai-and-jobs/">AI & Jobs</a></li>
          <li><a href="/learning/">Learning</a></li>
          <li><a href="/money-decisions/">Money</a></li>
          <li><a href="/side-hustles/">Side Hustles</a></li>
          <li><a href="/about.html">About</a></li>
        </ul>
      </nav>
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
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul role="list">
          <li><a href="/disclaimer.html">Terms & Disclaimer</a></li>
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
  const catMeta = CATEGORIES[d.category] || { title: d.category, icon: '📄' };
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

      <!-- Who Should / Shouldn't -->
      <section class="decision-section" aria-label="Who this is for">
        <h2>Who Is This For?</h2>
        <div class="who-grid">
          <div class="who-card who-should">
            <h3>✅ You should if…</h3>
            <ul role="list">${d.whoShould.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
          </div>
          <div class="who-card who-shouldnt">
            <h3>🚫 You should NOT if…</h3>
            <ul role="list">${d.whoShouldNot.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>

      <!-- Decision Scorecard -->
      <section class="decision-section" aria-label="Decision scorecard">
        <h2>Decision Scorecard</h2>
        <div class="scorecard">
          <div class="scorecard-header">
            <span>Factor</span><span>Weight</span><span>Score</span><span>Weighted</span>
          </div>
          ${d.scorecard.map(row => {
    const weighted = row.weight * row.score;
    const maxW = row.weight * 10;
    const pct = Math.round((weighted / maxW) * 100);
    return `<div class="scorecard-row">
              <span>${esc(row.factor)}</span>
              <span>${row.weight}/10</span>
              <span>${row.score}/10</span>
              <span><div class="scorecard-bar"><div class="scorecard-bar-fill" style="width:${pct}%"></div></div></span>
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
            <h3>👍 Pros</h3>
            ${d.pros.map(p => `<div class="proscons-item"><h4>${esc(p.title)}</h4><p>${esc(p.detail)}</p></div>`).join('')}
          </div>
          <div class="proscons-column">
            <h3>👎 Cons</h3>
            ${d.cons.map(c => `<div class="proscons-item"><h4>${esc(c.title)}</h4><p>${esc(c.detail)}</p></div>`).join('')}
          </div>
        </div>
      </section>

      <!-- Risks -->
      <section class="decision-section" aria-label="Risks people underestimate">
        <h2>Risks People Underestimate</h2>
        <div class="risk-list">
          ${d.risksUnderestimated.map(r => `<div class="risk-card"><span class="risk-icon" aria-hidden="true">⚠</span><p>${esc(r)}</p></div>`).join('')}
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
        <div class="next-steps-list">
          ${d.nextSteps.slice(0, 3).map(ns => {
    const isPrimary = ns.isPrimary ? ' primary' : '';
    const ctaHTML = ns.affiliateUrl
      ? `<a href="${esc(ns.affiliateUrl)}" class="next-step-cta" rel="sponsored nofollow" target="_blank">${esc(ns.affiliateLabel)} →</a>`
      : '';
    return `<div class="next-step-card${isPrimary}">
              <div class="next-step-info"><h4>${ns.isPrimary ? '⭐ ' : ''}${esc(ns.action)}</h4></div>
              ${ctaHTML}
            </div>`;
  }).join('')}
        </div>
        <p class="affiliate-disclosure">Some links are affiliate links. We may earn a commission at no extra cost to you. We only recommend resources we'd use ourselves. <a href="/disclaimer.html">Full disclosure</a>.</p>
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

      <!-- Audio Briefing -->
      <section class="decision-section" aria-label="Audio briefing">
        <div class="audio-player">
          <h3>🎧 3-Minute Audio Briefing</h3>
          <p class="audio-player-subtitle">${d.audio.audioUrl ? 'Listen to the summary' : 'Audio coming soon — read the transcript below'}</p>
          ${d.audio.audioUrl ? `<audio preload="metadata" src="${esc(d.audio.audioUrl)}"></audio>
          <div class="audio-controls">
            <button class="btn-play" aria-label="Play audio briefing">▶</button>
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
    </div>`;

  return shell({
    title: d.title,
    description: d.metaDescription,
    canonical: `${SITE_URL}/${d.slug}/`,
    bodyClass: 'page-decision',
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

  const paginationHTML = totalPages > 1 ? `<nav class="pagination" aria-label="Category pages">
    ${page > 1 ? `<a href="/${catSlug}/${page === 2 ? '' : 'page/' + (page - 1) + '/'}" rel="prev">← Prev</a>` : ''}
    ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
    const href = p === 1 ? `/${catSlug}/` : `/${catSlug}/page/${p}/`;
    return p === page ? `<span class="current">${p}</span>` : `<a href="${href}">${p}</a>`;
  }).join('')}
    ${page < totalPages ? `<a href="/${catSlug}/page/${page + 1}/" rel="next">Next →</a>` : ''}
  </nav>` : '';

  const prevLink = page > 1 ? `<link rel="prev" href="${SITE_URL}/${catSlug}/${page === 2 ? '' : 'page/' + (page - 1) + '/'}">` : '';
  const nextLink = page < totalPages ? `<link rel="next" href="${SITE_URL}/${catSlug}/page/${page + 1}/">` : '';

  const content = `
    <section class="category-hero">
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span class="separator">›</span>
          <span aria-current="page">${esc(cat.title)}</span>
        </nav>
        <div style="font-size:3rem; margin-bottom:var(--space-4);">${cat.icon}</div>
        <h1>${esc(cat.title)}</h1>
        <p>${esc(cat.description)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="decision-list">
          ${decisions.map(d => `<a href="/${d.slug}/" class="decision-link">
            <h3>${esc(d.title)}</h3>
            <span class="verdict-tag ${verdictTagClass(d.verdict)}">${d.verdict} · ${d.confidence}%</span>
          </a>`).join('')}
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
        <span class="hero-badge">🧠 AI Decision Intelligence</span>
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
              <div class="card-icon">${cat.icon}</div>
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
              <span class="trust-feature-icon">📊</span>
              <span>Weighted Scorecards</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">📖</span>
              <span>Cited Sources</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">🎧</span>
              <span>Audio Briefings</span>
            </div>
            <div class="trust-feature">
              <span class="trust-feature-icon">⚖️</span>
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
              <div class="card-icon">${cat ? cat.icon : '📄'}</div>
              <h3>${esc(d.title)}</h3>
              <p style="margin-bottom:var(--space-3);">${esc(d.metaDescription.substring(0, 120))}…</p>
              <span class="verdict-tag ${verdictTagClass(d.verdict)}">${d.verdict} · ${d.confidence}%</span>
            </a>`;
  }).join('')}
        </div>
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
  for (const f of ['style.css', 'script.js', 'favicon.svg']) {
    await fs.copy(path.join(SRC, f), path.join(DIST, f));
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
    { url: SITE_URL + '/about.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/how-scoring-works.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/sources-update-policy.html', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/disclaimer.html', lastmod: new Date().toISOString().slice(0, 10) }
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
  await fs.writeFile(path.join(DIST, 'about.html'), aboutPageHTML());
  await fs.writeFile(path.join(DIST, 'how-scoring-works.html'), scoringPageHTML());
  await fs.writeFile(path.join(DIST, 'sources-update-policy.html'), sourcesPageHTML());
  await fs.writeFile(path.join(DIST, 'disclaimer.html'), disclaimerPageHTML());
  await fs.writeFile(path.join(DIST, '404.html'), page404HTML());
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
