# Main — instrukcja obsługi UI

## Sekcja użytkownika

## 1. Wejście do modułu
1. Otwórz `Main/index.html`.
2. W prawym górnym rogu kliknij **Instrukcja**, aby otworzyć tę instrukcję w oknie modalnym.
3. Domyślnie otwiera się widok użytkownika.

## 2. Zakładki użytkownika

### 2.1 Aktualności
- Cel: odczyt najnowszej wiadomości od administratora.
- Elementy:
  - pole tylko do odczytu **Najnowsze**,
  - status ładowania pod polem.
- Pola ręczne/obliczalne:
  - użytkownik nic nie wpisuje,
  - cała treść jest uzupełniana automatycznie.

### 2.2 Regulamin
- Cel: odczyt aktualnego regulaminu gry.
- Elementy:
  - pole tylko do odczytu **Obowiązujące zasady**,
  - status ładowania.
- Pola ręczne/obliczalne:
  - użytkownik nic nie wpisuje,
  - zawartość pobiera się automatycznie.

### 2.3 Strefa gracza
1. Wejdź do zakładki **Strefa Gracza**.
2. Wpisz PIN (5 cyfr) w polu logowania.
3. Kliknij **Otwórz**.
4. Po poprawnym PIN-ie odblokują się sekcje zgodne z uprawnieniami gracza.

#### Dostępne sekcje w Strefie gracza

#### A) Najbliższa gra
- Podgląd tabeli z planowaną rozgrywką.
- Brak ręcznej edycji danych przez użytkownika.
- Dane są automatyczne (odczyt).

#### B) Czat
- Przyciski:
  - **Wyślij** — wysyła wpis z pola wiadomości.
- Pola:
  - **Twoja wiadomość** — pole ręczne (wpis użytkownika),
  - lista wiadomości — automatyczna.

#### C) Gry do potwierdzenia
- Przyciski zależne od rekordu:
  - **Potwierdź** / **Anuluj** udział,
  - **Szczegóły**,
  - **Notatki** (odczyt).
- Pola ręczne/obliczalne:
  - status potwierdzenia ustawiasz ręcznie przyciskami,
  - dane gry i statusy pozostałych graczy są automatyczne.

#### D) Gry użytkowników
- Przyciski:
  - wybór roku (lista po lewej),
  - **Dodaj** (nowa gra),
  - **Szczegóły**,
  - **Notatki**.
- Pola ręczne:
  - pola formularzy i notatek w otwartych widokach.
- Pola automatyczne:
  - część podsumowań i list budowana jest automatycznie na podstawie danych gry.

#### E) Statystyki
- Przyciski:
  - wybór roku,
  - **Eksportuj**.
- Pola ręczne/obliczalne:
  - użytkownik nie wpisuje danych bezpośrednio do tabel statystyk,
  - wartości w tabelach/rankingu są obliczalne i prezentowane automatycznie.

---

## Sekcja administratora

## 3. Pasek górny
- **Instrukcja** — otwiera modal z instrukcją modułu Main.
- Czerwony komunikat o haśle admina — element informacyjny (bez akcji).

## 4. Zakładki administratora

### 4.1 Aktualności
- Pole ręczne: **Treść wiadomości**.
- Przycisk: **Wyślij**.
- Pole obliczalne/automatyczne: status operacji.

### 4.2 Czat
- Przycisk: **Usuń starsze niż 30 dni**.
- Lista wiadomości jest automatyczna.

### 4.3 Regulamin
- Pole ręczne: **Treść regulaminu**.
- Przycisk: **Zapisz**.

### 4.4 Notatki
- Pole ręczne: **Treść notatek**.
- Przycisk: **Zapisz**.

### 4.5 Gracze
- Przyciski: **Dodaj**, przyciski akcji w wierszach (np. usuwanie/edycja).
- Pola ręczne: nazwa gracza, PIN, uprawnienia, konfiguracje lat.
- Pola automatyczne: listy i statusy po zapisach.

### 4.6 Gry admina
- Przyciski: wybór roku, **Dodaj**, **Szczegóły**, **Usuń**.
- Pola ręczne: dane gry i dane w szczegółach.
- Pola automatyczne: zestawienia i rankingi zależne od danych.

### 4.7 Statystyki
- Przyciski: wybór roku, **Eksportuj**.
- Pola ręczne: wybrane pola korekt/statystyk ręcznych.
- Pola automatyczne: ranking i większość metryk statystycznych.

### 4.8 Gry użytkowników
- Przyciski: wybór roku, **Dodaj**, **Szczegóły**, **Notatki**.
- Pola ręczne: dane edytowane w formularzach.
- Pola automatyczne: listy i agregacje.

### 4.9 Najbliższa gra
- Pola ręczne: dane tabeli najbliższej gry.
- Pola automatyczne: elementy pomocnicze/statusy.

### 4.10 Gry do potwierdzenia
- Przyciski: odświeżanie widoku, wejście w **Szczegóły**.
- Pola automatyczne: statusy potwierdzeń i podsumowania.

### 4.11 Kalkulator
- Przyciski:
  - wybór trybu (**Tournament1**, **Tournament2**, **Cash**),
  - akcje per tabela (zgodnie z widocznymi przyciskami),
  - przyciski modali (np. potwierdzenie/zamknięcie).
- Pola ręczne:
  - stawki, wartości wejściowe, pola edytowalne w tabelach.
- Pola obliczalne:
  - wyniki kalkulacji, podsumowania, wartości pochodne.
