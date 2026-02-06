# Analiza funkcjonalności: zakładka „Najbliższa gra” z PIN

## Cel
Celem jest dodanie nowej zakładki „Najbliższa gra”, która będzie widoczna zarówno w trybie użytkownika, jak i administratora. Dostęp do treści zakładki ma być chroniony kodem PIN (min. 4 cyfry), ustawianym przez administratora i zapisywanym pomiędzy sesjami aplikacji.

## Stan obecny
- Interfejs jest statyczny i nie zawiera zakładek ani mechanizmu autoryzacji PIN.
- Dane dynamiczne są obecnie renderowane z tablic w `Main/app.js`.
- Jedyną funkcją opartą o Firebase jest wysyłka wiadomości admina do Firestore.

## Proponowany przebieg użytkownika
1. **Użytkownik** widzi w menu/zakładkach pozycję „Najbliższa gra”.
2. Po kliknięciu zakładki pojawia się modal lub karta z polem do wpisania PIN-u.
3. Po podaniu poprawnego PIN-u następuje przejście do zawartości zakładki.
4. Po podaniu błędnego PIN-u użytkownik otrzymuje komunikat o błędzie i nie ma dostępu do treści.

## Proponowany przebieg administratora
1. **Administrator** widzi zakładkę „Najbliższa gra” oraz dodatkowe pole tekstowe z aktualnym PIN-em.
2. PIN jest edytowalny (pole tekstowe) i zapisuje się w bazie danych po zmianie.
3. UI powinno potwierdzić zapis (np. status „Zapisano PIN”).
4. Wartość PIN powinna być przechowywana pomiędzy sesjami i dostępna na wszystkich urządzeniach.

## Proponowana implementacja techniczna

### 1. HTML (Main/index.html)
- Dodać nową zakładkę/sekcję „Najbliższa gra” widoczną w obu trybach.
- Dodać w sekcji admina pole tekstowe do edycji PIN-u.
- Dodać modal/panel PIN dla użytkownika.

### 2. CSS (Main/styles.css)
- Dodać styl dla nowej zakładki (aktywna/nieaktywna), pola PIN i komunikatów.
- Zachować istniejącą stylistykę (złoto, filc, neon, noirovy background).

### 3. JavaScript (Main/app.js)
- **Odczyt PIN-u z bazy** przy starcie aplikacji.
- **Walidacja PIN-u** po wpisaniu przez użytkownika.
- **Zapis PIN-u** po zmianie w panelu admina.
- **Stan lokalny UI** (np. `isPinVerified`) dla warunkowego renderowania treści zakładki.

## Przechowywanie PIN (trwałość między sesjami)

### Wymóg
PIN musi być zapisywany pomiędzy sesjami użycia aplikacji i dostępny dla użytkowników na różnych urządzeniach.

### Rekomendacja
Użyć **Firestore** i przechowywać PIN w dokumencie, np.:
- Kolekcja: `app_settings`
- Dokument: `next_game`
- Pole: `pin` (string, min. 4 cyfry)

### Alternatywy
- **LocalStorage**: nie spełnia wymogu współdzielenia między urządzeniami.
- **Plik JSON**: wymaga hostingu backendowego i ręcznej aktualizacji.

## Bezpieczeństwo
- PIN jest tylko ochroną UI (nie jest pełną autoryzacją). W aplikacji frontendowej PIN może być podejrzany w narzędziach deweloperskich.
- W produkcji zaleca się dodatkowe zabezpieczenia (np. tokeny sesyjne, reguły Firestore ograniczające zapis tylko do adminów).

## Co trzeba dopisać do Firebase.md
- Instrukcję utworzenia kolekcji `app_settings` i dokumentu `next_game` z polem `pin`.
- Przykładowe reguły bezpieczeństwa Firestore:
  - tylko admin może zapisywać PIN,
  - użytkownicy mogą tylko odczytać.

## Wpływ na dokumentację
- `docs/README.md`: dodać informację, że analiza funkcji znajduje się w `PIN.md`.
- `docs/Documentation.md`: dodać plik `PIN.md` do struktury oraz opisać planowany przepływ PIN.
- `DetaleLayout.md`: aktualizacja tylko wtedy, gdy pojawią się nowe style wizualne (na tym etapie brak zmian).

## Podsumowanie
Funkcja „Najbliższa gra” z PIN-em wymaga:
- nowej zakładki UI w obu widokach,
- modala/pola PIN dla użytkowników,
- pola edycji PIN w panelu admina,
- zapisu PIN-u w Firestore (trwałość między sesjami),
- aktualizacji dokumentacji i Firebase.md.
