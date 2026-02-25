Aplikacja składa się z dwóch modułów: "Main" i "Second".
Oba moduły działają niezależnie od siebie, ale korzystają z niektorych plików wpólnych. Dzielone foldery to: Analizy, Pliki, config.
Oba moduły mają też wspólny plik DetaleLayout.md.
Moduł "Second" ma też pełen dostęp do odczytu danych z folderów "Main" i "docs", ale nie może ich modyfikować.

1. Po każdej zmianie kodu zmodyfikuj pliki Second/docs/Documentation.md oraz Second/docs/README.md
2. Plik README.md ma zawierać instrukcje obsługi dla użytkownika
3. Instrukcja w README.md ma być bardzo dokładna - co i gdzie kliknąć dla uzyskania jakiegoś efektu (dodanie stołu, dodanie gracza, zmiana stawki itp).
4. Instrukcja w Second/docs/REAMDE.md ma na celu opisanie wszystkich funkcji UI dla użytkownika, który pierwszy raz ma kontakt z aplikacją
5. Instrukcja w Second/docs/README.md ma zawierać tylko informacje pod kątem UI. Bez informacji backendowych
6. Plik Second/docs/Documentation.md ma zawierać dokładny opis kodu. Wszystkich funkcji, użytych styli, fontów, zasad działania poszczególnych elementów itp.
7. Plik Second/docs/Documentation.md ma służyć do tego, żeby inny użytkownik tylko czytając dokumentację mógł odtworzyć aplikację
8. Plik Second/docs/Documentation.md ma zawierać dokładne dane backendowe
9. Każda zmiana dotycząca wyglądu jakiegoś elementu musi mieć odzwierciedlenie w zawartości pliku DetaleLayout.md
10. Plik DetaleLayout.md to repozytorium użytych fontów, styli, kolorów itp.
11. Jeżeli zmiana dotyczny wyglądu pod kątem szerokości kolumn, wyrównania itp to zaktualizuj plik Second/Kolumny.md
12. W pliku Second/Kolumny.md ma być spis wszystkich kolumn występujących w aplikacji wraz ze wskazaniem dokładnie w którym miejscu aplikacji one występują. Plik ma nie zawierać danych technicznych tylko opisowe (np. wyrównanie do lewej). Plik ma zawierać informacje dotyczące formatowania zarówno w wersji PC jak i mobilnej
13. Jeżeli polecenie użytkownika nie dotyczy zmiany kodu a tylko analizy to wnioski zapisz w folderze Analizy w nowoutworzonym pliku o odekwatnej nazwie do przeprowadzanej analizy
14. Jeżeli zapisujesz plik z wynikami analizy to w pliku uwzględnij prompt użytkownika, żeby zachować kontekst zapisanych odpowiedzi
15. Folderu Analizy nie uwzględniaj w żadnych dokumentacjach i instrukcjach
16. W plikach Second/docs/Documentation.md, Second/docs/README.md, Kolumny.md, DetaleLayoutu.md nie przechowuj archiwalnych informacji. Mają tam być tylko aktualne informacje a nie historia zmian.
17. Jeżeli zmiana dotyczy edycji lub dodania nowgo pola to przeczytaj analizę Analizy/Wazne_Fokus i zadbaj, żeby nie wystąpił ten błąd
