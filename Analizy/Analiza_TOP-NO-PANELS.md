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
