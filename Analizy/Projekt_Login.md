# Analiza: zabezpieczenie panelu admina hasłem

## Prompt użytkownika
> Przeprowadź analizę i zapisz jej wyniki w pliku "Projekt_Login.md".  
> Obecnie aplikacja ma dwa moduły: "Main" i "Second".  
> Moduł "Main" można uznać za gotowy. Moduł "Second" dopiero się tworzy.  
> Aplikacja opiera się o parametr ?admin=1, żeby przejść do panelu Admina.  
> Admin tworzy potem ręcznie graczy w zakładce "Gracze" i nadaje im PIN.  
> Użytkownik przy pomocy PIN ma dostęp do różnych zakładek i funkcji zdefiniowanych przez admina.  
> Zaproponuj kilka różnych rozwiązań jak zabezpieczyć panel admina hasłem, żeby żaden użytkownik - nawet znając link - się do niego nie dostał.

## Kontekst i ryzyko obecnego podejścia
Obecne wejście do panelu admina przez `?admin=1` jest tylko mechanizmem nawigacyjnym, a nie bezpieczeństwem.  
Jeśli użytkownik zna link, może próbować wejść do panelu i wykonać akcje administracyjne.

## Cele zabezpieczenia
1. Dostęp do panelu admina wyłącznie po poprawnym uwierzytelnieniu.
2. Brak możliwości ominięcia logowania przez samą zmianę URL.
3. Ochrona sesji przed przejęciem i nadużyciami.
4. Rozdzielenie ról: **admin** vs **gracz (PIN)**.

---

## Wariant 1 (rekomendowany): klasyczne logowanie admina + sesja serwerowa

### Opis
- Tworzymy osobny ekran logowania admina (np. `/admin/login`).
- Admin podaje login + hasło.
- Serwer sprawdza hasło zahashowane algorytmem `Argon2` lub `bcrypt`.
- Po zalogowaniu serwer zakłada sesję (cookie `HttpOnly`, `Secure`, `SameSite=Strict`).
- Każdy endpoint admina sprawdza rolę `admin` w sesji.

### Zalety
- Proste i bardzo skuteczne.
- Dobrze pasuje do obecnej architektury (Main gotowy, Second w budowie).
- Łatwo rozszerzyć o blokady prób logowania i reset hasła.

### Wady
- Wymaga backendowej obsługi sesji i middleware autoryzacji.

### Minimalne wymagania bezpieczeństwa
- Hash hasła (nigdy plaintext).
- Rate limiting logowania (np. max 5 prób/15 min per IP + per login).
- Czas życia sesji (np. 8h), automatyczne wylogowanie po bezczynności.
- CSRF tokeny dla akcji modyfikujących dane.

---

## Wariant 2: hasło admina + 2FA (TOTP)

### Opis
- Jak w wariancie 1, ale po haśle wymagany drugi składnik (kod z aplikacji Authenticator).
- Dostęp do panelu admina dopiero po przejściu obu etapów.

### Zalety
- Znacznie wyższe bezpieczeństwo (wyciek hasła nie wystarcza).
- Dobre dla panelu z wrażliwymi operacjami (zarządzanie graczami i uprawnieniami).

### Wady
- Większa złożoność wdrożenia i utrzymania.
- Konieczność procedury odzyskiwania dostępu (kody zapasowe).

### Kiedy wybrać
- Gdy panel jest dostępny z Internetu i/lub dane mają wysoką wartość operacyjną.

---

## Wariant 3: „hasło do wejścia” (jedno globalne) + sesja

### Opis
- Jeden sekret (hasło administracyjne) trzymany po stronie serwera.
- Po podaniu poprawnego hasła użytkownik otrzymuje sesję admina.

### Zalety
- Najszybsze wdrożenie.
- Niskie koszty implementacji.

### Wady
- Brak rozliczalności (nie wiadomo, który admin wykonał akcję).
- Trudniejsze bezpieczne współdzielenie i rotacja hasła.
- Słabsze od modelu z indywidualnymi kontami.

### Kiedy wybrać
- Tylko jako etap przejściowy, gdy priorytetem jest szybkie „zamknięcie” panelu.

---

## Wariant 4: logowanie admina przez zewnętrznego dostawcę (SSO/OAuth)

### Opis
- Admin loguje się przez dostawcę tożsamości (np. Google Workspace, Microsoft Entra, Keycloak).
- Aplikacja wpuszcza tylko konta z odpowiedniej grupy/roli.

### Zalety
- Centralne zarządzanie tożsamością i politykami haseł.
- Łatwe wymuszenie MFA na poziomie organizacji.

### Wady
- Największa złożoność integracji.
- Zależność od zewnętrznego dostawcy.

### Kiedy wybrać
- W środowisku firmowym z istniejącym IAM/SSO.

---

## Rekomendacja wdrożeniowa dla obecnego etapu projektu
1. **Etap 1 (natychmiast):** wdrożyć wariant 1 (login+hasło+sesja), wyłączyć możliwość wejścia do panelu przez sam `?admin=1` bez sesji.
2. **Etap 2:** dodać 2FA dla admina (wariant 2), szczególnie jeśli panel jest publicznie dostępny.
3. **Etap 3:** ewentualnie przejście na SSO (wariant 4), gdy pojawi się potrzeba wielu adminów i centralnych polityk bezpieczeństwa.

## Zasady, które muszą obowiązywać niezależnie od wariantu
- Parametr `?admin=1` może jedynie przekierować do ekranu logowania, nigdy nadawać uprawnienia.
- Każda operacja admina musi być autoryzowana po stronie serwera.
- PIN gracza nie może umożliwiać żadnych akcji administracyjnych.
- Dziennik audytowy: logowanie admina, nieudane próby, zmiany uprawnień graczy.
- Blokada/bramka po wielu błędnych próbach (anty brute-force).

## Proponowany podział ról
- **Admin:** logowanie hasłem (docelowo hasło + 2FA), dostęp do konfiguracji i zarządzania graczami.
- **Gracz:** dostęp wyłącznie przez PIN do funkcji przypisanych przez admina, bez dostępu do panelu administracyjnego.

## Podsumowanie
Najbardziej praktyczne i bezpieczne „na teraz” jest wdrożenie osobnego logowania admina z sesją serwerową, a następnie rozszerzenie o 2FA. Sam URL (`?admin=1`) nie może być mechanizmem bezpieczeństwa — jedynie trasą do formularza logowania.
