# Karty — instrukcja użytkownika

## 1. Start aplikacji
1. Otwórz plik `Main/index.html` w przeglądarce.
2. Domyślnie otwiera się widok gracza.
3. Aby wejść do panelu administratora, dopisz do adresu URL parametr `?admin=1` i odśwież stronę.
   - Przykład: `.../Main/index.html?admin=1`

---

## 2. Widok administratora — pełna instrukcja klik po kliku

## 2.1 Sekcja „Stoły”
### Dodanie nowego stołu
1. Wejdź do panelu administratora (`?admin=1`).
2. W sekcji **Stoły** kliknij przycisk **Dodaj** (prawy górny róg tej sekcji).
3. Pojawi się nowa karta stołu (np. „Gra 1”).

### Zmiana nazwy stołu i metadanych
1. W karcie stołu kliknij pole nazwy (np. „Gra 1”) i wpisz własną nazwę.
2. Nad nazwą stołu uzupełnij pola:
   - `rodzaj gry`,
   - `data`.
3. Zmiany zapisują się automatycznie po chwili.

### Dodawanie i usuwanie wierszy graczy w stole
1. Pod tabelą danego stołu kliknij **Dodaj**.
2. W nowym wierszu uzupełnij kolumny (nazwa gracza, procenty, wpłaty, punkty itd.).
3. Aby usunąć konkretny wiersz, kliknij **Usuń** po prawej stronie wiersza.
4. Aby usunąć cały stół, kliknij czerwony **Usuń** obok nazwy stołu.

### Podsumowanie
1. Pod listą stołów znajduje się blok **Podsumowanie**.
2. Pole **Suma Gier** pokazuje liczbę stołów.
3. Pole **Łączna pula** pokazuje sumę wartości z kolumny `wpłaty` ze wszystkich stołów.

---

## 2.2 Zakładki panelu administratora
W karcie **Panel administratora** są dwie zakładki:
- **Ustawienia**,
- **Gracze**.

## 2.3 Zakładka „Ustawienia”

### Wiadomość do graczy
1. Otwórz zakładkę **Ustawienia**.
2. W sekcji **Wiadomość do graczy** kliknij pole **Treść wiadomości**.
3. Wpisz komunikat.
4. Kliknij **Wyślij**.
5. Wiadomość pojawi się graczom w zakładce **Aktualności**.

### Pole „PIN do zakładki Najbliższa gra” (pozostałość)
1. W tej sekcji nadal możesz wpisać 5-cyfrowy PIN.
2. Przyciski **Zapisz PIN** i **Losuj PIN** działają technicznie, ale są tylko pozostałością po usuniętej funkcji.
3. Ten PIN **nie steruje już dostępem gracza** do zakładki „Najbliższa gra”.

---

## 2.4 Zakładka „Gracze”

W tabeli są 4 kolumny:
- **Nazwa**,
- **PIN**,
- **Uprawnienia**,
- kolumna akcji z przyciskiem **Usuń**.

### Dodanie gracza
1. Otwórz zakładkę **Gracze**.
2. Kliknij **Dodaj** pod tabelą.
3. W nowym wierszu wpisz:
   - nazwę gracza w kolumnie **Nazwa**,
   - 5-cyfrowy PIN w kolumnie **PIN**.

### Ważna reguła PIN
- Nie można przypisać tego samego PIN-u do dwóch graczy.
- Jeśli wpiszesz PIN użyty już w innym wierszu, aplikacja zablokuje taki wpis.

### Edycja uprawnień gracza
1. W kolumnie **Uprawnienia** kliknij **Edytuj** przy wybranym graczu.
2. Otworzy się okno z listą dostępnych zakładek.
3. Aktualnie na liście jest:
   - **Najbliższa gra**.
4. Zaznacz checkbox przy zakładce, aby nadać uprawnienie.
5. Odznacz checkbox, aby odebrać uprawnienie.
6. Kliknij **Zamknij**.

### Jak czytać kolumnę „Uprawnienia”
- Jeśli gracz ma uprawnienie, zobaczysz znacznik z nazwą zakładki.
- Jeśli nie ma dodatkowych uprawnień, zobaczysz „Brak dodatkowych uprawnień”.
- Zakładka **Aktualności** jest zawsze dostępna dla każdego gracza i nie wymaga uprawnień.

### Usunięcie gracza
1. W wierszu gracza kliknij **Usuń** (ostatnia kolumna).
2. Wiersz znika z tabeli i zapisuje się w bazie.

---

## 3. Widok gracza

## 3.1 Aktualności
1. Otwórz zakładkę **Aktualności**.
2. W polu **Najnowsze** zobaczysz ostatnią wiadomość wysłaną przez administratora.

## 3.2 Najbliższa gra (weryfikacja PIN + uprawnienia)
1. Kliknij zakładkę **Najbliższa gra**.
2. Aplikacja pokaże pole PIN.
3. Wpisz swój 5-cyfrowy PIN i kliknij **Otwórz**.
4. Jeśli PIN istnieje i przypisany gracz ma uprawnienie do „Najbliższej gry”, zobaczysz zawartość zakładki.
5. Jeśli PIN jest błędny albo gracz nie ma uprawnienia, zobaczysz komunikat błędu.

---

## 4. Instrukcja w aplikacji
1. W panelu administratora kliknij przycisk **Instrukcja** (górna część strony).
2. Otwiera się okno modalne z instrukcją.
3. Przycisk **Odśwież** pobiera aktualną wersję.
4. Zamknij modal przez:
   - przycisk **Zamknij**,
   - ikonę **×**,
   - kliknięcie tła.
