# Karty — pełna dokumentacja techniczna (backend/logika aplikacji)

## 1. Zakres dokumentu

Ten dokument opisuje logikę danych i działanie kodu aplikacji z perspektywy „backendu aplikacyjnego” realizowanego po stronie JavaScript + Firebase:
- model danych,
- kolekcje,
- przepływy zapisu/odczytu,
- walidacje,
- obliczenia,
- synchronizację real-time,
- mechanizmy uprawnień i PIN.

Dodatkowo zawiera mapę plików, powiązania z warstwą UI i opis stylów/fontów potrzebny do pełnego odtworzenia projektu.

---

## 2. Struktura projektu i odpowiedzialność plików

- `Main/index.html` — deklaracja wszystkich kontenerów widoków, tabel, modalnych okien i elementów sterujących.
- `Main/styles.css` — pełna warstwa wizualna: układ, kolory, typografia, komponenty tabel, przyciski, responsywność.
- `Main/app.js` — cała logika aplikacji: konfiguracja, dostęp do Firestore/Auth, walidacje, CRUD, obliczenia statystyk, nawigacja zakładek.
- `config/firebase-config.js` — konfiguracja środowiska Firebase + nazwy kolekcji konfigurowalnych.

---

## 3. Architektura logiczna (warstwa danych)

Aplikacja jest oparta o Firestore i subskrypcje `onSnapshot`, czyli tryb real-time.
Najważniejsze domeny danych:

1. **Użytkownicy i dostęp**
   - dokument z listą graczy, PIN-ami i uprawnieniami zakładek.
2. **Komunikacja**
   - aktualności od administratora,
   - czat graczy.
3. **Regulamin**
   - tekst zasad publikowany przez administratora.
4. **Rozgrywki**
   - gry admina,
   - gry użytkowników,
   - szczegóły gier (wiersze graczy),
   - potwierdzenia gier.
5. **Statystyki i ranking**
   - agregacje roczne,
   - ręczne korekty wag/wyników,
   - rankingi.

---

## 4. Stałe konfiguracyjne i klucze stanu

W `Main/app.js` zdefiniowano stałe sterujące zachowaniem aplikacji:

### 4.1 PIN i autoryzacja sesyjna
- `PIN_LENGTH = 5` — długość PIN.
- Klucze `sessionStorage` dla stref:
  - `nextGamePinVerified`,
  - `chatPinVerified`,
  - `confirmationsPinVerified`,
  - `userGamesPinVerified`,
  - `statisticsPinVerified`,
  - oraz klucze ID zalogowanego gracza dla czatu/potwierdzeń/gier/statystyk.

### 4.2 Kolekcje bazowe
- `PLAYER_ACCESS_COLLECTION = app_settings`
- `PLAYER_ACCESS_DOCUMENT = player_access`
- `RULES_DOCUMENT = rules`
- `CHAT_COLLECTION = chat_messages`
- `TABLES_COLLECTION = Tables`
- `GAMES_COLLECTION = Tables`
- `USER_GAMES_COLLECTION = UserGames`
- `GAME_DETAILS_COLLECTION = rows`
- `GAME_CONFIRMATIONS_COLLECTION = confirmations`
- `ADMIN_GAMES_STATS_COLLECTION = admin_games_stats`

### 4.3 Konfiguracja dynamiczna nazw kolekcji
Nazwy mogą być nadpisane w `window.firebaseConfig` przez klucze:
- `tablesCollection`,
- `gamesCollection`,
- `gameDetailsCollection`,
- `userGamesCollection`.

Funkcje `getTablesCollectionName`, `getGamesCollectionName`, `getGameDetailsCollectionName`, `getUserGamesCollectionName` zawsze zwracają nazwę końcową z fallbackiem do wartości domyślnych.

### 4.4 Konfiguracja kolumn
- `TABLE_COLUMNS` — schemat pól gracza używany w podsumowaniach tabelarycznych.
- `STATS_COLUMN_CONFIG` — definicja kolumn statystyk graczy, z oznaczeniem:
  - czy pole jest edytowalne,
  - czy pole jest wagą,
  - jak wyznaczana jest wartość wyświetlana.

---

## 5. Inicjalizacja aplikacji i uruchomienie modułów

### 5.1 `bootstrap()`
Funkcja startowa uruchamiana po załadowaniu strony:
1. Sprawdza tryb (`admin` / `player`) przez `getAdminMode()`.
2. Inicjuje Firebase przez `getFirebaseApp()`.
3. Rejestruje wszystkie moduły interfejsu i danych.

### 5.2 Przełączanie trybu
- `getAdminMode()` czyta query param `?admin=1`.
- Na tej podstawie ukrywane/pokazywane są sekcje `admin-only` i `player-only`.

### 5.3 Rejestrowanie odświeżeń zakładek
`registerAdminRefreshHandler(tabId, handler)` buduje mapę ręcznych akcji „Odśwież” dla aktywnej karty administratora.

---

## 6. Integracja z Firebase

### 6.1 `getFirebaseApp()`
- Waliduje obecność `window.firebase` i `window.firebaseConfig`.
- Inicjuje `firebase.initializeApp(...)` tylko raz.
- Zwraca zainicjowaną instancję.

### 6.2 Formatowanie błędów
`formatFirestoreError(error)` mapuje błędy na czytelne komunikaty dla statusów UI, rozróżniając m.in. `permission-denied`.

### 6.3 Debounce zapisów
`scheduleDebouncedUpdate(key, callback, delay)`:
- opóźnia częste zapisy (np. podczas pisania),
- minimalizuje liczbę zapisów do Firestore,
- używa mapy `debounceTimers` per klucz logiczny.

---

## 7. Model dostępu graczy (PIN + uprawnienia)

## 7.1 Struktura pojedynczego gracza
W dokumencie `app_settings/player_access` każdy wpis gracza zawiera co najmniej:
- `id`,
- `name`,
- `pin`,
- `permissions` (lista zakładek),
- `appEnabled` (flaga checkboxa „Aplikacja”).

### 7.2 Walidacja i generowanie PIN
- `sanitizePin(value)` — zostawia wyłącznie cyfry i tnie do 5 znaków.
- `isPinValid(value)` — regex `^\d{5}$`.
- `generateRandomPin()` — losuje 5-cyfrowy PIN.

### 7.3 Sprawdzanie dostępu do zakładek
`isPlayerAllowedForTab(player, tabKey)` decyduje, czy gracz ma prawo zobaczyć zakładkę po poprawnej autoryzacji PIN.

---

## 8. Bramy PIN w strefie gracza

Aplikacja ma niezależne bramy sesyjne na różne zakładki.

### 8.1 Najbliższa gra
- `getPinGateState()` / `setPinGateState()`.
- `initPinGate()` obsługuje formularz PIN i odblokowanie treści.

### 8.2 Czat
- `getChatPinGateState()`, `setChatPinGateState()`, `setChatVerifiedPlayerId()`, `getChatVerifiedPlayer()`.
- `initChatTab()` uruchamia logikę wejścia i publikacji wiadomości.

### 8.3 Gry do potwierdzenia
- Analogiczny zestaw metod `get/setConfirmations...`.
- `initUserConfirmations()` steruje listą gier oczekujących potwierdzenia.

### 8.4 Gry użytkowników
- `get/setUserGames...`.
- `initUserGamesTab()` + menedżer współdzielony.

### 8.5 Statystyki
- `get/setStatistics...`.
- `initStatisticsTab()` kontroluje odblokowanie i filtrowanie danych.

---

## 9. Moduły administratora

## 9.1 `initAdminPanelTabs()`
- Przełączanie aktywnej zakładki panelu.
- Synchronizacja klas `is-active` na przyciskach i kontenerach.

### 9.2 `initAdminPanelRefresh()`
- Obsługuje globalny przycisk „Odśwież”.
- Wywołuje handler aktywnej zakładki z `adminRefreshHandlers`.

### 9.3 `initAdminMessaging()`
- Obsługa publikacji aktualności.
- Zapis wiadomości admina do dedykowanej kolekcji.

### 9.4 `initAdminChat()`
- Widok moderacji czatu.
- Lista wiadomości + akcja czyszczenia wpisów starszych niż `CHAT_RETENTION_DAYS`.

### 9.5 `initAdminRules()`
- Odczyt i zapis dokumentu regulaminu.
- Przycisk „Zapisz” zapisuje całą treść.

### 9.6 `initAdminPlayers()`
- CRUD graczy.
- Edycja: nazwa, PIN, `appEnabled`.
- Otwieranie modala uprawnień i zapis listy `permissions`.

### 9.7 `initAdminTables()`
- Zarządzanie turniejami (lista gier + modal szczegółów).
- Operacje: dodaj/edytuj/usuń tabelę, dodaj/edytuj/usuń wiersz gracza.

### 9.8 `initAdminGames()`
- Moduł „Gry admina” z pełną logiką:
  - lista lat,
  - tabela gier,
  - modal szczegółów,
  - statystyki,
  - ranking,
  - edycja wag i wyników.

### 9.9 `initAdminUserGames()`
- Analogiczny moduł dla „Gry użytkowników”, oparty o wspólny menedżer.

### 9.10 `initAdminConfirmations()`
- Obsługa listy i statusów potwierdzeń gier zgłoszonych przez użytkowników.

---

## 10. Wspólny silnik gier użytkowników

### `initUserGamesManager({...})`
Abstrakcja obsługująca wspólną logikę dla:
- adminowych gier użytkowników,
- graczowych gier użytkowników.

Zapewnia:
- ładowanie list lat,
- filtrowanie po roku,
- obsługę listy gier i detali,
- obliczanie podsumowań,
- reużycie tych samych reguł walidacji/liczeń.

---

## 11. Gry: model danych i operacje

## 11.1 Struktura dokumentu gry
Dokument gry zawiera m.in.:
- `gameType` (`Cashout` / `Turniej`),
- `gameDate` (`YYYY-MM-DD`),
- `name`,
- `isClosed`,
- `createdAt`.

### 11.2 Struktura wiersza szczegółów
W subkolekcji `rows`:
- `playerName`,
- `entryFee`,
- `rebuy`,
- `payout`,
- `summary` (`+/-`),
- `points`,
- `championship` (bool),
- pola pomocnicze do agregacji.

### 11.3 Dodawanie gry
- Data domyślna: `getFormattedCurrentDate()`.
- Nazwa domyślna: `getNextGameNameForDate()`.
- Numer w nazwie jest liczony przez `parseDefaultTableNumber()` + `getNextTableName()`.

### 11.4 Sortowanie
`compareByGameDateAsc()`:
1. sort po `gameDate`,
2. fallback po `createdAt`,
3. fallback po nazwie (`localeCompare` dla `pl`).

### 11.5 Lata i filtr roczny
- `extractYearFromDate()` wyciąga rok.
- `normalizeYearList()` usuwa duplikaty i sortuje lata.
- Wybór roku zapisywany/odczytywany przez:
  - `loadSavedSelectedGamesYear(storageKey)`,
  - `saveSelectedGamesYear(year, storageKey)`.

### 11.6 Potwierdzenia aktywnych gier
- `getActiveGamesForConfirmations(...)`
- `getActiveGamesForConfirmationsFromCollections(...)`

Funkcje skanują wskazane kolekcje i zwracają gry aktywne do procesu potwierdzeń.

---

## 12. Statystyki i ranking

### 12.1 `initStatisticsView({...})`
Silnik wyliczania statystyk dla wybranego kontekstu i roku:
- liczba spotkań,
- % udziału,
- suma wpłat/wypłat,
- suma +/-,
- suma puli rozegranych gier,
- procenty globalne i procenty rozegranych gier,
- wynik końcowy.

### 12.2 Kolumny i wagi
`STATS_COLUMN_CONFIG` steruje:
- które pola są ręcznie edytowane,
- które są wagami,
- jakie wartości domyślne stosować,
- jak prezentować kolumny procentowe.

### 12.3 Ranking
Ranking jest generowany na podstawie pola wynikowego gracza i prezentowany w tabeli miejsc.

### 12.4 `initStatisticsViews()`
Uruchamia zestaw widoków statystycznych (admin + user) i dba o spójność konfiguracji.

---

## 13. Czat

### 13.1 Model wiadomości
W kolekcji czatu przechowywane są dokumenty m.in. z:
- `playerId`,
- `playerName`,
- `message`,
- `createdAt`.

### 13.2 Formatowanie czasu
`formatChatTimestamp(value)` zwraca czytelną datę i godzinę wiadomości.

### 13.3 Renderowanie listy
`renderPlayerChatMessages(documents)`:
- sortuje i buduje listę wpisów,
- renderuje autora, czas i treść.

### 13.4 Widoczność stref
`updateChatVisibility()` przełącza ekran PIN vs lista wiadomości zależnie od stanu bramy.

---

## 14. Gry do potwierdzenia

### 14.1 Widoczność
`updateConfirmationsVisibility()` steruje warstwą PIN i listą potwierdzeń.

### 14.2 Logika użytkownika
`initUserConfirmations()`:
- pobiera gry możliwe do potwierdzenia,
- wiąże wpis gracza z jego tożsamością z bramy PIN,
- zapisuje decyzję użytkownika.

### 14.3 Logika administratora
`initAdminConfirmations()`:
- prezentuje zbiorczą listę odpowiedzi,
- umożliwia kontrolę stanu potwierdzeń.

---

## 15. Reguły liczbowe i walidacja danych

### 15.1 Funkcje walidacyjne
- `sanitizeIntegerInput(value)` — dopuszcza liczby całkowite i opcjonalny minus na początku.
- `parseIntegerOrZero(value)` — niepoprawne/puste mapuje do `0`.
- `normalizeNumber(value)` i `formatNumber(value)` — normalizacja i prezentacja wartości liczbowych.

### 15.2 Obliczenia podstawowe
- `summary (+/-) = payout - (entryFee + rebuy)`.
- `% puli` i inne wartości procentowe wyliczane są na podstawie sum rocznych i pojedynczych gier.

---

## 16. Stabilizacja fokusu przy renderach real-time

Problem: przy `onSnapshot` i przebudowie DOM użytkownik tracił fokus.

Rozwiązanie:
- `isFocusableFormControl(element)` — rozpoznawanie kontrolek,
- `supportsSelectionRange(element)` — bezpieczne odtwarzanie kursora,
- `getFocusedAdminInputState(container)` — zapis „odcisku” aktywnego pola,
- `restoreFocusedAdminInputState(container, focusState)` — odtworzenie fokusu po renderze.

Mechanizm działa w tabelach i modalach, gdzie elementy są odtwarzane dynamicznie.

---

## 17. Daty i operacje pomocnicze

- `getDateSortValue(value)` — zamienia string daty na wartość sortowalną.
- `addDays(dateValue, days)` — przesuwanie daty o N dni.
- `toFirestoreDate(value)` — normalizacja daty do typu akceptowalnego przy zapisie.

---

## 18. Instrukcja i komunikaty statyczne

`initInstructionModal()` obsługuje modal instrukcji administratora.

`initLatestMessage()` i `initRulesDisplay()` odpowiadają za odczyt treści tylko do odczytu w strefie gracza.

---

## 19. Warstwa wizualna potrzebna do odtworzenia projektu

Mimo że logika jest backendowa, do wiernego odtworzenia aplikacji należy uwzględnić:

### 19.1 Fonty
- `Cinzel`
- `Cormorant Garamond`
- `Inter`
- `Rajdhani`

### 19.2 Styl i układ
- motyw ciemny (noir),
- kontrastowe akcenty złoto/zielone,
- układ kart i paneli,
- tabele z poziomym przewijaniem,
- modale z zamknięciem ikoną `X`,
- klasy aktywności zakładek (`is-active`),
- stany przycisków (`primary`, `secondary`, `danger`).

---

## 20. Jak odtworzyć aplikację 1:1 na podstawie dokumentacji

1. Zbudować strukturę HTML sekcji admin i gracz z identycznymi identyfikatorami elementów.
2. Odtworzyć style `styles.css` wraz z fontami i responsywnością.
3. Zaimportować Firebase (App + Firestore + opcjonalnie Auth, jeśli środowisko tego wymaga).
4. Skonfigurować `window.firebaseConfig` wraz z nazwami kolekcji.
5. Wdrożyć wszystkie moduły inicjalizacyjne z `app.js` i uruchamiać je z `bootstrap()`.
6. Włączyć `onSnapshot` dla list i detali oraz dopiąć logikę statusów.
7. Zastosować debounce zapisów i mechanizm utrzymania fokusu.
8. Odtworzyć algorytmy:
   - nazewnictwo „Gra X”,
   - filtrowanie po roku,
   - liczenie statystyk,
   - ranking,
   - walidacje PIN i liczb,
   - proces potwierdzeń.
9. Przetestować scenariusze admin + gracz dla wszystkich zakładek.

Dokument w tej postaci umożliwia odtworzenie całej logiki aplikacji bez odwołań do zewnętrznej wiedzy.
