# Analiza opcji wdrożenia PWA dla modułu Main

## Prompt użytkownika
> Przeprowadź analizę opcji zrobienia aplikacji PWA.  
> Chciałbym, żeby aplikacja miała ikonę Pliki/Ikona.png  
> Chciałbym, żeby aplikacja była ograniczona do widoku użytkownika.  
> Chciałbym, żeby była opcja instalacji na urządzeniu jako osobna aplikacja.  
> Chciałbym, żeby w aplikacji nie było paska adresu ani interface przeglądarki.

## Aktualizacja wymagań
> Zaktualizuj analizę. Aplikacja ma dotyczyć tylko modułu Main. Dodatkowo chcę mieć możliwość zablokowania widoku w pozycji pionowej lub poziomej.

---

## Zakres analizy
Analiza dotyczy wyłącznie **modułu Main** (`Main/index.html`, `Main/app.js`, `Main/styles.css`) i scenariusza, w którym użytkownik instaluje aplikację jako PWA na urządzeniu.

## Cel biznesowy i techniczny
Wymagania odpowiadają wdrożeniu **PWA dla Main** działającego w trybie app-like:
1. własna ikona aplikacji,
2. instalacja na urządzeniu jako osobna aplikacja,
3. uruchamianie bez paska adresu i UI przeglądarki,
4. start i praca w widoku użytkownika,
5. możliwość blokady orientacji ekranu (pion lub poziom).

## Opcje realizacji dla Main

### Opcja A — Jedna PWA oparta o `Main/index.html` (rekomendowana)
**Opis:**
- jeden `manifest.webmanifest` dla modułu Main,
- jeden `service-worker.js` w zakresie Main,
- `start_url` kieruje do user-view w Main.

**Zalety:**
- najprostsza i najszybsza implementacja,
- najmniejsze ryzyko utrzymaniowe,
- pełne pokrycie wymagań użytkownika.

**Wady:**
- brak niezależnego wariantu instalacyjnego dla Second (celowo poza zakresem).

### Opcja B — Dwa profile uruchomieniowe Main (user/admin), ale jedna instalowalna PWA
**Opis:**
- jedna instalowalna aplikacja PWA,
- domyślnie start user-view,
- admin dostępny tylko przez osobny URL/warunek (np. PIN/rola).

**Zalety:**
- zachowana funkcja administracyjna bez ekspozycji w głównym flow użytkownika,
- dobra kontrola UX przy instalacji.

**Wady:**
- wymaga dokładniejszego zaprojektowania przejścia user/admin.

## Spełnienie wymagań (mapowanie 1:1)

1. **Ikona `Pliki/Ikona.png`**
   - użyć jako źródło i wygenerować warianty co najmniej `192x192` i `512x512`,
   - dodać do `icons` w `manifest.webmanifest`.

2. **Ograniczenie do widoku użytkownika**
   - ustawić `start_url` na ścieżkę user-view modułu Main,
   - ukryć elementy admina w ścieżce użytkownika,
   - zabezpieczyć dostęp do funkcji admina logiką uprawnień (nie samym UI).

3. **Instalacja jako osobna aplikacja**
   - wymagane: poprawny `manifest.webmanifest`, aktywny `service-worker.js`, HTTPS (lub localhost w dev),
   - po spełnieniu warunków przeglądarki udostępnią instalację.

4. **Brak paska adresu i UI przeglądarki**
   - w manifeście ustawić `display: standalone` (ew. `fullscreen` jeśli potrzebny pełny ekran),
   - dodać `theme_color` i `background_color` dla spójnego wyglądu uruchamiania.

5. **Możliwość blokady orientacji (pion/poziom)**
   - w manifeście można ustawić `orientation`, np.:
     - `portrait` (blokada pionowa),
     - `landscape` (blokada pozioma),
   - orientacja działa najlepiej w zainstalowanej PWA; zachowanie zależy od platformy i przeglądarki,
   - jeśli ma być **możliwość wyboru** przez administratora/użytkownika, potrzebne są 2 warianty:
     1. dwa manifesty/buildy (osobna konfiguracja pion/poziom), albo
     2. dodatkowa logika runtime + fallback CSS/komunikat przy nieobsługiwanej blokadzie.

## Minimalny zakres implementacji (MVP Main PWA)
1. Dodać `Main/manifest.webmanifest`.
2. Dodać `Main/service-worker.js` (cache app shell + bezpieczna strategia odświeżania).
3. Podpiąć manifest i rejestrację SW w `Main/index.html`.
4. Skonfigurować:
   - `start_url` -> user-view,
   - `display: standalone`,
   - `orientation: portrait` lub `orientation: landscape` (wg decyzji),
   - ikony wygenerowane z `Pliki/Ikona.png`.
5. Przetestować instalację i orientację na Android/Chrome + desktop/Chrome/Edge + iOS/Safari.

## Blokada orientacji — decyzje projektowe

### Wariant 1: Stała blokada pionowa
- Najlepszy dla interfejsu formularzy/list.
- Najmniej ryzykowny UX dla telefonu.

### Wariant 2: Stała blokada pozioma
- Lepszy dla widoków tabelarycznych i paneli o szerokim układzie.
- Wymaga audytu czytelności na małych ekranach.

### Wariant 3: Przełączalna orientacja (bardziej zaawansowane)
- Technicznie możliwa, ale z ograniczeniami między platformami.
- Najbezpieczniej realizować przez osobne profile/konfiguracje uruchomienia.

## Ryzyka i uwagi
- Różne platformy różnie respektują `orientation` i `display`.
- iOS bywa bardziej restrykcyjny względem pełnej kontroli orientacji i zachowania fullscreen.
- Samo ukrycie panelu admina nie jest kontrolą bezpieczeństwa — uprawnienia muszą być wymuszane logicznie.
- Strategia cache musi być ostrożna, aby nie utrwalać nieaktualnych danych turniejowych.

## Rekomendacja końcowa
Dla modułu Main rekomendowana jest **Opcja A** (jedna PWA oparta o `Main/index.html`) z domyślnym startem w user-view i orientacją ustawioną statycznie na pierwszy etap:
1. wdrożyć MVP z `display: standalone`, instalacją i ikoną,
2. ustawić jedną docelową orientację (najpierw pion lub poziom — zależnie od dominującego ekranu),
3. dopiero później rozważyć wariant przełączalny, jeśli testy terenowe potwierdzą potrzebę.

Ta ścieżka najszybciej dostarczy stabilny efekt „aplikacji natywnej” dla użytkownika modułu Main.
