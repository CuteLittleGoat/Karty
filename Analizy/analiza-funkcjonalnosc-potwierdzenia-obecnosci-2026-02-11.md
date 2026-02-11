# Analiza: funkcjonalność „Potwierdzenie obecności”

Data: 2026-02-11
Zakres: analiza wykonalności i wpływu na obecną architekturę (bez wdrożenia kodu).

## 1) Szybki wniosek

Tak — obecna konfiguracja Firebase i model aplikacji są **wystarczające** do wdrożenia funkcjonalności potwierdzania obecności, bez konieczności migracji do nowego backendu.

Najmniejszy koszt wdrożenia:
- rozszerzenie dokumentów gry w kolekcji `Tables` o pole `isClosed` (UI: „CzyZamknięta”),
- dodanie danych potwierdzeń per gracz i per gra (najbezpieczniej: nowa subkolekcja pod grą),
- dodanie nowej zakładki w adminie i w strefie użytkownika,
- dopięcie sortowania po dacie rosnąco (najwcześniejsza data u góry) w trzech miejscach:
  - sekcja „Tabele Gier” (admin),
  - „Gry do potwierdzenia” (użytkownik),
  - „Gry do potwierdzenia” (admin).

## 2) Odniesienie do aktualnej architektury

Aktualnie:
- gry i turnieje są trzymane w `Tables`,
- szczegóły gry są w `Tables/{gameId}/rows`,
- identyfikacja gracza po PIN jest już zaimplementowana przez `app_settings/player_access`.

To oznacza, że filtry typu:
- „pokaż gry, gdzie gracz X występuje w `rows.playerName`”,
- „pokaż tylko gry z odznaczonym `CzyZamknięta`”,
- „pozwól potwierdzić/anulować status i pokazać adminowi aktualny stan”

są możliwe bez zmiany silnika danych.

## 3) Analiza wymagań 1..3 i mapowanie na dane

## 3.1 Wymaganie 1 — checkbox „CzyZamknięta” w Tabeli Gier

### Proponowane pole danych
W dokumencie gry (`Tables/{gameId}`):
- `isClosed: boolean` (default: `false`).

### Zachowanie
- nowa gra: `isClosed = false`,
- admin może zmieniać `true/false` dowolnie,
- jeśli `isClosed = true`, gra znika z list „Gry do potwierdzenia” użytkownika i z listy aktywnych gier do potwierdzeń po stronie admina.

## 3.2 Wymagania 2 / 2b / 2c / 2d / 2e / 2f / 2g — nowa zakładka użytkownika

### Uwierzytelnienie PIN (2b)
Można użyć istniejącej logiki PIN gate analogicznie do `nextGameTab`/`chatTab`:
- wejście PIN,
- mapowanie PIN -> gracz z `app_settings/player_access.players[]`,
- zapis sesji lokalnej zakładki (tak jak inne gate’y).

### Jak wyliczyć listę gier (2c)
Filtr logiczny:
1. `isClosed == false` (gra aktywna),
2. w `Tables/{gameId}/rows` istnieje rekord z `playerName == currentPlayer.name`.

### Dane wyświetlane (2d)
Wiersz listy użytkownika pobiera z gry:
- `gameType` -> „Rodzaj Gry”,
- `gameDate` -> „Data”,
- `name` -> „Nazwa”.

### Potwierdź / Anuluj (2e, 2f)
Potrzebny jest trwały zapis stanu potwierdzenia (nie tylko kolor w DOM).

Rekomendowany model (skalowalny):
- subkolekcja pod grą: `Tables/{gameId}/confirmations/{playerId}`
- dokument:
  - `playerId`,
  - `playerName`,
  - `confirmed: boolean`,
  - `updatedAt: serverTimestamp()`,
  - `updatedBy: "player" | "admin"`.

Kolor złoty to tylko reprezentacja `confirmed=true`.
Kliknięcia wielokrotne są naturalne: każdy klik nadpisuje stan i `updatedAt`.

### Przycisk Odśwież (2g)
Wystarczy użyć obecnego wzorca `refresh`:
- ręczne pobranie z serwera (source: "server")
- przebudowa listy użytkownika.

Uwaga: jeśli i tak będzie `onSnapshot`, przycisk „Odśwież” pozostaje UX-owo sensowny (wymuszenie ręcznej synchronizacji po problemach łącza/cache).

## 3.3 Wymagania 3 / 3b / 3c / 3d — widok administratora

### Zakres gier (3)
Admin widzi gry gdzie `isClosed == false`.

### Lista zapisanych użytkowników + status (3b)
Dla każdej gry admin renderuje:
- listę graczy wynikającą z `rows` (pole `playerName`),
- status potwierdzenia z `confirmations`.

### „Ostatnia zmiana” i wielokrotne modyfikacje (3c)
Jeden dokument `confirmations/{playerId}` na parę (gra, gracz) gwarantuje:
- brak duplikatów,
- zawsze ostatni stan,
- admin po odświeżeniu widzi najnowszy status.

### Akcje admina (3d)
Admin może nadpisywać `confirmed` na `true/false` dla każdego gracza, o ile `isClosed==false`.

## 4) Czy obecna konfiguracja Firebase jest wystarczająca?

## 4.1 Tak, pod warunkiem rozszerzenia reguł o nową subkolekcję

Obecne rules dopuszczają `Tables/{tableId}` i `Tables/{tableId}/rows/{rowId}`.
Jeśli dodamy `confirmations` pod `Tables/{gameId}`, trzeba dopisać:
- `match /Tables/{tableId}/confirmations/{playerId} { allow read, write: if true; }`

W obecnym modelu projektu (`allow read, write: if true`) to formalność techniczna.

## 4.2 Czy można użyć „Collection1”?

Tak, można — ale to **gorsza opcja** niż subkolekcja:
- `Collection1` jako płaska kolekcja np. `game_confirmations` wymagałaby kluczy złożonych (`gameId_playerId`) i dodatkowych indeksów,
- trudniej czytelnie agregować po pojedynczej grze,
- większa podatność na pomyłki przy usuwaniu/osieroceniu rekordów.

Wniosek:
- **Rekomendacja**: confirmations jako subkolekcja `Tables/{gameId}/confirmations`.
- **Collection1**: tylko awaryjnie, jeśli celowo chcecie trzymać nowy moduł poza `Tables`.

## 4.3 Wydajność i ograniczenia

Dla obecnego projektu rozwiązanie jest bezpieczne wydajnościowo, ale warto dopiąć:
- unikalne mapowanie gracza po `playerId` (a nie samym `playerName`),
- normalizację nazwy przy porównaniach historycznych danych,
- ewentualny fallback dla gier bez `isClosed` (traktować jako `false`).

## 5) Sortowanie po dacie rosnąco — luka względem wymagań

Wymaganie: „najwcześniejsza data na górze” w obu widokach + to samo w „Tabele Gier”.

Aktualne ryzyka:
- część list jest sortowana po `createdAt`, nie po `gameDate`,
- w zakładce gier istnieje sort malejący po dacie (najnowsze wyżej),
- pola dat mogą być traktowane jako stringi i wymagać normalizacji.

Rekomendacja wdrożeniowa:
1. Ujednolicić parser daty (`YYYY-MM-DD` -> timestamp porównawczy).
2. Wszędzie użyć sortowania ASC po `gameDate`.
3. Dla pustej/niepoprawnej daty dać koniec listy.
4. Zastosować tie-breaker po `createdAt` ASC i `name` ASC.

## 6) Minimalny plan wdrożenia (techniczny)

1. **Model danych**
   - dodać `isClosed` przy tworzeniu gry,
   - dodać subkolekcję `confirmations`.

2. **UI admina**
   - kolumna checkbox „CzyZamknięta” w Tabeli Gier,
   - nowa zakładka „Gry do potwierdzenia”
     - lista gier aktywnych,
     - pod każdą listą graczy,
     - statusy i akcje Potwierdź/Anuluj na użytkowniku.

3. **UI użytkownika**
   - nowa zakładka „Gry do potwierdzenia” z PIN gate,
   - tabela z kolumnami: Rodzaj Gry, Data, Nazwa,
   - przyciski Potwierdź / Anuluj / Odśwież.

4. **Synchronizacja**
   - `onSnapshot` dla gier + `rows` + `confirmations`,
   - ręczny `Odśwież` jako fetch server.

5. **Reguły Firestore**
   - dopisać blok dla `confirmations`.

6. **Sortowanie**
   - wszędzie rosnąco po `gameDate`.

## 7) Ryzyka projektowe i jak je zminimalizować

1. **Tożsamość po nazwie gracza**
   - ryzyko: zmiana nazwy gracza rozłącza dane historyczne.
   - rozwiązanie: confirmations trzymać po `playerId`, nazwa tylko jako snapshot pomocniczy.

2. **Stare gry bez pola `isClosed`**
   - ryzyko: brak jednoznacznego filtrowania.
   - rozwiązanie: brak pola interpretować jako `false`.

3. **Duplikaty gracza w `rows` jednej gry**
   - ryzyko: wiele wpisów tego samego gracza.
   - rozwiązanie: w widoku potwierdzeń deduplikować po `playerId`/`playerName`.

4. **Niespójność lokalna po kliknięciu**
   - ryzyko: kolor zmienia się zanim zapis się potwierdzi.
   - rozwiązanie: optymistyczny update + rollback przy błędzie zapisu.

## 8) Odpowiedź końcowa na pytanie o Firebase

**Obecna konfiguracja Firebase jest wystarczająca**, aby wdrożyć funkcję potwierdzeń obecności zgodnie z wymaganiami.

Nie ma potrzeby przebudowy backendu ani zmiany dostawcy danych.
Należy jedynie:
- dodać pole `isClosed` w grach,
- dodać trwały model potwierdzeń (najlepiej `Tables/{gameId}/confirmations/{playerId}`),
- dopisać odpowiedni blok rules,
- ujednolicić sortowanie po `gameDate` rosnąco.

`Collection1` można wykorzystać, ale architektonicznie lepiej i czyściej będzie trzymać potwierdzenia bezpośrednio pod daną grą.
