# Karty — instrukcja UI dla użytkownika

## 1. Start aplikacji
1. Otwórz stronę aplikacji.
2. Na górze widzisz **Panel Administratora** (zakładki admina).
3. Niżej widzisz od razu pasek zakładek użytkownika (bez osobnego nagłówka nad zakładkami).
4. Kliknięcie nazwy zakładki przełącza zawartość widoku.

## 2. Widok użytkownika

W górnym pasku użytkownika są teraz tylko 3 zakładki: **Aktualności**, **Regulamin**, **Strefa Gracza**.

### 2.1 Aktualności
1. Kliknij zakładkę **Aktualności**.
2. Odczytaj pole **Najnowsze** z ostatnią wiadomością od administratora.

### 2.2 Regulamin
1. Kliknij zakładkę **Regulamin**.
2. Odczytaj pole **Obowiązujące zasady**.

### 2.3 Strefa Gracza
1. Kliknij zakładkę **Strefa Gracza**.
2. Wpisz 5-cyfrowy PIN gracza, który ma nadane uprawnienie **Strefa Gracza** w panelu **Gracze**.
3. Kliknij **Otwórz**.
4. Po poprawnym PIN-ie aplikacja zapamięta sesję w tej karcie przeglądarki i od razu odblokuje wszystkie sekcje, do których masz uprawnienia.
5. Po lewej stronie zobaczysz panel **Sekcja** z przyciskami funkcji.
6. PIN podajesz ponownie dopiero po restarcie aplikacji/przeglądarki (nowa sesja).

### 2.4 Sekcja: Najbliższa Gra
1. W **Strefie Gracza** kliknij po lewej **Najbliższa Gra**.
2. Nie wpisujesz ponownie PIN-u — po wejściu do Strefy sekcja otwiera się od razu.
3. Odczytaj tabelę: Rodzaj gry, Data, Nazwa, CzyWszyscyPotwierdzili.

### 2.5 Sekcja: Czat
1. Kliknij po lewej **Czat**.
2. Sekcja otworzy się bez dodatkowego PIN-u (jeżeli masz do niej uprawnienie).
3. Wpisz wiadomość i kliknij **Wyślij**.

### 2.6 Sekcja: Gry do Potwierdzenia
1. Kliknij po lewej **Gry do Potwierdzenia**.
2. Sekcja otworzy się bez dodatkowego PIN-u (jeżeli masz do niej uprawnienie).
3. Po przechodzeniu między sekcjami panelu bocznego aplikacja nie prosi ponownie o PIN w tej sekcji — ponowna autoryzacja będzie dopiero po nowej sesji przeglądarki.
4. Dla gry użyj: **Potwierdź**, **Anuluj**, **Szczegóły**, **Notatki do gry**.
5. Po kliknięciu **Notatki do gry** otworzy się okno z tytułem w formacie „Notatki do gry: Nazwa gry”.
6. W tym oknie (tryb tylko do odczytu) tekst notatek jest wyświetlany dokładnie w kolorach zapisanych wcześniej przez osobę edytującą notatkę (złoty, zielony, czerwony, biały).
7. W widoku tylko do odczytu nie ma przycisków edycyjnych: nie zobaczysz przycisków kolorów, **Zapisz** ani **Domyślne**.

### 2.7 Sekcja: Gry Użytkowników
1. Kliknij po lewej **Gry Użytkowników**.
2. Sekcja otworzy się bez dodatkowego PIN-u (jeżeli masz do niej uprawnienie).
3. Wybierz rok po lewej i zarządzaj własnymi grami.
4. Przy wybranej grze kliknij **Notatki do gry**.
5. W otwartym oknie najpierw zaznacz fragment wpisanego tekstu w polu notatek.
6. Kliknij przycisk koloru nad polem tekstowym: **Złoty**, **Zielony**, **Czerwony** albo **Biały**.
7. Powtórz zaznaczanie i kolorowanie dla kolejnych fragmentów.
8. Kliknij **Zapisz**, aby utrwalić tekst wraz z kolorami.
9. Przycisk **Domyślne** przywraca domyślny szablon notatki do gry.

### 2.8 Sekcja: Statystyki
1. Kliknij po lewej **Statystyki**.
2. Sekcja otworzy się bez dodatkowego PIN-u (jeżeli masz do niej uprawnienie).
3. Wybierz rok po lewej i przeglądaj statystyki/ranking.

## 3. Panel Administratora

### 3.1 Aktualności
1. Wejdź w zakładkę **Aktualności**.
2. Wpisz treść.
3. Kliknij **Wyślij**.

### 3.2 Czat
1. Wejdź w **Czat**.
2. Użyj opcji usuwania wiadomości (pojedynczo lub starszych niż 30 dni).

### 3.3 Regulamin
1. Wejdź w **Regulamin**.
2. Edytuj treść.
3. Kliknij **Zapisz**.

### 3.4 Gracze
1. Wejdź w **Gracze**.
2. Kliknij **Dodaj**, aby dodać nowy wpis gracza.
3. Uzupełnij: Nazwa, PIN, dostęp do aplikacji.
4. Kliknij **Edytuj** w kolumnie uprawnień i zaznacz dostęp do **Strefa Gracza** oraz do konkretnych sekcji w Strefie (Najbliższa gra, Czat, Gry do potwierdzenia, Gry użytkowników, Statystyki).
5. Dla **Statystyk** użyj przycisku **Lata**, aby wskazać lata widoczne dla gracza.

### 3.5 Gry admina
1. Wejdź w **Gry admina**.
2. Wybierz rok po lewej stronie.
3. Kliknij **Dodaj**, aby dodać grę.
4. Edytuj pola w tabeli: Rodzaj Gry, Data, Nazwa, CzyZamknięta.
5. Kliknij **Szczegóły** przy nazwie gry.
6. W oknie szczegółów:
   - dodawaj/usuwaj graczy,
   - edytuj dane finansowe i punkty,
   - korzystaj z kolumny **LP**.
7. W pasku metadanych szczegółów widzisz: Nazwa, Rodzaj gry, Data, **Pula**.
8. W sekcji podsumowania gry możesz otworzyć **Notatki po grze**.
9. W sekcji statystyk kolejność kolumn to: Ilość Spotkań, **Waga2**, **% udział**, Punkty.

### 3.6 Statystyki (panel admina)
1. Wejdź w **Statystyki**.
2. Wybierz rok.
3. Edytuj wagi przez pola Waga1–Waga6.
4. Ustawiaj widoczność kolumn dla użytkownika przez checkboxy w nagłówkach.
5. Użyj **Eksportuj**.

### 3.7 Gry użytkowników (panel admina)
1. Wejdź w **Gry użytkowników**.
2. Administrator widzi wszystkie gry użytkowników (bez ograniczenia do jednego właściciela).
3. Wybierz rok.
4. Dodawaj gry i edytuj je jak w wersji gracza.
5. W **Szczegółach** działa kolumna **LP** i podgląd **Pula**.

### 3.8 Gry do potwierdzenia (panel admina)
1. Wejdź w **Gry do potwierdzenia**.
2. Otwieraj każdą grę z listy.
3. Zmieniaj status potwierdzeń graczy.



### 3.9 Kalkulator
1. Wejdź w zakładkę **Kalkulator**.
2. W panelu **Rodzaj gry** kliknij **Tournament** albo **Cash**.
3. Tryb **Tournament** działa jak wcześniej (Tabela1–Tabela5).
4. Tryb **Cash** ma teraz 4 tabele: **Tabela7**, **Tabela8**, **Tabela9**, **Tabela10**.

#### Cash — Tabela7
1. W Tabela7 nie wpisujesz ręcznie danych.
2. Kolumna **Buy-In** pokazuje sumę Buy-In z Tabela9 przemnożoną przez procent z **Rake** (Tabela8).
3. Kolumna **Rebuy** pokazuje sumę Rebuy z Tabela9 przemnożoną przez procent z **Rake** (Tabela8).
4. Kolumna **Suma** pokazuje `Buy-In + Rebuy` z Tabela7.

#### Cash — Tabela8
1. W kolumnie **Rake** wpisz liczbę (np. `10`).
2. Po wyjściu z pola aplikacja pokaże wartość jako procent (`10%`).
3. Kolumna **Pot** wylicza wartość z kolumny **Suma** (Tabela7) pomniejszoną o procent z **Rake** (Tabela8).

#### Cash — Tabela9
1. W kolumnie **Gracz** wybierz gracza z listy.
2. Ten sam gracz nie może wystąpić dwa razy w Tabela9.
3. W kolumnie **Buy-In** wpisz kwotę ręcznie (nowy wiersz startuje od `0`).
4. W kolumnie **Rebuy** kliknij przycisk z kwotą, aby otworzyć modal rebuy dla tego gracza.
5. W modalu kliknij **Dodaj Rebuy** / **Usuń Rebuy** i wpisuj kwoty; przycisk w tabeli pokazuje sumę pozycji.
6. Numeracja rebuy dla Cash jest liczona niezależnie od trybu Tournament.
7. W kolumnie **Wypłata** wpisz kwotę ręcznie (nowy wiersz startuje od `0`).
8. Kolumna **+/-** liczy automatycznie: `Wypłata - (Buy-In + Rebuy)`.
9. W ostatnim wierszu kliknij **Dodaj**, aby dopisać kolejny wiersz.
10. W dowolnym wierszu kliknij **Usuń**, aby go usunąć.

#### Cash — Tabela10
1. Tabela10 jest automatyczna i sortowana malejąco po kolumnie **+/-**.
2. **Lp** to numer po sortowaniu.
3. **Gracz**, **Wypłata**, **+/-** są pobierane z Tabela9.
4. **% Puli** liczy: `Wypłata z Tabela9 / Suma z Tabela7`.

12. Wszystkie zmiany zapisują się automatycznie po chwili — nie ma osobnego przycisku zapisu.
