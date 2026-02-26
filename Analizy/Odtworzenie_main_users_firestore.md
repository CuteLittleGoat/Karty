# Odtworzenie kolekcji Firebase `main_users` (moduł Main)

## Prompt użytkownika (oryginalny)
> „Przypadkiem skasowałem z Firebase kolekcję main_users.
> Napisz mi plik w Analizy bardzo dokładnie jakie tam mają być kolekcje, dokumenty, field, mapy itd, żebym ręcznie wpisał jeszcze raz.”

## Prompt użytkownika (uzupełnienie)
> „Uzupełnij analizę Analizy/Odtworzenie_main_users_firestore.md
> Załączam screeny kolekcji second_users - była ona bliżniaczo podobna do skasowanej "main_users".
> Są tam dokumenty "seed-player" i "seed-admin". Napisz mi jak odtworzyć "main_user" zgodnie z tym co było przed przypadkowym skasowaniem.
> Przeczytaj też inne analizy i dokumentację.”

---

## 1) Najważniejsza korekta względem poprzedniej wersji analizy

Po porównaniu screenów `second_users` + wcześniej zapisanej struktury w repo (`Analizy/firestore-structure.txt`) należy przyjąć, że **historycznie `main_users` miało strukturę bliźniaczą do `second_users`**, czyli:

- `permissions` było **mapą (object/map)**, a nie tablicą stringów,
- był osobny obiekt `moduleAccess`,
- były pola `displayName`, `createdBy`, `userGamesScope`, `lastLoginAt`,
- seedowe dokumenty miały ID:
  - `seed-admin`
  - `seed-player`

Czyli do ręcznego odtworzenia po skasowaniu przyjmujemy **model „bliźniaczy do second_users”**.

---

## 2) Co odtworzyć 1:1

- **Kolekcja:** `main_users`
- **Dokumenty (minimum startowe):**
  - `main_users/seed-admin`
  - `main_users/seed-player`

Dodatkowo (po odtworzeniu seedów) tworzysz dokumenty dla realnych kont, najlepiej z ID równym `uid` z Firebase Auth.

---

## 3) Struktura dokumentu `main_users/{uid}` (wersja zgodna z historycznym seedem)

Pola top-level:

1. `createdAt` — **timestamp**
2. `createdBy` — **string | null**
3. `displayName` — **string**
4. `email` — **string**
5. `isActive` — **boolean**
6. `lastLoginAt` — **timestamp | null**
7. `moduleAccess` — **map**
8. `permissions` — **map**
9. `role` — **string** (`"admin"` albo `"player"`)
10. `updatedAt` — **timestamp**
11. `userGamesScope` — **string** (`"read_all"` albo `"own_only"`)

### 3.1 `moduleAccess` (map)
Dla Main ustaw:

- `main: true`

(analogicznie w `second_users` było `second: true`).

### 3.2 `permissions` (map)
Klucze boolean:

- `adminGamesTab`
- `chatTab`
- `newsTab`
- `playersTab`
- `statsTab`
- `tablesTab`
- `tournamentTab`
- `userGamesTab`

---

## 4) Dokładne wartości seedów do odtworzenia

## 4.1 `main_users/seed-admin`

```json
{
  "createdAt": "<timestamp>",
  "createdBy": null,
  "displayName": "MAIN Admin",
  "email": "main.admin@example.com",
  "isActive": true,
  "lastLoginAt": null,
  "moduleAccess": {
    "main": true
  },
  "permissions": {
    "adminGamesTab": true,
    "chatTab": true,
    "newsTab": true,
    "playersTab": true,
    "statsTab": true,
    "tablesTab": true,
    "tournamentTab": true,
    "userGamesTab": true
  },
  "role": "admin",
  "updatedAt": "<timestamp>",
  "userGamesScope": "read_all"
}
```

## 4.2 `main_users/seed-player`

```json
{
  "createdAt": "<timestamp>",
  "createdBy": "seed-admin",
  "displayName": "MAIN Player",
  "email": "main.player@example.com",
  "isActive": true,
  "lastLoginAt": null,
  "moduleAccess": {
    "main": true
  },
  "permissions": {
    "adminGamesTab": false,
    "chatTab": true,
    "newsTab": true,
    "playersTab": false,
    "statsTab": true,
    "tablesTab": false,
    "tournamentTab": true,
    "userGamesTab": true
  },
  "role": "player",
  "updatedAt": "<timestamp>",
  "userGamesScope": "own_only"
}
```

> Jeśli chcesz zachować absolutnie identyczny pattern jak na screenach `second_users`, trzymaj nazwy i typy pól dokładnie jak wyżej, zmieniając wyłącznie prefiks modułu (`main` zamiast `second`) w `moduleAccess` i semantykę displayName/email.

---

## 5) Jak odtworzyć w Firebase Console (krok po kroku)

1. Wejdź do Firestore Database.
2. Utwórz kolekcję `main_users`.
3. Dodaj dokument `seed-admin`.
4. Wprowadź wszystkie pola z sekcji **4.1** z poprawnymi typami:
   - `createdAt`, `updatedAt` jako **timestamp**,
   - `createdBy` i `lastLoginAt` jako **null**,
   - `moduleAccess` i `permissions` jako **map**,
   - pozostałe jako string/boolean.
5. Dodaj dokument `seed-player` wg sekcji **4.2**.
6. Dla realnych użytkowników (UID z Auth) twórz kolejne dokumenty `main_users/{uid}` kopiując szablon `seed-player` lub `seed-admin` i podmieniając:
   - `displayName`,
   - `email`,
   - `createdBy` (np. UID admina lub `seed-admin`),
   - zakres uprawnień i `userGamesScope`.

---

## 6) Checklista poprawności po odtworzeniu

Dla każdego dokumentu `main_users/{docId}`:

- `permissions` jest **mapą**, nie tablicą.
- Każdy klucz `permissions.*` ma typ **boolean**.
- `moduleAccess.main == true`.
- `role` jest spójne z uprawnieniami (`admin` ma wszystkie `true`).
- `userGamesScope`:
  - `read_all` dla admina,
  - `own_only` dla gracza.
- `createdAt` i `updatedAt` są timestampami.
- `lastLoginAt` może pozostać `null` do czasu pierwszego logowania.

---

## 7) Najczęstsze błędy (ważne)

1. Zapisanie `permissions` jako listy zamiast mapy.
2. Literówka w kluczach (`userGameTab` zamiast `userGamesTab`, itp.).
3. Ustawienie `moduleAccess.second` zamiast `moduleAccess.main`.
4. Ustawienie `role: "user"` mimo modelu mapowego opartego o role `admin`/`player`.
5. Zły typ `createdAt`/`updatedAt` (string zamiast timestamp).

---

## 8) Uwagi o spójności z dokumentacją i analizami

- W repo są też miejsca opisujące starszy/alternatywny model oparty o tablicę `permissions[]`.
- Do odtworzenia „jak było przed skasowaniem” przyjmujemy model bliźniaczy do `second_users` (mapowy), bo:
  - potwierdzają to Twoje screeny,
  - potwierdza to zapis struktury w `Analizy/firestore-structure.txt` (sekcje `main_users` i `second_users`).

Jeśli po odtworzeniu UI Main będzie nadal oczekiwał tablicy (a nie mapy), trzeba zrobić migrację/adapter w kodzie Main. To jest osobny krok implementacyjny i można go opisać w kolejnej analizie.
