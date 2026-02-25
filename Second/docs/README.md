# Second — Instrukcja użytkownika (UI)

## 1. Jak wejść do aplikacji
- Otwórz `Second/index.html`.
- Dla **widoku użytkownika** użyj adresu bez parametrów (np. `.../Second/index.html`).
- Dla **widoku administratora** dopisz parametr `?admin=1` (np. `.../Second/index.html?admin=1`).

## 2. Widok administratora

### 2.1 Zakładka „Aktualności”
1. Wejdź w zakładkę `Aktualności`.
2. Kliknij pole `Treść aktualności`.
3. Wpisz komunikat.
4. Na dole strony, w sekcji `Podgląd widoku użytkownika`, od razu zobaczysz ten sam tekst w polu tylko do odczytu.

### 2.2 Zakładka „Czat” (moderacja)
1. Wejdź w zakładkę `Czat`.
2. Przeglądaj listę wiadomości.
3. Aby usunąć wiadomość, kliknij przycisk `Usuń` przy wybranym wpisie.
4. Lista od razu odświeża się także w podglądzie użytkownika na dole strony.

### 2.3 Zakładka „Gracze”
1. Wejdź w zakładkę `Gracze`.
2. W polu `Nazwa gracza` wpisz nazwę.
3. W polu `PIN` wpisz dokładnie 4 cyfry.
4. Zaznacz lub odznacz checkbox `Dostęp do zakładki Czat`.
5. Kliknij `Dodaj gracza`.
6. Nowy gracz pojawi się w tabeli poniżej.
7. Aby usunąć gracza, kliknij `Usuń` w kolumnie `Akcje`.

### 2.4 Zakładka „Turniej”
1. Wejdź w zakładkę `Turniej`.
2. W lewym panelu kliknij:
   - `Przycisk 1` → zobaczysz `W budowie: Strona1`.
   - `Przycisk 2` → zobaczysz `W budowie: Strona2`.
   - `Przycisk 3` → zobaczysz `W budowie: Strona3`.

### 2.5 Podgląd użytkownika na dole strony (tylko admin)
- Podgląd pokazuje aktualny ekran użytkownika.
- Sprawdzasz tu, jak użytkownik widzi:
  - `Aktualności`,
  - `Czat`,
  - `Turniej`.

## 3. Widok użytkownika

### 3.1 Zakładka „Aktualności”
1. Otwórz `Aktualności`.
2. Przeczytaj pole `Aktualności` (pole jest tylko do odczytu).

### 3.2 Zakładka „Czat”
1. Otwórz zakładkę `Czat`.
2. Wpisz PIN w polu `PIN gracza`.
3. Kliknij `Autoryzuj PIN`.
4. Jeśli PIN i uprawnienia są poprawne, pojawi się formularz `Wiadomość`.
5. Wpisz treść wiadomości i kliknij `Wyślij`.
6. Wiadomość pojawi się na liście czatu.

### 3.3 Zakładka „Turniej”
1. Otwórz zakładkę `Turniej`.
2. Użyj przycisków po lewej (`Przycisk 1`, `Przycisk 2`, `Przycisk 3`).
3. Obszar po prawej pokazuje odpowiednio `W budowie: Strona1/2/3`.

## 4. Aktualny zakres działania UI
- Aplikacja działa jako **szkielet interfejsu**.
- Dane graczy, aktualności i czatu działają lokalnie w bieżącej sesji strony.
- Nie ma jeszcze zapisu ani odczytu z Firebase.
