# Second — dokumentacja techniczna

## 1. Struktura modułu
- `Second/index.html` — układ paneli administratora i użytkownika oraz modal logowania/instrukcji.
- `Second/styles.css` — wspólny motyw wizualny zgodny z modułem Main.
- `Second/app.js` — logika zakładek, integracja Firebase, admin login, chat, gracze, turniej.

## 2. Logika bezpieczeństwa

### 2.1 Dostęp administratora
- Dostęp administracyjny włącza się parametrem `?admin=1`.
- Hasło jest porównywane przez SHA-256 z wartością w Firestore.
- Odczyt hasła: `admin_security/credentials`, pole `passwordHash`.

### 2.2 Ochrona usuwania ostatniego dokumentu
- Moduł instaluje globalną ochronę dla Firestore (`delete` i `batch.delete`).
- Blokada działa dla kolekcji głównych (top-level), aby nie dopuścić do usunięcia ich ostatniego dokumentu.
- Podkolekcje nie są obejmowane blokadą, więc operacje usuwania rekordów z detalami działają poprawnie.
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
