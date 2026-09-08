const {chromium}=require('C:/Users/Semir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}), events=[];
 await page.route('**/api/metrics/',route=>{events.push(route.request().postDataJSON());return route.fulfill({json:{ok:true}})});
 await page.goto('http://127.0.0.1:5173/kontakt');
 await page.getByRole('button',{name:'Postavke privatnosti',exact:true}).waitFor();
 if(await page.getByRole('button',{name:'Prihvati',exact:true}).count())throw Error('Unexpected banner');
 await page.waitForTimeout(300);
 if(events.filter(e=>e.kind==='page_view').length!==1)throw Error('Page view not exactly once');
 const input=page.locator('form [name="email"]').first();
 await input.fill('private-test@example.com');
 await page.waitForTimeout(200);
 if(!events.some(e=>e.kind==='form_start'))throw Error('Missing form start');
 if(JSON.stringify(events).includes('private-test'))throw Error('Form value leaked');
 await page.getByRole('button',{name:'Postavke privatnosti',exact:true}).click();
 await page.getByRole('button',{name:'Odbij',exact:true}).click();
 const count=events.length;
 await input.fill('another@example.com');
 await page.waitForTimeout(200);
 if(events.length!==count)throw Error('Tracking after withdrawal');
 for(const p of JSON.parse(fs.readFileSync('content/instagram-batch-02.json','utf8'))){
   await page.goto('http://127.0.0.1:5173/blog/'+p.slug);
   await page.getByRole('heading',{name:p.title,exact:true}).waitFor();
   if(await page.locator('h1').count()!==1)throw Error('H1 '+p.slug);
 }
 await page.screenshot({path:'output/instagram-review/batch02-preview.png'});
 await page.goto('http://127.0.0.1:8011/');
 await page.route('**/admin/analytics/data/',route=>route.fulfill({contentType:'application/json',body:fs.readFileSync('output/instagram-review/metrics-check.json','utf8')}));
 await page.setContent(fs.readFileSync('output/instagram-review/metrics-check.html','utf8'));
 await page.waitForTimeout(500);
 if(await page.getByText('Statistika se ne može učitati.',{exact:false}).count())throw Error('Metrics failed to render');
 await page.screenshot({path:'output/instagram-review/metrics-preview.png'});
 console.log('Automatic default, withdrawal, no form-value leakage, single pageview and three article H1 checks passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
