# App Check po włączeniu *Enforce* — czy trzeba jeszcze zmieniać reguły? (2026-09-20)

## Prompt użytkownika (zachowany dla kontekstu)

> Zapoznaj się z dokumentacją Analizy/Instrukcja_AppCheck_2026-09-07.md - na wykresie było ok,
> więc kliknąłem Enforce. Czy wszystko już gotowe czy jeszcze trzeba zmienić rules?

---

## 1. Odpowiedź wprost

**Reguł nie trzeba zmieniać. Nic nie zostało do wklejenia w Firebase Console.**

App Check **nie jest w ogóle konfigurowany w regułach**. To osobny przełącznik w konsoli
(*App Check → APIs → Cloud Firestore → Enforce*), sprawdzany **zanim** reguły w ogóle ruszą.
W regułach Firestore nie istnieje żadna zmienna opisująca token App Check — jest `request.auth`,
`request.time`, `request.resource`, ale **nic o App Check**. Dlatego plik `Analizy/Wazne_Rules.txt`
pozostaje dokładnie taki, jaki jest, i nie ma tam czego dopisywać.

Kliknięcie *Enforce* zamknęło temat od strony technicznej **w całości**. Etap „App Check” jest skończony.

---

## 2. Co sprawdziłem w kodzie (2026-09-20)

| Co | Wynik |
|---|---|
| Klucz w `config/firebase-config.js` | ✅ `appCheckEnterpriseSiteKey: "6Ld6x68t…KU2"` obecny, linia odkomentowana, przecinek na miejscu |
| Aktywacja w module Main | ✅ `activateAppCheckIfConfigured` wywoływane w `getFirebaseApp()` — **przed** każdym dostępem do bazy |
| Aktywacja w module Second | ✅ tak samo |
| Czy każdy dostęp do bazy idzie przez `getFirebaseApp()` | ✅ tak — w obu modułach nie ma ścieżki omijającej |
| Biblioteka App Check w `index.html` | ✅ `firebase-app-check-compat.js` 10.12.2 w obu modułach |
| Inne usługi Firebase (Storage, Auth, Functions, Realtime DB) | ✅ **żadna nie jest używana** — aplikacja korzysta wyłącznie z Firestore |
| Service worker (PWA w Main) | ✅ nie dotyka bazy; cache jest wersjonowany (`karty-main-pwa-2026-09-15.1`) i starsze kasowane przy aktywacji |

**Wniosek z ostatniego wiersza tabeli:** wymuszanie na samym *Cloud Firestore* wystarcza.
Nie ma drugiej usługi, którą trzeba by osobno objąć.

---

## 3. Co teraz warto zrobić — to kwestia obserwacji, nie zmian

1. **Otwórz obie aplikacje z adresu internetowego i poklikaj.**
   `https://cutelittlegoat.github.io/Karty/Main/index.html` oraz moduł Second.
   Jeśli dane się wczytują i zapisują — wymuszanie działa poprawnie.
2. **Sprawdź telefon z zainstalowaną aplikacją (PWA).** To jedyne miejsce, gdzie teoretycznie
   mogłaby siedzieć stara wersja z pamięci podręcznej. Wystarczy raz otworzyć przy działającym
   internecie — nowa wersja wskoczy sama.
3. **Zajrzyj jeszcze raz na wykres** *App Check → APIs → Cloud Firestore* za dzień i za tydzień.
   Po *Enforce* odrzucone zapytania przestają być liczone jako „niezweryfikowane” — stają się
   po prostu błędem po stronie klienta. Jeśli ktoś z graczy zgłosi, że aplikacja nie działa,
   to jest pierwsze miejsce do sprawdzenia.
4. **Hamulec bezpieczeństwa: *Unenforce*** w tym samym miejscu. Działa natychmiast, nie wymaga
   żadnej zmiany w kodzie ani w regułach.

---

## 4. Czego App Check **nie** załatwił — i dlaczego reguły tego nie naprawią

To jest sedno pytania „czy wszystko już gotowe”. Odpowiedź brzmi: **gotowy jest ten etap, ale nie cały temat.**

**Co zostało odcięte (✅):** dowolny obcy program, skrypt, bot czy narzędzie próbujące sięgnąć
do bazy **spoza Pana aplikacji**. To była główna dziura opisana w pkt 2 analizy
`Bezpieczenstwo_Firestore_2026-09-07.md` i ona jest zamknięta.

**Co nie zostało odcięte (❌):** ktoś, kto **otworzy Pana stronę w przeglądarce i naciśnie F12**.
Taka osoba ma w ręku ważny token App Check — bo zapytanie naprawdę wychodzi z Pana aplikacji.
Reguły przepuszczają wszystko (`allow read, write: if true`), więc z konsoli przeglądarki
można odczytać PIN-y wszystkich graczy, odczytać skrót hasła administratora i zmienić lub
skasować dane.

Dokładnie to było napisane w opcji C analizy bezpieczeństwa: *„nie rozróżnia użytkowników —
zalogowany gracz nadal widzi wszystko, co widzi aplikacja. Najlepiej działa jako dodatek
do opcji A lub B, nie zamiast nich.”*

**Dlaczego reguły tego nie naprawią.** Reguła potrafi rozróżnić zapytania tylko wtedy, gdy ma po
czym — czyli po tożsamości (`request.auth`). Dziś w aplikacji **nie ma żadnego logowania**, więc
z punktu widzenia reguł zapytanie administratora, zapytanie gracza i zapytanie wpisane ręcznie
w konsoli F12 wyglądają **identycznie**. Żadne przepisanie reguł tego nie zmieni, bo nie ma czego
w nich sprawdzić.

---

## 5. Ważny wniosek uboczny: opcja A stała się zbędna

W pierwotnym planie (pkt 7 analizy bezpieczeństwa) **opcja A** — logowanie anonimowe plus reguły
`request.auth != null` — miała odciąć skanowanie bazy z zewnątrz.

**App Check robi to samo, tylko lepiej.** Logowanie anonimowe każdy może sobie założyć sam jednym
zapytaniem; tokenu App Check nie da się zdobyć spoza Pana domeny. Przeciwko F12 opcja A również nie
pomaga — aplikacja zalogowałaby anonimowo także osobę siedzącą w konsoli.

**Rekomendacja: opcję A skreślić z planu.** Kosztowałaby zmianę w kodzie obu modułów i przepisanie
całych reguł, a nie dołożyłaby nic ponad to, co już jest. Jedyną drogą dalej pozostaje **opcja B**
(prawdziwe konta i role) — osobny, duży projekt, do decyzji kiedyś w przyszłości.

---

## 6. Czy da się jeszcze zawęzić reguły „za darmo”? — sprawdzone, praktycznie nie

Punkt E.3 pierwotnej analizy mówił o zawężeniu reguł tam, gdzie nic to nie kosztuje. Sprawdziłem,
co z tego zostało do wzięcia:

- **`admin_security`** — ✅ już zrobione (`allow write: if false`), to była najcenniejsza z tych zmian.
- **Pozostałe kolekcje** — **nie da się bezkosztowo.** Przywracanie z kopii zapasowej
  (`RESTORE_SKIPPED_COLLECTIONS = ["admin_security"]`) zapisuje do **wszystkich** kolekcji poza
  `admin_security`. Zablokowanie zapisu gdziekolwiek indziej **zepsułoby przywracanie** tej
  kolekcji, dopóki nie dopisze się jej także do tej listy w kodzie. Czyli to już nie jest zmiana
  „sama reguła, kod nietknięty”.
- **`Collection1`** — jedyny realny kandydat. Ta kolekcja **nie występuje nigdzie w aplikacji**
  poza listą kolekcji do kopii zapasowej (`Main/app.js:9669`) — to pozostałość. Można by jej dać
  sam odczyt, ale zysk jest bliski zeru, a ryzyko przy przywracaniu takie samo jak wyżej.
  **Nie warto ruszać.**

**Drobna uwaga do reguł.** Na początku `Wazne_Rules.txt` stoją dwie funkcje pomocnicze —
`isSignedIn()` i `isAdmin()`. **Żadna z nich nie jest nigdzie wywoływana** i przy braku logowania
nie miałaby czego sprawdzać. Nic nie psują, ale nie dają też żadnej ochrony — gdyby kiedyś
wróciło pytanie „przecież tam jest `isAdmin`”, to jest odpowiedź: to martwy kod, przygotowany
pod opcję B.

---

## 7. Co pozostaje na liście — stan na 2026-09-20

| # | Sprawa | Stan |
|---|---|---|
| 1 | Reguły Firestore (blokada zapisu do `admin_security`) | ✅ wdrożone 2026-09-07 |
| 2 | Kopia zapasowa — zakładka i pierwszy plik | ✅ wdrożone 2026-09-07 |
| 3 | App Check — klucz, rejestracja obu aplikacji, TTL 1 dzień | ✅ wdrożone 2026-09-08 |
| 4 | App Check — **wymuszanie (*Enforce*)** | ✅ **wdrożone 2026-09-20** |
| 5 | Wymiana PIN-ów graczy | ⛔ świadoma decyzja użytkownika — nie zmieniamy |
| 6 | Opcja A (logowanie anonimowe) | ⚪ **skreślona jako zbędna** — patrz pkt 5 |
| 7 | Regularne kopie zapasowe | 🔵 stałe — data ostatniej kopii widoczna w zakładce |
| 8 | Limit 10 000 sprawdzeń miesięcznie | 🔵 do obejrzenia raz na miesiąc — przy TTL 1 dzień zużycie to ok. 1 000–1 500 |
| 9 | Widoczność repozytorium | 🔵 rekomendacja: zostawić publiczne (pkt 15.4 analizy bezpieczeństwa) |
| 10 | Opcja B — konta i role | 🔵 cel docelowy, osobny projekt, bez terminu |

**Punkt 8 wymaga jednego zdania wyjaśnienia:** po włączeniu wymuszania przekroczenie darmowego
limitu przestaje być nieszkodliwe — aplikacja przestałaby działać do końca miesiąca (albo do
kliknięcia *Unenforce*). Zapas jest bardzo duży (zużycie ok. 1 000–1 500 wobec limitu 10 000),
ale warto zerknąć na licznik po pierwszym pełnym miesiącu.

---

## 8. Prostym językiem

Kliknięcie *Enforce* było ostatnim krokiem tego etapu. **Nic więcej nie trzeba klikać ani wklejać
— reguły zostają takie, jakie są.** Od tej chwili do bazy nie dostanie się żaden obcy program,
a jedyne, co pozostało otwarte, to możliwość grzebania w danych przez kogoś, kto otworzy Pana
stronę i zna konsolę przeglądarki. Tego nie da się naprawić regułami, bo w aplikacji nie ma
logowania — reguła nie ma po czym poznać, kto pyta. Naprawiłyby to dopiero prawdziwe konta
graczy, czyli osobny, duży projekt, którego nie trzeba robić teraz.

Na najbliższe dni zostaje tylko sprawdzenie, czy aplikacja normalnie działa — i pamięć o tym,
że *Unenforce* w tym samym miejscu cofa wszystko natychmiast.
