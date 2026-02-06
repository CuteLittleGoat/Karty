# Karty - instrukcje użytkownika

## 1. Uruchomienie
- Otwórz plik `Main/index.html` w przeglądarce (aplikacja działa jako statyczny front-end).
- Domyślnie zobaczysz widok uczestnika turnieju w stylu kasyna (ciemny noir, złoto, filcowa zieleń).

## 2. Uruchomienie wersji Android (WebView)
1. Otwórz w Android Studio katalog `MigracjaAndroid/AndroidApp`.
2. Odczekaj na synchronizację Gradle.
3. Uruchom aplikację (`Run ▶`) na emulatorze lub urządzeniu.
4. Aplikacja automatycznie otworzy widok użytkownika z adresu: `https://cutelittlegoat.github.io/Karty/Main/index.html`.

## 3. Widok administratora
- Aby uruchomić wariant admina, dopisz do adresu: `?admin=1`.
- Przykład: `Main/index.html?admin=1`.

## 4. Co możesz zrobić na stronie
- Podglądać przypisania graczy do stołów.
- Sprawdzać status wpisowego oraz saldo wygranych.
- W trybie administratora zobaczyć sekcję do zarządzania stołami i graczami (aktualnie w wersji szablonu).

## 5. Konfiguracja Firebase
- Uzupełnij dane w pliku `config/firebase-config.js`.
- Szczegółowa instrukcja znajduje się w pliku `Firebase.md`.

## 6. Zasoby graficzne
- Folder `Pliki/` jest przeznaczony na grafiki i zasoby używane w aplikacji.
