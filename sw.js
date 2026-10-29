/* Private Study — 서비스 워커
   목적: 앱 셸(이 앱 자신의 파일)만 오프라인 캐시하여 PWA로 설치/실행 가능하게 함.
   주의: 사용자가 방문하는 외부 사이트 URL은 절대 캐시하거나 기록하지 않습니다.
         여기서 다루는 것은 이 앱의 정적 파일(index.html 등)뿐입니다. */

const CACHE = "private-study-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // GET 이 아니거나, 이 앱(origin)의 요청이 아니면 그대로 네트워크로 보냄.
  // → 사용자가 iframe 안에서 여는 외부 사이트는 서비스 워커가 가로채거나 캐시하지 않음.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  // 앱 셸만 캐시 우선(cache-first)으로 제공.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
