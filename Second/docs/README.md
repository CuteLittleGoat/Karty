# Second — Instrukcja użytkownika (UI)

## 1. Uruchomienie i logowanie
1. Otwórz `Second/index.html` w przeglądarce.
2. Pierwszym ekranem jest okno logowania (identyczne jak w module Main).
3. Zaloguj się kontem z rolą `admin` albo `user`.
4. Widok jest wybierany automatycznie na podstawie roli, bez parametru URL.

## 2. Panel administratora (rola `admin`)

### 2.1 Górny pasek
1. W prawym górnym rogu aplikacji (obok nagłówka) kliknij zielony przycisk `Instrukcja` (ten sam styl co w module Main).
2. Przycisk jest wizualnie zgodny z układem rogu aplikacji i obecnie działa jako element szkieletu UI (bez otwierania dodatkowego okna).
3. W nagłówku karty administratora kliknij `Odśwież` (przycisk jest szkieletem UI, bez akcji).
4. Zakładki panelu znajdują się bezpośrednio pod nagłówkiem `Panel Administratora`.

### 2.2 Zakładka „Aktualności”
1. Kliknij zakładkę `Aktualności`.
2. W sekcji `Wiadomość do graczy` kliknij pole `Treść wiadomości`.
3. Wpisz komunikat dla graczy (pole ma wysokość 25 linii).
4. Kliknij przycisk `Wyślij`.
5. Obok przycisku widzisz status informujący, że to szkielet UI bez Firebase.

### 2.3 Zakładka „Czat”
1. Kliknij zakładkę `Czat`.
2. W nagłówku sekcji przeczytasz opis: `Moderuj wiadomości i usuwaj wpisy starsze niż 30 dni.`
3. Kliknij `Usuń starsze niż 30 dni` (przycisk bez podpiętej logiki backendowej).
4. Niżej widzisz listę wiadomości (w tej wersji pokazany jest wpis przykładowy).

### 2.4 Zakładka „Regulamin”
1. Kliknij zakładkę `Regulamin`.
2. Wpisz treść w polu `Treść regulaminu`.
3. Kliknij `Zapisz`.
4. Status pod przyciskiem informuje, że ekran jest szkieletem UI.

### 2.5 Zakładka „Gracze”
1. Kliknij zakładkę `Gracze`.
2. Zobaczysz identyczny układ kolumn jak w module Main: `Aplikacja`, `Nazwa`, `PIN`, `Uprawnienia`, kolumna akcji.
3. Kliknij `Dodaj` (przycisk bez podpiętej logiki danych).
4. W sekcji **Gracze** uprawnienia nadajesz przez zaznaczanie konkretnych checkboxów dla zakładek.
5. Wiersz tabeli pokazuje stan pusty (`Brak graczy. Dodaj`).

### 2.6 Zakładka „Turniej”
1. Kliknij zakładkę `Turniej`.
2. W lewym panelu `Panel` masz dwa złote przyciski: `Strona1` oraz `Strona2`.
3. Po prawej, w centralnej części, widzisz napis `Strona w budowie`.
4. Przyciski mają wyłącznie funkcję UI (bez backendu i bez Firebase).

### 2.7 Podgląd użytkownika
1. Na dole panelu administratora znajduje się pełnoszerokowy panel podglądu użytkownika (ten sam układ kart i zakładek jak w module Main).
2. W podglądzie od razu widzisz pasek zakładek użytkownika (`Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turniej`) oraz aktywną sekcję `Aktualności`.
3. Układ podglądu jest identyczny z pełnym widokiem użytkownika, więc możesz testować wygląd bez przełączania strony.

## 3. Widok użytkownika (rola `user`)

### 3.1 Zakładki użytkownika
1. U góry widzisz zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turniej`.
2. Kliknięcie zakładki przełącza aktywny panel.

### 3.2 „Aktualności”
1. Wejdź w `Aktualności`.
2. Przeczytaj pole `Najnowsze` (tylko do odczytu, wysokość 25 linii).

### 3.3 „Czat”
1. Wejdź w `Czat`.
2. W sekcji PIN wpisz kod w polu `PIN (5 cyfr)`.
3. Kliknij `Otwórz`.
4. Niżej wpisz treść w polu `Twoja wiadomość`.
5. Kliknij `Wyślij`.
6. W tej wersji działania są tylko szkieletem UI.

### 3.4 „Regulamin”
1. Wejdź w `Regulamin`.
2. Przeczytaj pole `Obowiązujące zasady` (tylko do odczytu).

### 3.5 „Gracze”
1. Wejdź w `Gracze`.
2. Tabela ma ten sam układ kolumn, co w panelu administratora.
3. Przy braku danych widoczny jest wiersz `Brak graczy.`

### 3.6 „Turniej”
1. Wejdź w `Turniej`.
2. Po lewej stronie użyj przycisków `Strona1` i `Strona2`.
3. W środku widzisz tekst `Strona w budowie`.
4. Przyciski nie są podłączone do logiki backendowej.

## 4. Logowanie (ekran startowy)
1. W prawym górnym rogu nagłówka wpisz adres w polu **E-mail**.
2. Wpisz hasło w polu **Hasło**.
3. Kliknij **Zaloguj**.
4. Pod przyciskami odczytaj status logowania — przy błędzie zobaczysz, czy mail nie istnieje, hasło jest błędne albo czy wystąpił problem połączenia z Firebase (z kodem błędu).
5. Aby zakończyć sesję kliknij **Wyloguj**.
6. Po odświeżeniu strony aplikacja wymaga ponownego logowania (sesja logowania nie jest trwała).
7. Aby zresetować hasło wpisz e-mail i kliknij **Reset hasła** (aplikacja wyśle mail resetujący).

## Logowanie i rejestracja (Email/Hasło)
1. W nagłówku wpisz e-mail i hasło.
2. Kliknij **Utwórz konto**, aby samodzielnie założyć konto.
3. Konto startuje bez aktywacji (`isActive: false`) i wymaga nadania uprawnień przez administratora.
4. Kliknij **Zaloguj**, aby rozpocząć sesję.
5. Kliknij **Wyloguj**, aby zakończyć sesję.
6. Kliknij **Reset hasła**, aby wysłać reset e-mailem.


## Logowanie i reset hasła
1. Wpisz poprawny e-mail i hasło i kliknij **Zaloguj**.
2. Rejestracja wymaga poprawnego e-maila oraz hasła (min. 6 znaków, cyfra, znak specjalny).
3. Po rejestracji konto ma status **Oczekiwanie na zatwierdzenie** i nie dostaje dostępu do widoku aplikacji przed akceptacją.
4. Na ekranie startowym kliknij **Reset hasła**, wpisz e-mail i kliknij **Wyślij mail**.
5. Po zalogowaniu w nagłówku wyświetlany jest login i przycisk **Wyloguj**.

## 5. Pasek sesji po zalogowaniu
1. Po poprawnym logowaniu w nagłówku zawsze zobaczysz informację **Zalogowany: ...** i przycisk **Wyloguj**.
2. Pasek sesji pozostaje widoczny także wtedy, gdy profil użytkownika chwilowo nie został jeszcze odczytany z Firestore.

