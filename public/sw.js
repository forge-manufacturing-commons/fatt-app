const CACHE = 'fatt-v1'
self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request)
      if (hit) return hit
      try {
        const res = await fetch(e.request)
        if (e.request.method === 'GET' && res.status === 200) cache.put(e.request, res.clone())
        return res
      } catch (err) {
        return hit || Response.error()
      }
    })
  )
})
