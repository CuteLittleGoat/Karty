# Analiza wstępna: moduł Second — projekt widoku „Rzutnik” dla panelu Finał

## Prompt użytkownika (kontekst)

> Przeprowadź analizę modułu Second.
> Plik z analizą nazwij "Projekt_Rzutnik.md".
>
> W panelu "Finał" masz narysowany obrys stołu pokerowego.
> Jest to wstępny projekt.
>
> Wersja ostateczna ma działać w następujący sposób:
> Admin korzysta z rzutnika.
> W OBS ustawia wyświetlanie konkretnej zakładki przeglądarki.
> W tej zakładce ma być rysunek stołu pokerowego.
> W tej zakładce "live" muszą się ustawiać gracze i musi się "live" zmieniać ich punktacja.
>
> Przeprowadź wstępną analizę wprowadzenia takiej funkcji. Resztę wymagań doprecyzuję potem.
> Plik z analizą będzie rozwijany wraz z aktualizacją wymagań (np. czy dane mają się zaciągać z jakiejś tabeli czy wpisywane ręcznie przez admina w osobnym panelu.)
> Po ustaleniu wszystkiego dopiero zostanie wprowadzona funkcjonalność.

---

## 1) Stan obecny w module Second (co już jest)

1. W sekcji **Finał** (panel admina) aplikacja renderuje:
   - tabelę `TABELA23` z graczami,
   - checkbox `ELIMINATED`,
   - oraz SVG z elipsą stołu i etykietami graczy rozmieszczonymi po obwodzie.
2. Widok Finał przelicza listę `finalPlayers` na podstawie danych z wcześniejszych etapów (głównie półfinału), a następnie sortuje graczy po stacku malejąco.
3. Dane turniejowe są utrwalane w Firebase (`second_tournament/state`) i odświeżane przez `onSnapshot`, więc rdzeń „live update” już działa na poziomie danych.
4. Aktualny SVG jest osadzony **w admin panelu**, a nie jako dedykowany, „czysty” widok pod rzutnik/OBS.
5. Użytkownikowy panel (po PIN) nie ma obecnie dedykowanego renderu stołu finałowego SVG jako samodzielnego feedu „broadcast”.

Wniosek: fundamenty realtime i model danych już istnieją; brakuje głównie warstwy prezentacji dedykowanej do emisji (OBS/projektor).

---

## 2) Cel biznesowo-funkcjonalny (interpretacja obecnych wymagań)

Docelowo potrzebny jest osobny **widok rzutnika (broadcast view)**, który:

1. Działa w osobnej zakładce przeglądarki.
2. Jest możliwie „czysty” (bez kontrolek edycji, bez panelu admina).
3. Pokazuje stół finałowy i rozmieszczenie graczy.
4. Aktualizuje się „live” bez ręcznego odświeżania (gracze, stack/punktacja, ewentualnie status eliminacji).
5. Jest stabilny dla przechwytywania przez OBS (stały layout, czytelna typografia, kontrast, przewidywalne przejścia danych).

---

## 3) Proponowany kierunek architektury (bez wdrożenia kodu na tym etapie)

### 3.1. Rozdzielenie „panelu administracyjnego” od „widoku emisyjnego”

Najbezpieczniej dodać nowy tryb/widok, np.:

- `Second/index.html?view=final-broadcast`
  **lub**
- osobny plik `Second/final-broadcast.html`.

**Rekomendacja wstępna:** wariant z parametrem query (`?view=final-broadcast`) — mniej duplikacji i prostsze utrzymanie jednego punktu wejścia.

### 3.2. Źródło danych dla broadcastu

W pierwszym kroku widok broadcast powinien czytać z już istniejących pól:

- `finalPlayers[]` (nazwa, stack, eliminacja),
- `final.eliminated` (statusy),
- ewentualnie metadane stołu (`tableName`, liczba graczy).

To daje szybkie uruchomienie wersji MVP bez nowego backendu i bez nowego formatu dokumentu.

### 3.3. „Live” aktualizacja

Wykorzystać ten sam mechanizm `onSnapshot` do dokumentu turniejowego.

- Każda zmiana wykonana przez admina (stack, eliminacja, przesunięcia) propaguje się automatycznie do widoku rzutnika.
- Należy dodać ochronę przed „miganiem” UI (np. stabilne klucze graczy, płynne przejścia tylko opcjonalnie).

### 3.4. Układ UI pod rzutnik

Minimalny zestaw elementów:

1. Tło + stół pokerowy (SVG/canvas).
2. Seat-y graczy (pozycje wokół stołu).
3. Podpis każdego gracza:
   - nazwa,
   - stack/punktacja,
   - opcjonalnie status (np. `OUT`).
4. Opcjonalnie zegar/tytuł eventu.

Dla OBS ważne:

- duże fonty i wysoki kontrast,
- brak drobnych kontrolek,
- stałe proporcje 16:9,
- zachowanie czytelności przy Full HD.

---

## 4) Główne ryzyka i ograniczenia

1. **Mapowanie miejsc przy stole:**
   - obecnie gracz ma dane finałowe, ale nie ma osobno utrwalonego „seat index” dedykowanego pod rzutnik.
   - trzeba ustalić, czy miejsca są automatyczne (wg sortowania), czy ręcznie przypisywane.
2. **Definicja „punktacji”:**
   - w kodzie funkcjonuje pojęcie `stack`; trzeba potwierdzić, czy to właśnie ma być pokazywane jako punktacja.
3. **Kontrola dostępu:**
   - jeśli link z widokiem rzutnika ma być publiczny/otwarty, trzeba doprecyzować bezpieczeństwo (np. token read-only).
4. **Scenariusze awaryjne pod event:**
   - brak internetu,
   - reconnect Firestore,
   - chwilowe opóźnienia snapshotów.
5. **Spójność danych między etapami turnieju:**
   - finaliści pochodzą z logiki półfinału; trzeba doprecyzować moment „zamrożenia” listy finalistów vs dynamiczne zmiany.

---

## 5) Plan etapowy (proponowany)

### Etap A — MVP (niskie ryzyko, szybki efekt)

1. Dodać dedykowany widok broadcast final table (bez edycji).
2. Podłączyć odczyt `onSnapshot` z istniejącego dokumentu turniejowego.
3. Renderować graczy i stack „live” na stole.
4. Dodać stany UI:
   - ładowanie,
   - brak danych,
   - błąd połączenia.

### Etap B — ergonomia eventowa

1. Dodać tryb pełnoekranowy i skróty pod operatora (opcjonalnie).
2. Dodać ustawienia wizualne (skala fontu, wariant kolorystyczny, pokazywanie/ukrywanie eliminacji).
3. Dodać prostą diagnostykę „Last update hh:mm:ss” dla operatora OBS.

### Etap C — finalizacja produktu

1. Ustalić i zaimplementować model seatów (automatyczny/ręczny).
2. Ustalić dokładny model punktacji i format liczb.
3. Ustalić tryb autoryzacji linku rzutnika.
4. Dodać scenariusze testowe „dzień turniejowy” (checklista operacyjna).

---

## 6) Pytania do doprecyzowania przed implementacją

1. Czy „punktacja” = `STACK` z Finału, czy osobne pole?
2. Czy miejsca graczy wokół stołu mają być:
   - automatyczne (np. wg sortowania stack),
   - czy ręcznie ustawiane przez admina?
3. Czy w widoku rzutnika pokazujemy graczy wyeliminowanych?
4. Czy wymagany jest licznik blindów/zegar rundy na tym samym ekranie?
5. Czy link OBS ma być dostępny bez logowania, czy z zabezpieczeniem?
6. Czy potrzebny jest osobny panel operatorski do sterowania tylko widokiem rzutnika?

---

## 7) Rekomendacja końcowa (wstępna)

Wprowadzenie funkcji jest **realne bez przebudowy backendu**.

Najbardziej efektywna ścieżka to:
1. uruchomić dedykowany widok `final-broadcast` oparty o istniejący stan turnieju,
2. korzystać z aktualnego mechanizmu realtime (`onSnapshot`),
3. dopiero po potwierdzeniu UX eventowego rozszerzyć model o ręczne seaty i dodatkowe elementy transmisyjne.

To minimalizuje ryzyko i pozwala szybko uzyskać działający „live” ekran pod OBS/rzutnik.
