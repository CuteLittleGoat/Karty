# Second — dokumentacja techniczna

## 1. Struktura modułu
- `Second/index.html` — nagłówek, szablon widoku użytkownika/admina oraz modal instrukcji.
- `Second/styles.css` — wspólny motyw wizualny, layout kart, tabele i style modali.
- `Second/app.js` — logika zakładek, autoryzacji admina, notatek i obsługi instrukcji.

## 2. Zmiana wprowadzona w tej wersji
- Przycisk **Instrukcja** działa w obu widokach (użytkownik i admin).
- Dodano dedykowany modal instrukcji dla modułu Second:
  - `#secondInstructionModal`
  - `#secondInstructionClose`
  - `#secondInstructionStatus`
  - `#secondInstructionContent`
- Treść instrukcji ładowana jest z:
  - `https://cutelittlegoat.github.io/Karty/Second/docs/README.md`

## 3. Obsługa modala instrukcji (`initInstructionModal`)
- Pierwsze otwarcie pobiera markdown przez `fetch`.
- Treść jest cachowana lokalnie (`cachedText`) i nie jest pobierana ponownie przy kolejnym otwarciu.
- Modal zamyka się przez:
  - przycisk `✕`,
  - kliknięcie w tło,
  - klawisz `Escape`.
- `body.modal-open` blokuje przewijanie strony podczas otwartego modala.

## 4. Widoki i role
- Parametr `?admin=1` uruchamia panel administratora.
- Notka o pominięciu hasła admina (`#secondAdminPasswordBypassNote`) widoczna tylko w trybie admin.
- Sam przycisk instrukcji pozostaje aktywny i widoczny zawsze.

## 5. Integracja Firebase
- Firebase inicjalizowany warunkowo przez `getFirebaseApp()`.
- Zaimplementowana ochrona usuwania ostatniego dokumentu top-level collection.
- Zakładka notatek admina zapisuje dane do `admin_notes/second`.
