// Cache only a neutral offline page and icons. Learning records and authenticated
// navigation responses never enter shared caches.
const CACHE='kanji-offline-v1';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/offline.html','/icon-192.png','/icon-512.png'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kanji-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).catch(async()=>await caches.match('/offline.html')||new Response('인터넷에 연결한 뒤 다시 열어 주세요.',{headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
