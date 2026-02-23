# Analiza modyfikacji zabezpieczeń: login/hasło + role + Firebase

## Prompt użytkownika
"Przeprowadź pełną analizę modyfikacji zabezpieczeń aplikacji. W nowej wersji byłby potrzebny login i hasło. Zaproponuj rozwiązania. Napisz jaka będzie potrzebna modyfikacja Firebase - masz pełen dostęp poprzez plik test.json.
Chciałbym powiązać część funkcjonalności z uprawnieniami.
Przykładowo:
- GraczA tworzy grę w \"Gry użytkowników\"
- GraczB ma uprawnienia do zakładki \"Gry użytkowników\"
Wariant1: GraczB ma podgląd do gry utworzonej przez GraczA, ale nie może jej modyfikować
Wariant2: GraczB nie ma podglądu do gry utworzonej przez GraczA, może tylko tworzyć i modyfikować własne
Admin zawsze ma dostęp do wszystkiego."

## 1. Cel bezpieczeństwa
- Odejście od PIN-only na rzecz pełnego logowania (email/login + hasło).
- Przeniesienie autoryzacji na Firebase Authentication.
- Przeniesienie autoryzacji dostępu i edycji do Firestore Rules.

## 2. Rekomendowana architektura
1. **Firebase Authentication**
   - logowanie email/hasło,
   - użytkownik ma stały `uid`.
2. **Firestore: profil i role użytkownika**
   - nowa kolekcja `users/{uid}` z polami:
     - `displayName`,
     - `role` (`admin` / `player`),
     - `permissions` (np. `userGamesTab`, `statsTab`),
     - `userGamesScope` (`read_all` albo `own_only`),
     - `isActive`.
3. **Model gry użytkownika**
   - każdy dokument gry w `UserGames` musi mieć:
     - `ownerUid`,
     - `ownerName`,
     - `visibility` (`shared` albo `private`).

## 3. Mapowanie wariantów zlecenia

### Wariant 1 (podgląd cudzych gier bez edycji)
- `userGamesScope = read_all`.
- Reguły:
  - odczyt `UserGames`: dozwolony,
  - zapis/edycja/usuwanie: tylko dla `ownerUid` i admina.

### Wariant 2 (tylko własne gry)
- `userGamesScope = own_only`.
- Reguły:
  - odczyt tylko dokumentów, gdzie `ownerUid == request.auth.uid`,
  - zapis/edycja/usuwanie tylko własnych dokumentów (lub admin).

### Admin
- pełny odczyt/zapis we wszystkich kolekcjach aplikacji.

## 4. Zmiany w Firebase (konkret)

### 4.1 Authentication
- Włączyć provider Email/Password.
- Dodać proces tworzenia kont graczy (panel admina lub skrypt).

### 4.2 Firestore – nowe/zmienione pola
- `users/{uid}` (nowa kolekcja).
- `UserGames/{gameId}`: dodać `ownerUid`, `ownerName`, `visibility`.
- `UserGames/{gameId}/rows/{rowId}` i `confirmations/{playerId}` pozostają, ale dziedziczą kontrolę z dokumentu gry nadrzędnej.

### 4.3 Firestore Rules (szkielet)
- `isAdmin()` na podstawie `users/{uid}.role` albo custom claims.
- `canReadUserGame(game)` oraz `canWriteUserGame(game)` na podstawie `ownerUid` i `userGamesScope`.
- Ograniczyć `app_settings/player_access` tylko dla admina (lub stopniowo wygasić ten dokument).

## 5. Proponowany szkic reguł (uproszczony)
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    function isAdmin() {
      return isSignedIn() && userDoc().data.role == 'admin';
    }

    function hasUserGamesReadAll() {
      return isSignedIn() && userDoc().data.userGamesScope == 'read_all';
    }

    function hasUserGamesOwnOnly() {
      return isSignedIn() && userDoc().data.userGamesScope == 'own_only';
    }

    match /UserGames/{gameId} {
      allow read: if isAdmin()
                  || (isSignedIn() && resource.data.ownerUid == request.auth.uid)
                  || hasUserGamesReadAll();

      allow create: if isAdmin() || isSignedIn();

      allow update, delete: if isAdmin()
                            || (isSignedIn() && resource.data.ownerUid == request.auth.uid);

      match /rows/{rowId} {
        allow read: if isAdmin()
                    || hasUserGamesReadAll()
                    || (isSignedIn() && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);

        allow write: if isAdmin()
                     || (isSignedIn() && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);
      }

      match /confirmations/{playerId} {
        allow read: if isAdmin() || hasUserGamesReadAll() || (isSignedIn() && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);
        allow write: if isAdmin() || (isSignedIn() && request.auth.uid == playerId) || (isSignedIn() && get(/databases/$(database)/documents/UserGames/$(gameId)).data.ownerUid == request.auth.uid);
      }
    }
  }
}
```

## 6. Modyfikacje frontendowe
1. Dodać ekran logowania (email/login + hasło, wylogowanie).
2. Po zalogowaniu pobierać profil `users/{uid}` i budować UI na tej podstawie.
3. Przy tworzeniu gry użytkownika zapisywać `ownerUid` i `ownerName`.
4. Ukryć/wyłączyć przyciski edycji, jeśli użytkownik ma tylko odczyt.
5. Nadal trzymać ochronę w UI, ale głównym zabezpieczeniem są Rules.

## 7. Plan migracji
1. Wprowadzić `users/{uid}` i przypisać role.
2. Dodać `ownerUid` do istniejących dokumentów `UserGames` (skrypt migracyjny).
3. Wdrożyć nowe Rules w trybie testowym.
4. Przełączyć frontend z PIN na Auth.
5. Usunąć stare otwarte reguły `allow read, write: if true`.

## 8. Ryzyka i zabezpieczenia
- Ryzyko: brak `ownerUid` w starych dokumentach -> brak autoryzacji po wdrożeniu.
- Ryzyko: częściowe wdrożenie (UI bez Rules) -> pozorne bezpieczeństwo.
- Zabezpieczenie: etapowe wdrożenie + migracja danych + testy reguł emulatora.

