# Analiza opcji wdrożenia PWA (Main + Second)

## Prompt użytkownika
> Przeprowadź analizę opcji zrobienia aplikacji PWA.  
> Chciałbym, żeby aplikacja miała ikonę Pliki/Ikona.png  
> Chciałbym, żeby aplikacja była ograniczona do widoku użytkownika.  
> Chciałbym, żeby była opcja instalacji na urządzeniu jako osobna aplikacja.  
> Chciałbym, żeby w aplikacji nie było paska adresu ani interface przeglądarki.

---

## Cel biznesowy i techniczny
Wymagania użytkownika odpowiadają klasycznemu scenariuszowi **PWA instalowanego w trybie standalone/fullscreen**:
1. własna ikona aplikacji,
2. możliwość „Zainstaluj aplikację” na urządzeniu,
3. uruchamianie bez paska adresu i bez typowego UI przeglądarki,
4. domyślny start w widoku użytkownika (bez panelu admina).

## Czy to jest możliwe w obecnej architekturze?
Tak. Obecna aplikacja jest oparta o statyczne pliki HTML/CSS/JS, więc wdrożenie PWA jest relatywnie proste i nie wymaga zmiany frameworka.

## Opcje realizacji

### Opcja A — Jedna aplikacja PWA dla całego repo (rekomendowana na start)
**Opis:**
- jedna konfiguracja PWA (manifest + service worker),
- jedna nazwa i jedna ikona (`Pliki/Ikona.png` po konwersji do kilku rozmiarów),
- jeden punkt wejścia (np. `Main/index.html` albo osobna „strona startowa użytkownika”).

**Zalety:**
- najmniejsza złożoność i koszt wdrożenia,
- szybkie osiągnięcie „instalowalności” i trybu bez paska adresu,
- łatwiejsze utrzymanie.

**Wady:**
- tylko jeden „brand” i jedna tożsamość instalowanej aplikacji,
- mniej elastyczne sterowanie oddzielnie dla Main/Second.

### Opcja B — Dwie niezależne aplikacje PWA (Main i Second osobno)
**Opis:**
- każdy moduł ma własny manifest i własny service worker,
- użytkownik może zainstalować Main i/lub Second jako osobne aplikacje.

**Zalety:**
- pełna niezależność modułów,
- czytelny podział funkcjonalny.

**Wady:**
- większy koszt utrzymania (2x konfiguracja PWA),
- większe ryzyko rozjazdu konfiguracji i cache.

### Opcja C — Jedna PWA + dedykowany „launcher” użytkownika
**Opis:**
- jedna aplikacja PWA,
- start z lekkiej strony użytkownika (bez elementów admina),
- wejście do części admin tylko po świadomej akcji (np. ukryty skrót/przełącznik lub osobny URL).

**Zalety:**
- najlepszy kompromis UX i bezpieczeństwa ekspozycji interfejsu,
- aplikacja po instalacji wygląda jak „apka dla użytkownika”, nie panel administracyjny.

**Wady:**
- wymaga dopracowania flow nawigacji.

## Spełnienie wymagań użytkownika (mapowanie 1:1)

1. **Ikona `Pliki/Ikona.png`**
   - w manifest trzeba dodać zestaw ikon (np. 192x192 i 512x512),
   - źródłem może być `Pliki/Ikona.png`, ale praktycznie warto wygenerować kilka rozmiarów PNG/WebP.

2. **Ograniczenie do widoku użytkownika**
   - najbezpieczniej ustawić `start_url` na stronę user-view,
   - ukryć/odseparować admin UI w ścieżce instalacyjnej,
   - dodatkowo wymusić kontrolę uprawnień po stronie logiki (nie tylko CSS/DOM).

3. **Instalacja jako osobna aplikacja**
   - wymagany poprawny `manifest.webmanifest`,
   - wymagany `service-worker.js`,
   - wymagane serwowanie przez HTTPS (lub localhost w dev).

4. **Brak paska adresu i UI przeglądarki**
   - `display: standalone` (lub `fullscreen`) w manifeście,
   - realny efekt zależy od platformy:
     - Android/Chrome: zazwyczaj pełny efekt app-like,
     - iOS/Safari: działa po „Dodaj do ekranu początkowego”, z pewnymi ograniczeniami systemowymi,
     - desktop: zależne od przeglądarki (Chrome/Edge wspierają dobrze).

## Minimalny zakres implementacji (MVP PWA)
1. Dodać `manifest.webmanifest`.
2. Dodać service worker (cache app shell + fallback offline).
3. Podpiąć manifest i rejestrację SW w obu punktach wejścia, które mają działać instalowalnie.
4. Ustawić `display: standalone`, `theme_color`, `background_color`, `start_url` na user-view.
5. Przygotować ikony z `Pliki/Ikona.png` w wymaganych rozmiarach.
6. Przetestować instalację na Android + desktop oraz zachowanie na iOS.

## Ryzyka i uwagi
- Samo „ukrycie admina” nie jest zabezpieczeniem — potrzebna kontrola uprawnień po stronie logiki danych.
- Trzeba zaplanować strategię cache (zbyt agresywny cache może pokazywać stare dane w turnieju).
- Przy dwóch modułach lepiej unikać konfliktu scope service workera.

## Rekomendacja końcowa
Najlepsza ścieżka: **Opcja C (jedna PWA + launcher użytkownika)**, wdrażana etapowo:
1. najpierw MVP PWA (instalacja + standalone + ikony),
2. potem dopracowanie user-only flow,
3. na końcu ewentualne rozdzielenie na 2 PWA, jeśli będą mocne powody biznesowe.

Taka kolejność najszybciej spełni wszystkie wymagania użytkownika przy najniższym ryzyku wdrożeniowym.
