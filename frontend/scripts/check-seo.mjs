import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { businessSchema } from '../src/config/business.js';
import { faqs } from '../src/config/faqs.js';
import { services, serviceSections } from '../src/content/services.js';
const read = p => readFile(new URL(p, import.meta.url), 'utf8');
const posts = JSON.parse(await read('../../content/published-blog.json'));
const xml = await read('../dist/sitemap.xml');
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length, new Set(urls).size, 'Sitemap duplicates');
assert.equal(urls.filter(url=>url.includes('/blog/')).length, posts.length);
assert.ok(!urls.some(url=>url.includes('dashboard') || url.endsWith('/404')));
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
for (const url of urls) {
  const path = new URL(url).pathname;
  const html = await read(path === '/' ? '../dist/index.html' : `../dist/seo-pages${path}.html`);
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  assert.equal(blocks.length,1, `Schema count: ${path}`);
  const graph = JSON.parse(blocks[0][1])['@graph'];
  const entity = graph.find(node=>node['@type']==='LocalBusiness');
  for(const [key,value] of Object.entries(businessSchema())) assert.deepEqual(entity[key],value,`${path}: ${key}`);
  assert.ok(!html.includes('info@gordondm.com'), `Outdated email: ${path}`);
  assert.ok(html.includes(`rel="canonical" href="${url}"`),`Canonical: ${path}`);
  if(path==='/faq') assert.equal(graph.find(n=>n['@type']==='FAQPage').mainEntity.length,faqs.length);
  if(path.startsWith('/blog/')) {
    const post=posts.find(p=>path===`/blog/${p.slug}`);
    assert.ok(post);
    assert.ok(html.includes(`<h1>${escape(post.title)}</h1>`));
    // Compare every content paragraph, including internal markdown link rendering.
    for(const block of post.content.split(/\n\n+/).filter(Boolean)) {
      const expected=escape(block.replace(/^## /,'')).replace(/\[([^\]]+)\]\((\/[a-z0-9/-]*)\)/g,'<a href="$2">$1</a>');
      assert.ok(html.includes(expected), `Missing published paragraph: ${path}`);
    }
    const article=graph.find(n=>n['@type']==='BlogPosting');
    assert.equal(article.headline,post.title);
    assert.equal(article.datePublished,post.published_at);
    assert.equal(article.mainEntityOfPage['@id'],url);
    assert.ok(!article.image.includes('127.0.0.1') && !article.image.includes('localhost'));
    if(post.cover_image) assert.ok(article.image.startsWith('https://gordon.ba/backend/media/'));
  }
}
console.log(`SEO checks passed: ${urls.length} URLs, ${posts.length} complete articles, shared business data and ${faqs.length} FAQs.`);
assert.equal(services.length, 12);
for (const category of ['marketing', 'softver-rjesenja']) {
  const group = services.filter(s=>s.category===category);
  assert.equal(group.length, 6);
  const parent = await read(`../dist/seo-pages/${category}.html`);
  for (const service of group) assert.ok(parent.includes(`href="${service.path}"`), `Missing category link: ${service.path}`);
}
for (const service of services) {
  const html = await read(`../dist/seo-pages${service.path}.html`);
  const count = [...service.sections.flatMap(s=>s.paragraphs), ...service.faqs.map(f=>f.answer)].join(' ').trim().split(/\s+/u).length;
  assert.ok(count >= 1000, `${service.path}: only ${count} words`);
  assert.equal((html.match(/<h1>/g)||[]).length, 1);
  assert.ok(html.includes(`<h1>${escape(service.title)}</h1>`));
  assert.ok(urls.includes(`https://gordon.ba${service.path}`));
  for (const [, paragraph] of serviceSections(service)) assert.ok(html.includes(escape(paragraph)), `Incomplete service content: ${service.path}`);
  const graph = JSON.parse(html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph.find(s=>s['@type']==='Service').name, service.title);
  assert.equal(graph.find(s=>s['@type']==='BreadcrumbList').itemListElement.length, 3);
  assert.ok(!graph.some(s=>s['@type']==='Product'), 'Services must not invent product offers');
}
console.log('Service checks passed: 12 complete pages, 6 per category, 1000+ words each, category links and Service schema.');
