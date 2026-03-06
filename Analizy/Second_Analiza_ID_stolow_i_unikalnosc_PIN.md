# Analiza: Second — ID stołów vs nazwy oraz blokada duplikatów PIN

## Prompt użytkownika
> W module Second jest funkcjonalność, żeby dodawać stoły (tabele) i żeby potem nazwa stołu była w menu rozwijanym i było możliwe przypisanie stołu do gracza w zakładce "Losowanie stołów".
> Przeprowadź analizę czy wszystko opiera się o ID czy o nazwę. Lepiej chyba, żeby opierało się o ID ponieważ nazwy mogą się powtarzać. Tak samo przeprowadź analizę czy istnieje blokada na istnienie dwóch identycznych PIN - takie zabezpieczenie jest w Main.

## Zakres
- Moduł `Second` (logika turnieju i sekcji „Losowanie stołów”).
- Porównanie z modułem `Main` w obszarze walidacji unikalności PIN.

## Wnioski (skrót)
1. **Przypisanie gracza do stołu w `Second` jest oparte o `table.id` (ID), a nie o nazwę stołu.**
2. **Nazwy stołów są używane głównie prezentacyjnie (UI, nagłówki tabel), więc mogą się powtarzać bez psucia mapowania przypisań.**
3. **W `Second` brak blokady przed wpisaniem tego samego PIN do dwóch różnych graczy.**
4. **W `Main` taka blokada istnieje (zarówno na poziomie walidacji inputu, jak i aktualizacji modelu).**

---

## 1) Czy „Losowanie stołów” działa po ID czy po nazwie?

### Dowody z kodu `Second`
- Lista stołów trzymana jest jako tablica obiektów z `id` i `name`.
- Przypisania graczy trzymane są jako `assignments[playerId].tableId`.
- W select (`assign-table`) wartość opcji to `table.id`, a etykieta opcji to `table.name`.
- Po zmianie selecta zapis idzie do `assignments[playerId].tableId = target.value`.

### Interpretacja
- Krytyczne relacje (gracz ↔ stół) są już oparte o **ID**.
- Nazwa stołu jest tylko warstwą wyświetlania i może być nieunikalna.
- To jest zgodne z dobrym wzorcem danych: `ID` jako klucz, `name` jako label.

---

## 2) Co dzieje się przy usuwaniu stołu?

### Dowody
- Usunięcie stołu filtruje `tables` po `table.id`.
- Czyszczone są wpisy `tableEntries[tableId]`.
- W `assignments` i `semi.assignments` usuwane są referencje, gdy `tableId` równa się usuwanemu ID.

### Interpretacja
- Spójność też jest utrzymywana po **ID**, nie po nazwie.

---

## 3) Czy w `Second` jest blokada duplikatów PIN?

### Co jest zaimplementowane
- Pole PIN jest czyszczone do cyfr i skracane do 5 znaków.
- Przycisk „Losuj” generuje PIN, próbując unikać kolizji z istniejącymi PIN-ami.

### Czego brakuje
- Przy ręcznym wpisywaniu PIN (`data-role="player-pin"`) nie ma sprawdzenia, czy taki PIN ma już inny gracz.
- To znaczy: użytkownik może ręcznie ustawić identyczny PIN dla wielu osób.

### Interpretacja
- W `Second` unikalność PIN jest częściowa (tylko generator), ale **nie jest twardo wymuszana globalnie**.

---

## 4) Porównanie z `Main`

W `Main` istnieje pełne zabezpieczenie:
- Funkcja wyszukująca właściciela PIN (`getPinOwnerId`).
- Blokada podczas aktualizacji pola (`updatePlayerField`) — komunikat i brak zapisu duplikatu.
- Walidacja na wejściu (input) — przy duplikacie czyści pole i pokazuje błąd.

W praktyce: `Main` ma mechanizm unikalności PIN, `Second` obecnie nie ma równoważnego zabezpieczenia przy wpisie ręcznym.

---

## Rekomendacja
1. **Nie zmieniać modelu przypisań stołów** (już poprawnie oparty o ID).
2. **Dodać do `Second` twardą walidację unikalności PIN** analogiczną do `Main`, tj.:
   - helper typu `getPinOwnerId(pin, excludedPlayerId)`,
   - blokadę w handlerze `player-pin` (input/change) przed zapisem duplikatu,
   - komunikat błędu UI przy próbie wpisania zajętego PIN.
3. Opcjonalnie: rozważyć walidację unikalności nazw stołów tylko jako UX (ostrzeżenie), ale nie jako klucz danych.

## Ocena końcowa
- **Stoły / przypisania:** ✅ oparte o ID.
- **PIN (Second):** ⚠️ brak pełnej blokady duplikatów przy ręcznym wpisie.
- **PIN (Main):** ✅ pełna blokada duplikatów obecna.
