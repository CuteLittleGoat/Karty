# Analiza: Rejestracja użytkowników przez UI + wymagania Firebase (Faza 3)

## Prompt użytkownika
"Przeczytaj dokumentację: Analizy/Projekt_Login_i_Haslo.md

Kroki jakie wykonałem z pkt 8
Faza 0
Zrób eksport Firestore (backup) = nie trzeba backupu danych, krok niewykonany
Potwierdź listę kolekcji legacy i nowych. = lista kolekcji potwierdzona
Włącz Email/Hasło (pkt 7). = ustawiłem i sprawdziłem domeny

Faza 1
Utwórz konto admina Main (wariant A albo B z sekcji 3). = ręcznie wpisałem w Firebase
Utwórz konto admina Second = ręcznie wpisałem w Firebase
Utwórz konta użytkowników w Authentication. = krok pominięty. Przeczytaj analizę Analizy/Analiza_Tworzenie_Kont_UI_vs_Firebase.md
Chciałbym, żeby użytkownicy sami mogli tworzyć sobie konta poprzez UI aplikacji. Admin następnie by im przydzielał uprawnienia i ewentualnie kasował. Admin miałby dostęp do utworzonych kont w zakładce \"Gracze\".

Faza 2 — kod aplikacji
Wprowadź ekran logowania (Main i Second): email + hasło + wyloguj. = obecnie są przygotowane przyciski, ale chyba jeszcze nie działają (sprawdź kod)

Wykonaj resztę kroków z Fazy2. Zmień kod. Przepnij wszystkie kolekcje na nową strukturę. Kwestie związane z PIN tylko wyłącz - jeszcze nie usuwaj.
Zwróć szczególną uwagę na krok:
\"Utwórz konta użytkowników w Authentication. = krok pominięty. Przeczytaj analizę Analizy/Analiza_Tworzenie_Kont_UI_vs_Firebase.md
Chciałbym, żeby użytkownicy sami mogli tworzyć sobie konta poprzez UI aplikacji. Admin następnie by im przydzielał uprawnienia i ewentualnie kasował. Admin miałby dostęp do utworzonych kont w zakładce \"Gracze\".\"

Przeprowadź dokładną analizę tej funkcjonalności. Jeżeli wymaga to dodatkowych zmian w Firebase to zapisz mi w nowym pliku w Analizy co jest potrzebne. Jeżeli to zmiana tylko na poziomie kodu aplikacji to wprowadź ją.
Jeżeli wymaga to innych Rules (Faza 3 z analizy) to zapisz mi je w nowym pliku w Analizy."

## Wniosek
Funkcjonalność **wymaga zarówno zmian w kodzie, jak i zmian Rules**. Samo dodanie przycisku „Utwórz konto” nie wystarczy, bo użytkownik po rejestracji musi:
1. zapisać własny profil w `main_users/{uid}` lub `second_users/{uid}`,
2. widzieć tylko swoje dane,
3. czekać na aktywację uprawnień przez admina,
4. nie mieć możliwości samodzielnego nadania sobie uprawnień.

## Dodatkowe wymagania Firebase
1. W Firestore muszą istnieć kolekcje:
   - `main_users`
   - `second_users`
2. Dokumenty użytkowników powinny mieć co najmniej:
   - `uid`
   - `email`
   - `name`
   - `isActive`
   - `permissions` (array)
   - `statsYearsAccess` (array)
3. W Authentication provider Email/Hasło musi pozostać aktywny.
4. Admin powinien mieć profile z rolą admina i prawem edycji innych userów.

## Rules potrzebne pod self-register + aktywację przez admina

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function hasMainAdminRole() {
      return signedIn()
        && exists(/databases/$(database)/documents/main_users/$(request.auth.uid))
        && get(/databases/$(database)/documents/main_users/$(request.auth.uid)).data.role == "admin";
    }

    function hasSecondAdminRole() {
      return signedIn()
        && exists(/databases/$(database)/documents/second_users/$(request.auth.uid))
        && get(/databases/$(database)/documents/second_users/$(request.auth.uid)).data.role == "admin";
    }

    match /main_users/{uid} {
      allow create: if isOwner(uid)
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.isActive == false
        && request.resource.data.permissions is list;

      allow read: if isOwner(uid) || hasMainAdminRole();

      allow update: if hasMainAdminRole()
        || (isOwner(uid)
          && request.resource.data.permissions == resource.data.permissions
          && request.resource.data.isActive == resource.data.isActive
          && request.resource.data.role == resource.data.role);

      allow delete: if hasMainAdminRole();
    }

    match /second_users/{uid} {
      allow create: if isOwner(uid)
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.isActive == false
        && request.resource.data.permissions is list;

      allow read: if isOwner(uid) || hasSecondAdminRole();

      allow update: if hasSecondAdminRole()
        || (isOwner(uid)
          && request.resource.data.permissions == resource.data.permissions
          && request.resource.data.isActive == resource.data.isActive
          && request.resource.data.role == resource.data.role);

      allow delete: if hasSecondAdminRole();
    }
  }
}
```

## Co jeszcze trzeba dopiąć po stronie Firebase Console
1. Sprawdzić szablon e-mail resetu hasła i domenę.
2. Potwierdzić, że admin ma `role: admin` w odpowiedniej kolekcji (`main_users`/`second_users`).
3. Wdrożyć powyższe Rules i przetestować scenariusze:
   - rejestracja nowego usera,
   - odczyt własnego profilu,
   - brak możliwości samodzielnego ustawienia `isActive=true` i `permissions`,
   - pełna edycja userów przez admina.
