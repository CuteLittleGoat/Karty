# Second — dokumentacja techniczna

## Tournament of Poker

### Struktura UI
- Renderowanie admina odbywa się w `setupAdminTournament(rootCard)` w `Second/app.js`.
- Docelowy kontener: `#adminTournamentRoot`.
- Sekcje przełączane przez przyciski `data-tournament-target`.

### Firebase
- Kolekcja: `second_tournament`.
- Dokument: `state`.
- Odczyt: `onSnapshot`.
- Zapis: `docRef.set(..., { merge: true })`.

### Model danych (aktualny)
- Metadane turnieju: `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`.
- Gracze: `players[]` (`id`, `name`, `pin`, `permissions`, `status`).
- Stoły główne: `tables[]` (`id`, `name`).
- Przydział główny: `assignments[playerId] = { status, tableId }`.
- Wpisowe stołów: `tableEntries[tableId][playerId]`.
- Wpłaty:
  - `payments.table10` (`buyIn`, `rebuyAddOn`, `sum`, `rebuyCount`),
  - `payments.table11` (`percent`, `rake`, `buyIn`, `rebuyAddOn`, `pot`).
- Podział puli:
  - `pool.splits[]` (Tabela15),
  - `pool.mods[]` (Tabela16).
- Faza grupowa: `group.playerStacks`, `group.eliminated`.
- Półfinał: `semi.assignments`, `semi.customTables[]`, `semi.tables[]`.
- Finał: `finalPlayers[]` (`id`, `name`, `stack`, `eliminated`).
- Wypłaty: `payouts.showInitial`, `payouts.showFinal`.

### Zasada ID zamiast nazw
- Relacje gracz/stół trzymane po ID:
  - `assignments[playerId].tableId`,
  - `semi.assignments[playerId].tableId`,
  - `tableEntries[tableId][playerId]`.
- Nazwy służą tylko do renderu UI.

### Klawiatura mobilna i pola liczbowe
- Wszystkie nowe pola liczbowe mają `type="tel"`, `inputmode="numeric"`, `pattern="[0-9]*"`.
- Dodatkowo wejście jest filtrowane przez `digitsOnly`.

### Widoki sekcji
- Players: panel admina analogiczny funkcjonalnie do zarządzania listą graczy.
- Draw: przypisania + per-stół tabela wpisowego.
- Payments/Pool/Group/Semi/Payouts: szkielety tabel zgodnie z wymaganiami + zapis stanu.
- Final: tabela + dynamiczny SVG owalu stołu, etykiety rozmieszczane radialnie.
