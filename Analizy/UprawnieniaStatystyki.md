# Analiza funkcjonalności: ograniczanie lat w zakładce „Statystyki” per gracz

## Prompt użytkownika (kontekst)

> Przeprowadź analizę wprowadzenia nowej funkcjonalności.
> Jej celem jest ograniczenie widoku tabeli w zakładce Statystyki użytkownikowi do wybranych przez Administratora lat.
> Zakładka "Statystyki" ma z lewej strony panel wyboru lat. Administrator chce mieć możliwość dania GraczA dostęp do lat 2026 i 2025 a GraczB dostęp do lat 2025 i 2024.
> Pierwszym pomysłem było dodanie znaku "+" w polu do edycji uprawnień gracza przy checkboxie "Statystyki" i tam dać pole do zaznaczenia lat. Jednak możesz zaproponować też inne rozwiązania, żeby osiągnąć taki efekt.

---

## Cel biznesowy
- Administrator ma zarządzać dostępem do lat statystyk per gracz.
- Widok gracza ma pokazywać tylko lata przypisane do jego konta/uprawnienia.
- Panel „Strefa Gracza” w adminie ma odzwierciedlać dokładnie to samo zachowanie.

## Aktualny stan (skrót)
- Uprawnienie `statsTab` jest binarne (jest/nie ma).
- Lista lat w statystykach wynika z danych gier i jest wspólna dla wszystkich.
- Brak filtra dostępnych lat per gracz.

## Proponowany model danych (rekomendowany)
Dodać do rekordu gracza w `app_settings/player_access.players[]` pole:
- `statsYearsAccess: number[]`

Przykład:
- GraczA: `statsTab=true`, `statsYearsAccess=[2026, 2025]`
- GraczB: `statsTab=true`, `statsYearsAccess=[2025, 2024]`

Interpretacja:
- `statsTab=false` => brak dostępu do zakładki niezależnie od lat.
- `statsTab=true` i pusta lista lat => wariant do decyzji:
  - (A) brak dostępu do danych (najbezpieczniej),
  - (B) dostęp do wszystkich lat (wsteczna kompatybilność).

Rekomendacja: **wariant A** + komunikat UI „Administrator nie przypisał jeszcze żadnych lat”.

## Zmiany UI (administrator)
### Opcja 1 (najbardziej czytelna) — dedykowany modal „Lata statystyk”
W istniejącym modalu uprawnień gracza:
1. Przy checkboxie „Statystyki” dodać przycisk `Lata` (aktywny tylko gdy checkbox zaznaczony).
2. Po kliknięciu otworzyć modal z listą lat jako checkboxy.
3. Lista lat generowana dynamicznie na podstawie dostępnych lat w grach.
4. Zapis do `statsYearsAccess` dla konkretnego gracza.

Plusy:
- bardzo czytelne i skalowalne,
- łatwe do rozszerzenia (np. zakresy lat, szybkie akcje „zaznacz wszystkie”).

Minusy:
- dodatkowy modal i więcej logiki UI.

### Opcja 2 (pomysł użytkownika) — „+” przy uprawnieniu „Statystyki”
1. Obok checkboxa „Statystyki” dodać ikonę/btn `+`.
2. Rozwinąć inline listę lat z checkboxami.

Plusy:
- szybkie, mniej kliknięć.

Minusy:
- łatwo o przeładowanie modalu uprawnień,
- słabsza czytelność przy wielu latach.

## Zmiany UI (gracz / Strefa Gracza)
1. Po poprawnym PIN i weryfikacji `statsTab` wyliczyć `allowedYears` dla zweryfikowanego gracza.
2. W panelu lat po lewej renderować tylko lata z przecięcia:
   - lat istniejących w danych,
   - lat dozwolonych w `statsYearsAccess`.
3. Jeżeli brak lat po filtrze, pokazać status:
   - „Brak przypisanych lat do podglądu statystyk.”
4. Eksport XLSX ograniczyć do aktualnie dozwolonego roku.

## Zmiany backend/Firestore
- Brak nowej kolekcji; wystarczy rozszerzenie dokumentu `player_access` o pole `statsYearsAccess` per gracz.
- Nie jest wymagana migracja krytyczna, ale zalecane jest:
  1. dodać normalizację danych przy odczycie (`Array<number>`),
  2. fallback dla starszych rekordów bez pola.

## Bezpieczeństwo i egzekwowanie uprawnień
- Filtr lat ma działać po stronie UI zawsze po uwierzytelnieniu PIN.
- Dodatkowo zalecane:
  - walidacja dostępu do roku przy każdej zmianie `selectedYear`,
  - automatyczny fallback do pierwszego dozwolonego roku,
  - reset widoku przy utracie uprawnienia podczas aktywnej sesji (`onSnapshot`).

## Wpływ na istniejące funkcje
- Checkboxy widoczności kolumn (`visibleColumns`) nadal działają per rok.
- Dla gracza mają sens tylko w latach, do których ma dostęp.
- Administrator dalej widzi wszystkie lata (bez ograniczeń per gracz).

## Plan wdrożenia (iteracyjny)
1. Rozszerzyć model gracza o `statsYearsAccess` + normalizacja danych.
2. Dodać UI admina do edycji lat per gracz.
3. Odfiltrować listę lat w user stats view na podstawie zweryfikowanego gracza.
4. Dodać komunikaty pustego stanu i fallback wyboru roku.
5. Testy manualne:
   - GraczA: widzi 2026/2025,
   - GraczB: widzi 2025/2024,
   - brak przypisanych lat: brak dostępu do danych.

## Rekomendacja końcowa
Najlepszy kompromis UX/utrzymanie: **Opcja 1 (dedykowany modal „Lata statystyk”)**.
Daje przewidywalny interfejs, czytelny workflow dla admina i prostsze dalsze rozszerzenia uprawnień.
