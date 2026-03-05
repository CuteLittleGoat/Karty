## Instrukcja użytkownika — moduł Second

### TOURNAMENT OF POKER (panel administratora)
1. Wejdź na `Second/index.html?admin=1`.
2. Kliknij zakładkę **TOURNAMENT OF POKER**.
3. W panelu bocznym używaj sekcji: **Lista graczy**, **Losowanie stołów**, **Wpłaty**, **Podział puli**, **Faza grupowa**, **Półfinał**, **Finał**, **Wypłaty**.

### 1) Lista graczy
1. Uzupełnij pola: ORGANIZATOR, BUY-IN, REBUY/ADD-ON, RAKE, STACK, REBUY/ADD-ON STACK.
2. Kliknij **Dodaj gracza**.
3. W tabeli ustaw:
   - **Status** (checkbox-kółko),
   - **Nazwa**,
   - **PIN**,
   - **Uprawnienia**.
4. Wszystkie dane zapisują się automatycznie do Firebase.

### 2) Losowanie stołów
1. W tabeli przypisz dla każdego gracza:
   - status (**Do zapłaty** / **Opłacone**),
   - stół.
2. Kliknij **Dodaj stół**, aby dodać kolejny stół.
3. Użyj **Usuń** przy stole, aby go usunąć.

### 3) Wpłaty
- Widoczne są tabele szkieletowe: **Tabela10**, **Tabela11**, **Tabela12**.
- Tabela12 grupuje graczy wg przypisanych stołów.

### 4) Podział puli
- Widoczne są tabele: **Tabela13**, **Tabela14**, **Tabela15**, **Tabela16**.
- W Tabela15 dostępne przyciski **Dodaj** i **Usuń** (szkielet UI).

### 5) Faza grupowa
- Widoczne są tabele: **Tabela17**, **Tabela18**, **Tabela19**.
- Tabela19 pokazuje grupowanie po stołach oraz checkbox **ELIMINATED**.

### 6) Półfinał
- Widoczne są tabele: **Tabela20**, **Tabela21**, **Tabela22**, oraz **Tabela Finałowa**.
- Przycisk **Dodaj nowy stół** tworzy kolejne stoły półfinałowe.
- Przycisk **Usuń stół** usuwa stół i przelicza numerację.

### 7) Finał
1. Używaj **Tabela23**.
2. Przyciskami testowymi (czerwone):
   - **Dodaj gracza (test)**,
   - **Usuń gracza (test)**
   sprawdzisz rysowanie stołu.
3. Pod tabelą jest wizualizacja stołu pokerowego w SVG z rozmieszczeniem graczy wokół owalu.

### 8) Wypłaty
- W sekcji jest tabela **Tabela24** z kolumnami:
  - MIEJSCE,
  - GRACZ,
  - POCZĄTKOWA WYGRANA (z checkboxem widoczności),
  - KOŃCOWA WYGRANA (z checkboxem widoczności).
