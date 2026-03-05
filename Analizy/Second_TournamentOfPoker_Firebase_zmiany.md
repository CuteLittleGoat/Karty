# Analiza zmian Firebase dla modułu Second — Tournament of Poker

## Prompt użytkownika
"Zmodyfikuj moduł Second.
Modyfikacja zakładki \"Tournament of Poker\".
Jeżeli którakolwiek z funkcjonalności wymaga dodania nowej kolekcji w Firebase lub dodania jakiegoś pola do dokumentu to napisz mi to w nowym pliku w Analizy."

## Wymagane zmiany w Firebase
Aby zapisywać dane nowej sekcji turniejowej w module **Second** niezależnie od modułu Main, dodano:

- nową kolekcję: `second_tournament`
- dokument: `state`

## Pola dokumentu `second_tournament/state`
- `organizer` (string)
- `buyIn` (string/numeryczny input)
- `rebuyAddOn` (string/numeryczny input)
- `rake` (string/numeryczny input)
- `stack` (string/numeryczny input)
- `rebuyStack` (string/numeryczny input)
- `players` (array obiektów: `id`, `name`, `pin`, `permissions`, `status`)
- `tables` (array obiektów: `id`, `name`)
- `assignments` (mapa po `player.id`, przechowuje m.in. `tableId`, `status`)
- `tableEntries` (obiekt pod przyszłe wpisowe)
- `semiTables` (array)
- `semiAssignments` (object)
- `finalPlayers` (array obiektów: `id`, `name`, `stack`)
- `updatedAt` (timestamp serwerowy)

## Uwagi
- Wszystkie powyższe struktury są odseparowane od istniejących kolekcji Main.
- W relacjach gracz/stół aplikacja operuje na `id` (nie nazwach), aby uniknąć konfliktów duplikatów nazw.
