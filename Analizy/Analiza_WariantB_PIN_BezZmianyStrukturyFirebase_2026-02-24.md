# Analiza: WariantB (PIN, bez loginu i hasła) oraz separacja gier GraczA/GraczB

## Prompt użytkownika
"Przeczytaj analizę Analizy/Wazne_LoginIHaslo.md
Zwróć uwagę na przykład w prompcie.
Jestem zdecydowany na WariantB
GraczA nie ma wglądu w gry utworzone przez GraczB

Przeprowadź nową analizę i zapisz jej wyniki w nowym pliku.
Sprawdź czy w obecnym modelu - bez loginu i hasła ale z PIN - da się wprowadzić taką funkcjonalność bez modyfikowanie obecnej struktury Firebase.

Dodatkowo zmodyfikuj kolumnę \"Mod\" w sekcji \"Statystyki\" w \"Gry admina\" - umożliw wpisywanie wartości ujemnych."

## 1. Kontekst obecnego modelu
Aktualny model dostępu opiera się na:
- weryfikacji PIN (5 cyfr),
- uprawnieniach per zakładka (`permissions` w `app_settings/player_access`),
- zapisie identyfikatora zalogowanego gracza w `sessionStorage` (np. `userGamesPlayerId`).

W module „Gry użytkowników” nowo tworzone gry zawierają już pola:
- `createdByPlayerId`,
- `createdByPlayerName`.

To oznacza, że dane potrzebne do przypisania gry do właściciela już istnieją.

## 2. Czy WariantB da się wdrożyć bez modyfikacji struktury Firebase?
## Odpowiedź: TAK (z ważnym zastrzeżeniem bezpieczeństwa)

Da się wdrożyć WariantB bez zmiany struktury kolekcji i dokumentów Firestore, ponieważ:
1. istnieje identyfikator gracza (`player.id`),
2. istnieje pole właściciela gry (`createdByPlayerId`) zapisywane przy dodaniu gry,
3. można filtrować listę gier po `createdByPlayerId == verifiedPlayer.id`.

Wymagane są tylko zmiany logiki odczytu i renderowania (frontend / zapytania), nie struktury danych.

## 3. Jak wdrożyć WariantB w obecnym modelu PIN (bez login/hasło)

### 3.1 Minimalny wariant (bez zmian struktury)
- W widoku gracza w „Gry użytkowników” pobierać i wyświetlać wyłącznie gry, gdzie:
  - `game.createdByPlayerId === verifiedPlayer.id`.
- Analogicznie szczegóły gry (`rows`) udostępniać tylko dla gier już przefiltrowanych.
- Przy zapisie/edycji dodatkowo sprawdzać po stronie UI, że edytowana gra należy do aktualnego gracza.

### 3.2 Zalecany wariant (nadal bez zmiany struktury)
- Oprzeć subskrypcję Firestore na zapytaniu:
  - `where("createdByPlayerId", "==", verifiedPlayer.id)`
  zamiast pobierania wszystkich dokumentów `UserGames`.
- Dzięki temu gracz nie dostaje pełnej listy cudzych gier nawet na poziomie transferu snapshotu.

## 4. Ograniczenia modelu PIN (istotne)
Bez wdrożenia restrykcyjnych reguł Firestore to rozdzielenie będzie przede wszystkim warstwą aplikacyjną (UI + logika klienta), czyli:
- działa poprawnie dla standardowego użytkownika,
- ale nie jest twardym mechanizmem bezpieczeństwa kryptograficznego,
- bo PIN nie daje tożsamości `request.auth.uid` znanej z Firebase Authentication.

Wniosek: funkcjonalnie WariantB jest możliwy od razu bez zmiany struktury, ale poziom bezpieczeństwa jest niższy niż w modelu login/hasło + Firestore Rules.

## 5. Czy potrzebna jest modyfikacja struktury Firebase?
Nie. Do osiągnięcia celu „GraczA nie widzi gier GraczB” wystarczą:
- istniejące pola `createdByPlayerId` i `createdByPlayerName`,
- zmiana logiki filtrowania odczytu i renderu,
- ewentualnie doprecyzowanie reguł dostępu (bez zmiany schematu dokumentów).

## 6. Rekomendacja końcowa
- Dla szybkiego wdrożenia: realizować WariantB na bazie obecnego modelu PIN i `createdByPlayerId`.
- Dla docelowego bezpieczeństwa: później przejść na Firebase Authentication (login/hasło) i wymusić właścicielski dostęp regułami `request.auth.uid`.
