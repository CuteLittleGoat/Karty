# Analiza modułu Main — skrót z parametrem `admin`

## Prompt użytkownika
> Przeczytaj analizę: Analizy/Main_skrot_admin_pwa_admin_vs_skrot_2026-03-23.md
> Następnie wprowadź rozwiązanie Wariant A — rozdzielenie PWA i zwykłego skrótu
> Dodatkowo rozszerz analizę o odpowiedź na pytanie: Czy po zmianie manifestu PWA muszę przeinstalować aplikację, żeby widzieć wprowadzone zmiany?

## Wynik analizy

### 1. Bezpośrednia przyczyna
Moduł `Main` zawsze ładował manifest PWA `manifest-any.webmanifest` przez stały wpis w `index.html`.

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

### 5. Co należało zmienić, żeby skrót mógł zachować `admin=1`
Najbardziej prawdopodobne kierunki poprawki:

#### Wariant A — rozdzielenie PWA i zwykłego skrótu
Nie publikować manifestu PWA dla wejścia administracyjnego (`?admin=1`) albo dynamicznie podmieniać manifest zależnie od trybu.

Efekt:
- wejście admin nie jest traktowane jako instalowalna aplikacja user-only,
- skrót ma większą szansę zachować bieżący URL z `?admin=1`.

#### Wariant B — osobny manifest dla admina
Udostępnić drugi manifest z `start_url=./index.html?admin=1` i podpinać go tylko dla ścieżki/trybu administracyjnego.

Ryzyko:
- trzeba bardzo świadomie zdecydować, czy instalacja admin-PWA jest w ogóle dozwolona,
- obecna blokada `getAdminMode()` wymagałaby doprecyzowania zasad bezpieczeństwa.

#### Wariant C — blokować admina tylko dla konkretnego startu PWA, ale nie dla zwykłego skrótu
Trzeba rozróżnić, czy uruchomienie nastąpiło faktycznie jako standalone PWA, czy tylko przez zwykły link/skrót przeglądarkowy.

To jednak może być mniej stabilne między przeglądarkami niż kontrola manifestu/start URL.

### 6. Odpowiedź dodatkowa — czy po zmianie manifestu PWA trzeba przeinstalować aplikację?
Najczęściej **nie trzeba od razu ręcznie odinstalowywać i instalować aplikacji od nowa**, ale zmiany manifestu PWA nie zawsze są widoczne natychmiast.

W praktyce:
- przeglądarka i zainstalowana aplikacja cache’ują manifest oraz zasoby aplikacji,
- po wdrożeniu zmian manifest może zostać pobrany ponownie dopiero przy kolejnym odświeżeniu strony, ponownym otwarciu aplikacji albo po aktualizacji Service Workera,
- część zmian (np. nazwa, ikona, `start_url`, sposób uruchamiania) może zaktualizować się z opóźnieniem zależnym od przeglądarki i systemu,
- w niektórych przypadkach urządzenie nadal trzyma starą instalację i wtedy najszybszym sposobem zobaczenia efektu bywa usunięcie starej aplikacji/skrótu i utworzenie go ponownie.

W kontekście tej poprawki najlepiej przyjąć zasadę:
1. wdrożyć zmianę,
2. odświeżyć stronę w przeglądarce,
3. zamknąć i ponownie otworzyć aplikację albo skrót,
4. jeżeli urządzenie nadal pokazuje stare zachowanie — usunąć istniejącą instalację lub skrót i dodać je ponownie.

Czyli: **przeinstalowanie nie zawsze jest obowiązkowe, ale czasami jest praktycznie konieczne, żeby wymusić odświeżenie starej konfiguracji PWA zapisanej w urządzeniu**.

## Najważniejszy wniosek
Problem powodują **jednocześnie dwa elementy**:
1. manifest z `start_url=./index.html?pwa=1&view=user`,
2. kod `getAdminMode()`, który dla takiego startu zawsze wyłącza admina.

Jeżeli celem jest możliwość zapisania zwykłego skrótu z `?admin=1`, to konfiguracja PWA w `Main` musi być rozdzielona od wejścia administracyjnego.

## Zmiany w kodzie po wdrożeniu Wariantu A

Plik Main/index.html
Linia 8
Było:     <link rel="manifest" href="manifest-any.webmanifest" />
Jest:     <script src="pwa-config.js"></script>

Plik Main/pwa-config.js
Linia 2
Było:   const MANIFEST_PATH = "manifest-any.webmanifest";
Jest:   const MANIFEST_PATH = "manifest-any.webmanifest";

Plik Main/pwa-config.js
Linia 3
Było:   window.MainPwaConfig = Object.freeze({
Jest:   const params = new URLSearchParams(window.location.search);

Plik Main/pwa-config.js
Linia 4
Było:     manifest: MANIFEST_PATH
Jest:   const isAdminEntry = params.get("admin") === "1";

Plik Main/pwa-config.js
Linia 5
Było:   });
Jest:

Plik Main/pwa-config.js
Linia 6
Było: })();
Jest:   const applyManifest = (manifestPath) => {

Plik Main/pwa-config.js
Linia 7
Było:
Jest:     const existingManifest = document.querySelector('link[rel="manifest"]');

Plik Main/pwa-config.js
Linia 8
Było:
Jest:     if (existingManifest) {

Plik Main/pwa-config.js
Linia 9
Było:
Jest:       existingManifest.href = manifestPath;

Plik Main/pwa-config.js
Linia 10
Było:
Jest:       return;

Plik Main/pwa-config.js
Linia 11
Było:
Jest:     }

Plik Main/pwa-config.js
Linia 12
Było:
Jest:

Plik Main/pwa-config.js
Linia 13
Było:
Jest:     const manifestLink = document.createElement("link");

Plik Main/pwa-config.js
Linia 14
Było:
Jest:     manifestLink.rel = "manifest";

Plik Main/pwa-config.js
Linia 15
Było:
Jest:     manifestLink.href = manifestPath;

Plik Main/pwa-config.js
Linia 16
Było:
Jest:     document.head.appendChild(manifestLink);

Plik Main/pwa-config.js
Linia 17
Było:
Jest:   };

Plik Main/pwa-config.js
Linia 18
Było:
Jest:

Plik Main/pwa-config.js
Linia 19
Było:
Jest:   if (!isAdminEntry) {

Plik Main/pwa-config.js
Linia 20
Było:
Jest:     applyManifest(MANIFEST_PATH);

Plik Main/pwa-config.js
Linia 21
Było:
Jest:   }

Plik Main/pwa-config.js
Linia 22
Było:
Jest:

Plik Main/pwa-config.js
Linia 23
Było:
Jest:   window.MainPwaConfig = Object.freeze({

Plik Main/pwa-config.js
Linia 24
Było:
Jest:     manifest: isAdminEntry ? null : MANIFEST_PATH,

Plik Main/pwa-config.js
Linia 25
Było:
Jest:     isAdminEntry

Plik Main/pwa-config.js
Linia 26
Było:
Jest:   });

Plik Main/pwa-config.js
Linia 27
Było:
Jest: })();

Plik Main/service-worker.js
Linia 1
Było: const CACHE_NAME = "karty-main-pwa-v3";
Jest: const CACHE_NAME = "karty-main-pwa-v4";

Plik Main/service-worker.js
Linia 6
Było:   "./app.js",
Jest:   "./app.js",

Plik Main/service-worker.js
Linia 7
Było:   "./pwa-bootstrap.js",
Jest:   "./pwa-config.js",

Plik Main/service-worker.js
Linia 8
Było:   "./manifest-any.webmanifest",
Jest:   "./pwa-bootstrap.js",

Plik Main/service-worker.js
Linia 9
Było:   "../Pliki/Ikona.png"
Jest:   "./manifest-any.webmanifest",

Plik Main/service-worker.js
Linia 10
Było: ];
Jest:   "../Pliki/Ikona.png"

Plik Main/service-worker.js
Linia 11
Było:
Jest: ];
