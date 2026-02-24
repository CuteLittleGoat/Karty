# Kolumny w tabelach — wersja do wydruku i ręcznych zmian

Ten dokument jest przygotowany tak, aby można go wydrukować i łatwo podmieniać wartości.
Opisuje aktualny stan kolumn w aplikacji prostym językiem (bez nazw technicznych z kodu).

---

## Zasady ogólne dla większości tabel

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Główne tabele w panelach | 860 px | brak stałego limitu | do lewej | Tabela zajmuje całą dostępną szerokość sekcji. |
| Tabela graczy | 700 px | brak stałego limitu | do lewej (kolumna z polem wyboru wizualnie na środku) | Kolumna z polem wyboru ma około 88 px. |
| Szeroka tabela statystyk graczy | 2300 px | brak stałego limitu | do lewej | Na mniejszych ekranach wymaga przesuwania poziomego. |
| Tabele kalkulatora | 760 px (na małych ekranach 680 px) | brak stałego limitu | do lewej | Dostosowane do pracy na mniejszych ekranach. |
| Tabela rebuy w oknie kalkulatora | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | Wszystkie kolumny tej tabeli mają jednakową szerokość. |

---

## 1) Gracze (panel administratora)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Aplikacja | automatyczna (wizualnie ok. 88 px) | brak stałego limitu | środek | Pole wyboru ma rozmiar około 18 x 18 px. |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| PIN | automatyczna | brak stałego limitu | do lewej | Przyjmuje wyłącznie cyfry, maksymalnie 5 cyfr. |
| Uprawnienia | automatyczna | brak stałego limitu | do lewej | Lista uprawnień i przycisk edycji. |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski działań (np. usuwanie). |

---

## 2) Listy gier (administrator, użytkownik, najbliższa gra)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Lista wyboru typu gry. |
| Data | automatyczna | brak stałego limitu | do lewej | Pole daty. |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| Status zamknięcia / potwierdzeń | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski (np. szczegóły, usuwanie). |

---

## 3) Szczegóły gry (okno szczegółów)

W kolumnie **Gracz** lista rozwijana pokazuje tylko osoby dostępne dla danego wiersza; gracze już wybrani w innych wierszach tej samej gry są ukrywani (aktualnie wybrana wartość wiersza pozostaje widoczna).

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru gracza. |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| Rebuy / Add-on | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole wyliczane automatycznie. |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| Akcje (część administratora) | automatyczna | brak stałego limitu | do lewej | Przycisk usuwania wiersza. |

---

## 4) Gry do potwierdzenia (strefa gracza)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Wartość informacyjna. |
| Data | automatyczna | brak stałego limitu | do lewej | Data gry. |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Nazwa gry. |
| Potwierdzenie | automatyczna | brak stałego limitu | do lewej | Status i działanie potwierdzające. |

---

## 5) Statystyki

### 5.1 Podsumowanie „Opis / Wartość”

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Opis | automatyczna | brak stałego limitu | do lewej | Nazwa wskaźnika. |
| Wartość | automatyczna | brak stałego limitu | do lewej | Wartość liczbowa lub tekstowa. |

### 5.2 Rozbudowana tabela statystyk graczy

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Gracz | automatyczna | brak stałego limitu | do lewej | Nazwa gracza. |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Liczba zwycięstw. |
| Waga 1 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Ilość spotkań | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Waga 2 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Udział procentowy | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Waga 3 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Bilans (+/-) | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Waga 4 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Waga 5 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Wpłaty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Waga 6 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| Suma z rozegranych gier | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Procent rozegranych gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| Procent wszystkich gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| Wynik końcowy | automatyczna | brak stałego limitu | do lewej | Wartość końcowa rankingu. |

### 5.3 Ranking

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Miejsce | automatyczna | brak stałego limitu | do lewej | Pozycja w rankingu. |
| Gracz | automatyczna | brak stałego limitu | do lewej | Nazwa gracza. |
| Wynik | automatyczna | brak stałego limitu | do lewej | Wynik punktowy. |

---

## 6) Kalkulator

### 6.0 Tabela7 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Rebuy z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In i Rebuy z Tabela7. |

### 6.1 Tabela8 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| % | automatyczna | brak stałego limitu | do lewej | Wpis liczbowy, znak `%` dodawany automatycznie po opuszczeniu pola. |
| Rake | automatyczna | brak stałego limitu | do lewej | Wpis liczbowy kwoty rake. |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik `Suma z Tabela7 - Rake z Tabela8`. |

### 6.2 Tabela9 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoby już wskazane w innych wierszach Cash są ukryte. |
| Buy-In | automatyczna | brak stałego limitu | do lewej | W nagłówku znajduje się przycisk do zbiorczego ustawienia wartości Buy-In dla wszystkich wierszy; każde pole można potem edytować ręcznie, domyślnie 0. |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk z sumą rebuy, otwiera modal. |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe, domyślnie 0. |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik Wypłata-(Buy-In+Rebuy). |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski Dodaj i Usuń wiersz. |

### 6.3 Tabela10 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Lp | automatyczna | brak stałego limitu | do lewej | Autonumeracja po sortowaniu. |
| Gracz | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| +/- | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9, sortowanie malejące. |
| % Puli | automatyczna | brak stałego limitu | do lewej | Wypłata z Tabela9 / Suma z Tabela7. |

### 6.4 Tabela podsumowania wejść (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| Liczba Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |

### 6.5 Tabela uczestników (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoba wybrana w innym wierszu Tournament jest ukryta. |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk otwierający okno rebuy. |
| Eliminacja | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| Akcje | automatyczna | brak stałego limitu | do lewej | Dodawanie i usuwanie wiersza. |

### 6.6 Tabela wartości procentowych i puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Procent | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| Rake | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |

### 6.7 Tabela wygranych (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer miejsca. |
| Gracz | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Wygrana | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |

### 6.8 Tabela podziału puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| Podział puli | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| Kwota | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| Kolumny kolejnych rebuy | automatyczna | brak stałego limitu | do lewej | Pojawiają się tylko, gdy są potrzebne. |
| Mod | automatyczna | brak stałego limitu | do lewej | Pole pomocnicze do obliczeń. |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |

### 6.9 Tabela rebuy w osobnym oknie (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rebuy 1, Rebuy 2, kolejne | stała szerokość: 8 znaków | stała szerokość: 8 znaków | do lewej | Wszystkie kolumny mają identyczną szerokość dla łatwego porównania. |

---

## 7) Zasady wpisywania danych

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Pola liczbowe | nie dotyczy | nie dotyczy | do lewej | Aplikacja usuwa nieprawidłowe znaki i zostawia poprawną liczbę. |
| Pola procentowe | nie dotyczy | nie dotyczy | do lewej | Użytkownik wpisuje samą liczbę, a znak % dodaje się automatycznie. |
| Spójność prezentacji liczb i tekstu | nie dotyczy | nie dotyczy | do lewej | Liczby są ułożone tak samo jak tekst dla jednolitego wyglądu. |
