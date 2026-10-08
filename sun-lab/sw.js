// Scoped to this app. Never touches caches belonging to other saju apps.
const CACHE='hajun-sun-lab-v1.0.0';
const FILES=['./','./index.html','./styles.css','./app.js','./science.js','./curriculum.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/noto-kr.woff'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('hajun-sun-lab-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>response.ok?response:caches.match('./index.html')).catch(()=>caches.match('./index.html')));
  }else{
    // Use a consistent version of all scripts; a new worker activates after old tabs close.
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});
