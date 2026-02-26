# Analiza: logowanie Firebase (Main i Second)

## Prompt użytkownika
"Sprawdź poprawność połączenia z Firebase.
Przy próbie logowania do Main zwraca mi błąd
Nie udało się zalogować (kod: auth/invalid-credential; opis: Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-credential).). Dane logowania są nieprawidłowe — sprawdź e-mail i hasło.

Przy próbie logowania do Second nic się nie dzieje. Aplikacja nie reaguje na przycisk i nie wyświetla komunikatu błędu.

Mail i hasło są poprawne."

## Wnioski techniczne
1. Konfiguracja projektu Firebase jest poprawnie podłączona w aplikacji (wspólny `config/firebase-config.js`, poprawny `projectId`, `apiKey`, `authDomain`).
2. Endpoint Firebase Auth odpowiada poprawnie (połączenie sieciowe i API key działają).
3. W module **Second** problem „nic się nie dzieje” wynikał z UX: status logowania był pokazywany tylko w nagłówku, przez co użytkownik mógł nie widzieć reakcji po kliknięciu przycisku.
4. W module **Main** błąd `auth/invalid-credential` pochodzi bezpośrednio z Firebase Auth i oznacza problem po stronie danych konta/projektu uwierzytelniania (nie Firestore).

## Co sprawdzić / zmienić w Firebase Console
- Authentication → Sign-in method:
  - upewnić się, że provider **Email/Password** jest włączony.
- Authentication → Users:
  - potwierdzić, że użytkownik loguje się do **tego samego projektu** (`karty-turniej`) i że konto nie jest wyłączone/usunięte.
  - jeżeli konto było zakładane w innym projekcie, utworzyć je w `karty-turniej` albo przełączyć konfigurację aplikacji na właściwy projekt.
- W razie dalszego `auth/invalid-credential` przy pewnym haśle:
  - wykonać reset hasła i ponowić logowanie.

## Firestore Rules
- Zgłoszony błąd dotyczy warstwy Auth, nie reguł Firestore.
- Na tym etapie nie jest wymagana zmiana `Pliki/firestore.rules`.
