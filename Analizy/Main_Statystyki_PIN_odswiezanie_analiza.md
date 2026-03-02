# Analiza poprawki: Main / Strefa Gracza / Statystyki

## Prompt użytkownika
"Przygotuj mi plik w Analizy. Zapisz w nim wszystko co zrobiłeś w kodzie i dlaczego. Zapisz jak to działało wcześniej i jak powinno działać po poprawce."

## Kontekst błędu
W widoku użytkownika (Main -> Strefa Gracza -> Statystyki) po pierwszym poprawnym wpisaniu PIN-u tabele były puste. 
Dane pojawiały się dopiero po odświeżeniu strony i ponownej autoryzacji PIN-em.

## Jak działało wcześniej
1. Weryfikacja PIN w zakładce „Statystyki” korzystała z `adminPlayersState.playerByPin`.
2. Ten stan graczy i mapa PIN były skutecznie utrzymywane głównie przez logikę panelu graczy (admin).
3. W scenariuszu użytkownika dane dostępu mogły nie być jeszcze gotowe w momencie pierwszej autoryzacji PIN.
4. Efekt: użytkownik przechodził bramkę PIN, ale filtr lat/statystyk działał na niepełnym stanie i widok pokazywał puste tabele.
5. Odświeżenie strony i ponowna autoryzacja często rozwiązywały problem, bo subskrypcje zdążały się już zsynchronizować.

## Co zostało zmienione w kodzie

### 1) Wspólna subskrypcja dostępu graczy uruchamiana globalnie
Dodano:
- `let sharedPlayerAccessUnsubscribe = null;`
- `initSharedPlayerAccess()`

Cel:
- Zapewnić, że także w czystym widoku użytkownika aplikacja od początku nasłuchuje `app_settings/player_access` i aktualizuje stan graczy oraz uprawnień.

Dlaczego:
- Problem wynikał z zależności od dostępności mapy PIN/uprawnień w momencie wpisania PIN.
- Globalna inicjalizacja eliminuje „wyścig” między wejściem użytkownika do zakładki a załadowaniem dostępu.

### 2) Ujednolicenie budowy mapy PIN -> gracz
Dodano funkcję:
- `rebuildAdminPlayersPinMap()`

Zmiana:
- Zastąpiono lokalne wywołania wcześniejszej lokalnej funkcji odbudowującej mapę PIN wspólną funkcją, używaną we wszystkich kluczowych miejscach odświeżania/edycji danych graczy.

Dlaczego:
- Jedno źródło prawdy dla mapowania PIN zmniejsza ryzyko niespójności stanu.

### 3) Wymuszenie odświeżenia dostępu do statystyk po przyjściu danych graczy
W `initSharedPlayerAccess()` po aktualizacji graczy wykonywane jest:
- `synchronizeStatisticsAccessState();`
- `window.dispatchEvent(new CustomEvent("statistics-access-updated"));`

Dlaczego:
- Widok statystyk nasłuchuje zdarzenia i po jego otrzymaniu ponownie liczy dostępne lata oraz renderuje dane.
- Dzięki temu dane pojawiają się bez ręcznego odświeżania strony.

### 4) Inicjalizacja wspólnej subskrypcji podczas startu aplikacji
W `bootstrap()` dodano:
- `initSharedPlayerAccess();`

Dlaczego:
- Zapewnia to aktywność subskrypcji od samego początku działania aplikacji.

### 5) Aktualizacja dokumentacji Main
Zmieniono:
- `Main/docs/README.md`
- `Main/docs/Documentation.md`

Dlaczego:
- Aby opisać docelowe zachowanie po poprawce (dane statystyk i lata mają pojawiać się od razu po poprawnym PIN).

## Jak powinno działać po poprawce
1. Użytkownik otwiera „Statystyki” w Strefie Gracza.
2. Wpisuje poprawny PIN z uprawnieniem do statystyk.
3. Bez odświeżania strony od razu widzi:
   - przypisane lata,
   - tabelę statystyk,
   - ranking.
4. Jeśli użytkownik nie ma przypisanych lat/uprawnień, widzi odpowiedni komunikat, ale nie występuje już efekt „pustych tabel przez brak synchronizacji”.

## Wniosek
Poprawka usuwa problem inicjalizacji stanu dostępu w pierwszej sesji użytkownika i stabilizuje przepływ:
- dane dostępu graczy są ładowane globalnie,
- mapa PIN jest utrzymywana spójnie,
- widok statystyk dostaje sygnał do renderu natychmiast po otrzymaniu danych dostępowych.

---

## Aktualizacja po ponownym zgłoszeniu (Statystyki/PIN/Odśwież)

## Prompt użytkownika
"Przeczytaj analizę Analizy/Main_Statystyki_PIN_odswiezanie_analiza.md

Poprawka nie zadziałała w sposób oczekiwany.
Obecnie wykonuję czynności:

1. Wchodzę na stronę https://cutelittlegoat.github.io/Karty/Main/index.html
2. Klikam przycisk \"Strefa Gracza\"
3. Pojawia się bramka do wpisania PIN
4. Wpisuję PIN użytkownika mającego odpowiednie uprawnienia
5. Klikam na \"Statystyki\".
6. Wyświetlają mi się puste tabele (załączam screen)
7. Klikam przycisk \"Odśwież\" (funkcjonalność nie istniała jeszcze w momencie pisania analizy)
8. Klikam \"Strefa Gracza\"
9. Pojawia mi się panel boczny z sekcjami.
10. Ponownie muszę wpisać PIN
11. W sekcji Statystyki pojawiają się dopiero dane.

Sprawdź czemu w dalszym ciągu nie pojawiają się aktualne dane w \"Statystyki\" tylko muszę odświeżyć aplikację.
Dodatkowo sprawdź czemu po naciśnięciu przycisku \"Odśwież\" muszę ponownie wpisywać PIN. PIN miał być zapamiętany do momentu resetu aplikacji.
Dodatkowo naciśnięci przycisku \"Odśwież\" w podglądzie widoku gracza będąc w widoku admina resetuje aplikację.
Przycisk \"Odśwież\" w widoku gracza ma działać tak samo jak w widoku admina - czyli odświeżać dane w aktualnej zakładce a nie resetować stronę. Popraw to w modułach Main i Second.

Zaktualizuj analizę Analizy/Main_Statystyki_PIN_odswiezanie_analiza.md o rozwiązania, jakie teraz wprowadzisz."

## Dlaczego problem dalej występował
1. Weryfikacja wejścia do „Strefa Gracza” ustawiała stan uprawnień sekcji (w tym Statystyki), ale nie wykonywała pełnej synchronizacji logiki statystyk (`synchronizeStatisticsAccessState`).
2. W efekcie przy pierwszym wejściu do „Statystyki” po PIN-ie strefy dane mogły nie zostać przeliczone/rerenderowane od razu i widok pozostawał pusty.
3. Przycisk „Odśwież” w panelu użytkownika wykonywał `window.location.reload()`, co resetowało widok i wymuszało ponowną autoryzację PIN.

## Wprowadzone poprawki

### Main
1. W `syncPlayerZoneSectionAccess(...)` zamiast samego `updateStatisticsVisibility()` wywoływana jest teraz `synchronizeStatisticsAccessState()`.
   - Skutek: po odblokowaniu Strefy Gracza stan statystyk jest od razu spójny (weryfikacja uprawnień + event odświeżenia danych).
2. Przycisk `#userPanelRefresh` przestał robić `window.location.reload()`.
   - Teraz odświeża tylko aktywny widok:
     - `Aktualności` → wymuszenie pobrania dokumentu aktualności z serwera,
     - `Regulamin` → wymuszenie pobrania regulaminu z serwera,
     - `Strefa Gracza > Gry do Potwierdzenia` → uruchomienie lokalnego przycisku odświeżania sekcji,
     - `Strefa Gracza > Statystyki` → ponowna synchronizacja dostępu/statystyk,
     - `Strefa Gracza > Czat` → restart subskrypcji gracza.
   - Skutek: brak resetu aplikacji i brak utraty sesji PIN przy odświeżaniu z panelu użytkownika.

### Second
1. Przycisk `#userPanelRefresh` również przestał używać `window.location.reload()`.
2. Odświeżanie działa per aktywna zakładka użytkownika:
   - `Aktualności`, `Regulamin`, `Gracze`, `Czat` → wymuszenie pobrania z `source: "server"`.
3. Dla zakładek bez dedykowanego źródła ręcznego odświeżenia pokazywany jest komunikat, że dane aktualizują się automatycznie.

## Efekt po poprawce
1. W Main, po wejściu do Strefy Gracza i przejściu do „Statystyki”, dane powinny pojawić się bez resetu strony.
2. Kliknięcie „Odśwież” w widoku użytkownika nie resetuje aplikacji i nie wymaga ponownego wpisania PIN (do czasu faktycznego resetu sesji aplikacji).
3. Zachowanie przycisku „Odśwież” w widoku użytkownika jest zgodne z oczekiwaniem: odświeżenie bieżącej zakładki, a nie przeładowanie całej strony.
