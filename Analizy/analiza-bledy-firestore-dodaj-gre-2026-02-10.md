# Analiza błędu „Brak uprawnień do zapisu w kolekcji Games”

## Przyczyna
Aplikacja próbowała zapisać nową grę do kolekcji `Games`, ale w podanych regułach Firestore nie ma bloku `match /Games/{docId}`.

## Co zostało naprawione w kodzie
- Domyślna konfiguracja zakładki **Gry** została ustawiona na kolekcję `Tables` (zgodną z Twoimi regułami).

## Co Ty musisz zrobić po swojej stronie Firebase
### Wymagane tylko jeśli nie wdrożysz nowej wersji kodu
Jeżeli aplikacja nadal działa na starej wersji (gdzie `gamesCollection` = `Games`), masz dwie opcje:

1. **Opcja A (zalecana):** wdrożyć aktualny kod, który używa `gamesCollection: "Tables"`.
2. **Opcja B:** dopisać regułę dla `Games`, np.:

```firestore
match /Games/{gameId} {
  allow read, write: if true;

  match /details/{detailId} {
    allow read, write: if true;
  }
}
```

Po każdej zmianie reguł kliknij **Publish**.
