'use strict';
const CACHE='hajun-talk-v2';
const ROOT=new URL('./',self.location.href);
const AUDIO=['this','water','price','card','thanks','excuse','slow','toilet','hotel','elevator','rest','arm','lost','ambulance'];
const CORE=['./','index.html','style.css?v=2','app.js?v=2','phrases.js?v=1','manifest.webmanifest','icon.svg','../tokyo/assets/tokyo-diorama.webp',...AUDIO.map(x=>'../tokyo/assets/audio/'+x+'.mp3')].map(x=>new URL(x,ROOT).href);
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.allSettled(CORE.map(x=>cache.add(new Request(x,{cache:'reload'}))));await self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('hajun-talk-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
async function notifyReady(source){const cache=await caches.open(CACHE);const present=await Promise.all(CORE.map(x=>cache.match(x)));source?.postMessage({type:present.every(Boolean)?'OFFLINE_READY':'OFFLINE_PARTIAL'});}
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_OFFLINE')event.waitUntil(notifyReady(event.source));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==ROOT.origin)return;const allowed=CORE.includes(url.href)||url.pathname===ROOT.pathname;if(!allowed)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){try{const response=await fetch(event.request);if(response.ok)await cache.put(new URL('./',ROOT),response.clone());return response;}catch{return await cache.match(new URL('./',ROOT))||new Response('오프라인 준비가 안 되었어요. 인터넷 연결 후 다시 열어 주세요.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}}
 const cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;})());});
