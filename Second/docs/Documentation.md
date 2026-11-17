# Second — dokumentacja techniczna

## Widok użytkownika — szerokość zewnętrznej ramki
- Moduł `Second` **nie ustawia klasy `body.is-admin`**, dlatego reguły pełnej szerokości opierają się na selektorze `.page:has(.user-card)` — karta `user-card` występuje wyłącznie w szablonie użytkownika.
- W widoku użytkownika kontener `.page` ma szerokość `calc(100% - 2px)` i `padding-inline: 1px`, więc panel zewnętrzny dochodzi do 1 px od lewej i prawej krawędzi ekranu.
- W panelu administratora obowiązuje `width: min(1720px, 100%)`, więc panel nie rozciąga się na całą szerokość szerokiego monitora.
- Dla `.user-card` pozostawiono lewy i prawy border o grubości `1px`, a pseudo-element `.user-card::before` jest wyłączony, aby pierwsza zielona ramka miała dokładnie 1 px po bokach.

## System szerokości tabel (Second)

Warstwa prezentacji tabel opiera się na skali tokenów w `Second/styles.css`; pełne przypisanie kolumn opisuje `Kolumny.md`.

### Tokeny
`:root` definiuje dziewięć zmiennych: `--col-num-xs` (64 px), `--col-num-sm` (88 px), `--col-num-md` (112 px), `--col-flag` (128 px), `--col-date` (168 px), `--col-text-sm` (176 px), `--col-text-md` (192 px), `--col-text-lg` (256 px), `--col-actions` (144 px). Wartości wynikają z pomiaru minimalnej szerokości, przy której nic się nie ucina. W breakpointcie `max-width: 720px` zwężają się wyłącznie kolumny liczbowe i `--col-text-lg`. Jednostką jest `rem`, a nie `ch`, bo `ch` zależy od fontu elementu i dawał inną wartość w `<th>` niż w `<td>`.

### Tryby tabel
- `.admin-data-table` — `border-collapse: collapse`, `table-layout: fixed`. Klasa bazowa nie narzuca żadnej minimalnej szerokości; minimum wynika wyłącznie z `--table-min` danej tabeli.
- `.admin-data-table.t-fluid` — `width: 100%`, `min-width: var(--table-min, 0)`.
- `.admin-data-table.t-compact` — `width: var(--table-min, auto)`, `min-width: 0`; dla podsumowań `Tabela10/11/13/14/15/17/18`.
- `.admin-data-table.is-table-stacked` — poniżej 560 px wiersz staje się kartą „etykieta → wartość".

### Helpery w `Second/app.js`
- `COL` — mapa skrótów tokenów (`xs`, `sm`, `md`, `flag`, `date`, `tsm`, `tmd`, `tlg`, `act`) na zmienne CSS.
- `tCols(tokens, mode)` — zwraca `<colgroup>`; jedna kolumna tekstowa (`tlg`, a gdy jej nie ma — `tmd`) dostaje `<col>` bez szerokości i wchłania nadmiar miejsca.
- `tAttr(tokens, mode, extraClass)` — zwraca atrybuty `class` i `style="--table-min: …"` dla `<table>`.
- `tColsAuto(headerHtml, lead, trail, fill)` — dla tabel o zmiennej liczbie kolumn (`Tabela16`); liczy kolumny z wygenerowanego nagłówka i wypełnia środek podanym tokenem.
- `applyStackedLayout(root)` — poniżej 560 px oznacza tabele `t-fluid` w widoku gracza klasą `is-table-stacked` i uzupełnia `data-label` z nagłówka; `Tabela16` jest wykluczona, bo szeroką siatkę liczbową czyta się lepiej z przewijaniem.
- `watchStackedLayout(root)` — `MutationObserver` na kontenerze danych gracza, dzięki czemu etykiety uzupełniają się po każdym przerysowaniu sekcji.

### Pola formularzy w tabelach
`.admin-data-table .admin-input` i `.admin-data-table select.admin-input` mają `min-width: 0`. Bez tego pole narzuca komórce własną szerokość naturalną (ok. 213 px przy domyślnym `size=20`), a `<select>` — szerokość najdłuższej opcji.

### Zachowanie treści i breakpointy
- `.admin-data-table th` — `position: sticky; top: 0` z nieprzezroczystym tłem `var(--table-head-bg)`, `overflow-wrap: break-word`, `letter-spacing: 0.06em`.
- `.admin-data-table td` — `white-space: nowrap` i obcinanie wielokropkiem; komórki z przyciskiem, listą lub polem mają `white-space: normal`, a przyciski `max-width: 100%`, żeby nie były ucinane.
- `.admin-table-scroll` — `overflow: auto`, `max-height: min(72vh, 760px)`.
- `max-width: 1180px` — `.admin-games-layout` przechodzi na jedną kolumnę.
- `max-width: 720px` — mobilna skala tokenów i mniejsze paddingi (`.page` `20px 10px 48px`, `.card` `14px`, panele `10px`).
- `max-width: 560px` — układ kartowy.
- `pointer: coarse` — przyciski i zakładki co najmniej 40 px wysokości.
- `.user-tab-content` i `.admin-panel-content` — `max-width: var(--content-max)` = 1680 px na kontenerze (nie na elementach siatki, bo `margin-inline: auto` wyłącza tam rozciąganie).
- Na mobile pola tekstowe zajmują pełną szerokość karty.
- Przycisk `Instrukcja` jest ukryty w widoku użytkownika (`.page:has(.user-card) #secondInstructionButton`).

### Zakres arkusza
`Second/styles.css` zawiera wyłącznie reguły dla klas, które ten moduł faktycznie renderuje. Nie ma w nim stylów kalkulatora, statystyk graczy, rankingu, potwierdzeń ani szczegółów gry — te elementy istnieją tylko w module `Main`.

## Nagłówek i przycisk instrukcji
- Nagłówek modułu (`.header-intro`) zawiera wyłącznie tytuł `<h1>Tournament of Poker</h1>` — bez podtytułu; arkusz nie definiuje klasy `.eyebrow`. Tytuł karty przeglądarki brzmi `Tournament of Poker - Panel i Widok Użytkownika`.
- `Second/index.html` ładuje `styles.css?v=2026-11-17.1` i `app.js?v=2026-11-17.1` (parametr wersji wymusza pobranie nowej wersji zamiast kopii z pamięci przeglądarki; moduł nie ma Service Workera).
- W `Second/index.html` sekcja `.header-controls` zawiera ikonę `<img class="header-icon" src="../Pliki/Ikona.png">` oraz przycisk `#secondInstructionButton` w tej samej linii.
- Ikona i układ są celowo spójne z modułem Main (ta sama grafika i ten sam wzorzec pozycjonowania: ikona po lewej, przycisk po prawej).
- Styl `.header-icon` w `Second/styles.css` używa `width: min(110px, 100%)` oraz `height: auto`, a `.header-controls` pracuje w układzie poziomym (`display: flex; align-items: center; justify-content: flex-end`).
- W nagłówku modułu (pasek `.admin-toolbar`) znajduje się czerwony przycisk `#secondCustomsEmergencyButton` z etykietą „Nie wciskać” (`aria-label` modala: „Nie wciskać”), który jest widoczny zarówno w widoku admina, jak i użytkownika, i otwiera modal `#secondCustomsEmergencyModal` z GIF-em `../Koza.gif`.
- Modal nie ma tytułu tekstowego, zamyka się przez `#secondCustomsEmergencyClose`, kliknięcie overlay i klawisz `Escape`; otwarcie/zamknięcie steruje klasą `modal-open` na `body`.


## Dostęp administratora
- Tryb administratora wymaga hasła tak jak w module Main: wejście przez `Second/index.html?admin=1` uruchamia `resolveAdminMode()`, odczytuje hash z `admin_security/credentials.passwordHash` albo fallback `window.firebaseConfig.adminPasswordHash` / `window.firebaseConfig.adminPassword`, a następnie waliduje wpis przez `requestAdminPassword()` i `isAdminPasswordValid()`.
- Flaga `TEMPORARILY_DISABLE_ADMIN_PASSWORD` ma wartość `false`, więc panel admina nie omija modalu hasła; dawny komunikat obejścia hasła `#secondAdminPasswordBypassNote` pozostaje ukryty.

## Tournament of Poker (admin)

### Główna logika
- Funkcja: `setupAdminTournament(rootCard)` w `Second/app.js`.
## Modale na telefonie trzymanym poziomo

Zapytanie medialne `@media (orientation: landscape) and (hover: none) and (pointer: coarse) and (max-height: 500px)` w `Second/styles.css` obejmuje wyłącznie telefon w orientacji poziomej — widok pionowy i komputer pozostają bez zmian. Reguły są zgodne z modułem `Main`.

- `--modal-gutter` (token w `:root`) steruje marginesem między kartą modala a krawędzią ekranu: 24 px domyślnie, 8 px na telefonie w poziomie, 16 px poniżej 520 px szerokości. `.modal-overlay` używa go przez `max(var(--modal-gutter), env(safe-area-inset-*))`.
- `.modal-card { max-height: calc(100dvh - 16px) }` zastępuje w tym trybie sufit `min(82vh, 720px)`.
- `.modal-card-wide { width: min(1320px, 100%) }` — klasa nakładana punktowo na `#secondPlayerPermissionsModal` i na modal „Rebuy gracza”. Pozostałe okna (m.in. modal z GIF-em) zachowują 520 px z `.modal-card-sm`.
- `.modal-header`, `.modal-footer` mają `padding: 8px 14px`, a `.modal-body` `padding: 10px 14px 12px`.

Moduł `Second` nie ma manifestu PWA ani Service Workera, więc trybu pełnoekranowego (ukrycia systemowego paska stanu) nie da się w nim włączyć — działa wyłącznie jako zwykła strona w przeglądarce.

### Edycja uprawnień gracza (modal)
- Zamiast `window.prompt` używany jest dedykowany modal: `#secondPlayerPermissionsModal` w `Second/index.html`.
- Inicjalizacja i obsługa: `initSecondPlayerPermissionsModal(...)` w `Second/app.js`.
- Aktualna lista uprawnień (`SECOND_AVAILABLE_PLAYER_PERMISSIONS`): `Losowanie stołów`, `Wpłaty`, `Podział Puli`, `Faza Grupowa`, `Półfinał`, `Finał`, `Wypłaty`. `SECOND_TOURNAMENT_PERMISSION_MAP` mapuje klucze sekcji (`draw`, `payments`, `pool`, `group`, `semi`, `final`, `payouts`) na te etykiety.
- Każdy checkbox aktualizuje `player.permissions` jako tablicę unikalnych etykiet i natychmiast zapisuje zmiany do `second_tournament/state`.
- Modal wspiera trzy sposoby zamknięcia: przycisk `✕`, kliknięcie w overlay i klawisz `Escape`.
- Widok tabeli graczy renderuje wybrane uprawnienia jako badge (`.permission-badge`) w kolumnie `Uprawnienia`.

- Kontenery:
  - `#adminTournamentTab` — panel sekcji turniejowych,
  - `#adminTournamentRoot` — dynamiczny mount renderu aktywnej sekcji.
- Dane zapisywane są w Firestore:
  - kolekcja `second_tournament`,
  - dokument `state`.

### Odczyt i zapis Firebase
- Odczyt ciągły: `docRef.onSnapshot(...)`.
- Ręczne odświeżenie zakładki: rejestracja `registerAdminRefreshHandler("adminTournamentTab", ...)` i pobranie `docRef.get({ source: "server" })`.
- Zapis: `saveState(options)` używa standardowo `docRef.set({ ...tournamentState, updatedAt: serverTimestamp }, { merge: true })`, a gdy przekazane są `deletedPaths`, najpierw wykonuje `docRef.update({ [path]: FieldValue.delete() })` dla wskazanych ścieżek i dopiero potem zapisuje pełny stan z merge.
- Przy błędzie zapisu widok nie blokuje pracy użytkownika; pokazuje komunikat o problemie synchronizacji z Firebase i pozostaje interaktywny.

### Struktura stanu
- Metadane: `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`.
- Gracze: `players[]` z polami `id`, `name`, `pin`, `permissions`, `status` (status aktywności gracza).
- Status płatności gracza: `assignments[playerId].status` (`"Do zapłaty"` lub `"Opłacone"`).
- Pozostałe sekcje: `tables`, `assignments`, `tableEntries`, `payments`, `pool`, `group`, `semi`, `finalPlayers`, `payouts`.
- Sekcja `payouts` przechowuje flagi `showInitial` i `showFinal`, które sterują widocznością wartości wypłat w tabeli renderowanej dla admina i użytkownika.

### Lista graczy — aktualny render
- Nagłówek metadanych turnieju: grid `.t-section-grid`.
- Nad siatką metadanych renderowany jest destrukcyjny przycisk `Wyzeruj Rebuy` (`data-role="reset-all-rebuy"`), osadzony w `.admin-table-actions`.
- Pole `RAKE` działa w formacie procentowym zgodnym z modułem Main: użytkownik wpisuje wartość liczbową, a pole renderuje `wartość%`; obliczenia używają ułamka dziesiętnego (`10` => `0.10`).
- Nad tabelą renderowany licznik: `Liczba dodanych graczy: X`.
- Tabela `players-table` ma kolumny (tokeny `xs`, `tsm`, `tmd`, `tmd`, `tlg`, `act`):
  0. `LP` — numer kolejny gracza na liście (`index + 1`), tylko do odczytu,
  1. `Status` (przycisk `.payment-status-toggle` z ukrytym checkboxem sterującym statusem płatności; wariant kompaktowy dopasowany wysokością do pól formularza):
     - zaznaczenie ustawia `assignments[playerId].status = "Opłacone"`,
     - odznaczenie ustawia `assignments[playerId].status = "Do zapłaty"`,
  2. `Nazwa` (input tekstowy),
  3. `PIN` (input 5-cyfrowy + przycisk `Losuj`; kolumna ma token `--col-text-md`, żeby pole i przycisk zmieściły się obok siebie),
  4. `Uprawnienia` (badge + przycisk `Edytuj`),
  5. `Akcje` (przycisk `Usuń`; wyrównanie do prawej regułą `.players-table th/td:nth-child(6)`).

### Obsługa PIN
- PIN jest filtrowany do cyfr i skracany do 5 znaków.
- Losowanie PIN: helper `generateUniquePin(playerId)` losuje 5-cyfrową wartość i unika kolizji z innymi graczami.
- Dodano twardą walidację unikalności dla wpisu ręcznego przez helper `getPinOwnerId(pin, excludedPlayerId)`:
  - jeżeli wpisany 5-cyfrowy PIN istnieje już u innego gracza, zapis jest blokowany,
  - pole PIN wraca do poprzedniej wartości gracza,
  - pokazuje się komunikat walidacyjny `Ten PIN jest już przypisany do innego gracza.`,
  - poprawny (unikalny) PIN czyści stan walidacji (`setCustomValidity("")`) i zapisuje się standardowo.

### Obsługa uprawnień
- `normalizeTournamentPermissions(value)` wspiera dane jako string CSV lub tablicę i zwraca wyłącznie etykiety obecne w `SECOND_TOURNAMENT_PERMISSION_MAP`. Nieznane wpisy zapisane wcześniej w `players[].permissions` (np. `Czat`) nie są wyświetlane ani uwzględniane w dostępie, a przy kolejnej edycji uprawnień gracza znikają z bazy.
- Widok pokazuje uprawnienia jako badge.
- Przycisk `Edytuj` otwiera modal checkboxów i zapisuje listę uprawnień do pola `permissions`; komunikat o testowych uprawnieniach został usunięty z HTML modala.

### Usuwanie gracza
- `delete-player` usuwa rekord gracza z `players` oraz czyści powiązane dane (`assignments`, `group.playerStacks`, `group.eliminated`, `group.eliminatedWins`, `group.survivorStacks`, `semi`).
- Dodatkowo `delete-player` usuwa trwały wpis `payments.table12Rebuys[playerId]` przez `FieldValue.delete()` oraz sprawdza, czy po operacji nie został pusty układ `0 graczy i 0 stołów`.
- Jeśli po usunięciu gracza stan turnieju spełnia warunek `players.length === 0 && tables.length === 0`, aplikacja automatycznie resetuje `payments.table12Rebuys` i `pool.rebuyCells`, bez usuwania dokumentu `second_tournament/state`.

### Globalny reset Rebuy (Lista graczy)
- Kliknięcie przycisku `Wyzeruj Rebuy` uruchamia `resetAllTable12Rebuys()`.
- Operacja wymaga potwierdzenia `window.confirm` z ostrzeżeniem o nieodwracalności.
- Po zatwierdzeniu funkcja:
  - czyści `payments.table12Rebuys = {}` (usuwa wszystkie `RebuyX`),
  - czyści `pool.rebuyCells = {}` (usuwa ręczne wpisy powiązane z kolumnami Rebuy w `Tabela16`),
  - zamyka aktywny modal `Rebuy gracza` (jeśli był otwarty) i resetuje draft modalu.
- Zapis do Firebase wykonuje `saveState({ deletedPaths: ["payments.table12Rebuys", "pool.rebuyCells"] })`, więc stare ścieżki są najpierw usuwane przez `FieldValue.delete()`, a następnie utrwalany jest nowy stan dokumentu.
- Po sukcesie ustawiany jest komunikat statusu: `Wyzerowano wszystkie Rebuy.`
- W trakcie operacji aktywna jest flaga `globalRebuyResetInProgress`, która blokuje wieloklik i czasowo wyłącza przycisk resetu.

### Losowanie stołów — status i wybór stołu
- Usunięto górny, zbiorczy blok z polami `Nazwa` i `Łączna Suma` nad tabelą przypisań.
- Tabela przypisań ma kolumny `LP | GRACZ | STATUS | STÓŁ` (tokeny `xs`, `tmd`, `tsm`, `tsm`); `LP` numeruje graczy w kolejności listy `players[]`.
- Bloki pojedynczych stołów (tworzone po `Dodaj stół`) mają nagłówek `Nazwa` + `Łączna Suma` i tabelę `LP | GRACZ | BUY-IN` (tokeny `xs`, `tmd`, `md`); `LP` numeruje graczy osobno w każdym stole, od 1. Nowy stół otrzymuje nazwę `Stół${n}` (numerowanie od 1).
- Kolumna `BUY-IN` w bloku stołu jest tylko do odczytu i pokazuje wartość z metadanych turnieju (`buyIn`) dla każdego przypisanego gracza.
- Sekcja `draw` (`Losowanie stołów`) renderuje status gracza jako nieedytowalną pigułkę `.payment-status-label` (bez przycisku zmiany).
- Zmiana statusu płatności odbywa się w sekcji `players` przez checkbox `data-role="player-payment-status"`.
- Styl statusu:
  - `Do zapłaty` ma klasę `.payment-status-label.is-unpaid` (jasnoróżowy napis + czerwonawa obwódka),
  - `Opłacone` ma klasę `.payment-status-label.is-paid` (złoty napis + złota obwódka + glow).
- Wybór stołu (`assign-table`) oraz półfinałowe przypisanie do stołu (`semi-assign-table`) zapisują się na zdarzeniu `change`, bez wymuszonego zapisu na `input`, co eliminuje znikanie rozwijanych list podczas wyboru.
- Handler `click` wykonuje logikę wyłącznie dla ról-akcji (`add-player`, `delete-player`, `add-table`, itp.). Kontrolki formularza (`checkbox`, `select`, `input`) nie uruchamiają już globalnego `render()` przez `click`, dzięki czemu przełączenie statusu działa stabilnie na desktopie i mobile (tap).
- `delete-table` dodatkowo usuwa `payments.table12Rebuys[playerId]` dla wszystkich graczy przypisanych do usuwanego stołu, od razu renumeruje globalne indeksy `RebuyX` bez luk (`1..N`) i przemapowuje `pool.rebuyCells` według mapy `stary indeks -> nowy indeks`.
- Jeśli po `delete-table` otwarty jest modal `Rebuy gracza` dla gracza z usuwanego stołu, modal zostaje zamknięty przed zapisem stanu.

### Faza grupowa
- `Tabela17` ma tylko kolumny `STACK GRACZA` oraz `REBUY/ADD-ON`; wartości są readonly i pochodzą z metadanych turnieju (`stack`, `rebuyStack`).
- `Tabela18` wylicza stack per stół jako sumę `STACK + REBUY/ADD-ON` ze wszystkich wierszy `Tabela19` przypisanych do danego stołu oraz pokazuje `ŁĄCZNY STACK`.
- `Tabela19` renderuje kolumny `LP`, `STÓŁ`, `GRACZ`, `ELIMINATED`, `STACK`, `REBUY/ADD-ON`.
- Kolumna `REBUY/ADD-ON` w `Tabela19` jest wyliczana jako `rebuyStack × liczba niepustych pól RebuyX` dla danego gracza w `payments.table12Rebuys[playerId].values`.
- `Tabela19` nie ma już kolumny `REBUY`.
- Dodano zebra striping per grupa stołu dla `Tabela19`; klasy wierszy są wyliczane helperem `getAlternatingTableGroupClass(...)`.
- `Tabela19A` pokazuje tylko graczy z zaznaczonym `group.eliminated[playerId]`; kolejność wierszy jest utrwalana w `group.eliminatedOrder`, synchronizowana z aktualną listą wyeliminowanych i domyślnie dopisuje nowych graczy na koniec rankingu.
- `Tabela19A` ma stałą numerację `LP = index + 1`, kolumnę `POZYCJA` z przyciskami `▲/▼` (`data-role="group-eliminated-move"`) oraz kolumnę `WYGRANA` jako input liczbowy `data-role="group-eliminated-win"` zapisywany do `group.eliminatedWins[playerId]`; wartość wygranej przemieszcza się razem z graczem, bo nadal jest związana z `playerId`.
- `Tabela19B` pokazuje tylko graczy bez zaznaczonego `ELIMINATED`; kolumna `STACK` jest inputem liczbowym `data-role="group-survivor-stack"` zapisywanym do `group.survivorStacks[playerId]`, a `%` liczy `stack gracza / Tabela18.ŁĄCZNY STACK`.
- Checkbox `ELIMINATED` zapisuje się na zdarzeniu `change` bez dodatkowych ścieżek usuwania; po kliknięciu aplikacja od razu wykonuje `render()`, więc gracz natychmiast przechodzi między `Tabela19A` i `Tabela19B`, a stan pozostaje po odświeżeniu. Odznaczenie checkboxa usuwa też gracza z `group.eliminatedOrder`, a ponowne zaznaczenie dopisuje go na końcu listy.

### Półfinał
- `Tabela21` pobiera listę graczy z `Tabela19B`: kolumna `STACK` jest zwykłym tekstem w komórce `<td>` (bez inputa), pokazuje `semiStack` (domyślnie `group.survivorStacks[playerId]`) i używa klasy `t-stack-input` (odpowiada już tylko za wyrównanie do prawej — szerokość bierze się z `<colgroup>`); kolumna `%` liczy udział względem `Tabela18.ŁĄCZNY STACK` na bazie `semiStack`.
- `Tabela21.STÓŁ` jest selectem opartym o `semi.customTables[]`; wybór zapisuje `semi.assignments[playerId].tableId`.
- `Tabela22` renderuje po jednej karcie na każdy wpis `semi.customTables[]`; karta pokazuje nazwę stołu, `ŁĄCZNY STACK` liczony jako suma wartości `semiStack` (czyli stack po ewentualnej edycji w `Tabela21`) oraz wiersze `GRACZ / STACK / ELIMINATED`.
- Checkbox `ELIMINATED` w `Tabela22` zapisuje się do `semi.assignments[playerId].eliminated`, a kolejność graczy wyeliminowanych w półfinale utrwala się w `semi.eliminatedOrder`; stan pozostaje po odświeżeniu i po ponownym wejściu do aplikacji.
- `Tabela22A` pokazuje graczy wyeliminowanych w półfinale (`semi.assignments[playerId].eliminated === true`) w kolejności z `semi.eliminatedOrder` i pozwala zmieniać ją przyciskami `▲/▼` (`data-role="semi-eliminated-move"`).
- `Tabela FINAŁOWA` buduje się dynamicznie z rekordów przypisanych do stołów półfinałowych i filtruje wyłącznie graczy bez zaznaczonego `semi.assignments[playerId].eliminated`; `STACK` jest edytowalnym inputem liczbowym `data-role="semi-final-stack"` (domyślnie `0`, sanitizacja `digitsOnly`, `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`), `STÓŁ` jest tylko do odczytu, a `%` liczy się jako `finalStack / Tabela18.ŁĄCZNY STACK`.

### Wypłaty
- `Tabela23` pobiera `STACK` bezpośrednio z wartości wpisanych w `Tabela FINAŁOWA` (`semi.assignments[playerId].finalStack`) i sortuje finalistów malejąco po tym polu; `STACK` w `Tabela23` pozostaje readonly.
- `Tabela24` korzysta z kolejek eliminacji: miejsca od końca zajmują kolejno gracze z `group.eliminatedOrder`, następnie `semi.eliminatedOrder`, a następnie `final.eliminatedOrder` (czyli `Tabela23A`).
- Liczba wierszy `Tabela24` jest zawsze równa liczbie graczy w `players[]`.
- Kolumny `POCZĄTKOWA WYGRANA` i `KOŃCOWA WYGRANA` są readonly i mają dokładnie te same wartości co odpowiednio `KWOTA` i `SUMA` z tego samego miejsca w `Tabela16` (miejsce N ↔ wiersz N). Panel admina i widok gracza liczą je tą samą funkcją co `Tabela16` — `computePoolTable16(...)` z bazą `Tabela14.BUY-IN` — a `getPayoutDefaultsFromTable16(rowSums)` zamienia wynik na `{ amount, total }` zaokrąglone `Math.round`. Jeśli miejsc w `Tabela24` jest więcej niż wierszy w `Tabela16`, `buildPlacementRowsFromQueues` wpisuje reszcie `0`.
- Checkboxy `data-role="toggle-payout-initial"` i `data-role="toggle-payout-final"` sterują realną widocznością kolumn w tabeli administratora i użytkownika, a ich stan jest utrwalany w `payouts.showInitial` / `payouts.showFinal`.

### Stabilność UI przy błędach Firebase
- Dla błędów odczytu `onSnapshot` renderuje się informacja ostrzegawcza, a nie pusty ekran sekcji.
- Dla błędów zapisu render nie jest blokowany; użytkownik widzi aktualny stan lokalny i komunikat o synchronizacji.


### Ochrona fokusu i edycji podczas autozapisu
- Mechanizm przechwytywania i odtwarzania fokusu (`getTournamentEditableFocusState`, `restoreTournamentEditableFocusState`) jest oparty o `data-role` oraz identyfikatory (`data-player-id`, `data-table-id`, `data-id`, `data-col-index`, `data-mod-key`). Dwa ostatnie rozróżniają komórki tego samego wiersza `Tabela16` (kolumny `REBUYn` i `MOD`) — bez nich kursor po zapisie wracał do pierwszej komórki wiersza.
- Funkcja `render()` odtwarza fokus po każdym przebudowaniu `#adminTournamentRoot`, dzięki czemu wpisywanie nie przerywa się przy lokalnym re-renderze.
- Dodano lokalną blokadę synchronizacji snapshotów podczas aktywnej edycji:
  - `hasActiveEdit` — flaga aktywnego pola,
  - `pendingLocalWrites` — licznik zapisów w trakcie,
  - `deferredSnapshotState` — odroczony stan z `onSnapshot`.
- `onSnapshot` nie nadpisuje stanu lokalnego w trakcie edycji/zapisu; aktualizacja jest nakładana dopiero po zakończeniu edycji i spadku licznika zapisów do zera.
- Dla modalu `Tabela12 -> Rebuy gracza` ochrona obejmuje też otwarty draft modalu, więc snapshot nie może przywrócić pustego `Rebuy1` w trakcie pierwszej edycji.
- Funkcja `commitDeferredSnapshotIfSafe` domyka odroczoną synchronizację: po zakończeniu lokalnych zapisów i braku aktywnej edycji nakłada `deferredSnapshotState`, czyści status i wykonuje `render()`.

### Przyciski dodawania — zmiana layoutu
- Dodano klasę `t-inline-add-button` dla przycisków `Dodaj gracza`, `Dodaj stół`, `Dodaj` (Podział puli) i `Dodaj nowy stół`.
- Przycisk usuwania stołu (`data-role="delete-table"`) używa klas `.admin-row-delete.draw-table-delete`, dzięki czemu jest kompaktowy jak w `Lista graczy` i wyrównany do prawej krawędzi karty stołu.
- Styl `#adminTournamentRoot .t-inline-add-button` ustawia `justify-self: flex-start` oraz `width: auto`, co eliminuje rozciąganie przycisku na pełną szerokość kontenera grid.
- Czerwone przyciski testowe w sekcji `Finał` pozostały bez zmian.

## Tournament of Poker (user)

### Synchronizacja z Firebase
- Funkcja: `setupUserView(root)` w `Second/app.js`.
- Dane sekcji turniejowej użytkownika są pobierane z `second_tournament/state` przez `onSnapshot`.
- Stan lokalny użytkownika jest normalizowany przez `normalizeTournamentState`, która wymusza bezpieczne typy (`players`, `tables`, `finalPlayers` jako tablice; `assignments`, `payments`, `pool`, `group`, `semi`, `final`, `payouts` jako obiekty), dzięki czemu brakujące lub starsze pola nie psują renderu UI.
- Przed zapisem turnieju administrator generuje pełną kopię readonly modelu tabel (`buildTournamentReadonlyCopies`) i zapisuje ją do `readonlyTables` (`rTournamentState` + komplet kluczy `r*`: `rTABELA10`, `rTABELA11`, `rTABELA12`, `rTABELA13`, `rTABELA14`, `rTABELA15`, `rTABELA16`, `rTABELA17`, `rTABELA18`, `rTABELA19`, `rTABELA19A`, `rTABELA19B`, `rTABELA21`, `rTABELA22`, `rTABELA22A`, `rTABELA23`, `rTABELA23A`).
- Widok użytkownika sekcji turniejowych (`players`, `draw`, `payments`, `pool`, `group`, `semi`, `final`, `payouts`) czyta wyłącznie `readonlyTables.rTournamentState` i nie renderuje modeli edycyjnych admina.
- Sekcja `draw` w user-view renderuje pełną kopię widoku danych: tabelę przypisań (`LP`, `Gracz`, `Status wpłaty`, `Stół`) oraz karty każdego stołu (`NAZWA`, `ŁĄCZNA SUMA`, tabela `LP`/`GRACZ`/`BUY-IN`) w trybie readonly. Sekcja `players` w user-view ma kolumny `LP`, `Status`, `Gracz`, `PIN`, `Uprawnienia`.
- Jeżeli `readonlyTables.rTournamentState` nie istnieje, widok usera pokazuje komunikat diagnostyczny `TOP-READONLY-MISSING` (z nazwą brakującego klucza i instrukcją naprawy w panelu admina) i nie przechodzi na źródłowe tabele admina.
- Do czasu pierwszego snapshotu obowiązuje flaga gotowości danych (`isUserTournamentLoaded`): przycisk otwierania PIN użytkownika jest zablokowany, a UI pokazuje komunikat ładowania zamiast walidacji PIN na pustym stanie.

### Render sekcji użytkownika
- Wszystkie zakładki gracza — `Aktualności`, `Regulamin` i `TOURNAMENT OF POKER` (przyciski `.tab-button` z `data-requires-player-pin="true"`) — są ukryte do czasu poprawnej weryfikacji głównego PIN-u (`#userPlayerPinInput`, `#userPlayerPinOpenButton`). Przed weryfikacją `updateProtectedTabsVisibility()` nadaje `.user-card` klasę `is-pin-locked`, która ukrywa pasek zakładek z przyciskiem `Odśwież` (`.user-panel`) oraz treść zakładek (`.user-tab-content`); widoczna zostaje tylko bramka PIN z tekstem „Wpisz PIN gracza, aby zobaczyć Aktualności, Regulamin i Tournament of Poker.”. To samo dotyczy podglądu widoku gracza w panelu administratora (`#userPreviewMount`).
- PIN odblokowuje dowolny gracz z `players[]` (bez osobnego uprawnienia do `Aktualności` / `Regulaminu`). Po poprawnej weryfikacji `verifyUserPin()` ustawia aktywną zakładkę `updatesTab` (`Aktualności`).
- Blokada jest wizualna: dokumenty `second_admin_messages/admin_messages` i `second_app_settings/rules` są pobierane w tle jak dotąd (reguły Firestore pozwalają je czytać), a ukryta jest jedynie ich prezentacja.
- Stan tej weryfikacji jest przechowywany w `sessionStorage` (`secondUserPinVerified`, `secondUserPlayerId`), więc użytkownik wpisuje PIN tylko raz do resetu lub odświeżenia strony.
- Po wejściu do `TOURNAMENT OF POKER` przyciski `data-tournament-target` są filtrowane per gracz; bez odpowiednich uprawnień nie renderują się przyciski nawigacji do paneli.
- Użytkownik może przełączać dostępne sekcje przez przyciski `data-tournament-target`.
- Po poprawnym PIN tworzony jest jawny kontrakt sesji użytkownika (`userTournamentSession`): `playerId`, `allowedSections`, `readonly`, `isVerified`; to jedyne źródło prawdy o dostępie do sekcji.
- W `renderUserTournament()`, `navigateToUserTournamentSection()` i renderze sidebaru działa jeden wspólny resolver `resolveUserTournamentAccessState()` (jedno źródło prawdy dostępu): zwraca `isVerified`, `allowedTargets`, `sessionReady`, `reasonCode` i `playerId`.
- `TOP-NO-PANELS` jest pokazywany dopiero po `sessionReady === true`; gdy sesja jeszcze się inicjalizuje widoczny jest komunikat `TOP-SESSION-NOT-READY`.
- Komunikaty dostępu mają kody diagnostyczne:
  - `TOP-NO-PERMISSION` — PIN poprawny, ale gracz nie ma przypisanych uprawnień turniejowych.
  - `TOP-SESSION-NOT-READY` — trwa inicjalizacja sesji uprawnień PIN, sekcje jeszcze nie są gotowe do renderu.
  - `TOP-NO-PANELS` — PIN poprawny, ale finalna lista dozwolonych sekcji jest pusta.
  - `TOP-READONLY-MISSING` — brak `readonlyTables.rTournamentState`, więc user-view nie ma źródła danych readonly.
- Przełączanie sekcji działa przez router `navigateToUserTournamentSection(targetSection, source)`, który blokuje niedozwolone cele i nie pozwala snapshotowi Firestore samodzielnie zmieniać aktywnej zakładki.
- Kliknięcie przycisku sekcji jest blokowane do czasu `isUserTournamentLoaded === true`; podczas ładowania użytkownik dostaje komunikat `Trwa ładowanie danych turnieju...`, co eliminuje stan pośredni po odświeżeniu strony.
- Przy każdym kliknięciu sekcji i każdym starcie renderu zapisywany jest log diagnostyczny `console.info("[Second][UserTournament]")` z polami `requestedSection`, `previousSection`, `finalSection`, `allowedTargets`, `isUserTournamentLoaded`, `isUserPinGateOpen`, `verifiedUserId` i timestampem.
- Każda sekcja użytkownika (`payments`, `pool`, `group`, `semi`, `final`, `payouts`) renderuje się w osobnym bloku `try/catch`, więc wyjątek w jednej sekcji nie blokuje pozostałych sekcji.
- Log błędu użytkownika zawiera teraz komplet diagnostyczny: `section`, `stage`, `errorName`, `errorMessage`, `playersCount`, `tablesCount`, `poolModsCount`, `semiCustomTablesCount`, co pozwala szybciej ustalić czy problem dotyczy danych wejściowych czy konkretnego etapu obliczeń.
- `setupUserView(root)` ma lokalny helper `esc(v)` (escape HTML) używany przez komunikaty błędów sekcji użytkownika, dzięki czemu render nie odwołuje się do helpera z zasięgu admina.
- W `renderUserTournament()` zmienna `readonlyTournamentState` jest inicjalizowana przed blokiem `try`, a diagnostyka używa optional chaining (`readonlyTournamentState?.pool?.mods`, `readonlyTournamentState?.semi?.customTables`), co zapobiega wtórnym błędom `ReferenceError` podczas obsługi wyjątków.
- Przed obliczeniami sekcji read-only stosowana jest defensywna normalizacja rekordów (`players`, `tables`, `assignments`, `table12Rebuys`, `semi.customTables`, `pool.mods`) na poziomie view-modeli (`buildUserBaseViewModel`, `buildAdvancedViewModel`), a agregacja wartości `table12Rebuys` działa przez `reduce` (bez `flatMap`) dla zgodności ze starszymi środowiskami WebView/przeglądarek.
- Sekcje z aktywną prezentacją danych:
  - `pool`: read-only `Tabela13`, `Tabela14`, `Tabela15`, `Tabela16`,
  - `group`: read-only `Tabela17`, `Tabela18`, `Tabela19`, `Tabela19A`, `Tabela19B`,
  - `semi`: read-only `Tabela21`, `Tabela22`, `Tabela22A`, `Tabela FINAŁOWA`,
  - `final`: read-only `Tabela23`, `Tabela23A`,
  - `draw`: read-only tabela przypisań graczy + readonly karty stołów (`NAZWA`, `ŁĄCZNA SUMA`, lista `GRACZ`/`BUY-IN`),
  - `payments`: read-only `Tabela10`, `Tabela11`, `Tabela12` (układ i semantyka zgodna z panelem admina, bez akcji edycyjnych),
  - `payouts`: tabela miejsc i wygranych zależna od flag `payouts.showInitial` / `payouts.showFinal`.
- Wszystkie sekcje użytkownika są tylko do odczytu; całość renderuje się w jednym kontenerze `#userTournamentDataMount`.
- Render admina sekcji turniejowych jest osłonięty globalnym `try/catch`; w przypadku wyjątku (np. niespójne dane `pool`) UI pokazuje komunikat błędu zamiast poprzedniej sekcji, co usuwa efekt „Podział puli pokazuje poprzednią zakładkę”.
- Render sekcji posiada token wersji (`userTournamentRenderToken`): gdy pojawi się opóźniony render z wcześniejszego stanu, jest przerywany jako „stale token”, co chroni przed asynchronicznym nadpisaniem widoku.

### Ręczne odświeżanie
- Przycisk `#userPanelRefresh` dla aktywnej zakładki `tournamentTab` wykonuje `get({ source: "server" })` dla `second_tournament/state`, co wymusza pobranie najnowszych danych z Firestore.

## Tournament of Poker – logika techniczna (Second)

### Kluczowe rozszerzenia stanu
- `payments.table12Rebuys` – przechowuje per-gracz listę rebuy jako `values[]` oraz globalne indeksy kolumn `indexes[]`.
- `pool.rebuyCells` – ręczne wartości komórek REBUY w `Tabela16`: `{ [idWiersza]: { [indeksKolumny]: "tekst" | null } }`. `null` oznacza wpis skasowany (zapis `set(..., { merge: true })` nie usuwa kluczy mapy, więc usunięcie zapisuje się jako `null`). Przy pierwszym odczycie stanu bez tego pola `normalizeTournamentState` przejmuje z dawnego `pool.rebuyValues` wyłącznie kolumny `REBUY31+` — wpisy z kolumn 1–30 nie były nigdy wyświetlane ani liczone.
- `pool.mods[]` – wiersze `Tabela16`: `id`, `split`, `modR5`, `mod1`, `mod2`, `mod3`.
- Wspólny helper `toDigitsNumber` działa na poziomie modułu i jest używany przez renderowanie wszystkich sekcji `Tournament of Poker` (m.in. sortowanie finału, wypłaty i przeliczenia liczbowe), dzięki czemu kliknięcie w przyciski sidebaru nie kończy się błędem zasięgu funkcji.

### Automatyczne przeliczenia
- `Tabela10`:
  - `BUY-IN` z metadanych turnieju (Lista graczy),
  - `REBUY/ADD-ON` z metadanych turnieju,
  - `SUMA` jako `suma BUY-IN z Tabela12 + suma REBUY z Tabela12`,
  - `LICZ. REBUY/ADD-ON` jako liczba uzupełnionych pól rebuy w modalach `Rebuy gracza` (bez sumowania wartości).
- `Tabela11`:
  - `%` z pola `RAKE` (konwersja do ułamka),
  - `RAKE` = `(suma BUY-IN z Tabela12 + suma REBUY z Tabela12) * %`,
  - `BUY-IN` = suma `BUY-IN` pomniejszona o rake naliczony tylko od `BUY-IN`,
  - `REBUY/ADD-ON` = suma rebuy pomniejszona o rake naliczony tylko od rebuy,
  - `POT` = `BUY-IN + REBUY/ADD-ON`.
- `Tabela12` renderuje kolumny w kolejności `LP`, `STÓŁ`, `GRACZ`, `BUY-IN`, `REBUY` i stosuje zebra striping per grupa stołu przez klasy `t-group-stripe-even/odd`.
- Wszystkie wartości liczbowe prezentowane w komórkach tabel modułu są zaokrąglane do pełnych liczb (`Math.round`), tak samo jak w module Main.

### Modal „Rebuy gracza” (Second)
- Nowy modal tworzony dynamicznie przy inicjalizacji turnieju.
- Otwierany z `Tabela12` (kolumna `REBUY`).
- Obsługuje dodawanie/usuwanie kolejnych pól `Rebuy` oraz zapis do Firestore.
- Modal korzysta z lokalnego draftu (`table12RebuyModalDraft`) i flagi brudnych zmian (`table12RebuyModalDirty`), dzięki czemu pierwsze dodane pole nie jest zapisywane jako pusty rekord.
- Po otwarciu pustego modala nie renderuje się żadna kolumna; pierwsza kolumna pojawia się dopiero po kliknięciu `Dodaj Rebuy` (zgodnie z modułem Main).
- Numeracja nagłówków (`Rebuy1..n`) opiera się na trwałych globalnych indeksach (`indexes[]`) dla całej `Tabela12` i nie zależy od kolejności graczy renderowanych aktualnie w tabeli.
- Układ modala (`modal-header` + `modal-body`) jest wierną kopią modala z modułu Main.
- Karta modala ma klasy `modal-card modal-card-sm modal-card-wide` — ostatnia działa tylko na telefonie trzymanym poziomo (patrz „Modale na telefonie trzymanym poziomo”).
- Dodanie nowej kolumny rebuy nadaje `nextIndex = max(indexes)+1` globalnie dla całego turnieju, ale maksimum liczone jest już tylko z wpisów aktywnych graczy (`players[].id`).
- `Dodaj Rebuy` aktualizuje najpierw tylko lokalny draft i główny stan UI; zapis pustej kolumny do Firestore nie jest wykonywany od razu.
- Usunięcie kolumny wykonuje globalną kompaktację (`index > removedIndex => index-1`) we wszystkich wpisach graczy.
- Usunięcie stołu korzysta z pełnej renumeracji globalnej pozostałych kolumn (`oldIndex` sort rosnąco -> `newIndex = 1..N`), dzięki czemu znikają luki po indeksach należących do usuniętego stołu.
- Po kompaktacji rebuy wykonywane jest też przenumerowanie `pool.rebuyCells` (kolumny `data-col-index`), aby ręczne wpisy w `Tabela16` pozostały przypisane do właściwych kolumn `RebuyX`.
- Gdy zapis do Firestore nie powiedzie się, modal pokazuje lokalny komunikat błędu i nie utrwala lokalnej zmiany dla przycisku `Dodaj Rebuy`.
- Komunikat diagnostyczny zawiera szczegóły błędu (`error.code` i `error.message`), aby ustalić przyczynę problemu przy `Dodaj Rebuy` / `Usuń Rebuy`.
- Podczas zapisu akcji rebuy używany jest lokalny lock (`table12RebuyActionInProgress`), który chwilowo blokuje przyciski modalu i zapobiega wielokrotnemu wywołaniu tej samej operacji.
- Handler `Dodaj Rebuy` jest opakowany pełnym `try/catch`, także dla kroku wyliczenia kolejnego indeksu i aktualizacji lokalnych tablic, dzięki czemu każda awaria pokazuje komunikat w modalu zamiast „cichego” braku reakcji przycisku.
- Normalizacja wpisu `table12Rebuys[playerId]` działa in-place (`ensureTable12RebuyEntryShape` uzupełnia i sanityzuje `values/indexes` bez podmiany referencji obiektu gracza), dzięki czemu przycisk `Dodaj Rebuy` nie „gubi” zmiany po lokalnym rerenderze modala.
- `ensureTable12RebuyState(playerId)` utrzymuje stabilną referencję obiektu wpisu i zwraca ten sam obiekt po normalizacji; to spójny model z mutacyjnym przepływem `Dodaj Rebuy` / `Usuń Rebuy`.

### Podział puli (Tabela15/Tabela16)
- `Tabela15` ma kolumny: `BUY-IN` i `PODZIAŁ`.
- `Tabela15.BUY-IN` pobiera wartość 1:1 z `Tabela14.BUY-IN`.
- `Tabela15.PODZIAŁ` jest liczone jako: `Tabela14.BUY-IN` minus suma `KWOTA` od wiersza 4 do końca (co dla wierszy 4+ jest równoważne sumie wpisów z `PODZIAŁ PULI`).
- W `Tabela16` kolumna `PODZIAŁ PULI` ma tryb mieszany:
  - wiersze 1–3: wejście procentowe (`50` => render `50%`, obliczenia `0.5`); pusty input ma fallback `50/30/20` dla odpowiednio wierszy `1/2/3`,
  - wiersze 4+: wejście liczbowe bez `%` (`10` => obliczenia `10`).
- `KWOTA`:
  - wiersze 1–3: `podział (w postaci dziesiętnej) * Tabela15.PODZIAŁ`,
  - wiersze 4+: wartość bezpośrednia z `PODZIAŁ PULI`.
- Liczba kolumn `REBUY` w `Tabela16` jest dynamiczna i równa liczbie uzupełnionych pól `Rebuy` w modalach `Rebuy gracza` (`Tabela12` → `REBUY`).
- Jeśli w modalach `Rebuy gracza` nie ma żadnej uzupełnionej wartości, `Tabela16` nie renderuje żadnej kolumny `REBUY`.
- Wspólne helpery modułu (używane przez panel admina, widok gracza i sekcję `Wypłaty`):
  - `POOL_REBUY_ROW_MAPPING` — mapa auto-przypisania `REBUY1..REBUY30` do wierszy w grupach 4, 5, 6, 7, 8 (`1,2,3,4 | 1..5 | 1..6 | 1..7 | 1..8`), `POOL_AUTO_REBUY_COLUMNS = 30`,
  - `buildPoolRebuyMatrix(rows, columnValues, rebuyCells)` — macierz tekstów komórek `[wiersz][kolumna]`,
  - `isPoolRebuyColumnManual(rows, rebuyCells, colIdx)` — kolumna jest ręczna, gdy którykolwiek bieżący wiersz ma w niej wpis (`hasPoolRebuyCell`: wartość różna od `undefined` i `null`) albo gdy `colIdx >= 30`,
  - `getPoolRebuyCorrectionMismatches(rows, columnValues, rebuyCells, matrix)` — ręczne kolumny `REBUY1..REBUY30`, w których zaokrąglona suma wierszy różni się od zaokrąglonej wartości rebuy,
  - `getPoolTable16Columns(rebuyColumns)` — kolejność komórek za `KWOTA` (REBUYn i MOD) z etykietami `MOD1..MODn`,
  - `getPoolModSum(row)` — suma `modR5 + mod1 + mod2 + mod3` (`POOL_MOD_KEYS`),
  - `computePoolTable16({ rows, buyIn, rebuyColumnValues, rebuyCells })` — jedno źródło wyliczeń `Tabela16`: zwraca `splitValues`, `sumFrom4th`, `table15Split` (= `buyIn − suma PODZIAŁ PULI od wiersza 4`), macierz REBUY i `rowSums[i] = { amount: KWOTA, total: SUMA }`; używają go `Podział puli` i `Wypłaty` w panelu admina (`buyIn = table11.buyIn`) i w widoku gracza (`buyIn = readonly payments.table11.buyIn`, a gdy brak — wyliczone `userTable11.buyIn`; helpery `getUserPoolRows()` / `getUserPoolBuyIn()`),
  - `getPayoutDefaultsFromTable16(rowSums)` — wartości `POCZĄTKOWA WYGRANA` / `KOŃCOWA WYGRANA` dla `Tabela24`,
  - `signedDigitsOnly(value)` — sanitizacja pola MOD: opcjonalny minus na początku + cyfry.
- Wartość kolumny `REBUYn` to wpis z modali `Rebuy gracza` pomniejszony o procent z `Tabela14` (`wartość * (1 - rakePercent)`).
- Komórka niebędąca w kolumnie ręcznej pokazuje wartość automatyczną (`Math.round`) w wierszu z `POOL_REBUY_ROW_MAPPING`, a w pozostałych wierszach jest pusta. W kolumnie ręcznej każda komórka pokazuje wyłącznie swój wpis z `pool.rebuyCells`.
- **Korekta REBUY (panel admina).** Wszystkie komórki `REBUYn` są edytowalnymi polami (`data-role="pool-rebuy-value"`, `data-col-index`, `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`, sanitizacja `digitsOnly`, metadane fokusu `data-focus-target`/`data-section="second-tournament-pool-rebuy"`/`data-row-id`/`data-column-key="rebuyN"`). Pierwsza zmiana w kolumnie `1..30` najpierw utrwala w `pool.rebuyCells` bieżący rozkład wszystkich wierszy tej kolumny (z `lastPoolRebuyMatrix`, czyli ostatnio wyrenderowanej macierzy), a dopiero potem zapisuje edytowaną komórkę — od tej chwili kolumna jest ręczna, więc późniejsze dodanie wiersza ani przenumerowanie rebuy nie zdubluje wartości. Puste pole liczy się jako `0`; można też wpisać `0`.
- Pod `Tabela16` (nad przyciskami `Dodaj`/`Usuń`) renderuje się ostrzeżenie `.builder-info.t-warning`, po jednej linii na kolumnę z niezgodnością: `REBUYn: rozdzielono X z Y`. Dotyczy wyłącznie kolumn `1..30`, w których dokonano korekty.
- Komunikat `Rebuy do rozdysponowania X` (nad `Tabela16`) = suma wartości kolumn `REBUY31+` minus suma wpisów w tych kolumnach.
- `Tabela16` używa klasy `.tournament-pool-table16`; `<colgroup>` buduje się z tej samej pętli co nagłówki (`tColsAuto`), więc zmienna liczba kolumn `REBUY` i `MOD` nie rozjeżdża szerokości. Pola `.admin-input` wypełniają komórkę.
- Kolumny `MOD` (`getPoolTable16Columns`):
  - za `REBUY5` — klucz `modR5`, gdy kolumn `REBUY` jest więcej niż 5,
  - za `REBUY12` — klucz `mod1`, gdy więcej niż 12,
  - za `REBUY20` — klucz `mod2`, gdy więcej niż 20,
  - zawsze jedna przed `SUMA` — klucz `mod1` (≤ 12 rebuy), `mod2` (13–20) albo `mod3` (> 20).
  Etykiety są numerowane od lewej: `MOD1`, `MOD2`, … (np. przy 14 rebuy: `MOD1` za `REBUY5`, `MOD2` za `REBUY12`, `MOD3` przed `SUMA`).
- Pole MOD (`data-role="pool-mod"`, `data-mod-key`) ma `type="text"` bez `inputmode`, żeby na telefonie była dostępna klawiatura z minusem; wartość jest sanitizowana przez `signedDigitsOnly` (np. `-100`).
- `SUMA` = `KWOTA + suma komórek REBUY w wierszu + modR5 + mod1 + mod2 + mod3`.
- Widok gracza (`pool`) używa tych samych helperów i układu kolumn (nagłówki `R1..Rn`, `MOD1..MODn`, wartości tylko do odczytu); sekcja `Wypłaty` (admin i gracz) bierze `POCZĄTKOWA WYGRANA` i `KOŃCOWA WYGRANA` z tych samych wyliczeń (`computePoolTable16`), więc korekty REBUY i MOD są w niej uwzględnione.
- Obliczanie sumy wszystkich komórek `REBUY` używa zagnieżdżonego `reduce` (bez `Array.prototype.flat`), co utrzymuje zgodność renderu sekcji `Podział puli` ze starszymi środowiskami WebView/przeglądarkami.

### Faza grupowa
- `group` przechowuje dodatkowo `eliminatedOrder`, `eliminatedWins` oraz `survivorStacks`, które zasilają odpowiednio ranking `Tabela19A` i dane `Tabela19B`.
- `semi` przechowuje też `eliminatedOrder`, które zasila `Tabela22A`, a `final.eliminated` utrwala checkboxy `ELIMINATED` w `Tabela23`.
- `Tabela19A` i `Tabela19B` są w pełni zależne od checkboxa `group-eliminated`; przełączenie checkboxa natychmiast przenosi gracza pomiędzy tabelami przy kolejnym renderze, a kolejność wyeliminowanych jest dalej kontrolowana przez `group.eliminatedOrder`.
- Dla inputów w `Tabela19A` i `Tabela19B` utrzymano metadane fokusu (`data-focus-target`, `data-section`, `data-row-id`, `data-column-key`), aby nie wrócił błąd utraty fokusu opisany w `Analizy/Wazne_Fokus`.

### Nagłówki kolumn
- Dodano globalne wymuszenie uppercase dla nagłówków tabel (`th`) w module Second.
- Wyjątek realizowany przez klasę `table18-dynamic-header` (bez transformacji).

## Aktualny layout paneli użytkownika (Second)
- W trybie użytkownika kontener `.player-zone-layout` używa `width: calc(100% + 46px)` oraz `margin-inline: -23px`.
- Zapewnia to wyrównanie wewnętrznych ciemno-zielonych paneli do 1 px od lewej i prawej strony zewnętrznej zielonej karty.
- Lista przycisków panelu (`.player-zone-sections-list`, używana w `#adminTournamentTab` i w widoku użytkownika) ma `grid-auto-rows: 1fr`, a jej przyciski `min-height: var(--admin-games-panel-item-height)` przy `height: 100%`. Sztywna wysokość wiersza (41 px) nie mieściła dwuliniowej etykiety „Losowanie stołów” — tekst wychodził ok. 3 px poza ramkę przycisku. `1fr` wyrównuje wszystkie wiersze do najwyższego, więc lista pozostaje równa (56 px na desktopie). Reguła jest bliźniacza do tej w module Main.


### PIN użytkownika i uprawnienia
- Główna bramka PIN użytkownika korzysta z kontrolek `#userPlayerPinInput`, `#userPlayerPinOpenButton`, `#userPlayerPinStatus`; po poprawnej weryfikacji odsłania zakładki `Aktualności`, `Regulamin` i `TOURNAMENT OF POKER`.
- Weryfikacja głównego PIN porównuje 5-cyfrową wartość z `players[].pin` w stanie `second_tournament/state` i zapisuje sesję w `sessionStorage` (`secondUserPinVerified`, `secondUserPlayerId`).
- Nawigacja wewnątrz `TOURNAMENT OF POKER` filtruje przyciski zgodnie z mapą `SECOND_TOURNAMENT_PERMISSION_MAP`; każdy przycisk panelu wymaga przypisanego uprawnienia z mapy `SECOND_TOURNAMENT_PERMISSION_MAP`, więc bez żadnego uprawnienia sidebar nie pokazuje żadnej nawigacji.
- Moduł nie ma czatu: ani panel administratora, ani `TOURNAMENT OF POKER` nie mają zakładki „Czat”, a kod nie czyta ani nie zapisuje kolekcji `second_chat_messages`. Wiadomości zapisane w niej wcześniej pozostają w bazie bez zmian.

### Modal „Rebuy gracza” — zapis i odświeżanie
- Tabela modala używa identyfikatora `#adminCalculatorRebuyTable`, ma `width: max-content` i kolumny o szerokości `--col-num-sm` (spójność z Main).
- Zmiana w polu rebuy jest od razu sanityzowana do cyfr i aktualizuje lokalny stan/draft oraz `Tabela12`; zapis do Firebase wykonywany jest przy zamknięciu modalu z niezapisanymi zmianami albo przy operacji `Usuń Rebuy`.
- `saveState()` zapisuje ostatni błąd w `saveState.lastError`, a moduł loguje błędy do konsoli (`[Second] saveState error`, `[Second][Table12Rebuy] ...`) dla szybszej diagnostyki.
- Automatyczny reset rebuy po stanie `0 graczy i 0 stołów` działa przez czyszczenie pól wewnątrz dokumentu (`payments.table12Rebuys`, `pool.rebuyCells`), więc nie koliduje z ochroną przed usunięciem ostatniego dokumentu z kolekcji Firebase.
- Zamknięcie modala (`X`, klik poza modalem, ESC) zamyka okno bez dodatkowych opóźnień, jak w Main.


### Finał i wypłaty — aktualna logika
- W sekcji `final` administrator widzi `Tabela23` oraz `Tabela23A` (bez wizualizacji SVG stołu).
- `Tabela23A` budowana jest z graczy oznaczonych `ELIMINATED` w `Tabela23`; kolejność jest sterowana przez `final.eliminatedOrder` i przyciski `final-eliminated-move` (`▲/▼`).
- `Tabela24` jest wyliczana funkcją `buildPlacementRowsFromQueues(...)` i obsadza miejsca od końca w kolejności kolejek: `Tabela19A` → `Tabela22A` → `Tabela23A`.
- Liczba wierszy `Tabela24` zawsze odpowiada aktualnej liczbie graczy z sekcji `players` (`Lista graczy`).

## Aktualizacja techniczna 2026-04-17 (Tournament of Poker)

### 1. Stabilizacja renderu user-view po PIN
- Funkcja `verifyUserPin()` po zmianie stanu PIN wywołuje:
  - `updateProtectedTabsVisibility()`
  - `renderUserTournament()`
- Cel: usunąć efekt „starego fallbacku” po poprawnym PIN.

### 2. Wspólny helper podziału puli
- `getPoolSplitDisplay(row, index)` został wyniesiony do helpera globalnego modułu.
- `formatPercentDisplay(value)` działa teraz również globalnie (poza `initSecondModule()`), więc helper `getPoolSplitDisplay(...)` ma do niego dostęp zarówno w renderze admina, jak i user-view.
- Dzięki temu sekcja user `pool` korzysta z tej samej logiki wyświetlania co admin i nie ma ryzyka `ReferenceError` z powodu zakresu funkcji.

### 3. Sanityzacja danych turniejowych user-view
- Przed obliczeniami/renderem dodano filtrację elementów tablic do obiektów dla:
  - `semi.customTables` (użycie przez `safeUserSemiCustomTables`),
  - `pool.mods` (sekcje `pool` i `payouts`).
- Cel: odporność na historyczne dane z wpisami `null` i redukcja wejść do `catch` renderera.

### 4. Spójność sekcji `Wpłaty` admin/user
- W user-view sekcja `payments` renderuje układ tabel:
  - `TABELA10`, `TABELA11`, `TABELA12`
- Dane pochodzą z tych samych wyliczeń co pozostałe sekcje użytkownika, ale bez elementów edycyjnych.


## Aktualizacja techniczna 2026-05-06 (user-view Tournament helper scope)
- `percentInputToDecimal(value)` jest helperem modułu (procent `10` → `0.1`; zapisany dawniej ułamek ≤ 1 bez zmian), wspólnym dla panelu admina, widoku gracza i `computePoolTable16`. `setupUserView(root)` ma własny helper `formatCellNumber(value)`, żeby sekcje gracza nie zależały od helperów z funkcji admina.
- Dzięki temu render sekcji użytkownika nie zależy od lokalnych helperów z funkcji admina i nie przerywa się na brakujących definicjach.

## 2026-05-06 — Naprawa widoku użytkownika (Wpłaty)
- W `setupUserView(root)` dodano lokalny helper `toPercentText`, aby render sekcji `Wpłaty` miał dostęp do tego samego formatowania procentów i nie zgłaszał błędu `ReferenceError: toPercentText is not defined`.

- W `setupUserView(root)` dodano lokalny helper `toNumber(value)`, ponieważ sekcje user (`payments`, `pool`, `group`, `payouts`) korzystają z niego pośrednio przez `toPercentText(...)` i bez tej definicji pojawiał się `ReferenceError: toNumber is not defined`.

## Aktualizacja techniczna 2026-05-07 — fix mobile sidebar labels (user Tournament)
- Dodano dedykowane reguły `@media (max-width: 760px)` ograniczone do selektora `body:not(.is-admin) #tournamentTab`.
- `admin-games-layout` w user-view wymusza `grid-template-columns: minmax(0, 1fr)` + `min-width: 0`, aby szerokie tabele nie rozpychały szerokości całego layoutu.
- Sidebar (`.admin-games-sidebar`, `.admin-games-years-list`, `.player-zone-sections-list`, `.admin-games-year-button`) ma wymuszone `width/max-width: 100%` i zawijanie etykiet, dzięki czemu nazwy sekcji pozostają widoczne.
- Szerokie tabele turniejowe przewijają się lokalnie (`overflow-x: auto`) w kontenerze danych zamiast rozszerzać panel boczny poza viewport.

## Uodpornienie startu aplikacji (`runInitStep`)
- `Second/app.js` ma globalną funkcję `runInitStep(name, initializer)`, która opakowuje pojedynczy krok inicjalizacji w `try/catch` i loguje błąd przez `console.error` wraz z nazwą sekcji.
- `bootstrap()` uruchamia przez nią `initInstructionModal`, `initCustomsEmergencyModal` oraz `setupAdminView` / `setupUserOnlyView`; `resolveAdminMode()` jest objęte `try/catch` z domyślnym `false`.
- Dzięki temu wyjątek w jednym kroku nie przerywa pozostałych, a informacja o awarii trafia do konsoli przeglądarki zamiast znikać jako nieobsłużone odrzucenie obietnicy.
- Usunięto martwą, nigdy niewywoływaną kopię `initCustomsEmergencyModal` zagnieżdżoną w `setupAdminView`; obowiązuje wyłącznie definicja na poziomie modułu.

## App Check (`activateAppCheckIfConfigured`)
- Wywoływana z `getFirebaseApp()` w `Second/app.js` bezpośrednio po `firebase.initializeApp(...)`, przed `installFirestoreDeleteProtection(...)`.
- Wymaga skryptu `https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js` (dołączony w `Second/index.html`).
- Dostawca wybierany jest na podstawie `window.firebaseConfig` (plik `config/firebase-config.js`, wspólny dla obu modułów):

| Pole konfiguracji | Klasa dostawcy |
|---|---|
| `appCheckEnterpriseSiteKey` | `firebase.appCheck.ReCaptchaEnterpriseProvider` |
| `appCheckSiteKey` | `firebase.appCheck.ReCaptchaV3Provider` |
| oba naraz | Enterprise (ma pierwszeństwo) |
| żadne (lub sama biała spacja) | App Check nie jest aktywowany |

- Pomocnicza `readAppCheckConfigKey(fieldName)` zwraca przyciętą wartość pola albo pusty ciąg, gdy pole nie jest tekstem.
- Aktywacja: `firebase.appCheck().activate(new Provider(siteKey), true)` — drugi argument włącza automatyczne odświeżanie tokenu.
- Zabezpieczenia:
  - flaga `firebase.__kartyAppCheckActivated` gwarantuje jednokrotną aktywację,
  - brak klasy dostawcy w załadowanym SDK kończy się komunikatem `console.error` i pominięciem aktywacji (bez wyjątku podczas startu),
  - całość opakowana w `try/catch` z logiem `Nie udało się włączyć App Check.`.
- `window.firebaseConfig.appCheckDebugToken`: wartość `true` ustawia `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` (token wypisywany w konsoli przeglądarki), wartość tekstowa ustawia gotowy token. Pole służy wyłącznie do pracy lokalnej.
- Oba moduły korzystają z jednego projektu Firebase, więc wymuszanie App Check po stronie Firestore dotyczy modułów `Main` i `Second` jednocześnie.

### Konfiguracja po stronie Firebase Console (stan wdrożenia)
Ustawienia poniżej nie wynikają z kodu — są zapisane w projekcie Firebase `karty-turniej`
i są potrzebne, aby odtworzyć działające App Check:

| Ustawienie | Wartość |
|---|---|
| Dostawca atestacji | **reCAPTCHA Enterprise** |
| Klucz reCAPTCHA | typ **Web**, domena `cutelittlegoat.github.io`, weryfikacja domeny włączona, bez `localhost`, bez klucza testowego |
| Zarejestrowane aplikacje | **obie** aplikacje typu Web w projekcie (mają tę samą nazwę `Karty-Web`), oba wpisy tym samym kluczem |
| Token time to live (TTL) | **1 dzień** (`1` + `days`); wartość domyślna konsoli to 1 godzina |
| Próg ryzyka („App risk”) | domyślny **Medium (0.5)** |
| Wymuszanie (*Enforce*) dla Cloud Firestore | **wyłączone** — tryb samego monitorowania |

- Dopuszczalny zakres TTL to **30 minut – 7 dni**. Biblioteka App Check odświeża token
  mniej więcej **w połowie** TTL, więc przy 1 dniu odnowienie następuje co ~12 godzin,
  a przy domyślnej 1 godzinie — co ~30 minut korzystania z aplikacji.
- TTL zmienia się w Firebase Console → **App Check** → **Apps** → wiersz aplikacji →
  ikona edycji przy *reCAPTCHA Enterprise* → pole *Token time to live (TTL)* → **Save**.
  Zmianę trzeba wykonać osobno dla **każdej** zarejestrowanej aplikacji.
- Krótszy TTL zużywa szybciej darmowy limit reCAPTCHA (10 000 sprawdzeń miesięcznie w trybie
  *Essentials*, czyli w projekcie Google Cloud bez włączonych płatności).
- Zmiana TTL dotyczy wyłącznie nowych tokenów; już wydane zachowują poprzednią ważność.
