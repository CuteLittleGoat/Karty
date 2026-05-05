# Ultra dokładna dokumentacja aplikacji Karty (Main + Second)

## Prompt użytkownika (kontekst)
> „Przygotuj ultra dokładną dokumentację całej aplikacji. Zapiszą ją w analizy. Dokumentacja ma dokładnie opisywać pełne działanie aplikacji, wszystkich przycisków, wszystkich funkcji, wszystkich decyzji projektowych i wymagań biznesowych. Nie masz limitu znaków. Przygotuj najdokładniejszą dokumentację jaką będziesz w stanie.”

---

## 1. Zakres i architektura całości

Aplikacja składa się z **dwóch niezależnych modułów UI**:
- `Main` — główny moduł rozgrywek, zarządzania grami, statystyk, potwierdzeń, kalkulatorów oraz narzędzi administracyjnych.
- `Second` — moduł „Tournament of Poker” (pełny workflow turnieju: gracze, stoły, fazy, półfinał/finał, wypłaty, widok user-only + chat).

### 1.1. Współdzielenie i granice modułów
- Moduły działają niezależnie, ale korzystają ze wspólnych zasobów (`config`, `Pliki`, część plików root).
- Oba moduły mogą odczytywać dane drugiego modułu.
- Technicznie każdy moduł to osobny front-end JS + HTML + CSS, podłączony do Firebase/Firestore.

### 1.2. Wejścia i tryby
- `Main/index.html` i `Second/index.html` są oddzielnymi punktami wejścia.
- Oba moduły mają tryb użytkownika i administratora (sterowany URL/em i pinami).
- W `Main` występuje dodatkowa obsługa PWA z osobnym zachowaniem dla user/admin.

### 1.3. Filozofia projektowa
1. **Realtime-first** — dane przepływają przez snapshoty Firestore, UI dąży do natychmiastowej aktualizacji.
2. **PIN + uprawnienia sekcyjne** — dostęp oparty na identyfikacji gracza i granularnych uprawnieniach.
3. **Read-only parity** — user widzi spójny obraz stanu admina, ale bez możliwości edycji (poza dozwolonymi sekcjami, np. chat).
4. **Odporność UX na długie dane** — szerokie tabele, sticky layout, scroll lokalny, responsywność mobile.
5. **Stabilność podczas edycji** — zabezpieczenia fokusu, blokady konfliktu snapshot vs lokalny wpis.

---

## 2. Warstwa danych i backend

## 2.1. Integracja Firebase
- Konfiguracja przekazywana przez `window.firebaseConfig` (z pliku `config/firebase-config.js`).
- Moduły używają Firestore do:
  - konfiguracji aplikacyjnej,
  - danych graczy,
  - danych gier,
  - danych turnieju,
  - potwierdzeń,
  - czatu,
  - kalkulatorów,
  - notatek i ustawień admina,
  - snapshotów oraz danych pomocniczych.

## 2.2. Kluczowe kolekcje i dokumenty (przekrój)
- `players` — dane graczy, PIN, uprawnienia i pola pomocnicze.
- `Tables` + `rows` + `confirmations` — gry admina i detale.
- `UserGames` + `rows` + `confirmations` — gry użytkowników i detale.
- `admin_games_stats` — konfiguracja wag/statystyk.
- `app_settings/player_access` — dostęp sekcyjny i statystyczny.
- `admin_notes` (`main`, `second`) — notatki modułowe.
- `chat_messages` — wiadomości czatu.
- `calculators/...` — stany kalkulatorów i sesji.
- `second_tournament/state` — pełny stan modułu tournament (Second).

## 2.3. Reguły bezpieczeństwa (obserwowany stan funkcjonalny)
- Dokumentacja techniczna wskazuje, że aktualny zestaw reguł Firestore dopuszcza szeroki odczyt/zapis dla kolekcji aplikacyjnych.
- To sugeruje, że realna kontrola dostępu odbywa się głównie na poziomie logiki front-end (PIN, gate’y UI, role sekcyjne), a nie silnie restrykcyjnych reguł backendowych.

## 2.4. Konsekwencje biznesowe
- Zaleta: szybkie wdrożenia, brak „blokad przez rules”, prosta iteracja.
- Ryzyko: bezpieczeństwo zależy od klienta; przy produkcyjnym hardeningu potrzebne byłoby domknięcie zasad na poziomie Firestore Rules.

---

## 3. Moduł Main — pełny obraz działania

## 3.1. Struktura plików
- `Main/index.html` — UI (admin + user), sekcje, modale, layout.
- `Main/styles.css` — motyw i layout (tabele, modale, sidebar, responsywność).
- `Main/app.js` — cała logika biznesowa i synchronizacja z backendem.
- `Main/pwa-config.js`, `Main/pwa-bootstrap.js`, `Main/service-worker.js`, manifesty.

## 3.2. Widoki i przełączanie kontekstów
- Tryb admin aktywowany przez `?admin=1`.
- UI elementy oznaczone klasami `.admin-only` / `.user-only`.
- Strefa użytkownika ma osobny układ i mechanikę odświeżania danych bez pełnego reloadu.

## 3.3. Główne sekcje funkcjonalne Main

### 3.3.1. Gry admina
- Zarządzanie listą gier administracyjnych.
- Tabela gier z kolumnami metadanych, w tym licznik potwierdzeń `potwierdzeni/zapisani`.
- Akcje przy grze:
  - **Szczegóły** — modal edycji wierszy graczy.
  - **Statusy** — modal statusów potwierdzeń (read-only status matrix).
  - operacje pomocnicze związane z notatkami i statystyką.

### 3.3.2. Gry użytkowników
- Oddzielny strumień gier (`UserGames`).
- Filtrowanie dostępu po identyfikatorze gracza i PIN twórcy.
- Tabela analogiczna do admin-games, rozszerzona o szeroką kolumnę nazwy i notatek.
- Snapshoty detali odświeżają też widok listy, by licznik potwierdzeń był aktualny od razu.

### 3.3.3. Potwierdzenia
- Lista gier do potwierdzenia i statusy obecności.
- Identyfikacja gracza oparta o `playerId` (fallback: `playerName`) — decyzja eliminująca konflikt przy duplikatach nazw.
- Potwierdzenia i statystyki trzymają spójny klucz gracza (`id:<playerId>` / fallback nazwowy).

### 3.3.4. Najbliższa gra
- Pokazuje wyłącznie gry otwarte z datą >= dnia bieżącego.
- Obsługiwane formaty dat: `YYYY-MM-DD`, `DD.MM.YYYY`, `DD-MM-YYYY`.
- Sort rosnący (najbliższa na górze).

### 3.3.5. Statystyki
- Ranking i agregaty roczne.
- Manualne wagi i masowa edycja wag (przyciski o stałej szerokości dla stabilności layoutu).
- Statystyki liczone po kluczu gracza opartym o ID.

### 3.3.6. Strefa gracza
- Sekcje dostępne po walidacji PIN.
- Dostęp i lata statystyczne synchronizowane przez wspólne snapshoty `player-access`.
- Utrzymanie sesji i poprawne odświeżanie uprawnień po refreshu danych.

### 3.3.7. Kalkulatory
- Tryby Tournament i Cash oraz rozszerzenia (Organizacja, Żetony).
- Wielotabelowy model wejść/wyjść.
- Przechowywanie rebuy jako wartości + indeksy, z logiką globalnej renumeracji.
- Konsekwentna sanitizacja pól liczbowych (`digits-only`, numeric input hints).

## 3.4. Modale i akcje globalne (Main)

### 3.4.1. Modal instrukcji
- Przycisk instrukcji dostępny globalnie.
- Pierwsze otwarcie: `fetch`; kolejne: cache pamięciowy.
- Zamknięcie: `X`, overlay, `Escape`.

### 3.4.2. „Kontrola celno-skarbowa”
- Globalny czerwony przycisk w nagłówku.
- Otwiera modal z GIF-em (`Koza.gif`), bez zależności od Firebase.
- Widoczny w trybie user i admin.

### 3.4.3. Modale szczegółów gry
- Metadane gry w nagłówku modalu.
- Tabela graczy + kolumny finansowe i punktowe.
- Rebuy zarządzany per gracz przez dedykowany modal.

### 3.4.4. Modal Rebuy gracza
- Akcje: dodaj/usun rebuy, zamknij.
- Numeracja `RebuyN` utrzymywana przez indeksy, niezależna od pozycji wiersza.
- Usuwanie/ponowne dodawanie dba o spójność numeracji.

## 3.5. Decyzje projektowe UI/UX (Main)

1. **Szerokie tabele + local scroll** zamiast agresywnego zwężania kolumn.
2. **Stałe szerokości krytycznych kolumn** (np. ranking, wagi) dla przewidywalności.
3. **Tryb mobile landscape z wymuszoną jedną kolumną** przy niskiej wysokości viewportu.
4. **Odświeżanie danych bez pełnego reloadu** dla utrzymania sesji PIN i płynności.
5. **Separacja źródeł gier** (`UserGames` vs `Tables`) w sekcjach zależnie od celu biznesowego.

## 3.6. Wymagania biznesowe realizowane przez Main
- Zarządzanie pełnym cyklem gier (tworzenie, szczegóły, potwierdzenia).
- Rozdzielenie perspektyw: admin (pełna edycja) vs user (kontrolowany dostęp).
- Czytelne i szybkie raportowanie uczestnictwa (`potwierdzeni/zapisani`).
- Powtarzalne i audytowalne naliczanie finansowe (entry, rebuy, payout, rake).
- Niezawodność operacyjna na urządzeniach mobilnych (liczne poprawki input/focus/layout).

## 3.7. PWA (Main)
- Manifest podpinany tylko dla user-flow (bez admina).
- Service Worker wersjonuje cache i używa różnych strategii per typ zasobu.
- Obsługa `SKIP_WAITING` + automatyczny reload po przejęciu kontroli przez nowego workera.
- Busting cache przez query version w assetach.

---

## 4. Moduł Second — pełny obraz działania

## 4.1. Struktura plików
- `Second/index.html` — layout tournament, sekcje, modale.
- `Second/styles.css` — styl i responsywność turnieju.
- `Second/app.js` — logika turnieju admin/user + synchronizacja + chat.

## 4.2. Tożsamość i header
- Własny branding tekstowy.
- Ikona współdzielona z zasobów wspólnych (`Pliki/Ikona.png`).
- Przycisk instrukcji i przycisk awaryjnego modala (`Koza.gif`).

## 4.3. Turniej (admin) — sekcje i funkcje

### 4.3.1. Lista graczy
Przyciski i działania:
- **Dodaj gracza** — tworzy nowy rekord gracza.
- **Usuń** — kasuje gracza i czyści dane pochodne (assignments, grupy, półfinał, rebuy mapy).
- **Losuj PIN** — generuje unikalny PIN 5-cyfrowy.
- **PIN input** — walidacja unikalności (blokada duplikatów).
- **Edytuj uprawnienia** — otwiera modal checkboxów uprawnień.
- **Status płatności (toggle)** — `Do zapłaty` / `Opłacone`.
- **Wyzeruj Rebuy** — globalny reset wszystkich rebuy + powiązanych pól pool.

### 4.3.2. Losowanie stołów (draw)
- **Dodaj stół** — nowy stół z automatyczną nazwą `StółN`.
- **Usuń stół** — usuwa stół i dane powiązane, renumeruje globalne rebuy indeksy.
- **Przypisanie gracza do stołu** (`select`) — zapis na `change` (stabilność dropdown).
- Widok statusu płatności w tej sekcji jest readonly (edycja tylko w liście graczy).

### 4.3.3. Wpłaty (payments)
- Tabele 10/11/12 wyliczają sumy buy-in, rebuy i rake.
- `Tabela12` zawiera rebuy per gracz i integruje modal rebuy.
- Mechanika rebuy oparta o `payments.table12Rebuys` (values + indexes).

### 4.3.4. Podział puli (pool)
- Tabele 13–16 prezentują podział środków i modyfikatory.
- `pool.mods[]` oraz `pool.rebuyValues` sterują edytowalnymi obszarami.

### 4.3.5. Faza grupowa (group)
- Tabela 17: wartości bazowe stack/rebuy-addon (readonly).
- Tabela 18: agregaty stacków stołów i łączny stack.
- Tabela 19: pełna lista graczy z eliminacją.
- Tabela 19A: wyeliminowani (kolejność ręczna ▲/▼ + wygrana).
- Tabela 19B: pozostali (edytowalny stack przetrwania).

### 4.3.6. Półfinał (semi)
- Tabela 21: przypisania i stacki półfinałowe.
- Tabela 22: karty stołów półfinałowych + eliminacje.
- Tabela 22A: ranking wyeliminowanych w półfinale.
- Tabela FINAŁOWA: gracze bez eliminacji, z edytowalnym `finalStack`.

### 4.3.7. Finał i wypłaty
- Tabela 23: finaliści sortowani po stacku.
- Tabela 24: pełna drabinka miejsc na bazie kolejek eliminacji.
- Checkboxy `showInitial`/`showFinal` sterują widocznością kolumn wypłat także w user-view.

## 4.4. Turniej (user) — model dostępu

### 4.4.1. Wejście przez PIN
- Użytkownik otwiera sekcję po poprawnym PIN.
- Sesja utrwalana w `sessionStorage` (brak potrzeby ponownego wpisywania do resetu strony).

### 4.4.2. Kontrakt sesji
- `userTournamentSession` przechowuje `playerId`, dozwolone sekcje, flagę chatu i readonly.
- To jedyne źródło prawdy dla routera sekcji.

### 4.4.3. Render read-only
- User czyta wyłącznie `readonlyTables.rTournamentState` (kopie `r*`).
- Gdy kopii brak — jawny komunikat o braku readonly snapshotu.
- Sekcje readonly: players/draw/payments/pool/group/semi/final/payouts.
- `chatTab` pozostaje sekcją interaktywną.

### 4.4.4. Stabilność renderowania
- Token renderu odrzuca opóźnione, nieaktualne przebudowy.
- Per-sekcja `try/catch` chroni całość przed awarią pojedynczego panelu.
- Diagnostyczne logi z kontekstem (requested/final section, allowedTargets, timestamp itp.).

## 4.5. Decyzje projektowe (Second)
1. **Jedno źródło stanu turnieju** (`second_tournament/state`) + readonly kopie dla użytkownika.
2. **Rozdzielenie edycji i prezentacji** (admin editable, user readonly).
3. **Kolejki eliminacji jako jawny model biznesowy** (group/semi/final).
4. **Wysoka odporność na konflikty edycji i snapshotów** (focus guards, deferred snapshot commit).
5. **Walidacja unikalnego PIN jako krytyczny wymóg integralności tożsamości gracza**.

## 4.6. Wymagania biznesowe realizowane przez Second
- Kompletny przebieg turnieju od rejestracji po wypłaty.
- Jawne monitorowanie płatności i stanu rebuy.
- Transparentna ścieżka eliminacji i rankingów.
- Kontrolowany, per-graczowy dostęp do paneli użytkownika.
- Zgodność widoku usera z aktualnym stanem admina bez ekspozycji edycji.

---

## 5. Przekrojowo: wszystkie typy przycisków i ich role

## 5.1. Przyciski globalne
- Instrukcja (`...InstructionButton`) — otwarcie modala instrukcji.
- Kontrola celno-skarbowa (`...CustomsEmergencyButton`) — otwarcie modala GIF.
- Odśwież (`#userPanelRefresh`) — wymuszenie pobrania danych aktywnej zakładki bez pełnego reloadu.

## 5.2. Przyciski CRUD i nawigacyjne
- Dodaj/Usuń gracza.
- Dodaj/Usuń stół.
- Szczegóły/Statusy gry.
- Edytuj uprawnienia.
- Otwórz sekcję (przyciski sidebar/tab).

## 5.3. Przyciski operacyjne
- Losuj PIN.
- Toggle statusu płatności.
- Dodaj/Usuń Rebuy (lokalne i globalny reset).
- Przesuwanie pozycji rankingowej (▲/▼).

## 5.4. Przyciski bezpieczeństwa i stanu
- Akcje blokowane przy aktywnym ładowaniu (`isUserTournamentLoaded`).
- Blokady wielokliku dla destrukcyjnych operacji.
- Potwierdzenia `window.confirm` dla globalnych resetów.

---

## 6. Najważniejsze decyzje architektoniczne i ich uzasadnienie

1. **ID-first identyfikacja gracza**
   - Problem: duplikaty nazw.
   - Decyzja: liczyć logikę po `playerId`, nazwa tylko prezentacyjnie.
   - Efekt: spójne potwierdzenia, statystyki i mapowanie ręcznych wpisów.

2. **Dwuwarstwowy model danych user/admin w Second**
   - Problem: user nie powinien edytować danych admina.
   - Decyzja: readonly snapshot (`r*`) dla user-view.
   - Efekt: kontrolowany dostęp i mniejsze ryzyko side-effectów.

3. **Local-scroll zamiast overfit responsywności tabel**
   - Problem: duże tabele finansowe i rankingowe.
   - Decyzja: explicit widths + kontenery scroll.
   - Efekt: mniejsza łamliwość UI na desktop/mobile.

4. **Inputy liczbowe jako text + inputMode numeric**
   - Problem: niestabilne zachowanie natywnych `type=number`.
   - Decyzja: `type=text` + numeric hints + sanitizacja cyfr.
   - Efekt: stabilniejsze UX mobile i brak niespodzianek formatowania.

5. **Mechanizmy anty-konfliktowe snapshot/edycja**
   - Problem: snapshot może nadpisać wpis użytkownika podczas pisania.
   - Decyzja: hasActiveEdit/pendingWrites/deferredSnapshot + restore focus.
   - Efekt: edycja bez „skakania” kursora i bez utraty danych in-flight.

---

## 7. Niefunkcjonalne wymagania i standardy jakości

- **Responsywność**: wsparcie desktop + mobile + mobile-landscape.
- **Spójność sesji**: sessionStorage dla krytycznych gate’ów PIN.
- **Odporność błędowa**: try/catch per sekcja i komunikaty synchronizacji.
- **Wydajność użytkowa**: lokalne cache instrukcji, selective refresh, bez zbędnych reloadów.
- **Utrzymywalność**: duża liczba helperów normalizacji/serializacji i jawnych modeli stanu.

---

## 8. Ograniczenia i ryzyka operacyjne

1. Silna zależność od poprawności logiki klienta (front-end controlled access).
2. Rozbudowany stan dokumentów Firestore — wymaga dyscypliny wersjonowania i migracji.
3. Wysoka złożoność UI tabelarycznego — ryzyko regresji CSS/JS przy zmianach layoutu.
4. Potencjalna trudność onboardingu nowych developerów bez mapy funkcji (zredukowana przez tę dokumentację).

---

## 9. Wskazówki odtworzeniowe (dla inżyniera)

Aby odtworzyć aplikację funkcjonalnie:
1. Utworzyć dwa niezależne fronty (`Main`, `Second`) z własnymi `index.html`, `app.js`, `styles.css`.
2. Zapewnić współdzieloną konfigurację Firebase i spójne kolekcje Firestore.
3. Zaimplementować model gracza oparty o `playerId` + `playerName`.
4. Wdrożyć gate’y PIN, uprawnienia sekcyjne i session storage.
5. Dodać readonly snapshoty turnieju dla user-view w module Second.
6. Zaimplementować kalkulatory wielotabelowe z rebuy index mapping.
7. Zastosować layout tabel oparty o explicit widths + lokalny scroll.
8. Dodać obsługę modali, focus restore i deferred snapshot commit.
9. (Main) Dodać PWA tylko dla user flow oraz wersjonowany service worker.

---

## 10. Podsumowanie biznesowe

Aplikacja jest wyspecjalizowanym systemem do prowadzenia rozgrywek pokerowych i turnieju z rozdziałem ról admin/użytkownik. Obejmuje pełny cykl: konfigurację graczy, obsługę stołów i płatności, zaawansowane etapy turniejowe, potwierdzenia obecności, statystyki, rankingi i narzędzia kalkulacyjne. Kluczową cechą systemu jest utrzymanie zgodności danych między panelem administracyjnym i widokiem użytkownika przy jednoczesnym ograniczeniu uprawnień edycyjnych.
