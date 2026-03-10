# Analiza działania PWA modułu Main – błąd 404 po uruchomieniu zainstalowanej aplikacji

## Prompt użytkownika
> Sprawdź poprawność działania PWA modułu Main. Przeprowadź analizę i zapisz jej wyniki w Analizy.
> Próba wejścia przez zainstalowaną apke skutkuje błędem z załącznika. Strona działa w wersji przez przeglądarkę.

## Zakres analizy
- Moduł: `Main`
- Obszary sprawdzone: manifesty PWA, bootstrap rejestrujący SW, service worker, sposób budowania URL startowego aplikacji.

## Wykonane kroki
1. Odczyt konfiguracji PWA (`Main/pwa-config.js`, `Main/pwa-bootstrap.js`).
2. Odczyt wszystkich manifestów (`Main/manifest-*.webmanifest`).
3. Odczyt service workera (`Main/service-worker.js`).
4. Porównanie ścieżek absolutnych/relatywnych pod kątem hostingu GitHub Pages (repozytorium projektowe pod ścieżką, a nie domeną root).

## Ustalenia

### 1) Główna przyczyna błędu 404 w aplikacji zainstalowanej jako PWA
W manifestach PWA modułu Main użyto **absolutnego** `start_url` i `scope`:
- `"start_url": "/Main/index.html?..."`
- `"scope": "/Main/"`

Przy hostingu na GitHub Pages dla repozytorium projektowego aplikacja zwykle działa pod prefiksem repozytorium (np. `/Karty/...`).
Wtedy absolutne `"/Main/..."` wskazuje na root domeny (`https://<user>.github.io/Main/...`), co skutkuje stroną 404 GitHub Pages – dokładnie jak na załączonym zrzucie.

### 2) Dlaczego w przeglądarce działa
Wersja otwierana ręcznie w przeglądarce jest uruchamiana pod prawidłowym adresem (z prefiksem repozytorium), więc normalna nawigacja działa. Problem ujawnia się przy starcie aplikacji zainstalowanej, bo to właśnie manifest decyduje o URL startowym.

### 3) Service worker nie jest pierwotną przyczyną zgłoszonego błędu
`service-worker.js` jest rejestrowany relatywnie (`service-worker.js`) i cache’uje pliki shella relatywnie (`./index.html`, `./styles.css` itd.), więc sam mechanizm cache nie tłumaczy wejścia na stronę 404 GitHub Pages z root domeny.

## Rekomendacja naprawy
W każdym manifeście Main zmienić:
- `start_url` z `"/Main/index.html?..."` na ścieżkę relatywną, np. `"./index.html?..."`
- `scope` z `"/Main/"` na `"./"`

To pozwoli poprawnie rozwiązywać URL niezależnie od tego, czy aplikacja jest pod domeną root, czy pod prefiksem repozytorium (GitHub Pages project site).

## Dodatkowa rekomendacja wdrożeniowa
Po zmianie manifestów:
1. Podbić wersję cache w `service-worker.js` (np. `karty-main-pwa-v2`),
2. Przeinstalować PWA na urządzeniu testowym,
3. Zweryfikować uruchomienie z ikony aplikacji.

## Wniosek końcowy
Zgłoszenie jest zasadne. Błąd 404 zainstalowanej aplikacji PWA modułu Main wynika z niepoprawnych (dla GitHub Pages project site) **absolutnych** ścieżek w `start_url` i `scope` manifestów.
