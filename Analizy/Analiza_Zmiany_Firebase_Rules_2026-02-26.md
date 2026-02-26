# Analiza wymaganych zmian w Firebase Rules (Main)

## Prompt użytkownika
> Sprawdź konfigurację Firebase i Rules.
> Na przykładzie zakładki "Aktualności". W widoku admina wpisałem wiadomość i mam kominikat:
> Wiadomość wysłana do graczy.
>
> W widoku użytkownika mam info:
> "Nie udało się pobrać wiadomości." zamiast wpisanej wiadomości i komunikat błędu: Sprawdź reguły Firestore i konfigurację projektu.
>
> W zakładce "Gracze" wyświetla mi "Nie udało się pobrać listy graczy.", mimo, że mam 3 graczy.
> Jest to oresznikak47@gmail.com i main.admin@example.com oraz main.player@example.com
> Czyli admin, którego ręcznie wpisałem w Firebase i chyba seed-admin i seed-player.
> Tych trzech graczy nie ma uzupełnionej nazwy.
> Jeżeli te wpisy są potrzebne do działania aplikacji to je ukryj z UI.
> Dodatkowo za każdym razem jak klikam "Odśwież" to w kolumnie "Uprawnienia" dane wyświetlają się w innej kolejności. Za każdym odświeżeniem są w innej.
>
> W kilku innych zakładkach np. "Gry admina", "Gry do potwierdzenia" mam jakieś ustawione gry, które chyba są domyślnymi wartościami z Firebase. Nie chcę mieć tego w aplikacji. Jeżeli jest to technicznie potrzebne to ukryj z UI
>
> Jest też błąd w zakładce "Regulamin". Po kliknięciu ZAPISZ wyświetla się komunikat "Zapisywanie regulaminu..." i na tym poprzestaje.
>
> Na górze strony mała być wyświetlana nazwa zalogowanego użytkownika oraz przycisk "Wyloguj" - nic takiego nie ma.
> W widoku użytkownika aplikacja wciąż pyta o PIN. Funkcjonalność PIN miała być całkowicie odpięta.
>
> Dodatkowo okno logowania nie wyświetla żadnego komunikatu błędu jak wpisuję niepoprawne dane.

## Co zmienić po stronie Firebase
1. Opublikować aktualny plik `Pliki/firestore.rules` do Firestore Rules.
2. Najważniejsze zmiany względem wcześniejszej wersji:
   - rola admina akceptuje także pole `isAdmin == true` (zgodność wsteczna),
   - `permissions` może być zarówno `map`, jak i `list`.
3. Zweryfikować dokument admina w `main_users/{uid}`:
   - wymagane: `role: "admin"` **lub** `isAdmin: true`.

## Dlaczego to jest wymagane
- Jeśli dokument admina nie spełnia warunku w `hasMainAdminRole()`, zapis do `main_app_settings` (Regulamin) i odczyt pełnej listy `main_users` będzie odrzucany przez Firestore (`permission-denied`).
- Jeśli historyczne dokumenty mają `permissions` jako listę, zbyt restrykcyjne reguły mogą blokować tworzenie/aktualizację profilu.
