1. Aplikacja składa się z dwóch modułów: "Main" i "Second".
2. Oba moduły działają niezależnie od siebie, ale korzystają z niektorych plików wpólnych. Dzielone foldery to: Analizy, Pliki, config.
3. Oba moduły mają też wspólne pliki DetaleLayout.md i Kolumny.md
4. Oba moduły mogą odczytywać pliki z folderów "Main" i "Second".
5. Szczegółowe informacje są w plikach AGENTS.md w folderze z każego z modułów
6. Jeżeli polecenie użytkownika nie dotyczy zmiany kodu a tylko analizy to wnioski zapisz w folderze Analizy w nowoutworzonym pliku o odekwatnej nazwie do przeprowadzanej analizy
7. Jeżeli zapisujesz plik z wynikami analizy to w pliku uwzględnij prompt użytkownika, żeby zachować kontekst zapisanych odpowiedzi
8. Folderu Analizy nie uwzględniaj w żadnych dokumentacjach i instrukcjach
9. Jeżeli polecenie użytkownika dotyczy zmiany w kodzie w oparciu o plik z analizą to po realizacji zadania należy zaktualizować plik z analizą o o sekcję ze wszystkimi zmianami w kodzie w każdym z plików w formacie cytując dokładne linie kodu przed i po zmianie np:
  Plik Second/app.js
  Linia 24
  Było:     return false;
  Jest:     return true;
