# Main — instrukcja użytkownika (UI)

## 1. Uruchomienie
1. Otwórz `Main/index.html` w przeglądarce.
2. Standardowo aplikacja startuje w widoku użytkownika.
3. Aby wejść do panelu administratora, dodaj do adresu parametr `?admin=1`.
4. Logowanie hasłem administratora jest **tymczasowo wyłączone** na czas testów — po wejściu z `?admin=1` panel otwiera się od razu.
5. Obok przycisku **Instrukcja** pojawia się czerwony komunikat: **tymczasowo brak potrzeby wpisywania hasła admina**.

## 2. Widok użytkownika

### 2.1 Zakładki główne
W widoku użytkownika dostępne są zakładki:
- **Aktualności**
- **Regulamin**
- **Strefa Gracza**

### 2.2 Aktualności
1. Wejdź w **Aktualności**.
2. Odczytaj najnowszą wiadomość od administratora.

### 2.3 Regulamin
1. Wejdź w **Regulamin**.
2. Odczytaj aktualne zasady.

### 2.4 Strefa Gracza
1. Wejdź w **Strefa Gracza**.
2. Wpisz 5-cyfrowy PIN i kliknij **Otwórz**.
3. Po poprawnej autoryzacji używaj sekcji dostępnych dla danego gracza:
   - **Najbliższa gra**
   - **Czat**
   - **Gry do potwierdzenia**
   - **Gry użytkowników**
   - **Statystyki**

## 3. Co można zrobić w sekcjach Strefy Gracza

### 3.1 Najbliższa gra
- Podgląd tabeli najbliższej gry.
- Jeśli szerokość okna jest zbyt mała, tabela przewija się poziomo wewnątrz sekcji (na desktopie i mobile), dzięki czemu nic nie wychodzi poza panel.

### 3.2 Czat
- Przegląd wiadomości od wszystkich użytkowników czatu (wspólny strumień rozmowy).
- Wiadomości są sortowane jak w panelu admina: od najstarszej do najnowszej, a najnowsze wpisy znajdują się na dole listy.
- Po wejściu do sekcji Czat po autoryzacji PIN-em Strefy Gracza lista ładuje się automatycznie (bez dodatkowego PIN-u czatu).
- Po wejściu do sekcji i po każdym odświeżeniu listy przewijanie ustawia się domyślnie na dół, aby od razu widzieć najnowsze wiadomości (suwak startuje na samym dole).
- Pole wiadomości ma stałą wysokość również na mobile, a przy dłuższej historii pojawia się pionowy suwak.
- Wysłanie nowej wiadomości przyciskiem **Wyślij**.

### 3.3 Gry do potwierdzenia
- Potwierdzenie lub anulowanie udziału.
- Otwieranie szczegółów gry.
- Otwieranie notatek do gry (tylko odczyt).

### 3.4 Gry użytkowników
- Wybór roku w panelu bocznym.
- Dodawanie gry (**Dodaj**).
- Otwieranie szczegółów gry (**Szczegóły**).
- Otwieranie notatek do gry z edycją i kolorowaniem tekstu.

### 3.5 Statystyki
- Wybór roku.
- Podgląd tabel statystyk i rankingu.
- Eksport przez przycisk **Eksportuj**.

## 4. Panel administratora

### 4.1 Dostępne zakładki
- **Aktualności**
- **Czat**
- **Regulamin**
- **Notatki**
- **Gracze**
- **Gry admina**
- **Gry użytkowników**
- **Najbliższa gra**
- **Statystyki**
- **Gry do potwierdzenia**
- **Kalkulator**

### 4.2 Aktualności
1. Wpisz treść wiadomości.
2. Kliknij **Wyślij**.

### 4.3 Czat
- Podgląd rozmowy.
- Wiadomości są wyświetlane od najstarszej do najnowszej (najnowsze na dole).
- Po wejściu do zakładki i po każdej aktualizacji listy przewijanie ustawia się na dół, aby od razu widzieć najnowsze wpisy (suwak startuje na samym dole).
- Lista ma stałą minimalną wysokość i pionowy suwak, więc historia wiadomości jest zawsze dostępna również na urządzeniach mobilnych.
- Usunięcie wiadomości starszych niż 30 dni przyciskiem **Usuń starsze niż 30 dni**.

### 4.4 Regulamin
1. Edytuj treść zasad.
2. Kliknij **Zapisz**.

### 4.5 Notatki
1. Wejdź w zakładkę **Notatki**.
2. Wpisz lub zmodyfikuj treść w dużym polu tekstowym.
3. Kliknij **Zapisz** na dole sekcji.

### 4.6 Gracze
- Dodawanie gracza (**Dodaj**).
- Edycja nazwy i PIN.
- Zarządzanie uprawnieniami do sekcji Strefy Gracza.
- Zarządzanie listą lat dla statystyk konkretnego gracza.

### 4.7 Gry admina
- Wybór roku.
- Dodawanie gry i edycja danych w tabeli.
- Otwieranie **Szczegóły** gry i edycja wierszy graczy.
- Usuwanie gry przyciskiem **Usuń** (wraz z jej detalami).
- Jeżeli próbujesz usunąć ostatni rekord z kolekcji głównej, pojawi się komunikat blokujący usunięcie.
- Podgląd sekcji **Statystyki** i **Ranking** dla wybranego roku.

### 4.8 Gry użytkowników
- Wybór roku.
- Dodawanie gry.
- Otwieranie szczegółów i notatek.

### 4.9 Najbliższa gra
- Podgląd i edycja danych tabeli najbliższej gry.

### 4.10 Statystyki
- Wybór roku.
- Podgląd statystyk i rankingu.
- W głównej tabeli statystyk (kolumny m.in. **Gracz**, **Mistrzostwo**, **Ilość spotkań**) co drugi wiersz ma delikatnie inne tło (zebra striping), co ułatwia śledzenie danych w szerokich tabelach.
- Eksport przez **Eksportuj**.

### 4.11 Gry do potwierdzenia
- Podgląd statusów potwierdzeń.
- Otwieranie szczegółów gry.

### 4.12 Kalkulator
- Przełączanie trybu: **Tournament** / **Cash**.
- Praca na zestawach tabel kalkulatora.
- Obsługa modala rebuy gracza.
- W trybie **Tournament** w **Tabela5** (kolumna **Podział puli**) każdą wartość możesz edytować ręcznie: kliknij pole procentowe, wpisz nową wartość i kliknij poza polem, aby ponownie zobaczyć znak `%`.
- Wprowadzone wartości procentowe w **Tabela5** zapisują się automatycznie i wracają po restarcie aplikacji.
- Jeżeli suma procentów w kolumnie **Podział puli** jest inna niż 100, pod tabelą pojawia się czerwony komunikat: **Nie sumuje się do 100%**.

## 5. Okna modalne używane w module Main
- Logowanie administratora (funkcja tymczasowo wyłączona na czas testów).
- Instrukcja.
- Uprawnienia gracza.
- Lata statystyk gracza.
- Szczegóły gry admina.
- Szczegóły gry użytkownika (admin i gracz).
- Szczegóły potwierdzeń.
- Notatki do gry.
- Rebuy gracza (kalkulator).
