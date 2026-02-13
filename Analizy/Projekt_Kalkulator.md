# Analiza wdrożenia Firebase dla zakładek `KalkulatorTournament` i `KalkulatorCash`

## Prompt użytkownika (kontekst)
> Przeczytaj plik: Analizy/Analiza_KalkulatorTournament_Cash_Firebase.md  
> Przygotowuję się do wprowadzenie funkcjonalności.  
> Już mam ogólny zarys jakie kolumny będą potrzebne.  
> KalkulatorTournament:  
> 
> Tabela1  
> Kolumny:  
> Suma - pole obliczalne  
> Buy-In - pole do wpisania przez admina  
> Rebuy - pole do wpisania przez admina  
> Liczba Rebuy - Pole obliczalne  
> 
> Tabela2  
> Kolumny:  
> LP - autouzupełnianie  
> Gracz - wybór z listy graczy z zakładki "Gracze"  
> Buy-In - kolumna automatycznie uzupełniana wartością z kolumny Buy-In z Tabela1  
> Rebuy - kolumna automatycznie uzupełniana wartością z kolumny Rebuy z Tabela1, przy czym nie będzie zawsze w każdym wierszu. Może też być wielokrotnością wartości Rebuy - wymagania zostaną napisane później  
> Eliminated - Checkbox  
> 
> Tabela3  
> Kolumny:  
> Rake - pole do wpisania zmiennej do obliczeń  
> Wpisowe - pole obliczalne z danych z Tabela2  
> Rebuy - pole obliczalne z danych z Tabela2  
> Pot - pole obliczalne  
> 
> Tabela4  
> Kolumny:  
> LP - autouzupełnianie  
> Miejsce - ranking graczy z Tabela2  
> Ranking - ilość punktów zdobytych przez gracza, pole obliczalne  
> 
> Tabela5  
> LP - autouzupełnianie  
> %wygranej - pole do wpisania zmiennej do obliczeń  
> Gracz - nazwa gracza, pole uzupełniane automatycznie  
> Kwota - pole obliczalne  
> Ranking - dane jak w Tabela4  
> Rebuy1  
> Rebuy2  
> .  
> .  
> Rebuy10  
> 
> Zasady działania kolumn Rebuy1 do Rebuy10 będą opisane potem. Ich ilość też nie jest stała i może będzie zmienna.  
> 
> Na obecną chwilę identyczny układ jest planowany dla KalkulatorTournament i KalkulatorCash, ale to też może ulec zmianie.  
> 
> Przeanalizuj zawartość pliku Analizy/Analiza_KalkulatorTournament_Cash_Firebase.md a następnie utwórz nowy o nazwie "KalkulatorFirebase.md".  
> Zawrzyj w nim pełną analizę wdrożenia powyższych zakładek. Przygotuj mi nowe drzewko konfiguracji Firebase. Zaproponuj jakie kolekcje, dokumenty i pola będą potrzebne. Możesz przygotować również kilka placeholder jakbybyły potem potrzebne.  
> Przygotuj nową treść do wpisania w Rules w Firebase.

---

## 1) Założenia architektoniczne po analizie

1. `KalkulatorTournament` i `KalkulatorCash` powinny działać niezależnie (oddzielne sesje, oddzielne dane wejściowe i wyniki).
2. Struktura ma być wspólna technicznie (jedna gałąź danych `calculators/{type}`), aby ograniczyć duplikację kodu i uprościć późniejsze zmiany.
3. Definicje tabel i kolumn muszą być wersjonowane (`definitions`), bo logika (np. Rebuy1..RebuyN) będzie się zmieniać.
4. Dane operacyjne zapisywane w `sessions`, tak aby każda rozgrywka / wyliczenie miało osobną historię.
5. Wartości obliczalne zapisujemy jawnie (nie tylko liczymy w UI), aby możliwy był audyt i odtworzenie wyników.
6. Wybór gracza ma używać referencji do danych istniejących (`playerId`) + snapshot nazwy (`playerNameSnapshot`) na moment zapisu.

---

## 2) Docelowe drzewko Firestore (pełna propozycja)

```text
(default)
├─ Tables
├─ UserGames
├─ admin_games_stats
├─ admin_messages
├─ app_settings
├─ chat_messages
├─ players
└─ calculators                                 // NOWE
   ├─ tournament                               // DocumentID stałe
   │  ├─ name: "KalkulatorTournament"
   │  ├─ type: "tournament"
   │  ├─ isActive: true
   │  ├─ createdAt: timestamp
   │  ├─ updatedAt: timestamp
   │  ├─ placeholders                          // map pod przyszłe rozszerzenia
   │  │  ├─ payoutModel: "PENDING_SPEC"
   │  │  ├─ rebuyColumnsMode: "dynamic"
   │  │  └─ rankingFormula: "PENDING_SPEC"
   │  ├─ definitions                           // subcollection
   │  │  └─ v1                                 // aktywna wersja układu
   │  │     ├─ version: 1
   │  │     ├─ status: "active"
   │  │     ├─ appliesTo: ["tournament"]
   │  │     ├─ tables: [ ... ]                 // szczegóły niżej
   │  │     ├─ globalVariablesSchema: [ ... ]
   │  │     ├─ createdBy: uid
   │  │     ├─ createdAt: timestamp
   │  │     └─ updatedAt: timestamp
   │  └─ sessions                              // subcollection
   │     └─ {sessionId}
   │        ├─ name: string
   │        ├─ status: "draft|finalized|archived"
   │        ├─ definitionVersionId: "v1"
   │        ├─ sourceGameId: string|null
   │        ├─ playersSourcePath: "app_settings/player_access"
   │        ├─ createdBy: uid
   │        ├─ updatedBy: uid
   │        ├─ createdAt: timestamp
   │        ├─ updatedAt: timestamp
   │        ├─ finalizedAt: timestamp|null
   │        ├─ calculationFlags                // map
   │        │  ├─ freezeComputedValues: boolean
   │        │  └─ allowManualOverride: boolean
   │        ├─ variables                       // subcollection
   │        │  └─ current
   │        │     ├─ rakePercent: number
   │        │     ├─ defaultWinPercent: number
   │        │     ├─ rebuyColumnsCount: number
   │        │     ├─ updatedAt: timestamp
   │        │     └─ updatedBy: uid
   │        ├─ tables                          // subcollection
   │        │  ├─ table1_settings
   │        │  │  └─ rows
   │        │  │     └─ base                  // pojedynczy wiersz ustawień
   │        │  ├─ table2_entries
   │        │  │  └─ rows
   │        │  │     └─ {rowId}
   │        │  ├─ table3_summary
   │        │  │  └─ rows
   │        │  │     └─ base
   │        │  ├─ table4_ranking
   │        │  │  └─ rows
   │        │  │     └─ {rowId}
   │        │  └─ table5_payout
   │        │     └─ rows
   │        │        └─ {rowId}
   │        └─ snapshots                       // subcollection opcjonalna
   │           └─ {snapshotId}
   │              ├─ createdAt: timestamp
   │              ├─ createdBy: uid
   │              └─ payload: map
   └─ cash                                     // DocumentID stałe
      └─ ... analogicznie jak tournament, ale type="cash"
```

### 2.1 Skrypt Node.js: automatyczne utworzenie pełnej struktury Firebase (bez kroków ręcznych)

Poniższy skrypt tworzy **całą bazową strukturę** dla `calculators/tournament` i `calculators/cash` oraz przykładową sesję startową z podkolekcjami tabel i zmiennych.
Jest idempotentny (można uruchamiać wielokrotnie) i używa `set(..., { merge: true })`.

```js
/**
 * Seed pełnej struktury Firestore dla kalkulatorów:
 * - calculators/tournament
 * - calculators/cash
 * - placeholders/defaults
 * - definitions/v1
 * - sessions/default_session + variables/current + calculationFlags/current
 * - tables/*/rows/*
 *
 * Uruchomienie:
 *   1) npm i firebase-admin
 *   2) umieść serviceAccountKey.json obok pliku
 *   3) node seed-calculators-structure.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

const CALCULATORS = [
  { id: "tournament", name: "KalkulatorTournament", type: "tournament" },
  { id: "cash", name: "KalkulatorCash", type: "cash" },
];

function buildTablesDefinition() {
  return [
    {
      tableId: "table1_settings",
      name: "Tabela1",
      rowsPath: "tables/table1_settings/rows",
      columns: ["sum", "buyIn", "rebuy", "rebuyCount"],
    },
    {
      tableId: "table2_entries",
      name: "Tabela2",
      rowsPath: "tables/table2_entries/rows",
      columns: ["lp", "playerId", "playerNameSnapshot", "buyIn", "rebuy", "eliminated"],
    },
    {
      tableId: "table3_summary",
      name: "Tabela3",
      rowsPath: "tables/table3_summary/rows",
      columns: ["rake", "entryTotal", "rebuyTotal", "pot"],
    },
    {
      tableId: "table4_ranking",
      name: "Tabela4",
      rowsPath: "tables/table4_ranking/rows",
      columns: ["lp", "place", "rankingPoints"],
    },
    {
      tableId: "table5_payout",
      name: "Tabela5",
      rowsPath: "tables/table5_payout/rows",
      columns: ["lp", "winPercent", "playerNameSnapshot", "amount", "rankingPoints", "rebuyDynamic"],
    },
  ];
}

function buildGlobalVariablesSchema() {
  return [
    { key: "rakePercent", type: "number", default: 0 },
    { key: "defaultWinPercent", type: "number", default: 0 },
    { key: "rebuyColumnsCount", type: "number", default: 10 },
  ];
}

async function seedCalculator(calculator) {
  const calcRef = db.collection("calculators").doc(calculator.id);
  const defRef = calcRef.collection("definitions").doc("v1");
  const placeholdersRef = calcRef.collection("placeholders").doc("defaults");
  const sessionRef = calcRef.collection("sessions").doc("default_session");

  const batch = db.batch();

  // calculators/{type}
  batch.set(calcRef, {
    name: calculator.name,
    type: calculator.type,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  // calculators/{type}/placeholders/defaults
  batch.set(placeholdersRef, {
    payoutModel: "PENDING_SPEC",
    rebuyColumnsMode: "dynamic",
    rankingFormula: "PENDING_SPEC",
    updatedAt: now,
  }, { merge: true });

  // calculators/{type}/definitions/v1
  batch.set(defRef, {
    version: 1,
    status: "active",
    appliesTo: [calculator.type],
    tables: buildTablesDefinition(),
    globalVariablesSchema: buildGlobalVariablesSchema(),
    createdBy: "SYSTEM_SEED",
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  // calculators/{type}/sessions/default_session
  batch.set(sessionRef, {
    name: `${calculator.name}_DefaultSession`,
    status: "draft",
    definitionVersionId: "v1",
    sourceGameId: null,
    playersSourcePath: "app_settings/player_access",
    createdBy: "SYSTEM_SEED",
    updatedBy: "SYSTEM_SEED",
    createdAt: now,
    updatedAt: now,
    finalizedAt: null,
  }, { merge: true });

  // variables/current
  batch.set(sessionRef.collection("variables").doc("current"), {
    rakePercent: 0,
    defaultWinPercent: 0,
    rebuyColumnsCount: 10,
    updatedAt: now,
    updatedBy: "SYSTEM_SEED",
  }, { merge: true });

  // calculationFlags/current
  batch.set(sessionRef.collection("calculationFlags").doc("current"), {
    freezeComputedValues: false,
    allowManualOverride: false,
    updatedAt: now,
    updatedBy: "SYSTEM_SEED",
  }, { merge: true });

  // tables/*/rows/*
  batch.set(sessionRef.collection("tables").doc("table1_settings").collection("rows").doc("base"), {
    buyIn: 0,
    rebuy: 0,
    rebuyCount: 0,
    sum: 0,
    updatedAt: now,
  }, { merge: true });

  batch.set(sessionRef.collection("tables").doc("table2_entries").collection("rows").doc("template"), {
    lp: 1,
    playerId: null,
    playerNameSnapshot: "",
    buyIn: 0,
    rebuy: 0,
    eliminated: false,
    updatedAt: now,
  }, { merge: true });

  batch.set(sessionRef.collection("tables").doc("table3_summary").collection("rows").doc("base"), {
    rake: 0,
    entryTotal: 0,
    rebuyTotal: 0,
    pot: 0,
    updatedAt: now,
  }, { merge: true });

  batch.set(sessionRef.collection("tables").doc("table4_ranking").collection("rows").doc("template"), {
    lp: 1,
    place: 1,
    rankingPoints: 0,
    updatedAt: now,
  }, { merge: true });

  batch.set(sessionRef.collection("tables").doc("table5_payout").collection("rows").doc("template"), {
    lp: 1,
    winPercent: 0,
    playerNameSnapshot: "",
    amount: 0,
    rankingPoints: 0,
    rebuyDynamic: [],
    updatedAt: now,
  }, { merge: true });

  await batch.commit();
  console.log(`OK: seeded calculators/${calculator.id}`);
}

(async () => {
  for (const calculator of CALCULATORS) {
    await seedCalculator(calculator);
  }
  console.log("DONE: full calculators structure ready.");
  process.exit(0);
})().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
```

> Efekt: po jednym uruchomieniu dostajesz kompletną strukturę startową zgodną z analizą (root `calculators`, oba typy kalkulatorów, definicja `v1`, sesja robocza, zmienne, flagi i szkielety tabel).

## 3) Definicja tabel i pól (v1)

Poniżej sugerowany model definicji (`calculators/{type}/definitions/v1`).

## 3.1 Tabela1 (`table1_settings`)

**Cel:** parametry wejściowe wspólne dla sesji.

- `sum` (computed, number)
- `buyIn` (manual, number)
- `rebuyUnit` (manual, number)
- `rebuyCount` (computed, number)

Rekomendacja techniczna: trzymać jako jeden stały wiersz `rows/base`.

Przykładowy dokument `rows/base`:

```json
{
  "manual": {
    "buyIn": 200,
    "rebuyUnit": 100
  },
  "computed": {
    "rebuyCount": 0,
    "sum": 200
  },
  "updatedAt": "timestamp",
  "updatedBy": "uid"
}
```

## 3.2 Tabela2 (`table2_entries`)

**Cel:** lista graczy i ich udziału w sesji.

Kolumny:
- `lp` (computed, auto index)
- `playerId` (manual select)
- `playerNameSnapshot` (computed snapshot)
- `buyInValue` (computed from table1.buyIn)
- `rebuyMultiplier` (manual number, domyślnie 0 lub 1)
- `rebuyValue` (computed = `table1.rebuyUnit * rebuyMultiplier`)
- `eliminated` (manual checkbox)

Przykładowy `rows/{rowId}`:

```json
{
  "order": 1,
  "manual": {
    "playerId": "player_abc",
    "rebuyMultiplier": 2,
    "eliminated": false
  },
  "computed": {
    "lp": 1,
    "playerNameSnapshot": "Jan Kowalski",
    "buyInValue": 200,
    "rebuyValue": 200
  },
  "updatedAt": "timestamp",
  "updatedBy": "uid"
}
```

## 3.3 Tabela3 (`table3_summary`)

**Cel:** podsumowanie finansowe sesji.

Kolumny:
- `rakePercent` (manual variable)
- `entriesTotal` (computed from table2.buyInValue)
- `rebuyTotal` (computed from table2.rebuyValue)
- `pot` (computed)

Przykładowy `rows/base`:

```json
{
  "manual": {
    "rakePercent": 5
  },
  "computed": {
    "entriesTotal": 2000,
    "rebuyTotal": 700,
    "pot": 2565
  },
  "updatedAt": "timestamp",
  "updatedBy": "uid"
}
```

> Wzór referencyjny: `pot = (entriesTotal + rebuyTotal) * (1 - rakePercent/100)`.

## 3.4 Tabela4 (`table4_ranking`)

**Cel:** kolejność graczy i punkty rankingowe.

Kolumny:
- `lp` (computed)
- `place` (computed from ranking logic)
- `rankingPoints` (computed)
- `playerId` / `playerNameSnapshot` (copied from table2)

Przykładowy `rows/{rowId}`:

```json
{
  "order": 1,
  "manual": {
    "playerId": "player_abc"
  },
  "computed": {
    "lp": 1,
    "place": 1,
    "rankingPoints": 100,
    "playerNameSnapshot": "Jan Kowalski"
  },
  "updatedAt": "timestamp",
  "updatedBy": "uid"
}
```

## 3.5 Tabela5 (`table5_payout`)

**Cel:** podział puli i dodatkowe pola rebuyowe.

Kolumny bazowe:
- `lp` (computed)
- `winPercent` (manual)
- `playerId` / `playerNameSnapshot` (computed from ranking/table2)
- `amount` (computed)
- `rankingPoints` (computed from table4)

Kolumny dynamiczne:
- `rebuy1 ... rebuyN` (N zmienne)

Rekomendacja: dynamiczne kolumny trzymać jako mapę:
- `manual.rebuyBreakdown = { "rebuy1": 0, "rebuy2": 100, ... }`

Dzięki temu nie trzeba migrować schematu dla zmiany `N`.

Przykładowy `rows/{rowId}`:

```json
{
  "order": 1,
  "manual": {
    "winPercent": 50,
    "rebuyBreakdown": {
      "rebuy1": 100,
      "rebuy2": 0
    }
  },
  "computed": {
    "lp": 1,
    "playerId": "player_abc",
    "playerNameSnapshot": "Jan Kowalski",
    "rankingPoints": 100,
    "amount": 1282.5
  },
  "updatedAt": "timestamp",
  "updatedBy": "uid"
}
```

---

## 4) Placeholdery na przyszłe wymagania

Aby uniknąć późniejszych migracji, warto od razu dodać:

1. `definitions/v1/placeholders`:
   - `rebuyRulesDsl: "PENDING_SPEC"`
   - `cashSpecificFormula: "PENDING_SPEC"`
   - `tournamentSpecificFormula: "PENDING_SPEC"`
   - `tieBreakPolicy: "PENDING_SPEC"`

2. `sessions/{sessionId}/placeholders`:
   - `importSource: null`
   - `externalReferenceId: null`
   - `notes: ""`

3. `sessions/{sessionId}/calculationFlags`:
   - `strictValidation: true`
   - `allowNegativeValues: false`
   - `recalculateOnEachEdit: true`

---

## 5) Indeksy (zalecane)

Warto od razu przygotować indeksy złożone:

1. `calculators/{type}/sessions`: `status ASC, updatedAt DESC`
2. `calculators/{type}/sessions`: `createdBy ASC, createdAt DESC`
3. `.../table2_entries/rows`: `manual.eliminated ASC, order ASC`
4. `.../table4_ranking/rows`: `computed.place ASC, order ASC`

---

## 6) Proponowane Firebase Rules (nowa treść)

Poniżej kompletna propozycja rules z:
- odczytem publicznym,
- zapisem tylko dla zalogowanego admina,
- walidacją podstawowych struktur dla kalkulatorów.

> Uwaga: jeśli nie masz jeszcze custom claim `admin=true`, tymczasowo możesz zastąpić `isAdmin()` przez `request.auth != null` i później wrócić do wersji docelowej.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn() && request.auth.token.admin == true;
    }

    function isCalculatorType(type) {
      return type in ['tournament', 'cash'];
    }

    function isSessionStatus(status) {
      return status in ['draft', 'finalized', 'archived'];
    }

    function hasTimestamps(data) {
      return data.createdAt is timestamp && data.updatedAt is timestamp;
    }

    // ===== Odczyt istniejących kolekcji (pozostawione liberalnie) =====
    match /Tables/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /UserGames/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /admin_games_stats/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /admin_messages/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /app_settings/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /chat_messages/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /players/{doc=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ===== Nowe rules dla kalkulatorów =====
    match /calculators/{calculatorType} {
      allow read: if true;
      allow create, update, delete: if isAdmin()
        && isCalculatorType(calculatorType)
        && request.resource.data.type == calculatorType
        && request.resource.data.name is string
        && request.resource.data.isActive is bool
        && hasTimestamps(request.resource.data);

      match /definitions/{versionId} {
        allow read: if true;
        allow create, update, delete: if isAdmin()
          && request.resource.data.version is number
          && request.resource.data.status in ['draft', 'active', 'archived']
          && request.resource.data.tables is list
          && request.resource.data.globalVariablesSchema is list
          && request.resource.data.createdBy is string
          && request.resource.data.createdAt is timestamp
          && request.resource.data.updatedAt is timestamp;
      }

      match /sessions/{sessionId} {
        allow read: if true;
        allow create, update, delete: if isAdmin()
          && request.resource.data.name is string
          && isSessionStatus(request.resource.data.status)
          && request.resource.data.definitionVersionId is string
          && request.resource.data.playersSourcePath is string
          && request.resource.data.createdBy is string
          && request.resource.data.updatedBy is string
          && request.resource.data.createdAt is timestamp
          && request.resource.data.updatedAt is timestamp
          && (!('finalizedAt' in request.resource.data) || request.resource.data.finalizedAt is timestamp);

        match /variables/{varId} {
          allow read: if true;
          allow create, update, delete: if isAdmin()
            && request.resource.data.updatedAt is timestamp
            && request.resource.data.updatedBy is string;
        }

        match /tables/{tableKey}/rows/{rowId} {
          allow read: if true;
          allow create, update, delete: if isAdmin()
            && request.resource.data.manual is map
            && request.resource.data.computed is map
            && request.resource.data.updatedAt is timestamp
            && request.resource.data.updatedBy is string;
        }

        match /snapshots/{snapshotId} {
          allow read: if true;
          allow create, update, delete: if isAdmin()
            && request.resource.data.createdAt is timestamp
            && request.resource.data.createdBy is string
            && request.resource.data.payload is map;
        }
      }
    }
  }
}
```

---

## 7) Rekomendowana kolejność wdrożenia

1. Utwórz top-level `calculators` + dokumenty `tournament`, `cash`.
2. Dodaj `definitions/v1` dla obu typów (na start mogą być identyczne).
3. W aplikacji uruchom zapis/odczyt `sessions`.
4. Podłącz Tabela1 i Tabela2 (najważniejsze dane wejściowe).
5. Dodaj wyliczenia Tabela3.
6. Dodaj ranking Tabela4.
7. Dodaj payout Tabela5 z dynamicznym `rebuyBreakdown`.
8. Dopiero potem doprecyzuj DSL reguł dla `rebuy1..rebuyN` i rankingów.

---

## 8) Najważniejsze decyzje projektowe (podsumowanie)

- Jedna struktura techniczna (`calculators/{type}`), ale pełna separacja danych sesji dla `tournament` i `cash`.
- Wersjonowane definicje (`definitions`) zamiast sztywnego schematu.
- Wiersze tabel z podziałem na `manual` i `computed`.
- Dynamiczne Rebuy jako mapa (`rebuyBreakdown`) zamiast stałych kolumn.
- Rules gotowe na model admin-only write + public read.
- Placeholdery dodane, żeby późniejsze doprecyzowanie zasad nie wymagało przebudowy całej bazy.
