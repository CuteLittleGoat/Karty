# Karty - instrukcje użytkownika

## 1. Uruchomienie w przeglądarce (komputer)
1. Otwórz plik `Main/index.html` w przeglądarce (aplikacja działa jako statyczny front-end).
2. Zobaczysz widok uczestnika turnieju z trzema kartami: **Stoły i gracze**, **Lista graczy** oraz **Rozliczenia**.
3. Jeśli chcesz przejść do trybu administratora, dopisz do adresu parametr `?admin=1`.
   - Przykład lokalny: `Main/index.html?admin=1`.
   - Po przełączeniu zmieni się etykieta w karcie **Widok** (z „Użytkownik” na „Administrator”).

## 2. Uruchomienie w Android (WebView)
1. Otwórz w Android Studio katalog `MigracjaAndroid/AndroidApp`.
2. Poczekaj na pełną synchronizację Gradle.
3. Uruchom aplikację przyciskiem **Run ▶** na emulatorze lub urządzeniu.
4. Aplikacja automatycznie otworzy wersję web pod adresem: `https://cutelittlegoat.github.io/Karty/Main/index.html`.
5. W WebView widok admina jest blokowany — aplikacja mobilna zawsze pokazuje wariant użytkownika.

## 3. Widok administratora — szczegółowe kroki
Po wejściu na `?admin=1` zobaczysz sekcję **Panel administratora** z przyciskami akcji.

### 3.1 Dodawanie stołu (przycisk „Dodaj stół”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Dodaj stół**.
3. Obecnie jest to przycisk prototypowy — kliknięcie nie zmienia danych, ale pokazuje miejsce na przyszłą logikę dodawania stołów.

### 3.2 Dodawanie gracza (przycisk „Dodaj gracza”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Dodaj gracza**.
3. Przycisk jest przygotowany pod przyszłą funkcję formularza (dodanie gracza do listy w czasie rzeczywistym).

### 3.3 Zmiana stawki wpisowego (przycisk „Ustaw stawkę wejściowego”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Ustaw stawkę wejściowego**.
3. To miejsce na przyszłą zmianę wpisowego — obecnie przycisk pełni funkcję informacyjną.

### 3.4 Zakończenie rundy (przycisk „Zakończ rundę”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Zakończ rundę**.
3. Przygotowany do późniejszego podpięcia logiki zamykania rundy (np. zapis do bazy i reset list).

### 3.5 Instrukcja obsługi (przycisk „Instrukcja”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Instrukcja**.
3. Otworzy się okno modalne z treścią instrukcji pobieraną z adresu:
   `https://cutelittlegoat.github.io/Karty/docs/README.md`.
4. Jeśli chcesz pobrać najnowszą wersję:
   - Kliknij **Odśwież** w stopce modala.
5. Aby zamknąć okno:
   - Kliknij **Zamknij** (w stopce) lub **×** w prawym górnym rogu,
   - albo kliknij tło modala,
   - albo wciśnij klawisz **Esc**.

### 3.6 Wiadomości do aplikacji Android
1. W panelu admina przewiń do sekcji **Wiadomość do aplikacji Android**.
2. Wpisz treść w polu **Treść wiadomości**.
3. Kliknij **Wyślij**.
4. Jeśli Firebase nie jest skonfigurowany, zobaczysz komunikat o konieczności konfiguracji.

## 4. Widok uczestnika — co można sprawdzić
1. W karcie **Co dalej?** znajdziesz wyróżniony pasek **„Strona w budowie”**, który informuje, że widok uczestnika jest w fazie przygotowań.
2. **Stoły i gracze** — zobaczysz, do którego stołu należy każdy gracz i ile miejsc jest zajętych.
3. **Lista graczy** — sprawdzisz, czy wpisowe zostało opłacone.
4. **Rozliczenia** — widać wpisowe, wygrane oraz saldo na uczestnika.

## 5. Responsywność i urządzenia mobilne
- Aplikacja automatycznie dostosowuje układ do mniejszych ekranów.
- Na telefonach karty układają się w jednej kolumnie, a przyciski rozciągają się na pełną szerokość.
- Okno instrukcji ma własny, przewijalny obszar z treścią, dzięki czemu czytanie na mobile jest wygodne.

## 6. Konfiguracja Firebase
1. Uzupełnij dane w pliku `config/firebase-config.js`.
2. Skonfiguruj Firestore i Cloud Functions, aby kliknięcie **Wyślij** uruchamiało powiadomienie FCM w Androidzie.
3. Szczegółowa instrukcja znajduje się w pliku `Firebase.md`.

## 7. Zasoby graficzne
- Folder `Pliki/` jest przeznaczony na grafiki i zasoby używane w aplikacji.
