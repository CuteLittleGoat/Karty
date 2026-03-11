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
- W kroku 2 „uzupełniam pierwszą kolumnę” oznacza, że kolumna już istnieje (w Main trzeba ją najpierw dodać przyciskiem „Dodaj Rebuy”).

| Krok | Main (kalkulator) | Second (tabela 12) |
|---|---|---|
| 1. Gracz1 otwiera modal | brak kolumn | `Rebuy1` (kolumna tymczasowa) |
| 2. Gracz1 uzupełnia 1. kolumnę | `Rebuy1` | `Rebuy1` |
| 3. Gracz1 dodaje 2 kolumny | `Rebuy1, Rebuy2, Rebuy3` | `Rebuy1, Rebuy2, Rebuy3` |
| 4. Gracz2 otwiera modal | brak kolumn | `Rebuy4` (bo offset = 3) |
| 5. Gracz2 dodaje 3 kolumny | `Rebuy4, Rebuy5, Rebuy6` | `Rebuy4, Rebuy5, Rebuy6` |
| 6. Gracz1 otwiera modal | `Rebuy1, Rebuy2, Rebuy3` | `Rebuy1, Rebuy2, Rebuy3` |
| 7. Gracz1 usuwa ostatnią | `Rebuy1, Rebuy2` | `Rebuy1, Rebuy2` |
| 8. Gracz2 otwiera modal | `Rebuy3, Rebuy4, Rebuy5` | `Rebuy3, Rebuy4, Rebuy5` |
| 9. Gracz2 usuwa 2 kolumny | `Rebuy3` | `Rebuy3` |
| 10. Gracz2 dodaje 1 kolumnę | `Rebuy3, Rebuy4` | `Rebuy3, Rebuy4` |
| 11. Gracz1 dodaje 1 kolumnę | `Rebuy1, Rebuy2, Rebuy3` | `Rebuy1, Rebuy2, Rebuy3` |

Uwaga: numeracja Gracza2 „przesuwa się” po zmianach Gracza1, bo jest globalna (offset), nie lokalna.

## Czy oczekiwane działanie („po otwarciu modala brak kolumn”) jest spełnione?
- Main (kalkulator): **TAK**.
- Main (szczegóły gry): **TAK**.
- Second (tabela 12): **NIE** — obecnie pokazywana jest jedna kolumna od razu po otwarciu.

## Czy zmiana w Second na „brak kolumn po otwarciu” może coś zepsuć?

### Wniosek
Zmiana jest **bezpieczna** dla obliczeń i liczników, bo logika metryk działa na rzeczywistej tablicy `values`, a nie na tymczasowej kolumnie renderowanej tylko w UI.

### Uzasadnienie
- Suma rebuy gracza (`getPlayerRebuyTotal`) liczy tylko `values`.
- Globalne metryki (`allRebuyValues`, `rebuyCount`, `rebuyTotal`) zbierają dane z `values` i ignorują puste pozycje.
- Tabele zależne (10/11/13/19 itd.) czytają wartości z tych metryk.

To oznacza, że usunięcie „sztucznego” renderowania `[""]` w `renderTable12RebuyModal` zmieni UX zgodnie z oczekiwaniem, bez zmiany matematyki raportów.

## Rekomendacja implementacyjna (Second)
W `renderTable12RebuyModal` zamienić renderowanie:
- z: `(state.values.length ? state.values : [""])`
- na: `state.values`

Efekt:
- po otwarciu pustego modala: brak kolumn,
- po kliknięciu „Dodaj Rebuy”: pojawia się pierwsza kolumna.
