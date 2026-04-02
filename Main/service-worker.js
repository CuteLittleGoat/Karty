const APP_VERSION = "2026-04-02.1";
const CACHE_NAME = `karty-main-pwa-${APP_VERSION}`;
const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=2026-04-02.1",
  "./app.js?v=2026-04-02.1",
  "./pwa-config.js?v=2026-04-02.1",
  "./pwa-bootstrap.js?v=2026-04-02.1",
  "./manifest-any.webmanifest",
  "../Pliki/Ikona.png"
];

const isSameOrigin = (request) => {
  try {
    const requestUrl = new URL(request.url);
    return requestUrl.origin === self.location.origin;
  } catch (error) {
    return false;
  }
};

const isHtmlRequest = (request) => request.mode === "navigate";

const isCriticalAssetRequest = (request) => {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  return request.destination === "script"
    || request.destination === "style"
    || pathname.endsWith("/app.js")
    || pathname.endsWith("/styles.css")
    || pathname.endsWith("/pwa-config.js")
    || pathname.endsWith("/pwa-bootstrap.js");
};

const networkFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => null);

  if (cachedResponse) {
    void networkPromise;
    return cachedResponse;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return fetch(request);
};

const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  cache.put(request, networkResponse.clone());
  return networkResponse;
};


self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !isSameOrigin(event.request)) {
    return;
  }

  if (isHtmlRequest(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isCriticalAssetRequest(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
