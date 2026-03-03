# Analiza 3 — Duplikaty nazw graczy i możliwość przejścia na unikatowy znacznik

## Prompt użytkownika
> Przeczytaj analizę: Analizy/Main_Analiza1_Przycisk_IloscPotwierdzonych.md
>
> Wprowadź funkcjonalność.
> Dodatkowo przeprowadź analizę i zapisz jej wyniki odnośnie punktu: "Duplikaty nazw graczy: obecny system opiera się na playerName, więc gracze o identycznych nazwach będą traktowani łącznie." - Sprawdź wszystkie miejsca w kodzie gdzie coś odnosi się do nazwy gracza i zobacz czy nie można tego zamienić na jakiś unikatowy znacznik. Sprawdź też czy obecne Firebase to umożliwia. Możesz użyć pól "Placeholder" jeżeli są potrzebne.

## Zakres sprawdzenia
- Kod modułu `Main` (głównie `Main/app.js`), ze szczególnym naciskiem na:
  - liczenie i prezentację potwierdzeń,
  - identyfikację gracza po PIN / ID,
  - statystyki i agregacje,
  - kalkulator i dane historyczne.
- Schemat Firestore z pliku `Analizy/Wazne_firestore-schema.txt`.

## Wyniki analizy

### 1) Miejsca, gdzie system używa `playerName` jako klucza logicznego
1. **Potwierdzenia obecności (`confirmations`)**
   - liczenie `potwierdzeni/zapisani` i mapowanie potwierdzeń do wierszy gry bazuje obecnie na `playerName`.
   - skutki: dwóch różnych graczy o tej samej nazwie jest traktowanych jako jedna osoba przy liczeniu statusu.

2. **Statystyki roczne i ranking**
   - mapy i agregacje statystyk używają `playerName` jako klucza (`Map` po nazwie).
   - skutki: dane graczy o identycznych nazwach sklejają się w jeden rekord statystyczny.

3. **Sekcje kalkulatora (`table2Rows`, `table9Rows`)**
   - wpisy mają `playerName`, ale brak trwałego `playerId`.
   - skutki: brak jednoznacznego rozróżnienia rekordów między osobami o tej samej nazwie.

4. **Konfiguracja manualnych wag/statystyk**
   - przechowywanie ręcznych pól jest również powiązane z `playerName`.

### 2) Co już dziś jest unikatowe
- W `app_settings/player_access` każdy gracz ma stabilne pole `id` oraz `pin`.
- W potwierdzeniach obecności dokumenty są zapisywane pod `doc(verifiedPlayer.id)` (unikatowe ID gracza), więc **warstwa Firestore już obsługuje unikatowy identyfikator**.

### 3) Czy obecne Firebase to umożliwia?
**Tak.**
- Firestore nie blokuje dodania nowych pól do dokumentów (`playerId`, `playerRefId`, `statsPlayerId` itp.).
- Obecna struktura już zawiera `id` gracza w `player_access`, więc można bez migracji kolekcji bazowej zacząć propagować identyfikator do:
  - `rows` (detale gier),
  - wpisów kalkulatora,
  - rekordów statystycznych/manualnych.

### 4) Rekomendowany kierunek (bezpieczny etapami)
1. **Etap 1 (kompatybilność wsteczna):**
   - dodać pole `playerId` do nowych/edytowanych wierszy gry (`rows`).
   - podczas odczytu używać klucza: `playerId` (jeśli istnieje), w przeciwnym razie fallback do `playerName`.

2. **Etap 2 (potwierdzenia):**
   - dopasowanie statusu potwierdzenia po `playerId`; `playerName` zostawić tylko jako pole prezentacyjne.

3. **Etap 3 (statystyki):**
   - mapy agregacji i rankingu przełączyć z `playerName` na `playerId`.
   - manualne wpisy wag przechowywać pod `playerId` + opcjonalnie `playerNameSnapshot` do czytelności.

4. **Etap 4 (kalkulator i dane historyczne):**
   - dodać `playerId` do struktur `table2Rows/table9Rows` i przeliczeń.

### 5) Placeholdery
Jeżeli trzeba wdrożyć to bez pełnej migracji od razu, można użyć pól przejściowych (placeholder), np.:
- `playerRefId` (docelowy identyfikator),
- `playerNameSnapshot` (nazwa do wyświetlenia),
- `migrationVersion` (oznaczenie dokumentów po aktualizacji).

## Wniosek końcowy
Ryzyko duplikatów nazw jest realne i występuje w kilku obszarach aplikacji. Technicznie obecne Firebase/Firestore w pełni pozwala przejść na unikatowy znacznik (ID gracza), a najbezpieczniejsza ścieżka to migracja etapowa z fallbackiem do `playerName` dla starych rekordów.
