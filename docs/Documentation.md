# Karty — dokumentacja techniczna aplikacji

## 1. Zakres dokumentu
Ten dokument opisuje aktualny stan aplikacji od strony technicznej: architekturę frontendu, działanie wszystkich modułów UI, logikę biznesową, walidacje, mechanizmy zapisu i odczytu danych, style oraz komponenty.

> Cel: umożliwić odtworzenie aplikacji przez innego developera wyłącznie na podstawie tej dokumentacji i kodu źródłowego.

Dokument **celowo nie zawiera**:
- opisu struktury Firebase (schematów kolekcji/dokumentów),
- skryptu bootstrapującego bazę.

## 2. Architektura aplikacji

### 2.1 Warstwa prezentacji
- `Main/index.html` zawiera kompletny, statyczny szkielet interfejsu:
  - panel administratora (zakładki i sekcje robocze),
  - strefę gracza (zakładki użytkownika),
  - modale (szczegóły gier, uprawnienia, notatki, instrukcja, rebuy kalkulatora).

### 2.2 Warstwa stylów
- `Main/styles.css` odpowiada za:
  - system zmiennych CSS (kolory, cienie, spacing, promienie, rozmiary fontów),
  - motyw dark/noir z akcentami złota i zieleni,
  - layout panelowy, tabele, formularze, przyciski, modale,
  - responsywność i przewijanie poziome dla szerokich tabel,
  - klasy statusowe/rankingowe oraz wizualne stany elementów (hover/focus/active).

### 2.3 Warstwa logiki
- `Main/app.js` realizuje:
  - inicjalizację modułów,
  - obsługę zakładek admin/user,
  - PIN-gate i sesje dostępu per moduł,
  - CRUD danych aplikacji,
  - renderowanie tabel i modali,
  - obliczenia statystyk, rankingów i kalkulatora,
  - integrację z Firestore (subskrypcje i zapisy debounced),
  - eksport danych statystycznych.

### 2.4 Konfiguracja integracji
- `config/firebase-config.js` dostarcza konfigurację klienta Firebase używaną przez frontend (`window.firebaseConfig`).

## 3. UI i komponenty (pełny zakres)

## 3.1 Panel administratora
Panel składa się z 10 zakładek.

### A) Aktualności
- Pole tekstowe wiadomości + akcja publikacji.
- Natychmiastowe odświeżenie sekcji „Aktualności” po stronie gracza.
- Komunikaty statusu (powodzenie/błąd).

### B) Czat
- Widok listy wiadomości.
- Moderacja pojedynczych wiadomości.
- Akcja czyszczenia wpisów starszych niż 30 dni.

### C) Regulamin
- Edytor tekstu regulaminu.
- Zapis centralnej treści wyświetlanej w strefie gracza.

### D) Gracze
- Tabela zarządzania graczami z polami:
  - aktywność aplikacji,
  - nazwa,
  - PIN,
  - akcje.
- Dodawanie/usuwanie/edycja graczy.
- Modal uprawnień zakładek (dostępy per użytkownik).
- Modal dostępnych lat statystyk (filtrowanie widoku statystyk gracza).
- Podsumowanie liczby graczy + statusy operacji.

### E) Gry admina
- Lista gier z filtrem po roku.
- Dodawanie nowych gier z walidacją daty i domyślnym nazewnictwem.
- Edycja metadanych gry (typ, data, nazwa, status zamknięcia).
- Modal „Szczegóły gry”:
  - dynamiczne wiersze graczy,
  - edycja wpisowego, rebuy/add-on, wypłaty, punktów,
  - flaga mistrzostwa,
  - usuwanie wierszy,
  - kolumna LP,
  - metryka puli gry.
- Sekcja podsumowań i notatek (przed/po grze).
- Sekcja agregacji per rok:
  - tabela metryk globalnych,
  - tabela statystyk graczy,
  - ranking z kolorowaniem pozycji.

### F) Statystyki (admin)
- Wybór roku.
- Tabela metryk globalnych.
- Tabela statystyk per gracz.
- Wagi `Waga1–Waga6` edytowalne ręcznie.
- Hurtowa zmiana wag przyciskami nagłówkowymi.
- Sterowanie widocznością kolumn dla widoku gracza.
- Ranking liczony z formuły ważonej.
- Eksport XLSX.

### G) Gry użytkowników (admin)
- Analogiczny moduł do „Gry admina”, ale operujący na grach tworzonych przez użytkowników.
- Podgląd autora gry i pełna administracyjna edycja wpisów.

### H) Najbliższa gra (admin)
- Tabela aktywnych najbliższych gier.
- Informacja, czy wszyscy gracze potwierdzili udział.

### I) Gry do potwierdzenia (admin)
- Lista gier z panelem statusów potwierdzeń.
- Podgląd szczegółów gry i notatek.
- Ręczna korekta statusów potwierdzeń.

### J) Kalkulator
- Dwa tryby działania: `Tournament` i `Cash`.
- Zestaw pięciu tabel dynamicznych:
  1. Parametry wejściowe puli (`Buy-In`, `Rebuy`, liczby rebuy).
  2. Lista graczy i ich rebuye.
  3. Procent podziału.
  4. Kolejność eliminacji.
  5. Wynikowe wypłaty.
- Modal szczegółowej edycji wielu rebuy jednego gracza.
- Auto-przeliczenia wartości po każdej zmianie.
- Debounced autosave stanu obu trybów.

## 3.2 Strefa gracza
Strefa gracza składa się z 7 zakładek.

### A) Najbliższa gra
- PIN-gate (5 cyfr).
- Tabela odczytu najbliższych gier.
- Informacja o pełnym/niepełnym potwierdzeniu składu.

### B) Aktualności
- Odczyt ostatniego komunikatu administratora.

### C) Regulamin
- Odczyt aktualnych zasad.

### D) Czat
- PIN-gate.
- Lista wiadomości i formularz wysyłki.
- Autor wiadomości identyfikowany graczem zalogowanym PIN-em.

### E) Gry do potwierdzenia
- PIN-gate.
- Lista aktywnych gier.
- Akcje: `Potwierdź`, `Anuluj`, `Szczegóły`, `Notatki do gry`.
- Modal szczegółów gry tylko do odczytu.

### F) Gry użytkowników
- PIN-gate.
- Lista lat + lista gier w roku.
- Tworzenie nowej gry przez użytkownika.
- Edycja własnych wpisów gry i szczegółów graczy.
- Notatki przed grą oraz podgląd metryki puli.

### G) Statystyki
- PIN-gate.
- Lista lat dostępnych dla danego gracza.
- Tabele metryk i ranking.
- Eksport XLSX.

## 3.3 Modale i warstwa interakcji
Aplikacja korzysta z wielu modali zarządzanych klasą `is-visible` i atrybutami `aria-hidden`:
- instrukcja,
- notatki podsumowania,
- uprawnienia gracza,
- lata statystyk,
- szczegóły gry admina,
- szczegóły gry użytkownika (admin i gracz),
- szczegóły gry z potwierdzeń,
- modal rebuy kalkulatora.

Wspólne zachowania:
- zamknięcie przez `X`, klik poza modalem, `Escape`,
- blokada scrolla tła (`body.modal-open`),
- odtwarzanie focusu na aktywnych inputach po rerenderze.

## 4. Logika biznesowa i obliczenia

### 4.1 PIN i dostęp
- Każdy obszar chroniony PIN-em ma osobny klucz sesji (`sessionStorage`), co pozwala niezależnie autoryzować zakładki.
- PIN jest zawsze 5-cyfrowy; inputy sanitizują znaki nienumeryczne.
- Po poprawnym PIN zapisywany jest identyfikator gracza dla modułów zależnych od tożsamości (czat, potwierdzenia, gry użytkowników, statystyki).

### 4.2 Uprawnienia gracza
- Mechanizm uprawnień działa per zakładka.
- Zakładki „Aktualności” i „Regulamin” pozostają globalnie dostępne.
- Widoczność zakładek i sekcji jest aktualizowana dynamicznie po zmianach administracyjnych.

### 4.3 Gry, szczegóły i notatki
- Każda gra posiada metadane + listę wierszy graczy.
- Pula gry liczona jest jako suma wpłat (`wpisowe + rebuy/add-on`).
- Bilans gracza: `wypłata - (wpisowe + rebuy)`.
- Wspierane są notatki przed grą i po grze.
- Zaimplementowana jest migracja czyszcząca legacy pole `notes` (zastąpione przez `preGameNotes`/`postGameNotes`).

### 4.4 Potwierdzenia obecności
- Moduł potwierdzeń agreguje aktywne gry z wielu źródeł.
- Dla każdej gry liczony jest stan „czy wszyscy potwierdzili”.
- Użytkownik może potwierdzić i cofnąć potwierdzenie; admin może nadpisywać statusy.

### 4.5 Statystyki i ranking
- Dane statystyczne agregowane są rocznie.
- Wzór wyniku rankingowego:
  - `mistrzostwa * Waga1`
  - `+ procent udziału * Waga2`
  - `+ punkty * Waga3`
  - `+ (+/-) * Waga4`
  - `+ wypłaty * Waga5`
  - `+ wpłaty * Waga6`
- Domyślna wartość każdej wagi to `1`.
- Ranking sortowany malejąco po wyniku i rosnąco alfabetycznie przy remisie.

### 4.6 Kalkulator
- Dla każdego trybu (`Tournament`, `Cash`) utrzymywany jest osobny stan.
- Stan obejmuje:
  - parametry buy-in/rebuy,
  - listę graczy,
  - wielokrotne rebuye,
  - procenty podziału,
  - kolejność eliminacji,
  - wyliczone wypłaty.
- Walidacja wejść jest numeryczna (cyfry).
- Zapisy są odroczone (`debounce`), aby ograniczyć liczbę operacji zapisu.

## 5. Integracja backendowa (bez opisu schematu)

### 5.1 Charakter integracji
- Frontend korzysta z Firebase/Firestore jako backendu typu BaaS.
- Dominują operacje:
  - subskrypcje czasu rzeczywistego (`onSnapshot`) dla list i paneli,
  - zapisy częściowe (`set(..., { merge: true })`),
  - aktualizacje (`update`),
  - usuwanie (`delete`) elementów i kolekcji podrzędnych.

### 5.2 Obsługa błędów
- Błędy backendowe są normalizowane i mapowane na komunikaty dla UI.
- Każdy moduł posiada własne pole statusu tekstowego (`aria-live`) sygnalizujące powodzenie/niepowodzenie.

### 5.3 Spójność danych
- Używany jest mechanizm odświeżeń panelu admina.
- Wybrane operacje zapisowe są debounced.
- Widoki roczne przechowują ostatni wybór roku lokalnie (`localStorage`) dla zachowania kontekstu pracy.

## 6. System stylów, typografia, UX

### 6.1 Fonty
Aplikacja ładuje fonty Google:
- `Cinzel` (nagłówki główne),
- `Cormorant Garamond` (podtytuły),
- `Rajdhani` (elementy panelowe),
- `Inter` (tekst użytkowy).

### 6.2 Kolorystyka i motyw
- Motyw ciemny oparty o zielenie stołu + złote akcenty.
- Kontrast wzmacniany cieniami i glow (`--glow-gold`, `--glow-neon`).
- Styl spójny dla tabel, formularzy i przycisków akcji.

### 6.3 Responsywność
- Layout oparty o CSS Grid i sekcje kartowe.
- Szerokie tabele renderowane w kontenerach z poziomym scrollowaniem.
- Formularze i nagłówki adaptują się przez `flex-wrap`.

## 7. Inicjalizacja aplikacji
- Funkcja `bootstrap()` uruchamia moduły w kolejności:
  - zakładki admin/user,
  - moduły wiadomości, regulaminu, czatu,
  - zarządzanie graczami,
  - gry admina/użytkowników,
  - potwierdzenia,
  - statystyki,
  - kalkulator,
  - modal instrukcji.
- Każdy moduł ma własną funkcję `init...`, dzięki czemu kod jest podzielony domenowo.

## 8. Wskazówki implementacyjne do odtworzenia aplikacji
Aby odtworzyć aplikację 1:1:
1. Odtwórz strukturę HTML z identycznymi identyfikatorami (`id`) i klasami CSS.
2. Zachowaj pełny system PIN-gate na poziomie zakładek.
3. Zaimplementuj ten sam model stanów lokalnych (gracze, gry, lata, rankingi, kalkulator).
4. Odtwórz wszystkie modale i ich cykl życia (otwieranie/zamykanie/focus).
5. Wdróż te same formuły statystyk i rankingów.
6. Wdróż kalkulator 5-tabelowy z modalem rebuy i autosave.
7. Dodaj komunikaty statusowe per sekcja z `aria-live`.
8. Zachowaj motyw wizualny (zmienne CSS, fonty, cienie, tabele, kolorystykę rankingów).

To są elementy krytyczne dla zgodności funkcjonalnej i UX z obecną wersją aplikacji.
