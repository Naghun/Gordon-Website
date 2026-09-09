const {chromium}=require('C:/Users/Semir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const posts=JSON.parse(fs.readFileSync('content/instagram-batch-03.json','utf8'));
  for(const post of posts){
   await page.goto('http://127.0.0.1:5173/blog/'+post.slug);
   await page.getByRole('heading',{level:1,name:post.title,exact:true}).waitFor();
   if(await page.locator('h1').count()!==1)throw Error('H1 count');
   await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager'));
   await page.waitForFunction(()=>[...document.images].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0));
   const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,text:document.body.innerText}));
   if(result.overflow)throw Error('Overflow '+post.slug);
   if(result.text.includes('## '))throw Error('Markdown not rendered');
   await page.screenshot({path:'output/instagram-review/'+post.slug+'.png',fullPage:true});
   await page.setViewportSize({width:390,height:844});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
   await page.setViewportSize({width:1440,height:1000});
   console.log('Passed H1, images and responsive layout: '+post.slug);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
