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

### 4.1 Lewy panel „Lata” (działa automatycznie)
W tej wersji **nie ma już przycisków „Dodaj rok” i „Usuń rok”**.

Rok pojawia się automatycznie, gdy w tabeli gier istnieje wpis z datą z tego roku.
- jeśli dodasz grę z datą `2026-02-11`, po lewej pojawi się przycisk `2026`,
- jeśli później dodasz grę z datą `2027-10-10`, pojawi się także przycisk `2027`.

Usuwanie roku też jest automatyczne: gdy skasujesz ostatnią grę z danego roku, przycisk tego roku znika z panelu.

Aplikacja zapamiętuje ostatnio kliknięty rok (po odświeżeniu strony nadal będzie aktywny ten sam rok, jeśli nadal istnieje w danych).

### 4.2 Segment „Tabele Gier” (góra)
#### Dodanie nowej gry
1. Kliknij przycisk **Dodaj** w nagłówku „Tabele Gier”.
2. System natychmiast tworzy nowy wpis z datą **dzisiejszą** (`rrrr-MM-dd`, zgodnie z zegarem urządzenia).
3. Aplikacja tworzy nowy wiersz z domyślnymi wartościami:
   - **Rodzaj Gry**: `Cashout`.
   - **Data**: bieżąca data (`rrrr-MM-dd`).
   - **Nazwa**: `Gra X`, gdzie `X` to pierwszy wolny numer dla tej konkretnej daty (np. gdy istnieją `Gra 1` i `Gra 3`, nowa nazwa to `Gra 2`).
4. Po poprawnym zapisie zobaczysz komunikat statusu „Dodano grę ...”. Jeśli zapis się nie uda (np. brak uprawnień Firestore), pojawi się precyzyjny komunikat błędu.

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
- dane i lista lat są liczone wyłącznie z dat wpisanych w zakładce **Gry**,
- lata nie są już dodawane ręcznie — panel lat jest generowany automatycznie z kolekcji gier,
- zakładka Gry nie pobiera danych z Turniejów.

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

## 7. Firebase — konfiguracja konieczna, żeby działały przyciski „Dodaj” i „Usuń” w zakładce Gry
1. Otwórz plik `config/firebase-config.js`.
2. Upewnij się, że ustawienia mają dokładnie takie wartości (z wielkością liter):
   - `gamesCollection: "Tables"`
   - `gameDetailsCollection: "rows"`
3. Wejdź do Firebase Console → Firestore Database → Rules i sprawdź, że masz blok:
   - `match /Tables/{tableId} { allow read, write: if true; ... }`
   - oraz zagnieżdżony blok: `match /rows/{rowId} { allow read, write: if true; }`
4. Kliknij **Publish** w regułach (jeśli cokolwiek zmieniasz).
5. Wróć do aplikacji i odśwież stronę (`Ctrl+R`).
6. Wejdź w `?admin=1` → zakładka **Gry** i sprawdź po kolei:
   - kliknij **Dodaj** w tabeli gier,
   - kliknij **Szczegóły** dla dowolnej gry i kliknij **Dodaj** w modalu,
   - kliknij **Usuń** dla wiersza szczegółów,
   - kliknij **Usuń** dla całej gry.
7. Oczekiwany efekt: wszystkie operacje zapisu/usuwania wykonują się bez błędu uprawnień.

### Dlaczego to naprawia błąd
- Pierwszy błąd dotyczył zapisu do kolekcji `Games`, której nie obejmowały reguły.
- Drugi błąd dotyczył zapisu/usuwania w subkolekcji `details`, podczas gdy reguły dopuszczały subkolekcję `rows`.
- Aplikacja została ustawiona tak, aby zakładka **Gry** używała `Tables` + `rows` (konfigurowalne przez `gamesCollection` i `gameDetailsCollection`).

