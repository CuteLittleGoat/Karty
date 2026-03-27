# Analiza: moduł Second — różnice zachowania kolumn (Półfinał)

## Prompt użytkownika
Przeprowadź analizę w module Second.
Na przykładzie panelu Półfinał wyjaśnij mi różnicę między kolumnami

TABELA21
Kolumna GRACZ - Nie mogę edytować wartości.
Kolumna STACK - nie mogę edytować wartości, ale mam pole jak do edycji

TABELA FINAŁOWA
Kolumna STACK - mam pole edycji i mogę edytować wartość.

Jak się nazywa parametr który decyduje o zachowaniu kolumn? Jak będę chciał w przyszłości modyfikować kolumny, żeby zachowywały się jak jedna z trzech powyższych to jak to opisać?

---

## Wnioski

W panelu `Półfinał` zachowanie kolumn nie jest sterowane jednym centralnym „parametrem kolumny” (jak np. `editable: true/false`), tylko **konkretną konfiguracją HTML pola** w renderze:

1. **Czy komórka jest zwykłym tekstem (`<td>tekst</td>`) czy inputem (`<input ...>`)**.
2. **Czy input ma atrybut `readonly`**.
3. Dodatkowo: czy input ma `data-role` obsługiwane przez event `input` (logika zapisu), np. `semi-final-stack`.

### 1) TABELA21 → kolumna GRACZ (brak edycji, zwykły tekst)
Render:
- `GRACZ` jest generowany jako zwykły tekst w komórce: `...<td>${esc(row.playerName)}</td>...`
- To nie jest input, więc nie ma możliwości edycji.

### 2) TABELA21 → kolumna STACK (wygląda jak pole, ale brak edycji)
Render:
- `STACK` jest inputem: `<input class="admin-input t-stack-input" ... data-role="semi-stack" ... readonly tabindex="-1" aria-readonly="true">`
- Kluczowe dla blokady jest **`readonly`**.
- Dlatego wizualnie to pole formularza (styl `.admin-input`), ale użytkownik nie zmienia wartości.

### 3) TABELA FINAŁOWA → kolumna STACK (pełna edycja)
Render:
- `STACK` jest inputem: `<input class="admin-input t-stack-input" data-role="semi-final-stack" ...>`
- Brak `readonly`, więc pole jest edytowalne.
- Dodatkowo ma obsługę `input` i zapis do stanu: `finalStack: target.value || "0"`.

## Jak nazywa się parametr decydujący?
Najkrócej: **atrybut `readonly`** (dla inputów) decyduje, czy pole input jest edytowalne czy tylko do odczytu.

W praktyce w tym module działają razem:
- **typ renderu komórki** (`tekst` vs `input`),
- **`readonly`** na input,
- oraz **`data-role` + obsługa eventów** (czy i gdzie wartość ma się zapisywać po edycji).

## Jak opisywać w przyszłości wymagania dla kolumn (gotowe wzorce)

Używaj poniższych 3 sformułowań/specyfikacji:

1. **Typ A — „tylko odczyt, zwykły tekst”**
   - „Kolumna ma być renderowana jako zwykły tekst w `<td>`, bez inputa.”
   - Efekt: brak pola edycji i brak możliwości wpisywania.

2. **Typ B — „tylko odczyt, ale wygląd inputa”**
   - „Kolumna ma być renderowana jako `<input>` z `readonly` (opcjonalnie `aria-readonly='true'`, `tabindex='-1'`) i klasą `admin-input`.”
   - Efekt: wygląda jak pole formularza, ale nie można edytować.

3. **Typ C — „edytowalny input”**
   - „Kolumna ma być renderowana jako `<input>` bez `readonly`, z `data-role='<rola>'` i obsługą tej roli w `container.addEventListener('input', ...)` oraz zapisem do `tournamentState`.”
   - Efekt: użytkownik może zmieniać wartość, a zmiana zapisuje się i wpływa na dalsze tabele/obliczenia.

## Dodatkowa obserwacja (UI)

Dla kolumn `STACK` w TABELA21 i TABELI FINAŁOWEJ użyta jest ta sama klasa `.t-stack-input` (szerokość 96px), więc pola są wizualnie spójne, a różnica zachowania wynika z `readonly` i obsługi zapisu.
