const {chromium}=require('C:/Users/Semir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1800,height:1200}});
 await page.route('**/admin/analytics/data/',r=>r.fulfill({contentType:'application/json',body:fs.readFileSync('output/instagram-review/metrics-check.json','utf8')}));
 await page.goto('http://127.0.0.1:8011/');
 await page.setContent(fs.readFileSync('output/instagram-review/dashboard-check.html','utf8'));
 await page.waitForSelector('.metric-bars');
 const layout=await page.evaluate(()=>{const b=s=>document.querySelector(s).getBoundingClientRect();const a=b('.dashboard-admin-column'),o=b('.dashboard-overview-column'),c=b('.dashboard-charts-column'),r=b('#content-related');return {columns:a.right<=o.left&&o.right<=c.left,recentBelow:r.top>=Math.max(a.bottom,o.bottom,c.bottom),overflow:document.documentElement.scrollWidth>innerWidth}});
 if(!layout.columns||!layout.recentBelow||layout.overflow)throw Error(JSON.stringify(layout));
 await page.screenshot({path:'output/instagram-review/dashboard-three-columns.png',fullPage:true});
 await page.goto('http://127.0.0.1:5173/blog');await page.locator('.blog-topic-nav').waitFor();
 await page.getByRole('button',{name:/Općenito/}).click();await page.getByRole('link',{name:/Global Kviz/}).first().waitFor();
 await page.screenshot({path:'output/instagram-review/blog-categories.png'});
 console.log('Three columns, recent actions below, charts and general category passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
