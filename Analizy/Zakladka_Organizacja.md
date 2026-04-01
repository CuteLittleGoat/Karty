# Analiza wymagań: Zakładka „Organizacja” (moduł Main)

## Pełna treść prompta użytkownika
Analiza zmian w module Main
Przeczytaj analizę: Analizy/Wazne_przemodelowanie_Gry_admina.md

Następnie przygotuj nową analizę Analizy/Zakladka_Organizacja.md
Zawrzyj tam pełną treść prompta, bez skracania.
Nie wprowadzaj zmian w kodzie. Przygotuj tylko analizę wymagań.
Przeanalizuj wprowadzenie poniższych wymagań. Sprawdź też czy obecna struktura Firebase jest wystarczająca czy trzeba ją rozbudować.
Jeżeli wymagana jest rozbudowa Firebase to napisz jakie dokumenty/kolekcje/pola trzeba dopisać.
Aktualne Rules i strukturę Firebase masz w Analizy/Wazne_Rules.txt i Analizy/Wazne_firestore-schema.txt
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
Drugi wiersz pierwszej kolumny TABELA2 = 20% (użytkownik wpisuje 60)
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

3.3. Druga tabela o nazwie TABELAB będzie się składać z pięciu kolumn i jednego wiersza.
3.3.1. Kolumny a TABELAB:
3.3.1.1. L.GRACZY = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.2. STACK GRACZA = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.3. ŁĄCZNY STACK = Pole obliczalne. Kolumna Typ A. Wartość z kolumny "DLA WSZYSTKICH W SZT." z TABELAC.

3.4. Trzecia tabela o nazwie TABELAC będzie się składać z pięciu kolumn i tylu wierszy ile istnieje w TABELAA w danej zakładce. Jeżeli w TABELAA użytkownik doda lub skasuje wiersz to nowy wiersz ma się pojawić lub zniknąć z TABELAC.
3.4.1. Kolumny w TABELAC:
3.4.1.1. POZOSTAŁE ŻETONY = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny STACK z TABELAA] minus [Wartość z kolumny DLA WSZYSTKICH W SZT. z TABELAC]
3.3.1.1. NOMINAŁ = Pole obliczalne. Kolumna Typ A. Wyświetla wartość z kolumny NOMINAŁ z TABELAA.
3.3.1.2. SZTUK = pole do uzupełnienia przez użytkownika. Przyjmuje wartości liczbowe. Liczby całkowite dodatnie.
3.3.1.3. SUMA = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny NOMINAŁ z TABELAA] pomnożona przez [Wartość z kolumny SZTUK z TABELAC]
3.3.1.4. DLA WSZYSTKICH W SZT. = Pole obliczalne. Kolumna Typ A. Wynik obliczenia: [Wartość z kolumny SZTUK z TABELAC] pomnożona przez [Wartość z kolumny L.GRACZY z TABELAB]

4. Zmodyfikuj kolumny "RebuyX" w modalu "Rebuy Gracza" w ten sposób, żeby przyjmował tylko wartości liczbowe i w aplikacji mobilnej urządzenie nie zmieniało typu klawiatury

---

## Kontekst wejściowy i wnioski z wcześniejszej analizy

### A) Wniosek z `Wazne_przemodelowania_Gry_admina.md`
Do wdrożenia należy rekomendowany wariant separacji: dane z „Gry admina” nie mogą zasilać „Gry do potwierdzenia” ani „Najbliższa gra”.

### B) Typy kolumn (A/B/C)
- Typ A: odczyt / pole obliczalne.
- Typ B: readonly input (wizualnie input).
- Typ C: input edytowalny.

Dla nowych tabel „Organizacja” i „Żetony...” należy używać zgodnie z promptem:
- wpisy użytkownika: Typ C,
- pola liczone: Typ A.

### C) Fokus i mobilna klawiatura (`Wazne_Fokus.md`)
Nowe pola muszą dostać komplet metadanych fokusu (`data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key`) oraz numeryczne hinty wejścia (`type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"`), żeby nie wrócił problem z utratą fokusu i skakaniem kursora.

---

## Analiza wymagania 1: odseparowanie „Gry admina” od innych zakładek

### Wymaganie
Dane dodane w „Gry admina” nie mogą pojawiać się w:
1. „Gry do potwierdzenia”,
2. „Najbliższa gra”.

### Rekomendacja implementacyjna
Najmniej ryzykowna wersja zgodna z wcześniejszą analizą:
- w agregacji „Najbliższa gra” i „Gry do potwierdzenia” odczytywać wyłącznie `UserGames` (bez `Tables`),
- pozostawić „Gry admina” jako kanał analityczno-statystyczny.

### Skutek dla Firebase
- Nie trzeba tworzyć nowych kolekcji tylko dla tego punktu.
- Wystarczy zmiana logiki odczytu po stronie aplikacji.

---

## Analiza wymagania 2: nowa zakładka „Organizacja” w Kalkulatorze

## 2.1 Struktura UI i dostęp
- Dodać tryb boczny `organizacja` pod `cash`.
- Widoczność: wyłącznie panel admina (bez ekspozycji w user view).

## 2.2 TABELA1 (2 wiersze)
Kolumny:
- `KALKULATOR` (Typ C)
  - wiersz 1: procent z sufiksem `%` na UI, wartość obliczeniowa `x / 100`,
  - wiersz 2: liczba bez `%`.
- `ORGANIZACJA` (Typ A)
  - tylko wiersz 1,
  - `ceil(kalkulator_w2 * (kalkulator_w1/100))`.
- `POT` (Typ A)
  - tylko wiersz 1,
  - `ceil(kalkulator_w2 - organizacja)`.

Zaokrąglenie: wszystkie pola obliczalne `Math.ceil(...)`.

## 2.3 TABELA2 (N wierszy)
Kolumny:
1. Kolumna procentowa (Typ C) z `%` w każdym wierszu.
2. `PODZIAŁ` (Typ A):
   - `ceil(organizacja * percent_row)`.

Nagłówek kolumny 1: dynamiczna wartość `ORGANIZACJA` z TABELA1.

Przyciski:
- `Dodaj` pod ostatnim wierszem po lewej,
- `Usuń` po prawej stronie wiersza.

---

## Analiza wymagania 3: podzakładki „Żetony ...” (4 niezależne konteksty)

Wymagane zakładki:
- Żetony cash1,
- Żetony cash2,
- Żetony tournament1,
- Żetony tournament2.

Wszystkie mają identyczny model, ale oddzielny stan i zapis.

## 3.1 TABELAA (N wierszy)
Kolumny:
- `NOMINAŁ` (Typ C, int dodatni),
- `SZTUK` (Typ C, int dodatni),
- `STACK` (Typ A): `ceil(nominal * sztuk)`.

Podsumowanie pod tabelą: `łącznie stack = ceil(sum(STACK))`.

## 3.2 TABELAB (1 wiersz)
Kolumny użytkownika:
- `L.GRACZY` (Typ C, int dodatni),
- `STACK GRACZA` (Typ C, int dodatni).

Kolumna obliczalna:
- `ŁĄCZNY STACK` (Typ A).

Uwaga analityczna: prompt mówi, że `ŁĄCZNY STACK` = „wartość z kolumny DLA WSZYSTKICH W SZT. z TABELAC”. W TABELAC jest wiele wierszy, więc semantyka wymaga doprecyzowania. Rekomendacja: `ŁĄCZNY STACK = suma kolumny DLA WSZYSTKICH W SZT.`.

## 3.3 TABELAC (liczba wierszy = TABELAA)
Kolumny:
- `POZOSTAŁE ŻETONY` (Typ A): `ceil(STACK_z_TABELAA - DLA_WSZYSTKICH_W_SZT)`
- `NOMINAŁ` (Typ A, z TABELAA),
- `SZTUK` (Typ C, int dodatni),
- `SUMA` (Typ A): `ceil(NOMINAŁ * SZTUK)`
- `DLA WSZYSTKICH W SZT.` (Typ A): `ceil(SZTUK * L.GRACZY)`

Synchronizacja wierszy:
- add/remove w TABELAA musi 1:1 dodać/usunąć odpowiedni wiersz w TABELAC (po stabilnym `id`).

---

## Analiza wymagania 4: RebuyX w modalu „Rebuy gracza”

Wymaganie: tylko wartości liczbowe + stabilna klawiatura mobilna.

Stan obecny (z analizy kodu):
- wejścia rebuy już są sanitizowane,
- wymagane jest pełne ujednolicenie atrybutów i walidacji dla wszystkich pól `RebuyX`.

Rekomendacja:
- każdemu `RebuyX` wymusić:
  - `type="text"`
  - `inputmode="numeric"`
  - `pattern="[0-9]*"`
  - `autocomplete="off"`
- na `input`: sanitizacja do cyfr,
- nie przełączać typu input podczas edycji.

---

## Czy obecna struktura Firebase jest wystarczająca?

## Krótka odpowiedź
**Częściowo tak, ale dla czytelności i trwałości nowych sekcji trzeba rozbudować dokumenty `calculators/{type}` o nowe pola stanu.**

## Dlaczego
W `calculators/{type}` już istnieje trwały stan tabel kalkulatora (`table1Row`, `table2Rows`, `table9Rows`, itd.). To naturalne miejsce dla „Organizacja” i „Żetony...”, dzięki czemu:
- zapis przetrwa reload,
- nie trzeba tworzyć nowej kolekcji,
- obecne rules już dopuszczają zapis/odczyt tej ścieżki.

## Proponowana rozbudowa dokumentu `calculators/{type}`
Dla każdego typu (`cash`, `tournament`, `tournament2`) dopisać:

1. `organization` (map)
- `table1`: 
  - `percentInput` (string) — surowe „10”
  - `baseInput` (string) — np. „1000”
- `table2Rows` (array<map>):
  - `id` (string)
  - `percentInput` (string)

2. `chips` (map)
- `cash1`, `cash2`, `tournament1`, `tournament2` (mapy niezależne), każda:
  - `tableAaRows` (array<map>):
    - `id` (string)
    - `nominal` (string)
    - `pieces` (string)
  - `tableAbRow` (map):
    - `playersCount` (string)
    - `playerStack` (string)
  - `tableAcRows` (array<map>):
    - `id` (string; spójny z `tableAaRows.id`)
    - `pieces` (string)

## Rules Firestore
Przy takim wariancie (rozszerzenie dokumentu `calculators/{type}`) **nie jest wymagana zmiana rules**, bo match już obejmuje read/write dla dokumentu i podścieżek kalkulatora.

---

## Wymagania jakościowe (fokus, klawiatura, walidacja, obliczenia)

1. Wszystkie nowe inputy użytkownika:
- Typ C,
- `type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off"`.

2. Każde pole dynamicznie renderowane:
- pełne `data-*` do utrzymania fokusu,
- render i snapshot nie mogą nadpisywać aktywnie edytowanego pola.

3. Wszystkie pola obliczalne:
- Typ A,
- `Math.ceil(...)`,
- format bez przecinków i bez części dziesiętnej.

4. Pola „%”:
- przechowywać wejście jako liczby całkowite bez `%` (np. `10`),
- w UI doklejać `%`,
- do obliczeń używać `value / 100`.

---

## Ryzyka i punkty do doprecyzowania

1. `ŁĄCZNY STACK` w TABELAB odnosi się do pojedynczej wartości z kolumny wielowierszowej TABELAC — należy potwierdzić, czy ma to być suma.
2. Wymaganie dla TABELAB mówi „5 kolumn”, ale zdefiniowano 3 — trzeba doprecyzować nazwy brakujących 2 kolumn lub poprawić liczebność.
3. W przykładzie dla TABELA2 drugi wiersz ma opis „użytkownik wpisuje 60” przy `20%` — traktuję to jako literówkę w przykładzie, nie logikę.

---

## Proponowane zmiany w kodzie (plan, bez wdrożenia)

Main/index.html, linia kodu (sekcja przełącznika kalkulatora)
Było:
Przyciski trybów: Tournament1, Tournament2, Cash.
Będzie:
Dodatkowy przycisk trybu: Organizacja (pod Cash, tylko admin view).

Main/index.html, linia kodu (sekcja zawartości kalkulatora)
Było:
Kontenery tabel dla Tournament1/Tournament2/Cash.
Będzie:
Nowy kontener widoku Organizacja z TABELA1 i TABELA2 + podzakładki „Żetony cash1/cash2/tournament1/tournament2” i tabelami TABELAA/TABELAB/TABELAC.

Main/app.js, linia kodu (inicjalizacja stanu kalkulatora)
Było:
Stan zawiera pola `table1Row`, `table2Rows`, `table3Row`, `table5Mods`, `table5SplitPercents`, `table8Row`, `table9Rows`.
Będzie:
Stan rozszerzony o `organization` i `chips` (cash1/cash2/tournament1/tournament2) z trwałą serializacją do `calculators/{type}`.

Main/app.js, linia kodu (agregacja „Najbliższa gra”)
Było:
Łączenie źródeł `Tables` + `UserGames`.
Będzie:
Agregacja tylko z `UserGames` (zgodnie z rekomendacją przemodelowania „Gry admina”).

Main/app.js, linia kodu (agregacja „Gry do potwierdzenia” admin/user)
Było:
Lista aktywnych gier budowana z `Tables` + `UserGames`.
Będzie:
Lista aktywnych gier budowana wyłącznie z `UserGames`.

Main/app.js, linia kodu (render i input modalu Rebuy gracza)
Było:
Pola `RebuyX` częściowo zależne od bieżącego helpera i sanitizacji.
Będzie:
Pola `RebuyX` jednolicie z `type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"` + twarda sanitizacja cyfr na `input`.

Main/app.js, linia kodu (render nowych pól Organizacja/Żetony)
Było:
Brak metadanych dla nowych pól (bo sekcja nie istnieje).
Będzie:
Każdy nowy input dostaje `data-focus-target`, `data-section`, `data-table-id`, `data-row-id`, `data-column-key` i jest podłączony do mechanizmu przywracania fokusu.
