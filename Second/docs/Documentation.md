# Second — Dokumentacja techniczna

## 1. Zakres modułu
Moduł `Second` renderuje szkielet UI bez połączenia z Firebase. Zawiera dwa tryby:
- administrator (`?admin=1`),
- użytkownik (brak `?admin=1`).

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

Treści i opisy ekranowe zakładek `Aktualności`, `Czat`, `Regulamin` i `Gracze` są zgodne tekstowo z `Main/index.html`.

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
- `isAdminView` sprawdza parametr URL `admin`.
- Gdy `admin=1`, montowany jest panel admina z podglądem użytkownika.
- W przeciwnym razie montowany jest wyłącznie widok użytkownika.

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
- Przycisk ma klasę `.primary`, więc używa zielonego wariantu CTA.
- `Second/app.js` steruje widocznością przycisku: jest widoczny tylko w trybie administratora (`?admin=1`).

## 5. Style, fonty i zasady wizualne
- Fonty ładowane w `index.html`: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`.
- Komponenty używają klas zgodnych z Main (`.admin-panel-tabs`, `.admin-message`, `.admin-chat`, `.admin-players`, `.admin-games-layout`, `.chat-form`).
- Tabele `Gracze` korzystają z `players-table`, która ma te same minimalne szerokości kolumn jak w Main dla kolumn `Nazwa` i `PIN`.

## 6. Dane backendowe
W tym etapie moduł Second **nie wykonuje** operacji backendowych:
- brak odczytu z Firebase,
- brak zapisu do Firebase,
- brak nasłuchu `onSnapshot`.

Wszystkie przyciski (`Wyślij`, `Zapisz`, `Dodaj`, `Instrukcja`, `Strona1`, `Strona2`, `Odśwież`) są elementami szkieletu UI.
