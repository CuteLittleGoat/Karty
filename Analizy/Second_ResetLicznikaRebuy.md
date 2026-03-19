# Analiza: Second — licznik Rebuy nie resetuje się po usunięciu danych

## Prompt użytkownika
"Moduł Second.

Przeczytaj archiwalną analizę Analizy/Wazne_NumeracjaRebuy.md
Są tam opisane kroki klikania przycisków \"Dodaj Rebuy\" i \"Usuń Rebuy\" oraz wartości jakich oczekuję.
Usunąłem wszystkie archiwalne dane (poprzez UI użytkownika), ale jest problem z TABELA10 kolumna LICZ. REBUY/ADD-ON
Wygląda jakby przechowywała ona błędną wartość.
Przeprowadź nową analizę poprawności działania funkcjonalności i poprawności obliczeń.
STAN NA TERAZ:
1. Nie mam żadnych dodanych graczy w panelu Losowanie Graczy
2. W kolumnie LICZ. REBUY/ADD-ON mam wartość 32
3. Dodaję trzech graczy i dwa stoły
4. Przypisuję graczy do stołów
5. U pierwszego gracza naciskam \"Dodaj Rebuy\". Pojawia się kolumna \"Rebuy40\".

Przeprowadź analizę czemu tak się dzieje. Przeprowadź analizę czemu licznik Rebuy się nie resetuje.
Przeprowadź analizę w jakich sytuacjach licznik się obecnie resetuje.
Przeprowadź analizę co należy zrobić, żeby licznik resetował się:
a. automatycznie po usunięciu wszystkich stołów i graczy
b. ręcznie poprzez dodanie nowego przycisku - przycisk miałby również automatycznie usuwać wszystkie dodane kolumny \"RebuyX\" w TABELA12 u wszystkich graczy.

Dodatkowo sprawdź czy inne pola obliczalne zależne od sumy lub liczby \"Rebuy\" w innych miejscach aplikacji będą prawidłowo działać po wprowadzeniu mechanizmu resetowania licznika.
Sprawdź też czy obecnie są takie pola i czy obecnie działają prawidłowo.

Przygotuj nowy plik w \"Analizy\" zawierający wszystkie wnioski."

---

## 1. Najkrótsza odpowiedź

Problem nie wynika z samego liczenia w TABELA10, tylko z tego, że moduł `Second` nadal bierze pod uwagę stare wpisy przechowywane w `payments.table12Rebuys`, nawet gdy w UI nie ma już żadnych aktualnych graczy.

Najważniejsza przyczyna jest podwójna:

1. **Agregacja rebuy iteruje po całym `payments.table12Rebuys`, a nie po aktualnej liście `players`.**
2. **Zapis do Firestore używa `docRef.set(..., { merge: true })`, więc usunięcie klucza lokalnie nie usuwa automatycznie zagnieżdżonego pola z dokumentu w bazie.**

W praktyce oznacza to, że:
- stare rekordy `table12Rebuys[staryPlayerId]` mogą nadal fizycznie istnieć w dokumencie,
- licznik w TABELA10 dalej je zlicza,
- mechanizm nadawania numeru nowej kolumnie bierze najwyższy historyczny indeks globalny, więc nowy rebuy zaczyna się od wysokiego numeru.

---

## 2. Jak obecnie działa licznik i numeracja Rebuy w module Second

### 2.1. Źródło danych
Stan rebuy jest trzymany w strukturze:

```js
payments.table12Rebuys[playerId] = {
  values: [...],
  indexes: [...]
}
```

Każdy gracz ma:
- `values` — wpisane kwoty rebuy,
- `indexes` — globalne numery kolumn `RebuyX`.

### 2.2. Skąd bierze się licznik w TABELA10
TABELA10 nie liczy rebuyów z aktualnie widocznych graczy w TABELA12, tylko z tej funkcji logicznej:
- pobierz wszystkie wpisy z `payments.table12Rebuys`,
- odfiltruj puste wartości,
- policz długość listy.

Czyli faktycznie licznik jest równy:

**liczba niepustych wartości we wszystkich wpisach `table12Rebuys`, także osieroconych**.

### 2.3. Skąd bierze się numer nowej kolumny `RebuyX`
Przycisk `Dodaj Rebuy` wyznacza nowy numer jako:

**`max(index we wszystkich wpisach table12Rebuys) + 1`**

To oznacza, że numer nowej kolumny nie zależy od:
- liczby aktualnych graczy,
- liczby widocznych wierszy w TABELA12,
- wartości z TABELA10.

Zależy wyłącznie od najwyższego indeksu zachowanego w `payments.table12Rebuys`.

---

## 3. Dlaczego przy stanie „brak graczy”, TABELA10 pokazuje 32

Jeżeli nie ma żadnych graczy w panelu losowania, ale TABELA10 pokazuje `LICZ. REBUY/ADD-ON = 32`, to oznacza, że w `payments.table12Rebuys` nadal istnieją stare wpisy, których aplikacja już nie wiąże z aktywnymi graczami.

Najbardziej prawdopodobny scenariusz:

1. historycznie istnieli gracze z rebuyami,
2. zostali usunięci z UI,
3. lokalny obiekt `tournamentState.payments.table12Rebuys[playerId]` został usunięty przez `delete`,
4. ale zapis `docRef.set(..., { merge: true })` nie usunął odpowiadających kluczy z dokumentu w Firestore,
5. po kolejnym odczycie/snapshocie stare klucze wróciły z bazy,
6. `getAllTable12RebuyEntries()` nadal je agreguje,
7. TABELA10 dalej pokazuje historyczny licznik.

To zachowanie jest spójne z widocznym objawem „brak aktywnych graczy, ale licznik nadal dodatni”.

---

## 4. Dlaczego po dodaniu pierwszego nowego rebuy pojawia się `Rebuy40`

To oznacza, że w danych istnieje rozjazd pomiędzy:
- **liczbą niepustych rebuyów**,
- a **najwyższym zachowanym globalnym numerem indeksu**.

Jeżeli po kliknięciu `Dodaj Rebuy` powstaje `Rebuy40`, to aplikacja najpewniej widzi w `payments.table12Rebuys` indeks maksymalny równy `39`.

Jednocześnie TABELA10 pokazuje `32`, bo tam liczona jest tylko liczba **niepustych** wartości.

To oznacza, że historycznie istnieje prawdopodobnie taki stan jak poniżej:
- część dawnych kolumn nadal istnieje w `indexes`,
- część z nich ma pustą wartość w `values`,
- albo istnieją osierocone rekordy graczy z dawnymi indeksami,
- dlatego `rebuyCount = 32`, ale `nextIndex = 40`.

Innymi słowy:
- **TABELA10 patrzy na liczbę niepustych wartości**,
- **modal `Dodaj Rebuy` patrzy na największy numer indeksu**.

Oba wyniki mogą więc być różne i w Twoim przypadku właśnie są różne.

---

## 5. Dlaczego licznik Rebuy obecnie się nie resetuje

## 5.1. Pierwsza przyczyna: brak filtrowania po aktualnych graczach
Funkcja agregująca zbiera wpisy z całego `payments.table12Rebuys` bez sprawdzania, czy `playerId` nadal istnieje w `tournamentState.players`.

Skutek:
- nawet jeśli gracz już nie istnieje w UI,
- jego rebuye nadal mogą być liczone do TABELA10 / TABELA13 / TABELA16.

## 5.2. Druga przyczyna: zapis z `merge: true`
Usunięcie klucza z lokalnego obiektu JavaScript nie oznacza jeszcze fizycznego usunięcia pola z dokumentu Firestore.

Przy obecnym zapisie:

```js
await docRef.set({ ...tournamentState, updatedAt: ... }, { merge: true })
```

brakujący klucz w zagnieżdżonej mapie nie jest traktowany jako instrukcja skasowania starego pola.

To oznacza, że te mapy są szczególnie narażone na „duchy danych”:
- `payments.table12Rebuys`,
- `pool.rebuyValues`,
- potencjalnie inne słowniki kluczowane `playerId` / `rowId`.

## 5.3. Trzecia przyczyna: brak automatycznego cleanup po wyczyszczeniu turnieju
Kod usuwa:
- pojedynczego gracza (`delete-player`),
- pojedynczy stół (`delete-table`),

ale nie ma centralnego mechanizmu typu:
- „jeżeli nie ma już żadnych graczy i żadnych stołów, wyczyść cały stan rebuy”,
- „przywróć pusty stan `payments.table12Rebuys` i `pool.rebuyValues`”,
- „wyzeruj globalną numerację”.

Dlatego licznik resetuje się tylko wtedy, gdy przypadkiem znikną wszystkie źródłowe wpisy rebuy, a obecnie w praktyce nie ma gwarancji, że znikną one również z bazy.

---

## 6. W jakich sytuacjach licznik resetuje się obecnie

### 6.1. Reset poprawny w pamięci lokalnej — gdy znikną wszystkie wpisane wartości rebuy
Jeżeli w **bieżącym lokalnym stanie** `payments.table12Rebuys` nie ma już żadnej niepustej wartości, to:
- `allRebuyValues.length === 0`,
- TABELA10 pokaże `0`,
- TABELA13 pokaże `0`,
- sumy `rebuyTotal` spadną do `0`.

To jednak nie gwarantuje trwałego resetu po synchronizacji z Firestore.

### 6.2. Reset numeracji — tylko gdy naprawdę nie ma już żadnego indeksu w `table12Rebuys`
Numeracja wraca do `Rebuy1` tylko wtedy, gdy `getAllTable12RebuyEntries()` zwraca pustą listę, czyli gdy w całym `payments.table12Rebuys` nie ma żadnego wpisu `indexes`.

To jest warunek znacznie ostrzejszy niż sam spadek licznika w TABELA10 do zera.

### 6.3. Reset po świeżym dokumencie / ręcznym wyczyszczeniu dokumentu
Pełny reset następuje poprawnie, jeżeli źródłowy dokument turniejowy jest naprawdę pusty albo ma świeżo utworzony stan domyślny `createTournamentDefaultState()`.

### 6.4. Czego obecnie NIE można uznać za pewny reset
Nie ma gwarancji resetu po:
- usunięciu wszystkich graczy przez UI,
- usunięciu wszystkich stołów przez UI,
- usunięciu przypisań graczy do stołów,
- wyczyszczeniu widoku TABELA12 „wizualnie”.

Powód: stare dane rebuy mogą nadal zostać w dokumencie Firestore i zostać ponownie wczytane.

---

## 7. Co dokładnie trzeba zrobić, aby licznik resetował się automatycznie po usunięciu wszystkich stołów i graczy

Potrzebne są **trzy warstwy naprawy**.

### 7.1. Warstwa A — liczyć rebuye tylko dla aktywnych graczy
Funkcje agregujące powinny brać pod uwagę tylko te wpisy `table12Rebuys`, których `playerId` nadal istnieje w `tournamentState.players`.

Najbezpieczniejsza zasada:
- utworzyć `activePlayerIds = new Set(tournamentState.players.map(player => player.id))`,
- w `getAllTable12RebuyEntries()` odrzucać każdy wpis, którego `playerId` nie należy do `activePlayerIds`.

To natychmiast naprawi objaw w UI:
- brak graczy => licznik 0,
- brak graczy => brak historycznych rebuyów w obliczeniach,
- nowa numeracja będzie liczona tylko z aktywnych danych.

### 7.2. Warstwa B — fizycznie czyścić osierocone wpisy ze stanu i z Firestore
Samo filtrowanie w obliczeniach nie wystarczy. Trzeba jeszcze czyścić stan trwały.

Po każdej operacji usuwania gracza lub po globalnym cleanupie należy:
- skasować `payments.table12Rebuys[playerId]`,
- skasować powiązane dane zależne,
- wysłać do Firestore jawne kasowanie pól, a nie tylko `set(..., merge: true)` bez klucza.

Technicznie są dwie sensowne drogi:

#### Opcja 1 — użyć `update()` z `FieldValue.delete()` dla konkretnych ścieżek
Np. dla usuwanego gracza:
- `payments.table12Rebuys.<playerId> = FieldValue.delete()`
- oraz ewentualne ścieżki zależne.

To jest najbezpieczniejsze przy usuwaniu pojedynczych kluczy z map.

#### Opcja 2 — przy pełnym resecie nadpisać cały dokument pełnym czystym stanem bez `merge: true`
Np. dla resetu rebuy:
- przygotować nowy stan z pustym `payments.table12Rebuys = {}`,
- pustym `pool.rebuyValues = {}`,
- zapisać dokument w sposób nadpisujący odpowiednie mapy, a nie merge’ujący stare dane.

### 7.3. Warstwa C — dodać automatyczny cleanup po stanie „0 stołów i 0 graczy”
Po kliknięciu `Usuń` dla gracza lub stołu kod powinien sprawdzać:

```text
czy players.length === 0 i tables.length === 0 ?
```

Jeżeli tak, należy wykonać dedykowaną procedurę resetu rebuy, która:
- czyści `payments.table12Rebuys`,
- czyści `pool.rebuyValues`,
- opcjonalnie czyści pomocnicze pola zależne od rebuy, jeśli mają być semantycznie zerowane,
- zapisuje tę zmianę do Firestore w sposób usuwający również stare pola z dokumentu.

To spełni wymaganie:
**automatyczny reset po usunięciu wszystkich stołów i graczy**.

---

## 8. Co trzeba zrobić, aby licznik resetował się ręcznie nowym przyciskiem

Najlepsze rozwiązanie to dodać przycisk typu np.:

- `Resetuj Rebuy`
- albo `Wyczyść Rebuy`

który wykona jedną, atomową procedurę.

### 8.1. Zakres działania przycisku
Przycisk powinien:
1. wyczyścić `payments.table12Rebuys` dla wszystkich graczy,
2. wyczyścić wszystkie dynamiczne kolumny `RebuyX` w TABELA12, bo ich źródło danych zniknie,
3. wyczyścić `pool.rebuyValues`, żeby TABELA16 nie trzymała ręcznych nadpisań dla dawnych kolumn,
4. zapisać stan do Firestore tak, aby stare wpisy naprawdę zniknęły z dokumentu,
5. po zapisie wymusić przeliczenie całej sekcji płatności / puli / grup.

### 8.2. Co ma się wydarzyć po kliknięciu
Po poprawnym resecie:
- TABELA10 `LICZ. REBUY/ADD-ON = 0`,
- TABELA11 `REBUY/ADD-ON = 0`,
- TABELA13 `LICZBA REBUY = 0`,
- TABELA14 `REBUY/ADD-ON = 0`,
- TABELA16 nie pokazuje kolumn `REBUY1..REBUYX`,
- TABELA19 pokazuje `REBUY/ADD-ON = 0` dla wszystkich graczy,
- pierwszy nowo dodany rebuy zaczyna się od `Rebuy1`.

### 8.3. Dodatkowa rekomendacja UX
Przycisk powinien mieć:
- potwierdzenie typu `confirm`,
- komunikat ostrzegający, że usuwa wszystkie kolumny `RebuyX` i ręczne rozdzielenie rebuy w TABELA16.

To jest ważne, bo reset uderza nie tylko w TABELA12, ale też w dane puli.

---

## 9. Czy inne pola obliczalne zależne od Rebuy istnieją i jak działają obecnie

Tak — w module `Second` jest kilka miejsc zależnych od liczby lub sumy rebuy.

## 9.1. TABELA10 / TABELA13 — liczba rebuy
Oba miejsca korzystają z tego samego `rebuyCount`.

### Obecnie
- liczą **liczbę niepustych wartości** rebuy,
- działają arytmetycznie poprawnie dla danych, które faktycznie trafiają do agregacji,
- ale są podatne na zawyżenie przez osierocone wpisy historyczne.

### Po wprowadzeniu resetu
Będą działać poprawnie, o ile agregacja będzie filtrować tylko aktywnych graczy albo reset będzie fizycznie czyścił stare dane.

## 9.2. TABELA11 / TABELA14 — suma rebuy i wpływ na rake/pot
Te tabele używają `rebuyTotal`, czyli sumy wszystkich niepustych wartości rebuy.

### Obecnie
- matematycznie działają poprawnie,
- ale jeśli w danych siedzą stare rebuye, to:
  - `REBUY/ADD-ON` jest zawyżone,
  - `RAKE` jest zawyżony,
  - `POT` jest zawyżony.

### Po wprowadzeniu resetu
Będą działać poprawnie, bo po wyzerowaniu źródła danych `rebuyTotal` spadnie do zera.

## 9.3. TABELA16 — dynamiczne kolumny REBUY1..X i podział puli
To jest najbardziej wrażliwe miejsce.

### Obecnie
- liczba kolumn zależy od `allRebuyValues.length`,
- pierwsze 30 rebuyów jest automatycznie rozdzielane wg `rebuyRowMapping`,
- kolumny powyżej 30 mogą mieć ręczne nadpisania w `pool.rebuyValues`.

### Ryzyko obecnie
Jeżeli licznik i indeksy nie są wyczyszczone:
- TABELA16 nadal może mieć historyczne kolumny `REBUY1..X`,
- `pool.rebuyValues` może zachować ręczne dane do nieistniejących już rebuyów,
- użytkownik widzi stary układ puli mimo wyczyszczenia graczy.

### Po wprowadzeniu resetu
Będzie działać poprawnie tylko wtedy, gdy reset usunie jednocześnie:
- `payments.table12Rebuys`,
- `pool.rebuyValues`.

Samo skasowanie `table12Rebuys` bez wyczyszczenia `pool.rebuyValues` zostawi martwe ręczne dane, które semantycznie nie będą już miały do czego się odnosić.

## 9.4. TABELA19 — `REBUY/ADD-ON` liczone ze sztuk rebuy
W grupach kwota `REBUY/ADD-ON` dla gracza jest liczona jako:

**`rebuyStack * liczba niepustych rebuy danego gracza`**

### Obecnie
- dla aktywnego gracza działa poprawnie,
- ale tylko jeśli jego wpis `table12Rebuys[playerId]` jest prawidłowy,
- osieroceni gracze nie trafiają do wierszy TABELI19, więc to miejsce jest mniej podatne niż TABELA10/TABELA16.

### Po resecie
Będzie działać poprawnie — po wyczyszczeniu rebuyów każdy gracz będzie miał mnożnik 0.

---

## 10. Czy reset może popsuć inne pola obliczalne

Jeżeli reset zostanie wykonany poprawnie, to nie powinien popsuć obliczeń. Wręcz przeciwnie — usunie stan niespójny.

Warunki bezpieczeństwa są trzy:

1. **agregacje muszą liczyć tylko aktualne dane**,
2. **reset musi usuwać także `pool.rebuyValues`**,
3. **zapis do Firestore musi rzeczywiście usuwać stare pola, a nie tylko pomijać je w lokalnym obiekcie**.

Jeżeli któryś z tych warunków nie zostanie spełniony, mogą zostać resztki danych powodujące:
- zawyżone liczniki,
- zawyżone sumy,
- historyczne kolumny w TABELA16,
- rozjazd między TABELĄ10 a numeracją `RebuyX`.

---

## 11. Rekomendowany plan zmian w kodzie

## Etap 1 — szybka naprawa logiczna
1. Zmienić `getAllTable12RebuyEntries()`, aby brało pod uwagę wyłącznie aktywnych graczy.
2. Dzięki temu od razu zniknie objaw:
   - brak graczy, a licznik > 0,
   - pierwszy nowy rebuy zaczyna się od wysokiego numeru przez osierocone rekordy.

## Etap 2 — trwały cleanup danych
1. Przy usuwaniu gracza usuwać jego wpis z Firestore jawnie przez `FieldValue.delete()`.
2. Przy pełnym resecie nadpisywać/czyścić także `pool.rebuyValues`.
3. Dodać procedurę „cleanup osieroconych rebuyów”, która podczas ładowania lub zapisu usuwa wpisy dla nieistniejących `playerId`.

## Etap 3 — automatyczny reset po braku graczy i stołów
1. Po `delete-player` i `delete-table` sprawdzać, czy `players.length === 0 && tables.length === 0`.
2. Jeśli tak — uruchomić pełny reset rebuy.

## Etap 4 — ręczny przycisk resetu
1. Dodać przycisk w sekcji płatności.
2. Kliknięcie ma czyścić:
   - `payments.table12Rebuys`,
   - `pool.rebuyValues`.
3. Po zapisie renderować widok od nowa.

---

## 12. Końcowy wniosek

### Dlaczego tak się dzieje?
Bo aplikacja nadal agreguje stare wpisy rebuy z `payments.table12Rebuys`, a obecny sposób zapisu do Firestore z `merge: true` nie gwarantuje fizycznego usuwania skasowanych kluczy z dokumentu.

### Dlaczego licznik się nie resetuje?
Bo reset nie jest oparty o faktyczne wyczyszczenie całego źródła danych rebuy, tylko o bieżący stan UI, a osierocone dane pozostają w dokumencie i są ponownie wczytywane.

### Dlaczego pojawia się `Rebuy40` przy liczniku 32?
Bo licznik TABELA10 opiera się na liczbie **niepustych wartości**, a nowy numer kolumny opiera się na **najwyższym historycznym indeksie globalnym**. To dwa różne mechanizmy, więc przy zalegających danych mogą dawać różne wyniki.

### Co trzeba zrobić?
Trzeba wdrożyć jednocześnie:
1. filtrowanie agregacji do aktywnych graczy,
2. prawdziwe usuwanie pól z Firestore,
3. automatyczny reset przy stanie „0 graczy i 0 stołów”,
4. ręczny przycisk pełnego resetu rebuy czyszczący także `pool.rebuyValues`.

Dopiero taki komplet zmian zapewni, że:
- licznik będzie wracał do zera,
- pierwszy nowy rebuy zacznie się od `Rebuy1`,
- TABELA10/TABELA11/TABELA13/TABELA14/TABELA16/TABELA19 pozostaną spójne.
