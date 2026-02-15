# Symulator Texas Hold'em — dokumentacja techniczna

## 1. Architektura modułu
Moduł działa jako samodzielna aplikacja front-end (statyczna):
- `Symulator/index.html` — struktura UI,
- `Symulator/styles.css` — style, layout stołu i animacje,
- `Symulator/app.js` — logika symulacji (stan gry, rozdania, boty, ocena układów).

Brak integracji z zewnętrznym backendem — stan rozgrywki utrzymywany jest w obiekcie `state` w pamięci przeglądarki.

## 2. Struktura UI (`index.html`)
### 2.1 Panel sterowania (lewy)
- Pole `#startingStack` — wejściowa pula żetonów dla gracza i botów.
- Suwak `#botCount` oraz etykieta `#botCountValue`.
- Akcje:
  - `#startHandButton` — start nowego rozdania,
  - `#nextStreetButton` — ręczne przejście do następnej fazy,
  - `#autoPlayButton` — automatyczne odtwarzanie faz.
- Statystyki:
  - `#potValue`,
  - `#phaseValue`,
  - `#playerStackValue`.
- Log zdarzeń: `#eventLog`.

### 2.2 Stół gry (prawy)
- `#deck` — talia z animacją tasowania.
- `#communityCards` — obszar kart wspólnych.
- `#potChip` — wizualizacja aktualnej puli.
- `#botSeats` — kontener dynamicznych miejsc botów.
- `#playerSeat` / `#playerCards` / `#playerStatus` — strefa gracza.

## 3. Style i layout (`styles.css`)
## 3.1 Fonty
- `Inter` — tekst interfejsu,
- `Cinzel` — tytuł modułu.

## 3.2 Kolorystyka
- Tło noir-zielone (`--bg`, `--bg2`, `--felt`, `--felt2`).
- Akcent gold (`--gold`) dla ważnych elementów i linków.
- Ciemny panel boczny (`--panel`) z ramkami (`--border`).

## 3.3 Geometria stołu
- Główny kontener `.poker-table` ma kształt elipsy (`border-radius: 999px`).
- Boty umieszczane są po półokręgu (pozycjonowanie absolutne).
- Gracz jest zakotwiczony na dole stołu (`.player-seat`).

## 3.4 Animacje
- `@keyframes shuffle` — animacja tasowania talii (`.deck.shuffle`).
- `@keyframes deal` — animacja pojawiania się kart (`.card.dealt`).
- Styl zwycięzcy (`.winner`) rozświetla etykietę miejsca.

## 4. Logika gry (`app.js`)
## 4.1 Stan aplikacji
Główny obiekt `state` przechowuje:
- talię (`deck`),
- karty wspólne (`community`),
- indeks fazy (`phaseIndex`),
- listę uczestników (`participants`),
- pulę (`pot`),
- flagi `autoPlay` i `handActive`.

## 4.2 Uczestnicy gry
- 1 gracz (`isPlayer: true`),
- od 1 do 9 botów (`isPlayer: false`),
- każdy bot dostaje losowy archetyp zachowania (`ostrożny`, `agresywny`, `blefujący`, `zbalansowany`).

Archetyp nie jest prezentowany w UI dla gracza.

## 4.3 Przebieg rozdania
1. `startHand()`:
   - resetuje stan,
   - tasuje talię,
   - czyści stół,
   - rozdaje 2 karty każdemu uczestnikowi.
2. `nextPhase()` przechodzi po etapach:
   - `Preflop`,
   - `Flop` (3 karty wspólne),
   - `Turn` (1 karta),
   - `River` (1 karta),
   - `Showdown`.
3. W każdej aktywnej fazie wykonywana jest `runBettingRound()`.
4. `finishHand()` ocenia układy i przyznaje pulę zwycięzcy.

## 4.4 Mechanika botów
- `botAction()` wybiera akcję `fold/call/raise` na podstawie losowania i profilu archetypu.
- Każda akcja aktualizuje stack bota, pulę i tekst statusu miejsca.

## 4.5 Ocenianie układu kart
Funkcja `evaluate7Cards()` obsługuje klasy:
- wysoka karta,
- para,
- dwie pary,
- trójka,
- strit,
- kolor,
- full,
- kareta,
- strit w kolorze.

`compareHands()` porównuje wynik punktowy oraz wartości `tiebreak`.

## 4.6 Warstwa zdarzeń UI
- `input` dla suwaka botów aktualizuje wartość i przebudowuje stoły botów,
- `click` na przyciskach steruje rozdaniem i fazami,
- `autoPlay()` cyklicznie przechodzi etapy z opóźnieniami.

## 5. Dane backendowe
Moduł **nie wykorzystuje backendu** ani zapisu danych.
- Brak połączenia z Firebase,
- brak zapytań HTTP API,
- brak trwałej persystencji.

Cała symulacja działa lokalnie po stronie klienta, a dane są resetowane przy odświeżeniu strony.
