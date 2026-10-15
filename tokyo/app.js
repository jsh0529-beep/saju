import {builtInProfiles,defaultTripId} from './trips/index.js';
import {localDate,dateLabel,initialDay,validateProfile,safeURL,phoneURL} from './lib/profile.js';
import {loadState,saveState,exportState,parseRecord,importState,listRecordBackups} from './lib/storage.js';
import {loadProfiles,addProfile,parseProfile,exportProfile,downloadFile,catalogKey} from './lib/profiles-store.js';
import {openEditor} from './lib/editor.js';
import {renderProfile} from './lib/view-profile.js';
import {openPlanner} from './lib/planner-view.js';

function startApp() {
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
let storage;
try {storage=window.localStorage;} catch {storage={getItem(){throw new Error('브라우저 저장소를 사용할 수 없어요.');},setItem(){throw new Error('브라우저 저장소를 사용할 수 없어요.');}};}
let customProfiles=[],catalogError='';
try {customProfiles=loadProfiles(storage,builtInProfiles);}catch(error){catalogError=error.message;}
const profiles=[...builtInProfiles,...customProfiles];
const requested=new URLSearchParams(location.search).get('trip')??defaultTripId;
const profile=profiles.find(p=>p.id===requested);
if(!profile)throw new Error('이 여행을 찾을 수 없어요. 다른 기기에서 만든 여행은 여행 템플릿 파일을 먼저 가져와 주세요.');
validateProfile(profile);
const dayInfo=profile.days,places=profile.places,phrases=profile.phrases,packing=profile.packing;
const hotelQuery=profile.hotel?.query||'';
const hotelText=profile.hotel?[profile.hotel.localName||profile.hotel.name,profile.hotel.address,profile.hotel.displayPhone].filter(Boolean).join('\n'):'';
const loaded=loadState(storage,profile);
let state=loaded.state,storageAvailable=loaded.writable;
let currentView='trip', selectedDay=initialDay(dayInfo,localDate(profile.timeZone)), placeFilter='전체', placeArea='전체 지역', placeSearch='', phraseFilter='전체', modalPhrase=null, toastTimer=null, installPrompt=null;
const eventsFor=day=>state.events[dayInfo[day]?.id]||[];
const setEvents=(day,events)=>state.events[dayInfo[day].id]=events;
const dateNow=localDate(profile.timeZone);
function save(){
 if(!storageAvailable){toast('저장소를 확인할 때까지 자동 저장을 멈췄어요. 기록을 내보내 보관해 주세요.');return false;}
 try {saveState(storage,profile,state);return true;}catch(error){storageAvailable=false;showStorageWarning('기기에 저장하지 못했어요. 기록을 내보내 보관해 주세요.');toast(error.message);return false;}
}
function showStorageWarning(message){$('#storage-warning').hidden=false;$('#storage-warning').textContent=message;}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3300);}
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(e=>{e.innerHTML=icon(e.dataset.icon);e.removeAttribute('data-icon');});}
const navItems=[['trip','calendar','여행 일정'],['places','pin','관광·맛집'],['phrases','chat',profile.language.label],['bag','bag','여행 가방']];
function renderNav(){for(const target of ['desktop-nav','mobile-nav'])$('#'+target).innerHTML=navItems.map(([view,i,label])=>`<button class="nav-button ${currentView===view?'active':''}" data-action="navigate" data-view="${view}" ${currentView===view?'aria-current="page"':''}>${icon(i)}<span>${esc(label)}</span></button>`).join('');}
function navigate(view,scroll=true){if(!navItems.some(x=>x[0]===view))return false;currentView=view;$$('.view').forEach(e=>e.hidden=e.id!==`view-${view}`);$('#current-section').textContent=navItems.find(x=>x[0]===view)[2];renderNav();if(location.hash!==`#${view}`)history.replaceState(null,'',`#${view}`);if(scroll)window.scrollTo({top:0,behavior:'auto'});return true;}
function renderDays(){
 if(!dayInfo.length){$('#day-tabs').innerHTML='';$('#day-kicker').textContent='';$('#day-title').textContent='새 여행을 만들어 주세요';$('#day-note').textContent='여행 기간을 입력하면 날짜별 일정표가 생겨요.';$('#day-progress').textContent='';$('#timeline').innerHTML='<button class="button primary" data-action="new-profile">새 여행 만들기</button>';return;}

 $('#day-tabs').innerHTML=dayInfo.map((d,i)=>`<button id="day-tab-${i}" class="day-tab" role="tab" aria-selected="${selectedDay===i}" tabindex="${selectedDay===i?0:-1}" aria-controls="day-panel" data-action="day" data-day="${i}"><span>${esc(dateLabel(d.date,profile.locale,{month:'long'}))} ${esc(dateLabel(d.date,profile.locale,{weekday:'short'}))}</span><strong>${Number(d.date.slice(-2))}</strong><small>${esc(d.short)}</small></button>`).join('');
 $('#day-panel').setAttribute('aria-labelledby',`day-tab-${selectedDay}`);
 const d=dayInfo[selectedDay],events=eventsFor(selectedDay);
 $('#day-kicker').textContent=`DAY ${String(selectedDay+1).padStart(2,'0')} · ${d.date}`;$('#day-title').textContent=d.title;$('#day-note').textContent=d.note;
 $('#day-progress').textContent=`${events.filter(e=>state.done.includes(e.id)).length} / ${events.length} 완료`;
 $('#timeline').innerHTML=events.length?events.map((e,i)=>{
 const done=state.done.includes(e.id);
 return `<article class="timeline-item"><div class="time-marker"><span class="timeline-icon">${icon(e.icon)}</span><span>${String(i+1).padStart(2,'0')}</span></div><div class="event-card ${done?'done':''}"><div class="event-head"><div><div class="event-time">${esc(e.time)}</div><h4 class="event-title">${esc(e.title)}</h4></div><button class="check-event" data-action="check-event" data-id="${esc(e.id)}" aria-label="${esc(e.title)} 완료 표시" aria-pressed="${done}">${icon('check')}</button></div><p>${esc(e.note)}</p><div class="event-meta"><span class="event-tag ${e.tag==='항공권 기준'?'known':''}">${esc(e.tag)}</span><button class="edit-event" data-action="edit-event" data-id="${esc(e.id)}">수정</button>${e.query?`<a class="map-link" href="${esc(mapURL(e.query,['driving','walking','transit'].includes(e.mode)?e.mode:'transit'))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 길 찾기 ${icon('external')}</a>`:''}</div></div></article>`;
 }).join(''):'<div class="empty-state">아직 일정이 없어요.<br>위의 일정 추가를 눌러 채워보세요.</div>';
}
function selectDay(day){if(!Number.isInteger(day)||day<0||day>=dayInfo.length)throw new Error('여행 날짜를 확인해 주세요.');selectedDay=day;renderDays();return {date:dayInfo[day].date,events:eventsFor(day)};}
function toggleDone(id){const exists=Object.values(state.events).flat().some(e=>e.id===id);if(!exists)throw new Error('일정을 찾을 수 없습니다.');state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];const saved=save();renderDays();return {id,completed:state.done.includes(id),saved};}
function filteredPlaces(){const q=placeSearch.trim().toLocaleLowerCase();return places.filter(p=>(placeFilter==='전체'||(placeFilter==='호텔 근처'?p.area===profile.hotel?.nearbyArea:p.category===placeFilter))&&(placeArea==='전체 지역'||p.area===placeArea)&&(!q||[p.name,p.en,p.area,p.category,p.kind,p.desc,p.query].join(' ').toLocaleLowerCase().includes(q)));}
function renderPlaces(){const filters=['전체',...(profile.hotel?.nearbyArea?['호텔 근처']:[]),...new Set(places.map(p=>p.category))];$('#place-filters').innerHTML=filters.map(f=>`<button class="filter-button ${placeFilter===f?'active':''}" aria-pressed="${placeFilter===f}" data-action="place-filter" data-filter="${esc(f)}">${esc(f)}</button>`).join('');
 const shown=filteredPlaces();$('#place-count').textContent=`${shown.length}곳 · 전체 ${places.length}곳`;
 $('#place-grid').innerHTML=shown.length?shown.map(p=>`<article class="place-card"><div class="place-cover ${esc(p.color)}">${icon(p.icon)}<span class="cover-kind">${esc(p.kind)}</span><span class="place-number">${String(places.indexOf(p)+1).padStart(2,'0')}</span></div><div class="place-content"><span class="place-area">${esc(p.area)}</span><span class="eyebrow">${esc(p.en)}</span><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><div class="place-tip">${esc(p.tip)}</div><div class="place-actions"><a class="button" href="${esc(mapURL(p.query))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 길 찾기</a><button class="button primary" data-action="add-place" data-id="${esc(p.id)}" aria-label="${esc(p.name)} 일정에 담기">${icon('plus')} 일정에 담기</button></div>${p.url?`<a class="subtle-link" href="${esc(safeURL(p.url))}" target="_blank" rel="noopener noreferrer">공식 정보 확인 ↗</a>`:''}</div></article>`).join(''):'<div class="empty-state places-empty"><h2>찾는 장소가 아직 없어요</h2><p>다른 지역이나 음식 이름으로 찾아보세요.</p><button class="button primary" data-action="reset-places">전체 장소 보기</button></div>';
}
function resetPlaces(){placeFilter='전체';placeArea='전체 지역';placeSearch='';$('#place-search').value='';$('#place-area').value=placeArea;renderPlaces();}
function renderPhrases(){const filters=['전체',...new Set(phrases.map(p=>p.category))];$('#phrase-filters').innerHTML=filters.map(f=>`<button class="filter-button ${phraseFilter===f?'active':''}" aria-pressed="${phraseFilter===f}" data-action="phrase-filter" data-filter="${esc(f)}">${esc(f)}</button>`).join('');
 $('#phrase-grid').innerHTML=phrases.filter(p=>phraseFilter==='전체'||p.category===phraseFilter).map(p=>`<button class="phrase-card" data-action="phrase" data-id="${esc(p.id)}"><span>${esc(p.category)}</span><h2>${esc(p.text)}</h2><p lang="${esc(profile.language.code||'und')}">${esc(p.translation)}</p>${icon('expand')}</button>`).join('')||'<p class="empty-state">아직 회화 카드가 없어요. 여행 정보 편집에서 추가해 주세요.</p>';}
function renderPacking(){$('#packing-count').textContent=`${state.packed.length} / ${packing.length}`;$('#packing-list').innerHTML=packing.map(p=>`<label class="packing-item"><input type="checkbox" data-pack="${esc(p.id)}" ${state.packed.includes(p.id)?'checked':''}><span>${esc(p.label)}</span></label>`).join('')||'<p class="storage-note">여행 정보 편집에서 준비물을 추가해 주세요.</p>';}
function calculate(){if(!profile.currency)return null;const amountText=$('#yen').value,rateText=$('#rate').value;const amount=Number(amountText),rate=Number(rateText);if(!rateText||!Number.isFinite(rate)||rate<=0||rate>100000){$('#won').textContent='환율을 입력해 주세요';return null;}if(!amountText||!Number.isFinite(amount)||amount<0||amount>1000000000){$('#won').textContent='금액을 확인해 주세요';return null;}const result=amount*rate/profile.currency.unit;$('#won').textContent=new Intl.NumberFormat(profile.locale,{style:'currency',currency:profile.currency.to}).format(result);return result;}
let currentPhraseAudio=null, audioStartTimer=null, audioAttempt=0;
function stopPhraseAudio(){audioAttempt++;clearTimeout(audioStartTimer);audioStartTimer=null;if(currentPhraseAudio){currentPhraseAudio.pause();try{currentPhraseAudio.currentTime=0;}catch{}currentPhraseAudio=null;}}
function openModal(content){stopPhraseAudio();$('#modal-body').innerHTML=content;hydrateIcons($('#modal-body'));if(!$('#modal').open)$('#modal').showModal();$('#modal').scrollTop=0;const title=$('#modal-title');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}}
function closeModal(){stopPhraseAudio();$('#modal').close();modalPhrase=null;}
function showPhrase(id){const p=phrases.find(x=>x.id===id);if(!p)return;modalPhrase=p;const src=safeURL(p.audio,{asset:true});openModal(`<span class="eyebrow">${esc(profile.language.label)} · ${esc(p.category)}</span><h2 id="modal-title">${esc(p.text)}</h2><p class="large-japanese" lang="${esc(profile.language.code||'und')}">${esc(p.translation)}</p><p class="pronunciation">${esc(p.reading)}</p><div class="modal-actions">${src?`<button class="button primary speak-button" data-action="speak">${icon('volume')} ${esc(profile.language.label)}로 듣기</button>`:''}<button class="button" data-action="copy-phrase">${icon('copy')} 복사</button></div>${src?`<audio id="phrase-audio" class="phrase-audio" controls preload="metadata" playsinline src="${esc(src)}" aria-label="${esc(p.text)} 음성"></audio><p id="audio-status" class="storage-note" role="status" aria-live="polite">듣기 버튼이나 아래 재생 버튼을 눌러 주세요.</p><a class="subtle-link" href="${esc(src)}" target="_blank" rel="noopener noreferrer">음성 파일만 열기 ↗</a>`:'<p class="storage-note">음성이 없는 카드예요. 큰 글씨를 보여주거나 복사해 주세요.</p>'}`);
 if(!src)return;
 const player=$('#phrase-audio');currentPhraseAudio=player;
 const report=text=>{if(currentPhraseAudio===player&&$('#audio-status'))$('#audio-status').textContent=text;};
 player.addEventListener('playing',()=>{if(currentPhraseAudio!==player)return;clearTimeout(audioStartTimer);report('음성을 재생하고 있어요.');});
 player.addEventListener('ended',()=>{if(currentPhraseAudio!==player)return;clearTimeout(audioStartTimer);report('재생을 마쳤어요. 다시 들으려면 듣기 버튼을 누르세요.');});
 player.addEventListener('pause',()=>{if(currentPhraseAudio!==player)return;clearTimeout(audioStartTimer);if(!player.ended)report('일시 정지했어요. 재생 버튼을 눌러 이어 들을 수 있어요.');});
 player.addEventListener('error',()=>{if(currentPhraseAudio!==player)return;clearTimeout(audioStartTimer);report('음성을 불러오지 못했어요. 인터넷 연결을 확인하거나 음성 파일만 열기를 눌러 주세요.');});
}
function speak(){const player=currentPhraseAudio;if(!player)return;const attempt=++audioAttempt;clearTimeout(audioStartTimer);try{player.currentTime=0;player.muted=false;player.volume=1;$('#audio-status').textContent='음성을 준비하고 있어요…';audioStartTimer=setTimeout(()=>{if(currentPhraseAudio===player&&attempt===audioAttempt)$('#audio-status').textContent='재생이 지연되고 있어요. 아래 재생 버튼이나 음성 파일만 열기를 눌러 주세요.';},8000);const play=player.play();if(play&&typeof play.catch==='function')play.catch(error=>{if(currentPhraseAudio!==player||attempt!==audioAttempt)return;clearTimeout(audioStartTimer);$('#audio-status').textContent=error.name==='NotAllowedError'?'브라우저가 재생을 막았어요. 아래 재생 버튼을 누르거나 음성 파일만 열기를 눌러 주세요.':'음성을 불러오지 못했어요. 인터넷 연결을 확인하거나 음성 파일만 열기를 눌러 주세요.';});}catch{clearTimeout(audioStartTimer);$('#audio-status').textContent='아래 재생 버튼이나 음성 파일만 열기를 눌러 주세요.';}}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('복사했어요.');}catch{toast('복사를 지원하지 않아요. 글씨를 길게 눌러 복사해 주세요.');}}
function showHotel(){const h=profile.hotel;if(!h){toast('등록된 숙소가 없어요.');return;}openModal(`<span class="eyebrow">OUR STAY</span><h2 id="modal-title">기사님께 보여주세요</h2><p class="large-japanese" lang="${esc(profile.language.code||'und')}">${esc(h.request||h.localName||h.name)}</p><div class="help-intro preserve-lines">${esc(hotelText)}</div><div class="modal-actions"><a class="button primary" href="${esc(mapURL(hotelQuery,'driving'))}" target="_blank" rel="noopener noreferrer">${icon('pin')} 숙소 길 찾기</a><button class="button" data-action="copy-hotel">${icon('copy')} 주소 복사</button></div><div class="modal-actions">${h.phone?`<a class="button" href="${esc(phoneURL(h.phone))}">${icon('call')} 숙소에 전화</a>`:''}${phrases.some(p=>p.id===h.phraseId)?`<button class="button" data-action="phrase" data-id="${esc(h.phraseId)}">${icon('volume')} ${esc(profile.language.label)}로 읽기</button>`:''}</div>${h.url?`<a class="subtle-link" href="${esc(safeURL(h.url))}" target="_blank" rel="noopener noreferrer">주소·연락처: 숙소 공식 안내 ↗</a>`:''}`);}
function showHelp(){const h=profile.help;openModal(`<span class="eyebrow">WE ARE HERE FOR YOU</span><h2 id="modal-title">도움이 필요할 때</h2><p class="help-intro">${esc(h.intro)}</p><div class="modal-actions">${h.phraseIds.map(id=>phrases.find(p=>p.id===id)).filter(Boolean).map(p=>`<button class="button" data-action="phrase" data-id="${esc(p.id)}">${esc(p.text)}</button>`).join('')}</div>${h.contacts.map(c=>`<div class="contact-card"><div><strong>${esc(c.name)}</strong><small>${esc(c.note)}</small></div><a href="${esc(phoneURL(c.phone))}">${icon('call')} ${esc(c.label)}</a></div>`).join('')}${h.contacts.length?'<p class="storage-note">통화 가능한 회선이 필요해요. 데이터 전용 회선이라면 주변 직원에게 전화 도움을 요청해 주세요.</p>':''}${h.source?`<a class="subtle-link" href="${esc(safeURL(h.source.url))}" target="_blank" rel="noopener noreferrer">${esc(h.source.label)} ↗</a>`:''}`);}
function showSources(){openModal(`<span class="eyebrow">TRAVEL NOTES</span><h2 id="modal-title">여행 정보와 이용 안내</h2><ul class="modal-list">${profile.sourceNotes.map(n=>`<li>${esc(n)}</li>`).join('')}<li>일정 수정, 체크, 메모, 환율은 이 브라우저에만 저장돼요. 기기 간 자동 동기화는 없어요. 여행 가방에서 기록과 템플릿을 내보내고 가져올 수 있어요.</li><li>길 찾기는 Google 지도로 연결돼요. 출발지·교통수단·소요시간은 지도에서 확인해 주세요.</li><li>환율은 직접 입력해요. 여행 카드는 인터넷에 연결해 사용해 주세요.</li></ul><div class="source-list">${profile.sources.map(l=>`<a href="${esc(safeURL(l.url))}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('')}</div>`);}
function editEvent(id=null,place=null){if(!dayInfo.length){toast('새 여행 만들기에서 여행 기간을 먼저 입력해 주세요.');return;}const existing=id?eventsFor(selectedDay).find(e=>e.id===id):null;if(id&&!existing)return;const e=existing||{title:place?.name||'',time:'',note:place?[place.area+' · '+place.kind,place.desc,place.tip].join('\n'):'',query:place?.query||'',icon:place?.icon||'pin'};
 openModal(`<span class="eyebrow">MY TRAVEL PLAN</span><h2 id="modal-title">${existing?'일정 수정':place?'가고 싶은 곳 담기':'나의 일정 추가'}</h2><form class="edit-form" id="event-form" data-event-id="${esc(id||'')}" data-event-icon="${esc(e.icon)}" data-event-mode="${esc(e.mode||'transit')}"><div class="form-row"><label>날짜<select name="day">${dayInfo.map((d,i)=>`<option value="${i}" ${i===selectedDay?'selected':''}>${esc(dateLabel(d.date,profile.locale))}</option>`).join('')}</select></label><label>시간 또는 때<input name="time" maxlength="24" placeholder="예: 14:00 / 오후" value="${esc(e.time)}"></label></div><label>무엇을 할까?<input name="title" maxlength="80" value="${esc(e.title)}" placeholder="예: 편의점에서 간식 고르기" required></label><label>메모<textarea name="note" maxlength="500" rows="3">${esc(e.note)}</textarea></label><label>지도에서 찾을 장소<input name="query" maxlength="150" value="${esc(e.query)}" placeholder="장소 이름과 지역을 적어주세요"></label><p class="storage-note">지금 사용하는 기기에 저장돼요.${existing?'':' 새 일정은 해당 날짜의 맨 아래에 추가돼요.'}</p><div class="modal-actions">${existing?`<button type="button" class="button danger" data-action="delete-event" data-id="${esc(id)}">삭제</button>`:'<button type="button" class="button" data-action="close-modal">취소</button>'}<button type="submit" class="button primary">저장하기</button></div></form>`);}
function persistEvent(form){const f=new FormData(form);const title=String(f.get('title')||'').trim();const day=Number(f.get('day'));if(!title||!Number.isInteger(day)||day<0||day>=dayInfo.length){toast('날짜와 일정 이름을 확인해 주세요.');return;}if(eventsFor(day).length>=200&&!eventsFor(day).some(e=>e.id===form.dataset.eventId)){toast('하루에 최대 200개까지 저장할 수 있어요.');return;}
 const id=form.dataset.eventId||`custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
 const event={id,title:title.slice(0,80),time:String(f.get('time')||'').trim().slice(0,24)||'자유롭게',note:String(f.get('note')||'').trim().slice(0,500),query:String(f.get('query')||'').trim().slice(0,150),icon:form.dataset.eventIcon||'pin',mode:['driving','walking','transit'].includes(form.dataset.eventMode)?form.dataset.eventMode:'transit',tag:form.dataset.eventId?'직접 수정':'나의 일정'};
 const originalDay=Object.keys(state.events).find(d=>state.events[d].some(e=>e.id===id));
 if(originalDay!==undefined && originalDay===dayInfo[day].id){setEvents(day,eventsFor(day).map(e=>e.id===id?event:e));}else{if(originalDay!==undefined)state.events[originalDay]=state.events[originalDay].filter(e=>e.id!==id);eventsFor(day).push(event);}
 const saved=save();selectedDay=day;renderDays();closeModal();navigate('trip');if(saved)toast(`${dateLabel(dayInfo[day].date,profile.locale)} 일정에 저장했어요.`);
}
function showInstall(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.then(()=>{installPrompt=null;});return;}openModal(`<span class="eyebrow">TAKE YOUR TRIP WITH YOU</span><h2 id="modal-title">홈 화면에 추가하기</h2><p class="modal-description">휴대폰 브라우저에서 이 앱을 연 뒤 아래 순서로 추가해 주세요.</p><h3>안드로이드 · Chrome</h3><p class="modal-description">오른쪽 위 ⋮ 메뉴 → <b>홈 화면에 추가</b> 또는 <b>앱 설치</b></p><h3>아이폰 · Safari</h3><p class="modal-description">공유 버튼 → <b>홈 화면에 추가</b></p><p class="storage-note">메뉴 이름은 브라우저에 따라 달라요. 로그인 없이 바로 사용할 수 있어요. 인터넷에 연결해 사용해 주세요.</p>`);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='plan-trip'){if(!dayInfo.length){toast('여행 기간을 먼저 입력해 주세요.');return;}openPlanner({profile,state,openModal,save,onApplied:day=>{selectedDay=dayInfo.findIndex(d=>d.id===day);renderDays();closeModal();navigate('trip');toast('동행자에 맞춘 일정을 추가했어요. 각 일정은 자유롭게 수정할 수 있어요.');}});}
 else if(a==='new-profile'||a==='edit-profile'){clearTimeout(memoTimer);if(storageAvailable)save();openEditor({template:builtInProfiles.find(p=>p.id==='template'),profile:a==='edit-profile'?profile:null,builtIns:builtInProfiles,storage,openModal,onSaved:p=>switchProfile(p.id)});}
 else if(a==='export-record'){try{if(loaded.raw&&!storageAvailable)offerDownload(`${profile.id}-original-recovery.json`,loaded.raw,'읽지 못한 저장 원본이에요. 복구를 위해 이 파일을 보관해 주세요.');else offerDownload(`${profile.id}-record.json`,exportState(profile,state),'동행자 정보, 개인 메모와 완료·준비물 체크를 포함한 기록 백업이에요.');}catch(error){toast(error.message);}}
 else if(a==='download-export'&&pendingExport){downloadFile(pendingExport.name,pendingExport.text);toast('파일 저장이 시작되지 않으면 백업 내용 복사를 이용해 주세요.');}
 else if(a==='copy-export'&&pendingExport){copy(pendingExport.text);}
 else if(a==='list-backups'){try{recordBackups=listRecordBackups(storage,profile);openModal(`<h2 id="modal-title">이전 기록 복원</h2><p class="modal-description">가져오기 직전 기록과 기존 도쿄 저장 원본이에요. 선택한 뒤 내용을 확인하고 복원할 수 있어요.</p>${recordBackups.length?recordBackups.map((item,i)=>`<button class="button backup-choice" data-action="restore-backup" data-backup="${i}">${esc(item.label)}</button>`).join(''):'<p>아직 보관된 이전 기록이 없어요.</p>'}`);}catch(error){toast(error.message);}}
 else if(a==='restore-backup'){try{reviewImport(recordBackups[Number(b.dataset.backup)].raw);}catch(error){toast(error.message);}}
 else if(a==='export-catalog'){try{offerDownload('travel-catalog-recovery.json',storage.getItem(catalogKey)||'','읽지 못한 여행 목록의 원본이에요. 복구를 위해 보관해 주세요.');}catch(error){toast(error.message);}}
 else if(a==='import-record'){$('#record-file').click();}
 else if(a==='export-profile'){try{offerDownload(`${profile.id}-template.json`,exportProfile(builtInProfiles.some(p=>p.id===profile.id)?{...profile,id:`trip-${crypto.randomUUID()}`}:profile,state),'현재 일정과 여행 정보를 담은 배포용 파일이에요. 동행자 정보, 개인 메모와 완료·준비물 체크는 포함하지 않아요.');}catch(error){toast(error.message);}}
 else if(a==='import-profile'){$('#profile-file').click();}
 else if(a==='confirm-import'){try{clearTimeout(memoTimer);if(storageAvailable&&!save()){$('#import-error').textContent='현재 기록을 저장하지 못해 가져오기를 중단했어요.';return;}state=importState(storage,profile,pendingImport);pendingImport=null;storageAvailable=true;$('#storage-warning').hidden=true;renderDays();renderPacking();$('#trip-memo').value=state.memo;$('#rate').value=state.rate;calculate();closeModal();toast('기록을 가져왔어요. 이전 기록은 이 기기에 백업했어요.');}catch(error){$('#import-error').textContent=error.message;}}
 else if(a==='navigate'){navigate(b.dataset.view);}
 else if(a==='day'){selectDay(Number(b.dataset.day));}
 else if(a==='check-event'){toggleDone(b.dataset.id);}
 else if(a==='place-filter'){placeFilter=b.dataset.filter;if(placeFilter==='호텔 근처'){placeArea='전체 지역';$('#place-area').value=placeArea;}renderPlaces();}
 else if(a==='reset-places'){resetPlaces();}
 else if(a==='phrase-filter'){phraseFilter=b.dataset.filter;renderPhrases();}
 else if(a==='phrase'){showPhrase(b.dataset.id);}
 else if(a==='rest'){showPhrase('rest');}
 else if(a==='speak'){speak();}
 else if(a==='copy-phrase'&&modalPhrase){copy(modalPhrase.translation);}
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
 else if(a==='delete-event'){if(!window.confirm('이 일정을 삭제할까요?'))return;setEvents(selectedDay,eventsFor(selectedDay).filter(x=>x.id!==b.dataset.id));state.done=state.done.filter(x=>x!==b.dataset.id);const saved=save();renderDays();closeModal();if(saved)toast('일정을 삭제했어요.');}
});
document.addEventListener('submit',e=>{if(e.target.id==='event-form'){e.preventDefault();persistEvent(e.target);}});
document.addEventListener('change',e=>{if(e.target.matches('[data-pack]')){const index=e.target.dataset.pack;state.packed=e.target.checked?[...new Set([...state.packed,index])]:state.packed.filter(x=>x!==index);save();$('#packing-count').textContent=`${state.packed.length} / ${packing.length}`;}});
$('#day-tabs').addEventListener('keydown',e=>{if(!dayInfo.length)return;if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let d=selectedDay;if(e.key==='ArrowLeft')d=(d+dayInfo.length-1)%dayInfo.length;if(e.key==='ArrowRight')d=(d+1)%dayInfo.length;if(e.key==='Home')d=0;if(e.key==='End')d=dayInfo.length-1;selectDay(d);$(`#day-tab-${d}`).focus();});
$('#modal').addEventListener('click',e=>{if(e.target!==$('#modal'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();});
$('#modal').addEventListener('close',()=>{stopPhraseAudio();modalPhrase=null;});
$('#yen').addEventListener('input',calculate);$('#rate').addEventListener('input',()=>{const value=$('#rate').value;if(value===''||(Number.isFinite(Number(value))&&Number(value)>0&&Number(value)<=100000)){state.rate=value;save();}calculate();});
let memoTimer;$('#trip-memo').addEventListener('input',()=>{state.memo=$('#trip-memo').value;$('#memo-status').textContent='저장 중…';clearTimeout(memoTimer);memoTimer=setTimeout(()=>{$('#memo-status').textContent=save()?'이 기기에 저장됨':'저장할 수 없음';},400);});
window.addEventListener('pagehide',()=>{stopPhraseAudio();if(memoTimer){clearTimeout(memoTimer);save();}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
function switchProfile(id){clearTimeout(memoTimer);if(storageAvailable&&!save())return;const url=new URL(location.href);url.searchParams.set('trip',id);location.assign(url.href);}
$('#trip-profile').addEventListener('change',()=>switchProfile($('#trip-profile').value));
let pendingImport=null,pendingExport=null,recordBackups=[];
function offerDownload(name,text,description){pendingExport={name,text};openModal(`<h2 id="modal-title">파일 내보내기</h2><p class="modal-description">${esc(description)}</p><div class="modal-actions"><button class="button primary" data-action="download-export">파일 저장</button><button class="button" data-action="copy-export">백업 내용 복사</button></div><p class="storage-note">파일 저장을 지원하지 않는 브라우저에서는 내용을 복사해 .json 파일로 보관할 수 있어요.</p><details><summary>백업 내용 보기</summary><textarea readonly rows="8" aria-label="백업 JSON">${esc(text)}</textarea></details>`);}
function reviewImport(text){pendingImport=parseRecord(text,profile);const count=Object.values(pendingImport.events).flat().length;openModal(`<h2 id="modal-title">기록 가져오기 확인</h2><p class="modal-description">${esc(profile.name)} · 일정 ${count}개 · 완료 ${pendingImport.done.length}개 · 준비물 ${pendingImport.packed.length}개</p><p>현재 기록을 이 파일의 내용으로 교체해요. 교체 전 기록은 이 기기에 백업해요.</p><p id="import-error" class="form-error" role="alert"></p><div class="modal-actions"><button class="button" data-action="close-modal">취소</button><button class="button primary" data-action="confirm-import">백업 후 가져오기</button></div>`);}
$('#record-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>5*1024*1024)throw new Error('파일은 5MB 이하만 가져올 수 있어요.');reviewImport(await file.text());}catch(error){toast(error.message);}});
$('#profile-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>5*1024*1024)throw new Error('파일은 5MB 이하만 가져올 수 있어요.');const imported=parseProfile(await file.text());addProfile(storage,builtInProfiles,imported);switchProfile(imported.id);}catch(error){toast(error.message);}});
function updateClock(){if(!profile.timeZone){$('#tokyo-clock').textContent='';return;}$('#tokyo-clock').textContent=profile.cityLabel+' '+new Intl.DateTimeFormat('en-GB',{timeZone:profile.timeZone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
renderProfile(profile,profiles,{esc,icon});
$('#edit-profile').hidden=!dayInfo.length||builtInProfiles.some(p=>p.id===profile.id);
if(dayInfo.length){const daysLeft=Math.ceil((Date.parse(dayInfo[0].date)-Date.parse(dateNow))/86400000);$('#trip-count').textContent=daysLeft>0?`${profile.city}까지 D−${daysLeft} · ${dayInfo.length}일`:dateNow<=dayInfo.at(-1).date?`${profile.city} 여행 DAY ${1-daysLeft}`:`우리의 ${profile.city} 여행 기록`;}else $('#trip-count').textContent='목적지와 날짜를 입력해 주세요';
$('#place-area').innerHTML=['전체 지역',...new Set(places.map(p=>p.area))].map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
$('#place-search').addEventListener('input',()=>{placeSearch=$('#place-search').value;renderPlaces();});
$('#place-area').addEventListener('change',()=>{placeArea=$('#place-area').value;if(placeFilter==='호텔 근처'&&placeArea!=='전체 지역'&&placeArea!==profile.hotel?.nearbyArea)placeFilter='전체';renderPlaces();});
renderNav();renderDays();renderPlaces();renderPhrases();renderPacking();hydrateIcons();$('#trip-memo').value=state.memo;$('#rate').value=state.rate;calculate();updateClock();setInterval(updateClock,30000);if(!navigate(location.hash.slice(1)||'trip',false))navigate('trip',false);
if(loaded.migrated)toast('기존 도쿄 기록을 이어왔어요. 이전 저장 원본도 그대로 보관했어요.');
if(!storageAvailable)showStorageWarning('기존 기록을 읽거나 저장할 수 없어 자동 저장을 멈췄어요. 여행 가방의 기록 내보내기로 원본을 보관해 주세요.');
if(catalogError){showStorageWarning('저장된 여행 목록을 읽을 수 없어요. 목록을 덮어쓰지 않았어요. '+catalogError);$('#storage-warning').insertAdjacentHTML('beforeend',' <button class="button" data-action="export-catalog">목록 원본 내보내기</button>');}
// Expose the same journeys to supported, user-authorized browser agents.
if(dayInfo.length&&document.modelContext?.registerTool){const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_travel_day',title:'날짜별 여행 일정 읽기',description:'선택한 여행의 날짜 일정을 읽습니다. 상태를 바꾸지 않습니다.',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:dayInfo.length}},required:['day'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||!Number.isInteger(input.day)||input.day<1||input.day>dayInfo.length)throw new Error(`day must be 1 through ${dayInfo.length}`);return{date:dayInfo[input.day-1].date,events:eventsFor(input.day-1).map(e=>({...e,completed:state.done.includes(e.id)}))};}});
 register({name:'show_travel_day',title:'여행 날짜 열기',description:'여행 일정 화면에서 지정한 날짜를 보여줍니다. 완료 상태나 내용은 바꾸지 않습니다.',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:dayInfo.length}},required:['day'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.day)||input.day<1||input.day>dayInfo.length)throw new Error(`day must be 1 through ${dayInfo.length}`);selectDay(input.day-1);navigate('trip');return{visibleDate:dayInfo[input.day-1].date};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

}
try {startApp();} catch(error) {
  document.querySelectorAll('.view,.profile-toolbar,.sidebar,.bottom-nav').forEach(el=>el.hidden=true);
  const box=document.querySelector('#app-error');box.hidden=false;
  const message=document.createElement('p');message.textContent=error.message;
  const link=document.createElement('a');link.href='./?trip=template';link.className='button primary';link.textContent='여행 선택과 템플릿 가져오기';
  box.replaceChildren(message,link);
}
