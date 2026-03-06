# Second — dokumentacja techniczna

## Tournament of Poker (admin)

### Główna logika
- Funkcja: `setupAdminTournament(rootCard)` w `Second/app.js`.
### Edycja uprawnień gracza (modal)
- Zamiast `window.prompt` używany jest dedykowany modal: `#secondPlayerPermissionsModal` w `Second/index.html`.
- Inicjalizacja i obsługa: `initSecondPlayerPermissionsModal(...)` w `Second/app.js`.
- Aktualna lista placeholderów uprawnień (`SECOND_AVAILABLE_PLAYER_PERMISSIONS`): `Zakładka1`, `Zakładka2`, `Zakładka3`.
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
- Pole `RAKE`:
  - wejście tylko cyfrowe,
  - podgląd z automatycznym `%` renderowany jako `<small>` (np. `15%`).
- Nad tabelą renderowany licznik: `Liczba dodanych graczy: X`.
- Tabela `players-table` ma kolumny:
  1. `Status` (przycisk `.payment-status-toggle` z ukrytym checkboxem sterującym statusem płatności):
     - zaznaczenie ustawia `assignments[playerId].status = "Opłacone"`,
     - odznaczenie ustawia `assignments[playerId].status = "Do zapłaty"`,
  2. `Nazwa` (input tekstowy),
  3. `PIN` (input 5-cyfrowy o poszerzonej szerokości + przycisk `Losuj`),
  4. `Uprawnienia` (badge + przycisk `Edytuj`),
  5. `Akcje` (przycisk `Usuń`).

### Obsługa PIN
- PIN jest filtrowany do cyfr i skracany do 5 znaków.
- Losowanie PIN: helper `generateUniquePin(playerId)` losuje 5-cyfrową wartość i unika kolizji z innymi graczami.

### Obsługa uprawnień
- `normalizeTournamentPermissions(value)` wspiera dane jako string CSV lub tablicę.
- Widok pokazuje uprawnienia jako badge.
- Przycisk `Edytuj` otwiera `prompt` i zapisuje listę uprawnień oddzieloną przecinkami do pola `permissions`.

### Usuwanie gracza
- `delete-player` usuwa rekord gracza z `players` oraz czyści powiązane dane (`assignments`, `tableEntries`, `group`, `semi`).

### Losowanie stołów — status i wybór stołu
- Usunięto górny, zbiorczy blok z polami `Nazwa` i `Łączna Suma` nad tabelą przypisań.
- Bloki pojedynczych stołów (tworzone po `Dodaj stół`) nadal mają nagłówek `Nazwa` + `Łączna Suma` i tabelę `Gracz/Wpisowe`.
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
