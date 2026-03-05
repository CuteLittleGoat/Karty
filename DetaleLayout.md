# Detale layoutu — aktualny stan

## Moduł Second — Tournament of Poker
- Sekcja `Losowanie graczy` ma układ metadanych w siatce `.t-section-grid` oraz tabelę `players-table`.
- W polu `RAKE` usunięto statyczny znak `%` pod inputem; podgląd wartości procentowej jest generowany dynamicznie na podstawie wpisanej liczby (np. `12%`).
- Kolumna `PIN` używa kontrolki `.pin-control`:
  - pole wejściowe ma stałą szerokość 5 znaków,
  - obok pola znajduje się przycisk `Losuj` (`.admin-pin-random`).
- Kolumna `Uprawnienia` prezentuje bieżące uprawnienia jako badge (`.permissions-tags`, `.permission-badge`) i zawiera przycisk `Edytuj` (`.admin-permissions-edit`).
- Ostatnia kolumna `Akcje` zawiera przycisk `Usuń` (`.admin-row-delete`) wyrównany do prawej strony.
- Nad tabelą prezentowany jest licznik liczby graczy (tekst informacyjny `.builder-info`).
- Wiersze statusu nadal używają wskaźnika kołowego `.status-radio`.

- Przyciski dodawania w module `Second` (Dodaj gracza / Dodaj stół / Dodaj / Dodaj nowy stół) mają klasę `.t-inline-add-button` i są wyrównane do lewej (`justify-self: flex-start`) z naturalną szerokością (`width: auto`) zamiast pełnej szerokości kontenera.
- Czerwone przyciski testowe w sekcji `Finał` pozostają bez zmian kolorystycznych i rozmiarowych.
