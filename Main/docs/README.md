# Main — instrukcja użytkownika (UI)

Ten dokument opisuje **obsługę interfejsu** modułu Main krok po kroku.
Instrukcja jest podzielona na dwie części:
- sekcja użytkownika (widok dostępny dla każdego gracza),
- sekcja administratora (panel do zarządzania danymi aplikacji).

> Ważne: poniżej opisane są wyłącznie działania w UI (co kliknąć, co się stanie, jak interpretować widoki i statusy).

---

## 1. Start aplikacji

1. Otwórz plik `Main/index.html` w przeglądarce.
2. Na górze ekranu zobaczysz nagłówek oraz sekcję z ikoną `Pliki/Ikona.png` i przyciskiem **Instrukcja** (prawy górny róg, ikona po lewej stronie przycisku w tej samej linii).
3. Jeśli otworzysz moduł z parametrem `?admin=1`, najpierw pojawi się okno logowania administratora z polem hasła.
4. Po poprawnym wpisaniu hasła zobaczysz dwa główne obszary:
   - **Panel Administratora** (duża karta z wieloma zakładkami),
   - **Panel użytkownika** (zakładki: Aktualności, Regulamin, Strefa Gracza).
5. Kliknięcie **Instrukcja** otwiera okno modalne z instrukcją; zamkniesz je przyciskiem `×`.
6. W trybie użytkownika główna zielona ramka panelu jest rozciągnięta niemal na pełną szerokość ekranu: zaczyna się 1 px od lewej i kończy 1 px przed prawą krawędzią.
7. Jeśli otworzysz moduł w trybie użytkownika (bez `?admin=1`), przeglądarka może zaproponować instalację PWA lub dodanie aplikacji do ekranu głównego.
8. Jeśli otworzysz moduł z parametrem `?admin=1`, wejście administracyjne działa jako zwykła strona/skróty URL — bez publikowania manifestu PWA dla tego adresu.
9. W uruchomieniu PWA (aplikacja zainstalowana na urządzeniu) moduł Main nie wymusza orientacji — aplikacja działa zgodnie z ustawieniem orientacji urządzenia.
10. Nazwa karty w przeglądarce dla modułu Main to **"Poker - rozgrywki"**.
11. Po instalacji PWA aplikacja na urządzeniu również wyświetla nazwę **"Poker - rozgrywki"**.

---


### 1.1. Aktualizacja aplikacji po wdrożeniu (PWA)

1. Gdy administrator wdroży nową wersję, aplikacja automatycznie pobiera nowy kod w tle.
2. W praktyce możesz zauważyć jedno automatyczne odświeżenie widoku (bez klikania przycisku przeglądarki).
3. Po tym odświeżeniu przełączanie zakładek (np. w **Kalkulatorze**) powinno działać już na spójnej, aktualnej wersji.
4. Jeśli urządzenie chwilowo jest offline, aplikacja może użyć lokalnej wersji z pamięci, a po powrocie sieci sama przejdzie na nową wersję.

---

## 2. Sekcja użytkownika

Sekcja użytkownika składa się z trzech zakładek: **Aktualności**, **Regulamin**, **Strefa Gracza**.

W nagłówku sekcji użytkownika jest też przycisk **Odśwież**. Po kliknięciu odświeżane są dane tylko aktywnej zakładki (bez resetu całej strony i bez utraty sesji PIN).

### 2.1. Zakładka „Aktualności”

Co widzisz:
- duże pole tylko do odczytu z najnowszą wiadomością od administratora,
- status ładowania/odczytu pod polem.

Co możesz zrobić:
- nie ma tu edycji ani przycisków akcji,
- tylko odczyt informacji.

### 2.2. Zakładka „Regulamin”

Co widzisz:
- pole tylko do odczytu z aktualnymi zasadami,
- status informacyjny pod polem.

Co możesz zrobić:
- tylko odczyt (bez edycji).

### 2.3. Zakładka „Strefa Gracza”

To strefa z dodatkowymi funkcjami, odblokowywana PIN-em.

#### Krok 1 — wejście do strefy

1. Wejdź w kartę **Strefa Gracza**.
2. Wpisz swój **PIN (5 cyfr)**.
3. Kliknij **Otwórz**.
4. Po poprawnej weryfikacji aplikacja pokaże przyciski sekcji, do których masz uprawnienia.
5. Po odświeżeniu strony (refresh) sesja wejścia do **Strefy Gracza** pozostaje aktywna w tej samej karcie, a przełączanie między sekcjami bocznymi nie wymaga ponownego wpisywania PIN do strefy.

Dostępne przyciski sekcji (widoczne zależnie od uprawnień):
- **Najbliższa Gra**,
- **Czat**,
- **Gry do Potwierdzenia**,
- **Gry Użytkowników**,
- **Statystyki**.

---

## 3. Szczegółowy opis sekcji w „Strefie Gracza”

## 3.1. „Najbliższa Gra”

1. Kliknij przycisk **Najbliższa Gra**.
2. Wpisz PIN i kliknij **Otwórz** (to osobna bramka PIN dla tej sekcji).
3. Zobaczysz tabelę z najbliższą aktywną grą (rodzaj, data, nazwa, status „CzyWszyscyPotwierdzili”).

Przyciski i funkcje:
- **Otwórz** — weryfikuje PIN do tej sekcji i odblokowuje tabelę.

## 3.2. „Czat”

1. Kliknij **Czat**.
2. Wpisz PIN z uprawnieniem do czatu i kliknij **Otwórz**.
3. Po odblokowaniu:
   - wpisuj wiadomość w polu **Twoja wiadomość**,
   - kliknij **Wyślij**.

Przyciski i funkcje:
- **Otwórz** — autoryzacja wejścia do czatu,
- **Wyślij** — wysyła aktualnie wpisaną wiadomość.

Dodatkowo:
- lista wiadomości aktualizuje się automatycznie,
- status obok przycisku informuje o powodzeniu/błędzie.

## 3.3. „Gry do Potwierdzenia”

1. Kliknij **Gry do Potwierdzenia**.
2. Wpisz PIN i kliknij **Otwórz**.
3. Dane ładują się automatycznie od razu po wejściu do tej sekcji.
4. Jeśli ktoś doda nową grę, gdy masz już otwartą tę sekcję, użyj górnego przycisku **Odśwież** (w nagłówku panelu użytkownika) albo przejdź na inną sekcję i wróć do **Gry do Potwierdzenia**.
5. W tabeli każda gra ma zestaw akcji.

Przyciski i funkcje w wierszu gry:
- **Potwierdź** — zapisuje Twoją obecność na grze.
- **Anuluj** — wycofuje potwierdzenie obecności.
- **Szczegóły** — otwiera modal ze szczegółową tabelą uczestników i wartości (wpisowe/rebuy/wypłata/punkty/mistrzostwo).
- **Notatki do gry** — otwiera modal notatek przed grą w trybie tylko do odczytu.

Przyciski globalne sekcji:
- **Otwórz** — weryfikacja PIN.

Odświeżanie sekcji:
- sekcja odświeża dane automatycznie po wejściu w **Gry do Potwierdzenia**,
- ręczne odświeżenie wykonujesz przez górny przycisk **Odśwież** w nagłówku panelu użytkownika.


### 3.3.1. Ważna zasada identyfikacji gracza (po zmianie)

- Potwierdzenia i statusy obecności są rozróżniane po **ID gracza**, a nie tylko po samej nazwie widocznej na ekranie.
- Jeśli dwie osoby mają taką samą nazwę, system traktuje je jako dwie osobne osoby (na podstawie ich ID).
- W praktyce dla użytkownika UI wygląda tak samo (nazwa nadal jest widoczna), ale liczenie potwierdzeń nie skleja już graczy o identycznej nazwie.

## 3.4. „Gry Użytkowników”

To sekcja, w której gracz (z uprawnieniem) tworzy i prowadzi własne gry.

### A) Wejście do sekcji
1. Kliknij **Gry Użytkowników**.
2. Wpisz PIN z uprawnieniem „Gry użytkowników”.
3. Kliknij **Otwórz**.
4. Lista lat i zapisane gry użytkownika wczytują się od razu po poprawnym PIN (bez potrzeby klikania „Dodaj” ani ręcznego odświeżania).

### B) Wybór roku
1. Po lewej stronie jest panel **Lata**.
2. Kliknij przycisk z rokiem (np. 2026), aby przełączyć listę gier na dany rok.

### C) Dodanie nowej gry — krok po kroku
1. Kliknij **Dodaj** (nad tabelą „Gry użytkowników”).
2. Aplikacja tworzy nowy rekord gry z domyślnymi wartościami:
   - typ gry,
   - data,
   - automatyczna nazwa,
   - stan „CzyZamknięta” = nie.
3. W nowym wierszu gry ustaw:
   - **Rodzaj Gry** (lista: Cashout / Turniej),
   - **Data**,
   - **Nazwa**.

### D) Edycja i prowadzenie gry
W wierszu każdej gry masz przyciski:
- **Szczegóły** — otwiera modal szczegółów tej gry,
- **Notatki do gry** — otwiera notatki przygotowawcze,
- **Usuń** — usuwa grę wraz z powiązanymi rekordami szczegółów/potwierdzeń.

Kolumna **CzyZamknięta** (checkbox):
- zaznacz, aby oznaczyć grę jako zamkniętą,
- odznacz, aby przywrócić status otwartej.

Kolumna **IlośćPotwierdzonych**:
- pokazuje format `potwierdzeni/zapisani` (np. `2/3`, `3/3`, `4/10`),
- licznik aktualizuje się automatycznie po wejściu do zakładki oraz po każdej zmianie składu graczy i potwierdzeń,
- przycisk **Statusy** otwiera okno tylko do odczytu z listą graczy i statusem (`Potwierdzony` / `Niepotwierdzony`); potwierdzeni są podświetleni na złoto.

### E) Modal „Szczegóły” gry (po kliknięciu „Szczegóły”)
W modalu:
1. W pierwszej linii modalu odczytasz szczegóły gry (`Nazwa | Rodzaj gry | Data | Pula | Ilość graczy`) — zastępują one wcześniejszy tytuł „Szczegóły gry”.
2. Kliknij **Dodaj**, aby dodać nowego uczestnika (wiersz).
3. W każdym wierszu ustaw:
   - **Gracz** (lista wyboru),
   - **Wpisowe**,
   - **Rebuy/Add-on**,
   - **Wypłata**,
   - **Punkty**,
   - **Mistrzostwo** (checkbox).
4. Kolumna **+/-** liczy się automatycznie.
5. Kliknij **Usuń** w wierszu, aby usunąć konkretnego gracza z tej gry.
6. Nagłówek **Wpisowe** (przycisk zbiorczy) pozwala nadać jedną wartość wpisowego wszystkim wierszom naraz.
7. Kolumna **Rebuy/Add-on** ma zwykły nagłówek tekstowy (bez akcji zbiorczej).
8. W każdym wierszu kliknij przycisk z wartością w kolumnie **Rebuy/Add-on**, aby otworzyć okno `Rebuy gracza` i dodać/usunąć kolejne wpisy rebuy (tak jak w Kalkulatorze).
9. W oknie `Rebuy gracza` nowe kolumny są numerowane per gracz (`Rebuy1`, `Rebuy2`, …); po usunięciu ostatniej kolumny kolejne dodanie przywraca numer ostatniego dostępnego rebuy.
10. Suma z okna `Rebuy gracza` jest wyświetlana na przycisku w wierszu i automatycznie uwzględniana w kolumnach **+/-**, puli i podsumowaniach.
11. Modal szczegółów nie koloruje już wierszy po statusie potwierdzenia.
12. Pola **Wpisowe**, **Wypłata**, **Punkty** oraz wartości w oknie `Rebuy gracza` otwierają na urządzeniach mobilnych klawiaturę numeryczną.
13. Gdy lista graczy jest długa, sekcja tabeli w modalu ma pionowy pasek przewijania — przewiń w dół, aby edytować kolejne wiersze.
14. Zamknięcie modalu: przycisk `×`, kliknięcie poza modalem lub klawisz `Esc`.

### F) Modal „Notatki do gry”
Przyciski:
- **Złoty / Zielony / Czerwony / Biały** — zmieniają kolor zaznaczonego fragmentu tekstu (kolor można zmieniać wielokrotnie),
- **Zapisz** — zapisuje treść notatek,
- **Domyślne** — przywraca domyślną treść szablonu notatek dla gry.

### G) Podsumowania pod tabelą
Pod każdą grą wyświetla się podsumowanie z puli, wypłat, wyników i procentów.
Jeśli wypłaty nie zgadzają się z pulą, pojawia się czerwone ostrzeżenie.

## 3.5. „Statystyki” (widok gracza)

1. Kliknij **Statystyki**.
2. Wpisz PIN z uprawnieniem do statystyk i kliknij **Otwórz**.
3. Wybierz rok z panelu **Lata**.
   - Dane i lista lat pojawiają się automatycznie od razu po poprawnej weryfikacji PIN (bez ręcznego odświeżania strony).
4. Przeglądaj:
   - tabelę statystyk zbiorczych,
   - tabelę statystyk graczy,
   - ranking.
5. Kliknij **Eksportuj**, aby pobrać dane statystyk.
6. Na komputerze panel **Ranking** jest po prawej stronie tabeli **Statystyki**.
7. Na telefonie panel **Ranking** wyświetla się pod tabelą **Statystyki** (układ jednokolumnowy).
8. W telefonie poziomo (mobile landscape) układ również przełącza się na jedną kolumnę, więc panele **Lata** i **Ranking** pojawiają się pod treścią, a nie obok niej.

---

## 4. Sekcja administratora

Panel administratora zawiera pełen zestaw narzędzi do zarządzania treściami, graczami i grami.

## 4.1. Górny pasek administratora

Przyciski:
- **Instrukcja** — otwiera instrukcję w modalu,
- **Odśwież** (w nagłówku panelu) — ręcznie odświeża dane aktywnej zakładki (w panelu admina i użytkownika, bez przeładowania strony), a w zakładkach gier od razu przelicza i odświeża kolumnę `IlośćPotwierdzonych`.

Statusy:
- obok **Odśwież** wyświetla się informacja o przebiegu odświeżania,
- czerwony tekst o haśle to tylko informacja systemowa.

## 4.2. Zakładki administratora

Na górze panelu są przyciski zakładek:
- Aktualności,
- Czat,
- Regulamin,
- Notatki,
- Gracze,
- Gry admina,
- Statystyki,
- Gry użytkowników,
- Najbliższa gra,
- Gry do potwierdzenia,
- Kalkulator.

Kliknięcie przycisku zakładki przełącza aktualny widok roboczy.

Ważne podczas edycji: pola edycyjne (np. Gracze, Gry, Kalkulator, Regulamin, Notatki) zachowują fokus i pozycję kursora w trakcie autozapisu — możesz pisać lub trzymać Backspace bez ponownego klikania pola po każdym odświeżeniu danych.

---

## 5. Zakładka admina „Aktualności”

1. Wpisz treść w pole **Treść wiadomości**.
2. Kliknij **Wyślij**.
3. Wiadomość pojawi się użytkownikom w zakładce „Aktualności” (pole „Najnowsze”).

Przycisk:
- **Wyślij** — zapisuje i publikuje aktualną wiadomość.

---

## 6. Zakładka admina „Czat”

Funkcja moderacji czatu.

Przyciski:
- **Usuń starsze niż 30 dni** — usuwa wiadomości historyczne starsze niż 30 dni.

Lista wiadomości:
- aktualizuje się automatycznie,
- służy do podglądu i kontroli treści.

---

## 7. Zakładka admina „Regulamin”

1. Wpisz/edytuj treść w polu **Treść regulaminu**.
2. Kliknij **Zapisz**.

Przycisk:
- **Zapisz** — utrwala bieżącą treść regulaminu widoczną dla użytkowników.

---

## 8. Zakładka admina „Notatki”

Notatki techniczno-organizacyjne dostępne tylko w module Main.

1. Wpisz treść w polu **Treść notatek**.
2. Kliknij **Zapisz**.

Przycisk:
- **Zapisz** — zapisuje notatki administracyjne.

---

## 9. Zakładka admina „Gracze” (tylko administrator)

To kluczowa sekcja do zarządzania kontami graczy i uprawnieniami.

### 9.1. Co oznaczają kolumny
- **Aplikacja** — checkbox dostępu do aplikacji (włącza/wyłącza aktywność gracza),
- **Nazwa** — nazwa gracza,
- **PIN** — 5-cyfrowy PIN logowania do stref,
- **Uprawnienia** — zestaw dostępów do sekcji,
- kolumna akcji — usunięcie gracza.

### 9.2. Dodanie nowego gracza — krok po kroku
1. Kliknij **Dodaj** (pod tabelą graczy).
2. W nowym wierszu:
   - zaznacz checkbox w kolumnie **Aplikacja**, aby aktywować gracza,
   - wpisz imię/nazwę w kolumnie **Nazwa**,
   - ustaw PIN:
     - ręcznie (dokładnie 5 cyfr) albo
     - kliknij **Losuj**, aby system wygenerował unikalny PIN.
3. W kolumnie **Uprawnienia** kliknij **Edytuj**.
4. W modalu uprawnień zaznacz checkboxy sekcji, które gracz ma widzieć (np. Czat, Gry użytkowników, Statystyki).
5. Jeśli zaznaczysz uprawnienie do **Statystyki**, pojawi się przycisk **Lata**:
   - kliknij **Lata**,
   - zaznacz konkretne lata, które gracz może przeglądać.
6. Zamknij modal uprawnień przyciskiem `×`.

Efekt:
- gracz od razu pojawia się na liście,
- przypisane uprawnienia są widoczne jako „badge” w kolumnie uprawnień.

### 9.3. Edycja istniejącego gracza
- Zmień nazwę bezpośrednio w polu nazwy.
- Zmień PIN ręcznie albo użyj **Losuj**.
- Kliknij **Edytuj**, aby zmienić uprawnienia i lata statystyk.

Walidacje, o których musisz pamiętać:
- PIN musi mieć dokładnie 5 cyfr,
- PIN musi być unikalny (nie może powtórzyć PIN-u innego gracza).

### 9.4. Usuwanie gracza
- Kliknij **Usuń** w wierszu gracza.
- Gracz zostanie usunięty z listy.

---

## 10. Zakładka admina „Gry admina”

Sekcja zarządzania główną listą gier administracyjnych.

### 10.1. Lata
- Z lewej strony kliknij rok, aby filtrować gry i podsumowania dla wybranego roku.

### 10.2. Dodanie gry
1. Kliknij **Dodaj** przy nagłówku „Tabele Gier”.
2. Uzupełnij nowy wiersz:
   - **Rodzaj Gry** (Cashout/Turniej),
   - **Data**,
   - **Nazwa**.

### 10.3. Akcje na grze
W każdym wierszu gry:
- **Szczegóły** — modal szczegółów gry (uczestnicy i wartości),
- **Usuń** — usuwa grę wraz z powiązanymi szczegółami i potwierdzeniami,
- checkbox **CzyZamknięta** — zamknięcie/otwarcie gry.

### 10.4. Modal „Szczegóły” gry admina
1. W pierwszej linii modalu odczytasz szczegóły gry (`Nazwa | Rodzaj gry | Data | Pula | Ilość graczy`) — ta linia zajmuje miejsce wcześniejszego tytułu „Szczegóły gry”.
2. Kliknij **Dodaj**, aby dodać uczestnika.
3. Wypełnij kolumny: gracz, wpisowe, rebuy/add-on, wypłata, punkty, mistrzostwo.
4. **+/-** wylicza się automatycznie.
5. Kliknij **Usuń** w wierszu, aby usunąć jednego uczestnika.
6. Kliknij nagłówek-przycisk **Wpisowe**, by ustawić jedno wpisowe dla wszystkich wierszy.
7. Kliknij przycisk z wartością w kolumnie **Rebuy/Add-on** dla wybranego gracza, aby otworzyć okno `Rebuy gracza` i zarządzać wieloma wpisami rebuy/add-on (przyciski **Dodaj Rebuy** i **Usuń Rebuy**). Numeracja kolumn (`Rebuy1`, `Rebuy2`, …) jest niezależna dla każdego gracza, a po usunięciu ostatniej kolumny następne dodanie przywraca ten numer.
8. W polach liczbowych tego modalu i w oknie `Rebuy gracza` na telefonie uruchamia się klawiatura numeryczna.
9. Przy większej liczbie uczestników sekcja tabeli w modalu ma pionowy scrollbar, więc możesz przewijać listę graczy i uzupełniać dane wszystkich wierszy.

### 10.5. „Notatki po grze”
W podsumowaniu każdej gry użyj przycisku **Notatki po grze**:
- wpisz komentarz po rozegranej partii,
- **Zapisz** — zapis,
- **Usuń** — wyczyszczenie treści notatki po grze,
- przyciski koloru ustawiają motyw notatek.

### 10.6. Statystyki i wagi w tej zakładce
W tabeli statystyk graczy są przyciski kolumn:
- **Waga1**, **Waga2**, **Waga3**, **Waga4**, **Waga5**, **Waga6** (każdy przycisk ma stałą szerokość `8ch`, żeby nagłówki wag nie rozciągały kolumn).

Działanie:
- po kliknięciu danej „Wagi” wpisujesz jedną wartość,
- wartość jest ustawiana zbiorczo dla całej kolumny,
- tabela i ranking w „Gry admina” korzystają z tej samej logiki liczenia co zakładka „Statystyki”, więc wyniki są spójne między tymi widokami,
- panel **Ranking** pokazuje zawsze trzy kolumny (**Miejsce**, **Gracz**, **Wynik**) bez poziomego przewijania; kolumna **Gracz** jest celowo węższa, długie nazwy są ucinane wielokropkiem, a nagłówek **Gracz** jest wyrównany do lewej (tak samo jak wartości w kolumnie), żeby cały panel mieścił się w widoku.

---

## 11. Zakładka admina „Statystyki”

1. Wybierz rok z panelu **Lata**.
2. Analizuj tabelę statystyk i ranking.
3. Kliknij **Eksportuj**, aby pobrać statystyki.
4. W tabeli graczy możesz używać przycisków **Waga1–Waga6** do zbiorczego ustawiania wag kolumn (analogicznie jak wyżej); przyciski mają stałą szerokość `8ch`.
5. W panelu **Ranking** kolumny **Miejsce**, **Gracz** i **Wynik** mieszczą się na ekranie bez poziomego przewijania; kolumna **Gracz** jest zwężona, nagłówek **Gracz** jest wyrównany do lewej, a długie nazwy są obcinane wielokropkiem.

---

## 12. Zakładka admina „Gry użytkowników”

To administracyjny podgląd i zarządzanie grami tworzonymi przez użytkowników.

Działanie jest analogiczne do sekcji gracza „Gry Użytkowników”, ale jako administrator masz pełny dostęp do wszystkich rekordów.

Najważniejsze przyciski:
- **Dodaj** — dodanie nowej gry użytkowników,
- **Szczegóły** — edycja składu i wartości,
- **Notatki do gry** — notatki przed grą,
- **Usuń** — usunięcie gry,
- Szerokości kolumn są zgodne z zakładką **Gry admina**; wyjątek to szersza kolumna **Nazwa** (dla przycisku **Notatki do gry**), żeby treść pól i przycisków nie ucinała się na mobilnych szerokościach.
- **Wpisowe** (w nagłówku modalu szczegółów) — zbiorcze wpisowe,
- **Dodaj** (w modalu szczegółów) — dodanie uczestnika,
- **Usuń** (w wierszu modalu) — usunięcie uczestnika.

---

## 13. Zakładka admina „Najbliższa gra”

Widok tabeli z najbliższą aktywną grą oraz statusem potwierdzeń wszystkich graczy.

Zakładka automatycznie ukrywa gry starsze niż dzisiejsza data — na liście zobaczysz wyłącznie gry zaplanowane na dziś lub przyszłe terminy.

Obsługiwane są daty zapisane jako `RRRR-MM-DD` oraz `DD.MM.RRRR` (i `DD-MM-RRRR`), a lista jest sortowana rosnąco po dacie, więc na górze pojawia się najbliższa nadchodząca gra.

Użycie:
- przejdź do zakładki, by monitorować czy komplet graczy potwierdził udział,
- dane są aktualizowane na podstawie aktywnych gier i potwierdzeń.

---

## 14. Zakładka admina „Gry do potwierdzenia”

Widok kontrolny potwierdzeń dla gier wymagających deklaracji uczestników.

Typowe akcje:
- podgląd, którzy gracze potwierdzili,
- wejście do **Szczegółów** gry,
- otwarcie **Notatek do gry**,
- odświeżanie listy (jeśli widoczne przyciski odświeżenia w sekcji).

---

## 15. Zakładka admina „Kalkulator”

Kalkulator rozliczeń posiada trzy tryby:
- **Tournament1**,
- **Tournament2**,
- **Cash**.

### 15.1. Przełączanie trybu
- Kliknij jeden z przycisków trybu: **Tournament1**, **Tournament2**, **Cash**.
- Aktywny tryb podświetla się wizualnie.

### 15.2. Typowe działania w tabelach kalkulatora
W zależności od trybu dostępne są przyciski w wierszach:
- **Dodaj** — dodanie rekordu/wiersza,
- **Usuń** — usunięcie rekordu/wiersza,
- **Dodaj Rebuy** — dopisanie kolejnego rebuy dla gracza,
- **Usuń Rebuy** — usunięcie rebuy,
- **Buy-In** (przycisk nagłówkowy) — zbiorcze ustawienie buy-in.

### 15.3. Modal rebuy
Przycisk:
- **×** (prawy górny róg) — zamyka okno zarządzania rebuy.
- Numeracja `RebuyX` jest **globalna** dla aktywnego trybu kalkulatora (Tournament1/Tournament2/Cash): każde nowe pole dostaje kolejny numer względem wszystkich graczy w tym trybie.
- Po usunięciu ostatniego rebuy u wybranego gracza aplikacja wykonuje globalną kompaktację numerów (`Rebuy` o numerach większych od usuniętego przesuwają się o `-1`), więc numeracja pozostaje bez luk.

### 15.4. Cash — edycja Tabela9 na telefonie
- W **Tabela9** pola **Buy-In** i **Wypłata** otwierają na telefonie numeryczną klawiaturę ekranową, więc możesz od razu wpisywać cyfry bez przełączania układu.
- Kolumna **Rebuy** pozostaje przyciskiem otwierającym modal `Rebuy gracza`; po jego otwarciu każde pole `RebuyX` także korzysta z klawiatury numerycznej.

### 15.5. Cash — sposób liczenia Rake w Tabela8
- W trybie **Cash** kolumna **Rake** w **Tabela8** jest liczona ze wzoru:
  - `Rake = (Suma Buy-In z Tabela9 + Suma Rebuy z Tabela9) × % z Tabela8`.
- W trybie **Cash** kolumna **Suma** w **Tabela7** pokazuje zawsze:
  - `Suma = Suma Buy-In z Tabela9 + Suma Rebuy z Tabela9`.
- Przykład:
  - Buy-In = 80,
  - Rebuy = 20,
  - % = 10,
  - Suma (Tabela7) = `80 + 20 = 100`,
  - Rake = `(80 + 20) × 10% = 10`.

---

## 16. Opis wszystkich typów przycisków i ich znaczenia

Dla wygody, skrót semantyczny:
- **Dodaj** — tworzy nowy rekord (gracza, grę lub wiersz szczegółów),
- **Usuń** — kasuje rekord,
- **Edytuj** — otwiera modal konfiguracji (np. uprawnień),
- **Losuj** — generuje automatyczny PIN,
- **Otwórz** — wykonuje weryfikację PIN i odblokowuje sekcję,
- **Wyślij** — publikuje wiadomość (aktualności/czat),
- **Zapisz** — utrwala wpisaną treść,
- **Odśwież** — ręcznie pobiera aktualny stan,
- **Szczegóły** — otwiera szczegółowy modal danych,
- **Notatki do gry / Notatki po grze** — otwiera notatki kontekstowe,
- **Eksportuj** — pobiera dane statystyk,
- **Waga1…Waga6** — zbiorcze ustawienie wartości wag w kolumnie,
- **Wpisowe** (nagłówek tabeli szczegółów) — zbiorcze ustawienie wpisowego,
- **Domyślne** — przywraca domyślną treść notatek,
- **× / Zamknij** — zamknięcie modalu.

---

## 17. Szybkie scenariusze (checklista)

### 17.1. Chcę dodać gracza i nadać uprawnienia (admin)
1. Admin → **Gracze**.
2. **Dodaj**.
3. Uzupełnij: Aplikacja, Nazwa, PIN (lub **Losuj**).
4. **Edytuj** przy uprawnieniach.
5. Zaznacz sekcje dostępu.
6. Dla Statystyk: **Lata** i wybór lat.
7. Zamknij modal `×`.

### 17.2. Chcę stworzyć własną grę w „Gry Użytkowników” (gracz)
1. Użytkownik → Strefa Gracza → **Gry Użytkowników**.
2. PIN + **Otwórz**.
3. Wybierz rok (lewy panel).
4. Kliknij **Dodaj**.
5. Ustaw rodzaj gry, datę, nazwę.
6. Kliknij **Szczegóły**.
7. W modalu kliknij **Dodaj** (wiersz gracza).
8. Uzupełnij wartości (wpisowe/rebuy/wypłata/punkty/mistrzostwo).
9. (Opcjonalnie) Użyj nagłówka **Wpisowe** do zbiorczego ustawienia jednej stawki.
10. Zamknij modal `×`.
11. (Opcjonalnie) Kliknij **Notatki do gry** i zapisz notatki.

### 17.3. Chcę potwierdzić udział w grze
1. Strefa Gracza → **Gry do Potwierdzenia**.
2. PIN + **Otwórz**.
3. **Odśwież**.
4. W odpowiedniej grze kliknij **Potwierdź**.

### 17.4. Chcę wycofać potwierdzenie
1. Ta sama sekcja i gra.
2. Kliknij **Anuluj**.

---

To jest kompletna instrukcja obsługi UI modułu Main dla pierwszego uruchomienia i codziennej pracy użytkownika oraz administratora.


### 3.3.2. Potwierdzenia administratora a ID gracza

- Potwierdzenie z zakładki administratora **Gry do Potwierdzenia** jest zapisywane po **ID gracza** (jeżeli gracz ma przypisane ID w rekordzie gry).
- Dzięki temu licznik **IlośćPotwierdzonych** i okno **Statusy** pokazują spójne wartości także przy duplikatach tych samych nazw.
- Nazwa gracza pozostaje etykietą widoczną w tabelach, ale logika dopasowania działa po identyfikatorze.

---

## Aktualizacja UI: nowy układ wszystkich tabel (Main)

W module Main wszystkie tabele zostały przebudowane pod kątem czytelności i pracy na PC oraz mobile.

Jak to działa w praktyce dla użytkownika:
1. Każda tabela ma teraz stałe szerokości kolumn dopasowane do typu danych (np. checkboxy są wąskie, kolumny z akcjami mają miejsce na przyciski obok siebie).
2. Gdy tabela nie mieści się poziomo, pojawia się **poziomy pasek przewijania**.
3. Gdy tabela ma dużo wierszy, pojawia się **pionowy pasek przewijania** w obrębie bloku tabeli.
4. Nie zmienia się logika formularzy, obliczeń ani typy danych — zmienia się wyłącznie układ wizualny i ergonomia pracy.
5. Na telefonach w orientacji poziomej (widok dotykowy o małej wysokości) panele boczne (np. **Lata**, **Ranking**) także układają się pionowo, jeden pod drugim.

Wskazówka użycia:
- Na telefonie przewijaj tabelę ruchem poziomym w obrębie jej kontenera.
- Na komputerze możesz korzystać z poziomego i pionowego scrolla bez wychodzenia poza aktualną sekcję.

## Rebuy gracza – pozycja przycisku zamknięcia
- W modalu **Rebuy gracza** przycisk `X` znajduje się w prawym górnym rogu okna.
- Dotyczy to widoków, gdzie otwierany jest modal szczegółów rebuy.

## 18. Aktualny układ ramek i przycisków (mobile)
1. W widoku użytkownika wejdź w **Strefa Gracza**.
2. Ciemno-zielone panele sekcji (lewy panel przycisków i prawy panel treści) są dosunięte do szerokości karty: zaczynają się 1 px od lewej krawędzi zielonej ramki i kończą 1 px przed prawą krawędzią.
3. Na telefonie napisy na przyciskach sekcji w **Strefa Gracza** (np. „Najbliższa Gra”, „Czat”, „Gry do Potwierdzenia”) są większe niż na desktopie, żeby były czytelniejsze.

## 19. Kalkulator — nowe zakładki Organizacja i Żetony
1. Wejdź do panelu **Admin** → zakładka **Kalkulator**.
2. W panelu bocznym pod **Cash** masz nowe zakładki:
   - **Organizacja**
   - **Żetony cash1**
   - **Żetony cash2**
   - **Żetony tournament1**
   - **Żetony tournament2**
3. **Organizacja**:
   - W `TABELA1` wpisz procent (wiersz 1, kolumna `KALKULATOR`) i bazę (wiersz 2, kolumna `KALKULATOR`).
   - System pokaże `ORGANIZACJA` i `POT` automatycznie (zaokrąglenie w górę) tylko w pierwszym wierszu.
   - W drugim wierszu `TABELA1` pola pod kolumnami `ORGANIZACJA` i `POT` są celowo puste (bez kontrolek).
   - W `TABELA2` możesz dodawać/usuwać wiersze (`Dodaj`/`Usuń`) i wpisywać procenty; kolumna `PODZIAŁ` liczy się automatycznie.
4. **Zakładki Żetony** (każda niezależna):
   - `TABELAA`: wpisz `NOMINAŁ` i `SZTUK`, `STACK` liczy się automatycznie.
   - W `TABELAA` przycisk `Dodaj` jest pod tabelą po lewej, a `Usuń` po prawej stronie każdego wiersza.
   - Pod `TABELAA` widzisz podsumowanie `Łącznie Stack: ...` jako informację tekstową (nie jako osobny wiersz tabeli).
   - `TABELAB`: wpisz `L.GRACZY` i `STACK GRACZA`, `ŁĄCZNY STACK` liczy się automatycznie.
   - `TABELAC`: liczba wierszy jest synchronizowana z `TABELAA`; wpisujesz `SZTUK`, a pozostałe kolumny liczą się automatycznie.
5. Puste pasy pod `TABELA2` (Organizacja) i pod `TABELAC` (zakładki Żetony) są ukrywane automatycznie — system chowa tylko puste kontenery, czyli takie bez nagłówka i bez tabeli.
6. Wszystkie pola liczbowe w nowych tabelach mają mobilne wymuszenie klawiatury numerycznej.
7. Dane każdej zakładki są zapisywane i wracają po odświeżeniu strony.

## 20. Potwierdzenia i Najbliższa gra — źródło danych
1. Zakładki **Najbliższa gra** i **Gry do potwierdzenia** korzystają tylko z gier z **Gry użytkowników** (`UserGames`).
2. Gry dodane w **Gry admina** nie pojawiają się już w tych dwóch sekcjach.
