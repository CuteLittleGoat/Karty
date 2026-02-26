# Second — Dokumentacja techniczna

## 1. Zakres modułu
Moduł `Second` renderuje UI i zawiera bramkę hasła administratora opartą o Firestore. Zawiera dwa tryby:
- administrator (tylko po poprawnym haśle dla `?admin=1`),
- użytkownik (brak `?admin=1` lub anulowanie/błędne hasło).

## 2. Pliki modułu
- `Second/index.html` — definicja struktur UI dla obu trybów (`<template id="adminViewTemplate">`, `<template id="userViewTemplate">`).
- `Second/app.js` — logika bramki hasła admina (Firestore + własny modal logowania), montowania widoku, przełączania zakładek oraz aktywnego stanu przycisków Turnieju.
- `Second/styles.css` — warstwa wizualna zgodna z motywem modułu Main (te same fonty, tokeny i klasy komponentów).
- `Second/Kolumny.md` — opis kolumn i minimalnych szerokości w układach tabelarycznych używanych w module Second.

## 3. UI odwzorowane z Main

### 3.1 Zakładki administratora
Panel administratora zawiera zakładki:
- `Aktualności`,
- `Czat`,
- `Regulamin`,
- `Gracze`,
- `Turniej`.

Treści i opisy ekranowe zakładek `Aktualności`, `Czat`, `Regulamin` i `Gracze` są zgodne tekstowo z `Main/index.html`.
- W zakładce `Aktualności` pole `Treść wiadomości` (`#adminMessageInput`) ma wysokość 25 linii (`rows="25"`).
- W widoku użytkownika pole `Najnowsze` (`#latestMessageOutput`) ma wysokość 25 linii (`rows="25"`).

### 3.2 Zakładki użytkownika
Widok użytkownika zawiera zakładki:
- `Aktualności`,
- `Czat`,
- `Regulamin`,
- `Gracze`,
- `Turniej`.

W zakładce `Czat` zastosowano teksty PIN i formularza wiadomości zgodne z modułem Main (`Wpisz PIN z uprawnieniem Czat...`, `Twoja wiadomość`, `Wyślij`).

### 3.3 Turniej
Sekcja `Turniej` (admin i user) używa układu analogicznego do sekcji typu `Gry użytkowników`:
- lewy panel boczny `Panel`,
- środkowy obszar treści z komunikatem `Strona w budowie`,
- przyciski boczne: `Strona1` i `Strona2`.

## 4. Logika JavaScript (`Second/app.js`)

### 4.1 Wybór trybu i bramka hasła
- `shouldRequestAdminAccess()` sprawdza parametr URL `admin`.
- Gdy `admin=1`, `resolveAdminMode()` próbuje pobrać z Firestore dokument `admin_security/credentials` i pole `passwordHash`.
- Użytkownik dostaje modal logowania z polem hasła (`input[type="password"]`) i przyciskami `Zaloguj` / `Anuluj`.
- Poprawne hasło (lub SHA-256 hasła zgodne z `passwordHash`) otwiera panel admina.
- Błędne hasło pokazuje komunikat w modalu i ponawia formularz logowania (bez systemowego `alert`).
- Anulowanie modala wymusza widok użytkownika.
- Jeśli Firestore zwróci błąd odczytu hasła, moduł używa wartości awaryjnej `window.firebaseConfig.adminPasswordHash` lub `window.firebaseConfig.adminPassword`.
- Brak hasła w obu źródłach pokazuje komunikat w modalu; użytkownik może ponowić próbę lub anulować przejście do widoku admina.

### 4.2 Przełączanie zakładek
- `setupTabs(...)` obsługuje aktywację przycisków i paneli dla:
  - zakładek admina (`.admin-panel-tab` / `.admin-panel-content`),
  - zakładek użytkownika (`.tab-button` / `.tab-panel`).
- Stan aktywny realizowany jest klasą `is-active`.

### 4.3 Przyciski Turnieju
- `setupTournamentButtons(container)` aktywuje wybrany przycisk `Strona1`/`Strona2` przez przełączanie klasy `is-active`.
- Przyciski nie uruchamiają operacji backendowych.

### 4.4 Podgląd użytkownika w trybie admin
- `createUserViewNode({ withWrapperCard: false })` usuwa opakowanie karty (`.card`) i renderuje użytkownika wewnątrz `#userPreviewMount`.
- Kontener podglądu w `Second/index.html` używa klas `card user-preview-card next-game-card`, więc zajmuje pełną szerokość siatki admina (`grid-column: 1 / -1`).
- Usunięto dodatkowy nagłówek „Podgląd widoku użytkownika”, dzięki czemu dolny panel w adminie startuje od razu od zakładek użytkownika i wizualnie odpowiada układowi z `Main/index.html`.

### 4.5 Przycisk „Instrukcja” w rogu aplikacji
- W nagłówku (`.page-header`) działa kontener `.admin-toolbar` z przyciskiem `#secondInstructionButton`.
- Przycisk ma klasę `.secondary`, więc używa zielonego wariantu pomocniczego takiego samego jak w `Main/index.html`.
- `Second/app.js` steruje widocznością przycisku: jest widoczny tylko po pozytywnej weryfikacji hasła administratora.

## 5. Style, fonty i zasady wizualne
- Fonty ładowane w `index.html`: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`.
- Komponenty używają klas zgodnych z Main (`.admin-panel-tabs`, `.admin-message`, `.admin-chat`, `.admin-players`, `.admin-games-layout`, `.chat-form`).
- Tabele `Gracze` korzystają z `players-table`, która ma te same minimalne szerokości kolumn jak w Main dla kolumn `Nazwa` i `PIN`.

## 6. Dane backendowe
Moduł Second wykonuje pojedynczy odczyt backendowy dla bramki administratora:
- odczyt Firestore dokumentu `admin_security/credentials`,
- odczyt pola `passwordHash` (typ `string`) do walidacji hasła wpisanego w modalu logowania,
- fallback do `window.firebaseConfig.adminPasswordHash` lub `window.firebaseConfig.adminPassword`, gdy odczyt Firestore zakończy się błędem.

Pozostałe przyciski (`Wyślij`, `Zapisz`, `Dodaj`, `Instrukcja`, `Strona1`, `Strona2`, `Odśwież`) nadal są elementami szkieletu UI i nie zapisują danych.

## Nagłówek (Second)
- W nagłówku pozostawiono kontener `.header-controls` z paskiem `.admin-toolbar` i przyciskiem `#secondInstructionButton`.
- Panel logowania e-mail/hasło został usunięty z `Second/index.html`, a moduł nie ładuje już biblioteki `firebase-auth-compat.js`.
- `Second/app.js` nie zawiera logowania Firebase Auth; bramka admina korzysta z odczytu Firestore i lokalnej walidacji hasła/SHA-256.

## 7. Globalna ochrona kolekcji Firestore przed wyzerowaniem
- W `Second/app.js` podczas `getFirebaseApp()` uruchamiane jest `installFirestoreDeleteProtection(firebaseApp)`.
- Mechanizm patchuje `DocumentReference.delete()` oraz `WriteBatch.delete()/commit()`, aby przerwać operację usuwania, która skasowałaby ostatni dokument kolekcji.
- Weryfikacja wykonywana jest przez `isRemovingLastDocument(...)` (odczyt `limit(n+1)` dla kolekcji i listy rekordów oznaczonych do usunięcia).
- Przy próbie niedozwolonego usunięcia UI pokazuje `alert`, a kod rzuca błąd `LAST_DOCUMENT_DELETE_BLOCKED`.
- To przygotowuje moduł Second na przyszłe podpięcie kolejnych ekranów do Firebase bez ryzyka usunięcia całej kolekcji przez UI.
