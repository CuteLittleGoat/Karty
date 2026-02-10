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
- `Tables` + subkolekcja `details` — zakładka Gry (domyślnie ta sama kolekcja co Turnieje, nazwa konfigurowana przez `gamesCollection`).

## 5. Zakładka Gry — pełny opis implementacji
Logika znajduje się w `initAdminGames()`.

### 5.1 Stan modułu (state)
- `years` — lista lat wyliczana automatycznie z `gameDate` dokumentów kolekcji skonfigurowanej w `gamesCollection` (domyślnie `Tables`),
- `selectedYear` — aktywny rok (zapisywany lokalnie jako ostatni wybór administratora),
- `games` — lista gier z kolekcji wskazanej przez `gamesCollection`,
- `detailsByGame` — mapa `gameId -> rows` (subkolekcja `details`),
- `detailsUnsubscribers` — aktywne subskrypcje snapshotów szczegółów,
- `activeGameIdInModal` — aktualnie otwarta gra w modalu,
- `playerOptions` — lista nazw graczy z zakładki Gracze.

### 5.2 Dodawanie gry
Przycisk `#adminGamesAddGame` dodaje dokument do kolekcji skonfigurowanej jako `gamesCollection` (domyślnie `Tables`) z polami:
- `gameType: "Cashout"`,
- `gameDate: getFormattedCurrentDate()` (zawsze bieżąca data w formacie `rrrr-MM-dd`),
- `name: getNextGameNameForDate(state.games, gameDate)`,
- `createdAt` (timestamp serwera).

Przycisk działa w bloku `try/catch/finally`:
- na czas zapisu jest blokowany (`disabled`),
- status pokazuje etap „Dodawanie gry...”,
- po sukcesie pojawia się komunikat potwierdzający z nazwą i datą gry,
- przy błędzie wyświetlany jest komunikat (osobno obsługiwany `permission-denied`, dla pozostałych błędów używany `formatFirestoreError()`).

To usuwa problem „klikam Dodaj i nic się nie dzieje”, bo administrator zawsze dostaje jednoznaczny feedback sukcesu lub błędu.

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
Zakładka `Gry` działa na kolekcji z `gamesCollection` (domyślnie `Tables`).
Zakładka `Turnieje` działa na kolekcji z `tablesCollection` (domyślnie `Tables`).
Jeśli obie wartości wskazują ten sam zbiór, oba moduły zapisują dane do tej samej kolekcji.

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


## 8. Reguły Firestore (aktualny wariant z produkcji)
Wersja reguł podana przez użytkownika (działa z domyślną konfiguracją `gamesCollection: "Tables"`):

```
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
  }
}
```

Błąd „Brak uprawnień do zapisu w kolekcji Games” wynikał z rozjazdu między nazwą kolekcji po stronie aplikacji (`Games`) i regułami (brak bloku `match /Games/{docId}`).
