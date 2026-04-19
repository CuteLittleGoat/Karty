# Analiza modułu Second: model kopii tabel `r*` dla widoku użytkownika (2026-04-19)

## Prompt użytkownika
Przeczytaj pliki:
`Analizy/Analiza_Second_blad_renderowania_sekcji_i_podwojny_PIN_czat_2026-04-17.md`
`Analizy/Analiza_Second_nowy_model_dostepu_i_renderu_po_PIN_2026-04-19.md`

Próby zrobienia widoku użytkownika "read-only" nie przyniosły skutku. Wprowadzenie nowego modelu dostępu również nie zadziałał.

Spróbuj innego podejścia. Niech robią się kopie każdej z tabeli.
Załóżmy, że admin zmienia kolejność graczy w TABELA19A.
"W tle" tworzy się kopia tabeli rTABELA19A. Tabela ta ma wszystkie pola jako TYP A (opis w `Analizy/Wazne_TypyKolumn.md`). W widoku użytkownika byłby dostęp do rTABELA19A a TABELA19A byłaby tylko w widoku admina.
W ten sposób byłby kopie wszystkich tabel (z pierwszą literą "r" od "read-only"). Przeprowadź analizę wprowadzenia takiego rozwiązania.

---

## 1) Ocena podejścia: czy model `rTABELA*` ma sens?

Tak — to podejście jest sensowne i jakościowo inne niż dotychczasowe próby.

Dotychczasowe poprawki skupiały się głównie na:
- stabilizacji renderu,
- routingu sekcji,
- izolacji czatu,
- normalizacji danych wejściowych.

Nowy pomysł przesuwa punkt ciężkości z "jak renderować jeden wspólny model" na "jak utrzymywać dwa jawnie różne modele":
- **model admina (`TABELA*`)**: edytowalny, roboczy,
- **model usera (`rTABELA*`)**: tylko do odczytu, przygotowany wcześniej.

To zmniejsza ryzyko efektów ubocznych typu:
- przypadkowe dziedziczenie zachowań edycyjnych przez user-view,
- „sticky” stanu UI między trybami,
- awarie związane z dynamicznym przełączaniem właściwości kolumn w tym samym rendererze.

---

## 2) Co dokładnie oznacza „Typ A” dla kopii `r*`

Zgodnie z opisem w `Analizy/Wazne_TypyKolumn.md`, **Typ A** to:
- render jako zwykły tekst (bez inputów),
- brak możliwości edycji,
- brak potrzeby `readonly`, bo nie ma kontrolek formularza.

Wniosek praktyczny:
- `rTABELA*` powinny być traktowane jako **warstwa prezentacyjna readonly**, a nie jako „ta sama tabela tylko z disabled inputami”.

---

## 3) Proponowany model danych (najbezpieczniejszy)

### 3.1. Struktura stanu

Dla każdej tabeli roboczej admina:
- `TABELA19A` (źródło edycji)

utrzymywać odpowiadającą tabelę readonly:
- `rTABELA19A` (snapshot do user-view, Typ A)

Analogicznie dla wszystkich tabel używanych w user-view (`TABELA10/11/12/...`, fazy grupowe, półfinał, finał, wypłaty).

### 3.2. Zasada aktualizacji

Po każdej zmianie admina w tabeli źródłowej:
1. zapis do `TABELA*`,
2. transformacja do wersji readonly,
3. zapis do `rTABELA*`.

Czyli pipeline:
`admin input -> TABELA* -> buildReadonlyTable(Typ A) -> rTABELA*`

### 3.3. Odpowiedzialność rendererów

- **Admin renderer** czyta i zapisuje tylko `TABELA*`.
- **User renderer** czyta wyłącznie `rTABELA*` (bez fallbacku do `TABELA*`).

To kluczowe: brak mieszania źródeł eliminuje całą klasę regresji.

---

## 4) Największe plusy rozwiązania

1. **Twarda separacja uprawnień**
   - user nie dotyka struktur edycyjnych.

2. **Mniejsze skomplikowanie renderu usera**
   - user-view nie musi mieć logiki blokowania edycji na poziomie pojedynczych pól.

3. **Lepsza diagnostyka**
   - łatwo porównać `TABELA19A` vs `rTABELA19A` i wskazać etap, na którym pojawia się rozjazd.

4. **Odporność na przyszłe zmiany UI admina**
   - nawet jeśli admin dostanie nowe pola/inputy, user dalej czyta stabilny model Typ A.

---

## 5) Ryzyka i koszty

1. **Duplikacja danych**
   - więcej miejsca w bazie i więcej zapisów.

2. **Spójność transakcyjna**
   - trzeba dopilnować, aby `TABELA*` i `rTABELA*` nie rozjechały się przy błędzie zapisu.

3. **Opóźnienie propagacji**
   - user może chwilowo widzieć starszy snapshot, jeśli aktualizacja `r*` będzie asynchroniczna i nieatomowa.

4. **Migracja historycznych danych**
   - trzeba zbudować `r*` dla istniejących turniejów, nie tylko dla nowych zmian.

---

## 6) Kluczowa decyzja architektoniczna: gdzie tworzyć kopie `r*`

### Wariant A — kopia w kliencie (po zmianie admina)
- Szybsze wdrożenie,
- ale większe ryzyko pominięcia ścieżek zapisu i niespójności.

### Wariant B — kopia po stronie reguły/funkcji backendowej (zalecane)
- Jedno miejsce odpowiedzialne za transformację,
- lepsza kontrola spójności,
- łatwiejszy auditing.

**Rekomendacja:** wariant B jako docelowy; wariant A tylko jako etap przejściowy.

---

## 7) Proponowany kontrakt transformacji `TABELA* -> rTABELA*`

Dla każdej tabeli:
1. wejście: pełny rekord adminowy,
2. normalizacja typów,
3. odrzucenie pól technicznych/edycyjnych,
4. mapowanie kolumn do wersji Typ A,
5. wynik: struktura przeznaczona wyłącznie do odczytu.

Dodatkowo warto dodać metadane:
- `rMeta.sourceTable = "TABELA19A"`,
- `rMeta.generatedAt`,
- `rMeta.generatedFromVersion`.

To przyspieszy debugowanie i porównania wersji.

---

## 8) Plan wdrożenia (etapowy)

### Etap 1 — Proof of Concept na jednej tabeli
- Wdrożyć mechanizm dla `TABELA19A -> rTABELA19A`.
- Przełączyć user-view tej sekcji na `rTABELA19A`.
- Zweryfikować brak regresji "sticky chat" i brak edycji.

### Etap 2 — Rozszerzenie na wszystkie tabele sekcji Tournament
- Dodać generator `r*` dla wszystkich tabel używanych przez usera.
- Ustalić wspólny schemat nazewnictwa i metadanych.

### Etap 3 — Migracja danych historycznych
- Jednorazowy skrypt backfill tworzący `r*` dla istniejących turniejów.
- Log błędów migracji (braki danych, nietypowe rekordy).

### Etap 4 — Utwardzenie
- Testy spójności (`TABELA*` zmieniona => `rTABELA*` zaktualizowana),
- monitoring opóźnienia generacji `r*`,
- ewentualny rollback plan.

---

## 9) Kryteria akceptacji dla tego podejścia

1. Po edycji admina w dowolnej tabeli `TABELA*`, odpowiadająca `rTABELA*` jest aktualizowana automatycznie.
2. User-view czyta tylko `r*` i nigdzie nie renderuje inputów edycyjnych.
3. Czat pozostaje niezależny (jak obecnie), a tabele readonly nie wpływają na lifecycle czatu.
4. Brak komunikatu „Brak dostępnych paneli...” w sytuacjach, gdzie `r*` istnieje i uprawnienia są poprawne.
5. Dla danych historycznych po migracji user widzi komplet sekcji bez ręcznych poprawek.

---

## 10) Rekomendacja końcowa

Proponowane rozwiązanie `rTABELA*` jest dobrą drogą dla Twojego celu biznesowego (stabilny readonly dla usera + pełna edycja dla admina). Największa wartość tej koncepcji to **odseparowanie modeli danych**, a nie kolejne poprawki warunków renderu.

Aby to zadziałało długofalowo, kluczowe są:
- centralny generator kopii readonly,
- jasny kontrakt transformacji na Typ A,
- migracja danych historycznych,
- twarda zasada „user czyta tylko `r*`”.


---

## Zrealizowane zmiany w kodzie (2026-04-19)

### Prompt użytkownika
Przeczytaj analizy:
- `Analizy/Analiza_Second_blad_renderowania_sekcji_i_podwojny_PIN_czat_2026-04-17.md`
- `Analizy/Analiza_Second_brak_danych_w_zakladkach_uzytkownika_2026-04-17.md`

Następnie cofnij wszystkie opisane tam zmiany i wdroż model kopii tabel readonly z prefiksem `r` dla wszystkich tabel w widoku użytkownika.

### Plik `Second/app.js`
Linia 635
- Było: brak pola `readonlyTables` w stanie turnieju.
- Jest: dodane `readonlyTables` z polami `generatedAt` i `rTournamentState` w `createTournamentDefaultState()`.

Linia 709
- Było: `normalizeTournamentState()` nie normalizował `readonlyTables`.
- Jest: normalizacja `readonlyTables` + walidacja `generatedAt` i `rTournamentState`.

Linia 716
- Było: brak generatora kopii readonly.
- Jest: nowa funkcja `buildTournamentReadonlyCopies(sourceState)` tworząca kopie `r*` (w tym `rTournamentState`) przed zapisem.

Linia 1338
- Było: `saveState()` zapisywał tylko `tournamentState`.
- Jest: `saveState()` najpierw buduje kopie `tournamentState.readonlyTables = buildTournamentReadonlyCopies(tournamentState)` i dopiero potem zapisuje dokument.

Linia 2802
- Było: render usera czytał bezpośrednio `userTournamentState`.
- Jest: render usera (poza `chatTab`) czyta wyłącznie `readonlyTables.rTournamentState`; przy braku kopii pokazuje komunikat o konieczności zapisu przez admina.

### Plik `Second/docs/README.md`
Linia 152
- Było: brak opisu modelu `r*`.
- Jest: dopisane zasady działania widoku użytkownika wyłącznie na kopiach readonly `r*`.

### Plik `Second/docs/Documentation.md`
Linia 158
- Było: dokumentacja nie opisywała generatora kopii `r*`.
- Jest: dodany opis techniczny `buildTournamentReadonlyCopies`, zapisu `readonlyTables` i twardej zasady „user czyta tylko `rTournamentState`”.

---

## Zrealizowane zmiany po zgłoszeniu błędu renderu zakładek (2026-04-19)

### Prompt użytkownika
Po wprowadzeniu zmian opisanych w `Analizy/Analiza_Second_kopie_tabel_readonly_rPrefiks_2026-04-19.md` pojawia się komunikat:
`Brak kopii readonly (r*). Poproś administratora o zapis danych turnieju.`

Po przełączeniu na `Czat` dane czatu są widoczne, ale po przejściu na inne zakładki dalej zostaje widok czatu.
Dodatkowo w widoku admina zakładka `Podział puli` potrafi pokazywać poprzednią zakładkę zamiast własnej.

### Plik `Second/app.js`
Linia 2806
- Było: walidacja `readonlyTables.rTournamentState` wykonywała się przed `syncTournamentMountVisibility(userTournamentSection)`.
- Jest: `syncTournamentMountVisibility(userTournamentSection)` wykonuje się od razu po wyjściu z gałęzi `chatTab`, jeszcze przed walidacją `readonlyTables.rTournamentState`.

Linia 1638
- Było: `render()` admina nie miał globalnego `try/catch`, więc wyjątek w trakcie renderu mógł zostawić na ekranie poprzednią sekcję.
- Jest: cały `render()` admina jest osłonięty `try/catch`; w `catch` renderowany jest komunikat błędu sekcji z nazwą `activeSection` i szczegółem błędu.

### Plik `Second/docs/README.md`
Linia 159
- Było: komunikat o braku kopii `r*` nie precyzował zachowania przy przełączeniu z `Czat`.
- Jest: dopisano, że przy braku kopii `r*` widok poprawnie przełącza się z `Czat` na panel danych i nie pozostaje na czacie.

Linia 95
- Było: sekcja `Podział puli` nie opisywała zachowania przy błędzie renderu.
- Jest: dopisano, że przy niespójnych danych pokazywany jest komunikat błędu zamiast pozostawienia poprzedniej zakładki.

### Plik `Second/docs/Documentation.md`
Linia 184
- Było: brak informacji o kolejności przełączania mountów względem walidacji `readonlyTables.rTournamentState`.
- Jest: dopisano, że mount przełączany jest przed walidacją `readonlyTables`, co eliminuje efekt „sticky chat”.

Linia 185
- Było: brak informacji o globalnej osłonie renderu admina.
- Jest: dopisano, że render admina sekcji turniejowych działa w `try/catch`, a przy wyjątku pokazuje komunikat błędu zamiast poprzedniego widoku.
