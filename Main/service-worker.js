const CACHE_NAME = "karty-main-pwa-v5";
const APP_VERSION = "2026-04-02.1";
const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  `./styles.css?v=${APP_VERSION}`,
  `./app.js?v=${APP_VERSION}`,
  `./pwa-config.js?v=${APP_VERSION}`,
  `./pwa-bootstrap.js?v=${APP_VERSION}`,
  "./manifest-any.webmanifest",
  "../Pliki/Ikona.png"
];

const SAME_ORIGIN_CRITICAL_ASSETS = [
  "/Main/app.js",
  "/Main/styles.css",
  "/Main/pwa-config.js",
  "/Main/pwa-bootstrap.js"
];

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

self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const isSameOrigin = (requestUrl) => requestUrl.origin === self.location.origin;

const isNavigationRequest = (request) => request.mode === "navigate";

const isCriticalAssetRequest = (requestUrl) => {
  return SAME_ORIGIN_CRITICAL_ASSETS.includes(requestUrl.pathname);
};

const cacheSuccessfulResponse = async (request, response) => {
  if (!response || response.status !== 200 || response.type !== "basic") {
    return response;
  }
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
};

const respondNetworkFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const freshResponse = await fetch(request);
    void cacheSuccessfulResponse(request, freshResponse);
    return freshResponse;
  } catch (_error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return fetch(request);
  }
};

const respondStaleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => cacheSuccessfulResponse(request, networkResponse))
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (!isSameOrigin(requestUrl)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isNavigationRequest(event.request)) {
    event.respondWith(respondNetworkFirst(event.request));
    return;
  }

  if (isCriticalAssetRequest(requestUrl)) {
    event.respondWith(respondStaleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
