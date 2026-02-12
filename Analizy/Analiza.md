# Analiza działania pola „Wpisowe” w oknie „Szczegóły gry” (wersja nietechniczna)

## Prompt użytkownika
> „Przeczytaj plik Analizy/analiza_wpisowe_szczegoly_gry_2026-02-12.md i utwórz nowy o nazwie "Analiza.md" w "Analizy"
> Zawrzyj w nim dokładnie te same dane, ale nie używaj technicznego języka i opieraj się na nazwach kolumn z UI a nie nazwach z kodu aplikacji.
> Tak, żeby użytkownik nie mający pojęcia o programowaniu mógł przeczytać i zrozumieć.”

## Co zostało przeanalizowane
Ta analiza opisuje, co dzieje się po wpisaniu wartości w kolumnie **„Wpisowe”** w oknie **„Szczegóły gry”** oraz jak to wpływa na:
- widoczność gracza w podsumowaniach,
- obliczanie puli gry,
- obliczanie wyniku gracza,
- statystyki i rankingi.

## Najważniejsze zasady (w języku użytkownika)
1. Wartość wpisana w polu **„Wpisowe”** jest najpierw „porządkowana” (np. usuwane są zbędne znaki), a dopiero potem zapisywana.
2. Przy liczeniu podsumowań aplikacja traktuje puste lub niepoprawne wpisy jak **0**.
3. Gracz jest liczony jako uczestnik gry tylko wtedy, gdy ma:
   - uzupełnioną nazwę gracza,
   - oraz **„Wpisowe” większe niż 0**.
4. Jeśli **„Wpisowe” = 0** albo pole jest puste, gracz nie bierze udziału w podsumowaniach i statystykach.
5. Wartości ujemne (np. -5) mogą zostać wpisane, ale i tak taki gracz nie jest liczony (bo warunek jest: **więcej niż 0**).

## Trzy najważniejsze przypadki

### 1) Gdy „Wpisowe” = 0
Skutek:
- gracz nie trafia do podsumowania gry,
- jego kwoty nie zwiększają puli,
- jego „Wypłata” nie zwiększa sumy wypłat,
- nie jest brany do statystyk rocznych i rankingów.

### 2) Gdy „Wpisowe” jest puste
Skutek jest **taki sam jak przy 0**:
- gracz jest pomijany w podsumowaniach,
- nie wpływa na pulę i wypłaty,
- nie wpływa na statystyki.

### 3) Gdy „Wpisowe” > 0
Wtedy gracz jest normalnie liczony:
- pojawia się w podsumowaniu gry,
- zwiększa pulę gry o: **Wpisowe + Rebuy**,
- jego „Wypłata” jest doliczana do sumy wypłat,
- liczony jest jego wynik: **Wypłata - (Wpisowe + Rebuy)**,
- liczony jest jego udział procentowy w puli,
- trafia do statystyk rocznych i rankingów.

## Pełna lista zachowań pola „Wpisowe” (praktyczne przykłady)

### A) Co aplikacja robi z tym, co wpiszesz
- Puste pole, same spacje, same litery, same znaki specjalne bez cyfr → finalnie traktowane jak puste.
- „0”, „000” → finalnie wartość 0.
- „50”, „ 50 ”, „5 0”, „5,0” → finalnie 50.
- „-” → pozostaje sam minus (traktowany dalej jak 0).
- „-5” → pozostaje -5.
- „- 5”, „-5abc” → finalnie -5.
- „12.5” → kropka jest usuwana, więc wychodzi 125.

### B) Jak aplikacja rozumie końcową wartość
- Puste pole i sam „-” są traktowane jak 0.
- Poprawne liczby dodatnie i ujemne są czytane jako liczby całkowite.

### C) Kiedy gracz jest brany do podsumowań i statystyk
Gracz jest liczony tylko jeśli:
- ma wpisaną nazwę,
- i ma **„Wpisowe” większe niż 0**.

## Wartości ujemne w „Wpisowe”

### Czy można wpisać i zapisać wartość ujemną?
Tak. Zarówno przy zwykłym wpisywaniu, jak i przy ustawianiu grupowym da się zapisać np. -5.

### Czy wartość ujemna bierze udział w obliczeniach?
Nie. Ponieważ liczony jest tylko gracz z „Wpisowe” > 0, wartość ujemna działa praktycznie tak samo jak 0 albo puste pole: gracz jest pomijany.

## Jakie obliczenia zależą od „Wpisowe”
Dla graczy, którzy spełnili warunek (**Wpisowe > 0**), liczone są:
1. **Pula gry** = suma wartości z kolumn **„Wpisowe” + „Rebuy”**.
2. **Suma wypłat** = suma kolumny **„Wypłata”**.
3. **Sprawdzenie zgodności** (ostrzeżenie), gdy suma wypłat nie zgadza się z pulą.
4. **Wynik gracza (+/-)** = **Wypłata - (Wpisowe + Rebuy)**.
5. **% puli dla gracza** = procent puli wynikający z jego „Wypłaty”.
6. **Statystyki roczne gracza**:
   - liczba obecności,
   - liczba gier mistrzowskich (jeśli zaznaczone),
   - suma punktów,
   - suma wyniku (+/-),
   - suma wypłat,
   - suma wpłat (**Wpisowe + Rebuy**),
   - łączna pula gier, w których grał.
7. **Wskaźniki procentowe** (frekwencja i udziały procentowe).

## Wniosek końcowy
Najważniejsza zasada działania aplikacji jest prosta:
- tylko gracz z **„Wpisowe” większym niż 0** jest traktowany jako faktyczny uczestnik gry i wpływa na wyniki,
- **0, puste pole i wartości ujemne** nie są brane do podsumowań ani statystyk.
