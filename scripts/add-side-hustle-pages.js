#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'decisions.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const today = '2026-02-27';

function makeAudioScript(title, verdict, confidence, angle) {
  return `${title}? Our verdict is ${verdict.toLowerCase()}, with ${confidence}% confidence. ${angle} ` +
    `This page uses the same decision framework as the rest of the site: weighted factors, tradeoffs, risks, and clear next actions. ` +
    `Most people fail here by chasing hype instead of matching a side hustle to available time, skills, and runway. ` +
    `The right choice is usually the one you can sustain for 6 to 12 months with consistent output, not the one with the biggest headline income claim. ` +
    `Use this as an execution guide: pick one path, define weekly capacity, track inputs and results, and iterate from evidence. ` +
    `Build around constraints first: available hours, stress tolerance, existing skills, and cash runway. ` +
    `Then choose the simplest distribution channel you can execute every week without friction. ` +
    `For most people, consistency beats intensity. Ten focused hours every week for six months is usually stronger than one extreme sprint followed by burnout. ` +
    `Treat early data as directional, not final. Improve offer positioning, messaging clarity, and delivery speed based on real feedback. ` +
    `Keep costs lean until you have repeatable demand and clear return on tools. ` +
    `Finally, avoid overpromising and avoid black-box tactics. Long-term growth comes from trust, useful outcomes, and reliable execution quality. ` +
    `Before scaling, define concrete weekly metrics: qualified leads, conversion rate, average order value, delivery cycle time, and net margin after tooling costs. ` +
    `Review those numbers every week, remove low-value tasks, and double down on channels that consistently produce qualified demand and retained customers.`;
}

function entry(params) {
  return {
    status: 'published',
    slug: params.slug,
    category: 'side-hustles',
    title: params.title,
    relatedSlugs: params.relatedSlugs,
    verdict: params.verdict,
    confidence: params.confidence,
    metaDescription: params.metaDescription,
    whoShould: params.whoShould,
    whoShouldNot: params.whoShouldNot,
    scorecard: params.scorecard,
    pros: params.pros,
    cons: params.cons,
    risksUnderestimated: params.risksUnderestimated,
    scenarios: params.scenarios,
    nextSteps: params.nextSteps,
    faq: params.faq,
    sources: params.sources,
    audio: {
      script: makeAudioScript(params.title, params.verdict, params.confidence, params.audioAngle),
      audioUrl: '',
      durationSec: null,
      voice: '',
      provider: ''
    },
    publishedDate: today,
    updatedDate: today
  };
}

const pages = [
  entry({
    slug: 'best-side-hustles-for-2026-ranked-by-time-money-and-skill',
    title: 'Best Side Hustles for 2026: Ranked by Time, Startup Cost & Income',
    relatedSlugs: ['should-i-start-a-side-hustle-while-employed', 'should-i-start-an-online-business', 'should-i-start-a-youtube-channel'],
    verdict: 'Depends',
    confidence: 83,
    metaDescription: 'Explore the top side hustles for 2026 — ranked by time investment, startup cost, required skills, and earning potential. Find the best fit for your goals.',
    whoShould: [
      'People comparing side hustle options before committing',
      'Workers with limited weekly hours who need realistic options',
      'Beginners evaluating low-cost vs higher-skill opportunities',
      'Anyone optimizing for income potential over 6-12 months',
      'People wanting a structured shortlist instead of random ideas'
    ],
    whoShouldNot: [
      'People looking for guaranteed fast money',
      'Anyone unwilling to test and iterate for at least 8 weeks',
      'People with no weekly time capacity at all',
      'Anyone expecting zero learning curve',
      'People choosing based only on social-media hype'
    ],
    scorecard: [
      { factor: 'Time-to-First-Dollar', weight: 9, score: 7 },
      { factor: 'Startup Cost', weight: 8, score: 8 },
      { factor: 'Skill Barrier', weight: 7, score: 7 },
      { factor: 'Income Ceiling', weight: 9, score: 8 },
      { factor: 'Scalability', weight: 8, score: 8 },
      { factor: 'Execution Consistency', weight: 7, score: 7 }
    ],
    pros: [
      { title: 'Clear ranking reduces decision paralysis', detail: 'A weighted ranking helps you choose based on your real constraints.' },
      { title: 'Mix of low-cost and high-upside options', detail: 'You can pick paths that fit either tight budgets or higher growth goals.' },
      { title: 'Practical fit by time and skill', detail: 'The framework maps options to available hours and current capability.' },
      { title: 'Faster testing cycle', detail: 'Shortlisting cuts time wasted on low-fit ideas.' },
      { title: 'Better monetization path clarity', detail: 'Each model includes realistic tool and platform dependencies.' }
    ],
    cons: [
      { title: 'No universal best side hustle', detail: 'What works depends heavily on execution, niche, and consistency.' },
      { title: 'Rankings change with market conditions', detail: 'Platform demand, pricing, and competition can shift quickly.' },
      { title: 'Top options still require effort', detail: 'Even low-barrier models need sustained output to produce results.' },
      { title: 'Early income often modest', detail: 'Most side hustles start small before compounding.' },
      { title: 'Shiny-object risk remains', detail: 'Switching too often can block meaningful progress.' }
    ],
    risksUnderestimated: [
      'Overestimating available weekly hours leads to fast burnout.',
      'Ignoring distribution channels reduces monetization even with good offers.',
      'Tool subscriptions can quietly erode margins if not tracked.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You choose a high-fit hustle, stay consistent for six months, build repeatable acquisition, and scale toward meaningful recurring monthly income.' },
      { title: '🟡 Realistic Case', description: 'You test one or two models, find traction in one path, and build gradual monthly income while improving skills and margins.' },
      { title: '🔴 Worst Case', description: 'You chase trends every week, buy tools too early, and stop before any model has enough runway to produce reliable results.' }
    ],
    nextSteps: [
      { action: 'Pick one model that matches your available weekly hours and skill level.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Create a 60-day execution plan with weekly production targets.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Use a simple all-in-one launch stack to ship faster.', affiliateUrl: 'https://www.hostinger.com/', affiliateLabel: 'Start with low-cost website hosting →', isPrimary: true }
    ],
    faq: [
      { q: 'What is the best side hustle for beginners in 2026?', a: 'Usually one with low startup cost, clear demand, and skills you already have.' },
      { q: 'How many hours per week do I need?', a: 'Most people need 6-12 focused hours weekly for visible progress.' },
      { q: 'How much can side hustles realistically make?', a: 'Outcomes vary widely, but many start with small monthly income before scaling.' },
      { q: 'Should I run multiple side hustles at once?', a: 'Usually no; one focused model often outperforms scattered effort.' },
      { q: 'What tools are most useful early on?', a: 'Simple publishing, analytics, and invoicing tools are usually enough to start.' },
      { q: 'How fast should I switch if results are weak?', a: 'Set clear checkpoints; iterate first, then pivot if no evidence of traction.' }
    ],
    sources: [
      'https://www.bls.gov/ooh/',
      'https://www.statista.com/',
      'https://www.upwork.com/research',
      'https://www.sba.gov/'
    ],
    audioAngle: 'The best side hustle is the one that matches your constraints and can survive consistency pressure.'
  }),
  entry({
    slug: 'how-to-start-a-side-hustle-with-no-money',
    title: 'How to Start a Side Hustle With No Money (Step-by-Step)',
    relatedSlugs: ['should-i-start-a-side-hustle-while-employed', 'should-i-start-an-online-business', 'should-i-start-a-dropshipping-business'],
    verdict: 'Yes',
    confidence: 87,
    metaDescription: 'Learn practical steps to launch a side hustle in 2026 with zero upfront cost, using free tools and platforms that help you start earning today.',
    whoShould: [
      'People with no startup budget but usable skills',
      'Employees testing a side hustle with minimal risk',
      'Students and early-career professionals',
      'Anyone wanting a step-by-step launch process',
      'People prioritizing fast validation over perfection'
    ],
    whoShouldNot: [
      'People expecting passive income immediately',
      'Anyone unwilling to do outreach or distribution',
      'People avoiding all skill development',
      'Anyone seeking fully automated results from day one',
      'People with zero time capacity'
    ],
    scorecard: [
      { factor: 'Budget Accessibility', weight: 10, score: 10 },
      { factor: 'Speed to Launch', weight: 8, score: 8 },
      { factor: 'Income Potential', weight: 8, score: 7 },
      { factor: 'Execution Difficulty', weight: 7, score: 6 },
      { factor: 'Scalability', weight: 7, score: 7 },
      { factor: 'Risk Level', weight: 8, score: 9 }
    ],
    pros: [
      { title: 'No upfront capital required', detail: 'You can validate demand using free tools before paying for anything.' },
      { title: 'Fast feedback loop', detail: 'Service-based models can produce early market signal quickly.' },
      { title: 'Low downside risk', detail: 'Minimal spend protects you from expensive early mistakes.' },
      { title: 'Strong skill compounding', detail: 'You build sales, delivery, and audience skills from real work.' },
      { title: 'Easy to pivot', detail: 'Low fixed cost allows rapid adaptation when an offer underperforms.' }
    ],
    cons: [
      { title: 'Higher initial manual effort', detail: 'Without budget, your time replaces paid distribution or automation.' },
      { title: 'Slower scaling early on', detail: 'Growth may lag until processes and proof are established.' },
      { title: 'Tool limits on free tiers', detail: 'Free plans can constrain branding, volume, or integrations.' },
      { title: 'Income inconsistency at start', detail: 'Early revenue can be irregular while you build pipeline.' },
      { title: 'Execution discipline required', detail: 'Skipping consistent outreach usually kills momentum.' }
    ],
    risksUnderestimated: [
      'Without distribution, even strong offers can remain invisible.',
      'Free tools are useful, but workflow complexity grows fast without systems.',
      'Many beginners abandon before the first compounding cycle appears.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You launch within two weeks, land early clients through consistent outreach, and reinvest profits into better tools and distribution systems.' },
      { title: '🟡 Realistic Case', description: 'You gain traction gradually over two to three months through disciplined execution, better positioning, and steady improvement of your offer.' },
      { title: '🔴 Worst Case', description: 'You overplan, delay publishing and outreach, and never collect enough real customer feedback to properly validate or improve the offer.' }
    ],
    nextSteps: [
      { action: 'Choose one service offer you can deliver this week.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Publish a simple offer page and start daily outreach for 30 days.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Use a free-first productivity stack to run outreach and delivery.', affiliateUrl: 'https://www.notion.so/', affiliateLabel: 'Start with free Notion workspace →', isPrimary: true }
    ],
    faq: [
      { q: 'Can I really start with zero money?', a: 'Yes, many service and creator models can launch with free tools first.' },
      { q: 'What should I sell first?', a: 'Start with a narrow, outcome-focused offer tied to your existing skills.' },
      { q: 'How soon can I make first income?', a: 'Some people do it in weeks, but consistency is the main driver.' },
      { q: 'Do I need a website from day one?', a: 'Not always, but a simple page helps credibility and conversion.' },
      { q: 'What is the biggest beginner mistake?', a: 'Waiting too long to test with real users or clients.' },
      { q: 'When should I start paying for tools?', a: 'After you have proof of demand and clear ROI from upgrades.' }
    ],
    sources: [
      'https://www.sba.gov/business-guide/plan-your-business',
      'https://www.score.org/',
      'https://www.upwork.com/research',
      'https://www.shopify.com/blog/side-hustle'
    ],
    audioAngle: 'Starting with no money works when you trade capital for consistent execution and fast validation.'
  }),
  entry({
    slug: 'side-hustle-ideas-for-introverts-that-actually-pay',
    title: 'Top Side Hustle Ideas for Introverts That Actually Pay in 2026',
    relatedSlugs: ['should-i-start-a-side-hustle-while-employed', 'should-i-start-a-youtube-channel', 'should-i-learn-ai-to-stay-employable'],
    verdict: 'Yes',
    confidence: 81,
    metaDescription: 'Discover side hustle ideas perfect for introverts — from freelance writing to micro-jobs, with tools and platforms to help you get started.',
    whoShould: [
      'Introverts who prefer focused solo work',
      'People seeking low-social-friction income models',
      'Writers, designers, developers, and researchers',
      'Anyone wanting async-first side income',
      'People who prefer systems over constant networking'
    ],
    whoShouldNot: [
      'People expecting zero client communication',
      'Anyone unwilling to market their services at all',
      'People needing high-energy social work for motivation',
      'Anyone avoiding deadlines and structured delivery',
      'People chasing only trend-driven gigs'
    ],
    scorecard: [
      { factor: 'Introvert Work Fit', weight: 10, score: 9 },
      { factor: 'Income Reliability', weight: 8, score: 7 },
      { factor: 'Startup Cost', weight: 8, score: 8 },
      { factor: 'Scalability', weight: 7, score: 7 },
      { factor: 'Communication Load', weight: 7, score: 8 },
      { factor: 'Skill Leverage', weight: 8, score: 8 }
    ],
    pros: [
      { title: 'Strong fit for async work styles', detail: 'Many high-value tasks can be delivered with limited synchronous interaction.' },
      { title: 'High focus advantage', detail: 'Deep work can create quality output and stronger retention.' },
      { title: 'Low-cost entry models exist', detail: 'Writing, editing, design, and digital products can start lean.' },
      { title: 'Flexible schedule control', detail: 'You can structure output around energy peaks and quiet windows.' },
      { title: 'Compounding portfolio effects', detail: 'Each completed project improves credibility and conversion.' }
    ],
    cons: [
      { title: 'Some communication is unavoidable', detail: 'Discovery, expectation setting, and revision handling still matter.' },
      { title: 'Platform competition can be intense', detail: 'Differentiation and niche focus are required for pricing power.' },
      { title: 'Feast-famine cycles', detail: 'Pipeline management is needed to smooth demand.' },
      { title: 'Scope creep risk', detail: 'Async projects can expand without clear boundaries.' },
      { title: 'Solo workload pressure', detail: 'Without systems, delivery can overwhelm available time.' }
    ],
    risksUnderestimated: [
      'Underpricing to avoid negotiation can trap growth.',
      'Avoiding visibility entirely limits lead flow.',
      'Poor boundaries increase revisions and reduce effective hourly income.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You niche down, build a strong portfolio, and create predictable monthly income with low social overhead and clear client boundaries.' },
      { title: '🟡 Realistic Case', description: 'You combine freelance projects and productized offers, improve pricing gradually, and build systems that reduce context switching significantly over time.' },
      { title: '🔴 Worst Case', description: 'You remain a generalist, compete mostly on price, and burn out from repetitive low-margin work with consistently weak market positioning.' }
    ],
    nextSteps: [
      { action: 'Pick one introvert-friendly model and define a narrow niche.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Build a small portfolio with 3-5 proof pieces and clear outcomes.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Use an async-friendly freelance platform to find early demand.', affiliateUrl: 'https://www.fiverr.com/', affiliateLabel: 'Explore introvert-friendly freelance gigs →', isPrimary: true }
    ],
    faq: [
      { q: 'What side hustles are best for introverts?', a: 'Async service and digital product models often fit best.' },
      { q: 'Do introverts need to do sales?', a: 'Yes, but structured written outreach can work well.' },
      { q: 'Can introverts earn full-time income eventually?', a: 'In some models yes, but consistency and positioning are critical.' },
      { q: 'Which skills pay best in introvert-friendly work?', a: 'Writing, editing, design, coding, research, and analytics are common.' },
      { q: 'How do I avoid burnout?', a: 'Set boundaries, templates, and realistic capacity rules.' },
      { q: 'Should I start on marketplaces or independently?', a: 'Many start on platforms, then shift to direct clients over time.' }
    ],
    sources: [
      'https://www.bls.gov/ooh/',
      'https://www.freelancersunion.org/resources/',
      'https://www.upwork.com/research',
      'https://www.apa.org/topics/personality/introversion-extroversion'
    ],
    audioAngle: 'Introvert-friendly side hustles work best when built around async delivery, boundaries, and portfolio leverage.'
  }),
  entry({
    slug: 'side-hustle-ideas-that-make-passive-income',
    title: 'Side Hustle Ideas That Actually Make Passive Income in 2026',
    relatedSlugs: ['should-i-start-an-online-business', 'should-i-start-a-dropshipping-business', 'should-i-start-a-youtube-channel'],
    verdict: 'Depends',
    confidence: 79,
    metaDescription: 'Explore side hustle concepts that generate passive income — from digital products to automated businesses — with suggested tools and platforms to get started.',
    whoShould: [
      'People willing to build systems before expecting passive output',
      'Creators with reusable knowledge or assets',
      'Builders comfortable with automation and iteration',
      'Anyone seeking recurring revenue over one-off gigs',
      'People with patience for delayed payoff models'
    ],
    whoShouldNot: [
      'People wanting immediate income with no setup phase',
      'Anyone unwilling to create or maintain systems',
      'People expecting zero ongoing operations forever',
      'Anyone avoiding validation and market testing',
      'People treating passive income as guaranteed'
    ],
    scorecard: [
      { factor: 'Recurring Revenue Potential', weight: 9, score: 8 },
      { factor: 'Time-to-Setup', weight: 8, score: 5 },
      { factor: 'Automation Feasibility', weight: 8, score: 7 },
      { factor: 'Startup Cost', weight: 7, score: 7 },
      { factor: 'Market Competition', weight: 7, score: 6 },
      { factor: 'Execution Durability', weight: 8, score: 7 }
    ],
    pros: [
      { title: 'Revenue can decouple from hours over time', detail: 'Digital assets can continue generating sales after creation.' },
      { title: 'Strong compounding potential', detail: 'Each asset can stack into a broader recurring-income base.' },
      { title: 'Flexible channels', detail: 'Products can be distributed across multiple platforms and funnels.' },
      { title: 'Scalable economics', detail: 'Incremental delivery cost is often low for digital models.' },
      { title: 'Portfolio optionality', detail: 'Multiple passive streams can reduce dependence on one source.' }
    ],
    cons: [
      { title: 'Not truly zero-maintenance', detail: 'Most passive models still need updates, support, and optimization.' },
      { title: 'Long setup phase', detail: 'Build time can be substantial before revenue appears.' },
      { title: 'Distribution is hard', detail: 'Without traffic systems, even good products can fail.' },
      { title: 'Competition can compress margins', detail: 'Popular niches attract many similar offers.' },
      { title: 'Delayed feedback loops', detail: 'It can take months to confirm what is working.' }
    ],
    risksUnderestimated: [
      'Passive income is often front-loaded with active work and testing.',
      'Acquisition cost can erase margin if conversion assumptions are wrong.',
      'Single-platform dependency can break revenue unexpectedly.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You build validated digital assets, automate distribution, and reach recurring monthly revenue while keeping upkeep manageable and performance metrics healthy.' },
      { title: '🟡 Realistic Case', description: 'You create one profitable stream first, then add a second channel only after process standardization and predictable conversion performance metrics.' },
      { title: '🔴 Worst Case', description: 'You build unvalidated products, generate little traffic, and confuse setup activity with demand instead of testing real purchase intent signals.' }
    ],
    nextSteps: [
      { action: 'Select one passive model and validate demand before full production.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Design an automation-first workflow for delivery, billing, and support.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Use a creator platform to launch digital products and recurring offers.', affiliateUrl: 'https://www.gumroad.com/', affiliateLabel: 'Launch a passive-income digital product →', isPrimary: true }
    ],
    faq: [
      { q: 'Is passive income actually passive?', a: 'Usually not at the start; most models require active setup and periodic maintenance.' },
      { q: 'What are realistic passive side hustles?', a: 'Digital products, niche content assets, templates, and automation-backed micro-businesses are common.' },
      { q: 'How long before passive income starts?', a: 'Often several months, depending on validation and distribution.' },
      { q: 'Do I need paid ads?', a: 'Not always; many start with organic channels first.' },
      { q: 'What is the biggest mistake?', a: 'Building before validating demand and distribution strategy.' },
      { q: 'Should I run multiple passive projects at once?', a: 'Usually no; one validated system beats many unfinished ones.' }
    ],
    sources: [
      'https://www.shopify.com/blog/passive-income',
      'https://www.sba.gov/',
      'https://www.statista.com/',
      'https://www.nerdwallet.com/article/finance/passive-income-ideas'
    ],
    audioAngle: 'Passive income is usually a systems game: active setup first, then controlled automation and optimization.'
  })
];

const bySlug = new Map(data.map((d, i) => [d.slug, i]));
for (const p of pages) {
  if (bySlug.has(p.slug)) data[bySlug.get(p.slug)] = p;
  else data.push(p);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Upserted ${pages.length} side-hustle pages.`);
