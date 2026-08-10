// 최소한의 서비스워커입니다. 오프라인 캐싱 기능은 없고,
// "홈 화면에 추가/앱 설치"가 안드로이드 크롬에서 정상적으로 뜨도록 하기 위한 용도예요.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
