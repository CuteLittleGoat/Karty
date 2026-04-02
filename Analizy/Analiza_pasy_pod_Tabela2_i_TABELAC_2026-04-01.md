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

---

## Uzupełnienie analizy (2026-04-02)

### Prompt użytkownika (uzupełniający)
"W analizie jest zapis:
Nawet gdy slot jest pusty, zostaje widoczny jego wrapper CSS (.admin-calculator-table-wrap), więc wygląda jak zielony pas.

Czy jest możliwość ustawienia w ten sposób, że jeżeli slot jest pusty to jest ukrywany z interfejsu? Jeżeli jest technicznie wymagany przez kod aplikacji to niech zostanie, ale jeżeli nie wyświetla żadnych informacji dla użytkownika to niech będzie ukryty z widoku. Czy da się tak zrobić?"

### Krótka odpowiedź
**Tak, da się to zrobić** i jest to bezpieczne, o ile ukrywamy tylko wizualnie puste sloty (nie usuwamy ich z DOM).

### Ocena techniczna
1. Kontenery `#adminCalculatorTable1..#adminCalculatorTable5` są potrzebne, bo kod inicjalizacji je pobiera i wymaga ich obecności.
2. Jednocześnie kod wielu trybów zostawia część slotów pustych przez `innerHTML = ""`.
3. Wniosek: najlepszy wariant to **zachować kontenery w HTML**, ale **chować je, gdy są puste**.

### Rekomendowane warianty realizacji

#### Wariant A (najprostszy): CSS `:empty`
- Dodać regułę:
  - `.admin-calculator-table-wrap:empty { display: none; }`
- Efekt:
  - Gdy slot nie ma żadnych dzieci (po `innerHTML = ""`), znika z interfejsu.
  - Gdy kod doda nagłówek/tabelę (`appendChild(...)`), slot znów będzie widoczny.

**Uwaga praktyczna:** selektor `:empty` nie działa, jeśli w środku zostanie np. spacja lub komentarz. Przy obecnym sposobie czyszczenia (`innerHTML = ""`) powinno działać poprawnie.

#### Wariant B (bardziej kontrolowany): klasa `is-hidden`
- Przy renderze po każdym `innerHTML = ""` dopisywać klasę ukrycia.
- Po dodaniu treści usuwać klasę.
- Plus: pełna kontrola i odporność na przypadki, gdy element nie jest formalnie `:empty`.
- Minus: więcej zmian w JS.

### Rekomendacja końcowa
Na ten przypadek **najlepiej zacząć od Wariantu A (`:empty`)**, bo:
- nie narusza logiki aplikacji,
- nie wymaga przebudowy renderowania,
- od razu usuwa zielone pasy tam, gdzie sloty są puste.

Jeżeli w przyszłości pojawią się niestandardowe przypadki (np. sloty zawierające techniczne, ale niewidoczne elementy), można przejść na Wariant B z klasą sterowaną w JS.

## Realizacja zmian w kodzie (2026-04-02)

Plik Main/styles.css  
Linia 525  
Było: `/* brak reguły ukrywającej pusty wrapper */`  
Jest: `.admin-calculator-table-wrap:empty { display: none; }`

Plik Main/docs/Documentation.md  
Linia 179  
Było: `- w tabelach TABELA2 (Organizacja) i TABELAA (Żetony) przyciski Usuń...`  
Jest: `- ... + doprecyzowanie, że puste sloty #adminCalculatorTable1..#adminCalculatorTable5 są ukrywane przez .admin-calculator-table-wrap:empty`

Plik Main/docs/README.md  
Linia 606  
Było: `5. Wszystkie pola liczbowe...`  
Jest: `5. Puste pasy pod TABELA2/TABELAC są ukrywane automatycznie...`

Plik DetaleLayout.md  
Linia 67  
Było: `- Przyciski akcji w wierszach (Dodaj, Usuń)...`  
Jest: `- ... + informacja o ukrywaniu pustych wrapperów .admin-calculator-table-wrap:empty`

