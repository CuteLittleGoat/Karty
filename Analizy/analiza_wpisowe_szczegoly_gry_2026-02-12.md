# Analiza: logika pola „Wpisowe” w „Szczegóły gry”

## Prompt użytkownika
> „Przeprowadź analizę pełnego kodu aplikacji.
> Sprawdź warunki co się dzieje jak jakiemuś graczowi w pole "Wpisowe" w "Szczegóły gry" wpiszę wartość zero a co jak pozostawię pole puste a co jak wpiszę wartość większą niż zero.
> Pamiętam, że niektóre inne wartości się obliczają albo ignorują takiego gracza. Wypisz mi wszystkie możliwe przypadki oraz obliczenia.
> Sprawdź czy są warunki na wartości ujemne.”

## Zakres analizy
Przeanalizowano logikę w `Main/app.js` dla:
- normalizacji i parsowania wartości liczbowych,
- zapisu wartości z inputów w modalu „Szczegóły gry”,
- filtrowania graczy do podsumowań i statystyk,
- obliczeń puli, zysk/strata, procentów i rankingów.

## Najważniejsze reguły
1. `Wpisowe` jest polem tekstowym; każda zmiana przechodzi przez `sanitizeIntegerInput` i dopiero taka wartość trafia do bazy.
2. Do obliczeń liczbowych wszędzie używany jest `parseIntegerOrZero`.
3. Gracz jest liczony jako „obecny” w podsumowaniach/statystykach tylko, gdy `Wpisowe > 0`.
4. `Wpisowe = 0` i `Wpisowe = ""` skutkują pominięciem gracza w podsumowaniach i statystykach.
5. Wartości ujemne są technicznie akceptowane przez input i bulk update, ale i tak nie spełniają warunku `> 0`, więc gracz jest pomijany.

## Co dzieje się dla trzech kluczowych przypadków

### 1) `Wpisowe = 0`
- `parseIntegerOrZero("0") => 0`.
- Warunek obecności (`hasCompletedEntryFee` / filtr `parseIntegerOrZero(entryFee) > 0`) jest fałszywy.
- Skutki:
  - gracz nie wchodzi do tabeli podsumowania gry,
  - `entryFee` i `rebuy` tego gracza nie zwiększają puli,
  - wypłata tego gracza nie zwiększa sumy wypłat podsumowania,
  - gracz nie jest liczony do statystyk rocznych (`meetingsCount`, `depositsSum`, `plusMinusSum`, `% udział`, `%...`).

### 2) `Wpisowe = ""` (pole puste)
- `parseIntegerOrZero("") => 0`.
- Warunek obecności: fałszywy.
- Skutki identyczne jak dla `0` (pełne pominięcie gracza w agregacjach i statystykach).

### 3) `Wpisowe > 0`
- Warunek obecności: prawdziwy.
- Skutki:
  - gracz trafia do podsumowania gry,
  - pula gry rośnie o `entryFee + rebuy`,
  - suma wypłat rośnie o `payout`,
  - liczony jest `profit = payout - (entryFee + rebuy)`,
  - liczony jest `% puli = round((payout / pool) * 100)`,
  - gracz jest liczony do statystyk rocznych i rankingów.

## Pełna matryca wejść (realnie możliwe wartości)

### A. Wejście/normalizacja (`sanitizeIntegerInput`)
- `""`, spacje, same litery, same znaki specjalne (bez cyfr): normalizowane do `""`.
- `"0"`, `"000"`: normalizowane do ciągu cyfr (np. `"000"`), parse daje `0`.
- `"50"`, `" 50 "`, `"5 0"`, `"5,0"`: po normalizacji cyfry bez spacji/przecinków (np. `"50"`).
- `"-"`: pozostaje `"-"` (specjalny przypadek wpisywania minusa).
- `"-5"`: pozostaje `"-5"`.
- `"- 5"`, `"-5abc"`: normalizowane do `"-5"`.
- `"12.5"`: kropka jest usuwana jako znak niecyfrowy → `"125"`.

### B. Parsowanie (`parseIntegerOrZero`)
- `""` i `"-"` -> `0`.
- poprawne ciągi liczb dodatnich/ujemnych -> odpowiednia liczba całkowita.
- w praktyce po wcześniejszym sanitizerze większość „dziwnych” stringów i tak staje się poprawną liczbą lub pustym stringiem.

### C. Kwalifikacja gracza do agregacji
Gracz przechodzi do podsumowania/statystyk tylko jeśli:
- ma nazwę gracza (niepustą),
- i `Wpisowe` po normalizacji/parsowaniu jest **> 0**.

## Wartości ujemne (`Wpisowe < 0`) — odpowiedź na pytanie

### Czy są warunki blokujące zapis wartości ujemnych?
- **Nie** dla zwykłej edycji inputu: minus jest dozwolony przez sanitizację.
- **Nie** dla masowego ustawiania wpisowego: walidacja odrzuca tylko `""` i `"-"`, ale `"-5"` przechodzi.

### Czy są warunki użycia wartości ujemnych w obliczeniach podsumowań/statystyk?
- **Tak, pośrednio**: reguła `Wpisowe > 0` eliminuje wszystkie ujemne wartości z podsumowań i statystyk.
- Efekt końcowy dla `-5` jest taki sam jak dla `0`/`""`: gracz pominięty.

## Obliczenia zależne od `Wpisowego`

Dla graczy zakwalifikowanych (`Wpisowe > 0`) liczona jest:
1. **Pula gry**: suma `entryFee + rebuy` po wszystkich zakwalifikowanych graczach.
2. **Suma wypłat**: suma `payout` po zakwalifikowanych graczach.
3. **Ostrzeżenie mismatch**: gdy `payoutSum !== pool`.
4. **Wynik gracza (+/-)**: `profit = payout - (entryFee + rebuy)`.
5. **% puli dla gracza**: `round((payout / pool) * 100)`.
6. **Statystyki roczne gracza**:
   - `meetingsCount += 1`,
   - `championshipCount += 1` (jeśli checkbox zaznaczony),
   - `pointsSum += points`,
   - `plusMinusSum += profit`,
   - `payoutSum += payout`,
   - `depositsSum += entryFee + rebuy`,
   - `playedGamesPoolSum += gamePool` (maks. raz na gracza na grę).
7. **Wskaźniki procentowe**:
   - `% udział = ceil((meetingsCount / gameCount) * 100)`,
   - `% Wszystkich gier = ceil((payoutSum / playedGamesPoolSum) * 100)`,
   - `% Rozegranych gier = ceil((payoutSum / totalPool) * 100)`.

## Wniosek końcowy
W aplikacji reguła biznesowa jest jednoznaczna: tylko `Wpisowe > 0` oznacza faktyczny udział gracza w grze. Wartości `0`, puste i ujemne nie są brane do podsumowań/statystyk, nawet jeśli zostaną zapisane w rekordzie.
