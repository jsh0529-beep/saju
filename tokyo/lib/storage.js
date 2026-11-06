import {clone,isObject,validEvent} from './profile.js';
import {validateCompanions} from './planner.js';

export const storageKey = profile => `travel-profile-v2:${profile.id}`;
export const freshState = profile => ({schemaVersion:2,tripId:profile.id,itineraryVersion:profile.itineraryVersion,
  events:Object.fromEntries(profile.days.map(day=>[day.id,clone(day.events)])),done:[],packed:[],memo:'',rate:'',companions:[]});
const fail = () => {throw new Error('저장 파일의 형식 또는 여행 날짜가 맞지 않아요. 원본 파일은 보관해 주세요.');};
export function validateState(value,profile) {
  if(!isObject(value)||value.schemaVersion!==2||value.tripId!==profile.id||!isObject(value.events))fail();
  const days=profile.days.map(d=>d.id);
  if(Object.keys(value.events).length!==days.length||days.some(id=>!Object.hasOwn(value.events,id)))fail();
  const ids=[];
  for(const entries of Object.values(value.events)) {
    if(!Array.isArray(entries)||entries.length>200||!entries.every(validEvent))fail();
    ids.push(...entries.map(e=>e.id));
  }
  if(new Set(ids).size!==ids.length)fail();
  if(!Array.isArray(value.done)||value.done.some(id=>!ids.includes(id))||new Set(value.done).size!==value.done.length)fail();
  const packIds=profile.packing.map(p=>p.id);
  if(!Array.isArray(value.packed)||value.packed.some(id=>!packIds.includes(id))||new Set(value.packed).size!==value.packed.length)fail();
  if(typeof value.memo!=='string'||value.memo.length>3000||typeof value.rate!=='string'||value.rate.length>30)fail();
  if(value.rate!==''&&(!Number.isFinite(Number(value.rate))||Number(value.rate)<=0||Number(value.rate)>100000))fail();
  return {...clone(value),companions:validateCompanions(value.companions??[])};
}
// Copy the old record without replacing old routes, edited defaults or deletions.
// The original key and any previous migration backups remain byte-for-byte intact.
export function migrateLegacy(value,profile) {
  if(!profile.legacyStorageKey||!isObject(value)||!isObject(value.events))fail();
  const next=freshState(profile);
  if(Object.keys(value.events).some(key=>!/^\d+$/.test(key)||Number(key)>=profile.days.length))fail();
  profile.days.forEach((day,i)=>{
    if(Object.hasOwn(value.events,String(i))) {
      if(!Array.isArray(value.events[i])||value.events[i].length>200||!value.events[i].every(validEvent))fail();
      next.events[day.id]=clone(value.events[i]);
    }
  });
  const ids=Object.values(next.events).flat().map(e=>e.id);
  if(value.done!==undefined&&(!Array.isArray(value.done)||value.done.some(x=>typeof x!=='string')))fail();
  if(value.packed!==undefined&&(!Array.isArray(value.packed)||value.packed.some(x=>!Number.isInteger(x)||x<0||x>=profile.packing.length)))fail();
  next.done=[...new Set((value.done||[]).filter(id=>ids.includes(id)))];
  next.packed=[...new Set((value.packed||[]).map(i=>profile.packing[i].id))];
  next.memo=value.memo??'';
  next.rate=value.rate??'';
  return validateState(next,profile);
}
export function loadState(storage,profile) {
  let state=freshState(profile),raw=null;
  try {
    raw=storage.getItem(storageKey(profile));
    if(raw!==null)return {state:validateState(JSON.parse(raw),profile),writable:true,migrated:false};
    if(profile.legacyStorageKey) {
      raw=storage.getItem(profile.legacyStorageKey);
      if(raw!==null) {
        state=migrateLegacy(JSON.parse(raw),profile);
        storage.setItem(storageKey(profile),JSON.stringify(state));
        return {state,writable:true,migrated:true};
      }
    }
    return {state,writable:true,migrated:false};
  } catch(error) {
    // Protect malformed or inaccessible records from later autosave.
    return {state,writable:false,migrated:false,error:error.message,raw};
  }
}
export function saveState(storage,profile,state) {
  const checked=validateState(state,profile);
  storage.setItem(storageKey(profile),JSON.stringify(checked));
}
export function exportState(profile,state) {
  return JSON.stringify({format:'travel-record',version:1,tripId:profile.id,exportedAt:new Date().toISOString(),state:validateState(state,profile)},null,2);
}
export function parseRecord(text,profile) {
  if(text.length>5*1024*1024)throw new Error('파일은 5MB 이하만 가져올 수 있어요.');
  let data;
  try {data=JSON.parse(text);}catch {throw new Error('JSON 백업 파일을 선택해 주세요.');}
  if(data?.format==='travel-record') {
    if(data.version!==1)throw new Error('지원하지 않는 백업 버전이에요.');
    if(data.tripId!==profile.id)throw new Error('다른 여행의 기록이에요. 먼저 해당 여행을 열어 주세요.');
    return validateState(data.state,profile);
  }
  if(data?.schemaVersion===2)return validateState(data,profile);
  if(isObject(data)&&(Object.hasOwn(data,'schemaVersion')||Object.hasOwn(data,'format')))throw new Error('지원하지 않는 백업 형식 또는 버전이에요.');
  return migrateLegacy(data,profile);
}
export function importState(storage,profile,state) {
  const checked=validateState(state,profile),key=storageKey(profile);
  const previous=storage.getItem(key);
  // One backup per import. Abort if backup or final write fails; the active record
  // is never removed first. A failed write must not change the visible state.
  if(previous!==null)storage.setItem(`${key}:before-import:${Date.now()}:${globalThis.crypto.randomUUID()}`,previous);
  storage.setItem(key,JSON.stringify(checked));
  return checked;
}

export function listRecordBackups(storage,profile) {
  const keys=[];
  for(let i=0;i<storage.length;i++) {
    const key=storage.key(i);
    if(key?.startsWith(`${storageKey(profile)}:before-import:`)||
       (profile.legacyStorageKey&&(key===profile.legacyStorageKey||key?.startsWith(`${profile.legacyStorageKey}-before-`))))keys.push(key);
  }
  return keys.sort().reverse().map((key,i)=>{
    const stamp=key.split(':before-import:')[1]?.split(':')[0];
    const label=key===profile.legacyStorageKey?'기존 도쿄 앱의 저장 원본':key.startsWith(`${profile.legacyStorageKey}-before-`)?'기존 일정 변경 전 저장 원본':/^\d{13}$/.test(stamp||'')?`가져오기 전 기록 · ${new Date(Number(stamp)).toLocaleString('ko-KR')}`:`이전 기록 ${i+1}`;
    return {key,label,raw:storage.getItem(key)};
  });
}
