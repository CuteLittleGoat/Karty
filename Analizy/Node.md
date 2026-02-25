# Node.js — bootstrap Firebase dla niezależnych modułów `Main` i `Second`

## Prompt użytkownika
"Przeczytaj pliki Analizy/Analiza_Firebase_Second_Niezaleznosc.md, Analizy/Projekt_Login.md oraz docs/Documentation.md

Utwórz nowy plik w \"Analizy\" o nazwie \"Node.md\"
Napisz mi tam pełen skrypt Node.js - podobnie jak w punkcie 8 dokumentacji.
Skrypt ma mi utworzyć wszystkie niezbędne kolekcje, dokumenty, pola itd, żeby moduły \"Main\" i \"Second\" działały niezależnie od siebie i były zachowane wszystkie funkcjonalności."

## Pełny skrypt Node.js

```js
// scripts/bootstrap-main-second-firestore.js
//
// Cel:
// - tworzy kompletną, idempotentną strukturę Firestore dla dwóch niezależnych modułów:
//   `main` i `second`
// - zachowuje funkcjonalności z obecnej aplikacji (settings, wiadomości admina, czat,
//   gry, statystyki, kalkulatory)
// - dodaje strukturę users pod przyszły login/hasło i uprawnienia per moduł
//
// Wymagania:
//   npm i firebase-admin
//   plik z kluczem service account (np. ./serviceAccountKey.json)
//
// Uruchomienie:
//   FIREBASE_KEY_PATH=./serviceAccountKey.json node scripts/bootstrap-main-second-firestore.js

const path = require("path");
const admin = require("firebase-admin");

const keyPath = process.env.FIREBASE_KEY_PATH || "./serviceAccountKey.json";
const serviceAccount = require(path.resolve(keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const ts = admin.firestore.FieldValue.serverTimestamp;

const MODULES = ["main", "second"];

function col(moduleName, baseName) {
  // Przykład: col("main", "chat_messages") => "main_chat_messages"
  return `${moduleName}_${baseName}`;
}

async function ensureSettings(moduleName) {
  await db.collection(col(moduleName, "app_settings")).doc("player_access").set(
    {
      players: [],
      updatedAt: ts()
    },
    { merge: true }
  );

  await db.collection(col(moduleName, "app_settings")).doc("rules").set(
    {
      text: "",
      source: "bootstrap-script",
      createdAt: ts(),
      updatedAt: ts()
    },
    { merge: true }
  );
}

async function ensureAdminMessages(moduleName) {
  await db.collection(col(moduleName, "admin_messages")).doc("admin_messages").set(
    {
      message: "",
      source: "bootstrap-script",
      createdAt: ts(),
      updatedAt: ts()
    },
    { merge: true }
  );
}

async function ensureChat(moduleName) {
  // Kolekcja tworzona jawnie przez dokument techniczny + przykładową wiadomość
  await db.collection(col(moduleName, "chat_messages")).doc("__meta").set(
    {
      module: moduleName,
      createdAt: ts(),
      updatedAt: ts(),
      type: "meta"
    },
    { merge: true }
  );

  await db
    .collection(col(moduleName, "chat_messages"))
    .doc("welcome")
    .set(
      {
        text: `Start czatu modułu ${moduleName}`,
        playerName: "System",
        playerId: "system",
        isAdmin: true,
        deleted: false,
        createdAt: ts(),
        updatedAt: ts()
      },
      { merge: true }
    );
}

async function ensureStats(moduleName) {
  const year = String(new Date().getFullYear());

  await db.collection(col(moduleName, "admin_games_stats")).doc(year).set(
    {
      rows: [],
      visibleColumns: [],
      updatedAt: ts()
    },
    { merge: true }
  );
}

async function ensureCalculators(moduleName) {
  for (const mode of ["tournament", "cash"]) {
    await db.collection(col(moduleName, "calculators")).doc(mode).set(
      {
        table1Row: { buyIn: "", rebuy: "" },
        table2Rows: [
          {
            id: `seed-${moduleName}-${mode}-table2-1`,
            playerName: "",
            eliminated: false,
            rebuys: []
          }
        ],
        table3Row: { percent: "" },
        table5SplitPercents: [],
        eliminatedOrder: [],
        updatedAt: ts()
      },
      { merge: true }
    );
  }
}

async function ensureGameWithSubcollections(moduleName, kind, gameName) {
  // kind: "tables" albo "user_games"
  const collectionName = col(moduleName, kind);

  const gameRef = db.collection(collectionName).doc();
  const gameId = gameRef.id;

  const baseGameData = {
    gameId,
    module: moduleName,
    gameType: "Cashout",
    gameDate: new Date().toISOString().slice(0, 10),
    name: gameName,
    isClosed: false,
    preGameNotes: "",
    postGameNotes: "",
    createdAt: ts(),
    updatedAt: ts()
  };

  const gameData =
    kind === "user_games"
      ? {
          ...baseGameData,
          createdByPlayerId: "system",
          createdByPlayerName: "System",
          ownerUid: "system",
          ownerName: "System",
          visibility: "private",
          createdBy: "system"
        }
      : baseGameData;

  await gameRef.set(gameData, { merge: true });

  await gameRef.collection("rows").doc("seed-row-1").set(
    {
      playerId: "",
      playerName: "",
      entryFee: "",
      rebuy: "",
      payout: "0",
      points: "",
      championship: false,
      score: 0,
      stake: 0,
      createdAt: ts(),
      updatedAt: ts()
    },
    { merge: true }
  );

  await gameRef.collection("confirmations").doc("sample-player").set(
    {
      uid: "sample-player",
      playerId: "sample-player",
      playerName: "Sample",
      status: "pending", // model z analizy logowania
      confirmed: false, // zgodność ze starszą logiką
      confirmedAt: null,
      updatedBy: "bootstrap-script",
      updatedAt: ts()
    },
    { merge: true }
  );
}

async function ensureUsers(moduleName) {
  // Profil admina modułu (seed)
  await db.collection(col(moduleName, "users")).doc("seed-admin").set(
    {
      email: `${moduleName}.admin@example.com`,
      displayName: `${moduleName.toUpperCase()} Admin`,
      role: "admin",
      isActive: true,
      userGamesScope: "read_all",
      permissions: {
        userGamesTab: true,
        playersTab: true,
        tablesTab: true,
        statsTab: true,
        adminGamesTab: true,
        chatTab: true,
        newsTab: true,
        tournamentTab: true
      },
      moduleAccess: {
        [moduleName]: true
      },
      createdAt: ts(),
      updatedAt: ts(),
      createdBy: null,
      lastLoginAt: null
    },
    { merge: true }
  );

  // Profil gracza modułu (seed)
  await db.collection(col(moduleName, "users")).doc("seed-player").set(
    {
      email: `${moduleName}.player@example.com`,
      displayName: `${moduleName.toUpperCase()} Player`,
      role: "player",
      isActive: true,
      userGamesScope: "own_only",
      permissions: {
        userGamesTab: true,
        playersTab: false,
        tablesTab: false,
        statsTab: true,
        adminGamesTab: false,
        chatTab: true,
        newsTab: true,
        tournamentTab: true
      },
      moduleAccess: {
        [moduleName]: true
      },
      createdAt: ts(),
      updatedAt: ts(),
      createdBy: "seed-admin",
      lastLoginAt: null
    },
    { merge: true }
  );
}

async function bootstrapModule(moduleName) {
  await ensureSettings(moduleName);
  await ensureAdminMessages(moduleName);
  await ensureChat(moduleName);
  await ensureStats(moduleName);
  await ensureCalculators(moduleName);
  await ensureGameWithSubcollections(moduleName, "tables", `Gra admina (${moduleName})`);
  await ensureGameWithSubcollections(moduleName, "user_games", `Gra użytkownika (${moduleName})`);
  await ensureUsers(moduleName);
}

async function ensureSharedCollections() {
  // Kolekcja wspólna pod mapowanie aliasów kolekcji dla modułów
  await db.collection("modules_config").doc("collections").set(
    {
      main: {
        appSettings: col("main", "app_settings"),
        adminMessages: col("main", "admin_messages"),
        chatMessages: col("main", "chat_messages"),
        tables: col("main", "tables"),
        userGames: col("main", "user_games"),
        adminGamesStats: col("main", "admin_games_stats"),
        calculators: col("main", "calculators"),
        users: col("main", "users")
      },
      second: {
        appSettings: col("second", "app_settings"),
        adminMessages: col("second", "admin_messages"),
        chatMessages: col("second", "chat_messages"),
        tables: col("second", "tables"),
        userGames: col("second", "user_games"),
        adminGamesStats: col("second", "admin_games_stats"),
        calculators: col("second", "calculators"),
        users: col("second", "users")
      },
      updatedAt: ts()
    },
    { merge: true }
  );
}

async function main() {
  for (const moduleName of MODULES) {
    await bootstrapModule(moduleName);
  }

  await ensureSharedCollections();

  console.log("✅ Firestore bootstrap completed for modules: main, second");
  console.log("Utworzone kolekcje są niezależne (prefiks main_/second_). ");
}

main().catch((error) => {
  console.error("❌ Bootstrap failed:", error);
  process.exit(1);
});
```

## Co tworzy skrypt

- Niezależne kolekcje per moduł (`main_*`, `second_*`) dla:
  - ustawień aplikacji,
  - wiadomości admina,
  - czatu,
  - gier administracyjnych,
  - gier użytkowników,
  - statystyk,
  - kalkulatorów,
  - użytkowników i uprawnień.
- Subkolekcje `rows` i `confirmations` dla obu typów gier.
- Dokument `modules_config/collections` z mapowaniem nazw kolekcji (ułatwia konfigurację obu modułów).

Skrypt jest **idempotentny** (`set(..., { merge: true })`), więc można uruchamiać go wielokrotnie.
