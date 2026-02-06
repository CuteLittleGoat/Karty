# Analiza błędu zapisu PIN (Firebase)

## Wniosek
Błąd zapisu PIN wynika z reguł Firestore, które **wymagają uwierzytelnienia oraz niestandardowego claimu `admin`**. Aplikacja w obecnym kodzie **nie wykonuje żadnego logowania do Firebase Auth**, więc każde `write` do dokumentu `app_settings/next_game` jest odrzucane przez reguły.

## Dowody w kodzie
- Zapis PIN używa Firestore bez wcześniejszego uwierzytelnienia użytkownika:
  - `firebaseApp.firestore().collection("app_settings").doc("next_game").set({ pin: pinValue })`.
- Brak jakiegokolwiek użycia Firebase Auth w kodzie (brak `signIn...`, brak `onAuthStateChanged`).

## Zgodność konfiguracji
Konfiguracja Firebase w `config/firebase-config.js` odpowiada danym ze screenów (projectId, appId, messagingSenderId, authDomain, storageBucket). To oznacza, że problem nie leży w samych kluczach konfiguracyjnych, tylko w autoryzacji zapisu.

## Dlaczego write jest blokowany
Reguły:
```
allow write: if request.auth != null && request.auth.token.admin == true;
```
Wymagają:
1) `request.auth != null` → użytkownik musi być zalogowany w Firebase Auth.
2) `request.auth.token.admin == true` → użytkownik musi mieć ustawiony custom claim `admin`.

Aplikacja nie loguje użytkownika i nie ustawia claimu admin, więc zapis jest blokowany.

## Rekomendacje (jedna z opcji do wdrożenia)
1) **Dodaj logowanie i ustaw custom claim `admin`** na użytkowniku, który ma prawo zapisu PIN.
2) **Zastosuj Cloud Function / Callable** do zapisu PIN (server-side admin SDK) i wywołuj ją z klienta.
3) **Zmień reguły** na mniej restrykcyjne (np. tymczasowo `allow write: if true;`) – tylko do szybkich testów, nie do produkcji.

## Co sprawdzić w Firebase Console
- Czy użytkownik jest zalogowany (Firebase Auth → Users).
- Czy użytkownik ma custom claim `admin` ustawiony (via Admin SDK / Cloud Functions).
- Czy reguły są na pewno opublikowane i nie ma wersji roboczej.
