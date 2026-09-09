(() => {
  document.querySelectorAll('[data-metrics-url]').forEach(root => {
    if(root.dataset.started)return;root.dataset.started='true';
    function table(headers,rows){const box=document.createElement('div');box.className='metrics-scroll';const t=document.createElement('table');const tr=document.createElement('tr');headers.forEach(h=>{const th=document.createElement('th');th.textContent=h;tr.append(th)});t.append(tr);(rows.length?rows:[['Još nema podataka']]).forEach(row=>{const r=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value ?? '—';r.append(td)});t.append(r)});box.append(t);return box}
    async function refresh(){if(document.hidden)return;try{
      const response=await fetch(root.dataset.metricsUrl,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error();const d=await response.json();
      root.querySelector('[data-metrics-status]').textContent=`Posljednjih 30 dana · osvježeno ${new Date(d.updated).toLocaleTimeString()} · bez posjeta koje su odbile statistiku. ${d.geo_enabled?'Lokacije su približne.':'GeoIP baza nije podešena: lokacije su nepoznate.'}`;
      const cards=root.querySelector('[data-metrics-cards]');cards.replaceChildren();
      [[d.live_count,'Sada aktivno'],[d.sessions,'Sesije'],[d.pageviews,'Pregledi'],[Math.round(d.active_seconds/60),'Aktivne minute']].forEach(([value,title])=>{const box=document.createElement('div'),v=document.createElement('strong'),label=document.createElement('span');v.textContent=value;label.textContent=title;box.append(v,label);cards.append(box)});
      const grouped=new Map();d.live.forEach(v=>grouped.set(v.current_path,(grouped.get(v.current_path)||0)+1));
      root.querySelector('[data-metrics-live]')?.replaceChildren(table(['Stranica','Aktivne sesije'],[...grouped].map(([path,count])=>[path==='/'?'Početna':path,count])));
      const charts=document.querySelector('[data-metrics-charts]');
      if(charts){
        charts.replaceChildren();
        function chart(title,rows){
          const panel=document.createElement('section');panel.className='metric-chart';
          const heading=document.createElement('h3');heading.textContent=title;
          const summary=document.createElement('p');summary.textContent=`${rows.reduce((s,r)=>s+r.count,0)} pregleda`;
          const bars=document.createElement('div');bars.className='metric-bars';bars.setAttribute('role','list');
          const max=Math.max(1,...rows.map(r=>r.count));
          rows.forEach(r=>{const bar=document.createElement('div');bar.className='metric-bar';bar.tabIndex=0;bar.setAttribute('role','listitem');bar.setAttribute('aria-label',`${r.label}: ${r.count} pregleda`);bar.title=bar.getAttribute('aria-label');const fill=document.createElement('i');fill.style.height=`${r.count/max*100}%`;bar.append(fill);bars.append(bar)});
          const axis=document.createElement('div');axis.className='metric-axis';[rows[0]?.label,rows.at(-1)?.label].forEach(label=>{const span=document.createElement('span');span.textContent=label||'';axis.append(span)});
          panel.append(heading,summary,bars,axis);charts.append(panel);
        }
        chart('Pregledi po danima · 30 dana',d.daily||[]);chart('Pregledi · posljednjih 6h',d.hourly||[]);
        const sources=document.createElement('section');sources.className='metric-chart';const heading=document.createElement('h3');heading.textContent='Odakle dolaze · sesije';sources.append(heading);
        const total=(d.channels||[]).reduce((s,r)=>s+r.count,0);
        (d.channels||[]).slice(0,10).forEach(r=>{const row=document.createElement('div');row.className='metric-source';const label=document.createElement('span');label.textContent=r.label;const count=document.createElement('b');count.textContent=`${r.count} · ${Math.round(r.count/Math.max(1,total)*100)}%`;const bar=document.createElement('i');bar.style.width=`${r.count/Math.max(1,total)*100}%`;row.append(label,count,bar);sources.append(row)});
        if(!total){const empty=document.createElement('p');empty.textContent='Još nema zabilježenih izvora.';sources.append(empty)}charts.append(sources);
      }
      const details=root.querySelector('[data-metrics-details]');if(!details)return;details.replaceChildren();
      function section(title,headers,rows){const h=document.createElement('h3');h.textContent=title;details.append(h,table(headers,rows))}
      section('Kontakt forma — broj sesija po koraku',['Korak','Sesije'],Object.entries(d.forms).map(([k,v])=>[({form_view:'Vidjeli formu',form_start:'Počeli popunjavati',form_attempt:'Pokušali poslati',form_success:'Uspješno poslali',form_error:'Greška pri slanju'})[k],v]));
      section('Stranice',['Stranica','Sesije','Pregledi','Aktivne sekunde'],d.pages.map(r=>[r.path==='/'?'Početna':r.path,r.sessions,r.events,r.seconds]));
      for(const [name,title,field] of [['devices','Uređaji','device'],['sources','Izvori dolaska','source'],['campaigns','UTM kampanje','campaign'],['placements','Placements — utm_content','placement']])section(title,['Vrijednost','Sesije'],d[name].map(r=>[r[field],r.count]));
      section('Približne lokacije',['Država','Grad','Sesije'],d.locations.map(r=>[r.country,r.city,r.count]));
      section('Klikovi',['Sa stranice','Odredište / tip','Klikovi'],d.clicks.map(r=>[r.path,r.target,r.count]));
    }catch{root.querySelector('[data-metrics-status]').textContent='Statistika se ne može učitati. Provjerite prijavu i dozvole.'}}
    refresh();setInterval(refresh,15000);
  });
})();
