# Analiza zmian Firebase dla modułu Second — Tournament of Poker

## Prompt użytkownika
"Zmodyfikuj moduł Second.
Modyfikacja zakładki \"Tournament of Poker\".
Jeżeli którakolwiek z funkcjonalności wymaga dodania nowej kolekcji w Firebase lub dodania jakiegoś pola do dokumentu to napisz mi to w nowym pliku w Analizy."

## Odpowiedź na pytanie
**Czy struktura Firebase jest odpowiednia, żeby zapewnić te funkcjonalności, czy muszę utworzyć jakąś nową kolekcję?**

- **Nowa kolekcja nie jest wymagana.**
- Istniejąca kolekcja `second_tournament` z dokumentem `state` jest odpowiednia dla tych funkcjonalności.
- **Wymagane jest rozszerzenie pól dokumentu `state`** (szczegóły w pliku: `Analizy/Second_TournamentOfPoker_Firebase_nowe_pola_2026-03-05.md`).

## Aktualny rdzeń danych
- `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`
- `players` (array obiektów: `id`, `name`, `pin`, `permissions`, `status`)
- `tables` (array obiektów: `id`, `name`)
- `assignments` (mapa po `player.id`, m.in. `tableId`, `status`)
- `tableEntries` (mapa wpisowego po `tableId` i `playerId`)
- `semi`, `group`, `payments`, `pool`, `finalPlayers`, `payouts`
- `updatedAt`

## Uwagi
- Dane modułu Second pozostają odseparowane od kolekcji modułu Main.
- Relacje gracz/stół pozostają po `id`, co eliminuje ryzyko kolizji nazw.
