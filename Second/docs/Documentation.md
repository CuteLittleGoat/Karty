# Second — dokumentacja techniczna

## Tournament of Poker (admin)

### Główna logika
- Funkcja: `setupAdminTournament(rootCard)` w `Second/app.js`.
- Kontenery:
  - `#adminTournamentTab` — panel sekcji turniejowych,
  - `#adminTournamentRoot` — dynamiczny mount renderu aktywnej sekcji.
- Dane zapisywane są w Firestore:
  - kolekcja `second_tournament`,
  - dokument `state`.

### Odczyt i zapis Firebase
- Odczyt ciągły: `docRef.onSnapshot(...)`.
- Ręczne odświeżenie zakładki: rejestracja `registerAdminRefreshHandler("adminTournamentTab", ...)` i pobranie `docRef.get({ source: "server" })`.
- Zapis: `docRef.set({ ...tournamentState, updatedAt: serverTimestamp }, { merge: true })`.
- Przy błędzie zapisu widok nie blokuje pracy użytkownika; pokazuje komunikat o problemie synchronizacji z Firebase i pozostaje interaktywny.

### Struktura stanu
- Metadane: `organizer`, `buyIn`, `rebuyAddOn`, `rake`, `stack`, `rebuyStack`.
- Gracze: `players[]` z polami `id`, `name`, `pin`, `permissions`, `status`.
- Pozostałe sekcje: `tables`, `assignments`, `tableEntries`, `payments`, `pool`, `group`, `semi`, `finalPlayers`, `payouts`.

### Losowanie graczy — aktualny render
- Nagłówek metadanych turnieju: grid `.t-section-grid`.
- Pole `RAKE`:
  - wejście tylko cyfrowe,
  - podgląd z automatycznym `%` renderowany jako `<small>` (np. `15%`).
- Nad tabelą renderowany licznik: `Liczba dodanych graczy: X`.
- Tabela `players-table` ma kolumny:
  1. `Status` (checkbox w stylu `.status-radio`),
  2. `Nazwa` (input tekstowy),
  3. `PIN` (input 5-cyfrowy + przycisk `Losuj`),
  4. `Uprawnienia` (badge + przycisk `Edytuj`),
  5. `Akcje` (przycisk `Usuń`).

### Obsługa PIN
- PIN jest filtrowany do cyfr i skracany do 5 znaków.
- Losowanie PIN: helper `generateUniquePin(playerId)` losuje 5-cyfrową wartość i unika kolizji z innymi graczami.

### Obsługa uprawnień
- `normalizeTournamentPermissions(value)` wspiera dane jako string CSV lub tablicę.
- Widok pokazuje uprawnienia jako badge.
- Przycisk `Edytuj` otwiera `prompt` i zapisuje listę uprawnień oddzieloną przecinkami do pola `permissions`.

### Usuwanie gracza
- `delete-player` usuwa rekord gracza z `players` oraz czyści powiązane dane (`assignments`, `tableEntries`, `group`, `semi`).

### Stabilność UI przy błędach Firebase
- Dla błędów odczytu `onSnapshot` renderuje się informacja ostrzegawcza, a nie pusty ekran sekcji.
- Dla błędów zapisu render nie jest blokowany; użytkownik widzi aktualny stan lokalny i komunikat o synchronizacji.
