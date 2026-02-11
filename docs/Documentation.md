# Karty — dokumentacja techniczna

## 1. Architektura plików
- `Main/index.html` — struktura UI (panel admina, zakładki, modale).
- `Main/styles.css` — pełne style (layout, typografia, komponenty, responsywność).
- `Main/app.js` — logika aplikacji (zakładki, Firebase, CRUD, obliczenia).
- `config/firebase-config.js` — konfiguracja projektu Firebase (`tablesCollection`, `gamesCollection`, klucze projektu).

## 2. Fonty, style i zasady wizualne
Aplikacja używa fontów Google:
- `Cinzel`
- `Cormorant Garamond`
- `Inter`
- `Rajdhani`

Główne zasady:
- ciemne tło noir,
- złote i zielone akcenty,
- czytelne tabele administracyjne,
- modalne okna dla operacji szczegółowych.

## 3. Panel administratora — zakładki
Panel zawiera karty:
- `adminNewsTab` (Aktualności),
- `adminRulesTab` (Regulamin),
- `adminPlayersTab` (Gracze),
- `adminTournamentsTab` (Turnieje),
- `adminGamesTab` (Gry).

Zakładka `adminStatsTab` została usunięta z HTML.

Przełączanie kart realizuje `initAdminPanelTabs()`.

## 4. Firebase i kolekcje
Najważniejsze kolekcje Firestore:
- `admin_messages` — wiadomości administratora,
- `app_settings/player_access` — gracze + PIN + uprawnienia + flaga `appEnabled` (stan checkboxa kolumny „Aplikacja”),
- `app_settings/rules` — dokument regulaminu (`text`, `updatedAt`, `source`),
- `Tables` + subkolekcja `rows` — zakładka Turnieje,
- `Tables` + subkolekcja `rows` — zakładka Gry (domyślnie ta sama kolekcja co Turnieje, nazwa konfigurowana przez `gamesCollection`, a subkolekcja przez `gameDetailsCollection`).

## 5. Zakładka Gry — pełny opis implementacji
Logika znajduje się w `initAdminGames()`.

### 5.1 Stan modułu (state)
- `years` — lista lat wyliczana automatycznie z `gameDate` dokumentów kolekcji skonfigurowanej w `gamesCollection` (domyślnie `Tables`),
- `selectedYear` — aktywny rok (zapisywany lokalnie jako ostatni wybór administratora),
- `games` — lista gier z kolekcji wskazanej przez `gamesCollection`,
- `detailsByGame` — mapa `gameId -> rows` (subkolekcja konfigurowana przez `gameDetailsCollection`, domyślnie `rows`),
- `detailsUnsubscribers` — aktywne subskrypcje snapshotów szczegółów,
- `activeGameIdInModal` — aktualnie otwarta gra w modalu,
- `playerOptions` — lista nazw graczy z zakładki Gracze.

### 5.2 Dodawanie gry
Przycisk `#adminGamesAddGame` dodaje dokument do kolekcji skonfigurowanej jako `gamesCollection` (domyślnie `Tables`) z polami:
- `gameType: "Cashout"`,
- `gameDate: getFormattedCurrentDate()` (zawsze bieżąca data w formacie `rrrr-MM-dd`),
- `name: getNextGameNameForDate(state.games, gameDate)`,
- `createdAt` (timestamp serwera).

Przycisk działa w bloku `try/catch/finally`:
- na czas zapisu jest blokowany (`disabled`),
- status pokazuje etap „Dodawanie gry...”,
- po sukcesie pojawia się komunikat potwierdzający z nazwą i datą gry,
- przy błędzie wyświetlany jest komunikat (osobno obsługiwany `permission-denied`, dla pozostałych błędów używany `formatFirestoreError()`).

To usuwa problem „klikam Dodaj i nic się nie dzieje”, bo administrator zawsze dostaje jednoznaczny feedback sukcesu lub błędu.

### 5.3 Logika nazewnictwa „Gra X”
Użyte funkcje:
- `parseDefaultTableNumber(name)` — odczytuje numer z formatu `Gra <liczba>`.
- `getNextTableName(tables)` — znajduje pierwszy wolny numer, np. 1,2,4 => zwraca 3.
- `getNextGameNameForDate(games, gameDate)` — filtruje gry dla konkretnej daty i wylicza pierwszy wolny numer tylko dla tej daty.

To spełnia regułę: **domyślna nazwa to „Gra X”, gdzie X jest pierwszym wolnym numerem w danym dniu**.

### 5.4 Edycja tabeli gier
Wiersz gry zawiera:
- `Rodzaj Gry` (`select`: Cashout/Turniej),
- `Data` (`input type=date`),
- `Nazwa` (`input text`) + przycisk `Szczegóły`,
- przycisk `Usuń`.

Zmiany są zapisywane do Firestore (`update`).

### 5.5 Rozdzielenie Gry vs Turnieje
Zakładka `Gry` działa na kolekcji z `gamesCollection` (domyślnie `Tables`).
Zakładka `Turnieje` działa na kolekcji z `tablesCollection` (domyślnie `Tables`).
Jeśli obie wartości wskazują ten sam zbiór, oba moduły zapisują dane do tej samej kolekcji.

### 5.6 Sidebar lat w zakładce Gry
Lata są wyznaczane wyłącznie z `gameDate` dokumentów kolekcji gier:
- parsowanie roku: `extractYearFromDate()`,
- normalizacja i sortowanie malejące: `normalizeYearList()`,
- **brak ręcznego dodawania/usuwania lat** — przyciski lat pojawiają się i znikają automatycznie zależnie od danych,
- w `localStorage` zapisywany jest tylko ostatnio wybrany rok (`ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY`).

Reguła aktywności:
- gdy danych nie ma i pojawi się pierwsza gra, jej rok staje się automatycznie aktywny,
- gdy pojawiają się kolejne lata, aktywny rok nie zmienia się samoczynnie,
- jeżeli aktywny rok zniknie z danych (np. usunięto ostatnią grę), aktywowany jest pierwszy dostępny rok z listy.

### 5.7 Modal „Szczegóły gry” — tryb edycji
Tabela w modalu zawiera kolumny:
- Gracz,
- Wpisowe,
- Rebuy/Add-on,
- Wypłata,
- +/- (obliczane),
- Punkty,
- Mistrzostwo,
- Usuń.

#### Walidacja pól liczbowych
- `sanitizeIntegerInput(value)` przepuszcza tylko cyfry + opcjonalny minus na początku.
- `parseIntegerOrZero(value)` konwertuje wartość do liczby całkowitej, puste/niepoprawne => 0.

#### Obliczanie +/-
Dla każdego wiersza:
- `profit = payout - (entryFee + rebuy)`.
Pole jest wyświetlane jako wartość obliczana, bez ręcznej edycji.

#### Powiązanie pola Gracz z zakładką Gracze
Lista opcji pobierana jest z `app_settings/player_access`.
Jeżeli gracz został usunięty z zakładki Gracze, to:
- historyczna wartość w istniejącym wpisie zostaje,
- jest oznaczona jako `(usunięty)`,
- nie pojawia się jako normalna opcja do nowego wyboru.

### 5.8 Podsumowanie gry
Dla każdej gry z wybranego roku renderowany jest segment:
- nagłówek: `Podsumowanie gry [nazwa]`,
- pole `Pula`.

Obliczenia:
- `Pula = suma(entryFee + rebuy)` ze wszystkich wierszy szczegółów danej gry,
- `% puli = round((payout / pool) * 100)`,
- sortowanie tabeli podsumowania: malejąco po `% puli`.

### 5.8 Zamykanie modali (UI po uproszczeniu)
W modalach administracyjnych, które wcześniej posiadały dwa przyciski zamykania (ikona `×` oraz przycisk tekstowy `Zamknij`), pozostawiono wyłącznie ikonę `×` w prawym górnym rogu. Dotyczy to: `instructionModal`, `playerPermissionsModal`, `gameDetailsModal`.

W `Main/app.js` usunięto referencje do elementów `#instructionCloseFooter`, `#playerPermissionsCloseFooter` i `#gameDetailsCloseFooter`, a logika zamykania korzysta teraz z:
- kliknięcia `×`,
- kliknięcia tła modala,
- klawisza `Escape` (tam, gdzie było dostępne wcześniej).

### 5.9 Statystyki (wewnątrz zakładki Gry)
Dolna tabela `Statystyki` pokazuje agregaty dla aktywnego roku:
- liczba gier,
- łączna pula.

## 6. Stabilizacja fokusu pól (rozwiązanie problemu „znika podświetlenie pola”)

### 6.1 Objaw błędu przed poprawką
W modułach administracyjnych aplikacja intensywnie korzysta z `onSnapshot(...)` Firestore. Każda zmiana zapisana do bazy wywołuje ponowny render odpowiedniej tabeli/modala (`innerHTML = ""` + odbudowa węzłów DOM).

Przed poprawką, gdy użytkownik wpisywał znaki do pola, po przyjściu odświeżenia z Firestore tworzony był nowy element `<input>`/`<select>`, a przeglądarka traciła odniesienie do poprzednio aktywnego elementu. Skutek dla użytkownika:
- znikało wizualne podświetlenie aktywnego pola,
- wpisywanie było przerywane,
- trzeba było ponownie kliknąć to samo pole, aby dokończyć wpisywanie,
- w przypadku pól tekstowych kursor wracał do domyślnej pozycji zamiast zostać tam, gdzie był.

### 6.2 Miejsca, gdzie problem występował
Problem został potwierdzony i naprawiony we wszystkich głównych obszarach edycji danych:
- zakładka **Turnieje** (wcześniej naprawione),
- zakładka **Gracze** (`Nazwa`, `PIN`),
- zakładka **Gry** (tabela gier: `Rodzaj Gry`, `Data`, `Nazwa`),
- modal **Szczegóły gry** (`Gracz`, pola liczbowe, `Mistrzostwo`).

### 6.3 Implementacja techniczna (krok po kroku)
1. **Uogólnienie detekcji aktywnego pola**
   - dodano `isFocusableFormControl(element)`, które rozpoznaje `HTMLInputElement`, `HTMLSelectElement`, `HTMLTextAreaElement`.
2. **Bezpieczne zapamiętanie pozycji kursora**
   - dodano `supportsSelectionRange(element)` i warunkowe pobieranie `selectionStart/selectionEnd` tylko dla pól, które to wspierają.
3. **Rozszerzenie klucza identyfikacji pola**
   - stan fokusu obejmuje teraz: `data-focus-target`, `data-table-id`, `data-row-id`, `data-column-key`, oraz dodatkowe `data-section`.
   - `data-section` eliminuje kolizje identyfikatorów pomiędzy podobnymi tabelami/modałami.
4. **Przywracanie fokusu po renderze**
   - `restoreFocusedAdminInputState(...)` wyszukuje element po komplecie `data-*`, ustawia `focus()` i odtwarza selekcję kursora, jeśli to możliwe.
5. **Wpięcie mechanizmu do wszystkich rendererów z przebudową DOM**
   - `renderPlayers()`:
     - zapamiętanie fokusu przed `body.innerHTML = ""`,
     - odtworzenie fokusu po odbudowaniu wierszy.
   - `renderGamesTable()`:
     - analogiczny mechanizm dla tabeli gier.
   - `renderModal(gameId)`:
     - analogiczny mechanizm dla wierszy szczegółów gry.
6. **Nadanie identyfikatorów `data-*` wszystkim edytowalnym kontrolkom**
   - pola w `Gracze`: `data-focus-target="player-field"` + `data-section="players"` + identyfikacja wiersza/kolumny,
   - pola w tabeli `Gry`: `data-focus-target="game-list"` + `data-section="games-table"` + `gameId` + kolumna,
   - pola w modalu szczegółów: `data-focus-target="game-details-row"` + `data-section="games-modal"` + `gameId` + `rowId` + kolumna.

### 6.4 Dlaczego rozwiązanie działa
W momencie przebudowy widoku stare węzły DOM znikają, ale przed usunięciem zapisywany jest „odcisk palca” aktywnego kontrolera (`data-*` + pozycja kursora). Po renderze nowy element o tym samym identyfikatorze logicznym jest odnajdywany i otrzymuje fokus. Użytkownik widzi ciągłe podświetlenie i może pisać bez ponownego klikania.

### 6.5 Efekt końcowy
- brak zrywania wpisywania podczas autosynchronizacji Firestore,
- brak utraty podświetlenia aktywnego pola,
- zachowanie pozycji kursora w polach tekstowych,
- spójne zachowanie we wszystkich zakładkach administracyjnych, które renderują dane reaktywnie.


## 6A. Zakładka Gracze — nowa kolumna „Aplikacja” (persistencja checkboxa)
Implementacja znajduje się w `initAdminPlayers()` i działa całkowicie niezależnie od pozostałych modułów.

### 6A.1 Model danych gracza
Każdy obiekt gracza zapisany w `app_settings/player_access.players[]` zawiera teraz dodatkowe pole:
- `appEnabled: boolean`

W `normalizePlayer(player, index)` pole jest normalizowane przez `Boolean(player.appEnabled)`, więc:
- brak pola w starszych rekordach = `false`,
- istniejące wartości `true/false` są zachowane.

### 6A.2 Render tabeli i kolejność kolumn
W `Main/index.html` nagłówek tabeli graczy ma kolejność:
1. `Aplikacja`
2. `Nazwa`
3. `PIN`
4. `Uprawnienia`
5. akcje

W `renderPlayers()` w `Main/app.js` do każdego wiersza tworzony jest pierwszy `td` (`.players-app-cell`) z checkboxem (`.players-app-checkbox`).
Checkbox ustawia `checked = Boolean(player.appEnabled)`.

### 6A.3 Zapis i trwałość między sesjami
Po kliknięciu checkboxa wywoływane jest:
- `updatePlayerField(player.id, "appEnabled", appCheckbox.checked)`

Mechanizm zapisu jest ten sam, co dla pozostałych pól gracza:
- `scheduleDebouncedUpdate(...)`
- `savePlayers()` -> zapis całej tablicy `players` do Firestore

Ponieważ źródłem danych jest Firestore i aktywny `onSnapshot(...)`, stan checkboxa:
- jest utrzymywany po odświeżeniu strony,
- jest utrzymywany po restarcie przeglądarki,
- synchronizuje się między sesjami administratora.

### 6A.4 Brak wpływu na inne moduły
Flaga `appEnabled` jest tylko prezentowana i zapisywana w tabeli „Gracze”.
Nie bierze udziału w:
- walidacji PIN,
- uprawnieniach zakładek (`permissions`),
- obliczeniach w zakładce Gry/Turnieje,
- wyświetlaniu danych w sekcji gracza.

## 7. Inne kluczowe funkcje JS
- `initAdminPlayers()` — zarządzanie graczami i PIN,
- `initAdminNews()` — wysyłka wiadomości,
- `initAdminTables()` — zarządzanie zakładką Turnieje,
- `initLatestMessage()` — odczyt ostatniej wiadomości,
- `initInstructionModal()` — ładowanie instrukcji do modala,
- `initPinGate()` — wejście PIN po stronie gracza.

## 8. Jak odtworzyć aplikację tylko na podstawie dokumentacji
1. Zbuduj HTML z panelem admina (zakładki, tabele, modale) i strefą gracza.
2. Dodaj style noir/gold/green oraz siatkę kart i komponenty tabel.
3. W JS dodaj:
   - wykrywanie trybu admin (`?admin=1`),
   - przełączanie zakładek,
   - moduły Firebase i snapshot listeners,
   - pełny CRUD dla Gracze, Turnieje, Gry,
   - logikę nazw `Gra X` zależnie od daty,
   - modal szczegółów gry z walidacją liczb,
   - mechanizm stabilizacji fokusu pól (`data-*` identyfikujące + zapamiętywanie/odtwarzanie kursora po renderze),
   - obliczenia `+/-`, `Pula`, `% puli`, sortowanie,
   - agregaty roczne w sekcji Statystyki (w zakładce Gry).
4. Podłącz `firebase-app-compat` i `firebase-firestore-compat`.


## 9. Firestore — aktualne Rules i struktura bazy danych

### 9.1 Aktualne reguły bezpieczeństwa (stan bieżący)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }
  }
}
```

### 9.2 Aktualna struktura bazy Firestore (kolekcje i dokumenty)
W projekcie działają następujące kolekcje:
1. `admin_messages`
   - komunikaty admina (`message`, `createdAt`, `source`).
2. `app_settings`
   - `next_game` z polem `pin`,
   - `player_access` z tablicą `players[]` (`id`, `name`, `pin`, `permissions`, `appEnabled`),
   - `rules` (`text`, `updatedAt`, `source`).
3. `Tables`
   - dokumenty gier/turniejów (`gameType`, `gameDate`, `name`, `createdAt`, itp.),
   - subkolekcja `rows` dla szczegółów wpisów.
4. `Collection1`
   - kolekcja historyczna utrzymywana pod obecne reguły.
5. `chat_messages`
   - wiadomości czatu (`text`, `authorName`, `authorId`, `createdAt`, `expireAt`, `source`).
6. `players`
   - dokument legacy `players` z polami agregacyjnymi (`Cash`, `GamesPlayed`, `GamesWon`, itd.).

## 10. Czat — implementacja techniczna (wariant bez TTL Policy)

### 10.1 Zakres UI (`Main/index.html`)
Dodane elementy:
- nowa zakładka admina: przycisk `data-target="adminChatTab"` + panel `#adminChatTab`,
- sekcja moderacji: `#adminChatList`, przycisk `#adminChatCleanup`, status `#adminChatStatus`,
- nowa zakładka gracza: przycisk `data-target="chatTab"` + panel `#chatTab`,
- bramka PIN dla czatu: `#chatPinGate` (`#chatPinInput`, `#chatPinSubmit`, `#chatPinStatus`),
- właściwy widok czatu: `#chatContent`, lista `#chatMessages`, formularz `#chatMessageInput` + `#chatMessageSend`.

### 10.2 Stałe i stan modułu (`Main/app.js`)
Najważniejsze dodatki:
- `CHAT_COLLECTION = "chat_messages"`,
- `CHAT_RETENTION_DAYS = 30`,
- klucze sesyjne: `CHAT_PIN_STORAGE_KEY`, `CHAT_PLAYER_ID_STORAGE_KEY`,
- rozszerzenie `AVAILABLE_PLAYER_TABS` o `chatTab`,
- `chatState` z osobnymi subskrypcjami gracza i admina.

### 10.3 Bramkowanie PIN + uprawnienie `chatTab`
`initChatTab()` realizuje pełny przepływ:
1. sanitizacja i walidacja PIN (`sanitizePin`, `isPinValid`),
2. mapowanie PIN -> gracz (`adminPlayersState.playerByPin`),
3. sprawdzenie `isPlayerAllowedForTab(player, "chatTab")`,
4. zapis sesji (`setChatPinGateState`, `setChatVerifiedPlayerId`),
5. uruchomienie live subskrypcji wiadomości.

Brak uprawnienia lub błędny PIN zwraca komunikat: „Błędny PIN lub brak uprawnień do zakładki „Czat”.”.

### 10.4 Wysyłka wiadomości i model danych
Przy `#chatMessageSend` aplikacja zapisuje dokument do `chat_messages`:
- `text`,
- `authorName`,
- `authorId`,
- `createdAt: serverTimestamp()`,
- `expireAt: Timestamp(now + 30 dni)`,
- `source: "web-player"`.

Dzięki temu retencja działa bez TTL policy: pole `expireAt` jest używane przez ręczne czyszczenie admina.

### 10.5 Moderacja administratora
`initAdminChat()` dodaje:
1. live listę ostatnich 200 wpisów (`orderBy(createdAt, desc)`),
2. usuwanie pojedynczych dokumentów (`delete()` po `doc.id`),
3. masowe czyszczenie rekordów starszych niż 30 dni:
   - zapytanie `where("expireAt", "<=", now).limit(200)`,
   - kasowanie partiami (`batch.delete`),
   - pętla aż do wyczyszczenia zbioru,
   - raport statusu z liczbą usuniętych rekordów.

### 10.6 Integracja z panelem Gracze
Ponieważ `AVAILABLE_PLAYER_TABS` zawiera `chatTab`, modal uprawnień w `initAdminPlayers()` automatycznie:
- pokazuje opcję **Czat**,
- zapisuje ją do `players[].permissions`,
- renderuje badge „Czat” w tabeli graczy.

### 10.7 Warstwa stylów czatu (`Main/styles.css`)
Dodane klasy:
- admin: `.admin-chat`, `.admin-chat-actions`, `.admin-chat-list`, `.admin-chat-item`, `.admin-chat-meta`, `.admin-chat-delete`,
- gracz: `.chat-content`, `.chat-messages`, `.chat-message-item`, `.chat-message-header`, `.chat-form`, `.chat-form-actions`, `.chat-empty`.

Wszystkie nowe komponenty używają istniejącej palety noir/gold/green i tych samych fontów (`Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`).

## 11. Jak odtworzyć aplikację tylko na podstawie dokumentacji
1. Zbuduj HTML z panelem admina (zakładki, tabele, modale) i strefą gracza.
2. Dodaj style noir/gold/green oraz siatkę kart i komponenty tabel.
3. W JS dodaj:
   - wykrywanie trybu admin (`?admin=1`),
   - przełączanie zakładek,
   - moduły Firebase i snapshot listeners,
   - pełny CRUD dla Gracze, Turnieje, Gry,
   - logikę nazw `Gra X` zależnie od daty,
   - modal szczegółów gry z walidacją liczb,
   - mechanizm stabilizacji fokusu pól (`data-*` identyfikujące + zapamiętywanie/odtwarzanie kursora po renderze),
   - moduł czatu (PIN + `chatTab`, real-time, wysyłka, moderacja, cleanup 30 dni),
   - obliczenia `+/-`, `Pula`, `% puli`, sortowanie,
   - agregaty roczne w sekcji Statystyki (w zakładce Gry).
4. Podłącz `firebase-app-compat` i `firebase-firestore-compat`.
