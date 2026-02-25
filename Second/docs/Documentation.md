# Second — Dokumentacja techniczna

## 1. Cel modułu
Moduł `Second` dostarcza niezależny szkielet UI z dwoma trybami:
- tryb administratora (`?admin=1`),
- tryb użytkownika (bez parametru).

Implementacja nie zapisuje danych do Firebase. Logika działa lokalnie (stan w pamięci JavaScript).

## 2. Struktura plików modułu
- `Second/index.html` — layout, szablony widoków admin/user.
- `Second/styles.css` — motyw wizualny zgodny stylistycznie z `Main`.
- `Second/app.js` — obsługa zakładek, formularzy, list i synchronizacji podglądu usera.

## 3. Frontend — szczegóły implementacji

### 3.1 `index.html`
- Dokument ładuje fonty: `Cinzel`, `Cormorant Garamond`, `Inter`, `Rajdhani`.
- `#appRoot` jest punktem montażu aplikacji.
- Użyto dwóch `<template>`:
  - `#adminViewTemplate` — panel administratora + dolny podgląd użytkownika.
  - `#userViewTemplate` — samodzielny widok użytkownika.

Zakładki:
- Admin: `Aktualności`, `Czat`, `Gracze`, `Turniej`.
- User: `Aktualności`, `Czat`, `Turniej`.

Sekcje:
- `Aktualności`: admin wpisuje tekst, user ma tylko odczyt.
- `Czat`: admin usuwa wpisy, user loguje się PIN-em i dodaje wiadomość.
- `Gracze` (tylko admin): formularz dodawania gracza (nazwa, PIN 4-cyfrowy, uprawnienie `Czat`) i tabela graczy.
- `Turniej`: panel boczny z przyciskami 1/2/3 i treść „W budowie: StronaX”.

### 3.2 `styles.css`
Najważniejsze zasady:
- Ciemny motyw tła i gradienty odpowiadające estetyce Main.
- Karty `.card` z obramowaniem w odcieniu złota.
- Spójne style przycisków (`.primary`, `.secondary`, `.danger`).
- Zakładki oparte o `.admin-panel-tab` i `.is-active`.
- Responsywność przez media query `@media (max-width: 900px)`.
- Layout turniejowy: `.two-col-layout` z lewym panelem i prawą treścią.

### 3.3 `app.js`

#### Stan aplikacji
Obiekt `state` trzyma:
- `news` — aktualna treść aktualności,
- `players[]` — lista graczy `{ id, name, pin, permissions.chat }`,
- `messages[]` — wiadomości czatu `{ id, author, text }`,
- `activeTournamentPage` — aktywna strona turniejowa (`1|2|3`).

#### Przełączanie trybów
- `isAdminView` odczytuje `?admin=1` z URL.
- Admin uruchamia `setupAdminView()`.
- User uruchamia `setupUserOnlyView()`.

#### Zakładki i panele
- `setupTabs(container)` podpina kliknięcia zakładek.
- Aktywacja odbywa się przez klasę `.is-active` na tabie i panelu.

#### Aktualności
- Admin wpisuje treść w `#adminNewsInput`.
- `input` aktualizuje `state.news`.
- `syncUserMirrors()` odświeża wszystkie pola user `#userNewsOutput`.

#### Gracze
- `playerForm` dodaje gracza po walidacji PIN (`^\d{4}$`).
- `renderPlayersTable()` renderuje tabelę i obsługuje usuwanie przyciskiem `Usuń`.
- Dodane pola formularza mają atrybuty `data-*` związane z fokusem, żeby zachować spójność z analizą `Analizy/Wazne_Fokus.md` przy przyszłej rozbudowie dynamicznej.

#### Czat
- `renderChatList(container, { adminMode })` renderuje listę wiadomości.
- Admin (`adminMode: true`) ma przyciski `Usuń`.
- User loguje się PIN-em przez `#userPinForm`; autoryzacja sprawdza zgodność PIN i `permissions.chat`.
- Po autoryzacji user widzi `#userMessageForm` i może dodać wiadomość.
- `syncUserMirrors()` synchronizuje widoki admin/user dla czatu i aktualności.

#### Turniej
- `bindTournamentButtons(container)` obsługuje przyciski boczne.
- Aktualizowany tekst: `W budowie: Strona1/2/3`.

#### Bezpieczeństwo renderowania
- `escapeHtml()` sanitizuje tekst przed osadzeniem w `innerHTML`.

## 4. Backend / Firebase — stan obecny i docelowy kierunek

### 4.1 Stan obecny modułu `Second`
- Brak integracji z Firebase (zero operacji odczytu/zapisu).
- Brak importu Firebase SDK.

### 4.2 Wymagania dla niezależności `Main` i `Second`
Dla docelowej integracji oba moduły muszą mieć osobne namespace danych:
- osobna kolekcja graczy dla `Second`,
- osobna kolekcja wiadomości czatu dla `Second`,
- osobne dokumenty aktualności/regulaminu (jeżeli będą wdrażane).

### 4.3 Wnioski z analizy struktury obecnej (na bazie `Main`)
`Main` używa globalnych nazw (np. `chat_messages`, `player_access`, `admin_messages`, `UserGames`).
Przy współdzieleniu tych samych nazw oba moduły mieszałyby dane.

Aby zachować pełną niezależność:
- w `Second` trzeba użyć nowych kolekcji (np. prefiks `second_...`) albo wersji namespacowanych (`modules/second/...`).
- reguły Firestore muszą rozróżniać uprawnienia per moduł.

### 4.4 Login + hasło (w kontekście `Analizy/Projekt_Login.md`)
Przy planowanym Auth najlepiej od początku przewidzieć model:
- profil użytkownika powiązany z modułem (`module: "main" | "second"` albo osobna ścieżka modułowa),
- odseparowane role/uprawnienia na poziomie modułu,
- odseparowane rekordy czatu i graczy na poziomie modułu.

## 5. Ograniczenia aktualnej wersji
- Brak trwałości danych (refresh strony resetuje stan).
- Brak autoryzacji serwerowej (PIN tylko w warstwie UI).
- Brak walidacji backendowej i reguł bezpieczeństwa.
