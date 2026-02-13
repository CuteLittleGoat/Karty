# Weryfikacja zgodności Firebase z analizą `Analizy/Projekt_Kalkulator.md`

## Prompt użytkownika (kontekst)
> Przeczytaj analizę Analizy/Projekt_Kalkulator.md  
> Moja aktualna struktura w Firebase jest zapisana w:  
> Analizy/1.txt  
> Analizy/2.txt  
> Jeden plik to goła struktura a drugi zawiera dane.  
> Sprawdź czy wszystko jest zgodne z analizą.  
> Napisz mi Rules w formie gotowej do wklejenia.  
> Obecnie mam (...)  
> Zaznaczam, że Rules mają być proste bez zbędnych zabezpieczeń. Aplikacja jest do prywatnego użytku i tylko jedna osoba będzie miała dostęp do panelu admina.

## Zakres porównania
- Dokument referencyjny: `Analizy/Projekt_Kalkulator.md`
- Stan rzeczywisty: `Analizy/1.txt` (struktura), `Analizy/2.txt` (struktura + dane)

## Wynik: co jest zgodne
1. Istnieje nowa kolekcja główna `calculators`.
2. W `calculators` są dokumenty `tournament` i `cash`.
3. W obu dokumentach są `definitions/v1`.
4. W obu dokumentach są `placeholders/defaults`.
5. W obu dokumentach są `sessions/default_session`.
6. W sesjach istnieją `variables/current` oraz `calculationFlags/current`.

To oznacza, że główny szkielet z analizy został wdrożony.

## Wynik: co nie jest w pełni zgodne / co jest niedokończone
1. `sessions/default_session/tables` jest puste (`(no documents)`), podczas gdy analiza przewiduje szkielety tabel (`table1_settings`, `table2_entries`, `table3_summary`, `table4_ranking`, `table5_payout` + `rows`).
2. Nadal aktywnie istnieją i są używane stare gałęzie `Tables` i `UserGames` z danymi operacyjnymi gry.
3. Dane w legacy `rows` są w starym formacie (`entryFee`, `rebuy`, `payout`, `points` jako stringi), a nie w docelowym modelu kalkulatora opartym o strukturę sesji kalkulatora.
4. Brak gałęzi snapshotów kalkulatora (`snapshots`), która była opisana jako część docelowego kierunku.

## Wniosek końcowy
- **Nie jest jeszcze w 100% zgodne** z analizą.
- **Jest zgodne częściowo**: fundament (`calculators/*`) już istnieje.
- Do pełnej zgodności brakuje głównie uruchomienia faktycznego zapisu danych tabel kalkulatora do `calculators/{type}/sessions/{sessionId}/tables/*/rows/*` oraz ewentualnego wygaszenia legacy flow (`Tables`, `UserGames`) po migracji.

## Proste Rules (gotowe do wklejenia)
Poniżej najprostsza wersja (pełny dostęp do całej bazy, także dla nowych kolekcji i podkolekcji):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Wersja „prosta, ale jawna” (opcjonalnie)
Jeśli wolisz utrzymać styl z listą kolekcji jak obecnie, dodaj koniecznie gałąź `calculators`:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /admin_messages/{docId} {
      allow read, write: if true;
    }

    match /app_settings/{docId} {
      allow read, write: if true;
    }

    match /Tables/{tableId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /UserGames/{gameId} {
      allow read, write: if true;
      match /rows/{rowId} {
        allow read, write: if true;
      }
      match /confirmations/{playerId} {
        allow read, write: if true;
      }
    }

    match /Collection1/{docId} {
      allow read, write: if true;
    }

    match /chat_messages/{docId} {
      allow read, write: if true;
    }

    match /admin_games_stats/{year} {
      allow read, write: if true;
    }

    match /players/{docId} {
      allow read, write: if true;
    }

    match /calculators/{type} {
      allow read, write: if true;

      match /definitions/{versionId} {
        allow read, write: if true;
      }

      match /placeholders/{placeholderId} {
        allow read, write: if true;
      }

      match /sessions/{sessionId} {
        allow read, write: if true;

        match /variables/{varDocId} {
          allow read, write: if true;
        }

        match /calculationFlags/{flagDocId} {
          allow read, write: if true;
        }

        match /tables/{tableId} {
          allow read, write: if true;

          match /rows/{rowId} {
            allow read, write: if true;
          }
        }

        match /snapshots/{snapshotId} {
          allow read, write: if true;
        }
      }
    }
  }
}
```
