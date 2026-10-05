import { database } from '@/lib/database';
import { kanji } from '@/lib/curriculum';
import { advanceCard,dayKey,type RecordItem } from '@/lib/learning';
export const dynamic='force-dynamic';
async function state(){const db=database();const [cards,days]=await Promise.all([db.prepare('SELECT id,stage,due,first_day AS firstDay,last_day AS lastDay,mistakes,reviews FROM kanji_cards').all<RecordItem>(),db.prepare('SELECT day, COUNT(*) AS count, SUM(xp) AS xp FROM mission_events WHERE xp > 0 GROUP BY day ORDER BY day DESC').all<{day:string;count:number;xp:number}>()]);return {cards:cards.results,days:days.results,xp:days.results.reduce((n,d)=>n+d.xp,0)};}
export async function GET(){try{return Response.json(await state(),{headers:{'Cache-Control':'no-store'}});}catch(error){console.error('Load progress failed',error);return Response.json({error:'기록을 불러오지 못했어. 잠시 후 다시 눌러 줘.'},{status:503});}}
export async function POST(request:Request){
try{
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'허용되지 않은 요청'},{status:403});
 const body=await request.json() as {id?:string;eventId?:string;mistakes?:number};
 if(!kanji.some(k=>k.id===body.id)||typeof body.eventId!=='string'||!/^[-a-zA-Z0-9]{16,80}$/.test(body.eventId)||!Number.isInteger(body.mistakes)||body.mistakes! < 0||body.mistakes! > 1000)return Response.json({error:'잘못된 학습 기록'},{status:400});
 const db=database();const exists=await db.prepare('SELECT id FROM mission_events WHERE id=?').bind(body.eventId).first();
 if(exists)return Response.json({...(await state()),earned:0});
 const old=await db.prepare('SELECT id,stage,due,first_day AS firstDay,last_day AS lastDay,mistakes,reviews FROM kanji_cards WHERE id=?').bind(body.id).first<RecordItem>();
 const now=Date.now(),result=advanceCard(old??undefined,body.id!,body.mistakes!,now),c=result.card;
 // The event insert and card update form one atomic, idempotent batch.
 await db.batch([
 db.prepare('INSERT INTO mission_events(id,card_id,day,xp,created) VALUES(?,?,?,?,?)').bind(body.eventId,body.id,dayKey(new Date(now)),result.xp,now),
 db.prepare('INSERT INTO kanji_cards(id,stage,due,first_day,last_day,mistakes,reviews) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET stage=excluded.stage,due=excluded.due,last_day=excluded.last_day,mistakes=excluded.mistakes,reviews=excluded.reviews').bind(c.id,c.stage,c.due,c.firstDay,c.lastDay,c.mistakes,c.reviews)
 ]);
 return Response.json({...(await state()),earned:result.xp});
}catch(error){console.error('Save progress failed',error);return Response.json({error:'아직 저장되지 않았어. 연결을 확인하고 저장을 다시 눌러 줘.'},{status:503});}
}
