# Pełny audyt kodu modułu Second (2026-03-05)

## Prompt użytkownika
"Przeprowadź pełen kod modułu Second.\nSprawdź czy:\n\n1. Jest blokada na usunięcie ostatniego dokumentu z kolekcji?\n2. Wszystkie pola edytowalne przez użytkownika mają zabezpieczenie przed błędem z Analizy/Wazne_Fokus.md?\n3. Czy wszystkie pola edytowalne przez użytkownika (w tym checkboxy) są podpięte pod Firebase?\n4. Czy wszystkie pola edytowalne przez użytkownika mają określony typ (np. numeric), żeby w wersji mobilnej klawiatura się nie przełączała?"

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

Niepodpięte / niespięte logicznie:
- `chatPinInput` i `chatPinOpenButton` są obecne w HTML, ale brak ich obsługi w `app.js` (brak walidacji PIN i brak zapytania do Firebase po tym PIN-ie).

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
