# Karty — dokumentacja techniczna

## 1. Architektura plików
- `Main/index.html` — struktura UI (panel admina, zakładki, modale).
- `Main/styles.css` — pełne style (layout, typografia, komponenty, responsywność).
- `Main/app.js` — logika aplikacji (zakładki, Firebase, CRUD, obliczenia).
- `config/firebase-config.js` — konfiguracja projektu Firebase (`tablesCollection`, `gamesCollection`, klucze projektu).

## 2. Fonty, style i zasady wizualne
Aplikacja używa fontów Google:
- `Cinzel`
- `Cormorant Garamond`
- `Inter`
- `Rajdhani`

Główne zasady:
- ciemne tło noir,
- złote i zielone akcenty,
- czytelne tabele administracyjne,
- modalne okna dla operacji szczegółowych.

## 3. Panel administratora — zakładki
Panel zawiera karty:
- `adminNewsTab` (Aktualności),
- `adminPlayersTab` (Gracze),
- `adminTournamentsTab` (Turnieje),
- `adminGamesTab` (Gry).

Zakładka `adminStatsTab` została usunięta z HTML.

Przełączanie kart realizuje `initAdminPanelTabs()`.

## 4. Firebase i kolekcje
Najważniejsze kolekcje Firestore:
- `admin_messages` — wiadomości administratora,
- `app_settings/player_access` — gracze + PIN + uprawnienia,
- `Tables` + subkolekcja `rows` — zakładka Turnieje,
- `Games` + subkolekcja `details` — zakładka Gry.

## 5. Zakładka Gry — pełny opis implementacji
Logika znajduje się w `initAdminGames()`.

### 5.1 Stan modułu (state)
- `years` — lista lat wyliczana automatycznie z `gameDate` dokumentów `Games`,
- `selectedYear` — aktywny rok (zapisywany lokalnie jako ostatni wybór administratora),
- `games` — lista gier z kolekcji `Games`,
- `detailsByGame` — mapa `gameId -> rows` (subkolekcja `details`),
- `detailsUnsubscribers` — aktywne subskrypcje snapshotów szczegółów,
- `activeGameIdInModal` — aktualnie otwarta gra w modalu,
- `playerOptions` — lista nazw graczy z zakładki Gracze.

### 5.2 Dodawanie gry
Przycisk `#adminGamesAddGame` dodaje dokument do kolekcji skonfigurowanej jako `gamesCollection` (domyślnie `Games`) z polami:
- `gameType: "Cashout"`,
- `gameDate: getDefaultGameDateForYear(targetYear)`,
- `name: getNextGameNameForDate(state.games, gameDate)`,
- `createdAt` (timestamp serwera).

`targetYear` wyznaczany jest tak:
- jeśli administrator ma aktywny rok w panelu lat, używany jest ten rok,
- jeśli to pierwszy wpis i aktywny rok jeszcze nie istnieje, używany jest bieżący rok systemowy.

Dzięki temu przycisk „Dodaj” działa także przy pustych danych i od razu tworzy poprawny wpis, który generuje pierwszy rok w panelu bocznym.

### 5.3 Logika nazewnictwa „Gra X”
Użyte funkcje:
- `parseDefaultTableNumber(name)` — odczytuje numer z formatu `Gra <liczba>`.
- `getNextTableName(tables)` — znajduje pierwszy wolny numer, np. 1,2,4 => zwraca 3.
- `getNextGameNameForDate(games, gameDate)` — filtruje gry dla konkretnej daty i wylicza pierwszy wolny numer tylko dla tej daty.

To spełnia regułę: **domyślna nazwa to „Gra X”, gdzie X jest pierwszym wolnym numerem w danym dniu**.

### 5.4 Edycja tabeli gier
Wiersz gry zawiera:
- `Rodzaj Gry` (`select`: Cashout/Turniej),
- `Data` (`input type=date`),
- `Nazwa` (`input text`) + przycisk `Szczegóły`,
- przycisk `Usuń`.

Zmiany są zapisywane do Firestore (`update`).

### 5.5 Rozdzielenie Gry vs Turnieje
Zakładka `Gry` działa na kolekcji `Games`.
Zakładka `Turnieje` działa na kolekcji `Tables`.
Brak synchronizacji i współdzielonego źródła między nimi.

### 5.6 Sidebar lat w zakładce Gry
Lata są wyznaczane wyłącznie z `gameDate` dokumentów kolekcji gier:
- parsowanie roku: `extractYearFromDate()`,
- normalizacja i sortowanie malejące: `normalizeYearList()`,
- **brak ręcznego dodawania/usuwania lat** — przyciski lat pojawiają się i znikają automatycznie zależnie od danych,
- w `localStorage` zapisywany jest tylko ostatnio wybrany rok (`ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY`).

Reguła aktywności:
- gdy danych nie ma i pojawi się pierwsza gra, jej rok staje się automatycznie aktywny,
- gdy pojawiają się kolejne lata, aktywny rok nie zmienia się samoczynnie,
- jeżeli aktywny rok zniknie z danych (np. usunięto ostatnią grę), aktywowany jest pierwszy dostępny rok z listy.

### 5.7 Modal „Szczegóły gry” — tryb edycji
Tabela w modalu zawiera kolumny:
- Gracz,
- Wpisowe,
- Rebuy/Add-on,
- Wypłata,
- +/- (obliczane),
- Punkty,
- Mistrzostwo,
- Usuń.

#### Walidacja pól liczbowych
- `sanitizeIntegerInput(value)` przepuszcza tylko cyfry + opcjonalny minus na początku.
- `parseIntegerOrZero(value)` konwertuje wartość do liczby całkowitej, puste/niepoprawne => 0.

#### Obliczanie +/-
Dla każdego wiersza:
- `profit = entryFee + rebuy - payout`.
Pole jest wyświetlane jako wartość obliczana, bez ręcznej edycji.

#### Powiązanie pola Gracz z zakładką Gracze
Lista opcji pobierana jest z `app_settings/player_access`.
Jeżeli gracz został usunięty z zakładki Gracze, to:
- historyczna wartość w istniejącym wpisie zostaje,
- jest oznaczona jako `(usunięty)`,
- nie pojawia się jako normalna opcja do nowego wyboru.

### 5.8 Podsumowanie gry
Dla każdej gry z wybranego roku renderowany jest segment:
- nagłówek: `Podsumowanie gry [nazwa]`,
- pole `Pula`.

Obliczenia:
- `Pula = suma(entryFee + rebuy)` ze wszystkich wierszy szczegółów danej gry,
- `% puli = round((payout / pool) * 100)`,
- sortowanie tabeli podsumowania: malejąco po `% puli`.

### 5.9 Statystyki (wewnątrz zakładki Gry)
Dolna tabela `Statystyki` pokazuje agregaty dla aktywnego roku:
- liczba gier,
- łączna pula.

## 6. Inne kluczowe funkcje JS
- `initAdminPlayers()` — zarządzanie graczami i PIN,
- `initAdminNews()` — wysyłka wiadomości,
- `initAdminTables()` — zarządzanie zakładką Turnieje,
- `initLatestMessage()` — odczyt ostatniej wiadomości,
- `initInstructionModal()` — ładowanie instrukcji do modala,
- `initPinGate()` — wejście PIN po stronie gracza.

## 7. Jak odtworzyć aplikację tylko na podstawie dokumentacji
1. Zbuduj HTML z panelem admina (zakładki, tabele, modale) i strefą gracza.
2. Dodaj style noir/gold/green oraz siatkę kart i komponenty tabel.
3. W JS dodaj:
   - wykrywanie trybu admin (`?admin=1`),
   - przełączanie zakładek,
   - moduły Firebase i snapshot listeners,
   - pełny CRUD dla Gracze, Turnieje, Gry,
   - logikę nazw `Gra X` zależnie od daty,
   - modal szczegółów gry z walidacją liczb,
   - obliczenia `+/-`, `Pula`, `% puli`, sortowanie,
   - agregaty roczne w sekcji Statystyki (w zakładce Gry).
4. Podłącz `firebase-app-compat` i `firebase-firestore-compat`.
