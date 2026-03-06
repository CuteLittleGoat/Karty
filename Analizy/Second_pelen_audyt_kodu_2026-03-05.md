# Pełny audyt kodu modułu Second (2026-03-05)

## Prompt użytkownika
"Przeprowadź pełen kod modułu Second.\nSprawdź czy:\n\n1. Jest blokada na usunięcie ostatniego dokumentu z kolekcji?\n2. Wszystkie pola edytowalne przez użytkownika mają zabezpieczenie przed błędem z Analizy/Wazne_Fokus.md?\n3. Czy wszystkie pola edytowalne przez użytkownika (w tym checkboxy) są podpięte pod Firebase?\n4. Czy wszystkie pola edytowalne przez użytkownika mają określony typ (np. numeric), żeby w wersji mobilnej klawiatura się nie przełączała?"

## Prompt aktualizacyjny (2026-03-05, doprecyzowanie)
"Przeczytaj i zaktualizuj analizę: Analizy/Second_pelen_audyt_kodu_2026-03-05.md

Interesuje mnie podpunkt: 3) Czy wszystkie pola edytowalne (w tym checkboxy) są podpięte pod Firebase?
Niepodpięte / niespięte logicznie:
chatPinInput i chatPinOpenButton są obecne w HTML, ale brak ich obsługi w app.js (brak walidacji PIN i brak zapytania do Firebase po tym PIN-ie).


Rozwiń ten wątek. Oczekiwaniem jest, żeby w widoku użytkownika aplikacja pytała o PIN i w oparciu o ten PIN (i przypisane uprawnienia) pozwalała wyświetlać zakładki. Funkcjonalność ma działać jak w module Main (m.in to, że aplikacja o PIN pyta tylko raz na sesję przeglądarki). Zakładki 'Aktualności' i 'Regulamin' mają być zawsze widoczne, nawet bez PIN."

## Zakres analizy
- Przejrzano cały kod modułu `Second` (`Second/app.js`, `Second/index.html`).
- Zweryfikowano mechanizmy:
  - blokady usunięcia ostatniego dokumentu,
  - ochrony fokusu i ochrony przed nadpisaniem `onSnapshot`,
  - mapowania pól edytowalnych do zapisów/odczytów Firebase,
  - typów pól (`type`, `inputmode`, `pattern`) dla urządzeń mobilnych.

## Wnioski

### 1) Blokada usunięcia ostatniego dokumentu z kolekcji
**TAK (częściowo zakresowo):**
- W module działa globalny patch `DocumentReference.delete` oraz `WriteBatch.delete/commit`.
- Przed usunięciem wykonywany jest probe (`limit(uniqueRefs.length + 1)`), a gdy operacja usuwałaby ostatni dokument kolekcji — rzucany jest błąd `LAST_DOCUMENT_DELETE_BLOCKED` i pokazywany alert.
- Ochrona jest ograniczona do kolekcji top-level (`!collectionPath.includes('/')`).

### 2) Zabezpieczenie pól edytowalnych przed błędem z Analizy/Wazne_Fokus.md
**NIE, nie w 100% dla całego modułu.**

Co jest zabezpieczone:
- **Turniej (admin):**
  - focus restore oparty o `data-role` + identyfikatory (`playerId`, `tableId`, `id`),
  - blokada nadpisania stanu podczas aktywnej edycji i lokalnych zapisów (`hasActiveEdit`, `pendingLocalWrites`, `deferredSnapshotState`).
- **Notatki admina:**
  - ochrona przed nadpisaniem aktywnie edytowanego pola (`document.activeElement === notesInput && hasLocalEdits && !isSaving`).

Luki:
- **Aktualności admina** i **Regulamin admina**: snapshoty bezwarunkowo nadpisują `textarea` (`input.value = ...`) bez warunku aktywnej edycji.
- To nie jest klasyczny ten sam scenariusz autozapisu z debouncem jak w analizie, ale nadal jest ryzyko utraty wpisywanego tekstu/fokusu przy równoległej synchronizacji.

### 3) Czy wszystkie pola edytowalne (w tym checkboxy) są podpięte pod Firebase?
**NIE (nie wszystkie).**

Podpięte:
- Pola i checkboxy sekcji turniejowej (`input/change/click` → modyfikacja `tournamentState` → `docRef.set(..., { merge: true })`).
- Pola admina: notatki, aktualności, regulamin.
- Czat użytkownika (wysyłka wiadomości przez `add` do kolekcji czatu).

Niepodpięte / niespięte logicznie (kluczowa luka):
- `chatPinInput` i `chatPinOpenButton` są obecne w HTML, ale brak ich obsługi w `app.js`.
- W efekcie:
  - nie ma walidacji PIN (5 cyfr),
  - nie ma mapowania PIN → gracz (`second_tournament/state.players`),
  - nie ma sprawdzenia uprawnień gracza do zakładek,
  - nie ma zapamiętania pozytywnej weryfikacji PIN na czas sesji przeglądarki,
  - użytkownik technicznie widzi wszystkie zakładki niezależnie od uprawnień.

#### Rozwinięcie wątku: jak powinno działać (parytet z modułem Main)
Docelowo moduł **Second** powinien skopiować logikę „PIN gate” z modułu **Main** (ten sam UX i ten sam model bezpieczeństwa po stronie UI):

1. **Jednorazowe pytanie o PIN na sesję przeglądarki**
   - Po poprawnej weryfikacji PIN stan musi być zapisany w `sessionStorage`.
   - Przy kolejnych przejściach między zakładkami i odświeżeniach strony w tej samej sesji użytkownik nie powinien być pytany ponownie.
   - Po zamknięciu sesji (np. zamknięcie wszystkich kart) PIN powinien być wymagany ponownie.

2. **Weryfikacja PIN na podstawie Firebase**
   - Źródło prawdy: `second_tournament/state.players[]`.
   - Algorytm minimalny:
     - pobierz PIN z inputu,
     - oczyść do cyfr i sprawdź długość = 5,
     - wyszukaj aktywnego gracza z takim PIN-em,
     - znormalizuj `permissions` (obecnie w Second mogą być stringiem CSV lub tablicą),
     - przyznaj dostęp tylko do zakładek zawartych w uprawnieniach.

3. **Widoczność zakładek wg uprawnień + wyjątki biznesowe**
   - Zakładki **„Aktualności”** i **„Regulamin”** mają być zawsze widoczne (nawet bez PIN) — to wyjątek stały.
   - Pozostałe zakładki (co najmniej: `chatTab`, `tournamentTab`) powinny:
     - być ukryte albo zablokowane do czasu poprawnej weryfikacji PIN,
     - po poprawnym PIN ujawniać się tylko wtedy, gdy gracz ma odpowiednie uprawnienie.

4. **Reakcja na zmianę uprawnień/PIN w tle**
   - Jeżeli admin zmieni uprawnienia albo PIN już zweryfikowanego gracza, UI użytkownika musi to odzwierciedlić po kolejnym snapshotcie:
     - odebranie uprawnienia = natychmiastowa utrata dostępu do zakładki,
     - zmiana PIN powodująca brak dopasowania = reset lokalnej sesji PIN.

5. **Spójność UI i komunikatów**
   - Błędy walidacji: „Wpisz komplet 5 cyfr.”
   - Błąd autoryzacji: „Błędny PIN lub brak uprawnień do zakładki …”.
   - Sukces: krótki komunikat powitalny + przejście do pierwszej dozwolonej zakładki.

#### Proponowany minimalny zakres implementacyjny w `Second/app.js`
- Dodać stan sesji (np. `SECOND_PIN_STORAGE_KEY`, `SECOND_PLAYER_ID_STORAGE_KEY`) i helpery get/set.
- Dodać helpery:
  - `sanitizePin` (cyfry-only + długość 5),
  - `getSecondVerifiedPlayer` (na podstawie `playerId` z sesji + aktualnego snapshotu),
  - `isSecondPlayerAllowedForTab(player, tabKey)`.
- Podpiąć event do `chatPinOpenButton` i Enter w `chatPinInput`.
- W `setupUserView` po każdym odświeżeniu danych graczy wyliczać listę dozwolonych zakładek i synchronizować widoczność/przełączanie tabów.
- Wymusić, że bez PIN zawsze są dostępne tylko „Aktualności” i „Regulamin”.

#### Ocena ryzyka po wdrożeniu
- To nadal będzie **kontrola dostępu po stronie klienta (UI)**, a nie pełna autoryzacja backendowa.
- Aby domknąć bezpieczeństwo, reguły Firestore powinny dodatkowo ograniczać zapis/odczyt danych wrażliwych niezależnie od logiki front-end.

### 4) Czy wszystkie pola mają określony typ, aby klawiatura mobilna się nie przełączała?
**NIE, nie w pełnym sensie wymagania.**

- Dla pól liczbowych w turnieju typowo użyto `type="tel"` + `inputmode="numeric"` + `pattern`, co jest poprawne dla mobile.
- Checkboxy mają poprawny `type="checkbox"`.
- Pola tekstowe mają `type="text"`.

Obszary bez precyzyjnego trybu klawiatury/liczbowego:
- `textarea` (Aktualności/Regulamin/Notatki/Czat) — naturalnie brak `type`; to zwykle jest poprawne dla długiego tekstu.
- Jeśli wymóg biznesowy brzmi „żadna klawiatura nie może się przełączać podczas pracy po formularzu”, to sam fakt mieszania pól tekstowych, textarea, checkbox i numeric powoduje nieuniknione przełączanie rodzaju klawiatury.

## Lista rekomendacji
1. Dodać ochronę „aktywnie edytowane pole + lokalne zmiany” także w `initAdminNews` i `initAdminRules`.
2. Dokończyć logikę `chatPinInput` (`chatPinOpenButton`): walidacja PIN + odczyt uprawnień z `second_tournament.state.players[].permissions` / mapy PIN.
3. Dla spójności UX mobile:
   - utrzymać `inputmode="numeric"` dla wszystkich pól liczbowych,
   - rozważyć ekranowe grupowanie pól o tym samym typie (tekstowe oddzielnie od liczbowych), bo globalnie nie da się uniknąć przełączania klawiatury między typami danych.
