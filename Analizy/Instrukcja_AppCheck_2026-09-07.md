# App Check — instrukcja krok po kroku

## Prompt użytkownika (zachowany dla kontekstu)

> App Check - musisz mi dokładnie i prosto napisać jak to zrobić. Co i gdzie klikać.

---

## Zanim zaczniesz — co to w ogóle jest

App Check sprawdza, czy zapytanie do bazy przychodzi **z Twojej aplikacji**, a nie z jakiegoś obcego programu. Nie sprawdza, kim jest użytkownik — od tego są PIN-y.

Cała robota to trzy rzeczy:
1. **Google reCAPTCHA** — zakładasz tam wpis dla swojej strony i dostajesz dwa klucze.
2. **Firebase Console** — wklejasz tam jeden z tych kluczy.
3. **Plik konfiguracyjny aplikacji** — wklejasz drugi klucz.

Kod aplikacji jest już gotowy. Sam się włączy w momencie, w którym dopiszesz klucz do konfiguracji. Dopóki go nie dopiszesz, nic się nie dzieje.

> **Najważniejsza zasada bezpieczeństwa całej instrukcji.**
> Dostaniesz **dwa** klucze: `Site key` (klucz witryny) i `Secret key` (klucz tajny).
> - `Site key` → wklejasz do pliku aplikacji. Jest jawny i tak ma być.
> - `Secret key` → wklejasz **tylko** w Firebase Console. **Nigdy nie wkleja się go do plików aplikacji ani do repozytorium.**
> Jeśli je pomylisz, zatrzymaj się i zacznij od nowa.

---

## KROK 1 — Załóż wpis w Google reCAPTCHA

1. Wejdź na **https://www.google.com/recaptcha/admin/create**
2. Zaloguj się tym samym kontem Google, na którym masz Firebase.
3. Wypełnij formularz:
   - **Etykieta** (Label): wpisz cokolwiek rozpoznawalnego, np. `Karty`
   - **Typ reCAPTCHA**: wybierz **reCAPTCHA v3**
     *(uwaga: musi być v3 — nie v2, nie „Enterprise”)*
   - **Domeny** (Domains): kliknij `+` i dodaj dokładnie:
     ```
     cutelittlegoat.github.io
     ```
     Wpisujesz **samą domenę** — bez `https://`, bez `/Karty`, bez ukośnika na końcu.
     Jeśli chcesz też testować z komputera lokalnie, dodaj drugą pozycję: `localhost`
   - Zaakceptuj warunki i kliknij **Prześlij** (Submit).
4. Zobaczysz stronę z dwoma kluczami:
   - **Klucz witryny** (Site key) — długi ciąg zaczynający się od `6L...`
   - **Klucz tajny** (Secret key) — też zaczyna się od `6L...`

   **Skopiuj oba do notatnika i zapisz, który jest który.** Wyglądają podobnie i łatwo je pomylić.

---

## KROK 2 — Włącz App Check w Firebase Console

1. Wejdź na **https://console.firebase.google.com** i wybierz projekt **karty-turniej**.
2. W lewym menu znajdź **App Check**.
   - Jest w sekcji **Build** (po polsku: *Kompilacja*), obok pozycji „Firestore Database”.
   - Jeśli nie możesz go znaleźć, użyj **lupki / wyszukiwarki** na górze konsoli i wpisz `App Check`.
3. Wejdź w zakładkę **Apps** (*Aplikacje*).
4. Na liście zobaczysz swoje aplikacje. W tym projekcie są trzy wpisy:
   - `Karty-Android-PUSH` — pozostałość po próbie powiadomień Push,
   - `Karty-Web` — aplikacja webowa,
   - `Karty-Web` — **druga** aplikacja webowa o tej samej nazwie.
5. Kliknij **Register** przy **pierwszej** aplikacji `Karty-Web`.
6. Kliknij **reCAPTCHA v3**.
7. W polu, które się pojawi, wklej **Klucz tajny** (Secret key) z kroku 1.
   - **To jest jedyne miejsce, gdzie używasz klucza tajnego.**
8. Pole **TTL** (czas ważności) zostaw bez zmian — domyślna 1 godzina jest w porządku.
9. Kliknij **Zapisz** (Save).
10. **Powtórz podpunkty 5–9 dla drugiej aplikacji `Karty-Web`**, wklejając **ten sam** klucz tajny.

> **Dlaczego obie.** Aplikacja korzysta tylko z jednej z nich — tej o identyfikatorze
> kończącym się na `...27d29434f013a5cf31888d` (widać go w *Project settings* → *General* → *Your apps*).
> Gdybyś zarejestrował tę drugą, wszystko wyglądałoby poprawnie aż do kliknięcia **Enforce**,
> po którym aplikacja przestałaby działać. Zarejestrowanie obu tym samym kluczem
> całkowicie usuwa to ryzyko i nic nie kosztuje.

> **Aplikacji `Karty-Android-PUSH` nie ruszaj i niczego nie kasuj.** Nieużywany wpis nikomu
> nie przeszkadza i nie wpływa na App Check. Usuwanie aplikacji w Firebase jest operacją
> bez cofnięcia, a przy dwóch bliźniaczych wpisach `Karty-Web` łatwo skasować tę właściwą —
> co wyłączyłoby całą aplikację, nie tylko App Check. Porządki najwyżej po wdrożeniu.

Po zapisaniu przy obu aplikacjach pojawi się status. **Nie klikaj jeszcze niczego o nazwie „Enforce” / „Wymuś”** — do tego wracamy w kroku 5.

---

## KROK 3 — Wklej klucz witryny do aplikacji

1. Otwórz plik **`config/firebase-config.js`**.
2. Znajdź na jego końcu zakomentowane linie z `appCheckSiteKey`.
3. Zmień je tak, żeby wyglądały jak poniżej — czyli **usuń dwa ukośniki** z linii z kluczem i wklej swój **Klucz witryny** (Site key):

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
  , appCheckSiteKey: "6L...tutaj_twój_klucz_witryny..."
};
```

**Zwróć uwagę na przecinek** na początku linii `, appCheckSiteKey` — musi tam być, inaczej aplikacja się nie uruchomi.

4. Zapisz plik i wgraj zmianę na GitHub (commit + push), tak jak zwykle.
5. Poczekaj chwilę, aż GitHub Pages opublikuje nową wersję (zwykle do minuty).

---

## KROK 4 — Sprawdź, czy działa

1. Otwórz aplikację **z adresu internetowego**: `https://cutelittlegoat.github.io/Karty/Main/index.html`
   *(nie z pliku na dysku — o tym niżej)*
2. Korzystaj z niej normalnie przez chwilę: wejdź w kilka zakładek, otwórz statystyki.
3. Wróć do Firebase Console → **App Check** → zakładka **APIs** (*Interfejsy API*).
4. Kliknij **Cloud Firestore**.
5. Zobaczysz wykres z podziałem zapytań. Interesuje Cię, żeby rosła liczba **zweryfikowanych** (Verified), a nie „niezweryfikowanych” (Unverified).

**Nie spiesz się z następnym krokiem.** Daj to sobie działać przez kilka dni normalnego użytkowania, żeby wszyscy gracze zdążyli wejść na nową wersję.

---

## KROK 5 — Dopiero teraz włącz wymuszanie

To jest krok, który faktycznie blokuje obce programy. **Wykonaj go dopiero wtedy**, gdy w kroku 4 widzisz, że praktycznie cały ruch jest zweryfikowany.

1. Firebase Console → **App Check** → zakładka **APIs**.
2. Kliknij **Cloud Firestore**.
3. Kliknij **Enforce** (*Wymuś*) i potwierdź.

Od tej chwili baza odrzuca zapytania spoza Twojej aplikacji.

> **Gdyby coś przestało działać** — wróć w to samo miejsce i kliknij **Unenforce** (*Wyłącz wymuszanie*). Zmiana działa od razu i jest w pełni odwracalna. Nie musisz nic poprawiać w kodzie.

---

## Na co uważać

**Aplikacja musi być otwierana z adresu internetowego.** Po włączeniu wymuszania otwarcie pliku `Main/index.html` bezpośrednio z dysku przestanie działać — reCAPTCHA nie rozpozna takiego „adresu”. Jeśli tak testujesz, przeczytaj sekcję o pracy lokalnej niżej.

**Oba moduły są objęte.** Main i Tournament of Poker korzystają z jednego projektu Firebase, więc wymuszanie dotyczy obu naraz. Kod jest przygotowany w obu — nie musisz nic dokładać.

**Jeśli kiedyś zmienisz adres strony** (własna domena zamiast `github.io`), trzeba dopisać nową domenę w Google reCAPTCHA (krok 1), inaczej aplikacja przestanie działać pod nowym adresem.

**Klucz witryny w publicznym repozytorium to nie jest wyciek.** Tak samo jak `apiKey` — jest jawny z założenia i musi być w kodzie strony. Zagrożeniem byłby wyłącznie klucz **tajny**, którego w repozytorium nie ma i nie może być.

---

## Praca lokalna (opcjonalnie — tylko jeśli testujesz z dysku)

Jeśli po włączeniu wymuszania chcesz nadal otwierać aplikację z dysku:

1. W `config/firebase-config.js` dopisz tymczasowo:
   ```js
   , appCheckDebugToken: true
   ```
2. Otwórz aplikację lokalnie i naciśnij **F12** → zakładka **Console**.
3. Znajdź komunikat z długim tokenem (ciąg cyfr i liter z myślnikami). Skopiuj go.
4. Firebase Console → **App Check** → **Apps** → przy swojej aplikacji kliknij **⋮** (trzy kropki) → **Manage debug tokens** (*Zarządzaj tokenami debugowania*) → **Add debug token**, wklej token i nadaj mu nazwę.
5. W pliku konfiguracyjnym zamień `true` na ten sam token w cudzysłowie:
   ```js
   , appCheckDebugToken: "wklejony-token"
   ```

**Tego tokenu nie wrzucaj do repozytorium** — działa jak przepustka omijająca App Check. Jeśli i tak trzymasz tam konfigurację, lepiej zostaw pracę lokalną bez tokenu i testuj wyłącznie na adresie internetowym.

---

## Podsumowanie w trzech zdaniach

Zakładasz wpis w Google reCAPTCHA v3 dla domeny `cutelittlegoat.github.io` i dostajesz dwa klucze. Klucz **tajny** wklejasz w Firebase Console → App Check, a klucz **witryny** do pliku `config/firebase-config.js`. Obserwujesz przez kilka dni zakładkę APIs, a gdy ruch jest zweryfikowany — klikasz **Enforce**.
