# Main — dokumentacja techniczna

## 1. Struktura modułu
- `Main/index.html` — struktura widoku użytkownika i administratora, wszystkie kontenery tabel, paneli i modali.
- `Main/styles.css` — pełny motyw wizualny (kolory, typografia, układ, responsywność).
- `Main/app.js` — logika UI, integracja z Firebase, autoryzacja PIN/admin, obsługa tabel i modali.

## 2. Kluczowe funkcje aplikacji

### 2.1 Autoryzacja administratora
- Tryb administratora uruchamia się przy `?admin=1`.
- Mechanizm hasła administratora (SHA-256 + `admin_security/credentials.passwordHash`) jest zachowany w kodzie, ale **tymczasowo wyłączony** przez przełącznik `TEMPORARILY_DISABLE_ADMIN_PASSWORD = true`.
- Na czas testów wejście do panelu admina jest automatyczne, co ułatwia późniejsze przywrócenie pełnej autoryzacji przez zmianę jednego przełącznika.

### 2.2 Autoryzacja gracza (PIN)
- PIN ma długość 5 cyfr.
- Dostępy do sekcji Strefy Gracza są kontrolowane per gracz.
- Stan autoryzacji jest utrzymywany lokalnie (klucze `localStorage` dla poszczególnych sekcji).

### 2.3 Blokada usunięcia ostatniego dokumentu
- Wbudowana ochrona Firestore blokuje usunięcie ostatniego dokumentu tylko w kolekcjach głównych (top-level).
- Podkolekcje (np. `rows`, `confirmations`) nie są blokowane, dzięki czemu usunięcie gry z jej detalami działa poprawnie.
- Dotyczy usuwania pojedynczego dokumentu i usuwania wsadowego (`batch`).

## 3. Dane i kolekcje Firestore

### 3.1 Stałe konfiguracyjne
Moduł operuje m.in. na kolekcjach i dokumentach:
- `admin_messages/admin_messages`
- `admin_security/credentials`
- `app_settings/player_access`
- `chat_messages`
- `Tables`
- `UserGames`
- `rows` (szczegóły gry jako podkolekcja)
- `confirmations` (potwierdzenia gry)
- `admin_games_stats`
- `calculators`

### 3.2 Obszary danych
- Aktualności i regulamin.
- Lista graczy i ich uprawnienia.
- Gry admina i gry użytkowników.
- Szczegóły gier (wiersze graczy, wartości finansowe, punkty).
- Potwierdzenia gier.
- Statystyki i ranking.
- Dane kalkulatora (Tournament/Cash).

## 4. Widoki i komponenty UI

### 4.1 Widok administratora
Zakładki:
- Aktualności
- Czat
- Regulamin
- Gracze
- Gry admina
- Gry użytkowników
- Najbliższa gra
- Statystyki
- Gry do potwierdzenia
- Kalkulator

### 4.2 Widok użytkownika
Zakładki:
- Aktualności
- Regulamin
- Strefa Gracza

Strefa Gracza zawiera sekcje:
- Najbliższa gra
- Czat
- Gry do potwierdzenia
- Gry użytkowników
- Statystyki
- Kontenery tabel w Strefie Gracza wymuszają lokalne przewijanie poziome (`overflow-x: auto`) i nie pozwalają, aby siatka lub tabela wyjechała poza kartę przy mniejszym oknie (desktop i mobile).
- Czat użytkownika renderuje wspólną listę wiadomości z kolekcji `chat_messages` (autor, data, treść) i stosuje identyczne sortowanie jak panel admina (`createdAt` rosnąco, najnowsze na dole).
- Lista czatu użytkownika (`#chatMessages`) i lista moderacyjna admina (`#adminChatList`) po każdym renderze przewijają się automatycznie na dół (`scrollTop = scrollHeight`), aby domyślnie pokazać najnowsze wiadomości.

### 4.3 Modale
- Logowanie administratora.
- Instrukcja.
- Uprawnienia i lata statystyk gracza.
- Szczegóły gier (admin/user/potwierdzenia).
- Notatki do gry (tryb odczyt/edycja).
- Rebuy gracza (kalkulator).

## 5. Notatki do gry
- Notatki przed i po grze są przechowywane osobno.
- Dostępny jest domyślny szablon notatki.
- Edytor notatek obsługuje kolorowanie zaznaczonego tekstu (złoty, zielony, czerwony, biały).
- W trybie tylko do odczytu kontrolki edycji są ukryte.

## 6. Kalkulator
- Zakładka kalkulatora udostępnia dwa tryby: `Tournament` i `Cash`.
- Każdy tryb renderuje dedykowane tabele.
- Modal rebuy pozwala dynamicznie dodawać i usuwać kolumny rebuy.
- Tabele kalkulatora aktualizują wartości podsumowań na podstawie danych wejściowych.
- W trybie `Tournament` konfiguracja procentów z `Tabela5` (`table5SplitPercents`) jest synchronizowana z liczbą wierszy `Tabela2`; domyślne wartości startowe to `50`, `30`, `20`, a kolejne pola są puste.
- Wszystkie wartości kolumny `Podział puli` są edytowalne i zapisywane w dokumencie Firestore `calculators/tournament` przez `persistCalculatorModeState` (z użyciem `serializeCalculatorModeState`), dzięki czemu odtwarzają się po ponownym uruchomieniu aplikacji.
- Po renderze `Tabela5` obliczana jest suma procentów; jeżeli wynik jest różny od `100`, UI wyświetla czerwone ostrzeżenie `Nie sumuje się do 100%` (`status-text status-text-danger`).

## 7. Styl i responsywność
- Motyw oparty o zmienne CSS (`:root`) dla kolorów, fontów, odstępów i promieni.
- Układ kart i tabel oparty o grid/flex.
- Główna tabela statystyk graczy w zakładce administratora **Gry admina → Statystyki** (`.admin-games-players-stats-table`) używa zebra striping: parzyste wiersze (`tbody tr:nth-child(even)`) mają subtelne jaśniejsze tło `rgba(237, 235, 230, 0.04)`, zachowując kontrast i spójność z ciemnym motywem.
- Kontenery `.admin-games-content`, `.admin-games-section` i `.player-zone-panel` używają `min-width: 0`, aby prawidłowo się zwężać w układzie grid.
- W Strefie Gracza `.admin-table-scroll` ma wymuszone `max-width: 100%` i `overflow-x: auto`, a `.admin-data-table` ma `width: max-content` + `min-width: 100%`, dzięki czemu poziomy pasek przewijania pojawia się wewnątrz sekcji, gdy jest za mało miejsca.
- Responsywność dla mniejszych szerokości ekranu jest realizowana przez media queries.
- Wspólny język wizualny: ciemne tło, złoto-zielone akcenty, kontrastowe komunikaty statusu.
