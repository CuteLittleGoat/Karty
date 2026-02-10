# Analiza: dlaczego na mobile czasem w pasku adresu jest `about:blank`

## Kontekst
Pytanie dotyczy zachowania adresu URL w przeglądarce mobilnej: raz widoczny jest właściwy adres strony, a innym razem `about:blank`.

## Wniosek główny
Najbardziej prawdopodobna przyczyna **nie leży w kodzie aplikacji**, tylko w sposobie uruchamiania strony na telefonie (in-app browser / WebView / skrót / mechanizm pośredni), ponieważ front-end projektu:

1. **Nie zawiera żadnej logiki, która ustawia nawigację na `about:blank`**.
2. Praktycznie nie wykonuje nawigacji URL (czyta tylko `window.location.search` do trybu `?admin=1`).
3. Nie ma manifestu PWA ani service workera, więc nie ma tu mechanizmu „app-shell”, który sam by zmieniał sposób prezentacji adresu.

## Co potwierdziłem w kodzie

### 1) Brak `about:blank` i brak wymuszania nawigacji
W kodzie nie ma odwołań do `about:blank`, `window.open(...)`, `location.assign(...)`, `location.replace(...)`, ani `window.location.reload()`.

### 2) Jedyny odczyt `location`
Aplikacja odczytuje tylko query parametry (`window.location.search`) do ustalenia, czy ma działać tryb administratora.

### 3) Brak PWA/Service Worker
W repo nie ma pliku manifestu i brak rejestracji service workera po stronie webowej.

## Dlaczego więc na mobile może pojawiać się `about:blank`
To zwykle efekt warstwy „opakowującej” stronę:

- otwarcie linku wewnątrz innej aplikacji (np. komunikator, social media),
- pośredni ekran startowy WebView,
- skrypt pośredni otwierający stronę w nowym kontekście,
- nietypowy skrót na ekranie głównym prowadzący najpierw do pustej karty.

W takich przypadkach pasek adresu może tymczasowo lub stale pokazywać `about:blank`, mimo że właściwa treść strony została już załadowana.

## Jak szybko zawęzić przyczynę (diagnostyka praktyczna)
1. Otwórz dokładnie ten sam URL:
   - bezpośrednio w Chrome/Safari,
   - przez link z komunikatora,
   - ze skrótu na ekranie głównym.
2. Porównaj, w którym wariancie pojawia się `about:blank`.
3. Jeśli problem występuje tylko w jednym kanale otwarcia, źródło jest poza aplikacją (sposób uruchomienia), nie w kodzie.

## Rekomendacja
- Do codziennego użycia i testów uruchamiaj aplikację bezpośrednio w pełnej przeglądarce mobilnej.
- Jeśli użytkownicy otwierają aplikację z innych aplikacji, dodaj krótką instrukcję „Otwórz w przeglądarce systemowej”, aby uniknąć wariantu `about:blank`.

