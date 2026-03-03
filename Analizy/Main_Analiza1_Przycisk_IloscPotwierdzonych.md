# Analiza 1 — zamiana podświetlania w „Szczegóły gry” na przycisk w kolumnie „IlośćPotwierdzonych”

## Prompt użytkownika
> Obecnie w zakładkach "Gry admina" i "Gry użytkowników" istnieje funkcjonalność kolorowania graczy, którzy potwierdzili swoją obecność.
> Są oni wyróżnieni na złoto w oknie "Szczegóły gry". Chciałbym usunąć ten mechanizm. Zamiast tego chciałbym, żeby dodać przycisk w kolumnie "IlośćPotwierdzonych". W dalszym ciągu wyświetlana tam wartość by wskazywała ile osób potwierdziło obecność a ile jest zapisanych (np. 0/2, 3/3). Mechanizm potwierdzania pozostaje bez zmian.
> Kliknięcie przycisku powodowałoby pojawienie się dodatkowego okna.
> W tym oknie byłaby lista graczy zapisanych do gry oraz informacja o statusie (Potwierdzony lub Niepotwierdzony). Potwierdzeni byliby na złoto.
> Okno by było tylko do odczytu.

## Stan obecny
- Licznik `IlośćPotwierdzonych` jest już liczony jako `potwierdzeni/zapisani` na podstawie wierszy gry i subkolekcji `confirmations`.
- Wiersze graczy z potwierdzeniem są aktualnie podświetlane klasą `.confirmed-row` w istniejących modalach „Szczegóły gry”.
- W module jest już wzorzec modala tylko-do-odczytu dla potwierdzeń (sekcja „Gry do potwierdzenia”), co można wykorzystać jako bazę.

## Zakres wdrożenia
1. **Usunięcie podświetlania z obecnych modali „Szczegóły gry”**
   - usunąć dodawanie/aktualizację klasy `.confirmed-row` w rendererach wierszy modali szczegółów dla:
     - Gry admina,
     - Gry użytkowników (admin),
     - Gry użytkowników (gracz).
2. **Zmiana kolumny `IlośćPotwierdzonych`**
   - zamiast samego tekstu dodać układ: etykieta licznika + przycisk (np. „Statusy”).
   - licznik pozostaje dynamiczny i bez zmian semantycznych.
3. **Nowy modal read-only „Status potwierdzeń”**
   - wejście z przycisku w kolumnie `IlośćPotwierdzonych`,
   - lista graczy zapisanych do gry,
   - status per gracz: „Potwierdzony” / „Niepotwierdzony”,
   - potwierdzeni podświetleni na złoto,
   - brak akcji zapisu/edycji.
4. **Dane i spójność**
   - źródło danych: `rows` + `confirmations` tej samej gry,
   - deduplikacja po nazwie gracza jak obecnie,
   - odświeżanie po zmianach potwierdzeń (bez reloadu strony).

## Ryzyka i decyzje projektowe
- **Duplikaty nazw graczy**: obecny system opiera się na `playerName`, więc gracze o identycznych nazwach będą traktowani łącznie.
- **Niezgodność case/spacje**: warto utrzymać obecne `trim()` i porównanie znormalizowane.
- **Spójność UI**: nowy modal powinien wizualnie nawiązywać do istniejących modali, aby ograniczyć koszt utrzymania.

## Szacowana pracochłonność
- Implementacja JS + HTML + style: **średnia**.
- Migracja logiki i testy manualne: **niskie/średnie**.

## Rekomendacja
Wdrożenie jest bezpieczne i zgodne z aktualną architekturą. Najmniej ryzykowne będzie wykorzystanie istniejących helperów liczenia potwierdzeń i wzorca modala z sekcji „Gry do potwierdzenia”, zamiast budowy nowego mechanizmu od zera.
