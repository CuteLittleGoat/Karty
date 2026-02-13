# Karty — Instrukcja użytkownika (UI)

> Ten dokument opisuje **wyłącznie obsługę interfejsu** aplikacji: co kliknąć, co wpisać i jaki efekt zobaczysz.

## 1. Układ ekranu po wejściu do aplikacji

Po otwarciu strony zobaczysz układ podzielony na sekcje (karty).

- Góra strony: nagłówek aplikacji i przyciski administracyjne.
- Środek: siatka kart z funkcjami (administracja, gry, statystyki, czat, regulamin).
- Wiele elementów pojawia się zależnie od tego, czy jesteś administratorem albo graczem z poprawnym PIN-em.

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
2. Kliknij przycisk dodania nowego gracza (jeśli jest dostępny w widoku).
3. Uzupełnij dane w nowym wierszu/formularzu:
   - nazwa gracza,
   - PIN,
   - dostęp do aplikacji,
   - uprawnienia zakładek.
4. Zapisz zmiany przyciskiem w danym wierszu/sekcji.

### Edycja gracza
1. Znajdź gracza na liście.
2. Zmień pola w jego wierszu.
3. Zatwierdź zapis.

### Uprawnienia
1. W wierszu gracza kliknij przycisk uprawnień.
2. W oknie/modalu zaznacz lub odznacz dostępne zakładki.
3. Zatwierdź zapis zmian.

**Edytowalne:** nazwa, PIN, checkbox „Aplikacja”, wybór uprawnień.  
**Automatyczne/systemowe:** statusy zapisu i walidacja formatu PIN.

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
3. Kliknij dodanie gry.
4. Uzupełnij dane gry i zapisz.

### Edycja własnej gry
1. Wybierz rok i grę z listy.
2. Otwórz szczegóły.
3. Zmień dane wierszy i zapisz.

### Co jest liczone automatycznie
- Podsumowanie `+/-` per wiersz,
- część pól podsumowań i sum.

### Notatki przy tworzeniu/edycji gry (kolumna „Nazwa”)
1. Wejdź do tabeli gier w zakładce **„Gry admina”** albo **„Gry użytkowników”**.
2. W kolumnie **„Nazwa”** przy każdej grze są dwa przyciski: **„Szczegóły”** i **„Notatki do gry”**.
3. Kliknij **„Notatki do gry”**, aby otworzyć notatkę planistyczną dla danej gry.
4. Dla nowo dodanej gry zobaczysz domyślny szablon:
   - `Przewidywani gracze:`
   - `Rebuy:`
   - `Addon:`
   - `Inne:`
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
