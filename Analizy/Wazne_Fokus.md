# Analiza: ryzyko utraty fokusu podczas autozapisu (2026-02-12)

## Prompt użytkownika
"Zmodyfikuj sekcję "Gry użytkowników" w zakładce "Gry użytkowników".
Jak uzupełniam kolumnę "Nazwa" to po wpisaniu jednego znaku po ok sekundzie aplikacja zapisuje i traci Focus z pola.
Podobny błąd istniał wcześniej w innych polach aplikacji, ale zostało to naprawione.
Popraw zakładkę "Gry użytkowników", żeby kolumna "Nazwa" działała tak samo jak kolumna "Nazwa" w zakładce "Gry admina" - tam ten problem został już rozwiązany.

Dodatkowo przeprowadź analizę i zapisz jej wyniki w folderze Analizy - czy są w aplikacji jeszcze jakieś pola w których ten błąd może wystąpić?"

## Zakres analizy
Przeanalizowano mechanizm przywracania fokusu oparty o:
- `getFocusedAdminInputState(container)`
- `restoreFocusedAdminInputState(container, focusState)`

oraz miejsca, gdzie widok jest przebudowywany po `onSnapshot` i/lub po debounced zapisie.

## Wniosek główny
Błąd tracił fokus, gdy edytowane pole nie miało kompletu atrybutów `data-*` wymaganych do ponownego odnalezienia kontrolki po re-renderze.

## Miejsca sprawdzone

### 1) Zakładka „Gry admina”
- Tabela gier: pola `Rodzaj Gry`, `Data`, `Nazwa` mają pełne `data-focus-target`, `data-section`, `data-table-id`, `data-column-key`.
- Modal „Szczegóły”: pola wejściowe też mają metadane fokusu.
- Ocena: **niskie ryzyko** opisanego błędu.

### 2) Zakładka „Gry użytkowników” (admin + user manager)
- Tabela gier użytkowników przed poprawką miała brak metadanych fokusu dla pól wiersza.
- To powodowało utratę fokusu po autozapisie szczególnie w kolumnie `Nazwa`.
- Po poprawce metadane dodano dla `Rodzaj Gry`, `Data`, `Nazwa`.
- Ocena po poprawce: **niskie ryzyko** w tej części.

### 3) Inne sekcje aplikacji używające debounced update + restore
- „Gracze”, „Stoły”, „Gry admina”, „Statystyki” korzystają z mechanizmu dataset i mają przypisane identyfikatory pola.
- Ocena: **niskie ryzyko** regresji tego samego typu.

## Czy są jeszcze pola, gdzie błąd może wystąpić?
**Tak, potencjalnie wszędzie tam, gdzie jednocześnie występują trzy warunki:**
1. autozapis (np. debounced input),
2. przebudowanie DOM po snapshot/re-render,
3. brak spójnych `data-*` na kontrolce formularza.

W aktualnym kodzie największe ryzyko dotyczy ewentualnych przyszłych pól dodanych bez metadanych fokusu, a nie istniejących już pól objętych mechanizmem.

## Rekomendacja prewencyjna
Dla każdego nowego pola edycyjnego w widokach przebudowywanych dynamicznie stosować checklistę:
- `data-focus-target`
- `data-section`
- `data-table-id` / `data-row-id`
- `data-column-key`

oraz test ręczny: wpisywanie ciągłe przez 3–5 sekund bez ponownego klikania po każdym autozapisie.

---

# Analiza: problemy z fokusem i Backspace (2026-02-27)

## Prompt użytkownika
"Przeczytaj analizę Analizy/Wazne_Fokus.md
Napotkałem kilka problemów z fokusem w aplikacji.
Przykładowo w polu "Buy-In" (Tabela1, zakładka Kalkulator) zdaje się wcale nie działać.
Dodatkowo w kilku polach aplikacji (np. Nazwa w "Gracze" albo Wypłata w "Kalkulator" w Tabela9) jak użytkownik wpisze jakąś wartość a następnie trzyma Backspace, żeby skasować to po ok sekundzie kursor przeskakuje omijając kilka znaków. W efekcie nie kasuje się cała treść pola i zostaje kilka znaków.
Zweryfikuj przyczynę i dopisz ją oraz rozwiązanie do pliku Analizy/Wazne_Fokus.md"

## Zweryfikowana przyczyna
Problem nie wynika z pojedynczego pola, tylko z kombinacji dwóch mechanizmów:

1. **Globalny re-render podczas edycji**
   - W `Kalkulatorze` wiele pól (`Tabela1`, `Tabela9`) wykonuje `render()` już w `input` handlerze.
   - To przebudowuje DOM przy każdym znaku i odtwarza fokus/selektor przez `getFocusedAdminInputState` + `restoreFocusedAdminInputState`.

2. **Nadpisywanie stanu przez `onSnapshot` w trakcie pisania**
   - W `Kalkulatorze` i `Graczach` snapshot z Firestore zawsze podmienia lokalny stan i robi pełny render.
   - Podczas trzymania Backspace powstaje wyścig: użytkownik dalej kasuje lokalnie, a po ~debounce/network wraca starsza wartość ze snapshotu i kursor jest przywracany dla już nieaktualnego tekstu.
   - Skutek praktyczny: „przeskakiwanie” kursora i pozostawanie kilku znaków (część usunięć jest cofana przez później dostarczony snapshot).

## Dlaczego wygląda to jak „Buy-In w Tabela1 nie działa”
`Buy-In` w Tabela1 ma poprawne metadane fokusu, ale jest szczególnie podatny, bo:
- renderuje się natychmiast na każdy wpis,
- dodatkowo jest odświeżany przez snapshot dokumentu kalkulatora,
- więc wpisywanie/kasowanie może być cyklicznie nadpisywane i sprawiać wrażenie, że pole „nie przyjmuje” zmian.

## Zalecane rozwiązanie
Wdrożyć ochronę przed nadpisaniem aktywnie edytowanego pola przez snapshot:

1. **Wprowadzić flagę lokalnej edycji (dirty/edit lock)** na poziomie sekcji (`players`, `calculator`) i/lub klucza pola (`rowId+columnKey`).
2. **W `onSnapshot` nie wykonywać bezwarunkowego podmiany stanu**, gdy:
   - jest aktywna edycja danego pola **lub**
   - istnieje oczekujący debounce dla tego obszaru.
3. **Po zakończeniu edycji (`blur`) lub po potwierdzonym zapisie** dopiero synchronizować snapshot do UI.
4. (Dodatkowo) **Scalić aktualizację selekcji/fokusu z ochroną wersji danych** (np. `updatedAt`/lokalny `revision`), aby nie przywracać kursora dla starszego stanu niż aktualnie wpisywany.

## Efekt po poprawce
- Trzymanie Backspace usuwa tekst liniowo do końca (bez „przeskoków”).
- `Buy-In` w Tabela1 i `Wypłata`/`Nazwa` zachowują stabilny fokus podczas autozapisu.
- Snapshot nadal synchronizuje dane, ale nie cofa aktywnej edycji użytkownika.

---

# Aktualizacja po wdrożeniu zmian (2026-03-27)

## Prompt użytkownika
"Zmodyfikuj moduł Second

1. Panel \"Półfinał\". TABELA21. Kolumna STACK. Ma to być pole nieedytowalne. Tak jak w kolumnie GRACZ i LP w TABELA21. Dodatkowo zrób tę kolumnę węższą. Niech będzie takiej jak kolumna STACK w TABELA FINAŁOWA

2. Panel \"Półfinał\". TABELA FINAŁOWA. Kolumna STACK. Ma to być pole edytowalne. Ma być możliwość tylko wpisania wartości liczbowej. Zadbaj o to, żeby nie powtórzył się błąd z Analizy/Wazne_Fokus.md oraz, żeby urządzenie mobilne nie przestawiało typu klawiatury i pozwalało wpisać tylko cyfry.
2.1. Domyślnie ma być wartość 0
2.2. W TABELA23 w kolumnie STACK ma być wyświetlana wartość jaką użytkownik wpisze w TABELA FINAŁOWA w kolumnie STACK."

## Zmiany w kodzie (przed/po)

Plik `Second/app.js`
- Linia (sekcja budowania `Tabela FINAŁOWA`):
  - Było: `...<td>${formatCellNumber(row.semiStack)}</td>...`
  - Jest: `...<td><input class="admin-input t-stack-input" data-role="semi-final-stack" ... type="text" inputmode="numeric" pattern="[0-9]*" ...></td>...`
- Linia (sekcja `Tabela21.STACK`):
  - Było: `...<input class="admin-input" data-role="semi-stack" ... type="tel" ... data-focus-target="1" ...>`
  - Jest: `...<input class="admin-input t-stack-input" data-role="semi-stack" ... type="text" ... readonly tabindex="-1" aria-readonly="true">`
- Linia (sekcja mapowania finalistów do `Tabela23`):
  - Było: `stack: String(formatCellNumber(row.semiStack)),`
  - Jest: `stack: String(formatCellNumber(row.finalStack)),`
- Linia (handler `input`):
  - Było: lista ról do `digitsOnly(...)` bez `semi-final-stack`.
  - Jest: lista ról do `digitsOnly(...)` zawiera także `semi-final-stack`.
- Linia (handler `input`):
  - Było: brak obsługi `semi-final-stack`.
  - Jest: dodany zapis `semi.assignments[playerId].finalStack = target.value || "0"` + `render()`.

Plik `Second/styles.css`
- Linia (nowy styl szerokości stack):
  - Było: brak dedykowanej klasy szerokości dla półfinałowych pól `STACK`.
  - Jest:
    - `.t-stack-input {`
    - `  width: 96px;`
    - `  min-width: 96px;`
    - `  text-align: right;`
    - `}`
