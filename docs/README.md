# Karty - instrukcje użytkownika

## 1. Uruchomienie w przeglądarce (komputer)
1. Otwórz plik `Main/index.html` w przeglądarce (aplikacja działa jako statyczny front-end).
2. Zobaczysz widok uczestnika z nagłówkiem **„Strefa uczestnika”**, zakładkami **Najbliższa gra** i **Aktualności** oraz formularzem do wpisania PIN-u.
3. Aby przełączyć się do trybu administratora:
   - Kliknij czerwony przycisk **„Przełącz widok”** ustawiony obok etykiety **„Strefa uczestnika”** w górnym pasku karty użytkownika.
   - Alternatywnie dopisz do adresu parametr `?admin=1` (np. `Main/index.html?admin=1`).
4. Po przełączeniu zmieni się etykieta w karcie **Widok** (z „Użytkownik” na „Administrator”).

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

### 3.1.1 Przełączanie widoku (przycisk „Przełącz widok”)
1. W górnej części strony znajdź kartę **Widok**.
2. Obok napisu **„Administrator”** kliknij czerwony przycisk **„Przełącz widok”**.
3. Widok zostanie przełączony na wariant użytkownika, a etykieta w karcie **Widok** zmieni się na „Użytkownik”.

### 3.2 Dodawanie gracza (przycisk „Dodaj gracza”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Dodaj gracza**.
3. Przycisk jest przygotowany pod przyszłą funkcję formularza (dodanie gracza do listy w czasie rzeczywistym).

### 3.3 Zmiana stawki wpisowego (przycisk „Ustaw stawkę wejściowego”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Ustaw stawkę wejściowego**.
3. To miejsce na przyszłą zmianę wpisowego — obecnie przycisk pełni funkcję informacyjną.

### 3.4 Aktualizacja danych z pliku Turniej.xlsx (przycisk „Aktualizuj dane”)
1. Wejdź do **Panelu administratora**.
2. Upewnij się, że plik `Turniej.xlsx` znajduje się w folderze `Main` (obok `index.html`).
3. Kliknij przycisk **Aktualizuj dane**.
4. Przy przycisku zobaczysz przypomnienie o wymaganej lokalizacji pliku — jest to docelowe miejsce, z którego dane będą konwertowane do `data.json`.
5. Aktualnie przycisk jest przygotowany pod przyszłą logikę importu danych (po podpięciu skryptu generującego `data.json` z pliku XLSX).

### 3.5 Zakończenie rundy (przycisk „Zakończ rundę”)
1. Wejdź do **Panelu administratora**.
2. Kliknij przycisk **Zakończ rundę**.
3. Przygotowany do późniejszego podpięcia logiki zamykania rundy (np. zapis do bazy i reset list).

### 3.6 Instrukcja obsługi (przycisk „Instrukcja”)
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

### 3.7 Wiadomości do aplikacji Android
1. W panelu admina przewiń do sekcji **Wiadomość do aplikacji Android**.
2. Wpisz treść w polu **Treść wiadomości**.
3. Kliknij **Wyślij**.
4. Jeśli Firebase nie jest skonfigurowany, zobaczysz komunikat o konieczności konfiguracji.

### 3.8 Ustawianie PIN-u do zakładki „Najbliższa gra”
1. W panelu administratora odszukaj sekcję **PIN do zakładki „Najbliższa gra”**.
2. W polu **PIN (5 cyfr)** wpisz dokładnie pięć cyfr (np. `12345`).
3. Kliknij przycisk **Zapisz PIN**.
4. Pod polem pojawi się komunikat **„PIN zapisany.”** jeśli zapis się powiódł.
5. Jeśli konfiguracja Firebase jest pusta, przycisk będzie wyszarzony, a obok zobaczysz informację o konieczności konfiguracji.

## 4. Widok uczestnika — zakładka „Najbliższa gra”
1. W górnym pasku karty widzisz etykietę **„Strefa uczestnika”** i czerwony przycisk **„Przełącz widok”**.
2. Kliknij zakładkę **Najbliższa gra** (jest aktywna domyślnie).
3. Zobaczysz formularz z polem **PIN (5 cyfr)**.
4. Wpisz PIN przekazany przez administratora i kliknij **Otwórz**.
5. Po poprawnym PIN-ie pojawią się:
   - sekcja **Informacje główne** (data, lokalizacja, wpisowe),
   - **Plan wieczoru** (godziny i etapy),
   - **Stoły i limity**,
   - **Potwierdzeni gracze**.
6. Jeśli wpiszesz błędny PIN, pod polem pojawi się komunikat o błędzie.
7. Zakładka **Aktualności** pokazuje ostatnie komunikaty od organizatorów.

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

## 8. Dokument analizy PIN (dla zespołu)
1. W głównym folderze projektu znajduje się plik `PIN.md`.
2. Plik zawiera analizę oraz plan wdrożenia zakładki **„Najbliższa gra”** z zabezpieczeniem PIN.
3. Jest to dokument projektowy (nie wpływa na bieżące działanie aplikacji), przydatny dla osób wdrażających kolejne funkcje.
