# Analiza modułu Second — TABELA10 (`LICZ. REBUY/ADD-ON`) i renumeracja `RebuyX` po usunięciu stołu

## Prompt użytkownika
> Przeprowadź analizę modułu "Second"
> Interesuje mnie kolumna "LICZ. REBUY/ADD-ON" w TABELA10 oraz jeszcze jedna sumująca wartości "RebuyX".
> Obecnie te kolumny są powiązane z graczem.
> Jeżeli mam gracza przypisanego do stołu, dodam mu wartości w kolumnach "RebuyX" to wartości w kolumnach sumujących liczbę i wartości z "RebuyX" działają prawidłowo.
> Jednak jeżeli usunę stół to wartość się nie zeruje.
> Żeby się wyzerowała muszę skasować gracza.
> Czy jest możliwość, żeby wartości mogły się kasować po usunięciu stołu?
> Dodatkowo musi się zmienić numeracja kolumn RebuyX. Poniżej przykłady (...)
> Przeprowadź analizę wprowadzenia takiego rozwiązania

## Zakres analizy
- Moduł: `Second`
- Obszary kodu:
  - obsługa danych rebuy `payments.table12Rebuys`
  - wyliczenia TABELA10/TABELA11
  - akcja `delete-table`
  - globalna numeracja `RebuyX` (`indexes[]`) i jej kompaktowanie

## Stan obecny (jak działa teraz)
1. Źródło rebuy to `payments.table12Rebuys[playerId]`, gdzie każdy gracz ma:
   - `values[]` (kwoty)
   - `indexes[]` (globalne numery kolumn `RebuyX`).
2. TABELA10/TABELA11 liczą się na bazie `getAllTable12RebuyEntries()`, ale filtrują tylko po **aktywnych graczach** (`tournamentState.players`).
3. Usunięcie stołu (`delete-table`) robi:
   - usunięcie stołu z `tables`,
   - odpięcie graczy od tego stołu (`assignments[playerId].tableId = ""`),
   - **nie usuwa** `payments.table12Rebuys[playerId]` dla tych graczy.
4. Efekt: rebuy gracza dalej istnieje i dalej wpada do sum TABELA10/TABELA11, dopóki gracz nie zostanie usunięty z listy graczy.

## Dlaczego występuje zgłoszony problem
Problem jest zgodny z obecną logiką danych:
- po usunięciu stołu gracz nadal jest „aktywnym graczem” (jest w `players`),
- rebuy jest trzymany per gracz, nie per przypisanie do stołu,
- agregacja nie wymaga, by gracz był aktualnie przypisany do stołu.

## Czy wdrożenie jest możliwe?
**Tak — jak najbardziej możliwe** i technicznie stosunkowo bezpieczne.

Najlepszy kierunek:
1. Podczas `delete-table` wyznaczyć listę graczy przypisanych do usuwanego stołu.
2. Dla tych graczy usunąć wpisy `payments.table12Rebuys[playerId]`.
3. Po usunięciu wpisów wykonać globalną renumerację `RebuyX` tylko dla pozostałych wpisów.
4. Przemapować `pool.rebuyValues` do nowej numeracji (analogicznie do obecnego mechanizmu po `Usuń Rebuy`, ale dla wielu usuniętych indeksów naraz).

## Wymagana logika renumeracji `RebuyX`
Aby spełnić wszystkie 3 przykłady użytkownika, renumeracja powinna działać tak:
1. Zbierz wszystkie pozostałe wpisy rebuy (po usunięciu graczy z usuniętego stołu).
2. Posortuj je po starym `index` rosnąco.
3. Nadaj nowe indeksy sekwencyjnie `1..N` według tej kolejności.
4. Zapisz nowe `indexes[]` per gracz.

To daje dokładnie efekt z przykładów:
- **Przykład 1**: `4,6,8 -> 1,2,3`
- **Przykład 2**: `4,6,8 -> 1,2,3` przy zachowaniu rozkładu na graczy
- **Przykład 3**: `3,4,6,7,11,12 -> 1,2,3,4,5,6`

## Warianty implementacyjne
### Wariant A (rekomendowany)
Czyścić rebuy dla graczy odpiętych wskutek `delete-table` i robić pełną renumerację globalną.

**Plusy:**
- zgodny z oczekiwaniem biznesowym,
- przewidywalne sumy w TABELA10/TABELA11,
- brak „martwych” rebuy po usuniętym stole.

**Minusy:**
- operacja destrukcyjna (usuwa dane rebuy powiązane z usuwanym stołem).

### Wariant B
Nie usuwać danych, tylko zmienić agregację tak, by liczyć rebuy tylko graczy aktualnie przypisanych do stołów.

**Plusy:**
- mniej destrukcyjne w danych.

**Minusy:**
- dane „osierocone” nadal istnieją,
- w modalu rebuy użytkownik dalej może widzieć stare wartości,
- trudniej utrzymać spójność numeracji `RebuyX` i TABELA16.

## Ryzyka i miejsca wymagające ostrożności
1. **Spójność z `pool.rebuyValues` (TABELA16)**
   - po zmianie numeracji trzeba bezbłędnie przemapować kolumny.
2. **Kolejność operacji przy zapisie**
   - najpierw modyfikacja stanu lokalnego, potem jeden zapis `saveState` z `deletedPaths`.
3. **Otwarte modalne edycje rebuy**
   - jeśli modal dotyczy gracza z usuwanego stołu, powinien zostać zamknięty/resetowany.
4. **Snapshoty z Firestore / race condition**
   - zachować aktualną ochronę przed nadpisaniem lokalnego stanu podczas edycji.

## Proponowane testy akceptacyjne
1. Odtworzyć każdy z 3 scenariuszy użytkownika i zweryfikować:
   - TABELA10 `LICZ. REBUY/ADD-ON`,
   - sumę REBUY/ADD-ON,
   - nową numerację `RebuyX`.
2. Sprawdzić TABELA16 po usunięciu stołu:
   - czy wartości pozostały we właściwych kolumnach po renumeracji.
3. Sprawdzić przypadek graniczny:
   - usunięcie stołu, który miał wszystkich graczy z rebuy,
   - rezultat: `0` rebuy i brak kolumn `RebuyX`.
4. Sprawdzić przypadek z graczami bez stołu:
   - po usunięciu stołu brak „duchów” w TABELA10/TABELA11.

## Wniosek końcowy
Da się wdrożyć oczekiwane zachowanie. Najbardziej spójne i zgodne z opisem użytkownika będzie czyszczenie rebuy graczy powiązanych z usuwanym stołem oraz pełna, globalna renumeracja pozostałych `RebuyX` (z jednoczesnym remapem `pool.rebuyValues`).

## Realizacja rekomendacji (wdrożenie)

### Prompt użytkownika
> Przeczytaj analizę Analizy/Analiza_Second_Tabela10_Rebuy_po_usunieciu_stolu_2026-03-25.md i wprowadź rekomendowane rozwiązanie, aby zapewnić opisywaną funkcjonalność. Zadbaj o to, żeby funkcja przycisku "Wyzeruj Rebuy" w "Losowanie Graczy" się przy okazji nie popsuła.

### Zmiany w kodzie

Plik `Second/app.js`  
Linie (blok `delete-table`)  
Było:
```js
if (role === "delete-table") {
  const tableId = target.dataset.tableId;
  tournamentState.tables = tournamentState.tables.filter((table) => table.id !== tableId);
  delete tournamentState.tableEntries[tableId];
  Object.keys(tournamentState.assignments).forEach((key) => {
    if (tournamentState.assignments[key]?.tableId === tableId) tournamentState.assignments[key].tableId = "";
  });
  Object.keys(tournamentState.semi.assignments).forEach((key) => {
    if (tournamentState.semi.assignments[key]?.tableId === tableId) tournamentState.semi.assignments[key].tableId = "";
  });
  deletedPaths = deletedPaths.concat(getAutomaticRebuyResetDeletedPaths());
}
```
Jest:
```js
if (role === "delete-table") {
  const tableId = target.dataset.tableId;
  const affectedPlayerIds = Object.keys(tournamentState.assignments).filter((playerId) => (
    tournamentState.assignments[playerId]?.tableId === tableId
  ));
  deletedPaths = deletedPaths.concat(removeTable12RebuysForPlayersAndReindex(affectedPlayerIds));
  if (activeTable12RebuyPlayerId && affectedPlayerIds.includes(activeTable12RebuyPlayerId)) {
    await closeTable12RebuyModal();
  }
  tournamentState.tables = tournamentState.tables.filter((table) => table.id !== tableId);
  delete tournamentState.tableEntries[tableId];
  Object.keys(tournamentState.assignments).forEach((key) => {
    if (tournamentState.assignments[key]?.tableId === tableId) tournamentState.assignments[key].tableId = "";
  });
  Object.keys(tournamentState.semi.assignments).forEach((key) => {
    if (tournamentState.semi.assignments[key]?.tableId === tableId) tournamentState.semi.assignments[key].tableId = "";
  });
  deletedPaths = deletedPaths.concat(getAutomaticRebuyResetDeletedPaths());
}
```

Plik `Second/app.js`  
Linie (nowa funkcja renumeracji po usunięciu stołu)  
Było:
```js
// brak dedykowanej funkcji do masowego usuwania rebuy graczy stołu + pełnej renumeracji 1..N
```
Jest:
```js
const removeTable12RebuysForPlayersAndReindex = (playerIds) => {
  // usuwa payments.table12Rebuys dla graczy usuwanego stołu,
  // buduje mapę oldIndex->newIndex na pozostałych wpisach,
  // renumeruje indexes[] graczy,
  // przemapowuje pool.rebuyValues,
  // zwraca deletedPaths do saveState.
};
```

### Zmiany dokumentacyjne

Plik `Second/docs/README.md`  
Linia (sekcja „Losowanie stołów”, krok 6)  
Było:
```md
- Jeżeli po usunięciu stołu nie ma już żadnych stołów i żadnych graczy, aplikacja automatycznie czyści dane rebuy oraz ręczne nadpisania rebuy w podziale puli.
```
Jest:
```md
- Usunięcie stołu usuwa też wszystkie wpisy `RebuyX` graczy przypisanych do tego stołu i od razu renumeruje globalnie pozostałe `RebuyX` od `Rebuy1` bez luk.
- Po tej renumeracji aplikacja automatycznie przemapowuje też ręczne wartości rebuy w `Tabela16`, żeby pozostały pod właściwymi kolumnami.
- Jeżeli po usunięciu stołu nie ma już żadnych stołów i żadnych graczy, aplikacja automatycznie czyści dane rebuy oraz ręczne nadpisania rebuy w podziale puli.
```
