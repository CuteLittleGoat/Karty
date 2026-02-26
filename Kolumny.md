# Kolumny — aktualny stan

## 1. Main

### 1.1 Gracze (admin)
Lokalizacja: **Panel Administratora → Gracze**
- **Nazwa** — wyrównanie do lewej.
- **PIN** — wyrównanie do lewej (krótkie pole, 5 cyfr).
- **Uprawnienia** — wyrównanie do lewej.
- **Akcje** — wyrównanie do lewej.

### 1.2 Gry admina
Lokalizacja: **Panel Administratora → Gry admina → Tabele Gier**
- **Rodzaj Gry** — lewa.
- **Data** — lewa.
- **Nazwa** — lewa.
- **CzyZamknięta** — środek.
- **Akcje (np. Szczegóły)** — lewa.

### 1.3 Szczegóły gry (admin)
Lokalizacja: modal **Szczegóły gry**
- **LP** — środek.
- **Gracz** — lewa.
- **Kolumny liczbowe (wpłaty, wypłaty, punkty, rebuy, podsumowania)** — prawa.
- **Akcje** — lewa.

### 1.4 Gry użytkowników
Lokalizacja: **Panel Administratora → Gry użytkowników** oraz **Strefa Gracza → Gry użytkowników**
- **Rodzaj Gry** — lewa.
- **Data** — lewa.
- **Nazwa** — lewa.
- **Akcje (Szczegóły, Notatki)** — lewa.

### 1.5 Szczegóły gry użytkownika
Lokalizacja: modale **Szczegóły gry użytkownika**
- **LP** — środek.
- **Gracz** — lewa.
- **Kolumny liczbowe** — prawa.
- **Akcje** — lewa.

### 1.6 Najbliższa gra
Lokalizacja: **Panel Administratora → Najbliższa gra** oraz **Strefa Gracza → Najbliższa gra**
- **Rodzaj gry** — lewa.
- **Data** — lewa.
- **Nazwa** — lewa.
- **CzyWszyscyPotwierdzili** — środek.

### 1.7 Statystyki i ranking
Lokalizacja: **Panel Administratora → Statystyki**, **Panel Administratora → Gry admina**, **Strefa Gracza → Statystyki**
- **Gracz** — lewa.
- **Wskaźniki liczbowe / procentowe / sumy** — prawa.
- **Kolumny wag (Waga1…WagaN)** — prawa.
- **Pozycja rankingowa** — środek.

### 1.8 Kalkulator (Tournament / Cash)
Lokalizacja: **Panel Administratora → Kalkulator**
- **Identyfikatory i etykiety (LP, Gracz, nazwy pól)** — lewa lub środek zależnie od tabeli.
- **Wartości wejściowe liczbowe** — prawa.
- **Wartości wyliczane (sumy, %, rake, podziały)** — prawa.
- **Akcje (np. Rebuy, usuń, tryb)** — lewa.

### 1.9 Rebuy gracza
Lokalizacja: modal **Rebuy gracza**
- **LP/Gracz** — lewa/środek.
- **Rebuy1…RebuyN** — prawa.
- **Akcje kolumn** — lewa.

## 2. Second

### 2.1 Gracze (admin i user)
Lokalizacja: zakładka **Gracze**
- **Nazwa** — lewa.
- **PIN** — lewa.
- **Akcje** (w adminie) — lewa.

### 2.2 Turniej (placeholder)
Lokalizacja: zakładka **Turniej**
- Obecnie brak tabel danych biznesowych.
- Występuje panel nawigacji bocznej z przyciskami i sekcja treści.

## 3. Zasady PC i mobile
- Na PC tabele są wyświetlane w pełnym układzie kolumn.
- Na mobile tabele korzystają z poziomego przewijania (`overflow-x`), kolejność kolumn pozostaje taka sama jak na PC.
- W obu modułach wyrównanie logiczne pozostaje spójne: tekst zwykle do lewej, liczby zwykle do prawej, statusy/LP zwykle do środka.
