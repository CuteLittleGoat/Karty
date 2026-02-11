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
- `profit = entryFee + rebuy - payout`.
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


## 9. Reguły Firestore (aktualny wariant z produkcji)
Wersja reguł podana przez użytkownika (działa z domyślną konfiguracją `gamesCollection: "Tables"` oraz `gameDetailsCollection: "rows"`):

```
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
  }
}
```

Błąd „Brak uprawnień do zapisu w kolekcji Games” wynikał z rozjazdu między nazwą kolekcji po stronie aplikacji (`Games`) i regułami (brak bloku `match /Games/{docId}`).

Błąd „nie działa Usuń w Gry / Dodaj w Szczegółach” wynikał z innego rozjazdu: kod zapisywał szczegóły w subkolekcji `details`, a reguły dopuszczały tylko `rows`. Naprawa polega na ustawieniu domyślnej subkolekcji szczegółów gry na `rows` oraz dodaniu konfiguracji `gameDetailsCollection`, aby można było jawnie dopasować aplikację do reguł Firestore bez zmiany kodu.


## 10. Zakładka „Regulamin” — implementacja techniczna
### 9.1 Struktura HTML
- W panelu administratora dodano przycisk zakładki `data-target="adminRulesTab"`.
- Dodano panel `#adminRulesTab` z komponentem `.admin-rules` zawierającym:
  - `#adminRulesInput` (textarea),
  - `#adminRulesEdit`,
  - `#adminRulesSave`,
  - `#adminRulesDelete`,
  - `#adminRulesStatus`.
- W strefie użytkownika dodano przycisk zakładki `data-target="rulesTab"` i panel `#rulesTab` z polem `#rulesOutput` (readonly) oraz statusem `#rulesStatus`.

### 9.2 Zasady dostępu
- Zakładka użytkownika „Regulamin” jest zawsze widoczna w `initUserTabs()` i nie używa bramki PIN.
- Uprawnienia gracza (`permissions`) nadal kontrolują tylko zakładkę `nextGameTab`; regulamin nie jest częścią listy `AVAILABLE_PLAYER_TABS`.

### 9.3 Logika admina (`initAdminRules`)
- Źródło danych: dokument Firestore `app_settings/rules`.
- Odczyt: listener `onSnapshot` aktualizuje pole admina i stan statusu.
- Tryb edycji:
  - `Edytuj` przełącza textarea z `readonly` na tryb edycji i aktywuje przycisk `Zapisz`.
- Zapis:
  - `Zapisz` wykonuje `set(..., { merge: true })` z polami `text`, `updatedAt`, `source`.
- Usunięcie:
  - `Usuń` zapisuje pusty `text` do tego samego dokumentu (bez kasowania dokumentu), dzięki czemu użytkownicy od razu widzą brak treści.
- Trwałość:
  - dane są zapisane w Firestore, więc pozostają po restarcie przeglądarki i po odświeżeniu strony.

### 9.4 Logika użytkownika (`initRulesDisplay`)
- Listener `onSnapshot` odczytuje ten sam dokument `app_settings/rules`.
- Pole `#rulesOutput` zawsze jest tylko do odczytu i pokazuje:
  - treść regulaminu, albo
  - komunikat zastępczy „Administrator jeszcze nie dodał regulaminu.”, gdy `text` jest pusty.

### 9.5 Warstwa stylów
- Dodano nowe klasy:
  - `.admin-rules`,
  - `.admin-rules-actions`,
  - `.latest-rules`.
- Style zachowują istniejący motyw noir/gold/green i rozszerzają go o większe pole tekstowe regulaminu (`min-height: 170px`) oraz responsywne ułożenie akcji na mobile.

