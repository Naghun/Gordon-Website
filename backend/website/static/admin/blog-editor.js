(() => {
 function init(){
  ['content','content_en','content_de'].forEach(name=>{
   const field=document.getElementById(`id_${name}`);if(!field)return;
   const box=document.createElement('div');box.className='gordon-editor';field.before(box);
   const toolbar=document.createElement('div');toolbar.className='gordon-editor-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Uređivanje članka');
   const preview=document.createElement('div');preview.className='gordon-editor-preview';preview.hidden=true;
   const count=document.createElement('div');count.className='gordon-editor-count';
   box.append(toolbar,field,preview,count);
   function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;toolbar.append(b);return b}
   function render(){
    preview.replaceChildren();
    field.value.split(/\n\n+/).filter(Boolean).forEach(block=>{const node=document.createElement(block.startsWith('## ')?'h2':'p');node.textContent=block.replace(/^## /,'');preview.append(node)});
    count.textContent=`${field.value.trim().split(/\s+/).filter(Boolean).length} riječi · Naslov članka je automatski H1`;
   }
   function insert(text){field.hidden=false;preview.hidden=true;edit.setAttribute('aria-pressed','true');view.setAttribute('aria-pressed','false');field.focus();field.setRangeText(text,field.selectionStart,field.selectionEnd,'end');field.dispatchEvent(new Event('input',{bubbles:true}));}
   const edit=button('Piši',()=>{field.hidden=false;preview.hidden=true;edit.setAttribute('aria-pressed','true');view.setAttribute('aria-pressed','false')});edit.setAttribute('aria-pressed','true');
   const view=button('Pregled',()=>{render();field.hidden=true;preview.hidden=false;edit.setAttribute('aria-pressed','false');view.setAttribute('aria-pressed','true')});view.setAttribute('aria-pressed','false');
   button('H2 · Podnaslov',()=>insert(`\n\n## ${field.value.slice(field.selectionStart,field.selectionEnd)||'Podnaslov'}\n\n`));
   button('Link',()=>{const label=field.value.slice(field.selectionStart,field.selectionEnd)||'Naziv linka';const url=prompt('Adresa linka (https://… ili /kontakt):','/kontakt');if(url&&/^(https?:\/\/|\/(?!\/))[^\s)]+$/.test(url))insert(`[${label}](${url})`)});
   field.addEventListener('input',render);render();
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
