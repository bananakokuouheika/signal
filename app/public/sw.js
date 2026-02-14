// public/sw.js (エラー回避・保険付き)

// ★ここにあなたのXServerのURLを正確に入れてください
// 末尾の ?url= を忘れずに！
const PROXY_BASE = "https://atoshin.com/phpproxy.php?url=";

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. 自分自身(Netlify)へのアクセスは無視
  if (requestUrl.origin === location.origin) {
    return;
  }

  // 2. すでにプロキシ経由のリクエストなら無視（無限ループ防止）
  if (requestUrl.href.startsWith(PROXY_BASE)) {
    return;
  }

  // 3. 外部へのアクセスをプロキシ経由に書き換え
  const targetUrl = PROXY_BASE + encodeURIComponent(event.request.url);

  event.respondWith(
    fetch(targetUrl, {
      method: event.request.method,
      headers: event.request.headers,
      mode: 'cors',
      credentials: 'omit'
    })
    .then(response => {
      // プロキシが正常(200番台)ならそれを返す
      if (response.ok) return response;
      // プロキシがエラー(404や500)を返したら、例外を投げて下のcatchへ
      throw new Error('Proxy returned error');
    })
    .catch(() => {
      // ★保険：プロキシがダメだった場合、元のURLに直接アクセスを試みる
      // (CORSエラーになるかもしれないが、アプリごと落ちるよりはマシ)
      console.warn('Proxy failed, falling back to direct fetch:', event.request.url);
      return fetch(event.request);
    })
  );
});

// インストール時の処理
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
