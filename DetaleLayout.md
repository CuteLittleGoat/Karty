# DetaleLayout.md — aktualny stan UI

## Fonty
- `Cinzel`
- `Cormorant Garamond`
- `Inter`
- `Rajdhani`

## Kolory i styl
- Motyw: ciemny (noir) z akcentem złotym.
- Akcje główne: `primary`.
- Akcje pomocnicze: `secondary`.
- Akcje destrukcyjne: `danger` (czerwony).

## Układ
- Główny layout kartowy z sekcją admina i sekcją użytkownika.
- Kontener strony `.page` ma szerokość `min(1720px, 100%)`, dzięki czemu widok PC wypełnia prawie całe okno i nie jest już „wąsko” wyśrodkowany.
- Zewnętrzne marginesy wizualne na PC wynikają z wewnętrznego paddingu kontenera (`24px` po lewej i prawej).
- W układach z panelami bocznymi (np. `Lata / środek / Ranking` oraz `Sekcja / środek`) szerokość paneli bocznych pozostaje jak dotąd, a dodatkowa szerokość trafia do centralnej części z tabelami.
- W zakładkach z dużymi tabelami działa poziomy scroll (`.admin-table-scroll`).

## Modale szczegółów gier
- Modale:
  - `#gameDetailsModal`
  - `#userGameDetailsModal`
  - `#playerUserGameDetailsModal`
  - `#confirmationsDetailsModal` (tylko odczyt)
- Każdy modal szczegółów gry w sekcjach „Gry admina” i „Gry użytkowników” ma pasek meta: Nazwa, Rodzaj gry, Data, Pula, Ilość graczy.
- Tabele szczegółów posiadają kolumnę `LP` jako pierwszą kolumnę.

## Gry do potwierdzenia (strefa gracza)
- W akcjach wiersza są przyciski: `Potwierdź`, `Anuluj`, `Szczegóły`, `Notatki do gry`.
- Przycisk `Szczegóły` otwiera modal tylko do odczytu.

## Statystyki
- Waga `Waga7` nie występuje w tabelach statystyk.
- Sekwencja kolumn: `Ilość Spotkań`, `Waga2`, `% udział`, `Punkty`.

## Strefa gracza
- Górny pasek użytkownika zawiera 3 zakładki: `Aktualności`, `Regulamin`, `Strefa Gracza`.
- `Strefa Gracza` ma własną bramkę PIN (`#playerZonePinGate`).
- Po autoryzacji widoczny jest layout dwukolumnowy:
  - lewy panel boczny z nagłówkiem `Sekcja`,
  - prawa kolumna z aktywną sekcją.
- Przyciski w lewym panelu używają stylu `.admin-games-year-button` (spójnego wizualnie z panelami „Lata”).
- Sekcje `Najbliższa Gra`, `Czat`, `Gry do Potwierdzenia`, `Gry Użytkowników`, `Statystyki` są renderowane jako `.player-zone-panel` i przełączane klasą `.is-active`.


- Modale `Szczegóły gry` i `Szczegóły gry użytkownika` korzystają z klasy `.game-details-modal-card` (szerokość `min(1320px, 100%)`) dla lepszego wykorzystania szerokości ekranu PC.
- Przyciski sekcji w „Strefa Gracza” (`.player-zone-button`) mają responsywny font (`clamp`) i zagęszczane odstępy liter, co zapobiega wychodzeniu długich etykiet poza przycisk.

## Pola tekstowe „Aktualności” i „Regulamin"
- Pole `Treść wiadomości` w panelu administratora (`#adminMessageInput`) ma wysokość 25 linii.
- Pole `Najnowsze` w widoku użytkownika (`#latestMessageOutput`) ma wysokość 25 linii.
- Pole `Treść regulaminu` w panelu administratora (`#adminRulesInput`) ma wysokość 50 linii.
- Pole `Obowiązujące zasady` w widoku użytkownika (`#rulesOutput`) ma wysokość 50 linii.

## Kalkulator — panel „Rodzaj gry”
- Po lewej stronie kalkulatora znajduje się osobny panel boczny z nagłówkiem `Rodzaj gry`.
- Panel używa kontenera `.admin-calculator-sidebar` z takim samym stylem karty jak panele typu „Lata”.
- Wewnątrz panelu są dwa przyciski trybu: `Tournament` i `Cash` (`.admin-calculator-switch-button`).

## Kalkulator — widok „Cash”
- Po kliknięciu `Cash` po prawej stronie renderowane są tabele `Tabela7`, `Tabela8`, `Tabela9`, `Tabela10`.
- Tabele używają tego samego stylu co Tournament: `.admin-data-table`, `.admin-input`, `.admin-table-scroll`, `.admin-table-actions`.
- W `Tabela8` pierwszy nagłówek to `%` (pole procentowe), a drugi to `Rake` (pole tylko do odczytu wyliczane automatycznie z danych Tabela9 i wartości `%`).
- W nagłówku kolumny `Buy-In` w `Tabela9` znajduje się przycisk `Buy-In` w stylu `.secondary` do zbiorczego ustawiania wartości dla wszystkich wierszy.
- W `Tabela10` kolumna `% Puli` jest prezentowana jako procent zaokrąglony do pełnej liczby (bez miejsc po przecinku).

## Kalkulator — modal „Rebuy gracza”
- Modal otwierany z kolumny `Rebuy` w `Tabela2` (Tournament) oraz `Tabela9` (Cash).
- Widok startowy modala nie pokazuje żadnych kolumn rebuy.
- Kolumny są dodawane dynamicznie przyciskiem `Dodaj Rebuy`.
- Etykiety kolumn mają format `RebuyN` i używają globalnej numeracji wspólnej dla graczy tylko w obrębie aktualnego trybu (`Tournament` i `Cash` numerują niezależnie).
- Po usunięciu ostatniej kolumny u danego gracza etykiety kolejnych kolumn u innych graczy są automatycznie renumerowane.

## Kalkulator — Tabela5
- Na końcu tabeli znajduje się kolumna `Mod` z edytowalnym polem `.admin-input` (przyjmuje cyfry oraz opcjonalny znak `-` na początku) i minimalną szerokością `8ch`.
- Kolumna `Ranking` nie jest renderowana w Tabela5.
- Kolumna `Suma` uwzględnia ręczną korektę z `Mod`.
- Kolumny `Rebuy1..RebuyN` pokazują kwotę tylko w pojedynczym przypisanym wierszu `LP` według sekwencji cyklicznej z rosnącym zakresem (4, 5, 6, 7...).


## Modal „Notatki do gry”
- Modal `#summaryNotesModal` ma pasek kolorowania `.summary-notes-color-actions` umieszczony pod tytułem i nad polem tekstu.
- Przyciski kolorów: `#summaryNotesColorGold`, `#summaryNotesColorGreen`, `#summaryNotesColorRed`, `#summaryNotesColorWhite`.
- Pole edycji to `.summary-notes-editor` (contenteditable) z ciemnym tłem, obramowaniem w kolorze motywu i `white-space: pre-wrap`.
- Każdy przycisk koloru ma dedykowaną stylistykę zgodną z kolorem (złote, zielone, czerwone, jasne tło).
- W trybie odczytu (np. „Gry do Potwierdzenia”) modal pokazuje zapisane kolory tekstu bez możliwości edycji i ukrywa kontrolki edycji (przyciski kolorów, `Zapisz`, `Domyślne`).

- Lista `Gracz` w formularzach szczegółów gry i kalkulatora pokazuje wyłącznie dostępne osoby; po wybraniu gracza w jednym wierszu znika on z listy w pozostałych wierszach do czasu zwolnienia.

## Szerokości kolumn (aktualny stan)
- Wartości liczbowe z `Kolumny.md` są realizowane jako minimalne szerokości w znakach (`ch`).
- `Gracze`: `Nazwa` = `30ch`, `PIN` = `5ch`.
- Modale szczegółów gry (`Szczegóły gry` i `Szczegóły potwierdzeń`) mają minimalne szerokości kolumn zgodne z opisem: `LP 4ch`, `Gracz 25ch`, wartości liczbowe `8ch`, `Punkty 4ch`.
- Rozbudowana tabela statystyk i ranking mają minimalne szerokości na każdej kolumnie zgodnie z `Kolumny.md`.
- Tabele kalkulatora (Tournament i Cash) używają dedykowanych klas tabel i mają przypisane minimalne szerokości kolumn zgodnie z sekcją 6 w `Kolumny.md`.
- W modalu rebuy każda kolumna (`Rebuy 1`, `Rebuy 2`, kolejne) ma stałe `8ch`.

## Moduł Second — aktualny layout
- `Second/styles.css` pozostaje spójny wizualnie z `Main/styles.css` (te same fonty i system kolorów).
- Panel administratora w `Second` zawiera zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turniej`.
- Zakładki `Aktualności`, `Czat`, `Regulamin`, `Gracze` używają tych samych nagłówków i opisów treści co w `Main/index.html`.
- W zakładce `Aktualności` (admin) pole `Treść wiadomości` ma przycisk `Wyślij` w sekcji akcji.
- Widok użytkownika w `Second` ma zakładki: `Aktualności`, `Czat`, `Regulamin`, `Gracze`, `Turniej`, z opisami tekstowymi zgodnymi z `Main`.
- W trybie admin dolny panel podglądu użytkownika jest pełnoszerokowy (klasy `user-preview-card next-game-card`) i nie zawiera osobnego nagłówka, aby zachować taki sam start sekcji jak w widoku użytkownika i module `Main`.
- Zakładka `Turniej` (admin i user) ma układ podobny do sekcji „Gry użytkowników”: lewy panel boczny i środkową sekcję treści z napisem `Strona w budowie`.
- W lewym panelu `Turniej` są złote przyciski `Strona1` i `Strona2` (szkielet UI, bez akcji backendowych).
- W prawym górnym rogu nagłówka modułu `Second` znajduje się zielony przycisk `Instrukcja` (klasa `.secondary`, kontener `.admin-toolbar`), widoczny w trybie administratora i spójny z `Main/index.html`.


## Logowanie i sesja (Main + Second)
- Pierwszym widokiem jest centralny ekran `#loginScreen` z kartą `.login-card` (ten sam układ i treść w obu modułach).
- Karta logowania zawiera pola `E-mail` i `Hasło` (`.auth-field`) oraz przyciski `Zaloguj` (`.primary`) i `Utwórz konto` (`.secondary`).
- Po zalogowaniu `#loginScreen` jest ukrywany, a renderowany jest główny widok modułu (`#appShell` w Main, `#appRoot` w Second).
- W nagłówku po zalogowaniu działa pasek sesji `.auth-session-toolbar` z tekstem statusu `#authStatus` oraz przyciskami `Wyloguj` i `Reset hasła`.
- Elementy nagłówka związane z sesją są ukryte, gdy użytkownik nie jest zalogowany (`body` bez klasy `is-authenticated`).


## Logowanie / sesja
- W pasku sesji dodano dodatkowy komunikat z aktualnym loginem (`Zalogowany: ...`).
- Na karcie logowania dodano linkowy przycisk „Reset hasła”, który otwiera osobny blok formularza resetu.
- Dodano wizualny stan oczekiwania na zatwierdzenie oraz wyszarzenie niezatwierdzonych wierszy graczy.


## Układ paneli „Gry admina”
- W układzie 3-kolumnowym `#adminGamesTab .admin-games-layout` lewy panel `Lata` ma szerokość `200px`.
- Kolumna centralna pozostaje elastyczna (`minmax(0, 1fr)`).
- Prawy panel `Ranking` ma szerokość `300px`, aby ograniczyć konieczność przewijania tabeli rankingu.
