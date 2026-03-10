# Analiza: modal „Rebuy gracza” w module Second

## Prompt użytkownika
> Przeprowadź analizę modal "Rebuy gracza" w module Second.
> 1. Porównaj wygląd z modal "Rebuy gracza" w module Second z jego odpowiednikiem w module Main pod kątem wyglądu, szerokości kolumn itp.
> 2. Sprawdź poprawność wprowadzania danych do modala "Rebuy gracza" w module Second. Przykład:
> - Klikam na przycisk w Tabela12 otwierającym modal
> - Uzupełniam kolumnę "RebuyX"
> - Zamykam modal
> - Dane się nie odświeżają.
> - Klikam ten sam przycisk (w tej samej kolumnie u tego samego gracza). Widać wpisaną przeze mnie wartość wewnątrz modal, ale nie widać go na przycisku
> - Klikam "Dodaj Rebuy".
> - Pojawia się nowa kolumna w otwartym modalu
> - Zamykam bez uzupełniania nowej kolumny
> - Dane się aktualizują
>
> To nie powinno tak działać. Dane powinny się odświeżać już po wpisaniu pierwszej wartości i zamknięciu okna modal. Możesz porównać z analogicznym oknem w module Main.
> Sprawdź przyczynę błędu i zaproponuj rozwiązanie.

---

## 1) Porównanie wyglądu (Second vs Main)

### Struktura HTML modala
- **Second**: modal używa tabeli z klasą tylko `admin-data-table` (bez dedykowanej klasy dla tabeli rebuy). 
- **Main**: modal używa tabeli `admin-data-table game-details-rebuy-table` (dedykowana klasa dla rebuy).

### Różnica szerokości kolumn i układu
- W obu modułach globalna klasa `.admin-data-table` ma `width: 100%` i `min-width: 860px`, co wymusza szeroką tabelę.
- W **Main** ta reguła jest **nadpisana** dla modala rebuy przez `.game-details-rebuy-table`:
  - `width: auto`, `min-width: 0`, `table-layout: fixed`
  - `th/td` mają stałą szerokość `8ch`.
- W **Second** brak analogicznego override dla tabeli rebuy (dlatego modal jest mniej zwarty i kolumny nie są tak przewidywalne).

### Wniosek UI
- Wizualna różnica wynika głównie z tego, że **Main ma dedykowany styl tabeli rebuy**, a **Second nie**.

---

## 2) Analiza błędu odświeżania danych po wpisaniu wartości

## Obecna logika w Second
- Wpis w input `table12-rebuy-input` aktualizuje wyłącznie lokalny stan w pamięci (`tournamentState.payments.table12Rebuys[...]`) i sanitizuje wartość.
- **Brak** zapisu do Firestore (`saveState`) i **brak** odświeżenia widoku (`render`) po samym wpisaniu danych.
- Zapis + render występują dopiero po kliknięciu:
  - `Dodaj Rebuy`
  - `Usuń Rebuy`
  bo tylko te akcje mają `await saveState(); render();`.
- Zamknięcie modala (`X`, klik poza modalem, ESC) jedynie go chowa i resetuje aktywnego gracza; nie zapisuje danych i nie renderuje tabeli.

## Dlaczego objawy są dokładnie takie jak zgłoszone
- Po wpisaniu wartości i zamknięciu modala: przycisk w Tabela12 pokazuje starą wartość, bo nie było `render()`.
- Po ponownym otwarciu modala: wpisana wartość jest widoczna, bo nadal siedzi w lokalnym `tournamentState`.
- Po kliknięciu „Dodaj Rebuy” i zamknięciu: następuje save+render, więc UI się synchronizuje i przycisk nagle pokazuje poprawną sumę.

---

## 3) Przyczyna źródłowa

Błąd wynika z niespójności momentu persystencji i odświeżenia:
- Edycja wartości rebuy (input) w **Second** nie uruchamia tego samego flow co pozostałe operacje modyfikujące dane.
- W **Main** analogiczne pole rebuy uruchamia persystencję przy wpisywaniu (debounce + update), dlatego przycisk z sumą jest aktualizowany bez „dodatkowego triggera” typu „Dodaj Rebuy”.

---

## 4) Proponowane rozwiązanie

### Wariant rekomendowany (spójny z Main)
Dla zdarzenia `input` w `table12-rebuy-input` w module Second:
1. Po aktualizacji `rebuyState.values[idx]` uruchomić **debounced save** (`saveState`) zamiast czekać na Add/Remove.
2. Po zapisaniu wykonać `render()` (lub co najmniej odświeżenie sekcji Tabela12).
3. Na zamknięciu modala wykonać „flush” oczekującego debounced save (żeby użytkownik nie stracił ostatniego wpisu po szybkim zamknięciu okna).

### Wariant minimalny
- Dodać `await saveState(); render();` w `closeTable12RebuyModal` **tylko gdy wykryto zmiany** od otwarcia.
- To naprawi scenariusz zgłoszony przez użytkownika, ale da gorszy UX przy dłuższej edycji (brak bieżącej synchronizacji).

### Dodatkowe uspójnienie wyglądu
Aby Second wyglądał jak Main:
- Nadać tabeli w modalu rebuy dedykowaną klasę (np. `game-details-rebuy-table`),
- Dodać style jak w Main: `width:auto`, `min-width:0`, `table-layout:fixed`, kolumny `8ch`.

---

## 5) Podsumowanie

- **Błąd funkcjonalny potwierdzony**: brak save/render po samej edycji inputa rebuy w modalu Second.
- **Przyczyna**: zapis jest podpięty wyłącznie pod Add/Remove, nie pod input/close.
- **Naprawa**: dodać persystencję i odświeżanie po edycji (najlepiej debounce + flush na zamknięciu).
- **Różnice UI**: Second nie ma dedykowanych styli tabeli rebuy, przez co różni się szerokością/układem od Main.
