#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://yournextstep.ai';
const SLOT_WHITELIST = new Set(['top-of-content', 'mid', 'footer']);
const PROD_MODE = process.argv.includes('--prod');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    }).on('error', reject);
  });
}

function validateHtmlBasics(filePath) {
  const html = read(filePath);
  assert(/<link rel="canonical" href="https:\/\/yournextstep\.ai\//.test(html), `${filePath}: canonical is missing/relative`);
  assert(/<meta property="og:url" content="https:\/\/yournextstep\.ai\//.test(html), `${filePath}: og:url missing absolute URL`);
  assert(/<meta property="og:image" content="https:\/\/yournextstep\.ai\/og-default\.png">/.test(html), `${filePath}: og:image should point to absolute PNG`);
  assert(/<meta name="twitter:image" content="https:\/\/yournextstep\.ai\/og-default\.png">/.test(html), `${filePath}: twitter:image should point to absolute PNG`);
}

function validateAffiliateLinks(filePath) {
  const html = read(filePath);
  const links = [...html.matchAll(/<a [^>]*data-affiliate="true"[^>]*>/g)];
  for (const match of links) {
    const tag = match[0];
    assert(/rel="[^"]*sponsored[^"]*nofollow[^"]*"/.test(tag), `${filePath}: affiliate link missing sponsored+nofollow rel`);
    const slotMatch = tag.match(/data-slot="([^"]+)"/);
    assert(slotMatch, `${filePath}: affiliate link missing data-slot`);
    assert(SLOT_WHITELIST.has(slotMatch[1]), `${filePath}: unexpected data-slot "${slotMatch[1]}"`);
  }
}

function runLocalChecks() {
  assert(fs.existsSync(path.join(DIST, 'robots.txt')), 'dist/robots.txt missing');
  assert(fs.existsSync(path.join(DIST, 'sitemap.xml')), 'dist/sitemap.xml missing');
  assert(fs.existsSync(path.join(DIST, 'og-default.png')), 'dist/og-default.png missing');

  const home = path.join(DIST, 'index.html');
  const bestOf = path.join(DIST, 'best-of', 'index.html');
  const decision = path.join(DIST, 'should-i-learn-ai-in-2026', 'index.html');

  [home, bestOf, decision].forEach((p) => assert(fs.existsSync(p), `${p} missing`));
  [home, bestOf, decision].forEach(validateHtmlBasics);
  validateAffiliateLinks(decision);

  const robots = read(path.join(DIST, 'robots.txt'));
  assert(/Sitemap: https:\/\/yournextstep\.ai\/sitemap\.xml/.test(robots), 'robots.txt sitemap URL invalid');

  const sitemap = read(path.join(DIST, 'sitemap.xml'));
  assert(sitemap.includes('<loc>https://yournextstep.ai/best-of/</loc>'), 'sitemap missing /best-of/');
}

async function runProdChecks() {
  const targets = ['/robots.txt', '/sitemap.xml', '/best-of/'];
  for (const t of targets) {
    const { status } = await fetchText(`${SITE_URL}${t}`);
    assert(status >= 200 && status < 400, `prod check failed for ${t} (${status})`);
  }
}

async function main() {
  runLocalChecks();
  if (PROD_MODE) await runProdChecks();
  console.log('release-gate: OK');
}

main().catch((err) => {
  console.error('release-gate: FAILED');
  console.error(err.message);
  process.exit(1);
});
