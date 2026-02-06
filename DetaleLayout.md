0) Wymóg krytyczny: polskie znaki i kodowanie

Musi działać zawsze, bez wyjątków:

Pliki HTML/CSS/JS zapisane w UTF-8.

W <head> zawsze:

<meta charset="utf-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

Fonty muszą mieć Latin Extended (polskie diakrytyki). W praktyce:

dla Google Fonts: używaj rodzin, które mają latin-ext,

dla lokalnych: sprawdź, że font zawiera polskie znaki.

W CSS ustaw:

text-rendering: geometricPrecision;

-webkit-font-smoothing: antialiased;

font-kerning: normal;

Unikaj fontów “display” bez latin-ext jako jedynych — zawsze dawaj fallback.

1) Kierunek artystyczny (casino vibe)

Hasła stylu:

“Noir + złoto + aksamitna zieleń + neon”

ciemne tło jak sala kasyna, złote akcenty jak mosiężne listwy, zielone “filcowe” panele jak stół do gry

delikatny glow jak od neonów, ale bez “cyberpunkowego” przesytu

2) Fonty i typografia
2.1 Zasady ogólne

UI ma trzy warstwy typografii:

Nagłówki eleganckie (kasyno, złoto, “premium”)

Tekst użytkowy (czytelny, nowoczesny)

Dane tabelaryczne (monospace lub “tabular numbers”)

Wszędzie preferuj cyfry równej szerokości:

font-variant-numeric: tabular-nums;

Dla tabel i stawek: letter-spacing: 0.02em;

Dla tytułów: letter-spacing: 0.06–0.12em; (w zależności od fontu)

2.2 Stosy fontów (warianty nazwane jak prosiłeś)

Poniżej więcej wariantów niż w przykładzie. Możesz użyć ich jako tokenów/klas.

A) Tytuł (główny header aplikacji)

"Tytuł": "Cinzel", "Trajan Pro", "Times New Roman", serif

font-weight: 600–700

text-transform: uppercase

letter-spacing: 0.12em

line-height: 1.05

B) Podtytuł (sekcje: “Stoliki”, “Gracze”, “Wypłaty”)

"Podtytuł": "Cormorant Garamond", "Georgia", serif

font-weight: 600

letter-spacing: 0.06em

line-height: 1.15

C) Panel (nagłówki kart, etykiety pól)

"Panel": "Rajdhani", "Segoe UI", "Roboto", "Noto Sans", sans-serif

font-weight: 600

text-transform: uppercase

letter-spacing: 0.08em

D) Tekst bazowy (opisy, komunikaty, UI)

"Tekst": "Inter", "Segoe UI", "Roboto", "Noto Sans", "Arial", sans-serif

font-weight: 400–500

letter-spacing: 0.01em

line-height: 1.55

E) Nazwisko (kolumna gracza / listy)

"Nazwisko": "IBM Plex Sans", "Inter", "Segoe UI", "Noto Sans", sans-serif

font-weight: 600

letter-spacing: 0.02em

F) Stolik (oznaczenia typu “Stolik A”, “Stolik 3”)

"Stolik": "Oswald", "Rajdhani", "Segoe UI", sans-serif

font-weight: 600–700

text-transform: uppercase

letter-spacing: 0.10em

G) Stawka (blindsy, buy-in, stack, payout)

"Stawka": "Roboto Mono", "JetBrains Mono", "Consolas", "Courier New", monospace

font-weight: 600

font-variant-numeric: tabular-nums;

letter-spacing: 0.02em

H) Chip (małe badge: “Re-entry”, “BUST”, “ITM”)

"Chip": "Sora", "Inter", "Segoe UI", sans-serif

font-weight: 700

text-transform: uppercase

letter-spacing: 0.10em

font-size: 11–12px

I) Log / Konsola (opcjonalnie: debug, historia zdarzeń)

"Log": "Fira Code", "JetBrains Mono", "Consolas", monospace

font-weight: 400–500

font-size: 12–13px

2.3 Skala rozmiarów (tokeny)

--fs-title: clamp(26px, 3.2vw, 40px)

--fs-subtitle: clamp(16px, 1.8vw, 22px)

--fs-panel: 13px

--fs-body: 14.5px

--fs-table: 13px

--fs-chip: 11px

--fs-small: 12px

3) Paleta kolorów (kasyno)
3.1 Zmienne CSS (źródło prawdy)

Bazowe tło / noir:

--bg: #07070A (prawie czarny)

--bg2: #0C0D12 (drugi ton)

--ink: #EDEBE6 (główna biel z lekką kremową nutą)

--muted: rgba(237,235,230,.72) (opis/pomocniczy)

Zieleń stołu (filc):

--felt: #0F3B2E

--felt2: #0A2A21

--felt-glow: rgba(43, 201, 122, 0.18)

Złoto / mosiądz:

--gold: #D4AF37

--gold2: #B78C2A

--gold-soft: rgba(212,175,55,.18)

--gold-line: rgba(212,175,55,.35)

Czerwienie kasynowe (ostrzeżenia / “bust” / delete):

--ruby: #B11226

--ruby2: #E23A4B

--danger: rgba(226,58,75,.95)

Neutralne obwódki i podziały:

--border: rgba(255,255,255,.10)

--border2: rgba(255,255,255,.06)

--divider: rgba(255,255,255,.08)

Neon/akcent (bardzo oszczędnie, jako “casino LED”):

--neon: #2BE38B

--neon-soft: rgba(43,227,139,.12)

Cienie i glowy:

--shadow: 0 12px 34px rgba(0,0,0,.55)

--shadow-inset: inset 0 0 0 1px rgba(255,255,255,.04)

--glow-gold: 0 0 18px rgba(212,175,55,.22)

--glow-neon: 0 0 18px rgba(43,227,139,.18)

Zaokrąglenia i siatka:

--radius-sm: 10px

--radius-md: 14px

--radius-lg: 18px

4) Tła i tekstury (bez obrazków, czyste CSS)
4.1 Tło aplikacji

body ma wielowarstwowe tło:

delikatny gradient noir,

subtelny “spotlight” jak w sali kasyna,

bardzo lekka ziarnistość (opcjonalnie: pseudo-element z opacity: .035).

Wskazówka wizualna:

spotlight w okolicach nagłówka,

drugi spotlight na panelach z tabelami.

4.2 Panele jak filc + złota ramka

Karty/panele (.card, .panel) powinny mieć:

tło: gradient --felt2 → --felt (bardzo subtelny)

obramowanie: 1px solid --border + dodatkowa złota “żyłka” w ::before

cień: --shadow

backdrop-filter: blur(6px) tylko jeśli tło jest półprzezroczyste

5) Layout globalny aplikacji
5.1 Grid główny (desktop)

app-shell:

lewy panel: 320–380px (nawigacja / turniej / ustawienia)

prawa część: 1fr (tabele, stoliki, gracze)

Górny pasek (topbar) sticky:

wysokość: 64px

tytuł + szybkie akcje (Start rundy / Dodaj gracza / Eksport)

5.2 Responsywność

< 980px: układ przechodzi na jedną kolumnę:

topbar zostaje sticky

panele idą pionowo (accordion lub karty)

< 560px:

tabele przechodzą w “cards list” (opcjonalnie)

przyciski pełnej szerokości

5.3 Odstępy (spójne rhythm)

--gap-1: 8px

--gap-2: 12px

--gap-3: 16px

--gap-4: 24px

--gap-5: 32px

6) Tabele (kluczowy element turniejowy)
6.1 Ogólny styl tabel

Tabela ma wyglądać jak “karta wyników” z kasyna:

nagłówek z ciemnym gradientem + złota linia,

zebra wierszy bardzo subtelna,

hover jak delikatne podświetlenie “neonem”.

Tokeny:

--table-bg: rgba(0,0,0,.35)

--table-head: rgba(0,0,0,.55)

--table-zebra: rgba(255,255,255,.03)

--table-hover: rgba(43,227,139,.08)

--table-selected: rgba(212,175,55,.10)

6.2 Ramki i linie

Zewnętrzna ramka tabeli:

border: 1px solid var(--border)

dodatkowy akcent: box-shadow: var(--shadow-inset), var(--glow-gold)

Linie między komórkami:

border-bottom: 1px solid var(--divider)

pionowe separatory tylko tam gdzie trzeba (żeby nie było “kratki” jak Excel)

6.3 Nagłówki tabeli

th:

font: "Panel"

font-size: 12px

uppercase, letter-spacing: 0.10em

kolor: rgba(237,235,230,.92)

tło: linear-gradient(180deg, rgba(0,0,0,.70), rgba(0,0,0,.35))

dolna złota linia: border-bottom: 1px solid var(--gold-line)

6.4 Komórki

td:

font: "Tekst" (dla nazw) lub "Stawka" (dla liczb)

font-size: var(--fs-table)

padding: 10px 12px

line-height: 1.35

color: var(--ink)

6.5 Wyrównania (konsekwencja)

Nazwy graczy: lewo

Stolik / Seat: środek

Stack / Buy-in / Blindsy / Payout: prawo (tabular nums)

Statusy (BUST/ITM/RE-ENTRY): środek jako chip/badge

6.6 Sortowanie / filtry / wyszukiwarka

Ikony sortowania: małe trójkąty w kolorze --gold-soft

Aktywna kolumna sort: podkreślona złotą linią

Pole wyszukiwania nad tabelą:

tło: rgba(0,0,0,.35)

border: 1px solid var(--border)

focus: box-shadow: 0 0 0 2px var(--gold-soft), var(--glow-neon)

7) Przyciski (kasyno: złoto + neon)
7.1 Typy przycisków

Primary (złoty) — najważniejsze akcje

tło: linear-gradient(180deg, rgba(212,175,55,.22), rgba(212,175,55,.10))

border: 1px solid var(--gold-line)

tekst: rgba(237,235,230,.95)

hover: mocniejszy glow złoty

Secondary (filc/neon) — akcje drugorzędne

tło: rgba(43,227,139,.10)

border: 1px solid rgba(43,227,139,.24)

hover: rgba(43,227,139,.14) + --glow-neon

Danger (ruby) — usuwanie/reset

tło: rgba(226,58,75,.12)

border: 1px solid rgba(226,58,75,.30)

tekst: #ffd6da

hover: rgba(226,58,75,.18)

7.2 Wspólne zasady

font: "Panel" (uppercase)

letter-spacing: 0.10em

border-radius: var(--radius-sm)

animacja:

hover: transform: translateY(-1px)

active: transform: translateY(0px) + filter: brightness(1.08)

disabled:

opacity: .45

brak glowa, kursor not-allowed

8) Formularze (input/select/textarea)
8.1 Pola tekstowe

tło: rgba(0,0,0,.35)

border: 1px solid var(--border)

tekst: var(--ink)

placeholder: rgba(237,235,230,.45)

focus:

border-color: rgba(212,175,55,.55)

box-shadow: 0 0 0 2px rgba(212,175,55,.18), 0 0 18px rgba(43,227,139,.10)

8.2 Select (dropdown)

identyczny “chrome” jak input

strzałka:

delikatna, w kolorze rgba(237,235,230,.65)

option:

tło: #0C0D12

tekst: var(--ink)

Dla polskich znaków: select musi wspierać UTF-8 (standardowo tak, ale font musi mieć diakrytyki)

8.3 Checkbox / radio

accent-color: var(--gold) (checkboxy jak złote żetony)

opisy w --muted

hover wiersza: background: rgba(255,255,255,.03)

9) Badge / chipy statusów (kluczowe dla turnieju)

Forma jak żetony / plakietki:

kształt: border-radius: 999px

obwódka: 1px solid zależnie od typu

tło: półprzezroczyste

font: "Chip"

Proponowane statusy:

BUST → ruby

ITM → złoto

ACTIVE → neon

PAUSED → neutral (szaro-krem)

RE-ENTRY → złoto+neon (mieszany akcent)

10) Modale, powiadomienia, tooltips
10.1 Modal

overlay: rgba(0,0,0,.72)

karta modala:

tło: linear-gradient(180deg, rgba(12,13,18,.96), rgba(7,7,10,.96))

border: 1px solid var(--border)

dodatkowa złota linia w top: 1px solid var(--gold-line)

cień: 0 20px 60px rgba(0,0,0,.65)

10.2 Toast / alerty

sukces: neon

warning: złoto

błąd: ruby

tekst zawsze czytelny (kontrast!), bez jaskrawego “full red background”

10.3 Tooltip

tło: rgba(0,0,0,.75)

border: 1px solid rgba(255,255,255,.12)

mały cień + delikatny glow złoty

11) Ikony i symbole (opcjonalnie)

Minimalistyczne, jednolite stroke

Kolor domyślny: rgba(237,235,230,.75)

Aktywne: --gold

Zakazane: zbyt “kreskówkowe” ikonki 3D — psują premium vibe

12) Zasady dostępności (ważne przy ciemnym UI)

Kontrast tekstu do tła:

tekst bazowy: minimum ~4.5:1 (praktycznie: nie schodź zbyt nisko z jasnością)

Focus musi być widoczny:

wyraźny ring (złoto + miękki neon)

Klikalne elementy:

min 40px wysokości na mobile

13) Sugerowane moduły aplikacji (spójny język wizualny)

Dashboard turnieju (Tytuł + Podtytuł + szybkie akcje)

Gracze (tabela: nazwisko, stack, status, re-entry)

Stoliki (siatka kart: “Stolik A”, seats, przeniesienia)

Blind structure (czytelna tabela: poziom, SB/BB, ante, czas)

Wypłaty (payout table, ITM highlight złotem)

Log zdarzeń (opcjonalnie w stylu “krupier zapisał”)

14) Gotowe nazwy tokenów (żebyś mógł to szybko wdrożyć)

Font tokens:

--font-title: "Cinzel", "Trajan Pro", "Times New Roman", serif;

--font-subtitle: "Cormorant Garamond", "Georgia", serif;

--font-panel: "Rajdhani", "Segoe UI", "Noto Sans", sans-serif;

--font-text: "Inter", "Segoe UI", "Noto Sans", Arial, sans-serif;

--font-nazwisko: "IBM Plex Sans", "Inter", "Segoe UI", sans-serif;

--font-stolik: "Oswald", "Rajdhani", "Segoe UI", sans-serif;

--font-stawka: "Roboto Mono", "JetBrains Mono", Consolas, monospace;

--font-chip: "Sora", "Inter", "Segoe UI", sans-serif;

--font-log: "Fira Code", "JetBrains Mono", Consolas, monospace;
