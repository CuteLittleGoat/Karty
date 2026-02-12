# Analiza kompletności `Kolumny.md` dla nowej zakładki „Statystyki”

## Prompt użytkownika
> „Niedawno dodałem zakładkę 'Statystyki'. Sprawdź czy zawartość pliku 'Kolumny.md' zawiera wszystkie aktualne dane.”

## Zakres analizy
Porównano:
- `Kolumny.md`
- aktualny markup tabel i kolumn w `Main/index.html`
- powiązane reguły stylów w `Main/styles.css`

## Wniosek końcowy
`Kolumny.md` **nie zawiera wszystkich aktualnych danych** po dodaniu zakładki „Statystyki”. Dokument jest częściowo aktualny (opisuje kolumny tabel statystyk), ale jest **niekompletny strukturalnie** względem bieżącego UI.

## Co jest zgodne
1. Opis kolumn tabeli statystyk graczy (`.admin-games-players-stats-table`) odpowiada aktualnym nagłówkom:
   - Gracz, Mistrzostwo, Waga1, Ilość Spotkań, % udział, Waga2, Punkty, Waga3, (+/-), Waga4, Wypłata, Waga5, Wpłaty, Waga6, Suma z rozegranych gier, % Wszystkich gier, Waga7, % Rozegranych gier, Wynik.
2. Informacja o `min-width: 2300px` dla `.admin-games-players-stats-table` jest zgodna z CSS.
3. Opis tabeli „Opis / Wartość” jest zgodny z obecnym UI.

## Braki / rozjazdy w `Kolumny.md`
1. Brak sekcji dla **Panel Administratora → Zakładka „Statystyki”** (`#adminStatisticsTab`).
   - W UI ta zakładka istnieje jako osobna sekcja administratora.
   - W `Kolumny.md` opis statystyk jest przypisany tylko do „Gry admina”, co nie odzwierciedla faktycznego podziału zakładek.

2. Brak sekcji dla **Strefa gracza → Zakładka „Statystyki”** (`#statsTab`).
   - Zakładka istnieje i zawiera te same dwie tabele statystyk, ale dokument jej nie wymienia.

3. Brak informacji o elementach sterujących widocznością kolumn w statystykach:
   - `.stats-column-header`
   - `.stats-column-visibility-checkbox` (16x16)
   To wpływa na realne zachowanie i „formatowanie kolumn” (kolumny mogą być ukrywane/pokazywane).

## Rekomendowane uzupełnienie `Kolumny.md`
1. Dodać nową sekcję:
   - „Panel Administratora → Zakładka ‘Statystyki’”
   - z dwiema tabelami: „Opis/Wartość” i „Tabela statystyk graczy”.

2. Dodać nową sekcję:
   - „Strefa gracza → Zakładka ‘Statystyki’”
   - z analogicznym opisem obu tabel.

3. Dodać podsekcję „Sterowanie widocznością kolumn statystyk” z parametrami:
   - kontener nagłówka: `.stats-column-header` (flex, align center, space-between, gap 8px)
   - checkbox: `.stats-column-visibility-checkbox` (16x16).

4. W podsumowaniu praktycznym dopisać, że tabela statystyk graczy występuje obecnie w **trzech obszarach UI**:
   - Gry admina,
   - Statystyki (admin),
   - Statystyki (strefa gracza).
