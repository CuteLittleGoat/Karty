# Analiza błędu TOP-NO-PANELS w widoku użytkownika Tournament of Poker

## 1. Kontekst problemu

Badany problem dotyczy repozytorium:

```text
CuteLittleGoat/Karty
```

oraz aplikacji:

```text
Second/index.html
Second/app.js
```

Problem występuje w widoku użytkownika:

```text
https://cutelittlegoat.github.io/Karty/Second/index.html
```

Po wpisaniu poprawnego PIN-u użytkownik widzi komunikat:

```text
Brak dostępnych paneli Tournament of Poker dla tego PIN-u (kod: TOP-NO-PANELS).
PIN został przyjęty, ale lista dozwolonych sekcji jest pusta.
Rozwiązanie: w panelu admina otwórz „Lista graczy”, przypisz uprawnienia turniejowe temu PIN-owi i zapisz turniej.
```

Na początku zakładaliśmy, że problem może wynikać z braku uprawnień przypisanych do PIN-u. Testy pokazały jednak, że to nie jest prawdziwa przyczyna.

---

## 2. Przeprowadzone testy

### Test 1 — sprawdzenie uprawnień w panelu administratora

Otwarty został panel administratora:

```text
https://cutelittlegoat.github.io/Karty/Second/index.html?admin=1
```

Następnie sprawdzono:

```text
TOURNAMENT OF POKER → Lista graczy
```

Sprawdzeni gracze:

```text
Test3 — PIN 55555
Test4 — PIN 66666
```

Wynik widoczny na screenie:

```text
PIN 55555 ma uprawnienia:
- Czat
- Losowanie stołów
- Wpłaty

PIN 66666 ma uprawnienia:
- Losowanie stołów
- Wpłaty
- Podział Puli
- Faza Grupowa
```

### Wniosek z testu 1

Problem nie polega na tym, że gracz nie ma przypisanych uprawnień.

Uprawnienia są widoczne w panelu admina i wyglądają poprawnie.

---

### Test 2 — sprawdzenie widoku użytkownika w czystej sesji

Otwarty został widok użytkownika:

```text
https://cutelittlegoat.github.io/Karty/Second/index.html
```

Testowany PIN:

```text
55555
```

Po wpisaniu PIN-u widok użytkownika pokazał po lewej stronie dozwolone przyciski:

```text
Losowanie stołów
Wpłaty
Czat
```

To oznacza, że aplikacja rozpoznała PIN i wie, jakie panele powinien widzieć użytkownik.

Jednocześnie główny panel nadal pokazywał komunikat:

```text
TOP-NO-PANELS
```

### Wniosek z testu 2

To bardzo ważny wynik.

Skoro przyciski po lewej stronie są widoczne, to znaczy, że:

```text
PIN został przyjęty.
Uprawnienia zostały odczytane.
Lista dozwolonych sekcji NIE jest pusta.
```

Komunikat `TOP-NO-PANELS` jest więc w tym momencie mylący. Nie opisuje prawdziwej przyczyny problemu.

---

### Test 3 — sprawdzenie logów diagnostycznych w konsoli

W konsoli przeglądarki użyto filtra:

```text
[Second][UserTournament]
```

Po kliknięciu sekcji `Losowanie stołów` i `Wpłaty` w logach było widać m.in.:

```text
allowedTargets: ['draw', 'payments', 'chatTab']
reasonCode: "TOP-OK"
sessionReady: true
requestedSection: "payments"
previousSection: "draw"
```

albo analogicznie dla sekcji:

```text
requestedSection: "draw"
```

### Wniosek z testu 3

Kod diagnostyczny sam potwierdza, że aplikacja uważa dostęp za poprawny:

```text
reasonCode: "TOP-OK"
```

oraz że lista dozwolonych paneli nie jest pusta:

```text
allowedTargets: ['draw', 'payments', 'chatTab']
```

To wyklucza pierwotną hipotezę, że problem wynika z braku uprawnień w danych gracza.

---

### Test 4 — sprawdzenie czerwonych błędów w konsoli

W konsoli pojawił się błąd:

```text
Uncaught ReferenceError: readonlyTournamentState is not defined
```

Wskazywane miejsca:

```text
app.js?v=2026-04-19-2:3320
app.js?v=2026-04-19-2:3008
```

Widać też było, że aplikacja próbuje renderować sekcję użytkownika, ale renderowanie przerywa błąd JavaScript.

### Wniosek z testu 4

Prawdziwy problem nie jest w Firebase, PIN-ie ani uprawnieniach.

Prawdziwy problem jest w kodzie `Second/app.js`, w funkcji renderującej Tournament of Poker w widoku użytkownika.

---

## 3. Co zostało sprawdzone w kodzie

Sprawdzony został załączony plik:

```text
app.js?v=2026-04-19-2
```

czyli skrypt ładowany przez stronę użytkownika.

W kodzie znaleziono kilka istotnych miejsc.

---

## 4. Istotne miejsca w pliku `Second/app.js`

### 4.1. Funkcja widoku użytkownika

Funkcja widoku użytkownika zaczyna się około linii:

```text
2444
```

Kod:

```js
const setupUserView = (root) => {
```

To wewnątrz tej funkcji działa widok użytkownika, PIN, sidebar Tournament of Poker i renderowanie sekcji gracza.

---

### 4.2. Funkcja odczytująca dozwolone sekcje

Około linii:

```text
2652–2660
```

znajduje się funkcja:

```js
const getUserTournamentAllowedTargets = () => {
  if (!userTournamentSession.isVerified) {
    return [];
  }
  return [
    ...userTournamentSession.allowedSections,
    ...(userTournamentSession.chatAllowed ? ["chatTab"] : [])
  ];
};
```

Z logów wynika, że ta funkcja działa poprawnie, ponieważ zwraca:

```js
['draw', 'payments', 'chatTab']
```

### Wniosek

Tego miejsca nie trzeba poprawiać jako pierwszej przyczyny błędu.

---

### 4.3. Miejsce wyświetlające komunikat TOP-NO-PANELS

Około linii:

```text
2847–2853
```

znajduje się warunek:

```js
if (!allowedTargets.length) {
  syncTournamentMountVisibility("players");
  dataMount.innerHTML = '<p class="builder-info">Brak dostępnych paneli Tournament of Poker dla tego PIN-u ...</p>';
  if (chatMount !== dataMount) {
    chatMount.innerHTML = "";
  }
  return;
}
```

Ten warunek powinien uruchamiać się tylko wtedy, gdy:

```text
allowedTargets.length === 0
```

Ale w logach mamy:

```text
allowedTargets: ['draw', 'payments', 'chatTab']
```

### Wniosek

Komunikat `TOP-NO-PANELS` zostaje na ekranie nie dlatego, że lista uprawnień jest naprawdę pusta, tylko dlatego, że późniejsze renderowanie właściwej sekcji wywala się błędem JavaScript i nie nadpisuje starej zawartości panelu.

---

### 4.4. Odczyt readonlyTournamentState

Około linii:

```text
2868–2873
```

znajduje się kod:

```js
const readonlyTournamentStateRaw = userTournamentState.readonlyTables?.rTournamentState;
if (!readonlyTournamentStateRaw || typeof readonlyTournamentStateRaw !== "object") {
  dataMount.innerHTML = '<p class="builder-info">Brak danych turniejowych readonly...</p>';
  return;
}
const readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
```

Problem polega na tym, że:

```js
const readonlyTournamentState
```

jest zadeklarowane wewnątrz bloku `try`.

Później kod w bloku `catch` próbuje użyć tej zmiennej poza zakresem, np. około linii:

```text
3320–3321
```

Kod powodujący błąd:

```js
poolModsCount: Array.isArray(readonlyTournamentState.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
semiCustomTablesCount: Array.isArray(readonlyTournamentState.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
```

### Wniosek

To bezpośrednio powoduje błąd:

```text
ReferenceError: readonlyTournamentState is not defined
```

W JavaScript `const` zadeklarowany wewnątrz bloku `try` nie jest widoczny w zewnętrznym `catch`.

---

### 4.5. Brak funkcji `esc` w widoku użytkownika

W pliku istnieje funkcja:

```js
const esc = (v) => String(v ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
```

ale jest ona zadeklarowana lokalnie wewnątrz funkcji administratora, około linii:

```text
1345
```

Kod znajduje się w obrębie:

```js
const setupAdminTournament = (rootCard) => {
  ...
  const esc = (v) => ...
}
```

To oznacza, że `esc` działa w panelu admina, ale nie jest widoczne w funkcji:

```js
setupUserView
```

Tymczasem `setupUserView` używa `esc(...)` w kilku miejscach, m.in. około linii:

```text
2913
3012
3184
3214
3216
3227
3327
```

### Wniosek

Widok użytkownika używa funkcji `esc`, której nie ma w swoim zakresie.

To może powodować pierwotny błąd renderowania sekcji. Następnie błąd ten jest maskowany przez drugi błąd, czyli:

```text
readonlyTournamentState is not defined
```

---

## 5. Główna diagnoza

Problem składa się z dwóch błędów w kodzie.

### Błąd 1 — brak `esc` w `setupUserView`

Widok użytkownika używa funkcji:

```js
esc(...)
```

ale ta funkcja jest zdefiniowana tylko lokalnie w kodzie administratora.

Efekt:

```text
Renderowanie paneli użytkownika może wywalić się błędem ReferenceError.
```

---

### Błąd 2 — `readonlyTournamentState` jest poza zakresem w `catch`

Zmienna:

```js
readonlyTournamentState
```

jest zadeklarowana jako `const` wewnątrz bloku `try`.

Później globalny `catch` funkcji renderującej próbuje jej użyć w diagnostyce błędu.

Efekt:

```text
Pierwotny błąd zostaje zamaskowany błędem:
readonlyTournamentState is not defined
```

---

## 6. Dlaczego komunikat TOP-NO-PANELS jest mylący

Komunikat:

```text
Brak dostępnych paneli Tournament of Poker dla tego PIN-u
```

sugeruje problem z uprawnieniami gracza.

Testy pokazały jednak, że:

```text
allowedTargets: ['draw', 'payments', 'chatTab']
reasonCode: "TOP-OK"
sessionReady: true
```

Czyli aplikacja wie, że PIN ma dostęp do paneli.

Najbardziej prawdopodobny przebieg jest taki:

```text
1. PIN zostaje przyjęty.
2. Uprawnienia zostają poprawnie odczytane.
3. Sidebar pokazuje przyciski: Losowanie stołów, Wpłaty, Czat.
4. Aplikacja próbuje wyrenderować zawartość wybranej sekcji.
5. Renderowanie wywala się błędem JavaScript.
6. Stary komunikat TOP-NO-PANELS zostaje w głównym panelu, bo nowa zawartość nie zdążyła się poprawnie wyrenderować.
```

---

## 7. Co należy poprawić

## Plik do poprawy

```text
Second/app.js
```

---

## Poprawka 1 — dodać `esc` do `setupUserView`

### Lokalizacja

Plik:

```text
Second/app.js
```

Okolice linii:

```text
2444–2457
```

Obecnie:

```js
const setupUserView = (root) => {
  const tabButtons = Array.from(root.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(root.querySelectorAll(".tab-panel"));
  const setActiveUserTab = (target) => {
    ...
  };

  setupTournamentButtons(root);

  const firebaseApp = getFirebaseApp();
```

### Co dodać

Bezpośrednio po:

```js
setupTournamentButtons(root);
```

dodać:

```js
  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
```

### Po poprawce

Kod powinien wyglądać tak:

```js
const setupUserView = (root) => {
  const tabButtons = Array.from(root.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(root.querySelectorAll(".tab-panel"));
  const setActiveUserTab = (target) => {
    if (!target) {
      return;
    }
    tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.target === target));
    tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.id === target));
  };

  setupTournamentButtons(root);

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const firebaseApp = getFirebaseApp();
```

### Dlaczego to naprawia część problemu

Funkcja `setupUserView` będzie miała własny dostęp do `esc`.

Dzięki temu fragmenty widoku użytkownika używające:

```js
esc(...)
```

nie będą już powodowały błędu `ReferenceError`.

---

## Poprawka 2 — wynieść `readonlyTournamentState` poza blok `try`

### Lokalizacja

Plik:

```text
Second/app.js
```

Okolice linii:

```text
2855–2873
```

Obecnie:

```js
    try {
      if (userTournamentSection === "chatTab") {
        syncTournamentMountVisibility("chatTab");
        renderUserChatSection();
        bindUserChatControls();
        tryAutoAuthorizeChatFromUserPin();
        updateSecondChatVisibility();
        return;
      }

      syncTournamentMountVisibility(userTournamentSection);

      const readonlyTournamentStateRaw = userTournamentState.readonlyTables?.rTournamentState;
      if (!readonlyTournamentStateRaw || typeof readonlyTournamentStateRaw !== "object") {
        dataMount.innerHTML = '<p class="builder-info">Brak danych turniejowych readonly...</p>';
        return;
      }
      const readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
```

### Co zmienić

Przed blokiem `try` dodać:

```js
    let readonlyTournamentState = null;
```

Następnie zmienić:

```js
      const readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
```

na:

```js
      readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
```

### Po poprawce

Kod powinien wyglądać tak:

```js
    let readonlyTournamentState = null;

    try {
      if (userTournamentSection === "chatTab") {
        syncTournamentMountVisibility("chatTab");
        renderUserChatSection();
        bindUserChatControls();
        tryAutoAuthorizeChatFromUserPin();
        updateSecondChatVisibility();
        return;
      }

      syncTournamentMountVisibility(userTournamentSection);

      const readonlyTournamentStateRaw = userTournamentState.readonlyTables?.rTournamentState;
      if (!readonlyTournamentStateRaw || typeof readonlyTournamentStateRaw !== "object") {
        dataMount.innerHTML = '<p class="builder-info">Brak danych turniejowych readonly...</p>';
        return;
      }

      readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
```

### Dlaczego to naprawia część problemu

Dzięki temu `readonlyTournamentState` będzie widoczny także w zewnętrznym `catch`, który znajduje się niżej w tej samej funkcji.

---

## Poprawka 3 — zabezpieczyć diagnostykę błędów przed `null`

### Lokalizacja 1

Plik:

```text
Second/app.js
```

Okolice linii:

```text
2997–3013
```

Dotyczy funkcji:

```js
const renderSectionError = (stage, error) => {
```

Obecne problematyczne linie:

```js
poolModsCount: Array.isArray(readonlyTournamentState.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
semiCustomTablesCount: Array.isArray(readonlyTournamentState.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
```

### Zamienić na:

```js
poolModsCount: Array.isArray(readonlyTournamentState?.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
semiCustomTablesCount: Array.isArray(readonlyTournamentState?.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
```

---

### Lokalizacja 2

Plik:

```text
Second/app.js
```

Okolice linii:

```text
3312–3327
```

Dotyczy globalnego `catch` w renderowaniu Tournament of Poker użytkownika.

Obecne problematyczne linie:

```js
poolModsCount: Array.isArray(readonlyTournamentState.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
semiCustomTablesCount: Array.isArray(readonlyTournamentState.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
```

### Zamienić na:

```js
poolModsCount: Array.isArray(readonlyTournamentState?.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
semiCustomTablesCount: Array.isArray(readonlyTournamentState?.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
```

### Dlaczego to jest potrzebne

Samo wyniesienie zmiennej poza `try` nie wystarcza w 100%.

Jeżeli błąd wystąpi wcześniej, zanim `readonlyTournamentState` zostanie ustawione, zmienna będzie miała wartość:

```js
null
```

Wtedy kod:

```js
readonlyTournamentState.pool
```

również spowodowałby błąd.

Dlatego trzeba użyć bezpiecznego dostępu:

```js
readonlyTournamentState?.pool?.mods
```

---

## Poprawka 4 — odświeżyć wersję skryptu w `index.html`

### Plik

```text
Second/index.html
```

Na stronie ładowany jest skrypt z parametrem wersji:

```text
app.js?v=2026-04-19-2
```

Po zmianie `Second/app.js` warto zmienić parametr wersji, żeby przeglądarka i GitHub Pages nie użyły starej wersji z cache.

### Co zmienić

W `Second/index.html` znaleźć linię podobną do:

```html
<script src="app.js?v=2026-04-19-2"></script>
```

albo:

```html
<script src="./app.js?v=2026-04-19-2"></script>
```

i zmienić np. na:

```html
<script src="./app.js?v=2026-05-06-1"></script>
```

### Dlaczego to jest potrzebne

Bez zmiany parametru `v=...` przeglądarka może nadal ładować starą wersję `app.js`.

Wtedy poprawka będzie w repo, ale test w przeglądarce może nadal pokazywać stary błąd.

---

## 8. Czego nie trzeba poprawiać na podstawie tych testów

Na podstawie wykonanych testów nie ma obecnie dowodu, że trzeba poprawiać:

```text
- PIN-y graczy
- zapis uprawnień w panelu admina
- strukturę player.permissions
- Firebase jako takie
- odczyt allowedTargets
- warunek getUserTournamentAllowedTargets()
- widoczność przycisków w sidebarze
```

Te elementy zadziałały poprawnie w teście.

---

## 9. Oczekiwany efekt po poprawce

Po wdrożeniu zmian użytkownik z PIN-em:

```text
55555
```

powinien widzieć po wejściu do Tournament of Poker:

```text
- Losowanie stołów
- Wpłaty
- Czat
```

Po kliknięciu:

```text
Losowanie stołów
```

powinna wyrenderować się zawartość sekcji losowania stołów.

Po kliknięciu:

```text
Wpłaty
```

powinna wyrenderować się zawartość sekcji wpłat.

Po kliknięciu:

```text
Czat
```

czat powinien nadal działać tak jak w teście.

Komunikat:

```text
TOP-NO-PANELS
```

nie powinien pojawiać się dla PIN-u, który ma realne uprawnienia.

---

## 10. Plan testu po wdrożeniu poprawki

Po poprawieniu plików i opublikowaniu przez GitHub Pages należy wykonać test w czystej sesji.

### Test A — czyste wejście

Otworzyć okno prywatne / incognito.

Wejść na:

```text
https://cutelittlegoat.github.io/Karty/Second/index.html
```

Wpisać PIN:

```text
55555
```

Oczekiwany wynik:

```text
Sidebar pokazuje:
- Losowanie stołów
- Wpłaty
- Czat

Panel główny nie pokazuje TOP-NO-PANELS.
```

---

### Test B — kliknięcie Losowanie stołów

Kliknąć:

```text
Losowanie stołów
```

Oczekiwany wynik:

```text
Nie ma czerwonego błędu readonlyTournamentState is not defined.
Nie ma TOP-NO-PANELS.
Sekcja próbuje pokazać dane losowania stołów.
```

---

### Test C — kliknięcie Wpłaty

Kliknąć:

```text
Wpłaty
```

Oczekiwany wynik:

```text
Nie ma czerwonego błędu readonlyTournamentState is not defined.
Nie ma TOP-NO-PANELS.
Sekcja próbuje pokazać dane wpłat.
```

---

### Test D — kliknięcie Czat

Kliknąć:

```text
Czat
```

Oczekiwany wynik:

```text
Czat nadal działa.
```

---

### Test E — konsola

Otworzyć DevTools → Console.

W filtrze wpisać:

```text
[Second][UserTournament]
```

Oczekiwane logi:

```text
allowedTargets: ['draw', 'payments', 'chatTab']
reasonCode: "TOP-OK"
sessionReady: true
```

Nie powinno być błędu:

```text
readonlyTournamentState is not defined
```

Nie powinno być błędu:

```text
esc is not defined
```

---

## 11. Podsumowanie końcowe

Najważniejszy wniosek:

```text
Błąd TOP-NO-PANELS nie wynika z braku uprawnień PIN-u.
```

Testy pokazały, że:

```text
PIN 55555 ma uprawnienia.
Widok użytkownika odczytuje te uprawnienia.
allowedTargets zawiera: draw, payments, chatTab.
reasonCode ma wartość: TOP-OK.
```

Prawdziwy problem jest w kodzie renderowania widoku użytkownika w pliku:

```text
Second/app.js
```

Do poprawienia są przede wszystkim:

```text
1. Dodać funkcję esc w setupUserView — okolice linii 2444–2457.
2. Wynosić readonlyTournamentState poza blok try — okolice linii 2855–2873.
3. Zabezpieczyć diagnostykę błędów optional chainingiem — okolice linii 2997–3013 oraz 3312–3327.
4. Zmienić parametr wersji app.js w Second/index.html, żeby ominąć cache.
```

## Aktualizacja analizy po wdrożeniu `app.js?v=2026-05-06-1` — wykrycie kolejnych brakujących helperów w widoku użytkownika

### Data testu

```text
2026-05-06
```

### Zakres tej aktualizacji

Ta aktualizacja dotyczy testu wykonanego już po wdrożeniu wcześniejszej poprawki błędu `TOP-NO-PANELS`, czyli po załadowaniu nowej wersji skryptu:

```text
app.js?v=2026-05-06-1
```

Wcześniejsza poprawka obejmowała m.in.:

```text
- dodanie lokalnego helpera esc(v) w setupUserView(root),
- wyniesienie readonlyTournamentState poza blok try,
- dodanie optional chaining w diagnostyce błędów,
- zmianę cache-bustera w Second/index.html.
```

Celem obecnego testu było sprawdzenie, czy po tych zmianach widok użytkownika faktycznie przestał pokazywać fałszywy błąd `TOP-NO-PANELS` i czy sekcje użytkownika zaczęły się renderować.

---

## 1. Test w przeglądarce Edge — sprawdzenie, czy ładuje się nowa wersja skryptu

### Wykonane kroki

W Microsoft Edge otwarto stronę w świeżej sesji / InPrivate.

Następnie w DevTools otwarto zakładkę:

```text
Network
```

Włączono:

```text
Disable cache
```

Odświeżono stronę.

W liście zasobów sprawdzono ładowany plik:

```text
app.js
```

### Wynik

W zakładce `Network` widoczny był plik:

```text
app.js?v=2026-05-06-1
```

### Wniosek

Nowa wersja skryptu została poprawnie załadowana przez przeglądarkę.

To oznacza, że dalsze wyniki testu dotyczą już kodu po wdrożeniu poprawki, a nie starego pliku:

```text
app.js?v=2026-04-19-2
```

---

## 2. Test PIN-u użytkownika

### Wykonane kroki

W widoku użytkownika otwarto zakładkę:

```text
TOURNAMENT OF POKER
```

Następnie użyto testowego PIN-u:

```text
55555
```

Po poprawnym wpisaniu PIN-u widok użytkownika pokazał po lewej stronie sekcje:

```text
Losowanie stołów
Wpłaty
Czat
```

### Wniosek

PIN nadal działa poprawnie.

Uprawnienia nadal są poprawnie odczytywane.

Widok użytkownika nadal wie, że użytkownik ma dostęp do sekcji:

```text
draw
payments
chatTab
```

Problem nie dotyczy PIN-u ani przypisania uprawnień.

---

## 3. Wynik testu sekcji `Czat`

### Wykonane kroki

Kliknięto sekcję:

```text
Czat
```

### Wynik

Sekcja czatu wyrenderowała się poprawnie.

Widoczne były wiadomości czatu.

Nie pojawił się błąd `TOP-NO-PANELS`.

### Wniosek

Czat działa po wdrożeniu poprawki.

To potwierdza, że ogólny mechanizm sesji PIN, przełączania paneli i dostępu do Tournament of Poker działa.

---

## 4. Wynik testu sekcji `Losowanie stołów`

### Wykonane kroki

Kliknięto sekcję:

```text
Losowanie stołów
```

### Wynik

Zamiast starego błędu `TOP-NO-PANELS` pojawił się nowy, bardziej konkretny komunikat błędu renderowania:

```text
Nie udało się wyrenderować sekcji „draw” (etap: global).
Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: formatCellNumber is not defined
```

### Wniosek

To jest ważny postęp diagnostyczny.

Sekcja nie wpada już w mylący komunikat `TOP-NO-PANELS`.

Aplikacja dochodzi dalej — próbuje renderować właściwą sekcję `draw`, ale zatrzymuje się na kolejnym błędzie JavaScript:

```text
ReferenceError: formatCellNumber is not defined
```

Oznacza to, że funkcja:

```js
formatCellNumber
```

jest używana w renderowaniu widoku użytkownika, ale nie jest dostępna w zakresie, w którym działa kod `setupUserView(root)` / `renderUserTournament()`.

---

## 5. Wynik testu sekcji `Wpłaty`

### Wykonane kroki

Kliknięto sekcję:

```text
Wpłaty
```

### Wynik

Zamiast starego błędu `TOP-NO-PANELS` pojawił się nowy, konkretny komunikat błędu renderowania:

```text
Nie udało się wyrenderować sekcji „payments” (etap: payments).
Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: percentInputToDecimal is not defined
```

### Wniosek

Sekcja `Wpłaty` również nie wpada już w `TOP-NO-PANELS`.

Kod próbuje renderować sekcję `payments`, ale zatrzymuje się na braku funkcji:

```js
percentInputToDecimal
```

Oznacza to, że funkcja:

```js
percentInputToDecimal
```

jest używana w renderowaniu widoku użytkownika, ale nie jest dostępna w zakresie `setupUserView(root)` / `renderUserTournament()`.

---

## 6. Najważniejszy wniosek z obecnego testu

Poprzednia poprawka została wdrożona i działa częściowo poprawnie.

Potwierdzone pozytywne efekty:

```text
- Edge ładuje nowy plik app.js?v=2026-05-06-1.
- PIN 55555 działa.
- Uprawnienia użytkownika są odczytywane.
- Sidebar pokazuje właściwe sekcje.
- Czat działa.
- TOP-NO-PANELS nie jest już głównym błędem dla poprawnego PIN-u.
- Błąd readonlyTournamentState is not defined nie pojawia się jako główny problem.
- Błąd esc is not defined nie pojawia się jako główny problem.
```

Nowe wykryte problemy:

```text
- Sekcja draw zatrzymuje się na: ReferenceError: formatCellNumber is not defined.
- Sekcja payments zatrzymuje się na: ReferenceError: percentInputToDecimal is not defined.
```

Diagnoza:

```text
Widok użytkownika nadal używa helperów, które nie są dostępne w jego zakresie.
```

To jest ten sam typ problemu, który wcześniej dotyczył helpera:

```js
esc
```

Poprzednio `esc` był dostępny tylko w części administracyjnej. Teraz analogiczny problem występuje dla:

```js
formatCellNumber
percentInputToDecimal
```

---

## 7. Prawdopodobna przyczyna techniczna

W pliku:

```text
Second/app.js
```

część funkcji pomocniczych najpewniej została zdefiniowana lokalnie wewnątrz funkcji administracyjnych, np. w okolicy kodu obsługującego panel admina / Tournament of Poker admina.

Widok użytkownika, czyli funkcja:

```js
setupUserView(root)
```

oraz znajdujące się w niej funkcje renderujące Tournament of Poker, używają tych helperów, ale nie mają do nich dostępu.

W JavaScript funkcja zdefiniowana wewnątrz jednej funkcji nie jest widoczna w innej funkcji siostrzanej.

Przykład problemu logicznego:

```js
const setupAdminTournament = (...) => {
  const formatCellNumber = (...) => {
    ...
  };

  const percentInputToDecimal = (...) => {
    ...
  };
};

const setupUserView = (...) => {
  // Tutaj formatCellNumber i percentInputToDecimal NIE są dostępne,
  // jeśli zostały zdefiniowane tylko wewnątrz setupAdminTournament.
};
```

Dlatego przy renderowaniu widoku użytkownika pojawiają się błędy:

```text
ReferenceError: formatCellNumber is not defined
ReferenceError: percentInputToDecimal is not defined
```

---

## 8. Co należy poprawić

### Plik do poprawy

```text
Second/app.js
```

### Funkcje do sprawdzenia i poprawienia

Należy wyszukać w pliku `Second/app.js` wystąpienia:

```text
formatCellNumber
percentInputToDecimal
```

Należy sprawdzić:

```text
1. Gdzie te funkcje są zdefiniowane.
2. Czy są zdefiniowane lokalnie wewnątrz funkcji admina.
3. Gdzie są używane w kodzie widoku użytkownika.
```

Błędy z testu wskazują, że są używane w widoku użytkownika, ale nie są tam widoczne.

---

## 9. Zalecany sposób naprawy

Najbezpieczniejsze rozwiązanie:

```text
Przenieść istniejące implementacje helperów formatCellNumber i percentInputToDecimal do wspólnego zakresu modułu, czyli poza setupAdminTournament(...) i poza setupUserView(...).
```

Nie należy pisać nowych wersji tych funkcji „na oko”, jeśli istnieją już działające implementacje używane w panelu admina.

Należy przenieść istniejący kod bez zmiany logiki, żeby admin i user używali dokładnie tego samego formatowania.

---

## 10. Rekomendowana struktura poprawki

### Krok A — znaleźć obecne definicje

W pliku:

```text
Second/app.js
```

wyszukać:

```js
const formatCellNumber
```

oraz:

```js
const percentInputToDecimal
```

albo warianty:

```js
function formatCellNumber
function percentInputToDecimal
```

### Krok B — przenieść helpery do wspólnego zakresu

Przenieść definicje tych funkcji wyżej, do zakresu pliku.

Najlepiej umieścić je w okolicy innych globalnych/helperowych funkcji pomocniczych, np. przed dużymi funkcjami:

```js
setupAdminTournament(...)
setupUserView(...)
```

Schemat docelowy:

```js
const formatCellNumber = (...) => {
  // istniejąca implementacja przeniesiona bez zmiany logiki
};

const percentInputToDecimal = (...) => {
  // istniejąca implementacja przeniesiona bez zmiany logiki
};

const setupAdminTournament = (...) => {
  // admin może nadal używać formatCellNumber i percentInputToDecimal
};

const setupUserView = (...) => {
  // user też może używać formatCellNumber i percentInputToDecimal
};
```

### Krok C — usunąć albo zostawić? Uwaga na duplikaty

Po przeniesieniu helperów trzeba upewnić się, że nie ma dwóch lokalnych definicji o tej samej nazwie w różnych zakresach, jeśli mogłoby to wprowadzać niespójność.

Najlepiej:

```text
- zostawić jedną wspólną definicję w zakresie modułu,
- usunąć lokalną definicję z funkcji admina, jeżeli była tylko tam,
- upewnić się, że wszystkie wywołania używają tej wspólnej definicji.
```

Celem jest jedno źródło prawdy dla formatowania liczb i procentów.

---

## 11. Minimalna poprawka awaryjna

Jeżeli z jakiegoś powodu nie chcemy jeszcze refaktoryzować całego kodu, minimalna poprawka może polegać na dodaniu lokalnych helperów w `setupUserView(root)`, analogicznie jak wcześniej dodano `esc`.

To rozwiązanie jest mniej eleganckie, ale szybkie.

Wtedy w pliku:

```text
Second/app.js
```

wewnątrz:

```js
const setupUserView = (root) => {
```

w okolicy, gdzie dodano już:

```js
const esc = (v) => ...
```

można dodać także helpery potrzebne user-view.

UWAGA: implementacje powinny być skopiowane z istniejących, działających helperów admina, a nie pisane od nowa bez sprawdzenia.

Schemat:

```js
const setupUserView = (root) => {
  ...

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const formatCellNumber = (...) => {
    // skopiować istniejącą implementację z części admina
  };

  const percentInputToDecimal = (...) => {
    // skopiować istniejącą implementację z części admina
  };

  ...
};
```

To jednak może spowodować duplikację logiki.

Lepsze rozwiązanie długoterminowe to wspólne helpery w zakresie modułu.

---

## 12. Dlaczego lepiej przenieść helpery do zakresu modułu

Powód 1:

```text
Admin i user powinni formatować te same dane w ten sam sposób.
```

Powód 2:

```text
Mniejsza szansa, że po kolejnej zmianie admin będzie działał inaczej niż user.
```

Powód 3:

```text
Unikamy kolejnych ReferenceError typu „helper is not defined”.
```

Powód 4:

```text
To jest ten sam typ błędu, który już wystąpił dla esc, readonlyTournamentState, formatCellNumber i percentInputToDecimal.
```

Wniosek architektoniczny:

```text
Helpery używane przez oba widoki nie powinny być definiowane lokalnie tylko w jednym widoku.
```

---

## 13. Możliwe kolejne helpery do sprawdzenia

Po naprawieniu:

```js
formatCellNumber
percentInputToDecimal
```

mogą ujawnić się kolejne brakujące helpery, jeżeli user-view używa funkcji zdefiniowanych tylko w admin-view.

Dlatego przed wdrożeniem warto sprawdzić w `Second/app.js`, czy w kodzie `setupUserView(root)` / `renderUserTournament()` występują inne helpery, które nie są zdefiniowane w tym samym zakresie ani globalnie.

Do sprawdzenia przez wyszukiwanie w pliku:

```text
formatCellNumber
percentInputToDecimal
toNumber
toPercentText
formatCurrency
formatMoney
formatPercent
normalizeAmount
parseAmount
parsePercent
```

Nie oznacza to, że wszystkie te funkcje na pewno istnieją lub są błędne.

Chodzi o sprawdzenie, czy user-view nie używa kolejnych helperów, które są dostępne tylko w adminie.

---

## 14. Plik `Second/index.html` — podbicie wersji po naprawie

Po zmianie `Second/app.js` należy ponownie podbić cache-buster w:

```text
Second/index.html
```

Obecnie test potwierdził ładowanie:

```html
<script src="app.js?v=2026-05-06-1" type="module"></script>
```

Po kolejnej poprawce należy zmienić np. na:

```html
<script src="app.js?v=2026-05-06-2" type="module"></script>
```

albo inną nową wartość, np.:

```html
<script src="app.js?v=2026-05-06-helper-scope-1" type="module"></script>
```

Najważniejsze, żeby wartość po `?v=` była inna niż dotychczas.

Dzięki temu Edge / GitHub Pages / cache przeglądarki nie użyją starego pliku.

---

## 15. Test po kolejnej poprawce

Po wdrożeniu kolejnej poprawki należy wykonać test w Edge.

### Test 1 — sprawdzenie wersji pliku

Otworzyć DevTools:

```text
F12
```

Zakładka:

```text
Network
```

Włączyć:

```text
Disable cache
```

Odświeżyć stronę.

Sprawdzić, czy ładuje się nowy plik:

```text
app.js?v=2026-05-06-2
```

albo inna nowa wersja ustawiona w `Second/index.html`.

---

### Test 2 — PIN

Wejść do:

```text
TOURNAMENT OF POKER
```

Wpisać:

```text
55555
```

Oczekiwany wynik:

```text
Widoczne sekcje:
- Losowanie stołów
- Wpłaty
- Czat
```

Nie powinien pojawić się:

```text
TOP-NO-PANELS
```

---

### Test 3 — Losowanie stołów

Kliknąć:

```text
Losowanie stołów
```

Oczekiwany wynik:

```text
Sekcja renderuje się bez błędu:
ReferenceError: formatCellNumber is not defined
```

Nie powinno być komunikatu:

```text
Nie udało się wyrenderować sekcji „draw”...
```

Jeżeli sekcja nie ma danych, może pokazać komunikat o braku danych, ale nie powinna wywalać błędu JavaScript.

---

### Test 4 — Wpłaty

Kliknąć:

```text
Wpłaty
```

Oczekiwany wynik:

```text
Sekcja renderuje się bez błędu:
ReferenceError: percentInputToDecimal is not defined
```

Nie powinno być komunikatu:

```text
Nie udało się wyrenderować sekcji „payments”...
```

---

### Test 5 — Czat

Kliknąć:

```text
Czat
```

Oczekiwany wynik:

```text
Czat nadal działa.
```

---

### Test 6 — Console

W DevTools przejść do:

```text
Console
```

Sprawdzić, czy nie ma czerwonych błędów:

```text
formatCellNumber is not defined
percentInputToDecimal is not defined
readonlyTournamentState is not defined
esc is not defined
TOP-NO-PANELS
```

Dopuszczalne mogą być zewnętrzne ostrzeżenia przeglądarki, np. dotyczące obrazków, favicon albo tracking prevention, ale nie błędy związane z renderowaniem Tournament of Poker.

---

## 16. Podsumowanie aktualizacji

Po wdrożeniu poprawki `app.js?v=2026-05-06-1` stary problem został częściowo rozwiązany.

Najważniejsze:

```text
TOP-NO-PANELS nie jest już głównym błędem.
Nowa wersja app.js ładuje się poprawnie.
Czat działa.
PIN i uprawnienia działają.
```

Nowy wykryty problem:

```text
Renderowanie sekcji danych użytkownika nadal zatrzymuje się przez brak helperów w zakresie user-view.
```

Konkretnie:

```text
draw     → ReferenceError: formatCellNumber is not defined
payments → ReferenceError: percentInputToDecimal is not defined
```

Należy poprawić:

```text
Second/app.js
```

przez przeniesienie helperów:

```js
formatCellNumber
percentInputToDecimal
```

do wspólnego zakresu modułu albo dodanie ich lokalnie w `setupUserView(root)`.

Rekomendowane rozwiązanie:

```text
Jedna wspólna definicja helperów w zakresie modułu, używana przez admin-view i user-view.
```

Po poprawce należy zmienić wersję skryptu w:

```text
Second/index.html
```

np. z:

```text
app.js?v=2026-05-06-1
```

na:

```text
app.js?v=2026-05-06-2
```
## Aktualizacja testu po kolejnej poprawce helperów — `Losowanie stołów` działa, `Wpłaty` zatrzymują się na `toPercentText`

### Data testu

```text
2026-05-06
```

### Kontekst

Po wcześniejszym wykryciu błędów:

```text
ReferenceError: formatCellNumber is not defined
ReferenceError: percentInputToDecimal is not defined
```

wdrożono kolejną poprawkę zakresu helperów w `Second/app.js`.

Następnie wykonano ponowny test w Microsoft Edge.

---

## 1. Wynik testu sekcji `Losowanie stołów`

### Wykonane kroki

W widoku użytkownika otwarto:

```text
TOURNAMENT OF POKER
```

Następnie użyto PIN-u z uprawnieniami:

```text
55555
```

Po lewej stronie widoczne były sekcje:

```text
Losowanie stołów
Wpłaty
Czat
```

Kliknięto:

```text
Losowanie stołów
```

### Wynik

Sekcja `Losowanie stołów` wyrenderowała się poprawnie.

Widoczna była tabela z kolumnami:

```text
Gracz
Status wpłaty
Stół
```

Widoczne były rekordy graczy oraz przypisane stoły, np.:

```text
ss    — Do zapłaty — -
aaa   — Do zapłaty — Stół3
jhg   — Do zapłaty — Stół2
gfd   — Do zapłaty — Stół3
Test3 — Do zapłaty — Stół4
Test4 — Do zapłaty — Stół4
```

### Wniosek

Błąd:

```text
ReferenceError: formatCellNumber is not defined
```

nie występuje już w sekcji `Losowanie stołów`.

Oznacza to, że poprawka dla `formatCellNumber` została wdrożona skutecznie albo przynajmniej sekcja `draw` ma już dostęp do tego helpera.

Sekcja `draw` przechodzi renderowanie i pokazuje dane użytkownikowi.

---

## 2. Wynik testu sekcji `Wpłaty`

### Wykonane kroki

Kliknięto sekcję:

```text
Wpłaty
```

### Wynik

Sekcja `Wpłaty` nadal nie renderuje się poprawnie.

Na ekranie pojawił się komunikat:

```text
Nie udało się wyrenderować sekcji „payments” (etap: payments).
Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toPercentText is not defined
```

### Wniosek

Poprzedni błąd sekcji `Wpłaty`:

```text
ReferenceError: percentInputToDecimal is not defined
```

został najpewniej naprawiony, ponieważ aplikacja doszła dalej w renderowaniu sekcji `payments`.

Teraz render zatrzymuje się na kolejnym brakującym helperze:

```js
toPercentText
```

To oznacza, że `toPercentText` również jest używany w widoku użytkownika, ale nie jest dostępny w zakresie funkcji renderującej `payments`.

---

## 3. Główna diagnoza po tym teście

Aktualny stan:

```text
PIN działa.
Uprawnienia działają.
Sidebar działa.
Czat działa.
Losowanie stołów działa.
Wpłaty nadal mają błąd renderowania.
```

Nie występuje już pierwotny problem:

```text
TOP-NO-PANELS
```

Nie występuje już w testowanej sekcji `draw` błąd:

```text
formatCellNumber is not defined
```

Pozostały problem:

```text
ReferenceError: toPercentText is not defined
```

w sekcji:

```text
payments
```

---

## 4. Co należy poprawić

### Plik do poprawy

```text
Second/app.js
```

### Helper do sprawdzenia

Należy wyszukać w pliku:

```text
toPercentText
```

i sprawdzić:

```text
1. Gdzie `toPercentText` jest zdefiniowany.
2. Czy definicja znajduje się tylko wewnątrz funkcji admina.
3. Czy `setupUserView(root)` / render sekcji `payments` używa `toPercentText`, ale nie ma go w swoim zakresie.
```

---

## 5. Zalecana naprawa

Najlepsze rozwiązanie jest takie samo jak przy poprzednich helperach:

```text
Przenieść `toPercentText` do wspólnego zakresu modułu w `Second/app.js`.
```

Czyli helper powinien być dostępny zarówno dla panelu admina, jak i dla widoku użytkownika.

Docelowy schemat:

```js
const toPercentText = (...) => {
  // istniejąca implementacja przeniesiona bez zmiany logiki
};

const setupAdminTournament = (...) => {
  // admin może używać toPercentText
};

const setupUserView = (...) => {
  // user też może używać toPercentText
};
```

Nie należy pisać nowej implementacji „na oko”, jeżeli istnieje już działająca wersja w kodzie admina.

Najbezpieczniej:

```text
- znaleźć istniejącą definicję `toPercentText`,
- przenieść ją do wspólnego zakresu pliku,
- usunąć lokalną duplikację, jeżeli taka istnieje,
- upewnić się, że admin i user korzystają z tej samej funkcji.
```

---

## 6. Ważna uwaga architektoniczna

To jest kolejny przypadek tego samego typu błędu.

Wcześniej problem dotyczył helperów:

```text
esc
formatCellNumber
percentInputToDecimal
```

Teraz dotyczy:

```text
toPercentText
```

Wniosek:

```text
Wszystkie helpery używane przez widok użytkownika powinny być albo zdefiniowane lokalnie w setupUserView(root), albo — lepiej — przeniesione do wspólnego zakresu modułu.
```

Rekomendowane jest sprawdzenie całego renderowania sekcji `payments`, czy nie używa kolejnych helperów dostępnych tylko w adminie.

---

## 7. Co sprawdzić przed kolejnym wdrożeniem

W pliku:

```text
Second/app.js
```

należy w obrębie renderowania `payments` wyszukać funkcje pomocnicze podobne do:

```text
toPercentText
percentInputToDecimal
formatCellNumber
formatCurrency
formatMoney
toMoneyText
toCurrencyText
parseAmount
parsePercent
toNumber
```

Nie chodzi o to, że wszystkie te funkcje na pewno są błędne.

Chodzi o sprawdzenie, czy żadna z nich nie jest używana w `setupUserView(root)` bez dostępnej definicji.

---

## 8. Cache-buster po poprawce

Po zmianie `Second/app.js` należy ponownie zmienić wersję skryptu w:

```text
Second/index.html
```

Jeżeli aktualnie jest np.:

```html
<script src="app.js?v=2026-05-06-2" type="module"></script>
```

to po poprawce zmienić na kolejną wersję, np.:

```html
<script src="app.js?v=2026-05-06-3" type="module"></script>
```

Najważniejsze, żeby wartość po `?v=` była inna niż w poprzednim teście.

---

## 9. Test po kolejnej poprawce

Po wdrożeniu poprawki należy ponownie sprawdzić:

```text
1. Czy Edge ładuje nową wersję app.js w Network.
2. Czy PIN 55555 pokazuje sekcje Losowanie stołów / Wpłaty / Czat.
3. Czy Losowanie stołów nadal działa.
4. Czy Wpłaty renderują się bez błędu toPercentText is not defined.
5. Czy Czat nadal działa.
6. Czy w Console nie ma błędów ReferenceError związanych z helperami.
```

Oczekiwany wynik dla `Wpłaty`:

```text
Sekcja Wpłaty renderuje się poprawnie albo pokazuje kontrolowany komunikat o braku danych.
Nie pojawia się ReferenceError: toPercentText is not defined.
```

---

## 10. Podsumowanie tej aktualizacji

Aktualny stan po teście:

```text
Losowanie stołów: działa.
Czat: działa.
Wpłaty: nadal błąd.
```

Pozostały błąd:

```text
ReferenceError: toPercentText is not defined
```

Wniosek techniczny:

```text
`toPercentText` trzeba udostępnić widokowi użytkownika, najlepiej przez przeniesienie helpera do wspólnego zakresu modułu w Second/app.js.
```

## Aktualizacja wdrożenia 2026-05-06 — finalizacja błędu `toPercentText is not defined`

### Zmiany w kodzie wykonane na podstawie tej analizy

Plik `Second/app.js`  
Linia (obszar `setupUserView`)  
Było: *(brak helpera `toPercentText` w zakresie widoku użytkownika)*  
Jest: `const toPercentText = (value) => \`${Math.round((toNumber(value) * 100) * 100) / 100}%\`;`

Plik `Second/index.html`  
Linia skryptu modułu  
Było: `<script src="app.js?v=2026-05-06-2" type="module"></script>`  
Jest: `<script src="app.js?v=2026-05-06-3" type="module"></script>`

======
## Aktualizacja 2026-05-07 - nowe wnioski

# Aktualizacja analizy — regresja renderowania zakładek Tournament of Poker po poprawce TOP-NO-PANELS

## Data testu

2026-05-06

## Kontekst

Po wcześniejszych poprawkach błąd:

```text
Brak dostępnych paneli Tournament of Poker dla tego PIN-u (kod: TOP-NO-PANELS)
```

został częściowo rozwiązany.

W nowym teście utworzony został nowy gracz testowy z PIN-em:

```text
99999
```

Graczowi nadano wszystkie uprawnienia turniejowe.

Po wpisaniu PIN-u w widoku użytkownika aplikacja poprawnie odblokowała zakładkę:

```text
Tournament of Poker
```

oraz pokazała w bocznym panelu wszystkie dozwolone sekcje:

- Losowanie stołów
- Wpłaty
- Podział puli
- Faza grupowa
- Półfinał
- Finał
- Wypłaty
- Czat

To oznacza, że poprzedni problem z fałszywym komunikatem TOP-NO-PANELS nie jest już głównym problemem.

## 1. Co zostało sprawdzone

### Test 1 — wejście PIN-em nowego gracza

Utworzono nowego gracza:

```text
TesterFull
PIN: 99999
```

Gracz otrzymał wszystkie uprawnienia turniejowe.

Po wpisaniu PIN-u w widoku użytkownika aplikacja:

- przyjęła PIN,
- odblokowała zakładkę Tournament of Poker,
- pokazała w panelu bocznym wszystkie sekcje turniejowe.

### Wniosek z testu 1

Mechanizm PIN-u i mechanizm uprawnień działają poprawnie.

Problem nie leży obecnie w:

- Firebase
- PIN-ie
- uprawnieniach gracza
- liście allowedSections
- liście allowedTargets

## 2. Wynik testu każdej zakładki

Po wejściu jako gracz z pełnymi uprawnieniami przetestowano wszystkie sekcje widoku użytkownika Tournament of Poker.

| Sekcja | Wynik |
|---|---|
| Losowanie stołów | Działa |
| Wpłaty | Błąd renderowania |
| Podział puli | Błąd renderowania |
| Faza grupowa | Błąd renderowania |
| Półfinał | Błąd renderowania |
| Finał | Błąd renderowania |
| Wypłaty | Błąd renderowania |
| Czat | Działa |

## 3. Komunikaty błędów widoczne w UI

Dla sekcji Wpłaty pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „payments” (etap: payments). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

Dla sekcji Podział puli pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „pool” (etap: pool). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

Dla sekcji Faza grupowa pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „group” (etap: group). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

Dla sekcji Półfinał pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „semi” (etap: semi). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

Dla sekcji Finał pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „final” (etap: final). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

Dla sekcji Wypłaty pojawia się komunikat:

```text
Nie udało się wyrenderować sekcji „payouts” (etap: payouts). Sprawdź dane turniejowe i spróbuj odświeżyć.

Szczegóły: ReferenceError: toNumber is not defined
```

## 4. Co pokazuje konsola

W konsoli, po filtrowaniu:

```text
[Second][UserTournament]
```

widać, że aplikacja loguje poprawne przejścia między sekcjami.

Dla każdej klikniętej sekcji pojawia się m.in.:

```text
event: "section_navigation"
event: "render_start"
isUserTournamentLoaded: true
isUserPinGateOpen: true
```

To oznacza, że:

- Aplikacja próbuje renderować właściwą sekcję.
- Sesja PIN jest aktywna.
- Tournament of Poker jest odblokowany.
- Problem pojawia się dopiero wewnątrz funkcji renderującej daną sekcję.

## 5. Główna diagnoza

Aktualny problem nie jest już błędem uprawnień.

Aktualny problem to błąd JavaScript w renderowaniu sekcji użytkownika.

Najważniejszy komunikat:

```text
ReferenceError: toNumber is not defined
```

oznacza, że kod widoku użytkownika próbuje użyć funkcji:

```js
toNumber(...)
```

ale ta funkcja nie istnieje w zakresie widocznym dla kodu renderującego user-view.

## 6. Powiązanie z wcześniejszą analizą

Wcześniejsza analiza wykazała już podobny problem z funkcją:

```js
esc(...)
```

Wtedy ustalono, że esc była zdefiniowana lokalnie w kodzie administratora, ale używana także w widoku użytkownika.

Ten obecny błąd ma tę samą naturę.

Obecnie problem dotyczy helpera:

```js
toNumber(...)
```

Najprawdopodobniej toNumber istnieje albo istniał tylko lokalnie w części administratorskiej, np. wewnątrz:

```js
setupAdminTournament(...)
```

natomiast widok użytkownika, czyli:

```js
setupUserView(...)
```

nie ma do niego dostępu.

## 7. Dlaczego wcześniejsza poprawka nie wystarczyła

W poprzednich testach pojawiały się kolejno błędy:

```text
ReferenceError: formatCellNumber is not defined
ReferenceError: percentInputToDecimal is not defined
ReferenceError: toPercentText is not defined
ReferenceError: toNumber is not defined
```

To wskazuje, że poprawki były wykonywane punktowo: naprawiano jeden brakujący helper, po czym aplikacja dochodziła do kolejnego brakującego helpera.

To nie rozwiązuje źródła problemu.

Źródłem problemu jest to, że widok użytkownika korzysta z helperów, które nie są wspólne/globalne.

## 8. Co należy poprawić

### Plik do poprawy

```text
Second/app.js
```

### Miejsce do poprawy

Należy poprawić helpery używane przez render Tournament of Poker.

Szukaj w pliku:

```js
const setupAdminTournament = (rootCard) => {
```

oraz:

```js
const setupUserView = (root) => {
```

Następnie sprawdź definicje helperów:

- esc
- toNumber
- formatCellNumber
- percentInputToDecimal
- toPercentText

Jeżeli którykolwiek z tych helperów jest zdefiniowany tylko wewnątrz setupAdminTournament, to widok użytkownika nie będzie miał do niego dostępu.

Helpery używane zarówno przez admina, jak i user-view powinny być w zakresie globalnym pliku Second/app.js, czyli poza funkcjami:

```js
setupAdminTournament(...)
setupUserView(...)
```

## 9. Minimalna poprawka dla aktualnego błędu

Aktualnie widoczny błąd dotyczy funkcji:

```js
toNumber
```

Należy dodać ją w Second/app.js w globalnym zakresie, najlepiej obok pozostałych helperów liczbowych, czyli w pobliżu:

- formatCellNumber
- percentInputToDecimal
- toPercentText

Jeżeli formatCellNumber, percentInputToDecimal i toPercentText są już przeniesione do globalnego zakresu, to toNumber musi być globalnie dostępny razem z nimi.

Do dodania:

```js
const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

    if (!normalized) {
      return 0;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};
```

### Ważne

Nie wolno dodać drugiego globalnego const toNumber, jeżeli taki już istnieje.

Przed dodaniem należy wyszukać w pliku:

```text
toNumber
```

Jeżeli toNumber istnieje tylko wewnątrz setupAdminTournament, należy ją przenieść albo skopiować do globalnego zakresu.

Jeżeli toNumber istnieje już globalnie, ale błąd dalej występuje, to znaczy, że przeglądarka nie ładuje jeszcze nowej wersji pliku albo helper znajduje się niżej/w złym zakresie.

## 10. Zalecana pełniejsza poprawka

Zamiast poprawiać helpery pojedynczo, należy zrobić jeden wspólny blok helperów dla admina i user-view.

W Second/app.js, poza funkcjami setupAdminTournament i setupUserView, powinien istnieć wspólny blok:

```js
const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

    if (!normalized) {
      return 0;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatCellNumber = (value) => {
  const number = toNumber(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return Number.isInteger(number)
    ? String(number)
    : String(Math.round(number * 100) / 100).replace(".", ",");
};

const percentInputToDecimal = (value) => {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value;
  }

  const normalized = String(value ?? "")
    .trim()
    .replace("%", "")
    .replace(",", ".");

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed > 1 ? parsed / 100 : parsed;
};

const toPercentText = (value) => {
  const percent = percentInputToDecimal(value) * 100;
  return `${formatCellNumber(percent)}%`;
};
```

### Ważne przy pełniejszej poprawce

Jeżeli część tych funkcji już istnieje globalnie po wcześniejszych poprawkach, nie należy dodawać ich drugi raz.

Należy wtedy tylko uzupełnić brakującą funkcję albo ujednolicić istniejący blok.

## 11. Dlaczego trzeba poprawić helpery globalnie

Widok użytkownika renderuje dane z kopii readonly.

Render nie powinien zależeć od funkcji zadeklarowanych lokalnie wewnątrz panelu administratora.

Jeżeli helper istnieje tylko w adminie, to:

- admin-view działa,
- user-view może się wyłożyć błędem ReferenceError

To dokładnie dzieje się teraz.

## 12. Aktualny status zakładek po testach

### Działa

- Losowanie stołów
- Czat

### Nie działa z powodu toNumber is not defined

- Wpłaty
- Podział puli
- Faza grupowa
- Półfinał
- Finał
- Wypłaty

## 13. Czy poprawka dotycząca „Wpłat” zadziałała?

Nie w pełni.

Błąd w zakładce Wpłaty zmienił się, ale zakładka nadal nie renderuje się poprawnie.

Aktualny błąd:

```text
ReferenceError: toNumber is not defined
```

oznacza, że poprzednia poprawka prawdopodobnie usunęła wcześniejszy problem z:

```js
toPercentText
```

ale aplikacja doszła do kolejnego brakującego helpera:

```js
toNumber
```

## 14. Po poprawce trzeba zaktualizować wersję cache

Po zmianie Second/app.js należy zaktualizować wersję skryptu w:

```text
Second/index.html
```

Przykład:

```html
<script src="./app.js?v=2026-05-06-4"></script>
```

Aktualnie przeglądarka ładuje wersję:

```text
app.js?v=2026-05-06-3
```

Po poprawce wersja powinna zostać podbita, aby Edge/Chrome/GitHub Pages nie używały starego pliku z cache.

## 15. Test po wdrożeniu poprawki

Po wdrożeniu poprawki należy wykonać test w Edge:

1. Otworzyć DevTools.
2. Wejść w Network.
3. Zaznaczyć Disable cache.
4. Odświeżyć stronę przez Ctrl + F5.
5. Sprawdzić, czy ładuje się nowa wersja:

```text
app.js?v=2026-05-06-4
```

6. Wpisać PIN testowego gracza:

```text
99999
```

7. Wejść w:

```text
Tournament of Poker
```

8. Kliknąć po kolei:

- Losowanie stołów
- Wpłaty
- Podział puli
- Faza grupowa
- Półfinał
- Finał
- Wypłaty
- Czat

Oczekiwany wynik:

- Żadna zakładka nie pokazuje ReferenceError.
- Żadna zakładka nie pokazuje TOP-NO-PANELS.
- Każda zakładka albo renderuje dane readonly, albo pokazuje kontrolowany komunikat o braku danych.

## 16. Ostateczny wniosek

Aktualny problem nie dotyczy już uprawnień PIN.

Aktualny problem dotyczy zakresu funkcji pomocniczych w Second/app.js.

Kod user-view używa helpera:

```js
toNumber(...)
```

ale helper nie jest dostępny globalnie.

Należy przenieść toNumber oraz pozostałe helpery współdzielone przez admin-view i user-view do wspólnego, globalnego zakresu pliku Second/app.js.

Dopiero po tej poprawce można uznać, że render Tournament of Poker w widoku użytkownika jest naprawiany właściwie, a nie punktowo.

::contentReference[oaicite:3]{index=3}


## Aktualizacja wdrożeniowa 2026-05-07 — zmiany w kodzie po nowym błędzie

Plik `Second/app.js`
- Linia 2473
  - Było: brak lokalnej definicji `toNumber(...)` w `setupUserView`.
  - Jest: `const toNumber = (value) => { const normalized = String(value ?? "").replace(",", ".").trim(); ... };`
- Linia 2485
  - Było: `const toPercentText = (value) => `${Math.round((toNumber(value) * 100) * 100) / 100}%`;` z odwołaniem do niedostępnego helpera.
  - Jest: ten sam zapis, ale z działającym lokalnym helperem `toNumber` w tym samym zakresie.

Plik `Second/index.html`
- Linia 287
  - Było: `<script src="app.js?v=2026-05-06-3" type="module"></script>`
  - Jest: `<script src="app.js?v=2026-05-07-1" type="module"></script>`
