# Detale layoutu (casino vibe)

## 1) Fonty i rendering
- Fonty: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`.
- Rendering: antyaliasing + precyzyjne renderowanie tekstu.

## 2) Kolory
- Tło noir: ciemne gradienty.
- Tekst: jasny (`--ink`) + przygaszony (`--muted`).
- Akcent złoty: aktywne elementy, obramowania, linki i nagłówki.
- Akcent zielony: przyciski drugorzędne.
- Czerwony: akcje destrukcyjne (`Usuń`).

## 3) Panel Administratora — aktualny układ
- Zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turnieje`, `Gry admina`, `Gry użytkowników`, `Gry do potwierdzenia`.
- Usunięta osobna zakładka `Statystyki`.
- Sekcja `Statystyki` została przeniesiona do wnętrza zakładki `Gry` (dolna tabela).

## 4) Zakładka Gry — szczegóły wizualne
### 4.1 Layout
- `.admin-games-layout`: dwie kolumny (`220px` + `1fr`).
- Lewa kolumna: automatyczna lista lat (bez osobnych przycisków „Dodaj rok/Usuń rok”).
- Prawa kolumna: status + sekcje tabel.

### 4.2 Sekcja „Tabele Gier”
- Nagłówek z tytułem i przyciskiem `Dodaj`.
- Tabela z kolumnami:
  - `Rodzaj Gry`
  - `Data`
  - `Nazwa`
  - akcja usunięcia
- W kolumnie nazwy zastosowano `.admin-games-name-control`:
  - `display:flex`,
  - `gap:8px`,
  - wyrównanie pionowe do środka,
  - pole nazwy ma min. szerokość `200px`.

### 4.3 Sekcje „Podsumowanie gry ...”
- Kontener: `.admin-games-summaries` (grid, odstęp 12px).
- Pojedyncza karta podsumowania: `.admin-game-summary`:
  - wewnętrzny padding,
  - subtelne tło noir,
  - cienka ramka,
  - zaokrąglenie jak inne karty panelu.

### 4.4 Modal „Szczegóły gry”
- Tabela modalna ma edytowalne pola i checkbox `Mistrzostwo`.
- Pod tabelą widoczny przycisk `Dodaj` do nowego wiersza.
- Przycisk `Usuń` po prawej stronie każdego wiersza.

## 5) Linki i interakcje
- `.admin-games-link` (linkopodobny przycisk) zachowuje złoty kolor.
- Hover bez podnoszenia elementu — tylko podkreślenie.

## 6) Responsywność
- Przy mniejszych szerokościach layout zakładki Gry przechodzi do jednej kolumny.
- Tabele pozostają w poziomym scrollu (`.admin-table-scroll`) dla czytelności.


## 7) Zakładka „Gracze” — kolumna „Aplikacja”
- W tabeli graczy dodano nową, pierwszą kolumnę: `Aplikacja` (po lewej stronie przed `Nazwa`).
- Komórka kolumny używa klasy `.players-app-cell`:
  - stała szerokość `88px`,
  - wyrównanie zawartości do środka (`text-align: center`).
- Checkbox w kolumnie używa klasy `.players-app-checkbox`:
  - rozmiar `18px x 18px`,
  - kolor akcentu `accent-color: var(--gold)`,
  - kursor `pointer` dla czytelnej interakcji.
- Zmiana zachowuje istniejący styl noir/gold i nie modyfikuje pozostałych kolumn (`Nazwa`, `PIN`, `Uprawnienia`, `Usuń`).



## 8) Zakładka „Regulamin” — detale wizualne
- Panel administratora:
  - nowy kontener `.admin-rules` oparty o ten sam język wizualny co `.admin-message` (ciemne tło, subtelna ramka, zaokrąglenia).
  - pole `textarea` ma zwiększoną wysokość minimalną (`170px`), aby wygodnie edytować dłuższy tekst zasad.
  - sekcja `.admin-rules-actions` zawiera przycisk akcji `Zapisz` (`.primary`) oraz komunikat statusu zapisu.
- Widok użytkownika:
  - zakładka `Regulamin` używa wariantu `.latest-rules` z takim samym typograficznym stylem jak `Aktualności`, ale z większym polem na treść.
- Mobile (`max-width: 720px`):
  - `.admin-rules-actions` zachowuje responsywne pozycjonowanie układu „przycisk + status” (flex z zawijaniem elementów).

## 9) Zakładki „Czat” — detale wizualne
### 9.1 Czat w panelu administratora
- Dodana nowa karta panelu admina: `Czat`.
- Kontener `.admin-chat`:
  - tło noir (`rgba(0,0,0,0.32)`),
  - cienka ramka `var(--border2)`,
  - zaokrąglenie `var(--radius-md)`,
  - układ `grid` ze stałymi odstępami.
- Lista wiadomości `.admin-chat-list`:
  - przewijana pionowo (`max-height: 440px`, `overflow: auto`),
  - każdy wpis w karcie `.admin-chat-item` z subtelnym obramowaniem.
- Metadata wpisu `.admin-chat-meta` używa mniejszego fontu (`--fs-small`) i koloru przygaszonego (`--muted`).
- Przycisk usuwania pojedynczej wiadomości `.admin-chat-delete` używa stylu `danger` (czerwony akcent destrukcyjny).

### 9.2 Czat w strefie gracza
- Dodana nowa karta użytkownika: `Czat`.
- Widok jest dwuetapowy:
  1. `.pin-gate` (bramka PIN),
  2. `.chat-content` (lista wiadomości + formularz), aktywowany klasą `.is-visible`.
- Lista wiadomości `.chat-messages`:
  - przewijana (`max-height: 420px`),
  - każdy wpis jako `.chat-message-item` z nagłówkiem autora i czasu (`.chat-message-header`, `.chat-message-date`).
- Formularz `.chat-form`:
  - etykieta uppercase w stylu panelowym,
  - `textarea` z tym samym motywem focus co reszta aplikacji (gold/neon glow),
  - akcje w `.chat-form-actions`.
- Pusty stan listy pokazuje tekst z klasą `.chat-empty`.

### 9.3 Responsywność czatu
- Dla `max-width: 720px` sekcja `.chat-form-actions` przechodzi na układ kolumnowy,
- dzięki temu przycisk wysyłki i status nie nachodzą na siebie na wąskich ekranach.
## 10) Modale — uproszczenie akcji zamknięcia
- W oknach modalnych `Instrukcja obsługi`, `Uprawnienia gracza` i `Szczegóły gry` usunięto dolny przycisk tekstowy `Zamknij`.
- Pozostawiono tylko ikonę `×` (`.icon-button`) w prawym górnym rogu nagłówka modala.
- Efekt wizualny: mniej elementów akcji w stopce i prostsza hierarchia interakcji (jeden główny punkt zamknięcia okna).


## 11) Potwierdzenia obecności — detale layoutu

### 11.1 Nowe elementy nawigacji
- Dodana karta panelu admina: `Gry do potwierdzenia`.
- Dodana karta strefy gracza: `Gry do potwierdzenia`.
- Obie karty używają istniejącego stylu pigułki (`.admin-panel-tab`, `.tab-button`) z aktywnym wariantem gold.

### 11.2 Zakładka „Gry” (admin) — nowa kolumna
- W tabeli `Tabele Gier` dodano kolumnę `CzyZamknięta` z natywnym checkboxem.
- Checkbox nie ma osobnego przycisku zapisu — zapis jest natychmiastowy po zmianie.

### 11.3 Widok potwierdzeń gracza
- Kontener `.confirmations-content` działa jak `chat-content`:
  - domyślnie `display: none`,
  - po autoryzacji PIN aktywowany przez `.is-visible`.
- Pasek akcji `.confirmations-toolbar` zawiera:
  - przycisk `Odśwież`,
  - tekst statusu.
- Tabela `.confirmations-table` ma minimalną szerokość `760px`.

### 11.4 Widok potwierdzeń admina
- Sekcja `.admin-confirmations`:
  - tło noir (`rgba(0,0,0,0.32)`),
  - cienka ramka `var(--border2)`,
  - zaokrąglenie `var(--radius-md)`.
- Lista gier `.admin-confirmations-list` renderuje karty `.admin-confirmation-game`.
- Każda karta gry ma nagłówek (`h4`) i metadane (`.admin-confirmation-game-meta`) w kolorze `--muted`.

### 11.5 Status potwierdzenia (złote podświetlenie)
- Klasa `.confirmed-row`:
  - tło: `rgba(212, 175, 55, 0.2)`,
  - wewnętrzna ramka: `inset 0 0 0 1px var(--gold-line)`.
- Ta sama klasa jest używana w tabeli użytkownika i administratora dla spójnej semantyki wizualnej.


## 12) Zakładka „Gry użytkowników” — detale layoutu
- W pasku zakładek strefy gracza dodano nową pigułkę: **Gry użytkowników** (`.tab-button`), spójną wizualnie z pozostałymi kartami.
- Wewnątrz panelu zastosowano istniejący komponent bramki `.pin-gate`:
  - karta PIN (`.pin-card`),
  - opis (`.pin-title`),
  - pole + przycisk w układzie `.pin-inputs`,
  - status (`.status-text`).
- Zawartość po poprawnej autoryzacji korzysta z tego samego kontenera co „Najbliższa gra” (`.next-game-content.is-visible`).
- Główny komunikat „Strona w budowie” używa istniejącego stylu `.user-construction`:
  - font tytułowy (`var(--font-title)`),
  - duży responsywny rozmiar (`clamp(36px, 7vw, 96px)`),
  - uppercase + rozszerzone kerning (`letter-spacing: 0.18em`),
  - kolor złoty (`var(--gold)`) i poświata (`var(--glow-gold)`).

## 13) Zakładka „Gry użytkowników” — panel administratora
- Do paska `.admin-panel-tabs` dodano nową pigułkę **Gry użytkowników** (`.admin-panel-tab`) pomiędzy „Gry admina” i „Gry do potwierdzenia”.
- Wnętrze karty oparto o nową klasę `.admin-user-games`, która używa tego samego wzorca sekcji co inne moduły admina:
  - ciemne tło `rgba(0, 0, 0, 0.32)`,
  - ramka `1px solid var(--border2)`,
  - zaokrąglenie `var(--radius-md)`,
  - wewnętrzny odstęp `16px`,
  - układ `grid` z odstępem `var(--gap-2)`.
- Komunikat „Strona w budowie” pozostaje w stylu `.user-construction` (duży złoty napis), co utrzymuje wspólny język wizualny placeholderów w aplikacji.


## 14) Layout „Gry użytkowników” po wdrożeniu CRUD

### 14.1 Zakładka admina: `adminUserGamesTab`
- Placeholder został zastąpiony pełnym układem `admin-games-layout`:
  - lewa kolumna: panel lat (`.admin-games-sidebar`, `.admin-games-years-list`),
  - prawa kolumna: tabela gier (`.admin-games-content`, `.admin-games-section`, `.admin-data-table`).
- Użyto tych samych komponentów wizualnych co w „Gry admina”, aby zachować spójność interfejsu.

### 14.2 Zakładka gracza: `userGamesTab`
- Wprowadzono osobny kontener `.user-games-content`:
  - domyślnie `display: none`,
  - po autoryzacji `display: grid` przez `.is-visible`.
- Powód: wcześniejszy kontener `.next-game-content` miał `place-items: center`, co było właściwe dla placeholdera, ale nie dla tabelarycznego widoku CRUD.

### 14.3 Modale szczegółów gier użytkowników
- Dodano dwa bliźniacze modale (admin/gracz), aby uniknąć konfliktów zdarzeń i zachować pełną niezależność interakcji:
  - `#userGameDetailsModal`,
  - `#playerUserGameDetailsModal`.
- Oba modale dziedziczą istniejący styl kart modalnych (`.modal-overlay`, `.modal-card`, `.modal-header`, `.modal-body`, `.admin-table-scroll`, `.admin-data-table`).

## 15) „Gry admina” — tabela rozszerzonych statystyk i panel „Ranking”

### 15.1 Układ 3-kolumnowy w `adminGamesTab`
- Dla `#adminGamesTab .admin-games-layout` ustawiono trzy kolumny:
  1. **Lata** (lewy sidebar),
  2. **Treść** (środek),
  3. **Ranking** (prawy sidebar).
- Szerokości: `220px | minmax(0, 1fr) | 260px`.
- W widoku mobilnym (`max-width: 720px`) układ przechodzi do jednej kolumny.

### 15.2 Tabela szczegółowych statystyk graczy
- Dodano klasę `.admin-games-players-stats-table` z `min-width: 2300px` dla komfortowego poziomego scrolla.
- Pola edycyjne wewnątrz tej tabeli (`input.admin-input`) mają `min-width: 84px`.
- Kolumny obejmują metryki obliczalne i pola ręczne (`Waga1..Waga7`, `Punkty`, `Wynik`).

### 15.3 Panel „Ranking”
- Prawy panel używa `.admin-games-ranking-sidebar` i dziedziczy styl bazowy `.admin-games-sidebar`.
- Tabela rankingu `.admin-games-ranking-table` renderuje 3 kolumny: `Miejsce`, `Gracz`, `Wynik`.
- Kolorowanie wierszy:
  - `.admin-games-ranking-row-gold` — miejsca 1–8,
  - `.admin-games-ranking-row-green` — miejsca 9–17,
  - `.admin-games-ranking-row-red` — miejsca 18+.
- Kolory są półtransparentne i utrzymują ciemny motyw aplikacji (noir + akcenty gold/green/red).

## 16) Panel „Lata” (Gry admina + Gry użytkowników) — aktualizacja layoutu

### 16.1 Wyrównanie do górnej krawędzi
- `.admin-games-sidebar` ma `align-content: start`, więc lista lat zawsze zaczyna się od góry panelu.
- Dotyczy wszystkich widoków używających `admin-games-layout` (w tym `#adminGamesTab`, `#adminUserGamesTab` i część gracza `#userGamesTab`).

### 16.2 Stała wysokość przycisków lat
- Wprowadzono wspólną zmienną: `--admin-games-panel-item-height: 41px`.
- `.admin-games-years-list` używa `grid-auto-rows: var(--admin-games-panel-item-height)`.
- `.admin-games-year-button` ma `height: 100%`, więc każdy przycisk dokładnie wypełnia swój stały wiersz.

### 16.3 Spójność z panelem „Ranking”
- Ta sama wysokość jest użyta w panelu rankingu:
  - `.admin-games-ranking-table th, .admin-games-ranking-table td { height: var(--admin-games-panel-item-height); }`.
- Dzięki temu pojedynczy przycisk roku i pojedynczy wiersz rankingu mają jednakową wysokość wizualną.

## 17) Ostrzeżenie wizualne w „Podsumowanie gry” (Gry admina + Gry użytkowników)

### 17.1 Położenie komunikatu
W sekcji `.admin-game-summary` komunikat błędu sum jest renderowany:
1. bezpośrednio pod nagłówkiem `h3` („Podsumowanie gry ...”),
2. nad wierszem tekstowym „Pula: ...”.

### 17.2 Styl komunikatu
Komunikat używa klas:
- bazowej: `.status-text`,
- rozszerzającej: `.status-text-danger`.

Definicja `.status-text-danger`:
- `color: var(--danger);`
- `font-weight: 600;`

Źródło koloru:
- token `--danger` (paleta czerwieni aplikacji, zgodna z przyciskami `.danger`).

### 17.3 Spójność między zakładkami
Ten sam styl i kolejność elementów obowiązuje w:
- `#adminGamesSummaries` (Gry admina),
- `#adminUserGamesSummaries` (Gry użytkowników — widok admina),
- `#userGamesSummaries` (Gry użytkowników — widok gracza).

## 18) „Gry admina” — wizualna zmiana nagłówków Waga1..Waga7

### 18.1 Nagłówki kolumn jako przyciski
W tabeli `.admin-games-players-stats-table` nagłówki `Waga1..Waga7` są renderowane jako przyciski `.admin-weight-bulk-button` umieszczone wewnątrz `th`.

Parametry stylu `.admin-weight-bulk-button` (wariant wizualny zbliżony do przycisków `secondary`, np. „Odśwież” i „Instrukcja”):
- layout: `display: inline-flex`, `align-items: center`, `justify-content: center`,
- rozmiar: `width: 100%`, `min-height: 34px`, `padding: 6px 10px`,
- obramowanie i tło: `border: 1px solid rgba(43, 227, 139, 0.45)`, `border-radius: var(--radius-sm)`, `background: rgba(43, 227, 139, 0.14)`,
- typografia: `font-family: var(--font-panel)`, `font-size: 11px`, `font-weight: 600`, `letter-spacing: 0.1em`, `text-transform: uppercase`,
- kolor tekstu: `rgba(237, 235, 230, 0.92)`,
- światło: `box-shadow: var(--glow-neon)`,
- interaktywność: `cursor: pointer`, `transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease`.

### 18.2 Stan hover/focus
Dla `.admin-weight-bulk-button:hover, .admin-weight-bulk-button:focus-visible`:
- przycisk unosi się o `-1px` (`transform: translateY(-1px)`),
- obrys wzmacnia się do `border-color: rgba(43, 227, 139, 0.7)`,
- cień przechodzi na `box-shadow: 0 0 0 2px rgba(43, 227, 139, 0.22), var(--glow-neon)`.

Dodatkowo dla `:focus-visible` ustawiono `outline: none`, aby styl fokusu był kontrolowany przez neonowy obrys.

Efekt UX: użytkownik od razu widzi, że nagłówek jest klikalnym przyciskiem i służy do masowej zmiany kolumny.
