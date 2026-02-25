# Nowe Firestore Rules dla migracji `main_*` / `second_*` + pełny dostęp do `Nekrolog_*`

## Prompt użytkownika
"Przeczytaj analizę: Analizy/Node.md
Uruchomiłem zawarty tam skrypt.
Plik: Analizy/firestore-structure.txt
zawiera aktualną strukturę po wykonaniu skryptu. Załączam też screeny dla potwierdzenia. Plik: Analizy/old_firestore-structure.txt zawiera strukturę sprzed uruchomienia skryptu. W pliku docs/Documentation.md masz też informacje na temat używanych kolekcji.

Następnie przeczytaj pliki:
Analizy/Analiza_Migracja_Kolekcji_Main_Second.md
Analizy/Analiza_Login_Haslo_Main_vs_Second.md
Analizy/Analiza_Firebase_Second_Niezaleznosc.md

1. Sprawdź czy wszystko utworzyło się tak jak powinno.
2. Trzy kolekcje zaczynające się od \"Nekrolog_\" są do innego projektu. Zignoruj je.
3. Zapisz mi plik w Analizy w którym będzie zapisane nowe \"Rules\". Nowe \"Rules\" ma również obejmować pełen dostęp do trzech kolekcji \"Nekrolog_\".
4. Przeprowadź ultra dokładą analizę kodu pod kątem usunięcia starych kolekcji i przepięcia się na nowe \"main_\" i \"second_\". Zapisz jej wyniki w nowym pliku. Czy wszystko jest gotowe na przepięcie. Nie trzeba przenosić danych. Wszystkie zapisane dane są testowe i nie ma potrzeby ich przenoszenia do nowych struktur.

5. Nie dokonuj jeszcze zmian w dokumentacji."

## Proponowane nowe Rules (wersja pod migrację modułów)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ---------------- helpers ----------------
    function isSignedIn() {
      return request.auth != null;
    }

    function userDocPath(moduleName) {
      return /databases/$(database)/documents/$(moduleName + '_users')/$(request.auth.uid);
    }

    function userExists(moduleName) {
      return isSignedIn() && exists(userDocPath(moduleName));
    }

    function userData(moduleName) {
      return get(userDocPath(moduleName)).data;
    }

    function isActive(moduleName) {
      return userExists(moduleName) && userData(moduleName).isActive == true;
    }

    function isAdmin(moduleName) {
      return isActive(moduleName) && userData(moduleName).role == 'admin';
    }

    function canReadAllUserGames(moduleName) {
      return isActive(moduleName) && userData(moduleName).userGamesScope == 'read_all';
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // ---------------- MAIN ----------------
    match /main_users/{uid} {
      allow read: if isAdmin('main') || isOwner(uid);
      allow create: if isAdmin('main') || (isSignedIn() && isOwner(uid));
      allow update: if isAdmin('main') || isOwner(uid);
      allow delete: if isAdmin('main');
    }

    match /main_app_settings/{docId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');
    }

    match /main_admin_messages/{docId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');
    }

    match /main_chat_messages/{messageId} {
      allow read: if isActive('main');
      allow create: if isActive('main');
      allow update, delete: if isAdmin('main');
    }

    match /main_calculators/{modeId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');

      match /{subPath=**} {
        allow read: if isActive('main');
        allow write: if isAdmin('main');
      }
    }

    match /main_admin_games_stats/{year} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');
    }

    match /main_tables/{gameId} {
      allow read: if isActive('main');
      allow create, update, delete: if isAdmin('main');

      match /rows/{rowId} {
        allow read: if isActive('main');
        allow create, update, delete: if isAdmin('main');
      }

      match /confirmations/{uid} {
        allow read: if isAdmin('main') || (isActive('main') && isOwner(uid));
        allow create, update: if isAdmin('main') || (isActive('main') && isOwner(uid));
        allow delete: if isAdmin('main');
      }
    }

    match /main_user_games/{gameId} {
      allow read: if isAdmin('main')
                  || canReadAllUserGames('main')
                  || (isActive('main') && resource.data.ownerUid == request.auth.uid);

      allow create: if isAdmin('main')
                    || (isActive('main') && request.resource.data.ownerUid == request.auth.uid);

      allow update, delete: if isAdmin('main')
                            || (isActive('main') && resource.data.ownerUid == request.auth.uid);

      match /rows/{rowId} {
        allow read: if isAdmin('main')
                    || canReadAllUserGames('main')
                    || (isActive('main')
                        && get(/databases/$(database)/documents/main_user_games/$(gameId)).data.ownerUid == request.auth.uid);

        allow create, update, delete: if isAdmin('main')
                                      || (isActive('main')
                                          && get(/databases/$(database)/documents/main_user_games/$(gameId)).data.ownerUid == request.auth.uid);
      }

      match /confirmations/{uid} {
        allow read: if isAdmin('main')
                    || canReadAllUserGames('main')
                    || (isActive('main')
                        && get(/databases/$(database)/documents/main_user_games/$(gameId)).data.ownerUid == request.auth.uid)
                    || (isActive('main') && isOwner(uid));

        allow create, update: if isAdmin('main')
                              || (isActive('main')
                                  && get(/databases/$(database)/documents/main_user_games/$(gameId)).data.ownerUid == request.auth.uid)
                              || (isActive('main') && isOwner(uid));

        allow delete: if isAdmin('main')
                      || (isActive('main')
                          && get(/databases/$(database)/documents/main_user_games/$(gameId)).data.ownerUid == request.auth.uid);
      }
    }

    // ---------------- SECOND ----------------
    match /second_users/{uid} {
      allow read: if isAdmin('second') || isOwner(uid);
      allow create: if isAdmin('second') || (isSignedIn() && isOwner(uid));
      allow update: if isAdmin('second') || isOwner(uid);
      allow delete: if isAdmin('second');
    }

    match /second_app_settings/{docId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');
    }

    match /second_admin_messages/{docId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');
    }

    match /second_chat_messages/{messageId} {
      allow read: if isActive('second');
      allow create: if isActive('second');
      allow update, delete: if isAdmin('second');
    }

    match /second_calculators/{modeId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');

      match /{subPath=**} {
        allow read: if isActive('second');
        allow write: if isAdmin('second');
      }
    }

    match /second_admin_games_stats/{year} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');
    }

    match /second_tables/{gameId} {
      allow read: if isActive('second');
      allow create, update, delete: if isAdmin('second');

      match /rows/{rowId} {
        allow read: if isActive('second');
        allow create, update, delete: if isAdmin('second');
      }

      match /confirmations/{uid} {
        allow read: if isAdmin('second') || (isActive('second') && isOwner(uid));
        allow create, update: if isAdmin('second') || (isActive('second') && isOwner(uid));
        allow delete: if isAdmin('second');
      }
    }

    match /second_user_games/{gameId} {
      allow read: if isAdmin('second')
                  || canReadAllUserGames('second')
                  || (isActive('second') && resource.data.ownerUid == request.auth.uid);

      allow create: if isAdmin('second')
                    || (isActive('second') && request.resource.data.ownerUid == request.auth.uid);

      allow update, delete: if isAdmin('second')
                            || (isActive('second') && resource.data.ownerUid == request.auth.uid);

      match /rows/{rowId} {
        allow read: if isAdmin('second')
                    || canReadAllUserGames('second')
                    || (isActive('second')
                        && get(/databases/$(database)/documents/second_user_games/$(gameId)).data.ownerUid == request.auth.uid);

        allow create, update, delete: if isAdmin('second')
                                      || (isActive('second')
                                          && get(/databases/$(database)/documents/second_user_games/$(gameId)).data.ownerUid == request.auth.uid);
      }

      match /confirmations/{uid} {
        allow read: if isAdmin('second')
                    || canReadAllUserGames('second')
                    || (isActive('second')
                        && get(/databases/$(database)/documents/second_user_games/$(gameId)).data.ownerUid == request.auth.uid)
                    || (isActive('second') && isOwner(uid));

        allow create, update: if isAdmin('second')
                              || (isActive('second')
                                  && get(/databases/$(database)/documents/second_user_games/$(gameId)).data.ownerUid == request.auth.uid)
                              || (isActive('second') && isOwner(uid));

        allow delete: if isAdmin('second')
                      || (isActive('second')
                          && get(/databases/$(database)/documents/second_user_games/$(gameId)).data.ownerUid == request.auth.uid);
      }
    }

    // ---------------- Moduł mapowania kolekcji ----------------
    match /modules_config/{docId} {
      allow read: if isSignedIn();
      allow write: if isAdmin('main') || isAdmin('second');
    }

    // ---------------- Kolekcje innego projektu: NEKROLOG ----------------
    // Wymaganie: pełen dostęp.
    match /Nekrolog_config/{docId} {
      allow read, write: if true;
      match /{subPath=**} { allow read, write: if true; }
    }

    match /Nekrolog_refresh_jobs/{docId} {
      allow read, write: if true;
      match /{subPath=**} { allow read, write: if true; }
    }

    match /Nekrolog_snapshots/{docId} {
      allow read, write: if true;
      match /{subPath=**} { allow read, write: if true; }
    }

    // ---------------- Legacy kolekcje (stare) ----------------
    // Można tymczasowo zostawić jako read-only dla admina na czas wygaszania.
    match /app_settings/{docId} { allow read, write: if false; }
    match /admin_messages/{docId} { allow read, write: if false; }
    match /chat_messages/{docId} { allow read, write: if false; }
    match /admin_games_stats/{docId} { allow read, write: if false; }
    match /calculators/{docId} { allow read, write: if false; match /{subPath=**} { allow read, write: if false; } }
    match /Tables/{docId} { allow read, write: if false; match /{subPath=**} { allow read, write: if false; } }
    match /UserGames/{docId} { allow read, write: if false; match /{subPath=**} { allow read, write: if false; } }
    match /players/{docId} { allow read, write: if false; match /{subPath=**} { allow read, write: if false; } }

    // Domyślnie blokuj wszystko inne
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Uwaga operacyjna
- Wersja powyżej zakłada model logowania oparty o `request.auth.uid` i profile w `main_users` / `second_users`.
- Jeżeli na ten moment aplikacja nadal działa wyłącznie na PIN (bez Firebase Auth), to przed publikacją Rules konieczne będzie przejście kodu na auth użytkownika.
