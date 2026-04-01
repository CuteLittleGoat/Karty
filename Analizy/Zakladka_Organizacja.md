# Analiza rozbudowy modułu Main — zakładka „Organizacja”

## Pełna treść prompta użytkownika (bez skracania)

Analiza rozbudowy modułu Main
Przeczytaj analizę: Analizy/Wazne_przemodelowanie_Gry_admina.md

Następnie przygotuj nową analizę Analizy/Zakladka_Organizacja.md
Zawrzyj tam pełną treść prompta, bez skracania. Zadbaj też o czytelność (każde wymaganie ma być od nowej linii).
Nie wprowadzaj zmian w kodzie. Przygotuj tylko analizę wymagań.

Przeanalizuj wprowadzenie poniższych wymagań. Sprawdź też czy obecna struktura Firebase jest wystarczająca czy trzeba ją rozbudować.
Jeżeli wymagana jest rozbudowa Firebase to napisz jakie dokumenty/kolekcje/pola trzeba dopisać.
Aktualne Rules i strukturę Firebase masz w Analizy/Wazne_Rules.txt i Analizy/Wazne_firestore-schema.txt
Jeżeli wymagana jest rozbudowa Firebase to napisz skrypt node.js
Jeżeli nie jest wymagana ręczna ingerencja użytkownika w strukturę Firebase tylko możesz to zrobić z poziomu kodu aplikacji to jasno i wyraźnie zaznacz ten fakt w analizie.

Przy opisywaniu kolumn będę stosować opisy "Typ A", "Typ B" i "Typ C" zgodnie z Analizy/Wazne_TypyKolumn.md

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
3.3.1.3. ŁĄCZNY STACK = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny L.GRACZY z TABELAB] pomnożona przez [Wartość z kolumny STACK GRACZA z TABELAB]

3.4. Trzecia tabela o nazwie TABELAC będzie się składać z pięciu kolumn i tylu wierszy ile istnieje w TABELAA w danej zakładce. Jeżeli w TABELAA użytkownik doda lub skasuje wiersz to nowy wiersz ma się pojawić lub zniknąć z TABELAC.
3.4.1. Kolumny w TABELAC:
3.4.1.1. POZOSTAŁE ŻETONY = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny STACK z TABELAA] minus [Wartość z kolumny DLA WSZYSTKICH W SZT. z TABELAC]
3.3.1.1. NOMINAŁ = Pole obliczalne. Kolumna Typ A. Wyświetla wartość z kolumny NOMINAŁ z TABELAA.
3.3.1.2. SZTUK = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.3. SUMA = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny NOMINAŁ z TABELAA] pomnożona przez [Wartość z kolumny SZTUK z TABELAC]
3.3.1.4. DLA WSZYSTKICH W SZT. = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny SZTUK z TABELAC] pomnożona przez [Wartość z kolumny L.GRACZY z TABELAB]

4. Zmodyfikuj kolumny "RebuyX" w modalu "Rebuy Gracza" w ten sposób, żeby przyjmował tylko wartości liczbowe i w aplikacji mobilnej urządzenie nie zmieniało typu klawiatury.

---

## Wnioski architektoniczne

### 1) Wymaganie 1 — przemodelowanie „Gry admina”
- Rekomendacja z analizy `Wazne_przemodelowania_Gry_admina.md` wskazuje wariant docelowy, w którym „Gry admina” nie zasila przepływów operacyjnych.
- W praktyce należy odseparować źródła danych tak, aby „Gry do potwierdzenia” i „Najbliższa gra” czytały tylko gry operacyjne (docelowo `UserGames`).
- Wymaganie 1.1 jest spójne z tą rekomendacją i wymaga konsekwentnych filtrów/źródeł w wielu miejscach UI.

### 2) Wymaganie 2 — nowa zakładka „Organizacja” w Kalkulatorze
- Funkcjonalnie to nowy panel kalkulacyjny admin-only, z logiką procentów i dzielenia puli.
- Należy zachować standardy Typów kolumn:
  - `KALKULATOR` = Typ C (edytowalne inputy),
  - `ORGANIZACJA`, `POT`, `PODZIAŁ` = Typ A (pola obliczalne tylko do odczytu).
- Mechanika `%` powinna przechowywać wartości źródłowe numeryczne i prezentować format z `%` (jak w wymaganiu).

### 3) Wymaganie 3 — 4 podzakładki „Żetony ...”
- Każda podzakładka musi mieć osobny, niezależny stan i osobny zapis trwały.
- Relacja TABELAA ↔ TABELAC wymaga synchronizacji liczby wierszy (dodaj/usuń).
- Wszystkie pola obliczalne muszą stosować zaokrąglenie w górę (`Math.ceil`) do liczby całkowitej.

### 4) Wymaganie 4 — RebuyX
- Wszystkie pola `RebuyX` powinny wymuszać cyfry i stały typ klawiatury mobilnej:
  - `type="text"`,
  - `inputmode="numeric"`,
  - `pattern="[0-9]*"`,
  - sanitizacja wejścia do cyfr po stronie JS.
- Takie podejście minimalizuje ryzyko przełączania klawiatury mobilnej.

---

## Ochrona przed błędem fokusu (Wazne_Fokus)

Dla każdego nowego pola edycyjnego w Organizacji i Żetonach:
- dodać pełne metadane fokusu (`data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`),
- nie wykonywać pełnego re-renderu nad aktywnie edytowanym polem bez mechanizmu restore,
- unikać nadpisania wartości z `onSnapshot` w trakcie aktywnej edycji (dirty/edit-lock),
- stosować spójny mechanizm debounce + bezpieczne odtworzenie kursora.

To jest krytyczne zwłaszcza przy polach liczbowych edytowanych szybko (np. trzymanie Backspace).

---

## Firebase — czy obecna struktura jest wystarczająca?

## Odpowiedź: TAK, obecna struktura jest wystarczająca.

Uzasadnienie:
- Firestore jest schemaless, więc nowe pola można dopisać do istniejących dokumentów bez ręcznego tworzenia tabel/kolumn.
- W `rules` istnieje już pełny dostęp `read/write` dla `calculators/{type}` oraz podkolekcji sesji/tabel/rows.
- W istniejącej strukturze są już dokumenty kalkulatora (np. `cash`, `tournament`, `tournament2`) i wzorzec utrwalania stanu kalkulatora.

## Ważne i jednoznaczne:
**Nie jest wymagana ręczna ingerencja użytkownika w strukturę Firebase.**
**Całość można wykonać wyłącznie z poziomu kodu aplikacji (automatyczne utworzenie/brakujących pól przy zapisie).**

---

## Proponowany model danych (logiczny) — bez ręcznej migracji

W ramach istniejącego dokumentu kalkulatora (np. dedykowany typ `organization` albo rozszerzenie istniejącego typu) można utrwalać:

- `organization.table1`
  - `percentInput` (string/number)
  - `baseInput` (string/number)
- `organization.table2Rows[]`
  - `id`
  - `percentInput`
- `organization.chipsTabs`
  - `cash1`, `cash2`, `tournament1`, `tournament2` (4 niezależne obiekty)
  - dla każdego:
    - `tableAA.rows[]` (`id`, `nominal`, `count`)
    - `tableAB` (`playersCount`, `playerStack`)
    - `tableAC.rows[]` (`linkedRowId`, `count`)
- `organization.updatedAt`

Obliczenia (`ORGANIZACJA`, `POT`, `PODZIAŁ`, `STACK`, `ŁĄCZNY STACK`, `SUMA`, `DLA WSZYSTKICH W SZT.`, `POZOSTAŁE ŻETONY`) liczone po stronie aplikacji i zapisywane opcjonalnie jako cache.

---

## Czy potrzebny jest skrypt Node.js?

## Odpowiedź: NIE (w tym wymaganiu).

Ponieważ nie ma potrzeby ręcznej rozbudowy kolekcji/dokumentów, skrypt migracyjny nie jest wymagany.
Ewentualne brakujące pola mogą być tworzone leniwie przy pierwszym zapisie z UI.

---

## Checklist implementacyjny (pod przyszłe wdrożenie)

- [ ] Odseparować „Gry admina” od „Gry do potwierdzenia” i „Najbliższa gra” zgodnie z rekomendacją z analizy przemodelowania.
- [ ] Dodać panel boczny `Organizacja` pod `Cash` i ukryć go dla nie-admina.
- [ ] Zaimplementować TABELA1 (2 wiersze) z typami kolumn: C/A/A.
- [ ] Zaimplementować TABELA2 (dynamiczne wiersze) + `%` w kolumnie wejściowej.
- [ ] Dodać 4 niezależne podzakładki `Żetony ...` z osobnym persistem.
- [ ] Zapewnić synchronizację liczby wierszy TABELAC do TABELAA.
- [ ] W polach obliczalnych stosować zawsze `Math.ceil` i brak miejsc po przecinku.
- [ ] We wszystkich nowych polach liczbowych zastosować `inputmode="numeric"` + `pattern="[0-9]*"` + sanitizację cyfr.
- [ ] Zastosować zabezpieczenia anty-utrata-fokusu zgodnie z `Wazne_Fokus.md`.
- [ ] Ujednolicić `RebuyX` do wejścia liczbowego mobilnie-stabilnego.

---

## Podsumowanie

Zakres wymagań jest spójny i możliwy do wdrożenia bez ręcznych zmian w Firebase.
Kluczowe ryzyka są po stronie UI/state-management (fokus, re-render, synchronizacja snapshotów), nie po stronie struktury bazy.
