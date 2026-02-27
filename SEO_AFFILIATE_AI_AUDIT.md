# SEO + Affiliate + AI Audit (2026-02-27)

## Executive Summary
- Stack: egen Node-basert statisk generator (`build.js`) som genererer HTML til `dist/` (SSR/SSG-lignende output, ikke CSR-kritisk innhold).
- Crawlbarhet er god: innhold, metadata og interne lenker er server-generert i HTML.
- Baseline: Lighthouse i dette miljøet feilet i cleanup-fasen (Windows EPERM i temp-katalog), men audit-kjøring viste tydelig LCP/FCP-risiko på mobil (~4.5s).
- Teknisk SEO var delvis godt implementert (title, description, canonical, sitemap, robots, Breadcrumb/Article/FAQ).
- Hovedgap lukket i denne PR-en: global Organization/WebSite schema, bedre OG/Twitter metadata, canonical host redirect, affiliate-slot instrumentering og affiliate click-events.
- Affiliate-compliance er styrket: konsekvent `rel="sponsored nofollow"` + maskinlesbare slot/merchant-felter for CTR-måling.
- Ingen black-hat mønstre implementert (ingen cloaking, forced clicks, doorway pages, skjult tekst).
- Ingen innholds-copy er redigert i kildedata; kun tekniske rammer og metadata.

## Rekognosering
- Bygg/stack: Node SSG i [`build.js`](/c:/yournextstep/build.js).
- Routing: statiske paths med mapper (`/slug/`), kategoriarkiver, trust pages og `404.html`.
- Metadata-kilde: genereres sentralt i `shell()` i [`build.js`](/c:/yournextstep/build.js).
- Money pages: 19/20 publiserte sider har minst én affiliate-lenke (kartlagt fra `data/decisions.json`).

## Baseline Måling (lokalt)
- Build: `npm.cmd run build` OK (20 publiserte sider, 0 reject, 0 warnings).
- Lighthouse:
  - Forsøkt via `lighthouse` og `@lhci/cli` lokalt mot `http://localhost:4173`.
  - Miljøfeil: EPERM ved opprydding av temp-dir i Chrome/Lighthouse (Windows), som hindret full JSON-output i dette miljøet.
  - Delresultat observert i kjøring: `First Contentful Paint ~4.5s`, `Largest Contentful Paint ~4.5s` (hjemmeside, mobil emulering).
- CWV-risiko (teknisk vurdering):
  - LCP-risiko: hero-området + render-blocking CSS (`/style.css`) på first paint.
  - CLS-risiko: lav/moderat (ingen tunge bilder i fold, men dynamiske UI-komponenter finnes).
  - INP-risiko: moderat/lav (lite JS, men global listeners og søke-UI).
  - TTFB: avhenger av hosting/CDN, ikke app-kode.
- Crawlbarhet:
  - Kritisk innhold er HTML-generert ved build (ikke JS-avhengig), som er bra for indeks.

## Funn Med Evidens
- Metadata manglet Twitter/utvidet OG-felt:
  - Lagt til i [`build.js:239`](/c:/yournextstep/build.js:239), [`build.js:263`](/c:/yournextstep/build.js:263).
- Manglet global entity-schema for siterbarhet i AI-svar:
  - Lagt til `Organization` + `WebSite` i [`build.js:215`](/c:/yournextstep/build.js:215), [`build.js:226`](/c:/yournextstep/build.js:226).
- Article-schema forbedret for klarere entities:
  - `@id`, `mainEntityOfPage`, publisher-logo, image i [`build.js:183`](/c:/yournextstep/build.js:183).
- Affiliate-lenker hadde compliance-attributter, men manglet målingsdimensjoner per slot:
  - Slot/merchant/item/page data lagt på CTA i [`build.js:580`](/c:/yournextstep/build.js:580).
- Affiliate-CTR instrumentering manglet:
  - `affiliate_click` event lagt til i [`script.js:330`](/c:/yournextstep/script.js:330).
- Canonical host redirect manglet i Netlify-konfig:
  - `www -> apex` 301 i [`netlify.toml:5`](/c:/yournextstep/netlify.toml:5).
- Cache hints for statiske assets manglet:
  - Immutable cache headers i [`netlify.toml:12`](/c:/yournextstep/netlify.toml:12).

## Prioritert Tiltaksliste

### Høy
- Metadata + schema-forbedringer (implementert)
  - Effekt: høy (bedre SERP-snippets, bedre AI-entitetsforståelse).
  - Risiko: lav.
  - Innsats: lav.
  - Hvordan: utvidet `shell()` + globale JSON-LD blokker.
- Affiliate CTR-instrumentering (implementert)
  - Effekt: høy (målebarhet per slot/merchant).
  - Risiko: lav.
  - Innsats: lav.
  - Hvordan: `data-*` på CTA + `affiliate_click` events i JS.
- Canonical host redirect + cache headers (implementert)
  - Effekt: høy/moderat (teknisk SEO + perf).
  - Risiko: lav.
  - Innsats: lav.
  - Hvordan: Netlify redirects/headers.

### Medium
- Lighthouse i stabil CI-runner (anbefalt neste steg)
  - Effekt: moderat/høy (målbar CWV-oppfølging).
  - Risiko: lav.
  - Innsats: medium.
  - Hvordan: kjør LHCI i Linux CI for å unngå lokal Windows EPERM.
- Internlenk hubs (“best of”, sammenligningssider) (innholdsarbeid)
  - Effekt: moderat/høy.
  - Risiko: lav.
  - Innsats: medium.
  - Hvordan: egne hub-sider med tydelig cluster-struktur.

### Lav
- Hreflang-ekspansjon ved faktisk flerspråklig innhold
  - Effekt: lav nå, høy senere.
  - Risiko: lav.
  - Innsats: medium.
  - Hvordan: locale-spesifikke URLer + alternate hreflang-krysskobling.

## Affiliate-CTR Anbefalinger (plasseringer/komponenter)
- Standardiserte slots nå tilgjengelig i tracking: `top-of-content`, `mid`, `footer` via [`build.js:161`](/c:/yournextstep/build.js:161).
- Mål CTR per:
  - `page_path`
  - `slot`
  - `merchant`
  - `item_id` / `item_title`
- Komponentstandard i kode:
  - Konsistent CTA-klasser + `rel="sponsored nofollow noopener noreferrer"` i [`build.js:580`](/c:/yournextstep/build.js:580).
  - Tydelig aria-navn med kontekst per lenke.
- Innholdsarbeid (ikke auto-endret): test færre, mer relevante CTAer og tabellformat på høy-intensjonssider.

## AI-Trafikk Anbefalinger (schema/struktur/entiteter)
- Implementert:
  - `Organization` + `WebSite` globalt.
  - `Article` utvidet med `@id`, `mainEntityOfPage`, `image`, `publisher.logo`.
  - `BreadcrumbList` og `FAQPage` videreført når relevant.
- Anbefalt videre:
  - Bygg entity-konsistens i innhold (forfatter/prosess/siterbare kilder per side).
  - Legg til `sameAs` i Organization når offisielle profiler finnes.
  - Kun bruk `Product/Review/AggregateRating` ved verifiserbare reelle data.

## Money Pages (affiliate)
- Publiserte sider: 20
- Sider med affiliate-lenke: 19
- Eksempler:
  - `/should-i-learn-ai-in-2026/`
  - `/should-i-start-an-online-business/`
  - `/should-i-start-a-dropshipping-business/`
  - `/should-i-start-an-ecommerce-store/`
  - `/should-i-learn-coding-in-the-ai-era/`

## Verifiserings-sjekkliste før deploy
- [ ] `npm.cmd run build` er grønn.
- [ ] Sjekk at `dist/*/index.html` har unik `title`, `meta description`, `canonical`, `h1`.
- [ ] Sjekk `dist/robots.txt` og `dist/sitemap.xml` etter build.
- [ ] Sjekk at affiliate CTA har `rel="sponsored nofollow"` og `data-slot`.
- [ ] Sjekk at klikk på affiliate CTA utløser `affiliate_click` i analytics eller dev console.
- [ ] Sjekk at `Organization` + `WebSite` + `Article` + `Breadcrumb` JSON-LD validerer.
- [ ] Sjekk `www -> apex` redirect i Netlify preview.
- [ ] Kjør Lighthouse i CI (Linux) for stabile numeriske baseline-scorer.
