# Detale layoutu — aktualny stan

## 1. Wspólny motyw (Main i Second)
- Styl: ciemny motyw z akcentami zieleni i złota.
- Fonty:
  - tytuły: **Cinzel**,
  - nagłówki podrzędne: **Cormorant Garamond**,
  - elementy panelowe: **Rajdhani**,
  - tekst bazowy: **Inter**.
- Tło: gradienty radialne i liniowe, z delikatną warstwą świetlną.
- Karty: zaokrąglone narożniki, cienkie obramowania i cień.

## 2. Kolory i akcenty
- Kolor bazowy tła: bardzo ciemny granat/czerń.
- Kolor tekstu: jasny krem.
- Akcent główny: złoty.
- Akcent pomocniczy: zielony neonowy.
- Komunikaty błędów i akcje destrukcyjne: czerwony.

## 3. Układ strony
- Główny kontener ma szerokość maksymalną i centralne pozycjonowanie.
- Nagłówek zawiera tytuł i prawy obszar sterowania (`Instrukcja`, kontrolki admina).
- Sekcje treści są zbudowane z kart i tabel.
- Panele zakładek przełączają widoczność sekcji bez przeładowania strony.

## 4. Tabele i formularze
- Tabele mają spójny styl nagłówków i komórek.
- Przy mniejszej szerokości ekranu działa poziome przewijanie tabel.
- Pola formularzy i przyciski mają jednolity system promieni, obramowań i stanów hover/focus.
- Statusy i komunikaty używają wyróżnionego stylu tekstu (`status-text`).

## 5. Modale
- Modale używają pełnoekranowego przyciemnionego overlayu.
- Okno modalne ma stały styl: ciemne tło, promień, obramowanie i nagłówek z przyciskiem zamknięcia.
- W Main występują dodatkowo modale: szczegóły gier, notatki, uprawnienia, lata statystyk, kalkulator (rebuy).
- W obu modułach występuje modal logowania administratora i modal instrukcji.

## 6. Responsywność
- Układ dostosowuje się do mniejszych ekranów przez zmiany flex/grid.
- W obszarze nagłówka elementy mogą przechodzić do układu pionowego.
- Tabele zachowują komplet kolumn dzięki przewijaniu poziomemu na mobile.

## 7. Różnice modułów
- **Main**: rozbudowany zestaw zakładek administratora i Strefa Gracza (wiele tabel i modali biznesowych).
- **Second**: prostszy zakres funkcjonalny, z zakładką **Turniej** jako aktualny placeholder UI.
