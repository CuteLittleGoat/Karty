# Analiza błędu: „Podział puli” w module Second

## Prompt użytkownika
> W module Second zakładka "Podział puli" wyświetla błąd:
>
> Nie udało się wyrenderować sekcji „pool”.\n\nSzczegóły: formatPercentDisplay is not defined
>
> Przeprowadź analizę przyczyny błędu i zaproponuj rozwiązanie.

## Objaw
W sekcji `pool` (Podział puli) renderer kończy się błędem `ReferenceError: formatPercentDisplay is not defined`, a UI pokazuje fallback z komunikatem o błędzie renderowania sekcji.

## Przyczyna techniczna
1. Funkcja `getPoolSplitDisplay` jest zdefiniowana na poziomie globalnym modułu i wywołuje `formatPercentDisplay(value)` dla pierwszych 3 wierszy podziału:

```js
const getPoolSplitDisplay = (row, index) => {
  const value = getPoolSplitValueForCalculation(row?.split, index);
  return index < 3 ? formatPercentDisplay(value) : digitsOnly(value);
};
```

2. `formatPercentDisplay` **nie istnieje** w tym samym (globalnym) zakresie – jest zdefiniowane dopiero później, ale lokalnie wewnątrz funkcji `initSecondModule()`:

```js
const formatPercentDisplay = (value) => {
  const rawDigits = digitsOnly(value);
  if (!rawDigits) return "";
  return `${toPercentDigits(rawDigits)}%`;
};
```

3. Z powodu zakresu (`scope`) JavaScript funkcja globalna (`getPoolSplitDisplay`) nie widzi zmiennej lokalnej z wnętrza `initSecondModule()`, więc podczas renderu `pool` pojawia się `ReferenceError`.

## Dlaczego błąd ujawnia się akurat w `pool`
W renderze sekcji `pool` (również w widoku user) `getPoolSplitDisplay` jest używane do budowy komórek `PODZIAŁ`, więc już pierwsze wywołanie dla `idx < 3` odpala ścieżkę z `formatPercentDisplay(...)` i kończy render wyjątkiem.

## Proponowane rozwiązanie (rekomendowane)
Ujednolicić zakres helperów i trzymać formatter procentów tam, gdzie używany jest przez helper globalny:

### Opcja A (rekomendowana)
Przenieść `formatPercentDisplay` na poziom globalny (obok `digitsOnly`, `getPoolSplitDisplay`, `toDigitsNumber`) i usunąć duplikat/lokalną wersję z `initSecondModule`.

**Plusy:**
- najmniejsza zmiana logiczna,
- przywraca spójność helperów,
- zapobiega podobnym błędom zakresu w innych sekcjach.

### Opcja B
Przenieść `getPoolSplitDisplay` do `initSecondModule` (czyli do tego samego scope co `formatPercentDisplay`) i używać tylko lokalnie.

**Minus:**
- ogranicza reużywalność helpera,
- zwiększa ryzyko niespójności, jeśli gdzieś indziej jest potrzebny.

## Dodatkowa rekomendacja jakościowa
Dodać prosty test/regresję renderu `pool` (np. smoke test wywołujący ścieżkę generowania TABELI16), który wykryje `ReferenceError` przy brakujących helperach jeszcze przed wdrożeniem.

## Podsumowanie
Błąd nie wynika z danych turnieju, tylko z nieprawidłowego zakresu funkcji po stronie frontendu (`scope mismatch`). Naprawa polega na przeniesieniu/ujednoliceniu definicji `formatPercentDisplay` i `getPoolSplitDisplay` do wspólnego zakresu.

## Wdrożone zmiany w kodzie (realizacja rekomendacji)

Plik `Second/app.js`  
Linia 801  
Było: `const getPoolDefaultSplitValue = (index) => (index === 0 ? "50" : index === 1 ? "30" : index === 2 ? "20" : "");`  
Jest: `const formatPercentDisplay = (value) => {`

Plik `Second/app.js`  
Linia 1401  
Było: `const toPercentDigits = (value) => {`  
Jest: `const percentInputToDecimal = (value) => {`

Plik `Second/app.js`  
Linia 1416  
Było: `const formatPercentDisplay = (value) => {`  
Jest: `const formatCellNumber = (value) => {`

Plik `Second/docs/Documentation.md`  
Linia 305  
Było: `- Dzięki temu sekcja user \`pool\` korzysta z tej samej logiki wyświetlania co admin i nie ma ryzyka \`ReferenceError\` z powodu zakresu funkcji.`  
Jest: `- \`formatPercentDisplay(value)\` działa teraz również globalnie (poza \`initSecondModule()\`), więc helper \`getPoolSplitDisplay(...)\` ma do niego dostęp zarówno w renderze admina, jak i user-view.`

Plik `Second/docs/README.md`  
Linia 208  
Było: `- kolumna \`KWOTA\`: wiersze 1–3 = procent × \`Tabela15.PODZIAŁ\`, od wiersza 4 = przepisana wartość z \`PODZIAŁ PULI\`,`  
Jest: `- format procentowy dla wierszy 1–3 (\`xx%\`) jest renderowany tak samo w panelu admina i w widoku user (po PIN), więc sekcja nie powinna już zgłaszać błędu \`formatPercentDisplay is not defined\`,`
