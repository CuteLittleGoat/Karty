# Analiza 2 — panel lat/miesięcy i ograniczenie ilości informacji w „Gry do potwierdzenia” (admin)

## Prompt użytkownika
> Modyfikacja zakładki "Gry do potwierdzenia" w widoku admina.
> Chciałbym z lewej strony dodać panel podobny jak w zakładce "Statystyki" z latami.
> W tym panelu byłyby przyciski do lat i do miesięcy. Naciśnięcie przycisku filtrowałoby widok. Sortowanie gier z graczami od najnowszych na górze.
> Zaproponuj też inne rozwiązanie, które skutkowałoby ograniczeniem ilości informacji na ekranie admina - w obecnym modelu na tym ekranie zawsze będą wszyscy gracze ze wszystkich gier. Po pewnym czasie będzie to niewygodne do używania.

## Stan obecny
- Zakładka „Gry do potwierdzenia” renderuje listę aktywnych gier i od razu pokazuje wszystkich graczy każdej gry.
- Przy dużej historii danych ekran rośnie i staje się trudny do skanowania.
- Jest już istniejąca logika sortowania po dacie, którą można rozszerzyć o filtr roczno-miesięczny.

## Proponowane wdrożenie (wersja zgodna z wymaganiem)
1. **Lewy panel filtrów czasu**
   - sekcja lat (np. 2026, 2025, 2024),
   - po wyborze roku: sekcja miesięcy (I–XII lub nazwy miesięcy),
   - przycisk „Wszystkie miesiące” w wybranym roku,
   - przycisk resetu „Wszystkie lata”.
2. **Filtrowanie danych**
   - źródło daty: `gameDate` (YYYY-MM-DD),
   - filtr roku: `YYYY`,
   - filtr miesiąca: `MM`,
   - wynik filtrowania stosowany przed renderem listy gier.
3. **Sortowanie**
   - domyślnie malejąco po dacie (`najnowsze na górze`),
   - przy remisach po nazwie/ID dla stabilności widoku.
4. **UX i wydajność**
   - zapamiętywanie ostatnio wybranego filtra (session/local storage),
   - licznik przy filtrach (np. `2026 (14)`, `03 (5)`),
   - puste stany z jasnym komunikatem.

## Alternatywa ograniczająca ilość informacji (rekomendowana dodatkowo)
### Wariant A: „Widok zwinięty + lazy expand”
- Domyślnie pokazuj tylko nagłówek gry (nazwa, data, licznik potwierdzeń).
- Lista graczy ładowana/pokazywana dopiero po kliknięciu „Rozwiń”.
- Korzyść: radykalnie mniej elementów na ekranie, krótszy czas skanowania.

### Wariant B: „Tylko gry wymagające akcji”
- Przełącznik: `Pokaż tylko gry z niepotwierdzonymi`.
- Domyślnie aktywny, opcjonalnie można wyświetlić wszystkie.
- Korzyść: administrator widzi to, co wymaga reakcji.

### Wariant C: „Paginacja / limit N gier”
- Np. 20 gier na stronę + „Dalej/Wstecz”.
- Korzyść: stały rozmiar widoku niezależnie od historii.

## Najlepsza kombinacja praktyczna
- **Panel rok/miesiąc** (wymaganie główne) +
- **Wariant A (zwinięty domyślnie)** +
- **Wariant B (tylko wymagające akcji)**.

Taki zestaw daje największą redukcję szumu informacyjnego bez utraty dostępu do pełnych danych.

## Ryzyka
- Jeśli `gameDate` bywa puste/niepoprawne, potrzebna jest kategoria „Bez daty”.
- Trzeba dopilnować spójności filtrów między odświeżeniami snapshotów Firestore.

## Szacowanie
- Panel rok/miesiąc + sortowanie: **średnia** pracochłonność.
- Widok zwijany + „tylko wymagające akcji”: **niska/średnia**.
