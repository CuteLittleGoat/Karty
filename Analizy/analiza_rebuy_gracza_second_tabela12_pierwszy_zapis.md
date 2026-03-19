# Analiza: modal „Rebuy Gracza” w module Second, TABELA12, kolumna REBUY

## Prompt użytkownika
> Przeprowadź analizę poprawności działania modalu "Rebuy Gracza" w module Second - TABELA12 przycisk w kolumnie REBUY.
> 1. Klikam przycisk otwierający modal
> 2. Klikam "Dodaj Rebuy". Pojawia się kolumna "Rebuy1" (prawidłowo)
> 3. Uzupełniam kolumnę i kilkam poza okno, żeby zamknąć modal
> 4. Wartość na przycisku pokazuje 0
> 5. Nie zapisała się wartość wpisana w kolumnę "Rebuy1"
> 6. Jak drugi raz otwieram modal i ponownie uzupełniam kolumnę i zamknę modal to wartość się zapisuje
>
> Taka sytuacja pojawia się za każdym razem jak otwieram modal "Rebuy Gracza". Pierwsze uzupełnienie kolumny się nie zapisuje.
> Sprawdź przyczynę i zaproponuj naprawę w nowym pliku z analizą.

## Zakres analizy
Analiza obejmuje wyłącznie moduł `Second`, logikę `Tabela12` i modal `Rebuy gracza` w pliku `Second/app.js`.

## Objaw
Błąd pojawia się przy scenariuszu:
1. Otwarcie modalu dla gracza.
2. Kliknięcie `Dodaj Rebuy`.
3. Natychmiastowe wpisanie pierwszej wartości w nowo dodanej kolumnie.
4. Zamknięcie modalu kliknięciem poza oknem.
5. Na przycisku w `Tabela12` nadal widnieje `0`, a pierwsza wpisana wartość znika.
6. Po ponownym otwarciu modalu i ponownym wpisaniu wartości zapis już działa.

## Ustalona przyczyna
Problem wygląda na **wyścig asynchroniczny pomiędzy dwoma niezależnymi zapisami i snapshotami z Firestore**.

### Co robi kod
- Kliknięcie `Dodaj Rebuy` od razu dopisuje pustą wartość `""` do `rebuyState.values` i wykonuje `persistTable12RebuyChanges("Dodaj Rebuy")`.
- Każda zmiana w inpucie (`input` event) od razu aktualizuje `rebuyState.values[index]`, następnie wywołuje `await persistTable12RebuyChanges()` i na końcu `render()`.
- Zamknięcie modalu kliknięciem w overlay nie czeka na zakończenie zapisów; po prostu czyści `activeTable12RebuyPlayerId` i zamyka modal.
- `docRef.onSnapshot(...)` odkłada snapshot do `deferredSnapshotState` tylko wtedy, gdy trwa zapis (`pendingLocalWrites > 0`) albo ogólna edycja (`hasActiveEdit`).
- Modal `Rebuy gracza` nie ustawia żadnego lokalnego stanu typu „trwa edycja modalu”, więc po zakończeniu wcześniejszego zapisu może zostać przyjęty odroczony snapshot ze starszym stanem.

### Najbardziej prawdopodobna sekwencja błędu
1. Użytkownik klika `Dodaj Rebuy`.
2. Aplikacja zapisuje do Firestore nową kolumnę z pustą wartością.
3. Użytkownik od razu wpisuje kwotę, co uruchamia drugi zapis — już z poprawną wartością.
4. W międzyczasie z Firestore wraca snapshot po pierwszym zapisie (`Rebuy1 = ""`).
5. Ponieważ modal nie jest traktowany jako aktywna edycja, a licznik oczekujących zapisów może już spaść do zera, kod może zaakceptować ten starszy snapshot i nadpisać lokalny stan pustą wartością.
6. Efekt końcowy: przycisk pokazuje `0`, a pierwsza wpisana wartość znika.
7. Drugie otwarcie modalu działa poprawnie, bo nie ma już osobnego wcześniejszego zapisu z `Dodaj Rebuy`; pozostaje tylko zwykła edycja istniejącego pola.

## Dlaczego objaw pasuje dokładnie do zgłoszenia
To tłumaczy wszystkie elementy zgłoszenia:
- problem występuje **po pierwszym dodaniu nowej kolumny**,
- problem nie występuje przy **drugiej edycji istniejącego już pola**,
- zamknięcie modalu kliknięciem poza oknem tylko zwiększa szansę, że użytkownik nie zauważy trwającego jeszcze asynchronicznego przepływu zapisu/snapshotu,
- wartość na przycisku wraca do `0`, bo suma `getPlayerRebuyTotal(playerId)` liczy dane z lokalnego stanu nadpisanego pustym snapshotem.

## Miejsca w kodzie, które tworzą problem
1. `Dodaj Rebuy` zapisuje pustą kolumnę natychmiast po dodaniu.
2. `input` zapisuje dane od razu przy każdym wpisanym znaku.
3. Zamknięcie modalu nie czeka na zakończenie zapisów i nie blokuje przyjścia starszego snapshotu.
4. Snapshoty są odkładane tylko względem `pendingLocalWrites` / `hasActiveEdit`, ale modal nie ma własnej ochrony stanu edycji.

## Rekomendowana naprawa
Najbezpieczniejsza naprawa to **oddzielić lokalną edycję modalu od natychmiastowego zapisu pustej kolumny**.

### Wariant rekomendowany
Wprowadzić lokalny stan edycji modalu, np.:
- `table12RebuyModalDraft`,
- `table12RebuyModalDirty`,
- `table12RebuyModalEditing`.

#### Proponowany przepływ
1. Po kliknięciu `Dodaj Rebuy` dodać kolumnę tylko lokalnie w stanie modalu/drafcie.
2. Nie wykonywać zapisu pustej wartości do Firestore natychmiast.
3. Input aktualizuje draft lokalny, bez natychmiastowego nadpisywania stanu głównego przez snapshoty.
4. Przy zamknięciu modalu albo `blur`/dedykowanym `Zapisz` wykonać **jeden zapis scalający** całe `table12Rebuys[playerId]`.
5. Podczas otwartego modalu ignorować/odkładać snapshoty dla tej sekcji aż do zakończenia edycji.

### Minimalna naprawa, jeśli obecna architektura ma zostać zachowana
Jeżeli zespół chce zostawić bieżący model zapisu „na żywo”, to minimalnie trzeba:
1. dodać flagę w stylu `table12RebuyModalEditing = true` od otwarcia do zamknięcia modalu,
2. rozszerzyć warunek w `docRef.onSnapshot(...)`, aby **nie podmieniać `tournamentState` podczas aktywnej edycji modalu rebuy**, np. odkładać snapshot tak samo jak przy `hasActiveEdit`,
3. w `closeTable12RebuyModal()` przed zamknięciem poczekać na zakończenie `pendingLocalWrites` albo jawnie wykonać finalny zapis aktualnego stanu gracza,
4. opcjonalnie zablokować zamknięcie modalu w trakcie aktywnego zapisu albo pokazywać stan „zapisywanie...”.

## Która poprawka będzie najlepsza
Najbardziej odporne rozwiązanie:
- **nie zapisywać pustego `Rebuy1` od razu po `Dodaj Rebuy`**,
- przechowywać pierwszą edycję lokalnie,
- zapisać dane dopiero po faktycznym wpisaniu wartości lub przy zamknięciu modalu.

To usuwa źródło wyścigu, bo znika pierwszy zapis ze stanem pustym, który później może nadpisywać wpisaną wartość.

## Dodatkowe zalecenia wdrożeniowe
1. Dodać diagnostyczne logi dla kolejności:
   - `Dodaj Rebuy` save start/end,
   - `input` save start/end,
   - `onSnapshot` receive,
   - `close modal`.
2. Przetestować scenariusze:
   - szybkie wpisanie wartości zaraz po `Dodaj Rebuy`,
   - zamknięcie modalu kliknięciem poza oknem,
   - zamknięcie klawiszem `Escape`,
   - wpisywanie wielocyfrowej wartości z kilkoma eventami `input`,
   - wolny internet / opóźnione snapshoty.
3. Po wdrożeniu sprawdzić, czy podobny problem nie istnieje w innych modalach zapisujących „na żywo”.

## Wniosek końcowy
Przyczyna błędu nie wygląda na problem z samym liczeniem sumy, tylko na **niesynchronizowany przepływ: `Dodaj Rebuy` (pusty zapis) -> pierwsza edycja inputa -> snapshot starego stanu -> nadpisanie lokalnych danych**.

Naprawa powinna skupić się na tym, żeby pierwsza nowa kolumna nie była zapisywana jako pusty rekord przed zakończeniem realnej edycji albo żeby snapshoty nie mogły nadpisywać stanu podczas aktywnej pracy w modalu.


## Status wdrożenia naprawy
Rekomendowana naprawa została wdrożona w module `Second`.

## Stan obecny (przed zmianą)
Przed wdrożeniem poprawki przepływ wyglądał tak:
1. `Dodaj Rebuy` od razu dopisywał pustą kolumnę do `payments.table12Rebuys[playerId]` i zapisywał ją do Firestore.
2. Pierwsze wpisanie wartości uruchamiało drugi zapis.
3. Jeżeli między tymi dwoma zapisami wrócił starszy snapshot z pustym `Rebuy1`, lokalny stan potrafił zostać nadpisany.
4. Efekt: po zamknięciu modalu pierwszy wpis znikał, a przycisk w `Tabela12` wracał do `0`.

## Stan po zmianie
Po wdrożeniu poprawki przepływ działa tak:
1. `Dodaj Rebuy` dodaje nowe pole tylko do lokalnego draftu modalu.
2. Pierwsza wpisana wartość aktualizuje draft i lokalny stan UI, ale nie wykonuje już konkurencyjnego zapisu pustego `Rebuy1`.
3. Snapshoty z Firestore są odkładane, gdy modal `Rebuy gracza` ma aktywny draft.
4. Zapis do Firestore następuje przy zamknięciu modalu z niezapisanymi zmianami albo przy akcji `Usuń Rebuy`.
5. Efekt: pierwsza wpisana wartość nie jest cofana i przycisk `REBUY` od razu pokazuje poprawną sumę.

## Wszystkie zmiany w kodzie

### Plik `Second/app.js`

#### Zmiana 1
Linie 811-814
Było:
```js
  let table12RebuyActionInProgress = false;

  const commitDeferredSnapshotIfSafe = () => {
```
Jest:
```js
  let table12RebuyActionInProgress = false;
  let table12RebuyModalDraft = null;
  let table12RebuyModalDirty = false;

  const isTable12RebuyModalEditing = () => Boolean(activeTable12RebuyPlayerId && table12RebuyModalDraft);

  const commitDeferredSnapshotIfSafe = () => {
```

#### Zmiana 2
Linia 817
Było:
```js
    if (hasActiveEdit || pendingLocalWrites > 0 || !deferredSnapshotState) {
```
Jest:
```js
    if (hasActiveEdit || pendingLocalWrites > 0 || isTable12RebuyModalEditing() || !deferredSnapshotState) {
```

#### Zmiana 3
Linie 872-881
Było:
```js
  const persistTable12RebuyChanges = async (operationLabel = "zapis", options = {}) => {
```
Jest:
```js
  const syncTable12RebuyDraftToState = () => {
    if (!activeTable12RebuyPlayerId || !table12RebuyModalDraft) {
      return;
    }
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = {
      values: [...table12RebuyModalDraft.values],
      indexes: [...table12RebuyModalDraft.indexes]
    };
  };

  const persistTable12RebuyChanges = async (operationLabel = "zapis", options = {}) => {
```

#### Zmiana 4
Linia 888
Było:
```js
    pendingLocalWrites += 1;
```
Jest:
```js
    syncTable12RebuyDraftToState();
    pendingLocalWrites += 1;
```

#### Zmiana 5
Linie 905-930
Było:
```js
  const closeTable12RebuyModal = () => {
    activeTable12RebuyPlayerId = "";
    setTable12RebuyModalStatus("");
    table12RebuyModal.classList.remove("is-visible");
    table12RebuyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
```
Jest:
```js
  const closeTable12RebuyModal = async () => {
    if (table12RebuyActionInProgress) {
      setTable12RebuyModalStatus("Trwa zapisywanie zmian rebuy. Poczekaj na zakończenie operacji.");
      return;
    }

    if (activeTable12RebuyPlayerId && table12RebuyModalDirty) {
      table12RebuyActionInProgress = true;
      renderTable12RebuyModal();
      const saved = await persistTable12RebuyChanges("Zamknięcie modalu Rebuy");
      table12RebuyActionInProgress = false;
      if (!saved) {
        renderTable12RebuyModal();
        return;
      }
      table12RebuyModalDirty = false;
      render();
    }

    activeTable12RebuyPlayerId = "";
    table12RebuyModalDraft = null;
    table12RebuyModalDirty = false;
    setTable12RebuyModalStatus("");
    table12RebuyModal.classList.remove("is-visible");
    table12RebuyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };
```

#### Zmiana 6
Linie 936-943
Było:
```js
    const rebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
    tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = rebuyState;
```
Jest:
```js
    if (!table12RebuyModalDraft) {
      const persistedState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      table12RebuyModalDraft = {
        values: [...persistedState.values],
        indexes: [...persistedState.indexes]
      };
    }
    const rebuyState = table12RebuyModalDraft;
```

#### Zmiana 7
Linie 961-971
Było:
```js
      input.value = value;
      input.addEventListener("input", async () => {
        rebuyState.values[index] = digitsOnly(input.value);
        input.value = rebuyState.values[index];
        await persistTable12RebuyChanges();
        render();
      });
```
Jest:
```js
      input.value = value;
      input.dataset.focusTarget = "second-table12-rebuy-modal";
      input.dataset.section = "table12-rebuy-modal";
      input.dataset.tableId = activeTable12RebuyPlayerId;
      input.dataset.columnKey = `rebuy${index}`;
      input.addEventListener("input", () => {
        rebuyState.values[index] = digitsOnly(input.value);
        input.value = rebuyState.values[index];
        table12RebuyModalDirty = true;
        syncTable12RebuyDraftToState();
        render();
      });
```

#### Zmiana 8
Linie 995-1003
Było:
```js
        activeRebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
        const nextIndex = getNextGlobalTable12RebuyIndex();
        activeRebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
        activeRebuyState.values.push("");
        activeRebuyState.indexes.push(nextIndex);
        appended = true;
        const saved = await persistTable12RebuyChanges("Dodaj Rebuy");
        if (!saved) {
          activeRebuyState.values.pop();
          activeRebuyState.indexes.pop();
          renderTable12RebuyModal();
          return;
        }
        render();
        renderTable12RebuyModal();
```
Jest:
```js
        activeRebuyState = rebuyState;
        const nextIndex = getNextGlobalTable12RebuyIndex();
        activeRebuyState.values.push("");
        activeRebuyState.indexes.push(nextIndex);
        table12RebuyModalDirty = true;
        syncTable12RebuyDraftToState();
        appended = true;
        render();
        renderTable12RebuyModal();
```

#### Zmiana 9
Linie 1033-1067
Było:
```js
      const backupTable12Rebuys = JSON.parse(JSON.stringify(tournamentState.payments.table12Rebuys || {}));
      const backupPoolRebuyValues = JSON.parse(JSON.stringify(tournamentState.pool?.rebuyValues || {}));
      const activeRebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      const removedIndex = activeRebuyState.indexes[activeRebuyState.indexes.length - 1];
      activeRebuyState.values = activeRebuyState.values.slice(0, -1);
      activeRebuyState.indexes = activeRebuyState.indexes.slice(0, -1);
      compactTable12RebuyIndexesAfterRemoval(removedIndex);
      try {
        const saved = await persistTable12RebuyChanges("Usuń Rebuy");
        if (!saved) {
          tournamentState.payments.table12Rebuys = backupTable12Rebuys;
          tournamentState.pool = tournamentState.pool || {};
          tournamentState.pool.rebuyValues = backupPoolRebuyValues;
          renderTable12RebuyModal();
          return;
        }
        render();
        renderTable12RebuyModal();
      } catch (error) {
        tournamentState.payments.table12Rebuys = backupTable12Rebuys;
        tournamentState.pool = tournamentState.pool || {};
        tournamentState.pool.rebuyValues = backupPoolRebuyValues;
```
Jest:
```js
      const backupDraft = JSON.parse(JSON.stringify(rebuyState));
      const backupTable12Rebuys = JSON.parse(JSON.stringify(tournamentState.payments.table12Rebuys || {}));
      const backupPoolRebuyValues = JSON.parse(JSON.stringify(tournamentState.pool?.rebuyValues || {}));
      const activeRebuyState = rebuyState;
      const removedIndex = activeRebuyState.indexes[activeRebuyState.indexes.length - 1];
      activeRebuyState.values = activeRebuyState.values.slice(0, -1);
      activeRebuyState.indexes = activeRebuyState.indexes.slice(0, -1);
      tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = {
        values: [...activeRebuyState.values],
        indexes: [...activeRebuyState.indexes]
      };
      compactTable12RebuyIndexesAfterRemoval(removedIndex);
      const persistedStateAfterCompaction = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      table12RebuyModalDraft = {
        values: [...persistedStateAfterCompaction.values],
        indexes: [...persistedStateAfterCompaction.indexes]
      };
      table12RebuyModalDirty = true;
      try {
        const saved = await persistTable12RebuyChanges("Usuń Rebuy");
        if (!saved) {
          table12RebuyModalDraft = backupDraft;
          tournamentState.payments.table12Rebuys = backupTable12Rebuys;
          tournamentState.pool = tournamentState.pool || {};
          tournamentState.pool.rebuyValues = backupPoolRebuyValues;
          renderTable12RebuyModal();
          return;
        }
        table12RebuyModalDirty = false;
        render();
        renderTable12RebuyModal();
      } catch (error) {
        table12RebuyModalDraft = backupDraft;
        tournamentState.payments.table12Rebuys = backupTable12Rebuys;
        tournamentState.pool = tournamentState.pool || {};
        tournamentState.pool.rebuyValues = backupPoolRebuyValues;
```

#### Zmiana 10
Linie 1090-1091
Było:
```js
    activeTable12RebuyPlayerId = normalizedPlayerId;
    setTable12RebuyModalStatus("");
```
Jest:
```js
    activeTable12RebuyPlayerId = normalizedPlayerId;
    table12RebuyModalDraft = null;
    table12RebuyModalDirty = false;
    setTable12RebuyModalStatus("");
```

#### Zmiana 11
Linia 1819
Było:
```js
    if (hasActiveEdit || pendingLocalWrites > 0) {
```
Jest:
```js
    if (hasActiveEdit || pendingLocalWrites > 0 || isTable12RebuyModalEditing()) {
```

### Plik `Second/docs/README.md`

#### Zmiana 12
Linie 133-139
Było:
```md
   - użyj **Dodaj Rebuy** / **Usuń Rebuy** — pierwsza kolumna pojawia się po kliknięciu **Dodaj Rebuy**,
   - numeracja `RebuyX` jest globalna dla całej `Tabela12` (wszyscy gracze) i przy dodawaniu zawsze dostaje kolejny numer globalny,
   - po usunięciu kolumny aplikacja kompaktuje numerację globalnie (numery większe od usuniętego przesuwają się o `-1`),
   - jeżeli zapis nie powiedzie się (np. brak uprawnień/połączenia), modal pokaże komunikat błędu z kodem/opisem problemu i nie utrwali nowo dodanego `Rebuy`,
   - podczas zapisu przyciski `Dodaj Rebuy` i `Usuń Rebuy` są czasowo blokowane, żeby uniknąć podwójnego kliknięcia i łatwiej zdiagnozować problem.
   - po zakończeniu zapisu odroczony snapshot z serwera jest bezpiecznie nakładany automatycznie, więc przy seryjnym dodawaniu rebuy nie pojawia się błąd techniczny i nie cofa wpisów.
```
Jest:
```md
   - użyj **Dodaj Rebuy** / **Usuń Rebuy** — pierwsza kolumna pojawia się po kliknięciu **Dodaj Rebuy**,
   - nowe pole `RebuyX` po kliknięciu **Dodaj Rebuy** pojawia się najpierw lokalnie w modalu; zapis do Firebase następuje po zamknięciu modalu albo natychmiast po **Usuń Rebuy**,
   - numeracja `RebuyX` jest globalna dla całej `Tabela12` (wszyscy gracze) i przy dodawaniu zawsze dostaje kolejny numer globalny,
   - po usunięciu kolumny aplikacja kompaktuje numerację globalnie (numery większe od usuniętego przesuwają się o `-1`),
   - jeżeli zapis nie powiedzie się (np. brak uprawnień/połączenia), modal pokaże komunikat błędu z kodem/opisem problemu i nie utrwali nowo dodanego `Rebuy`,
   - podczas zapisu przyciski `Dodaj Rebuy` i `Usuń Rebuy` są czasowo blokowane, żeby uniknąć podwójnego kliknięcia i łatwiej zdiagnozować problem.
   - podczas otwartego modalu snapshot z serwera dla tej sekcji jest odkładany do czasu zakończenia edycji, więc pierwszy wpis po dodaniu `Rebuy` nie jest już cofany przez starszy stan.
```

### Plik `Second/docs/Documentation.md`

#### Zmiana 13
Linia 116
Było:
```md
- `onSnapshot` nie nadpisuje stanu lokalnego w trakcie edycji/zapisu; aktualizacja jest nakładana dopiero po zakończeniu edycji i spadku licznika zapisów do zera.
```
Jest:
```md
- `onSnapshot` nie nadpisuje stanu lokalnego w trakcie edycji/zapisu; aktualizacja jest nakładana dopiero po zakończeniu edycji i spadku licznika zapisów do zera.
- Dla modalu `Tabela12 -> Rebuy gracza` ochrona obejmuje też otwarty draft modalu, więc snapshot nie może przywrócić pustego `Rebuy1` w trakcie pierwszej edycji.
```

#### Zmiana 14
Linie 168-174
Było:
```md
- Obsługuje dodawanie/usuwanie kolejnych pól `Rebuy` oraz zapis do Firestore.
- Po otwarciu pustego modala nie renderuje się żadna kolumna; pierwsza kolumna pojawia się dopiero po kliknięciu `Dodaj Rebuy` (zgodnie z modułem Main).
- Numeracja nagłówków (`Rebuy1..n`) opiera się na trwałych globalnych indeksach (`indexes[]`) dla całej `Tabela12` i nie zależy od kolejności graczy renderowanych aktualnie w tabeli.
- Układ modala (`modal-header` + `modal-body`) jest wierną kopią modala z modułu Main.
- Dodanie nowej kolumny rebuy nadaje `nextIndex = max(indexes)+1` globalnie dla całego turnieju, ale maksimum liczone jest już tylko z wpisów aktywnych graczy (`players[].id`).
```
Jest:
```md
- Obsługuje dodawanie/usuwanie kolejnych pól `Rebuy` oraz zapis do Firestore.
- Modal korzysta z lokalnego draftu (`table12RebuyModalDraft`) i flagi brudnych zmian (`table12RebuyModalDirty`), dzięki czemu pierwsze dodane pole nie jest zapisywane jako pusty rekord.
- Po otwarciu pustego modala nie renderuje się żadna kolumna; pierwsza kolumna pojawia się dopiero po kliknięciu `Dodaj Rebuy` (zgodnie z modułem Main).
- Numeracja nagłówków (`Rebuy1..n`) opiera się na trwałych globalnych indeksach (`indexes[]`) dla całej `Tabela12` i nie zależy od kolejności graczy renderowanych aktualnie w tabeli.
- Układ modala (`modal-header` + `modal-body`) jest wierną kopią modala z modułu Main.
- Dodanie nowej kolumny rebuy nadaje `nextIndex = max(indexes)+1` globalnie dla całego turnieju, ale maksimum liczone jest już tylko z wpisów aktywnych graczy (`players[].id`).
- `Dodaj Rebuy` aktualizuje najpierw tylko lokalny draft i główny stan UI; zapis pustej kolumny do Firestore nie jest wykonywany od razu.
```

#### Zmiana 15
Linia 224
Było:
```md
- Zmiana w polu rebuy jest od razu sanityzowana do cyfr, zapisywana (`saveState()`) i od razu odświeża `Tabela12`.
```
Jest:
```md
- Zmiana w polu rebuy jest od razu sanityzowana do cyfr i aktualizuje lokalny stan/draft oraz `Tabela12`; zapis do Firebase wykonywany jest przy zamknięciu modalu z niezapisanymi zmianami albo przy operacji `Usuń Rebuy`.
```
