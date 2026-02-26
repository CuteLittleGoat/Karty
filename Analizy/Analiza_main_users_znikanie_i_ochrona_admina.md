# Analiza: znikanie kolekcji `main_users` i zabezpieczenie konta admina

## Prompt użytkownika
"Z Firebase zniknęła mi kolekcja main_users. Przeprowadź analizę czy to dlatego, że z zakładki Gracze usunąłem wszystkie wpisy? Przeprowadź analizę jak wprowadzić zabezpieczenie, żeby kolekcja nie znikała. Zaraz ją ręcznie odtworzę i ponownie utworzę konto admina. Napisz mi co zrobić, żeby przez UI nie dało się skasować konta admina (user id: AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2)"

## 1) Czy kolekcja `main_users` mogła zniknąć po usunięciu wpisów w zakładce „Gracze”?

Tak — to jest najbardziej prawdopodobny scenariusz.

W module `Main` przycisk **Usuń** w zakładce graczy wykonuje:
- `db.collection("main_users").doc(player.id).delete()` — czyli usuwa dokument użytkownika z kolekcji `main_users`.
- następnie próbuje usunąć konto z Firebase Authentication przez callable `deleteMainUserAccount`.

Jeśli usunięto ostatni dokument z `main_users`, Firestore w konsoli przestaje pokazywać kolekcję (bo kolekcja bez dokumentów „nie istnieje” jako byt widoczny w UI konsoli).

## 2) Co oznacza „zniknięcie kolekcji” w Firestore

To zwykle nie jest awaria struktury, tylko standardowe zachowanie Firestore:
- kolekcja jest widoczna tylko, gdy ma co najmniej 1 dokument,
- po usunięciu ostatniego dokumentu kolekcja znika z widoku,
- po dodaniu nowego dokumentu o tej samej nazwie kolekcja pojawia się ponownie.

## 3) Jak zabezpieczyć konto admina przed usunięciem z UI

Admin UID do ochrony:
- `AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2`

### Warstwa A (UI, szybka i czytelna dla operatora)
W `Main/app.js` dodaj stałą z chronionymi UID i zablokuj przycisk usuwania dla tego rekordu.

Rekomendacja:
1. Dodać np.:
   - `const PROTECTED_MAIN_USER_IDS = new Set(["AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2"]);`
2. W renderze wiersza gracza:
   - dla chronionego UID ustawić `deleteButton.disabled = true`,
   - zmienić etykietę np. na `Chroniony`,
   - dodać `title` z informacją dlaczego.
3. Dodatkowo (obowiązkowo) zostawić guard także w handlerze `click`, aby nawet przy manipulacji DOM nie wykonać kasowania.

### Warstwa B (backend / bezpieczeństwo właściwe)
Samo UI nie jest wystarczające (da się ominąć przez DevTools/skrypt). Trzeba dodać blokadę po stronie Firebase:

1. **Cloud Function** `deleteMainUserAccount`:
   - na początku funkcji dodać warunek: jeśli `uid === "AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2"` -> rzucić błąd `permission-denied`.
2. **Firestore Security Rules**:
   - zablokować `delete` dokumentu `main_users/AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2` dla wszystkich klientów.
   - opcjonalnie dopuścić tylko konto serwisowe Admin SDK (poza rules), jeśli kiedyś będzie kontrolowana migracja.

Przykładowy fragment rules (do dostosowania do aktualnych reguł projektu):

```rules
match /databases/{database}/documents {
  match /main_users/{userId} {
    allow delete: if request.auth != null
                  && request.auth.token.admin == true
                  && userId != "AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2";

    // Pozostałe reguły read/create/update zgodnie z obecnym projektem.
  }
}
```

> Uwaga: jeśli nie używasz custom claims (`request.auth.token.admin`), warunek administracyjny trzeba oprzeć o obecny mechanizm autoryzacji.

## 4) Jak ograniczyć ryzyko „znikania kolekcji”

Masz 2 praktyczne strategie:

### Strategia 1 (najprostsza): nigdy nie usuwać konta admina
Jeżeli admin jest zawsze obecny w `main_users`, kolekcja nie zniknie.

### Strategia 2 (techniczna): dokument „keepalive”
Utrzymuj stały dokument systemowy w `main_users`, np. `__system_keepalive` i zablokuj jego usuwanie regułami.

Konsekwencja:
- UI graczy musi filtrować taki dokument, aby nie był wyświetlany jak zwykły użytkownik.
- To podejście jest dobre, gdy chcesz mieć gwarancję widoczności kolekcji niezależnie od stanu kont.

## 5) Co zrobić teraz (checklista po ręcznym odtworzeniu)

1. Odtwórz dokument admina `main_users/AV9s1NNHl3Rq4pT4HnfQ7y9ELxa2`.
2. Wdróż blokadę usuwania admina w UI (warstwa A).
3. Wdróż blokadę usuwania admina w Cloud Function `deleteMainUserAccount` (warstwa B.1).
4. Zaktualizuj Firestore Rules, aby nie dało się skasować dokumentu admina z klienta (warstwa B.2).
5. (Opcjonalnie) dodaj `__system_keepalive`, jeśli chcesz by kolekcja była stale widoczna nawet bez kont użytkowników.
6. Test:
   - spróbuj usunąć zwykłego gracza -> ma działać,
   - spróbuj usunąć admina przez UI -> ma być zablokowane,
   - spróbuj usunąć admina bezpośrednim zapytaniem z klienta -> ma być `permission-denied`.

## 6) Wniosek końcowy

Najpewniej `main_users` zniknęła dlatego, że z UI usunięto wszystkie dokumenty (w tym ostatni), co jest naturalnym zachowaniem Firestore. Trwałe zabezpieczenie powinno być dwuwarstwowe: blokada w UI + twarda blokada w Firebase (Cloud Function i reguły). Bez warstwy backendowej konto admina nadal może zostać usunięte poza UI.
