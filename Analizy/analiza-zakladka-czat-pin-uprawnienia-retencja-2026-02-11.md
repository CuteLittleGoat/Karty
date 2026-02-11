# Analiza wdrożenia zakładki „Czat” (PIN + uprawnienia + retencja 1 miesiąc)

## 1. Cel biznesowy
Dodać nową zakładkę **„Czat”** dla graczy, z dostępem kontrolowanym przez:
- **PIN gracza** (5 cyfr),
- **uprawnienie per gracz** (analogicznie do obecnej logiki ograniczania dostępu do „Najbliższa gra”).

Dodatkowo:
- wiadomości mają być widoczne dla uprawnionych graczy,
- każda wiadomość ma zawierać nazwę autora (z zakładki „Gracze”),
- wiadomości mają być automatycznie usuwane po ~1 miesiącu.

---

## 2. Jak działa obecnie aplikacja (punkt wyjścia)

### 2.1. PIN i uprawnienia graczy
Aktualnie aplikacja:
- trzyma listę graczy w dokumencie Firestore `app_settings/player_access`,
- mapuje PIN → gracz po stronie klienta,
- sprawdza czy gracz ma uprawnienie do danej zakładki (`permissions.includes(tabKey)`),
- ma zdefiniowaną listę dodatkowych zakładek uprawnień w `AVAILABLE_PLAYER_TABS` (na dziś: tylko `nextGameTab`).

Wniosek: mechanizm uprawnień już istnieje i można go rozszerzyć o `chatTab` bez zmiany modelu na poziomie „players[]”.

### 2.2. Aktualności
Aktualności działają przez kolekcję `admin_messages` i `onSnapshot`, więc UI już ma wzorzec „real-time” oparty o Firestore.

Wniosek: czat może użyć analogicznego podejścia real-time, ale z oddzielną kolekcją i własną walidacją dostępu.

---

## 3. Proponowany zakres funkcjonalny „Czat”

## 3.1. UX użytkownika (strefa gracza)
1. Użytkownik klika zakładkę **Czat**.
2. Widzi bramkę PIN (jak w „Najbliższa gra”).
3. Po wpisaniu PIN:
   - jeżeli PIN należy do gracza z uprawnieniem `chatTab` → wejście do czatu,
   - w przeciwnym razie → komunikat „Błędny PIN lub brak uprawnień do zakładki Czat”.
4. Po wejściu użytkownik widzi:
   - listę wiadomości (od najstarszej do najnowszej albo odwrotnie — do decyzji, technicznie obie opcje są proste),
   - pole wpisywania,
   - przycisk „Wyślij”.
5. Po wysłaniu wiadomości inni uprawnieni użytkownicy widzą ją w czasie rzeczywistym z prefiksem autora, np. `GraczA: Cześć!`.

## 3.2. UX administratora (panel „Gracze”)
W edycji uprawnień gracza pojawia się nowa pozycja:
- `chatTab` → etykieta „Czat”.

To pozwoli odwzorować scenariusz z przykładu:
- GraczA (PIN 12345): ma `chatTab` → wejdzie,
- GraczB (PIN 54321): ma `chatTab` → wejdzie,
- GraczC (PIN 67890): brak `chatTab` → nie wejdzie.

---

## 4. Proponowany model danych (Firestore)

## 4.1. Istniejący dokument graczy
Bez zmiany struktury głównej:
- `app_settings/player_access` (pole `players[]`)
- każdy `player.permissions[]` rozszerzony o możliwą wartość `chatTab`.

## 4.2. Nowa kolekcja czatu
Proponowana kolekcja: `chat_messages`

Przykładowy dokument wiadomości:
```json
{
  "text": "Cześć!",
  "authorName": "GraczA",
  "authorId": "player-1700000000000",
  "authorPinHash": "opcjonalnie, jeśli będzie potrzebny audyt",
  "createdAt": "serverTimestamp",
  "expireAt": "timestamp + 30 dni",
  "source": "web-player"
}
```

Uwagi:
- **Minimalne wymagane pola**: `text`, `authorName`, `authorId`, `createdAt`, `expireAt`.
- `authorName` zapisujemy denormalizowane, żeby po zmianie nazwy gracza historyczne wiadomości mogły zachować nazwę z chwili wysyłki (to zwykle lepszy UX dla czatu).
- `expireAt` będzie użyte do automatycznego kasowania (TTL).

---

## 5. Retencja 1 miesiąc (automatyczne kasowanie)

Są 2 sensowne warianty:

## 5.1. Wariant A (zalecany): Firestore TTL Policy
Włączasz TTL na kolekcji `chat_messages` po polu `expireAt`.

Jak działa:
- przy zapisie wiadomości ustawiasz `expireAt = createdAt + 30 dni`,
- Firestore usuwa dokumenty asynchronicznie po przekroczeniu czasu.

Plusy:
- bez backendu i bez Cloud Scheduler,
- niski koszt utrzymania.

Minusy:
- usuwanie nie jest „co do sekundy” (zwykle eventual, może zająć pewien czas).

## 5.2. Wariant B: Cloud Function (harmonogram)
Cron (np. co godzinę) usuwa wpisy starsze niż 30 dni.

Plusy:
- większa kontrola nad oknem usuwania.

Minusy:
- większa złożoność (Functions + Scheduler + IAM + deployment).

Rekomendacja: **Wariant A (TTL)** jest wystarczający dla opisanych wymagań.

---

## 6. Reguły bezpieczeństwa Firestore (ważne)

Obecna aplikacja opiera się na weryfikacji PIN w kliencie (frontend). To jest wygodne, ale samo w sobie nie jest mocnym zabezpieczeniem serwerowym.

Minimalny poziom dla obecnej architektury:
- dopuścić odczyt/zapis `chat_messages` dla aplikacji (jak inne kolekcje),
- walidować podstawowy kształt dokumentu (`text` jako string, limity długości, obecność `createdAt/expireAt`).

Lepszy poziom (docelowo):
- dodać Firebase Authentication i mapowanie użytkownika do gracza,
- wtedy reguły Firestore mogą rzeczywiście egzekwować, że pisze/czyta tylko zalogowany gracz z rolą/uprawnieniem `chatTab`.

W obecnym stanie (bez Auth) uprawnienie `chatTab` pozostaje kontrolą UI/klienta, czyli „soft access control”.

---

## 7. Indeksy Firestore

Dla prostego czatu najczęściej wystarczy:
- zapytanie: `orderBy("createdAt", "asc")` (lub `desc`) + `limit(...)`.

To zazwyczaj nie wymaga złożonego indeksu kompozytowego.

Jeżeli dojdą filtry typu „tylko ostatnie 30 dni” (`where(createdAt, ">=", ...)`) + `orderBy(createdAt)`, Firestore może poprosić o konkretny indeks — wtedy należy go utworzyć z linku w błędzie konsoli.

---

## 8. Zakres zmian w kodzie frontend (szacunek)

1. **Main/index.html**
   - dodać przycisk zakładki `Czat`,
   - dodać panel `#chatTab` z:
     - bramką PIN,
     - listą wiadomości,
     - formularzem wysyłki.

2. **Main/app.js**
   - rozszerzyć `AVAILABLE_PLAYER_TABS` o `chatTab`.
   - dodać stan sesji dla PIN czatu (osobny klucz `sessionStorage`, np. `chatPinVerified`).
   - dodać `initChatGate()` i `updateChatVisibility()`.
   - dodać `initChatMessages()`:
     - subskrypcja `chat_messages` (`onSnapshot`),
     - render wpisów z `authorName` i `text`,
     - wysyłka nowego wpisu (`add`).
   - przy zapisie wiadomości ustawiać `createdAt` (serverTimestamp) i `expireAt` (+30 dni).

3. **Main/styles.css**
   - style listy wiadomości i formularza (bez zmian skomplikowanych — raczej rozszerzenie istniejącego systemu kart/sekcji).

4. **Panel admina / Gracze**
   - nowa etykieta uprawnienia „Czat” w modalu uprawnień.

---

## 9. Ryzyka i decyzje projektowe

1. **Tożsamość po PIN**
   - obecnie PIN identyfikuje gracza lokalnie; brak twardego uwierzytelnienia.
   - decyzja: czy to wystarcza biznesowo, czy w kolejnej fazie wdrażamy Firebase Auth.

2. **Zmiana nazwy gracza**
   - jeśli trzymamy `authorName` denormalizowane, stare wiadomości nie zmienią autora po edycji nazwy gracza (zwykle pożądane).

3. **Skalowanie listy wiadomości**
   - przy dużym wolumenie warto dodać paginację (`limit`, „wczytaj starsze”).

4. **Moderacja**
   - czy admin ma mieć możliwość usuwania pojedynczych wiadomości ręcznie? (na ten moment brak w wymaganiach).

---

## 10. Plan wdrożenia (krok po kroku)

1. Dodać `chatTab` do listy uprawnień graczy i UI panelu „Gracze”.
2. Dodać UI zakładki „Czat” i bramkę PIN.
3. Dodać subskrypcję oraz wysyłkę wiadomości do `chat_messages`.
4. Dodać `expireAt` podczas tworzenia wiadomości.
5. Skonfigurować TTL w Firestore dla `chat_messages.expireAt`.
6. Ustawić/zweryfikować reguły Firestore dla `chat_messages`.
7. Test scenariuszy A/B/C (uprawniony/nieuprawniony) oraz komunikacji A↔B.

---

## 11. Odpowiedź na pytanie „czy wymaga zmian w Firebase?”

Tak — **wymaga** co najmniej:
1. Utworzenia kolekcji `chat_messages` (powstanie automatycznie przy pierwszym zapisie).
2. Aktualizacji reguł Firestore tak, aby obsłużyć odczyt/zapis tej kolekcji.
3. Włączenia polityki TTL dla pola `expireAt` (jeśli wybieramy wariant automatycznego usuwania bez Cloud Functions).

Opcjonalnie (zalecenie długoterminowe):
4. Dodania Firebase Auth dla twardego egzekwowania uprawnień po stronie serwera.

---

## 12. Podsumowanie
Funkcjonalność „Czat” jest **spójna z obecną architekturą** i można ją wdrożyć bez przebudowy aplikacji.
Najmniejszy bezpieczny kosztowo zakres to:
- rozszerzenie uprawnień graczy o `chatTab`,
- nowa kolekcja `chat_messages`,
- PIN-gate + real-time `onSnapshot`,
- retencja 30 dni przez **Firestore TTL**.

To w pełni pokrywa przedstawiony scenariusz A/B/C i wymóg podpisywania wiadomości nazwą gracza.
