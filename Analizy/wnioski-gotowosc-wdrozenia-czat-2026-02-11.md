# Wnioski: gotowość wdrożenia funkcjonalności „Czat” po konfiguracji Firestore

## Aktualizacja po zmianie typów pól
Potwierdzam: skoro pola `createdAt` i `expireAt` zostały już ustawione jako **Timestamp**, to najważniejszy warunek techniczny pod TTL jest spełniony.

To jest duży krok do przodu. Nadal jednak automatyczne usuwanie wiadomości zacznie działać dopiero po ręcznym włączeniu polityki TTL dla pola `expireAt`.

## Krótka odpowiedź
**Jesteś blisko gotowości wdrożenia.**
Po zmianie pól na Timestamp pozostaje przede wszystkim:
1. włączyć Firestore TTL policy,
2. (jeśli jeszcze niegotowe) domknąć frontend czatu i testy uprawnień/real-time.

---

## Krok po kroku: jak ustawić Firestore TTL policy (klik po kliku)

Poniżej instrukcja dokładnie „co i gdzie kliknąć” w Google Cloud / Firestore:

### Wariant A (najczęściej dostępny): z poziomu Firestore Database
1. Wejdź do **Google Cloud Console**: https://console.cloud.google.com/
2. U góry wybierz właściwy **projekt** (ten sam, w którym masz kolekcję `chat_messages`).
3. Z lewego menu przejdź do: **Firestore Database**.
4. Wejdź w zakładkę **Data** i upewnij się, że widzisz kolekcję `chat_messages` (to tylko kontrola, nic nie zmieniasz).
5. Następnie przejdź do zakładki **TTL** (czasem widoczna jako osobna karta obok „Data/Rules/Indexes/Usage”).
6. Kliknij przycisk typu **Create policy** / **Add TTL policy**.
7. W formularzu ustaw:
   - **Collection group**: `chat_messages`
   - **Timestamp field**: `expireAt`
8. Zatwierdź: **Create** / **Save**.
9. Po utworzeniu sprawdź status polityki (na początku zwykle „Building/Enabling”).
10. Poczekaj aż status zmieni się na **Active/Enabled**.

### Wariant B (gdy nie widzisz karty TTL w Firestore)
1. W Google Cloud Console otwórz menu główne (☰).
2. Wejdź: **Firestore Database** → **Fields** (czasem: „Indexes and fields” / „Single field”).
3. Wyszukaj lub dodaj konfigurację dla:
   - kolekcji: `chat_messages`
   - pola: `expireAt`
4. Włącz opcję **TTL** dla tego pola.
5. Zapisz zmiany i poczekaj na status aktywny.

> Uwaga: nazwy przycisków mogą się minimalnie różnić zależnie od wersji UI, ale logika pozostaje ta sama: **wskazujesz kolekcję `chat_messages` i pole czasu `expireAt` jako TTL field**.

---

## Jak zweryfikować, że TTL działa poprawnie
1. W `chat_messages` dodaj testowy dokument z:
   - `createdAt`: bieżący timestamp,
   - `expireAt`: timestamp ustawiony np. kilka minut „wstecz” (do testu).
2. Odczekaj chwilę (TTL działa asynchronicznie, usuwanie nie jest natychmiastowe).
3. Sprawdź, czy dokument zniknie automatycznie bez ręcznego kasowania.

Jeśli nie znika od razu, to zwykle normalne — TTL wykonuje czyszczenie partiami.

---

## Status gotowości po Twojej zmianie
**Status: prawie gotowe po stronie danych Firestore.**

- ✅ `createdAt` i `expireAt` jako Timestamp — spełnione.
- ⏳ TTL policy dla `chat_messages.expireAt` — do włączenia/aktywacji (jeśli jeszcze nie jest aktywna).
- ⏳ Pełna gotowość produkcyjna całości funkcji czatu nadal zależy od domknięcia UI + uprawnień + testów E2E.

## Minimalna lista „DONE” przed wdrożeniem
1. Aktywna TTL policy: `chat_messages` + `expireAt`.
2. Potwierdzony test automatycznego usuwania wiadomości po `expireAt`.
3. Domknięta funkcja czatu w aplikacji (UI, PIN, `chatTab`, real-time, usuwanie przez admina).
4. Testy scenariuszy dostępu i komunikacji real-time.
