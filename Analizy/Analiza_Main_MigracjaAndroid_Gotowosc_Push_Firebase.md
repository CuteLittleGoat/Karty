# Analiza gotowości aplikacji mobilnej na PUSH (Main + Migracja_Android)

## Prompt użytkownika
"Przeczytaj kod modułu Main. Przeczytaj pliki z \"Migracja_Android\". Przeprowadź analizę czy aplikacja mobilna będzie gotowa na wiadomości Push czy jeszcze coś w Firebase muszę zmienić."

## Zakres analizy
- Kod modułu `Main` (web) pod kątem zależności od Firebase i ewentualnych wymagań dla push mobilnych.
- Szablon Android `Migracja_Android/MainWebViewPush` pod kątem kompletności implementacji FCM.
- Wnioski: co już jest gotowe, co trzeba jeszcze ustawić po stronie Firebase.

## Wniosek końcowy
Aplikacja mobilna **jest technicznie przygotowana do odbierania powiadomień PUSH przez FCM**, ale **nie będzie działać od razu bez dokończenia konfiguracji projektu Firebase** (minimum: poprawny `google-services.json` zgodny z `applicationId`, oraz wysyłka wiadomości na topic `main_users`).

## Co jest już gotowe w kodzie Android
1. **Biblioteki i plugin Firebase są dodane** (`google-services`, `firebase-messaging-ktx`, BoM Firebase).
2. **Manifest ma poprawny serwis FCM** z akcją `com.google.firebase.MESSAGING_EVENT`.
3. **Aplikacja subskrybuje topic `main_users`** po uzyskaniu uprawnienia notyfikacji (Android 13+) lub automatycznie na starszych Androidach.
4. **Obsługa wiadomości przychodzącej jest zaimplementowana** (`MainFirebaseMessagingService`) i tworzy kanał powiadomień + lokalne powiadomienie.

## Co MUSISZ ustawić / sprawdzić w Firebase
1. **Dodać aplikację Android do projektu Firebase** z identycznym package name jak `applicationId`.
   - Obecnie to `com.karty.mainwebviewpush` (o ile nie zmieniasz).
2. **Wgrać właściwy `google-services.json` do `app/`**.
   - Plik musi być wygenerowany dla dokładnie tego samego `applicationId`.
3. **Jeśli zmienisz `applicationId` na produkcyjny (zalecane), pobierz nowy `google-services.json`**.
   - Stary plik przestanie pasować.
4. **Wysyłać push na topic `main_users`** (backend/Cloud Function/serwer).
   - To jest topic zaszyty w aplikacji.
5. **Włączyć i używać FCM HTTP v1 / Admin SDK po stronie backendu** do realnej wysyłki.
   - Sama aplikacja odbiera, ale nie wysyła pushy; wysyłka musi być poza apk.

## Co NIE wymaga zmian w module Main (web)
- Moduł `Main` korzysta z Firebase (Firestore), ale nie zawiera mobilnej konfiguracji FCM/tokenów Android.
- To normalne: push mobilny w tym projekcie jest realizowany przez natywną warstwę Android (`Migracja_Android`), a nie przez kod strony w WebView.

## Ryzyka / uwagi praktyczne
1. **Brak `google-services.json` = brak działającego FCM** mimo poprawnego kodu.
2. **Niedopasowany `applicationId` ↔ `google-services.json`** = token/rejestracja FCM mogą nie działać poprawnie.
3. **Jeśli użytkownik odrzuci POST_NOTIFICATIONS na Android 13+**, aplikacja nie zasubskrybuje topicu do czasu ponownego uruchomienia i zgody (lub ręcznego nadania uprawnienia w ustawieniach).
4. Dla lepszego monitoringu warto dodać logowanie sukcesu/porażki `subscribeToTopic`, bo teraz wynik nie jest obsługiwany.

## Minimalna checklista „GO-LIVE PUSH”
- [ ] Ustawione docelowe `applicationId` w `app/build.gradle.kts`.
- [ ] Dodana aplikacja Android o tym samym package name w Firebase.
- [ ] Wgrany aktualny `google-services.json` do `app/`.
- [ ] Zbudowana i uruchomiona aplikacja na urządzeniu, udzielone uprawnienie powiadomień.
- [ ] Backend wysyła test na topic `main_users`.
- [ ] Potwierdzony odbiór push przy aplikacji w foreground i background.

## Odpowiedź na pytanie użytkownika (krótko)
**Tak, aplikacja mobilna jest gotowa kodowo na PUSH, ale musisz dokończyć konfigurację Firebase (co najmniej poprawny `google-services.json` i zgodność package name z `applicationId`) oraz mieć backend wysyłający FCM na topic `main_users`.**
