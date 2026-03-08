Modyfikacja modułu Second.
Zakładka "Tournament of Poker"

1. Panel "Losowanie stołów"
1.1 Po przypisaniu gracza do stołu pojawia się kolumna "Wpisowe". Zmień jej nazwę na "BUY-IN".

2. Panel "Wpłaty"
2.1 Tabela10, kolumna "Buy-in" - ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "BUY-IN". Brak możliwości edycji tego pola w Tabela10
2.2 Tabela10, kolumna "REBUY/ADD-ON" - ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "REBUY/ADD-ON". Brak możliwości edycji tego pola w Tabela10
2.3 Tabela10, kolumna "Suma" - pole obliczalne. Ma to być suma wartości z kolumny BUY-IN z Tabela12 w panelu Wpłaty
2.3 Tabela10, kolumna "licz. REBUY/ADD-ON" - pole obliczalne. Ma to być ilość Rebuy w Tabela12 w panelu Wpłaty. Nie suma wartości. Ilość uzupełnionych kolumn "Rebuy" pod przyciskiem w kolumnie "Rebuy" w Tabela12 - łącznie u wszystkich graczy.
2.4 Tabela11, kolumna "%" - ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "RAKE". Brak możliwości edycji tego pola w Tabela11.
2.5 Tabela11, kolumna "Rake" - ma to być pole obliczalne. Iloczyn wartości z kolumny "Suma" w Tabela10 oraz wartości z kolumny "%" w Tabela11. Brak możliwości edycji tego pola w Tabela11.
2.6 Tabela11, kolumna "BUY-IN" - ma to być pole obliczalne. Suma wartości z kolumny buy-in panel "wpłaty" tabela 12. pomniejszona o kolumnę "%" panel "wpłaty" tabela 11. Brak możliwości edycji tego pola w Tabela11.
2.7 Tabela11, kolumna "REBUY/ADD-ON" - Ma to być pole obliczalne. Suma wartości z kolumny rebuy panel "wpłaty" tabela 12. pomniejszona o kolumnę "%" panel "wpłaty" tabela 11. Brak możliwości edycji tego pola w Tabela11.
2.8 Tabela11, kolumna "Pot" - Ma to być pole obliczalne. suma wartości z kolumny "buy-in" oraz "REBUY/ADD-ON" tabela 11. Brak możliwości edycji tego pola w Tabela11
2.9 Tabela12, kolumna "BUY-IN" - ma to być pole obliczalne. Suma wartości kolumn "Łączna Suma" w panelu "Losowanie stołów". W każdym wierszu ma być ta sama wartość.
2.10 Tabela12, kolumna "Rebuy" - ma to być przycisk. Po jego naciśnięciu ma się pojawić nowy modal "Rebuy gracza". Funkcjonalność jak w module "Main". Mają być przyciski do dodawania kolejnego Rebuy, mają się pojawiać kolumny "Rebuy1", "Rebuy2", "Rebuy3" itd. Licznik dla każdego gracza działa osobno. Na przycisku jest wyświetlana suma wartości Rebuy dla danego gracza. DODATKOWO zmodyfikuj modal "Rebuy Gracza" w module Main - przesuń przycisk do zamykania ("X") do prawej górnej krawędzi okna - to jedyna zmiana jaką możesz dokonać w module Main w ramach tego zadania. W module Second niech znak X służący do zamykania też będzie w prawym górnym rogu okna.

3. Panel "Podział puli"
3.1 Tabela13, kolumna "BUY-IN" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela10 kolumna "Buy-in". Brak możliwości edycji tego pola w Tabela13.
3.2 Tabela13, kolumna "REBUY/ADD-ON" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela10 kolumna "REBUY/ADD-ON". Brak możliwości edycji tego pola w Tabela13.
3.3 Tabela13, kolumna "SUMA" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela10 kolumna "SUMA". Brak możliwości edycji tego pola w Tabela13.
3.4 Tabela13, kolumna "LICZBA REBUY" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela10 kolumna "licz. REBUY/ADD-ON". Brak możliwości edycji tego pola w Tabela13.
3.5 Tabela14, kolumna "%" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela11 kolumna "%". Brak możliwości edycji tego pola w Tabela14.
3.6 Tabela14, kolumna "Rake" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela11 kolumna "Rake". Brak możliwości edycji tego pola w Tabela14.
3.7 Tabela14, kolumna "BUY-IN" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela11 kolumna "BUY-IN". Brak możliwości edycji tego pola w Tabela14.
3.8 Tabela14, kolumna "REBUY/ADD-ON" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela11 kolumna "REBUY/ADD-ON". Brak możliwości edycji tego pola w Tabela14.
3.9 Tabela14, kolumna "POT" - ma tu być przepisana wartość z panelu "Wpłaty" Tabela11 kolumna "POT". Brak możliwości edycji tego pola w Tabela14.
3.10 Tabela15, kolumna "BUY-In" - ma tu być przepisana wartość z Tabela14 kolumna "BUY-IN". Brak możliwości edycji tego pola w Tabela15.
3.10 Tabela15, kolumna "Podział" - Pole obliczalne. Wartość z kolumny "BUY-IN" w Tabela15 minus suma wartości w Tabela16 kolumna "podział puli" miejsca od 4 do ostatniego.
3.11 Przyciski "Dodaj" i "Usuń" usuń z Tabela15 i dodaj je do Tabela16
3.12 Tabela16, kolumna "Podział puli". Pole liczbowe. Aplikacja ma automatycznie dostawiać znak "%". Dla pierwszego wiersza domyślnie ma się wpisać wartość 0.50 (wyświetlana jako "50%"). Dla drugiego wiersza 0.30 (wyświetlana jako 30%). Dla trzeciego wiersza 0.20 (wyświetlana jako 20%). Użytkownik ma możliwość edytowania domyślnej wartości. Dla wierszy od 4 do końca nie ma domyślnej wartości. Jeżeli wartości nie sumują się do 100% to niech pojawi się czerwone ostrzeżenie (podobna funkcjonalność istnieje w module Main).
3.13 Tabela16, kolumna "Kwota" - pole obliczalne.
3.13.a Dla wiersza 1: iloczyn wartości tabela16 kolumna "podział puli" pozycja 1 razy tabela 15 kolumna "podział"
3.13.b Dla wiersza 2: iloczyn wartości tabela16 kolumna "podział puli" pozycja 2 razy tabela 15 kolumna "podział" 
3.13.c Dla wiersza 3: iloczyn wartości tabela16 kolumna "podział puli" pozycja 3 razy tabela 15 kolumna "podział"
3.13.d Dla wierszy 4 i dalej: wartość zaciąga się z Tabela16 kolumna "podział puli"
3.14 Tabela16, kolumna "Rebuy" - ma się utworzyć tyle kolumn "Rebuy" ile łącznie zostało utworzonych w Tabela12 w kolumnie "Rebuy". Pierwszy uzupełniony "Rebuy" ma się dodać do pierwszego wiersza. Drugi uzupełniony "Rebuy" ma się dodać do drugiego wiersza. Trzeci uzupełniony "Rebuy" ma się dodać do trzeciego wiersza. Czwarty uzupełniony "Rebuy" ma się dodać do czwartego wiersza. Piąty uzupełniony "Rebuy" ma się dopisać do pierwszego wiersza. Podonbna funkcjonalność istnieje w zakładce Kalkulator w Tabela5 w module Main. W tej tabeli algorytm ma się skończyć po 30 Rebuy. Jeżeli jest więcej to nad tabelą ma się pojawić czerwony napis "Rebuy do rozdysponowania XXX" gdzie "XXX" to suma Rebuy jakie nie zostały jeszcze przypisane. Użytkownik będzie mógł ręcznie dopisać brakującą kwotę Rebuy i jak rozpisze wszystkie to ostrzeżenie ma zniknać. Wszystkie wartości w tych kolumnach oraz w czerwonym ostrzeżeniu to ma być wartość "Rebuy" z Tabela12 pomniejszona o wartość w kolumnie "Rake" w Tabela14.
3.15 Tabela16, kolumna "Mod" - kolumna ta ma się znajdować po kolumnie "Rebuy12". Jeżeli jest mniej "Rebuy" to po ostatnim "Rebuy". Jeżeli jest więcej niż 12 kolumn "Rebuy" to mają się one znajdować między kolumną "Mod" a "Suma". Kolumna "Mod" to pole liczbowe do wpisania przez użytkownika.
3.16 Tabela16, kolumna "Suma" - suma wartości "Podział puli" oraz wszystkich kolumn "Rebuy" które są przypisane do danego wiersza.

4. Panel "Faza grupowa"
4.1 Tabela17, kolumna "REBUY/ADD-on(w żetonach na os)" - zmień nazwę na "REBUY/ADD-ON"
4.2 Tabela17 będzie zawierać tylko jeden wiersz. Pozostałe skasuj
4.3 Tabrla17, kolumna "STACK GRACZA" - Ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "STACK". Brak możliwości edycji tego pola w Tabela17
4.4 Tabela17, kolumna "REBUY/ADD-ON" - Ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "REBUY/ADD-ON STACK". Brak możliwości edycji tego pola w Tabela17
4.5 Tabela17A - tabela do skasowania.
4.6 Tabela18 - W kolumnach mających nazwy jak nazwy stołów wpisz wartość z kolumny "Stack" z Tabela19 z wiersza, który odpowiada danemu stołowi.
Czyli jak w Tabela19 jest wiersz o nazwie "Stół_Test" i w kolumnie "STACK" ma wartość 100 to w Tabela18 w kolumnie "Stół_Test" ma się pojawić wartość 100
4.7 Tabela18, kolumna "ŁĄCZNY STACK" - Suma wartości z kolumny "STACK" z Tabela19
4.8 Tabela19, kolumna "REBUY/add-on" - Ma tu być przepisana wartość z panelu "Wpłaty" Tabela12, kolumna "REBUY/add-on". Brak możliwości edycji tego pola w Tabela19
4.9 Tabela19, kolumna "REBUY" - Ma tu być przepisana wartość z panelu "Wpłaty" Tabela12, kolumna "REBUY". Brak możliwości edycji tego pola w Tabela19
4.10 Tabela19, kolumna "Stack" - Ma tu być przepisana wartość z panelu "Losowanie Graczy" kolumna "STACK". Brak możliwości edycji tego pola w Tabela19

Dodatkowo, dla ujednolicenia wszystkie nagłówki kolumn w całym module Second zrób z samych WIELKICH LITER, poza Tabela18 (ponieważ tam nazwy kolumn są zależne od tego co użytkownik wpisze w zakładce "Losowanie stołów").
