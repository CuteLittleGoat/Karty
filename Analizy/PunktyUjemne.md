# Analiza zmian: PunktyUjemne

## Prompt użytkownika
> Zmodyfikuj zasadę działania sekcji "Podsumowanie Gry" i "Statystyki" w zakładkach "Gry admina" i "Gry użytkowników".
> W nowym modelu chciałbym, żeby w "Podsumowaniu Gry" i "Statystykach" były również uwzględniani gracze, który nie mają uzupełnionej wartości w kolumnach: "Wpisowe", "Rebuy/Add-on" i "Wypłata". W takim przypadku tworzący grę i uzupełniający szczegóły może takiemu graczowi w kolumnie "Punkty" wpisać jakąś wartość - np. punkty ujemne.
> Chcę, żeby te punkty miały potem odzwierciedlenie w "Podsumowanie Gry" i "Statystyki".
> Kolumna "Punkty" jest istotna przy wyliczaniu "Wyniki" w "Statystyki" a co za tym idzie w pozycji w rankingu.
>
> Dodatkowo w katalogu Analizy przygotuj plik "PunktyUjemne.md" i zapisz tam wszystkie zmiany jakie zamierzasz dokonać. Zapisz każdy fragment kodu jaki jest obecnie i na jaki zmieniasz. Ma to być proste narzędzie, żeby zrobić ewentualnie rollback i zacząć od nowa z poprawionymi wymaganiami.

---

## 1) `Main/app.js` — sekcja podsumowania (moduł „Gry użytkowników”)

### Było
```js
const getGameSummaryMetrics = (gameId) => {
  const rows = getDetailRows(gameId).filter((row) => parseIntegerOrZero(row.entryFee) > 0);
  const pool = rows.reduce((sum, row) => sum + row.entryFee + row.rebuy, 0);
  ...
};
```

### Jest
```js
const hasIncludedSummaryOrStatsData = (row) => {
  const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
  const normalizedPoints = sanitizeIntegerInput(typeof row.points === "number" ? `${row.points}` : row.points ?? "");
  const hasEntryFee = Boolean(normalizedEntryFee) && normalizedEntryFee !== "-" && parseIntegerOrZero(normalizedEntryFee) > 0;
  const hasPoints = Boolean(normalizedPoints) && normalizedPoints !== "-";
  return hasEntryFee || hasPoints;
};

const getGameSummaryMetrics = (gameId) => {
  const rows = getDetailRows(gameId).filter((row) => hasIncludedSummaryOrStatsData(row));
  const pool = rows.reduce((sum, row) => sum + row.entryFee + row.rebuy, 0);
  ...
};
```

## 2) `Main/app.js` — sekcja statystyk rocznych (część wspólna)

### Było
```js
const hasCompletedEntryFee = (row) => {
  const normalized = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
  return Boolean(normalized) && normalized !== "-" && parseIntegerOrZero(normalized) > 0;
};
```

### Jest
```js
const hasIncludedSummaryOrStatsData = (row) => {
  const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
  const normalizedPoints = sanitizeIntegerInput(typeof row.points === "number" ? `${row.points}` : row.points ?? "");
  const hasEntryFee = Boolean(normalizedEntryFee) && normalizedEntryFee !== "-" && parseIntegerOrZero(normalizedEntryFee) > 0;
  const hasPoints = Boolean(normalizedPoints) && normalizedPoints !== "-";
  return hasEntryFee || hasPoints;
};
```

## 3) `Main/app.js` — użycie filtra w agregacji statystyk (część wspólna)

### Było
```js
const totalPool = games.reduce((sum, game) => sum + getDetailRows(game.id)
  .filter((row) => hasCompletedEntryFee(row))
  .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0), 0);
...
const gamePool = rows
  .filter((row) => hasCompletedEntryFee(row))
  .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0);
...
if (!playerName || !hasCompletedEntryFee(row)) {
  return;
}
```

### Jest
```js
const totalPool = games.reduce((sum, game) => sum + getDetailRows(game.id)
  .filter((row) => hasIncludedSummaryOrStatsData(row))
  .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0), 0);
...
const gamePool = rows
  .filter((row) => hasIncludedSummaryOrStatsData(row))
  .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0);
...
if (!playerName || !hasIncludedSummaryOrStatsData(row)) {
  return;
}
```

## 4) `Main/app.js` — sekcja „Gry admina” (podsumowanie + statystyki)

### Było
```js
const hasCompletedEntryFee = (row) => {
  const normalized = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
  return Boolean(normalized) && normalized !== "-" && parseIntegerOrZero(normalized) > 0;
};

const getGameSummaryMetrics = (gameId) => {
  const rows = getDetailRows(gameId).filter((row) => hasCompletedEntryFee(row));
  ...
};

...
if (!playerName || !hasCompletedEntryFee(row)) {
  return;
}
```

### Jest
```js
const hasIncludedSummaryOrStatsData = (row) => {
  const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
  const normalizedPoints = sanitizeIntegerInput(typeof row.points === "number" ? `${row.points}` : row.points ?? "");
  const hasEntryFee = Boolean(normalizedEntryFee) && normalizedEntryFee !== "-" && parseIntegerOrZero(normalizedEntryFee) > 0;
  const hasPoints = Boolean(normalizedPoints) && normalizedPoints !== "-";
  return hasEntryFee || hasPoints;
};

const getGameSummaryMetrics = (gameId) => {
  const rows = getDetailRows(gameId).filter((row) => hasIncludedSummaryOrStatsData(row));
  ...
};

...
if (!playerName || !hasIncludedSummaryOrStatsData(row)) {
  return;
}
```

## 5) Dokumentacja użytkownika i techniczna

### Dodatkowe zmiany
- Zaktualizowano `docs/README.md` o instrukcję UI, jak używać punktów (w tym ujemnych) bez uzupełniania pól finansowych.
- Zaktualizowano `docs/Documentation.md` o opis logiki kwalifikacji wiersza do podsumowania/statystyk i wpływu na ranking.
