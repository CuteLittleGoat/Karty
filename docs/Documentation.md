# Karty — dokumentacja techniczna (kod + Firebase)

## 1. Struktura kodu
- `Main/index.html` — pełny układ UI, tabele, zakładki, modale.
- `Main/styles.css` — motyw noir/gold, responsywność, tabele, formularze, modale.
- `Main/app.js` — logika aplikacji, renderowanie, obliczenia, PIN-gate, integracja Firestore.
- `config/firebase-config.js` — konfiguracja połączenia Firebase dla frontendu.

## 2. Główne moduły w `Main/app.js`
- **PIN i sesja**: przechowywanie stanu dostępu do kart użytkownika (`sessionStorage`).
- **Gracze i uprawnienia**: lista graczy, PIN, dostęp do zakładek, lata statystyk.
- **Gry admina (`Tables`)**: CRUD gier, szczegóły gry (`rows`), potwierdzenia (`confirmations`), podsumowania i ranking.
- **Gry użytkowników (`UserGames`)**: ten sam model danych co gry admina + pola autora gry.
- **Potwierdzenia użytkownika**: lista gier wymagających potwierdzenia, akcje Potwierdź/Anuluj, podgląd Szczegółów.
- **Statystyki**: agregaty roczne, wagi ręczne (Waga1–Waga6), wynik końcowy i ranking.
- **Czat**: publikacja wiadomości, retencja czasowa i moderacja.
- **Regulamin i Aktualności**: centralne dokumenty konfiguracyjne.
- **Kalkulator**: dynamiczne tabele (Tournament/Cash), zapis stanu do Firestore.

## 3. Aktualny model danych Firestore (wierna struktura używana przez kod)

### 3.1 Kolekcje główne
1. `app_settings`
   - `player_access`
     - `players: Array<{ id, name, pin, appEnabled, permissions, statsYearsAccess }>`
     - `updatedAt`
   - `rules`
     - `text`, `updatedAt`, `createdAt`, `source`
   - (opcjonalnie) `next_game` — ustawienia PIN dla sekcji najbliższej gry.

2. `admin_messages`
   - `admin_messages`
     - `message`, `createdAt`, `source`

3. `chat_messages`
   - dokumenty wiadomości:
     - `text`, `authorName`, `authorId`, `createdAt`, `expireAt`, `source`

4. `Tables` (gry admina)
   - dokument gry:
     - `gameType`, `gameDate`, `name`, `isClosed`, `preGameNotes`, `postGameNotes`, `createdAt`
   - subkolekcja `rows`:
     - `playerName`, `entryFee`, `rebuy`, `payout`, `points`, `championship`, `createdAt`
   - subkolekcja `confirmations`:
     - `playerId`, `playerName`, `confirmed`, `updatedBy`, `updatedAt`

5. `UserGames` (gry użytkowników)
   - dokument gry:
     - `gameType`, `gameDate`, `name`, `isClosed`, `preGameNotes`, `postGameNotes`, `createdAt`
     - `createdByPlayerId`, `createdByPlayerName`
   - subkolekcja `rows` — jak w `Tables/rows`
   - subkolekcja `confirmations` — jak w `Tables/confirmations`

6. `admin_games_stats`
   - dokument roku (np. `2026`):
     - `rows` (ręczne wartości wag na gracza)
     - `visibleColumns` (kolumny widoczne dla użytkownika)

7. `calculators`
   - dokumenty trybu (`tournament`, `cash`) z polami stanu kalkulatora i `updatedAt`.

### 3.2 Kolekcje wyłączone z projektu Karty
- `Nekrolog_refresh_jobs`
- `Nekrolog_config`
- `Nekrolog_snapshots`

## 4. Node.js — skrypt tworzący identyczny szkielet bazy

Poniższy skrypt tworzy dokumenty bazowe i minimalną strukturę kolekcji zgodną z aplikacją.

```js
// scripts/bootstrap-firestore.js
const admin = require('firebase-admin');
const serviceAccount = require('../test.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  // app_settings
  await db.collection('app_settings').doc('player_access').set({
    players: [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection('app_settings').doc('rules').set({
    text: '',
    source: 'bootstrap',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection('app_settings').doc('next_game').set({
    pin: ''
  }, { merge: true });

  // admin messages
  await db.collection('admin_messages').doc('admin_messages').set({
    message: '',
    source: 'bootstrap',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // stats skeleton (current year)
  const year = String(new Date().getFullYear());
  await db.collection('admin_games_stats').doc(year).set({
    rows: [],
    visibleColumns: []
  }, { merge: true });

  // calculators skeleton
  await db.collection('calculators').doc('tournament').set({
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await db.collection('calculators').doc('cash').set({
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // sample game in Tables (creates subcollection shape)
  const tableRef = await db.collection('Tables').add({
    gameType: 'Cashout',
    gameDate: '2026-01-01',
    name: 'Gra 1',
    isClosed: false,
    preGameNotes: '',
    postGameNotes: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await tableRef.collection('rows').add({
    playerName: '',
    entryFee: '',
    rebuy: '',
    payout: '0',
    points: '',
    championship: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await tableRef.collection('confirmations').doc('sample-player').set({
    playerId: 'sample-player',
    playerName: 'Sample',
    confirmed: false,
    updatedBy: 'bootstrap',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // sample game in UserGames
  const userGameRef = await db.collection('UserGames').add({
    gameType: 'Cashout',
    gameDate: '2026-01-01',
    name: 'Gra użytkownika 1',
    isClosed: false,
    preGameNotes: '',
    postGameNotes: '',
    createdByPlayerId: 'admin',
    createdByPlayerName: 'Administrator',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await userGameRef.collection('rows').add({
    playerName: '',
    entryFee: '',
    rebuy: '',
    payout: '0',
    points: '',
    championship: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await userGameRef.collection('confirmations').doc('sample-player').set({
    playerId: 'sample-player',
    playerName: 'Sample',
    confirmed: false,
    updatedBy: 'bootstrap',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Firestore bootstrap completed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## 5. Wzory obliczeń i zachowanie UI
- **Pula gry** = suma wszystkich `entryFee + rebuy` dla graczy danej gry.
- **+/− w szczegółach** = `payout - (entryFee + rebuy)`.
- **LP w szczegółach** = numer porządkowy na podstawie kolejności wiersza.
- **Wynik statystyk** = suma ważona pól: mistrzostwa, udziału, punktów, bilansu, wypłat, wpłat (Waga1–Waga6).

## 6. Weryfikacja dokumentacji vs kod
- Struktura kolekcji i pól została odtworzona z rzeczywistego użycia w `Main/app.js`.
- Skrypt Node.js buduje minimalną strukturę, którą aplikacja potrafi odczytać i rozbudować podczas pracy.
