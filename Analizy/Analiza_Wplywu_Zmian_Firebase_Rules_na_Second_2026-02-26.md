# Weryfikacja: czy poprawki Firebase Rules działają także dla modułu Second

## Prompt użytkownika
> Przeczytaj analizę Analizy/Analiza_Zmiany_Firebase_Rules_2026-02-26.md i sprawdź czy poprawki zadziałają też w module Second - to jest działanie oczekiwane. W załączeni screen ustawień dokumentu admina. Zarówno dla modułów Main i Second jest role: admin (string). Załączam aktualne Rules:

## Wynik (TL;DR)
Nie w pełni. Obecne poprawki są **poprawne dla `second_users` i `second_auth_sessions`**, ale **nie obejmują większości kolekcji modułu Second** (np. `second_admin_messages`, `second_app_settings`, `second_chat_messages`, `second_admin_games_stats`, `second_calculators`, `second_user_games`).

## Co już działa dla Second
W aktualnych regułach:
- `hasSecondAdminRole()` akceptuje zarówno `role == "admin"`, jak i `isAdmin == true`.
- `validBaseUserCreateData()` dopuszcza `permissions` jako `map` lub `list`.
- `match /second_users/{uid}` i `match /second_auth_sessions/{uid}` używają `hasSecondAdminRole()`.

To oznacza, że analogiczne poprawki "rola admin + zgodność `permissions`" działają dla dokumentów użytkowników Second.

## Co nie działa (kluczowy problem)
W regułach brakuje bloków `match` dla wielu kolekcji Second, które są widoczne w bazie (ze screenów) i/lub używane konfiguracyjnie:
- `second_admin_messages`
- `second_app_settings`
- `second_chat_messages`
- `second_admin_games_stats`
- `second_calculators`
- `second_user_games`

W Firestore brak dopasowanej reguły `match` = domyślny `deny`, więc moduł Second może dostawać `permission-denied` mimo poprawnego `role: "admin"` w `second_users/{uid}`.

## Rekomendowane zmiany w Rules (symetrycznie do Main)
Dodać poniższe sekcje do `Pliki/firestore.rules`:

```rules
match /second_admin_messages/{docId} {
  allow read: if isSignedIn();
  allow write: if hasSecondAdminRole();
}

match /second_app_settings/{docId} {
  allow read: if isSignedIn();
  allow write: if hasSecondAdminRole();
}

match /second_chat_messages/{messageId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn();
  allow update, delete: if hasSecondAdminRole();
}

match /second_user_games/{gameId} {
  allow read, write: if isSignedIn();

  match /rows/{rowId} {
    allow read, write: if isSignedIn();
  }

  match /confirmations/{confirmationId} {
    allow read, write: if isSignedIn();
  }
}

match /second_admin_games_stats/{year} {
  allow read: if isSignedIn();
  allow write: if hasSecondAdminRole();
}

match /second_calculators/{type} {
  allow read, write: if isSignedIn();

  match /definitions/{versionId} {
    allow read, write: if isSignedIn();
  }

  match /placeholders/{placeholderId} {
    allow read, write: if isSignedIn();
  }

  match /sessions/{sessionId} {
    allow read, write: if isSignedIn();

    match /variables/{varDocId} {
      allow read, write: if isSignedIn();
    }

    match /calculationFlags/{flagDocId} {
      allow read, write: if isSignedIn();
    }

    match /tables/{tableId} {
      allow read, write: if isSignedIn();

      match /rows/{rowId} {
        allow read, write: if isSignedIn();
      }
    }

    match /snapshots/{snapshotId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

## Dodatkowa uwaga operacyjna
Po zmianie reguł trzeba je opublikować (`firebase deploy --only firestore:rules`) i ponownie sprawdzić scenariusze admin/user w module Second.
