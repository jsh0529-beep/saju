// Sites dispatch supplies verified identity headers; anonymous visitors need no sign-in.
// A digest avoids publishing the original owner's email in the source mirror.
const LEGACY_OWNER_EMAIL_SHA256 = "a24e3d0b884167b7ebadd97458115558f2e21ef8998f3c7093a984e426148a21";
const COOKIE = 'kanji_learner';
const TOKEN = /^[a-f0-9]{64}$/;
export type Learner = {legacy:boolean; id:string; cookie?:string};

async function digest(value:string){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function learnerFor(request:Request,create=false):Promise<Learner|null>{
 const email=request.headers.get('oai-authenticated-user-email');
 if(request.headers.get('oai-authenticated-user-id')&&email&&
    await digest(email.trim().toLowerCase())===LEGACY_OWNER_EMAIL_SHA256){
  return {legacy:true,id:'legacy-owner'};
 }
 let token=request.headers.get('cookie')?.split(';').map(c=>c.trim())
   .find(c=>c.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!token||!TOKEN.test(token)){
  if(!create)return null;
  token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 }
 // Only the high-entropy browser credential stays in a cookie; records stay in D1.
 return {legacy:false,id:await digest(token),cookie:
   `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=34560000${new URL(request.url).protocol==='https:'?'; Secure':''}`};
}
export function progressResponse(value:unknown,learner: Learner|null,status=200){
 const headers=new Headers({'Cache-Control':'private, no-store','Vary':'Cookie, oai-authenticated-user-id'});
 if(learner?.cookie)headers.set('Set-Cookie',learner.cookie);
 return Response.json(value,{status,headers});
}
