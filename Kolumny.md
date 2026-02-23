# Kolumny — szerokości, wyrównania i formatowanie

Poniżej znajduje się aktualny spis kolumn tabel UI w aplikacji Karty, z naciskiem na parametry layoutu (min/max szerokości, wyrównanie, łamanie) oraz zachowanie pól wejściowych.

## Ustawienia globalne dla tabel

| Parametr | Wartość | Gdzie obowiązuje |
| --- | --- | --- |
| Szerokość tabeli | `width: 100%` | `.admin-data-table` |
| Minimalna szerokość tabeli | `min-width: 860px` | `.admin-data-table` |
| Maksymalna szerokość tabeli | brak | globalnie |
| Wyrównanie komórek (`th`, `td`) | lewo (`text-align: left`) | globalnie |
| Łamanie linii w komórkach | domyślne przeglądarki (brak wymuszenia `nowrap` dla komórek tabel) | globalnie |
| Padding komórek | `10px 8px` | globalnie |

Dodatkowe wyjątki globalne:
- `.players-table` ma `min-width: 700px`.
- `.admin-games-players-stats-table` ma `min-width: 2300px`.
- Tabele kalkulatora (`.admin-calculator-table-wrap .admin-data-table`) mają `min-width: 760px` (na małych ekranach `680px`).
- Modal `#adminCalculatorRebuyTable` ma układ stały (`table-layout: fixed`) i każda komórka ma dokładnie `8ch` (`min/width/max = 8ch`).

---

## 1) Gracze (panel admina)
**Tabela:** `players-table` (`min-width: 700px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Aplikacja | auto | brak | środek (komórka `.players-app-cell`) | standard | Komórka ma stałą szerokość `88px`; checkbox ma `18x18px`. |
| Nazwa | auto | brak | lewo | standard | Pole tekstowe (`input`). |
| PIN | auto | brak | lewo | standard | Pole przyjmuje tylko cyfry (sanityzacja do 5 cyfr). |
| Uprawnienia | auto | brak | lewo | standard | Lista tagów uprawnień + przycisk edycji. |
| Akcje | auto | brak | lewo | standard | Przyciski akcji (np. usuń). |

---

## 2) Gry admina / Gry użytkowników / Najbliższa gra
**Tabela bazowa:** `.admin-data-table` (`min-width: 860px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Rodzaj Gry / Rodzaj gry | auto | brak | lewo | standard | `select` z opcjami typu gry. |
| Data | auto | brak | lewo | standard | `input type="date"`. |
| Nazwa | auto | brak | lewo | standard | `input` tekstowy. |
| CzyZamknięta / CzyWszyscyPotwierdzili | auto | brak | lewo | standard | Checkbox (`true/false`). |
| Akcje | auto | brak | lewo | standard | Przyciski (np. szczegóły / usuń). |

---

## 3) Szczegóły gry (modal) — admin i użytkownik
**Tabela bazowa:** `.admin-data-table` (`min-width: 860px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| LP | auto | brak | lewo | standard | Numer porządkowy. |
| Gracz | auto | brak | lewo | standard | `select` z listą graczy. |
| Wpisowe | auto | brak | lewo | standard | Pole liczbowe (sanityzacja do liczby całkowitej). |
| Rebuy/Add-on | auto | brak | lewo | standard | Pole liczbowe (sanityzacja do liczby całkowitej). |
| Wypłata | auto | brak | lewo | standard | Pole liczbowe (sanityzacja do liczby całkowitej). |
| +/- | auto | brak | lewo | standard | Pole tylko odczyt: `Wypłata - (Wpisowe + Rebuy/Add-on)`. |
| Punkty | auto | brak | lewo | standard | Pole liczbowe (sanityzacja do liczby całkowitej). |
| Mistrzostwo | auto | brak | lewo | standard | Checkbox (w podsumowaniach renderowany jako `✓` / `Tak/Nie`). |
| Akcje (tylko admin) | auto | brak | lewo | standard | Przycisk usuwania wiersza. |

---

## 4) Gry do potwierdzenia (strefa gracza)
**Tabela:** `.confirmations-table` + `.admin-data-table` (`min-width: 860px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Rodzaj Gry | auto | brak | lewo | standard | Wartość tekstowa. |
| Data | auto | brak | lewo | standard | Data gry. |
| Nazwa | auto | brak | lewo | standard | Nazwa gry. |
| Potwierdzenie | auto | brak | lewo | standard | Status/akcja potwierdzenia udziału. |

---

## 5) Statystyki (Gry admina + Statystyki)

### 5.1 Tabela „Opis / Wartość”
**Tabela bazowa:** `.admin-data-table` (`min-width: 860px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Opis | auto | brak | lewo | standard | Etykieta metryki. |
| Wartość | auto | brak | lewo | standard | Wartość liczbowa/tekstowa. |

### 5.2 Tabela graczy statystyk
**Tabela:** `.admin-games-players-stats-table` (`min-width: 2300px`)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Gracz | auto | brak | lewo | standard | Nazwa gracza. |
| Mistrzostwo | auto | brak | lewo | standard | Liczba zwycięstw. |
| Waga1 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| Ilość Spotkań | auto | brak | lewo | standard | Pole tylko odczyt. |
| Waga2 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| % udział | auto | brak | lewo | standard | Użytkownik nie wpisuje `%`; znak `%` jest doklejany automatycznie w widoku. |
| Punkty | auto | brak | lewo | standard | Pole tylko odczyt. |
| Waga3 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| (+/-) | auto | brak | lewo | standard | Pole tylko odczyt. |
| Waga4 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| Wypłata | auto | brak | lewo | standard | Pole tylko odczyt. |
| Waga5 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| Wpłaty | auto | brak | lewo | standard | Pole tylko odczyt. |
| Waga6 | auto | brak | lewo | standard | Edytowalne pole liczbowe (integer). |
| Suma z rozegranych gier | auto | brak | lewo | standard | Pole tylko odczyt. |
| % Rozegranych gier | auto | brak | lewo | standard | `%` dodawany automatycznie. |
| % Wszystkich gier | auto | brak | lewo | standard | `%` dodawany automatycznie. |
| Wynik / Wyniki | auto | brak | lewo | standard | Wynik końcowy. |

### 5.3 Ranking
**Tabela:** `.admin-games-ranking-table` (`min-width: 100%` kontenera)

| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Miejsce | auto | brak | lewo | standard | Pozycja rankingowa. |
| Gracz | auto | brak | lewo | standard | Nazwa gracza. |
| Wynik | auto | brak | lewo | standard | Wynik punktowy. |

---

## 6) Kalkulator

### 6.1 Tabela1
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Suma | auto | brak | lewo | standard | Tylko odczyt. |
| Buy-In | auto | brak | lewo | standard | Pole cyfr (sanityzacja do integer). |
| Rebuy | auto | brak | lewo | standard | Pole cyfr (sanityzacja do integer). |
| Liczba Rebuy | auto | brak | lewo | standard | Tylko odczyt, liczba rebuy. |

### 6.2 Tabela2
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| LP | auto | brak | lewo | standard | Numer porządkowy. |
| Gracz | auto | brak | lewo | standard | `select` (blokuje duplikaty w tym samym trybie). |
| Buy-In | auto | brak | lewo | standard | Tylko odczyt. |
| Rebuy | auto | brak | lewo | standard | Przycisk otwierający modal rebuy. |
| Eliminated | auto | brak | lewo | standard | Checkbox eliminacji. |
| Akcje | auto | brak | lewo | standard | Usuń/dodaj wiersz. |

### 6.3 Tabela3
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| % | auto | brak | lewo | standard | Użytkownik wpisuje cyfry; po blur aplikacja pokazuje wartość z `%` (np. `10` → `10%`). |
| Rake | auto | brak | lewo | standard | Tylko odczyt. |
| Wpisowe | auto | brak | lewo | standard | Tylko odczyt. |
| Rebuy | auto | brak | lewo | standard | Tylko odczyt. |
| Pot | auto | brak | lewo | standard | Tylko odczyt. |

### 6.4 Tabela4
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| LP | auto | brak | lewo | standard | Numer miejsca. |
| Gracz | auto | brak | lewo | standard | Tylko odczyt, wyliczane z kolejności eliminacji. |
| Wygrana | auto | brak | lewo | standard | Tylko odczyt. |

### 6.5 Tabela5
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| LP | auto | brak | lewo | standard | Numer porządkowy. |
| Podział puli | auto | brak | lewo | standard | Pole procentowe: wpis cyfr, po blur automatyczne `%`. |
| Kwota | auto | brak | lewo | standard | Tylko odczyt. |
| Rebuy1..RebuyN | auto | brak | lewo | standard | Kolumny dynamiczne, tworzone tylko dla istniejących wartości rebuy. |
| Mod | auto | brak | lewo | standard | Tylko odczyt/obliczenia pośrednie. |
| Suma | auto | brak | lewo | standard | Tylko odczyt. |

### 6.6 Modal rebuy (kalkulator)
| Kolumna | Min-width | Max-width | Wyrównanie | Łamanie | Detale formatowania |
| --- | --- | --- | --- | --- | --- |
| Rebuy1..RebuyN | `8ch` | `8ch` | lewo | standard | Każda kolumna ma stałe `8ch` (`min/width/max`), `table-layout: fixed`; pola akceptują tylko cyfry. |

---

## 7) Reguły danych wejściowych istotne dla kolumn
- Pola kwotowe i punktowe są sanityzowane do liczb całkowitych (usuwane znaki nienumeryczne, obsługa minusów zależnie od sekcji).
- W polach procentowych (Statystyki `%` i Kalkulator `%`) użytkownik wpisuje samą liczbę, a `%` jest dodawany automatycznie przez render.
- Brak dedykowanych reguł CSS `text-align: right` dla kolumn numerycznych — liczby są wyrównane do lewej tak jak reszta tabel.
