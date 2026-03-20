# Checklista testów ręcznych modułów Main i Second

## Cel dokumentu
Ta checklista opisuje bardzo dokładnie, krok po kroku, jak ręcznie sprawdzić najważniejsze funkcje modułów `Main` i `Second`, w tym nowe mechanizmy półfinału, finału, wypłat i obliczeń rebuy.

---

## 1. Przygotowanie środowiska testowego

1. Otwórz aplikację `Main/index.html` w jednej karcie przeglądarki.
2. Otwórz aplikację `Second/index.html` w drugiej karcie przeglądarki.
3. Jeśli chcesz testować panel administratora, otwórz obie aplikacje z parametrem `?admin=1`.
4. Upewnij się, że oba moduły mają połączenie z tym samym Firebase.
5. Do testów modułu `Second` przygotuj co najmniej 10 graczy, żeby było widać logikę miejsc, eliminacji i wypłat.
6. Dobrze jest przygotować przykładowe dane testowe:
   - BUY-IN: 100
   - REBUY/ADD-ON: 100
   - RAKE: 10
   - STACK: 10000
   - REBUY/ADD-ON STACK: 10000
7. Do testu nowych funkcji w `Second` przygotuj przykładowo 10 graczy o nazwach: `G1`, `G2`, `G3`, `G4`, `G5`, `G6`, `G7`, `G8`, `G9`, `G10`.

---

## 2. Checklista modułu Main

### 2.1. Start aplikacji i podstawowa nawigacja

1. Otwórz `Main/index.html`.
2. Sprawdź, czy w prawym górnym rogu widać ikonę oraz przycisk **Instrukcja**.
3. Kliknij **Instrukcja**.
4. Sprawdź, czy otwiera się modal z opisem.
5. Zamknij modal przyciskiem `×`.
6. Jeśli jesteś w trybie admina, sprawdź, czy widać panel administratora oraz panel użytkownika.

### 2.2. Aktualności

1. W panelu administratora przejdź do zakładki **Aktualności**.
2. Wpisz przykładową wiadomość testową, np. `Test aktualności Main`.
3. Kliknij **Wyślij**.
4. W panelu użytkownika przejdź do zakładki **Aktualności**.
5. Sprawdź, czy wyświetla się właśnie zapisana wiadomość.
6. Kliknij w nagłówku użytkownika **Odśwież**.
7. Sprawdź, czy zawartość nadal jest poprawna.

### 2.3. Regulamin

1. W panelu administratora przejdź do zakładki **Regulamin**.
2. Wpisz lub zmień fragment tekstu.
3. Zapisz zmiany zgodnie z dostępnym UI.
4. W panelu użytkownika przejdź do zakładki **Regulamin**.
5. Sprawdź, czy użytkownik widzi aktualną wersję tekstu.

### 2.4. Gracze i PIN-y

1. W panelu administratora przejdź do zakładki **Gracze**.
2. Dodaj kilku graczy.
3. Dla każdego gracza wpisz nazwę i PIN lub użyj generatora PIN, jeśli jest dostępny.
4. Nadaj uprawnienia co najmniej jednemu graczowi do sekcji użytkownika.
5. Zapisz dane.
6. W panelu użytkownika przejdź do **Strefa Gracza**.
7. Wpisz PIN jednego z graczy i kliknij **Otwórz**.
8. Sprawdź, czy pojawiają się tylko te sekcje, do których gracz ma uprawnienia.

### 2.5. Czat

1. W panelu administratora upewnij się, że wybrany gracz ma uprawnienie do czatu.
2. W panelu użytkownika przejdź do sekcji **Czat**.
3. Wpisz PIN gracza i kliknij **Otwórz**.
4. Wpisz wiadomość testową.
5. Kliknij **Wyślij**.
6. Sprawdź, czy wiadomość pojawia się na liście.
7. Jeśli masz drugą kartę lub drugiego gracza, sprawdź, czy wiadomość jest widoczna także tam.

### 2.6. Gry do potwierdzenia

1. W panelu administratora dodaj lub przygotuj grę, którą użytkownik może potwierdzić.
2. W panelu użytkownika przejdź do **Gry do Potwierdzenia**.
3. Wpisz PIN i kliknij **Otwórz**.
4. Sprawdź, czy na liście pojawia się gra.
5. Kliknij **Potwierdź**.
6. Sprawdź, czy status przy tej grze się zmienia.
7. Kliknij **Anuluj**.
8. Sprawdź, czy potwierdzenie znika.
9. Kliknij **Szczegóły** i sprawdź, czy otwiera się modal z danymi gry.
10. Kliknij **Notatki do gry** i sprawdź, czy modal otwiera się poprawnie.

### 2.7. Gry użytkowników

1. W panelu użytkownika przejdź do **Gry Użytkowników**.
2. Wpisz PIN z odpowiednim uprawnieniem.
3. Kliknij **Otwórz**.
4. Kliknij **Dodaj**.
5. Sprawdź, czy pojawia się nowy wiersz gry.
6. Ustaw typ gry, datę i nazwę.
7. Kliknij **Szczegóły**.
8. W modalu kliknij **Dodaj** i dodaj uczestników.
9. Uzupełnij pola `Wpisowe`, `Rebuy/Add-on`, `Wypłata`, `Punkty`.
10. W kolumnie `Rebuy/Add-on` kliknij przycisk z wartością.
11. W modalu `Rebuy gracza` dodaj kilka wpisów `Rebuy`.
12. Zamknij modal i sprawdź, czy suma na przycisku została zaktualizowana.
13. Sprawdź, czy podsumowania pod grą przeliczają się automatycznie.

### 2.8. Statystyki

1. W panelu użytkownika przejdź do **Statystyki**.
2. Wpisz PIN z uprawnieniem do statystyk.
3. Kliknij **Otwórz**.
4. Przełącz kilka lat na panelu bocznym.
5. Sprawdź, czy zmieniają się dane tabeli i rankingu.
6. Kliknij **Eksportuj**, jeśli przycisk jest dostępny.
7. Sprawdź, czy eksport przebiega poprawnie.

---

## 3. Checklista modułu Second — pełny scenariusz turniejowy

## 3.1. Przygotowanie danych podstawowych

1. Otwórz `Second/index.html?admin=1`.
2. Wejdź do panelu turniejowego.
3. W sekcji **Losowanie Graczy** / `players` dodaj 10 graczy.
4. Dla każdego gracza wpisz nazwę oraz PIN.
5. Ustaw metadane turnieju:
   - `ORGANIZATOR`
   - `BUY-IN`
   - `REBUY/ADD-ON`
   - `RAKE`
   - `STACK`
   - `REBUY/ADD-ON STACK`
6. Sprawdź, czy po odświeżeniu strony dane nadal są zapisane.

## 3.2. Losowanie stołów

1. Przejdź do panelu **Losowanie Graczy**.
2. Kliknij **Dodaj stół** tyle razy, aby utworzyć co najmniej 2 stoły.
3. Nadaj stołom nazwy.
4. W wierszach graczy przypisz każdego gracza do stołu.
5. Sprawdź, czy pod każdym stołem pojawiają się przypisani gracze.
6. Sprawdź, czy `ŁĄCZNA SUMA` nad stołem przelicza się automatycznie.

## 3.3. Panel Wpłaty i modal Rebuy gracza

1. Przejdź do panelu **Wpłaty**.
2. W `Tabela12` kliknij przycisk w kolumnie `REBUY` dla gracza `G1`.
3. W modalu wpisz np. `100` w `Rebuy1`.
4. Kliknij **Dodaj Rebuy** i wpisz `200` w `Rebuy2`.
5. Zamknij modal.
6. Sprawdź, czy przycisk w `Tabela12` pokazuje sumę `300`.
7. Powtórz podobny test dla kilku kolejnych graczy, aby mieć co najmniej 5–6 wpisów rebuy.
8. Zanotuj kolejność wpisów rebuy, bo będzie potrzebna w teście `Tabela16`.

## 3.4. Panel Podział Puli — test obliczeń Tabela16

1. Przejdź do panelu **Podział Puli**.
2. Sprawdź `Tabela13` i `Tabela14`.
3. Upewnij się, że w `Tabela14` procent jest zgodny z wpisanym `RAKE`.
4. Odszukaj `Tabela16`.
5. Sprawdź, czy pojawiły się kolumny `REBUY1`, `REBUY2`, `REBUY3` itd.
6. Dla każdego z pierwszych maksymalnie 30 rebuy sprawdź, czy wartość jest liczona według wzoru:
   - `wartość rebuy z modala × (1 - procent z Tabela14)`.
7. Przykład testu:
   - jeśli w modalu wpisano `100`,
   - a `RAKE` wynosi `10`,
   - to w `Tabela16` powinno się pojawić `90`.
8. Sprawdź kilka różnych rebuy, np. `100`, `200`, `300`.
9. Zweryfikuj, czy `SUMA` w wierszu uwzględnia już te pomniejszone wartości rebuy.
10. Jeśli masz więcej niż 30 kolumn rebuy, sprawdź, czy `Rebuy31+` pozostają ręcznie edytowalne.

## 3.5. Faza grupowa — Tabela19 / Tabela19A / Tabela19B

1. Przejdź do panelu **Faza Grupowa**.
2. W `Tabela19` zaznacz `ELIMINATED` dla kilku graczy, np. `G1`, `G2`, `G3`.
3. Sprawdź, czy ci gracze znikają z `Tabela19B` i pojawiają się w `Tabela19A`.
4. Sprawdź, czy w `Tabela19A` dostają LP `1`, `2`, `3`.
5. Kliknij strzałkę `▼` lub `▲` przy jednym z graczy.
6. Sprawdź, czy zmienia się kolejność graczy w `Tabela19A`.
7. Odśwież stronę.
8. Sprawdź, czy kolejność nadal jest zachowana.
9. W `Tabela19B` wpisz stacki dla graczy, którzy pozostali w grze.
10. Sprawdź, czy kolumna `%` reaguje na wpisane stacki.

## 3.6. Półfinał — Tabela21 / Tabela22 / Tabela22A / Tabela FINAŁOWA

1. Przejdź do panelu **Półfinał**.
2. W `Tabela21` sprawdź, czy widzisz tylko graczy z `Tabela19B`.
3. Kliknij **Dodaj nowy stół** co najmniej 2 razy.
4. Nadaj stołom półfinałowym nazwy.
5. Przypisz graczy z `Tabela21` do stołów półfinałowych przez listę `STÓŁ`.
6. Sprawdź, czy gracze pojawiają się w odpowiednich kartach `Tabela22`.
7. Sprawdź, czy `ŁĄCZNY STACK` jest widoczny obok nazwy stołu, ale nie występuje już jako osobna kolumna wewnątrz tabeli stołu.
8. W `Tabela22` zaznacz `ELIMINATED` dla dwóch graczy, np. `G4` i `G5`.
9. Sprawdź, czy ci gracze pojawiają się automatycznie w `Tabela22A`.
10. Sprawdź, czy w `Tabela22A` mają LP `1` i `2`.
11. Kliknij strzałki `▲/▼` w `Tabela22A`.
12. Sprawdź, czy kolejność w `Tabela22A` się zmienia.
13. Odśwież stronę.
14. Sprawdź, czy kolejność i zaznaczenia `ELIMINATED` nadal są zachowane.
15. Sprawdź `Tabela FINAŁOWA`.
16. Zweryfikuj, czy pokazuje tylko graczy przypisanych do stołów półfinałowych i niewyeliminowanych w półfinale.
17. Sprawdź, czy `STACK` w `Tabela FINAŁOWA` jest tylko do odczytu.
18. Sprawdź, czy `%` liczy się od `ŁĄCZNY STACK` z `Tabela18`.

## 3.7. Finał — Tabela23

1. Przejdź do panelu **Finał**.
2. Sprawdź, czy `Tabela23` pokazuje tych samych graczy i te same wartości co `Tabela FINAŁOWA` z panelu **Półfinał**.
3. Sprawdź, czy wiersze są posortowane malejąco po `STACK`.
4. Sprawdź, czy `STACK` nie da się edytować.
5. Sprawdź, czy na końcu tabeli jest kolumna `ELIMINATED` z checkboxami.
6. Zaznacz `ELIMINATED` dla jednego z finalistów.
7. Odśwież stronę.
8. Sprawdź, czy checkbox nadal jest zaznaczony.
9. Odznacz checkbox.
10. Ponownie odśwież stronę.
11. Sprawdź, czy stan znowu został poprawnie zapamiętany.

## 3.8. Wypłaty — Tabela24

1. Przejdź do panelu **Wypłaty**.
2. Sprawdź, czy liczba wierszy w `Tabela24` jest równa liczbie wszystkich graczy dodanych na początku.
3. Sprawdź, czy wiersze końcowych miejsc są obsadzane zgodnie z `Tabela19A`:
   - gracz z LP=1 w `Tabela19A` ma ostatnie miejsce w `Tabela24`,
   - gracz z LP=2 w `Tabela19A` ma przedostatnie miejsce.
4. Sprawdź, czy po wykorzystaniu `Tabela19A` kolejne wolne miejsca od końca zajmują gracze z `Tabela22A`.
5. Sprawdź, czy najwyższe pozostałe miejsca zajmują finaliści.
6. Jeśli w `Tabela23` zaznaczysz `ELIMINATED`, wróć do `Tabela24` i sprawdź, czy klasyfikacja zmieniła się od razu.
7. Zaznacz checkbox **Pokaż kolumnę POCZĄTKOWA WYGRANA**.
8. Sprawdź, czy kolumna się pojawia.
9. Dla miejsca 1 porównaj wartość z `Tabela16.KWOTA` w wierszu 1.
10. Dla miejsca 2 porównaj wartość z `Tabela16.KWOTA` w wierszu 2.
11. Dla dalszych miejsc sprawdź analogicznie przypisanie 1:1.
12. Jeżeli liczba miejsc jest większa niż liczba wierszy `Tabela16`, sprawdź, czy dalsze miejsca mają `0`.
13. Zaznacz checkbox **Pokaż kolumnę KOŃCOWA WYGRANA**.
14. Sprawdź, czy kolumna się pojawia.
15. Dla miejsca 1 porównaj wartość z `Tabela16.SUMA` w wierszu 1.
16. Dla miejsca 2 porównaj wartość z `Tabela16.SUMA` w wierszu 2.
17. Sprawdź kilka kolejnych miejsc.
18. Zweryfikuj, czy pól wygranych nie da się edytować ręcznie.
19. Odśwież stronę.
20. Sprawdź, czy stan widoczności obu kolumn nadal jest zachowany.

## 3.9. Test natychmiastowego wpływu checkboxów ELIMINATED

1. Otwórz równocześnie panele **Półfinał**, **Finał** i **Wypłaty** (np. w osobnych kartach lub przełączając sekcje).
2. W `Tabela22` zaznacz `ELIMINATED` dla gracza półfinałowego.
3. Sprawdź, czy od razu:
   - pojawia się on w `Tabela22A`,
   - znika z `Tabela FINAŁOWA`,
   - zmienia się obsada miejsc w `Tabela24`.
4. W `Tabela23` zaznacz `ELIMINATED` dla finalisty.
5. Sprawdź, czy od razu zmienia się kolejność w `Tabela24`.

## 3.10. Test pamiętania stanu po restarcie aplikacji

1. W `Tabela22` zaznacz kilku graczy jako `ELIMINATED`.
2. Ustaw kolejność w `Tabela22A`.
3. W `Tabela23` zaznacz `ELIMINATED` dla wybranego finalisty.
4. W `Tabela24` włącz obie kolumny wygranych.
5. Zrób pełne odświeżenie strony.
6. Zamknij kartę i otwórz aplikację ponownie.
7. Sprawdź, czy zostały zachowane:
   - checkboxy `ELIMINATED` w półfinale,
   - kolejność `Tabela22A`,
   - checkboxy `ELIMINATED` w finale,
   - widoczność kolumn wypłat.

---

## 4. Wynik końcowy testów

Po przejściu całej checklisty użytkownik powinien potwierdzić, że:

1. Moduł `Main` poprawnie obsługuje aktualności, regulamin, PIN-y, czat, gry i statystyki.
2. Moduł `Second` poprawnie liczy rebuy w `Tabela16` po potrąceniu rake.
3. `Tabela22A` automatycznie zbiera wyeliminowanych z półfinału i pozwala ustawiać kolejność.
4. `Tabela23` jest poprawnie zsynchronizowana z finałem, sortuje po `STACK` i pamięta checkboxy `ELIMINATED`.
5. `Tabela24` zawsze pokazuje wszystkich graczy i poprawnie przypisuje miejsca oraz wypłaty.
6. Wszystkie kluczowe checkboxy i ustawienia są trwałe między odświeżeniami i restartami aplikacji.
