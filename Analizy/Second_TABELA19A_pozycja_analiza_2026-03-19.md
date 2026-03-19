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

---

## Uzupełnienie analizy z 2026-03-19 po doprecyzowaniu wymagania

## Dodatkowy prompt użytkownika
> Uzupełnij analizę Analizy/Second_TABELA19A_pozycja_analiza_2026-03-19.md
>
> Celem jest umożliwienie adminowi korektę jeżeli w błędnej kolejności kliknie "ELIMINATED". W kolejnym kroku będzie uzupełniana tabela z rankingiem od pierwszego do ostatniego wyeliminowanego gracza. Dodanie strzałek ma umożliwić korektę kolejności jakby admin źle kliknął.
> Dlatego kolumna LP musi pozostać stała niezależnie od przycisków. Numer 1 zawsze będzie pierwszy na górze, pod nim numer 2. To kolejność graczy ma się zmieniać.

## Doprecyzowanie celu biznesowego
Nowe wyjaśnienie zmienia interpretację poprzedniego fragmentu o kolumnie `LP`.

Wcześniej można było rozważać, czy `LP` ma oznaczać numer źródłowy z `TABELA19`, czy numer pozycji w `TABELA19A`. Po doprecyzowaniu intencja jest już jednoznaczna:
- `LP` w `TABELA19A` ma pozostać stałą numeracją widoku: `1, 2, 3, 4...`,
- numery w kolumnie `LP` nie mogą przemieszczać się razem z graczem,
- przesuwani mają być wyłącznie gracze przypisani do kolejnych wierszy,
- ta kolejność ma odzwierciedlać ranking eliminacji potrzebny do późniejszego uzupełniania następnej tabeli.

Innymi słowy:
- wiersz nr `1` zawsze pozostaje pierwszym wierszem tabeli,
- wiersz nr `2` zawsze pozostaje drugim wierszem tabeli,
- po kliknięciu strzałki zamienia się obsada graczy między wierszami, a nie numeracja `LP`.

## Korekta wcześniejszego wniosku o kolumnie LP
Poprzednia rekomendacja, aby w `TABELA19A` wyświetlać `row.lp` z `TABELA19`, **nie jest zgodna z nowym doprecyzowaniem**.

Po aktualizacji wymagania poprawna interpretacja brzmi:
- `LP` w `TABELA19A` powinno być renderowane jako numer pozycji w tabeli eliminacji, czyli `index + 1`,
- ale ten numer ma wynikać z miejsca w tabeli, a nie z tożsamości gracza,
- więc po przesunięciu gracza numer `LP` pozostaje na swoim miejscu, a gracz pojawia się w innym wierszu.

To oznacza, że logika ma działać dokładnie odwrotnie niż przy prezentowaniu "oryginalnego LP gracza":
- **nie przenosimy numeru razem z graczem**,
- **przenosimy gracza do innego slotu rankingowego**.

## Co to oznacza dla modelu danych
Model z `group.eliminatedOrder = []` pozostaje trafny i nadal jest najlepszym rozwiązaniem.

Trzeba tylko doprecyzować semantykę tej tablicy:
- `eliminatedOrder[0]` = gracz zajmujący pozycję `LP = 1`,
- `eliminatedOrder[1]` = gracz zajmujący pozycję `LP = 2`,
- `eliminatedOrder[2]` = gracz zajmujący pozycję `LP = 3`,
- itd.

Zatem `eliminatedOrder` nie przechowuje "oryginalnych LP", tylko **aktualny ranking kolejności wyeliminowania po korektach admina**.

## Wpływ na rendering TABELA19A
Rendering powinien działać według następującej zasady:
1. Lista wyeliminowanych nadal powstaje na podstawie checkboxów `ELIMINATED`.
2. `group.eliminatedOrder` ustala, który gracz trafia do którego wiersza rankingu.
3. Kolumna `LP` jest wyświetlana jako stałe `index + 1`.
4. Kolumna z graczem pokazuje dane gracza znajdującego się aktualnie na tej pozycji.
5. Kliknięcie `▲` / `▼` zamienia pozycję gracza w rankingu, ale nie zmienia numerów `LP` wyświetlanych przy wierszach.

Przykład:
- przed korektą:
  - `LP 1` → Gracz A
  - `LP 2` → Gracz B
  - `LP 3` → Gracz C
- po przesunięciu Gracza C o jedno miejsce w górę:
  - `LP 1` → Gracz A
  - `LP 2` → Gracz C
  - `LP 3` → Gracz B

Numery `1, 2, 3` zostają na swoich miejscach. Zmienia się tylko obsada graczy.

## Relacja między LP, POZYCJA i przyszłą tabelą rankingową
Z nowego opisu wynika, że `TABELA19A` zaczyna pełnić rolę pomocniczej listy rankingowej:
- kolejność wierszy ma odzwierciedlać kolejność eliminacji po ręcznej korekcie,
- ta kolejność ma być potem wykorzystana do uzupełnienia kolejnej tabeli,
- z perspektywy biznesowej `LP` staje się więc numerem miejsca w rankingu eliminacji, a nie identyfikatorem gracza z tabeli źródłowej.

To ma ważną konsekwencję projektową:
- jeśli w przyszłym kroku kolejna tabela ma pobierać dane "od pierwszego do ostatniego wyeliminowanego gracza", to najlepiej oprzeć ją bezpośrednio na `group.eliminatedOrder`, a nie próbować ponownie odtwarzać kolejność z `TABELA19`.

## Zachowanie domyślne nadal pozostaje poprawne
Domyślne działanie nadal powinno wyglądać tak samo:
1. Admin zaznacza checkbox `ELIMINATED`.
2. Gracz trafia na koniec `group.eliminatedOrder`.
3. Tabela nadaje mu ostatni numer `LP`.
4. Jeśli admin kliknął checkboxy w złej kolejności, używa strzałek do korekty.

To dokładnie realizuje opisany cel:
- checkbox ustala, że gracz jest wyeliminowany,
- strzałki poprawiają kolejność rankingu eliminacji.

## Zaktualizowana rekomendacja implementacyjna
Po doprecyzowaniu wymagania rekomendacja wdrożeniowa powinna brzmieć tak:

1. Dodać `group.eliminatedOrder` do stanu i normalizacji.
2. Synchronizować tablicę z aktualną listą wyeliminowanych graczy.
3. Renderować `TABELA19A` według `group.eliminatedOrder`.
4. W kolumnie `LP` pokazywać **zawsze** `index + 1`.
5. W kolumnie `POZYCJA` dodać strzałki `▲` / `▼` zmieniające kolejność graczy w `group.eliminatedOrder`.
6. Zachować `WYGRANA` po `playerId`, tak aby wartość przemieszczała się razem z graczem.
7. Przy odznaczeniu `ELIMINATED` usuwać gracza z `group.eliminatedOrder`, a pozostałych automatycznie przesuwać wyżej w numeracji `LP`.

## Zmiana względem poprzedniej wersji analizy
Poprzedni fragment:
- rekomendował pozostawienie `LP` z `row.lp` pochodzącego z `TABELA19`.

Po doprecyzowaniu należy go uznać za **nieaktualny**.

Aktualna, obowiązująca interpretacja jest następująca:
- `LP` w `TABELA19A` to stały numer pozycji rankingowej w widoku,
- gracze mogą zmieniać między sobą miejsca w tych wierszach,
- ranking po korekcie ma odzwierciedlać poprawną kolejność wyeliminowania.

## Ostateczna konkluzja po uzupełnieniu
Najlepszy kierunek wdrożenia pozostaje ten sam technicznie, ale zmienia się znaczenie kolumny `LP`:
- technicznie nadal potrzebna jest trwała tablica `group.eliminatedOrder`,
- funkcjonalnie tabela ma działać jak edytowalny ranking kolejności eliminacji,
- `LP` ma być numerem miejsca w rankingu (`1..N`), stałym dla wiersza,
- przesuwani są gracze, a nie numery.

To doprecyzowanie usuwa wcześniejszą niejednoznaczność i daje bardzo klarowną specyfikację do implementacji w kolejnym kroku.

---

## Sekcja zmian po wdrożeniu (2026-03-19)

### Plik `Second/app.js`

Linie: logika stanu `group`
Było:
```js
  group: {
    playerStacks: {},
    eliminated: {},
    eliminatedWins: {},
    survivorStacks: {}
  },
```
Jest:
```js
  group: {
    playerStacks: {},
    eliminated: {},
    eliminatedOrder: [],
    eliminatedWins: {},
    survivorStacks: {}
  },
```

Linie: normalizacja stanu `group`
Było:
```js
  state.group.playerStacks = state.group.playerStacks || {};
  state.group.eliminated = state.group.eliminated || {};
  state.group.eliminatedWins = state.group.eliminatedWins || {};
  state.group.survivorStacks = state.group.survivorStacks || {};
```
Jest:
```js
  state.group.playerStacks = state.group.playerStacks || {};
  state.group.eliminated = state.group.eliminated || {};
  state.group.eliminatedOrder = Array.isArray(state.group.eliminatedOrder) ? state.group.eliminatedOrder.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];
  state.group.eliminatedWins = state.group.eliminatedWins || {};
  state.group.survivorStacks = state.group.survivorStacks || {};
```

Linie: wyliczanie `Tabela19A`
Było:
```js
    const groupStripeClasses = getAlternatingTableGroupClass(groupedDrawRows, (row) => row.tableId);
    const eliminatedRows = groupRows.filter((row) => row.eliminated);
    const survivorRows = groupRows.filter((row) => !row.eliminated);
```
Jest:
```js
    const groupStripeClasses = getAlternatingTableGroupClass(groupedDrawRows, (row) => row.tableId);
    const defaultEliminatedRows = groupRows.filter((row) => row.eliminated);
    const eliminatedRowsById = new Map(defaultEliminatedRows.map((row) => [row.playerId, row]));
    const syncedEliminatedOrder = tournamentState.group.eliminatedOrder.filter((playerId) => eliminatedRowsById.has(playerId));
    defaultEliminatedRows.forEach((row) => {
      if (!syncedEliminatedOrder.includes(row.playerId)) {
        syncedEliminatedOrder.push(row.playerId);
      }
    });
    tournamentState.group.eliminatedOrder = syncedEliminatedOrder;
    const eliminatedRows = syncedEliminatedOrder.map((playerId) => eliminatedRowsById.get(playerId)).filter(Boolean);
    const survivorRows = groupRows.filter((row) => !row.eliminated);
```

Linie: render `Tabela19A`
Było:
```js
<h3>TABELA19A</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>WYELIMINOWANI GRACZE</th><th>WYGRANA</th></tr></thead><tbody>${eliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td><input class="admin-input" data-role="group-eliminated-win" data-player-id="${row.playerId}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.eliminatedWins[row.playerId] || "0")}" data-focus-target="1" data-section="second-tournament-group-eliminated" data-row-id="${row.playerId}" data-column-key="win"></td></tr>`).join("") || ""}</tbody></table></div>
```
Jest:
```js
<h3>TABELA19A</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>WYELIMINOWANI GRACZE</th><th>POZYCJA</th><th>WYGRANA</th></tr></thead><tbody>${eliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td><div class="group-position-controls"><button class="secondary group-position-button" type="button" data-role="group-eliminated-move" data-player-id="${row.playerId}" data-direction="up" ${index === 0 ? "disabled" : ""}>▲</button><button class="secondary group-position-button" type="button" data-role="group-eliminated-move" data-player-id="${row.playerId}" data-direction="down" ${index === eliminatedRows.length - 1 ? "disabled" : ""}>▼</button></div></td><td><input class="admin-input" data-role="group-eliminated-win" data-player-id="${row.playerId}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.eliminatedWins[row.playerId] || "0")}" data-focus-target="1" data-section="second-tournament-group-eliminated" data-row-id="${row.playerId}" data-column-key="win"></td></tr>`).join("") || '<tr><td colspan="4">Brak danych.</td></tr>'}</tbody></table></div>
```

Linie: obsługa kliknięcia strzałek
Było:
```js
  const tournamentClickActionRoles = new Set([
    "add-player",
    "player-pin-random",
    "player-perm-edit",
    "delete-player",
    "add-table",
    "delete-table",
    "add-pool-mod-row",
    "remove-pool-mod-row",
    "open-table12-rebuy",
    "add-semi-table",
    "remove-semi-table"
  ]);
```
Jest:
```js
  const tournamentClickActionRoles = new Set([
    "add-player",
    "player-pin-random",
    "player-perm-edit",
    "delete-player",
    "add-table",
    "delete-table",
    "add-pool-mod-row",
    "remove-pool-mod-row",
    "open-table12-rebuy",
    "add-semi-table",
    "remove-semi-table",
    "group-eliminated-move"
  ]);
```

Linie: czyszczenie danych przy usuwaniu gracza
Było:
```js
      delete tournamentState.group.playerStacks[playerId];
      delete tournamentState.group.eliminated[playerId];
      delete tournamentState.group.eliminatedWins[playerId];
      delete tournamentState.group.survivorStacks[playerId];
```
Jest:
```js
      delete tournamentState.group.playerStacks[playerId];
      delete tournamentState.group.eliminated[playerId];
      tournamentState.group.eliminatedOrder = (tournamentState.group.eliminatedOrder || []).filter((id) => id !== playerId);
      delete tournamentState.group.eliminatedWins[playerId];
      delete tournamentState.group.survivorStacks[playerId];
```

### Plik `Second/styles.css`

Linie: styl przycisków pozycji w `Tabela19A`
Było:
```css
#adminTournamentRoot .t-inline-add-button {
  justify-self: flex-start;
  width: auto;
}
```
Jest:
```css
#adminTournamentRoot .t-inline-add-button {
  justify-self: flex-start;
  width: auto;
}

#adminTournamentRoot .group-position-controls {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

#adminTournamentRoot .group-position-button {
  min-width: 42px;
  padding-inline: 0;
}
```
