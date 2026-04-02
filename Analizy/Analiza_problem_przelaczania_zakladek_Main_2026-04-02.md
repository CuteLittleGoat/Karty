# Analiza problemu: identyczna treść po przełączaniu zakładek w module Main (Kalkulator)

## Prompt użytkownika (pełny kontekst)
Przeprowadź pełną analizę kodu aplikacji.

Mam dziwny problem z modułem Main.
1. Po wdrożeniu zmian opisanych w Analizy/Zakladka_Organizacja.md pojawił się problem, że na jednym telefonie zmiana zadziałała a na drugim pojawiło się coś dziwnego. Na pasku pojawiły się nowe zakładki. Jednak po klikaniu na zakładki treść strony pozostawała bez zmian. Wszędzie wyświetlały się takie same tabele z tymi samymi danymi.

2. Po wdrożeniu zmian opisanych w Analizy/Analiza_pasy_pod_Tabela2_i_TABELAC_2026-04-01.md miałem podobny problem co w pkt1. Na PC uruchomiłem aplikację i po klikaniu we wszystkie zakładki na panelu bocznym w "Kalkulator" wyświetlały się takie same tabele (bez danych).
Po kilkunastu kliknięciach na różne zakładki dopiero pojawiły się prawidłowe tabele.

Nie wprowadzaj zmian w kodzie.
Przeprowadź pełną analizę czy to jest kwestia kodu aplikacji, jakiś problem z odświeżaniem czy może kwestia ustawień przeglądarki.

---

## Zakres przeanalizowanych elementów
- `Main/index.html` (sidebar i tryby kalkulatora, ładowanie skryptów).
- `Main/app.js` (logika przełączania trybów kalkulatora i renderowania tabel).
- `Main/service-worker.js`, `Main/pwa-bootstrap.js`, `Main/pwa-config.js` (strategia cache i aktualizacji PWA).
- Kontekst zmian z:
  - `Analizy/Zakladka_Organizacja.md`
  - `Analizy/Analiza_pasy_pod_Tabela2_i_TABELAC_2026-04-01.md`

---

## Wnioski główne (krótko)

## Najbardziej prawdopodobna przyczyna: cache PWA / service worker (a nie błąd samego kliknięcia w zakładki)
Problem **najbardziej pasuje do niespójnych wersji plików po deployu** (stary JS/CSS/HTML w cache na części urządzeń), a nie do stricte błędu logiki zakładek.

Dlaczego:
1. W `Main/service-worker.js` użyta jest strategia **cache-first dla wszystkich GET**:
   - najpierw `caches.match(event.request)`,
   - dopiero brak cache -> `fetch`.
2. App shell (`index.html`, `app.js`, `styles.css`) jest trwale cache’owany.
3. Jeżeli po wdrożeniu nie zmieniono `CACHE_NAME`, urządzenie może dalej pracować na starej wersji kodu.
4. To tłumaczy, czemu:
   - na jednym telefonie działało, a na drugim nie,
   - po kolejnych próbach/odświeżeniach sytuacja mogła się „nagle” poprawić.

---

## Szczegółowa ocena: kod przełączania zakładek

### Co działa poprawnie w logice przełączania
- Sidebar ma poprawne przyciski z `data-calculator-mode` (`tournament1`, `tournament2`, `cash`, `organization`, `chips-*`).
- W `initAdminCalculator` kliknięcie przycisku ustawia `state.mode`, przełącza klasę `is-active` i woła `render()`.
- `render()` ma osobne gałęzie dla:
  - `cash`,
  - `organization`,
  - `chips-*`,
  - trybów turniejowych.
- Każdy renderer czyści i buduje odpowiednie sloty tabel.

To oznacza, że w aktualnym kodzie nie widać prostego „twardego” błędu typu brak switch-case dla nowych trybów.

### Co może dawać objawy „niby się przełącza, ale widzę to samo”
Jeśli urządzenie ma **stary `app.js`**, a nowy `index.html` (lub odwrotnie), możliwa jest sytuacja mieszana:
- UI pokazuje nowe zakładki,
- ale logika JS działa wg poprzedniej wersji,
- efekt końcowy: przełączanie wygląda niepoprawnie lub niekonsekwentnie.

To jest klasyczny objaw niezsynchronizowanego cache po deployu PWA.

---

## Czy to może być „problem odświeżania” lub ustawień przeglądarki?

## Tak — i to bardzo możliwe

### 1) Odświeżanie / cache
To najważniejszy czynnik. Przy cache-first i bez konsekwentnego versioningu assetów:
- zwykły refresh nie gwarantuje nowej wersji,
- część urządzeń trzyma starą wersję dłużej,
- szczególnie widoczne na telefonach z wcześniej zainstalowaną PWA.

### 2) Różnice przeglądarek/urządzeń
- Inny moment aktywacji service workera,
- inna polityka trzymania cache,
- różne zachowanie po wznowieniu aplikacji z tła.

To tłumaczy rozjazd: „na jednym telefonie działa, na drugim nie”.

### 3) Ustawienia użytkownika
Mniejszy wpływ niż SW, ale mogą nasilać objaw:
- tryb oszczędzania danych/baterii,
- „zamrożone” karty,
- długa sesja bez pełnego restartu karty/PWA.

---

## Ocena incydentu z pkt 2 (PC: po kilkunastu kliknięciach „nagle OK”)
Najbardziej prawdopodobny scenariusz:
- uruchomiła się sesja na nieaktualnych lub częściowo niezsynchronizowanych assetach,
- po serii interakcji/odświeżeń przeglądarka przełączyła się na już-aktualny zestaw,
- wtedy widok zaczął zachowywać się poprawnie.

Alternatywa (mniej prawdopodobna): opóźnione dociąganie danych realtime z Firestore i wielokrotne re-renderowanie, ale ten wariant gorzej tłumaczy „to samo we wszystkich zakładkach” bez zmiany struktury widoku.

---

## Werdykt: kod vs odświeżanie vs przeglądarka

### Priorytet przyczyn
1. **Najwyższe prawdopodobieństwo:** mechanizm cache/service-worker (odświeżanie i wersjonowanie).
2. **Średnie:** różnice środowiskowe przeglądarek/urządzeń (wspierają pkt 1).
3. **Niższe:** stricte błąd logiki przełączania zakładek w aktualnym kodzie.

Czyli: to jest głównie problem warstwy dostarczania aktualizacji frontendu (PWA cache), a nie jednoznaczny błąd biznesowy kalkulatora.

---

## Jak potwierdzić diagnozę (checklista diagnostyczna bez zmian kodu)
1. Na urządzeniu z problemem:
   - zamknąć PWA/kartę,
   - wyczyścić dane witryny (cache + service worker),
   - uruchomić ponownie.
2. W DevTools (PC):
   - sprawdzić aktywny service worker i nazwę cache,
   - porównać zawartość `app.js` z wersją na serwerze.
3. Zweryfikować, czy oba problematyczne urządzenia po czyszczeniu cache zachowują się już identycznie.

Jeśli po takim teście problem znika, potwierdza to źródło po stronie cache/odświeżania.

---

## Podsumowanie końcowe
Na podstawie analizy kodu i symptomów produkcyjnych: **to najpewniej nie jest losowy bug kliknięć zakładek, tylko efekt utrzymywania starych assetów przez service worker/cache przeglądarki.**

W obecnym wdrożeniu to ryzyko jest realne, bo cache strategia jest agresywnie cache-first dla kluczowych plików aplikacji.

---

## Uzupełnienie analizy (2026-04-02) — odpowiedź na dodatkowe pytanie

### Prompt użytkownika (uzupełnienie kontekstu)
Przeczytaj i rozbuduj analizę: Analizy/Analiza_problem_przelaczania_zakladek_Main_2026-04-02.md
Odpowiedź na pytanie
Czy możliwa jest naprawa poprzez zmianę w kodzie? Jakie proponujesz rozwiązania/zabezpieczenia, żeby wyeliminować ten problem?

### Krótka odpowiedź
**Tak — naprawa poprzez zmianę kodu jest możliwa i wskazana.**
Najmocniejszy punkt ryzyka jest w strategii SW: obecny `fetch` działa globalnie jako **cache-first** (`caches.match` przed `fetch`) dla każdego GET, co sprzyja utrzymywaniu starego app-shella po deployu.

### Dlaczego to wynika z kodu (potwierdzenie)
1. `Main/service-worker.js`:
   - SW cache’uje app-shell (`index.html`, `app.js`, `styles.css`, `pwa-*.js`) i ikonę.
   - W `fetch` zwraca najpierw wpis z cache i dopiero przy braku robi request sieciowy.
   - To oznacza, że nawet po nowym deployu urządzenie może długo pracować na starym JS.
2. `Main/pwa-bootstrap.js`:
   - rejestruje SW, ale nie ma ścieżki wymuszającej kontrolowaną aktualizację UI po instalacji nowej wersji.
3. `Main/index.html` + `Main/app.js`:
   - logika przełączania trybów kalkulatora jest spójna (przyciski `data-calculator-mode`, ustawienie `state.mode`, `render()` z dedykowanymi gałęziami dla `cash`, `organization`, `chips-*`, trybów turniejowych), więc sam mechanizm przełączania nie wygląda na główną przyczynę.

---

## Proponowane rozwiązania / zabezpieczenia (priorytety)

### P1 (najważniejsze): zmiana strategii cache dla dokumentu i krytycznych assetów
**Cel:** unikać sytuacji „stary JS + nowy HTML” albo odwrotnie.

Rekomendacja:
1. `index.html` → **network-first** z fallbackiem do cache (offline).
2. `app.js`, `styles.css`, `pwa-config.js`, `pwa-bootstrap.js` →
   - albo **stale-while-revalidate**,
   - albo network-first z krótkim timeoutem i fallbackiem.
3. Pozostałe zasoby statyczne (np. ikona) mogą zostać cache-first.

Efekt: przy normalnym online po deployu użytkownik dostaje świeżą wersję zamiast starej.

### P1: twarde wersjonowanie assetów
1. Zmienna wersji w buildzie (np. `APP_VERSION=2026-04-02.1`) osadzana w:
   - nazwie cache (`CACHE_NAME`),
   - parametrach assetów w `index.html` (`app.js?v=...`, `styles.css?v=...`), lub hashach nazw plików.
2. Przy każdym deployu automatycznie nowa wersja.

Efekt: przeglądarka/SW nie pomyli starego i nowego zestawu plików.

### P1: kontrolowany flow aktualizacji SW
1. W kliencie nasłuch `registration.updatefound` / `controllerchange`.
2. Komunikat „Dostępna nowa wersja — odśwież” + przycisk wymuszający reload.
3. Opcjonalnie: `skipWaiting` + `clientsClaim` (już jest), ale domknięte przez jawny reload po przejęciu kontroli.

Efekt: koniec „losowego” momentu, kiedy aplikacja przełącza się na nową wersję dopiero po wielu kliknięciach.

### P2: ograniczenie zakresu cache w SW
1. Nie przechwytuj bezwarunkowo wszystkich GET.
2. Filtruj requesty po `event.request.destination` i URL.
3. Dla API/Firestore (jeśli dotyczy) preferuj sieć, nie cache statyczny.

Efekt: mniejsze ryzyko side-effectów i mniej nieprzewidywalnych zachowań między urządzeniami.

### P2: zabezpieczenie runtime w `app.js`
1. Dodać lekki „self-check” zgodności trybów:
   - lista `data-calculator-mode` z DOM porównana z `ALL_CALCULATOR_MODES`.
   - przy rozjeździe: status ostrzegawczy + fallback do bezpiecznego trybu + telemetry/log.
2. Dodać log wersji frontu widoczny w panelu admina.

Efekt: szybsza diagnostyka „mieszanych” wersji na produkcji.

### P3: procedura wdrożeniowa (operacyjna)
1. Po deployu wykonać automatyczny smoke-test:
   - wejście w każdą zakładkę kalkulatora,
   - asercja, że renderują się różne sekcje (nie identyczny DOM).
2. W instrukcji dla admina dodać „hard refresh / clear site data” jako plan awaryjny po wydaniu krytycznym.

Efekt: mniej zgłoszeń z produkcji i szybsze potwierdzenie poprawności release.

---

## Proponowany minimalny plan naprawczy (najbardziej opłacalny)
1. Przebudować `fetch` w SW:
   - HTML: network-first,
   - krytyczne JS/CSS: stale-while-revalidate,
   - reszta statyczna: cache-first.
2. Wprowadzić automatyczne wersjonowanie `CACHE_NAME` i query/hash dla assetów.
3. Dodać w UI sygnał „jest nowa wersja” + reload po `controllerchange`.

To powinno usunąć główne źródło problemu z „identyczną treścią po przełączaniu zakładek” po wdrożeniach.

---

## Uzupełnienie analizy (2026-04-02) — ULTRA DOKŁADNY opis techniczny pod analizę innej aplikacji PWA

### Prompt użytkownika (uzupełnienie kontekstu)
Przeczytaj i rozbuduj analizę: Analizy/Analiza_problem_przelaczania_zakladek_Main_2026-04-02.md

Mam też inną aplikację. Inny projekt. Używa też PWA i service-worker.js
Opisz ULTRA DOKŁADNIE ten błąd od strony technicznej, gdzie mogą być przyczyny itd (zamiast ogólnego opisu użytkownika "nie odświeżają się tabele"). Ma ten opis służyć jako podstawa do analizy innej aplikacji.

---

## 1) Precyzyjna definicja problemu (język techniczny, nie użytkowy)

Objaw „po przełączaniu zakładek widzę ten sam widok / te same dane” można technicznie opisać jako:

1. **Niespójność wersji app-shella** (version skew):
   - dokument HTML, bundle JS i style CSS nie pochodzą z tego samego release.
2. **Niejednoznaczny stan klienta**:
   - warstwa UI sygnalizuje zmianę kontekstu (aktywna zakładka), ale warstwa renderera operuje na nieaktualnym kodzie, nieobsługującym aktualnej mapy trybów/komponentów.
3. **Warunki wyścigu (race conditions) między SW i stroną**:
   - w trakcie aktywacji nowego SW jedna karta może być jeszcze kontrolowana przez stary worker, inna już przez nowy.
4. **Rozjazd cache danych i cache kodu**:
   - kod pochodzi z wersji A, odpowiedzi API z wersji B (lub odwrotnie), co skutkuje renderem fallbackowym albo „ostatnim poprawnym” widokiem.

To nie jest jeden bug funkcji „switchTab”, tylko **klasa błędów spójności dystrybucji frontendu i stanu runtime**.

---

## 2) Anatomia awarii w PWA (krok po kroku)

Poniżej typowy scenariusz, który dokładnie daje takie objawy:

1. Deploy nowej wersji (`index.html` + nowy JS).
2. Urządzenie A:
   - ma stary SW,
   - SW działa `cache-first`,
   - zwraca stary `app.js` z cache.
3. Jednocześnie HTML może być już nowy (np. z sieci lub odwrotnie: HTML stary, JS nowy).
4. Nowy HTML posiada nowe identyfikatory/tryby zakładek, ale stary JS:
   - nie zna części trybów,
   - wpada w fallback renderera,
   - lub odtwarza ostatni poprawny DOM (efekt: „wszędzie to samo”).
5. Po wielu kliknięciach/odświeżeniach:
   - następuje aktywacja nowego SW albo odświeżenie któregoś zasobu,
   - zestaw plików staje się spójny,
   - objaw znika „sam”.

To tłumaczy nieregularność: inny telefon/inna karta/inny moment -> inny wynik.

---

## 3) Pełna mapa przyczyn (root-cause taxonomy)

## A. Przyczyny w warstwie Service Worker

### A1. Zła strategia cache dla app-shella
- `cache-first` dla HTML/JS/CSS jest głównym źródłem utrzymywania starych wersji.
- Dla aplikacji często deployowanej to strategia wysokiego ryzyka.

### A2. Brak/niekonsekwentne wersjonowanie cache
- Brak zmiany `CACHE_NAME` między release’ami.
- Brak hashy w nazwach bundli.
- Brak query-versioningu dla assetów statycznych.

### A3. Nieprawidłowy lifecycle SW
- `install` kończy się częściowym pre-cache.
- `activate` nie czyści starych cache.
- `skipWaiting` bez kontrolowanego reloadu powoduje „przeskok” wersji w losowym momencie pracy użytkownika.

### A4. Zbyt szeroki `fetch` handler
- Przechwytywanie wszystkich `GET` bez filtracji typu zasobu.
- Niechcący cache’owane odpowiedzi dynamiczne/API.

### A5. Błędy w kluczowaniu requestów
- Pomijanie wariantów URL (query params, locale, auth context).
- Odpowiedź niepasująca semantycznie do aktualnej zakładki trafia z cache.

---

## B. Przyczyny w warstwie przeglądarki/platformy

### B1. Różnice implementacyjne (Chrome/Edge/Safari/WebView)
- Inne timingi aktywacji SW.
- Inna polityka ubijania kart w tle.
- Inne limity pamięci/cache.

### B2. Stan „installed PWA” vs karta w przeglądarce
- Osobne procesy i osobne momenty aktualizacji.
- Użytkownik testuje na telefonie „ikonkę PWA”, a na PC kartę WWW — to nie zawsze ta sama ścieżka aktualizacji.

### B3. Długie sesje i resume z tła
- Karta wraca po godzinach/dniach z pamięci procesu.
- Kod JS jest „stary”, ale requesty danych już „nowe”.

---

## C. Przyczyny w warstwie aplikacyjnej (UI/state/data)

### C1. Brak walidacji zgodności DOM↔kod
- DOM zawiera tryb zakładki, którego nie ma w runtime enum.
- Brak twardego błędu i brak fallbacku diagnostycznego.

### C2. Nadmierne użycie stanu współdzielonego
- Jeden store/obiekt stanu dla wielu zakładek bez izolacji per widok.
- Przełączenie zakładki nie resetuje selektorów/filtrów.

### C3. Render asynchroniczny bez kontroli „latest wins”
- Dwa requesty równoległe; starszy kończy się później i nadpisuje nowszy widok.
- Użytkownik widzi dane z poprzedniej zakładki.

### C4. Degradacja do „last good render”
- Gdy pipeline renderowania wykrywa błąd danych/schematu, framework pozostawia ostatni poprawny DOM.
- Użytkownik interpretuje to jako „brak przełączenia”.

### C5. Niezgodność kontraktu API
- Front v2 oczekuje pola `x`, API (cache/proxy) oddaje format v1.
- Renderer używa wartości domyślnej i wszystkie tabele wyglądają podobnie.

---

## D. Infrastruktura/CDN/proxy

### D1. Niespójne TTL
- `index.html` ma krótki TTL, bundle ma długi TTL (lub odwrotnie).
- Powstaje mix wersji.

### D2. Rewalidacja pośrednia
- CDN oddaje `304` dla zasobu mimo faktycznej zmiany przez błędny ETag/Last-Modified.

### D3. Częściowy rollout
- Multi-region deploy: część użytkowników trafia na starą paczkę.
- Połączenie z lokalnym SW multiplikuje efekt.

---

## 4) Co dokładnie dzieje się z punktu widzenia event loop i fetch pipeline

1. Klik zakładki ustawia stan UI synchronnie (`state.mode = X`).
2. Render odpala:
   - część synchroniczna (DOM skeleton),
   - część asynchroniczna (fetch danych, lazy import, transform).
3. `fetch` przechodzi przez SW:
   - SW zwraca odpowiedź z cache lub sieci.
4. Jeśli odpowiedź jest „stara” albo nie dla tego trybu:
   - transform może zwrócić pusty wynik/fallback,
   - renderer nie zmienia struktury (pozostaje poprzednia tabela),
   - aktywna zakładka i zawartość są logicznie rozdzielone.
5. Dodatkowo in-flight request poprzedniej zakładki może dojechać później i nadpisać nowy widok.

Wniosek: bez mechanizmów „request cancellation” i „render token” UI może wyświetlać semantycznie nie ten widok, który wskazuje nawigacja.

---

## 5) Objawy diagnostyczne i ich znaczenie

### Objaw O1
**Na jednym urządzeniu działa, na drugim nie**  
=> wysoka korelacja z SW/cache/version skew, niska z „deterministycznym bugiem kliknięcia”.

### Objaw O2
**Po kilku/kilkunastu kliknięciach nagle wraca norma**  
=> typowe dla aktywacji nowego SW, dogrania brakującego assetu albo wygrania wyścigu requestów.

### Objaw O3
**Zakładka aktywna wizualnie, ale treść „jak poprzednio”**  
=> stan nawigacji aktualny, ale pipeline danych/renderu niezsynchronizowany.

### Objaw O4
**Występuje głównie po deployu**  
=> problem dystrybucji wersji, nie stabilnej logiki biznesowej.

---

## 6) Metody reprodukcji kontrolowanej (do użycia w innym projekcie)

1. Otwórz aplikację na wersji N i upewnij się, że SW + cache istnieją.
2. Zdeployuj wersję N+1 z:
   - nową zakładką albo zmianą mapy widoków.
3. Bez czyszczenia danych:
   - uruchom kartę/PWA,
   - przełączaj zakładki szybko.
4. W DevTools:
   - sprawdź `Application -> Service Workers`,
   - porównaj hash/treść `app.js` z sieci i z cache.
5. Włącz throttling sieci + CPU, aby zwiększyć prawdopodobieństwo race condition.

Jeśli błąd pojawia się częściej przy throttlingu i znika po clear storage — potwierdzasz warstwę cache/SW.

---

## 7) Instrumentacja, która daje „twarde dowody”

## Co logować po stronie klienta
1. `APP_VERSION`, `BUILD_ID`, commit SHA.
2. `navigator.serviceWorker.controller?.scriptURL`.
3. `registration.waiting/installing/active` + czasy przejść.
4. Dla każdego renderu:
   - `tab_id`,
   - `render_token`,
   - `data_version`,
   - `response_source` (`cache`/`network` jeśli możliwe do oznaczenia).

## Co logować w SW
1. Dla każdego `fetch`:
   - URL,
   - strategia (`cache-first`, `network-first`, itp.),
   - hit/miss cache,
   - cache name.
2. W `activate`:
   - lista usuniętych cache.

## Co to daje
- Jednoznacznie widać, czy użytkownik uruchomił zakładkę na niespójnym zestawie assetów.
- Można korelować incydenty z konkretnym release.

---

## 8) Kluczowe zabezpieczenia architektoniczne (dla dowolnej aplikacji PWA)

1. **Atomiczność release app-shella**:
   - HTML zawsze wskazuje na fingerprinted assets (np. `app.abc123.js`).
2. **Strategia per zasób**:
   - HTML: network-first,
   - JS/CSS: stale-while-revalidate lub network-first,
   - obrazy/fonty: cache-first,
   - API: zwykle network-first + fallback.
3. **Gating aktualizacji**:
   - jeśli wykryto nowy SW, pokaż UI „odśwież aplikację”.
4. **Render token / abort controller**:
   - tylko najnowsza akcja użytkownika może finalizować render.
5. **Schema/version check danych**:
   - jeśli kontrakt danych niezgodny, pokaż kontrolowany błąd zamiast „starej tabeli”.
6. **Defensywny fallback**:
   - fallback musi być jawnie oznaczony (banner), nigdy „udawać” poprawnego widoku.

---

## 9) „Gotowy szablon diagnozy” dla innej aplikacji (checklista audytowa)

1. Czy SW obsługuje wszystkie GET globalnie?
2. Czy HTML i bundle mają spójne wersjonowanie?
3. Czy `CACHE_NAME` zmienia się per deploy?
4. Czy istnieje procedura `activate` czyszcząca stare cache?
5. Czy UI informuje o nowej wersji i wymusza kontrolowany reload?
6. Czy przełączanie zakładek ma izolację stanu per widok?
7. Czy requesty poprzedniego widoku są anulowane po zmianie zakładki?
8. Czy logowana jest wersja klienta i źródło odpowiedzi (cache/network)?
9. Czy po deployu wykonywany jest smoke-test wszystkich zakładek?
10. Czy incydent znika po „clear site data”?

Jeśli odpowiedzi 1–5 są negatywne, to bardzo wysoka szansa, że problem jest „deployment/cache consistency”, nie stricte „bug tabeli”.

---

## 10) Podsumowanie techniczne do przeniesienia 1:1 do innego projektu

Najbardziej użyteczny model mentalny tego błędu:

- To **nie** „tabele się nie odświeżają”.
- To **niespójność wersji warstwy prezentacji i danych**, zwykle indukowana przez SW cache policy + lifecycle update.
- Objaw końcowy (identyczna treść między zakładkami) jest wtórny i może powstawać wieloma ścieżkami:
  - stary renderer + nowa nawigacja,
  - race condition renderów,
  - fallback na ostatni poprawny DOM,
  - niezgodny kontrakt danych.

Dlatego analiza innej aplikacji PWA powinna zaczynać się od:
1. mapy strategii cache per zasób,
2. ścieżki aktualizacji SW,
3. dowodów wersji runtime na urządzeniu z incydentem,
a dopiero potem od debugowania samej funkcji przełączania zakładek.

---

## Ocena końcowa (na pytanie użytkownika)
- **Czy możliwa jest naprawa poprzez zmianę kodu?**
  - **Tak, zdecydowanie.**
- **Czy same ustawienia przeglądarki mogą to powodować?**
  - Mogą wzmacniać objaw, ale rdzeń problemu nadal wskazuje na strategię aktualizacji i cache PWA po stronie kodu.
- **Jak wyeliminować problem?**
  - Zmienić strategię SW + wdrożyć twarde wersjonowanie + kontrolowany mechanizm aktualizacji UI.

---

## Sekcja zmian w kodzie po wdrożeniu rekomendowanej naprawy (2026-04-02)

### Plik `Main/service-worker.js`
Linia 1  
Było: `const CACHE_NAME = "karty-main-pwa-v4";`  
Jest: `const APP_VERSION = "2026-04-02.1";` oraz `const CACHE_NAME = \`karty-main-pwa-${APP_VERSION}\`;`

Linia 3-10  
Było: cache app-shell bez wersjonowanych query (`./styles.css`, `./app.js`, `./pwa-config.js`, `./pwa-bootstrap.js`).  
Jest: cache app-shell z wersjonowaniem (`./styles.css?v=2026-04-02.1`, `./app.js?v=2026-04-02.1`, `./pwa-config.js?v=2026-04-02.1`, `./pwa-bootstrap.js?v=2026-04-02.1`).

Linia 13-31  
Było: globalny `fetch` cache-first (`caches.match` -> `fetch`) dla wszystkich `GET`.  
Jest: strategie per typ żądania:
- `networkFirst()` dla HTML (`request.mode === "navigate"`),
- `staleWhileRevalidate()` dla krytycznych JS/CSS,
- `cacheFirst()` dla pozostałych statycznych zasobów,
- filtr tylko dla `same-origin`.

Linia 67  
Było: brak obsługi komunikatów z klienta.  
Jest: `self.addEventListener("message", ...)` z obsługą `SKIP_WAITING`.

### Plik `Main/pwa-bootstrap.js`
Linia 2  
Było: tylko rejestracja SW po `window.load`.  
Jest: rozszerzony bootstrap aktualizacji SW.

Linia 16  
Było: `navigator.serviceWorker.register("service-worker.js")`.  
Jest: `navigator.serviceWorker.register("service-worker.js?v=2026-04-02.1")`.

Linia 17-32  
Było: brak logiki aktualizacji nowego workera.  
Jest: obsługa `registration.waiting` i `updatefound` + wysyłanie `SKIP_WAITING` dla szybszego przejęcia nowej wersji.

Linia 35  
Było: brak reakcji na zmianę kontrolera SW.  
Jest: nasłuch `controllerchange` i pojedynczy `window.location.reload()` (z ochroną `isRefreshing`).

### Plik `Main/index.html`
Linia 8  
Było: `<script src="pwa-config.js"></script>`  
Jest: `<script src="pwa-config.js?v=2026-04-02.1"></script>`

Linia 15  
Było: `<link rel="stylesheet" href="styles.css" />`  
Jest: `<link rel="stylesheet" href="styles.css?v=2026-04-02.1" />`

Linia 974-975  
Było: `<script src="pwa-bootstrap.js"></script>` i `<script src="app.js"></script>`  
Jest: `<script src="pwa-bootstrap.js?v=2026-04-02.1"></script>` i `<script src="app.js?v=2026-04-02.1"></script>`
