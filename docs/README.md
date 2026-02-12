# Karty — instrukcja użytkownika (administrator + gracz)

## 1. Uruchomienie aplikacji
1. Otwórz `Main/index.html` w przeglądarce.
2. Aby wejść do panelu administratora, dopisz `?admin=1` do adresu, np. `.../Main/index.html?admin=1`.
3. Bez `?admin=1` widoczna jest tylko strefa użytkownika.

---

## 2. Panel Administratora — szybki opis zakładek
W panelu są zakładki:
- **Aktualności**
- **Regulamin**
- **Gracze**
- **Turnieje**
- **Gry admina**
- **Gry użytkowników**

Zakładka **Statystyki** (osobna karta) została usunięta — statystyki są teraz częścią zakładki **Gry admina**.

---

## 3. Zakładka „Gracze” — co i gdzie kliknąć
### 3.1 Dodanie gracza
1. Kliknij zakładkę **Gracze**.
2. Kliknij przycisk **Dodaj** pod tabelą.
3. W nowym wierszu najpierw znajdź kolumnę **Aplikacja** (pierwsza z lewej) i ustaw checkbox:
   - zaznaczony = gracz ma oznaczenie aktywne w aplikacji,
   - odznaczony = gracz ma oznaczenie nieaktywne.
4. Kliknij pole **Nazwa** i wpisz imię/nick.
5. Kliknij pole **PIN** i wpisz 5 cyfr albo kliknij **Losuj**.
6. Poczekaj chwilę na automatyczny zapis (status pod nagłówkiem może pokazać informację o zapisie).

### 3.2 Usunięcie gracza
1. W wierszu gracza kliknij **Usuń**.
2. Wpis gracza znika z listy.

> Ważne dla zakładki Gry: jeśli gracz był już użyty w „Szczegółach gry”, jego nazwa pozostaje historycznie we wpisie, ale po usunięciu z zakładki Gracze nie będzie dostępna do nowego wyboru z listy.

---


### 3.3 Kolumna „Aplikacja” — dokładna obsługa checkboxa
1. Wejdź do zakładki **Gracze** w panelu administratora.
2. W tabeli znajdź pierwszą kolumnę z lewej o nazwie **Aplikacja**.
3. W wybranym wierszu kliknij checkbox:
   - kliknięcie zaznacza pole,
   - kolejne kliknięcie odznacza pole.
4. Po zmianie nic więcej nie trzeba zatwierdzać — stan zapisuje się automatycznie w bazie Firestore.
5. Sprawdzenie trwałości ustawienia:
   - odśwież kartę przeglądarki (`Ctrl+R`),
   - zamknij przeglądarkę i uruchom ją ponownie,
   - wróć do `.../Main/index.html?admin=1` → **Gracze**.
6. Oczekiwany efekt: checkbox dla każdego gracza zachowuje ostatni zapisany stan (zaznaczony/odznaczony).

> Uwaga: zmiana checkboxa w kolumnie **Aplikacja** nie modyfikuje PIN-u, nazwy, uprawnień ani żadnych obliczeń w pozostałych zakładkach.

---

### 3.4 Stabilność kursora podczas wpisywania (ważne)
1. Wejdź do **Gracze**.
2. Kliknij pole **Nazwa** albo **PIN** dowolnego gracza.
3. Wpisuj tekst/cyfry ciągiem (bez dodatkowego klikania po każdej literze).
4. Oczekiwany efekt po poprawce: aktywne pole pozostaje zaznaczone (zachowuje fokus), a kursor zostaje w tym samym miejscu nawet wtedy, gdy dane właśnie synchronizują się z bazą Firestore.

Działa to także, gdy równolegle zapisuje się inny wiersz i tabela jest odświeżana.

---

## 4. Zakładka „Gry” — pełna instrukcja krok po kroku
Zakładka ma teraz 3 obszary:
1. **Lewa kolumna „Lata”**.
2. **Górny segment „Tabele Gier”**.
3. **Dolny segment „Statystyki”**.

Dodatkowo pod tabelą gier pojawiają się sekcje **„Podsumowanie gry [nazwa]”** dla każdej gry z wybranego roku.

### 4.1 Lewy panel „Lata” (działa automatycznie)
W tej wersji **nie ma już przycisków „Dodaj rok” i „Usuń rok”**.

Rok pojawia się automatycznie, gdy w tabeli gier istnieje wpis z datą z tego roku.
- jeśli dodasz grę z datą `2026-02-11`, po lewej pojawi się przycisk `2026`,
- jeśli później dodasz grę z datą `2027-10-10`, pojawi się także przycisk `2027`.

Usuwanie roku też jest automatyczne: gdy skasujesz ostatnią grę z danego roku, przycisk tego roku znika z panelu.

Aplikacja zapamiętuje ostatnio kliknięty rok (po odświeżeniu strony nadal będzie aktywny ten sam rok, jeśli nadal istnieje w danych).

### 4.2 Segment „Tabele Gier” (góra)
#### Dodanie nowej gry
1. Kliknij przycisk **Dodaj** w nagłówku „Tabele Gier”.
2. System natychmiast tworzy nowy wpis z datą **dzisiejszą** (`rrrr-MM-dd`, zgodnie z zegarem urządzenia).
3. Aplikacja tworzy nowy wiersz z domyślnymi wartościami:
   - **Rodzaj Gry**: `Cashout`.
   - **Data**: bieżąca data (`rrrr-MM-dd`).
   - **Nazwa**: `Gra X`, gdzie `X` to pierwszy wolny numer dla tej konkretnej daty (np. gdy istnieją `Gra 1` i `Gra 3`, nowa nazwa to `Gra 2`).
4. Po poprawnym zapisie zobaczysz komunikat statusu „Dodano grę ...”. Jeśli zapis się nie uda (np. brak uprawnień Firestore), pojawi się precyzyjny komunikat błędu.

#### Edycja wiersza gry
1. W kolumnie **Rodzaj Gry** wybierz z listy `Cashout` lub `Turniej`.
2. W kolumnie **Data** kliknij pole daty i wybierz dzień.
3. W kolumnie **Nazwa** wpisz własną nazwę gry.
4. Kliknij **Szczegóły**, aby otworzyć okno szczegółów tej gry.
5. Kliknij **Usuń** (po prawej), aby skasować cały wiersz gry.

### 4.3 Okno „Szczegóły gry”
Po kliknięciu **Szczegóły** otwiera się modal z edytowalną tabelą.
Zamykanie tego okna odbywa się wyłącznie ikoną **X** w prawym górnym rogu (przycisk „Zamknij” nie występuje).

#### Dodanie gracza do szczegółów
1. Kliknij **Szczegóły** przy wybranej grze.
2. W oknie kliknij **Dodaj** (pod tabelą).
3. W nowym wierszu uzupełnij kolumny:
   - **Gracz**: wybór z listy graczy z zakładki „Gracze”.
   - **Wpisowe**: tylko cyfry (dozwolony minus na początku).
   - **Rebuy/Add-on**: tylko cyfry (dozwolony minus na początku).
   - **Wypłata**: tylko cyfry (dozwolony minus na początku).
   - **+/-**: pole liczone automatycznie (`Wypłata - (Wpisowe + Rebuy/Add-on)`).
   - **Punkty**: tylko cyfry (dozwolony minus na początku).
   - **Mistrzostwo**: checkbox.
4. Aby usunąć wiersz gracza ze szczegółów, kliknij **Usuń** w tym wierszu.

#### Zachowanie usuniętych graczy
- Jeśli administrator usunie gracza w zakładce „Gracze”, nazwa we wcześniej zapisanych szczegółach nie jest kasowana.
- Taki gracz nie jest dostępny na liście rozwijanej do nowego wyboru.

### 4.4 Segment „Podsumowanie gry [nazwa]”
Pod każdą grą renderuje się osobny segment podsumowania.

W segmencie:
1. Linia **Pula** = suma wszystkich wartości `Wpisowe + Rebuy/Add-on` ze szczegółów danej gry.
2. Tabela z kolumnami:
   - Gracz
   - Wpisowe
   - Rebuy/Add-on
   - Wypłata
   - +/-
   - % puli
   - Punkty
   - Mistrzostwo
3. Kolumna **% puli** liczona jest jako `round((Wypłata / Pula) * 100)`.
4. Sortowanie wierszy: malejąco po **% puli**.

### 4.5 Segment „Statystyki” (dół)
Sekcja pokazuje zbiorcze wartości dla aktywnego roku, m.in.:
- liczba gier,
- łączna pula.

### 4.6 Najważniejsza zmiana architektury
Zakładka **Gry** działa niezależnie od zakładki **Turnieje**:
- dane i lista lat są liczone wyłącznie z dat wpisanych w zakładce **Gry**,
- lata nie są już dodawane ręcznie — panel lat jest generowany automatycznie z kolekcji gier,
- zakładka Gry nie pobiera danych z Turniejów.

---

### 4.7 Stabilność wpisywania w zakładce „Gry” i w „Szczegółach gry”
Po tej poprawce nie trzeba już ponownie klikać w pole po każdej synchronizacji danych:

1. W tabeli gier kliknij **Nazwa** i wpisuj długi tekst.
2. Bez klikania przejdź strzałkami w tekście i dopisuj kolejne znaki.
3. Zmień w tym samym wierszu **Data** lub **Rodzaj Gry**.
4. Kliknij **Szczegóły** i w modalu wpisuj wartości w kolumnach: **Wpisowe**, **Rebuy/Add-on**, **Wypłata**, **Punkty**.
5. Oczekiwany efekt: fokus i pozycja kursora są automatycznie przywracane po każdym przebudowaniu widoku, więc piszesz ciągiem bez zrywania podświetlenia pola.

Mechanizm działa dla pól tekstowych, pól liczbowych wpisywanych jako tekst, selectów i checkboxa „Mistrzostwo” w szczegółach gry.

---

## 5. Aktualności
1. Wejdź w zakładkę **Aktualności**.
2. Wpisz wiadomość.
3. Kliknij **Wyślij**.

---


## 5A. Zakładka „Regulamin”
### 5A.1 Widok administratora (edycja ręczna + przycisk „Zapisz”)
1. Otwórz aplikację z parametrem `?admin=1`.
2. W panelu administratora kliknij zakładkę **Regulamin** (pomiędzy „Aktualności” i „Gracze”).
3. Zobaczysz pole **Treść regulaminu** oraz przycisk **Zapisz**.
4. Aby wprowadzić nową treść:
   - kliknij bezpośrednio w pole tekstowe,
   - wpisz pełny tekst zasad (możesz użyć wielu akapitów),
   - po zakończeniu edycji kliknij przycisk **Zapisz** pod polem.
5. Oczekiwany efekt:
   - status pokaże „Zapisywanie regulaminu...”, a po odświeżeniu danych „Regulamin jest aktualny.”,
   - treść zostaje zapisana w Firestore dopiero po kliknięciu **Zapisz**,
   - wpisywanie nie powoduje już automatycznego zapisu ani cofania kursora.
6. Aby wyczyścić regulamin:
   - usuń zawartość pola tekstowego,
   - kliknij **Zapisz** (pusta treść zostanie zapisana).

### 5A.2 Widok użytkownika (tylko odczyt, bez PIN)
1. Otwórz aplikację bez `?admin=1`.
2. W sekcji „Strefa gracza” kliknij zakładkę **Regulamin**.
3. Treść regulaminu jest wyświetlana w polu tylko do odczytu.
4. Ta zakładka jest dostępna zawsze:
   - nie wymaga wpisania PIN,
   - nie zależy od uprawnień konfigurowanych w zakładce „Gracze”.

## 6. Strefa gracza
1. Otwórz stronę bez `?admin=1`.
2. W zakładce „Najbliższa gra” wpisz PIN i kliknij **Otwórz**.
3. W zakładce „Aktualności” odczytasz najnowszą wiadomość administratora.
4. W zakładce „Regulamin” odczytasz aktualne zasady zapisane przez administratora (bez opcji edycji).

## 7. Firebase — konfiguracja konieczna, żeby działały przyciski „Dodaj” i „Usuń” w zakładce Gry
1. Otwórz plik `config/firebase-config.js`.
2. Upewnij się, że ustawienia mają dokładnie takie wartości (z wielkością liter):
   - `gamesCollection: "Tables"`
   - `gameDetailsCollection: "rows"`
3. Wejdź do Firebase Console → Firestore Database → Rules i sprawdź, że masz blok:
   - `match /Tables/{tableId} { allow read, write: if true; ... }`
   - oraz zagnieżdżony blok: `match /rows/{rowId} { allow read, write: if true; }`
4. Kliknij **Publish** w regułach (jeśli cokolwiek zmieniasz).
5. Wróć do aplikacji i odśwież stronę (`Ctrl+R`).
6. Wejdź w `?admin=1` → zakładka **Gry** i sprawdź po kolei:
   - kliknij **Dodaj** w tabeli gier,
   - kliknij **Szczegóły** dla dowolnej gry i kliknij **Dodaj** w modalu,
   - kliknij **Usuń** dla wiersza szczegółów,
   - kliknij **Usuń** dla całej gry.
7. Oczekiwany efekt: wszystkie operacje zapisu/usuwania wykonują się bez błędu uprawnień.

### Dlaczego to naprawia błąd
- Pierwszy błąd dotyczył zapisu do kolekcji `Games`, której nie obejmowały reguły.
- Drugi błąd dotyczył zapisu/usuwania w subkolekcji `details`, podczas gdy reguły dopuszczały subkolekcję `rows`.
- Aplikacja została ustawiona tak, aby zakładka **Gry** używała `Tables` + `rows` (konfigurowalne przez `gamesCollection` i `gameDetailsCollection`).


## 8. Czat — szczegółowa instrukcja obsługi (wdrożenie bez TTL Policy)

### 8.1 Nadanie uprawnienia „Czat” dla gracza (admin)
1. Otwórz aplikację w trybie administratora (`?admin=1`).
2. Kliknij zakładkę **Gracze**.
3. W wybranym wierszu kliknij przycisk **Uprawnienia**.
4. W oknie „Uprawnienia gracza” zaznacz checkbox **Czat**.
5. Kliknij ikonę **X** w prawym górnym rogu okna.
6. Poczekaj na zapis (status pod tabelą).
7. Oczekiwany efekt: w kolumnie uprawnień gracza pojawia się znacznik **Czat**.

### 8.2 Wejście gracza do czatu (PIN + uprawnienie)
1. Otwórz aplikację bez `?admin=1`.
2. W panelu „Strefa gracza” kliknij zakładkę **Czat**.
3. W polu PIN wpisz dokładnie 5 cyfr przypisanych do gracza.
4. Kliknij **Otwórz**.
5. Oczekiwane komunikaty:
   - sukces: „PIN poprawny. Witaj ...” i otwarcie listy wiadomości,
   - błąd: „Błędny PIN lub brak uprawnień do zakładki „Czat”.”.

### 8.3 Wysyłka wiadomości przez gracza
1. Wejdź do zakładki **Czat** i przejdź bramkę PIN.
2. W sekcji „Twoja wiadomość” kliknij pole tekstowe.
3. Wpisz treść wiadomości (do 600 znaków).
4. Kliknij **Wyślij**.
5. Oczekiwany efekt:
   - status „Wysyłanie...”, następnie „Wiadomość wysłana.”,
   - wiadomość od razu pojawia się na liście wszystkim użytkownikom czatu (real-time).

### 8.4 Moderacja czatu w panelu administratora
1. Otwórz aplikację z `?admin=1`.
2. Kliknij zakładkę **Czat** w panelu administratora.
3. W liście widzisz autora, datę i treść wiadomości.
4. Aby skasować pojedynczą wiadomość, kliknij **Usuń** przy tej wiadomości.
5. Oczekiwany efekt: wpis natychmiast znika z listy (u admina i graczy).

### 8.5 Usuwanie wiadomości starszych niż 30 dni (manual, bez TTL Policy)
1. Otwórz `?admin=1` → zakładka **Czat**.
2. Kliknij przycisk **Usuń starsze niż 30 dni**.
3. Poczekaj na zakończenie operacji (aplikacja usuwa rekordy partiami).
4. Odczytaj status pod przyciskiem, np. „Usunięto 12 wiadomości starszych niż 30 dni.”.
5. Oczekiwany efekt: w bazie nie pozostają rekordy z `expireAt <= teraz`.

### 8.6 Co sprawdzić po wdrożeniu czatu
1. Gracz bez uprawnienia `chatTab` nie wejdzie na czat mimo poprawnego PIN.
2. Gracz z `chatTab` widzi wiadomości i może wysyłać nowe.
3. Administrator usuwa pojedyncze wiadomości.
4. Administrator uruchamia masowe czyszczenie starszych wpisów.

## 9. Firebase — aktualna struktura bazy i aktualne Rules

### 9.1 Struktura Firestore (kolekcje i dokumenty)
Aktualnie wykorzystywane są kolekcje:
1. `admin_messages`
   - dokumenty komunikatów admina,
   - pola: `message`, `createdAt`, `source`.
2. `app_settings`
   - dokument `next_game` z polem `pin`,
   - dokument `player_access` z tablicą `players[]` (obiekty m.in. `id`, `name`, `pin`, `permissions`, `appEnabled`),
   - dokument `rules` z treścią regulaminu (`text`, `updatedAt`, `source`).
3. `Tables`
   - dokumenty gier/turniejów (m.in. `gameType`, `gameDate`, `name`, `createdAt`),
   - subkolekcja `rows` z wierszami szczegółów,
   - subkolekcja `confirmations` ze stanem potwierdzeń graczy (`confirmed`, `updatedAt`, `updatedBy`, `playerName`, `playerId`).
4. `Collection1`
   - kolekcja historyczna pozostawiona w projekcie.
5. `chat_messages`
   - dokumenty czatu,
   - pola: `text`, `authorName`, `authorId`, `createdAt`, `expireAt`, `source`.
6. `players`
   - dokument techniczny/historyczny `players` z polami zbiorczymi (`Cash`, `GamesPlayed`, `GamesWon`, itp.).

### 9.2 Aktualne Firestore Rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }

      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }
  }
}
```

---

## 9. Nowa funkcja: „Gry do potwierdzenia” + checkbox „CzyZamknięta”

### 9.1 Administrator — „Tabele Gier”
1. Otwórz `.../Main/index.html?admin=1`.
2. Wejdź w zakładkę **Gry**.
3. W tabeli **Tabele Gier** zobaczysz nową kolumnę **CzyZamknięta**.
4. W każdej grze kliknij checkbox:
   - **odznaczony** = gra aktywna do potwierdzania,
   - **zaznaczony** = gra zamknięta (znika z obu widoków „Gry do potwierdzenia”).
5. Checkbox można przełączać dowolną liczbę razy.

### 9.2 Administrator — zakładka „Gry do potwierdzenia”
1. W panelu admina kliknij zakładkę **Gry do potwierdzenia**.
2. Zobaczysz listę tylko aktywnych gier (`CzyZamknięta` odznaczone).
3. Pod każdą grą widoczna jest tabela graczy zapisanych w **Szczegóły** tej gry (kolumna „Gracz”).
4. W kolumnie **Status**:
   - `Potwierdzono` = obecność zatwierdzona,
   - `Niepotwierdzono` = brak potwierdzenia.
5. W kolumnie **Akcje** kliknij:
   - **Potwierdź** — ustawia status na potwierdzony,
   - **Anuluj** — cofa potwierdzenie.
6. Wiersz z potwierdzoną obecnością jest podświetlany na złoto.
7. Aby zobaczyć najnowsze dane po zmianach gracza, kliknij globalny przycisk **Odśwież** (na górze panelu admina).

### 9.3 Użytkownik — zakładka „Gry do potwierdzenia”
1. Otwórz aplikację bez `?admin=1`.
2. Kliknij zakładkę **Gry do potwierdzenia**.
3. Wpisz 5-cyfrowy PIN gracza, który ma uprawnienie **Gry do potwierdzenia**.
4. Kliknij **Otwórz**.
5. Zobaczysz tylko gry spełniające warunki:
   - gracz występuje w **Szczegóły gry** (kolumna „Gracz”),
   - gra ma odznaczone **CzyZamknięta**.
6. W tabeli widoczne są kolumny:
   - **Rodzaj Gry**,
   - **Data**,
   - **Nazwa**,
   - **Potwierdzenie** (akcje).
7. W kolumnie **Potwierdzenie**:
   - kliknij **Potwierdź** → wiersz robi się złoty,
   - kliknij **Anuluj** → wiersz wraca do normalnego wyglądu.
8. Możesz wielokrotnie przełączać stan **Potwierdź/Anuluj**.
9. Kliknij **Odśwież**, aby pobrać aktualny stan z Firestore „na twardo” (z serwera).

### 9.4 Sortowanie po dacie (najwcześniejsza na górze)
Sortowanie rosnące po dacie (`gameDate`) działa teraz w:
- **Tabele Gier** (admin),
- **Gry do potwierdzenia** (admin),
- **Gry do potwierdzenia** (użytkownik),
- **Turnieje** (karty stołów są renderowane rosnąco po dacie pola `gameDate`).

### 9.5 Firebase — czy trzeba zmieniać konfigurację?
Obecny projekt działa bez migracji backendu. Aktualne reguły Firestore już zawierają dostęp do subkolekcji:
- `Tables/{tableId}/confirmations/{playerId}`

W tej subkolekcji zapisywany jest stan potwierdzenia obecności (`confirmed`, `updatedAt`, `updatedBy`, `playerName`, `playerId`).


### 9.6 Co poprawiono w błędzie „Nie udało się pobrać listy potwierdzeń / gier do potwierdzenia”
1. Widoki **admina** i **użytkownika** dla zakładki „Gry do potwierdzenia” mają teraz odporniejsze pobieranie listy gier.
2. Aplikacja najpierw wykonuje odczyt z sortowaniem `orderBy(createdAt, asc)`.
3. Jeżeli taki odczyt zostanie odrzucony przez reguły/zapytanie Firestore, aplikacja automatycznie robi drugi odczyt bez `orderBy`.
4. Wynik fallbacku jest następnie sortowany lokalnie po dacie gry (`gameDate`), więc kolejność pozostaje poprawna.
5. Dzięki temu zakładka nie kończy się od razu błędem i dane wracają w obu widokach.

## 9. Zakładka „Gry użytkowników” — dokładna obsługa (widok gracza)
### 9.1 Włączenie uprawnienia przez administratora
1. Otwórz aplikację w trybie administratora (`?admin=1`).
2. Kliknij zakładkę **Gracze**.
3. W wierszu wybranego gracza kliknij **Edytuj** w kolumnie **Uprawnienia**.
4. W oknie „Uprawnienia gracza” zaznacz pozycję **Gry użytkowników**.
5. Zamknij okno przyciskiem **X**.
6. Poczekaj na automatyczny zapis (status pod tabelą graczy).

### 9.2 Wejście gracza do zakładki
1. Otwórz aplikację bez `?admin=1`.
2. W sekcji **Strefa gracza** kliknij zakładkę **Gry użytkowników**.
3. W polu PIN wpisz dokładnie 5 cyfr przypisanych do gracza, który ma uprawnienie **Gry użytkowników**.
4. Kliknij **Otwórz**.
5. Oczekiwany efekt:
   - poprawny PIN + poprawne uprawnienie: pojawia się duży napis **„Strona w budowie”**,
   - błędny PIN lub brak uprawnienia: widoczny komunikat o braku dostępu.

### 9.3 Ważna uwaga o przełączaniu zakładek
Po wejściu na inną kartę i ponownym kliknięciu **Gry użytkowników** aplikacja ponownie poprosi o PIN (sesja dostępu tej zakładki jest resetowana przy każdym wejściu).

## 10. Zakładka „Gry użytkowników” — dokładna obsługa (widok administratora)
### 10.1 Wejście do zakładki
1. Otwórz aplikację w trybie administratora: `.../Main/index.html?admin=1`.
2. W panelu **Panel Administratora** kliknij zakładkę **Gry użytkowników** (między kartami „Gry admina” i „Gry do potwierdzenia”).
3. Oczekiwany efekt: w części roboczej panelu zobaczysz nagłówek **Gry użytkowników** i opis „Sekcja administracyjna przeznaczona do obsługi gier użytkowników.”

### 10.2 Odświeżanie zakładki
1. Będąc na karcie **Gry użytkowników** kliknij globalny przycisk **Odśwież** w prawym górnym rogu panelu administratora.
2. Oczekiwany efekt: status obok przycisku pokazuje komunikat o odświeżeniu danych aktywnej karty.
3. Zakładka jest przygotowana jako osobne miejsce na dalszą administrację danymi gier użytkowników (na tym etapie zawiera widok informacyjny).


---

## 16. Zakładka „Gry użytkowników” — pełna instrukcja po wdrożeniu

### 16.1 Dla gracza (strefa gracza)
1. Wejdź do zakładki **Gry użytkowników**.
2. W sekcji PIN wpisz 5-cyfrowy kod gracza, który ma uprawnienie **Gry użytkowników**.
3. Kliknij **Otwórz**.
4. Po poprawnej autoryzacji zobaczysz:
   - panel lat po lewej,
   - tabelę gier użytkowników po prawej,
   - przycisk **Dodaj**.

#### Dodanie nowej gry użytkownika
1. Kliknij **Dodaj**.
2. Aplikacja utworzy wpis z bieżącą datą i nazwą `Gra X` (najbliższy wolny numer w danym dniu).
3. W nowym wierszu możesz zmienić:
   - **Rodzaj Gry** (`Cashout` / `Turniej`),
   - **Data**,
   - **Nazwa**,
   - **CzyZamknięta** (checkbox).

#### Dodanie szczegółów (graczy i stawek)
1. W wybranej grze kliknij **Szczegóły**.
2. W modalu kliknij **Dodaj** (pod tabelą), aby dodać wiersz gracza.
3. Uzupełnij pola:
   - **Gracz** (z listy graczy),
   - **Wpisowe**,
   - **Rebuy/Add-on**,
   - **Wypłata**,
   - **Punkty**,
   - **Mistrzostwo**.
4. Kolumna **+/-** wylicza się automatycznie.
5. Aby usunąć pojedynczy wiersz gracza, kliknij **Usuń** w tym wierszu.
6. Aby zamknąć modal, kliknij **×** w prawym górnym rogu.

#### Usuwanie gry użytkownika
1. W tabeli gier kliknij **Usuń** w wybranym wierszu gry.
2. Usunięta zostanie gra oraz jej `rows` i `confirmations`.

### 16.2 Dla administratora (panel admina)
1. Wejdź do `?admin=1`.
2. Kliknij zakładkę **Gry użytkowników**.
3. Dostępne są identyczne akcje jak dla gracza, ale bez PIN-gate:
   - dodawanie gry,
   - edycja typu/dat/nazwy,
   - checkbox **CzyZamknięta**,
   - wejście w **Szczegóły**,
   - usuwanie gry i wierszy.

### 16.3 Potwierdzenia obecności (po zmianie)
- Zakładka **Gry do potwierdzenia** (gracz i admin) agreguje teraz aktywne gry z dwóch kolekcji:
  - `Tables`,
  - `UserGames`.
- Jeżeli gracz zostanie dodany do `UserGames/{gameId}/rows`, zobaczy tę grę w „Gry do potwierdzenia” (o ile ma uprawnienie do tej zakładki).
- Administrator może potwierdzać/anulować obecności również dla gier z `UserGames`.

### 16.4 Aktualne Firestore Rules (zgodne z nową strukturą)
Użyj poniższej wersji w Firebase Console → Firestore Database → Rules:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }

      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /UserGames/{gameId} {
      allow read, write: if true;

      match /rows/{rowId} {
        allow read, write: if true;
      }

      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }
  }
}
```

### 4.8 Segment „Statystyki” — nowa tabela graczy (krok po kroku)
Po dwóch górnych wierszach (`Liczba gier`, `Łączna pula`) znajdziesz teraz szeroką tabelę roczną. Dane są liczone tylko dla aktywnego roku z panelu **Lata**.

1. Kliknij po lewej konkretny rok (np. `2026`).
2. Przewiń sekcję do nagłówka **Statystyki**.
3. Sprawdź dwa pierwsze wiersze:
   - **Liczba gier** — ile gier jest w wybranym roku,
   - **Łączna pula** — suma pul ze wszystkich gier roku.
4. Niżej sprawdź tabelę graczy:
   - **Gracz** — pojawia się tylko gracz, który ma uzupełnione **Wpisowe** w „Szczegóły gry” (puste wpisowe = nieobecność),
   - **Mistrzostwo** — suma zaznaczeń checkboxa „Mistrzostwo” w roku,
   - **Ilość Spotkań** — liczba gier z obecnością gracza (na podstawie wpisowego),
   - **% udział** — `ceil(Ilość Spotkań / Liczba gier * 100)`,
   - **(+/-)** — suma z kolumny `+/-` ze wszystkich gier roku,
   - **Wypłata** — suma kolumny `Wypłata`,
   - **Wpłaty** — suma `Wpisowe + Rebuy/Add-on`,
   - **Suma z rozegranych gier** — suma puli gier, w których gracz był obecny,
   - **% Wszystkich gier** — `ceil(Wypłata / Suma z rozegranych gier * 100)`,
   - **% Rozegranych gier** — `ceil(Wypłata / Łączna pula * 100)`.
5. Kolumny do ręcznego wpisania przez admina:
   - `Waga1`, `Waga2`, `Punkty`, `Waga3`, `Waga4`, `Waga5`, `Waga6`, `Waga7`, `Wynik`.
6. Kliknij w dowolną komórkę jednej z powyższych kolumn i wpisz liczbę.
7. Po krótkiej chwili wartość zapisze się automatycznie i pozostanie po odświeżeniu strony.

### 4.9 Panel „Ranking” po prawej stronie
Obok sekcji treści „Gry admina” jest nowy panel **Ranking** (analogicznie do lewego panelu **Lata**).

1. Kliknij rok po lewej stronie.
2. W panelu po prawej sprawdź tabelę 3-kolumnową:
   - **Miejsce**,
   - **Gracz**,
   - **Wynik**.
3. Kolejność rankingu jest liczona malejąco po kolumnie **Wynik** z tabeli „Statystyki”.
4. Po zmianie wartości `Wynik` w statystykach ranking odświeża się automatycznie.
5. Kolorystyka miejsc:
   - miejsca **1–8**: kolor złoty,
   - miejsca **9–17**: kolor zielony,
   - miejsca **18+**: kolor czerwony.

## 17. Panel „Lata” — kontrola poprawności i nowy wygląd przycisków

### 17.1 Szybki test: czy rok pojawia się natychmiast po zmianie daty gry (Gry admina)
1. Wejdź do panelu administratora (`?admin=1`) i otwórz kartę **Gry admina**.
2. W lewym panelu **Lata** kliknij rok, który aktualnie ma gry (np. `2026`).
3. W tabeli po prawej kliknij pole **Data** w wybranym wierszu gry.
4. Ustaw datę na rok, którego jeszcze nie ma na liście (np. `2027-01-15`).
5. Nie odświeżaj strony — obserwuj lewy panel **Lata**.
6. Oczekiwany efekt:
   - zmieniona gra znika z listy roku `2026` (bo należy już do `2027`),
   - przycisk roku `2027` pojawia się od razu w panelu **Lata**,
   - po kliknięciu `2027` zobaczysz przeniesioną grę.

### 17.2 Taki sam test dla karty „Gry użytkowników”
1. W panelu administratora otwórz kartę **Gry użytkowników**.
2. Kliknij rok po lewej i zmień datę jednej gry na rok, którego nie ma jeszcze na liście.
3. Oczekiwany efekt identyczny jak w „Gry admina”:
   - natychmiastowe pojawienie się nowego roku po lewej,
   - możliwość kliknięcia nowego roku i zobaczenia przeniesionej gry.

### 17.3 Zmiana wyglądu panelu „Lata” (Gry admina + Gry użytkowników)
W obu zakładkach przyciski lat zostały wyrównane wizualnie do panelu **Ranking**:
- lista lat startuje od samej góry panelu,
- każdy przycisk ma stałą, powtarzalną wysokość,
- wysokość przycisku roku jest taka sama jak wysokość pojedynczego wiersza panelu **Ranking**,
- aktywny rok nadal ma złote podświetlenie (`is-active`).
