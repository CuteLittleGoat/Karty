# Firebase – konfiguracja dla wiadomości PUSH (Firestore)

Poniższa instrukcja dotyczy konfiguracji Firebase tak, aby:
- panel admina mógł zapisywać wiadomości do `admin_messages`,
- aplikacja Android mogła je odczytać i wyświetlać jako PUSH (lokalne powiadomienia),
- pole „Najnowsze” w webowej zakładce **Aktualności** pokazywało ostatni komunikat.

## 1. Wybór projektu
1. Wejdź na [console.firebase.google.com](https://console.firebase.google.com).
2. Wybierz projekt **Karty-Turniej** (lub utwórz nowy, jeśli chcesz osobne środowisko).

## 2. Dodanie aplikacji Android
1. Kliknij ikonę **⚙ Project settings**.
2. W sekcji **Your apps** wybierz **Add app** → **Android**.
3. Uzupełnij pola:
   - **Android package name:** `com.karty.app`
   - **App nickname:** `Karty-Android-PUSH`
4. Kliknij **Register app**.
5. Pobierz plik `google-services.json`.
6. Wklej go do projektu w ścieżce:
   `MigracjaAndroid/AndroidApp/app/google-services.json`.

## 3. Włączenie Cloud Firestore
1. W menu po lewej wybierz **Firestore Database**.
2. Kliknij **Create database** (jeśli Firestore nie jest jeszcze włączony).
3. Wybierz tryb **Production** lub **Test** (na czas wdrożenia testów można użyć **Test**).
4. Wybierz lokalizację bazy danych i zatwierdź.

## 4. Kolekcje i nazewnictwo
Upewnij się, że w Firestore istnieją następujące kolekcje (nazwy muszą być dokładnie takie):
- **`admin_messages`** – kolekcja na wiadomości admina.
- **`app_settings`** – kolekcja na ustawienia, np. dokument `next_game` z polem `pin`.

Przykładowy dokument w `admin_messages`:
- **message** (string) – treść wiadomości,
- **createdAt** (timestamp) – czas wysyłki,
- **source** (string) – źródło, np. `web-admin`.

## 5. Reguły bezpieczeństwa Firestore
Aby web i Android mogły odczytywać wiadomości (PUSH) bez logowania, ustaw reguły dostępu.
Przykład minimalny (na etapie prototypu):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_messages/{docId} {
      allow read, write: if true;
    }
    match /app_settings/{docId} {
      allow read, write: if true;
    }
  }
}
```

> W produkcji zaleca się ograniczyć `write` do administratorów (np. Firebase Auth).

## 6. Weryfikacja działania PUSH
1. Uruchom webową aplikację i przejdź do panelu admina (`?admin=1`).
2. W sekcji **Wiadomość do graczy** wpisz treść i kliknij **Wyślij**.
3. Sprawdź zakładkę **Aktualności** – pole **Najnowsze** powinno pokazać wiadomość.
4. Uruchom aplikację Android – powinno pojawić się lokalne powiadomienie.

## 7. Brak potrzeby FCM
W tym projekcie nie używamy Firebase Cloud Messaging (FCM). PUSH jest realizowany
przez **nasłuch Firestore** w aplikacji Android (plik `AdminMessageListener.kt`).
