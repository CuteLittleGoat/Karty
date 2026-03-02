# Second — dokumentacja techniczna

## 1. Architektura modułu
- `Second/index.html` zawiera komplet widoków admin/user w template'ach, modal instrukcji i wszystkie kontrolki UI.
- `Second/app.js` odpowiada za:
  - inicjalizację Firebase,
  - obsługę zakładek,
  - synchronizację z Firestore,
  - komunikaty statusów dla operacji Firebase,
  - obsługę odświeżania aktywnej zakładki admina.
- `Second/styles.css` definiuje motyw, layout i style komponentów.

## 2. Integracje Firestore (moduł Second)

### 2.1 Aktualności
- Kolekcja: `second_admin_messages`.
- Dokument: `admin_messages`.
- Pola zapisu:
  - `message` (string),
  - `createdAt` (serverTimestamp),
  - `source` (string).
- Admin:
  - zapis przez przycisk `#adminMessageSend`,
  - statusy w `#adminMessageStatus`.
- User:
  - podgląd przez `#latestMessageOutput`,
  - statusy w `#newsOutputStatus`.

### 2.2 Czat
- Kolekcja: `second_chat_messages`.
- Pola wiadomości:
  - `text` (string),
  - `authorName` (string),
  - `createdAt` (serverTimestamp),
  - `expireAt` (timestamp +30 dni).
- User:
  - wysyłka przez `#chatSendButton`,
  - komunikaty w `#chatStatus`,
  - render historii w `#chatMessages`.
- Admin:
  - podgląd i kasowanie pojedynczych wiadomości (`Usuń`),
  - kasowanie zbiorcze wiadomości starszych niż 30 dni (`#adminChatCleanup`),
  - statusy w `#adminChatStatus`.

### 2.3 Regulamin
- Kolekcja: `second_app_settings`.
- Dokument: `rules`.
- Pole główne: `text`.
- Admin:
  - edycja przez `#adminRulesInput`,
  - zapis przez `#adminRulesSave`,
  - statusy w `#adminRulesStatus`.
- User:
  - odczyt w `#rulesOutput`,
  - statusy w `#rulesStatus`.

### 2.4 Gracze
- Kolekcja: `second_app_settings`.
- Dokument: `player_access`.
- Odczytywane pole: `players[]`.
- Render tabel:
  - admin: `#adminPlayersTableBody` + licznik `#adminPlayersCount`,
  - user: `#playersTableBody`.
- Statusy:
  - admin: `#adminPlayersStatus`.

### 2.5 Notatki
- Kolekcja: `admin_notes`.
- Dokument: `second`.
- Pola zapisu:
  - `text`,
  - `updatedAt`,
  - `updatedBy`,
  - `module`.
- Logika zabezpiecza aktywną edycję (lokalne zmiany nie są nadpisywane snapshotem do czasu zapisu/wyjścia z pola).

## 3. Rejestr handlerów odświeżania
- `adminRefreshHandlers` to mapa `tabId -> async handler`.
- Rejestracja przez `registerAdminRefreshHandler`.
- Przycisk `#adminPanelRefresh` uruchamia handler aktywnej zakładki i aktualizuje `#adminPanelRefreshStatus`.
- Obsługiwane zakładki: `adminNewsTab`, `adminChatTab`, `adminRulesTab`, `adminNotesTab`, `adminPlayersTab`.

## 4. Komunikaty statusu operacji Firebase
W każdej sekcji podpiętej do Firebase występują komunikaty stanu:
- ładowanie danych,
- zapisywanie/wysyłanie,
- sukces,
- błąd.

Dotyczy to sekcji:
- Aktualności (admin + user),
- Czat (admin + user),
- Regulamin (admin + user),
- Gracze (admin + user),
- Notatki (admin).

## 5. Zmiany tekstowe i nazewnicze w UI
- Nagłówek modułu:
  - „Drugi moduł”,
  - „Netanjahu to ludobójca”.
- Usunięto opis pod nagłówkiem.
- Zakładka „Turniej” zmieniona na „TOURNAMENT OF POKER” (admin i user).
- W panelu bocznym turnieju zaktualizowano listę przycisków zgodnie z wymaganiami.
- W opisie notatek usunięto dopisek „(zapis w Firebase)”.

## 6. Uwagi implementacyjne
- Kod używa Firebase compat SDK (`firebase-app-compat`, `firebase-firestore-compat`).
- Inicjalizacja jest warunkowa i wyłącza akcje, jeśli konfiguracja Firebase jest niedostępna.
- Pozostaje aktywna globalna ochrona przed usunięciem ostatniego dokumentu kolekcji top-level.


- Widok użytkownika (`#userViewTemplate`) zawiera przycisk `#userPanelRefresh` i status `#userPanelRefreshStatus`; kliknięcie wykonuje odświeżenie danych aktywnej zakładki (Aktualności/Regulamin/Gracze/Czat) bez `window.location.reload()`.
