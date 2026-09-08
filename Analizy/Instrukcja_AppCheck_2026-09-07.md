# App Check — instrukcja krok po kroku

## Gdzie jesteśmy (stan na 2026-09-08)

| Krok | Stan |
|---|---|
| KROK 1 — klucz reCAPTCHA Enterprise w Google Cloud | ✅ wykonane (klucz `Karty`, typ *Sieć*, domena `cutelittlegoat.github.io`) |
| KROK 2 — rejestracja obu aplikacji `Karty-Web` w App Check | ✅ wykonane (obie: *Registered*, dostawca *reCAPTCHA Enterprise*) |
| KROK 3 — klucz w `config/firebase-config.js` | ✅ wykonane, wypchnięte na `main` |
| TTL tokenu | 🔵 domyślna 1 godzina — zalecana zmiana na `1 days`, patrz „Jak zmienić TTL już po rejestracji” |
| KROK 4 — obserwacja zakładki *APIs* przez kilka dni | 🔵 **teraz to robisz** |
| KROK 5 — *Enforce* (wymuszanie) | ⛔ **jeszcze nie klikaj** |

## Prompt użytkownika (zachowany dla kontekstu)

> App Check - musisz mi dokładnie i prosto napisać jak to zrobić. Co i gdzie klikać.

> Nie mam opcji reCAPTCHA v3 [zrzut ekranu z Firebase Console]

> Mam taki komunikat. [zrzut ekranu z komunikatem o wycofaniu reCAPTCHA]

> Pole do wpisania kodu jest nieaktywne. Nie mogę go kliknąć. Sprawdź czy powinna być
> możliwość wklejenia tam czegoś. Sprawdź dokumentację i ogólnie informacje w necie.

> Jedyne co reaguje na kliknięcie to „advanced settings”. [zrzut ekranu]

---

## WAŻNE — instrukcja została poprawiona 2026-09-08

Pierwsza wersja tej instrukcji prowadziła Cię drogą przez **klasyczną reCAPTCHA v3** i twierdziła, że
**reCAPTCHA Enterprise wymaga płatnego planu Blaze**. **To była moja pomyłka.** Sprawdziłem
dokumentację Google:

- reCAPTCHA Enterprise **działa na darmowym planie Spark**. Płatność jest potrzebna wyłącznie do
  odblokowania pełnego zakresu progów ryzyka (11 poziomów zamiast 4). Do naszego zastosowania
  darmowe 4 poziomy w zupełności wystarczają.
- Samo utworzenie klucza reCAPTCHA w Google Cloud **też nie wymaga włączania płatności** — projekt
  bez płatności dostaje automatycznie tryb *Essentials* z limitem **10 000 sprawdzeń miesięcznie za darmo**.

Dlatego cała instrukcja została przepisana **na reCAPTCHA Enterprise**. Stara droga (klasyczna
reCAPTCHA v3) jest opisana na końcu, w Załączniku A — na wypadek, gdyby kiedyś była potrzebna.

**Co to zmienia dla Ciebie:** nic, poza tym, że klikasz w innym miejscu. Kod aplikacji jest już
przygotowany na **oba** warianty — wybiera dostawcę automatycznie, na podstawie tego, którą linię
odkomentujesz w pliku konfiguracyjnym (patrz KROK 3).

---

## Dlaczego pole na klucz było nieaktywne

Krótka odpowiedź: **tak, tam normalnie da się coś wkleić — ale nie w tym okienku, które otworzyłeś.**

Dłuższa:

1. Google **wycofuje** klasyczną reCAPTCHA z App Check. Dokumentacja Firebase pisze wprost:
   *„You should use reCAPTCHA Enterprise for new integrations, and we strongly recommend that
   developers of apps using reCAPTCHA v3 upgrade when possible”*. Czerwony komunikat, który
   zobaczyłeś, to właśnie to. Wygląda na to, że w Twoim projekcie konsola już **nie pozwala**
   zarejestrować nowej aplikacji starą metodą — pole jest widoczne, ale zablokowane.
2. Do tego wskazówka ze zrzutu: jedyne, co reagowało, to **„Advanced settings”** z suwakiem
   **„App risk”** i wartością **Medium (0.5)**. Ten suwak to ustawienie **wyłącznie z reCAPTCHA
   Enterprise** — w klasycznej reCAPTCHA v3 App Check w ogóle go nie ma. Czyli okienko, w którym
   utknąłeś, jest już okienkiem Enterprise, a ono **nie chce klucza tajnego** — ono chce
   **klucza witryny z Google Cloud**, którego jeszcze nie masz. Dlatego pole nic nie przyjmuje.

Nie ma więc czego naprawiać w przeglądarce. **Trzeba najpierw utworzyć klucz w Google Cloud**
(KROK 1), a dopiero potem wrócić do Firebase (KROK 2).

> Jeśli chcesz mieć 100% pewności, że to nie wina przeglądarki: otwórz konsolę w **oknie
> incognito** (Ctrl+Shift+N) albo w innej przeglądarce, bez wtyczek i blokerów reklam.
> To kwestia dwóch minut. Jeśli pole nadal będzie zablokowane — potwierdza się powyższe
> i po prostu robisz KROK 1.

---

## Zanim zaczniesz — co to w ogóle jest

App Check sprawdza, czy zapytanie do bazy przychodzi **z Twojej aplikacji**, a nie z jakiegoś obcego
programu. Nie sprawdza, kim jest użytkownik — od tego są PIN-y.

Cała robota to trzy rzeczy:
1. **Google Cloud** — zakładasz tam klucz reCAPTCHA dla swojej domeny i dostajesz **jeden** klucz.
2. **Firebase Console** — wklejasz ten klucz przy obu aplikacjach `Karty-Web`.
3. **Plik konfiguracyjny aplikacji** — wklejasz **ten sam** klucz.

Kod aplikacji jest już gotowy. Sam się włączy w momencie, w którym dopiszesz klucz do konfiguracji.
Dopóki go nie dopiszesz, nic się nie dzieje.

> **Dobra wiadomość:** w wariancie Enterprise jest **tylko jeden klucz** — *klucz witryny* (site key).
> Nie ma już „klucza tajnego”, którego nie wolno nigdzie wkleić. Nie da się ich pomylić, bo jest jeden.
> Ten klucz **jest jawny** i ma prawo być w repozytorium — dokładnie tak samo jak `apiKey`.

---

## KROK 1 — Utwórz klucz reCAPTCHA w Google Cloud  ✅ WYKONANE 2026-09-08

1. Wejdź na **https://console.cloud.google.com/security/recaptcha**
   - Zaloguj się tym samym kontem Google, na którym masz Firebase.
   - Strona nazywa się **reCAPTCHA** (dawniej: *Fraud Defense*).
2. **Na samej górze strony sprawdź, czy w wybieraku projektu jest `karty-turniej`.**
   Jeśli nie — kliknij i wybierz go z listy. To najczęstszy błąd na tym etapie.
3. Jeśli konsola poprosi o **włączenie API** (przycisk *Enable* / *Włącz* przy „reCAPTCHA Enterprise API”)
   — kliknij i poczekaj kilkanaście sekund.
   - **To nie włącza płatności.** Projekt bez płatności dostaje darmowy tryb *Essentials*.
   - Gdyby Google poprosił o kartę — zatrzymaj się i daj znać. Nie powinien.
4. Kliknij **Create key** (*Utwórz klucz*).
5. Wypełnij formularz:
   - **Display name** (nazwa wyświetlana): wpisz `Karty`
   - **Application type** / **Platform type** (typ aplikacji): wybierz **Website** / **Web**
   - **Domains** (domeny): kliknij **Add a domain** i wpisz dokładnie:
     ```
     cutelittlegoat.github.io
     ```
     Wpisujesz **samą domenę** — bez `https://`, bez `/Karty`, bez ukośnika na końcu.
   - **Sprawdzanie domen zostaw włączone.** Jeśli zobaczysz przełącznik w stylu
     *„Do not verify domains”* / *„Disable domain verification”* — **nie włączaj go**.
     Dzięki temu klucz działa tylko na Twojej stronie.
   - **`localhost` NIE dodawaj.** Dokumentacja Google mówi o tym wprost przy kluczach produkcyjnych.
     Do testów z dysku jest osobny mechanizm — patrz sekcja „Praca lokalna” na końcu.
   - Jeśli gdzieś zobaczysz opcję **„Use checkbox challenge”** (zaznaczanie „nie jestem robotem”) —
     **zostaw ją niezaznaczoną**. App Check potrzebuje klucza „punktowego”, działającego w tle,
     bez pokazywania czegokolwiek graczom.
   - Sekcji **„Additional settings” / klucz testowy** nie ruszaj.
6. Kliknij **Create key**.
7. Na liście pojawi się Twój klucz. **Skopiuj jego identyfikator** (długi ciąg, zaczyna się od `6L...`).
   To jest **klucz witryny (site key)** — jedyny, jaki będzie Ci potrzebny. Wklej go do notatnika.

---

## KROK 2 — Zarejestruj aplikacje w Firebase App Check  ✅ WYKONANE 2026-09-08

1. Wejdź na **https://console.firebase.google.com** i wybierz projekt **karty-turniej**.
2. W lewym menu znajdź **App Check**.
   - Jest w sekcji **Build** (po polsku: *Kompilacja*), obok pozycji „Firestore Database”.
   - Jeśli nie możesz go znaleźć, użyj **lupki / wyszukiwarki** na górze konsoli i wpisz `App Check`.
3. Wejdź w zakładkę **Apps** (*Aplikacje*).
4. Na liście zobaczysz trzy wpisy:
   - `Karty-Android-PUSH` — pozostałość po próbie powiadomień Push,
   - `Karty-Web` — aplikacja webowa,
   - `Karty-Web` — **druga** aplikacja webowa o tej samej nazwie.
5. Kliknij **Register** przy **pierwszej** aplikacji `Karty-Web`.
6. Zobaczysz dwie opcje: **reCAPTCHA Enterprise** oraz **reCAPTCHA**.
   Kliknij `+` przy **reCAPTCHA Enterprise** (górna pozycja).
   - **Tym razem celowo wybierasz Enterprise.** Poprzednia wersja instrukcji mówiła odwrotnie —
     patrz sekcja „WAŻNE” na górze.
7. W polu na klucz wklej **klucz witryny z KROKU 1** (ten zaczynający się od `6L...`).
   - Tutaj **nie ma i nie może być** klucza tajnego. Enterprise używa jednego, jawnego klucza.
   - Jeśli pole nadal jest nieaktywne — odśwież stronę (F5) po utworzeniu klucza w Google Cloud.
     Konsola czasem musi „zobaczyć”, że klucz już istnieje.
8. **„Advanced settings”** (to, co Ci się otwierało) — **zostaw domyślne**.
   Ustawienie **„App risk: Medium (0.5)”** jest w porządku.
   - Na darmowym planie dostępne są tylko cztery poziomy: `0.1`, `0.3`, `0.7`, `0.9`.
     Domyślne `Medium` mieści się w darmowym zakresie i nie musisz nic zmieniać.
   - Im wyższy próg, tym ostrzej App Check odrzuca ruch. Nie podnoś go — grozi to blokowaniem
     własnych graczy.
9. Pole **Token time to live** (TTL) — okienko Enterprise proponuje domyślnie **1 godzinę**.
   **Dla tej aplikacji lepszą wartością jest `1` + `days`** (patrz sekcja „Jak zmienić TTL” niżej).
   - TTL mówi, jak długo ważna jest jedna „przepustka” wydana przeglądarce. Po tym czasie
     aplikacja po cichu pobiera nową. Gracz niczego nie zauważa.
   - **Biblioteka odświeża token mniej więcej w połowie TTL.** Przy 1 godzinie oznacza to nowe
     sprawdzenie co ~30 minut korzystania z aplikacji; przy 1 dniu — co ~12 godzin.
   - Krótszy TTL = częstsze odnawianie = szybsze zużywanie darmowego limitu 10 000 sprawdzeń
     miesięcznie. Dopuszczalny zakres to **od 30 minut do 7 dni**.

10. Kliknij **Zapisz** (Save).
11. **Powtórz podpunkty 5–10 dla drugiej aplikacji `Karty-Web`**, wklejając **ten sam** klucz.

> **Dlaczego obie.** Aplikacja korzysta tylko z jednej z nich — tej o identyfikatorze
> kończącym się na `...27d29434f013a5cf31888d` (widać go w *Project settings* → *General* → *Your apps*).
> Gdybyś zarejestrował tę drugą, wszystko wyglądałoby poprawnie aż do kliknięcia **Enforce**,
> po którym aplikacja przestałaby działać. Zarejestrowanie obu tym samym kluczem
> całkowicie usuwa to ryzyko i nic nie kosztuje.

> **Aplikacji `Karty-Android-PUSH` nie ruszaj i niczego nie kasuj.** Nieużywany wpis nikomu
> nie przeszkadza i nie wpływa na App Check. Usuwanie aplikacji w Firebase jest operacją
> bez cofnięcia, a przy dwóch bliźniaczych wpisach `Karty-Web` łatwo skasować tę właściwą —
> co wyłączyłoby całą aplikację, nie tylko App Check. Porządki najwyżej po wdrożeniu.

Po zapisaniu przy obu aplikacjach pojawi się status. **Nie klikaj jeszcze niczego o nazwie
„Enforce” / „Wymuś”** — do tego wracamy w kroku 5.

---

## KROK 3 — Wklej klucz do aplikacji  ✅ WYKONANE 2026-09-08

Ten krok został już wykonany — klucz `6Ld6x68t...KU2` jest wpisany w `config/firebase-config.js`
i wypchnięty na `main`. Poniżej zostaje opis, gdyby kiedyś trzeba było klucz wymienić.

### Co znaczy „odkomentować linię”

W plikach z kodem **dwa ukośniki `//` na początku linii wyłączają tę linię.** Program jej wtedy
w ogóle nie widzi — jest tam tylko dla człowieka, jak notatka na marginesie. To się nazywa
„zakomentowana”.

**„Odkomentować” = usunąć te dwa ukośniki**, żeby linia zaczęła działać. Nic więcej.

Przed (linia wyłączona — sam opis, program jej nie czyta):

```js
  // , appCheckEnterpriseSiteKey: "TU_WKLEJ_KLUCZ_WITRYNY_reCAPTCHA_ENTERPRISE"
```

Po (linia działa — program czyta klucz):

```js
  , appCheckEnterpriseSiteKey: "6Ld6x68t...twój_klucz..."
```

Zmieniły się dwie rzeczy: zniknęły `//` z początku i tekst zastępczy w cudzysłowie
został podmieniony na prawdziwy klucz.

### Jak wygląda gotowy plik

```js
window.firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "karty-turniej",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  tablesCollection: "Tables",
  gamesCollection: "Tables",
  gameDetailsCollection: "rows",
  userGamesCollection: "UserGames"
  , appCheckEnterpriseSiteKey: "6L...tutaj_twój_klucz_witryny..."
};
```

**Zwróć uwagę na przecinek** na początku linii `, appCheckEnterpriseSiteKey` — musi tam być,
inaczej aplikacja się nie uruchomi.

> **Nie odkomentowuj obu linii naraz** (`appCheckEnterpriseSiteKey` i `appCheckSiteKey`).
> Gdyby jednak tak się stało — aplikacja nie przestanie działać, bo kod w takim wypadku
> wybiera Enterprise. Ale lepiej trzymać tam jedną, właściwą.

Na koniec: zapisz plik, wgraj zmianę na GitHub (commit + push) i poczekaj chwilę, aż GitHub Pages
opublikuje nową wersję (zwykle do minuty).

---

## KROK 4 — Sprawdź, czy działa

1. Otwórz aplikację **z adresu internetowego**: `https://cutelittlegoat.github.io/Karty/Main/index.html`
   *(nie z pliku na dysku — o tym niżej)*
2. Korzystaj z niej normalnie przez chwilę: wejdź w kilka zakładek, otwórz statystyki.
3. Wróć do Firebase Console → **App Check** → zakładka **APIs** (*Interfejsy API*).
4. Kliknij **Cloud Firestore**.
5. Zobaczysz wykres z podziałem zapytań. Interesuje Cię, żeby rosła liczba **zweryfikowanych**
   (Verified), a nie „niezweryfikowanych” (Unverified).

**Szybka kontrola w przeglądarce (opcjonalnie):** naciśnij **F12** → zakładka **Console**.
Jeśli zobaczysz tam czerwony błąd zawierający `appCheck` albo `recaptcha` — coś jest nie tak
z kluczem albo z domeną. Najczęstsza przyczyna: w kluczu w Google Cloud brakuje domeny
`cutelittlegoat.github.io` albo wkleiłeś klucz z literówką.

**Nie spiesz się z następnym krokiem.** Daj to sobie działać przez kilka dni normalnego
użytkowania, żeby wszyscy gracze zdążyli wejść na nową wersję.

---

## KROK 5 — Dopiero teraz włącz wymuszanie

To jest krok, który faktycznie blokuje obce programy. **Wykonaj go dopiero wtedy**, gdy w kroku 4
widzisz, że praktycznie cały ruch jest zweryfikowany.

1. Firebase Console → **App Check** → zakładka **APIs**.
2. Kliknij **Cloud Firestore**.
3. Kliknij **Enforce** (*Wymuś*) i potwierdź.

Od tej chwili baza odrzuca zapytania spoza Twojej aplikacji.

> **Gdyby coś przestało działać** — wróć w to samo miejsce i kliknij **Unenforce**
> (*Wyłącz wymuszanie*). Zmiana działa od razu i jest w pełni odwracalna. Nie musisz nic
> poprawiać w kodzie. **Zapamiętaj tę ścieżkę — to jest hamulec bezpieczeństwa całej operacji.**

---

## Na co uważać

**Limit darmowego planu: 10 000 sprawdzeń miesięcznie.** Po jego przekroczeniu Google zwraca błąd
i — przy **włączonym** wymuszaniu — aplikacja przestaje działać do końca miesiąca (albo do
kliknięcia *Unenforce*). Ile realnie zużywa aplikacja, zależy wprost od TTL, bo biblioteka
odświeża token **mniej więcej w połowie** tego czasu:

| TTL | Odświeżanie tokenu | Szacunek przy 30 graczach i ~2 h korzystania dziennie |
|---|---|---|
| 1 godzina (domyślnie) | co ~30 min korzystania | ~3 500–4 000 sprawdzeń / miesiąc |
| **1 dzień (zalecane)** | co ~12 godzin | **~1 000–1 500 sprawdzeń / miesiąc** |

Obie wartości mieszczą się w limicie, ale 1 dzień daje znacznie większy zapas — i mniej
zapytań sieciowych po stronie graczy. Dlatego warto ustawić `1` + `days`.

**Aplikacja musi być otwierana z adresu internetowego.** Po włączeniu wymuszania otwarcie pliku
`Main/index.html` bezpośrednio z dysku przestanie działać — reCAPTCHA nie rozpozna takiego „adresu”.
Jeśli tak testujesz, przeczytaj sekcję o pracy lokalnej niżej.

**Oba moduły są objęte.** Main i Tournament of Poker korzystają z jednego projektu Firebase, więc
wymuszanie dotyczy obu naraz. Kod jest przygotowany w obu — nie musisz nic dokładać.

**Jeśli kiedyś zmienisz adres strony** (własna domena zamiast `github.io`), trzeba dopisać nową
domenę do klucza w Google Cloud (krok 1), inaczej aplikacja przestanie działać pod nowym adresem.

**Klucz witryny w publicznym repozytorium to nie jest wyciek.** Tak samo jak `apiKey` — jest jawny
z założenia i musi być w kodzie strony. Właśnie dlatego wariant Enterprise jest wygodniejszy:
nie ma w nim żadnego klucza tajnego, o który trzeba by się martwić.

---

## Jak zmienić TTL już po rejestracji

Zmiana jest odwracalna, nie wymaga żadnej zmiany w kodzie i nic nie psuje.

1. Firebase Console → projekt **karty-turniej** → **App Check** → zakładka **Apps**.
2. Kliknij wiersz **pierwszej** aplikacji `Karty-Web` — rozwinie się ten sam panel,
   który widziałeś przy rejestracji.
3. Przy pozycji **reCAPTCHA Enterprise** kliknij ikonę **ołówka** ✏️ (edycja).
4. W polu **Token time to live (TTL)**:
   - w polu z liczbą zostaw **`1`**,
   - z listy obok zmień **`hours`** na **`days`**.
5. Kliknij **Save**.
6. **Powtórz punkty 2–5 dla drugiej aplikacji `Karty-Web`** — tak samo jak przy rejestracji,
   obie muszą mieć to samo ustawienie.

**Na co uważać:**
- Gdyby po kliknięciu ołówka pole na klucz okazało się puste, wklej ten sam klucz witryny
  co poprzednio (`6Ld6x68t...`). Klucz jest w `config/firebase-config.js`, więc zawsze go odzyskasz.
- Dopuszczalny zakres to **30 minut – 7 dni**. Wpisanie wartości spoza zakresu konsola odrzuci.
- Zmiana działa od razu, ale **tokeny już wydane zachowują starą ważność** — pełne przejście
  na nowe ustawienie zajmuje tyle, ile wynosił poprzedni TTL (czyli maksymalnie godzinę).
- **W kodzie aplikacji nic nie zmieniasz.** TTL jest ustawieniem po stronie Firebase.

---

## Praca lokalna (opcjonalnie — tylko jeśli testujesz z dysku)

Jeśli po włączeniu wymuszania chcesz nadal otwierać aplikację z dysku:

1. W `config/firebase-config.js` dopisz tymczasowo:
   ```js
   , appCheckDebugToken: true
   ```
2. Otwórz aplikację lokalnie i naciśnij **F12** → zakładka **Console**.
3. Znajdź komunikat z długim tokenem (ciąg cyfr i liter z myślnikami). Skopiuj go.
4. Firebase Console → **App Check** → **Apps** → przy swojej aplikacji kliknij **⋮** (trzy kropki)
   → **Manage debug tokens** (*Zarządzaj tokenami debugowania*) → **Add debug token**, wklej token
   i nadaj mu nazwę.
5. W pliku konfiguracyjnym zamień `true` na ten sam token w cudzysłowie:
   ```js
   , appCheckDebugToken: "wklejony-token"
   ```

**Tego tokenu nie wrzucaj do repozytorium** — działa jak przepustka omijająca App Check. Jeśli i tak
trzymasz tam konfigurację, lepiej zostaw pracę lokalną bez tokenu i testuj wyłącznie na adresie
internetowym.

---

## Podsumowanie w trzech zdaniach

Zakładasz klucz **reCAPTCHA Enterprise** w Google Cloud dla domeny `cutelittlegoat.github.io`
i dostajesz **jeden** klucz witryny. Wklejasz go w Firebase Console → App Check przy **obu**
aplikacjach `Karty-Web`, a potem ten sam klucz do pliku `config/firebase-config.js` jako
`appCheckEnterpriseSiteKey`. Obserwujesz przez kilka dni zakładkę APIs, a gdy ruch jest
zweryfikowany — klikasz **Enforce**.

---

## Załącznik A — stara droga przez klasyczną reCAPTCHA v3 (tylko dla porządku)

**Nie korzystaj z niej, dopóki działa droga z KROKU 1–2.** Zostawiam ją, bo Google formalnie jej
jeszcze nie wyłączyło i dokumentacja Firebase nadal ją opisuje — gdyby więc Enterprise z jakiegoś
powodu zawiódł, jest do czego wrócić.

1. Wejdź na **https://www.google.com/recaptcha/admin/create** i zaloguj się kontem Google.
2. Wypełnij: **Etykieta** = `Karty`, **Typ** = **reCAPTCHA v3**,
   **Domeny** = `cutelittlegoat.github.io`.
3. Dostaniesz **dwa** klucze: *Site key* (witryny) i *Secret key* (tajny). **Nie pomyl ich.**
4. Firebase Console → **App Check** → **Apps** → **Register** → `+` przy **reCAPTCHA**
   (dolna pozycja, bez słowa „Enterprise”) → wklej **klucz tajny**.
   - To jedyne miejsce, gdzie używa się klucza tajnego. **Nigdy nie trafia on do repozytorium.**
   - Jeśli to pole jest nieaktywne — właśnie dlatego powstała nowa wersja tej instrukcji.
5. W `config/firebase-config.js` odkomentuj **`appCheckSiteKey`** (a nie `appCheckEnterpriseSiteKey`)
   i wklej **klucz witryny**.

Kod aplikacji obsługuje ten wariant bez żadnych zmian — rozpoznaje go po tym, która linia
w konfiguracji jest odkomentowana.

---

## Źródła (dokumentacja Google, stan na 2026-09-08)

- [Get started using App Check with reCAPTCHA Enterprise in web apps](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)
  — kroki dla Enterprise, fragment o planie Spark i czterech poziomach ryzyka.
- [Create score-based reCAPTCHA keys](https://firebase.google.com/docs/app-check/recaptcha-keys)
  — tworzenie klucza, typ „Web”, domeny, zakaz dodawania `localhost`.
- [Get started using App Check with reCAPTCHA v3 in web apps](https://firebase.google.com/docs/app-check/web/recaptcha-provider)
  — zalecenie: *„You should use reCAPTCHA Enterprise for new integrations”*.
- [reCAPTCHA billing information](https://docs.cloud.google.com/recaptcha/docs/billing-information)
  — *„you don't need to enable billing”*, tryb Essentials, 10 000 sprawdzeń miesięcznie za darmo.
