# Migracja Android (WebView + PUSH) – tylko moduł Main

Ten katalog zawiera gotowy szablon projektu do otwarcia w Android Studio i wygenerowania pliku instalacyjnego APK/AAB.

## 0) Dlaczego w PR nie ma plików PNG z ikonami
Aby uniknąć problemu recenzji typu „Pliki binarne nie są obsługiwane”, ikona launchera nie jest trzymana jako osobne binarki w `app/src/main/res/mipmap-*`.
Zamiast tego Gradle przed buildem automatycznie kopiuje `Pliki/Ikona.png` do zasobów generowanych (`build/generated/icon-res/...`). Dzięki temu:
- spełniony jest warunek użycia `Pliki/Ikona.png` jako ikony,
- PR pozostaje tekstowy i możliwy do normalnego zatwierdzenia.


## 1) Co już jest przygotowane
- Konfiguracja projektu Android (Kotlin + Gradle KTS).
- Ekran główny z `WebView` ładującym **wyłącznie moduł Main**.
- Integracja Firebase Cloud Messaging (PUSH).
- Minimalny, bezpieczny zestaw uprawnień (`INTERNET`, `POST_NOTIFICATIONS`).
- Konfiguracja bezpieczeństwa sieci (blokada HTTP / cleartext).
- Ikona aplikacji z pliku `Pliki/Ikona.png` (kopiowana automatycznie podczas builda, bez commitowania binarek do PR).

## 2) Szybkie uruchomienie w Android Studio
1. Otwórz Android Studio.
2. Kliknij **Open** i wskaż folder `Migracja_Android`.
3. Poczekaj na synchronizację Gradle.
4. Skopiuj swój plik Firebase `google-services.json` do katalogu `app/`.
   - Przykładowy format: `google-services.json.example`.
5. Otwórz plik `app/src/main/java/com/karty/mainmobile/MainActivity.kt`.
6. Ustaw poprawny URL modułu Main w:
   ```kotlin
   private val mainModuleUrl = "https://example.com/Main/"
   ```
7. Uruchom aplikację na urządzeniu (Run ▶).

## 3) Konfiguracja PUSH (Firebase)
1. Wejdź do Firebase Console i dodaj aplikację Android z package name:
   `com.karty.mainmobile`.
2. Pobierz plik `google-services.json` i umieść go w `app/`.
3. W Firebase Cloud Messaging wysyłaj testy na topic: `main`.
   - Aplikacja subskrybuje topic automatycznie.

## 4) Jak wygenerować plik instalacyjny
### APK
1. Android Studio → **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
2. Odbierz plik z katalogu `app/build/outputs/apk/release/`.

### AAB (zalecane dystrybucyjnie)
1. Android Studio → **Build** → **Generate Signed Bundle / APK**.
2. Wybierz **Android App Bundle**.
3. Podpisz własnym keystore.

## 5) Jak uniknąć oznaczania aplikacji jako „niebezpieczna”
Poniższe zasady są kluczowe przy wysyłce przez Gmail/Google Drive:

1. **Podpisuj finalny build własnym kluczem** (release, nie debug).
2. **Nie używaj podejrzanych uprawnień** (np. SMS, dostępność, instalacja pakietów).
   - Ten projekt ma tylko minimalne uprawnienia.
3. **Nie ładuj treści przez HTTP**, tylko HTTPS.
   - W projekcie cleartext jest zablokowany.
4. **Nie osadzaj downloaderów / loaderów kodu / dynamicznego wykonywania**.
5. **Używaj stabilnych zależności z oficjalnych repozytoriów** (Google, Maven Central).
6. **Utrzymuj czystą reputację domeny URL** używanej w WebView.
7. **Skanuj artefakt przed wysyłką** (np. VirusTotal) i testuj na fizycznym urządzeniu.
8. **Wysyłaj AAB/APK jako ZIP z hasłem** (jeśli kanał pocztowy blokuje binaria), a hasło przekaż osobno.

## 6) Ważne ograniczenie
Ten szablon pokazuje tylko moduł Main (zgodnie z wymaganiem). Nie ma przełączania na moduł Second.
