w panelu "losowanie stołu" po dodaniu nowego stołu zmienić nazwę kolumny z "wpisowe" na "buy-in"  
_//Sprawdzić_


Zakładka "Tournament of Poker"
Panel "Losowanie Stołów".
Kolumna "status" - pole tekstowe. Zaciąga się z panelu "losowanie graczy" kolumna "status"
_//gotowe - są kolorowe pigułkiy_

kolumna "stół" pole tekstowe. utworzona lista stołów. stoły mają się nazywać stół 1,2,3 itd. Do 20
_//jest pole rozwijane. Zaciąga się taka nazwa jak w utworzonych stołach. nie ma limitu_

Kolumna "Nazwa" - pole tekstowe. Każdy dodany stół automatycznie będzie miał nadaną nazwę stół 1, stół 2 itd.
_//gotowe_

Kolumna "Łączna Suma" - pole obliczalne. Suma wartości z kolumny "Wpisowe" w danym stole.
_//gotowe_

Panel "Wpłaty"
Tabela 10 

kolumna "Buy-in" -  pole liczbowe. Zaciąga się z zakładki "lista graczy" pozycja buy-in
_//sprawdzić_

kolumna "Rebuy/add-on" - pole liczbowe. Zaciąga się z zakładki "lista graczy" pozycja rebuy
_//sprawdzić_

kolumna "Suma" - pole obliczalne. Suma wartości z kolumny "buy-in" Tabela 12 panel "wpłaty"
_//sprawdzić_

kolumna " Liczba rebuy/add-on" - pole obliczalne. suma wartości podawana  łącznie w sztukach- ile jest rebay przez całą grę ) zależy od ilości wypełnionych rebuy w tabeli 12 panel "wpłaty"
_//sprawdzić_

Tabela 11
Kolumna "%" - pole liczbowe. Zaciąga się z panelu "gracze" kolumna "rake" 
_//sprawdzić_

Kolumna "Rake" - pole obliczalne. Iloczyn wartości panel "wpłaty" tabela10 kolumna "suma" oraz panel "wpłaty" tabela11 kolumna "%" 
_//dokładnie sprawdzić bo nie wiem co dokładnie jest w kolumnie % i jak to się przeliczy_

Kolumna "Buy-in" - pole obliczalne. Suma wartości z kolumny buy-in panel "wpłaty" tabela 12. pomniejszona o kolumnę "%" panel "wpłaty" tabela 11
_//dokładnie sprawdzić bo nie wiem co dokładnie jest w kolumnie % i jak to się przeliczy_

Kolumna "Rebuy" - pole obliczalne. Suma wartości z kolumny rebuy panel "wpłaty" tabela 12. pomniejszona o kolumnę "%" panel "wpłaty" tabela 11
_//dokładnie sprawdzić bo nie wiem co dokładnie jest w kolumnie % i jak to się przeliczy_

Kolumna "Pot" - pole obliczalne. suma wartości z kolumny "buy-in" oraz "rebuy" tabela 11
_//dokładnie sprawdzić_

Tabela 12 
Kolumna "Stół" - pola tekstowe. Zaciąga się z panelu "Losowanie stołów" z dodanych do gry stołów kolumna "nazwa".
_//zaciągnie się jeżeli do stołu jest przypisany przynajmniej jeden gracz_

Kolumna "lp" - pole liczbowe. numeryczne- tyle ilu jest graczy.
_//gotowe_

Kolumna "Gracz" - pole tekstowe. Zaciąga się z panelu "Losowanie stołów" z dodanych do gry stołów kolumna "gracz".
_//gotowe_

Kolumna "GRACZE" muszą być odpowiednio przypisani do swoich "STOŁÓW"
_//gotowe_

Kolumna 'Buy-in" - pole liczbowe. zaciąga się z panelu  "losowanie stołu" dodane z wszystkich dodanych stołów kolumna "buy-in"
_//sprawdzić_

Kolumna "rebuy/add-on" - pole liczbowe, do uzupełniena. Możliwość dodania kolejnego ("przycisk" jeżeli gracz postanowi więcej razy się dokupić)
_//sprawdzić_

Panel "podział puli"
Tabela 13
Kolumna "Buy-in" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 10  kolumna "buy-in" 
_//sprawdzić_

Kolumna "Rebuy/add-on" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 10  kolumna "rebuy/add-on" 
_//sprawdzić_

Kolumna "Suma" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 10  kolumna "suma"
_//sprawdzić_

Kolumna "liczba rebuy" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 10  kolumna "liczba rebuy"
_//sprawdzić_

Tabela 14
Kolumna "%" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 11  kolumna "%" 
_//sprawdzić_

Kolumna "rake" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 11  kolumna "rake" 
_//sprawdzić_

Kolumna "buy-in" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 11  kolumna "buy-in"
_//sprawdzić_

Kolumna "Rebuy/add-on" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 11  kolumna "rebuy/add-on"  
_//sprawdzić_

Kolumna "Pot" - pole liczbowe. Zaciąga się z panelu "wpłaty" tabela 11  kolumna "pot"
_//sprawdzić_

Tabela 15
Kolumna "buy-in" - pole liczbowe. Zaciąga się z Tabeli 14 kolumna "buy-in"
_//sprawdzić_

Kolumna "podział" pole liczbowe. Jest to wartość z tabeli 15 kolumna "buy-in" minus (suma wszystkich wartości  w tabeli 16  kolumna "podział puli" miejsca od 4 w dół) 
_//sprawdzić_
 
SKASOWĆ PRZYCSIK "DODAJ" Z TABELI 15 I DODAĆ GO DO TABELI 16 
_//sprawdzić_

Tabela 16
Kolumna "lp" - pole liczbowe. Zależy od dodanych przeze mnie miejsc.
_//czyli co? bo teraz uzupełnia się sama_

Kolumna "Podział puli" - pole liczbowe. Do ręcznego wpisania
dla miesc:
-1-3: podział procentowy
-od 4 w dół: liczby całkowite
_//nie rozumiem_

Kolumna "Kwota" - pole liczbowe. Dla miejsc:
-1. iloczyn wartości tabela16 kolumna "podział puli" pozycja 1 razy tabela 15 kolumna "podział" 
-2. iloczyn wartości tabela16 kolumna "podział puli" pozycja 2 razy tabela 15 kolumna "podział" 
-3. iloczyn wartości tabela16 kolumna "podział puli" pozycja 3 razy tabela 15 kolumna "podział" 
- od 4 w dół. wartość zaciąga się z tabeli 16 kolumna "podział puli"

Kolumny "rebuy" - Pole liczbowe. Muszą być przypsiane tak jak Ci wypisywałem wcześniej w pliku "nowa apka"
 Każdy przypisany rebuy musi być pomniejszony o  RAKE tabela 14 kolumna "rake"
Podział przypisanych rebuy do miejsc. biorąc pod uwagę że będzie ich 30.
każdy następny rebay po 30. będą to puste pola z możliwością ręcznego wpisania warości liczbowej
_//bardzo dokładnie sprawdź_

Kolumna "mod" - pole liczbowe. puste do ręcznego wpisania. taka kolumna musi się znajdować po 12 rebay, 20 rebay i na samym końcu przed kolumną "suma"
_//sprawdzić_

Kolumna 'suma" - pole liczbowe.  jest to suma  wartości. kilku kolumn.  tabela16 kolumna "podział puli" konkretna pozycja plus przypisane rebuy do tego miejsca.
_//sprawdzić_
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………..………………………………………………………………………………………………………………………………………………………………………………………………..



Panel "Faza grupowa"
Tabela 17

Skasować nazwę kolumny Rebuy/add-on (w żetonach na os). zostawić tylko Rebuy/add-on
_//sprawdzić_

W tabeli 17 będą dwie kolumny po jednej wartości. resztę pustych moiejsc skasować
_//sprawdzić_

Kolumna "Stack gracza" - pole liczbowe. zaciąga się z panelu " losowanie graczy" kolumna "stack"
_//sprawdzić_

Kolumna "Rebuy/stack" - pole liczbowe. Zaciąga się z panelu "losowanie graczy" kolumna rebuy/add-on stack
_//sprawdzić_

Tabela 17A - skasować.
_//sprawdzić_

Tabela 18
w tej tabeli, nazwami kolumn są nazwy utworzonych stołów w panelu "Losowanie stołu" (stół 1 , stół2 itd.)
_//gotowe)_

a wartości w.w. kolumnach są  pola liczbowe. zaciągają się z tabeli 19 
_//nie napisałeś skąd ma się zaciągać. Strzelam, że kolumna Stack_

Tabela 19 Wszystko co wpisze w panelu "wpłaty tabela 12. musi się pojawić w tabeli 19, ale wartości liczbowe będą podane w żetonach panel "losowanie garczy" kolumny "stack i rebuy/add-on satck
_//nie rozumiem_
