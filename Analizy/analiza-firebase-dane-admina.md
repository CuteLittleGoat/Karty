# Analiza połączenia z Firebase dla zapisu danych admina

## Obecny stan integracji
- Aplikacja webowa używa **Firebase Firestore** w trybie „compat” do:
  - zapisu PIN-u w dokumencie `app_settings/next_game`,
  - zapisu wiadomości admina w kolekcji `admin_messages`,
  - odczytu ostatniej wiadomości z `admin_messages` posortowanej po `createdAt`.
  Implementacja jest w `Main/app.js` i działa bez uwierzytelniania (brak Firebase Auth w kodzie).【F:Main/app.js†L1-L383】
- Konfiguracja projektu Firebase jest pobierana z `config/firebase-config.js` (globalny obiekt `window.firebaseConfig`).【F:config/firebase-config.js†L1-L11】
- Dokument `Firebase.md` opisuje włączenie Firestore, wymagane kolekcje oraz **przykładowe reguły**, które wprost dopuszczają odczyt i zapis dla `admin_messages` i `app_settings`.【F:Firebase.md†L1-L69】

## Czy obecna konfiguracja wystarczy do zapisu danych admina?
**Tak, technicznie wystarczy**, jeśli:
1. Firestore jest włączony w projekcie, a aplikacja ma poprawny `firebaseConfig`.
2. Reguły Firestore zezwalają na **zapis** nowych kolekcji/dokumentów, które planujesz dodać (np. `players`, `stakes`, `tables`).

W praktyce oznacza to, że **bez dodatkowych zmian w kodzie** i **bez Auth** możesz zapisywać nowe dane, ale **musisz**:
- utworzyć nowe kolekcje w Firestore,
- rozszerzyć reguły bezpieczeństwa o te kolekcje (lub globalnie dopuścić zapis),
- zachować spójne nazewnictwo i strukturę dokumentów.

## Co trzeba dodatkowo skonfigurować w Firebase, aby zapisywać nowe dane admina?
### 1) Reguły Firestore
Obecny przykład reguł obejmuje tylko `admin_messages` i `app_settings`.【F:Firebase.md†L39-L69】
Aby zapisywać np. graczy, stoły czy stawki, reguły muszą **jawnie** dopuścić zapis do nowych ścieżek.

**Minimalnie (na etapie prototypu/testów):**
- dodać nowe match-e do reguł,
- albo zastosować szerszą regułę pozwalającą na zapis wszystkich kolekcji.

> Uwaga: w produkcji **nie zaleca się** otwartego zapisu dla każdego użytkownika.

### 2) Firebase Auth (zalecane dla produkcji)
Aktualny kod **nie używa Firebase Auth**, więc każdy, kto zna adres aplikacji, może potencjalnie zapisywać dane, jeśli reguły są otwarte.【F:Main/app.js†L1-L383】
Jeśli chcesz, aby tylko admin zapisywał dane:
- skonfiguruj **Firebase Authentication** (np. Email/Password),
- dodaj logowanie admina w aplikacji webowej,
- ustaw reguły Firestore z warunkiem `request.auth != null` albo dodatkowym sprawdzeniem roli admina.

### 3) Struktura danych
Nie ma technicznego ograniczenia po stronie Firebase, ale warto z góry ustalić strukturę, np.:
- `players/{playerId}`: imię, nazwisko, status, chipy itd.
- `tables/{tableId}`: numer stołu, lista graczy
- `stakes/{stakeId}`: stawka, opis, aktywna flaga

Dzięki temu łatwo dopasujesz reguły i zapytania w kodzie.

## Odpowiedź na pytanie „czy muszę coś dodatkowo konfigurować?”
- **Jeśli zostajesz przy otwartych regułach (prototyp/testy):** wystarczy dodać nowe kolekcje i rozszerzyć reguły Firestore o zapis do tych kolekcji.
- **Jeśli chcesz bezpieczny zapis tylko przez admina (zalecane):** musisz skonfigurować Firebase Auth i zawęzić reguły zapisu do zalogowanego admina.

## Podsumowanie decyzji
- **Obecna konfiguracja pozwala zapisywać dane**, ale **tylko w zakresie aktualnie dopuszczonych reguł** i bez kontroli dostępu.【F:Firebase.md†L39-L69】【F:Main/app.js†L1-L383】
- Aby dodawać nowe dane admina i mieć pewność, że nikt niepowołany ich nie zapisze, potrzebujesz **Auth + precyzyjnych reguł**.
