# Czy cel został zrealizowany? Zapis do bazy tylko przez aplikację (2026-09-20)

## Prompt użytkownika (zachowany dla kontekstu)

> Celem projektu było zabezpieczenie aplikacji w ten sposób, żeby zapis do bazy danych był możliwy
> tylko przez aplikację (przez linki:
> https://cutelittlegoat.github.io/Karty/Main/index.html
> https://cutelittlegoat.github.io/Karty/Main/index.html?admin=1
> https://cutelittlegoat.github.io/Karty/Second/index.html
> https://cutelittlegoat.github.io/Karty/Second/index.html?admin=1).
>
> Po to zaleciłeś mi skonfigurowanie App Check, utworzenie kluczy reCAPTCHA Enterprise i cały ten proces.
>
> Czy to zostało zrealizowane?

---

## 1. Odpowiedź wprost

**Tak — w zakresie, w jakim App Check w ogóle jest w stanie to zrobić. Ale nie dosłownie
„tylko przez te cztery linki”.**

Rozbijam to na dwie części, bo to nie jest odpowiedź wymijająca — to dwie różne rzeczy:

| Kto próbuje zapisać do bazy | Przed App Check | Dziś |
|---|---|---|
| Program, skrypt, `curl`, bot, ktoś kto znalazł projekt na GitHubie — **spoza Pana strony** | ✅ mógł wszystko | ❌ **zablokowany** |
| Ktoś, kto otworzy Pana link w przeglądarce i użyje konsoli (F12) | ✅ mógł wszystko | ✅ **nadal może wszystko** |

**Pierwszy wiersz to było sedno problemu** opisanego w pkt 2 analizy
`Bezpieczenstwo_Firestore_2026-09-07.md`: *„każdy, kto zna adres projektu, może odczytywać
i modyfikować dane”*. Ta dziura jest zamknięta i to jest realne osiągnięcie — aplikacja nie jest
już otwarta dla całego internetu.

**Drugi wiersz pozostał otwarty** i App Check nigdy go nie zamknie. Poniżej dokładnie dlaczego.

---

## 2. Trzy granice, o których trzeba wiedzieć

### 2.1. Klucz chroni **domenę**, a nie cztery konkretne adresy

Klucz reCAPTCHA Enterprise jest związany z domeną `cutelittlegoat.github.io`. reCAPTCHA operuje
na domenach — **nie da się jej zawęzić do konkretnego adresu** typu `/Karty/Main/index.html`.

Praktyczna konsekwencja: gdyby kiedykolwiek opublikował Pan na GitHub Pages **inne repozytorium
tego samego konta**, jego strony znalazłyby się na tej samej domenie i **również mogłyby zapisywać
do tej bazy**. Dziś takiego repozytorium nie ma i nic się nie dzieje, ale warto o tym pamiętać
przy zakładaniu następnego projektu.

*(Sprawdzone: w repozytorium nie ma pliku `CNAME`, więc adres pozostaje pod
`cutelittlegoat.github.io` i nic tu się nie zmieniło.)*

### 2.2. Konsola przeglądarki (F12) otwarta na Pana stronie

Kto otworzy jeden z tych czterech linków, **ma w ręku ważny token App Check** — bo zapytanie
naprawdę wychodzi z Pana aplikacji, z Pana domeny. Reguły przepuszczają wszystko
(`allow read, write: if true`), więc z konsoli przeglądarki można zapisać, zmienić i skasować
dowolne dane.

**App Check tego nie widzi i nigdy nie zobaczy.** On sprawdza, **skąd** przyszło zapytanie —
a nie **kto** je wysłał ani czy przeszło przez przyciski aplikacji. Z jego punktu widzenia
kliknięcie w przycisk i polecenie wpisane w konsoli są identyczne.

**Panel administratora nie jest tu przeszkodą.** Hasło admina jest sprawdzane **w przeglądarce**
(`Main/app.js`, `getAdminPasswordHash` — aplikacja pobiera skrót hasła z bazy i porównuje go
lokalnie). Ktoś działający z konsoli w ogóle nie musi przez ten panel przechodzić.

### 2.3. Skopiowany token działa przez dobę

To **nie jest osobna dziura**, tylko przedłużenie punktu 2.2. Kto ma otwartą Pana stronę, może
wyjąć token z zakładki *Network* w narzędziach przeglądarki i używać go z zewnętrznego skryptu
przez cały czas jego ważności — u nas **24 godziny**, bo taki TTL ustawiliśmy dla oszczędzania
darmowego limitu.

Firestore **nie obsługuje tokenów jednorazowych** (to funkcja dostępna wyłącznie dla Cloud
Functions i własnych serwerów), więc nie da się tego wyłączyć. Gdyby kiedyś miało to znaczenie,
TTL można skrócić do 30 minut — kosztem ok. 4 000 sprawdzeń miesięcznie zamiast ok. 1 500,
nadal mieszcząc się w limicie 10 000. **Dziś nie widzę powodu, żeby to robić.**

---

## 3. Czy App Check był dobrym wyborem?

**Tak** — przy założeniu „bez logowania graczy, darmowy plan, mało pracy” to było jedyne narzędzie,
które w ogóle adresuje postawiony cel, i zrobiło dokładnie to, co miało zrobić.

**Ale należy się jasne postawienie sprawy:** zdanie *„zapis możliwy tylko przez aplikację”*
w ścisłym rozumieniu — czyli „wyłącznie przez normalne używanie interfejsu” — **jest nieosiągalne
przy pomocy App Check ani żadnych reguł**, dopóki w aplikacji nie ma logowania. Zastrzeżenie to
było zapisane przy opcji C w pkt 7 analizy bezpieczeństwa (*„nie rozróżnia użytkowników… najlepiej
działa jako dodatek do opcji A lub B, nie zamiast nich”*), ale zasługiwało na wyraźniejsze
powiedzenie od razu — bo to jest dokładnie ta granica, w której sformułowany został cel projektu.

---

## 4. Dlaczego reguły tego nie naprawią

Reguła Firestore potrafi rozróżnić zapytania tylko wtedy, gdy ma po czym — po tożsamości
(`request.auth`). W aplikacji **nie ma żadnego logowania**, więc z punktu widzenia reguł
zapytanie administratora, zapytanie gracza i polecenie wpisane w konsoli F12 wyglądają
**identycznie**. Nie ma w nich czego sprawdzić.

To nie jest kwestia napisania lepszych reguł. To kwestia braku informacji, na której reguła
mogłaby się oprzeć.

---

## 5. Co faktycznie zamknęłoby punkt 2.2

Tylko **opcja B** z pkt 7 analizy bezpieczeństwa: prawdziwe konta graczy i role administratora
nadawane po stronie Google (tzw. *custom claim*, którego nie da się podrobić z przeglądarki),
a reguły oparte na `request.auth`. Wtedy nawet z konsoli F12 gracz może zrobić tylko to, na co
pozwala mu jego rola — bo ograniczenie siedzi w bazie, a nie w interfejsie.

**Koszt:** to osobny projekt na kilka dni pracy — przebudowa logowania w obu modułach, założenie
kont, przeniesienie uprawnień z PIN-ów na role, zaprojektowanie na nowo importu gier (dziś kopiuje
go przeglądarka gracza wyłącznie dlatego, że reguły na to pozwalają — pkt 9 analizy).

**Czy trzeba to robić teraz? Nie.** Warto natomiast wiedzieć, że to jedyna droga dalej — i że
wszystko poniżej niej (opcja A, zawężanie reguł) już zostało zrobione albo okazało się bezcelowe.

---

## 6. Proporcje — żeby nie przesadzić w żadną stronę

Kto realnie mieści się w drugim wierszu tabeli z pkt 1? Osoby, które mają link do aplikacji —
czyli ok. 30 graczy. Taka osoba musiałaby znać narzędzia deweloperskie przeglądarki i **chcieć**
popsuć rozgrywkę lub podejrzeć cudze PIN-y.

To jest ryzyko zupełnie innego rzędu niż to, które istniało wcześniej: wtedy wystarczyło, żeby
**ktokolwiek na świecie** natknął się na publiczne repozytorium, odczytał z niego identyfikator
projektu i w kilka minut pobrał albo skasował całą bazę, nie mając nic wspólnego z Pana turniejem.
**Ta druga sytuacja już nie jest możliwa** i to jest realna zmiana, a nie kosmetyka.

---

## 7. Podsumowanie w trzech zdaniach

Cel został osiągnięty w części, która była najważniejsza i najpilniejsza: **baza przestała być
otwarta dla całego internetu** i nic spoza Pana domeny nie zapisze już do niej ani jednego znaku.
Nie został osiągnięty w części dosłownej: kto otworzy Pana stronę w przeglądarce, ten nadal może
z konsoli zrobić z danymi, co zechce — i **nie da się tego naprawić ani App Checkiem, ani
regułami**, bo w aplikacji nie ma logowania, po którym można by kogokolwiek rozpoznać.
Zamknęłoby to dopiero wprowadzenie prawdziwych kont i ról (opcja B), czyli osobny projekt,
którego nie trzeba podejmować teraz — ale który jest jedyną drogą dalej.
