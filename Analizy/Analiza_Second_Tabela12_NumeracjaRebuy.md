# Analiza: Second / Wpłaty / Tabela12 / modal „Rebuy gracza”

## Prompt użytkownika
"Przeprowadź dwie analizy i zapisz dwa pliki z analizami w "Analizy"
Sprawdź moduł "Second"
Zakładka "Wpłaty" Tabela12.
Sprawdź modal "Rebuy gracza". Napisz mi dokładnie jaki jest algorytm uzupełniający numerację kolumn "Rebuy1", "Rebuy2", "Rebuy3" itd.
Obecnie każdy z graczy jako pierwszy "Rebuy" ma "Rebuy1". Sprawdź czy to jest błąd algorytmu czy jakieś archiwalne dane, które zostały zapisane przed wdrożeniem zmiany. Wymagania są w Analizy/Wazne_NumeracjaRebuy.md"

## Zakres analizy
- Moduł: `Second`
- Sekcja: `Wpłaty` (Tabela12)
- Element: modal `Rebuy gracza`
- Źródło wymagań: `Analizy/Wazne_NumeracjaRebuy.md`

## Jak działa numeracja Rebuy w obecnym kodzie

### 1) Model danych
Dla każdego gracza trzymany jest obiekt:
- `values[]` — wartości rebuy,
- `indexes[]` — numery kolumn Rebuy.

Stan jest normalizowany przy ładowaniu, a brakujące indeksy są odtwarzane jako `1..N` (dla danego gracza).

### 2) Wyświetlanie nagłówków w modalu
Nagłówki w modalu są budowane bezpośrednio z `indexes[]`:
- jeśli `indexes = [3, 7]`, modal pokaże `Rebuy3`, `Rebuy7`.

### 3) Dodawanie nowej kolumny Rebuy
Po kliknięciu `Dodaj Rebuy`:
1. Kod zbiera wszystkie wpisy rebuy ze wszystkich graczy (`getAllTable12RebuyEntries`).
2. Wyznacza `max(index)` globalnie.
3. Nadaje nowej kolumnie `nextIndex = max + 1`.
4. Dodaje parę:
   - `values.push("")`
   - `indexes.push(nextIndex)`.

Wniosek: aktualny algorytm dodawania numeruje globalnie (zgodnie z wymaganiem z `Wazne_NumeracjaRebuy.md`).

### 4) Usuwanie kolumny Rebuy
Po kliknięciu `Usuń Rebuy`:
1. Usuwana jest ostatnia para `(value, index)` aktywnego gracza.
2. Zapamiętywany jest `removedIndex`.
3. Globalnie wykonywana jest kompaktacja: każdy indeks `> removedIndex` jest zmniejszany o 1.

Wniosek: to jest globalna kompaktacja bez „dziur” w numeracji.

## Dlaczego każdy gracz może mieć pierwsze „Rebuy1”

To **nie wygląda na błąd obecnego algorytmu dodawania**, tylko na efekt danych historycznych / migracji:

1. Dla starych rekordów (bez `indexes[]`) normalizacja tworzy `indexes = [1..N]` osobno dla każdego gracza.
2. Jeśli wcześniej każdy gracz miał tylko jeden rebuy, po normalizacji każdy dostaje lokalnie indeks `1`.
3. Kod nie ma kroku „globalnej deduplikacji” istniejących indeksów po tej migracji.

Efekt: w takich archiwalnych danych można zobaczyć wielu graczy z `Rebuy1` jako pierwszym wpisem.

## Odpowiedź na pytanie „błąd algorytmu czy archiwalne dane?”
Najbardziej prawdopodobna przyczyna obserwacji „u każdego pierwszy Rebuy to Rebuy1”:
- **archiwalne dane zapisane przed wdrożeniem globalnego indeksowania** (albo dane z brakującym/uszkodzonym `indexes[]`),
- a nie bieżący mechanizm `Dodaj Rebuy`.

## Dodatkowa uwaga techniczna
Jeśli potrzebna jest pełna zgodność danych historycznych z nową regułą globalną, potrzebny jest jednorazowy skrypt/migracja, który:
1. zbierze wszystkie istniejące rebuy,
2. nada im unikalne globalne indeksy,
3. przepisze `indexes[]` dla wszystkich graczy.
