<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checklista testów ręcznych</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --text: #1f2937;
      --muted: #4b5563;
      --line: #d7deea;
      --accent: #1d4ed8;
      --accent-soft: #dbeafe;
      --ok: #166534;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 32px 18px 48px;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: linear-gradient(180deg, #eef3ff 0%, var(--bg) 220px);
    }

    .page {
      max-width: 1120px;
      margin: 0 auto;
    }

    .hero,
    section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    }

    .hero {
      padding: 28px;
      margin-bottom: 24px;
    }

    section {
      padding: 26px;
      margin-bottom: 20px;
    }

    h1,
    h2,
    h3 {
      margin-top: 0;
      color: #0f172a;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 1.55rem;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--accent-soft);
      margin-bottom: 18px;
    }

    h3 {
      font-size: 1.15rem;
      margin-bottom: 10px;
    }

    p,
    li {
      font-size: 1rem;
    }

    .lead {
      font-size: 1.06rem;
      color: var(--muted);
      margin: 0;
    }

    .links {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }

    .links a {
      color: var(--accent);
      font-weight: bold;
      text-decoration: none;
      word-break: break-all;
    }

    .box {
      background: #f8fbff;
      border: 1px solid #cfe0ff;
      border-radius: 14px;
      padding: 16px 18px;
      margin: 16px 0;
    }

    .note {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .step-block {
      border-top: 1px solid var(--line);
      padding-top: 18px;
      margin-top: 18px;
    }

    .step-block:first-of-type {
      border-top: 0;
      padding-top: 0;
      margin-top: 0;
    }

    ol,
    ul {
      padding-left: 22px;
    }

    li + li {
      margin-top: 8px;
    }

    strong {
      color: #111827;
    }

    code {
      font-family: Consolas, Monaco, monospace;
      background: #eff6ff;
      color: #1e3a8a;
      border-radius: 6px;
      padding: 2px 6px;
    }

    .summary-list li {
      color: var(--ok);
    }

    @media (max-width: 720px) {
      body {
        padding: 18px 10px 34px;
      }

      .hero,
      section {
        padding: 20px;
        border-radius: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      <h1>Checklista testów ręcznych</h1>
      <p class="lead">
        Ten dokument prowadzi krok po kroku przez sprawdzenie dwóch części aplikacji: <strong>Pierwsza</strong> i <strong>Druga</strong>.
        Opis został przygotowany dla osoby, która nie musi znać działania aplikacji od strony technicznej.
      </p>
      <div class="links">
        <a href="https://cutelittlegoat.github.io/Karty/Main/index.html">https://cutelittlegoat.github.io/Karty/Main/index.html</a>
        <a href="https://cutelittlegoat.github.io/Karty/Second/index.html">https://cutelittlegoat.github.io/Karty/Second/index.html</a>
      </div>
    </div>

    <section>
      <h2>1. Przygotowanie środowiska testowego</h2>
      <ol>
        <li>Otwórz pierwszy link w jednej karcie przeglądarki. To będzie część <strong>Pierwsza</strong>.</li>
        <li>Otwórz drugi link w drugiej karcie przeglądarki. To będzie część <strong>Druga</strong>.</li>
        <li>Jeżeli masz sprawdzać także ustawienia dostępne tylko dla organizatora lub osoby zarządzającej, otwórz każdą z tych stron także w wersji administratora, dopisując na końcu adresu <code>?admin=1</code>.</li>
        <li>Upewnij się, że wszystkie otwarte karty pokazują te same dane. Jeżeli po zapisaniu zmian w jednej karcie nie widać ich w drugiej, odśwież stronę.</li>
        <li>Przygotuj przykładowe dane, które będą potrzebne podczas testów części <strong>Druga</strong>:
          <ul>
            <li>wpłata początkowa: <strong>100</strong>,</li>
            <li>dodatkowa wpłata: <strong>100</strong>,</li>
            <li>opłata organizacyjna: <strong>10</strong>,</li>
            <li>początkowa liczba żetonów: <strong>10000</strong>,</li>
            <li>liczba żetonów za dodatkową wpłatę: <strong>10000</strong>.</li>
          </ul>
        </li>
        <li>Przygotuj listę co najmniej 10 przykładowych graczy, na przykład: <code>G1</code>, <code>G2</code>, <code>G3</code>, <code>G4</code>, <code>G5</code>, <code>G6</code>, <code>G7</code>, <code>G8</code>, <code>G9</code>, <code>G10</code>.</li>
      </ol>
      <div class="box note">
        <strong>Ważne:</strong> w kolejnych punktach najpierw przygotowujesz dane w widoku administratora, a dopiero potem przechodzisz do zwykłego widoku użytkownika i sprawdzasz, czy wszystko pokazuje się poprawnie.
      </div>
    </section>

    <section>
      <h2>2. Checklista części Pierwsza</h2>

      <div class="step-block">
        <h3>2.1. Uruchomienie i pierwsze sprawdzenie</h3>
        <ol>
          <li>Otwórz część <strong>Pierwsza</strong> pod adresem <a href="https://cutelittlegoat.github.io/Karty/Main/index.html">https://cutelittlegoat.github.io/Karty/Main/index.html</a>.</li>
          <li>Sprawdź, czy w górnej części strony widać przycisk <strong>Instrukcja</strong>.</li>
          <li>Kliknij ten przycisk.</li>
          <li>Sprawdź, czy pojawia się okno z treścią instrukcji.</li>
          <li>Zamknij to okno i upewnij się, że wracasz do poprzedniego widoku.</li>
          <li>W widoku administratora sprawdź, czy widzisz zarówno część do zarządzania treścią, jak i zwykły widok użytkownika.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.2. Aktualności</h3>
        <ol>
          <li>Przełącz się do widoku administratora części <strong>Pierwsza</strong>.</li>
          <li>Otwórz zakładkę <strong>Aktualności</strong>.</li>
          <li>Wpisz przykładową wiadomość, na przykład <code>Test aktualności Pierwsza</code>.</li>
          <li>Zapisz lub wyślij wiadomość.</li>
          <li>Przełącz się do zwykłego widoku użytkownika tej samej części.</li>
          <li>Otwórz zakładkę <strong>Aktualności</strong>.</li>
          <li>Sprawdź, czy widać wiadomość zapisaną chwilę wcześniej.</li>
          <li>Kliknij przycisk odświeżenia i sprawdź, czy wiadomość nadal jest widoczna.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.3. Regulamin</h3>
        <ol>
          <li>W widoku administratora otwórz zakładkę <strong>Regulamin</strong>.</li>
          <li>Zmień fragment tekstu, dodając krótkie zdanie testowe.</li>
          <li>Zapisz zmiany.</li>
          <li>Przełącz się do zwykłego widoku użytkownika.</li>
          <li>Otwórz zakładkę <strong>Regulamin</strong>.</li>
          <li>Sprawdź, czy użytkownik widzi właśnie zapisaną wersję tekstu.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.4. Gracze i kody dostępu</h3>
        <ol>
          <li>W widoku administratora przejdź do zakładki <strong>Gracze</strong>.</li>
          <li>Dodaj kilku graczy.</li>
          <li>Przy każdym graczu wpisz nazwę i kod dostępu albo skorzystaj z automatycznego tworzenia kodu, jeśli taka opcja jest widoczna.</li>
          <li>Przynajmniej jednej osobie nadaj dostęp do części użytkownika.</li>
          <li>Zapisz dane.</li>
          <li>Przełącz się do zwykłego widoku użytkownika i otwórz sekcję <strong>Strefa Gracza</strong>.</li>
          <li>Wpisz kod dostępu jednego z utworzonych graczy i otwórz jego widok.</li>
          <li>Sprawdź, czy pokazują się tylko te części, do których ten gracz ma dostęp.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.5. Rozmowy</h3>
        <ol>
          <li>W widoku administratora upewnij się, że wybrany gracz ma dostęp do rozmów.</li>
          <li>Przełącz się do zwykłego widoku użytkownika i otwórz sekcję <strong>Czat</strong>.</li>
          <li>Wpisz kod dostępu tego gracza.</li>
          <li>Otwórz rozmowę.</li>
          <li>Wpisz wiadomość testową i wyślij ją.</li>
          <li>Sprawdź, czy wiadomość pojawia się na liście.</li>
          <li>Jeżeli masz drugą kartę lub drugiego gracza, sprawdź również tam, czy ta wiadomość jest widoczna.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.6. Gry do potwierdzenia</h3>
        <ol>
          <li>W widoku administratora przygotuj grę, którą użytkownik może potwierdzić.</li>
          <li>Przełącz się do zwykłego widoku użytkownika i otwórz sekcję <strong>Gry do Potwierdzenia</strong>.</li>
          <li>Wpisz kod dostępu i otwórz widok gracza.</li>
          <li>Sprawdź, czy na liście pojawia się przygotowana gra.</li>
          <li>Kliknij <strong>Potwierdź</strong> i sprawdź, czy stan gry się zmienia.</li>
          <li>Kliknij <strong>Anuluj</strong> i sprawdź, czy potwierdzenie znika.</li>
          <li>Otwórz szczegóły gry i sprawdź, czy pojawia się okno z informacjami.</li>
          <li>Otwórz notatki do gry i sprawdź, czy również pokazuje się poprawne okno z treścią.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.7. Gry użytkowników</h3>
        <ol>
          <li>Przełącz się do zwykłego widoku użytkownika i otwórz sekcję <strong>Gry Użytkowników</strong>.</li>
          <li>Wpisz kod dostępu gracza, który ma prawo korzystać z tej sekcji.</li>
          <li>Otwórz widok gracza.</li>
          <li>Dodaj nową grę.</li>
          <li>Sprawdź, czy pojawia się nowy wiersz.</li>
          <li>Uzupełnij podstawowe dane, takie jak rodzaj gry, data i nazwa.</li>
          <li>Otwórz szczegóły tej gry.</li>
          <li>Dodaj uczestników.</li>
          <li>Uzupełnij pola związane z wpisowym, dodatkowymi wpłatami, wypłatą i punktami.</li>
          <li>Kliknij przycisk pokazujący wysokość dodatkowych wpłat.</li>
          <li>W nowym oknie dodaj kilka przykładowych dodatkowych wpłat.</li>
          <li>Zamknij okno i sprawdź, czy suma na przycisku została zaktualizowana.</li>
          <li>Sprawdź, czy podsumowanie pod grą przelicza się automatycznie.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>2.8. Statystyki</h3>
        <ol>
          <li>Przełącz się do zwykłego widoku użytkownika i otwórz sekcję <strong>Statystyki</strong>.</li>
          <li>Wpisz kod dostępu gracza, który ma prawo oglądać statystyki.</li>
          <li>Otwórz widok.</li>
          <li>Przełącz kilka lat na liście po lewej stronie.</li>
          <li>Sprawdź, czy zmieniają się dane w tabeli i w zestawieniu wyników.</li>
          <li>Jeżeli jest dostępny przycisk eksportu, uruchom go i sprawdź, czy działa poprawnie.</li>
        </ol>
      </div>
    </section>

    <section>
      <h2>3. Checklista części Druga — pełny scenariusz turniejowy</h2>

      <div class="step-block">
        <h3>3.1. Przygotowanie danych w części Druga</h3>
        <ol>
          <li>Otwórz część <strong>Druga</strong> w widoku administratora pod adresem <a href="https://cutelittlegoat.github.io/Karty/Second/index.html?admin=1">https://cutelittlegoat.github.io/Karty/Second/index.html?admin=1</a>.</li>
          <li>Przejdź do miejsca, w którym dodaje się graczy.</li>
          <li>Dodaj 10 graczy z przygotowanej wcześniej listy.</li>
          <li>Przy każdym graczu wpisz nazwę i kod dostępu.</li>
          <li>Uzupełnij dane turnieju przygotowanymi wcześniej wartościami: organizator, wpłata początkowa, dodatkowa wpłata, opłata organizacyjna, początkowa liczba żetonów i liczba żetonów za dodatkową wpłatę.</li>
          <li>Zapisz zmiany.</li>
          <li>Odśwież stronę i sprawdź, czy wszystkie dane nadal są widoczne.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.2. Losowanie stołów</h3>
        <ol>
          <li>Pozostając w widoku administratora, otwórz część odpowiedzialną za przydzielanie graczy do stołów.</li>
          <li>Dodaj co najmniej 2 stoły.</li>
          <li>Nadaj im nazwy.</li>
          <li>Przypisz wszystkich graczy do stołów.</li>
          <li>Sprawdź, czy pod każdym stołem pokazują się przypisane osoby.</li>
          <li>Sprawdź, czy łączna wartość przy każdym stole przelicza się automatycznie.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.3. Dodatkowe wpłaty</h3>
        <ol>
          <li>Otwórz część dotyczącą wpłat.</li>
          <li>Przy graczu <code>G1</code> kliknij przycisk odpowiedzialny za dodatkowe wpłaty.</li>
          <li>W nowym oknie wpisz pierwszą kwotę, na przykład <code>100</code>.</li>
          <li>Dodaj kolejną pozycję i wpisz <code>200</code>.</li>
          <li>Zamknij okno.</li>
          <li>Sprawdź, czy na przycisku przy tym graczu pojawiła się suma <code>300</code>.</li>
          <li>Powtórz podobny test dla kilku kolejnych graczy, aby łącznie było przynajmniej 5 lub 6 dodatkowych wpłat.</li>
          <li>Zapisz sobie kolejność wprowadzonych kwot, bo będzie potrzebna później.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.4. Podział puli i obliczenia po potrąceniu opłaty</h3>
        <ol>
          <li>Przejdź do części dotyczącej podziału puli.</li>
          <li>Sprawdź zestawienie kwot oraz procentowego potrącenia.</li>
          <li>Upewnij się, że procent potrącenia zgadza się z wpisaną wcześniej opłatą organizacyjną.</li>
          <li>Odszukaj tabelę z wyliczeniami dla dodatkowych wpłat.</li>
          <li>Sprawdź, czy widać osobne kolumny dla kolejnych dodatkowych wpłat.</li>
          <li>Dla pierwszych wpisów sprawdź, czy każda kwota została pomniejszona zgodnie z opłatą organizacyjną.</li>
          <li>Przykład: jeżeli wpisano <code>100</code>, a opłata organizacyjna wynosi <code>10</code>, wynik powinien wynosić <code>90</code>.</li>
          <li>Powtórz sprawdzenie dla kilku różnych kwot, na przykład <code>100</code>, <code>200</code> i <code>300</code>.</li>
          <li>Sprawdź, czy końcowa suma w wierszu uwzględnia już pomniejszone wartości.</li>
          <li>Jeżeli jest więcej niż 30 kolumn z dodatkowymi wpłatami, sprawdź, czy dalsze pola nadal można uzupełniać ręcznie.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.5. Część grupowa</h3>
        <ol>
          <li>Przejdź do części grupowej.</li>
          <li>Zaznacz kilku graczy jako wyeliminowanych, na przykład <code>G1</code>, <code>G2</code>, <code>G3</code>.</li>
          <li>Sprawdź, czy znikają z listy aktywnych graczy i pojawiają się na liście graczy wyeliminowanych.</li>
          <li>Sprawdź, czy otrzymują kolejne miejsca końcowe, na przykład 1, 2, 3.</li>
          <li>Zmień kolejność jednego z nich przyciskami przesuwania w górę lub w dół.</li>
          <li>Sprawdź, czy kolejność rzeczywiście się zmienia.</li>
          <li>Odśwież stronę.</li>
          <li>Sprawdź, czy kolejność została zapamiętana.</li>
          <li>Przy graczach, którzy pozostali w grze, wpisz liczbę posiadanych żetonów.</li>
          <li>Sprawdź, czy procenty zmieniają się po wpisaniu tych wartości.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.6. Półfinał</h3>
        <ol>
          <li>Przejdź do części półfinałowej.</li>
          <li>Sprawdź, czy widzisz tylko tych graczy, którzy przeszli dalej z poprzedniego etapu.</li>
          <li>Dodaj co najmniej 2 półfinałowe stoły.</li>
          <li>Nadaj im nazwy.</li>
          <li>Przypisz graczy do tych stołów.</li>
          <li>Sprawdź, czy gracze pojawiają się przy właściwych stołach.</li>
          <li>Sprawdź, czy łączna liczba żetonów dla stołu jest widoczna obok jego nazwy.</li>
          <li>Zaznacz dwóch graczy jako wyeliminowanych, na przykład <code>G4</code> i <code>G5</code>.</li>
          <li>Sprawdź, czy automatycznie pojawiają się na liście graczy wyeliminowanych w półfinale.</li>
          <li>Sprawdź, czy otrzymują kolejne miejsca końcowe.</li>
          <li>Zmień ich kolejność przyciskami góra/dół.</li>
          <li>Odśwież stronę i upewnij się, że kolejność oraz zaznaczenia pozostały zapisane.</li>
          <li>Sprawdź listę graczy przewidzianych do finału.</li>
          <li>Upewnij się, że są tam tylko osoby nadal grające.</li>
          <li>Sprawdź, czy liczby żetonów w tej części są tylko do odczytu.</li>
          <li>Sprawdź, czy procenty liczą się od łącznej liczby żetonów całego etapu.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.7. Finał</h3>
        <ol>
          <li>Przejdź do części finałowej.</li>
          <li>Sprawdź, czy pokazują się ci sami gracze i te same liczby żetonów, które były widoczne na końcu półfinału.</li>
          <li>Sprawdź, czy gracze są ustawieni od największej liczby żetonów do najmniejszej.</li>
          <li>Upewnij się, że liczby żetonów nie da się tutaj zmieniać ręcznie.</li>
          <li>Sprawdź, czy przy każdym finaleście jest pole do zaznaczenia, że odpadł.</li>
          <li>Zaznacz jednego finalistę jako wyeliminowanego.</li>
          <li>Odśwież stronę i sprawdź, czy zaznaczenie nadal jest widoczne.</li>
          <li>Usuń zaznaczenie.</li>
          <li>Ponownie odśwież stronę i sprawdź, czy nowy stan też został poprawnie zapamiętany.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.8. Wypłaty</h3>
        <ol>
          <li>Przejdź do części dotyczącej wypłat.</li>
          <li>Sprawdź, czy liczba wierszy odpowiada liczbie wszystkich graczy dodanych na początku.</li>
          <li>Sprawdź, czy końcowe miejsca są przydzielane najpierw graczom wyeliminowanym wcześniej, a potem kolejnym osobom według przebiegu turnieju.</li>
          <li>Sprawdź, czy najwyższe miejsca zajmują gracze, którzy nadal pozostali w finale.</li>
          <li>Wróć do finału, zaznacz jednego finalistę jako wyeliminowanego, a potem wróć do wypłat.</li>
          <li>Sprawdź, czy klasyfikacja zmieniła się od razu.</li>
          <li>Włącz pokazywanie kolumny z początkową wygraną.</li>
          <li>Sprawdź, czy kolumna stała się widoczna.</li>
          <li>Porównaj dla miejsca 1, 2 i kilku kolejnych miejsc, czy wartości odpowiadają wierszom z tabeli podziału puli.</li>
          <li>Jeżeli miejsc jest więcej niż pozycji w tabeli podziału puli, sprawdź, czy dalsze wartości mają <code>0</code>.</li>
          <li>Włącz pokazywanie kolumny z końcową wygraną.</li>
          <li>Sprawdź, czy ta kolumna również stała się widoczna.</li>
          <li>Porównaj kilka miejsc z końcowymi sumami w tabeli podziału puli.</li>
          <li>Upewnij się, że wartości wygranych nie da się zmieniać ręcznie.</li>
          <li>Odśwież stronę i sprawdź, czy widoczność obu kolumn została zapamiętana.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.9. Natychmiastowy wpływ zmian</h3>
        <ol>
          <li>Otwórz jednocześnie część półfinałową, finałową i wypłat, na przykład w osobnych kartach albo przełączając się między nimi.</li>
          <li>W półfinale zaznacz jednego gracza jako wyeliminowanego.</li>
          <li>Sprawdź, czy od razu pojawia się on na liście wyeliminowanych, znika z listy finalistów i wpływa na kolejność miejsc w wypłatach.</li>
          <li>W finale zaznacz jednego finalistę jako wyeliminowanego.</li>
          <li>Sprawdź, czy kolejność miejsc w wypłatach zmienia się od razu.</li>
        </ol>
      </div>

      <div class="step-block">
        <h3>3.10. Zapamiętywanie ustawień po ponownym uruchomieniu</h3>
        <ol>
          <li>W półfinale zaznacz kilku graczy jako wyeliminowanych.</li>
          <li>Ustaw ich kolejność na liście graczy wyeliminowanych.</li>
          <li>W finale zaznacz wybranego finalistę jako wyeliminowanego.</li>
          <li>W wypłatach włącz obie dodatkowe kolumny z wygranymi.</li>
          <li>Zrób pełne odświeżenie strony.</li>
          <li>Zamknij kartę i otwórz stronę ponownie.</li>
          <li>Sprawdź, czy wszystkie zaznaczenia, kolejność oraz widoczność kolumn zostały zachowane.</li>
        </ol>
      </div>
    </section>

    <section>
      <h2>4. Wynik końcowy testów</h2>
      <ul class="summary-list">
        <li>Część <strong>Pierwsza</strong> poprawnie obsługuje aktualności, regulamin, kody dostępu, rozmowy, gry i statystyki.</li>
        <li>Część <strong>Druga</strong> poprawnie przelicza dodatkowe wpłaty po potrąceniu opłaty organizacyjnej.</li>
        <li>Lista graczy wyeliminowanych w półfinale automatycznie zbiera właściwe osoby i pozwala ustawić ich kolejność.</li>
        <li>Finał pokazuje właściwy zestaw graczy, zachowuje kolejność i pamięta zaznaczenia po odświeżeniu.</li>
        <li>Wypłaty zawsze pokazują wszystkich graczy i poprawnie przypisują miejsca oraz wygrane.</li>
        <li>Najważniejsze ustawienia są zapamiętywane po odświeżeniu i ponownym otwarciu strony.</li>
      </ul>
    </section>
  </div>
</body>
</html>
