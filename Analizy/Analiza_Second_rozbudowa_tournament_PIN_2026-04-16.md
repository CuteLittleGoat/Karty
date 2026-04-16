# Analiza wdrożenia zmian w module Second (2026-04-16)

## Prompt użytkownika

> Przeprowadź analizę modułu Second.
> Chcę rozbudować aplikację o kilka rzeczy. Przeprowadź analizę wdrożenia.
>
> 1. Zmień nazwę zakładki "Losowanie Graczy" na "Lista Graczy"
>
> 2. Zakładka "Czat" ma być przesunięta do panelu bocznego w zakładce "Tournament of Poker". Ma być między "Lista Graczy" (zmiana nazwy z "Losowanie graczy" - wymaganie punkt 1) a "Losowanie stołów"
>
> 3. Zakładkę "Losowanie Stołów" dodać jako pole do wyboru w modalu "Uprawnienia gracza".
>
> 4. Z zakładki "Finał" usunąć grafikę stołu. Tej funkcjonalności nie będziemy rozwijać. Jeżeli w kodzie są jakieś ślady po grafice stołu, ustalaniu miejsc graczy, wyświetlaniu ich itp. to skasuj to.
>
> 5. Sprawdź funkcjonalność działania PIN w widoku użytkownika. Działaniem oczekiwanym jest, żeby użytkwnik po wpisaniu PIN (ustalany w zakładce "Lista Graczy" zmiana nazwy z "Losowanie graczy" - wymaganie punkt 1) miał dostęp do zakładek, które admin ustali ale tylko do odczytu. Bez możliwości edycji jakiegokolwiek pola. Jedynym wyjątkiem jest zakładka "Czat". Jeżeli użytkownik ma dostęp do zakładki "Czat" to będzie mógł pisać wiadomości. Możesz sprawdzić jak to wygląda i działa w module Main.
>
> 6. Należy dodać nową tabelę. TABELA23A. Ma się ona pojawiać pod TABELA23 i zawierać graczy, którzy w TABELA23 mają zaznaczony checkbox ELIMINATED. Tabela ma też mieć strzałki do przesuwania graczy. Podobne tabele już istnieją jako TABELA19A i TABELA22A.
>
> 7. Trzeba zmienić zasadę działania TABELA24. Działaniem oczekiwanym jest, żeby ilość wierszy w tabeli odpowiadała ilości graczy w "Lista Graczy" (zmiana nazwy z "Losowanie graczy" - wymaganie punkt 1). Uzupełnianie danymi graczy będzie działać w następujący sposób:
> - Uzupełnia się danymi graczy od ostatniego miejsca. Najpierw wypełnia się danymi graczy z TABELA19A. Czyli LP1 z TABELA19A jest przepisywane na ostatnie miejsce w TABELA24. LP2 z TABELA19A jest przepisywane na przedostatnie miejsce w TABELA24.
> - Po zapełnieniu wszystkich miejsc z TABELA19A uzupełniane są miejsca od ostatniego wolnego danymi z TABELA22A.
> - Po zapełnieniu wszystkich miejsc z TABEALA22A uzupełnianie są miejsca od ostatniego wolnego danymi z TABELA23A (nowa tabela, wymaganie punkt 6).
>
> Przykład:
>
> Mam 10 graczy.
> 3 jest w TABELA19A
> 3 jest w TABELA22A
> 4 jest w TABELA23A
> TABELA24 zawiera 10 wierszy.
>
> LP1 z TABELA19A jest przypisany to miejsca 10 w TABELA24
> LP2 z TABELA19A jest przypisany to miejsca 9 w TABELA24
> LP3 z TABELA19A jest przypisany to miejsca 8 w TABELA24
> LP1 z TABELA22A jest przypisany to miejsca 7 w TABELA24
> LP2 z TABELA22A jest przypisany to miejsca 6 w TABELA24
> LP3 z TABELA22A jest przypisany to miejsca 5 w TABELA24
> LP1 z TABELA23A jest przypisany to miejsca 4 w TABELA24
> LP2 z TABELA23A jest przypisany to miejsca 3 w TABELA24
> LP3 z TABELA23A jest przypisany to miejsca 2 w TABELA24
> LP4 z TABELA23A jest przypisany to miejsca 1 w TABELA24
>
> Wszystkie dane muszą się zapisywać po każdym resecie przeglądarki/aplikacji.
>
> Przeprowadź analizę wprowadzenia tych zmian.

---

## Stan obecny (Second) — wnioski

1. **Nazwy i pozycje sekcji Tournament of Poker** są zdefiniowane statycznie w `Second/index.html` dla admina i użytkownika; aktualnie występuje etykieta „Losowanie graczy”, a „Czat” znajduje się jako osobna zakładka główna użytkownika, nie jako sekcja w sidebarze Tournament.  
2. **Modal „Uprawnienia gracza”** bazuje na `SECOND_AVAILABLE_PLAYER_PERMISSIONS` i obecnie nie zawiera pozycji odpowiadającej sekcji `draw` („Losowanie stołów”).  
3. **Sekcja „Finał”** renderuje `TABELA23` oraz dodatkowo SVG stołu pokerowego z rozmieszczeniem etykiet graczy; logika SVG jest utrzymywana bezpośrednio w kodzie renderującym widok finalny.  
4. **PIN w widoku użytkownika** już ogranicza dostęp do sekcji po uprawnieniach i dla większości sekcji renderuje dane w formie tylko do odczytu, ale „Czat” jest osobnym tabem (poza Tournament) i ma własną bramkę PIN.  
5. **TABELA24** budowana jest przez `buildPlacementRows(...)` z kolejnością: od końca `groupRows + semiRows`, a następnie od początku `finalRows`; to nie odpowiada nowej wymaganej regule (19A → 22A → 23A od końca).  
6. **Trwałość danych po resecie** opiera się na zapisie całego `tournamentState` do Firestore (`second_tournament/state`) i odczycie przez snapshot listener, więc po dodaniu nowych pól do stanu i ich normalizacji można zachować persistencję.

---

## Analiza wdrożenia — zakres zmian

### 1) „Losowanie graczy” → „Lista graczy”

**Pliki:**
- `Second/index.html` (sidebar admin + sidebar user w `tournamentTab`).
- `Second/app.js` (tam gdzie etykieta jest renderowana w treści dynamicznej lub mapach etykiet).

**Uwagi wdrożeniowe:**
- Zmiana etykiety nie powinna zmieniać klucza sekcji (`players`), aby nie łamać logiki uprawnień i routingu.
- Trzeba zaktualizować także ewentualne komunikaty statusów odnoszące się do tej nazwy.

### 2) Przeniesienie „Czat” do sidebaru Tournament (między „Lista graczy” i „Losowanie stołów”)

**Pliki:**
- `Second/index.html`: usunięcie głównej zakładki użytkownika `chatTab` i dodanie przycisku `data-tournament-target="chatTab"` w obu sidebarach Tournament.
- `Second/app.js`: rozszerzenie renderowania sekcji Tournament o `chatTab` (admin i user), oraz aktualizacja map uprawnień.

**Wpływ funkcjonalny:**
- Jedna ścieżka nawigacji dla czatu (wewnątrz Tournament), spójna z wymogiem.
- Należy rozważyć migrację/kompatybilność istniejącego kodu, który dziś oczekuje `#chatTab` jako oddzielnego panelu użytkownika.

### 3) „Losowanie stołów” jako opcja w „Uprawnienia gracza”

**Plik:** `Second/app.js`
- dodać wpis `{ key: "draw", label: "Losowanie stołów" }` do `SECOND_AVAILABLE_PLAYER_PERMISSIONS`;
- dodać mapowanie `draw: "Losowanie stołów"` do `SECOND_TOURNAMENT_PERMISSION_MAP`.

**Efekt:**
- Admin może włączać/wyłączać dostęp PIN-owy do sekcji „Losowanie stołów”.

### 4) Usunięcie grafiki stołu z „Finał” + cleanup śladów

**Plik:** `Second/app.js`
- w gałęzi `activeSection === "final"` usunąć całą kalkulację geometrii SVG (`width/height/cx/cy/rx/ry/labels`) i sam `<svg ...>`.
- zostawić samą tabelę (`TABELA23`) oraz logikę danych potrzebną do kolejnych tabel/wypłat.

**Ważne:**
- Nie usuwać logiki rankingów i eliminacji potrzebnej do `TABELA23A` i `TABELA24`.
- Usunąć także klasy/style `.poker-table-svg` ze `Second/styles.css` (jeśli już nieużywane).

### 5) Weryfikacja PIN (read-only + wyjątek czatu)

**Wniosek po analizie obecnego kodu:**
- Mechanizm PIN już filtruje widoczność sekcji po uprawnieniach (`renderTournamentButtonsForPlayer`).
- Dla sekcji danych użytkownik dostaje readonly/tekstowe renderowanie (bez zapisów), ale trzeba dopiąć nową sekcję `chatTab` w Tournament i zapewnić, że tylko ona ma inputy aktywne.

**Co doprecyzować we wdrożeniu:**
- Po przeniesieniu czatu do Tournament usunąć duplikację gate’ów PIN (jeden centralny mechanizm uprawnień).
- Potwierdzić, że w widoku user nie zostają aktywne `<input>/<select>` poza czatem.
- Zachować semantykę z Main: dostęp sekcyjny po PIN + czat pisalny tylko z uprawnieniem czatu.

### 6) Nowa TABELA23A (gracze ELIMINATED z TABELA23 + strzałki)

**Nowe dane stanu:**
- `tournamentState.final.eliminatedOrder` (analogicznie do `group.eliminatedOrder` i `semi.eliminatedOrder`).

**Plik:** `Second/app.js`
- normalizacja nowego pola w `normalizeTournamentState`.
- wyliczenie `finalEliminatedRows` przez `syncOrderedPlayerIds(...)` na bazie `finalPlayers` z zaznaczonym `eliminated`.
- render `TABELA23A` pod `TABELA23` z przyciskami `▲/▼` (`data-role="final-eliminated-move"`).
- obsługa kliknięć reorder w `container.addEventListener("click", ...)`.

### 7) Zmiana reguły TABELA24

**Aktualny mechanizm:** `buildPlacementRows` miesza `groupRows + semiRows` od końca i `finalRows` od początku.

**Docelowy mechanizm:**
- liczba pozycji = liczba graczy z „Lista graczy”;
- od końca kolejno wkładamy: `TABELA19A`, potem `TABELA22A`, potem `TABELA23A`;
- `LP1` każdej z tych tabel trafia na „ostatnie wolne miejsce” (czyli malejąco po indeksie miejsca).

**Rekomendowana implementacja:**
- zastąpić `buildPlacementRows(...)` nową funkcją, np. `buildPayoutRowsFromEliminationQueues({ players, groupRows, semiRows, finalRows, payoutDefaults })`.
- algorytm:
  1. `placements = Array(totalPlayers).fill(null)`
  2. `cursor = totalPlayers - 1`
  3. iteracja po kolejkach `[groupRows, semiRows, finalRows]`
  4. dla każdego wiersza: jeśli `cursor >= 0`, wpisz do `placements[cursor]`, potem `cursor--`
  5. brakujące miejsca zostają puste (`-`).

**Uwaga o spójności danych:**
- `finalRows` do TABELA24 powinny pochodzić z nowej `TABELA23A`, nie z całego `finalPlayers`.

### 8) Persistencja po resecie przeglądarki/aplikacji

Do dopilnowania w kodzie:
- każde nowe pole (`final.eliminatedOrder`) musi być częścią obiektu stanu i normalizacji,
- po akcjach reorder / checkbox `final-player-eliminated` musi iść zapis `saveTournamentState()` (jest już używany przez istniejące akcje),
- nie opierać kolejności TABELA23A wyłącznie na transientnym renderze.

---

## Sugerowana kolejność wdrożenia

1. Refaktor nawigacji UI (rename + relokacja czatu do Tournament).
2. Rozszerzenie systemu uprawnień o `draw`.
3. Cleanup „Finał” (usunięcie SVG + CSS).
4. Dodanie stanu i UI `TABELA23A` + reorder.
5. Podmiana algorytmu `TABELA24` na nową regułę.
6. Testy regresji PIN + readonly + persistencja Firestore.

---

## Plan testów po wdrożeniu

1. **Nawigacja i etykiety**
- w admin i user: „Lista graczy”, następnie „Czat”, następnie „Losowanie stołów”.

2. **Uprawnienia gracza**
- w modalu widoczna opcja „Losowanie stołów”, zapis i ponowny odczyt działa.

3. **PIN user**
- bez PIN: brak dostępu do sekcji chronionych,
- z PIN bez czatu: brak możliwości pisania na czacie,
- z PIN z czatem: wysyłanie wiadomości działa.

4. **Readonly**
- wszystkie sekcje poza czatem bez możliwości edycji (brak aktywnych inputów/akcji modyfikujących).

5. **Finał / TABELA23A**
- zaznaczenie ELIMINATED w TABELA23 dodaje gracza do TABELA23A,
- strzałki w TABELA23A zmieniają kolejność,
- po odświeżeniu kolejność zostaje.

6. **TABELA24 (kluczowy test)**
- scenariusz 10 graczy: 3 z 19A, 3 z 22A, 4 z 23A,
- weryfikacja przypisań miejsc 10→1 dokładnie jak w wymaganiu.

7. **Persistencja**
- restart przeglądarki/aplikacji: stan PIN/uprawnień i tabel turniejowych odtwarza się z Firestore.

---

## Ryzyka i punkty uwagi

- Przeniesienie czatu do Tournament wymaga spójnego przepięcia selektorów DOM; częściowe przeniesienie może złamać subskrypcję czatu.
- Zmiana algorytmu TABELA24 wpływa na wyliczenia wypłat i może zmienić dotychczasowe wyniki historyczne.
- Usuwając SVG z „Finał”, trzeba upewnić się, że żaden styl/JS nie zakłada obecności `.poker-table-svg`.
- Dla pełnej zgodności UX warto zachować semantykę dostępu PIN analogiczną do Main (sekcje po uprawnieniach + czat jako jedyna sekcja interaktywna dla usera).

---

## Prompt użytkownika (rozbudowa analizy — 2026-04-16)

> Przeczytaj i rozbuduj analizę Analizy/Analiza_Second_rozbudowa_tournament_PIN_2026-04-16.md  
> Nic nie usuwaj tylko dodaj nowe informacje.
>
> Dodatkowa uwaga: Wszystkie obecne dane traktujemy jako testowe. Nie ma potrzeby zachowania danych historycznych.
>
> Następnie dodaj sekcję z planowanymi zmianami w kodzie. Dokładnie ją opisz według wzoru:
>
> [Nazwa pliku], linia: [Linia kodu]
> Jest: [jest obecnie]
> Będzie: [jak ma być po zmianie]

## Rozbudowanie analizy (uzupełnienie)

### Założenie nadrzędne: dane testowe i brak wymogu zachowania historii

Na potrzeby wdrożenia przyjmujemy, że obecny stan danych jest **testowy**, a migracja kompatybilna wstecznie nie jest wymagana. W praktyce upraszcza to wdrożenie i pozwala:

1. **Wprowadzać zmiany struktury stanu bez warstwy migracyjnej** (np. nowe pola w `final` i nowa logika budowania TABELA24).
2. **Nadpisywać pola pochodne** (np. listy pozycji/porządki eliminacji) bez prób zachowania poprzednich układów.
3. **Uprościć cleanup UI/DOM** (np. usunięcie osobnej zakładki `chatTab` z user-tabs i osadzenie czatu wewnątrz Tournament).
4. **Utrzymać tylko spójność bieżącego stanu**, nie odtwarzanie dawnych wariantów logiki.

### Konsekwencje techniczne tego założenia

- Nie trzeba zachowywać zgodności z historycznym sposobem wyliczania TABELA24 (`buildPlacementRows` w obecnej postaci może zostać zastąpione nową funkcją).
- Wystarczy normalizacja nowego modelu `tournamentState` po stronie `normalizeTournamentState(...)` i jednolity zapis do `second_tournament/state`.
- Można usunąć nieużywany kod wizualizacji stołu finałowego (SVG + CSS), bez utrzymywania fallbacków.

### Doprecyzowanie logiki PIN po przeniesieniu czatu do Tournament

Po przeniesieniu czatu do panelu bocznego Tournament rekomendowany jest jeden spójny mechanizm:

- PIN gracza odblokowuje sekcje zgodnie z uprawnieniami.
- Sekcje turniejowe (players/draw/payments/pool/group/semi/final/payouts) w user view pozostają tylko do odczytu.
- Sekcja `chatTab` w Tournament pozostaje jedyną interaktywną (wysyłanie wiadomości), ale tylko jeśli gracz ma uprawnienie „Czat”.

Dzięki temu nie będzie podwójnego „gate” (osobno dla starego `#chatTab` i osobno dla Tournament).

### Doprecyzowanie TABELA23A i wpływu na TABELA24

- `TABELA23A` powinna być budowana wyłącznie z graczy z `TABELA23` mających `ELIMINATED = true`.
- Kolejność `TABELA23A` musi być ręcznie przestawialna (▲/▼), analogicznie do 19A i 22A.
- Źródłem dla końcowego fragmentu przypisań TABELA24 ma być kolejność z `TABELA23A`, nie surowa lista `finalPlayers`.

To eliminuje niejednoznaczność i zapewnia deterministyczne przypisanie miejsc 1..N.

## Planowane zmiany w kodzie (wg wzoru)

Second/index.html, linia: 134  
Jest: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Losowanie graczy</button>`  
Będzie: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Lista graczy</button>`

Second/index.html, linia: 236  
Jest: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Losowanie graczy</button>`  
Będzie: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Lista graczy</button>`

Second/index.html, linia: 161  
Jest: `<button class="tab-button" type="button" data-target="chatTab" data-requires-player-pin="true">Czat</button>`  
Będzie: `<!-- usunięte z głównych zakładek użytkownika; czat przeniesiony do sidebaru Tournament -->`

Second/index.html, linia: 135  
Jest: `<button class="admin-games-year-button" type="button" data-tournament-target="draw">Losowanie stołów</button>`  
Będzie: `<button class="admin-games-year-button" type="button" data-tournament-target="chatTab">Czat</button><button class="admin-games-year-button" type="button" data-tournament-target="draw">Losowanie stołów</button>`

Second/index.html, linia: 237  
Jest: `<button class="admin-games-year-button" type="button" data-tournament-target="draw">Losowanie stołów</button>`  
Będzie: `<button class="admin-games-year-button" type="button" data-tournament-target="chatTab">Czat</button><button class="admin-games-year-button" type="button" data-tournament-target="draw">Losowanie stołów</button>`

Second/app.js, linia: 790  
Jest: `{ key: "chatTab", label: "Czat" },`  
Będzie: `{ key: "chatTab", label: "Czat" }, { key: "draw", label: "Losowanie stołów" },`

Second/app.js, linia: 801  
Jest: `payments: "Wpłaty",`  
Będzie: `draw: "Losowanie stołów", payments: "Wpłaty",`

Second/app.js, linia: 635  
Jest: `eliminated: {}`  
Będzie: `eliminated: {}, eliminatedOrder: []`

Second/app.js, linia: 679  
Jest: `state.final.eliminated = state.final.eliminated || {};`  
Będzie: `state.final.eliminated = state.final.eliminated || {}; state.final.eliminatedOrder = Array.isArray(state.final.eliminatedOrder) ? state.final.eliminatedOrder.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];`

Second/app.js, linia: 715  
Jest: `const buildPlacementRows = ({ players, groupRows, semiRows, finalRows, payoutDefaults }) => {`  
Będzie: `const buildPlacementRowsFromQueues = ({ players, groupRows, semiRows, finalRows, payoutDefaults }) => {`

Second/app.js, linia: 720  
Jest: `[...groupRows, ...semiRows].forEach((row) => {`  
Będzie: `[groupRows, semiRows, finalRows].forEach((queue) => queue.forEach((row) => { ...wstawianie od końca... }));`

Second/app.js, linia: 726  
Jest: `let nextFromStart = 0;`  
Będzie: `// usunięte — finalRows także są wkładane od końca jako trzecia kolejka`

Second/app.js, linia: 1896  
Jest: `const width = 700;`  
Będzie: `// usunięte razem z całą geometrią SVG stołu`

Second/app.js, linia: 1908  
Jest: ``mount.innerHTML = `<h3>TABELA23</h3>...<svg ... class="poker-table-svg">...</svg>`;``  
Będzie: ``mount.innerHTML = `<h3>TABELA23</h3>...</div><h3>TABELA23A</h3>...tabela eliminacji z przyciskami ▲/▼...`;``

Second/app.js, linia: 1961  
Jest: `finalRows: [...finalActivePlayers, ...finalEliminatedPlayers],`  
Będzie: `finalRows: finalEliminatedRowsOrderedFromTable23A,`

Second/app.js, linia: 2063  
Jest: `if (target.checked && !tournamentState.semi.eliminatedOrder.includes(target.dataset.playerId)) {`  
Będzie: `// analogiczna obsługa dodana także dla roli final-player-eliminated i listy tournamentState.final.eliminatedOrder`

Second/app.js, linia: 2182  
Jest: `const currentIndex = tournamentState.semi.eliminatedOrder.indexOf(playerId);`  
Będzie: `// analogiczna gałąź dodana dla data-role="final-eliminated-move" i tablicy tournamentState.final.eliminatedOrder`

Second/styles.css, linia: 1977  
Jest: `.poker-table-svg { ... }`  
Będzie: `/* blok usunięty jako nieużywany po usunięciu grafiki stołu z sekcji Finał */`

### Uwaga implementacyjna do planu

Ponieważ dane są testowe, po wdrożeniu można jednorazowo zresetować dokument `second_tournament/state` do nowego, czystego schematu i rozpocząć walidację od scenariuszy kontrolnych (10 graczy: 19A/22A/23A). Dzięki temu testy końcowe będą jednoznaczne i bez wpływu starszych wpisów.

## Aktualizacja po wdrożeniu zmian w kodzie (2026-04-16)

Plik `Second/index.html`  
Linia 134  
Było: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Losowanie graczy</button>`  
Jest: `<button class="admin-games-year-button is-active" type="button" data-tournament-target="players">Lista graczy</button>`

Plik `Second/index.html`  
Linia 135  
Było: `<button class="admin-games-year-button" type="button" data-tournament-target="draw">Losowanie stołów</button>`  
Jest: `<button class="admin-games-year-button" type="button" data-tournament-target="chatTab">Czat</button>`

Plik `Second/index.html`  
Linia 161  
Było: `<button class="tab-button" type="button" data-target="chatTab" data-requires-player-pin="true">Czat</button>`  
Jest: `<!-- usunięto osobną zakładkę Czat; czat działa jako sekcja Tournament -->`

Plik `Second/app.js`  
Linia 635  
Było: `eliminated: {}`  
Jest: `eliminated: {}, eliminatedOrder: []`

Plik `Second/app.js`  
Linia 717  
Było: `const buildPlacementRows = ({ players, groupRows, semiRows, finalRows, payoutDefaults }) => {`  
Jest: `const buildPlacementRowsFromQueues = ({ players, groupRows, semiRows, finalRows, payoutDefaults }) => {`

Plik `Second/app.js`  
Linia 722  
Było: `[...groupRows, ...semiRows].forEach((row) => { ... });`  
Jest: `[groupRows, semiRows, finalRows].forEach((queue) => { queue.forEach((row) => { ... }); });`

Plik `Second/app.js`  
Linia 786  
Było: `{ key: "payments", label: "Wpłaty" },`  
Jest: `{ key: "draw", label: "Losowanie stołów" },`

Plik `Second/app.js`  
Linia 1765  
Było: `// brak sekcji admina dla chatTab w Tournament`  
Jest: `if (activeSection === "chatTab") { ... }`

Plik `Second/app.js`  
Linia 1905  
Było: `mount.innerHTML = ... TABELA23 ... <svg ... class="poker-table-svg">...</svg>;`  
Jest: `mount.innerHTML = ... TABELA23 ... TABELA23A ...;`

Plik `Second/app.js`  
Linia 1959  
Było: `finalRows: [...finalActivePlayers, ...finalEliminatedPlayers],`  
Jest: `finalRows: finalEliminatedRows,`

Plik `Second/app.js`  
Linia 2068  
Było: `if (role === "final-player-eliminated") tournamentState.final.eliminated[target.dataset.playerId] = target.checked;`  
Jest: `if (role === "final-player-eliminated") { ... aktualizacja final.eliminated + final.eliminatedOrder ... }`

Plik `Second/app.js`  
Linia 2197  
Było: `// brak obsługi data-role="final-eliminated-move"`  
Jest: `if (role === "final-eliminated-move") { ... przestawianie final.eliminatedOrder ... }`

Plik `Second/app.js`  
Linia 2331  
Było: `// chat renderowany wyłącznie jako osobna zakładka #chatTab`  
Jest: `const renderUserChatSection = () => { ... chat renderowany wewnątrz Tournament ... };`

Plik `Second/styles.css`  
Linia 1977  
Było: `.poker-table-svg { ... }`  
Jest: `/* usunięte jako nieużywane po usunięciu grafiki stołu */`
