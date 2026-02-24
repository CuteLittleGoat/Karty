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
- W zakładkach z dużymi tabelami działa poziomy scroll (`.admin-table-scroll`).

## Modale szczegółów gier
- Modale:
  - `#gameDetailsModal`
  - `#userGameDetailsModal`
  - `#playerUserGameDetailsModal`
  - `#confirmationsDetailsModal` (tylko odczyt)
- Każdy modal ma pasek meta ze stanem gry: Nazwa, Rodzaj gry, Data, Pula.
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
- Sekcje `Najbliższa Gra`, `Plan Wieczoru`, `Czat`, `Gry do Potwierdzenia`, `Gry Użytkowników`, `Statystyki` są renderowane jako `.player-zone-panel` i przełączane klasą `.is-active`.


## Kalkulator — panel „Rodzaj gry”
- Po lewej stronie kalkulatora znajduje się osobny panel boczny z nagłówkiem `Rodzaj gry`.
- Panel używa kontenera `.admin-calculator-sidebar` z takim samym stylem karty jak panele typu „Lata”.
- Wewnątrz panelu są dwa przyciski trybu: `Tournament` i `Cash` (`.admin-calculator-switch-button`).

## Kalkulator — modal „Rebuy gracza”
- Modal otwierany z kolumny `Rebuy` w `Tabela2`.
- Widok startowy modala nie pokazuje żadnych kolumn rebuy.
- Kolumny są dodawane dynamicznie przyciskiem `Dodaj Rebuy`.
- Etykiety kolumn mają format `RebuyN` i używają globalnej numeracji wspólnej dla wszystkich graczy (niezależnie od tego, dla którego gracza modal jest otwarty).
- Po usunięciu ostatniej kolumny u danego gracza etykiety kolejnych kolumn u innych graczy są automatycznie renumerowane.

## Kalkulator — Tabela5
- Na końcu tabeli znajduje się kolumna `Mod` z edytowalnym polem `.admin-input` (przyjmuje cyfry oraz opcjonalny znak `-` na początku).
- Kolumna `Ranking` nie jest renderowana w Tabela5.
- Kolumna `Suma` uwzględnia ręczną korektę z `Mod`.
- Kolumny `Rebuy1..RebuyN` pokazują kwotę tylko w pojedynczym przypisanym wierszu `LP` według sekwencji cyklicznej z rosnącym zakresem (4, 5, 6, 7...).


## Plan wieczoru
- Zakładka admina: `adminEveningPlanTab` z edytorem `.admin-plan-editor` (contenteditable) i paskiem przycisków kolorów.
- Przyciski kolorów: `Złoty`, `Zielony`, `Czerwony`, `Biały` (mapowane do kolorów motywu: `--gold`, `--neon`, `--ruby2`, `--ink`) i renderowane z odpowiadającym im tłem przycisku (złote, zielone, czerwone, jasne/białe).
- Zakładka gracza: `eveningPlanTab` z bramką PIN (`#eveningPlanPinGate`) i widokiem tylko do odczytu `.evening-plan-output`.
- Edytor i widok planu używają `white-space: pre-wrap`, dzięki czemu zachowują podziały linii wpisane przez admina.


## Modal „Notatki do gry”
- Modal `#summaryNotesModal` ma pasek kolorowania `.summary-notes-color-actions` umieszczony pod tytułem i nad polem tekstu.
- Przyciski kolorów: `#summaryNotesColorGold`, `#summaryNotesColorGreen`, `#summaryNotesColorRed`, `#summaryNotesColorWhite`.
- Pole edycji to `.summary-notes-editor` (contenteditable) ze stylami jak dla edytora planu wieczoru: ciemne tło, obramowanie w kolorze motywu, `white-space: pre-wrap`.
- Każdy przycisk koloru ma tę samą stylistykę co odpowiednik z „Planu wieczoru” (złote, zielone, czerwone, jasne tło).
- W trybie odczytu (np. „Gry do Potwierdzenia”) modal pokazuje zapisane kolory tekstu bez możliwości edycji.
