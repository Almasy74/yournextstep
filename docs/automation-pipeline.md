# Content Automation Pipeline

## Overview

Generate topics → Analyze → Write audio script → TTS → Publish → Internal link → Sitemap → QA

---

## Pipeline Steps

### 1. Topic Generation
- Source: `data/topics.json` (200 long-tail slugs, organized by category)
- Expansion: Use Google Trends, Ahrefs, or AnswerThePublic to find new "Should I ___?" queries
- Cadence: Add 20 new topics per week, prioritized by search volume and intent

### 2. Decision Analysis Generation
- Input: Topic slug + category
- Output: Complete JSON entry matching `data/decisions.json` schema
- AI prompt must include:
  - Category context and tone guidelines
  - Minimum requirements (4+ pros/cons, 6+ scorecard factors, 5+ FAQ, 250–450 word audio script)
  - Instruction to cite specific, verifiable sources
  - YMYL disclaimer requirements for money-decisions category
- Review: Human spot-check on every 5th page

### 3. Audio Script → TTS
- Provider: OpenAI TTS (alloy voice) or ElevenLabs
- Format: MP3, mono, 128kbps
- Duration target: 2–4 minutes
- Output: Store in `/audio/{slug}.mp3`
- Update `audio.audioUrl` and `audio.durationSec` in decisions.json

### 4. Build & Publish
```bash
node build.js
```
- QA gate automatically rejects non-conforming pages
- Review `dist/build-report.json` for rejected entries
- Deploy to Netlify: `git push` triggers auto-build

### 5. Internal Linking
- Each page has `relatedSlugs` (manually curated, 2–5 per page)
- Category pages auto-link to all pages in that category
- Cross-category links via "Related Decisions" section

### 6. Sitemap Update
- Automatic: `build.js` regenerates `sitemap.xml` on every build
- Submit to Google Search Console after major batches

---

## QA Rules (Anti-Hallucination)

### Hard Rules (build.js enforces)
| Rule | Threshold |
|------|-----------|
| Confidence range | 0–100 |
| Pros minimum | 4 |
| Cons minimum | 4 |
| Scorecard factors minimum | 6 |
| FAQ questions minimum | 5 |
| Audio script word count | 100+ |
| Verdict value | Yes / No / Depends |
| Status | must be "published" |

### Soft Rules (human review)
- Sources must be verifiable (Google the source name)
- No specific stock/crypto/investment recommendations in money-decisions
- Pros and cons must be non-generic (not just "it's good" / "it's bad")
- Scenarios must include specific numbers (salary, timeframes, costs)
- FAQ answers must be 2+ sentences with actionable information
- Audio script must summarize key points, not just repeat the page
- Uniqueness: >60% unique trigrams vs. other pages in same category

### Review Triggers (require human review before publishing)
- Confidence > 95% or < 30% (suspicious extremes)
- money-decisions category (YMYL)
- Any mention of specific companies, products, or financial instruments
- Pages with 0 affiliate links (may indicate missing monetization)
- Pages with 4+ affiliate links (may indicate over-monetization)
