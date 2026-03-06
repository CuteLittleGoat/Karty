# Migracja Android (Main + WebView + PUSH)

Ten folder zawiera gotowy szablon projektu Android Studio dla instalacyjnej aplikacji **tylko modułu Main**:
- WebView otwierający jedynie wskazaną domenę Main,
- powiadomienia PUSH przez Firebase Cloud Messaging,
- konfigurację bezpieczeństwa, która ogranicza ryzyko oznaczenia aplikacji jako potencjalnie niebezpiecznej.

## Struktura
- `MainWebViewPush/` — projekt Android Studio (Kotlin, Gradle KTS).

## Szybki start
1. Otwórz `Migracja_Android/MainWebViewPush` w Android Studio.
2. Skopiuj `local.properties.template` do `local.properties` i ustaw ścieżkę SDK.
3. W pliku `app/build.gradle.kts` uzupełnij:
   - `MAIN_WEB_URL` (pełny HTTPS URL modułu Main),
   - `ALLOWED_WEB_HOST` (sam host bez `https://`).
4. Dodaj plik Firebase `google-services.json` do katalogu `app/`.
5. Zbuduj debug: `Build > Make Project`.
6. Zbuduj produkcję: `Build > Generate Signed Bundle / APK`.

## Dlaczego ta konfiguracja jest „bezpieczniejsza” pod skanery
W projekcie celowo zastosowano praktyki, które zmniejszają ryzyko flagowania APK jako malware:

1. **Minimalne uprawnienia**
   - Tylko `INTERNET` i `POST_NOTIFICATIONS`.
   - Brak uprawnień SMS, kontaktów, połączeń, lokalizacji i odczytu plików.

2. **Brak ruchu HTTP (cleartext)**
   - Wymuszone HTTPS (`usesCleartextTraffic=false` + `network_security_config`).

3. **Ograniczenie WebView do jednej domeny Main**
   - Aplikacja blokuje przejścia na inne hosty.
   - Wyłączony dostęp do plików lokalnych (`allowFileAccess=false`, `allowContentAccess=false`).

4. **Brak mechanizmów przypominających dropper/trojan**
   - Aplikacja niczego nie pobiera i nie uruchamia zewnętrznie.
   - Brak dynamicznego ładowania kodu.

5. **Podpis release własnym kluczem**
   - Należy wygenerować własny keystore i podpisywać wszystkie wydania.
   - Nie wysyłać „debug APK” do użytkowników końcowych.

## Dodatkowe zalecenia przed dystrybucją (ważne)
1. Używaj **unikalnego `applicationId`** (własna domena odwrócona, np. `pl.twojafirma.karty.main`).
2. Umieść publicznie działającą politykę prywatności pod HTTPS.
3. Wysyłaj pliki instalacyjne tylko jako:
   - podpisany `AAB`/`APK` release,
   - najlepiej przez zaufany kanał (np. wewnętrzny MDM lub Google Play Internal Testing).
4. Utrzymuj stałą zgodność wersji bibliotek (AndroidX/Firebase).
5. Nie korzystaj z „packerów” i narzędzi do obfuskacji spoza standardowego R8/ProGuard.

## PUSH – wymagania backendowe
- Wysyłaj wiadomości FCM na topic: `main_users`.
- Dla najlepszej dostarczalności ustawiaj:
  - `priority: high`,
  - `notification.title`, `notification.body`.

