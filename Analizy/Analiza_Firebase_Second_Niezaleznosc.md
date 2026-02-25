# Analiza Firebase — niezależność modułów Main i Second

## Prompt użytkownika
"Utwórz nowe pliki w Second
Utwórz nowy index.html, app.js i styles.css

Utwórz nową aplikację. Ma ona stylistycznie być identyczna jak Main/index.html (szczegóły masz w DetaleLayout.md)
Aplikacja ma mieć widok admina i widok użytkownika.
Widok admina ma być dostępny przez dodanie ?admin=1 do adresu.
W widoku admina na dole strony ma być podgląd widoku użytkownika (identycznie jak w Main/index.html).
Aplikacja ma mieć zakładki:
- Aktualności
- Czat
- Gracze
- Turniej

W widoku admina zakładka \"Aktualności\" ma mieć pole do wpisania tekstu a w widoku użytkownika ma być tylko podgląd (identycznie jak w Main/index.html). Nie wprowadzaj jeszcze funkcjonalności zapisywania danych do Firebase. Tymczasowo robimy tylko szkielet aplikacji.

Zakładka Gracze ma być widoczna tylko w widoku admina. Ma mieć funkcjonalność do dodawania graczy, przypisywania im PIN oraz uprawnień. Lista zakładek na uprawnienia będzie dodana później. Na obecną chwilę dodaj tylko uprawnienia do zakładki Czat. Nie wprowadzaj jeszcze funkcjonalności zapisywania danych do Firebase. Tymczasowo robimy tylko szkielet aplikacji.

Zakładka Czat ma działać jak w Main/index.html. W widoku admina ma być pole do moderacji i usuwania wiadomości. W widoku użytkownika ma być uwierzytelnienie PIN i możliwość wpisywania wiadomości. Nie wprowadzaj jeszcze funkcjonalności zapisywania danych do Firebase. Tymczasowo robimy tylko szkielet aplikacji.

Zakładka Turniej ma mieć z lewej strony panel (podobnie jak w Main/index.html panel \"Lata\" w zakładce \"Statystyki\"). Tymczasowo dodaj przyciski o nazwie \"Przycisk 1\", \"Przycisk 2\" i \"Przycisk 3\". Niech będzie tam napisane \"W budowie: Strona1\", \"W budowie: Strona2\", \"W budowie: Strona3\".

Przeprowadź analizę czy będzie wymagana dodatkowa konfiguracja Firebase.
Moduł \"Second\" ma działać niezależnie od modułu \"Main\". Oba moduły mają zakładki \"Gracze\", ale w każdym z modułów może być inna lista graczy z innymi uprawnieniami i innymi PIN. Zakładka \"Czat\" istnieje w obu modułach, ale w każdym z modułów wiadomości mają działać niezależnie od siebie.
Dodatkowo w obu modułach w przyszłości będę chciał wprowadzić uwierzytelnianie przez login i hasło (przeczytaj analizę Analizy/Projekt_Login.md).
Sprawdź czy obecna struktura Firebase będzie w stanie obsłużyć oba moduły na takiej zasadzie, że działają niezależnie od siebie, czy wymagana jest dodatkowa konfiguracja (nowe kolekcje)."

## Zakres analizy
Przeanalizowane źródła:
- `Main/app.js` — nazwy kolekcji i dokumentów używanych przez moduł Main.
- `config/firebase-config.js` — parametry konfiguracyjne kolekcji.
- `Analizy/Projekt_Login.md` — docelowy kierunek auth + profile użytkowników.

## Ustalenia
1. Main używa globalnych nazw kolekcji/dokumentów (m.in. `chat_messages`, `player_access`, `admin_messages`, `UserGames`).
2. Przy podłączeniu modułu Second do tych samych nazw dane będą współdzielone, czyli:
   - wspólna lista graczy,
   - wspólny czat,
   - ryzyko mieszania uprawnień.
3. To nie spełnia wymogu niezależności Main i Second.

## Wniosek
**Tak — wymagana jest dodatkowa konfiguracja Firebase (nowe kolekcje lub namespace modułu).**

## Rekomendowana struktura dla Second
### Wariant A (prefiks kolekcji)
- `second_admin_messages`
- `second_chat_messages`
- `second_player_access`
- `second_UserGames` (lub `second_user_games`)

### Wariant B (namespace modułowy — preferowany długoterminowo)
- `modules/main/...`
- `modules/second/...`

Przykładowo:
- `modules/{moduleId}/admin/messages/{doc}`
- `modules/{moduleId}/chat/messages/{messageId}`
- `modules/{moduleId}/players/{playerId}`
- `modules/{moduleId}/userGames/{gameId}`

## Wpływ na reguły bezpieczeństwa
- Rules muszą sprawdzać dostęp per moduł (`moduleId`) i rolę użytkownika.
- Uprawnienia powinny być oddzielne dla Main/Second (np. osobne mapy `permissions.main` i `permissions.second` albo osobne profile modułowe).

## Wpływ na przyszły login/hasło
Zgodnie z kierunkiem z `Analizy/Projekt_Login.md` należy przewidzieć:
- profil użytkownika z atrybutem modułu lub profile per moduł,
- niezależne role/uprawnienia dla każdego modułu,
- brak współdzielenia rekordów czatu i graczy między modułami.

## Podsumowanie
Obecna struktura (jak w Main) nie gwarantuje izolacji danych między modułami. Aby uruchomić Second niezależnie, trzeba dodać nową konfigurację kolekcji (prefiksy lub namespace `modules/{moduleId}`) oraz dostosować Firestore Rules.
