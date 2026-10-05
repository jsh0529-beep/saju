// Exercise the real route SQL against SQLite with independent visitor credentials.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temp=await mkdtemp(join(tmpdir(),'kanji-progress-'));
const sql=new DatabaseSync(':memory:');
for(const f of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())sql.exec(await readFile(`drizzle/${f}`,'utf8'));
function prepare(query){
 let values=[];
 return {bind(...args){values=args;return this;},
  async first(){return sql.prepare(query).get(...values)??null;},
  async all(){return {results:sql.prepare(query).all(...values)};},
  run(){return sql.prepare(query).run(...values);}};
}
globalThis.__kanjiTestDb={prepare,async batch(statements){
 sql.exec('BEGIN');try{const results=statements.map(s=>s.run());sql.exec('COMMIT');return results;}
 catch(e){sql.exec('ROLLBACK');throw e;}
}};
try{
 const ownerEmail='owner@example.test';
 const ownerHash=createHash('sha256').update(ownerEmail).digest('hex');
 for(const [name,path] of Object.entries({curriculum:'lib/curriculum.ts',learning:'lib/learning.ts',learner:'lib/learner.ts',route:'app/api/progress/route.ts'})){
  let source=await readFile(path,'utf8');
  if(name==='learner')source=source.replace(/const LEGACY_OWNER_EMAIL_SHA256 = "[a-f0-9]+";/,`const LEGACY_OWNER_EMAIL_SHA256 = "${ownerHash}";`);
  source=source.replaceAll("'@/lib/","'./").replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
  await writeFile(join(temp,`${name}.mjs`),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
 }
 await writeFile(join(temp,'database.mjs'),'export const database=()=>globalThis.__kanjiTestDb;');
 const {GET,POST}=await import(pathToFileURL(join(temp,'route.mjs')).href);
 const {kanji}=await import(pathToFileURL(join(temp,'curriculum.mjs')).href);
 const endpoint='https://test.example/api/progress';
 const get=(cookie,headers={})=>GET(new Request(endpoint,{headers:{...(cookie?{cookie}:{}),...headers}}));
 const post=(cookie,eventId='test-event-00000001',headers={})=>POST(new Request(endpoint,{method:'POST',headers:{'content-type':'application/json',origin:'https://test.example',...(cookie?{cookie}:{}),...headers},body:JSON.stringify({id:kanji[0].id,eventId,mistakes:0,learnerId:'legacy-owner'})}));
 const a=await get(),b=await get();
 assert.equal(a.status,200);assert.equal(b.status,200);
 const cookieA=a.headers.get('set-cookie').split(';')[0],cookieB=b.headers.get('set-cookie').split(';')[0];
 assert.notEqual(cookieA,cookieB);
 assert.match(a.headers.get('set-cookie'),/HttpOnly; SameSite=Lax;/);
 assert.match(a.headers.get('set-cookie'),/; Secure$/);
 assert.match(a.headers.get('cache-control'),/no-store/);
 assert.equal((await post()).status,401);
 assert.equal((await post(cookieA,undefined,{origin:'https://other.example'})).status,403);
 assert.equal((await post(cookieA,undefined,{'sec-fetch-site':'cross-site'})).status,403);
 assert.equal((await (await post(cookieA)).json()).earned,30);
 assert.equal((await (await get(cookieB)).json()).xp,0);
 assert.equal((await (await get(cookieA)).json()).xp,30);
 assert.equal((await (await post(cookieA)).json()).earned,0);
 assert.equal((await (await post(cookieB)).json()).earned,30); // Same event ID belongs to another visitor.
 const owner={'oai-authenticated-user-id':'verified-owner','oai-authenticated-user-email':ownerEmail};
 assert.equal((await (await get(null,owner)).json()).xp,0);
 assert.equal((await (await post(null,'test-owner-00000001',owner)).json()).earned,30);
 assert.equal((await (await get()).json()).xp,0); // Legacy data stays private.
 assert.equal((await (await get(null,{'oai-authenticated-user-id':'verified-other','oai-authenticated-user-email':'other@example.test'})).json()).xp,0);
 assert.equal((await (await get(null,{'oai-authenticated-user-email':ownerEmail})).json()).xp,0);
 assert.equal((await (await get(null,owner)).json()).cards.length,1);
 assert.equal((await (await get(cookieA)).json()).cards.length,1);
 const malformed=await POST(new Request(endpoint,{method:'POST',headers:{cookie:cookieA},body:'{'}));assert.equal(malformed.status,400);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM kanji_cards').get().n,1);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM visitor_cards').get().n,2);
 assert.match(sql.prepare('EXPLAIN QUERY PLAN SELECT day FROM visitor_events WHERE learner_id=? GROUP BY day').all('x').map(r=>r.detail).join(' '),/idx_visitor_events_learner_day/);
 console.log('PASS: anonymous access, per-visitor persistence, duplicate isolation, legacy owner preservation, cookie flags, CSRF, input validation and query index.');
}finally{sql.close();delete globalThis.__kanjiTestDb;await rm(temp,{recursive:true,force:true});}
