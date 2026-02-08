# Analiza błędu „Wiadomość do graczy” (Firebase)

## Co sprawdziłem w kodzie
- Moduł **Wiadomość do graczy** korzysta z `initAdminMessaging()` w pliku `Main/app.js`.
- Błąd „Nie udało się wysłać wiadomości. Sprawdź konfigurację.” jest ustawiany tylko w `catch`, czyli po **nieudanej próbie zapisu do Firestore**.
- Połączenie z Firebase jest uznawane za poprawne, jeśli:
  - istnieje `window.firebaseConfig` z `projectId`,
  - biblioteka `firebase-app-compat` jest załadowana,
  - aplikacja została zainicjalizowana i dostępne jest `firebase.firestore()`.

## Wnioski (najbardziej prawdopodobne przyczyny błędu)
1. **Reguły Firestore blokują zapis**
   - Jeśli reguły nie pozwalają na `write` do kolekcji `admin_messages`, zapis kończy się wyjątkiem i widzisz dokładnie ten komunikat.
   - Sprawdź reguły w Firebase Console → Firestore → Rules.

2. **Firestore nie jest włączony lub nie jest skonfigurowana baza**
   - Jeśli Firestore nie jest utworzony, zapis może się nie udać.

3. **Projekt Firebase w configu nie jest tym, do którego masz dostęp lub który ma reguły**
   - Nawet poprawny `apiKey` nie gwarantuje zapisu, jeśli reguły dla projektu tego zabraniają.

4. **Przeglądarka blokuje połączenie (np. tryb offline, CSP)**
   - Wtedy zapis również kończy się błędem w `catch`.

## Co potwierdzić krok po kroku
1. **Czy `config/firebase-config.js` jest podłączony i poprawny?**
   - Plik jest ładowany w `Main/index.html` przed bibliotekami Firebase.
   - Musi zawierać poprawny `projectId`, `apiKey` i `appId` dla właściwego projektu.

2. **Czy Firestore jest aktywny?**
   - Firebase Console → Firestore Database → Create database (jeśli nie istnieje).

3. **Czy reguły pozwalają na zapis?**
   - Minimalne reguły (na czas testów):

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

4. **Czy kolekcja `admin_messages` istnieje?**
   - Nie jest wymagana wcześniej, ale warto ją stworzyć ręcznie w konsoli, aby upewnić się, że zapis działa.

## Szybki test
- Wejdź na stronę w trybie admina (`?admin=1`).
- Otwórz DevTools → Console.
- Kliknij „Wyślij” i sprawdź, czy pojawia się błąd Firestore (np. `permission-denied`).

## Podsumowanie
Najczęstszą przyczyną tego komunikatu jest **brak uprawnień zapisu w regułach Firestore** albo **niewłączony Firestore**. Sam kod jest poprawny i zapisuje do kolekcji `admin_messages` z polem `createdAt` oraz `source`.
