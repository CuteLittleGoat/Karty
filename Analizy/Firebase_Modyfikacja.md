# Firebase — wymagane modyfikacje reguł Firestore

## Dlaczego pojawia się błąd
Komunikat „Brak dostępu do kolekcji Tables. Sprawdź reguły Firestore i wielkość liter.” oznacza, że aplikacja próbuje czytać/zapisywać kolekcję `Tables`, ale Twoje reguły Firestore nie zawierają żadnej sekcji `match` dla tej kolekcji (ani jej subkolekcji `rows`). W efekcie Firestore odrzuca dostęp.

## Co zmienić w regułach
Dodaj reguły dla kolekcji `Tables` oraz jej subkolekcji `rows`. Przykład minimalnych reguł testowych (pełny dostęp, **tylko do czasu skonfigurowania auth**):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_messages/{docId} {
      allow read, write: if true;
    }
    match /app_settings/{docId} {
      allow read, write: if true;
    }
    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }
    }
  }
}
```

## Uwaga o wielkości liter
Jeśli zamiast `Tables` chcesz używać np. `tables`, musisz:
1. Zmienić nazwę kolekcji w regułach (`match /tables/{tableId}`), **oraz**
2. Upewnić się, że w pliku `config/firebase-config.js` pole `tablesCollection` ma tę samą nazwę.
