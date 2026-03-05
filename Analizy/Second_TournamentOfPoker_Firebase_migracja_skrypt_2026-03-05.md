# Skrypt migracyjny Firebase (Node.js) — Tournament of Poker / Second

## Prompt użytkownika
"The user was unsatisfied with the code that the agent previously produced...
Please address any inline comments on the diff, as well as any additional instructions below.
Jeżeli jest cokolwiek wymagane z mojej strony w Firebase to przygotuj mi skrypt Node.js do utworzenia nowych pól w dokumentach i ewentualnie nowych dokumentów/kolekcji. Zapisz to w nowym pliku w Analizy."

## Czy musisz coś zrobić po stronie Firebase?
Tak — jeśli dokument `second_tournament/state` nie ma jeszcze pełnej struktury, warto uruchomić jednorazową migrację, która:
- utworzy dokument, jeśli go nie ma,
- doda brakujące pola wymagane przez UI,
- **nie nadpisze** istniejących wartości (uzupełnia tylko braki).

## Skrypt Node.js
Zapisz jako np. `migrate-second-tournament-state.js` i uruchom:
`node migrate-second-tournament-state.js`

```js
/**
 * Migration: second_tournament/state
 * - creates document if missing
 * - fills only missing keys (non-destructive)
 */

const admin = require("firebase-admin");
const path = require("path");

// 1) Podaj ścieżkę do klucza konta serwisowego Firebase
const serviceAccountPath = path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json"
);

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

const defaultState = {
  organizer: "",
  buyIn: "",
  rebuyAddOn: "",
  rake: "",
  stack: "",
  rebuyStack: "",
  players: [],
  tables: [],
  assignments: {},
  tableEntries: {},

  payments: {
    table10: { buyIn: "", rebuyAddOn: "", sum: "", rebuyCount: "" },
    table11: { percent: "", rake: "", buyIn: "", rebuyAddOn: "", pot: "" }
  },

  pool: {
    splits: [],
    mods: []
  },

  group: {
    playerStacks: {},
    eliminated: {}
  },

  semi: {
    tables: [],
    assignments: {},
    customTables: []
  },

  finalPlayers: [],

  payouts: {
    showInitial: false,
    showFinal: false
  }
};

function mergeMissing(base, fallback) {
  if (Array.isArray(base)) return base;
  if (Array.isArray(fallback)) return base === undefined ? fallback : base;
  if (fallback && typeof fallback === "object") {
    const out = base && typeof base === "object" ? { ...base } : {};
    for (const [key, value] of Object.entries(fallback)) {
      out[key] = mergeMissing(out[key], value);
    }
    return out;
  }
  return base === undefined ? fallback : base;
}

async function run() {
  const ref = db.collection("second_tournament").doc("state");
  const snap = await ref.get();

  const current = snap.exists && snap.data() ? snap.data() : {};
  const next = mergeMissing(current, defaultState);

  next.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  await ref.set(next, { merge: true });

  console.log("✅ Migration done for second_tournament/state");
  console.log("Document existed:", snap.exists);
}

run().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
```

## Wymagane zależności
```bash
npm install firebase-admin
```

## Uwaga
Skrypt celowo nie tworzy nowej kolekcji, ponieważ dla obecnych wymagań wystarczy `second_tournament/state`.
