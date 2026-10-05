export type RecordItem = { id:string; stage:number; due:number; firstDay:string; lastDay:string; mistakes:number; reviews:number };
export type ProgressState = { cards:RecordItem[]; days:{day:string; count:number; xp:number}[]; xp:number };
export const dayKey=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function advanceCard(old:RecordItem|undefined,id:string,mistakes:number,now:number):{card:RecordItem;xp:number;eligible:boolean}{
  const day=dayKey(new Date(now));
  const eligible=!old||old.due<=now;
  if(old&&!eligible&&mistakes===0)return {card:old,xp:0,eligible:false};
  const stage=mistakes?0:Math.min(5,(old?.stage??0)+1);
  const intervals=[10*60*1000,86400000,3*86400000,7*86400000,14*86400000,30*86400000];
  return {card:{id,stage,due:now+intervals[stage],firstDay:old?.firstDay??day,lastDay:day,mistakes:(old?.mistakes??0)+mistakes,reviews:(old?.reviews??0)+(old&&eligible?1:0)},xp:eligible?(!old?30:15):0,eligible};
}
export function shuffle<T>(arr:T[]):T[]{const r=[...arr];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
