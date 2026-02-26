# Kolumny w tabelach — wersja do wydruku i ręcznych zmian

Ten dokument jest przygotowany tak, aby można go wydrukować i łatwo podmieniać wartości.
Opisuje aktualny stan kolumn w aplikacji prostym językiem (bez nazw technicznych z kodu).

Wartości liczbowe wpisane w polach „wartość oczekiwana” oznaczają liczbę znaków szerokości kolumny.

---

## Zasady ogólne dla większości tabel

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Główne tabele w panelach | 860 px | brak stałego limitu | do lewej | Tabela zajmuje całą dostępną szerokość sekcji. |
| wartość oczekiwana |  |  |  |  |
| Tabela graczy | 700 px | brak stałego limitu | do lewej (kolumna z polem wyboru wizualnie na środku) | Kolumna z polem wyboru ma około 88 px. |
| wartość oczekiwana |  |  |  |  |
| Szeroka tabela statystyk graczy | 2300 px | brak stałego limitu | do lewej | Na mniejszych ekranach wymaga przesuwania poziomego. |
| wartość oczekiwana |  |  |  |  |
| Tabele kalkulatora | 760 px (na małych ekranach 680 px) | brak stałego limitu | do lewej | Dostosowane do pracy na mniejszych ekranach. |
| wartość oczekiwana |  |  |  |  |
| Tabela rebuy w oknie kalkulatora | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | Wszystkie kolumny tej tabeli mają jednakową szerokość. |
| wartość oczekiwana |  |  |  |  |

---

## 1) Gracze (panel administratora)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Aplikacja | automatyczna (wizualnie ok. 88 px) | brak stałego limitu | środek | Pole wyboru ma rozmiar około 18 x 18 px. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| wartość oczekiwana | 30 |  |  |  |
| PIN | automatyczna | brak stałego limitu | do lewej | Przyjmuje wyłącznie cyfry, maksymalnie 5 cyfr. |
| wartość oczekiwana | 5 |  |  |  |
| Uprawnienia | automatyczna | brak stałego limitu | do lewej | Lista uprawnień i przycisk edycji. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski działań (np. usuwanie). |
| wartość oczekiwana |  |  |  |  |

---

## 2) Listy gier (administrator, użytkownik, najbliższa gra)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Lista wyboru typu gry. |
| wartość oczekiwana |  |  |  |  |
| Data | automatyczna | brak stałego limitu | do lewej | Pole daty. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| wartość oczekiwana |  |  |  |  |
| Status zamknięcia / potwierdzeń | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski (np. szczegóły, usuwanie). |
| wartość oczekiwana |  |  |  |  |

---

## 3) Szczegóły gry (okno szczegółów)

W kolumnie **Gracz** lista rozwijana pokazuje tylko osoby dostępne dla danego wiersza; gracze już wybrani w innych wierszach tej samej gry są ukrywani (aktualnie wybrana wartość wiersza pozostaje widoczna).

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana | 4 |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru gracza. |
| wartość oczekiwana | 25 |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy / Add-on | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 8 |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 8 |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole wyliczane automatycznie. |
| wartość oczekiwana | 8 |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 4 |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| Akcje (część administratora) | automatyczna | brak stałego limitu | do lewej | Przycisk usuwania wiersza. |
| wartość oczekiwana |  |  |  |  |

---

## 4) Gry do potwierdzenia (strefa gracza)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Wartość informacyjna. |
| wartość oczekiwana |  |  |  |  |
| Data | automatyczna | brak stałego limitu | do lewej | Data gry. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Nazwa gry. |
| wartość oczekiwana |  |  |  |  |
| Potwierdzenie | automatyczna | brak stałego limitu | do lewej | Status i działanie potwierdzające. |
| wartość oczekiwana |  |  |  |  |

---

## 5) Statystyki

### 5.1 Podsumowanie „Opis / Wartość”

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Opis | automatyczna | brak stałego limitu | do lewej | Nazwa wskaźnika. |
| wartość oczekiwana |  |  |  |  |
| Wartość | automatyczna | brak stałego limitu | do lewej | Wartość liczbowa lub tekstowa. |
| wartość oczekiwana |  |  |  |  |

### 5.2 Rozbudowana tabela statystyk graczy

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Gracz | automatyczna | brak stałego limitu | do lewej | Nazwa gracza. |
| wartość oczekiwana | 25 |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Liczba zwycięstw. |
| wartość oczekiwana | 3 |  |  |  |
| Waga 1 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Ilość spotkań | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 4 |  |  |  |
| Waga 2 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Udział procentowy | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana | 5 |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 4 |  |  |  |
| Waga 3 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Bilans (+/-) | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Waga 4 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Waga 5 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Wpłaty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Waga 6 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana | 4 |  |  |  |
| Suma z rozegranych gier | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Procent rozegranych gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana | 5 |  |  |  |
| Procent wszystkich gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana | 5 |  |  |  |
| Wynik końcowy | automatyczna | brak stałego limitu | do lewej | Wartość końcowa rankingu. |
| wartość oczekiwana | 8 |  |  |  |

### 5.3 Ranking

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Miejsce | automatyczna | brak stałego limitu | do lewej | Pozycja w rankingu. |
| wartość oczekiwana | 3 |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Nazwa gracza. |
| wartość oczekiwana | 25 |  |  |  |
| Wynik | automatyczna | brak stałego limitu | do lewej | Wynik punktowy. |
| wartość oczekiwana | 8 |  |  |  |

---

## 6) Kalkulator

### 6.0 Tabela7 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Rebuy z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana | 8 |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In i Rebuy z Tabela7. |
| wartość oczekiwana | 10 |  |  |  |

### 6.1 Tabela8 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| % | automatyczna | brak stałego limitu | do lewej | Wpis liczbowy, znak `%` dodawany automatycznie po opuszczeniu pola. |
| wartość oczekiwana | 5 |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik `(Suma Buy-In z Tabela9 + Suma Rebuy z Tabela9) * (1 - %/100)`. |
| wartość oczekiwana | 8 |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, ta sama wartość co kolumna `Rake` w Tabela8. |
| wartość oczekiwana | 10 |  |  |  |

### 6.2 Tabela9 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoby już wskazane w innych wierszach Cash są ukryte. |
| wartość oczekiwana | 25 |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | W nagłówku znajduje się przycisk do zbiorczego ustawienia wartości Buy-In dla wszystkich wierszy; każde pole można potem edytować ręcznie, domyślnie 0. |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk z sumą rebuy, otwiera modal. |
| wartość oczekiwana | 8 |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe, domyślnie 0. |
| wartość oczekiwana | 8 |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik Wypłata-(Buy-In+Rebuy). |
| wartość oczekiwana | 8 |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski Dodaj i Usuń wiersz. |
| wartość oczekiwana |  |  |  |  |

### 6.3 Tabela10 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Lp | automatyczna | brak stałego limitu | do lewej | Autonumeracja po sortowaniu. |
| wartość oczekiwana | 4 |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| wartość oczekiwana | 25 |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| wartość oczekiwana | 8 |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9, sortowanie malejące. |
| wartość oczekiwana | 8 |  |  |  |
| % Puli | automatyczna | brak stałego limitu | do lewej | Wypłata z Tabela9 / Suma z Tabela7. |
| wartość oczekiwana | 5 |  |  |  |

### 6.4 Tabela podsumowania wejść (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 10 |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana | 8 |  |  |  |
| Liczba Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 5 |  |  |  |

### 6.5 Tabela uczestników (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana | 4 |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoba wybrana w innym wierszu Tournament jest ukryta. |
| wartość oczekiwana | 25 |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk otwierający okno rebuy. |
| wartość oczekiwana | 8 |  |  |  |
| Eliminacja | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Dodawanie i usuwanie wiersza. |
| wartość oczekiwana |  |  |  |  |

### 6.6 Tabela wartości procentowych i puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Procent | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana | 5 |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 10 |  |  |  |

### 6.7 Tabela wygranych (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer miejsca. |
| wartość oczekiwana | 4 |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 25 |  |  |  |
| Wygrana | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 10 |  |  |  |

### 6.8 Tabela podziału puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana | 4 |  |  |  |
| Podział puli | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana | 8 |  |  |  |
| Kwota | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 8 |  |  |  |
| Kolumny kolejnych rebuy | automatyczna | brak stałego limitu | do lewej | Pojawiają się tylko, gdy są potrzebne. |
| wartość oczekiwana | 8 |  |  |  |
| Mod | automatyczna | brak stałego limitu | do lewej | Pole pomocnicze do obliczeń; szerokość dobrana pod wpis do 8 znaków. |
| wartość oczekiwana | 8 |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana | 10 |  |  |  |

### 6.9 Tabela rebuy w osobnym oknie (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Rebuy 1, Rebuy 2, kolejne | stała szerokość: 8 znaków | stała szerokość: 8 znaków | do lewej | Wszystkie kolumny mają identyczną szerokość dla łatwego porównania. |
| wartość oczekiwana |  |  |  |  |

---

## 7) Zasady wpisywania danych

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
| --- | --- | --- | --- | --- |
| Pola liczbowe | nie dotyczy | nie dotyczy | do lewej | Aplikacja usuwa nieprawidłowe znaki i zostawia poprawną liczbę. |
| wartość oczekiwana |  |  |  |  |
| Pola procentowe | nie dotyczy | nie dotyczy | do lewej | Użytkownik wpisuje samą liczbę, a znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Spójność prezentacji liczb i tekstu | nie dotyczy | nie dotyczy | do lewej | Liczby są ułożone tak samo jak tekst dla jednolitego wyglądu. |
| wartość oczekiwana |  |  |  |  |


## Zakładka Gracze (Main)
- **E-mail**: nowa kolumna tylko do odczytu, tekst wyrównany do lewej.
- **Status**: kolumna tekstowa pokazująca „Oczekiwanie na zatwierdzenie” lub „Zatwierdzony”.
- Dla niezatwierdzonych graczy cały wiersz jest wyszarzony, a dostępne akcje ograniczają się do zatwierdzenia/usunięcia (PC i mobile).
