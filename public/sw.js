// Mythographia service worker: visited articles stay readable offline.
// Bump VERSION to drop every cache on the next activation.
const VERSION = "v2";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const OFFLINE_URLS = { en: "/en/offline", ru: "/ru/offline" };
const offlineFor = (pathname) => (pathname.startsWith("/ru") ? OFFLINE_URLS.ru : OFFLINE_URLS.en);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES)
      .then((cache) => cache.addAll(Object.values(OFFLINE_URLS).map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (cacheName, request, response) => {
  if (response.ok) caches.open(cacheName).then((cache) => cache.put(request, response));
};

// Hashed build output and static media never change under the same URL.
const cacheFirst = async (request) => {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  put(ASSETS, request, response.clone());
  return response;
};

// Pages and RSC payloads: fresh when online, last seen copy when not.
const networkFirst = async (request, fallback) => {
  try {
    const response = await fetch(request);
    put(PAGES, request, response.clone());
    return response;
  } catch (error) {
    const hit = (await caches.match(request)) ?? (fallback && (await caches.match(fallback)));
    if (hit) return hit;
    throw error;
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, offlineFor(url.pathname)));
  } else if (!url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(request));
  }
});
