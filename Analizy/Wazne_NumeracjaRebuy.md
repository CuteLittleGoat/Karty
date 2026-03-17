# Analiza zmiany zasady numeracji kolumn "Rebuy" (Main + Second)

## Prompt użytkownika
"Przeczytaj analizę: Analizy/Analiza_spojnosci_numeracji_rebuy_main_vs_second.md

Zarówno w module Main jak i Second trzeba będzie zmienić zasadę numeracji kolumn \"Rebuy\".
Poniżej załączam przykłady jakie kroki wykonuje użytkownik i jaki efekt numeracji kolumn bym chciał osiągnąć.

Krok1:
Stan początkowy, otwieram modal u Gracz1
Gracz1: brak kolumn
Gracz2: brak kolumn
Gracz3: brak kolumn

Krok2:
Klikam 2x \"Dodaj Rebuy\" u Gracz1
Gracz1: Rebuy1, Rebuy2
Gracz2: brak kolumn
Gracz3: brak kolumn

Krok3:
Klikam \"Dodaj Rebuy\" u Gracz2
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3
Gracz3: brak kolumn

Krok3:
Klikam 2x \"Dodaj Rebuy\" u Gracz3
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3
Gracz3: Rebuy4, Rebuy5

Krok4:
Usuwam kolumnę \"Rebuy\" u Gracz3
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3
Gracz3: Rebuy4

Krok5:
Klikam \"Dodaj Rebuy\" u Gracz1
Gracz1: Rebuy1, Rebuy2, Rebuy5
Gracz2: Rebuy3
Gracz3: Rebuy4

Krok6:
Klikam 2x \"Dodaj Rebuy\" u Gracz2
Gracz1: Rebuy1, Rebuy2, Rebuy5
Gracz2: Rebuy3, Rebuy6, Rebuy7
Gracz3: Rebuy4

Krok7:
Usuwam kolumnę \"Rebuy\" u Gracz3
Gracz1: Rebuy1, Rebuy2, Rebuy4
Gracz2: Rebuy3, Rebuy5, Rebuy6
Gracz3: brak kolumn

Krok8:
Usuwam kolumnę \"Rebuy\" u Gracz1
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3, Rebuy4, Rebuy5
Gracz3: brak kolumn

Krok9:
Dodaję kolumnę \"Rebuy\" u Gracz3
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3, Rebuy4, Rebuy5
Gracz3: Rebuy6

Krok10:
Dodaję kolumnę \"Rebuy\" u Gracz1
Gracz1: Rebuy1, Rebuy2, Rebuy7
Gracz2: Rebuy3, Rebuy4, Rebuy5
Gracz3: Rebuy6

Krok11:
Usuwam dwie kolumny u Gracz2
Gracz1: Rebuy1, Rebuy2, Rebuy5
Gracz2: Rebuy3
Gracz3: Rebuy4

Krok12:
Dodaję dwie kolumny u Gracz3
Gracz1: Rebuy1, Rebuy2, Rebuy5
Gracz2: Rebuy3
Gracz3: Rebuy4, Rebuy6, Rebuy7

Krok13:
Usuwam kolumnę u Gracz1
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3
Gracz3: Rebuy4, Rebuy5, Rebuy6

Krok14:
Dodaję dwie kolumny u Gracz2
Gracz1: Rebuy1, Rebuy2
Gracz2: Rebuy3, Rebuy7, Rebuy8
Gracz3: Rebuy4, Rebuy5, Rebuy6

Przeprowadź analizę czy taka zmiana wpłynie na inne elementy aplikacji (zarówno w module Main jak i Second). Zwłaszcza sprawdź jak zachowają się dynamicznie pojawiające się kolumny \"Rebuy1\", \"Rebuy2\" oraz algorytm przypisywania wartości w kolumnach \"RebuyX\" do konkretnych wierszy.
Sprawdź też jak się zachowa aplikacja jak dodam graczowi trzy kolumny \"Rebuy\" i je uzupełnię a następnie z jednej (nie będącej ostatnią) usunę wpisaną wcześniej wartość.
Proponowane zmiany w kodzie i pozostałe wnioski zapisz w pliku Analizy/NumeracjaRebuy.md"

---

## 1) Co oznacza nowa zasada numeracji z przykładu użytkownika

Na podstawie kroków 1–14 nowa reguła jest inna niż obecna implementacja:

1. **Dodanie kolumny**: nowa kolumna dostaje numer `maxAktualnyNumer + 1` (globalnie dla wszystkich graczy).
2. **Usunięcie kolumny**: usunięty numer znika, a wszystkie numery większe są przesuwane o `-1` (globalna kompaktacja bez luk).
3. **Numer jest własnością konkretnej kolumny**, nie pozycji gracza w tabeli.

To podejście wymaga utrzymywania jawnego identyfikatora (indeksu) każdej kolumny `Rebuy`.

## 2) Stan obecny w kodzie

## Main (kalkulator)
- Modal rebuy używa `row.rebuys` (sama lista wartości), bez trwałych identyfikatorów kolumn.
- Nagłówki liczone są jako `Rebuy${rowGlobalOffset + index + 1}`.
- `rowGlobalOffset` to suma **długości** rebuyów poprzednich graczy.
- Dodanie rebuy: `row.rebuys.push("")`.
- Usunięcie rebuy: `row.rebuys.pop()` (zawsze ostatnia kolumna danego gracza).

Wniosek: numeracja jest pochodną bieżących długości tablic i kolejności graczy, a nie historii tworzenia konkretnych kolumn.

## Main (szczegóły gry)
- Tu już istnieje model indeksów: `rebuys` + `rebuyIndexes`.
- Dodawanie dopisuje `nextIndex`.
- Usuwanie usuwa ostatni element `values` i odpowiadający indeks.

Wniosek: ten fragment jest bliższy docelowemu modelowi, ale działa lokalnie dla jednego gracza (nie globalnie przez wszystkich graczy jak w scenariuszu).

## Second (Tabela 12)
- Modal rebuy używa `state.values` bez indeksów kolumn.
- Nagłówki liczone są jako `Rebuy${rebuyOffset + index + 1}`.
- `rebuyOffset` to suma długości rebuyów wcześniejszych graczy.
- Dodanie: `values.push('')`.
- Usunięcie: `values = values.slice(0, -1)`.

Wniosek: analogicznie jak Main-kalkulator — numeracja jest dynamiczna od pozycji i długości, bez trwałych ID kolumn.

## 3) Różnice względem oczekiwanego scenariusza

Najważniejsza różnica pojawia się np. w Twoim Kroku 5:
- Oczekiwane: `Gracz1: Rebuy1, Rebuy2, Rebuy5`.
- Obecny kod (Main-kalkulator i Second): po dodaniu u wcześniejszego gracza numeracja przebuduje się wg offsetów i da `Rebuy1, Rebuy2, Rebuy3`, a dalszym graczom numery też się przesuną.

Czyli obecny mechanizm **nie zachowuje tożsamości kolumny** (`Rebuy5`), tylko stale przelicza etykiety od zera.

## 4) Wpływ na inne elementy aplikacji

## 4.1 Main — Tabela5 i rozdział wartości Rebuy
W Main wartości rebuy są spłaszczane po kolejności wierszy (`flatMap` po `row.rebuys`) i dopiero potem rozdzielane na kolumny `Rebuy1..N` w Tabeli5.

Konsekwencja po wdrożeniu nowej zasady:
- jeśli pozostanie obecny algorytm `flatMap`, to kolumny w Tabeli5 będą dostawać wartości wg kolejności graczy, a nie wg globalnego numeru `RebuyX`;
- przy układzie typu `Gracz1: [1,2,5], Gracz2:[3], Gracz3:[4]` wartości trafią do kolumn w złej semantyce numeru.

**Wniosek:** Tabela5 wymaga przejścia z „kolejności tablic” na „sortowanie po globalnym indeksie kolumny”.

## 4.2 Second — Tabela16 i `pool.rebuyValues`
W Second `allRebuyValues` powstaje przez iterację graczy i ich `values`, bez indeksów kolumn. Na tym budowana jest dynamiczna liczba kolumn w Tabeli16, dodatkowo istnieją ręczne nadpisania `pool.rebuyValues[row.id][colIndex]` oparte na pozycji kolumny.

Konsekwencja po wdrożeniu nowej zasady:
- jeżeli indeks kolumny będzie miał znaczenie biznesowe (`RebuyX`), samo „pozycja w tablicy” przestaje wystarczać;
- przy usuwaniu kolumn i kompaktacji trzeba przewidzieć migrację/aktualizację `pool.rebuyValues` (przenumerowanie kluczy kolumn > usunięta).

**Wniosek:** bez zmian w mapowaniu `colIndex` można uzyskać przesunięcie danych ręcznie wpisywanych do Tabeli16.

## 4.3 Liczniki i sumy (Main + Second)
- Sumy rebuy (per gracz i globalnie) są liczone z wartości numerycznych; same etykiety `RebuyX` nie wpływają na arytmetykę.
- Licznik rebuy (`rebuyCount`) liczy niepuste wpisy.

**Wniosek:** same podsumowania kwotowe zwykle pozostaną poprawne, ale semantyka „która wartość jest Rebuy3/Rebuy4” może się rozjechać bez przejścia na trwałe indeksy kolumn.

## 5) Przypadek: 3 kolumny u gracza, wypełnione; wyczyszczenie wartości w kolumnie środkowej

Zakładamy stan: `Rebuy1=100`, `Rebuy2=200`, `Rebuy3=300` i użytkownik czyści wartość w `Rebuy2` (nie usuwa kolumny przyciskiem „Usuń Rebuy”).

## Obecne zachowanie
- W modalu kolumna pozostaje, ale jej wartość staje się pusta (`""`).
- Suma rebuy gracza spada o tę wartość (działa poprawnie).
- W Main Tabela5 liczba kolumn liczona jest po **niepustych** rebuyach; pusta kolumna może zniknąć z widocznej puli i przesunąć mapowanie kolejnych wartości.
- W Second `allRebuyValues` także pomija puste wpisy, więc „dziura” w środku nie jest zachowana jako pusta pozycja globalna.

## Ryzyko
Jeśli po wdrożeniu nowej reguły numer `RebuyX` ma być stabilnym identyfikatorem, to samo czyszczenie wartości nie może powodować utraty tożsamości kolumny w algorytmach downstream (Tabela5/Tabela16). Trzeba rozdzielić:
- **istnienie kolumny** (indeks),
- **wartość kolumny** (może być pusta/0).

## 6) Proponowane zmiany techniczne

## 6.1 Wspólny model danych (Main-kalkulator + Second)
Dla każdego gracza przechowywać nie tylko wartości, ale też indeksy globalne, np.:

```json
{
  "rebuys": ["100", "", "300"],
  "rebuyIndexes": [1, 2, 3]
}
```

Zasady:
1. **Add**: wyznacz globalny `nextIndex = max(rebuyIndexes wszystkich graczy) + 1`, dopisz `""` i `nextIndex`.
2. **Remove** (przycisk): usuwasz ostatnią parę `(value,index)` wybranego gracza; następnie kompaktujesz globalnie wszystkie indeksy `> usuniętyIndex` o `-1`.
3. **Render nagłówków**: zawsze z `rebuyIndexes`, nie z offsetów.
4. **Agregacje do tabel**: operować na parach `(index, value)`, sortować po `index`, a nie po kolejności graczy.

## 6.2 Main — konkretne miejsca do zmiany
- Modal kalkulatora: zastąpić offsetową numerację modelem indeksów (analogicznie do tego, co już działa w sekcji szczegółów gry).
- `getVisibleGlobalRebuyValues` i logika Tabeli5: przejść na listę globalną sortowaną po indeksach.
- Miejsca liczące ilość kolumn Rebuy (`rebuyColumnsCount`) mają bazować na liczbie istniejących indeksów (lub liczbie niepustych wg wymagań), ale mapowanie musi używać indeksów, nie pozycji `flatMap`.

## 6.3 Second — konkretne miejsca do zmiany
- `payments.table12Rebuys[playerId]` rozszerzyć z `{ values: [] }` do `{ values: [], indexes: [] }`.
- `renderTable12RebuyModal`: nagłówki z `indexes`, nie z `rebuyOffset + index + 1`.
- Add/Remove w modalu: analogicznie jak wyżej, z globalnym `nextIndex` i kompaktacją po usunięciu.
- Budowa `allRebuyValues` dla Tabel 10/11/13/16: iterować po parach `(index,value)` i sortować po `index`.
- `pool.rebuyValues` (ręczne nadpisania kolumn): dodać bezpieczne przenumerowanie kluczy `colIndex` po kompaktacji, aby nie zgubić powiązań danych.

## 6.4 Migracja danych historycznych
Potrzebna jednorazowa normalizacja:
- dla rekordów mających tylko `values/rebuys` utworzyć `indexes` jako `1..N` w kolejności bieżącej,
- następnie już zawsze utrzymywać oba pola równolegle.

## 7) Podsumowanie ryzyk

1. **Bez zmiany modelu danych** nie da się osiągnąć scenariusza z kroków 1–14 w sposób stabilny.
2. **Main Tabela5** oraz **Second Tabela16/pool.rebuyValues** to główne miejsca podatne na błędne przypisanie wartości do numeru `RebuyX`.
3. Sama arytmetyka sum zwykle pozostanie poprawna, ale semantyczne przypisanie „która wartość to RebuyX” będzie niepoprawne.

## 8) Rekomendacja wdrożeniowa

Wdrożyć zmianę dwuetapowo:
1. **Etap A (model + modal)**: dodać `rebuyIndexes`, zmienić Add/Remove/Render w Main-kalkulator i Second.
2. **Etap B (agregacje)**: przepiąć Tabelę5 (Main) oraz allRebuyValues + Tabela16/pool (Second) na indeksy globalne.

Dopiero po obu etapach numeracja i przypisanie wartości do `RebuyX` będą spójne z oczekiwanym scenariuszem.

## 9) Zrealizowana poprawka — dokładny opis zmian (stan przed/po)

### 9.1 Main/app.js

#### A) Model danych kalkulatora (Tournament + Cash)
**Przed zmianą:**
- Wiersze kalkulatora przechowywały tylko `rebuys: []`.
- Brak trwałego mapowania numeru `RebuyX` do konkretnej kolumny.

**Po zmianie:**
- Wiersze przechowują parę: `rebuys: []` oraz `rebuyIndexes: []`.
- Dotyczy to:
  - stanu początkowego (`createInitialState.table2Rows`),
  - stanu początkowego cash (`createInitialCashState.table9Rows`),
  - nowych wierszy dodawanych przyciskiem `Dodaj`,
  - fallbacku po usunięciu ostatniego wiersza.

#### B) Normalizacja i serializacja stanu
**Przed zmianą:**
- Przy odczycie/zapisie normalizowane były tylko `rebuys`.
- Dane historyczne bez indeksów nie miały osobnego mechanizmu migracji.

**Po zmianie:**
- Dodano `normalizeRebuyIndexes(rawIndexes, valuesLength)`.
- Przy odczycie (`normalizeCalculatorModeState`) oraz zapisie (`serializeCalculatorModeState`) utrzymywane są zarówno `rebuys`, jak i `rebuyIndexes`.
- Dla starych rekordów bez indeksów tworzona jest domyślna numeracja `1..N`.

#### C) Algorytm globalnej numeracji i kompaktacji
**Przed zmianą:**
- Numeracja w modalu była liczona offsetowo: `rowGlobalOffset + index + 1`.
- Dodanie: `row.rebuys.push("")`.
- Usunięcie: `row.rebuys.pop()`.
- Brak globalnej kompaktacji po usunięciu.

**Po zmianie:**
- Dodano funkcje:
  - `ensureRowRebuyIndexes`,
  - `ensureModeRebuyIndexes`,
  - `getAllRebuyEntriesForMode`,
  - `getNextGlobalRebuyIndex`,
  - `compactRebuyIndexesAfterRemoval`.
- Dodanie rebuy:
  - wylicza `nextIndex = max(globalnych indeksów) + 1`,
  - dopisuje jednocześnie `rebuys.push("")` i `rebuyIndexes.push(nextIndex)`.
- Usunięcie rebuy:
  - usuwa parę `(wartość, indeks)` z końca wybranego gracza,
  - globalnie przesuwa wszystkie indeksy większe od usuniętego o `-1`.

#### D) Render modala rebuy
**Przed zmianą:**
- Nagłówki w modalu: `Rebuy${rowGlobalOffset + index + 1}`.

**Po zmianie:**
- Nagłówki w modalu: `Rebuy${row.rebuyIndexes[index]}`.
- Numeracja jest oparta o trwałe indeksy kolumn, a nie o offset długości tablic.

#### E) Tabela5 (mapowanie globalnych rebuy)
**Przed zmianą:**
- `getVisibleGlobalRebuyValues` brało dane przez `flatMap(row.rebuys)`.
- Kolejność wynikała z układu graczy i pozycji w tablicach.
- `rebuyColumnsCount` liczony był przez sumę niepustych `rebuys` per wiersz.

**Po zmianie:**
- `getVisibleGlobalRebuyValues` korzysta z globalnej listy wpisów sortowanej po `rebuyIndexes`.
- `rebuyColumnsCount` liczone jest z tej samej globalnej listy (po niepustych wartościach).
- Dzięki temu kolumny `RebuyX` w Tabela5 odpowiadają numerom globalnym po kompaktacji.

---

### 9.2 Second/app.js

#### A) Model danych `payments.table12Rebuys`
**Przed zmianą:**
- Stan per gracz: `{ values: [] }`.
- Brak trwałych indeksów kolumn.

**Po zmianie:**
- Stan per gracz: `{ values: [], indexes: [] }`.
- Dodano normalizację dla danych historycznych:
  - `normalizeTournamentState` uzupełnia brakujące `indexes` do `1..N`,
  - `ensureTable12RebuyEntryShape` pilnuje spójności `values/indexes`.

#### B) Modal Tabela12 Rebuy
**Przed zmianą:**
- Nagłówki liczone offsetowo: `rebuyOffset + index + 1`.
- Dodanie: `values.push('')`.
- Usunięcie: `values = values.slice(0, -1)`.

**Po zmianie:**
- Nagłówki renderowane z trwałych indeksów: `indexes[index]`.
- Dodanie:
  - `nextIndex = max(globalnych indeksów) + 1`,
  - `values.push('')` i `indexes.push(nextIndex)`.
- Usunięcie:
  - usuwa ostatnią parę `(value, index)` u gracza,
  - globalnie kompaktuje indeksy we wszystkich `table12Rebuys`.

#### C) Agregacja rebuy do obliczeń
**Przed zmianą:**
- `allRebuyValues` tworzone z iteracji po graczach i `values`, bez indeksów.

**Po zmianie:**
- Dodano `getAllTable12RebuyEntries(groupedRows)`:
  - zbiera pary `(index, value)` ze wszystkich graczy,
  - sortuje globalnie po `index`.
- `allRebuyValues` budowane jest z tej posortowanej listy.

#### D) Spójność `pool.rebuyValues` (Tabela16) po usunięciu
**Przed zmianą:**
- Przy usunięciu rebuy brak przenumerowania ręcznych nadpisań `pool.rebuyValues`.
- Ryzyko przesunięcia danych względem `RebuyX`.

**Po zmianie:**
- Dodano `remapPoolRebuyValuesAfterRemoval(removedIndex)`.
- Po globalnej kompaktacji rebuy wykonywane jest przenumerowanie kluczy kolumn (`colIndex`) w `pool.rebuyValues`, aby zachować zgodność ręcznych wpisów z aktualną numeracją `RebuyX`.

---

### 9.3 Main/docs/README.md

**Przed zmianą:**
- Sekcja modala rebuy nie opisywała globalnej numeracji i kompaktacji w kalkulatorze.

**Po zmianie:**
- Dodano opis, że numeracja `RebuyX` w kalkulatorze jest globalna w obrębie aktywnego trybu.
- Dodano opis globalnej kompaktacji numerów po usunięciu kolumny.

### 9.4 Main/docs/Documentation.md

**Przed zmianą:**
- Brak szczegółowego opisu, że kalkulator używa `rebuyIndexes` globalnie i że Tabela5 mapuje po indeksach.

**Po zmianie:**
- Dodano opis modelu `rebuys[] + rebuyIndexes[]` w kalkulatorze.
- Dodano opis globalnego `max+1` przy dodawaniu, kompaktacji po usunięciu oraz mapowania Tabela5 po posortowanych indeksach.

### 9.5 Second/docs/README.md

**Przed zmianą:**
- Instrukcja Wpłat opisywała modal rebuy bez informacji o globalnym `nextIndex` i kompaktacji.

**Po zmianie:**
- Dodano kroki opisujące:
  - globalną numerację `RebuyX` dla całej Tabela12,
  - kompaktację globalną po usunięciu kolumny.

### 9.6 Second/docs/Documentation.md

**Przed zmianą:**
- Opis stanu i modala rebuy nie uwzględniał `indexes[]` ani przenumerowania `pool.rebuyValues`.

**Po zmianie:**
- Zaktualizowano model danych `payments.table12Rebuys` na `values[] + indexes[]`.
- Doprecyzowano, że numeracja nagłówków używa trwałych indeksów.
- Dodano opis globalnego `max+1`, kompaktacji i przenumerowania `pool.rebuyValues`.
