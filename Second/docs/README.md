## Instrukcja użytkownika — moduł Second (UI)

### Jak wejść do panelu turniejowego
1. Otwórz `Second/index.html?admin=1`.
2. W prawym górnym rogu znajdziesz ikonę `Pliki/Ikona.png` oraz przycisk **Instrukcja** — ikona jest po lewej stronie przycisku (tak samo jak w module Main).
3. W górnym pasku kliknij **TOURNAMENT OF POKER**.
4. W lewym panelu wybierz sekcję **Losowanie graczy**.
5. Jeżeli chcesz wymusić pobranie z serwera dla tej zakładki, kliknij **Odśwież** w prawym górnym rogu panelu admina.

### Losowanie graczy — pełna obsługa
1. Nad tabelą uzupełnij pola: **ORGANIZATOR**, **BUY-IN**, **REBUY/ADD-ON**, **RAKE**, **STACK**, **REBUY/ADD-ON STACK**.
2. W polu **RAKE** wpisz wartość liczbową (np. `10`) — pole wyświetla ją jako `10%` i taka wartość procentowa jest używana w obliczeniach.
3. Sprawdź licznik nad tabelą: **Liczba dodanych graczy: X**.
4. Kliknij **Dodaj gracza**, aby utworzyć nowy wiersz.
   - Przycisk ma teraz krótki format i jest wyrównany do lewej strony (jak w module Main).
5. W kolumnie **Status** kliknij kompaktowy przycisk statusu płatności dla danego gracza (styl pigułki).
   - Przycisk **OPŁACONE** ma złoty napis i złotą obwódkę.
   - Przycisk **DO ZAPŁATY** ma jasnoróżowy napis i czerwonawą obwódkę.
   - Działa tak samo po kliknięciu myszą (PC) i po tapnięciu na telefonie/tablecie.
6. W kolumnie **Nazwa** wpisz nazwę gracza.
7. W kolumnie **PIN**:
   - pole ma szerokość pozwalającą wygodnie wpisać pełne 5 cyfr PIN,
   - wpisuj cyfry ręcznie lub kliknij **Losuj** obok pola,
   - aplikacja nie pozwoli zapisać PIN, który jest już przypisany do innego gracza (pojawi się komunikat walidacyjny i w polu zostanie poprzednia wartość).
8. W kolumnie **Uprawnienia**:
   - widzisz aktualne uprawnienia jako badge,
   - kliknij **Edytuj** — otworzy się modal **Uprawnienia gracza** (jak w module Main),
   - w modalu zaznacz/odznacz checkboxy: **Czat**, **Wpłaty**, **Podział Puli**, **Faza Grupowa**, **Półfinał**, **Finał**, **Wypłaty**,
   - zamknij modal przyciskiem **✕**, kliknięciem poza oknem lub klawiszem `Esc`,
   - wybrane pozycje od razu pojawią się w kolumnie **Uprawnienia** jako lista badge.
9. W kolumnie **Akcje** kliknij **Usuń**, aby skasować gracza z tabeli.
   - Jeżeli był to ostatni gracz, a jednocześnie nie ma już żadnego stołu, aplikacja automatycznie wyzeruje licznik rebuy i usunie stare kolumny `RebuyX` z danych turnieju.

### Losowanie stołów
1. W górnej tabeli przypisz każdemu graczowi:
   - **Status**: widoczny jako pigułka statusu (bez możliwości zmiany w tej sekcji).
     - **Do zapłaty** — przycisk/pigułka z jasnoróżowym napisem i czerwonawą obwódką.
     - **Opłacone** — przycisk/pigułka ze złotym napisem i złotą obwódką.
   - **Stół**: wybierany z listy rozwijanej.
2. Zmiana statusu płatności odbywa się w zakładce **Losowanie graczy** przez kliknięcie przycisku statusu (pigułka) w kolumnie **Status**.
   - Zmiana jest od razu widoczna także w zakładce **Losowanie stołów**.
3. Kliknij **Dodaj stół**.
   - Przycisk ma krótki format i nie rozciąga się na pełną szerokość sekcji.
   - Nowy stół dostaje domyślną nazwę w formacie **Stół1, Stół2, Stół3...**.
4. Dla każdego dodanego stołu pojawia się osobny blok z tabelą i nagłówkiem: **Nazwa** + **Łączna Suma**.
5. W tabeli stołu kolumna **BUY-IN** jest automatyczna i pobiera wartość z sekcji **Losowanie graczy** (pole `BUY-IN`) dla każdego przypisanego gracza — brak edycji w tej tabeli.
6. Kliknij **Usuń** przy wybranym stole, aby go usunąć.
   - Czerwony przycisk **Usuń** jest kompaktowy i wyrównany do prawej krawędzi bloku (spójny wizualnie z przyciskami **Usuń** w sekcji **Losowanie graczy**).
   - Jeżeli po usunięciu stołu nie ma już żadnych stołów i żadnych graczy, aplikacja automatycznie czyści dane rebuy oraz ręczne nadpisania rebuy w podziale puli.

### Wpłaty
- **Tabela10**: Buy-in, REBUY/ADD-ON, SUMA, licz. REBUY/ADD-ON (wszystkie pola tylko do odczytu, bez klikalnych inputów).
  - `SUMA` liczy się jako: suma `BUY-IN` z `Tabela12` + suma `REBUY` z `Tabela12`.
- **Tabela11**: %, Rake, BUY-IN, REBUY/ADD-ON, POT (wszystkie pola tylko do odczytu, bez klikalnych inputów).
  - kolumna `RAKE` liczy się jako: `(suma BUY-IN z Tabela12 + suma REBUY z Tabela12) × %`.
- **Tabela12**: LP, Stół, Gracz, BUY-IN, REBUY.
  - kolumna `BUY-IN` pobiera wartość przypisaną graczowi w sekcji **Losowanie stołów**,
  - kolumna `REBUY` otwiera modal **Rebuy gracza**,
  - modal **Rebuy gracza** możesz zawsze zamknąć przez `×`, kliknięcie poza oknem lub klawisz `Esc` — także po edycji pól,
  - licznik `LICZ. REBUY/ADD-ON` w Tabela10 zlicza liczbę uzupełnionych pól `Rebuy` tylko dla aktualnie istniejących graczy (nie sumę kwot),
  - wiersze mają zebra striping per grupa stołu: cały blok graczy z tego samego stołu ma wspólny kolor, a kolejne stoły zmieniają kolor naprzemiennie.

### Podział puli
- **Tabela13**, **Tabela14**, **Tabela15**, **Tabela16**.
- Przyciskami **Dodaj** i **Usuń** pod `Tabela16` zarządzasz liczbą wierszy podziału puli.
- Przycisk **Dodaj** jest krótki i wyrównany do lewej, spójnie z pozostałymi przyciskami dodawania.

### Faza grupowa
- **Tabela17**: kolumny `STACK GRACZA` i `REBUY/ADD-ON`.
- **Tabela18**: widok zbiorczy stołów oraz `ŁĄCZNY STACK`.
- **Tabela19**: LP, Stół, Gracz, checkbox **ELIMINATED**, Stack, `REBUY/ADD-ON`.
  - kolumna `REBUY` została usunięta,
  - `REBUY/ADD-ON` liczy się automatycznie z liczby uzupełnionych pól `RebuyX` w modalu `Rebuy gracza` dla danego gracza,
  - wiersze mają zebra striping per grupa stołu.
- **Tabela19A**: LP, `WYELIMINOWANI GRACZE`, `WYGRANA`.
  - pokazuje tylko graczy z zaznaczonym checkboxem **ELIMINATED** w `Tabela19`,
  - liczba wierszy zmienia się dynamicznie,
  - po kliknięciu checkboxa gracz od razu pojawia się tutaj bez ręcznego odświeżania strony,
  - kolumna `WYGRANA` jest edytowalna i domyślnie ma wartość `0`.
- **Tabela19B**: LP, Stół, Gracz, Stack, %.
  - pokazuje tylko graczy bez zaznaczonego checkboxa **ELIMINATED**,
  - liczba wierszy zmienia się dynamicznie po zaznaczaniu/odznaczaniu **ELIMINATED**,
  - po zaznaczeniu checkboxa w `Tabela19` wiersz znika stąd natychmiast i zapisuje się także po odświeżeniu strony,
  - kolumna `STACK` jest edytowalna i domyślnie pusta,
  - kolumna `%` liczy `STACK / ŁĄCZNY STACK z Tabela18`.

### Półfinał
- **Tabela21** pokazuje graczy z `Tabela19B`.
  - kolumna `STACK` jest kopiowana z `Tabela19B` i nie da się jej edytować tutaj,
  - kolumna `%` jest kopiowana z `Tabela19B` i nie da się jej edytować tutaj,
  - kolumna `STÓŁ` jest listą rozwijaną z nazwami stołów dodanych przyciskiem **Dodaj nowy stół**.
- **Tabela22**: dynamiczne stoły półfinałowe.
  - kliknij **Dodaj nowy stół**,
  - w polu `NAZWA` wpisz nazwę stołu,
  - gracze pojawiają się automatycznie zgodnie z wyborem z `Tabela21`,
  - `STACK` jest kopiowany z `Tabela21`,
  - `ŁĄCZNY STACK` liczy się automatycznie z sumy stacków graczy przy tym stole i jest widoczny tylko nad tabelą,
  - checkbox `ELIMINATED` zapisuje się między sesjami przeglądarki i po odświeżeniu.
- **Tabela22A** pojawia się pod stołami półfinałowymi i pokazuje wszystkich graczy z zaznaczonym `ELIMINATED` w `Tabela22`.
  - kolumna `LP` numeruje listę automatycznie,
  - kolumna `POZYCJA` pozwala zmieniać kolejność strzałkami `▲/▼`,
  - kolejność zapisuje się między sesjami.
- **Tabela FINAŁOWA** pokazuje tylko graczy przypisanych do `Tabela22`, którzy nie mają zaznaczonego `ELIMINATED` w półfinale; lista nie zależy od checkboxów z panelu `Finał`.
  - jeśli żaden gracz nie spełnia warunku, zobaczysz sam nagłówek tabeli,
  - kolumna `STACK` jest tylko do odczytu,
  - kolumna `STÓŁ` uzupełnia się automatycznie,
  - kolumna `%` liczy `STACK / ŁĄCZNY STACK z Tabela18`.

### Finał
- **Tabela23**: LP, GRACZ, STACK, %, ELIMINATED.
- Dane w tej tabeli są synchronizowane z `Tabela FINAŁOWA` z panelu `Półfinał` i sortowane malejąco po `STACK`.
- `STACK` jest tylko do odczytu.
- Checkbox `ELIMINATED` zapisuje się między sesjami i od razu wpływa na klasyfikację w `Tabela24`.
- Pod tabelą widoczny jest stół pokerowy SVG.

### Wypłaty
- **Tabela24**: MIEJSCE, GRACZ oraz kolumny wygranych zależne od checkboxów nad tabelą.
- Nad tabelą administrator może zaznaczyć checkboxy **Pokaż kolumnę POCZĄTKOWA WYGRANA** i **Pokaż kolumnę KOŃCOWA WYGRANA**.
  - gdy checkbox jest zaznaczony, kolumna jest widoczna także w widoku użytkownika,
  - gdy checkbox jest odznaczony, kolumna jest całkowicie ukryta,
  - stan checkboxów zapisuje się między sesjami i po restarcie aplikacji.
- `Tabela24` zawsze pokazuje wszystkich graczy z panelu **Losowanie Graczy**.
  - miejsca od końca zajmują najpierw gracze z `Tabela19A`,
  - potem wolne miejsca od końca zajmują gracze z `Tabela22A`,
  - pozostałe miejsca zajmują finaliści z `Tabela23` posortowani po `STACK`,
  - zaznaczenie `ELIMINATED` w `Tabela23` przenosi gracza za aktywnych finalistów.
- Kolumny wygranych są tylko do odczytu.
  - `POCZĄTKOWA WYGRANA` pobiera `KWOTA` z tego samego miejsca w `Tabela16`,
  - `KOŃCOWA WYGRANA` pobiera `SUMA` z tego samego miejsca w `Tabela16`,
  - jeśli w `Tabela24` jest więcej miejsc niż wierszy w `Tabela16`, dalsze miejsca pokazują `0`.



### Tournament of Poker w panelu użytkownika (odczyt z Firebase)
1. Otwórz widok użytkownika `Second/index.html` (bez `?admin=1`).
2. W prawym górnym rogu znajdziesz ikonę `Pliki/Ikona.png` oraz przycisk **Instrukcja** — ikona jest po lewej stronie przycisku.
3. Zewnętrzna zielona ramka panelu użytkownika ma po 1 px odstępu od lewej i prawej krawędzi ekranu oraz 1 px grubości na bocznych krawędziach.
4. Bez wpisania PIN dostępne są tylko zakładki **Aktualności** i **Regulamin**.
5. W górnej bramce PIN wpisz 5 cyfr przypisanych do gracza i kliknij **Otwórz**.
6. Po poprawnym PIN aplikacja odblokuje zakładki **Czat** i **TOURNAMENT OF POKER** do czasu resetu/odświeżenia strony.
7. Kliknij zakładkę **TOURNAMENT OF POKER**.
8. W lewym panelu zobaczysz tylko te przyciski sekcji, do których administrator nadał uprawnienia dla tego gracza; bez żadnego uprawnienia sidebar pozostanie pusty.
9. Jeżeli administrator nie nadał żadnego uprawnienia turniejowego, panel boczny nie pokaże przycisków nawigacji i pojawi się komunikat informacyjny.
10. Dane w dostępnych sekcjach są pobierane automatycznie z dokumentu Firebase `second_tournament/state` i odświeżają się na żywo po zmianach wykonanych przez administratora.
10a. Po kliknięciu dowolnego przycisku w lewym sidebarze zawartość wybranej sekcji powinna pojawić się od razu w dużym panelu po prawej; jeżeli panel pozostaje pusty, oznacza to błąd aplikacji, a nie brak uprawnień.
11. Kliknij **Odśwież** w prawym górnym rogu panelu użytkownika, aby wymusić pobranie najnowszego stanu turnieju z serwera.
12. Zakładka **Wypłaty** pokazuje tabelę miejsc i wygranych zsynchronizowaną z danymi turnieju; gdy administrator nie doda jeszcze kwot, w komórkach widoczny jest znak `—`.
13. Pozostałe sekcje zakładki turniejowej w panelu użytkownika pokazują komunikat informacyjny — dane są zapisywane i edytowane w panelu administratora.

### Stabilność wpisywania danych (autozapis)
- Wszystkie pola edytowalne w panelu turniejowym mają zabezpieczenie przed utratą fokusu podczas automatycznego zapisu i odświeżeń z Firebase.
- Podczas pisania (również przy przytrzymaniu Backspace) aplikacja nie nadpisuje aktywnie edytowanego pola starszym snapshotem.
- Synchronizacja z serwerem jest stosowana po zakończeniu edycji pola.

## TOURNAMENT OF POKER – aktualny przepływ (moduł Second)

### Losowanie stołów
1. Przejdź do `TOURNAMENT OF POKER` → `Losowanie stołów`.
2. Dodaj stoły przyciskiem **Dodaj stół**.
3. W tabeli głównej przypisz graczy do stołów.
4. W kartach stołów kolumna wpłaty gracza nazywa się **BUY-IN**.
5. Pole **ŁĄCZNA SUMA** przy stole liczy się automatycznie z wpisanych BUY-IN.

### Wpłaty
1. Przejdź do zakładki `Wpłaty`.
2. `Tabela10` oraz `Tabela11` są automatycznie wyliczane i tylko do odczytu.
3. Wszystkie wartości liczbowe w komórkach tabel są zaokrąglane do pełnych liczb (jak w module Main).
4. W `Tabela11` kolumna `RAKE` liczy się z całkowitej sumy `BUY-IN + REBUY` i procentu `RAKE`.
5. W `Tabela12` kolumny `LP` i `STÓŁ` są zamienione miejscami, a kolor wiersza zależy od grupy stołu.
6. W `Tabela12` kolumna **REBUY** to przycisk per gracz:
   - kliknij przycisk, aby otworzyć modal **Rebuy gracza**,
   - po otwarciu pustego modala nie ma żadnej kolumny (zgodnie z Main),
   - użyj **Dodaj Rebuy** / **Usuń Rebuy** — pierwsza kolumna pojawia się po kliknięciu **Dodaj Rebuy**,
   - nowe pole `RebuyX` po kliknięciu **Dodaj Rebuy** pojawia się najpierw lokalnie w modalu; zapis do Firebase następuje po zamknięciu modalu albo natychmiast po **Usuń Rebuy**,
   - numeracja `RebuyX` jest globalna dla całej `Tabela12` (wszyscy gracze) i przy dodawaniu zawsze dostaje kolejny numer globalny,
   - po usunięciu kolumny aplikacja kompaktuje numerację globalnie (numery większe od usuniętego przesuwają się o `-1`),
   - jeżeli zapis nie powiedzie się (np. brak uprawnień/połączenia), modal pokaże komunikat błędu z kodem/opisem problemu i nie utrwali nowo dodanego `Rebuy`,
   - podczas zapisu przyciski `Dodaj Rebuy` i `Usuń Rebuy` są czasowo blokowane, żeby uniknąć podwójnego kliknięcia i łatwiej zdiagnozować problem.
   - podczas otwartego modalu snapshot z serwera dla tej sekcji jest odkładany do czasu zakończenia edycji, więc pierwszy wpis po dodaniu `Rebuy` nie jest już cofany przez starszy stan.
  - jeżeli podczas dodawania wystąpi błąd techniczny (także przed samym zapisem), modal pokaże komunikat błędu zamiast „cichego” braku reakcji przycisku.
  - po kliknięciu `Dodaj Rebuy` / `Usuń Rebuy` aplikacja aktualizuje zawsze bieżący stan gracza na stabilnej referencji wpisu, więc przycisk nie „gubi” zmian po odświeżeniu modala w trakcie zapisu.
   - wpisane wartości sumują się na przycisku w tabeli.

### Podział puli
1. `Tabela13` i `Tabela14` pobierają dane automatycznie z panelu `Wpłaty`.
2. `Tabela15` pokazuje `BUY-IN` (skopiowany z `Tabela14.BUY-IN`) oraz `PODZIAŁ = Tabela14.POT - suma PODZIAŁ PULI od wiersza 4`.
3. `Tabela16`:
   - kolumna `PODZIAŁ PULI`: wiersze 1–3 działają procentowo (`50` => `50%`, do obliczeń `0.5`), od wiersza 4 wpisy są liczbami bez `%` i bez dzielenia przez 100,
   - kolumna `KWOTA`: wiersze 1–3 = procent × `Tabela15.PODZIAŁ`, od wiersza 4 = przepisana wartość z `PODZIAŁ PULI`,
   - liczba kolumn `REBUY` jest dynamiczna i zależy od liczby uzupełnionych pól `Rebuy` w modalach `Rebuy gracza` (jeśli brak rebuy, kolumn `REBUY` nie ma),
   - `Rebuy1..Rebuy30` mają stałe przypisanie do wierszy i działają jak kolumna `KWOTA` (readonly), ale każda z tych wartości jest najpierw pomniejszana o procent z `Tabela14`,
   - jeśli kolumn `REBUY` jest więcej niż 30, kolumny od `Rebuy31` wzwyż są renderowane bez auto-uzupełniania wierszy i pozostają edytowalne ręcznie,
   - komórki `REBUY` pokazują wartości wpisane w modalach `Rebuy gracza` i nie są nadpisywane przez wartości z `PODZIAŁ PULI`,
   - kolumny `MOD` są dynamiczne: dla `0..12` rebuy jest `MOD1` przed `SUMA`, dla `13..20` dochodzi `MOD2`, a powyżej 20 dochodzi `MOD3`,
   - kolumna `SUMA` liczy się automatycznie,
   - wszystkie pola edycyjne w `Tabela16` mają szerokość ustawioną tak, żeby mieściły 4 znaki.

### Faza grupowa
1. `Tabela17` zawiera tylko 1 wiersz.
2. `Tabela17` ma kolumny: `STACK GRACZA` i `REBUY/ADD-ON` (tylko odczyt).
3. `Tabela18` pokazuje stack per stół oraz `ŁĄCZNY STACK`.
4. Wartość każdego stołu w `Tabela18` to suma kolumn `STACK` i `REBUY/ADD-ON` z `Tabela19` dla graczy przypisanych do tego stołu.
5. `Tabela19` ma kolumny: `LP`, `STÓŁ`, `GRACZ`, `ELIMINATED`, `STACK`, `REBUY/ADD-ON`.
6. W `Tabela19` kolumna `REBUY/ADD-ON` wylicza się jako `Tabela17.REBUY/ADD-ON × liczba uzupełnionych pól RebuyX` dla danego gracza.
7. Zaznaczenie checkboxa `ELIMINATED` przenosi gracza z `Tabela19B` do `Tabela19A`.
8. `Tabela19A` pokazuje tylko wyeliminowanych graczy i ma kolumny `LP`, `WYELIMINOWANI GRACZE`, `POZYCJA`, `WYGRANA`.
9. W kolumnie `POZYCJA` kliknij `▲`, aby przesunąć gracza o jedno miejsce wyżej, albo `▼`, aby przesunąć go o jedno miejsce niżej; przycisk w pierwszym lub ostatnim wierszu jest automatycznie zablokowany.
10. Kolumna `LP` w `Tabela19A` zawsze pokazuje stałe miejsca `1..N`, a po kliknięciu strzałek przemieszcza się gracz wraz z przypisaną mu wartością `WYGRANA`.
11. `Tabela19B` pokazuje tylko niewyeliminowanych graczy i pozwala wpisać ich `STACK`; kolumna `%` liczy udział względem `Tabela18.ŁĄCZNY STACK`.

### Nagłówki kolumn
- W module Second nagłówki tabel są wyświetlane wielkimi literami.
- Wyjątek: dynamiczne nazwy stołów w `Tabela18` pozostają w formacie wpisanym przez użytkownika.

## Aktualny układ ramek w widoku użytkownika
1. W trybie użytkownika ciemno-zielone panele wewnątrz głównej karty są dosunięte do szerokości karty.
2. Każdy taki panel zaczyna się 1 px od lewej krawędzi zewnętrznej zielonej ramki i kończy 1 px przed prawą krawędzią.


## Odblokowanie zakładek i czatu PIN-em (widok użytkownika)
1. Po wejściu do widoku użytkownika najpierw wpisz PIN w górnej bramce nad zakładkami.
2. Bez tego kroku dostępne są wyłącznie **Aktualności** i **Regulamin**.
3. Po poprawnej weryfikacji odblokują się zakładki **Czat** i **TOURNAMENT OF POKER**; ten stan jest pamiętany do czasu resetu lub odświeżenia strony.
4. Wejdź do zakładki **Czat**.
5. W polu PIN czatu wpisz dokładnie 5 cyfr przypisanych do gracza i kliknij **Otwórz** (lub naciśnij Enter).
6. Jeżeli PIN jest poprawny i gracz ma uprawnienie **Czat** nadane przez admina w sekcji **Losowanie graczy**, ukryje się panel PIN i pojawi się formularz wysyłki wiadomości.
7. Wysłane wiadomości publikują się z nazwą gracza skonfigurowaną przez admina.
