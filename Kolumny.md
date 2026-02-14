# Kolumny i okna modalne — formatowanie w aplikacji Karty

Poniższe zestawienie obejmuje **wszystkie tabele kolumnowe** oraz **wszystkie okna modalne** widoczne w aplikacji.

## Zasady globalne (dotyczą wszystkich tabel)

| Parametr | Wartość |
| --- | --- |
| Bazowa tabela | `.admin-data-table` |
| Szerokość tabeli | `width: 100%` |
| Minimalna szerokość tabeli | `min-width: 860px` (chyba że sekcja nadpisuje) |
| Wysokość komórek | brak stałej wysokości (`height` nieustawione, poza rankingiem) |
| Wyrównanie tekstu | `left` (`text-align: left`) |
| Wyrównanie pionowe | `middle` |
| Łamanie linii | standardowe (`white-space: normal`) |
| Scroll poziomy | przez kontener `.admin-table-scroll` (`overflow-x: auto`) |
| Padding komórek | `10px 8px` |

> Uwaga: w wielu kolumnach wartości są renderowane jako `input/select/button`, więc ich realna szerokość zależy od zawartości i reguł komponentu (`width: 100%` dla `.admin-input`).

---

## Panel Administratora → Zakładka „Gracze”

### Tabela graczy (`.players-table`)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Aplikacja | brak | 88px (komórka `.players-app-cell`) | brak | 88px (efektywnie stała szerokość) | środek | standard |
| Nazwa | brak | brak (tabela globalnie min 700px) | brak | brak | lewo | standard |
| PIN | brak | ~108px dla pola (`.pin-control .admin-input`) | brak | brak | lewo | standard |
| Uprawnienia | brak | brak | brak | brak | lewo | standard |
| Akcje (pusta nazwa nagłówka) | brak | wg zawartości przycisków | brak | brak | lewo | standard |

Parametry sekcji:
- `min-width` całej tabeli: **700px**.
- Checkbox „Aplikacja”: 18×18px.

---

## Panel Administratora → Zakładka „Gry admina”

### 1) Tabela gier (górna)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj Gry | brak | brak | brak | brak | lewo | standard |
| Data | brak | brak | brak | brak | lewo | standard |
| Nazwa | brak | ~200px dla pola w komponencie nazwy (`.admin-games-name-control .admin-input`) | brak | brak | lewo | standard |
| CzyZamknięta | brak | brak | brak | brak | lewo | standard |
| Akcje (pusta nazwa nagłówka) | brak | wg zawartości przycisków | brak | brak | lewo | standard |

### 2) Tabela statystyk (Opis/Wartość)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Opis | brak | brak | brak | brak | lewo | standard |
| Wartość | brak | brak | brak | brak | lewo | standard |

### 3) Tabela statystyk graczy (`.admin-games-players-stats-table`)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Gracz | brak | brak | brak | brak | lewo | standard |
| Mistrzostwo | brak | brak | brak | brak | lewo | standard |
| Waga1 | brak | min 84px dla inputów w tej tabeli | brak | brak | lewo | standard |
| Ilość Spotkań | brak | min 84px dla inputów | brak | brak | lewo | standard |
| % udział | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga2 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Punkty | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga3 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| (+/-) | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga4 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Wypłata | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga5 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Wpłaty | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga6 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Suma z rozegranych gier | brak | min 84px dla inputów | brak | brak | lewo | standard |
| % Rozegranych gier | brak | min 84px dla inputów | brak | brak | lewo | standard |
| % Wszystkich gier | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Waga7 | brak | min 84px dla inputów | brak | brak | lewo | standard |
| Wynik | brak | min 84px dla inputów | brak | brak | lewo | standard |

Parametry sekcji:
- `min-width` całej tabeli: **2300px**.

### 4) Tabela rankingu (`.admin-games-ranking-table`)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Miejsce | 41px | brak | 41px | brak | lewo | standard |
| Gracz | 41px | brak | 41px | brak | lewo | standard |
| Wynik | 41px | brak | 41px | brak | lewo | standard |

Parametry sekcji:
- Wysokość każdego `th/td` rankingu: **41px** (zmienna `--admin-games-panel-item-height`).

### 5) Tabele podsumowania gry (renderowane dynamicznie)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Gracz | brak | brak | brak | brak | lewo | standard |
| Wpisowe | brak | brak | brak | brak | lewo | standard |
| Rebuy/Add-on | brak | brak | brak | brak | lewo | standard |
| Wypłata | brak | brak | brak | brak | lewo | standard |
| +/- | brak | brak | brak | brak | lewo | standard |
| % puli | brak | brak | brak | brak | lewo | standard |
| Punkty | brak | brak | brak | brak | lewo | standard |
| Mistrzostwo | brak | brak | brak | brak | lewo | standard |

---

## Panel Administratora → Zakładka „Gry użytkowników”

### Tabela gier użytkowników (admin)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj Gry | brak | brak | brak | brak | lewo | standard |
| Data | brak | brak | brak | brak | lewo | standard |
| Nazwa | brak | brak | brak | brak | lewo | standard |
| CzyZamknięta | brak | brak | brak | brak | lewo | standard |
| Akcje (pusta nazwa nagłówka) | brak | wg zawartości | brak | brak | lewo | standard |

---

## Strefa gracza → Zakładka „Gry do potwierdzenia”

### Tabela potwierdzeń (`.confirmations-table`)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj Gry | brak | brak | brak | brak | lewo | standard |
| Data | brak | brak | brak | brak | lewo | standard |
| Nazwa | brak | brak | brak | brak | lewo | standard |
| Potwierdzenie | brak | brak | brak | brak | lewo | standard |

Parametry sekcji:
- `min-width` całej tabeli: **760px**.

---

## Strefa gracza → Zakładka „Gry użytkowników”

### Tabela gier użytkowników (widok gracza)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj Gry | brak | brak | brak | brak | lewo | standard |
| Data | brak | brak | brak | brak | lewo | standard |
| Nazwa | brak | brak | brak | brak | lewo | standard |
| CzyZamknięta | brak | brak | brak | brak | lewo | standard |
| Akcje (pusta nazwa nagłówka) | brak | wg zawartości | brak | brak | lewo | standard |

---

## Dynamiczne tabele w panelu „Gry do potwierdzenia” (admin)

### Tabela statusów graczy na grę (renderowana w JS)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Gracz | brak | brak | brak | brak | lewo | standard |
| Status | brak | brak | brak | brak | lewo | standard |
| Akcje | brak | brak | brak | brak | lewo | standard |

---

## Okna modalne (wyskakujące) — formatowanie

## 1) `instructionModal` (Instrukcja)
| Parametr | Wartość |
| --- | --- |
| Kontener | `.modal-overlay` |
| Pozycjonowanie | `fixed`, `inset: 0`, wyśrodkowanie flex |
| Szerokość karty | `width: min(880px, 100%)` |
| Wysokość karty | brak stałej wysokości |
| Maks. wysokość karty | `max-height: min(82vh, 720px)` |
| Body | układ grid, `overflow: hidden` |
| Zawartość instrukcji | `.modal-content`, scroll pionowy, `white-space: pre-wrap` |

## 2) `playerPermissionsModal` (Uprawnienia gracza)
| Parametr | Wartość |
| --- | --- |
| Rozmiar | `.modal-card.modal-card-sm` |
| Szerokość | `width: min(520px, 100%)` |
| Maks. wysokość | `max-height: min(82vh, 720px)` |
| Lista uprawnień | `.permissions-list` (`display: grid`, gap 10px) |
| Wiersz opcji | `.permissions-item` (checkbox 18×18px) |

## 3) `gameDetailsModal` (Szczegóły gry admina)
| Parametr | Wartość |
| --- | --- |
| Szerokość karty | `min(880px, 100%)` |
| Maks. wysokość | `min(82vh, 720px)` |
| Tabela w modalu | `.admin-data-table` (globalnie min 860px) |
| Kolumny | Gracz, Wpisowe, Rebuy/Add-on, Wypłata, +/-, Punkty, Mistrzostwo, Akcje |
| Pole „Gracz” | select (szerokość wg komórki) |
| Pola liczbowe | `.admin-input` (`width: 100%`) |

## 4) `userGameDetailsModal` (Szczegóły gry użytkownika — admin)
| Parametr | Wartość |
| --- | --- |
| Rozmiar i zachowanie | jak `gameDetailsModal` |
| Kolumny tabeli | Gracz, Wpisowe, Rebuy/Add-on, Wypłata, +/-, Punkty, Mistrzostwo, Akcje |

## 5) `playerUserGameDetailsModal` (Szczegóły gry użytkownika — gracz)
| Parametr | Wartość |
| --- | --- |
| Rozmiar i zachowanie | jak `gameDetailsModal` |
| Kolumny tabeli | Gracz, Wpisowe, Rebuy/Add-on, Wypłata, +/-, Punkty, Mistrzostwo, Akcje |

---

## Kontrolki formularzy (ważne dla modyfikacji wyglądu kolumn)

| Kontrolka | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie |
| --- | --- | --- | --- | --- | --- | --- |
| `.admin-input` | brak | brak | brak | brak | lewo | standard |
| `textarea` w komunikatach/czacie | 86px | brak | brak | brak | lewo | zawijanie standardowe |
| `textarea` regulaminu | 170px | brak | brak | brak | lewo | zawijanie standardowe |
| Wejścia PIN (`.pin-inputs input`) | brak | brak | brak | 180px | lewo | brak specjalnych reguł |

---

## Podsumowanie praktyczne
- Dla tabel krytyczne są trzy minima: **700px (Gracze)**, **760px (Potwierdzenia)**, **2300px (Statystyki graczy w Gry admina)**.
- Wszystkie szczegółowe modale korzystają z tego samego wzorca: szeroka karta (`880px`) + ograniczenie wysokości (`82vh/720px`) + lokalny scroll treści.
- Jeżeli chcesz precyzyjnie sterować szerokościami pojedynczych kolumn, najbezpieczniej dodać dedykowane klasy `th/td` dla danej tabeli (obecnie większość kolumn dziedziczy reguły globalne i szerokości wynikają z zawartości).

## Podsumowanie gry (Gry admina + Gry użytkowników)

### Blok metadanych nad tabelą graczy

| Wiersz | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj gry | brak | brak | brak | brak | lewo | standard |
| Pula | brak | brak | brak | brak | lewo | standard |

Uwagi:
- Wiersz **Rodzaj gry** jest renderowany bezpośrednio nad wierszem **Pula** w sekcji „Podsumowanie gry”.
- Wartości są prezentowane jako tekst (`.status-text`) i nie wprowadzają zmian szerokości kolumn tabel danych.

## Dynamiczna widoczność kolumn w „Statystyki”
- Dotyczy tabeli statystyk graczy (`.admin-games-players-stats-table`) w widoku użytkownika.
- Administrator steruje widocznością przez checkboxy w nagłówkach widoku admina.
- Po odznaczeniu kolumny użytkownik nie widzi tej kolumny ani w nagłówku, ani w danych.
- Parametry szerokości i wyrównania pojedynczych kolumn pozostają bez zmian; zmienia się tylko to, które kolumny są renderowane.

## Etykiety kolumn procentowych w Statystykach
- Aktualna kolejność nagłówków procentowych i wag w tabelach statystyk:
  - `% Rozegranych gier`,
  - `% Wszystkich gier`,
  - `Waga7`.
- Dotyczy to tabel:
  - `Gry admina -> Statystyki`,
  - `Admin -> Statystyki`,
  - `Strefa Gracza -> Statystyki`.
- Zmiana nie modyfikuje szerokości, wyrównania i łamania kolumn — aktualne parametry geometrii pozostają bez zmian.

## Panel administratora → Zakładka „Kalkulator”

### Tabela1

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Suma | brak | brak | brak | brak | lewo | standard |
| Buy-In | brak | brak | brak | brak | lewo | standard |
| Rebuy | brak | brak | brak | brak | lewo | standard |
| Liczba Rebuy | brak | brak | brak | brak | lewo | standard |

### Tabela2

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| LP | brak | brak | brak | brak | lewo | standard |
| Gracz | brak | brak | brak | brak | lewo | standard |
| Buy-In | brak | brak | brak | brak | lewo | standard |
| Rebuy | brak | brak | brak | brak | lewo | standard |
| Eliminated | brak | brak | brak | brak | lewo | standard |
| Akcje | brak | wg zawartości | brak | brak | lewo | standard |

### Tabela3

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rake | brak | brak | brak | brak | lewo | standard |
| Wpisowe | brak | brak | brak | brak | lewo | standard |
| Rebuy | brak | brak | brak | brak | lewo | standard |
| Pot | brak | brak | brak | brak | lewo | standard |

### Tabela4

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| LP | brak | brak | brak | brak | lewo | standard |
| Miejsce | brak | brak | brak | brak | lewo | standard |
| Ranking | brak | brak | brak | brak | lewo | standard |

### Tabela5

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| LP | brak | brak | brak | brak | lewo | standard |
| %wygranej | brak | brak | brak | brak | lewo | standard |
| Gracz | brak | brak | brak | brak | lewo | standard |
| Kwota | brak | brak | brak | brak | lewo | standard |
| Ranking | brak | brak | brak | brak | lewo | standard |
| Rebuy1-Rebuy10 | brak | brak | brak | brak | lewo | standard |

Parametry sekcji kalkulatora:
- Lewy panel przełączania trybu: szerokość kolumny `180px` (`.admin-calculator-layout`).
- Minimalna szerokość tabel kalkulatora: `760px`.


## Zakładka „Najbliższa gra” (admin + użytkownik)

| Kolumna | Min-height | Min-width | Max-height | Max-width | Wyrównanie | Łamanie linii |
| --- | --- | --- | --- | --- | --- | --- |
| Rodzaj gry | brak | brak | brak | brak | lewo | standard |
| Data | brak | brak | brak | brak | lewo | standard |
| Nazwa | brak | brak | brak | brak | lewo | standard |

Uwagi:
- Tabela działa w trybie tylko do odczytu (brak pól `input/select`).
- W obu widokach używa kontenera `.admin-table-scroll` i tabeli `.admin-data-table`.
