# Analiza prefiksów kolekcji i Firestore Rules (Main + Second)

## Prompt użytkownika
"Przeprowadź dokładną analizę kodu całej aplikacji i sprawdź czy wszędzie w kodzie zapis odbywa się do kolekcji zaczynającej się od nazwy \"main_\" lub \"second_\" oraz czy Rules są poprawne. Jeżeli Rules wymagają aktualizacji to zapisz pełen kod Rules gotowy do przeklejenia do Firebase."

## Zakres analizy
- `Main/app.js`
- `Second/app.js`
- `config/firebase-config.js`
- istniejące pliki z Rules: `Analizy/old_RulesPIN`, `Analizy/Projekt_Login_i_Haslo.md`

## Wynik analizy zapisu do kolekcji

### 1) Moduł Main
W `Main/app.js` zapisy (add/set/update/delete) trafiają do top-level kolekcji:
- `main_app_settings`
- `main_admin_messages`
- `main_chat_messages`
- `main_tables`
- `main_user_games`
- `main_admin_games_stats`
- `main_calculators`

To spełnia wymóg prefiksu `main_` dla kolekcji głównych.

**Uwaga krytyczna:**
W wielu miejscach występują zapisy do subkolekcji nazwanych:
- `rows`
- `confirmations`

Są to kolekcje (zagnieżdżone), które **nie** zaczynają się od `main_`/`second_`. Jeśli wymaganie prefiksu ma obowiązywać absolutnie dla każdej kolekcji (także subkolekcji), obecny kod nie spełnia wymogu. Jeśli wymaganie dotyczy wyłącznie kolekcji top-level, wtedy Main jest zgodny.

### 2) Moduł Second
`Second/app.js` to obecnie szkielet UI bez integracji z Firestore (brak wywołań `db.collection(...).add/set/update/delete`).

W praktyce brak zapisów po stronie modułu Second, więc nie ma aktywnych naruszeń prefiksu `second_` w kodzie wykonawczym.

### 3) Konfiguracja
`config/firebase-config.js` zawiera:
- dla Main: `main_tables`, `main_user_games`, ale `gameDetailsCollection: "rows"`
- dla Second: `second_tables`, `second_user_games`, ale `secondGameDetailsCollection: "rows"`

To potwierdza, że projekt celowo używa nieprefiksowanych subkolekcji `rows`.

## Czy Rules są poprawne?

### Ocena obecnych Rules
W repo nie ma aktywnego pliku `firestore.rules`, natomiast w `Analizy/old_RulesPIN` są stare reguły typu `allow read, write: if true;` dla wielu ścieżek.

Takie reguły są niepoprawne z perspektywy bezpieczeństwa (pełny, niekontrolowany dostęp).

### Wniosek
Rules wymagają aktualizacji.

## Proponowane Firestore Rules (pełny kod do wklejenia)

Poniższe Rules:
- zezwalają tylko na kolekcje zaczynające się od `main_` i `second_` (na poziomie top-level),
- jawnie blokują wszystkie inne top-level kolekcje,
- pozwalają na subkolekcje (np. `rows`, `confirmations`) pod dozwolonymi kolekcjami top-level,
- pozostają kompatybilne z obecnym kodem aplikacji.

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAllowedTopLevelCollection(collectionId) {
      return collectionId.matches('^(main_|second_).*$');
    }

    // Dostęp do wszystkich dokumentów i subkolekcji pod kolekcjami main_/second_
    match /{topCollection}/{documentPath=**} {
      allow read, write: if isAllowedTopLevelCollection(topCollection);
    }

    // Blokada wszystkiego poza dozwolonymi kolekcjami top-level
    match /{documentPath=**} {
      allow read, write: if false;
    }
  }
}
```

## Rekomendacja architektoniczna
Jeżeli wymaganie biznesowe brzmi dosłownie: "każda kolekcja (również subkolekcja) musi zaczynać się od `main_`/`second_`", to trzeba zmigrować nazwy:
- `rows` -> np. `main_rows` / `second_rows`
- `confirmations` -> np. `main_confirmations` / `second_confirmations`

Wtedy konieczna będzie równoległa zmiana kodu frontendu oraz danych w Firestore.
