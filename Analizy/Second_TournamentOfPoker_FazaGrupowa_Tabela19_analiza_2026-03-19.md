# Analiza modułu Second — Tournament of Poker / Faza Grupowa / TABELA19, TABELA19A, TABELA19B

## Prompt użytkownika
> Przeprowadź analizę modułu Second. Zapisz jej wyniki w nowym pliku w Analizy/
> Zakładka Tournament of Poker.
> Panel "Faza Grupowa".
> TABELA19, TABELA19A i TABELA19B
>
> Załączam pierwotne wymagania do tych tabel:
> 3.5 Dodać tabelę o nazwie TABELA19A. Ma zawierać kolumny:
> 3.5.1 LP = wartość uzupełniana automatycznie
> 3.5.2 WYELIMINOWANI GRACZE = Mają się tu pojawiać gracze, którzy mają zaznaczony w TABELA19 checkbox w kolumnie ELIMINATED. Nie wszyscy gracze w TABELA19 będę mieć zaznaczony checkbox. TABELA19A ma dynamicznie zmieniać ilość wierszy. Jeżeli żaden z graczy w TABELA19 nie ma zaznaczonego checkbox w kolumnie ELIMINATED to TABELA19A ma tylko nagłówki kolumn. Jak zaznaczę pierwszy checkbox to pojawia się pierwszy wiersz z pierwszym graczem. Jak zaznaczę drugi checkbox to pojawia się drugi wiersz itd.
> 3.5.3 WYGRANA = Pole liczbowe. Domyślnie wartość 0. Możliwość edycji przez użytkownika.
>
> 3.6 Dodać tabelę o nazwie TABELA19B. Ma zawierać kolumny:
> 3.6.1 LP = wartość uzupełniana automatycznie
> 3.6.2 STÓŁ = Dane z TABELA19 kolumna STÓŁ
> 3.6.3 GRACZ = Mają tu być gracze, którzy nie mają zaznaczonego checkbox w kolumnie ELIMINATED w TABELA19. Ilość wierszy w TABELA19B ma się zmieniać dynamicznie. Jak zaznaczę graczowi checkbox w kolumnie ELIMINATED w TABELA19 to wiersz ma zniknąć z TABELA19B a dodać się do TABELA19A (wymaganie numer 3.5.2)
> 3.6.4 STACK = pole liczbowe do uzupełnienia przez użytkownika. Domyślnie puste.
> 3.6.5 % = pole obliczalne. Wynik obliczeń: Wartość z kolumny STACK z TABELA19B podzielona przez wartość z kolumny ŁĄCZNY STACK z TABELA18 w panelu Faza Grupowa.
>
> Nie działa funkcjonalność związana z checkboxem ELIMINATED.
> Jak zaznaczam checkboxy to nic się nie zmienia w TABELA19A i TABELA19B.
> Dodatkowo po odświeżeniu strony znikają zaznaczone checkboxy.

## Zakres analizy
Analiza objęła plik `Second/app.js` w obszarze renderowania sekcji `group` (Faza Grupowa) oraz obsługi zdarzeń `input` i `change` dla formularza turnieju.

## Stan implementacji względem wymagań

### 1. Render TABELA19, TABELA19A i TABELA19B istnieje
Kod sekcji `group` buduje:
- `TABELA19` z checkboxem `data-role="group-eliminated"`,
- `TABELA19A` na podstawie `eliminatedRows = groupRows.filter((row) => row.eliminated)`,
- `TABELA19B` na podstawie `survivorRows = groupRows.filter((row) => !row.eliminated)`.

Wniosek: sama logika filtrowania danych dla obu tabel jest zaimplementowana poprawnie koncepcyjnie. Problem nie leży w samym HTML-u tabel, tylko w przepływie aktualizacji stanu i renderowania.

## Główne przyczyny błędu

### 2. Brak `render()` po zmianie checkboxa `ELIMINATED`
W obsłudze zdarzenia `change` jest zapis:
- dla `group-eliminated` wykonywane jest tylko:
  `tournamentState.group.eliminated[target.dataset.playerId] = target.checked;`

Natomiast `render()` wywoływane jest tylko dla ról:
- `player-payment-status`
- `assign-table`
- `semi-assign-status`
- `semi-assign-table`

To oznacza, że po kliknięciu checkboxa stan lokalny zmienia się w pamięci, ale widok sekcji `group` nie jest odświeżany. Skutek jest dokładnie taki, jak zgłosił użytkownik:
- `TABELA19A` nie dostaje nowego wiersza,
- `TABELA19B` nie usuwa gracza,
- użytkownik ma wrażenie, że „nic się nie zmienia”.

### 3. Zapis do Firebase dla checkboxa w praktyce nie dochodzi do skutku
W tym samym handlerze `change` po zmianie checkboxa wykonywany jest blok:

```js
pendingLocalWrites += 1;
try {
  await saveState({ deletedPaths });
} finally {
  pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
  commitDeferredSnapshotIfSafe();
}
```

Problem: w tym zakresie nie istnieje zmienna `deletedPaths`.
Nie została zadeklarowana ani w handlerze `change`, ani w zewnętrznym scope dostępnym dla tego miejsca.

Efekt:
- przy dowolnym `change`, w tym przy kliknięciu `group-eliminated`, powstaje `ReferenceError` jeszcze przed wywołaniem `saveState`,
- dane checkboxa nie są zapisywane do Firebase,
- po odświeżeniu strony aplikacja pobiera poprzedni stan z bazy,
- zaznaczone checkboxy znikają.

To jest bezpośrednie wyjaśnienie drugiego objawu zgłoszonego przez użytkownika.

## Zależność objawów od przyczyn

### Objaw 1: „Jak zaznaczam checkboxy to nic się nie zmienia w TABELA19A i TABELA19B”
Przyczyna bezpośrednia:
- brak `render()` po zmianie `group-eliminated`.

### Objaw 2: „Po odświeżeniu strony znikają zaznaczone checkboxy”
Przyczyna bezpośrednia:
- błąd `ReferenceError: deletedPaths is not defined` blokuje zapis do Firebase.

## Dodatkowe obserwacje

### 4. Logika danych dla TABELA19A i TABELA19B jest spójna z wymaganiami
Po poprawnym odświeżeniu widoku sekcja `group` zachowywałaby się zgodnie z wymaganiami:
- `TABELA19A` pokazuje tylko graczy z `eliminated = true`,
- `TABELA19B` pokazuje tylko graczy z `eliminated = false`,
- liczba wierszy byłaby dynamiczna, bo obie listy są liczone przy każdym renderze.

To oznacza, że nie trzeba przebudowywać samych tabel — trzeba naprawić mechanizm aktualizacji i zapisu stanu.

### 5. Ten sam błąd z `deletedPaths` występuje także w handlerze `input`
Analogiczny zapis występuje również w obsłudze `input`:

```js
await saveState({ deletedPaths });
```

To oznacza, że problem z niezdefiniowaną zmienną nie dotyczy wyłącznie checkboxów, ale potencjalnie także pól edycyjnych obsługiwanych przez `input`.

W praktyce może to blokować także zapis m.in.:
- `group-eliminated-win`,
- `group-survivor-stack`,
- innych pól wejściowych w tym module.

## Rekomendowany kierunek naprawy

### Minimalny zakres naprawy
1. W handlerze `change` po zmianie `group-eliminated` wywołać `render()`.
2. W handlerach `input` i `change` usunąć odwołanie do niezdefiniowanego `deletedPaths` albo zadeklarować lokalnie pustą tablicę, jeśli w danym miejscu nie ma nic do usuwania.
3. Po poprawce sprawdzić ręcznie scenariusz:
   - zaznaczenie checkboxa w `TABELA19`,
   - pojawienie się gracza w `TABELA19A`,
   - zniknięcie gracza z `TABELA19B`,
   - odświeżenie strony,
   - zachowanie zaznaczenia po ponownym odczycie z Firebase.

### Ryzyko poboczne
Ponieważ błąd dotyczy wspólnego mechanizmu zapisu zdarzeń formularza, możliwe są także inne niespójności zapisu w sekcjach turniejowych, nie tylko w Fazie Grupowej.

## Podsumowanie
Problem nie wynika z błędnej definicji TABELA19A/TABELA19B, tylko z dwóch błędów wykonawczych w `Second/app.js`:

1. **Brak prze-renderowania sekcji po zmianie checkboxa `ELIMINATED`** — przez to użytkownik nie widzi dynamicznej aktualizacji tabel.
2. **Odwołanie do niezdefiniowanej zmiennej `deletedPaths` w handlerach `change` i `input`** — przez to zmiany nie zapisują się do Firebase i znikają po odświeżeniu.

Oba zgłoszone objawy są spójne z aktualnym stanem kodu.
