# Ocena reguł Firestore dla zapisu PIN

## Wniosek
Podany zestaw reguł **nie rozwiąże problemu zapisu PIN**, ponieważ nie zawiera żadnej reguły `allow write`. Dodatkowo w przykładzie `allow read` jest zdublowane.

## Dlaczego zapis nadal będzie zablokowany
Firestore domyślnie blokuje operacje, które nie są explicite dozwolone regułami. Jeśli w regułach nie ma `allow write`, to każdy zapis (w tym `.set()` z aplikacji) zostanie odrzucony.

## Co powinno się znaleźć w regułach, jeśli chcesz dopuścić zapis
- Minimalnie musisz dodać `allow write` dla ścieżki `/app_settings/next_game`.
- Przykład (tylko do testów, nie do produkcji):
  ```
  allow read: if true;
  allow write: if true;
  ```
- Dla produkcji lepiej wymusić autoryzację (np. `request.auth != null` + custom claim `admin`) albo użyć Cloud Function.
