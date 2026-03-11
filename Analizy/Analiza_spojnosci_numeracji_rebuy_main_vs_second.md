# Analiza spójności numeracji kolumn Rebuy między modułami Main i Second

## Prompt użytkownika
"Przeczytaj i zaktualizuj analizę: Analizy/Analiza_spojnosci_numeracji_rebuy_main_vs_second.md

Napisz mi jak w module Main a jak w module Second by się nazywały kolumny \"Rebuy\" na każdym z etapów scenariusza:

1. Gracz1 - otwieram modal \"Rebuy Gracza\"
2. Gracz1 - Uzupełniam pierwszą kolumnę Rebuy
3. Gracz1 - Dodaję dwie kolejne kolumny Rebuy
4. Gracz2 - otwieram modal \"Rebuy Gracza\"
4. Gracz2 - Dodaję trzy kolumny Rebuy
5. Gracz1 - otwieram modal \"Rebuy Gracza\"
6. Gracz1 - usuwam ostatnią kolumnę \"Rebuy\"
7. Gracz2 - otwieram modal \"Rebuy Gracza\"
8. Gracz2 - usuwam dwie kolumny \"Rebuy\"
9. Gracz2 - dodaję jedną kolumnę \"Rebuy\"
10. Gracz1 - dodaję jedną kolumnę \"Rebuy\"

Dodatkowo przeprowadź pełną analizę kodu obu modułów.
Działaniem oczekiwanym jest, żeby po otworzeniu modal \"Rebuy Gracza\" nie wyświetlała się żadna kolumna. Dopiero kliknięcie \"Dodaj rebuy\" ma skutkować pojawieniem się kolumny. Sprawdź czy tak to działa i czy wprowadzenie takiej zmiany spowoduje jakieś problemy w innych miejscach aplikacji (np. jest jakaś kolumna, która liczy ilość Rebuy)."

---

## Zakres analizy
- Main:
  - modal `Rebuy gracza` w kalkulatorze (`openRebuyModal` / `renderRebuyModal`)
  - modal `Rebuy gracza` w szczegółach gry (`openDetailRebuyModal` / `renderDetailRebuyModal`)
- Second:
  - modal `Rebuy gracza` dla tabeli 12 (`openTable12RebuyModal` / `renderTable12RebuyModal`)
- Wpływ na pozostałe obliczenia (sumy Rebuy, licznik Rebuy, tabele wynikowe).

## Kluczowe ustalenia z kodu

### Main — kalkulator
- Nazwy kolumn są liczone globalnie względem wcześniejszych graczy: `Rebuy${rowGlobalOffset + index + 1}`.
- `rowGlobalOffset` to suma długości tablic `rebuys` poprzednich wierszy (`getRowRebuyGlobalOffset`).
- Po otwarciu modala dla gracza bez `rebuys` nie renderuje się żadna kolumna (pusta tabela nagłówka i brak inputów).

### Main — szczegóły gry
- Nazwy kolumn są liczone lokalnie per gracz na podstawie `rebuyIndexes`.
- Po otwarciu modala dla gracza bez `rebuys` i bez legacy `rebuy` również nie renderuje się żadna kolumna.

### Second — tabela 12
- Nazwy kolumn są liczone globalnie względem wcześniejszych graczy: `Rebuy${rebuyOffset + index + 1}`.
- `rebuyOffset` to suma liczby rebuyów poprzednich graczy.
- Różnica względem Main: przy pustym `values` modal i tak renderuje jedną „tymczasową” kolumnę przez `(state.values.length ? state.values : [""])`, więc użytkownik widzi `Rebuy{offset+1}` od razu po otwarciu.

## Odpowiedź na scenariusz (Main vs Second)

Założenia:
- `Gracz1` jest przed `Gracz2` w kolejności tabeli.
- Stan startowy: obaj gracze mają 0 rebuy.
- W kroku 2 „uzupełniam pierwszą kolumnę” oznacza, że kolumna już istnieje (w Main i po zmianie w Second trzeba ją najpierw dodać przyciskiem „Dodaj Rebuy”).
- Sekcja pokazuje stan **po wykonaniu danego kroku**.

### Main (kalkulator)
1. **Gracz1 otwiera modal „Rebuy gracza”**  
   Gracz1: brak kolumn  
   Gracz2: brak kolumn

2. **Gracz1 uzupełnia pierwszą kolumnę Rebuy** (po wcześniejszym dodaniu)  
   Gracz1: `Rebuy1`  
   Gracz2: brak kolumn

3. **Gracz1 dodaje dwie kolejne kolumny Rebuy**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: brak kolumn

4. **Gracz2 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: brak kolumn

5. **Gracz2 dodaje trzy kolumny Rebuy**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: `Rebuy4, Rebuy5, Rebuy6`

6. **Gracz1 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: `Rebuy4, Rebuy5, Rebuy6`

7. **Gracz1 usuwa ostatnią kolumnę „Rebuy”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3, Rebuy4, Rebuy5`

8. **Gracz2 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3, Rebuy4, Rebuy5`

9. **Gracz2 usuwa dwie kolumny „Rebuy”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3`

10. **Gracz2 dodaje jedną kolumnę „Rebuy”**  
    Gracz1: `Rebuy1, Rebuy2`  
    Gracz2: `Rebuy3, Rebuy4`

11. **Gracz1 dodaje jedną kolumnę „Rebuy”**  
    Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
    Gracz2: `Rebuy4, Rebuy5`

### Second (tabela 12)
1. **Gracz1 otwiera modal „Rebuy gracza”**  
   Gracz1: brak kolumn  
   Gracz2: brak kolumn

2. **Gracz1 uzupełnia pierwszą kolumnę Rebuy** (po wcześniejszym dodaniu)  
   Gracz1: `Rebuy1`  
   Gracz2: brak kolumn

3. **Gracz1 dodaje dwie kolejne kolumny Rebuy**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: brak kolumn

4. **Gracz2 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: brak kolumn

5. **Gracz2 dodaje trzy kolumny Rebuy**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: `Rebuy4, Rebuy5, Rebuy6`

6. **Gracz1 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
   Gracz2: `Rebuy4, Rebuy5, Rebuy6`

7. **Gracz1 usuwa ostatnią kolumnę „Rebuy”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3, Rebuy4, Rebuy5`

8. **Gracz2 otwiera modal „Rebuy gracza”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3, Rebuy4, Rebuy5`

9. **Gracz2 usuwa dwie kolumny „Rebuy”**  
   Gracz1: `Rebuy1, Rebuy2`  
   Gracz2: `Rebuy3`

10. **Gracz2 dodaje jedną kolumnę „Rebuy”**  
    Gracz1: `Rebuy1, Rebuy2`  
    Gracz2: `Rebuy3, Rebuy4`

11. **Gracz1 dodaje jedną kolumnę „Rebuy”**  
    Gracz1: `Rebuy1, Rebuy2, Rebuy3`  
    Gracz2: `Rebuy4, Rebuy5`

Uwaga: numeracja Gracza2 „przesuwa się” po zmianach Gracza1, bo jest globalna (offset), nie lokalna.

## Czy oczekiwane działanie („po otwarciu modala brak kolumn”) jest spełnione?
- Main (kalkulator): **TAK**.
- Main (szczegóły gry): **TAK**.
- Second (tabela 12): **TAK (po wdrożonej zmianie)** — po otwarciu pustego modala nie jest renderowana żadna kolumna.

## Czy zmiana w Second na „brak kolumn po otwarciu” może coś zepsuć?

### Wniosek
Zmiana jest **bezpieczna** dla obliczeń i liczników, bo logika metryk działa na rzeczywistej tablicy `values`, a nie na tymczasowej kolumnie renderowanej tylko w UI.

### Uzasadnienie
- Suma rebuy gracza (`getPlayerRebuyTotal`) liczy tylko `values`.
- Globalne metryki (`allRebuyValues`, `rebuyCount`, `rebuyTotal`) zbierają dane z `values` i ignorują puste pozycje.
- Tabele zależne (10/11/13/19 itd.) czytają wartości z tych metryk.

To oznacza, że usunięcie „sztucznego” renderowania `[""]` w `renderTable12RebuyModal` zmienia UX zgodnie z oczekiwaniem, bez zmiany matematyki raportów.

## Zaimplementowana zmiana (Second)
W `renderTable12RebuyModal` zamieniono renderowanie:
- z: `(state.values.length ? state.values : [""])`
- na: `state.values`

Efekt:
- po otwarciu pustego modala: brak kolumn,
- po kliknięciu „Dodaj Rebuy”: pojawia się pierwsza kolumna.
