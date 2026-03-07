# Analiza gotowości aplikacji mobilnej na PUSH (Main + Migracja_Android)

## Prompt użytkownika
"Przeczytaj kod modułu Main. Przeczytaj pliki z \"Migracja_Android\". Przeprowadź analizę czy aplikacja mobilna będzie gotowa na wiadomości Push czy jeszcze coś w Firebase muszę zmienić."

## Prompt użytkownika (uzupełnienie tej analizy)
"Przeczytaj analizę Analizy/Analiza_Main_MigracjaAndroid_Gotowosc_Push_Firebase.md a następnie zawartość folderu Migracja_Android

Uzupełnij analizę Analizy/Analiza_Main_MigracjaAndroid_Gotowosc_Push_Firebase.md - napisz mi bardzo dokładnie, krok po kroku, co i gdzie mam kliknąć w Firestore, żeby włączyć funkcję powiadomień Push."

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

---

## Bardzo dokładnie: co kliknąć w Firebase/Firestore, żeby uruchomić PUSH

> Najważniejsze: **w samym Firestore nie ma przełącznika „włącz PUSH”**.
> Push dla Androida w tym projekcie idzie przez **Firebase Cloud Messaging (FCM)**.
> Firestore może być używany pomocniczo (np. do danych aplikacji), ale nie aktywuje pushy sam z siebie.

Poniżej masz pełną procedurę „klik po kliku” dla projektu z `Migracja_Android/MainWebViewPush`.

### Krok 1 — wejście do właściwego projektu Firebase
1. Wejdź na: https://console.firebase.google.com/
2. Kliknij kafelek projektu, którego używasz dla aplikacji Main.
3. Sprawdź nazwę projektu w lewym górnym rogu (żeby nie konfigurować złego środowiska).

### Krok 2 — dodanie aplikacji Android (to jest krytyczne)
1. W lewym menu kliknij ikonę koła zębatego (obok „Project Overview”) -> **Project settings**.
2. Przejdź do zakładki **General**.
3. W sekcji **Your apps** kliknij ikonę **Android** („Add app”).
4. W polu **Android package name** wpisz dokładnie:
   - `com.karty.mainwebviewpush`
   - (albo inny finalny `applicationId`, jeśli został zmieniony w `app/build.gradle.kts`).
5. (Opcjonalnie) Uzupełnij App nickname.
6. Kliknij **Register app**.
7. Na ekranie konfiguracji kliknij **Download google-services.json**.
8. Skopiuj pobrany plik do: `Migracja_Android/MainWebViewPush/app/google-services.json`.
9. Wróć do kreatora Firebase i kliknij **Next** / **Continue to console**.

### Krok 3 — upewnienie się, że Firestore jest aktywny (jeśli używasz danych Firestore)
> Ten krok nie włącza pushy, ale często jest potrzebny dla działania modułu Main.

1. W lewym menu kliknij **Build** -> **Firestore Database**.
2. Jeśli widzisz przycisk **Create database**, kliknij go.
3. Wybierz tryb startowy (najczęściej **Start in production mode**).
4. Wybierz region (np. `europe-central2` lub ten zgodny z resztą projektu).
5. Kliknij **Enable**.

### Krok 4 — przejście do miejsca, gdzie naprawdę włącza się wysyłkę PUSH
1. W lewym menu kliknij **Engage** -> **Messaging** (lub **Cloud Messaging**, zależnie od widoku konsoli).
2. Jeśli to pierwszy raz, zaakceptuj ekran startowy (przycisk typu **Get started**).
3. To jest właściwe miejsce do wysyłania testowych powiadomień.

### Krok 5 — wysłanie testowego PUSH na topic używany w aplikacji
W kodzie Android aplikacja subskrybuje topic: `main_users`.

1. W **Messaging** kliknij **Create your first campaign** / **New campaign**.
2. Wybierz **Notifications**.
3. Uzupełnij:
   - **Notification title** (np. `Test PUSH Main`)
   - **Notification text** (np. `Jeśli to widzisz, FCM działa`).
4. Kliknij **Next**.
5. W sekcji targetowania wybierz platformę **Android**.
6. Jako odbiorców ustaw **Topic**.
7. Wpisz temat dokładnie: `main_users`.
8. Kliknij **Review**.
9. Kliknij **Publish** (lub **Send test message**, jeżeli chcesz najpierw test).

### Krok 6 — co kliknąć na telefonie, żeby test miał prawo zadziałać
1. Zainstaluj apk z `Migracja_Android/MainWebViewPush`.
2. Uruchom aplikację.
3. Na Androidzie 13+ pojawi się pytanie o powiadomienia -> kliknij **Allow / Zezwól**.
4. Zamknij i uruchom aplikację ponownie (bezpieczny krok po nadaniu zgody).
5. Po publikacji kampanii z kroku 5 powiadomienie powinno przyjść.

### Krok 7 — szybka diagnostyka, jeśli nie dochodzi
1. Sprawdź ponownie package name:
   - Firebase app (Project settings -> General -> Your apps)
   - musi być identyczny z `applicationId` w Gradle.
2. Sprawdź, czy `google-services.json` na pewno pochodzi z tego samego projektu Firebase.
3. Sprawdź, czy aplikacja na pewno dostała zgodę na notyfikacje.
4. Sprawdź, czy wysyłasz dokładnie na topic `main_users`.

## Najkrótsza odpowiedź „co kliknąć w Firestore”
- Kliknięcia w Firestore: tylko ewentualne **włączenie bazy** (`Build -> Firestore Database -> Create database -> Enable`).
- Kliknięcia, które faktycznie uruchamiają PUSH: **Engage -> Messaging -> New campaign -> Topic: `main_users` -> Publish**.
