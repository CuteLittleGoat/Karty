const PIN_LENGTH = 5;
const PIN_STORAGE_KEY = "nextGamePinVerified";
const CHAT_PIN_STORAGE_KEY = "chatPinVerified";
const CHAT_PLAYER_ID_STORAGE_KEY = "chatPlayerId";
const CONFIRMATIONS_PIN_STORAGE_KEY = "confirmationsPinVerified";
const CONFIRMATIONS_PLAYER_ID_STORAGE_KEY = "confirmationsPlayerId";
const USER_GAMES_PIN_STORAGE_KEY = "userGamesPinVerified";
const USER_GAMES_PLAYER_ID_STORAGE_KEY = "userGamesPlayerId";
const STATISTICS_PIN_STORAGE_KEY = "statisticsPinVerified";
const STATISTICS_PLAYER_ID_STORAGE_KEY = "statisticsPlayerId";
const PLAYER_ACCESS_COLLECTION = "app_settings";
const PLAYER_ACCESS_DOCUMENT = "player_access";
const RULES_DOCUMENT = "rules";
const RULES_DEFAULT_TEXT = "";
const DEFAULT_GAME_NOTES_TEMPLATE = "Przewidywani gracze:\nRebuy:\nAddon:\nInne:";

const getPreGameNotes = (game) => {
  if (typeof game?.preGameNotes === "string") {
    return game.preGameNotes;
  }
  return "";
};

const getPostGameNotes = (game) => {
  if (typeof game?.postGameNotes === "string") {
    return game.postGameNotes;
  }
  return "";
};

const legacyNotesCleanupInProgress = new Set();

const clearLegacyNotesField = async ({ firebaseApp, db, collectionName, game }) => {
  const hasLegacyNotes = Object.prototype.hasOwnProperty.call(game ?? {}, "notes");
  if (!hasLegacyNotes || !game?.id) {
    return;
  }

  const cleanupKey = `${collectionName}:${game.id}`;
  if (legacyNotesCleanupInProgress.has(cleanupKey)) {
    return;
  }

  legacyNotesCleanupInProgress.add(cleanupKey);
  try {
    await db.collection(collectionName).doc(game.id).update({
      notes: firebaseApp.firestore.FieldValue.delete()
    });
  } catch (error) {
    legacyNotesCleanupInProgress.delete(cleanupKey);
  }
};
const AVAILABLE_PLAYER_TABS = [
  {
    key: "nextGameTab",
    label: "Najbliższa gra"
  },
  {
    key: "chatTab",
    label: "Czat"
  },
  {
    key: "confirmationsTab",
    label: "Gry do potwierdzenia"
  },
  {
    key: "userGamesTab",
    label: "Gry użytkowników"
  },
  {
    key: "statsTab",
    label: "Statystyki"
  }
];

const CHAT_COLLECTION = "chat_messages";
const CHAT_RETENTION_DAYS = 30;

const TABLES_COLLECTION = "Tables";
const GAMES_COLLECTION = "Tables";
const USER_GAMES_COLLECTION = "UserGames";
const GAME_DETAILS_COLLECTION = "rows";
const TABLES_COLLECTION_CONFIG_KEY = "tablesCollection";
const GAMES_COLLECTION_CONFIG_KEY = "gamesCollection";
const GAME_DETAILS_COLLECTION_CONFIG_KEY = "gameDetailsCollection";
const USER_GAMES_COLLECTION_CONFIG_KEY = "userGamesCollection";
const TABLE_ROWS_COLLECTION = "rows";
const GAME_CONFIRMATIONS_COLLECTION = "confirmations";
const ADMIN_GAMES_STATS_COLLECTION = "admin_games_stats";
const DEFAULT_TABLE_META = {
  gameType: "rodzaj gry",
  gameDate: "data"
};
const TABLE_COLUMNS = [
  { key: "playerName", label: "nazwa gracza" },
  { key: "percentAllGames", label: "% z wszystkich gier" },
  { key: "percentPlayedGames", label: "% procent z rozegranych gier" },
  { key: "payouts", label: "wypłaty" },
  { key: "totalGames", label: "suma rozegranych gier" },
  { key: "summary", label: "podsumowanie (+/-)" },
  { key: "deposits", label: "wpłaty" },
  { key: "meetings", label: "ilość spotkań" },
  { key: "points", label: "punkty" },
  { key: "rebuyTotal", label: "suma rebuy" }
];

const STATS_COLUMN_CONFIG = [
  { key: "playerName", label: "Gracz", editable: false, weight: false, value: (row) => row.playerName },
  { key: "championshipCount", label: "Mistrzostwo", editable: false, weight: false, value: (row) => row.championshipCount },
  { key: "weight1", label: "Waga1", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight1", manual?.weight1) },
  { key: "meetingsCount", label: "Ilość Spotkań", editable: false, weight: false, value: (row) => row.meetingsCount },
  { key: "participationPercent", label: "% udział", editable: false, weight: false, value: (row) => `${row.participationPercent}%` },
  { key: "weight2", label: "Waga2", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight2", manual?.weight2) },
  { key: "points", label: "Punkty", editable: false, weight: false, value: (row) => row.pointsSum },
  { key: "weight3", label: "Waga3", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight3", manual?.weight3) },
  { key: "plusMinusSum", label: "(+/-)", editable: false, weight: false, value: (row) => row.plusMinusSum },
  { key: "weight4", label: "Waga4", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight4", manual?.weight4) },
  { key: "payoutSum", label: "Wypłata", editable: false, weight: false, value: (row) => row.payoutSum },
  { key: "weight5", label: "Waga5", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight5", manual?.weight5) },
  { key: "depositsSum", label: "Wpłaty", editable: false, weight: false, value: (row) => row.depositsSum },
  { key: "weight6", label: "Waga6", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight6", manual?.weight6) },
  { key: "playedGamesPoolSum", label: "Suma z rozegranych gier", editable: false, weight: false, value: (row) => row.playedGamesPoolSum },
  { key: "percentAllGames", label: "% Rozegranych gier", editable: false, weight: false, value: (row) => `${row.percentAllGames}%` },
  { key: "weight7", label: "Waga7", editable: true, weight: true, value: (row, manual, getDefault) => getDefault("weight7", manual?.weight7) },
  { key: "percentPlayedGames", label: "% Wszystkich gier", editable: false, weight: false, value: (row) => `${row.percentPlayedGames}%` },
  {
    key: "result",
    label: "Wynik",
    editable: false,
    weight: false,
    value: (row, manual, getDefault, getComputedResultValue) => {
      if (typeof getComputedResultValue !== "function") {
        return "";
      }
      return getComputedResultValue(row, manual);
    }
  }
];
const DEFAULT_VISIBLE_STATS_COLUMNS = STATS_COLUMN_CONFIG
  .filter((column) => !column.weight)
  .map((column) => column.key);

const adminPlayersState = {
  players: [],
  playerByPin: new Map(),
  editingPlayerId: null
};
const chatState = {
  unsubscribe: null,
  adminUnsubscribe: null
};
const debounceTimers = new Map();
const adminRefreshHandlers = new Map();
const ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY = "adminGamesSelectedYear";
const ADMIN_USER_GAMES_SELECTED_YEAR_STORAGE_KEY = "adminUserGamesSelectedYear";
const USER_GAMES_SELECTED_YEAR_STORAGE_KEY = "userGamesSelectedYear";
const ADMIN_STATISTICS_SELECTED_YEAR_STORAGE_KEY = "adminStatisticsSelectedYear";
const USER_STATISTICS_SELECTED_YEAR_STORAGE_KEY = "userStatisticsSelectedYear";

const getDateSortValue = (value) => {
  if (typeof value !== "string") {
    return Number.POSITIVE_INFINITY;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return Number.POSITIVE_INFINITY;
  }

  const directMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (directMatch) {
    const year = Number(directMatch[1]);
    const month = Number(directMatch[2]);
    const day = Number(directMatch[3]);
    const parsed = new Date(year, month - 1, day).getTime();
    return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
};

const compareByGameDateAsc = (a, b) => {
  const dateDiff = getDateSortValue(a?.gameDate) - getDateSortValue(b?.gameDate);
  if (dateDiff !== 0) {
    return dateDiff;
  }

  const createdA = a?.createdAt?.toMillis?.() ?? 0;
  const createdB = b?.createdAt?.toMillis?.() ?? 0;
  if (createdA !== createdB) {
    return createdA - createdB;
  }

  return String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "pl");
};

const isFocusableFormControl = (element) => {
  return element instanceof HTMLInputElement
    || element instanceof HTMLSelectElement
    || element instanceof HTMLTextAreaElement;
};

const supportsSelectionRange = (element) => {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (!(element instanceof HTMLInputElement)) {
    return false;
  }

  const selectableTypes = new Set(["text", "search", "url", "tel", "password", "email", "number"]);
  return selectableTypes.has(element.type);
};

const getFocusedAdminInputState = (container) => {
  if (!container) {
    return null;
  }

  const activeElement = document.activeElement;
  if (!isFocusableFormControl(activeElement) || !container.contains(activeElement)) {
    return null;
  }

  const safeSelectionStart = supportsSelectionRange(activeElement) ? activeElement.selectionStart : null;
  const safeSelectionEnd = supportsSelectionRange(activeElement) ? activeElement.selectionEnd : null;

  return {
    target: activeElement.dataset.focusTarget ?? "",
    tableId: activeElement.dataset.tableId ?? "",
    rowId: activeElement.dataset.rowId ?? "",
    columnKey: activeElement.dataset.columnKey ?? "",
    section: activeElement.dataset.section ?? "",
    selectionStart: safeSelectionStart,
    selectionEnd: safeSelectionEnd
  };
};

const restoreFocusedAdminInputState = (container, focusState) => {
  if (!container || !focusState) {
    return;
  }

  const targetInput = Array.from(container.querySelectorAll("[data-focus-target]"))
    .find((input) => {
      return (
        input.dataset.focusTarget === focusState.target
        && (input.dataset.tableId ?? "") === focusState.tableId
        && (input.dataset.rowId ?? "") === focusState.rowId
        && (input.dataset.columnKey ?? "") === focusState.columnKey
        && (input.dataset.section ?? "") === focusState.section
      );
    });

  if (!targetInput) {
    return;
  }

  targetInput.focus();
  if (supportsSelectionRange(targetInput)
    && typeof focusState.selectionStart === "number"
    && typeof focusState.selectionEnd === "number") {
    targetInput.setSelectionRange(focusState.selectionStart, focusState.selectionEnd);
  }
};

const comparePlayerStatsByPlusMinusDesc = (a, b) => {
  const plusMinusDiff = Number(b?.plusMinusSum ?? 0) - Number(a?.plusMinusSum ?? 0);
  if (plusMinusDiff !== 0) {
    return plusMinusDiff;
  }
  return String(a?.playerName ?? "").localeCompare(String(b?.playerName ?? ""), "pl");
};

const getSummaryNotesModalController = (() => {
  let cachedController = null;

  return () => {
    if (cachedController) {
      return cachedController;
    }

    const modal = document.querySelector("#summaryNotesModal");
    const title = document.querySelector("#summaryNotesTitle");
    const textarea = document.querySelector("#summaryNotesInput");
    const status = document.querySelector("#summaryNotesStatus");
    const saveButton = document.querySelector("#summaryNotesSave");
    const clearButton = document.querySelector("#summaryNotesClear");
    const closeButton = document.querySelector("#summaryNotesClose");

    if (!modal || !title || !textarea || !status || !saveButton || !clearButton || !closeButton) {
      cachedController = {
        open: () => {}
      };
      return cachedController;
    }

    const state = {
      gameId: "",
      gameName: "",
      notes: "",
      notesLabel: "Notatki",
      canWrite: false,
      onSave: null,
      triggerButton: null,
      clearButtonLabel: "Usuń",
      clearToDefault: false,
      readOnlyMessage: "Brak uprawnień do edycji notatek.",
      textareaPlaceholder: "Wpisz notatki..."
    };

    const closeModal = () => {
      modal.classList.remove("is-visible");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (state.triggerButton instanceof HTMLElement) {
        state.triggerButton.focus();
      }
      state.triggerButton = null;
    };

    const open = ({
      gameId,
      gameName,
      notes,
      canWrite,
      onSave,
      triggerButton,
      notesLabel,
      clearButtonLabel,
      clearToDefault,
      readOnlyMessage,
      textareaPlaceholder
    }) => {
      state.gameId = String(gameId ?? "");
      state.gameName = String(gameName ?? "Bez nazwy");
      const normalizedNotes = typeof notes === "string" ? notes : "";
      state.notes = normalizedNotes;
      state.notesLabel = String(notesLabel ?? "Notatki");
      state.canWrite = Boolean(canWrite);
      state.onSave = typeof onSave === "function" ? onSave : null;
      state.triggerButton = triggerButton instanceof HTMLElement ? triggerButton : null;
      state.clearButtonLabel = String(clearButtonLabel ?? "Usuń");
      state.clearToDefault = Boolean(clearToDefault);
      state.readOnlyMessage = String(readOnlyMessage ?? "Brak uprawnień do edycji notatek.");
      state.textareaPlaceholder = String(textareaPlaceholder ?? "Wpisz notatki...");

      title.textContent = `${state.notesLabel}: ${state.gameName}`;
      textarea.value = state.notes;
      textarea.placeholder = state.textareaPlaceholder;
      textarea.disabled = !state.canWrite;
      saveButton.disabled = !state.canWrite;
      clearButton.disabled = !state.canWrite;
      clearButton.textContent = state.clearButtonLabel;
      status.textContent = state.canWrite ? "" : state.readOnlyMessage;

      modal.classList.add("is-visible");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    };

    const persist = async (value) => {
      if (!state.canWrite || !state.onSave) {
        return;
      }
      saveButton.disabled = true;
      clearButton.disabled = true;
      status.textContent = "Zapisywanie...";
      try {
        await state.onSave({ gameId: state.gameId, notes: value });
        state.notes = value;
        textarea.value = value;
        status.textContent = "Notatki zapisane.";
      } catch (error) {
        status.textContent = "Nie udało się zapisać notatek.";
      } finally {
        saveButton.disabled = !state.canWrite;
        clearButton.disabled = !state.canWrite;
      }
    };

    saveButton.addEventListener("click", () => {
      void persist(textarea.value);
    });

    clearButton.addEventListener("click", () => {
      const nextValue = state.clearToDefault ? DEFAULT_GAME_NOTES_TEMPLATE : "";
      void persist(nextValue);
    });

    closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-visible")) {
        closeModal();
      }
    });

    cachedController = { open };
    return cachedController;
  };
})();

const registerAdminRefreshHandler = (tabId, handler) => {
  if (!tabId || typeof handler !== "function") {
    return;
  }
  adminRefreshHandlers.set(tabId, handler);
};

const getAdminMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("admin") === "1";
};

const getFirebaseApp = () => {
  if (!window.firebase || !window.firebase.initializeApp) {
    return null;
  }

  if (!window.firebaseConfig || !window.firebaseConfig.projectId) {
    return null;
  }

  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(window.firebaseConfig);
  }

  return window.firebase;
};

const parseDefaultTableNumber = (name) => {
  if (!name || typeof name !== "string") {
    return null;
  }
  const match = name.trim().match(/^Gra\s+(\d+)$/i);
  if (!match) {
    return null;
  }
  const numberValue = Number(match[1]);
  return Number.isInteger(numberValue) ? numberValue : null;
};

const getNextTableName = (tables) => {
  const usedNumbers = new Set();
  tables.forEach((table) => {
    const numberValue = parseDefaultTableNumber(table.name);
    if (numberValue) {
      usedNumbers.add(numberValue);
    }
  });

  let candidate = 1;
  while (usedNumbers.has(candidate)) {
    candidate += 1;
  }
  return `Gra ${candidate}`;
};

const getFormattedCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sanitizeIntegerInput = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  const normalized = value.replace(/\s+/g, "").replace(/,/g, "");
  const withoutMinus = normalized.replace(/-/g, "");
  if (!withoutMinus.length) {
    return normalized.startsWith("-") ? "-" : "";
  }
  const digits = withoutMinus.replace(/\D/g, "");
  if (!digits.length) {
    return normalized.startsWith("-") ? "-" : "";
  }
  return normalized.startsWith("-") ? `-${digits}` : digits;
};

const parseIntegerOrZero = (value) => {
  const normalized = sanitizeIntegerInput(typeof value === "number" ? `${value}` : value ?? "");
  if (!normalized || normalized === "-") {
    return 0;
  }
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getNextGameNameForDate = (games, gameDate) => {
  const sameDayGames = games.filter((game) => (game.gameDate ?? "") === gameDate);
  return getNextTableName(sameDayGames);
};

const normalizeNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (value === null || value === undefined) {
    return 0;
  }
  const normalized = value.toString().replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
};

const getTablesCollectionName = () => {
  const configured =
    window.firebaseConfig && typeof window.firebaseConfig[TABLES_COLLECTION_CONFIG_KEY] === "string"
      ? window.firebaseConfig[TABLES_COLLECTION_CONFIG_KEY].trim()
      : "";
  return configured || TABLES_COLLECTION;
};

const getGamesCollectionName = () => {
  const configured =
    window.firebaseConfig && typeof window.firebaseConfig[GAMES_COLLECTION_CONFIG_KEY] === "string"
      ? window.firebaseConfig[GAMES_COLLECTION_CONFIG_KEY].trim()
      : "";
  return configured || GAMES_COLLECTION;
};

const getGameDetailsCollectionName = () => {
  const configured =
    window.firebaseConfig && typeof window.firebaseConfig[GAME_DETAILS_COLLECTION_CONFIG_KEY] === "string"
      ? window.firebaseConfig[GAME_DETAILS_COLLECTION_CONFIG_KEY].trim()
      : "";
  return configured || GAME_DETAILS_COLLECTION;
};

const getUserGamesCollectionName = () => {
  const configured =
    window.firebaseConfig && typeof window.firebaseConfig[USER_GAMES_COLLECTION_CONFIG_KEY] === "string"
      ? window.firebaseConfig[USER_GAMES_COLLECTION_CONFIG_KEY].trim()
      : "";
  return configured || USER_GAMES_COLLECTION;
};

const getActiveGamesForConfirmations = async (db, gamesCollectionName, source = "default") => {
  const queryOptions = source === "default" ? undefined : { source };
  const collectionRef = db.collection(gamesCollectionName);

  const toSortedActiveGames = (snapshot) => {
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((game) => !Boolean(game.isClosed))
      .sort(compareByGameDateAsc);
  };

  try {
    const orderedSnapshot = await collectionRef.orderBy("createdAt", "asc").get(queryOptions);
    return toSortedActiveGames(orderedSnapshot);
  } catch (orderedError) {
    const fallbackSnapshot = await collectionRef.get(queryOptions);
    return toSortedActiveGames(fallbackSnapshot);
  }
};

const getActiveGamesForConfirmationsFromCollections = async (db, collectionNames, source = "default") => {
  const uniqueCollectionNames = Array.from(new Set(collectionNames.filter((name) => typeof name === "string" && name.trim())));
  const result = [];

  for (const collectionName of uniqueCollectionNames) {
    const games = await getActiveGamesForConfirmations(db, collectionName, source);
    games.forEach((game) => {
      result.push({
        collectionName,
        game
      });
    });
  }

  return result.sort((a, b) => compareByGameDateAsc(a.game, b.game));
};


const formatFirestoreError = (error) => {
  if (!error) {
    return "";
  }
  const parts = [];
  if (error.code) {
    parts.push(`kod: ${error.code}`);
  }
  if (error.message) {
    parts.push(`opis: ${error.message}`);
  }
  return parts.length ? `(${parts.join(", ")})` : "";
};

const scheduleDebouncedUpdate = (key, callback, delay = 400) => {
  const existing = debounceTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }
  const timeoutId = setTimeout(() => {
    debounceTimers.delete(key);
    callback();
  }, delay);
  debounceTimers.set(key, timeoutId);
};

const sanitizePin = (value) => value.replace(/\D/g, "").slice(0, PIN_LENGTH);
const isPinValid = (value) => /^\d{5}$/.test(value);
const generateRandomPin = () => `${Math.floor(Math.random() * 10 ** PIN_LENGTH)}`.padStart(PIN_LENGTH, "0");

const getPinGateState = () => sessionStorage.getItem(PIN_STORAGE_KEY) === "1";

const setPinGateState = (isVerified) => {
  sessionStorage.setItem(PIN_STORAGE_KEY, isVerified ? "1" : "0");
};

const getChatPinGateState = () => sessionStorage.getItem(CHAT_PIN_STORAGE_KEY) === "1";

const setChatPinGateState = (isVerified) => {
  sessionStorage.setItem(CHAT_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};

const setChatVerifiedPlayerId = (playerId) => {
  if (playerId) {
    sessionStorage.setItem(CHAT_PLAYER_ID_STORAGE_KEY, playerId);
    return;
  }
  sessionStorage.removeItem(CHAT_PLAYER_ID_STORAGE_KEY);
};

const getChatVerifiedPlayer = () => {
  const playerId = sessionStorage.getItem(CHAT_PLAYER_ID_STORAGE_KEY);
  if (!playerId) {
    return null;
  }
  return adminPlayersState.players.find((player) => player.id === playerId) ?? null;
};

const getConfirmationsPinGateState = () => sessionStorage.getItem(CONFIRMATIONS_PIN_STORAGE_KEY) === "1";

const setConfirmationsPinGateState = (isVerified) => {
  sessionStorage.setItem(CONFIRMATIONS_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};

const setConfirmationsVerifiedPlayerId = (playerId) => {
  if (playerId) {
    sessionStorage.setItem(CONFIRMATIONS_PLAYER_ID_STORAGE_KEY, playerId);
    return;
  }
  sessionStorage.removeItem(CONFIRMATIONS_PLAYER_ID_STORAGE_KEY);
};

const getConfirmationsVerifiedPlayer = () => {
  const playerId = sessionStorage.getItem(CONFIRMATIONS_PLAYER_ID_STORAGE_KEY);
  if (!playerId) {
    return null;
  }
  return adminPlayersState.players.find((player) => player.id === playerId) ?? null;
};

const getUserGamesPinGateState = () => sessionStorage.getItem(USER_GAMES_PIN_STORAGE_KEY) === "1";

const setUserGamesPinGateState = (isVerified) => {
  sessionStorage.setItem(USER_GAMES_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};

const setUserGamesVerifiedPlayerId = (playerId) => {
  if (playerId) {
    sessionStorage.setItem(USER_GAMES_PLAYER_ID_STORAGE_KEY, playerId);
    return;
  }
  sessionStorage.removeItem(USER_GAMES_PLAYER_ID_STORAGE_KEY);
};

const getUserGamesVerifiedPlayer = () => {
  const playerId = sessionStorage.getItem(USER_GAMES_PLAYER_ID_STORAGE_KEY);
  if (!playerId) {
    return null;
  }
  return adminPlayersState.players.find((player) => player.id === playerId) ?? null;
};

const getStatisticsPinGateState = () => sessionStorage.getItem(STATISTICS_PIN_STORAGE_KEY) === "1";

const setStatisticsPinGateState = (isVerified) => {
  sessionStorage.setItem(STATISTICS_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};

const setStatisticsVerifiedPlayerId = (playerId) => {
  if (playerId) {
    sessionStorage.setItem(STATISTICS_PLAYER_ID_STORAGE_KEY, playerId);
    return;
  }
  sessionStorage.removeItem(STATISTICS_PLAYER_ID_STORAGE_KEY);
};

const getStatisticsVerifiedPlayer = () => {
  const playerId = sessionStorage.getItem(STATISTICS_PLAYER_ID_STORAGE_KEY);
  if (!playerId) {
    return null;
  }
  return adminPlayersState.players.find((player) => player.id === playerId) ?? null;
};

const addDays = (dateValue, days) => {
  const baseDate = new Date(dateValue);
  const shiftedDate = new Date(baseDate.getTime());
  shiftedDate.setDate(shiftedDate.getDate() + days);
  return shiftedDate;
};

const toFirestoreDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
};

const formatChatTimestamp = (value) => {
  const dateValue = toFirestoreDate(value);
  if (!dateValue) {
    return "w trakcie wysyłki...";
  }

  return dateValue.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const isPlayerAllowedForTab = (player, tabKey) => {
  if (!player || !Array.isArray(player.permissions)) {
    return false;
  }
  return player.permissions.includes(tabKey);
};

const updatePinVisibility = () => {
  const gate = document.querySelector("#nextGamePinGate");
  const content = document.querySelector("#nextGameContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = getPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const initPinGate = () => {
  const input = document.querySelector("#nextGamePinInput");
  const submitButton = document.querySelector("#nextGamePinSubmit");
  const status = document.querySelector("#nextGamePinStatus");

  if (!input || !submitButton || !status) {
    return;
  }

  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  const verifyPin = () => {
    const pinValue = sanitizePin(input.value);
    if (!isPinValid(pinValue)) {
      status.textContent = "Wpisz komplet 5 cyfr.";
      return;
    }

    const player = adminPlayersState.playerByPin.get(pinValue);

    if (player && isPlayerAllowedForTab(player, "nextGameTab")) {
      setPinGateState(true);
      status.textContent = `PIN poprawny. Witaj ${player.name || "graczu"}.`;
      updatePinVisibility();
    } else {
      status.textContent = "Błędny PIN lub brak uprawnień do zakładki „Najbliższa gra”.";
    }
  };

  submitButton.addEventListener("click", verifyPin);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyPin();
    }
  });

  updatePinVisibility();
};

const updateChatVisibility = () => {
  const gate = document.querySelector("#chatPinGate");
  const content = document.querySelector("#chatContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = getChatPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const renderPlayerChatMessages = (documents) => {
  const chatMessages = document.querySelector("#chatMessages");
  if (!chatMessages) {
    return;
  }

  chatMessages.innerHTML = "";
  if (!documents.length) {
    const empty = document.createElement("p");
    empty.className = "chat-empty";
    empty.textContent = "Brak wiadomości na czacie.";
    chatMessages.appendChild(empty);
    return;
  }

  documents.forEach((doc) => {
    const data = doc.data();
    const item = document.createElement("article");
    item.className = "chat-message-item";

    const header = document.createElement("header");
    header.className = "chat-message-header";

    const author = document.createElement("strong");
    author.textContent = typeof data.authorName === "string" ? data.authorName : "Gracz";

    const timestamp = document.createElement("span");
    timestamp.className = "chat-message-date";
    timestamp.textContent = formatChatTimestamp(data.createdAt);

    const text = document.createElement("p");
    text.className = "chat-message-text";
    text.textContent = typeof data.text === "string" ? data.text : "";

    header.appendChild(author);
    header.appendChild(timestamp);
    item.appendChild(header);
    item.appendChild(text);
    chatMessages.appendChild(item);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const initChatTab = () => {
  const input = document.querySelector("#chatPinInput");
  const submitButton = document.querySelector("#chatPinSubmit");
  const pinStatus = document.querySelector("#chatPinStatus");
  const sendButton = document.querySelector("#chatMessageSend");
  const messageInput = document.querySelector("#chatMessageInput");
  const messageStatus = document.querySelector("#chatMessageStatus");
  const firebaseApp = getFirebaseApp();

  if (!input || !submitButton || !pinStatus || !sendButton || !messageInput || !messageStatus) {
    return;
  }

  if (!firebaseApp) {
    submitButton.disabled = true;
    sendButton.disabled = true;
    messageStatus.textContent = "Uzupełnij konfigurację Firebase, aby korzystać z czatu.";
    return;
  }

  const db = firebaseApp.firestore();

  const stopSubscription = () => {
    if (typeof chatState.unsubscribe === "function") {
      chatState.unsubscribe();
      chatState.unsubscribe = null;
    }
  };

  const startSubscription = () => {
    stopSubscription();
    chatState.unsubscribe = db.collection(CHAT_COLLECTION)
      .orderBy("createdAt", "asc")
      .limit(200)
      .onSnapshot(
        (snapshot) => {
          renderPlayerChatMessages(snapshot.docs);
          messageStatus.textContent = "";
        },
        () => {
          messageStatus.textContent = "Nie udało się pobrać wiadomości czatu.";
        }
      );
  };

  const verifyPin = () => {
    const pinValue = sanitizePin(input.value);
    if (!isPinValid(pinValue)) {
      pinStatus.textContent = "Wpisz komplet 5 cyfr.";
      return;
    }

    const player = adminPlayersState.playerByPin.get(pinValue);
    if (player && isPlayerAllowedForTab(player, "chatTab")) {
      setChatPinGateState(true);
      setChatVerifiedPlayerId(player.id);
      pinStatus.textContent = `PIN poprawny. Witaj ${player.name || "graczu"}.`;
      updateChatVisibility();
      startSubscription();
      return;
    }

    pinStatus.textContent = "Błędny PIN lub brak uprawnień do zakładki „Czat”.";
  };

  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  submitButton.addEventListener("click", verifyPin);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyPin();
    }
  });

  sendButton.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    const player = getChatVerifiedPlayer();

    if (!getChatPinGateState() || !player || !isPlayerAllowedForTab(player, "chatTab")) {
      messageStatus.textContent = "Twoja sesja czatu wygasła. Zweryfikuj PIN ponownie.";
      setChatPinGateState(false);
      setChatVerifiedPlayerId("");
      stopSubscription();
      updateChatVisibility();
      return;
    }

    if (!text) {
      messageStatus.textContent = "Wpisz treść wiadomości.";
      return;
    }

    sendButton.disabled = true;
    messageStatus.textContent = "Wysyłanie...";

    try {
      await db.collection(CHAT_COLLECTION).add({
        text,
        authorName: player.name || "Gracz",
        authorId: player.id,
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        expireAt: firebaseApp.firestore.Timestamp.fromDate(addDays(new Date(), CHAT_RETENTION_DAYS)),
        source: "web-player"
      });
      messageInput.value = "";
      messageStatus.textContent = "Wiadomość wysłana.";
    } catch (error) {
      messageStatus.textContent = "Nie udało się wysłać wiadomości.";
    } finally {
      sendButton.disabled = false;
    }
  });

  updateChatVisibility();
  if (getChatPinGateState() && getChatVerifiedPlayer()) {
    startSubscription();
  }
};

const updateConfirmationsVisibility = () => {
  const gate = document.querySelector("#confirmationsPinGate");
  const content = document.querySelector("#confirmationsContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = getConfirmationsPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const initUserConfirmations = () => {
  const input = document.querySelector("#confirmationsPinInput");
  const submitButton = document.querySelector("#confirmationsPinSubmit");
  const pinStatus = document.querySelector("#confirmationsPinStatus");
  const refreshButton = document.querySelector("#confirmationsRefresh");
  const status = document.querySelector("#confirmationsStatus");
  const body = document.querySelector("#confirmationsBody");
  const firebaseApp = getFirebaseApp();

  if (!input || !submitButton || !pinStatus || !refreshButton || !status || !body) {
    return;
  }

  if (!firebaseApp) {
    submitButton.disabled = true;
    refreshButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby korzystać z potwierdzeń.";
    return;
  }

  const db = firebaseApp.firestore();
  const summaryNotesModal = getSummaryNotesModalController();
  const gamesCollectionName = getGamesCollectionName();
  const userGamesCollectionName = getUserGamesCollectionName();
  const gameDetailsCollectionName = getGameDetailsCollectionName();

  const readData = async (source = "default") => {
    const verifiedPlayer = getConfirmationsVerifiedPlayer();
    if (!verifiedPlayer || !isPlayerAllowedForTab(verifiedPlayer, "confirmationsTab")) {
      status.textContent = "Twoja sesja wygasła. Zweryfikuj PIN ponownie.";
      setConfirmationsPinGateState(false);
      setConfirmationsVerifiedPlayerId("");
      updateConfirmationsVisibility();
      return;
    }

    status.textContent = source === "server" ? "Odświeżanie danych..." : "Pobieranie danych...";
    body.innerHTML = "";

    try {
      const games = await getActiveGamesForConfirmationsFromCollections(db, [gamesCollectionName, userGamesCollectionName], source);

      const visibleGames = [];
      for (const entry of games) {
        const { collectionName, game } = entry;
        const rowsSnapshot = await db.collection(collectionName)
          .doc(game.id)
          .collection(gameDetailsCollectionName)
          .get(source === "default" ? undefined : { source });

        const hasPlayer = rowsSnapshot.docs.some((rowDoc) => {
          const playerName = typeof rowDoc.data()?.playerName === "string" ? rowDoc.data().playerName.trim() : "";
          return playerName && playerName === (verifiedPlayer.name || "").trim();
        });

        if (!hasPlayer) {
          continue;
        }

        const confirmationDoc = await db.collection(collectionName)
          .doc(game.id)
          .collection(GAME_CONFIRMATIONS_COLLECTION)
          .doc(verifiedPlayer.id)
          .get(source === "default" ? undefined : { source });

        visibleGames.push({
          collectionName,
          game,
          confirmation: confirmationDoc.exists ? confirmationDoc.data() : null
        });
      }

      if (!visibleGames.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 4;
        emptyCell.textContent = "Brak gier do potwierdzenia.";
        emptyRow.appendChild(emptyCell);
        body.appendChild(emptyRow);
        status.textContent = "Brak aktywnych gier do potwierdzenia.";
        return;
      }

      visibleGames.forEach(({ collectionName, game, confirmation }) => {
        const tr = document.createElement("tr");
        if (confirmation?.confirmed) {
          tr.classList.add("confirmed-row");
        }

        const gameTypeCell = document.createElement("td");
        gameTypeCell.textContent = game.gameType || "-";

        const dateCell = document.createElement("td");
        dateCell.textContent = game.gameDate || "-";

        const nameCell = document.createElement("td");
        nameCell.textContent = game.name || "-";

        const actionsCell = document.createElement("td");
        const actionsWrap = document.createElement("div");
        actionsWrap.className = "confirmations-actions";

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "primary";
        confirmButton.textContent = "Potwierdź";
        confirmButton.addEventListener("click", async () => {
          await db.collection(collectionName).doc(game.id).collection(GAME_CONFIRMATIONS_COLLECTION).doc(verifiedPlayer.id).set({
            playerId: verifiedPlayer.id,
            playerName: verifiedPlayer.name || "",
            confirmed: true,
            updatedBy: "player",
            updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          tr.classList.add("confirmed-row");
        });

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "danger";
        cancelButton.textContent = "Anuluj";
        cancelButton.addEventListener("click", async () => {
          await db.collection(collectionName).doc(game.id).collection(GAME_CONFIRMATIONS_COLLECTION).doc(verifiedPlayer.id).set({
            playerId: verifiedPlayer.id,
            playerName: verifiedPlayer.name || "",
            confirmed: false,
            updatedBy: "player",
            updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          tr.classList.remove("confirmed-row");
        });

        const notesButton = document.createElement("button");
        notesButton.type = "button";
        notesButton.className = "secondary";
        notesButton.textContent = "Notatki do gry";
        notesButton.addEventListener("click", () => {
          summaryNotesModal.open({
            gameId: game.id,
            gameName: game.name || "Bez nazwy",
            notes: getPreGameNotes(game),
            canWrite: false,
            onSave: null,
            notesLabel: "Notatki do gry",
            clearButtonLabel: "Domyślne",
            clearToDefault: true,
            readOnlyMessage: "Podgląd notatek do gry (tylko odczyt).",
            triggerButton: notesButton
          });
        });

        actionsWrap.append(confirmButton, cancelButton, notesButton);
        actionsCell.appendChild(actionsWrap);
        tr.append(gameTypeCell, dateCell, nameCell, actionsCell);
        body.appendChild(tr);
      });

      status.textContent = `Załadowano ${visibleGames.length} gier.`;
    } catch (error) {
      status.textContent = "Nie udało się pobrać gier do potwierdzenia.";
    }
  };

  const verifyPin = async () => {
    const pinValue = sanitizePin(input.value);
    if (!isPinValid(pinValue)) {
      pinStatus.textContent = "Wpisz komplet 5 cyfr.";
      return;
    }

    const player = adminPlayersState.playerByPin.get(pinValue);
    if (player && isPlayerAllowedForTab(player, "confirmationsTab")) {
      setConfirmationsPinGateState(true);
      setConfirmationsVerifiedPlayerId(player.id);
      pinStatus.textContent = `PIN poprawny. Witaj ${player.name || "graczu"}.`;
      updateConfirmationsVisibility();
      await readData();
      return;
    }

    pinStatus.textContent = "Błędny PIN lub brak uprawnień do zakładki „Gry do potwierdzenia”.";
  };

  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  submitButton.addEventListener("click", () => {
    void verifyPin();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      void verifyPin();
    }
  });

  refreshButton.addEventListener("click", async () => {
    refreshButton.disabled = true;
    await readData("server");
    refreshButton.disabled = false;
  });

  updateConfirmationsVisibility();
  if (getConfirmationsPinGateState() && getConfirmationsVerifiedPlayer()) {
    void readData();
  }
};

const updateUserGamesVisibility = () => {
  const gate = document.querySelector("#userGamesPinGate");
  const content = document.querySelector("#userGamesContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = getUserGamesPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const initUserGamesTab = () => {
  const input = document.querySelector("#userGamesPinInput");
  const submitButton = document.querySelector("#userGamesPinSubmit");
  const pinStatus = document.querySelector("#userGamesPinStatus");

  if (!input || !submitButton || !pinStatus) {
    return;
  }

  const verifyPin = () => {
    const pinValue = sanitizePin(input.value);
    if (!isPinValid(pinValue)) {
      pinStatus.textContent = "Wpisz komplet 5 cyfr.";
      return;
    }

    const player = adminPlayersState.playerByPin.get(pinValue);
    if (player && isPlayerAllowedForTab(player, "userGamesTab")) {
      setUserGamesPinGateState(true);
      setUserGamesVerifiedPlayerId(player.id);
      pinStatus.textContent = `PIN poprawny. Witaj ${player.name || "graczu"}.`;
      updateUserGamesVisibility();
      return;
    }

    pinStatus.textContent = "Błędny PIN lub brak uprawnień do zakładki „Gry użytkowników”.";
  };

  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  submitButton.addEventListener("click", verifyPin);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyPin();
    }
  });

  updateUserGamesVisibility();

  if (getUserGamesPinGateState()) {
    const verifiedPlayer = getUserGamesVerifiedPlayer();
    if (!verifiedPlayer || !isPlayerAllowedForTab(verifiedPlayer, "userGamesTab")) {
      setUserGamesPinGateState(false);
      setUserGamesVerifiedPlayerId("");
      updateUserGamesVisibility();
    }
  }
};

const updateStatisticsVisibility = () => {
  const gate = document.querySelector("#statisticsPinGate");
  const content = document.querySelector("#statisticsContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = getStatisticsPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const synchronizeStatisticsAccessState = () => {
  if (!getStatisticsPinGateState()) {
    updateStatisticsVisibility();
    return;
  }

  const verifiedPlayer = getStatisticsVerifiedPlayer();
  if (!verifiedPlayer || !isPlayerAllowedForTab(verifiedPlayer, "statsTab")) {
    setStatisticsPinGateState(false);
    setStatisticsVerifiedPlayerId("");
  }

  updateStatisticsVisibility();
  window.dispatchEvent(new CustomEvent("statistics-access-updated"));
};

const initStatisticsTab = () => {
  const input = document.querySelector("#statisticsPinInput");
  const submitButton = document.querySelector("#statisticsPinSubmit");
  const pinStatus = document.querySelector("#statisticsPinStatus");

  if (!input || !submitButton || !pinStatus) {
    return;
  }

  const verifyPin = () => {
    const pinValue = sanitizePin(input.value);
    if (!isPinValid(pinValue)) {
      pinStatus.textContent = "Wpisz komplet 5 cyfr.";
      return;
    }

    const player = adminPlayersState.playerByPin.get(pinValue);
    if (player && isPlayerAllowedForTab(player, "statsTab")) {
      setStatisticsPinGateState(true);
      setStatisticsVerifiedPlayerId(player.id);
      pinStatus.textContent = `PIN poprawny. Witaj ${player.name || "graczu"}.`;
      updateStatisticsVisibility();
      window.dispatchEvent(new CustomEvent("statistics-access-updated"));
      return;
    }

    pinStatus.textContent = "Błędny PIN lub brak uprawnień do zakładki „Statystyki”.";
  };

  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  submitButton.addEventListener("click", verifyPin);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyPin();
    }
  });

  updateStatisticsVisibility();

  synchronizeStatisticsAccessState();
};

const initUserGamesManager = ({
  yearsListSelector,
  addGameButtonSelector,
  gamesTableBodySelector,
  summariesContainerSelector,
  statusSelector,
  modalSelector,
  modalMetaSelector,
  modalBodySelector,
  modalEntryFeeBulkButtonSelector,
  modalCloseSelector,
  modalAddRowButtonSelector,
  selectedYearStorageKey,
  canWrite,
  createGamePayload
}) => {
  const yearsList = document.querySelector(yearsListSelector);
  const addGameButton = document.querySelector(addGameButtonSelector);
  const gamesTableBody = document.querySelector(gamesTableBodySelector);
  const summariesContainer = document.querySelector(summariesContainerSelector);
  const status = document.querySelector(statusSelector);
  const modal = document.querySelector(modalSelector);
  const modalMeta = document.querySelector(modalMetaSelector);
  const modalBody = document.querySelector(modalBodySelector);
  const modalEntryFeeBulkButton = modalEntryFeeBulkButtonSelector ? document.querySelector(modalEntryFeeBulkButtonSelector) : null;
  const modalClose = document.querySelector(modalCloseSelector);
  const modalAddRowButton = document.querySelector(modalAddRowButtonSelector);

  if (!yearsList || !gamesTableBody || !summariesContainer || !status || !addGameButton || !modal || !modalMeta || !modalBody || !modalAddRowButton) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    status.textContent = "Uzupełnij konfigurację Firebase, aby zarządzać grami użytkowników.";
    addGameButton.disabled = true;
    return;
  }

  const db = firebaseApp.firestore();
  const gamesCollectionName = getUserGamesCollectionName();
  const gameDetailsCollectionName = getGameDetailsCollectionName();
  const state = {
    years: [],
    selectedYear: loadSavedSelectedGamesYear(selectedYearStorageKey),
    games: [],
    detailsByGame: new Map(),
    detailsUnsubscribers: new Map(),
    activeGameIdInModal: null,
    playerOptions: []
  };

  const summaryNotesModal = getSummaryNotesModalController();

  const closeModal = () => {
    state.activeGameIdInModal = null;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const getGamesForSelectedYear = () => {
    if (!state.selectedYear) {
      return [];
    }
    return state.games.filter((game) => extractYearFromDate(game.gameDate) === state.selectedYear).sort(compareByGameDateAsc);
  };

  const syncYearsAfterLocalGameUpdate = (gameId, nextValues) => {
    const targetGame = state.games.find((game) => game.id === gameId);
    if (!targetGame) {
      return;
    }
    Object.assign(targetGame, nextValues);
    synchronizeYearsFromGames();
  };

  const getDetailRows = (gameId) => {
    const rows = state.detailsByGame.get(gameId) ?? [];
    return rows.map((row) => {
      const entryFee = parseIntegerOrZero(row.entryFee);
      const rebuy = parseIntegerOrZero(row.rebuy);
      const payout = parseIntegerOrZero(row.payout);
      return {
        ...row,
        entryFee,
        rebuy,
        payout,
        profit: payout - (entryFee + rebuy),
        points: parseIntegerOrZero(row.points),
        championship: Boolean(row.championship)
      };
    });
  };

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
    const payoutSum = rows.reduce((sum, row) => sum + row.payout, 0);
    const sortedRows = [...rows].sort((a, b) => b.profit - a.profit);

    return {
      pool,
      payoutSum,
      hasPayoutMismatch: payoutSum !== pool,
      rows: sortedRows.map((row) => ({
        ...row,
        poolSharePercent: pool === 0 ? 0 : Math.round((row.payout / pool) * 100)
      }))
    };
  };

  const renderYears = () => {
    yearsList.innerHTML = "";
    if (!state.years.length) {
      const info = document.createElement("p");
      info.className = "status-text";
      info.textContent = "Brak lat. Dodaj pierwszą grę, aby rok pojawił się automatycznie.";
      yearsList.appendChild(info);
      return;
    }

    state.years.forEach((year) => {
      const yearButton = document.createElement("button");
      yearButton.type = "button";
      yearButton.className = `admin-games-year-button ${state.selectedYear === year ? "is-active" : ""}`.trim();
      yearButton.textContent = String(year);
      yearButton.addEventListener("click", () => {
        state.selectedYear = year;
        saveSelectedGamesYear(state.selectedYear, selectedYearStorageKey);
        renderYears();
        renderGamesTable();
        renderSummaries();
      });
      yearsList.appendChild(yearButton);
    });
  };

  const renderSummaries = () => {
    const previousScrollLeftByGameId = new Map();
    summariesContainer.querySelectorAll("[data-summary-game-id]").forEach((element) => {
      previousScrollLeftByGameId.set(element.dataset.summaryGameId ?? "", element.scrollLeft);
    });
    summariesContainer.innerHTML = "";
    const games = getGamesForSelectedYear();

    games.forEach((game) => {
      const wrapper = document.createElement("section");
      wrapper.className = "admin-games-section admin-game-summary";

      const heading = document.createElement("div");
      heading.className = "admin-game-summary-heading";

      const notesButton = document.createElement("button");
      notesButton.type = "button";
      notesButton.className = "secondary";
      notesButton.textContent = "Notatki po grze";
      notesButton.addEventListener("click", () => {
        summaryNotesModal.open({
          gameId: game.id,
          gameName: game.name || "Bez nazwy",
          notes: getPostGameNotes(game),
          canWrite: canWrite(),
          onSave: async ({ notes }) => {
            await db.collection(gamesCollectionName).doc(game.id).update({
              postGameNotes: notes,
              notes: firebaseApp.firestore.FieldValue.delete()
            });
            const target = state.games.find((entry) => entry.id === game.id);
            if (target) {
              target.postGameNotes = notes;
            }
          },
          notesLabel: "Notatki po grze",
          clearButtonLabel: "Usuń",
          clearToDefault: false,
          textareaPlaceholder: "Wpisz notatki po grze...",
          triggerButton: notesButton
        });
      });

      const title = document.createElement("h3");
      title.textContent = `Podsumowanie gry ${game.name || "Bez nazwy"}`;
      heading.append(notesButton, title);

      const metrics = getGameSummaryMetrics(game.id);
      const mismatchWarning = document.createElement("p");
      mismatchWarning.className = "status-text status-text-danger";
      mismatchWarning.textContent = "Nie zgadza się suma wypłat oraz wpisowych i rebuy/add-on";

      const poolInfo = document.createElement("p");
      poolInfo.className = "status-text";
      poolInfo.textContent = `Pula: ${metrics.pool}`;

      const gameTypeInfo = document.createElement("p");
      gameTypeInfo.className = "status-text";
      gameTypeInfo.textContent = `Rodzaj gry: ${game.gameType || "-"}`;

      const tableScroll = document.createElement("div");
      tableScroll.className = "admin-table-scroll";
      tableScroll.dataset.summaryGameId = game.id;
      const table = document.createElement("table");
      table.className = "admin-data-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Gracz</th>
            <th>Wpisowe</th>
            <th>Rebuy/Add-on</th>
            <th>Wypłata</th>
            <th>+/-</th>
            <th>% puli</th>
            <th>Punkty</th>
            <th>Mistrzostwo</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement("tbody");

      if (!metrics.rows.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 8;
        emptyCell.textContent = "Brak danych do podsumowania.";
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
      } else {
        metrics.rows.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.playerName || ""}</td>
            <td>${row.entryFee}</td>
            <td>${row.rebuy}</td>
            <td>${row.payout}</td>
            <td>${row.profit}</td>
            <td>${row.poolSharePercent}</td>
            <td>${row.points}</td>
            <td>${row.championship ? "✓" : ""}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      table.appendChild(tbody);
      tableScroll.appendChild(table);
      tableScroll.scrollLeft = previousScrollLeftByGameId.get(game.id) ?? 0;

      if (metrics.hasPayoutMismatch) {
        wrapper.append(heading, mismatchWarning, gameTypeInfo, poolInfo, tableScroll);
      } else {
        wrapper.append(heading, gameTypeInfo, poolInfo, tableScroll);
      }
      summariesContainer.appendChild(wrapper);
    });
  };

  const renderGamesTable = () => {
    const focusState = getFocusedAdminInputState(gamesTableBody);
    gamesTableBody.innerHTML = "";

    if (!state.selectedYear) {
      status.textContent = "Wybierz rok z listy po lewej stronie.";
      return;
    }

    const games = getGamesForSelectedYear();
    status.textContent = `Wybrany rok: ${state.selectedYear}. Liczba gier: ${games.length}.`;

    if (!games.length) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 5;
      emptyCell.textContent = "Brak gier z datą w wybranym roku.";
      emptyRow.appendChild(emptyCell);
      gamesTableBody.appendChild(emptyRow);
      return;
    }

    games.forEach((game) => {
      const row = document.createElement("tr");
      const writeEnabled = canWrite();

      const gameTypeCell = document.createElement("td");
      const gameTypeSelect = document.createElement("select");
      gameTypeSelect.className = "admin-input";
      gameTypeSelect.dataset.focusTarget = "game-list";
      gameTypeSelect.dataset.section = "games-table";
      gameTypeSelect.dataset.tableId = game.id;
      gameTypeSelect.dataset.columnKey = "gameType";
      ["Cashout", "Turniej"].forEach((label) => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        gameTypeSelect.appendChild(option);
      });
      gameTypeSelect.value = game.gameType === "Turniej" ? "Turniej" : "Cashout";
      gameTypeSelect.disabled = !writeEnabled;
      gameTypeSelect.addEventListener("change", () => {
        if (!canWrite()) return;
        void db.collection(gamesCollectionName).doc(game.id).update({ gameType: gameTypeSelect.value });
      });
      gameTypeCell.appendChild(gameTypeSelect);

      const dateCell = document.createElement("td");
      const dateInput = document.createElement("input");
      dateInput.type = "date";
      dateInput.className = "admin-input";
      dateInput.dataset.focusTarget = "game-list";
      dateInput.dataset.section = "games-table";
      dateInput.dataset.tableId = game.id;
      dateInput.dataset.columnKey = "gameDate";
      dateInput.value = game.gameDate ?? getFormattedCurrentDate();
      dateInput.disabled = !writeEnabled;
      dateInput.addEventListener("change", () => {
        if (!canWrite()) return;
        const nextDate = dateInput.value || getFormattedCurrentDate();
        const currentName = typeof game.name === "string" ? game.name.trim() : "";
        const updatePayload = { gameDate: nextDate };
        if (!currentName || parseDefaultTableNumber(currentName)) {
          const otherGames = state.games.filter((entry) => entry.id !== game.id);
          updatePayload.name = getNextGameNameForDate(otherGames, nextDate);
        }
        syncYearsAfterLocalGameUpdate(game.id, updatePayload);
        void db.collection(gamesCollectionName).doc(game.id).update(updatePayload);
      });
      dateCell.appendChild(dateInput);

      const nameCell = document.createElement("td");
      const nameWrap = document.createElement("div");
      nameWrap.className = "admin-games-name-control";
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "admin-input";
      nameInput.dataset.focusTarget = "game-list";
      nameInput.dataset.section = "games-table";
      nameInput.dataset.tableId = game.id;
      nameInput.dataset.columnKey = "name";
      nameInput.value = game.name ?? "";
      nameInput.placeholder = "Nazwa gry";
      nameInput.disabled = !writeEnabled;
      nameInput.addEventListener("input", () => {
        if (!canWrite()) return;
        const value = nameInput.value;
        scheduleDebouncedUpdate(`user-game-name-${game.id}`, () => {
          void db.collection(gamesCollectionName).doc(game.id).update({ name: value });
        });
      });
      const detailsButton = document.createElement("button");
      detailsButton.type = "button";
      detailsButton.className = "secondary";
      detailsButton.textContent = "Szczegóły";
      detailsButton.addEventListener("click", () => {
        state.activeGameIdInModal = game.id;
        renderModal(game.id);
        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
      });
      const notesButton = document.createElement("button");
      notesButton.type = "button";
      notesButton.className = "secondary";
      notesButton.textContent = "Notatki do gry";
      notesButton.addEventListener("click", () => {
        summaryNotesModal.open({
          gameId: game.id,
          gameName: game.name || "Bez nazwy",
          notes: getPreGameNotes(game),
          canWrite: canWrite(),
          onSave: async ({ notes }) => {
            await db.collection(gamesCollectionName).doc(game.id).update({
              preGameNotes: notes,
              notes: firebaseApp.firestore.FieldValue.delete()
            });
            const target = state.games.find((entry) => entry.id === game.id);
            if (target) {
              target.preGameNotes = notes;
            }
          },
          notesLabel: "Notatki do gry",
          clearButtonLabel: "Domyślne",
          clearToDefault: true,
          textareaPlaceholder: "Wpisz notatki do gry...",
          triggerButton: notesButton
        });
      });
      nameWrap.append(nameInput, detailsButton, notesButton);
      nameCell.appendChild(nameWrap);

      const closedCell = document.createElement("td");
      const closedInput = document.createElement("input");
      closedInput.type = "checkbox";
      closedInput.checked = Boolean(game.isClosed);
      closedInput.disabled = !writeEnabled;
      closedInput.addEventListener("change", () => {
        if (!canWrite()) return;
        void db.collection(gamesCollectionName).doc(game.id).update({ isClosed: closedInput.checked });
      });
      closedCell.appendChild(closedInput);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "Usuń";
      deleteButton.disabled = !writeEnabled;
      deleteButton.addEventListener("click", async () => {
        if (!canWrite()) return;
        const gameRef = db.collection(gamesCollectionName).doc(game.id);
        const detailsSnapshot = await gameRef.collection(gameDetailsCollectionName).get();
        const confirmationsSnapshot = await gameRef.collection(GAME_CONFIRMATIONS_COLLECTION).get();
        const batch = db.batch();
        detailsSnapshot.forEach((doc) => batch.delete(doc.ref));
        confirmationsSnapshot.forEach((doc) => batch.delete(doc.ref));
        batch.delete(gameRef);
        await batch.commit();
      });
      deleteCell.appendChild(deleteButton);

      row.append(gameTypeCell, dateCell, nameCell, closedCell, deleteCell);
      gamesTableBody.appendChild(row);
    });

    restoreFocusedAdminInputState(gamesTableBody, focusState);
  };

  const renderModal = (gameId) => {
    const game = state.games.find((entry) => entry.id === gameId);
    if (!game) {
      return;
    }

    const focusState = getFocusedAdminInputState(modalBody);
    modalMeta.textContent = `Nazwa: ${game.name || "-"} | Rodzaj gry: ${game.gameType || "-"} | Data: ${game.gameDate || "-"}`;
    modalBody.innerHTML = "";

    const rows = state.detailsByGame.get(gameId) ?? [];
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const writeEnabled = canWrite();

      const playerCell = document.createElement("td");
      const playerSelect = document.createElement("select");
      playerSelect.className = "admin-input";
      playerSelect.dataset.focusTarget = "game-details-row";
      playerSelect.dataset.section = "games-modal";
      playerSelect.dataset.tableId = gameId;
      playerSelect.dataset.rowId = row.id;
      playerSelect.dataset.columnKey = "playerName";
      const currentPlayerName = typeof row.playerName === "string" ? row.playerName : "";
      const options = [...state.playerOptions];
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "Wybierz gracza";
      playerSelect.appendChild(emptyOption);
      if (currentPlayerName && !options.includes(currentPlayerName)) {
        const legacyOption = document.createElement("option");
        legacyOption.value = currentPlayerName;
        legacyOption.textContent = `${currentPlayerName} (usunięty)`;
        legacyOption.disabled = true;
        legacyOption.selected = true;
        playerSelect.appendChild(legacyOption);
      }
      options.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        playerSelect.appendChild(option);
      });
      playerSelect.value = currentPlayerName;
      playerSelect.disabled = !writeEnabled;
      playerSelect.addEventListener("change", () => {
        if (!canWrite()) return;
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ playerName: playerSelect.value });
      });
      playerCell.appendChild(playerSelect);

      const createNumericCell = (key) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "admin-input";
        input.dataset.focusTarget = "game-details-row";
        input.dataset.section = "games-modal";
        input.dataset.tableId = gameId;
        input.dataset.rowId = row.id;
        input.dataset.columnKey = key;
        const rawValue = row[key] ?? "";
        input.value = rawValue;
        input.disabled = !writeEnabled;
        input.addEventListener("input", () => {
          if (!canWrite()) return;
          input.value = sanitizeIntegerInput(input.value);
          scheduleDebouncedUpdate(`user-detail-${gameId}-${row.id}-${key}`, () => {
            void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ [key]: input.value });
          });
        });
        td.appendChild(input);
        return td;
      };

      const entryFeeCell = createNumericCell("entryFee");
      const rebuyCell = createNumericCell("rebuy");
      const payoutCell = createNumericCell("payout");

      const profitCell = document.createElement("td");
      profitCell.textContent = String(parseIntegerOrZero(row.payout) - (parseIntegerOrZero(row.entryFee) + parseIntegerOrZero(row.rebuy)));

      const pointsCell = createNumericCell("points");

      const championshipCell = document.createElement("td");
      const championshipInput = document.createElement("input");
      championshipInput.type = "checkbox";
      championshipInput.dataset.focusTarget = "game-details-row";
      championshipInput.dataset.section = "games-modal";
      championshipInput.dataset.tableId = gameId;
      championshipInput.dataset.rowId = row.id;
      championshipInput.dataset.columnKey = "championship";
      championshipInput.checked = Boolean(row.championship);
      championshipInput.disabled = !writeEnabled;
      championshipInput.addEventListener("change", () => {
        if (!canWrite()) return;
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ championship: championshipInput.checked });
      });
      championshipCell.appendChild(championshipInput);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger admin-row-delete";
      deleteButton.textContent = "Usuń";
      deleteButton.disabled = !writeEnabled;
      deleteButton.addEventListener("click", () => {
        if (!canWrite()) return;
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).delete();
      });
      deleteCell.appendChild(deleteButton);

      tr.append(playerCell, entryFeeCell, rebuyCell, payoutCell, profitCell, pointsCell, championshipCell, deleteCell);
      modalBody.appendChild(tr);
    });

    modalAddRowButton.disabled = !canWrite();
    restoreFocusedAdminInputState(modalBody, focusState);
  };

  const synchronizeYearsFromGames = () => {
    state.years = normalizeYearList(state.games.map((game) => extractYearFromDate(game.gameDate)).filter((year) => Number.isInteger(year)));
    if (!state.selectedYear || !state.years.includes(state.selectedYear)) {
      state.selectedYear = state.years[0] ?? null;
    }
    saveSelectedGamesYear(state.selectedYear, selectedYearStorageKey);
    renderYears();
    renderGamesTable();
    renderSummaries();
  };

  db.collection(PLAYER_ACCESS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).onSnapshot((snapshot) => {
    const players = Array.isArray(snapshot.data()?.players) ? snapshot.data().players : [];
    state.playerOptions = players.map((player) => (typeof player.name === "string" ? player.name.trim() : "")).filter(Boolean);
    if (state.activeGameIdInModal) {
      renderModal(state.activeGameIdInModal);
    }
  });

  db.collection(gamesCollectionName).orderBy("createdAt", "asc").onSnapshot((snapshot) => {
    state.games = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    state.games.forEach((game) => {
      void clearLegacyNotesField({ firebaseApp, db, collectionName: gamesCollectionName, game });
    });

    const activeIds = new Set(state.games.map((game) => game.id));
    state.detailsUnsubscribers.forEach((unsubscribe, gameId) => {
      if (!activeIds.has(gameId)) {
        unsubscribe();
        state.detailsUnsubscribers.delete(gameId);
        state.detailsByGame.delete(gameId);
      }
    });

    state.games.forEach((game) => {
      if (state.detailsUnsubscribers.has(game.id)) {
        return;
      }
      const unsubscribe = db.collection(gamesCollectionName).doc(game.id).collection(gameDetailsCollectionName).orderBy("createdAt", "asc").onSnapshot((rowSnapshot) => {
        state.detailsByGame.set(game.id, rowSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        if (state.activeGameIdInModal === game.id) {
          renderModal(game.id);
        }
        renderSummaries();
      });
      state.detailsUnsubscribers.set(game.id, unsubscribe);
    });

    synchronizeYearsFromGames();
  });

  addGameButton.addEventListener("click", async () => {
    if (!canWrite()) {
      status.textContent = "Zweryfikuj PIN do zakładki „Gry użytkowników”, aby dodawać gry.";
      return;
    }
    addGameButton.disabled = true;
    status.textContent = "Dodawanie gry...";
    try {
      const gameDate = getFormattedCurrentDate();
      const name = getNextGameNameForDate(state.games, gameDate);
      await db.collection(gamesCollectionName).add({
        gameType: "Cashout",
        gameDate,
        name,
        isClosed: false,
        preGameNotes: DEFAULT_GAME_NOTES_TEMPLATE,
        postGameNotes: "",
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        ...createGamePayload()
      });
      status.textContent = `Dodano grę "${name}" z datą ${gameDate}.`;
    } catch (error) {
      status.textContent = "Nie udało się dodać gry użytkownika.";
    } finally {
      addGameButton.disabled = false;
    }
  });

  modalAddRowButton.addEventListener("click", async () => {
    if (!state.activeGameIdInModal || !canWrite()) {
      return;
    }
    await db.collection(gamesCollectionName).doc(state.activeGameIdInModal).collection(gameDetailsCollectionName).add({
      playerName: "",
      entryFee: "",
      rebuy: "",
      payout: "",
      points: "",
      championship: false,
      createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
    });
  });

  if (modalEntryFeeBulkButton) {
    modalEntryFeeBulkButton.addEventListener("click", async () => {
      if (!canWrite()) {
        return;
      }
      if (!state.activeGameIdInModal) {
        status.textContent = "Otwórz szczegóły gry, aby zbiorczo ustawić wpisowe.";
        return;
      }
      const promptValue = window.prompt("Podaj wartość wpisowego dla wszystkich graczy.", "0");
      if (promptValue === null) {
        return;
      }
      const normalized = sanitizeIntegerInput(promptValue);
      if (!normalized || normalized === "-") {
        status.textContent = "Podaj poprawną wartość liczbową wpisowego.";
        return;
      }
      const rows = state.detailsByGame.get(state.activeGameIdInModal) ?? [];
      await Promise.all(rows.map((row) => db.collection(gamesCollectionName)
        .doc(state.activeGameIdInModal)
        .collection(gameDetailsCollectionName)
        .doc(row.id)
        .update({ entryFee: normalized })));
      status.textContent = `Ustawiono wpisowe ${normalized} dla ${rows.length} wierszy.`;
    });
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-visible")) {
      closeModal();
    }
  });
};

const initAdminUserGames = () => {
  initUserGamesManager({
    yearsListSelector: "#adminUserGamesYearsList",
    addGameButtonSelector: "#adminUserGamesAddGame",
    gamesTableBodySelector: "#adminUserGamesTableBody",
    summariesContainerSelector: "#adminUserGamesSummaries",
    statusSelector: "#adminUserGamesStatus",
    modalSelector: "#userGameDetailsModal",
    modalMetaSelector: "#userGameDetailsMeta",
    modalBodySelector: "#userGameDetailsBody",
    modalEntryFeeBulkButtonSelector: "#userGameDetailsModal .game-entry-fee-bulk-button",
    modalCloseSelector: "#userGameDetailsClose",
    modalAddRowButtonSelector: "#userGameDetailsAddRow",
    selectedYearStorageKey: ADMIN_USER_GAMES_SELECTED_YEAR_STORAGE_KEY,
    canWrite: () => true,
    createGamePayload: () => ({
      createdByPlayerId: "admin",
      createdByPlayerName: "Administrator"
    })
  });
};

const initPlayerUserGames = () => {
  initUserGamesManager({
    yearsListSelector: "#userGamesYearsList",
    addGameButtonSelector: "#userGamesAddGame",
    gamesTableBodySelector: "#userGamesTableBody",
    summariesContainerSelector: "#userGamesSummaries",
    statusSelector: "#userGamesStatus",
    modalSelector: "#playerUserGameDetailsModal",
    modalMetaSelector: "#playerUserGameDetailsMeta",
    modalBodySelector: "#playerUserGameDetailsBody",
    modalEntryFeeBulkButtonSelector: "#playerUserGameDetailsModal .game-entry-fee-bulk-button",
    modalCloseSelector: "#playerUserGameDetailsClose",
    modalAddRowButtonSelector: "#playerUserGameDetailsAddRow",
    selectedYearStorageKey: USER_GAMES_SELECTED_YEAR_STORAGE_KEY,
    canWrite: () => {
      const player = getUserGamesVerifiedPlayer();
      return getUserGamesPinGateState() && Boolean(player) && isPlayerAllowedForTab(player, "userGamesTab");
    },
    createGamePayload: () => {
      const player = getUserGamesVerifiedPlayer();
      return {
        createdByPlayerId: player?.id || "",
        createdByPlayerName: player?.name || ""
      };
    }
  });
};


const initAdminConfirmations = () => {
  const list = document.querySelector("#adminConfirmationsList");
  const status = document.querySelector("#adminConfirmationsStatus");
  const firebaseApp = getFirebaseApp();

  if (!list || !status) {
    return;
  }

  if (!firebaseApp) {
    status.textContent = "Uzupełnij konfigurację Firebase, aby zarządzać potwierdzeniami.";
    return;
  }

  const db = firebaseApp.firestore();
  const gamesCollectionName = getGamesCollectionName();
  const userGamesCollectionName = getUserGamesCollectionName();
  const gameDetailsCollectionName = getGameDetailsCollectionName();

  const refreshData = async (source = "default") => {
    list.innerHTML = "";
    status.textContent = source === "server" ? "Odświeżanie danych..." : "Pobieranie danych...";

    try {
      const games = await getActiveGamesForConfirmationsFromCollections(db, [gamesCollectionName, userGamesCollectionName], source);

      if (!games.length) {
        status.textContent = "Brak aktywnych gier do potwierdzenia.";
        return;
      }

      for (const entry of games) {
        const { collectionName, game } = entry;
        const wrapper = document.createElement("section");
        wrapper.className = "admin-confirmation-game";

        const title = document.createElement("h4");
        title.textContent = game.name || "Bez nazwy";

        const meta = document.createElement("p");
        meta.className = "admin-confirmation-game-meta";
        meta.textContent = `Rodzaj gry: ${game.gameType || "-"} | Data: ${game.gameDate || "-"}`;

        const tableScroll = document.createElement("div");
        tableScroll.className = "admin-table-scroll";
        const table = document.createElement("table");
        table.className = "admin-data-table";
        table.innerHTML = `
          <thead>
            <tr>
              <th>Gracz</th>
              <th>Status</th>
              <th>Akcje</th>
            </tr>
          </thead>
        `;
        const tbody = document.createElement("tbody");

        const rowsSnapshot = await db.collection(collectionName).doc(game.id).collection(gameDetailsCollectionName).get(
          source === "default" ? undefined : { source }
        );
        const playerNames = Array.from(new Set(rowsSnapshot.docs
          .map((doc) => (typeof doc.data()?.playerName === "string" ? doc.data().playerName.trim() : ""))
          .filter(Boolean)));

        if (!playerNames.length) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 3;
          td.textContent = "Brak zapisanych graczy.";
          tr.appendChild(td);
          tbody.appendChild(tr);
        } else {
          const confirmationSnapshot = await db.collection(collectionName).doc(game.id).collection(GAME_CONFIRMATIONS_COLLECTION).get(
            source === "default" ? undefined : { source }
          );
          const confirmationsByName = new Map();
          confirmationSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const playerName = typeof data.playerName === "string" ? data.playerName.trim() : "";
            if (playerName) {
              confirmationsByName.set(playerName, { ...data, id: doc.id });
            }
          });

          playerNames.forEach((playerName) => {
            const tr = document.createElement("tr");
            const confirmation = confirmationsByName.get(playerName) ?? null;
            const matchedPlayer = adminPlayersState.players.find((player) => (player.name || "").trim() === playerName);
            const confirmationDocId = matchedPlayer?.id || confirmation?.id || playerName;
            if (confirmation?.confirmed) {
              tr.classList.add("confirmed-row");
            }

            const nameCell = document.createElement("td");
            nameCell.textContent = playerName;

            const statusCell = document.createElement("td");
            statusCell.textContent = confirmation?.confirmed ? "Potwierdzono" : "Niepotwierdzono";

            const actionsCell = document.createElement("td");
            const actionsWrap = document.createElement("div");
            actionsWrap.className = "confirmations-actions";

            const confirmButton = document.createElement("button");
            confirmButton.type = "button";
            confirmButton.className = "primary";
            confirmButton.textContent = "Potwierdź";
            confirmButton.addEventListener("click", async () => {
              await db.collection(collectionName).doc(game.id).collection(GAME_CONFIRMATIONS_COLLECTION).doc(confirmationDocId).set({
                playerId: confirmationDocId,
                playerName,
                confirmed: true,
                updatedBy: "admin",
                updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
              tr.classList.add("confirmed-row");
              statusCell.textContent = "Potwierdzono";
            });

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "danger";
            cancelButton.textContent = "Anuluj";
            cancelButton.addEventListener("click", async () => {
              await db.collection(collectionName).doc(game.id).collection(GAME_CONFIRMATIONS_COLLECTION).doc(confirmationDocId).set({
                playerId: confirmationDocId,
                playerName,
                confirmed: false,
                updatedBy: "admin",
                updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
              tr.classList.remove("confirmed-row");
              statusCell.textContent = "Niepotwierdzono";
            });

            actionsWrap.append(confirmButton, cancelButton);
            actionsCell.appendChild(actionsWrap);
            tr.append(nameCell, statusCell, actionsCell);
            tbody.appendChild(tr);
          });
        }

        table.appendChild(tbody);
        tableScroll.appendChild(table);
        wrapper.append(title, meta, tableScroll);
        list.appendChild(wrapper);
      }

      status.textContent = `Załadowano ${games.length} aktywnych gier (Tables + UserGames).`;
    } catch (error) {
      status.textContent = "Nie udało się pobrać listy potwierdzeń.";
    }
  };

  void refreshData();
  registerAdminRefreshHandler("adminConfirmationsTab", async () => {
    await refreshData("server");
  });
};

const initUserTabs = () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-panel");
  if (!tabButtons.length) {
    return;
  }

  const setActiveTab = (target) => {
    if (!target) {
      return;
    }

    tabButtons.forEach((btn) => btn.classList.remove("is-active"));
    panels.forEach((panel) => panel.classList.remove("is-active"));

    const targetButton = Array.from(tabButtons).find(
      (button) => button.getAttribute("data-target") === target
    );
    const targetPanel = document.querySelector(`#${target}`);

    if (target === "nextGameTab") {
      setPinGateState(false);
      const pinInput = document.querySelector("#nextGamePinInput");
      const pinStatus = document.querySelector("#nextGamePinStatus");
      if (pinInput) {
        pinInput.value = "";
      }
      if (pinStatus) {
        pinStatus.textContent = "";
      }
      updatePinVisibility();
    }

    if (target === "chatTab") {
      setChatPinGateState(false);
      setChatVerifiedPlayerId("");
      const chatPinInput = document.querySelector("#chatPinInput");
      const chatPinStatus = document.querySelector("#chatPinStatus");
      if (chatPinInput) {
        chatPinInput.value = "";
      }
      if (chatPinStatus) {
        chatPinStatus.textContent = "";
      }
      if (typeof chatState.unsubscribe === "function") {
        chatState.unsubscribe();
        chatState.unsubscribe = null;
      }
      updateChatVisibility();
    }

    if (target === "confirmationsTab") {
      setConfirmationsPinGateState(false);
      setConfirmationsVerifiedPlayerId("");
      const confirmationsPinInput = document.querySelector("#confirmationsPinInput");
      const confirmationsPinStatus = document.querySelector("#confirmationsPinStatus");
      if (confirmationsPinInput) {
        confirmationsPinInput.value = "";
      }
      if (confirmationsPinStatus) {
        confirmationsPinStatus.textContent = "";
      }
    }

    if (target === "userGamesTab") {
      setUserGamesPinGateState(false);
      setUserGamesVerifiedPlayerId("");
      const userGamesPinInput = document.querySelector("#userGamesPinInput");
      const userGamesPinStatus = document.querySelector("#userGamesPinStatus");
      if (userGamesPinInput) {
        userGamesPinInput.value = "";
      }
      if (userGamesPinStatus) {
        userGamesPinStatus.textContent = "";
      }
      updateUserGamesVisibility();
    }

    if (target === "statsTab") {
      setStatisticsPinGateState(false);
      setStatisticsVerifiedPlayerId("");
      const statisticsPinInput = document.querySelector("#statisticsPinInput");
      const statisticsPinStatus = document.querySelector("#statisticsPinStatus");
      if (statisticsPinInput) {
        statisticsPinInput.value = "";
      }
      if (statisticsPinStatus) {
        statisticsPinStatus.textContent = "";
      }
      updateStatisticsVisibility();
    }

    if (targetButton) {
      targetButton.classList.add("is-active");
    }
    if (targetPanel) {
      targetPanel.classList.add("is-active");
    }
  };

  setActiveTab("updatesTab");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.getAttribute("data-target"));
    });
  });
};

const extractYearFromDate = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const yearMatches = value.match(/(?:19|20)\d{2}/g);
  if (!yearMatches || !yearMatches.length) {
    return null;
  }

  const yearValue = Number(yearMatches[yearMatches.length - 1]);
  return Number.isInteger(yearValue) ? yearValue : null;
};

const normalizeYearList = (years) => {
  if (!Array.isArray(years)) {
    return [];
  }

  const unique = new Set();
  years.forEach((year) => {
    const numericYear = Number(year);
    if (Number.isInteger(numericYear) && numericYear > 1900 && numericYear < 3000) {
      unique.add(numericYear);
    }
  });

  return Array.from(unique).sort((a, b) => b - a);
};

const normalizeStatsYearsAccess = (statsYearsAccess) => {
  return normalizeYearList(statsYearsAccess);
};

const normalizePlayerRecord = (player, index) => ({
  id: typeof player.id === "string" && player.id.trim() ? player.id.trim() : `player-${index + 1}`,
  name: typeof player.name === "string" ? player.name : "",
  pin: sanitizePin(typeof player.pin === "string" ? player.pin : ""),
  appEnabled: Boolean(player.appEnabled),
  permissions: Array.isArray(player.permissions)
    ? player.permissions.filter((permission) =>
        AVAILABLE_PLAYER_TABS.some((availableTab) => availableTab.key === permission)
      )
    : [],
  statsYearsAccess: normalizeStatsYearsAccess(player.statsYearsAccess)
});

const getAllowedStatisticsYearsForPlayer = (player, availableYears) => {
  const sourceYears = normalizeYearList(availableYears);
  if (!player || !isPlayerAllowedForTab(player, "statsTab")) {
    return [];
  }

  const allowedYears = normalizeStatsYearsAccess(player.statsYearsAccess);
  if (!allowedYears.length) {
    return [];
  }

  const allowedSet = new Set(allowedYears);
  return sourceYears.filter((year) => allowedSet.has(year));
};

const loadSavedSelectedGamesYear = (storageKey = ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY) => {
  const rawValue = Number(localStorage.getItem(storageKey));
  return Number.isInteger(rawValue) && rawValue > 1900 && rawValue < 3000 ? rawValue : null;
};

const saveSelectedGamesYear = (year, storageKey = ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY) => {
  if (!Number.isInteger(year) || year < 1900 || year > 2999) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, String(year));
};

const initAdminPanelTabs = () => {
  const tabButtons = document.querySelectorAll(".admin-panel-tab");
  const tabPanels = document.querySelectorAll(".admin-panel-content");
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  const setActiveTab = (target) => {
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-target") === target);
    });
    tabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === target);
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.getAttribute("data-target"));
    });
  });
};

const initAdminPanelRefresh = () => {
  const refreshButton = document.querySelector("#adminPanelRefresh");
  const panelStatus = document.querySelector("#adminPanelRefreshStatus");
  if (!refreshButton) {
    return;
  }

  const setPanelStatus = (message) => {
    if (panelStatus) {
      panelStatus.textContent = message;
    }
  };

  refreshButton.addEventListener("click", async () => {
    const activePanel = document.querySelector(".admin-panel-content.is-active");
    const activeTabId = activePanel?.id;

    if (!activeTabId) {
      setPanelStatus("Nie udało się rozpoznać aktywnej zakładki.");
      return;
    }

    const refreshHandler = adminRefreshHandlers.get(activeTabId);
    if (!refreshHandler) {
      setPanelStatus("Ta zakładka nie ma danych do odświeżenia.");
      return;
    }

    setPanelStatus("Odświeżanie danych...");
    refreshButton.disabled = true;

    try {
      await refreshHandler();
      setPanelStatus("Dane zostały odświeżone.");
    } catch (error) {
      setPanelStatus("Nie udało się odświeżyć danych.");
    } finally {
      refreshButton.disabled = false;
    }
  });
};

const initAdminPlayers = () => {
  const body = document.querySelector("#adminPlayersBody");
  const status = document.querySelector("#adminPlayersStatus");
  const addButton = document.querySelector("#adminAddPlayer");
  const modal = document.querySelector("#playerPermissionsModal");
  const modalList = document.querySelector("#playerPermissionsList");
  const modalStatus = document.querySelector("#playerPermissionsStatus");
  const closeButton = document.querySelector("#playerPermissionsClose");
  const yearsModal = document.querySelector("#playerStatsYearsModal");
  const yearsModalList = document.querySelector("#playerStatsYearsList");
  const yearsModalStatus = document.querySelector("#playerStatsYearsStatus");
  const yearsModalCloseButton = document.querySelector("#playerStatsYearsClose");

  if (!body || !status || !addButton || !modal || !modalList || !modalStatus) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    addButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby zarządzać graczami.";
    return;
  }

  const db = firebaseApp.firestore();

  let availableStatisticsYears = [];

  const getPinOwnerId = (pin, excludedId) => {
    if (!pin) {
      return null;
    }
    const match = adminPlayersState.players.find((player) => player.pin === pin && player.id !== excludedId);
    return match ? match.id : null;
  };

  const rebuildPinMap = () => {
    const nextMap = new Map();
    adminPlayersState.players.forEach((player) => {
      if (isPinValid(player.pin) && !nextMap.has(player.pin)) {
        nextMap.set(player.pin, player);
      }
    });
    adminPlayersState.playerByPin = nextMap;
  };

  const refreshPlayersData = async () => {
    const snapshot = await db.collection(PLAYER_ACCESS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).get({
      source: "server"
    });
    const data = snapshot.data();
    const rawPlayers = Array.isArray(data?.players) ? data.players : [];
    adminPlayersState.players = rawPlayers.map(normalizePlayerRecord);
    rebuildPinMap();
    renderPlayers();
  };

  registerAdminRefreshHandler("adminPlayersTab", refreshPlayersData);

  const savePlayers = async () => {
    try {
      await db.collection(PLAYER_ACCESS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).set({
        players: adminPlayersState.players,
        updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
      status.textContent = "Lista graczy zapisana.";
    } catch (error) {
      status.textContent = "Nie udało się zapisać listy graczy.";
    }
  };

  const openModal = (playerId) => {
    adminPlayersState.editingPlayerId = playerId;
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    renderPermissions();
  };

  const closeModal = () => {
    closeYearsModal();
    adminPlayersState.editingPlayerId = null;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    modalStatus.textContent = "";
    document.body.classList.remove("modal-open");
  };

  const openYearsModal = () => {
    if (!yearsModal) {
      return;
    }
    yearsModal.classList.add("is-visible");
    yearsModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeYearsModal = () => {
    if (!yearsModal) {
      return;
    }
    yearsModal.classList.remove("is-visible");
    yearsModal.setAttribute("aria-hidden", "true");
    if (!modal.classList.contains("is-visible")) {
      document.body.classList.remove("modal-open");
    }
    if (yearsModalStatus) {
      yearsModalStatus.textContent = "";
    }
  };

  const updatePlayerField = (playerId, field, value) => {
    const player = adminPlayersState.players.find((entry) => entry.id === playerId);
    if (!player) {
      return;
    }

    if (field === "pin") {
      const pinValue = sanitizePin(value);
      if (isPinValid(pinValue) && getPinOwnerId(pinValue, playerId)) {
        status.textContent = "Ten PIN jest już przypisany do innego gracza.";
        return;
      }
      player.pin = pinValue;
      rebuildPinMap();
    } else {
      player[field] = value;
    }

    scheduleDebouncedUpdate(`players:${playerId}:${field}`, () => {
      void savePlayers();
    });
  };

  const generateUniquePlayerPin = (excludedId) => {
    const existingPins = new Set(
      adminPlayersState.players
        .filter((player) => player.id !== excludedId && isPinValid(player.pin))
        .map((player) => player.pin)
    );

    let candidate = generateRandomPin();
    while (existingPins.has(candidate)) {
      candidate = generateRandomPin();
    }
    return candidate;
  };

  const renderStatsYearsPermissions = () => {
    if (!yearsModalList || !yearsModalStatus) {
      return;
    }
    yearsModalList.innerHTML = "";
    const player = adminPlayersState.players.find((entry) => entry.id === adminPlayersState.editingPlayerId);
    if (!player) {
      yearsModalStatus.textContent = "Nie znaleziono gracza.";
      return;
    }

    if (!availableStatisticsYears.length) {
      yearsModalStatus.textContent = "Brak dostępnych lat statystyk. Dodaj gry, aby lata pojawiły się automatycznie.";
      return;
    }

    yearsModalStatus.textContent = "";
    const selectedSet = new Set(normalizeStatsYearsAccess(player.statsYearsAccess));
    availableStatisticsYears.forEach((year) => {
      const label = document.createElement("label");
      label.className = "permissions-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedSet.has(year);
      checkbox.addEventListener("change", () => {
        const nextSet = new Set(normalizeStatsYearsAccess(player.statsYearsAccess));
        if (checkbox.checked) {
          nextSet.add(year);
        } else {
          nextSet.delete(year);
        }
        player.statsYearsAccess = normalizeStatsYearsAccess(Array.from(nextSet));
        renderPermissions();
        void savePlayers();
      });

      const text = document.createElement("span");
      text.textContent = String(year);
      label.appendChild(checkbox);
      label.appendChild(text);
      yearsModalList.appendChild(label);
    });
  };

  const renderPermissions = () => {
    modalList.innerHTML = "";
    const player = adminPlayersState.players.find((entry) => entry.id === adminPlayersState.editingPlayerId);
    if (!player) {
      modalStatus.textContent = "Nie znaleziono gracza.";
      return;
    }

    AVAILABLE_PLAYER_TABS.forEach((tab) => {
      const label = document.createElement("label");
      label.className = "permissions-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = player.permissions.includes(tab.key);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          player.permissions = Array.from(new Set([...player.permissions, tab.key]));
        } else {
          player.permissions = player.permissions.filter((permission) => permission !== tab.key);
          if (tab.key === "statsTab") {
            player.statsYearsAccess = [];
            closeYearsModal();
          }
        }
        renderPlayers();
        renderPermissions();
        void savePlayers();
      });

      const text = document.createElement("span");
      text.textContent = tab.label;

      label.appendChild(checkbox);
      label.appendChild(text);

      if (tab.key === "statsTab") {
        const yearsButton = document.createElement("button");
        yearsButton.type = "button";
        yearsButton.className = "secondary permissions-years-button";
        yearsButton.textContent = "Lata";
        yearsButton.disabled = !checkbox.checked;
        yearsButton.addEventListener("click", () => {
          openYearsModal();
          renderStatsYearsPermissions();
        });
        label.appendChild(yearsButton);
      }

      modalList.appendChild(label);
    });
  };

  const renderPlayers = () => {
    const focusState = getFocusedAdminInputState(body);
    body.innerHTML = "";
    adminPlayersState.players.forEach((player) => {
      const row = document.createElement("tr");

      const appCell = document.createElement("td");
      appCell.className = "players-app-cell";
      const appCheckbox = document.createElement("input");
      appCheckbox.type = "checkbox";
      appCheckbox.className = "players-app-checkbox";
      appCheckbox.checked = Boolean(player.appEnabled);
      appCheckbox.setAttribute("aria-label", `Dostęp aplikacji dla gracza ${player.name || player.id}`);
      appCheckbox.addEventListener("change", () => {
        updatePlayerField(player.id, "appEnabled", appCheckbox.checked);
      });
      appCell.appendChild(appCheckbox);

      const nameCell = document.createElement("td");
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "admin-input";
      nameInput.dataset.focusTarget = "player-field";
      nameInput.dataset.section = "players";
      nameInput.dataset.rowId = player.id;
      nameInput.dataset.columnKey = "name";
      nameInput.placeholder = "Np. Jan Kowalski";
      nameInput.value = player.name;
      nameInput.addEventListener("input", () => {
        updatePlayerField(player.id, "name", nameInput.value);
      });
      nameCell.appendChild(nameInput);

      const pinCell = document.createElement("td");
      const pinControl = document.createElement("div");
      pinControl.className = "pin-control";
      const pinInput = document.createElement("input");
      pinInput.type = "tel";
      pinInput.className = "admin-input";
      pinInput.dataset.focusTarget = "player-field";
      pinInput.dataset.section = "players";
      pinInput.dataset.rowId = player.id;
      pinInput.dataset.columnKey = "pin";
      pinInput.inputMode = "numeric";
      pinInput.maxLength = PIN_LENGTH;
      pinInput.placeholder = "5 cyfr";
      pinInput.value = player.pin;
      pinInput.addEventListener("input", () => {
        const pinValue = sanitizePin(pinInput.value);
        pinInput.value = pinValue;

        if (pinValue.length > 0 && !isPinValid(pinValue)) {
          pinInput.setCustomValidity("PIN musi mieć dokładnie 5 cyfr.");
        } else {
          pinInput.setCustomValidity("");
        }

        const duplicateOwnerId = getPinOwnerId(pinValue, player.id);
        if (duplicateOwnerId) {
          pinInput.value = "";
          pinInput.setCustomValidity("PIN musi być unikalny.");
          pinInput.reportValidity();
          updatePlayerField(player.id, "pin", "");
          return;
        }

        if (isPinValid(pinValue)) {
          updatePlayerField(player.id, "pin", pinValue);
        } else if (!pinValue) {
          updatePlayerField(player.id, "pin", "");
        }
      });

      const pinRandomButton = document.createElement("button");
      pinRandomButton.type = "button";
      pinRandomButton.className = "secondary admin-pin-random";
      pinRandomButton.textContent = "Losuj";
      pinRandomButton.addEventListener("click", () => {
        const randomPin = generateUniquePlayerPin(player.id);
        pinInput.value = randomPin;
        pinInput.setCustomValidity("");
        updatePlayerField(player.id, "pin", randomPin);
      });

      pinControl.appendChild(pinInput);
      pinControl.appendChild(pinRandomButton);
      pinCell.appendChild(pinControl);

      const permissionsCell = document.createElement("td");
      const tags = document.createElement("div");
      tags.className = "permissions-tags";
      if (player.permissions.length) {
        player.permissions.forEach((permission) => {
          const tab = AVAILABLE_PLAYER_TABS.find((entry) => entry.key === permission);
          const badge = document.createElement("span");
          badge.className = "permission-badge";
          if (permission === "statsTab") {
            const yearsCount = normalizeStatsYearsAccess(player.statsYearsAccess).length;
            badge.textContent = `${tab ? tab.label : permission}${yearsCount ? ` (${yearsCount} lat)` : " (0 lat)"}`;
          } else {
            badge.textContent = tab ? tab.label : permission;
          }
          tags.appendChild(badge);
        });
      } else {
        const empty = document.createElement("span");
        empty.className = "permission-badge is-empty";
        empty.textContent = "Brak dodatkowych uprawnień";
        tags.appendChild(empty);
      }
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "secondary admin-permissions-edit";
      editButton.textContent = "Edytuj";
      editButton.addEventListener("click", () => {
        openModal(player.id);
      });
      permissionsCell.appendChild(tags);
      permissionsCell.appendChild(editButton);

      const actionsCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger admin-row-delete";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", async () => {
        adminPlayersState.players = adminPlayersState.players.filter((entry) => entry.id !== player.id);
        rebuildPinMap();
        renderPlayers();
        await savePlayers();
      });
      actionsCell.appendChild(deleteButton);

      row.appendChild(appCell);
      row.appendChild(nameCell);
      row.appendChild(pinCell);
      row.appendChild(permissionsCell);
      row.appendChild(actionsCell);
      body.appendChild(row);
    });

    restoreFocusedAdminInputState(body, focusState);
  };

  addButton.addEventListener("click", async () => {
    adminPlayersState.players.push({
      id: `player-${Date.now()}`,
      name: "",
      pin: "",
      appEnabled: false,
      permissions: [],
      statsYearsAccess: []
    });
    renderPlayers();
    await savePlayers();
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  db.collection(PLAYER_ACCESS_COLLECTION)
    .doc(PLAYER_ACCESS_DOCUMENT)
    .onSnapshot(
      (snapshot) => {
        const data = snapshot.data();
        const rawPlayers = Array.isArray(data?.players) ? data.players : [];
        adminPlayersState.players = rawPlayers.map(normalizePlayerRecord);
        rebuildPinMap();
        renderPlayers();
        synchronizeStatisticsAccessState();
        window.dispatchEvent(new CustomEvent("statistics-access-updated"));
      },
      () => {
        status.textContent = "Nie udało się pobrać listy graczy.";
      }
    );

  const gamesCollectionName = getGamesCollectionName();
  db.collection(gamesCollectionName).orderBy("createdAt", "asc").onSnapshot((snapshot) => {
    const years = normalizeYearList(
      snapshot.docs
        .map((doc) => extractYearFromDate(doc.data()?.gameDate))
        .filter((year) => Number.isInteger(year))
    );
    availableStatisticsYears = years;
    if (yearsModal?.classList.contains("is-visible")) {
      renderStatsYearsPermissions();
    }
  });

  if (yearsModalCloseButton) {
    yearsModalCloseButton.addEventListener("click", closeYearsModal);
  }

  yearsModal?.addEventListener("click", (event) => {
    if (event.target === yearsModal) {
      closeYearsModal();
    }
  });
};

const initAdminMessaging = () => {
  const input = document.querySelector("#adminMessageInput");
  const sendButton = document.querySelector("#adminMessageSend");
  const status = document.querySelector("#adminMessageStatus");

  if (!input || !sendButton || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    sendButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby wysyłać wiadomości.";
    return;
  }

  const db = firebaseApp.firestore();

  const refreshNewsData = async () => {
    await db
      .collection("admin_messages")
      .orderBy("createdAt", "desc")
      .limit(1)
      .get({ source: "server" });
  };

  registerAdminRefreshHandler("adminNewsTab", refreshNewsData);

  sendButton.addEventListener("click", async () => {
    const message = input.value.trim();

    if (!message) {
      status.textContent = "Wpisz treść wiadomości przed wysłaniem.";
      return;
    }

    sendButton.disabled = true;
    status.textContent = "Wysyłanie wiadomości...";

    try {
      await db.collection("admin_messages").add({
        message,
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        source: "web-admin"
      });
      input.value = "";
      status.textContent = "Wiadomość wysłana do graczy.";
    } catch (error) {
      status.textContent = "Nie udało się wysłać wiadomości. Sprawdź konfigurację.";
    } finally {
      sendButton.disabled = false;
    }
  });
};

const initAdminChat = () => {
  const list = document.querySelector("#adminChatList");
  const cleanupButton = document.querySelector("#adminChatCleanup");
  const status = document.querySelector("#adminChatStatus");

  if (!list || !cleanupButton || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    cleanupButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby moderować czat.";
    return;
  }

  const db = firebaseApp.firestore();

  const renderAdminMessages = (documents) => {
    list.innerHTML = "";
    if (!documents.length) {
      const empty = document.createElement("p");
      empty.className = "chat-empty";
      empty.textContent = "Brak wiadomości czatu do moderacji.";
      list.appendChild(empty);
      return;
    }

    documents.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("article");
      row.className = "admin-chat-item";

      const meta = document.createElement("div");
      meta.className = "admin-chat-meta";
      meta.textContent = `${typeof data.authorName === "string" ? data.authorName : "Gracz"} • ${formatChatTimestamp(data.createdAt)}`;

      const text = document.createElement("p");
      text.className = "admin-chat-text";
      text.textContent = typeof data.text === "string" ? data.text : "";

      const actions = document.createElement("div");
      actions.className = "admin-chat-item-actions";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger admin-chat-delete";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", async () => {
        deleteButton.disabled = true;
        status.textContent = "Usuwanie wiadomości...";
        try {
          await db.collection(CHAT_COLLECTION).doc(doc.id).delete();
          status.textContent = "Wiadomość usunięta.";
        } catch (error) {
          deleteButton.disabled = false;
          status.textContent = "Nie udało się usunąć wiadomości.";
        }
      });

      actions.appendChild(deleteButton);
      row.appendChild(meta);
      row.appendChild(text);
      row.appendChild(actions);
      list.appendChild(row);
    });
  };

  const refreshChatData = async () => {
    await db.collection(CHAT_COLLECTION).orderBy("createdAt", "desc").limit(200).get({ source: "server" });
  };

  registerAdminRefreshHandler("adminChatTab", refreshChatData);

  if (typeof chatState.adminUnsubscribe === "function") {
    chatState.adminUnsubscribe();
  }

  chatState.adminUnsubscribe = db.collection(CHAT_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .onSnapshot(
      (snapshot) => {
        renderAdminMessages(snapshot.docs);
      },
      () => {
        status.textContent = "Nie udało się pobrać wiadomości czatu.";
      }
    );

  cleanupButton.addEventListener("click", async () => {
    cleanupButton.disabled = true;
    status.textContent = "Czyszczenie wiadomości starszych niż 30 dni...";

    let deletedCount = 0;
    try {
      const now = firebaseApp.firestore.Timestamp.now();
      while (true) {
        const expiredSnapshot = await db.collection(CHAT_COLLECTION)
          .where("expireAt", "<=", now)
          .limit(200)
          .get();

        if (expiredSnapshot.empty) {
          break;
        }

        const batch = db.batch();
        expiredSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        deletedCount += expiredSnapshot.size;
      }
      status.textContent = `Usunięto ${deletedCount} wiadomości starszych niż 30 dni.`;
    } catch (error) {
      status.textContent = "Nie udało się wyczyścić starych wiadomości.";
    } finally {
      cleanupButton.disabled = false;
    }
  });
};

const initStatisticsView = ({
  yearsListSelector,
  statsBodySelector,
  playersStatsBodySelector,
  statusSelector,
  exportButtonSelector,
  selectedYearStorageKey,
  isAdminView,
  yearButtonsClassName,
  weightButtonsSelector
}) => {
  const yearsList = document.querySelector(yearsListSelector);
  const statsBody = document.querySelector(statsBodySelector);
  const playersStatsBody = document.querySelector(playersStatsBodySelector);
  const status = document.querySelector(statusSelector);
  const exportButton = document.querySelector(exportButtonSelector);
  const firebaseApp = getFirebaseApp();

  if (!yearsList || !statsBody || !playersStatsBody || !status || !exportButton) {
    return;
  }

  if (!firebaseApp) {
    status.textContent = "Uzupełnij konfigurację Firebase, aby wyświetlać statystyki.";
    exportButton.disabled = true;
    return;
  }

  const db = firebaseApp.firestore();
  const gamesCollectionName = getGamesCollectionName();
  const gameDetailsCollectionName = getGameDetailsCollectionName();
  const manualStatsFields = ["weight1", "weight2", "weight3", "weight4", "weight5", "weight6", "weight7"];
  const weightStatsFields = ["weight1", "weight2", "weight3", "weight4", "weight5", "weight6", "weight7"];
  const state = {
    years: [],
    selectedYear: loadSavedSelectedGamesYear(selectedYearStorageKey),
    games: [],
    detailsByGame: new Map(),
    detailUnsubscribers: new Map(),
    manualStatsByYear: new Map(),
    visibleColumnsByYear: new Map()
  };
  const playersStatsHeaderCells = playersStatsBody.closest("table")?.querySelectorAll("thead th") ?? [];
  const adminColumnVisibilityCheckboxes = new Map();

  const getDefaultManualFieldValue = (field, value) => {
    if (weightStatsFields.includes(field)) {
      const normalized = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
      return normalized ? normalized : "1";
    }
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  };

  const getVisibleColumnsForYear = (year) => {
    const yearKey = String(year ?? "");
    const stored = state.visibleColumnsByYear.get(yearKey);
    if (!Array.isArray(stored)) {
      return DEFAULT_VISIBLE_STATS_COLUMNS;
    }
    const available = new Set(STATS_COLUMN_CONFIG.map((column) => column.key));
    return stored.filter((key) => available.has(key));
  };

  const persistYearConfig = (year) => {
    if (!Number.isInteger(year)) {
      return Promise.resolve();
    }

    const yearKey = String(year);
    const rows = Array.from((state.manualStatsByYear.get(yearKey) ?? new Map()).values());
    const serializedRows = rows
      .map((entry) => ({
        playerName: entry.playerName,
        weight1: getDefaultManualFieldValue("weight1", entry.weight1),
        weight2: getDefaultManualFieldValue("weight2", entry.weight2),
        points: entry.points ?? "",
        weight3: getDefaultManualFieldValue("weight3", entry.weight3),
        weight4: getDefaultManualFieldValue("weight4", entry.weight4),
        weight5: getDefaultManualFieldValue("weight5", entry.weight5),
        weight6: getDefaultManualFieldValue("weight6", entry.weight6),
        weight7: getDefaultManualFieldValue("weight7", entry.weight7)
      }))
      .sort((a, b) => a.playerName.localeCompare(b.playerName, "pl"));

    return db.collection(ADMIN_GAMES_STATS_COLLECTION).doc(yearKey).set({
      rows: serializedRows,
      visibleColumns: getVisibleColumnsForYear(year)
    }, { merge: true });
  };

  const getGamesForSelectedYear = () => {
    if (!state.selectedYear) {
      return [];
    }

    return state.games
      .filter((game) => extractYearFromDate(game.gameDate) === state.selectedYear)
      .sort(compareByGameDateAsc);
  };

  const getDetailRows = (gameId) => {
    const rows = state.detailsByGame.get(gameId) ?? [];
    return rows.map((row) => {
      const entryFee = parseIntegerOrZero(row.entryFee);
      const rebuy = parseIntegerOrZero(row.rebuy);
      const payout = parseIntegerOrZero(row.payout);
      const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
      return {
        ...row,
        entryFee,
        rebuy,
        payout,
        profit: payout - (entryFee + rebuy),
        hasCompletedEntryFee: Boolean(normalizedEntryFee) && normalizedEntryFee !== "-",
        championship: Boolean(row.championship)
      };
    });
  };

  const hasIncludedSummaryOrStatsData = (row) => {
    const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
    const normalizedPoints = sanitizeIntegerInput(typeof row.points === "number" ? `${row.points}` : row.points ?? "");
    const hasEntryFee = Boolean(normalizedEntryFee) && normalizedEntryFee !== "-" && parseIntegerOrZero(normalizedEntryFee) > 0;
    const hasPoints = Boolean(normalizedPoints) && normalizedPoints !== "-";
    return hasEntryFee || hasPoints;
  };

  const getPlayersStatistics = () => {
    const games = getGamesForSelectedYear();
    const gameCount = games.length;
    const totalPool = games.reduce((sum, game) => sum + getDetailRows(game.id)
      .filter((row) => hasIncludedSummaryOrStatsData(row))
      .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0), 0);
    const playersMap = new Map();

    games.forEach((game) => {
      const rows = getDetailRows(game.id);
      const gamePool = rows
        .filter((row) => hasIncludedSummaryOrStatsData(row))
        .reduce((acc, row) => acc + row.entryFee + row.rebuy, 0);
      const counted = new Set();

      rows.forEach((row) => {
        const playerName = typeof row.playerName === "string" ? row.playerName.trim() : "";
        if (!playerName || !hasIncludedSummaryOrStatsData(row)) {
          return;
        }

        const hasCompletedEntryFee = row.hasCompletedEntryFee === true;

        if (!playersMap.has(playerName)) {
          playersMap.set(playerName, {
            playerName,
            championshipCount: 0,
            meetingsCount: 0,
            pointsSum: 0,
            plusMinusSum: 0,
            payoutSum: 0,
            depositsSum: 0,
            playedGamesPoolSum: 0
          });
        }

        const item = playersMap.get(playerName);
        if (hasCompletedEntryFee) {
          item.meetingsCount += 1;
        }
        item.championshipCount += row.championship ? 1 : 0;
        item.pointsSum += parseIntegerOrZero(row.points);
        item.plusMinusSum += row.profit;
        item.payoutSum += row.payout;
        item.depositsSum += row.entryFee + row.rebuy;

        if (hasCompletedEntryFee && !counted.has(playerName)) {
          item.playedGamesPoolSum += gamePool;
          counted.add(playerName);
        }
      });
    });

    return {
      gameCount,
      totalPool,
      playerRows: Array.from(playersMap.values())
        .map((row) => ({
          ...row,
          participationPercent: gameCount === 0 ? 0 : Math.ceil((row.meetingsCount / gameCount) * 100),
          percentAllGames: row.playedGamesPoolSum === 0 ? 0 : Math.ceil((row.payoutSum / row.playedGamesPoolSum) * 100),
          percentPlayedGames: totalPool === 0 ? 0 : Math.ceil((row.payoutSum / totalPool) * 100)
        }))
        .sort(comparePlayerStatsByPlusMinusDesc)
    };
  };

  const getComputedResultValue = (row, manualEntry = {}) => {
    const weight1 = parseIntegerOrZero(getDefaultManualFieldValue("weight1", manualEntry.weight1));
    const weight2 = parseIntegerOrZero(getDefaultManualFieldValue("weight2", manualEntry.weight2));
    const weight3 = parseIntegerOrZero(getDefaultManualFieldValue("weight3", manualEntry.weight3));
    const weight4 = parseIntegerOrZero(getDefaultManualFieldValue("weight4", manualEntry.weight4));
    const weight5 = parseIntegerOrZero(getDefaultManualFieldValue("weight5", manualEntry.weight5));
    const weight6 = parseIntegerOrZero(getDefaultManualFieldValue("weight6", manualEntry.weight6));
    const weight7 = parseIntegerOrZero(getDefaultManualFieldValue("weight7", manualEntry.weight7));

    return (row.championshipCount * weight1)
      + (row.participationPercent * weight2)
      + (row.pointsSum * weight3)
      + (row.plusMinusSum * weight4)
      + (row.payoutSum * weight5)
      + (row.depositsSum * weight6)
      + (row.percentAllGames * weight7);
  };

  const getCurrentVisibleYears = () => {
    const availableYears = normalizeYearList(
      state.games
        .map((game) => extractYearFromDate(game.gameDate))
        .filter((year) => Number.isInteger(year))
    );

    if (isAdminView) {
      return availableYears;
    }

    const verifiedPlayer = getStatisticsVerifiedPlayer();
    return getAllowedStatisticsYearsForPlayer(verifiedPlayer, availableYears);
  };

  const renderYears = () => {
    yearsList.innerHTML = "";
    if (!state.years.length) {
      const info = document.createElement("p");
      info.className = "status-text";
      if (isAdminView) {
        info.textContent = "Brak lat. Dodaj pierwszą grę, aby rok pojawił się automatycznie.";
      } else {
        const verifiedPlayer = getStatisticsVerifiedPlayer();
        const baseYears = normalizeYearList(
          state.games
            .map((game) => extractYearFromDate(game.gameDate))
            .filter((year) => Number.isInteger(year))
        );
        const hasAssignedYears = normalizeStatsYearsAccess(verifiedPlayer?.statsYearsAccess).length > 0;
        info.textContent = baseYears.length && !hasAssignedYears
          ? "Brak przypisanych lat do podglądu statystyk."
          : "Brak dostępnych lat statystyk dla Twojego konta.";
      }
      yearsList.appendChild(info);
      return;
    }

    state.years.forEach((year) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${yearButtonsClassName} ${state.selectedYear === year ? "is-active" : ""}`.trim();
      button.textContent = String(year);
      button.addEventListener("click", () => {
        state.selectedYear = year;
        saveSelectedGamesYear(year, selectedYearStorageKey);
        renderYears();
        renderStats();
      });
      yearsList.appendChild(button);
    });
  };

  const renderStats = () => {
    statsBody.innerHTML = "";
    playersStatsBody.innerHTML = "";

    if (!state.selectedYear) {
      if (!isAdminView) {
        const verifiedPlayer = getStatisticsVerifiedPlayer();
        const hasAssignedYears = normalizeStatsYearsAccess(verifiedPlayer?.statsYearsAccess).length > 0;
        status.textContent = hasAssignedYears
          ? "Brak dostępnych lat statystyk dla Twojego konta."
          : "Brak przypisanych lat do podglądu statystyk.";
      } else {
        status.textContent = "Wybierz rok z panelu po lewej stronie.";
      }
      return;
    }

    const statistics = getPlayersStatistics();
    const visibleColumns = isAdminView ? STATS_COLUMN_CONFIG.map((entry) => entry.key) : getVisibleColumnsForYear(state.selectedYear);

    if (isAdminView) {
      const visibleInSelectedYear = getVisibleColumnsForYear(state.selectedYear);
      STATS_COLUMN_CONFIG.forEach((column) => {
        const checkbox = adminColumnVisibilityCheckboxes.get(column.key);
        if (checkbox) {
          checkbox.checked = visibleInSelectedYear.includes(column.key);
        }
      });
    }

    if (!isAdminView) {
      playersStatsHeaderCells.forEach((cell, index) => {
        const column = STATS_COLUMN_CONFIG[index];
        if (!column) {
          return;
        }
        cell.style.display = visibleColumns.includes(column.key) ? "" : "none";
      });
    }

    status.textContent = `Wybrany rok: ${state.selectedYear}. Liczba gier: ${statistics.gameCount}.`;
    [["Liczba gier", statistics.gameCount], ["Łączna pula", statistics.totalPool]].forEach(([label, value]) => {
      const tr = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = String(label);
      const valueCell = document.createElement("td");
      valueCell.textContent = String(value);
      tr.append(labelCell, valueCell);
      statsBody.appendChild(tr);
    });

    if (!statistics.playerRows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = visibleColumns.length || STATS_COLUMN_CONFIG.length;
      td.textContent = "Brak graczy z uzupełnionym wpisowym w wybranym roku.";
      tr.appendChild(td);
      playersStatsBody.appendChild(tr);
      return;
    }

    const yearKey = String(state.selectedYear);
    if (!state.manualStatsByYear.has(yearKey)) {
      state.manualStatsByYear.set(yearKey, new Map());
    }
    const yearMap = state.manualStatsByYear.get(yearKey);

    if (isAdminView) {
      const activeVisibleColumns = new Set(getVisibleColumnsForYear(state.selectedYear));
      const headerCheckboxes = playersStatsBody.closest("table")?.querySelectorAll(".stats-column-visibility-checkbox") ?? [];
      headerCheckboxes.forEach((checkbox, index) => {
        const column = STATS_COLUMN_CONFIG[index];
        if (!column) {
          return;
        }
        checkbox.checked = activeVisibleColumns.has(column.key);
      });
    }

    statistics.playerRows.forEach((row) => {
      const tr = document.createElement("tr");
      const manualEntry = yearMap.get(row.playerName) ?? {};

      STATS_COLUMN_CONFIG.forEach((column) => {
        if (!visibleColumns.includes(column.key)) {
          return;
        }

        const td = document.createElement("td");
        if (column.editable && isAdminView) {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "admin-input";
          input.value = String(column.value(row, manualEntry, getDefaultManualFieldValue, getComputedResultValue));
          input.addEventListener("input", () => {
            input.value = sanitizeIntegerInput(input.value);
            if (!yearMap.has(row.playerName)) {
              yearMap.set(row.playerName, { playerName: row.playerName });
            }
            const playerEntry = yearMap.get(row.playerName);
            manualStatsFields.forEach((field) => {
              if (playerEntry[field] == null) {
                playerEntry[field] = getDefaultManualFieldValue(field, "");
              }
            });
            playerEntry[column.key] = input.value;
            scheduleDebouncedUpdate(`stats-shared-${yearKey}-${row.playerName}-${column.key}`, () => persistYearConfig(state.selectedYear));
            renderStats();
          });
          td.appendChild(input);
        } else {
          td.textContent = String(column.value(row, manualEntry, getDefaultManualFieldValue, getComputedResultValue));
        }
        tr.appendChild(td);
      });

      playersStatsBody.appendChild(tr);
    });
  };

  const synchronizeYears = () => {
    state.years = getCurrentVisibleYears();
    if (!state.selectedYear || !state.years.includes(state.selectedYear)) {
      state.selectedYear = state.years[0] ?? null;
    }
    saveSelectedGamesYear(state.selectedYear, selectedYearStorageKey);
    renderYears();
    renderStats();
  };

  db.collection(ADMIN_GAMES_STATS_COLLECTION).onSnapshot((snapshot) => {
    state.manualStatsByYear.clear();
    state.visibleColumnsByYear.clear();
    const missingVisibilityConfigYears = [];

    snapshot.forEach((doc) => {
      const yearKey = String(doc.id);
      const data = doc.data() ?? {};
      const rows = Array.isArray(data.rows) ? data.rows : [];
      const hasVisibleColumns = Array.isArray(data.visibleColumns);
      const visibleColumns = hasVisibleColumns ? data.visibleColumns : DEFAULT_VISIBLE_STATS_COLUMNS;

      if (!hasVisibleColumns) {
        missingVisibilityConfigYears.push(yearKey);
      }

      state.visibleColumnsByYear.set(yearKey, visibleColumns);
      const yearMap = new Map();
      rows.forEach((entry) => {
        const playerName = typeof entry?.playerName === "string" ? entry.playerName.trim() : "";
        if (!playerName) {
          return;
        }
        const parsed = { playerName };
        manualStatsFields.forEach((field) => {
          parsed[field] = getDefaultManualFieldValue(field, entry[field]);
        });
        yearMap.set(playerName, parsed);
      });
      state.manualStatsByYear.set(yearKey, yearMap);
    });

    if (missingVisibilityConfigYears.length) {
      Promise.allSettled(missingVisibilityConfigYears.map((yearKey) => db.collection(ADMIN_GAMES_STATS_COLLECTION).doc(yearKey).set({
        visibleColumns: DEFAULT_VISIBLE_STATS_COLUMNS
      }, { merge: true }))).then((results) => {
        const hasRejected = results.some((result) => result.status === "rejected");
        if (hasRejected) {
          status.textContent = "Nie udało się zapisać domyślnej konfiguracji kolumn dla części lat.";
        }
      });
    }

    renderStats();
  });

  db.collection(gamesCollectionName).orderBy("createdAt", "asc").onSnapshot((snapshot) => {
    state.games = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    state.games.forEach((game) => {
      void clearLegacyNotesField({ firebaseApp, db, collectionName: gamesCollectionName, game });
    });
    const activeIds = new Set(state.games.map((game) => game.id));

    state.detailUnsubscribers.forEach((unsubscribe, gameId) => {
      if (!activeIds.has(gameId)) {
        unsubscribe();
        state.detailUnsubscribers.delete(gameId);
        state.detailsByGame.delete(gameId);
      }
    });

    state.games.forEach((game) => {
      if (state.detailUnsubscribers.has(game.id)) {
        return;
      }
      const unsubscribe = db.collection(gamesCollectionName).doc(game.id).collection(gameDetailsCollectionName).orderBy("createdAt", "asc").onSnapshot((rowsSnapshot) => {
        state.detailsByGame.set(game.id, rowsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        renderStats();
      });
      state.detailUnsubscribers.set(game.id, unsubscribe);
    });

    synchronizeYears();
  });

  if (isAdminView) {
    const headerCells = playersStatsBody.closest("table")?.querySelectorAll("thead th") ?? [];
    headerCells.forEach((cell, index) => {
      const column = STATS_COLUMN_CONFIG[index];
      if (!column) {
        return;
      }
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "stats-column-visibility-checkbox";
      checkbox.checked = getVisibleColumnsForYear(state.selectedYear).includes(column.key);
      adminColumnVisibilityCheckboxes.set(column.key, checkbox);
      checkbox.addEventListener("change", () => {
        if (!state.selectedYear) {
          return;
        }
        const yearKey = String(state.selectedYear);
        const visible = new Set(getVisibleColumnsForYear(state.selectedYear));
        if (checkbox.checked) {
          visible.add(column.key);
        } else {
          visible.delete(column.key);
        }
        state.visibleColumnsByYear.set(yearKey, STATS_COLUMN_CONFIG.map((entry) => entry.key).filter((key) => visible.has(key)));
        renderStats();
        void persistYearConfig(state.selectedYear).catch(() => {
          status.textContent = "Nie udało się zapisać widoczności kolumn. Spróbuj ponownie.";
        });
      });
      const wrapper = document.createElement("div");
      wrapper.className = "stats-column-header";
      while (cell.firstChild) {
        wrapper.appendChild(cell.firstChild);
      }
      wrapper.appendChild(checkbox);
      cell.appendChild(wrapper);
    });

    const weightButtons = document.querySelectorAll(weightButtonsSelector);
    weightButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const weightKey = button.dataset.weightKey;
        const promptValue = window.prompt(`Podaj wartość liczbową dla kolumny ${button.textContent}.`, "1");
        if (!weightStatsFields.includes(weightKey) || promptValue === null || !state.selectedYear) {
          return;
        }
        const normalized = sanitizeIntegerInput(promptValue);
        if (!normalized || normalized === "-") {
          status.textContent = "Podaj poprawną wartość liczbową dla wagi.";
          return;
        }
        const statistics = getPlayersStatistics();
        const yearKey = String(state.selectedYear);
        if (!state.manualStatsByYear.has(yearKey)) {
          state.manualStatsByYear.set(yearKey, new Map());
        }
        const yearMap = state.manualStatsByYear.get(yearKey);
        statistics.playerRows.forEach((row) => {
          if (!yearMap.has(row.playerName)) {
            yearMap.set(row.playerName, { playerName: row.playerName });
          }
          const playerEntry = yearMap.get(row.playerName);
          manualStatsFields.forEach((field) => {
            if (playerEntry[field] == null) {
              playerEntry[field] = getDefaultManualFieldValue(field, "");
            }
          });
          playerEntry[weightKey] = normalized;
        });
        renderStats();
        void persistYearConfig(state.selectedYear);
      });
    });
  }


  if (!isAdminView) {
    window.addEventListener("statistics-access-updated", () => {
      synchronizeYears();
    });
  }

  exportButton.addEventListener("click", () => {
    if (!window.XLSX || !state.selectedYear) {
      status.textContent = "Eksport XLSX jest chwilowo niedostępny.";
      return;
    }

    const statistics = getPlayersStatistics();
    const yearKey = String(state.selectedYear);
    const yearMap = state.manualStatsByYear.get(yearKey) ?? new Map();
    const visibleColumns = isAdminView ? STATS_COLUMN_CONFIG.map((column) => column.key) : getVisibleColumnsForYear(state.selectedYear);
    const headers = STATS_COLUMN_CONFIG.filter((column) => visibleColumns.includes(column.key)).map((column) => column.label);
    const dataRows = statistics.playerRows.map((row) => {
      const manualEntry = yearMap.get(row.playerName) ?? {};
      return STATS_COLUMN_CONFIG
        .filter((column) => visibleColumns.includes(column.key))
        .map((column) => column.value(row, manualEntry, getDefaultManualFieldValue, getComputedResultValue));
    });

    const worksheet = window.XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Statystyki");

    const now = new Date();
    const hour = `${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const fileName = `${hour}_${date}_Statystyki_${state.selectedYear}.xlsx`;
    window.XLSX.writeFile(workbook, fileName);
  });
};

const initStatisticsViews = () => {
  registerAdminRefreshHandler("adminStatisticsTab", async () => {});

  initStatisticsView({
    yearsListSelector: "#adminStatisticsYearsList",
    statsBodySelector: "#adminStatisticsStatsBody",
    playersStatsBodySelector: "#adminStatisticsPlayersStatsBody",
    statusSelector: "#adminStatisticsStatus",
    exportButtonSelector: "#adminStatisticsExport",
    selectedYearStorageKey: ADMIN_STATISTICS_SELECTED_YEAR_STORAGE_KEY,
    isAdminView: true,
    yearButtonsClassName: "admin-games-year-button",
    weightButtonsSelector: ".admin-statistics-weight-bulk-button"
  });

  initStatisticsView({
    yearsListSelector: "#statisticsYearsList",
    statsBodySelector: "#statisticsStatsBody",
    playersStatsBodySelector: "#statisticsPlayersStatsBody",
    statusSelector: "#statisticsStatus",
    exportButtonSelector: "#statisticsExport",
    selectedYearStorageKey: USER_STATISTICS_SELECTED_YEAR_STORAGE_KEY,
    isAdminView: false,
    yearButtonsClassName: "admin-games-year-button",
    weightButtonsSelector: ""
  });
};

const initAdminGames = () => {
  const yearsList = document.querySelector("#adminGamesYearsList");
  const addGameButton = document.querySelector("#adminGamesAddGame");
  const gamesTableBody = document.querySelector("#adminGamesTableBody");
  const summariesContainer = document.querySelector("#adminGamesSummaries");
  const statsBody = document.querySelector("#adminGamesStatsBody");
  const playersStatsBody = document.querySelector("#adminGamesPlayersStatsBody");
  const rankingBody = document.querySelector("#adminGamesRankingBody");
  const status = document.querySelector("#adminGamesStatus");
  const modal = document.querySelector("#gameDetailsModal");
  const modalMeta = document.querySelector("#gameDetailsMeta");
  const modalBody = document.querySelector("#gameDetailsBody");
  const modalClose = document.querySelector("#gameDetailsClose");
  const modalAddRowButton = document.querySelector("#gameDetailsAddRow");
  const modalEntryFeeBulkButton = document.querySelector("#gameDetailsModal .game-entry-fee-bulk-button");

  if (!yearsList || !gamesTableBody || !summariesContainer || !statsBody || !playersStatsBody || !rankingBody || !status || !addGameButton) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    status.textContent = "Uzupełnij konfigurację Firebase, aby zarządzać grami.";
    addGameButton.disabled = true;
    return;
  }

  const db = firebaseApp.firestore();
  const gamesCollectionName = getGamesCollectionName();
  const gameDetailsCollectionName = getGameDetailsCollectionName();
  const manualStatsFields = ["weight1", "weight2", "weight3", "weight4", "weight5", "weight6", "weight7"];
  const weightStatsFields = ["weight1", "weight2", "weight3", "weight4", "weight5", "weight6", "weight7"];
  const adminGamesPlayersStatsTable = playersStatsBody.closest("table");
  const weightHeaderButtons = Array.from(adminGamesPlayersStatsTable?.querySelectorAll(".admin-weight-bulk-button") ?? []);

  const state = {
    years: [],
    selectedYear: loadSavedSelectedGamesYear(),
    games: [],
    detailsByGame: new Map(),
    detailsUnsubscribers: new Map(),
    activeGameIdInModal: null,
    playerOptions: [],
    manualStatsByYear: new Map()
  };

  const summaryNotesModal = getSummaryNotesModalController();

  const closeModal = () => {
    if (!modal) {
      return;
    }
    state.activeGameIdInModal = null;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const getGamesForSelectedYear = () => {
    if (!state.selectedYear) {
      return [];
    }
    return state.games
      .filter((game) => extractYearFromDate(game.gameDate) === state.selectedYear)
      .sort(compareByGameDateAsc);
  };

  const syncYearsAfterLocalGameUpdate = (gameId, nextValues) => {
    const targetGame = state.games.find((game) => game.id === gameId);
    if (!targetGame) {
      return;
    }
    Object.assign(targetGame, nextValues);
    synchronizeYearsFromGames();
  };

  const getDetailRows = (gameId) => {
    const rows = state.detailsByGame.get(gameId) ?? [];
    return rows.map((row) => {
      const entryFee = parseIntegerOrZero(row.entryFee);
      const rebuy = parseIntegerOrZero(row.rebuy);
      const payout = parseIntegerOrZero(row.payout);
      const profit = payout - (entryFee + rebuy);
      const normalizedEntryFee = sanitizeIntegerInput(typeof row.entryFee === "number" ? `${row.entryFee}` : row.entryFee ?? "");
      return {
        ...row,
        entryFee,
        rebuy,
        payout,
        profit,
        hasCompletedEntryFee: Boolean(normalizedEntryFee) && normalizedEntryFee !== "-",
        points: parseIntegerOrZero(row.points),
        championship: Boolean(row.championship)
      };
    });
  };

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
    const payoutSum = rows.reduce((sum, row) => sum + row.payout, 0);
    const sortedRows = [...rows].sort((a, b) => b.profit - a.profit);

    return {
      pool,
      payoutSum,
      hasPayoutMismatch: payoutSum !== pool,
      rows: sortedRows.map((row) => ({
        ...row,
        poolSharePercent: pool === 0 ? 0 : Math.round((row.payout / pool) * 100)
      }))
    };
  };

  const getManualStatsForYear = (year) => {
    const yearKey = String(year ?? "");
    return state.manualStatsByYear.get(yearKey) ?? new Map();
  };

  const getDefaultManualFieldValue = (field, value) => {
    if (weightStatsFields.includes(field)) {
      const normalized = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
      return normalized ? normalized : "1";
    }
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  };

  const serializeManualStats = (year) => {
    const yearStats = getManualStatsForYear(year);
    return Array.from(yearStats.values())
      .map((entry) => ({
        playerName: entry.playerName,
        weight1: getDefaultManualFieldValue("weight1", entry.weight1),
        weight2: getDefaultManualFieldValue("weight2", entry.weight2),
        points: entry.points ?? "",
        weight3: getDefaultManualFieldValue("weight3", entry.weight3),
        weight4: getDefaultManualFieldValue("weight4", entry.weight4),
        weight5: getDefaultManualFieldValue("weight5", entry.weight5),
        weight6: getDefaultManualFieldValue("weight6", entry.weight6),
        weight7: getDefaultManualFieldValue("weight7", entry.weight7)
      }))
      .sort((a, b) => a.playerName.localeCompare(b.playerName, "pl"));
  };

  const ensureYearMapEntry = (yearMap, playerName) => {
    if (!yearMap.has(playerName)) {
      const emptyRow = { playerName };
      manualStatsFields.forEach((field) => {
        emptyRow[field] = getDefaultManualFieldValue(field, "");
      });
      yearMap.set(playerName, emptyRow);
    }
    return yearMap.get(playerName);
  };

  const applyBulkWeightValue = async (weightKey, nextValue) => {
    if (!state.selectedYear) {
      status.textContent = "Wybierz rok, aby ustawić wagę.";
      return;
    }

    const statistics = getPlayersStatistics();
    if (!statistics.playerRows.length) {
      status.textContent = "Brak graczy w wybranym roku do aktualizacji wag.";
      return;
    }

    const yearKey = String(state.selectedYear);
    if (!state.manualStatsByYear.has(yearKey)) {
      state.manualStatsByYear.set(yearKey, new Map());
    }
    const yearMap = state.manualStatsByYear.get(yearKey);
    statistics.playerRows.forEach((row) => {
      const playerEntry = ensureYearMapEntry(yearMap, row.playerName);
      playerEntry[weightKey] = nextValue;
    });

    renderStatsTable();
    await persistManualStats(state.selectedYear);
    status.textContent = `Zaktualizowano ${weightKey.toUpperCase()} dla ${statistics.playerRows.length} graczy.`;
  };

  const persistManualStats = (year) => {
    if (!year) {
      return Promise.resolve();
    }
    return db.collection(ADMIN_GAMES_STATS_COLLECTION).doc(String(year)).set({ rows: serializeManualStats(year) }, { merge: true });
  };

  const getPlayersStatistics = () => {
    const games = getGamesForSelectedYear();
    const gameCount = games.length;
    const totalPool = games.reduce((sum, game) => sum + getGameSummaryMetrics(game.id).pool, 0);
    const playersMap = new Map();

    games.forEach((game) => {
      const rows = getDetailRows(game.id);
      const gamePool = getGameSummaryMetrics(game.id).pool;
      const playersCountedInGame = new Set();

      rows.forEach((row) => {
        const playerName = typeof row.playerName === "string" ? row.playerName.trim() : "";
        if (!playerName || !hasIncludedSummaryOrStatsData(row)) {
          return;
        }

        const hasCompletedEntryFee = row.hasCompletedEntryFee === true;

        if (!playersMap.has(playerName)) {
          playersMap.set(playerName, {
            playerName,
            championshipCount: 0,
            meetingsCount: 0,
            pointsSum: 0,
            plusMinusSum: 0,
            payoutSum: 0,
            depositsSum: 0,
            playedGamesPoolSum: 0
          });
        }

        const playerStats = playersMap.get(playerName);
        if (hasCompletedEntryFee) {
          playerStats.meetingsCount += 1;
        }
        playerStats.championshipCount += row.championship ? 1 : 0;
        playerStats.pointsSum += row.points;
        playerStats.plusMinusSum += row.profit;
        playerStats.payoutSum += row.payout;
        playerStats.depositsSum += row.entryFee + row.rebuy;

        if (hasCompletedEntryFee && !playersCountedInGame.has(playerName)) {
          playerStats.playedGamesPoolSum += gamePool;
          playersCountedInGame.add(playerName);
        }
      });
    });

    const playerRows = Array.from(playersMap.values())
      .map((row) => ({
        ...row,
        participationPercent: gameCount === 0 ? 0 : Math.ceil((row.meetingsCount / gameCount) * 100),
        percentAllGames: row.playedGamesPoolSum === 0 ? 0 : Math.ceil((row.payoutSum / row.playedGamesPoolSum) * 100),
        percentPlayedGames: totalPool === 0 ? 0 : Math.ceil((row.payoutSum / totalPool) * 100)
      }))
      .sort(comparePlayerStatsByPlusMinusDesc);

    return {
      gameCount,
      totalPool,
      playerRows
    };
  };

  const getComputedResultValue = (row, manualEntry = {}) => {
    const weight1 = parseIntegerOrZero(getDefaultManualFieldValue("weight1", manualEntry.weight1));
    const weight2 = parseIntegerOrZero(getDefaultManualFieldValue("weight2", manualEntry.weight2));
    const weight3 = parseIntegerOrZero(getDefaultManualFieldValue("weight3", manualEntry.weight3));
    const weight4 = parseIntegerOrZero(getDefaultManualFieldValue("weight4", manualEntry.weight4));
    const weight5 = parseIntegerOrZero(getDefaultManualFieldValue("weight5", manualEntry.weight5));
    const weight6 = parseIntegerOrZero(getDefaultManualFieldValue("weight6", manualEntry.weight6));
    const weight7 = parseIntegerOrZero(getDefaultManualFieldValue("weight7", manualEntry.weight7));

    return (row.championshipCount * weight1)
      + (row.participationPercent * weight2)
      + (row.pointsSum * weight3)
      + (row.plusMinusSum * weight4)
      + (row.payoutSum * weight5)
      + (row.depositsSum * weight6)
      + (row.percentAllGames * weight7);
  };

  const sortRankingRowsByResult = (rows) => {
    rows.sort((a, b) => {
      if (b.resultValue !== a.resultValue) {
        return b.resultValue - a.resultValue;
      }
      return a.playerName.localeCompare(b.playerName, "pl");
    });
    return rows;
  };

  const renderRankingTable = (playerRows) => {
    rankingBody.innerHTML = "";

    if (!playerRows.length) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 3;
      emptyCell.textContent = "Brak danych rankingowych dla wybranego roku.";
      emptyRow.appendChild(emptyCell);
      rankingBody.appendChild(emptyRow);
      return;
    }

    playerRows.forEach((entry, index) => {
      const rank = index + 1;
      const tr = document.createElement("tr");
      if (rank <= 8) {
        tr.classList.add("admin-games-ranking-row-gold");
      } else if (rank <= 17) {
        tr.classList.add("admin-games-ranking-row-green");
      } else {
        tr.classList.add("admin-games-ranking-row-red");
      }

      const rankCell = document.createElement("td");
      rankCell.textContent = String(rank);
      const playerCell = document.createElement("td");
      playerCell.textContent = entry.playerName;
      const resultCell = document.createElement("td");
      resultCell.textContent = String(entry.resultValue);
      tr.append(rankCell, playerCell, resultCell);
      rankingBody.appendChild(tr);
    });
  };

  const renderYears = () => {
    yearsList.innerHTML = "";

    if (!state.years.length) {
      const info = document.createElement("p");
      info.className = "status-text";
      info.textContent = "Brak lat. Dodaj pierwszą grę w tabeli, aby rok pojawił się automatycznie.";
      yearsList.appendChild(info);
      return;
    }

    state.years.forEach((year) => {
      const yearButton = document.createElement("button");
      yearButton.type = "button";
      yearButton.className = `admin-games-year-button ${state.selectedYear === year ? "is-active" : ""}`.trim();
      yearButton.textContent = String(year);
      yearButton.addEventListener("click", () => {
        state.selectedYear = year;
        saveSelectedGamesYear(state.selectedYear);
        renderYears();
        renderGamesTable();
        renderSummaries();
        renderStatsTable();
      });
      yearsList.appendChild(yearButton);
    });
  };

  const renderGamesTable = () => {
    const focusState = getFocusedAdminInputState(gamesTableBody);
    gamesTableBody.innerHTML = "";

    if (!state.selectedYear) {
      status.textContent = "Wybierz rok z listy po lewej stronie.";
      return;
    }

    const games = getGamesForSelectedYear();
    status.textContent = `Wybrany rok: ${state.selectedYear}. Liczba gier: ${games.length}.`;

    if (!games.length) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.colSpan = 5;
      emptyCell.textContent = "Brak gier z datą w wybranym roku.";
      emptyRow.appendChild(emptyCell);
      gamesTableBody.appendChild(emptyRow);
      return;
    }

    games.forEach((game) => {
      const row = document.createElement("tr");

      const gameTypeCell = document.createElement("td");
      const gameTypeSelect = document.createElement("select");
      gameTypeSelect.className = "admin-input";
      gameTypeSelect.dataset.focusTarget = "game-list";
      gameTypeSelect.dataset.section = "games-table";
      gameTypeSelect.dataset.tableId = game.id;
      gameTypeSelect.dataset.columnKey = "gameType";
      ["Cashout", "Turniej"].forEach((label) => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        gameTypeSelect.appendChild(option);
      });
      gameTypeSelect.value = game.gameType === "Turniej" ? "Turniej" : "Cashout";
      gameTypeSelect.addEventListener("change", () => {
        void db.collection(gamesCollectionName).doc(game.id).update({ gameType: gameTypeSelect.value });
      });
      gameTypeCell.appendChild(gameTypeSelect);

      const dateCell = document.createElement("td");
      const dateInput = document.createElement("input");
      dateInput.type = "date";
      dateInput.className = "admin-input";
      dateInput.dataset.focusTarget = "game-list";
      dateInput.dataset.section = "games-table";
      dateInput.dataset.tableId = game.id;
      dateInput.dataset.columnKey = "gameDate";
      dateInput.value = game.gameDate ?? getFormattedCurrentDate();
      dateInput.addEventListener("change", () => {
        const nextDate = dateInput.value || getFormattedCurrentDate();
        const currentName = typeof game.name === "string" ? game.name.trim() : "";
        const updatePayload = { gameDate: nextDate };
        if (!currentName || parseDefaultTableNumber(currentName)) {
          const otherGames = state.games.filter((entry) => entry.id !== game.id);
          updatePayload.name = getNextGameNameForDate(otherGames, nextDate);
        }
        syncYearsAfterLocalGameUpdate(game.id, updatePayload);
        void db.collection(gamesCollectionName).doc(game.id).update(updatePayload);
      });
      dateCell.appendChild(dateInput);

      const nameCell = document.createElement("td");
      const nameWrap = document.createElement("div");
      nameWrap.className = "admin-games-name-control";
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "admin-input";
      nameInput.dataset.focusTarget = "game-list";
      nameInput.dataset.section = "games-table";
      nameInput.dataset.tableId = game.id;
      nameInput.dataset.columnKey = "name";
      nameInput.value = game.name ?? "";
      nameInput.placeholder = "Nazwa gry";
      nameInput.addEventListener("input", () => {
        const value = nameInput.value;
        scheduleDebouncedUpdate(`game-name-${game.id}`, () => {
          void db.collection(gamesCollectionName).doc(game.id).update({ name: value });
        });
      });
      const detailsButton = document.createElement("button");
      detailsButton.type = "button";
      detailsButton.className = "secondary";
      detailsButton.textContent = "Szczegóły";
      detailsButton.addEventListener("click", () => openModal(game.id));
      const notesButton = document.createElement("button");
      notesButton.type = "button";
      notesButton.className = "secondary";
      notesButton.textContent = "Notatki do gry";
      notesButton.addEventListener("click", () => {
        summaryNotesModal.open({
          gameId: game.id,
          gameName: game.name || "Bez nazwy",
          notes: getPreGameNotes(game),
          canWrite: true,
          onSave: async ({ notes }) => {
            await db.collection(gamesCollectionName).doc(game.id).update({
              preGameNotes: notes,
              notes: firebaseApp.firestore.FieldValue.delete()
            });
            const target = state.games.find((entry) => entry.id === game.id);
            if (target) {
              target.preGameNotes = notes;
            }
          },
          notesLabel: "Notatki do gry",
          clearButtonLabel: "Domyślne",
          clearToDefault: true,
          textareaPlaceholder: "Wpisz notatki do gry...",
          triggerButton: notesButton
        });
      });
      nameWrap.append(nameInput, detailsButton, notesButton);
      nameCell.appendChild(nameWrap);

      const closedCell = document.createElement("td");
      const closedInput = document.createElement("input");
      closedInput.type = "checkbox";
      closedInput.checked = Boolean(game.isClosed);
      closedInput.addEventListener("change", () => {
        void db.collection(gamesCollectionName).doc(game.id).update({ isClosed: closedInput.checked });
      });
      closedCell.appendChild(closedInput);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", async () => {
        const gameRef = db.collection(gamesCollectionName).doc(game.id);
        const detailsSnapshot = await gameRef.collection(gameDetailsCollectionName).get();
        const confirmationsSnapshot = await gameRef.collection(GAME_CONFIRMATIONS_COLLECTION).get();
        const batch = db.batch();
        detailsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        confirmationsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        batch.delete(gameRef);
        await batch.commit();
      });
      deleteCell.appendChild(deleteButton);

      row.append(gameTypeCell, dateCell, nameCell, closedCell, deleteCell);
      gamesTableBody.appendChild(row);
    });

    restoreFocusedAdminInputState(gamesTableBody, focusState);
  };

  const renderSummaries = () => {
    const previousScrollLeftByGameId = new Map();
    summariesContainer.querySelectorAll("[data-summary-game-id]").forEach((element) => {
      previousScrollLeftByGameId.set(element.dataset.summaryGameId ?? "", element.scrollLeft);
    });
    summariesContainer.innerHTML = "";
    const games = getGamesForSelectedYear();

    games.forEach((game) => {
      const wrapper = document.createElement("section");
      wrapper.className = "admin-games-section admin-game-summary";

      const heading = document.createElement("div");
      heading.className = "admin-game-summary-heading";

      const notesButton = document.createElement("button");
      notesButton.type = "button";
      notesButton.className = "secondary";
      notesButton.textContent = "Notatki po grze";
      notesButton.addEventListener("click", () => {
        summaryNotesModal.open({
          gameId: game.id,
          gameName: game.name || "Bez nazwy",
          notes: getPostGameNotes(game),
          canWrite: true,
          onSave: async ({ notes }) => {
            await db.collection(gamesCollectionName).doc(game.id).update({
              postGameNotes: notes,
              notes: firebaseApp.firestore.FieldValue.delete()
            });
            const target = state.games.find((entry) => entry.id === game.id);
            if (target) {
              target.postGameNotes = notes;
            }
          },
          notesLabel: "Notatki po grze",
          clearButtonLabel: "Usuń",
          clearToDefault: false,
          textareaPlaceholder: "Wpisz notatki po grze...",
          triggerButton: notesButton
        });
      });

      const title = document.createElement("h3");
      title.textContent = `Podsumowanie gry ${game.name || "Bez nazwy"}`;
      heading.append(notesButton, title);

      const metrics = getGameSummaryMetrics(game.id);
      const mismatchWarning = document.createElement("p");
      mismatchWarning.className = "status-text status-text-danger";
      mismatchWarning.textContent = "Nie zgadza się suma wypłat oraz wpisowych i rebuy/add-on";

      const poolInfo = document.createElement("p");
      poolInfo.className = "status-text";
      poolInfo.textContent = `Pula: ${metrics.pool}`;

      const gameTypeInfo = document.createElement("p");
      gameTypeInfo.className = "status-text";
      gameTypeInfo.textContent = `Rodzaj gry: ${game.gameType || "-"}`;

      const tableScroll = document.createElement("div");
      tableScroll.className = "admin-table-scroll";
      tableScroll.dataset.summaryGameId = game.id;
      const table = document.createElement("table");
      table.className = "admin-data-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Gracz</th>
            <th>Wpisowe</th>
            <th>Rebuy/Add-on</th>
            <th>Wypłata</th>
            <th>+/-</th>
            <th>% puli</th>
            <th>Punkty</th>
            <th>Mistrzostwo</th>
          </tr>
        </thead>
      `;
      const tbody = document.createElement("tbody");

      if (!metrics.rows.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 8;
        emptyCell.textContent = "Brak danych do podsumowania.";
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
      } else {
        metrics.rows.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row.playerName || ""}</td>
            <td>${row.entryFee}</td>
            <td>${row.rebuy}</td>
            <td>${row.payout}</td>
            <td>${row.profit}</td>
            <td>${row.poolSharePercent}</td>
            <td>${row.points}</td>
            <td>${row.championship ? "✓" : ""}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      table.appendChild(tbody);
      tableScroll.appendChild(table);
      tableScroll.scrollLeft = previousScrollLeftByGameId.get(game.id) ?? 0;

      if (metrics.hasPayoutMismatch) {
        wrapper.append(heading, mismatchWarning, gameTypeInfo, poolInfo, tableScroll);
      } else {
        wrapper.append(heading, gameTypeInfo, poolInfo, tableScroll);
      }
      summariesContainer.appendChild(wrapper);
    });
  };

  const renderStatsTable = () => {
    statsBody.innerHTML = "";
    playersStatsBody.innerHTML = "";

    const statistics = getPlayersStatistics();
    const gameCount = statistics.gameCount;
    const totalPool = statistics.totalPool;

    const summaryRows = [
      ["Liczba gier", String(gameCount)],
      ["Łączna pula", String(totalPool)]
    ];

    summaryRows.forEach(([label, value]) => {
      const tr = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = label;
      const valueCell = document.createElement("td");
      valueCell.textContent = value;
      tr.append(labelCell, valueCell);
      statsBody.appendChild(tr);
    });

    const currentYearStats = getManualStatsForYear(state.selectedYear);

    const createReadOnlyCell = (value) => {
      const td = document.createElement("td");
      td.textContent = String(value);
      return td;
    };

    const updateResultsAndRanking = (statisticsRows, yearMap) => {
      const rankingRows = sortRankingRowsByResult(statisticsRows.map((statsRow) => {
        const localEntry = yearMap.get(statsRow.playerName) ?? {};
        const resultValue = getComputedResultValue(statsRow, localEntry);
        const resultCell = playersStatsBody.querySelector(`[data-result-player="${window.CSS.escape(statsRow.playerName)}"]`);
        if (resultCell) {
          resultCell.textContent = String(resultValue);
        }
        return {
          ...statsRow,
          resultValue
        };
      }));
      renderRankingTable(rankingRows);
    };

    const createEditableCell = (playerName, key) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "admin-input";
      input.dataset.focusTarget = "admin-games-stats";
      input.dataset.section = "games-stats";
      input.dataset.tableId = String(state.selectedYear ?? "");
      input.dataset.rowId = playerName;
      input.dataset.columnKey = key;
      const stored = currentYearStats.get(playerName);
      input.value = getDefaultManualFieldValue(key, stored?.[key]);
      input.addEventListener("input", () => {
        input.value = sanitizeIntegerInput(input.value);
        if (!state.selectedYear) {
          return;
        }
        if (!state.manualStatsByYear.has(String(state.selectedYear))) {
          state.manualStatsByYear.set(String(state.selectedYear), new Map());
        }
        const yearMap = state.manualStatsByYear.get(String(state.selectedYear));
        const playerEntry = ensureYearMapEntry(yearMap, playerName);
        playerEntry[key] = input.value;

        scheduleDebouncedUpdate(`admin-games-stats-${state.selectedYear}-${playerName}-${key}`, () => persistManualStats(state.selectedYear));
        updateResultsAndRanking(statistics.playerRows, yearMap);
      });
      td.appendChild(input);
      return td;
    };

    if (!statistics.playerRows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 19;
      td.textContent = "Brak graczy z uzupełnionym wpisowym w wybranym roku.";
      tr.appendChild(td);
      playersStatsBody.appendChild(tr);
      renderRankingTable([]);
      return;
    }

    const rankingRows = [];

    statistics.playerRows.forEach((row) => {
      const tr = document.createElement("tr");
      const manualEntry = currentYearStats.get(row.playerName) ?? {};
      const resultValue = getComputedResultValue(row, manualEntry);
      rankingRows.push({
        ...row,
        resultValue
      });

      const resultCell = createReadOnlyCell(resultValue);
      resultCell.dataset.resultPlayer = row.playerName;

      tr.append(
        createReadOnlyCell(row.playerName),
        createReadOnlyCell(row.championshipCount),
        createEditableCell(row.playerName, "weight1"),
        createReadOnlyCell(row.meetingsCount),
        createReadOnlyCell(`${row.participationPercent}%`),
        createEditableCell(row.playerName, "weight2"),
        createReadOnlyCell(row.pointsSum),
        createEditableCell(row.playerName, "weight3"),
        createReadOnlyCell(row.plusMinusSum),
        createEditableCell(row.playerName, "weight4"),
        createReadOnlyCell(row.payoutSum),
        createEditableCell(row.playerName, "weight5"),
        createReadOnlyCell(row.depositsSum),
        createEditableCell(row.playerName, "weight6"),
        createReadOnlyCell(row.playedGamesPoolSum),
        createReadOnlyCell(`${row.percentAllGames}%`),
        createEditableCell(row.playerName, "weight7"),
        createReadOnlyCell(`${row.percentPlayedGames}%`),
        resultCell
      );
      playersStatsBody.appendChild(tr);
    });

    renderRankingTable(sortRankingRowsByResult(rankingRows));
  };

  const renderModal = (gameId) => {
    if (!modalBody || !modalMeta) {
      return;
    }
    const game = state.games.find((entry) => entry.id === gameId);
    if (!game) {
      return;
    }

    const focusState = getFocusedAdminInputState(modalBody);
    modalMeta.textContent = `Nazwa: ${game.name || "-"} | Rodzaj gry: ${game.gameType || "-"} | Data: ${game.gameDate || "-"}`;
    modalBody.innerHTML = "";

    const rows = state.detailsByGame.get(gameId) ?? [];
    rows.forEach((row) => {
      const tr = document.createElement("tr");

      const playerCell = document.createElement("td");
      const playerSelect = document.createElement("select");
      playerSelect.className = "admin-input";
      playerSelect.dataset.focusTarget = "game-details-row";
      playerSelect.dataset.section = "games-modal";
      playerSelect.dataset.tableId = gameId;
      playerSelect.dataset.rowId = row.id;
      playerSelect.dataset.columnKey = "playerName";
      const currentPlayerName = typeof row.playerName === "string" ? row.playerName : "";
      const options = [...state.playerOptions];
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "Wybierz gracza";
      playerSelect.appendChild(emptyOption);
      if (currentPlayerName && !options.includes(currentPlayerName)) {
        const legacyOption = document.createElement("option");
        legacyOption.value = currentPlayerName;
        legacyOption.textContent = `${currentPlayerName} (usunięty)`;
        legacyOption.disabled = true;
        legacyOption.selected = true;
        playerSelect.appendChild(legacyOption);
      }
      options.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        playerSelect.appendChild(option);
      });
      playerSelect.value = currentPlayerName;
      playerSelect.addEventListener("change", () => {
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ playerName: playerSelect.value });
      });
      playerCell.appendChild(playerSelect);

      const createNumericCell = (key) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "admin-input";
        input.dataset.focusTarget = "game-details-row";
        input.dataset.section = "games-modal";
        input.dataset.tableId = gameId;
        input.dataset.rowId = row.id;
        input.dataset.columnKey = key;
        const rawValue = row[key] ?? "";
        input.value = rawValue;
        input.addEventListener("input", () => {
          input.value = sanitizeIntegerInput(input.value);
          scheduleDebouncedUpdate(`detail-${gameId}-${row.id}-${key}`, () => {
            void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ [key]: input.value });
          });
        });
        td.appendChild(input);
        return td;
      };

      const entryFeeCell = createNumericCell("entryFee");
      const rebuyCell = createNumericCell("rebuy");
      const payoutCell = createNumericCell("payout");

      const profitCell = document.createElement("td");
      profitCell.textContent = String(parseIntegerOrZero(row.payout) - (parseIntegerOrZero(row.entryFee) + parseIntegerOrZero(row.rebuy)));

      const pointsCell = createNumericCell("points");

      const championshipCell = document.createElement("td");
      const championshipInput = document.createElement("input");
      championshipInput.type = "checkbox";
      championshipInput.dataset.focusTarget = "game-details-row";
      championshipInput.dataset.section = "games-modal";
      championshipInput.dataset.tableId = gameId;
      championshipInput.dataset.rowId = row.id;
      championshipInput.dataset.columnKey = "championship";
      championshipInput.checked = Boolean(row.championship);
      championshipInput.addEventListener("change", () => {
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).update({ championship: championshipInput.checked });
      });
      championshipCell.appendChild(championshipInput);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger admin-row-delete";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", () => {
        void db.collection(gamesCollectionName).doc(gameId).collection(gameDetailsCollectionName).doc(row.id).delete();
      });
      deleteCell.appendChild(deleteButton);

      tr.append(playerCell, entryFeeCell, rebuyCell, payoutCell, profitCell, pointsCell, championshipCell, deleteCell);
      modalBody.appendChild(tr);
    });

    restoreFocusedAdminInputState(modalBody, focusState);
  };

  const openModal = (gameId) => {
    if (!modal) {
      return;
    }
    state.activeGameIdInModal = gameId;
    renderModal(gameId);
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const synchronizeYearsFromGames = () => {
    const yearsFromGames = state.games
      .map((game) => extractYearFromDate(game.gameDate))
      .filter((year) => Number.isInteger(year));

    state.years = normalizeYearList(yearsFromGames);

    if (!state.selectedYear || !state.years.includes(state.selectedYear)) {
      state.selectedYear = state.years[0] ?? null;
    }

    saveSelectedGamesYear(state.selectedYear);
    renderYears();
    renderGamesTable();
    renderSummaries();
    renderStatsTable();
  };

  db.collection(ADMIN_GAMES_STATS_COLLECTION).onSnapshot((snapshot) => {
    state.manualStatsByYear.clear();
    snapshot.forEach((doc) => {
      const yearKey = String(doc.id);
      const rows = Array.isArray(doc.data()?.rows) ? doc.data().rows : [];
      const yearMap = new Map();
      rows.forEach((entry) => {
        const playerName = typeof entry?.playerName === "string" ? entry.playerName.trim() : "";
        if (!playerName) {
          return;
        }
        const parsedEntry = { playerName };
        manualStatsFields.forEach((field) => {
          parsedEntry[field] = getDefaultManualFieldValue(field, entry[field]);
        });
        yearMap.set(playerName, parsedEntry);
      });
      state.manualStatsByYear.set(yearKey, yearMap);
    });
    renderStatsTable();
  });

  weightHeaderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const weightKey = button.dataset.weightKey;
      if (!weightStatsFields.includes(weightKey)) {
        return;
      }
      const promptValue = window.prompt(`Podaj wartość liczbową dla kolumny ${button.textContent}.`, "1");
      if (promptValue === null) {
        return;
      }
      const normalizedValue = sanitizeIntegerInput(promptValue);
      if (!normalizedValue || normalizedValue === "-") {
        status.textContent = "Podaj poprawną wartość liczbową dla wagi.";
        return;
      }
      void applyBulkWeightValue(weightKey, normalizedValue);
    });
  });

  db.collection(PLAYER_ACCESS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).onSnapshot((snapshot) => {
    const players = Array.isArray(snapshot.data()?.players) ? snapshot.data().players : [];
    state.playerOptions = players
      .map((player) => (typeof player.name === "string" ? player.name.trim() : ""))
      .filter((name) => Boolean(name));
    if (state.activeGameIdInModal) {
      renderModal(state.activeGameIdInModal);
    }
  });

  db.collection(gamesCollectionName)
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      state.games = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      state.games.forEach((game) => {
        void clearLegacyNotesField({ firebaseApp, db, collectionName: gamesCollectionName, game });
      });

      const activeIds = new Set(state.games.map((game) => game.id));
      state.detailsUnsubscribers.forEach((unsubscribe, gameId) => {
        if (!activeIds.has(gameId)) {
          unsubscribe();
          state.detailsUnsubscribers.delete(gameId);
          state.detailsByGame.delete(gameId);
        }
      });

      state.games.forEach((game) => {
        if (state.detailsUnsubscribers.has(game.id)) {
          return;
        }
        const unsubscribe = db.collection(gamesCollectionName).doc(game.id).collection(gameDetailsCollectionName).orderBy("createdAt", "asc").onSnapshot((rowSnapshot) => {
          state.detailsByGame.set(game.id, rowSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          if (state.activeGameIdInModal === game.id) {
            renderModal(game.id);
          }
          renderSummaries();
          renderStatsTable();
        });
        state.detailsUnsubscribers.set(game.id, unsubscribe);
      });

      synchronizeYearsFromGames();
    });

  addGameButton.addEventListener("click", async () => {
    addGameButton.disabled = true;
    status.textContent = "Dodawanie gry...";
    try {
      const gameDate = getFormattedCurrentDate();
      const name = getNextGameNameForDate(state.games, gameDate);
      await db.collection(gamesCollectionName).add({
        gameType: "Cashout",
        gameDate,
        name,
        isClosed: false,
        preGameNotes: DEFAULT_GAME_NOTES_TEMPLATE,
        postGameNotes: "",
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
      status.textContent = `Dodano grę "${name}" z datą ${gameDate}.`;
    } catch (error) {
      const errorCode = error?.code;
      if (errorCode === "permission-denied") {
        status.textContent =
          `Brak uprawnień do zapisu w kolekcji ${gamesCollectionName}. Sprawdź reguły Firestore i wielkość liter.`;
      } else {
        const details = formatFirestoreError(error);
        status.textContent = details
          ? `Nie udało się dodać gry. ${details}`
          : "Nie udało się dodać gry.";
      }
    } finally {
      addGameButton.disabled = false;
    }
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
  if (modalAddRowButton) {
    modalAddRowButton.addEventListener("click", async () => {
      if (!state.activeGameIdInModal) {
        return;
      }
      await db.collection(gamesCollectionName).doc(state.activeGameIdInModal).collection(gameDetailsCollectionName).add({
        playerName: "",
        entryFee: "",
        rebuy: "",
        payout: "",
        points: "",
        championship: false,
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  if (modalEntryFeeBulkButton) {
    modalEntryFeeBulkButton.addEventListener("click", async () => {
      if (!state.activeGameIdInModal) {
        status.textContent = "Otwórz szczegóły gry, aby zbiorczo ustawić wpisowe.";
        return;
      }
      const promptValue = window.prompt("Podaj wartość wpisowego dla wszystkich graczy.", "0");
      if (promptValue === null) {
        return;
      }
      const normalized = sanitizeIntegerInput(promptValue);
      if (!normalized || normalized === "-") {
        status.textContent = "Podaj poprawną wartość liczbową wpisowego.";
        return;
      }
      const rows = state.detailsByGame.get(state.activeGameIdInModal) ?? [];
      await Promise.all(rows.map((row) => db.collection(gamesCollectionName)
        .doc(state.activeGameIdInModal)
        .collection(gameDetailsCollectionName)
        .doc(row.id)
        .update({ entryFee: normalized })));
      status.textContent = `Ustawiono wpisowe ${normalized} dla ${rows.length} wierszy.`;
    });
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-visible")) {
        closeModal();
      }
    });
  }

  registerAdminRefreshHandler("adminGamesTab", async () => {
    renderGamesTable();
    renderSummaries();
    renderStatsTable();
  });
  registerAdminRefreshHandler("adminUserGamesTab", async () => {});
};

const initLatestMessage = () => {
  const output = document.querySelector("#latestMessageOutput");
  const status = document.querySelector("#latestMessageStatus");

  if (!output || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    output.value = "Brak połączenia z Firebase.";
    status.textContent = "Uzupełnij konfigurację Firebase, aby zobaczyć wiadomości.";
    return;
  }

  const db = firebaseApp.firestore();

  db.collection("admin_messages")
    .orderBy("createdAt", "desc")
    .limit(1)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.empty) {
          output.value = "Brak wiadomości od administratora.";
          status.textContent = "";
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        const message = typeof data.message === "string" ? data.message : "";

        output.value = message || "Brak wiadomości od administratora.";
        status.textContent = "";
      },
      () => {
        output.value = "Nie udało się pobrać wiadomości.";
        status.textContent = "Sprawdź reguły Firestore i konfigurację projektu.";
      }
    );
};

const initAdminRules = () => {
  const input = document.querySelector("#adminRulesInput");
  const saveButton = document.querySelector("#adminRulesSave");
  const status = document.querySelector("#adminRulesStatus");

  if (!input || !saveButton || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    input.disabled = true;
    saveButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby edytować regulamin.";
    return;
  }

  const db = firebaseApp.firestore();
  const rulesDocRef = db.collection(PLAYER_ACCESS_COLLECTION).doc(RULES_DOCUMENT);
  let isSaving = false;

  registerAdminRefreshHandler("adminRulesTab", async () => {
    await rulesDocRef.get({ source: "server" });
  });

  rulesDocRef.onSnapshot(
    (snapshot) => {
      const data = snapshot.data();
      const rulesText = typeof data?.text === "string" ? data.text : RULES_DEFAULT_TEXT;
      if (document.activeElement !== input || !isSaving) {
        input.value = rulesText;
      }
      status.textContent = data?.text ? "Regulamin jest aktualny." : "Brak zapisanej treści regulaminu.";
      saveButton.disabled = false;
      isSaving = false;
    },
    () => {
      status.textContent = "Nie udało się pobrać regulaminu. Sprawdź konfigurację Firestore.";
    }
  );

  saveButton.addEventListener("click", () => {
    if (isSaving) {
      return;
    }

    status.textContent = "Zapisywanie regulaminu...";
    isSaving = true;
    saveButton.disabled = true;

    void rulesDocRef.set({
      text: input.value,
      updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
      source: "web-admin"
    }, { merge: true })
      .catch(() => {
        isSaving = false;
        saveButton.disabled = false;
        status.textContent = "Nie udało się zapisać regulaminu.";
      });
  });
};

const initRulesDisplay = () => {
  const output = document.querySelector("#rulesOutput");
  const status = document.querySelector("#rulesStatus");

  if (!output || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    output.value = "Brak połączenia z Firebase.";
    status.textContent = "Uzupełnij konfigurację Firebase, aby zobaczyć regulamin.";
    return;
  }

  firebaseApp.firestore()
    .collection(PLAYER_ACCESS_COLLECTION)
    .doc(RULES_DOCUMENT)
    .onSnapshot(
      (snapshot) => {
        const data = snapshot.data();
        const rulesText = typeof data?.text === "string" ? data.text.trim() : "";
        output.value = rulesText || "Administrator jeszcze nie dodał regulaminu.";
        status.textContent = "";
      },
      () => {
        output.value = "Nie udało się pobrać regulaminu.";
        status.textContent = "Sprawdź reguły Firestore i konfigurację projektu.";
      }
    );
};

const initInstructionModal = () => {
  const openButton = document.querySelector("#adminInstructionButton");
  const modal = document.querySelector("#instructionModal");
  const closeButton = document.querySelector("#instructionClose");
  const content = document.querySelector("#instructionContent");
  const status = document.querySelector("#instructionStatus");

  if (!openButton || !modal || !content || !status) {
    return;
  }

  const instructionUrl = "https://cutelittlegoat.github.io/Karty/docs/README.md";
  let cachedText = "";
  let isLoading = false;

  const setStatus = (message) => {
    status.textContent = message;
  };

  const loadInstruction = async () => {
    if (isLoading) {
      return;
    }

    if (cachedText) {
      return;
    }

    isLoading = true;
    setStatus("Pobieranie instrukcji...");

    try {
      const response = await fetch(instructionUrl, { cache: "default" });
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      cachedText = await response.text();
      content.textContent = cachedText;
      setStatus("Instrukcja została pobrana.");
    } catch (error) {
      setStatus("Nie udało się pobrać instrukcji. Zamknij i otwórz okno ponownie.");
    } finally {
      isLoading = false;
    }
  };

  const openModal = () => {
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (!cachedText) {
      void loadInstruction();
    }
  };

  const closeModal = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  openButton.addEventListener("click", openModal);

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-visible")) {
      closeModal();
    }
  });
};

const bootstrap = async () => {
  const isAdmin = getAdminMode();
  document.body.classList.toggle("is-admin", isAdmin);
  initAdminPanelTabs();
  initAdminPanelRefresh();
  initUserTabs();
  initAdminMessaging();
  initAdminChat();
  initAdminRules();
  initAdminGames();
  initAdminUserGames();
  initAdminConfirmations();
  initAdminPlayers();
  initPinGate();
  initChatTab();
  initUserConfirmations();
  initUserGamesTab();
  initStatisticsTab();
  initPlayerUserGames();
  initStatisticsViews();
  initLatestMessage();
  initRulesDisplay();
  initInstructionModal();
};

void bootstrap();
