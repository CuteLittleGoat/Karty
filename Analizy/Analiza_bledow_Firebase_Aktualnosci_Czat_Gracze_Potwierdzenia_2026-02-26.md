# Analiza błędów Firebase – Aktualności / Czat / Gracze / Gry do potwierdzenia

## Prompt użytkownika
> Sprawdź poprawność połączenia z Firebase. Dużo elementów aplikacji zwraca błędy.
> Przykładowo zakładka "Aktualności" - Nie udało się wysłać wiadomości. Sprawdź konfigurację.
> "Czat" - Nie udało się pobrać wiadomości czatu.
> "Gracze" - Nie udało się pobrać listy graczy.
> "Gry do potwierdzenia" - Nie udało się pobrać listy potwierdzeń.
> 
> Załączam jeszcze raz aktualne Rules:
> 
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
> 
>     function isSignedIn() {
>       return request.auth != null;
>     }
> 
>     function isOwner(uid) {
>       return isSignedIn() && request.auth.uid == uid;
>     }
> 
>     function hasMainAdminRole() {
>       return isSignedIn()
>         && exists(/databases/$(database)/documents/main_users/$(request.auth.uid))
>         && get(/databases/$(database)/documents/main_users/$(request.auth.uid)).data.role == 'admin';
>     }
> 
>     function hasSecondAdminRole() {
>       return isSignedIn()
>         && exists(/databases/$(database)/documents/second_users/$(request.auth.uid))
>         && get(/databases/$(database)/documents/second_users/$(request.auth.uid)).data.role == 'admin';
>     }
> 
>     function validBaseUserCreateData(data, uid) {
>       return data.uid == uid
>         && data.email is string
>         && data.role is string
>         && data.isActive is bool
>         && (!('isApproved' in data) || data.isApproved is bool)
>         && (!('moduleAccess' in data) || data.moduleAccess is map)
>         && (!('permissions' in data) || data.permissions is map);
>     }
> 
>     function validOwnerUpdate(allowedChangedKeys) {
>       return request.resource.data.diff(resource.data).changedKeys().hasOnly(allowedChangedKeys);
>     }
> 
>     match /main_users/{uid} {
>       allow read: if isOwner(uid) || hasMainAdminRole();
> 
>       allow create: if isOwner(uid)
>         && validBaseUserCreateData(request.resource.data, uid);
> 
>       allow update: if (isOwner(uid)
>           && validOwnerUpdate(['displayName', 'photoURL', 'lastLoginAt']))
>         || hasMainAdminRole();
> 
>       allow delete: if hasMainAdminRole();
>     }
> 
>     match /second_users/{uid} {
>       allow read: if isOwner(uid) || hasSecondAdminRole();
> 
>       allow create: if isOwner(uid)
>         && validBaseUserCreateData(request.resource.data, uid);
> 
>       allow update: if (isOwner(uid)
>           && validOwnerUpdate(['displayName', 'photoURL', 'lastLoginAt']))
>         || hasSecondAdminRole();
> 
>       allow delete: if hasSecondAdminRole();
>     }
>   }
> }
> 
> Sprawdź przyczynę błędu i ją napraw. Jeżeli jest wymagana zmiana po stronie Firebase to napisz mi dokładnie co trzeba zrobić w Analizy.

## Diagnoza
1. Aplikacja Main odczytuje i zapisuje dane nie tylko w `main_users`/`second_users`, ale także m.in.:
   - `main_admin_messages` (Aktualności),
   - `main_chat_messages` (Czat),
   - `main_tables` + subkolekcja `confirmations` (Gry do potwierdzenia),
   - `main_auth_sessions`, `main_app_settings`, `main_user_games`, `main_admin_games_stats`, `main_calculators`.
2. Aktualne Rules obejmują wyłącznie `main_users` i `second_users`, więc dla pozostałych ścieżek Firestore stosuje się domyślne `deny`.
3. To bezpośrednio powoduje błędy typu `permission-denied` przy próbach odczytu/zapisu w zakładkach, które zgłosił użytkownik.
4. Dodatkowa niezgodność: kod rejestracji zapisuje `permissions: []` (lista), a przesłane Rules walidują `permissions` tylko jako mapę (`permissions is map`). To może blokować tworzenie profilu podczas rejestracji.

## Co trzeba zmienić po stronie Firebase (krok po kroku)
1. Otwórz **Firebase Console → Firestore Database → Rules**.
2. Zastąp obecną treść Rules pełnym zestawem reguł z pliku repozytorium:
   - `Pliki/firestore.rules`
3. Kliknij **Publish**.
4. Po publikacji wykonaj szybkie testy w aplikacji:
   - Aktualności: zapis wiadomości,
   - Czat: odczyt listy wiadomości,
   - Gracze: odczyt listy graczy,
   - Gry do potwierdzenia: odczyt listy potwierdzeń.
5. Jeśli nadal pojawi się `permission-denied`, sprawdź w `main_users/{uid}` zalogowanego konta:
   - `role` powinno mieć wartość zgodną z dostępem (`admin` dla akcji administracyjnych).

## Zakres naprawy przygotowany w repo
- Dodano gotowy plik Rules do wdrożenia:
  - `Pliki/firestore.rules`
- Reguły rozszerzają dostęp na kolekcje używane przez Main/Second i uwzględniają obecny format pól użytkownika.

---

## Aktualizacja analizy (2026-02-26) – weryfikacja map/list na podstawie screena Firebase

## Prompt użytkownika
> Przeczytaj i zaktualizuj plik Analiza_bledow_Firebase_Aktualnosci_Czat_Gracze_Potwierdzenia_2026-02-26.md
>
> Załączam screeny z Firebase. Sprawdź czy ustawienia mapa/lista są poprawne. W Database mam ustawione jako "map".

## Wniosek ze screena
1. Na załączonym screenie (kolekcja `second_users`, dokument `seed-admin`) pola zagnieżdżone są zapisane jako obiekty (`map`):
   - `moduleAccess` → `second: true`,
   - `permissions` → klucze typu `chatTab`, `newsTab`, `playersTab`, `tablesTab` itd.
2. Dla takiego układu danych ustawienie typu **map** jest poprawne.
3. Ten ekran nie pokazuje pól typu tablicowego (list) dla uprawnień gracza, więc dla tego konkretnego dokumentu nie ma błędu typu `map/list`.

## Doprecyzowanie względem kodu aplikacji
1. W kodzie Main/Second nadal występuje zapis i odczyt `permissions` jako lista (`[]`) dla części ścieżek użytkowników/graczy.
2. Dlatego najbezpieczniej zostawić w Rules walidację kompatybilną z obiema strukturami (jak obecnie w `Pliki/firestore.rules`):
   - `data.permissions is map || data.permissions is list`
3. Jeśli celem jest pełna standaryzacja na **map**, trzeba wykonać migrację danych i dopiero potem zaostrzyć reguły.

## Rekomendacja operacyjna
1. Dla `second_users` (panel admina) obecna struktura `permissions` jako **map** jest prawidłowa.
2. Nie zmieniaj teraz globalnie reguły na „tylko map”, dopóki wszystkie miejsca w kodzie i dane historyczne nie zostaną ujednolicone.
3. Jeżeli chcesz, w kolejnym kroku mogę przygotować osobny plan migracji `permissions` z list do map (kolejność zmian: kod → migracja danych → zaostrzenie Rules).
