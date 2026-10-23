import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
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
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `${url}: expected one H1`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  if (parsed.pathname !== '/') {
    const breadcrumbs = schemas.find(schema => schema['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumbs, `${url}: missing breadcrumb schema`);
    assert.equal(breadcrumbs.itemListElement.at(-1).item, url, `${url}: incorrect breadcrumb destination`);
    for (const [index, item] of breadcrumbs.itemListElement.entries()) {
      assert.equal(item.position, index + 1);
      assert.ok(pages.includes(item.item), `${url}: breadcrumb destination is missing`);
    }
  }
  for (const [image] of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image, /width="[1-9][0-9]*"/, `${url}: image missing width`);
    assert.match(image, /height="[1-9][0-9]*"/, `${url}: image missing height`);
    const source = image.match(/src="([^"]+)"/)?.[1];
    if (source?.startsWith('/')) {
      assert.ok(source.startsWith('/_astro/'), `${url}: unoptimized local image`);
      assert.match(image, /srcset="[^"]+"/, `${url}: missing responsive sources`);
      for (const asset of image.matchAll(/(\/_astro\/[^" ,]+\.webp)/g)) {
        await stat(new URL(`../dist${asset[1]}`, import.meta.url));
      }
    }
  }
  // Catch broken links and obsolete aliases in generated content, including Markdown.
  for (const [, href] of html.matchAll(/href="([^"#]+)"/g)) {
    const target = new URL(href.replaceAll('&amp;', '&'), url);
    if (target.origin !== site || !target.pathname.endsWith('/')) continue;
    assert.ok(!Object.hasOwn(legacyRedirects, target.pathname), `${url}: links to old URL ${href}`);
    await readPage(target.pathname);
  }
}

// Public compatibility copies must remain byte-for-byte intact after migration.
for (const file of await readdir(new URL('../src/assets/', import.meta.url), { recursive: true })) {
  if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;
  const original = await readFile(new URL(`../src/assets/${file}`, import.meta.url));
  const publicCopy = await readFile(new URL(`../dist/${file}`, import.meta.url));
  assert.ok(original.equals(publicCopy), `${file}: legacy public image changed or disappeared`);
}

console.log(`SEO checks passed: ${Object.keys(legacyRedirects).length} redirects and ${pages.length} canonical pages.`);
