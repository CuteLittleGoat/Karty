# Analiza kodu aplikacji — linie kodu i komentarze

## Prompt użytkownika
"Przeprowadź mi analizę kodu aplikacji i przygotuj zestawienie:
- Ile łącznie jest linii kodu?
- Ile łącznie jest komentarzy w kodzie?
- Ile łącznie jest linii kodu bez komentarzy?

Nie uwzględniaj plików: Kolumny.md, DetaleLayout.md, AGENTS.md, plików w ścieżce docs oraz plików w ścieżce Analizy"

## Zakres analizy (po wykluczeniach)
Uwzględnione pliki:
- Main/app.js
- Main/index.html
- Main/styles.css
- Pliki/Migracja_Android.md
- config/firebase-config.js

Wykluczone zgodnie z poleceniem:
- Kolumny.md
- DetaleLayout.md
- AGENTS.md
- cały katalog docs/
- cały katalog Analizy/

## Wyniki
### Zestawienie szczegółowe
- Main/app.js: 6997 linii, 1 linia komentarza, 6996 linii bez komentarzy
- Main/index.html: 940 linii, 0 linii komentarza, 940 linii bez komentarzy
- Main/styles.css: 1611 linii, 0 linii komentarza, 1611 linii bez komentarzy
- Pliki/Migracja_Android.md: 1 linia, 0 linii komentarza, 1 linia bez komentarzy
- config/firebase-config.js: 16 linii, 3 linie komentarza, 13 linii bez komentarzy

### Suma łączna
- Łączna liczba linii: **9565**
- Łączna liczba linii komentarzy: **4**
- Łączna liczba linii bez komentarzy: **9561**

## Metoda
Policzone skryptem Python uruchomionym lokalnie, z wykluczeniami zgodnymi z poleceniem. Komentarze wykrywane dla:
- JavaScript/CSS: `//` oraz `/* ... */`
- HTML: `<!-- ... -->`

Dla pozostałych rozszerzeń przyjęto 0 linii komentarzy.
