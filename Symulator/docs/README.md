# Symulator Texas Hold'em — instrukcja użytkownika (UI)

## 1. Jak uruchomić moduł
1. Otwórz panel administratora w głównej aplikacji.
2. W prawym górnym rogu kliknij przycisk **Nie dotykać!**.
3. Otworzy się ekran symulatora z zielonym stołem i lewym panelem sterowania.

## 2. Co znajduje się na ekranie
- **Lewa kolumna (panel sterowania)**:
  - pole **Stawka początkowa**,
  - suwak **Liczba botów**,
  - przyciski: **Rozdaj nową rękę**, **Następna faza**, **Auto gra**,
  - sekcja statusu: **Pula**, **Faza**, **Stack gracza**,
  - lista **Log rozdań**.
- **Prawa część (stół)**:
  - środek stołu z talią, kartami wspólnymi i pulą,
  - boty rozmieszczone po łuku w górnej części stołu,
  - gracz (`Ty`) zawsze na dole.

## 3. Jak ustawić parametry rozdania
1. Wpisz wartość w polu **Stawka początkowa** (np. `1000`).
2. Przesuń suwak **Liczba botów** (od `1` do `9`).
3. Pod suwakiem od razu widać wybraną liczbę botów.

## 4. Jak rozegrać rozdanie ręcznie
1. Kliknij **Rozdaj nową rękę**.
2. Zobaczysz animację tasowania i rozdania kart prywatnych.
3. Klikaj **Następna faza**, aby przechodzić przez etapy:
   - Preflop,
   - Flop,
   - Turn,
   - River,
   - Showdown.
4. Każdy krok aktualizuje pulę, statusy botów i log zdarzeń.

## 5. Jak działa Auto gra
1. Kliknij **Auto gra**.
2. Symulator sam przejdzie przez wszystkie fazy rozdania.
3. Kliknij ponownie (**Zatrzymaj auto grę**), aby wyłączyć automatyczne przechodzenie.

## 6. Co oznaczają statusy przy graczach
- **W grze** — bot aktywnie uczestniczy w rozdaniu.
- **Pas** — bot spasował.
- **Sprawdza / Przebija** — bot wykonał akcję stawki.
- U gracza na dole pojawia się komunikat o aktualnym stanie i zwycięzcy.

## 7. Powrót do głównej aplikacji
- Nad stołem kliknij link **← Powrót do panelu admina**.
