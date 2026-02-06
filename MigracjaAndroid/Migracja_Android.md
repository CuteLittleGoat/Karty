# Migracja aplikacji WrathAndGlory na Android (WebView + powiadomienia PUSH)

Ten dokument zawiera:
- pełny zestaw **plików Android (Kotlin)** do skopiowania do Android Studio,
- **prawdziwe linki** do wszystkich plików z repozytorium i do hostowanych modułów,
- ustawienia: **tryb użytkownika (bez widoku GM)**, orientacje ekranu,
- wymuszenie, aby przycisk **Mapa** otwierał przeglądarkę systemową,
- analizę połączenia z Firebase w module **Infoczytnik** i instrukcję uruchomienia **PUSH**.

---

## 1. Linki do plików i modułów (GitHub + GitHub Pages)

### 1.1. Moduły uruchamiane w aplikacji (GitHub Pages)
- **Main (start aplikacji):** https://cutelittlegoat.github.io/WrathAndGlory/Main/index.html
- **Infoczytnik (widok użytkownika):** https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/Infoczytnik.html

### 1.2. Pliki Android (Kotlin) — do skopiowania do Android Studio
Poniższe pliki są gotowym szablonem projektu Android (`MigracjaAndroid/AndroidApp`).

| Plik | Link |
| --- | --- |
| `MigracjaAndroid/AndroidApp/settings.gradle` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/settings.gradle |
| `MigracjaAndroid/AndroidApp/build.gradle` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/build.gradle |
| `MigracjaAndroid/AndroidApp/gradle.properties` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/gradle.properties |
| `MigracjaAndroid/AndroidApp/app/build.gradle` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/build.gradle |
| `MigracjaAndroid/AndroidApp/app/proguard-rules.pro` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/proguard-rules.pro |
| `MigracjaAndroid/AndroidApp/app/google-services.json` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/google-services.json |
| `MigracjaAndroid/AndroidApp/app/src/main/AndroidManifest.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/AndroidManifest.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/MainActivity.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/MainActivity.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/InfoczytnikActivity.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/InfoczytnikActivity.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WebViewConfig.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WebViewConfig.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WgWebViewClient.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WgWebViewClient.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/NotificationHelper.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/NotificationHelper.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WgFirebaseMessagingService.kt` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/java/com/cutelittlegoat/wrathandglory/WgFirebaseMessagingService.kt |
| `MigracjaAndroid/AndroidApp/app/src/main/res/layout/activity_main.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/layout/activity_main.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/res/layout/activity_infoczytnik.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/layout/activity_infoczytnik.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/res/values/strings.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/values/strings.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/res/values/colors.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/values/colors.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/res/values/themes.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/values/themes.xml |
| `MigracjaAndroid/AndroidApp/app/src/main/res/drawable/ic_notification.xml` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/AndroidApp/app/src/main/res/drawable/ic_notification.xml |

### 1.3. Pliki do funkcji PUSH (Firebase Functions)
| Plik | Link |
| --- | --- |
| `MigracjaAndroid/FirebaseFunctions/index.js` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/FirebaseFunctions/index.js |
| `MigracjaAndroid/FirebaseFunctions/package.json` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/FirebaseFunctions/package.json |
| `MigracjaAndroid/FirebaseFunctions/firebase.json` | https://github.com/cutelittlegoat/WrathAndGlory/blob/main/MigracjaAndroid/FirebaseFunctions/firebase.json |

---

## 2. Gotowy szablon Android — co robi i dlaczego spełnia wymagania

### 2.1. Widok użytkownika (bez admina)
Aplikacja ładuje tylko widok użytkownika:
- **Start:** `Main/index.html`
- **Infoczytnik:** `Infoczytnik/Infoczytnik.html`

W kodzie Android **blokuję wszystkie wejścia do `GM.html` i `GM_test.html`**, więc użytkownik nie zobaczy panelu GM nawet jeśli zna adres. To zapewnia wymagany **widok użytkownika, nie admina**.

### 2.2. Orientacje ekranu
- `MainActivity` → **poziomo** (`sensorLandscape`)
- `InfoczytnikActivity` → **pionowo** (`portrait`)

To dokładnie spełnia wymóg: Infoczytnik w pionie, reszta modułów w poziomie.

### 2.3. Przycisk „Mapa” otwiera przeglądarkę systemową
W module `Main/index.html` przycisk **Mapa** prowadzi do zewnętrznego adresu (owlbear.rodeo). W aplikacji Android **wychwytuję wszystkie linki spoza `cutelittlegoat.github.io`** i otwieram je przez `Intent.ACTION_VIEW`, więc Mapa uruchomi się w zewnętrznej przeglądarce (Chrome, Firefox itd.).

---

## 3. Instrukcja użycia w Android Studio

1. **Skopiuj cały folder** `MigracjaAndroid/AndroidApp` jako nowy projekt, np. do `C:\Projects\WrathAndGlory`.
2. W Android Studio wybierz **Open** i wskaż ten folder.
3. **Dodaj prawdziwy plik `google-services.json`**:
   - W Firebase Console dodaj aplikację Android o pakiecie: `com.cutelittlegoat.wrathandglory`.
   - Pobierz `google-services.json`.
   - Podmień plik: `AndroidApp/app/google-services.json`.
4. Kliknij **Sync Now** (Android Studio zaciągnie zależności).
5. Uruchom aplikację (▶ Run).

Efekt:
- Start w `Main/index.html` (poziomo),
- wejście w Infoczytnik w osobnej aktywności (pionowo),
- link „Mapa” otwiera przeglądarkę,
- powiadomienia PUSH obsługiwane przez Firebase Messaging (po konfiguracji w pkt 4).

---

## 4. Analiza modułu Infoczytnik i integracji Firebase (PUSH)

### 4.1. Jak działa Infoczytnik teraz (HTML)
W pliku `Infoczytnik.html` aplikacja:
- ładuje globalny config Firebase z `config/firebase-config.js`,
- podpina się do Firestore i nasłuchuje dokumentu `dataslate/current`,
- po zmianie dokumentu aktualizuje treść ekranu i odtwarza dźwięk.  
To jest **ciągłe nasłuchiwanie Firestore**, ale **bez PUSH** (WebView nie dostaje powiadomień w tle).

### 4.2. Skąd bierze się wiadomość GM
W panelu `GM.html` (i `GM_test.html`) wiadomość jest zapisywana do Firestore `dataslate/current` metodą `set(...)` i otrzymuje `nonce` oraz znacznik czasu. Ten sam dokument odczytuje Infoczytnik.

**Wniosek:** logika wiadomości już działa przez Firestore, ale **PUSH musi wysyłać osobny backend**.

### 4.3. Wpływ zmian Firebase (PUSH/FCM) na wersję przeglądarkową
Analiza modułu **Infoczytnik** pokazuje, że wersja web:
- ładuje konfigurację z `config/firebase-config.js` jako `window.firebaseConfig`,
- inicjalizuje Firebase Web SDK (moduły `firebase-app` + `firebase-firestore`),
- **wyłącznie** nasłuchuje dokumentu `dataslate/current` przez `onSnapshot(...)`.  

Zmiany opisane w sekcji PUSH (Firebase Functions + FCM dla Androida) **nie wpływają na działanie wersji przeglądarkowej**, ponieważ:
- web nie korzysta z FCM ani Firebase Messaging w tle,
- funkcja chmurowa tylko **dodatkowo** wysyła notyfikację FCM, nie zmienia sposobu zapisu do `dataslate/current`.  

Wpływ na wersję przeglądarkową wystąpi **tylko wtedy**, gdy:
- zmienisz projekt Firebase (wtedy trzeba zaktualizować `config/firebase-config.js`),
- zaostrzysz reguły Firestore i zablokujesz odczyt/zapis `dataslate/current`.  

---

## 5. PUSH: co dodałem i jak uruchomić

### 5.1. Android — odbieranie i wyświetlanie notyfikacji
W szablonie Android dodałem:
- `WgFirebaseMessagingService` — odbiera wiadomości FCM,
- `NotificationHelper` — wyświetla notyfikację w formacie:
  - **Title:** `++INCOMING TRANSMISSION++`
  - **Body:** `++Blessed be the Omnissiah++`

Urządzenie subskrybuje temat **`infoczytnik`**, więc wystarczy wysyłać powiadomienia do tego tematu.

### 5.2. Backend — Firebase Function
Dodałem funkcję `notifyOnDataslateMessage`, która:
- reaguje na zapis `dataslate/current`,
- jeśli `type === "message"`, wysyła FCM na temat `infoczytnik`.

#### Uruchomienie (skrócona instrukcja):
1. Zainstaluj Firebase CLI: `npm install -g firebase-tools`.
2. Zaloguj się: `firebase login`.
3. W folderze `MigracjaAndroid/FirebaseFunctions` uruchom:
   - `npm install`
   - `firebase deploy --only functions`

Po wdrożeniu, **każde wysłanie wiadomości w GM** wygeneruje powiadomienie PUSH na Androidzie.

---

## 6. Podsumowanie decyzji projektowych

- **Widok użytkownika:** tylko `Main` i `Infoczytnik`, blokada `GM.html`.
- **Orientacja:** Main = poziom, Infoczytnik = pion.
- **Mapa:** zawsze zewnętrzna przeglądarka.
- **PUSH:** FCM + Firebase Function reagująca na `dataslate/current`.

Jeśli będziesz chciał dostosować linki lub dodać kolejny moduł, wystarczy dodać go w `Main/index.html` (bez przebudowy aplikacji), o ile nie potrzebujesz nowej natywnej funkcji.

---

## 7. Instrukcja krok po kroku: przygotowanie pliku instalacyjnego (APK/AAB)

Poniżej masz kompletną checklistę **co zainstalować** oraz **gdzie kliknąć**, aby zbudować plik instalacyjny aplikacji.

### 7.1. Co zainstalować (jednorazowo)
1. **Android Studio** (zawiera Android SDK oraz narzędzia build)  
   - Pobierz z: https://developer.android.com/studio
2. **JDK 17** (jeśli Android Studio nie zainstaluje automatycznie)  
   - Pobierz z: https://adoptium.net/
3. **Android SDK + Build Tools**  
   - W Android Studio: `Settings/Preferences → Appearance & Behavior → System Settings → Android SDK`  
   - Upewnij się, że masz **Android 14 (API 34)** oraz **Android SDK Build-Tools** (min. 34.x).

### 7.2. Przygotowanie projektu (raz na projekt)
1. **Otwórz projekt**  
   - Android Studio → **Open** → wybierz folder `MigracjaAndroid/AndroidApp`.
2. **Dodaj prawdziwy `google-services.json`**  
   - Firebase Console → dodaj aplikację Android `com.cutelittlegoat.wrathandglory` → pobierz plik.  
   - Podmień plik w: `AndroidApp/app/google-services.json`.
3. **Synchronizacja Gradle**  
   - Kliknij **Sync Now** (górny pasek powiadomień) albo `File → Sync Project with Gradle Files`.
4. **Sprawdź urządzenie/emu**  
   - Podłącz telefon (USB + Debugowanie USB) lub uruchom emulator z **Device Manager**.

### 7.3. Szybki test (APK debug)
1. W Android Studio kliknij **Run ▶**.  
2. Aplikacja zainstaluje się na urządzeniu i uruchomi się automatycznie.  
3. Debug APK znajdziesz w:  
   - `AndroidApp/app/build/outputs/apk/debug/app-debug.apk`.

### 7.4. APK / AAB podpisany (release) — krok po kroku
To jest **prawdziwy plik instalacyjny do dystrybucji**.

1. **Zbuduj podpisany pakiet**  
   - Android Studio → `Build → Generate Signed Bundle / APK...`
2. **Wybierz format**  
   - **Android App Bundle (AAB)** → jeśli publikujesz w Google Play,  
   - **APK** → jeśli chcesz plik instalacyjny do ręcznej instalacji.
3. **Keystore (pierwszy raz)**  
   - Kliknij **Create new...**  
   - Uzupełnij:
     - **Key store path** (np. `C:\Keys\wg-release.jks`)
     - **Password** (zapisz!)
     - **Key alias** (np. `wg`)
     - **Key password** (zapisz!)
     - **Validity** (np. 25 lat)
4. **Build Variant**  
   - Wybierz **release** → **Finish**.
5. **Gdzie jest plik wynikowy?**  
   - **AAB:** `AndroidApp/app/build/outputs/bundle/release/app-release.aab`  
   - **APK:** `AndroidApp/app/build/outputs/apk/release/app-release.apk`

### 7.5. Uwaga o bezpieczeństwie i aktualizacjach
- **Keystore musi być zachowany** — bez niego nie zaktualizujesz aplikacji.  
- Wersję aplikacji zwiększasz w `AndroidApp/app/build.gradle`:
  - `versionCode` (liczba),  
  - `versionName` (np. `"1.1"`).
