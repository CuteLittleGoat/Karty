# Analiza checkboxów w zakładce „Statystyki” — stan po wdrożeniu poprawek

## Prompt użytkownika (kontekst)
> Przeczytaj plik: Analizy/Checkboxy.md
>
> Zostały wdrożone poprawki z powyższej analizy.
> Obecnie aplikacja zwraca błąd "Nie udało się zapisać widoczności kolumn. Spróbuj ponownie." przy każdym zaznaczeniu lub odznaczeniu kolumny.
> W widoku użytkownika nie widzę kolumn "Waga1", "Waga2" itd. do "Waga3" ponieważ domyślnie checkboxy są odznaczone. Jest to działanie poprawne i oczekiwane.
> Z tego wynika, że funkcjonalność ukrywania/odkrywania kolumn dla użytkownika działa.
> Problem jest tylko z zapisem stanu checkboxa co jest komunikowane błędem "Nie udało się zapisać widoczności kolumn. Spróbuj ponownie."
> Przeredaguj plik Analizy/Checkboxy.md
> Dopisz do niego co zostało już wprowadzone i co działa.
> Dopisz następnie analizę czemu pojawia się komunikat błędu oraz jak to naprawić - czy wystarczy zmiana kodu czy potrzebna jest też nowa konfiguracja w Firebase.

---

## 1. Co zostało już wdrożone i działa poprawnie

Na podstawie aktualnego kodu (`Main/app.js`) potwierdzono, że wdrożono kluczowe elementy z poprzedniej analizy:

1. **Nowy domyślny zestaw widoczności kolumn**
   - Dodano `DEFAULT_VISIBLE_STATS_COLUMNS` budowane z `STATS_COLUMN_CONFIG` przez odrzucenie kolumn z `weight: true`.
   - Efekt: `Waga1..Waga7` są domyślnie ukryte.

2. **Naprawa logiki pustej tablicy `visibleColumns`**
   - `getVisibleColumnsForYear(year)` traktuje teraz `[]` jako poprawny stan (nie podmienia jej na fallback „wszystkie kolumny”).
   - To eliminuje stary błąd resetowania konfiguracji po restarcie.

3. **Migracja lat bez `visibleColumns`**
   - W snapshotcie `admin_games_stats` wykrywane są lata bez pola `visibleColumns` i wykonywany jest zapis domyślnej konfiguracji (`set(..., { merge: true })`).
   - Dzięki temu stare lata dostają jednolite wartości domyślne.

4. **Widok użytkownika respektuje konfigurację admina**
   - User view renderuje tylko kolumny wynikające z `getVisibleColumnsForYear(selectedYear)`.
   - Potwierdza to obserwacja użytkownika: kolumny „Waga...” są ukryte domyślnie.

Wniosek: **funkcjonalność UI ukrywania/pokazywania kolumn jest poprawnie zaimplementowana**.

---

## 2. Dlaczego pojawia się błąd „Nie udało się zapisać widoczności kolumn…”

Komunikat pojawia się tylko w jednym miejscu: `catch` po `persistYearConfig(state.selectedYear)` przy zmianie checkboxa.
To oznacza, że:

- kliknięcie checkboxa lokalnie zmienia stan i odświeża UI,
- ale zapis do Firestore (`admin_games_stats/{year}`) kończy się odrzuceniem Promise.

Ponieważ błąd pojawia się **za każdym razem**, najbardziej prawdopodobna przyczyna to nie chwilowa sieć, tylko **stały problem uprawnień / reguł Firestore** dla kolekcji `admin_games_stats`.

### Najbardziej prawdopodobny scenariusz
Reguły Firestore pozwalają na odczyt, ale nie pozwalają na zapis do `admin_games_stats` z kontekstu aktualnej sesji aplikacji (brak auth albo warunki reguł niespełnione).

To tłumaczy komplet objawów:
- UI działa (lokalny stan + render),
- odczyt działa (`onSnapshot`),
- zapis zawsze kończy się błędem i pokazuje komunikat.

---

## 3. Czy wystarczy zmiana kodu?

### Krótka odpowiedź
**Nie, sama zmiana kodu najpewniej nie wystarczy.**

### Dlaczego
Aktualny kod zapisu jest poprawny technicznie (`set({ rows, visibleColumns }, { merge: true })`).
Jeśli Promise jest stale odrzucane, to w praktyce oznacza błąd środowiskowy (reguły/konfiguracja dostępu), a nie błąd algorytmu checkboxów.

---

## 4. Co trzeba zrobić, żeby naprawić problem

## 4.1. Firebase (wymagane)
1. Sprawdzić Firestore Rules dla ścieżki:
   - `admin_games_stats/{year}`
2. Dodać/zweryfikować `allow write` dla roli, która w aplikacji edytuje statystyki (admin).
3. Jeżeli aplikacja nie używa Firebase Auth, reguły muszą uwzględniać przyjęty model (np. jawne dopuszczenie zapisu z tej aplikacji — ostrożnie, z ograniczeniem zakresu danych).

Bez tego komunikat będzie wracał niezależnie od zmian frontendowych.

## 4.2. Kod (zalecane, ale pomocnicze)
Aby szybciej diagnozować produkcyjne problemy:
1. W `catch` dopisać diagnostykę z `error.code` i `error.message` (np. `permission-denied`).
2. Pokazać bardziej konkretny status użytkownikowi (np. „Brak uprawnień zapisu do admin_games_stats”).
3. (Opcjonalnie) dodać rollback checkboxa przy błędzie zapisu, żeby UI nie sugerował, że zmiana została zapisana.

To poprawi UX i debugowanie, ale **nie zastąpi korekty reguł Firestore**.

---

## 5. Finalna ocena

- ✅ Wdrożone poprawki logiki checkboxów są w kodzie i działają (domyślne ukrycie wag + poprawny render user view).
- ⚠️ Aktualny problem dotyczy warstwy zapisu do Firestore, nie samej funkcji ukrywania kolumn.
- ✅ Docelowa naprawa: **aktualizacja konfiguracji Firebase (Firestore Rules) + drobne ulepszenie komunikatów błędów w kodzie**.

---

## 6. Co dokładnie zmienić w Firebase (krok po kroku)

Poniżej jest gotowa instrukcja „co kliknąć i co wkleić”, żeby usunąć błąd zapisu checkboxów.

### 6.1 Firestore Database → Rules
1. Wejdź w **Firebase Console** → **Firestore Database** → zakładka **Rules**.
2. Zastąp aktualną zawartość reguł poniższą wersją (minimalna poprawka pod obecną strukturę kolekcji):

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

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

    // DODAJ: zapis statystyk rocznych (tu zapisują się checkboxy kolumn)
    match /admin_games_stats/{year} {
      allow read, write: if true;
    }

    // DODAJ: kolekcja legacy/statyczna ze screenów
    match /players/{docId} {
      allow read, write: if true;
    }
  }
}
```

3. Kliknij **Publish**.

### 6.2 Weryfikacja po publikacji Rules
1. Otwórz aplikację i przejdź: **Panel Admina → Statystyki**.
2. Zmień stan dowolnego checkboxa kolumny (zaznacz/odznacz).
3. Sprawdź, czy komunikat błędu już się nie pojawia.
4. W Firebase sprawdź dokument `admin_games_stats/{rok}`:
   - pole `visibleColumns` powinno zmieniać się po kliknięciu checkboxa.

### 6.3 Dodatkowa konfiguracja (zalecane po naprawie)
Aktualnie reguły są całkowicie otwarte (`if true`). To jest dobre do szybkiego testu, ale produkcyjnie zalecane jest:
1. Dodać Firebase Authentication.
2. Ograniczyć `write` tylko do administratora (np. custom claims lub lista admin UID).
3. Zostawić `read` wg potrzeb modułów użytkownika.

### 6.4 Dlaczego dokładnie to naprawia błąd checkboxów
- Checkboxy zapisują się do `admin_games_stats/{year}.visibleColumns`.
- W Twoich obecnych Rules nie ma `match /admin_games_stats/{year}`.
- Brak dopasowania reguły = Firestore zwraca `permission-denied` przy zapisie.
- Dodanie tej reguły usuwa przyczynę źródłową komunikatu: „Nie udało się zapisać widoczności kolumn...”.
