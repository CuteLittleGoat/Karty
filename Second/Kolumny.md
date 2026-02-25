# Second — Kolumny UI (aktualny stan)

## 1. Zakładka „Gracze” (admin i użytkownik)

### Widok PC
1. **Aplikacja**
   - Położenie: pierwsza kolumna tabeli „Gracze”.
   - Wyrównanie: do lewej.
   - Szerokość: standardowa, bez dodatkowego poszerzenia.
2. **Nazwa**
   - Położenie: druga kolumna tabeli „Gracze”.
   - Wyrównanie: do lewej.
   - Minimalna szerokość: szeroka kolumna na dłuższe nazwy (jak w `Main`, min. 30 znaków tekstu).
3. **PIN**
   - Położenie: trzecia kolumna tabeli „Gracze”.
   - Wyrównanie: do lewej.
   - Minimalna szerokość: wąska kolumna pod krótki kod PIN (jak w `Main`, min. 5 znaków tekstu).
4. **Uprawnienia**
   - Położenie: czwarta kolumna tabeli „Gracze”.
   - Wyrównanie: do lewej.
   - Szerokość: standardowa.
5. **(bez nazwy / akcje)**
   - Położenie: ostatnia kolumna tabeli „Gracze”.
   - Wyrównanie: do lewej.
   - Szerokość: standardowa dla przycisków akcji.

### Widok mobilny
- Tabela zachowuje ten sam układ kolumn i kolejność jak na PC.
- Przy mniejszej szerokości ekranu działa przewijanie poziome tabeli.
- Poszerzone kolumny „Nazwa” i „PIN” zachowują swoje minimalne szerokości, dzięki czemu zawartość nie jest ściskana.

## 2. Zakładka „Turniej”
Sekcja „Turniej” w aktualnym szkielecie UI nie zawiera tabel kolumnowych — ma układ panelowy (lewy panel przycisków + środkowa treść „Strona w budowie”).

## 3. Zakładki „Aktualności”, „Czat”, „Regulamin”
W tych zakładkach nie występują tabele kolumnowe wymagające opisu szerokości kolumn.
