# Detale layoutu — aktualny stan (Main)

## Tabele
- Wszystkie tabele korzystają z klasy `.admin-data-table` i są osadzone w kontenerze `.admin-table-scroll`.
- Kontener tabel ma:
  - `overflow: auto` (jednoczesne przewijanie poziome i pionowe),
  - `max-height: min(72vh, 760px)`,
  - cienkie paski przewijania.
- Tabele mają:
  - `width: max-content`,
  - `min-width: 100%`,
  - osobno zdefiniowane szerokości kolumn per typ tabeli (opisane w `Kolumny.md`).
- Kolumny w tabelach operacyjnych są ustawione na `white-space: nowrap`, żeby wartości liczbowe i przyciski nie łamały się przypadkowo.

## Responsywność tabel
- Na desktopie: pełna szerokość sekcji + przewijanie tylko gdy zawartość przekracza dostępne miejsce.
- Na mobile: zachowana czytelność przez stałe, przewidywalne szerokości kolumn i przewijanie wewnątrz sekcji tabeli.
- Nie zmieniano szerokości paneli bocznych (`Lata`, `Ranking`).

## Spójność wizualna
- Nagłówki tabel: kapitaliki, panelowy krój pisma, kontrastowe tło.
- Wiersze: hover i naprzemienne tło w tabeli statystyk graczy.
- Kontrolki (input/select/button) zachowują istniejący styl neon/gold.

## Fonty i motyw
- Fonty pozostają bez zmian: `Inter`, `Rajdhani`, `Cinzel`, `Cormorant Garamond`.
- Paleta kolorów i efekty (`--gold`, `--border2`, glow) pozostają bez zmian.
