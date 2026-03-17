# Analiza przemodelowania zakładki „Gry admina” (Main)

## Prompt użytkownika (kontekst)

> Szykuję się do całkowitego przemodelowania zasady działania zakładki "Gry admina" (moduł Main). Przygotuj mi plik z analizą wszystkich funkcji jakie tam są zawarte. Zrób porównanie z "Gry użytkowników". Przygotuj mi wszystkie możliwe odwołania jakie istnieją w "Gry admina" i ujawniają się w innych zakładkach (np. "Gry do potwierdzenia"). W nowym modelu zakładka "Gry admina" ma służyć tylko do zapisu statystyk z "Gry użytkowników". Jeżeli admin wpisze tam jakąś grę to ma się nigdzie więcej nie pojawiać. Przygotuj mi analizę wprowadzenia takiego rozwiązania. Nic nie zmieniaj w kodzie.

---

## 1) Co dziś zawiera „Gry admina” (moduł Main)

Poniżej pełny inwentarz funkcji wynikający z `Main/index.html` + `Main/app.js`.

### A. Warstwa UI i nawigacji
- Zakładka admina `adminGamesTab` zawiera:
  - listę lat,
  - tabelę gier (typ, data, nazwa, zamknięta, licznik potwierdzeń, akcje),
  - sekcję podsumowań każdej gry,
  - sekcję statystyk rocznych,
  - ranking.
- Całość inicjalizuje `initAdminGames()`.

### B. Operacje na grach (kolekcja adminowa)
- Odczyt gier z kolekcji adminowej (`getGamesCollectionName()`, domyślnie `Tables`).
- Tworzenie nowej gry (`Dodaj`) na podstawie walidowanego payloadu (`getValidatedNewGamePayload`).
- Edycja pól gry bezpośrednio w tabeli (rodzaj, data, nazwa, zamknięcie `isClosed`).
- Usuwanie gry wraz z zależnościami (`rows` + `confirmations`) przez batch.
- Snapshoty (`onSnapshot`) dla listy gier i ich podkolekcji.

### C. Detale gry (modal)
- Otwarcie „Szczegóły” dla gry.
- CRUD wierszy graczy (`rows`) w detalu gry.
- Edycja pól: gracz, wpisowe, rebuy/add-on, wypłata, punkty, mistrzostwo.
- Zbiorcze ustawienie wpisowego dla wszystkich wierszy.
- Dedykowany modal zarządzania wieloma rebuyami (`rebuys`, `rebuyIndexes`) i synchronizacja pola sumarycznego `rebuy`.

### D. Notatki
- „Notatki do gry” (`preGameNotes`) i „Notatki po grze” (`postGameNotes`) w podsumowaniach.
- Czyszczenie legacy pola `notes` (migracyjne sprzątanie).

### E. Potwierdzenia w „Gry admina”
- W tabeli gry pokazywany jest licznik `IlośćPotwierdzonych` (np. `3/7`).
- Przycisk `Statusy` otwiera modal statusów potwierdzeń na podstawie `rows` + `confirmations`.

### F. Podsumowania gry
- Dla każdej gry liczona jest pula, tabela wynikowa per gracz, punkty, mistrzostwo.
- Wykrywane jest ostrzeżenie o niespójności puli/wypłat.

### G. Statystyki i ranking w ramach zakładki
- Liczenie metryk rocznych i statystyk graczy dla wybranego roku.
- Edytowalne wagi `weight1..weight6`.
- Zapis manualnych wag i konfiguracji kolumn do `admin_games_stats`.
- Wyliczenie „Wyniku” i ranking.

### H. Integracje poboczne
- Rejestracja odświeżania panelu admina (`registerAdminRefreshHandler`).
- Integracja z globalnym modalem statusów potwierdzeń.

---

## 2) Porównanie „Gry admina” vs „Gry użytkowników”

## Wspólne cechy
- Obie sekcje korzystają z tego samego silnika `initUserGamesManager(...)` dla wielu operacji UI/CRUD (w przypadku „Gry użytkowników”), a „Gry admina” ma bardzo podobny zestaw zachowań zaimplementowany osobno.
- Obie mają:
  - listę lat,
  - tabelę gier,
  - modal „Szczegóły”,
  - licznik potwierdzeń i modal `Statusy`,
  - podsumowania per gra,
  - notatki do gry.

## Kluczowe różnice
1. **Kolekcja danych**
   - „Gry admina”: kolekcja adminowa (`Tables` / `gamesCollection`).
   - „Gry użytkowników”: kolekcja użytkowników (`UserGames` / `userGamesCollection`).

2. **Model uprawnień i własności**
   - „Gry admina”: pełen zapis admina.
   - „Gry użytkowników” (widok gracza): filtr po właścicielu (`createdByPlayerId` / `createdByPlayerPin`) + edycja tylko własnych gier.
   - „Gry użytkowników” (widok admina): pełen zapis po wszystkich grach userów.

3. **Statystyki w zakładce**
   - „Gry admina” zawiera własny blok „Statystyki + Ranking”.
   - „Gry użytkowników” nie ma analogicznego, rozbudowanego bloku statystyk bezpośrednio w tej zakładce.

4. **Przeznaczenie biznesowe obecnie**
   - „Gry admina” pełni rolę głównego źródła gier administracyjnych + statystyk.
   - „Gry użytkowników” pełni rolę toru danych tworzonych przez użytkowników (i nadzorowanych przez admina).

---

## 3) Wszystkie odwołania „Gry admina” ujawniające się w innych zakładkach

Poniżej mapa zależności międzyzakładkowych istotnych dla przebudowy.

### A. „Najbliższa gra” (admin i user)
- Widok łączy dane z **dwóch kolekcji naraz**: `Tables` (admin) + `UserGames`.
- Każda gra z `Tables` może być tu widoczna, jeśli:
  - `isClosed === false`,
  - data gry jest dziś/przyszłość.
- Kolumna „CzyWszyscyPotwierdzili” wylicza się przez odczyt `rows` + `confirmations` danej gry.
- Akcja „Usuń Całkowicie” usuwa grę z kolekcji źródłowej wraz z `rows` i `confirmations`.

**Wniosek:** dziś gra wpisana w „Gry admina” może automatycznie trafić do „Najbliższa gra”.

### B. „Gry do potwierdzenia” (admin)
- Lista aktywnych gier budowana jest z **obu** kolekcji: `Tables` + `UserGames`.
- Dla każdej gry zaciągani są gracze z `rows`, a status z `confirmations`.
- Admin może potwierdzać/anulować obecność dla gier z obu źródeł.

**Wniosek:** dziś gry z „Gry admina” trafiają bezpośrednio do „Gry do potwierdzenia”.

### C. „Gry do potwierdzenia” (gracz)
- Gracz widzi gry aktywne z **obu** kolekcji, ale tylko te, w których znajduje siebie w `rows`.
- Potwierdzenia zapisują się do `confirmations` pod danym dokumentem gry.

**Wniosek:** jeśli admin doda grę i przypisze gracza w `rows`, ta gra może pojawić się temu graczowi w sekcji potwierdzeń.

### D. „Statystyki” (osobna zakładka admin/user)
- Osobny moduł statystyk (`initStatisticsView`) czyta gry z kolekcji adminowej (`getGamesCollectionName()`), czyli domyślnie `Tables`.
- Manualne parametry (`weight1..weight6`, widoczność kolumn) zapisywane są do `admin_games_stats` i współdzielone logicznie.

**Wniosek:** statystyki poza „Gry admina” są dzisiaj oparte na grach adminowych (`Tables`), nie na `UserGames`.

### E. Wspólna logika statusów potwierdzeń
- Modal statusów potwierdzeń (reużywalny kontroler) jest używany przez:
  - „Gry admina”,
  - „Gry użytkowników”,
  - „Gry do potwierdzenia” (pośrednio przez te same dane).

---

## 4) Co oznacza nowy model biznesowy

Założenie docelowe:
1. „Gry admina” ma służyć **tylko** do zapisu/obsługi statystyk opartych o „Gry użytkowników”.
2. Jeśli admin doda tam jakąś grę, ta gra **nie może się pojawiać nigdzie indziej**.

To są de facto **dwa wymagania naraz**:
- (R1) „Gry admina” przestaje być źródłem operacyjnych gier dla innych zakładek.
- (R2) Statystyki adminowe mają liczyć się z `UserGames`, a nie z `Tables`.

---

## 5) Analiza wdrożenia – warianty

## Wariant A (najczystszy architektonicznie) — „Gry admina” = panel statystyk bez listy gier
- Usunąć z „Gry admina” funkcje CRUD gier i detali.
- Zostawić/rozwinąć tylko blok statystyk i ranking.
- Źródło danych statystyk przepiąć na `UserGames`.
- Dzięki temu nie ma ryzyka, że „adminowa gra” wypłynie gdziekolwiek.

**Plusy:** najmniej niejednoznaczności biznesowej.
**Minusy:** duża zmiana UX (zakładka traci dotychczasową część tabelaryczną).

## Wariant B (minimalnie inwazyjny) — zostawić UI gier, ale odseparować technicznie
- Utrzymać możliwość dodania „gry admina”, ale do **osobnej kolekcji izolowanej** (np. `AdminStatsScratch`) nieczytanej przez inne moduły.
- W „Najbliższa gra” i „Gry do potwierdzenia” odczytywać wyłącznie `UserGames` (i ewentualnie historycznie tylko to, co potrzebne).
- Statystyki adminowe liczyć z `UserGames`.

**Plusy:** mniejsza rewolucja w interfejsie.
**Minusy:** większy koszt utrzymania „martwej” części CRUD, która nie bierze udziału w głównych procesach.

## Wariant C (flaga semantyczna)
- Zostawić `Tables`, ale każdą grę dodaną w „Gry admina” oznaczać np. `visibilityScope: "admin-only"`.
- Wszystkie widoki agregujące („Najbliższa gra”, „Gry do potwierdzenia”, potwierdzenia gracza, statystyki user-facing) muszą filtrować po tej fladze.

**Plusy:** brak migracji kolekcji.
**Minusy:** łatwo o regresję, bo filtr trzeba dopilnować w wielu miejscach.

---

## 6) Miejsca krytyczne do zmiany (logika, nie kod)

1. **Agregacja gier do potwierdzeń**
   - Funkcje pobierające aktywne gry z wielu kolekcji nie mogą już brać „adminowego źródła operacyjnego”.

2. **Agregacja „Najbliższa gra”**
   - Obecnie snapshot idzie równolegle na `Tables` i `UserGames`; trzeba zmienić źródło/filtr.

3. **Statystyki (admin i user)**
   - Osobny moduł statystyk korzysta dziś z `getGamesCollectionName()` (adminowa kolekcja); musi zostać przeorientowany na `UserGames`, jeśli taka jest nowa definicja prawdy.

4. **Zgodność z potwierdzeniami**
   - Potwierdzenia (`confirmations`) zależą od tego, skąd pochodzi gra i jacy gracze są w `rows`.
   - Po zmianie źródła trzeba dopilnować spójności identyfikatorów graczy (`playerId` / fallback `playerName`).

5. **Operacje destrukcyjne**
   - „Usuń Całkowicie” i usuwanie gier wraz z podkolekcjami muszą działać wyłącznie na właściwych kolekcjach, żeby nie usuwać danych statystycznych/szkicowych przez pomyłkę.

---

## 7) Ryzyka i skutki uboczne

- **Ryzyko podwójnej prawdy**: jeśli część statystyk nadal będzie czytać `Tables`, a część `UserGames`, wyniki się rozjadą.
- **Ryzyko regresji uprawnień**: widoki z PIN-em (confirmations/userGames/stats) muszą pozostać spójne po zmianie źródła.
- **Ryzyko historyczne**: stare dane w `Tables` mogą przestać być widoczne, jeśli nowy model przełączy wszystko na `UserGames`.
- **Ryzyko UX**: użytkownicy/admin mogą oczekiwać, że „Dodaj” w „Gry admina” wpływa na proces gry; po zmianie już nie będzie.

---

## 8) Rekomendacja praktyczna

Najbardziej spójny kierunek dla Twojego celu: **Wariant A**.

Czyli:
1. „Gry admina” formalnie zamienić w zakładkę „Statystyki admina” (lub zachować nazwę, ale tylko funkcje statystyczne).
2. Źródłem statystyk ustawić `UserGames`.
3. „Najbliższa gra” i „Gry do potwierdzenia” oprzeć wyłącznie o `UserGames` (lub o jasno określony zbiór operacyjny, ale bez gier „admin-only”).
4. Jeżeli chcesz zachować możliwość ręcznego wpisu admina do celów analitycznych, zapisywać to do oddzielnej kolekcji technicznej niepodpinanej do innych zakładek.

To daje prostą zasadę biznesową:
- **operacyjne gry** = tylko „Gry użytkowników”,
- **analiza/statystyka** = panel admina.

---

## 9) Checklista wdrożenia (analityczna)

- [ ] Zdefiniować docelowe źródło prawdy dla statystyk: `UserGames`.
- [ ] Zdefiniować los historycznych danych `Tables` (migracja / archiwum / tylko odczyt).
- [ ] Zmienić agregację „Najbliższa gra” tak, by ignorowała gry admin-only.
- [ ] Zmienić agregację „Gry do potwierdzenia” (admin + user) analogicznie.
- [ ] Potwierdzić, że potwierdzenia graczy działają wyłącznie na grach operacyjnych.
- [ ] Przetestować spójność rankingów i wag (`admin_games_stats`) po zmianie źródła.
- [ ] Dodać jasny komunikat UI, czym po zmianie jest „Gry admina”.

---

## 10) Podsumowanie 1-zdaniowe

Obecnie „Gry admina” jest aktywnym źródłem danych dla innych sekcji (potwierdzenia, najbliższa gra, statystyki), więc aby spełnić nowy model („tylko statystyki z Gry użytkowników” i brak przecieków), trzeba oddzielić ją od przepływów operacyjnych i przełączyć silnik statystyk na dane z `UserGames`.
