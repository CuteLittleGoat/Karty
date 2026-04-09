# Analiza poprawności działania zakładki „Kalkulator” (moduł Main)

## Prompt użytkownika
„Przeprowadź analizę poprawności działania zakładki Kalkulator w module Main.
Jak w nią wchodzę to nie wyświetlają się dane. Dopiero po pewnym czasie i klikaniu w inne zakładki pojawia się jakaś treść. Jednak to nie są te tabele, które powinny się tam znajdować.”

## Zakres analizy
- Moduł: `Main`
- Obszar: renderowanie zakładki admina „Kalkulator”
- Pliki przeanalizowane: `Main/app.js`, `Main/index.html`

## Ustalenia

### 1) Krytyczny błąd JS w renderowaniu Tabela2 (tryby tournament)
W `Main/app.js` w funkcji `renderTable2` iteracja jest zdefiniowana jako:
- `modeState.table2Rows.forEach((row) => { ... })`

Wewnątrz tej iteracji używane jest:
- `lpCell.textContent = String(index + 1);`

Zmiennej `index` nie ma w zakresie tej funkcji (brak parametru `index` w `forEach`).
Efekt: podczas renderu trybu `tournament1/tournament2` pojawia się runtime error (`ReferenceError`), który przerywa dalsze renderowanie widoku.

### 2) Dlaczego pojawia się „losowa”/niepoprawna treść po klikaniu zakładek
W `render()` dla trybów tournament wywoływane są kolejno:
1. `renderTable1()`
2. `renderTable2()`
3. `renderTable3()`
4. `renderTable4()`
5. `renderTable5()`

Ponieważ `renderTable2()` rzuca wyjątek, dalsze kroki nie wykonują się.
To powoduje mieszanie nowo wyrenderowanych fragmentów z poprzednim stanem DOM (np. pozostają sekcje z innych trybów, jak `TABELAC` z trybu żetonów), co dokładnie odpowiada zgłoszonemu objawowi.

### 3) Zgodność z objawami ze zrzutów
Na zrzutach widać jednocześnie:
- aktywny tryb typu tournament,
- sekcję `Tabela1` oraz
- niepasującą sekcję `TABELAC`.

To jest spójne z przerwanym renderem „w połowie” i pozostawieniem części starego DOM.

## Wniosek główny
Przyczyna problemu jest **lokalna i deterministyczna**: błąd referencji `index` w `renderTable2` (`Main/app.js`), który zrywa render i daje efekt pustych/nieadekwatnych tabel.

## Rekomendowana poprawka (do wdrożenia w kodzie)
1. Zmienić iterację w `renderTable2` na:
- `modeState.table2Rows.forEach((row, index) => { ... })`

2. Dodatkowo (obronnie) rozważyć:
- reset wszystkich kontenerów tabel przed sekwencyjnym renderem,
- lub bezpieczne obsłużenie wyjątków na poziomie renderu, aby nie zostawiać mieszanego DOM po częściowym renderze.

## Ocena ryzyka
- Ryzyko zmiany: niskie (jedna poprawka parametru callbacka).
- Potencjalny wpływ pozytywny: wysoki (stabilny render i spójność tabel po wejściu w zakładkę).
