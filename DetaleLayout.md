# Detale layoutu — aktualny stan

## Moduł Second — Tournament of Poker
- Sekcja renderowana dynamicznie do `#adminTournamentRoot`.
- Utrzymany motyw ciemny z istniejących klas `admin-data-table`, `admin-input`, `secondary`, `danger`.
- Dodane style statusu gracza jako checkbox-kółko: `.status-radio`.
- Dodane wyrównanie i tło dla pól `select` w turnieju: `#adminTournamentRoot select.admin-input`.
- Dodany czerwony komunikat testowy w sekcji Finał: `.test-controls-note`.
- SVG stołu pokerowego: `.poker-table-svg` (owal z obrysem złotym, pełna szerokość do 760px).
- Przyciski testowe w sekcji Finał są czerwone i opisane jako testowe (`.test-buttons .danger`).
- W widoku admina i użytkownika usunięto osobną zakładkę `Gracze`; konfiguracja graczy jest realizowana w sekcji turniejowej `Losowanie graczy`.
