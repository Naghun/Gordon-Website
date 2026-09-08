(() => {
  document.querySelectorAll('[data-metrics-url]').forEach(root => {
    if(root.dataset.started)return;root.dataset.started='true';
    function table(headers,rows){const box=document.createElement('div');box.className='metrics-scroll';const t=document.createElement('table');const tr=document.createElement('tr');headers.forEach(h=>{const th=document.createElement('th');th.textContent=h;tr.append(th)});t.append(tr);(rows.length?rows:[['Još nema podataka']]).forEach(row=>{const r=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value ?? '—';r.append(td)});t.append(r)});box.append(t);return box}
    async function refresh(){if(document.hidden)return;try{
      const response=await fetch(root.dataset.metricsUrl,{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error();const d=await response.json();
      root.querySelector('[data-metrics-status]').textContent=`Posljednjih 30 dana · osvježeno ${new Date(d.updated).toLocaleTimeString()} · samo posjete uz dozvolu. ${d.geo_enabled?'Lokacije su približne.':'GeoIP baza nije podešena: lokacije su nepoznate.'}`;
      const cards=root.querySelector('[data-metrics-cards]');cards.replaceChildren();
      [[d.live_count,'Sada aktivno'],[d.sessions,'Sesije'],[d.pageviews,'Pregledi'],[Math.round(d.active_seconds/60),'Aktivne minute']].forEach(([value,title])=>{const box=document.createElement('div'),v=document.createElement('strong'),label=document.createElement('span');v.textContent=value;label.textContent=title;box.append(v,label);cards.append(box)});
      root.querySelector('[data-metrics-live]').replaceChildren(table(['Sesija','Stranica','Uređaj','Izvor','Lokacija','Aktivno'],d.live.map(v=>[v.token.slice(0,8),v.current_path,v.device,v.source,`${v.country} / ${v.city}`,`${v.active_seconds}s`])));
      const details=root.querySelector('[data-metrics-details]');if(!details)return;details.replaceChildren();
      function section(title,headers,rows){const h=document.createElement('h3');h.textContent=title;details.append(h,table(headers,rows))}
      section('Kontakt forma — broj sesija po koraku',['Korak','Sesije'],Object.entries(d.forms).map(([k,v])=>[({form_view:'Vidjeli formu',form_start:'Počeli popunjavati',form_attempt:'Pokušali poslati',form_success:'Uspješno poslali',form_error:'Greška pri slanju'})[k],v]));
      section('Stranice',['Putanja','Događaji','Aktivne sekunde'],d.pages.map(r=>[r.path,r.events,r.seconds]));
      for(const [name,title,field] of [['devices','Uređaji','device'],['sources','Izvori dolaska','source'],['campaigns','UTM kampanje','campaign'],['placements','Placements — utm_content','placement']])section(title,['Vrijednost','Sesije'],d[name].map(r=>[r[field],r.count]));
      section('Približne lokacije',['Država','Grad','Sesije'],d.locations.map(r=>[r.country,r.city,r.count]));
      section('Klikovi',['Sa stranice','Odredište / tip','Klikovi'],d.clicks.map(r=>[r.path,r.target,r.count]));
    }catch{root.querySelector('[data-metrics-status]').textContent='Statistika se ne može učitati. Provjerite prijavu i dozvole.'}}
    refresh();setInterval(refresh,15000);
  });
})();
