const CACHE='carnet-teyvat-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  // le document : réseau d'abord pour récupérer les mises à jour, cache en secours
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{
      const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  // polices et images : cache d'abord
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    if(res.ok&&(r.url.startsWith(self.location.origin)||/fonts\.(googleapis|gstatic)|enka\.network|yatta\.moe|mihoyo/.test(r.url))){
      const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp));
    }
    return res;
  }).catch(()=>hit)));
});
