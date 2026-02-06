# Detale layoutu (casino vibe)

## 0) Wymóg krytyczny: polskie znaki i kodowanie
- Pliki HTML/CSS/JS zapisane w UTF-8.
- W `<head>` zawsze:
  - `<meta charset="utf-8">`
  - `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Fonty muszą mieć Latin Extended (polskie diakrytyki).
- W CSS ustaw:
  - `text-rendering: geometricPrecision;`
  - `-webkit-font-smoothing: antialiased;`
  - `font-kerning: normal;`
- Unikaj fontów display bez latin-ext jako jedynych — zawsze dawaj fallback.

## 1) Kierunek artystyczny
- Noir + złoto + aksamitna zieleń + neon.
- Ciemne tło jak sala kasyna, złote akcenty jak mosiężne listwy, zielone „filcowe” panele.
- Delikatny glow jak od neonów, bez cyberpunkowego przesytu.

## 2) Fonty i typografia
### 2.1 Zasady ogólne
- Trzy warstwy typografii: nagłówki (premium), tekst użytkowy (czytelny), dane tabelaryczne (mono/tabular).
- Cyfry równej szerokości: `font-variant-numeric: tabular-nums;`
- Tytuły: `letter-spacing: 0.06–0.12em`.
- Tabele/stawki: `letter-spacing: 0.02em`.

### 2.2 Stosy fontów (tokeny)
- **Tytuł:** `"Cinzel", "Trajan Pro", "Times New Roman", serif` (600–700, uppercase, 0.12em, lh 1.05)
- **Podtytuł:** `"Cormorant Garamond", "Georgia", serif` (600, 0.06em, lh 1.15)
- **Panel:** `"Rajdhani", "Segoe UI", "Roboto", "Noto Sans", sans-serif` (600, uppercase, 0.08em)
- **Tekst:** `"Inter", "Segoe UI", "Roboto", "Noto Sans", "Arial", sans-serif` (400–500, 0.01em, lh 1.55)
- **Nazwisko:** `"IBM Plex Sans", "Inter", "Segoe UI", "Noto Sans", sans-serif` (600, 0.02em)
- **Stolik:** `"Oswald", "Rajdhani", "Segoe UI", sans-serif` (600–700, uppercase, 0.10em)
- **Stawka:** `"Roboto Mono", "JetBrains Mono", "Consolas", "Courier New", monospace` (600, tabular, 0.02em)
- **Chip:** `"Sora", "Inter", "Segoe UI", sans-serif` (700, uppercase, 0.10em, 11–12px)
- **Log:** `"Fira Code", "JetBrains Mono", "Consolas", monospace` (400–500, 12–13px)

### 2.3 Skala rozmiarów
- `--fs-title: clamp(26px, 3.2vw, 40px)`
- `--fs-subtitle: clamp(16px, 1.8vw, 22px)`
- `--fs-panel: 13px`
- `--fs-body: 14.5px`
- `--fs-table: 13px`
- `--fs-chip: 11px`
- `--fs-small: 12px`

## 3) Paleta kolorów
### 3.1 Zmienne CSS
- Noir: `--bg #07070A`, `--bg2 #0C0D12`, `--ink #EDEBE6`, `--muted rgba(237,235,230,.72)`
- Filc: `--felt #0F3B2E`, `--felt2 #0A2A21`, `--felt-glow rgba(43,201,122,.18)`
- Złoto: `--gold #D4AF37`, `--gold2 #B78C2A`, `--gold-soft rgba(212,175,55,.18)`, `--gold-line rgba(212,175,55,.35)`
- Ruby: `--ruby #B11226`, `--ruby2 #E23A4B`, `--danger rgba(226,58,75,.95)`
- Neutralne: `--border rgba(255,255,255,.10)`, `--border2 rgba(255,255,255,.06)`, `--divider rgba(255,255,255,.08)`
- Neon: `--neon #2BE38B`, `--neon-soft rgba(43,227,139,.12)`
- Cienie: `--shadow 0 12px 34px rgba(0,0,0,.55)`, `--shadow-inset inset 0 0 0 1px rgba(255,255,255,.04)`, `--glow-gold 0 0 18px rgba(212,175,55,.22)`, `--glow-neon 0 0 18px rgba(43,227,139,.18)`
- Zaokrąglenia: `--radius-sm 10px`, `--radius-md 14px`, `--radius-lg 18px`

## 4) Tła i tekstury
- Body: gradient noir + delikatny spotlight + lekka ziarnistość (opcjonalnie pseudo-element z opacity ~.035).
- Panele: gradient `--felt2 → --felt`, border `--border` + złota „żyłka” w `::before`, cień `--shadow`.

## 5) Layout globalny
- Desktop: lewy panel 320–380px, prawa część 1fr.
- Topbar sticky: 64px, tytuł + akcje.
- Responsywność: <980px jedna kolumna, <560px tabele w cards, przyciski full width.
- Odstępy: `--gap-1 8px`, `--gap-2 12px`, `--gap-3 16px`, `--gap-4 24px`, `--gap-5 32px`.

## 6) Tabele
- Tło karty wyników, zebra wierszy, hover neon.
- Tokeny: `--table-bg`, `--table-head`, `--table-zebra`, `--table-hover`, `--table-selected`.
- Ramka: `border 1px solid var(--border)` + `box-shadow: var(--shadow-inset), var(--glow-gold)`.
- `th`: font Panel, 12px, uppercase, 0.10em, tło gradient, złota linia.
- `td`: font Tekst/Stawka, 10px 12px, lh 1.35.
- Wyrównania: nazwiska lewo, stolik środek, liczby prawo.

## 7) Przyciski
- Primary (złoty): gradient, `border var(--gold-line)`, tekst `rgba(237,235,230,.95)`, hover glow.
- Secondary (neon): tło `rgba(43,227,139,.14)`, border `rgba(43,227,139,.45)`, glow `--glow-neon`.
- Secondary (neon/filc): `rgba(43,227,139,.10)` + `--glow-neon`.
- Danger (ruby): `rgba(226,58,75,.12)` + jaśniejszy tekst.
- Zasady: font Panel, uppercase, `letter-spacing: 0.10em`, `border-radius var(--radius-sm)`, hover `translateY(-1px)`, active `brightness(1.08)`, disabled opacity .45.

## 7.1) Notatka o aktualizacji danych
- `.admin-data-hint`: małe pudełko informacyjne pod przyciskami admina.
- Tło `rgba(0,0,0,.25)`, obramowanie przerywane `1px dashed var(--border2)`, tekst `--muted`.
- Padding 12–14px, font `--fs-small`, `line-height 1.4`.

## 8) Formularze
- Tło `rgba(0,0,0,.35)`, border `--border`, tekst `--ink`.
- Focus: `border-color rgba(212,175,55,.55)`, `box-shadow` złoto + neon.
- Select: ten sam chrome, strzałka `rgba(237,235,230,.65)`, option `#0C0D12`.
- Checkbox/radio: `accent-color: var(--gold)`.
- Pole wiadomości admina: textarea z `min-height ~86px`, label uppercase `letter-spacing 0.12em`.

## 9) Placeholder „STRONA W BUDOWIE”
- Użytkownik widzi pełnoekranową kartę placeholdera (`.user-placeholder`) zamiast tabel.
- Układ:
  - **`.user-panel`**: górny pasek z etykietą widoku i przyciskiem przełączania.
  - **`.user-view-label`**: `--font-panel`, uppercase, `letter-spacing 0.24em`, kolor `--muted`.
  - **`.user-construction`**: duży napis w `--font-title`, złoty kolor `--gold`, `letter-spacing 0.18em`, `text-shadow: var(--glow-gold)`.
- Wysokość: `min-height` oparta o viewport (dla efektu „na całą stronę”).

## 10) Badge/chipy statusów
- Kształt: `border-radius: 999px`, obwódka 1px, półprzezroczyste tło, font Chip.
- Statusy: BUST → ruby, ITM → gold, ACTIVE → neon, PAUSED → neutral, RE-ENTRY → gold+neon.

## 11) Modale/toasty/tooltips
- Modal: overlay `rgba(0,0,0,.72)`, karta `linear-gradient` noir, border `--border`, złota linia w top, cień 0 20px 60px.
- Modal content: przewijalny blok, `white-space: pre-wrap`, font Tekst, tło `rgba(0,0,0,.35)`, border `--border2`.
- Icon button (zamknięcie): okrągły przycisk `999px`, padding 6–10px, font 18px, neon hover.
- Toasty: sukces neon, warning złoto, błąd ruby (bez pełnego red background).
- Tooltip: tło `rgba(0,0,0,.75)`, border `rgba(255,255,255,.12)`, delikatny glow złoty.

## 12) Ikony
- Minimalistyczne stroke, kolor domyślny `rgba(237,235,230,.75)`, aktywne `--gold`.

## 12.1) Android (WebView) — motyw i kolory
- Motyw aplikacji: `Theme.Karty` oparty o `Theme.Material3.DayNight.NoActionBar`.
- Kolory motywu Android:
  - Primary: `#C8A96A` (złoto).
  - OnPrimary: `#1B1712` (ciemny kontrast).
  - Background: `#12100E` (noir).
  - OnBackground: `#F5F1E6` (jasny tekst).
- Ikona powiadomień: wektor `ic_notification.xml` w kolorze złotym `#C8A96A`.

## 13) Dostępność
- Kontrast tekstu min ~4.5:1.
- Widoczny focus ring (złoto + neon).
- Klikalne elementy min 40px na mobile.

## 14) Moduły aplikacji
- Dashboard, Gracze, Stoliki, Blind structure, Wypłaty, Log zdarzeń.

## 15) Gotowe nazwy tokenów
- `--font-title`, `--font-subtitle`, `--font-panel`, `--font-text`, `--font-nazwisko`, `--font-stolik`, `--font-stawka`, `--font-chip`, `--font-log`.
