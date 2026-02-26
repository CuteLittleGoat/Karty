# Analiza prefiksów kolekcji i Firestore Rules (Main + Second)

## Prompt użytkownika
"Przeprowadź dokładną analizę kodu całej aplikacji i sprawdź czy wszędzie w kodzie zapis odbywa się do kolekcji zaczynającej się od nazwy \"main_\" lub \"second_\" oraz czy Rules są poprawne. Jeżeli Rules wymagają aktualizacji to zapisz pełen kod Rules gotowy do przeklejenia do Firebase."

## Dodatkowa modyfikacja (2026-02-26)
Użytkownik poprosił o przygotowanie pełnego, gotowego do wklejenia zestawu Firestore Rules, który jawnie zawiera reguły `allow read, write: if true;` dla wskazanych kolekcji oraz specjalne reguły dla kolekcji `Nekrolog_*`.

## Pełne Firestore Rules (gotowe do wklejenia)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /main_admin_games_stats/{docId} {
      allow read, write: if true;
    }

    match /main_admin_messages/{docId} {
      allow read, write: if true;
    }

    match /main_auth_sessions/{docId} {
      allow read, write: if true;
    }

    match /main_calculators/{docId} {
      allow read, write: if true;
    }

    match /main_chat_messages/{docId} {
      allow read, write: if true;
    }

    match /main_tables/{docId} {
      allow read, write: if true;
    }

    match /main_user_game/{docId} {
      allow read, write: if true;
    }

    match /main_users/{docId} {
      allow read, write: if true;
    }

    match /second_admin_games_stats/{docId} {
      allow read, write: if true;
    }

    match /second_admin_messages/{docId} {
      allow read, write: if true;
    }

    match /second_auth_sessions/{docId} {
      allow read, write: if true;
    }

    match /second_calculators/{docId} {
      allow read, write: if true;
    }

    match /second_chat_messages/{docId} {
      allow read, write: if true;
    }

    match /second_tables/{docId} {
      allow read, write: if true;
    }

    match /second_user_game/{docId} {
      allow read, write: if true;
    }

    match /second_users/{docId} {
      allow read, write: if true;
    }

    // --- NEKROLOG ---
    match /Nekrolog_config/{docId} {
      allow read, write: if true;
    }

    match /Nekrolog_snapshots/{docId} {
      allow read, write: if true;
    }

    // Zapis wyłącznie do stałego ID dokumentu, aby uniknąć
    // narastania nowych dokumentów przy każdym refreshu.
    match /Nekrolog_refresh_jobs/{docId} {
      allow read: if true;
      allow write: if docId == "latest";
    }
  }
}
```
