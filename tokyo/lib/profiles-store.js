import {clone,validateProfile} from './profile.js';

export const catalogKey='travel-custom-profiles-v1';
export function loadProfiles(storage,builtIns) {
  const raw=storage.getItem(catalogKey);
  if(raw===null)return [];
  const data=JSON.parse(raw);
  if(data?.version!==1||!Array.isArray(data.profiles)||data.profiles.length>50)throw new Error('저장된 여행 목록을 읽을 수 없어요.');
  const profiles=data.profiles.map(validateProfile);
  const ids=[...builtIns,...profiles].map(p=>p.id);
  if(new Set(ids).size!==ids.length||profiles.some(p=>p.legacyStorageKey))throw new Error('여행 ID가 중복되거나 예약된 저장 키가 있어요.');
  return profiles;
}
export function addProfile(storage,builtIns,profile) {
  const checked=validateProfile(profile);
  if(checked.legacyStorageKey)throw new Error('새 여행에 기존 저장 키를 지정할 수 없어요.');
  const profiles=loadProfiles(storage,builtIns);
  if([...profiles,...builtIns].some(p=>p.id===checked.id))throw new Error('이미 있는 여행 ID예요. 기존 여행을 선택해 주세요.');
  if(profiles.length>=50)throw new Error('이 기기에서는 최대 50개의 여행을 저장할 수 있어요.');
  storage.setItem(catalogKey,JSON.stringify({version:1,profiles:[...profiles,checked]}));
  return checked;
}
export function exportProfile(profile,state) {
  const data=clone(profile);
  delete data.legacyStorageKey;
  // Distributable content excludes personal completion, packing checks and memo.
  if(state)data.days=data.days.map(day=>({...day,events:clone(state.events[day.id])}));
  return JSON.stringify({format:'travel-template',version:1,profile:validateProfile(data)},null,2);
}
export function parseProfile(text) {
  if(text.length>5*1024*1024)throw new Error('파일은 5MB 이하만 가져올 수 있어요.');
  let data;
  try {data=JSON.parse(text);}catch {throw new Error('JSON 여행 템플릿 파일을 선택해 주세요.');}
  if(data?.format!=='travel-template'||data.version!==1)throw new Error('여행 템플릿 파일을 선택해 주세요.');
  if(data.profile?.legacyStorageKey)throw new Error('여행 템플릿에 기존 저장 키를 넣을 수 없어요.');
  return validateProfile(data.profile);
}
export function downloadFile(name,text) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
