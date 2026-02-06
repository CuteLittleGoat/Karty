# Firebase - konfiguracja bazy danych

Poniżej znajdziesz dokładną instrukcję krok po kroku, jak utworzyć projekt w Firebase, włączyć bazę danych oraz pobrać fragment konfiguracji do pliku `config/firebase-config.js`.

## 1. Utworzenie projektu

1. Wejdź na https://console.firebase.google.com/ i zaloguj się na konto Google.
2. Kliknij przycisk **Add project** (lub **Dodaj projekt**).
3. W polu **Project name** wpisz nazwę projektu (np. `Karty-Turniej`).
4. Kliknij **Continue**.
5. W kroku **Google Analytics for this project** wybierz **Disable** (jeśli nie potrzebujesz analityki) lub **Enable** i wybierz konto Analytics.
6. Kliknij **Create project**.
7. Po utworzeniu kliknij **Continue** aby przejść do konsoli projektu.

## 2. Dodanie aplikacji webowej

1. W widoku projektu kliknij ikonę **</>** z podpisem **Web** (na ekranie startowym „Get started by adding Firebase to your app”).
2. W polu **App nickname** wpisz np. `Karty-Web`.
3. Zaznacz **Also set up Firebase Hosting** tylko jeśli planujesz hosting w Firebase.
4. Kliknij **Register app**.
5. Skopiuj fragment konfiguracji `firebaseConfig` z sekcji **Add Firebase SDK** (to jest obiekt JS z polami `apiKey`, `authDomain`, itd.).
6. Kliknij **Continue to console**.

## 3. Włączenie bazy danych (Cloud Firestore)

1. W lewym menu wybierz **Build** → **Firestore Database**.
2. Kliknij **Create database**.
3. Wybierz tryb **Start in test mode** (na etapie developmentu) lub **Start in production mode**.
4. Kliknij **Next**.
5. Wybierz lokalizację bazy (np. `europe-west3`) i kliknij **Enable**.

## 4. Wklejenie konfiguracji do aplikacji

1. Otwórz plik `config/firebase-config.js`.
2. W miejsce pustych wartości w obiekcie `window.firebaseConfig` wklej dane z fragmentu `firebaseConfig`, który skopiowałeś w kroku 2.
3. Zapisz plik.

Gotowe! Aplikacja będzie mogła korzystać z konfiguracji Firebase, gdy podłączysz logikę zapisu/odczytu w kodzie.

## 5. Wiadomości z panelu admina → powiadomienia Android (FCM)

Aby przycisk **„Wyślij”** w panelu administratora powodował wyświetlenie powiadomienia w aplikacji Android:

### 5.1. Kolekcja wiadomości w Firestore
1. W Firestore utwórz kolekcję `admin_messages`.
2. Aplikacja web zapisuje tam dokumenty z polami:
   - `message` (String)
   - `createdAt` (Timestamp)
   - `source` (np. `web-admin`)

> W trybie testowym Firestore zapis jest domyślnie dozwolony. W produkcji ustaw reguły tak, aby **tylko administrator** mógł dodawać dokumenty.

### 5.2. Cloud Functions (trigger → FCM)
1. W Firebase Console przejdź do **Build → Functions** i skonfiguruj Functions (Node.js).
2. Zainstaluj zależności:
   ```bash
   npm install firebase-functions firebase-admin
   ```
3. Dodaj funkcję nasłuchującą kolekcji `admin_messages` i wysyłającą FCM:
   ```js
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");

   admin.initializeApp();

   exports.sendAdminMessageToTopic = functions.firestore
     .document("admin_messages/{messageId}")
     .onCreate(async (snap) => {
       const data = snap.data();
       const payload = {
         notification: {
           title: "Karty — wiadomość organizatora",
           body: data.message || "Nowa wiadomość z panelu admina"
         },
         topic: "karty-admin"
       };

       return admin.messaging().send(payload);
     });
   ```
4. Wdróż funkcję:
   ```bash
   firebase deploy --only functions
   ```

### 5.3. Wymagania po stronie Androida
- Aplikacja Android musi subskrybować temat `karty-admin` (opis w `MigracjaAndroid/Migracja_Android.md`).
- Po zapisaniu wiadomości w Firestore funkcja wyśle powiadomienie FCM do wszystkich urządzeń w tym temacie.

## 6. Przechowywanie PIN do zakładki „Najbliższa gra”

Aby PIN był trwały między sesjami i dostępny na wszystkich urządzeniach, należy zapisywać go w Firestore.

### 6.1. Struktura danych
1. W Firestore utwórz kolekcję `app_settings`.
2. W kolekcji dodaj dokument `next_game`.
3. Dodaj pole:
   - `pin` (String) – kod PIN składający się z minimum 4 cyfr.

### 6.2. Reguły bezpieczeństwa (przykład)
Poniżej przykład reguł, które pozwalają administratorowi na zapis PIN-u, a użytkownikom tylko na odczyt:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /app_settings/next_game {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

> W produkcji pamiętaj o skonfigurowaniu odpowiednich tokenów lub konta administracyjnego, aby `request.auth.token.admin` było dostępne.
