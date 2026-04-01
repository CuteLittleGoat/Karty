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
