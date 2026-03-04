# Analiza porównawcza modułów Main i Second – zakładka „Gracze” (tabele)

## Prompt użytkownika
"Przeprowadź analizę porównawczą modułu Main i Second pod kątem tworzenia tabel. W module Second istnieje tabela w zakładce "Gracze" (bez danych). W module Main też istnieje taka zakładka. Przy próbie modyfikacji szerokości kolumn w Main wszystko się rozjechało. Sprawdź dokładnie czym się różnią te dwie zakładki w tych dwóch modułach."

## Zakres
Porównanie dotyczy:
- struktury HTML zakładki „Gracze”,
- logiki JS renderującej wiersze,
- stylów CSS wpływających na szerokości kolumn i zachowanie tabeli.

## Kluczowe różnice

### 1) Charakter tabeli: edytowalna (Main) vs podglądowa (Second)
- **Main**: tabela jest pełnym edytorem danych graczy (inputy, checkboxy, przycisk „Losuj” PIN, edycja uprawnień, usuwanie, dodawanie).
- **Second**: tabela jest praktycznie podglądem (render tekstowy, brak edycji inline, brak przycisku „Dodaj” w tej sekcji).

Wniosek: w Main komórki zawierają bardziej złożone komponenty UI, więc szerokości kolumn mają dużo większą wrażliwość na zmiany CSS.

### 2) Różnice w HTML zakładki „Gracze”
- **Main**:
  - `#adminPlayersSummary`, `#adminPlayersBody`, przycisk `#adminAddPlayer`.
  - `<tbody>` startowo puste.
- **Second**:
  - `#adminPlayersCount`, `#adminPlayersTableBody`.
  - Startowy placeholder „Brak graczy. Dodaj”.
  - Brak przycisku dodawania gracza w tej sekcji.

Wniosek: już na poziomie DOM są inne identyfikatory i inny flow inicjalizacji.

### 3) Różnice w JS (renderowanie i źródło danych)
- **Main** (`renderPlayers`):
  - Buduje wiersz z kontrolkami formularza:
    - kol. 1: checkbox `appEnabled`,
    - kol. 2: input `name`,
    - kol. 3: input `pin` + przycisk „Losuj”,
    - kol. 4: tagi uprawnień + przycisk „Edytuj”,
    - kol. 5: przycisk „Usuń”.
  - Obsługuje walidację PIN i unikalność PIN.
  - Utrzymuje fokus po rerenderze.
- **Second** (`renderPlayersTable`):
  - Renderuje proste wartości tekstowe (`textContent`) do 5 komórek,
  - brak inputów i akcji per wiersz,
  - deduplikacja graczy po identyfikatorze,
  - fallback „Brak graczy.”

Wniosek: Main generuje dużo szerszą zawartość w kolumnach 3–5 (szczególnie kolumna uprawnień), więc ma naturalnie większe wymagania szerokości.

### 4) Najważniejsze różnice CSS powodujące „rozjeżdżanie” w Main

#### Main (agresywne narzucenie szerokości)
- `.players-table { min-width: 1320px; }`
- globalnie dla tej tabeli: `white-space: nowrap` na `th` i `td`.
- twarde `min-width` dla każdej kolumny:
  - kol.1: 100px,
  - kol.2: 280px,
  - kol.3: 180px,
  - kol.4: 620px,
  - kol.5: 130px.

Suma minimalnych szerokości kolumn = **1310px** (+ padding/border), co niemal wymusza szerokość ~1320px+.

#### Second (znacznie lżejsze ograniczenia)
- `.players-table { min-width: 700px; }`
- brak `white-space: nowrap` dla całej players-table,
- jawnie ustawione tylko:
  - kol.2: `min-width: 30ch`,
  - kol.3: `min-width: 5ch`.

Wniosek: tabela w Second ma dużo większą elastyczność i mniejsze ryzyko „rozjazdu” przy zmianach.

### 5) Dodatkowa różnica globalna
- **Main**: `.admin-data-table` ma jawnie `table-layout: auto`.
- **Second**: `.admin-data-table` nie wymusza `table-layout: auto` (domyślna wartość przeglądarki).

To samo w sobie nie musi psuć layoutu, ale w Main łączy się z dużą liczbą `min-width` + `nowrap`, co zwiększa efekt sztywnej tabeli.

## Dlaczego Main „się rozjeżdża”, a Second nie
Najbardziej prawdopodobna przyczyna to kombinacja w Main:
1. bardzo duże i precyzyjne `min-width` na kolumnach,
2. `white-space: nowrap` na całej tabeli graczy,
3. bogata, interaktywna zawartość komórek (inputy, przyciski, badge’e),
4. wysoki `min-width` całej tabeli (1320px).

W Second te czynniki praktycznie nie występują jednocześnie, dlatego tam tabela zachowuje się stabilniej.

## Rekomendacja (kierunek)
Jeśli celem jest zachowanie funkcjonalności Main i jednocześnie stabilny layout:
- ograniczyć `white-space: nowrap` tylko do kolumn, które naprawdę tego wymagają,
- zmniejszyć `min-width` kolumny 4 (uprawnienia) albo dopuścić zawijanie badge’y,
- zostawić większą elastyczność tabeli (zamiast twardego sumowania min-width blisko 1320px),
- testować przy węższych viewportach z aktywnym poziomym scrollowaniem kontenera.
