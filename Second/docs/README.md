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
   - w modalu zaznacz/odznacz checkboxy: **Zakładka1**, **Zakładka2**, **Zakładka3**,
   - zamknij modal przyciskiem **✕**, kliknięciem poza oknem lub klawiszem `Esc`,
   - wybrane pozycje od razu pojawią się w kolumnie **Uprawnienia** jako lista badge.
9. W kolumnie **Akcje** kliknij **Usuń**, aby skasować gracza z tabeli.

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

### Wpłaty
- **Tabela10**: Buy-in, REBUY/ADD-ON, SUMA, licz. REBUY/ADD-ON (wszystkie pola tylko do odczytu, bez klikalnych inputów).
- **Tabela11**: %, Rake, BUY-IN, REBUY/ADD-ON, POT (wszystkie pola tylko do odczytu, bez klikalnych inputów).
- **Tabela12**: Stół, LP, Gracz, BUY-IN, REBUY.
  - kolumna `BUY-IN` pobiera wartość przypisaną graczowi w sekcji **Losowanie stołów**,
  - kolumna `REBUY` otwiera modal **Rebuy gracza**,
  - licznik `LICZ. REBUY/ADD-ON` w Tabela10 zlicza liczbę uzupełnionych pól `Rebuy` u wszystkich graczy (nie sumę kwot).

### Podział puli
- **Tabela13**, **Tabela14**, **Tabela15**, **Tabela16**.
- W **Tabela15** działa **Dodaj** i **Usuń** (dla ostatniego wiersza).
- Przycisk **Dodaj** jest krótki i wyrównany do lewej, spójnie z pozostałymi przyciskami dodawania.

### Faza grupowa
- **Tabela17**: kolumny `STACK GRACZA` i `REBUY/ADD-on(w żetonach na os)` (kolumna `Gracz` została usunięta).
- **Tabela17A**: nowa tabela z kolumnami `LP`, `Gracz`, `Stack`, `%`, `Stół` (LP automatyczne, Stół z losowania stołów).
- **Tabela18**: widok zbiorczy stołów.
- **Tabela19**: gracze wg stołów + checkbox **ELIMINATED**.

### Półfinał
- **Tabela20** została usunięta.
- **Tabela21**: gracze bez ELIMINATED z fazy grupowej.
- **Tabela22**: dynamiczne stoły półfinałowe.
  - Po kliknięciu **Dodaj nowy stół** każdy stół ma tabelę z kolumnami `LP`, `Gracz`, `Stack`, `Eliminated`, `%`.
- Przycisk **Dodaj nowy stół** jest krótki i wyrównany do lewej strony.

### Finał
- **Tabela23**: LP, GRACZ, STACK, %, Eliminated.
- Pod tabelą widoczny jest stół pokerowy SVG.

### Wypłaty
- **Tabela24**: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA.



### Tournament of Poker w panelu użytkownika (odczyt z Firebase)
1. Otwórz widok użytkownika `Second/index.html` (bez `?admin=1`).
2. W prawym górnym rogu znajdziesz ikonę `Pliki/Ikona.png` oraz przycisk **Instrukcja** — ikona jest po lewej stronie przycisku.
3. Zewnętrzna zielona ramka panelu użytkownika ma po 1 px odstępu od lewej i prawej krawędzi ekranu oraz 1 px grubości na bocznych krawędziach.
4. Kliknij zakładkę **TOURNAMENT OF POKER**.
5. W lewym panelu wybierz sekcję: **Losowanie graczy**, **Losowanie stołów** albo **Wpłaty**.
6. Dane w tych sekcjach są pobierane automatycznie z dokumentu Firebase `second_tournament/state` i odświeżają się na żywo po zmianach wykonanych przez administratora.
7. Kliknij **Odśwież** w prawym górnym rogu panelu użytkownika, aby wymusić pobranie najnowszego stanu turnieju z serwera.
8. Pozostałe sekcje zakładki turniejowej w panelu użytkownika pokazują komunikat informacyjny — dane są zapisywane i edytowane w panelu administratora.

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
3. W `Tabela12` kolumna **REBUY** to przycisk per gracz:
   - kliknij przycisk, aby otworzyć modal **Rebuy gracza**,
   - użyj **Dodaj Rebuy** / **Usuń Rebuy**,
   - wpisane wartości sumują się na przycisku w tabeli.

### Podział puli
1. `Tabela13` i `Tabela14` pobierają dane automatycznie z panelu `Wpłaty`.
2. `Tabela15` pokazuje automatyczny BUY-IN i wartość `PODZIAŁ`.
3. `Tabela16`:
   - kolumna `PODZIAŁ PULI` działa w formacie procentowym jak w Main (np. wpisujesz `50`, wyświetla się `50%`, do obliczeń trafia `0.50`),
   - przyciski **Dodaj**/**Usuń** są pod `Tabela16`,
   - kolumny `REBUY1..` budują się automatycznie na podstawie rebuy,
   - kolumna `MOD` jest edytowalna,
   - kolumna `SUMA` liczy się automatycznie,
   - przy niezgodnej sumie procentów pojawia się czerwone ostrzeżenie,
   - przy nadmiarze rebuy ponad limit automatycznej dystrybucji pojawia się ostrzeżenie `Rebuy do rozdysponowania ...`.

### Faza grupowa
1. `Tabela17` zawiera tylko 1 wiersz.
2. `Tabela17` ma kolumny: `STACK GRACZA` i `REBUY/ADD-ON` (tylko odczyt).
3. `Tabela18` pokazuje stack per stół oraz `ŁĄCZNY STACK`.
4. `Tabela19` pokazuje dane gracza, w tym `STACK`, `REBUY/ADD-ON` i `REBUY` (tylko odczyt).

### Nagłówki kolumn
- W module Second nagłówki tabel są wyświetlane wielkimi literami.
- Wyjątek: dynamiczne nazwy stołów w `Tabela18` pozostają w formacie wpisanym przez użytkownika.

## Aktualny układ ramek w widoku użytkownika
1. W trybie użytkownika ciemno-zielone panele wewnątrz głównej karty są dosunięte do szerokości karty.
2. Każdy taki panel zaczyna się 1 px od lewej krawędzi zewnętrznej zielonej ramki i kończy 1 px przed prawą krawędzią.
