# Second — dokumentacja techniczna

## Tournament of Poker (moduł Second)

### 1. Źródła i montowanie UI
- Główna sekcja turniejowa admina renderowana jest do `#adminTournamentRoot` w `Second/index.html`.
- Przełączanie sekcji realizują przyciski z `data-tournament-target`.
- Inicjalizacja logiki turniejowej: funkcja `setupAdminTournament(rootCard)` w `Second/app.js`.

### 2. Firebase (odseparowane od Main)
- Kolekcja: `second_tournament`
- Dokument: `state`
- Stałe: `SECOND_TOURNAMENT_COLLECTION`, `SECOND_TOURNAMENT_DOCUMENT`.
- Zapis przez `docRef.set(..., { merge: true })`.
- Odczyt live przez `docRef.onSnapshot(...)`.

### 3. Model danych dokumentu `second_tournament/state`
- `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`
- `players[]` (obiekty: `id`, `name`, `pin`, `permissions`, `status`)
- `tables[]` (obiekty: `id`, `name`)
- `assignments` (mapa po `player.id`, trzyma m.in. `tableId`, `status`)
- `tableEntries`, `semiTables`, `semiAssignments`, `finalPlayers[]`
- `updatedAt`

### 4. Identyfikacja po ID
- Relacje gracz ↔ stół trzymane są po ID (`player.id`, `table.id`).
- Nazwy są wyłącznie warstwą prezentacji.
- To eliminuje konflikty przy duplikatach nazw graczy i stołów.

### 5. Sekcje Tournament of Poker
- players → Lista graczy
- draw → Losowanie stołów
- payments → Wpłaty
- pool → Podział puli
- group → Faza grupowa
- semi → Półfinał
- final → Finał
- payouts → Wypłaty

### 6. Klawiatura numeryczna (mobile)
- Pola liczbowe mają `type="tel"`, `inputmode="numeric"`, `pattern="[0-9]*"`.
- Dodatkowo wartości są czyszczone funkcją `digitsOnly`.

### 7. Final — rysowanie stołu SVG
- Sekcja „Finał” renderuje owal stołu jako `<svg>` z `<ellipse>`.
- Gracze wyliczani są po kącie i rozmieszczani symetrycznie wokół stołu.
- Label gracza zawiera nazwę i stack.

### 8. Integracja z setupAdminView
- `setupAdminTournament(rootCard)` jest wywoływane podczas inicjalizacji panelu admina.
- Sekcja działa równolegle z istniejącymi modułami: Aktualności, Czat, Regulamin, Notatki, Gracze.
