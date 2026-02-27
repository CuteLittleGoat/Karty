# Second — dokumentacja techniczna

## 1. Struktura modułu
- `Second/index.html` — układ paneli administratora i użytkownika oraz modal logowania/instrukcji.
- `Second/styles.css` — wspólny motyw wizualny zgodny z modułem Main.
- `Second/app.js` — logika zakładek, integracja Firebase, admin login oraz zapis notatek administratora do Firestore.

## 2. Logika bezpieczeństwa

### 2.1 Dostęp administratora
- Dostęp administracyjny włącza się parametrem `?admin=1`.
- Mechanizm hasła admina (SHA-256 + odczyt `admin_security/credentials.passwordHash`) pozostaje w kodzie, ale jest **tymczasowo wyłączony** przez `TEMPORARILY_DISABLE_ADMIN_PASSWORD = true`.
- Na czas testów panel administratora otwiera się automatycznie, a przywrócenie pełnej autoryzacji wymaga jedynie wyłączenia przełącznika.

### 2.2 Ochrona usuwania ostatniego dokumentu
- Moduł instaluje globalną ochronę dla Firestore (`delete` i `batch.delete`).
- Blokada działa dla kolekcji głównych (top-level), aby nie dopuścić do usunięcia ich ostatniego dokumentu.
- Podkolekcje nie są obejmowane blokadą, więc operacje usuwania rekordów z detalami działają poprawnie.
- Użytkownik dostaje komunikat ostrzegawczy.

## 3. Zakres funkcjonalny

### 3.1 Administrator
- Zarządzanie aktualnościami.
- Zarządzanie czatem i czyszczenie starych wiadomości.
- Edycja regulaminu.
- Edycja zakładki Notatki z zapisem do `admin_notes/second` (Firestore).
- Zarządzanie listą graczy (CRUD).
- Zakładka turniejowa w układzie panelowym (placeholder UI).

### 3.2 Użytkownik
- Podgląd aktualności, czatu, regulaminu i listy graczy.
- Zakładka Turniej ze szkieletem nawigacji bocznej (`Strona1`, `Strona2`).

## 4. Dane i integracja Firebase
- Moduł wymaga obecności `window.firebaseConfig`.
- Aplikacja inicjalizuje Firebase tylko raz (`firebase.initializeApp`).
- Dane wykorzystywane przez moduł obejmują obszary:
  - `admin_security` (logowanie admina),
  - aktualności,
  - regulamin,
  - notatki administratora (`admin_notes/second`),
  - czat,
  - gracze.

## 5. UI i styl
- Motyw oparty o zmienne CSS z ciemnym tłem i złoto-zielonymi akcentami.
- Layout opiera się na kartach, tabelach i sekcjach panelowych.
- Widok jest responsywny dla mniejszych ekranów.
- Obszar nagłówka używa układu `.header-controls` i `.admin-toolbar`.
- Obok przycisku instrukcji pojawia się czerwony tekst informacyjny o tymczasowym pominięciu hasła admina (`.admin-password-bypass-note`).

## 8. Aktualne reguły Firestore (2026-02-27)
```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.role == "admin";
    }

    match /admin_security/{docId} {
      allow read, write: if true;
    }

    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /admin_notes/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /UserGames/{gameId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }

    match /admin_games_stats/{year} {
      allow read, write: if true;
    }

    match /players/{docId} {
      allow read, write: if true;
    }

    match /calculators/{type} {
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

    match /Nekrolog_config/{docId} {
      allow read, write: if true;
    }

    match /Nekrolog_snapshots/{docId} {
      allow read, write: if true;
    }

    match /Nekrolog_refresh_jobs/{docId} {
      allow read: if true;
      allow write: if docId == "latest";
    }
  }
}
```
