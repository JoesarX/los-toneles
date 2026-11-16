const CACHE_NAME = "los-toneles-v1";
const OFFLINE_URL = "/offline";
const PRIVATE_PATHS = ["/admin", "/api", "/cart", "/login", "/orders"];
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const isPrivatePath = (pathname) =>
  PRIVATE_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

const isStaticAsset = (pathname) =>
  pathname.startsWith("/_next/static/") ||
  /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(pathname);

const offlineResponse = async () =>
  (await caches.match(OFFLINE_URL)) ||
  new Response("Sin conexión. Revisa tu internet e intenta de nuevo.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isRscRequest =
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    url.searchParams.has("_rsc");

  if (isRscRequest || isPrivatePath(url.pathname)) {
    if (request.mode === "navigate") {
      event.respondWith(fetch(request).catch(offlineResponse));
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined);
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || offlineResponse();
        })
    );
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch(() => undefined);
          }
          return response;
        });
      })
    );
  }
});
