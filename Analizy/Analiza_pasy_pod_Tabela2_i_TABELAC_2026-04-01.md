# Analiza: zielone pasy pod Tabela2/TABELAC

## Prompt użytkownika
"W zakładce Organizacja pod Tabela2 są dwa zielone pasy. W innych zakładkach pod TABELAC są dwa takie pola. Co to?"

## Wnioski
To nie są osobne dane ani ukryte pola wejściowe – to puste kontenery na kolejne tabele kalkulatora.

W layoucie kalkulatora zawsze są renderowane 5 sekcji:
- `#adminCalculatorTable1`
- `#adminCalculatorTable2`
- `#adminCalculatorTable3`
- `#adminCalculatorTable4`
- `#adminCalculatorTable5`

Każda sekcja ma stały styl `.admin-calculator-table-wrap` (padding, obramowanie, tło). Dlatego nawet gdy sekcja jest pusta, wizualnie wygląda jak zielony pasek.

W trybie **Organizacja** kod czyści `rootTable3`, `rootTable4`, `rootTable5`; z tego najbardziej widoczne są puste `rootTable4` i `rootTable5` pod `TABELA2`.

W trybach **Żetony** (`TABELAA/TABELAB/TABELAC`) kod czyści `rootTable4` i `rootTable5`, więc pod `TABELAC` widzisz te same dwa puste paski.

## Źródło w kodzie (skrót)
- Statyczne 5 kontenerów w HTML kalkulatora.
- W `renderOrganizationTables()` na końcu: `rootTable3.innerHTML = ""; rootTable4.innerHTML = ""; rootTable5.innerHTML = "";`
- W `renderChipsTables()` na końcu: `rootTable4.innerHTML = ""; rootTable5.innerHTML = "";`
- Styl tła/krawędzi sekcji: `.admin-calculator-table-wrap`.

## Co to oznacza praktycznie
To elementy layoutu/placeholdery po niewykorzystanych sekcjach tabel. Samo ich istnienie nie oznacza błędu obliczeń – to kwestia prezentacji UI.

## Odpowiedź na dodatkowe pytanie
**Pytanie:** „Czy te kontenery HTML są w jakikolwiek sposób wykorzystywane przez kod aplikacji? Służą do czegokolwiek?”

**Tak — są wykorzystywane przez kod aplikacji jako stałe „sloty” renderowania tabel**, a nie jako martwy HTML.

Co robi kod:
1. Przy starcie kalkulatora pobiera referencje do `#adminCalculatorTable1..#adminCalculatorTable5` i bez nich przerywa inicjalizację (`return`).
2. W zależności od trybu (Organizacja / Żetony / ITM) dynamicznie wypełnia część slotów treścią (`appendChild(...)`), a część czyści (`innerHTML = ""`).
3. Nawet gdy slot jest pusty, zostaje widoczny jego wrapper CSS (`.admin-calculator-table-wrap`), więc wygląda jak zielony pas.

Czyli praktycznie:
- **kontenery są potrzebne** do działania wspólnego mechanizmu renderowania i przełączania trybów,
- ale **w danym trybie nie wszystkie są używane na dane** — niektóre pełnią rolę pustych placeholderów layoutu.

## Doprecyzowanie techniczne (kod)
- `Main/index.html`: istnieje 5 stałych kontenerów `adminCalculatorTable1..5`.
- `Main/app.js`: kod jawnie pobiera wszystkie 5 kontenerów przez `querySelector(...)` i waliduje ich obecność.
- `Main/app.js`:
  - `renderOrganizationTables()` wypełnia `rootTable1`, `rootTable2`, a czyści `rootTable3..5`.
  - `renderChipsTables()` wypełnia `rootTable1..3`, a czyści `rootTable4..5`.
- `Main/styles.css`: `.admin-calculator-table-wrap` nadaje tym kontenerom tło/obramowanie, więc puste kontenery są dalej widoczne.

