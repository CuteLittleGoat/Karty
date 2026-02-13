# Analiza wdrożenia funkcji „Notatki” przy tworzeniu gry i w „Gry do potwierdzenia”

## Prompt użytkownika (kontekst)
> Następnie przeprowadź drugą analizę i utwórz plik Analizy/Notatki.md
> Przy tworzeniu gier (zarówno przez zakładkę "Gry admina" oraz "Gry użytkowników) obok przycisku "Szczegóły" dodaj przycisk "Notatki".
> Podobna funkcjonalność istnieje już przy "Podsumowanie gry".
> W okienku "Notatki" przy "Tworzenie Gry" ma się pojawiać domyślnie tekst (potem domyślny tekst może się zmienić):
> Przewidywani gracze:
> Rebuy:
> Addon:
> Inne:
>
> Admin może skasować te cztery linie domyślnie wpisanego tekstu, może dowolnie edytować, modyfikować itd. Dodaj przycisk "Zapisz" i "Domyślne". Przycisk "Zapisz" zapisuje dane. Przycisk "Domyślne" (zrób go na czerwono jak Usuń w innych miejscach) przywraca wartości domyślne.
> Przecztyaj plik Analizy/Wazne_Fokus i zadbaj, żeby opisany tam błąd się nie pojawiał.
> Przycisk "Notatki" ma się też pojawić w sekcji "Gry do potwierdzenia". Użytkownik klikając go może odczytać wiadomość (tylko odczyt) przygotowaną przez osobę tworzącą daną grę.
> Przeprowadź analizę wdrożenia takiej funkcjonalności. Sprawdź czy obecna konfiguracja Firebase jest wystarczająca.

---

## 1. Stan obecny (co już jest w aplikacji)

1. Istnieje wspólny modal notatek (`getSummaryNotesModalController()`), używany dziś głównie w sekcji „Podsumowanie gry”.
2. Modal obsługuje:
   - `open({ gameId, gameName, notes, canWrite, onSave, triggerButton })`,
   - zapis przez przycisk `Zapisz`,
   - przycisk czerwony `Usuń` (czyści notatkę do pustego tekstu),
   - tryb read-only (`canWrite: false`),
   - powrót fokusu do przycisku otwierającego po zamknięciu.
3. Notatki są już zapisywane do pola `notes` w dokumencie gry (`Tables` i `UserGames`).

Wniosek: fundament funkcjonalny jest gotowy; potrzebne są rozszerzenia UX i podpięcie przycisków w nowych miejscach.

---

## 2. Wymagane zmiany funkcjonalne

## 2.1. „Gry admina” i „Gry użytkowników” — przycisk „Notatki” obok „Szczegóły”

### Miejsca integracji
- `initAdminGames()` → `renderGamesTable()`
- `initUserGamesManager(...)` → `renderGamesTable()`

Dziś w kolumnie „Nazwa” jest układ: `input Nazwa + przycisk Szczegóły`.
Należy rozszerzyć układ do: `input Nazwa + Szczegóły + Notatki`.

### Zachowanie przycisku
- Otwiera ten sam modal notatek.
- Tytuł: np. `Notatki: <nazwa gry>`.
- Tryb:
  - **admin**: `canWrite: true`,
  - **user manager / uprawniony user**: zgodnie z `canWrite()`.

## 2.2. Domyślny tekst w notatkach przy tworzeniu gry
Wymagany default:

Przewidywani gracze:
Rebuy:
Addon:
Inne:

### Rekomendowane wdrożenie
1. Dodać stałą, np. `DEFAULT_GAME_NOTES_TEMPLATE`.
2. Przy tworzeniu nowej gry (`addGameButton` w admin/user manager):
   - zapisać od razu `notes: DEFAULT_GAME_NOTES_TEMPLATE` w nowym dokumencie.
3. Przy otwieraniu modala:
   - jeśli `notes` jest pusty/nieustawiony, pokazać template jako wartość startową.

To zapewni, że każda nowa gra ma domyślną treść od razu dostępna dla „Notatki” i dla widoków odczytu.

## 2.3. Zmiana przycisku „Usuń” na „Domyślne”
W aktualnym modalu czerwony przycisk czyści notatkę do `""`.
Wymaganie: czerwony przycisk ma przywracać wartości domyślne.

### Zmiana logiki
- Zmienić etykietę przycisku na `Domyślne`.
- Akcja przycisku: zapis `DEFAULT_GAME_NOTES_TEMPLATE` zamiast pustego stringa.
- Styl pozostaje `danger` (jak „Usuń” w innych miejscach) — zgodnie z wymaganiem.

---

## 3. „Gry do potwierdzenia” — przycisk „Notatki” tylko do odczytu

## 3.1. Zakres
Dotyczy widoku użytkownika „Gry do potwierdzenia” (`initConfirmationsTab`, tabela z akcjami Potwierdź/Anuluj).

## 3.2. Integracja
W komórce akcji dodać trzeci przycisk `Notatki`.

Po kliknięciu:
- otworzyć ten sam modal notatek,
- przekazać `notes` z dokumentu gry,
- ustawić `canWrite: false` (tylko odczyt),
- ukryć/disabled zapisu i przycisku czerwonego lub pozostawić disabled + komunikat „Brak uprawnień do edycji notatek.”.

## 3.3. Dane
`notes` jest polem dokumentu gry i jest dostępne przy pobieraniu listy gier do potwierdzenia (`getActiveGamesForConfirmationsFromCollections` zwraca cały obiekt gry), więc dodatkowa kolekcja nie jest wymagana.

---

## 4. Wymagania z analizy „Wazne_Fokus” (ryzyko utraty fokusu)

Wnioski z `Analizy/Wazne_Fokus`:
- problem pojawia się przy autozapisie + re-render + braku metadanych `data-*`.

Dla funkcji „Notatki” rekomendacja, aby nie wprowadzić regresji:

1. **Nie używać autozapisu podczas pisania notatki**.
   - Zostawić model akcyjny: zapis tylko po kliknięciu `Zapisz` lub `Domyślne`.

2. **Zachować mechanizm powrotu fokusu**.
   - Kontynuować przekazywanie `triggerButton` do `open(...)` i przy zamknięciu `focus()` na ten przycisk.

3. **Nowe inputy w tabelach nadal muszą mieć `data-focus-target`, `data-section`, `data-table-id`, `data-column-key`**.
   - Dla dodawanego przycisku `Notatki` nie jest to krytyczne (to nie input z autozapisem), ale nie wolno usuwać istniejących datasetów z pola `Nazwa`.

Wniosek: przy zachowaniu obecnego modelu modala notatek ryzyko błędu fokusu jest niskie.

---

## 5. Czy obecna konfiguracja Firebase jest wystarczająca?

## 5.1. Model danych
Tak — **schemat danych jest wystarczający**, bo:
- notatka siedzi w istniejącym polu `notes` dokumentu gry,
- to działa już dziś w „Podsumowanie gry”,
- nie trzeba dodawać nowych kolekcji ani dokumentów.

## 5.2. Reguły bezpieczeństwa (kluczowe)
Warunek: Firestore Rules muszą zezwalać na:
1. zapis `notes` w kolekcjach gier (`Tables`, `UserGames`) dla ról edytujących,
2. odczyt `notes` dla graczy z dostępem do „Gry do potwierdzenia”.

Jeżeli obecne reguły już dopuszczają ten sam zakres co dziś (a notatki w podsumowaniu zapisują się poprawnie), to dodatkowa konfiguracja Firebase **nie jest wymagana**.

Jeżeli pojawi się `permission-denied` w nowym miejscu, to będzie to kwestia reguł (nie modelu danych).

---

## 6. Plan wdrożenia (minimalny, bez przebudowy architektury)

1. Dodać stałą `DEFAULT_GAME_NOTES_TEMPLATE`.
2. Podczas tworzenia gry zapisywać `notes: DEFAULT_GAME_NOTES_TEMPLATE`.
3. Rozszerzyć `getSummaryNotesModalController()`:
   - czerwony przycisk zmienić na `Domyślne`,
   - akcja przywraca template.
4. Dodać przycisk `Notatki` obok `Szczegóły`:
   - `initAdminGames().renderGamesTable()`,
   - `initUserGamesManager().renderGamesTable()`.
5. Dodać przycisk `Notatki` w `initConfirmationsTab()` jako read-only.
6. Testy manualne:
   - nowa gra ma template,
   - edycja + zapis działa,
   - „Domyślne” przywraca template,
   - confirmations pokazuje notatkę tylko do odczytu,
   - brak utraty fokusu przy wpisywaniu w `Nazwa` i przy pracy z modalem.

---

## 7. Ocena końcowa

- Funkcję da się wdrożyć **bez nowej kolekcji Firestore** i bez zmian architektury.
- Najbezpieczniej rozszerzyć istniejący modal notatek (reuse), zamiast tworzyć drugi modal.
- Klucz jakości: utrzymanie modelu zapisu „na kliknięcie”, co jest zgodne z wnioskami z `Wazne_Fokus` i minimalizuje ryzyko regresji focusa.
