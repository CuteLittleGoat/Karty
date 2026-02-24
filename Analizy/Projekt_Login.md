# Projekt_Login — pełna analiza wdrożenia logowania i haseł

## Prompt użytkownika
"Przeczytaj wszystkie analizy z Analizy.
Wszystkie poza Analizy/Wazne_Fokus tyczą się jednej dodatkowej funkcjonalności.
Nie udało się wprowadzić poprawnie tajnego klucza.
Utwórz nowy plik w Analizy o nazwie \"Projekt_Login.md\"
Zapisz tam PEŁNĄ analizę dodania funkcjonalności loginu i hasła dla użytkowników.
Dodaj tam PEŁNĄ strukturę nowych kolekcji w Firebase - napisz jak się ma nazywać kolekcja, jak dokument jak każde Field i jaki ma mieć typ.
Dodaj też jakie mają być nowe Rules."

---

## 1. Kontekst i wniosek po przeglądzie analiz

Przejrzane analizy w folderze `Analizy` wskazują spójny obraz:
- dokumenty `Wazne_LoginIHaslo`, `Brak_Dostepu_Firebase_LoginIHaslo`, `Weryfikacja_*`, `Testy_*` dotyczą jednej inicjatywy: wdrożenia logowania email/hasło + ról i zakresów dostępu,
- `Analizy/Wazne_Fokus` dotyczy innego obszaru (focus/autozapis) i nie zmienia założeń bezpieczeństwa,
- klucz `FIREBASE_SERVICE_ACCOUNT_JSON` nie był dostępny w sesjach wykonawczych (`SET=false`), więc nie dało się zrealizować zmian bezpośrednio w projekcie Firebase.

Wniosek: wdrożenie loginu i haseł wymaga gotowego projektu danych + reguł, które można od razu wkleić po odzyskaniu dostępu do sekretu.

---

## 2. Cel funkcjonalny

Wdrożyć pełny model tożsamości i uprawnień:
1. użytkownik loguje się przez Firebase Authentication (email + hasło),
2. uprawnienia i zakres widoczności są trzymane w Firestore,
3. admin ma pełny dostęp,
4. gracze mają kontrolowany zakres (np. tylko własne gry lub podgląd wszystkich gier użytkowników),
5. bezpieczeństwo jest egzekwowane przez Firestore Rules (nie tylko przez UI).

---

## 3. Zakres usług Firebase

### 3.1 Authentication
Włączyć provider:
- **Email/Password**.

Obsługiwane scenariusze:
- tworzenie kont (preferencyjnie przez admina),
- logowanie,
- reset hasła przez email,
- blokowanie konta po stronie admina (`disabled` w Auth + `isActive` w Firestore).

### 3.2 Firestore
Wprowadzić kolekcje profili i uprawnień oraz ujednolicić model `UserGames`.

---

## 4. PEŁNA struktura kolekcji Firestore

Poniżej docelowa, pełna specyfikacja kolekcji i pól.

## 4.1 Kolekcja `users`
Ścieżka dokumentu:
- `users/{uid}`

`{uid}` = identyfikator użytkownika z Firebase Auth (`request.auth.uid`).

### Pola dokumentu `users/{uid}`
- `email` — `string`  
  Email logowania (kopiowany z Auth dla wygodnych zapytań administracyjnych).

- `displayName` — `string`  
  Nazwa widoczna w UI (np. imię/nick).

- `role` — `string`  
  Dozwolone wartości: `"admin" | "player"`.

- `isActive` — `boolean`  
  `true` = konto aktywne, `false` = konto zablokowane na poziomie aplikacji.

- `userGamesScope` — `string`  
  Dozwolone wartości:
  - `"read_all"` — użytkownik widzi wszystkie gry użytkowników (bez prawa edycji cudzych),
  - `"own_only"` — użytkownik widzi tylko własne gry.

- `permissions` — `map<string, boolean>`  
  Flagi dostępów do sekcji aplikacji, np.:
  - `permissions.userGamesTab: boolean`
  - `permissions.playersTab: boolean`
  - `permissions.tablesTab: boolean`
  - `permissions.statsTab: boolean`
  - `permissions.adminGamesTab: boolean`

- `createdAt` — `timestamp`  
  Data utworzenia profilu.

- `updatedAt` — `timestamp`  
  Data ostatniej modyfikacji profilu.

- `createdBy` — `string|null`  
  UID admina, który założył konto (null dla kont seedowanych/migrowanych).

- `lastLoginAt` — `timestamp|null`  
  Pomocniczo do audytu aktywności.

### Przykładowy dokument
```json
{
  "email": "gracz@example.com",
  "displayName": "Gracz A",
  "role": "player",
  "isActive": true,
  "userGamesScope": "own_only",
  "permissions": {
    "userGamesTab": true,
    "playersTab": false,
    "tablesTab": false,
    "statsTab": true,
    "adminGamesTab": false
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>",
  "createdBy": "<adminUid>",
  "lastLoginAt": null
}
```

---

## 4.2 Kolekcja `UserGames`
Ścieżka dokumentu:
- `UserGames/{gameId}`

### Pola dokumentu `UserGames/{gameId}`
- `name` — `string`  
  Nazwa gry.

- `gameType` — `string`  
  Rodzaj gry (zgodny ze słownikiem UI).

- `gameDate` — `timestamp|string`  
  Data gry (docelowo `timestamp`; jeśli istnieją dane legacy, dopuścić czasowo string w migracji).

- `ownerUid` — `string`  
  UID właściciela gry (kluczowe dla autoryzacji).

- `ownerName` — `string`  
  Display name właściciela (cache UI).

- `visibility` — `string`  
  Dozwolone wartości: `"private" | "shared"`.

- `createdAt` — `timestamp`
- `updatedAt` — `timestamp`

- `createdBy` — `string`  
  UID twórcy wpisu (zwykle = `ownerUid`, ale pozwala na działania admina).

### Subkolekcja `rows`
Ścieżka:
- `UserGames/{gameId}/rows/{rowId}`

Przykładowe pola (dopasować do aktualnego modelu w aplikacji):
- `playerId` — `string`
- `playerName` — `string`
- `score` — `number`
- `stake` — `number`
- `createdAt` — `timestamp`
- `updatedAt` — `timestamp`

### Subkolekcja `confirmations`
Ścieżka:
- `UserGames/{gameId}/confirmations/{uid}`

Pola:
- `uid` — `string`
- `status` — `string` (`"pending" | "accepted" | "rejected"`)
- `confirmedAt` — `timestamp|null`
- `updatedAt` — `timestamp`

---

## 4.3 (Opcjonalna) Kolekcja audytowa `auth_events`
Jeżeli potrzebny ślad administracyjny:
- `auth_events/{eventId}`

Pola:
- `type` — `string` (`"USER_CREATED" | "USER_DISABLED" | "PASSWORD_RESET_SENT" | ...`)
- `targetUid` — `string`
- `targetEmail` — `string`
- `performedBy` — `string`
- `createdAt` — `timestamp`
- `meta` — `map<string, any>`

Ta kolekcja nie jest obowiązkowa dla MVP, ale poprawia kontrolę zmian.

---

## 5. Reguły bezpieczeństwa (Firestore Rules) — gotowy szablon

Poniższe reguły zakładają, że każdy zalogowany użytkownik ma dokument `users/{uid}`.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function currentUserDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function userExists() {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function isActive() {
      return userExists() && currentUserDoc().data.isActive == true;
    }

    function isAdmin() {
      return isActive() && currentUserDoc().data.role == 'admin';
    }

    function canReadAllUserGames() {
      return isActive() && currentUserDoc().data.userGamesScope == 'read_all';
    }

    function isOwner(uid) {
      return isActive() && request.auth.uid == uid;
    }

    // ---------------- users ----------------
    match /users/{uid} {
      // Admin widzi wszystkich, użytkownik widzi siebie
      allow read: if isAdmin() || isOwner(uid);

      // Tworzenie profilu:
      // - admin może utworzyć dowolny profil,
      // - użytkownik może utworzyć tylko swój profil startowy (self-service)
      allow create: if isAdmin()
                    || (isSignedIn()
                        && request.auth.uid == uid
                        && request.resource.data.role == 'player'
                        && request.resource.data.isActive == true);

      // Edycja profilu:
      // - admin: pełna edycja,
      // - użytkownik: tylko bezpieczne pola własnego profilu
      allow update: if isAdmin() || (
                      isOwner(uid)
                      && request.resource.data.role == resource.data.role
                      && request.resource.data.isActive == resource.data.isActive
                      && request.resource.data.userGamesScope == resource.data.userGamesScope
                      && request.resource.data.permissions == resource.data.permissions
                    );

      // Usuwanie profili tylko admin
      allow delete: if isAdmin();
    }

    // ---------------- UserGames ----------------
    match /UserGames/{gameId} {
      // Odczyt: admin, właściciel, lub użytkownik z read_all
      allow read: if isAdmin()
                  || (isActive() && resource.data.ownerUid == request.auth.uid)
                  || canReadAllUserGames();

      // Tworzenie: admin lub aktywny user, który tworzy grę jako owner siebie
      allow create: if isAdmin() || (
                      isActive()
                      && request.resource.data.ownerUid == request.auth.uid
                    );

      // Modyfikacja/usuwanie: admin lub właściciel
      allow update, delete: if isAdmin()
                            || (isActive() && resource.data.ownerUid == request.auth.uid);

      // Subkolekcja rows
      match /rows/{rowId} {
        allow read: if isAdmin()
                    || canReadAllUserGames()
                    || (isActive()
                        && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);

        allow create, update, delete: if isAdmin()
                                      || (isActive()
                                          && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);
      }

      // Subkolekcja confirmations
      match /confirmations/{uid} {
        allow read: if isAdmin()
                    || canReadAllUserGames()
                    || (isActive()
                        && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid)
                    || (isActive() && request.auth.uid == uid);

        // zapis potwierdzenia przez:
        // - admina,
        // - właściciela gry,
        // - użytkownika, którego dotyczy dokument confirmations/{uid}
        allow create, update: if isAdmin()
                              || (isActive()
                                  && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid)
                              || (isActive() && request.auth.uid == uid);

        allow delete: if isAdmin()
                      || (isActive()
                          && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);
      }
    }

    // Domyślnie wszystko inne tylko admin (lub całkowicie zablokować)
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 6. Mapping wymagań biznesowych na uprawnienia

### Wariant 1: GraczB widzi gry GraczA, ale nie edytuje
- `role = player`
- `userGamesScope = read_all`
- rules: `read` dla `UserGames` przechodzi, `update/delete` tylko owner/admin.

### Wariant 2: GraczB widzi i edytuje tylko swoje
- `role = player`
- `userGamesScope = own_only`
- rules: `read/update/delete` tylko gdy `ownerUid == request.auth.uid` (lub admin).

### Admin
- `role = admin`
- pełny dostęp do `users`, `UserGames`, subkolekcji i pozostałych zasobów.

---

## 7. Proces kont i haseł (rekomendowany operacyjnie)

1. Admin tworzy użytkownika (email + displayName + rola + zakres) przez panel admina (wywołanie backendowe / Cloud Function).
2. System tworzy konto w Firebase Auth i dokument `users/{uid}`.
3. System wysyła email resetu/ustawienia hasła.
4. Użytkownik ustawia hasło samodzielnie.
5. Logowanie odbywa się przez Email/Password.
6. „Nie pamiętam hasła” używa natywnego resetu Firebase.

Dlaczego tak:
- brak przechowywania haseł przez admina,
- zgodność z darmowym Firebase,
- prosty i bezpieczny model wdrożeniowy.

---

## 8. Plan wdrożenia krok po kroku

1. Włączyć Email/Password w Firebase Auth.
2. Wdrożyć kolekcję `users` i przygotować profile dla istniejących kont.
3. Uzupełnić `ownerUid` w istniejących `UserGames` (migracja danych).
4. Wdrożyć powyższe Firestore Rules.
5. Włączyć UI logowania i ładowanie profilu po `uid`.
6. Ograniczyć UI według `permissions` (warstwa UX, nie zabezpieczenie krytyczne).
7. Przetestować scenariusze:
   - admin full access,
   - player own_only,
   - player read_all,
   - konto zablokowane (`isActive=false`).

---

## 9. Najczęstsza przyczyna dotychczasowej blokady

Z analiz wynika, że problem nie był po stronie samego modelu bezpieczeństwa, tylko dostarczenia sekretu `FIREBASE_SERVICE_ACCOUNT_JSON` do runtime (brak zmiennej w sesji). Po poprawnym przekazaniu sekretu można wykonać powyższy projekt 1:1.

---

## 10. Minimalny zestaw IAM/API (żeby wdrożenie było wykonalne)

Dla konta serwisowego używanego do wdrożeń:
- role IAM:
  - Firebase Authentication Admin,
  - Cloud Datastore Owner (lub min. User + dodatkowe uprawnienia do migracji),
  - Firebase Rules Admin.
- aktywne API:
  - Identity Toolkit API,
  - Cloud Firestore API,
  - Firebase Management API,
  - Cloud Resource Manager API.

To jest wymagane, aby:
- tworzyć użytkowników,
- modyfikować dane,
- publikować Rules,
- wykonać migrację istniejących dokumentów.
