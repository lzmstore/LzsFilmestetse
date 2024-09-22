// Este é o service worker "Página offline"

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: substitua o seguinte pela página de fallback offline correta, ou seja: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

self.addEventListener("mensagem", (evento) => {
  se (evento.dados && evento.dados.tipo === "SKIP_WAITING") {
    self.pularEspera();
  }
});

self.addEventListener('instalar', async (evento) => {
  evento.waitUntil(
    caches.abrir(CACHE)
      .então((cache) => cache.adicionar(offlineFallbackPage))
  );
});

se (workbox.navigationPreload.isSupported()) {
  caixa de trabalho.navegaçãoPreload.enable();
}

self.addEventListener('buscar', (evento) => {
  se (evento.solicitação.modo === 'navegar') {
    evento.respondWith((async () => {
      tentar {
        const preloadResp = aguardar evento.preloadResponse;

        se (preloadResp) {
          retornar preloadResp;
        }

        const networkResp = await fetch(event.request);
        retornar redeResp;
      } pegar (erro) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        retornar cachedResp;
      }
    })());
  }
});