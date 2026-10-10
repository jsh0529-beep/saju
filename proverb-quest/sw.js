'use strict';
const CACHE='hajun-proverb-quest-v1.0.0';
const ROOT=new URL('./',self.location.href);
const FILES=['./','index.html','style.css','app.js','data.js','hero.svg','icon.svg','icon-192.png','icon-512.png','icon-maskable.png','manifest.webmanifest'];
const ASSETS=new Set(FILES.map(p=>new URL(p,ROOT).href));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(p=>new URL(p,ROOT).href))));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hajun-proverb-quest-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(new URL('index.html',ROOT).href,copy)));return response;}return caches.match(new URL('index.html',ROOT).href).then(cached=>cached||response);}).catch(()=>caches.match(new URL('index.html',ROOT).href)));return;
 }
 if(!ASSETS.has(url.href))return;
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}return response;})));
});
