# Karty — Instrukcja użytkownika (UI)

> Ten dokument opisuje **wyłącznie obsługę interfejsu** aplikacji: co kliknąć, co wpisać i jaki efekt zobaczysz.

## 1. Układ ekranu po wejściu do aplikacji

Po otwarciu strony zobaczysz układ podzielony na sekcje (karty).

- Góra strony: nagłówek aplikacji i przyciski administracyjne.
- Środek: siatka kart z funkcjami (administracja, gry, statystyki, czat, regulamin).
- Wiele elementów pojawia się zależnie od tego, czy jesteś administratorem albo graczem z poprawnym PIN-em.

### Zakres UI tej aplikacji
- Interfejs opisany w tym dokumencie dotyczy wyłącznie funkcji projektu **Karty**.
- W UI **nie ma** ekranów, przycisków ani formularzy dla kolekcji: `Nekrolog_config`, `Nekrolog_refresh_jobs`, `Nekrolog_snapshots` (to zasoby innego projektu).

### Ostrzeżenie bezpieczeństwa danych (widoczne w „Strefie gracza”)
- Nad zakładkami użytkownika zawsze wyświetla się czerwone ostrzeżenie o publicznym charakterze danych.
- Komunikat przypomina, aby **nigdy** nie wpisywać w czacie i formularzach gier danych wrażliwych (np. adres, nazwisko).
- To ostrzeżenie jest stałym elementem interfejsu użytkownika i nie wymaga żadnego kliknięcia ani PIN-u, aby je zobaczyć.

## 2. Panel administratora — zakładki i nawigacja

W karcie **„Panel Administratora”** na górze są zakładki.

### Jak przełączać zakładki
1. Kliknij nazwę zakładki (np. „Aktualności”, „Czat”, „Gracze”, „Gry admina”).
2. Kliknięta zakładka podświetli się jako aktywna.
3. Treść pod spodem zmieni się na odpowiedni moduł.

### Przycisk „Odśwież”
1. Wejdź do konkretnej zakładki panelu.
2. Kliknij **„Odśwież”** w prawym górnym rogu panelu.
3. Dane aktualnej zakładki zostaną ponownie pobrane i odświeżone.

---

## 3. Aktualności (zakładka administratora)

### Publikacja wiadomości dla graczy
1. Otwórz zakładkę **„Aktualności”**.
2. W polu **„Treść wiadomości”** wpisz tekst komunikatu.
3. Kliknij **„Wyślij”**.
4. Komunikat statusu obok przycisku poinformuje o powodzeniu lub błędzie.
5. Najnowsza wiadomość pojawi się użytkownikom w sekcji aktualności.
6. Każde kolejne kliknięcie **„Wyślij”** podmienia poprzednią treść (w UI zawsze działa to jako jedna bieżąca wiadomość „Najnowsze”).

**Edytowalne:** pole tekstowe wiadomości.  
**Nieedytowalne:** pole statusu (informacja systemowa).

---

## 4. Czat (administrator)

### Moderacja wiadomości
1. Otwórz zakładkę **„Czat”**.
2. Przejrzyj listę wpisów na czacie.
3. Aby wyczyścić starsze wiadomości, kliknij **„Usuń starsze niż 30 dni”**.
4. Sprawdź komunikat statusu obok przycisku.

**Edytowalne:** brak klasycznych pól formularza; używasz przycisków akcji.  
**Nieedytowalne:** lista historycznych wiadomości (podgląd moderacyjny).

---

## 5. Regulamin (administrator)

### Ustawianie zasad
1. Otwórz zakładkę **„Regulamin”**.
2. W polu **„Treść regulaminu”** wpisz pełny tekst zasad.
3. Kliknij **„Zapisz”**.
4. Odczytaj status zapisu obok przycisku.
5. Treść regulaminu będzie widoczna dla użytkowników w sekcji regulaminu.

**Edytowalne:** duże pole tekstowe regulaminu.  
**Nieedytowalne:** pole statusu.

---

## 6. Gracze (administrator)

W tej zakładce zarządzasz listą graczy, PIN-ami i uprawnieniami.

### Dodanie gracza
1. Otwórz zakładkę **„Gracze”**.
2. Sprawdź wiersz informacyjny **„Liczba dodanych graczy”** (nad tabelą) — pokazuje bieżącą liczbę graczy w aplikacji.
3. Kliknij przycisk dodania nowego gracza (jeśli jest dostępny w widoku).
4. Uzupełnij dane w nowym wierszu/formularzu:
   - nazwa gracza,
   - PIN,
   - dostęp do aplikacji,
   - uprawnienia zakładek.
5. Zapisz zmiany przyciskiem w danym wierszu/sekcji.

### Edycja gracza
1. Znajdź gracza na liście.
2. Zmień pola w jego wierszu.
3. Zatwierdź zapis.

### Uprawnienia
1. W wierszu gracza kliknij przycisk uprawnień.
2. W oknie/modalu zaznacz lub odznacz dostępne zakładki.
3. Bez zamykania okna możesz od razu zmieniać kolejne checkboxy — każda zmiana zapisuje się na bieżąco.
4. Zamknij okno po zakończeniu edycji.

**Edytowalne:** nazwa, PIN, checkbox „Aplikacja”, wybór uprawnień.  
**Automatyczne/systemowe:** statusy zapisu i walidacja formatu PIN.

---

## 7. Najbliższa gra

### Widok użytkownika
1. Otwórz zakładkę **„Najbliższa gra”**.
2. Wpisz PIN z uprawnieniem do tej zakładki i kliknij **„Otwórz”**.
3. Po poprawnej autoryzacji zobaczysz tabelę tylko do odczytu z kolumnami:
   - **Rodzaj gry**,
   - **Data**,
   - **Nazwa**,
   - **CzyWszyscyPotwierdzili** (*Tak/Nie*).
4. W kolumnie **CzyWszyscyPotwierdzili** wartość domyślna to **Nie**.
5. Wartość zmienia się na **Tak** dopiero wtedy, gdy każdy gracz wpisany do szczegółów gry zostanie potwierdzony w zakładce **„Gry do potwierdzenia”**.
6. Wiersze są sortowane po kolumnie **Data**: najnowsza gra jest najwyżej.

### Widok administratora
1. Otwórz **Panel Administratora**.
2. Kliknij zakładkę **„Najbliższa gra”**.
3. Zobaczysz tabelę z kolumnami:
   - **Rodzaj gry**,
   - **Data**,
   - **Nazwa**,
   - **CzyWszyscyPotwierdzili** (*Tak/Nie*),
   - **Akcje**.
4. W kolumnie **CzyWszyscyPotwierdzili** wartość domyślna to **Nie**.
5. Wartość przełącza się na **Tak** dopiero wtedy, gdy wszyscy gracze zapisani do gry zostaną potwierdzeni w zakładce **„Gry do potwierdzenia”**.
6. W kolumnie **Akcje** kliknij przycisk **„Usuń Całkowicie”**, jeżeli chcesz usunąć śmieciowy wpis.
7. Operacja **„Usuń Całkowicie”** kasuje grę bezpośrednio z listy i z bazy danych aplikacji (narzędzie porządkowe dla admina).

### Jakie gry są wyświetlane
- Do tabeli trafiają gry utworzone w zakładkach **„Gry admina”** i **„Gry użytkowników”**.
- W tabeli pokazywane są tylko gry z odznaczonym checkboxem **CzyZamknięta**.
- Zaznaczenie checkboxa **CzyZamknięta** ukrywa grę z zakładki **„Najbliższa gra”**.

---

## 8. Gry admina

Sekcja służy do szczegółowej pracy na rozliczeniach i punktacji.

### Podstawowy przepływ
1. Otwórz zakładkę **„Gry admina”**.
2. W lewym panelu **„Lata”** kliknij rok, dla którego chcesz pracować.
3. W sekcji **„Tabele Gier”** kliknij wiersz gry i w kolumnie **„Nazwa”** użyj przycisku **„Szczegóły”**, aby wejść do pełnej edycji graczy.
4. W modalu szczegółów zmieniaj wartości i zamknij okno przyciskiem `×`.


### Podsumowanie gry — przycisk „Notatki po grze”
1. W zakładce **„Gry admina”** wybierz rok po lewej stronie.
2. Przejdź do karty **„Podsumowanie gry ...”** dla wybranej pozycji.
3. W tej samej linii, przed tytułem **„Podsumowanie gry ...”**, kliknij przycisk **„Notatki po grze”**.
4. Otworzy się okno notatek z przyciskami **„Zapisz”** i **„Usuń”**.
5. Wpisz treść podsumowania i kliknij **„Zapisz”**, aby zapisać notatkę po grze.
6. Kliknij **„Usuń”**, aby całkowicie wyczyścić treść notatki po grze.
7. Zamknij okno przyciskiem `×`, kliknięciem poza oknem lub klawiszem `Esc`.


### Uwaga o przyciskach notatek
- W zakładce **„Gry admina”** przy tabeli gier dostępny jest przycisk **„Szczegóły”** (bez przycisku „Notatki do gry”).
- Przycisk **„Notatki do gry”** pozostaje dostępny w sekcji **„Gry użytkowników”**.

### Które pola wpisujesz ręcznie
- Nazwa gracza,
- wpisowe,
- rebuy,
- wypłata,
- część pól punktacji (zależnie od kolumny).

### Które pola liczą się automatycznie
- Podsumowania `+/-`,
- agregaty i sumy tabel,
- część kolumn statystycznych,
- kolejność/ranking po przeliczeniu.

---

## 9. Statystyki

### 9.1 Wejście do „Statystyki” w widoku użytkownika (PIN + uprawnienia)
1. Otwórz kartę **„Statystyki”** w górnym pasku użytkownika.
2. Zobaczysz bramkę PIN z opisem „Wpisz PIN z uprawnieniem Statystyki...”.
3. Wpisz 5-cyfrowy PIN gracza i kliknij **„Otwórz”**.
4. Jeśli PIN jest poprawny **i** gracz ma nadane uprawnienie „Statystyki” w zakładce **Gracze**, tabela zostanie pokazana.
5. Jeśli PIN jest błędny albo gracz nie ma uprawnienia, zobaczysz komunikat o braku dostępu.

### 9.2 Nadanie uprawnienia do „Statystyki” (administrator)
1. Otwórz **Panel Administratora** → zakładka **„Gracze”**.
2. W wierszu wybranego gracza kliknij **„Edytuj”** w sekcji uprawnień.
3. W oknie uprawnień zaznacz pozycję **„Statystyki”**.
4. Zapisz/pozostaw zmianę (aplikacja zapisuje uprawnienia i odświeża listę).
5. Od tej chwili PIN tego gracza może otwierać zakładkę **„Statystyki”** w widoku użytkownika.

### 9.3 Sterowanie kolumnami użytkownika przez admina
1. Otwórz **Panel Administratora** → **„Statystyki”**.
2. Wybierz rok z lewego panelu **„Lata”**.
3. W nagłówku każdej kolumny tabeli graczy znajdziesz checkbox.
4. **Odznacz checkbox** kolumny, którą chcesz ukryć w widoku użytkownika.
5. **Zaznacz checkbox** ponownie, aby przywrócić kolumnę użytkownikowi.

### 9.4 Co widzi administrator, a co użytkownik
- **Administrator**: zawsze pełny zestaw kolumn (niezależnie od stanu checkboxów).
- **Użytkownik**: tylko kolumny zaznaczone przez administratora w tej samej statystyce i roku.
- Ustawienie checkboxów wpływa również na eksport danych w widoku użytkownika.

### 9.5 Praca na danych statystyk
1. Wybierz rok po lewej stronie.
2. Odczytaj sekcję „Liczba gier / Łączna pula”.
3. Odczytaj tabelę graczy (kolumny zależne od konfiguracji admina).
4. Kliknij **„Eksportuj”**, aby pobrać plik XLSX z aktualnie widocznym zakresem danych.

---

## 10. Gry użytkowników

### Dodanie własnej gry
1. Otwórz zakładkę **„Gry użytkowników”**.
2. Jeśli widzisz bramkę PIN, wpisz PIN i zatwierdź.
3. Kliknij przycisk **„Dodaj grę”**.
4. System od razu tworzy kompletny wpis z wymaganymi polami:
   - **Rodzaj gry** = `Cashout` (ustawiane automatycznie),
   - **Data** = bieżący dzień (ustawiane automatycznie),
   - **Nazwa** = kolejna nazwa typu `Gra X` (ustawiane automatycznie).
5. Aplikacja blokuje utworzenie gry, jeśli którekolwiek z pól **Rodzaj gry / Data / Nazwa** byłoby puste.

### Edycja własnej gry
1. Wybierz rok i grę z listy.
2. Otwórz szczegóły.
3. Przy dodawaniu nowego wiersza pole **Wypłata** domyślnie ustawiane jest na `0`.
4. Możesz ręcznie zmienić wartość **Wypłata** na dowolną liczbę.
5. Zmień pozostałe dane wierszy i zapisz.

### Co jest liczone automatycznie
- Podsumowanie `+/-` per wiersz,
- część pól podsumowań i sum.

### Notatki przy tworzeniu/edycji gry (kolumna „Nazwa”)
1. Wejdź do tabeli gier w zakładce **„Gry użytkowników”**.
2. W kolumnie **„Nazwa”** przy każdej grze są przyciski **„Szczegóły”** i **„Notatki do gry”**.
3. Kliknij **„Notatki do gry”**, aby otworzyć notatkę planistyczną dla danej gry.
4. Dla nowo dodanej gry zobaczysz domyślny szablon:
   - `Rodzaj gry:`
   - `Przewidywani gracze:`
   - `Stack:`
   - `Wpisowe:`
   - `Rebuy:`
   - `Add-on:`
   - `Blindy:`
   - `Organizacja:`
   - `Podział puli:`
5. Możesz dowolnie edytować treść (w tym usunąć cały szablon) i kliknąć **„Zapisz”**.
6. Kliknij **„Domyślne”**, aby przywrócić powyższy szablon.
7. Po kliknięciu **„Zapisz”** treść notatki jest zapisywana tylko jako aktualny typ notatki (do gry), bez łączenia ze starym typem notatek.

### Podsumowanie gry — jak odczytać
1. W zakładce **„Gry admina”** lub **„Gry użytkowników”** wybierz rok z lewego panelu.
2. Kliknij grę, którą chcesz przeanalizować.
3. W sekcji **„Podsumowanie gry …”** odczytaj najpierw wiersz **„Rodzaj gry”** (np. `Cashout` albo `Turniej`).
4. Tuż pod nim odczytaj wiersz **„Pula”**.
5. Niżej sprawdź tabelę graczy i wartości finansowe.

---

## 11. Gry do potwierdzenia

### Potwierdzenie wyniku
1. Otwórz zakładkę **„Gry do potwierdzenia”**.
2. Przejdź bramkę PIN (jeśli wymagana).
3. Z listy wybierz pozycję oczekującą.
4. Kliknij **„Potwierdź”** albo **„Anuluj”**.
5. Sprawdź podświetlenie wiersza i status po wykonaniu akcji.

### Podgląd notatek gry w „Gry do potwierdzenia”
1. W tym samym wierszu kliknij **„Notatki do gry”**.
2. Otworzy się okno notatek w trybie tylko do odczytu.
3. Możesz przeczytać treść przygotowaną wcześniej w przycisku **„Notatki do gry”** przez osobę tworzącą grę.
4. Nie możesz zapisać zmian z tego widoku (to podgląd).

**Edytowalne:** decyzja potwierdzenia/odrzucenia.  
**Nieedytowalne:** notatka gry i dane źródłowe gry zgłoszonej do akceptacji.

---

## 12. Czat użytkownika

### Wysyłanie wiadomości
1. Otwórz zakładkę czatu użytkownika.
2. Wpisz PIN (jeśli ekran wymaga autoryzacji).
3. W polu wiadomości wpisz treść.
4. Kliknij wyślij.
5. Wiadomość pojawi się na liście czatu.

**Edytowalne:** pole treści wiadomości.  
**Nieedytowalne:** historyczne wiadomości innych użytkowników.

---

## 13. Bramki PIN — jak działają w UI

W wybranych sekcjach aplikacja pokazuje formularz PIN.

1. Wpisz 5 cyfr.
2. Kliknij przycisk zatwierdzenia.
3. Przy poprawnym PIN sekcja zostaje odblokowana.
4. Przy błędnym PIN zobaczysz komunikat błędu.

Każda sekcja może mieć własny stan odblokowania, więc odblokowanie jednego modułu nie zawsze odblokowuje wszystkie.

---

## 14. Najczęstsze scenariusze „krok po kroku”

### A) Chcę dodać nowy stół i pierwszych graczy
1. Panel administratora → **Gry admina**.
2. Kliknij **dodaj grę/stół**.
3. Wpisz datę i nazwę.
4. Zapisz.
5. Otwórz szczegóły nowej gry.
6. Dodaj kolejne wiersze graczy i uzupełnij pola finansowe.
7. Zapisz każdy wiersz.

### B) Chcę zmienić stawkę/wartości gracza w istniejącej grze
1. Panel administratora → **Gry admina**.
2. Wybierz grę z listy.
3. Otwórz szczegóły.
4. Edytuj pole wpisowego/rebuy/wypłaty.
5. Zapisz.
6. Sprawdź zaktualizowane kolumny obliczane (`+/-`, sumy).

### C) Chcę nadać nowemu graczowi dostęp tylko do wybranych zakładek
1. Panel administratora → **Gracze**.
2. Dodaj lub wybierz istniejącego gracza.
3. Ustaw PIN i aktywność aplikacji.
4. Otwórz okno uprawnień.
5. Zaznacz tylko wymagane zakładki.
6. Zapisz.

---

## 15. Wskazówki użyteczności

- Po każdej ważnej akcji sprawdzaj tekst statusu obok przycisków.
- Jeśli nie widzisz sekcji, sprawdź czy nie wymaga PIN-u albo uprawnienia.
- W tabelach najpierw zapisuj dane wierszy, dopiero potem przechodź do kolejnych zakładek.
- Jeżeli ranking/statystyki wyglądają nieaktualnie, użyj przycisku **„Odśwież”**.

---

## 16. Aktualizacja 2026-02-12 — Gry admina i Gry użytkowników

### 16.1 Gry admina → sekcja „Statystyki” → kolumna „Punkty”
1. Wejdź w **Panel administratora**.
2. Kliknij zakładkę **„Gry admina”**.
3. Wybierz rok z panelu po lewej stronie.
4. Przewiń do sekcji **„Statystyki”**.
5. W tabeli graczy znajdź kolumnę **„Punkty”**.

Od teraz kolumna **„Punkty”** jest liczona automatycznie: to suma punktów gracza ze wszystkich gier w wybranym roku (z danych wpisanych w „Szczegóły” poszczególnych gier).

### 16.2 Gry admina → „Podsumowanie gry” → stabilne przewijanie poziome
1. W zakładce **„Gry admina”** przejdź do sekcji **„Podsumowanie gry ...”**.
2. Przesuń tabelę poziomo (lewo/prawo).
3. Edytuj dane gry (np. w „Szczegóły”) i poczekaj na autozapis.

Po zmianie pozycja poziomego scrolla nie wraca już samoczynnie do skrajnie lewej strony.

### 16.3 Gry użytkowników → „Podsumowanie gry” → stabilne przewijanie poziome
1. Wejdź do zakładki **„Gry użytkowników”** (w panelu admina albo w widoku użytkownika).
2. W sekcji **„Podsumowanie gry ...”** przewiń tabelę poziomo.
3. Wprowadź zmianę w danych gry i poczekaj na odświeżenie.

Po zmianie pasek poziomy zachowuje bieżącą pozycję i nie „ucieka” automatycznie w lewo.

### 16.4 Gry użytkowników → okno „Szczegóły gry” → poprawa utrzymywania fokusu
1. Otwórz zakładkę **„Gry użytkowników”**.
2. Kliknij przycisk **„Szczegóły”** przy dowolnej grze.
3. Edytuj pola wiersza (np. gracz, wpisowe, rebuy/add-on, wypłata, punkty, mistrzostwo).
4. Wpisuj dane ciągle przez kilka sekund.

Po zmianie pola nie powinny tracić fokusu po autozapisie i odświeżeniu widoku.

---

## 17. Aktualizacja 2026-02-12 — „Gry admina” i „Gry użytkowników” (okno „Szczegóły”, statystyki i ranking)

### 17.1 Okno „Szczegóły gry” → domyślne `0` w kolumnach „Wpisowe” i „Wypłata”
1. Wejdź do zakładki **Gry admina** albo **Gry użytkowników**.
2. W tabeli gier kliknij przycisk **Szczegóły** przy wybranej grze.
3. W otwartym oknie sprawdź kolumny **Wpisowe** i **Wypłata**.
4. Jeżeli pole było wcześniej puste, zobaczysz w nim od razu wartość **0**.
5. Kliknij dowolną komórkę w tych kolumnach i wpisz nową liczbę — każda komórka dalej jest edytowalna ręcznie.

### 17.2 Okno „Szczegóły gry” → masowa zmiana „Wpisowego” z nagłówka kolumny
1. Otwórz okno **Szczegóły** dla wybranej gry.
2. W nagłówku tabeli kliknij przycisk **Wpisowe** (to przycisk w nagłówku kolumny).
3. Pojawi się okno podręczne z polem tekstowym.
4. Wpisz wartość liczbową i zatwierdź.
5. Wszystkie wiersze w kolumnie **Wpisowe** zostaną ustawione na tę samą wartość.
6. Możesz powtarzać operację wielokrotnie — ostatnia zatwierdzona wartość pozostaje zapisana.

> Funkcja działa w:
> - zakładce **Gry admina**,
> - zakładce **Gry użytkowników** w panelu admina,
> - zakładce **Gry użytkowników** w strefie użytkownika (dla gracza z prawem edycji).

### 17.3 Sekcja „Podsumowanie gry” → sortowanie po kolumnie `+/-`
1. Wejdź do sekcji **Podsumowanie gry ...** pod tabelą gier.
2. Sprawdź kolejność graczy w wierszach.
3. Wiersze są teraz domyślnie ułożone malejąco po kolumnie **+/-**:
   - najwyższy wynik `+/-` na górze,
   - najniższy wynik `+/-` na dole.

### 17.4 Sekcja „Statystyki” (Gry admina) → kolumna „Wyniki” jest liczona automatycznie
1. Otwórz zakładkę **Gry admina**.
2. Wybierz rok po lewej stronie.
3. W sekcji **Statystyki** znajdź tabelę graczy.
4. Ustawiaj wagi przez przyciski w nagłówkach **Waga1 ... Waga7** lub ręcznie per wiersz.
5. Zobacz kolumnę **Wyniki** — nie wpisujesz tam już wartości ręcznie.

Kolumna **Wyniki** liczy się automatycznie według wzoru:

`Wyniki = (Mistrzostwo * Waga1) + (% udział * Waga2) + (Punkty * Waga3) + ((+/-) * Waga4) + (Wypłata * Waga5) + (Wpłaty * Waga6) + (% Rozegranych gier * Waga7)`

### 17.5 Ranking po prawej stronie (Gry admina)
1. W zakładce **Gry admina** spójrz na sekcję **Ranking** po prawej stronie.
2. Ranking sortuje się automatycznie po kolumnie **Wyniki** z sekcji **Statystyki**.
3. Po zmianie danych gry albo wag, kolejność rankingu aktualizuje się automatycznie od najwyższego wyniku do najniższego.

## 18. Aktualizacja 2026-02-12 — synchronizacja „Wyniki” między „Gry admina” i „Statystyki”

### 18.1 Gry admina → Statystyki → natychmiastowe odświeżanie kolumny „Wynik”
1. Wejdź do **Panel administratora**.
2. Otwórz zakładkę **Gry admina**.
3. Wybierz rok z listy lat po lewej stronie.
4. W sekcji **Statystyki** znajdź wiersz wybranego gracza.
5. Zmień dowolną wagę, np. **Waga7**.
6. Bez przełączania zakładki sprawdź ostatnią kolumnę **Wynik**.

Efekt po aktualizacji UI:
- kolumna **Wynik** odświeża się od razu po wpisaniu wartości,
- ranking po prawej stronie odświeża się równocześnie,
- przycisk **Odśwież** w panelu administratora przebudowuje także tabelę statystyk i ranking w zakładce **Gry admina**.

### 18.2 Zakładka „Statystyki” → kolumna „Wynik” tylko do odczytu
1. Otwórz zakładkę **Statystyki** (widok administracyjny).
2. Wybierz rok.
3. Znajdź kolumnę **Wynik**.
4. Spróbuj kliknąć komórkę i wpisać ręcznie liczbę.

Efekt po aktualizacji UI:
- kolumna **Wynik** nie jest polem do wpisywania,
- wartość jest liczona automatycznie na podstawie tych samych wag i danych co w **Gry admina → Statystyki**.

### 18.3 Spójność obu tabel „Statystyki”
Po zmianie wag w jednym miejscu:
1. Zmień np. **Waga1/Waga7** w **Gry admina → Statystyki**.
2. Przejdź do zakładki **Statystyki** dla tego samego roku.
3. Porównaj kolumny gracza, zwłaszcza **Punkty** i **Wynik**.

Efekt po aktualizacji UI:
- obie tabele używają tych samych danych wejściowych i tego samego wzoru,
- **Punkty** są prezentowane jako wartość wyliczona z gier (nie ręczne pole),
- **Wynik** w obu tabelach ma tę samą wartość.

## 19. Aktualizacja 2026-02-12 — okno „Szczegóły gry”: puste „Wpisowe” i „Wypłata”

### 19.1 Co się zmieniło w UI
W oknie **„Szczegóły gry”** (zarówno w zakładce **„Gry admina”**, jak i **„Gry użytkowników”**) pola:
- **Wpisowe**,
- **Wypłata**

mogą teraz zostać całkowicie wyczyszczone. Pole może pozostać puste — aplikacja nie wpisuje już automatycznie `0`.

### 19.2 Jak to sprawdzić krok po kroku
1. Wejdź do zakładki **„Gry admina”** albo **„Gry użytkowników”**.
2. Przy wybranej grze kliknij przycisk **„Szczegóły”**.
3. W tabeli kliknij komórkę w kolumnie **„Wpisowe”** lub **„Wypłata”**.
4. Usuń całą zawartość pola klawiszem `Backspace` lub `Delete`.
5. Kliknij w inne pole (albo przejdź do innego wiersza).
6. Zwróć uwagę, że pole pozostaje puste i nie wraca automatycznie wartość `0`.

### 19.3 Dodawanie nowego wiersza
1. W oknie **„Szczegóły gry”** kliknij **„Dodaj wiersz”**.
2. Sprawdź nowy wiersz w kolumnach **„Wpisowe”** i **„Wypłata”**.
3. Oba pola startują jako puste, dzięki czemu możesz:
   - wpisać wartość od razu,
   - albo zostawić pole puste i uzupełnić je później.

## 20. Aktualizacja 2026-02-12 — obecność gracza w „Podsumowanie gry” i statystykach

### 20.1 Kiedy gracz jest liczony jako obecny
W sekcjach:
- **Gry admina → Podsumowanie gry**,
- **Gry użytkowników → Podsumowanie gry**,
- **Statystyki** powiązane z tymi grami,

gracz jest teraz liczony jako obecny **tylko wtedy**, gdy w oknie **Szczegóły gry** ma w kolumnie **Wpisowe** wartość większą od `0`.

Jeżeli pole **Wpisowe** jest:
- puste,
- równe `0`,

taki wiersz jest traktowany jak **nieobecny** (nie jest uwzględniany w podsumowaniach i statystykach).

### 20.2 Jak sprawdzić krok po kroku
1. Wejdź do zakładki **Gry admina** albo **Gry użytkowników**.
2. Otwórz wybraną grę przyciskiem **Szczegóły**.
3. Dodaj gracza przyciskiem **Dodaj wiersz** (jeśli nie ma go jeszcze na liście).
4. W kolumnie **Wpisowe** zostaw puste pole albo wpisz `0`.
5. Zamknij okno szczegółów.
6. Przejdź do sekcji **Podsumowanie gry**:
   - ten gracz nie będzie widoczny w tabeli podsumowania,
   - jego dane nie zwiększą wartości używanych w statystykach.
7. Ponownie otwórz **Szczegóły** tej samej gry.
8. Wpisz w kolumnie **Wpisowe** wartość dodatnią (np. `50`).
9. Po odświeżeniu widoku gracz pojawi się w **Podsumowaniu gry** i zostanie uwzględniony w statystykach.

### 20.3 Co to oznacza w praktyce
- Dodanie samego wiersza gracza bez uzupełnienia **Wpisowego** nie wpływa już na rankingi i podsumowania.
- Wpisowe `0` działa jak brak obecności.
- Dopiero wpisowe większe od `0` oznacza realny udział gracza w danej grze.

## 21. Aktualizacja 2026-02-13 — Statystyki w „Strefa Gracza” (widok admina i gracza)

### 21.1 „Strefa Gracza” w trybie `?admin=1` ma działać identycznie jak zwykły widok gracza
1. Otwórz aplikację z adresem zawierającym `?admin=1`.
2. Przewiń na dół do sekcji **Strefa Gracza**.
3. Kliknij zakładkę **Statystyki**.
4. Aplikacja zawsze pokazuje pole PIN (tak samo jak bez `?admin=1`).
5. Wpisz poprawny PIN gracza z uprawnieniem **Statystyki** i kliknij **Otwórz**.

Efekt:
- panel testowy w adminie odwzorowuje realny widok użytkownika 1:1,
- bez PIN nie ma dostępu do tabeli Statystyki,
- łatwiej przetestować nowe funkcje dokładnie w takich warunkach, jak u końcowego gracza.

### 21.2 Zapamiętywanie checkboxów kolumn Statystyk
1. Wejdź do górnego panelu admina → zakładka **Statystyki**.
2. Wybierz rok z lewego panelu **Lata**.
3. W nagłówku tabeli odznacz wybrane checkboxy kolumn.
4. Odśwież stronę (F5) i ponownie wybierz ten sam rok.

Efekt:
- checkboxy wracają do ostatnio zapisanego stanu,
- widok gracza w zakładce **Statystyki** pokazuje tylko kolumny wybrane przez administratora,
- po zmianie roku widzisz osobny, poprawnie zapamiętany zestaw kolumn dla tego roku.

### 21.3 Zmiana nazw dwóch kolumn (bez zmiany obliczeń)
W tabelach:
- **Gry admina → Statystyki**,
- **Statystyki** (w Strefie Gracza),

zamieniono tylko nazwy nagłówków:
- teraz najpierw jest **% Rozegranych gier**,
- a dalej **% Wszystkich gier**.

Sposób liczenia wartości pozostał bez zmian.

## 22. Aktualizacja 2026-02-13 — Checkboxy kolumn w Statystykach (nowe domyślne ustawienia + trwałość)

### 22.1 Domyślny stan checkboxów po wejściu na nowy rok
1. Otwórz **Panel Administratora** → zakładka **Statystyki**.
2. Wybierz rok, który nie miał jeszcze zapisanej konfiguracji kolumn.
3. Sprawdź checkboxy w nagłówkach tabeli graczy.

Efekt domyślny:
- zaznaczone są wszystkie kolumny użytkowe (np. Gracz, Mistrzostwo, Ilość Spotkań, Punkty, Wypłata, Wynik),
- domyślnie **odznaczone** są tylko kolumny: **Waga1, Waga2, Waga3, Waga4, Waga5, Waga6, Waga7**.

### 22.2 Ręczne ukrywanie/pokazywanie kolumn użytkownikowi
1. W tej samej zakładce **Statystyki** (admin) wybierz rok.
2. W nagłówku interesującej kolumny kliknij checkbox:
   - kliknięcie usuwa zaznaczenie → kolumna będzie ukryta dla użytkownika,
   - ponowne kliknięcie zaznacza → kolumna będzie widoczna dla użytkownika.
3. Zmiany wykonuj dla każdej kolumny niezależnie.

### 22.3 Zapis ustawień checkboxów po restarcie aplikacji
1. W zakładce admina **Statystyki** ustaw własny układ checkboxów (np. zostaw tylko 3 kolumny albo odznacz wszystkie).
2. Odśwież stronę (`F5`) lub zamknij i ponownie otwórz aplikację.
3. Wróć do tego samego roku w zakładce **Statystyki**.

Efekt:
- aplikacja przywraca dokładnie ten sam stan zaznaczeń,
- dotyczy to również skrajnego przypadku, gdy wszystkie checkboxy były odznaczone.

### 22.4 Co zobaczy użytkownik w swojej zakładce „Statystyki”
1. Otwórz dolną sekcję użytkownika → zakładka **Statystyki**.
2. Przejdź PIN-em przez dostęp.
3. Odczytaj tabelę graczy.

Efekt:
- użytkownik widzi tylko te kolumny, które administrator zostawił zaznaczone dla danego roku,
- jeśli administrator odznaczył wszystkie kolumny, tabela użytkownika nie pokazuje kolumn danych.

## 23. Aktualizacja 2026-02-13 — Uprawnienia lat w zakładce „Statystyki” (Strefa Gracza)

### 23.1 Jak administrator przypisuje konkretne lata do gracza
1. Otwórz **Panel Administratora**.
2. Wejdź do zakładki **Gracze**.
3. W wierszu wybranego gracza kliknij przycisk **Edytuj** w kolumnie uprawnień.
4. W modalu **Uprawnienia gracza** zaznacz checkbox **Statystyki**.
5. Kliknij przycisk **Lata** (pojawia się obok opcji Statystyki).
6. Otworzy się modal **Lata statystyk**.
7. Zaznacz checkboxy lat, które mają być widoczne dla tego gracza (np. 2026, 2025).
8. Zamknij modal (przycisk `×` lub kliknięcie poza oknem) — wybory zapisują się automatycznie.

### 23.2 Co widzi administrator po zapisaniu
1. Wróć do tabeli **Gracze**.
2. W kolumnie uprawnień przy plakietce **Statystyki** zobaczysz licznik, np.:
   - `Statystyki (2 lat)`
   - `Statystyki (0 lat)`

Dzięki temu od razu widać, ilu lat dotyczy dostęp konkretnego gracza.

### 23.3 Co widzi gracz w „Strefa Gracza” → „Statystyki”
1. Gracz przechodzi do sekcji **Strefa Gracza**.
2. Otwiera zakładkę **Statystyki**.
3. Wpisuje PIN i klika **Otwórz**.
4. Po lewej stronie, na liście lat, zobaczy tylko lata przypisane przez administratora.

Przykład:
- jeśli admin przypisał tylko 2026 i 2025, gracz zobaczy wyłącznie te 2 lata,
- jeśli admin nie przypisał żadnego roku, gracz zobaczy komunikat o braku przypisanych lat.

### 23.4 Ważne zachowanie UI
- Przycisk **Lata** jest aktywny tylko wtedy, gdy uprawnienie **Statystyki** jest zaznaczone.
- Po odznaczeniu uprawnienia **Statystyki** lista przypisanych lat jest czyszczona.
- Eksport XLSX w zakładce gracza działa tylko dla aktualnie dostępnego (dozwolonego) roku.

## 24. Aktualizacja 2026-02-13 — przyciski Waga1..Waga7 w zakładce „Statystyki”

### 24.1 Problem, który został usunięty
1. Wejdź do **Panel administratora**.
2. Otwórz zakładkę **Statystyki**.
3. Kliknij dowolny przycisk nagłówka: **Waga1**, **Waga2**, ..., **Waga7**.

Przed poprawką pojawiały się dwa okna jedno po drugim:
- pierwsze okno do wpisania wartości,
- a po zatwierdzeniu/albo anulowaniu od razu drugie okno.

### 24.2 Jak działa teraz (krok po kroku)
1. Wejdź do **Panel administratora** → **Statystyki**.
2. Wybierz rok z listy po lewej stronie.
3. W tabeli graczy kliknij przycisk **Waga1** (analogicznie działa **Waga2..Waga7**).
4. Wpisz wartość i kliknij **OK** (lub **Anuluj**).

Efekt po poprawce UI:
- pojawia się tylko **jedno** okno prompt na jedno kliknięcie,
- nie pojawia się drugie, powielone okno,
- zachowanie w zakładce **Gry admina** pozostało bez zmian (nadal jedno okno na kliknięcie).

## 25. Aktualizacja 2026-02-13 — uwzględnianie samych punktów w „Podsumowanie gry” i „Statystyki”

### 25.1 Kiedy gracz jest teraz liczony w podsumowaniu i statystykach
1. Otwórz **Panel administratora**.
2. Przejdź do zakładki **Gry admina** albo **Gry użytkowników**.
3. Otwórz **Szczegóły gry** dla wybranego stołu.
4. W wierszu gracza możesz zostawić puste:
   - **Wpisowe**,
   - **Rebuy/Add-on**,
   - **Wypłata**.
5. Uzupełnij tylko pole **Punkty** (np. wpisz `-15`) i zapisz / zamknij okno.

Efekt UI:
- ten gracz będzie widoczny i liczony w sekcji **Podsumowanie gry**,
- ten sam gracz będzie też liczony w sekcji **Statystyki** dla wybranego roku,
- wpisane punkty (również ujemne) będą wpływać na kolumnę **Punkty** i pośrednio na **Wyniki** oraz pozycję w rankingu.

### 25.2 Szybki scenariusz klik-po-kliku (weryfikacja)
1. **Gry admina** → wybierz rok po lewej.
2. W tabeli gier kliknij **Szczegóły** dla jednej gry.
3. Dla gracza A wpisz:
   - Wpisowe: *(puste)*,
   - Rebuy/Add-on: *(puste)*,
   - Wypłata: *(puste)*,
   - Punkty: `-10`.
4. Zamknij okno szczegółów.
5. W sekcji **Podsumowanie gry ...** sprawdź, że gracz A jest na liście.
6. W sekcji **Statystyki** sprawdź wiersz gracza A:
   - kolumna **Punkty** zawiera ujemną wartość,
   - kolumna **Wyniki** jest przeliczona z uwzględnieniem tych punktów,
   - kolejność rankingu po prawej odświeża się na podstawie nowego wyniku.

### 25.3 Ważna uwaga dla operatora
- Jeżeli pole **Punkty** pozostanie puste i jednocześnie **Wpisowe** nie będzie dodatnie, taki wiersz nie wnosi żadnych danych do rozliczeń.
- Jeżeli wpiszesz punkty (dodatnie lub ujemne), gracz jest traktowany jako uczestnik do celów podsumowań/statystyk, nawet bez wypełnionych pól finansowych.

## 26. Aktualizacja 2026-02-13 — nowe liczenie „Ilość Spotkań” i „Suma z rozegranych gier”

### 26.1 Co się zmieniło dla użytkownika
W sekcjach:
- **Panel administratora → Gry admina → Statystyki**,
- **Statystyki** (tabela oparta o te same dane),

kolumny:
- **Ilość Spotkań**,
- **Suma z rozegranych gier**,

liczą się teraz tylko dla gier, w których gracz ma **uzupełnione pole „Wpisowe”** w oknie **Szczegóły gry**.

Jeśli gracz jest dodany do gry, ale pole **Wpisowe** jest puste — ta gra nie zwiększa już tych dwóch kolumn.

### 26.2 Jak to sprawdzić krok po kroku
1. Wejdź do **Panel administratora**.
2. Otwórz zakładkę **Gry admina**.
3. Wybierz rok z listy po lewej.
4. Kliknij przycisk **Szczegóły** przy wybranej grze.
5. Dla wybranego gracza ustaw pole **Wpisowe**:
   - przypadek A: wpisz wartość (np. `0`, `50`, `100`),
   - przypadek B: zostaw pole puste.
6. Zamknij okno szczegółów.
7. W sekcji **Statystyki** sprawdź wiersz tego gracza:
   - przy przypadku A gra jest liczona do **Ilość Spotkań**,
   - przy przypadku B gra nie jest liczona do **Ilość Spotkań**.
8. W tej samej sekcji sprawdź kolumnę **Suma z rozegranych gier**:
   - przypadek A dodaje do sumy wartość **Pula** tej gry,
   - przypadek B nie dodaje wartości **Pula** tej gry.

### 26.3 Ważna uwaga praktyczna
- To, że gracz widnieje na liście uczestników gry, nie wystarcza już do tych dwóch kolumn.
- Decyduje wyłącznie to, czy pole **Wpisowe** jest uzupełnione w **Szczegóły gry**.

## 16. Ranking roczny w zakładce „Statystyki” (nowy panel po prawej)

### 16.1 Gdzie znaleźć ranking
1. Wejdź w **Statystyki** (admin: zakładka panelu administratora, użytkownik: zakładka strefy gracza po PIN).
2. Po lewej kliknij wybrany rok na liście **Lata**.
3. Po prawej stronie widoku zobaczysz tabelę **Ranking** z kolumnami:
   - **Miejsce**,
   - **Gracz**,
   - **Wynik**.

### 16.2 Jak działa zależność od roku
1. Kliknij rok `R1` — ranking po prawej przelicza się dla `R1`.
2. Kliknij inny rok `R2` — ranking natychmiast zmienia się na dane z `R2`.
3. Jeśli dla roku nie ma danych, w tabeli rankingu pojawi się komunikat o braku danych rankingowych.

### 16.3 Spójność z „Gry admina”
- Ranking w **Statystyki** jest liczony tak samo jak ranking w **Gry admina**.
- To oznacza, że po wybraniu tego samego roku kolejność graczy i wartości **Wynik** są zgodne w obu miejscach.

### 16.4 Ograniczenia widoku użytkownika (Uprawnienia → Gracze)
1. Administrator otwiera **Panel Administratora → Gracze**.
2. W kolumnie **Uprawnienia** dla gracza ustawia dostępne lata statystyk.
3. Użytkownik po wejściu do **Statystyki** zobaczy tylko lata, do których ma dostęp.
4. Ranking po prawej wyświetla wyłącznie dane dla aktualnie klikniętego, dozwolonego roku.

## 27. Kalkulator (Panel Administratora)

> Zakładka **„Kalkulator”** jest dostępna tylko w widoku administratora.

### 27.1 Wejście do zakładki
1. Wejdź do aplikacji jako administrator.
2. W karcie **„Panel Administratora”** kliknij zakładkę **„Kalkulator”**.
3. W górnej części sekcji zobaczysz panel przełącznika trybu z dwoma przyciskami: **Tournament** i **Cash**.
4. Pod panelem przełącznika zobaczysz pięć tabel: **Tabela1**, **Tabela2**, **Tabela3**, **Tabela4**, **Tabela5**.
5. W widoku mobilnym (telefon) panel przełącznika jest zawsze osobnym blokiem nad tabelami, dzięki czemu tabele mają większą szerokość roboczą i łatwiej je przewijać poziomo.

### 27.2 Tabela1 (Suma / Buy-In / Rebuy / Liczba Rebuy)
1. W kolumnie **Buy-In** wpisz liczbę (np. `100`).
2. W kolumnie **Rebuy** możesz wpisać liczbę pomocniczą ręcznie.
3. Kolumna **Suma** liczy się automatycznie jako: suma wszystkich wartości z kolumn **Buy-In** i **Rebuy** z **Tabela2**.
4. Kolumna **Liczba Rebuy** liczy automatycznie łączną liczbę uzupełnionych pól `Rebuy1..N` we wszystkich oknach „Rebuy gracza” z **Tabela2** (puste pola nie są liczone).

### 27.3 Tabela2 (Gracz / Buy-In / Rebuy / Eliminated)
1. W kolumnie **Gracz** kliknij listę rozwijaną i wybierz gracza.
2. Kolumna **Buy-In** jest automatycznie przepisywana z pola **Buy-In** z **Tabela1**.
3. W kolumnie **Rebuy** kliknij przycisk z kwotą (na początku `0`).
4. Otworzy się okno modalne „Rebuy gracza” z tabelą jednego wiersza i jedną kolumną **Rebuy1**.
5. Wpisz wartość do **Rebuy1**.
6. Kliknij **Dodaj Rebuy**, aby dodać **Rebuy2**, potem **Rebuy3** itd.
7. Gdy kolumn jest minimum 2, przycisk **Usuń Rebuy** jest aktywny i usuwa zawsze ostatnią kolumnę.
8. Podczas wpisywania w polach `Rebuy1..N` fokus i pozycja kursora są utrzymywane także po automatycznym odświeżeniu tabel (możesz pisać ciągiem bez ponownego klikania pola).
9. Zamknij okno przyciskiem **Zamknij** albo kliknięciem poza modal.
10. Po zamknięciu na przycisku **Rebuy** w **Tabela2** zobaczysz sumę wszystkich pól Rebuy z modala dla tego gracza.
11. Checkbox **Eliminated** ustawia gracza na końcu rankingu w **Tabela4**:
    - pierwszy zaznaczony trafia na ostatnie miejsce,
    - kolejni zaznaczeni trafiają kolejno wyżej (od końca),
    - odznaczenie checkboxa usuwa gracza z listy eliminacyjnej w **Tabela4**.
12. Przycisk **Dodaj** (tylko w ostatnim wierszu) dodaje nowy wiersz gracza.
13. Przycisk **Usuń** usuwa wybrany wiersz (przy jednym wierszu pozostaje zablokowany).

### 27.4 Tabela3 (% / Rake / Wpisowe / Rebuy / Pot)
1. W pierwszej kolumnie **%** wpisz liczbę (np. `10`).
2. Po wyjściu z pola (kliknięcie poza pole) wartość automatycznie pokaże się jako `10%`.
3. Kolumna **Rake** liczy się automatycznie: `(suma Buy-In i Rebuy z Tabela2) × %`.
4. Kolumna **Wpisowe** liczy się automatycznie: `suma Buy-In z Tabela2 - (suma Buy-In z Tabela2 × %)`.
5. Kolumna **Rebuy** liczy się automatycznie: `suma Rebuy z Tabela2 - (suma Rebuy z Tabela2 × %)`.
6. Kolumna **Pot** pokazuje automatycznie `Wpisowe + Rebuy` po odjęciu procentu.

### 27.5 Tabela4 (LP / Gracz / Wygrana)
1. Tabela ma kolumny: **LP**, **Gracz**, **Wygrana**.
2. **Gracz** jest uzupełniany automatycznie z logiki eliminacji checkboxem **Eliminated** z **Tabela2**.
3. **Wygrana** jest zawsze kopiowana z kolumny **Suma** z **Tabela5** po numerze **LP** (wiersz do wiersza: LP=1 ↔ LP=1, LP=2 ↔ LP=2 itd.).
4. Zmiana kolejności lub podmiana gracza w kolumnie **Gracz** nie zmienia wartości **Wygrana** w tym samym LP.
5. Checkbox **Eliminated** wpływa na przypisanie graczy do pozycji, ale nie zmienia mapowania wartości **Wygrana** względem LP.

### 27.6 Tabela5 (dynamiczna liczba wierszy i kolumn)
1. Liczba wierszy jest dynamiczna i równa liczbie wierszy graczy w **Tabela2**.
2. W Tabela5 nie ma już kolumny **Gracz**.
3. Liczba kolumn **Rebuy** jest dynamiczna i zależy od łącznej liczby uzupełnionych pól `Rebuy` u wszystkich graczy w modalu z **Tabela2** (liczone są tylko pola niepuste).
4. Nagłówek procentowy to **Podział puli** i jest to pole edytowalne: wpisujesz np. `10`, a po wyjściu z pola widzisz `10%`.
5. Obliczenia **Kwota** pozostają takie same: `Wpisowe z Tabela3 × Podział puli / 100`.
6. Kolumny **Rebuy1...RebuyN** są renderowane dynamicznie dla całej tabeli i pokazują wartości numeryczne (brak danych w danym miejscu = `0`).
7. Końcowa kolumna **Suma** liczy: `Kwota + wszystkie kolumny Rebuy` dla danego wiersza.
8. Kolumna **Ranking** pokazuje pozycję gracza z **Tabela4** (jeśli gracz jest obecny na liście eliminacyjnej).

### 27.7 Zachowanie pól w kalkulatorze
- Pola edytowalne: `Buy-In`, `Rebuy` (Tabela1), `Gracz`, checkbox `Eliminated`, pola `Rebuy1..N` w modalu, `%` w Tabela3, `Podział puli` w Tabela5.
- Pola obliczane: `Suma`, `Liczba Rebuy`, `Rake`, `Wpisowe`, `Rebuy`, `Pot`, `Wygrana`, `Kwota`, `Suma` (Tabela5).
- Przełączanie między trybami **Tournament/Cash** utrzymuje osobne dane dla każdego trybu.


## 16. Aplikacja Android — obsługa UI (wersja WebView)

1. Uruchom aplikację **Karty** na telefonie z Androidem.
2. Po starcie zobaczysz ten sam interfejs co w przeglądarce (widok użytkownika).
3. Aby przejść do wybranej funkcji, klikaj karty/zakładki tak samo jak w wersji webowej (np. „Aktualności”, „Najbliższa gra”, „Czat”).
4. Jeśli pojawi się systemowe powiadomienie Android o nowej wiadomości, kliknij je, aby wrócić do aplikacji i odczytać treść w UI.
5. W aplikacji Android nie ma osobnego ekranu administratora wymuszanego przez URL — widok startuje jako użytkownik.
