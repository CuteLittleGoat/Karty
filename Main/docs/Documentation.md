# Karty — pełna dokumentacja techniczna

## 1. Cel aplikacji i architektura
Aplikacja **Karty** to frontend typu SPA (Single Page Application) oparty o:
- statyczny HTML (`Main/index.html`),
- jeden główny plik logiki (`Main/app.js`),
- jeden arkusz stylów (`Main/styles.css`),
- konfigurację połączenia z Firebase (`config/firebase-config.js`).

Całość działa po stronie przeglądarki i komunikuje się bezpośrednio z Firestore (brak osobnego backendu HTTP). Główne obszary funkcjonalne to:
- panel administratora (zarządzanie danymi, graczami, statystykami, kalkulatorem),
- strefa gracza (widoki ograniczone PIN-em i uprawnieniami),
- system notatek, potwierdzeń, wiadomości i czatu.

## 2. Struktura plików i odpowiedzialności
- `Main/index.html` — kompletny układ interfejsu (zakładki admina i gracza, tabele, sekcje, wszystkie modale i ich przyciski/ID). 
- `Main/app.js` — pełna logika: inicjalizacja Firebase, subskrypcje `onSnapshot`, renderowanie tabel, walidacje, obliczenia, synchronizacja zakładek, obsługa modali i sesji PIN.
- `Main/styles.css` — design system (zmienne CSS, fonty, kolory, responsywność, style paneli/tabel/modali/statusów), w tym style edytora notatek `.summary-notes-editor` i paska kolorów `.summary-notes-color-actions`.
- `config/firebase-config.js` — konfiguracja projektu Firebase + nazwy kolekcji używanych przez aplikację.

## 3. UI — komplet funkcjonalności i elementów sterujących

### 3.1 Panel administratora (zakładki)
Panel admina zawiera zakładki:
1. **Aktualności** (`adminNewsTab`) — edycja wiadomości globalnej (`adminMessageInput`, `adminMessageSend`); pole `adminMessageInput` ma wysokość 25 linii (`rows="25"`).
2. **Czat** (`adminChatTab`) — moderacja czatu (`adminChatCleanup`, `adminChatList`).
3. **Regulamin** (`adminRulesTab`) — edycja treści regulaminu (`adminRulesInput`, `adminRulesSave`); pole `adminRulesInput` ma wysokość 50 linii (`rows="50"`).
4. **Gracze** (`adminPlayersTab`) — dodawanie/edycja/usuwanie graczy i PIN-ów (`adminPlayersBody`, `adminAddPlayer`).
5. **Gry admina** (`adminGamesTab`) — CRUD gier, szczegóły gier, notatki, statystyki, ranking.
6. **Statystyki** (`adminStatisticsTab`) — zestawienia roczne, wagi, eksport.
7. **Gry użytkowników** (`adminUserGamesTab`) — administracyjne zarządzanie grami tworzonymi przez graczy.
8. **Najbliższa gra** (`adminNextGameTab`) — podgląd najbliższych gier i statusów potwierdzeń.
9. **Gry do potwierdzenia** (`adminConfirmationsTab`) — przegląd i ręczna aktualizacja potwierdzeń.
10. **Kalkulator** (`adminCalculatorTab`) — moduł obliczeń z układem 5 tabel dla trybu `tournament` oraz układem tabel `Tabela7–Tabela10` dla trybu `cash`.

Dodatkowo globalny przycisk odświeżania panelu: `adminPanelRefresh`.

### 3.2 Strefa gracza
Widok użytkownika ma 3 zakładki główne: `updatesTab` (Aktualności), `rulesTab` (Regulamin) i `playerZoneTab` (Strefa Gracza). W `updatesTab` pole `latestMessageOutput` ma wysokość 25 linii (`rows="25"`), a w `rulesTab` pole `rulesOutput` ma 50 linii (`rows="50"`).

W `playerZoneTab` działa jedna bramka PIN (`playerZonePinInput`, `playerZonePinSubmit`) i po poprawnej autoryzacji renderowany jest layout dwukolumnowy. W tej samej sesji przeglądarki użytkownik nie wpisuje już PIN-u ponownie dla sekcji:
- lewy panel `Sekcja` (`playerZoneSectionsList`) z przyciskami:
  - Najbliższa Gra (`nextGameTab`),
  - Czat (`chatTab`),
  - Gry do Potwierdzenia (`confirmationsTab`),
  - Gry Użytkowników (`userGamesTab`),
  - Statystyki (`statsTab`),
- prawa kolumna z aktywną sekcją (`.player-zone-panel`).

Uprawnienia działają dwupoziomowo:
1. `playerZoneTab` — dostęp do wejścia do Strefy Gracza,
2. osobne uprawnienia sekcyjne (`nextGameTab`, `chatTab`, `confirmationsTab`, `userGamesTab`, `statsTab`) — widoczność poszczególnych przycisków i sekcji.

### 3.3 Modale i okna dialogowe
W aplikacji występują m.in. poniższe modale:
- `summaryNotesModal` — notatki do podsumowania gry (zapis/reset do szablonu) z paskiem kolorowania tekstu (złoty/zielony/czerwony/biały) umieszczonym pod tytułem modala i nad edytorem.
- `instructionModal` — podgląd instrukcji użytkownika ładowanej z dokumentacji.
- `playerPermissionsModal` — wybór zakładek dostępnych dla gracza.
- `playerStatsYearsModal` — wybór lat statystyk dostępnych dla gracza.
- `userGameDetailsModal` — szczegóły gry użytkownika (widok admin).
- `playerUserGameDetailsModal` — szczegóły gry użytkownika (widok gracza).
- `gameDetailsModal` — szczegóły gry admina.
- `confirmationsDetailsModal` — szczegóły gry w kontekście potwierdzeń.
- modal edycji rebuy w kalkulatorze (otwierany i zamykany programowo w `initAdminCalculator`).

### 3.4 Kluczowe przyciski i akcje UI
- Przyciski `Dodaj` w zakładkach gier — tworzą nowe dokumenty gry z domyślnymi polami.
- `Szczegóły` — otwiera modal z tabelą graczy (`rows`) i natychmiastową edycją danych.
- We wszystkich selectach `Gracz` (szczegóły gier oraz kalkulator) lista pokazuje tylko dostępnych graczy; już wybrani w innych wierszach są filtrowani podczas renderu.
- `Usuń` przy wierszu gracza — usuwa rekord z subkolekcji `rows`.
- `Eksportuj` (statystyki) — eksport widoków statystycznych do pliku.
- `adminChatCleanup` — kasowanie wiadomości czatu starszych niż 30 dni.
- Przyciski zbiorcze wag (`Waga1…Waga6`) — szybka aktualizacja wag/kolumn.

## 4. Logika aplikacji (`Main/app.js`) — szczegółowy opis

### 4.1 Inicjalizacja i konfiguracja
- `getAvailablePlayerNamesForRow(rows, currentRowId, playerOptions, currentPlayerName)` filtruje listę wyboru graczy do wartości dostępnych dla aktualnie edytowanego wiersza.
- `bootstrap()` uruchamia całą aplikację i inicjuje wszystkie moduły.
- `getFirebaseApp()` pobiera konfigurację z `window.firebaseConfig`.
- Aplikacja korzysta z dynamicznych nazw kolekcji (`tablesCollection`, `gamesCollection`, `gameDetailsCollection`, `userGamesCollection`) z configu.

### 4.2 Kontrola dostępu PIN i sesja
- PIN ma długość 5 (`PIN_LENGTH = 5`).
- Dane autoryzacji są przechowywane w `sessionStorage`; reset przeglądarki/aplikacji czyści sesję i wymusza ponowne wpisanie PIN-u.
- Funkcje `sanitizePin`, `isPinValid`, `generateRandomPin` obsługują walidację i format.
- Po poprawnym PIN-ie dla `playerZoneTab` funkcja `syncPlayerZoneSectionAccess` ustawia stan autoryzacji sekcji (`nextGameTab`, `chatTab`, `confirmationsTab`, `userGamesTab`, `statsTab`) zgodnie z uprawnieniami gracza i zapisuje `playerId` do odpowiednich kluczy sesji.
- W tej samej synchronizacji wykonywane są funkcje aktualizacji widoczności każdej sekcji (`updatePinVisibility`, `updateChatVisibility`, `updateConfirmationsVisibility`, `updateUserGamesVisibility`, `updateStatisticsVisibility`), dzięki czemu przejście do „Gry do potwierdzenia” nie wyświetla wtórnej bramki PIN po autoryzacji Strefy Gracza.
- Zmiana sekcji w obrębie Strefy Gracza nie resetuje już autoryzacji; ponowna weryfikacja jest wymagana dopiero po utracie sesji (`sessionStorage`).

### 4.3 Zarządzanie graczami
- Gracze są trzymani w dokumencie `main_app_settings/player_access` jako tablica `players`.
- Każdy gracz ma:
  - `id`, `name`, `pin`,
  - `appEnabled` (aktywny/nieaktywny),
  - `permissions` (dostęp do zakładek),
  - `statsYearsAccess` (lata statystyk).
- Moduł admina pozwala:
  - dodać gracza,
  - edytować nazwę/PIN,
  - otworzyć modal uprawnień,
  - otworzyć modal lat statystyk,
  - zapisać zmiany do Firestore.

### 4.4 Gry (admin i user)
Moduł gier działa w dwóch kolekcjach (`main_tables`, `main_user_games`) z tym samym mechanizmem:
- lista gier filtrowana rokiem,
- edycja pól gry in-place (typ, data, nazwa, status zamknięcia),
- modal szczegółów gry z tabelą graczy,
- subkolekcje:
  - `rows` — dane graczy i rozliczenia,
  - `confirmations` — potwierdzenia obecności.

Obsługiwane akcje:
- dodanie gry,
- usunięcie gry z pełnym cleanupem subkolekcji (`deleteGameCompletely`),
- dodanie/usuwanie wiersza gracza,
- aktualizacja danych gracza (gracz, wpisowe, rebuy, wypłata, punkty, mistrzostwo),
- notatki przed grą i po grze.

Dodatkowa logika własności dla `main_user_games` (strefa gracza):
- po weryfikacji PIN `getUserGamesVerifiedPlayer()` wyznacza aktywnego właściciela,
- lista gier gracza jest filtrowana po `createdByPlayerId === verifiedPlayer.id`,
- lata i podsumowania są liczone wyłącznie z gier widocznych dla właściciela,
- edycja gry/szczegółów/notatek jest dozwolona tylko, gdy `canWrite() && createdByPlayerId === verifiedPlayer.id`,
- panel administratora `adminUserGamesTab` pozostaje bez ograniczenia właścicielskiego (pełny wgląd i edycja wszystkich wpisów).
- Dokumenty techniczne/szablony (np. w `main_user_games`) są filtrowane po flagach (`isTemplate`, `technicalDocument`, `hiddenFromUi`), polach typu/kind/source zawierających `template`/`technical`/`system` oraz po identyfikatorach (`template*`, `_template*`, `_system*`), dlatego nie są pokazywane w widoku użytkownika.
- Usuwanie rekordów z UI ma zabezpieczenie: aplikacja blokuje skasowanie ostatniego dokumentu z kolekcji gier i z podkolekcji `rows`, wyświetlając komunikat statusu zamiast wykonywania `delete`.

### 4.5 Potwierdzenia obecności
- Widoki potwierdzeń łączą dane z gier admina i gier użytkowników.
- Dla każdej gry można ustawić potwierdzenie przez gracza (`confirmed = true/false`).
- Aplikacja synchronizuje stan „czy wszyscy potwierdzili” na podstawie listy graczy z `rows` i wpisów `confirmations`.

### 4.6 Czat
- Kolekcja: `main_chat_messages`.
- Każda wiadomość zawiera autora, treść, timestamp i datę wygaśnięcia (`expireAt`).
- Retencja: 30 dni (`CHAT_RETENTION_DAYS = 30`).
- Admin:
  - usuwa pojedyncze wiadomości,
  - uruchamia cleanup wiadomości starszych niż 30 dni.

### 4.7 Aktualności i regulamin
- Aktualności: dokument `main_admin_messages/admin_messages`.
- Regulamin: dokument `main_app_settings/rules`.
- Oba moduły mają live update przez `onSnapshot`.
- Dla operacji administracyjnych (odświeżanie potwierdzeń, zapis graczy, zapis regulaminu) komunikaty błędów rozróżniają co najmniej przypadki `permission-denied` i `unavailable`, aby łatwiej diagnozować problem konfiguracji/reguł Firestore.

### 4.8 Statystyki i ranking
- Konfiguracja kolumn: `STATS_COLUMN_CONFIG`.
- Wagi: `weight1..weight6`.
- Wynik rankingowy:

```text
result = championshipCount * weight1
       + participationPercent * weight2
       + pointsSum * weight3
       + plusMinusSum * weight4
       + payoutSum * weight5
       + depositsSum * weight6
```

- Ranking sortowany malejąco po `resultValue`, przy remisie alfabetycznie po `playerName`.
- Widoczność kolumn dla użytkownika per rok jest zapisywana w `main_admin_games_stats/<rok>.visibleColumns`.

### 4.9 Kalkulator (Tournament / Cash)
Kalkulator zapisuje dane w `main_calculators/tournament` oraz `main_calculators/cash`.

#### Tournament
- Logika Tournament (Tabela1–Tabela5) pozostała bez zmian.
- Rebuy dla Tournament korzysta z `table2Rows[].rebuys`.

#### Cash
- Dodano osobny model danych `cash`:
  - `table8Row.rake` — procent wykorzystywany w obliczeniach (kolumna `%`),
  - `table9Rows[]` — wiersze graczy (`playerName`, `buyIn`, `payout`, `rebuys`).
- Normalizacja i serializacja danych do Firestore są rozdzielone dla trybu `cash` i `tournament`.
- Modal rebuy działa dla obu trybów; w trybie Cash operuje na `table9Rows[].rebuys`.
- Prezentacja wartości obliczalnych w Kalkulatorze przechodzi przez `formatNumber()`, które wykonuje `Math.round` i usuwa część dziesiętną w UI.

Dodane obliczenia Cash:
- **Tabela7**:
  - `buyInAfterPercent = suma(Buy-In z Tabela9) * (1 - rake/100)`
  - `rebuyAfterPercent = suma(Rebuy z Tabela9) * (1 - rake/100)`
  - `sum = buyInAfterPercent + rebuyAfterPercent`
- **Tabela8**:
  - kolumna `%` to to samo pole danych `table8Row.rake` (format z `%` po blur),
  - kolumna `Rake` jest tylko do odczytu i wylicza: `(suma Buy-In z Tabela9 + suma Rebuy z Tabela9) * (1 - rake/100)`,
  - kolumna `Pot` jest tylko do odczytu i prezentuje tę samą wartość co `Rake`.
- **Tabela9**:
  - unikalny wybór gracza per tabela,
  - dropdown `Gracz` renderuje wyłącznie dostępne osoby (gracze zajęci w innych wierszach są ukrywani),
  - przycisk w nagłówku kolumny `Buy-In` uruchamia `window.prompt` i zbiorczo ustawia Buy-In dla wszystkich wierszy,
  - ręczna edycja pojedynczych pól `Buy-In` i `Wypłata` nadal jest dostępna po akcji zbiorczej,
  - `Rebuy` z modala,
  - `+/- = Wypłata - (Buy-In + suma Rebuy)`.
- **Tabela10**:
  - dane wejściowe z Tabela9,
  - `Lp` po sortowaniu,
  - `% Puli = Wypłata / Suma(Tabela7) * 100` (prezentacja zaokrąglona do pełnej liczby),
  - sortowanie malejące po `+/-`, potem alfabetycznie po graczu.

Obsługa fokusu:
- Wszystkie nowe pola wejściowe i selecty w Cash mają komplet `data-*` (`data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`) dla poprawnego przywracania fokusu po re-renderze.


## 5. Obliczenia finansowe i statystyczne

### 5.1 Na poziomie pojedynczej gry
- **Wpłata gracza**: `entryFee + rebuy`.
- **Bilans gracza (+/-)**: `payout - (entryFee + rebuy)`.
- **Pula gry**: suma wpłat wszystkich graczy z `rows`.
- W modalu `Szczegóły gry` (Gry admina i Gry użytkowników) pasek meta budowany jest jako: `Nazwa | Rodzaj gry | Data | Pula | Ilość graczy` (gdzie `Ilość graczy = rows.length`).

### 5.2 Na poziomie agregatów
- Zliczane są m.in.:
  - liczba spotkań,
  - suma wpłat,
  - suma wypłat,
  - suma punktów,
  - suma bilansu,
  - procent udziału,
  - procent rozegranych gier,
  - liczba mistrzostw.
- Agregaty są podstawą tabel statystyk i rankingu.

## 6. Warstwa stylów (`Main/styles.css`)

### 6.1 Fonty
Ładowane z Google Fonts:
- Cinzel,
- Cormorant Garamond,
- Inter,
- Rajdhani.

### 6.2 System kolorów
Zmienne CSS definiują m.in.:
- tła (`--bg`, `--bg2`),
- tekst (`--ink`, `--muted`),
- akcenty (`--gold`, `--neon`, `--ruby`),
- obramowania i cienie (`--border`, `--shadow`, `--glow-*`).

Styl wizualny to ciemny motyw „noir + gold + neon”, z kartami, delikatnym gradientem i obwódkami.
- `.game-details-modal-card` zwiększa szerokość modali szczegółów gry do `min(1320px, 100%)`, dzięki czemu na pełnym ekranie PC modal wykorzystuje więcej przestrzeni poziomej.
- `.player-zone-button` używa responsywnego `clamp()` dla `font-size` i `letter-spacing`, aby długie etykiety (np. „Gry do Potwierdzenia”) mieściły się w obrębie przycisku.

### 6.3 Layout i komponenty
- kontener strony (`.page`) ma szerokość `min(1720px, 100%)`, dzięki czemu na desktopie aplikacja wykorzystuje prawie całe okno,
- wewnętrzny odstęp kontenera pozostaje `24px` na boki (`padding: 40px 24px 80px`),
- siatka główna (`.grid`) oparta o `auto-fit` + `minmax`,
- wspólna klasa karty (`.card`),
- w layoutach wielokolumnowych (np. `.admin-games-layout`) szerokości paneli bocznych są stałe (`220px` i `260px`), a rozszerza się kolumna centralna (`minmax(0, 1fr)`),
- spójny styl tabel (`.admin-data-table`),
- dedykowane klasy dla modali (`.modal-overlay`, `.modal-card`),
- klasy statusów i akcji (`.status-text`, `.primary`, `.secondary`, `.danger`).

## 7. Firebase / Firestore — pełna struktura danych

## 7.1 Konfiguracja projektu
Aplikacja odczytuje konfigurację z `window.firebaseConfig`:
- `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`,
- nadpisywalne nazwy kolekcji Main: `tablesCollection`, `gamesCollection`, `gameDetailsCollection`, `userGamesCollection`, `playerAccessCollection`, `rulesCollection`, `adminMessagesCollection`, `chatCollection`, `adminGamesStatsCollection`, `calculatorCollection`,
- przygotowane klucze kolekcji dla modułu Second: `secondTablesCollection`, `secondGamesCollection`, `secondGameDetailsCollection`, `secondUserGamesCollection`, `secondPlayerAccessCollection`, `secondRulesCollection`, `secondAdminMessagesCollection`, `secondChatCollection`, `secondAdminGamesStatsCollection`, `secondCalculatorCollection`.

## 7.2 Kolekcje i dokumenty

### A) `main_app_settings`
1. `player_access`
- `players: Array<Player>`
- `updatedAt`

`Player`:
- `id: string`
- `name: string`
- `pin: string (5 cyfr)`
- `appEnabled: boolean`
- `permissions: string[]` (klucze zakładek)
- `statsYearsAccess: string[]` (np. `"2026"`)

2. `rules`
- `text: string`
- `createdAt`
- `updatedAt`
- `source`

3. (opcjonalnie) `next_game`
- ustawienia związane z bramką PIN najbliższej gry.

### B) `main_admin_messages`
- dokument `admin_messages`:
  - `message: string`
  - `createdAt`
  - `source`

### C) `main_chat_messages`
- wiele dokumentów wiadomości:
  - `text`, `authorName`, `authorId`,
  - `createdAt`, `expireAt`,
  - `source`.

### D) `main_tables` (gry admina)
- dokument gry:
  - `gameType`, `gameDate`, `name`,
  - `isClosed`,
  - `preGameNotes`, `postGameNotes` (sanityzowany HTML notatek; obsługa kolorów tekstu),
  - `createdAt`.
- subkolekcja `rows`:
  - `playerName`, `entryFee`, `rebuy`, `payout`, `points`, `championship`, `createdAt`.
- subkolekcja `confirmations`:
  - `playerId`, `playerName`, `confirmed`, `updatedBy`, `updatedAt`.

### E) `main_user_games` (gry użytkowników)
Jak `main_tables`, plus:
- `createdByPlayerId`,
- `createdByPlayerName`.

Pola `createdByPlayerId` / `createdByPlayerName` są używane przez logikę UI do separacji danych między graczami (PIN -> właściciel gry), bez zmiany struktury dokumentów Firestore.

### F) `main_admin_games_stats`
- dokumenty roczne (ID = rok, np. `2026`):
  - `rows` — ręczne dane wag i korekt graczy,
  - `visibleColumns` — lista kolumn widocznych w widoku gracza.

### G) `main_calculators`
- `tournament` i `cash`:
  - `table1Row`, `table2Rows`, `table3Row`, `table5SplitPercents`, `eliminatedOrder`, `updatedAt`.

### H) Kolekcje wyłączone z użycia w tym projekcie
Nie modyfikować pod kątem tej aplikacji:
- `Nekrolog_refresh_jobs`,
- `Nekrolog_config`,
- `Nekrolog_snapshots`.

## 8. Skrypt odtworzenia struktury Firebase (Node.js)

Poniższy skrypt tworzy kompletny szkielet danych wymagany przez aplikację.

```js
// scripts/rebuild-firestore-structure.js
const admin = require("firebase-admin");
const serviceAccount = require("../test.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp;

async function ensureBaseDocuments() {
  await db.collection("main_app_settings").doc("player_access").set({
    players: [],
    updatedAt: timestamp()
  }, { merge: true });

  await db.collection("main_app_settings").doc("rules").set({
    text: "",
    source: "bootstrap-script",
    createdAt: timestamp(),
    updatedAt: timestamp()
  }, { merge: true });

  await db.collection("admin_messages").doc("admin_messages").set({
    message: "",
    source: "bootstrap-script",
    createdAt: timestamp()
  }, { merge: true });

  const year = String(new Date().getFullYear());
  await db.collection("main_admin_games_stats").doc(year).set({
    rows: [],
    visibleColumns: []
  }, { merge: true });

  for (const mode of ["tournament", "cash"]) {
    await db.collection("main_calculators").doc(mode).set({
      table1Row: { buyIn: "", rebuy: "" },
      table2Rows: [{ id: `table2-${Date.now()}-0`, playerName: "", eliminated: false, rebuys: [] }],
      table3Row: { percent: "" },
      table5SplitPercents: [],
      eliminatedOrder: [],
      updatedAt: timestamp()
    }, { merge: true });
  }
}

async function ensureGameWithSubcollections(collectionName, gameNamePrefix) {
  const gameRef = await db.collection(collectionName).add({
    gameType: "Cashout",
    gameDate: new Date().toISOString().slice(0, 10),
    name: `${gameNamePrefix} 1`,
    isClosed: false,
    preGameNotes: "",
    postGameNotes: "",
    createdAt: timestamp(),
    ...(collectionName === "main_user_games"
      ? { createdByPlayerId: "system", createdByPlayerName: "System" }
      : {})
  });

  await gameRef.collection("rows").add({
    playerName: "",
    entryFee: "",
    rebuy: "",
    payout: "0",
    points: "",
    championship: false,
    createdAt: timestamp()
  });

  await gameRef.collection("confirmations").doc("sample-player").set({
    playerId: "sample-player",
    playerName: "Sample",
    confirmed: false,
    updatedBy: "bootstrap-script",
    updatedAt: timestamp()
  }, { merge: true });
}

async function main() {
  await ensureBaseDocuments();
  await ensureGameWithSubcollections("main_tables", "Gra admina");
  await ensureGameWithSubcollections("main_user_games", "Gra użytkownika");
  console.log("Firestore structure rebuilt successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### Uruchomienie skryptu
1. Utwórz plik `scripts/rebuild-firestore-structure.js`.
2. Zainstaluj zależność: `npm i firebase-admin`.
3. Upewnij się, że plik `test.json` jest poprawnym kluczem service account dla docelowego projektu.
4. Uruchom: `node scripts/rebuild-firestore-structure.js`.

## 9. Zasady odtwarzania aplikacji przez innego dewelopera
Aby odtworzyć aplikację 1:1, należy:
1. Odtworzyć strukturę HTML z `Main/index.html` (te same identyfikatory i sekcje).
2. Odtworzyć logikę modułową z `Main/app.js` (inicjalizacja, subskrypcje, obliczenia i modale).
3. Odtworzyć style i zmienne z `Main/styles.css`.
4. Skonfigurować `window.firebaseConfig` zgodnie z `config/firebase-config.js`.
5. Wykonać skrypt bootstrapujący Firestore, aby zapewnić wszystkie kolekcje/dokumenty.

Ta dokumentacja opisuje **aktualny stan aplikacji** i nie zawiera historii zmian.

### 5.4 Minimalne szerokości kolumn (implementacja)
- Minimalne szerokości kolumn zostały spięte w CSS jednostką `ch` (ilość znaków), głównie przez selektory `nth-child` dla tabel statycznych i klas tabel renderowanych dynamicznie.
- Statyczne tabele z przypisanymi szerokościami:
  - `.players-table` (Nazwa: `30ch`, PIN: `5ch`),
  - `.game-details-table` i `.confirmations-details-table` (LP/Gracz/Wpisowe/Rebuy/Wypłata/+/-/Punkty wg `Kolumny.md`),
  - `.admin-games-players-stats-table` i `.admin-games-ranking-table`.
- Tabele kalkulatora renderowane w JS dostały dedykowane klasy, aby przypisać szerokości zgodne z dokumentem:
  - Tournament: `.admin-calculator-table1` … `.admin-calculator-table5`,
  - Cash: `.admin-calculator-cash-table7` … `.admin-calculator-cash-table10`.
- W `Tabela5` dynamiczne kolumny rebuy są oznaczane atrybutem `data-rebuy-column="true"` (nagłówki i komórki), co utrzymuje minimalnie `8ch` niezależnie od ich liczby.
- Kolumna `Mod` w `Tabela5` ma minimalną szerokość `8ch` (zwiększoną, aby mieścić do 8 znaków).
- Modal rebuy zachowuje stałe `8ch` na kolumnę przez istniejące reguły `#adminCalculatorRebuyTable th/td`.


## 10. Moduł Second — aktualny szkielet techniczny
- `Second/index.html` zawiera strukturę odwzorowującą zakładki Main dla: `Aktualności`, `Czat`, `Regulamin`, `Gracze` oraz dodatkową sekcję `Turniej`.
- `Second/app.js` odpowiada za montowanie trybu admin/user oraz przełączanie zakładek przez klasę `is-active`.
- W zakładce `Turniej` (admin i user) zastosowano układ bocznego panelu przycisków (`Instrukcja`, `Odśwież`) i centralny tekst `Strona w budowie`.
- Tabele `Gracze` w `Second` używają klasy `players-table`, dzięki czemu minimalne szerokości kolumn odpowiadają konfiguracji z Main.
- Wersja jest celowo offline: brak wywołań Firebase, brak zapisu/odczytu danych backendowych; przyciski pełnią rolę szkieletu UI.
