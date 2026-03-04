# Kolumny w tabelach

## Zasady ogólne dla większości tabel

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Główne tabele w panelach | 860 px | brak stałego limitu | do lewej | tekst | Tabela zajmuje całą dostępną szerokość sekcji, a przy zbyt małym oknie przewija się poziomo wewnątrz kontenera. |
| wartość oczekiwana |  |  |  |  |  |
| Tabela graczy | 1320 px | brak stałego limitu | do lewej (kolumna z polem wyboru wizualnie na środku) | tekst | Kolumna z polem wyboru ma około 88 px. |
| wartość oczekiwana |  |  |  |  |  |
| Szeroka tabela statystyk graczy | 2300 px | brak stałego limitu | do lewej | tekst | Na mniejszych ekranach wymaga przesuwania poziomego. |
| wartość oczekiwana |  |  |  |  |  |
| Tabele kalkulatora | 760 px (na małych ekranach 680 px) | brak stałego limitu | do lewej | tekst | Dostosowane do pracy na mniejszych ekranach. |
| wartość oczekiwana |  |  |  |  |  |
| Tabela rebuy w oknie kalkulatora | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | numeric | Wszystkie kolumny tej tabeli mają jednakową szerokość. |
| wartość oczekiwana |  |  |  |  |  |
| Układ zakładek admina z rankingiem (Main: Gry admina, Statystyki) | 20 ch (Lata) / elastyczna środkowa / 42 ch (Ranking) | brak stałego limitu | układ od lewej do prawej | tekst | Sekcja Ranking jest przypięta do prawej kolumny i mieści pełną tabelę bez przewijania. |
| wartość oczekiwana |  |  |  |  |  |

## 1) Gracze (panel administratora)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Aplikacja | 100 px | brak stałego limitu | środek | tekst | Pole wyboru ma rozmiar około 18 x 18 px. |
| wartość oczekiwana |  |  |  |  |  |
| Nazwa | 280 px | brak stałego limitu | do lewej | tekst | Pole tekstowe. |
| wartość oczekiwana |  |  |  |  |  |
| PIN | 180 px | brak stałego limitu | do lewej | numeric | Przyjmuje wyłącznie cyfry, maksymalnie 5 cyfr. |
| wartość oczekiwana |  |  |  |  |  |
| Uprawnienia | 620 px | brak stałego limitu | do lewej | tekst | Lista uprawnień i przycisk edycji. |
| wartość oczekiwana |  |  |  |  |  |
| Akcje | 130 px | brak stałego limitu | do lewej | tekst | Przyciski działań (np. usuwanie). |
| wartość oczekiwana |  |  |  |  |  |

## 2) Listy gier (administrator, użytkownik, najbliższa gra)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Rodzaj gry | 150 px | brak stałego limitu | do lewej | tekst | Lista wyboru typu gry. |
| wartość oczekiwana |  |  |  |  |  |
| Data | 170 px | brak stałego limitu | do lewej | tekst | Pole daty. |
| wartość oczekiwana |  |  |  |  |  |
| Nazwa | 360 px | brak stałego limitu | do lewej | tekst | Pole tekstowe. |
| wartość oczekiwana |  |  |  |  |  |
| Status zamknięcia / potwierdzeń | 150 px | brak stałego limitu | do lewej | tekst | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |  |
| IlośćPotwierdzonych | 230 px | brak stałego limitu | do lewej | numeric | Format `potwierdzeni/zapisani`, np. `3/5`. |
| wartość oczekiwana |  |  |  |  |  |
| Akcje | 140 px | brak stałego limitu | do lewej | tekst | Przyciski (np. szczegóły, usuwanie). |
| wartość oczekiwana |  |  |  |  |  |

## 3) Szczegóły gry (okno szczegółów)

W kolumnie **Gracz** lista rozwijana pokazuje tylko osoby dostępne dla danego wiersza; gracze już wybrani w innych wierszach tej samej gry są ukrywani (aktualnie wybrana wartość wiersza pozostaje widoczna). Kolumna **Rebuy/Add-on** ma zwykły nagłówek, a wierszowa wartość działa jako przycisk otwierający modal szczegółów rebuy.

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | numeric | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Lista wyboru gracza. |
| wartość oczekiwana |  |  |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy / Add-on | automatyczna | brak stałego limitu | do lewej | numeric | Przycisk otwierający okno wpisania wartości (analogicznie do Wpisowego). |
| wartość oczekiwana |  |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | numeric | Pole wyliczane automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | tekst | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |  |
| Akcje (część administratora) | automatyczna | brak stałego limitu | do lewej | tekst | Przycisk usuwania wiersza. |
| wartość oczekiwana |  |  |  |  |  |

## 4) Gry do potwierdzenia (strefa gracza)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Rodzaj gry | 150 px | brak stałego limitu | do lewej | tekst | Wartość informacyjna. |
| wartość oczekiwana |  |  |  |  |  |
| Data | 170 px | brak stałego limitu | do lewej | tekst | Data gry. |
| wartość oczekiwana |  |  |  |  |  |
| Nazwa | 360 px | brak stałego limitu | do lewej | tekst | Nazwa gry. |
| wartość oczekiwana |  |  |  |  |  |
| Potwierdzenie | automatyczna | brak stałego limitu | do lewej | tekst | Status i działanie potwierdzające. |
| wartość oczekiwana |  |  |  |  |  |

## 5) Statystyki

### 5.1 Podsumowanie „Opis / Wartość”

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Opis | automatyczna | brak stałego limitu | do lewej | tekst | Nazwa wskaźnika. |
| wartość oczekiwana |  |  |  |  |  |
| Wartość | automatyczna | brak stałego limitu | do lewej | tekstowe i liczbowe | Wartość liczbowa lub tekstowa. |
| wartość oczekiwana |  |  |  |  |  |

### 5.2 Rozbudowana tabela statystyk graczy

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Nazwa gracza. |
| wartość oczekiwana |  |  |  |  |  |
| Mistrzostwo | automatyczna | brak stałego limitu | do lewej | numeric | Liczba zwycięstw. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 1 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Ilość spotkań | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 2 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Udział procentowy | automatyczna | brak stałego limitu | do lewej | numeric | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Punkty | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 3 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Bilans (+/-) | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 4 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 5 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Wpłaty | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Waga 6 | automatyczna | brak stałego limitu | do lewej | numeric | Pole edytowalne (liczba całkowita). |
| wartość oczekiwana |  |  |  |  |  |
| Suma z rozegranych gier | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Procent rozegranych gier | automatyczna | brak stałego limitu | do lewej | numeric | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Procent wszystkich gier | automatyczna | brak stałego limitu | do lewej | numeric | Znak % dodawany automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Wynik końcowy | automatyczna | brak stałego limitu | do lewej | numeric | Wartość końcowa rankingu. |
| wartość oczekiwana |  |  |  |  |  |

### 5.3 Ranking

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Miejsce | 3 znaki | brak stałego limitu | pionowo środek, poziomo do lewej | numeric | Wiersze rankingu mają podwójną wysokość względem poprzedniego układu. |
| wartość oczekiwana |  |  |  |  |  |
| Gracz | 16 znaków | brak stałego limitu | pionowo środek, poziomo do lewej | tekst | Kolumna zwężona; nazwy zawijają się tylko między słowami (bez łamania słów). |
| wartość oczekiwana |  |  |  |  |  |
| Wynik | 8 znaków | brak stałego limitu | środek (pion i poziom) | numeric | Wynik punktowy. |
| wartość oczekiwana |  |  |  |  |  |

## 6) Kalkulator

### 6.0 Tabela7 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Buy-In | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu, suma Buy-In z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu, suma Rebuy z Tabela9 pomniejszona o wartość z kolumny `%` (Tabela8). |
| wartość oczekiwana |  |  |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu, suma Buy-In i Rebuy z Tabela9. |
| wartość oczekiwana |  |  |  |  |  |

### 6.1 Tabela8 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| % | automatyczna | brak stałego limitu | do lewej | numeric | Wpis liczbowy, znak `%` dodawany automatycznie po opuszczeniu pola. |
| wartość oczekiwana |  |  |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | numeric | Wpis liczbowy kwoty rake. |
| wartość oczekiwana |  |  |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu, wynik `Suma z Tabela7 - Rake z Tabela8`. |
| wartość oczekiwana |  |  |  |  |  |

### 6.2 Tabela9 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Lista wyboru pokazuje tylko dostępnych graczy; osoby już wskazane w innych wierszach Cash są ukryte. |
| wartość oczekiwana |  |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | numeric | W nagłówku znajduje się przycisk do zbiorczego ustawienia wartości Buy-In dla wszystkich wierszy; każde pole można potem edytować ręcznie, domyślnie 0. |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Przycisk z sumą rebuy, otwiera modal. |
| wartość oczekiwana |  |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe, domyślnie 0. |
| wartość oczekiwana |  |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu, wynik Wypłata-(Buy-In+Rebuy). |
| wartość oczekiwana |  |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | tekst | Przyciski Dodaj i Usuń wiersz. |
| wartość oczekiwana |  |  |  |  |  |

### 6.3 Tabela10 (Cash)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Lp | automatyczna | brak stałego limitu | do lewej | numeric | Autonumeracja po sortowaniu. |
| wartość oczekiwana |  |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Dane z Tabela9. |
| wartość oczekiwana |  |  |  |  |  |
| Wypłata | automatyczna | brak stałego limitu | do lewej | numeric | Dane z Tabela9. |
| wartość oczekiwana |  |  |  |  |  |
| +/- | automatyczna | brak stałego limitu | do lewej | numeric | Dane z Tabela9, sortowanie malejące. |
| wartość oczekiwana |  |  |  |  |  |
| % Puli | automatyczna | brak stałego limitu | do lewej | numeric | Wypłata z Tabela9 / Suma z Tabela7. |
| wartość oczekiwana |  |  |  |  |  |

### 6.4 Tabela podsumowania wejść (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Suma | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Pole liczbowe. |
| wartość oczekiwana |  |  |  |  |  |
| Liczba Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |

### 6.5 Tabela uczestników (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | numeric | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Lista wyboru pokazuje tylko dostępnych graczy; osoba wybrana w innym wierszu Tournament jest ukryta. |
| wartość oczekiwana |  |  |  |  |  |
| Buy-In | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Przycisk otwierający okno rebuy. |
| wartość oczekiwana |  |  |  |  |  |
| Eliminacja | automatyczna | brak stałego limitu | do lewej | tekst | Pole wyboru tak/nie. |
| wartość oczekiwana |  |  |  |  |  |
| Akcje | automatyczna | brak stałego limitu | do lewej | tekst | Dodawanie i usuwanie wiersza. |
| wartość oczekiwana |  |  |  |  |  |

### 6.6 Tabela wartości procentowych i puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Procent | automatyczna | brak stałego limitu | do lewej | numeric | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Rake | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Wpisowe | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Pot | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |

### 6.7 Tabela wygranych (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | numeric | Numer miejsca. |
| wartość oczekiwana |  |  |  |  |  |
| Gracz | automatyczna | brak stałego limitu | do lewej | tekst | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Wygrana | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |

### 6.8 Tabela podziału puli (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| LP | automatyczna | brak stałego limitu | do lewej | numeric | Numer porządkowy. |
| wartość oczekiwana |  |  |  |  |  |
| Podział puli | automatyczna | brak stałego limitu | do lewej | numeric | Wpisujesz liczbę, znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Kwota | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |
| Kolumny kolejnych rebuy | automatyczna | brak stałego limitu | do lewej | numeric | Pojawiają się tylko, gdy są potrzebne. |
| wartość oczekiwana |  |  |  |  |  |
| Mod | automatyczna | brak stałego limitu | do lewej | tekst | Pole pomocnicze do obliczeń. |
| wartość oczekiwana |  |  |  |  |  |
| Suma | automatyczna | brak stałego limitu | do lewej | numeric | Pole tylko do odczytu. |
| wartość oczekiwana |  |  |  |  |  |

### 6.9 Tabela rebuy w osobnym oknie (Tournament)

| Kolumna | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Rebuy 1, Rebuy 2, kolejne | stała szerokość: 8 znaków | stała szerokość: 8 znaków | do lewej | numeric | Wszystkie kolumny mają identyczną szerokość dla łatwego porównania. |
| wartość oczekiwana |  |  |  |  |  |

## 7) Zasady wpisywania danych

| Obszar | Minimalna szerokość | Maksymalna szerokość | Wyrównanie | Typ | Inne |
|---|---|---|---|---|---|
| Pola liczbowe | nie dotyczy | nie dotyczy | do lewej | tekst | Aplikacja usuwa nieprawidłowe znaki i zostawia poprawną liczbę. |
| wartość oczekiwana |  |  |  |  |  |
| Pola procentowe | nie dotyczy | nie dotyczy | do lewej | tekst | Użytkownik wpisuje samą liczbę, a znak % dodaje się automatycznie. |
| wartość oczekiwana |  |  |  |  |  |
| Spójność prezentacji liczb i tekstu | nie dotyczy | nie dotyczy | do lewej | tekst | Liczby są ułożone tak samo jak tekst dla jednolitego wyglądu. |
| wartość oczekiwana |  |  |  |  |  |

| Tabela rebuy w oknie szczegółów gry | stała szerokość każdej kolumny: 8 znaków | stała szerokość każdej kolumny: 8 znaków | do lewej | numeric | Układ zgodny z modalem rebuy z Kalkulatora (przyciski Dodaj/Usuń Rebuy). |
