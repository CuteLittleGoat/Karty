# Analiza bezpieczeństwa dostępu do bazy danych (Firestore) — 2026-09-07

> **UWAGA WSTĘPNA — ten plik trafia do repozytorium publicznego.**
> Repozytorium `CuteLittleGoat/Karty` jest **publiczne** (sprawdzone przez API GitHuba: `"visibility": "public"`).
> Dlatego w tym dokumencie **świadomie nie ma** gotowych poleceń, skryptów ani przykładów „jak to zrobić krok po kroku”.
> Opisuję **co** jest odsłonięte i **jak to naprawić**, bez instrukcji nadużycia.
> Wszystkie fakty przytoczone niżej i tak wynikają wprost z plików, które w tym repozytorium są już jawne.
> Patrz też pytanie **5** na końcu — rekomenduję przeniesienie tego dokumentu poza repozytorium publiczne albo ustawienie repozytorium jako prywatne.

---

## 1. Prompt użytkownika (zachowany dla kontekstu)

> Pytanie Q usuń. To będzie osobna analiza. Przygotuj ją teraz. Czy każdy kto zna adres może modyfikować dane? Dostęp do Firebase console jest chroniony loginem i hasłem.

---

## 2. Odpowiedź wprost na pytanie

**Tak — każdy, kto zna adres projektu, może odczytywać i modyfikować dane. Ochrona Firebase Console tego nie zmienia.**

To jest sedno sprawy, więc rozpiszę je dokładnie, bo tu kryje się nieporozumienie.

**Firebase Console i baza danych to dwie różne drogi do tych samych danych.**

| | Firebase Console | Bezpośredni dostęp do bazy |
|---|---|---|
| Co to jest | Panel administracyjny Google (`console.firebase.google.com`) | Interfejs, z którego korzysta sama aplikacja |
| Kto może wejść | Tylko Pan — chroni login i hasło Google | **Każdy** — nie ma tu żadnego logowania |
| Czym chronione | Konto Google | **Wyłącznie regułami bezpieczeństwa Firestore** |
| Stan dziś | ✅ zabezpieczone | ❌ całkowicie otwarte |

Aplikacja działająca w przeglądarce gracza **nie loguje się do Firebase Console** — łączy się z bazą bezpośrednio. Żeby to było możliwe, dane połączenia (identyfikator projektu i klucz `apiKey`) muszą być zapisane w kodzie strony, którą pobiera każda przeglądarka. Są w pliku `config/firebase-config.js` i **każdy może je odczytać** — wystarczy podejrzeć źródło strony (Ctrl+U) albo otworzyć plik w tym repozytorium.

Skoro przeglądarka gracza potrafi połączyć się z bazą bez logowania, to **dokładnie tak samo potrafi każdy inny program** — a to, czy wolno mu coś odczytać lub zapisać, rozstrzygają wyłącznie **reguły bezpieczeństwa Firestore**.

I tu jest problem: obecne reguły (plik `Analizy/Wazne_Rules.txt`) dla **każdej** kolekcji mówią `allow read, write: if true`, czyli dosłownie „pozwól czytać i pisać zawsze, każdemu”.

**Analogia.** Firebase Console to drzwi frontowe do Pana biura — zamknięte na klucz, i bardzo dobrze. Ale baza danych ma drugie wejście, z którego korzysta aplikacja, i to wejście stoi dziś **otworem, bez klamki i bez zamka**. Zamek w drzwiach frontowych nie ma na nie żadnego wpływu.

---

## 3. Jak to sprawdziłem (i czego celowo nie sprawdzałem)

Nie poprzestałem na przeczytaniu pliku z regułami — reguły w pliku mogą się różnić od tych faktycznie wgranych do Firebase. Wykonałem test praktyczny.

**Metoda.** Poprosiłem bazę — z zewnątrz, bez żadnego logowania — o **dokument, który na pewno nie istnieje**. Firestore odpowiada wtedy inaczej w zależności od reguł:
- jeżeli reguła **zabrania** dostępu → odpowiedź `403 PERMISSION_DENIED`,
- jeżeli reguła **pozwala** → odpowiedź `404 NOT_FOUND` (dostęp przyznany, tylko dokumentu nie ma).

Dzięki temu odpowiedź jest jednoznaczna, a **żadne prawdziwe dane nie zostały pobrane**.

**Wynik:**

| Zapytanie | Odpowiedź | Wniosek |
|---|---|---|
| nieistniejący dokument w `app_settings` | `404 NOT_FOUND` | dostęp **przyznany** |
| nieistniejący dokument w `Tables` | `404 NOT_FOUND` | dostęp **przyznany** |
| nieistniejący dokument w kolekcji spoza reguł (test kontrolny) | `403 PERMISSION_DENIED` | test działa poprawnie — potrafi wykryć blokadę |

Test kontrolny jest tu istotny: dowodzi, że metoda faktycznie rozróżnia „wolno” od „nie wolno”, więc dwa pierwsze wyniki nie są przypadkiem.

**Wniosek:** reguły z pliku `Wazne_Rules.txt` są **faktycznie wgrane** do projektu i działają dokładnie tak, jak napisano — czyli wpuszczają każdego. Anonimowy odczyt z zewnątrz aplikacji, bez logowania i bez Firebase Console, **działa**.

**Czego celowo NIE zrobiłem.** Nie testowałem zapisu. Zapis oznaczałby zmodyfikowanie Pana produkcyjnej bazy, a aplikacja nasłuchuje zmian na żywo — testowy wpis mógłby się komuś pojawić na ekranie (np. w czacie). Uprawnienie do zapisu jest w regułach zapisane **w tej samej linii** co odczyt (`allow read, write: if true`), a skoro potwierdzono, że ta linia działa, to zapis jest dozwolony na tej samej zasadzie. Gdyby chciał Pan mieć na to twardy dowód, mogę wykonać kontrolowany test na osobnej, nieużywanej nazwie kolekcji i od razu po nim posprzątać — ale potrzebuję na to wyraźnej zgody.

---

## 4. Co konkretnie jest odsłonięte

Reguły obejmują **wszystkie** kolekcje obu modułów. Poniżej to, co ma realne znaczenie.

| Kolekcja | Co zawiera | Ryzyko |
|---|---|---|
| `app_settings/player_access` | lista graczy: nazwy, uprawnienia i **PIN-y zapisane otwartym tekstem** | 🔴 krytyczne |
| `admin_security/credentials` | skrót hasła administratora (`passwordHash`) | 🔴 krytyczne |
| `Tables` + `rows` + `confirmations` | wszystkie gry admina, składy, kwoty, potwierdzenia | 🟠 wysokie |
| `UserGames` + `rows` + `confirmations` | wszystkie gry graczy | 🟠 wysokie |
| `admin_games_stats` | statystyki roczne i wagi | 🟠 wysokie |
| `chat_messages` | cała historia czatu | 🟠 wysokie |
| `admin_messages`, `admin_notes`, `app_settings` | aktualności, regulamin, notatki | 🟡 średnie |
| `calculators/...` | dane kalkulatorów | 🟡 średnie |
| kolekcje `second_*` | komplet danych modułu Tournament of Poker | 🟠 wysokie |
| `Nekrolog_*` | dane modułu nekrologu | 🟡 średnie |

Uwaga techniczna: w pliku reguł zdefiniowano funkcje pomocnicze `isSignedIn()` i `isAdmin()`, ale **nie są użyte w żadnej regule**. Ktoś zaczął kiedyś budować kontrolę dostępu i jej nie dokończył. To dobra wiadomość — szkielet już jest.

Jedyny wyjątek od pełnej otwartości to `Nekrolog_refresh_jobs`, gdzie zapis ograniczono do jednego dokumentu (`docId == "latest"`). To pokazuje, że reguły potrafią być węższe — po prostu nigdzie indziej tego nie zrobiono.

---

## 5. Co z tego realnie wynika — uszeregowane wg wagi

### 5.1. 🔴 PIN-y graczy są jawne

W dokumencie `app_settings/player_access` PIN-y są zapisane **otwartym tekstem** (`normalizePlayerRecord` w `Main/app.js` zapisuje `pin` jako zwykły ciąg cyfr). Każdy, kto pobierze ten dokument, dostaje komplet PIN-ów wraz z nazwami graczy i ich uprawnieniami.

Skutek: cała ochrona zakładek w Strefie Gracza przestaje cokolwiek znaczyć. Dodatkowo PIN ma tylko 5 cyfr, więc nawet bez odczytu bazy jest to sto tysięcy kombinacji, a aplikacja nie ma żadnego ograniczenia liczby prób.

### 5.2. 🔴 Hasło administratora da się obejść na trzy niezależne sposoby

Mechanizm: w `admin_security/credentials` leży `passwordHash` — **SHA-256 bez soli**, a porównanie odbywa się **w przeglądarce** (`Main/app.js`, funkcje `getAdminPasswordHash` i `getSha256Hex`).

Trzy niezależne słabości, z których **każda osobno** wystarcza:

1. **Skrót można nadpisać.** Reguła `admin_security` pozwala na zapis każdemu. Kto podmieni `passwordHash` na skrót własnego hasła, wchodzi do panelu administratora. Siła hasła nie ma tu żadnego znaczenia.
2. **Sprawdzanie dzieje się po stronie przeglądarki.** Kod porównujący hasło działa na komputerze osoby, która próbuje wejść — a więc jest w jej pełnej władzy. Ochrona po stronie klienta jest tylko sugestią, nigdy zabezpieczeniem.
3. **SHA-256 bez soli jest słaby dla haseł.** Ta funkcja jest zaprojektowana tak, by liczyć się bardzo szybko, co przy łamaniu haseł działa na niekorzyść. Bez soli skrót typowego hasła bywa do odwrócenia w kilka chwil.

Warto podkreślić: **nawet idealne hasło niczego by tu nie uratowało**, dopóki jego skrót może nadpisać dowolna osoba.

### 5.3. 🟠 Dane można zmieniać i kasować

Prawo zapisu obejmuje wszystko: wyniki gier, statystyki, wagi, ranking, czat, regulamin, listę graczy. Można też **usunąć** dowolny dokument — łącznie z całymi grami.

Sytuacja jest tym poważniejsza, że **aplikacja nie ma żadnej kopii zapasowej**. W repozytorium jest wprawdzie folder `Backup/`, ale zawiera on kopię **kodu** modułu Second, a nie danych. Skasowanie danych byłoby dziś nieodwracalne.

### 5.4. 🟠 Czat jest w całości do odczytu i do podszycia się

Cała historia rozmów jest jawna, a wiadomości można dopisywać z dowolnym podpisem — aplikacja nie ma sposobu, żeby zweryfikować, kto naprawdę pisze.

### 5.5. 🟡 Ryzyko kosztowe

Firestore rozlicza się od liczby operacji. Otwarta baza pozwala dowolnej osobie generować odczyty i zapisy w nieskończoność. Przy darmowym planie Spark skończy się to zablokowaniem aplikacji po przekroczeniu limitu; przy planie Blaze (płatnym) — rachunkiem.

---

## 6. Trzy rzeczy, które warto od razu odkłamać

**„Klucz `apiKey` wyciekł w repozytorium — to trzeba pilnie zmienić.”**
Nie. Klucz `apiKey` w Firebase **z założenia jest jawny** — musi być w kodzie strony, żeby aplikacja mogła się połączyć. To nie jest hasło, tylko identyfikator projektu. Google projektuje to tak celowo. Jego zmiana **niczego nie poprawi**, a popsuje działającą aplikację. **Problemem nie jest jawny klucz, tylko brak reguł.**

**„Repozytorium jest publiczne, więc to dlatego dane są odsłonięte.”**
Nie. Nawet w prywatnym repozytorium `apiKey` i identyfikator projektu byłyby widoczne w kodzie strony u każdego użytkownika. Publiczne repozytorium **ułatwia** znalezienie tych danych i pokazuje przy okazji strukturę bazy, ale **nie jest przyczyną** problemu. Przyczyną są wyłącznie reguły.

**„PIN-y chronią dane.”**
PIN-y chronią **zakładki na ekranie**, a nie dane. Są sprawdzane w przeglądarce, już **po** pobraniu danych z bazy. Kto pomija aplikację i pyta bazę bezpośrednio, w ogóle nie natrafia na PIN.

---

## 7. Opcje naprawy

> **STATUS: częściowo nieaktualne.** Użytkownik podjął decyzje (2026-09-07): opcja **B odpada** (bez loginów i haseł dla graczy), opcja **C — App Check — zostaje wybrana**, mechanizm hasła admina **zostaje bez zmian**. Obowiązujące ustalenia i skorygowane rekomendacje są w **sekcji 12**. Poniższy przegląd pozostawiony jako zapis rozważanych możliwości.

Uszeregowane od najprostszej do najmocniejszej. Można je łączyć i wprowadzać etapami.

### Opcja A — logowanie anonimowe + reguły wymagające zalogowania
**Na czym polega:** aplikacja przy starcie loguje każdego użytkownika „anonimowo” (Firebase robi to samo, w tle, bez pytania o cokolwiek), a reguły zmieniają się z `if true` na `if request.auth != null`.
**Koszt:** mały — kilka linii w aplikacji plus przepisanie reguł. Nic nie zmienia się dla użytkowników.
**Co daje:** odcina przypadkowe i automatyczne skanowanie z zewnątrz. Baza przestaje być otwarta dla dowolnego programu.
**Czego nie daje:** kto chce, sam sobie utworzy sesję anonimową. To zamek, który zatrzyma przechodnia, ale nie kogoś zdeterminowanego.

### Opcja B — prawdziwe logowanie graczy + role
**Na czym polega:** każdy gracz dostaje własne konto (e-mail z hasłem albo logowanie linkiem wysyłanym mailem). Rola administratora nadawana jest jako tzw. „custom claim” — znacznik przypisany do konta po stronie Google, którego nie da się podrobić z przeglądarki. Reguły opierają się wtedy na tożsamości: gracz widzi swoje gry, admin widzi wszystko.
**Koszt:** największy z wymienionych — trzeba przebudować logowanie w aplikacji, założyć konta i przenieść uprawnienia z PIN-ów na role. To projekt na kilka dni pracy, nie na jedno popołudnie.
**Co daje:** faktyczne bezpieczeństwo. PIN-y mogą wtedy zostać jako wygodny skrót w interfejsie, ale przestają być jedyną linią obrony.
**Uwaga:** to rozwiązanie docelowe. Nie trzeba go robić od razu, ale warto wiedzieć, że tam prowadzi droga.

### Opcja C — App Check
**Na czym polega:** mechanizm Google, który potwierdza, że żądanie przychodzi z **Pana** aplikacji, a nie z obcego programu.
**Koszt:** mały; konfiguracja w konsoli plus kilka linii w kodzie.
**Co daje:** skutecznie odcina obce narzędzia i skrypty.
**Czego nie daje:** nie rozróżnia użytkowników — zalogowany gracz nadal widzi wszystko, co widzi aplikacja. Najlepiej działa jako **dodatek** do opcji A lub B, nie zamiast nich.

### Opcja D — warstwa pośrednia (Cloud Functions)
**Na czym polega:** przeglądarka traci bezpośredni dostęp do bazy; wszystko idzie przez kod na serwerze Google, który sprawdza uprawnienia.
**Koszt:** największy — to przebudowa architektury aplikacji. Wymaga też planu płatnego (Blaze).
**Co daje:** najwyższy poziom kontroli.
**Ocena:** dla tej aplikacji **przesada**. Wymieniam dla kompletności.

### Opcja E — natychmiastowe łaty punktowe (możliwe od zaraz)
Niezależnie od wyboru docelowego kierunku, poniższe da się zrobić szybko i **od razu usuwa dwa najgorsze ryzyka**:

1. **PIN-y wyprowadzić z dokumentu czytanego przez wszystkich.** Dziś jeden dokument zawiera i listę graczy, i ich PIN-y. Rozdzielenie tych rzeczy sprawia, że nawet przy otwartych regułach PIN-y nie wychodzą na zewnątrz razem z listą graczy.
2. **Zablokować zapis do `admin_security`.** Ta kolekcja **nie musi** być zapisywalna z aplikacji — hasło zmienia się rzadko i można to zrobić z Firebase Console. Zablokowanie samego zapisu (przy pozostawieniu odczytu) likwiduje najgroźniejszą ze słabości opisanych w pkt 5.2, a jest zmianą **wyłącznie w regułach — bez dotykania kodu**.
3. **Zawęzić reguły tam, gdzie nic to nie kosztuje** — np. kolekcje, do których aplikacja nigdy nie pisze, mogą dostać sam odczyt.
4. **Włączyć kopie zapasowe.** Niezależnie od bezpieczeństwa — dziś nie ma żadnego zabezpieczenia przed przypadkowym skasowaniem danych.

### Podsumowanie opcji

| Opcja | Nakład pracy | Skuteczność | Rekomendacja |
|---|---|---|---|
| **E — łaty punktowe** | mały | usuwa 2 najgorsze ryzyka | ✅ **zrobić najpierw** |
| **A — logowanie anonimowe** | mały | odcina skanowanie z zewnątrz | ✅ **zaraz po E** |
| **C — App Check** | mały | odcina obce narzędzia | ✅ dobre uzupełnienie |
| **B — logowanie i role** | duży | rozwiązanie właściwe | 🔵 cel docelowy |
| **D — Cloud Functions** | bardzo duży | najwyższa | ⚪ zbędne tutaj |

---

## 8. Sugerowana kolejność

> **STATUS: NIEAKTUALNE.** Obowiązuje plan z **pkt 12.6**.

**Krok 1 — teraz, sama zmiana reguł, bez dotykania kodu:** zablokować zapis do `admin_security`, włączyć kopie zapasowe bazy.
**Krok 2 — wkrótce:** wyprowadzić PIN-y z dokumentu czytanego przez wszystkich, zawęzić reguły tam, gdzie to bezkosztowe.
**Krok 3 — gdy będzie chwila:** logowanie anonimowe + reguły `request.auth != null`, ewentualnie App Check.
**Krok 4 — docelowo:** prawdziwe konta i role.

Kroki 1 i 2 zdejmują większość realnego ryzyka przy niewielkim nakładzie. Krok 4 to osobny projekt i nie musi konkurować z bieżącą listą poprawek.

---

## 9. Jak to się ma do zaplanowanych zmian w aplikacji

Uzgodnione zmiany (naprawa przycisków „Waga”, nazwy graczy, „CzyZamknięta”, numeracja potwierdzeń, eksport do Excela, import gier) **nie pogarszają** tej sytuacji i **nie są przez nią blokowane**. Mogą być realizowane równolegle.

Jeden punkt styku warto odnotować: w modelu importu gra jest kopiowana do zakładki „Gry admina” **przez przeglądarkę gracza**. Jest to możliwe wyłącznie dlatego, że reguły na to pozwalają. Przy przejściu na opcję B (prawdziwe konta i role) trzeba będzie osobno zaprojektować, kto ma prawo utworzyć taką kopię — inaczej import przestanie działać. **Nie jest to argument przeciwko zabezpieczaniu bazy** — to po prostu rzecz do przewidzenia przy planowaniu tamtej zmiany.

---

## 10. Prostym językiem — całość w kilku zdaniach

Pana baza danych ma dziś **dwa wejścia**. Pierwsze to Firebase Console — panel Google, do którego wchodzi Pan loginem i hasłem. To wejście jest zamknięte prawidłowo.

Drugie wejście to takie, z którego korzysta sama aplikacja w telefonie gracza. Żeby aplikacja mogła działać, adres tego wejścia musi być zapisany w kodzie strony — a więc każdy może go odczytać. To normalne i tak ma być. **Nienormalne jest to, że przy tym wejściu nie ma dziś żadnego sprawdzania.** Kto pod nie podejdzie, wchodzi.

Sprawdziłem to praktycznie — zapytałem bazę z zewnątrz, bez logowania, i baza odpowiedziała. Zrobiłem to tak, żeby nie pobrać żadnych prawdziwych danych: zapytałem o dokument, który nie istnieje, i po sposobie odpowiedzi poznałem, że dostęp jest przyznawany.

W praktyce oznacza to, że osoba, która by chciała, może pobrać PIN-y wszystkich graczy (są zapisane zwykłym tekstem), wejść do panelu administratora, poprawić sobie wyniki w rankingu, poczytać czat albo wszystko skasować — a kopii zapasowej nie ma.

**Czy ktoś to już zrobił?** Nie wiem i nie da się tego stwierdzić z zewnątrz — Firestore nie prowadzi takiej historii, dopóki się jej nie włączy. Aplikacja jest niszowa i mało kto o niej wie, więc realne prawdopodobieństwo jest niewielkie. Ale zabezpieczenie polegające na tym, że „nikt nie wie, że to tu jest”, przestaje działać w momencie, w którym ktoś się dowie.

**Dobra wiadomość:** dwie najgroźniejsze rzeczy da się usunąć szybko i bez ruszania kodu aplikacji — wystarczy zmiana samych reguł dostępu. Pełne zabezpieczenie (prawdziwe konta dla graczy) to osobny, większy projekt, który spokojnie może poczekać.

---

## 11. Pytania doprecyzowujące (prostym językiem)

> **STATUS: pytania 1–6 mają odpowiedź lub zostały rozstrzygnięte decyzjami z sekcji 12.** Nowe pytania są w **pkt 12.7**.

**Pytanie 1 — czy mam przygotować gotowe reguły do wklejenia?**
Mogę napisać komplet nowych reguł dostępu w takiej postaci, że wystarczy je Panu wkleić w Firebase Console (zakładka Firestore → Rules) i kliknąć „Publikuj”. To zmiana wyłącznie po stronie Google, **bez dotykania kodu aplikacji** — i w razie czego cofa się jednym kliknięciem, bo Firebase trzyma historię poprzednich wersji reguł.
*Domyślnie: tak, przygotowuję wariant minimalny (krok 1 i 2 z pkt 8) i opisuję, co dokładnie się zmieni.*

**Pytanie 2 — jak daleko chce Pan pójść?**
- **(a) Tylko najpilniejsze łaty** — zablokować podmianę hasła admina, schować PIN-y, włączyć kopie zapasowe. Szybko, bez zmian w aplikacji.
- **(b) Łaty + logowanie anonimowe** — dodatkowo baza przestaje odpowiadać dowolnemu programowi z internetu. Wymaga drobnej zmiany w kodzie.
- **(c) Docelowo prawdziwe konta dla graczy** — najwięcej pracy, ale wtedy problem znika naprawdę.
*Domyślnie: **(a) teraz**, a (b) i (c) jako osobne tematy do zaplanowania.*

**Pytanie 3 — czy mogę przeprowadzić kontrolowany test zapisu?**
Potwierdziłem odczyt, ale zapisu celowo nie testowałem, żeby nie ruszać Pana danych. Gdyby chciał Pan mieć pewność co do zapisu, mogę wykonać jeden zapis do specjalnie utworzonej, nieużywanej nazwy kolekcji i natychmiast go skasować — nic z tego nie pojawi się w aplikacji.
*Domyślnie: **nie robię tego** bez wyraźnej zgody.*

**Pytanie 4 — czy PIN-y graczy trzeba wymienić?**
Jeżeli ktoś kiedykolwiek pobrał listę graczy, zna wszystkie PIN-y. Nie da się sprawdzić, czy tak się stało.
*Domyślnie: proponuję wymienić PIN-y przy okazji zabezpieczania — jest do tego przycisk **Losuj** przy każdym graczu, więc to kwestia kilku kliknięć. Sam PIN administratora warto zmienić niezależnie.*

**Pytanie 5 — czy repozytorium ma pozostać publiczne?**
`CuteLittleGoat/Karty` jest dziś publiczne. Nie to jest przyczyną problemu (patrz pkt 6), ale publiczne repozytorium pokazuje przy okazji strukturę bazy i ułatwia znalezienie projektu. Przy okazji: **ten dokument też jest publiczny.**
- **(a)** Zmienić repozytorium na prywatne — zmiana jednym kliknięciem w ustawieniach GitHuba, nie wpływa na działanie aplikacji, o ile nie korzysta Pan z GitHub Pages do jej publikowania (a wygląda na to, że GitHub Pages jest tu włączony — to trzeba sprawdzić przed zmianą).
- **(b)** Zostawić publiczne, ale trzymać analizy bezpieczeństwa poza repozytorium.
- **(c)** Zostawić wszystko jak jest.
*Domyślnie: nic nie zmieniam bez Pana decyzji — samo ustawienie repozytorium na prywatne mogłoby wyłączyć stronę, jeśli jest publikowana przez GitHub Pages.*

**Pytanie 6 — czy włączyć kopie zapasowe bazy?**
Dziś nie ma żadnej kopii danych. Skasowanie — przypadkowe albo celowe — byłoby nieodwracalne. Firestore ma wbudowane automatyczne kopie, ale wymagają one planu płatnego (Blaze). Alternatywa bezkosztowa to ręczny eksport danych co jakiś czas.
*Domyślnie: rekomenduję włączyć, ale najpierw musi Pan zdecydować, czy projekt jest na planie darmowym czy płatnym — to zmienia dostępne opcje.*

---

## 12. Uzupełnienie: decyzje użytkownika i analiza kopii zapasowej (2026-09-07)

### 12.1. Prompt użytkownika (zachowany dla kontekstu)

> Mam uzupełnienie do analizy Analizy/Bezpieczenstwo_Firestore_2026-09-07.md
>
> 1. Nie chcę loginów i haseł dla użytkowników. Użytkownikami zarządza admin. On nadaje nazwy, role i PIN. Tak zostaje.
> 2. Opcja C - App Check wydaje się być tutaj rozsądna.
> 3. Hasło admina celowo jest w taki sposób zrobione. Nie zmieniamy tego.
> 4. Pytanie: Czy da się zrobić jakoś eksport aktualnego stanu bazy Firebase? Jakiś przycisk po stronie admina, który by robił backup wszystkiego a potem dało się z jednego pliku ponownie zaimportować wszystkie dane? Jeżeli tak to zapisany plik powinien mieć format:
> Karty_Backup_[data]_[godzina].[rozszerzenie]
>
> Ogólnie chcę zabezpieczyć bazę przed przypadkowym skasowaniem danych. Nie mam w planach robić pełnego zabezpieczenia aplikacji. Obecne wystarczą, czyli:
> 1. Panel admina ma inny link
> 2. Panel admina wymaga hasła
> 3. Admin nadaje uprawnienia i PIN graczom
> 4. Bez podania PIN gracz nic nie może edytować.
>
> Rozumiem, że to nie są profesjonalne zabezpieczenia, ale do amatorskiej aplikacji do użytku dla ok 30 osób wystarczy.

### 12.2. Przyjęte założenia

Decyzje są jasne i przyjmuję je jako ramy dalszych prac:

| Ustalenie | Status |
|---|---|
| Bez loginów i haseł dla graczy — admin nadaje nazwy, role i PIN | ✅ zostaje, opcja B odpada |
| Mechanizm hasła administratora | ✅ zostaje bez zmian |
| App Check (opcja C) | ✅ do wdrożenia |
| Cel nadrzędny | ochrona przed **przypadkowym skasowaniem danych** |
| Poziom zabezpieczeń | świadomie amatorski, ~30 znajomych osób |

To jest rozsądny wybór dla tego zastosowania i nie zamierzam go podważać. Model zagrożeń dla aplikacji dla trzydziestu znajomych to przede wszystkim **własna pomyłka**, a nie atak — i dokładnie to adresuje kopia zapasowa.

Poniżej trzy sprostowania, bo część moich wcześniejszych rekomendacji przy tych założeniach traci sens albo wymaga doprecyzowania.

#### Sprostowanie 1 — moja rekomendacja „wyprowadzić PIN-y z dokumentu czytanego przez wszystkich” **nie zadziała**

W pkt 7 (opcja E.1) proponowałem oddzielenie PIN-ów od listy graczy. **Przy przyjętym modelu to nic nie da** i wycofuję tę rekomendację.

Powód: PIN jest sprawdzany **w przeglądarce** — aplikacja pobiera całą listę graczy z PIN-ami i dopasowuje wpisany kod lokalnie (`adminPlayersState.playerByPin`). Żeby to działało bez logowania, dokument z PIN-ami **musi** być czytelny dla każdego. Przeniesienie go w inne miejsce niczego nie ukrywa — po prostu przeniesie problem.

Ukrycie PIN-ów wymagałoby sprawdzania ich po stronie serwera (Cloud Functions, plan płatny) albo prawdziwych kont — a jedno i drugie zostało świadomie odrzucone. Zatem: **PIN-y pozostają odczytywalne i trzeba to przyjąć do wiadomości.** App Check to ogranicza (patrz niżej), ale nie usuwa.

#### Sprostowanie 2 — zablokowanie zapisu do `admin_security` **nie zmienia mechanizmu hasła**

Zaznaczył Pan, że hasło admina zostaje jak jest. To ustalenie **nie koliduje** z moją rekomendacją, bo ona nie dotyczy mechanizmu, tylko uprawnień do zapisu w regułach.

Sprawdziłem to w kodzie: kolekcja `admin_security` jest w obu modułach używana **wyłącznie do odczytu** — `Main/app.js:809-813` i `Second/app.js:186-190` wykonują tylko `.get()`. **Nigdzie w aplikacji nie ma zapisu do tej kolekcji.**

Wniosek: zmiana reguły z `allow read, write` na sam `allow read` **niczego w aplikacji nie zepsuje** — hasło i tak ustawia się z Firebase Console. Kod pozostaje nietknięty, sposób sprawdzania hasła pozostaje nietknięty, znika natomiast możliwość podmiany skrótu przez osobę z zewnątrz. To zmiana wyłącznie w regułach, cofalna jednym kliknięciem.

Decyzja należy do Pana — odnotowuję tylko, że to nie jest to samo co „zmiana hasła admina” i że koszt tej zmiany wynosi zero.

#### Sprostowanie 3 — czego App Check **nie** robi

Żeby nie było rozczarowania po wdrożeniu: App Check sprawdza, że żądanie pochodzi **z Pana aplikacji**, a nie kim jest użytkownik. Dlatego:
- ✅ odcina obce skrypty, automaty i przypadkowe skanowanie internetu,
- ✅ realnie utrudnia pobranie listy PIN-ów spoza aplikacji — i to jest tu główna korzyść,
- ❌ **nie chroni przed osobą, która normalnie korzysta z aplikacji** — jej przeglądarka ma ważny token, więc może przez narzędzia deweloperskie sięgnąć po te same dane co aplikacja,
- ❌ **nie chroni przed pomyłką administratora** — a to jest Pana główne zmartwienie i odpowiada na nie wyłącznie kopia zapasowa.

Przy modelu „30 znajomych osób” to jest jednak dobry stosunek efektu do nakładu: bariera dla świata zewnętrznego kosztuje niewiele, a wewnątrz grupy i tak opieramy się na zaufaniu.

### 12.3. App Check — jak to wygląda w praktyce

**Co trzeba zrobić:**
1. W Firebase Console zarejestrować aplikację webową w App Check i wybrać dostawcę **reCAPTCHA v3** (bezpłatny; wariant „Enterprise” jest płatny i tu niepotrzebny).
2. Dodać do `Main/index.html` i `Second/index.html` bibliotekę App Check oraz kilka linii inicjalizacji obok istniejącej konfiguracji Firebase.
3. W Console włączyć **wymuszanie** (enforcement) dla Firestore.

**Ważna kolejność.** Firebase pozwala najpierw uruchomić App Check w trybie **samego monitorowania** — zbiera statystyki, ale niczego nie blokuje. Zdecydowanie radzę tak zacząć i włączyć wymuszanie dopiero, gdy w Console widać, że praktycznie cały ruch jest już „zweryfikowany”. Włączenie wymuszania od razu grozi tym, że aplikacja przestanie działać wszystkim naraz — a przy PWA część osób ma zapisaną starą wersję i dostanie nową dopiero po odświeżeniu.

**Rzeczy, o których łatwo zapomnieć:**
- App Check trzeba dodać do **obu modułów** — dzielą jeden projekt Firebase, więc pominięcie jednego zablokuje go po włączeniu wymuszania.
- Do pracy lokalnej (otwieranie plików z dysku) potrzebny jest **token debugowania**, inaczej aplikacja nie połączy się z bazą podczas testów.
- Trzeba dodać domenę, z której działa aplikacja (GitHub Pages), do listy dozwolonych w reCAPTCHA.
- Po włączeniu wymuszania **każde** narzędzie spoza aplikacji przestanie działać — łącznie z ewentualnymi własnymi skryptami pomocniczymi.

---

### 12.4. Kopia zapasowa i przywracanie — analiza wykonalności

#### Odpowiedź krótka

**Tak, da się to zrobić w całości po stronie aplikacji**, bez planu płatnego i bez serwera. Przycisk w panelu admina pobiera całą bazę i zapisuje ją jako **jeden plik JSON**; drugi przycisk wczytuje ten plik z powrotem. Poniżej szczegóły i pułapki — jest ich kilka i część jest istotna.

#### Dlaczego trzeba to napisać samemu

Firebase ma wbudowany eksport i import bazy, ale wymaga on **planu płatnego Blaze** (eksport idzie do Cloud Storage i jest rozliczany za operacje). To samo dotyczy automatycznych kopii i odtwarzania stanu z przeszłości (PITR). Na planie darmowym **własny przycisk jest jedyną bezpłatną drogą** — Pana pomysł jest więc trafiony.

#### Jak działa eksport

**Kluczowe ograniczenie:** biblioteka Firebase działająca w przeglądarce **nie potrafi zapytać bazy „jakie masz kolekcje?”**. Ta możliwość istnieje tylko w bibliotece serwerowej. W praktyce oznacza to, że **lista kolekcji do wyeksportowania musi być zapisana w kodzie**.

Konsekwencja, o której trzeba pamiętać na przyszłość: **jeżeli kiedyś dojdzie nowa kolekcja i nikt nie dopisze jej do tej listy, nie znajdzie się w kopii — po cichu.** Dlatego proponuję dwa zabezpieczenia: listę budować na podstawie pliku reguł (`Wazne_Rules.txt`, który jest naturalnym spisem wszystkiego, co istnieje), a po wykonaniu kopii pokazywać administratorowi podsumowanie „co zapisano i ile dokumentów” — wtedy brak kolekcji rzuca się w oczy.

**Podkolekcje.** Gry mają zagnieżdżone dane (`Tables/{gra}/rows`, `Tables/{gra}/confirmations` i analogicznie dla pozostałych). Tu również nie da się ich „odkryć” — trzeba dla każdej gry osobno pobrać jej podkolekcje po znanych nazwach. Przy kilkudziesięciu grach to kilkadziesiąt dodatkowych zapytań; przy tej skali bez znaczenia.

Istnieje szybszy sposób (jedno zapytanie po wszystkich podkolekcjach o danej nazwie naraz), ale **wymagałby zmiany reguł** — obecne reguły są przypisane do konkretnych ścieżek i takiego zapytania nie przepuszczą. Rekomenduję wariant wolniejszy, który działa na regułach bez żadnych zmian.

#### Format pliku — jedna pułapka, która musi być obsłużona

**Daty.** W bazie pola takie jak `createdAt` nie są tekstem, tylko specjalnym typem „znacznik czasu”. Zwykły zapis do JSON zamieni je w zwykły obiekt z liczbami, a przy wczytywaniu z powrotem wrócą jako zwykłe liczby — **nie jako daty**.

To nie jest drobiazg. Aplikacja sortuje gry i wiersze właśnie po `createdAt` (`orderBy("createdAt")` oraz `createdAt.toMillis()`). Po nieostrożnym przywróceniu **sortowanie przestałoby działać, a część list mogłaby się nie wyświetlić** — i to bez żadnego komunikatu błędu, co jest najgorszym rodzajem awarii.

Rozwiązanie: przy zapisie oznaczać takie pola specjalnym znacznikiem typu, a przy wczytywaniu odtwarzać je z powrotem jako prawdziwe daty. Eksporter powinien też **zgłosić**, gdyby natrafił na typ, którego nie zna — lepiej dostać ostrzeżenie niż cichą utratę danych.

**Nazwa pliku** zgodnie z Pana specyfikacją: `Karty_Backup_[data]_[godzina].[rozszerzenie]`, czyli na przykład:

`Karty_Backup_2026-09-07_14-32-05.json`

W godzinie używam myślników zamiast dwukropków, bo Windows nie dopuszcza dwukropka w nazwie pliku. Rozszerzenie proponuję `.json` — plik jest wtedy czytelny, można go obejrzeć w notatniku i porównać dwie kopie między sobą.

#### 🔴 Plik kopii zawiera wszystkie sekrety

Rzecz najważniejsza do zapamiętania: **plik z kopią zapasową zawiera komplet PIN-ów graczy otwartym tekstem, a także skrót hasła administratora i całą historię czatu.**

Wynika z tego kilka praktycznych zasad:
- pliku kopii **nie wolno wrzucić do repozytorium** ani nigdzie, gdzie jest publiczny — to byłoby gorsze niż obecny stan bazy,
- warto trzymać go w miejscu prywatnym (dysk lokalny, prywatny dysk w chmurze),
- gdyby to miało być problemem, mogę dodać przełącznik „pomiń dane logowania” — kopia będzie wtedy bezpieczniejsza w przechowywaniu, ale przywrócenie nie odtworzy PIN-ów.

#### Jak działa przywracanie — i dlaczego to jest groźniejsze niż eksport

Eksport tylko czyta i nic nie psuje. Import **nadpisuje bazę**, więc wymaga zabezpieczeń.

**Dwa tryby, obydwa potrzebne:**

| Tryb | Co robi | Kiedy przydatny |
|---|---|---|
| **Uzupełniający** (rekomendowany domyślnie) | wpisuje dokumenty z pliku, nie kasując niczego, co powstało później | odzyskanie **przypadkowo skasowanych** danych — czyli Pana główny scenariusz |
| **Zastępujący** | najpierw czyści, potem wgrywa — baza wraca dokładnie do stanu z pliku | gdy dane zostały **zepsute**, a nie skasowane, i trzeba się cofnąć w czasie |

Tryb uzupełniający jest bezpieczniejszy i w większości sytuacji wystarczy — dlatego proponuję go jako domyślny, a tryb zastępujący schować za dodatkowym potwierdzeniem.

**Zabezpieczenia, które uważam za obowiązkowe:**
1. **Automatyczna kopia przed przywracaniem.** Zanim import cokolwiek zmieni, aplikacja pobiera bieżący stan na dysk. Dzięki temu nieudane przywrócenie samo w sobie da się cofnąć. To najważniejsze z tych zabezpieczeń.
2. **Podgląd przed wykonaniem.** Po wybraniu pliku pokazać: z kiedy pochodzi, ile kolekcji i dokumentów zawiera — i dopiero wtedy pytać o zgodę.
3. **Potwierdzenie przez wpisanie słowa**, nie samo „OK”. Przy trybie zastępującym to konieczne.
4. **Sprawdzenie pliku przed startem.** Zły albo uszkodzony plik ma zostać odrzucony, zanim cokolwiek zapisze — a nie w połowie pracy.

**Trzy pułapki techniczne przy imporcie:**

1. **Kolizja z istniejącym zabezpieczeniem przed kasowaniem.** Aplikacja ma już mechanizm (`installFirestoreDeleteProtection`), który blokuje usunięcie **ostatniego** dokumentu w kolekcji głównej. Tryb zastępujący, który najpierw czyści kolekcje, **uderzy w ten mechanizm i przerwie się w połowie** — zostawiając bazę w stanie częściowo wyczyszczonym. Import musi ten mechanizm świadomie omijać albo czyścić w innej kolejności (najpierw wgrać nowe, potem skasować nadmiarowe stare). Bez tego tryb zastępujący jest niebezpieczny.
2. **Limit paczki zapisu.** Jednorazowo można zapisać 500 operacji, więc przywracanie musi iść porcjami z pokazywaniem postępu.
3. **Aplikacja otwarta w innych oknach.** Wszystko nasłuchuje zmian na żywo, więc import wywoła lawinę odświeżeń u każdego, kto ma otwartą aplikację. Radzę robić to przy zamkniętych pozostałych kartach i najlepiej wtedy, gdy nikt nie gra.

#### Skala, koszt i wydajność

Kopia to jeden odczyt na dokument, przywracanie — jeden zapis. Przy tej aplikacji (kilkadziesiąt gier, kilkanaście osób, czat czyszczony po 30 dniach) mówimy o rzędzie **tysięcy operacji**, a darmowy plan daje 50 000 odczytów i 20 000 zapisów **dziennie**. Codzienna kopia nie zbliży się do limitu. Plik powinien mieć **poniżej kilku megabajtów**.

Jedna uwaga praktyczna: aplikacja jest instalowana jako PWA, a pobieranie plików z aplikacji uruchomionej „jak apka” (zwłaszcza na iPhonie) bywa kapryśne. **Radzę robić kopie z komputera, z normalnej przeglądarki.**

#### Co już działa, a czego nie obejmuje

Warto wiedzieć, że pewna ochrona przed skasowaniem **już istnieje**: opisany wyżej mechanizm blokuje usunięcie ostatniego dokumentu w kolekcji głównej, więc nie da się przez aplikację całkiem opróżnić np. listy gier.

Ale jego zasięg jest wąski:
- ❌ nie chroni **podkolekcji** — wiersze gry (`rows`) i potwierdzenia można skasować co do jednego,
- ❌ nie chroni przed skasowaniem **prawie** wszystkiego (blokuje wyłącznie ostatni dokument),
- ❌ działa **tylko w przeglądarce** — nie obowiązuje przy kasowaniu z Firebase Console ani spoza aplikacji,
- ❌ nie chroni przed **nadpisaniem** danych błędnymi wartościami.

Czyli: pożyteczny bezpiecznik, ale kopia zapasowa i tak jest potrzebna.

#### Proponowany zakres pierwszej wersji

Żeby nie rozdmuchać tego ponad potrzebę, proponuję zacząć od:
1. przycisku **Kopia zapasowa** w panelu admina → pobiera plik `Karty_Backup_[data]_[godzina].json`,
2. podsumowania po wykonaniu (co zapisano, ile dokumentów) — żeby braki było widać,
3. przycisku **Przywróć z pliku** działającego w **trybie uzupełniającym**, z automatyczną kopią bezpieczeństwa przed startem i podglądem zawartości pliku,
4. trybu zastępującego dołożonego w drugiej kolejności, gdy pierwsza wersja się sprawdzi.

To pokrywa scenariusz „skasowałem coś przez pomyłkę” — czyli dokładnie to, o co Panu chodzi.

---

### 12.5. Co z tego wynika dla planu prac

Zmiany związane z bezpieczeństwem są **niezależne** od uzgodnionych poprawek funkcjonalnych z `Analizy/Uwagi_2026-09-03.md` i nie kolidują z nimi.

Jeden punkt styku: kopia zapasowa dotyka **wszystkich** kolekcji, także tych z modułu Second. Przycisk musi więc gdzieś „mieszkać” — patrz pytanie **4** niżej.

### 12.6. Zaktualizowana kolejność

| Krok | Co | Nakład | Uwaga |
|---|---|---|---|
| 1 | **Przycisk kopii zapasowej** (sam eksport) | średni | rozwiązuje główne zmartwienie; nic nie ryzykuje, bo tylko czyta |
| 2 | **Przywracanie w trybie uzupełniającym** + kopia bezpieczeństwa przed startem | średni | dopiero to zamyka temat odzyskiwania |
| 3 | **App Check** — najpierw monitorowanie, potem wymuszanie | mały | zgodnie z decyzją |
| 4 | *(do decyzji)* zablokowanie zapisu do `admin_security` w regułach | zerowy | sama reguła, kod nietknięty |
| 5 | **Tryb zastępujący** przy przywracaniu | średni | dopiero gdy krok 2 się sprawdzi |

### 12.7. Pytania (prostym językiem)

**Pytanie 1 — jedna kopia dla obu modułów czy dwie osobne?**
Moduły „Main” i „Tournament of Poker” korzystają z jednej bazy, ale mają rozdzielone dane.
- **(a)** Jeden przycisk i jeden plik z **wszystkim** — prościej i nie da się o niczym zapomnieć.
- **(b)** Osobna kopia dla każdego modułu — mniejsze pliki, można przywrócić jeden moduł bez ruszania drugiego.
*Domyślnie: **(a)** — jeden plik ze wszystkim. Pan prosił o „backup wszystkiego”, a przy przywracaniu i tak można wybrać, co wgrać.*

**Pytanie 2 — czy kopia ma zawierać PIN-y i hasło admina?**
Jeśli tak, plik odtworzy stan w stu procentach — ale sam staje się wrażliwy i trzeba go trzymać w bezpiecznym miejscu. Jeśli nie, plik jest bezpieczniejszy, ale po przywróceniu trzeba by nadać PIN-y na nowo.
*Domyślnie: **zawiera wszystko**, a ja dodaję w aplikacji wyraźne ostrzeżenie, żeby nie wrzucać tego pliku w miejsce publiczne.*

**Pytanie 3 — gdzie ma być przycisk?**
W panelu admina jest jedenaście zakładek. Kopia zapasowa nie pasuje do żadnej z nich.
- **(a)** Nowa zakładka, np. **Kopia zapasowa**.
- **(b)** Przy przycisku **Odśwież** w górnym pasku panelu.
- **(c)** W istniejącej zakładce (np. Notatki).
*Domyślnie: **(a)** — osobna zakładka. Przywracanie danych to operacja, która zasługuje na własne miejsce z ostrzeżeniami, a nie na przycisk wciśnięty obok innych.*

**Pytanie 4 — czy przycisk ma być w obu modułach, czy tylko w „Main”?**
*Domyślnie: **tylko w „Main”**, ale kopia obejmuje dane obu modułów. Dwa przyciski robiące to samo w dwóch miejscach to proszenie się o pomyłkę.*

**Pytanie 5 — czy przypominać o robieniu kopii?**
Przycisk pomaga tylko wtedy, gdy się go używa. Aplikacja może zapamiętać datę ostatniej kopii i po jakimś czasie wyświetlić przypomnienie.
*Domyślnie: tak, delikatna informacja w panelu admina w stylu „ostatnia kopia: 12 dni temu”, bez nachalnych okien.*

**Pytanie 6 — czy zablokować zapis do `admin_security`?**
Sprawdziłem: aplikacja **nigdy** tam nie pisze, więc ta zmiana nie dotyka mechanizmu hasła ani kodu (patrz sprostowanie 2 w pkt 12.2). Zabiera tylko możliwość podmiany skrótu hasła przez osobę z zewnątrz.
*Domyślnie: rekomenduję zrobić, bo kosztuje zero i nic nie psuje — ale to zmiana w regułach, więc wykonuje ją Pan w Firebase Console. Czekam na decyzję.*

**Pytanie 7 — czy plan projektu jest darmowy (Spark) czy płatny (Blaze)?**
Od tego zależy, czy w ogóle wchodzą w grę wbudowane, automatyczne kopie Firebase — byłyby wygodniejsze od przycisku, bo działają same, bez pamiętania o klikaniu.
*Domyślnie: zakładam plan darmowy i dlatego proponuję rozwiązanie własne. Jeśli projekt jest już na Blaze, warto najpierw sprawdzić wbudowane kopie — mogą okazać się tańsze w utrzymaniu niż własny kod.*

---

## 13. Umiejscowienie w planie prac: to jest ostatni etap (2026-09-07)

### 13.1. Prompt użytkownika (zachowany dla kontekstu)

> Do kwestii bezpieczeństwa wrócimy potem w innej rozmowie. Tymczasem wgrałem nowy plik Analizy/pop4.docx z odpowiedziami na pytania. Zaktualizuj Analizy/Bezpieczenstwo_Firestore_2026-09-07.md - dopisz do niego też, że ostatnim etapem poprawek ma być kontynuacja problemu z naprawą bezpieczeństwa opisanego w Analizy/Bezpieczenstwo_Firestore_2026-09-07.md - czy mamy już wszystko gotowe i uzgodnione, żeby wykonać pierwszy etap (czyli wszystko do bezpieczeństwa firestore)?

### 13.2. Ustalenie kolejności

**Prace opisane w tym dokumencie są ostatnim etapem poprawek.** Realizowane są dopiero po zakończeniu wszystkich zmian funkcjonalnych uzgodnionych w `Analizy/Uwagi_2026-09-03.md` (etapy 1–3: naprawy błędów, zmiany działania, import gier użytkowników).

Kolejność całości:

| Etap | Zakres | Dokument |
|---|---|---|
| 1 | Naprawy błędów (przyciski „Waga”, nazwy graczy, utrata fokusu) | `Uwagi_2026-09-03.md`, pkt 16.8 |
| 2 | Zmiany działania (`CzyZamknięta`, numeracja potwierdzeń, eksport XLSX, usterki dodatkowe) | `Uwagi_2026-09-03.md`, pkt 16.8 |
| 3 | Import gier użytkowników do „Gry admina” | `Uwagi_2026-09-03.md`, pkt 16.8 |
| **4** | **Bezpieczeństwo Firestore: kopia zapasowa, przywracanie, App Check** | **ten dokument, pkt 12.6** |

Uzasadnienie takiej kolejności jest praktyczne: zmiany funkcjonalne dotykają wielu miejsc w kodzie, a kopia zapasowa musi obejmować **finalną** strukturę danych. Zbudowanie jej wcześniej oznaczałoby poprawianie listy kolekcji i kształtu pliku po każdej kolejnej zmianie.

Jest tu jednak jedno napięcie i uczciwie je odnotowuję: **przez cały czas trwania etapów 1–3 nie ma żadnej kopii zapasowej danych.** Etap 2 zmienia sposób liczenia statystyk, a etap 3 zapisuje nowe dokumenty do kolekcji `Tables` — czyli akurat wtedy ryzyko pomyłki jest wyższe niż zwykle. Możliwe podejścia:

- **(a)** Trzymać się ustalonej kolejności i przed etapem 2 wykonać **jednorazowy ręczny eksport** z Firebase Console (Console pozwala pobrać dane bez pisania kodu, choć jest to żmudne przy wielu kolekcjach).
- **(b)** Przesunąć **sam eksport** (bez przywracania) przed etap 2 — to około jednej trzeciej pracy z etapu 4, a daje siatkę bezpieczeństwa na czas pozostałych zmian.

*Rekomendacja: **(b)**, jeżeli zależy Panu na spokoju w trakcie prac. Sam przycisk „Kopia zapasowa” tylko czyta dane, więc niczego nie może zepsuć, a od tego momentu każda kolejna zmiana jest odwracalna. Jeśli woli Pan trzymać się prostego podziału — wariant (a) też jest w porządku, tylko wymaga pamiętania o ręcznym eksporcie przed etapem 2.*

### 13.3. Status pytań z pkt 12.7

Plik `pop4.docx` (2026-09-07) zawiera odpowiedzi wyłącznie na pytania **M, N, O, P** z `Analizy/Uwagi_2026-09-03.md`. **Pytania 1–7 z pkt 12.7 tego dokumentu pozostają bez odpowiedzi** — i na tym etapie nie muszą jej mieć, skoro prace nad bezpieczeństwem są ostatnie.

Do rozstrzygnięcia przed rozpoczęciem etapu 4:

| # | Pytanie | Odpowiedź domyślna |
|---|---|---|
| 1 | Czy przygotować gotowe reguły do wklejenia? | tak, wariant minimalny |
| 2 | Jak daleko iść z zabezpieczeniami? | (a) tylko najpilniejsze łaty |
| 3 | Kontrolowany test zapisu? | nie, bez wyraźnej zgody |
| 4 | Wymienić PIN-y graczy? | tak, przy okazji zabezpieczania |
| 5 | Repozytorium publiczne czy prywatne? | bez zmian do decyzji |
| 6 | Zablokować zapis do `admin_security`? | rekomendowane — zero kosztu, kod nietknięty |
| 7 | Plan Spark czy Blaze? | zakładam Spark |

Z tej listy **pytanie 7 warto rozstrzygnąć najwcześniej**, bo jako jedyne może zmienić sam kierunek prac: jeżeli projekt jest już na planie płatnym Blaze, wbudowane automatyczne kopie Firebase mogą się okazać wygodniejsze i tańsze w utrzymaniu niż pisany od zera przycisk — a wtedy większość etapu 4 sprowadza się do konfiguracji zamiast do kodu.

### 13.4. Wpływ ustaleń z `pop4.docx` na ten dokument

Dwie odpowiedzi z `pop4.docx` mają znaczenie dla zakresu kopii zapasowej:

- **Odpowiedź P** (gry admina pozostają odseparowane od potwierdzeń) — bez wpływu na kopię zapasową. Struktura kolekcji się nie zmienia.
- **Odpowiedź N** (import aktualizuje istniejącą kopię gry zamiast tworzyć nową) — bez wpływu na liczbę kolekcji, ale dochodzą nowe pola w dokumentach gier w kolekcji `Tables` (znacznik gry źródłowej i data ostatniego odświeżenia). Eksport obejmuje całe dokumenty, więc nowe pola trafią do kopii automatycznie — **nie wymaga to zmian w projekcie kopii zapasowej**.

Potwierdza to zasadność kolejności z pkt 13.2: kopia zapasowa budowana po etapie 3 obejmie od razu finalny kształt danych.

---

## 14. Odpowiedzi na pytania z pkt 12.7 i realizacja etapu 4 (2026-09-07)

### 14.1. Prompt użytkownika (zachowany dla kontekstu)

> Odpowiedzi na pytania z pkt 12.7. Analizy/Bezpieczenstwo_Firestore_2026-09-07.md
>
> 1. Wariant a.
> 2. Tak. Kopia ma zawierać PINy, hasło admina i wszystko.
> 3. Zgoda na nową zakładkę. Tam też możesz zapisać instrukcję krok-po-kroku co i gdzie klikać, żeby zrobić backup danych oraz, żeby przywrócić dane z pliku json. Treść może być w polu podobnym jak "Regulamin", ale bez możliwości edycji przez admina.
> 4. Zgoda. Tylko w Main.
> 5. Zgoda. W nowej zakładce obok przycisku informacja o dacie ostatniego użycia przycisku.
> 6. Zgoda. Blokujemy.
> 7. Tylko plan darmowy.

### 14.2. Odpowiedzi

| # | Pytanie | Odpowiedź |
|---|---|---|
| 1 | Jedna kopia dla obu modułów czy dwie osobne? | **(a)** jeden plik ze wszystkim |
| 2 | Czy kopia ma zawierać PIN-y i hasło admina? | **Tak, wszystko** |
| 3 | Gdzie ma być przycisk? | **(a)** nowa zakładka + instrukcja krok po kroku w polu tylko do odczytu |
| 4 | W obu modułach czy tylko w Main? | **Tylko w Main** |
| 5 | Czy przypominać o robieniu kopii? | **Tak** — data ostatniego użycia obok przycisku |
| 6 | Zablokować zapis do `admin_security`? | **Tak, blokujemy** |
| 7 | Plan Spark czy Blaze? | **Tylko darmowy (Spark)** |

**Potwierdzenie do pytania 7.** Plan darmowy przesądza sprawę: wbudowany eksport/import Firestore oraz automatyczne kopie (PITR) wymagają planu Blaze, więc własny przycisk pozostaje jedyną dostępną drogą. Rozwiązanie zbudowane w tym etapie jest w całości klienckie.

### 14.3. Konflikt między odpowiedzią 2 a 6 — i jak został rozwiązany

Odpowiedzi 2 i 6 nie dają się spełnić dosłownie naraz. Skoro **zapis do `admin_security` jest zablokowany regułami**, to przywracanie nie może wpisać hasła administratora z powrotem — Firestore odrzuci taką operację.

Rozwiązanie, które spełnia obie odpowiedzi bez utraty danych:

- **kopia zawiera wszystko**, łącznie z zapisem hasła administratora (odpowiedź 2) — nic nie jest tracone,
- **przywracanie pomija kolekcję `admin_security`** i raportuje, ile dokumentów pominięto,
- hasło odtwarza się ręcznie: odczytuje się je z pliku kopii (sekcja `admin_security`) i wpisuje w Firebase Console.

Jest to zapisane w instrukcji widocznej w aplikacji oraz w `Main/docs/README.md`.

### 14.4. Co zostało zrobione

**Zakładka „Kopia zapasowa”** (`initAdminBackup`, `#adminBackupTab`) — tylko w module Main, obejmuje dane **obu** modułów:
- przycisk **Utwórz kopię zapasową** → plik `Karty_Backup_[RRRR-MM-DD]_[GG-MM-SS].json`,
- przycisk **Przywróć z pliku**,
- przy każdym przycisku data ostatniego użycia, wspólna dla wszystkich urządzeń (`app_settings/backup_state`, pola `lastBackupAt` i `lastRestoreAt`),
- pole **Instrukcja** — tekst krok po kroku, `readonly`, wyglądem zbliżone do pola „Regulamin”.

**Zakres kopii:** deklaratywne drzewo `BACKUP_COLLECTION_SCHEMA` odwzorowujące `Wazne_Rules.txt` — kolekcje Main, `Nekrolog_*`, `second_*` wraz z podkolekcjami (`rows`, `confirmations`, pełne zagnieżdżenie kalkulatorów). Ograniczenie odnotowane w pkt 12.4 pozostaje aktualne: biblioteka kliencka nie potrafi wylistować kolekcji, więc **nowa kolekcja niedopisana do drzewa nie trafi do kopii** — po każdej kopii status podaje liczbę dokumentów, co pozwala to zauważyć.

**Format pliku:** płaska lista `{ path, data }` z pełnymi ścieżkami Firestore, dzięki czemu przywracanie sprowadza się do `set` na dokumencie i obsługuje dowolne zagnieżdżenie.

**Konwersja typów:** `encodeBackupValue` / `decodeBackupValue` zamieniają `Timestamp` na `{ __type: "timestamp", seconds, nanoseconds }` i z powrotem. To była najpoważniejsza pułapka z pkt 12.4 — bez niej `createdAt` wróciłby jako zwykły obiekt i **po cichu** przestałoby działać sortowanie gier i wierszy.

**Zabezpieczenia przywracania:** walidacja formatu pliku, podgląd (data pliku, liczba dokumentów, liczba pominiętych), potwierdzenie przez wpisanie słowa `PRZYWROC`, a przede wszystkim **automatyczne pobranie kopii bezpieczeństwa obecnego stanu przed pierwszym zapisem**. Tryb jest uzupełniający — nic nie jest kasowane.

**Reguły Firestore:** `Analizy/Wazne_Rules.txt` zawiera gotowy do wklejenia zestaw z jedyną zmianą `match /admin_security/{docId} { allow read: if true; allow write: if false; }`. Sprawdzono wcześniej, że obie aplikacje tę kolekcję wyłącznie odczytują, więc blokada nie wymaga żadnych zmian w kodzie.

**App Check** — przygotowany, ale nieaktywny:
- oba moduły ładują `firebase-app-check-compat.js`,
- `activateAppCheckIfConfigured` włącza App Check **wyłącznie wtedy**, gdy w `config/firebase-config.js` pojawi się `appCheckSiteKey`; bez klucza nie robi nic,
- opcjonalny `appCheckDebugToken` obsługuje pracę lokalną,
- w pliku konfiguracyjnym znajdują się zakomentowane pola z opisem.

Nie mogłem dokończyć App Check samodzielnie, bo wymaga rejestracji aplikacji w Firebase Console i klucza reCAPTCHA v3, do których nie mam dostępu. Kroki po Pana stronie opisano w pkt 12.3 — **proszę pamiętać o kolejności: najpierw tryb samego monitorowania, wymuszanie dopiero gdy w Console widać, że ruch jest zweryfikowany.** Włączenie wymuszania od razu może odciąć aplikację wszystkim naraz.

### 14.5. Weryfikacja

- `node --check` dla `Main/app.js`, `Second/app.js`, `Main/service-worker.js`, `Main/pwa-bootstrap.js`, `config/firebase-config.js` — bez błędów.
- **11 testów rundy zapis→odczyt** formatu kopii, na funkcjach wyciętych ze źródła: `Timestamp` (także zagnieżdżony) wraca jako `Timestamp` z tą samą wartością i działającym `toMillis`, tablice, liczby, wartości logiczne, `null` i polskie znaki zachowane. Test kontrolny potwierdza, że naiwny zapis do JSON **zgubiłby** znaczniki czasu. Wszystkie zaliczone.
- **Test w przeglądarce:** zakładka i przyciski obecne, instrukcja wypełniona i tylko do odczytu, kliknięcie „Utwórz kopię zapasową” faktycznie pobiera plik o nazwie zgodnej ze wzorcem i o poprawnej strukturze JSON, brak błędów JS.
- **Żaden zapis nie trafił do Firestore** — testy działały na atrapie Firebase, a żądania do `firestore.googleapis.com` były twardo blokowane i zliczane; licznik pozostał zerowy.

### 14.6. Co pozostaje po Pana stronie

1. **Wkleić reguły** z `Analizy/Wazne_Rules.txt` w Firebase Console → Firestore → Rules → Publikuj. Firebase trzyma historię, więc zmiana jest odwracalna jednym kliknięciem.
2. **Zrobić pierwszą kopię zapasową** i sprawdzić, czy plik się pobiera.
3. **Wymienić PIN-y graczy** — jeśli ktoś kiedykolwiek pobrał listę, zna je wszystkie. Przy każdym graczu jest przycisk **Losuj**.
4. **App Check** — zarejestrować aplikację w Console, wkleić klucz do `config/firebase-config.js`, uruchomić najpierw w trybie monitorowania.
5. **Zdecydować o repozytorium** (pytanie 5 z pkt 12.7 pozostaje otwarte) — pamiętając, że GitHub Pages jest tu włączony, więc przełączenie na prywatne może wyłączyć stronę.
