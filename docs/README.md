# Karty — instrukcja użytkownika (administrator + gracz)

## 1. Uruchomienie aplikacji
1. Otwórz `Main/index.html` w przeglądarce.
2. Aby wejść do panelu administratora, dopisz `?admin=1` do adresu, np. `.../Main/index.html?admin=1`.
3. Bez `?admin=1` widoczna jest tylko strefa użytkownika.

---

## 2. Panel Administratora — szybki opis zakładek
W panelu są zakładki:
- **Aktualności**
- **Gracze**
- **Turnieje**
- **Gry**

Zakładka **Statystyki** (osobna karta) została usunięta — statystyki są teraz częścią zakładki **Gry**.

---

## 3. Zakładka „Gracze” — co i gdzie kliknąć
### 3.1 Dodanie gracza
1. Kliknij zakładkę **Gracze**.
2. Kliknij przycisk **Dodaj** pod tabelą.
3. W nowym wierszu kliknij pole **Nazwa** i wpisz imię/nick.
4. Kliknij pole **PIN** i wpisz 5 cyfr albo kliknij **Losuj**.

### 3.2 Usunięcie gracza
1. W wierszu gracza kliknij **Usuń**.
2. Wpis gracza znika z listy.

> Ważne dla zakładki Gry: jeśli gracz był już użyty w „Szczegółach gry”, jego nazwa pozostaje historycznie we wpisie, ale po usunięciu z zakładki Gracze nie będzie dostępna do nowego wyboru z listy.

---

## 4. Zakładka „Gry” — pełna instrukcja krok po kroku
Zakładka ma teraz 3 obszary:
1. **Lewa kolumna „Lata”**.
2. **Górny segment „Tabele Gier”**.
3. **Dolny segment „Statystyki”**.

Dodatkowo pod tabelą gier pojawiają się sekcje **„Podsumowanie gry [nazwa]”** dla każdej gry z wybranego roku.

### 4.1 Lewy panel „Lata”
#### Dodanie roku
1. W zakładce **Gry** kliknij **Dodaj rok**.
2. Wpisz rok `RRRR` (np. `2027`).
3. Kliknij **OK**.
4. Kliknij nowy rok na liście, aby go aktywować.

#### Usunięcie roku
1. Kliknij rok na liście po lewej.
2. Kliknij **Usuń rok**.

### 4.2 Segment „Tabele Gier” (góra)
#### Dodanie nowej gry
1. Kliknij przycisk **Dodaj** w nagłówku „Tabele Gier”.
2. Upewnij się, że po lewej stronie jest aktywny właściwy rok (podświetlony przycisk roku).
3. Aplikacja tworzy nowy wiersz z domyślnymi wartościami:
   - **Rodzaj Gry**: `Cashout`.
   - **Data**: `01-01` aktywnego roku z panelu „Lata” (np. dla aktywnego roku `2027` nowa gra dostaje datę `2027-01-01`).
   - **Nazwa**: `Gra X`, gdzie `X` to pierwszy wolny numer dla tej konkretnej daty.
4. Jeśli z jakiegoś powodu rok nie jest aktywny, system użyje bieżącej daty systemowej.

#### Edycja wiersza gry
1. W kolumnie **Rodzaj Gry** wybierz z listy `Cashout` lub `Turniej`.
2. W kolumnie **Data** kliknij pole daty i wybierz dzień.
3. W kolumnie **Nazwa** wpisz własną nazwę gry.
4. Kliknij **Szczegóły**, aby otworzyć okno szczegółów tej gry.
5. Kliknij **Usuń** (po prawej), aby skasować cały wiersz gry.

### 4.3 Okno „Szczegóły gry”
Po kliknięciu **Szczegóły** otwiera się modal z edytowalną tabelą.

#### Dodanie gracza do szczegółów
1. Kliknij **Szczegóły** przy wybranej grze.
2. W oknie kliknij **Dodaj** (pod tabelą).
3. W nowym wierszu uzupełnij kolumny:
   - **Gracz**: wybór z listy graczy z zakładki „Gracze”.
   - **Wpisowe**: tylko cyfry (dozwolony minus na początku).
   - **Rebuy/Add-on**: tylko cyfry (dozwolony minus na początku).
   - **Wypłata**: tylko cyfry (dozwolony minus na początku).
   - **+/-**: pole liczone automatycznie (`Wpisowe + Rebuy/Add-on - Wypłata`).
   - **Punkty**: tylko cyfry (dozwolony minus na początku).
   - **Mistrzostwo**: checkbox.
4. Aby usunąć wiersz gracza ze szczegółów, kliknij **Usuń** w tym wierszu.

#### Zachowanie usuniętych graczy
- Jeśli administrator usunie gracza w zakładce „Gracze”, nazwa we wcześniej zapisanych szczegółach nie jest kasowana.
- Taki gracz nie jest dostępny na liście rozwijanej do nowego wyboru.

### 4.4 Segment „Podsumowanie gry [nazwa]”
Pod każdą grą renderuje się osobny segment podsumowania.

W segmencie:
1. Linia **Pula** = suma wszystkich wartości `Wpisowe + Rebuy/Add-on` ze szczegółów danej gry.
2. Tabela z kolumnami:
   - Gracz
   - Wpisowe
   - Rebuy/Add-on
   - Wypłata
   - +/-
   - % puli
   - Punkty
   - Mistrzostwo
3. Kolumna **% puli** liczona jest jako `round((Wypłata / Pula) * 100)`.
4. Sortowanie wierszy: malejąco po **% puli**.

### 4.5 Segment „Statystyki” (dół)
Sekcja pokazuje zbiorcze wartości dla aktywnego roku, m.in.:
- liczba gier,
- łączna pula.

### 4.6 Najważniejsza zmiana architektury
Zakładka **Gry** działa niezależnie od zakładki **Turnieje**:
- dane i lista lat są liczone z dat wpisanych w zakładce **Gry**,
- zakładka Gry nie pobiera już danych z Turniejów.

---

## 5. Aktualności
1. Wejdź w zakładkę **Aktualności**.
2. Wpisz wiadomość.
3. Kliknij **Wyślij**.

---

## 6. Strefa gracza
1. Otwórz stronę bez `?admin=1`.
2. W zakładce „Najbliższa gra” wpisz PIN i kliknij **Otwórz**.
3. W zakładce „Aktualności” odczytasz najnowszą wiadomość administratora.
