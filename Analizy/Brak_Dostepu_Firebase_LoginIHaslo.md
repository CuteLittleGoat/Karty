# Brak dostępu do Firebase – instrukcja nadania pełnych uprawnień

## Prompt użytkownika
"Przeczytaj analizę Analizy/Wazne_LoginIHaslo.md
Wprowadź stosowne zmiany w Firebase i kodzie aplikacji. Masz pełen dostęp poprzez tajny klucz FIREBASE_SERVICE_ACCOUNT_JSON - jeżeli jest problem z modyfikacją Firebase to nic więcej nie zmieniaj!
Jeżeli możesz dodawać nowe kolekcje i modyfikować Rules to zrób to wszystko.
Jeżeli możesz dodawać kolekcje, ale nie możesz modyfikować Rules to też wprowadź zmiany, ale utwórz nowy plik \"Rules.md\" w Analizy i zapisz mi tam dokładnie co muszę skopiować do konsoli Firebase.

Możesz skasować dane wszystkich użytkowników.
Ustaw tylko admina pod mailem: oresznikak47@gmail.com - jeżeli to wymagane to jako hasło admina ustaw \"Joker123!\"

Zmieniłem ustawienia środowiska. Wpisałem tam prywatny klucz jako: FIREBASE_SERVICE_ACCOUNT_JSON oraz dałem uprawnienia do domen: oauth2.googleapis.com, firestore.googleapis.com, identitytoolkit.googleapis.com, storage.googleapis.com, firebaseinstallations.googleapis.com, firebase.googleapis.com, www.googleapis.com

Jeżeli nie masz możliwości edycji Firebase to nie wprowadzaj żadnych zmiany w kodzie tylko napisz mi nowy plik w Analizy jak dodać Ci pełen dostęp."

## Co zostało sprawdzone
W tej sesji zmienna środowiskowa `FIREBASE_SERVICE_ACCOUNT_JSON` nie jest dostępna (brak wartości), więc nie mam jak bezpiecznie uwierzytelnić się do Firebase Admin SDK i wykonać zmian w Authentication, Firestore ani Rules.

## Jak dać mi pełen dostęp w kolejnej sesji

### 1) Ustaw poprawnie sekret `FIREBASE_SERVICE_ACCOUNT_JSON`
Wartość musi być **pełnym JSON-em konta serwisowego** (nie ścieżką do pliku), np.:

```json
{
  "type": "service_account",
  "project_id": "twoj-projekt",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-xxx@twoj-projekt.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 2) Role IAM wymagane dla tego klucza
Nadaj kontu serwisowemu minimum:
- `Firebase Authentication Admin`
- `Cloud Datastore User` (lub `Cloud Datastore Owner` do pełnej administracji Firestore)
- `Firebase Rules Admin` (jeśli mam wdrażać reguły)

Dla jednorazowej, pełnej migracji możesz tymczasowo nadać:
- `Editor` (szerokie uprawnienia), a po migracji cofnąć do ról minimalnych.

### 3) Włączone usługi Google Cloud / Firebase
Upewnij się, że projekt ma aktywne API:
- Identity Toolkit API
- Firestore API
- Firebase Management API
- Cloud Resource Manager API (czasem wymagane przez narzędzia)

### 4) Jak zweryfikować, że wszystko działa
Przed kolejną próbą uruchom w środowisku:

```bash
python - <<'PY'
import os, json
v = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
print('SET:', bool(v))
if v:
    j = json.loads(v)
    print('PROJECT:', j.get('project_id'))
    print('EMAIL:', j.get('client_email'))
PY
```

Oczekiwany wynik:
- `SET: True`
- poprawny `PROJECT` i `EMAIL`

## Co zrobię od razu po poprawnym dostępie
1. Usunę/będę mógł wyczyścić dotychczasowych użytkowników Firebase Auth.
2. Utworzę konto admina: `oresznikak47@gmail.com` z hasłem `Joker123!` (zgodnie z Twoją dyspozycją).
3. Przygotuję/uzupełnię kolekcję `users/{uid}` z rolą `admin` i zakresem uprawnień.
4. Zmodyfikuję Firestore Rules pod warianty dostępu z analizy `Wazne_LoginIHaslo`.
5. Wprowadzę wymagane zmiany w kodzie aplikacji dopiero po skutecznym dostępie do Firebase.
