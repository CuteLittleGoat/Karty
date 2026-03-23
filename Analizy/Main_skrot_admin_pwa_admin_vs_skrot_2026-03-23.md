# Analiza modułu Main — skrót z parametrem `admin`

## Prompt użytkownika
> Przeprowadź analizę modułu Main.
> Kroki jakie wykonuję:
> 1. W telefonie uruchamiam stronę https://cutelittlegoat.github.io/Karty/Main/index.html?admin=1
> 2. Klikam na Ustawienia
> 3. Klikam "dodaj do ekranu głównego"
> 4. Mam dwie opcje - Zainstaluj albo Utwórz skrót
> 5. Wybieram Utwórz skrót
> 6. Tworzy się skrót do strony, ale otwiera się link https://cutelittlegoat.github.io/Karty/Main/index.html?pwa=1&view=user
>
> Sprawdź czemu tak się dzieje. Blokada na widok użytkownika miała być przez aplikację PWA. Jak tworzę skrót to chcę mieć możliwość zapisania go z parametrem "admin".

## Wynik analizy

### 1. Bezpośrednia przyczyna
Moduł `Main` zawsze ładuje manifest PWA `manifest-any.webmanifest` przez stały wpis w `index.html`.

W tym manifeście `start_url` jest ustawiony na:

`./index.html?pwa=1&view=user`

To oznacza, że mechanizm instalacji/skrótów na telefonie dostaje od strony gotową konfigurację startową prowadzącą do widoku użytkownika, niezależnie od tego, że bieżący adres został otwarty z `?admin=1`.

### 2. Dlaczego po otwarciu skrótu znika `admin=1`
Kod aplikacji rozpoznaje tryb PWA po parametrach URL:
- `pwa=1`
- `view=user`

Następnie funkcja `getAdminMode()` ma twardą blokadę:
- jeżeli uruchomienie spełnia warunek `isPwaUserOnly`, funkcja zawsze zwraca `false`,
- dopiero poza tym warunkiem sprawdza `admin=1`.

W praktyce oznacza to:
- skrót/start z manifestu otwiera `index.html?pwa=1&view=user`,
- aplikacja uznaje taki start za PWA-only-user,
- tryb administratora zostaje wyłączony jeszcze przed analizą parametru `admin=1`.

### 3. Wniosek funkcjonalny
Obecne zachowanie nie wynika z błędu samego telefonu, tylko z aktualnej konfiguracji modułu `Main`:
1. `index.html` zawsze publikuje manifest PWA,
2. manifest zawsze wskazuje `start_url` ustawiony na widok użytkownika,
3. logika `app.js` celowo blokuje admina dla startów oznaczonych jako PWA user-only.

Dlatego wybranie opcji „Utwórz skrót” może nadal użyć konfiguracji powiązanej z manifestem PWA, a nie dokładnie aktualnego URL z `?admin=1`.

### 4. Dlaczego to jest sprzeczne z oczekiwaniem biznesowym
Założenie było takie:
- blokada widoku administratora ma dotyczyć aplikacji PWA,
- zwykły skrót do strony powinien móc zachować `?admin=1`.

Natomiast obecna implementacja nie rozróżnia:
- „prawdziwej instalacji PWA”,
- „skrótu tworzonego z poziomu przeglądarki do aktualnej strony”.

Ponieważ strona zawsze udostępnia manifest, system może potraktować skrót jako wejście przez konfigurację aplikacji webowej i użyć `start_url` z manifestu.

### 5. Co należałoby zmienić, żeby skrót mógł zachować `admin=1`
Najbardziej prawdopodobne kierunki poprawki:

#### Wariant A — rozdzielenie PWA i zwykłego skrótu
Nie publikować manifestu PWA dla wejścia administracyjnego (`?admin=1`) albo dynamicznie podmieniać manifest zależnie od trybu.

Efekt:
- wejście admin nie byłoby traktowane jako instalowalna aplikacja user-only,
- skrót miałby większą szansę zachować bieżący URL z `?admin=1`.

#### Wariant B — osobny manifest dla admina
Udostępnić drugi manifest z `start_url=./index.html?admin=1` i podpinać go tylko dla ścieżki/trybu administracyjnego.

Ryzyko:
- trzeba bardzo świadomie zdecydować, czy instalacja admin-PWA jest w ogóle dozwolona,
- obecna blokada `getAdminMode()` wymagałaby doprecyzowania zasad bezpieczeństwa.

#### Wariant C — blokować admina tylko dla konkretnego startu PWA, ale nie dla zwykłego skrótu
Trzeba rozróżnić, czy uruchomienie nastąpiło faktycznie jako standalone PWA, czy tylko przez zwykły link/skrót przeglądarkowy.

To jednak może być mniej stabilne między przeglądarkami niż kontrola manifestu/start URL.

## Najważniejszy wniosek
Problem powodują **jednocześnie dwa elementy**:
1. manifest z `start_url=./index.html?pwa=1&view=user`,
2. kod `getAdminMode()`, który dla takiego startu zawsze wyłącza admina.

Jeżeli celem jest możliwość zapisania zwykłego skrótu z `?admin=1`, to obecna konfiguracja PWA w `Main` temu aktywnie przeszkadza.
