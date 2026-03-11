# Analiza spójności numeracji kolumn Rebuy między modułami Main i Second

## Prompt użytkownika
"Sprawdź czy w module \"Second\" logika nazywania kolumn \"Rebuy1\", \"Rebuy2\" itd. jest spójna z logiką z modułu Main z zakładki Kalkulator.
Numeracja powinna działać w Second tak samo jak w Main w przypadku jak jakiemuś graczowi dodam kolumnę Rebuy, potem innemu graczowi a następnie pierwszemu skasuję."

## Zakres analizy
- Porównanie implementacji numerowania kolumn Rebuy w:
  - `Main/app.js` (zakładka Kalkulator, modal Rebuy w szczegółach gry)
  - `Second/app.js` (modal Rebuy dla tabeli 12)

## Ustalenia

### 1) Logika numeracji w Main
W module Main numeracja Rebuy jest utrzymywana **per gracz/per wiersz** na bazie tablic `rebuyIndexes` i `rebuys`:
- nagłówki są renderowane jako `Rebuy${columnIndex}` na podstawie `rowRebuyState.indexes`,
- przy dodaniu nowego Rebuy dla gracza dopisywany jest kolejny indeks do `rowRebuyState.indexes`.

W praktyce numeracja jest lokalna dla danego gracza (nie zależy od innych graczy).

### 2) Logika numeracji w Second
W module Second numeracja jest wyliczana przez `rebuyOffset`, który sumuje liczbę rebuyów wszystkich graczy znajdujących się wcześniej na liście (`previousRows`).
Nagłówek używa `Rebuy${rebuyOffset + index + 1}`.

To powoduje numerację **globalną względem kolejności graczy**, a nie lokalną dla konkretnego gracza.

### 3) Weryfikacja scenariusza z promptu
Scenariusz:
1. Dodać Rebuy graczowi A,
2. Dodać Rebuy graczowi B,
3. Skasować Rebuy graczowi A.

Efekt:
- **Main**: gracz B ma numerację lokalną (zaczyna od `Rebuy1`) i nie jest zależna od gracza A.
- **Second**: gdy A ma Rebuy, u B pojawi się przesunięcie (np. `Rebuy2`), bo działa `rebuyOffset`.

## Wniosek
Logika numeracji Rebuy w module **Second nie jest spójna** z logiką modułu **Main** (Kalkulator) dla opisanego scenariusza.

## Rekomendacja
Aby uzyskać zgodność z Main, w Second numeracja nagłówków powinna być liczona lokalnie dla aktywnego gracza (np. `Rebuy1`, `Rebuy2`, ... na podstawie własnej tablicy wartości), bez `rebuyOffset` zależnego od innych graczy.
