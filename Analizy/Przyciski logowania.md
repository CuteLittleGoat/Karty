# Analiza: Przyciski logowania + migracja z PIN na Login/Hasło

## Prompt użytkownika
"Przeczytaj wszystkie pliki z Analizy. Stwórz nowy plik o nazwie \"Przyciski logowania\".
Napisz mi nową analizę opisującą krok-po-kroku w jaki sposób będzie przebiegać zakładanie konta użytkownika i admina po przepięciu kodu na nowe kolekcje oraz zmianie Rules (bo obecnie wszystko działa na PIN). Sprawdź czy będą potrzebne w Main i Second nowe przyciski tylu \"zaloguj\". Sprawdź dokładnie wszystkie miejsca w których używa się PIN i czy da się to zastąpić zmianą na model login+hasło.

Przygotuj też plik \"old_StareKolekcje_i_PIN\" w Analizy. Zapisz w nim bardzo dokładne techniczne opisanie które pola w Main obecnie korzystają z Firebase i w jaki sposób. Jak nazywają się obecnie dokumenty i pola oraz które miejsca w aplikacji zapisują dane w którym miejscu w Firebase. Dodatkowo zawrzyj też PEŁEN opis funkcjonalności PIN. Gdzie się ustawia, jak działa, do czego służy. Ten plik ma być archiwum wiedzy jak aplikacja działała przed migracją i zmianą podejścia z PIN na Login+Hasło."

---

## 1) Kontekst po przeglądzie wszystkich plików z `Analizy`
Przegląd istniejących analiz wskazuje, że:
- docelowy kierunek to rozdzielenie danych na moduły (`main_*`, `second_*`) i odejście od dostępu opartego o PIN,
- istnieją już propozycje nowej struktury danych (`users`, role, uprawnienia) oraz reguł Firestore,
- obecna aplikacja produkcyjnie w module Main nadal autoryzuje strefę użytkownika i jej sekcje przez PIN przypisany do gracza.

Wniosek: najbezpieczniejsza migracja to **2-etapowy cutover**: najpierw Auth+Rules+kolekcje użytkowników, potem wyłączenie PIN-gate.

---

## 2) Krok-po-kroku: zakładanie kont po migracji (użytkownik + admin)

Poniżej docelowy przepływ po przepięciu kodu na nowe kolekcje i nowe Rules.

### Etap A — przygotowanie backendu
1. Włącz w Firebase Authentication provider **Email/Hasło**.
2. Wdróż nowe kolekcje modułowe:
   - `main_users`, `second_users` (lub alternatywnie model `modules/{module}/users/{uid}` – jeden wariant spójnie dla całej aplikacji),
   - kolekcje danych modułowych (`main_tables`, `main_user_games`, `main_app_settings`, analogicznie `second_*`).
3. Wdróż nowe Firestore Rules:
   - odczyt/zapis warunkowany `request.auth != null`,
   - dodatkowo kontrola roli i uprawnień z dokumentu użytkownika,
   - brak globalnych `allow read, write: if true`.
4. Dodaj indeksy pod zapytania filtrowane po `ownerUid`, `createdAt`, `role` itp. (tam gdzie potrzebne).

### Etap B — zakładanie konta administratora
5. Konto admina tworzysz z panelu administracyjnego (lub skryptem administracyjnym), a następnie przypisujesz:
   - `role: "admin"`,
   - `isActive: true`,
   - `moduleAccess.main = true` i/lub `moduleAccess.second = true`,
   - pełny zestaw `permissions` dla zakładek.
6. Admin loguje się e-mailem i hasłem na ekranie logowania modułu.
7. Po zalogowaniu frontend pobiera profil z `*_users/{uid}` i renderuje pełny panel admina.

### Etap C — zakładanie konta użytkownika (gracza)
8. Konto użytkownika tworzy admin (zalecane) przez formularz „Utwórz konto”:
   - email,
   - hasło tymczasowe,
   - nazwa wyświetlana,
   - moduł dostępu (Main / Second / oba),
   - zakres zakładek.
9. Do Firestore trafia profil użytkownika z rolą `player` i precyzyjnymi uprawnieniami.
10. Użytkownik loguje się, zmienia hasło tymczasowe i od tej chwili autoryzacja jest sesją Firebase Auth, nie PIN.

### Etap D — autoryzacja sekcji po loginie
11. Zamiast sprawdzania „czy PIN poprawny”, UI sprawdza:
   - czy jest `currentUser` z Firebase Auth,
   - czy profil ma `isActive=true`,
   - czy ma wymagane `permissions` do danej zakładki.
12. Bramka dostępu w sekcjach (`Najbliższa gra`, `Czat`, `Gry do potwierdzenia`, `Gry użytkowników`, `Statystyki`) przechodzi z PIN na warunek uprawnień konta.
13. Dane gracza (np. wiadomości czatu, własne gry) wiążemy przez `uid`, nie przez `pin`.

### Etap E — wyłączenie PIN
14. Po pełnym przejściu usuwasz pole `pin` z modelu gracza i z formularzy admina.
15. Usuwasz wszystkie `*PinGate*` i sesje `sessionStorage` typu `*PinVerified`.
16. Uruchamiasz migrację danych historycznych (mapowanie autorów i właścicieli gier do `uid`, jeżeli wcześniej opierali się o `player.id`/PIN).

---

## 3) Czy potrzebne są nowe przyciski „Zaloguj”?

## Main
**Tak — wymagane.**
Obecny Main ma wielokrotne bramki PIN i przyciski „Otwórz” dla każdej sekcji.
Po migracji trzeba dodać centralny ekran logowania i minimum:
- przycisk **„Zaloguj”**,
- opcjonalnie **„Wyloguj”**,
- opcjonalnie **„Reset hasła”**.

Dodatkowo można zostawić przyciski „Otwórz” jako nawigacyjne, ale nie mogą już pełnić funkcji autoryzacji.

## Second
**Również tak — wymagane.**
Second ma obecnie layout z PIN-ową narracją w HTML (komunikaty i pole PIN), ale brak implementacji logiki Auth.
Po migracji powinien mieć własny ekran logowania modułowego (lub wspólny komponent logowania z wyborem modułu).

Wniosek: dla obu modułów trzeba dodać przyciski typu „Zaloguj”, bo bez nich nie ma wejścia w model Auth email+hasło.

---

## 4) Wszystkie miejsca, gdzie aktualnie używany jest PIN (Main)

PIN jest używany w dwóch warstwach:

### A) Warstwa modelu danych gracza
- `app_settings/player_access.players[].pin` — przechowywanie PIN per gracz.
- admin zarządza PIN-em w zakładce „Gracze” (edycja ręczna + losowanie, walidacja unikalności).

### B) Warstwa bramek dostępu (UI + sesja)
Oddzielne bramki i stan sesji dla:
1. `nextGameTab` (Najbliższa gra),
2. `chatTab` (Czat),
3. `confirmationsTab` (Gry do potwierdzenia),
4. `userGamesTab` (Gry użytkowników),
5. `statsTab` (Statystyki),
6. `playerZoneTab` (wejście do Strefy Gracza).

Każda sekcja ma:
- własny input PIN,
- własny przycisk submit,
- własny status,
- własne flagi `sessionStorage` (np. `chatPinVerified`) i identyfikator zweryfikowanego gracza.

---

## 5) Czy da się to zastąpić modelem Login+Hasło?

**Tak, w pełni.**
Mapa 1:1 jest możliwa:
- `playerByPin.get(pin)` -> `currentUser.uid` + dokument profilu użytkownika,
- `sessionStorage *PinVerified` -> natywna sesja Firebase Auth,
- `isPlayerAllowedForTab(player, tabKey)` -> `hasPermission(currentUserProfile, tabKey)`,
- identyfikacja autora/ownera po `player.id` -> po `uid`.

## Potrzebne zmiany techniczne
1. Dodać moduł Auth (`signInWithEmailAndPassword`, `signOut`, listener `onAuthStateChanged`).
2. Dodać resolver profilu użytkownika z `*_users/{uid}`.
3. Przepiąć wszystkie funkcje `verifyPin()` na sprawdzanie stanu zalogowania i uprawnień profilu.
4. Usunąć zależności od `pin` w `adminPlayersState`.
5. Dla historycznych danych dodać fallback mapowania (np. stare wpisy czatu/gry mogą nie mieć `uid`).

---

## 6) Rekomendacja wdrożeniowa (minimalne ryzyko)
1. Wdrożyć login i profile użytkowników bez usuwania PIN (tryb przejściowy).
2. Dodać nowy UI „Zaloguj”, ale utrzymać PIN jako fallback przez krótki okres testowy.
3. Po potwierdzeniu stabilności: wyłączyć PIN gates, wyczyścić pola `pin`, uprościć model gracza.
4. Na końcu zaostrzyć Rules tak, aby dostęp był możliwy wyłącznie dla `request.auth` + rola/uprawnienia.

---

## 7) Odpowiedź zbiorcza
- Proces zakładania kont admina i użytkownika po migracji jest prosty funkcjonalnie, ale wymaga kontrolowanej sekwencji: Auth -> profile -> Rules -> UI.
- W **Main i Second** będą potrzebne nowe przyciski typu **„Zaloguj”**.
- Wszystkie obecne użycia PIN da się zastąpić modelem **login+hasło**, pod warunkiem przepięcia autoryzacji sekcyjnej na profil użytkownika i uprawnienia.
