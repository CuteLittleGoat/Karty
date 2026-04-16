# Second — dokumentacja techniczna

## Widok użytkownika — szerokość zewnętrznej ramki
- W widoku użytkownika (`body` bez klasy `is-admin`) kontener `.page` ma szerokość `calc(100% - 2px)` i `padding-inline: 1px`, więc panel zewnętrzny dochodzi do 1 px od lewej i prawej krawędzi ekranu.
- Dla `.user-card` pozostawiono lewy i prawy border o grubości `1px`, a pseudo-element `.user-card::before` jest wyłączony, aby pierwsza zielona ramka miała dokładnie 1 px po bokach.

## Nagłówek i przycisk instrukcji
- W `Second/index.html` sekcja `.header-controls` zawiera ikonę `<img class="header-icon" src="../Pliki/Ikona.png">` oraz przycisk `#secondInstructionButton` w tej samej linii.
- Ikona i układ są celowo spójne z modułem Main (ta sama grafika i ten sam wzorzec pozycjonowania: ikona po lewej, przycisk po prawej).
- Styl `.header-icon` w `Second/styles.css` używa `width: min(110px, 100%)` oraz `height: auto`, a `.header-controls` pracuje w układzie poziomym (`display: flex; align-items: center; justify-content: flex-end`).


## Tournament of Poker (admin)

### Główna logika
- Funkcja: `setupAdminTournament(rootCard)` w `Second/app.js`.
### Edycja uprawnień gracza (modal)
- Zamiast `window.prompt` używany jest dedykowany modal: `#secondPlayerPermissionsModal` w `Second/index.html`.
- Inicjalizacja i obsługa: `initSecondPlayerPermissionsModal(...)` w `Second/app.js`.
- Aktualna lista uprawnień (`SECOND_AVAILABLE_PLAYER_PERMISSIONS`): `Czat`, `Losowanie stołów`, `Wpłaty`, `Podział Puli`, `Faza Grupowa`, `Półfinał`, `Finał`, `Wypłaty`.
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
- Tabela `players-table` ma kolumny:
  1. `Status` (przycisk `.payment-status-toggle` z ukrytym checkboxem sterującym statusem płatności; wariant kompaktowy dopasowany wysokością do pól formularza):
     - zaznaczenie ustawia `assignments[playerId].status = "Opłacone"`,
     - odznaczenie ustawia `assignments[playerId].status = "Do zapłaty"`,
  2. `Nazwa` (input tekstowy),
  3. `PIN` (input 5-cyfrowy o poszerzonej szerokości + przycisk `Losuj`),
  4. `Uprawnienia` (badge + przycisk `Edytuj`),
  5. `Akcje` (przycisk `Usuń`).

### Obsługa PIN
- PIN jest filtrowany do cyfr i skracany do 5 znaków.
- Losowanie PIN: helper `generateUniquePin(playerId)` losuje 5-cyfrową wartość i unika kolizji z innymi graczami.
- Dodano twardą walidację unikalności dla wpisu ręcznego przez helper `getPinOwnerId(pin, excludedPlayerId)`:
  - jeżeli wpisany 5-cyfrowy PIN istnieje już u innego gracza, zapis jest blokowany,
  - pole PIN wraca do poprzedniej wartości gracza,
  - pokazuje się komunikat walidacyjny `Ten PIN jest już przypisany do innego gracza.`,
  - poprawny (unikalny) PIN czyści stan walidacji (`setCustomValidity("")`) i zapisuje się standardowo.

### Obsługa uprawnień
- `normalizeTournamentPermissions(value)` wspiera dane jako string CSV lub tablicę.
- Widok pokazuje uprawnienia jako badge.
- Przycisk `Edytuj` otwiera modal checkboxów i zapisuje listę uprawnień do pola `permissions`; komunikat o testowych uprawnieniach został usunięty z HTML modala.

### Usuwanie gracza
- `delete-player` usuwa rekord gracza z `players` oraz czyści powiązane dane (`assignments`, `group.playerStacks`, `group.eliminated`, `group.eliminatedWins`, `group.survivorStacks`, `semi`).
- Dodatkowo `delete-player` usuwa trwały wpis `payments.table12Rebuys[playerId]` przez `FieldValue.delete()` oraz sprawdza, czy po operacji nie został pusty układ `0 graczy i 0 stołów`.
- Jeśli po usunięciu gracza stan turnieju spełnia warunek `players.length === 0 && tables.length === 0`, aplikacja automatycznie resetuje `payments.table12Rebuys` i `pool.rebuyValues`, bez usuwania dokumentu `second_tournament/state`.

### Globalny reset Rebuy (Lista graczy)
- Kliknięcie przycisku `Wyzeruj Rebuy` uruchamia `resetAllTable12Rebuys()`.
- Operacja wymaga potwierdzenia `window.confirm` z ostrzeżeniem o nieodwracalności.
- Po zatwierdzeniu funkcja:
  - czyści `payments.table12Rebuys = {}` (usuwa wszystkie `RebuyX`),
  - czyści `pool.rebuyValues = {}` (usuwa ręczne wpisy powiązane z kolumnami Rebuy w `Tabela16`),
  - zamyka aktywny modal `Rebuy gracza` (jeśli był otwarty) i resetuje draft modalu.
- Zapis do Firebase wykonuje `saveState({ deletedPaths: ["payments.table12Rebuys", "pool.rebuyValues"] })`, więc stare ścieżki są najpierw usuwane przez `FieldValue.delete()`, a następnie utrwalany jest nowy stan dokumentu.
- Po sukcesie ustawiany jest komunikat statusu: `Wyzerowano wszystkie Rebuy.`
- W trakcie operacji aktywna jest flaga `globalRebuyResetInProgress`, która blokuje wieloklik i czasowo wyłącza przycisk resetu.

### Losowanie stołów — status i wybór stołu
- Usunięto górny, zbiorczy blok z polami `Nazwa` i `Łączna Suma` nad tabelą przypisań.
- Bloki pojedynczych stołów (tworzone po `Dodaj stół`) mają nagłówek `Nazwa` + `Łączna Suma` i tabelę `Gracz/BUY-IN`; nowy stół otrzymuje nazwę `Stół${n}` (numerowanie od 1).
- Kolumna `BUY-IN` w bloku stołu jest tylko do odczytu i pokazuje wartość z metadanych turnieju (`buyIn`) dla każdego przypisanego gracza.
- Sekcja `draw` (`Losowanie stołów`) renderuje status gracza jako nieedytowalną pigułkę `.payment-status-label` (bez przycisku zmiany).
- Zmiana statusu płatności odbywa się w sekcji `players` przez checkbox `data-role="player-payment-status"`.
- Styl statusu:
  - `Do zapłaty` ma klasę `.payment-status-label.is-unpaid` (jasnoróżowy napis + czerwonawa obwódka),
  - `Opłacone` ma klasę `.payment-status-label.is-paid` (złoty napis + złota obwódka + glow).
- Wybór stołu (`assign-table`) oraz półfinałowe przypisanie do stołu (`semi-assign-table`) zapisują się na zdarzeniu `change`, bez wymuszonego zapisu na `input`, co eliminuje znikanie rozwijanych list podczas wyboru.
- Handler `click` wykonuje logikę wyłącznie dla ról-akcji (`add-player`, `delete-player`, `add-table`, itp.). Kontrolki formularza (`checkbox`, `select`, `input`) nie uruchamiają już globalnego `render()` przez `click`, dzięki czemu przełączenie statusu działa stabilnie na desktopie i mobile (tap).
- `delete-table` dodatkowo usuwa `payments.table12Rebuys[playerId]` dla wszystkich graczy przypisanych do usuwanego stołu, od razu renumeruje globalne indeksy `RebuyX` bez luk (`1..N`) i przemapowuje `pool.rebuyValues` według mapy `stary indeks -> nowy indeks`.
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
- `Tabela21` pobiera listę graczy z `Tabela19B`: kolumna `STACK` jest zwykłym tekstem w komórce `<td>` (bez inputa), pokazuje `semiStack` (domyślnie `group.survivorStacks[playerId]`) i używa klasy szerokości `t-stack-input`; kolumna `%` liczy udział względem `Tabela18.ŁĄCZNY STACK` na bazie `semiStack`.
- `Tabela21.STÓŁ` jest selectem opartym o `semi.customTables[]`; wybór zapisuje `semi.assignments[playerId].tableId`.
- `Tabela22` renderuje po jednej karcie na każdy wpis `semi.customTables[]`; karta pokazuje nazwę stołu, `ŁĄCZNY STACK` liczony jako suma wartości `semiStack` (czyli stack po ewentualnej edycji w `Tabela21`) oraz wiersze `GRACZ / STACK / ELIMINATED`.
- Checkbox `ELIMINATED` w `Tabela22` zapisuje się do `semi.assignments[playerId].eliminated`, a kolejność graczy wyeliminowanych w półfinale utrwala się w `semi.eliminatedOrder`; stan pozostaje po odświeżeniu i po ponownym wejściu do aplikacji.
- `Tabela22A` pokazuje graczy wyeliminowanych w półfinale (`semi.assignments[playerId].eliminated === true`) w kolejności z `semi.eliminatedOrder` i pozwala zmieniać ją przyciskami `▲/▼` (`data-role="semi-eliminated-move"`).
- `Tabela FINAŁOWA` buduje się dynamicznie z rekordów przypisanych do stołów półfinałowych i filtruje wyłącznie graczy bez zaznaczonego `semi.assignments[playerId].eliminated`; `STACK` jest edytowalnym inputem liczbowym `data-role="semi-final-stack"` (domyślnie `0`, sanitizacja `digitsOnly`, `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`), `STÓŁ` jest tylko do odczytu, a `%` liczy się jako `finalStack / Tabela18.ŁĄCZNY STACK`.

### Wypłaty
- `Tabela23` pobiera `STACK` bezpośrednio z wartości wpisanych w `Tabela FINAŁOWA` (`semi.assignments[playerId].finalStack`) i sortuje finalistów malejąco po tym polu; `STACK` w `Tabela23` pozostaje readonly.
- `Tabela24` korzysta z kolejek eliminacji: miejsca od końca zajmują kolejno gracze z `group.eliminatedOrder`, następnie `semi.eliminatedOrder`, a następnie `final.eliminatedOrder` (czyli `Tabela23A`).
- Liczba wierszy `Tabela24` jest zawsze równa liczbie graczy w `players[]`.
- Kolumny `POCZĄTKOWA WYGRANA` i `KOŃCOWA WYGRANA` są readonly i pobierają odpowiednio `KWOTA` oraz `SUMA` z tego samego miejsca w `Tabela16`; jeśli miejsc w `Tabela24` jest więcej niż wierszy w `Tabela16`, reszta otrzymuje `0`.
- Checkboxy `data-role="toggle-payout-initial"` i `data-role="toggle-payout-final"` sterują realną widocznością kolumn w tabeli administratora i użytkownika, a ich stan jest utrwalany w `payouts.showInitial` / `payouts.showFinal`.

### Stabilność UI przy błędach Firebase
- Dla błędów odczytu `onSnapshot` renderuje się informacja ostrzegawcza, a nie pusty ekran sekcji.
- Dla błędów zapisu render nie jest blokowany; użytkownik widzi aktualny stan lokalny i komunikat o synchronizacji.


### Ochrona fokusu i edycji podczas autozapisu
- Dodano mechanizm przechwytywania i odtwarzania fokusu (`getTournamentEditableFocusState`, `restoreTournamentEditableFocusState`) oparty o `data-role` oraz identyfikatory (`data-player-id`, `data-table-id`, `data-id`).
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
- Stan lokalny użytkownika jest normalizowany przez `normalizeTournamentState`, dzięki czemu brakujące pola nie psują renderu UI.

### Render sekcji użytkownika
- Zakładka `TOURNAMENT OF POKER` jest ukryta do czasu poprawnej weryfikacji głównego PIN-u użytkownika (`#userPlayerPinInput`, `#userPlayerPinOpenButton`).
- Stan tej weryfikacji jest przechowywany w `sessionStorage` (`secondUserPinVerified`, `secondUserPlayerId`), więc użytkownik wpisuje PIN tylko raz do resetu lub odświeżenia strony.
- Po wejściu do `TOURNAMENT OF POKER` przyciski `data-tournament-target` są filtrowane per gracz; bez odpowiednich uprawnień nie renderują się przyciski nawigacji do paneli.
- Użytkownik może przełączać dostępne sekcje przez przyciski `data-tournament-target`.
- Sekcje z aktywną prezentacją danych:
  - `payments`: podgląd pól `payments.table10` i `payments.table11`,
  - `payouts`: tabela miejsc i wygranych zależna od flag `payouts.showInitial` / `payouts.showFinal`.
- Dla pozostałych dozwolonych sekcji renderowany jest komunikat informacyjny o zapisie danych w panelu administratora.

### Ręczne odświeżanie
- Przycisk `#userPanelRefresh` dla aktywnej zakładki `tournamentTab` wykonuje `get({ source: "server" })` dla `second_tournament/state`, co wymusza pobranie najnowszych danych z Firestore.

## Tournament of Poker – logika techniczna (Second)

### Kluczowe rozszerzenia stanu
- `payments.table12Rebuys` – przechowuje per-gracz listę rebuy jako `values[]` oraz globalne indeksy kolumn `indexes[]`.
- `pool.rebuyValues` – przechowuje wpisy edytowalnych (nieprzypisanych) komórek REBUY w `Tabela16`.
- `pool.mods[]` – wiersze `Tabela16` (split/mod/suma).
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
- Dodanie nowej kolumny rebuy nadaje `nextIndex = max(indexes)+1` globalnie dla całego turnieju, ale maksimum liczone jest już tylko z wpisów aktywnych graczy (`players[].id`).
- `Dodaj Rebuy` aktualizuje najpierw tylko lokalny draft i główny stan UI; zapis pustej kolumny do Firestore nie jest wykonywany od razu.
- Usunięcie kolumny wykonuje globalną kompaktację (`index > removedIndex => index-1`) we wszystkich wpisach graczy.
- Usunięcie stołu korzysta z pełnej renumeracji globalnej pozostałych kolumn (`oldIndex` sort rosnąco -> `newIndex = 1..N`), dzięki czemu znikają luki po indeksach należących do usuniętego stołu.
- Po kompaktacji rebuy wykonywane jest też przenumerowanie `pool.rebuyValues` (kolumny `data-col-index`), aby ręczne wpisy w `Tabela16` pozostały przypisane do właściwych kolumn `RebuyX`.
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
- Komórki `REBUY1..REBUY30` są automatycznie przypisane do wierszy przez mapę biznesową i są readonly (jak `KWOTA`) z wartościami z modali `Rebuy gracza` pomniejszonymi o procent z `Tabela14` (`wartość * (1 - rakePercent)`).
- Komórki od `REBUY31` wzwyż są renderowane dynamicznie, pozostają puste domyślnie (bez auto-przypisania do wiersza) i są edytowalne przez użytkownika (wartości ręczne są trzymane w `pool.rebuyValues`).
- `Tabela16` używa klasy `.tournament-pool-table16`, która wymusza stałą szerokość kolumn i pól wejściowych pod 4 znaki.
- Kolumny `MOD` są dynamiczne względem liczby kolumn `REBUY`: dla `0..12` widoczne jest `MOD1`, dla `13..20` widoczne są `MOD1` i `MOD2`, a dla `>20` widoczne są `MOD1`, `MOD2`, `MOD3`.
- `SUMA` = `KWOTA + suma REBUY w wierszu + MOD1 + MOD2 + MOD3` (z uwzględnieniem widocznych kolumn MOD).

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


### PIN użytkownika, czat i uprawnienia
- Główna bramka PIN użytkownika korzysta z kontrolek `#userPlayerPinInput`, `#userPlayerPinOpenButton`, `#userPlayerPinStatus`; po poprawnej weryfikacji odsłania zakładkę `TOURNAMENT OF POKER`.
- Weryfikacja głównego PIN porównuje 5-cyfrową wartość z `players[].pin` w stanie `second_tournament/state` i zapisuje sesję w `sessionStorage` (`secondUserPinVerified`, `secondUserPlayerId`).
- Nawigacja wewnątrz `TOURNAMENT OF POKER` filtruje przyciski zgodnie z mapą `SECOND_TOURNAMENT_PERMISSION_MAP`; każdy przycisk panelu wymaga przypisanego uprawnienia z mapy `SECOND_TOURNAMENT_PERMISSION_MAP`, więc bez żadnego uprawnienia sidebar nie pokazuje żadnej nawigacji.
- Sekcja czatu jest renderowana wewnątrz panelu Tournament (`data-tournament-target="chatTab"`) i używa kontrolek `#chatPinInput`, `#chatPinOpenButton`, `#chatPinStatus`.
- Weryfikacja PIN czatu porównuje 5-cyfrową wartość z `players[].pin` w stanie `second_tournament/state`; po poprawnej weryfikacji odblokowuje wysyłkę wiadomości tylko w sekcji `Czat`.
- Dostęp do wysyłki wiadomości jest nadawany tylko graczom z uprawnieniem `Czat` (pole `players[].permissions`).
- Stan weryfikacji sesji czatu jest zapisywany w `sessionStorage` (`secondChatPinVerified`, `secondChatPlayerId`), dzięki czemu użytkownik wpisuje PIN do czatu raz na sesję przeglądarki.
- Wysyłka wiadomości do `second_chat_messages` zapisuje `authorName` z `players[].name` zweryfikowanego gracza.

### Modal „Rebuy gracza” — zapis i odświeżanie
- Tabela modala używa identyfikatora `#adminCalculatorRebuyTable` i ma stałe kolumny `8ch` (spójność z Main).
- Zmiana w polu rebuy jest od razu sanityzowana do cyfr i aktualizuje lokalny stan/draft oraz `Tabela12`; zapis do Firebase wykonywany jest przy zamknięciu modalu z niezapisanymi zmianami albo przy operacji `Usuń Rebuy`.
- `saveState()` zapisuje ostatni błąd w `saveState.lastError`, a moduł loguje błędy do konsoli (`[Second] saveState error`, `[Second][Table12Rebuy] ...`) dla szybszej diagnostyki.
- Automatyczny reset rebuy po stanie `0 graczy i 0 stołów` działa przez czyszczenie pól wewnątrz dokumentu (`payments.table12Rebuys`, `pool.rebuyValues`), więc nie koliduje z ochroną przed usunięciem ostatniego dokumentu z kolekcji Firebase.
- Zamknięcie modala (`X`, klik poza modalem, ESC) zamyka okno bez dodatkowych opóźnień, jak w Main.


### Finał i wypłaty — aktualna logika
- W sekcji `final` administrator widzi `Tabela23` oraz `Tabela23A` (bez wizualizacji SVG stołu).
- `Tabela23A` budowana jest z graczy oznaczonych `ELIMINATED` w `Tabela23`; kolejność jest sterowana przez `final.eliminatedOrder` i przyciski `final-eliminated-move` (`▲/▼`).
- `Tabela24` jest wyliczana funkcją `buildPlacementRowsFromQueues(...)` i obsadza miejsca od końca w kolejności kolejek: `Tabela19A` → `Tabela22A` → `Tabela23A`.
- Liczba wierszy `Tabela24` zawsze odpowiada aktualnej liczbie graczy z sekcji `players` (`Lista graczy`).
