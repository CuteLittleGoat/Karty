# Main — dokumentacja techniczna

## 1. Struktura modułu
- `Main/index.html` — pełny układ widoku użytkownika i administratora oraz modal instrukcji.
- `Main/styles.css` — motyw, layout kart, tabele i style modali.
- `Main/app.js` — logika Firebase, zakładek, panelu admina, strefy gracza, kalkulatora i modali.

## 2. Zmiana wprowadzona w tej wersji
- Przycisk **Instrukcja** jest dostępny zarówno dla administratora, jak i dla użytkownika (wspólny przycisk w nagłówku).
- Modal instrukcji ładuje treść z adresu:
  - `https://cutelittlegoat.github.io/Karty/Main/docs/README.md`
- W module `Main` ponownie aktywowano wymaganie hasła administratora przed otwarciem panelu admina (`resolveAdminMode`).
- Czerwony komunikat testowy przy przycisku **Instrukcja** został usunięty z nagłówka modułu `Main`.
- Dodano ochronę przed nadpisywaniem aktywnie edytowanych pól przez snapshot Firestore:
  - kalkulator ignoruje snapshot dla aktywnego trybu podczas edycji (`table1`, `table2`, `table3`, `table5`, `table9`) albo gdy czeka lokalny debounce zapisu,
  - lista graczy ignoruje snapshot podczas aktywnej edycji pól gracza i oczekującego debounce,
  - pola **Regulamin** i **Notatki** nie są nadpisywane przez snapshot, gdy użytkownik aktywnie pisze (bez zapisu).

## 3. Obsługa modala instrukcji (`initInstructionModal`)
- Elementy DOM:
  - `#adminInstructionButton`
  - `#instructionModal`
  - `#instructionClose`
  - `#instructionStatus`
  - `#instructionContent`
- Zachowanie:
  - pierwsze otwarcie pobiera instrukcję przez `fetch`,
  - wynik jest cachowany w pamięci (`cachedText`),
  - kolejne otwarcia używają danych z cache,
  - zamykanie: przycisk `✕`, klik w tło, klawisz `Escape`.

## 4. Widoki i uprawnienia
- Tryb administratora włączany parametrem `?admin=1`.
- Klasy CSS:
  - `.admin-only` / `.user-only` sterowane przez `body.is-admin`.
- Header:
  - przycisk instrukcji widoczny zawsze.

## 5. Integracja danych
- Firebase inicjalizowany przez `window.firebaseConfig` (z `config/firebase-config.js`).
- Firestore używany m.in. dla: aktualności, regulaminu, notatek admina, czatu, graczy, gier i statystyk.
