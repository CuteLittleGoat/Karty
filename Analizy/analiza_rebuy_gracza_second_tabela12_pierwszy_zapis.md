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
