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
- `Main/index.html` ładuje krytyczne pliki (`pwa-config.js`, `styles.css`, `pwa-bootstrap.js`, `app.js`) z parametrem wersji (`?v=2026-04-02.1`) w celu twardego bustowania cache między release’ami.
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
- Service Worker używa wersjonowanego cache (`karty-main-pwa-2026-04-02.1`) i osobnych strategii cache dla HTML/JS/CSS/statycznych zasobów, aby ograniczyć ryzyko niespójnych wersji po deployu.

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
  - widok `Najbliższa gra` agreguje tylko `UserGames`;
  - widok `Gry do potwierdzenia` (admin i gracz) pobiera aktywne gry tylko z `UserGames`;
  - status admina w `Gry do potwierdzenia` raportuje już tylko źródło `UserGames`.

## Aktualizacja techniczna: RebuyX i mobilna klawiatura
- `Main/app.js`: w modalu rebuy kalkulatora każde pole `RebuyX` korzysta z `applyIntegerInputHints` (`type=text`, `inputmode=numeric`, `pattern=[0-9]*`) i sanitizacji cyfr.
