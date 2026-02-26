# Projekt logowania do panelu Admin (`?admin=1`) – analiza

## Prompt użytkownika
> Przeprowadź analizę i zapisz jej wyniki w pliku "Projekt_Login.md".  
> Obecnie aplikacja ma dwa moduły: "Main" i "Second".  
> Moduł "Main" można uznać za gotowy. Moduł "Second" dopiero się tworzy.  
> Aplikacja opiera się o parametr ?admin=1, żeby przejść do panelu Admina.  
> Admin tworzy potem ręcznie graczy w zakładce "Gracze" i nadaje im PIN.  
> Użytkownik przy pomocy PIN ma dostęp do różnych zakładek i funkcji zdefiniowanych przez admina.  
>  
> Sprawdź czy możliwe jest, żeby parametr ?admin=1 powodował pojawienie się wyskakującego okienka z pytaniem o hasło.  
> Podanie hasła spowodowałoby przejście do widoku admina.  
> Podanie błędnego hasła spowodowałoby pojawienie się komunikatu z błędem i umożliwieniem wpisania ponownie.  
> Anulowanie okna spowodowałoby przejście do widoku użytkownika.  
> Hasło admina byłoby przechowywane w nowej kolekcji w Firebase. Żaden użytkownik nie będzie mieć dostępu do Firebase, więc nawet znając link i kod aplikacji nie będzie mieć dostępu do panelu admina.  
>  
> Napisz mi jak ma się nazywać nowa kolekcja, jak ma się nazywać nowy dokument, jak ma się nazywać Field i jaki to ma być typ (string?).  
> Następnie napisz mi zaktualizowane Rules pod taką funkcjonalność.

---

## 1) Czy technicznie da się dodać okienko hasła po `?admin=1`?
Tak — **UI/flow jest możliwy** i prosty do wdrożenia:
1. Wejście na URL z `?admin=1`.
2. `window.prompt("Podaj hasło administratora")` (albo własny modal).
3. Jeśli hasło poprawne → render widoku admina.
4. Jeśli błędne → komunikat błędu i ponowne pytanie.
5. Jeśli anulowanie (`null`) → przejście do widoku użytkownika.

W obu modułach (`Main`, `Second`) przełączanie admin/user jest obecnie oparte wyłącznie o query param `admin=1`, więc punkt podpięcia logiki już istnieje.

---

## 2) Kluczowe ograniczenie bezpieczeństwa (bardzo ważne)
Samo trzymanie hasła w Firestore i sprawdzanie go po stronie klienta **nie daje realnego zabezpieczenia** bez dodatkowego mechanizmu tożsamości backendowej:

- Jeśli klient ma prawo odczytać dokument z hasłem (lub hashem), to atakujący też może próbować go odczytać.
- Jeśli reguły zablokują odczyt dokumentu hasła dla klientów, to aplikacja webowa także nie odczyta go bezpośrednio.

Dlatego są 2 poprawne warianty:

### Wariant A (rekomendowany): Firebase Authentication + custom claims
- Admin loguje się (email+hasło lub inna metoda Firebase Auth).
- Reguły Firestore sprawdzają `request.auth != null` i np. `request.auth.token.role == "admin"`.
- Dostęp do panelu admina i danych administracyjnych tylko dla admina.

### Wariant B: weryfikacja hasła przez backend (Cloud Function)
- Hasło/sekret nie jest odczytywane przez klienta.
- Klient wysyła hasło do callable HTTPS Function.
- Funkcja weryfikuje hasło i zwraca token/sesję (np. custom token).
- Firestore rules bazują na `request.auth`.

**Wniosek:** sam prompt hasła + dokument w Firestore, bez Auth/Function, to jedynie „utrudnienie”, nie pełne bezpieczeństwo.

---

## 3) Nazewnictwo nowej kolekcji/dokumentu/pola
Jeśli chcesz iść ścieżką „konfiguracji admina” (pod backend), proponuję:

- **Kolekcja:** `admin_security`
- **Dokument:** `credentials`
- **Field:** `passwordHash`
- **Typ:** `string`

Dodatkowe pola (zalecane):
- `hashAlgo`: `string` (np. `"bcrypt"`)
- `updatedAt`: `timestamp`
- `updatedBy`: `string` (UID admina lub identyfikator serwisowy)

> Nie przechowuj hasła jawnego (`plain text`). Trzymaj wyłącznie hash (np. bcrypt/argon2).

---

## 4) Zaktualizowane Firestore Rules (wersja bezpieczna, produkcyjna)
Poniżej reguły dla docelowego modelu z Firebase Auth i rolą admina.  
Zachowują aktualne kolekcje jako publiczne (tak jak masz teraz), ale blokują kolekcję `admin_security` dla zwykłych użytkowników.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.role == "admin";
    }

    match /admin_security/{docId} {
      // Tylko admin może czytać i pisać sekrety administracyjne.
      allow read, write: if isAdmin();
    }

    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /UserGames/{gameId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }

    match /admin_games_stats/{year} {
      allow read, write: if true;
    }

    match /players/{docId} {
      allow read, write: if true;
    }

    match /calculators/{type} {
      allow read, write: if true;

      match /definitions/{versionId} {
        allow read, write: if true;
      }

      match /placeholders/{placeholderId} {
        allow read, write: if true;
      }

      match /sessions/{sessionId} {
        allow read, write: if true;

        match /variables/{varDocId} {
          allow read, write: if true;
        }

        match /calculationFlags/{flagDocId} {
          allow read, write: if true;
        }

        match /tables/{tableId} {
          allow read, write: if true;

          match /rows/{rowId} {
            allow read, write: if true;
          }
        }

        match /snapshots/{snapshotId} {
          allow read, write: if true;
        }
      }
    }

    match /Nekrolog_config/{docId} {
      allow read, write: if true;
    }

    match /Nekrolog_snapshots/{docId} {
      allow read, write: if true;
    }

    match /Nekrolog_refresh_jobs/{docId} {
      allow read: if true;
      allow write: if docId == "latest";
    }
  }
}
```

---

## 5) Minimalny flow UX dla `?admin=1`
1. Użytkownik wchodzi na URL z `?admin=1`.
2. Pojawia się modal/prompt: „Podaj hasło administratora”.
3. Kliknięcie „Anuluj” → usunięcie `admin=1` z URL i render widoku user.
4. Błędne hasło → komunikat i ponowne pytanie.
5. Poprawne hasło:
   - wariant produkcyjny: logowanie przez Auth / token z Cloud Function,
   - dopiero potem wejście do widoku admin.

---

## 6) Rekomendacja końcowa
- Sam pomysł z promptem jest dobry jako UX.
- Dla bezpieczeństwa koniecznie oprzeć autoryzację o **Firebase Auth + Rules** (lub Cloud Function + custom token).
- Sam query param `?admin=1` nie może być źródłem uprawnień.
