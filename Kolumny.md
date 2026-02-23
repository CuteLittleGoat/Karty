# Kolumny w tabelach — prosty opis dla użytkownika

Ten dokument opisuje **jak wyglądają kolumny w tabelach w aplikacji**: ile miejsca zajmują, jak są ułożone treści i czego można się spodziewać przy wpisywaniu danych.

Opis jest celowo napisany prostym językiem — bez technicznych nazw.

---

## Zasady ogólne dla wszystkich tabel

- Tabele rozciągają się na całą dostępną szerokość sekcji, w której się znajdują.
- Jeśli na ekranie jest mało miejsca, tabela może być szersza niż ekran i wtedy można ją przesuwać poziomo.
- Treść w komórkach jest domyślnie ustawiona do lewej strony.
- Odstępy wewnątrz komórek są umiarkowane, żeby dane były czytelne.
- W większości miejsc aplikacja nie narzuca bardzo sztywnej szerokości każdej pojedynczej kolumny — szerokość dopasowuje się do zawartości.

---

## 1) Tabela graczy (panel administratora)

Kolumny:
- **Aplikacja** – wąska kolumna z polem wyboru.
- **Nazwa** – miejsce na wpisanie nazwy gracza.
- **PIN** – pole na kod numeryczny.
- **Uprawnienia** – lista uprawnień oraz możliwość ich zmiany.
- **Akcje** – przyciski działań (np. usuwanie).

Uwagi praktyczne:
- Kolumna z polem wyboru jest celowo węższa od pozostałych.
- W polu PIN można wpisać tylko cyfry.

---

## 2) Tabele gier (administrator i użytkownik)

Dotyczy list gier, w tym widoku najbliższej gry.

Najczęściej spotykane kolumny:
- **Rodzaj gry**
- **Data**
- **Nazwa**
- **Status zamknięcia / potwierdzeń**
- **Akcje**

Uwagi praktyczne:
- Każda kolumna ma elastyczną szerokość i dopasowuje się do treści.
- Pola daty i listy wyboru są wyrównane tak samo jak inne pola (do lewej).

---

## 3) Szczegóły gry (okno szczegółów)

Kolumny:
- **LP**
- **Gracz**
- **Wpisowe**
- **Rebuy / Add-on**
- **Wypłata**
- **+/-**
- **Punkty**
- **Mistrzostwo**
- **Akcje** (w części administracyjnej)

Uwagi praktyczne:
- Kolumna **+/-** jest wyliczana automatycznie.
- Pola kwot i punktów przyjmują wartości liczbowe.
- Pole **Mistrzostwo** działa jako zaznaczenie tak/nie.

---

## 4) Gry do potwierdzenia (strefa gracza)

Kolumny:
- **Rodzaj gry**
- **Data**
- **Nazwa**
- **Potwierdzenie**

Uwagi praktyczne:
- Układ jest prosty i czytelny, z naciskiem na szybkie potwierdzenie udziału.

---

## 5) Statystyki

### 5.1 Podsumowanie „Opis / Wartość”

Kolumny:
- **Opis**
- **Wartość**

To zestawienie ma prosty, dwukolumnowy układ.

### 5.2 Rozbudowana tabela statystyk graczy

Kolumny obejmują m.in.:
- dane gracza,
- liczbę zwycięstw,
- liczbę spotkań,
- wartości procentowe,
- punkty,
- bilans,
- wypłaty,
- wpłaty,
- wynik końcowy,
- dodatkowe kolumny „waga” używane do obliczeń.

Uwagi praktyczne:
- Ta tabela jest bardzo szeroka i na mniejszych ekranach wymaga przesuwania poziomego.
- Część pól jest tylko do odczytu, a część można edytować.
- Przy wartościach procentowych znak % pojawia się automatycznie.

### 5.3 Ranking

Kolumny:
- **Miejsce**
- **Gracz**
- **Wynik**

Układ rankingowy jest zwarty i czytelny.

---

## 6) Kalkulator

### 6.1 Pierwsza tabela kalkulatora

Kolumny:
- **Suma**
- **Buy-In**
- **Rebuy**
- **Liczba Rebuy**

Uwagi:
- Część pól wylicza się automatycznie i nie wymaga wpisywania.

### 6.2 Druga tabela kalkulatora

Kolumny:
- **LP**
- **Gracz**
- **Buy-In**
- **Rebuy**
- **Eliminated**
- **Akcje**

Uwagi:
- Wybór gracza pilnuje, aby w tym samym trybie nie dublować tej samej osoby.

### 6.3 Trzecia tabela kalkulatora

Kolumny:
- **%**
- **Rake**
- **Wpisowe**
- **Rebuy**
- **Pot**

Uwagi:
- Wartość procentowa jest wpisywana jako sama liczba, a znak % jest dodawany automatycznie.

### 6.4 Czwarta tabela kalkulatora

Kolumny:
- **LP**
- **Gracz**
- **Wygrana**

Tabela prezentuje końcowy podział wygranych.

### 6.5 Piąta tabela kalkulatora

Kolumny:
- **LP**
- **Podział puli**
- **Kwota**
- kolumny dla kolejnych rebuy (pojawiają się tylko, gdy są potrzebne),
- **Mod**
- **Suma**

Uwagi:
- Część kolumn pojawia się dynamicznie dopiero po wprowadzeniu danych.

### 6.6 Okno rebuy w kalkulatorze

W tym miejscu każda kolumna ma taką samą, stałą szerokość, aby łatwo porównywać wartości między kolumnami.

---

## 7) Zasady wpisywania danych, które wpływają na kolumny

- W polach liczbowych aplikacja usuwa nieprawidłowe znaki i zostawia poprawną wartość liczbową.
- W polach procentowych wpisujesz samą liczbę, a aplikacja sama dokleja znak %.
- Liczby są ustawione tak samo jak tekst (do lewej strony), żeby układ był spójny w całej aplikacji.
