const PIN_LENGTH = 5;
const PIN_STORAGE_KEY = "nextGamePinVerified";
let currentPin = "12345";

const TABLES_COLLECTION = "Tables";
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

const getPinGateState = () => sessionStorage.getItem(PIN_STORAGE_KEY) === "1";

const setPinGateState = (isVerified) => {
  sessionStorage.setItem(PIN_STORAGE_KEY, isVerified ? "1" : "0");
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

const loadPinFromFirestore = async () => {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return;
  }

  try {
    const snapshot = await firebaseApp.firestore().collection("app_settings").doc("next_game").get();
    const data = snapshot.data();
    if (data && typeof data.pin === "string" && data.pin.trim()) {
      currentPin = data.pin.trim();
    }
  } catch (error) {
    // Silent fail: use fallback PIN.
  }
};

const initAdminPin = () => {
  const input = document.querySelector("#adminPinInput");
  const saveButton = document.querySelector("#adminPinSave");
  const randomButton = document.querySelector("#adminPinRandom");
  const status = document.querySelector("#adminPinStatus");

  if (!input || !saveButton || !randomButton || !status) {
    return;
  }

  input.value = currentPin;
  input.addEventListener("input", () => {
    input.value = sanitizePin(input.value);
  });

  const generateRandomPin = () =>
    Math.floor(Math.random() * Math.pow(10, PIN_LENGTH))
      .toString()
      .padStart(PIN_LENGTH, "0");

  randomButton.addEventListener("click", () => {
    const generatedPin = generateRandomPin();
    input.value = generatedPin;
    status.textContent = "Wylosowano PIN. Kliknij „Zapisz PIN”, aby go utrwalić.";
  });

  const firebaseApp = getFirebaseApp();

  if (!firebaseApp) {
    saveButton.disabled = true;
    status.textContent = "Uzupełnij konfigurację Firebase, aby zapisać PIN.";
    return;
  }

  saveButton.addEventListener("click", async () => {
    const pinValue = sanitizePin(input.value);

    if (!isPinValid(pinValue)) {
      status.textContent = "PIN musi mieć dokładnie 5 cyfr.";
      return;
    }

    saveButton.disabled = true;
    status.textContent = "Zapisywanie PIN...";

    try {
      await firebaseApp.firestore().collection("app_settings").doc("next_game").set({ pin: pinValue });
      currentPin = pinValue;
      status.textContent = "PIN zapisany.";
    } catch (error) {
      status.textContent = "Nie udało się zapisać PIN. Sprawdź konfigurację.";
    } finally {
      saveButton.disabled = false;
    }
  });
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

    if (pinValue === currentPin) {
      setPinGateState(true);
      status.textContent = "PIN poprawny. Otwieranie...";
      updatePinVisibility({ isAdmin });
    } else {
      status.textContent = "Niepoprawny PIN. Spróbuj ponownie.";
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
      const tableRef = db.collection(TABLES_COLLECTION).doc(tableId);
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
          db.collection(TABLES_COLLECTION).doc(table.id).update({ gameType: value });
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
          db.collection(TABLES_COLLECTION).doc(table.id).update({ gameDate: value });
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
          db.collection(TABLES_COLLECTION).doc(table.id).update({ name: value });
        });
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "secondary";
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
              db.collection(TABLES_COLLECTION)
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
        rowDeleteButton.className = "secondary admin-row-delete";
        rowDeleteButton.textContent = "Usuń";
        rowDeleteButton.addEventListener("click", () => {
          db.collection(TABLES_COLLECTION)
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
        await db.collection(TABLES_COLLECTION).doc(table.id).collection(TABLE_ROWS_COLLECTION).add({
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

  db.collection(TABLES_COLLECTION)
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
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
          .collection(TABLES_COLLECTION)
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
    });

  addButton.addEventListener("click", async () => {
    addButton.disabled = true;
    status.textContent = "Dodawanie stołu...";

    try {
      const nextName = getNextTableName(adminTablesState.tableList);
      await db.collection(TABLES_COLLECTION).add({
        name: nextName,
        gameType: DEFAULT_TABLE_META.gameType,
        gameDate: DEFAULT_TABLE_META.gameDate,
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp()
      });
      status.textContent = "Stół dodany.";
    } catch (error) {
      status.textContent = "Nie udało się dodać stołu.";
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
  initUserTabs();
  await loadPinFromFirestore();
  initAdminMessaging();
  initAdminPin();
  initAdminTables();
  initPinGate({ isAdmin });
  initLatestMessage();
  initInstructionModal();
};

void bootstrap();
