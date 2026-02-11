# Analiza wdrożenia: rozbudowa zakładki „Gry użytkowników”

Data: 2026-02-11  
Zakres: analiza techniczna (bez wdrożenia kodu) + ocena wpływu na Firebase/Rules.

## Prompt użytkownika (kontekst)

> „Przeprowadź analizę dodania nowej funkcjonalności.
>
> Użytkownik, który ma uprawnienia nadane w zakładce "Gry użytkowników" po podaniu PIN może wejść w zakładkę "Gry użytkowników" (to już działa.
> 1. Zakładka "Gry użytkowników" będzie zawierać takie same funkcjonalności jak sekcja "Tabele Gier" w zakładce "Gry Admina".
> 2. W "Gry użytkowników" nie będzie sekcji "Podsumowanie gry" oraz "Statystyki".
> 3. Zakładka "Gry użytkowników" będzie mieć panel do wyboru lat podobnie jak zakładka "Gry admina".
> 3b. Lata będą się pojawiać na liście dopiero jak pojawi się jakaś gra w danym roku - funkcjonalność jak w zakładce "Gry Admina"
> 4. Uprawniony użytkownik będzie mógł dodawać gry, wybierać rodzaj, nadawać nazwę, mieć dostęp do checkboxa CzyZamknięte, oraz usuwać gry.
> 4b. Uprawniony użytkownik będzie mógł modyfikować szczegóły danej gry podobnie jak admin w panelu "Gry Admina".
> 4c. Jeżeli uprawniony użytkownik doda do swojej gry gracza z zakładki "Gracze" to ten gracz będzie widzieć daną grę w zakładce "Gry do potwierdzenia" - nawet jeżeli sam nie ma uprawnień do zakładki "Gry użytkowników". Musi jednak mieć uprawnienia do zakładki "Gry do potwierdzenia"
> 5. Uprawnienia do "Gry użytkowników" nie dają uprawnień do zatwierdzania obecności innych osób - to może tylko admin.
> 6. Jeżeli uprawniony użytkownik doda grę w zakładce "Gry użytkownika" to admin w swoim widoku w zakładce "Gry do potwierdzenia" ją zobaczy i może sam potwierdzać obecność lub ją anulować.
> 7. W widoku admina w zakładce "Gry użytkowników" admin również może dodawać gry oraz je usuwać jak również modyfikować zawartość tabel pojawiających się po kliknięciu przycisku "Szczegóły".
>
> Dane wpisane w "Gry użytkownika" nigdy nie będą przenoszone do jakichkolwiek innych statystyk. Decyzją projektową jest to, że po zakończeniu danej gry stworzonej przez użytkownika administrator ręcznie przepisuje dane do zakładki "Gry Admina".
>
> Podsumowując:
> Funkcjonalność zakładki "Gry użytkowników" ma pozwolić użytkownikowi z odpowiednimi uprawnieniami i po potwierdzeniu PIN zakładać własny gry w sposób analogiczny jak admin tworzy gry w zakładce "Gry admina". Wciąż admin ma pełną kontrolę i może modyfikować gry utworzone przez użytkowników. Dane do statystyk (statystyki będą robione na późniejszym etapie) nigdy nie będą się zaciągać z zakładki "Gry użytkowników".
>
> Przeprowadź analizę wdrożenia i sprawdź czy obecna konfiguracja Firebase wystarczy czy trzeba dodać jakąś nową kolekcję i/lub zmienić Rules.”

---

## 1) Stan obecny (zidentyfikowany)

1. PIN + uprawnienie do zakładki „Gry użytkowników” już działa (gate i sesja są zaimplementowane), ale zawartość panelu to nadal „Strona w budowie”.
2. Funkcje CRUD gier + szczegółów istnieją obecnie dla modułu „Gry admina” i operują na kolekcji `Tables`.
3. „Gry do potwierdzenia” działają dla aktywnych gier opartych o bieżący model danych.
4. Reguły Firestore opisane w dokumentacji są globalnie otwarte (`allow read, write: if true`).

Wniosek: podstawowe klocki UI i logiki są gotowe do reużycia, ale brakuje docelowego modelu danych dla gier użytkowników i separacji od statystyk admina.

---

## 2) Kluczowa decyzja architektoniczna: separacja danych

Ponieważ wymagasz, aby dane z „Gry użytkowników” **nigdy** nie wpadały do statystyk, są dwie opcje:

### Opcja A — jedna kolekcja (`Tables`) + flaga typu źródła
- np. `scope: "admin" | "user"`, `ownerPlayerId`, `ownerPlayerName`.
- Plus: mniej zmian infrastrukturalnych.
- Minus: większe ryzyko błędów filtrów (jedno przeoczenie i dane użytkownika trafią do statystyk).

### Opcja B — osobna kolekcja dla gier użytkowników (REKOMENDOWANA)
- np. `UserGames/{gameId}` + subkolekcje `rows` i `confirmations`.
- Plus: twarda separacja domeny danych i mniejsze ryzyko „przecieku” do statystyk.
- Minus: trzeba dodać nową kolekcję i obsługę odczytu z dwóch źródeł w „Gry do potwierdzenia” (admin).

**Rekomendacja:** Opcja B (osobna kolekcja `UserGames`) ze względu na wymaganie projektowe o pełnym rozdzieleniu danych.

---

## 3) Proponowany model danych

## 3.1 Kolekcja `UserGames`
Dokument gry:
- `name: string`
- `gameType: string`
- `gameDate: string (YYYY-MM-DD)`
- `isClosed: boolean`
- `createdAt: serverTimestamp`
- `createdByPlayerId: string`
- `createdByPlayerName: string`
- `updatedAt: serverTimestamp` (opcjonalnie)

Subkolekcje:
- `UserGames/{gameId}/rows/{rowId}`
  - zgodna struktura jak w „Gry admina” (playerName, entryFee, rebuy, payout, points, championship, createdAt)
- `UserGames/{gameId}/confirmations/{playerId}`
  - `playerId`, `playerName`, `confirmed`, `updatedAt`, `updatedBy`

## 3.2 Integracja z „Gry do potwierdzenia”
- Widok użytkownika „Gry do potwierdzenia”:
  - powinien pobierać gry z `Tables` i `UserGames` (obie tylko `isClosed != true`),
  - i pokazywać te gry, gdzie użytkownik występuje w `rows`.
- Widok admina „Gry do potwierdzenia”:
  - analogicznie agregować gry z obu kolekcji,
  - admin potwierdza/anuluje obecność zarówno dla gier admina, jak i użytkowników.

To spełnia pkt 4c i 6.

---

## 4) Mapowanie wymagań 1–7 na implementację

1. „Gry użytkowników” = funkcje jak „Tabele Gier”
   - reużycie logiki tabel i modala szczegółów,
   - osobne źródło danych: `UserGames`.

2. Bez „Podsumowanie gry” i „Statystyki”
   - UI user/admin dla tej zakładki renderuje tylko: panel lat + tabela gier + modal szczegółów.

3 + 3b. Panel lat jak w „Gry admina”
   - ten sam mechanizm wyliczania lat z `gameDate`,
   - rok widoczny dopiero po pojawieniu się gry.

4 + 4b. Uprawniony użytkownik dodaje/edytuje/usuwa gry i szczegóły
   - pełny CRUD na `UserGames` i `UserGames/{gameId}/rows`.

4c. Dodany gracz widzi grę w „Gry do potwierdzenia”
   - warunek: ma uprawnienie `confirmationsTab`.

5. Użytkownik bez prawa zatwierdzania innych
   - w zakładce „Gry do potwierdzenia” użytkownik widzi i modyfikuje tylko własny status potwierdzenia (jak obecnie),
   - admin dalej ma akcje dla wszystkich graczy.

6. Admin widzi gry użytkowników w „Gry do potwierdzenia”
   - agregacja z `UserGames` + działania potwierdzeń przez admina.

7. Admin w zakładce „Gry użytkowników” też ma pełny CRUD
   - analogiczne UI jak dla użytkownika, ale bez PIN gate i z pełnym dostępem.

---

## 5) Ocena Firebase: czy obecna konfiguracja wystarczy?

## 5.1 Konfiguracja klienta
Obecny `firebase-config.js` jest wystarczający do podpięcia nowej kolekcji (to ten sam projekt i ten sam Firestore).

## 5.2 Czy trzeba dodać nową kolekcję?
**Technicznie nie trzeba**, ale **projektowo zdecydowanie warto** dodać `UserGames` dla bezpiecznej separacji danych od statystyk.

## 5.3 Czy trzeba zmienić Rules?
- Jeżeli pozostawiacie model „otwarty” (`allow read, write: if true`) — formalnie nie trzeba dla samego działania.
- Jeżeli chcecie kontrolę zgodną z rolami/uprawnieniami — tak, trzeba zmienić Rules.

W praktyce rekomendowane minimum:
1. Dodać bloki rules dla nowej kolekcji `UserGames` i jej subkolekcji `rows`, `confirmations`.
2. Docelowo przejść z „open rules” na reguły oparte o Firebase Auth + custom claims (admin/user), bo sam PIN po stronie klienta nie zabezpiecza danych na poziomie Firestore.

---

## 6) Szkic reguł Firestore (wariant przejściowy i docelowy)

## 6.1 Wariant przejściowy (utrzymanie obecnej filozofii „open”)
- dopisać:
  - `match /UserGames/{gameId} { allow read, write: if true; }`
  - `match /UserGames/{gameId}/rows/{rowId} { allow read, write: if true; }`
  - `match /UserGames/{gameId}/confirmations/{playerId} { allow read, write: if true; }`

Ten wariant działa funkcjonalnie, ale nie zwiększa bezpieczeństwa.

## 6.2 Wariant docelowy (zalecany)
- `read`: tylko zalogowani,
- `write` do `UserGames`: admin lub właściciel gry,
- `write` do `confirmations`: admin lub sam gracz (`playerId == request.auth.uid`),
- `write` do `Tables` (adminowych): tylko admin.

Do tego potrzebne jest uruchomienie Firebase Authentication i mapowanie graczy na UID.

---

## 7) Czy potrzebne nowe indeksy Firestore?

Prawdopodobnie nie na start, jeśli utrzymacie podobny wzorzec zapytań (`orderBy(createdAt)` + odczyty subkolekcji per gra).

Możliwe indeksy do dodania później (gdy pojawią się błędy konsoli):
- dla `UserGames`: `orderBy(createdAt)`,
- ewentualnie złożone dla filtrów typu `where(isClosed == false) + orderBy(gameDate/createdAt)`.

---

## 8) Plan wdrożenia (kolejność)

1. Dodać model `UserGames` + subkolekcje `rows` i `confirmations`.
2. Zbudować zakładkę „Gry użytkowników” (user) jako klon „Tabele Gier” bez Podsumowania/Statystyk.
3. Dodać analogiczny panel „Gry użytkowników” w adminie (pełny CRUD).
4. Rozszerzyć „Gry do potwierdzenia” (admin + user) o agregację z `UserGames`.
5. Dodać/uzupełnić rules dla `UserGames`.
6. Testy scenariuszy uprawnień (PIN + role + potwierdzenia).

---

## 9) Ryzyka i kontrola jakości

1. **Ryzyko przecieku danych do statystyk**
   - redukcja: osobna kolekcja `UserGames`.
2. **Ryzyko braku realnego bezpieczeństwa przy open rules**
   - redukcja: docelowo Firebase Auth + claims.
3. **Ryzyko niespójności nazw graczy**
   - redukcja: confirmations po `playerId`, nazwa tylko pomocniczo.
4. **Ryzyko duplikatów gracza w szczegółach gry**
   - redukcja: deduplikacja po `playerId/playerName` przy renderze potwierdzeń.

---

## 10) Odpowiedź końcowa

- **Czy obecna konfiguracja Firebase wystarczy?**
  - Dla samego uruchomienia funkcji: **tak** (na obecnym, otwartym modelu reguł).

- **Czy trzeba dodać nową kolekcję?**
  - **Rekomendowane: tak** — `UserGames` (oraz `rows`, `confirmations` jako subkolekcje), żeby trwale odseparować gry użytkowników od statystyk admina.

- **Czy trzeba zmienić Rules?**
  - **Minimum techniczne:** dopisać match-e dla `UserGames`.
  - **Minimum bezpieczeństwa (zalecane):** przejście z `allow true` na role przez Firebase Auth (admin/właściciel/sam gracz).

