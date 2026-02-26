# Analiza problemu logowania (Main + Second) — aktualizacja

## Prompt użytkownika (pierwotny)
"Sprawdź poprawność działania przycisku \"Zaloguj\" w obu modułach.
Wpisuje maila oresznikak47@gmail.com (mail przypisany do admina) oraz hasło. Po naciśnięciu przycisku Zaloguj nic się nie dzieje."

## Prompt użytkownika (aktualizacja)
"Przeczytaj analizę analiza-logowanie-przycisk-zaloguj-oba-moduly.md i zmodyfikuj plik o nowe dane. Załączam screeny z Firebase. Załączam też aktualne Rules (...)"

## Nowe dane wejściowe z Firebase (ze screenów + rules)
1. **Authentication / Users**
   - Istnieje 1 użytkownik: `oresznikak47@gmail.com`.
   - Provider: **Email/Password** (włączony).
   - UID widoczny na screenie: `AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2`.

2. **Firestore / main_users**
   - Dokument `main_users/AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2` istnieje.
   - Kluczowe pola widoczne na screenach:
     - `displayName: "Main Admin"`
     - `email: "oresznikak47@gmail.com"`
     - `isActive: true`
     - `role: "admin"`
     - `moduleAccess.main: true`
     - `permissions` jako **obiekt/mapa** z wieloma flagami `true` (np. `chatTab`, `tablesTab`, `tournamentTab`, itd.).

3. **Aktualne Firestore Rules (istotne fragmenty)**
   - `main_users/{uid}`:
     - `allow read: if isOwner(uid) || hasMainAdminRole();`
     - `allow create: ... && request.resource.data.permissions is list;`
   - `second_users/{uid}`:
     - `allow read: if isOwner(uid) || hasSecondAdminRole();`
     - `allow create: ... && request.resource.data.permissions is list;`
   - `hasSecondAdminRole()` zależy od istnienia i roli admin w `second_users/{request.auth.uid}`.

## Aktualny wniosek po doprecyzowaniu danych
Sam przycisk `Zaloguj` najpewniej **nie jest problemem**. Najbardziej prawdopodobny problem leży w niespójności modelu danych Firestore vs reguły i/lub brakującym profilu dla modułu `Second`:

1. **Niespójność typu pola `permissions`**
   - W danych użytkownika `main_users` pole `permissions` jest mapą (obiektem z flagami).
   - W rules przy `create` wymagane jest: `request.resource.data.permissions is list`.
   - To oznacza, że tworzenie dokumentu z aktualnym formatem `permissions` przez aplikację zostanie zablokowane (`permission-denied`).

2. **Potencjalny brak/niezgodność profilu w `second_users/{uid}`**
   - Z dostarczonych screenów nie wynika potwierdzenie, że istnieje poprawny dokument `second_users/AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2` z rolą i polami wymaganymi przez aplikację.
   - Dla modułu `Second` dostęp i część logiki opierają się o `second_users`, a rules admina dla `Second` także bazują na tej kolekcji.

3. **Brak pola `isApproved` (jeśli aplikacja nadal je wymaga)**
   - W poprzedniej analizie wskazano warunek `isApproved !== false`.
   - Na aktualnych screenach dokumentu `main_users` nie widać pola `isApproved`.
   - Jeśli kod modułów nadal waliduje to pole, brak pola może dawać efekt „brak przejścia dalej” mimo poprawnego logowania auth.

## Co konkretnie poprawić w Firebase

### A) Ujednolicić model `permissions` z rules
Wybierz jedną ścieżkę i stosuj ją konsekwentnie w obu modułach:

1. **Jeśli `permissions` ma pozostać mapą (jak obecnie):**
   - zmień rules w `main_users` i `second_users` z:
   - `request.resource.data.permissions is list`
   - na walidację mapy (np. `request.resource.data.permissions is map`) albo usuń ten warunek, jeśli nie jest krytyczny.

2. **Jeśli `permissions` ma być listą:**
   - zmień zapis dokumentów użytkowników, by `permissions` było tablicą, nie obiektem.

### B) Zweryfikować komplet profilu dla obu modułów
Dla UID `AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2` sprawdź istnienie i spójność obu dokumentów:
- `main_users/AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2`
- `second_users/AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2`

Minimalny bezpieczny zestaw pól (przykładowo, zależnie od kodu):
```json
{
  "uid": "AV9s1NNHI3Rq4pT4HnfQ7y9ELxa2",
  "email": "oresznikak47@gmail.com",
  "role": "admin",
  "isActive": true,
  "isApproved": true
}
```

### C) Dostosować rules do realnych pól
Obecne rules dla update pozwalają ownerowi edytować dokument, ale blokują zmianę `permissions`, `isActive`, `role`. To jest OK dla bezpieczeństwa, jednak trzeba upewnić się, że aplikacja podczas logowania nie próbuje nadpisywać tych pól.

### D) Dodać twardą diagnostykę błędów po stronie aplikacji
Jeżeli UI pokazuje „nic się nie dzieje”, warto logować i wyświetlać użytkownikowi komunikat z kodem błędu Firebase (np. `auth/*`, `permission-denied`), aby od razu odróżnić błąd auth od błędu Firestore.

## Podsumowanie
- Email/Password jest włączony i konto auth istnieje.
- Profil `main_users` dla tego UID istnieje i ma rolę `admin`.
- Największa wykryta niespójność to typ `permissions` (mapa w danych vs `list` w rules).
- Dla pełnej poprawności logowania „w obu modułach” trzeba potwierdzić i ewentualnie uzupełnić `second_users/{uid}` oraz zgodność pól walidowanych przez kod (np. `isApproved`).
