# Second — instrukcja użytkownika (UI)

## 1. Uruchomienie
1. Otwórz `Second/index.html` w przeglądarce.
2. Widok domyślny to tryb użytkownika.
3. Aby wejść do panelu administratora, dopisz `?admin=1` do adresu.
4. Logowanie hasłem administratora jest **tymczasowo wyłączone** na czas testów — po wejściu z `?admin=1` panel otwiera się od razu.
5. Obok przycisku **Instrukcja** pojawia się czerwony komunikat: **tymczasowo brak potrzeby wpisywania hasła admina**.

## 2. Widok użytkownika
Dostępne zakładki:
- **Aktualności**
- **Czat**
- **Regulamin**
- **Notatki**
- **Gracze**
- **Turniej**

### 2.1 Aktualności
- Podgląd najnowszej wiadomości.

### 2.2 Czat
- Podgląd wiadomości.
- Wysłanie wiadomości przez **Wyślij**.

### 2.3 Regulamin
- Podgląd aktualnego regulaminu.

### 2.4 Gracze
- Podgląd listy graczy i ich PIN.

### 2.5 Turniej
- Widok z lewym panelem i sekcją treści.
- Dostępne przyciski panelu: **Strona1** i **Strona2**.
- Część główna wyświetla komunikat o stronie w budowie.

## 3. Panel administratora
Dostępne zakładki:
- **Aktualności**
- **Czat**
- **Regulamin**
- **Notatki**
- **Gracze**
- **Turniej**

### 3.1 Aktualności
1. Wpisz wiadomość.
2. Kliknij **Wyślij**.

### 3.2 Czat
- Podgląd wiadomości.
- Czyszczenie wiadomości starszych niż 30 dni.

### 3.3 Regulamin
1. Edytuj treść regulaminu.
2. Kliknij **Zapisz**.

### 3.4 Notatki
1. Wejdź w zakładkę **Notatki**.
2. Wpisz treść notatki w dużym polu tekstowym.
3. Kliknij **Zapisz** — dane zapisują się w Firebase w dokumencie modułu Second.

### 3.5 Gracze
- Dodawanie gracza.
- Edycja nazwy i PIN.
- Usuwanie gracza (z ochroną przed usunięciem ostatniego rekordu kolekcji głównej).
- Operacje usuwania dokumentów w podkolekcjach nie są blokowane przez tę ochronę.

### 3.6 Turniej
- Układ panelowy identyczny wizualnie z widokiem użytkownika.
- Sekcja ma charakter informacyjny (placeholder).

## 4. Dodatkowe elementy UI
- Przycisk **Instrukcja** w prawym górnym obszarze nagłówka.
- Modal instrukcji ładowany po kliknięciu przycisku.
- Modal logowania administratora (funkcja tymczasowo wyłączona na czas testów).
