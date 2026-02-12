# Karty — Dokumentacja techniczna (frontend + backend Firebase)

## 1. Cel aplikacji

Aplikacja organizuje rozgrywki karciane w modelu:
- panel administracyjny,
- widoki użytkownika,
- zarządzanie grami, statystykami, czatem, regulaminem,
- autoryzacja sekcji PIN-em gracza,
- zapis i odczyt danych z Firebase (Firestore).

Kod działa jako aplikacja webowa typu SPA w oparciu o:
- `Main/index.html` (struktura),
- `Main/styles.css` (warstwa wizualna),
- `Main/app.js` (logika i integracje),
- `config/firebase-config.js` (konfiguracja Firebase).

---

## 2. Architektura i odpowiedzialność plików

## 2.1 `Main/index.html`
Zawiera wszystkie sekcje interfejsu i kontenery dynamiczne:
- panel administratora (zakładki: aktualności, czat, regulamin, gracze, turnieje, gry admina, statystyki, gry użytkowników, gry do potwierdzenia),
- sekcje użytkownika (najbliższa gra, czat, statystyki, gry użytkowników, regulamin),
- modale szczegółów i formularze wpisów.

Kod HTML deklaruje identyfikatory wykorzystywane przez JS do:
- nasłuchiwania zdarzeń,
- renderowania list,
- aktualizacji statusów,
- sterowania bramkami PIN.

## 2.2 `Main/styles.css`
Definiuje:
- siatkę layoutu (`.grid`, `.card`, `.page`),
- system typografii i wag fontów,
- warianty przycisków (`.primary`, `.secondary`, `.danger`),
- stany aktywne zakładek (`.is-active`),
- style tabel, formularzy, modalów i statusów,
- responsywność (media queries dla mniejszych ekranów).

## 2.3 `Main/app.js`
Główny plik logiki aplikacji:
- inicjalizacja Firebase,
- warstwa dostępu do Firestore,
- renderowanie tabel/list,
- obsługa formularzy i walidacji,
- obliczanie statystyk, rankingów i podsumowań finansowych,
- separacja kontekstów admin/user,
- mechanizmy debouncingu i odświeżania.

## 2.4 `config/firebase-config.js`
Przechowuje konfigurację połączenia Firebase jako globalny obiekt używany podczas `firebase.initializeApp(...)`.

---

## 3. Backend: model danych Firestore

> Poniższy model odzwierciedla sposób użycia kolekcji i dokumentów przez logikę aplikacji.

## 3.1 Ustawienia aplikacji
- Kolekcja: `app_settings`
- Kluczowe dokumenty:
  - `player_access` — lista graczy, PIN-y, uprawnienia, flaga aktywacji,
  - dokumenty konfiguracyjne regulaminu / aktualności (zgodnie z modułami panelu).

## 3.2 Czat
- Kolekcja czatu (dedykowana dla wiadomości użytkowników).
- Rekord wiadomości zawiera m.in.:
  - `playerId`,
  - `playerName`,
  - `message`,
  - `createdAt` (timestamp).
- Administrator ma operacje moderacyjne (odczyt + usuwanie wpisów starszych niż retencja).

## 3.3 Gry administracyjne i turniejowe
- Kolekcje gier rozdzielone kontekstowo (np. „gry admina”, „turnieje”).
- Dokument gry zawiera m.in.:
  - `gameType`,
  - `gameDate` (format `YYYY-MM-DD`),
  - `name`,
  - `isClosed`,
  - `createdAt`.
- Podkolekcja `rows` dla każdej gry:
  - `playerName`,
  - `entryFee`,
  - `rebuy`,
  - `payout`,
  - `summary` (`+/-`),
  - `points`,
  - `championship`.

## 3.4 Gry użytkowników
- Analogiczny model gry + `rows`, obsługiwany przez wspólny menedżer.
- Dodatkowa warstwa statusów do procesu potwierdzania przez administratora.

## 3.5 Potwierdzenia
- Dane gier aktywnych są agregowane z odpowiednich kolekcji.
- Lista „do potwierdzenia” bazuje na filtrze statusu i kontekście źródła.

---

## 4. Inicjalizacja backendu i obsługa błędów

## 4.1 Firebase bootstrap
`getFirebaseApp()`:
- sprawdza obecność `window.firebase` oraz konfiguracji,
- inicjalizuje aplikację Firebase jednokrotnie,
- zwraca instancję używaną przez moduły aplikacji.

## 4.2 Firestore error mapping
`formatFirestoreError(error)`:
- mapuje techniczne błędy Firestore do komunikatów czytelnych w UI,
- uwzględnia przypadki typu `permission-denied`.

## 4.3 Debounce zapisów
`scheduleDebouncedUpdate(key, callback, delay)`:
- ogranicza liczbę zapisów przy częstej edycji,
- utrzymuje osobne timery dla różnych kluczy logicznych,
- poprawia wydajność i minimalizuje ryzyko konfliktów zapisu.

---

## 5. Kontrola dostępu: PIN i uprawnienia

## 5.1 Model gracza
W `player_access` każdy rekord gracza obejmuje:
- `id`,
- `name`,
- `pin` (5 cyfr),
- `permissions` (lista uprawnień do zakładek),
- `appEnabled` (aktywność konta).

## 5.2 Walidacja PIN
- `sanitizePin(value)` — filtr cyfr i limit długości,
- `isPinValid(value)` — walidacja regex 5-cyfrowego kodu,
- `generateRandomPin()` — generator PIN dla panelu admina.

## 5.3 Egzekwowanie uprawnień
`isPlayerAllowedForTab(player, tabKey)`:
- sprawdza, czy gracz ma dostęp do konkretnej zakładki,
- działa po poprawnej autoryzacji PIN.

## 5.4 Niezależne bramki PIN (stan sesji)
Aplikacja trzyma odrębne stany odblokowania dla sekcji:
- najbliższa gra,
- czat,
- statystyki,
- gry użytkowników,
- gry do potwierdzenia.

Dzięki temu autoryzacja w jednej sekcji nie implikuje automatycznie dostępu do wszystkich.

---

## 6. Moduły administracyjne — logika backendowa

## 6.1 Zakładki i odświeżanie
- `initAdminPanelTabs()` steruje aktywną zakładką i widocznością paneli.
- `initAdminPanelRefresh()` wywołuje dedykowane odświeżenie aktywnego modułu przez mapę handlerów.

## 6.2 Aktualności
`initAdminMessaging()`:
- pobiera i zapisuje wiadomość administracyjną,
- publikuje aktualność do widoku użytkownika.

## 6.3 Czat (moderacja)
`initAdminChat()`:
- pobiera listę wpisów,
- czyści wpisy starsze niż skonfigurowany okres retencji.

## 6.4 Regulamin
`initAdminRules()`:
- odczyt treści regulaminu,
- pełny zapis treści dokumentu po edycji.

## 6.5 Gracze
`initAdminPlayers()`:
- CRUD rekordów graczy,
- walidacja PIN,
- aktywacja/dezaktywacja `appEnabled`,
- edycja listy `permissions` przez modal.

## 6.6 Turnieje
`initAdminTables()`:
- tworzenie gier,
- edycja metadanych gry,
- usuwanie gry,
- zarządzanie wierszami `rows`.

## 6.7 Gry admina
`initAdminGames()`:
- lista lat,
- filtrowanie gier po roku,
- modal szczegółów,
- edycja danych finansowych i punktowych,
- przeliczanie podsumowań i rankingów.

## 6.8 Gry użytkowników (admin)
`initAdminUserGames()`:
- wykorzystuje wspólną logikę menedżera,
- daje adminowi pełen podgląd i kontrolę zgłoszeń.

## 6.9 Gry do potwierdzenia
`initAdminConfirmations()`:
- pobiera gry oczekujące,
- obsługuje zmianę statusów potwierdzenia.

---

## 7. Moduły użytkownika — logika backendowa

## 7.1 Najbliższa gra
- `initPinGate()` uruchamia bramkę PIN.
- Po autoryzacji użytkownik dostaje widok danych przypisanych do sekcji.

## 7.2 Czat użytkownika
`initChatTab()`:
- bramka PIN,
- wysyłka wiadomości,
- odświeżanie listy.

## 7.3 Gry użytkowników
`initUserGamesTab()`:
- wybór roku,
- lista gier,
- edycja detali,
- spójne reguły walidacji i obliczeń jak po stronie admina.

## 7.4 Gry do potwierdzenia
`initUserConfirmations()`:
- lista pozycji wymagających interakcji,
- zapis decyzji i aktualizacja statusu.

## 7.5 Statystyki użytkownika
`initStatisticsTab()`:
- autoryzacja,
- filtr roku,
- prezentacja tabeli i rankingu.

---

## 8. Wspólny silnik gier użytkowników

`initUserGamesManager({...})` to warstwa współdzielona przez widoki admin i user.

Zapewnia:
- ujednolicone ładowanie lat,
- listowanie gier,
- otwieranie szczegółów,
- zapis zmian,
- walidację danych,
- wyliczanie podsumowań i agregatów.

To ogranicza duplikację kodu i utrzymuje spójne reguły biznesowe niezależnie od roli.

---

## 9. Silnik statystyk i ranking

## 9.1 Konfiguracja kolumn
`STATS_COLUMN_CONFIG` opisuje dla każdej kolumny:
- typ danych,
- czy pole jest edytowalne,
- czy uczestniczy jako waga,
- wartości domyślne,
- sposób formatowania procentów i wyników.

## 9.2 Obliczenia
`initStatisticsView({...})` liczy m.in.:
- liczbę gier,
- frekwencję,
- sumy wpłat/wypłat,
- bilans `+/-`,
- procenty globalne,
- procenty względem rozegranych gier,
- wynik końcowy do rankingu.

## 9.3 Ranking
Ranking jest sortowany według wyniku końcowego i wyświetlany jako tabela miejsc.

## 9.4 Inicjalizacja wielu widoków
`initStatisticsViews()` uruchamia warianty statystyk dla różnych kontekstów i dba o wspólną konfigurację.

---

## 10. Logika gier: nazewnictwo, daty, sortowanie

- `getFormattedCurrentDate()` — data domyślna nowej gry.
- `getNextGameNameForDate()` — automatyczna propozycja nazwy przy dodawaniu.
- `parseDefaultTableNumber()` + `getNextTableName()` — wyznaczanie kolejnego numeru stołu.
- `compareByGameDateAsc()` — sortowanie po dacie i fallbackach (`createdAt`, nazwa).
- `extractYearFromDate()` — pobranie roku z daty gry.
- `normalizeYearList()` — deduplikacja i sort listy lat.
- `loadSavedSelectedGamesYear(...)` / `saveSelectedGamesYear(...)` — pamięć wyboru roku w storage.

---

## 11. Styl, fonty i zasady interfejsu

Aplikacja korzysta z fontów Google:
- Cinzel,
- Cormorant Garamond,
- Inter,
- Rajdhani.

Warstwa CSS buduje:
- hierarchię nagłówków,
- spójne odstępy i promienie kart,
- jednolite kolory akcji (primary/secondary/danger),
- stany statusów i ostrzeżeń,
- czytelne tabele danych.

Szczegółowe wartości styli i kolorów są rozwijane w `DetaleLayout.md`.

---

## 12. Przepływy końcowe danych (end-to-end)

## 12.1 Dodanie gry przez admina
1. UI zbiera dane formularza.
2. Warstwa JS waliduje pola.
3. Tworzony jest dokument gry w Firestore.
4. W razie potrzeby tworzone są dokumenty `rows`.
5. Widok listy odświeża się i sortuje wg reguł dat.

## 12.2 Edycja wiersza gracza
1. Zmiana wartości finansowych/punktowych w UI.
2. Debounced write do Firestore.
3. Przeliczenie pól pochodnych (`summary`, agregaty, ranking).
4. Render aktualnego stanu w tabeli.

## 12.3 Uwierzytelnienie PIN i praca użytkownika
1. Użytkownik podaje PIN.
2. System porównuje PIN z rekordem `player_access`.
3. Weryfikowane są `appEnabled` i `permissions`.
4. Po sukcesie sekcja zostaje odblokowana i możliwa jest dalsza interakcja.

---

## 13. Wymagania do odtworzenia aplikacji przez innego dewelopera

Aby odtworzyć system 1:1, należy zapewnić:
- identyczną strukturę DOM i identyfikatory z `index.html`,
- te same klasy i semantykę styli z `styles.css`,
- pełny zestaw funkcji inicjalizujących i helperów z `app.js`,
- zgodny model kolekcji/dokumentów Firestore,
- mapowanie błędów i komunikatów statusu,
- obsługę bramek PIN per sekcja,
- reguły obliczeń statystycznych i rankingowych,
- wspólny menedżer gier użytkowników.

Bez tych elementów aplikacja nie zachowa pełnej zgodności funkcjonalnej z bieżącą implementacją.
