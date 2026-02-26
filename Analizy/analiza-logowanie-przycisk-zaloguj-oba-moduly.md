# Analiza problemu logowania (Main + Second)

## Prompt użytkownika
"Sprawdź poprawność działania przycisku \"Zaloguj\" w obu modułach.
Wpisuje maila oresznikak47@gmail.com (mail przypisany do admina) oraz hasło. Po naciśnięciu przycisku Zaloguj nic się nie dzieje."

## Co zostało sprawdzone
1. W obu modułach przycisk `Zaloguj` ma podpięty listener `click` i wywołuje `signInWithEmailAndPassword`.
2. Mechanizm logowania działa technicznie (przycisk reaguje), ale po próbie logowania aplikacja dodatkowo wymaga poprawnego profilu w Firestore (`main_users/{uid}` i `second_users/{uid}`) oraz zatwierdzenia (`isApproved !== false`).
3. Dla Main pojawiają się dodatkowe błędy Firestore `permission-denied` w listenerach snapshot (reguły blokują odczyty części danych).

## Wniosek
Najbardziej prawdopodobna przyczyna objawu "nic się nie dzieje" nie leży w samym przycisku, tylko w konfiguracji Firebase:

- konto może istnieć w Firebase Authentication, ale nie mieć poprawnych dokumentów profilu w obu kolekcjach:
  - `main_users/{uid}`
  - `second_users/{uid}`
- albo profile istnieją, ale mają `isApproved: false`;
- albo reguły Firestore blokują odczyt profilu lub danych inicjalnych, przez co UI nie przechodzi do właściwego widoku.

## Co poprawić w Firebase (konkret)

### 1) Struktura danych użytkownika
Dla UID użytkownika `oresznikak47@gmail.com` (UID z Firebase Auth) upewnić się, że istnieją dokumenty:

- `main_users/{uid}`
- `second_users/{uid}`

Minimalne pola (zalecane):

```json
{
  "uid": "<uid>",
  "email": "oresznikak47@gmail.com",
  "role": "admin",
  "isApproved": true,
  "isActive": true,
  "permissions": [],
  "statsYearsAccess": []
}
```

### 2) Firestore Rules (minimum dla logowania)
Reguły muszą pozwalać zalogowanemu użytkownikowi odczytać własny profil.

Przykład minimum:

```txt
function signedIn() { return request.auth != null; }
function isOwner(uid) { return signedIn() && request.auth.uid == uid; }

match /main_users/{uid} {
  allow read: if isOwner(uid);
}

match /second_users/{uid} {
  allow read: if isOwner(uid);
}
```

Jeśli moduły używają panelu admina po zalogowaniu, admin powinien mieć dodatkowe uprawnienia do odpowiednich kolekcji (tables/games/chat/itp.), inaczej UI będzie rzucał `permission-denied`.

### 3) Firebase Authentication
W Firebase Console > Authentication > Sign-in method:
- włączony provider **Email/Password**;
- konto `oresznikak47@gmail.com` istnieje i ma ustawione hasło.

## Podsumowanie
- Przycisk `Zaloguj` w obu modułach działa i wywołuje logowanie.
- Problem jest najpewniej po stronie danych/reguł Firebase (profil użytkownika i/lub reguły dostępu), przez co użytkownik nie przechodzi do widoku po zalogowaniu.
