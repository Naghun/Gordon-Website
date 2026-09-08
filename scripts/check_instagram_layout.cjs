const { chromium } = require('C:/Users/Semir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:8011/');
  await page.setContent(fs.readFileSync('output/instagram-review/admin-check.html','utf8'));
  await page.waitForLoadState('networkidle');
  const layout = await page.evaluate(() => {
    const search = document.querySelector('#toolbar').getBoundingClientRect();
    const table = document.querySelector('#changelist-form').getBoundingClientRect();
    return {searchAboveTable:search.bottom <= table.top + 1,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  if (!layout.searchAboveTable || layout.overflow) throw new Error(JSON.stringify(layout));
  await page.screenshot({path:'output/instagram-review/admin-desktop.png'});
  const posts = JSON.parse(fs.readFileSync('content/instagram-batch-01.json','utf8'));
  for (const post of posts) {
    await page.goto('http://127.0.0.1:5173/blog/'+post.slug);
    await page.waitForSelector('.blog-article-content, .blog-detail-content, .blog-article-body, .blog-content', {timeout:2000}).catch(()=>{});
    await page.getByRole('heading',{name:post.title, exact:true}).waitFor();
    if (await page.locator('h1').count() !== 1) throw new Error('H1 count: '+post.slug);
    await page.screenshot({path:'output/instagram-review/'+post.slug+'.png',fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'output/instagram-review/blog-mobile.png',fullPage:true});
  console.log('Admin layout, three article H1s and screenshots passed');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
