import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import tokyo from '../trips/tokyo-2026/profile.js';
import template from '../trips/template/profile.js';
import {clone,makeDays,validateProfile,localDate,initialDay,safeURL} from '../lib/profile.js';
import {loadState,freshState,storageKey,saveState,exportState,parseRecord,importState,listRecordBackups} from '../lib/storage.js';
import {addProfile,loadProfiles,exportProfile,parseProfile,catalogKey} from '../lib/profiles-store.js';

export class MemoryStorage {
  constructor(entries=[]){this.values=new Map(entries);this.fail=null;}
  getItem(key){return this.values.get(key)??null;}
  get length(){return this.values.size;}
  key(index){return [...this.values.keys()][index]??null;}
  setItem(key,value){if(this.fail?.(key))throw new Error('quota');this.values.set(key,String(value));}
}
test('all original Tokyo default events match the pre-refactor data fingerprint',()=>{
  // Captured from app.js at b8e841a683b4189e3e6569e5134c8db92da384ac.
  const events=Object.fromEntries(tokyo.days.map((d,i)=>[i,d.events]));
  assert.equal(createHash('sha256').update(JSON.stringify(events)).digest('hex'),'71dec67e3dfe2c08f34dc466f89939ab31c13468343ead5cc4bab2485905c04e');
});
function legacy() {
  return {itineraryVersion:'2026-09-22-photo',events:{
    0:[{...tokyo.days[0].events[0],title:'직접 수정한 출발 일정',note:'내 메모'}],1:[],
    2:[{id:'custom-user-1',title:'나만의 장소',time:'오후',note:'저장한 메모',query:'사용자 지도 검색어',icon:'pin',tag:'나의 일정',mode:'walking'}],
    3:clone(tokyo.days[3].events),4:clone(tokyo.days[4].events)
  },done:['custom-user-1','photo26-arrival-0'],packed:[0,3],memo:'이전 여행 기록 🧳',rate:'950'};
}
test('migration preserves edited/deleted defaults, custom events, completion, packing, memo, rate and original bytes',()=>{
  const old=legacy(),raw=JSON.stringify(old),store=new MemoryStorage([[tokyo.legacyStorageKey,raw]]);
  const result=loadState(store,tokyo);
  assert.equal(result.migrated,true);assert.equal(result.writable,true);
  for(let i=0;i<5;i++)assert.deepEqual(result.state.events[tokyo.days[i].id],old.events[i]);
  assert.deepEqual(result.state.done,old.done);assert.deepEqual(result.state.packed,['item-0','item-3']);
  assert.equal(result.state.memo,old.memo);assert.equal(result.state.rate,'950');
  assert.equal(store.getItem(tokyo.legacyStorageKey),raw);
  assert.equal(loadState(store,tokyo).migrated,false);
  result.state.memo='new';saveState(store,tokyo,result.state);
  assert.equal(loadState(store,tokyo).state.memo,'new');assert.equal(store.getItem(tokyo.legacyStorageKey),raw);
});
test('pre-route-update records remain unchanged by this refactor',()=>{
  const old=legacy();delete old.itineraryVersion;old.events[0][0].id='arrival-flight';old.done=['arrival-flight'];
  const store=new MemoryStorage([[tokyo.legacyStorageKey,JSON.stringify(old)]]);
  const result=loadState(store,tokyo);
  assert.equal(result.state.events[tokyo.days[0].id][0].id,'arrival-flight');assert.deepEqual(result.state.done,['arrival-flight']);
});
test('v2 has priority over legacy; malformed v2 is protected, not silently remigrated',()=>{
  const store=new MemoryStorage([[tokyo.legacyStorageKey,JSON.stringify(legacy())],[storageKey(tokyo),'{broken']]);
  const result=loadState(store,tokyo);assert.equal(result.writable,false);assert.equal(result.raw,'{broken');assert.equal(store.getItem(storageKey(tokyo)),'{broken');
});
test('migration write failure retains source and in-memory record for export',()=>{
  const raw=JSON.stringify(legacy()),store=new MemoryStorage([[tokyo.legacyStorageKey,raw]]);store.fail=()=>true;
  const result=loadState(store,tokyo);assert.equal(result.writable,false);assert.equal(result.state.memo,legacy().memo);assert.equal(store.getItem(tokyo.legacyStorageKey),raw);assert.equal(store.getItem(storageKey(tokyo)),null);
});
test('new profiles never read or write Tokyo storage',()=>{
  const store=new MemoryStorage([[tokyo.legacyStorageKey,JSON.stringify(legacy())]]),next={...clone(template),id:'test-trip'};
  const state=loadState(store,next).state;state.memo='separate';saveState(store,next,state);
  assert.equal(loadState(store,tokyo).state.memo,legacy().memo);assert.equal(loadState(store,next).state.memo,'separate');
});
test('record round trip; cross-trip, duplicate IDs, bad dates, versions, invalid fields rejected',()=>{
  const state=loadState(new MemoryStorage([[tokyo.legacyStorageKey,JSON.stringify(legacy())]]),tokyo).state;
  assert.deepEqual(parseRecord(exportState(tokyo,state),tokyo),state);
  assert.throws(()=>parseRecord(exportState(tokyo,state),template));
  const bad=clone(state);bad.events['2026-09-25'].push(clone(bad.events['2026-09-25'][0]));assert.throws(()=>parseRecord(JSON.stringify(bad),tokyo));
  assert.throws(()=>parseRecord('{oops',tokyo));assert.throws(()=>parseRecord(JSON.stringify({format:'travel-record',version:99,tripId:tokyo.id,state}),tokyo));
  assert.throws(()=>parseRecord(JSON.stringify({...legacy(),schemaVersion:3}),tokyo));
  const invalid=clone(state);invalid.memo={html:'bad'};assert.throws(()=>parseRecord(JSON.stringify(invalid),tokyo));
  const foreignDay=clone(state);foreignDay.events['2099-01-01']=[];assert.throws(()=>parseRecord(JSON.stringify(foreignDay),tokyo));
});
test('import backs up current record and preserves original on backup or write failure',()=>{
  const current=freshState(tokyo),next={...freshState(tokyo),memo:'imported'};
  const store=new MemoryStorage();saveState(store,tokyo,current);const before=store.getItem(storageKey(tokyo));
  store.fail=key=>key.includes('before-import');assert.throws(()=>importState(store,tokyo,next));assert.equal(store.getItem(storageKey(tokyo)),before);
  store.fail=key=>key===storageKey(tokyo);assert.throws(()=>importState(store,tokyo,next));assert.equal(store.getItem(storageKey(tokyo)),before);
  store.fail=null;importState(store,tokyo,next);assert.equal(loadState(store,tokyo).state.memo,'imported');assert.ok([...store.values.entries()].some(([k,v])=>k.includes('before-import')&&v===before));
  const backups=listRecordBackups(store,tokyo);assert.ok(backups.length);assert.equal(backups[0].raw,before);assert.match(backups[0].label,/가져오기 전/);
  assert.equal(listRecordBackups(store,template).length,0);
});
test('travel template round trip excludes personal records and preserves itinerary edits',()=>{
  const p={...clone(template),id:'test-profile',days:makeDays('2027-12-30','2028-01-03'),timeZone:'UTC'},state=freshState(p);
  state.events[p.days[0].id]=clone(tokyo.days[0].events);state.memo='private';state.done=['photo26-arrival-0'];
  const raw=exportProfile(p,state),parsed=parseProfile(raw);assert.equal(raw.includes('private'),false);assert.equal(raw.includes('"done"'),false);assert.deepEqual(parsed.days[0].events,state.events[p.days[0].id]);
  const storage=new MemoryStorage();addProfile(storage,[tokyo,template],parsed);assert.deepEqual(loadProfiles(storage,[tokyo,template]),[parsed]);
  assert.throws(()=>addProfile(storage,[tokyo,template],parsed));assert.throws(()=>addProfile(storage,[tokyo,template],tokyo));
});
test('bad catalog and reserved identifiers are never overwritten',()=>{
  const store=new MemoryStorage([[catalogKey,'{broken']]);assert.throws(()=>addProfile(store,[tokyo,template],{...clone(template),id:'test'}));assert.equal(store.getItem(catalogKey),'{broken');
});
test('calendar supports one day, month/year boundaries, leap days and trip-local dates',()=>{
  assert.equal(makeDays('2028-02-28','2028-03-01').length,3);assert.equal(makeDays('2027-12-31','2028-01-01')[1].date,'2028-01-01');
  assert.equal(makeDays('2027-01-01','2027-01-01').length,1);assert.throws(()=>makeDays('2027-02-29','2027-03-01'));assert.throws(()=>makeDays('2027-01-01','2027-05-01'));
  assert.equal(localDate('Asia/Tokyo',new Date('2026-09-24T16:00:00Z')),'2026-09-25');
  assert.equal(initialDay(tokyo.days,'2026-09-24'),0);assert.equal(initialDay(tokyo.days,'2026-09-27'),2);assert.equal(initialDay(tokyo.days,'2026-10-01'),4);assert.equal(initialDay([],''),0);
});
test('destination-free template is valid and rejects executable URLs and invalid timezone',()=>{
  assert.equal(validateProfile(template).city,'');assert.equal(template.days.length,0);assert.equal(template.hotel,null);
  assert.equal(safeURL('javascript:alert(1)'), '');assert.equal(safeURL('data:text/html,test',{asset:true}),'');
  assert.throws(()=>validateProfile({...clone(template),timeZone:'Invalid/Zone'}));
  const bad=clone(tokyo);bad.hotel.url='javascript:alert(1)';assert.throws(()=>validateProfile(bad));
});
