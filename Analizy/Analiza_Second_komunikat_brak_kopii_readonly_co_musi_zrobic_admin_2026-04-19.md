# Analiza modułu Second: komunikat „Brak kopii readonly (r*)” — co musi zrobić administrator (2026-04-19)

## Prompt użytkownika
Przeprowadź analizę modułu Second. W widoku użytkownika pojawia się komunikat "Brak kopii readonly (r*). Poproś administratora o zapis danych turnieju.".
Co dokładnie musi zrobić administrator, żeby pojawiły się dane?

---

## Wniosek główny
Komunikat pojawia się wtedy, gdy w dokumencie turnieju brakuje `readonlyTables.rTournamentState`.
Widok użytkownika **nie czyta danych roboczych admina** i ma twardy warunek: musi istnieć kopia readonly `rTournamentState`.

Kopia `r*` powstaje podczas `saveState()` i jest zapisywana do Firebase jako `tournamentState.readonlyTables = buildTournamentReadonlyCopies(tournamentState)`.

---

## Co dokładnie musi zrobić administrator

1. Wejść do panelu **Admin → Tournament of Poker** (moduł Second).
2. Wykonać **dowolną akcję, która zapisuje stan turnieju** (np. zmiana pola, checkboxa, przypisania stołu, dodanie/usunięcie gracza/stolu itp.).
   - W module Second większość takich akcji automatycznie wywołuje `saveState()`.
3. Poczekać na zakończenie zapisu do Firebase.
4. Użytkownik (PIN-view) po kolejnym odświeżeniu snapshotu zobaczy już dane, bo pojawi się `readonlyTables.rTournamentState`.

---

## Dlaczego sam podgląd nie wystarcza
Samo wejście do panelu admina lub przełączanie zakładek bez zmian nie tworzy kopii `r*`.
Kopia jest generowana i zapisywana tylko w ścieżkach, które finalnie wykonują `saveState()`.

---

## Dodatkowa uwaga operacyjna
Jeżeli administrator twierdzi, że „zapisał”, a komunikat nadal jest widoczny, najczęstsze przyczyny to:
- błąd zapisu do Firebase (w kodzie jest dedykowany komunikat błędu),
- brak faktycznej akcji wywołującej `saveState()`,
- opóźnienie synchronizacji snapshotu po stronie klienta użytkownika.

