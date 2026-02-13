# Analiza funkcjonalności wysyłania wiadomości (`admin_messages`) — 2026-02-13

## Prompt użytkownika
> Sprawdź poprawność kodu w zakresie funkcjonalności wysyłania wiadomości.  
> Widzę, że w Firebase tworzą mi się dodatkowe dokumenty (screeny w załączniku).  
> Nie ma potrzeby archiwizowania wiadomości wysyłanych w polu Wiadomość do graczy  
> Informacja jaka będzie w polu >Najnowsze<  
> Przeprowadź analizę czy należy zmienić coś w kodzie i czy mogę któreś dokumenty skasować z Firebase.

## Co robi kod obecnie
1. Wysyłka z panelu **„Wiadomość do graczy”** wykonuje zapis przez `add()` do kolekcji `admin_messages`, więc **każde kliknięcie „Wyślij” tworzy nowy dokument z nowym ID**.
2. Pole **„Najnowsze”** po stronie gracza odczytuje `admin_messages` przez `orderBy(createdAt, "desc").limit(1)`, czyli pokazuje tylko najświeższy dokument.
3. W praktyce historia wiadomości rośnie w tle, mimo że UI korzysta tylko z ostatniej pozycji.

## Ocena względem Twojego celu
Twoje założenie: brak potrzeby archiwizacji, ma być tylko bieżąca informacja „Najnowsze”.

Wniosek: **obecna implementacja nie jest zgodna z tym założeniem**, bo zapisuje historię (`add()`), zamiast nadpisywać jeden dokument.

## Czy trzeba zmieniać kod?
**Tak, rekomendowana jest zmiana.**

Najprostszy wariant:
- zamiast `db.collection("admin_messages").add({...})`
- użyć stałego dokumentu, np. `db.collection("admin_messages").doc("latest").set({...})`
- i analogicznie odczyt „Najnowsze” oprzeć o `.doc("latest")`.

Efekt:
- zawsze 1 dokument z aktualnym komunikatem,
- brak narastania dodatkowych rekordów,
- pełna zgodność z funkcją „Najnowsze”.

## Czy możesz kasować dokumenty z Firebase?
**Tak, możesz usunąć historyczne dokumenty z `admin_messages`, jeśli nie chcesz archiwum.**

Praktycznie:
1. Najpierw zostaw (lub utwórz) jeden dokument, który ma być aktualną wiadomością.
2. Usuń pozostałe historyczne wpisy (losowe ID).
3. Po wdrożeniu zmiany kodu do wariantu „single doc”, kolekcja nie będzie już puchła.

## Dodatkowa uwaga do Twoich screenów
Dokument o ID `admin_messages` widoczny w kolekcji nie jest tworzony przez obecny kod wysyłki (kod używa tylko `add()`, czyli losowe ID). Najpewniej to zapis historyczny/manualny z wcześniejszego etapu. Jeżeli nie jest potrzebny jako aktualny rekord, można go usunąć.

## Ryzyko przy usuwaniu
Jeśli usuniesz **wszystkie** dokumenty i nie utworzysz żadnego nowego, UI pokaże komunikat „Brak wiadomości od administratora.” — co jest zgodne z obecną logiką odczytu.
