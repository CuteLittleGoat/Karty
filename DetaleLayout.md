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
- Zakładki: `Aktualności`, `Gracze`, `Turnieje`, `Gry`.
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

