# Analiza zmian — Statystyki (pełna dokumentacja techniczna)

## Prompt użytkownika (kontekst)

> The user was unsatisfied with the code that the agent previously produced, which can be found as the latest commit in the git history.
>
> <PREVIOUS_PR_TITLE>
> Codex-generated pull request
> </PREVIOUS_PR_TITLE>
>
> <PREVIOUS_PR_DESCRIPTION>
> Codex generated this pull request, but encountered an unexpected error after generation. This is a placeholder PR message.
> </PREVIOUS_PR_DESCRIPTION>
>
> <PREVIOUS_PR_DIFF_AND_COMMENTS>
> diff --git a/DetaleLayout.md b/DetaleLayout.md
> (File changed with 6 additions, 0 deletions)
> diff --git a/Kolumny.md b/Kolumny.md
> (File changed with 6 additions, 0 deletions)
> diff --git a/Main/app.js b/Main/app.js
> (File changed with 21 additions, 8 deletions)
> diff --git a/Main/app.js b/Main/app.js
> (File changed with 1 additions, 0 deletions)
> diff --git a/Main/app.js b/Main/app.js
> (File changed with 1 additions, 0 deletions)
> diff --git a/Main/app.js b/Main/app.js
> (File changed with 13 additions, 2 deletions)
> diff --git a/docs/Documentation.md b/docs/Documentation.md
> (File changed with 48 additions, 0 deletions)
> diff --git a/docs/README.md b/docs/README.md
> (File changed with 31 additions, 13 deletions)
> </PREVIOUS_PR_DIFF_AND_COMMENTS>
>
> Please address any inline comments on the diff, as well as any additional instructions below.
>
> Wszystkie zmiany jakich dokonałeś zapisz w pliku "Statystyki.md" w folderze Analizy. Bardzo dokładnie zapisz co było w kodzie i na co zmieniłeś oraz jak to ma działać. Pełna dokumentacja techniczna.

---

## Zakres analizy

Analiza dotyczy zmian z commita:
- `14d6ca1` — **Popraw ochronę i widoczność kolumn w zakładce Statystyki**.

Pliki objęte zmianą:
1. `Main/app.js`
2. `docs/README.md`
3. `docs/Documentation.md`
4. `DetaleLayout.md`
5. `Kolumny.md`

---

## 1) `Main/app.js` — szczegóły zmian „przed → po”

## 1.1 Kontrola dostępu do Statystyk (PIN + uprawnienia)

### Było wcześniej
W `initStatisticsTab()` po inicjalizacji wykonywane było jednorazowe sprawdzenie:
- jeżeli `getStatisticsPinGateState()` było aktywne,
- to pobierano gracza z `getStatisticsVerifiedPlayer()`,
- i jeśli gracz nie istniał albo nie miał `statsTab`, sesja była czyszczona.

Był to blok lokalny, osadzony bezpośrednio w `initStatisticsTab()`, bez możliwości wielokrotnego użycia z innych miejsc aplikacji.

### Zmieniono na
Dodano nową funkcję:
- `synchronizeStatisticsAccessState()`.

Logika nowej funkcji:
1. Gdy `getAdminMode() === true`:
   - natychmiast wywołuje `updateStatisticsVisibility()`;
   - admin widzi content bez bramki PIN.
2. Gdy użytkownik nie ma aktywnej sesji (`getStatisticsPinGateState() === false`):
   - wywołuje `updateStatisticsVisibility()` i kończy.
3. Gdy sesja istnieje:
   - pobiera `verifiedPlayer` przez `getStatisticsVerifiedPlayer()`;
   - sprawdza `isPlayerAllowedForTab(verifiedPlayer, "statsTab")`;
   - jeśli brak gracza/uprawnienia, czyści stan:
     - `setStatisticsPinGateState(false)`
     - `setStatisticsVerifiedPlayerId("")`.
4. Na końcu zawsze odświeża UI przez `updateStatisticsVisibility()`.

### Efekt działania
- Dostęp użytkownika do Statystyk jest stale synchronizowany z aktualnymi uprawnieniami.
- Odebranie uprawnienia `statsTab` działa natychmiast, bez reloadu strony.
- Logika jest centralna (jedna funkcja), więc łatwiej ją utrzymać i wywoływać z wielu miejsc.

---

## 1.2 Podmiana starego bloku walidacji w `initStatisticsTab()`

### Było wcześniej
W `initStatisticsTab()` był ręczny blok:
- `if (getStatisticsPinGateState()) { ... }`
- z ręcznym pobraniem gracza, sprawdzeniem uprawnień i czyszczeniem sesji.

### Zmieniono na
Zastąpiono cały blok jednym wywołaniem:
- `synchronizeStatisticsAccessState();`

### Efekt działania
- Uniknięto duplikacji kodu.
- Ta sama reguła dostępu działa identycznie przy starcie zakładki i przy innych triggerach.

---

## 1.3 Reakcja na zmianę uprawnień w zakładce „Gracze”

### Było wcześniej
W `initAdminPlayers()` (listener `onSnapshot` dla `app_settings/player_access`) po odczycie graczy wykonywano:
- mapowanie i normalizację graczy,
- `rebuildPinMap()`,
- `renderPlayers()`.

Nie było automatycznej synchronizacji aktywnej sesji Statystyk użytkownika.

### Zmieniono na
Po `renderPlayers()` dodano:
- `synchronizeStatisticsAccessState();`

### Efekt działania
- Zmiana checkboxa uprawnienia „Statystyki” w panelu admina wpływa od razu na dostęp użytkownika.
- Jeżeli użytkownik był wpuszczony PIN-em, ale admin odbierze uprawnienie, dostęp zostaje cofnięty natychmiast.

---

## 1.4 Widoczność kolumn w tabeli użytkownika (nagłówki + dane)

### Było wcześniej
Mechanizm `visibleColumns` działał na poziomie komórek danych (`td`) podczas renderu wierszy:
- pętla po `STATS_COLUMN_CONFIG` pomijała kolumny niewidoczne.

Problem:
- nagłówki `th` w tabeli użytkownika pozostawały widoczne,
- przez co układ nagłówka mógł nie odpowiadać faktycznie renderowanym danym.

### Zmieniono na
Dodano referencję do nagłówków:
- `const playersStatsHeaderCells = playersStatsBody.closest("table")?.querySelectorAll("thead th") ?? [];`

W `renderStats()`:
1. Widoczne kolumny liczone są wcześniej:
   - `const visibleColumns = isAdminView ? wszystkie : getVisibleColumnsForYear(state.selectedYear);`
2. Dla widoku użytkownika (`!isAdminView`):
   - iteracja po `playersStatsHeaderCells`,
   - dla każdej kolumny `cell.style.display = ""` albo `"none"` zależnie od `visibleColumns.includes(column.key)`.

### Efekt działania
- Ukrycie kolumny przez admina obejmuje teraz:
  - nagłówek (`th`),
  - komórki danych (`td`).
- Widok użytkownika jest spójny wizualnie i semantycznie.

---

## 1.5 Pusty stan tabeli a liczba widocznych kolumn (`colSpan`)

### Było wcześniej
Przy braku danych:
- `td.colSpan = STATS_COLUMN_CONFIG.length`

To ignorowało faktycznie ukryte kolumny użytkownika.

### Zmieniono na
Przy braku danych:
- `td.colSpan = visibleColumns.length || STATS_COLUMN_CONFIG.length`

### Efekt działania
- Komunikat pustego stanu rozciąga się dokładnie na liczbę kolumn, które użytkownik realnie widzi.
- Uniknięte artefakty layoutowe i niepotrzebne „puste” szerokości.

---

## 2) `docs/README.md` — zmiana instrukcji użytkownika (UI)

Sekcja „Statystyki” została przebudowana z opisu ogólnego na dokładny, krokowy flow:
1. Wejście użytkownika do Statystyk przez PIN + uprawnienia.
2. Nadanie uprawnienia przez admina (zakładka Gracze).
3. Sterowanie widocznością kolumn (checkboxy w widoku admina).
4. Rozróżnienie: co widzi admin vs co widzi użytkownik.
5. Eksport danych zgodny z widocznymi kolumnami użytkownika.

### Efekt
- Dokument odpowiada realnemu UX po zmianie.
- Użytkownik i admin mają jasne, klikalne instrukcje „co i gdzie kliknąć”.

---

## 3) `docs/Documentation.md` — rozszerzona dokumentacja techniczna

Dodano rozdział „19. Aktualizacja 2026-02-13 — Statystyki (PIN/uprawnienia + widoczność kolumn)” obejmujący:
1. Zakres kodu i dotknięte moduły.
2. Opis nowej funkcji synchronizującej dostęp.
3. Integrację z snapshotem `app_settings/player_access`.
4. Rendering widoczności kolumn user view.
5. Backend (Firestore) — brak migracji, utrzymanie schematu:
   - `admin_games_stats/{year}`
   - pola: `rows`, `visibleColumns`
   - zapis przez `set(..., { merge: true })`.

### Efekt
- Inżynier może odtworzyć logikę dostępu i renderowania bez czytania całego kodu źródłowego.

---

## 4) `DetaleLayout.md` — zapis wpływu na layout/UI

Dodano sekcję opisującą:
- ukrywanie całych kolumn w widoku użytkownika,
- wykorzystanie istniejących klas i tokenów,
- brak nowych fontów/kolorów.

### Efekt
- Rejestr layoutu pozostaje kompletny i zgodny z implementacją.

---

## 5) `Kolumny.md` — zapis wpływu na geometrię kolumn

Dodano sekcję potwierdzającą:
- dynamiczne renderowanie widoczności kolumn,
- brak zmian parametrów szerokości/wyrównań pojedynczych kolumn,
- zmienia się wyłącznie zestaw kolumn renderowanych użytkownikowi.

### Efekt
- Dokument kolumn odzwierciedla nowe zachowanie bez fałszywego sugerowania zmian szerokości.

---

## 6) Docelowy model działania po wdrożeniu (end-to-end)

1. **Admin** nadaje/odbiera uprawnienie `Statystyki` w zakładce `Gracze`.
2. Listener graczy aktualizuje stan i uruchamia `synchronizeStatisticsAccessState()`.
3. Użytkownik bez uprawnienia traci dostęp (nawet przy wcześniej wpisanym poprawnym PIN).
4. **Admin** w zakładce `Statystyki` ustawia checkboxy kolumn (per rok).
5. Konfiguracja zapisuje się do `admin_games_stats/{year}.visibleColumns`.
6. Widok użytkownika renderuje wyłącznie kolumny dozwolone:
   - nagłówki,
   - komórki danych,
   - eksport w tym samym zakresie.
7. **Admin** nadal widzi zawsze komplet kolumn.

---

## 7) Ryzyka techniczne / uwagi

1. Ukrywanie nagłówków przez `style.display = "none"` zakłada stabilną kolejność `th` zgodną z `STATS_COLUMN_CONFIG`.
2. Jeżeli w przyszłości kolejność kolumn w HTML ulegnie zmianie bez aktualizacji mapowania, możliwy jest mismatch.
3. Aktualny zapis konfiguracji kolumn jest per rok; to poprawne względem istniejącego modelu danych.

---

## 8) Podsumowanie „co było vs co jest”

- **Było**: PIN + uprawnienia sprawdzane tylko lokalnie przy inicjalizacji zakładki; brak automatycznej synchronizacji po zmianach uprawnień; user mógł mieć niespójne nagłówki vs dane po ukryciu kolumn.
- **Jest**: centralna synchronizacja dostępu, natychmiastowa reakcja na zmiany w `Gracze`, spójne ukrywanie kolumn (nagłówek + dane), poprawny `colSpan` pustego stanu, kompletna dokumentacja UI/techniczna/layout/kolumny.
