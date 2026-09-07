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
