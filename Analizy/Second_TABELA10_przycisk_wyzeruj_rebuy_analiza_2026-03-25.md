# Analiza modułu Second — przycisk usuwający wszystkie `RebuyX`

Data: 2026-03-25  
Moduł: `Second`  
Zakres: wyłącznie globalny reset `RebuyX` (bez przenumerowania po usunięciu stołu)

## Prompt użytkownika
> Przeczytaj analizę Analizy/Second_TABELA10_rebuy_po_usunieciu_stolu_analiza_2026-03-25_rozszerzenie_reset_i_przenumerowanie.md
>
> Zignoruj informacje o przenumerowaniu po usunięciu stołu.
> Przygotuj nowy plik analizy skupiający się tylko na przycisku usuwającym wszystkie "RebuyX".

---

## 1) Cel zmiany

Celem jest dodanie w panelu „Losowanie Graczy” dedykowanego, destrukcyjnego przycisku (`Wyzeruj Rebuy`), który jednym działaniem usuwa wszystkie wpisy `RebuyX` dla wszystkich graczy.

Założenie biznesowe:
- administrator ma szybko przygotować kolejną grę,
- bez usuwania graczy,
- bez utraty PIN-ów i uprawnień,
- z całkowicie wyczyszczonym obszarem rebuy.

---

## 2) Zakres funkcjonalny (tylko reset globalny)

### 2.1 UI
- Nowy czerwony przycisk: `Wyzeruj Rebuy`.
- Lokalizacja: panel „Losowanie Graczy”, górna część (np. nad kolumną `ORGANIZATOR`).
- Styl destrukcyjny i jednoznaczne oznaczenie ryzyka.

### 2.2 Potwierdzenie
Przed wykonaniem operacji powinien pojawić się modal/confirm z ostrzeżeniem:
- Tytuł: `Wyzerować wszystkie Rebuy?`
- Treść: informacja, że operacja jest nieodwracalna.
- Akcje: `Anuluj` / `Tak, wyzeruj Rebuy`.

### 2.3 Skutek operacji
Po potwierdzeniu system powinien:
1. usunąć wszystkie dane z kolumn `Rebuy1`, `Rebuy2`, itd. (dla wszystkich graczy),
2. wyzerować licznik/sekwencję rebuy tak, aby kolejny dodany wpis startował od `Rebuy1`,
3. pozostawić bez zmian:
   - listę graczy,
   - przypisania i uprawnienia,
   - numery PIN,
   - pozostałe dane niezwiązane z rebuy.

---

## 3) Założenia techniczne (wysoki poziom)

### 3.1 Rekomendowany model
- Operacja typu hard reset (fizyczne usunięcie danych rebuy), nie tylko ukrycie.
- Zapis atomowy (jedna spójna operacja), aby uniknąć stanu częściowego.

### 3.2 Integracja z aktualną logiką
- Funkcja resetu powinna korzystać ze wspólnej warstwy operującej na danych rebuy.
- Reset powinien aktualizować wszystkie widoki/agregaty zależne od rebuy (liczniki, sumy, tabelki).

### 3.3 Oczekiwany stan po operacji
- Brak aktywnych wpisów rebuy.
- Kolejne ręczne dodanie rebuy tworzy ponownie `Rebuy1`.

---

## 4) Ryzyka i zabezpieczenia

### Ryzyka
- przypadkowe użycie przycisku i nieodwracalna utrata danych rebuy,
- niespójność UI, jeśli część komponentów nie odświeży się po resecie.

### Zabezpieczenia
- wyraźny modal potwierdzający,
- opcjonalnie dodatkowe zabezpieczenie (np. wpisanie słowa `RESET`),
- blokada wielokliku podczas wykonywania operacji,
- komunikat końcowy o sukcesie (np. „Wyzerowano wszystkie Rebuy”).

---

## 5) Scenariusz testowy (akceptacyjny)

1. Istnieją dane `RebuyX` u wielu graczy.
2. Admin klika `Wyzeruj Rebuy`.
3. System pokazuje ostrzeżenie i prośbę o potwierdzenie.
4. Po potwierdzeniu:
   - wszystkie wpisy rebuy znikają,
   - agregaty rebuy pokazują wartości zerowe,
   - dane graczy/PIN/uprawnienia pozostają bez zmian,
   - nowy dodany wpis otrzymuje numerację od `Rebuy1`.

---

## 6) Rekomendacja

Wdrożyć przycisk `Wyzeruj Rebuy` jako globalną, potwierdzaną operację hard reset dla wszystkich `RebuyX`. Takie podejście najpełniej realizuje cel operacyjny: szybki start nowej gry na tej samej bazie graczy, bez utraty konfiguracji kont.
