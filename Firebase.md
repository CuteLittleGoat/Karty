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
