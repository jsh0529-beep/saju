import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
import * as trips from '../trips/index.js';
import * as profileUtils from '../lib/profile.js';
import * as recordUtils from '../lib/storage.js';
import * as catalogUtils from '../lib/profiles-store.js';
import * as editor from '../lib/editor.js';
import * as view from '../lib/view-profile.js';
import * as planningView from '../lib/planner-view.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const tokyo=trips.builtInProfiles[0],template=trips.builtInProfiles[1];
function boot(t,{url='https://example.test/saju/tokyo/',entries={}}={}) {
  const errors=[],console=new VirtualConsole();console.on('jsdomError',error=>{if(!error.message.includes('Not implemented: navigation'))errors.push(error);});
  const dom=new JSDOM(html,{url,runScripts:'outside-only',virtualConsole:console}),w=dom.window;
  for(const key of ['window','document','location','FormData'])Object.defineProperty(globalThis,key,{value:key==='window'?w:w[key],configurable:true,writable:true});
  Object.assign(w,{...trips,...profileUtils,...recordUtils,...catalogUtils,...editor,...view,...planningView});
  w.scrollTo=()=>{};w.setInterval=()=>0;w.setTimeout=()=>0;w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.HTMLMediaElement.prototype.pause=()=>{};w.matchMedia=()=>({matches:true});w.confirm=()=>true;
  for(const [key,value] of Object.entries(entries))w.localStorage.setItem(key,value);
  w.eval(source);t.after(()=>{w.close();assert.deepEqual(errors,[]);});
  return {w,doc:w.document,click:selector=>{const el=w.document.querySelector(selector);assert.ok(el,selector);el.click();},input:(selector,value)=>{const el=w.document.querySelector(selector);assert.ok(el,selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));}};
}
test('old URL and hashes render Tokyo, its five dates, 34 places, 14 phrases and links',t=>{
  const {w,doc,click}=boot(t,{url:'https://example.test/saju/tokyo/#phrases'});
  assert.equal(doc.querySelector('#app-error').hidden,true);assert.equal(doc.title,tokyo.name);assert.equal(doc.querySelector('#view-phrases').hidden,false);
  assert.equal(doc.querySelectorAll('.day-tab').length,5);assert.equal(doc.querySelectorAll('.place-card').length,34);assert.equal(doc.querySelectorAll('.phrase-card').length,14);
  assert.equal(doc.querySelector('#talk-link').getAttribute('href'),'../talk/?v=3');
  click('[data-action="hotel"]');assert.match(doc.querySelector('#modal-body').textContent,/東京ドームホテル/);assert.equal(doc.querySelector('#modal-body a[href^="tel:"]').getAttribute('href'),'tel:+81358052111');
  click('[data-action="phrase"][data-id="hotel"]');assert.equal(doc.querySelector('#phrase-audio').getAttribute('src'),'./assets/audio/hotel.mp3');
  assert.equal(w.location.hash,'#phrases');
});
test('template renders with no destination, hotel, Japanese cards or fixed dates',t=>{
  const {doc,click}=boot(t,{url:'https://example.test/saju/tokyo/?trip=template#trip'});
  assert.equal(doc.querySelector('#app-error').hidden,true);assert.equal(doc.querySelectorAll('.day-tab').length,0);
  assert.equal(doc.querySelector('#hotel-card').hidden,true);assert.equal(doc.querySelector('#flight-card').hidden,true);assert.equal(doc.querySelector('#hero-image').hidden,true);
  assert.doesNotMatch(doc.querySelector('main').textContent,/東京|Tokyo|일본어|9월|도쿄돔/);
  click('[data-action="add-event"]');assert.match(doc.querySelector('#toast').textContent,/여행 기간/);
});
test('unknown trip reports error instead of loading or saving Tokyo',t=>{
  const {w,doc}=boot(t,{url:'https://example.test/saju/tokyo/?trip=missing#bag'});
  assert.equal(doc.querySelector('#app-error').hidden,false);assert.equal(w.localStorage.length,0);
});
test('one-day custom profile supports editing, completion, packing, custom language and currency',t=>{
  const p=profileUtils.clone(template);p.id='test-one-day';p.name='사용자 여행';p.timeZone='UTC';p.days=profileUtils.makeDays('2028-01-01','2028-01-01');
  p.language={code:'en',label:'영어'};p.phrases=[{id:'hello',category:'직접 입력',text:'인사',translation:'Hello <b>literal</b>',reading:'헬로'}];p.packing=[{id:'passport',label:'준비물'}];p.currency={from:'USD',to:'KRW',unit:1,fromLabel:'USD',toLabel:'KRW',symbol:'$'};
  const {w,doc,click,input}=boot(t,{url:`https://example.test/saju/tokyo/?trip=${p.id}`,entries:{[catalogUtils.catalogKey]:JSON.stringify({version:1,profiles:[p]})}});
  assert.equal(doc.querySelector('#app-error').hidden,true);assert.equal(doc.querySelectorAll('.day-tab').length,1);
  click('[data-action="add-event"]');input('#event-form [name="title"]','첫 일정');input('#event-form [name="note"]','<script>bad</script>');doc.querySelector('#event-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(doc.querySelectorAll('.event-card').length,1);assert.match(doc.querySelector('.event-card').textContent,/<script>bad<\/script>/);assert.equal(doc.querySelector('.event-card script'),null);
  click('[data-action="check-event"]');click('[data-pack="passport"]');
  const saved=JSON.parse(w.localStorage.getItem(recordUtils.storageKey(p)));assert.equal(saved.done.length,1);assert.deepEqual(saved.packed,['passport']);
  input('#rate','1400');input('#yen','2');assert.match(doc.querySelector('#won').textContent,/2,800/);
  click('[data-action="phrase"][data-id="hello"]');assert.equal(doc.querySelector('#phrase-audio'),null);assert.equal(doc.querySelector('.large-japanese').lang,'en');assert.equal(doc.querySelector('.large-japanese b'),null);
  doc.querySelector('#day-tabs').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(doc.querySelector('[aria-selected="true"]').id,'day-tab-0');
});
test('builder creates a trip from input across year boundary, with catalog, phrases and packing',t=>{
  const {w,doc,click,input}=boot(t,{url:'https://example.test/saju/tokyo/?trip=template'});
  click('[data-action="new-profile"]');
  for(const [key,value] of Object.entries({name:'입력 테스트 여행',city:'사용자 입력 도시',start:'2027-12-30',end:'2028-01-03',timeZone:'UTC',languageCode:'en',hotelName:'입력 숙소',hotelAddress:'입력 주소'}))input(`#profile-form [name="${key}"]`,value);
  click('[data-editor-add="places"]');input('[data-kind="places"] [name="name"]','입력 장소');input('[data-kind="places"] [name="category"]','직접 분류');
  click('[data-editor-add="phrases"]');input('[data-kind="phrases"] [name="text"]','인사');input('[data-kind="phrases"] [name="translation"]','Hello');
  click('[data-editor-add="packing"]');input('[data-kind="packing"] [name="label"]','입력 준비물');
  doc.querySelector('#profile-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(doc.querySelector('#profile-error').textContent,'');
  const profiles=JSON.parse(w.localStorage.getItem(catalogUtils.catalogKey)).profiles;assert.equal(profiles.length,1);
  const p=profiles[0];assert.equal(p.city,'사용자 입력 도시');assert.equal(p.days.length,5);assert.equal(p.days.at(-1).date,'2028-01-03');assert.equal(p.hotel.name,'입력 숙소');assert.equal(p.places[0].name,'입력 장소');assert.equal(p.phrases[0].translation,'Hello');assert.equal(p.packing[0].label,'입력 준비물');
  assert.equal(w.localStorage.getItem(tokyo.legacyStorageKey),null);
});
test('corrupt storage remains untouched after memo input and completion click',t=>{
  const key=recordUtils.storageKey(tokyo);const {w,doc,input,click}=boot(t,{entries:{[key]:'{broken'}});
  assert.equal(doc.querySelector('#storage-warning').hidden,false);input('#trip-memo','새 메모');click('[data-action="check-event"]');assert.equal(w.localStorage.getItem(key),'{broken');
});
test('export screen separates personal record from distributable template and provides copy fallback',t=>{
  const {doc,click,input}=boot(t);
  input('#trip-memo','개인 메모만의 표시');
  click('[data-action="export-record"]');
  const record=JSON.parse(doc.querySelector('[aria-label="백업 JSON"]').value);
  assert.equal(record.state.memo,'개인 메모만의 표시');assert.ok(doc.querySelector('[data-action="copy-export"]'));
  click('[data-action="close-modal"]');click('[data-action="export-profile"]');
  const distributed=doc.querySelector('[aria-label="백업 JSON"]').value;
  assert.equal(distributed.includes('개인 메모만의 표시'),false);
  assert.notEqual(JSON.parse(distributed).profile.id,tokyo.id);
  assert.equal(JSON.parse(distributed).profile.legacyStorageKey,undefined);
});
test('file import waits for confirmation, flushes pending memo, restores data and offers previous record',async t=>{
  const {w,doc,click,input}=boot(t);
  input('#trip-memo','가져오기 직전 아직 저장되지 않은 메모');
  const imported={...recordUtils.freshState(tokyo),memo:'파일에서 온 메모'};
  const raw=recordUtils.exportState(tokyo,imported),file=doc.querySelector('#record-file');
  Object.defineProperty(file,'files',{value:[{size:raw.length,text:async()=>raw}],configurable:true});
  file.dispatchEvent(new w.Event('change',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(doc.querySelector('#modal-title').textContent,'기록 가져오기 확인');assert.equal(w.localStorage.getItem(recordUtils.storageKey(tokyo)),null);
  click('[data-action="confirm-import"]');assert.equal(doc.querySelector('#trip-memo').value,'파일에서 온 메모');
  click('[data-action="list-backups"]');assert.match(doc.querySelector('#modal-body').textContent,/가져오기 전 기록/);
  const backup=recordUtils.listRecordBackups(w.localStorage,tokyo)[0];assert.equal(JSON.parse(backup.raw).memo,'가져오기 직전 아직 저장되지 않은 메모');
  click('[data-action="restore-backup"]');click('[data-action="confirm-import"]');assert.equal(doc.querySelector('#trip-memo').value,'가져오기 직전 아직 저장되지 않은 메모');
});
test('editing a custom profile preserves identity, dates, saved events and packing IDs',t=>{
  const p={...profileUtils.clone(template),id:'test-edit',name:'수정 전',timeZone:'UTC',days:profileUtils.makeDays('2028-01-01','2028-01-01'),packing:[{id:'stable-pack',label:'준비물'}]};
  const record=recordUtils.freshState(p);record.events[p.days[0].id]=profileUtils.clone(tokyo.days[0].events);record.packed=['stable-pack'];record.memo='내 기록';
  const {w,doc,click,input}=boot(t,{url:`https://example.test/saju/tokyo/?trip=${p.id}`,entries:{[catalogUtils.catalogKey]:JSON.stringify({version:1,profiles:[p]}),[recordUtils.storageKey(p)]:JSON.stringify(record)}});
  click('[data-action="edit-profile"]');input('#profile-form [name="name"]','수정 후');input('#profile-form [name="city"]','입력 도시');input('[data-kind="packing"] [name="label"]','준비물 이름 수정');
  doc.querySelector('#profile-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(doc.querySelector('#profile-error').textContent,'');const updated=catalogUtils.loadProfiles(w.localStorage,trips.builtInProfiles)[0];
  assert.equal(updated.id,p.id);assert.deepEqual(updated.days,p.days);assert.equal(updated.name,'수정 후');assert.equal(updated.packing[0].id,'stable-pack');
  assert.deepEqual(recordUtils.loadState(w.localStorage,updated).state,record);
});
test('companions produce a preview for an empty trip and apply only after the user chooses',t=>{
  const p={...profileUtils.clone(template),id:'test-planning',name:'빈 일정',timeZone:'UTC',days:profileUtils.makeDays('2028-01-01','2028-01-02')};
  const {w,doc,click,input}=boot(t,{url:`https://example.test/saju/tokyo/?trip=${p.id}`,entries:{[catalogUtils.catalogKey]:JSON.stringify({version:1,profiles:[p]})}});
  click('[data-action="plan-trip"]');input('[name="companionName"]','나');click('[name="interest"][value="nature"]');
  doc.querySelector('#companion-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(doc.querySelector('#modal-title').textContent,'함께 가는 여행 일정');assert.match(doc.querySelector('.plan-preview').textContent,/산책/);
  const preview=JSON.parse(w.localStorage.getItem(recordUtils.storageKey(p)));assert.deepEqual(preview.events[p.days[0].id],[]);assert.equal(preview.companions[0].name,'나');
  click('#apply-plan');assert.ok(doc.querySelectorAll('.event-card').length>0);assert.equal(doc.querySelector('#modal').open,false);
  const applied=JSON.parse(w.localStorage.getItem(recordUtils.storageKey(p)));assert.ok(applied.events[p.days[1].id].length>0);
});
test('Tokyo has no dates preselected for suggestions, and existing events remain intact',t=>{
  const {w,doc,click,input}=boot(t);click('[data-action="plan-trip"]');
  assert.equal(doc.querySelectorAll('[name="planDay"]:checked').length,0);
  input('[name="companionName"]','동행자');click('[name="planDay"][value="2026-09-25"]');
  doc.querySelector('#companion-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));click('#apply-plan');
  const record=JSON.parse(w.localStorage.getItem(recordUtils.storageKey(tokyo)));assert.deepEqual(record.events['2026-09-25'].slice(0,tokyo.days[0].events.length),tokyo.days[0].events);assert.deepEqual(record.events['2026-09-26'],tokyo.days[1].events);
});
