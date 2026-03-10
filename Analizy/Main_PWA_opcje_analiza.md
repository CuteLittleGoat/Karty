# Analiza PWA dla modułu Main

## Prompt użytkownika
> Przeprowadź analizę opcji zrobienia aplikacji PWA. Chciałbym, żeby aplikacja miała ikonę Pliki/Ikona.png Chciałbym, żeby aplikacja była ograniczona do widoku użytkownika. Chciałbym, żeby była opcja instalacji na urządzeniu jako osobna aplikacja. Chciałbym, żeby w aplikacji nie było paska adresu ani interface przeglądarki. Aplikacja ma dotyczyć tylko modułu Main. Chcę mieć możliwość zablokowania widoku w orientacji pionowej lub poziomej lub zezwolić żeby urządzenie decydowało.

## Stan obecny (Main)
- Moduł `Main` działa jako aplikacja webowa oparta o `index.html`, `styles.css` i `app.js`.
- W widoku istnieje już ikona `../Pliki/Ikona.png` (header), więc zasób graficzny jest już używany w UI i może być ponownie użyty jako ikona PWA.
- Obecnie brak elementów PWA: brak `manifest.webmanifest`, brak Service Workera, brak ustawień instalowalności i trybu standalone.

## Wymagania z promptu i ich mapowanie na PWA

1. **Ikona aplikacji: `Pliki/Ikona.png`**
   - Technicznie możliwe przez pole `icons` w `manifest.webmanifest`.
   - Rekomendacja: przygotować osobne rozmiary ikon (min. 192x192 i 512x512) wygenerowane na bazie `Pliki/Ikona.png`.

2. **Ograniczenie do widoku użytkownika (bez panelu admina)**
   - Najbezpieczniejsze podejście: oddzielny punkt wejścia (np. `Main/user.html`) albo parametr uruchomienia dla trybu PWA (`?mode=user`) wymuszany podczas startu.
   - UI-only ukrycie sekcji admina nie wystarcza jako zabezpieczenie — trzeba wymusić logikę po stronie aplikacji (blokada renderu admina i akcji admina w tym trybie).

3. **Instalacja jako osobna aplikacja na urządzeniu**
   - Wymaga: HTTPS, manifest, Service Worker, poprawny `start_url`, `name/short_name`, `display`.
   - Android/Chrome: pełne wsparcie instalacji.
   - iOS/Safari: instalacja przez „Dodaj do ekranu początkowego”, częściowe wsparcie.

4. **Brak paska adresu i interfejsu przeglądarki**
   - Ustawić w manifeście `display: "standalone"` lub `"fullscreen"`.
   - `fullscreen` daje najmocniejsze ukrycie chrome przeglądarki, ale może pogorszyć UX (gesty systemowe, status bar).
   - Na części platform mogą pojawić się elementy systemowe niezależnie od ustawienia (to ograniczenie platformy, nie kodu).

5. **Dotyczy tylko modułu Main**
   - Manifest i Service Worker powinny być osadzone wyłącznie w ścieżce modułu `Main` (zakres `scope` ograniczony do `/Main/`).
   - `start_url` powinien prowadzić do widoku użytkownika modułu Main.

6. **Kontrola orientacji: pion / poziom / decyzja urządzenia**
   - Manifest wspiera `orientation` (`portrait`, `landscape`, `any`).
   - Najprostsza opcja: utrzymywać 3 warianty konfiguracji (lub 1 konfigurację + ustawienie dynamiczne generowane przed deployem).
   - Dodatkowo można użyć Screen Orientation API po starcie aplikacji, ale wsparcie bywa ograniczone (szczególnie iOS).

## Rekomendowana architektura wdrożenia (Main-only PWA)

### 1) Pliki konfiguracyjne PWA
- Dodać do `Main`:
  - `manifest.webmanifest`
  - `service-worker.js`
  - folder ikon PWA (np. `Main/pwa-icons/`), wygenerowanych z `Pliki/Ikona.png`

### 2) Manifest (kluczowe pola)
- `name`, `short_name`
- `start_url`: np. `/Main/index.html?view=user&pwa=1`
- `scope`: `/Main/`
- `display`: `standalone` (lub opcjonalnie `fullscreen`)
- `orientation`: zmienialne (`portrait` / `landscape` / `any`)
- `icons`: min. 192 i 512
- `theme_color`, `background_color`

### 3) Wymuszenie trybu użytkownika
- Dla uruchomienia z PWA:
  - sprawdzać parametr `pwa=1` i wtedy wymusić wyłącznie zakładki/strefy użytkownika,
  - nie renderować panelu admina,
  - zablokować akcje admina w JS (nie tylko CSS).
- Dla uruchomienia z przeglądarki można zachować pełny tryb jak obecnie.

### 4) Service Worker
- Wersja minimum (MVP): cache `index.html`, `styles.css`, `app.js`, fontów i ikon + fallback offline.
- Wersja rozszerzona: strategia `stale-while-revalidate` dla statycznych assetów.

## Opcje orientacji – praktyczny model

### Wariant A (najprostszy operacyjnie)
- Trzy osobne pliki manifestu:
  - `manifest-portrait.webmanifest`
  - `manifest-landscape.webmanifest`
  - `manifest-any.webmanifest`
- Podpinanie właściwego manifestu zależnie od wybranego profilu wdrożenia.

### Wariant B (jedna baza + build/deploy)
- Jeden szablon manifestu i podmiana pola `orientation` na etapie publikacji.
- Lepsze przy automatyzacji release.

### Wariant C (runtime)
- Przełączanie orientacji API po uruchomieniu.
- Najmniej przewidywalne między platformami, niezalecane jako jedyne rozwiązanie.

## Ograniczenia platformowe (ważne)
- **Brak paska adresu**: działa dla zainstalowanej PWA; w zwykłej karcie przeglądarki pasek zostaje.
- **iOS**: wsparcie PWA jest poprawne, ale mniej elastyczne niż Android (szczególnie blokada orientacji i zachowanie pełnego fullscreen).
- **Desktop**: instalacja PWA możliwa, ale UI systemowy okna nadal istnieje (to normalne).

## Proponowana kolejność wdrożenia
1. Dodać manifest + ikony z `Pliki/Ikona.png`.
2. Dodać Service Worker (minimalny cache).
3. Dodać mechanizm wymuszenia `view=user` dla `start_url` PWA.
4. Ustawić `display: standalone` i przetestować na Android/iOS.
5. Dodać wybór orientacji (A lub B z sekcji powyżej).
6. Testy instalacji i uruchomienia offline.

## Ocena ryzyka
- **Niskie ryzyko**: dodanie manifestu, ikon, installability.
- **Średnie ryzyko**: pewne i trwałe wymuszenie trybu user-only bez regresji dla admina.
- **Średnie/wysokie ryzyko**: pełna spójność orientacji i fullscreen na wszystkich platformach (ograniczenia systemowe).

## Wniosek końcowy
Wymagania są **realne do wdrożenia** dla modułu `Main` jako PWA instalowalnej na urządzeniu z ikoną `Pliki/Ikona.png`, uruchamianej bez klasycznego UI przeglądarki (w trybie standalone/fullscreen), z obsługą wariantów orientacji. Najważniejszy element architektoniczny to **twarde wymuszenie trybu użytkownika** dla ścieżki uruchamianej z PWA oraz ograniczenie `scope` do `Main`.
