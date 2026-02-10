# Karty — instrukcja użytkownika

## 1. Uruchomienie
1. Otwórz plik `Main/index.html` w przeglądarce.
2. Jeśli chcesz wejść do panelu administratora, dopisz w pasku adresu `?admin=1` i odśwież stronę.
   - Przykład: `.../Main/index.html?admin=1`
3. Aplikacja **nie posiada już** importu danych z pliku `.xlsx` i nie konwertuje danych do `data.json`.
   - Wszystkie dane operacyjne (gracze, turnieje, wiadomości) są zapisywane i odczytywane bezpośrednio z Firebase Firestore.
   - Jeżeli szukasz przycisku importu lub sekcji „xlsx/json”, nie występują one w interfejsie.

## 2. Panel administratora (co i gdzie kliknąć)


### 2.0 Odświeżenie panelu widoku
1. Wejdź do trybu administratora (`?admin=1`).
2. Kliknij zakładkę, na której aktualnie pracujesz (**Aktualności**, **Gracze**, **Turnieje** lub **Gry**).
3. W prawym górnym rogu karty **Panel Administratora** kliknij przycisk **Odśwież**.
4. Zwróć uwagę, że aplikacja **nie przełącza zakładki** — pozostajesz na tym samym widoku.
5. Pod przyciskiem pojawi się status odświeżania:
   - `Odświeżanie danych...` podczas pobierania,
   - `Dane zostały odświeżone.` po sukcesie,
   - `Nie udało się odświeżyć danych.` w razie błędu połączenia.
6. Zakładka **Statystyki** nie ma jeszcze danych do pobierania — po kliknięciu odświeżania zobaczysz komunikat: `Ta zakładka nie ma danych do odświeżenia.`
7. Zakładka **Gry** przy odświeżeniu pobiera ponownie dane turniejów, a następnie aktualizuje listę lat i tabelę gier.

### 2.1 Zakładka „Aktualności”
1. Kliknij kartę **Aktualności** w górnej części panelu.
2. Kliknij pole **Treść wiadomości**.
3. Wpisz komunikat.
4. Kliknij przycisk **Wyślij**.
5. Sprawdź komunikat pod formularzem (status zapisu).

### 2.2 Zakładka „Gracze”

#### Dodanie nowego gracza
1. Kliknij zakładkę **Gracze**.
2. Kliknij przycisk **Dodaj** pod tabelą graczy.
3. W nowym wierszu:
   - kliknij pole w kolumnie **Nazwa** i wpisz nazwę gracza,
   - kliknij pole **PIN** i wpisz kod 5-cyfrowy **albo** kliknij przycisk **Losuj**.

#### Jak działa pole PIN
1. Pole PIN przyjmuje tylko cyfry.
2. PIN jest poprawny wyłącznie wtedy, gdy ma **dokładnie 5 cyfr**.
3. Jeżeli wpiszesz PIN, który już istnieje u innego gracza:
   - aplikacja wyświetli komunikat walidacji,
   - pole PIN zostanie wyczyszczone **w całości** (nie tylko ostatnia cyfra).
4. Nie da się zapisać aktywnego PIN-u krótszego niż 5 cyfr.

#### Przycisk „Losuj” przy każdym graczu
1. W wierszu danego gracza kliknij **Losuj** obok pola PIN.
2. Aplikacja losuje 5-cyfrowy PIN.
3. Jeśli wylosowany PIN jest zajęty, losowanie powtarza się automatycznie aż do uzyskania unikalnego kodu.
4. Wylosowany PIN jest od razu wpisany w pole i zapisany.

#### Edycja uprawnień gracza
1. W kolumnie **Uprawnienia** kliknij **Edytuj** przy wybranym graczu.
2. W oknie modalnym zaznacz lub odznacz dostępne uprawnienia (np. „Najbliższa gra”).
3. Kliknij **Zamknij**.
4. Po zapisaniu nazwy uprawnień widoczne w tabeli są oznaczone złotymi kapsułkami (spójnie ze stylem aktywnej zakładki).

#### Usuwanie gracza
1. W wierszu gracza kliknij przycisk **Usuń**.
2. Gracz jest od razu usuwany z listy i zapisywany.

### 2.3 Zakładka „Turnieje”

#### Dodanie turnieju
1. Kliknij zakładkę **Turnieje**.
2. Kliknij **Dodaj** w nagłówku sekcji.
3. Pojawi się nowa karta turnieju (np. `Gra 1`).

#### Edycja turnieju
1. Kliknij nazwę turnieju i wpisz własną nazwę.
2. Uzupełnij pola `rodzaj gry` i `data`.
3. W tabeli turnieju klikaj komórki i wpisuj dane zawodników.
4. Podczas wpisywania możesz pisać ciągiem bez ponownego klikania — po zapisach do Firestore fokus i pozycja kursora są automatycznie utrzymywane w aktualnie edytowanym polu.
5. Jeśli zatrzymasz pisanie na chwilę i dane się zsynchronizują, pole nadal pozostanie aktywne, więc możesz kontynuować od razu.

#### Dodawanie i usuwanie wierszy
1. Kliknij **Dodaj** pod tabelą danego turnieju, aby dodać zawodnika.
2. Kliknij **Usuń** w wierszu zawodnika, aby usunąć tylko ten wiersz.
3. Kliknij czerwony **Usuń** przy nagłówku turnieju, aby usunąć cały turniej.


### 2.4 Zakładka „Gry”

#### Panel lat (lewa strona)
1. Kliknij zakładkę **Gry**.
2. W lewej kolumnie zobaczysz listę lat ułożoną malejąco (najnowszy rok na górze).
3. Domyślnie lista startuje od lat `2026` i `2025`, a potem automatycznie rozszerza się o lata wykryte z dat turniejów.

#### Dodawanie roku
1. W zakładce **Gry** kliknij przycisk **Dodaj rok**.
2. W oknie dialogowym wpisz rok w formacie `RRRR` (np. `2027`).
3. Kliknij **OK**.
4. Rok pojawi się na liście po lewej, a lista pozostanie posortowana chronologicznie (malejąco).

#### Usuwanie roku
1. Kliknij wybrany rok na liście po lewej, aby go zaznaczyć.
2. Kliknij przycisk **Usuń rok**.
3. Rok znika z listy, a aplikacja automatycznie zaznacza kolejny dostępny rok.

#### Tabela „Tabele Gier”
1. Kliknij rok po lewej stronie.
2. W sekcji **Tabele Gier** (górna tabela po prawej stronie) zobaczysz wszystkie turnieje, których pole `data` (uzupełniane w zakładce **Turnieje**) zawiera wybrany rok.
3. Wiersz pokazuje trzy informacje: **Rodzaj gry**, **Data**, **Nazwa**.
4. Kliknij nazwę gry w kolumnie **Nazwa**.
5. Otworzy się dodatkowe okno (modal).
6. W modalu zobaczysz wszystkie dane graczy z tej gry (te same kolumny, które są w tabeli turnieju, np. `nazwa gracza`, `% z wszystkich gier`, `% procent z rozegranych gier`, `wypłaty`, itd.).
7. Zamknij okno przez przycisk **Zamknij**, ikonę `×` lub kliknięcie tła modala.

#### Tabela „Statystyki”
1. Sekcja **Statystyki** znajduje się pod tabelą **Tabele Gier** (na dole prawej kolumny).
2. W sekcji **Statystyki** widoczna jest obecnie jedna pozycja: **W budowie**.

### 2.5 Zakładka „Statystyki”
1. Kliknij zakładkę **Statystyki**.
2. Widoczny jest placeholder „do zrobienia później”.

## 3. Widok gracza

### 3.1 Aktualności
1. W sekcji „Strefa gracza” kliknij zakładkę **Aktualności**.
2. Odczytaj najnowszy komunikat od administratora.

### 3.2 Najbliższa gra (dostęp po PIN)
1. Kliknij zakładkę **Najbliższa gra**.
2. Zawsze najpierw zobaczysz kartę z prośbą o PIN (dotyczy zarówno zwykłego widoku użytkownika, jak i sekcji **Strefa gracza** podczas pracy administratora).
3. Kliknij pole **PIN (5 cyfr)** i wpisz dokładnie 5 cyfr.
4. Kliknij **Otwórz**.
5. Jeżeli PIN jest poprawny i przypisany do gracza z uprawnieniem **Najbliższa gra**, karta PIN zniknie i pokaże się zawartość zakładki.
6. Jeżeli PIN jest błędny albo gracz nie ma uprawnienia, zobaczysz komunikat o braku dostępu i pozostaniesz na ekranie PIN.
7. Po ponownym wejściu w zakładkę **Najbliższa gra** aplikacja ponownie wymaga wpisania PIN (sesja dostępu jest resetowana przy przełączaniu zakładki).

## 4. Przycisk „Instrukcja”
1. W panelu administratora kliknij **Instrukcja**.
2. Otworzy się okno modalne.
3. Treść instrukcji pobiera się automatycznie po otwarciu okna (bez dodatkowego klikania).
4. Gdy pobieranie się powiedzie, pod nagłówkiem pojawi się komunikat: `Instrukcja została pobrana.`
5. Jeśli pojawi się błąd, zamknij i otwórz okno ponownie, aby ponowić pobranie.
6. Zamknij modal przyciskiem **Zamknij**, ikoną `×` lub kliknięciem tła.
