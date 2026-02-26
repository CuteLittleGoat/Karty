# Analiza: Czy konta użytkowników trzeba tworzyć ręcznie w Firebase, czy mogą powstawać przez UI aplikacji?

## Prompt użytkownika
"Przeczytaj dokumentację: Analizy/Projekt_Login_i_Haslo.md punkt 8 Faza 1 podpunkty:
Utwórz konta użytkowników w Authentication.
Dla każdego użytkownika dodaj dokument profilu w main_users albo second_users z rolą/uprawnieniami.

Czy w danym modelu użytkowników trzeba ręcznie tworzyć w Firebase? Nie mogą się tworzyć przez UI aplikacji?"

## Wnioski
1. W opisanym planie migracji (Faza 1) konta są przewidziane do utworzenia bezpośrednio po stronie Firebase (Authentication), a następnie dla każdego konta trzeba utworzyć profil w Firestore (`main_users` albo `second_users`) z rolą/uprawnieniami.
2. Dokument nie narzuca wyłącznie „ręcznego” sposobu dla wszystkich użytkowników. Pokazuje podejście operacyjne na etapie migracji: najpierw przygotowanie kont i profili, dopiero potem wdrożenie ekranów logowania i obsługi auth w kodzie (Faza 2).
3. Technicznie konta mogą być tworzone przez UI aplikacji, ale dopiero gdy aplikacja będzie miała zaimplementowany flow rejestracji (np. `createUserWithEmailAndPassword`) oraz równoległe zakładanie dokumentu profilu z rolą/uprawnieniami.
4. Bez mechanizmu nadawania roli/uprawnień po stronie aplikacji lub backendu, samo utworzenie konta przez UI nie wystarczy do działania modelu autoryzacji opisanego w dokumencie.
5. Praktyczny wniosek dla tego dokumentu: na start migracji — zakładać konta w Firebase (konsola/skrypt), a UI może służyć do logowania; rejestrację przez UI można dodać jako kolejny etap, jeśli dołoży się kontrolę ról.
