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
