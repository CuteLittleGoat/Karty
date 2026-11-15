# Instalacja aplikacji Main na iPhonie / iPadzie (iOS) — analiza

Data: 2026-11-15

## Prompt użytkownika (zachowany dla kontekstu)

> Będziesz pracować na module Main. Mam uwagi użytkownika do aplikacji:
>
> - skasować napis "to nie jest nielegalny poker, to nie jest nielegalne kasyno"
> - zmienić nazwę z" przycisnąć w razie kontroli celno-skarbowej" na " nie wciskać"
> - **brak możliwości pobrania aplikacji na urządzeniach IOS - przeprowadź analizę czy jest możliwe zrobienie czegoś jak obecne PWA tylko na iOS,**
> - moduł "gry admina" oraz " gry użytkowników" przycisk "notatki do gry" skasować domyślny tekst zostawić puste miejsce.
> - w module "statystyki" oraz "ranking graczy". przed kolumną "gracz" dodać kolumnę o nazwie "lp." będzie numerowała wszystkich graczy
> - w module "statystyki" oraz "ranking graczy". zmienić nazwy kolumn:
>   stara nazwa "łączna pula" nowa nazwa "łącznie żetonów"
>   stara nazwa "+/- nowa nazwa "żetony na koniec"
>   stara nazwa "wpłata" nowa nazwa "żetony na start "
>   stara nazwa "wypłata" nowa nazwa "wygrane żetony"
> - zamienić nazwę modułu "ranking graczy" na "bilans żetonów"
> - skasować w module "kalkulator" zakładki takie jak, tournament2,cash, organizacja
> - w module "kalkulator" pozmieniać nazwy zakładek
>   stara nazwa "żetony cash1" nowa nazwa "żetony niski nominał 1"
>   stara nazwa "żetony cash2" nowa nazwa "żetony niski nominał 2"
>   stara nazwa "żetony tournament1" nowa nazwa "żetony wysoki nominał 1"
>   stara nazwa "żetony tournament2" nowa nazwa "żetony wysoki nominał 2"
> - moduł "gry admina" oraz "gry użytkowników" przycisk "szczegóły" oraz "podsumowanie gier". zmienić nazwy kolumn:
>   stara nazwa "wpisowe" nowa nazwa "start"
>   stara nazwa "rebuy/add-on" nowa nazwa "powroty"
>   stara nazwa "wypłata" nowa nazwa "koniec"
>   stara nazwa "+/-" nowa nazwa "żetony na koniec"

Ten plik dotyczy wyłącznie wytłuszczonego punktu. Pozostałe punkty zostały wdrożone w kodzie modułu Main.

---

## 1. Odpowiedź w skrócie

**Tak, da się — i to bez pisania osobnej aplikacji.** Obecna aplikacja PWA modułu Main działa na iPhonie i iPadzie. Brakuje tylko jednego: **iOS nigdy nie pokazuje okienka „Zainstaluj aplikację”**, które gracze znają z Androida. Na iPhonie aplikację „pobiera się” ręcznie, z menu **Udostępnij → Do ekranu początkowego**. Po dodaniu ikona na ekranie głównym otwiera aplikację w osobnym oknie, bez paska adresu Safari — tak samo jak na Androidzie.

Zgłoszenie „brak możliwości pobrania” wynika więc najpewniej z tego, że użytkownik iPhone'a czekał na komunikat instalacji, który na iOS nie istnieje. To nie jest błąd aplikacji — to zasada działania iOS.

| Pytanie | Odpowiedź |
|---|---|
| Czy aplikację da się zainstalować na iPhonie? | **Tak**, przez Safari: *Udostępnij → Do ekranu początkowego*. Od iOS 16.4 także z Chrome i Edge na iPhonie. |
| Czy pojawi się automatyczny komunikat „Zainstaluj”? | **Nie.** iOS go nie obsługuje i nie da się go wywołać z kodu. |
| Czy trzeba zmieniać kod, żeby instalacja działała? | **Nie.** Działa już dziś. Zalecane są drobne ulepszenia (pkt 5). |
| Czy będzie to wyglądać jak na Androidzie? | Prawie. Różnice: górny pasek z godziną zostaje (pkt 4.1), brak komunikatu instalacji (pkt 4.2). |
| Czy warto robić aplikację do App Store? | **Nie polecam** — koszt, Mac z Xcode, ryzyko odrzucenia przez Apple (pkt 6). |

---

## 2. Jak dziś działa „pobieranie” aplikacji (Android)

Sprawdzone w kodzie:

- `Main/pwa-config.js` dodaje do strony link do manifestu `Main/manifest-any.webmanifest`, ale **tylko w widoku gracza** (bez `?admin=1`). Wejście administratora celowo nie jest instalowalne.
- Manifest wskazuje adres startowy `./index.html?pwa=1&view=user`, nazwę „Poker - rozgrywki” / „Poker”, ikonę `Pliki/Ikona.png` (1024 × 1024 px, ok. 1,7 MB) oraz tryb `fullscreen`.
- `Main/pwa-bootstrap.js` rejestruje Service Worker (`Main/service-worker.js`), który trzyma kopię aplikacji w pamięci telefonu i podmienia ją po wdrożeniu nowej wersji.
- Chrome na Androidzie, widząc manifest i Service Worker, **sam** proponuje „Zainstaluj aplikację” (zdarzenie `beforeinstallprompt`). Aplikacja nie ma własnego przycisku instalacji — korzysta wyłącznie z propozycji przeglądarki (w kodzie nie ma obsługi `beforeinstallprompt`).

To ostatnie jest sednem sprawy: **na iPhonie nikt nie zaproponuje instalacji**, bo Safari nie ma takiego zdarzenia.

---

## 3. Jak to wygląda na iOS (stan na listopad 2026)

### 3.1. Co obsługuje iOS

| Element | iOS | Znaczenie dla aplikacji Main |
|---|---|---|
| Dodanie strony do ekranu początkowego | **tak** (Safari; Chrome i Edge od iOS 16.4) | to jest odpowiednik „pobrania” |
| Otwieranie jako osobna aplikacja (bez paska Safari) | **tak** — od iOS 26 **każda** strona dodana do ekranu otwiera się jako aplikacja, chyba że użytkownik wyłączy przełącznik „Otwórz jako aplikację internetową” | aplikacja Main wygląda jak zainstalowana |
| Manifest `start_url` | tak (od iOS 11.3) | ikona otwiera widok gracza (`?pwa=1&view=user`), nie panel admina |
| Manifest `icons` | tak (od iOS 15.4); ikona z `<link rel="apple-touch-icon">` ma pierwszeństwo | ikona się pojawi, ale lepiej podać dedykowaną (pkt 5.2) |
| Service Worker (praca z kopią aplikacji, aktualizacje) | tak | mechanizm aktualizacji z `pwa-bootstrap.js` działa |
| Tryb `display: fullscreen` | **nie** — iOS cofa się do `standalone` | górny pasek z godziną zostaje (opisane już w `Uwagi_2026-09-20.md`, pkt 4.3) |
| `display_override` | **nie** | bez znaczenia — iOS i tak użyje `standalone` |
| Automatyczny komunikat instalacji (`beforeinstallprompt`) | **nie** | nie da się zrobić przycisku „Zainstaluj” jak w Chrome |
| Wspólna pamięć Safari i zainstalowanej aplikacji | **nie** | aplikacja z ekranu startuje „na czysto” — PIN trzeba wpisać w niej, a nie w Safari (pkt 4.3) |

Źródła: notatki WebKit do Safari 26 („By default, every website added to the Home Screen opens as a web app”, „there are now zero requirements for “installability” in Safari”) oraz tabela zgodności M. Firtmana (aktualizacja 13.10.2026) — linki na końcu.

### 3.2. Unia Europejska

W lutym 2024 Apple zapowiedziało wyłączenie aplikacji z ekranu początkowego w UE (iOS 17.4, ustawa DMA), ale **wycofało się z tego przed premierą** iOS 17.4. Aplikacje internetowe na ekranie początkowym działają w Polsce tak samo jak w reszcie świata.

---

## 4. Różnice, o których trzeba powiedzieć graczom z iPhone'em

### 4.1. Pasek z godziną zostaje
Na Androidzie aplikacja uruchamia się na pełnym ekranie. Na iPhonie górny pasek z godziną i baterią zawsze jest widoczny — treść aplikacji wchodzi pod niego, bo `Main/index.html` ma już `apple-mobile-web-app-status-bar-style: black-translucent`. Tego nie da się zmienić (ustalone w analizie z 2026-09-20).

### 4.2. Instalacja jest ręczna
Nie będzie komunikatu. Gracz musi sam wykonać kroki z pkt 5.1. To jedyna realna „bariera” — i jedyna rzecz, którą warto ułatwić w aplikacji.

### 4.3. Safari i aplikacja z ekranu mają osobną pamięć
Zainstalowana aplikacja nie widzi danych zapisanych w Safari. W praktyce w aplikacji Main nie ma to dużego znaczenia, bo PIN-y Strefy Gracza są trzymane w `sessionStorage` i i tak trzeba je wpisywać po każdym uruchomieniu. Wybrany rok w Statystykach (`localStorage`) zapamięta się osobno w Safari i osobno w aplikacji.

### 4.4. Do sprawdzenia na prawdziwym iPhonie
Tego nie da się zweryfikować w tym środowisku (brak silnika Safari i urządzenia z iOS). Elementy z ryzykiem:

| Funkcja | Dlaczego może się różnić | Gdzie w kodzie |
|---|---|---|
| **Eksportuj** w Statystykach / Bilansie żetonów (plik `.xlsx`) | pobieranie plików w trybie aplikacji z ekranu bywało na iOS ograniczone — plik może otworzyć się w podglądzie zamiast zapisać | `XLSX.writeFile` w `initStatisticsView` |
| Okienka `window.prompt` (zbiorcze „Start” i wagi) | działają w Safari, w trybie aplikacji zwykle też — ale warto kliknąć raz | przyciski `Start`, `Waga1`–`Waga6` |
| App Check (reCAPTCHA Enterprise) | token jest wydawany dla domeny `cutelittlegoat.github.io`, która w aplikacji z ekranu jest ta sama — powinno działać bez zmian | `activateAppCheckIfConfigured` |

---

## 5. Co proponuję zrobić (wariant A — rekomendowany)

### 5.1. Instrukcja dla graczy (bez zmian w kodzie)

**iPhone / iPad — Safari:**
1. Otwórz w Safari ten sam adres aplikacji, którego używają gracze z Androidem (widok gracza, **bez** `?admin=1`).
2. Stuknij **Udostępnij** (kwadrat ze strzałką w górę). W iOS 26 przy kompaktowym pasku kart przycisk jest pod ikoną **•••**.
3. Przewiń listę i wybierz **Do ekranu początkowego**.
4. Upewnij się, że przełącznik **Otwórz jako aplikację internetową** jest włączony (w iOS 26 jest włączony domyślnie; dokładne brzmienie zależy od wersji systemu).
5. Stuknij **Dodaj**. Na ekranie pojawi się ikona „Poker”.

**iPhone / iPad — Chrome lub Edge (iOS 16.4 i nowsze):** menu **Udostępnij** w pasku adresu → **Dodaj do ekranu początkowego**.

### 5.2. Drobne zmiany w kodzie (do decyzji)

| # | Zmiana | Po co | Koszt |
|---|---|---|---|
| A1 | **Podpowiedź instalacji dla iPhone'a** — mały pasek w widoku gracza, pokazywany tylko na iOS, tylko gdy aplikacja jest otwarta w Safari (a nie z ikony), z krokami z pkt 5.1 i przyciskiem „Nie pokazuj więcej” | zastępuje komunikat, którego iOS nie ma — rozwiązuje samo zgłoszenie | mały: rozpoznanie iOS + `navigator.standalone` / `display-mode: standalone`, jeden element HTML, styl, zapamiętanie zamknięcia w `localStorage` |
| A2 | **Ikona `apple-touch-icon` 180 × 180 px** (`<link rel="apple-touch-icon">` w `Main/index.html`) | dziś iOS musi przeskalować ikonę 1024 px / 1,7 MB z manifestu, a ikony oznaczone jako `maskable` iOS pomija; dedykowana ikona daje pewny, ostry wygląd | bardzo mały: jeden plik PNG + jedna linia HTML + wpis w `APP_SHELL_ASSETS` Service Workera |
| A3 | Sekcja „Instalacja na iPhonie” w `Main/docs/README.md` | instrukcja z pkt 5.1 w dokumentacji użytkownika | mały |

Żadna z tych zmian nie dotyka bazy danych ani działania na Androidzie.

---

## 6. Alternatywy (nierekomendowane)

### Wariant B — aplikacja w App Store (np. Capacitor / WKWebView)
- **Koszt stały:** konto Apple Developer Program (99 USD rocznie) i komputer Mac z Xcode do budowania aplikacji.
- **Ryzyko odrzucenia:** wytyczna App Store 4.2 („Minimum Functionality”) — Apple regularnie odrzuca aplikacje, które są tylko opakowaną stroną WWW; samo dodanie lokalizacji czy udostępniania nie wystarcza. Aplikacja o tematyce pokerowej z wpisowym i wypłatami będzie dodatkowo oceniana pod kątem zasad dotyczących gier i hazardu.
- **Każda zmiana** w aplikacji wymaga ponownej publikacji i przeglądu przez Apple, a nie — jak dziś — samego wdrożenia na GitHub Pages.
- **Dystrybucja bez App Store:** TestFlight (wersje wygasają po 90 dniach) albo Ad Hoc (limit urządzeń, rejestracja identyfikatora każdego telefonu) — uciążliwe dla grupy znajomych.

Zysk względem wariantu A byłby niewielki: ta sama aplikacja, ten sam pasek stanu, a jedyna różnica to ikona pobierana z App Store zamiast z Safari.

### Wariant C — profil konfiguracyjny `.mobileconfig` (Web Clip)
Plik, który po pobraniu i zainstalowaniu w *Ustawieniach* tworzy ikonę aplikacji na ekranie. Daje wrażenie „pobrania pliku”, ale:
- iOS wyświetla ostrzeżenie o niezweryfikowanym profilu (bez płatnego certyfikatu),
- instalacja wymaga więcej kroków niż *Do ekranu początkowego*,
- od iOS 26 nie daje nic ponad to, co Safari robi samo.

---

## 7. Pytania do decyzji

**Q1. Czy dodać podpowiedź instalacji dla iPhone'a (A1)?**
*Dlaczego pytam:* to jedyny sposób, żeby gracz z iPhone'em sam dowiedział się, jak zainstalować aplikację. Bez tego trzeba przekazać instrukcję z pkt 5.1 ręcznie (np. na czacie).
- (a) tak
- (b) nie, wystarczy instrukcja przekazana graczom

**Q2. Czy dodać dedykowaną ikonę dla iOS (A2)?**
*Dlaczego pytam:* bez niej ikona też się pojawi, ale iOS skaluje plik 1024 px i może go potraktować inaczej niż Android.
- (a) tak
- (b) nie

**Q3. Czy podpowiedź (jeśli A1 = tak) ma być widoczna tylko przed pierwszym zamknięciem, czy przy każdym wejściu z Safari?**
- (a) do kliknięcia „Nie pokazuj więcej”
- (b) zawsze, gdy aplikacja jest otwarta w Safari zamiast z ikony

**Q4. Czy ktoś z graczy może przetestować na swoim iPhonie punkty z tabeli 4.4 (eksport `.xlsx`, okienka `Start` / `Waga`)?**
*Dlaczego pytam:* w tym środowisku nie ma Safari ani iPhone'a — te elementy da się potwierdzić wyłącznie na prawdziwym urządzeniu.

---

## 8. Źródła

- [WebKit — WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/) — domyślne „Open as Web App”, brak wymagań instalowalności.
- [Maximiliano Firtman — iOS PWA Compatibility](https://firt.dev/notes/pwa-ios/) — tabela obsługiwanych elementów manifestu, brak `beforeinstallprompt`, brak `fullscreen`, osobna pamięć Safari i aplikacji.
- [MobiLoud — Do Progressive Web Apps Work on iOS? (2026)](https://www.mobiloud.com/blog/progressive-web-apps-ios/)
- [Apple Developer Forums — odrzucenie aplikacji Capacitor za wytyczną 4.2](https://developer.apple.com/forums/thread/812889)
- [MobiLoud — App Store Review Guidelines a aplikacje-opakowania WebView](https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper)
