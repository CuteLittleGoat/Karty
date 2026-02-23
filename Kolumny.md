# Kolumny.md — aktualny układ tabel

## 1. Gry admina → Tabele Gier
Kolumny:
1. Rodzaj Gry
2. Data
3. Nazwa
4. CzyZamknięta
5. Akcje

## 2. Gry admina → Szczegóły gry (modal)
Kolumny:
1. LP
2. Gracz
3. Wpisowe
4. Rebuy/Add-on
5. Wypłata
6. +/-
7. Punkty
8. Mistrzostwo
9. Akcje

## 3. Gry użytkowników (admin i gracz) → Szczegóły gry (modal)
Kolumny:
1. LP
2. Gracz
3. Wpisowe
4. Rebuy/Add-on
5. Wypłata
6. +/-
7. Punkty
8. Mistrzostwo
9. Akcje

## 4. Gry do potwierdzenia (strefa gracza)
Tabela główna kolumny:
1. Rodzaj Gry
2. Data
3. Nazwa
4. Potwierdzenie

## 5. Gry do potwierdzenia → Szczegóły (modal tylko odczyt)
Kolumny:
1. LP
2. Gracz
3. Wpisowe
4. Rebuy/Add-on
5. Wypłata
6. +/-
7. Punkty
8. Mistrzostwo

## 6. Statystyki (Gry admina + Statystyki)
Kolejność fragmentu środkowego:
- Ilość Spotkań
- Waga2
- % udział
- Punkty

Uwagi:
- Kolumna `Waga7` została usunięta.
- Wynik końcowy liczony jest tylko na wagach Waga1–Waga6.


## 7. Kalkulator
### Tabela1
1. Suma
2. Buy-In
3. Rebuy
4. Liczba Rebuy

### Tabela2
1. LP
2. Gracz
3. Rebuy
4. Eliminated
5. Dodaj
6. Usuń

### Tabela3
1. Rake
2. Rake kwota
3. Buy-In
4. Rebuy
5. Pot

### Tabela4
1. LP
2. Gracz
3. Wygrana

### Tabela5
1. LP
2. Podział puli
3. Kwota
4. Ranking
5. Rebuy1..RebuyN (dynamicznie, tylko dla uzupełnionych wartości)
6. Mod
7. Suma
