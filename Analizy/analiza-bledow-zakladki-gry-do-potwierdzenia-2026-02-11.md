# Analiza poprawności działania zakładki „Gry do Potwierdzenia”

Data: 2026-02-11  
Typ: analiza diagnostyczna (bez zmian w kodzie aplikacji)

## Prompt użytkownika (kontekst)

> „Przeprowadź analizę poprawności działania zakładki "Gry do Potwierdzenia".  
> Obecnie w widoku admina pojawia się błąd: Nie udało się pobrać listy potwierdzeń.  
> A w widoku użytkownika: Nie udało się pobrać gier do potwierdzenia.  
> Znajdź przyczynę błędu i zaproponuj rozwiazanie. Sprawdź czy połączenie z Firebase jest poprawne.”

---

## 1. Co zostało sprawdzone

1. Przejrzano implementację zakładki „Gry do potwierdzenia” (widok użytkownika i admina) w `Main/app.js`, w tym miejsca ustawiające komunikaty błędu.
2. Zweryfikowano konfigurację Firebase w `config/firebase-config.js`.
3. Uruchomiono lokalnie aplikację i wykonano test połączenia z Firestore z poziomu przeglądarki (Playwright), aby odczytać:
   - kolekcję gier (`Tables`),
   - podkolekcję `rows`,
   - podkolekcję `confirmations`.

---

## 2. Wynik diagnostyki

### 2.1. Połączenie Firebase jako takie działa

Test odczytu `Tables` oraz `Tables/{gameId}/rows` zakończył się powodzeniem (dane były odczytywane), więc inicjalizacja Firebase i podstawowe połączenie z Firestore są poprawne.

### 2.2. Błąd dotyczy uprawnień do podkolekcji `confirmations`

W teście Firestore zwrócił:

- `confErr.code = "permission-denied"`
- `confErr.message = "Missing or insufficient permissions."`

To jednoznacznie wskazuje, że odczyt `Tables/{gameId}/confirmations` jest blokowany przez reguły Firestore.

### 2.3. Dlaczego objaw jest identyczny u admina i użytkownika

Oba widoki (admin i użytkownik) korzystają z tej samej podkolekcji `confirmations` i łapią wyjątek w `catch`, po czym ustawiają ogólny komunikat błędu:

- użytkownik: „Nie udało się pobrać gier do potwierdzenia.”
- admin: „Nie udało się pobrać listy potwierdzeń.”

Czyli sam kod zakładki działa zgodnie z logiką obsługi błędu, ale zapytania Firestore nie przechodzą przez reguły bezpieczeństwa.

---

## 3. Przyczyna źródłowa

Brak (lub zbyt restrykcyjna) reguła Firestore dla ścieżki:

- `Tables/{tableId}/confirmations/{playerId}`

W konsekwencji aplikacja nie może odczytać/aktualizować potwierdzeń obecności.

---

## 4. Rekomendowane rozwiązanie

## 4.1. Dodać reguły Firestore dla `confirmations`

Minimalnie (dla obecnego modelu projektu, jeśli aplikacja jest otwarta bez autoryzacji):

```txt
match /Tables/{tableId}/confirmations/{playerId} {
  allow read, write: if true;
}
```

Docelowo (bezpieczniej) należy ograniczyć reguły, np. do zalogowanych użytkowników i/lub konkretnych warunków roli.

## 4.2. Po wdrożeniu reguł wykonać retest

Sprawdzić ponownie:

1. Odczyt listy gier do potwierdzenia przez użytkownika.
2. Odczyt listy potwierdzeń przez admina.
3. Kliknięcia „Potwierdź/Anuluj” (czy zapis przechodzi do `confirmations`).

## 4.3. (Opcjonalnie) Ulepszyć diagnostykę w UI

W `catch` można dopisać kod błędu (np. `permission-denied`) do statusu, aby szybciej diagnozować podobne przypadki produkcyjne.

---

## 5. Konkluzja

- Problem **nie wynika z braku połączenia z Firebase jako platformą**.
- Problem wynika z **uprawnień Firestore dla podkolekcji `confirmations`**.
- Po dodaniu właściwej reguły Firestore zakładka „Gry do Potwierdzenia” powinna działać poprawnie zarówno dla admina, jak i użytkownika.
