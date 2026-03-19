# Analiza rozbudowy modułu Second — finał / półfinał / wypłaty

## Prompt użytkownika
> Przeprowadź analizę możliwości rozbudowy modułu Second i zapisz jej wyniki w nowym pliku.
> Przeczytaj poniższe wymagania i sprawdź czy obecna struktura Firebase to obsłuży. Czy są jakieś inne przeszkody przed wdrożeniem?
>
> 1. Panel finał
> 1.1 TABELA23 = ma być kopią tabeli TABELA FINAŁOWA z panelu Półfinał. Ma zawierać te same wartości obliczane w ten sam sposób. W TABELA23 ma być sortowanie po wartości w kolumnie STACK od najwyższej do najniższej. W TABELA23 brak możliwości edycji wartości.
> 1.2 TABELA23 ma zawierać jeszcze jedną kolumnę. ELIMINATED. Ma być jako ostatnia w tabeli. Ma to być checkbox. Stan zaznaczenie/odznaczenie checkboxa ma być zapamiętane między sesjami przeglądarki/resetem aplikacji.
>
> 2. Panel Wypłaty
> 2.1. TABELA24 kolumna POCZĄTKOWA WYGRANA = przyjmuje wartość z kolumny KWOTA z tabeli TABELA16. Dla pierwszego miejsca w TABELA24 jest przypisywana wartość z pierwszego miejsca z TABELA16. Dla drugiego miejsca w TABELA24 jest przypisywana wartość z drugiego miejsca z TABELA16 itd.
> Jeżeli w TABELA24 jest więcej wierszy niż wierszy w TABELA16 to pozostali gracze mają mieć wartość 0. Brak możliwości edycji pola w TABELA24
> 2.2 TABELA24 kolumna KOŃCOWA WYGRANA = przyjmuje wartość z kolumny SUMA z tabeli TABELA16. Dla pierwszego miejsca w TABELA24 jest przypisywana wartość z pierwszego miejsca z TABELA16. Dla drugiego miejsca w TABELA24 jest przypisywana wartość z drugiego miejsca z TABELA16 itd.
> Jeżeli w TABELA24 jest więcej wierszy niż wierszy w TABELA16 to pozostali gracze mają mieć wartość 0. Brak możliwości edycji pola w TABELA24
>
> 3. Panel Półfinał
> 3.1 Dodaj nową tabelę - TABELA22A. Ma się ona znajdować przed "TABELA FINAŁOWA" a pod tabelami z nazwami stołów półfinałowych.
> 3.2 TABELA22A ma mieć kolumny:
> 3.2.1 LP - autonumeracja
> 3.2.2 GRACZ - Nazwa gracza
> 3.2.3 POZYCJA - przyciski ze strzałkami
> 3.3 TABELA22A ma być automatycznie uzupełniana graczami, którzy mają zaznaczony checkbox przy kolumnie ELIMINATED w tabelach z nazwami stołów półfinałowych
> 3.4 Administrator używając strzałek może zmieniać kolejność graczy na liście podobnie jak to jest w TABELA19A
>
> 4. Kolejność uzupełniania wierszy w TABELA24
> 4.1 TABELA24 = ilość wierszy w kolumnie jest równa ilości graczy w panelu "Losowanie Graczy"
> 4.2. TABELA24 = Wiersze zajmowane są od ostatniej pozycji w tabeli do pierwszej. Ostatnie miejsce ma gracz przy LP=1 w TABELA19A. Przedostatnie miejsce ma gracz z LP=2 w TABELA19A
> 4.3 Jak już wszyscy gracze z TABELA19A zostaną przepisani do TABELA24 i przyporządkowani do miejsc to pozostałe miejsca są uzupełniane graczami z TABELA22A. Kolejność ma podobną logikę. Gracz, który ma LP=1 w TABELA22A jest dopisany do pierwszego wolnego miejsca (nie zajętego przez innego gracza) od końca w TABELA19A

## Zakres analizy
Przejrzano:
- `Second/app.js` — aktualny model stanu, render sekcji `semi`, `final`, `payouts` i handlery zapisujące dane do Firestore.
- `Second/docs/Documentation.md` oraz `Second/docs/README.md` — opis bieżącego działania tabel `Tabela19A`, `Tabela22`, `Tabela FINAŁOWA`, `Tabela23`, `Tabela24`.
- `Analizy/Wazne_firestore-schema.txt` — eksport schematu Firestore.

## Wniosek główny
**Obecna struktura Firebase nie blokuje wdrożenia tych wymagań.**

Najważniejszy powód: moduł Second zapisuje cały stan turnieju w jednym dokumencie `second_tournament/state`, a normalizacja stanu toleruje brak nowych pól i pozwala bezpiecznie dopisywać nowe gałęzie obiektu. Oznacza to, że nowe dane typu:
- ranking eliminacji z półfinału,
- checkbox `ELIMINATED` w finale,
- wynikowa lista miejsc w `Tabela24`,
- dodatkowe mapy pomocnicze dla kolejności i przypisań,

mogą zostać dopisane bez przebudowy kolekcji Firestore.

## Co już wspiera obecna struktura Firebase

### 1. Trwałość checkboxów i kolejności
W module już istnieją trwałe pola podobnego typu:
- `group.eliminated`
- `group.eliminatedOrder`
- `semi.assignments[playerId].eliminated`
- `payouts.showInitial`
- `payouts.showFinal`

To znaczy, że Firestore już przechowuje:
- mapy booli per gracz,
- tablice kolejności,
- tablice/obiekty zagnieżdżone w jednym dokumencie.

Dla nowych wymagań można użyć analogicznych pól, np.:
- `semi.eliminatedOrder` — kolejność w `Tabela22A`,
- `final.eliminated[playerId]` albo `finalPlayers[].eliminated` — checkbox w `Tabela23`,
- `payouts.rows[]` albo `payouts.placements[]` — trwała lista miejsc do `Tabela24`.

### 2. Elastyczne rozszerzanie dokumentu
Domyślny stan i jego normalizacja nie zakładają sztywnego schematu. To oznacza, że brak nowego pola w starszych danych nie spowoduje awarii odczytu po wdrożeniu.

### 3. Obecne dane źródłowe już istnieją
Wymagane dane wejściowe są już w stanie aplikacji:
- lista wszystkich graczy: `players[]`,
- kolejność eliminacji z grup: `group.eliminatedOrder`,
- żyjący gracze z grup: `group.survivorStacks`,
- przypisania do stołów półfinałowych: `semi.assignments`,
- stoły półfinałowe: `semi.customTables`,
- lista finalistów: `finalPlayers[]`,
- wyliczenia wypłat z `Tabela16`: w renderze sekcji `payouts`.

## Co jest największą przeszkodą dziś
Największą przeszkodą **nie jest Firebase**, tylko obecna logika w `Second/app.js`.

Poniżej najważniejsze różnice między wymaganiami a aktualnym zachowaniem.

## Ocena wymagań względem obecnej implementacji

### 1. Panel Finał — TABELA23

#### 1.1 Kopia `TABELA FINAŁOWA`, sortowanie po `STACK`, brak edycji
**Firebase:** wspiera.

**Aktualny stan kodu:** niezgodne w kilku punktach.
- `Tabela23` jest renderowana z `tournamentState.finalPlayers`.
- Kolumna `STACK` jest nadal edytowalnym inputem `data-role="final-stack"`.
- Nie ma sortowania malejącego po `STACK`.
- `Tabela23` nie jest niezależną kopią logiki `Tabela FINAŁOWA`, tylko innym widokiem tej samej tablicy.

**Wniosek:** do wdrożenia potrzebna jest zmiana renderu i prawdopodobnie wydzielenie wspólnego helpera budującego wiersze finału, żeby `Tabela FINAŁOWA` i `Tabela23` liczyły dane identycznie.

#### 1.2 Dodatkowa kolumna `ELIMINATED` z trwałym checkboxem
**Firebase:** wspiera.

**Aktualny stan kodu:** niezgodne.
- `finalPlayers` są przebudowywani przy każdym renderze sekcji na podstawie `semiRows`.
- Podczas tego przebudowania pole `eliminated` jest ustawiane sztywno na `false`.

To jest kluczowa przeszkoda: nawet jeśli doda się checkbox do `Tabela23`, to bez zmiany modelu danych lub logiki rekonstrukcji stanu jego wartość będzie nadpisywana.

**Wniosek:** samo Firestore to obsłuży, ale trzeba zmienić sposób budowy `finalPlayers`.
Najbezpieczniejsze warianty:
- przechowywać `final.eliminated[playerId]` poza `finalPlayers[]`, albo
- przy przebudowie `finalPlayers[]` zachowywać poprzednią wartość `eliminated` zamiast wpisywać `false`.

### 2. Panel Wypłaty — wartości z `Tabela16`

#### 2.1 `POCZĄTKOWA WYGRANA` = `Tabela16.KWOTA`, readonly
**Firebase:** wspiera.

**Aktualny stan kodu:** częściowo niezgodne.
- Render `Tabela24` korzysta z `finalPlayers[]`, więc liczba wierszy jest dziś zależna od liczby finalistów, a nie od liczby graczy z panelu „Losowanie Graczy”.
- Kolumna jest obecnie renderowana jako edytowalny input `data-role="payout-initial"`.
- Domyślne podstawienie działa tylko dla pierwszych 8 pozycji.

**Wniosek:** wdrożenie wymaga przebudowy logiki `Tabela24`, ale nie wymaga zmiany struktury kolekcji Firestore.

#### 2.2 `KOŃCOWA WYGRANA` = `Tabela16.SUMA`, readonly
**Firebase:** wspiera.

**Aktualny stan kodu:** częściowo niezgodne z tych samych powodów.
- Pole jest dziś edytowalne (`data-role="payout-final"`).
- Domyślne wartości są ograniczone warunkiem `index < 8`.
- Wiersze dalej są oparte o `finalPlayers[]`, a nie o pełną listę miejsc wymaganą przez biznes.

**Wniosek:** wymagane są zmiany w logice, nie w Firebase.

### 3. Panel Półfinał — nowa `TABELA22A`

#### 3.1–3.4 Lista graczy wyeliminowanych w półfinale z ręcznym porządkiem
**Firebase:** wspiera.

**Aktualny stan kodu:** funkcjonalności brak.
- Jest już wzorzec dla takiej tabeli w `Tabela19A`: trwała kolejność przez `group.eliminatedOrder` i przyciski `▲/▼`.
- W półfinale nie ma odpowiednika `semi.eliminatedOrder` ani osobnej tabeli agregującej graczy zaznaczonych jako wyeliminowani w `Tabela22`.
- Handler kliknięcia obsługuje tylko `group-eliminated-move`; nie ma roli typu `semi-eliminated-move`.

**Wniosek:** architektura Firestore jest wystarczająca, ale potrzeba nowego fragmentu stanu i nowej logiki synchronizacji kolejności.

## 4. Kolejność obsady `Tabela24`

### 4.1 Liczba wierszy = liczba graczy w „Losowanie Graczy”
**Firebase:** wspiera.

**Aktualny stan kodu:** niezgodne.
- `Tabela24` renderuje dziś tyle wierszy, ile ma `finalPlayers[]`.
- To oznacza, że gracze wyeliminowani wcześniej w ogóle nie pojawiają się w wypłatach.

**Wniosek:** potrzebna jest nowa, wynikowa lista miejsc oparta o `players[]`, `Tabela19A` i `Tabela22A`, a nie wyłącznie o finalistów.

### 4.2 Obsadzanie miejsc od końca na bazie `Tabela19A`
**Firebase:** wspiera.

**Aktualny stan kodu:** brak.
- Jest źródło kolejności w grupach (`group.eliminatedOrder`), ale nie ma logiki budującej tabelę miejsc od końca.
- Obecny render nie ma pojęcia o miejscach dla graczy wyeliminowanych w grupach.

### 4.3 Uzupełnienie pozostałych miejsc graczami z `Tabela22A`
**Firebase:** wspiera.

**Aktualny stan kodu:** brak.
- Nie istnieje `Tabela22A`, więc nie ma też drugiego źródła kolejności eliminacji.
- Bez tego nie da się poprawnie przypisać miejsc pomiędzy eliminacjami grupowymi a półfinałowymi.

## Najważniejsze przeszkody przed wdrożeniem

### A. `finalPlayers[]` jest dziś stanem pochodnym i nadpisywanym
To największe ryzyko implementacyjne.

W każdym renderze aplikacja przebudowuje `finalPlayers[]` z półfinału. Jeśli w tej samej tablicy będą przechowywane dodatkowe pola biznesowe, np.:
- `eliminated` w finale,
- trwałe miejsce w wypłatach,
- inne flagi ręcznej kontroli,

to łatwo je stracić przy przebudowie danych.

### B. `Tabela24` ma dziś zły model źródłowy
Obecnie wypłaty są oparte o finalistów, a nowe wymaganie mówi o pełnej klasyfikacji wszystkich graczy.

To oznacza, że trzeba zmienić model myślenia:
- `Tabela24` nie powinna być pochodną samego `finalPlayers[]`,
- potrzebny jest wynikowy ranking/miejsca zbudowany z:
  1. `players[]`,
  2. `group.eliminatedOrder`,
  3. nowego `semi.eliminatedOrder`,
  4. finalistów pozostających po odfiltrowaniu checkboxów w `Tabela23`.

### C. Brak wspólnego źródła prawdy dla finału i panelu finałowego
Wymaganie mówi, że `Tabela23` ma być kopią `Tabela FINAŁOWA` z panelu `Półfinał`.

Dziś oba widoki korzystają z tej samej tablicy, ale nie ze wspólnej, wyodrębnionej funkcji budowania i sortowania. To zwiększa ryzyko rozjazdu logiki po wdrożeniu zmian.

### D. Brak mechanizmu kolejności dla półfinałowych eliminacji
Dla grup istnieje `group.eliminatedOrder`, ale dla półfinału nie ma analogicznego pola ani zdarzeń `move up/down`.

### E. Utrzymanie fokusu przy nowych polach i checkboxach
W obecnym kodzie mechanizm ochrony fokusu działa dla istniejących inputów dzięki `data-focus-target`, `data-section`, `data-row-id`, `data-column-key`.

Jeśli podczas wdrożenia pojawią się nowe pola edytowalne lub przebudowany render z częstymi `render()`, trzeba zachować ten sam wzorzec. W tej konkretnej specyfikacji większość nowych pól ma być readonly, więc ryzyko jest mniejsze niż w poprzednich zadaniach, ale nadal trzeba uważać przy ewentualnych nowych kontrolkach w finale i wypłatach.

## Czy obecna struktura Firestore to obsłuży?

## Tak — pod warunkiem rozszerzenia dokumentu `second_tournament/state` o kilka pól pomocniczych
Rekomendowane minimalne rozszerzenia:
- `semi.eliminatedOrder: string[]`
- `final.eliminated: { [playerId]: boolean }` albo zachowywane `finalPlayers[].eliminated`
- `payouts.rows` lub `payouts.placements` jako trwała lista miejsc, jeśli biznes wymaga zapamiętywania wynikowej obsady miejsc niezależnie od chwilowego renderu

Możliwe też jest wdrożenie bez nowych gałęzi przez ostrożne rozszerzanie istniejących obiektów, ale będzie to bardziej podatne na nadpisywanie przy rekalkulacji.

## Rekomendacja architektoniczna
Najbezpieczniejsza ścieżka wdrożenia wygląda tak:
1. Zostawić Firestore w tej samej kolekcji i tym samym dokumencie.
2. Dodać w stanie osobne źródła prawdy dla:
   - kolejności eliminacji półfinałowych,
   - checkboxów eliminacji w finale,
   - wynikowej listy miejsc albo przynajmniej deterministycznego helpera, który ją buduje.
3. Wydzielić helper budujący „aktywnych finalistów”, z którego korzystają jednocześnie:
   - `Tabela FINAŁOWA` w półfinale,
   - `Tabela23` w finale,
   - logika obsady `Tabela24`.
4. Utrzymać dotychczasowy wzorzec zapisu do Firestore przez `saveState()` i `merge: true`.

## Odpowiedź końcowa

### Czy obecna struktura Firebase to obsłuży?
**Tak.** Nie widać blokady po stronie Firestore ani bieżącej struktury kolekcji. Obecny model jednego dokumentu `second_tournament/state` jest wystarczająco elastyczny, aby przechować nowe checkboxy, kolejności i listy miejsc.

### Czy są inne przeszkody przed wdrożeniem?
**Tak — ale są po stronie logiki aplikacji, nie Firebase.** Najważniejsze to:
1. `finalPlayers[]` jest dziś nadpisywane przy renderze, więc nowe pola finałowe mogą się gubić.
2. `Tabela24` ma obecnie zły model danych — opiera się na finalistach, a ma obejmować wszystkich graczy i ranking od końca.
3. Brakuje `Tabela22A` oraz trwałej kolejności eliminacji półfinałowych.
4. `Tabela23` nie spełnia dziś wymagań readonly + sortowania + trwałego checkboxa `ELIMINATED`.
5. Domyślne zasilenie wypłat jest dziś ograniczone do pierwszych 8 pozycji i do finalistów, więc wymaga przebudowy.

## Podsumowanie praktyczne
**Wdrożenie jest możliwe bez migracji Firestore.** Zakres zmian dotyczy przede wszystkim `Second/app.js`: modelu stanu, helperów budujących listy graczy, renderu trzech sekcji (`semi`, `final`, `payouts`) oraz obsługi nowych przycisków zmiany pozycji dla `Tabela22A`.

## Uzupełnienie analizy — odpowiedź na pytanie o zakres zmian

### Dodatkowy prompt użytkownika
> Uzupełnij analizę Analizy/Second_rozbudowa_modulu_Second_final_payouts_analiza_2026-03-19.md
> Powiedz mi czy wszystkie problemy da się rozwiązać na poziomie zmiany kodu.

### Krótka odpowiedź
**Tak — wszystkie problemy wskazane w tej analizie da się rozwiązać na poziomie zmiany kodu aplikacji oraz sposobu zapisu stanu w istniejącym dokumencie Firestore.**

Nie widać tutaj blokera, który wymagałby:
- zmiany struktury kolekcji w Firebase jako osobnego projektu migracyjnego,
- ręcznej ingerencji administracyjnej w konsoli Firebase jako warunku wdrożenia,
- zmiany infrastruktury hostingowej,
- wymiany bazy danych,
- dołożenia nowego zewnętrznego systemu.

### Co dokładnie oznacza „na poziomie zmiany kodu” w tym przypadku
Zakres potrzebnych prac nadal mieści się w typowym wdrożeniu programistycznym w module `Second`, czyli w:
- rozszerzeniu modelu stanu w `Second/app.js`,
- poprawieniu normalizacji i rekalkulacji danych pochodnych,
- zmianie renderu tabel `Tabela22A`, `Tabela23`, `Tabela24`,
- dopisaniu handlerów UI dla checkboxów i zmiany kolejności,
- utrwalaniu nowych pól w tym samym dokumencie `second_tournament/state`.

### Które problemy są wyłącznie problemami kodowymi
#### 1. Nadpisywanie `finalPlayers[]`
To problem architektury stanu w kodzie. Da się go rozwiązać przez:
- zachowanie dodatkowych pól przy rekalkulacji,
- przeniesienie flag do osobnej gałęzi stanu,
- albo wyliczanie części danych przez dedykowany helper.

Nie wymaga to zmian infrastrukturalnych.

#### 2. Brak `Tabela22A`
To brakująca funkcjonalność UI + brak logiki stanu. Da się ją dodać wyłącznie kodem.

#### 3. Niepoprawne źródło danych dla `Tabela24`
To błąd modelowania logiki biznesowej w aplikacji. Rozwiązanie wymaga przebudowy algorytmu budowania klasyfikacji, ale nadal tylko w kodzie.

#### 4. Readonly/sortowanie/checkboxy w `Tabela23`
To typowa zmiana renderu i obsługi zdarzeń. Również wyłącznie kod.

#### 5. Trwałość nowych danych między sesjami
To także problem kodowy, bo obecny Firestore już potrafi przechować takie pola. Trzeba jedynie dopisać ich zapis/odczyt.

### Jedyny istotny warunek
Jedyny realny warunek jest taki, że wdrożenie powinno być zrobione **spójnie**, a nie jako pojedyncza kosmetyczna poprawka UI.

To znaczy, że sama podmiana tabel bez uporządkowania źródeł danych może stworzyć kolejne błędy. Nadal jednak jest to kwestia jakości implementacji kodu, a nie ograniczenia technologicznego.

### Czy potrzebna jest migracja danych?
**Najprawdopodobniej nie.**

Ponieważ dokument stanu jest elastyczny i aplikacja już toleruje brak części pól, nowe właściwości mogą zostać dopisane przy kolejnym zapisie. W praktyce oznacza to, że wdrożenie można oprzeć na:
- dodaniu domyślnych wartości w normalizacji,
- bezpiecznym fallbacku dla starszych zapisów stanu,
- stopniowym uzupełnieniu nowych pól przez samą aplikację.

### Czy istnieją problemy, których sam kod nie rozwiąże?
**Nie w zakresie wymagań opisanych w tej analizie.**

Jedynie w szerszym sensie pozakodowym mogą pojawić się kwestie organizacyjne, np.:
- potrzeba doprecyzowania remisu przy identycznych `STACK`, jeśli biznes oczekuje ścisłej reguły tie-break,
- decyzja biznesowa, czy odznaczenie `ELIMINATED` w finale ma natychmiast przeliczać `Tabela24`,
- decyzja, czy wynikowa lista miejsc ma być zawsze wyliczana automatycznie, czy częściowo ręcznie nadpisywalna.

To jednak nie są blokery techniczne. To tylko decyzje produktowe, które trzeba jednoznacznie zapisać przed implementacją.

### Ostateczny wniosek po uzupełnieniu analizy
**Tak — wszystkie zidentyfikowane problemy da się rozwiązać na poziomie zmiany kodu.**

Precyzyjniej:
- **tak po stronie technicznej,** bo obecny Firebase i obecna struktura danych są wystarczające,
- **tak po stronie implementacyjnej,** bo potrzebne zmiany mieszczą się w `Second/app.js` i aktualnym modelu zapisu stanu,
- **nie ma widocznej blokady systemowej**, która wymagałaby osobnego projektu infrastrukturalnego albo migracji bazy.

Największe ryzyko dotyczy więc nie technologii, tylko poprawnego zaprojektowania logiki danych i kolejności rekalkulacji w kodzie.
