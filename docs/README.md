# Karty — instrukcja użytkownika

## 1. Uruchomienie aplikacji
1. Otwórz plik `Main/index.html` w przeglądarce.
2. Domyślnie zobaczysz widok gracza.
3. Aby wejść do widoku administratora, dopisz `?admin=1` do adresu i odśwież stronę.
   - Przykład: `.../Main/index.html?admin=1`

---

## 2. Widok administratora (szczegółowo, krok po kroku)

Widzisz trzy stałe elementy:
- nagłówek „TO NIE JEST nielegalny poker” + „TO NIE JEST nielegalne kasyno”,
- przycisk **Instrukcja**,
- na dole strony kartę **Strefa gracza** z podglądem widoku gracza.

Na środku strony jest teraz szeroki, pełny moduł **Panel Administratora** z zakładkami.

## 2.1 Zakładka „Aktualności” (domyślna po wejściu)
Po otwarciu panelu administratora ta zakładka jest aktywna automatycznie.

### Wysłanie wiadomości do graczy
1. Kliknij w pole **Treść wiadomości**.
2. Wpisz komunikat (np. informację o starcie rundy).
3. Kliknij **Wyślij**.
4. Po poprawnym zapisie zobaczysz status „Wiadomość wysłana do graczy.”
5. Gracze zobaczą tę treść w swojej zakładce **Aktualności**.

## 2.2 Zakładka „Gracze”
Zakładka służy do zarządzania listą graczy, PIN-ami i uprawnieniami.

### Dodanie gracza
1. Przejdź do zakładki **Gracze**.
2. Kliknij **Dodaj** pod tabelą.
3. W nowym wierszu wpisz:
   - nazwę w kolumnie **Nazwa**,
   - 5-cyfrowy PIN w kolumnie **PIN**.

### Edycja danych gracza
1. W tym samym wierszu kliknij pole **Nazwa** albo **PIN**.
2. Wprowadź zmianę.
3. Dane zapisują się automatycznie po krótkiej chwili.

### Przypisywanie uprawnień do zakładek użytkownika
1. W kolumnie **Uprawnienia** kliknij przycisk **Edytuj** przy wybranym graczu.
2. W modalu zaznacz/odznacz checkbox przy nazwie zakładki (aktualnie: **Najbliższa gra**).
3. Kliknij **Zamknij**.
4. Zmiana zapisuje się od razu.

### Ważne zasady PIN
- PIN musi mieć dokładnie 5 cyfr.
- Ten sam PIN nie może być przypisany do dwóch graczy.

### Usunięcie gracza
1. W wierszu gracza kliknij **Usuń**.
2. Wiersz zostanie skasowany z tabeli i bazy.

## 2.3 Zakładka „Turnieje”
To miejsce zawiera pełną funkcjonalność dawnych „Stołów”.

### Dodanie turnieju (stołu)
1. Przejdź do **Turnieje**.
2. Kliknij **Dodaj** (prawy górny róg sekcji).
3. Pojawi się nowa karta rozgrywki (np. „Gra 1”).

### Edycja turnieju
1. Kliknij nazwę stołu i wpisz własną nazwę.
2. Uzupełnij pola metadanych:
   - `rodzaj gry`,
   - `data`.
3. Zmiany zapisują się automatycznie.

### Dodawanie i usuwanie wierszy zawodników
1. W karcie turnieju kliknij **Dodaj** pod tabelą.
2. Uzupełnij komórki wiersza.
3. Aby usunąć pojedynczy wiersz, kliknij **Usuń** w tym wierszu.
4. Aby usunąć cały turniej/stół, kliknij czerwony **Usuń** obok nazwy.

### Podsumowanie turniejów
1. Pod listą turniejów znajduje się sekcja **Podsumowanie**.
2. **Suma Gier** = liczba stołów.
3. **Łączna pula** = suma wartości z kolumny `wpłaty` ze wszystkich stołów.

## 2.4 Zakładka „Statystyki”
1. Przejdź do zakładki **Statystyki**.
2. Zobaczysz placeholder: **„do zrobienia później”**.

---

## 3. Widok gracza

## 3.1 Aktualności
1. W karcie **Strefa gracza** kliknij zakładkę **Aktualności**.
2. W polu **Najnowsze** pojawia się ostatnia wiadomość od administratora.

## 3.2 Najbliższa gra
1. Kliknij zakładkę **Najbliższa gra**.
2. Wpisz 5-cyfrowy PIN.
3. Kliknij **Otwórz**.
4. Dostęp zostanie przyznany tylko gdy:
   - PIN istnieje,
   - PIN należy do gracza,
   - gracz ma uprawnienie do zakładki „Najbliższa gra”.

---

## 4. Przycisk „Instrukcja”
1. W widoku administratora kliknij przycisk **Instrukcja** (górny pasek).
2. Otworzy się okno modalne z treścią instrukcji.
3. Kliknij **Odśwież**, aby pobrać najnowszą treść.
4. Zamknij przez:
   - **Zamknij**,
   - ikonę `×`,
   - kliknięcie tła.
