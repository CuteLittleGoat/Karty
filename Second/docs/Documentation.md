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
- Aktualna lista uprawnień (`SECOND_AVAILABLE_PLAYER_PERMISSIONS`): `Czat`.
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
- Zapis: `docRef.set({ ...tournamentState, updatedAt: serverTimestamp }, { merge: true })`.
- Przy błędzie zapisu widok nie blokuje pracy użytkownika; pokazuje komunikat o problemie synchronizacji z Firebase i pozostaje interaktywny.

### Struktura stanu
- Metadane: `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`.
- Gracze: `players[]` z polami `id`, `name`, `pin`, `permissions`, `status` (status aktywności gracza).
- Status płatności gracza: `assignments[playerId].status` (`"Do zapłaty"` lub `"Opłacone"`).
- Pozostałe sekcje: `tables`, `assignments`, `tableEntries`, `payments`, `pool`, `group`, `semi`, `finalPlayers`, `payouts`.

### Losowanie graczy — aktualny render
- Nagłówek metadanych turnieju: grid `.t-section-grid`.
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
- Przycisk `Edytuj` otwiera `prompt` i zapisuje listę uprawnień oddzieloną przecinkami do pola `permissions`.

### Usuwanie gracza
- `delete-player` usuwa rekord gracza z `players` oraz czyści powiązane dane (`assignments`, `group`, `semi`).

### Losowanie stołów — status i wybór stołu
- Usunięto górny, zbiorczy blok z polami `Nazwa` i `Łączna Suma` nad tabelą przypisań.
- Bloki pojedynczych stołów (tworzone po `Dodaj stół`) mają nagłówek `Nazwa` + `Łączna Suma` i tabelę `Gracz/BUY-IN`; nowy stół otrzymuje nazwę `Stół${n}` (numerowanie od 1).
- Kolumna `BUY-IN` w bloku stołu jest tylko do odczytu i pokazuje wartość z metadanych turnieju (`buyIn`) dla każdego przypisanego gracza.
- Sekcja `draw` (`Losowanie stołów`) renderuje status gracza jako nieedytowalną pigułkę `.payment-status-label` (bez przycisku zmiany).
- Zmiana statusu płatności odbywa się w sekcji `players` przez checkbox `data-role="player-payment-status"`.
- Styl statusu:
  - `Do zapłaty` ma klasę `.payment-status-label.is-unpaid` (jasnoróżowy napis + czerwonawa obwódka),
  - `Opłacone` ma klasę `.payment-status-label.is-paid` (złoty napis + złota obwódka + glow).
- Wybór stołu (`assign-table`) i status w półfinale (`semi-assign-status`, `semi-assign-table`) zapisują się na zdarzeniu `change`, bez wymuszonego zapisu na `input`, co eliminuje znikanie rozwijanych list podczas wyboru.
- Handler `click` wykonuje logikę wyłącznie dla ról-akcji (`add-player`, `delete-player`, `add-table`, itp.). Kontrolki formularza (`checkbox`, `select`, `input`) nie uruchamiają już globalnego `render()` przez `click`, dzięki czemu przełączenie statusu działa stabilnie na desktopie i mobile (tap).

### Faza grupowa
- `Tabela17` ma teraz tylko kolumny `STACK GRACZA` oraz `REBUY/ADD-on(w żetonach na os)` (usunięto kolumnę `Gracz`).
- Dodano `Tabela17A` z kolumnami `LP`, `Gracz`, `Stack`, `%`, `Stół`.
- Kolumna `Stack` w `Tabela17A` jest polem liczbowym (`data-role="group-stack"`) mapowanym do `group.playerStacks[playerId]`.

### Półfinał
- Usunięto `Tabela20`.
- W stołach dodawanych przyciskiem `Dodaj nowy stół` tabela ma kolumny: `LP`, `Gracz`, `Stack`, `Eliminated`, `%`.
- Dodana kolumna `Stack` używa pola liczbowego `data-role="semi-custom-stack"` zapisywanego do `semi.customTables[].stack`.

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

### Przyciski dodawania — zmiana layoutu
- Dodano klasę `t-inline-add-button` dla przycisków `Dodaj gracza`, `Dodaj stół`, `Dodaj` (Podział puli) i `Dodaj nowy stół`.
- Przycisk usuwania stołu (`data-role="delete-table"`) używa klas `.admin-row-delete.draw-table-delete`, dzięki czemu jest kompaktowy jak w `Losowanie graczy` i wyrównany do prawej krawędzi karty stołu.
- Styl `#adminTournamentRoot .t-inline-add-button` ustawia `justify-self: flex-start` oraz `width: auto`, co eliminuje rozciąganie przycisku na pełną szerokość kontenera grid.
- Czerwone przyciski testowe w sekcji `Finał` pozostały bez zmian.

## Tournament of Poker (user)

### Synchronizacja z Firebase
- Funkcja: `setupUserView(root)` w `Second/app.js`.
- Dane sekcji turniejowej użytkownika są pobierane z `second_tournament/state` przez `onSnapshot`.
- Stan lokalny użytkownika jest normalizowany przez `normalizeTournamentState`, dzięki czemu brakujące pola nie psują renderu UI.

### Render sekcji użytkownika
- Użytkownik może przełączać sekcje przez przyciski `data-tournament-target`.
- Sekcje z aktywną prezentacją danych:
  - `players`: tabela status/nazwa/PIN/uprawnienia,
  - `draw`: tabela gracz/status/stół,
  - `payments`: podgląd pól `payments.table10` i `payments.table11`.
- Dla pozostałych sekcji renderowany jest komunikat informacyjny o zapisie danych w panelu administratora.

### Ręczne odświeżanie
- Przycisk `#userPanelRefresh` dla aktywnej zakładki `tournamentTab` wykonuje `get({ source: "server" })` dla `second_tournament/state`, co wymusza pobranie najnowszych danych z Firestore.

## Tournament of Poker – logika techniczna (Second)

### Kluczowe rozszerzenia stanu
- `payments.table12Rebuys` – przechowuje per-gracz listę rebuy (`values[]`).
- `pool.rebuyValues` – przechowuje wpisy edytowalnych (nieprzypisanych) komórek REBUY w `Tabela16`.
- `pool.mods[]` – wiersze `Tabela16` (split/mod/suma).

### Automatyczne przeliczenia
- `Tabela10`:
  - `BUY-IN` z metadanych turnieju (Losowanie graczy),
  - `REBUY/ADD-ON` z metadanych turnieju,
  - `SUMA` jako suma BUY-IN przypisanych graczy (na podstawie stołów),
  - `LICZ. REBUY/ADD-ON` jako liczba uzupełnionych pól rebuy w modalach `Rebuy gracza` (bez sumowania wartości).
- `Tabela11`:
  - `%` z pola `RAKE` (konwersja do ułamka),
  - `RAKE` = `Tabela10.SUMA * %`,
  - `BUY-IN` = suma `BUY-IN` pomniejszona o rake,
  - `REBUY/ADD-ON` = suma rebuy pomniejszona o rake,
  - `POT` = `BUY-IN + REBUY/ADD-ON`.

### Modal „Rebuy gracza” (Second)
- Nowy modal tworzony dynamicznie przy inicjalizacji turnieju.
- Otwierany z `Tabela12` (kolumna `REBUY`).
- Obsługuje dodawanie/usuwanie kolejnych pól `Rebuy` oraz zapis do Firestore.
- Po otwarciu pustego modala nie renderuje się żadna kolumna; pierwsza kolumna pojawia się dopiero po kliknięciu `Dodaj Rebuy` (zgodnie z modułem Main).
- Numeracja nagłówków (`Rebuy1..n`) jest globalna względem kolejności graczy w `Tabela12` (jak w module Main).
- Układ modala (`modal-header` + `modal-body`) jest spójny z modalem z modułu Main.

### Podział puli (Tabela15/Tabela16)
- `Tabela15` ma kolumny: `POT` i `PODZIAŁ`.
- `Tabela15.POT` pobiera wartość z `Tabela14.POT`.
- `Tabela15.PODZIAŁ` jest liczone jako: `Tabela15.POT` minus suma `PODZIAŁ PULI` od wiersza 4 do końca.
- W `Tabela16` kolumna `PODZIAŁ PULI` ma tryb mieszany:
  - wiersze 1–3: wejście procentowe (`50` => render `50%`, obliczenia `0.5`),
  - wiersze 4+: wejście liczbowe bez `%` (`10` => obliczenia `10`).
- `KWOTA`:
  - wiersze 1–3: `podział (w postaci dziesiętnej) * Tabela15.PODZIAŁ`,
  - wiersze 4+: wartość bezpośrednia z `PODZIAŁ PULI`.
- Liczba kolumn `REBUY` w `Tabela16` jest dynamiczna i równa liczbie uzupełnionych pól `Rebuy` w modalach `Rebuy gracza` (`Tabela12` → `REBUY`).
- Jeśli w modalach `Rebuy gracza` nie ma żadnej uzupełnionej wartości, `Tabela16` nie renderuje żadnej kolumny `REBUY`.
- Komórki `REBUY` są automatycznie przypisane do wierszy przez mapę biznesową (`REBUY1..REBUY30`) i pobierają wartości wpisane w modalach `Rebuy gracza` (bez nadpisywania wartością z `PODZIAŁ PULI`).
- Kolumny `MOD` są dynamiczne względem liczby kolumn `REBUY`: dla `0..12` widoczne jest `MOD1`, dla `13..20` widoczne są `MOD1` i `MOD2`, a dla `>20` widoczne są `MOD1`, `MOD2`, `MOD3`.
- `SUMA` = `KWOTA + suma REBUY w wierszu + MOD1 + MOD2 + MOD3` (z uwzględnieniem widocznych kolumn MOD).

### Faza grupowa
- `Tabela17` zredukowana do jednego wiersza.
- `Tabela17A` usunięta.
- `Tabela18` wylicza stack per stół i `ŁĄCZNY STACK`.
- `Tabela19` pobiera dane readonly z `Losowanie graczy` i `Wpłaty`.

### Nagłówki kolumn
- Dodano globalne wymuszenie uppercase dla nagłówków tabel (`th`) w module Second.
- Wyjątek realizowany przez klasę `table18-dynamic-header` (bez transformacji).

## Aktualny layout paneli użytkownika (Second)
- W trybie użytkownika kontener `.player-zone-layout` używa `width: calc(100% + 46px)` oraz `margin-inline: -23px`.
- Zapewnia to wyrównanie wewnętrznych ciemno-zielonych paneli do 1 px od lewej i prawej strony zewnętrznej zielonej karty.


### Czat użytkownika — PIN i uprawnienia
- Wejście PIN: `#chatPinInput`, akcja: `#chatPinOpenButton`, status: `#chatPinStatus`.
- Weryfikacja PIN porównuje 5-cyfrową wartość z `players[].pin` w stanie `second_tournament/state`.
- Dostęp jest nadawany tylko graczom z uprawnieniem `Czat` (pole `players[].permissions`).
- Stan weryfikacji sesji jest zapisywany w `sessionStorage` (`secondChatPinVerified`, `secondChatPlayerId`), dzięki czemu użytkownik wpisuje PIN raz na sesję przeglądarki.
- Wysyłka wiadomości do `second_chat_messages` zapisuje `authorName` z `players[].name` zweryfikowanego gracza.

### Modal „Rebuy gracza” — zapis i odświeżanie
- Tabela modala używa klasy `.game-details-rebuy-table` i ma stałe kolumny `8ch` (spójność z Main).
- Zmiana w polu rebuy ustawia flagę brudnych danych i natychmiast odświeża tabelę Tabela12 w tle.
- Zamknięcie modala (`X`, klik poza modalem, ESC) najpierw natychmiast ukrywa okno, a następnie wykonuje zapis `saveState()` gdy są zmiany, więc przycisk `×` działa również po edycji pól i wartości nie giną po zamknięciu.
- Akcje `Dodaj Rebuy` i `Usuń Rebuy` również zapisują stan i odświeżają widok po wykonaniu.
