# Kolumny w tabelach

## Zasady ogólne dla większości tabel

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Główne tabele w panelach | 860 px | brak stałego limitu | do lewej | Tabela zajmuje całą dostępną szerokość sekcji, a przy zbyt małym oknie przewija się poziomo wewnątrz kontenera. |
| wartość oczekiwana |  |  |  |  |
| Tabela graczy | 700 px | brak stałego limitu | do lewej (kolumna z polem wyboru wizualnie na środku) | Kolumna z polem wyboru ma około 88 px. |
| wartość oczekiwana |  |  |  |  |
| Szeroka tabela statystyk graczy | 2300 px | brak stałego limitu | do lewej | Na mniejszych ekranach wymaga przesuwania poziomego. |
| wartość oczekiwana |  |  |  |  |
| Tabele kalkulatora | 760 px (na małych ekranach 680 px) | brak stałego limitu | do lewej | Dostosowane do pracy na mniejszych ekranach. |
| wartość oczekiwana |  |  |  |  |
| Tabela rebuy w oknie kalkulatora | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | Wszystkie kolumny tej tabeli mają jednakową szerokość. |
| wartość oczekiwana |  |  |  |  |
| Układ zakładek admina z rankingiem (Main: Gry admina, Statystyki) | 20 ch (Lata) / elastyczna środkowa / 42 ch (Ranking) | brak stałego limitu | układ od lewej do prawej | Sekcja Ranking jest przypięta do prawej kolumny i mieści pełną tabelę bez przewijania. |
| wartość oczekiwana |  |  |  |  |

## 1) Gracze (panel administratora)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Aplikacja | automatyczna (wizualnie ok. 88 px) | brak stałego limitu | środek | Pole wyboru ma rozmiar około 18 x 18 px. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| wartość oczekiwana |  |  |  |  |
| PIN | automatyczna | brak stałego limitu | do lewej | Przyjmuje wyłącznie cyfry, maksymalnie 5 cyfr. |
| wartość oczekiwana |  |  |  |  |
| Uprawnienia | automatyczna | brak stałego limitu | do lewej | Lista uprawnień i przycisk edycji. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski działań (np. usuwanie). |
| wartość oczekiwana |  |  |  |  |

## 2) Listy gier (administrator, użytkownik, najbliższa gra)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Lista wyboru typu gry. |
| wartość oczekiwana |  |  |  |  |
| Data | automatyczna | brak stałego limitu | do lewej | Pole daty. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Pole tekstowe. |
| wartość oczekiwana |  |  |  |  |
| Status zamknięcia / potwierdzeń | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| IlośćPotwierdzonych | automatyczna | brak stałego limitu | do lewej | Format `potwierdzeni/zapisani`, np. `3/5`. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski (np. szczegóły, usuwanie). |
| wartość oczekiwana |  |  |  |  |

## 3) Szczegóły gry (okno szczegółów)

W kolumnie **Gracz** lista rozwijana pokazuje tylko osoby dostępne dla danego wiersza; gracze już wybrani w innych wierszach tej samej gry są ukrywani (aktualnie wybrana wartość wiersza pozostaje widoczna). Kolumna **Rebuy/Add-on** ma zwykły nagłówek, a wierszowa wartość działa jako przycisk otwierający modal szczegółów rebuy.

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru gracza. |
| wartość oczekiwana |  |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |
| Rebuy / Add-on | automatyczna | brak stałego limitu | do lewej | Przycisk otwierający okno wpisania wartości (analogicznie do Wpisowego). |
| wartość oczekiwana |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole wyliczane automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| Akcje (część administratora) | automatyczna | brak stałego limitu | do lewej | Przycisk usuwania wiersza. |
| wartość oczekiwana |  |  |  |  |

## 4) Gry do potwierdzenia (strefa gracza)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Rodzaj gry | automatyczna | brak stałego limitu | do lewej | Wartość informacyjna. |
| wartość oczekiwana |  |  |  |  |
| Data | automatyczna | brak stałego limitu | do lewej | Data gry. |
| wartość oczekiwana |  |  |  |  |
| Nazwa | automatyczna | brak stałego limitu | do lewej | Nazwa gry. |
| wartość oczekiwana |  |  |  |  |
| Potwierdzenie | automatyczna | brak stałego limitu | do lewej | Status i działanie potwierdzające. |
| wartość oczekiwana |  |  |  |  |

## 5) Statystyki

### 5.1 Podsumowanie „Opis / Wartość”

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Opis | automatyczna | brak stałego limitu | do lewej | Nazwa wskaźnika. |
| wartość oczekiwana |  |  |  |  |
| Wartość | automatyczna | brak stałego limitu | do lewej | Wartość liczbowa lub tekstowa. |
| wartość oczekiwana |  |  |  |  |

### 5.2 Rozbudowana tabela statystyk graczy

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Gracz | automatyczna | brak stałego limitu | do lewej | Nazwa gracza. |
| wartość oczekiwana |  |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | Liczba zwycięstw. |
| wartość oczekiwana |  |  |  |  |
| Waga 1 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Ilość spotkań | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Waga 2 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Udział procentowy | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Waga 3 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Bilans (+/-) | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Waga 4 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Waga 5 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Wpłaty | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Waga 6 | automatyczna | brak stałego limitu | do lewej | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |
| Suma z rozegranych gier | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Procent rozegranych gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Procent wszystkich gier | automatyczna | brak stałego limitu | do lewej | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Wynik końcowy | automatyczna | brak stałego limitu | do lewej | Wartość końcowa rankingu. |
| wartość oczekiwana |  |  |  |  |

### 5.3 Ranking

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Miejsce | 3 znaki | brak stałego limitu | pionowo środek, poziomo do lewej | Wiersze rankingu mają podwójną wysokość względem poprzedniego układu. |
| wartość oczekiwana |  |  |  |  |
| Gracz | 16 znaków | brak stałego limitu | pionowo środek, poziomo do lewej | Kolumna zwężona; nazwy zawijają się tylko między słowami (bez łamania słów). |
| wartość oczekiwana |  |  |  |  |
| Wynik | 8 znaków | brak stałego limitu | środek (pion i poziom) | Wynik punktowy. |
| wartość oczekiwana |  |  |  |  |

## 6) Kalkulator

### 6.0 Tabela7 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Rebuy z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana |  |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, suma Buy-In i Rebuy z Tabela7. |
| wartość oczekiwana |  |  |  |  |

### 6.1 Tabela8 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| % | automatyczna | brak stałego limitu | do lewej | Wpis liczbowy, znak `%` dodawany automatycznie po opuszczeniu pola. |
| wartość oczekiwana |  |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | Wpis liczbowy kwoty rake. |
| wartość oczekiwana |  |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik `Suma z Tabela7 - Rake z Tabela8`. |
| wartość oczekiwana |  |  |  |  |

### 6.2 Tabela9 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoby już wskazane w innych wierszach Cash są ukryte. |
| wartość oczekiwana |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | W nagłówku znajduje się przycisk do zbiorczego ustawienia wartości Buy-In dla wszystkich wierszy; każde pole można potem edytować ręcznie, domyślnie 0. |
| wartość oczekiwana |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk z sumą rebuy, otwiera modal. |
| wartość oczekiwana |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Pole liczbowe, domyślnie 0. |
| wartość oczekiwana |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu, wynik Wypłata-(Buy-In+Rebuy). |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Przyciski Dodaj i Usuń wiersz. |
| wartość oczekiwana |  |  |  |  |

### 6.3 Tabela10 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Lp | automatyczna | brak stałego limitu | do lewej | Autonumeracja po sortowaniu. |
| wartość oczekiwana |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| wartość oczekiwana |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9. |
| wartość oczekiwana |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | Dane z Tabela9, sortowanie malejące. |
| wartość oczekiwana |  |  |  |  |
| % Puli | automatyczna | brak stałego limitu | do lewej | Wypłata z Tabela9 / Suma z Tabela7. |
| wartość oczekiwana |  |  |  |  |

### 6.4 Tabela podsumowania wejść (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |
| Liczba Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |

### 6.5 Tabela uczestników (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Lista wyboru pokazuje tylko dostępnych graczy; osoba wybrana w innym wierszu Tournament jest ukryta. |
| wartość oczekiwana |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Przycisk otwierający okno rebuy. |
| wartość oczekiwana |  |  |  |  |
| Eliminacja | automatyczna | brak stałego limitu | do lewej | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | Dodawanie i usuwanie wiersza. |
| wartość oczekiwana |  |  |  |  |

### 6.6 Tabela wartości procentowych i puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Procent | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |

### 6.7 Tabela wygranych (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | Numer miejsca. |
| wartość oczekiwana |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Wygrana | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |

### 6.8 Tabela podziału puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |
| Podział puli | automatyczna | brak stałego limitu | do lewej | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Kwota | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |
| Kolumny kolejnych rebuy | automatyczna | brak stałego limitu | do lewej | Pojawiają się tylko, gdy są potrzebne. |
| wartość oczekiwana |  |  |  |  |
| Mod | automatyczna | brak stałego limitu | do lewej | Pole pomocnicze do obliczeń. |
| wartość oczekiwana |  |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |

### 6.9 Tabela rebuy w osobnym oknie (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Rebuy 1, Rebuy 2, kolejne | stała szerokość: 8 znaków | stała szerokość: 8 znaków | do lewej | Wszystkie kolumny mają identyczną szerokość dla łatwego porównania. |
| wartość oczekiwana |  |  |  |  |

## 7) Zasady wpisywania danych

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Inne |
|---|---|---|---|---|
| Pola liczbowe | nie dotyczy | nie dotyczy | do lewej | Aplikacja usuwa nieprawidłowe znaki i zostawia poprawną liczbę. |
| wartość oczekiwana |  |  |  |  |
| Pola procentowe | nie dotyczy | nie dotyczy | do lewej | Użytkownik wpisuje samą liczbę, a znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |
| Spójność prezentacji liczb i tekstu | nie dotyczy | nie dotyczy | do lewej | Liczby są ułożone tak samo jak tekst dla jednolitego wyglądu. |
| wartość oczekiwana |  |  |  |  |

| Tabela rebuy w oknie szczegółów gry | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | Układ zgodny z modalem rebuy z Kalkulatora (przyciski Dodaj/Usuń Rebuy). |
