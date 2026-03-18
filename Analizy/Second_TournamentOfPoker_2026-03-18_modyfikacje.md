# Analiza zmian — Second / Tournament of Poker / 2026-03-18

## Prompt użytkownika
"Modyfikacja modułu Second.
Zakładka Tournament of Poker

1. Panel Wpłaty
1.1 Tabela11, kolumna RAKE = Pole obliczeniowe. Wyświetla wynik obliczenia:
((Suma wartości z Kolumny BUY-IN z Tabela12) plus (Suma wartości z Kolumny REBUY z Tabela12)) pomnożona przez wartość z kolumny % z Tabela11 (czyli jak w % jest wpisane 10, wyświetlane jako 10% to masz pomnożyć przez 0.10)
1.2 Tabela12, zamienić miejscami kolumny STÓŁ i LP
1.3 Tabela12, zrobić styl zebra striping. Nie stosuj zebra striping liczonego per wiersz. Zamiast tego zastosuj zebra striping per grupa stołu: każdy unikalny stół tworzy jedną grupę kolorystyczną, a kolory mają się zmieniać naprzemiennie między kolejnymi stołami.

3. Panel Faza Grupowa
3.1 Tabela19, zamienić miejscami kolumny STÓŁ i LP
3.2 Tabela19, kolumna REBUY = kolumna do skasowania
3.3 Tabela19, kolumna REBUY/ADD-ON = Pole obliczalne. Domyślnie przyjmuje wartość 0. Natomiast jeżeli:
3.3.1 Jeżeli dany gracz w panelu Wpłaty w Tabela12 ma wpisaną jakąś wartość w kolumnie REBUY to w Tabela19 w kolumnie REBUY/ADD-ON pojawia się wartość z Tabela17 kolumna REBUY/ADD-ON
3.3.2 Jeżeli dany gracz ma uzupełnione dwie kolumny typu "RebuyX" w modalu "Rebuy gracza" w Tabela12 w kolumnie REBUY to w Tabela19 w kolumnie REBUY/ADD-ON pojawia się wartość z Tabela17 kolumna REBUY/ADD-ON pomnożona przez dwa
3.3.3 Jeżeli dany gracz ma uzupełnione trzy kolumny typu "RebuyX" w modalu "Rebuy gracza" w Tabela12 w kolumnie REBUY to w Tabela19 w kolumnie REBUY/ADD-ON pojawia się wartość z Tabela17 kolumna REBUY/ADD-ON pomnożona przez trzy
3.3.4 mechanizm z 3.3.1, 3.3.2 i 3.3.4 działa dalej w zależności od uzupełnionych kolumn typu Rebuy w modalu "Rebuy gracza" w Tabela12 w kolumnie REBUY

3.4 Tabela19, zrobić styl zebra striping. Nie stosuj zebra striping liczonego per wiersz. Zamiast tego zastosuj zebra striping per grupa stołu: każdy unikalny stół tworzy jedną grupę kolorystyczną, a kolory mają się zmieniać naprzemiennie między kolejnymi stołami.

3.5 Dodać tabelę o nazwie TABELA19A. Ma zawierać kolumny:
3.5.1 LP = wartość uzupełniana automatycznie
3.5.2 WYELIMINOWANI GRACZE = Mają się tu pojawiać gracze, którzy mają zaznaczony w TABELA19 checkbox w kolumnie ELIMINATED. Nie wszyscy gracze w TABELA19 będę mieć zaznaczony checkbox. TABELA19A ma dynamicznie zmieniać ilość wierszy. Jeżeli żaden z graczy w TABELA19 nie ma zaznaczonego checkbox w kolumnie ELIMINATED to TABELA19A ma tylko nagłówki kolumn. Jak zaznaczę pierwszy checkbox to pojawia się pierwszy wiersz z pierwszym graczem. Jak zaznaczę drugi checkbox to pojawia się drugi wiersz itd. 
3.5.3 WYGRANA = Pole liczbowe. Domyślnie wartość 0. Możliwość edycji przez użytkownika.

3.6 Dodać tabelę o nazwie TABELA19B. Ma zawierać kolumny:
3.6.1 LP = wartość uzupełniana automatycznie
3.6.2 STÓŁ = Dane z TABELA19 kolumna STÓŁ
3.6.3 GRACZ = Mają tu być gracze, którzy nie mają zaznaczonego checkbox w kolumnie ELIMINATED w TABELA19. Ilość wierszy w TABELA19B ma się zmieniać dynamicznie. Jak zaznaczę graczowi checkbox w kolumnie ELIMINATED w TABELA19 to wiersz ma zniknąć z TABELA19B a dodać się do TABELA19A (wymaganie numer 3.5.2)
3.6.4 STACK = pole liczbowe do uzupełnienia przez użytkownika. Domyślnie puste.
3.6.5 % = pole obliczalne. Wynik obliczeń: Wartość z kolumny STACK z TABELA19B podzielona przez wartość z kolumny ŁĄCZNY STACK z TABELA18 w panelu Faza Grupowa.

Dodatkowo w folderze Analizy zamieść bardzo dokładną instrukcję które linie kodu zmieniasz. Jaki jest stan "na teraz" i na jaki zmienisz, żeby wprowadzić te zmiany. Dokładne wskazanie plików i miejsc zmian. Ma to być repozytorium, żeby potem ewentualnie cofnąć którąś ze zmian."

## Pliki objęte zmianą
- `Second/app.js`
- `Second/styles.css`
- `Second/docs/README.md`
- `Second/docs/Documentation.md`
- `DetaleLayout.md`
- `Kolumny.md`

## Szczegółowa instrukcja zmian (stan „przed” → stan „po”)

### 1. `Second/app.js`

#### 1.1. Rozszerzenie stanu `group`
- **Miejsce zmiany:** linie `619-623`.
- **Przed:** sekcja `group` przechowywała tylko `playerStacks` i `eliminated`.
- **Po:** dodane zostały także `eliminatedWins` i `survivorStacks`, żeby obsłużyć nowe tabele `Tabela19A` i `Tabela19B`.
- **Cel cofnięcia:** usunięcie tych dwóch kluczy przywróci poprzedni model danych dla fazy grupowej.

#### 1.2. Normalizacja stanu po odczycie z Firebase
- **Miejsce zmiany:** linie `661-665`.
- **Przed:** przy normalizacji nie było gwarancji istnienia `group.eliminatedWins` i `group.survivorStacks`.
- **Po:** każda z tych struktur jest tworzona jako pusty obiekt, jeśli nie istnieje.
- **Cel cofnięcia:** usunąć inicjalizację nowych właściwości, jeżeli aplikacja ma wrócić do starszego schematu.

#### 1.3. Helper do zebra striping per grupa stołu
- **Miejsce zmiany:** linie `685-697`.
- **Przed:** brak funkcji grupującej naprzemienne kolory po stołach.
- **Po:** dodano `getAlternatingTableGroupClass(rows, getTableKey)`, które przypisuje klasę `t-group-stripe-even` albo `t-group-stripe-odd` całym blokom tego samego stołu.
- **Cel cofnięcia:** usunąć helper oraz jego użycie w `Tabela12` i `Tabela19`.

#### 1.4. Przeliczenie `Tabela11.RAKE`
- **Miejsce zmiany:** linie `1263-1268`.
- **Przed:** `RAKE` było liczone wyłącznie z `Tabela10.SUMA * %`, czyli bez uwzględnienia sumy rebuy.
- **Po:** `RAKE` jest liczone jako `(totalBuyInFromDraw + rebuyTotal) * rakePercent`.
- **Cel cofnięcia:** przywrócić wcześniejszy wzór `table10.sum * rakePercent`.

#### 1.5. `Tabela12` — zamiana miejscami kolumn i zebra striping
- **Miejsce zmiany:** linie `1347-1349`.
- **Przed:** nagłówki i komórki miały kolejność `STÓŁ`, `LP`, `GRACZ`, `BUY-IN`, `REBUY`; brak klas kolorystycznych per stół.
- **Po:** kolejność została zmieniona na `LP`, `STÓŁ`, `GRACZ`, `BUY-IN`, `REBUY`, a każdy wiersz dostaje klasę z helpera `getAlternatingTableGroupClass(...)`.
- **Cel cofnięcia:** przywrócić wcześniejszą kolejność nagłówków/komórek i usunąć `class="${paymentsStripeClasses[index]}"`.

#### 1.6. `Tabela19`, `Tabela19A`, `Tabela19B`
- **Miejsce zmiany:** linie `1458-1486`.
- **Przed:** `Tabela19` miała kolumny `STÓŁ`, `LP`, `GRACZ`, `ELIMINATED`, `STACK`, `REBUY/ADD-ON`, `REBUY`; brak dodatkowych tabel `19A` i `19B`; `REBUY/ADD-ON` było stałą wartością z `rebuyStackValue`, a `REBUY` pokazywało sumę przycisku z `Tabela12`.
- **Po:**
  - `Tabela19` ma kolumny `LP`, `STÓŁ`, `GRACZ`, `ELIMINATED`, `STACK`, `REBUY/ADD-ON`,
  - kolumna `REBUY` została usunięta,
  - `REBUY/ADD-ON` jest liczone jako `rebuyStackValue * liczba niepustych pól RebuyX` danego gracza,
  - dodano zebra striping per grupa stołu,
  - dodano `Tabela19A` z graczami wyeliminowanymi i polem `WYGRANA`,
  - dodano `Tabela19B` z graczami niewyeliminowanymi i polem `STACK`,
  - `%` w `Tabela19B` jest liczone jako `STACK / Tabela18.ŁĄCZNY STACK`.
- **Cel cofnięcia:** przywrócić pojedynczy render dawnej `Tabela19` i usunąć render bloków `Tabela19A` oraz `Tabela19B`.

#### 1.7. Obsługa nowych inputów w `input` handlerze
- **Miejsce zmiany:** linie `1521-1557`.
- **Przed:** handler nie znał ról `group-eliminated-win` i `group-survivor-stack`.
- **Po:**
  - nowe role są sanityzowane do cyfr,
  - `group-eliminated-win` zapisuje wartość do `group.eliminatedWins[playerId]`,
  - `group-survivor-stack` zapisuje wartość do `group.survivorStacks[playerId]`.
- **Cel cofnięcia:** usunąć nowe role z listy oraz dwa przypisania w handlerze.

#### 1.8. Czyszczenie danych nowych tabel przy usuwaniu gracza
- **Miejsce zmiany:** linie `1670-1673`.
- **Przed:** usuwanie gracza czyściło tylko `group.playerStacks` i `group.eliminated`.
- **Po:** czyszczone są też `group.eliminatedWins[playerId]` i `group.survivorStacks[playerId]`.
- **Cel cofnięcia:** usunąć dwa dodatkowe `delete`.

### 2. `Second/styles.css`

#### 2.1. Style zebra striping per grupa stołu
- **Miejsce zmiany:** linie `299-309`.
- **Przed:** tabela miała tylko wspólny hover dla wiersza; brak rozróżnienia wizualnego grup stołów.
- **Po:** dodano klasy `.t-group-stripe-even` i `.t-group-stripe-odd` oraz osobny hover dla tych klas.
- **Cel cofnięcia:** usunąć ten blok CSS i pozostawić jedynie globalny hover.

### 3. `Second/docs/README.md`
- **Miejsca zmian:** linie `49-58`, `65-80`, `122-162`.
- **Przed:** dokumentacja użytkownika nadal opisywała stary układ `Tabela12`, stary `Tabela19`, brak `Tabela19A/19B` i dawny sposób liczenia `RAKE`.
- **Po:** instrukcja użytkownika opisuje nowy układ kolumn, zebra striping per stół, nowe obliczenia `RAKE`, nowe tabele `19A` i `19B` oraz dynamiczne przenoszenie graczy między nimi.
- **Cel cofnięcia:** przywrócić poprzedni opis UI dla sekcji `Wpłaty` i `Faza grupowa`.

### 4. `Second/docs/Documentation.md`
- **Miejsca zmian:** linie `71-94`, `147-159`, `195-198`.
- **Przed:** dokumentacja techniczna opisywała stary model `Tabela19`, nie znała `eliminatedWins`/`survivorStacks`, a `RAKE` było opisane jako zależne tylko od `Tabela10.SUMA`.
- **Po:** dokumentacja techniczna opisuje nowy stan danych, nowe renderowanie `Tabela19/19A/19B`, nowe obliczenie `RAKE`, zebra striping i metadane fokusu dla nowych pól.
- **Cel cofnięcia:** przywrócić wcześniejszy opis techniczny fazy grupowej i panelu `Wpłaty`.

### 5. `DetaleLayout.md`
- **Miejsce zmiany:** linie `27-28`.
- **Przed:** dokument wspominał nieaktualną `Tabela17A`.
- **Po:** opisuje zebra striping per grupa stołu w `Tabela12` i `Tabela19` oraz nowe tabele `Tabela19A` / `Tabela19B`.
- **Cel cofnięcia:** przywrócić wcześniejszy opis layoutu.

### 6. `Kolumny.md`
- **Miejsca zmian:** linie `21-37`, `84-100`.
- **Przed:** opis kolumn zawierał stary układ `Tabela12`, starą `Tabela19` i brakowało `Tabela19A/19B`.
- **Po:** dokument kolumn odzwierciedla aktualny układ `Tabela12`, `Tabela19`, `Tabela19A`, `Tabela19B` oraz nową logikę `RAKE`.
- **Cel cofnięcia:** przywrócić poprzedni opis kolumn dla tych sekcji.

## Uwagi do bezpiecznego cofania zmian
1. Najpierw cofnąć `Second/app.js`, bo to źródło logiki i struktury danych.
2. Następnie cofnąć `Second/styles.css`, jeśli ma wrócić poprzedni wygląd bez stripingu.
3. Na końcu cofnąć dokumentację (`Second/docs/*`, `DetaleLayout.md`, `Kolumny.md`), żeby nie została rozbieżność między kodem i opisem.
4. Jeśli cofany byłby tylko fragment dotyczący `Tabela19A`/`Tabela19B`, trzeba równocześnie usunąć z modelu stanu pola `group.eliminatedWins` i `group.survivorStacks`.
