import {dateLabel,safeURL,phoneURL} from './profile.js';

export function renderProfile(profile,profiles,{esc,icon}) {
  const $=selector=>document.querySelector(selector),set=(selector,value)=>$(selector).textContent=value;
  const days=profile.days,lang=profile.language.code||'und';
  const range=days.length?`${dateLabel(days[0].date,profile.locale,{year:'numeric',month:'numeric',day:'numeric'})} — ${dateLabel(days.at(-1).date,profile.locale)}`:'여행 날짜를 입력해 주세요';
  document.title=profile.name;
  $('meta[name="description"]').content=`${profile.name} · 일정, 장소, 회화와 여행 준비`;
  $('meta[name="apple-mobile-web-app-title"]').content=profile.name;
  $('#trip-profile').innerHTML=profiles.map(p=>`<option value="${esc(p.id)}" ${p.id===profile.id?'selected':''}>${esc(p.name)}</option>`).join('');
  set('#brand-name',profile.brand.name);set('#mobile-brand',profile.brand.name);
  set('.brand-mark',Array.from(profile.brand.name)[0]?.toLowerCase()||'✦');
  set('#city-stamp',[profile.cityLabel,profile.localCity].filter(Boolean).join(' '));set('#rail-dates',range);
  set('#rail-duration',days.length?`${days.length}일의 여행`:'새 여행을 만들어 주세요');
  set('#avatar',profile.brand.avatar);$('#avatar').setAttribute('aria-label',profile.name);
  set('#trip-eyebrow',profile.cityLabel||'YOUR NEXT JOURNEY');set('#trip-heading',profile.name);set('#date-range',range);
  set('#hero-title',profile.brand.heroTitle);set('#hero-note',profile.brand.heroNote);
  set('#art-label',profile.cityLabel);set('#itinerary-title',days.length?`우리의 ${days.length}일`:'우리의 일정');set('#itinerary-note',profile.itineraryNote||'');
  set('#places-heading',profile.city?`${profile.city} 구경 & 맛집`:'구경 & 맛집');set('#catalog-label',`${profile.places.length} PLACES`);set('#places-note',profile.placesNote||'');
  set('#phrase-quick-label',profile.language.label);set('#language-pair',`한국어 ↔ ${profile.language.label}`);set('#footer-label',profile.name);
  set('#currency-quick-label',profile.currency?`${profile.currency.from} 계산`:'환율 계산');
  for(const selector of ['#hero-image','#places-image']) {
    $(selector).hidden=!profile.hero;
    if(profile.hero){$(selector).src=safeURL(profile.hero.src,{asset:true});$(selector).alt=selector==='#hero-image'?profile.hero.alt:'';}
  }
  $('#talk-link').hidden=!profile.talk;
  if(profile.talk) {$('#talk-link').href=safeURL(profile.talk.url,{relative:true});$('#talk-link').innerHTML=`${icon('chat')}<span class="talk-label"><strong>${esc(profile.talk.title)}</strong><small>${esc(profile.talk.description)}</small></span>${icon('arrow')}`;}
  document.querySelectorAll('[data-action="hotel"],[data-action="hotel-card"]').forEach(el=>el.hidden=!profile.hotel);
  document.querySelectorAll('[data-action="rest"]').forEach(el=>el.hidden=!profile.phrases.some(p=>p.id==='rest'));
  document.querySelectorAll('[data-action="money"]').forEach(el=>el.hidden=!profile.currency);
  $('#currency-section').hidden=!profile.currency;
  if(profile.currency) {
    const c=profile.currency;
    set('#currency-pair',`${c.from} → ${c.to}`);set('#currency-from-label',c.fromLabel);set('#currency-symbol',c.symbol);set('#currency-to-label',c.toLabel);set('#rate-label',`${c.unit} ${c.from}당 ${c.to}`);
  }
  $('#hotel-card').hidden=!profile.hotel;
  if(profile.hotel) {
    const h=profile.hotel;
    $('#hotel-card').innerHTML=`<div class="mini-icon blue">${icon('home')}</div><span class="eyebrow">OUR STAY</span><h2>${esc(h.name)}</h2><p lang="${esc(lang)}">${esc(h.localName)}</p><p class="hotel-address">${esc(h.address)}</p><div class="hotel-actions"><button class="button primary" data-action="hotel">숙소 길 찾기 ${icon('arrow')}</button><button class="button icon-only" data-action="hotel-card" aria-label="숙소 주소 크게 보기">${icon('expand')}</button></div>${h.url?`<a class="subtle-link" href="${esc(safeURL(h.url))}" target="_blank" rel="noopener noreferrer">숙소 공식 안내 ↗</a>`:''}`;
  }
  $('#flight-card').hidden=!profile.flights;
  if(profile.flights) {
    const f=profile.flights;
    $('#flight-card').innerHTML=`<div class="ticket-top"><span class="eyebrow">OUR FLIGHT</span><span class="ticket-airline">${esc(f.airline)}</span></div><div class="flight-line"><div><b>${esc(f.fromCode)}</b><span>${esc(f.from)}</span></div><span class="flight-path">${icon('plane')}</span><div><b>${esc(f.toCode)}</b><span>${esc(f.to)}</span></div></div><div class="flight-times">${f.legs.map(l=>`<div><small>${esc(l.label)}</small><strong>${esc(l.time)}</strong><span>${esc(l.note)}</span></div>`).join('<span class="flight-divider"></span>')}</div><div class="ticket-foot">${icon('info')} ${esc(f.note)}</div>`;
  }
  $('#phrase-teaser').hidden=!profile.phrases.length;
  if(profile.phrases.length) {
    const p=profile.phrases[0];
    $('#phrase-teaser').innerHTML=`<span class="eyebrow">오늘의 한마디</span><button data-action="phrase" data-id="${esc(p.id)}"><span lang="${esc(lang)}">${esc(p.translation)}</span><b>${esc(p.reading)}</b><small>${esc(p.text)} ${icon('expand')}</small></button>`;
  }
  $('#useful-links').innerHTML='<h2>바로 찾아보기</h2>'+profile.usefulLinks.map(l=>`<a href="${esc(safeURL(l.url))}" target="_blank" rel="noopener noreferrer">${icon(l.icon)}<span>${esc(l.label)}<small>${esc(l.note||'')}</small></span>${icon('external')}</a>`).join('')+`<button data-action="help">${icon('heart')}<span>도움이 필요할 때<small>도움 카드 · 연락처</small></span>${icon('arrow')}</button><button data-action="install">${icon('phone')}<span>홈 화면에 추가<small>휴대폰에서 앱처럼 열기</small></span>${icon('plus')}</button>`;
  // Keep the original manifest and installed-app identity for the default Tokyo URL.
  if(profile.id!=='tokyo-2026') {
    const start=new URL(location.href);start.hash='trip';
    const manifest={id:`?trip=${encodeURIComponent(profile.id)}`,name:profile.name,short_name:profile.name,lang:'ko',start_url:start.href,scope:new URL('./',location.href).href,display:'standalone',theme_color:'#2462ef',background_color:'#f5f7fb',icons:[192,512].map(size=>({src:new URL(`./assets/icon-${size}.png`,location.href).href,sizes:`${size}x${size}`,type:'image/png'}))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'}));
    $('link[rel="manifest"]').href=url;window.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
  }
}
