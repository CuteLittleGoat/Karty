# Main — dokumentacja techniczna

## 1. Struktura modułu
- `Main/index.html` — pełny układ widoku użytkownika i administratora oraz modal instrukcji.
- `Main/styles.css` — motyw, layout kart, tabele i style modali.
- `Main/app.js` — logika Firebase, zakładek, panelu admina, strefy gracza, kalkulatora i modali.
- `Main/pwa-config.js` — dynamiczne podpinanie manifestu PWA tylko dla wejścia użytkownika (bez `?admin=1`).
- `Main/pwa-bootstrap.js` — rejestracja Service Workera po załadowaniu aplikacji.
- `Main/manifest-any.webmanifest` — manifest PWA bez wymuszania orientacji; układ zależy od ustawień urządzenia.
- `Main/service-worker.js` — wersjonowany cache PWA (`APP_VERSION`) i strategie per typ zasobu: `network-first` dla HTML, `stale-while-revalidate` dla krytycznych JS/CSS, `cache-first` dla pozostałych statycznych plików.

## 2. Aktualny zakres funkcjonalny tej wersji
- Service Worker obsługuje komunikat `SKIP_WAITING`, dzięki czemu nowy worker może szybciej przejąć kontrolę po aktualizacji.
- `Main/index.html` ładuje krytyczne pliki (`pwa-config.js`, `styles.css`, `pwa-bootstrap.js`, `app.js`, `../config/firebase-config.js`) z parametrem wersji (`?v=2026-09-08.3`) w celu twardego bustowania cache między release’ami.
  - `config/firebase-config.js` nie występuje w `APP_SHELL_ASSETS`, ale jako `request.destination === "script"` trafia w Service Workerze do strategii `staleWhileRevalidate`. Bez parametru wersji zmiana samej konfiguracji (np. dodanie klucza App Check) bez podbicia `APP_VERSION` byłaby serwowana z cache o jeden release wstecz. Parametr `?v=` eliminuje ten przypadek niezależnie od `APP_VERSION`.
  - Moduł `Second` nie ma Service Workera, więc jego `index.html` ładuje ten sam plik bez parametru wersji — podlega wyłącznie zwykłemu cache HTTP.
- `Main/pwa-bootstrap.js` nasłuchuje `updatefound` i `controllerchange`; po instalacji nowego workera wymusza jego aktywację i wykonuje pojedynczy `window.location.reload()`, aby użytkownik pracował na spójnym zestawie assetów.
- W widoku użytkownika (`body` bez klasy `is-admin`) kontener `.page` ma szerokość `calc(100% - 2px)` oraz `padding-inline: 1px`, dzięki czemu zewnętrzna zielona ramka karty użytkownika jest odsunięta dokładnie o 1 px od lewej i prawej krawędzi ekranu.
- W tej samej konfiguracji ukryto wewnętrzną obwódkę pseudo-elementu `.user-card::before`, aby lewa i prawa krawędź pierwszej (zewnętrznej) ramki miały dokładnie 1 px.
- Widok użytkownika ma dedykowany przycisk `#userPanelRefresh` z etykietą „Odśwież” i statusem `#userPanelRefreshStatus`; akcja odświeża dane aktywnej zakładki bez `window.location.reload()`, dzięki czemu sesje PIN pozostają aktywne do resetu aplikacji.
- W sekcji `#confirmationsTab` usunięto lokalny przycisk `#confirmationsRefresh`; odświeżanie danych działa automatycznie po wejściu w zakładkę oraz ręcznie przez globalny przycisk `#userPanelRefresh` z nagłówka panelu użytkownika.
- Edytor notatek (`getSummaryNotesModalController`) zapamiętuje ostatnie zaznaczenie tekstu i odtwarza je po kliknięciu przycisku koloru, dzięki czemu kolorowanie działa poprawnie również na desktopie przy kolejnych zmianach koloru.
- Lista gier (zakładki **Gry admina** i **Gry użytkowników**) ma kolumnę `IlośćPotwierdzonych` z wartością `potwierdzeni/zapisani`, liczoną dynamicznie z wierszy gry i subkolekcji `confirmations`, oraz przycisk `Statusy` otwierający modal read-only z listą graczy i ich statusem potwierdzenia.
- Inicjalizacja zarządzania grami użytkowników (`initUserGamesManager`) posiada własny kontroler modala statusów potwierdzeń; usuwa to błąd referencji przy snapshotach i pozwala poprawnie działać przyciskom `Statusy` i `Szczegóły` bez czekania na dodanie/usunięcie gry.
- Snapshoty detali gier użytkowników odświeżają teraz również widok tabeli gier, więc licznik `IlośćPotwierdzonych` aktualizuje się natychmiast po wejściu do zakładki oraz po zmianach składu graczy.
- Handler przycisku odświeżania dla zakładki `Gry użytkowników` renderuje ponownie tabelę i podsumowania aktywnego roku.
- Widok **Najbliższa gra** wyświetla tylko gry otwarte z datą równą bieżącemu dniowi lub późniejszą; rekordy starsze niż dzisiejsza data są automatycznie ukrywane. Parser dat obsługuje formaty `YYYY-MM-DD`, `DD.MM.YYYY` i `DD-MM-YYYY`, a sortowanie jest rosnące po dacie (najbliższa gra na górze).
- Modale `Szczegóły gry` (`#gameDetailsModal`, `#userGameDetailsModal`, `#playerUserGameDetailsModal`) mają:
  - linię metadanych (`#gameDetailsMeta`, `#userGameDetailsMeta`, `#playerUserGameDetailsMeta`) przeniesioną do nagłówka modalu jako pierwszy wiersz zamiast osobnego tytułu „Szczegóły gry”,
  - nagłówek tekstowy `Rebuy/Add-on` (bez akcji zbiorczej),
  - przycisk w każdej komórce `Rebuy/Add-on`, który pokazuje sumę rebuy danego gracza i otwiera modal `Rebuy gracza` z przyciskami `Dodaj Rebuy`/`Usuń Rebuy` oraz zamknięciem przez ikonę `×` w prawym górnym rogu,
  - pola liczbowe (`entryFee`, `payout`, `points` oraz pola `RebuyN` w modalu rebuy) działają jako `type="text"` z hintami mobilnymi `inputMode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"`,
  - modal rebuy przechowuje osobno wartości i indeksy kolumn (`rebuyIndexes`, `rebuyNextIndex`), dzięki czemu kolumny `RebuyN` są numerowane niezależnie dla każdego gracza; po usunięciu ostatniej kolumny następne dodanie wraca do najbliższego wolnego numeru,
  - bez podświetlania potwierdzeń w samym modalu szczegółów; podświetlenie przeniesione do modala statusów z kolumny `IlośćPotwierdzonych`.
- Tworzenie i filtrowanie gier użytkownika zostało rozszerzone o powiązanie także po PIN-ie twórcy (`createdByPlayerPin`) oraz kompatybilność z istniejącym powiązaniem po `createdByPlayerId`.
- Po pozytywnej weryfikacji PIN dla sekcji „Gry użytkowników” emitowane jest zdarzenie `user-games-access-updated`, które natychmiast przelicza dostępne lata i renderuje dane bez potrzeby dodawania nowej gry.
- Dostęp do listy graczy jest inicjalizowany globalnie (`initSharedPlayerAccess`), a synchronizacja `synchronizeStatisticsAccessState()` jest wywoływana także po wejściu do Strefy Gracza; dzięki temu mapowanie PIN→gracz i uprawnienia statystyk odświeżają się od razu, a zakładka „Statystyki” pokazuje lata/dane bez ręcznego resetu strony.
- Wspólny snapshot dostępu graczy (`initSharedPlayerAccess`) emituje zdarzenie `player-access-updated`; `initUserTabs` nasłuchuje tego zdarzenia i ponownie synchronizuje dostęp sekcji Strefy Gracza dla `playerZonePlayerId` zapisanym w sesji. Dzięki temu po refreshu i ponownym dociągnięciu listy graczy nie dochodzi do trwałego wyzerowania sekcyjnych flag PIN.
- Potwierdzenia obecności i liczniki `potwierdzeni/zapisani` zostały przepięte na klucz logiczny gracza oparty o `playerId` (z fallbackiem do `playerName` dla starszych rekordów), co eliminuje konflikt przy duplikatach nazw.
- Wiersze gier (`rows`) oraz wybór gracza w modalach szczegółów zapisują teraz jednocześnie `playerId` i `playerName`, dzięki czemu prezentacja pozostaje czytelna, a logika opiera się o identyfikator unikatowy.
- Statystyki roczne i konfiguracja ręcznych wag (`admin_games_stats`) używają klucza gracza wyliczanego z `playerId` (fallback: `playerName`) oraz serializują `playerId` w rekordach manualnych; ten sam klucz jest używany zarówno w zakładce „Statystyki”, jak i w sekcji statystyk zakładki „Gry admina”.
- Przyciski zbiorczej edycji wag (`.admin-weight-bulk-button`) w sekcjach statystyk zakładek „Gry admina” i „Statystyki” mają stałą szerokość `8ch` (`width/min-width/max-width`), co stabilizuje szerokość kolumn wag i zapobiega ich nadmiernemu rozciąganiu.
- W `Main/styles.css` kontener `.admin-table-scroll` ma poziome przewijanie z widocznym stylowaniem suwaka (`overflow-x: auto`, dedykowane style paska), dzięki czemu szerokie tabele można przesuwać lewo/prawo bez nakładania treści.
- W widoku gracza (`#statisticsTab`) desktopowa siatka `.admin-games-layout` ma trzy kolumny: `20ch` (`Lata`), `minmax(0, 1fr)` (`Statystyki`) i `34ch` (`Ranking`), dzięki czemu ranking jest po prawej stronie tabel; w breakpointcie `max-width: 720px` układ przechodzi na jedną kolumnę i ranking ląduje pod tabelą statystyk.
- Dodatkowy breakpoint mobile-landscape (`@media (orientation: landscape) and (hover: none) and (pointer: coarse) and (max-height: 500px)`) wymusza układ jednokolumnowy także dla szerszych telefonów w poziomie, aby panele `Lata` i `Ranking` nie układały się obok treści.
- W modalach szczegółów gry (`.game-details-modal-card`) obszar treści (`.modal-body`) działa jako kontener flex (`flex: 1; min-height: 0`), a sekcja tabeli (`.admin-table-scroll`) przejmuje przewijanie (`overflow: auto`, `-webkit-overflow-scrolling: touch`), dzięki czemu na desktopie i mobile działa pionowe i poziome przewijanie długiej listy graczy.
- Kalkulator (tabele 2 i 9) przechowuje i serializuje `playerId` wraz z `playerName`; wybory na listach graczy działają po ID, co zabezpiecza scenariusz duplikatów nazw.
- Tabele `Gracze` (`.players-table`) i listy gier (`.admin-games-table`) mają podniesione minimalne szerokości i minima dla kluczowych kolumn, aby nagłówki, pola i przyciski nie nachodziły na siebie w desktopie; na mniejszych ekranach działają przez przewijanie poziome.
- Tabele list `Gry użytkowników` używają teraz tych samych bazowych klas szerokości co `Gry admina` (`.admin-games-table`) oraz dodatkowej klasy `.admin-user-games-table`, która poszerza kolumnę `Nazwa` (z przyciskiem `Notatki do gry`) do `440px` i podnosi minimalną szerokość całej tabeli do `1340px`, dzięki czemu pole `Rodzaj Gry` nie zwęża się nadmiernie w mobile.

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
  - czerwony przycisk `#customsEmergencyButton` został przeniesiony do prawego górnego paska (`.admin-toolbar`), dzięki czemu jest dostępny zarówno w widoku użytkownika, jak i administratora; otwiera modal `#customsEmergencyModal` z GIF-em `../Koza.gif`.

## 4.1. Modal „Kontrola celno-skarbowa”
- Elementy DOM:
  - `#customsEmergencyButton`
  - `#customsEmergencyModal`
  - `#customsEmergencyClose`
- Zachowanie:
  - przycisk jest widoczny w obu trybach (user/admin),
  - modal nie zawiera już nagłówka tekstowego „Kontrola celno-skarbowa”,
  - modal otwiera się lokalnie po kliknięciu (bez zapisu do Firebase),
  - zamykanie: `×`, kliknięcie w overlay, `Escape`.
- Style:
  - kontener przycisków nagłówka: `.admin-panel-header-actions`,
  - modal GIF: `.customs-emergency-modal-body`, `.customs-emergency-image`.

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


### 5.3. App Check (`activateAppCheckIfConfigured`)
- Wywoływana z `getFirebaseApp()` bezpośrednio po `firebase.initializeApp(...)`, przed `installFirestoreDeleteProtection(...)`.
- Wymaga skryptu `https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js` (dołączony w `index.html`).
- Dostawca wybierany jest na podstawie `window.firebaseConfig`:

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
- Bez klucza w konfiguracji funkcja kończy się natychmiast — App Check pozostaje nieaktywny i nie wpływa na działanie aplikacji.


#### Konfiguracja po stronie Firebase Console (stan wdrożenia)
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

## 6. Kalkulator Tournament — stabilność renderu Tabela2
- W `initAdminCalculator` funkcja `renderTable2` iteruje po `table2Rows` z sygnaturą callbacka `(row, index)`, a kolumna `LP` jest wyliczana jako `index + 1`; eliminuje to błąd runtime podczas renderu Tournament i gwarantuje dokończenie sekwencji `renderTable1..renderTable5`.

## 6. Kalkulator Cash — logika Tabela7/Tabela9
- Funkcja `renderCashTable9` buduje wiersze `state.cash.table9Rows` z selektorem gracza, polami `Buy-In` i `Wypłata` oraz przyciskiem otwierającym modal `Rebuy`.
- Pola `Buy-In` i `Wypłata` w `Tabela9` używają helpera `applyIntegerInputHints`, który ustawia `inputMode="numeric"`, `pattern="[0-9]*"` i `autocomplete="off"`; dzięki temu na urządzeniach mobilnych otwiera się klawiatura numeryczna bez zmiany mechaniki fokusu.
- Modal `Rebuy gracza` korzysta z tego samego helpera dla każdego pola `RebuyX`, więc mobilne wpisy rebuy są spójne z pozostałymi polami liczbowymi aplikacji.

## 7. Kalkulator Cash — logika Tabela7/Tabela8
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
- **Masowe ustawianie wag** działa w obu zakładkach. `ensureYearMapEntry` jest funkcją globalną (obok `getDefaultStatsManualFieldValue`) i korzysta z `WEIGHT_STATS_FIELDS`; używają jej `initAdminGames.applyBulkWeightValue` oraz handler przycisków w `initStatisticsView`. Handler w „Statystyki” waliduje wybrany rok i obecność graczy **przed** otwarciem `window.prompt`, a po zapisie ustawia komunikat o liczbie zaktualizowanych wierszy. Obie zakładki zapisują do `admin_games_stats/{rok}`, więc wagi są wspólne.
- **Nazwa gracza rozwiązywana jest na żywo.** Globalne `getLivePlayerNameById` i `resolveDisplayPlayerName` odczytują aktualną nazwę z `adminPlayersState.players` (uzupełnianego przez `initSharedPlayerAccess`) po `playerId`, z zapisanym `playerName` jako fallbackiem dla rekordów bez identyfikatora. Używają ich `renderSummaries` (obie tabele), `getPlayersStatistics` (obie kopie), `getUniquePlayersFromRows`, `initAdminConfirmations` i modal `Szczegóły` gracza. `statsKey` nadal wyliczany jest z **zapisanej** nazwy, więc historyczne grupowanie po `name:` pozostaje nienaruszone.
- Widoki przerysowują się po zmianie listy graczy: snapshoty `PLAYER_ACCESS_COLLECTION` w `initUserGamesManager` i `initAdminGames` wywołują dodatkowo `renderGamesTable`, `renderSummaries` (i `renderStatsTable` w `Gry admina`), a `initStatisticsView` nasłuchuje zdarzenia `player-access-updated`.
- **Edycja wag w zakładce „Statystyki” nie gubi fokusu.** Pola mają komplet metadanych (`data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`), a handler `input` zamiast pełnego `renderStats()` wywołuje punktowe `updateResultsAndRanking()`, które podmienia komórki `[data-result-player]` i przerysowuje ranking.
- **Podsumowania gier budowane są przez `textContent`.** Wiersze w `renderSummaries` (obie kopie) tworzone są przez `document.createElement`/`textContent` zamiast interpolacji do `innerHTML`, więc nazwy graczy ze znakami `<`, `>` czy `&` nie rozbijają układu tabeli.
- **Identyfikator dokumentu potwierdzenia.** `initAdminConfirmations` używa `player.playerId`, następnie identyfikatora istniejącego dokumentu, a w ostateczności `buildSafeConfirmationDocId`, które zamienia znaki niedozwolone w identyfikatorach Firestore (`/ \\ . # $ [ ]`) na `_` i odrzuca nazwy puste oraz `.`/`..`.

## Rework layoutu tabel (Main)

Zmiany obejmują wyłącznie warstwę prezentacji tabel (`Main/styles.css`):

- ` .admin-table-scroll`
  - `overflow` zmienione na `auto` (obsługa osi X i Y),
  - dodany limit wysokości `max-height: min(72vh, 760px)`,
  - zachowane stylowanie pasków przewijania.
- `.admin-data-table`
  - `width: max-content`,
  - `min-width: 100%`,
  - dzięki temu tabela jest pełna w szerokich kontenerach, ale może też rozszerzać się wg zawartości i przewijać poziomo.
- Usunięto wcześniejsze, rozproszone i częściowo niespójne ograniczenia szerokości (`min-width`) z poprzedniego układu dla tabel gier, graczy i rankingu.
- Dodano pełny zestaw jawnych szerokości `width/min-width` dla kolumn we wszystkich głównych tabelach:
- Dla rankingu (w `#adminGamesTab`, `#adminStatisticsTab` i `#statisticsTab`) ustawiono tabelę na `width: 100%` + `table-layout: fixed`, aby trzy kolumny zawsze mieściły się w panelu bez poziomego przewijania.
- Wiersze rankingu używają standardowej wysokości panelu (`height: var(--admin-games-panel-item-height)`), a kolumna `Gracz` ma stałą szerokość `13ch` i skracanie nazw przez `text-overflow: ellipsis` (`white-space: nowrap`, `overflow: hidden`), dzięki czemu tabela mieści się bez poziomego przewijania.
- Nagłówek kolumny `Gracz` w panelu `Ranking` jest wyrównany do lewej w `Gry admina`, `Statystyki` i w widoku użytkownika (`Strefa Gracza` → `Statystyki`), aby odpowiadał wyrównaniu danych w tej kolumnie.
  - gracze,
  - gry administratora i gry użytkowników,
  - statystyki i ranking,
  - gry do potwierdzenia,
  - szczegóły gry (modale),
  - kalkulator (Tournament i Cash).

Efekt techniczny:
- stabilny układ kolumn niezależnie od długości danych,
- lepsza przewidywalność renderowania przycisków i pól,
- pełna obsługa przepełnienia danych przez scroll lokalny bez zmiany szerokości paneli bocznych.

## Modal Rebuy gracza – układ nagłówka
- Nagłówek modala `Rebuy gracza` używa klasy `modal-header-close-right`.
- Klasa ustawia przycisk zamknięcia `X` absolutnie w prawym górnym rogu:
  - `position: relative` na kontenerze nagłówka,
  - `position: absolute; top: 0; right: 0` na przycisku.

## Aktualny layout Strefy Gracza (Main)
- W trybie użytkownika kontener `.player-zone-layout` ma rozszerzoną szerokość (`width: calc(100% + 46px)`) oraz ujemny margines poziomy (`margin-inline: -23px`).
- Dzięki temu wewnętrzne ciemno-zielone ramki (`.admin-games-sidebar` i `.admin-games-content`) są wyrównane do 1 px od lewej i prawej krawędzi zewnętrznej zielonej karty.
- W breakpointcie mobile (`@media (max-width: 720px)`) przyciski sekcji Strefy Gracza (`.player-zone-button`) mają zwiększony rozmiar pisma do `14px` i `letter-spacing: 0.12em`.
- W orientacji poziomej na urządzeniach dotykowych z niską wysokością viewportu (`max-height: 500px`) layouty `.admin-games-layout` (`#adminGamesTab`, `#adminStatisticsTab`, `#statisticsTab`) przechodzą na jedną kolumnę niezależnie od szerokości, co eliminuje układ paneli „obok siebie” na mobile.


## PWA (Main-only)
- `index.html` ładuje `pwa-config.js`, który publikuje manifest PWA (`manifest-any.webmanifest`) tylko wtedy, gdy adres nie zawiera `?admin=1`.
- Skrypt `pwa-bootstrap.js` rejestruje `service-worker.js`.
- Uruchomienie z konfiguracji PWA (`?pwa=1&view=user`) wymusza tryb użytkownika: `getAdminMode()` zawsze zwraca `false` dla takiego startu.
- Wejście administracyjne (`?admin=1`) nie publikuje manifestu, więc przeglądarka traktuje je jako zwykłą stronę/skróty URL zamiast instalowalnej aplikacji user-only.
- Konfiguracja PWA nie wymusza orientacji ekranu.
- Tytuł dokumentu (`<title>`) w `index.html` ustawiono na `Poker - rozgrywki`.
- Manifest PWA ustawia nazwę instalowanej aplikacji na `Poker - rozgrywki` (`short_name`: `Poker`).
- `start_url` w manifeście jest relatywny (`./index.html?...`), a `scope` ustawiony na `./`, co zapobiega błędom 404 dla hostingu pod prefiksem repozytorium.
- Service Worker używa wersjonowanego cache (`karty-main-pwa-2026-09-08.3`) i osobnych strategii cache dla HTML/JS/CSS/statycznych zasobów, aby ograniczyć ryzyko niespójnych wersji po deployu.

- W `initAdminCalculator` każdy wiersz rebuy (`table2Rows` i `table9Rows`) przechowuje parę `rebuys[]` + `rebuyIndexes[]`; dodawanie rebuy nadaje globalny numer `max+1` dla całego aktywnego trybu, a usunięcie rebuy wykonuje globalną kompaktację indeksów bez luk.
- Tabela5 buduje kolumny `RebuyX` i mapowanie wartości po posortowanych `rebuyIndexes`, zamiast po samym `flatMap` kolejności graczy, dzięki czemu semantyka numeru `RebuyX` pozostaje spójna po dodawaniu/usuwaniu kolumn u różnych graczy.

## Aktualizacja techniczna: Kalkulator (Organizacja + Żetony)
- `Main/index.html`: w sidebarze kalkulatora dodano tryby `organization`, `chips-cash1`, `chips-cash2`, `chips-tournament1`, `chips-tournament2`.
- `Main/app.js` (`initAdminCalculator`):
  - rozszerzono listę trybów o `ALL_CALCULATOR_MODES`;
  - dodano stany początkowe: `createInitialOrganizationState`, `createInitialChipsState`;
  - dodano normalizację i serializację Firestore dla nowych trybów w `normalizeCalculatorModeState` i `serializeCalculatorModeState`;
  - dodano renderery: `renderOrganizationTables`, `renderChipsTables`;
  - dodano synchronizację wierszy `TABELAC` do `TABELAA` (`ensureChipsRows`);
  - w `Organizacja -> TABELA2` przycisk `Dodaj` jest renderowany pod tabelą (`.admin-table-footer-actions`), a przycisk `Usuń` pozostaje w kolumnie akcji każdego wiersza;
  - w `Żetony -> TABELAA` usunięto wiersz sumy z ciała tabeli; podsumowanie `Łącznie Stack` jest renderowane jako osobny tekst pod tabelą (`.admin-table-info`);
  - w tabelach `TABELA2` (Organizacja) i `TABELAA` (Żetony) przyciski `Usuń` w wierszach są wyrównywane do prawej (`.admin-table-actions--row-end`);
  - puste sloty kalkulatora `#adminCalculatorTable1..#adminCalculatorTable5` są automatycznie ukrywane w UI przez regułę CSS `.admin-calculator-table-wrap:empty { display: none; }`; dotyczy to wyłącznie pustych wrapperów (bez nagłówka i tabeli), więc np. puste pasy pod `TABELA2` i `TABELAC` nie są już renderowane wizualnie.
  - wszystkie nowe pola edycyjne mają metadane fokusu (`data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`) i korzystają z `applyIntegerInputHints`.
- `renderOrganizationTables` (`Main/app.js`): w `TABELA1` drugi wiersz pozostawia kolumny `ORGANIZACJA` i `POT` jako puste komórki `<td>` (bez readonly inputów), dzięki czemu tylko `KALKULATOR` ma pole edycyjne w tym wierszu.
- Obliczenia pól wynikowych w nowych tabelach są zaokrąglane w górę (`Math.ceil` przez `formatNumber`).
- Persist danych: nowe tryby zapisują się do `calculators/{docId}` analogicznie do istniejących trybów.

## Aktualizacja techniczna: separacja Gry admina od potwierdzeń i Najbliższej gry
- `Main/app.js`:
  - widok `Najbliższa gra` agreguje tylko `UserGames` (`nextGamesState.adminGames` pozostaje pustą tablicą);
  - widok `Gry do potwierdzenia` (admin i gracz) pobiera aktywne gry tylko z `UserGames`;
  - status admina w `Gry do potwierdzenia` raportuje już tylko źródło `UserGames`.
- Konsekwencja: **żadna ścieżka UI nie zapisuje dokumentów do `Tables/{gameId}/confirmations`** poza importem gier użytkowników, który przenosi tam potwierdzenia zebrane w `UserGames`. Dlatego kolumna `IlośćPotwierdzonych` i przycisk `Statusy` w zakładce `Gry admina` renderują się **tylko dla gier z polem `importedFromUserGameId`**; dla gier zakładanych ręcznie komórka pozostaje pusta.

## Zasięg flagi `isClosed`
- Pole `isClosed` jest odczytywane w: `getActiveGamesForConfirmations` (zakładki `Gry do potwierdzenia`), `getCombinedOpenGames` (widok `Najbliższa gra`) oraz `getGamesForStatistics` w `initAdminGames` i `initStatisticsView`.
- `getGamesForStatistics` zwraca `getGamesForSelectedYear().filter((game) => Boolean(game.isClosed))` i jest jedynym źródłem gier dla `getPlayersStatistics`. Dzięki temu filtr obejmuje **wyłącznie agregaty**: tabelę statystyk, ranking oraz pozycje `Gry zaliczone do statystyk` i `Łączna pula`.
- Filtr **nie obejmuje** tabeli gier, panelu `Lata` ani podsumowań pod tabelą — inaczej gra znikałaby z listy w momencie odznaczenia checkboxa i nie dałoby się jej ponownie zaznaczyć.
- W zakładce `Gry użytkowników` zaznaczenie `isClosed` dodatkowo wyzwala eksport gry do kolekcji gier admina (patrz sekcja o imporcie).

## Aktualizacja techniczna: RebuyX i mobilna klawiatura
- `Main/app.js`: w modalu rebuy kalkulatora każde pole `RebuyX` korzysta z `applyIntegerInputHints` (`type=text`, `inputmode=numeric`, `pattern=[0-9]*`) i sanitizacji cyfr.


## Uodpornienie startu aplikacji (`runInitStep`)
- Oba moduły mają globalną funkcję `runInitStep(name, initializer)`, która opakowuje pojedynczy krok inicjalizacji w `try/catch` i loguje błąd przez `console.error` z nazwą sekcji.
- `bootstrap()` w `Main/app.js` przechodzi po tablicy par `[nazwa, funkcja]` i uruchamia każdy krok przez `runInitStep`; `resolveAdminMode()` też jest w `try/catch` z domyślnym `false`.
- `bootstrap()` w `Second/app.js` używa tego samego mechanizmu dla modali oraz dla `setupAdminView` / `setupUserOnlyView`.
- Skutek: wyjątek w jednej funkcji inicjalizującej nie przerywa pozostałych. Wcześniej `ReferenceError` w `initInstructionModal` blokował wykonanie `initCustomsEmergencyModal()` (kolejne wywołanie w ciągu), przez co przyciski `Instrukcja` i `Przycisnąć w razie kontroli celno-skarbowej` nie dostawały obsługi kliknięcia.

## Pole `seatCount` (Liczba miejsc)
- Pole tekstowe `seatCount` istnieje wyłącznie w dokumentach kolekcji gier użytkowników; nowe gry dostają `seatCount: ""`.
- Globalne `getGameSeatCountValue` sanityzuje wartość do cyfr (bez znaku minus), a `getGameSeatCount` zwraca liczbę dodatnią albo `null` (brak limitu) — puste pole i `0` traktowane są jako brak limitu, więc istniejące gry nie wymagają migracji.
- Kolumna renderowana jest w `initUserGamesManager`, czyli jednocześnie w widoku gracza i administratora; tabela `Gry admina` jej nie ma.

## Kolejność potwierdzeń (`confirmedAt`)
- Dokument potwierdzenia ma pole `confirmedAt` ustawiane `serverTimestamp()` **tylko przy przejściu z niepotwierdzonego na potwierdzony** i kasowane przez `FieldValue.delete()` przy anulowaniu. `updatedAt` pozostaje czasem ostatniej zmiany.
- Stan lokalny (`isConfirmedLocally`) pilnuje, by ponowne kliknięcie `Potwierdź` nie nadpisało istniejącego znacznika.
- `getConfirmationStatusesForRows(rows, confirmations)` zwraca listę wpisów `{ identifier, playerId, playerName, confirmed, confirmationOrder }`: potwierdzeni na początku, posortowani rosnąco po `getConfirmationTimeValue` (`confirmedAt`, fallback `updatedAt`, brak obu → `Infinity`, remis → kolejność w składzie), z numeracją od 1; niepotwierdzeni na końcu z `confirmationOrder === null`.
- Funkcję wykorzystują: modal `Status potwierdzeń` (kolumna `Nr`), tabela w adminowej zakładce `Gry do potwierdzenia` (kolumna `Nr`) oraz sekcja `Kolejność potwierdzeń` w modalu `#confirmationsDetailsModal` widoku gracza.
- W modalu gracza `renderConfirmationsOrder` łączy kolejność z `getGameSeatCount`: pierwsze N potwierdzeń dostaje status `W grze`, kolejne `Lista rezerwowa`, a granicę oznacza klasa `.confirmations-reserve-start`. Bez ustawionego limitu pokazywana jest sama numeracja.

## Import gier użytkowników do gier admina
- Znacznik `importedFromUserGameId` na kopii wskazuje grę źródłową; `exportedToAdminGameId` i `exportedAt` na dokumencie źródłowym oznaczają, że gra została już przekazana.
- `importUserGameToAdminGames({ firebaseApp, db, userGamesCollectionName, adminGamesCollectionName, gameDetailsCollectionName, gameId })`:
  - odszukuje istniejącą kopię przez `findImportedAdminGameRef` (zapytanie `where(importedFromUserGameId, "==", gameId).limit(1)`),
  - przy braku kopii zakłada nowy dokument z `isClosed: false`, `postGameNotes: ""`, `createdAt` i `importedAt`,
  - przy istniejącej kopii wykonuje `update` **wyłącznie** pól z `MIRRORED_IMPORT_GAME_FIELDS` (`gameType`, `gameDate`, `name`, `seatCount`, `preGameNotes`, `createdByPlayerId`, `createdByPlayerName`, `createdByPlayerPin`) oraz `importRefreshedAt`; `isClosed` i `postGameNotes` kopii nigdy nie są nadpisywane,
  - zastępuje podkolekcje `rows` i `confirmations` zawartością źródła, zachowując identyfikatory dokumentów,
  - zapisy idą przez `commitBatchedOperations` w paczkach po 400 operacji,
  - `pendingUserGameImports` blokuje równoległe wywołania dla tej samej gry.
- Wyzwalacze:
  - zaznaczenie `CzyZamknięta` w `initUserGamesManager` (działa tak samo dla gracza i administratora, bo oba widoki korzystają z tego samego renderu),
  - `runPendingUserGameImports` w `initAdminGames` przy starcie i przy odświeżeniu zakładki — pobiera zamknięte gry użytkowników **bez** `exportedToAdminGameId`, dzięki czemu kopia skasowana ręcznie przez administratora nie wraca sama, a ponowne zaznaczenie `CzyZamknięta` przez gracza tworzy ją od nowa,
  - przycisk `Aktualizuj z gry gracza` przy grze zaimportowanej.
- Podkolekcje mają w ścieżce `/`, więc `isCollectionProtectedAgainstFullDeletion` zwraca dla nich `false` i mechanizm blokady usunięcia ostatniego dokumentu nie koliduje z podmianą zawartości.

## Eksport XLSX
- `Main/index.html` ładuje `https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js` (fork SheetJS Community Edition ze wsparciem stylów komórek; globalna nazwa `XLSX` bez zmian).
- Handler eksportu ustawia `worksheet["!cols"]` na podstawie najdłuższej wartości w kolumnie (min. 8, maks. 40 znaków), nadaje każdej komórce `s.alignment` (`horizontal: center`, `vertical: center`) i `s.font.bold` dla wiersza nagłówka, a komórkom liczbowym `z = "# ##0"` (separator tysięcy).
- Wagi i wartości procentowe pozostają komórkami tekstowymi — biblioteka zapisuje `ignoredErrors`, więc Excel nie pokazuje ostrzeżenia „liczba zapisana jako tekst”.

## Zakładka „Kopia zapasowa” (`initAdminBackup`)
- Zakładka `#adminBackupTab` istnieje wyłącznie w module Main, ale obejmuje dane **obu** modułów. Zawiera przyciski `#adminBackupExport` i `#adminBackupImport`, ukryte `#adminBackupFileInput`, status `#adminBackupStatus`, informacje o ostatnim użyciu (`#adminBackupExportInfo`, `#adminBackupImportInfo`) oraz pole `#adminBackupInstructions` (`readonly`) wypełniane stałą `BACKUP_INSTRUCTIONS_TEXT`.

### Zakres kopii
- `BACKUP_COLLECTION_SCHEMA` to deklaratywne drzewo kolekcji odwzorowujące zestaw reguł Firestore projektu: kolekcje modułu Main, `Nekrolog_*` oraz `second_*`, wraz z podkolekcjami (`rows`, `confirmations`, a dla kalkulatorów `definitions`, `placeholders`, `sessions` z `variables`, `calculationFlags`, `tables/rows` i `snapshots`).
- Biblioteka kliencka Firestore nie potrafi wylistować kolekcji ani podkolekcji, dlatego drzewo musi być utrzymywane ręcznie. **Nowa kolekcja niedopisana do `BACKUP_COLLECTION_SCHEMA` nie trafi do kopii.** Po wykonaniu kopii status podaje liczbę dokumentów, co pozwala zauważyć brak.
- `collectBackupDocuments` przechodzi drzewo rekurencyjnie i zapisuje dokumenty jako płaską listę `{ path, data }`, gdzie `path` jest pełną ścieżką Firestore. Dzięki temu przywracanie sprowadza się do `db.doc(path).set(data)` i obsługuje dowolne zagnieżdżenie.

### Format pliku
```
{
  "format": "karty-backup",
  "version": 1,
  "createdAt": "<ISO 8601>",
  "documentCount": <liczba>,
  "documents": [ { "path": "Tables/<id>/rows/<id>", "data": { ... } } ]
}
```
- Nazwa pliku: `Karty_Backup_[RRRR-MM-DD]_[GG-MM-SS].json` (`buildBackupFileName`); w godzinie użyto myślników, bo Windows nie dopuszcza dwukropka w nazwie pliku.

### Konwersja typów
- `encodeBackupValue` rekurencyjnie zamienia `Timestamp` na `{ __type: "timestamp", seconds, nanoseconds }`, a `decodeBackupValue` odtwarza z tego instancję `Timestamp`. Bez tego `createdAt` wróciłby jako zwykły obiekt i przestałoby działać sortowanie `orderBy("createdAt")` oraz `createdAt.toMillis()` w `compareByGameDateAsc` — **po cichu, bez komunikatu błędu**.
- `GeoPoint` i `DocumentReference` są zapisywane w postaci opisowej i odnotowywane w ostrzeżeniach; aplikacja ich nie używa.

### Przywracanie
- Tryb **uzupełniający**: `set` na każdym dokumencie z pliku, bez kasowania czegokolwiek. Dokumenty powstałe po zrobieniu kopii zostają nietknięte.
- Zabezpieczenia: walidacja `format`/`documents`, podgląd (data pliku, liczba dokumentów), potwierdzenie przez wpisanie słowa `PRZYWROC` oraz **automatyczne pobranie kopii bezpieczeństwa obecnego stanu przed pierwszym zapisem**.
- `RESTORE_SKIPPED_COLLECTIONS` zawiera `admin_security` — zapis do tej kolekcji jest zablokowany regułami, więc przywracanie ją pomija i raportuje liczbę pominiętych dokumentów. Hasło administratora odtwarza się ręcznie z pliku w Firebase Console.
- Odfiltrowywane są też wpisy o nieparzystej liczbie segmentów ścieżki (czyli nie będące dokumentami).
- Zapisy idą przez `commitBatchedOperations` (paczki po 400 operacji).

### Daty ostatniego użycia
- `app_settings/backup_state` przechowuje `lastBackupAt` i `lastRestoreAt` (`serverTimestamp`), odczytywane przez `onSnapshot`, więc informacja jest wspólna dla wszystkich urządzeń. Formatowanie przez `formatImportRefreshedAt`.

### Reguły Firestore
- Obowiązujący zestaw reguł w Firebase Console zawiera `match /admin_security/{docId}` z `allow read: if true; allow write: if false;`. Aplikacja tę kolekcję wyłącznie odczytuje (`Main/app.js` i `Second/app.js` wykonują na niej tylko `.get()`), więc blokada zapisu nie wymaga żadnych zmian w kodzie.

### Ograniczenia
- Rozwiązanie jest świadomie klienckie: wbudowany eksport i import Firestore oraz automatyczne kopie wymagają płatnego planu Blaze, a projekt działa na planie darmowym Spark.
- Kopię należy wykonywać z komputera — w PWA zainstalowanej na telefonie pobieranie plików bywa zawodne.
