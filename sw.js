// Działanie offline: najpierw sieć (świeże dane), a bez internetu - kopia z pamięci telefonu.
const CACHE = "inspektor-ppoz-v42";
const PLIKI = ["./", "index.html", "style.css", "app.js", "nauka.js", "nauczyciel.js", "rysunki.js", "lekcja.js", "pytania.js", "fiszki.js", "narzedzia.js", "analiza.js", "poradnik.js", "obchod.js", "poszerz.js", "uklad.js", "odnosniki.js", "manifest.json",
  "data/kurs.json", "data/pytania.json", "data/materialy.json", "data/poradnik.json", "data/przepisy/spis.json", "data/przepisy/indeks.json", "data/przepisy/indeks_isap.json", "icons/icon-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PLIKI)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    return;
  }
  // "no-cache": zawsze pytamy serwer, czy plik się zmienił; kopia w pamięci tylko bez internetu.
  const swiezy = e.request.method === "GET" ? new Request(e.request.url, { cache: "no-cache" }) : e.request;
  e.respondWith(
    fetch(swiezy)
      .then((r) => {
        const kopia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopia));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
