/* Pure helpers for local itinerary changes, settlements and share snapshots. */
'use strict';
const TripTools=(()=>{
 const plans=['autumn','otaru','rain'];
 const fixed=new Set(['d1-airport','d1-flight','d1-arrival','d2-bus-out','d2-return-stop','d2-bus-back','d3-checkout','d3-airport','d3-security','d3-flight','d3-transfer','d3-home']);
 const duration={'d1-airport':90,'d1-flight':330,'d1-arrival':80,'d1-jr':50,'d1-hotel':35,'d2-breakfast':40,'d2-stop':25,'d2-bus-out':56,'d2-walk':75,'d2-lunch':60,'d2-footbath':90,'d2-return-stop':20,'d2-bus-back':64,'d2-hotel':40,'d3-breakfast':45,'d3-walk':60,'d3-checkout':15,'d3-jr':65,'d3-airport':60,'d3-security':60,'d3-flight':195,'d3-transfer':130,'d3-home':40,'rn-lunch':105};
 const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
 const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 function cleanExtras(input,trip,people=4){
  const v=input&&typeof input==='object'?input:{};const ids=new Set(Object.values(trip.itinerary).flat().map(i=>i.id));
  const changes={};if(v.changes&&typeof v.changes==='object')for(const [id,c] of Object.entries(v.changes)){if(!ids.has(id)||fixed.has(id)||!c||typeof c!=='object')continue;changes[id]={delay:Number.isInteger(c.delay)?Math.max(0,Math.min(180,c.delay)):0,rest:Number.isInteger(c.rest)?Math.max(0,Math.min(120,c.rest)):0,skip:c.skip===true};}
  const members=Array.from({length:people},(_,i)=>({id:'p'+i,name:typeof v.members?.[i]?.name==='string'?v.members[i].name.trim().slice(0,20)||`일행 ${i+1}`:`일행 ${i+1}`}));
  const raw=v.meeting&&typeof v.meeting==='object'?v.meeting:{};
  const meeting={place:typeof raw.place==='string'?raw.place.trim().slice(0,80):'',date:trip.dates.includes(raw.date)?raw.date:trip.dates[0],time:/^([01]\d|2[0-3]):[0-5]\d$/.test(raw.time||'')?raw.time:'08:30'};
  const food={};if(v.food&&typeof v.food==='object')for(const [k,val]of Object.entries(v.food))if(ids.has(k)&&typeof val==='string'&&/^[a-z-]{1,40}$/.test(val))food[k]=val;
  return{changes,members,meeting,food};
 }
 function schedule(items,changes={}){
  let end=0;const warnings=[];
  const result=items.map((original,index)=>{
   const c=changes[original.id]||{},base=minutes(original.t),locked=fixed.has(original.id),skipped=!locked&&c.skip===true;
   const natural=items[index+1]?Math.max(15,minutes(items[index+1].t)-base):45;
   const stay=duration[original.id]??Math.min(natural,60);
   const at=skipped?base:locked?base:Math.max(base,end)+(c.delay||0);
   let conflict=locked&&end>base;if(conflict)warnings.push(`${original.title}: 앞 일정이 ${end-base}분 겹칩니다. 관광·식사를 줄이거나 교통편을 확인하세요.`);
   if(at>1439)warnings.push('자정을 넘는 조정은 저장할 수 없습니다.');
   if(!skipped)end=at+stay+(locked?0:c.rest||0);
   return{...original,t:clock(Math.min(at,1439)),baseTime:original.t,locked,skipped,conflict,rest:locked?0:c.rest||0,delay:c.delay||0,duration:stay};
  });return{items:result,warnings,overflow:result.some(i=>!i.skipped&&minutes(i.t)+i.duration+i.rest>1440)};
 }
 function cleanExpense(e,members){
  const ids=new Set(members.map(m=>m.id));const payer=ids.has(e.payer)?e.payer:null;
  const split=Array.isArray(e.split)?[...new Set(e.split.filter(i=>ids.has(i)))]:[];
  return{...e,payer,split:split.length?split:members.map(m=>m.id)};
 }
 function settle(expenses,members){
  const balance=Object.fromEntries(members.map(m=>[m.id,0]));let pending=0,pendingAmount=0,total=0;
  for(const raw of expenses){const e=cleanExpense(raw,members);if(!e.payer){pending++;pendingAmount+=e.amount;continue;}total+=e.amount;balance[e.payer]+=e.amount;const q=Math.floor(e.amount/e.split.length),r=e.amount%e.split.length;e.split.forEach((id,k)=>balance[id]-=q+(k<r?1:0));}
  const debt=Object.entries(balance).filter(([,b])=>b<0).map(([id,b])=>({id,amount:-b})),credit=Object.entries(balance).filter(([,b])=>b>0).map(([id,b])=>({id,amount:b}));const transfers=[];let i=0,j=0;
  while(i<debt.length&&j<credit.length){const n=Math.min(debt[i].amount,credit[j].amount);transfers.push({from:debt[i].id,to:credit[j].id,amount:n});debt[i].amount-=n;credit[j].amount-=n;if(!debt[i].amount)i++;if(!credit[j].amount)j++;}
  return{balance,transfers,pending,pendingAmount,total};
 }
 function shared(state){return{v:2,plan:state.plan,meeting:{...state.meeting},changes:state.changes,food:state.food};}
 function validateShare(v,trip){if(!v||v.v!==2||!plans.includes(v.plan)||typeof v.meeting!=='object')throw Error('공유 링크 형식을 확인하세요.');return{plan:v.plan,...cleanExtras(v,trip)};}
 return{fixed,minutes,clock,cleanExtras,schedule,cleanExpense,settle,shared,validateShare};
})();
if(typeof module!=='undefined')module.exports=TripTools;

const incomingTripShare=typeof location!=='undefined'&&location.hash.startsWith('#share=')?location.hash.slice(7):null;
