# Projekt: Login i Hasło (Main + Second)

## Prompt użytkownika
"Przeczytaj wszystkie pliki w Analizy a następnie utwórz nowy plik o nazwie \"Projekt_Login_i_Haslo.md\".

Zawrzyj w nim:

1. Pełną obecną strukturę Firebase (z pliku Analizy/firestore-structure.txt)
2. Wymagane nowe Rules, które pozwolą na wprowadzenie funkcjonalności uwierzytelniania użytkowników poprzez login i hasło i zostawią jednocześnie pełen dostęp do kolekcji o początku nazwy \"Nekrolog_\" (które służą do innego projektu).
3. Opiszą krok-po-kroku jak dokładnie założyć konto admina w dwóch wariantach:
A - poprzez skrypt node.js (zapisz pełen skrypt)
B - poprzez ręczne wpisanie wartości w Firebase (napisz dokładnie co i gdzie wpisać)
4. Pełną analizę obecnego kodu pod kątem połączenia z Firebase oraz instrukcją co zmienić po utworzeniu nowych kolekcji (strukturę starej masz w Analizy/old_firestore-structure.txt a nowej w Analizy/firestore-structure.txt)
5. Przy założeniu, że zmiany w kodzie są wprowadzone i korzysta się już z nowych Rules i wszystko jest podpięte pod nowe kolekcje wypisz mi jakie kolekcje w Firebase są stare i można je skasować.
6. Wypisz dokładnie w których funkcjach aplikacji jest używany PIN i w jaki sposób zachowa się te same funkcjonalności po przejściu na model z loginem i hasłem.
7. Napisz mi jak włączyć provider Email/Hasło w Firebase Authentication
8. Przygotuj mi listę krok-po-kroku co i w jakiej kolejności mam robić, żeby przeprowadzić operację utworzenia konta admina, kont kilku użytkowników, przepięcia kodu aplikacji na nowe moduły i zmiany Rules. W jakiej kolejności należy wykonać te operacje? Co muszę wykonać jeszcze po stronie Firebase poza włączeniem providera z pkt7?"

---

## 1) Pełna obecna struktura Firebase

Poniżej pełny eksport z `Analizy/firestore-structure.txt`.

```txt
FIRESTORE STRUCTURE EXPORT
2026-02-25T18:46:19.086Z

├─ admin_games_stats
│  ├─ 2025
│  │  ├─ rows (array)
│  │  ├─ visibleColumns (array)
│  ├─ 2026
│  │  ├─ rows (array)
│  │  ├─ visibleColumns (array)
│  └─ 2027
│     ├─ rows (array)
│     ├─ visibleColumns (array)
├─ admin_messages
│  └─ admin_messages
│     ├─ createdAt (timestamp)
│     ├─ message (string)
│     ├─ source (string)
├─ app_settings
│  ├─ evening_plan
│  │  ├─ html (string)
│  │  ├─ source (string)
│  │  ├─ updatedAt (timestamp)
│  ├─ next_game
│  │  ├─ pin (string)
│  ├─ player_access
│  │  ├─ players (array)
│  │  ├─ updatedAt (timestamp)
│  └─ rules
│     ├─ source (string)
│     ├─ text (string)
│     ├─ updatedAt (timestamp)
├─ calculators
│  ├─ cash
│  │  ├─ createdAt (timestamp)
│  │  ├─ isActive (boolean)
│  │  ├─ name (string)
│  │  ├─ table8Row (map)
│  │  ├─ table9Rows (array)
│  │  ├─ type (string)
│  │  ├─ updatedAt (timestamp)
│  │  ├─ definitions
│  │  │  └─ v1
│  │  │     ├─ appliesTo (array)
│  │  │     ├─ createdAt (timestamp)
│  │  │     ├─ createdBy (string)
│  │  │     ├─ globalVariablesSchema (array)
│  │  │     ├─ status (string)
│  │  │     ├─ tables (array)
│  │  │     ├─ updatedAt (timestamp)
│  │  │     ├─ version (integer)
│  │  ├─ placeholders
│  │  │  └─ defaults
│  │  │     ├─ payoutModel (string)
│  │  │     ├─ rankingFormula (string)
│  │  │     ├─ rebuyColumnsMode (string)
│  │  │     ├─ updatedAt (timestamp)
│  │  └─ sessions
│  │     └─ default_session
│  │        ├─ createdAt (timestamp)
│  │        ├─ createdBy (string)
│  │        ├─ definitionVersionId (string)
│  │        ├─ finalizedAt (null)
│  │        ├─ name (string)
│  │        ├─ playersSourcePath (string)
│  │        ├─ sourceGameId (null)
│  │        ├─ status (string)
│  │        ├─ updatedAt (timestamp)
│  │        ├─ updatedBy (string)
│  │        ├─ calculationFlags
│  │        │  └─ current
│  │        │     ├─ allowManualOverride (boolean)
│  │        │     ├─ freezeComputedValues (boolean)
│  │        │     ├─ updatedAt (timestamp)
│  │        │     ├─ updatedBy (string)
│  │        ├─ tables
│  │        │  └─ (no documents)
│  │        └─ variables
│  │           └─ current
│  │              ├─ defaultWinPercent (integer)
│  │              ├─ rakePercent (integer)
│  │              ├─ rebuyColumnsCount (integer)
│  │              ├─ updatedAt (timestamp)
│  │              ├─ updatedBy (string)
│  └─ tournament
│     ├─ createdAt (timestamp)
│     ├─ eliminatedOrder (array)
│     ├─ isActive (boolean)
│     ├─ name (string)
│     ├─ table1Row (map)
│     ├─ table2Rows (array)
│     ├─ table3Row (map)
│     ├─ table5Mods (array)
│     ├─ table5SplitPercents (array)
│     ├─ type (string)
│     ├─ updatedAt (timestamp)
│     ├─ definitions
│     │  └─ v1
│     │     ├─ appliesTo (array)
│     │     ├─ createdAt (timestamp)
│     │     ├─ createdBy (string)
│     │     ├─ globalVariablesSchema (array)
│     │     ├─ status (string)
│     │     ├─ tables (array)
│     │     ├─ updatedAt (timestamp)
│     │     ├─ version (integer)
│     ├─ placeholders
│     │  └─ defaults
│     │     ├─ payoutModel (string)
│     │     ├─ rankingFormula (string)
│     │     ├─ rebuyColumnsMode (string)
│     │     ├─ updatedAt (timestamp)
│     └─ sessions
│        └─ default_session
│           ├─ createdAt (timestamp)
│           ├─ createdBy (string)
│           ├─ definitionVersionId (string)
│           ├─ finalizedAt (null)
│           ├─ name (string)
│           ├─ playersSourcePath (string)
│           ├─ sourceGameId (null)
│           ├─ status (string)
│           ├─ updatedAt (timestamp)
│           ├─ updatedBy (string)
│           ├─ calculationFlags
│           │  └─ current
│           │     ├─ allowManualOverride (boolean)
│           │     ├─ freezeComputedValues (boolean)
│           │     ├─ updatedAt (timestamp)
│           │     ├─ updatedBy (string)
│           ├─ tables
│           │  └─ (no documents)
│           └─ variables
│              └─ current
│                 ├─ defaultWinPercent (integer)
│                 ├─ rakePercent (integer)
│                 ├─ rebuyColumnsCount (integer)
│                 ├─ updatedAt (timestamp)
│                 ├─ updatedBy (string)
├─ chat_messages
│  ├─ MP8zz5Zz8JRNoULfosJ3
│  │  ├─ authorId (string)
│  │  ├─ authorName (string)
│  │  ├─ createdAt (timestamp)
│  │  ├─ expireAt (timestamp)
│  │  ├─ source (string)
│  │  ├─ text (string)
│  ├─ S8lcGi2IZ1absJt71tJu
│  │  ├─ authorId (string)
│  │  ├─ authorName (string)
│  │  ├─ createdAt (timestamp)
│  │  ├─ expireAt (timestamp)
│  │  ├─ source (string)
│  │  ├─ text (string)
│  ├─ VdMazdSr4qi76KTMjobG
│  │  ├─ authorId (string)
│  │  ├─ authorName (string)
│  │  ├─ createdAt (timestamp)
│  │  ├─ expireAt (timestamp)
│  │  ├─ source (string)
│  │  ├─ text (string)
│  ├─ qM3F6VYUDVIWhM9nyI8k
│  │  ├─ authorId (string)
│  │  ├─ authorName (string)
│  │  ├─ createdAt (timestamp)
│  │  ├─ expireAt (timestamp)
│  │  ├─ source (string)
│  │  ├─ text (string)
│  ├─ vScChNb9lO7Qe6BAVJJ9
│  │  ├─ authorId (string)
│  │  ├─ authorName (string)
│  │  ├─ createdAt (timestamp)
│  │  ├─ expireAt (timestamp)
│  │  ├─ source (string)
│  │  ├─ text (string)
│  └─ yD8M9TQp5kiSIHK6Bm6A
│     ├─ authorId (string)
│     ├─ authorName (string)
│     ├─ createdAt (timestamp)
│     ├─ expireAt (timestamp)
│     ├─ source (string)
│     ├─ text (string)
├─ main_admin_games_stats
│  └─ 2026
│     ├─ rows (array)
│     ├─ updatedAt (timestamp)
│     ├─ visibleColumns (array)
├─ main_admin_messages
│  └─ admin_messages
│     ├─ createdAt (timestamp)
│     ├─ message (string)
│     ├─ source (string)
│     ├─ updatedAt (timestamp)
├─ main_app_settings
│  ├─ player_access
│  │  ├─ players (array)
│  │  ├─ updatedAt (timestamp)
│  └─ rules
│     ├─ createdAt (timestamp)
│     ├─ source (string)
│     ├─ text (string)
│     ├─ updatedAt (timestamp)
├─ main_calculators
│  ├─ cash
│  │  ├─ eliminatedOrder (array)
│  │  ├─ table1Row (map)
│  │  ├─ table2Rows (array)
│  │  ├─ table3Row (map)
│  │  ├─ table5SplitPercents (array)
│  │  ├─ updatedAt (timestamp)
│  └─ tournament
│     ├─ eliminatedOrder (array)
│     ├─ table1Row (map)
│     ├─ table2Rows (array)
│     ├─ table3Row (map)
│     ├─ table5SplitPercents (array)
│     ├─ updatedAt (timestamp)
├─ main_chat_messages
│  ├─ __meta
│  │  ├─ createdAt (timestamp)
│  │  ├─ module (string)
│  │  ├─ type (string)
│  │  ├─ updatedAt (timestamp)
│  └─ welcome
│     ├─ createdAt (timestamp)
│     ├─ deleted (boolean)
│     ├─ isAdmin (boolean)
│     ├─ playerId (string)
│     ├─ playerName (string)
│     ├─ text (string)
│     ├─ updatedAt (timestamp)
├─ main_tables
│  └─ CYrTNkGm0WSJXREhrc3z
│     ├─ createdAt (timestamp)
│     ├─ gameDate (string)
│     ├─ gameId (string)
│     ├─ gameType (string)
│     ├─ isClosed (boolean)
│     ├─ module (string)
│     ├─ name (string)
│     ├─ postGameNotes (string)
│     ├─ preGameNotes (string)
│     ├─ updatedAt (timestamp)
│     ├─ confirmations
│     │  └─ sample-player
│     │     ├─ confirmed (boolean)
│     │     ├─ confirmedAt (null)
│     │     ├─ playerId (string)
│     │     ├─ playerName (string)
│     │     ├─ status (string)
│     │     ├─ uid (string)
│     │     ├─ updatedAt (timestamp)
│     │     ├─ updatedBy (string)
│     └─ rows
│        └─ seed-row-1
│           ├─ championship (boolean)
│           ├─ createdAt (timestamp)
│           ├─ entryFee (string)
│           ├─ payout (string)
│           ├─ playerId (string)
│           ├─ playerName (string)
│           ├─ points (string)
│           ├─ rebuy (string)
│           ├─ score (integer)
│           ├─ stake (integer)
│           ├─ updatedAt (timestamp)
├─ main_user_games
│  └─ CNqTaSMoyZx5cNI772KT
│     ├─ createdAt (timestamp)
│     ├─ createdBy (string)
│     ├─ createdByPlayerId (string)
│     ├─ createdByPlayerName (string)
│     ├─ gameDate (string)
│     ├─ gameId (string)
│     ├─ gameType (string)
│     ├─ isClosed (boolean)
│     ├─ module (string)
│     ├─ name (string)
│     ├─ ownerName (string)
│     ├─ ownerUid (string)
│     ├─ postGameNotes (string)
│     ├─ preGameNotes (string)
│     ├─ updatedAt (timestamp)
│     ├─ visibility (string)
│     ├─ confirmations
│     │  └─ sample-player
│     │     ├─ confirmed (boolean)
│     │     ├─ confirmedAt (null)
│     │     ├─ playerId (string)
│     │     ├─ playerName (string)
│     │     ├─ status (string)
│     │     ├─ uid (string)
│     │     ├─ updatedAt (timestamp)
│     │     ├─ updatedBy (string)
│     └─ rows
│        └─ seed-row-1
│           ├─ championship (boolean)
│           ├─ createdAt (timestamp)
│           ├─ entryFee (string)
│           ├─ payout (string)
│           ├─ playerId (string)
│           ├─ playerName (string)
│           ├─ points (string)
│           ├─ rebuy (string)
│           ├─ score (integer)
│           ├─ stake (integer)
│           ├─ updatedAt (timestamp)
├─ main_users
│  ├─ seed-admin
│  │  ├─ createdAt (timestamp)
│  │  ├─ createdBy (null)
│  │  ├─ displayName (string)
│  │  ├─ email (string)
│  │  ├─ isActive (boolean)
│  │  ├─ lastLoginAt (null)
│  │  ├─ moduleAccess (map)
│  │  ├─ permissions (map)
│  │  ├─ role (string)
│  │  ├─ updatedAt (timestamp)
│  │  ├─ userGamesScope (string)
│  └─ seed-player
│     ├─ createdAt (timestamp)
│     ├─ createdBy (string)
│     ├─ displayName (string)
│     ├─ email (string)
│     ├─ isActive (boolean)
│     ├─ lastLoginAt (null)
│     ├─ moduleAccess (map)
│     ├─ permissions (map)
│     ├─ role (string)
│     ├─ updatedAt (timestamp)
│     ├─ userGamesScope (string)
├─ modules_config
│  └─ collections
│     ├─ main (map)
│     ├─ second (map)
│     ├─ updatedAt (timestamp)
├─ Nekrolog_config
│  └─ sources
│     ├─ enabled (boolean)
│     ├─ sources (array)
│     ├─ updated_at (string)
├─ Nekrolog_refresh_jobs
│  └─ latest
│     ├─ error_message (string)
│     ├─ finished_at (string)
│     ├─ ok (boolean)
│     ├─ requested_at (timestamp)
│     ├─ source_errors (array)
│     ├─ started_at (string)
│     ├─ status (string)
│     ├─ trigger (string)
│     ├─ updated_at (string)
│     ├─ writer_name (string)
│     ├─ writer_version (string)
├─ Nekrolog_snapshots
│  └─ latest
│     ├─ data (map)
│     ├─ deaths (array)
│     ├─ fallback_summary (map)
│     ├─ funerals (array)
│     ├─ generated_at (string)
│     ├─ payload (map)
│     ├─ recent_deaths (array)
│     ├─ refresh_error (string)
│     ├─ source_errors (array)
│     ├─ sources (array)
│     ├─ target_phrases (array)
│     ├─ upcoming_funerals (array)
│     ├─ updated_at (string)
│     ├─ writer_name (string)
│     ├─ writer_version (string)
├─ players
│  └─ players
│     ├─ Cash (string)
│     ├─ GamesPlayed (string)
│     ├─ GamesWon (string)
│     ├─ MoneySpend (string)
│     ├─ MoneyWon (string)
│     ├─ Name (string)
│     ├─ Placeholder1 (string)
│     ├─ Placeholder2 (string)
│     ├─ Placeholder3 (string)
│     ├─ Placeholder4 (string)
│     ├─ Placeholder5 (string)
│     ├─ Placeholder6 (string)
│     ├─ Placeholder7 (string)
│     ├─ Placeholder8 (string)
│     ├─ Placeholder9 (string)
├─ second_admin_games_stats
│  └─ 2026
│     ├─ rows (array)
│     ├─ updatedAt (timestamp)
│     ├─ visibleColumns (array)
├─ second_admin_messages
│  └─ admin_messages
│     ├─ createdAt (timestamp)
│     ├─ message (string)
│     ├─ source (string)
│     ├─ updatedAt (timestamp)
├─ second_app_settings
│  ├─ player_access
│  │  ├─ players (array)
│  │  ├─ updatedAt (timestamp)
│  └─ rules
│     ├─ createdAt (timestamp)
│     ├─ source (string)
│     ├─ text (string)
│     ├─ updatedAt (timestamp)
├─ second_calculators
│  ├─ cash
│  │  ├─ eliminatedOrder (array)
│  │  ├─ table1Row (map)
│  │  ├─ table2Rows (array)
│  │  ├─ table3Row (map)
│  │  ├─ table5SplitPercents (array)
│  │  ├─ updatedAt (timestamp)
│  └─ tournament
│     ├─ eliminatedOrder (array)
│     ├─ table1Row (map)
│     ├─ table2Rows (array)
│     ├─ table3Row (map)
│     ├─ table5SplitPercents (array)
│     ├─ updatedAt (timestamp)
├─ second_chat_messages
│  ├─ __meta
│  │  ├─ createdAt (timestamp)
│  │  ├─ module (string)
│  │  ├─ type (string)
│  │  ├─ updatedAt (timestamp)
│  └─ welcome
│     ├─ createdAt (timestamp)
│     ├─ deleted (boolean)
│     ├─ isAdmin (boolean)
│     ├─ playerId (string)
│     ├─ playerName (string)
│     ├─ text (string)
│     ├─ updatedAt (timestamp)
├─ second_tables
│  └─ C9LZn8g93zb0Ecu66AaX
│     ├─ createdAt (timestamp)
│     ├─ gameDate (string)
│     ├─ gameId (string)
│     ├─ gameType (string)
│     ├─ isClosed (boolean)
│     ├─ module (string)
│     ├─ name (string)
│     ├─ postGameNotes (string)
│     ├─ preGameNotes (string)
│     ├─ updatedAt (timestamp)
│     ├─ confirmations
│     │  └─ sample-player
│     │     ├─ confirmed (boolean)
│     │     ├─ confirmedAt (null)
│     │     ├─ playerId (string)
│     │     ├─ playerName (string)
│     │     ├─ status (string)
│     │     ├─ uid (string)
│     │     ├─ updatedAt (timestamp)
│     │     ├─ updatedBy (string)
│     └─ rows
│        └─ seed-row-1
│           ├─ championship (boolean)
│           ├─ createdAt (timestamp)
│           ├─ entryFee (string)
│           ├─ payout (string)
│           ├─ playerId (string)
│           ├─ playerName (string)
│           ├─ points (string)
│           ├─ rebuy (string)
│           ├─ score (integer)
│           ├─ stake (integer)
│           ├─ updatedAt (timestamp)
├─ second_user_games
│  └─ phZIJIptBhk8ATKqM1x6
│     ├─ createdAt (timestamp)
│     ├─ createdBy (string)
│     ├─ createdByPlayerId (string)
│     ├─ createdByPlayerName (string)
│     ├─ gameDate (string)
│     ├─ gameId (string)
│     ├─ gameType (string)
│     ├─ isClosed (boolean)
│     ├─ module (string)
│     ├─ name (string)
│     ├─ ownerName (string)
│     ├─ ownerUid (string)
│     ├─ postGameNotes (string)
│     ├─ preGameNotes (string)
│     ├─ updatedAt (timestamp)
│     ├─ visibility (string)
│     ├─ confirmations
│     │  └─ sample-player
│     │     ├─ confirmed (boolean)
│     │     ├─ confirmedAt (null)
│     │     ├─ playerId (string)
│     │     ├─ playerName (string)
│     │     ├─ status (string)
│     │     ├─ uid (string)
│     │     ├─ updatedAt (timestamp)
│     │     ├─ updatedBy (string)
│     └─ rows
│        └─ seed-row-1
│           ├─ championship (boolean)
│           ├─ createdAt (timestamp)
│           ├─ entryFee (string)
│           ├─ payout (string)
│           ├─ playerId (string)
│           ├─ playerName (string)
│           ├─ points (string)
│           ├─ rebuy (string)
│           ├─ score (integer)
│           ├─ stake (integer)
│           ├─ updatedAt (timestamp)
├─ second_users
│  ├─ seed-admin
│  │  ├─ createdAt (timestamp)
│  │  ├─ createdBy (null)
│  │  ├─ displayName (string)
│  │  ├─ email (string)
│  │  ├─ isActive (boolean)
│  │  ├─ lastLoginAt (null)
│  │  ├─ moduleAccess (map)
│  │  ├─ permissions (map)
│  │  ├─ role (string)
│  │  ├─ updatedAt (timestamp)
│  │  ├─ userGamesScope (string)
│  └─ seed-player
│     ├─ createdAt (timestamp)
│     ├─ createdBy (string)
│     ├─ displayName (string)
│     ├─ email (string)
│     ├─ isActive (boolean)
│     ├─ lastLoginAt (null)
│     ├─ moduleAccess (map)
│     ├─ permissions (map)
│     ├─ role (string)
│     ├─ updatedAt (timestamp)
│     ├─ userGamesScope (string)
├─ Tables
│  ├─ 3RAPSXbOk5Z7aChy94AN
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ N6NpKE7Ey6Yc3nw5Nq9O
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ NMrYnTq2AnTBXw01hp9u
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Vr296AIHHDGgyuFQUCdA
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ aBTSFVv5sqxZMsnIvCkV
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ mel0Cu55PzQ4PL0ptEtV
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ sMdBdjMKVYKmsEWSlUfT
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ vMb78HrQsbUsQypFERmT
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ 4LEbMfHAjCQjxROE8INf
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 0qWNzn8lN2YqS4RHXzQ2
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ IRxCUFndy5UoT1IyqUEu
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ JZEr0PPO9XUGfa7vgARu
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ M1BQnRWvawntRPkKhwi5
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ XAFPDxep3o4AqmgHAD4T
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ otSQCEt0Ori75YGYDLYy
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ wUsge7LJEF20cKRgoOsg
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ xnzKFkjV3sVywwHI3rNI
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ 7gU3GxMXZw3UL3JQOqKX
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 0SZt2eJsWehTmTWOzBvr
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ JMFchUzbTUAoJDpKapK3
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ KJVK8f0c7VbMtGScVdrF
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Krvd6XaZZsreVk3yQG8U
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Ou87kek6iaoytqjKrdrb
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ YCArvMcJbbJKmT6Cge8G
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ jeJd5VxY7Nlo5tuZ3zsX
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ xzlSu4oriIMyqlFyLijH
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ BD2KzUxHvnGbRC7ehMim
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 8Zfc9ILqxwjJfU11dQlT
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ FYnUuJkSoVoueA3dZ2K6
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ FjejI0yISFCqdpRn44Hg
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ NBk9ndElW9cqrHQqAvf1
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ V7bdsDJ1hSXGrDmFgjXm
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ nbouVazls7x0Jx4RhYzC
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ p76kxRarvgSTTB65sz8r
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ wRdvz5TMy60kPDbFqmfc
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ Bj6FsdABQvxt58BwzBqP
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 3QVbhlOeMkspn8wrpwNg
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 5WiokuzQRrqhLUPJziPM
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ GelP9bz1gL6K9TGLFs9s
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ bntpMwuYaJAqFLKJ9XFA
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ rOuZYkNHpSBSWE5juiMF
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ twWLfLDI9rc3mGDtCzKj
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ wrpC9qgBbV83z0EuEDGm
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ yuM4Ani08LymkxDdJMpy
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ JnZPEBg9zYoGPb3UpNBp
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 1ItvMRMcpK8nrVQeHXdr
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ NoFq3zxvJEppDkuKeR6S
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ RAt7qy7NcelSf5Sl7C86
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ RZrILMwz9PwbVEy8ABlh
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ WmbftystEHTXFkU5aLCS
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ iVURH3mUm29g6uFdYDsQ
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ ifT6Atd3MvcCUwgeAWwe
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ j8wf9Kdw7hirbNi3KVLb
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ n4KU6vlUknWgVKgYTyqu
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ pAlXSWtBL3BYIJgIeisW
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ KhTNAIGA5VeC4TtDgODE
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ FEc5p0Jw7dNJ7JaRb5k4
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Fyk3oKltxVblS1Trs3ck
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ N8QRTNJzhYbjoftjjyS4
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ SiKQxx3TPcDGzr9Cadr6
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ SzLMxSNbuY2zmxgzngWY
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ V3Hungq0OSjID57lrW4z
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ V8fGNpfjuT7jElADfw8F
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ lu32ivshX99wF5RSYWoi
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ MI96eJNNf2DkP5SNy6He
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 3GkvUaXYej44meaj28U6
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 5lNyZikBmKFkr27YvkiG
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 705eaqlIU9l9nVorByQs
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 9suTIB46uYJmv58YUDgN
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ IYmTLApUGkNUaRxMa7hu
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ MX8brr9VwoKCCWwJ8vpz
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ ZiIrag18QPC5OEYNtDtW
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ jsxTAZiQFFl7RWTm2Ixw
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ lv7CbO6F6CnMoa3Xc1R4
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ lzHEdwo6Vb8wEzDiYKsj
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ NapwvXOQt0mCpU3wTyeZ
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 3bN1ehiXF9Ra4I7zU052
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 409hkp9lKUFp61qAH0wK
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ deposits (string)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ meetings (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ payouts (string)
│  │     │  ├─ percentAllGames (string)
│  │     │  ├─ percentPlayedGames (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     │  ├─ rebuyTotal (string)
│  │     │  ├─ summary (string)
│  │     │  ├─ totalGames (string)
│  │     ├─ 9Yytudhlk6qWuvbOUlAc
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ HbK4lGilbQ8kTkSLoDC4
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ O3LsInIDPyEW6fZfC0UA
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ PnZathgCaHGVzgTWJ6Q4
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ XVTuGF6wnfgOPvNPhciv
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ zMKXP9w4GaNynLyAa40F
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ PsTCS8dCo8BXQs9TaqkH
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 7j8GMY4ERmh41ta5oR8v
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ HPQhddytzEXVLGWMJH2U
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ IwmOQ6FJTa2lrhlEssuY
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ SguzSYqRhR6Sv2pEFlTe
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ YZmnmMVcnDHI4aJNPTzm
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ nw0BNLM2J1XBD9YzwVr1
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ twmvySdYpuLusJoYYiRt
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ Q6xCNAqbba9ZJ1xdLnbb
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 3FRuzhVs05tIBemWjJ7O
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ EMsrtDiYfI4bORYcpXcf
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ U5y1UF3eF6WKR8I5o3li
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ b2hhtETICPGMjhQCAqeU
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ d35oIVzCquhobxq1PqOR
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ oCaBt7vCpp71CYWxnlCc
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ peaXIUfLYk4Fv0eOBJXd
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ qWjjhsaVcmeT5tUXLmj9
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ R7iIFpb6sXAJqI7i4Hau
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 5LDO1Ysi2mTrHqqUo8fa
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Eayh1cN7TPfQMijhpNHS
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ GGzP63CFQj4FoJGgf7xI
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ L0pvPDvaCZf7BInxo3gW
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ OVOzsXZA9gEkg7H6te4I
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ R4ncaMevH01XdDf7xM1R
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ XxOyXjjTFedIw8u1Dlh0
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ qFvFb48A84QFBS9HqfJ3
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ zpYQAL5aXyqi88qNemUy
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ SSpNttxIQvqFzUNixLz4
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ 3jPuV8OsatsTAg5YXLYm
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 65iZGCNiTAm5V4kEgERo
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 7wKuMwvz3sgB3Snj1w6W
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 9X1WjYs7SlDi2Ku8tI2Q
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ 9l7WyhVQjrBgtU72Hzvz
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ ERaX0yScE8yK2h1YcySE
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ JSdOH2sn7Os6PQVNTJqJ
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ LLdBK0kfKsLFehsRIetl
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ PA2QmSIz5HKg5Tl1rhz7
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ W5ZwdXuqRqi1N9Oqn7fJ
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ Up3DgXrblcUB0KbNMLwP
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  └─ rows
│  │     ├─ 8qoSNt2kArwqtV8Hb2t0
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ AO4SvcLDaFvX6yjCCRLj
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ Eg5E8e1yJtHYbMF2fQ1Z
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ L89KlsbJe8bgcOWSnaBb
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ UwJpIu32Z8l2xNz1FMmp
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ dqNfW81t9iTFOciXGkWX
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ gyclLAjYkOH1RgWgoNoA
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ qJHnMCsInVrDPQiGHlFd
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ bzDbspdqKkF3ezEhMdtc
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ DlTTsdDLyqLUY53YaIPA
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ G4tbOS9Hgv4EIphWycvP
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ J8MB7tJ6SMgk8jbH5Rd5
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ NMeHOk7tiqUiCOlolj0i
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ gfSyvuFlJvDKZHqR52qh
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ ghLsaE7ojVCAcvcIrUoa
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ k7ug4CpnpywaWgqqnxIU
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ wUQBXcPut09cVoVTr851
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  ├─ sgNuiN8jPyZegp6bLuc8
│  │  ├─ createdAt (timestamp)
│  │  ├─ gameDate (string)
│  │  ├─ gameType (string)
│  │  ├─ isClosed (boolean)
│  │  ├─ name (string)
│  │  ├─ postGameNotes (string)
│  │  ├─ preGameNotes (string)
│  │  └─ rows
│  │     ├─ ABxMDwQfAvNDXxsNyinR
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ BeNwDvsdOc6wrQrBoYlJ
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ CCbVkTb8HrUJNp87ZMnk
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ GlHyJCHlwWL1TDf93L1c
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ HMhUDORYwU0iDUgwo33z
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ OIo95AlMGSp5cbrZXKFa
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ bdjlzLYwpjFgiJeSqomG
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     ├─ kgyBxlOM6Y0dYzkAcA6P
│  │     │  ├─ championship (boolean)
│  │     │  ├─ createdAt (timestamp)
│  │     │  ├─ entryFee (string)
│  │     │  ├─ payout (string)
│  │     │  ├─ playerName (string)
│  │     │  ├─ points (string)
│  │     │  ├─ rebuy (string)
│  │     └─ lr3Pzd9WAuXjdfcNcR47
│  │        ├─ championship (boolean)
│  │        ├─ createdAt (timestamp)
│  │        ├─ entryFee (string)
│  │        ├─ payout (string)
│  │        ├─ playerName (string)
│  │        ├─ points (string)
│  │        ├─ rebuy (string)
│  └─ t57auaHJLgexQvoHMYh9
│     ├─ createdAt (timestamp)
│     ├─ gameDate (string)
│     ├─ gameType (string)
│     ├─ isClosed (boolean)
│     ├─ name (string)
│     ├─ postGameNotes (string)
│     ├─ preGameNotes (string)
│     └─ rows
│        ├─ 17HNAnf3IfVASK8sOt2E
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ BkfyC33b5i0iZ7ZP30Qw
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ EjvAx49XEO24BZ3Xv50B
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ M3E2NZwioJ9X0OYvUspO
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ g9ojHzDvf1JrFiDiWp1H
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ jiZXZlWjUnRLgMzxEFsd
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        ├─ qqI5UJz9fYakbOuIu255
│        │  ├─ championship (boolean)
│        │  ├─ createdAt (timestamp)
│        │  ├─ entryFee (string)
│        │  ├─ payout (string)
│        │  ├─ playerName (string)
│        │  ├─ points (string)
│        │  ├─ rebuy (string)
│        └─ wvaNkNuViZPytzmONnEo
│           ├─ championship (boolean)
│           ├─ createdAt (timestamp)
│           ├─ entryFee (string)
│           ├─ payout (string)
│           ├─ playerName (string)
│           ├─ points (string)
│           ├─ rebuy (string)
└─ UserGames
   ├─ JSSmIVQxKnSipgsm7hvd
   │  ├─ createdAt (timestamp)
   │  ├─ createdByPlayerId (string)
   │  ├─ createdByPlayerName (string)
   │  ├─ gameDate (string)
   │  ├─ gameType (string)
   │  ├─ isClosed (boolean)
   │  ├─ name (string)
   │  ├─ postGameNotes (string)
   │  ├─ preGameNotes (string)
   │  └─ rows
   │     ├─ OIyNpsCPJts8A8vlr97s
   │     │  ├─ championship (boolean)
   │     │  ├─ createdAt (timestamp)
   │     │  ├─ entryFee (string)
   │     │  ├─ payout (string)
   │     │  ├─ playerName (string)
   │     │  ├─ points (string)
   │     │  ├─ rebuy (string)
   │     └─ ynta5JYfW6YxLa6fo7vj
   │        ├─ championship (boolean)
   │        ├─ createdAt (timestamp)
   │        ├─ entryFee (string)
   │        ├─ payout (string)
   │        ├─ playerName (string)
   │        ├─ points (string)
   │        ├─ rebuy (string)
   └─ t5VFsLOHeDZh3wVCellE
      ├─ createdAt (timestamp)
      ├─ createdByPlayerId (string)
      ├─ createdByPlayerName (string)
      ├─ gameDate (string)
      ├─ gameType (string)
      ├─ isClosed (boolean)
      ├─ name (string)
      ├─ postGameNotes (string)
      ├─ preGameNotes (string)
      └─ rows
         └─ Lmqv7Y8e2HYwoIIkZvUZ
            ├─ championship (boolean)
            ├─ createdAt (timestamp)
            ├─ entryFee (string)
            ├─ payout (string)
            ├─ playerName (string)
            ├─ points (string)
            ├─ rebuy (string)```

---

## 2) Nowe Firestore Rules pod login+hasło + pełny dostęp do `Nekrolog_*`

Poniższe reguły zakładają:
- logowanie przez Firebase Authentication (Email/Hasło),
- profile użytkowników w `main_users/{uid}` i `second_users/{uid}`,
- role: `admin` oraz `player`,
- dostęp do czatu/gier zgodnie z profilem i uprawnieniami,
- **pełny, bezwarunkowy dostęp** do kolekcji `Nekrolog_*`.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ----------------------
    // Helpers
    // ----------------------
    function signedIn() {
      return request.auth != null;
    }

    function userDoc(module) {
      return get(/databases/$(database)/documents/$(module + '_users')/$(request.auth.uid));
    }

    function userExists(module) {
      return signedIn() && exists(/databases/$(database)/documents/$(module + '_users')/$(request.auth.uid));
    }

    function isActive(module) {
      return userExists(module) && userDoc(module).data.isActive == true;
    }

    function isAdmin(module) {
      return isActive(module) && userDoc(module).data.role == 'admin';
    }

    function hasPermission(module, permKey) {
      return isActive(module)
        && userDoc(module).data.permissions is map
        && userDoc(module).data.permissions[permKey] == true;
    }

    function isOwner() {
      return signedIn() && request.resource.data.ownerUid == request.auth.uid;
    }

    function isCurrentOwner(resourceData) {
      return signedIn() && resourceData.ownerUid == request.auth.uid;
    }

    // ----------------------
    // Wyjątek: Nekrolog_* ma zostać otwarty
    // ----------------------
    match /Nekrolog_config/{docId} {
      allow read, write: if true;
    }
    match /Nekrolog_refresh_jobs/{docId} {
      allow read, write: if true;
    }
    match /Nekrolog_snapshots/{docId} {
      allow read, write: if true;
    }

    // ----------------------
    // MAIN
    // ----------------------
    match /main_users/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow create: if isAdmin('main');
      allow update: if isAdmin('main') || (signedIn() && request.auth.uid == uid);
      allow delete: if isAdmin('main');
    }

    match /main_app_settings/{docId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');
    }

    match /main_admin_messages/{docId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main') || hasPermission('main', 'newsTab');
    }

    match /main_chat_messages/{docId} {
      allow read: if isActive('main') && hasPermission('main', 'chatTab');
      allow create: if isActive('main') && hasPermission('main', 'chatTab');
      allow update, delete: if isAdmin('main');
    }

    match /main_tables/{gameId} {
      allow read: if isActive('main');
      allow create, update, delete: if isAdmin('main') || hasPermission('main', 'tablesTab');

      match /rows/{rowId} {
        allow read: if isActive('main');
        allow write: if isAdmin('main') || hasPermission('main', 'tablesTab');
      }

      match /confirmations/{confirmId} {
        allow read: if isActive('main');
        allow create, update: if isAdmin('main')
          || (isActive('main') && hasPermission('main', 'confirmationsTab'));
        allow delete: if isAdmin('main');
      }
    }

    match /main_user_games/{gameId} {
      allow read: if isActive('main') && hasPermission('main', 'userGamesTab');
      allow create: if isActive('main')
        && hasPermission('main', 'userGamesTab')
        && request.resource.data.ownerUid == request.auth.uid;
      allow update, delete: if isAdmin('main')
        || (isActive('main')
          && hasPermission('main', 'userGamesTab')
          && isCurrentOwner(resource.data));

      match /rows/{rowId} {
        allow read: if isActive('main') && hasPermission('main', 'userGamesTab');
        allow write: if isAdmin('main')
          || (isActive('main')
            && hasPermission('main', 'userGamesTab')
            && exists(/databases/$(database)/documents/main_user_games/$(gameId))
            && isCurrentOwner(get(/databases/$(database)/documents/main_user_games/$(gameId)).data));
      }

      match /confirmations/{confirmId} {
        allow read: if isActive('main') && hasPermission('main', 'userGamesTab');
        allow create, update: if isAdmin('main')
          || (isActive('main') && hasPermission('main', 'userGamesTab'));
        allow delete: if isAdmin('main');
      }
    }

    match /main_admin_games_stats/{docId} {
      allow read: if isActive('main') && hasPermission('main', 'statsTab');
      allow write: if isAdmin('main') || hasPermission('main', 'statsTab');
    }

    match /main_calculators/{docId} {
      allow read: if isActive('main');
      allow write: if isAdmin('main');

      match /{subCollection}/{subDocId} {
        allow read: if isActive('main');
        allow write: if isAdmin('main');
      }
    }

    // ----------------------
    // SECOND
    // ----------------------
    match /second_users/{uid} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow create: if isAdmin('second');
      allow update: if isAdmin('second') || (signedIn() && request.auth.uid == uid);
      allow delete: if isAdmin('second');
    }

    match /second_app_settings/{docId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');
    }

    match /second_admin_messages/{docId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second') || hasPermission('second', 'newsTab');
    }

    match /second_chat_messages/{docId} {
      allow read: if isActive('second') && hasPermission('second', 'chatTab');
      allow create: if isActive('second') && hasPermission('second', 'chatTab');
      allow update, delete: if isAdmin('second');
    }

    match /second_tables/{gameId} {
      allow read: if isActive('second');
      allow create, update, delete: if isAdmin('second') || hasPermission('second', 'tablesTab');

      match /rows/{rowId} {
        allow read: if isActive('second');
        allow write: if isAdmin('second') || hasPermission('second', 'tablesTab');
      }

      match /confirmations/{confirmId} {
        allow read: if isActive('second');
        allow create, update: if isAdmin('second')
          || (isActive('second') && hasPermission('second', 'confirmationsTab'));
        allow delete: if isAdmin('second');
      }
    }

    match /second_user_games/{gameId} {
      allow read: if isActive('second') && hasPermission('second', 'userGamesTab');
      allow create: if isActive('second')
        && hasPermission('second', 'userGamesTab')
        && request.resource.data.ownerUid == request.auth.uid;
      allow update, delete: if isAdmin('second')
        || (isActive('second')
          && hasPermission('second', 'userGamesTab')
          && isCurrentOwner(resource.data));

      match /rows/{rowId} {
        allow read: if isActive('second') && hasPermission('second', 'userGamesTab');
        allow write: if isAdmin('second')
          || (isActive('second')
            && hasPermission('second', 'userGamesTab')
            && exists(/databases/$(database)/documents/second_user_games/$(gameId))
            && isCurrentOwner(get(/databases/$(database)/documents/second_user_games/$(gameId)).data));
      }

      match /confirmations/{confirmId} {
        allow read: if isActive('second') && hasPermission('second', 'userGamesTab');
        allow create, update: if isAdmin('second')
          || (isActive('second') && hasPermission('second', 'userGamesTab'));
        allow delete: if isAdmin('second');
      }
    }

    match /second_admin_games_stats/{docId} {
      allow read: if isActive('second') && hasPermission('second', 'statsTab');
      allow write: if isAdmin('second') || hasPermission('second', 'statsTab');
    }

    match /second_calculators/{docId} {
      allow read: if isActive('second');
      allow write: if isAdmin('second');

      match /{subCollection}/{subDocId} {
        allow read: if isActive('second');
        allow write: if isAdmin('second');
      }
    }

    // ----------------------
    // Legacy - blokada domyślna (stare kolekcje)
    // ----------------------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 3) Zakładanie konta admina

## 3A) Wariant A — skrypt Node.js (pełny)

Plik: `scripts/create-admin-account.js`

```js
/**
 * Tworzenie konta admina: Firebase Auth + Firestore profile (main_users/second_users)
 *
 * Wymagania:
 *   npm i firebase-admin
 *   SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
 *
 * Przykłady:
 *   MODULE=main EMAIL=admin.main@example.com PASSWORD='Haslo123!' DISPLAY_NAME='Main Admin' node scripts/create-admin-account.js
 *   MODULE=second EMAIL=admin.second@example.com PASSWORD='Haslo123!' DISPLAY_NAME='Second Admin' node scripts/create-admin-account.js
 */

const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const moduleName = process.env.MODULE; // 'main' lub 'second'
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
const displayName = process.env.DISPLAY_NAME || 'Administrator';

if (!['main', 'second'].includes(moduleName)) {
  throw new Error('MODULE musi mieć wartość: main albo second');
}
if (!email || !password) {
  throw new Error('Podaj EMAIL i PASSWORD');
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const ts = admin.firestore.FieldValue.serverTimestamp;

const usersCollection = `${moduleName}_users`;

async function main() {
  let userRecord;

  try {
    userRecord = await admin.auth().getUserByEmail(email);
    console.log(`Użytkownik już istniał w Auth: uid=${userRecord.uid}`);
  } catch {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true,
      disabled: false
    });
    console.log(`Utworzono użytkownika Auth: uid=${userRecord.uid}`);
  }

  const uid = userRecord.uid;

  const profile = {
    uid,
    email,
    displayName,
    role: 'admin',
    isActive: true,
    userGamesScope: 'read_all',
    permissions: {
      playerZoneTab: true,
      nextGameTab: true,
      chatTab: true,
      confirmationsTab: true,
      userGamesTab: true,
      statsTab: true,
      playersTab: true,
      tablesTab: true,
      adminGamesTab: true,
      newsTab: true,
      tournamentTab: true
    },
    moduleAccess: {
      [moduleName]: true
    },
    createdAt: ts(),
    updatedAt: ts(),
    createdBy: 'script:create-admin-account',
    lastLoginAt: null
  };

  await db.collection(usersCollection).doc(uid).set(profile, { merge: true });

  console.log(`Zapisano profil admina w ${usersCollection}/${uid}`);
  console.log('DONE');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Uruchomienie:
1. `npm i firebase-admin`
2. W katalogu projektu umieść klucz serwisowy Firebase (np. `serviceAccountKey.json`)
3. Odpal:
   - Main: `SERVICE_ACCOUNT_PATH=./serviceAccountKey.json MODULE=main EMAIL=admin.main@example.com PASSWORD='Haslo123!' DISPLAY_NAME='Main Admin' node scripts/create-admin-account.js`
   - Second: `SERVICE_ACCOUNT_PATH=./serviceAccountKey.json MODULE=second EMAIL=admin.second@example.com PASSWORD='Haslo123!' DISPLAY_NAME='Second Admin' node scripts/create-admin-account.js`

## 3B) Wariant B — ręcznie w Firebase Console

### Krok 1: utwórz użytkownika w Authentication
1. Firebase Console → **Authentication** → **Users**.
2. Kliknij **Add user**.
3. Wpisz:
   - `Email`: np. `admin.main@example.com`
   - `Password`: np. `Haslo123!` (tymczasowe)
4. Kliknij **Add user**.
5. Otwórz utworzonego usera i skopiuj `UID`.

### Krok 2: dodaj dokument profilu w Firestore
1. Firebase Console → **Firestore Database** → **Data**.
2. Wejdź do kolekcji:
   - dla Main: `main_users`
   - dla Second: `second_users`
3. Kliknij **Add document**.
4. `Document ID` ustaw na dokładnie `UID` z Authentication.
5. Dodaj pola (typy):
   - `uid` (string): `<UID>`
   - `email` (string): `admin.main@example.com`
   - `displayName` (string): `Main Admin`
   - `role` (string): `admin`
   - `isActive` (boolean): `true`
   - `userGamesScope` (string): `read_all`
   - `createdBy` (string): `firebase-console`
   - `lastLoginAt` (null)
   - `createdAt` (timestamp): ustaw bieżący
   - `updatedAt` (timestamp): ustaw bieżący
   - `moduleAccess` (map):
     - `main` = true (dla main)
     - `second` = true (dla second)
   - `permissions` (map):
     - `playerZoneTab` = true
     - `nextGameTab` = true
     - `chatTab` = true
     - `confirmationsTab` = true
     - `userGamesTab` = true
     - `statsTab` = true
     - `playersTab` = true
     - `tablesTab` = true
     - `adminGamesTab` = true
     - `newsTab` = true
     - `tournamentTab` = true
6. Zapisz dokument.

Po tych 2 krokach konto admina jest kompletne (Auth + profil uprawnień).

---

## 4) Pełna analiza obecnego kodu i instrukcja zmian po nowych kolekcjach

## 4.1 Jak aplikacja łączy się z Firebase dzisiaj
- Konfiguracja projektu jest w `config/firebase-config.js`.
- W konfiguracji nadal ustawione są stare kolekcje: `Tables`, `UserGames`.
- W `Main/app.js` wciąż występują twarde stałe legacy (`app_settings`, `admin_messages`, `chat_messages`, `Tables`, `UserGames`, `admin_games_stats`, `calculators`).
- Część kodu ma helpery konfiguracyjne dla gier, ale nie wszystkie sekcje z nich korzystają konsekwentnie.

## 4.2 Co pokazuje porównanie `old_firestore-structure.txt` vs `firestore-structure.txt`
Nowy Firestore ma równolegle:
- **stare kolekcje** (legacy): `app_settings`, `admin_messages`, `chat_messages`, `players`, `Tables`, `UserGames`, `admin_games_stats`, `calculators`.
- **nowe kolekcje modułowe**:
  - Main: `main_*`
  - Second: `second_*`
  - profile: `main_users`, `second_users`
  - techniczne: `modules_config`
- osobne kolekcje projektu pobocznego: `Nekrolog_*`.

Wniosek: backend (struktura) już jest gotowy na migrację, ale kod frontendu wymaga pełnego przepięcia nazw kolekcji i autoryzacji.

## 4.3 Co zmienić w kodzie po stronie aplikacji

### A) Konfiguracja kolekcji
1. Rozszerz `config/firebase-config.js` o pełen mapping kolekcji per moduł:
   - Main: `main_app_settings`, `main_admin_messages`, `main_chat_messages`, `main_tables`, `main_user_games`, `main_admin_games_stats`, `main_calculators`, `main_users`.
   - Second: analogicznie `second_*`.
2. W `Main/app.js` usuń hardcoded nazwy legacy i czytaj je z configu.

### B) Uwierzytelnianie
3. Dodać `firebase.auth()`:
   - `signInWithEmailAndPassword(email, password)`
   - `onAuthStateChanged(...)`
   - `signOut()`
4. Po zalogowaniu pobierać profil z `main_users/{uid}` lub `second_users/{uid}` i z tego budować uprawnienia sekcji.

### C) Zamiana modelu PIN → login/hasło
5. Usunąć gating przez PIN dla wszystkich zakładek użytkownika.
6. Zastąpić go gatingiem:
   - użytkownik zalogowany,
   - `isActive == true`,
   - odpowiedni `permissions.<tab> == true`.

### D) Pola ownera i audyt
7. W `*_user_games` wszędzie zapisywać `ownerUid = auth.currentUser.uid`.
8. W czacie zapisywać autora po `uid` + `displayName` z profilu.

### E) Rules + indeksy
9. Wdrożyć nowe Rules (z sekcji 2).
10. Dołożyć indeksy wymagane przez zapytania (ownerUid/createdAt/status) wg komunikatów Firestore.

---

## 5) Kolekcje stare, które można skasować (po pełnym przepięciu)

Przy założeniu, że:
- kod działa już tylko na `main_*` i `second_*`,
- Rules blokują legacy,
- nie potrzebujesz danych historycznych,

możesz usunąć legacy kolekcje:
1. `admin_games_stats`
2. `admin_messages`
3. `app_settings`
4. `calculators`
5. `chat_messages`
6. `players`
7. `Tables`
8. `UserGames`

**Nie usuwać:** `Nekrolog_config`, `Nekrolog_refresh_jobs`, `Nekrolog_snapshots` (inny projekt).

---

## 6) Gdzie PIN jest używany i jak zachować te funkcje po migracji

Na podstawie `Main/app.js` PIN występuje w następujących funkcjach/mechanizmach:

### 6.1 Funkcje narzędziowe PIN
- `sanitizePin`
- `isPinValid`
- `generateRandomPin`

### 6.2 Gate stanu sesji (sessionStorage)
- `getPinGateState` / `setPinGateState`
- `getChatPinGateState` / `setChatPinGateState`
- `getConfirmationsPinGateState` / `setConfirmationsPinGateState`
- `getUserGamesPinGateState` / `setUserGamesPinGateState`
- `getStatisticsPinGateState` / `setStatisticsPinGateState`
- `getPlayerZonePinGateState` / `setPlayerZonePinGateState`

### 6.3 Bramy sekcji (weryfikacja PIN)
- `initPinGate` (sekcja „Najbliższa gra”)
- `verifyPin` wewnątrz inicjalizacji czatu
- `verifyPin` wewnątrz inicjalizacji „Gry do potwierdzenia”
- `verifyPin` wewnątrz inicjalizacji „Gry użytkowników”
- `verifyPin` wewnątrz inicjalizacji „Statystyki”
- `verifyZonePin` (Strefa Gracza)
- `updatePinVisibility`

### 6.4 Funkcje admina związane z utrzymaniem PIN
- `getPinOwnerId`
- `rebuildPinMap`
- `generateUniquePlayerPin`
- obsługa pola `pin` w `updatePlayerField` + UI input/"Losuj" w tabeli graczy.

## Zachowanie tej samej funkcjonalności po migracji
- Zamiast PIN gate per zakładka → jedna sesja logowania Firebase Auth.
- Zamiast `playerByPin` → profil użytkownika po `uid` z mapą `permissions`.
- Zamiast `*PinVerified` w sessionStorage → stan sesji `onAuthStateChanged` + cache profilu.
- Zamiast sprawdzania "PIN + uprawnienie" → sprawdzanie `isActive && permissions.<tab>`.
- Funkcjonalnie użytkownik nadal widzi tylko sekcje, do których ma dostęp, ale autoryzacja jest bezpieczniejsza i centralna.

---

## 7) Jak włączyć provider Email/Hasło w Firebase Authentication

1. Firebase Console → **Authentication**.
2. Przejdź do zakładki **Sign-in method**.
3. Kliknij provider **Email/Password**.
4. Przełącz **Enable**.
5. (Opcjonalnie) włącz także „Email link (passwordless sign-in)”, jeśli planujesz logowanie linkiem.
6. Kliknij **Save**.
7. Przejdź do **Settings → Authorized domains** i upewnij się, że Twoje domeny/dev-hosty są dodane.

---

## 8) Kolejność operacji (end-to-end plan migracji)

## Faza 0 — backup i przygotowanie
1. Zrób eksport Firestore (backup).
2. Potwierdź listę kolekcji legacy i nowych.
3. Włącz Email/Hasło (pkt 7).

## Faza 1 — przygotowanie auth i profili
4. Utwórz konto admina Main (wariant A albo B z sekcji 3).
5. Utwórz konto admina Second.
6. Utwórz konta użytkowników w Authentication.
7. Dla każdego użytkownika dodaj dokument profilu w `main_users` albo `second_users` z rolą/uprawnieniami.

## Faza 2 — kod aplikacji
8. Wprowadź ekran logowania (Main i Second): email + hasło + wyloguj.
9. Dodaj warstwę `onAuthStateChanged` i pobieranie profilu usera z Firestore.
10. Przepnij wszystkie odwołania kolekcji na `main_*` / `second_*`.
11. Usuń/wyłącz PIN gate i mapowanie `playerByPin`.
12. Upewnij się, że zapisy czatu/gier używają `uid` oraz `ownerUid`.

## Faza 3 — security i walidacja
13. Wdróż nowe Firestore Rules (sekcja 2).
14. Uzupełnij brakujące indeksy Firestore.
15. Przetestuj macierz ról:
   - admin main,
   - user main,
   - admin second,
   - user second,
   - brak konta / konto nieaktywne.

## Faza 4 — cutover i porządki
16. Po pozytywnych testach zablokuj legacy kolekcje regułą deny (domyślny fallback already false).
17. Monitoruj logi błędów 24–72h.
18. Jeśli nic nie odwołuje się do legacy, usuń kolekcje z listy z sekcji 5.

## Co jeszcze zrobić po stronie Firebase poza samym providerem
- Utworzyć użytkowników w **Authentication** (admin + users).
- Dodać profile i uprawnienia w `main_users` / `second_users`.
- Wdrożyć Firestore Rules.
- Ustawić/zaakceptować indeksy wymagane przez zapytania.
- (Opcjonalnie) skonfigurować reset hasła (szablony maili, domena nadawcy).
- (Opcjonalnie) skonfigurować App Check i/lub custom claims, jeśli chcesz dodatkowo uszczelnić dostęp.
