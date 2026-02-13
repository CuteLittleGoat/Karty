# Analiza checkboxów w zakładce „Statystyki”

## Prompt użytkownika (kontekst)

> Przeczytaj plik: Analizy/Statystyki.md  
> Następnie przeprowadź pełną analizę działania checkboxów w zakładce "Statystyki".  
> Wyniki zapisz w pliku Analizy/Checkboxy.md  
> 
> Działaniem oczekiwanym jest, żeby w widoku adminia administrator mógł w tabeli widocznej w zakładce Statystyki dowolnie zaznaczać i odznaczać checkboxy.  
> Domyślnie wszystkie checkboxy poza tymi w kolumnach "Waga1", "Waga2" do "Waga7" mają być zaznaczone (to zmiana dotychczasowych wymagań).  
> Stan zaznaczenia lub odznaczenia checkboxa ma się zapisywać w aplikacji (ta funkcjonalność obecnie nie działa - checkboxy po resecie aplikacji wracają do domyślnego stanu).  
> W widoku użytkownika w zakładce "Statystyki" (dostęp na kod PIN i uprawnienia - funkcjonalność obecnie działa) użytkownik widzi tylko te kolumny w tabeli, przy których administrator zostawił zaznaczony checkbox (funkcjonalność obecnie nie działa - być może dlatego, że stan checkboxów się nie zapisuje).  
> 
> Przeprowadź pełną analizę funkcjonalności, znajdź błędy, zaproponuj rozwiązania.

---

## 1. Zakres przeprowadzonej analizy

Przeanalizowano aktualną implementację checkboxów widoczności kolumn w zakładce **Statystyki** dla:
- widoku admina (zarządzanie checkboxami),
- widoku użytkownika (render tylko dozwolonych kolumn),
- trwałości stanu po restarcie aplikacji,
- domyślnych wartości stanu checkboxów.

Źródła analizy:
- `Analizy/Statystyki.md` (kontekst poprzednich zmian),
- `Main/app.js` (logika checkboxów, zapis/odczyt Firestore, render tabel),
- `Main/index.html` (struktura nagłówków tabel admin/user).

---

## 2. Jak działa to obecnie (stan faktyczny)

## 2.1. Tworzenie checkboxów (widok admina)

W `initStatisticsView(..., isAdminView: true)` dla każdego nagłówka `th` tworzony jest checkbox `.stats-column-visibility-checkbox`.

Działanie:
1. checkbox jest inicjalizowany przez:
   - `checkbox.checked = getVisibleColumnsForYear(state.selectedYear).includes(column.key)`
2. po zmianie stanu:
   - aktualizowany jest `state.visibleColumnsByYear` dla wybranego roku,
   - wywoływany jest `renderStats()`,
   - zapisywany jest dokument przez `persistYearConfig(state.selectedYear)` do `admin_games_stats/{year}`.

Wniosek: mechanizm zaznacz/odznacz jest zaimplementowany i admin może klikać dowolnie.

## 2.2. Źródło „widocznych kolumn”

Widoczność bierze się z `getVisibleColumnsForYear(year)`:
- jeśli brak wpisu lub wpis pusty -> zwracane są **wszystkie** kolumny z `STATS_COLUMN_CONFIG`,
- jeśli wpis istnieje -> filtrowane są tylko znane klucze.

To jest kluczowe miejsce dla domyślnego zachowania.

## 2.3. Zapis do backendu

`persistYearConfig(year)` zapisuje:
- `rows` (manualne wagi/punkty),
- `visibleColumns` (aktualny zestaw kolumn) 

przez:
- `db.collection("admin_games_stats").doc(yearKey).set({ ... }, { merge: true })`.

## 2.4. Odczyt z backendu

`onSnapshot` na kolekcji `admin_games_stats` ładuje dane i robi:
- `state.visibleColumnsByYear.set(yearKey, visibleColumns)`.

Jeśli pole `visibleColumns` nie istnieje, fallback to wszystkie kolumny.

## 2.5. Render w widoku użytkownika

W `renderStats()` dla user view:
- `visibleColumns = getVisibleColumnsForYear(selectedYear)`,
- nagłówki `th` są ukrywane/pokazywane przez `style.display`,
- komórki `td` są renderowane tylko dla kolumn z `visibleColumns`.

Wniosek: mechanizm „user widzi tylko zaznaczone kolumny” jest funkcjonalnie obecny i zależy bezpośrednio od `visibleColumns`.

---

## 3. Zidentyfikowane problemy względem nowych wymagań

## 3.1. BŁĄD/WYMAGANIE: zły domyślny stan checkboxów

### Oczekiwane
Domyślnie zaznaczone mają być wszystkie kolumny **poza** `Waga1..Waga7`.

### Aktualnie
Domyślnie zaznaczone są **wszystkie** kolumny (również `Waga1..Waga7`) — bo fallback w `getVisibleColumnsForYear` zwraca pełne `STATS_COLUMN_CONFIG`.

### Skutek
Niezgodność z nową specyfikacją biznesową.

---

## 3.2. BŁĄD LOGIKI: pusty zapis `visibleColumns = []` jest traktowany jak brak danych

### Aktualnie
`getVisibleColumnsForYear` ma warunek:
- `if (!Array.isArray(stored) || !stored.length) return allColumns;`

To oznacza, że:
- gdy admin odznaczy **wszystkie** checkboxy i zapisze `[]`,
- po ponownym uruchomieniu aplikacji `[]` zostanie zinterpretowane jak „brak konfiguracji”,
- i UI wraca do „wszystko zaznaczone”.

### Skutek
Użytkownik odbiera to jako „stan checkboxów się nie zapisuje po resecie”.

To jest najważniejszy praktyczny błąd trwałości.

---

## 3.3. Brak strategii migracji domyślnej konfiguracji dla istniejących lat

Po zmianie domyślnej polityki (wagi domyślnie odznaczone):
- istniejące dokumenty bez `visibleColumns` lub z legacy danymi będą nadal wpadać w dotychczasowy fallback „wszystko zaznaczone”.

Skutek:
- część lat będzie działała „po staremu”, część „po nowemu” (niespójność).

---

## 3.4. Słaba obsługa błędów zapisu

`persistYearConfig(...)` jest wywoływane jako `void persistYearConfig(...)` bez `catch` i bez statusu UI.

Skutek:
- przy błędzie zapisu (np. chwilowy problem sieci / uprawnienia Firestore) użytkownik nie dostaje informacji,
- checkbox wizualnie zmienia stan, ale po odświeżeniu wraca (wrażenie „nie zapisuje”).

---

## 4. Czy obecny kod spełnia oczekiwane działanie?

- **Admin może zaznaczać/odznaczać dowolnie:**
  - **TAK** (mechanizm jest).
- **Domyślnie wszystkie poza Waga1..Waga7 zaznaczone:**
  - **NIE** (obecnie wszystkie zaznaczone).
- **Stan checkboxów zapisywany i trwały po resecie:**
  - **CZĘŚCIOWO / NIEPEŁNIE** (działa dla niepustych zestawów, ale nie dla `[]`; dodatkowo brak sygnalizacji błędu zapisu).
- **Widok użytkownika pokazuje tylko kolumny zaznaczone przez admina:**
  - **TAK w logice renderu**, ale zależne od poprawnego/trwałego `visibleColumns`; przez problemy powyżej użytkownik może widzieć efekt „nie działa”.

---

## 5. Rekomendowane rozwiązanie (docelowe)

## 5.1. Wprowadzić jawny domyślny zestaw kolumn (bez wag)

Dodać stałą (np. `DEFAULT_VISIBLE_STATS_COLUMNS`) budowaną z `STATS_COLUMN_CONFIG`:
- zawiera wszystkie klucze, dla których `weight !== true`.

Przykład logiki:
- `const DEFAULT_VISIBLE_STATS_COLUMNS = STATS_COLUMN_CONFIG.filter(c => !c.weight).map(c => c.key);`

Następnie używać tej stałej zamiast „all columns” wszędzie tam, gdzie dziś jest fallback.

## 5.2. Rozdzielić przypadki: „brak danych” vs „pusta konfiguracja”

W `getVisibleColumnsForYear(year)`:
- jeśli `stored` nie jest tablicą -> użyj `DEFAULT_VISIBLE_STATS_COLUMNS`,
- jeśli `stored` jest tablicą (nawet pustą) -> zwróć przefiltrowaną tablicę.

Czyli usunąć warunek `|| !stored.length`.

Efekt:
- `[]` staje się poprawnym, trwałym stanem „zero kolumn zaznaczonych”.

## 5.3. Ujednolicić fallback przy odczycie snapshotu

W miejscu:
- `const visibleColumns = Array.isArray(doc.data()?.visibleColumns) ? ... : ...`

fallback powinien być:
- `DEFAULT_VISIBLE_STATS_COLUMNS` (nie wszystkie kolumny).

## 5.4. Dodać migrację legacy dokumentów

Dla dokumentów rocznych bez `visibleColumns`:
- przy pierwszym wejściu admina zapisać `visibleColumns = DEFAULT_VISIBLE_STATS_COLUMNS`,
- albo wykonać jednorazowy skrypt migracyjny.

To zapewni spójność starego i nowego zachowania.

## 5.5. Dodać obsługę błędu zapisu + status UI

Przy zmianie checkboxa:
- `persistYearConfig(...).then(...).catch(...)`,
- w `catch`: komunikat w `status` i ewentualny rollback checkboxa.

To eliminuje „ciche” niepowodzenia.

---

## 6. Proponowany plan wdrożenia (krok po kroku)

1. W `Main/app.js` zdefiniować `DEFAULT_VISIBLE_STATS_COLUMNS` (bez wag).  
2. Zmienić `getVisibleColumnsForYear` tak, aby pusta tablica `[]` nie była nadpisywana fallbackiem.  
3. Zmienić fallback w `onSnapshot` i inicjalizacji checkboxów na nową stałą domyślną.  
4. Dodać obsługę błędów `persistYearConfig` (status + opcjonalny rollback).  
5. Dodać migrację dokumentów `admin_games_stats/{year}` bez `visibleColumns`.  
6. Przetestować scenariusze E2E:
   - nowy rok bez dokumentu,
   - odznaczenie wszystkich kolumn,
   - restart aplikacji,
   - widok użytkownika po zmianie admina,
   - błąd zapisu (symulowany).

---

## 7. Testy akceptacyjne (co musi działać po poprawce)

1. **Domyślna konfiguracja (nowy rok):**
   - zaznaczone: wszystkie poza `Waga1..Waga7`.
2. **Admin odznacza wszystkie checkboxy:**
   - po restarcie nadal wszystkie odznaczone (brak resetu do „all”).
3. **Admin zaznacza tylko wybrane 3 kolumny:**
   - po restarcie dokładnie te 3 kolumny pozostają zaznaczone.
4. **Widok użytkownika:**
   - widoczne wyłącznie kolumny zaznaczone przez admina.
5. **Błąd zapisu backendu:**
   - użytkownik dostaje komunikat o niepowodzeniu; brak „cichego” rozjazdu stanu.

---

## 8. Podsumowanie końcowe

Główny problem nie dotyczy samego renderu checkboxów, tylko **logiki fallbacku i trwałości konfiguracji**:
- obecny kod domyślnie zaznacza wszystko,
- oraz traktuje pustą tablicę `visibleColumns` jak brak konfiguracji,
co razem daje efekt „po resecie wraca domyślny stan”.

Po wdrożeniu rekomendowanych zmian:
- domyślne zaznaczenie będzie zgodne z nowym wymaganiem (bez `Waga1..Waga7`),
- zapis będzie rzeczywiście trwały także dla skrajnych przypadków,
- widok użytkownika będzie poprawnie odzwierciedlał decyzje administratora.
