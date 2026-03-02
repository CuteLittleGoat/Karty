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
