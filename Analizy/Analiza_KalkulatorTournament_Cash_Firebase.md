# Analiza: przygotowanie danych Firebase pod moduły `KalkulatorTournament` i `KalkulatorCash`

## Prompt użytkownika
> Przeprowadź analizę i zapisz jej wyniki w "Analizy".
> Planuję niedługo rozbudować aplikację o dwie nowe zakładki (lub jedną zakładkę i dwie podzakładki).
> KalkulatorTournament i KalkulatorCash
>
> W jednym i drugim przypadku będzie potrzebnych kilka tabel.
> Część będzie uzupełniania ręcznie - np. nazwy graczy (dane zaciągane z obecnie istniejącej zakładki).
> Potem kilka (5-10) pól obliczalnych i takich do wpisania jakiś zmiennych do obliczeń (np. % dla organizatora) (reguły i nazwy podam potem). Wszystko musi być zapisywane w aplikacji i Firebase do późniejszego wglądu.
> Oba warianty: KalkulatorTournament i KalkulatorCash maja działać niezależnie od siebie i mogą mieć różne wartości wpisywane w te pola obliczalne i zmienne.
>
> Zaproponuj jak przygotować nowe kolekcje w Firebase, żeby to obsłużyć (jeżeli jest potrzebne) oraz jakie mają być wpisane Rules.

---

## 1. Stan obecny aplikacji (punkt wyjścia)

Na bazie aktualnego kodu i dokumentacji:
- aplikacja zapisuje dane gier głównie w `Tables/{gameId}` i `UserGames/{gameId}` oraz podkolekcjach `rows` i `confirmations`,
- istnieje model graczy w `app_settings/player_access` (tablica obiektów graczy),
- statystyki roczne są trzymane w `admin_games_stats/{year}`,
- obecne Firestore Rules są otwarte (`allow read, write: if true`) dla wielu kolekcji.

Wniosek: dla nowych kalkulatorów warto od razu zaprojektować strukturę z rozdziałem na:
1) konfigurację układu tabel/pól,
2) zapis konkretnych „sesji obliczeń”,
3) zapis wartości wierszy (gracze + zmienne + pola obliczalne),
4) wersjonowanie i audyt (kto, kiedy zmieniał).

---

## 2. Założenia projektowe dla nowych zakładek

1. **Pełna niezależność** `KalkulatorTournament` i `KalkulatorCash`:
   - osobne dokumenty sesji,
   - osobne wartości parametrów,
   - możliwość różnych definicji kolumn i algorytmów.

2. **Wiele tabel na kalkulator**:
   - np. „Tabela A: wejściowa”, „Tabela B: podział”, „Tabela C: wynik końcowy”.

3. **Mieszane dane**:
   - ręczne (np. nazwa gracza, % organizatora),
   - obliczalne (5–10 pól lub więcej),
   - wartości wynikowe zapisywane, nie tylko liczone „w locie” (historia i podgląd po czasie).

4. **Powiązanie z istniejącymi graczami**:
   - zapisujemy `playerId` + `playerNameSnapshot` (snapshot nazwy z chwili zapisu).

5. **Gotowość pod rozwój**:
   - parametry i kolumny konfigurowalne (bez migracji przy każdej nowej zmiennej).

---

## 3. Proponowana struktura Firestore

## 3.1 Kolekcja główna

### `calculators`
- dokumenty:
  - `tournament`
  - `cash`

Każdy dokument trzyma metadane typu kalkulatora:
- `name`: "KalkulatorTournament" / "KalkulatorCash"
- `isActive`: boolean
- `createdAt`, `updatedAt`

## 3.2 Konfiguracja układu i pól

### `calculators/{calculatorType}/definitions/{versionId}`
Służy do opisania jakie tabele i pola są dostępne w UI oraz jak liczyć pola obliczalne.

Przykładowe pola dokumentu:
- `version`: np. `1`, `2`
- `status`: `draft | active | archived`
- `tables`: tablica definicji tabel:
  - `tableKey` (np. `entries`, `settlement`, `summary`)
  - `tableLabel`
  - `columns`: tablica kolumn:
    - `key`
    - `label`
    - `type` (`number`, `percent`, `text`, `playerRef`, `computed`)
    - `editable` (bool)
    - `required` (bool)
    - `precision` (np. 0/2)
    - `formula` (dla `computed`, np. DSL albo identyfikator funkcji)
    - `order`
- `globalVariablesSchema`: lista zmiennych wspólnych (np. `% organizatora`, kurs, prowizje)
- `createdBy`, `createdAt`, `updatedAt`

Dzięki temu przy zmianie logiki (nowe pola/formuły) dodajesz nową wersję definicji, a stare sesje pozostają spójne historycznie.

## 3.3 Sesje obliczeń (właściwe dane użytkownika)

### `calculators/{calculatorType}/sessions/{sessionId}`
Przykładowe pola:
- `name` (np. "Turniej 2026-03-05" albo "Cash piątek")
- `definitionVersionId` (powiązanie do `definitions`)
- `status`: `draft | finalized | archived`
- `sourceGameId` (opcjonalnie powiązanie z `Tables` lub `UserGames`)
- `playersSource`: np. `app_settings/player_access`
- `createdBy`, `updatedBy`
- `createdAt`, `updatedAt`
- `finalizedAt` (opcjonalnie)

## 3.4 Zmienne globalne sesji

### `calculators/{calculatorType}/sessions/{sessionId}/variables/{varDocId}`
Dwa warianty:
- **prosty**: jeden dokument `current` z mapą zmiennych,
- **rozszerzalny**: każdy parametr osobnym dokumentem.

Rekomendacja: **jeden dokument `current`**:
- `values`: mapa, np. `{ organizerPercent: 12, taxPercent: 3, bonusMultiplier: 1.1 }`
- `updatedAt`, `updatedBy`

## 3.5 Wiersze tabel sesji

### `calculators/{calculatorType}/sessions/{sessionId}/tables/{tableKey}/rows/{rowId}`
Wiersz z danymi gracza lub pozycji.

Przykładowe pola:
- `playerId` (opcjonalnie)
- `playerNameSnapshot` (opcjonalnie)
- `order`
- `manual`: mapa pól ręcznych, np. `{ buyIn: 200, rebuy: 100, organizerPercent: 10 }`
- `computed`: mapa pól wyliczonych, np. `{ gross: 300, organizerFee: 30, net: 270 }`
- `validation`: np. `{ isValid: true, errors: [] }`
- `updatedAt`, `updatedBy`, `createdAt`

To podejście pozwala utrzymać dużą elastyczność (5, 10, 20 pól bez przebudowy modelu).

## 3.6 Snapshot podglądowy sesji (opcjonalne, ale polecane)

### `calculators/{calculatorType}/sessions/{sessionId}/snapshots/{snapshotId}`
- pełny zapis stanu tabel i zmiennych na moment „Zapisz” / „Finalizuj”,
- ułatwia rollback i audyt,
- można przechowywać np. ostatnie 20 snapshotów.

## 3.7 Dlaczego nie tworzyć osobnych top-level kolekcji?

Alternatywa to:
- `tournament_calculations`
- `cash_calculations`

To też jest poprawne, ale wariant `calculators/{type}/...` daje:
- mniejszą duplikację kodu,
- wspólny renderer UI sterowany `calculatorType`,
- łatwiejsze dokładanie 3. typu kalkulatora w przyszłości.

---

## 4. Propozycja Firestore Rules

> Uwaga: poniższe reguły są rekomendacją docelową. Aktualna aplikacja ma reguły otwarte (`if true`), więc wdrożenie najlepiej etapować.

Zakładam, że dalej nie ma Firebase Auth opartego o realnego użytkownika końcowego (obecnie dostęp opiera się o PIN w UI). Wtedy bezpieczeństwo po stronie reguł i tak jest ograniczone, ale można:
1) ograniczyć pola,
2) zablokować niechciane typy danych,
3) rozdzielić uprawnienia odczytu/zapisu dla obszarów admin/user, jeśli pojawi się Auth.

Przykładowy szkielet Rules dla nowych kolekcji:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    // Tymczasowo (bez Auth) można zostawić true, ale docelowo: isSignedIn()
    function canReadCalculators() {
      return true;
    }

    function canWriteCalculators() {
      return true;
    }

    match /calculators/{calculatorType} {
      allow read: if canReadCalculators();
      allow write: if canWriteCalculators()
        && calculatorType in ['tournament', 'cash'];

      match /definitions/{versionId} {
        allow read: if canReadCalculators();
        allow create, update: if canWriteCalculators()
          && request.resource.data.keys().hasAll(['version', 'status', 'tables', 'createdAt', 'updatedAt']);
        allow delete: if canWriteCalculators();
      }

      match /sessions/{sessionId} {
        allow read: if canReadCalculators();
        allow create, update: if canWriteCalculators()
          && request.resource.data.keys().hasAll(['name', 'definitionVersionId', 'status', 'createdAt', 'updatedAt']);
        allow delete: if canWriteCalculators();

        match /variables/{varDocId} {
          allow read, write: if canWriteCalculators();
        }

        match /tables/{tableKey} {
          allow read, write: if canReadCalculators();

          match /rows/{rowId} {
            allow read: if canReadCalculators();
            allow create, update: if canWriteCalculators()
              && request.resource.data.keys().hasAll(['manual', 'computed', 'updatedAt']);
            allow delete: if canWriteCalculators();
          }
        }

        match /snapshots/{snapshotId} {
          allow read: if canReadCalculators();
          allow create: if canWriteCalculators();
          allow update, delete: if false;
        }
      }
    }
  }
}
```

### Minimalna wersja „na już”
Jeżeli chcesz szybko uruchomić funkcję przy obecnym modelu bezpieczeństwa, możesz na start dodać tylko:

```firestore
match /calculators/{calculatorType} {
  allow read, write: if true;

  match /{document=**} {
    allow read, write: if true;
  }
}
```

A potem przejść na reguły docelowe.

---

## 5. Wymagane indeksy Firestore (rekomendacja)

Dla przewidywanych widoków list i historii:
- listowanie sesji po typie i dacie:
  - `calculators/{type}/sessions` z `orderBy(updatedAt desc)`
- filtrowanie sesji po statusie + dacie:
  - composite index: `status ASC, updatedAt DESC`
- wiersze tabel po `order`:
  - `tables/{tableKey}/rows` z `orderBy(order asc)`

---

## 6. Jak spiąć z obecnymi danymi graczy

Rekomendowany przepływ:
1. przy otwarciu sesji pobrać graczy z `app_settings/player_access.players`,
2. użytkownik wybiera gracza do wiersza,
3. zapis do wiersza: `playerId` + `playerNameSnapshot`,
4. jeśli nazwa gracza zmieni się w przyszłości, stare sesje nadal pokazują historyczną nazwę.

To eliminuje problem „rozjechania” historii po zmianie nazewnictwa.

---

## 7. Plan wdrożenia etapami

### Etap 1 (bezpieczny start)
- utworzyć kolekcję `calculators` i podstrukturę `sessions`,
- dodać proste Rules (`if true`) tylko dla nowej gałęzi,
- zapisywać `manual` + `computed` w `rows`.

### Etap 2 (stabilizacja)
- dodać `definitions` i wersjonowanie,
- dodać walidację pól po stronie UI,
- dodać snapshoty przy finalizacji.

### Etap 3 (utwardzenie)
- przejść na ostrzejsze Rules,
- (opcjonalnie) dodać Firebase Auth i role admin/user,
- ograniczyć update po `finalized` (tylko odczyt lub uprawniony admin).

---

## 8. Podsumowanie rekomendacji

Najbardziej przyszłościowy układ to jedna gałąź:
- `calculators/tournament/...`
- `calculators/cash/...`

z podziałem na:
- `definitions` (co liczymy i jak),
- `sessions` (konkretne przypadki),
- `variables` (parametry),
- `tables/.../rows` (dane graczy i wyniki),
- `snapshots` (historia).

Taki model spełnia wymagania niezależności obu kalkulatorów, zapisu wszystkich danych do Firebase i dalszego rozwoju bez częstych migracji schematu.

---

## 9. Drzewko konfiguracji kolekcji (do wdrożenia w Firebase)

Poniżej masz gotowe, kompletne drzewko „co kliknąć i co utworzyć”, bazując na obecnej strukturze ze screenów.

### 9.1 Co zrobić z `Collection1`

- `Collection1` wygląda na testową i nieużywaną przez aplikację (placeholderowe pola `field1...field20`).
- Rekomendacja:
  - **nie używać** jej do nowych funkcji,
  - zostawić tymczasowo tylko do czasu potwierdzenia,
  - po potwierdzeniu braku użycia usunąć całą kolekcję.

### 9.2 Docelowe top-level collections (stan po rozbudowie)

```text
(default)
├─ Tables
├─ UserGames
├─ admin_games_stats
├─ admin_messages
├─ app_settings
├─ chat_messages
├─ players
└─ calculators                       // NOWA kolekcja główna
   ├─ tournament                     // DocumentID: stałe "tournament"
   │  ├─ name: string                // "KalkulatorTournament"
   │  ├─ isActive: boolean
   │  ├─ createdAt: timestamp
   │  ├─ updatedAt: timestamp
   │  ├─ definitions                 // subcollection
   │  │  └─ {versionId}              // DocumentID: np. "v1" lub auto-ID
   │  │     ├─ version: number
   │  │     ├─ status: string        // draft|active|archived
   │  │     ├─ tables: array<object>
   │  │     ├─ globalVariablesSchema: array<object>
   │  │     ├─ createdBy: string
   │  │     ├─ createdAt: timestamp
   │  │     └─ updatedAt: timestamp
   │  └─ sessions                    // subcollection
   │     └─ {sessionId}              // DocumentID: auto-ID
   │        ├─ name: string
   │        ├─ definitionVersionId: string
   │        ├─ status: string        // draft|finalized|archived
   │        ├─ sourceGameId: string|null
   │        ├─ playersSource: string // "app_settings/player_access"
   │        ├─ createdBy: string
   │        ├─ updatedBy: string
   │        ├─ createdAt: timestamp
   │        ├─ updatedAt: timestamp
   │        ├─ finalizedAt: timestamp|null
   │        ├─ variables             // subcollection
   │        │  └─ current            // DocumentID: stałe "current"
   │        │     ├─ values: map
   │        │     ├─ updatedAt: timestamp
   │        │     └─ updatedBy: string
   │        ├─ tables                // subcollection
   │        │  └─ {tableKey}         // DocumentID: np. "entries", "summary"
   │        │     └─ rows            // subcollection
   │        │        └─ {rowId}      // DocumentID: auto-ID
   │        │           ├─ playerId: string|null
   │        │           ├─ playerNameSnapshot: string|null
   │        │           ├─ order: number
   │        │           ├─ manual: map
   │        │           ├─ computed: map
   │        │           ├─ validation: map
   │        │           ├─ createdAt: timestamp
   │        │           ├─ updatedAt: timestamp
   │        │           └─ updatedBy: string
   │        └─ snapshots             // subcollection (opcjonalnie)
   │           └─ {snapshotId}       // DocumentID: auto-ID
   │              ├─ createdAt: timestamp
   │              ├─ createdBy: string
   │              └─ payload: map
   └─ cash                           // DocumentID: stałe "cash"
      ├─ name: string                // "KalkulatorCash"
      ├─ isActive: boolean
      ├─ createdAt: timestamp
      ├─ updatedAt: timestamp
      ├─ definitions
      │  └─ {versionId}              // analogicznie jak tournament
      └─ sessions
         └─ {sessionId}              // analogicznie jak tournament
```

### 9.3 Szybki wariant „2 oddzielne kolekcje” (alternatywa)

Jeśli wolisz dokładnie jak w przykładzie „Collection: KalkulatorTournament”, to możesz użyć takiego uproszczenia:

```text
(default)
├─ KalkulatorTournament              // Collection
│  └─ {docId}                        // DocumentID: auto-ID
│     ├─ name: string
│     ├─ createdAt: timestamp
│     ├─ updatedAt: timestamp
│     ├─ status: string
│     ├─ variables: map
│     └─ rows: array|map
└─ KalkulatorCash                    // Collection
   └─ {docId}                        // DocumentID: auto-ID
      ├─ name: string
      ├─ createdAt: timestamp
      ├─ updatedAt: timestamp
      ├─ status: string
      ├─ variables: map
      └─ rows: array|map
```

To jest prostsze na start, ale trudniejsze do skalowania i wersjonowania definicji pól.

### 9.4 Instrukcja klik po kliku (Firebase Console)

1. Wejdź: **Firestore Database → Data**.
2. Kliknij **Start collection**.
3. Wpisz `calculators` jako **Collection ID**.
4. Utwórz pierwszy dokument:
   - **Document ID**: `tournament`
   - pola: `name`, `isActive`, `createdAt`, `updatedAt`.
5. W dokumencie `tournament` kliknij **Start collection** i utwórz subcollection `definitions`.
6. W `definitions` dodaj dokument `v1` (lub auto-ID) z polami wersji.
7. Wróć do dokumentu `tournament`, utwórz subcollection `sessions`.
8. W `sessions` dodawaj dokumenty z auto-ID (każda sesja kalkulacji).
9. W każdej sesji dodaj subcollections: `variables`, `tables`, opcjonalnie `snapshots`.
10. Powtórz kroki 4–9 dla dokumentu `cash`.
11. `Collection1` pozostaw tylko do czasu potwierdzenia, że nic z niej nie czyta; potem usuń.

### 9.5 Minimalny zestaw typów pól (checklista)

- **string**: `name`, `status`, `createdBy`, `updatedBy`, `definitionVersionId`, `playerId`, `playerNameSnapshot`.
- **boolean**: `isActive`.
- **number**: `version`, `order`.
- **timestamp**: `createdAt`, `updatedAt`, `finalizedAt`.
- **map**: `manual`, `computed`, `validation`, `values`, `payload`.
- **array<object>**: `tables`, `globalVariablesSchema`.

To drzewko jest zgodne z wcześniejszą rekomendacją analizy i rozpisuje pełną strukturę do odtworzenia konfiguracji w Firestore.
