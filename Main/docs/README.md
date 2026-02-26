# Karty — instrukcja UI dla użytkownika

## 1. Start aplikacji
1. Otwórz stronę aplikacji.
2. W wersji **PC** główna zawartość aplikacji rozciąga się prawie na całą szerokość okna (zostają tylko niewielkie marginesy po bokach).
3. W panelach z układem 3-kolumnowym (np. **Lata / treść / Ranking**) szerokość paneli bocznych zostaje stała, a rozszerza się głównie kolumna środkowa z tabelami.
4. Pierwszym ekranem jest **okno logowania** z polami e-mail i hasło oraz przyciskami **Zaloguj** i **Utwórz konto**.
5. Po zalogowaniu aplikacja automatycznie przełącza widok na podstawie roli konta (`admin` albo `user`).
6. Dla roli **admin** widzisz panel administratora oraz podgląd widoku użytkownika na dole.
7. Dla roli **user** widzisz wyłącznie widok użytkownika.

## 2. Widok użytkownika

W górnym pasku użytkownika są teraz tylko 3 zakładki: **Aktualności**, **Regulamin**, **Strefa Gracza**.

### 2.1 Aktualności
1. Kliknij zakładkę **Aktualności**.
2. Odczytaj pole **Najnowsze** z ostatnią wiadomością od administratora (pole ma wysokość 25 linii, więc szybciej pokazuje najważniejszą część komunikatu).

### 2.2 Regulamin
1. Kliknij zakładkę **Regulamin**.
2. Odczytaj pole **Obowiązujące zasady** (pole jest wysokie na 50 linii, co ułatwia czytanie długiego regulaminu).

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
1. Kliknij po lewej **Gry do Potwierdzenia** (jeżeli nazwa przycisku jest dłuższa, aplikacja automatycznie zmniejszy rozmiar fontu, aby tekst pozostał w obrębie przycisku).
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
2. Wpisz treść w polu **Treść wiadomości** (pole ma wysokość 25 linii).
3. Kliknij **Wyślij**.

### 3.2 Czat
1. Wejdź w **Czat**.
2. Użyj opcji usuwania wiadomości (pojedynczo lub starszych niż 30 dni). UI nigdy nie pozwoli usunąć ostatniej wiadomości z kolekcji czatu — zawsze zostaje minimum 1 dokument.

### 3.3 Regulamin
1. Wejdź w **Regulamin**.
2. Edytuj treść w polu **Treść regulaminu** (pole ma wysokość 50 linii).
3. Kliknij **Zapisz**.

### 3.4 Gracze
1. Wejdź w **Gracze**.
2. Lista ładuje konta utworzone przez użytkowników przez przycisk **Utwórz konto** w oknie logowania (email + hasło).
3. W kolumnie **Aplikacja** zaznacz aktywację konta, aby użytkownik mógł korzystać z modułu.
4. W kolumnie **Uprawnienia** kliknij **Edytuj** i zaznacz dostęp do sekcji Strefy Gracza.
5. Dla **Statystyk** użyj przycisku **Lata**, aby wskazać lata widoczne dla gracza.
6. Przycisk **Usuń** usuwa profil użytkownika z `main_users` i uruchamia próbę usunięcia konta Authentication przez Cloud Function `deleteMainUserAccount` (jeśli jest wdrożona). Konto admina `AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2` jest chronione i nie może być skasowane z UI. UI nie pozwala też usunąć ostatniego dokumentu z `main_users`.
7. Puste techniczne rekordy (bez nazwy/e-maila/PIN-u/uprawnień) są automatycznie ukrywane na liście — nie wpływają na normalną obsługę graczy.

### 3.5 Gry admina
1. Wejdź w **Gry admina**.
2. W tym widoku lewy panel **Lata** jest krótszy, a prawy panel **Ranking** szerszy, żeby ograniczyć przewijanie tabeli rankingu.
3. Wybierz rok po lewej stronie.
4. Kliknij **Dodaj**, aby dodać grę.
5. Edytuj pola w tabeli: Rodzaj Gry, Data, Nazwa, CzyZamknięta.
6. Kliknij **Szczegóły** przy nazwie gry.
7. W oknie szczegółów (na PC okno jest szersze i lepiej wykorzystuje ekran):
   - dodawaj/usuwaj graczy,
   - edytuj dane finansowe i punkty,
   - korzystaj z kolumny **LP**,
   - po rozwinięciu listy **Gracz** widzisz tylko dostępnych graczy (osoby już wybrane w innych wierszach są ukryte).
8. W pasku metadanych szczegółów widzisz: Nazwa, Rodzaj gry, Data, **Pula**, **Ilość graczy**.
9. W sekcji podsumowania gry możesz otworzyć **Notatki po grze**.
10. W sekcji statystyk kolejność kolumn to: Ilość Spotkań, **Waga2**, **% udział**, Punkty.

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
5. W **Szczegółach** działa kolumna **LP**, pasek meta pokazuje **Pula** i **Ilość graczy**, a samo okno jest poszerzone na PC.

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
2. Kolumna **Buy-In** pokazuje sumę Buy-In z Tabela9 pomniejszoną o procent z kolumny **%** (Tabela8).
3. Kolumna **Rebuy** pokazuje sumę Rebuy z Tabela9 pomniejszoną o procent z kolumny **%** (Tabela8).
4. Przykład: suma Buy-In = `100`, `%` = `10` → w Tabela7 zobaczysz `90`.
5. Kolumna **Suma** pokazuje `Buy-In + Rebuy` z Tabela7.

#### Cash — Tabela8
1. W kolumnie **%** wpisz liczbę (np. `10`).
2. Po wyjściu z pola aplikacja pokaże wartość jako procent (`10%`).
3. Kolumna **Rake** wylicza się automatycznie: `(Suma Buy-In z Tabela9 + Suma Rebuy z Tabela9) * (1 - % z Tabela8 / 100)`.
4. Przykład: Buy-In = `80`, Rebuy = `20`, `%` = `10` → **Rake** pokaże `90`.
5. Kolumna **Pot** jest polem tylko do odczytu i pokazuje tę samą wartość co wyliczone **Rake**.

#### Cash — Tabela9
1. W kolumnie **Gracz** wybierz gracza z listy.
2. Ten sam gracz nie może wystąpić dwa razy w Tabela9.
3. Lista **Gracz** pokazuje tylko dostępne osoby; gracz już użyty w innym wierszu znika z listy do czasu zwolnienia miejsca.
4. W nagłówku kolumny **Buy-In** kliknij przycisk **Buy-In**, aby otworzyć okno wpisania jednej wartości dla wszystkich wierszy.
5. Po zatwierdzeniu ta wartość zostanie wpisana do wszystkich pól **Buy-In**.
6. Każdy wiersz nadal możesz później edytować ręcznie (domyślnie nowy wiersz ma `0`).
7. W kolumnie **Rebuy** kliknij przycisk z kwotą, aby otworzyć modal rebuy dla tego gracza.
8. W modalu kliknij **Dodaj Rebuy** / **Usuń Rebuy** i wpisuj kwoty; przycisk w tabeli pokazuje sumę pozycji.
9. Numeracja rebuy dla Cash jest liczona niezależnie od trybu Tournament.
10. W kolumnie **Wypłata** wpisz kwotę ręcznie (nowy wiersz startuje od `0`).
11. Kolumna **+/-** liczy automatycznie: `Wypłata - (Buy-In + Rebuy)`.
12. W ostatnim wierszu kliknij **Dodaj**, aby dopisać kolejny wiersz.
13. W dowolnym wierszu kliknij **Usuń**, aby go usunąć. Gdy w danej kolekcji zostałby tylko jeden rekord, UI blokuje usunięcie ostatniego wpisu.

#### Cash — Tabela10
1. Tabela10 jest automatyczna i sortowana malejąco po kolumnie **+/-**.
2. **Lp** to numer po sortowaniu.
3. **Gracz**, **Wypłata**, **+/-** są pobierane z Tabela9.
4. **% Puli** liczy: `Wypłata z Tabela9 / Suma z Tabela7` i jest zaokrąglana do pełnej liczby.

12. Wszystkie zmiany zapisują się automatycznie po chwili — nie ma osobnego przycisku zapisu.
13. Wszystkie pola wyliczane w Kalkulatorze są prezentowane jako pełne liczby (bez miejsc po przecinku).

## 9. Minimalne szerokości kolumn (UI)
- Tam, gdzie w dokumentacji kolumn wpisana jest liczba, aplikacja trzyma minimalną szerokość kolumny w znakach (jednostka `ch`).
- Przykłady widoczne od razu w UI:
  - w **Gracze** kolumna **Nazwa** ma min. 30 znaków, a **PIN** min. 5 znaków,
  - w **Szczegóły gry** kolumna **Gracz** ma min. 25 znaków,
  - w tabelach kalkulatora (Cash/Tournament) kolumny liczbowe mają minimalne szerokości zgodne z `Kolumny.md`.
- Jeżeli w `Kolumny.md` pole „wartość oczekiwana” jest puste, szerokość pozostaje automatyczna.
- W modalu rebuy kolumny **Rebuy 1, Rebuy 2, ...** pozostają stałe: 8 znaków.


## 10. Moduł Second — szybka instrukcja UI
1. Otwórz `Second/index.html`.
2. Po wejściu zobaczysz ten sam ekran logowania co w module Main.
3. Po zalogowaniu rola konta wybiera widok: `admin` (panel + podgląd usera) albo `user` (sam widok użytkownika).
4. W panelu admina dostępne są zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turniej`.
5. W `Aktualności` użyj pola `Treść wiadomości` i przycisku `Wyślij` (samo UI).
6. W `Czat` i `Regulamin` widoczne są opisy i układ identyczne z Main (bez integracji Firebase).
7. W `Gracze` tabela ma kolumny jak w Main: `Aplikacja`, `Nazwa`, `PIN`, `Uprawnienia`, kolumna akcji.
8. W `Turniej` po lewej są przyciski `Instrukcja` i `Odśwież`, a na środku komunikat `Strona w budowie`.
9. W trybie admin widoczny jest także podgląd końcowego widoku użytkownika.

## 4. Logowanie (ekran startowy)
1. Po wejściu do aplikacji widzisz centralne okno logowania z polami **E-mail** i **Hasło**.
2. Kliknij **Zaloguj**, aby wejść do aplikacji zgodnie z przypisaną rolą.
3. Kliknij **Utwórz konto**, aby założyć nowy profil (domyślnie rola `user`).
4. Po zalogowaniu status konta jest widoczny w nagłówku.
5. Aby zakończyć sesję kliknij **Wyloguj**.
6. Po odświeżeniu strony aplikacja wymaga ponownego logowania (sesja logowania nie jest trwała).
7. Aby zresetować hasło wpisz e-mail i kliknij **Reset hasła** (aplikacja wyśle mail resetujący).

## Logowanie i rejestracja (Email/Hasło)
1. W nagłówku wpisz e-mail i hasło.
2. Kliknij **Utwórz konto**, aby samodzielnie założyć konto.
3. Po rejestracji konto jest tworzone jako nieaktywne (`isActive: false`) i wymaga aktywacji/uprawnień przez administratora.
4. Kliknij **Zaloguj**, aby wejść do aplikacji.
5. Kliknij **Wyloguj**, aby zakończyć sesję.
6. Kliknij **Reset hasła**, aby wysłać e-mail resetu.


## Logowanie, rejestracja i reset hasła
1. Na ekranie logowania wpisz poprawny e-mail i hasło, następnie kliknij **Zaloguj**.
2. Aby utworzyć konto kliknij **Utwórz konto**. Formularz nie przyjmie pustych pól, niepoprawnego e-maila ani hasła bez minimum 6 znaków, cyfry i znaku specjalnego.
3. Po rejestracji konto dostaje status **Oczekiwanie na zatwierdzenie** i nie otworzy widoku aplikacji do czasu akceptacji przez admina.
4. Kliknij **Reset hasła** na ekranie startowym, wpisz e-mail i użyj **Wyślij mail**.
5. Po zalogowaniu w górnym pasku widoczny jest aktualny login oraz przycisk **Wyloguj**.

## Zakładka „Gracze” (admin)
1. W tabeli admin widzi kolumny: Aplikacja, Nazwa, E-mail, PIN, Uprawnienia, Status, Akcje.
2. Gracze oczekujący na zatwierdzenie są wyszarzeni i mają tylko akcje **Zatwierdź** oraz **Usuń**.
3. Po kliknięciu **Zatwierdź** odblokowuje się edycja nazwy, PIN-u i uprawnień.
4. E-mail jest tylko do odczytu (bez edycji).
