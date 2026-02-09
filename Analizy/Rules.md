# Rules dla Firestore (Collection1)

Poniżej znajduje się propozycja reguł Firestore uwzględniająca zapis do kolekcji `Collection1` (dokument `document1`) przy zachowaniu obecnych reguł dla pozostałych kolekcji:

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
    match /Collection1/{docId} {
      allow read, write: if true;
    }
  }
}
```

Uwaga: reguły powyżej są otwarte (allow read, write: if true). Jeśli chcesz je ograniczyć, można dodać warunki autoryzacji lub sprawdzania roli użytkownika.
