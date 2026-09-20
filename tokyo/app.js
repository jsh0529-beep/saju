'use strict';
const ICONS={
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/><path d="M7 9h9M7 13h6"/>',
 bag:'<rect x="5" y="5" width="14" height="16" rx="3"/><path d="M9 5V3h6v2M9 10v6m6-6v6M8 21v1m8-1v1"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
 wallet:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 8V5l13-3v3m5 7h-6v5h6"/><circle cx="17" cy="14.5" r=".5"/>',
 coffee:'<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 1h2a3 3 0 1 1 0 6h-2M3 22h16M7 2v3m5-3v3"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 plane:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 external:'<path d="M15 3h6v6M10 14 21 3M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 volume:'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 train:'<rect x="5" y="2" width="14" height="17" rx="4"/><path d="M5 10h14M12 2v8M8 19l-2 3m10-3 2 3"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
 mountain:'<path d="m3 21 8-17 10 17Zm4-9 4 2 4-3"/>',
 food:'<path d="M4 2v6a3 3 0 0 0 6 0V2M7 2v20M19 2c-3 3-4 6-4 10h4m0-10v20"/>',
 star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
 tower:'<path d="M12 2v3m-2 0h4l-1 5 2 6 4 6m-14 0 4-6 2-6-1-5M8 16h8M9 10h6M6 21h12M9 22l3-4 3 4"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M10 5h4"/>',
 call:'<path d="m5 3 4-1 3 6-3 2c1 3 2 4 5 5l2-3 6 3-1 4c-1 5-9 1-14-4S0 4 5 3Z"/>',
 expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
 passport:'<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="4"/><path d="M8 18h8M8 10h8m-4-4a8 8 0 0 1 0 8 8 8 0 0 1 0-8Z"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'
};
const icon=name=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.pin}</svg>`;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mapURL=(destination,mode='transit')=>`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
const hotelQuery='Tokyo Dome Hotel, 1-3-61 Koraku, Bunkyo City, Tokyo';
const hotelText='東京ドームホテル\n〒112-8562 東京都文京区後楽1-3-61\n03-5805-2111';
const dayInfo=[
 {date:25,week:'금',short:'도쿄 도착',title:'반가워, 도쿄!',note:'비행기 시간은 항공권 기준. 도착 후에는 호텔 주변에서 가볍게 시작해요.'},
 {date:26,week:'토',short:'후지산',title:'후지산을 만나러 가는 날',note:'앞서 말씀하신 가족 계획을 담았어요. 출발 전 투어의 집합 장소와 시간을 예약 안내에서 확인해 주세요.'},
 {date:27,week:'일',short:'도쿄 산책',title:'오래된 거리, 새로운 풍경',note:'추천 일정이에요. 아사쿠사와 스카이트리 중 한 곳만 골라도 좋아요.'},
 {date:28,week:'월',short:'취향 탐험',title:'좋아하는 것을 찾아서',note:'추천 일정이에요. 캐릭터 구경과 기념품 고르기 사이에 쉬는 시간을 넣었어요.'},
 {date:29,week:'화',short:'집으로',title:'도쿄, 다음에 또 만나!',note:'06:00 호텔 출발은 앞서 말씀하신 샌딩 계획이에요. 픽업 장소·시간과 항공편을 다시 확인해 주세요.'}
];
const defaults={
 0:[{id:'arrival-flight',time:'07:30',title:'김해에서 도쿄로 출발',note:'제주항공 7C1151 · 나리타 09:30 도착 예정 · 항공권 기준 터미널 3',query:'Gimhae International Airport International Terminal',icon:'plane',tag:'항공권 기준'},
 {id:'arrival-transfer',time:'도착 후',title:'예약 차량 만나기',note:'기사님과 약속한 미팅 지점을 확인해요. 짐을 찾은 뒤 호텔로 이동해요.',query:'Narita Airport Terminal 3',icon:'bag',tag:'가족 계획'},
 {id:'arrival-hotel',time:'호텔 도착',title:'도쿄돔호텔에 짐 맡기기',note:'체크인 가능 시각은 예약 조건에 따라 달라요. 도착이 이르면 짐 보관을 물어봐요.',query:hotelQuery,icon:'home',tag:'가족 계획'},
 {id:'arrival-city',time:'오후',title:'도쿄돔시티 가볍게 둘러보기',note:'호텔 근처에서 식사하고 주변을 구경해요. 오늘은 충분히 쉬어 가요.',query:'Tokyo Dome City Tokyo',icon:'coffee',tag:'추천 일정'}],
 1:[{id:'fuji-meet',time:'집합 안내 확인',title:'후지산 투어 차량 만나기',note:'정확한 집합 시간과 장소는 투어 예약 안내를 따라요.',query:'',icon:'mountain',tag:'가족 계획'},
 {id:'fuji-tour',time:'투어 일정에 따라',title:'후지산 풍경 감상하기',note:'방문 지점은 예약한 투어 코스로 확인해요. 날씨에 따라 전망과 일정이 달라질 수 있어요.',query:'',icon:'mountain',tag:'가족 계획'},
 {id:'fuji-rest',time:'돌아온 뒤',title:'호텔에서 쉬고 저녁 먹기',note:'긴 이동을 마친 날. 호텔 가까운 곳에서 식사하고 푹 쉬어요.',query:hotelQuery,icon:'coffee',tag:'추천 일정'}],
 2:[{id:'asakusa',time:'오전',title:'아사쿠사에서 도쿄 산책',note:'가미나리몬과 나카미세 거리에서 사진을 남겨요. 오래 걷기보다 보고 싶은 구간만 골라요.',query:'Kaminarimon Asakusa Tokyo',icon:'pin',tag:'추천 일정'},
 {id:'asakusa-lunch',time:'점심',title:'식사하고 충분히 쉬기',note:'가까운 식당에서 앉아서 쉬어요. 다음 코스는 컨디션을 보고 정해도 괜찮아요.',query:'restaurants near Asakusa Station Tokyo',icon:'food',tag:'추천 일정'},
 {id:'skytree',time:'오후 · 선택',title:'스카이트리 주변 구경',note:'전망대는 별도 입장권과 운영 확인이 필요해요. 주변 구경만 해도 좋아요.',query:'Tokyo Skytree',icon:'tower',tag:'추천 일정'},
 {id:'asakusa-home',time:'저녁',title:'우리 호텔로 돌아가기',note:'오늘 찍은 사진 중 가장 마음에 드는 한 장을 골라봐요.',query:hotelQuery,icon:'home',tag:'추천 일정'}],
 3:[{id:'character',time:'오전',title:'도쿄역 캐릭터 스트리트',note:'도쿄역 일번가 지하에서 캐릭터 숍을 구경해요. 살 물건은 가격부터 확인!',query:'Tokyo Character Street Tokyo Station',icon:'star',tag:'추천 일정'},
 {id:'character-lunch',time:'점심',title:'점심 먹고 잠깐 쉬기',note:'사고 싶은 기념품이 있다면 여행 가방의 엔화 계산기를 써봐요.',query:'Tokyo Station restaurants',icon:'food',tag:'추천 일정'},
 {id:'akihabara',time:'오후 · 선택',title:'아키하바라 취향 탐험',note:'게임·애니메이션·전자제품 가게가 있는 거리. 가족과 함께 가고 싶은 가게를 골라요.',query:'Akihabara Station Tokyo',icon:'star',tag:'추천 일정'},
 {id:'pack-home',time:'저녁',title:'내일 아침 출발 준비',note:'여권과 짐을 챙기고 샌딩 차량의 미팅 장소·06:00 출발 계획을 확인해요.',query:hotelQuery,icon:'bag',tag:'가족 계획'}],
 4:[{id:'return-transfer',time:'06:00',title:'호텔에서 공항으로',note:'앞서 말씀하신 예약 차량 샌딩 계획. 픽업 위치와 기사님 연락을 확인해요.',query:'Narita Airport Terminal 3',icon:'bag',tag:'가족 계획'},
 {id:'return-flight',time:'10:30',title:'나리타에서 김해로 출발',note:'제주항공 7C1152 · 항공권 기준 나리타 터미널 3 · 김해 13:00 도착 예정',query:'Narita Airport Terminal 3',icon:'plane',tag:'항공권 기준'},
 {id:'return-home',time:'13:00',title:'김해 도착 예정',note:'입국 수속을 마치고 짐을 찾아요. 하준이의 도쿄 여행, 수고했어!',query:'',icon:'home',tag:'항공권 기준'}]
};
const places=window.TOKYO_PLACES;
const phrases=[
 {id:'thanks',category:'기본',ko:'고맙습니다',ja:'ありがとうございます。',reading:'아리가토 고자이마스'},
 {id:'excuse',category:'기본',ko:'실례합니다 / 저기요',ja:'すみません。',reading:'스미마센'},
 {id:'slow',category:'기본',ko:'천천히 말해 주세요',ja:'ゆっくり話してください。',reading:'윳쿠리 하나시테 쿠다사이'},
 {id:'this',category:'식사·쇼핑',ko:'이것 주세요',ja:'これをください。',reading:'코레오 쿠다사이'},
 {id:'water',category:'식사·쇼핑',ko:'물 주세요',ja:'お水をください。',reading:'오미즈오 쿠다사이'},
 {id:'price',category:'식사·쇼핑',ko:'얼마인가요?',ja:'いくらですか。',reading:'이쿠라데스카'},
 {id:'card',category:'식사·쇼핑',ko:'카드로 결제할 수 있나요?',ja:'カードで払えますか。',reading:'카아도데 하라에마스카'},
 {id:'toilet',category:'이동',ko:'화장실은 어디인가요?',ja:'トイレはどこですか。',reading:'토이레와 도코데스카'},
 {id:'hotel',category:'이동',ko:'도쿄돔호텔로 가 주세요',ja:'東京ドームホテルまでお願いします。',reading:'도쿄 도무 호테루마데 오네가이시마스'},
 {id:'elevator',category:'이동',ko:'엘리베이터는 어디인가요?',ja:'エレベーターはどこですか。',reading:'에레베타와 도코데스카'},
 {id:'rest',category:'도움',ko:'잠시 앉아서 쉬고 싶어요',ja:'少し座って休みたいです。',reading:'스코시 스왓테 야스미타이데스'},
 {id:'arm',category:'도움',ko:'팔을 다쳤어요',ja:'腕をけがしています。',reading:'우데오 케가시테 이마스'},
 {id:'lost',category:'도움',ko:'가족과 떨어졌어요. 도와주세요',ja:'家族とはぐれました。助けてください。',reading:'카조쿠토 하구레마시타. 타스케테 쿠다사이'},
 {id:'ambulance',category:'도움',ko:'구급차를 불러 주세요',ja:'救急車を呼んでください。',reading:'큐큐샤오 욘데 쿠다사이'}
];
const packing=['여권 · 항공권','Visit Japan Web 확인','휴대폰 · 충전기 · 보조배터리','유심 / eSIM / 로밍 확인','교통카드 · 현금 · 결제카드','여행자보험 연락처','담당의가 안내한 약·관리용품','편한 옷 · 가벼운 가방'];
const storageKey='hajun-tokyo-trip-v1';
let state={events:JSON.parse(JSON.stringify(defaults)),done:[],packed:[],memo:'',rate:''};
let storageAvailable=true;
function validEvent(e){return e && typeof e.id==='string' && typeof e.title==='string' && typeof e.time==='string' && typeof e.note==='string' && typeof e.query==='string' && typeof e.icon==='string' && typeof e.tag==='string';}
try{const raw=localStorage.getItem(storageKey);if(raw){const s=JSON.parse(raw);if(s&&typeof s==='object'){
 if(s.events&&typeof s.events==='object')for(let i=0;i<5;i++)if(Array.isArray(s.events[i])&&s.events[i].length<=100&&s.events[i].every(validEvent))state.events[i]=s.events[i];
 if(Array.isArray(s.done))state.done=s.done.filter(x=>typeof x==='string');
 if(Array.isArray(s.packed))state.packed=s.packed.filter(x=>Number.isInteger(x)&&x>=0&&x<packing.length);
 if(typeof s.memo==='string')state.memo=s.memo.slice(0,3000);
 if(typeof s.rate==='string' && Number(s.rate)>0 && Number(s.rate)<=100000)state.rate=s.rate;
}}}catch{storageAvailable=false;}
let currentView='trip', selectedDay=0, placeFilter='전체', placeArea='전체 지역', placeSearch='', phraseFilter='전체', modalPhrase=null, toastTimer=null, installPrompt=null;
const tokyoDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const nowParts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const nowPart=k=>nowParts.find(x=>x.type===k).value;
const dateNow=`${nowPart('year')}-${nowPart('month')}-${nowPart('day')}`;
if(dateNow>='2026-09-25'&&dateNow<='2026-09-29')selectedDay=Number(nowPart('day'))-25;
else if(dateNow>'2026-09-29')selectedDay=4;
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));storageAvailable=true;return true;}catch{storageAvailable=false;toast('기기 저장이 차단돼 있어요. 브라우저 설정을 확인해 주세요.');return false;}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3300);}
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=icon(e.dataset.icon);e.removeAttribute('data-icon');});}
const navItems=[['trip','calendar','여행 일정'],['places','pin','관광·맛집'],['phrases','chat','일본어'],['bag','bag','여행 가방']];
function renderNav(){for(const target of ['desktop-nav','mobile-nav'])$('#'+target).innerHTML=navItems.map(([view,i,label])=>`<button class="nav-button ${currentView===view?'active':''}" data-action="navigate" data-view="${view}" ${currentView===view?'aria-current="page"':''}>${icon(i)}<span>${label}</span></button>`).join('');}
function navigate(view,scroll=true){if(!navItems.some(x=>x[0]===view))return false;currentView=view;$$('.view').forEach(e=>e.hidden=e.id!==`view-${view}`);$('#current-section').textContent=navItems.find(x=>x[0]===view)[2];renderNav();if(location.hash!==`#${view}`)history.replaceState(null,'',`#${view}`);if(scroll)window.scrollTo({top:0,behavior:'auto'});return true;}
function renderDays(){
 $('#day-tabs').innerHTML=dayInfo.map((d,i)=>`<button id="day-tab-${i}" class="day-tab" role="tab" aria-selected="${selectedDay===i}" tabindex="${selectedDay===i?0:-1}" aria-controls="day-panel" data-action="day" data-day="${i}"><span>9월 ${d.week}요일</span><strong>${d.date}</strong><small>${d.short}</small></button>`).join('');
 $('#day-panel').setAttribute('aria-labelledby',`day-tab-${selectedDay}`);
 const d=dayInfo[selectedDay],events=state.events[selectedDay];
 $('#day-kicker').textContent=`DAY 0${selectedDay+1} · SEPTEMBER ${d.date}`;$('#day-title').textContent=d.title;$('#day-note').textContent=d.note;
 $('#day-progress').textContent=`${events.filter(e=>state.done.includes(e.id)).length} / ${events.length} 완료`;
 $('#timeline').innerHTML=events.length?events.map((e,i)=>{
 const done=state.done.includes(e.id);
 return `<article class="timeline-item"><div class="time-marker"><span class="timeline-icon">${icon(e.icon)}</span><span>${String(i+1).padStart(2,'0')}</span></div><div class="event-card ${done?'done':''}"><div class="event-head"><div><div class="event-time">${esc(e.time)}</div><h4 class="event-title">${esc(e.title)}</h4></div><button class="check-event" data-action="check-event" data-id="${esc(e.id)}" aria-label="${esc(e.title)} 완료 표시" aria-pressed="${done}">${icon('check')}</button></div><p>${esc(e.note)}</p><div class="event-meta"><span class="event-tag ${e.tag==='항공권 기준'?'known':''}">${esc(e.tag)}</span><button class="edit-event" data-action="edit-event" data-id="${esc(e.id)}">수정</button>${e.query?`<a class="map-link" href="${esc(mapURL(e.query))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 길 찾기 ${icon('external')}</a>`:''}</div></div></article>`;
 }).join(''):'<div class="empty-state">아직 일정이 없어요.<br>위의 일정 추가를 눌러 채워보세요.</div>';
}
function selectDay(day){if(!Number.isInteger(day)||day<0||day>4)throw new Error('날짜는 0~4 사이여야 합니다.');selectedDay=day;renderDays();return {date:`2026-09-${day+25}`,events:state.events[day]};}
function toggleDone(id){const exists=Object.values(state.events).flat().some(e=>e.id===id);if(!exists)throw new Error('일정을 찾을 수 없습니다.');state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];const saved=save();renderDays();return {id,completed:state.done.includes(id),saved};}
function filteredPlaces(){const q=placeSearch.trim().toLocaleLowerCase();return places.filter(p=>(placeFilter==='전체'||(placeFilter==='호텔 근처'?p.area==='도쿄돔·스이도바시':p.category===placeFilter))&&(placeArea==='전체 지역'||p.area===placeArea)&&(!q||[p.name,p.en,p.area,p.category,p.kind,p.desc,p.query].join(' ').toLocaleLowerCase().includes(q)));}
function renderPlaces(){const filters=['전체','호텔 근처','관광·전망','캐릭터·쇼핑','박물관·체험','맛집','카페·디저트'];$('#place-filters').innerHTML=filters.map(f=>`<button class="filter-button ${placeFilter===f?'active':''}" aria-pressed="${placeFilter===f}" data-action="place-filter" data-filter="${f}">${f}</button>`).join('');
 const shown=filteredPlaces();$('#place-count').textContent=`${shown.length}곳 · 전체 ${places.length}곳`;
 $('#place-grid').innerHTML=shown.length?shown.map(p=>`<article class="place-card"><div class="place-cover ${p.color}">${icon(p.icon)}<span class="cover-kind">${esc(p.kind)}</span><span class="place-number">${String(places.indexOf(p)+1).padStart(2,'0')}</span></div><div class="place-content"><span class="place-area">${esc(p.area)}</span><span class="eyebrow">${esc(p.en)}</span><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><div class="place-tip">${esc(p.tip)}</div><div class="place-actions"><a class="button" href="${esc(mapURL(p.query))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 길 찾기</a><button class="button primary" data-action="add-place" data-id="${esc(p.id)}" aria-label="${esc(p.name)} 일정에 담기">${icon('plus')} 일정에 담기</button></div><a class="subtle-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">공식 정보 확인 ↗</a></div></article>`).join(''):'<div class="empty-state places-empty"><h2>찾는 장소가 아직 없어요</h2><p>다른 지역이나 음식 이름으로 찾아보세요.</p><button class="button primary" data-action="reset-places">전체 장소 보기</button></div>';
}
function resetPlaces(){placeFilter='전체';placeArea='전체 지역';placeSearch='';$('#place-search').value='';$('#place-area').value=placeArea;renderPlaces();}
function renderPhrases(){const filters=['전체','기본','식사·쇼핑','이동','도움'];$('#phrase-filters').innerHTML=filters.map(f=>`<button class="filter-button ${phraseFilter===f?'active':''}" aria-pressed="${phraseFilter===f}" data-action="phrase-filter" data-filter="${f}">${f}</button>`).join('');
 $('#phrase-grid').innerHTML=phrases.filter(p=>phraseFilter==='전체'||p.category===phraseFilter).map(p=>`<button class="phrase-card" data-action="phrase" data-id="${p.id}"><span>${p.category}</span><h2>${p.ko}</h2><p lang="ja">${p.ja}</p>${icon('expand')}</button>`).join('');}
function renderPacking(){$('#packing-count').textContent=`${state.packed.length} / ${packing.length}`;$('#packing-list').innerHTML=packing.map((p,i)=>`<label class="packing-item"><input type="checkbox" data-pack="${i}" ${state.packed.includes(i)?'checked':''}><span>${p}</span></label>`).join('');}
function calculate(){const yenText=$('#yen').value,rateText=$('#rate').value;const yen=Number(yenText),rate=Number(rateText);if(!rateText||!Number.isFinite(rate)||rate<=0||rate>100000){$('#won').textContent='환율을 입력해 주세요';return null;}if(!yenText||!Number.isFinite(yen)||yen<0||yen>1000000000){$('#won').textContent='금액을 확인해 주세요';return null;}const won=Math.round(yen*rate/100);$('#won').textContent=`${new Intl.NumberFormat('ko-KR').format(won)}원`;return won;}
function openModal(content){$('#modal-body').innerHTML=content;hydrateIcons($('#modal-body'));if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){if(window.speechSynthesis)window.speechSynthesis.cancel();$('#modal').close();modalPhrase=null;}
function showPhrase(id){const p=phrases.find(x=>x.id===id);if(!p)return;modalPhrase=p;openModal(`<span class="eyebrow">JAPANESE CARD · ${p.category}</span><h2 id="modal-title">${p.ko}</h2><p class="large-japanese" lang="ja">${p.ja}</p><p class="pronunciation">${p.reading}</p><div class="modal-actions"><button class="button primary speak-button" data-action="speak">${icon('volume')} 일본어로 읽기</button><button class="button" data-action="copy-phrase">${icon('copy')} 복사</button></div><p class="storage-note">이 화면을 그대로 보여줘도 돼요.</p>`);}
function speak(){if(!modalPhrase)return;if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){toast('이 기기는 음성을 지원하지 않아요. 큰 글씨 카드를 보여주세요.');return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(modalPhrase.ja);utterance.lang='ja-JP';utterance.rate=.83;const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ja'));if(voice)utterance.voice=voice;utterance.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))toast('일본어 음성을 재생할 수 없어요. 카드를 보여주세요.');};window.speechSynthesis.speak(utterance);}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('복사했어요.');}catch{toast('복사를 지원하지 않아요. 글씨를 길게 눌러 복사해 주세요.');}}
function showHotel(){openModal(`<span class="eyebrow">OUR HOTEL</span><h2 id="modal-title">기사님께 보여주세요</h2><p class="large-japanese" lang="ja">東京ドームホテルまで<br>お願いします。</p><div class="help-intro" lang="ja">東京ドームホテル<br>〒112-8562 東京都文京区後楽1-3-61<br>03-5805-2111</div><div class="modal-actions"><a class="button primary" href="${esc(mapURL(hotelQuery,'driving'))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 호텔 길 찾기</a><button class="button" data-action="copy-hotel">${icon('copy')} 주소 복사</button></div><div class="modal-actions"><a class="button" href="tel:+81358052111">${icon('call')} 호텔에 전화</a><button class="button" data-action="phrase" data-id="hotel">${icon('volume')} 일본어로 읽기</button></div><a class="subtle-link" href="https://www.tokyodome-hotels.co.jp/" target="_blank" rel="noopener noreferrer">주소·연락처: 도쿄돔호텔 공식 안내 ↗</a>`);}
function showHelp(){openModal(`<span class="eyebrow">WE ARE HERE FOR YOU</span><h2 id="modal-title">도움이 필요할 때</h2><p class="help-intro">가족과 떨어졌다면 가까운 가게 직원이나 역무원에게 도움을 요청해요.</p><div class="modal-actions"><button class="button primary" data-action="phrase" data-id="lost">가족을 찾고 있어요</button><button class="button" data-action="phrase" data-id="arm">팔을 다쳤어요</button></div><div class="contact-card"><div><strong>일본 구급차 · 소방</strong><small>일본 안에서 긴급할 때</small></div><a href="tel:119">${icon('call')} 119</a></div><div class="contact-card"><div><strong>일본 경찰</strong><small>일본 안에서 긴급할 때</small></div><a href="tel:110">${icon('call')} 110</a></div><div class="contact-card hotline"><strong>일본정부관광국 여행자 핫라인</strong><small>한국어 지원 · 24시간</small><a href="tel:+815038162787">${icon('call')} 050-3816-2787</a></div><p class="storage-note">통화 가능한 회선이 필요해요. 데이터 전용 eSIM이라면 주변 직원에게 전화 도움을 요청해 주세요.</p><a class="subtle-link" href="https://www.japan.travel/en/plan/hotline/" target="_blank" rel="noopener noreferrer">긴급번호·핫라인: JNTO 공식 안내 ↗</a>`);}
function showSources(){openModal(`<span class="eyebrow">TRAVEL NOTES</span><h2 id="modal-title">여행 정보와 이용 안내</h2><p class="modal-description">여행 일정은 앞서 알려주신 항공권과 가족 계획을 바탕으로 만들었어요. 관광 코스는 추천안이며, 예약이 완료됐다는 뜻은 아니에요.</p><ul class="modal-list"><li>항공권: 9.25 김해 07:30 → 나리타 09:30, 9.29 나리타 10:30 → 김해 13:00. 운항 변경은 항공사에서 확인해 주세요.</li><li>숙소는 앞서 사용하신 도쿄돔호텔 기준이에요. 후지산 투어·차량은 예약 안내를 다시 확인해 주세요.</li><li>일정 수정, 체크, 메모, 환율은 이 브라우저에만 저장돼요. 다른 기기에 자동으로 공유되지 않으며, 브라우저 데이터를 지우면 없어질 수 있어요.</li><li>길 찾기는 Google 지도로 연결돼요. 출발지·교통수단·소요시간은 지도에서 확인해 주세요.</li><li>엔화 계산은 직접 입력한 환율을 사용해요. 일본어 음성은 기기의 음성 합성 기능을 사용해요.</li><li>여행 카드는 인터넷 연결이 있는 환경에서 사용해 주세요. 첫 화면의 도쿄 그림은 AI로 만든 창작 일러스트예요.</li></ul><div class="source-list"><a href="https://www.tokyodome-hotels.co.jp/" target="_blank" rel="noopener noreferrer">도쿄돔호텔 · 주소와 연락처</a><a href="https://www.tokyo-dome.co.jp/travel/" target="_blank" rel="noopener noreferrer">도쿄돔시티 · 시설 안내</a><a href="https://www.gotokyo.org/en/destinations/eastern-tokyo/asakusa/index.html" target="_blank" rel="noopener noreferrer">GO TOKYO · 아사쿠사</a><a href="https://www.gotokyo.org/en/destinations/central-tokyo/akihabara/index.html" target="_blank" rel="noopener noreferrer">GO TOKYO · 아키하바라</a><a href="https://www.tokyoeki-1bangai.co.jp/shop/?area=area2&floor=b1f&anchor=1" target="_blank" rel="noopener noreferrer">도쿄역 일번가 · 캐릭터 스트리트</a><a href="https://www.japan.travel/en/plan/hotline/" target="_blank" rel="noopener noreferrer">JNTO · 긴급 연락처</a></div><p class="storage-note">외부 여행 정보 확인: 2026년 9월 20일 (한국 시간)</p>`);}
function editEvent(id=null,place=null){const existing=id?state.events[selectedDay].find(e=>e.id===id):null;if(id&&!existing)return;const e=existing||{title:place?.name||'',time:'',note:place?[place.area+' · '+place.kind,place.desc,place.tip].join('\n'):'',query:place?.query||'',icon:place?.icon||'pin'};
 openModal(`<span class="eyebrow">MY TRAVEL PLAN</span><h2 id="modal-title">${existing?'일정 수정':place?'가고 싶은 곳 담기':'나의 일정 추가'}</h2><form class="edit-form" id="event-form" data-event-id="${esc(id||'')}" data-event-icon="${esc(e.icon)}"><div class="form-row"><label>날짜<select name="day">${dayInfo.map((d,i)=>`<option value="${i}" ${i===selectedDay?'selected':''}>9월 ${d.date}일 (${d.week})</option>`).join('')}</select></label><label>시간 또는 때<input name="time" maxlength="24" placeholder="예: 14:00 / 오후" value="${esc(e.time)}"></label></div><label>무엇을 할까?<input name="title" maxlength="80" value="${esc(e.title)}" placeholder="예: 편의점에서 간식 고르기" required></label><label>메모<textarea name="note" maxlength="500" rows="3">${esc(e.note)}</textarea></label><label>지도에서 찾을 장소<input name="query" maxlength="150" value="${esc(e.query)}" placeholder="장소 이름과 지역을 적어주세요"></label><p class="storage-note">지금 사용하는 기기에 저장돼요.${existing?'':' 새 일정은 해당 날짜의 맨 아래에 추가돼요.'}</p><div class="modal-actions">${existing?`<button type="button" class="button danger" data-action="delete-event" data-id="${esc(id)}">삭제</button>`:'<button type="button" class="button" data-action="close-modal">취소</button>'}<button type="submit" class="button primary">저장하기</button></div></form>`);}
function persistEvent(form){const f=new FormData(form);const title=String(f.get('title')||'').trim();const day=Number(f.get('day'));if(!title||!Number.isInteger(day)||day<0||day>4){toast('날짜와 일정 이름을 확인해 주세요.');return;}if(state.events[day].length>=100){toast('하루에 최대 100개까지 저장할 수 있어요.');return;}
 const id=form.dataset.eventId||`custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 const event={id,title:title.slice(0,80),time:String(f.get('time')||'').trim().slice(0,24)||'자유롭게',note:String(f.get('note')||'').trim().slice(0,500),query:String(f.get('query')||'').trim().slice(0,150),icon:form.dataset.eventIcon||'pin',tag:form.dataset.eventId?'직접 수정':'나의 일정'};
 const originalDay=Object.keys(state.events).find(d=>state.events[d].some(e=>e.id===id));
 if(originalDay!==undefined && Number(originalDay)===day){state.events[day]=state.events[day].map(e=>e.id===id?event:e);}else{if(originalDay!==undefined)state.events[originalDay]=state.events[originalDay].filter(e=>e.id!==id);state.events[day].push(event);}
 const saved=save();selectedDay=day;renderDays();closeModal();navigate('trip');if(saved)toast(`9월 ${day+25}일 일정에 저장했어요.`);
}
function showInstall(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.then(()=>{installPrompt=null;});return;}openModal(`<span class="eyebrow">TAKE TOKYO WITH YOU</span><h2 id="modal-title">홈 화면에 추가하기</h2><p class="modal-description">휴대폰 브라우저에서 이 앱을 연 뒤 아래 순서로 추가해 주세요.</p><h3>안드로이드 · Chrome</h3><p class="modal-description">오른쪽 위 ⋮ 메뉴 → <b>홈 화면에 추가</b> 또는 <b>앱 설치</b></p><h3>아이폰 · Safari</h3><p class="modal-description">공유 버튼 → <b>홈 화면에 추가</b></p><p class="storage-note">메뉴 이름은 브라우저에 따라 달라요. 로그인 없이 바로 사용할 수 있어요. 인터넷에 연결해 사용해 주세요.</p>`);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='navigate'){navigate(b.dataset.view);}
 else if(a==='day'){selectDay(Number(b.dataset.day));}
 else if(a==='check-event'){toggleDone(b.dataset.id);}
 else if(a==='place-filter'){placeFilter=b.dataset.filter;if(placeFilter==='호텔 근처'){placeArea='전체 지역';$('#place-area').value=placeArea;}renderPlaces();}
 else if(a==='reset-places'){resetPlaces();}
 else if(a==='phrase-filter'){phraseFilter=b.dataset.filter;renderPhrases();}
 else if(a==='phrase'){showPhrase(b.dataset.id);}
 else if(a==='rest'){showPhrase('rest');}
 else if(a==='speak'){speak();}
 else if(a==='copy-phrase'&&modalPhrase){copy(modalPhrase.ja);}
 else if(a==='copy-hotel'){copy(hotelText);}
 else if(a==='hotel'||a==='hotel-card'){showHotel();}
 else if(a==='help'){showHelp();}
 else if(a==='sources'){showSources();}
 else if(a==='install'){showInstall();}
 else if(a==='close-modal'){closeModal();}
 else if(a==='money'){navigate('bag');$('#currency-section').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});$('#yen').focus({preventScroll:true});}
 else if(a==='add-event'){editEvent();}
 else if(a==='edit-event'){editEvent(b.dataset.id);}
 else if(a==='add-place'){const p=places.find(x=>x.id===b.dataset.id);if(p)editEvent(null,p);}
 else if(a==='delete-event'){if(!window.confirm('이 일정을 삭제할까요?'))return;state.events[selectedDay]=state.events[selectedDay].filter(x=>x.id!==b.dataset.id);state.done=state.done.filter(x=>x!==b.dataset.id);const saved=save();renderDays();closeModal();if(saved)toast('일정을 삭제했어요.');}
});
document.addEventListener('submit',e=>{if(e.target.id==='event-form'){e.preventDefault();persistEvent(e.target);}});
document.addEventListener('change',e=>{if(e.target.matches('[data-pack]')){const index=Number(e.target.dataset.pack);state.packed=e.target.checked?[...new Set([...state.packed,index])]:state.packed.filter(x=>x!==index);save();$('#packing-count').textContent=`${state.packed.length} / ${packing.length}`;}});
$('#day-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let d=selectedDay;if(e.key==='ArrowLeft')d=(d+4)%5;if(e.key==='ArrowRight')d=(d+1)%5;if(e.key==='Home')d=0;if(e.key==='End')d=4;selectDay(d);$(`#day-tab-${d}`).focus();});
$('#modal').addEventListener('click',e=>{if(e.target!==$('#modal'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();});
$('#modal').addEventListener('close',()=>{if(window.speechSynthesis)window.speechSynthesis.cancel();modalPhrase=null;});
$('#yen').addEventListener('input',calculate);$('#rate').addEventListener('input',()=>{state.rate=$('#rate').value;save();calculate();});
let memoTimer;$('#trip-memo').addEventListener('input',()=>{state.memo=$('#trip-memo').value;$('#memo-status').textContent='저장 중…';clearTimeout(memoTimer);memoTimer=setTimeout(()=>{$('#memo-status').textContent=save()?'이 기기에 저장됨':'저장할 수 없음';},400);});
window.addEventListener('pagehide',()=>{if(memoTimer){clearTimeout(memoTimer);save();}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
function updateClock(){$('#tokyo-clock').textContent='TOKYO '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
const daysLeft=Math.ceil((Date.parse('2026-09-25T00:00:00+09:00')-Date.parse(`${dateNow}T00:00:00+09:00`))/86400000);
$('#trip-count').textContent=daysLeft>0?`도쿄까지 D−${daysLeft} · 4박 5일`:daysLeft>=-4?`도쿄 여행 DAY ${1-daysLeft}`:'우리의 도쿄 여행 기록';
$('#place-area').innerHTML=['전체 지역',...new Set(places.map(p=>p.area))].map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
$('#place-search').addEventListener('input',()=>{placeSearch=$('#place-search').value;renderPlaces();});
$('#place-area').addEventListener('change',()=>{placeArea=$('#place-area').value;if(placeFilter==='호텔 근처'&&placeArea!=='전체 지역'&&placeArea!=='도쿄돔·스이도바시')placeFilter='전체';renderPlaces();});
renderNav();renderDays();renderPlaces();renderPhrases();renderPacking();hydrateIcons();$('#trip-memo').value=state.memo;$('#rate').value=state.rate;calculate();updateClock();setInterval(updateClock,30000);navigate(location.hash.slice(1)||'trip',false);
if(!storageAvailable)toast('저장된 정보를 읽을 수 없어요. 변경 내용 저장 여부를 확인해 주세요.');
// Expose the same journeys to supported, user-authorized browser agents.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_travel_day',title:'날짜별 여행 일정 읽기',description:'하준이의 선택한 날짜 일정을 읽습니다. 상태를 바꾸지 않습니다.',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:5}},required:['day'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||!Number.isInteger(input.day)||input.day<1||input.day>5)throw new Error('day must be 1 through 5');return{date:`2026-09-${input.day+24}`,events:state.events[input.day-1].map(e=>({...e,completed:state.done.includes(e.id)}))};}});
 register({name:'show_travel_day',title:'여행 날짜 열기',description:'여행 일정 화면에서 지정한 날짜를 보여줍니다. 완료 상태나 내용은 바꾸지 않습니다.',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:5}},required:['day'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.day)||input.day<1||input.day>5)throw new Error('day must be 1 through 5');selectDay(input.day-1);navigate('trip');return{visibleDate:`2026-09-${input.day+24}`};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
