const CACHE = 'moba-shell-1'
const SHELL = '/index.html'

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    try {
      const fresh = await fetch('/')
      if (fresh.ok) await cache.put(SHELL, fresh.clone())
    } catch {
      /* a próxima abertura grava o shell quando a rede responder */
    }
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/share/')) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request)
        const type = fresh.headers.get('content-type') || ''
        if (fresh.ok && type.includes('text/html') && !url.pathname.startsWith('/share')) {
          const cache = await caches.open(CACHE)
          cache.put(SHELL, fresh.clone())
        }
        return fresh
      } catch {
        const cached = await caches.match(SHELL)
        if (cached) return cached
        return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }
    })())
    return
  }

  const asset = url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/icons/')
    || url.pathname === '/manifest.webmanifest'
    || url.pathname === '/favicon.svg'
    || url.pathname === '/apple-touch-icon.png'
  if (!asset) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    const fresh = fetch(request).then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    }).catch(() => cached)
    return cached || fresh
  })())
})
