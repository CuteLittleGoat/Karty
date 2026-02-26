# Second — Dokumentacja techniczna

## 1. Zakres modułu
Moduł `Second` renderuje szkielet UI bez połączenia z Firebase. Zawiera dwa tryby:
- administrator (rola `admin`),
- użytkownik (rola `user`).

## 2. Pliki modułu
- `Second/index.html` — definicja struktur UI dla obu trybów (`<template id="adminViewTemplate">`, `<template id="userViewTemplate">`).
- `Second/app.js` — logika montowania widoku, przełączania zakładek oraz aktywnego stanu przycisków Turnieju.
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

Treści i opisy ekranowe zakładek `Aktualności`, `Czat`, `Regulamin` i `Gracze` są zgodne tekstowo z `Main/index.html`. W `Aktualności` pole `adminMessageInput` (admin) i `latestMessageOutput` (użytkownik) mają wysokość 25 linii (`rows="25"`).

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

### 4.1 Wybór trybu
- Po zalogowaniu `renderRoleView()` montuje panel admina z podglądem użytkownika dla roli `admin`.
- Dla roli `user` montowany jest wyłącznie widok użytkownika.
- Widok zależy wyłącznie od roli profilu, bez parametrów URL.

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
- `Second/app.js` steruje widocznością przycisku: jest widoczny tylko dla zalogowanego użytkownika z rolą `admin`.

## 5. Style, fonty i zasady wizualne
- Fonty ładowane w `index.html`: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`.
- Komponenty używają klas zgodnych z Main (`.admin-panel-tabs`, `.admin-message`, `.admin-chat`, `.admin-players`, `.admin-games-layout`, `.chat-form`).
- Tabele `Gracze` korzystają z `players-table`, która ma te same minimalne szerokości kolumn jak w Main dla kolumn `Nazwa` i `PIN`.

## 6. Dane backendowe
W module Second aktywna jest warstwa logowania Firebase Auth (logowanie, rejestracja, reset hasła, odczyt profilu `second_users/{uid}`). Pozostałe sekcje panelu (np. część przycisków admina) nadal działają jako szkielet UI.

## Logowanie Firebase Auth (Second)
- Ekran startowy to `#loginScreen` z kartą `.login-card` i przyciskami `#authLoginButton`, `#authRegisterButton`.
- W nagłówku po zalogowaniu działa pasek `.auth-session-toolbar` z akcjami `#authLogoutButton` i `#authResetPasswordButton`.
- Frontend używa Firebase Auth (compat) i funkcji:
  - `setPersistence(firebase.auth.Auth.Persistence.NONE)` aby po odświeżeniu strony wymusić ponowne logowanie (brak trwałej sesji),
  - `signInWithEmailAndPassword(email, password)` dla przycisku **Zaloguj**,
  - `signOut()` dla przycisku **Wyloguj**,
  - `sendPasswordResetEmail(email)` dla przycisku **Reset hasła**.
- Listener `onAuthStateChanged` odczytuje profil użytkownika z kolekcji `second_users/{uid}` i aktualizuje komunikat w `#authStatus`.
- Po zalogowaniu aplikacja próbuje zapisać metadane sesji do `second_auth_sessions/{uid}` (`uid`, `email`, `module`, `profileCollection`, `profileExists`, `lastLoginAt`, `updatedAt`) przez `set(..., { merge: true })`.
- Integracja jest przygotowana pod przyszłe Rules: odczyt profilu i zapis sesji są już podpięte do docelowych kolekcji, więc po zaostrzeniu reguł mechanizm będzie działał bez zmian w UI.

## Aktualny model auth (Second)
- Dodano rejestrację przez UI (`#authRegisterButton`) z `createUserWithEmailAndPassword`.
- Po rejestracji tworzony jest profil `second_users/{uid}` z domyślnym brakiem uprawnień i `isActive: false`.
- Logowanie, wylogowanie i reset hasła korzystają z Firebase Auth.
- Rejestracja zapisuje profil z domyślną rolą `user`.
- Metadata logowania zapisywana jest do `second_auth_sessions/{uid}`.


## Rules Firestore (Main + Second, wariant: `permissions` jako mapa)
Reguły dla kolekcji `main_users` i `second_users` używają walidacji `permissions is map`, a kod obu modułów zapisuje i odczytuje uprawnienia wyłącznie jako mapę klucz→bool.

## Auth flow
- Dodano walidację e-maila i hasła dla logowania/rejestracji.
- Rejestracja zapisuje użytkownika z `isApproved: false` oraz `isActive: false`; do czasu akceptacji aplikacja pokazuje stan oczekiwania.
- Pasek sesji pokazuje login (`#authCurrentUser`).
- Dodano osobny widok resetu hasła na ekranie logowania oraz wysyłkę resetu przez Firebase Auth.
- Komunikaty błędów logowania/rejestracji/odczytu profilu pokazują twardą diagnostykę (`kod` + `opis` błędu Firebase) i wskazówki dla najczęstszych błędów logowania oraz `permission-denied`.
- Błędy są logowane do `console.error` z kontekstem (`[Second][Auth][...]`) dla szybkiego debugowania.
