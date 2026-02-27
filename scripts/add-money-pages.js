#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'decisions.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const today = '2026-02-27';

function longAudioScript(topic, verdict, confidence, summary) {
  return `${topic}? Our verdict is ${verdict.toLowerCase()}, with ${confidence}% confidence. ${summary} ` +
    `This guide is built for decision quality, not hype. We compare upside, downside, behavior risk, and execution complexity using the same scorecard structure used across the site. ` +
    `The core mistake most people make is trying to find a perfect one-time answer. In reality, better outcomes usually come from sequencing, diversification, and consistent process. ` +
    `We also stress-test realistic scenarios because outcomes rarely follow best-case assumptions. A good decision should still hold up under moderate setbacks, higher costs, and slower progress than expected. ` +
    `If you use this framework, start with cash-flow safety first, then choose the simplest strategy you can execute for years. Avoid overconfidence, avoid leverage you do not fully understand, and avoid decisions that depend on perfect timing. ` +
    `This is educational analysis, not individualized financial advice. Your debt level, tax context, job stability, and time horizon matter. ` +
    `Bottom line: use a repeatable process, measure results periodically, and adjust deliberately rather than reacting emotionally to short-term market noise.`;
}

function entry(params) {
  return {
    status: 'published',
    slug: params.slug,
    category: 'money-decisions',
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
      script: longAudioScript(params.title, params.verdict, params.confidence, params.audioSummary),
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
    slug: 'should-i-invest-in-real-estate-or-stocks',
    title: 'Should I Invest in Real Estate or Stocks?',
    relatedSlugs: ['should-i-invest-in-index-funds', 'should-i-buy-a-house-or-keep-renting', 'should-i-invest-during-a-recession'],
    verdict: 'Depends',
    confidence: 82,
    metaDescription: 'Should you invest in real estate or stocks? Compare liquidity, returns, risk, effort, and taxes with a structured scorecard and realistic scenarios.',
    whoShould: [
      'People allocating long-term capital for 10+ years',
      'Investors comparing passive stock funds vs active property ownership',
      'Households with stable income and strong reserves',
      'People who want a framework before committing to one asset class',
      'Investors willing to diversify instead of all-in bets'
    ],
    whoShouldNot: [
      'People without emergency reserves',
      'Anyone with high-interest consumer debt',
      'Investors needing liquidity in 2-3 years',
      'People unwilling to handle property complexity',
      'Anyone expecting guaranteed outcomes'
    ],
    scorecard: [
      { factor: 'Long-Term Return Potential', weight: 9, score: 8 },
      { factor: 'Liquidity', weight: 8, score: 9 },
      { factor: 'Complexity', weight: 7, score: 6 },
      { factor: 'Cash Flow Potential', weight: 7, score: 8 },
      { factor: 'Risk Control', weight: 8, score: 7 },
      { factor: 'Diversification', weight: 8, score: 8 }
    ],
    pros: [
      { title: 'Stocks are easier to diversify', detail: 'Broad index funds spread risk across many companies immediately.' },
      { title: 'Real estate can produce cash flow', detail: 'Rental assets can generate regular income when occupancy is stable.' },
      { title: 'Stocks are highly liquid', detail: 'Listed funds are easier to buy and sell than physical property.' },
      { title: 'Property allows leverage', detail: 'Mortgages can amplify gains when assumptions are prudent.' },
      { title: 'Both can be combined', detail: 'Many portfolios improve by mixing both exposures over time.' }
    ],
    cons: [
      { title: 'Stocks can be volatile', detail: 'Short-term drawdowns can trigger emotional mistakes.' },
      { title: 'Property has high friction', detail: 'Closing costs and selling costs reduce flexibility.' },
      { title: 'Property requires execution', detail: 'Maintenance and tenant risk create operational workload.' },
      { title: 'Stocks offer less direct control', detail: 'You cannot manage businesses inside broad index funds.' },
      { title: 'Property concentration risk is real', detail: 'One location can create outsized local-market exposure.' }
    ],
    risksUnderestimated: [
      'Rate shocks can pressure both property affordability and equity valuations.',
      'Liquidity mismatch in property can force bad selling decisions.',
      'Leverage errors in real estate can erase years of expected gains.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You keep diversified stock exposure as core and add measured real-estate exposure with healthy reserves, producing balanced growth and income.' },
      { title: '🟡 Realistic Case', description: 'You start with index funds, later add one property, and see moderate net worth growth with occasional maintenance and vacancy setbacks.' },
      { title: '🔴 Worst Case', description: 'You over-leverage into one property, face vacancy and rate pressure, and combine that with panic-selling stocks in volatility.' }
    ],
    nextSteps: [
      { action: 'Model 10-year assumptions for both strategies with conservative costs.', affiliateUrl: 'https://www.nerdwallet.com/article/investing/investment-calculator', affiliateLabel: 'Use investment calculator →', isPrimary: false },
      { action: 'Review REIT exposure before buying physical property.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Start with low-cost diversified broker portfolio while building optionality.', affiliateUrl: 'https://www.fidelity.com/', affiliateLabel: 'Compare brokerage options →', isPrimary: true }
    ],
    faq: [
      { q: 'Which performs better long term?', a: 'Both can work; outcomes depend on cost, leverage, taxes, and behavior.' },
      { q: 'Is REIT exposure a middle ground?', a: 'Yes, it can add property exposure without direct operations.' },
      { q: 'How much reserve is needed for property?', a: 'Many investors hold several months of property costs as reserve.' },
      { q: 'Should I use leverage in stocks too?', a: 'Most retail investors are better off avoiding margin leverage.' },
      { q: 'Do taxes change the decision?', a: 'Yes, tax treatment can materially impact net returns.' },
      { q: 'Can I do both?', a: 'For many people, diversified allocation across both is strongest.' }
    ],
    sources: [
      'https://fred.stlouisfed.org/',
      'https://www.spglobal.com/spdji/en/spiva/article/us-spiva-scorecard/',
      'https://www.nar.realtor/research-and-statistics',
      'https://www.bls.gov/cpi/'
    ],
    audioSummary: 'The strongest answer for most investors is a balanced process, not asset tribalism.'
  }),
  entry({
    slug: 'should-i-max-out-401k-before-investing-elsewhere',
    title: 'Should I Max Out My 401(k) Before Investing Elsewhere?',
    relatedSlugs: ['should-i-invest-in-index-funds', 'should-i-build-an-emergency-fund-before-investing', 'should-i-pay-off-debt-or-invest'],
    verdict: 'Depends',
    confidence: 88,
    metaDescription: 'Should you max out your 401(k) before investing elsewhere? Compare employer match, tax advantages, flexibility, and liquidity with a structured decision framework.',
    whoShould: ['Workers with employer match', 'People optimizing tax-advantaged retirement savings', 'Households with stable income and cash reserve', 'Investors choosing between retirement and brokerage accounts', 'People with long horizons'],
    whoShouldNot: ['People with no emergency fund', 'High-interest debt holders', 'Plans with very high fees', 'People needing short-term liquidity', 'Anyone skipping employer match analysis'],
    scorecard: [
      { factor: 'Employer Match Value', weight: 10, score: 10 },
      { factor: 'Tax Advantage', weight: 9, score: 9 },
      { factor: 'Liquidity Flexibility', weight: 8, score: 5 },
      { factor: 'Plan Quality', weight: 7, score: 7 },
      { factor: 'Behavioral Discipline', weight: 7, score: 8 },
      { factor: 'Long-Term Fit', weight: 8, score: 9 }
    ],
    pros: [
      { title: 'Employer match can be exceptional', detail: 'Match dollars are often the highest-return contribution in your system.' },
      { title: 'Tax benefits help compounding', detail: 'Pre-tax or Roth structure can improve long-run outcomes.' },
      { title: 'Automation improves consistency', detail: 'Payroll contributions reduce timing behavior errors.' },
      { title: 'Higher contribution ceilings', detail: '401(k) limits can exceed other account types.' },
      { title: 'Planning structure', detail: 'Retirement-first systems can simplify long-term execution.' }
    ],
    cons: [
      { title: 'Lower liquidity', detail: 'Access restrictions can make short-term cash needs harder.' },
      { title: 'Plan quality varies', detail: 'Some plans have expensive or limited options.' },
      { title: 'Fee drag can hide', detail: 'Recordkeeping and fund fees reduce compounding.' },
      { title: 'Tax uncertainty exists', detail: 'Future effective tax rates are not known.' },
      { title: 'Can underfund near-term goals', detail: 'Aggressive maxing can reduce flexibility for medium-term objectives.' }
    ],
    risksUnderestimated: [
      'Skipping full match while investing taxable is a frequent sequencing mistake.',
      'Low liquidity can force expensive debt in emergencies.',
      'High fees matter more than most people realize over decades.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You capture full match, use low-cost funds, and scale contributions steadily while maintaining reserves.' },
      { title: '🟡 Realistic Case', description: 'You take full match and split additional savings across retirement and brokerage based on timeline.' },
      { title: '🔴 Worst Case', description: 'You max contributions without liquidity planning and are forced into expensive decisions when cash shocks happen.' }
    ],
    nextSteps: [
      { action: 'Confirm employer match formula and capture 100% match first.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Run a contribution sequencing model based on your goals and tax profile.', affiliateUrl: 'https://www.nerdwallet.com/article/investing/401k-calculator', affiliateLabel: 'Run 401(k) calculator →', isPrimary: false },
      { action: 'Compare post-match options across retirement and brokerage platforms.', affiliateUrl: 'https://www.betterment.com/', affiliateLabel: 'Compare automated investing tools →', isPrimary: true }
    ],
    faq: [
      { q: 'Should I always max first?', a: 'Usually match first, then decide based on liquidity and goals.' },
      { q: 'What if plan options are weak?', a: 'Take match first, then consider alternatives for additional dollars.' },
      { q: 'How do Roth vs pre-tax choices matter?', a: 'They depend on current vs expected future tax rates.' },
      { q: 'Should brokerage come before 401(k)?', a: 'Usually after match and reserve are covered.' },
      { q: 'Should I skip IRA if I use 401(k)?', a: 'Not necessarily; some investors use both.' },
      { q: 'What sequencing works for many households?', a: 'Reserve, match, debt cleanup, then optimize broader allocation.' }
    ],
    sources: [
      'https://www.irs.gov/retirement-plans',
      'https://www.dol.gov/general/topic/retirement',
      'https://www.fidelity.com/viewpoints/retirement',
      'https://www.vanguard.com/'
    ],
    audioSummary: 'Match-first sequencing is usually strong, but full maxing depends on liquidity and plan quality.'
  }),
  entry({
    slug: 'should-i-build-an-emergency-fund-before-investing',
    title: 'Should I Build an Emergency Fund Before Investing?',
    relatedSlugs: ['should-i-pay-off-debt-or-invest', 'should-i-invest-in-index-funds', 'should-i-max-out-401k-before-investing-elsewhere'],
    verdict: 'Yes',
    confidence: 93,
    metaDescription: 'Should you build an emergency fund before investing? See the tradeoff between liquidity, risk protection, and long-term returns with a practical framework.',
    whoShould: ['People with unstable income', 'New investors with low cash buffer', 'Households with dependents', 'Anyone using credit cards for surprises', 'People wanting resilient investing habits'],
    whoShouldNot: ['People already fully reserved', 'Households with large accessible liquidity', 'People with robust short-term guarantees', 'Anyone with negligible shock exposure', 'No one should skip risk planning entirely'],
    scorecard: [
      { factor: 'Stability Protection', weight: 10, score: 10 },
      { factor: 'Behavioral Safety', weight: 9, score: 9 },
      { factor: 'Debt Avoidance', weight: 8, score: 9 },
      { factor: 'Liquidity Access', weight: 8, score: 10 },
      { factor: 'Opportunity Cost', weight: 6, score: 6 },
      { factor: 'Long-Term Fit', weight: 6, score: 7 }
    ],
    pros: [
      { title: 'Prevents forced selling', detail: 'Liquidity reduces need to liquidate assets in downturns.' },
      { title: 'Avoids expensive debt', detail: 'Cash reserves reduce reliance on high-interest credit.' },
      { title: 'Improves decision quality', detail: 'Stress falls when urgent costs are covered.' },
      { title: 'Supports job transitions', detail: 'Reserves buy time during instability.' },
      { title: 'Strengthens long-term habits', detail: 'Stable systems improve investing consistency.' }
    ],
    cons: [
      { title: 'Cash underperforms equities', detail: 'Long-term expected return is usually lower.' },
      { title: 'Inflation drag', detail: 'Purchasing power can erode if rates lag inflation.' },
      { title: 'Can delay investing too long', detail: 'Over-saving cash can become avoidance behavior.' },
      { title: 'Allocation drift risk', detail: 'Unchecked cash balances may exceed planned targets.' },
      { title: 'Not a full risk solution', detail: 'Insurance and planning are still required.' }
    ],
    risksUnderestimated: [
      'Job loss and market declines can happen together.',
      'Small reserves can vanish quickly in real emergencies.',
      'Debt spirals often begin when reserves are absent.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You build 3-6 months reserves, then invest consistently without disruption from short-term shocks.' },
      { title: '🟡 Realistic Case', description: 'You build a starter reserve and split new savings between reserve growth and investing.' },
      { title: '🔴 Worst Case', description: 'You invest aggressively with no reserve and are forced into debt and panic selling during shocks.' }
    ],
    nextSteps: [
      { action: 'Calculate essential monthly expenses and set reserve target.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Open a dedicated high-yield reserve account with automatic transfers.', affiliateUrl: 'https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts', affiliateLabel: 'Compare high-yield savings →', isPrimary: false },
      { action: 'After starter reserve is built, start automated index investing.', affiliateUrl: 'https://www.mint.com/', affiliateLabel: 'Try budgeting app →', isPrimary: true }
    ],
    faq: [
      { q: 'How large should reserve be?', a: 'Many households target 3-6 months of essential expenses.' },
      { q: 'Can I invest while building reserve?', a: 'Yes, many use a hybrid approach after a starter reserve.' },
      { q: 'Where should reserve sit?', a: 'Typically high-yield cash accounts with fast access.' },
      { q: 'Debt vs reserve first?', a: 'Many frameworks combine starter reserve with debt reduction.' },
      { q: 'Can credit card replace reserve?', a: 'No, credit is fallback, not true liquidity.' },
      { q: 'When do I stop funding reserve?', a: 'Pause at target and review with life changes.' }
    ],
    sources: [
      'https://www.consumerfinance.gov/',
      'https://www.federalreserve.gov/publications/report-economic-well-being-us-households.htm',
      'https://www.bls.gov/news.release/jolts.toc.htm',
      'https://www.nerdwallet.com/article/finance/emergency-fund-why-it-matters'
    ],
    audioSummary: 'Liquidity first protects your compounding plan from forced mistakes.'
  }),
  entry({
    slug: 'should-i-buy-a-house-or-keep-renting',
    title: 'Should I Buy a House or Keep Renting?',
    relatedSlugs: ['should-i-invest-in-real-estate-or-stocks', 'should-i-build-an-emergency-fund-before-investing', 'should-i-pay-off-debt-or-invest'],
    verdict: 'Depends',
    confidence: 85,
    metaDescription: 'Should you buy a house or keep renting? Compare total cost, flexibility, equity, risk, and lifestyle tradeoffs with a structured framework.',
    whoShould: ['People staying 5-7+ years', 'Households with stable income and reserves', 'Renters comparing flexibility vs equity', 'People modeling total ownership cost', 'Families prioritizing location stability'],
    whoShouldNot: ['People expecting to move soon', 'Buyers with thin post-closing reserves', 'Unstable income households', 'People ignoring ownership overhead', 'Anyone prioritizing mobility above all'],
    scorecard: [
      { factor: 'Total Cost over 5-10 Years', weight: 9, score: 7 },
      { factor: 'Flexibility', weight: 8, score: 6 },
      { factor: 'Equity Potential', weight: 8, score: 8 },
      { factor: 'Liquidity Risk', weight: 8, score: 5 },
      { factor: 'Lifestyle Fit', weight: 7, score: 8 },
      { factor: 'Market Timing Risk', weight: 7, score: 6 }
    ],
    pros: [
      { title: 'Potential equity accumulation', detail: 'Ownership may build equity when holding period is long enough.' },
      { title: 'Payment stability', detail: 'Fixed-rate structures can stabilize monthly housing payments.' },
      { title: 'Control over home decisions', detail: 'Owners can customize space and long-term use.' },
      { title: 'Potential tax benefits', detail: 'Some ownership costs may receive tax treatment in certain contexts.' },
      { title: 'Forced-savings dynamic', detail: 'Principal repayment can function as disciplined saving.' }
    ],
    cons: [
      { title: 'High transaction costs', detail: 'Entry and exit frictions can make short ownership periods expensive.' },
      { title: 'Maintenance burden', detail: 'Unexpected repairs can materially change affordability.' },
      { title: 'Reduced mobility', detail: 'Ownership may limit job/location flexibility.' },
      { title: 'Concentration risk', detail: 'Primary residence can dominate household balance sheet exposure.' },
      { title: 'Rate and valuation risk', detail: 'High rates and pricing cycles can pressure outcomes.' }
    ],
    risksUnderestimated: [
      'Rent-vs-buy models often miss opportunity cost of down payment capital.',
      'Maintenance variance can overwhelm optimistic assumptions.',
      'Early forced sale risk is a major downside driver.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You buy within budget, hold long enough, and maintain reserves, leading to stable housing costs and steady equity growth.' },
      { title: '🟡 Realistic Case', description: 'Financially close to renting after full costs, but ownership improves lifestyle fit for your household.' },
      { title: '🔴 Worst Case', description: 'You buy with minimal reserves and are forced to sell early after costly repairs and timeline changes.' }
    ],
    nextSteps: [
      { action: 'Run a full rent-vs-buy model with realistic ownership costs.', affiliateUrl: 'https://www.nerdwallet.com/mortgages/rent-vs-buy-calculator', affiliateLabel: 'Use rent vs buy calculator →', isPrimary: false },
      { action: 'Stress-test affordability under higher rates and repair events.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Compare lenders before committing to financing.', affiliateUrl: 'https://www.lendingtree.com/home/mortgage/', affiliateLabel: 'Compare mortgage rates →', isPrimary: true }
    ],
    faq: [
      { q: 'How long should I stay to make buying sensible?', a: 'Many markets need multi-year holding periods to offset transaction costs.' },
      { q: 'Is renting always wasted money?', a: 'No, renting can be optimal when flexibility is high value.' },
      { q: 'What costs are most missed?', a: 'Maintenance, insurance, taxes, and selling costs.' },
      { q: 'Should I buy with tiny reserves?', a: 'Usually no; reserves are critical for ownership risk.' },
      { q: 'Do lower rates guarantee price gains?', a: 'No, local supply/demand dynamics also matter.' },
      { q: 'How much down payment is ideal?', a: 'It depends on balancing affordability, financing cost, and retained reserves.' }
    ],
    sources: [
      'https://www.census.gov/housing/hvs/index.html',
      'https://www.freddiemac.com/pmms',
      'https://www.nar.realtor/research-and-statistics',
      'https://www.nerdwallet.com/mortgages/rent-vs-buy-calculator'
    ],
    audioSummary: 'The best answer depends on timeline stability, total-cost realism, and retained liquidity after closing.'
  }),
  entry({
    slug: 'should-i-invest-during-a-recession',
    title: 'Should I Invest During a Recession?',
    relatedSlugs: ['should-i-invest-in-index-funds', 'should-i-build-an-emergency-fund-before-investing', 'should-i-invest-in-real-estate-or-stocks'],
    verdict: 'Yes',
    confidence: 84,
    metaDescription: 'Should you invest during a recession? Learn when consistent investing, risk controls, and cash reserves can outperform waiting for perfect market timing.',
    whoShould: ['Long-term investors', 'People with stable income and reserves', 'Investors using systematic DCA', 'People following process over headlines', 'Households with volatility tolerance'],
    whoShouldNot: ['People lacking emergency cash', 'People needing cash in 2-3 years', 'Likely panic-sellers', 'High-interest debt households', 'People seeking immediate gains'],
    scorecard: [
      { factor: 'Long-Term Return Opportunity', weight: 9, score: 8 },
      { factor: 'Behavioral Challenge', weight: 8, score: 6 },
      { factor: 'Timing Risk Reduction', weight: 8, score: 9 },
      { factor: 'Liquidity Safety', weight: 9, score: 6 },
      { factor: 'Process Simplicity', weight: 7, score: 8 },
      { factor: 'Stress Fit', weight: 6, score: 6 }
    ],
    pros: [
      { title: 'Lower average entry prices', detail: 'Recession drawdowns can improve long-run entry basis.' },
      { title: 'DCA lowers timing pressure', detail: 'Systematic investing reduces all-in timing errors.' },
      { title: 'Process discipline strengthens outcomes', detail: 'Consistency often beats reactive decisions.' },
      { title: 'Rebalancing opportunities', detail: 'Downturns can restore target allocation efficiently.' },
      { title: 'Long horizons absorb cycles', detail: 'Historically, diversified markets recover over time.' }
    ],
    cons: [
      { title: 'Drawdowns can continue', detail: 'Initial purchases may face deeper short-term losses.' },
      { title: 'Income risk rises', detail: 'Recessions can pressure employment and cash flow.' },
      { title: 'News stress is high', detail: 'Fear-based headlines can trigger strategy abandonment.' },
      { title: 'Near-retirement risk', detail: 'Sequence risk is greater for investors near withdrawals.' },
      { title: 'False bottom-calling confidence', detail: 'Trying to time exact bottoms often backfires.' }
    ],
    risksUnderestimated: [
      'Job and market shocks can arrive together.',
      'Behavioral errors often dominate analytical errors.',
      'Short-horizon capital should not absorb recession volatility.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You keep reserves, continue DCA, and rebalance calmly; long-run returns benefit from lower entry prices.' },
      { title: '🟡 Realistic Case', description: 'You keep investing but at controlled pace while preserving higher liquidity through uncertain income periods.' },
      { title: '🔴 Worst Case', description: 'You overcommit without reserves and are forced to sell after income disruption and drawdowns.' }
    ],
    nextSteps: [
      { action: 'Automate monthly contributions with predefined allocation rules.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Plan 12-month DCA schedule and review downside capacity.', affiliateUrl: 'https://www.portfoliocharts.com/', affiliateLabel: 'Plan DCA schedule →', isPrimary: false },
      { action: 'Track liquidity and portfolio behavior in one dashboard.', affiliateUrl: 'https://www.personalcapital.com/', affiliateLabel: 'Track portfolio and cash flow →', isPrimary: true }
    ],
    faq: [
      { q: 'Is recession investing always better?', a: 'Not always short term, but disciplined long-term investing often outperforms waiting for certainty.' },
      { q: 'Lump sum or gradual?', a: 'Choose the method you can execute consistently under stress.' },
      { q: 'What if prices keep falling?', a: 'That is expected in volatility; process and reserves matter most.' },
      { q: 'Do I need emergency savings first?', a: 'For most households, yes.' },
      { q: 'Which vehicles are common?', a: 'Diversified index funds are common for simplicity and breadth.' },
      { q: 'Should I pause when fear rises?', a: 'Headline timing often harms outcomes; rules-based execution is usually stronger.' }
    ],
    sources: [
      'https://www.nber.org/research/business-cycle-dating',
      'https://www.federalreserve.gov/monetarypolicy.htm',
      'https://www.spglobal.com/spdji/en/spiva/article/us-spiva-scorecard/',
      'https://www.investor.gov/introduction-investing'
    ],
    audioSummary: 'Recession investing works best when reserves are strong and execution is systematic.'
  }),
  entry({
    slug: 'should-i-use-a-financial-advisor-or-diy-invest',
    title: 'Should I Use a Financial Advisor or DIY Invest?',
    relatedSlugs: ['should-i-invest-in-index-funds', 'should-i-max-out-401k-before-investing-elsewhere', 'should-i-invest-in-real-estate-or-stocks'],
    verdict: 'Depends',
    confidence: 86,
    metaDescription: 'Should you use a financial advisor or DIY invest? Compare cost, complexity, behavior, and planning depth to choose the right model for your finances.',
    whoShould: ['People with complex planning needs', 'Investors evaluating advisory vs DIY costs', 'Households seeking behavioral guardrails', 'DIY investors needing tax/withdrawal support', 'People comparing robo and human guidance'],
    whoShouldNot: ['People expecting guaranteed outperformance', 'Investors ignoring fee transparency', 'DIY investors with no process discipline', 'People choosing based on marketing only', 'Anyone skipping fiduciary checks'],
    scorecard: [
      { factor: 'Planning Complexity Fit', weight: 9, score: 8 },
      { factor: 'Behavioral Coaching Value', weight: 8, score: 8 },
      { factor: 'Cost Efficiency', weight: 8, score: 6 },
      { factor: 'Tax Support', weight: 7, score: 8 },
      { factor: 'Control & Transparency', weight: 7, score: 7 },
      { factor: 'Execution Simplicity', weight: 7, score: 8 }
    ],
    pros: [
      { title: 'Advisors can improve planning quality', detail: 'Good advisors add value via planning and behavior support.' },
      { title: 'DIY can keep costs low', detail: 'Simple index-based DIY can be very fee-efficient.' },
      { title: 'Hybrid approaches exist', detail: 'Robo plus periodic planner support can balance cost and guidance.' },
      { title: 'Advisors can help with complex events', detail: 'Retirement transitions and tax planning may benefit from support.' },
      { title: 'DIY preserves full control', detail: 'Self-directed systems give full transparency and implementation control.' }
    ],
    cons: [
      { title: 'Fees compound over time', detail: 'Even moderate advisory fees can materially reduce terminal wealth.' },
      { title: 'Quality varies', detail: 'Advisor standards, incentives, and service depth differ widely.' },
      { title: 'DIY behavior risk', detail: 'Without process, DIY portfolios can underperform due to emotion.' },
      { title: 'Conflict risk exists', detail: 'Commission models can create product bias.' },
      { title: 'DIY has time cost', detail: 'Planning, tax work, and reviews require sustained effort.' }
    ],
    risksUnderestimated: [
      'Fee drag often matters more than people expect over decades.',
      'Behavioral mistakes can outweigh advisory fee savings.',
      'Lack of fiduciary clarity can create misaligned recommendations.'
    ],
    scenarios: [
      { title: '🟢 Best Case', description: 'You choose transparent fiduciary guidance or a strong DIY system and execute consistently with low-cost core investments.' },
      { title: '🟡 Realistic Case', description: 'You use a hybrid setup with low-cost implementation plus targeted planning sessions for complex decisions.' },
      { title: '🔴 Worst Case', description: 'You choose high-fee opaque advice or undisciplined DIY and lose return through cost and behavior errors.' }
    ],
    nextSteps: [
      { action: 'Audit your current process: allocation, rebalancing, tax workflow, and behavior triggers.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Compare total annual cost of DIY, robo, and advisor models on the same assumptions.', affiliateUrl: 'https://www.nerdwallet.com/article/investing/financial-advisor', affiliateLabel: 'Compare advisor types →', isPrimary: false },
      { action: 'If using an advisor, require fiduciary standard and written fee disclosure.', affiliateUrl: 'https://www.betterment.com/', affiliateLabel: 'Try robo-advisor option →', isPrimary: true }
    ],
    faq: [
      { q: 'Do advisors beat markets?', a: 'Usually not via stock picking; value is often planning and behavior.' },
      { q: 'What is fiduciary advice?', a: 'Fiduciary advisors are expected to prioritize client interests.' },
      { q: 'When is DIY enough?', a: 'DIY can work well when goals are simple and process is disciplined.' },
      { q: 'How much fee is too high?', a: 'Benchmark all-in cost against low-cost alternatives and expected service value.' },
      { q: 'Is robo a good middle option?', a: 'For many households, yes.' },
      { q: 'How should I choose?', a: 'Match complexity and behavior needs to service level and cost transparency.' }
    ],
    sources: [
      'https://www.sec.gov/investor',
      'https://www.investor.gov/introduction-investing',
      'https://www.finra.org/investors',
      'https://www.cfainstitute.org/'
    ],
    audioSummary: 'The best model is the one that controls behavior risk while keeping cost aligned with real planning value.'
  })
];

const bySlug = new Map(data.map((d, i) => [d.slug, i]));
for (const p of pages) {
  if (bySlug.has(p.slug)) data[bySlug.get(p.slug)] = p;
  else data.push(p);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Upserted ${pages.length} money decision pages.`);
