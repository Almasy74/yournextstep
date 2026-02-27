# PR: SEO + AI Visibility + Affiliate CTR Instrumentation

## Hva er endret
- Utvidet metadata i `shell()`:
  - OpenGraph: `og:site_name`, `og:locale`, fleksibel `og:type`, `og:image`.
  - Twitter cards: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
  - `author` meta.
  - `og:image` satt til absolutt PNG (`https://yournextstep.ai/og-default.png`) med type + dimensjoner.
- Lagt til global schema:
  - `Organization` og `WebSite` på alle sider.
- Forbedret `Article` schema:
  - `@id`, `mainEntityOfPage`, `publisher.logo`, `image`.
- Affiliate-komponent forbedret:
  - CTA får standard `rel="sponsored nofollow noopener noreferrer"` (videreført).
  - Lagt til målefelter: `data-affiliate`, `data-slot`, `data-merchant`, `data-page-path`, `data-item-id`, `data-item-title`.
  - Bedre aria-label med merchant + kontekst.
- Event tracking for affiliate-CTR:
  - Ny event: `affiliate_click`.
  - Parametere: `{ url, merchant, page_path, slot, item_id, item_title }`.
  - Deduplisering: guard mot dobbeltsending ved raske/nestede klikk.
  - Consent-gating: tracking sendes kun ved eksplisitt analytics-enable (`window.ynsConsent.analytics=true` eller `window.ynsEnableAnalytics=true`).
  - Integrasjoner: `gtag`, `plausible`, `matomo(_paq)`, `segment(analytics.track)`.
  - Fallback: custom event bus `yournextstep:affiliate_click` + dev console log.
- Infrastruktur:
  - Ny `og-default.png` (1200x630) + `og-default.svg`, begge kopieres til `dist/`.
  - Netlify: `www -> apex` 301 redirect + immutable cache headers for statiske assets.
- Internlenking:
  - Ny hub-side: `/best-of/`.
  - Lagt inn internlenker til huben i nav/footer/homepage/decisionsider.
- Kvalitetsgate i CI:
  - Ny release-gate script for metadata/schema/affiliate-attributter.
  - Ny GitHub Actions workflow med Linux-basert Lighthouse CI.

## Hvordan verifisere
1. Kjør build:
   - `npm.cmd run build`
2. Verifiser metadata/schema:
   - Åpne `dist/index.html` og en decisionside.
   - Sjekk at OG/Twitter-felter finnes.
   - Sjekk JSON-LD for `Organization`, `WebSite`, `Article`, `BreadcrumbList` (og `FAQPage` når relevant).
3. Verifiser affiliate-attributter:
   - På en side med affiliate CTA: sjekk at lenken har
     - `rel="sponsored nofollow noopener noreferrer"`
     - `data-slot`, `data-merchant`, `data-item-id`.
4. Verifiser event tracking:
   - I browser devtools, klikk på affiliate CTA.
   - Bekreft at `affiliate_click` sendes til aktiv analytics-provider.
   - Uten provider: bekreft `window`-event `yournextstep:affiliate_click` (og console log lokalt).
5. Verifiser redirects/cache i Netlify preview:
   - `https://www.yournextstep.ai/...` skal 301 til apex.
   - CSS/JS/svg/audio skal få `Cache-Control: public, max-age=31536000, immutable`.

## Notater
- Ingen innholdscopy i `data/decisions.json` er endret.
- Ingen nye tunge runtime-avhengigheter lagt til.
- Lighthouse lokalt i dette miljøet har ustabil cleanup-feil (Windows EPERM), derfor anbefales CI-baseline på Linux.
