# Wrath & Glory / Kozi przybornik

Statyczna strona startowa (landing page) z linkami do narzędzi wspierających rozgrywki Wrath & Glory. Domyślnie działa w trybie użytkownika (6 przycisków), a tryb admina uruchamia się parametrem `?admin=1` i odsłania wszystkie narzędzia oraz notatki.

---

## Instrukcja obsługi (PL)
Tytuł karty przeglądarki: **Kozi Przybornik**.

### Dostępne narzędzia
- **Generator NPC** (widok admina): https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNPC/index.html
- **Generator nazw** (widok admina): https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNazw/index.html
- **DataVault**:
  - Widok użytkownika: https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html
  - Widok admina (z przycisku w adminie lub bezpośrednio): https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html?admin=1
  - Notatka o adminie wyświetla się tylko w widoku admina strony głównej.
- **Mapa** (widok użytkownika i admina): https://www.owlbear.rodeo/room/Iv_SzpbfiqUY/The%20Mad%20Joke
- **Obrazki** (widok użytkownika i admina): https://discord.com/channels/820916809946628096/1434928498476191834
- **Infoczytnik**:
  - Odczyt wiadomości (widok użytkownika): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/Infoczytnik.html
  - GM (szykowanie wiadomości): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/GM.html
  - Menu główne (widok admina na stronie startowej): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/index.html
    - GM (test): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/GM_test.html
    - Infoczytnik (test): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/Infoczytnik_test.html
- **Kalkulator**:
  - Menu główne: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/index.html
  - Tworzenie postaci: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/TworzeniePostaci.html
  - Kalkulator XP: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/KalkulatorXP.html
- **DiceRoller**: https://cutelittlegoat.github.io/WrathAndGlory/DiceRoller/index.html
- **Audio** (widok admina): https://cutelittlegoat.github.io/WrathAndGlory/Audio/index.html
  - Notatka o adminie wyświetla się tylko w widoku admina strony głównej.

### Instrukcje modułów (README)
- Generator NPC: https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNPC/docs/README.md
- Generator nazw: https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNazw/docs/README.txt
- DataVault: https://cutelittlegoat.github.io/WrathAndGlory/DataVault/docs/README.md
- Infoczytnik: https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/docs/README.md
- Kalkulator: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/docs/README.md
- DiceRoller: https://cutelittlegoat.github.io/WrathAndGlory/DiceRoller/docs/README.md
- Audio: https://cutelittlegoat.github.io/WrathAndGlory/Audio/docs/README.md

### Jak używać
1. Otwórz stronę startową `Main/index.html` w przeglądarce.
2. Domyślnie zobaczysz widok użytkownika z sześcioma przyciskami (Skarbiec Danych, Mapa, Obrazki, Infoczytnik, Kalkulator, Rzut kośćmi).
3. Aby uruchomić widok admina, dodaj do adresu parametr `?admin=1`. Pojawią się wszystkie przyciski (m.in. Generator NPC, Generator nazw, Audio) oraz notatki o panelach admina.
4. Jeśli potrzebujesz panelu admina w DataVault lub Audio, dopisz `index.html?admin=1` do odpowiedniego adresu (lub skorzystaj z przycisku DataVault w widoku admina).

### Gdzie zmienić link do mapy
Link do mapy jest przechowywany w pliku `Main/ZmienneHiperlacza.md`. Wpis ma format:
`Mapa: https://...`.
Jeśli adres mapy się zmieni, podmień URL po dwukropku w tym pliku.

### Gdzie zmienić link do obrazków
Link do obrazków jest przechowywany w pliku `Main/ZmienneHiperlacza.md`. Wpis ma format:
`Obrazki: https://...`.
Jeśli adres kanału się zmieni, podmień URL po dwukropku w tym pliku.

### Uruchamianie lokalne
To jest strona statyczna bez backendu. Możesz:
- po prostu otworzyć `Main/index.html` w przeglądarce, albo
- uruchomić prosty serwer lokalny, np.:

```bash
python -m http.server 8000
```

Następnie przejdź do `http://localhost:8000/Main/index.html`.

### Aktualizacja aplikacji
Aktualizacja polega na podmianie plików statycznych w miejscu hostingu (np. GitHub Pages):
1. Zaktualizuj treść w `Main/index.html` (np. adresy URL przycisków, teksty).
2. Jeśli zmieniasz logo, podmień plik `Main/wrath-glory-logo-warhammer.png`.
3. Wdróż zmiany w swoim hostingu (np. push do repozytorium obsługującego GitHub Pages).

### Pliki projektu
- `Main/index.html` – główny plik strony z treścią i osadzonymi stylami.
- `Main/ZmienneHiperlacza.md` – plik z linkami do Mapy i Obrazków w formacie `Nazwa: URL`.
- `Main/wrath-glory-logo-warhammer.png` – logo wyświetlane na stronie.
- `Main/docs/README.md` – niniejsza instrukcja obsługi (PL/EN).
- `Main/docs/Documentation.md` – dokumentacja techniczna kodu.

### Disclaimer
To narzędzie jest nieoficjalnym, fanowskim projektem stworzonym jako pomoc dla MG w systemie Wrath & Glory. Aplikacja jest udostępniana za darmo wyłącznie do prywatnego, niekomercyjnego użytku. Projekt nie jest licencjonowany, nie jest powiązany ani wspierany przez Games Workshop, Cubicle 7 Entertainment Ltd. ani Copernicus Corporation.
Warhammer 40,000 oraz powiązane nazwy i znaki towarowe są własnością Games Workshop Limited; Wrath & Glory jest własnością odpowiednich właścicieli praw.

---

## User guide (EN)
Browser tab title: **Kozi Przybornik**.

### Available tools
- **NPC Generator** (admin view): https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNPC/index.html
- **Name Generator** (admin view): https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNazw/index.html
- **DataVault**:
  - User view: https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html
  - Admin view (from the admin button or directly): https://cutelittlegoat.github.io/WrathAndGlory/DataVault/index.html?admin=1
  - The admin note is shown only in the main page admin view.
- **Map** (user + admin view): https://www.owlbear.rodeo/room/Iv_SzpbfiqUY/The%20Mad%20Joke
- **Images** (user + admin view): https://discord.com/channels/820916809946628096/1434928498476191834
- **DataSlate**:
  - Message reader (user view): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/Infoczytnik.html
  - GM (message prep): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/GM.html
  - Main menu (admin view on the landing page): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/index.html
    - GM (test): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/GM_test.html
    - DataSlate (test): https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/Infoczytnik_test.html
- **Calculator**:
  - Main menu: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/index.html
  - Character creation: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/TworzeniePostaci.html
  - XP calculator: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/KalkulatorXP.html
- **DiceRoller**: https://cutelittlegoat.github.io/WrathAndGlory/DiceRoller/index.html
- **Audio** (admin view): https://cutelittlegoat.github.io/WrathAndGlory/Audio/index.html
  - The admin note is shown only in the main page admin view.

### Module README links
- NPC Generator: https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNPC/docs/README.md
- Name Generator: https://cutelittlegoat.github.io/WrathAndGlory/GeneratorNazw/docs/README.txt
- DataVault: https://cutelittlegoat.github.io/WrathAndGlory/DataVault/docs/README.md
- DataSlate: https://cutelittlegoat.github.io/WrathAndGlory/Infoczytnik/docs/README.md
- Calculator: https://cutelittlegoat.github.io/WrathAndGlory/Kalkulator/docs/README.md
- DiceRoller: https://cutelittlegoat.github.io/WrathAndGlory/DiceRoller/docs/README.md
- Audio: https://cutelittlegoat.github.io/WrathAndGlory/Audio/docs/README.md

### How to use
1. Open the landing page at `Main/index.html` in your browser.
2. By default you will see the user view with six buttons (DataVault, Map, Images, DataSlate, Calculator, DiceRoller).
3. To enable admin view, add the `?admin=1` parameter. All buttons (including NPC Generator, Name Generator, Audio) and admin notes become visible.
4. If you need the DataVault or Audio admin panel, append `index.html?admin=1` to the relevant address (or use the DataVault button in admin view).

### Where to update the map link
The map URL is stored in `Main/ZmienneHiperlacza.md`. The entry format is:
`Mapa: https://...`.
If the map address changes, replace the URL after the colon in that file.

### Where to update the images link
The images URL is stored in `Main/ZmienneHiperlacza.md`. The entry format is:
`Obrazki: https://...`.
If the channel address changes, replace the URL after the colon in that file.

### Running locally
This is a static page with no backend. You can:
- open `Main/index.html` directly in your browser, or
- run a simple local server, e.g.:

```bash
python -m http.server 8000
```

Then go to `http://localhost:8000/Main/index.html`.

### Updating the app
Updating consists of replacing static files in your hosting (e.g. GitHub Pages):
1. Update content in `Main/index.html` (e.g. button URLs, text).
2. If you change the logo, replace `Main/wrath-glory-logo-warhammer.png`.
3. Deploy the changes to your hosting (e.g. push to the repo serving GitHub Pages).

### Project files
- `Main/index.html` – main page file with content and embedded styles.
- `Main/ZmienneHiperlacza.md` – link variables for Map and Images in `Label: URL` format.
- `Main/wrath-glory-logo-warhammer.png` – logo displayed on the page.
- `Main/docs/README.md` – this user guide (PL/EN).
- `Main/docs/Documentation.md` – technical documentation.

### Disclaimer
This tool is an unofficial, fan-made project created to support Wrath & Glory game masters. It is provided free of charge for private, non-commercial use only. The project is not licensed, affiliated with, or endorsed by Games Workshop, Cubicle 7 Entertainment Ltd., or Copernicus Corporation.
Warhammer 40,000 and related names and trademarks are the property of Games Workshop Limited; Wrath & Glory is owned by its respective rights holders.
