# Analiza modułu Second: nowy model dostępu i renderu po PIN (2026-04-19)

## Prompt użytkownika
Przeczytaj analizę `Analizy/Analiza_Second_blad_renderowania_sekcji_i_podwojny_PIN_czat_2026-04-17.md`

Po wprowadzeniu ostatniej poprawki wciąż nie działa. Po wpisaniu PIN pojawia się komunikat "Brak dostępnych paneli Tournament of Poker dla tego PIN-u.".

Po przejściu na "Czat" wyświetla się zakładka czatu. Po klikaniu w inne zakładki wciąż wyświetla zakładkę czatu.

Przeanalizuj możliwe rozwiązania jak osiągnąć zamierzony efekt. Chcę, żeby (poza zakładką Czat) użytkownik miał dostęp do określonych (uprawnienia nadane przez admina) zakładek w trybie tylko do odczytu. Przeczytaj dokładnie całą analizę. Przeanalizuj wszystkie próby osiągnięcia takiego efektu. Następnie spróbuj zaproponować zupełnie inny sposób osiągnięcia tego efektu.

---

## 1) Co już było próbowane i dlaczego to nadal może zawodzić

Na podstawie dotychczasowej analizy i obecnego kodu (`Second/app.js`) można podsumować sekwencję napraw:

1. Wymuszenie `renderUserTournament()` po weryfikacji PIN.
2. Rozbicie renderu sekcji na lokalne `try/catch`.
3. Dodatkowa sanityzacja danych historycznych.
4. Naprawa kompatybilności (`flatMap` -> `reduce`).
5. Diagnostyka `section/stage` i liczniki struktur.
6. Próby ograniczenia regresji „sticky chat” przez reset runtime czatu i token renderu.

To były poprawne kroki „punktowe”, ale one nadal działają na tej samej architekturze: **jeden duży renderer z wieloma zależnościami stanu runtime, stanu PIN i asynchronicznych snapshotów**.

W praktyce objawy nadal mogą wracać, bo:

- Walidacja „czy gracz ma dostęp” opiera się o połączenie stanu runtime i danych snapshotu, które mogą zmieniać się w różnych momentach.
- Zakładka czatu jest wyjątkowa (inna ścieżka renderu, osobny lifecycle DOM), przez co ma naturalną przewagę „utrzymania” widoku.
- Sidebar i główny panel są sprzężone przez zmienne globalne (`userTournamentSection`, flagi bramki PIN), a nie przez jedno źródło prawdy.

---

## 2) Najbardziej prawdopodobny mechanizm obecnej usterki

### A. „Brak dostępnych paneli...” po poprawnym PIN

To wygląda na niespójność czasu pomiędzy:
- momentem ustawienia „PIN poprawny”,
- momentem wyliczenia uprawnień do przycisków,
- i momentem renderu treści.

Jeżeli renderer treści wykona się na „starej” liście dozwolonych sekcji lub na graczu, który chwilowo nie został poprawnie zmapowany po snapshotcie, dostajemy fallback „Brak dostępnych paneli...”, mimo że PIN jest poprawny.

### B. „Sticky chat” (po wejściu w Czat inne zakładki nie podmieniają widoku)

To wygląda jak konflikt cyklu życia:
- klik zmienia intencję sekcji,
- ale kolejny render (np. z asynchronicznego update) przywraca/utrzymuje stan `chatTab`,
- lub nie dochodzi do pełnego „unmountu” widoku czatu i podmiany root HTML sekcji danych.

Problem nie musi być już stricte „błędem danych” — może być **błędem synchronizacji widoku**.

---

## 3) Zupełnie inny sposób osiągnięcia celu (rekomendacja)

Zamiast dalszego patchowania obecnego mechanizmu, proponuję zmianę podejścia na **architekturę opartą o jawny kontrakt sesji użytkownika + routing sekcji + dwa niezależne mount pointy**.

## 3.1. Zasada ogólna

Wprowadzić 3 warstwy:

1. **Session Contract (po PIN):**
   - Po poprawnym PIN tworzony jest obiekt sesji użytkownika:
     - `playerId`
     - `allowedSections` (np. `['payments','pool','group']`)
     - `chatAllowed` (bool)
     - `readonly = true` dla sekcji turniejowych
   - Ten kontrakt jest jedynym źródłem prawdy o uprawnieniach UI.

2. **Section Router (deterministyczny):**
   - Jedna funkcja `navigateToSection(target)`.
   - Dopuszcza przejście tylko, gdy `target ∈ allowedSections` lub `target === 'chatTab' && chatAllowed`.
   - Router zapisuje `currentSection` i tylko on decyduje co renderować.

3. **Oddzielne mount pointy DOM:**
   - `#tournamentDataMount` dla sekcji readonly (`payments/pool/group/semi/final/payouts/players/draw`)
   - `#tournamentChatMount` dla czatu
   - Przełączanie sekcji = pokazywanie jednego mountu i ukrywanie drugiego, bez współdzielenia referencji runtime.

To eliminuje klasę błędów, gdzie czat „trzyma” DOM sekcji danych.

---

## 3.2. Dlaczego ten model jest inny od dotychczasowych prób

Dotychczasowe próby poprawiały zachowanie **wewnątrz jednego renderera**.
Nowy model:

- rozdziela czat i dane turniejowe na osobne „sub-aplikacje” UI,
- sprowadza uprawnienia do jednego kontraktu sesji,
- przestawia logikę z „reaktywnego zgadywania stanu” na jawny routing.

To nie jest kolejny hotfix, tylko zmiana punktu kontroli.

---

## 3.3. Proponowany przepływ po stronie użytkownika

1. Użytkownik wpisuje PIN.
2. System tworzy `UserTournamentSession`:
   - odczyt gracza po PIN,
   - wyliczenie `allowedSections` i `chatAllowed`,
   - zapis sesji w pamięci runtime (i opcjonalnie trwały cache z TTL).
3. Sidebar renderuje tylko sekcje z `allowedSections` (+ Czat jeśli `chatAllowed`).
4. Pierwsza sekcja po PIN: `allowedSections[0]` (niezależnie od poprzedniego runtime).
5. Kliknięcie zakładki wywołuje wyłącznie router:
   - router ustawia `currentSection`,
   - wywołuje odpowiedni renderer mountu danych albo czatu.
6. Snapshot danych turnieju **nie zmienia `currentSection`** — tylko odświeża model danych używany przez aktywny renderer.

Klucz: snapshot nie ma prawa samodzielnie przełączyć zakładki.

---

## 3.4. Tryb readonly dla sekcji innych niż Czat

W nowym modelu readonly nie polega na wyłączaniu pojedynczych inputów po renderze.
Zamiast tego:

- renderer usera korzysta z osobnego zestawu komponentów „display-only”,
- w ogóle nie podpina handlerów zapisu (`onChange`, `onClick` zapisujący),
- wszystkie pola są renderowane jako tekst/tabela (bez mutacji stanu).

Dzięki temu nie ma ryzyka „wycieku” zachowań edycyjnych z panelu admina.

---

## 3.5. Jak ograniczyć ryzyko regresji podczas wdrożenia

Wdrożenie etapowe:

### Etap 1 (najkrótszy, techniczny)
- Dodać `UserTournamentSession` + `navigateToSection`.
- Zablokować bezpośrednie modyfikacje `userTournamentSection` poza routerem.

### Etap 2
- Wydzielić osobne mount pointy danych i czatu.
- Przepiąć render czatu do własnego mountu.

### Etap 3
- Wydzielić renderer readonly dla sekcji danych i usunąć zależności od rendererów admina.

### Etap 4
- Dodać testy integracyjne scenariusza:
  - PIN -> Payments -> Chat -> Pool -> Group,
  - odświeżenie strony,
  - ponowne wejście do Tournament,
  - brak „sticky chat”.

---

## 4) Konkretny cel biznesowy i jak nowy model go spełnia

Cel użytkownika:
- Czat działa jako wyjątek (możliwość pisania).
- Pozostałe przydzielone sekcje są dostępne i tylko do odczytu.
- Jeden PIN odblokowuje uprawnione zakładki.

Nowy model spełnia to przez:
- Jawny kontrakt sesji po PIN (deterministyczne uprawnienia).
- Jawny router sekcji (deterministyczna nawigacja).
- Rozdzielenie mountu czatu i danych (brak konfliktu renderu).
- Renderer display-only (techniczna gwarancja readonly).

---

## 5) Kryteria akceptacji dla nowego podejścia

1. Po poprawnym PIN użytkownik zawsze ląduje na pierwszej dozwolonej sekcji danych lub na Czat (jeśli to jedyna dozwolona sekcja).
2. Komunikat „Brak dostępnych paneli...” pojawia się wyłącznie wtedy, gdy `allowedSections` jest puste i `chatAllowed=false`.
3. Po wejściu w Czat i powrocie do dowolnej sekcji danych widok zawsze się przełącza (0 przypadków „sticky chat”).
4. Snapshot danych nie zmienia aktywnej zakładki.
5. W sekcjach innych niż Czat brak aktywnych akcji zapisu.

---

## 6) Podsumowanie

Dotychczasowe próby były sensowne, ale naprawiały objawy w istniejącym, złożonym rendererze. Proponowane rozwiązanie to zmiana architektury sterowania UI: **kontrakt sesji po PIN + router sekcji + osobne mount pointy dla czatu i danych readonly**. To podejście jest jakościowo inne i celuje bezpośrednio w źródło obecnej niestabilności (konflikt stanu i renderu), a nie tylko w pojedyncze skutki uboczne.
