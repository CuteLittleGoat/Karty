# Analiza wdrożenia kolumny „POZYCJA” w TABELA19A (moduł Second)

## Prompt użytkownika
> Przeczytaj kod źródłowy strony https://cutelittlegoat.github.io/WrathAndGlory/Audio/index.html?admin=1  
> Na panelu z prawej strony jak są listy ulubionych są strzałki "góra" i "dół" (załączam screena)  
>  
> W module Second w panelu "Faza Grupowa" jest TABELA19A  
> Pojawiają się na niej gracze, którzy w TABELA19 w kolumnie ELIMINATED mają zaznaczony checkbox.  
> Chciałbym, żeby w TABELA19A dodać kolumnę "POZYCJA". W tej kolumnie byłyby strzałki góra i dół pozwalające przesuwać graczy na liście. Numer LP byłby bez zmian. Wartość w kolumnie WYGRANA wciąż byłaby przypisana do gracza a nie jego pozycji w TABELA19A.  
> Obecny mechanizm dodawania kolejnych graczy do TABELA19A byłby jako domyślny. Admin mógłby strzałkami modyfikować kolejność.  
> Zadbaj o stylistykę przycisków zgodną z resztą aplikacji.  
> Przeprowadź mi analizę wprowadzenia takiej funkcjonalności w module Second.

## Zakres analizy
Analiza obejmuje wyłącznie moduł `Second` oraz porównanie z mechanizmem strzałek góra/dół z referencyjnej strony `WrathAndGlory/Audio/index.html?admin=1`.

## Stan obecny w module Second
1. Widok `Faza Grupowa` jest renderowany w `Second/app.js` wewnątrz gałęzi `activeSection === "group"`.
2. Dane do `TABELA19`, `TABELA19A` i `TABELA19B` są wyliczane z jednej listy `groupRows` powstałej na podstawie `groupedDrawRows`.
3. `TABELA19A` buduje się obecnie przez zwykły filtr:
   - `const eliminatedRows = groupRows.filter((row) => row.eliminated);`
4. Oznacza to, że kolejność wierszy w `TABELA19A` jest dziś całkowicie pochodną kolejności `groupRows`, czyli domyślnie kolejności z `TABELA19`.
5. Pole `WYGRANA` jest już prawidłowo związane z `playerId`, bo wartość pochodzi z `tournamentState.group.eliminatedWins[row.playerId]`.
6. Zmiany checkboxa `ELIMINATED` zapisują się do `tournamentState.group.eliminated[playerId]`, a po renderze gracz automatycznie przechodzi do `TABELA19A` albo `TABELA19B`.

## Wnioski z kodu strony referencyjnej
Na stronie `WrathAndGlory/Audio/index.html?admin=1` mechanizm strzałek działa bardzo prosto i dobrze pasuje do architektury `Second`:
1. Przyciski są renderowane bezpośrednio w wierszu elementu.
2. Dla pierwszego elementu przycisk „góra” jest zablokowany, a dla ostatniego „dół” jest zablokowany.
3. Kliknięcie wywołuje funkcję typu `moveItem(..., direction)`, która:
   - znajduje aktualny indeks elementu,
   - liczy indeks docelowy,
   - wykonuje `splice(index, 1)`,
   - wstawia element pod nowym indeksem przez `splice(target, 0, removed)`,
   - zapisuje stan,
   - robi rerender.
4. Sam mechanizm nie zmienia tożsamości elementu — tylko kolejność w tablicy.

To jest bardzo dobry wzorzec dla `TABELA19A`, bo użytkownik oczekuje identycznego efektu: zmienia się kolejność listy, ale wartości powiązane z graczem zostają przy graczu.

## Najważniejsza obserwacja architektoniczna
Obecny stan `group` nie przechowuje osobnej kolejności dla wyeliminowanych graczy. Są tam tylko:
- `playerStacks`,
- `eliminated`,
- `eliminatedWins`,
- `survivorStacks`.

To oznacza, że samo dodanie przycisków do HTML nie wystarczy. Trzeba w stanie turnieju dodać nową strukturę przechowującą kolejność, np.:
- `group.eliminatedOrder = []`

albo mapę pozycji, ale tablica identyfikatorów będzie prostsza i spójna z mechanizmem referencyjnym.

## Rekomendowany model danych
Najbezpieczniejszy wariant:
- dodać `tournamentState.group.eliminatedOrder` jako tablicę `playerId`.

### Dlaczego tablica jest najlepsza
1. Naturalnie odwzorowuje kolejność wierszy.
2. Ułatwia przesuwanie o 1 w górę / w dół przez ten sam wzorzec `splice`, który działa w stronie referencyjnej.
3. Nie miesza logiki pozycji z logiką danych gracza.
4. Pozwala zachować domyślny mechanizm dodawania nowych graczy do końca listy.
5. Ułatwia czyszczenie stanu przy usunięciu gracza lub odznaczeniu `ELIMINATED`.

## Jak zachować obecny mechanizm jako domyślny
Wymaganie użytkownika mówi, że obecne dodawanie kolejnych graczy do `TABELA19A` ma pozostać domyślne. To można osiągnąć tak:

1. Podstawową listę nadal wyprowadzać z:
   - `groupRows.filter((row) => row.eliminated)`
2. Następnie synchronizować `group.eliminatedOrder` z aktualną listą wyeliminowanych:
   - usunąć z `eliminatedOrder` identyfikatory graczy, którzy już nie są wyeliminowani,
   - dopisać na końcu tych nowych wyeliminowanych, których jeszcze nie ma w `eliminatedOrder`.
3. Dopiero na końcu renderować `eliminatedRows` w kolejności z `eliminatedOrder`.

Dzięki temu:
- nowo zaznaczony gracz domyślnie trafia na koniec listy,
- admin może potem ręcznie zmienić kolejność,
- odznaczenie checkboxa usuwa gracza z tej kolejki,
- ponowne zaznaczenie doda go znowu na koniec, co jest logiczne i przewidywalne.

## Zakres zmian w kodzie

### 1. Rozszerzenie stanu domyślnego i normalizacji
Do aktualizacji będą miejsca:
- `createTournamentDefaultState()`
- `normalizeTournamentState()`
- dodatkowo sekcja ochronna przed renderem w części `group`

Cel:
- zawsze mieć `tournamentState.group.eliminatedOrder` jako tablicę.

### 2. Synchronizacja kolejności z aktualną listą wyeliminowanych
W sekcji obliczającej dane dla `Faza Grupowa` trzeba dodać mechanizm synchronizacji `eliminatedOrder` z aktualnymi danymi `groupRows`.

Przykładowa logika:
1. Zbudować `defaultEliminatedRows` z `groupRows.filter((row) => row.eliminated)`.
2. Zbudować zbiór `eliminatedIds`.
3. Oczyścić `eliminatedOrder` z nieaktualnych wpisów.
4. Dopisać brakujące `playerId` na końcu w kolejności wynikającej z `defaultEliminatedRows`.
5. Zmapować końcową kolejność na pełne wiersze.

### 3. Rozbudowa HTML TABELA19A
Tabela wymaga nowej kolumny:
- `POZYCJA`

Nowy układ nagłówka:
- `LP`
- `WYELIMINOWANI GRACZE`
- `POZYCJA`
- `WYGRANA`

W kolumnie `POZYCJA` dla każdego wiersza powinny się znaleźć dwa przyciski:
- góra,
- dół.

Zachowanie przycisków:
- pierwszy wiersz: `góra` disabled,
- ostatni wiersz: `dół` disabled,
- środkowe: oba aktywne.

### 4. Obsługa zdarzeń kliknięcia
W module `Second` trzeba dopisać nowy `data-role` lub `data-action`, np.:
- `group-eliminated-up`
- `group-eliminated-down`

albo jeden wspólny `data-role="group-eliminated-move"` z `data-direction`.

Rekomenduję drugi wariant, bo:
- jest krótszy,
- mniej duplikuje kod,
- łatwiej go rozszerzyć.

Przykładowy przepływ:
1. Klik w przycisk odczytuje `playerId` i `direction`.
2. Funkcja znajduje indeks gracza w `tournamentState.group.eliminatedOrder`.
3. Wylicza nowy indeks.
4. Jeśli nowy indeks jest poza zakresem, kończy działanie.
5. Przesuwa `playerId` przez `splice`.
6. Zapisuje stan i robi `render()`.

### 5. Czyszczenie stanu przy usunięciu gracza
W aktualnym kodzie przy usuwaniu gracza kasowane są:
- `group.playerStacks[playerId]`
- `group.eliminated[playerId]`
- `group.eliminatedWins[playerId]`
- `group.survivorStacks[playerId]`

Trzeba dopisać także usunięcie `playerId` z `group.eliminatedOrder`, aby nie zostawały martwe identyfikatory.

## Dlaczego `WYGRANA` pozostanie przypisana do gracza
To wymaganie jest już zgodne z aktualną strukturą aplikacji.

`WYGRANA` nie jest liczona po indeksie wiersza, tylko po `playerId`. Oznacza to, że po dodaniu osobnej kolejności:
- przesunięcie wiersza nie zmieni wartości wpisanej dla gracza,
- input nadal pokaże tę samą wartość, bo odczyt będzie szedł z `group.eliminatedWins[row.playerId]`.

Czyli ten aspekt jest niski kosztowo i architektonicznie bezpieczny.

## Wpływ na numerację LP
Użytkownik napisał: „Numer LP byłby bez zmian.”

Są tu możliwe dwie interpretacje:

### Interpretacja A — LP ma zostać zgodne z kolejnością z TABELA19
To jest najspójniejsze z treścią prośby.
Wtedy w `TABELA19A` nie należy liczyć `index + 1`, tylko wyświetlać oryginalne `row.lp` z `groupRows`.

Efekt:
- przesuwamy tylko wizualną pozycję w liście wyeliminowanych,
- LP nadal pokazuje pierwotny numer gracza wynikający z `TABELA19`.

### Interpretacja B — LP zostaje jak dziś, czyli 1..N w widoku TABELA19A
To byłoby sprzeczne z prośbą o „bez zmian”, bo dziś po każdej zmianie kolejności numeracja oparta o indeks zmieniałaby się razem z wierszem.

## Rekomendacja biznesowa
Rekomenduję **Interpretację A**:
- w `TABELA19A` pozostawić LP z `row.lp`,
- kolumna `POZYCJA` ma odpowiadać za ręczne ustawienie kolejności,
- `WYGRANA` pozostaje na `playerId`.

To najwierniej realizuje wymaganie użytkownika.

## Proponowany sposób stylizacji
W aplikacji `Second` istnieją już globalne style przycisków:
- `button`
- `button.secondary`
- `button.danger`

Żeby zachować spójność z resztą UI, najlepiej:
1. użyć zwykłych `<button type="button" class="secondary">▲</button>` i `<button ...>▼</button>`,
2. dodać niewielką pomocniczą klasę layoutową tylko dla tej komórki, np. `group-position-controls`,
3. ewentualnie ograniczyć szerokość / padding specjalną klasą pomocniczą, ale bez zmiany globalnego stylu przycisków.

To da efekt wizualnie zbliżony do referencji i jednocześnie zgodny z bieżącym design systemem modułu `Second`.

## Ryzyka i miejsca wymagające ostrożności

### 1. Niespójność kolejności po odświeżeniu
Jeżeli `eliminatedOrder` nie zostanie dodane do normalizacji stanu, po odświeżeniu aplikacja może stracić kolejność albo wejść w `undefined`.

### 2. Martwe identyfikatory
Jeżeli usunięty gracz pozostanie w `eliminatedOrder`, render może próbować mapować nieistniejący rekord. Trzeba filtrować order względem aktualnych wyeliminowanych.

### 3. Dublowanie wpisów
Przy synchronizacji kolejności należy pilnować, żeby dopisywać tylko brakujące `playerId`, inaczej gracz może pojawić się w kolejce dwa razy.

### 4. Fokus inputów
W `TABELA19A` działa mechanizm przywracania fokusu dla pól edytowalnych `WYGRANA`. Dodanie przycisków nie powinno go psuć, ale trzeba uważać, żeby po kliknięciu strzałki render nie zaburzał atrybutów `data-focus-*` inputa.

### 5. Zgodność z analizą o fokusie
Ponieważ w `TABELA19A` nadal istnieje input `WYGRANA`, przy wdrożeniu trzeba sprawdzić zalecenia z `Analizy/Wazne_Fokus.md`, jeśli zadanie przejdzie z analizy do implementacji.

## Szacowany zakres implementacji
To jest zmiana **mała do średniej**:
- logika danych: mała,
- render tabeli: mała,
- obsługa eventów: mała,
- stylowanie: bardzo mała,
- ryzyko regresji: niskie do średniego, głównie przez persystencję i render po kliknięciu.

## Rekomendowany plan wdrożenia
1. Dodać `group.eliminatedOrder` do stanu domyślnego i normalizacji.
2. W sekcji `group` zsynchronizować `eliminatedOrder` z aktualnie wyeliminowanymi graczami.
3. Renderować `TABELA19A` w kolejności wynikającej z `eliminatedOrder`.
4. Zmienić `LP` w `TABELA19A` na `row.lp` zamiast `index + 1`.
5. Dodać kolumnę `POZYCJA` i dwa przyciski `▲` / `▼`.
6. Dodać handler przesuwania wykorzystujący `splice` na `group.eliminatedOrder`.
7. Przy usuwaniu gracza czyścić też `group.eliminatedOrder`.
8. Sprawdzić ręcznie scenariusze:
   - zaznaczenie `ELIMINATED`,
   - odznaczenie `ELIMINATED`,
   - przesunięcie pierwszego / ostatniego gracza,
   - wpisanie `WYGRANA`, potem zmiana pozycji,
   - odświeżenie strony i utrzymanie kolejności.

## Konkluzja
Funkcjonalność jest w obecnej architekturze **łatwa do wdrożenia** i dobrze pasuje do już istniejącego sposobu działania modułu `Second`.

Najważniejsze elementy techniczne są trzy:
1. dodać trwałą tablicę `group.eliminatedOrder`,
2. renderować `TABELA19A` według tej tablicy,
3. sterować kolejnością przez proste przesuwanie `playerId` w tablicy, analogicznie do mechanizmu strzałek z referencyjnej strony audio.

Jeżeli zechcesz, w kolejnym kroku mogę od razu wdrożyć tę funkcję w module `Second` wraz z aktualizacją dokumentacji wymaganej przez repozytorium.
