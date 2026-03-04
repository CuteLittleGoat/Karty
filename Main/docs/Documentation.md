# Main — dokumentacja techniczna

## 1. Struktura modułu
- `Main/index.html` — pełny układ widoku użytkownika i administratora oraz modal instrukcji.
- `Main/styles.css` — motyw, layout kart, tabele i style modali.
- `Main/app.js` — logika Firebase, zakładek, panelu admina, strefy gracza, kalkulatora i modali.

## 2. Aktualny zakres funkcjonalny tej wersji
- Widok użytkownika ma dedykowany przycisk `#userPanelRefresh` z etykietą „Odśwież” i statusem `#userPanelRefreshStatus`; akcja odświeża dane aktywnej zakładki bez `window.location.reload()`, dzięki czemu sesje PIN pozostają aktywne do resetu aplikacji.
- W sekcji `#confirmationsTab` usunięto lokalny przycisk `#confirmationsRefresh`; odświeżanie danych działa automatycznie po wejściu w zakładkę oraz ręcznie przez globalny przycisk `#userPanelRefresh` z nagłówka panelu użytkownika.
- Edytor notatek (`getSummaryNotesModalController`) zapamiętuje ostatnie zaznaczenie tekstu i odtwarza je po kliknięciu przycisku koloru, dzięki czemu kolorowanie działa poprawnie również na desktopie przy kolejnych zmianach koloru.
- Lista gier (zakładki **Gry admina** i **Gry użytkowników**) ma kolumnę `IlośćPotwierdzonych` z wartością `potwierdzeni/zapisani`, liczoną dynamicznie z wierszy gry i subkolekcji `confirmations`, oraz przycisk `Statusy` otwierający modal read-only z listą graczy i ich statusem potwierdzenia.
- Inicjalizacja zarządzania grami użytkowników (`initUserGamesManager`) posiada własny kontroler modala statusów potwierdzeń; usuwa to błąd referencji przy snapshotach i pozwala poprawnie działać przyciskom `Statusy` i `Szczegóły` bez czekania na dodanie/usunięcie gry.
- Snapshoty detali gier użytkowników odświeżają teraz również widok tabeli gier, więc licznik `IlośćPotwierdzonych` aktualizuje się natychmiast po wejściu do zakładki oraz po zmianach składu graczy.
- Handler przycisku odświeżania dla zakładki `Gry użytkowników` renderuje ponownie tabelę i podsumowania aktywnego roku.
- Widok **Najbliższa gra** wyświetla tylko gry otwarte z datą równą bieżącemu dniowi lub późniejszą; rekordy starsze niż dzisiejsza data są automatycznie ukrywane. Parser dat obsługuje formaty `YYYY-MM-DD`, `DD.MM.YYYY` i `DD-MM-YYYY`, a sortowanie jest rosnące po dacie (najbliższa gra na górze).
- Modale `Szczegóły gry` (`#gameDetailsModal`, `#userGameDetailsModal`, `#playerUserGameDetailsModal`) mają:
  - nagłówek tekstowy `Rebuy/Add-on` (bez akcji zbiorczej),
  - przycisk w każdej komórce `Rebuy/Add-on`, który pokazuje sumę rebuy danego gracza i otwiera modal `Rebuy gracza` z przyciskami `Dodaj Rebuy`/`Usuń Rebuy` oraz zamknięciem przez ikonę `×` w prawym górnym rogu,
  - pola liczbowe (`entryFee`, `payout`, `points` oraz pola `RebuyN` w modalu rebuy) działają jako `type="text"` z hintami mobilnymi `inputMode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"`,
  - modal rebuy przechowuje osobno wartości i indeksy kolumn (`rebuyIndexes`, `rebuyNextIndex`), dzięki czemu kolumny `RebuyN` są numerowane niezależnie dla każdego gracza; po usunięciu ostatniej kolumny następne dodanie wraca do najbliższego wolnego numeru,
  - bez podświetlania potwierdzeń w samym modalu szczegółów; podświetlenie przeniesione do modala statusów z kolumny `IlośćPotwierdzonych`.
- Tworzenie i filtrowanie gier użytkownika zostało rozszerzone o powiązanie także po PIN-ie twórcy (`createdByPlayerPin`) oraz kompatybilność z istniejącym powiązaniem po `createdByPlayerId`.
- Po pozytywnej weryfikacji PIN dla sekcji „Gry użytkowników” emitowane jest zdarzenie `user-games-access-updated`, które natychmiast przelicza dostępne lata i renderuje dane bez potrzeby dodawania nowej gry.
- Dostęp do listy graczy jest inicjalizowany globalnie (`initSharedPlayerAccess`), a synchronizacja `synchronizeStatisticsAccessState()` jest wywoływana także po wejściu do Strefy Gracza; dzięki temu mapowanie PIN→gracz i uprawnienia statystyk odświeżają się od razu, a zakładka „Statystyki” pokazuje lata/dane bez ręcznego resetu strony.
- Potwierdzenia obecności i liczniki `potwierdzeni/zapisani` zostały przepięte na klucz logiczny gracza oparty o `playerId` (z fallbackiem do `playerName` dla starszych rekordów), co eliminuje konflikt przy duplikatach nazw.
- Wiersze gier (`rows`) oraz wybór gracza w modalach szczegółów zapisują teraz jednocześnie `playerId` i `playerName`, dzięki czemu prezentacja pozostaje czytelna, a logika opiera się o identyfikator unikatowy.
- Statystyki roczne i konfiguracja ręcznych wag (`admin_games_stats`) używają klucza gracza wyliczanego z `playerId` (fallback: `playerName`) oraz serializują `playerId` w rekordach manualnych; ten sam klucz jest używany zarówno w zakładce „Statystyki”, jak i w sekcji statystyk zakładki „Gry admina”.
- Układ tabel w środkowej sekcji zakładek `#adminGamesTab` i `#adminStatisticsTab` korzysta z tej samej reguły responsywnej co widok gracza (`width: max-content; min-width: 100%` w obrębie `overflow-x: auto`), więc kolumny `Opis` i `Wartość` skalują się dynamicznie przy zwężaniu i rozszerzaniu okna.
- Kalkulator (tabele 2 i 9) przechowuje i serializuje `playerId` wraz z `playerName`; wybory na listach graczy działają po ID, co zabezpiecza scenariusz duplikatów nazw.

## 3. Obsługa modala instrukcji (`initInstructionModal`)
- Elementy DOM:
  - `#adminInstructionButton`
  - `#instructionModal`
  - `#instructionClose`
  - `#instructionStatus`
  - `#instructionContent`
- Zachowanie:
  - pierwsze otwarcie pobiera instrukcję przez `fetch`,
  - wynik jest cachowany w pamięci (`cachedText`),
  - kolejne otwarcia używają danych z cache,
  - zamykanie: przycisk `✕`, klik w tło, klawisz `Escape`.

## 4. Widoki i uprawnienia
- Tryb administratora włączany parametrem `?admin=1`.
- Klasy CSS:
  - `.admin-only` / `.user-only` sterowane przez `body.is-admin`.
- Header:
  - przycisk instrukcji widoczny zawsze.

## 5. Integracja danych
- Firebase inicjalizowany przez `window.firebaseConfig` (z `config/firebase-config.js`).
- Firestore używany m.in. dla: aktualności, regulaminu, notatek admina, czatu, graczy, gier, statystyk, konfiguracji dostępu graczy oraz modułów nekrologu i kalkulatorów.

### 5.1. Aktualny stan Firestore Rules
- Obecny zestaw rules ma reguły `allow read, write: if true;` dla kolekcji aplikacyjnych, więc odczyt i zapis są globalnie otwarte na poziomie reguł Firestore.
- Dotyczy to m.in. kolekcji:
  - `admin_security`,
  - `admin_messages`,
  - `app_settings`,
  - `admin_notes`,
  - `Tables` (+ subkolekcje `rows`, `confirmations`),
  - `UserGames` (+ subkolekcje `rows`, `confirmations`),
  - `players`, `chat_messages`, `admin_games_stats`,
  - `calculators` (+ `definitions`, `placeholders`, `sessions/variables`, `sessions/calculationFlags`, `sessions/tables/rows`, `sessions/snapshots`),
  - `Nekrolog_config`, `Nekrolog_snapshots`, `Nekrolog_refresh_jobs` (w tej ostatniej zapis ograniczony do dokumentu `latest`).

### 5.2. Aktualny przekrój schematu Firestore
- `admin_notes` przechowuje osobne dokumenty modułowe (`main`, `second`) z polami: `module`, `text`, `updatedAt`, `updatedBy`.
- `app_settings` zawiera m.in. dokument `player_access` i listę `players[]` z polami dostępowymi (`appEnabled`, `permissions`, `statsYearsAccess`, `pin`).
- `Tables` i `UserGames` mają dokumenty gry oraz subkolekcje:
  - `rows` (wiersze graczy z polami turniejowymi jak `entryFee`, `rebuy`, `payout`, `points`, `championship`),
  - `confirmations` (potwierdzenia obecności graczy).
- `calculators/{type}` zawiera stan kalkulatora oraz wersjonowane definicje, placeholdery i sesje robocze.
- `Nekrolog_*` to osobny zestaw kolekcji do konfiguracji, snapshotów i zleceń odświeżania.

## 6. Kalkulator Cash — logika Tabela7/Tabela8
- Funkcja `getCashMetrics` wylicza wartości dla widoku Cash na podstawie danych z `state.cash.table9Rows` i `state.cash.table8Row.rake`.
- W `Tabela7` kolumna **Suma** jest liczona bezpośrednio z danych wejściowych: `suma Buy-In z Tabela9 + suma Rebuy z Tabela9`.
- Wartość **Rake** w `Tabela8` jest obliczana jako: `(suma Buy-In + suma Rebuy) × (procent / 100)`.
- Wartość **Pot** i sumy po potrąceniu procentu pozostają liczone jako wartości po odjęciu rake (`1 - procent/100`).

- W `Szczegóły gry` (admin i gry użytkowników) rebuy per gracz może być przechowywany jako tablica `rebuys` (wartości składowe) oraz pole sumaryczne `rebuy`; przy każdej zmianie modal aktualizuje oba pola, a dalsze obliczenia korzystają z pola sumarycznego `rebuy`.


## Identyfikacja gracza w potwierdzeniach i statystykach
- Adminowe „Gry do potwierdzenia” budują listę uczestników z rekordów detali gry jako unikalne wpisy po kluczu `id:<playerId>` z fallbackiem `name:<playerName>`.
- Odczyt istniejących potwierdzeń także używa tego samego klucza identyfikacyjnego, co eliminuje rozjazdy między dokumentami potwierdzeń i listą graczy.
- Zapis potwierdzenia przez administratora ustawia `playerId` na rzeczywiste ID gracza z rekordu gry (jeżeli istnieje), zamiast przepisywać nazwę do pola `playerId`.
- Ranking statystyk, masowe ustawianie wag i eksport XLSX odczytują wpisy ręczne z mapy rocznej po `statsKey` (`id:<playerId>` z fallbackiem nazwy), a nie po samym `playerName`.

## 7. Aktualizacja techniczna układu kolumn (Main)
- W `Main/styles.css` doprecyzowano zakresy `min-width` i `max-width` dla wskazanych tabel:
  - `.players-table` (kolumny `Nazwa`, `PIN`),
  - listy gier w `#adminGamesTab`, `#adminUserGamesTab`, `#adminNextGameTab`, `#userGamesTab` (kolumny `Rodzaj gry`, `Nazwa`),
  - `.game-details-table` (kolumny `LP`, `Gracz`, `Wpisowe`, `Rebuy / Add-on`, `Wypłata`, `+/-`, `Punkty`),
  - `.confirmations-table` (kolumna `Nazwa`),
  - `.admin-games-players-stats-table`, `.admin-games-ranking-table`,
  - `.admin-calculator-cash-table7`, `.admin-calculator-cash-table8`, `.admin-calculator-cash-table9`, `.admin-calculator-cash-table10`,
  - `.admin-calculator-table1` … `.admin-calculator-table5`.
- W `Main/index.html` dodano element `<img class="header-icon" src="Pliki/Ikona.png" alt="Ikona">` pod nagłówkiem `TO NIE JEST nielegalne kasyno`.
- W `Main/styles.css` dodano styl `.header-icon` (`display: block; width: min(140px, 100%); height: auto;`).
