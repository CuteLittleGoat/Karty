# Weryfikacja poprawności klucza FIREBASE_SERVICE_ACCOUNT_JSON (2026-02-23)

## Prompt użytkownika
"Przeczytaj pliki:
Analizy/Brak_Dostepu_Firebase_LoginIHaslo.md
Analizy/Weryfikacja_Dostepu_Firebase_Codex_2026-02-23.md

Jak sprawdzić czy tajny klucz o nazwie \"FIREBASE_SERVICE_ACCOUNT_JSON\" zapisany w ustawieniach Codex jest poprawny?
Jeżeli jest poprawny to gdzie może jeszcze leżeć przyczyna błędu?"

## Co zostało sprawdzone
1. Przeczytano wcześniejsze analizy:
   - `Analizy/Brak_Dostepu_Firebase_LoginIHaslo.md`
   - `Analizy/Weryfikacja_Dostepu_Firebase_Codex_2026-02-23.md`
2. W tej sesji wykonano test odczytu sekretu:

```bash
python - <<'PY'
import os, json
v=os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
print('SET:', bool(v))
if v:
    try:
        j=json.loads(v)
        print('PROJECT:', j.get('project_id'))
        print('EMAIL:', j.get('client_email'))
        print('TYPE:', j.get('type'))
    except Exception as e:
        print('JSON_ERROR:', e)
PY
```

Wynik: `SET: False`

## Jak sprawdzić, czy klucz jest poprawny (checklista)

### Krok A — czy sekret jest widoczny w sesji Codex
Uruchom:

```bash
python - <<'PY'
import os
v=os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
print('SET:', bool(v))
print('LEN:', len(v) if v else 0)
PY
```

Interpretacja:
- `SET: False` -> problem nie jest w Firebase, tylko w przekazaniu sekretu do sesji.
- `SET: True` i sensowna długość (zwykle > 1000) -> przejdź dalej.

### Krok B — czy JSON jest poprawny i kompletny
Uruchom:

```bash
python - <<'PY'
import os, json
v=os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
j=json.loads(v)
required=[
  'type','project_id','private_key_id','private_key','client_email','client_id','token_uri'
]
missing=[k for k in required if not j.get(k)]
print('MISSING:', missing)
print('TYPE_OK:', j.get('type')=='service_account')
print('EMAIL:', j.get('client_email'))
print('PROJECT:', j.get('project_id'))
print('PK_FORMAT_OK:', str(j.get('private_key','')).startswith('-----BEGIN PRIVATE KEY-----'))
print('TOKEN_URI_OK:', j.get('token_uri')=='https://oauth2.googleapis.com/token')
PY
```

Interpretacja:
- `MISSING: []` + `TYPE_OK: True` + `PK_FORMAT_OK: True` -> format klucza poprawny.
- Jeśli `JSONDecodeError` albo pola brakują -> sekret jest uszkodzony/ucięty.

### Krok C — czy klucz naprawdę działa (autoryzacja Google OAuth)
Uruchom:

```bash
python - <<'PY'
import os, json
from google.oauth2 import service_account
from google.auth.transport.requests import Request

info=json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT_JSON'])
scopes=['https://www.googleapis.com/auth/cloud-platform']
creds=service_account.Credentials.from_service_account_info(info, scopes=scopes)
creds.refresh(Request())
print('TOKEN_OK:', bool(creds.token))
print('SERVICE_ACCOUNT:', info.get('client_email'))
PY
```

Interpretacja:
- `TOKEN_OK: True` -> klucz kryptograficznie poprawny i akceptowany przez Google.
- Błędy typu `invalid_grant`, `invalid_scope`, `unauthorized_client` -> klucz/rola/konfiguracja IAM do poprawy.

## Jeżeli klucz jest poprawny — gdzie jeszcze może być błąd?
1. **Sekret nie został podany do tej konkretnej sesji** (najczęstsze):
   - sekret dodany po starcie kontenera,
   - brak restartu środowiska,
   - inny profil środowiska niż ten użyty przez zadanie.
2. **Nie ten projekt Firebase/GCP**:
   - `project_id` w kluczu nie zgadza się z projektem, w którym sprawdzasz dane/Rules.
3. **Braki IAM mimo poprawnego klucza**:
   - konto serwisowe nie ma ról np. `Firebase Authentication Admin`, `Cloud Datastore User/Owner`, `Firebase Rules Admin`.
4. **Włączone API nie w tym projekcie**:
   - `Identity Toolkit API`, `Cloud Firestore API`, `Firebase Management API`, `Cloud Resource Manager API` muszą być aktywne dokładnie tam, gdzie wskazuje `project_id`.
5. **Błąd reguł Firestore/Storage**:
   - aplikacja kliencka może dostawać `PERMISSION_DENIED` mimo że Admin SDK działa.
6. **Błąd po stronie aplikacji, nie klucza**:
   - błędny `apiKey`/`authDomain` po stronie frontu,
   - logowanie inną metodą niż włączona w Firebase Auth,
   - odwołanie do złej kolekcji/ścieżki danych.
7. **Ograniczenia sieciowe/egresowe środowiska**:
   - blokada dostępu do `oauth2.googleapis.com` lub endpointów Firebase w danej sesji.

## Wniosek dla bieżącej sesji
W tej sesji `FIREBASE_SERVICE_ACCOUNT_JSON` nie jest dostępny (`SET: False`), więc nie można potwierdzić poprawności samej zawartości klucza ani wykonać testów OAuth/Firebase.
