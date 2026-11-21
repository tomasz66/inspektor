// Nauczyciel AI: kursant tłumaczy blok własnymi słowami, Claude ocenia („Dobrze / Częściowo / Źle”),
// wskazuje luki z numerem fragmentu przepisu, tłumaczy je na nowym przykładzie i prosi o poprawkę.
//
//   blok + jego paragrafy ─► Claude (klucz z telefonu) ─► ocena i dopytanie ─► „Dobrze” zapisuje postęp
//
// Klucz API zapisuje się tylko w tym telefonie (localStorage), nigdy w repozytorium.

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.133.0/+esm";
const KLUCZ_AI = { klucz: "insp-ai-klucz", model: "insp-ai-model" };
const MODELE = [
  { id: "claude-opus-5-5", nazwa: "Najlepsza jakość", wej: 4, wyj: 20 },
  { id: "claude-haiku-5-5", nazwa: "Oszczędny (ok. 40× taniej)", wej: 0.1, wyj: 0.5 },
];
const MAX_TOKENOW = 16000;
const ZNAKOW_FRAGMENTU = 6000;
const MILION = 1e6;
const TUR_W_PAMIECI = 8;

const SYSTEM_NAUCZYCIEL = `Jesteś cierpliwym nauczycielem na kursie inspektora ochrony przeciwpożarowej. Odpowiadasz po polsku.
Dostajesz blok nauki i fragmenty przepisów [1], [2]… Uczysz metodą aktywnego przypominania:
- Na start: w 2-3 zdaniach przypomnij, czego dotyczy blok, i poproś kursanta, żeby wyjaśnił go własnymi słowami, jakby tłumaczył znajomemu. Nie podawaj treści bloku.
- Po odpowiedzi kursanta zacznij od jednego słowa oceny: „Dobrze”, „Częściowo” albo „Źle”. Potem: co zrozumiał prawidłowo; czego brakuje, co jest błędne lub nieścisłe (z numerem fragmentu, np. [2]); wyjaśnij lukę prościej, na nowym przykładzie z życia (powiedz, że to przykład); poproś o ponowne wyjaśnienie tej części albo zadaj jedno pytanie sprawdzające zastosowanie w praktyce.
- „Dobrze” dawaj tylko, gdy kursant poprawnie oddał najważniejsze zasady i liczby bloku.
- Jeśli kursant znowu się myli, zmień sposób wyjaśnienia (inna analogia, inny przykład) zamiast powtarzać te same słowa.
- Opieraj się wyłącznie na fragmentach. Liczby i terminy podawaj dokładnie jak w przepisie. Nie wymyślaj faktów.
- Pisz zwykłymi zdaniami, bez list, nagłówków i gwiazdek, 60-150 słów.
Odpowiedź jest pilna - zacznij widoczną odpowiedź od razu.`;

stan.ai = { blok: null, rozmowa: [], wiadomosci: [], zrodla: [], koszt: 0, zajety: false };

TRASY.push([/^#\/nauka\/wyjasnij\/([\w-]+)$/, (m) => widokNauczyciela(m[1])]);

async function klientAI() {
  if (!stan.anthropic) {
    const { default: Anthropic } = await import(SDK_URL);
    stan.Anthropic = Anthropic;
    stan.anthropic = new Anthropic({ apiKey: czytaj(KLUCZ_AI.klucz, ""), dangerouslyAllowBrowser: true });
  }
  return stan.anthropic;
}

function wybranyModel() {
  return MODELE.find((m) => m.id === czytaj(KLUCZ_AI.model, MODELE[0].id)) || MODELE[0];
}

// Kontekst bloku: opis + pełne paragrafy, na które powołują się zasady. Numeracja [n] dla przypisów.
async function kontekstBloku(b) {
  const fragmenty = [{ etykieta: `Blok ${b.nr}: ${b.tytul}`, tekst: `Cel: ${b.cel}\nŚciąga: ${b.sciaga.join("; ")}\nZasady: ${b.zasady.map((z) => z.t).join(" ")}`, adres: `#/nauka/blok/${b.id}` }];
  for (const z of b.zasady) {
    if (z.zr.kurs || fragmenty.some((f) => f.adres === adresUrzedowy(z.zr.akt, z.zr.etykieta, { cytat: z.zr.dowod }))) {
      continue;
    }
    const d = await wczytajAkt(z.zr.akt);
    const j = d.jednostki.find((x) => x.id === z.zr.j);
    if (j) {
      fragmenty.push({ etykieta: `${j.etykieta} · ${z.zr.nazwa}`, tekst: j.linie.map((l) => l.t).join("\n").slice(0, ZNAKOW_FRAGMENTU), adres: adresUrzedowy(z.zr.akt, z.zr.etykieta, { cytat: z.zr.dowod }) });
    }
  }
  stan.ai.zrodla = fragmenty;
  return fragmenty.map((f, i) => `[${i + 1}] ${f.etykieta}\n${f.tekst}`).join("\n\n");
}

async function zapytajAI(tresc, naTekst) {
  const a = stan.ai;
  const client = await klientAI();
  const model = wybranyModel();
  // Pierwsza wiadomość (blok i paragrafy) zostaje zawsze; przy długiej rozmowie wypadają środkowe tury.
  if (a.rozmowa.length >= TUR_W_PAMIECI * 2) {
    a.rozmowa = a.rozmowa.slice(0, 2).concat(a.rozmowa.slice(-4));
  }
  a.rozmowa.push({ role: "user", content: tresc });
  const strumien = client.messages.stream({ model: model.id, max_tokens: MAX_TOKENOW, system: SYSTEM_NAUCZYCIEL, output_config: { effort: "low" }, messages: a.rozmowa });
  let t = "";
  strumien.on("text", (x) => {
    t += x;
    naTekst(t);
  });
  const odp = await strumien.finalMessage();
  if (odp.stop_reason === "refusal") {
    a.rozmowa.pop();
    throw new Error("odmowa");
  }
  a.rozmowa.push({ role: "assistant", content: odp.content });
  a.koszt += (odp.usage.input_tokens * model.wej + odp.usage.output_tokens * model.wyj) / MILION;
  return odp.content.filter((x) => x.type === "text").map((x) => x.text).join("");
}

function opisBledu(e) {
  const A = stan.Anthropic;
  if (e.message === "odmowa") {
    return "AI odmówiło odpowiedzi. Spróbuj sformułować to inaczej.";
  }
  if (A && e instanceof A.AuthenticationError) {
    return "Klucz API jest nieprawidłowy - sprawdź go w ustawieniach poniżej.";
  }
  if (A && e instanceof A.RateLimitError) {
    return "Za dużo zapytań naraz. Odczekaj chwilę i spróbuj ponownie.";
  }
  if (A && e instanceof A.APIConnectionError) {
    return "Brak połączenia z internetem albo z serwerem AI.";
  }
  if (A && e instanceof A.APIError && e.status === 400 && /credit|billing/i.test(e.message)) {
    return "Skończyły się środki na koncie API (console.anthropic.com → Billing).";
  }
  return `Nie udało się: ${e.message}`;
}

function dymek(w, i) {
  if (w.kto === "ja") {
    return `<div class="dymek ja">${tekst(w.t)}</div>`;
  }
  const html = esc(w.t).replace(/\n+/g, "<br>").replace(/\[(\d+)\]/g, (m, n) => {
    const z = stan.ai.zrodla[n - 1];
    return z ? `<a class="przypis" href="${z.adres}"${z.adres.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${n}</a>` : m;
  });
  const numery = [...new Set([...w.t.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])))].filter((n) => stan.ai.zrodla[n - 1]);
  return `<div class="dymek ai${w.blad ? " blad" : ""}" id="dymek-${i}">${nbsp(html)}
    ${numery.length ? `<div class="links">${numery.map((n) => `<a class="chip" href="${stan.ai.zrodla[n - 1].adres}"${stan.ai.zrodla[n - 1].adres.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>[${n}] ${esc(stan.ai.zrodla[n - 1].etykieta)} ›</a>`).join("")}</div>` : ""}</div>`;
}

function rysujRozmowe() {
  const el = document.getElementById("rozmowa");
  if (el) {
    el.innerHTML = stan.ai.wiadomosci.map(dymek).join("");
    document.getElementById("koszt-ai").textContent = stan.ai.koszt ? `Koszt tej rozmowy: ok. $${stan.ai.koszt.toFixed(3)}` : "";
  }
}

function kartaUstawien(otwarta) {
  const jest = !!czytaj(KLUCZ_AI.klucz, "");
  return `<details class="card ustawienia" ${otwarta ? "open" : ""}><summary><b>Ustawienia AI</b> ${jest ? '<span class="row-tag ok">klucz zapisany</span>' : '<span class="row-tag">brak klucza</span>'}</summary>
    <p class="pomoc">${tekst("Klucz z console.anthropic.com → API Keys (ten sam, którego używasz w innych aplikacjach). Zapisuje się tylko w tym telefonie.")}</p>
    <label class="pole"><span>Klucz API</span><input id="klucz-ai" type="password" autocomplete="off" placeholder="${jest ? "•••••• (zapisany)" : "sk-ant-…"}"></label>
    <div class="btn-row" style="margin:10px 0 0"><button class="btn small" onclick="zapiszKlucz()">Zapisz klucz</button>${jest ? `<button class="btn small secondary" onclick="usunKlucz()">Usuń</button>` : ""}</div>
    <div class="pole" style="margin-top:14px"><span>Model</span><div class="seg mini">${MODELE.map((m) => `<button class="${wybranyModel().id === m.id ? "on" : ""}" onclick="zapisz(KLUCZ_AI.model,'${m.id}');stan.anthropic=null;rysujNauczyciela(true)">${esc(m.nazwa)}</button>`).join("")}</div></div>
  </details>`;
}

function zapiszKlucz() {
  const v = document.getElementById("klucz-ai").value.trim();
  if (!v) {
    return;
  }
  zapisz(KLUCZ_AI.klucz, v);
  stan.anthropic = null;
  pokazKomunikat("Klucz zapisany w tym telefonie.");
  widokNauczyciela(stan.ai.blok.id);
}

function usunKlucz() {
  zapisz(KLUCZ_AI.klucz, "");
  stan.anthropic = null;
  rysujNauczyciela(true);
}

function rysujNauczyciela(ustawieniaOtwarte) {
  const b = stan.ai.blok;
  const jest = !!czytaj(KLUCZ_AI.klucz, "");
  widok.innerHTML = `
    <div class="card ludzku" style="margin-top:14px"><div class="fun-label">Nauczyciel · blok ${b.nr}</div><p>${tekst(b.tytul)}</p>
      <p class="pomoc">${tekst("Wyjaśnij blok własnymi słowami, jak znajomemu (pisz albo dyktuj z klawiatury). Dostaniesz ocenę, wskazanie luk i nowy przykład. Ćwiczysz, aż będzie „Dobrze”.")}</p></div>
    <div id="rozmowa"></div>
    <div class="pasek-asystenta">
      <div class="wpis">
        <textarea id="pole-ai" rows="1" placeholder="Twoje wyjaśnienie…" ${jest ? "" : "disabled"}></textarea>
        <button class="okragly wyslij" onclick="wyslij()" aria-label="Wyślij" ${jest ? "" : "disabled"}>↑</button>
      </div>
      <div class="koszt" id="koszt-ai"></div>
    </div>
    <div class="btn-row"><button class="btn secondary" onclick="widokNauczyciela('${b.id}', true)">Zacznij od nowa</button><a class="btn secondary" href="#/nauka/blok/${b.id}">‹ Wróć do bloku</a></div>
    ${kartaUstawien(ustawieniaOtwarte || !jest)}
    <div class="foot">${tekst("AI może się pomylić - zawsze sprawdź paragraf, na który się powołuje.")}</div>`;
  rysujRozmowe();
  const pole = document.getElementById("pole-ai");
  pole.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      wyslij();
    }
  });
}

async function wymiana(tresc, dymekJa) {
  const a = stan.ai;
  if (a.zajety) {
    return;
  }
  a.zajety = true;
  if (dymekJa) {
    a.wiadomosci.push({ kto: "ja", t: dymekJa });
  }
  const w = { kto: "ai", t: "" };
  a.wiadomosci.push(w);
  rysujRozmowe();
  const i = a.wiadomosci.length - 1;
  try {
    w.t = await zapytajAI(tresc, (t) => {
      w.t = t;
      const el = document.getElementById(`dymek-${i}`);
      if (el) {
        el.innerHTML = nbsp(esc(t)).replace(/\n+/g, "<br>");
      }
    });
    rysujRozmowe();
    // „Dobrze” po wypowiedzi kursanta (nie na powitanie) = blok wyjaśniony własnymi słowami.
    if (dymekJa && /^\s*Dobrze\b/.test(w.t)) {
      zapiszPostep((p) => {
        p.wyjasnione[a.blok.id] = true;
        p.przeczytane[a.blok.id] = true;
      });
      pokazKomunikat(`Blok ${a.blok.nr} wyjaśniony - zapisane w postępie.`);
    }
  } catch (e) {
    w.t = opisBledu(e);
    w.blad = true;
    rysujRozmowe();
  } finally {
    a.zajety = false;
    document.getElementById(`dymek-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function wyslij() {
  const pole = document.getElementById("pole-ai");
  const q = pole.value.trim();
  if (!q || stan.ai.zajety) {
    return;
  }
  pole.value = "";
  wymiana(`Kursant: ${q}`, q);
}

async function widokNauczyciela(id, odNowa) {
  const b = stan.kurs.bloki.find((x) => x.id === id);
  if (!b) {
    location.replace("#/nauka");
    return;
  }
  ustawNaglowek(`Nauczyciel · blok ${b.nr}`, `#/nauka/blok/${b.id}`);
  ustawZakladke("nauka");
  const a = stan.ai;
  const nowy = odNowa || !a.blok || a.blok.id !== id;
  if (nowy) {
    Object.assign(a, { blok: b, rozmowa: [], wiadomosci: [], zrodla: [] });
  }
  rysujNauczyciela(false);
  if (nowy && czytaj(KLUCZ_AI.klucz, "")) {
    const kontekst = await kontekstBloku(b);
    wymiana(`Blok nauki i fragmenty przepisów:\n\n${kontekst}\n\nZacznij: przypomnij temat i poproś o wyjaśnienie własnymi słowami.`, "");
  }
}
