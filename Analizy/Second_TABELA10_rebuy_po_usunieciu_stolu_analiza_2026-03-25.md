# Analiza modułu Second — TABELA10 (`LICZ. REBUY/ADD-ON`) i suma `RebuyX` po usunięciu stołu

Data: 2026-03-25
Moduł: `Second`

## Prompt użytkownika
> Przeprowadź analizę modułu "Second"
> Interesuje mnie kolumna "LICZ. REBUY/ADD-ON" w TABELA10 oraz jeszcze jedna sumująca wartości "RebuyX".
> Obecnie te kolumny są powiązane z graczem.
> Jeżeli mam gracza przypisanego do stołu, dodam mu wartości w kolumnach "RebuyX" to wartości w kolumnach sumujących liczbę i wartości z "RebuyX" działają prawidłowo.
> Jednak jeżeli usunę stół to wartość się nie zeruje.
> Żeby się wyzerowała muszę skasować gracza.
> Czy jest możliwość, żeby wartości mogły się kasować po usunięciu stołu?
> Przeprowadź analizę wprowadzenia takiego rozwiązania.

---

## 1) Co dzieje się obecnie (stan faktyczny)

### 1.1 Źródło danych dla TABELA10
W `Second/app.js` TABELA10 korzysta z:
- `rebuyCount` = liczba niepustych wpisów `RebuyX`,
- `rebuyTotal` = suma wartości `RebuyX`.

Obie wartości budowane są z funkcji `getAllTable12RebuyEntries()`, która filtruje wpisy **wyłącznie po istnieniu gracza** (`activePlayerIds`) i **nie filtruje** po przypisaniu gracza do stołu.

Skutek:
- usunięcie stołu czyści przypisania `assignments[playerId].tableId = ""`,
- ale gracz nadal istnieje,
- więc jego `payments.table12Rebuys[playerId]` dalej jest wliczane do TABELA10.

To dokładnie tłumaczy obserwowany efekt: wyzerowanie następuje dopiero po usunięciu gracza.

### 1.2 Logika usuwania stołu
Przy `data-role="delete-table"` aplikacja:
1. usuwa stół z `tables`,
2. czyści wpisy `tableEntries[tableId]`,
3. ustawia przypisania graczy do pustego stołu (`tableId = ""`),
4. NIE usuwa `payments.table12Rebuys[playerId]` dla tych graczy.

`getAutomaticRebuyResetDeletedPaths()` zeruje rebuy tylko w przypadku brzegowym: gdy jednocześnie nie ma żadnych graczy i stołów.

---

## 2) Odpowiedź na pytanie: czy można kasować wartości po usunięciu stołu?

Tak, jest to możliwe i dość bezpieczne, jeśli jasno zdefiniujemy regułę biznesową.

Kluczowa decyzja funkcjonalna:
- Czy rebuy ma być powiązany z **graczem globalnie w turnieju** (obecne zachowanie),
- czy z **aktywnym przypisaniem gracza do stołu** (oczekiwane przez zgłoszenie).

Z opisu zgłoszenia wynika, że oczekiwane jest drugie zachowanie.

---

## 3) Warianty implementacji

### Wariant A (minimalna zmiana, rekomendowany)
Przy usuwaniu stołu usuwać `payments.table12Rebuys[playerId]` dla graczy, którzy byli przypisani do tego stołu.

#### Plusy
- Czytelne i zgodne z oczekiwaniem „usuwam stół → znikają rebuy tych graczy”.
- Niewielki zakres zmian.
- TABELA10/TABELA11 i widoki użytkownika same się przeliczą bez dodatkowych zmian.

#### Minusy
- Operacja jest destrukcyjna (utrata danych rebuy dla tych graczy).
- Jeśli ktoś usunął stół „przypadkowo”, rebuy nie wróci po samym ponownym przypisaniu.

### Wariant B (niedestrukcyjny)
Nie kasować danych `table12Rebuys`, ale zmienić agregację TABELA10 tak, by brała tylko graczy aktualnie przypisanych do istniejących stołów.

#### Plusy
- Dane historyczne rebuy pozostają.
- „Wyzerowanie” po usunięciu stołu działa z punktu widzenia UI.

#### Minusy
- Dane „ukryte” pozostają w stanie i mogą wrócić po ponownym przypisaniu.
- Bardziej mylące przy debugowaniu i eksporcie danych.

### Wariant C (hybryda)
Filtracja jak w wariancie B + jawny przycisk „Wyczyść rebuy graczy bez stołu”.

#### Plusy
- Największa kontrola użytkownika.

#### Minusy
- Największy koszt UI/UX i testów.

---

## 4) Rekomendacja

Rekomenduję **Wariant A** jako najbliższy Twojemu oczekiwaniu i najprostszy do utrzymania.

Dodatkowo warto:
1. Pokazać `confirm()` przed usunięciem stołu:
   - np. „Usunięcie stołu skasuje także RebuyX przypisanych do graczy tego stołu”.
2. Dodać krótką adnotację w dokumentacji użytkownika (`Second/docs/README.md`).
3. Dodać adnotację techniczną w `Second/docs/Documentation.md` o tym, że `delete-table` czyści `payments.table12Rebuys` powiązanych graczy.

---

## 5) Zakres zmian technicznych (jeśli wdrożenie zostanie zlecone)

1. W `delete-table`:
   - zebrać listę `playerId` przypisanych do usuwanego `tableId`,
   - dla każdego usunąć `payments.table12Rebuys[playerId]`,
   - dopisać odpowiednie ścieżki do `deletedPaths`.

2. Sprawdzić wpływ na:
   - TABELA10 (`rebuyCount`, suma),
   - TABELA11 (`rebuyAddOn`, `pot`),
   - widok użytkownika (`userTournamentState.payments.table12Rebuys`).

3. Testy manualne scenariuszy:
   - dodanie gracza + rebuy + usunięcie stołu,
   - usunięcie stołu z wieloma graczami,
   - usunięcie stołu bez graczy,
   - ponowne dodanie stołu i przypisanie tych samych graczy.

---

## 6) Ryzyka i uwagi

- Największe ryzyko: niezamierzona utrata danych rebuy (dlatego zalecane potwierdzenie `confirm`).
- Brak zmian w strukturze Firestore — modyfikujemy tylko logikę utrzymania stanu.
- Obecna logika resetu globalnego (`brak graczy` i `brak stołów`) może pozostać jako dodatkowe zabezpieczenie.

---

## 7) Podsumowanie

Problem nie jest błędem rachunkowym, tylko efektem obecnej reguły danych: rebuy są przypisane do gracza globalnie, a nie do aktywnego stołu. Dlatego po usunięciu stołu wartości pozostają.

Wprowadzenie kasowania rebuy po usunięciu stołu jest możliwe. Najlepsza droga to czyszczenie `payments.table12Rebuys` dla graczy przypisanych do usuwanego stołu (Wariant A), opcjonalnie z potwierdzeniem użytkownika przed operacją.

---


## 8) Uzupełnienie (2026-03-25): co stanie się z numeracją `RebuyX` w wariantach z pkt 3

### Prompt użytkownika (uzupełnienie)
> Rozbuduj analizę Analizy/Second_TABELA10_rebuy_po_usunieciu_stolu_analiza_2026-03-25.md o wyjaśnienie co się stanie z numeracją "RebuyX" w wariantach opisanych w pkt3

Zakładam obecną strukturę danych: `table12Rebuys[playerId]` to obiekt/mapa pól typu `Rebuy1`, `Rebuy2`, `Rebuy3` itd.

### Wariant A (kasowanie `table12Rebuys[playerId]` po usunięciu stołu)
- Numeracja `RebuyX` dla gracza z usuwanego stołu **znika w całości**, bo usuwany jest cały węzeł `table12Rebuys[playerId]`.
- Gdy ten sam gracz później dostanie nowy stół i znów zacznie wpisywać rebuy, numeracja startuje od początku (praktycznie od `Rebuy1`, a kolejne indeksy są tworzone wg aktualnej logiki dodawania pozycji).
- Nie ma ryzyka „dziur” po starych numerach, bo stare wpisy już nie istnieją.

### Wariant B (brak kasowania danych, tylko filtrowanie w agregacji)
- Numeracja `RebuyX` w danych **nie zmienia się** i nie jest resetowana.
- Po usunięciu stołu wpisy `RebuyX` stają się tylko „niewidoczne” dla TABELA10/TABELA11 (bo gracz bez stołu nie jest uwzględniany w agregacji).
- Po ponownym przypisaniu gracza do stołu stare `RebuyX` wracają; nowy wpis dostanie kolejny numer po najwyższym istniejącym indeksie (np. po `Rebuy3` pojawi się `Rebuy4`).
- Efekt uboczny: użytkownik może odebrać to jako „samoczynny powrót” starych rebuy.

### Wariant C (hybryda: filtrowanie + ręczne czyszczenie)
- Domyślnie zachowuje się jak Wariant B: numeracja pozostaje i może zostać wznowiona od kolejnego indeksu.
- Dopiero użycie akcji „Wyczyść rebuy graczy bez stołu” usuwa historyczne wpisy i tym samym resetuje numerację jak w Wariancie A.
- W praktyce numeracja zależy od momentu czyszczenia:
  - **przed czyszczeniem**: kontynuacja numerów,
  - **po czyszczeniu**: start od początku (`Rebuy1`).

### Wniosek praktyczny
Jeżeli oczekiwane jest, aby po usunięciu stołu nie tylko znikały sumy, ale też nie wracały wcześniejsze pozycje i numeracja zaczynała „na czysto”, to tylko Wariant A (lub Wariant C z wykonanym czyszczeniem) daje taki efekt jednoznacznie i przewidywalnie.

