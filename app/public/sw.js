// public/sw.js

const PROXY_URL = "https://atoshin.com/phpproxy.php?url=";

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. 自分のサイト(Netlify)へのアクセスはスルーする
  if (requestUrl.origin === location.origin) {
    return; 
  }

  // 2. すでにプロキシ経由になっているものもスルー（無限ループ防止）
  if (requestUrl.href.startsWith(PROXY_URL)) {
    return;
  }

  // 3. それ以外の「外部サイトへのアクセス」は全部プロキシ経由にする
  //    (画像、音声、API、全部捕まえます)
  const newUrl = PROXY_URL + encodeURIComponent(event.request.url);

  event.respondWith(
    fetch(newUrl, {
      method: event.request.method,
      headers: event.request.headers,
      mode: 'cors', // プロキシ経由なのでCORSモードでOK
      credentials: 'omit'
    })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting(); // すぐに発動させる
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // すぐにコントロールを開始する
});
