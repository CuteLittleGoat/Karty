# Kolumny — aktualny układ

## Moduł Second — Tournament of Poker

### Losowanie graczy
1. Status
2. Nazwa
3. PIN
4. Uprawnienia
5. Akcje

### Losowanie stołów
1. Gracz
2. Status
3. Stół

Dodatkowo dla każdego stołu:
- Gracz
- BUY-IN (tylko odczyt, wartość z sekcji Losowanie graczy)

### Wpłaty
- Tabela10: Buy-in, REBUY/ADD-ON, SUMA, licz. REBUY/ADD-ON
- Tabela11: %, Rake, BUY-IN, REBUY/ADD-ON, POT
- Tabela12: Stół, LP, Gracz, BUY-IN, REBUY

### Podział puli
- Tabela13: BUY-IN, REBUY/ADD-ON, SUMA, LICZBA REBUY
- Tabela14: %, Rake, BUY-IN, REBUY/ADD-ON, POT
- Tabela15: POT, PODZIAŁ
- Tabela16: LP, PODZIAŁ PULI, KWOTA, REBUY1..n, MOD1..MOD3, SUMA

### Faza grupowa
- Tabela17: STACK GRACZA, REBUY/ADD-on(w żetonach na os)
- Tabela17A: LP, Gracz, Stack, %, Stół
- Tabela18: Stoły dynamiczne + ŁĄCZNY STACK
- Tabela19: Stół, LP, Gracz, ELIMINATED, Stack, REBUY/add-on, REBUY

### Półfinał
- Tabela21: LP, Gracz, STACK, %, Stół
- Tabela22: LP, Gracz, Stack, Eliminated, %
- Tabela Finałowa: LP, GRACZ, STACK, STÓŁ, %

### Finał
- Tabela23: LP, GRACZ, STACK, %, Eliminated

### Wypłaty
- Tabela24: MIEJSCE, GRACZ, POCZĄTKOWA WYGRANA, KOŃCOWA WYGRANA


### Szerokości kolumn (Losowanie graczy)
- Kolumna `Nazwa` (2): `min-width: 30ch`.
- Kolumna `PIN` (3): `min-width: 14ch` (zwiększona szerokość dla 5-cyfrowego PIN).
- Kolumna `Uprawnienia` (4): `min-width: 28ch`.
- Kolumna `Akcje` (5): `min-width: 8ch`, wyrównanie do prawej.

### Losowanie stołów — kolumna Status
- Kolumna `Status` zawiera wyłącznie etykietę statusu płatności (układ w `.payment-status-cell`, bez przycisku zmiany).
- Zmiana statusu następuje w sekcji `Losowanie graczy` przez zaznaczenie/odznaczenie okrągłej kontrolki w kolumnie `Status`.

## Moduł Main — Ranking (Gry admina i Statystyki)
1. Miejsce
2. Gracz
3. Wynik

### Szerokości i zachowanie kolumn (Ranking Main)
- `Miejsce`: stała szerokość `8ch`.
- `Gracz`: stała szerokość `13ch`; nagłówek i wartości są wyrównane do lewej, a nazwy są obcinane wielokropkiem (`ellipsis`), aby cała tabela rankingu mieściła się w panelu bez poziomego przewijania.
- `Wynik`: stała szerokość `6.5ch`, wyrównanie do środka.
- Tabela używa `table-layout: fixed` i `width: 100%`.

### Układ paneli Statystyk (widok gracza, desktop)
- W `Statystyki` (widok gracza) siatka ma trzy kolumny: `Lata` (`20ch`), `Statystyki` (`minmax(0, 1fr)`) i `Ranking` (`34ch`).
- Dzięki temu panel `Ranking` jest po prawej stronie tabel statystyk na desktopie.
- W mobile (`max-width: 720px`) układ przechodzi na jedną kolumnę i panel `Ranking` wraca pod tabelę statystyk.


### Losowanie stołów — akcje w bloku stołu
- Przycisk `Usuń` w pojedynczym bloku stołu ma kompaktową szerokość (`.admin-row-delete`) i wyrównanie do prawej krawędzi (`.draw-table-delete`).

## Tournament of Poker (Second) – kolumny
- Panel `Losowanie stołów`: kolumna `Wpisowe` została zastąpiona przez `BUY-IN`.
- Panel `Wpłaty`:
  - `Tabela10`: nieedytowalne komórki obliczane (`BUY-IN`, `REBUY/ADD-ON`, `SUMA`, `LICZ. REBUY/ADD-ON`).
  - `Tabela11`: nieedytowalne komórki obliczane (`%`, `RAKE`, `BUY-IN`, `REBUY/ADD-ON`, `POT`).
  - `Tabela12`: kolumna `REBUY` jako przycisk otwierający modal.
- Panel `Podział puli`:
  - przyciski `Dodaj/Usuń` są pod `Tabela16`,
  - `Tabela15` pokazuje kolumny `POT` i `PODZIAŁ`,
  - `Tabela16` ma `PODZIAŁ PULI` (wiersze 1–3 procentowo, od 4 liczbowo),
  - liczba kolumn `REBUY` jest dynamiczna i zależy od liczby uzupełnionych pól `Rebuy` w modalach `Rebuy gracza`,
  - `REBUY1..REBUY30` mają stałe przypisanie do wierszy, a przypisane komórki są readonly i pokazują wartości z modali `Rebuy gracza`,
  - kolumny od `REBUY31` wzwyż są puste domyślnie i edytowalne ręcznie przez użytkownika,
  - kolumny `MOD` są dynamiczne (`MOD1`, `MOD2`, `MOD3`) zależnie od liczby kolumn `REBUY`.
- Panel `Faza grupowa`:
  - `Tabela17` tylko 2 kolumny: `STACK GRACZA`, `REBUY/ADD-ON`.
  - `Tabela17A` usunięta.


### Modal „Rebuy gracza” (Second)
- Kolumny dynamiczne: `Rebuy1..n` (numeracja globalna względem kolejności graczy w Tabela12).
- Szerokość każdej kolumny: `8ch` (jak w module Main).
