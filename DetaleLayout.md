# Detale layoutu — aktualny stan

## Moduł Second — Tournament of Poker
- Sekcja `Losowanie graczy` ma układ metadanych w siatce `.t-section-grid` oraz tabelę `players-table`.
- W polu `RAKE` usunięto statyczny znak `%` pod inputem; podgląd wartości procentowej jest generowany dynamicznie na podstawie wpisanej liczby (np. `12%`).
- Kolumna `PIN` używa kontrolki `.pin-control`:
  - pole wejściowe ma poszerzoną szerokość (`8ch`, min. `8ch`, max. `9ch`), aby mieścić pełne 5 cyfr PIN z zapasem wizualnym,
  - obok pola znajduje się przycisk `Losuj` (`.admin-pin-random`).
- Kolumna `Uprawnienia` prezentuje bieżące uprawnienia jako badge (`.permissions-tags`, `.permission-badge`) i zawiera przycisk `Edytuj` (`.admin-permissions-edit`).
- Ostatnia kolumna `Akcje` zawiera przycisk `Usuń` (`.admin-row-delete`) wyrównany do prawej strony.
- Nad tabelą prezentowany jest licznik liczby graczy (tekst informacyjny `.builder-info`).
- Wiersze statusu nadal używają wskaźnika kołowego `.status-radio`.

- Przyciski dodawania w module `Second` (Dodaj gracza / Dodaj stół / Dodaj / Dodaj nowy stół) mają klasę `.t-inline-add-button` i są wyrównane do lewej (`justify-self: flex-start`) z naturalną szerokością (`width: auto`) zamiast pełnej szerokości kontenera.
- Czerwone przyciski testowe w sekcji `Finał` pozostają bez zmian kolorystycznych i rozmiarowych.

- Sekcja `Losowanie stołów` pokazuje status płatności jako etykietę `.payment-status-label` oraz przycisk `Zmień status` w kontenerze `.payment-status-cell`.
  - `Do zapłaty` ma styl `.is-unpaid` (czerwony).
  - `Opłacone` ma styl `.is-paid` (złoty, glow jak aktywna zakładka).
- W `Losowanie stołów` usunięto górny zbiorczy blok `Nazwa` + `Łączna Suma`; nagłówki `Nazwa` i `Łączna Suma` występują teraz wyłącznie wewnątrz każdego dodanego bloku stołu.
- W `Faza grupowa` dodano tabelę `Tabela17A` (`LP`, `Gracz`, `Stack`, `%`, `Stół`).
- W `Półfinał` usunięto `Tabela20`, a w tabelach tworzonych po `Dodaj nowy stół` dodano kolumnę `Stack` przed `Eliminated`.
- Kontrolka statusu aktywności gracza (`.status-radio`) ma pełny obszar kliknięcia 20x20 px, z ukrytym inputem rozciągniętym na cały element, co poprawia klikalność.

## Moduł Main — panel Ranking (Gry admina i Statystyki)
- Tabela rankingu ma zawsze trzy kolumny widoczne jednocześnie: `Miejsce`, `Gracz`, `Wynik` (bez poziomego przewijania panelu rankingu), również w węższych szerokościach mobilnych.
- Wysokość wiersza rankingu jest taka sama jak standardowa wysokość innych wierszy paneli admina (`--admin-games-panel-item-height`).
- Nagłówek kolumny `Gracz` jest wyśrodkowany (tylko nagłówek), aby nie nachodził wizualnie na `Miejsce`.
- Kolumna `Gracz` pozwala na zawijanie nazw (`white-space: normal` + `overflow-wrap: anywhere`), więc bardzo długa nazwa może przejść do dwóch linii.
- Gdy nazwa gracza zawinie się, tylko ten konkretny wiersz zwiększa wysokość pionowo; pozostałe wiersze zachowują standardową wysokość.
