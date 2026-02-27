#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'decisions.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const today = '2026-02-27';

function makeAudioScript(title, verdict, confidence, angle) {
  return `${title}? Our verdict is ${verdict.toLowerCase()}, with ${confidence}% confidence. ${angle} ` +
    `This guide focuses on decision quality, not hype. We compare opportunity, execution friction, time-to-result, and long-term optionality using the same weighted framework used across the site. ` +
    `Most people choose based on emotion, trend pressure, or fear of missing out. That usually leads to inconsistent effort and weak outcomes. ` +
    `A stronger approach is to map your constraints first: available hours, current baseline skill, budget, and the timeline for visible results. ` +
    `Then pick the path you can sustain for at least twelve focused weeks, with a simple weekly cadence and clear checkpoints. ` +
    `If your goal is employability, prioritize practical outputs: projects, case studies, and concrete artifacts that prove capability. ` +
    `If your goal is career switching, prioritize role fit and job-market demand over abstract credentials alone. ` +
    `Keep the system simple: one primary learning track, one practice loop, and one feedback channel. ` +
    `Review progress every two weeks, remove low-value activities, and double down on methods that produce measurable improvement. ` +
    `Do not optimize for complexity. Start with fundamentals, then add depth only when your current workflow is stable and producing results. ` +
    `Use clear evidence to decide your next move: better output quality, faster delivery speed, stronger confidence, and better conversion in interviews or client conversations. ` +
    `Keep your scope intentionally narrow until completion becomes predictable, because completed practical work creates more value than partially finished breadth. ` +
    `Bottom line: choose the path you can execute consistently, measure honestly, and iterate deliberately.`;
}

function entry(params) {
  return {
    status: 'published',
    slug: params.slug,
    category: 'learning',
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
    slug: 'should-i-learn-data-analytics-instead-of-coding',
    title: 'Should I Learn Data Analytics Instead of Coding?',
    relatedSlugs: [
      'should-i-learn-python-in-2026',
      'should-i-learn-ai-in-2026',
      'should-i-switch-careers-at-40',
      'how-to-start-a-side-hustle-with-no-money'
    ],
    verdict: 'Depends',
    confidence: 84,
    metaDescription: 'Should you learn data analytics instead of coding? Compare job demand, skill depth, time to employability, and career upside with a practical framework.',
    whoShould: [
      'Career switchers who want faster entry to data-driven roles',
      'Professionals strong in business context and communication',
      'People who enjoy insight generation more than software engineering',
      'Learners with limited time who need shorter ramp-up',
      'Analysts aiming to add coding gradually over time'
    ],
    whoShouldNot: [
      'People who want to build software products end-to-end',
      'Learners avoiding quantitative reasoning and spreadsheets',
      'Anyone expecting strong outcomes without portfolio projects',
      'People unwilling to learn at least basic SQL and Python eventually',
      'Those seeking guaranteed placement from learning alone'
    ],
    scorecard: [
      { factor: 'Time to Employability', weight: 9, score: 8 },
      { factor: 'Long-Term Ceiling', weight: 8, score: 7 },
      { factor: 'Entry Barrier', weight: 8, score: 8 },
      { factor: 'Transferability Across Roles', weight: 7, score: 8 },
      { factor: 'Automation Resilience', weight: 8, score: 7 },
      { factor: 'Practical Portfolio Path', weight: 7, score: 8 }
    ],
    pros: [
      { title: 'Faster route to marketable output', detail: 'Analytics learners can build dashboards and case studies quickly using SQL and BI tools.' },
      { title: 'Strong business relevance', detail: 'Analytics connects directly to revenue, retention, operations, and decision-making.' },
      { title: 'Lower initial technical barrier', detail: 'You can start with practical tools before deep software engineering concepts.' },
      { title: 'Clear freelance opportunities', detail: 'SMBs often need reporting automation and decision support.' },
      { title: 'Good bridge into AI workflows', detail: 'Analytics foundations improve prompt design, evaluation, and model output interpretation.' }
    ],
    cons: [
      { title: 'Lower engineering flexibility', detail: 'Pure analytics paths may limit options in product engineering roles.' },
      { title: 'Tool churn risk', detail: 'Dashboards and platforms change, requiring continuous adaptation.' },
      { title: 'Portfolio quality matters heavily', detail: 'Weak projects reduce differentiation in hiring markets.' },
      { title: 'Math and data literacy still required', detail: 'Statistics basics and metric design remain essential.' },
      { title: 'Can stall without coding progression', detail: 'Long-term upside improves when analytics is paired with scripting skills.' }
    ],
    risksUnderestimated: [
      'Many learners mistake tool clicking for analytical thinking.',
      'Without business framing, dashboards often fail to influence decisions.',
      'Skipping SQL fundamentals hurts long-term role mobility.'
    ],
    scenarios: [
      { title: 'Best Case', description: 'You build a focused analytics portfolio in twelve weeks, land interviews, and later add Python automation to increase role optionality and compensation.' },
      { title: 'Realistic Case', description: 'You enter via reporting and analysis tasks first, then expand into deeper analytics engineering capabilities over six to twelve months with clear progression.' },
      { title: 'Worst Case', description: 'You collect tool certificates without strong projects, struggle to prove impact, and compete in crowded entry-level pools with weak role differentiation.' }
    ],
    nextSteps: [
      { action: 'Pick one business domain and create two analytics case studies with clear problem framing and measurable outcomes.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Take a structured analytics path to cover SQL, dashboards, and storytelling in one track.', affiliateUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics', affiliateLabel: 'Start Google Data Analytics on Coursera ->', isPrimary: true },
      { action: 'Add lightweight Python for data cleaning and automation once your analytics foundation is stable.', affiliateUrl: 'https://www.coursera.org/specializations/python', affiliateLabel: 'Add Python fundamentals ->', isPrimary: false }
    ],
    faq: [
      { q: 'Is data analytics easier than coding?', a: 'Initial entry can be faster, but high-quality analytics still requires rigorous thinking and execution.' },
      { q: 'Do I need Python for analytics?', a: 'Not immediately for all roles, but it improves long-term capability and role flexibility.' },
      { q: 'Can analytics lead to AI-related roles?', a: 'Yes, analytics skills are highly relevant to AI operations, evaluation, and decision support.' },
      { q: 'What should be in an analytics portfolio?', a: 'Problem statement, dataset choices, methodology, visuals, and quantified recommendations.' },
      { q: 'Is SQL mandatory?', a: 'For most practical analytics roles, yes.' },
      { q: 'Can I freelance as a beginner analyst?', a: 'Yes, if you can show clear business outcomes and reliable delivery.' }
    ],
    sources: [
      'https://www.bls.gov/ooh/math/data-scientists.htm',
      'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm',
      'https://www.coursera.org/professional-certificates/google-data-analytics',
      'https://www.kaggle.com/'
    ],
    audioAngle: 'Analytics can be a smarter first step for many learners, especially when speed to practical output matters.'
  }),
  entry({
    slug: 'should-i-take-online-courses-or-self-study',
    title: 'Should I Take Online Courses or Self-Study?',
    relatedSlugs: [
      'should-i-learn-ai-in-2026',
      'should-i-learn-python-in-2026',
      'should-i-get-an-mba',
      'should-i-learn-data-analytics-instead-of-coding'
    ],
    verdict: 'Depends',
    confidence: 89,
    metaDescription: 'Should you take online courses or self-study? Compare structure, speed, cost, accountability, and outcomes to choose the right learning path.',
    whoShould: [
      'Learners deciding how to structure AI or coding studies',
      'People balancing budget, speed, and accountability needs',
      'Career switchers needing evidence-backed progress',
      'Professionals with limited weekly study time',
      'Students choosing between platform tracks and independent roadmaps'
    ],
    whoShouldNot: [
      'People who expect a certificate alone to create job offers',
      'Learners unwilling to build practical projects',
      'Anyone with no schedule discipline at all',
      'People who overbuy courses without execution',
      'Those avoiding feedback from peers or mentors'
    ],
    scorecard: [
      { factor: 'Learning Structure', weight: 9, score: 8 },
      { factor: 'Cost Efficiency', weight: 8, score: 7 },
      { factor: 'Execution Accountability', weight: 8, score: 8 },
      { factor: 'Customization Flexibility', weight: 7, score: 8 },
      { factor: 'Time to Consistent Progress', weight: 8, score: 8 },
      { factor: 'Proof of Capability', weight: 8, score: 7 }
    ],
    pros: [
      { title: 'Courses reduce decision overhead', detail: 'Structured syllabi can speed up execution and prevent random-topic drift.' },
      { title: 'Self-study increases flexibility', detail: 'You can tailor depth and pace to exact goals and constraints.' },
      { title: 'Hybrid path is often strongest', detail: 'Use a course for structure and self-study for project depth.' },
      { title: 'Clear milestone planning', detail: 'Weekly checkpoints improve completion rates and output quality.' },
      { title: 'Portable across domains', detail: 'The same method works for AI, Python, analytics, and adjacent skill stacks.' }
    ],
    cons: [
      { title: 'Courses can create passive consumption', detail: 'Watching videos without building projects can feel productive but deliver little value.' },
      { title: 'Self-study can become chaotic', detail: 'Without plan discipline, learners jump resources and lose momentum.' },
      { title: 'Course quality varies', detail: 'Platform reputation alone does not guarantee practical outcomes.' },
      { title: 'Credential overfocus', detail: 'Hiring outcomes usually depend more on proof of work than badges alone.' },
      { title: 'Time estimates are often optimistic', detail: 'Most learners need buffer for revision and practice loops.' }
    ],
    risksUnderestimated: [
      'Buying multiple courses can become procrastination disguised as progress.',
      'Self-study without feedback loops can lock in mistakes.',
      'Portfolio quality is the strongest signal, regardless of learning path.'
    ],
    scenarios: [
      { title: 'Best Case', description: 'You use one structured course for foundations, then self-study projects weekly, producing strong portfolio evidence and measurable career progression outcomes.' },
      { title: 'Realistic Case', description: 'You complete a practical course, continue with guided self-study, and improve steadily through iterative projects, feedback, and clearer execution habits.' },
      { title: 'Worst Case', description: 'You binge content, collect certificates, and publish no meaningful work, resulting in weak confidence, shallow capability, and limited interview traction.' }
    ],
    nextSteps: [
      { action: 'Define a twelve-week plan with one core track, one project stream, and biweekly review checkpoints.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Start with a structured platform path for accountability, then adapt with self-directed projects.', affiliateUrl: 'https://www.coursera.org/', affiliateLabel: 'Start structured online learning ->', isPrimary: true },
      { action: 'Use low-cost project-based alternatives to compare teaching style and fit before committing heavily.', affiliateUrl: 'https://www.udemy.com/', affiliateLabel: 'Compare project-based courses on Udemy ->', isPrimary: false }
    ],
    faq: [
      { q: 'Are online courses worth paying for?', a: 'They can be, if they improve execution consistency and lead to practical output.' },
      { q: 'Can self-study be enough to get hired?', a: 'Yes, if you produce strong, relevant projects and communicate your process clearly.' },
      { q: 'Should beginners start with courses?', a: 'Many do better with initial structure, then transition to guided independent practice.' },
      { q: 'How many courses should I take at once?', a: 'Usually one core course at a time is best for completion and retention.' },
      { q: 'Do certificates matter?', a: 'They can help contextually, but portfolio evidence usually matters more.' },
      { q: 'What is the best hybrid approach?', a: 'One structured track plus consistent project work and periodic feedback.' }
    ],
    sources: [
      'https://www.oecd.org/education/skills-beyond-school/',
      'https://www.coursera.org/',
      'https://www.udemy.com/',
      'https://www.edx.org/'
    ],
    audioAngle: 'The strongest learning model for most people is a hybrid: structured guidance plus deliberate project practice.'
  }),
  entry({
    slug: 'should-i-get-certifications-or-build-projects',
    title: 'Should I Get Certifications or Build Projects?',
    relatedSlugs: [
      'should-i-learn-ai-in-2026',
      'should-i-learn-python-in-2026',
      'should-i-switch-careers-at-40',
      'should-i-take-online-courses-or-self-study'
    ],
    verdict: 'Depends',
    confidence: 90,
    metaDescription: 'Should you get certifications or build projects? Compare signaling value, practical proof, hiring relevance, and time ROI in the AI era.',
    whoShould: [
      'Career switchers building credibility in new domains',
      'Learners deciding how to spend limited study hours',
      'Candidates targeting portfolio-driven roles',
      'Professionals needing stronger interview evidence',
      'People balancing signaling and practical competence'
    ],
    whoShouldNot: [
      'People expecting one certificate to replace real skill',
      'Learners avoiding public project work',
      'Anyone with no role-specific target in mind',
      'People who skip feedback and iteration',
      'Those optimizing for badges over outcomes'
    ],
    scorecard: [
      { factor: 'Hiring Signal Strength', weight: 8, score: 7 },
      { factor: 'Proof of Ability', weight: 10, score: 9 },
      { factor: 'Time ROI', weight: 8, score: 8 },
      { factor: 'Portfolio Relevance', weight: 9, score: 9 },
      { factor: 'Execution Difficulty', weight: 7, score: 7 },
      { factor: 'Long-Term Career Utility', weight: 8, score: 8 }
    ],
    pros: [
      { title: 'Projects demonstrate real capability', detail: 'Hiring teams can evaluate practical decisions, tradeoffs, and execution quality directly.' },
      { title: 'Certifications can support credibility', detail: 'In some contexts, certificates help structure and baseline trust.' },
      { title: 'Projects improve interview performance', detail: 'Concrete examples make behavioral and technical interviews stronger.' },
      { title: 'Projects compound publicly', detail: 'A visible portfolio can attract inbound opportunities over time.' },
      { title: 'Best strategy can combine both', detail: 'Targeted certifications plus strong projects often outperform either path alone.' }
    ],
    cons: [
      { title: 'Certificates can be overvalued', detail: 'Many candidates have certificates, reducing differentiation if no proof of application exists.' },
      { title: 'Projects require deeper effort', detail: 'Building useful artifacts takes planning, iteration, and communication discipline.' },
      { title: 'Poorly scoped projects underperform', detail: 'Generic or unfinished work does not create strong hiring signal.' },
      { title: 'Certification costs can add up', detail: 'Without execution, credential spending can have low return.' },
      { title: 'Portfolio maintenance is ongoing', detail: 'Projects need updates and clearer storytelling as goals evolve.' }
    ],
    risksUnderestimated: [
      'Many roles ask for evidence of impact, not course completion volume.',
      'Generic projects copied from tutorials rarely create differentiation.',
      'Lack of project narrative weakens otherwise good technical work.'
    ],
    scenarios: [
      { title: 'Best Case', description: 'You complete one relevant certification and ship three high-quality projects that clearly map to target job requirements, outcomes, and decision context.' },
      { title: 'Realistic Case', description: 'You prioritize projects first, then add selective certificates to fill gaps and improve signaling in recruiter screens and structured interviews.' },
      { title: 'Worst Case', description: 'You spend months collecting badges without shipping meaningful work, resulting in low confidence, weak proof, and poor hiring conversion rates.' }
    ],
    nextSteps: [
      { action: 'Define your target role and list the top five skills employers repeatedly request in job descriptions.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Build two role-relevant portfolio projects with clear problem, method, and measurable outcome sections.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Use one selective certificate track only where it closes a concrete skill or signal gap.', affiliateUrl: 'https://www.coursera.org/', affiliateLabel: 'Choose a targeted certification path ->', isPrimary: true }
    ],
    faq: [
      { q: 'Do recruiters care about certifications?', a: 'Sometimes, but practical project evidence is usually more persuasive.' },
      { q: 'How many projects should I build?', a: 'Two to four strong projects usually outperform many shallow ones.' },
      { q: 'Can certificates help career switchers?', a: 'Yes, especially when paired with role-relevant project outcomes.' },
      { q: 'What makes a project credible?', a: 'Clear problem framing, method choices, measurable impact, and clean communication.' },
      { q: 'Should I publish projects publicly?', a: 'In most cases yes, unless data confidentiality prevents it.' },
      { q: 'Is a portfolio better than a resume?', a: 'You generally need both, but a strong portfolio can materially improve conversion.' }
    ],
    sources: [
      'https://www.linkedin.com/business/talent/blog/talent-strategy/skills-based-hiring',
      'https://www.coursera.org/',
      'https://www.github.com/',
      'https://www.kaggle.com/'
    ],
    audioAngle: 'In most modern hiring flows, practical projects carry more weight than certificates alone.'
  }),
  entry({
    slug: 'should-i-learn-ai-without-a-technical-background',
    title: 'Should I Learn AI Without a Technical Background?',
    relatedSlugs: [
      'should-i-learn-ai-in-2026',
      'should-i-change-career-because-of-ai',
      'which-jobs-are-safest-from-ai',
      'should-i-take-online-courses-or-self-study'
    ],
    verdict: 'Yes',
    confidence: 88,
    metaDescription: 'Can you learn AI without a technical background? Yes. Compare entry paths, practical skills, timelines, and realistic expectations for non-technical learners.',
    whoShould: [
      'Non-technical professionals who want AI literacy and practical leverage',
      'Career switchers exploring AI-adjacent roles',
      'Managers and operators adopting AI in workflow decisions',
      'Creators and freelancers improving productivity with AI tools',
      'Beginners willing to learn consistently with practical exercises'
    ],
    whoShouldNot: [
      'People expecting immediate expert-level outcomes',
      'Learners unwilling to practice with real use cases weekly',
      'Anyone avoiding fundamentals like data quality and evaluation',
      'People who want coding-heavy ML roles without technical progression',
      'Those relying only on tool demos and hype content'
    ],
    scorecard: [
      { factor: 'Accessibility for Beginners', weight: 9, score: 9 },
      { factor: 'Practical Near-Term Value', weight: 9, score: 8 },
      { factor: 'Career Optionality', weight: 8, score: 8 },
      { factor: 'Technical Barrier', weight: 8, score: 7 },
      { factor: 'Execution Consistency Need', weight: 7, score: 8 },
      { factor: 'Long-Term Upside', weight: 8, score: 8 }
    ],
    pros: [
      { title: 'High leverage for non-technical roles', detail: 'AI literacy improves output quality, speed, and decision support in many functions.' },
      { title: 'Start without deep coding', detail: 'You can build practical capability through workflow design, prompting, and evaluation.' },
      { title: 'Strong career resilience benefits', detail: 'AI fluency increasingly differentiates professionals across industries.' },
      { title: 'Clear progression path', detail: 'Beginners can move from usage to automation to deeper technical skills over time.' },
      { title: 'Portfolio opportunities still exist', detail: 'Documented before-and-after process improvements can serve as proof of capability.' }
    ],
    cons: [
      { title: 'Hype can distort expectations', detail: 'Many learners overestimate short-term gains and underestimate practice needed.' },
      { title: 'Concept gaps can create errors', detail: 'Without fundamentals, output quality and trust calibration can suffer.' },
      { title: 'Tool changes are frequent', detail: 'Workflows require periodic adaptation as capabilities evolve.' },
      { title: 'Depth ceiling without technical growth', detail: 'Some advanced paths eventually require coding and model understanding.' },
      { title: 'Inconsistent practice limits results', detail: 'One-off experimentation rarely creates durable skill.' }
    ],
    risksUnderestimated: [
      'Prompting alone is not a full capability stack.',
      'Weak evaluation habits can lead to confident but wrong decisions.',
      'Without domain context, AI outputs are harder to trust operationally.'
    ],
    scenarios: [
      { title: 'Best Case', description: 'You build AI literacy quickly, apply it to real workflows, and show measurable productivity gains that improve career leverage within months.' },
      { title: 'Realistic Case', description: 'You become a strong AI-enabled professional, then add technical depth gradually as your goals, context, and confidence evolve over time.' },
      { title: 'Worst Case', description: 'You consume AI content passively, skip structured practice, and gain little practical value despite high perceived activity, effort, and enthusiasm.' }
    ],
    nextSteps: [
      { action: 'Start with one practical workflow and measure time and quality before and after AI adoption.', affiliateUrl: '', affiliateLabel: '', isPrimary: false },
      { action: 'Take a non-technical AI foundations course with clear weekly assignments and practical examples.', affiliateUrl: 'https://www.coursera.org/learn/ai-for-everyone', affiliateLabel: 'Start AI foundations for non-technical learners ->', isPrimary: true },
      { action: 'Document three real AI-assisted outputs to create proof of capability for your current role or next move.', affiliateUrl: '', affiliateLabel: '', isPrimary: false }
    ],
    faq: [
      { q: 'Can non-technical people really learn AI?', a: 'Yes, many can create meaningful value without advanced coding at the start.' },
      { q: 'Do I need math to begin?', a: 'Not for practical literacy paths; math depth can come later if needed.' },
      { q: 'How long until I see results?', a: 'Many people see workflow improvements within weeks when practice is consistent.' },
      { q: 'Should I learn coding eventually?', a: 'If you want deeper technical roles, yes; for many business roles, optional at first.' },
      { q: 'What should I practice first?', a: 'Prompt design, output evaluation, and workflow integration with clear quality checks.' },
      { q: 'How do I prove AI skills to employers?', a: 'Show measurable before-and-after outcomes and reproducible process documentation.' }
    ],
    sources: [
      'https://www.coursera.org/learn/ai-for-everyone',
      'https://www.weforum.org/reports/the-future-of-jobs-report-2025/',
      'https://www.oecd.org/employment/skills-for-the-digital-transition.htm',
      'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai'
    ],
    audioAngle: 'Non-technical learners can gain major upside from AI by focusing on practical workflows and consistent execution.'
  })
];

const bySlug = new Map(data.map((d, i) => [d.slug, i]));
for (const p of pages) {
  if (bySlug.has(p.slug)) data[bySlug.get(p.slug)] = p;
  else data.push(p);
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Upserted ${pages.length} learning pages.`);
