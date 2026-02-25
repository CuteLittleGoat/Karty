# Ultra dokładna analiza gotowości do przepięcia ze starych kolekcji na `main_*` i `second_*`

## Prompt użytkownika
"Przeczytaj analizę: Analizy/Node.md
Uruchomiłem zawarty tam skrypt.
Plik: Analizy/firestore-structure.txt
zawiera aktualną strukturę po wykonaniu skryptu. Załączam też screeny dla potwierdzenia. Plik: Analizy/old_firestore-structure.txt zawiera strukturę sprzed uruchomienia skryptu. W pliku docs/Documentation.md masz też informacje na temat używanych kolekcji.

Następnie przeczytaj pliki:
Analizy/Analiza_Migracja_Kolekcji_Main_Second.md
Analizy/Analiza_Login_Haslo_Main_vs_Second.md
Analizy/Analiza_Firebase_Second_Niezaleznosc.md

1. Sprawdź czy wszystko utworzyło się tak jak powinno.
2. Trzy kolekcje zaczynające się od \"Nekrolog_\" są do innego projektu. Zignoruj je.
3. Zapisz mi plik w Analizy w którym będzie zapisane nowe \"Rules\". Nowe \"Rules\" ma również obejmować pełen dostęp do trzech kolekcji \"Nekrolog_\".
4. Przeprowadź ultra dokładą analizę kodu pod kątem usunięcia starych kolekcji i przepięcia się na nowe \"main_\" i \"second_\". Zapisz jej wyniki w nowym pliku. Czy wszystko jest gotowe na przepięcie. Nie trzeba przenosić danych. Wszystkie zapisane dane są testowe i nie ma potrzeby ich przenoszenia do nowych struktur.

5. Nie dokonuj jeszcze zmian w dokumentacji."

---

## 1) Weryfikacja: czy bootstrap utworzył to, co powinien

### 1.1 Porównanie `old_firestore-structure.txt` vs `firestore-structure.txt`
Po uruchomieniu skryptu pojawiły się wszystkie kolekcje docelowe z prefiksami modułów:

- `main_admin_games_stats`
- `main_admin_messages`
- `main_app_settings`
- `main_calculators`
- `main_chat_messages`
- `main_tables`
- `main_user_games`
- `main_users`
- `second_admin_games_stats`
- `second_admin_messages`
- `second_app_settings`
- `second_calculators`
- `second_chat_messages`
- `second_tables`
- `second_user_games`
- `second_users`
- `modules_config`

Brak usunięć istniejących top-level kolekcji (`removed = []`) — czyli skrypt zadziałał zgodnie z założeniem bezpiecznego, idempotentnego bootstrapu (tworzenie nowych struktur bez kasowania starych).

### 1.2 Zgodność z `Analizy/Node.md`
Sprawdzone w eksporcie, że istnieją wymagane elementy dla obu modułów:

- `*_app_settings/player_access` i `*_app_settings/rules`,
- `*_admin_messages/admin_messages`,
- `*_chat_messages/__meta` + `*_chat_messages/welcome`,
- `*_admin_games_stats/<rok>`,
- `*_calculators/{cash,tournament}`,
- `*_tables/<id>/rows/*` i `*_tables/<id>/confirmations/*`,
- `*_user_games/<id>/rows/*` i `*_user_games/<id>/confirmations/*`,
- `*_users/{seed-admin,seed-player}`,
- `modules_config/collections`.

Wniosek: **struktura Firestore po stronie danych została utworzona prawidłowo**.

### 1.3 Kolekcje `Nekrolog_*`
Zgodnie z Twoim wymaganiem kolekcje:
- `Nekrolog_config`
- `Nekrolog_refresh_jobs`
- `Nekrolog_snapshots`

zostały w tej analizie wyłączone z oceny poprawności migracji Main/Second.

---

## 2) Ultra dokładna analiza kodu pod przepięcie na nowe kolekcje

## 2.1 Zakres przejrzanych plików
- `Main/app.js`
- `Second/app.js`
- `config/firebase-config.js`
- `docs/Documentation.md` (jako aktualny opis używanych kolekcji)
- analizy kontekstowe:
  - `Analizy/Analiza_Migracja_Kolekcji_Main_Second.md`
  - `Analizy/Analiza_Login_Haslo_Main_vs_Second.md`
  - `Analizy/Analiza_Firebase_Second_Niezaleznosc.md`

## 2.2 Stan faktyczny użycia kolekcji w kodzie

### A) `Main/app.js` nadal używa starych nazw jako wartości domyślnych
W kodzie są stałe:
- `PLAYER_ACCESS_COLLECTION = "app_settings"`
- `ADMIN_MESSAGES_COLLECTION = "admin_messages"`
- `CHAT_COLLECTION = "chat_messages"`
- `GAMES_COLLECTION = "Tables"`
- `USER_GAMES_COLLECTION = "UserGames"`
- `ADMIN_GAMES_STATS_COLLECTION = "admin_games_stats"`
- kalkulator lokalnie: `CALCULATOR_COLLECTION = "calculators"`

To oznacza, że **bez zmian konfiguracji i bez refaktoru część ścieżek nadal celuje w stare kolekcje**.

### B) Część kodu ma warstwę konfiguracyjną tylko dla wybranych kolekcji
Występują helpery:
- `getTablesCollectionName()`
- `getGamesCollectionName()`
- `getGameDetailsCollectionName()`
- `getUserGamesCollectionName()`

ale dotyczą one głównie gier (`Tables/UserGames/rows`).

Brakuje analogicznych, konsekwentnie używanych helperów dla:
- `app_settings`,
- `admin_messages`,
- `chat_messages`,
- `admin_games_stats`,
- `calculators`.

### C) W `Main/app.js` istnieją miejsca, gdzie dalej jest twardo `db.collection(GAMES_COLLECTION)` i `db.collection(USER_GAMES_COLLECTION)`
Przykład: sekcja „Najbliższa gra” (`initNextGame`) używa bezpośrednio `GAMES_COLLECTION` / `USER_GAMES_COLLECTION`, a nie helperów konfiguracyjnych.

Konsekwencja: nawet po zmianie `firebase-config.js` część funkcji może czytać stare kolekcje.

### D) `config/firebase-config.js` ma nadal stare wartości
Aktualnie:
- `tablesCollection: "Tables"`
- `gamesCollection: "Tables"`
- `userGamesCollection: "UserGames"`

Czyli konfiguracja nie jest jeszcze przestawiona na `main_tables` / `main_user_games`.

### E) `Second/app.js` na teraz nie integruje się z Firestore
`Second/app.js` to obecnie szkielet UI bez odczytu/zapisu Firebase.

Konsekwencja:
- moduł `Second` nie jest jeszcze „błędnie podpięty” do starych kolekcji,
- ale też nie jest gotowy funkcjonalnie na pracę produkcyjną z `second_*`.

## 2.3 Ocena gotowości „czy można już przepiąć?”

### Dla `Main`:
**NIE — jeszcze nie jest gotowe do bezpiecznego przepięcia.**

Powody:
1. Twarde odwołania do starych kolekcji w wielu miejscach.
2. Niepełna parametryzacja nazw kolekcji (tylko część modułów korzysta z helperów).
3. Konfiguracja nadal wskazuje stare `Tables`/`UserGames`.
4. Brak pełnego mapowania wszystkich kolekcji Main na `main_*` (nie tylko gry).

### Dla `Second`:
**Technicznie neutralnie (brak Firebase), ale funkcjonalnie niegotowe.**

Powody:
1. Brak kodu zapisu/odczytu do `second_*`.
2. Brak implementacji login/auth oraz egzekwowania uprawnień po stronie reguł i klienta.

## 2.4 Co jest gotowe już teraz
1. Struktura danych Firestore utworzona poprawnie (`main_*`, `second_*`, `modules_config`).
2. Można zacząć etap refaktoru kodu bez migracji danych (zgodnie z Twoim założeniem, dane testowe).
3. Można wdrożyć nowe Rules (z pełnym dostępem do `Nekrolog_*`) — osobny plik z regułami został przygotowany.

## 2.5 Co musi zostać zrobione przed finalnym przełączeniem (checklista)

### Priorytet P0 (blokery)
1. W `Main/app.js` usunąć twarde nazwy kolekcji i przejść na jedną warstwę mapowania nazw.
2. Dodać mapowanie dla wszystkich kolekcji Main:
   - `main_app_settings`
   - `main_admin_messages`
   - `main_chat_messages`
   - `main_admin_games_stats`
   - `main_calculators`
   - `main_tables`
   - `main_user_games`
   - `main_users` (pod przyszły login)
3. Przepiąć wszystkie wywołania `db.collection(...)` na helpery konfiguracyjne.
4. Zaktualizować `config/firebase-config.js` pod Main (`main_tables`, `main_user_games` itd.).

### Priorytet P1 (niezbędne dla pełnej niezależności modułów)
5. Dodać konfigurację kolekcji dla modułu `Second` i implementację Firebase w `Second/app.js`.
6. Rozdzielić model użytkowników i dostępu per moduł (`main_users` vs `second_users`).
7. Spiąć kod z Firestore Rules (auth + role + owner checks).

### Priorytet P2 (stabilizacja)
8. Dodać tryb „dry-run smoke test” (odczyt/zapis) dla każdego obszaru: aktualności, regulamin, czat, gry, statystyki, kalkulator.
9. Dopiero po pozytywnych testach wyłączyć stare kolekcje przez Rules (`allow read, write: if false;`).

---

## 3) Odpowiedź końcowa na Twoje pytanie „czy wszystko gotowe na przepięcie?”

**Nie — nie wszystko jest jeszcze gotowe na przepięcie kodu.**

- **Backend (struktura kolekcji): TAK, gotowy.**
- **Frontend/klient (`Main` i `Second`): JESZCZE NIE, wymaga refaktoru odwołań do kolekcji i pełnego dopięcia konfiguracji per moduł.**

Czyli: można zacząć przepięcie **od razu**, ale najpierw trzeba wykonać refaktor nazw kolekcji w kodzie. Bez tego aplikacja nadal będzie trafiała w stare kolekcje.
