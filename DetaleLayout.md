# DetaleLayout.md — aktualny stan UI

## Fonty
- `Cinzel`
- `Cormorant Garamond`
- `Inter`
- `Rajdhani`

## Kolory i styl
- Motyw: ciemny (noir) z akcentem złotym.
- Akcje główne: `primary`.
- Akcje pomocnicze: `secondary`.
- Akcje destrukcyjne: `danger` (czerwony).

## Układ
- Główny layout kartowy z sekcją admina i sekcją użytkownika.
- W zakładkach z dużymi tabelami działa poziomy scroll (`.admin-table-scroll`).

## Modale szczegółów gier
- Modale:
  - `#gameDetailsModal`
  - `#userGameDetailsModal`
  - `#playerUserGameDetailsModal`
  - `#confirmationsDetailsModal` (tylko odczyt)
- Każdy modal ma pasek meta ze stanem gry: Nazwa, Rodzaj gry, Data, Pula.
- Tabele szczegółów posiadają kolumnę `LP` jako pierwszą kolumnę.

## Gry do potwierdzenia (strefa gracza)
- W akcjach wiersza są przyciski: `Potwierdź`, `Anuluj`, `Szczegóły`, `Notatki do gry`.
- Przycisk `Szczegóły` otwiera modal tylko do odczytu.

## Statystyki
- Waga `Waga7` nie występuje w tabelach statystyk.
- Sekwencja kolumn: `Ilość Spotkań`, `Waga2`, `% udział`, `Punkty`.

## Strefa gracza
- Usunięto czerwony komunikat ostrzegawczy wyświetlany wcześniej nad zakładkami użytkownika.
