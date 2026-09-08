# Analiza: szerokości kolumn i pól formularzy — responsywność (telefon / PC)

Data: 2026-09-08
Zakres: `Main/styles.css`, `Main/index.html`, `Main/app.js`, `Second/styles.css`, `Second/index.html`, `Second/app.js`, `Kolumny.md`, `DetaleLayout.md`, `Main/docs/*`, `Second/docs/*`
Charakter: **analiza — bez zmian w kodzie aplikacji.**
Wizualizacja: `Analizy/Wizualizacja.html` — interaktywne porównania „przed/po" na żywych demach (nie zrzutach), z symulatorem szerokości ekranu.

---

## 1. Prompt użytkownika

> Zapoznaj się z pełnym kodem repo. Nic nie modyfikuj. Przeprowadź analizę i zapisz jej wyniki w folderze Analizy/
>
> Sprawdź dokładnie jak działają szerokości kolumn i pól do uzupełnienia przez użytkownika. Obecnie większość chyba ma na sztywno przypisane szerokości. Metodą prób i błędów próbowałem to jakoś ustawić. Efekt nie jest idealny.
> Zależy mi na tym, żeby aplikacja dobrze wyglądała zarówno na telefonie jak i na PC. Ma być przejrzysta i wygodna do używania. Przeprowadź pełną analizę jak poprawić ten aspekt. Nic nie zmieniamy w samej zasadzie działaniach - skupiamy się tylko na wyglądzie. Zaproponuj zmiany i plan wdrożenia.

---

## 2. Metoda

Analiza nie opiera się wyłącznie na czytaniu CSS. Oba moduły zostały **realnie wyrenderowane w przeglądarce Chromium** (Playwright, `deviceScaleFactor: 1`, zasoby zewnętrzne zablokowane) przy szerokościach viewportu **375 / 412 / 820 / 1440 / 1920 / 2560 px**. Zmierzono:

- rzeczywistą szerokość każdej widocznej tabeli i jej kontenera przewijania,
- rzeczywistą szerokość każdej kolumny,
- pełny łańcuch kontenerów (padding / margin / border) od `body` do tabeli,
- rzeczywistą wartość jednostki `ch` w nagłówku (`th`) i w komórce (`td`),
- naturalną („intrinsic”) szerokość pola `.admin-input`,
- realnie wyliczone `grid-template-columns` układu `.admin-games-layout`.

Wszystkie liczby w tym dokumencie są **wynikami pomiaru**, nie szacunkami.

Kluczowe pomiary zostały dodatkowo odtworzone jako **żywe dema** w `Analizy/Wizualizacja.html`: obie wersje CSS (obecna i proponowana) renderują się tam obok siebie na tej samej treści, a liczby pod nimi wylicza skrypt z faktycznego layoutu w momencie otwarcia strony. Dzięki temu wyników nie da się rozjechać z rzeczywistością przy późniejszych zmianach.

---

## 3. Jak to działa dziś

### 3.1 Dwa moduły — dwie przeciwstawne filozofie

Choć ok. **86 % obu arkuszy jest identyczne** (1824 wspólnych linii przy 2122 / 2142 linii), kluczowa reguła tabel rozjechała się w przeciwnych kierunkach:

| | `Main/styles.css` | `Second/styles.css` |
|---|---|---|
| `.admin-data-table` | `width: max-content`<br>`min-width: 100%`<br>`table-layout: auto` | `width: 100%`<br>`min-width: 860px` |
| Efekt | tabela **rozdyma się do treści** | tabela **ma zawsze ≥ 860 px** |
| Jednostka szerokości kolumn | `rem` (80 deklaracji), `ch` (17) | `ch` (30), `px` (26), `rem` (0) |
| Reguły `th/td:nth-child(n)` | **172** | **148** |
| Liczba różnych wartości szerokości kolumn | 17 (3.5–22 rem) | 10 (3–30 ch) |

Razem: **320 ręcznie dobranych reguł szerokości** i **27 różnych wartości** tam, gdzie wystarczyłoby 6–8 tokenów.

### 3.2 Mechanika w module Main

`table-layout: auto` + `width: max-content` oznacza: *„policz najszerszą możliwą treść i taką daj szerokość”*. Deklaracje `width`/`min-width` na `th:nth-child(n)`/`td:nth-child(n)` są tylko **dolnym progiem** — kolumna rośnie dalej, jeśli treść tego wymaga, i rozciąga się ponad zadaną wartość, gdy kontener jest szeroki.

Zmierzone sumy zadeklarowanych szerokości kolumn:

| Tabela (Main) | Kolumn | Suma zadeklarowana | Zmierzona szerokość realna |
|---|---:|---:|---:|
| `admin-games-players-stats-table` | 18 | 2224 px | **2419 px** |
| `game-details-table` | 9 | 1192 px | — |
| `admin-games-table` (+`admin-user-games-table`) | 6 | 1072 px | **1106 / 1319 px** |
| `confirmations-details-table` | 8 | 1032 px | — |
| `players-table` | 5 | 976 px | **986 px** |
| `confirmations-table` | 5 | 936 px | — |
| `admin-calculator-cash-table9` | 6 | 880 px | — |
| `admin-calculator-table2` | 5 | 672 px | **850 px** |
| `admin-calculator-cash-table10` | 5 | 656 px | — |
| `admin-calculator-table1` | 4 | 512 px | **512 px** |
| `admin-calculator-table5` | 4 | 464 px | **693 px** |
| `admin-games-ranking-table` | 3 | 223 px | 259–305 px |

Realna szerokość regularnie **przekracza** zadeklarowaną (np. `admin-calculator-table5`: 464 → 693 px, +49 %). To jest bezpośrednia przyczyna wrażenia „ustawiam wartość, a i tak wychodzi inaczej”.

### 3.3 Mechanika w module Second

`min-width: 860px` na **wszystkich 45 wystąpieniach tabel** (poza `players-table` i `tournament-pool-table16`). Tabele Second są budowane w `app.js` jako czysty `<table class="admin-data-table">` — bez klasy per-tabela. Skutek zmierzony:

| Szerokość ekranu | TABELA15 (2 kolumny: BUY-IN, PODZIAŁ) |
|---|---|
| 375 px | tabela **860 px** w kontenerze 287 px → przewijanie +573 px |
| 820 px | tabela **860 px** w kontenerze 496 px → przewijanie +364 px |
| 1440 px | tabela **1116 px**, kolumny 558 + 558 px |
| 1920 px | tabela **1596 px**, kolumny **798 + 798 px** |

Dwie liczby („1000” i „250”) zajmują na monitorze 1920 px pasmo o szerokości 1596 px. To najbardziej rzucający się w oczy defekt wizualny modułu Second.

### 3.4 Pola do uzupełnienia (`.admin-input`)

`.admin-input { width: 100%; padding: 10px 12px; font-size: 14.5px }` — brak atrybutu `size` w całym repozytorium (0 wystąpień), więc przeglądarka używa domyślnego `size=20`.

**Zmierzona naturalna szerokość `.admin-input` = 213 px.**

W tabeli o `table-layout: auto` **bez jawnych szerokości kolumn** ta wartość steruje szerokością kolumny. Pomiar w kontenerze 320 px, tabela 6-kolumnowa z polami `.admin-input`:

| Wariant | Szerokość tabeli | Szerokość kolumny |
|---|---:|---:|
| Main, stan obecny | **1374 px** | **229 px** każda |
| Second, stan obecny | 860 px (ucięte przez `min-width`) | 131–150 px |
| `table-layout: fixed` + `.admin-input { min-width: 0 }` | **320 px** | **53 px** każda |

To jest **główna, ukryta przyczyna problemu**: każda komórka z polem edycyjnym ma niewidoczny „bezpiecznik” 229 px. Dlatego:

- w `Tabela16` (Second) trzeba było ręcznie obejść problem: `table-layout: fixed` + `.admin-input { width: calc(4ch + 24px) }`,
- w Main trzeba było punktowo dopisać `min-width: 0` dla trzech tabel (`admin-games-players-stats-table`, `admin-calculator-table2`, `admin-calculator-cash-table9`),
- w `#adminCalculatorRebuyTable` i `.game-details-rebuy-table` trzeba było zrobić osobny wariant `width/min-width/max-width: 8ch` + `table-layout: fixed`.

To nie są cztery różne problemy — to **cztery obejścia tej samej przyczyny**.

Analogicznie zachowuje się `<select class="admin-input">`: jego naturalna szerokość wynika z **najdłuższej opcji**. Pomiar (kontener 320 px, opcja „Bardzo Dlugie Imie Gracza XYZ”): w Second kolumna `GRACZ` urosła do **707 px**. Dodanie długiego nazwiska gracza potrafi więc samo z siebie rozjechać layout.

### 3.5 Jednostka `ch` daje dwie różne wartości w tej samej kolumnie

`th` ma `font-family: var(--font-panel); font-size: 12px`, `td` dziedziczy `var(--font-text)` w `14.5px`. Jednostka `ch` zależy od fontu elementu.

**Pomiar: `10ch` w `<th>` = 67 px, `10ch` w `<td>` = 81 px — różnica 21 %.**

Zapis `min-width: 8ch` na parze `th, td` tworzy więc dwa różne progi (53,6 px i 64,8 px); wygrywa większy. Autor pisze „8 znaków”, dostaje 65 px, czyli ~9,7 znaku w foncie nagłówka. **Przy 30 deklaracjach `ch` w Second i 17 w Main to systematyczne, niekontrolowane rozjeżdżanie się wartości** — i wprost tłumaczy, dlaczego metoda prób i błędów nie zbiegała do dobrego wyniku.

### 3.6 Budżet szerokości na telefonie

Zmierzony łańcuch kontenerów, Main, viewport **375 px**, zakładka „Gry admina”:

```
375 px  body
375 px  .page                      padding 16 + 16
343 px  main.grid
343 px  .card                      padding 24 + 24, border 1 + 1
293 px  .admin-panel-content
293 px  .admin-games-layout
293 px  .admin-games-content       padding 16 + 16, border 1 + 1
259 px  .admin-games-section
259 px  .admin-table-scroll   <-- realne miejsce na tabelę
```

**116 z 375 px (31 % ekranu telefonu) zjadają zagnieżdżone paddingi i ramki.** Żadna z tych wartości nie jest zmniejszana w media query — `.card` ma 24 px paddingu tak samo na monitorze 27" jak na iPhonie SE.

### 3.7 Układ trójkolumnowy załamuje się na tablecie

`#adminGamesTab .admin-games-layout { grid-template-columns: 20ch minmax(0, 1fr) 42ch }` przełącza się na jedną kolumnę dopiero przy `max-width: 720px`. Zmierzone realne `grid-template-columns`:

| Viewport | Lata | **Treść (tabele)** | Ranking |
|---|---:|---:|---:|
| 820 px | 161 px | **190 px** | 339 px |
| 1440 px | 161 px | **810 px** | 339 px |

Na tablecie i małym laptopie (721–~1100 px) **kolumna z właściwą treścią jest węższa niż każdy z pasków bocznych**. Tabela `admin-games-table` (1106 px) przewija się poziomo w oknie 190 px. To najpoważniejszy defekt strukturalny w Main — i nie widać go ani na telefonie, ani na dużym monitorze, więc łatwo go przeoczyć przy testowaniu „na oko”.

Dodatkowo `.player-zone-button { font-size: clamp(9px, 0.95vw, 12px) }`: przy 820 px `0.95vw = 7,8px` → clamp daje **9 px**. Zmierzone. Etykiety sekcji na tablecie są praktycznie nieczytelne. Nadpisanie do 14 px istnieje tylko poniżej 720 px.

### 3.8 Rozmiary elementów dotykowych (zmierzone)

| Element | Rozmiar | Font |
|---|---|---|
| `button.primary` | 92 × **41** px | 13,3 px |
| `.admin-input` | — × **38** px | 14,5 px |
| `.tab-button`, `.admin-panel-tab` | 141 × **32** px | 12 px |
| `.admin-row-delete` | 62 × **30** px | 11 px |
| `.admin-pin-random`, `.admin-permissions-edit`, `.admin-chat-delete` | ~62 × 30 px | 11 px |

Rekomendowane minimum dla dotyku to 44 × 44 px. Przycisk „Usuń” w wierszu tabeli (30 px, font 11 px) jest jednocześnie najmniejszym i najbardziej destrukcyjnym elementem interfejsu.

---

## 4. Diagnoza — lista problemów

| # | Problem | Przyczyna | Wpływ |
|---|---|---|---|
| P1 | Tabele Second zawsze ≥ 860 px | `.admin-data-table { min-width: 860px }` dla 45 tabel | 🔴 telefon + PC |
| P2 | Kolumny z polami mają ukryte minimum 229 px | brak `min-width: 0` na `.admin-input` przy `table-layout: auto` | 🔴 telefon |
| P3 | `Xch` znaczy co innego w `th` i w `td` (21 % różnicy) | `ch` zależy od fontu; `th` = Rajdhani 12 px, `td` = Inter 14,5 px | 🔴 sterowalność |
| P4 | Kolumna treści węższa od pasków bocznych na tablecie (190 px) | trójkolumnowa siatka aktywna od 721 px | 🔴 tablet/laptop |
| P5 | 31 % szerokości telefonu zjadają paddingi | `.card` 24 px, `.admin-games-content` 16 px — brak wariantu mobilnego | 🔴 telefon |
| P6 | Zadeklarowana szerokość ≠ realna (do +49 %) | `width: max-content` + `table-layout: auto` | 🟠 sterowalność |
| P7 | 320 reguł `nth-child`, 27 różnych wartości, 2 różne jednostki | brak skali/tokenów | 🟠 utrzymanie |
| P8 | Font 9 px w bocznym menu na tablecie | `clamp(9px, 0.95vw, 12px)` | 🟠 czytelność |
| P9 | Elementy dotykowe 30–32 px | `padding: 8px 12px`, `font-size: 11px` | 🟠 wygoda |
| P10 | Widok użytkownika bez ograniczenia szerokości (2558 px na monitorze 2560 px) | `body:not(.is-admin) .page { max-width: none }` | 🟠 PC |
| P11 | Panel admina w Second też bez ograniczenia | `body.is-admin` **nigdy nie jest ustawiane** w `Second/app.js` | 🟠 PC |
| P12 | `width: calc(100% + 46px); margin-inline: -23px` | magiczna liczba sprzężona z `padding: 24px` karty | 🟡 kruchość |
| P13 | 86 martwych klas CSS w Second (45 % wszystkich) | pozostałości po module Main | 🟡 utrzymanie |
| P14 | Dokumentacja opisuje stan nieistniejący w kodzie | rozjazd docs ↔ CSS | 🟡 zaufanie do docs |

### Uszczegółowienie P11, P13, P14

**P11.** `Second/app.js` (`bootstrap`, ok. linii 4217–4237) rozgałęzia widok przez `setupAdminView` / `setupUserOnlyView`, ale **nigdy nie wywołuje `document.body.classList.add("is-admin")`** (w `Main/app.js` robi to linia 9928). W efekcie 15 reguł CSS w `Second/styles.css` opartych na `body:not(.is-admin)` stosuje się także do panelu administratora. Zmierzone: `.page` = **2558 px** przy viewporcie 2560 px, zamiast `min(1720px, 100%)`.

**P13.** 86 z 190 klas w `Second/styles.css` nie występuje w `Second/index.html` ani `Second/app.js` — m.in. cały blok kalkulatora (`admin-calculator-table1..5`, `admin-calculator-cash-table7..10`), `admin-games-players-stats-table`, `admin-games-ranking-table`, `confirmations-table`, `confirmations-details-table`, `game-details-table`, `player-zone-button`, `player-zone-layout`, `game-details-rebuy-table`. Znaczna część **148 reguł `nth-child`** w Second dotyczy tabel, których w tym module nie ma. Szukając „dlaczego kolumna ma taką szerokość” trafia się więc na reguły, które nic nie robią.

**P14.** Przykłady rozjazdu:
- `Main/docs/Documentation.md` (l. 49): „`.admin-user-games-table` … poszerza kolumnę `Nazwa` do `440px` i podnosi minimalną szerokość tabeli do `1340px`” — w `Main/styles.css` **nie ma** ani `440px`, ani `1340px` dla tej klasy; klasa ustawia wyłącznie `white-space: nowrap`.
- `DetaleLayout.md`: opis ramki widoku użytkownika odwołuje się do `.user-card` i `.user-card::before`; **`Main` nie używa klasy `user-card` w ogóle** (0 wystąpień) — reguła jest martwa, pseudo-ramka `.card::before` pozostaje aktywna.
- `Main/docs/Documentation.md` (l. 42): `.admin-weight-bulk-button` „stabilizuje szerokość kolumn wag” — nie stabilizuje, bo kolumny mają jawne `width: 8rem` (128 px), a przycisk ma `8ch` (~49 px).

---

## 5. Proponowany model docelowy

Zasada: **jedna skala szerokości, jedna reguła tabeli, dwa tryby tabeli.** Zero zmian w logice, danych i zachowaniu pól.

### 5.1 Skala tokenów (zamiast 27 wartości w 2 jednostkach)

Wyłącznie `rem` — jednostka niezależna od fontu komórki, więc `th` i `td` dają tę samą liczbę pikseli (usuwa P3).

```css
:root {
  --col-num-xs:  3.5rem;  /*  56px  LP, Nr, %, licznik            */
  --col-num-sm:  5rem;    /*  80px  krótkie liczby, wagi          */
  --col-num-md:  6.5rem;  /* 104px  kwoty, stack, wynik           */
  --col-flag:    5.5rem;  /*  88px  checkbox, Tak/Nie, status     */
  --col-date:    7.5rem;  /* 120px  data                          */
  --col-text-sm: 9rem;    /* 144px  rodzaj gry, status tekstowy   */
  --col-text-md: 12rem;   /* 192px  nazwa gracza                  */
  --col-text-lg: 16rem;   /* 256px  nazwa gry + akcje             */
  --col-actions: 7rem;    /* 112px  przyciski w wierszu           */
}

@media (max-width: 720px) {
  :root {
    --col-num-xs:  3rem;    --col-num-sm:  4rem;   --col-num-md:  5.5rem;
    --col-flag:    4.5rem;  --col-date:    6.5rem; --col-text-sm: 7.5rem;
    --col-text-md: 10rem;   --col-text-lg: 12rem;  --col-actions: 6rem;
  }
}
```

Jedna zmiana tokenu przestraja wszystkie tabele obu modułów. Skala mobilna (~‑20 %) działa automatycznie, bez duplikowania 320 reguł.

### 5.2 Dwa tryby tabeli

Dwa tryby poniżej to **czysty CSS** i wystarczają dla całej aplikacji. Trzeci, opcjonalny tryb (`is-table-stacked`, rozdz. 5.9) wymaga drobnej zmiany w markupie i jest przeznaczony wyłącznie dla list tylko do odczytu w widoku gracza na telefonie.

```css
.admin-data-table {
  border-collapse: collapse;
  table-layout: fixed;          /* deklarowana szerokość = szerokość realna */
}

/* Tabela danych – wypełnia kontener, przewija się gdy za wąsko */
.admin-data-table.t-fluid {
  width: 100%;
  min-width: var(--table-min, 0);
}

/* Tabela podsumowania (2–4 kolumny) – tylko tyle, ile trzeba */
.admin-data-table.t-compact {
  width: auto;
  max-width: 100%;
  min-width: 0;
}

/* Kluczowa jedna linia – usuwa ukryte minimum 229 px (P2) */
.admin-data-table .admin-input,
.admin-data-table select.admin-input { min-width: 0; }

.admin-data-table th,
.admin-data-table td { overflow: hidden; text-overflow: ellipsis; }
```

Szerokości kolumn deklarowane raz, w `<colgroup>`, zamiast w parach `th:nth-child(n)` + `td:nth-child(n)`:

```html
<colgroup>
  <col style="width: var(--col-num-xs)">
  <col style="width: var(--col-text-md)">
  <col style="width: var(--col-num-md)">
</colgroup>
```

`--table-min` to suma tokenów danej tabeli, ustawiana raz na `<table>`:

```html
<table class="admin-data-table t-fluid"
       style="--table-min: calc(var(--col-num-xs) + var(--col-text-md) + var(--col-num-md))">
```

### 5.3 Weryfikacja prototypu

Model został **zbudowany i zmierzony** na żywym `Main/styles.css`:

| Przypadek | 375 px | 1440 px |
|---|---|---|
| Tabela 5-kol. z polami (`t-fluid`), kontener 340 px | tabela **464 px**, kolumny 48/160/88/72/96 | tabela 552 px, kolumny 56/192/104/88/112 |
| Tabela 2-kol. podsumowania (`t-compact`), kontener 1400 px | **176 px** | **208 px** |
| Tabela 3-kol. `t-fluid`, kontener 1400 px | 1400 px (rozciąga się proporcjonalnie) | 1400 px |

Wnioski z prototypu:
- kolumny trzymają zadeklarowane wartości **co do piksela** — znika rozjazd „ustawiam X, dostaję X+49 %”;
- na telefonie pozioma nawigacja spada z ~700 px do ~124 px przewinięcia;
- `t-compact` rozwiązuje problem P1 (2 kolumny × 798 px) sprowadzając tabelę do 208 px;
- **uwaga:** `t-fluid` rozdziela nadmiar miejsca proporcjonalnie do tokenów. Dla tabel, które nie powinny wypełniać bardzo szerokiego kontenera, należy dodać `max-width: var(--table-max)` albo użyć `t-compact`. To świadomy wybór per tabela, nie efekt uboczny.

#### Pomiary z żywych dem (`Analizy/Wizualizacja.html`)

Model zweryfikowano powtórnie już jako działającą stronę. Liczby poniżej odczytano z realnego layoutu:

| Przypadek | Dziś | Po zmianie |
|---|---|---|
| `Tabela16`: 6 kolumn z polami, kontener 320 px | 1374 px, kolumny **6 × 229 px**, przewijanie **+1072 px** | 368 px, kolumny **48 / 5 × 64 px**, przewijanie **+66 px** |
| `TABELA15`: 2 kolumny podsumowania, kontener pełnej szerokości | 860 px, kolumny **390 + 470 px** | 176 px, kolumny **88 + 88 px** |
| `Gracze`: 5 kolumn, dwa pola, ekran 375 px | 751 px, przewijanie **+394 px** | 640 px, przewijanie **+283 px** |
| `Gracze`: ten sam układ, ekran 820 px i szerzej | mieści się | mieści się (bez różnicy) |

Dwa wnioski, które ujawniły się dopiero na działającej stronie:

1. **Sześciu kolumn liczbowych nie da się zmieścić na telefonie** i żadna skala tokenów tego nie zmieni — 6 × 64 px to 368 px przy dostępnych ~300 px. Zysk jest realny (przewijanie z 1072 px na 66 px), ale to nadal przewijanie, nie „mieści się".
2. **Powyżej ~820 px oba warianty dają ten sam wynik** dla tabel o 5 kolumnach. Cała wartość zmiany leży w zakresie 320–800 px oraz w przewidywalności szerokości, a nie w wyglądzie na dużym monitorze. Wyjątkiem jest moduł Second, gdzie `t-compact` poprawia wygląd właśnie na dużych ekranach (1596 px → 208 px).

### 5.4 Odzyskanie szerokości na telefonie (P5)

```css
@media (max-width: 720px) {
  .page { padding: 20px 10px 48px; }        /* było 24px 16px 60px  → +12 px */
  .card { padding: 14px; }                  /* było 24px            → +20 px */
  .admin-games-sidebar,
  .admin-games-content { padding: 10px; }   /* było 16px            → +12 px */
  .admin-data-table th,
  .admin-data-table td { padding: 8px 6px; }
}
```

Budżet 375 px: dziś tabela dostaje 259 px → po zmianie **303 px (+17 %)**, bez ruszania samych kolumn.

### 5.5 Naprawa breakpointu tabletu (P4)

```css
/* trójkolumnowo dopiero gdy jest na to miejsce */
@media (max-width: 1180px) {
  #adminGamesTab .admin-games-layout,
  #adminStatisticsTab .admin-games-layout,
  #statisticsTab .admin-games-layout { grid-template-columns: 1fr; }
}
```

Docelowo warto zamienić stałe `20ch`/`42ch`/`34ch` na `minmax()` z górnym limitem, np. `minmax(12rem, 14rem) minmax(0, 1fr) minmax(16rem, 20rem)` — wtedy paski boczne nigdy nie wygrywają z treścią.

Równolegle: `.player-zone-button { font-size: clamp(11px, 1.1vw, 14px) }` zamiast minimum 9 px (P8).

### 5.6 Elementy dotykowe (P9)

```css
@media (pointer: coarse) {
  .admin-row-delete,
  .admin-pin-random,
  .admin-permissions-edit,
  .admin-chat-delete,
  .group-position-button { min-height: 40px; padding-inline: 14px; font-size: 12px; }
  .tab-button, .admin-panel-tab { min-height: 40px; }
}
```

Zmiana dotyczy wyłącznie urządzeń dotykowych — wygląd na PC bez zmian.

### 5.7 Czytelność (bez zmian funkcjonalnych)

```css
.admin-table-scroll { max-height: min(72vh, 760px); }   /* także w Second */
.admin-data-table thead th { position: sticky; top: 0; z-index: 1; }
```

Przyklejony nagłówek to jedna z najbardziej odczuwalnych poprawek „przejrzystości” przy długich listach (`Tabela12`, `Tabela19`, statystyki graczy) — a nie zmienia niczego w działaniu.

### 5.8 Ograniczenie szerokości na dużych monitorach (P10, P11)

Wymaganie z `DetaleLayout.md` (ramka 1 px od krawędzi ekranu) zostaje zachowane — ograniczamy **treść wewnątrz karty**, nie samą kartę:

```css
.user-tab-content,
.admin-panel-content { --content-max: 1680px; }
.user-tab-content > *,
.admin-panel-content > * { max-width: var(--content-max); margin-inline: auto; }
```

Dla P11 (Second) dwie możliwości:
- **A (CSS-only, zero zmian w JS):** zamienić selektor `body:not(.is-admin) .page` na `.page:has(> main > .user-card)` — Second nadaje `user-card` wyłącznie w szablonie użytkownika. `:has()` jest wspierane we wszystkich aktualnych przeglądarkach.
- **B (1 linia JS):** dopisać `document.body.classList.toggle("is-admin", isAdminView)` w `bootstrap()`, analogicznie do `Main/app.js:9928`. Czysto prezentacyjne, ale jest to zmiana w `app.js`.

Rekomendacja: **A** — spełnia warunek „zmieniamy tylko wygląd” dosłownie, bez dotykania JS.

### 5.9 Opcjonalnie: układ kartowy na telefonie (`is-table-stacked`)

Skala tokenów rozwiązuje problem szerokości, ale nie zmienia faktu, że **tabela o sześciu kolumnach nie zmieści się na ekranie 375 px** — zmierzone dema (rozdz. 5.3) pokazują to jednoznacznie. Dla list, które gracz najczęściej otwiera na telefonie, alternatywą jest porzucenie układu tabelarycznego i pokazanie każdego wiersza jako karty „etykieta → wartość".

```css
@media (max-width: 560px) {
  .admin-data-table.is-table-stacked,
  .admin-data-table.is-table-stacked tbody,
  .admin-data-table.is-table-stacked tr,
  .admin-data-table.is-table-stacked td { display: block; width: 100%; }

  .admin-data-table.is-table-stacked thead { display: none; }

  .admin-data-table.is-table-stacked tr {
    margin-bottom: 10px; padding: 10px;
    border: 1px solid var(--border2); border-radius: var(--radius-sm);
    background: rgba(0, 0, 0, .24);
  }

  .admin-data-table.is-table-stacked td {
    display: grid; grid-template-columns: 11ch minmax(0, 1fr);
    gap: 10px; align-items: center; border: 0; padding: 5px 0;
    white-space: normal; overflow: visible;
  }

  .admin-data-table.is-table-stacked td::before {
    content: attr(data-label);
    font-family: var(--font-panel); font-size: 11px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted);
  }
}
```

**Koszt: jeden atrybut w markupie.** Każda komórka musi dostać `data-label="NAZWA KOLUMNY"`, bo nagłówek tabeli znika. To jedyna propozycja w całym dokumencie, która wychodzi poza CSS — dlatego jest opcjonalna i wydzielona do osobnego etapu. Atrybut jest czysto prezentacyjny: nie zmienia struktury wiersza, liczby komórek, obsługi zdarzeń ani żadnego `data-role` / `data-focus-target`.

**Gdzie ma sens** — wyłącznie listy **tylko do odczytu** w widoku gracza, czyli te, które ogląda się na telefonie i których się nie edytuje:

| Moduł | Tabela |
|---|---|
| Main | `Gry do Potwierdzenia`, `Kolejność potwierdzeń`, `Najbliższa gra`, `Statystyki` (widok gracza) |
| Second | `Tabela12` (Wpłaty, widok gracza), `Tabela19`, `Tabela21`, `Tabela23`, `Tabela24` (Wypłaty) |

**Gdzie nie ma sensu:**
- tabele edytowalne w panelu admina — utrata wyrównania kolumn utrudnia wpisywanie serii wartości w jednej kolumnie;
- szerokie siatki liczbowe (`admin-games-players-stats-table`, `Tabela16`) — 18 kart na wiersz jest gorsze niż przewijanie;
- tabele podsumowania w trybie `t-compact` — one i tak już się mieszczą.

Tryb wyklucza się z `table-layout: fixed` i `<colgroup>` (przy `display: block` są ignorowane), ale tylko poniżej 560 px — powyżej tego progu tabela wraca do normalnego zachowania i tokenów.

**Zweryfikowane pomiarem** na `Tabela12` (5 kolumn, 2 wiersze), reguły powyżej nałożone na żywy `Main/styles.css`:

| Szerokość ekranu | Szerokość tabeli | Przewijanie w poziomie | Nagłówek `thead` | Etykieta z `data-label` |
|---|---|---|---|---|
| 375 px | 375 px | **0 px** | ukryty | renderuje się |
| 820 px | 820 px | 0 px | widoczny | nieaktywna |

Czyli: na telefonie lista mieści się w całości bez nawigacji w bok, a powyżej progu wygląda dokładnie tak, jak dziś.

---

## 6. Mapowanie kolumn na tokeny

### 6.1 Main

| Tabela | Kolumny → tokeny | Suma | Tryb |
|---|---|---:|---|
| `players-table` | Aplikacja `--col-flag`, Nazwa `--col-text-md`, PIN `--col-text-sm`, Uprawnienia `--col-text-lg`, Akcje `--col-actions` | 792 px | `t-fluid` |
| `admin-games-table` | Rodzaj `--col-text-sm`, Data `--col-date`, Nazwa `--col-text-lg`, Zamknięta `--col-flag`, Potwierdzeni `--col-num-md`, Akcje `--col-actions` | 824 px | `t-fluid` |
| `admin-user-games-table` | jw. + Liczba miejsc `--col-num-sm` | 904 px | `t-fluid` |
| `admin-games-ranking-table` | Miejsce `--col-num-xs`, Gracz `--col-text-md`, Wynik `--col-num-sm` | **bez `--table-min`** ¹ | `t-fluid` |
| `admin-games-players-stats-table` | Gracz `--col-text-md`, 11 × `--col-num-sm`, 6 × `--col-num-xs` | 1408 px | `t-fluid` |
| `confirmations-table` | Nr `--col-num-xs`, Gracz `--col-text-md`, Status `--col-text-sm`, Akcje 2 × `--col-actions` | 616 px | `t-fluid` |
| `confirmations-details-table` | Nr `--col-num-xs`, Gracz `--col-text-md`, 6 × `--col-num-sm` | 728 px | `t-fluid` |
| `confirmations-order-table` | Nr `--col-num-xs`, Gracz `--col-text-md`, Status `--col-text-sm` | 392 px | `t-fluid` |
| `game-details-table` | Nr `--col-num-xs`, Gracz `--col-text-md`, 6 × `--col-num-sm`, ostatnia `--col-num-md` | 832 px | `t-fluid` |
| `admin-calculator-table1` | 4 × `--col-num-md` | 416 px | `t-compact` |
| `admin-calculator-table2` | LP `--col-num-xs`, Nazwa `--col-text-md`, 2 × `--col-num-md`, Akcje `--col-actions` | 568 px | `t-fluid` |
| `admin-calculator-table3/4`, `cash-table7/8` | wszystkie `--col-num-md` | — | `t-compact` |
| `admin-calculator-table5` | LP `--col-num-xs`, 2 × `--col-num-md`, Rebuy n × `--col-num-sm`, ost. `--col-num-md` | dynamiczna | `t-fluid` |
| `admin-calculator-cash-table9` | Nazwa `--col-text-md`, 4 × `--col-num-md`, ost. `--col-num-md` | 712 px | `t-fluid` |
| `admin-calculator-cash-table10` | LP `--col-num-xs`, Nazwa `--col-text-md`, 3 × `--col-num-md` | 560 px | `t-fluid` |
| `adminCalculatorRebuyTable`, `game-details-rebuy-table` | n × `--col-num-sm` | dynamiczna | `t-compact` |

¹ Panel `Ranking` w `#statisticsTab` ma szerokość `34ch` (~275 px), czyli mniej niż suma tokenów (328 px). Ta tabela musi pozostać ściśliwa: `t-fluid` **bez** `--table-min` (czyli `min-width: 0`), a tokeny w `<colgroup>` ustalają tam wyłącznie proporcje kolumn. Kolumna `Gracz` zachowuje obcinanie wielokropkiem. Tabela już dziś działa poprawnie (`table-layout: fixed`, `min-width: 0`) i jest jedyną, która nie wymaga zmiany zachowania.

Redukcja: `admin-games-players-stats-table` **2224 → 1408 px (−37 %)**, `players-table` **976 → 792 px (−19 %)**, `admin-games-table` **1072 → 824 px (−23 %)**.

### 6.2 Second

Wszystkie tabele budowane w `app.js` jako `<table class="admin-data-table">` — trzeba dopisać `t-fluid` / `t-compact` oraz `<colgroup>` w miejscu renderu.

| Tabela | Kolumny → tokeny | Tryb |
|---|---|---|
| Lista graczy (`players-table`) | Status `--col-text-sm`, Nazwa `--col-text-md`, PIN `--col-text-sm`, Uprawnienia `--col-text-lg`, Akcje `--col-actions` | `t-fluid` |
| Losowanie — lista | Gracz `--col-text-md`, Status `--col-text-sm`, Stół `--col-text-sm` | `t-fluid` |
| Losowanie — blok stołu | Gracz `--col-text-md`, BUY-IN `--col-num-md` | `t-compact` |
| Tabela10 / Tabela13 | 4 × `--col-num-md` | **`t-compact`** |
| Tabela11 / Tabela14 | % `--col-num-xs`, 4 × `--col-num-md` | **`t-compact`** |
| Tabela15 | 2 × `--col-num-md` | **`t-compact`** |
| Tabela12 | LP `--col-num-xs`, Stół `--col-text-sm`, Gracz `--col-text-md`, BUY-IN `--col-num-md`, REBUY `--col-actions` | `t-fluid` |
| Tabela16 | LP `--col-num-xs`, Podział `--col-num-md`, Kwota `--col-num-md`, REBUY n × `--col-num-sm`, MOD 3 × `--col-num-sm` | `t-fluid` |
| Tabela17 | 2 × `--col-num-md` | **`t-compact`** |
| Tabela18 | n × `--col-num-md` + Łączny `--col-num-md` | `t-compact` (do ~6 stołów) |
| Tabela19 | LP `--col-num-xs`, Stół `--col-text-sm`, Gracz `--col-text-md`, Elim. `--col-flag`, Stack `--col-num-md`, Rebuy `--col-num-md` | `t-fluid` |
| Tabela19A | LP `--col-num-xs`, Gracz `--col-text-md`, Pozycja `--col-actions`, Wygrana `--col-num-md` | `t-fluid` |
| Tabela19B | LP `--col-num-xs`, Stół `--col-text-sm`, Gracz `--col-text-md`, Stack `--col-num-md`, % `--col-num-xs` | `t-fluid` |
| Tabela21 / Finałowa | LP `--col-num-xs`, Gracz `--col-text-md`, Stack `--col-num-md`, % `--col-num-xs`, Stół `--col-text-sm` | `t-fluid` |
| Tabela22 (stoły półfinałowe) | LP `--col-num-xs`, Gracz `--col-text-md`, Stack `--col-num-md`, Elim. `--col-flag` | `t-fluid` |
| Tabela22A / 23A | LP `--col-num-xs`, Gracz `--col-text-md`, Pozycja `--col-actions` | `t-compact` |
| Tabela23 | LP `--col-num-xs`, Gracz `--col-text-md`, Stack `--col-num-md`, % `--col-num-xs`, Elim. `--col-flag` | `t-fluid` |
| Tabela24 (Wypłaty) | Miejsce `--col-num-xs`, Gracz `--col-text-md`, 2 × `--col-num-md` | `t-fluid` |

Do usunięcia przy okazji: `.t-stack-input { width: 96px }` (nakładana na `<td>`, nie na pole) — zastąpić tokenem `--col-num-md` w `<colgroup>`.

---

## 7. Plan wdrożenia

Etapy uszeregowane **od największego efektu przy najmniejszym ryzyku**. Każdy etap jest samodzielny i osobno wdrażalny.

### Etap 0 — pomiar bazowy (0,5 h, ryzyko: brak)
Zrzuty ekranu obu modułów przy 375 / 412 / 820 / 1024 / 1440 / 1920 px, widok admina i użytkownika. Materiał porównawczy do odbioru każdego kolejnego etapu.

### Etap 1 — trzy linie o największym efekcie (1 h, ryzyko: niskie)
1. `Second`: `.admin-data-table { min-width: 860px }` → `min-width: 0` **(P1)**
2. Oba moduły: `.admin-data-table .admin-input, .admin-data-table select.admin-input { min-width: 0 }` **(P2)**
3. `Main`: breakpoint tabletu `max-width: 1180px` → jedna kolumna **(P4)**

Sam ten etap likwiduje trzy z czterech problemów oznaczonych 🔴. Kryterium odbioru: żadna tabela Second nie jest szersza niż jej treść; kolumna treści w Main na 820 px ma pełną szerokość karty.

### Etap 2 — budżet szerokości i czytelność mobilna (2 h, ryzyko: niskie)
Paddingi mobilne (5.4), `clamp` menu bocznego (5.5), przyklejony nagłówek i `max-height` w Second (5.7), elementy dotykowe (5.6). Bez ruszania kolumn.
Kryterium: tabela na 375 px dostaje ≥ 300 px; nagłówek widoczny przy przewijaniu; brak elementu dotykowego < 40 px.

### Etap 3 — skala tokenów (2 h, ryzyko: niskie)
Dodanie bloku `:root` z tokenami do obu arkuszy (5.1). Etap **czysto addytywny** — nic jeszcze nie korzysta z tokenów, więc wygląd się nie zmienia. Przygotowanie gruntu.

### Etap 4 — migracja Main na `colgroup` + `table-layout: fixed` (1 dzień, ryzyko: średnie)
Kolejność od najmniej ryzykownych: `admin-games-ranking-table` (już `fixed`) → `confirmations-*` → `players-table` → `admin-games-table` → `game-details-table` → `admin-calculator-*` → `admin-games-players-stats-table` (18 kolumn, na końcu).
Dla każdej tabeli: dodać `<colgroup>` z tokenami, dodać `t-fluid`/`t-compact` i `--table-min`, **usunąć odpowiadające reguły `nth-child`**. Kryterium: mapowanie z rozdz. 6 odtworzone co do piksela; brak reguł `nth-child` dla zmigrowanej tabeli.

### Etap 5 — migracja Second (1 dzień, ryzyko: średnie)
Analogicznie, ale `<colgroup>` trzeba wstawić w szablonach w `Second/app.js` (linie ~1900–2125 dla widoku admina, ~2951–3368 dla widoku użytkownika). **To edycja markupu, nie logiki** — struktura `<tr>/<td>` i wszystkie `data-role`, `data-focus-target`, `data-section`, `data-row-id`, `data-column-key` pozostają nietknięte.
⚠️ Obowiązkowo zastosować `Analizy/Wazne_Fokus.md` — każda tabela z polami edycyjnymi musi zachować komplet atrybutów fokusu (`data-focus-target`, `data-section`, `data-row-id`, `data-column-key`), inaczej wróci błąd utraty fokusu po autozapisie.

### Etap 6 — porządki (0,5 dnia, ryzyko: niskie)
Usunięcie 86 martwych klas z `Second/styles.css` **(P13)**, likwidacja `calc(100% + 46px)` / `margin-inline: -23px` na rzecz jawnego layoutu **(P12)**, ograniczenie szerokości treści na dużych monitorach **(P10, P11 wariant A)**.

### Etap 7 — dokumentacja (0,5 dnia, ryzyko: brak)
Zgodnie z `Main/AGENTS.md` i `Second/AGENTS.md`:
- `Kolumny.md` — pełne przepisanie na skalę tokenów zamiast list wartości `rem`/`ch` (pkt 11 AGENTS.md),
- `DetaleLayout.md` — nowe tryby tabel, tokeny, breakpointy (pkt 9–10),
- `Main/docs/Documentation.md`, `Second/docs/Documentation.md` — opis modelu (pkt 6–8) **oraz sprostowanie nieaktualnych zapisów z P14**,
- `Main/docs/README.md`, `Second/docs/README.md` — tylko jeśli zmieni się coś, co użytkownik klika (pkt 2–5).
Zgodnie z pkt 15: bez historii zmian, wyłącznie stan aktualny.

### Etap 8 (opcjonalny) — układ kartowy dla list gracza (0,5 dnia, ryzyko: niskie)
Wdrożenie `is-table-stacked` (rozdz. 5.9) dla tabel tylko do odczytu z listy w tym rozdziale. Wymaga dopisania `data-label` do komórek w renderach — jedyna zmiana wychodząca poza CSS w całym planie. Etap w pełni niezależny: można go pominąć albo zrobić dużo później, bez wpływu na etapy 1–7.
Kryterium: na ekranie 375 px żadna z wymienionych list nie wymaga przewijania w poziomie.

### Kolejność minimalna
Jeśli ma być zrobiony tylko fragment: **Etap 1 + Etap 2**. To ok. 3 godziny pracy, likwiduje wszystkie problemy 🔴 poza P3, i nie wymaga dotykania markupu.

---

## 8. Czego świadomie nie zmieniamy

- Logiki obliczeń, stanu, zapisu do Firestore, uprawnień, PIN-ów.
- Typów kolumn (tekst / `readonly` input / edytowalny input) — patrz `Analizy/Wazne_TypyKolumn.md`.
- Kolejności i liczby kolumn — pozostaje zgodna z `Kolumny.md`.
- Kolorystyki, fontów, cieni, zaokrągleń — poza wielkością fontu tam, gdzie dziś wynosi 9–11 px.
- Mechanizmu odtwarzania fokusu (`Analizy/Wazne_Fokus.md`).
- Struktury `<tr>/<td>` — `<colgroup>` dodaje się **przed** `<thead>` i nie zmienia liczby ani kolejności komórek.

**Jeden wyjątek od reguły „tylko CSS":** opcjonalny Etap 8 (`is-table-stacked`, rozdz. 5.9) wymaga dopisania atrybutu `data-label` do komórek w wybranych tabelach tylko do odczytu. Atrybut jest czysto prezentacyjny — nie dotyka logiki, zdarzeń ani stanu — ale formalnie jest to zmiana w markupie, nie w arkuszu stylów. Etap jest z tego powodu wydzielony i całkowicie opcjonalny.

## 9. Ryzyka

| Ryzyko | Prawdopodobieństwo | Ograniczenie |
|---|---|---|
| `table-layout: fixed` obcina długą treść | średnie | `text-overflow: ellipsis` + `title` na komórce; tokeny dobrane z zapasem |
| Utrata fokusu przy edycji `Second/app.js` | średnie | `<colgroup>` wstawiany poza `<tbody>`; obowiązkowy przegląd wg `Wazne_Fokus.md` |
| Tabele dynamiczne (Tabela16 REBUY1..n, Tabela18) | średnie | `<colgroup>` generowany z tej samej pętli co `<th>` |
| Regresja w rzadko otwieranych zakładkach | niskie | zrzuty z Etapu 0; migracja tabela po tabeli |
| `:has()` w starej przeglądarce (P11 wariant A) | niskie | fallback = obecne zachowanie (pełna szerokość), nie awaria |
| Brak `data-label` w części komórek po Etapie 8 | niskie | pusta etykieta zamiast awarii; kontrola przeglądem renderów tabela po tabeli |

## 10. Podsumowanie w trzech zdaniach

Szerokości nie są „prawie wszędzie na sztywno” — są **na sztywno w Main i wcale w Second**, a do tego liczone w dwóch różnych jednostkach, z których jedna (`ch`) daje w nagłówku i w komórce wartości różniące się o 21 %. Nakłada się na to niewidoczny bezpiecznik 213 px każdego pola `.admin-input`, przez który zadeklarowana szerokość kolumny bywa ignorowana — i to jest realna przyczyna, dla której metoda prób i błędów nie zbiegała do dobrego wyniku. Trzy linie CSS z Etapu 1 usuwają trzy z czterech najpoważniejszych problemów, a pełna migracja na skalę tokenów zamienia 320 ręcznych reguł na 9 wartości sterujących całą aplikacją na telefonie i na PC. Warto przy tym wiedzieć, gdzie leży granica: żywe dema pokazały, że powyżej ~820 px oba warianty dają dla większości tabel ten sam wynik, a sześciu kolumn liczbowych nie zmieści się na telefonie niezależnie od skali — realna wartość tej zmiany to zakres 320–800 px, przewidywalność szerokości i porządek w 320 regułach, a nie sam wygląd na dużym monitorze.
