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
- Zakładki: `Aktualności`, `Regulamin`, `Gracze`, `Turnieje`, `Gry`.
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
  - sekcja `.admin-rules-actions` zawiera tylko komunikat statusu autozapisu (bez przycisków akcji).
- Widok użytkownika:
  - zakładka `Regulamin` używa wariantu `.latest-rules` z takim samym typograficznym stylem jak `Aktualności`, ale z większym polem na treść.
- Mobile (`max-width: 720px`):
  - `.admin-rules-actions` zachowuje responsywne pozycjonowanie komunikatu statusu.

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
