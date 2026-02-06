# Dokumentacja

## Przegląd projektu
Projekt to pojedyncza strona HTML działająca jako statyczny „hub” z odnośnikami do zewnętrznych narzędzi Wrath & Glory. Strona zawiera osadzone CSS oraz krótki skrypt JavaScript przełączający widok użytkownika/admina — bez backendu i bez zewnętrznych zależności.

## Struktura plików
- `Main/index.html` – jedyny plik aplikacji zawierający strukturę strony, stylizację w `<style>` oraz skrypt przełączający widok admina.
- `Main/ZmienneHiperlacza.md` – plik z dynamicznymi adresami dla przycisków Mapa i Obrazki w formacie `Nazwa: URL`.
- `Main/wrath-glory-logo-warhammer.png` – logo wyświetlane w nagłówku strony.
- `Main/docs/README.md` – instrukcja użytkownika i informacje o aktualizacji aplikacji (PL/EN).
- `Main/docs/Documentation.md` – niniejszy dokument z opisem kodu.

## Szczegółowy opis `Main/index.html`

### 1. Deklaracje dokumentu i nagłówek
- `<!DOCTYPE html>` – deklaruje HTML5.
- `<html lang="pl">` – język dokumentu ustawiony na polski.
- `<meta charset="UTF-8">` – kodowanie znaków UTF‑8.
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` – poprawne skalowanie na urządzeniach mobilnych.
- `<title>Kozi Przybornik</title>` – tytuł karty przeglądarki.

### 2. Stylizacja (sekcja `<style>`)
Cała stylizacja jest osadzona w `Main/index.html` i nie korzysta z zewnętrznych plików CSS.

#### 2.1 Zmienne CSS (`:root`)
Zmienne definiują motyw „zielonego terminala”. Poniżej pełna lista wraz z dokładnymi wartościami:
- `--bg` – tło o trzech warstwach, zdefiniowane jako:
  1. `radial-gradient(circle at 20% 20%, rgba(0, 255, 128, 0.06), transparent 25%)`
  2. `radial-gradient(circle at 80% 0%, rgba(0, 255, 128, 0.08), transparent 35%)`
  3. kolor bazowy `#031605`
- `--panel` – kolor tła panelu głównego: `#000`.
- `--border` – kolor ramki panelu i przycisków: `#16c60c`.
- `--text` – kolor tekstu: `#9cf09c`.
- `--accent` – akcent zielony: `#16c60c`.
- `--accent-dark` – ciemny akcent: `#0d7a07`.
- `--glow` – cień panelu: `0 0 25px rgba(22, 198, 12, 0.45)`.
- `--radius` – zaokrąglenie rogów panelu: `10px`.

#### 2.2 Styl ogólny (`*`)
- `box-sizing: border-box` gwarantuje, że padding i border są wliczane w szerokość.
- Fonty są wymuszone w kolejności fallback: `"Consolas"`, `"Fira Code"`, `"Source Code Pro"`, `monospace`. Dzięki temu cały interfejs ma jednolity krój monospace.

#### 2.3 Układ strony (`body`, `main`)
- `body`
  - `margin: 0` i `min-height: 100vh` wypełniają ekran.
  - `display: flex`, `align-items: center`, `justify-content: center` centralizują panel.
  - `padding: 24px` zapewnia margines od krawędzi okna.
  - `background: var(--bg)` ustawia wielowarstwowy gradient.
  - `color: var(--text)` ustawia kolor tekstu domyślnie.
- `main` (panel)
  - szerokość: `width: min(860px, 100%)`.
  - tło: `background: var(--panel)` (czarne).
  - obramowanie: `border: 2px solid var(--border)`.
  - zaokrąglenie: `border-radius: var(--radius)` (10px).
  - poświata: `box-shadow: var(--glow)` (0 0 25px z alfą 0.45).
  - padding: `32px 32px 28px` (góra, prawa/lewa, dół).
  - układ: `display: flex`, `flex-direction: column`, `align-items: center`, `gap: 22px`.

#### 2.4 Logo (`.logo`)
- `max-width: clamp(220px, 40vw, 320px)` ustawia zakres wielkości 220–320px, zależnie od szerokości viewportu.
- `width: 100%` pozwala logo wypełnić dostępną szerokość w limicie clamp.
- `display: block` usuwa domyślne odstępy inline.

#### 2.5 Sekcja akcji (`.actions`, `.stack`, `.stack.right`)
- `.actions`
  - `width: 100%` rozciąga siatkę na szerokość panelu.
  - `display: grid` z `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` tworzy elastyczne kolumny o minimalnej szerokości 220px.
  - `gap: 18px 20px` oznacza 18px w pionie i 20px w poziomie.
  - `align-items: start` zapewnia wyrównanie do góry w każdej kolumnie.
- `.stack`
  - `display: flex`, `flex-direction: column` układa przycisk i notatkę pionowo.
  - `gap: 8px` zachowuje dystans między przyciskiem a notatką.
- `.stack.right`
  - `align-items: stretch` rozciąga elementy w osi poprzecznej (użyte tylko dla przycisku Infoczytnik).

#### 2.6 Przyciski (`.btn`)
- Elementy `<a>` stylizowane jako przyciski:
  - `appearance: none`.
  - `border: 2px solid var(--border)` = 2px zielonej ramki (#16c60c).
  - `background: rgba(22, 198, 12, 0.08)` – półprzezroczyste tło.
  - `color: var(--text)` – tekst w odcieniu #9cf09c.
  - `padding: 10px 14px` (góra/dół 10px, lewo/prawo 14px).
  - `border-radius: 6px`.
  - `font-size: 15px`.
  - `font-weight: 600`.
  - `text-decoration: none`.
  - `text-align: center`.
  - `display: block` i `width: 100%` zapewniają pełną szerokość w kolumnie.
  - `transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease`.
- Stan `:hover`
  - `transform: translateY(-1px)` – delikatne uniesienie.
  - `box-shadow: 0 0 18px rgba(22, 198, 12, 0.3)` – poświata.
  - `background: rgba(22, 198, 12, 0.14)` – jaśniejsze tło.
- Stan `:active`
  - `transform: translateY(0)`.
  - `background: rgba(22, 198, 12, 0.22)` – najjaśniejsza wersja tła.

#### 2.7 Notatki pomocnicze (`.note`)
- Teksty pomocnicze umieszczane pod wybranymi przyciskami.
- Pod **Skarbcem Danych** znajduje się instrukcja dodania parametru `index.html?admin=1`, ale jest widoczna tylko w trybie admina (element ma `data-admin-only="true"`).
  - Dokładna treść: `aby wejść do panelu admina dopisz do adresu index.html?admin=1` (parametr jest w `<strong>`).
- Pod **Audio** znajduje się analogiczna notatka, również widoczna tylko w trybie admina.
- `margin: 0` usuwa domyślny margines akapitu.
- `color: var(--text)` utrzymuje spójny kolor.
- `font-size: 13px`.
- `line-height: 1.35`.
- `word-break: break-word` pozwala łamać dłuższe ciągi (np. URL).

### 3. Zawartość (`<body>`)
Struktura dokumentu składa się z:
- `<main>` – główny panel.
- `<img class="logo">` – logo z atrybutami `src="wrath-glory-logo-warhammer.png"` oraz `alt="Logo Wrath & Glory"` (plik znajduje się w `Main/` obok `index.html`).
- `<div class="actions">` – siatka przycisków w kolejności od lewej:
  1. **Generator NPC** – link do `https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNPC/` (widoczny tylko w trybie admina; element ma `data-admin-only="true"`).
  2. **Generator nazw** – link do `../GeneratorNazw/index.html` (widoczny tylko w trybie admina; element ma `data-admin-only="true"`).
  3. **Skarbiec Danych** – link oznaczony atrybutem `data-datavault-link`. W kodzie źródłowym domyślnie wskazuje `https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html`, a w trybie admina skrypt zamienia go na `https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html?admin=1`. Pod przyciskiem znajduje się notka o parametrze admina, widoczna wyłącznie w trybie admina.
  4. **Mapa** – przycisk posiada atrybut `data-map-link`, a docelowy adres jest ustawiany przez skrypt na podstawie pliku `Main/ZmienneHiperlacza.md`. W HTML domyślnie ma `href="#"` i jest zastępowany po wczytaniu konfiguracji.
  5. **Obrazki** – przycisk posiada atrybut `data-images-link`, a docelowy adres jest ustawiany przez skrypt na podstawie pliku `Main/ZmienneHiperlacza.md`. W HTML domyślnie ma `href="#"` i jest zastępowany po wczytaniu konfiguracji.
  6. **Infoczytnik** – link dynamiczny: w trybie użytkownika kieruje do `../Infoczytnik/Infoczytnik.html`, a w trybie admina do `https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/index.html`.
  7. **Kalkulator** – link do `https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/`.
  8. **Rzut kośćmi** – link do `../DiceRoller/index.html` (ścieżka lokalna w repozytorium).
  9. **Audio** – link do `../Audio/index.html` (cały blok widoczny tylko w trybie admina).

Przyciski kierujące do zewnętrznych adresów (Generator NPC, Skarbiec Danych, Mapa, Obrazki, Kalkulator) otwierają się w nowej karcie (`target="_blank"`) z zabezpieczeniem `rel="noopener noreferrer"`.

### 4. Logika widoków (skrypt JavaScript)
Skrypt na końcu `<body>` przełącza widok użytkownika i admina na podstawie parametru URL:
- `isAdmin` to wynik `new URLSearchParams(window.location.search).get("admin") === "1"`.
- Jeśli `isAdmin` jest fałszem, wszystkie elementy z `data-admin-only="true"` są usuwane z DOM (np. Generator NPC, Audio, notatki admina).
- Link **Infoczytnik** (`[data-infoczytnik-link]`) jest ustawiany dynamicznie:
  - tryb użytkownika → `../Infoczytnik/Infoczytnik.html`,
  - tryb admina → `https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/index.html`.
- Link **Skarbiec Danych** (`[data-datavault-link]`) jest ustawiany dynamicznie:
  - tryb użytkownika → `https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html`,
  - tryb admina → `https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html?admin=1`.
- Linki **Mapa** i **Obrazki** są ustawiane po wczytaniu pliku `Main/ZmienneHiperlacza.md`:
  - format pliku: każda linia w postaci `Mapa: URL` lub `Obrazki: URL`.
  - skrypt pobiera plik `ZmienneHiperlacza.md`, parsuje linie przez wyrażenie regularne `^(Mapa|Obrazki)\s*:\s*(\S+)` i ustawia `href` w elementach z `data-map-link` i `data-images-link`.
  - jeśli plik nie jest dostępny, skrypt loguje ostrzeżenie w konsoli i pozostawia domyślne `href="#"`.

## Aktualizacja treści
- **Zmiana adresów URL innych przycisków**: edytuj atrybuty `href` w przyciskach `<a class="btn">` w `Main/index.html` (np. Generator NPC, Skarbiec Danych, Kalkulator).
- **Zmiana linku mapy**: zaktualizuj wpis `Mapa: ...` w pliku `Main/ZmienneHiperlacza.md`.
- **Zmiana linku obrazków**: zaktualizuj wpis `Obrazki: ...` w pliku `Main/ZmienneHiperlacza.md`.
- **Zmiana instrukcji admina**: zaktualizuj treść akapitu `.note` pod przyciskiem Skarbiec Danych lub Audio (elementy z `data-admin-only="true"`).
- **Zmiana stylu**: edytuj sekcję `<style>` w `Main/index.html` i stosuj dokładnie podane wartości (kolory, odstępy, rozmiary, cienie) aby zachować identyczny wygląd.
- **Zmiana logo**: podmień plik `Main/wrath-glory-logo-warhammer.png` i pozostaw tę samą nazwę, jeśli nie chcesz edytować HTML.

## Uruchamianie lokalne
Strona jest statyczna i działa bez serwera, ale dla testów można uruchomić lokalny serwer:

```bash
python -m http.server 8000
```

Następnie otwórz `http://localhost:8000/Main/index.html`.
