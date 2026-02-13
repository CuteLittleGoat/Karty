# Analiza: rozdzielenie „Notatki do gry” i „Notatki po grze”

## Prompt użytkownika (kontekst)
> Zmodyfikuj zasadę działania przycisku "Notatki" w zakładce "Gry admina" i "Gry użytkownika".
> Chcę mieć dwa rodzaje przycisków.
> "Notatki do gry" i "Notatki po grze".
> 1. Przycisk "Notatki po grze" ma się pojawiać przy sekcji "Podsumowanie gry".
> 1b. Przycisk "Notatki po grze" ma wyświetlać wyskakujące okienko z polem tekstowym i przyciskami "Zapisz" oraz "Usuń". Przycisk "Zapisz" zapisuje wpisaną treść. Przycisk "Usuń" usuwa całą wpisaną treść.
> 1c. Dane muszą się zapisywać w aplikacji i być dostępne między sesjami przeglądarki.
> 2. Przycisk "Notatki do gry" ma się pojawić przy sekcji "Tworzenie gier".
> 2b. Przycisk "Notatki do gry" ma wyświetlać wyskakujące okienko z polem tekstowym i przyciskami "Zapisz" oraz "Domyślne". Przycisk "Zapisz" zapisuje wpisaną treść. Przycisk "Domyślne" przywraca domyślną treść.
> 2c. Domyślna treść to:
> Przewidywani gracze:
> Rebuy:
> Addon:
> Inne:
> 2d. Osoba tworząca grę może dowolnie edytować treść w tym również usuwać domyślną treść.
> 2e. Dane muszą się zapisywać w aplikacji i być dostępne między sesjami przeglądarki.
> W widoku użytkownika do potwierdzenia gier ma być przycisk "Notatki do gry". Jego naciśnięcie wyświetli treść zapisaną w "Notatki do gry" w trybie tylko do odczytu.
> W dokumentacji masz aktualną konfigurację Firebase i Rules. Sprawdź czy obecna konfiguracja wystarczy do wprowadzenia takiej funkcjonalności, żeby oba rodzaje przycisków działały niezależnie od siebie.
> Zmodyfikuj treść Analizy/Notatki.md uwzględniając doprecyzowane wymagania odnośnie działania przycisków. Jeżeli wymagana jest nowa konfiguracja Firebase to napisz co trzeba zrobić w Notatki.md

---

## 1. Decyzja projektowa

Aby oba typy notatek działały niezależnie, notatki zostały rozdzielone na dwa pola w dokumencie gry:

- `preGameNotes` — dla przycisku **Notatki do gry**,
- `postGameNotes` — dla przycisku **Notatki po grze**.

Dzięki temu treści nie nadpisują się wzajemnie.

## 2. Zachowanie UI

### 2.1 Tworzenie gier (Gry admina + Gry użytkowników)

- Przycisk: **Notatki do gry**.
- Modal: pole tekstowe + przyciski **Zapisz** i **Domyślne**.
- **Domyślne** przywraca szablon:
  - `Przewidywani gracze:`
  - `Rebuy:`
  - `Addon:`
  - `Inne:`
- Użytkownik może dowolnie edytować treść, w tym usunąć całość i zapisać pustą wartość.

### 2.2 Podsumowanie gry

- Przycisk: **Notatki po grze**.
- Modal: pole tekstowe + przyciski **Zapisz** i **Usuń**.
- **Usuń** zapisuje pustą treść (czyści całą notatkę po grze).

### 2.3 Gry do potwierdzenia

- Przycisk: **Notatki do gry**.
- Modal otwierany w trybie tylko do odczytu (`read-only`) z treścią `preGameNotes`.

## 3. Trwałość danych między sesjami

Dane zapisywane są w Firestore (`Tables` i `UserGames`) bezpośrednio w dokumentach gier, więc po ponownym uruchomieniu przeglądarki pozostają dostępne.

## 4. Kompatybilność historyczna

Dla starszych dokumentów zachowano odczyt fallback do legacy pola `notes` (dla notatek „do gry”), aby nie utracić poprzednich wpisów po wdrożeniu.

## 5. Ocena konfiguracji Firebase i Rules

Na podstawie aktualnej dokumentacji reguł Firestore (`allow read, write: if true;` dla `Tables` i `UserGames`) obecna konfiguracja jest wystarczająca.

### Wniosek

- **Nie jest wymagana nowa konfiguracja Firebase ani zmiana Rules**, aby wdrożyć funkcję.
- Wystarczy wdrożenie zmian w frontendzie oraz zapis nowych pól (`preGameNotes`, `postGameNotes`) w istniejących dokumentach gry.
