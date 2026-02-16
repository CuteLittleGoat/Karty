# Analiza wdrożenia zabezpieczenia dostępu do panelu admina

## Prompt użytkownika
> „Przeprowadź analizę zabezpieczenia dostępu do panelu admina (czyli dopisanie parametru ?admin=1 do adresu). Może login i hasło? Może samo hasło? Może dodatkowy, nadrzędny PIN? Przeprowadź analizę wdrożenia funkcjonalności.”

## 1. Stan obecny (na bazie kodu)

### 1.1. Przełączanie na tryb admin
Aktualnie tryb admin aktywuje się wyłącznie przez parametr URL `?admin=1`.

- Funkcja `getAdminMode()` zwraca `true`, gdy query param `admin` ma wartość `1`.
- W `bootstrap()` klasa CSS `is-admin` jest ustawiana bez dodatkowej autoryzacji.

Skutek: każdy, kto zna URL, może wejść do interfejsu administratora.

### 1.2. Brak warstwy uwierzytelnienia Firebase Auth
W kodzie frontendu nie ma logowania (brak `signInWithEmailAndPassword`, brak tokenów, brak kontroli sesji użytkownika jako admina).

Skutek: aplikacja nie odróżnia kryptograficznie użytkownika zwykłego od admina.

### 1.3. Firestore Rules są otwarte
W dokumentacji projektowej aktualne reguły Firestore mają `allow read, write: if true;` dla kolekcji aplikacji.

Skutek: nawet bez wejścia do panelu admin, klient może wykonywać operacje odczytu i zapisu z poziomu JS SDK.

## 2. Ocena wariantów zabezpieczenia

## 2.1. Wariant A — „samo hasło” po stronie frontendu
Przykład: modal z hasłem po wejściu w `?admin=1`, a hasło sprawdzane w JS lub w dokumencie Firestore.

**Plusy**
- Najszybsze wdrożenie.
- Mały zakres zmian UI.

**Minusy krytyczne**
- Hasło i logika walidacji są po stronie klienta (możliwe obejście).
- Bez twardych Firestore Rules atakujący i tak może pisać bezpośrednio do bazy.
- Nie zapewnia audytu tożsamości (kto wykonał operację).

**Wniosek**: dobre tylko jako „zasłona UX”, nie jako realne bezpieczeństwo.

## 2.2. Wariant B — „login + hasło” (Firebase Authentication)
Logowanie admina przez `email/password` + kontrola uprawnień na podstawie tokenu i/lub custom claims.

**Plusy**
- Realna tożsamość użytkownika.
- Możliwość wymuszenia silnych haseł, resetu hasła, blokad.
- Fundament pod reguły bezpieczeństwa i audyt.

**Minusy / koszt**
- Wymaga przebudowy reguł Firestore.
- Potrzebna migracja operacji admin do ścieżek chronionych regułami.

**Wniosek**: rekomendowany wariant bazowy.

## 2.3. Wariant C — „dodatkowy nadrzędny PIN” (2. poziom)
Po zalogowaniu admin wpisuje jeszcze PIN „master” do operacji wrażliwych (np. usuwanie danych, edycja konfiguracji globalnej).

**Plusy**
- Dodatkowa warstwa bezpieczeństwa dla operacji krytycznych.
- Chroni przed przypadkiem „zalogowana sesja na cudzym urządzeniu”.

**Minusy**
- Pogarsza UX przy codziennej pracy.
- Jeśli PIN jest sprawdzany wyłącznie w frontendzie, nie daje pełnej ochrony.

**Wniosek**: sensowne jako rozszerzenie wariantu B, ale walidacja PIN powinna odbywać się serwerowo (Cloud Functions / backend).

## 2.4. Wariant D — zostawienie `?admin=1` jako mechanizmu
To tylko przełącznik widoku, nie kontrola dostępu.

**Wniosek**: można zostawić jako techniczny „route flag”, ale wyłącznie pomocniczo. Nie może być warstwą bezpieczeństwa.

## 3. Rekomendowana architektura docelowa

1. **Firebase Auth (email + hasło) jako obowiązkowy warunek wejścia do admina**.
2. **Custom Claims (np. `role: admin`)** nadawane tylko z zaufanego środowiska (Admin SDK).
3. **Firestore Rules oparte o `request.auth` i claimy**:
   - admin: pełny zapis do kolekcji administracyjnych,
   - user: ograniczony odczyt/zapis tylko do własnych, dozwolonych danych.
4. **`?admin=1` tylko jako intencja wejścia na ekran**, a nie autoryzacja.
5. **Opcjonalny PIN nadrzędny** dla operacji destrukcyjnych, walidowany po stronie serwerowej.

## 4. Proponowany plan wdrożenia (etapami)

## Etap 1 — twarde minimum bezpieczeństwa (MVP security)
- Dodać ekran logowania administratora (email/hasło).
- Zmienić bootstrap:
  - jeśli `?admin=1` i brak `currentUser` -> pokazuj login,
  - jeśli user zalogowany, ale bez claim `admin` -> brak dostępu.
- Przygotować pierwszą wersję Firestore Rules blokującą zapisy bez `request.auth != null`.

**Efekt**: koniec z publicznym adminem po URL.

## Etap 2 — autoryzacja ról
- Wprowadzić `role=admin` przez custom claims.
- Ograniczyć kolekcje administracyjne regułami typu `isAdmin()`.
- Rozdzielić to, co może robić user vs admin.

**Efekt**: realny model uprawnień.

## Etap 3 — zabezpieczenia operacji krytycznych
- Dodać „master PIN” lub ponowną autoryzację hasłem do:
  - usuwania gier,
  - zmian globalnych ustawień,
  - resetów/operacji hurtowych.
- Walidacja tylko po stronie zaufanej (Cloud Functions).

**Efekt**: redukcja ryzyka nadużyć po przejęciu sesji.

## Etap 4 — operacyjne hardening
- Wymusić mocne hasła, rotację, ograniczenie prób logowania.
- Logować akcje admina (kto, co, kiedy).
- Dodać alerty przy anomaliach (np. seria usunięć).

## 5. Ryzyka i uwagi implementacyjne

1. **Największe ryzyko obecne**: otwarte Firestore Rules (`if true`).
2. **Samo ukrycie UI** (CSS/parametr URL) nie stanowi zabezpieczenia.
3. **PIN gracza** nie zastępuje tożsamości administratora.
4. **Migrację reguł** trzeba przeprowadzić ostrożnie (testy ścieżek user/admin), by nie zablokować legalnych operacji.

## 6. Rekomendacja końcowa (decyzja)

Najlepsza ścieżka dla tego projektu:

- **Obowiązkowo**: login + hasło (Firebase Auth) + role admin (custom claims) + restrykcyjne Firestore Rules.
- **Opcjonalnie**: nadrzędny PIN dla operacji krytycznych (serwerowa walidacja).
- **`?admin=1`** pozostawić jedynie jako „przejście do widoku”, bez znaczenia bezpieczeństwa.

To podejście jest jedynym, które jednocześnie:
- zamyka dostęp po samym URL,
- chroni dane na poziomie bazy,
- daje rozszerzalność (audyt, 2FA/MFA, polityki bezpieczeństwa).
