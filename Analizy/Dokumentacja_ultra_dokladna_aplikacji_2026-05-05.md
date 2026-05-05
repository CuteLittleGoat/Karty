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

---

## 5. Rozszerzenie ultra-dokładne: funkcje, przyciski, checkboxy, pola i ekrany (Main + Second)

## 5.1. MAIN — mapa ekranów i nawigacji

### 5.1.1. Ekrany/zakładki
- `Gry admina` — operacyjna lista gier zarządzanych przez administratora (tworzenie rekordów, wejście do szczegółów gry, podgląd statusów potwierdzeń).
- `Gry użytkowników` — lista gier tworzonych po stronie użytkowników (zabezpieczona PIN i filtrami tożsamości).
- `Potwierdzenia` — panel potwierdzania obecności oraz podgląd statusu potwierdzeń dla graczy przypisanych do gier.
- `Najbliższa gra` — widok wyłącznie przyszłych (lub dzisiejszych) rekordów otwartych gier, posortowanych rosnąco po dacie.
- `Statystyki` — roczne zestawienia wyników i rankingów, z obsługą ręcznych wag.
- `Strefa gracza` — panel użytkownika odblokowywany PIN-em, z sekcjami zależnymi od uprawnień i mapy dostępu.
- `Kalkulatory` — złożony panel obliczeń `Tournament`, `Cash`, `Organizacja`, `Żetony`.

### 5.1.2. Każdy globalny przycisk Main
- `Instrukcja` — otwarcie modala instrukcji; pierwszy klik pobiera treść z backendu/pliku, kolejne kliknięcia korzystają z cache pamięciowego.
- `Kontrola celno-skarbowa` (czerwony) — otwarcie awaryjnego modala z GIF-em (`Koza.gif`), zamknięcie przez `X`, overlay, `Escape`.
- `Odśwież` (w user-panelu) — wymusza przeładowanie danych aktywnej zakładki bez pełnego `window.location.reload()`, więc sesja PIN pozostaje aktywna.

### 5.1.3. Przyciskowe akcje na listach gier
- `Dodaj grę` — tworzy dokument gry (z metadanymi daty, rodzaju, nazwą, flagami i autorem), po czym tabela jest przebudowywana i podpinane są snapshoty detali.
- `Szczegóły` — otwiera modal wierszy gry; w środku użytkownik admin może zmieniać wpisy graczy, pola finansowe i punktowe.
- `Statusy` — otwiera modal read-only z listą uczestników i statusem potwierdzenia; to UI do szybkiego audytu frekwencji.
- `Notatki do gry` — wejście do notatek skojarzonych z konkretną grą.
- `Usuń grę` — kasuje rekord gry i subkolekcje zależne (wiersze/potwierdzenia), po czym odświeża listę.

## 5.2. MAIN — każde krytyczne pole i sposób obliczania

### 5.2.1. Pole `IlośćPotwierdzonych`
- Wyliczane jako `potwierdzeni / zapisani`.
- `zapisani` = liczba uczestników z `rows`.
- `potwierdzeni` = liczba rekordów `confirmations` ze statusem pozytywnym.
- Identyfikacja oparta o klucz logiczny `id:<playerId>` (fallback `name:<playerName>`), aby nie mieszać graczy o tej samej nazwie.

### 5.2.2. Pola finansowe w szczegółach gry
- `entryFee` — opłata wejściowa gracza; wartość liczbowa (digits-only).
- `rebuy` — suma wszystkich pól `RebuyN` gracza (utrzymywana równolegle do listy składowych).
- `payout` — wypłata końcowa gracza.
- `points` — punkty rankingowe.
- „Ten fragment kodu robi XXX”: logika modala rebuy rozdziela `values[]` i `indexes[]`, dzięki czemu `Rebuy1/Rebuy2/...` zachowują numerację nawet gdy usuwasz kolumny pośrodku.

### 5.2.3. Daty i sortowanie (`Najbliższa gra`)
- Obsługiwane formaty: `YYYY-MM-DD`, `DD.MM.YYYY`, `DD-MM-YYYY`.
- Wiersze z datą < dzisiejsza są odfiltrowane.
- Sortowanie rosnące: najbliższy termin wyżej.

## 5.3. MAIN — działanie checkboxów i przełączników
- Checkboxy potwierdzeń (w sekcji potwierdzeń/statusów) zapisują status per gracz/per gra.
- Przełączniki dostępów w `Strefie gracza` (wynikające z `player_access`) decydują, czy sekcja ma się renderować po PIN.
- Przełączniki/statyczne flagi widokowe są ponownie synchronizowane po snapshotach `player-access-updated`, żeby po odświeżeniu nie „znikały” uprawnienia.

## 5.4. MAIN — widok user vs admin
- Admin: pełna edycja danych gier, graczy, statystyk, potwierdzeń i kalkulatorów.
- User: tylko sekcje dozwolone PIN-em i mapą uprawnień; brak akcji niszczących rekordy.
- PWA wymusza scenariusz user-only przy starcie `?pwa=1&view=user`.

## 5.5. SECOND — mapa ekranów i nawigacji

### 5.5.1. Ekran główny Tournament of Poker (admin)
Sekcje sidebaru:
1. `Lista graczy`
2. `Losowanie stołów`
3. `Wpłaty`
4. `Podział puli`
5. `Faza grupowa`
6. `Półfinał`
7. `Finał`
8. `Wypłaty`
9. `Czat` (wspólny kanał komunikacji)

### 5.5.2. Każdy przycisk w `Lista graczy`
- `Dodaj gracza` — tworzy rekord gracza z unikalnym `id` i pustymi polami roboczymi.
- `Usuń` — usuwa gracza oraz czyści jego referencje w: przypisaniach stołów, eliminacjach, mapach rebuy, payoutach.
- `Losuj PIN` — generuje 5-cyfrowy PIN i sprawdza unikalność względem istniejących graczy.
- `Edytuj uprawnienia` — otwiera modal checkboxów sekcyjnych użytkownika.
- `Wyzeruj Rebuy` — zeruje wszystkie `payments.table12Rebuys` i powiązane pola puli.

### 5.5.3. Każdy przycisk w `Losowanie stołów`
- `Dodaj stół` — dopisuje nowy stół (`StółN`).
- `Usuń stół` — usuwa stół i wykonuje renumerację globalnych indeksów `RebuyN`, aby nie zostały luki.
- `Select STÓŁ` per gracz — zapis przypisania do stołu na `change` (stabilny UX dropdown).

### 5.5.4. Każdy przycisk i pole we `Wpłaty`
- `REBUY` (w Tabela12) — otwiera modal rebuy konkretnego gracza.
- W modalu rebuy:
  - `Dodaj Rebuy` — dopisuje nową kolumnę `RebuyX` (globalny indeks).
  - `Usuń Rebuy` — usuwa wskazany `RebuyX` i kompaktuje indeksy globalnie.
  - `X` — zamyka modal.
- `BUY-IN` per gracz jest polem wejściowym liczbowym (sanityzacja do cyfr).

## 5.6. SECOND — każdy checkbox i jego efekt
- `Status płatności` (Lista graczy): przełącza `Do zapłaty`/`Opłacone`; wpływa na wizualny status oraz sumaryczne panele finansowe.
- `ELIMINATED` w Tabela19 (faza grupowa):
  - `true` => gracz przechodzi do Tabela19A (eliminowani),
  - `false` => wraca do Tabela19B (pozostali).
- `ELIMINATED` w Tabela22 (półfinał): oznacza eliminację półfinałową i dopisuje do `semi.eliminatedOrder`.
- `showInitial` / `showFinal` (wypłaty): kontrola widoczności kolumn „POCZĄTKOWA WYGRANA” i „KOŃCOWA WYGRANA” w admin-view i user-view.

## 5.7. SECOND — obliczanie każdego kluczowego pola

### 5.7.1. Tabela10
- `SUMA = Σ(BUY-IN z Tabela12) + Σ(REBUY z Tabela12)`.
- `LICZ. REBUY/ADD-ON` = liczba niepustych pól rebuy (nie suma wartości).

### 5.7.2. Tabela11
- `RAKE = (ΣBUY-IN + ΣREBUY) × (procent/100)`.
- `BUY-IN netto = BUY-IN brutto - rake od BUY-IN`.
- `REBUY netto = REBUY brutto - rake od REBUY`.
- `POT = BUY-IN netto + REBUY netto`.

### 5.7.3. Tabela16
- Wiersze 1–3: wejście procentowe (domyślne fallbacki 50/30/20).
- Wiersze 4+: wejście kwotowe bez `%`.
- `KWOTA`:
  - wiersze 1–3: `% × baza podziału`,
  - wiersze 4+: wartość bezpośrednia.
- `SUMA = KWOTA + Σ(REBUY w wierszu) + Σ(MOD)`.

### 5.7.4. Tabela18 / Tabela19 / Tabela21 / Tabela23
- `Tabela18.ŁĄCZNY STACK` = suma stacków aktywnych graczy po stołach.
- `%` w tabelach grupowej/półfinałowej/finałowej = `stack gracza / Tabela18.ŁĄCZNY STACK`.
- `Tabela23` sortuje finalistów malejąco po `finalStack`.

## 5.8. SECOND — user-view (PIN) krok po kroku
- Użytkownik wpisuje PIN i po walidacji tworzony jest kontrakt sesji (`userTournamentSession`).
- Kontrakt określa dokładnie: `playerId`, `allowedSections`, `chatAllowed`, `readonly`.
- Dane turnieju użytkownika są renderowane wyłącznie z `readonlyTables.rTournamentState`.
- Jeżeli readonly snapshot nie istnieje, UI pokazuje komunikat o braku danych readonly zamiast renderować edycyjny model admina.
- `chatTab` jest jedyną sekcją interaktywną po stronie usera.

## 5.9. Przykłady „ten fragment kodu robi XXX”
1. **Snapshot guard przy edycji**: mechanizm `hasActiveEdit + pendingLocalWrites + deferredSnapshotState` blokuje nadpisanie wpisywanego pola przez opóźniony snapshot.
2. **Render token user-view**: `userTournamentRenderToken` przerywa stary render, gdy nowszy stan już wystartował.
3. **Renumeracja Rebuy po usunięciu stołu**: mapowanie `oldIndex -> newIndex` utrzymuje spójne `RebuyN` i zgodność z kolumnami puli.
4. **Fallback identyfikacji gracza**: `playerId` jest preferowany, ale dla starych rekordów działa kompatybilność po nazwie gracza.

## 5.10. Lista kompletności (wymagania z promptu)
- Opisano działanie:
  - wszystkich głównych ekranów i zakładek,
  - wszystkich globalnych przycisków,
  - przycisków sekcyjnych (Main + Second),
  - checkboxów i przełączników,
  - obliczeń kluczowych pól finansowych/stackowych/payoutowych,
  - różnic między widokiem user i admin,
  - kluczowych funkcji stabilizujących render i synchronizację.

