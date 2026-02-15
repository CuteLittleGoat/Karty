1. Folder "Stymulator" to osobny moduł
2. Moduł "Symulator" ma własne pliki z dokumentacją
3. Zmian w module "Symulator" nie uwzględniaj w ogólej dokumentacji - modyfikuj jednak pliki DetaleLayout.md i Kolumny.md
4. Po każdej zmianie kodu zmodyfikuj pliki docs/Documentation.md oraz docs/README.md
5. Plik README.md ma zawierać instrukcje obsługi dla użytkownika
6. Instrukcja w README.md ma być bardzo dokładna - co i gdzie kliknąć dla uzyskania jakiegoś efektu (dodanie stołu, dodanie gracza, zmiana stawki itp).
7. Instrukcja w REAMDE.md ma na celu opisanie wszystkich funkcji UI dla użytkownika, który pierwszy raz ma kontakt z aplikacją
8. Instrukcja w README.md ma zawierać tylko informacje pod kątem UI. Bez informacji backendowych
9. Plik Documentation.md ma zawierać dokładny opis kodu. Wszystkich funkcji, użytych styli, fontów, zasad działania poszczególnych elementów itp.
10. Plik Documentation.md ma służyć do tego, żeby inny użytkownik tylko czytając dokumentację mógł odtworzyć aplikację
11. Plik Documentation.md ma zawierać dokładne dane backendowe
12. Każda zmiana dotycząca wyglądu jakiegoś elementu musi mieć odzwierciedlenie w zawartości pliku DetaleLayout.md
13. Plik DetaleLayout.md to repozytorium użytych fontów, styli, kolorów itp.
14. Jeżeli zmiana dotyczny wyglądu pod kątem szerokości kolumn, wyrównania itp to zaktualizuj plik Kolumny.md
15. Jeżeli polecenie użytkownika nie dotyczy zmiany kodu a tylko analizy to wnioski zapisz w folderze Analizy w nowoutworzonym pliku o odekwatnej nazwie do przeprowadzanej analizy
16. Jeżeli zapisujesz plik z wynikami analizy to w pliku uwzględnij prompt użytkownika, żeby zachować kontekst zapisanych odpowiedzi
17. Folderu Analizy nie uwzględniaj w żadnych dokumentacjach i instrukcjach