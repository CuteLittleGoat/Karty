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

## Kalkulator — panel „Rodzaj gry”
- Po lewej stronie kalkulatora znajduje się osobny panel boczny z nagłówkiem `Rodzaj gry`.
- Panel używa kontenera `.admin-calculator-sidebar` z takim samym stylem karty jak panele typu „Lata”.
- Wewnątrz panelu są dwa przyciski trybu: `Tournament` i `Cash` (`.admin-calculator-switch-button`).

## Kalkulator — widok „Cash”
- Po kliknięciu `Cash` po prawej stronie renderowane są tabele `Tabela7`, `Tabela8`, `Tabela9`, `Tabela10`.
- Tabele używają tego samego stylu co Tournament: `.admin-data-table`, `.admin-input`, `.admin-table-scroll`, `.admin-table-actions`.
- W `Tabela8` pierwszy nagłówek to `%` (pole procentowe), a drugi to `Rake` (pole liczbowe kwoty).
- W nagłówku kolumny `Buy-In` w `Tabela9` znajduje się przycisk `Buy-In` w stylu `.secondary` do zbiorczego ustawiania wartości dla wszystkich wierszy.
- W `Tabela10` kolumna `% Puli` jest prezentowana jako procent zaokrąglony do pełnej liczby (bez miejsc po przecinku).

## Kalkulator — modal „Rebuy gracza”
- Modal otwierany z kolumny `Rebuy` w `Tabela2` (Tournament) oraz `Tabela9` (Cash).
- Widok startowy modala nie pokazuje żadnych kolumn rebuy.
- Kolumny są dodawane dynamicznie przyciskiem `Dodaj Rebuy`.
- Etykiety kolumn mają format `RebuyN` i używają globalnej numeracji wspólnej dla graczy tylko w obrębie aktualnego trybu (`Tournament` i `Cash` numerują niezależnie).
- Po usunięciu ostatniej kolumny u danego gracza etykiety kolejnych kolumn u innych graczy są automatycznie renumerowane.

## Kalkulator — Tabela5
- Na końcu tabeli znajduje się kolumna `Mod` z edytowalnym polem `.admin-input` (przyjmuje cyfry oraz opcjonalny znak `-` na początku).
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

