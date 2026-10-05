import { database } from '@/lib/database';
import { kanji } from '@/lib/curriculum';
import { advanceCard,dayKey,type RecordItem } from '@/lib/learning';
import { learnerFor,progressResponse,type Learner } from '@/lib/learner';
export const dynamic='force-dynamic';

// Table names and scope come only from verified server-side identity.
function scope(learner:Learner){
 return learner.legacy
  ? {cards:'kanji_cards',events:'mission_events',where:'1=1',values:[] as string[]}
  : {cards:'visitor_cards',events:'visitor_events',where:'learner_id=?',values:[learner.id]};
}
async function state(learner:Learner){
 const db=database(),s=scope(learner);
 const [cards,days]=await Promise.all([
  db.prepare(`SELECT id,stage,due,first_day AS firstDay,last_day AS lastDay,mistakes,reviews FROM ${s.cards} WHERE ${s.where}`).bind(...s.values).all<RecordItem>(),
  db.prepare(`SELECT day,COUNT(*) AS count,SUM(xp) AS xp FROM ${s.events} WHERE ${s.where} AND xp>0 GROUP BY day ORDER BY day DESC`).bind(...s.values).all<{day:string;count:number;xp:number}>()
 ]);
 return {cards:cards.results,days:days.results,xp:days.results.reduce((n,d)=>n+d.xp,0)};
}
export async function GET(request:Request){
 try{
  const learner=(await learnerFor(request,true))!;
  return progressResponse(await state(learner),learner);
 }catch(error){
  console.error('Load progress failed',error);
  return progressResponse({error:'기록을 불러오지 못했어. 잠시 후 다시 눌러 줘.'},null,503);
 }
}
export async function POST(request:Request){
 let learner:Learner|null=null;
 try{
  if(request.headers.get('sec-fetch-site')==='cross-site'||
    (request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin))
   return progressResponse({error:'허용되지 않은 요청'},null,403);
  learner=await learnerFor(request);
  if(!learner)return progressResponse({error:'브라우저의 쿠키를 허용하고 새로고침해 줘.'},null,401);
  const raw=await request.text();
  if(raw.length>2048)return progressResponse({error:'잘못된 학습 기록'},learner,400);
  let body:{id?:string;eventId?:string;mistakes?:number}|null;
  try{body=JSON.parse(raw);}catch{return progressResponse({error:'잘못된 학습 기록'},learner,400);}
  if(!body||!kanji.some(k=>k.id===body.id)||typeof body.eventId!=='string'||
     !/^[-a-zA-Z0-9]{16,80}$/.test(body.eventId)||!Number.isInteger(body.mistakes)||
     body.mistakes!<0||body.mistakes!>1000)
   return progressResponse({error:'잘못된 학습 기록'},learner,400);
  const db=database(),s=scope(learner);
  const exists=await db.prepare(`SELECT id FROM ${s.events} WHERE ${s.where} AND id=?`).bind(...s.values,body.eventId).first();
  if(exists)return progressResponse({...(await state(learner)),earned:0},learner);
  const old=await db.prepare(`SELECT id,stage,due,first_day AS firstDay,last_day AS lastDay,mistakes,reviews FROM ${s.cards} WHERE ${s.where} AND id=?`).bind(...s.values,body.id).first<RecordItem>();
  const now=Date.now(),result=advanceCard(old??undefined,body.id!,body.mistakes!,now),c=result.card;
  const ownerColumn=learner.legacy?'':'learner_id,',ownerValue=learner.legacy?'':'?,',conflict=learner.legacy?'id':'learner_id,id';
  await db.batch([
   db.prepare(`INSERT INTO ${s.events}(${ownerColumn}id,card_id,day,xp,created) VALUES(${ownerValue}?,?,?,?,?)`).bind(...s.values,body.eventId,body.id,dayKey(new Date(now)),result.xp,now),
   db.prepare(`INSERT INTO ${s.cards}(${ownerColumn}id,stage,due,first_day,last_day,mistakes,reviews) VALUES(${ownerValue}?,?,?,?,?,?,?) ON CONFLICT(${conflict}) DO UPDATE SET stage=excluded.stage,due=excluded.due,last_day=excluded.last_day,mistakes=excluded.mistakes,reviews=excluded.reviews`).bind(...s.values,c.id,c.stage,c.due,c.firstDay,c.lastDay,c.mistakes,c.reviews)
  ]);
  return progressResponse({...(await state(learner)),earned:result.xp},learner);
 }catch(error){
  console.error('Save progress failed',error);
  return progressResponse({error:'아직 저장되지 않았어. 연결을 확인하고 저장을 다시 눌러 줘.'},learner,503);
 }
}
