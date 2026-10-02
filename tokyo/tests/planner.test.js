import test from 'node:test';
import assert from 'node:assert/strict';
import tokyo from '../trips/tokyo-2026/profile.js';
import template from '../trips/template/profile.js';
import {clone,makeDays} from '../lib/profile.js';
import {freshState,validateState,exportState,parseRecord} from '../lib/storage.js';
import {exportProfile} from '../lib/profiles-store.js';
import {buildPlan,appendPlan,validateCompanions} from '../lib/planner.js';

const adult={id:'companion-one',name:'나',ageGroup:'adult',pace:'normal',interests:['nature']};
const dayIds=tokyo.days.slice(0,2).map(d=>d.id);
test('empty catalog generates useful activities and breaks without inventing places or URLs',()=>{
  const p={...clone(template),id:'blank-test',timeZone:'UTC',days:makeDays('2027-12-31','2028-01-01')};
  const plan=buildPlan(p,[adult],{dayIds:p.days.map(d=>d.id),idPrefix:'test'});
  assert.equal(plan.hasPlaces,false);assert.equal(Object.keys(plan.events).length,2);
  const events=Object.values(plan.events).flat();assert.ok(events.some(e=>/산책/.test(e.title)));assert.ok(events.some(e=>/점심/.test(e.title)));assert.ok(events.some(e=>/쉬는/.test(e.title)));assert.ok(events.every(e=>e.query===''));
  assert.doesNotMatch(JSON.stringify(plan),/Tokyo|도쿄|서울|Paris/);
  assert.equal(new Set(events.map(e=>e.id)).size,events.length);
});
test('young children, seniors and slower walkers get fewer visits and more rests',()=>{
  const normal=buildPlan(tokyo,[adult],{dayIds:[dayIds[0]],idPrefix:'normal'});
  for(const person of [{...adult,ageGroup:'young'},{...adult,ageGroup:'senior'},{...adult,pace:'easy'}]) {
    const easy=buildPlan(tokyo,[person],{dayIds:[dayIds[0]],idPrefix:'easy'});
    assert.match(easy.summary,/후보 2곳/);assert.match(normal.summary,/후보 3곳/);
    assert.ok(easy.events[dayIds[0]].filter(e=>e.title==='앉아서 쉬는 시간').length>normal.events[dayIds[0]].filter(e=>e.title==='앉아서 쉬는 시간').length);
  }
  assert.match(buildPlan(tokyo,[{...adult,pace:'active'}],{dayIds:[dayIds[0]]}).summary,/후보 4곳/);
});
test('shared interests change priorities; matching candidates in the current area rank higher',()=>{
  const base=clone(tokyo.places[0]);
  const p={...clone(tokyo),hotel:{...tokyo.hotel,nearbyArea:'가까운 지역'},places:[
    {...base,id:'far',name:'멀리 있는 공원',query:'far',area:'먼 지역',category:'자연',desc:'정원 산책',kind:'공원'},
    {...base,id:'near',name:'가까운 공원',query:'near',area:'가까운 지역',category:'자연',desc:'정원 산책',kind:'공원'},
    {...base,id:'shop',name:'캐릭터 쇼핑',query:'shop',area:'다른 지역',category:'쇼핑',desc:'캐릭터 상점',kind:'쇼핑'}
  ]};
  assert.equal(buildPlan(p,[adult],{dayIds:[dayIds[0]]}).events[dayIds[0]][0].title,'가까운 공원');
  assert.equal(buildPlan(p,[{...adult,interests:['shopping']}],{dayIds:[dayIds[0]]}).events[dayIds[0]][0].title,'캐릭터 쇼핑');
});
test('planner avoids repeated catalog map queries and already scheduled queries',()=>{
  const existing=freshState(tokyo).events;
  const plan=buildPlan(tokyo,[adult],{dayIds,existingEvents:existing});
  const originalQueries=new Set(Object.values(existing).flat().map(e=>e.query));
  const generated=Object.values(plan.events).flat().filter(e=>e.query&&e.query!==tokyo.hotel.query).map(e=>e.query);
  assert.equal(new Set(generated).size,generated.length);assert.ok(generated.every(q=>!originalQueries.has(q)));
});
test('preview never mutates state; applying appends only selected dates and cannot apply twice',()=>{
  const record=freshState(tokyo),before=clone(record.events);
  const plan=buildPlan(tokyo,[adult],{dayIds:[dayIds[0]],existingEvents:record.events,idPrefix:'apply'});
  assert.deepEqual(record.events,before);
  const result=appendPlan(record.events,plan);assert.deepEqual(result[dayIds[0]].slice(0,before[dayIds[0]].length),before[dayIds[0]]);assert.deepEqual(result[dayIds[1]],before[dayIds[1]]);assert.deepEqual(record.events,before);
  assert.throws(()=>appendPlan(result,plan));
  assert.throws(()=>appendPlan({},plan));
  const full=clone(before);full[dayIds[0]]=Array.from({length:200},(_,i)=>({...before[dayIds[0]][0],id:`existing-${i}`}));assert.throws(()=>appendPlan(full,plan));assert.equal(full[dayIds[0]].length,200);
});
test('companions round-trip only in personal backups; older v2 records still load',()=>{
  const record=freshState(tokyo);record.companions=[{...adult,name:'비공개 동행자 별명'}];
  assert.deepEqual(parseRecord(exportState(tokyo,record),tokyo).companions,record.companions);
  assert.equal(exportProfile(tokyo,record).includes('비공개 동행자 별명'),false);
  delete record.companions;assert.deepEqual(validateState(record,tokyo).companions,[]);
});
test('missing travelers or dates and malformed companion information are rejected',()=>{
  assert.throws(()=>buildPlan(tokyo,[],{dayIds}));assert.throws(()=>buildPlan(tokyo,[adult],{dayIds:[]}));assert.throws(()=>buildPlan(tokyo,[adult],{dayIds:['2099-01-01']}));
  assert.throws(()=>validateCompanions([adult,adult]));assert.throws(()=>validateCompanions([{...adult,pace:'unknown'}]));assert.throws(()=>validateCompanions([{...adult,interests:['unsupported']}])) ;
});
