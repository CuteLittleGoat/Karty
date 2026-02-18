1. Po każdej zmianie kodu zmodyfikuj pliki docs/Documentation.md oraz docs/README.md
2. Plik README.md ma zawierać instrukcje obsługi dla użytkownika
3. Instrukcja w README.md ma być bardzo dokładna - co i gdzie kliknąć dla uzyskania jakiegoś efektu (dodanie stołu, dodanie gracza, zmiana stawki itp).
4. Instrukcja w REAMDE.md ma na celu opisanie wszystkich funkcji UI dla użytkownika, który pierwszy raz ma kontakt z aplikacją
5. Instrukcja w README.md ma zawierać tylko informacje pod kątem UI. Bez informacji backendowych
6. Plik Documentation.md ma zawierać dokładny opis kodu. Wszystkich funkcji, użytych styli, fontów, zasad działania poszczególnych elementów itp.
7. Plik Documentation.md ma służyć do tego, żeby inny użytkownik tylko czytając dokumentację mógł odtworzyć aplikację
8. Plik Documentation.md ma zawierać dokładne dane backendowe
9. Każda zmiana dotycząca wyglądu jakiegoś elementu musi mieć odzwierciedlenie w zawartości pliku DetaleLayout.md
10. Plik DetaleLayout.md to repozytorium użytych fontów, styli, kolorów itp.
11. Jeżeli zmiana dotyczny wyglądu pod kątem szerokości kolumn, wyrównania itp to zaktualizuj plik Kolumny.md
12. Jeżeli polecenie użytkownika nie dotyczy zmiany kodu a tylko analizy to wnioski zapisz w folderze Analizy w nowoutworzonym pliku o odekwatnej nazwie do przeprowadzanej analizy
13. Jeżeli zapisujesz plik z wynikami analizy to w pliku uwzględnij prompt użytkownika, żeby zachować kontekst zapisanych odpowiedzi
14. Folderu Analizy nie uwzględniaj w żadnych dokumentacjach i instrukcjach
15. W plikach docs/Documentation.md, docs/README.md, Kolumny.md, DetaleLayoutu.md nie przechowuj archiwalnych informacji. Mają tam być tylko aktualne informacje a nie historia zmian.
16. W głównym folderze jest plik test.json - Umożliwia on pełen dostęp do Firebase. Możesz dowolnie modyfikować kolekcje poza trzema: Nekrolog_refresh_jobs, Nekrolog_config i Nekrolog_snapshots - one służą do innego projektu
17. Jeżeli zmiana dotyczy edycji lub dodania nowgo pola to przeczytaj analizę Analizy/Wazne_Fokus i zadbaj, żeby nie wystąpił ten błąd
