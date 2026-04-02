# Analiza problemu: identyczna treść po przełączaniu zakładek w module Main (Kalkulator)

## Prompt użytkownika (pełny kontekst)
Przeprowadź pełną analizę kodu aplikacji.

Mam dziwny problem z modułem Main.
1. Po wdrożeniu zmian opisanych w Analizy/Zakladka_Organizacja.md pojawił się problem, że na jednym telefonie zmiana zadziałała a na drugim pojawiło się coś dziwnego. Na pasku pojawiły się nowe zakładki. Jednak po klikaniu na zakładki treść strony pozostawała bez zmian. Wszędzie wyświetlały się takie same tabele z tymi samymi danymi.

2. Po wdrożeniu zmian opisanych w Analizy/Analiza_pasy_pod_Tabela2_i_TABELAC_2026-04-01.md miałem podobny problem co w pkt1. Na PC uruchomiłem aplikację i po klikaniu we wszystkie zakładki na panelu bocznym w "Kalkulator" wyświetlały się takie same tabele (bez danych).
Po kilkunastu kliknięciach na różne zakładki dopiero pojawiły się prawidłowe tabele.

Nie wprowadzaj zmian w kodzie.
Przeprowadź pełną analizę czy to jest kwestia kodu aplikacji, jakiś problem z odświeżaniem czy może kwestia ustawień przeglądarki.

---

## Zakres przeanalizowanych elementów
- `Main/index.html` (sidebar i tryby kalkulatora, ładowanie skryptów).
- `Main/app.js` (logika przełączania trybów kalkulatora i renderowania tabel).
- `Main/service-worker.js`, `Main/pwa-bootstrap.js`, `Main/pwa-config.js` (strategia cache i aktualizacji PWA).
- Kontekst zmian z:
  - `Analizy/Zakladka_Organizacja.md`
  - `Analizy/Analiza_pasy_pod_Tabela2_i_TABELAC_2026-04-01.md`

---

## Wnioski główne (krótko)

## Najbardziej prawdopodobna przyczyna: cache PWA / service worker (a nie błąd samego kliknięcia w zakładki)
Problem **najbardziej pasuje do niespójnych wersji plików po deployu** (stary JS/CSS/HTML w cache na części urządzeń), a nie do stricte błędu logiki zakładek.

Dlaczego:
1. W `Main/service-worker.js` użyta jest strategia **cache-first dla wszystkich GET**:
   - najpierw `caches.match(event.request)`,
   - dopiero brak cache -> `fetch`.
2. App shell (`index.html`, `app.js`, `styles.css`) jest trwale cache’owany.
3. Jeżeli po wdrożeniu nie zmieniono `CACHE_NAME`, urządzenie może dalej pracować na starej wersji kodu.
4. To tłumaczy, czemu:
   - na jednym telefonie działało, a na drugim nie,
   - po kolejnych próbach/odświeżeniach sytuacja mogła się „nagle” poprawić.

---

## Szczegółowa ocena: kod przełączania zakładek

### Co działa poprawnie w logice przełączania
- Sidebar ma poprawne przyciski z `data-calculator-mode` (`tournament1`, `tournament2`, `cash`, `organization`, `chips-*`).
- W `initAdminCalculator` kliknięcie przycisku ustawia `state.mode`, przełącza klasę `is-active` i woła `render()`.
- `render()` ma osobne gałęzie dla:
  - `cash`,
  - `organization`,
  - `chips-*`,
  - trybów turniejowych.
- Każdy renderer czyści i buduje odpowiednie sloty tabel.

To oznacza, że w aktualnym kodzie nie widać prostego „twardego” błędu typu brak switch-case dla nowych trybów.

### Co może dawać objawy „niby się przełącza, ale widzę to samo”
Jeśli urządzenie ma **stary `app.js`**, a nowy `index.html` (lub odwrotnie), możliwa jest sytuacja mieszana:
- UI pokazuje nowe zakładki,
- ale logika JS działa wg poprzedniej wersji,
- efekt końcowy: przełączanie wygląda niepoprawnie lub niekonsekwentnie.

To jest klasyczny objaw niezsynchronizowanego cache po deployu PWA.

---

## Czy to może być „problem odświeżania” lub ustawień przeglądarki?

## Tak — i to bardzo możliwe

### 1) Odświeżanie / cache
To najważniejszy czynnik. Przy cache-first i bez konsekwentnego versioningu assetów:
- zwykły refresh nie gwarantuje nowej wersji,
- część urządzeń trzyma starą wersję dłużej,
- szczególnie widoczne na telefonach z wcześniej zainstalowaną PWA.

### 2) Różnice przeglądarek/urządzeń
- Inny moment aktywacji service workera,
- inna polityka trzymania cache,
- różne zachowanie po wznowieniu aplikacji z tła.

To tłumaczy rozjazd: „na jednym telefonie działa, na drugim nie”.

### 3) Ustawienia użytkownika
Mniejszy wpływ niż SW, ale mogą nasilać objaw:
- tryb oszczędzania danych/baterii,
- „zamrożone” karty,
- długa sesja bez pełnego restartu karty/PWA.

---

## Ocena incydentu z pkt 2 (PC: po kilkunastu kliknięciach „nagle OK”)
Najbardziej prawdopodobny scenariusz:
- uruchomiła się sesja na nieaktualnych lub częściowo niezsynchronizowanych assetach,
- po serii interakcji/odświeżeń przeglądarka przełączyła się na już-aktualny zestaw,
- wtedy widok zaczął zachowywać się poprawnie.

Alternatywa (mniej prawdopodobna): opóźnione dociąganie danych realtime z Firestore i wielokrotne re-renderowanie, ale ten wariant gorzej tłumaczy „to samo we wszystkich zakładkach” bez zmiany struktury widoku.

---

## Werdykt: kod vs odświeżanie vs przeglądarka

### Priorytet przyczyn
1. **Najwyższe prawdopodobieństwo:** mechanizm cache/service-worker (odświeżanie i wersjonowanie).
2. **Średnie:** różnice środowiskowe przeglądarek/urządzeń (wspierają pkt 1).
3. **Niższe:** stricte błąd logiki przełączania zakładek w aktualnym kodzie.

Czyli: to jest głównie problem warstwy dostarczania aktualizacji frontendu (PWA cache), a nie jednoznaczny błąd biznesowy kalkulatora.

---

## Jak potwierdzić diagnozę (checklista diagnostyczna bez zmian kodu)
1. Na urządzeniu z problemem:
   - zamknąć PWA/kartę,
   - wyczyścić dane witryny (cache + service worker),
   - uruchomić ponownie.
2. W DevTools (PC):
   - sprawdzić aktywny service worker i nazwę cache,
   - porównać zawartość `app.js` z wersją na serwerze.
3. Zweryfikować, czy oba problematyczne urządzenia po czyszczeniu cache zachowują się już identycznie.

Jeśli po takim teście problem znika, potwierdza to źródło po stronie cache/odświeżania.

---

## Podsumowanie końcowe
Na podstawie analizy kodu i symptomów produkcyjnych: **to najpewniej nie jest losowy bug kliknięć zakładek, tylko efekt utrzymywania starych assetów przez service worker/cache przeglądarki.**

W obecnym wdrożeniu to ryzyko jest realne, bo cache strategia jest agresywnie cache-first dla kluczowych plików aplikacji.
