# Analiza problemu: checkbox/przycisk statusu nie reaguje w `Second` → „Losowanie Graczy”

## Prompt użytkownika
> Nie działa okrągły checkbox/przycisk w kolumnie "Status" w module Second w zakładce "Losowanie Graczy".
> Jak najeżdżam kursorem na PC to kursor się zmienia sygnalizując, że da się kliknąć w ikonkę kółka. Jednak aplikacja nie reaguje na klikanie.
> Przeprowadź analizę czemu tak się dzieje i co zrobić, żeby to naprawić.

## Objaw
- UI pokazuje aktywny, klikalny „okrągły” checkbox (kursor `pointer`), ale status nie przełącza się po kliknięciu.

## Ustalenia techniczne
1. Checkbox statusu płatności jest renderowany jako:
   - `<input data-role="player-payment-status" type="checkbox" ...>` wewnątrz `.status-radio`.
2. Styl `.status-radio` i `.status-radio input` poprawnie wskazuje klikalność (`cursor: pointer`) i nie blokuje kliknięcia.
3. W module turniejowym są jednocześnie nasłuchiwane zdarzenia `input`, `change` i `click` na wspólnym kontenerze.
4. Dla `player-payment-status` poprawna logika zmiany stanu istnieje w handlerze `change`.
5. Problem powoduje handler `click`, który działa dla **każdego** elementu z `data-role`:
   - odczytuje `role`,
   - nie ma gałęzi dla `player-payment-status`,
   - ale mimo to zawsze wykonuje `render()` i `saveState()`.
6. Kliknięcie checkboxa (`data-role="player-payment-status"`) wpada więc do handlera `click`, który wykonuje przedwczesny `render` ze starym stanem.
7. Taki przedwczesny re-render może skutecznie „zjadać” efekt kliknięcia (wizualnie brak zmiany, a `change` może zostać zaburzone/usunięte przez odtworzenie DOM).

## Dlaczego użytkownik widzi „klikalne, ale nie działa”
- CSS poprawnie sygnalizuje możliwość kliknięcia.
- Logika JS natychmiast nadpisuje widok starym stanem w handlerze `click`.
- Efekt końcowy: brak widocznej reakcji po kliknięciu.

## Rekomendowane naprawy

### Wariant A (najbezpieczniejszy)
W handlerze `click` dodać szybki `return` dla ról obsługiwanych przez `change`, analogicznie jak w handlerze `input`:
- `player-payment-status`
- `assign-table`
- `semi-assign-status`
- `semi-assign-table`

Przykład logiki:
```js
if (["player-payment-status", "assign-table", "semi-assign-status", "semi-assign-table"].includes(role)) {
  return;
}
```

### Wariant B (docelowo czystszy)
Rozdzielić odpowiedzialności eventów:
- `click` tylko dla przycisków akcji (`add-player`, `delete-player`, `add-table`, ...),
- `change` tylko dla kontrolek formularza (checkbox/select),
- `input` tylko dla pól tekstowych/liczbowych.

## Dodatkowa uwaga
- Po wdrożeniu poprawki warto przetestować ręcznie wszystkie kontrolki formularza w tym module, aby upewnić się, że żadna inna kontrolka nie jest resetowana przez wspólny handler `click`.
