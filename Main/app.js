const PIN_LENGTH = 5;
const PIN_STORAGE_KEY = "nextGamePinVerified";
const PLAYER_ACCESS_COLLECTION = "app_settings";
const PLAYER_ACCESS_DOCUMENT = "player_access";
const AVAILABLE_PLAYER_TABS = [
  {
    key: "nextGameTab",
    label: "Najbliższa gra"
  }
];

const TABLES_COLLECTION = "Tables";
const GAMES_COLLECTION = "Tables";
const GAME_DETAILS_COLLECTION = "rows";
const TABLES_COLLECTION_CONFIG_KEY = "tablesCollection";
const GAMES_COLLECTION_CONFIG_KEY = "gamesCollection";
const GAME_DETAILS_COLLECTION_CONFIG_KEY = "gameDetailsCollection";
const TABLE_ROWS_COLLECTION = "rows";
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

const adminTablesState = {
  tables: new Map(),
  rows: new Map(),
  rowUnsubscribers: new Map(),
  tableList: []
};
const adminPlayersState = {
  players: [],
  playerByPin: new Map(),
  editingPlayerId: null
};
const debounceTimers = new Map();
const adminRefreshHandlers = new Map();
const ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY = "adminGamesSelectedYear";

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

const loadSavedSelectedGamesYear = () => {
  const rawValue = Number(localStorage.getItem(ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY));
  return Number.isInteger(rawValue) && rawValue > 1900 && rawValue < 3000 ? rawValue : null;
};

const saveSelectedGamesYear = (year) => {
  if (!Number.isInteger(year) || year < 1900 || year > 2999) {
    localStorage.removeItem(ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY);
    return;
  }
  localStorage.setItem(ADMIN_GAMES_SELECTED_YEAR_STORAGE_KEY, String(year));
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
  const closeFooterButton = document.querySelector("#playerPermissionsCloseFooter");

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

  const normalizePlayer = (player, index) => ({
    id: typeof player.id === "string" && player.id.trim() ? player.id.trim() : `player-${index + 1}`,
    name: typeof player.name === "string" ? player.name : "",
    pin: sanitizePin(typeof player.pin === "string" ? player.pin : ""),
    appEnabled: Boolean(player.appEnabled),
    permissions: Array.isArray(player.permissions)
      ? player.permissions.filter((permission) =>
          AVAILABLE_PLAYER_TABS.some((availableTab) => availableTab.key === permission)
        )
      : []
  });

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
    adminPlayersState.players = rawPlayers.map(normalizePlayer);
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
    adminPlayersState.editingPlayerId = null;
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    modalStatus.textContent = "";
    document.body.classList.remove("modal-open");
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
        }
        renderPlayers();
        void savePlayers();
      });

      const text = document.createElement("span");
      text.textContent = tab.label;

      label.appendChild(checkbox);
      label.appendChild(text);
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
          badge.textContent = tab ? tab.label : permission;
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
      permissions: []
    });
    renderPlayers();
    await savePlayers();
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }
  if (closeFooterButton) {
    closeFooterButton.addEventListener("click", closeModal);
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
        adminPlayersState.players = rawPlayers.map(normalizePlayer);
        rebuildPinMap();
        renderPlayers();
      },
      () => {
        status.textContent = "Nie udało się pobrać listy graczy.";
      }
    );
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

const initAdminTables = () => {
  const list = document.querySelector("#adminTablesList");
  const addButton = document.querySelector("#adminAddTable");
  const status = document.querySelector("#adminTablesStatus");
  const summaryGameCount = document.querySelector("#summaryGameCount");
  const summaryTotalPool = document.querySelector("#summaryTotalPool");

  if (!list || !addButton || !status || !summaryGameCount || !summaryTotalPool) {
    return;
  }

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    addButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby zapisywać stoły.";
    return;
  }

  const db = firebaseApp.firestore();
  const tablesCollectionName = getTablesCollectionName();

  const refreshTablesData = async () => {
    const snapshot = await db
      .collection(tablesCollectionName)
      .orderBy("createdAt", "asc")
      .get({ source: "server" });

    const tables = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    adminTablesState.tableList = tables;
    adminTablesState.tables = new Map(tables.map((table) => [table.id, table]));

    const rowsByTable = new Map();
    await Promise.all(
      tables.map(async (table) => {
        const rowsSnapshot = await db
          .collection(tablesCollectionName)
          .doc(table.id)
          .collection(TABLE_ROWS_COLLECTION)
          .orderBy("createdAt", "asc")
          .get({ source: "server" });
        rowsByTable.set(
          table.id,
          rowsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      })
    );

    adminTablesState.rows = rowsByTable;
    renderTables();
  };

  registerAdminRefreshHandler("adminTournamentsTab", refreshTablesData);

  const updateSummary = () => {
    const totalTables = adminTablesState.tableList.length;
    let totalPool = 0;
    adminTablesState.rows.forEach((rows) => {
      rows.forEach((row) => {
        totalPool += normalizeNumber(row.deposits);
      });
    });

    summaryGameCount.value = totalTables.toString();
    summaryTotalPool.value = formatNumber(totalPool);
  };

  const deleteTable = async (tableId) => {
    status.textContent = "Usuwanie stołu...";
    try {
      const tableRef = db.collection(tablesCollectionName).doc(tableId);
      const rowsSnapshot = await tableRef.collection(TABLE_ROWS_COLLECTION).get();
      const batch = db.batch();
      rowsSnapshot.forEach((rowDoc) => {
        batch.delete(rowDoc.ref);
      });
      batch.delete(tableRef);
      await batch.commit();
      status.textContent = "Stół usunięty.";
    } catch (error) {
      status.textContent = "Nie udało się usunąć stołu.";
    }
  };

  const renderTables = () => {
    const focusState = getFocusedAdminInputState(list);
    list.innerHTML = "";

    adminTablesState.tableList.forEach((table) => {
      const tableCard = document.createElement("div");
      tableCard.className = "admin-table-card";

      const metaRow = document.createElement("div");
      metaRow.className = "admin-table-meta";

      const gameTypeInput = document.createElement("input");
      gameTypeInput.type = "text";
      gameTypeInput.className = "admin-input";
      gameTypeInput.dataset.focusTarget = "table-meta";
      gameTypeInput.dataset.tableId = table.id;
      gameTypeInput.dataset.columnKey = "gameType";
      gameTypeInput.value = table.gameType ?? DEFAULT_TABLE_META.gameType;
      gameTypeInput.placeholder = DEFAULT_TABLE_META.gameType;
      gameTypeInput.addEventListener("input", () => {
        const value = gameTypeInput.value;
        scheduleDebouncedUpdate(`${table.id}:gameType`, () => {
          db.collection(tablesCollectionName).doc(table.id).update({ gameType: value });
        });
      });

      const gameDateInput = document.createElement("input");
      gameDateInput.type = "text";
      gameDateInput.className = "admin-input";
      gameDateInput.dataset.focusTarget = "table-meta";
      gameDateInput.dataset.tableId = table.id;
      gameDateInput.dataset.columnKey = "gameDate";
      gameDateInput.value = table.gameDate ?? DEFAULT_TABLE_META.gameDate;
      gameDateInput.placeholder = DEFAULT_TABLE_META.gameDate;
      gameDateInput.addEventListener("input", () => {
        const value = gameDateInput.value;
        scheduleDebouncedUpdate(`${table.id}:gameDate`, () => {
          db.collection(tablesCollectionName).doc(table.id).update({ gameDate: value });
        });
      });

      metaRow.appendChild(gameTypeInput);
      metaRow.appendChild(gameDateInput);

      const headerRow = document.createElement("div");
      headerRow.className = "admin-table-header";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "admin-input";
      nameInput.dataset.focusTarget = "table-name";
      nameInput.dataset.tableId = table.id;
      nameInput.value = table.name ?? getNextTableName([]);
      nameInput.placeholder = "Nazwa stołu";
      nameInput.addEventListener("input", () => {
        const value = nameInput.value;
        scheduleDebouncedUpdate(`${table.id}:name`, () => {
          db.collection(tablesCollectionName).doc(table.id).update({ name: value });
        });
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", () => {
        void deleteTable(table.id);
      });

      headerRow.appendChild(nameInput);
      headerRow.appendChild(deleteButton);

      const tableScroll = document.createElement("div");
      tableScroll.className = "admin-table-scroll";

      const dataTable = document.createElement("table");
      dataTable.className = "admin-data-table";

      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      TABLE_COLUMNS.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column.label;
        headRow.appendChild(th);
      });
      const actionsTh = document.createElement("th");
      actionsTh.textContent = "";
      headRow.appendChild(actionsTh);
      thead.appendChild(headRow);
      dataTable.appendChild(thead);

      const tbody = document.createElement("tbody");
      const rows = adminTablesState.rows.get(table.id) ?? [];
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        TABLE_COLUMNS.forEach((column) => {
          const td = document.createElement("td");
          const input = document.createElement("input");
          input.type = "text";
          input.className = "admin-input";
          input.dataset.focusTarget = "table-row";
          input.dataset.tableId = table.id;
          input.dataset.rowId = row.id;
          input.dataset.columnKey = column.key;
          input.value = row[column.key] ?? "";
          input.addEventListener("input", () => {
            const value = input.value;
            scheduleDebouncedUpdate(`${table.id}:${row.id}:${column.key}`, () => {
              db.collection(tablesCollectionName)
                .doc(table.id)
                .collection(TABLE_ROWS_COLLECTION)
                .doc(row.id)
                .update({ [column.key]: value });
            });
          });
          td.appendChild(input);
          tr.appendChild(td);
        });

        const actionTd = document.createElement("td");
        const rowDeleteButton = document.createElement("button");
        rowDeleteButton.type = "button";
        rowDeleteButton.className = "danger admin-row-delete";
        rowDeleteButton.textContent = "Usuń";
        rowDeleteButton.addEventListener("click", () => {
          db.collection(tablesCollectionName)
            .doc(table.id)
            .collection(TABLE_ROWS_COLLECTION)
            .doc(row.id)
            .delete();
        });
        actionTd.appendChild(rowDeleteButton);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
      });
      dataTable.appendChild(tbody);
      tableScroll.appendChild(dataTable);

      const actionsRow = document.createElement("div");
      actionsRow.className = "admin-table-actions";
      const addRowButton = document.createElement("button");
      addRowButton.type = "button";
      addRowButton.className = "secondary";
      addRowButton.textContent = "Dodaj";
      addRowButton.addEventListener("click", async () => {
        await db
          .collection(tablesCollectionName)
          .doc(table.id)
          .collection(TABLE_ROWS_COLLECTION)
          .add({
          playerName: "",
          percentAllGames: "",
          percentPlayedGames: "",
          payouts: "",
          totalGames: "",
          summary: "",
          deposits: "",
          meetings: "",
          points: "",
          rebuyTotal: "",
          createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
        });
      });
      actionsRow.appendChild(addRowButton);

      tableCard.appendChild(metaRow);
      tableCard.appendChild(headerRow);
      tableCard.appendChild(tableScroll);
      tableCard.appendChild(actionsRow);

      list.appendChild(tableCard);
    });

    updateSummary();
    restoreFocusedAdminInputState(list, focusState);
  };

  db.collection(tablesCollectionName)
    .orderBy("createdAt", "asc")
    .onSnapshot(
      (snapshot) => {
        const tables = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        adminTablesState.tableList = tables;
        adminTablesState.tables = new Map(tables.map((table) => [table.id, table]));

        const activeIds = new Set(tables.map((table) => table.id));
        adminTablesState.rowUnsubscribers.forEach((unsubscribe, tableId) => {
          if (!activeIds.has(tableId)) {
            unsubscribe();
            adminTablesState.rowUnsubscribers.delete(tableId);
            adminTablesState.rows.delete(tableId);
          }
        });

        tables.forEach((table) => {
          if (adminTablesState.rowUnsubscribers.has(table.id)) {
            return;
          }
          const unsubscribe = db
            .collection(tablesCollectionName)
            .doc(table.id)
            .collection(TABLE_ROWS_COLLECTION)
            .orderBy("createdAt", "asc")
            .onSnapshot((rowSnapshot) => {
              const rows = rowSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
              adminTablesState.rows.set(table.id, rows);
              renderTables();
            });
          adminTablesState.rowUnsubscribers.set(table.id, unsubscribe);
        });

        renderTables();
      },
      (error) => {
        const errorCode = error?.code;
        if (errorCode === "permission-denied") {
          status.textContent =
            `Brak dostępu do kolekcji ${tablesCollectionName}. Sprawdź reguły Firestore i wielkość liter.`;
        } else {
          status.textContent = "Nie udało się pobrać listy stołów.";
        }
      }
    );

  addButton.addEventListener("click", async () => {
    addButton.disabled = true;
    status.textContent = "Dodawanie stołu...";

    try {
      const nextName = getNextTableName(adminTablesState.tableList);
      await db.collection(tablesCollectionName).add({
        name: nextName,
        gameType: DEFAULT_TABLE_META.gameType,
        gameDate: DEFAULT_TABLE_META.gameDate,
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
      status.textContent = "Stół dodany.";
    } catch (error) {
      const errorCode = error?.code;
      if (errorCode === "permission-denied") {
        status.textContent =
          `Brak uprawnień do zapisu w kolekcji ${tablesCollectionName}. Sprawdź reguły Firestore i wielkość liter.`;
      } else {
        const details = formatFirestoreError(error);
        status.textContent = details
          ? `Nie udało się dodać stołu. ${details}`
          : "Nie udało się dodać stołu.";
      }
    } finally {
      addButton.disabled = false;
    }
  });
};

const initAdminGames = () => {
  const yearsList = document.querySelector("#adminGamesYearsList");
  const addGameButton = document.querySelector("#adminGamesAddGame");
  const gamesTableBody = document.querySelector("#adminGamesTableBody");
  const summariesContainer = document.querySelector("#adminGamesSummaries");
  const statsBody = document.querySelector("#adminGamesStatsBody");
  const status = document.querySelector("#adminGamesStatus");
  const modal = document.querySelector("#gameDetailsModal");
  const modalMeta = document.querySelector("#gameDetailsMeta");
  const modalBody = document.querySelector("#gameDetailsBody");
  const modalClose = document.querySelector("#gameDetailsClose");
  const modalCloseFooter = document.querySelector("#gameDetailsCloseFooter");
  const modalAddRowButton = document.querySelector("#gameDetailsAddRow");

  if (!yearsList || !gamesTableBody || !summariesContainer || !statsBody || !status || !addGameButton) {
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
  const state = {
    years: [],
    selectedYear: loadSavedSelectedGamesYear(),
    games: [],
    detailsByGame: new Map(),
    detailsUnsubscribers: new Map(),
    activeGameIdInModal: null,
    playerOptions: []
  };

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
      .sort((a, b) => String(b.gameDate ?? "").localeCompare(String(a.gameDate ?? ""), "pl"));
  };

  const getDetailRows = (gameId) => {
    const rows = state.detailsByGame.get(gameId) ?? [];
    return rows.map((row) => {
      const entryFee = parseIntegerOrZero(row.entryFee);
      const rebuy = parseIntegerOrZero(row.rebuy);
      const payout = parseIntegerOrZero(row.payout);
      const profit = entryFee + rebuy - payout;
      return {
        ...row,
        entryFee,
        rebuy,
        payout,
        profit,
        points: parseIntegerOrZero(row.points),
        championship: Boolean(row.championship)
      };
    });
  };

  const getGameSummaryMetrics = (gameId) => {
    const rows = getDetailRows(gameId);
    const pool = rows.reduce((sum, row) => sum + row.entryFee + row.rebuy, 0);
    const sortedRows = [...rows].sort((a, b) => {
      const percentA = pool === 0 ? 0 : Math.round((a.payout / pool) * 100);
      const percentB = pool === 0 ? 0 : Math.round((b.payout / pool) * 100);
      return percentB - percentA;
    });

    return {
      pool,
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
      nameWrap.append(nameInput, detailsButton);
      nameCell.appendChild(nameWrap);

      const deleteCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "Usuń";
      deleteButton.addEventListener("click", async () => {
        const gameRef = db.collection(gamesCollectionName).doc(game.id);
        const detailsSnapshot = await gameRef.collection(gameDetailsCollectionName).get();
        const batch = db.batch();
        detailsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        batch.delete(gameRef);
        await batch.commit();
      });
      deleteCell.appendChild(deleteButton);

      row.append(gameTypeCell, dateCell, nameCell, deleteCell);
      gamesTableBody.appendChild(row);
    });

    restoreFocusedAdminInputState(gamesTableBody, focusState);
  };

  const renderSummaries = () => {
    summariesContainer.innerHTML = "";
    const games = getGamesForSelectedYear();

    games.forEach((game) => {
      const wrapper = document.createElement("section");
      wrapper.className = "admin-games-section admin-game-summary";

      const title = document.createElement("h3");
      title.textContent = `Podsumowanie gry ${game.name || "Bez nazwy"}`;

      const metrics = getGameSummaryMetrics(game.id);
      const poolInfo = document.createElement("p");
      poolInfo.className = "status-text";
      poolInfo.textContent = `Pula: ${metrics.pool}`;

      const tableScroll = document.createElement("div");
      tableScroll.className = "admin-table-scroll";
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
      wrapper.append(title, poolInfo, tableScroll);
      summariesContainer.appendChild(wrapper);
    });
  };

  const renderStatsTable = () => {
    statsBody.innerHTML = "";
    const games = getGamesForSelectedYear();
    const gameCount = games.length;
    const totalPool = games.reduce((sum, game) => sum + getGameSummaryMetrics(game.id).pool, 0);

    const rows = [
      ["Liczba gier", String(gameCount)],
      ["Łączna pula", String(totalPool)]
    ];

    rows.forEach(([label, value]) => {
      const tr = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = label;
      const valueCell = document.createElement("td");
      valueCell.textContent = value;
      tr.append(labelCell, valueCell);
      statsBody.appendChild(tr);
    });
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
        input.value = row[key] ?? "";
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
      profitCell.textContent = String(parseIntegerOrZero(row.entryFee) + parseIntegerOrZero(row.rebuy) - parseIntegerOrZero(row.payout));

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
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
      status.textContent = `Dodano grę \"${name}\" z datą ${gameDate}.`;
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
  if (modalCloseFooter) {
    modalCloseFooter.addEventListener("click", closeModal);
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

  registerAdminRefreshHandler("adminGamesTab", async () => {});
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

const initInstructionModal = () => {
  const openButton = document.querySelector("#adminInstructionButton");
  const modal = document.querySelector("#instructionModal");
  const closeButton = document.querySelector("#instructionClose");
  const closeFooterButton = document.querySelector("#instructionCloseFooter");
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

  if (closeFooterButton) {
    closeFooterButton.addEventListener("click", closeModal);
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
  initAdminTables();
  initAdminGames();
  initAdminPlayers();
  initPinGate();
  initLatestMessage();
  initInstructionModal();
};

void bootstrap();
