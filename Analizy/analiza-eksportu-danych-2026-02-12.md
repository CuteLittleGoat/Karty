# Analiza wdrożenia eksportu danych (xlsx, doc, txt, jpg)

## Prompt użytkownika
> Przeprowadź analizę wprowadzenia funkcjonalności eksportu danych.  
> Przy niektórych tabelach - np. "Statystyki" czy "Podsumowanie gry" chciałbym mieć przycisk Exportuj.  
> Naciśnięcie przycisku spowodowałoby zapisane danych z tabeli w formie pliku xlsx, doc, txt, jpg do pamięci urządzenia.  
> Przeprowadź analizę wdrożenia takiej funkcjonalności i czy jest możliwe zapisanie w każdym z podanych wyżej formatów.

---

## 1. Wnioski ogólne

Tak — wdrożenie eksportu jest możliwe w obecnej architekturze aplikacji webowej i da się zapisać dane dla wszystkich wskazanych formatów, ale z różnym poziomem „natywności”:

- **XLSX**: w pełni realne i rekomendowane.
- **TXT**: w pełni realne i bardzo proste.
- **JPG**: realne (zrzut tabeli do obrazu), wymaga zadbania o szerokie tabele i jakość.
- **DOC**: realne, ale trzeba doprecyzować:
  - albo **prawdziwy DOCX** (rekomendowane),
  - albo „zgodny” plik **.doc** oparty o HTML (działa, ale mniej profesjonalne i mniej przewidywalne).

Najlepsza praktyka: zaoferować użytkownikowi eksport **XLSX + DOCX + TXT + JPG**. Jeśli koniecznie ma być rozszerzenie `.doc`, można dodać tryb kompatybilny, ale warto oznaczyć go jako „legacy”.

---

## 2. Co już mamy w kodzie i dlaczego to pomaga

W aplikacji dane tabel nie są tylko w HTML — są także dostępne w logice JS, co bardzo ułatwia eksport „ze źródła”:

- Statystyki i podsumowania wyliczane są funkcjami operującymi na strukturach danych (`state`, mapy graczy, wiersze detali, metryki gry).
- Tabele są renderowane dynamicznie, więc można:
  1. eksportować z danych źródłowych (najlepiej), lub
  2. eksportować z aktualnego DOM (łatwiej dla JPG / szybki MVP).

To oznacza, że nie trzeba przebudowywać modelu danych — wystarczy dodać warstwę „adapterów eksportu” i przyciski „Exportuj”.

---

## 3. Analiza formatów

## 3.1 XLSX

**Możliwość:** TAK (bez problemu).  
**Sugerowana biblioteka:** `xlsx` (SheetJS).

### Zalety
- Zachowuje strukturę kolumn i wierszy.
- Wygodny do dalszej analizy i filtrowania.
- Dobrze pasuje do tabel „Statystyki” i „Podsumowanie gry”.

### Ryzyka
- Przy bardzo dużych tabelach trzeba uważać na wydajność po stronie przeglądarki (tu raczej bezpiecznie).

### Poziom trudności
- **Niski/średni**.

---

## 3.2 TXT

**Możliwość:** TAK (bardzo łatwo).  
**Mechanizm:** `Blob(['...'], { type: 'text/plain;charset=utf-8' })` + pobranie przez link.

### Zalety
- Minimalny narzut, brak ciężkich zależności.
- Szybki fallback, zawsze działa.

### Ograniczenia
- Brak formatowania tabeli (to zwykły tekst).
- Trzeba samodzielnie ustalić separator (np. tabulator `\t` lub `;`).

### Poziom trudności
- **Niski**.

---

## 3.3 JPG

**Możliwość:** TAK.  
**Sugerowana biblioteka:** `html2canvas`.

### Zalety
- Użytkownik dostaje „obraz tego co widzi”.
- Przydatne do szybkiego udostępniania (komunikator, galeria).

### Ograniczenia techniczne
- Szerokie tabele mogą się ucinać, jeśli renderowane w kontenerze z przewijaniem.
- Trzeba zwiększyć skalę renderu (`scale: 2` lub `3`) dla czytelności.
- Styl i czcionki muszą być załadowane przed generacją.

### Poziom trudności
- **Średni**.

---

## 3.4 DOC

**Możliwość:** TAK, ale są 2 warianty.

### Wariant A (rekomendowany): DOCX
- Biblioteka `docx` (npm) i zapis jako `.docx`.
- Najbardziej „czysty” i profesjonalny format dokumentu Word.

### Wariant B: pseudo-DOC (`.doc` jako HTML)
- Generujesz HTML tabeli i zapisujesz jako `.doc` z odpowiednim MIME.
- Działa w wielu przypadkach, ale kompatybilność i jakość mogą się różnić.

### Rekomendacja
- Jeśli wymaganie „doc” jest sztywne, zaimplementować oba:
  - **DOCX** jako domyślny,
  - **DOC (legacy)** jako opcja kompatybilności.

### Poziom trudności
- **Średni** (DOCX), **niski/średni** (legacy .doc).

---

## 4. Proponowana architektura wdrożenia

## 4.1 Warstwa eksportu

Dodać moduł (np. `Main/exporters.js`) z interfejsem:

- `exportTable({ format, fileName, columns, rows, title, meta })`

oraz implementacjami:
- `exportToXlsx(...)`
- `exportToTxt(...)`
- `exportToJpgFromElement(...)`
- `exportToDocx(...)` / `exportToDocLegacy(...)`

Dla tabel „Statystyki” i „Podsumowanie gry” przekazywać dane z logiki (nie z samego DOM), a dla JPG przekazywać referencję do konkretnego elementu tabeli.

## 4.2 UI

Przy wybranych sekcjach dodać przycisk **„Exportuj”** i menu formatów:

- XLSX
- DOCX / DOC
- TXT
- JPG

Minimalnie:
- jeden przycisk otwierający dropdown,
- komunikat o powodzeniu / błędzie,
- nazwa pliku wg schematu: `typ-sekcji_rok-data.format`.

## 4.3 Nazewnictwo plików

Przykładowo:
- `statystyki_2026-02-12.xlsx`
- `podsumowanie-gry_Gra-12_2026-02-12.docx`
- `statystyki_2026-02-12.txt`
- `statystyki_2026-02-12.jpg`

---

## 5. Zapis „do pamięci urządzenia” – jak to działa praktycznie

W aplikacji webowej zapis jest realizowany jako pobranie pliku przez przeglądarkę (download). To jest standard i z perspektywy użytkownika kończy się plikiem w pamięci telefonu/komputera (folder Pobrane albo lokalizacja wskazana przez system).

Uwaga praktyczna:
- Na niektórych mobilnych przeglądarkach obsługa pobierania może zależeć od ustawień lub gestu użytkownika (kliknięcie przycisku wymagane).
- Dla WebView mogą być dodatkowe wymagania integracyjne.

---

## 6. Ryzyka i decyzje produktowe przed implementacją

1. **Czy „doc” oznacza dokładnie `.doc`, czy akceptowalne jest `.docx`?**  
   To kluczowa decyzja.

2. **Czy eksport ma obejmować tylko widoczne kolumny, czy pełny zestaw danych?**

3. **Czy JPG ma zawierać dokładny wygląd UI (kolory, cieniowanie), czy tylko „czystą tabelę”?**

4. **Czy eksport ma działać tylko dla administratora, czy też dla użytkownika końcowego?**

5. **Czy potrzebny jest audyt eksportów (kto i kiedy pobrał)?**

---

## 7. Proponowany plan wdrożenia (iteracyjny)

### Etap 1 (szybki i bezpieczny)
- Eksport **TXT + XLSX** dla „Statystyki” i „Podsumowanie gry”.
- Jeden wspólny komponent przycisku i menu eksportu.

### Etap 2
- Eksport **JPG** z poprawą jakości i obsługą szerokich tabel.

### Etap 3
- Eksport **DOCX** (lub dodatkowo legacy `.doc`, jeśli nadal wymagane).

### Etap 4
- Dopracowanie UX (powiadomienia, nazwy plików, ewentualnie eksport wsadowy).

---

## 8. Ocena wykonalności na format (podsumowanie)

- **XLSX:** ✅ wykonalne, rekomendowane.
- **TXT:** ✅ wykonalne, bardzo proste.
- **JPG:** ✅ wykonalne, wymaga dopracowania dla dużych tabel.
- **DOC:** ✅ wykonalne, ale wymaga wyboru między DOCX (lepiej) a legacy DOC.

Końcowo: funkcjonalność jest możliwa do wdrożenia w całości. Najbardziej stabilny i praktyczny zestaw to **XLSX + DOCX + TXT + JPG**.
