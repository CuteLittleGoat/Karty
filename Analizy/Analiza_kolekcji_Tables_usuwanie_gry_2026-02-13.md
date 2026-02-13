# Analiza: wykorzystanie kolekcji `Tables` i efekt usunięcia gry przez UI

## Prompt użytkownika
> Przeprowadź analizę wykorzystania kolekcji "Tables". Czy jak przez UI aplikacji usunę jakąś grę to dane zostaną skasowane z Firebase?

## Zakres i metoda
Analiza została wykonana na podstawie kodu źródłowego frontendu (`Main/app.js`) oraz konfiguracji Firebase (`config/firebase-config.js`).

## Ustalenia

### 1) Kolekcja gier w UI admina wskazuje na `Tables`
- W kodzie domyślna kolekcja gier to `Tables` (`GAMES_COLLECTION = "Tables"`).
- Funkcja `getGamesCollectionName()` pobiera nazwę z `window.firebaseConfig.gamesCollection`, a jeśli nie ma override, używa `Tables`.
- W bieżącej konfiguracji `config/firebase-config.js` ustawiono `gamesCollection: "Tables"`.

Wniosek: zakładka gier admina operuje na dokumentach w kolekcji `Tables`.

### 2) Co dokładnie robi przycisk „Usuń” w UI
W obu miejscach zarządzania grami (admin games i user games manager) logika usuwania wygląda tak samo:
1. Pobiera referencję dokumentu gry: `db.collection(gamesCollectionName).doc(game.id)`.
2. Odczytuje subkolekcję szczegółów (`rows`).
3. Odczytuje subkolekcję potwierdzeń (`confirmations`).
4. W batchu usuwa:
   - wszystkie dokumenty z `rows`,
   - wszystkie dokumenty z `confirmations`,
   - sam dokument gry.
5. Wykonuje `await batch.commit()`.

Wniosek: usunięcie gry z UI wykonuje realny delete w Firestore (nie jest to „soft delete”).

### 3) Odpowiedź na pytanie użytkownika
**Tak — po kliknięciu „Usuń” gra jest kasowana z Firebase** (Firestore), razem z danymi w subkolekcjach `rows` i `confirmations` pod tym dokumentem gry.

## Doprecyzowanie
- Dotyczy to kolekcji wskazanej przez `gamesCollectionName`.
- W aktualnej konfiguracji jest to `Tables`, więc usunięcie gry w tym widoku usuwa dane z `Tables/{gameId}` + `Tables/{gameId}/rows/*` + `Tables/{gameId}/confirmations/*`.
