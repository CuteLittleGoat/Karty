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
5. W kolumnie **Status** zaznacz kółko, jeśli gracz jest aktywny.
6. W kolumnie **Nazwa** wpisz nazwę gracza.
7. W kolumnie **PIN**:
   - pole ma szerokość na 5 znaków,
   - wpisuj cyfry ręcznie lub kliknij **Losuj** obok pola.
8. W kolumnie **Uprawnienia**:
   - widzisz aktualne uprawnienia jako badge,
   - kliknij **Edytuj** i wpisz listę uprawnień oddzielonych przecinkami.
9. W kolumnie **Akcje** kliknij **Usuń**, aby skasować gracza z tabeli.

### Losowanie stołów
1. W tabeli przypisz każdemu graczowi:
   - **Status** (Do zapłaty / Opłacone),
   - **Stół**.
2. Kliknij **Dodaj stół**.
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

### Faza grupowa
- **Tabela17**: stack gracza.
- **Tabela18**: widok zbiorczy stołów.
- **Tabela19**: gracze wg stołów + checkbox **ELIMINATED**.

### Półfinał
- **Tabela20**: status i stół dla gracza.
- **Tabela21**: gracze bez ELIMINATED z fazy grupowej.
- **Tabela22**: dynamiczne stoły półfinałowe.

### Finał
- **Tabela23**: LP, GRACZ, STACK, %, Eliminated.
- Pod tabelą widoczny jest stół pokerowy SVG.

### Wypłaty
- **Tabela24**: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA.
