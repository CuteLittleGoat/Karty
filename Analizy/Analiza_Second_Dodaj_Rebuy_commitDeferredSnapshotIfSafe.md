# Analiza błędu: Second / „Dodaj Rebuy” / `commitDeferredSnapshotIfSafe is not defined`

## Prompt użytkownika
> W module Second nie działa przycisk "Dodaj Rebuy". Pojawia się błąd l  
> Wystąpił nieoczekiwany błąd przy operacji "Dodaj Rebuy". opis: commitDeferredSnapshotIfSafe is not defined  
> 
> Przeprowadź analizę i zaproponuj sposób naprawy.

## Objaw
Po kliknięciu przycisku **Dodaj Rebuy** w module `Second` aplikacja zgłasza błąd:
- `commitDeferredSnapshotIfSafe is not defined`

## Ustalenia techniczne
1. W pliku `Second/app.js` funkcja `commitDeferredSnapshotIfSafe()` jest **wywoływana wielokrotnie** (m.in. po zapisach i w `finally`):
   - linie: 853, 1522, 1547, 1559, 1649.
2. W tym samym pliku **nie istnieje jej definicja** (`const ... =`, `function ...`), co powoduje `ReferenceError` w runtime.
3. W `setupAdminTournament` istnieją zmienne, które sugerują zamierzony mechanizm odraczania snapshotu Firestore (`hasActiveEdit`, `pendingLocalWrites`, `deferredSnapshotState`), ale bez tej funkcji mechanizm nie może zostać domknięty.

## Przyczyna źródłowa
Najbardziej prawdopodobna przyczyna: regresja po refaktorze — pozostawiono wywołania `commitDeferredSnapshotIfSafe()`, ale usunięto/nie przeniesiono implementacji funkcji.

## Proponowany sposób naprawy
Dodać lokalną funkcję `commitDeferredSnapshotIfSafe` wewnątrz `setupAdminTournament`, zaraz po deklaracjach:

- `hasActiveEdit`
- `pendingLocalWrites`
- `deferredSnapshotState`

### Sugerowana implementacja
```js
const commitDeferredSnapshotIfSafe = () => {
  if (hasActiveEdit || pendingLocalWrites > 0 || !deferredSnapshotState) {
    return;
  }
  tournamentState = deferredSnapshotState;
  deferredSnapshotState = null;
  tournamentStatusMessage = "";
  render();
};
```

## Dlaczego to naprawi problem
- Usuwa bezpośrednią przyczynę błędu (`ReferenceError`) podczas kliknięcia **Dodaj Rebuy**.
- Przywraca spójność z już istniejącą logiką `onSnapshot`, która odkłada snapshot do `deferredSnapshotState`, gdy trwa edycja lub lokalny zapis.
- Zapobiega nadpisaniu lokalnych zmian snapshotem w trakcie operacji i pozwala bezpiecznie „dogonić” stan po zakończeniu zapisu.

## Dodatkowa rekomendacja (twardo zalecana)
Warto uzupełnić logikę `hasActiveEdit` o ustawianie `true/false` na `focusin/focusout` dla pól edycyjnych. Obecnie flaga jest zadeklarowana, ale w praktyce niewykorzystywana, przez co ochrona przed konfliktem edycji może być niepełna.

## Plan weryfikacji po wdrożeniu
1. Otworzyć modal **Rebuy gracza** i kliknąć **Dodaj Rebuy**.
2. Potwierdzić brak błędu `commitDeferredSnapshotIfSafe is not defined`.
3. Dodać/usunąć kilka rebuy z rzędu i sprawdzić, czy zapis przechodzi bez „cofania” danych przez snapshot.
4. Sprawdzić konsolę pod kątem nowych błędów JS.
