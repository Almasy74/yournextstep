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
const STRICT_SOURCE_URLS = process.env.STRICT_SOURCE_URLS === '1';

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

const HOME_FEATURED_SLUGS = [
  'should-i-use-ai-to-write-work-reports',
  'should-i-learn-ai-in-2026',
  'should-i-learn-coding-in-the-ai-era',
  'should-i-invest-in-index-funds',
  'should-i-build-an-emergency-fund-before-investing',
  'should-i-start-an-online-business'
];

const HOME_SECONDARY_SLUGS = [
  'should-i-pay-off-debt-or-invest',
  'should-i-learn-python-in-2026',
  'should-i-start-a-side-hustle-while-employed',
  'should-i-switch-careers-at-40'
];

const CATEGORY_HUBS = {
  'career-decisions': {
    summary: 'This cluster focuses on higher-stakes job choices: whether to change roles, leave, level up, or reposition your career without making an emotional decision in a stressful moment.',
    audience: 'Best for professionals weighing career moves with real tradeoffs around income, timing, health, and long-term upside.',
    startHere: [
      'should-i-switch-careers-at-40',
      'should-i-quit-my-job-without-another-lined-up',
      'should-i-become-a-manager'
    ],
    questions: [
      'Should you leave because the role is wrong, or because the current environment is bad?',
      'How much savings runway do you need before making a career move?',
      'Which option gives you stronger future leverage: title, skills, or stability?'
    ],
    framework: [
      'Separate temporary frustration from structural career mismatch.',
      'Model downside first: income gap, search time, and health impact.',
      'Prefer reversible tests before irreversible moves whenever possible.'
    ]
  },
  'ai-and-jobs': {
    summary: 'This is the site\'s primary authority cluster: practical guidance on how AI changes knowledge work, reporting, employability, and job risk.',
    audience: 'Best for professionals deciding how to use AI at work, how much to worry, and which adjustments actually improve career resilience.',
    startHere: [
      'should-i-use-ai-to-write-work-reports',
      'should-i-worry-my-job-will-be-automated',
      'which-jobs-are-safest-from-ai'
    ],
    questions: [
      'Which parts of your job are safe to automate, and which are reputation-sensitive?',
      'What AI usage creates leverage versus visible career risk?',
      'How should you adapt when your role changes faster than your company policy?'
    ],
    framework: [
      'Optimize for trust, policy compliance, and retained human judgment.',
      'Use AI first where work is structured, repetitive, and easily checked.',
      'Keep building non-commodity skills: judgment, communication, and domain context.'
    ]
  },
  'learning': {
    summary: 'These guides help you choose what to learn next without getting trapped by hype, credential inflation, or expensive but low-signal courses.',
    audience: 'Best for professionals choosing skills, courses, certifications, and technical paths in the AI era.',
    startHere: [
      'should-i-learn-ai-in-2026',
      'should-i-learn-python-in-2026',
      'should-i-learn-coding-in-the-ai-era'
    ],
    questions: [
      'Which skill has real market demand versus attention-driven hype?',
      'Should you buy structure with a course, or learn by projects and practice?',
      'How do you sequence foundational skills before advanced ones?'
    ],
    framework: [
      'Choose for market utility, not prestige alone.',
      'Prefer skills that compound into adjacent opportunities.',
      'Measure learning plans by output: projects, portfolio, and better decisions.'
    ]
  },
  'money-decisions': {
    summary: 'Money guides are framed as educational decision support, not personal financial advice. The focus is sequencing, risk management, and behavioral durability.',
    audience: 'Best for readers deciding what to do first with limited capital: build reserves, invest, pay down debt, or choose between competing paths.',
    startHere: [
      'should-i-build-an-emergency-fund-before-investing',
      'should-i-invest-in-index-funds',
      'should-i-pay-off-debt-or-invest'
    ],
    questions: [
      'What should come first when you cannot optimize every financial goal at once?',
      'Which decision lowers the chance of forced mistakes later?',
      'How does your time horizon change whether cash, debt payoff, or investing wins?'
    ],
    framework: [
      'Protect liquidity before chasing return where shocks can force bad behavior.',
      'Use sequencing rules, not one-size-fits-all absolutes.',
      'Treat every money guide here as educational framing, not personal advice.'
    ]
  },
  'side-hustles': {
    summary: 'This cluster is intentionally secondary. We cover side hustles where decision quality matters more than internet hype, especially around time-to-income and execution risk.',
    audience: 'Best for readers comparing realistic side-income options and filtering out low-quality business models.',
    startHere: [
      'best-side-hustles-for-2026-ranked-by-time-money-and-skill',
      'how-to-start-a-side-hustle-with-no-money',
      'side-hustle-ideas-for-introverts-that-actually-pay'
    ],
    questions: [
      'How long until a side hustle becomes meaningful income?',
      'Which model fits your constraints: time, skill, capital, or personality?',
      'What do most side-hustle articles ignore about failure rate and friction?'
    ],
    framework: [
      'Bias toward models with clear demand and low cash burn.',
      'Start with validation before tools, branding, or complexity.',
      'Use side hustles to test fit, not to assume passive income.'
    ]
  }
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

function formatDateHuman(value) {
  const date = parseISODate(value);
  if (!date) return String(value || '');
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function humanIntentLabel(intent) {
  const labels = {
    'career-service': 'Career decision support',
    'course-affiliate': 'Learning and skills decision support',
    'tool-affiliate': 'Tool and money decision support',
    'general': 'Decision support'
  };
  return labels[intent] || 'Decision support';
}

function pickDecisionsBySlug(allDecisions, slugs) {
  return (slugs || [])
    .map((slug) => allDecisions.find((entry) => entry.slug === slug))
    .filter(Boolean);
}

function rankedScoreFactors(d) {
  return [...(d.scorecard || [])]
    .map((row) => ({ ...row, weighted: row.weight * row.score }))
    .sort((a, b) => b.weighted - a.weighted);
}

function strongestFactors(d, count = 3) {
  return rankedScoreFactors(d).slice(0, count);
}

function weakestFactors(d, count = 3) {
  return rankedScoreFactors(d).slice(-count).reverse();
}

function decisionMeta(d) {
  return {
    title: d.seoTitle || d.title,
    description: d.seoDescription || d.metaDescription,
    h1: d.h1 || d.title,
    standfirst: d.standfirst || d.metaDescription
  };
}

function decisionQuickAnswer(d) {
  if (d.quickAnswer) return d.quickAnswer;
  const strongest = strongestFactors(d, 1)[0];
  const weakest = weakestFactors(d, 1)[0];
  if (d.verdict === 'Yes') {
    return `Usually yes. The strongest reason is ${strongest ? strongest.factor.toLowerCase() : 'the overall upside'}, but the decision gets weaker when ${weakest ? weakest.factor.toLowerCase() : 'your constraints'} becomes the limiting factor.`;
  }
  if (d.verdict === 'No') {
    return `Usually no. The upside is not strong enough to offset the downside, especially around ${weakest ? weakest.factor.toLowerCase() : 'execution risk'} and fit.`;
  }
  return `It depends. ${strongest ? strongest.factor : 'The biggest upside'} drives the case for action, but ${weakest ? weakest.factor.toLowerCase() : 'your personal constraints'} is what usually changes the answer.`;
}

function decisionBottomLine(d) {
  if (d.bottomLine) return d.bottomLine;
  if (d.verdict === 'Yes') {
    return 'Take the next step only if you can execute it consistently and the downside does not force bad behavior later.';
  }
  if (d.verdict === 'No') {
    return 'Protect downside first, then revisit the decision when the main blockers have changed.';
  }
  return 'Treat this as a sequencing decision, not a binary identity decision. The right answer depends on timing, constraints, and what you can sustain.';
}

function decisionChangesIf(d) {
  if (Array.isArray(d.answerChangesIf) && d.answerChangesIf.length > 0) return d.answerChangesIf;
  return weakestFactors(d, 3).map((row) => `${row.factor} becomes the deciding constraint.`);
}

function decisionEvidence(d) {
  if (Array.isArray(d.keyEvidence) && d.keyEvidence.length > 0) return d.keyEvidence;
  const strongest = strongestFactors(d, 3);
  if (strongest.length > 0) {
    return strongest.map((row) => `${row.factor} is one of the strongest drivers in this guide, scoring ${row.score}/10 with a weight of ${row.weight}/10.`);
  }
  return ['This guide is based on the weighted scorecard, cited sources, and explicit downside scenarios shown below.'];
}

function decisionMistakes(d) {
  if (Array.isArray(d.commonMistakes) && d.commonMistakes.length > 0) return d.commonMistakes;
  const mistakes = [];
  if (d.whoShouldNot && d.whoShouldNot[0]) mistakes.push(`Ignoring obvious bad-fit conditions such as: ${d.whoShouldNot[0]}`);
  mistakes.push('Treating the best-case scenario as the base case instead of planning around the realistic case.');
  if (d.risksUnderestimated && d.risksUnderestimated[0]) mistakes.push(`Underestimating the main hidden risk: ${d.risksUnderestimated[0]}`);
  return mistakes.slice(0, 3);
}

const SOURCE_REFERENCE_URLS = [
  [/LinkedIn Workforce Report|LinkedIn Workforce|LinkedIn Economic Graph|AI Skills Demand/i, 'https://economicgraph.linkedin.com/'],
  [/Stack Overflow Developer Survey/i, 'https://survey.stackoverflow.co/2025/'],
  [/Computer and Information Research Scientists|Occupational Outlook for Computer and Information Research Scientists/i, 'https://www.bls.gov/ooh/computer-and-information-technology/computer-and-information-research-scientists.htm'],
  [/Software Developer Outlook|Software Developer Employment Projections/i, 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm'],
  [/Bureau of Labor Statistics: Occupational Outlook Handbook|Occupational Outlook Handbook/i, 'https://www.bls.gov/ooh/'],
  [/Bureau of Labor Statistics: Worker Tenure|Worker Tenure Summary/i, 'https://www.bls.gov/news.release/tenure.nr0.htm'],
  [/Bureau of Labor Statistics: Multiple Jobholders/i, 'https://www.bls.gov/cps/cpsaat36.htm'],
  [/Management Occupations Outlook|MBA Employment Outcomes/i, 'https://www.bls.gov/ooh/management/home.htm'],
  [/Self-employment and small business survival|Business Employment Dynamics/i, 'https://www.bls.gov/bdm/'],
  [/Fastest Growing and Declining Occupations/i, 'https://www.bls.gov/ooh/fastest-growing.htm'],
  [/McKinsey Global Institute: The State of AI|The State of AI in/i, 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai'],
  [/Economic Potential of Generative AI|Generative AI and the Future of Work in America/i, 'https://www.mckinsey.com/mgi/our-research/generative-ai-and-the-future-of-work-in-america'],
  [/Developer Productivity with AI-Assisted Coding Tools|AI-Assisted Coding Tools/i, 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier'],
  [/Jobs Lost, Jobs Gained|Workforce Transitions in a Time of Automation/i, 'https://www.mckinsey.com/featured-insights/future-of-work/jobs-lost-jobs-gained-workforce-transitions-in-a-time-of-automation'],
  [/Skill Shifts|Automation and the Future of the Workforce/i, 'https://www.mckinsey.com/featured-insights/future-of-work/skill-shift-automation-and-the-future-of-the-workforce'],
  [/EU AI Act Official Text/i, 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'],
  [/World Economic Forum: Future of Jobs Report 2025|Future of Jobs Report 2025/i, 'https://www.weforum.org/reports/the-future-of-jobs-report-2025/'],
  [/OECD: Employment Outlook|OECD Employment Outlook/i, 'https://www.oecd.org/en/publications/oecd-employment-outlook_19991266.html'],
  [/OECD: Employment Outlook 2025/i, 'https://www.oecd.org/en/publications/oecd-employment-outlook_19991266.html'],
  [/OECD: AI and the Future of Skills|Skills for the Digital Transition/i, 'https://www.oecd.org/employment/skills-for-the-digital-transition.htm'],
  [/Coursera: Global Skills Report|Coursera Global Skills Report/i, 'https://www.coursera.org/skills-reports/global'],
  [/Stanford HAI: AI Index Report|AI Index Report 2025/i, 'https://hai.stanford.edu/ai-index'],
  [/TIOBE Programming Index/i, 'https://www.tiobe.com/tiobe-index/'],
  [/GitHub Octoverse|State of the Octoverse/i, 'https://octoverse.github.com/'],
  [/Harvard CS50/i, 'https://cs50.harvard.edu/'],
  [/SPIVA U\\.S\\. Scorecard|SPIVA/i, 'https://www.spglobal.com/spdji/en/research-insights/spiva/about-spiva/'],
  [/Vanguard Research: The Case for Index Funds|Case for Low-Cost Index Funds/i, 'https://investor.vanguard.com/investor-resources-education/understanding-investment-types/what-is-an-index-fund'],
  [/Morningstar: US Fund Fee Study/i, 'https://www.morningstar.com/lp/us-fund-fee-study'],
  [/FRED|S&P 500 Historical Returns/i, 'https://fred.stlouisfed.org/series/SP500'],
  [/A Random Walk Down Wall Street/i, 'https://wwnorton.com/books/9781324035435'],
  [/YouTube Creator Academy|Monetization Guidelines/i, 'https://support.google.com/youtube/answer/72857'],
  [/Social Blade/i, 'https://socialblade.com/'],
  [/Influencer Marketing Hub: YouTube Revenue Calculator/i, 'https://influencermarketinghub.com/youtube-money-calculator/'],
  [/Think Media/i, 'https://www.thinkmedia.co/'],
  [/Financial Times Global MBA Ranking/i, 'https://rankings.ft.com/rankings/2951/mba-2025'],
  [/Graduate Management Admission Council|Application Trends Survey/i, 'https://www.gmac.com/market-intelligence-and-research/research-library/admissions-and-application-trends'],
  [/US News: Best Business Schools/i, 'https://www.usnews.com/best-graduate-schools/top-business-schools/mba-rankings'],
  [/Poets & Quants: MBA Return on Investment/i, 'https://poetsandquants.com/'],
  [/Harvard Business Review/i, 'https://hbr.org/'],
  [/AARP: Age Discrimination/i, 'https://www.aarp.org/pri/topics/work-finances-retirement/employers-workforce/age-discrimination-workplace/'],
  [/Gallup: State of the Global Workplace/i, 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx'],
  [/Gallup: State of the American Manager/i, 'https://www.gallup.com/workplace/236441/state-american-workplace-report.aspx'],
  [/US Census Bureau: Nonemployer Statistics/i, 'https://www.census.gov/programs-surveys/nonemployer-statistics.html'],
  [/Bankrate Side Hustle Survey/i, 'https://www.bankrate.com/personal-finance/side-hustles-survey/'],
  [/IRS Self-Employment Tax Guidelines/i, 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes'],
  [/Federal Reserve: Consumer Credit Report/i, 'https://www.federalreserve.gov/releases/g19/'],
  [/National Foundation for Credit Counseling|NFCC/i, 'https://www.nfcc.org/harrispoll/'],
  [/IRS Publication 970/i, 'https://www.irs.gov/forms-pubs/about-publication-970'],
  [/I Will Teach You to Be Rich/i, 'https://www.penguinrandomhouse.com/books/539238/i-will-teach-you-to-be-rich-second-edition-by-ramit-sethi/'],
  [/Statista: Global E-commerce/i, 'https://www.statista.com/topics/871/online-shopping/'],
  [/Shopify: The State of Commerce|Shopify: Commerce Trends|State of Dropshipping/i, 'https://www.shopify.com/enterprise/the-future-of-commerce'],
  [/Forbes: Why 90% of E-commerce Startups Fail/i, 'https://www.forbes.com/'],
  [/Google Trends/i, 'https://trends.google.com/trends/'],
  [/Oberlo:/i, 'https://www.shopify.com/blog/dropshipping'],
  [/Facebook Business: Average CPM and CPC benchmarks/i, 'https://www.facebook.com/business/help'],
  [/eMarketer/i, 'https://www.emarketer.com/'],
  [/Consumer Reports: Online Shopping Delivery Expectations/i, 'https://www.consumerreports.org/'],
  [/Litmus: Email Marketing ROI Report/i, 'https://www.litmus.com/resources/state-of-email'],
  [/BigCommerce: State of Small Business E-commerce/i, 'https://www.bigcommerce.com/blog/'],
  [/Pew Research Center: Public Attitudes Toward AI/i, 'https://www.pewresearch.org/topic/science/artificial-intelligence/'],
  [/Rands Leadership Slack Community/i, 'https://randsinrepose.com/welcome-to-rands-leadership-slack/'],
  [/The Manager's Path/i, 'https://www.oreilly.com/library/view/the-managers-path/9781491973882/']
];

const SOURCE_URL_FIXUPS = [
  [/^https?:\/\/www\.spglobal\.com\/spdji\/en\/spiva\/article\/us-spiva-scorecard\/?$/i, 'https://www.spglobal.com/spdji/en/research-insights/spiva/about-spiva/'],
  [/^https?:\/\/www\.linkedin\.com\/business\/talent\/blog\/talent-strategy\/skills-based-hiring\/?$/i, 'https://business.linkedin.com/hire/resources/talent-acquisition/adopting-skills-based-hiring'],
  [/^https?:\/\/www\.aarp\.org\/work\/working-at-50-plus\/info-2018\/age-discrimination-survey\.html\/?$/i, 'https://www.aarp.org/pri/topics/work-finances-retirement/employers-workforce/age-discrimination-workplace/'],
  [/^https?:\/\/www\.nfcc\.org\/resources\/financial-literacy-survey\/?$/i, 'https://www.nfcc.org/harrispoll/'],
  [/^https?:\/\/www\.nerdwallet\.com\/article\/finance\/emergency-fund-why-it-matters\/?$/i, 'https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters'],
  [/^https?:\/\/www\.nerdwallet\.com\/article\/finance\/passive-income-ideas\/?$/i, 'https://www.nerdwallet.com/investing/learn/what-is-passive-income-and-how-do-i-earn-it']
];

function normalizeSourceUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  for (const [pattern, replacement] of SOURCE_URL_FIXUPS) {
    if (pattern.test(raw)) return replacement;
  }
  return raw;
}

function inferSourceUrl(sourceText) {
  const text = String(sourceText || '').trim();
  if (!text) return '';
  for (const [pattern, url] of SOURCE_REFERENCE_URLS) {
    if (pattern.test(text)) return url;
  }
  return '';
}

function sourceUrlFromEntry(source) {
  if (!source) return '';
  if (typeof source === 'object' && source.url && /^https?:\/\//i.test(String(source.url).trim())) {
    return normalizeSourceUrl(String(source.url).trim());
  }
  if (typeof source === 'object') {
    const label = source.title || source.label || source.name || '';
    return inferSourceUrl(label);
  }
  if (typeof source !== 'string') return '';
  const s = source.trim();
  if (/^https?:\/\//i.test(s)) return normalizeSourceUrl(s);
  const markdownMatch = s.match(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownMatch) return normalizeSourceUrl(markdownMatch[1]);
  const inlineUrlMatch = s.match(/https?:\/\/[^\s)]+/i);
  if (inlineUrlMatch) return normalizeSourceUrl(inlineUrlMatch[0]);
  return normalizeSourceUrl(inferSourceUrl(s));
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
  const urlLikeSources = (d.sources || []).filter((s) => !!sourceUrlFromEntry(s)).length;
  const sourcesMissingUrl = sourcesCount - urlLikeSources;
  if (urlLikeSources < 1) {
    warnings.push('sources contain no direct source URLs');
    if (STRICT_SOURCE_URLS) errors.push('STRICT_SOURCE_URLS=1 blocked page: no verifiable source URLs');
  }
  if (sourcesMissingUrl > 0) {
    warnings.push(`sources missing verifiable URL: ${sourcesMissingUrl}/${sourcesCount}`);
    if (STRICT_SOURCE_URLS) {
      errors.push(`STRICT_SOURCE_URLS=1 blocked page: ${sourcesMissingUrl}/${sourcesCount} sources missing URL`);
    }
  }

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

function sourceLabelFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const hostLabels = {
      'bls.gov': 'BLS',
      'coursera.org': 'Coursera',
      'kaggle.com': 'Kaggle',
      'oecd.org': 'OECD',
      'weforum.org': 'World Economic Forum',
      'mckinsey.com': 'McKinsey',
      'spglobal.com': 'S&P Global',
      'nerdwallet.com': 'NerdWallet',
      'vanguard.com': 'Vanguard',
      'gallup.com': 'Gallup',
      'linkedin.com': 'LinkedIn',
      'economicgraph.linkedin.com': 'LinkedIn Economic Graph'
    };
    const hostLabel = hostLabels[host] || host.toUpperCase();
    const segments = u.pathname.split('/').filter(Boolean);
    const last = segments.length ? segments[segments.length - 1] : '';
    if (!last) return hostLabel;
    const cleaned = last
      .replace(/\.(html?|php)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return hostLabel;
    const title = cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
    return `${hostLabel}: ${title}`;
  } catch {
    return 'External Source';
  }
}

function renderSourceItem(source) {
  if (!source) return '';
  if (typeof source === 'object') {
    const label = source.title || source.label || source.name || source.url || '';
    const url = sourceUrlFromEntry(source);
    if (url) {
      const finalLabel = (label && label !== source.url) ? label : sourceLabelFromUrl(url);
      return `${esc(finalLabel)} - <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
    }
    return esc(label);
  }

  const text = String(source).trim();
  const url = sourceUrlFromEntry(text);
  if (!url) return esc(text);

  if (text === url) {
    return `${esc(sourceLabelFromUrl(url))} - <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
  }

  const markdownLabelMatch = text.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/i);
  if (markdownLabelMatch) {
    return `<a href="${esc(markdownLabelMatch[2])}" target="_blank" rel="noopener noreferrer">${esc(markdownLabelMatch[1])}</a>`;
  }

  const label = text.replace(url, '').replace(/[-–—:\s]+$/, '').trim();
  if (label) {
    return `${esc(label)} — <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
  }
  return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`;
}

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
    'description': decisionMeta(d).description,
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
    'image': DEFAULT_OG_IMAGE,
    'articleSection': (CATEGORIES[d.category] || {}).title || d.category,
    'inLanguage': 'en'
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

function jsonLD_WebPage({ type = 'WebPage', name, description, url }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type,
    'name': name,
    'description': description,
    'url': url,
    'isPartOf': { '@id': `${SITE_URL}/#website` },
    'inLanguage': 'en'
  });
}

function jsonLD_CollectionPage({ name, description, url, items }) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': name,
    'description': description,
    'url': url,
    'isPartOf': { '@id': `${SITE_URL}/#website` },
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': (items || []).map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `${SITE_URL}/${item.slug}/`,
        'name': item.title
      }))
    }
  });
}

// ─── Shell: wraps every page ────────────────────────────────
function shell({ title, description, canonical, bodyClass, content, noindex, jsonLdBlocks, ogType, ogImage, twitterCard }) {
  const robotsMeta = noindex
    ? '<meta name="robots" content="noindex, nofollow">'
    : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
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
  <script src="${asset('/script.js')}" defer></script>
</body>
</html>`;
}

function navHTML() {
  return `<header class="site-header">
    <div class="container site-header-inner">
      <div class="site-header-left">
        <a href="/" class="site-logo" aria-label="YourNextStep.ai home">
          <img src="${asset('/logo.png')}" class="site-logo-image" alt="YourNextStep.ai" width="181" height="44" style="height:44px;width:auto;max-height:44px;">
        </a>
      </div>
      
      <div class="nav-actions">
        <button class="search-toggle" aria-label="Open search" aria-expanded="false" aria-controls="search-bar">${ICONS.search}</button>
        <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">${ICONS.menu}</button>
      </div>

      <nav id="main-nav">
        <ul class="nav-links" role="list">
          <li><a href="/ai-and-jobs/">AI & Jobs</a></li>
          <li><a href="/career-decisions/">Career</a></li>
          <li><a href="/learning/">Learning</a></li>
          <li><a href="/money-decisions/">Money</a></li>
          <li><a href="/best-of/">Best Of</a></li>
          <li><a href="/how-we-evaluate-decisions/">Method</a></li>
          <li><a href="/about/">About</a></li>
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
        <p>Editorial decision guides for AI-era work, learning, and money choices.</p>
      </div>
      <div class="footer-col">
        <h3>Coverage</h3>
        <ul role="list">
          <li><a href="/ai-and-jobs/">AI & Jobs</a></li>
          <li><a href="/career-decisions/">Career Decisions</a></li>
          <li><a href="/learning/">Learning</a></li>
          <li><a href="/money-decisions/">Money Decisions</a></li>
          <li><a href="/side-hustles/">Side Hustles</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Method & Trust</h3>
        <ul role="list">
          <li><a href="/about/">About</a></li>
          <li><a href="/how-we-evaluate-decisions/">How We Evaluate Decisions</a></li>
          <li><a href="/review-method/">Review Method</a></li>
          <li><a href="/editorial-policy/">Editorial Policy</a></li>
          <li><a href="/best-of/">Best Of Guides</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h3>Policies</h3>
        <ul role="list">
          <li><a href="/disclaimer/">Disclaimer</a></li>
          <li><a href="/affiliate-disclosure/">Affiliate Disclosure</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} YourNextStep.ai. AI-assisted editorial decision guides with cited sources and a published methodology. <a href="/disclaimer/">Full disclaimer</a>.</p>
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
        <div class="risk-list risk-list--mistakes">
          <div class="risk-card risk-card--mistake"><span class="risk-icon risk-icon--index" aria-hidden="true">1</span><p>Deciding purely on emotion without weighing the factors above. Use the scorecard before committing.</p></div>
          <div class="risk-card risk-card--mistake"><span class="risk-icon risk-icon--index" aria-hidden="true">2</span><p>Ignoring the "worst case" scenario. If you can't survive it, the decision carries more risk than you think.</p></div>
          <div class="risk-card risk-card--mistake"><span class="risk-icon risk-icon--index" aria-hidden="true">3</span><p>Skipping the "who should NOT" section. The best decisions start by eliminating bad fits.</p></div>
        </div>
      </section>`;
  } else {
    // Variant C: Conditional advice
    return `<section class="decision-section" aria-label="Conditional advice">
        <h2>If You're in This Situation, Do This</h2>
        <div class="scenarios-grid">
          <div class="scenario-card"><h3>🎯 If you're early-career</h3><p>Focus on the "Who Should" criteria above. Your risk tolerance is higher and recovery time from a wrong move is shorter.</p></div>
          <div class="scenario-card"><h3>🏠 If you have dependents</h3><p>Prioritize the financial factors in the scorecard. The "Realistic Case" scenario should be your planning baseline, not the best case.</p></div>
          <div class="scenario-card"><h3>⏰ If you're on a deadline</h3><p>Skip straight to "Recommended Next Steps" and take the first action within 48 hours. Analysis paralysis is the biggest risk.</p></div>
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
          <h2 class="audio-title">${ICONS.headphones} 3-Minute Audio Briefing</h2>
          <p class="audio-player-subtitle">${d.audio.audioUrl ? 'Listen to the summary' : 'Audio coming soon — read the transcript below'}</p>
          ${d.audio.audioUrl ? `<audio preload="metadata" src="${esc(d.audio.audioUrl)}"></audio>
          <div class="audio-controls">
            <div class="audio-main">
              <button class="btn-play" aria-label="Play audio briefing">${ICONS.play}</button>
              <div class="audio-progress">
                <div class="progress-bar"><div class="progress-fill"></div></div>
              </div>
            </div>
            <div class="audio-time"><span class="time-current">0:00</span><span class="time-duration">0:00</span></div>
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
        <div class="scorecard" role="table" aria-label="Decision scorecard table">
          <div class="scorecard-header" role="row">
            <span class="scorecard-col-factor" role="columnheader">Factor</span>
            <span class="scorecard-col-weight" role="columnheader">Weight</span>
            <span class="scorecard-col-score" role="columnheader">Score</span>
            <span class="scorecard-col-weighted" role="columnheader">Weighted</span>
          </div>
          ${d.scorecard.map(row => {
    const weighted = row.weight * row.score;
    const maxW = row.weight * 10;
    const pct = Math.round((weighted / maxW) * 100);
    return `<div class="scorecard-row" role="row">
              <span class="scorecard-cell scorecard-cell-factor" data-label="Factor" role="cell">${esc(row.factor)}</span>
              <span class="scorecard-cell scorecard-cell-weight" data-label="Weight" role="cell">${row.weight}/10</span>
              <span class="scorecard-cell scorecard-cell-score" data-label="Score" role="cell">${row.score}/10</span>
              <span class="scorecard-cell scorecard-cell-weighted" data-label="Weighted" role="cell">
                <span class="scorecard-weighted-value">${weighted}/${maxW}</span>
                <div class="scorecard-bar"><div class="scorecard-bar-fill" style="width:${pct}%"></div></div>
              </span>
            </div>`;
  }).join('')}
          <div class="scorecard-total" role="row">
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
          ${d.scenarios.map(s => `<div class="scenario-card"><h3>${s.title}</h3><p>${esc(s.description)}</p></div>`).join('')}
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
              <div class="next-step-info"><h3>${ns.isPrimary ? ICONS.star + ' ' : ''}${esc(ns.action)}</h3></div>
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
          ${d.sources.map(s => `<li>${renderSourceItem(s)}</li>`).join('')}
        </ol>
      </section>

      <!-- Related Decisions -->
      ${related.length > 0 ? `<section class="decision-section" aria-label="Related decisions">
        <h2>Related Decisions</h2>
        <div class="related-grid">
          ${related.map(r => `<a href="/${r.slug}/" class="related-card">
            <h3>${esc(r.title)}</h3>
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
        <h2 class="sr-only">${esc(cat.title)} decision guides</h2>
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

function renderDecisionCardHTML(d) {
  const vTag = verdictTagClass(d.verdict);
  const vColor = d.verdict === 'Yes' ? 'var(--verdict-yes)' : d.verdict === 'No' ? 'var(--verdict-no)' : 'var(--verdict-depends)';
  const description = decisionMeta(d).description || '';
  const shortDesc = description.length > 130 ? `${description.slice(0, 127)}...` : description;
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
}

function decisionPageHTMLV2(d, allDecisions) {
  const catMeta = CATEGORIES[d.category] || { title: d.category, icon: 'fileText' };
  const isYMYL = d.category === 'money-decisions';
  const meta = decisionMeta(d);
  const related = (d.relatedSlugs || []).map((slug) => allDecisions.find((entry) => entry.slug === slug)).filter(Boolean);
  const weightedScore = d.scorecard.reduce((sum, row) => sum + (row.weight * row.score), 0);
  const maxWeightedScore = d.scorecard.reduce((sum, row) => sum + (row.weight * 10), 0);
  const overallPct = Math.round((weightedScore / maxWeightedScore) * 100);
  const hasAffiliateLinks = (d.nextSteps || []).slice(0, 3).some((step) => step.affiliateUrl);
  const updatedLabel = formatDateHuman(d.updatedDate);
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL + '/' },
    { name: catMeta.title, url: `${SITE_URL}/${d.category}/` },
    { name: meta.h1, url: `${SITE_URL}/${d.slug}/` }
  ];
  const jsonLdBlocks = [
    jsonLD_Breadcrumb(breadcrumbItems),
    jsonLD_Article(d),
    jsonLD_WebPage({ name: meta.h1, description: meta.description, url: `${SITE_URL}/${d.slug}/` })
  ];
  if (d.faq && d.faq.length >= 5) jsonLdBlocks.push(jsonLD_FAQ(d.faq));

  const content = `
    <div class="container">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a> <span class="separator">></span>
        <a href="/${d.category}/">${esc(catMeta.title)}</a> <span class="separator">></span>
        <span aria-current="page">${esc(meta.h1)}</span>
      </nav>
      <header class="decision-hero">
        <div class="decision-hero-chips">
          <span class="eyebrow-chip">${esc(catMeta.title)}</span>
          <span class="eyebrow-chip">${esc(humanIntentLabel(d.primaryIntent))}</span>
          <span class="eyebrow-chip">Updated ${esc(updatedLabel)}</span>
        </div>
        <h1>${esc(meta.h1)}</h1>
        <p class="decision-standfirst">${esc(meta.standfirst)}</p>
        <div class="trust-strip">
          <span>${d.sources.length} cited sources</span>
          <span>${d.readingTime} min read</span>
          <span><a href="/how-we-evaluate-decisions/">Published methodology</a></span>
          <span><a href="/review-method/">Review method</a></span>
          ${isYMYL ? '<span>Educational money guidance only</span>' : ''}
        </div>
      </header>
      <section class="decision-summary-panel" id="quick-answer" aria-label="Quick answer">
        <div class="decision-summary-main">
          <p class="decision-summary-label">Quick answer</p>
          <p class="decision-summary-copy">${esc(decisionQuickAnswer(d))}</p>
          <p class="decision-bottom-line"><strong>Bottom line:</strong> ${esc(decisionBottomLine(d))}</p>
        </div>
        <aside class="decision-score-aside" aria-label="Decision summary">
          <div class="decision-score-badge ${verdictClass(d.verdict)}">${esc(d.verdict)}</div>
          <div class="decision-score-confidence">${d.confidence}% confidence</div>
          <p>${overallPct}% weighted score based on the factors below.</p>
        </aside>
      </section>
      <section class="decision-fit-grid" aria-label="Fit guidance">
        <div class="who-card who-should">
          <h2>${ICONS.check} Best answer if your situation looks like this</h2>
          <ul role="list">${d.whoShould.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
        <div class="who-card who-shouldnt">
          <h2>${ICONS.circleX} Probably not if these conditions apply</h2>
          <ul role="list">${d.whoShouldNot.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
      </section>
      <section class="decision-section" aria-label="When the answer changes">
        <h2>The decision changes if...</h2>
        <div class="insight-grid">
          ${decisionChangesIf(d).map((item) => `<div class="insight-card"><p>${esc(item)}</p></div>`).join('')}
        </div>
      </section>
      <nav class="decision-toc" aria-label="Page sections">
        <a href="#quick-answer">Quick answer</a>
        <a href="#scorecard">Scorecard</a>
        <a href="#evidence">Why we say this</a>
        <a href="#risks">Risks</a>
        <a href="#next-steps">Next steps</a>
        <a href="#sources">Sources</a>
      </nav>
      <section class="decision-section" id="scorecard" aria-label="Decision scorecard">
        <h2>Decision Scorecard</h2>
        <div class="scorecard" role="table" aria-label="Decision scorecard table">
          <div class="scorecard-header" role="row">
            <span class="scorecard-col-factor" role="columnheader">Factor</span>
            <span class="scorecard-col-weight" role="columnheader">Weight</span>
            <span class="scorecard-col-score" role="columnheader">Score</span>
            <span class="scorecard-col-weighted" role="columnheader">Weighted</span>
          </div>
          ${d.scorecard.map((row) => {
    const weighted = row.weight * row.score;
    const maxW = row.weight * 10;
    const pct = Math.round((weighted / maxW) * 100);
    return `<div class="scorecard-row" role="row">
      <span class="scorecard-cell scorecard-cell-factor" data-label="Factor" role="cell">${esc(row.factor)}</span>
      <span class="scorecard-cell scorecard-cell-weight" data-label="Weight" role="cell">${row.weight}/10</span>
      <span class="scorecard-cell scorecard-cell-score" data-label="Score" role="cell">${row.score}/10</span>
      <span class="scorecard-cell scorecard-cell-weighted" data-label="Weighted" role="cell"><span class="scorecard-weighted-value">${weighted}/${maxW}</span><div class="scorecard-bar"><div class="scorecard-bar-fill" style="width:${pct}%"></div></div></span>
    </div>`;
  }).join('')}
          <div class="scorecard-total" role="row"><span>Overall Score</span><span>${overallPct}% (${weightedScore}/${maxWeightedScore})</span></div>
        </div>
      </section>
      <section class="decision-section" id="evidence" aria-label="Why we say this"><h2>Why we say this</h2><div class="insight-grid">${decisionEvidence(d).map((item) => `<div class="insight-card"><p>${esc(item)}</p></div>`).join('')}</div></section>
      <section class="decision-section" aria-label="Pros and cons"><h2>Pros & Cons</h2><div class="proscons-grid"><div class="proscons-column"><h3>${ICONS.thumbsUp} Pros</h3>${d.pros.map((item) => `<div class="proscons-item"><h4>${esc(item.title)}</h4><p>${esc(item.detail)}</p></div>`).join('')}</div><div class="proscons-column"><h3>${ICONS.thumbsDown} Cons</h3>${d.cons.map((item) => `<div class="proscons-item"><h4>${esc(item.title)}</h4><p>${esc(item.detail)}</p></div>`).join('')}</div></div></section>
      <section class="decision-section" id="risks" aria-label="Risks people underestimate"><h2>Risks People Underestimate</h2><div class="risk-list">${d.risksUnderestimated.map((item) => `<div class="risk-card"><span class="risk-icon" aria-hidden="true">${ICONS.alertTriangle}</span><p>${esc(item)}</p></div>`).join('')}</div></section>
      <section class="decision-section" aria-label="Common mistakes"><h2>Common Mistakes</h2><div class="risk-list risk-list--mistakes">${decisionMistakes(d).map((item, index) => `<div class="risk-card risk-card--mistake"><span class="risk-icon risk-icon--index" aria-hidden="true">${index + 1}</span><p>${esc(item)}</p></div>`).join('')}</div></section>
      <section class="decision-section" aria-label="Realistic scenarios"><h2>3 Realistic Scenarios</h2><div class="scenarios-grid">${d.scenarios.map((scenario) => `<div class="scenario-card"><h3>${scenario.title}</h3><p>${esc(scenario.description)}</p></div>`).join('')}</div></section>
      <section class="decision-section" id="next-steps" aria-label="Recommended next steps">
        <h2>Recommended Next Steps</h2>
        ${hasAffiliateLinks ? `<div class="affiliate-disclosure" role="note" aria-label="Advertising disclosure"><strong>Ad</strong> - Some links below are advertising (affiliate) links. If you use them, we may earn a commission. Our analysis is independent. <a href="/affiliate-disclosure/">Full disclosure</a>.</div>` : ''}
        <div class="next-steps-list">${d.nextSteps.slice(0, 3).map((ns, index) => {
    const isPrimary = ns.isPrimary ? ' primary' : '';
    const slot = affiliateSlotFor(index);
    const merchant = ns.affiliateUrl ? merchantFromUrl(ns.affiliateUrl) : '';
    const ctaHTML = ns.affiliateUrl ? `<a href="${esc(ns.affiliateUrl)}" class="next-step-cta affiliate-link" rel="sponsored nofollow noopener noreferrer" target="_blank" data-affiliate="true" data-slot="${slot}" data-merchant="${esc(merchant)}" data-page-path="/${d.slug}/" data-item-id="${d.slug}-${index + 1}" data-item-title="${esc(ns.action)}" aria-label="${esc(`Advertising link: ${merchant}. ${ns.affiliateLabel || 'View offer'}`)}">${esc(ns.affiliateLabel || 'View offer')} <span class="sr-only">(advertising link, opens in new tab)</span></a>` : '';
    return `<div class="next-step-card${isPrimary}"><div class="next-step-info"><h3>${ns.isPrimary ? ICONS.star + ' ' : ''}${esc(ns.action)}</h3></div>${ctaHTML}</div>`;
  }).join('')}</div>
      </section>
      <section class="decision-section" id="audio" aria-label="Audio briefing"><div class="audio-player"><h2 class="audio-title">${ICONS.headphones} Audio Briefing</h2><p class="audio-player-subtitle">${d.audio.audioUrl ? 'Listen to the summary or read the transcript below.' : 'Audio coming soon - read the transcript below.'}</p>${d.audio.audioUrl ? `<audio preload="metadata" src="${esc(d.audio.audioUrl)}"></audio><div class="audio-controls"><div class="audio-main"><button class="btn-play" aria-label="Play audio briefing">${ICONS.play}</button><div class="audio-progress"><div class="progress-bar"><div class="progress-fill"></div></div></div></div><div class="audio-time"><span class="time-current">0:00</span><span class="time-duration">0:00</span></div></div>` : ''}<button class="audio-script-toggle" aria-expanded="false">Read transcript ▼</button><div class="audio-script" role="region" aria-label="Audio transcript"><p>${esc(d.audio.script)}</p></div></div></section>
      <section class="decision-section" aria-label="Frequently asked questions"><h2>Frequently Asked Questions</h2><div class="faq-list">${d.faq.map((item) => `<details class="faq-item"><summary>${esc(item.q)}</summary><div class="faq-answer"><p>${esc(item.a)}</p></div></details>`).join('')}</div></section>
      <section class="decision-section" id="sources" aria-label="Sources"><h2>Sources and Transparency</h2><div class="source-transparency-card"><p><strong>Last reviewed:</strong> ${esc(updatedLabel)}. This page links its reasoning back to the scorecard, scenarios, and sources below.</p><p>${isYMYL ? 'This money guide is educational and not personal financial advice. Use it to structure your thinking before making a real decision.' : 'This guide is built to be easy to summarize, verify, and challenge with the evidence below.'}</p></div><ol class="sources-list">${d.sources.map((source) => `<li>${renderSourceItem(source)}</li>`).join('')}</ol></section>
      ${related.length > 0 ? `<section class="decision-section" aria-label="Related decisions"><h2>Related Comparisons and Next Reads</h2><div class="related-grid">${related.map((entry) => `<a href="/${entry.slug}/" class="related-card"><h3>${esc(entry.title)}</h3><span class="related-verdict ${verdictTagClass(entry.verdict)}">${entry.verdict} - ${entry.confidence}%</span></a>`).join('')}</div></section>` : ''}
      <section class="decision-section" aria-label="Explore more guides"><h2>What to Read Next</h2><div class="related-grid related-grid--trust"><a href="/${d.category}/" class="related-card"><h3>${esc(catMeta.title)} hub</h3><span class="related-verdict">See the strongest related guides in this cluster.</span></a><a href="/best-of/" class="related-card"><h3>Best Of guides</h3><span class="related-verdict">Start with the pages that best explain the site's strongest topics.</span></a><a href="/how-we-evaluate-decisions/" class="related-card"><h3>How we evaluate decisions</h3><span class="related-verdict">See how verdicts, confidence, and factor weights are assigned.</span></a></div></section>
    </div>`;

  return shell({ title: meta.title, description: meta.description, canonical: `${SITE_URL}/${d.slug}/`, bodyClass: 'page-decision', ogType: 'article', content, noindex: d.noindex, jsonLdBlocks });
}

function categoryPageHTMLV2(catSlug, decisions, page, totalPages) {
  const cat = CATEGORIES[catSlug];
  const hub = CATEGORY_HUBS[catSlug] || {};
  const featured = pickDecisionsBySlug(decisions, hub.startHere || []);
  const introCards = featured.length > 0 ? featured : decisions.slice(0, 3);
  const avgConfidence = decisions.length > 0 ? Math.round(decisions.reduce((sum, item) => sum + item.confidence, 0) / decisions.length) : 0;
  const paginationHTML = totalPages > 1 ? `<nav class="pagination" aria-label="Category pages">
    ${page > 1 ? `<a href="/${catSlug}/${page === 2 ? '' : `page/${page - 1}/`}" rel="prev">Prev</a>` : ''}
    ${Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
    const href = p === 1 ? `/${catSlug}/` : `/${catSlug}/page/${p}/`;
    return p === page ? `<span class="current">${p}</span>` : `<a href="${href}">${p}</a>`;
  }).join('')}
    ${page < totalPages ? `<a href="/${catSlug}/page/${page + 1}/" rel="next">Next</a>` : ''}
  </nav>` : '';
  const canonical = page === 1 ? `${SITE_URL}/${catSlug}/` : `${SITE_URL}/${catSlug}/page/${page}/`;
  const breadcrumbItems = [{ name: 'Home', url: SITE_URL + '/' }, { name: cat.title, url: canonical }];
  const content = `
    <section class="category-hero category-hero--authority">
      <div class="category-hero-bg" aria-hidden="true"></div>
      <div class="container">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a> <span class="separator">></span>
          <span aria-current="page">${esc(cat.title)}</span>
        </nav>
        <div class="category-hero-icon">${ICONS[cat.icon]}</div>
        <h1>${esc(cat.title)}</h1>
        <p class="category-hero-desc">${esc(hub.summary || cat.description)}</p>
        <div class="trust-strip">
          <span>${decisions.length} guides in this cluster</span>
          <span>${avgConfidence}% average confidence</span>
          <span>${esc(hub.audience || cat.description)}</span>
        </div>
      </div>
    </section>
    <section class="section"><div class="container container--wide"><div class="hub-overview-grid"><div class="hub-overview-card"><h2>How to use this hub</h2><ul role="list" class="hub-list">${(hub.framework || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div><div class="hub-overview-card"><h2>Questions this cluster should answer well</h2><ul role="list" class="hub-list">${(hub.questions || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div></div></div></section>
    <section class="section"><div class="container container--wide"><div class="section-header"><h2>Start here</h2><p>These are the best entry points if you want the strongest pages in ${esc(cat.title.toLowerCase())}.</p></div><div class="decision-card-grid">${introCards.map((item) => renderDecisionCardHTML(item)).join('')}</div></div></section>
    <section class="section"><div class="container container--wide"><div class="section-header"><h2>All ${esc(cat.title)} guides</h2><p>Browse the full cluster to compare adjacent decisions and follow the logic between related pages.</p></div><div class="decision-card-grid">${decisions.map((item) => renderDecisionCardHTML(item)).join('')}</div>${paginationHTML}</div></section>
    <section class="section"><div class="container container--wide"><div class="hub-trust-links"><a href="/how-we-evaluate-decisions/" class="card"><h3>How we evaluate decisions</h3><p>See the verdict logic, score weighting, and confidence framework.</p></a><a href="/editorial-policy/" class="card"><h3>Editorial policy</h3><p>See sourcing standards, update cadence, and how we handle corrections.</p></a><a href="/review-method/" class="card"><h3>Review method</h3><p>See the page-level checklist used before a guide is published or updated.</p></a></div></div></section>`;

  return shell({
    title: `${cat.title}: Decision Guides and Frameworks`,
    description: hub.summary || cat.description,
    canonical,
    bodyClass: 'page-category',
    content,
    jsonLdBlocks: [jsonLD_Breadcrumb(breadcrumbItems), jsonLD_CollectionPage({ name: cat.title, description: hub.summary || cat.description, url: canonical, items: decisions })]
  });
}

function homepageHTMLV2(allDecisions) {
  const featured = pickDecisionsBySlug(allDecisions, HOME_FEATURED_SLUGS);
  const secondary = pickDecisionsBySlug(allDecisions, HOME_SECONDARY_SLUGS);
  const categoryCounts = {};
  for (const decision of allDecisions) categoryCounts[decision.category] = (categoryCounts[decision.category] || 0) + 1;
  const content = `
    <section class="hero hero--authority">
      <div class="hero-content container">
        <span class="hero-badge">${ICONS.brain} Decision guides for the AI era</span>
        <h1>Make better work, learning, and money decisions without generic advice.</h1>
        <p class="hero-subtitle">YourNextStep.ai is building a decision-support library around AI-era careers, practical skill choices, and financial sequencing. Each guide aims to answer the question fast, show the reasoning, and make the tradeoffs explicit.</p>
        <div class="hero-cta-group"><a href="#start-here" class="hero-cta">Start with the strongest guides</a><a href="/how-we-evaluate-decisions/" class="hero-cta hero-cta--secondary">See the methodology</a></div>
        <div class="trust-strip trust-strip--hero"><span><a href="/best-of/">Verdict-first pages</a></span><span><a href="/editorial-policy/">Cited sources</a></span><span><a href="/review-method/">Published review method</a></span><span><a href="/how-we-evaluate-decisions/">Clear "depends" logic</a></span></div>
      </div>
    </section>
    <section class="section"><div class="container container--wide"><div class="hub-overview-grid"><div class="hub-overview-card"><h2>Primary focus right now</h2><p>The highest-authority wedge for this site is AI, work, and learning decisions. That is where the homepage now leads, and where internal linking is strongest.</p></div><div class="hub-overview-card"><h2>Secondary coverage</h2><p>Money guides stay on the site, but they are framed more carefully as educational decision support with stronger source and transparency requirements.</p></div></div></div></section>
    <section class="section" id="start-here"><div class="container container--wide"><div class="section-header"><h2>Start here</h2><p>These are the pages most likely to explain what the site is good at and how to use it.</p></div><div class="decision-card-grid">${featured.map((item) => renderDecisionCardHTML(item)).join('')}</div></div></section>
    <section class="section" id="how-it-works"><div class="container container--wide"><div class="section-header"><h2>What those signals mean</h2><p>The goal is not to tell every reader the same answer. The goal is to show which conditions make the answer change, and why.</p></div><div class="steps-grid"><div class="step"><h3>Verdict-first pages</h3><p>Priority pages open with a quick answer, a bottom line, and clear fit conditions before the detailed analysis begins.</p></div><div class="step"><h3>Cited sources</h3><p>Claims should trace back to visible sources, not vague references or hidden research notes.</p></div><div class="step"><h3>Clear depends logic</h3><p>When the answer is conditional, the page should explain exactly which facts or constraints flip the recommendation.</p></div></div></div></section>
    <section class="section"><div class="container container--wide"><div class="section-header"><h2>Topic clusters</h2><p>Use the hubs below to move from one decision to the next instead of landing on isolated pages.</p></div><div class="card-grid">${Object.entries(CATEGORIES).map(([slug, cat]) => `<a href="/${slug}/" class="card"><div class="card-icon">${ICONS[cat.icon]}</div><h3>${esc(cat.title)}</h3><p>${esc((CATEGORY_HUBS[slug] && CATEGORY_HUBS[slug].summary) || cat.description)}</p><span class="card-count">${categoryCounts[slug] || 0} published guides</span></a>`).join('')}</div></div></section>
    <section class="section"><div class="container container--wide"><div class="section-header"><h2>Useful next reads</h2><p>If you already know the core topics, these pages help connect the clusters.</p></div><div class="decision-card-grid">${secondary.map((item) => renderDecisionCardHTML(item)).join('')}</div></div></section>
    <section class="section"><div class="container container--wide"><div class="hub-trust-links"><a href="/about/" class="card"><h3>About the site</h3><p>What the site covers, what it does not cover, and why the current focus is intentionally narrower than the total archive.</p></a><a href="/editorial-policy/" class="card"><h3>Editorial policy</h3><p>How sources are chosen, how updates are handled, and what happens when evidence changes.</p></a><a href="/review-method/" class="card"><h3>Review method</h3><p>The checklist behind every page, especially for money and work-risk topics.</p></a></div></div></section>`;
  return shell({
    title: 'AI-Era Career, Learning, and Money Decision Guides',
    description: 'Decision guides for AI-era careers, learning choices, and practical money sequencing. Get quick answers, cited evidence, and transparent tradeoffs.',
    canonical: SITE_URL + '/',
    bodyClass: 'page-home',
    content,
    jsonLdBlocks: [jsonLD_WebPage({ name: 'YourNextStep.ai', description: 'Decision guides for AI-era careers, learning choices, and practical money sequencing.', url: SITE_URL + '/' })]
  });
}

function bestOfPageHTMLV2(allDecisions) {
  const featured = pickDecisionsBySlug(allDecisions, HOME_FEATURED_SLUGS);
  const curated = featured.length > 0 ? featured : [...allDecisions].sort((a, b) => b.confidence - a.confidence).slice(0, 12);
  const breadcrumbItems = [{ name: 'Home', url: SITE_URL + '/' }, { name: 'Best Of', url: SITE_URL + '/best-of/' }];
  const content = `<div class="container container--wide"><section class="section"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span class="separator">></span><span aria-current="page">Best Of</span></nav><h1>Best Of Decision Guides</h1><p class="decision-standfirst">Start here if you want the clearest examples of the site's target format: fast answers, explicit tradeoffs, and strong internal paths into each cluster.</p></section><section class="section"><div class="decision-card-grid">${curated.map((item) => renderDecisionCardHTML(item)).join('')}</div></section></div>`;
  return shell({
    title: 'Best Of Decision Guides',
    description: 'A curated set of the strongest decision guides on YourNextStep.ai.',
    canonical: SITE_URL + '/best-of/',
    bodyClass: 'page-best-of',
    content,
    jsonLdBlocks: [jsonLD_Breadcrumb(breadcrumbItems), jsonLD_CollectionPage({ name: 'Best Of Decision Guides', description: 'A curated set of the strongest decision guides on YourNextStep.ai.', url: SITE_URL + '/best-of/', items: curated })]
  });
}

function aboutPageHTMLV2() {
  return shell({
    title: 'About YourNextStep.ai',
    description: 'What YourNextStep.ai covers, how the site is focused, and how to use the decision guides responsibly.',
    canonical: SITE_URL + '/about/',
    bodyClass: 'page-about',
    content: `<div class="container"><section class="section"><h1>About YourNextStep.ai</h1><p class="decision-standfirst">YourNextStep.ai is building a decision-support library for AI-era work, learning, and practical money choices. The goal is not to publish endless "should I..." pages. The goal is to make hard decisions clearer.</p><h2>What the site is trying to become</h2><p>We want each strong page to do four things well: answer the question fast, show the reasoning, explain when the answer changes, and make the next best read obvious. That makes the site more useful for readers, more defensible in search, and easier for AI systems to summarize accurately.</p><h2 style="margin-top:var(--space-8);">Current editorial focus</h2><p>Right now the site is intentionally strongest around AI, work, and learning decisions. Money pages remain part of the product, but they are handled more carefully as educational decision support rather than personal advice. Side-hustle pages are treated as a secondary cluster rather than the core identity of the site.</p><h2 style="margin-top:var(--space-8);">What readers should expect</h2><ul class="hub-list"><li>Verdict-first pages with explicit "yes", "no", or "depends" logic.</li><li>Weighted scorecards that show what matters most in the decision.</li><li>Source sections and update dates that stay visible, not hidden.</li><li>Clear statements about what the page is not claiming.</li></ul><h2 style="margin-top:var(--space-8);">AI use and limits</h2><p>The site uses AI-assisted drafting and structuring, but it should not present itself as trustworthy because of AI. Trust comes from editorial scope control, transparent sourcing, visible review standards, and honest limits.</p><h2 style="margin-top:var(--space-8);">Contact</h2><p>Questions, corrections, and partnership inquiries can be sent to <a href="mailto:hello@yournextstep.ai">hello@yournextstep.ai</a>.</p></section></div>`,
    jsonLdBlocks: [jsonLD_WebPage({ type: 'AboutPage', name: 'About YourNextStep.ai', description: 'What YourNextStep.ai covers, how the site is focused, and how to use the decision guides responsibly.', url: SITE_URL + '/about/' })]
  });
}

function scoringPageHTMLV2() {
  return shell({
    title: 'How We Evaluate Decisions',
    description: 'The methodology behind verdicts, scorecards, confidence ratings, and how YourNextStep.ai decides when an answer changes.',
    canonical: SITE_URL + '/how-we-evaluate-decisions/',
    bodyClass: 'page-scoring',
    content: `<div class="container"><section class="section"><h1>How We Evaluate Decisions</h1><p class="decision-standfirst">A good decision page should not just say what to do. It should show the conditions under which the answer changes. That is the point of the YourNextStep.ai framework.</p><h2>The scorecard is a decision map, not a magic number</h2><p>Each guide scores multiple factors on two dimensions: weight and score. Weight shows how important the factor is for that decision. Score shows how favorable the evidence is. The total helps summarize the page, but readers should always inspect the strongest and weakest factors before acting.</p><h2 style="margin-top:var(--space-8);">What the verdict means</h2><ul class="hub-list"><li><strong>Yes:</strong> The default case is favorable for the target audience, assuming the obvious blockers are not present.</li><li><strong>No:</strong> The downside, timing, or fit problems are strong enough that most readers should not proceed yet.</li><li><strong>Depends:</strong> The answer flips based on constraints like runway, policy, time horizon, or execution ability.</li></ul><h2 style="margin-top:var(--space-8);">What confidence means</h2><p>Confidence is not a claim of certainty. It is a claim about how strongly the page can defend the verdict using the evidence available, how sensitive the decision is to context, and how much disagreement should exist even after reading the guide.</p><h2 style="margin-top:var(--space-8);">What gets more scrutiny</h2><p>Money pages, work-risk pages, and advice that could trigger obvious real-world harm receive tighter scope control. Those pages should explain tradeoffs, not overstate certainty, and should link visibly to the relevant policy and review standards.</p></section></div>`
  });
}

function editorialPolicyPageHTMLV2() {
  return shell({
    title: 'Editorial Policy',
    description: 'How YourNextStep.ai chooses sources, updates pages, handles corrections, and separates editorial judgment from commercial relationships.',
    canonical: SITE_URL + '/editorial-policy/',
    bodyClass: 'page-sources',
    content: `<div class="container"><section class="section"><h1>Editorial Policy</h1><p class="decision-standfirst">This page exists because trust should be productized, not implied. If a reader or answer engine cannot tell how a site handles sources, updates, and commercial incentives, the content should not be trusted by default.</p><h2>Source hierarchy</h2><ul class="hub-list"><li>Primary sources where possible: official statistics, regulatory texts, original research, and first-party methodology documents.</li><li>Strong secondary sources when they add synthesis without replacing the primary evidence.</li><li>Weak sources are not used to carry key claims on their own.</li></ul><h2 style="margin-top:var(--space-8);">Update policy</h2><p>Pages should show their last updated date clearly. High-volatility topics should be reviewed more often than slow-moving ones. When evidence changes enough to affect the verdict, the page should be updated rather than silently left to drift.</p><h2 style="margin-top:var(--space-8);">Commercial independence</h2><p>Affiliate links may appear in some next-step sections, but they should never be allowed to rewrite the verdict. Money pages especially should avoid looking like sales funnels disguised as advice pages.</p><h2 style="margin-top:var(--space-8);">Corrections</h2><p>If a factual error, broken source, or outdated recommendation is identified, it should be corrected quickly and the update date should reflect the change. Questions and corrections can be sent to <a href="mailto:hello@yournextstep.ai">hello@yournextstep.ai</a>.</p></section></div>`
  });
}

function reviewMethodPageHTMLV2() {
  return shell({
    title: 'Review Method',
    description: 'The checklist used before YourNextStep.ai publishes or updates a decision page, with stricter standards for money and work-risk topics.',
    canonical: SITE_URL + '/review-method/',
    bodyClass: 'page-sources',
    content: `<div class="container"><section class="section"><h1>Review Method</h1><p class="decision-standfirst">Every decision page should survive a simple question: if someone copies the quick answer into a search result or AI answer, would the page still be fair, grounded, and responsible?</p><h2>Core checklist</h2><ul class="hub-list"><li>Does the page answer the question in the first screen without forcing the reader through filler?</li><li>Does it show what changes the answer instead of pretending every reader is identical?</li><li>Are the strongest claims traceable to the scorecard and sources?</li><li>Does the page include at least one clean, standalone summary section that can be cited accurately?</li></ul><h2 style="margin-top:var(--space-8);">Extra checks for money and risk-sensitive topics</h2><ul class="hub-list"><li>Remove overconfident language and absolute prescriptions.</li><li>Check that downside scenarios are realistic, not decorative.</li><li>Keep the page clearly educational and separate from commercial calls to action.</li></ul><h2 style="margin-top:var(--space-8);">Why this matters for GEO</h2><p>Generative answer engines prefer content that is easy to chunk, summarize, and defend. A review method that rewards explicit reasoning, visible caveats, and source transparency makes the content more citation-worthy without turning it into SEO sludge.</p></section></div>`
  });
}

function disclaimerPageHTMLV2() {
  return shell({
    title: 'Disclaimer',
    description: 'Important limits on how to use YourNextStep.ai pages, especially for financial or risk-sensitive decisions.',
    canonical: SITE_URL + '/disclaimer/',
    bodyClass: 'page-disclaimer',
    content: `<div class="container"><section class="section"><h1>Disclaimer</h1><p class="decision-standfirst">YourNextStep.ai publishes educational decision guides. The site is designed to clarify tradeoffs and improve judgment, not replace professional advice or personal responsibility.</p><h2>Not personalized professional advice</h2><p>Nothing on the site should be treated as individualized financial, legal, medical, or career advice. If a decision has meaningful legal, health, tax, or capital consequences, use the page to prepare better questions for a qualified professional.</p><h2 style="margin-top:var(--space-8);">AI-assisted publishing</h2><p>Some content is drafted or structured with AI assistance. That does not make it automatically more objective or complete. Readers should judge the site by the clarity of its reasoning, the visibility of its sources, and the honesty of its limits.</p><h2 style="margin-top:var(--space-8);">No guarantees</h2><p>Decision guides are not promises about outcomes. Results depend on timing, behavior, context, and changing external conditions.</p></section></div>`
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
      <h2 class="sr-only">Page not found</h2>
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
  for (const f of ['style.css', 'script.js', 'favicon.svg', 'logo.png', 'og-default.svg', 'og-default.png', 'google1a314224e4d44867.html']) {
    await fs.copy(path.join(SRC, f), path.join(DIST, f));
  }

  // Copy audio assets
  const audioSrc = path.join(SRC, 'audio');
  if (await fs.pathExists(audioSrc)) {
    await fs.copy(audioSrc, path.join(DIST, 'audio'));
  }

  // Generate homepage
  await fs.writeFile(path.join(DIST, 'index.html'), homepageHTMLV2(publishable));
  console.log('  📄 index.html');

  // Generate decision pages
  for (const d of publishable) {
    const dir = path.join(DIST, d.slug);
    await fs.ensureDir(dir);
    await fs.writeFile(path.join(dir, 'index.html'), decisionPageHTMLV2(d, publishable));
    console.log(`  📄 ${d.slug}/index.html`);
  }

  // Generate category pages with pagination
  const sitemapUrls = [
    { url: SITE_URL + '/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/best-of/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/about/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/how-we-evaluate-decisions/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/editorial-policy/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/review-method/', lastmod: new Date().toISOString().slice(0, 10) },
    { url: SITE_URL + '/disclaimer/', lastmod: new Date().toISOString().slice(0, 10) },
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
      await fs.writeFile(path.join(dir, 'index.html'), categoryPageHTMLV2(catSlug, pageDecisions, page, totalPages));
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
  const aboutDir = path.join(DIST, 'about');
  const evaluateDir = path.join(DIST, 'how-we-evaluate-decisions');
  const editorialDir = path.join(DIST, 'editorial-policy');
  const reviewDir = path.join(DIST, 'review-method');
  const disclaimerDir = path.join(DIST, 'disclaimer');
  await fs.ensureDir(bestOfDir);
  await fs.ensureDir(aboutDir);
  await fs.ensureDir(evaluateDir);
  await fs.ensureDir(editorialDir);
  await fs.ensureDir(reviewDir);
  await fs.ensureDir(disclaimerDir);
  await fs.writeFile(path.join(bestOfDir, 'index.html'), bestOfPageHTMLV2(publishable));
  await fs.writeFile(path.join(aboutDir, 'index.html'), aboutPageHTMLV2());
  await fs.writeFile(path.join(evaluateDir, 'index.html'), scoringPageHTMLV2());
  await fs.writeFile(path.join(editorialDir, 'index.html'), editorialPolicyPageHTMLV2());
  await fs.writeFile(path.join(reviewDir, 'index.html'), reviewMethodPageHTMLV2());
  await fs.writeFile(path.join(disclaimerDir, 'index.html'), disclaimerPageHTMLV2());
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
  const redirects = `# Netlify redirects
/sitemap /sitemap.xml 301
/about.html /about/ 301
/how-scoring-works.html /how-we-evaluate-decisions/ 301
/sources-update-policy.html /editorial-policy/ 301
/disclaimer.html /disclaimer/ 301
`;
  await fs.writeFile(path.join(DIST, '_redirects'), redirects);

  console.log('\n✅ Build complete! Output in dist/');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
