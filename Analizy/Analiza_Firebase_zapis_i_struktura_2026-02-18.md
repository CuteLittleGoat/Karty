# Analiza Firebase – zapis danych z UI i poprawność struktury

## Prompt użytkownika
> „Przeprowadź pełną analizę kodu pod kątem zapisu do Firebase i czy struktura Firebase jest poprawna. Czy wszystkie dane wpisane w UI aplikacji zapisują się w Firebase i będą gotowe do wyświetlenia po ponownym uruchomieniu aplikacji.”

## Zakres analizy
Analiza została wykonana statycznie na kodzie frontend (`Main/app.js`) i konfiguracji (`config/firebase-config.js`) – bez wykonywania zapisu do realnego projektu Firebase.

---

## 1. Mapa struktury Firestore używanej przez aplikację

Na podstawie kodu aplikacja używa następujących kolekcji/dokumentów:

### 1.1 Główne gry administratora
- **Kolekcja:** `Tables` (domyślnie; konfigurowalne przez `gamesCollection`)  
- **Dokument gry:** pola m.in. `gameType`, `gameDate`, `name`, `isClosed`, `preGameNotes`, `postGameNotes`, `createdAt`  
- **Subkolekcje gry:**
  - `rows` – wiersze graczy (`playerName`, `entryFee`, `rebuy`, `payout`, `points`, `championship`, `createdAt`)
  - `confirmations` – potwierdzenia obecności (`playerId`, `playerName`, `confirmed`, `updatedBy`, `updatedAt`)

### 1.2 Gry użytkowników
- **Kolekcja:** `UserGames` (konfigurowalne przez `userGamesCollection`)  
- Struktura dokumentu i subkolekcji analogiczna jak wyżej; dodatkowo pola typu `createdByPlayerId`, `createdByPlayerName`.

### 1.3 Ustawienia aplikacji / gracze / regulamin
- **Kolekcja:** `app_settings`
  - **Dokument:** `player_access` (tablica `players`, pola uprawnień, PIN, `updatedAt`)
  - **Dokument:** `rules` (`text`, `updatedAt`, `source`)

### 1.4 Komunikaty administratora
- **Kolekcja:** `admin_messages`
  - **Dokument:** `admin_messages` (`message`, `createdAt`, `source`)

### 1.5 Czat
- **Kolekcja:** `chat_messages`
  - dokumenty dodawane `add(...)` z polami `text`, `authorName`, `authorId`, `createdAt`, `expireAt`, `source`

### 1.6 Statystyki administracyjne
- **Kolekcja:** `admin_games_stats`
  - dokument per rok (`doc(year)`):
    - `rows` (manualne ustawienia wag per gracz)
    - `visibleColumns` (konfiguracja widocznych kolumn)

### 1.7 Kalkulator administracyjny
- **Kolekcja:** `calculators`
  - dokumenty: `tournament`, `cash`
  - pola stanu tabel kalkulatora + `updatedAt`

---

## 2. Czy dane wpisane w UI zapisują się do Firebase?

## 2.1 Funkcje UI, które **zapisują** do Firestore

### Gry (admin + user games)
- Dodanie gry: `collection(...).add(newGamePayload)`.
- Edycja rodzaju gry / daty / nazwy / statusu zamknięcia: `update(...)`.
- Notatki do gry i po grze: `update({ preGameNotes/postGameNotes ... })`.
- Usuwanie gry: batch delete dokumentu gry + `rows` + `confirmations`.
- Dodawanie wiersza gracza: `collection(rows).add(...)`.
- Edycja gracza i pól liczbowych: `update(...)`.
- Zbiorcze ustawienie wpisowego: `Promise.all(update(...))`.
- Usuwanie wiersza: `delete()`.

### Potwierdzenia
- Użytkownik „Potwierdź/Anuluj”: `set(..., {merge:true})` w `confirmations`.
- Administrator „Potwierdź/Anuluj”: analogicznie `set(..., {merge:true})`.

### Gracze i uprawnienia
- Zapis listy graczy/uprawnień/PIN: `set({ players, updatedAt })` w `app_settings/player_access`.

### Czat i wiadomości admina
- Wysłanie wiadomości gracza: `chat_messages.add(...)`.
- Usunięcie pojedynczej wiadomości: `chat_messages.doc(id).delete()`.
- Czyszczenie wiadomości po `expireAt`: batch delete.
- Wiadomość admina do graczy: `admin_messages/admin_messages.set(...)`.

### Regulamin
- Zapis: `app_settings/rules.set({ text, updatedAt, source }, {merge:true})`.

### Statystyki
- Zmiana wag/ustawień ręcznych: zapis do `admin_games_stats/<year>` (`rows`).
- Zmiana widoczności kolumn: zapis do `admin_games_stats/<year>` (`visibleColumns`).

### Kalkulator
- Zmiany w tabelach kalkulatora zapisywane cyklicznie (debounce) do `calculators/tournament` lub `calculators/cash`.

Wniosek: **większość danych modyfikowanych w UI ma mapowanie do zapisu Firestore i jest projektowo przygotowana do odtworzenia po restarcie**.

---

## 3. Czy po ponownym uruchomieniu aplikacji dane będą gotowe do wyświetlenia?

Tak, dla głównych funkcji aplikacji (gry, szczegóły, potwierdzenia, gracze/uprawnienia, wiadomości, regulamin, statystyki, kalkulator), bo:
- dane są pobierane przez `onSnapshot(...)` lub `get(...)` z tych samych ścieżek, do których następuje zapis,
- UI odtwarza stan na podstawie dokumentów i subkolekcji.

To spełnia warunek „persistencji po restarcie”, o ile zapis do Firestore faktycznie się powiedzie (reguły/uprawnienia/sieć).

---

## 4. Ważne luki / ryzyka (czyli kiedy „nie wszystko” się utrzyma)

1. **Fire-and-forget bez obsługi błędu**  
   W wielu miejscach zapis jest wykonywany jako `void db...update(...)` bez `await`/`catch`. Jeśli zapis się nie powiedzie (np. `permission-denied`), UI może dawać wrażenie edycji lokalnej, ale stan nie zapisze się trwale.

2. **Debounce a szybkie zamknięcie aplikacji**  
   Część pól (np. nazwy, statystyki, kalkulator) zapisuje się z opóźnieniem (`scheduleDebouncedUpdate`). Zamknięcie zakładki natychmiast po wpisaniu może przerwać wysłanie ostatniej zmiany.

3. **Dane sesyjne nie są w Firebase (to celowe)**  
   Weryfikacja PIN i niektóre stany dostępu są trzymane w `sessionStorage`; po restarcie sesji użytkownik musi przejść autoryzację ponownie. To nie jest błąd struktury danych Firestore, ale warto mieć świadomość.

4. **Spójność identyfikatorów w potwierdzeniach**  
   W panelu admina ID dokumentu potwierdzenia bywa ustalane fallbackowo (np. po nazwie gracza). Przy niespójnych danych graczy może to tworzyć różne ID dokumentów dla tej samej osoby.

---

## 5. Ocena poprawności struktury Firebase

### Ocena ogólna
- Struktura jest **spójna funkcjonalnie** i zgodna z logiką UI.
- Jest jasny podział: gry admina (`Tables`), gry użytkowników (`UserGames`), szczegóły w `rows`, potwierdzenia w `confirmations`, ustawienia globalne w `app_settings`, moduły niezależne (`chat_messages`, `admin_messages`, `admin_games_stats`, `calculators`).

### Co jest poprawne
- Dane gry i dane wierszy graczy są prawidłowo rozdzielone.
- Użycie subkolekcji dla `rows` i `confirmations` jest sensowne pod kątem skalowania i odczytu częściowego.
- Wykorzystanie `serverTimestamp()` w kluczowych miejscach jest poprawne.
- Konfigurowalne nazwy kolekcji przez `firebase-config.js` to plus utrzymaniowy.

### Co warto dopracować (rekomendacje)
- Dodać `await + catch` (lub centralny handler błędów) we wszystkich zapisach typu `void ...update(...)`.
- Dodać „flush na blur/submit” dla pól debounced, aby minimalizować utratę ostatniej zmiany.
- Ujednolicić strategię ID dla `confirmations` (preferencyjnie zawsze `playerId`, gdy istnieje).
- Zweryfikować reguły Firestore pod wszystkie kolekcje i subkolekcje używane przez UI.

---

## 6. Odpowiedź końcowa na pytanie

- **Czy struktura Firebase jest poprawna?**  
  **Tak – jest logiczna i spójna z UI.**

- **Czy wszystkie dane wpisane w UI zapisują się do Firebase i będą po restarcie?**  
  **W zdecydowanej większości tak** (gry, wiersze, potwierdzenia, gracze/uprawnienia, regulamin, wiadomości, czat, statystyki, kalkulator).  
  **Zastrzeżenia:** część zapisów nie ma twardej obsługi błędów i część pól zapisuje się z debounce, więc w warunkach błędu uprawnień/sieci lub szybkiego zamknięcia zakładki pojedyncze zmiany mogą się nie utrwalić.

