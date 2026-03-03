# Analiza 4 — Weryfikacja problemów po wdrożeniu Analizy 3 (Statusy / liczenie graczy)

## Prompt użytkownika
> Przeczytaj analizę: Analizy/Main_Analiza1_Przycisk_IloscPotwierdzonych.md
>
> I zweryfikuj obecny stan kodu pod kątem tej zmiany. Funkcjonalność zdaje się nie działać w pełni.
> Aplikacja przestała liczyć graczy w danej grze. Nie działa przycisk "Statusy".
> Przeczytaj analizę: Analizy/Main_Analiza3_DuplikatyNazwGraczy_UniqatowyZnacznik.md
>
> Sprawdź czy wdrożenie Analizy/Main_Analiza3_DuplikatyNazwGraczy_UniqatowyZnacznik.md nie mogło spowodować tych problemów. Sprawdź jeszcze raz cały kod aplikacji i sprawdź czy wdrożenie tej poprawki z analizy nie spowodowało jeszcze innych błędów.
>
> Rezultat analizy zapisz w nowym pliku.

## Zakres weryfikacji
- Przeczytane analizy:
  - `Analizy/Main_Analiza1_Przycisk_IloscPotwierdzonych.md`
  - `Analizy/Main_Analiza3_DuplikatyNazwGraczy_UniqatowyZnacznik.md`
- Audyt kodu modułu `Main` (cały `Main/app.js`, plus `Main/index.html`, `Main/styles.css`).
- Kontrola syntaktyczna JS: `node --check Main/app.js`.
- Szybki skan modułu `Second` pod kątem analogicznych wzorców powiązanych z regresją.

## Wynik główny (odpowiedź na zgłoszenie)

### 1) Czy wdrożenie podejścia z Analizy 3 mogło spowodować problemy z liczeniem i „Statusy”?
**Tak — jest realny i bardzo prawdopodobny punkt regresji.**

W kodzie liczenie `IlośćPotwierdzonych` oraz dane w modalu „Statusy” opierają się na porównaniu identyfikatorów budowanych preferencyjnie z `playerId`:
- dla wierszy gry: `id:<playerId>` (fallback `name:<playerName>`),
- dla potwierdzeń: analogicznie `id:<playerId>` (fallback `name:<playerName>`).

To jest poprawne **tylko wtedy**, gdy zapis potwierdzenia ma ten sam `playerId`, co wiersz gracza.

Jednocześnie w panelu admina „Gry do potwierdzenia” nadal istnieje ścieżka, która buduje dokument potwierdzenia po nazwie i zapisuje `playerId` = `confirmationDocId`, gdzie `confirmationDocId` może być nazwą gracza (`playerName`) zamiast prawdziwego ID z `player_access`.

Skutek:
- wiersz gracza ma np. `playerId = abc123` → identyfikator `id:abc123`,
- potwierdzenie zapisane przez admina może mieć `playerId = "Jan Kowalski"` → identyfikator `id:Jan Kowalski`,
- porównanie nie pasuje, więc licznik i statusy nie widzą potwierdzenia mimo kliknięcia.

To dokładnie pasuje do objawów „nie liczy graczy/potwierdzeń” i „Statusy nie działa” (w praktyce: statusy mogą otwierać się, ale pokazywać błędne, niezsynchronizowane dane).

## Szczegóły techniczne (miejsca ryzyka)

### A) Potencjalna główna przyczyna regresji licznika i statusów
1. Licznik i modal statusów używają dopasowania po identyfikatorze (`playerId`/`playerName` fallback):
   - `getConfirmedPlayerIdentifiersFromConfirmations`, `getConfirmedCountLabel`, `getConfirmationStatusesForRows`.
2. W „Gry do potwierdzenia” (widok admina) lista graczy budowana jest po `playerName`, a nie po `playerId`.
3. Podczas zapisu adminowego potwierdzenia, `playerId` jest ustawiany na `confirmationDocId`, który bywa nazwą gracza, gdy nie znaleziono dopasowania w `adminPlayersState.players`.

To tworzy niespójność danych i „gubienie” potwierdzeń w liczniku/statusach.

### B) Dodatkowe błędy/regresje znalezione po wdrożeniu podejścia playerId
1. **Niespójne kluczowanie statystyk ręcznych (wagi) w części statystyk**
   - fragment nadal używa `row.playerName` jako klucza mapy (`yearMap`) przy masowym ustawianiu wag,
   - podczas gdy pozostała część statystyk przeszła na `statsKey` (`playerId` + fallback do nazwy).

   Efekt uboczny:
   - możliwe nakładanie danych dla duplikatów nazw,
   - możliwe rozjazdy między tym, co widzi użytkownik, a tym co trafia do eksportu/obliczeń.

2. **Eksport XLSX nadal pobiera manualne wpisy po `row.playerName`**
   - analogiczny problem klucza jak wyżej,
   - ryzyko błędnych danych eksportowanych po migracji na unikatowe ID.

## Czy wykryto błąd krytyczny typu „aplikacja nie startuje”?
- W obecnym stanie **nie**: kontrola `node --check Main/app.js` przechodzi poprawnie.
- Nie ma obecnie błędu pokroju wcześniejszego `Identifier ... has already been declared`.

## Wnioski końcowe
1. Zgłoszony problem jest spójny z częściowo wdrożonym przejściem z `playerName` na `playerId`.
2. Najbardziej podejrzany punkt to adminowe zapisywanie potwierdzeń, gdzie `playerId` może zostać zapisane jako nazwa gracza, co rozbija logikę licznika i „Statusy”.
3. W kodzie są też dodatkowe miejsca niespójne z migracją na unikatowy identyfikator (manualne statystyki i eksport), które mogą generować kolejne błędy jakości danych.

## Rekomendacje naprawcze (krótkie)
1. Ujednolicić przepływ potwierdzeń: zapis i odczyt wyłącznie po prawdziwym `playerId` z `player_access` (nazwa tylko prezentacyjnie).
2. W „Gry do potwierdzenia” admina przejść z listy `playerName` na listę rekordów `{ playerId, playerName }` z `rows`.
3. Dokończyć migrację statystyk: wszędzie klucz `statsKey`/`playerId`, fallback tylko dla starych danych.
4. Dodać smoke test manualny po deployu:
   - potwierdzenie przez admina,
   - potwierdzenie przez gracza,
   - weryfikacja `IlośćPotwierdzonych` i modala „Statusy” dla obu przypadków.
