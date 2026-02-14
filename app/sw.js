// public/sw.js



// ★あなたのXServerのプロキシURL (変更不要)

const PROXY_BASE = "https://atoshin.com/phpproxy.php?url=";



self.addEventListener('install', (event) => {

  self.skipWaiting(); // すぐに有効化

});



self.addEventListener('activate', (event) => {

  event.waitUntil(self.clients.claim()); // すぐにコントロール開始

});



self.addEventListener('fetch', (event) => {

  const requestUrl = new URL(event.request.url);



  // 1. 自分自身(Netlify)へのアクセスは何もしない

  if (requestUrl.origin === location.origin) {

    return;

  }



  // 2. すでにプロキシ経由になっているものも何もしない

  if (requestUrl.href.includes("phpproxy.php")) {

    return;

  }



  // 3. 【ここが重要】サウンドフォント(.sf2)を見つけたら、絶対にプロキシを通す！

  //    (ファイル名に .sf2 が含まれているかチェック)

  if (requestUrl.pathname.endsWith('.sf2')) {

    

    // 元のURLをプロキシURLで包む

    const newUrl = PROXY_BASE + encodeURIComponent(event.request.url);

    

    // コンソールにログを出す(デバッグ用)

    console.log(`[SW] Redirecting SF2 via Proxy: ${newUrl}`);



    event.respondWith(

      fetch(newUrl, {

        method: 'GET',

        mode: 'cors',

        credentials: 'omit'

      })

      .then(response => {

        if (!response.ok) throw new Error('Proxy error: ' + response.status);

        return response;

      })

      .catch(err => {

        console.error('[SW] Proxy failed, fallback to direct:', err);

        // プロキシがダメなら一か八か直接取りに行く(保険)

        return fetch(event.request);

      })

    );

    return; // ここで処理終了

  }



  // 4. それ以外の外部通信も、念のためプロキシを通す設定にする場合

  // (もし他のAPIもCORSエラーが出るならここも通す)

  /*

  const newUrl = PROXY_BASE + encodeURIComponent(event.request.url);

  event.respondWith(fetch(newUrl, { mode: 'cors' }));

  */

});
