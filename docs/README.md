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
1. Kliknij nazwę zakładki (np. „Aktualności”, „Czat”, „Gracze”, „Turnieje”).
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

## 7. Turnieje (administrator)

Zakładka służy do tworzenia i obsługi stołów/rozgrywek.

### Dodanie stołu (gry)
1. Otwórz zakładkę **„Turnieje”**.
2. Kliknij przycisk dodawania gry/stołu.
3. Uzupełnij formularz gry:
   - data,
   - nazwa,
   - typ gry,
   - status (otwarta/zamknięta — zależnie od interfejsu).
4. Zapisz.

### Otworzenie szczegółów gry
1. Na liście kliknij wybraną grę.
2. Otworzy się widok lub modal szczegółów.
3. W szczegółach możesz dodawać i edytować wiersze graczy.

### Dodanie gracza do konkretnej gry
1. Wejdź w szczegóły gry.
2. Kliknij dodawanie nowego wiersza.
3. Uzupełnij pola finansowe i punktowe.
4. Zapisz wiersz.

### Usunięcie gry / wiersza
1. Wybierz element (gra albo wiersz gracza).
2. Kliknij przycisk usuwania.
3. Potwierdź operację, jeśli pojawi się okno potwierdzenia.

**Edytowalne:** pola formularza gry i wierszy.  
**Automatyczne:** część wartości podsumowujących i obliczanych kolumn.

---

## 8. Gry admina

Sekcja służy do szczegółowej pracy na rozliczeniach i punktacji.

### Podstawowy przepływ
1. Otwórz zakładkę **„Gry admina”**.
2. Wybierz rok z listy/filtra.
3. Wybierz grę z listy.
4. Otwórz szczegóły i edytuj wiersze.

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

### Jak korzystać
1. Otwórz zakładkę **„Statystyki”**.
2. Jeśli wymagany jest PIN, wpisz PIN i potwierdź.
3. Wybierz rok (jeśli filtr jest widoczny).
4. Przeglądaj tabelę wyników i ranking.

### Interpretacja
- Kolumny procentowe i wynikowe są wyliczane automatycznie.
- Część wag/statystyk może być edytowalna wyłącznie w panelu administracyjnym.

**Edytowalne (zależnie od roli):** wybrane wagi i pola konfiguracyjne.  
**Nieedytowalne:** większość kolumn wynikowych.

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

---

## 11. Gry do potwierdzenia

### Potwierdzenie wyniku
1. Otwórz zakładkę **„Gry do potwierdzenia”**.
2. Przejdź bramkę PIN (jeśli wymagana).
3. Z listy wybierz pozycję oczekującą.
4. Kliknij akcję potwierdzenia lub odrzucenia.
5. Sprawdź status po wykonaniu akcji.

**Edytowalne:** decyzja potwierdzenia/odrzucenia i ewentualny komentarz (jeśli pole jest dostępne).  
**Nieedytowalne:** dane źródłowe gry zgłoszonej do akceptacji.

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
1. Panel administratora → **Turnieje**.
2. Kliknij **dodaj grę/stół**.
3. Wpisz datę i nazwę.
4. Zapisz.
5. Otwórz szczegóły nowej gry.
6. Dodaj kolejne wiersze graczy i uzupełnij pola finansowe.
7. Zapisz każdy wiersz.

### B) Chcę zmienić stawkę/wartości gracza w istniejącej grze
1. Panel administratora → **Gry admina** lub **Turnieje** (zależnie od miejsca, gdzie edytujesz).
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
