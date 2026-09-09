const {chromium}=require('C:/Users/Semir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.route('**/admin/notifications/feed/',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({count:7,items:[]})}));
await page.goto('http://127.0.0.1:8011/');
await page.setContent(fs.readFileSync('output/instagram-review/blog-editor-check.html','utf8'));
await page.locator('.gordon-editor').first().waitFor();
await page.locator('#id_title').fill('AI agenti za firme');
await page.locator('#id_content').fill('Uvod u naš novi članak.\n\n## Razgovor i zakazivanje\n\nJasan tekst za čitaoce.');
await page.getByRole('button',{name:'Pregled',exact:true}).first().click();
await page.locator('.gordon-editor-preview h2').first().waitFor();
await page.waitForFunction(()=>document.querySelector('.admin-notification-count').textContent==='7');
await page.screenshot({path:'output/instagram-review/blog-editor.png',fullPage:true});
await page.getByRole('button',{name:'Piši',exact:true}).first().click();
if(!(await page.locator('#id_content').inputValue()).includes('## Razgovor'))throw Error('Content altered');
console.log('Editor preview, content preservation and notification badge passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
