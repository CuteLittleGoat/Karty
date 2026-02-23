# Instrukcja uzyskania pełnego dostępu Firebase dla agenta

## Prompt użytkownika
"Przeczytaj analizę Analizy/Wazne_LoginIHaslo.md
Wprowadź stosowne zmiany w Firebase i kodzie aplikacji. Masz pełen dostęp przez plik test.json - jeżeli jest problem z modyfikacją Firebase to nic więcej nie zmieniaj!
Jeżeli możesz dodawać nowe kolekcje i modyfikować Rules to zrób to wszystko.
Jeżeli możesz dodawać kolekcje, ale nie możesz modyfikować Rules to też wprowadź zmiany, ale utwórz nowy plik \"Rules.md\" w Analizy i zapisz mi tam dokładnie co muszę skopiować do konsoli Firebase.

Możesz skasować dane wszystkich użytkowników.
Ustaw tylko admina pod mailem: oresznikak47@gmail.com - jeżeli to wymagane to jako hasło admina ustaw \"Joker123!\"

Zmieniłem ustawienia środowiska. Wpisałem tam prywatny klucz jako: FIREBASE_SERVICE_ACCOUNT_JSON oraz dałem uprawnienia do domen: oauth2.googleapis.com, firestore.googleapis.com, identitytoolkit.googleapis.com, storage.googleapis.com, firebaseinstallations.googleapis.com, firebase.googleapis.com, www.googleapis.com

Załączam screeny. Jeżeli nie masz możliwości edycji Firebase to nie wprowadzaj żadnych zmiany w kodzie tylko napisz mi nowy plik w Analizy jak dodać Ci pełen dostęp."

## Co sprawdziłem
- Zmienna środowiskowa `FIREBASE_SERVICE_ACCOUNT_JSON` **nie jest widoczna** w aktualnej sesji terminala.
- W repozytorium oraz katalogu `/workspace` nie ma pliku `test.json`.
- Bez jednego z tych dwóch elementów (plik klucza lub poprawnie widoczna zmienna ENV) nie mogę autoryzować połączenia z Firebase Admin SDK ani wykonać bezpiecznych zmian w Auth/Firestore/Rules.

## Jak poprawnie dać mi dostęp (krok po kroku)

### Wariant A (zalecany): zmienna środowiskowa
1. Ustaw sekret dokładnie pod nazwą: `FIREBASE_SERVICE_ACCOUNT_JSON`.
2. Wartość sekretu wklej jako **pełny JSON** konta serwisowego (z polami m.in. `type`, `project_id`, `private_key`, `client_email`).
3. Zapisz zmiany i uruchom nową sesję zadania (restart środowiska/nowy run), żeby zmienna była faktycznie podana do procesu.
4. Po restarcie mogę zweryfikować dostęp poleceniem testowym i od razu przejść do migracji.

### Wariant B: plik `test.json`
1. Umieść plik `test.json` w repozytorium (lub w katalogu roboczym zadania), np. `/workspace/Karty/test.json`.
2. Plik ma zawierać pełny klucz service account Firebase.
3. Alternatywnie możesz ustawić zmienną: `GOOGLE_APPLICATION_CREDENTIALS=/workspace/Karty/test.json`.

## Minimalne role IAM wymagane dla klucza
Konto serwisowe powinno mieć przynajmniej:
- **Firebase Authentication Admin** (zarządzanie użytkownikami, hasłami, blokadą kont),
- **Cloud Datastore User** albo wyższe uprawnienia do Firestore,
- **Firebase Rules Admin** (jeśli mam też wdrażać reguły).

## Dlaczego to jest potrzebne
Zmiany, o które prosisz (kasowanie użytkowników, utworzenie tylko admina, migracja kolekcji, wdrożenie Rules), wymagają uprawnień serwisowych po stronie Firebase Admin/API. Sam dostęp frontendu (`firebaseConfig`) nie daje takich możliwości.

## Co zrobię od razu po uzyskaniu dostępu
1. Wyczyścić konta użytkowników Firebase Auth.
2. Utworzyć/ustawić admina `oresznikak47@gmail.com` (hasło tymczasowe `Joker123!`, jeśli wymagane).
3. Utworzyć/uzupełnić kolekcję `users/{uid}` i pola autoryzacyjne opisane w analizie.
4. Dodać/migrować pola `ownerUid`, `ownerName`, `visibility` w `UserGames`.
5. Wdrożyć reguły Firestore dla wariantów `read_all` / `own_only` + pełny admin access.
6. Dopiero potem wprowadzić spójne zmiany w kodzie aplikacji.
