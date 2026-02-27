# Analiza wdrożenia: zakładka „Notatki admina” w Main i Second

## Prompt użytkownika
> W modułach Main i Second chciałbym mieć zakładkę "Notatki admina" widoczną tylko w widoku admina. Miałoby to być pole tekstowe do wpisywania tekstu i późniejszej modyfikacji/usuwania. Tekst ma się zapamiętywać między sesjami przeglądarki. Tekst zapisany w Main ma się wyświetlać tylko w Main a tekst wpisany w Second ma się zapisywać tylko w Second.
> Czy obecna struktura Firebase wystarczy? Jeżeli nie to jakie kolekcje należy dopisać?
> Przeprowadź analizę wdrożenia i zapisz jej wyniki w Analizy

## Stan obecny (wnioski techniczne)
1. **Main** ma już pełną integrację z Firestore dla zakładek admina (m.in. aktualności, regulamin, gracze), więc ma gotowy wzorzec odczyt/zapis + live update.
2. **Second** jest obecnie głównie szkieletem UI: ma panel admina i zakładki, ale bez analogicznej integracji danych dla większości sekcji (poza mechaniką wejścia w tryb admina).
3. W Main część danych globalnych trzymana jest w stałych kolekcjach/dokumentach (np. `admin_messages/admin_messages`, `app_settings/rules`) – taki sam schemat użyty równolegle w Second **nadpisywałby wspólne dane**.

## Odpowiedź na pytanie: czy obecna struktura Firebase wystarczy?
**Częściowo tak, ale nie wprost.**

- Technicznie Firestore i obecny sposób pracy aplikacji wystarczają do wdrożenia funkcji „Notatki admina”.
- Natomiast dla warunku separacji (`Main` widzi tylko swoje notatki, `Second` tylko swoje) trzeba dodać logiczne rozdzielenie danych per moduł.
- Bez tego oba moduły mogłyby czytać ten sam dokument i wzajemnie się nadpisywać.

## Rekomendowana struktura danych

### Wariant rekomendowany (najprostszy i czytelny)
Dodać nową kolekcję:
- `admin_notes`

Dodać 2 dokumenty:
- `admin_notes/main`
- `admin_notes/second`

Przykładowy dokument:
```json
{
  "text": "treść notatki",
  "updatedAt": <serverTimestamp>,
  "updatedBy": "web-admin",
  "module": "main"
}
```
(analogicznie `module: "second"`)

Dlaczego ten wariant:
- mała liczba odczytów,
- prosta walidacja i reguły bezpieczeństwa,
- łatwe rozszerzenie na kolejne moduły.

### Wariant alternatywny
Użyć istniejącej kolekcji `app_settings` i dodać dokumenty:
- `app_settings/admin_notes_main`
- `app_settings/admin_notes_second`

To też zadziała, ale semantycznie mniej czytelne niż wydzielone `admin_notes`.

## Wdrożenie funkcji (plan)

### 1) UI/UX
W obu modułach w panelu admina dodać zakładkę:
- „Notatki admina”

W zakładce:
- duże `textarea`,
- przycisk „Zapisz”,
- przycisk „Wyczyść” (ustawia pusty tekst),
- status operacji (zapisywanie / zapisano / błąd).

Zakładka ma być renderowana tylko w admin view (zgodnie z obecną architekturą obu modułów).

### 2) Odczyt/zapis
- Na wejściu zakładki: `onSnapshot` na dokumencie przypisanym do modułu.
- Zapis: `set(..., { merge: true })` z polami `text`, `updatedAt`, `updatedBy`, `module`.
- Usuwanie treści: zapis `text: ""` (zamiast kasowania dokumentu), aby uprościć logikę i historię metadanych.

### 3) Izolacja Main vs Second
- Main zawsze używa docId `main`.
- Second zawsze używa docId `second`.
- Nie opierać izolacji na samym filtrze w UI; izolacja ma wynikać z klucza dokumentu.

### 4) Trwałość między sesjami
Wymaganie „między sesjami przeglądarki” spełnia Firestore (persistencja po stronie backendu), więc localStorage nie jest konieczny jako źródło prawdy.

## Reguły Firestore (minimalny zakres)
Dla kolekcji `admin_notes` dopisać reguły analogiczne do innych sekcji admina:
- odczyt: wg obecnej polityki aplikacji,
- zapis: tylko admin,
- opcjonalnie walidacja `text is string`, długość np. do 20000 znaków, `module in ["main", "second"]`.

## Ryzyka i decyzje
1. **Konflikty edycji**: dwóch adminów może nadpisywać treść – akceptowalne przy prostym polu tekstowym.
2. **Brak separacji**: jeśli oba moduły użyją jednego dokumentu, dane będą się mieszać.
3. **Spójność UX**: warto użyć identycznych komunikatów statusu i zachowania przycisków w Main i Second.

## Podsumowanie
- **Tak, obecny Firebase wystarczy technologicznie.**
- **Należy dopisać logiczną przestrzeń danych dla notatek per moduł** (rekomendacja: nowa kolekcja `admin_notes` z dokumentami `main` i `second`).
- To spełni wymagania: tylko admin, edycja/usuwanie, trwałość między sesjami i pełna separacja danych między Main/Second.
