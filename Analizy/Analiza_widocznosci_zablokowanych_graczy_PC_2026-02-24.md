# Analiza: widoczność zablokowanych graczy w wersji PC

## Prompt użytkownika
"W kilku miejscach aplikacji (np. Gry admina, gry użytkowników, kalkulator) istnieje funkcjonalność blokująca wpisanie dwa razy tego samego gracza. Działa to prawidłowo. Jednak popraw wyswietlanie. Obecnie w wersji na PC nie ma różnicy między graczem, którego mogę dodać a który jest zablokowany do wyboru. W wersji mobilnej jest to lepiej widoczne poprzez szary kolor (screen na załączniku). Przeprowadź analizę jak poprawić widoczność w wersji na PC. Czy można ukrywać na liście wyboru graczy, którzy już raz zostali dodani?"

## Stan obecny (dlaczego na PC różnica jest słabo widoczna)

1. Logika blokowania duplikatów działa poprawnie i opiera się o `option.disabled = true`:
   - modal szczegółów gry (Gry admina / Gry użytkowników): `Main/app.js` okolice `renderModal`,
   - kalkulator (Tabela9): `Main/app.js` okolice `renderCashTable9`.
2. Styl globalny dla wszystkich `option` ustawia kolor tekstu na `var(--ink)`, czyli ten sam dla opcji aktywnych i disabled:
   - `select.admin-input option, select option, .admin-data-table select option { color: var(--ink); }`.
3. W desktopowych silnikach przeglądarek (zwłaszcza Chromium) stylowanie `option:disabled` jest ograniczone i bywa częściowo ignorowane lub nadpisywane przez styl natywny. Efekt: disabled bywa prawie nieodróżnialne od zwykłego wpisu.

## Warianty poprawy widoczności na PC

### Wariant A — pozostawić disabled, ale jawnie wyróżnić wpisy „zajęte”

**Jak:**
- utrzymać obecną logikę `option.disabled = true`,
- dla takich opcji dopisywać etykietę, np. `"Mateusz — już dodany"`,
- opcjonalnie dodać prefiks/symbol `⛔`, np. `"⛔ Mateusz (już dodany)"`.

**Zalety:**
- użytkownik od razu widzi, dlaczego nie może kliknąć,
- nie „znika” informacja, że gracz istnieje, ale jest już użyty,
- mała zmiana kodu i niskie ryzyko regresji.

**Wady:**
- lista nadal zawiera pozycje nieaktywne,
- sam kolor może nadal być zależny od przeglądarki, dlatego kluczowe jest dopisanie tekstu.

### Wariant B — ukrywać z listy graczy już użytych (rekomendowane dla PC)

**Jak:**
- zamiast dodawać disabled option, filtrować listę przy renderze:
  - pokaż tylko graczy wolnych,
  - plus zawsze pokaż bieżąco wybranego w danym wierszu (aby nie „zgubić” aktualnej wartości).

**Zalety:**
- najczytelniejsze UX: użytkownik widzi tylko możliwe wybory,
- krótsza lista, szybszy wybór.

**Wady / uwagi:**
- użytkownik nie widzi od razu „kto jest zajęty” (brak pełnego kontekstu),
- warto dodać małą podpowiedź pod selectem, np. „Pokazano tylko dostępnych graczy”.

### Wariant C — dedykowany dropdown zamiast natywnego `<select>`

**Jak:**
- zastąpić natywny select komponentem customowym (lista `div/li`) ze stylowaniem pełnej kontroli dla disabled.

**Zalety:**
- pełna kontrola UI/UX, dostępne zaawansowane oznaczenia.

**Wady:**
- największy koszt wdrożenia i testów,
- większe ryzyko błędów dostępności (klawiatura, screen reader) niż przy natywnym `select`.

## Odpowiedź na pytanie: „Czy można ukrywać na liście wyboru graczy, którzy już raz zostali dodani?”

Tak — technicznie można i w obecnej architekturze jest to proste. Logika ma już zbiór zajętych graczy (`getSelectedPlayerNamesForRows(...)`), więc wystarczy zmienić renderowanie opcji z „disabled” na „pomijanie z listy”, z wyjątkiem aktualnie wybranego gracza w danym wierszu.

## Rekomendacja wdrożeniowa

Dla wersji PC najlepiej zastosować **połączenie B + lekka informacja tekstowa**:
1. domyślnie ukrywać zajętych graczy w dropdownie,
2. zostawiać bieżąco wybranego gracza w edytowanym wierszu,
3. dodać krótką notkę pomocniczą („Wyświetlani są tylko dostępni gracze”).

To daje największą czytelność bez przebudowy komponentów.

## Zakres miejsc wymagających spójnej zmiany (jeśli decyzja = wdrożenie)

1. Modal szczegółów gry (`renderModal`) — listy graczy w wierszach gry.
2. Kalkulator (`renderCashTable9`) — select gracza w tabeli.
3. Analogiczne selecty w modułach gier użytkowników/admina, jeśli korzystają z tego samego schematu disabled.

## Ryzyka i testy po wdrożeniu (checklista)

1. Dodanie gracza w jednym wierszu natychmiast usuwa go z list w pozostałych wierszach.
2. Zmiana wyboru z A na B powoduje, że A wraca do list dostępnych w innych wierszach.
3. Usunięcie wiersza zwalnia gracza na listach.
4. Wczytanie historycznej gry z nieistniejącym już graczem („usunięty”) nadal poprawnie pokazuje wartość wiersza.
5. PC + mobilnie: brak regresji przy przewijaniu listy i zapisie danych.
