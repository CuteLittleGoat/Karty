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
- Zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Gry admina`, `Gry użytkowników`, `Gry do potwierdzenia`.
- Osobna zakładka `Statystyki` jest dostępna równolegle do sekcji `Statystyki` w zakładce `Gry admina`.

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
- Zawartość po poprawnej autoryzacji korzysta z kontenera `.next-game-content.is-visible`.
- Wewnątrz kontenera renderowana jest tabela tylko do odczytu (`.admin-data-table` w `.admin-table-scroll`) z kolumnami:
  - `Rodzaj gry`,
  - `Data`,
  - `Nazwa`.

## 13) Zakładka „Gry użytkowników” — panel administratora
- Do paska `.admin-panel-tabs` dodano nową pigułkę **Gry użytkowników** (`.admin-panel-tab`) pomiędzy „Gry admina” i „Gry do potwierdzenia”.
- Wnętrze karty oparto o nową klasę `.admin-user-games`, która używa tego samego wzorca sekcji co inne moduły admina:
  - ciemne tło `rgba(0, 0, 0, 0.32)`,
  - ramka `1px solid var(--border2)`,
  - zaokrąglenie `var(--radius-md)`,
  - wewnętrzny odstęp `16px`,
  - układ `grid` z odstępem `var(--gap-2)`.
- Zakładka admina „Najbliższa gra” korzysta z tych samych komponentów tabeli (`.admin-table-scroll`, `.admin-data-table`) co widok użytkownika.


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

## Aktualizacja layoutu 2026-02-12 — zakładka „Statystyki”
- Przywrócono osobną zakładkę administratora **Statystyki** w pasku zakładek panelu.
- Dodano zakładkę gracza **Statystyki** w pasku `user-tabs`.
- W nagłówku sekcji statystyk dodano przycisk `Eksportuj` (styl `secondary`, zgodny z istniejącymi przyciskami panelu).
- W nagłówkach tabel statystyk (widok admina) dodano checkboxy widoczności kolumn:
  - kontener `.stats-column-header` (flex, odstęp `8px`, wyrównanie pionowe do środka),
  - checkbox `.stats-column-visibility-checkbox` (`16x16 px`).
- Zachowano dotychczasowe style tabel `.admin-games-players-stats-table` oraz poziomy scroll w `.admin-table-scroll` dla szerokich zestawów kolumn.

## 19) „Gry admina” i „Gry użytkowników” — metadane w „Podsumowanie gry”
- W sekcji `.admin-game-summary` dodano dodatkowy wiersz tekstowy `Rodzaj gry: ...`.
- Wiersz jest renderowany **nad** `Pula: ...`, zgodnie z kolejnością informacji biznesowych.
- Użyty styl pozostaje spójny z pozostałymi liniami metadanych: klasa `.status-text` (bez nowych kolorów i bez zmiany fontów).
- Zmiana dotyczy dwóch widoków: panel administratora (`Gry admina`) oraz panel administratora dla gier użytkowników (`Gry użytkowników`).

## 20) Aktualizacja 2026-02-12 — „Gry admina” / „Gry użytkowników”

### 20.1 „Gry admina” → „Statystyki” → kolumna „Punkty”
- Wiersze kolumny „Punkty” są teraz prezentowane jako tekst (komórka tabeli), a nie pole `input`.
- Nie dodano nowych klas CSS ani nowych tokenów kolorów.
- Użyto istniejącego wyglądu komórek tabel `.admin-games-players-stats-table`.

### 20.2 „Podsumowanie gry” (Gry admina + Gry użytkowników)
- Brak zmian wizualnych w stylach scrolla.
- Zmiana dotyczy logiki renderowania: po odświeżeniu zachowywana jest pozycja pozioma paska `.admin-table-scroll`.

### 20.3 „Szczegóły gry” w „Gry użytkowników”
- Brak zmian w palecie kolorów, fontach i spacingu.
- Dodano tylko metadane `data-*` dla kontroli fokusu (zmiana techniczna, bez wpływu na wygląd komponentów).

---

## Aktualizacja UI 2026-02-12 — przyciskowe nagłówki „Wpisowe” i etykieta „Wyniki”

### Zakres
- `Main/index.html`
- Modale:
  - `#gameDetailsModal`
  - `#userGameDetailsModal`
  - `#playerUserGameDetailsModal`

### Zmiany wizualne
1. Nagłówek kolumny **Wpisowe** w modalach szczegółów gry został zamieniony z tekstu statycznego na przycisk.
2. Przycisk korzysta z istniejącej klasy `admin-weight-bulk-button`, więc:
   - zachowuje aktualny styl przycisków nagłówków (spójny wygląd z przyciskami Waga1–Waga7),
   - zachowuje aktualny font, promienie, obramowanie i stany interakcji zgodne z obecnym style guide projektu.
3. W tabeli statystyk graczy (Gry admina) zmieniono tekst nagłówka końcowej kolumny z **Wynik** na **Wyniki** (zmiana semantyczna etykiety bez zmiany geometrii kolumny).

### Typografia i kolory
- Nie dodano nowych fontów.
- Nie dodano nowych palet kolorystycznych.
- Nie dodano nowych klas kolorystycznych.
- Zastosowano istniejące style komponentowe przycisków tabelarycznych.


## 16) „Podsumowanie gry” — przycisk Notatki i modal
- Domyślny szablon notatek planistycznych zawiera pola: `Rodzaj gry`, `Przewidywani gracze`, `Stack`, `Wpisowe`, `Rebuy`, `Add-on`, `Blindy`, `Organizacja`, `Podział puli` (bez pola `Adres`).
- W nagłówku każdej karty podsumowania dodano kontener `.admin-game-summary-heading`:
  - układ poziomy `display:flex`,
  - wyrównanie pionowe `align-items:center`,
  - odstęp `gap:10px`.
- W tym samym wierszu, **przed tytułem** `Podsumowanie gry ...`, znajduje się przycisk `Notatki` (wariant wizualny `.secondary`).
- Dodano modal `#summaryNotesModal` (wariant `.modal-card-sm`) z:
  - polem tekstowym `.admin-textarea`,
  - przyciskiem `Zapisz` (`.primary`),
  - przyciskiem `Usuń` (`.danger`).
- `.admin-textarea` zachowuje motyw noir/gold:
  - ciemne tło,
  - subtelna ramka,
  - focus ring w kolorze złotym.

## 21) Aktualizacja layoutu 2026-02-13 — sterowanie kolumnami „Statystyki”
- W widoku użytkownika tabela `#statisticsPlayersStatsBody` ukrywa całe kolumny (nagłówek + komórki) na podstawie checkboxów ustawianych przez administratora w panelu `Statystyki`.
- Mechanizm używa istniejących nagłówków `thead th` i dynamicznie przełącza `display` dla komórek nieobecnych w `visibleColumns`.
- Nie dodano nowych fontów, kolorów ani tokenów stylu.
- Zachowano dotychczasowe klasy layoutu (`.admin-games-players-stats-table`, `.admin-table-scroll`, `.stats-column-header`, `.stats-column-visibility-checkbox`).

## 22) Aktualizacja layoutu 2026-02-13 — Strefa Gracza w adminie + etykiety procentów
- Sekcja **Strefa Gracza → Statystyki** w trybie `?admin=1` zachowuje ten sam przepływ wizualny co zwykły widok gracza: najpierw karta PIN (`.pin-gate`), dopiero po autoryzacji treść (`#statisticsContent`).
- Dzięki temu panel testowy na dole ekranu nie pokazuje „automatycznie odblokowanej” tabeli statystyk.
- W trzech tabelach statystyk zamieniono miejscami etykiety nagłówków procentowych:
  - wcześniej: `% Wszystkich gier` potem `% Rozegranych gier`,
  - teraz: `% Rozegranych gier` potem `% Wszystkich gier`.
- Nie dodano nowych klas CSS, fontów, kolorów ani tokenów spacing.

## 18) Aktualizacja UI: funkcja „Notatki” w tabelach gier i potwierdzeniach
- W kolumnie `Nazwa` (tabele `Gry admina` i `Gry użytkowników`) układ `.admin-games-name-control` pokazuje teraz trzy elementy w jednym wierszu:
  - pole tekstowe nazwy,
  - przycisk `Szczegóły` (`.secondary`),
  - przycisk `Notatki` (`.secondary`).
- Modal notatek (`#summaryNotesModal`) zachowuje dotychczasowy layout, ale czerwony przycisk akcji ma nową etykietę: `Domyślne` (`.danger`).
- W zakładce gracza `Gry do potwierdzenia` w sekcji `.confirmations-actions` dodano trzeci przycisk `Notatki` (`.secondary`) obok `Potwierdź` (`.primary`) i `Anuluj` (`.danger`).
- Nie wprowadzono nowych fontów, kolorów ani klas globalnych — użyto istniejącego systemu tokenów i komponentów przycisków.

## 23) Aktualizacja layoutu 2026-02-13 — Modal „Lata statystyk”
- Dodano nowy modal `#playerStatsYearsModal` wykorzystujący istniejące komponenty:
  - `.modal-overlay`,
  - `.modal-card.modal-card-sm`,
  - `.modal-header`, `.modal-body`,
  - `.status-text`, `.permissions-list`, `.permissions-item`.
- Nie dodano nowych fontów ani nowych tokenów kolorystycznych.
- Modal zachowuje ten sam styl noir/gold co pozostałe okna administracyjne.

### 23.1 Przycisk „Lata” przy uprawnieniu „Statystyki”
- Wiersz `.permissions-item` został rozszerzony o przycisk pomocniczy `Lata`.
- Przycisk używa istniejącej klasy wariantu `button.secondary` + nowego doprecyzowania:
  - `.permissions-item .permissions-years-button { margin-left: auto; padding: 6px 10px; font-size: 10px; }`
- Efekt wizualny:
  - przycisk jest dosunięty do prawej strony wiersza uprawnień,
  - zachowuje spójny styl obramowania, tła i hover z systemem przycisków aplikacji.

### 23.2 Badge uprawnienia „Statystyki”
- W tabeli graczy badge `Statystyki` pokazuje licznik lat (np. `Statystyki (2 lat)`).
- Nie wprowadzono nowej klasy badge — wykorzystano istniejący styl `.permission-badge`.

## 19) Aktualizacja UI 2026-02-13 — rozdzielenie „Notatki do gry” i „Notatki po grze”

- W sekcji tabel gier (kolumna `Nazwa`) przycisk pomocniczy `.secondary` ma etykietę **`Notatki do gry`**.
- W sekcji nagłówka `Podsumowanie gry ...` przycisk pomocniczy `.secondary` ma etykietę **`Notatki po grze`**.
- Modal `#summaryNotesModal` zachowuje ten sam layout i style, ale czerwony przycisk `.danger` działa kontekstowo:
  - **Notatki do gry** → etykieta `Domyślne`,
  - **Notatki po grze** → etykieta `Usuń`.
- W widoku `Gry do potwierdzenia` trzeci przycisk w `.confirmations-actions` ma etykietę **`Notatki do gry`** i otwiera modal tylko do odczytu.

## 26) Zakładka „Statystyki” — prawy panel rankingu rocznego
- Zarówno w panelu administratora (`#adminStatisticsTab`), jak i w strefie gracza (`#statsTab`) widok statystyk ma teraz układ 3-kolumnowy:
  1. lewy sidebar `Lata`,
  2. środkowa sekcja tabel statystyk,
  3. prawy sidebar `Ranking`.
- Prawy panel używa tych samych klas wizualnych co ranking w „Gry admina”:
  - `.admin-games-ranking-sidebar`,
  - `.admin-games-ranking-table`,
  - kolorowanie miejsc: gold/green/red.
- Tabela rankingu ma stałe kolumny: `Miejsce`, `Gracz`, `Wynik`.
- Dzięki wykorzystaniu istniejących klas nie wprowadzono nowych kolorów ani nowych fontów — zachowano obecny system noir/gold.

## Zakładka „Kalkulator” i styl pól wyboru

### 1) Układ sekcji kalkulatora
- Kontener główny: `.admin-calculator`.
- Layout dwukolumnowy: `.admin-calculator-layout`.
  - Lewy panel: `.admin-calculator-switch` (szerokość kolumny 180px).
  - Prawy panel: `.admin-calculator-content` z blokami tabel.
- Każda tabela znajduje się w `.admin-calculator-table-wrap`.

### 2) Styl tabel i kontrolek
- Tabele używają globalnej klasy `.admin-data-table`.
- Dla tabel kalkulatora zachowane jest `min-width: 760px`.
- Pola obliczane są renderowane jako `input.admin-input[disabled]`.
- Przycisk rebuy w Tabela2 wykorzystuje wariant wizualny `button.secondary`.
- Akcje wierszy (`Dodaj`, `Usuń`, `Dodaj Rebuy`, `Usuń Rebuy`) używają istniejącego układu `.admin-table-actions`.

### 3) Modal rebuy (nowy element UI)
- Modal tworzony dynamicznie: `#adminCalculatorRebuyModal`.
- Wykorzystuje istniejące klasy modalowe:
  - kontener: `.modal-overlay`,
  - karta: `.modal-card.modal-card-sm`,
  - sekcje: `.modal-header`, `.modal-body`.
- W modalu jest tabela rebuy (`#adminCalculatorRebuyTable`) i pasek akcji (`#adminCalculatorRebuyActions`).
- Nie dodano nowych fontów ani nowej palety kolorów; modal dziedziczy aktualny motyw noir/gold.

### 4) Kolumny i etykiety po zmianie
- Tabela3 zyskała pierwszą kolumnę `%` z prezentacją wartości w formacie `N%` po utracie fokusu.
- Tabela4 ma nazwy kolumn: `LP`, `Gracz`, `Wygrana`.
- Tabela5 ma nagłówek `Podział puli` (zamiast `%wygranej`) i końcową kolumnę `Suma`.
- Liczba kolumn `Rebuy` w Tabela5 jest dynamiczna (zależna od największej liczby pól rebuy gracza).


## 24) Zakładka „Najbliższa gra” — admin + użytkownik

- W panelu admina zakładka `adminNextGameTab` korzysta ze standardowego panelu `.admin-panel-content`.
- Widok użytkownika (`#nextGameTableBody`) ma tabelę 3-kolumnową (`Rodzaj gry`, `Data`, `Nazwa`) bez kontrolek.
- Widok administratora (`#adminNextGameTableBody`) ma tabelę 4-kolumnową z dodatkową kolumną `Akcje`.
- W kolumnie `Akcje` znajduje się czerwony przycisk `Usuń Całkowicie` (`button.danger`) dla każdego wiersza.
- Zachowano istniejące fonty i tokeny kolorów (`.admin-data-table`, `.danger`):
  - brak nowych fontów,
  - brak nowych palet kolorystycznych,
  - przycisk destrukcyjny używa tego samego stylu co pozostałe akcje usuwania w aplikacji.

## 25) Kolejność kolumn „% / Waga7” w statystykach

- Aktualny układ nagłówków w tabelach statystyk: `% Rozegranych gier` → `% Wszystkich gier` → `Waga7`.
- Zmiana dotyczy zakładek `Gry admina` i `Statystyki` w panelu admina.
- Geometria i style komórek pozostają bez zmian (ta sama tabela `.admin-games-players-stats-table`).


## 17) Android launcher icon (MigracjaAndroid)
- Ikona launchera oparta o motyw noir + czerwony akcent kart.
- Tło ikony (`ic_launcher_background`): `#0B1F2E`.
- Foreground (`ic_launcher_foreground.xml`) zawiera biały kształt karty i czerwony symbol.
- Dostępne warianty: standard (`ic_launcher`) i okrągły (`ic_launcher_round`).

## 14) Symulator Texas Hold'em — detale wizualne
- Moduł posiada układ 2-kolumnowy: lewy panel sterowania (`320px`) i prawa strefa stołu (`1fr`).
- Stół ma eliptyczny kształt z zielonym filcem (`--felt`, `--felt2`) i obramowaniem gold.
- Gracz jest zawsze na dole stołu, boty po półokręgu naprzeciwko.
- Karty prywatne botów są domyślnie zakryte (`.card.hidden`), karty gracza i wspólne odkryte.
- Animacje:
  - tasowanie talii (`.deck.shuffle`, `@keyframes shuffle`),
  - rozdawanie kart (`.card.dealt`, `@keyframes deal`).

## Aktualne detale UI (najświeższy stan)
- Zakładka **Gracze** (admin) zawiera dodatkowy wiersz statusowy `Liczba dodanych graczy: X` nad tabelą; korzysta z klasy `status-text` (spójna typografia i kolorystyka z pozostałymi statusami).
- Zakładka **Najbliższa gra** (admin i użytkownik) ma dodatkową kolumnę tekstową `CzyWszyscyPotwierdzili` z wartościami `Tak/Nie`.
- Zakładka **Gry admina** w kolumnie `Nazwa` zachowuje układ `input + Szczegóły`; przycisk `Notatki do gry` nie jest renderowany w tej sekcji.
- Zakładka **Gry użytkowników** zachowuje dostęp do przycisku `Notatki do gry` (bez zmian wizualnych w tym module).
## 23) Stałe ostrzeżenie bezpieczeństwa w strefie gracza
- W górnej części `.user-panel` (pod etykietą „Strefa gracza”) widoczny jest stały blok `.user-security-warning`.
- Komponent jest pełnej szerokości panelu (`flex: 1 1 100%`), więc ostrzeżenie zawsze trafia do osobnego wiersza nad zakładkami użytkownika.
- Warstwa wizualna ostrzeżenia używa czerwonego akcentu: obramowanie `rgba(226, 58, 75, 0.55)` oraz tło `rgba(226, 58, 75, 0.12)`.
- Typografia: font-size `--fs-small`, line-height `1.45`, pogrubienie `600` dla szybkiej czytelności treści bezpieczeństwa.
- Ostrzeżenie nie jest interaktywne (statyczny komunikat tekstowy), ale pozostaje zgodne z motywem noir/gold przez kontrolowany kontrast i zaokrąglenie `var(--radius-sm)`.

