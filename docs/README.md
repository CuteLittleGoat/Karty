# Karty — Instrukcja użytkownika UI

> Ten dokument opisuje **wyłącznie obsługę interfejsu**: co kliknąć, gdzie wpisać dane i jaki efekt powinien być widoczny na ekranie.

## 1. Wejście do aplikacji

1. Otwórz widok aplikacji w przeglądarce.
2. Aby przejść do panelu administratora, dodaj do adresu strony `?admin=1`.
3. Aby przejść do widoku gracza, użyj adresu bez parametru `?admin=1`.

---

## 2. Panel administratora — nawigacja

Po wejściu do panelu administratora widzisz zakładki:
- **Aktualności**
- **Czat**
- **Regulamin**
- **Gracze**
- **Turnieje**
- **Gry admina**
- **Statystyki**
- **Gry użytkowników**
- **Gry do potwierdzenia**

### Szybkie zasady poruszania się
- Kliknięcie zakładki przełącza zawartość środka panelu.
- Przycisk **Odśwież** (górna część panelu) ponownie ładuje dane widoczne w aktywnej zakładce.
- Komunikaty statusu pod nagłówkami (np. „Zapisywanie...”, „Zapisano”) informują, czy akcja się udała.

---

## 3. Zakładka „Aktualności”

### Wysłanie wiadomości do graczy
1. Wejdź w zakładkę **Aktualności**.
2. Kliknij pole **Treść wiadomości**.
3. Wpisz komunikat.
4. Kliknij **Wyślij**.
5. Sprawdź status obok przycisku — po poprawnym wysłaniu pojawia się potwierdzenie.

---

## 4. Zakładka „Czat” (administrator)

### Podgląd i sprzątanie wiadomości
1. Kliknij zakładkę **Czat**.
2. W sekcji listy sprawdź bieżące wiadomości.
3. Aby usunąć stare wiadomości, kliknij **Usuń starsze niż 30 dni**.
4. Potwierdź wynik po komunikacie statusu.

---

## 5. Zakładka „Regulamin”

### Edycja treści regulaminu
1. Otwórz zakładkę **Regulamin**.
2. Kliknij pole **Treść regulaminu**.
3. Wpisz lub popraw tekst zasad.
4. Kliknij **Zapisz**.
5. Odczytaj status pod polem — powinien potwierdzić zapis.

---

## 6. Zakładka „Gracze”

### 6.1 Dodanie gracza
1. Przejdź do zakładki **Gracze**.
2. Kliknij **Dodaj** pod tabelą.
3. W nowym wierszu ustaw:
   - **Aplikacja** (checkbox) — kliknięcie włącza/wyłącza;
   - **Nazwa** — wpisz nazwę gracza;
   - **PIN** — wpisz 5 cyfr lub użyj przycisku **Losuj**.
4. Poczekaj na komunikat statusu o zapisaniu.

### 6.2 Edycja gracza
1. Kliknij wybrane pole w wierszu gracza (Nazwa/PIN/Aplikacja).
2. Zmień wartość.
3. Sprawdź status zapisu.

### 6.3 Uprawnienia gracza
1. W wierszu gracza kliknij **Uprawnienia**.
2. W modalu zaznacz lub odznacz zakładki dostępne dla gracza.
3. Zamknij modal ikoną **X**.
4. Zweryfikuj skrót uprawnień w tabeli graczy.

### 6.4 Usunięcie gracza
1. W wierszu gracza kliknij **Usuń**.
2. Sprawdź, czy wiersz zniknął z tabeli.

---

## 7. Zakładka „Turnieje”

### Dodanie turnieju
1. Otwórz **Turnieje**.
2. Kliknij **Dodaj**.
3. Uzupełnij pola w nowym wierszu (rodzaj, data, nazwa).
4. Kliknij **Szczegóły**, aby wejść do listy uczestników i wyników.

### Edycja i usuwanie
1. Zmieniaj dane bezpośrednio w komórkach tabeli.
2. Aby skasować cały wpis turnieju, kliknij **Usuń** w tym wierszu.

### Szczegóły turnieju (modal)
1. Kliknij **Szczegóły** przy wybranym turnieju.
2. Kliknij **Dodaj**, aby dodać nowy wiersz gracza.
3. Uzupełnij pola (gracz, wpisowe, rebuy/add-on, wypłata, punkty, mistrzostwo).
4. Aby usunąć wiersz gracza, kliknij **Usuń** w tym samym wierszu.
5. Zamknij okno ikoną **X**.

---

## 8. Zakładka „Gry admina”

Zakładka jest podzielona na 3 obszary:
- lewa kolumna **Lata**,
- środek z tabelą gier i statystykami,
- prawa kolumna **Ranking**.

### 8.1 Wybór roku
1. W lewej kolumnie kliknij rok (np. `2026`).
2. Tabela i statystyki automatycznie filtrują się do tego roku.

### 8.2 Dodanie gry
1. Kliknij **Dodaj** w sekcji **Tabele Gier**.
2. Nowy wiersz pojawia się od razu na liście.
3. W razie potrzeby popraw pola: **Rodzaj Gry**, **Data**, **Nazwa**, **CzyZamknięta**.

### 8.3 Szczegóły gry
1. Kliknij **Szczegóły** przy wybranej grze.
2. W modalu kliknij **Dodaj**, aby dopisać gracza.
3. Uzupełnij dane i zaznacz **Mistrzostwo**, jeśli dotyczy.
4. Usuń pojedynczy wpis gracza przyciskiem **Usuń** w jego wierszu.
5. Zamknij modal ikoną **X**.

### 8.4 Zamknięcie gry
1. W tabeli głównej zaznacz pole **CzyZamknięta** dla wybranej gry.
2. Sprawdź, czy status i widoki powiązane pokazują grę jako zamkniętą.

### 8.5 Ranking i statystyki
1. Po zapisaniu danych przejdź wzrokiem do prawej kolumny **Ranking**.
2. W środkowej dolnej sekcji odczytaj wartości statystyk i tabelę graczy.
3. Dla kolumn „Waga1–Waga7” możesz używać przycisków w nagłówkach, by zbiorczo modyfikować wartości.

---

## 9. Zakładka „Statystyki” (administrator)

1. Otwórz zakładkę **Statystyki**.
2. Wybierz rok z listy lat.
3. Sprawdź tabelę rankingową i wartości zbiorcze.
4. Porównaj wyniki z zakładką „Gry admina” — dane powinny być spójne.

---

## 10. Zakładka „Gry użytkowników” (administrator)

Obsługa jest analogiczna do „Gry admina”:
1. Wybierz rok z lewego panelu.
2. Kliknij **Dodaj**, aby utworzyć grę.
3. Edytuj pola gry.
4. Wejdź w **Szczegóły**, dodaj graczy, wypełnij wartości.
5. Zamknij grę przez **CzyZamknięta**.
6. Sprawdź tabelę statystyk i ranking.

---

## 11. Zakładka „Gry do potwierdzenia” (administrator)

1. Wejdź w **Gry do potwierdzenia**.
2. Przeglądaj listę zgłoszonych/oczekujących gier.
3. Otwórz pozycję i zweryfikuj szczegóły.
4. Wykonaj akcję potwierdzenia lub odrzucenia zgodnie z dostępnymi przyciskami.
5. Upewnij się, że status pozycji zmienił się na liście.

---

## 12. Strefa gracza (widok bez `?admin=1`)

Gracz ma własne zakładki:
- **Najbliższa gra**
- **Czat**
- **Gry do potwierdzenia**
- **Gry użytkowników**
- **Statystyki**
- **Aktualności**
- **Regulamin**

### 12.1 Wejście przez PIN
1. Wejdź w zakładkę, która wymaga autoryzacji (np. „Najbliższa gra”, „Czat”).
2. Wpisz PIN gracza.
3. Kliknij **Otwórz**.
4. Po poprawnej weryfikacji widok zakładki zostaje odblokowany.

### 12.2 Czat gracza
1. Po wejściu do zakładki **Czat** kliknij pole wiadomości.
2. Wpisz treść.
3. Kliknij **Wyślij**.
4. Sprawdź, czy wpis pojawił się na liście.

### 12.3 Gry do potwierdzenia
1. Otwórz zakładkę **Gry do potwierdzenia**.
2. Wybierz grę z listy.
3. Kliknij akcję potwierdzenia/odrzucenia przy swoim wpisie.
4. Zweryfikuj zmianę statusu.

### 12.4 Gry użytkowników
1. Otwórz zakładkę **Gry użytkowników**.
2. Wybierz rok.
3. Sprawdź listę gier i szczegóły.

### 12.5 Statystyki gracza
1. Otwórz **Statystyki**.
2. Wybierz rok.
3. Odczytaj własne wyniki oraz ranking.

### 12.6 Aktualności i Regulamin
1. Wejdź do zakładek **Aktualności** i **Regulamin**.
2. Odczytaj opublikowane treści (bez edycji).

---

## 13. Wskazówki UX

- Jeśli po kliknięciu przycisku nie widzisz zmian, najpierw sprawdź komunikat statusu obok sekcji.
- Przy dłuższej edycji pól tekstowych kursor powinien pozostać w aktywnym polu.
- Gdy chcesz wymusić ponowne pobranie danych widocznej zakładki administratora, użyj przycisku **Odśwież**.
