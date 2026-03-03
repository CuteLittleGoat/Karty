# Analiza modułu Main: niespójna klawiatura mobilna w polach numerycznych

## Prompt użytkownika
"Przeprowadź analizę modułu Main.
W wersji mobilnej niektóre pola zachowują się w nieoczekiwany sposób.
Przykładowo:
Gry użytkownika (możliwe, że tak samo w Gry admina - nie sprawdzałem).
Okno Rebuy gracza w Szczegóły Gry.
Jak w wersji mobilnej wpisuje tam jakieś wartości to w telefonie klawiatura przełącza się na numeryczną.
Za to pole \"Wpisowe\" w Szczegóły Gry przełącza się na zwykłą tekstową.
Sprawdź przyczynę i zaproponuj potencjalne rozwiązanie."

## Zakres sprawdzenia
- `Main/app.js` (render pól „Szczegóły Gry” dla Gry użytkowników i Gry admina, modal „Rebuy gracza”).
- `Main/index.html` (porównanie z polami, które jawnie wymuszają klawiaturę numeryczną, np. PIN).

## Ustalenia

1. **Pola numeryczne w „Szczegóły Gry” są tworzone jako `input.type = "text"`** (m.in. `entryFee`, `payout`, `points`) i nie dostają jawnego `inputMode`/`pattern`.
   - Dotyczy to wariantu dla Gry użytkowników oraz analogicznego wariantu dla Gry admina.

2. **Pola w modalu „Rebuy gracza” również są `type="text"` bez jawnego `inputMode`** (w obu wariantach).

3. **W aplikacji istnieją miejsca, gdzie numeryczna klawiatura jest wymuszana poprawnie** (np. PIN: `type="tel"` + `inputMode="numeric"` + `pattern`), co daje bardziej przewidywalne zachowanie na mobile.

## Przyczyna problemu
Brak jednolitego, jawnego wskazania „to jest pole numeryczne” dla pól `Wpisowe`/`Rebuy`/`Wypłata`/`Punkty` w „Szczegóły Gry”.

Przy `type="text"` bez `inputMode` dobór klawiatury pozostaje po stronie heurystyk systemu/przeglądarki, więc może być niespójny między polami i urządzeniami (jedno pole pokaże numeryczną, inne tekstową).

## Potencjalne rozwiązanie (rekomendowane)

### Wariant A (zalecany)
Dla wszystkich pól liczbowych w „Szczegóły Gry” i modalu „Rebuy gracza” ustawić spójnie:
- `input.type = "text"` (zostaje jak dziś),
- `input.inputMode = "numeric"`,
- `input.pattern = "[0-9]*"`,
- opcjonalnie `input.autocomplete = "off"`.

To zachowuje obecną logikę sanitizacji (`sanitizeIntegerInput`), a jednocześnie stabilizuje wybór klawiatury mobilnej.

### Wariant B
Przełączyć na `type="tel"` dla pól całkowitych.
- Też zwykle otwiera klawiaturę numeryczną,
- ale semantycznie to „telefon”, więc wariant A jest czytelniejszy dla pól kwot/punktów.

### Czego lepiej unikać
- `type="number"` przy obecnym podejściu może wprowadzać różnice między przeglądarkami (np. separatory, krok, strzałki spinnera) i kolidować z istniejącą sanitizacją stringów.

## Proponowany plan wdrożenia
1. Dodać mały helper konfigurujący pola całkowite (np. `applyIntegerInputHints(input)`), użyć go w:
   - `createNumericCell(...)` w obu sekcjach „Szczegóły Gry”,
   - inputach w obu modalach „Rebuy gracza”.
2. Przetestować ręcznie na mobile:
   - `Wpisowe`, `Wypłata`, `Punkty`, każde pole `RebuyX`.
3. Potwierdzić spójność zachowania również w „Gry admina”.

## Ocena ryzyka
- Niskie: zmiana dotyczy atrybutów inputów, bez ingerencji w model danych.
- Niskie/średnie: warto sprawdzić starsze urządzenia i iOS/Android, bo różnią się interpretacją `inputmode`.
