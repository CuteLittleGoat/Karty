# Second — dokumentacja techniczna

## 1. Struktura modułu
- `Second/index.html` — układ paneli administratora i użytkownika oraz modal logowania/instrukcji.
- `Second/styles.css` — wspólny motyw wizualny zgodny z modułem Main.
- `Second/app.js` — logika zakładek, integracja Firebase, admin login, chat, gracze, turniej.

## 2. Logika bezpieczeństwa

### 2.1 Dostęp administratora
- Dostęp administracyjny włącza się parametrem `?admin=1`.
- Mechanizm hasła admina (SHA-256 + odczyt `admin_security/credentials.passwordHash`) pozostaje w kodzie, ale jest **tymczasowo wyłączony** przez `TEMPORARILY_DISABLE_ADMIN_PASSWORD = true`.
- Na czas testów panel administratora otwiera się automatycznie, a przywrócenie pełnej autoryzacji wymaga jedynie wyłączenia przełącznika.

### 2.2 Ochrona usuwania ostatniego dokumentu
- Moduł instaluje globalną ochronę dla Firestore (`delete` i `batch.delete`).
- Próba usunięcia ostatniego dokumentu w kolekcji jest blokowana.
- Użytkownik dostaje komunikat ostrzegawczy.

## 3. Zakres funkcjonalny

### 3.1 Administrator
- Zarządzanie aktualnościami.
- Zarządzanie czatem i czyszczenie starych wiadomości.
- Edycja regulaminu.
- Zarządzanie listą graczy (CRUD).
- Zakładka turniejowa w układzie panelowym (placeholder UI).

### 3.2 Użytkownik
- Podgląd aktualności, czatu, regulaminu i listy graczy.
- Zakładka Turniej ze szkieletem nawigacji bocznej (`Strona1`, `Strona2`).

## 4. Dane i integracja Firebase
- Moduł wymaga obecności `window.firebaseConfig`.
- Aplikacja inicjalizuje Firebase tylko raz (`firebase.initializeApp`).
- Dane wykorzystywane przez moduł obejmują obszary:
  - `admin_security` (logowanie admina),
  - aktualności,
  - regulamin,
  - czat,
  - gracze.

## 5. UI i styl
- Motyw oparty o zmienne CSS z ciemnym tłem i złoto-zielonymi akcentami.
- Layout opiera się na kartach, tabelach i sekcjach panelowych.
- Widok jest responsywny dla mniejszych ekranów.
- Obszar nagłówka używa układu `.header-controls` i `.admin-toolbar`.
- Obok przycisku instrukcji pojawia się czerwony tekst informacyjny o tymczasowym pominięciu hasła admina (`.admin-password-bypass-note`).
