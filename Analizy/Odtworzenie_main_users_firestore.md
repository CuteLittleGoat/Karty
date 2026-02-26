# Odtworzenie kolekcji Firebase `main_users` (moduł Main)

## Prompt użytkownika
> „Przypadkiem skasowałem z Firebase kolekcję main_users.
> Napisz mi plik w Analizy bardzo dokładnie jakie tam mają być kolekcje, dokumenty, field, mapy itd, żebym ręcznie wpisał jeszcze raz.”

---

## 1) Co dokładnie trzeba odtworzyć

W module **Main** każdy użytkownik ma 1 dokument w kolekcji:

- **Kolekcja:** `main_users`
- **Dokument:** `{uid}` (ID dokumentu musi być równe UID użytkownika z Firebase Authentication)

Czyli struktura:

- `main_users/{uid}`

Nie ma tu zagnieżdżonych subkolekcji wymaganych do działania logiki użytkowników.

---

## 2) Wymagane pola w dokumencie `main_users/{uid}`

Poniżej masz komplet pól używanych przez aplikację Main (z typami):

1. `uid` — **string**  
   - musi zawierać to samo co ID dokumentu i UID z Firebase Auth.

2. `email` — **string**  
   - email konta użytkownika.

3. `name` — **string**  
   - nazwa wyświetlana użytkownika (np. `jan.kowalski`).

4. `role` — **string**  
   - dozwolone wartości wykorzystywane w aplikacji: najczęściej `"user"` albo `"admin"`.

5. `isActive` — **boolean**  
   - `true` = konto aktywne w module Main.
   - `false` = brak dostępu do części funkcji po zalogowaniu.

6. `isApproved` — **boolean**  
   - `true` = konto zatwierdzone przez admina.
   - `false` = konto czeka na zatwierdzenie.

7. `permissions` — **array<string>**  
   - lista zakładek dostępnych przez strefę gracza.
   - możliwe wartości elementów:
     - `"playerZoneTab"`
     - `"nextGameTab"`
     - `"chatTab"`
     - `"confirmationsTab"`
     - `"userGamesTab"`
     - `"statsTab"`

8. `statsYearsAccess` — **array<number>**  
   - lista lat, które użytkownik może oglądać w statystykach (np. `[2026, 2025]`).
   - jeśli brak dostępu do statystyk, może być pusta tablica `[]`.

9. `pin` — **string**  
   - 5-cyfrowy PIN użytkownika (np. `"12345"`).
   - jeśli nie ustawiony, zapisz pusty string `""`.

10. `source` — **string**  
    - źródło utworzenia rekordu (np. `"self-register"`, `"seed-admin"`, `"seed-user"`, `"manual-recovery"`).

11. `createdAt` — **timestamp** (Firestore Timestamp)  
    - data utworzenia profilu.

12. `updatedAt` — **timestamp** (Firestore Timestamp)  
    - data ostatniej edycji profilu.

> **Ważne:** w `main_users` nie ma wymaganych map (obiektów zagnieżdżonych) do poprawnego działania — model opiera się na prostych polach + tablicach.

---

## 3) Minimalny „bezpieczny” szablon dokumentu

Wklej taki kształt (podmień wartości):

```json
{
  "uid": "<UID_Z_FIREBASE_AUTH>",
  "email": "<email_uzytkownika>",
  "name": "<nazwa_wyswietlana>",
  "role": "user",
  "isActive": false,
  "isApproved": false,
  "permissions": [],
  "statsYearsAccess": [],
  "pin": "",
  "source": "manual-recovery",
  "createdAt": "<Firestore Timestamp>",
  "updatedAt": "<Firestore Timestamp>"
}
```

---

## 4) Przykład rekordu zwykłego użytkownika

```json
{
  "uid": "abcDEF123uid",
  "email": "gracz1@example.com",
  "name": "gracz1",
  "role": "user",
  "isActive": true,
  "isApproved": true,
  "permissions": ["playerZoneTab", "nextGameTab", "chatTab"],
  "statsYearsAccess": [],
  "pin": "48302",
  "source": "manual-recovery",
  "createdAt": "2026-02-26T10:00:00Z",
  "updatedAt": "2026-02-26T10:00:00Z"
}
```

---

## 5) Przykład rekordu admina

```json
{
  "uid": "adminUID999",
  "email": "admin@example.com",
  "name": "admin",
  "role": "admin",
  "isActive": true,
  "isApproved": true,
  "permissions": [
    "playerZoneTab",
    "nextGameTab",
    "chatTab",
    "confirmationsTab",
    "userGamesTab",
    "statsTab"
  ],
  "statsYearsAccess": [2026, 2025],
  "pin": "13579",
  "source": "manual-recovery",
  "createdAt": "2026-02-26T10:00:00Z",
  "updatedAt": "2026-02-26T10:00:00Z"
}
```

---

## 6) Jak odtworzyć ręcznie w Firebase Console (krok po kroku)

1. Wejdź w **Firestore Database**.
2. Kliknij **Start collection**.
3. Podaj Collection ID: `main_users`.
4. Jako pierwszy dokument ustaw Document ID równy UID użytkownika z **Authentication**.
5. Dodaj wszystkie pola z sekcji „Wymagane pola”.
6. Powtórz dla każdego konta, które ma mieć dostęp do modułu Main.
7. Dla kont adminów ustaw:
   - `role = "admin"`
   - `isApproved = true`
   - `isActive = true`
8. Upewnij się, że:
   - `permissions` to tablica stringów,
   - `statsYearsAccess` to tablica liczb,
   - `pin` ma dokładnie 5 cyfr albo pusty string.
9. Po ręcznym odtworzeniu odśwież aplikację Main i sprawdź logowanie.

---

## 7) Kontrola poprawności po odtworzeniu

Dla każdego dokumentu `main_users/{uid}` sprawdź:

- `documentId == uid` ✅
- `uid` w polu == `uid` konta w Firebase Auth ✅
- `email` zgodny z kontem Auth ✅
- `role` ustawione (`user`/`admin`) ✅
- `isApproved` i `isActive` mają wartości bool ✅
- `permissions` jest tablicą stringów z dozwolonej listy ✅
- `statsYearsAccess` jest tablicą liczb (lat) ✅
- `pin` to pusty string albo 5 cyfr ✅
- `createdAt` i `updatedAt` istnieją ✅

---

## 8) Najczęstsze błędy przy ręcznym odtwarzaniu

1. **Zły Document ID** (niezgodny z UID z Auth) → użytkownik nie jest poprawnie kojarzony z profilem.
2. **Brak `isApproved`** → konto może zachowywać się jak oczekujące na akceptację.
3. **Brak `permissions`** albo zły typ (np. string zamiast tablicy) → brak dostępu do zakładek.
4. **`statsYearsAccess` jako stringi** zamiast liczb → problemy z filtrem lat w statystykach.
5. **`pin` jako liczba** zamiast stringa → problemy z walidacją PIN i wiodącymi zerami.

---

## 9) Dodatkowa uwaga techniczna

Aplikacja zapisuje też metadane sesji do oddzielnej kolekcji `main_auth_sessions/{uid}` po zalogowaniu. Ta kolekcja nie zastępuje `main_users` i nie odtworzy brakujących profili użytkowników.

