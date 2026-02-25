# Second — Instrukcja użytkownika (UI)

## 1. Start aplikacji
1. Otwórz `Second/index.html`.
2. Aby wejść jako administrator, dopisz w adresie `?admin=1`.
3. Aby wejść jako użytkownik, otwórz stronę bez parametru.

## 2. Widok administratora (`?admin=1`)

### 2.1 Górna część ekranu
1. W lewym górnym rogu widzisz tytuł modułu.
2. Pod nagłówkiem widzisz główną kartę panelu.

### 2.2 Zakładki panelu
1. Kliknij zakładkę `Aktualności`, `Czat`, `Gracze` lub `Turniej`.
2. Aktywna zakładka ma wyróżniony kolor i podświetlenie.
3. Po kliknięciu treść niżej przełącza się tylko dla wybranej zakładki.

### 2.3 Zakładka „Aktualności”
1. Kliknij zakładkę `Aktualności`.
2. Kliknij pole `Treść aktualności`.
3. Wpisz komunikat dla użytkowników.
4. Tekst od razu pojawia się w podglądzie użytkownika niżej.

### 2.4 Zakładka „Czat”
1. Kliknij zakładkę `Czat`.
2. Przeglądaj listę wiadomości.
3. Aby usunąć wpis, kliknij `Usuń` przy wybranej wiadomości.

### 2.5 Zakładka „Gracze”
1. Kliknij zakładkę `Gracze`.
2. Wpisz nazwę w polu `Nazwa gracza`.
3. Wpisz 4 cyfry w polu `PIN`.
4. Zaznacz/odznacz `Dostęp do zakładki Czat`.
5. Kliknij `Dodaj gracza`.
6. Nowy gracz pojawi się od razu w tabeli.
7. Aby usunąć gracza, kliknij `Usuń` w kolumnie `Akcje`.

### 2.6 Zakładka „Turniej”
1. Kliknij zakładkę `Turniej`.
2. W lewym panelu kliknij `Przycisk 1`, `Przycisk 2` lub `Przycisk 3`.
3. W prawym panelu zobaczysz odpowiedni komunikat `W budowie: Strona1/2/3`.

### 2.7 Podgląd widoku użytkownika
1. Pod głównym panelem admina znajduje się karta `Podgląd widoku użytkownika`.
2. Sprawdzisz tam, jak użytkownik widzi zakładki `Aktualności`, `Czat`, `Turniej`.

## 3. Widok użytkownika (bez `?admin=1`)

### 3.1 Zakładka „Aktualności”
1. Otwórz `Aktualności`.
2. Przeczytaj treść w polu tylko do odczytu.

### 3.2 Zakładka „Czat”
1. Otwórz zakładkę `Czat`.
2. Wpisz PIN gracza i kliknij `Autoryzuj PIN`.
3. Po poprawnej autoryzacji pojawi się pole `Wiadomość`.
4. Wpisz wiadomość i kliknij `Wyślij`.
5. Wpis pojawi się na liście czatu.

### 3.3 Zakładka „Turniej”
1. Otwórz zakładkę `Turniej`.
2. Kliknij przycisk w lewym panelu.
3. Zobacz treść odpowiadającą wybranemu przyciskowi.

## 4. Spójność wizualna
- Moduł `Second` używa takiego samego fontu, kolorystyki, kart i stylu przycisków jak moduł `Main`.
- Aktywne elementy (zakładki i przyciski) mają taki sam sposób podświetlania jak w `Main`.
