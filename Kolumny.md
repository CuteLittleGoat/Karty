# Kolumny — aktualny układ

## Model szerokości kolumn

Szerokości wszystkich tabel w obu modułach opisuje **jedna skala tokenów** zdefiniowana w `:root` (`Main/styles.css` i `Second/styles.css`). To jedyne miejsce, w którym stroi się szerokości — nie ma już reguł `th:nth-child(n)` / `td:nth-child(n)`.

| Token | Desktop | Mobile (≤720 px) | Zastosowanie |
|---|---:|---:|---|
| `--col-num-xs` | 56 px | 48 px | LP, Nr, %, licznik |
| `--col-num-sm` | 80 px | 64 px | krótkie liczby, wagi, Rebuy |
| `--col-num-md` | 104 px | 88 px | kwoty, stack, wynik, pot |
| `--col-flag` | 88 px | 88 px | checkbox, Tak/Nie, Eliminated |
| `--col-date` | 120 px | 104 px | data |
| `--col-text-sm` | 144 px | 120 px | rodzaj gry, stół, status |
| `--col-text-md` | 192 px | 160 px | nazwa gracza, PIN z przyciskiem |
| `--col-text-lg` | 256 px | 192 px | nazwa gry z akcjami, uprawnienia |
| `--col-actions` | 112 px | 96 px | przyciski w wierszu |

Jednostką jest `rem`, nie `ch`: `ch` zależy od fontu elementu, więc ta sama deklaracja dawała inną szerokość w `<th>` (Rajdhani 12 px) niż w `<td>` (Inter 14,5 px) — różnica sięgała 21 %.

### Jak deklaruje się kolumny

Szerokości ustala `<colgroup>` przed `<thead>`:

```html
<table class="admin-data-table t-fluid" style="--table-min: calc(var(--col-num-xs) + var(--col-text-md) + var(--col-num-md))">
  <colgroup>
    <col style="width: var(--col-num-xs)">
    <col>                                   <!-- kolumna elastyczna -->
    <col style="width: var(--col-num-md)">
  </colgroup>
```

- **Jedna kolumna tekstowa** (`--col-text-lg`, a gdy jej nie ma — `--col-text-md`) dostaje `<col>` bez szerokości. To ona wchłania nadmiar miejsca w szerokim panelu, dzięki czemu kolumny liczbowe zachowują dokładne wartości tokenów.
- `--table-min` to suma tokenów całej tabeli; poniżej tej szerokości tabela przewija się poziomo zamiast ściskać kolumny.
- W tabelach budowanych w JS służą do tego helpery `tableColumns()` (Main) oraz `tCols()` / `tAttr()` / `tColsAuto()` (Second).

### Tryby tabel

| Tryb | Zachowanie | Dla jakich tabel |
|---|---|---|
| `t-fluid` | wypełnia kontener, przewija się gdy za wąsko | listy danych: gracze, gry, wpłaty, fazy turnieju |
| `t-compact` | zajmuje dokładnie sumę tokenów | podsumowania 2–5 kolumn: Tabela10/11/13/14/15/17/18, tabele kalkulatora |
| `is-table-stacked` | poniżej 560 px wiersz staje się kartą „etykieta → wartość" | listy tylko do odczytu w widoku gracza |

Wszystkie tabele mają `table-layout: fixed`, dlatego zadeklarowana szerokość jest szerokością realną — treść komórki nie rozpycha kolumny. Pola `.admin-input` w tabelach mają `min-width: 0`; bez tego pole narzucało komórce własną szerokość naturalną (ok. 213 px przy domyślnym `size=20`), ignorując `<colgroup>`.

### Zachowanie treści

- Nagłówki zawijają się w dwie linie (`white-space: normal`), zamiast być ucinane.
- Wartości w komórkach nie zawijają się i są obcinane wielokropkiem (`white-space: nowrap`, `text-overflow: ellipsis`).
- Nagłówek tabeli jest przyklejony do góry przy przewijaniu (`position: sticky`).

## Przypisanie tokenów do kolumn

## Moduł Second — Tournament of Poker

### Lista graczy
1. Status
2. Nazwa
3. PIN
4. Uprawnienia
5. Akcje

### Losowanie stołów
1. Gracz
2. Status
3. Stół

Dodatkowo dla każdego stołu:
- Gracz
- BUY-IN (tylko odczyt, wartość z sekcji Lista graczy)

### Wpłaty
- Tabela10: Buy-in, REBUY/ADD-ON, SUMA, licz. REBUY/ADD-ON
- Tabela11: %, Rake, BUY-IN, REBUY/ADD-ON, POT
- Tabela12: LP, Stół, Gracz, BUY-IN, REBUY

### Podział puli
- Tabela13: BUY-IN, REBUY/ADD-ON, SUMA, LICZBA REBUY
- Tabela14: %, Rake, BUY-IN, REBUY/ADD-ON, POT
- Tabela15: BUY-IN, PODZIAŁ
- Tabela16: LP, PODZIAŁ PULI, KWOTA, REBUY1..n, MOD1..MOD3, SUMA

### Faza grupowa
- Tabela17: STACK GRACZA, REBUY/ADD-on(w żetonach na os)
- Tabela18: Stoły dynamiczne + ŁĄCZNY STACK
- Tabela19: LP, Stół, Gracz, ELIMINATED, Stack, REBUY/ADD-ON
- Tabela19A: LP, WYELIMINOWANI GRACZE, POZYCJA, WYGRANA
- Tabela19B: LP, Stół, Gracz, Stack, %

### Półfinał
- Tabela21: LP, Gracz, STACK, %, Stół
- Tabela22: LP, Gracz, Stack, Eliminated, %
- Tabela Finałowa: LP, GRACZ, STACK, STÓŁ, %

- Tabela21: `STACK` jest readonly i ma tę samą szerokość (`--col-num-md`) co `STACK` w Tabeli Finałowej.
- Tabela Finałowa: `STACK` jest edytowalny (tylko cyfry), domyślna wartość `0`.
- Tabela23: `STACK` synchronizowany 1:1 z `Tabela Finałowa.STACK`.

### Finał
- Tabela23: LP, GRACZ, STACK, %, Eliminated

### Wypłaty
- Tabela24: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA



### Losowanie stołów — kolumna Status
- Kolumna `Status` zawiera wyłącznie etykietę statusu płatności (układ w `.payment-status-cell`, bez przycisku zmiany).
- Zmiana statusu następuje w sekcji `Lista graczy` przez zaznaczenie/odznaczenie okrągłej kontrolki w kolumnie `Status`.

## Moduł Main — Ranking (Gry admina i Statystyki)
1. Miejsce
2. Gracz
3. Wynik


### Układ paneli Statystyk (widok gracza, desktop)
- W `Statystyki` (widok gracza) siatka ma trzy kolumny: `Lata` (`20ch`), `Statystyki` (`minmax(0, 1fr)`) i `Ranking` (`34ch`).
- Trzy kolumny pojawiają się dopiero **powyżej 1180 px**. Poniżej tej szerokości układ przechodzi na jedną kolumnę i panele `Lata` oraz `Ranking` trafiają nad i pod treść — inaczej na tablecie kolumna z tabelami byłaby węższa od pasków bocznych.
- Dodatkowo na telefonach w poziomie (`orientation: landscape` + urządzenie dotykowe + `max-height: 500px`) layout także przechodzi na jedną kolumnę.


### Losowanie stołów — akcje w bloku stołu
- Przycisk `Usuń` w pojedynczym bloku stołu ma kompaktową szerokość (`.admin-row-delete`) i wyrównanie do prawej krawędzi (`.draw-table-delete`).

## Tournament of Poker (Second) – kolumny
- Panel `Losowanie stołów`: kolumna `Wpisowe` została zastąpiona przez `BUY-IN`.
- Panel `Wpłaty`:
  - `Tabela10`: nieedytowalne komórki obliczane (`BUY-IN`, `REBUY/ADD-ON`, `SUMA`, `LICZ. REBUY/ADD-ON`).
  - `Tabela11`: nieedytowalne komórki obliczane (`%`, `RAKE`, `BUY-IN`, `REBUY/ADD-ON`, `POT`), gdzie `RAKE` liczy się z sumy `BUY-IN + REBUY`.
  - `Tabela12`: kolejność kolumn `LP`, `STÓŁ`, `GRACZ`, `BUY-IN`, `REBUY`; kolumna `REBUY` jako przycisk otwierający modal.
- Panel `Podział puli`:
  - przyciski `Dodaj/Usuń` są pod `Tabela16`,
  - `Tabela15` pokazuje kolumny `BUY-IN` i `PODZIAŁ`, gdzie `BUY-IN` jest kopiowany z `Tabela14.BUY-IN`,
  - `Tabela16` ma `PODZIAŁ PULI` (wiersze 1–3 procentowo, od 4 liczbowo),
  - kolumny `Tabela16` korzystają z tokenów: `LP` = `--col-num-xs`, `PODZIAŁ PULI` i `KWOTA` = `--col-num-md`, kolumny `REBUY` i `MOD` = `--col-num-sm`, `SUMA` = `--col-num-md`,
  - liczba kolumn `REBUY` jest dynamiczna i zależy od liczby uzupełnionych pól `Rebuy` w modalach `Rebuy gracza`,
  - `REBUY1..REBUY30` mają stałe przypisanie do wierszy, a przypisane komórki są readonly i pokazują wartości z modali `Rebuy gracza`,
  - kolumny od `REBUY31` wzwyż są puste domyślnie i edytowalne ręcznie przez użytkownika,
  - kolumny `MOD` są dynamiczne (`MOD1`, `MOD2`, `MOD3`) zależnie od liczby kolumn `REBUY`.
- Panel `Faza grupowa`:
  - `Tabela17` tylko 2 kolumny: `STACK GRACZA`, `REBUY/ADD-ON`.
  - `Tabela19` ma kolumny `LP`, `STÓŁ`, `GRACZ`, `ELIMINATED`, `STACK`, `REBUY/ADD-ON`.
  - `Tabela19A` pokazuje wyeliminowanych graczy.
  - `Tabela19B` pokazuje niewyeliminowanych graczy.


### Modal „Rebuy gracza” (Second)
- Kolumny dynamiczne: `Rebuy1..n` (numeracja globalna dla wszystkich wpisów `Tabela12`, niezależnie od aktualnie przypisanych graczy).
- Szerokość każdej kolumny: `--col-num-sm`.

## Moduł Main — Gry użytkowników (widok admina i gracza)
1. Rodzaj Gry
2. Data
3. Nazwa
4. CzyZamknięta
5. Liczba miejsc
6. IlośćPotwierdzonych
7. Akcje (`Usuń`)

- Kolumna `Liczba miejsc` stoi bezpośrednio przed `IlośćPotwierdzonych`, aby limit miejsc i licznik potwierdzeń były widoczne obok siebie.
- Pole `Liczba miejsc` jest tekstowe z sanityzacją do cyfr (bez wartości ujemnych), z podpowiedzią `brak limitu` przy pustej wartości.
- Tabela `Gry admina` **nie ma** kolumny `Liczba miejsc` — limit dotyczy wyłącznie gier użytkowników.

## Moduł Main — Gry admina
1. Rodzaj Gry
2. Data
3. Nazwa (pole + `Szczegóły`, a dla gier zaimportowanych dodatkowo `Aktualizuj z gry gracza` i data ostatniego odświeżenia)
4. CzyZamknięta
5. IlośćPotwierdzonych — wypełniana **tylko dla gier zaimportowanych**; dla gier założonych ręcznie komórka pozostaje pusta
6. Akcje (`Usuń`)

## Moduł Main — listy potwierdzeń
### Modal „Status potwierdzeń” (Gry admina, Gry użytkowników, widok gracza)
1. Nr
2. Gracz
3. Status

### Zakładka admina „Gry do potwierdzenia”
1. Nr
2. Gracz
3. Status
4. Akcje (`Potwierdź`, `Anuluj`)

### Modal „Szczegóły” w zakładce gracza „Gry do Potwierdzenia” — sekcja „Kolejność potwierdzeń”
1. Nr
2. Gracz
3. Status (`W grze` / `Lista rezerwowa` / `Potwierdzony` / `Niepotwierdzony`)

- Kolumna `Nr` używa tokenu `--col-num-xs` i jest wyrównana do środka.
- Potwierdzeni są na górze w kolejności potwierdzania, niepotwierdzeni pod spodem w kolejności dopisania do gry i z pustą komórką `Nr`.

## Main — kolumny nowych tabel kalkulatora
- Zakładka `Organizacja`:
  - `TABELA1`: `KALKULATOR | ORGANIZACJA | POT`.
  - `TABELA2`: `<dynamiczny nagłówek = wartość ORGANIZACJA> | PODZIAŁ | AKCJE`.
  - `TABELA2`: przycisk `Dodaj` jest pod tabelą po lewej, a `Usuń` jest po prawej stronie w każdym wierszu (kolumna `AKCJE`).
- Zakładki `Żetony ...`:
  - `TABELAA`: `NOMINAŁ | SZTUK | STACK | AKCJE`.
  - `TABELAA`: przycisk `Dodaj` jest pod tabelą po lewej, a `Usuń` jest po prawej stronie każdego wiersza w kolumnie `AKCJE`.
  - `TABELAA`: `Łącznie Stack` nie jest osobnym wierszem tabeli — jest prezentowane jako tekst pod tabelą.
  - `TABELAB`: `L.GRACZY | STACK GRACZA | ŁĄCZNY STACK`.
  - `TABELAC`: `POZOSTAŁE ŻETONY | NOMINAŁ | SZTUK | SUMA | DLA WSZYSTKICH W SZT.`.
