# Detale layoutu — aktualny stan

- W widoku użytkownika (Main i Second) zewnętrzna zielona ramka głównej karty ma dokładnie 1 px na lewej i prawej krawędzi oraz jest rozciągnięta od 1 px od lewej krawędzi ekranu do 1 px od prawej.
- Efekt uzyskano przez pełną szerokość kontenera `.page` w trybie użytkownika (`calc(100% - 2px)`, `padding-inline: 1px`) oraz wyłączenie wewnętrznej pseudo-ramki `.user-card::before`.
## Moduł Second — Tournament of Poker
- W nagłówku modułu `Second` po prawej stronie widoczna jest ta sama ikona `Pliki/Ikona.png` co w module `Main`, ustawiona po lewej stronie przycisku **Instrukcja** (układ poziomy w `.header-controls`).
- Sekcja `Losowanie graczy` ma układ metadanych w siatce `.t-section-grid` oraz tabelę `players-table`.
- W polu `RAKE` zastosowano format procentowy jak w module Main: użytkownik wpisuje liczbę, a kontrolka wyświetla wartość z dopisanym `%` (np. `12%`) bez dodatkowego pomocniczego `<small>`.
- Kolumna `PIN` używa kontrolki `.pin-control`:
  - pole wejściowe ma poszerzoną szerokość (`8ch`, min. `8ch`, max. `9ch`), aby mieścić pełne 5 cyfr PIN z zapasem wizualnym,
  - obok pola znajduje się przycisk `Losuj` (`.admin-pin-random`).
- Kolumna `Uprawnienia` prezentuje bieżące uprawnienia jako badge (`.permissions-tags`, `.permission-badge`) i zawiera przycisk `Edytuj` (`.admin-permissions-edit`).
- Przycisk `Edytuj` w kolumnie `Uprawnienia` otwiera modal `Uprawnienia gracza` (`#secondPlayerPermissionsModal`) o wyglądzie spójnym z modalami modułu Main (nagłówek, przycisk zamknięcia `✕`, overlay, karta `modal-card-sm`).
- W modalu lista `.permissions-list` zawiera uprawnienie `Czat`; zaznaczenie tej opcji nadaje graczowi możliwość odblokowania zakładki Czat PIN-em.
- Ostatnia kolumna `Akcje` zawiera przycisk `Usuń` (`.admin-row-delete`) wyrównany do prawej strony.
- W sekcji `Losowanie stołów` przycisk usuwania stołu ma klasy `.admin-row-delete.draw-table-delete`: zachowuje kompaktowy rozmiar i jest dosunięty do prawej krawędzi bloku stołu (`justify-self: end`).
- Nad tabelą prezentowany jest licznik liczby graczy (tekst informacyjny `.builder-info`).
- Wiersze statusu w `Losowanie graczy` używają przycisku-pigułki `.payment-status-toggle` z ukrytym inputem oraz etykietą statusu wewnątrz przycisku; wariant jest kompaktowy, aby pasował proporcją do pozostałych kontrolek.

- Przyciski dodawania w module `Second` (Dodaj gracza / Dodaj stół / Dodaj / Dodaj nowy stół) mają klasę `.t-inline-add-button` i są wyrównane do lewej (`justify-self: flex-start`) z naturalną szerokością (`width: auto`) zamiast pełnej szerokości kontenera.
- Czerwone przyciski testowe w sekcji `Finał` pozostają bez zmian kolorystycznych i rozmiarowych.

- Sekcja `Losowanie stołów` pokazuje status płatności jako nieklikalną pigułkę `.payment-status-label` (bez przycisku zmiany) w kontenerze `.payment-status-cell`.
  - `Do zapłaty` ma styl `.is-unpaid` (jasnoróżowy napis + czerwonawa obwódka).
  - `Opłacone` ma styl `.is-paid` (złoty napis + złota obwódka + glow).
- W `Losowanie stołów` usunięto górny zbiorczy blok `Nazwa` + `Łączna Suma`; nagłówki `Nazwa` i `Łączna Suma` występują teraz wyłącznie wewnątrz każdego dodanego bloku stołu.
- W `Faza grupowa` dodano tabelę `Tabela17A` (`LP`, `Gracz`, `Stack`, `%`, `Stół`).
- W `Półfinał` usunięto `Tabela20`, a w tabelach tworzonych po `Dodaj nowy stół` dodano kolumnę `Stack` przed `Eliminated`.
- Kontrolka statusu płatności gracza (`.payment-status-toggle`) ma pełny obszar kliknięcia obejmujący całą pigułkę, z ukrytym inputem rozciągniętym na cały element.

## Moduł Main — panel Ranking (Gry admina, Statystyki i widok gracza)
- Tabela rankingu ma trzy kolumny: `Miejsce`, `Gracz`, `Wynik` i używa `table-layout: fixed`.
- Kolumna `Gracz` ma stałą szerokość `13ch`; nagłówek i wartości są wyrównane do lewej, a dłuższe nazwy są obcinane z wielokropkiem (`white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`).
- Dzięki skróceniu kolumny `Gracz` cała tabela rankingu mieści się w panelu bez poziomego przewijania w `Gry admina` i `Statystyki`.
- Wysokość wiersza rankingu pozostaje zgodna z `--admin-games-panel-item-height`.
- W widoku gracza (`Statystyki`) na desktopie panel `Ranking` jest po prawej stronie tabeli statystyk (osobna kolumna `34ch`), a na mobile wraca pod tabelę statystyk.

## Modale i tabele – aktualne zasady
- Modal `Rebuy gracza` w module Second używa układu `modal-header` + `modal-body` identycznego jak w Main, wraz z tymi samymi proporcjami sekcji tabeli i akcji.
- W modalu `Rebuy gracza` (Second) pod nagłówkiem renderowany jest komunikat statusu `.builder-info` dla błędów zapisu (pokazywany warunkowo tylko przy problemach z zapisem).
- W module Second nagłówki tabel są prezentowane uppercase, z wyjątkiem dynamicznych nagłówków stołów w `Tabela18`.
- Ostrzeżenia walidacyjne i dystrybucji rebuy w module Second używają czerwonego stylu (`.t-warning`).
- W panelu `Podział puli` (Second) tabela `Tabela16` renderuje dynamiczną liczbę kolumn `REBUY` (równą liczbie uzupełnionych pól `Rebuy` w modalach graczy), przypisane komórki `REBUY1..REBUY30` są readonly i wyświetlają wartości z tych modali.
- Pozycjonowanie kolumn `MOD1..MOD3` w `Tabela16` jest dynamiczne i zależne od liczby widocznych kolumn `REBUY`.
- W obu modułach (`Main`, `Second`) kontener `.player-zone-layout` rozszerza sekcję z ciemno-zielonymi panelami na pełną szerokość wnętrza karty (1 px luzu od lewej i prawej krawędzi zewnętrznej ramki).
- W module `Main` na mobile (`max-width: 720px`) przyciski nawigacyjne sekcji `Strefa Gracza` (`.player-zone-button`) mają większy font (`14px`) i ciaśniej kontrolowany odstęp liter (`0.12em`) dla lepszej czytelności.

- Tabela rebuy gracza w modalu (`#adminCalculatorRebuyTable`) ma takie same reguły jak w Main: `width:auto`, `min-width:0`, `table-layout:fixed` oraz stałą szerokość kolumn `8ch`.
