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

---

## 7) Zmiany w kodzie po wdrożeniu

Plik `Second/app.js`  
Linia ~908  
Było: `let table12RebuyModalDirty = false;`  
Jest:  
- `let table12RebuyModalDirty = false;`  
- `let globalRebuyResetInProgress = false;`

Plik `Second/app.js`  
Linie ~1397-1438  
Było: po `getAutomaticRebuyResetDeletedPaths` od razu zaczynał się helper `getPlayerRebuyTotal`.  
Jest: dodany nowy helper `resetAllTable12Rebuys`, który:
- pokazuje confirm: `Wyzerować wszystkie Rebuy?...`,
- czyści `payments.table12Rebuys` i `pool.rebuyValues`,
- zamyka modal rebuy jeśli był otwarty,
- zapisuje zmiany przez `saveState({ deletedPaths: ["payments.table12Rebuys", "pool.rebuyValues"] })`,
- ustawia komunikat `Wyzerowano wszystkie Rebuy.`

Plik `Second/app.js`  
Linie ~1638-1642 (sekcja `Losowanie graczy`)  
Było:  
`<div class="t-section-grid">` (siatka metadanych była pierwszym elementem sekcji).  
Jest:  
`<div class="admin-table-actions"><button type="button" class="danger" data-role="reset-all-rebuy" ...>Wyzeruj Rebuy</button></div>`  
`<div class="t-section-grid">...`

Plik `Second/app.js`  
Linie ~2006-2009 (lista klikanych ról)  
Było: brak roli `reset-all-rebuy`.  
Jest: dodana rola `"reset-all-rebuy"` w `tournamentClickActionRoles`.

Plik `Second/app.js`  
Linie ~2100-2104 (obsługa `click`)  
Było: brak gałęzi dla resetu globalnego rebuy.  
Jest: dodana obsługa:
- `if (role === "reset-all-rebuy") { await resetAllTable12Rebuys(); return; }`

Plik `Second/docs/README.md`  
Linie ~14-19  
Było: instrukcja `Losowanie graczy` zaczynała się od kroków wypełniania pól metadanych.  
Jest: dodany krok `1a` opisujący kliknięcie przycisku **Wyzeruj Rebuy**, potwierdzenie operacji i skutek resetu.

Plik `Second/docs/Documentation.md`  
Linie ~50-51, ~87-96  
Było: brak opisu globalnego resetu Rebuy.  
Jest: dodany opis przycisku `Wyzeruj Rebuy` oraz pełny opis techniczny działania `resetAllTable12Rebuys()`.

Plik `DetaleLayout.md`  
Linia ~9  
Było: opis sekcji `Losowanie graczy` bez przycisku globalnego resetu rebuy.  
Jest: dodany wpis o czerwonym przycisku destrukcyjnym **Wyzeruj Rebuy** nad siatką metadanych.
