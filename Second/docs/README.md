## Instrukcja użytkownika — moduł Second (UI)

### Jak wejść do panelu turniejowego
1. Otwórz `Second/index.html?admin=1`.
2. Kliknij zakładkę **TOURNAMENT OF POKER**.
3. W lewym panelu sekcje są w kolejności: **Losowanie graczy**, **Losowanie stołów**, **Wpłaty**, **Podział puli**, **Faza grupowa**, **Półfinał**, **Finał**, **Wypłaty**.

### 1) Losowanie graczy
1. Uzupełnij pola nad tabelą: ORGANIZATOR, BUY-IN, REBUY/ADD-ON, RAKE, STACK, REBUY/ADD-ON STACK.
2. Kliknij **Dodaj gracza**.
3. W nowym wierszu ustaw:
   - **Status** (okrągły checkbox),
   - **Nazwa**,
   - **PIN**,
   - **Uprawnienia**.
4. Dane zapisują się automatycznie.

### 2) Losowanie stołów
1. W tabeli przypisz każdemu graczowi:
   - **Status** (Do zapłaty / Opłacone),
   - **Stół**.
2. Kliknij **Dodaj stół**.
3. Dla każdego stołu poniżej wpisuj:
   - **Nazwa**,
   - **Wpisowe** dla przypisanych graczy.
4. Użyj **Usuń** przy wybranym stole, aby go usunąć.

### 3) Wpłaty
- Dostępne są tabele: **Tabela10**, **Tabela11**, **Tabela12**.
- Tabela10 i Tabela11 pozwalają wpisywać wartości numeryczne.
- Tabela12 pokazuje grupowanie graczy według stołów.

### 4) Podział puli
- Dostępne są: **Tabela13**, **Tabela14**, **Tabela15**, **Tabela16**.
- W **Tabela15** działa:
  - **Dodaj** (dodaje kolejny wiersz),
  - **Usuń** (usuwa ostatni wiersz z przyciskiem).
- W **Tabela16** kolumna **Mod** przyjmuje wartości numeryczne.

### 5) Faza grupowa
- **Tabela17**: wpisuj stack gracza.
- **Tabela18**: widok zbiorczy stołów (szkielet).
- **Tabela19**: grupowanie wg stołów + checkbox **ELIMINATED**.

### 6) Półfinał
- **Tabela20**: niezależne od losowania głównego przypisanie statusu i stołu.
- **Tabela21**: lista graczy bez zaznaczonego ELIMINATED z fazy grupowej.
- **Tabela22**: dynamiczne stoły półfinałowe.
1. Kliknij **Dodaj nowy stół**.
2. Powstaje „Stół Półfinałowy numer X”.
3. Kliknij **Usuń stół** przy wybranym stole — numeracja przelicza się automatycznie.

### 7) Finał
- **Tabela23**: LP, GRACZ, STACK, %, Eliminated.
- Czerwony opis i czerwone przyciski:
  - **Dodaj gracza**,
  - **Usuń gracza**
  służą do testu wyświetlania stołu.
- Pod tabelą widoczny jest stół pokerowy SVG z rozmieszczeniem graczy i stacków.

### 8) Wypłaty
- **Tabela24**: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA.
- Checkboxy w nagłówkach dwóch kolumn sterują ich widocznością dla widoku użytkownika (logika zapisywana).
