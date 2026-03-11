# Analiza modalu „Rebuy gracza” — Main vs Second

## Prompt użytkownika
"Przeprowadź analizę modalu \"Rebuy gracza\" z modułu Main i Second. Sprawdź czy są jakieś różnice w działaniu."

## Zakres analizy
- Moduł `Main` (`Main/app.js`) — wszystkie wystąpienia modalu `Rebuy gracza`.
- Moduł `Second` (`Second/app.js`) — modal `Rebuy gracza` dla TABELA12.

## Wniosek ogólny
Tak — są różnice w działaniu. Najważniejsza: **w Main występują dwa różne warianty logiki numeracji/usuwania rebuy (globalny i per gracz), a w Second modal działa globalnie (spójnie) i dodatkowo synchronizuje powiązane dane puli**.

## Szczegóły porównania

### 1) Liczba i kontekst modali
- **Main**: modal `Rebuy gracza` występuje w kilku kontekstach:
  - kalkulator admina (`adminCalculatorRebuyModal`),
  - szczegóły gier użytkowników,
  - szczegóły gier admina.
- **Second**: modal `Rebuy gracza` jest obsługiwany w kontekście turniejowym TABELA12 (`table12RebuyModal`).

### 2) Numeracja Rebuy (Rebuy1, Rebuy2, ...)
- **Main — kalkulator admina**:
  - numeracja jest **globalna w obrębie trybu** (Tournament1/Tournament2/Cash),
  - nowe pole dostaje `max + 1` z całego trybu,
  - po usunięciu wykonywana jest kompaktacja numerów globalnie.
- **Main — szczegóły gry (user/admin)**:
  - numeracja jest **per gracz/per wiersz**,
  - kolejne pole bierze `nextIndex` wyliczone tylko z danego wiersza,
  - usuwanie usuwa ostatni element bez globalnej kompaktacji między innymi graczami.
- **Second**:
  - numeracja jest **globalna** (na podstawie wszystkich wpisów TABELA12),
  - po usunięciu jest globalna kompaktacja indeksów.

**Różnica funkcjonalna:** Main nie jest całkowicie spójny we wszystkich miejscach (zależnie od ekranu), a Second zachowuje jedną logikę globalną.

### 3) Zachowanie po usunięciu Rebuy
- **Main (kalkulator admina)**: globalna kompaktacja indeksów.
- **Main (szczegóły gry)**: tylko usunięcie ostatniej pozycji danego gracza; brak globalnego przesuwania indeksów.
- **Second**: globalna kompaktacja indeksów + dodatkowe przemapowanie `pool.rebuyValues` po usunięciu kolumny.

### 4) Wpływ na dane zależne
- **Main**:
  - aktualizuje `rebuys`, `rebuyIndexes`, `rebuyNextIndex`, sumę `rebuy` w rekordzie gracza,
  - brak specjalnego remapowania dodatkowych struktur typu `pool.rebuyValues` przy usuwaniu.
- **Second**:
  - oprócz `values/indexes` robi remap powiązań w `pool.rebuyValues` po usunięciu indeksu,
  - dzięki temu zachowuje spójność kolumn rebuy w danych puli.

### 5) Sposób zapisu zmian (UX/performance)
- **Main (szczegóły gry)**: wpisywanie wartości idzie przez `scheduleDebouncedUpdate` (zapis odroczony/debounced).
- **Second**: wpisywanie uruchamia zapis `saveState()` asynchronicznie dla zmian (z mechanizmem `pendingLocalWrites` i odświeżeniem renderu).

### 6) Uprawnienia edycji
- **Main (szczegóły gier użytkowników)**: modal uwzględnia `hasWriteAccessToGame` (pola/przyciski mogą być zablokowane).
- **Second**: w analizowanym modalu brak analogicznego warunkowego blokowania przycisków/pól na podstawie takiego checku.

## Podsumowanie różnic (skrót)
1. **Tak, są różnice.**
2. **Main ma niespójną logikę między ekranami** (globalna w kalkulatorze vs per-gracz w szczegółach).
3. **Second trzyma jedną globalną logikę** i dodatkowo pilnuje spójności danych puli po usuwaniu rebuy.
4. **Main ma dodatkową warstwę uprawnień zapisu** w części „szczegóły gier użytkowników”.
