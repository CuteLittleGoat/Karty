# Analiza układu paneli modułu Main na mobile (poziomo)

## Prompt użytkownika
> Przeanalizuj kod modułu Main.
> Aplikacja zawiera sporo różnych paneli w zakładkach. W wersji na PC wyświetla się prawidłowo. W wersji mobilnej w orientacji poziomej panele układają się jeden obok drugiego co utrudnia korzystanie z aplikacji.
> Przeprowadź analizę czy da się zrobić, żeby wszystkie panele (np. Lata, Ranking) w widoku mobilnym układały się jeden pod drugim a nie obok siebie.

## Wniosek skrócony
Tak — da się to zrobić i obecny kod już ma prawie gotowy mechanizm, który wymaga rozszerzenia warunku responsywnego.

## Co powoduje obecne zachowanie
1. Główny kontener paneli (`.admin-games-layout`) działa jako grid wielokolumnowy:
   - bazowo: `220px minmax(0, 1fr)`
   - dla wybranych zakładek: `20ch minmax(0, 1fr) 42ch` lub `20ch minmax(0, 1fr) 34ch`.
2. Układ 1-kolumnowy (`grid-template-columns: 1fr`) jest aktywowany tylko w media query `@media (max-width: 720px)`.
3. W trybie mobile poziomym szerokość viewportu często przekracza 720 px (np. 800–932 px), więc breakpoint nie aktywuje układu pionowego — stąd panele „Lata” i „Ranking” pozostają obok treści głównej.

## Czy można wymusić układ pionowy na mobile poziomo
Tak. Najbezpieczniejsze podejścia:

### Wariant A (rekomendowany)
Dodać dodatkowe media query ukierunkowane na urządzenia dotykowe w orientacji poziomej (lub na niski viewport height), które ustawia:
- `.admin-games-layout { grid-template-columns: 1fr; }`
- oraz analogicznie dla selektorów tabów: `#adminGamesTab`, `#adminStatisticsTab`, `#statisticsTab`.

Przykładowa logika warunku:
- `@media (orientation: landscape) and (hover: none) and (pointer: coarse)`
- opcjonalnie z ograniczeniem wysokości, np. `and (max-height: 500px)` aby nie psuć desktopów.

### Wariant B
Podnieść główny breakpoint z `max-width: 720px` do większej wartości (np. 900/1024 px). Jest prostszy, ale może zbyt wcześnie przełączać układ na desktopie przy wąskim oknie.

### Wariant C
Wprowadzić klasę stanu (np. ustawianą w JS po detekcji mobile+landscape) i pod nią wymusić układ 1-kolumnowy. Największa kontrola, ale największa złożoność.

## Ryzyka / uwagi
- Tabele mają dużo kolumn i część z nich ma twarde szerokości (`white-space: nowrap`, szerokości `rem/ch`), więc po przejściu na układ pionowy i tak zostanie poziomy scroll wewnątrz tabel — to normalne i pożądane.
- Zmiana dotyczy układu paneli-kontenerów, nie treści tabel.

## Rekomendacja implementacyjna
Wdrożyć Wariant A: dodatkowy breakpoint „mobile landscape” wymuszający 1 kolumnę dla `admin-games-layout` we wszystkich zakładkach opartych o ten layout.

To powinno rozwiązać problem użytkowy bez degradacji widoku desktopowego.
