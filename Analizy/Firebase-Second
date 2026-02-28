# Analiza Firebase dla modułu Second (ETAP1)

## Prompt użytkownika
"Przeprowadź analizę i zapisz jej wyniki w pliku \"Firebase-Second\".\nBędziemy robić moduł Second. Będzie on zawierać kilka zakładek i tabel.\nKilka będzie działać identycznie jak w module Main.\nLayout też ma być identyczny jak w Main.\nDane w Second będą musiałby być zapisywane do Firebase.\nDane zapisywane w Second i Main muszą być niezależne od siebie.\nPrzykładowo: Zarówno moduł Main jak i moduł Second będzie zawierać zakładkę \"Gracze\". W module Second zakładka \"Gracze\" będzie działać tak samo jak jak w Main. Admin będzie dodawać graczy, przypisywać im \nPIN i nadawać uprawnienia. Jednak mogą to być dwie różne liczby graczy. Nawet jak jest jeden ten sam gracz to może mieć dwa różne zestawy uprawnień w każdym z modułów i taki sam lub różny PIN.\nW Analizy/firestore-schema.txt masz aktualną strukturę Firebase.\nPrzeprowadź analizę czy obecna struktura Firebase obsłuży niezależne od siebie dwa moduł czy wymagane są nowe kolekcje. Jeżeli tak to zapisz mi jakie nowe kolekcje należy utworzyć i zapisz mi skrypt node.js do ich utworzenia.\nW Analizy/Rules.txt masz też aktualne Rules. Jak trzeba będzie dodać nowe kolekcje to do pliku z analizą dodaj też nowe Rules.\nPoniżej kilka danych dotyczących zakładek, tabel i pól w planowanym module Second:\n\n1. Zakładka \"Aktualności\". Funkcjonalność jak zakładka \"Aktualności\" w Main. W widoku admina pole do wpisania wiadomości. W widoku użytkownika pole do odczytu.\n\n2. Zakładka \"Plan gry\". Funkcjonalność bliźniacza do \"Aktualności\". W widoku admina pole do wpisania wiadomości. W widoku użytkownika pole do odczytu. Tutaj będą przyciski do kolorowania tekstu (jak w \"Notatki do gry\" w Main).\n\n3. Zakładka \"Notatki\". Funkcjonalność jak zakładka \"Notatki\" w Main. Dostęp tylko w widoku admina. Pole do zapisywania notatek.\n\n4. Zakładka \"Gracze\" - Funkcjonalność jak zakładka \"Gracze\" w Main. Dostęp tylko w widoku admina. Panel do zarządzania graczami, ich PIN i uprawnieniami. Musi zawierać te same kolumny co w Main.\n\n5. Zakładka \"Czat\". Funkcjonalność jak zakładka \"Czat\" w Main. W widoku admina możliwość kasowania wiadomości (pojedynczych i przycisk do kasowania starszych niż 30dni). W widoku użytkownika pole do wpisywania wiadomośći i ich odczytu.\n\n6. Zakładka \"Stoły\". Funkcjonalność podobna do \"Gracze\". Każdy dodany stół będzie mieć nadawane nazwy i będą do niego losowani gracze. Stół jako obiekt w aplikacji będzie przypisany do konkretnej gry i do stołu będą potem przypisani gracze.\n\n7. Różne tabele. Część danych będzie obliczalna a część musi być wpisywana przez admina.\nDane jakie admin musi ręcznie uzupełniać:\n7a. Tabela11. Pola uzupełnianie ręcznie:\n- ORGANIZATOR\n- BUY-In\n- REBUY/ADD-ON\n- RAKE\n- STACK\n- REBUY/ADD-ON STACK\n- Aplikacja\n- Lista Graczy\n\n7b. Tabela12. Pola uzupełnianie ręcznie:\n- Nazwa Stołu\n\n7c. Tabela13. Pola uzupełnianie ręcznie:\n- Rebuy (przycisk. Funkcjonalność podobna co w \"Main\" w \"Kalkulator\")\n\n7d. Tabela14. Pola uzupełnianie ręcznie:\n- Podział puli\n- Mod\n- Rebuy\n(tabela będzie przypominać Tabela5 z Main)\n\n7e. Tabela15. Pola uzupełnianie ręcznie:\n- Eliminated\n- Stack\n(tabela będzie przypominać Tabela2 z Main)\n\n7f. Tabela16. Pola uzupełnianie ręcznie:\n- Nazwa\n- Eliminated\n- Stack\n\n7g. Tabela17. Pola uzupełnianie ręcznie:\n- Eliminated\n\n7h. Tabela18. Pola uzupełnianie ręcznie:\n- Przycisk1\n- Przycisk2\n\nTo będzie ETAP1. W dalszych etapach Firebase może się zmieniać i rozbudowywać. Tak jak napisałem - część funkcjonalności, układ kolumn i wygląd będzie identyczna jak w Main."

## Wynik analizy

### 1) Czy obecny schema obsłuży pełną niezależność Main vs Second?
Krótko: **nie w pełni**.

W aktualnym stanie większość danych modułu Main i potencjalnie Second trafiałaby do tych samych kolekcji globalnych (`app_settings`, `chat_messages`, `Tables`, `UserGames`, `calculators`, `admin_games_stats`, `players`, `admin_messages`). To oznacza ryzyko mieszania danych między modułami, co jest sprzeczne z wymaganiem niezależności.

Wyjątek: `admin_notes` już ma rozdzielenie dokumentami (`main`, `second`), więc dla zakładki „Notatki” można zostać przy tej kolekcji (bez tworzenia nowej), o ile kod konsekwentnie zapisuje do `admin_notes/second`.

### 2) Rekomendacja kolekcji dla modułu Second (ETAP1)
Aby zapewnić niezależność danych, utworzyć osobny zestaw kolekcji dla Second:

1. `second_admin_messages` (Aktualności)
2. `second_app_settings` (Plan gry + ustawienia modułu + lista graczy/uprawnień jeśli trzymana w app settings)
3. `second_chat_messages` (Czat)
4. `second_players` (jeśli używana osobna kolekcja graczy)
5. `second_tables` (+ subkolekcje `rows`, `confirmations`)
6. `second_user_games` (+ subkolekcje `rows`, `confirmations`)
7. `second_admin_games_stats` (statystyki)
8. `second_calculators` (+ subkolekcje: `definitions`, `placeholders`, `sessions`, `sessions/variables`, `sessions/calculationFlags`, `sessions/tables`, `sessions/tables/rows`, `sessions/snapshots`)

Dodatkowo zalecam zaktualizować dokument `modules_config/collections`, żeby jawnie mapował Main i Second na różne nazwy kolekcji.

### 3) Powiązanie z planowanymi zakładkami/tabelami
- „Aktualności” -> `second_admin_messages`
- „Plan gry” -> `second_app_settings` (np. dokument analogiczny do `evening_plan`)
- „Notatki” -> można pozostać przy `admin_notes/second`
- „Gracze” -> `second_app_settings` (`player_access`) i/lub `second_players`
- „Czat” -> `second_chat_messages`
- „Stoły” + tabele turniejowe -> `second_tables`, `second_user_games`, `second_calculators`, `second_admin_games_stats`

### 4) Skrypt Node.js do utworzenia kolekcji (seed minimalny)

```js
/**
 * create-second-module-collections.js
 * Uruchomienie:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node create-second-module-collections.js
 */

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

async function ensureDoc(path, data) {
  await db.doc(path).set(data, { merge: true });
  console.log(`OK: ${path}`);
}

async function main() {
  // 1) Aktualności
  await ensureDoc("second_admin_messages/main", {
    message: "",
    source: "second",
    createdAt: now
  });

  // 2) Plan gry + access
  await ensureDoc("second_app_settings/evening_plan", {
    html: "",
    text: "",
    source: "second",
    updatedAt: now
  });

  await ensureDoc("second_app_settings/next_game", {
    html: "",
    text: "",
    source: "second",
    updatedAt: now
  });

  await ensureDoc("second_app_settings/player_access", {
    pin: "",
    players: [],
    source: "second",
    updatedAt: now
  });

  // 3) Czat
  await ensureDoc("second_chat_messages/bootstrap", {
    text: "",
    playerName: "system",
    createdAt: now,
    source: "second"
  });

  // 4) Players (opcjonalnie, gdy aplikacja używa tej kolekcji)
  await ensureDoc("second_players/bootstrap", {
    name: "",
    pin: "",
    appEnabled: false,
    permissions: [],
    statsYearsAccess: [],
    source: "second",
    updatedAt: now
  });

  // 5) Stoły
  await ensureDoc("second_tables/bootstrap", {
    name: "",
    gameDate: "",
    gameType: "",
    isClosed: false,
    createdAt: now,
    source: "second"
  });
  await ensureDoc("second_tables/bootstrap/rows/bootstrap", {
    playerName: "",
    rebuy: "",
    entryFee: "",
    points: "",
    payout: "",
    championship: false,
    createdAt: now
  });
  await ensureDoc("second_tables/bootstrap/confirmations/bootstrap", {
    playerId: "",
    playerName: "",
    confirmedAt: now
  });

  // 6) User games
  await ensureDoc("second_user_games/bootstrap", {
    name: "",
    gameDate: "",
    gameType: "",
    isClosed: false,
    preGameNotes: "",
    postGameNotes: "",
    createdAt: now,
    source: "second"
  });
  await ensureDoc("second_user_games/bootstrap/rows/bootstrap", {
    playerName: "",
    rebuy: "",
    entryFee: "",
    points: "",
    payout: "",
    championship: false,
    createdAt: now
  });
  await ensureDoc("second_user_games/bootstrap/confirmations/bootstrap", {
    playerId: "",
    playerName: "",
    confirmedAt: now
  });

  // 7) Statystyki
  await ensureDoc("second_admin_games_stats/2026", {
    rows: [],
    visibleColumns: []
  });

  // 8) Kalkulatory
  await ensureDoc("second_calculators/tournament", {
    name: "Tournament",
    type: "tournament",
    isActive: true,
    createdAt: now,
    updatedAt: now,
    source: "second"
  });

  await ensureDoc("second_calculators/tournament/definitions/v1", {
    version: 1,
    status: "active",
    appliesTo: ["second"],
    createdAt: now,
    updatedAt: now,
    createdBy: "migration-script",
    globalVariablesSchema: [],
    tables: []
  });

  await ensureDoc("second_calculators/tournament/placeholders/defaults", {
    payoutModel: "",
    rankingFormula: "",
    rebuyColumnsMode: "",
    updatedAt: now
  });

  await ensureDoc("second_calculators/tournament/sessions/default", {
    createdAt: now,
    updatedAt: now,
    status: "active"
  });

  await ensureDoc("second_calculators/tournament/sessions/default/variables/default", {
    updatedAt: now
  });

  await ensureDoc("second_calculators/tournament/sessions/default/calculationFlags/default", {
    updatedAt: now
  });

  await ensureDoc("second_calculators/tournament/sessions/default/tables/table11", {
    updatedAt: now
  });

  await ensureDoc("second_calculators/tournament/sessions/default/tables/table11/rows/bootstrap", {
    createdAt: now
  });

  await ensureDoc("second_calculators/tournament/sessions/default/snapshots/initial", {
    createdAt: now,
    source: "second"
  });

  // 9) modules_config – mapowanie kolekcji per moduł
  await ensureDoc("modules_config/collections", {
    second: {
      adminMessages: "second_admin_messages",
      appSettings: "second_app_settings",
      chatMessages: "second_chat_messages",
      users: "second_players",
      tables: "second_tables",
      userGames: "second_user_games",
      adminGamesStats: "second_admin_games_stats",
      calculators: "second_calculators"
    },
    updatedAt: now
  });

  console.log("\nZakończono tworzenie kolekcji dla modułu Second.");
}

main().catch((err) => {
  console.error("Błąd:", err);
  process.exit(1);
});
```

### 5) Proponowane Rules dla nowych kolekcji
Poniższe reguły dopisać do aktualnego pliku rules (spójnie z obecnym stylem `allow read, write: if true;`):

```txt
match /second_admin_messages/{docId} {
  allow read, write: if true;
}

match /second_app_settings/{docId} {
  allow read, write: if true;
}

match /second_chat_messages/{docId} {
  allow read, write: if true;
}

match /second_players/{docId} {
  allow read, write: if true;
}

match /second_admin_games_stats/{year} {
  allow read, write: if true;
}

match /second_tables/{tableId} {
  allow read, write: if true;
  match /rows/{rowId} {
    allow read, write: if true;
  }
  match /confirmations/{playerId} {
    allow read, write: if true;
  }
}

match /second_user_games/{gameId} {
  allow read, write: if true;
  match /rows/{rowId} {
    allow read, write: if true;
  }
  match /confirmations/{playerId} {
    allow read, write: if true;
  }
}

match /second_calculators/{type} {
  allow read, write: if true;

  match /definitions/{versionId} {
    allow read, write: if true;
  }

  match /placeholders/{placeholderId} {
    allow read, write: if true;
  }

  match /sessions/{sessionId} {
    allow read, write: if true;

    match /variables/{varDocId} {
      allow read, write: if true;
    }

    match /calculationFlags/{flagDocId} {
      allow read, write: if true;
    }

    match /tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }
    }

    match /snapshots/{snapshotId} {
      allow read, write: if true;
    }
  }
}
```

## Podsumowanie decyzji
- **Wymagane są nowe kolekcje** dla Second, aby zachować pełną niezależność danych od Main.
- **`admin_notes` może zostać wspólne**, o ile utrzymujemy osobne dokumenty (`main`/`second`).
- Zaproponowany zestaw i skrypt jest przygotowany pod ETAP1 i można go rozszerzać w kolejnych etapach.
