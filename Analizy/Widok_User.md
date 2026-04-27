# Widok_User — analiza zbiorcza (2026-04-27)

## Prompt użytkownika (kontekst bieżącego zadania)
Przeczytaj poniższe analizy:

Analizy/Analiza_Second_kopie_tabel_readonly_rPrefiks_2026-04-19.md
Analizy/Analiza_Second_widok_uzytkownika_zakladki_readonly_2026-04-20.md

Następnie przygotuj nowy plik analizy zawierający WSZYSTKIE dane z dwóch powyższych plików.
Od pierwszego promptu w Analizy/Analiza_Second_widok_uzytkownika_zakladki_readonly_2026-04-20.md do końcowej analizy w Analizy/Analiza_Second_kopie_tabel_readonly_rPrefiks_2026-04-19.md

Nowy plik ma się nazywać Analizy/Widok_User.md

Na końcu nowego pliku przygotuj aktualną pełną analizę wdrożenia rozwiązania.

Celem jest następujące działanie:

1. Admin w widoku admina uzupełnia tabele
2. Równolegle tworzą się tabele "tylko do odczytu".
3. Admin widzi tylko tabele do edycji
4. Admin dodaje gracza, nadaje mu uprawnienia i PIN
5. Gracz otwiera aplikację w widoku użytkownika
6. Gracz ma dostęp do zakładek, które nie wymagają PIN (np. Regulamin)
7. Gracz wpisuje PIN i wchodzi w "Tournament of Poker"
8. Pojawiają się zakładki na panelu bocznym zgodnie z nadanymi uprawnieniami na dany PIN
9. Gracz widzi tylko tabele "tylko do odczytu".

Sprawdź czy aktualny kod aplikacji tak działa. Nic nie zmieniaj w kodzie, przeprowadź tylko pełną analizę i przygotuj plik Analizy/Widok_User.md, który będzie zawierać pełne wymagania, próby wdrożenia i changelog zmian.

---

## Część A — pełna zawartość analizy z 2026-04-20

# Analiza modułu Second: niepełne dane w zakładkach panelu bocznego użytkownika (2026-04-20)

## Prompt użytkownika
Zweryfikuj poprawność wyświetlania zawartości zakładek w panelu bocznym w widoku użytkownika w module Second.

Kroki jakie wykonuję:
1. Wchodzę na stronę: https://cutelittlegoat.github.io/Karty/Second/index.html
2. Wpisuję PIN w polu "Wpisz PIN gracza, aby odblokować zakładkę Tournament of Poker."
3. Wchodzę na zakładkę "Tournament of Poker"
4. Domyślnie włącza się zakładka "Losowanie stołów" na panelu bocznym (pierwsza z listy).
5. Wyświetlają się częściowe dane zakładki "Losowanie stołów".
6. Klikam zakładkę "Faza Grupowa".
7. Wciąż wyświetlają się częściowe dane zakładki "Losowanie stołów".
8. Klikam zakładkę "Czat".
9. Wyświetlają się dane zakładki "Czat".
10. Klikam na zakładkę "Wpłaty".
11. Wyświetlają się częściowe dane zakładki "Losowanie stołów".

Przez "częściowe dane" rozumiem, że wyświetla się tylko pierwsza tabela (tam gdzie jest status OPŁACONE lub DO ZAPŁATY). Nie ma tabel z nazwami stołów, kolumną "Łączna suma".

Przeczytaj analizę Analizy/Analiza_Second_kopie_tabel_readonly_rPrefiks_2026-04-19.md

A następnie przeprowadź nową analizę i zapisz jej wyniki w nowym pliku. Sprawdź czemu tak się zachowuje widok użytkownika. Sprawdź czy wszystkie tabele mają swoje kopie "read-only" czy dla testu została zrobiona tylko jedna.

---

## 1) Co faktycznie renderuje widok użytkownika dla „Losowanie stołów”

W kodzie render usera dla sekcji `draw` (Losowanie stołów) jest zdefiniowany jako **jedna tabela** z kolumnami:
- Gracz,
- Status wpłaty,
- Stół.

To jest dokładnie ten fragment, który użytkownik opisuje jako „pierwsza tabela” (status OPŁACONE / DO ZAPŁATY).

Wniosek: to nie jest „ucięty render” tej sekcji — to jest obecna, docelowa implementacja sekcji `draw` po stronie user-view.

---

## 2) Dlaczego po kliknięciu „Faza Grupowa” / „Wpłaty” dalej wygląda jak „Losowanie stołów”

W aktualnym kodzie to zachowanie wynika z logiki uprawnień i nawigacji:

1. Po wpisaniu PIN-u dla usera budowany jest `allowedSections` na podstawie pola `permissions` gracza.
2. Jeśli bieżąca sekcja nie należy do `allowedTargets`, render wraca do pierwszej dozwolonej sekcji (`allowedSections[0]`).
3. Najczęściej pierwszą dozwoloną sekcją bywa `draw`, więc UI wizualnie „wraca” do Losowania stołów.

To tłumaczy scenariusz:
- klik na sekcję bez uprawnienia nie przełącza widoku,
- ale klik na `chatTab` działa, bo `chatTab` ma osobny warunek uprawnienia (`chatAllowed`) i osobny mount.

Czyli: problem jest zgodny z obecną logiką gate’owania sekcji i może sprawiać wrażenie „przyklejenia” do Losowania stołów, kiedy gracz nie ma uprawnień do innych sekcji.

---

## 3) Czy wszystkie tabele mają kopie `read-only`?

### Krótka odpowiedź
**Nie. Nie ma pełnych kopii dla wszystkich tabel.**

### Co jest zrobione obecnie
Funkcja `buildTournamentReadonlyCopies()` zapisuje:
- `rTournamentState` (duża kopia całego stanu turnieju),
- dodatkowo tylko wybrane aliasy: `rTABELA10`, `rTABELA11`, `rTABELA12`, `rTABELA16`, `rTABELA19A`, `rTABELA22`, `rTABELA23`.

Brakuje jawnych kopii m.in. dla:
- `TABELA13`, `TABELA14`, `TABELA15`,
- `TABELA17`, `TABELA18`, `TABELA19`, `TABELA19B`,
- `TABELA21`, `TABELA22A`, `TABELA23A`.

Dodatkowo w renderze usera i tak wykorzystywany jest przede wszystkim `readonlyTables.rTournamentState`, a nie komplet odseparowanych `rTABELA*` dla każdej tabeli.

Wniosek: obecny model to „hybryda”: jedna pełna kopia (`rTournamentState`) + kilka testowych/wybranych aliasów `rTABELA*`, a nie pełne 1:1 kopie wszystkich tabel.

---

## 4) Dlaczego użytkownik nie widzi tabel z nazwami stołów i „Łączna suma”

Tabela z polami „NAZWA” i „ŁĄCZNA SUMA” jest w kodzie admina (sekcja Losowanie stołów) i nie jest renderowana w user-view `draw`.

Czyli brak tych tabel u użytkownika nie wynika z awarii danych `read-only`, tylko z różnicy implementacji widoków admin vs user.

---

## 5) Podsumowanie przyczyny

1. Widok usera dla `draw` celowo pokazuje tylko uproszczoną tabelę (status + stół), co wygląda jak „częściowe dane” względem widoku admina.
2. Kliknięcia w sekcje bez uprawnień kończą się pozostaniem/powrotem do pierwszej dozwolonej sekcji (często `draw`), dlatego wizualnie wygląda jak brak przełączenia.
3. Kopie `read-only` nie są pełne per tabela — zrobiono pełny snapshot `rTournamentState` i tylko część aliasów `rTABELA*`.

---

## 6) Odpowiedź na pytanie użytkownika „czy wszystkie tabele mają kopie read-only?”

**Nie, wszystkie tabele nie mają własnych kopii `rTABELA*`.**

Zrobiona jest jedna główna kopia stanu (`rTournamentState`) i tylko wybrane kopie tabel pomocniczych. To oznacza, że wdrożenie „kopii każdej tabeli” zostało wykonane częściowo, nie w pełnym zakresie 1:1 dla całego Tournament of Poker.

---

## Zrealizowane zmiany w kodzie (2026-04-20)

### Prompt użytkownika
Przeczytaj analizę `Analizy/Analiza_Second_widok_uzytkownika_zakladki_readonly_2026-04-20.md` i wprowadź rekomendowane poprawki, aby po PIN użytkownik widział tylko dozwolone zakładki, a po wejściu w zakładkę miał kopie tabel z widoku admina (z zachowaniem dotychczasowego działania `Czat`).

### Plik `Second/app.js`
Linia 751
- Było:    `buildTournamentReadonlyCopies()` zapisywał tylko część aliasów `r*` (`rTABELA10`, `rTABELA11`, `rTABELA12`, `rTABELA16`, `rTABELA19A`, `rTABELA22`, `rTABELA23`).
- Jest:    `buildTournamentReadonlyCopies()` zapisuje pełny zestaw aliasów `r*` dla wszystkich tabel user-view (`rTABELA10..rTABELA23A`) obok `rTournamentState`.

Linia 2845
- Było:    sekcja user `draw` renderowała tylko jedną tabelę (`Gracz`, `Status wpłaty`, `Stół`).
- Jest:    sekcja user `draw` renderuje także kopie kart stołów (readonly `NAZWA`, readonly `ŁĄCZNA SUMA`, tabela `GRACZ/BUY-IN`) tak jak w panelu admina.

### Plik `Second/docs/README.md`
Linia 165
- Było:    opis user-view sugerował pełne readonly głównie dla sekcji innych niż `Losowanie stołów`.
- Jest:    doprecyzowano, że także `Losowanie stołów` i `Wpłaty` pokazują pełny readonly podgląd kopii danych admina.

Linia 166
- Było:    brak informacji o kartach stołów w user `Losowanie stołów`.
- Jest:    dodano informację, że user widzi kopię tabeli przypisań oraz kart stołów (`NAZWA`, `ŁĄCZNA SUMA`, `BUY-IN`).

### Plik `Second/docs/Documentation.md`
Linia 158
- Było:    dokumentacja mówiła o `rTournamentState` i niepełnym opisie aliasów `r*`.
- Jest:    dodano pełną listę aliasów `r*` generowanych przez `buildTournamentReadonlyCopies()`.

Linia 160
- Było:    brak informacji, że user `draw` ma także readonly karty stołów.
- Jest:    dopisano techniczny opis pełnego renderu user `draw` (tabela przypisań + karty stołów).

## Poprawka po regresji „Brak dostępnych paneli...” (2026-04-20)

### Prompt użytkownika
Po wdrożeniu zmian użytkownik z PIN `11111` widzi przyciski sekcji, ale w sekcjach (poza `Czat`) pojawia się komunikat `Brak dostępnych paneli Tournament of Poker dla tego PIN-u.`

### Plik `Second/app.js`
Linia 2646
- Było: brak dedykowanego helpera do liczenia dozwolonych sekcji na podstawie sesji PIN.
- Jest: dodano `getUserTournamentAllowedTargets()` liczący cele z `userTournamentSession.allowedSections` + `chatTab`.

Linia 2771
- Było: `navigateToUserTournamentSection()` budował `allowedTargets` inline.
- Jest: `navigateToUserTournamentSection()` korzysta z `getUserTournamentAllowedTargets()`.

Linia 2799
- Było: `renderUserTournament()` opierał decyzję o braku paneli na wyniku `renderTournamentButtonsForPlayer()`.
- Jest: `renderUserTournament()` wywołuje `renderTournamentButtonsForPlayer()` tylko do renderu sidebaru, a decyzję o dostępie do sekcji opiera na `getUserTournamentAllowedTargets()`, co usuwa fałszywy komunikat „Brak dostępnych paneli...”.

### Plik `Second/docs/Documentation.md`
Linia 170
- Było: brak opisu źródła prawdy dla listy dozwolonych sekcji podczas renderu.
- Jest: dopisano, że render sekcji korzysta z `getUserTournamentAllowedTargets()` (kontrakt sesji), a nie z samego renderu przycisków sidebaru.

### Plik `Second/docs/README.md`
Linia 162
- Było: brak informacji o eliminacji regresji z komunikatem „Brak dostępnych paneli...”.
- Jest: dopisano, że jeśli użytkownik widzi przyciski sekcji z uprawnień PIN, sekcje renderują dane bez tego komunikatu.

## Poprawka po kolejnym zgłoszeniu regresji paneli (2026-04-20)

### Prompt użytkownika
W user-view po przełączaniu sekcji (poza `Czat`) dalej pojawia się komunikat `Brak dostępnych paneli Tournament of Poker dla tego PIN-u.`

### Plik `Second/app.js`
Linia 2765
- Było: `navigateToUserTournamentSection()` walidował cele tylko na podstawie `getUserTournamentAllowedTargets()`.
- Jest: dodano fallback `visibleSidebarTargets` (widoczne przyciski sidebaru), gdy sesyjna lista jest chwilowo pusta.

Linia 2809
- Było: `renderUserTournament()` opierał się na `getUserTournamentAllowedTargets()` oraz mógł pokazać fałszywy brak paneli przy chwilowym rozjeździe stanu sesji.
- Jest: `renderUserTournament()` używa `sidebarAllowedTargets` jako fallbacku do sesji, dzięki czemu jeśli przyciski są widoczne, sekcje renderują dane zamiast komunikatu o braku paneli.

### Plik `Second/docs/Documentation.md`
Linia 170
- Było: opis renderu sekcji wskazywał tylko źródło sesyjne.
- Jest: dopisano fallback do widocznych przycisków sidebaru.

### Plik `Second/docs/README.md`
Linia 162
- Było: brak wzmianki o fallbacku na widoczne przyciski.
- Jest: dopisano, że dostęp sekcji działa z sesji PIN i awaryjnie z widocznych przycisków panelu bocznego.

---

## Część B — pełna zawartość analizy z 2026-04-19

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

---

## Część C — aktualna pełna analiza wdrożenia rozwiązania (stan kodu na 2026-04-27)

### 1) Weryfikacja celu biznesowego 1–9 (status)

1. **Admin uzupełnia tabele** — **TAK**.
   - Admin pracuje na głównym stanie turniejowym (`tournamentState`) i sekcjach adminowych.

2. **Równolegle tworzą się tabele readonly** — **TAK (przy zapisie)**.
   - Kopie readonly powstają podczas `saveState()` przez `buildTournamentReadonlyCopies(tournamentState)` i są zapisywane do `readonlyTables`.

3. **Admin widzi tylko tabele do edycji** — **TAK (z punktu widzenia źródła danych)**.
   - Widok admina używa danych edycyjnych (`tournamentState`), a nie `readonlyTables`.

4. **Admin dodaje gracza, uprawnienia i PIN** — **TAK**.
   - Sesja użytkownika po PIN wykorzystuje `permissions` gracza i wylicza dozwolone sekcje.

5. **Gracz otwiera aplikację w widoku użytkownika** — **TAK**.
   - Istnieje dedykowany przepływ user-view i osobny render sekcji turniejowych po stronie użytkownika.

6. **Gracz ma dostęp do zakładek bez PIN (np. Regulamin)** — **TAK**.
   - Tylko zakładki chronione są ukrywane do czasu weryfikacji PIN; publiczne zakładki pozostają dostępne.

7. **Gracz wpisuje PIN i wchodzi w Tournament of Poker** — **TAK**.
   - Po poprawnej weryfikacji tworzona jest sesja z `allowedSections` i `chatAllowed`.

8. **Sidebar pokazuje zakładki zgodnie z uprawnieniami PIN** — **TAK**.
   - `renderTournamentButtonsForPlayer()` filtruje przyciski tylko do dozwolonych celów.

9. **Gracz widzi tylko tabele readonly** — **TAK (dla sekcji danych)**.
   - Render usera (poza czatem) działa na `readonlyTables.rTournamentState`; przy braku kopii pokazuje komunikat o konieczności zapisu przez admina.

### 2) Potwierdzenie modelu `r*`

Aktualnie kod ma jednocześnie:
- pełny snapshot `rTournamentState`,
- aliasy `rTABELA10 ... rTABELA23A`.

To oznacza, że warstwa readonly jest utrzymywana i rozszerzona względem stanu opisanego jako „częściowa” w pierwszej analizie z 2026-04-20.

### 3) Zachowanie widoku usera „Losowanie stołów”

Aktualny render user `draw` pokazuje:
- tabelę przypisań (`Gracz / Status wpłaty / Stół`),
- oraz karty stołów z polami readonly `NAZWA`, `ŁĄCZNA SUMA` i tabelą `GRACZ / BUY-IN`.

Wniosek: obecny kod odpowiada oczekiwanemu modelowi „pełniejszego” readonly i nie ogranicza się już do samej „pierwszej tabeli”.

### 4) Zachowanie sekcji i komunikatu „Brak dostępnych paneli...”

- Lista dozwolonych sekcji jest liczona z sesji PIN (`getUserTournamentAllowedTargets()`),
- dodatkowo istnieje fallback do realnie widocznych przycisków sidebaru,
- to redukuje ryzyko fałszywego komunikatu o braku paneli przy chwilowym rozjeździe stanu.

### 5) Luki / ryzyka, które nadal warto monitorować

1. **Generacja readonly przy zapisie**
   - Jeżeli admin zmienia dane, ale nie zapisze, user może widzieć starszą kopię.
2. **Dwuwarstwowość readonly (`rTournamentState` + aliasy `rTABELA*`)**
   - Trzeba pilnować, by oba poziomy pozostawały semantycznie spójne.
3. **Brak twardej transakcyjności backendowej**
   - W obecnym modelu frontowym synchronizacja zależy od ścieżki zapisu.

### 6) Konkluzja końcowa

Dla zadanego celu 1–9 aktualny kod modułu `Second` jest zgodny funkcjonalnie z oczekiwanym przebiegiem:
- admin edytuje model roboczy,
- przy zapisie powstaje readonly snapshot z aliasami `r*`,
- user po PIN widzi tylko sekcje zgodne z uprawnieniami,
- sekcje danych czytają kopię readonly,
- czat pozostaje sekcją odseparowaną.

Wdrożenie można uznać za działające, z typowym zastrzeżeniem operacyjnym: aktualność readonly po stronie usera zależy od regularnego zapisu danych przez admina.
