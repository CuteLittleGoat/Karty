# Analiza modułu Second: brak danych w części zakładek widoku użytkownika (2026-04-17)

## Prompt użytkownika
Przeprowadź analizę modułu Second.
Obecnie w widoku użytkownika w części zakładek nie ma danych tylko jest napis "Dane tej sekcji są zapisywane do Firebase i dostępne w panelu administratora."
Załączam screena.
Działaniem oczekiwanym jest, żeby w widoku użytkownika użytkownik miał podgląd do danych, bez możliwości edycji (jeżeli ma nadane uprawnienia do zakładki - jedyny wyjątek to Czat - tam uprawniony użytkownik może pisać wiadomości).

Przeprowadź analizę, czemu nie pojawiają się dane i jak to naprawić.

## Zakres analizy
- Moduł: `Second`
- Plik kluczowy: `Second/app.js`
- Obszar: `setupUserView()` oraz renderowanie sekcji Tournament of Poker po stronie użytkownika.

## Objaw
W widoku użytkownika, po wejściu w wybrane zakładki turniejowe (np. „Podział puli”, „Faza grupowa”, „Półfinał”, „Finał”), zamiast danych pojawia się komunikat:

> Dane tej sekcji są zapisywane do Firebase i dostępne w panelu administratora.

## Ustalenia techniczne (przyczyna)

### 1) Dane z Firebase są poprawnie pobierane
W `setupUserView()` istnieje aktywny `onSnapshot` na dokumencie turniejowym:
- `SECOND_TOURNAMENT_COLLECTION` / `SECOND_TOURNAMENT_DOCUMENT`
- wynik jest mapowany przez `normalizeTournamentState(snapshot.data())`
- stan trafia do `userTournamentState`

To oznacza, że brak danych w UI nie wynika z braku odczytu z Firebase, tylko z logiki renderowania.

### 2) Uprawnienia i widoczność przycisków działają niezależnie od renderu treści
Funkcja `renderTournamentButtonsForPlayer()` poprawnie:
- sprawdza PIN,
- mapuje uprawnienia gracza,
- pokazuje/ukrywa przyciski sekcji.

Czyli użytkownik może mieć poprawnie widoczne zakładki (bo ma uprawnienia), ale nadal nie zobaczy danych, jeśli dana sekcja nie ma implementacji renderu.

### 3) Główna przyczyna: niepełna implementacja `renderUserTournament()`
`renderUserTournament()` ma obsłużone tylko sekcje:
- `chatTab` (czat),
- `players` (lista graczy),
- `draw` (losowanie stołów),
- `payments` (wpłaty),
- `payouts` (wypłaty).

Natomiast brak tam gałęzi renderujących dla:
- `pool` (Podział puli),
- `group` (Faza grupowa),
- `semi` (Półfinał),
- `final` (Finał).

Dla nieobsłużonych sekcji wykonywany jest fallback, który wstawia właśnie komunikat o danych tylko dla administratora.

### 4) W panelu admina te sekcje istnieją i są liczone
W renderze panelu administratora (ten sam `Second/app.js`) sekcje `pool/group/semi/final` mają pełne wyliczenia i tabele. Problem nie jest więc w modelu danych, tylko w tym, że user-view nie ma ich odpowiedników read-only.

## Dlaczego efekt jest zgodny ze screenem
Screen pokazuje, że użytkownik ma dostęp do zakładek (przyciski są widoczne), ale po wejściu w część z nich pojawia się komunikat fallback. To dokładnie odpowiada sytuacji, gdy sekcja jest autoryzowana, ale nierenderowana po stronie user-view.

## Jak naprawić (plan wdrożenia)

### Cel
Dodać w `renderUserTournament()` brakujące sekcje jako **read-only preview**:
- `pool`
- `group`
- `semi`
- `final`

Z zachowaniem zasady:
- użytkownik widzi dane,
- nie może edytować,
- jedyny wyjątek: `chatTab` pozwala pisać wiadomości (już jest).

### Rekomendowany sposób

1. **Dodać gałęzie `if` w `renderUserTournament()`** dla `pool/group/semi/final`.
2. **Wykorzystać te same dane i obliczenia**, co admin (lub wydzielić wspólne helpery), ale renderer użytkownika ma generować:
   - tabele i podsumowania,
   - pola wyłącznie jako tekst lub `<input readonly>`.
3. **Usunąć fallback dla sekcji docelowych** – fallback powinien zostać wyłącznie dla realnie nieobsługiwanych kluczy.
4. **Spiąć z uprawnieniami bez zmian** – obecny mechanizm uprawnień jest poprawny.

### Minimalny zakres funkcjonalny (MVP)
- `pool`: podgląd kluczowych tabel wyliczeń i sum (bez modyfikatorów edytowalnych).
- `group`: tabela graczy, eliminacje, stacki i udziały procentowe (bez checkboxów i inputów edycji).
- `semi`: przypisania półfinałowe, gracze aktywni/eliminowani, stacki, przejście do finału (read-only).
- `final`: tabela finałowa + kolejność eliminacji (read-only).

### Docelowe dopracowanie
- Zachować identyczne formatowanie wartości jak w adminie (`formatCellNumber`, procenty, itp.).
- Ujednolicić nazwy i kolejność kolumn między admin/user, aby uniknąć rozjazdów.
- Opcjonalnie wydzielić wspólne funkcje budowy danych (view-model) dla admin i user, żeby nie duplikować logiki.

## Ryzyka i uwagi
- Duplikacja logiki wyliczeń między admin i user zwiększy ryzyko regresji; najlepiej wydzielić warstwę przygotowania danych.
- Trzeba uważać, aby w user-view nie pozostawić elementów z `data-role` i listenerów, które umożliwiają zapis.
- Po wdrożeniu należy ręcznie przetestować przypadki:
  - gracz z pełnymi uprawnieniami,
  - gracz z częściowymi uprawnieniami,
  - brak PIN / błędny PIN,
  - brak danych historycznych w niektórych sekcjach.

## Podsumowanie
Problem nie wynika z Firebase ani z uprawnień, tylko z braku implementacji renderu części sekcji Tournament of Poker po stronie użytkownika. Sekcje `pool`, `group`, `semi` i `final` trafiają do fallbacku z komunikatem administracyjnym. Naprawa polega na dopisaniu read-only rendererów tych sekcji w `renderUserTournament()`.
