# Analiza: ryzyko utraty fokusu podczas autozapisu (2026-02-12)

## Prompt użytkownika
"Zmodyfikuj sekcję "Gry użytkowników" w zakładce "Gry użytkowników".
Jak uzupełniam kolumnę "Nazwa" to po wpisaniu jednego znaku po ok sekundzie aplikacja zapisuje i traci Focus z pola.
Podobny błąd istniał wcześniej w innych polach aplikacji, ale zostało to naprawione.
Popraw zakładkę "Gry użytkowników", żeby kolumna "Nazwa" działała tak samo jak kolumna "Nazwa" w zakładce "Gry admina" - tam ten problem został już rozwiązany.

Dodatkowo przeprowadź analizę i zapisz jej wyniki w folderze Analizy - czy są w aplikacji jeszcze jakieś pola w których ten błąd może wystąpić?"

## Zakres analizy
Przeanalizowano mechanizm przywracania fokusu oparty o:
- `getFocusedAdminInputState(container)`
- `restoreFocusedAdminInputState(container, focusState)`

oraz miejsca, gdzie widok jest przebudowywany po `onSnapshot` i/lub po debounced zapisie.

## Wniosek główny
Błąd tracił fokus, gdy edytowane pole nie miało kompletu atrybutów `data-*` wymaganych do ponownego odnalezienia kontrolki po re-renderze.

## Miejsca sprawdzone

### 1) Zakładka „Gry admina”
- Tabela gier: pola `Rodzaj Gry`, `Data`, `Nazwa` mają pełne `data-focus-target`, `data-section`, `data-table-id`, `data-column-key`.
- Modal „Szczegóły”: pola wejściowe też mają metadane fokusu.
- Ocena: **niskie ryzyko** opisanego błędu.

### 2) Zakładka „Gry użytkowników” (admin + user manager)
- Tabela gier użytkowników przed poprawką miała brak metadanych fokusu dla pól wiersza.
- To powodowało utratę fokusu po autozapisie szczególnie w kolumnie `Nazwa`.
- Po poprawce metadane dodano dla `Rodzaj Gry`, `Data`, `Nazwa`.
- Ocena po poprawce: **niskie ryzyko** w tej części.

### 3) Inne sekcje aplikacji używające debounced update + restore
- „Gracze”, „Stoły”, „Gry admina”, „Statystyki” korzystają z mechanizmu dataset i mają przypisane identyfikatory pola.
- Ocena: **niskie ryzyko** regresji tego samego typu.

## Czy są jeszcze pola, gdzie błąd może wystąpić?
**Tak, potencjalnie wszędzie tam, gdzie jednocześnie występują trzy warunki:**
1. autozapis (np. debounced input),
2. przebudowanie DOM po snapshot/re-render,
3. brak spójnych `data-*` na kontrolce formularza.

W aktualnym kodzie największe ryzyko dotyczy ewentualnych przyszłych pól dodanych bez metadanych fokusu, a nie istniejących już pól objętych mechanizmem.

## Rekomendacja prewencyjna
Dla każdego nowego pola edycyjnego w widokach przebudowywanych dynamicznie stosować checklistę:
- `data-focus-target`
- `data-section`
- `data-table-id` / `data-row-id`
- `data-column-key`

oraz test ręczny: wpisywanie ciągłe przez 3–5 sekund bez ponownego klikania po każdym autozapisie.
