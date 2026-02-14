# Analiza działania zakładki „Najbliższa gra” — dziwne trzy ostatnie wiersze

## Prompt użytkownika
> Przeprowadź analizę działania zakładki "Najbliższa gra".
> Ogólnie wygląda, że działa. Pozycje się dodają i znikają w zależności od checboxa zgodnie z wymaganiami.
> Sprawdź mi tylko czemu trzy ostatnie wiersze tabeli są takie dziwne.
> Obecnie tabela wygląda tak:
> Nagłówek (prawidłowo)
> Gra (prawidłowo)
> Pusty wiersz (błąd)
> Gra bez uzupełnionych danych (błąd?)
> Pusty wiersz (błąd)
>
> Sprawdź mi czy trzy ostatnie wiersze tabeli się tak pojawiają ponieważ są jakieś śmieciowe dane po testach i tak się zaciąga czy to błąd kodu?

## Zakres sprawdzenia
- `Main/index.html` (czy tabela ma statyczne dodatkowe `<tr>`),
- `Main/app.js` (logika pobierania i renderowania tabeli „Najbliższa gra”),
- źródła danych (`Tables` + `UserGames`) i filtrowanie po `isClosed`.

## Ustalenia
1. **W HTML nie ma statycznych pustych wierszy** dla tej tabeli. W `tbody` (`#nextGameTableBody` i `#adminNextGameTableBody`) nie ma wpisanych ręcznie rekordów.
2. Tabela „Najbliższa gra” jest budowana dynamicznie na podstawie danych z Firestore z **dwóch kolekcji naraz**: `Tables` i `UserGames`.
3. Kod renderujący tworzy wiersz dla **każdego** rekordu, który nie ma `isClosed=true`.
4. Dla pól brakujących (`gameType`, `gameDate`, `name`) kod podstawia pusty string (`""`), więc rekordy niekompletne pojawiają się jako „puste” lub „częściowo puste” wiersze.

## Wniosek
Najbardziej prawdopodobna przyczyna opisanego efektu to **śmieciowe / niekompletne rekordy danych w Firestore** (np. po testach), a nie statyczny błąd layoutu tabeli.

## Dlaczego to nie wygląda na błąd struktury UI
- Gdyby problem był w HTML/CSS, dodatkowe puste wiersze byłyby stałe niezależnie od danych.
- Tutaj liczba i zawartość wierszy zależy od tego, co przychodzi z kolekcji i czy `isClosed` jest odznaczone.

## Dodatkowa uwaga techniczna
W aktualnej implementacji brak jest walidacji „kompletności” rekordu przed renderowaniem (np. warunku: pokazuj tylko rekordy z uzupełnionym `gameDate` i `name`). Dlatego nawet rekord z pustymi polami jest legalnie renderowany jako wiersz.

## Rekomendacja operacyjna
1. Sprawdzić w Firestore kolekcje `Tables` i `UserGames` pod kątem rekordów z pustymi polami.
2. Uzupełnić lub usunąć testowe wpisy.
3. (Opcjonalnie) dodać filtr w kodzie renderowania „Najbliższa gra”, który pomija rekordy bez wymaganych pól.
