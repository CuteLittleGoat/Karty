# Rozszerzenie analizy modułu Second — reset globalny `RebuyX` + przenumerowanie po usunięciu stołu

Data: 2026-03-25  
Moduł: `Second`  
Powiązanie: rozszerzenie do `Analizy/Second_TABELA10_rebuy_po_usunieciu_stolu_analiza_2026-03-25.md`

## Prompt użytkownika
> Przeczytaj i rozbuduj analizę Analizy/Second_TABELA10_rebuy_po_usunieciu_stolu_analiza_2026-03-25.md
> Zmienia się koncepcja.
> W panelu "Losowanie Graczy" gdzieś na górze (np. nad kolumną o nazwie ORGANIZATOR) ma być czerwony przycisk "Wyzeruj Rebuy".
> Jego naciśnięcie ma spowodować wyświetlenie się okna z powiadomieniem i ostrzeżeniem mówiącym, że to zmiana nieodwracalna i czy admin jest pewien. Po potwierdzeniu aplikacja ma wyzerować wszystkie "RebuyX".
> Skasować wszystkie dane z kolumn "Rebuy1", "Rebuy2" itd.
> Skasować wyzerować numerację.
> Tak jakbym skasował wszystkich graczy i dodał ich ponownie.
> Ma to ułatwić adminowi tworzenie nowych gier z tymi samymi graczami bez konieczności ponownego przypisywania uprawnień i nadawania numerów PIN.
> Przeprowadź analizę wprowadzenia takiego rozwiązania.
>
> Dodatkowo dopisz do analizy, że celem biznesowym jest, żeby po usunięciu stołu pozostałe istniejące "RebuyX" się przenumerowały. Np. Jeżeli GraczA w Stół1 miał Rebuy1, Rebuy2 a GraczB w Stół2 miał Rebuy3 to po usunięciu Stół1 nazwa kolumny u GraczB ma się zmienić na Rebuy1

---

## 1) Zmiana koncepcji: nowy tryb pracy z rebuy

Względem poprzedniej analizy dochodzą teraz **dwa równoległe wymagania biznesowe**:

1. **Globalny reset rebuy z poziomu UI** (przycisk `Wyzeruj Rebuy` w panelu „Losowanie Graczy”).
2. **Przenumerowanie istniejących `RebuyX` po usunięciu stołu**, tak aby pozostała numeracja ciągła i zaczynała się od `Rebuy1`.

To oznacza przejście z modelu „rebuy jako luźne, historyczne wpisy” na model:
- **operacyjny** (łatwe czyszczenie przed nową grą),
- **spójny numeracyjnie** (bez luk po usunięciach stołów/graczy).

---

## 2) Cel biznesowy (doprecyzowanie)

### 2.1 Cel główny
Administrator ma uruchamiać kolejną grę na tej samej liście graczy (zachowane uprawnienia i PIN), ale z "czystym" obszarem rebuy — bez ręcznego usuwania danych per gracz.

### 2.2 Cel dodatkowy (ważny)
Po usunięciu stołu numeracja rebuy ma zostać „ściśnięta” (renumeracja), np.:
- przed usunięciem: `Rebuy1`, `Rebuy2` (GraczA), `Rebuy3` (GraczB),
- po usunięciu stołu z GraczemA: wpis GraczaB ma być `Rebuy1`.

To jest de facto wymóg na **globalną sekwencję `RebuyX` bez dziur** po każdej operacji usuwającej część danych.

---

## 3) Proponowane rozwiązanie funkcjonalne

### 3.1 Nowy przycisk w UI: `Wyzeruj Rebuy`
Lokalizacja: panel „Losowanie Graczy”, górna część (np. nad sekcją/kolumną `ORGANIZATOR`).

Wymagania UX:
- styl przycisku: czerwony (akcja destrukcyjna),
- przed wykonaniem: modal/confirm z ostrzeżeniem o nieodwracalności,
- treść sugerowana:
  - tytuł: `Wyzerować wszystkie Rebuy?`
  - opis: `Ta operacja jest nieodwracalna. Usunięte zostaną wszystkie wpisy Rebuy1, Rebuy2 itd. dla wszystkich graczy.`
  - CTA: `Tak, wyzeruj Rebuy`.

### 3.2 Efekt po potwierdzeniu
System powinien:
1. usunąć cały zbiór danych rebuy (wszystkie `RebuyX`),
2. wymusić stan jak po „dodaniu graczy od nowa” w zakresie rebuy,
3. wyzerować numerację (kolejny nowy wpis zaczyna od `Rebuy1`),
4. pozostawić bez zmian:
   - listę graczy,
   - przypisane uprawnienia,
   - PIN-y,
   - inne niezależne pola turniejowe.

---

## 4) Przenumerowanie po usunięciu stołu — analiza reguły

### 4.1 Co dokładnie ma się stać
Po usunięciu stołu:
- usuwamy rebuy graczy przypisanych do usuniętego stołu,
- **następnie przenumerowujemy wszystkie pozostałe `RebuyX` globalnie**, aby nie było luk.

### 4.2 Konsekwencja architektoniczna
Żeby to było przewidywalne, numer `X` nie może być traktowany jako trwały identyfikator biznesowy. Powinien być traktowany jako:
- etykieta porządkowa do UI/raportu,
- możliwa do przeliczenia po zmianie zbioru.

Jeśli gdziekolwiek w kodzie lub eksporcie `RebuyX` jest używane jak stabilny klucz referencyjny (np. powiązanie z logiem/audytem), renumeracja wymaga ostrożności i ewentualnego dodatkowego ID technicznego.

---

## 5) Opcje implementacyjne (po zmianie koncepcji)

### Wariant 1 (rekomendowany): Operacje destrukcyjne + centralny mechanizm renumeracji
- `Wyzeruj Rebuy` usuwa wszystkie wpisy rebuy globalnie.
- `Usuń stół` usuwa rebuy graczy z tego stołu.
- Po każdym takim usunięciu uruchamia się funkcja `renumberRebuys()` porządkująca `RebuyX` od 1..N.

**Plusy**
- 1:1 z oczekiwaniem biznesowym.
- Brak ukrytych danych i brak "powrotów" starych wpisów.
- Spójna numeracja po każdej operacji.

**Minusy**
- Operacje nieodwracalne (potrzebne potwierdzenia).
- Konieczność dopilnowania spójności we wszystkich miejscach, które czytają `RebuyX`.

### Wariant 2: Soft reset + wirtualna numeracja w agregacji
- Dane fizycznie nie są usuwane, tylko ukrywane filtrem.
- Numeracja prezentowana „w locie” jako 1..N.

**Dlaczego odradzany przy tym wymaganiu**
- Nie spełnia intencji „tak jakbym usunął i dodał od nowa”.
- Ukryte dane mogą wrócić po zmianie filtra/przypisania.

---

## 6) Scenariusz referencyjny (zgodny z Twoim przykładem)

Stan wejściowy:
- GraczA (Stół1): `Rebuy1`, `Rebuy2`
- GraczB (Stół2): `Rebuy3`

Akcja: usunięcie Stół1.

Oczekiwany stan końcowy:
- wpisy GraczA usunięte,
- wpis GraczB przenumerowany z `Rebuy3` na `Rebuy1`,
- agregaty (`LICZ. REBUY/ADD-ON`, suma) zgodne z nowym stanem.

---

## 7) Proponowana logika techniczna (wysoki poziom)

1. Zbudować listę aktywnych wpisów rebuy po operacji usunięcia (stołu lub globalnego resetu).
2. Posortować je deterministycznie (np. po czasie utworzenia, a przy remisie po `playerId`).
3. Nadać nowe klucze: `Rebuy1..RebuyN`.
4. Zapisać zrenumerowaną strukturę atomowo.

Warunek krytyczny: deterministyczny porządek, żeby dwa odświeżenia nie dawały różnych numerów.

---

## 8) Ryzyka i zabezpieczenia

### 8.1 Ryzyka
- Utrata danych przy błędnym kliknięciu `Wyzeruj Rebuy`.
- Niespójność numeracji, jeśli renumeracja nie wykona się atomowo.
- Potencjalny konflikt, jeśli dwóch adminów równolegle zmienia te same dane.

### 8.2 Zabezpieczenia
- Mocny confirm/modal (opcjonalnie wpisanie słowa `RESET`).
- Blokada wielokliku i stan „trwa operacja”.
- Operacja transakcyjna/batch update.
- Krótki komunikat po sukcesie: `Wyzerowano Rebuy (0 wpisów aktywnych)` lub `Przenumerowano Rebuy: 1..N`.

---

## 9) Wpływ na UX i proces admina

Po wdrożeniu admin:
- nie musi kasować graczy,
- nie traci konfiguracji kont/uprawnień/PIN,
- może szybko przygotować nową grę,
- ma przewidywalną numerację rebuy po zmianach struktury stołów.

To realizuje dokładnie cel operacyjny: **krótszy czas przygotowania kolejnej gry, mniej ręcznych kroków, mniejsze ryzyko pomyłek**.

---

## 10) Rekomendacja końcowa

Rekomendowane jest wdrożenie:
1. czerwonego przycisku `Wyzeruj Rebuy` + ostrzeżenia o nieodwracalności,
2. twardego resetu wszystkich `RebuyX` po potwierdzeniu,
3. automatycznej renumeracji pozostałych `RebuyX` po usunięciu stołu,
4. testów scenariuszy destrukcyjnych i współbieżnych.

To podejście jest najbardziej spójne z nową koncepcją i z podanym celem biznesowym.
