# Projekt wdrożenia funkcjonalności „Czat” (bez TTL Policy w Firebase)

## 1. Kontekst decyzji
Na podstawie dotychczasowych analiz przyjmujemy, że:
- **nie wdrażamy Firebase TTL Policy**,
- retencja „30 dni” musi zostać rozwiązana inaczej,
- dostęp do czatu pozostaje zgodny z dotychczasowym modelem aplikacji: **PIN gracza + uprawnienie per zakładka**.

To oznacza, że za usuwanie starszych wiadomości odpowiada aplikacja (logika po stronie frontendu/admina), a nie automatyka Firestore oparta o TTL.

---

## 2. Stan obecny aplikacji (punkt startowy)

### 2.1. Uprawnienia i PIN
- Gracze są przechowywani w dokumencie `app_settings/player_access`.
- Każdy gracz ma m.in. `pin` i listę `permissions[]`.
- Uprawnienia zakładek są już obsługiwane (obecnie m.in. `nextGameTab`).

Wniosek: można dopisać nowe uprawnienie `chatTab` bez przebudowy modelu graczy.

### 2.2. Wzorzec real-time
- Aktualności działają przez `admin_messages` + `onSnapshot`.

Wniosek: czat może działać analogicznie — osobna kolekcja + nasłuch snapshotów.

### 2.3. Aktualna struktura Firebase (realna, używana)
1. `admin_messages` — komunikaty administratora.
2. `app_settings/player_access` — lista graczy, PIN-y, uprawnienia, `appEnabled`.
3. `app_settings/rules` — regulamin (`text`, `updatedAt`, `source`).
4. `Tables/{tableId}` + `rows/{rowId}` — dane turniejów i (wg konfiguracji) gier.
5. `Collection1` — kolekcja historycznie uwzględniona w rules.

### 2.4. Aktualne Firestore Rules (realne, używane)
Obecny model bezpieczeństwa pozostaje „zaufany” (`allow read, write: if true`) dla wskazanych kolekcji. Brakuje tylko bloku dla `chat_messages`, który trzeba dodać przy wdrożeniu czatu.

---

## 3. Docelowy zakres funkcji „Czat”

### 3.1. Strefa gracza
1. Gracz klika zakładkę **Czat**.
2. Widzi bramkę PIN.
3. Po wpisaniu PIN aplikacja:
   - mapuje PIN na gracza,
   - sprawdza `permissions.includes('chatTab')`.
4. Gdy warunek jest spełniony:
   - włącza widok wiadomości,
   - uruchamia `onSnapshot` dla kolekcji `chat_messages`.
5. Gracz wpisuje treść i klika **Wyślij**.

### 3.2. Administrator
1. W zakładce **Gracze** pojawia się uprawnienie `chatTab` (etykieta „Czat”).
2. W sekcji czatu admina pojawia się:
   - usuwanie pojedynczej wiadomości,
   - masowe czyszczenie starych wiadomości (30 dni) — zgodnie z nową decyzją bez TTL.

---

## 4. Model danych czatu

Nowa kolekcja: `chat_messages`.

Przykładowy dokument:

```json
{
  "text": "Cześć wszystkim",
  "authorName": "GraczA",
  "authorId": "player-1700000000000",
  "createdAt": "Timestamp",
  "expireAt": "Timestamp",
  "source": "web-player"
}
```

### Pola wymagane
- `text` (string),
- `authorName` (string),
- `authorId` (string),
- `createdAt` (Timestamp),
- `expireAt` (Timestamp = `createdAt + 30 dni`).

### Pole opcjonalne
- `source` (`web-player`, `admin-panel`).

`expireAt` zachowujemy mimo braku TTL — pole będzie używane przez mechanizmy ręcznego/automatycznego czyszczenia uruchamiane z poziomu admina.

---

## 5. Retencja 30 dni bez Firebase TTL — warianty

## 5.1. Wariant rekomendowany: przycisk admina „Usuń starsze niż 30 dni”

### Jak działa
1. Admin przechodzi do zakładki **Czat** w panelu administratora.
2. Kliknięcie przycisku uruchamia zapytanie:
   - `where('expireAt', '<=', Timestamp.now())`.
3. Aplikacja usuwa dokumenty partiami (batch), np. po 200-500 rekordów.
4. Po zakończeniu pokazuje status: „Usunięto X wiadomości starszych niż 30 dni”.

### Zalety
- pełna kontrola admina,
- prosty model wdrożenia,
- brak zależności od usług dodatkowych.

### Ryzyka i ograniczenia
- wymaga świadomego klikania (to nie jest automatyczne „samo z siebie”),
- przy bardzo dużej liczbie wiadomości trzeba robić paginację/partie i aktualizować status postępu.

## 5.2. Wariant półautomatyczny: auto-cleanup przy wejściu admina w zakładkę „Czat”

### Jak działa
1. Po wejściu admina do zakładki czatu aplikacja wywołuje czyszczenie „w tle”.
2. Dodatkowo można zachować ręczny przycisk „Uruchom ponownie”, gdyby poprzednie czyszczenie zostało przerwane.

### Zalety
- admin nie musi pamiętać o regularnym klikaniu,
- zachowujemy sterowanie po stronie panelu.

### Ryzyka
- pierwsze wejście do zakładki może chwilowo obciążyć UI,
- trzeba dodać bezpieczniki przed wielokrotnym uruchamianiem naraz (flaga `cleanupInProgress`).

## 5.3. Wariant harmonogramowy (admin-triggered automation)

Jeżeli w przyszłości pojawi się potrzeba pełnej automatyzacji bez TTL:
- można dodać endpoint (np. Cloud Function HTTP callable lub własny backend),
- admin w panelu ustawia harmonogram i uruchamia „Start automatu”,
- cleanup wykonuje się cyklicznie (cron), ale nadal „pod kontrolą admina” na poziomie konfiguracji.

To wariant bardziej złożony infrastrukturalnie, ale najmniej zależny od ręcznych akcji.

---

## 6. Rekomendacja docelowa

Dla obecnej skali projektu rekomendowany jest zestaw:
1. **Przycisk „Usuń starsze niż 30 dni”** (manual).
2. Opcjonalnie: **auto-cleanup przy wejściu admina do zakładki Czat** (półautomat).

Taki model spełnia wymaganie „bez TTL policy”, a jednocześnie nie blokuje późniejszego przejścia na backendowy harmonogram.

---

## 7. Reguły Firestore po wdrożeniu czatu

Należy dodać blok:

```js
match /chat_messages/{docId} {
  allow read, write: if true;
}
```

Pełny plik rules (wariant zgodny z obecnym stylem projektu):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }
  }
}
```

---

## 8. Plan wdrożenia krok po kroku (bez TTL)
1. Dodać `chatTab` do listy uprawnień graczy i UI checkboxów w panelu „Gracze”.
2. Dodać zakładkę UI „Czat” (gracz + admin).
3. Dodać `onSnapshot` i wysyłkę wiadomości do `chat_messages`.
4. Przy zapisie wiadomości zawsze ustawiać `createdAt` i `expireAt = +30 dni`.
5. Dodać usuwanie pojedynczej wiadomości przez admina.
6. Dodać czyszczenie masowe „Usuń starsze niż 30 dni” (query po `expireAt`).
7. (Opcjonalnie) uruchamiać czyszczenie automatycznie przy wejściu admina w „Czat”.
8. Zaktualizować Firestore Rules o `chat_messages`.
9. Wykonać testy E2E: PIN, uprawnienia, real-time, kasowanie pojedyncze i masowe.

---

## 9. Kryteria odbioru (Definition of Done)
1. Gracz bez `chatTab` nie wejdzie do czatu po PIN.
2. Gracz z `chatTab` widzi i wysyła wiadomości real-time.
3. Admin usuwa pojedynczą wiadomość.
4. Admin uruchamia „Usuń starsze niż 30 dni” i dostaje poprawny raport liczby usuniętych rekordów.
5. Po czyszczeniu w bazie nie ma dokumentów z `expireAt <= teraz`.
6. Firestore Rules zawierają blok `chat_messages`.

---

## 10. Podsumowanie końcowe
Projekt czatu jest gotowy do wdrożenia także bez TTL Policy. Najbezpieczniejsza ścieżka to manualny przycisk admina do czyszczenia + opcjonalne automatyczne uruchamianie tej samej procedury przy wejściu admina na zakładkę „Czat”. Dzięki temu zachowujemy prostotę obecnej architektury i pełną kontrolę operacyjną po stronie panelu administratora.
