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
const TABLES_COLLECTION_CONFIG_KEY = "tablesCollection";
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

const updatePinVisibility = ({ isAdmin }) => {
  const gate = document.querySelector("#nextGamePinGate");
  const content = document.querySelector("#nextGameContent");
  if (!gate || !content) {
    return;
  }

  const isVerified = isAdmin || getPinGateState();
  gate.style.display = isVerified ? "none" : "block";
  content.classList.toggle("is-visible", isVerified);
};

const initPinGate = ({ isAdmin }) => {
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
      updatePinVisibility({ isAdmin });
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

  updatePinVisibility({ isAdmin });
};

const initUserTabs = ({ isAdmin }) => {
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
      updatePinVisibility({ isAdmin });
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
    body.innerHTML = "";
    adminPlayersState.players.forEach((player) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "admin-input";
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

      row.appendChild(nameCell);
      row.appendChild(pinCell);
      row.appendChild(permissionsCell);
      row.appendChild(actionsCell);
      body.appendChild(row);
    });
  };

  addButton.addEventListener("click", async () => {
    adminPlayersState.players.push({
      id: `player-${Date.now()}`,
      name: "",
      pin: "",
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
    list.innerHTML = "";

    adminTablesState.tableList.forEach((table) => {
      const tableCard = document.createElement("div");
      tableCard.className = "admin-table-card";

      const metaRow = document.createElement("div");
      metaRow.className = "admin-table-meta";

      const gameTypeInput = document.createElement("input");
      gameTypeInput.type = "text";
      gameTypeInput.className = "admin-input";
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
  const refreshButton = document.querySelector("#instructionRefresh");
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

  const loadInstruction = async ({ force } = { force: false }) => {
    if (isLoading) {
      return;
    }

    if (cachedText && !force) {
      return;
    }

    isLoading = true;
    setStatus("Pobieranie instrukcji...");

    try {
      const response = await fetch(instructionUrl, { cache: force ? "no-store" : "default" });
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      cachedText = await response.text();
      content.textContent = cachedText;
      setStatus("Instrukcja została pobrana.");
    } catch (error) {
      setStatus("Nie udało się pobrać instrukcji. Spróbuj ponownie.");
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

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      void loadInstruction({ force: true });
    });
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
  initUserTabs({ isAdmin });
  initAdminMessaging();
  initAdminTables();
  initAdminPlayers();
  initPinGate({ isAdmin });
  initLatestMessage();
  initInstructionModal();
};

void bootstrap();
