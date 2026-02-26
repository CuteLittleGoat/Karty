1. Aplikacja składa się z dwóch modułów: "Main" i "Second".
2. Oba moduły działają niezależnie od siebie, ale korzystają z niektorych plików wpólnych. Dzielone foldery to: Analizy, Pliki, config.
3. Oba moduły mają też wspólne pliki DetaleLayout.md i Kolumny.md
4. Oba moduły mogą odczytywać pliki z folderów "Main" i "Second".
5. Szczegółowe informacje są w plikach AGENTS.md w folderze z każego z modułów
6. Jeżeli polecenie użytkownika nie dotyczy zmiany kodu a tylko analizy to wnioski zapisz w folderze Analizy w nowoutworzonym pliku o odekwatnej nazwie do przeprowadzanej analizy
7. Jeżeli zapisujesz plik z wynikami analizy to w pliku uwzględnij prompt użytkownika, żeby zachować kontekst zapisanych odpowiedzi
8. Folderu Analizy nie uwzględniaj w żadnych dokumentacjach i instrukcjach
9. Jeżeli użytkownik pisze, że jakaś funkcjonalność nie działa to sprawedź też czy nie wymaga to modyfikacji w Firebase (strukturze, rules itp). Jeżeli tak to utwórz nowy plik w Analizy z dokładnym opisem co zmienić. Jeżeli wymagana jest zmiana Rules to zapisz zmiany w pliku Pliki/firestore.rules
10. Plik Pliki/firestore.rules ma być finalną wersją Rules do skopiowania do Firebase
