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
Po wejściu na adres z parametrem `?admin=1` zobaczysz sekcję **Stoły** (dodawanie i edycja rozgrywek), a pod nią **Panel administratora** z blokami: **Wiadomość do graczy** oraz **PIN do zakładki „Najbliższa gra”**. W prawym górnym rogu widoku admina znajduje się przycisk **Instrukcja**.

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

### 3.2 Stoły — dodawanie i nazewnictwo
1. W sekcji **Stoły** znajdziesz przycisk **Dodaj** po prawej stronie nagłówka.
2. Kliknij **Dodaj** — pojawi się nowa tabela o nazwie **„Gra 1”**.
3. Kliknij **Dodaj** ponownie — pojawi się **„Gra 2”** itd. Numeracja rośnie automatycznie.
4. Jeśli zmienisz nazwę domyślnej tabeli (np. „Gra 2”) na inną (np. „Turniej A”), numeracja „Gra X” uznaje, że numer 2 jest wolny.
5. Gdy dodasz kolejną tabelę po zmianie nazwy:
   - jeśli istnieje tylko „Gra 1”, nowa tabela dostanie nazwę **„Gra 2”**,
   - jeśli nie ma żadnej nazwy „Gra X”, numeracja wraca do **„Gra 1”**.
6. Aby usunąć tabelę, kliknij przycisk **Usuń** obok jej nazwy.
7. Tabele pojawiają się jedna pod drugą w kolejności utworzenia.

### 3.3 Stoły — edycja pól nad nazwą
1. Nad nazwą każdej tabeli są dwa pola edytowalne:
   - **„rodzaj gry”**,
   - **„data”**.
2. Kliknij w wybrane pole, wpisz własną wartość i po chwili zmiana zapisze się automatycznie.

### 3.4 Stoły — edycja nazwy
1. Kliknij w pole z nazwą stołu (np. „Gra 1”).
2. Wpisz własną nazwę (np. „Turniej A”).
3. Po chwili zmiana zapisze się automatycznie.

### 3.5 Stoły — dodawanie i usuwanie wierszy
1. Pod każdą tabelą znajduje się przycisk **Dodaj** (z lewej strony).
2. Kliknij **Dodaj**, aby dodać nowy wiersz do tabeli.
3. W każdym wierszu pojawią się pola do uzupełnienia:
   - nazwa gracza,
   - % z wszystkich gier,
   - % procent z rozegranych gier,
   - wypłaty,
   - suma rozegranych gier,
   - podsumowanie (+/-),
   - wpłaty,
   - ilość spotkań,
   - punkty,
   - suma rebuy.
4. Wpisuj wartości w pola — każda zmiana zapisuje się automatycznie.
5. Aby usunąć pojedynczy wiersz, kliknij **Usuń** po prawej stronie wiersza.

### 3.6 Podsumowanie
1. Pod listą stołów znajduje się tabela **Podsumowanie**.
2. Kolumna **Suma Gier** pokazuje liczbę aktualnie istniejących stołów.
3. Kolumna **Łączna pula** pokazuje sumę wartości z kolumn **„wpłaty”** ze wszystkich tabel.

### 3.7 Wiadomość do graczy
1. W sekcji **Wiadomość do graczy** kliknij pole **Treść wiadomości**.
2. Wpisz komunikat, który ma być widoczny w zakładce **Aktualności** po stronie użytkownika.
3. Kliknij przycisk **Wyślij**.
4. Po poprawnym wysłaniu:
   - w zakładce **Aktualności** u użytkowników pojawi się treść w polu **Najnowsze**.

### 3.8 Ustawianie PIN-u do zakładki „Najbliższa gra”
1. W sekcji **PIN do zakładki „Najbliższa gra”** kliknij pole **PIN (5 cyfr)**.
2. Wpisz dokładnie pięć cyfr (np. `12345`) — pole akceptuje wyłącznie cyfry.
3. Jeśli chcesz wygenerować losowy PIN:
   - Kliknij przycisk **Losuj PIN**.
4. Kliknij przycisk **Zapisz PIN**.
5. Pod polem pojawi się komunikat **„PIN zapisany.”** jeśli zapis się powiódł.

## 4. Widok użytkownika — zakładki „Najbliższa gra” i „Aktualności”

### 4.1 Zakładka „Aktualności”
1. W górnym pasku karty kliknij zakładkę **Aktualności** (jest domyślna po starcie).
2. Zobaczysz pole **Najnowsze** z ostatnią wiadomością od administratora.
3. Jeśli brak komunikatów, zobaczysz odpowiedni komunikat w polu.

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

