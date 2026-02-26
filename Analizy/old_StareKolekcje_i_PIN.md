# Archiwum techniczne: stare kolekcje Firebase + model PIN (stan przed migracją Login/Hasło)

## Prompt użytkownika
"Przeczytaj wszystkie pliki z Analizy. Stwórz nowy plik o nazwie \"Przyciski logowania\".
Napisz mi nową analizę opisującą krok-po-kroku w jaki sposób będzie przebiegać zakładanie konta użytkownika i admina po przepięciu kodu na nowe kolekcje oraz zmianie Rules (bo obecnie wszystko działa na PIN). Sprawdź czy będą potrzebne w Main i Second nowe przyciski tylu \"zaloguj\". Sprawdź dokładnie wszystkie miejsca w których używa się PIN i czy da się to zastąpić zmianą na model login+hasło.

Przygotuj też plik \"old_StareKolekcje_i_PIN\" w Analizy. Zapisz w nim bardzo dokładne techniczne opisanie które pola w Main obecnie korzystają z Firebase i w jaki sposób. Jak nazywają się obecnie dokumenty i pola oraz które miejsca w aplikacji zapisują dane w którym miejscu w Firebase. Dodatkowo zawrzyj też PEŁEN opis funkcjonalności PIN. Gdzie się ustawia, jak działa, do czego służy. Ten plik ma być archiwum wiedzy jak aplikacja działała przed migracją i zmianą podejścia z PIN na Login+Hasło."

---

## 1) Konfiguracja i nazwy kolekcji używane przez Main (stan „old”)
W `Main/app.js` kolekcje są ustawione stałymi i/lub pobierane z `window.firebaseConfig`:
- `PLAYER_ACCESS_COLLECTION = "app_settings"`
- `PLAYER_ACCESS_DOCUMENT = "player_access"`
- `RULES_DOCUMENT = "rules"`
- `ADMIN_MESSAGES_COLLECTION = "admin_messages"`
- `ADMIN_MESSAGES_DOCUMENT = "admin_messages"`
- `CHAT_COLLECTION = "chat_messages"`
- `TABLES_COLLECTION = "Tables"`
- `GAMES_COLLECTION = "Tables"`
- `USER_GAMES_COLLECTION = "UserGames"`
- `GAME_DETAILS_COLLECTION = "rows"`
- `GAME_CONFIRMATIONS_COLLECTION = "confirmations"`
- `ADMIN_GAMES_STATS_COLLECTION = "admin_games_stats"`
- `CALCULATOR_COLLECTION = "calculators"`

Dodatkowo `config/firebase-config.js` pozwala nadpisać:
- `tablesCollection`, `gamesCollection`, `gameDetailsCollection`, `userGamesCollection`.

---

## 2) Pełna lista starych kolekcji / dokumentów / pól (Firebase)
Poniżej archiwalna mapa oparta na kodzie Main i zrzutach struktury Firestore (`old_firestore-structure.txt`, `old_RulesPIN`).

## A) `app_settings`
### Dokument: `player_access`
Pole główne:
- `players: Array<PlayerRecord>`
- `updatedAt: timestamp`

Model `PlayerRecord` (z perspektywy Main):
- `id: string`
- `name: string`
- `pin: string` (5 cyfr)
- `appEnabled: boolean`
- `permissions: string[]` (np. `playerZoneTab`, `nextGameTab`, `chatTab`, `confirmationsTab`, `userGamesTab`, `statsTab`)
- `statsYearsAccess: number[]`

### Dokument: `rules`
- `text: string`
- `source: string`
- `updatedAt: timestamp`
- (czasami `createdAt` w zależności od sposobu zapisu/historycznych danych)

### Dokument opcjonalny: `next_game`
- historycznie występował m.in. `pin: string` (zrzuty „old”).

## B) `admin_messages`
### Dokument: `admin_messages`
- `message: string`
- `createdAt: timestamp`
- `source: string`

## C) `chat_messages`
Dokumenty per wiadomość (`auto-id`):
- `text: string`
- `authorName: string`
- `authorId: string`
- `createdAt: timestamp`
- `expireAt: timestamp`
- `source: string`

## D) `Tables` (gry admina)
Dokument gry (`auto-id`):
- `gameType: string`
- `gameDate: string`
- `name: string`
- `isClosed: boolean`
- `preGameNotes: string`
- `postGameNotes: string`
- `createdAt: timestamp`
- czasem legacy `notes` (usuwane przez cleanup)

Subkolekcja `rows` (szczegóły graczy w grze):
- `playerName: string`
- `entryFee: string`
- `rebuy: string`
- `payout: string`
- `points: string`
- `championship: boolean`
- `createdAt: timestamp`

Subkolekcja `confirmations`:
- `playerId: string`
- `playerName: string`
- `confirmed: boolean`
- `updatedBy: string`
- `updatedAt: timestamp`

## E) `UserGames` (gry użytkowników)
Dokument gry (`auto-id`) jak w `Tables` + pola właściciela:
- `createdByPlayerId: string`
- `createdByPlayerName: string`

Subkolekcje:
- `rows` (jak w `Tables`)
- `confirmations` (jak w `Tables`)

## F) `admin_games_stats`
Dokument roczny (`docId = rok`, np. `2026`):
- `rows: array` (manualne korekty/wagi per gracz)
- `visibleColumns: array` (jakie kolumny widzi użytkownik)
- `updatedAt: timestamp`

## G) `calculators`
Dokumenty trybów:
- `tournament`
- `cash`

Pola zapisywane w tych dokumentach zależą od trybu:

`tournament`:
- `table1Row` (map)
- `table2Rows` (array)
- `table3Row` (map)
- `table5SplitPercents` (array)
- `table5Mods` (array)
- `eliminatedOrder` (array)
- `updatedAt` (timestamp)

`cash`:
- `table8Row` (map)
- `table9Rows` (array)
- `updatedAt` (timestamp)

W strukturach historycznych pojawiają się też podkolekcje:
- `definitions`, `placeholders`, `sessions/*/(variables|calculationFlags|tables|snapshots)`.
Main aktualnie zapisuje głównie bieżący stan dokumentów trybów.

---

## 3) Dokładnie: które miejsca Main zapisują dane do Firebase i gdzie

## 3.1 Ustawienia graczy (`app_settings/player_access`)
- Zapis listy graczy i uprawnień (`players`, `updatedAt`) w `savePlayers()`.
- Wywołania zapisu przy:
  - edycji nazwy,
  - edycji PIN,
  - zmianie `appEnabled`,
  - zmianie uprawnień,
  - zmianie `statsYearsAccess`,
  - dodaniu/usunięciu gracza.

## 3.2 Regulamin (`app_settings/rules`)
- Admin zapisuje treść regulaminu (`text`, `source`, `updatedAt`) przyciskiem „Zapisz regulamin”.

## 3.3 Aktualności (`admin_messages/admin_messages`)
- Admin zapisuje komunikat globalny (`message`, `createdAt`, `source`).

## 3.4 Czat (`chat_messages`)
- Gracz dodaje wiadomość przez `add()` (dokument auto-id).
- Admin może usuwać pojedynczą wiadomość.
- Admin może usuwać hurtowo wiadomości starsze niż 30 dni (na podstawie `expireAt`).

## 3.5 Gry admina (`Tables` + `rows` + `confirmations`)
- Dodanie gry (`add(newGamePayload)`).
- Edycja metadanych gry (`update` pól `gameType`, `gameDate`, `name`, `isClosed`, notatki).
- Dodawanie/usuwanie/edycja wierszy graczy w subkolekcji `rows`.
- Zapisy potwierdzeń w subkolekcji `confirmations`.
- Usuwanie legacy pola `notes` (cleanup `FieldValue.delete()`).

## 3.6 Gry użytkowników (`UserGames` + `rows` + `confirmations`)
- Analogicznie jak `Tables`, ale z polami autora gry (`createdByPlayerId`, `createdByPlayerName`).
- Użytkownik może zapisywać tylko własne gry wg logiki aplikacji (front-end), ale w starych Rules i tak był globalny write.

## 3.7 Statystyki (`admin_games_stats/{year}`)
- Zapisy manualnych danych wag i konfiguracji widocznych kolumn.

## 3.8 Kalkulator (`calculators/{mode}`)
- Debounced `set(..., { merge: true })` stanu kalkulatora (`tournament` / `cash`) z `updatedAt`.

---

## 4) Odczyty (subskrypcje) i zależności Main od Firebase
Main bardzo szeroko używa `onSnapshot()`:
- `app_settings/player_access` -> lista graczy, mapa PIN, dostęp do zakładek,
- `app_settings/rules` -> regulamin dla user/admin,
- `admin_messages/admin_messages` -> aktualności,
- `chat_messages` -> czat user/admin,
- `Tables` / `UserGames` + ich `rows` -> gry, szczegóły, podsumowania,
- `admin_games_stats` -> statystyki i ranking,
- `calculators/{mode}` -> stan kalkulatora.

To oznacza, że model „old” opiera się na real-time Firestore + lokalnej autoryzacji PIN w UI.

---

## 5) PEŁNY opis funkcjonalności PIN (archiwum)

## 5.1 Gdzie PIN się ustawia
PIN ustawia admin w zakładce **Gracze**:
- pole `PIN` per gracz,
- walidacja dokładnie 5 cyfr,
- walidacja unikalności PIN,
- przycisk „Losuj” tworzy losowy, unikalny PIN.

PIN jest zapisywany do `app_settings/player_access.players[].pin`.

## 5.2 Jak działa PIN technicznie
1. `sanitizePin()` usuwa znaki nienumeryczne i ucina do 5 znaków.
2. `isPinValid()` sprawdza regex `^\d{5}$`.
3. Po pobraniu `player_access` budowana jest mapa `playerByPin`.
4. Każda bramka PIN (sekcja) sprawdza:
   - czy PIN istnieje w `playerByPin`,
   - czy gracz ma odpowiednie uprawnienie zakładki.
5. Po sukcesie zapisywany jest stan w `sessionStorage`:
   - flaga sekcji `*PinVerified = "1"`,
   - (dla części sekcji) `*PlayerId` zweryfikowanego gracza.
6. Po odświeżeniu strony sesja sekcji może pozostać aktywna (do zamknięcia karty/wygaśnięcia sesji), ale jest ponownie walidowana względem uprawnień.

## 5.3 Do czego służy PIN
PIN w modelu „old” pełni rolę:
- lekkiej autoryzacji użytkownika bez konta email/hasło,
- identyfikacji gracza do operacji sekcyjnych (czat, potwierdzenia, gry użytkowników, statystyki),
- ograniczenia dostępu do konkretnych zakładek poprzez `permissions`.

## 5.4 W jakich sekcjach PIN występuje
- Strefa Gracza (główna bramka `playerZoneTab`),
- Najbliższa gra,
- Czat,
- Gry do potwierdzenia,
- Gry użytkowników,
- Statystyki.

Każda sekcja ma własny input, przycisk i status komunikatu.

## 5.5 Ograniczenia modelu PIN (powód migracji)
- PIN nie jest tożsamy z kontem Auth (brak silnej autentykacji backendowej).
- Ochrona jest głównie front-endowa; przy starych Rules (`allow read, write: if true`) praktycznie brak egzekwowania bezpieczeństwa po stronie Firestore.
- Trudniej audytować sesje i działania użytkowników niż przy `uid` z Firebase Auth.

---

## 6) Rules w stanie „old” (archiwalnie)
W pliku `Analizy/old_RulesPIN` wszystkie kluczowe kolekcje mają globalne:
- `allow read, write: if true;`

To dotyczy m.in.:
- `admin_messages`, `app_settings`, `Tables`, `UserGames`, `chat_messages`, `admin_games_stats`, `players`, `calculators` i podkolekcji.

Wniosek archiwalny: bezpieczeństwo opierało się głównie na UI/PIN, a nie na twardej autoryzacji w regułach.

---

## 7) Podsumowanie archiwum „old”
Przed migracją Main działa na modelu:
- Firestore real-time + stare kolekcje bez prefiksów modułów,
- PIN jako podstawowa autoryzacja użytkownika,
- uprawnienia sekcyjne zapisane w `app_settings/player_access.players[]`,
- bardzo liberalne Rules.

Ten dokument stanowi punkt odniesienia do migracji na:
- oddzielne kolekcje Main/Second,
- Firebase Auth (login+hasło),
- reguły egzekwowane po `request.auth.uid` + rola/uprawnienia.
