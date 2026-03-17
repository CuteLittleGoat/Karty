# Analiza: Second / Podział Puli / Tabela16 / kolumny RebuyX

## Prompt użytkownika
"Druga analiza ma dotyczyć kolumn "RebuyX" w Tabela16 w zakładce "Podział Puli"
Kolumny "Rebuy" od "Rebuy1" do "Rebuy30" miały mieć przypisane wartości do konkretnych wierszy. Zapisz mi cały ten algorytm.
Drugim elementem miało być, że kolumny od "Rebuy31" do ostatniego "Rebuy" miały się dopisać bez uzupełniania wierszy z możliwością edycji pól przez admina. Sprawdź czy ta funkcjonalność jest wprowadzona."

## Zakres analizy
- Moduł: `Second`
- Zakładka: `Podział Puli`
- Tabela: `Tabela16`
- Algorytm źródłowy: `Second/app.js`

## Wejście danych do Tabela16
1. System zbiera rebuy globalnie z Tabela12 przez `getAllTable12RebuyEntries()`.
2. Dane są sortowane po globalnym indeksie `index`.
3. Tworzona jest tablica `allRebuyValues` (tylko niepuste wartości, jako liczby).

## Podział na część „automatyczną” i „nadmiarową”
- `rebuyLimit = 30`
- `distributed = allRebuyValues.slice(0, 30)` → to jest materiał do automatycznego przypisania `Rebuy1..Rebuy30`.
- `overflow = allRebuyValues.slice(30).reduce(...)` → suma wartości od `Rebuy31` wzwyż.
- Liczba kolumn w Tabela16 to `rebuyColumns = distributed.length`.

Wniosek: Tabela16 generuje kolumny tylko do liczby elementów w `distributed` (max 30).

## Dokładny algorytm przypisania Rebuy1..Rebuy30 do wierszy

### 1) Mapa przypisania kolumna -> wiersz
W kodzie jest tablica:

`rebuyRowMapping = [
1,2,3,4,1,2,3,4,5,1,
2,3,4,5,6,1,2,3,4,5,
6,7,1,2,3,4,5,6,7,8
]`

Interpretacja:
- `Rebuy1` trafia do wiersza 1,
- `Rebuy2` do wiersza 2,
- ...
- `Rebuy30` do wiersza 8.

### 2) Wypełnianie macierzy Tabela16
1. Tworzona jest macierz `rebuyMatrix[wiersz][kolumna]` z pustymi stringami.
2. Dla każdej kolumny `colIdx` od 0 do `min(30, rebuyColumns)-1`:
   - pobierany jest docelowy wiersz z `rebuyRowMapping[colIdx] - 1`,
   - do tej komórki wpisywana jest wartość `distributed[colIdx]`.

### 3) Blokada edycji dla auto-przypisań
Przy renderze komórki:
- jeśli `rebuyNumber <= 30` oraz komórka jest tą wyznaczoną przez mapę, input dostaje `readonly`.
- pozostałe komórki w tej samej kolumnie są edytowalne.

To oznacza, że auto-przypisanie dla `Rebuy1..Rebuy30` istnieje i jest zablokowane przed edycją dokładnie w przypisanym wierszu.

## Co z Rebuy31+ (drugi wymagany element)

### Oczekiwane wymaganie
Kolumny `Rebuy31+` miały się pojawiać bez auto-uzupełniania wierszy, ale z możliwością ręcznej edycji przez admina.

### Stan faktyczny w kodzie
1. `rebuyColumns` jest równe `distributed.length`, a `distributed` to tylko pierwsze 30 elementów.
2. W praktyce liczba kolumn `REBUYx` w Tabela16 nigdy nie przekracza 30.
3. Kod obsługi wpisów ręcznych `pool.rebuyValues` dla `colIdx >= 30` istnieje, ale nie ma jak się wizualnie ujawnić, bo kolumny >30 nie są renderowane.

## Wniosek końcowy
- **Część 1 (Rebuy1..Rebuy30 z przypisaniem do konkretnych wierszy): wdrożona.**
- **Część 2 (dynamiczne kolumny Rebuy31+ bez auto-przypisań i z edycją): nie jest finalnie wdrożona w UI renderującym Tabela16**, mimo że są ślady przygotowania w logice zapisu/odczytu.

## Dodatkowa uwaga
Suma `overflow` jest liczona i pokazywana jako „Rebuy do rozdysponowania”, więc wartości Rebuy31+ są uwzględniane zbiorczo, ale nie jako osobne kolumny wejściowe do ręcznej dystrybucji per komórka.
