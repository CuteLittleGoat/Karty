# Karty - instrukcje użytkownika

## 1. Uruchomienie w przeglądarce (komputer)
1. Otwórz plik `Main/index.html` w przeglądarce (aplikacja działa jako statyczny front-end).
2. Zobaczysz widok użytkownika z nagłówkiem **„Strefa gracza”** oraz zakładkami **Najbliższa gra** i **Aktualności** (domyślnie aktywna jest zakładka **Aktualności**).
3. Aby wejść do widoku administratora, dopisz do adresu parametr `?admin=1` (np. `Main/index.html?admin=1`).
4. Aby wrócić do widoku użytkownika, usuń parametr `?admin=1` z adresu i odśwież stronę.

## 2. Uruchomienie w Android (WebView)
1. Otwórz w Android Studio katalog `MigracjaAndroid/AndroidApp`.
2. Poczekaj na pełną synchronizację Gradle.
3. Uruchom aplikację przyciskiem **Run ▶** na emulatorze lub urządzeniu.
4. Aplikacja automatycznie otworzy wersję web pod adresem: `https://cutelittlegoat.github.io/Karty/Main/index.html`.
5. W WebView widok admina jest blokowany — aplikacja mobilna zawsze pokazuje wariant użytkownika.
6. Jeśli podczas builda zobaczysz błąd `@mipmap/ic_launcher`, upewnij się że:
   - plik ikony istnieje w `app/src/main/res/drawable/ic_launcher.xml`,
   - w `AndroidManifest.xml` atrybut `android:icon` wskazuje `@drawable/ic_launcher`,
   - po zmianach wykonasz **Build > Clean Project** oraz ponownie **Run ▶**.

## 3. Widok administratora — szczegółowe kroki
Po wejściu na adres z parametrem `?admin=1` zobaczysz sekcję **Panel administratora** z dwoma blokami: **Wiadomość do graczy** oraz **PIN do zakładki „Najbliższa gra”**. W prawym górnym rogu widoku admina znajduje się przycisk **Instrukcja**.

### 3.1 Instrukcja obsługi (przycisk „Instrukcja” w prawym górnym rogu)
1. W prawym górnym rogu widoku admina kliknij przycisk **Instrukcja**.
2. Otworzy się okno modalne z treścią instrukcji pobieraną z adresu:
   `https://cutelittlegoat.github.io/Karty/docs/README.md`.
3. Aby pobrać najnowszą wersję instrukcji:
   - Kliknij **Odśwież** w stopce modala.
4. Aby zamknąć okno:
   - Kliknij **Zamknij** (w stopce) lub **×** w prawym górnym rogu,
   - albo kliknij tło modala,
   - albo wciśnij klawisz **Esc**.

### 3.2 Wiadomość do graczy
1. W sekcji **Wiadomość do graczy** kliknij pole **Treść wiadomości**.
2. Wpisz komunikat, który ma być widoczny w zakładce **Aktualności** po stronie użytkownika.
3. Kliknij przycisk **Wyślij**.
4. Po poprawnym wysłaniu:
   - w zakładce **Aktualności** u użytkowników pojawi się treść w polu **Najnowsze**,
   - aplikacja Android wyświetli powiadomienie PUSH (lokalne).
5. Jeśli Firebase nie jest skonfigurowany, obok przycisku pojawi się informacja o konieczności konfiguracji.

### 3.3 Ustawianie PIN-u do zakładki „Najbliższa gra”
1. W sekcji **PIN do zakładki „Najbliższa gra”** kliknij pole **PIN (5 cyfr)**.
2. Wpisz dokładnie pięć cyfr (np. `12345`) — pole akceptuje wyłącznie cyfry.
3. Jeśli chcesz wygenerować losowy PIN:
   - Kliknij przycisk **Losuj PIN**.
4. Kliknij przycisk **Zapisz PIN**.
5. Pod polem pojawi się komunikat **„PIN zapisany.”** jeśli zapis się powiódł.
6. Jeśli konfiguracja Firebase jest pusta, przycisk zapisu będzie wyszarzony, a obok pojawi się informacja o konieczności konfiguracji.

## 4. Widok użytkownika — zakładki „Najbliższa gra” i „Aktualności”

### 4.1 Zakładka „Aktualności”
1. W górnym pasku karty kliknij zakładkę **Aktualności** (jest domyślna po starcie).
2. Zobaczysz pole **Najnowsze** z ostatnią wiadomością od administratora.
3. Jeśli Firebase nie jest skonfigurowany lub brak komunikatów, zobaczysz odpowiedni komunikat w polu.

### 4.2 Zakładka „Najbliższa gra”
1. Kliknij zakładkę **Najbliższa gra**.
2. Wpisz PIN (5 cyfr) przekazany przez administratora.
3. Kliknij **Otwórz**.
4. Po poprawnym PIN-ie pojawi się ekran z napisem **„Strona w budowie”**.
5. Jeśli wpiszesz błędny PIN, pod polem pojawi się komunikat o błędzie.

## 5. Responsywność i urządzenia mobilne
- Aplikacja automatycznie dostosowuje układ do mniejszych ekranów.
- Na telefonach przyciski w sekcji wiadomości układają się w kolumnie.
- Okno instrukcji ma własny przewijalny obszar treści, co ułatwia czytanie na mobile.

## 6. Konfiguracja Firebase
1. Uzupełnij dane w pliku `config/firebase-config.js`.
2. Skonfiguruj Firestore tak, aby web i Android mogły czytać/zapisywać kolekcję `admin_messages` oraz dokument `app_settings/next_game`.
3. Dodaj kolekcję `players` (przygotowanie do edytowalnych tabel graczy):
   - W panelu Firebase przejdź do **Firestore Database**.
   - Kliknij **Start collection** i wpisz nazwę `players`.
   - W pierwszym dokumencie kliknij **Add field** i dodaj pola:
     - `Name` (string) – nazwa gracza,
     - `Cash` (number lub string) – aktualny stan gotówki,
     - `GamesPlayed` (number lub string) – liczba rozegranych gier,
     - `GamesWon` (number lub string) – liczba wygranych gier,
     - `MoneySpend` (number lub string) – suma wydatków,
     - `MoneyWon` (number lub string) – suma wygranych.
4. Dodaj kolekcję `Tables` (przygotowanie do edytowalnych tabel stołów):
   - Kliknij **Start collection** i wpisz nazwę `Tables`.
   - W pierwszym dokumencie kliknij **Add field** i dodaj pola:
     - `TableNumber` (number lub string) – numer stołu,
     - `Date` (string) – data rozgrywki,
     - `PlayersInvited` (string) – lista zaproszonych graczy (format do ustalenia później),
     - `Stakes` (number lub string) – stawka,
     - `Winner` (string) – zwycięzca.
5. Szczegółowa instrukcja krok po kroku znajduje się w pliku `Firebase.md`.

## 7. Zasoby graficzne
- Folder `Pliki/` jest przeznaczony na grafiki i zasoby używane w aplikacji.

## 8. Dokument analizy PIN (dla zespołu)
1. W głównym folderze projektu znajduje się plik `PIN.md`.
2. Plik zawiera analizę oraz plan wdrożenia zakładki **„Najbliższa gra”** z zabezpieczeniem PIN.
3. Jest to dokument projektowy (nie wpływa na bieżące działanie aplikacji), przydatny dla osób wdrażających kolejne funkcje.
