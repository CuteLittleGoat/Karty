# Detale layoutu — aktualny stan

- W widoku użytkownika (Main i Second) zewnętrzna zielona ramka głównej karty ma dokładnie 1 px na lewej i prawej krawędzi oraz jest rozciągnięta od 1 px od lewej krawędzi ekranu do 1 px od prawej.
- Efekt uzyskano przez pełną szerokość kontenera `.page` w trybie użytkownika (`calc(100% - 2px)`, `padding-inline: 1px`) oraz wyłączenie wewnętrznej pseudo-ramki `.user-card::before`.
- W obu modułach (`Main` i `Second`) czerwony przycisk akcji awaryjnej (`button.danger`) „Przycisnąć w razie kontroli celno-skarbowej” znajduje się w prawym górnym pasku (`.admin-toolbar`), więc jest widoczny zarówno dla użytkownika, jak i administratora.
- W obu modułach modal z GIF-em `Koza.gif` został zachowany, ale bez nagłówka tekstowego; obraz korzysta z klas `.customs-emergency-modal-body` i `.customs-emergency-image` (wycentrowanie, ograniczenie szerokości i wysokości, `object-fit: contain`, zaokrąglenie i obramowanie).
## System szerokości tabel (Main i Second)
- Szerokości kolumn opisuje skala 9 tokenów `--col-*` w `:root` obu arkuszy; szczegóły i przypisanie kolumn są w `Kolumny.md`.
- Wszystkie tabele mają `table-layout: fixed`, a szerokości deklaruje `<colgroup>` przed `<thead>`.
- Tryby tabel: `t-fluid` (wypełnia kontener, `min-width: var(--table-min)`), `t-compact` (`width: var(--table-min)`), `is-table-stacked` (poniżej 560 px wiersz staje się kartą).
- `.admin-data-table .admin-input` ma `min-width: 0`; bez tego pole narzuca komórce własną szerokość naturalną ok. 213 px i szerokość z `<colgroup>` jest ignorowana.
- Nagłówki tabel są przyklejone do góry (`position: sticky; top: 0`) i mogą zawijać się w dwie linie; wartości w komórkach są obcinane wielokropkiem.
- Na mobile (`max-width: 720px`) odstęp liter w nagłówkach spada do `0.04em`, a paddingi komórek do `8px 6px`.

## Breakpointy i budżet szerokości
- `max-width: 1180px` — układy `.admin-games-layout` (w tym `#adminGamesTab`, `#adminStatisticsTab`, `#statisticsTab`) przechodzą na jedną kolumnę. Próg dobrany tak, aby kolumna z treścią nigdy nie była węższa od pasków bocznych.
- `max-width: 720px` — mobilna skala tokenów oraz zmniejszone paddingi: `.page` `20px 10px 48px`, `.card` `14px`, `.admin-games-sidebar` i `.admin-games-content` `10px`. Na ekranie 375 px daje to tabeli 303 px zamiast 259 px.
- `max-width: 560px` — układ kartowy `is-table-stacked`.
- `pointer: coarse` — przyciski wierszowe, zakładki i przyciski akcji mają co najmniej 40 px wysokości.
- `.user-tab-content > *` i `.admin-panel-content > *` mają `max-width: var(--content-max)` (1680 px) i są wyśrodkowane; karta nadal sięga krawędzi ekranu, ograniczana jest tylko treść w środku.
- Przyciski menu bocznego (`.player-zone-button`) mają `font-size: clamp(11px, 1.1vw, 14px)`.

## Rozpoznanie widoku użytkownika w module Second
- Second nie ustawia klasy `body.is-admin`, dlatego reguły pełnej szerokości karty opierają się na selektorze `.page:has(.user-card)`, a nie na `body:not(.is-admin)`.
- Dzięki temu panel administratora respektuje `width: min(1720px, 100%)`, a widok użytkownika zachowuje ramkę 1 px od krawędzi ekranu.

## Moduł Second — Tournament of Poker
- W nagłówku modułu `Second` tytuł główny brzmi **Tournament of Poker**, a po prawej stronie widoczna jest ta sama ikona `Pliki/Ikona.png` co w module `Main`, ustawiona po lewej stronie przycisku **Instrukcja** (układ poziomy w `.header-controls`).
- Sekcja `Lista graczy` ma układ metadanych w siatce `.t-section-grid` oraz tabelę `players-table`.
- W sekcji `Lista graczy` nad siatką metadanych dodano czerwony przycisk destrukcyjny **Wyzeruj Rebuy** (wariant `button.danger`) do globalnego resetu wszystkich wpisów `RebuyX`.
- W polu `RAKE` zastosowano format procentowy jak w module Main: użytkownik wpisuje liczbę, a kontrolka wyświetla wartość z dopisanym `%` (np. `12%`) bez dodatkowego pomocniczego `<small>`.
- Kolumna `PIN` używa kontrolki `.pin-control`: pole wejściowe wypełnia komórkę, a obok niego stoi przycisk `Losuj` (`.admin-pin-random`). Kolumna ma token `--col-text-md`, żeby pole i przycisk zmieściły się obok siebie.
- Kolumna `Uprawnienia` prezentuje bieżące uprawnienia jako badge (`.permissions-tags`, `.permission-badge`) i zawiera przycisk `Edytuj` (`.admin-permissions-edit`).
- Przycisk `Edytuj` w kolumnie `Uprawnienia` otwiera modal `Uprawnienia gracza` (`#secondPlayerPermissionsModal`) o wyglądzie spójnym z modalami modułu Main (nagłówek, przycisk zamknięcia `✕`, overlay, karta `modal-card-sm`).
- W modalu lista `.permissions-list` zawiera uprawnienia `Czat`, `Losowanie stołów`, `Wpłaty`, `Podział Puli`, `Faza Grupowa`, `Półfinał`, `Finał`, `Wypłaty`; zaznaczenie opcji steruje widocznością odpowiednich paneli użytkownika.
- W widoku użytkownika modułu `Second` nad zakładkami działa dodatkowa bramka `.pin-gate.user-access-pin-gate`; po poprawnym PIN odblokowuje wejście do `TOURNAMENT OF POKER` bez zmiany layoutu całej karty.
- W panelu bocznym `TOURNAMENT OF POKER` (admin i user) przycisk `Czat` jest umieszczony jako ostatni element listy sekcji.
- Ostatnia kolumna `Akcje` zawiera przycisk `Usuń` (`.admin-row-delete`) wyrównany do prawej strony.
- W sekcji `Losowanie stołów` przycisk usuwania stołu ma klasy `.admin-row-delete.draw-table-delete`: zachowuje kompaktowy rozmiar i jest dosunięty do prawej krawędzi bloku stołu (`justify-self: end`).
- Nad tabelą prezentowany jest licznik liczby graczy (tekst informacyjny `.builder-info`).
- Wiersze statusu w `Lista graczy` używają przycisku-pigułki `.payment-status-toggle` z ukrytym inputem oraz etykietą statusu wewnątrz przycisku; wariant jest kompaktowy, aby pasował proporcją do pozostałych kontrolek.

- Przyciski dodawania w module `Second` (Dodaj gracza / Dodaj stół / Dodaj / Dodaj nowy stół) mają klasę `.t-inline-add-button` i są wyrównane do lewej (`justify-self: flex-start`) z naturalną szerokością (`width: auto`) zamiast pełnej szerokości kontenera.
- Czerwone przyciski testowe w sekcji `Finał` pozostają bez zmian kolorystycznych i rozmiarowych.

- Sekcja `Losowanie stołów` pokazuje status płatności jako nieklikalną pigułkę `.payment-status-label` (bez przycisku zmiany) w kontenerze `.payment-status-cell`.
  - `Do zapłaty` ma styl `.is-unpaid` (jasnoróżowy napis + czerwonawa obwódka).
  - `Opłacone` ma styl `.is-paid` (złoty napis + złota obwódka + glow).
- W `Losowanie stołów` usunięto górny zbiorczy blok `Nazwa` + `Łączna Suma`; nagłówki `Nazwa` i `Łączna Suma` występują teraz wyłącznie wewnątrz każdego dodanego bloku stołu.
- W panelu `Wpłaty` (`Tabela12`) oraz `Faza grupowa` (`Tabela19`) zastosowano zebra striping per grupa stołu: wszystkie kolejne wiersze tego samego stołu mają wspólne tło, a następny stół przełącza kolor na naprzemienny wariant (`.t-group-stripe-even` / `.t-group-stripe-odd`).
- W `Faza grupowa` tabele `Tabela19A` i `Tabela19B` korzystają ze standardowych pól `.admin-input`, a dynamiczne przenoszenie graczy między tabelami zależy od checkboxa `ELIMINATED` w `Tabela19`.
- W `Tabela19A` dodano kolumnę `POZYCJA` z poziomym kontenerem `.group-position-controls`; przyciski `▲/▼` używają stylu `button.secondary` oraz pomocniczej klasy `.group-position-button`, która utrzymuje kompaktową szerokość zgodną z resztą aplikacji.
- W `Półfinał` usunięto `Tabela20`, a w tabelach tworzonych po `Dodaj nowy stół` dodano kolumnę `Stack` przed `Eliminated`.
- W panelu `Półfinał` kolumna `STACK` w `Tabela21` jest readonly (klasa `.t-stack-input` odpowiada już tylko za wyrównanie do prawej; szerokość bierze się z `<colgroup>`), a kolumna `STACK` w `Tabela FINAŁOWA` jest edytowalna, akceptuje wyłącznie cyfry (`type="text"`, `inputmode="numeric"`, `pattern="[0-9]*"`) i ma domyślną wartość `0`.
- Kontrolka statusu płatności gracza (`.payment-status-toggle`) ma pełny obszar kliknięcia obejmujący całą pigułkę, z ukrytym inputem rozciągniętym na cały element.

## Moduł Main — modale „Szczegóły gry” (Gry admina i Gry użytkowników)
- W modalach `#gameDetailsModal`, `#userGameDetailsModal`, `#playerUserGameDetailsModal` usunięto osobny nagłówek tekstowy „Szczegóły gry” / „Szczegóły gry użytkownika”.
- Linia metadanych gry (`Nazwa | Rodzaj gry | Data | Pula | Ilość graczy`) została przeniesiona do pierwszej linii nagłówka obok przycisku `×`, co wizualnie powiększa obszar tabeli danych.
- Dla linii metadanych używana jest klasa `.game-details-meta` (`margin: 0`, `flex: 1`, `min-width: 0`, jaśniejszy kolor tekstu), aby tekst poprawnie współdzielił przestrzeń z przyciskiem zamknięcia.

## Moduł Main — panel Ranking (Gry admina, Statystyki i widok gracza)
- Tabela rankingu ma trzy kolumny: `Miejsce`, `Gracz`, `Wynik` i używa `table-layout: fixed`.
- Kolumna `Gracz` jest kolumną elastyczną (`<col>` bez szerokości), a dłuższe nazwy są obcinane z wielokropkiem. Tabela rankingu nie ma `--table-min`, bo panel boczny bywa węższy od sumy tokenów — dzięki temu mieści się bez poziomego przewijania.
- Wysokość wiersza rankingu pozostaje zgodna z `--admin-games-panel-item-height`.
- W widoku gracza (`Statystyki`) na desktopie panel `Ranking` jest po prawej stronie tabeli statystyk (osobna kolumna `34ch`), a na mobile wraca pod tabelę statystyk.
- Dla telefonów w orientacji poziomej (`orientation: landscape`, `hover: none`, `pointer: coarse`, `max-height: 500px`) układ `.admin-games-layout` jest wymuszony do jednej kolumny, żeby panele `Lata` i `Ranking` układały się pionowo.

## Modale i tabele – aktualne zasady
- Modal `Rebuy gracza` w module Second używa układu `modal-header` + `modal-body` identycznego jak w Main, wraz z tymi samymi proporcjami sekcji tabeli i akcji.
- W modalu `Rebuy gracza` (Second) pod nagłówkiem renderowany jest komunikat statusu `.builder-info` dla błędów zapisu (pokazywany warunkowo tylko przy problemach z zapisem).
- W module Second nagłówki tabel są prezentowane uppercase, z wyjątkiem dynamicznych nagłówków stołów w `Tabela18`.
- Ostrzeżenia walidacyjne i dystrybucji rebuy w module Second używają czerwonego stylu (`.t-warning`).
- W panelu `Podział puli` (Second) tabela `Tabela16` renderuje dynamiczną liczbę kolumn `REBUY` (równą liczbie uzupełnionych pól `Rebuy` w modalach graczy), przypisane komórki `REBUY1..REBUY30` są readonly i wyświetlają wartości z tych modali.
- `Tabela16` (`.tournament-pool-table16`) buduje `<colgroup>` z tej samej pętli co nagłówki, więc liczba kolumn `REBUY` i `MOD` nie rozjeżdża szerokości; pola `.admin-input` wypełniają komórkę.
- Pozycjonowanie kolumn `MOD1..MOD3` w `Tabela16` jest dynamiczne i zależne od liczby widocznych kolumn `REBUY`.
- W obu modułach (`Main`, `Second`) kontener `.player-zone-layout` rozszerza sekcję z ciemno-zielonymi panelami na pełną szerokość wnętrza karty (1 px luzu od lewej i prawej krawędzi zewnętrznej ramki).
- Przyciski nawigacyjne sekcji `Strefa Gracza` (`.player-zone-button`) skalują font przez `clamp(11px, 1.1vw, 14px)`, więc pozostają czytelne także na tablecie.

- Tabela rebuy gracza w modalu (`#adminCalculatorRebuyTable`) ma `width: max-content` i kolumny o szerokości `--col-num-sm`, bo ich liczba jest zmienna.

## Main — Kalkulator: nowe sekcje Organizacja i Żetony
- Sidebar kalkulatora zawiera dodatkowe przyciski trybów: `Organizacja`, `Żetony cash1`, `Żetony cash2`, `Żetony tournament1`, `Żetony tournament2`.
- Nowe tabele korzystają ze standardowego stylu `admin-data-table` i pól `admin-input` (spójność wizualna z resztą Main).
- W `Organizacja` (`TABELA1`) drugi wiersz pozostawia kolumny `ORGANIZACJA` i `POT` bez pól wejściowych; aktywne pole edycji znajduje się tam wyłącznie w kolumnie `KALKULATOR`.
- Przyciski akcji w wierszach (`Dodaj`, `Usuń`) korzystają z istniejących klas `secondary` i `danger admin-row-delete`.
- Puste wrappery sekcji kalkulatora (`.admin-calculator-table-wrap`) są ukrywane regułą `:empty`, dlatego niewykorzystane sloty pod `TABELA2` i `TABELAC` nie tworzą już zielonych pasów w UI.

- W panelu `Finał` usunięto wizualizację stołu (`.poker-table-svg`); sekcja pokazuje `Tabela23` oraz `Tabela23A` z przyciskami pozycji `▲/▼`.
- W module `Second`, w widoku użytkownika dla `#tournamentTab` na mobile (`max-width: 760px`), layout Tournament wymusza jedną kolumnę (`minmax(0,1fr)`), pełną szerokość sidebara i lokalne przewijanie szerokich tabel; etykiety przycisków sekcji pozostają widoczne bez przełączania na `Czat`.

## Main — lista kolejności potwierdzeń i import gier
- Sekcja `Kolejność potwierdzeń` w modalu `#confirmationsDetailsModal` używa nagłówka `.confirmations-order-title` (`margin: 16px 0 0`, `font-size: 15px`, kolor `--muted`) oraz tabeli `.confirmations-order-table`.
- Pierwsza kolumna tabeli (`Nr`) ma szerokość `5ch` i wyrównanie do środka.
- Granica między miejscami w grze a listą rezerwową to klasa `.confirmations-reserve-start` — `border-top: 2px solid var(--gold-line)` na komórkach wiersza.
- Wiersz zalogowanego gracza jest wyróżniony klasą `.confirmations-own-row` (`font-weight: 700`).
- Podsumowanie nad listą (`#confirmationsOrderSummary`) korzysta ze standardowej klasy `.status-text`.
- Data ostatniego odświeżenia przy grze zaimportowanej używa klasy `.admin-import-refreshed-at` (`display: block`, `width: 100%`, `margin-top: 4px`, `font-size: 12px`) w obrębie `.admin-games-name-control`.

## Main — zakładka „Kopia zapasowa”
- Sekcja `.admin-backup` powiela wygląd `.admin-rules`: `margin-top: var(--gap-3)`, `padding: 16px`, `border-radius: var(--radius-md)`, obramowanie `--border2`, tło `rgba(0, 0, 0, 0.32)`, układ `grid` z odstępem `10px`.
- Etykiety (`.admin-backup label`) mają `font-size: 12px`, wersaliki i `letter-spacing: 0.08em` w kolorze `--muted`.
- Przyciski leżą w `.admin-backup-actions` (`flex`, zawijanie, odstęp `--gap-2`); każdy przycisk wraz z informacją o dacie ostatniego użycia tworzy `.admin-backup-action` (`grid`, odstęp `4px`).
- Pole instrukcji to `textarea` tylko do odczytu z krojem monospace (`13px`, interlinia `1.55`, `opacity: 0.9`, `cursor: default`), co odróżnia je wizualnie od pól edytowalnych.
