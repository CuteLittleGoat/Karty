# Analiza migracji do nowych kolekcji (Main/Second) i przeniesienia danych

## Prompt użytkownika
"A czy migracja do nowych kolekcji (zmiany w kodzie) będzie skomplikowana do wykonania? Czy jest możliwe przeniesienie obecnie zapisanych danych?"

## Odpowiedź skrócona
- **Migracja jest wykonalna i zwykle średnio skomplikowana**, jeśli zostanie wykonana etapowo (najpierw przygotowanie nowych kolekcji, potem dual-read/dual-write, na końcu przełączenie).
- **Tak, przeniesienie obecnych danych jest możliwe**. Najbezpieczniej wykonać je skryptem migracyjnym (Admin SDK), z mapowaniem dokumentów i walidacją po migracji.

## Co wpływa na poziom trudności
1. **Liczba miejsc w kodzie, gdzie na sztywno wpisano nazwy kolekcji** (np. `chat_messages`, `admin_messages`, `UserGames`).
2. **Zależności między danymi** (np. `tables` + subkolekcje `rows` i `confirmations`).
3. **Spójność uprawnień** (Firestore Rules muszą rozpoznawać moduł: `main`/`second`).
4. **Czas niedostępności** — można zrobić migrację bez downtime, ale wymaga to okresu przejściowego.

## Czy przeniesienie danych jest możliwe?
**Tak.** Typowy scenariusz:
1. Tworzysz nowe kolekcje modułowe (`main_*`, `second_*` albo `modules/{moduleId}/...`).
2. Kopiujesz dane ze starych kolekcji do docelowych.
3. Zachowujesz mapowanie ID dokumentów tam, gdzie to ważne (np. odwołania, subkolekcje).
4. Po migracji uruchamiasz walidację ilościową i jakościową.
5. Przez krótki okres przejściowy zapisujesz dane równolegle (stare + nowe) albo blokujesz zapisy na czas końcowego przełączenia.

## Rekomendowany plan migracji (praktyczny)
1. **Inwentaryzacja**
   - Spis wszystkich kolekcji i subkolekcji używanych przez Main.
   - Spis wszystkich miejsc w kodzie, gdzie są użyte nazwy kolekcji.

2. **Warstwa konfiguracji kolekcji**
   - W kodzie zamienić „hardcoded strings” na konfigurację per moduł (np. `getCollections(moduleId)`).
   - Dzięki temu ta sama logika działa dla `main` i `second`.

3. **Przygotowanie Firestore**
   - Utworzyć docelowe kolekcje i dokumenty bazowe (jak w skrypcie bootstrap).
   - Zaktualizować reguły bezpieczeństwa pod nowy model.

4. **Migracja danych historycznych**
   - Skrypt Node.js (Admin SDK): kopiowanie dokumentów, subkolekcji i pól.
   - Dla danych Main: do `main_*`.
   - Dla danych Second: do `second_*` (jeśli istnieją źródła danych Second).

5. **Walidacja**
   - Porównanie liczby dokumentów per kolekcja (stare vs nowe).
   - Losowe porównanie rekordów i pól krytycznych.
   - Testy kluczowych funkcji UI po przełączeniu.

6. **Przełączenie aplikacji**
   - Etapowo: najpierw odczyt z nowych, potem zapis do nowych.
   - Po okresie stabilizacji wyłączenie starych kolekcji.

## Ryzyka i jak je ograniczyć
- **Ryzyko utraty części danych w czasie migracji**
  - Mitigacja: tryb read-only na czas finalnego cutover albo dual-write przez okno przejściowe.
- **Niespójne uprawnienia**
  - Mitigacja: najpierw wdrożyć i przetestować nowe Rules na środowisku testowym.
- **Niedopasowanie pól między starą i nową strukturą**
  - Mitigacja: tabela mapowań pól + raport po migracji.

## Odpowiedzi na pytania użytkownika
1. **Czy migracja do nowych kolekcji (zmiany w kodzie) będzie skomplikowana?**
   - **Średnio skomplikowana**, ale kontrolowalna. Największy koszt to uporządkowanie nazw kolekcji w kodzie i bezpieczne przełączenie odczytu/zapisu.

2. **Czy jest możliwe przeniesienie obecnie zapisanych danych?**
   - **Tak, jest możliwe** i standardowo realizowane skryptem migracyjnym z walidacją danych po przeniesieniu.
