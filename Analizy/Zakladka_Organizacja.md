# Analiza wymagań: zakładka „Organizacja” (moduł Main)

## Pełna treść prompta użytkownika (bez skracania)
Analiza planowanych zmian modułu Main
Przeczytaj analizę: Analizy/Wazne_przemodelowanie_Gry_admina.md

Następnie przygotuj nową analizę Analizy/Zakladka_Organizacja.md
Zawrzyj tam pełną treść prompta, bez skracania.
Nie wprowadzaj zmian w kodzie. Przygotuj tylko analizę wymagań.
Przeanalizuj wprowadzenie poniższych wymagań. Sprawdź też czy obecna struktura Firebase jest wystarczająca czy trzeba ją rozbudować.
Jeżeli wymagana jest rozbudowa Firebase to napisz jakie dokumenty/kolekcje/pola trzeba dopisać.
Aktualne Rules i strukturę Firebase masz w Analizy/Wazne_Rules.txt i Analizy/Wazne_firestore-schema.txt
Jeżeli wymagana jest rozbudowa Firebase to
Przy opisywaniu kolumn będę stosować opisy "Typ A", "Typ B" i "Typ C" zgodnie z Analizy/Wazne_TypyKolumn.md
Na końcu analizy przygotuj proponowane zmiany w kodzie w formacie:
Nazwa_Pliku, linia kodu
Było:
XXX
Będzie:
YYY

W przypadku nowych pól do uzupełnienia przez użytkownika zadbaj, żeby nie powtórzył się błąd z Analizy/Wazne_Fokus.md
Zadbaj też o odpowiednie oznaczenie pól, żeby wpisując wartość w aplikacji mobilnej urządzenie nie zmieniało typu klawiatury (np. dla pola, które przyjmuje tylko wartość liczbową ma się wyświetlić tylko klawiatura numeryczna).

We wszystkich polach obliczalnych zastosuj zaokrąglenie w górę do liczby całkowitej bez przecinków.

1. Wprowadź rekomendowane rozwiązanie z Analizy/Wazne_przemodelowanie_Gry_admina.md
1.1. Dane zapisane w "Gry admina" mają się nie pojawiać w "Gry do potwierdzenia" oraz "Najbliższa gra".

2. W zakładce "Kalkulator" dodaj nową zakładkę "Organizacja" (wybór poprzez panel boczny - tam gdzie Tournament1, Tournament2 i Cash) pod Cash.
2.1. Dostęp do zakładki tylko z widoku admina.
2.2. W zakładce "Organizacja" mają być dwie tabele.
2.3.1. Pierwsza tabela o nazwie TABELA1 będzie zawierać dwa wiersze (poza nagłówkiem).
2.3.2. Tabela1 ma zawierać kolumny: "KALKULATOR", "ORGANIZACJA", "POT"
2.3.4. KALKULATOR = Wartość liczbowa do wpisania przez użytkownika. W pierwszym wierszu aplikacja dostawić znak "%" (mechanizm podobny jak w Tabela16 w module Second). Jeżeli użytkownik wpisze "10" to aplikacja ma wyświetlić "10%" a do obliczeń używać "0.10". W drugim wierszu wartość liczbowa do wpisania przez użytkownika bez mechanizmu dodawania znaku "%%. Jeżeli w drugim wierszu użytkownik wpisze "100" to aplikacja będzie to traktować jako "100".
2.3.4.1 Kolumna KALKULATOR ma mieć Typ C.
2.3.5. ORGANIZACJA = Pole obliczalne. Ma być tylko w pierwszym wierszu tabeli. Jest to wynik obliczenia: [Wartość z kolumny KALKULATOR z wiersza 2] pomnożona przez [procent z kolumny KALKULATOR z wiersza 1]. Przykładowo:
KALKULATOR wiersz 1 = 10% (użytkownik wpisuje 10)
KALKULATOR wiersz 2 = 1000 (użytkownik wpisuje 1000)
to w ORGANIZACJA ma się pojawić 100 (ponieważ 10% ze 1000 to 100).
2.3.5.1. Kolumna ORGANIZACJA ma mieć Typ A.
2.3.6. POT = Pole obliczalne. Ma być tylko w pierwszym wierszu tabeli. Jest to wynik obliczenia: [Wartość z kolumny KALKULATOR z wiersza 2] minus [Wartość z kolumny ORGANIZACJA]
Kontynuując przykład z 2.3.5:
Jeżeli:
KALKULATOR wiersz 2 = 1000 (użytkownik wpisuje 1000)
ORGANIZACJA = 100
to w POT ma się pojawić 900 (ponieważ 1000-100 = 900)
2.3.6.1. Kolumna POT ma mieć Typ A.

2.4.1. Druga tabela o nazwie TABELA2 będzie zawierać zmienną liczbę wierszy. Będą potrzebne przyciski "Dodaj" i "Usuń" podobnie jak w zakładce "Gracze" w module "Main" ("Dodaj" z lewej strony pod ostatnim zajętym wierszem a "Usuń" z prawej strony wiersza).
2.4.2. TABELA2 będzie zawierać dwie kolumny
2.4.3. Nagłówkiem pierwszej kolumny ma być wartość z kolumny ORGANIZACJA z TABELA1 w zakładce "ORGANIZACJA".
2.3.4. W wierszach w pierwszej kolumnie użytkownik będzie wpisywać wartości liczbowe. Aplikacja dostawić znak "%" (mechanizm podobny jak w Tabela16 w module Second). Jeżeli użytkownik wpisze "10" to aplikacja ma wyświetlić "10%" a do obliczeń używać "0.10". Ten mechanizm ma działać we wszystkich wierszach tej kolumny w tej tabeli.
2.3.5. Druga kolumna ma się nazywać PODZIAŁ. Pole obliczalne. Jest to wynik obliczenia: [Wartość z kolumny ORGANIZACJA] pomnożona przez [procent z pierwszej kolumny TABELA2].
Kontynuując przykład z 2.3.6:

ORGANIZACJA = 100
Nagłówek pierwszej kolumny TABELA2 = 100
Pierwszy wiersz pierwszej kolumny TABELA2 = 60% (użytkownik wpisuje 60)
Drugi wiersz pierwszej kolumny TABELA2 = 20% (użytkownik wpisuje 20)
Kolumna PODZIAŁ wiersz pierwszy = 60 (ponieważ 60% ze 100 to 60)

2.3.5.1 Kolumna PODZIAŁ ma mieć Typ A.

3. Pod zakładką Organizacja (wymaganie 2.) dodaj zakładki "Żetony cash1", "Żetony cash2", "Żetony tournament1", "Żetony tournament2"
3.1. Wszystkie zakładki: "Żetony cash1", "Żetony cash2", "Żetony tournament1", "Żetony tournament2" będą miały takie same tabele i kolumny obliczane w ten sam sposób, ale muszą być niezależne od siebie. Jak uzupełnię tabelę w "Żetony cash2" to mogę uzupełnić innymi wartościami "Żetony tournament1". Dane muszę być zapisywane pomiędzy resetem aplikacji / odświeżeniem przeglądarki.
3.2. Pierwsza tabela o nazwie TABELAA będzie się składać z trzech kolumn i zmiennej liczby wierszy. Będą potrzebne przyciski "Dodaj" i "Usuń" podobnie jak w zakładce "Gracze" w module "Main" ("Dodaj" z lewej strony pod ostatnim zajętym wierszem a "Usuń" z prawej strony wiersza).,

3.2.1 Kolumny w TABELAA:
3.2.1.1 NOMINAŁ = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.2.1.2 SZTUK = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.2.1.3 STACK = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny NOMINAŁ z TABELA1] pomnożona przez [Wartość z kolumny SZTUK z TABELA1].
3.2.2. Pod TABELA1 wiersz z podsumowaniem. Ma się nazywać "łącznie stack" i wyświetlać sumę wartości z kolumny STACK z TABELAA.

3.3. Druga tabela o nazwie TABELAB będzie się składać z trzech kolumn i jednego wiersza.
3.3.1. Kolumny a TABELAB:
3.3.1.1. L.GRACZY = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.2. STACK GRACZA = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.3. ŁĄCZNY STACK = Pole obliczalne. Kolumna Typ A. Wartość z kolumny "DLA WSZYSTKICH W SZT." z TABELAC.
====(WAŻNA UWAGA! ŁĄCZNY STACK w TABELAB odnosi się do pojedynczej wartości z kolumny wielowierszowej TABELAC — należy potwierdzić, czy ma to być suma.)===

3.4. Trzecia tabela o nazwie TABELAC będzie się składać z pięciu kolumn i tylu wierszy ile istnieje w TABELAA w danej zakładce. Jeżeli w TABELAA użytkownik doda lub skasuje wiersz to nowy wiersz ma się pojawić lub zniknąć z TABELAC.
3.4.1. Kolumny w TABELAC:
3.4.1.1. POZOSTAŁE ŻETONY = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny STACK z TABELAA] minus [Wartość z kolumny DLA WSZYSTKICH W SZT. z TABELAC]
3.3.1.1. NOMINAŁ = Pole obliczalne. Kolumna Typ A. Wyświetla wartość z kolumny NOMINAŁ z TABELAA.
3.3.1.2. SZTUK = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.3. SUMA = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny NOMINAŁ z TABELAA] pomnożona przez [Wartość z kolumny SZTUK z TABELAC]
3.3.1.4. DLA WSZYSTKICH W SZT. = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny SZTUK z TABELAC] pomnożona przez [Wartość z kolumny L.GRACZY z TABELAB]

4. Zmodyfikuj kolumny "RebuyX" w modalu "Rebuy Gracza" w ten sposób, żeby przyjmował tylko wartości liczbowe i w aplikacji mobilnej urządzenie nie zmieniało typu klawiatury

---

## Materiał wejściowy wykorzystany do analizy
- `Analizy/Wazne_przemodelowania_Gry_admina.md`
- `Analizy/Wazne_Rules.txt`
- `Analizy/Wazne_firestore-schema.txt`
- `Analizy/Wazne_TypyKolumn.md`
- `Analizy/Wazne_Fokus.md`
- aktualna implementacja Main (`Main/index.html`, `Main/app.js`)

---

## 1) Wymaganie 1 — wdrożenie rekomendowanego przemodelowania „Gry admina”

### Wniosek
Rekomendacja z wcześniejszej analizy (wariant A) jest spójna: „Gry admina” powinny pełnić rolę zaplecza statystycznego, a nie operacyjnego źródła gier.

### Co to oznacza technicznie
Aby spełnić punkt 1.1 („nie pokazuj w Gry do potwierdzenia / Najbliższa gra”):
1. „Najbliższa gra” nie może łączyć już `Tables + UserGames` — powinna bazować tylko na `UserGames`.
2. „Gry do potwierdzenia” (admin + user) nie mogą łączyć `Tables + UserGames` — powinny bazować tylko na `UserGames`.
3. Dla bezpieczeństwa warto dodać semantykę pochodzenia rekordu (np. `origin`) przy nowych danych statystycznych.

---

## 2) Wymagania 2 i 3 — nowa gałąź „Organizacja” + „Żetony ...” w Kalkulatorze

### 2.1. Ocena zgodności z obecną architekturą UI
Obecny kalkulator w Main ma trzy tryby przełączane przyciskami: `tournament1`, `tournament2`, `cash` i zapisuje każdy tryb do oddzielnego dokumentu w kolekcji `calculators`.

To podejście można bezpiecznie rozszerzyć o nowe tryby:
- `organization`
- `chips_cash1`
- `chips_cash2`
- `chips_tournament1`
- `chips_tournament2`

### 2.2. Typy kolumn (zgodnie z Wazne_TypyKolumn)
- **Typ C (edytowalny input)**: wszystkie pola wpisywane przez użytkownika (`KALKULATOR`, procenty TABELA2, `NOMINAŁ`, `SZTUK`, `L.GRACZY`, `STACK GRACZA`, itd.).
- **Typ A (readonly jako wynik)**: wszystkie pola obliczalne (`ORGANIZACJA`, `POT`, `PODZIAŁ`, `STACK`, `ŁĄCZNY STACK`, `SUMA`, `DLA WSZYSTKICH W SZT.`, `POZOSTAŁE ŻETONY`, `łącznie stack`).

---

## 3) Logika obliczeń i zaokrąglenia

Wymaganie mówi o **zaokrągleniu w górę** dla wszystkich pól obliczalnych. To oznacza użycie `Math.ceil(...)`.

### Krytyczna uwaga
W obecnym kodzie istnieją obliczenia i formattery oparte na `Math.round(...)`. Przy wdrożeniu trzeba:
- nie zmieniać globalnie zachowania istniejących tabel bez decyzji biznesowej,
- dodać osobny formatter dla nowych tabel „Organizacja/Żetony” albo świadomie przełączyć cały kalkulator na `ceil`.

Rekomendacja: wprowadzić dedykowane formatowanie obliczeń dla nowej gałęzi, żeby nie powodować regresji starych ekranów.

---

## 4) Fokus i klawiatura mobilna (Wazne_Fokus)

Dla wszystkich nowych inputów liczbowych:
1. stosować analogicznie do istniejącego helpera:
   - `type="text"`
   - `inputmode="numeric"`
   - `pattern="[0-9]*"`
2. stosować pełny zestaw `data-*` do odtworzenia fokusu:
   - `data-focus-target`
   - `data-section`
   - `data-table-id`
   - `data-row-id`
   - `data-column-key`

To minimalizuje ryzyko utraty fokusu przy autozapisie/re-renderze.

---

## 5) Czy obecna struktura Firebase jest wystarczająca?

## Krótka odpowiedź
**Tak, jest wystarczająca pod warunkiem wykorzystania istniejącej kolekcji `calculators/{type}` jako nośnika nowych trybów.**

### Dlaczego
- Rules już zezwalają na read/write dla `match /calculators/{type}` oraz podstruktur sesji.
- Schemat jest dokumentowy i elastyczny (brak twardego walidatora schematu po stronie Firestore rules).
- Aktualnie istnieją już dokumenty trybów (`cash`, `tournament`, `tournament2`) — dokładnie ten sam mechanizm pasuje do nowych trybów.

### Zalecana rozbudowa danych (bez zmiany Rules)
Dodać nowe dokumenty w `calculators`:
1. `calculators/organization`
2. `calculators/chips_cash1`
3. `calculators/chips_cash2`
4. `calculators/chips_tournament1`
5. `calculators/chips_tournament2`

Proponowane pola:

#### `calculators/organization`
- `tableOrg1`: 
  - `percent` (string/int jako tekst cyfr)
  - `baseValue` (string/int)
- `tableOrg2Rows`: array of map
  - `id` (string)
  - `percent` (string/int)
- `updatedAt` (timestamp)

#### `calculators/chips_*` (każdy z 4 dokumentów)
- `tableAARows`: array of map
  - `id` (string)
  - `nominal` (string/int)
  - `pieces` (string/int)
- `tableABRow`: map
  - `playersCount` (string/int)
  - `playerStack` (string/int)
- `tableACRows`: array of map
  - `id` (string, powiązane z `tableAARows.id`)
  - `pieces` (string/int)
- `updatedAt` (timestamp)

### Czy potrzeba nowych kolekcji?
Nie jest to konieczne. Dokumenty w istniejącej kolekcji `calculators` są wystarczające i najspójniejsze z obecną implementacją.

---

## 6) Punkt 3.3.1.3 (ŁĄCZNY STACK) — niejednoznaczność

Wymaganie zawiera uwagę, że „ŁĄCZNY STACK” odnosi się do pojedynczej wartości z wielowierszowej kolumny `DLA WSZYSTKICH W SZT.`.

### Rekomendacja implementacyjna
Domyślnie przyjąć:
- **ŁĄCZNY STACK = suma wszystkich wartości `DLA WSZYSTKICH W SZT.` z TABELAC**

Powód: to jedyna interpretacja spójna przy wielu nominałach i wielu wierszach.

---

## 7) Punkt 4 — „RebuyX” modal „Rebuy Gracza”

Stan obecny w Main już częściowo spełnia wymaganie (są miejsca z hintami numerycznymi). Mimo to rekomendowane jest ujednolicenie:
- każdy input `RebuyX` (zarówno w modalu szczegółów gry, jak i modalu rebuy kalkulatora) powinien konsekwentnie używać tego samego helpera klawiatury numerycznej + sanitizacji cyfr.

---

## 8) Proponowane zmiany w kodzie (format wymagany)

Main/app.js, linia ~2021 i ~2027 (subskrypcje „Najbliższa gra”)
Było:
`nextGamesState.adminUnsubscribe = db.collection(GAMES_COLLECTION)...`
`nextGamesState.userUnsubscribe = db.collection(USER_GAMES_COLLECTION)...`
Będzie:
Tylko subskrypcja `USER_GAMES_COLLECTION`; usunięcie udziału `GAMES_COLLECTION` w „Najbliższa gra”.

Main/app.js, linia ~1934 (`getCombinedOpenGames`)
Było:
`return [...nextGamesState.adminGames, ...nextGamesState.userGames]`
Będzie:
`return [...nextGamesState.userGames]`

Main/app.js, linia ~3765 i ~2387 (agregacja „Gry do potwierdzenia”)
Było:
`getActiveGamesForConfirmationsFromCollections(db, [gamesCollectionName, userGamesCollectionName], source)`
Będzie:
`getActiveGamesForConfirmationsFromCollections(db, [userGamesCollectionName], source)`

Main/index.html, linia ~401-403 (przyciski trybów kalkulatora)
Było:
`Tournament1`, `Tournament2`, `Cash`
Będzie:
Dodatkowy przycisk `Organizacja` pod `Cash` + kolejne podzakładki: `Żetony cash1`, `Żetony cash2`, `Żetony tournament1`, `Żetony tournament2`.

Main/app.js, linia ~4346 oraz ~5692 (lista trybów kalkulatora)
Było:
Obsługa tylko `tournament1`, `tournament2`, `cash`.
Będzie:
Rozszerzenie o `organization`, `chips_cash1`, `chips_cash2`, `chips_tournament1`, `chips_tournament2` oraz ich normalizację/serializację/persist.

Main/app.js, linia ~4400-4403 (formatowanie wyniku)
Było:
`return String(Math.round(normalized));`
Będzie:
Dla nowych pól obliczalnych używać formattera opartego o `Math.ceil(...)` (lub globalnie po decyzji biznesowej).

Main/app.js, linia ~5018+ (render tabel turniejowych/cash)
Było:
Brak rendererów `Organizacja` i `Żetony`.
Będzie:
Nowe funkcje renderujące:
- `renderOrganizationTable1()`
- `renderOrganizationTable2()`
- `renderChipsTableAA()`
- `renderChipsTableAB()`
- `renderChipsTableAC()`
z pełnym mapowaniem Typ A / Typ C.

Main/app.js, linia ~4930 (inputy RebuyX w modalu kalkulatora)
Było:
`input.type = "text"` + ręczna sanitizacja bez jawnego helpera klawiatury.
Będzie:
`applyIntegerInputHints(input)` + sanitizacja, aby wymusić numeryczną klawiaturę mobilną i spójność zachowania.

Main/app.js, linia ~2866-2901 (modal „Rebuy Gracza” w szczegółach gry)
Było:
Inputy tworzone dynamicznie (już z `applyIntegerInputHints`).
Będzie:
Pozostawić mechanikę i dopilnować spójnych `data-*` (gdyby modal był przebudowywany o nowe pola), aby nie wrócił błąd fokusu.

