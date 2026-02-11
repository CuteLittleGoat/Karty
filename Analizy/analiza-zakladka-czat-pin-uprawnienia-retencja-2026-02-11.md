# Analiza wdrożenia zakładki „Czat” (PIN + uprawnienia + retencja 1 miesiąc)

## 1. Cel biznesowy
Dodać nową zakładkę **„Czat”** dla graczy, z dostępem kontrolowanym przez:
- **PIN gracza** (5 cyfr),
- **uprawnienie per gracz** (analogicznie do obecnej logiki ograniczania dostępu do „Najbliższa gra”).

Dodatkowo:
- wiadomości mają być widoczne dla uprawnionych graczy,
- każda wiadomość ma zawierać nazwę autora (z zakładki „Gracze”),
- wiadomości mają być automatycznie usuwane po ~1 miesiącu,
- administrator ma mieć opcję usuwania pojedynczej wiadomości.

---

## 2. Jak działa obecnie aplikacja (punkt wyjścia)

### 2.1. PIN i uprawnienia graczy
Aktualnie aplikacja:
- trzyma listę graczy w dokumencie Firestore `app_settings/player_access`,
- mapuje PIN → gracz po stronie klienta,
- sprawdza czy gracz ma uprawnienie do danej zakładki (`permissions.includes(tabKey)`),
- ma zdefiniowaną listę dodatkowych zakładek uprawnień w `AVAILABLE_PLAYER_TABS`.

Wniosek: mechanizm uprawnień już istnieje i można go rozszerzyć o `chatTab` bez zmiany modelu na poziomie `players[]`.

### 2.2. Aktualności
Aktualności działają przez kolekcję `admin_messages` i `onSnapshot`, więc UI już ma wzorzec „real-time” oparty o Firestore.

Wniosek: czat może użyć analogicznego podejścia real-time, ale z oddzielną kolekcją.

---

## 3. Proponowany zakres funkcjonalny „Czat”

### 3.1. UX użytkownika (strefa gracza)
1. Użytkownik klika zakładkę **Czat**.
2. Widzi bramkę PIN (jak w „Najbliższa gra”).
3. Po wpisaniu PIN:
   - jeżeli PIN należy do gracza z uprawnieniem `chatTab` → wejście do czatu,
   - w przeciwnym razie → komunikat „Błędny PIN lub brak uprawnień do zakładki Czat”.
4. Po wejściu użytkownik widzi:
   - listę wiadomości,
   - pole wpisywania,
   - przycisk „Wyślij”.
5. Po wysłaniu wiadomości inni uprawnieni użytkownicy widzą ją w czasie rzeczywistym z prefiksem autora, np. `GraczA: Cześć!`.

### 3.2. UX administratora (panel „Gracze” + moderacja)
1. W edycji uprawnień gracza pojawia się nowa pozycja:
   - `chatTab` → etykieta „Czat”.
2. W panelu admina (sekcja czatu) pojawia się opcja **usuwania pojedynczej wiadomości**.

---

## 4. Proponowany model danych (Firestore)

### 4.1. Istniejący dokument graczy
Bez zmiany struktury głównej:
- `app_settings/player_access` (pole `players[]`)
- każdy `player.permissions[]` rozszerzony o możliwą wartość `chatTab`.

### 4.2. Nowa kolekcja czatu
Kolekcja: `chat_messages`

Przykładowy dokument wiadomości:
```json
{
  "text": "Cześć!",
  "authorName": "GraczA",
  "authorId": "player-1700000000000",
  "createdAt": "serverTimestamp",
  "expireAt": "timestamp + 30 dni",
  "source": "web-player"
}
```

Pola wymagane:
- `text` (string, treść wiadomości),
- `authorName` (string, nazwa wyświetlana),
- `authorId` (string, identyfikator gracza z `player_access`),
- `createdAt` (Timestamp serwera),
- `expireAt` (Timestamp = `createdAt + 30 dni`).

Pole opcjonalne:
- `source` (np. `web-player` / `admin-panel`).

---

## 5. Retencja 1 miesiąc (automatyczne kasowanie)

## 5.1. Wariant A (zalecany i wybrany): Firestore TTL Policy
Włączasz TTL na kolekcji `chat_messages` po polu `expireAt`.

Jak działa:
- przy zapisie wiadomości ustawiasz `expireAt = createdAt + 30 dni`,
- Firestore usuwa dokumenty asynchronicznie po przekroczeniu czasu.

To jest wariant wybrany do wdrożenia.

---

## 6. Reguły dostępu (założenia dla tej aplikacji)

Ponieważ aplikacja będzie używana przez **wąskie grono zaufanych osób**, nie dokładamy złożonego bezpieczeństwa opartego o Firebase Auth.

Decyzja:
- dostęp do czatu wystarczy kontrolować przez **PIN + uprawnienie `chatTab` po stronie aplikacji**,
- reguły Firestore pozostają proste i zgodne z obecnym stylem projektu (`allow read, write: if true`),
- dodajemy tylko brakującą kolekcję `chat_messages` do reguł.

---

## 7. Indeksy Firestore

Dla prostego czatu najczęściej wystarczy:
- zapytanie: `orderBy("createdAt", "asc")` (lub `desc`) + `limit(...)`.

Jeżeli dojdą dodatkowe filtry, Firestore poda link do wymaganych indeksów w konsoli.

---

## 8. Zakres zmian w kodzie frontend (szacunek)

1. **Main/index.html**
   - dodać przycisk zakładki `Czat`,
   - dodać panel `#chatTab` z:
     - bramką PIN,
     - listą wiadomości,
     - formularzem wysyłki.

2. **Main/app.js**
   - rozszerzyć `AVAILABLE_PLAYER_TABS` o `chatTab`,
   - dodać stan sesji dla PIN czatu,
   - dodać obsługę subskrypcji `chat_messages` (`onSnapshot`),
   - dodać wysyłkę nowych wiadomości,
   - przy zapisie ustawiać `createdAt` i `expireAt` (+30 dni),
   - dodać akcję usuwania pojedynczej wiadomości dla admina.

3. **Main/styles.css**
   - style listy wiadomości i formularza,
   - style przycisku/usunięcia wiadomości w widoku admina.

4. **Panel admina / Gracze**
   - nowa etykieta uprawnienia „Czat” w modalu uprawnień.

---

## 9. Ryzyka i decyzje projektowe

### 9.1. Tożsamość po PIN
Decyzja: **wystarczy po PIN** (bez dodatkowego logowania/Auth).

### 9.2. Zmiana nazwy gracza
Działanie jest **akceptowalne**: trzymamy `authorName` denormalizowane, więc historia pokazuje nazwę z chwili wysłania wiadomości.

### 9.3. Skalowanie listy wiadomości
Przy większej liczbie wiadomości warto dodać paginację (`limit`, „wczytaj starsze”).

### 9.4. Moderacja
Dodajemy możliwość **usuwania pojedynczej wiadomości przez admina**.

---

## 10. Plan wdrożenia (krok po kroku)

1. Dodać `chatTab` do listy uprawnień graczy i UI panelu „Gracze”.
2. Dodać UI zakładki „Czat” i bramkę PIN.
3. Dodać subskrypcję oraz wysyłkę wiadomości do `chat_messages`.
4. Dodać `expireAt` podczas tworzenia wiadomości.
5. Skonfigurować TTL w Firestore dla `chat_messages.expireAt`.
6. Ustawić reguły Firestore z obsługą `chat_messages`.
7. Dodać i przetestować usuwanie pojedynczej wiadomości przez admina.
8. Test scenariuszy A/B/C (uprawniony/nieuprawniony) oraz komunikacji A↔B.

---

## 11. Ultra-dokładna instrukcja Firestore (kolekcje, dokumenty, pola, Rules)

Poniżej finalny, konkretny układ pod wdrożenie.

### 11.1. Kolekcje i dokumenty

1. **`app_settings`** (kolekcja istniejąca)
   - Dokument: **`player_access`**
   - Pole: **`players`** (tablica obiektów)

   Przykładowy pojedynczy obiekt w `players`:
   ```json
   {
     "id": "player-1700000000000",
     "name": "GraczA",
     "pin": "12345",
     "permissions": ["nextGameTab", "chatTab"]
   }
   ```

2. **`chat_messages`** (nowa kolekcja)
   - Dokumenty: auto-ID (np. `-Nxyz123...`) lub własne ID.
   - Każdy dokument to 1 wiadomość.

   Przykład dokumentu wiadomości:
   ```json
   {
     "text": "Cześć wszystkim",
     "authorName": "GraczA",
     "authorId": "player-1700000000000",
     "createdAt": "2026-02-11T19:00:00.000Z (Timestamp)",
     "expireAt": "2026-03-13T19:00:00.000Z (Timestamp)",
     "source": "web-player"
   }
   ```

### 11.2. Co dokładnie ustawia frontend przy wysyłce wiadomości

Przy `addDoc('chat_messages', ...)` ustaw:
- `text`: tekst z inputa,
- `authorName`: nazwa gracza znaleziona po PIN,
- `authorId`: ID gracza z `players[]`,
- `createdAt`: `serverTimestamp()`,
- `expireAt`: `Timestamp.now() + 30 dni` (lub liczony po stronie klienta i wysyłany jako Timestamp),
- `source`: `'web-player'`.

### 11.3. TTL (retencja)

W Firebase Console:
1. Firestore Database → zakładka TTL.
2. Add policy.
3. Collection group: `chat_messages`.
4. Timestamp field: `expireAt`.
5. Zatwierdź.

Efekt: dokumenty będą automatycznie usuwane po przekroczeniu `expireAt`.

### 11.4. Gotowe reguły Firestore do wklejenia

Poniżej pełny plik rules z dodaną kolekcją `chat_messages`, zgodny z obecnym modelem projektu:

```js
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

    match /chat_messages/{docId} {
      allow read, write: if true;
    }
  }
}
```

### 11.5. Opcja usuwania pojedynczej wiadomości przez admina

W praktyce:
- pobierasz `docId` wiadomości,
- wykonujesz `deleteDoc(doc(db, 'chat_messages', docId))` z panelu admina,
- po usunięciu `onSnapshot` automatycznie odświeży listę wszystkim użytkownikom.

---

## 12. Podsumowanie
Wdrożenie jest proste i zgodne z Twoją decyzją:
- tylko **wariant TTL (5.1)**,
- dostęp „wystarczy po PIN + uprawnienie `chatTab`”,
- zachowanie z nazwą autora jest akceptowalne,
- dodajemy ręczne usuwanie pojedynczych wiadomości przez admina,
- reguły Firestore gotowe do wklejenia (z `chat_messages`).
