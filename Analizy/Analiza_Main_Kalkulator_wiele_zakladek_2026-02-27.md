# Analiza modułu Main — kalkulator (wiele zakładek Cash/Tournament)

## Prompt użytkownika
"Przeprowadź analizę modułu Main. Docelowo chciałbym w zakładce \"Kalkulator\" więcej zakładek \"Cash\" i \"Tournamet\". Obecnie jest po jednej z każdego rodzaju. Chciałbym np. \"Cash1\", \"Cash2\" - mechanika tabel i obliczenia byłyby identyczne, ale zapis musiałby być niezależnie od siebie. Przeprowadź analizę czy obecna struktura Firebase może to obsłużyć czy jest wymagana modyfikacja?"

## Zakres analizy
- Moduł: `Main`
- Obszar: zakładka administratora `Kalkulator`
- Cel: ocena, czy obecny model danych Firestore wspiera wiele niezależnych kalkulatorów per typ (`Cash`, `Tournament`), np. `Cash1`, `Cash2`, `Tournament1`, `Tournament2`.

## Stan obecny (wnioski z kodu)
1. UI kalkulatora ma obecnie tylko dwa przełączniki trybu: `Tournament` i `Cash`.
2. Dane kalkulatora zapisywane są w kolekcji Firestore `calculators`.
3. Identyfikator dokumentu jest równy trybowi (`doc(mode)`), czyli realnie używane są tylko 2 dokumenty:
   - `calculators/tournament`
   - `calculators/cash`
4. Odczyt snapshotów także jest na sztywno dla tablicy `['tournament', 'cash']`.

## Odpowiedź na pytanie: czy obecna struktura Firebase to obsłuży?

### Krótko
- **Firestore jako baza: TAK, może to obsłużyć bez zmiany technologii i bez fundamentalnej przebudowy kolekcji.**
- **Aktualna implementacja w kodzie: NIE, bo jest "na sztywno" ograniczona do 2 dokumentów (`cash` i `tournament`).**

### Szczegółowo
- Kolekcja `calculators` z natury może przechowywać dowolną liczbę dokumentów (np. `cash_1`, `cash_2`, `tournament_1`, `tournament_2`), więc sama struktura Firestore jest wystarczająco elastyczna.
- Ograniczenie wynika z logiki aplikacji, a nie z ograniczenia bazy:
  - zapis używa `doc(mode)` i akceptuje tylko dwa mode,
  - odczyt uruchamia snapshoty tylko dla dwóch mode,
  - stan aplikacji przewiduje tylko dwa obiekty (`state.cash`, `state.tournament`),
  - UI oferuje tylko dwa przyciski wyboru trybu.

## Czy wymagana jest modyfikacja?

### Wymagana modyfikacja kodu aplikacji
Tak — aby mieć wiele zakładek per typ i niezależny zapis, trzeba zmienić logikę identyfikacji "instancji kalkulatora".

### Modyfikacja struktury Firebase
- **Nie jest wymagana duża migracja strukturalna** (kolekcja `calculators` może pozostać).
- **Wymagana jest zmiana konwencji klucza dokumentu / modelu danych** (np. identyfikator instancji), bo obecne `doc(mode)` nadpisuje zawsze tylko 1 dokument na typ.

## Rekomendowany kierunek (architektura docelowa)
1. Wprowadzić pojęcie instancji kalkulatora:
   - `calculatorType`: `cash | tournament`
   - `calculatorId`: np. `cash1`, `cash2`, `tournament1`.
2. Zapis Firestore oprzeć o `calculatorId` (np. `calculators/{calculatorId}`) zamiast samego `mode`.
3. W dokumencie trzymać metadane (`type`, `name`, `order`, `updatedAt`) + payload tabel.
4. UI zakładki "Kalkulator" rozbudować o listę instancji (dodaj/usuń/zmień nazwę), a nie tylko przełącznik 2 trybów.
5. Dla kompatybilności można zrobić migrację "w locie":
   - jeśli istnieją tylko `cash` i `tournament`, pokazać je jako `Cash1` i `Tournament1`.

## Ryzyka i uwagi
1. W kodzie działa globalna ochrona przed usunięciem ostatniego dokumentu w top-level collection — dotyczy też `calculators`; trzeba to uwzględnić, jeśli planowane będzie usuwanie instancji kalkulatora.
2. Należy rozważyć sortowanie i stabilne nazewnictwo instancji, aby kolejność zakładek była przewidywalna.
3. Jeżeli oba typy mają różne schematy payloadu (obecnie mają), warto zachować walidację zależną od `calculatorType`.

## Wniosek końcowy
- **Sama obecna struktura Firestore jest wystarczająca do obsługi wielu niezależnych zakładek kalkulatora.**
- **Wymagana jest modyfikacja warstwy aplikacyjnej (UI + logika zapisu/odczytu), ponieważ obecnie kod obsługuje tylko po jednym dokumencie na typ (`cash`, `tournament`).**
