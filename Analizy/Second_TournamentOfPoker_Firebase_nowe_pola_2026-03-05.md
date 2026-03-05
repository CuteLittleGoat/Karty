# Tournament of Poker (Second) — wymagane rozszerzenia pól Firebase

## Prompt użytkownika
"Przeczytaj analizę: Analizy/Second_TournamentOfPoker_Firebase_zmiany.md
Następnie przeczytaj: Analizy/Wazne_firestore-schema.txt
Następnie przeczytaj kod modułu \"Second\".
Następnie przeczytaj poniższe wymagania:
Zmodyfikuj moduł Second.
Modyfikacja zakładki \"Tournament of Poker\".
Jeżeli którakolwiek z funkcjonalności wymaga dodania nowej kolekcji w Firebase lub dodania jakiegoś pola do dokumentu to napisz mi to w nowym pliku w Analizy."

## Wniosek
Nie jest wymagana nowa kolekcja Firebase.

Kolekcja `second_tournament` i dokument `state` pozostają poprawnym miejscem zapisu, ale do obsługi pełnego zakresu UI trzeba rozszerzyć dokument o dodatkowe pola.

## Nowe pola (w `second_tournament/state`)
- `payments.table10.{buyIn, rebuyAddOn, sum, rebuyCount}`
- `payments.table11.{percent, rake, buyIn, rebuyAddOn, pot}`
- `pool.splits[]` (wiersze Tabela15)
- `pool.mods[]` (wiersze Tabela16)
- `group.playerStacks` (mapa po `playerId`)
- `group.eliminated` (mapa po `playerId`)
- `semi.tables[]` (rezerwa pod losowanie półfinału)
- `semi.assignments` (mapa po `playerId`)
- `semi.customTables[]` (dynamiczne „Stół Półfinałowy numer X”)
- `payouts.{showInitial, showFinal}`

## Dodatkowe doprecyzowanie relacji po ID
- Przypisania gracz-stół pozostają po ID:
  - `assignments[playerId].tableId`
  - `semi.assignments[playerId].tableId`
- `tableEntries` pozostaje mapą po `tableId` i `playerId`.
