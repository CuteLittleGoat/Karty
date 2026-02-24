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
- `Main/styles.css` — design system (zmienne CSS, fonty, kolory, responsywność, style paneli/tabel/modali/statusów).
- `config/firebase-config.js` — konfiguracja projektu Firebase + nazwy kolekcji używanych przez aplikację.

## 3. UI — komplet funkcjonalności i elementów sterujących

### 3.1 Panel administratora (zakładki)
Panel admina zawiera zakładki:
1. **Aktualności** (`adminNewsTab`) — edycja wiadomości globalnej (`adminMessageInput`, `adminMessageSend`).
2. **Czat** (`adminChatTab`) — moderacja czatu (`adminChatCleanup`, `adminChatList`).
3. **Regulamin** (`adminRulesTab`) — edycja treści regulaminu (`adminRulesInput`, `adminRulesSave`).
4. **Plan wieczoru** (`adminEveningPlanTab`) — edycja harmonogramu z kolorowaniem zaznaczeń (`adminEveningPlanInput`, `planColorGold|Green|Red|White`, `adminEveningPlanSave`).
5. **Gracze** (`adminPlayersTab`) — dodawanie/edycja/usuwanie graczy i PIN-ów (`adminPlayersBody`, `adminAddPlayer`).
6. **Gry admina** (`adminGamesTab`) — CRUD gier, szczegóły gier, notatki, statystyki, ranking.
7. **Statystyki** (`adminStatisticsTab`) — zestawienia roczne, wagi, eksport.
8. **Gry użytkowników** (`adminUserGamesTab`) — administracyjne zarządzanie grami tworzonymi przez graczy.
9. **Najbliższa gra** (`adminNextGameTab`) — podgląd najbliższych gier i statusów potwierdzeń.
10. **Gry do potwierdzenia** (`adminConfirmationsTab`) — przegląd i ręczna aktualizacja potwierdzeń.
11. **Kalkulator** (`adminCalculatorTab`) — moduł obliczeń `tournament/cash` oparty o 5 tabel.

Dodatkowo globalny przycisk odświeżania panelu: `adminPanelRefresh`.

### 3.2 Strefa gracza
Strefa gracza obejmuje zakładki:
- Najbliższa gra,
- Czat,
- Gry do potwierdzenia,
- Gry użytkowników,
- Statystyki,
- Plan wieczoru,
- oraz sekcje informacyjne (Aktualności/Regulamin).

Dostęp do części zakładek jest kontrolowany przez:
- PIN 5-cyfrowy,
- uprawnienia przypisane graczowi (`permissions`),
- listę lat statystyk dostępnych dla konkretnego gracza (`statsYearsAccess`).

### 3.3 Modale i okna dialogowe
W aplikacji występują m.in. poniższe modale:
- `summaryNotesModal` — notatki do podsumowania gry (zapis/reset do szablonu).
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
- `Usuń` przy wierszu gracza — usuwa rekord z subkolekcji `rows`.
- `Eksportuj` (statystyki) — eksport widoków statystycznych do pliku.
- `adminChatCleanup` — kasowanie wiadomości czatu starszych niż 30 dni.
- Przyciski zbiorcze wag (`Waga1…Waga6`) — szybka aktualizacja wag/kolumn.

## 4. Logika aplikacji (`Main/app.js`) — szczegółowy opis

### 4.1 Inicjalizacja i konfiguracja
- `bootstrap()` uruchamia całą aplikację i inicjuje wszystkie moduły.
- `getFirebaseApp()` pobiera konfigurację z `window.firebaseConfig`.
- Aplikacja korzysta z dynamicznych nazw kolekcji (`tablesCollection`, `gamesCollection`, `gameDetailsCollection`, `userGamesCollection`) z configu.

### 4.2 Kontrola dostępu PIN i sesja
- PIN ma długość 5 (`PIN_LENGTH = 5`).
- Dane autoryzacji są przechowywane w `sessionStorage` osobno dla różnych sekcji (np. czat, gry, statystyki).
- Funkcje `sanitizePin`, `isPinValid`, `generateRandomPin` obsługują walidację i format.
- Dla każdej sekcji istnieją gettery/settery stanu PIN + zapamiętanie zweryfikowanego gracza.
- Nowa sekcja `Plan wieczoru` używa niezależnych kluczy sesji (`EVENING_PLAN_PIN_STORAGE_KEY`, `EVENING_PLAN_PLAYER_ID_STORAGE_KEY`) i waliduje uprawnienie `eveningPlanTab`.

### 4.3 Zarządzanie graczami
- Gracze są trzymani w dokumencie `app_settings/player_access` jako tablica `players`.
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
Moduł gier działa w dwóch kolekcjach (`Tables`, `UserGames`) z tym samym mechanizmem:
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

Dodatkowa logika własności dla `UserGames` (strefa gracza):
- po weryfikacji PIN `getUserGamesVerifiedPlayer()` wyznacza aktywnego właściciela,
- lista gier gracza jest filtrowana po `createdByPlayerId === verifiedPlayer.id`,
- lata i podsumowania są liczone wyłącznie z gier widocznych dla właściciela,
- edycja gry/szczegółów/notatek jest dozwolona tylko, gdy `canWrite() && createdByPlayerId === verifiedPlayer.id`,
- panel administratora `adminUserGamesTab` pozostaje bez ograniczenia właścicielskiego (pełny wgląd i edycja wszystkich wpisów).

### 4.5 Potwierdzenia obecności
- Widoki potwierdzeń łączą dane z gier admina i gier użytkowników.
- Dla każdej gry można ustawić potwierdzenie przez gracza (`confirmed = true/false`).
- Aplikacja synchronizuje stan „czy wszyscy potwierdzili” na podstawie listy graczy z `rows` i wpisów `confirmations`.

### 4.6 Czat
- Kolekcja: `chat_messages`.
- Każda wiadomość zawiera autora, treść, timestamp i datę wygaśnięcia (`expireAt`).
- Retencja: 30 dni (`CHAT_RETENTION_DAYS = 30`).
- Admin:
  - usuwa pojedyncze wiadomości,
  - uruchamia cleanup wiadomości starszych niż 30 dni.

### 4.7 Aktualności, regulamin i plan wieczoru
- Aktualności: dokument `admin_messages/admin_messages`.
- Regulamin: dokument `app_settings/rules`.
- Plan wieczoru: dokument `app_settings/evening_plan` z polem `html` (sanityzowany HTML: tekst + `span` z dozwolonymi kolorami + `br`).
- W adminie kolorowanie działa przez zaznaczenie zakresu i kliknięcie przycisku koloru; aplikacja opakowuje zakres w `span` z kolorem (`--gold`, `--neon`, `--ruby2`, `--ink`), następnie sanitizuje i zapisuje.
- Przyciski kolorów w pasku `admin-plan-color-actions` mają dedykowane style tła zgodne z nazwą (`Złoty`/`Zielony`/`Czerwony`/`Biały`), aby wizualnie wskazywać wybierany kolor tekstu jeszcze przed kliknięciem.
- Widok gracza renderuje `innerHTML` po sanitizacji i jest tylko do odczytu.
- Wszystkie trzy moduły mają live update przez `onSnapshot`.

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
- Widoczność kolumn dla użytkownika per rok jest zapisywana w `admin_games_stats/<rok>.visibleColumns`.

### 4.9 Kalkulator (Tournament / Cash)
Kalkulator przechowuje osobny stan dla dwóch trybów (`calculators/tournament`, `calculators/cash`).
Model obejmuje:
- `table1Row` (buy-in, rebuy),
- `table2Rows` (gracze, eliminacje, lista rebuy per gracz),
- `table3Row` (procent),
- `table5SplitPercents` (podział puli),
- `table5Mods` (ręczna korekta doliczana do sumy wiersza w Tabela5),
- `eliminatedOrder` (kolejność odpadnięć).

W kalkulatorze:
- liczby w polach kalkulatora są sanityzowane do cyfr, a `table5Mods` dopuszcza także znak minus na początku (wartości ujemne),
- stan jest debouncowany i automatycznie zapisywany do Firestore,
- możliwa jest edycja rebuy przez dedykowany modal.
- modal rebuy startuje bez kolumn; kolumny powstają dopiero po kliknięciu `Dodaj Rebuy`,
- nazwy kolumn rebuy są numerowane globalnie względem wszystkich graczy w kolejności wierszy Tabela2 (`Rebuy1..n`),
- Tabela5 renderuje wartości rebuy kolumnowo: każda kolumna `RebuyN` wyświetla wartość wyłącznie w jednym wierszu (`LP`) wyliczanym przez cykle 4, 5, 6, 7... pozycji (np. `Rebuy1..4` -> wiersze 1..4, `Rebuy5..9` -> wiersze 1..5, `Rebuy10..15` -> wiersze 1..6),
- każda wartość `RebuyN` prezentowana w Tabela5 jest najpierw redukowana o procent z `table3Row.percent` (`rebuyPoRake = rebuy - rebuy*percent/100`),
- kolumna `Mod` w Tabela5 jest edytowalna, przechowywana w `table5Mods`, akceptuje liczby dodatnie i ujemne i jest dodawana do `Suma` według wzoru `Suma = Kwota + suma przypisanych rebuy(po rake) + Mod`,
- Tabela5 nie zawiera kolumny `Ranking`; układ to `LP`, `Podział puli`, `Kwota`, `Rebuy1..n`, `Mod`, `Suma`,
- usunięcie ostatniego rebuy u gracza powoduje renumerację kolejnych kolumn rebuy u następnych graczy.
- Tabela4 uzupełnia kolumnę `Gracz` wyłącznie dla graczy z aktywnym checkboxem `Eliminated` w Tabela2; kolejność opiera się na `eliminatedOrder` i jest mapowana od końca tabeli (pierwszy wyeliminowany trafia na ostatnie `LP`, kolejni na miejsca wyżej),
- odznaczenie `Eliminated` usuwa gracza z Tabela4 i powoduje automatyczne „zsunięcie” pozostałych wyeliminowanych na niższe miejsca, zgodnie z ich kolejnością eliminacji,
- kolumna `Wygrana` w Tabela4 działa niezależnie od nazw graczy i zawsze kopiuje `Suma` z tego samego `LP` w Tabela5.

## 5. Obliczenia finansowe i statystyczne

### 5.1 Na poziomie pojedynczej gry
- **Wpłata gracza**: `entryFee + rebuy`.
- **Bilans gracza (+/-)**: `payout - (entryFee + rebuy)`.
- **Pula gry**: suma wpłat wszystkich graczy z `rows`.

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

### 6.3 Layout i komponenty
- siatka główna (`.grid`) oparta o `auto-fit` + `minmax`,
- wspólna klasa karty (`.card`),
- spójny styl tabel (`.admin-data-table`),
- dedykowane klasy dla modali (`.modal-overlay`, `.modal-card`),
- klasy statusów i akcji (`.status-text`, `.primary`, `.secondary`, `.danger`).

## 7. Firebase / Firestore — pełna struktura danych

## 7.1 Konfiguracja projektu
Aplikacja odczytuje konfigurację z `window.firebaseConfig`:
- `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`,
- nadpisywalne nazwy kolekcji: `tablesCollection`, `gamesCollection`, `gameDetailsCollection`, `userGamesCollection`.

## 7.2 Kolekcje i dokumenty

### A) `app_settings`
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

3. `evening_plan`
- `html: string` (sanityzowany HTML planu wieczoru)
- `updatedAt`
- `source`

4. (opcjonalnie) `next_game`
- ustawienia związane z bramką PIN najbliższej gry.

### B) `admin_messages`
- dokument `admin_messages`:
  - `message: string`
  - `createdAt`
  - `source`

### C) `chat_messages`
- wiele dokumentów wiadomości:
  - `text`, `authorName`, `authorId`,
  - `createdAt`, `expireAt`,
  - `source`.

### D) `Tables` (gry admina)
- dokument gry:
  - `gameType`, `gameDate`, `name`,
  - `isClosed`,
  - `preGameNotes`, `postGameNotes`,
  - `createdAt`.
- subkolekcja `rows`:
  - `playerName`, `entryFee`, `rebuy`, `payout`, `points`, `championship`, `createdAt`.
- subkolekcja `confirmations`:
  - `playerId`, `playerName`, `confirmed`, `updatedBy`, `updatedAt`.

### E) `UserGames` (gry użytkowników)
Jak `Tables`, plus:
- `createdByPlayerId`,
- `createdByPlayerName`.

Pola `createdByPlayerId` / `createdByPlayerName` są używane przez logikę UI do separacji danych między graczami (PIN -> właściciel gry), bez zmiany struktury dokumentów Firestore.

### F) `admin_games_stats`
- dokumenty roczne (ID = rok, np. `2026`):
  - `rows` — ręczne dane wag i korekt graczy,
  - `visibleColumns` — lista kolumn widocznych w widoku gracza.

### G) `calculators`
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
  await db.collection("app_settings").doc("player_access").set({
    players: [],
    updatedAt: timestamp()
  }, { merge: true });

  await db.collection("app_settings").doc("rules").set({
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
  await db.collection("admin_games_stats").doc(year).set({
    rows: [],
    visibleColumns: []
  }, { merge: true });

  for (const mode of ["tournament", "cash"]) {
    await db.collection("calculators").doc(mode).set({
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
    ...(collectionName === "UserGames"
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
  await ensureGameWithSubcollections("Tables", "Gra admina");
  await ensureGameWithSubcollections("UserGames", "Gra użytkownika");
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
