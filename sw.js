/* Posting calendar service worker.
   Shell: cache first, refreshed in the background.
   Page loads and data.json: network first, cached copy when offline.
   A sign-in redirect from Cloudflare Access is passed through, never cached. */

const VERSION = "pc-v1-t1126";
const SHELL_CACHE = VERSION + "-shell";
const DATA_CACHE = VERSION + "-data";
const MEDIA_CACHE = VERSION + "-media";

// "./" and not "./index.html": Cloudflare Pages redirects /index.html to /,
// and Safari refuses to serve a cached redirected response for a page load.
const SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(SHELL.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store", redirect: "manual" });
        if (res.ok && !res.redirected) await cache.put(url, res);
      } catch (e) { /* offline or signed out: retried on the next install */ }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function markFromCache(res) {
  const headers = new Headers(res.headers);
  headers.set("x-from-cache", "1");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

async function networkFirst(request, cacheName, cacheKey) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    // Sign-in redirect (opaqueredirect) or error: hand it back untouched.
    if (res.ok && res.type === "basic" && !res.redirected) {
      await cache.put(cacheKey || request, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await cache.match(cacheKey || request, { ignoreSearch: true });
    if (cached) return markFromCache(cached);
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  const update = fetch(request).then(async (res) => {
    if (res.ok && res.type === "basic" && !res.redirected) await cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await update) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await networkFirst(req, SHELL_CACHE, "./");
      } catch (e) {
        const cache = await caches.open(SHELL_CACHE);
        const shell = await cache.match("./");
        return shell ? markFromCache(shell) : Response.error();
      }
    })());
    return;
  }

  if (url.pathname.endsWith("/data.json")) {
    event.respondWith(networkFirst(req, DATA_CACHE, "data.json"));
    return;
  }

  if (url.pathname.includes("/assets/") || url.pathname.includes("/media/")) {
    event.respondWith(cacheFirst(req, MEDIA_CACHE));
    return;
  }

  event.respondWith(cacheFirst(req, SHELL_CACHE));
});
