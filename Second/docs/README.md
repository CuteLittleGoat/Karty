## Instrukcja użytkownika — moduł Second (UI)

### Jak wejść do panelu turniejowego
1. Otwórz `Second/index.html?admin=1`.
2. W górnym pasku kliknij **TOURNAMENT OF POKER**.
3. W lewym panelu wybierz sekcję **Losowanie graczy**.
4. Jeżeli chcesz wymusić pobranie z serwera dla tej zakładki, kliknij **Odśwież** w prawym górnym rogu panelu admina.

### Losowanie graczy — pełna obsługa
1. Nad tabelą uzupełnij pola: **ORGANIZATOR**, **BUY-IN**, **REBUY/ADD-ON**, **RAKE**, **STACK**, **REBUY/ADD-ON STACK**.
2. W polu **RAKE** wpisz samą liczbę (np. `10`).
   - Pod polem pojawi się podgląd wartości jako `10%`.
3. Sprawdź licznik nad tabelą: **Liczba dodanych graczy: X**.
4. Kliknij **Dodaj gracza**, aby utworzyć nowy wiersz.
   - Przycisk ma teraz krótki format i jest wyrównany do lewej strony (jak w module Main).
5. W kolumnie **Status** kliknij kółko, aby oznaczyć gracza jako aktywnego.
6. W kolumnie **Nazwa** wpisz nazwę gracza.
7. W kolumnie **PIN**:
   - pole ma szerokość pozwalającą wygodnie wpisać pełne 5 cyfr PIN,
   - wpisuj cyfry ręcznie lub kliknij **Losuj** obok pola.
8. W kolumnie **Uprawnienia**:
   - widzisz aktualne uprawnienia jako badge,
   - kliknij **Edytuj** i wpisz listę uprawnień oddzielonych przecinkami.
9. W kolumnie **Akcje** kliknij **Usuń**, aby skasować gracza z tabeli.

### Losowanie stołów
1. W tabeli przypisz każdemu graczowi:
   - **Status**: widoczny jako kolorowy tekst + przycisk **Zmień status**.
     - Domyślnie status to **Do zapłaty** (czerwony napis).
     - Po kliknięciu **Zmień status** status przełącza się cyklicznie na **Opłacone** (złoty napis), a kolejne kliknięcie wraca do **Do zapłaty**.
   - **Stół**: wybierany z listy rozwijanej.
2. Kliknij **Dodaj stół**.
   - Przycisk ma krótki format i nie rozciąga się już na pełną szerokość sekcji.
3. Dla każdego stołu niżej wpisz:
   - **Nazwa**,
   - **Wpisowe** przypisanych graczy.
4. Kliknij **Usuń** przy wybranym stole, aby go usunąć.

### Wpłaty
- **Tabela10**: Buy-in, REBUY/ADD-ON, SUMA, licz. REBUY/ADD-ON.
- **Tabela11**: %, Rake, BUY-IN, REBUY/ADD-ON, POT.
- **Tabela12**: zestawienie graczy wg stołów.

### Podział puli
- **Tabela13**, **Tabela14**, **Tabela15**, **Tabela16**.
- W **Tabela15** działa **Dodaj** i **Usuń** (dla ostatniego wiersza).
- Przycisk **Dodaj** jest krótki i wyrównany do lewej, spójnie z pozostałymi przyciskami dodawania.

### Faza grupowa
- **Tabela17**: stack gracza.
- **Tabela18**: widok zbiorczy stołów.
- **Tabela19**: gracze wg stołów + checkbox **ELIMINATED**.

### Półfinał
- **Tabela20**: status i stół dla gracza (status wybierany z listy rozwijanej).
- **Tabela21**: gracze bez ELIMINATED z fazy grupowej.
- **Tabela22**: dynamiczne stoły półfinałowe.
- Przycisk **Dodaj nowy stół** jest krótki i wyrównany do lewej strony.

### Finał
- **Tabela23**: LP, GRACZ, STACK, %, Eliminated.
- Pod tabelą widoczny jest stół pokerowy SVG.

### Wypłaty
- **Tabela24**: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA.


### Stabilność wpisywania danych (autozapis)
- Wszystkie pola edytowalne w panelu turniejowym mają zabezpieczenie przed utratą fokusu podczas automatycznego zapisu i odświeżeń z Firebase.
- Podczas pisania (również przy przytrzymaniu Backspace) aplikacja nie nadpisuje aktywnie edytowanego pola starszym snapshotem.
- Synchronizacja z serwerem jest stosowana po zakończeniu edycji pola.
