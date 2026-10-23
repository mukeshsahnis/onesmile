import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { legacyRedirects } from '../src/legacy-redirects.mjs';

const site = 'https://onesmiledentalcare.com';
const readPage = (path) => readFile(new URL(`../dist${path}index.html`, import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
const pages = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.ok(pages.length > 0, 'Sitemap must contain pages');

for (const [source, destination] of Object.entries(legacyRedirects)) {
  const html = await readPage(source);
  assert.ok(html.includes(`content="0;url=${destination}"`), `${source}: missing immediate redirect`);
  assert.ok(html.includes(`rel="canonical" href="${site}${destination}"`), `${source}: incorrect canonical`);
  assert.ok(!pages.includes(`${site}${source}`), `${source}: redirect leaked into sitemap`);
  assert.ok(pages.includes(`${site}${destination}`), `${source}: destination missing from sitemap`);
  assert.ok(!Object.hasOwn(legacyRedirects, destination), `${source}: redirect chain`);
}

for (const url of pages) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, site, `${url}: incorrect origin`);
  assert.ok(parsed.pathname.endsWith('/'), `${url}: missing trailing slash`);
  const html = await readPage(parsed.pathname);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `${url}: incorrect canonical`);
  assert.ok(!/<meta[^>]+content="[^"]*noindex/i.test(html), `${url}: sitemap page is noindex`);
  assert.ok(!/http-equiv="refresh"/i.test(html), `${url}: sitemap page redirects`);
  // Catch broken links and obsolete aliases in generated content, including Markdown.
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    const target = new URL(href.replaceAll('&amp;', '&'), url);
    if (target.origin !== site || !target.pathname.endsWith('/')) continue;
    assert.ok(!Object.hasOwn(legacyRedirects, target.pathname), `${url}: links to old URL ${href}`);
    await readPage(target.pathname);
  }
}

console.log(`SEO checks passed: ${Object.keys(legacyRedirects).length} redirects and ${pages.length} canonical pages.`);
