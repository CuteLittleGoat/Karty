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
- Noir + złoto + aksamitna zieleń + delikatny neon.
- Ciemne tło jak sala kasyna, złote akcenty jak mosiężne listwy, zielone „filcowe” panele.
- Glow subtelny, bez agresywnego cyberpunku.

## 2) Fonty i typografia
### 2.1 Zasady ogólne
- Trzy warstwy typografii: nagłówki premium, tekst użytkowy, etykiety/panele.
- Tytuły: `letter-spacing: 0.06–0.12em`, uppercase.

### 2.2 Stosy fontów (tokeny)
- **Tytuł:** `"Cinzel", "Trajan Pro", "Times New Roman", serif` (600–700, uppercase, 0.12em, lh 1.05)
- **Podtytuł:** `"Cormorant Garamond", "Georgia", serif` (600, 0.06em)
- **Panel:** `"Rajdhani", "Segoe UI", "Noto Sans", sans-serif` (600, uppercase, 0.08–0.12em)
- **Tekst:** `"Inter", "Segoe UI", "Noto Sans", Arial, sans-serif` (400–600, lh 1.55)

### 2.3 Skala rozmiarów
- `--fs-title: clamp(26px, 3.2vw, 40px)`
- `--fs-subtitle: clamp(16px, 1.8vw, 22px)`
- `--fs-panel: 13px`
- `--fs-body: 14.5px`
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
- Body: gradient noir + delikatny spotlight.
- Panele: gradient `--felt2 → --felt`, border `--border` + złota „żyłka” w `::before`, cień `--shadow`.

## 5) Layout globalny
- `.page`: max-width 1200px, padding 40px/24px.
- `.page-header`: układ flex, intro admina po lewej, przycisk **Instrukcja** po prawej (`.admin-toolbar`).
- `.grid`: responsywna siatka kart.
- Nagłówek admina (`.header-intro`) zawiera eyebrow z tekstem „TO NIE JEST nielegalny poker” oraz tytuł „TO NIE JEST nielegalne kasyno”.

## 6) Przyciski
- `button`: uppercase, `--font-panel`, `letter-spacing: 0.10em`, `border-radius: var(--radius-sm)`, hover `translateY(-1px)`.
- **Primary (złoty):** gradient, `border var(--gold-line)`, `--glow-gold`.
- **Secondary (neon):** tło `rgba(43,227,139,.14)`, `border rgba(43,227,139,.45)`, `--glow-neon`.
- **Danger (czerwony/Usuń):** tło `rgba(226,58,75,.18)`, `border rgba(226,58,75,.60)`, glow `0 0 18px rgba(226,58,75,.25)`.

## 7) Formularze
- Tło `rgba(0,0,0,.35)`, border `--border`, tekst `--ink`.
- Focus: `border-color rgba(212,175,55,.55)`, `box-shadow` złoto + neon.
- Pole wiadomości admina: textarea z `min-height ~86px`, label uppercase `letter-spacing 0.12em`.
- Pole „Najnowsze” (readonly) w zakładce Aktualności: textarea bez resize, `min-height ~86px`.
- Pole PIN (admin i użytkownik): input `max-width ~180px`, `letter-spacing 0.08em`.

## 8) Strefa gracza, zakładki i PIN
- **`.next-game-card`**: karta na pełną szerokość siatki.
- **`.user-panel`**: pasek z etykietą „Strefa gracza” i zakładkami.
- **`.user-tabs`**: pill buttons, wyrównane do prawej (`margin-left: auto`).
- **`.tab-button`**: obrys `--border2`, aktywny stan `.is-active` podbija złoty glow.
- **PIN gate**:
  - **`.pin-gate`**: ramka przerywana `--gold-line`, tło noir `rgba(0,0,0,.30)`.
  - **`.pin-card`**: pionowy układ tekstu i formularza.
- **Treści „Najbliższa gra”**:
  - `#nextGameContent` po poprawnym PIN-ie pokazuje wyśrodkowany napis **„Strona w budowie”**.
  - `.user-construction` korzysta z fontu tytułowego i złotego glow.

## 9) Panel administratora
- `.admin-message` to karta pomocnicza z tłem noir i obramowaniem.
- `.admin-pin` to analogiczna karta dla PIN-u.
- `.admin-pin-actions` układa przyciski i status w jednym wierszu.

## 10) Stoły administratora
- `.admin-tables` zajmuje pełną szerokość siatki i pokazuje listę stołów jedna pod drugą.
- `.admin-tables-header` układa tytuł i przycisk **Dodaj** w jednej linii.
- `.admin-table-card` ma tło noir (`rgba(0,0,0,.30)`), obramowanie `--border2` i odstępy `16px`.
- `.admin-input` to wspólny styl pól w tabelach: tło `rgba(0,0,0,.35)`, obramowanie `--border`, złoty fokus + neon.
- `.admin-data-table` to tabela z nagłówkami uppercase (`--font-panel`, `letter-spacing 0.12em`) i separatorami `--border2`.
- `.admin-table-scroll` zapewnia przewijanie poziome tabel na mniejszych ekranach.
- `.admin-summary` to blok „Podsumowanie” z tym samym noir tłem i zaokrągleniem `--radius-md`.

## 11) Modal instrukcji
- Overlay `rgba(0,0,0,.72)`, karta `linear-gradient` noir.
- `.modal-content` przewijalny, `white-space: pre-wrap`.
- `.icon-button` to okrągły przycisk „×”.

## 12) Responsywność
- `<720px` przyciski w sekcji wiadomości układają się w kolumnie.
- `<720px` modal przechodzi w układ jednokolumnowy.
- `<520px` modal ma mniejszy padding.

## 13) Dostępność
- Kontrast tekstu min ~4.5:1.
- Widoczny focus ring (złoto + neon).
- Klikalne elementy min 40px na mobile.
