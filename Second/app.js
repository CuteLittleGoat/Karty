// Szerokości kolumn tabel — tokeny z Second/styles.css (:root --col-*).
// Kolumny deklaruje <colgroup>, a --table-min pilnuje minimum całej tabeli.
const COL = {
  xs: "var(--col-num-xs)",
  sm: "var(--col-num-sm)",
  md: "var(--col-num-md)",
  flag: "var(--col-flag)",
  date: "var(--col-date)",
  tsm: "var(--col-text-sm)",
  tmd: "var(--col-text-md)",
  tlg: "var(--col-text-lg)",
  act: "var(--col-actions)",
};

// Jedna kolumna tekstowa dostaje szerokość auto, żeby to ona wchłaniała
// nadmiar miejsca w szerokim panelu zamiast rozdymania wszystkich kolumn.
const tCols = (tokens, mode = "t-fluid") => {
  const flexIndex =
    mode === "t-fluid"
      ? tokens.indexOf("tlg") >= 0
        ? tokens.indexOf("tlg")
        : tokens.indexOf("tmd")
      : -1;
  const cols = tokens
    .map((token, index) => (index === flexIndex ? "<col>" : `<col style="width: ${COL[token]}">`))
    .join("");
  return `<colgroup>${cols}</colgroup>`;
};

// Tabele o zmiennej liczbie kolumn: stałe tokeny na początku i końcu,
// a środek wypełniamy tokenem `fill` tyle razy, ile kolumn wyszło z nagłówka.
const tColsAuto = (headerHtml, lead, trail, fill = "sm") => {
  const count = (headerHtml.match(/<th/g) || []).length;
  const middle = Math.max(0, count - lead.length - trail.length);
  return lead.concat(new Array(middle).fill(fill)).concat(trail);
};

// Na ekranach do 560 px listy tylko do odczytu prezentujemy jako karty
// „etykieta → wartość” (CSS: .is-table-stacked). Etykiety uzupełniamy
// z nagłówka tabeli, żeby nie powielać ich w każdej komórce.
const applyStackedLayout = (root) => {
  if (!root) return;
  root.querySelectorAll("table.admin-data-table.t-fluid").forEach((table) => {
    // Szerokie siatki liczbowe czyta się lepiej jako tabelę z przewijaniem.
    if (table.classList.contains("tournament-pool-table16")) return;
    const labels = Array.from(table.querySelectorAll("thead th")).map((cell) => cell.textContent.trim());
    if (!labels.length) return;
    table.classList.add("is-table-stacked");
    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.hasAttribute("colspan")) return;
        if (labels[index]) cell.setAttribute("data-label", labels[index]);
      });
    });
  });
};

const watchStackedLayout = (root) => {
  if (!root || root.dataset.stackedWatched === "1") return;
  root.dataset.stackedWatched = "1";
  new MutationObserver(() => applyStackedLayout(root)).observe(root, { childList: true, subtree: true });
  applyStackedLayout(root);
};

const tAttr = (tokens, mode = "t-fluid", extraClass = "") => {
  const cls = `admin-data-table ${mode}${extraClass ? " " + extraClass : ""}`;
  return `class="${cls}" style="--table-min: calc(${tokens.map((token) => COL[token]).join(" + ")})"`;
};

const LAST_DOCUMENT_DELETE_ERROR_CODE = "LAST_DOCUMENT_DELETE_BLOCKED";

const createLastDocumentDeleteError = () => {
  const error = new Error("Nie można usunąć ostatniego dokumentu z kolekcji.");
  error.code = LAST_DOCUMENT_DELETE_ERROR_CODE;
  return error;
};

const notifyLastDocumentDeleteBlocked = () => {
  window.alert("Nie można usunąć ostatniego dokumentu z kolekcji. Dodaj nowy rekord przed usunięciem obecnego.");
};

const isCollectionProtectedAgainstFullDeletion = (collectionRef) => {
  const collectionPath = collectionRef?.path;
  if (typeof collectionPath !== "string" || !collectionPath.trim()) {
    return false;
  }

  return !collectionPath.includes("/");
};

const isRemovingLastDocument = async ({ collectionRef, candidateDocRefs }) => {
  if (!collectionRef || !Array.isArray(candidateDocRefs) || !candidateDocRefs.length) {
    return false;
  }

  if (!isCollectionProtectedAgainstFullDeletion(collectionRef)) {
    return false;
  }

  const uniqueRefs = [];
  const uniqueKeys = new Set();
  candidateDocRefs.forEach((docRef) => {
    if (!docRef?.id) {
      return;
    }
    const key = `${docRef.parent?.path ?? ""}/${docRef.id}`;
    if (uniqueKeys.has(key)) {
      return;
    }
    uniqueKeys.add(key);
    uniqueRefs.push(docRef);
  });

  if (!uniqueRefs.length) {
    return false;
  }

  const probeSnapshot = await collectionRef.limit(uniqueRefs.length + 1).get();
  if (probeSnapshot.empty || probeSnapshot.size > uniqueRefs.length) {
    return false;
  }

  const sampledIds = new Set(probeSnapshot.docs.map((doc) => doc.id));
  const deletionsInSample = uniqueRefs.filter((docRef) => sampledIds.has(docRef.id));
  return deletionsInSample.length === probeSnapshot.size;
};

const installFirestoreDeleteProtection = (firebaseApp) => {
  if (!firebaseApp?.firestore || firebaseApp.__kartyDeleteProtectionInstalled) {
    return;
  }

  const db = firebaseApp.firestore();
  const testDocRef = db.collection("__karty_delete_protection__").doc("__guard__");

  const documentReferencePrototype = Object.getPrototypeOf(testDocRef);
  if (documentReferencePrototype && typeof documentReferencePrototype.delete === "function" && !documentReferencePrototype.__kartyDeleteProtectionPatched) {
    const originalDelete = documentReferencePrototype.delete;
    documentReferencePrototype.delete = async function patchedDelete(...args) {
      const shouldBlock = await isRemovingLastDocument({
        collectionRef: this.parent,
        candidateDocRefs: [this]
      });

      if (shouldBlock) {
        notifyLastDocumentDeleteBlocked();
        throw createLastDocumentDeleteError();
      }

      return originalDelete.apply(this, args);
    };
    documentReferencePrototype.__kartyDeleteProtectionPatched = true;
  }

  const writeBatchPrototype = Object.getPrototypeOf(db.batch());
  if (writeBatchPrototype && typeof writeBatchPrototype.delete === "function" && typeof writeBatchPrototype.commit === "function" && !writeBatchPrototype.__kartyDeleteProtectionPatched) {
    const originalBatchDelete = writeBatchPrototype.delete;
    const originalBatchCommit = writeBatchPrototype.commit;

    writeBatchPrototype.delete = function patchedBatchDelete(docRef, ...args) {
      if (!this.__kartyPendingDeleteRefs) {
        this.__kartyPendingDeleteRefs = [];
      }
      this.__kartyPendingDeleteRefs.push(docRef);
      return originalBatchDelete.call(this, docRef, ...args);
    };

    writeBatchPrototype.commit = async function patchedBatchCommit(...args) {
      const pendingDeleteRefs = Array.isArray(this.__kartyPendingDeleteRefs) ? this.__kartyPendingDeleteRefs : [];

      if (pendingDeleteRefs.length) {
        const refsByCollectionPath = new Map();
        pendingDeleteRefs.forEach((docRef) => {
          if (!docRef?.parent?.path) {
            return;
          }
          if (!isCollectionProtectedAgainstFullDeletion(docRef.parent)) {
            return;
          }
          if (!refsByCollectionPath.has(docRef.parent.path)) {
            refsByCollectionPath.set(docRef.parent.path, {
              collectionRef: docRef.parent,
              docRefs: []
            });
          }
          refsByCollectionPath.get(docRef.parent.path).docRefs.push(docRef);
        });

        for (const { collectionRef, docRefs } of refsByCollectionPath.values()) {
          const shouldBlock = await isRemovingLastDocument({ collectionRef, candidateDocRefs: docRefs });
          if (shouldBlock) {
            notifyLastDocumentDeleteBlocked();
            throw createLastDocumentDeleteError();
          }
        }
      }

      this.__kartyPendingDeleteRefs = [];
      return originalBatchCommit.apply(this, args);
    };

    writeBatchPrototype.__kartyDeleteProtectionPatched = true;
  }

  firebaseApp.__kartyDeleteProtectionInstalled = true;
};

const readAppCheckConfigKey = (fieldName) => (typeof window.firebaseConfig?.[fieldName] === "string"
  ? window.firebaseConfig[fieldName].trim()
  : "");

const activateAppCheckIfConfigured = (firebase) => {
  const enterpriseSiteKey = readAppCheckConfigKey("appCheckEnterpriseSiteKey");
  const siteKey = enterpriseSiteKey || readAppCheckConfigKey("appCheckSiteKey");

  if (!siteKey || firebase.__kartyAppCheckActivated || typeof firebase.appCheck !== "function") {
    return;
  }

  const AppCheckProvider = enterpriseSiteKey
    ? firebase.appCheck.ReCaptchaEnterpriseProvider
    : firebase.appCheck.ReCaptchaV3Provider;

  if (typeof AppCheckProvider !== "function") {
    console.error("Nie udało się włączyć App Check: brak dostawcy reCAPTCHA w SDK Firebase.");
    return;
  }

  try {
    const debugToken = window.firebaseConfig?.appCheckDebugToken;
    if (debugToken === true) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    } else if (typeof debugToken === "string" && debugToken.trim()) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken.trim();
    }
    firebase.appCheck().activate(new AppCheckProvider(siteKey), true);
    firebase.__kartyAppCheckActivated = true;
  } catch (error) {
    console.error("Nie udało się włączyć App Check.", error);
  }
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

  activateAppCheckIfConfigured(window.firebase);
  installFirestoreDeleteProtection(window.firebase);

  return window.firebase;
};

const ADMIN_SECURITY_COLLECTION = "admin_security";
const ADMIN_SECURITY_DOCUMENT = "credentials";
const ADMIN_SECURITY_PASSWORD_FIELD = "passwordHash";
const ADMIN_NOTES_COLLECTION = "admin_notes";
const SECOND_ADMIN_NOTES_DOCUMENT = "second";
const SECOND_ADMIN_MESSAGES_COLLECTION = "second_admin_messages";
const SECOND_ADMIN_MESSAGES_DOCUMENT = "admin_messages";
const SECOND_APP_SETTINGS_COLLECTION = "second_app_settings";
const RULES_DOCUMENT = "rules";
const SECOND_TOURNAMENT_COLLECTION = "second_tournament";
const SECOND_TOURNAMENT_DOCUMENT = "state";
const SECOND_USER_PIN_STORAGE_KEY = "secondUserPinVerified";
const SECOND_USER_PLAYER_STORAGE_KEY = "secondUserPlayerId";

const shouldRequestAdminAccess = () => new URLSearchParams(window.location.search).get("admin") === "1";

const TEMPORARILY_DISABLE_ADMIN_PASSWORD = false;

const getAdminPasswordHash = async () => {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp?.firestore) {
    throw new Error("FIREBASE_UNAVAILABLE");
  }

  const db = firebaseApp.firestore();
  const snapshot = await db
    .collection(ADMIN_SECURITY_COLLECTION)
    .doc(ADMIN_SECURITY_DOCUMENT)
    .get();

  const storedHash = snapshot.get(ADMIN_SECURITY_PASSWORD_FIELD);
  if (typeof storedHash !== "string" || !storedHash.trim()) {
    throw new Error("PASSWORD_NOT_CONFIGURED");
  }

  return storedHash.trim();
};

const getSha256Hex = async (value) => {
  if (!window.crypto?.subtle || typeof window.TextEncoder !== "function") {
    return "";
  }
  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const isAdminPasswordValid = async (candidatePassword, storedHash) => {
  if (candidatePassword === storedHash) {
    return true;
  }
  const sha256Hex = await getSha256Hex(candidatePassword);
  if (!sha256Hex) {
    return false;
  }
  return sha256Hex === storedHash.toLowerCase();
};

const requestAdminPassword = ({ errorMessage = "" } = {}) => new Promise((resolve) => {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(4, 9, 22, 0.82)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "20px";
  overlay.style.zIndex = "9999";

  const dialog = document.createElement("div");
  dialog.style.width = "min(460px, 100%)";
  dialog.style.background = "#1f2430";
  dialog.style.border = "1px solid rgba(255, 255, 255, 0.16)";
  dialog.style.borderRadius = "16px";
  dialog.style.padding = "20px";
  dialog.style.boxSizing = "border-box";

  const title = document.createElement("h2");
  title.textContent = "Tryb administratora";
  title.style.margin = "0 0 12px";
  title.style.color = "#ffffff";
  title.style.fontSize = "1.2rem";

  const description = document.createElement("p");
  description.textContent = "Podaj hasło administratora, aby otworzyć panel.";
  description.style.margin = "0 0 14px";
  description.style.color = "rgba(255, 255, 255, 0.84)";

  const input = document.createElement("input");
  input.type = "password";
  input.placeholder = "Hasło administratora";
  input.autocomplete = "current-password";
  input.dataset.focusTarget = "true";
  input.dataset.section = "admin-auth";
  input.dataset.columnKey = "password";
  input.style.width = "100%";
  input.style.padding = "11px 12px";
  input.style.borderRadius = "10px";
  input.style.border = "1px solid rgba(255, 255, 255, 0.22)";
  input.style.background = "rgba(8, 12, 22, 0.88)";
  input.style.color = "#ffffff";
  input.style.fontSize = "1rem";
  input.style.boxSizing = "border-box";

  const errorText = document.createElement("p");
  errorText.textContent = errorMessage;
  errorText.style.margin = "10px 0 0";
  errorText.style.minHeight = "1.2em";
  errorText.style.color = "#ff8585";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-end";
  actions.style.gap = "10px";
  actions.style.marginTop = "18px";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Anuluj";
  cancelButton.style.padding = "9px 14px";

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.textContent = "Zaloguj";
  submitButton.style.padding = "9px 14px";

  const cleanup = (value) => {
    document.removeEventListener("keydown", onEscape);
    overlay.remove();
    resolve(value);
  };

  const onEscape = (event) => {
    if (event.key === "Escape") {
      cleanup(null);
    }
  };

  cancelButton.addEventListener("click", () => cleanup(null));
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      cleanup(null);
    }
  });

  submitButton.addEventListener("click", () => {
    const value = input.value.trim();
    if (!value) {
      errorText.textContent = "Pole hasła nie może być puste.";
      input.focus();
      return;
    }
    cleanup(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitButton.click();
    }
  });

  actions.append(cancelButton, submitButton);
  dialog.append(title, description, input, errorText, actions);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.addEventListener("keydown", onEscape);
  input.focus();
});

const resolveAdminMode = async () => {
  if (!shouldRequestAdminAccess()) {
    return false;
  }

  if (TEMPORARILY_DISABLE_ADMIN_PASSWORD) {
    return true;
  }

  const getFallbackCredential = () => {
    const fallbackCredential = typeof window.firebaseConfig?.adminPasswordHash === "string"
      ? window.firebaseConfig.adminPasswordHash.trim()
      : "";
    const fallbackPassword = typeof window.firebaseConfig?.adminPassword === "string"
      ? window.firebaseConfig.adminPassword.trim()
      : "";
    return fallbackCredential || fallbackPassword;
  };

  const loadStoredHash = async () => {
    try {
      return await getAdminPasswordHash();
    } catch (error) {
      return getFallbackCredential();
    }
  };

  let storedHash = await loadStoredHash();
  let modalError = "";

  while (true) {
    const candidatePassword = await requestAdminPassword({ errorMessage: modalError });
    if (candidatePassword === null) {
      return false;
    }

    if (!storedHash) {
      storedHash = await loadStoredHash();
      if (!storedHash) {
        modalError = "Nie udało się odczytać hasła administratora. Sprawdź konfigurację i spróbuj ponownie.";
        continue;
      }
    }

    const isValid = await isAdminPasswordValid(candidatePassword, storedHash);
    if (isValid) {
      return true;
    }

    modalError = "Błędne hasło administratora. Spróbuj ponownie.";
  }
};

const appRoot = document.querySelector("#appRoot");
const adminPasswordBypassNote = document.querySelector("#secondAdminPasswordBypassNote");
const adminRefreshHandlers = new Map();

const registerAdminRefreshHandler = (tabId, handler) => {
  if (!tabId || typeof handler !== "function") {
    return;
  }
  adminRefreshHandlers.set(tabId, handler);
};

const initInstructionModal = () => {
  const openButton = document.querySelector("#secondInstructionButton");
  const modal = document.querySelector("#secondInstructionModal");
  const closeButton = document.querySelector("#secondInstructionClose");
  const content = document.querySelector("#secondInstructionContent");
  const status = document.querySelector("#secondInstructionStatus");

  if (!openButton || !modal || !content || !status) {
    return;
  }

  const instructionUrl = "https://cutelittlegoat.github.io/Karty/Second/docs/README.md";
  let cachedText = "";
  let isLoading = false;

  const setStatus = (message) => {
    status.textContent = message;
  };

  const loadInstruction = async () => {
    if (isLoading || cachedText) {
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

const setupTabs = ({ container, buttonSelector, panelSelector, activeClass = "is-active", getTarget, isPanelMatch }) => {
  const buttons = Array.from(container.querySelectorAll(buttonSelector));
  const panels = Array.from(container.querySelectorAll(panelSelector));

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = getTarget(button);

      buttons.forEach((item) => item.classList.toggle(activeClass, item === button));
      panels.forEach((panel) => panel.classList.toggle(activeClass, isPanelMatch(panel, target)));
    });
  });
};

const initSecondPlayerPermissionsModal = ({
  onSave
}) => {
  const modal = document.querySelector("#secondPlayerPermissionsModal");
  const closeButton = document.querySelector("#secondPlayerPermissionsClose");
  const list = document.querySelector("#secondPlayerPermissionsList");
  const status = document.querySelector("#secondPlayerPermissionsStatus");

  if (!modal || !closeButton || !list || !status || typeof onSave !== "function") {
    return {
      open: () => {}
    };
  }

  let editingPlayerId = "";

  const closeModal = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    editingPlayerId = "";
  };

  const renderList = ({ playerId, getPermissions, setPermissions }) => {
    const selectedPermissions = new Set(normalizeTournamentPermissions(getPermissions(playerId)));
    list.innerHTML = "";
    status.textContent = "";

    SECOND_AVAILABLE_PLAYER_PERMISSIONS.forEach((permission) => {
      const label = document.createElement("label");
      label.className = "permissions-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = selectedPermissions.has(permission.label);
      checkbox.addEventListener("change", async () => {
        if (!editingPlayerId) {
          return;
        }

        const nextPermissions = new Set(normalizeTournamentPermissions(getPermissions(editingPlayerId)));
        if (checkbox.checked) {
          nextPermissions.add(permission.label);
        } else {
          nextPermissions.delete(permission.label);
        }

        setPermissions(editingPlayerId, Array.from(nextPermissions));
        await onSave();
      });

      const text = document.createElement("span");
      text.textContent = permission.label;

      label.append(checkbox, text);
      list.appendChild(label);
    });
  };

  const open = ({ playerId, getPermissions, setPermissions }) => {
    editingPlayerId = playerId;
    renderList({ playerId, getPermissions, setPermissions });
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

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

  return {
    open
  };
};

const setupTournamentButtons = (container) => {
  const buttonGroups = container.querySelectorAll(".admin-games-years-list");

  buttonGroups.forEach((group) => {
    const buttons = Array.from(group.querySelectorAll("[data-tournament-target]"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      });
    });
  });
};

const createTournamentDefaultState = () => ({
  organizer: "",
  buyIn: "",
  rebuyAddOn: "",
  rake: "",
  stack: "",
  rebuyStack: "",
  players: [],
  tables: [],
  assignments: {},
  tableEntries: {},
  payments: {
    table10: { buyIn: "", rebuyAddOn: "", sum: "", rebuyCount: "" },
    table11: { percent: "", rake: "", buyIn: "", rebuyAddOn: "", pot: "" },
    table12Rebuys: {}
  },
  pool: {
    splits: [{ id: crypto.randomUUID(), split: "" }],
    mods: [{ id: crypto.randomUUID(), modR5: "", mod1: "", mod2: "", mod3: "" }],
    rebuyCells: {}
  },
  group: {
    playerStacks: {},
    eliminated: {},
    eliminatedOrder: [],
    eliminatedWins: {},
    survivorStacks: {}
  },
  semi: {
    tables: [],
    assignments: {},
    customTables: [],
    eliminatedOrder: []
  },
  final: {
    eliminated: {},
    eliminatedOrder: []
  },
  finalPlayers: [],
  payouts: {
    showInitial: false,
    showFinal: false
  },
  readonlyTables: {
    generatedAt: "",
    rTournamentState: null
  }
});

const asArray = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

const normalizeTournamentState = (value) => {
  const state = {
    ...createTournamentDefaultState(),
    ...(value && typeof value === "object" ? value : {})
  };
  state.players = asArray(state.players);
  state.tables = asArray(state.tables);
  state.assignments = asObject(state.assignments);
  state.tableEntries = asObject(state.tableEntries);
  state.payments = asObject(state.payments);
  state.pool = asObject(state.pool);
  state.group = asObject(state.group);
  state.semi = asObject(state.semi);
  state.final = asObject(state.final);
  state.payouts = asObject(state.payouts);
  state.readonlyTables = asObject(state.readonlyTables);
  if (!Array.isArray(state.pool?.splits) || !state.pool.splits.length) {
    state.pool = state.pool || {};
    state.pool.splits = [{ id: crypto.randomUUID(), buyIn: "", split: "" }];
  }
  if (!Array.isArray(state.pool?.mods) || !state.pool.mods.length) {
    state.pool = state.pool || {};
    state.pool.mods = [{ id: crypto.randomUUID(), modR5: "", mod1: "", mod2: "", mod3: "" }];
  }
  state.pool.mods = state.pool.mods.map((row) => {
    if (row && typeof row === "object") {
      return {
        ...row,
        modR5: row.modR5 ?? "",
        mod1: row.mod1 ?? row.mod ?? "",
        mod2: row.mod2 ?? "",
        mod3: row.mod3 ?? ""
      };
    }
    return { id: crypto.randomUUID(), split: "", modR5: "", mod1: "", mod2: "", mod3: "" };
  });
  state.group = state.group || {};
  state.group.playerStacks = state.group.playerStacks || {};
  state.group.eliminated = state.group.eliminated || {};
  state.group.eliminatedOrder = Array.isArray(state.group.eliminatedOrder) ? state.group.eliminatedOrder.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];
  state.group.eliminatedWins = state.group.eliminatedWins || {};
  state.group.survivorStacks = state.group.survivorStacks || {};
  state.semi = state.semi || {};
  state.semi.assignments = state.semi.assignments || {};
  state.semi.customTables = Array.isArray(state.semi.customTables) ? state.semi.customTables : [];
  state.semi.eliminatedOrder = Array.isArray(state.semi.eliminatedOrder) ? state.semi.eliminatedOrder.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];
  state.final = state.final || {};
  state.final.eliminated = state.final.eliminated || {};
  state.final.eliminatedOrder = Array.isArray(state.final.eliminatedOrder) ? state.final.eliminatedOrder.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];
  state.finalPlayers = asArray(state.finalPlayers);
  /* Ręczne wartości komórek REBUY w Tabeli16. Przy pierwszym odczycie
     przejmujemy z dawnego pola pool.rebuyValues wyłącznie kolumny REBUY31+ —
     wpisy z kolumn 1–30 nie były nigdy wyświetlane ani liczone. */
  if (!state.pool.rebuyCells || typeof state.pool.rebuyCells !== "object" || Array.isArray(state.pool.rebuyCells)) {
    const legacyValues = asObject(state.pool.rebuyValues);
    state.pool.rebuyCells = Object.fromEntries(Object.entries(legacyValues).map(([rowId, cells]) => [
      rowId,
      Object.fromEntries(Object.entries(asObject(cells)).filter(([colKey]) => Number(colKey) >= POOL_AUTO_REBUY_COLUMNS))
    ]));
  }
  state.payouts.showInitial = !!state.payouts.showInitial;
  state.payouts.showFinal = !!state.payouts.showFinal;

  state.payments = state.payments || {};
  state.payments.table12Rebuys = state.payments.table12Rebuys || {};
  Object.keys(state.payments.table12Rebuys).forEach((playerId) => {
    const entry = state.payments.table12Rebuys[playerId] && typeof state.payments.table12Rebuys[playerId] === "object"
      ? state.payments.table12Rebuys[playerId]
      : { values: [] };
    const values = Array.isArray(entry.values) ? entry.values.map((value) => digitsOnly(value)) : [];
    const indexes = Array.isArray(entry.indexes) && entry.indexes.length === values.length
      ? entry.indexes.map((value, index) => {
        const parsed = Number.parseInt(String(value ?? ""), 10);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : index + 1;
      })
      : Array.from({ length: values.length }, (_, index) => index + 1);
    state.payments.table12Rebuys[playerId] = { values, indexes };
  });
  state.readonlyTables.generatedAt = typeof state.readonlyTables.generatedAt === "string" ? state.readonlyTables.generatedAt : "";
  state.readonlyTables.rTournamentState = state.readonlyTables.rTournamentState && typeof state.readonlyTables.rTournamentState === "object"
    ? state.readonlyTables.rTournamentState
    : null;
  return state;
};

const buildTournamentReadonlyCopies = (sourceState) => {
  const normalized = normalizeTournamentState(sourceState);
  const rawCopy = JSON.parse(JSON.stringify({
    organizer: normalized.organizer,
    buyIn: normalized.buyIn,
    rebuyAddOn: normalized.rebuyAddOn,
    rake: normalized.rake,
    stack: normalized.stack,
    rebuyStack: normalized.rebuyStack,
    players: normalized.players,
    tables: normalized.tables,
    assignments: normalized.assignments,
    tableEntries: normalized.tableEntries,
    payments: normalized.payments,
    pool: normalized.pool,
    group: normalized.group,
    semi: normalized.semi,
    final: normalized.final,
    finalPlayers: normalized.finalPlayers,
    payouts: normalized.payouts
  }));
  return {
    generatedAt: new Date().toISOString(),
    rTournamentState: rawCopy,
    rTABELA10: rawCopy.payments?.table10 || {},
    rTABELA11: rawCopy.payments?.table11 || {},
    rTABELA12: rawCopy.payments?.table12Rebuys || {},
    rTABELA13: rawCopy.payments?.table10 || {},
    rTABELA14: rawCopy.payments?.table11 || {},
    rTABELA15: {
      buyIn: rawCopy.payments?.table11?.buyIn || "0",
      split: ""
    },
    rTABELA16: rawCopy.pool?.mods || [],
    rTABELA17: {
      stack: rawCopy.stack || "0",
      rebuyAddOnStack: rawCopy.rebuyStack || "0"
    },
    rTABELA18: rawCopy.tables || [],
    rTABELA19: rawCopy.group?.playerStacks || {},
    rTABELA19A: rawCopy.group?.eliminatedOrder || [],
    rTABELA19B: rawCopy.group?.survivorStacks || {},
    rTABELA21: rawCopy.semi?.assignments || {},
    rTABELA22: rawCopy.semi?.customTables || [],
    rTABELA22A: rawCopy.semi?.eliminatedOrder || [],
    rTABELA23: rawCopy.finalPlayers || [],
    rTABELA23A: rawCopy.final?.eliminatedOrder || []
  };
};

const syncOrderedPlayerIds = (orderedIds, rows, getPlayerId = (row) => row?.playerId ?? row?.id) => {
  const normalizedOrder = Array.isArray(orderedIds) ? orderedIds.map((playerId) => String(playerId ?? "").trim()).filter(Boolean) : [];
  const rowMap = new Map(rows.map((row) => [String(getPlayerId(row) ?? "").trim(), row]).filter(([playerId]) => playerId));
  const synced = normalizedOrder.filter((playerId) => rowMap.has(playerId));
  rows.forEach((row) => {
    const playerId = String(getPlayerId(row) ?? "").trim();
    if (playerId && !synced.includes(playerId)) {
      synced.push(playerId);
    }
  });
  return synced;
};

const sortPlayersByStackDesc = (players) => [...players].sort((left, right) => toDigitsNumber(right.stack) - toDigitsNumber(left.stack));

const buildPlacementRowsFromQueues = ({ players, groupRows, semiRows, finalRows, payoutDefaults }) => {
  const totalPlayers = Array.isArray(players) ? players.length : 0;
  const placements = Array.from({ length: totalPlayers }, () => null);
  let nextFromEnd = totalPlayers - 1;

  [groupRows, semiRows, finalRows].forEach((queue) => {
    queue.forEach((row) => {
      if (nextFromEnd < 0) {
        return;
      }
      placements[nextFromEnd] = row;
      nextFromEnd -= 1;
    });
  });

  return placements.map((row, index) => ({
    place: index + 1,
    playerId: row?.playerId || row?.id || "",
    playerName: row?.playerName || row?.name || "-",
    initialWin: String(payoutDefaults[index]?.amount ?? "0"),
    finalWin: String(payoutDefaults[index]?.total ?? "0")
  }));
};

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");
const formatPercentDisplay = (value) => {
  const rawDigits = digitsOnly(value);
  if (!rawDigits) return "";
  return `${rawDigits.replace(/^0+(?=\d)/, "") || "0"}%`;
};
const getPoolDefaultSplitValue = (index) => (index === 0 ? "50" : index === 1 ? "30" : index === 2 ? "20" : "");
/* Tabela16 („Podział puli”) — reguły wspólne dla panelu admina, widoku gracza
   i sekcji „Wypłaty”. Wiersze tabeli to miejsca (LP 1, 2, 3…), a kolumny REBUYn
   to kolejne wpisy rebuy po potrąceniu rake. REBUY1–REBUY30 są automatycznie
   przypisywane do wierszy według POOL_REBUY_ROW_MAPPING (grupy 4, 5, 6, 7, 8). */
const POOL_REBUY_ROW_MAPPING = [
  1, 2, 3, 4,
  1, 2, 3, 4, 5,
  1, 2, 3, 4, 5, 6,
  1, 2, 3, 4, 5, 6, 7,
  1, 2, 3, 4, 5, 6, 7, 8
];
const POOL_AUTO_REBUY_COLUMNS = POOL_REBUY_ROW_MAPPING.length;
const POOL_MOD_KEYS = ["modR5", "mod1", "mod2", "mod3"];

const parsePoolNumber = (value) => {
  const parsed = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

/* Pole MOD przyjmuje liczby ujemne: zostaje minus na początku i same cyfry. */
const signedDigitsOnly = (value) => {
  const text = String(value ?? "").trim();
  const digits = String(value ?? "").replace(/\D/g, "");
  return text.startsWith("-") ? `-${digits}` : digits;
};

/* `null` oznacza wpis skasowany — zapis z `merge: true` nie usuwa kluczy mapy,
   więc usunięcie zapisujemy jako `null` zamiast pomijać klucz. */
const hasPoolRebuyCell = (rowCells, colIdx) => {
  const value = rowCells?.[colIdx];
  return value !== undefined && value !== null;
};

/* Kolumna jest „ręczna”, gdy którykolwiek wiersz ma w niej wpis w
   pool.rebuyCells albo gdy leży poza zakresem auto-przypisania (REBUY31+).
   Ręczna kolumna pokazuje wyłącznie wpisy z pool.rebuyCells. */
const isPoolRebuyColumnManual = (rows, rebuyCells, colIdx) => colIdx >= POOL_AUTO_REBUY_COLUMNS
  || rows.some((row) => hasPoolRebuyCell(rebuyCells?.[row.id], colIdx));

/* Macierz wartości komórek REBUY: [wiersz][kolumna] → tekst. */
const buildPoolRebuyMatrix = (rows, columnValues, rebuyCells) => {
  const manualColumns = columnValues.map((_, colIdx) => isPoolRebuyColumnManual(rows, rebuyCells, colIdx));
  return rows.map((row, rowIdx) => columnValues.map((value, colIdx) => {
    if (manualColumns[colIdx]) {
      const rowCells = rebuyCells?.[row.id];
      return hasPoolRebuyCell(rowCells, colIdx) ? String(rowCells[colIdx]) : "";
    }
    return POOL_REBUY_ROW_MAPPING[colIdx] - 1 === rowIdx ? String(Math.round(value)) : "";
  }));
};

/* Kolumny REBUY1–REBUY30 po ręcznej korekcie, w których suma wierszy różni
   się od wartości danego rebuy (np. skasowano u jednego miejsca, a nie dopisano
   nikomu). */
const getPoolRebuyCorrectionMismatches = (rows, columnValues, rebuyCells, matrix) => {
  const mismatches = [];
  const limit = Math.min(POOL_AUTO_REBUY_COLUMNS, columnValues.length);
  for (let colIdx = 0; colIdx < limit; colIdx += 1) {
    if (!isPoolRebuyColumnManual(rows, rebuyCells, colIdx)) continue;
    const expected = Math.round(columnValues[colIdx]);
    const distributed = Math.round(matrix.reduce((sum, rowValues) => sum + parsePoolNumber(rowValues[colIdx]), 0));
    if (distributed !== expected) {
      mismatches.push({ column: colIdx + 1, distributed, expected });
    }
  }
  return mismatches;
};

/* Układ kolumn MOD: za REBUY5 (gdy rebuy > 5), za REBUY12 (gdy > 12),
   za REBUY20 (gdy > 20) oraz zawsze jedna przed SUMA. Zwraca kolejność komórek
   za kolumną KWOTA; MOD-y są numerowane od lewej (MOD1, MOD2, …). */
const getPoolTable16Columns = (rebuyColumns) => {
  const inline = [];
  if (rebuyColumns > 5) inline.push({ afterColumn: 5, key: "modR5" });
  if (rebuyColumns > 12) inline.push({ afterColumn: 12, key: "mod1" });
  if (rebuyColumns > 20) inline.push({ afterColumn: 20, key: "mod2" });
  const trailingKey = rebuyColumns > 20 ? "mod3" : rebuyColumns > 12 ? "mod2" : "mod1";
  const columns = [];
  let modNumber = 0;
  for (let colIdx = 0; colIdx < rebuyColumns; colIdx += 1) {
    columns.push({ type: "rebuy", colIdx });
    inline.filter((entry) => entry.afterColumn === colIdx + 1).forEach((entry) => {
      modNumber += 1;
      columns.push({ type: "mod", key: entry.key, label: `MOD${modNumber}` });
    });
  }
  modNumber += 1;
  columns.push({ type: "mod", key: trailingKey, label: `MOD${modNumber}` });
  return columns;
};

const getPoolModSum = (row) => POOL_MOD_KEYS.reduce((sum, key) => sum + parsePoolNumber(row?.[key]), 0);

/* Jedno źródło wyliczeń Tabeli16 dla „Podziału puli” i „Wypłat” (panel admina
   i widok gracza). `buyIn` = Tabela14.BUY-IN (po potrąceniu rake).
   Zwraca m.in. `rowSums[i] = { amount: KWOTA, total: SUMA }` dla wiersza i. */
const computePoolTable16 = ({ rows, buyIn, rebuyColumnValues, rebuyCells }) => {
  const splitValues = rows.map((row, idx) => (idx < 3
    ? percentInputToDecimal(getPoolSplitValueForCalculation(row.split, idx))
    : parsePoolNumber(row.split)));
  const sumFrom4th = splitValues.slice(3).reduce((sum, value) => sum + value, 0);
  const table15Split = buyIn - sumFrom4th;
  const matrix = buildPoolRebuyMatrix(rows, rebuyColumnValues, rebuyCells);
  const rowSums = rows.map((row, idx) => {
    const amount = idx < 3 ? (splitValues[idx] || 0) * table15Split : splitValues[idx] || 0;
    const rebuySum = matrix[idx].reduce((sum, value) => sum + parsePoolNumber(value), 0);
    return { amount, total: amount + rebuySum + getPoolModSum(row) };
  });
  return { splitValues, sumFrom4th, table15Split, matrix, rowSums };
};

/* Domyślne wartości kolumn „Początkowa wygrana” (= KWOTA) i „Końcowa wygrana”
   (= SUMA) w Tabeli24 — miejsce N bierze wiersz N Tabeli16. Miejsca bez wiersza
   w Tabeli16 dostają "0" w buildPlacementRowsFromQueues. */
const getPayoutDefaultsFromTable16 = (rowSums) => rowSums.map(({ amount, total }) => ({
  amount: String(Math.round(amount)),
  total: String(Math.round(total))
}));

const getPoolSplitValueForCalculation = (splitValue, index) => {
  const normalizedValue = String(splitValue ?? "").trim();
  return normalizedValue || getPoolDefaultSplitValue(index);
};
const getPoolSplitDisplay = (row, index) => {
  const value = getPoolSplitValueForCalculation(row?.split, index);
  return index < 3 ? formatPercentDisplay(value) : digitsOnly(value);
};
const toDigitsNumber = (value) => Number(digitsOnly(value));
/* Procent wpisany przez użytkownika → ułamek (`10` → `0.1`). Wartości zapisane
   dawniej jako ułamek dziesiętny ≤ 1 (np. `0.5`) są przyjmowane bez zmian. */
const percentInputToDecimal = (value) => {
  const normalized = String(value ?? "").replace(",", ".").trim();
  if (!normalized) return 0;
  if (/^\d+(\.\d+)?$/.test(normalized) && normalized.includes(".")) {
    const parsedLegacy = Number(normalized);
    if (Number.isFinite(parsedLegacy) && parsedLegacy <= 1) {
      return parsedLegacy;
    }
  }
  return toDigitsNumber(normalized) / 100;
};
const getAlternatingTableGroupClass = (rows, getTableKey) => {
  let previousTableKey = Symbol("initial");
  let groupIndex = -1;
  return rows.map((row) => {
    const tableKey = getTableKey(row);
    if (tableKey !== previousTableKey) {
      groupIndex += 1;
      previousTableKey = tableKey;
    }
    return groupIndex % 2 === 0 ? "t-group-stripe-even" : "t-group-stripe-odd";
  });
};

const ensureTable12RebuyEntryShape = (entry) => {
  const target = entry && typeof entry === "object" ? entry : {};
  const values = Array.isArray(target.values) ? target.values.map((value) => digitsOnly(value)) : [];
  const indexes = Array.isArray(target.indexes) && target.indexes.length === values.length
    ? target.indexes.map((value, index) => {
      const parsed = Number.parseInt(String(value ?? ""), 10);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : index + 1;
    })
    : Array.from({ length: values.length }, (_, index) => index + 1);
  target.values = values;
  target.indexes = indexes;
  return target;
};
/* Zwraca wyłącznie etykiety uprawnień, które aplikacja zna
   (SECOND_TOURNAMENT_PERMISSION_MAP). Nieznane wpisy zapisane wcześniej
   w bazie — np. „Czat” — są pomijane przy odczycie i znikają przy zapisie. */
const normalizeTournamentPermissions = (value) => {
  const knownLabels = new Set(Object.values(SECOND_TOURNAMENT_PERMISSION_MAP));
  const items = Array.isArray(value)
    ? value.map((item) => String(item ?? "").trim())
    : typeof value === "string"
      ? value.split(",").map((item) => item.trim())
      : [];
  return Array.from(new Set(items.filter((item) => item && knownLabels.has(item))));
};

const SECOND_AVAILABLE_PLAYER_PERMISSIONS = [
  { key: "draw", label: "Losowanie stołów" },
  { key: "payments", label: "Wpłaty" },
  { key: "pool", label: "Podział Puli" },
  { key: "group", label: "Faza Grupowa" },
  { key: "semi", label: "Półfinał" },
  { key: "final", label: "Finał" },
  { key: "payouts", label: "Wypłaty" }
];

const SECOND_TOURNAMENT_PERMISSION_MAP = {
  draw: "Losowanie stołów",
  payments: "Wpłaty",
  pool: "Podział Puli",
  group: "Faza Grupowa",
  semi: "Półfinał",
  final: "Finał",
  payouts: "Wypłaty"
};

const getSecondUserPinGateState = () => sessionStorage.getItem(SECOND_USER_PIN_STORAGE_KEY) === "1";
const setSecondUserPinGateState = (isVerified) => {
  sessionStorage.setItem(SECOND_USER_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};
const setSecondUserVerifiedPlayerId = (playerId) => {
  const normalized = String(playerId ?? "").trim();
  if (normalized) {
    sessionStorage.setItem(SECOND_USER_PLAYER_STORAGE_KEY, normalized);
    return;
  }
  sessionStorage.removeItem(SECOND_USER_PLAYER_STORAGE_KEY);
};
const getSecondUserVerifiedPlayerId = () => sessionStorage.getItem(SECOND_USER_PLAYER_STORAGE_KEY) || "";
const isSecondPlayerAllowedForTournamentSection = (player, sectionKey) => {
  const permissionLabel = SECOND_TOURNAMENT_PERMISSION_MAP[sectionKey] || "";
  return permissionLabel ? normalizeTournamentPermissions(player?.permissions).includes(permissionLabel) : false;
};

const getTournamentEditableFocusState = (container) => {
  const activeElement = document.activeElement;
  if (!activeElement || !container.contains(activeElement)) {
    return null;
  }

  if (!(activeElement instanceof HTMLInputElement || activeElement instanceof HTMLSelectElement || activeElement instanceof HTMLTextAreaElement)) {
    return null;
  }

  const role = activeElement.dataset?.role;
  if (!role) {
    return null;
  }

  return {
    role,
    playerId: activeElement.dataset.playerId || "",
    tableId: activeElement.dataset.tableId || "",
    id: activeElement.dataset.id || "",
    colIndex: activeElement.dataset.colIndex || "",
    modKey: activeElement.dataset.modKey || "",
    selectionStart: typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
    selectionEnd: typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null
  };
};

const restoreTournamentEditableFocusState = (container, focusState) => {
  if (!focusState) {
    return;
  }

  const candidates = Array.from(container.querySelectorAll(`[data-role="${focusState.role}"]`));
  const target = candidates.find((element) => (element.dataset.playerId || "") === focusState.playerId
    && (element.dataset.tableId || "") === focusState.tableId
    && (element.dataset.id || "") === focusState.id
    && (element.dataset.colIndex || "") === (focusState.colIndex || "")
    && (element.dataset.modKey || "") === (focusState.modKey || ""));

  if (!target) {
    return;
  }

  target.focus();
  if (typeof target.setSelectionRange === "function"
    && typeof focusState.selectionStart === "number"
    && typeof focusState.selectionEnd === "number") {
    const safeStart = Math.min(focusState.selectionStart, target.value.length);
    const safeEnd = Math.min(focusState.selectionEnd, target.value.length);
    target.setSelectionRange(safeStart, safeEnd);
  }
};

const setupAdminTournament = (rootCard) => {
  const container = rootCard.querySelector("#adminTournamentTab");
  const mount = rootCard.querySelector("#adminTournamentRoot");
  if (!container || !mount) return;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    mount.innerHTML = '<p class="builder-info">Brak konfiguracji Firebase.</p>';
    return;
  }

  const db = firebaseApp.firestore();
  const docRef = db.collection(SECOND_TOURNAMENT_COLLECTION).doc(SECOND_TOURNAMENT_DOCUMENT);
  let tournamentState = createTournamentDefaultState();
  let activeSection = "players";
  let tournamentStatusMessage = "";
  let hasActiveEdit = false;
  let pendingLocalWrites = 0;
  let deferredSnapshotState = null;
  let activeTable12RebuyPlayerId = "";
  let table12RebuyActionInProgress = false;
  let table12RebuyModalDraft = null;
  let table12RebuyModalDirty = false;
  let globalRebuyResetInProgress = false;
  /* Ostatnio wyrenderowana macierz REBUY Tabeli16 — potrzebna przy pierwszej
     korekcie w kolumnie, żeby utrwalić bieżący rozkład wszystkich wierszy. */
  let lastPoolRebuyMatrix = null;
  const isTable12RebuyModalEditing = () => Boolean(activeTable12RebuyPlayerId && table12RebuyModalDraft);

  const commitDeferredSnapshotIfSafe = () => {
    if (hasActiveEdit || pendingLocalWrites > 0 || isTable12RebuyModalEditing() || !deferredSnapshotState) {
      return;
    }
    tournamentState = deferredSnapshotState;
    deferredSnapshotState = null;
    tournamentStatusMessage = "";
    render();
  };

  const table12RebuyModal = document.createElement("div");
  table12RebuyModal.className = "modal-overlay";
  table12RebuyModal.setAttribute("aria-hidden", "true");
  table12RebuyModal.innerHTML = `
    <div class="modal-card modal-card-sm modal-card-wide" role="dialog" aria-modal="true" aria-labelledby="secondTable12RebuyTitle">
      <div class="modal-header">
        <h3 id="secondTable12RebuyTitle">Rebuy gracza</h3>
        <button type="button" class="icon-button" data-game-rebuy-close aria-label="Zamknij okno">×</button>
      </div>
      <div class="modal-body">
        <p class="builder-info" data-table12-rebuy-status hidden></p>
        <div class="admin-table-scroll">
          <table class="admin-data-table t-compact" id="adminCalculatorRebuyTable" data-game-rebuy-table></table>
        </div>
        <div class="admin-table-actions" data-game-rebuy-actions></div>
      </div>
    </div>`;
  document.body.appendChild(table12RebuyModal);
  const table12RebuyModalTable = table12RebuyModal.querySelector("[data-game-rebuy-table]");
  const table12RebuyModalActions = table12RebuyModal.querySelector("[data-game-rebuy-actions]");
  const table12RebuyModalClose = table12RebuyModal.querySelector("[data-game-rebuy-close]");
  const table12RebuyModalStatus = table12RebuyModal.querySelector("[data-table12-rebuy-status]");

  const setTable12RebuyModalStatus = (message) => {
    if (!table12RebuyModalStatus) {
      return;
    }
    const normalizedMessage = String(message || "").trim();
    table12RebuyModalStatus.textContent = normalizedMessage;
    table12RebuyModalStatus.hidden = !normalizedMessage;
  };

  const getFirebaseErrorDetails = (error) => {
    if (!error) {
      return "Brak szczegółów błędu.";
    }
    const parts = [];
    if (typeof error.code === "string" && error.code.trim()) {
      parts.push(`kod: ${error.code.trim()}`);
    }
    if (typeof error.message === "string" && error.message.trim()) {
      parts.push(`opis: ${error.message.trim()}`);
    }
    return parts.join(" | ") || "Brak szczegółów błędu.";
  };

  const syncTable12RebuyDraftToState = () => {
    if (!activeTable12RebuyPlayerId || !table12RebuyModalDraft) {
      return;
    }
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = {
      values: [...table12RebuyModalDraft.values],
      indexes: [...table12RebuyModalDraft.indexes]
    };
  };

  const persistTable12RebuyChanges = async (operationLabel = "zapis", options = {}) => {
    if (!activeTable12RebuyPlayerId) {
      setTable12RebuyModalStatus("Nie można zapisać zmian: brak wskazanego gracza.");
      return false;
    }
    syncTable12RebuyDraftToState();
    pendingLocalWrites += 1;
    try {
      const saved = await saveState(options);
      if (!saved) {
        const reason = getFirebaseErrorDetails(saveState.lastError);
        setTable12RebuyModalStatus(`Nie udało się wykonać operacji \"${operationLabel}\". ${reason}`);
        return false;
      }
      setTable12RebuyModalStatus("");
      return true;
    } finally {
      pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
      commitDeferredSnapshotIfSafe();
    }
  };

  const closeTable12RebuyModal = async () => {
    if (table12RebuyActionInProgress) {
      setTable12RebuyModalStatus("Trwa zapisywanie zmian rebuy. Poczekaj na zakończenie operacji.");
      return;
    }

    if (activeTable12RebuyPlayerId && table12RebuyModalDirty) {
      table12RebuyActionInProgress = true;
      renderTable12RebuyModal();
      const saved = await persistTable12RebuyChanges("Zamknięcie modalu Rebuy");
      table12RebuyActionInProgress = false;
      if (!saved) {
        renderTable12RebuyModal();
        return;
      }
      table12RebuyModalDirty = false;
      render();
    }

    activeTable12RebuyPlayerId = "";
    table12RebuyModalDraft = null;
    table12RebuyModalDirty = false;
    setTable12RebuyModalStatus("");
    table12RebuyModal.classList.remove("is-visible");
    table12RebuyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const renderTable12RebuyModal = () => {
    if (!table12RebuyModalTable || !table12RebuyModalActions || !activeTable12RebuyPlayerId) return;
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    if (!table12RebuyModalDraft) {
      const persistedState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      table12RebuyModalDraft = {
        values: [...persistedState.values],
        indexes: [...persistedState.indexes]
      };
    }
    const rebuyState = table12RebuyModalDraft;

    let headerHtml = "<thead><tr>";
    rebuyState.indexes.forEach((columnIndex) => {
      headerHtml += `<th>Rebuy${columnIndex}</th>`;
    });
    headerHtml += "</tr></thead>";
    table12RebuyModalTable.innerHTML = headerHtml;

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    rebuyState.values.forEach((value, index) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "admin-input";
      input.type = "tel";
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";
      input.value = value;
      input.dataset.focusTarget = "second-table12-rebuy-modal";
      input.dataset.section = "table12-rebuy-modal";
      input.dataset.tableId = activeTable12RebuyPlayerId;
      input.dataset.columnKey = `rebuy${index}`;
      input.addEventListener("input", () => {
        rebuyState.values[index] = digitsOnly(input.value);
        input.value = rebuyState.values[index];
        table12RebuyModalDirty = true;
        syncTable12RebuyDraftToState();
        render();
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
    table12RebuyModalTable.appendChild(tbody);

    table12RebuyModalActions.innerHTML = "";
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "secondary";
    addButton.textContent = "Dodaj Rebuy";
    addButton.disabled = table12RebuyActionInProgress;
    addButton.addEventListener("click", async () => {
      if (table12RebuyActionInProgress) {
        setTable12RebuyModalStatus("Operacja jest już wykonywana. Poczekaj na zakończenie poprzedniego zapisu.");
        return;
      }
      table12RebuyActionInProgress = true;
      renderTable12RebuyModal();
      let appended = false;
      let activeRebuyState = null;
      try {
        activeRebuyState = rebuyState;
        const nextIndex = getNextGlobalTable12RebuyIndex();
        activeRebuyState.values.push("");
        activeRebuyState.indexes.push(nextIndex);
        table12RebuyModalDirty = true;
        syncTable12RebuyDraftToState();
        appended = true;
        render();
        renderTable12RebuyModal();
      } catch (error) {
        if (appended && activeRebuyState) {
          activeRebuyState.values.pop();
          activeRebuyState.indexes.pop();
        }
        setTable12RebuyModalStatus(`Wystąpił nieoczekiwany błąd przy operacji \"Dodaj Rebuy\". ${getFirebaseErrorDetails(error)}`);
        console.error("[Second][Table12Rebuy] Błąd podczas dodawania Rebuy", error);
        renderTable12RebuyModal();
      } finally {
        table12RebuyActionInProgress = false;
        renderTable12RebuyModal();
      }
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "danger";
    removeButton.textContent = "Usuń Rebuy";
    removeButton.disabled = rebuyState.values.length === 0 || table12RebuyActionInProgress;
    removeButton.addEventListener("click", async () => {
      if (table12RebuyActionInProgress) {
        setTable12RebuyModalStatus("Operacja jest już wykonywana. Poczekaj na zakończenie poprzedniego zapisu.");
        return;
      }
      if (!rebuyState.values.length) {
        return;
      }
      table12RebuyActionInProgress = true;
      renderTable12RebuyModal();
      const backupDraft = JSON.parse(JSON.stringify(rebuyState));
      const backupTable12Rebuys = JSON.parse(JSON.stringify(tournamentState.payments.table12Rebuys || {}));
      const backupPoolRebuyValues = JSON.parse(JSON.stringify(tournamentState.pool?.rebuyCells || {}));
      const activeRebuyState = rebuyState;
      const removedIndex = activeRebuyState.indexes[activeRebuyState.indexes.length - 1];
      activeRebuyState.values = activeRebuyState.values.slice(0, -1);
      activeRebuyState.indexes = activeRebuyState.indexes.slice(0, -1);
      tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = {
        values: [...activeRebuyState.values],
        indexes: [...activeRebuyState.indexes]
      };
      compactTable12RebuyIndexesAfterRemoval(removedIndex);
      const persistedStateAfterCompaction = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      table12RebuyModalDraft = {
        values: [...persistedStateAfterCompaction.values],
        indexes: [...persistedStateAfterCompaction.indexes]
      };
      table12RebuyModalDirty = true;
      try {
        const saved = await persistTable12RebuyChanges("Usuń Rebuy");
        if (!saved) {
          table12RebuyModalDraft = backupDraft;
          tournamentState.payments.table12Rebuys = backupTable12Rebuys;
          tournamentState.pool = tournamentState.pool || {};
          tournamentState.pool.rebuyCells = backupPoolRebuyValues;
          renderTable12RebuyModal();
          return;
        }
        table12RebuyModalDirty = false;
        render();
        renderTable12RebuyModal();
      } catch (error) {
        table12RebuyModalDraft = backupDraft;
        tournamentState.payments.table12Rebuys = backupTable12Rebuys;
        tournamentState.pool = tournamentState.pool || {};
        tournamentState.pool.rebuyCells = backupPoolRebuyValues;
        setTable12RebuyModalStatus(`Wystąpił nieoczekiwany błąd przy operacji \"Usuń Rebuy\". ${getFirebaseErrorDetails(error)}`);
        console.error("[Second][Table12Rebuy] Błąd podczas usuwania Rebuy", error);
        renderTable12RebuyModal();
      } finally {
        table12RebuyActionInProgress = false;
        renderTable12RebuyModal();
      }
    });

    table12RebuyModalActions.append(addButton, removeButton);
  };

  const openTable12RebuyModal = (playerId) => {
    const normalizedPlayerId = String(playerId || "").trim();
    if (!normalizedPlayerId) {
      setTable12RebuyModalStatus("Nie udało się otworzyć modalu Rebuy: brak identyfikatora gracza.");
      return;
    }
    const playerExists = tournamentState.players.some((player) => player.id === normalizedPlayerId);
    if (!playerExists) {
      setTable12RebuyModalStatus("Nie udało się otworzyć modalu Rebuy: gracz nie istnieje.");
      return;
    }
    activeTable12RebuyPlayerId = normalizedPlayerId;
    table12RebuyModalDraft = null;
    table12RebuyModalDirty = false;
    setTable12RebuyModalStatus("");
    table12RebuyModal.classList.add("is-visible");
    table12RebuyModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    renderTable12RebuyModal();
  };
  table12RebuyModalClose?.addEventListener("click", closeTable12RebuyModal);
  table12RebuyModal.addEventListener("click", (event) => {
    if (event.target === table12RebuyModal) {
      closeTable12RebuyModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && table12RebuyModal.classList.contains("is-visible")) {
      closeTable12RebuyModal();
    }
  });

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const saveState = async (options = {}) => {
    const deletedPaths = Array.isArray(options.deletedPaths) ? options.deletedPaths.filter((path) => typeof path === "string" && path.trim()) : [];
    try {
      tournamentState.readonlyTables = buildTournamentReadonlyCopies(tournamentState);
      if (deletedPaths.length) {
        const deletePayload = deletedPaths.reduce((acc, path) => {
          acc[path] = firebaseApp.firestore.FieldValue.delete();
          return acc;
        }, {
          updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
        });
        await docRef.update(deletePayload);
      }
      await docRef.set({ ...tournamentState, updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp() }, { merge: true });
      tournamentStatusMessage = "";
      saveState.lastError = null;
      return true;
    } catch (error) {
      saveState.lastError = error;
      tournamentStatusMessage = `Nie udało się zapisać danych turnieju do Firebase. ${getFirebaseErrorDetails(error)}`;
      console.error("[Second] saveState error", error);
      return false;
    }
  };
  saveState.lastError = null;

  const generateUniquePin = (playerId) => {
    const usedPins = new Set(
      tournamentState.players
        .filter((player) => player.id !== playerId)
        .map((player) => digitsOnly(player.pin).slice(0, 5))
        .filter((pin) => pin.length === 5)
    );
    let attempts = 0;
    while (attempts < 200) {
      const candidate = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
      if (!usedPins.has(candidate)) {
        return candidate;
      }
      attempts += 1;
    }
    return String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  };

  const getPinOwnerId = (pin, excludedPlayerId) => {
    if (!pin) return null;
    const normalizedPin = digitsOnly(pin).slice(0, 5);
    if (!normalizedPin) return null;
    const match = tournamentState.players.find((player) => (
      player.id !== excludedPlayerId
      && digitsOnly(player.pin).slice(0, 5) === normalizedPin
    ));
    return match ? match.id : null;
  };

  const tableNameById = (tableId) => tournamentState.tables.find((table) => table.id === tableId)?.name || "-";
  const playerNameById = (playerId) => tournamentState.players.find((player) => player.id === playerId)?.name || "";
  const getPaymentStatusConfig = (status) => {
    const isPaid = status === "Opłacone";
    return {
      label: isPaid ? "Opłacone" : "Do zapłaty",
      className: isPaid ? "is-paid" : "is-unpaid"
    };
  };

  const toNumber = (value) => {
    const normalized = String(value ?? "").replace(",", ".").trim();
    if (!normalized) return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatCellNumber = (value) => {
    if (!Number.isFinite(value)) return "";
    return String(Math.round(value));
  };
  const toPercentText = (value) => `${Math.round((toNumber(value) * 100) * 100) / 100}%`;

  const ensureTable12RebuyState = (playerId) => {
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    if (!tournamentState.payments.table12Rebuys[playerId]) {
      tournamentState.payments.table12Rebuys[playerId] = { values: [], indexes: [] };
    }
    return ensureTable12RebuyEntryShape(tournamentState.payments.table12Rebuys[playerId]);
  };

  const getAllTable12RebuyEntries = () => {
    const activePlayerIds = new Set((tournamentState.players || []).map((player) => player.id));
    return Object.keys(tournamentState.payments.table12Rebuys || {})
      .filter((playerId) => activePlayerIds.has(playerId))
      .flatMap((playerId) => {
        const rebuyState = ensureTable12RebuyState(playerId);
        return rebuyState.values.map((value, idx) => ({
          playerId,
          index: rebuyState.indexes[idx],
          value: digitsOnly(value)
        }));
      })

      .filter((entry) => Number.isInteger(entry.index) && entry.index > 0)
      .sort((a, b) => a.index - b.index);
  };

  const getNextGlobalTable12RebuyIndex = () => {
    const maxIndex = getAllTable12RebuyEntries().reduce((max, entry) => Math.max(max, entry.index), 0);
    return maxIndex + 1;
  };

  const remapPoolRebuyValuesAfterRemoval = (removedIndex) => {
    if (!Number.isInteger(removedIndex) || removedIndex <= 0) {
      return;
    }
    tournamentState.pool = tournamentState.pool || {};
    tournamentState.pool.rebuyCells = tournamentState.pool.rebuyCells || {};
    Object.keys(tournamentState.pool.rebuyCells).forEach((rowId) => {
      const saved = tournamentState.pool.rebuyCells[rowId] || {};
      const remapped = {};
      Object.keys(saved).forEach((colKey) => {
        const colIndex = Number(colKey);
        if (!Number.isInteger(colIndex)) {
          return;
        }
        const rebuyIndex = colIndex + 1;
        if (rebuyIndex === removedIndex) {
          return;
        }
        const nextColIndex = rebuyIndex > removedIndex ? colIndex - 1 : colIndex;
        if (nextColIndex >= 0) {
          remapped[nextColIndex] = saved[colKey];
        }
      });
      Object.keys(saved).forEach((colKey) => {
        if (!Object.prototype.hasOwnProperty.call(remapped, colKey)) {
          remapped[colKey] = null;
        }
      });
      tournamentState.pool.rebuyCells[rowId] = remapped;
    });
  };

  const compactTable12RebuyIndexesAfterRemoval = (removedIndex) => {
    if (!Number.isInteger(removedIndex) || removedIndex <= 0) {
      return;
    }
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    Object.values(tournamentState.payments.table12Rebuys).forEach((entry) => {
      const normalized = ensureTable12RebuyEntryShape(entry);
      normalized.indexes = normalized.indexes.map((index) => (index > removedIndex ? index - 1 : index));
      entry.values = normalized.values;
      entry.indexes = normalized.indexes;
    });
    remapPoolRebuyValuesAfterRemoval(removedIndex);
  };

  const removeTable12RebuysForPlayersAndReindex = (playerIds) => {
    const normalizedPlayerIds = Array.isArray(playerIds)
      ? [...new Set(playerIds.filter((playerId) => typeof playerId === "string" && playerId.trim()))]
      : [];
    if (!normalizedPlayerIds.length) {
      return [];
    }

    tournamentState.payments = tournamentState.payments || {};
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    tournamentState.pool = tournamentState.pool || {};
    tournamentState.pool.rebuyCells = tournamentState.pool.rebuyCells || {};

    const deletedPaths = [];
    normalizedPlayerIds.forEach((playerId) => {
      const entry = tournamentState.payments.table12Rebuys[playerId];
      if (!entry) {
        return;
      }
      ensureTable12RebuyEntryShape(entry);
      delete tournamentState.payments.table12Rebuys[playerId];
      deletedPaths.push(`payments.table12Rebuys.${playerId}`);
    });

    const remainingEntries = getAllTable12RebuyEntries();
    if (!remainingEntries.length) {
      tournamentState.pool.rebuyCells = {};
      deletedPaths.push("pool.rebuyCells");
      return deletedPaths;
    }

    const oldToNewIndexMap = new Map();
    remainingEntries.forEach((entry, idx) => {
      oldToNewIndexMap.set(entry.index, idx + 1);
    });

    Object.keys(tournamentState.payments.table12Rebuys).forEach((playerId) => {
      const rebuyState = ensureTable12RebuyState(playerId);
      rebuyState.indexes = rebuyState.indexes.map((oldIndex) => oldToNewIndexMap.get(oldIndex) || oldIndex);
      tournamentState.payments.table12Rebuys[playerId] = {
        values: [...rebuyState.values],
        indexes: [...rebuyState.indexes]
      };
    });

    Object.keys(tournamentState.pool.rebuyCells).forEach((rowId) => {
      const saved = tournamentState.pool.rebuyCells[rowId] || {};
      const remapped = {};
      Object.keys(saved).forEach((colKey) => {
        const colIndex = Number(colKey);
        if (!Number.isInteger(colIndex)) {
          return;
        }
        const oldRebuyIndex = colIndex + 1;
        const newRebuyIndex = oldToNewIndexMap.get(oldRebuyIndex);
        if (!Number.isInteger(newRebuyIndex) || newRebuyIndex <= 0) {
          return;
        }
        remapped[newRebuyIndex - 1] = saved[colKey];
      });
      Object.keys(saved).forEach((colKey) => {
        if (!Object.prototype.hasOwnProperty.call(remapped, colKey)) {
          remapped[colKey] = null;
        }
      });
      tournamentState.pool.rebuyCells[rowId] = remapped;
    });

    return deletedPaths;
  };

  const getAutomaticRebuyResetDeletedPaths = () => {
    const deletedPaths = [];
    if ((tournamentState.players || []).length === 0 && (tournamentState.tables || []).length === 0) {
      tournamentState.payments = tournamentState.payments || {};
      tournamentState.pool = tournamentState.pool || {};
      tournamentState.payments.table12Rebuys = {};
      tournamentState.pool.rebuyCells = {};
      deletedPaths.push("payments.table12Rebuys", "pool.rebuyCells");
      if (activeTable12RebuyPlayerId) {
        closeTable12RebuyModal();
      }
    }
    return deletedPaths;
  };

  const resetAllTable12Rebuys = async () => {
    if (globalRebuyResetInProgress) {
      tournamentStatusMessage = "Trwa już reset Rebuy. Poczekaj na zakończenie operacji.";
      render();
      return;
    }

    const confirmation = window.confirm(
      "Wyzerować wszystkie Rebuy?\nTa operacja jest nieodwracalna i usunie wszystkie wpisy RebuyX."
    );
    if (!confirmation) {
      return;
    }

    globalRebuyResetInProgress = true;
    tournamentState.payments = tournamentState.payments || {};
    tournamentState.pool = tournamentState.pool || {};
    tournamentState.payments.table12Rebuys = {};
    tournamentState.pool.rebuyCells = {};
    table12RebuyModalDraft = null;
    table12RebuyModalDirty = false;
    if (activeTable12RebuyPlayerId) {
      await closeTable12RebuyModal();
    }
    render();

    pendingLocalWrites += 1;
    try {
      const saved = await saveState({ deletedPaths: ["payments.table12Rebuys", "pool.rebuyCells"] });
      if (saved) {
        tournamentStatusMessage = "Wyzerowano wszystkie Rebuy.";
      }
    } finally {
      globalRebuyResetInProgress = false;
      pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
      commitDeferredSnapshotIfSafe();
      render();
    }
  };

  const getPlayerRebuyTotal = (playerId) => {
    const state = ensureTable12RebuyState(playerId);
    return state.values.reduce((sum, value) => sum + toDigitsNumber(value), 0);
  };

  const buildGroupedRows = (assignments) => {
    const all = [];
    let lp = 1;
    tournamentState.tables.forEach((table) => {
      tournamentState.players.forEach((player) => {
        if ((assignments[player.id]?.tableId || "") === table.id) {
          all.push({ tableId: table.id, tableName: table.name || "Bez nazwy", lp: lp++, playerId: player.id, playerName: player.name || "" });
        }
      });
    });
    return all;
  };

  const render = () => {
    try {
      const focusState = getTournamentEditableFocusState(container);
      const groupedDrawRows = buildGroupedRows(tournamentState.assignments);

    const buyInValue = toDigitsNumber(tournamentState.buyIn);
    const drawTotalsByTable = {};
    const playerBuyInById = {};
    tournamentState.tables.forEach((table) => {
      const assignedPlayers = tournamentState.players.filter((player) => (tournamentState.assignments[player.id]?.tableId || "") === table.id);
      drawTotalsByTable[table.id] = assignedPlayers.length * buyInValue;
      assignedPlayers.forEach((player) => {
        playerBuyInById[player.id] = buyInValue;
      });
    });
    const totalBuyInFromDraw = Object.values(drawTotalsByTable).reduce((sum, value) => sum + value, 0);

    const allRebuyValues = getAllTable12RebuyEntries()
      .filter((entry) => String(entry.value ?? "").trim())
      .map((entry) => toDigitsNumber(entry.value));
    const rakePercent = percentInputToDecimal(tournamentState.rake);
    const adjustedRebuyValues = allRebuyValues.map((value) => value * (1 - rakePercent));
    const rebuyCount = allRebuyValues.length;
    const rebuyTotal = allRebuyValues.reduce((sum, value) => sum + value, 0);

    const table10 = {
      buyIn: toDigitsNumber(tournamentState.buyIn),
      rebuyAddOn: toDigitsNumber(tournamentState.rebuyAddOn),
      sum: totalBuyInFromDraw + rebuyTotal,
      rebuyCount
    };

    const table11 = {
      percent: rakePercent,
      rake: (totalBuyInFromDraw + rebuyTotal) * rakePercent,
      buyIn: totalBuyInFromDraw * (1 - rakePercent),
      rebuyAddOn: rebuyTotal * (1 - rakePercent),
      pot: 0
    };
    table11.pot = table11.buyIn + table11.rebuyAddOn;

    tournamentState.payments.table10 = {
      buyIn: formatCellNumber(table10.buyIn),
      rebuyAddOn: formatCellNumber(table10.rebuyAddOn),
      sum: formatCellNumber(table10.sum),
      rebuyCount: formatCellNumber(table10.rebuyCount)
    };
    tournamentState.payments.table11 = {
      percent: formatCellNumber(table11.percent),
      rake: formatCellNumber(table11.rake),
      buyIn: formatCellNumber(table11.buyIn),
      rebuyAddOn: formatCellNumber(table11.rebuyAddOn),
      pot: formatCellNumber(table11.pot)
    };

    const stackValue = toDigitsNumber(tournamentState.stack);
    const rebuyStackValue = toDigitsNumber(tournamentState.rebuyStack);
    tournamentState.group = tournamentState.group || {};
    tournamentState.group.eliminated = tournamentState.group.eliminated || {};
    tournamentState.group.eliminatedOrder = Array.isArray(tournamentState.group.eliminatedOrder) ? tournamentState.group.eliminatedOrder : [];
    tournamentState.group.eliminatedWins = tournamentState.group.eliminatedWins || {};
    tournamentState.group.survivorStacks = tournamentState.group.survivorStacks || {};
    tournamentState.semi = tournamentState.semi || {};
    tournamentState.semi.assignments = tournamentState.semi.assignments || {};
    tournamentState.semi.customTables = Array.isArray(tournamentState.semi.customTables) ? tournamentState.semi.customTables : [];
    tournamentState.semi.eliminatedOrder = Array.isArray(tournamentState.semi.eliminatedOrder) ? tournamentState.semi.eliminatedOrder : [];
    tournamentState.final = tournamentState.final || {};
    tournamentState.final.eliminated = tournamentState.final.eliminated || {};
    tournamentState.final.eliminatedOrder = Array.isArray(tournamentState.final.eliminatedOrder) ? tournamentState.final.eliminatedOrder : [];

    const groupRows = groupedDrawRows.map((row) => {
      const rebuyState = ensureTable12RebuyState(row.playerId);
      const rebuyMultiplier = rebuyState.values.filter((value) => String(value ?? "").trim()).length;
      const rebuyAddOnAmount = rebuyMultiplier > 0 ? rebuyStackValue * rebuyMultiplier : 0;
      return {
        ...row,
        eliminated: !!tournamentState.group.eliminated[row.playerId],
        rebuyAddOnAmount,
        stackAmount: stackValue
      };
    });
    const groupedByTable = tournamentState.tables.map((table) => {
      const rowsForTable = groupRows.filter((row) => row.tableId === table.id);
      const stack = rowsForTable.reduce((sum, row) => sum + row.stackAmount + row.rebuyAddOnAmount, 0);
      return {
        table,
        rows: rowsForTable,
        stack
      };
    });
    const totalGroupStackBase = groupedByTable.reduce((sum, item) => sum + item.stack, 0);
    const groupStripeClasses = getAlternatingTableGroupClass(groupedDrawRows, (row) => row.tableId);
    const defaultEliminatedRows = groupRows.filter((row) => row.eliminated);
    const eliminatedRowsById = new Map(defaultEliminatedRows.map((row) => [row.playerId, row]));
    const syncedEliminatedOrder = tournamentState.group.eliminatedOrder.filter((playerId) => eliminatedRowsById.has(playerId));
    defaultEliminatedRows.forEach((row) => {
      if (!syncedEliminatedOrder.includes(row.playerId)) {
        syncedEliminatedOrder.push(row.playerId);
      }
    });
    tournamentState.group.eliminatedOrder = syncedEliminatedOrder;
    const eliminatedRows = syncedEliminatedOrder.map((playerId) => eliminatedRowsById.get(playerId)).filter(Boolean);
    const survivorRows = groupRows.filter((row) => !row.eliminated);
    const survivorRowsWithValues = survivorRows.map((row) => {
      const survivorStack = toDigitsNumber(tournamentState.group.survivorStacks[row.playerId]);
      const share = totalGroupStackBase > 0 ? survivorStack / totalGroupStackBase : 0;
      return {
        ...row,
        survivorStack,
        share
      };
    });
    const semiTableNameById = (tableId) => tournamentState.semi.customTables.find((table) => table.id === tableId)?.name || "";
    const semiRows = survivorRowsWithValues.map((row) => {
      const assignment = tournamentState.semi.assignments[row.playerId] || {};
      const overrideStack = toDigitsNumber(assignment.stack);
      const semiStack = overrideStack > 0 ? overrideStack : row.survivorStack;
      const semiShare = totalGroupStackBase > 0 ? semiStack / totalGroupStackBase : 0;
      return {
        ...row,
        semiStack,
        semiShare,
        semiTableId: assignment.tableId || "",
        semiTableName: semiTableNameById(assignment.tableId || ""),
        semiEliminated: !!assignment.eliminated
      };
    });
    const semiTables = tournamentState.semi.customTables.map((table) => {
      const rows = semiRows.filter((row) => row.semiTableId === table.id);
      const totalStack = rows.reduce((sum, row) => sum + row.semiStack, 0);
      return {
        ...table,
        rows,
        totalStack
      };
    });
    const semiEliminatedDefaultRows = semiRows.filter((row) => row.semiTableId && row.semiEliminated);
    tournamentState.semi.eliminatedOrder = syncOrderedPlayerIds(tournamentState.semi.eliminatedOrder, semiEliminatedDefaultRows);
    const semiEliminatedRowsById = new Map(semiEliminatedDefaultRows.map((row) => [row.playerId, row]));
    const semiEliminatedRows = tournamentState.semi.eliminatedOrder.map((playerId) => semiEliminatedRowsById.get(playerId)).filter(Boolean);

    const finalPlayerRows = semiRows
      .filter((row) => row.semiTableId)
      .map((row) => {
        const assignment = tournamentState.semi.assignments[row.playerId] || {};
        return {
          ...row,
          finalStack: toDigitsNumber(assignment.finalStack)
        };
      });
    const finalPlayerStateById = new Map(
      (Array.isArray(tournamentState.finalPlayers) ? tournamentState.finalPlayers : []).map((player) => [player.id, player])
    );
    const nextFinalEliminated = {};
    tournamentState.finalPlayers = finalPlayerRows.map((row) => {
      const stored = finalPlayerStateById.get(row.playerId) || {};
      const eliminated = !!tournamentState.final.eliminated[row.playerId];
      nextFinalEliminated[row.playerId] = eliminated;
      return {
        id: row.playerId,
        name: row.playerName,
        tableId: row.semiTableId,
        tableName: row.semiTableName,
        stack: String(formatCellNumber(row.finalStack)),
        initialWin: stored.initialWin ?? "0",
        finalWin: stored.finalWin ?? "0",
        eliminated
      };
    });
    tournamentState.final.eliminated = nextFinalEliminated;
    const sortedFinalPlayers = sortPlayersByStackDesc(tournamentState.finalPlayers);
    const finalActivePlayers = sortedFinalPlayers.filter((player) => !player.eliminated);
    const finalEliminatedPlayers = sortedFinalPlayers.filter((player) => player.eliminated);
    const finalEliminatedDefaultRows = finalEliminatedPlayers.map((player) => ({ playerId: player.id, playerName: player.name }));
    tournamentState.final.eliminatedOrder = syncOrderedPlayerIds(tournamentState.final.eliminatedOrder, finalEliminatedDefaultRows);
    const finalEliminatedRowsById = new Map(finalEliminatedDefaultRows.map((row) => [row.playerId, row]));
    const finalEliminatedRows = tournamentState.final.eliminatedOrder.map((playerId) => finalEliminatedRowsById.get(playerId)).filter(Boolean);

    if (activeSection === "players") {
      const playersRows = tournamentState.players.map((player, index) => {
        const assignment = tournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const statusConfig = getPaymentStatusConfig(assignment.status);
        const isPaid = assignment.status === "Opłacone";
        return `
        <tr>
          <td>${index + 1}</td>
          <td><div class="payment-status-cell"><label class="payment-status-toggle ${statusConfig.className}"><input data-role="player-payment-status" data-player-id="${player.id}" type="checkbox" ${isPaid ? "checked" : ""}><span>${statusConfig.label}</span></label></div></td>
          <td><input class="admin-input" data-role="player-name" data-player-id="${player.id}" value="${esc(player.name)}" type="text" data-focus-target="1" data-section="second-tournament-players" data-row-id="${player.id}" data-column-key="name"></td>
          <td>
            <div class="pin-control">
              <input class="admin-input" data-role="player-pin" data-player-id="${player.id}" value="${esc(player.pin)}" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="5 cyfr" data-focus-target="1" data-section="second-tournament-players" data-row-id="${player.id}" data-column-key="pin">
              <button type="button" class="secondary admin-pin-random" data-role="player-pin-random" data-player-id="${player.id}">Losuj</button>
            </div>
          </td>
          <td>
            <div class="permissions-tags">${normalizeTournamentPermissions(player.permissions).map((permission) => `<span class="permission-badge">${esc(permission)}</span>`).join("") || '<span class="permission-badge is-empty">Brak uprawnień</span>'}</div>
            <button type="button" class="secondary admin-permissions-edit" data-role="player-perm-edit" data-player-id="${player.id}">Edytuj</button>
          </td>
          <td><button type="button" class="danger admin-row-delete" data-role="delete-player" data-player-id="${player.id}">Usuń</button></td>
        </tr>
      `;
      }).join("");

      mount.innerHTML = `
        ${tournamentStatusMessage ? `<p class="builder-info">${esc(tournamentStatusMessage)}</p>` : ""}
        <div class="admin-table-actions">
          <button type="button" class="danger" data-role="reset-all-rebuy" ${globalRebuyResetInProgress ? "disabled" : ""}>Wyzeruj Rebuy</button>
        </div>
        <div class="t-section-grid">
          <label>ORGANIZATOR <input class="admin-input" data-role="meta-organizer" type="text" value="${esc(tournamentState.organizer)}"></label>
          <label>BUY-IN <input class="admin-input" data-role="meta-buyin" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.buyIn)}"></label>
          <label>REBUY/ADD-ON <input class="admin-input" data-role="meta-rebuy" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyAddOn)}"></label>
          <label>RAKE <input class="admin-input" data-role="meta-rake" type="text" inputmode="numeric" value="${esc(formatPercentDisplay(tournamentState.rake))}"></label>
          <label>STACK <input class="admin-input" data-role="meta-stack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.stack)}"></label>
          <label>REBUY/ADD-ON STACK <input class="admin-input" data-role="meta-rebuystack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyStack)}"></label>
        </div>
        <p class="builder-info">Liczba dodanych graczy: ${tournamentState.players.length}</p>
        <div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "tmd", "tlg", "act"], "t-fluid", "players-table")}>${tCols(["xs", "tsm", "tmd", "tmd", "tlg", "act"], "t-fluid")}<thead><tr><th>LP</th><th>STATUS</th><th>NAZWA</th><th>PIN</th><th>UPRAWNIENIA</th><th>AKCJE</th></tr></thead><tbody>${playersRows || '<tr><td colspan="6">Brak graczy.</td></tr>'}</tbody></table></div>
        <button type="button" class="secondary t-inline-add-button" data-role="add-player">Dodaj gracza</button>
      `;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "draw") {
      const rows = tournamentState.players.map((player, index) => {
        const assignment = tournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const statusConfig = getPaymentStatusConfig(assignment.status);
        return `<tr><td>${index + 1}</td><td>${esc(player.name)}</td><td><div class="payment-status-cell"><span class="payment-status-label ${statusConfig.className}">${statusConfig.label}</span></div></td><td><select class="admin-input" data-role="assign-table" data-player-id="${player.id}"><option value="">-</option>${tournamentState.tables.map((table) => `<option value="${table.id}" ${assignment.tableId === table.id ? "selected" : ""}>${esc(table.name)}</option>`).join("")}</select></td></tr>`;
      }).join("");

      const perTableBlocks = tournamentState.tables.map((table) => {
        const assignedPlayers = tournamentState.players.filter((player) => (tournamentState.assignments[player.id]?.tableId || "") === table.id);
        const total = drawTotalsByTable[table.id] || 0;
        return `<article class="admin-table-card"><div class="t-section-grid"><label>NAZWA <input class="admin-input" data-role="table-name" data-table-id="${table.id}" type="text" value="${esc(table.name)}"></label><label>ŁĄCZNA SUMA <input class="admin-input" readonly value="${formatCellNumber(total)}"></label></div><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md"], "t-fluid")}>${tCols(["xs", "tmd", "md"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>BUY-IN</th></tr></thead><tbody>${assignedPlayers.map((player, index) => `<tr><td>${index + 1}</td><td>${esc(player.name)}</td><td>${formatCellNumber(buyInValue)}</td></tr>`).join("") || '<tr><td colspan="3">Brak przypisanych graczy.</td></tr>'}</tbody></table></div><button type="button" class="danger admin-row-delete draw-table-delete" data-role="delete-table" data-table-id="${table.id}">Usuń</button></article>`;
      }).join("");

      mount.innerHTML = `<div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "tsm", "tsm"], "t-fluid")}>${tCols(["xs", "tmd", "tsm", "tsm"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STATUS</th><th>STÓŁ</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Brak graczy.</td></tr>'}</tbody></table></div><div class="semi-tables">${perTableBlocks || "<p>Brak stołów.</p>"}</div><button type="button" class="secondary t-inline-add-button" data-role="add-table">Dodaj stół</button>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "payments") {
      const paymentsStripeClasses = getAlternatingTableGroupClass(groupedDrawRows, (row) => row.tableId);
      mount.innerHTML = `<h3>TABELA10</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md", "md", "md"], "t-compact")}>${tCols(["md", "md", "md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZ. REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(table10.buyIn)}</td><td>${formatCellNumber(table10.rebuyAddOn)}</td><td>${formatCellNumber(table10.sum)}</td><td>${formatCellNumber(table10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA11</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "md", "md", "md", "md"], "t-compact")}>${tCols(["xs", "md", "md", "md", "md"], "t-compact")}<thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(table11.percent)}</td><td>${formatCellNumber((totalBuyInFromDraw + rebuyTotal) * rakePercent)}</td><td>${formatCellNumber(table11.buyIn)}</td><td>${formatCellNumber(table11.rebuyAddOn)}</td><td>${formatCellNumber(table11.pot)}</td></tr></tbody></table></div><h3>TABELA12</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "md", "act"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "md", "act"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>BUY-IN</th><th>REBUY</th></tr></thead><tbody>${groupedDrawRows.map((row, index) => `<tr class="${paymentsStripeClasses[index]}"><td>${row.lp}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(playerBuyInById[row.playerId] || 0)}</td><td><button class="secondary" type="button" data-role="open-table12-rebuy" data-player-id="${row.playerId}">${formatCellNumber(getPlayerRebuyTotal(row.playerId))}</button></td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "pool") {
      tournamentState.pool.mods = Array.isArray(tournamentState.pool.mods) ? tournamentState.pool.mods : [];
      while (tournamentState.pool.mods.length < 3) {
        tournamentState.pool.mods.push({ id: crypto.randomUUID(), split: "", modR5: "", mod1: "", mod2: "", mod3: "" });
      }
      const splitRows = tournamentState.pool.mods;
      const table15BuyIn = table11.buyIn;
      const rebuyColumns = allRebuyValues.length;
      tournamentState.pool.rebuyCells = asObject(tournamentState.pool.rebuyCells);
      const rebuyCells = tournamentState.pool.rebuyCells;
      const { table15Split, matrix: rebuyMatrix, rowSums } = computePoolTable16({
        rows: splitRows,
        buyIn: table15BuyIn,
        rebuyColumnValues: adjustedRebuyValues,
        rebuyCells
      });
      lastPoolRebuyMatrix = { rowIds: splitRows.map((row) => row.id), matrix: rebuyMatrix };
      const overflow = adjustedRebuyValues.slice(POOL_AUTO_REBUY_COLUMNS).reduce((sum, value) => sum + value, 0);
      const manualOverflowSum = rebuyMatrix.reduce((sum, rowValues) => sum + rowValues.slice(POOL_AUTO_REBUY_COLUMNS).reduce((rowSum, value) => rowSum + toNumber(value), 0), 0);
      const undistributedRemainder = Math.max(0, overflow - manualOverflowSum);
      const correctionMismatches = getPoolRebuyCorrectionMismatches(splitRows, adjustedRebuyValues, rebuyCells, rebuyMatrix);
      const correctionWarning = correctionMismatches.length
        ? `<p class="builder-info t-warning">${correctionMismatches.map(({ column, distributed, expected }) => `REBUY${column}: rozdzielono ${formatCellNumber(distributed)} z ${formatCellNumber(expected)}`).join("<br>")}</p>`
        : "";

      const table16Columns = getPoolTable16Columns(rebuyColumns);
      const renderModInput = (row, modKey) => `<td><input class="admin-input" data-role="pool-mod" data-mod-key="${modKey}" data-id="${row.id}" type="text" autocomplete="off" value="${esc(row[modKey] || "")}" data-focus-target="1" data-section="second-tournament-pool-mod" data-row-id="${row.id}" data-column-key="${modKey}"></td>`;
      const renderRebuyCell = (row, rowIndex, colIdx) => `<td data-rebuy-column><input class="admin-input" data-role="pool-rebuy-value" data-id="${row.id}" data-col-index="${colIdx}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${esc(rebuyMatrix[rowIndex][colIdx] || "")}" data-focus-target="1" data-section="second-tournament-pool-rebuy" data-row-id="${row.id}" data-column-key="rebuy${colIdx + 1}"></td>`;

      const renderTable16Header = () => ['<th>LP</th>', '<th>PODZIAŁ PULI</th>', '<th>KWOTA</th>']
        .concat(table16Columns.map((column) => (column.type === "rebuy" ? `<th data-rebuy-column>REBUY${column.colIdx + 1}</th>` : `<th>${column.label}</th>`)))
        .concat('<th>SUMA</th>')
        .join('');

      const renderTable16Row = (row, index) => {
        const cells = [`<td>${index + 1}</td>`, `<td><input class="admin-input" data-role="pool-split" data-id="${row.id}" value="${esc(getPoolSplitDisplay(row, index))}" type="text" inputmode="numeric"></td>`, `<td>${formatCellNumber(rowSums[index].amount)}</td>`];
        table16Columns.forEach((column) => {
          cells.push(column.type === "rebuy" ? renderRebuyCell(row, index, column.colIdx) : renderModInput(row, column.key));
        });
        cells.push(`<td>${formatCellNumber(rowSums[index].total)}</td>`);
        return `<tr>${cells.join("")}</tr>`;
      };

      mount.innerHTML = `<h3>TABELA13</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md", "md", "md"], "t-compact")}>${tCols(["md", "md", "md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZBA REBUY</th></tr></thead><tbody><tr><td>${formatCellNumber(table10.buyIn)}</td><td>${formatCellNumber(table10.rebuyAddOn)}</td><td>${formatCellNumber(table10.sum)}</td><td>${formatCellNumber(table10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA14</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "md", "md", "md", "md"], "t-compact")}>${tCols(["xs", "md", "md", "md", "md"], "t-compact")}<thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(table11.percent)}</td><td>${formatCellNumber(table11.rake)}</td><td>${formatCellNumber(table11.buyIn)}</td><td>${formatCellNumber(table11.rebuyAddOn)}</td><td>${formatCellNumber(table11.pot)}</td></tr></tbody></table></div><h3>TABELA15</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md"], "t-compact")}>${tCols(["md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>PODZIAŁ</th></tr></thead><tbody><tr><td>${formatCellNumber(table15BuyIn)}</td><td>${formatCellNumber(table15Split)}</td></tr></tbody></table></div>${undistributedRemainder > 0 ? `<p class="builder-info t-warning">Rebuy do rozdysponowania ${formatCellNumber(undistributedRemainder)}</p>` : ''}<h3>TABELA16</h3><div class="admin-table-scroll"><table ${tAttr(tColsAuto(renderTable16Header(), ["xs", "md", "md"], ["md"]), "t-fluid", "tournament-pool-table16")}>${tCols(tColsAuto(renderTable16Header(), ["xs", "md", "md"], ["md"]), "t-fluid")}<thead><tr>${renderTable16Header()}</tr></thead><tbody>${splitRows.map((row, index) => renderTable16Row(row, index)).join('')}</tbody></table></div>${correctionWarning}<div class="admin-table-actions"><button class="secondary t-inline-add-button" type="button" data-role="add-pool-mod-row">Dodaj</button><button class="danger t-inline-add-button" type="button" data-role="remove-pool-mod-row">Usuń</button></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "group") {
      mount.innerHTML = `<h3>TABELA17</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md"], "t-compact")}>${tCols(["md", "md"], "t-compact")}<thead><tr><th>STACK GRACZA</th><th>REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(stackValue)}</td><td>${formatCellNumber(rebuyStackValue)}</td></tr></tbody></table></div><h3>TABELA18</h3><div class="admin-table-scroll"><table ${tAttr(new Array(groupedByTable.length + 1).fill("md"), "t-compact")}>${tCols(new Array(groupedByTable.length + 1).fill("md"), "t-compact")}<thead><tr>${groupedByTable.map(({ table }) => `<th class="table18-dynamic-header">${esc(table.name)}</th>`).join("")}<th>ŁĄCZNY STACK</th></tr></thead><tbody><tr>${groupedByTable.map(({ stack }) => `<td>${formatCellNumber(stack)}</td>`).join("")}<td>${formatCellNumber(totalGroupStackBase)}</td></tr></tbody></table></div><h3>TABELA19</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "flag", "md", "md"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "flag", "md", "md"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>ELIMINATED</th><th>STACK</th><th>REBUY/ADD-ON</th></tr></thead><tbody>${groupRows.map((row, index) => `<tr class="${groupStripeClasses[index]}"><td>${row.lp}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td><input type="checkbox" data-role="group-eliminated" data-player-id="${row.playerId}" ${row.eliminated ? "checked" : ""}></td><td>${formatCellNumber(row.stackAmount)}</td><td>${formatCellNumber(row.rebuyAddOnAmount)}</td></tr>`).join("") || '<tr><td colspan="6">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA19A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "act", "md"], "t-fluid")}>${tCols(["xs", "tmd", "act", "md"], "t-fluid")}<thead><tr><th>LP</th><th>WYELIMINOWANI GRACZE</th><th>POZYCJA</th><th>WYGRANA</th></tr></thead><tbody>${eliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td><div class="group-position-controls"><button class="secondary group-position-button" type="button" data-role="group-eliminated-move" data-player-id="${row.playerId}" data-direction="up" ${index === 0 ? "disabled" : ""}>▲</button><button class="secondary group-position-button" type="button" data-role="group-eliminated-move" data-player-id="${row.playerId}" data-direction="down" ${index === eliminatedRows.length - 1 ? "disabled" : ""}>▼</button></div></td><td><input class="admin-input" data-role="group-eliminated-win" data-player-id="${row.playerId}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.eliminatedWins[row.playerId] || "0")}" data-focus-target="1" data-section="second-tournament-group-eliminated" data-row-id="${row.playerId}" data-column-key="win"></td></tr>`).join("") || '<tr><td colspan="4">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA19B</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "md", "xs"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "md", "xs"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>STACK</th><th>%</th></tr></thead><tbody>${survivorRowsWithValues.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td><input class="admin-input" data-role="group-survivor-stack" data-player-id="${row.playerId}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.survivorStacks[row.playerId] || "")}" data-focus-target="1" data-section="second-tournament-group-survivors" data-row-id="${row.playerId}" data-column-key="stack"></td><td>${toPercentText(row.share)}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "semi") {
      const customTables = semiTables.map((table, index) => `<article class="admin-table-card"><h4>STÓŁ PÓŁFINAŁOWY NUMER ${index + 1} <button type="button" class="danger" data-role="remove-semi-table" data-id="${table.id}">Usuń stół</button></h4><div class="t-section-grid"><label>NAZWA <input class="admin-input" data-role="semi-custom-name" data-id="${table.id}" type="text" value="${esc(table.name || "")}" data-focus-target="1" data-section="second-tournament-semi-name" data-column-key="name"></label><label>ŁĄCZNY STACK <input class="admin-input" readonly value="${formatCellNumber(table.totalStack)}"></label></div><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "flag"], "t-fluid")}>${tCols(["xs", "tmd", "md", "flag"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>ELIMINATED</th></tr></thead><tbody>${table.rows.map((row, rowIndex) => `<tr><td>${rowIndex + 1}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(row.semiStack)}</td><td><input type="checkbox" data-role="semi-player-eliminated" data-player-id="${row.playerId}" ${row.semiEliminated ? "checked" : ""}></td></tr>`).join("") || '<tr><td colspan="4">Brak przypisanych graczy.</td></tr>'}</tbody></table></div></article>`).join("");
      const semiEliminatedTable = `<h3>TABELA22A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "act"], "t-fluid")}>${tCols(["xs", "tmd", "act"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>POZYCJA</th></tr></thead><tbody>${semiEliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td><div class="group-position-controls"><button class="secondary group-position-button" type="button" data-role="semi-eliminated-move" data-player-id="${row.playerId}" data-direction="up" ${index === 0 ? "disabled" : ""}>▲</button><button class="secondary group-position-button" type="button" data-role="semi-eliminated-move" data-player-id="${row.playerId}" data-direction="down" ${index === semiEliminatedRows.length - 1 ? "disabled" : ""}>▼</button></div></td></tr>`).join("") || '<tr><td colspan="3">Brak danych.</td></tr>'}</tbody></table></div>`;
      const finalRowsMarkup = finalPlayerRows
        .filter((row) => !row.semiEliminated)
        .sort((a, b) => b.finalStack - a.finalStack)
        .map((row, idx) => {
          const finalShare = totalGroupStackBase > 0 ? row.finalStack / totalGroupStackBase : 0;
          return `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td><input class="admin-input t-stack-input" data-role="semi-final-stack" data-player-id="${row.playerId}" type="text" inputmode="numeric" pattern="[0-9]*" value="${esc(String(formatCellNumber(row.finalStack)))}" data-focus-target="1" data-section="second-tournament-semi-final-stacks" data-row-id="${row.playerId}" data-column-key="stack"></td><td>${esc(row.semiTableName)}</td><td>${toPercentText(finalShare)}</td></tr>`;
        })
        .join("");
      mount.innerHTML = `<h3>TABELA21</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "xs", "tsm"], "t-fluid")}>${tCols(["xs", "tmd", "md", "xs", "tsm"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>STÓŁ</th></tr></thead><tbody>${semiRows.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td class="t-stack-input">${formatCellNumber(row.semiStack)}</td><td>${toPercentText(row.semiShare)}</td><td><select class="admin-input" data-role="semi-assign-table" data-player-id="${row.playerId}"><option value="">-</option>${tournamentState.semi.customTables.map((table, tableIndex) => `<option value="${table.id}" ${row.semiTableId === table.id ? "selected" : ""}>${esc(table.name || `Stół${tableIndex + 1}`)}</option>`).join("")}</select></td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA22</h3><button type="button" class="secondary t-inline-add-button" data-role="add-semi-table">Dodaj nowy stół</button><div class="semi-tables">${customTables || "<p>Brak stołów półfinałowych.</p>"}</div>${semiEliminatedTable}<h3>TABELA FINAŁOWA</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "tsm", "xs"], "t-fluid")}>${tCols(["xs", "tmd", "md", "tsm", "xs"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>STÓŁ</th><th>%</th></tr></thead><tbody>${finalRowsMarkup || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "final") {
      const finalPlayers = sortedFinalPlayers;
      const finalEliminatedTable = `<h3>TABELA23A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "act"], "t-fluid")}>${tCols(["xs", "tmd", "act"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>POZYCJA</th></tr></thead><tbody>${finalEliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td><div class="group-position-controls"><button class="secondary group-position-button" type="button" data-role="final-eliminated-move" data-player-id="${row.playerId}" data-direction="up" ${index === 0 ? "disabled" : ""}>▲</button><button class="secondary group-position-button" type="button" data-role="final-eliminated-move" data-player-id="${row.playerId}" data-direction="down" ${index === finalEliminatedRows.length - 1 ? "disabled" : ""}>▼</button></div></td></tr>`).join("") || '<tr><td colspan="3">Brak danych.</td></tr>'}</tbody></table></div>`;
      mount.innerHTML = `<h3>TABELA23</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "xs", "flag"], "t-fluid")}>${tCols(["xs", "tmd", "md", "xs", "flag"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>ELIMINATED</th></tr></thead><tbody>${finalPlayers.map((player, i) => { const finalShare = totalGroupStackBase > 0 ? toDigitsNumber(player.stack) / totalGroupStackBase : 0; return `<tr><td>${i + 1}</td><td>${esc(player.name)}</td><td>${formatCellNumber(toDigitsNumber(player.stack))}</td><td>${toPercentText(finalShare)}</td><td><input type="checkbox" data-role="final-player-eliminated" data-player-id="${player.id}" ${player.eliminated ? "checked" : ""}></td></tr>`; }).join("") || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>${finalEliminatedTable}`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "payouts") {
      tournamentState.pool.mods = Array.isArray(tournamentState.pool.mods) ? tournamentState.pool.mods : [];
      while (tournamentState.pool.mods.length < 3) {
        tournamentState.pool.mods.push({ id: crypto.randomUUID(), split: "", modR5: "", mod1: "", mod2: "", mod3: "" });
      }
      const { rowSums: payoutRowSums } = computePoolTable16({
        rows: tournamentState.pool.mods,
        buyIn: table11.buyIn,
        rebuyColumnValues: adjustedRebuyValues,
        rebuyCells: tournamentState.pool.rebuyCells
      });
      const payoutDefaults = getPayoutDefaultsFromTable16(payoutRowSums);
      const initialHeader = tournamentState.payouts.showInitial ? "<th>POCZĄTKOWA WYGRANA</th>" : "";
      const finalHeader = tournamentState.payouts.showFinal ? "<th>KOŃCOWA WYGRANA</th>" : "";
      const payoutRowsState = buildPlacementRowsFromQueues({
        players: tournamentState.players,
        groupRows: eliminatedRows,
        semiRows: semiEliminatedRows,
        finalRows: finalEliminatedRows,
        payoutDefaults
      });
      const payoutRows = payoutRowsState.map((player) => `<tr><td>${player.place}</td><td>${esc(player.playerName || "-")}</td>${tournamentState.payouts.showInitial ? `<td>${formatCellNumber(toNumber(player.initialWin))}</td>` : ""}${tournamentState.payouts.showFinal ? `<td>${formatCellNumber(toNumber(player.finalWin))}</td>` : ""}</tr>`).join("");
      mount.innerHTML = `
        <div class="admin-toggle-row">
          <label><input type="checkbox" data-role="toggle-payout-initial" ${tournamentState.payouts.showInitial ? "checked" : ""}> Pokaż kolumnę POCZĄTKOWA WYGRANA</label>
          <label><input type="checkbox" data-role="toggle-payout-final" ${tournamentState.payouts.showFinal ? "checked" : ""}> Pokaż kolumnę KOŃCOWA WYGRANA</label>
        </div>
        <h3>TABELA24</h3>
        <div class="admin-table-scroll"><table ${tAttr(["xs", "tmd"].concat(new Array(Number(tournamentState.payouts.showInitial) + Number(tournamentState.payouts.showFinal)).fill("md")))}>${tCols(["xs", "tmd"].concat(new Array(Number(tournamentState.payouts.showInitial) + Number(tournamentState.payouts.showFinal)).fill("md")))}<thead><tr><th>MIEJSCE</th><th>GRACZ</th>${initialHeader}${finalHeader}</tr></thead><tbody>${payoutRows || `<tr><td colspan="${2 + Number(tournamentState.payouts.showInitial) + Number(tournamentState.payouts.showFinal)}">Brak danych.</td></tr>`}</tbody></table></div>
      `;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

      mount.innerHTML = '<p class="builder-info">Brak widoku dla wybranej sekcji.</p>';
    } catch (error) {
      console.error("Błąd renderowania sekcji admina turnieju:", { activeSection, error });
      mount.innerHTML = `<p class="builder-info">Nie udało się wyrenderować sekcji „${esc(activeSection)}”.</p><p class="builder-info">Szczegóły: ${esc(error?.message || "Brak szczegółów błędu.")}</p>`;
    }
  };

  container.addEventListener("input", async (event) => {
    const target = event.target;
    const role = target?.dataset?.role;
    if (!role) return;
    if (["meta-buyin", "meta-rebuy", "meta-rake", "meta-stack", "meta-rebuystack", "player-pin", "table-entry", "group-stack", "group-eliminated-win", "group-survivor-stack", "pool-split", "pool-rebuy-value", "semi-final-stack"].includes(role)) {
      target.value = digitsOnly(target.value);
    }
    if (role === "pool-mod") {
      target.value = signedDigitsOnly(target.value);
    }

    if (role === "meta-organizer") tournamentState.organizer = target.value;
    if (role === "meta-buyin") tournamentState.buyIn = target.value;
    if (role === "meta-rebuy") tournamentState.rebuyAddOn = target.value;
    if (role === "meta-rake") tournamentState.rake = target.value;
    if (role === "meta-stack") tournamentState.stack = target.value;
    if (role === "meta-rebuystack") tournamentState.rebuyStack = target.value;
    if (role === "player-name") tournamentState.players = tournamentState.players.map((player) => player.id === target.dataset.playerId ? { ...player, name: target.value } : player);
    if (role === "player-pin") {
      target.value = digitsOnly(target.value).slice(0, 5);
      const playerId = target.dataset.playerId;
      const duplicateOwnerId = target.value.length === 5 ? getPinOwnerId(target.value, playerId) : null;
      if (duplicateOwnerId) {
        const currentPin = tournamentState.players.find((player) => player.id === playerId)?.pin || "";
        target.value = currentPin;
        target.setCustomValidity("Ten PIN jest już przypisany do innego gracza.");
        target.reportValidity();
        return;
      }
      target.setCustomValidity("");
      tournamentState.players = tournamentState.players.map((player) => player.id === target.dataset.playerId ? { ...player, pin: target.value } : player);
    }
    if (role === "table-name") tournamentState.tables = tournamentState.tables.map((table) => table.id === target.dataset.tableId ? { ...table, name: target.value } : table);
    if (["player-payment-status", "assign-table", "semi-assign-table"].includes(role)) {
      return;
    }
    if (role === "table-entry") {
      tournamentState.tableEntries[target.dataset.tableId] = tournamentState.tableEntries[target.dataset.tableId] || {};
      tournamentState.tableEntries[target.dataset.tableId][target.dataset.playerId] = target.value;
      render();
    }
    if (role === "group-stack") tournamentState.group.playerStacks[target.dataset.playerId] = target.value;
    if (role === "group-eliminated-win") tournamentState.group.eliminatedWins[target.dataset.playerId] = target.value || "0";
    if (role === "group-survivor-stack") tournamentState.group.survivorStacks[target.dataset.playerId] = target.value;
    if (role === "semi-final-stack") {
      tournamentState.semi.assignments[target.dataset.playerId] = {
        ...(tournamentState.semi.assignments[target.dataset.playerId] || {}),
        tableId: tournamentState.semi.assignments[target.dataset.playerId]?.tableId || "",
        eliminated: !!tournamentState.semi.assignments[target.dataset.playerId]?.eliminated,
        finalStack: target.value || "0"
      };
      render();
    }
    if (role === "pool-split") tournamentState.pool.mods = tournamentState.pool.mods.map((row) => row.id === target.dataset.id ? { ...row, split: target.value } : row);
    if (role === "pool-mod") {
      const modKey = target.dataset.modKey || "mod1";
      tournamentState.pool.mods = tournamentState.pool.mods.map((row) => row.id === target.dataset.id ? { ...row, [modKey]: target.value } : row);
    }
    if (role === "pool-rebuy-value") {
      const colIdx = Number(target.dataset.colIndex);
      tournamentState.pool.rebuyCells = asObject(tournamentState.pool.rebuyCells);
      const rebuyCells = tournamentState.pool.rebuyCells;
      if (Number.isInteger(colIdx) && lastPoolRebuyMatrix && !isPoolRebuyColumnManual(tournamentState.pool.mods, rebuyCells, colIdx)) {
        /* Pierwsza korekta w tej kolumnie: utrwalamy bieżący rozkład wszystkich
           wierszy, więc od teraz kolumna pokazuje wyłącznie wpisy ręczne. */
        lastPoolRebuyMatrix.rowIds.forEach((rowId, rowIdx) => {
          rebuyCells[rowId] = asObject(rebuyCells[rowId]);
          rebuyCells[rowId][colIdx] = lastPoolRebuyMatrix.matrix[rowIdx]?.[colIdx] ?? "";
        });
      }
      rebuyCells[target.dataset.id] = asObject(rebuyCells[target.dataset.id]);
      rebuyCells[target.dataset.id][target.dataset.colIndex] = target.value;
    }
    if (role === "semi-custom-name") tournamentState.semi.customTables = tournamentState.semi.customTables.map((table) => table.id === target.dataset.id ? { ...table, name: target.value } : table);


    pendingLocalWrites += 1;
    try {
      await saveState();
    } finally {
      pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
      commitDeferredSnapshotIfSafe();
    }
  });

  container.addEventListener("change", async (event) => {
    const target = event.target;
    const role = target?.dataset?.role;
    if (!role) return;
    if (role === "player-status") tournamentState.players = tournamentState.players.map((player) => player.id === target.dataset.playerId ? { ...player, status: target.checked } : player);
    if (role === "player-payment-status") tournamentState.assignments[target.dataset.playerId] = { ...(tournamentState.assignments[target.dataset.playerId] || {}), status: target.checked ? "Opłacone" : "Do zapłaty", tableId: tournamentState.assignments[target.dataset.playerId]?.tableId || "" };
    if (role === "assign-table") tournamentState.assignments[target.dataset.playerId] = { ...(tournamentState.assignments[target.dataset.playerId] || {}), tableId: target.value, status: tournamentState.assignments[target.dataset.playerId]?.status || "Do zapłaty" };
    if (role === "semi-assign-table") tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), tableId: target.value, eliminated: !!tournamentState.semi.assignments[target.dataset.playerId]?.eliminated };
    if (role === "group-eliminated") tournamentState.group.eliminated[target.dataset.playerId] = target.checked;
    if (role === "semi-player-eliminated") {
      tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), tableId: tournamentState.semi.assignments[target.dataset.playerId]?.tableId || "", eliminated: target.checked };
      if (target.checked && !tournamentState.semi.eliminatedOrder.includes(target.dataset.playerId)) {
        tournamentState.semi.eliminatedOrder.push(target.dataset.playerId);
      }
      if (!target.checked) {
        tournamentState.semi.eliminatedOrder = tournamentState.semi.eliminatedOrder.filter((playerId) => playerId !== target.dataset.playerId);
      }
    }
    if (role === "final-player-eliminated") {
      tournamentState.final.eliminated[target.dataset.playerId] = target.checked;
      if (target.checked && !tournamentState.final.eliminatedOrder.includes(target.dataset.playerId)) {
        tournamentState.final.eliminatedOrder.push(target.dataset.playerId);
      }
      if (!target.checked) {
        tournamentState.final.eliminatedOrder = tournamentState.final.eliminatedOrder.filter((playerId) => playerId !== target.dataset.playerId);
      }
    }
    if (role === "toggle-payout-initial") tournamentState.payouts.showInitial = target.checked;
    if (role === "toggle-payout-final") tournamentState.payouts.showFinal = target.checked;
    if (["player-payment-status", "assign-table", "semi-assign-table", "semi-player-eliminated", "group-eliminated", "final-player-eliminated"].includes(role)) {
      render();
    }
    pendingLocalWrites += 1;
    try {
      await saveState();
    } finally {
      pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
      commitDeferredSnapshotIfSafe();
    }
  });

  const playerPermissionsModal = initSecondPlayerPermissionsModal({
    onSave: async () => {
      render();
      pendingLocalWrites += 1;
      try {
        await saveState();
      } finally {
        pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
        commitDeferredSnapshotIfSafe();
      }
    }
  });

  const tournamentClickActionRoles = new Set([
    "add-player",
    "player-pin-random",
    "player-perm-edit",
    "delete-player",
    "add-table",
    "delete-table",
    "reset-all-rebuy",
    "add-pool-mod-row",
    "remove-pool-mod-row",
    "open-table12-rebuy",
    "add-semi-table",
    "remove-semi-table",
    "group-eliminated-move",
    "semi-eliminated-move",
    "final-eliminated-move"
  ]);

  container.addEventListener("click", async (event) => {
    const actionElement = event.target instanceof Element ? event.target.closest("[data-role]") : null;
    const target = actionElement || event.target;
    const role = actionElement?.dataset?.role;
    if (!role) return;
    if (!tournamentClickActionRoles.has(role)) return;

    if (role === "add-player") {
      tournamentState.players.push({ id: crypto.randomUUID(), name: "", pin: "", permissions: "", status: false });
    }
    if (role === "player-pin-random") {
      const playerId = target.dataset.playerId;
      tournamentState.players = tournamentState.players.map((player) => player.id === playerId ? { ...player, pin: generateUniquePin(playerId) } : player);
    }
    if (role === "player-perm-edit") {
      const playerId = target.dataset.playerId;
      playerPermissionsModal.open({
        playerId,
        getPermissions: (id) => tournamentState.players.find((player) => player.id === id)?.permissions,
        setPermissions: (id, nextPermissions) => {
          tournamentState.players = tournamentState.players.map((player) => player.id === id ? { ...player, permissions: nextPermissions } : player);
        }
      });
      return;
    }
    let deletedPaths = [];
    if (role === "delete-player") {
      const playerId = target.dataset.playerId;
      tournamentState.players = tournamentState.players.filter((player) => player.id !== playerId);
      delete tournamentState.assignments[playerId];
      Object.keys(tournamentState.tableEntries).forEach((tableId) => {
        if (tournamentState.tableEntries[tableId]?.[playerId] !== undefined) {
          delete tournamentState.tableEntries[tableId][playerId];
        }
      });
      delete tournamentState.group.playerStacks[playerId];
      delete tournamentState.group.eliminated[playerId];
      tournamentState.group.eliminatedOrder = (tournamentState.group.eliminatedOrder || []).filter((id) => id !== playerId);
      delete tournamentState.group.eliminatedWins[playerId];
      delete tournamentState.group.survivorStacks[playerId];
      delete tournamentState.semi.assignments[playerId];
      tournamentState.semi.eliminatedOrder = (tournamentState.semi.eliminatedOrder || []).filter((id) => id !== playerId);
      if (tournamentState.final?.eliminated) {
        delete tournamentState.final.eliminated[playerId];
      }
      tournamentState.final.eliminatedOrder = (tournamentState.final.eliminatedOrder || []).filter((id) => id !== playerId);
      delete tournamentState.payments.table12Rebuys[playerId];
      tournamentState.finalPlayers = tournamentState.finalPlayers.filter((player) => player.id !== playerId);
      deletedPaths.push(`payments.table12Rebuys.${playerId}`);
      deletedPaths = deletedPaths.concat(getAutomaticRebuyResetDeletedPaths());
    }
    if (role === "add-table") {
      tournamentState.tables.push({ id: crypto.randomUUID(), name: `Stół${tournamentState.tables.length + 1}` });
    }
    if (role === "group-eliminated-move") {
      const playerId = target.dataset.playerId;
      const direction = target.dataset.direction;
      const currentIndex = tournamentState.group.eliminatedOrder.indexOf(playerId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tournamentState.group.eliminatedOrder.length) {
        return;
      }
      const [movedPlayerId] = tournamentState.group.eliminatedOrder.splice(currentIndex, 1);
      tournamentState.group.eliminatedOrder.splice(nextIndex, 0, movedPlayerId);
    }
    if (role === "semi-eliminated-move") {
      const playerId = target.dataset.playerId;
      const direction = target.dataset.direction;
      const currentIndex = tournamentState.semi.eliminatedOrder.indexOf(playerId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tournamentState.semi.eliminatedOrder.length) {
        return;
      }
      const [movedPlayerId] = tournamentState.semi.eliminatedOrder.splice(currentIndex, 1);
      tournamentState.semi.eliminatedOrder.splice(nextIndex, 0, movedPlayerId);
    }
    if (role === "final-eliminated-move") {
      const playerId = target.dataset.playerId;
      const direction = target.dataset.direction;
      const currentIndex = tournamentState.final.eliminatedOrder.indexOf(playerId);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tournamentState.final.eliminatedOrder.length) {
        return;
      }
      const [movedPlayerId] = tournamentState.final.eliminatedOrder.splice(currentIndex, 1);
      tournamentState.final.eliminatedOrder.splice(nextIndex, 0, movedPlayerId);
    }
    if (role === "delete-table") {
      const tableId = target.dataset.tableId;
      const affectedPlayerIds = Object.keys(tournamentState.assignments).filter((playerId) => (
        tournamentState.assignments[playerId]?.tableId === tableId
      ));
      deletedPaths = deletedPaths.concat(removeTable12RebuysForPlayersAndReindex(affectedPlayerIds));
      if (activeTable12RebuyPlayerId && affectedPlayerIds.includes(activeTable12RebuyPlayerId)) {
        await closeTable12RebuyModal();
      }
      tournamentState.tables = tournamentState.tables.filter((table) => table.id !== tableId);
      delete tournamentState.tableEntries[tableId];
      Object.keys(tournamentState.assignments).forEach((key) => {
        if (tournamentState.assignments[key]?.tableId === tableId) tournamentState.assignments[key].tableId = "";
      });
      Object.keys(tournamentState.semi.assignments).forEach((key) => {
        if (tournamentState.semi.assignments[key]?.tableId === tableId) tournamentState.semi.assignments[key].tableId = "";
      });
      deletedPaths = deletedPaths.concat(getAutomaticRebuyResetDeletedPaths());
    }
    if (role === "reset-all-rebuy") {
      await resetAllTable12Rebuys();
      return;
    }
    if (role === "open-table12-rebuy") {
      openTable12RebuyModal(target.dataset.playerId || "");
      return;
    }
    if (role === "add-pool-mod-row") tournamentState.pool.mods.push({ id: crypto.randomUUID(), split: "", modR5: "", mod1: "", mod2: "", mod3: "" });
    if (role === "remove-pool-mod-row" && tournamentState.pool.mods.length > 1) tournamentState.pool.mods = tournamentState.pool.mods.slice(0, -1);
    if (role === "add-semi-table") tournamentState.semi.customTables.push({ id: crypto.randomUUID(), name: `Stół${tournamentState.semi.customTables.length + 1}` });
    if (role === "remove-semi-table") {
      const tableId = target.dataset.id || "";
      tournamentState.semi.customTables = tournamentState.semi.customTables.filter((table) => table.id !== tableId);
      Object.keys(tournamentState.semi.assignments).forEach((playerId) => {
        if (tournamentState.semi.assignments[playerId]?.tableId === tableId) {
          tournamentState.semi.assignments[playerId] = {
            ...tournamentState.semi.assignments[playerId],
            tableId: ""
          };
          tournamentState.semi.eliminatedOrder = (tournamentState.semi.eliminatedOrder || []).filter((id) => id !== playerId);
        }
      });
    }
    render();
    pendingLocalWrites += 1;
    try {
      await saveState({ deletedPaths });
    } finally {
      pendingLocalWrites = Math.max(0, pendingLocalWrites - 1);
      commitDeferredSnapshotIfSafe();
    }
  });

  registerAdminRefreshHandler("adminTournamentTab", async () => {
    const snapshot = await docRef.get({ source: "server" });
    tournamentState = normalizeTournamentState(snapshot.data());
    tournamentStatusMessage = "";
    render();
  });

  const sectionButtons = Array.from(container.querySelectorAll("[data-tournament-target]"));
  sectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeSection = button.dataset.tournamentTarget;
      render();
    });
  });

  docRef.onSnapshot((snapshot) => {
    const snapshotState = normalizeTournamentState(snapshot.data());
    if (hasActiveEdit || pendingLocalWrites > 0 || isTable12RebuyModalEditing()) {
      deferredSnapshotState = snapshotState;
      return;
    }
    tournamentState = snapshotState;
    tournamentStatusMessage = "";
    render();
  }, () => {
    tournamentStatusMessage = "Nie udało się pobrać danych turnieju z Firebase. Widok pokazuje dane lokalne.";
    render();
  });
};

const setupUserView = (root) => {
  const tabButtons = Array.from(root.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(root.querySelectorAll(".tab-panel"));
  const setActiveUserTab = (target) => {
    if (!target) {
      return;
    }
    tabButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.target === target));
    tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.id === target));
  };

  setupTournamentButtons(root);

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const toNumber = (value) => {
    const normalized = String(value ?? "").replace(",", ".").trim();
    if (!normalized) return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const formatCellNumber = (value) => {
    if (!Number.isFinite(value)) return "";
    return String(Math.round(value));
  };
  const toPercentText = (value) => `${Math.round((toNumber(value) * 100) * 100) / 100}%`;

  const firebaseApp = getFirebaseApp();
  const newsOutput = root.querySelector("#latestMessageOutput");
  const newsStatus = root.querySelector("#newsOutputStatus");
  const rulesOutput = root.querySelector("#rulesOutput");
  const rulesStatus = root.querySelector("#rulesStatus");
  const tournamentSection = root.querySelector("#tournamentTab .admin-games-section");
  const tournamentDataMount = root.querySelector("#userTournamentDataMount");
  const userPanelRefreshButton = root.querySelector("#userPanelRefresh");
  const userPanelRefreshStatus = root.querySelector("#userPanelRefreshStatus");
  const userPinGate = root.querySelector("#userPlayerPinGate");
  const userPinInput = root.querySelector("#userPlayerPinInput");
  const userPinOpenButton = root.querySelector("#userPlayerPinOpenButton");
  const userPinStatus = root.querySelector("#userPlayerPinStatus");
  const userTournamentStatus = root.querySelector("#userTournamentSectionsStatus");
  const tournamentButtons = Array.from(root.querySelectorAll("#tournamentTab [data-tournament-target]"));
  const protectedTabButtons = tabButtons.filter((button) => button.dataset.requiresPlayerPin === "true");

  let userTournamentState = createTournamentDefaultState();
  let userTournamentSection = "players";
  let userTournamentSession = {
    playerId: "",
    allowedSections: [],
    readonly: true,
    isVerified: false
  };
  let isUserTournamentLoaded = false;
  let userTournamentRenderToken = 0;

  const logUserTournamentTransition = (eventName, details = {}) => {
    console.info("[Second][UserTournament]", {
      event: eventName,
      timestamp: new Date().toISOString(),
      previousSection: userTournamentSection,
      isUserTournamentLoaded,
      isUserPinGateOpen: getSecondUserPinGateState(),
      verifiedUserId: getSecondUserVerifiedPlayerId(),
      ...details
    });
  };

  if (userPinOpenButton) {
    userPinOpenButton.disabled = true;
  }
  if (userPinStatus) {
    userPinStatus.textContent = "Trwa ładowanie danych turnieju...";
  }

  const getTournamentPlayerById = (playerId) => userTournamentState.players.find((player) => player.id === playerId) || null;
  const getTournamentPlayerByPin = (pin) => {
    const normalizedPin = digitsOnly(pin).slice(0, 5);
    if (normalizedPin.length !== 5) {
      return null;
    }
    return userTournamentState.players.find((player) => digitsOnly(player.pin).slice(0, 5) === normalizedPin) || null;
  };
  const getVerifiedUserPlayer = () => {
    const playerId = getSecondUserVerifiedPlayerId();
    if (!playerId) {
      return null;
    }
    return getTournamentPlayerById(playerId);
  };
  const buildUserTournamentSession = (player) => {
    if (!player) {
      return {
        playerId: "",
        allowedSections: [],
        readonly: true,
        isVerified: false
      };
    }
    const allowedSections = SECOND_AVAILABLE_PLAYER_PERMISSIONS
      .map((permission) => permission.key)
      .filter((sectionKey) => isSecondPlayerAllowedForTournamentSection(player, sectionKey));
    return {
      playerId: player.id || "",
      allowedSections,
      readonly: true,
      isVerified: true
    };
  };
  const applyUserTournamentSession = (player, options = {}) => {
    const nextSession = buildUserTournamentSession(player);
    userTournamentSession = nextSession;
    const { preserveSection = false } = options;
    if (nextSession.allowedSections.includes(userTournamentSection) && preserveSection) {
      return nextSession;
    }
    if (nextSession.allowedSections.length > 0) {
      userTournamentSection = nextSession.allowedSections[0];
      return nextSession;
    }
    userTournamentSection = "players";
    return nextSession;
  };
  const renderTournamentButtonsForPlayer = () => {
    if (!isUserTournamentLoaded) {
      tournamentButtons.forEach((button) => {
        button.style.display = "none";
        button.classList.remove("is-active");
      });
      if (userTournamentStatus) {
        userTournamentStatus.textContent = "Trwa ładowanie danych turnieju...";
      }
      return [];
    }

    const isVerified = userTournamentSession.isVerified;
    const allowedButtons = [];

    tournamentButtons.forEach((button, index) => {
      const sectionKey = button.dataset.tournamentTarget || "";
      const isAllowed = isVerified && userTournamentSession.allowedSections.includes(sectionKey);
      button.style.display = isAllowed ? "block" : "none";
      button.classList.toggle("is-active", isAllowed && userTournamentSection === sectionKey);
      if (isAllowed) {
        allowedButtons.push(button);
      }
      if (!isAllowed && index === 0) {
        button.classList.remove("is-active");
      }
    });

    if (!allowedButtons.length) {
      if (userTournamentStatus) {
        userTournamentStatus.textContent = isVerified
          ? "PIN jest poprawny, ale konto nie ma przypisanych uprawnień Tournament of Poker (kod: TOP-NO-PERMISSION). Poproś administratora o zaznaczenie uprawnień przy graczu i zapisanie turnieju w panelu admina."
          : "Wpisz PIN, aby zobaczyć dostępne panele Tournament of Poker.";
      }
      return [];
    }

    if (userTournamentStatus) {
      userTournamentStatus.textContent = "";
    }

    const allowedTargets = allowedButtons.map((button) => button.dataset.tournamentTarget || "");
    if (!allowedTargets.includes(userTournamentSection)) {
      userTournamentSection = userTournamentSession.allowedSections[0] || "players";
    }
    allowedButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tournamentTarget === userTournamentSection);
    });
    return allowedTargets;
  };
  const getUserTournamentAllowedTargets = () => {
    if (!userTournamentSession.isVerified) {
      return [];
    }
    return [...userTournamentSession.allowedSections];
  };
  const resolveUserTournamentAccessState = () => {
    const isVerified = Boolean(userTournamentSession.isVerified);
    const allowedTargets = getUserTournamentAllowedTargets();
    const sessionReady = isUserTournamentLoaded && (!isVerified || Boolean(userTournamentSession.playerId));
    let reasonCode = "TOP-OK";
    if (!sessionReady) {
      reasonCode = "TOP-SESSION-NOT-READY";
    } else if (!isVerified) {
      reasonCode = "TOP-NO-PERMISSION";
    } else if (!allowedTargets.length) {
      reasonCode = "TOP-NO-PANELS";
    }
    return {
      isVerified,
      allowedTargets,
      sessionReady,
      reasonCode,
      playerId: userTournamentSession.playerId || ""
    };
  };

  const updateProtectedTabsVisibility = () => {
    const isVerified = userTournamentSession.isVerified;
    /* Wszystkie zakładki gracza (Aktualności, Regulamin, Tournament of Poker)
       wymagają PIN-u — bez niego widać wyłącznie bramkę PIN. */
    root.classList.toggle("is-pin-locked", !isVerified);

    if (userPinGate) {
      userPinGate.classList.toggle("is-hidden", isVerified);
      userPinGate.hidden = isVerified;
    }

    protectedTabButtons.forEach((button) => {
      button.style.display = isVerified ? "inline-flex" : "none";
    });

    const activeProtectedTab = protectedTabButtons.find((button) => button.classList.contains("is-active"));
    if (!isVerified && activeProtectedTab) {
      setActiveUserTab("updatesTab");
    }

    renderTournamentButtonsForPlayer();
  };

  const navigateToUserTournamentSection = (targetSection, source = "unknown") => {
    if (!isUserTournamentLoaded) {
      if (userTournamentStatus) {
        userTournamentStatus.textContent = "Trwa ładowanie danych turnieju...";
      }
      return false;
    }
    const requestedSection = String(targetSection || "");
    const accessState = resolveUserTournamentAccessState();
    const allowedTargets = accessState.allowedTargets;
    if (!allowedTargets.includes(requestedSection)) {
      logUserTournamentTransition("section_navigation_blocked", {
        source,
        requestedSection,
        allowedTargets,
        reasonCode: accessState.reasonCode,
        sessionReady: accessState.sessionReady
      });
      return false;
    }
    const previousSection = userTournamentSection;
    userTournamentSection = requestedSection;
    logUserTournamentTransition("section_navigation", {
      source,
      previousSection,
      finalSection: userTournamentSection,
      allowedTargets
    });
    renderUserTournament();
    return true;
  };

  const renderUserTournament = () => {
    if (!tournamentSection) {
      return;
    }
    const dataMount = tournamentDataMount || tournamentSection;
    watchStackedLayout(dataMount);

    const renderToken = ++userTournamentRenderToken;

    if (!isUserTournamentLoaded) {
      dataMount.innerHTML = '<p class="builder-info">Trwa ładowanie danych turnieju...</p>';
      logUserTournamentTransition("render_waiting_for_snapshot", {
        renderToken
      });
      return;
    }

    renderTournamentButtonsForPlayer();
    const accessState = resolveUserTournamentAccessState();
    const allowedTargets = accessState.allowedTargets;
    logUserTournamentTransition("render_start", {
      renderToken,
      requestedSection: userTournamentSection,
      allowedTargets,
      reasonCode: accessState.reasonCode,
      sessionReady: accessState.sessionReady
    });
    if (!accessState.sessionReady) {
      dataMount.innerHTML = '<p class="builder-info">Trwa przygotowanie uprawnień PIN do Tournament of Poker (kod: TOP-SESSION-NOT-READY). Odczekaj chwilę i spróbuj ponownie.</p>';
      return;
    }
    if (!allowedTargets.length) {
      dataMount.innerHTML = '<p class="builder-info">Brak dostępnych paneli Tournament of Poker dla tego PIN-u (kod: TOP-NO-PANELS). PIN został przyjęty, ale lista dozwolonych sekcji jest pusta. Rozwiązanie: w panelu admina otwórz „Lista graczy”, przypisz uprawnienia turniejowe temu PIN-owi i zapisz turniej.</p>';
      return;
    }

    let readonlyTournamentState = null;

    try {
      const readonlyTournamentStateRaw = userTournamentState.readonlyTables?.rTournamentState;
      if (!readonlyTournamentStateRaw || typeof readonlyTournamentStateRaw !== "object") {
        dataMount.innerHTML = '<p class="builder-info">Brak kopii readonly turnieju (readonlyTables.rTournamentState, kod: TOP-READONLY-MISSING). Widok użytkownika działa wyłącznie na kopii readonly. Rozwiązanie: administrator musi wejść do „Tournament of Poker” w trybie ?admin=1 i zapisać dane turnieju (dowolna zmiana + zapis), aby odtworzyć klucz readonlyTables.rTournamentState.</p>';
        return;
      }
      readonlyTournamentState = normalizeTournamentState(readonlyTournamentStateRaw);
      if (renderToken !== userTournamentRenderToken) {
        logUserTournamentTransition("render_abort_stale_token", {
          renderToken,
          latestToken: userTournamentRenderToken,
          finalSection: userTournamentSection
        });
        return;
      }

      if (userTournamentSection === "players") {
        dataMount.innerHTML = `<div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "tmd", "tlg"], "t-fluid", "players-table")}>${tCols(["xs", "tsm", "tmd", "tmd", "tlg"], "t-fluid")}<thead><tr><th>LP</th><th>Status</th><th>Gracz</th><th>PIN</th><th>Uprawnienia</th></tr></thead><tbody>${readonlyTournamentState.players.map((player, index) => `<tr><td>${index + 1}</td><td>${player.status ? "Aktywny" : "Nieaktywny"}</td><td>${player.name || "-"}</td><td>${digitsOnly(player.pin).slice(0, 5) || "-"}</td><td>${normalizeTournamentPermissions(player.permissions).join(", ") || "-"}</td></tr>`).join("") || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>`;
        return;
      }

      if (userTournamentSection === "draw") {
        const safeDrawPlayers = Array.isArray(readonlyTournamentState.players)
          ? readonlyTournamentState.players.filter((player) => player && typeof player === "object")
          : [];
        const safeDrawTables = Array.isArray(readonlyTournamentState.tables)
          ? readonlyTournamentState.tables.filter((table) => table && typeof table === "object")
          : [];
        const safeDrawAssignments = readonlyTournamentState.assignments && typeof readonlyTournamentState.assignments === "object"
          ? readonlyTournamentState.assignments
          : {};
        const drawBuyInValue = toDigitsNumber(readonlyTournamentState.buyIn);
        const drawTotalsByTable = Object.fromEntries(safeDrawTables.map((table) => [table.id, 0]));
        const drawRowsMarkup = safeDrawPlayers.map((player, index) => {
          const assignment = safeDrawAssignments[player.id] || { status: "Do zapłaty", tableId: "" };
          if (assignment.tableId && Object.prototype.hasOwnProperty.call(drawTotalsByTable, assignment.tableId)) {
            drawTotalsByTable[assignment.tableId] += drawBuyInValue;
          }
          const tableName = safeDrawTables.find((table) => table.id === assignment.tableId)?.name || "-";
          return `<tr><td>${index + 1}</td><td>${player.name || "-"}</td><td>${assignment.status || "Do zapłaty"}</td><td>${tableName}</td></tr>`;
        }).join("");
        const drawPerTableMarkup = safeDrawTables.map((table) => {
          const assignedPlayers = safeDrawPlayers.filter((player) => (safeDrawAssignments[player.id]?.tableId || "") === table.id);
          const total = drawTotalsByTable[table.id] || 0;
          return `<article class="admin-table-card"><div class="t-section-grid"><label>NAZWA <input class="admin-input" readonly value="${esc(table.name || "")}"></label><label>ŁĄCZNA SUMA <input class="admin-input" readonly value="${formatCellNumber(total)}"></label></div><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md"], "t-fluid")}>${tCols(["xs", "tmd", "md"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>BUY-IN</th></tr></thead><tbody>${assignedPlayers.map((player, index) => `<tr><td>${index + 1}</td><td>${esc(player.name || "-")}</td><td>${formatCellNumber(drawBuyInValue)}</td></tr>`).join("") || '<tr><td colspan="3">Brak przypisanych graczy.</td></tr>'}</tbody></table></div></article>`;
        }).join("");
        dataMount.innerHTML = `<div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "tsm", "tsm"], "t-fluid")}>${tCols(["xs", "tmd", "tsm", "tsm"], "t-fluid")}<thead><tr><th>LP</th><th>Gracz</th><th>Status wpłaty</th><th>Stół</th></tr></thead><tbody>${drawRowsMarkup || '<tr><td colspan="4">Brak przypisań.</td></tr>'}</tbody></table></div><div class="semi-tables">${drawPerTableMarkup || "<p>Brak stołów.</p>"}</div>`;
        return;
      }

      /* Wiersze i baza Tabeli16 w widoku gracza — wspólne dla „Podziału puli”
         i „Wypłat”, żeby obie zakładki pokazywały te same KWOTA i SUMA. */
      const getUserPoolRows = () => (Array.isArray(readonlyTournamentState.pool?.mods)
        ? readonlyTournamentState.pool.mods.filter((row) => row && typeof row === "object")
        : []);
      const getUserPoolBuyIn = (userTable11) => toNumber(readonlyTournamentState.payments?.table11?.buyIn) || userTable11.buyIn;

      const buildUserBaseViewModel = () => {
        const safeUserPlayers = Array.isArray(readonlyTournamentState.players)
          ? readonlyTournamentState.players.filter((player) => player && typeof player === "object")
          : [];
        const safeUserTables = Array.isArray(readonlyTournamentState.tables)
          ? readonlyTournamentState.tables.filter((table) => table && typeof table === "object")
          : [];
        const safeUserAssignments = readonlyTournamentState.assignments && typeof readonlyTournamentState.assignments === "object"
          ? readonlyTournamentState.assignments
          : {};
        const safeTable12Rebuys = readonlyTournamentState.payments?.table12Rebuys && typeof readonlyTournamentState.payments?.table12Rebuys === "object"
          ? readonlyTournamentState.payments.table12Rebuys
          : {};
        const userGroupedDrawRows = [];
        let userLpCounter = 1;
        safeUserTables.forEach((table) => {
          safeUserPlayers.forEach((player) => {
            if (!player?.id || !table?.id) {
              return;
            }
            if ((safeUserAssignments[player.id]?.tableId || "") === table.id) {
              userGroupedDrawRows.push({
                tableId: table.id,
                tableName: table.name || "Bez nazwy",
                lp: userLpCounter++,
                playerId: player.id,
                playerName: player.name || ""
              });
            }
          });
        });
        const userAllRebuyValues = Object.values(safeTable12Rebuys)
          .reduce((acc, entry) => {
            if (!Array.isArray(entry?.values)) {
              return acc;
            }
            entry.values.forEach((value) => {
              if (typeof value === "string" || typeof value === "number") {
                acc.push(value);
              }
            });
            return acc;
          }, [])
          .filter((value) => String(value ?? "").trim())
          .map((value) => toDigitsNumber(value));
        const userBuyInValue = toDigitsNumber(readonlyTournamentState.buyIn);
        const userTotalBuyInFromDraw = userGroupedDrawRows.length * userBuyInValue;
        const userRakePercent = percentInputToDecimal(readonlyTournamentState.rake);
        const userAdjustedRebuyValues = userAllRebuyValues.map((value) => value * (1 - userRakePercent));
        const userRebuyTotal = userAllRebuyValues.reduce((sum, value) => sum + value, 0);
        const userTable10 = {
          buyIn: toDigitsNumber(readonlyTournamentState.buyIn),
          rebuyAddOn: toDigitsNumber(readonlyTournamentState.rebuyAddOn),
          sum: userTotalBuyInFromDraw + userRebuyTotal,
          rebuyCount: userAllRebuyValues.length
        };
        const userTable11 = {
          percent: userRakePercent,
          rake: (userTotalBuyInFromDraw + userRebuyTotal) * userRakePercent,
          buyIn: userTotalBuyInFromDraw * (1 - userRakePercent),
          rebuyAddOn: userRebuyTotal * (1 - userRakePercent),
          pot: 0
        };
        userTable11.pot = userTable11.buyIn + userTable11.rebuyAddOn;
        return {
          safeUserPlayers,
          safeUserTables,
          safeUserAssignments,
          safeTable12Rebuys,
          userGroupedDrawRows,
          userAllRebuyValues,
          userAdjustedRebuyValues,
          userBuyInValue,
          userTable10,
          userTable11
        };
      };

      const renderSectionError = (stage, error) => {
        const diagnostics = {
          section: userTournamentSection,
          stage,
          errorName: error?.name || "Error",
          errorMessage: error?.message || "Brak szczegółów błędu",
          playersCount: Array.isArray(userTournamentState.players) ? userTournamentState.players.length : 0,
          tablesCount: Array.isArray(userTournamentState.tables) ? userTournamentState.tables.length : 0,
          poolModsCount: Array.isArray(readonlyTournamentState?.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
          semiCustomTablesCount: Array.isArray(readonlyTournamentState?.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
        };
        console.error("Błąd renderowania sekcji turnieju użytkownika:", {
          ...diagnostics,
          error
        });
        dataMount.innerHTML = `<p class="builder-info">Nie udało się wyrenderować sekcji „${esc(userTournamentSection)}” (etap: ${esc(stage)}). Sprawdź dane turniejowe i spróbuj odświeżyć.</p><p class="builder-info">Szczegóły: ${esc(`${diagnostics.errorName}: ${diagnostics.errorMessage}`)}</p>`;
      };

      if (userTournamentSection === "payments") {
        try {
          const {
            safeTable12Rebuys,
            userGroupedDrawRows,
            userBuyInValue,
            userTable10,
            userTable11
          } = buildUserBaseViewModel();
          const paymentsStripeClasses = getAlternatingTableGroupClass(userGroupedDrawRows, (row) => row.tableId);
          const userPlayerBuyInById = Object.fromEntries(userGroupedDrawRows.map((row) => [row.playerId, userBuyInValue]));
          const getUserPlayerRebuyTotal = (playerId) => {
            const state = safeTable12Rebuys[playerId];
            if (!state || !Array.isArray(state.values)) {
              return 0;
            }
            return state.values.reduce((sum, value) => sum + toDigitsNumber(value), 0);
          };
          dataMount.innerHTML = `<h3>TABELA10</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md", "md", "md"], "t-compact")}>${tCols(["md", "md", "md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZ. REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(userTable10.buyIn)}</td><td>${formatCellNumber(userTable10.rebuyAddOn)}</td><td>${formatCellNumber(userTable10.sum)}</td><td>${formatCellNumber(userTable10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA11</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "md", "md", "md", "md"], "t-compact")}>${tCols(["xs", "md", "md", "md", "md"], "t-compact")}<thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(userTable11.percent)}</td><td>${formatCellNumber(userTable11.rake)}</td><td>${formatCellNumber(userTable11.buyIn)}</td><td>${formatCellNumber(userTable11.rebuyAddOn)}</td><td>${formatCellNumber(userTable11.pot)}</td></tr></tbody></table></div><h3>TABELA12</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "md", "act"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "md", "act"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>BUY-IN</th><th>REBUY</th></tr></thead><tbody>${userGroupedDrawRows.map((row, index) => `<tr class="${paymentsStripeClasses[index]}"><td>${row.lp}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(userPlayerBuyInById[row.playerId] || 0)}</td><td>${formatCellNumber(getUserPlayerRebuyTotal(row.playerId))}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("payments", error);
          return;
        }
      }

      const buildAdvancedViewModel = () => {
        const base = buildUserBaseViewModel();
        const { safeUserTables, safeTable12Rebuys, userGroupedDrawRows } = base;
        const userStackValue = toDigitsNumber(readonlyTournamentState.stack);
        const userRebuyStackValue = toDigitsNumber(readonlyTournamentState.rebuyStack);
        const userGroupRows = userGroupedDrawRows.map((row) => {
          const rebuyState = safeTable12Rebuys[row.playerId];
          const rebuyMultiplier = Array.isArray(rebuyState?.values) ? rebuyState.values.filter((value) => String(value ?? "").trim()).length : 0;
          const rebuyAddOnAmount = rebuyMultiplier > 0 ? userRebuyStackValue * rebuyMultiplier : 0;
          return {
            ...row,
            eliminated: !!readonlyTournamentState.group?.eliminated?.[row.playerId],
            rebuyAddOnAmount,
            stackAmount: userStackValue
          };
        });
        const userGroupedByTable = safeUserTables.map((table) => {
          const rowsForTable = userGroupRows.filter((row) => row.tableId === table.id);
          const stack = rowsForTable.reduce((sum, row) => sum + row.stackAmount + row.rebuyAddOnAmount, 0);
          return { table, rows: rowsForTable, stack };
        });
        const userTotalGroupStackBase = userGroupedByTable.reduce((sum, item) => sum + item.stack, 0);
        const userGroupStripeClasses = getAlternatingTableGroupClass(userGroupedDrawRows, (row) => row.tableId);
        const userDefaultEliminatedRows = userGroupRows.filter((row) => row.eliminated);
        const userSyncedEliminatedOrder = syncOrderedPlayerIds(readonlyTournamentState.group?.eliminatedOrder, userDefaultEliminatedRows);
        const userEliminatedRows = userSyncedEliminatedOrder
          .map((playerId) => userDefaultEliminatedRows.find((row) => row.playerId === playerId))
          .filter(Boolean);
        const userSurvivorRows = userGroupRows.filter((row) => !row.eliminated);
        const userSurvivorRowsWithValues = userSurvivorRows.map((row) => {
          const survivorStack = toDigitsNumber(readonlyTournamentState.group?.survivorStacks?.[row.playerId]);
          const share = userTotalGroupStackBase > 0 ? survivorStack / userTotalGroupStackBase : 0;
          return { ...row, survivorStack, share };
        });
        const safeUserSemiCustomTables = Array.isArray(readonlyTournamentState.semi?.customTables)
          ? readonlyTournamentState.semi.customTables.filter((table) => table && typeof table === "object")
          : [];
        const userSemiTableNameById = (tableId) => safeUserSemiCustomTables.find((table) => table.id === tableId)?.name || "";
        const userSemiRowsAll = userSurvivorRowsWithValues.map((row) => {
          const assignment = readonlyTournamentState.semi?.assignments?.[row.playerId] || {};
          const overrideStack = toDigitsNumber(assignment.stack);
          const semiStack = overrideStack > 0 ? overrideStack : row.survivorStack;
          const semiShare = userTotalGroupStackBase > 0 ? semiStack / userTotalGroupStackBase : 0;
          return {
            ...row,
            semiStack,
            semiShare,
            semiTableId: assignment.tableId || "",
            semiTableName: userSemiTableNameById(assignment.tableId || ""),
            semiEliminated: !!assignment.eliminated
          };
        });
        const userSemiTables = safeUserSemiCustomTables.map((table) => {
          const rows = userSemiRowsAll.filter((row) => row.semiTableId === table.id);
          const totalStack = rows.reduce((sum, row) => sum + row.semiStack, 0);
          return { ...table, rows, totalStack };
        });
        const userSemiEliminatedDefaultRows = userSemiRowsAll.filter((row) => row.semiTableId && row.semiEliminated);
        const userSemiEliminatedOrder = syncOrderedPlayerIds(readonlyTournamentState.semi?.eliminatedOrder, userSemiEliminatedDefaultRows);
        const userSemiEliminatedRows = userSemiEliminatedOrder
          .map((playerId) => userSemiEliminatedDefaultRows.find((row) => row.playerId === playerId))
          .filter(Boolean);
        const userFinalPlayerRows = userSemiRowsAll
          .filter((row) => row.semiTableId)
          .map((row) => {
            const assignment = readonlyTournamentState.semi?.assignments?.[row.playerId] || {};
            return {
              ...row,
              finalStack: toDigitsNumber(assignment.finalStack),
              eliminated: !!readonlyTournamentState.final?.eliminated?.[row.playerId]
            };
          });
        const userSortedFinalPlayers = sortPlayersByStackDesc(
          userFinalPlayerRows.map((row) => ({ id: row.playerId, name: row.playerName, stack: String(formatCellNumber(row.finalStack)), eliminated: row.eliminated }))
        );
        const userFinalEliminatedDefaultRows = userSortedFinalPlayers
          .filter((player) => player.eliminated)
          .map((player) => ({ playerId: player.id, playerName: player.name || "-" }));
        const userFinalEliminatedOrder = syncOrderedPlayerIds(readonlyTournamentState.final?.eliminatedOrder, userFinalEliminatedDefaultRows);
        const userFinalEliminatedRows = userFinalEliminatedOrder
          .map((playerId) => userFinalEliminatedDefaultRows.find((row) => row.playerId === playerId))
          .filter(Boolean);
        return {
          ...base,
          userStackValue,
          userRebuyStackValue,
          userGroupRows,
          userGroupedByTable,
          userTotalGroupStackBase,
          userGroupStripeClasses,
          userEliminatedRows,
          userSurvivorRowsWithValues,
          userSemiRowsAll,
          userSemiTables,
          userSemiEliminatedRows,
          userFinalPlayerRows,
          userSortedFinalPlayers,
          userFinalEliminatedRows
        };
      };

      if (userTournamentSection === "pool") {
        try {
          const { userAllRebuyValues, userAdjustedRebuyValues, userTable10, userTable11 } = buildUserBaseViewModel();
          const splitRows = getUserPoolRows();
          const table15BuyIn = getUserPoolBuyIn(userTable11);
          const rebuyColumns = userAllRebuyValues.length;
          const { table15Split, matrix: rebuyMatrix, rowSums } = computePoolTable16({
            rows: splitRows,
            buyIn: table15BuyIn,
            rebuyColumnValues: userAdjustedRebuyValues,
            rebuyCells: readonlyTournamentState.pool?.rebuyCells
          });
          const table16Columns = getPoolTable16Columns(rebuyColumns);
          const renderTable16Header = () => ["<th>LP</th>", "<th>PODZIAŁ</th>", "<th>WYGRANA</th>"]
            .concat(table16Columns.map((column) => (column.type === "rebuy" ? `<th data-rebuy-column>R${column.colIdx + 1}</th>` : `<th>${column.label}</th>`)))
            .concat("<th>SUMA</th>")
            .join("");
          const renderTable16Row = (row, idx) => {
            const dynamicCells = table16Columns.map((column) => (column.type === "rebuy"
              ? `<td data-rebuy-column>${rebuyMatrix[idx][column.colIdx] === "" ? "" : formatCellNumber(toNumber(rebuyMatrix[idx][column.colIdx]))}</td>`
              : `<td>${formatCellNumber(toNumber(row[column.key]))}</td>`)).join("");
            return `<tr><td>${idx + 1}</td><td>${esc(getPoolSplitDisplay(row, idx))}</td><td>${formatCellNumber(rowSums[idx]?.amount || 0)}</td>${dynamicCells}<td>${formatCellNumber(rowSums[idx]?.total || 0)}</td></tr>`;
          };
          dataMount.innerHTML = `<h3>TABELA13</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md", "md", "md"], "t-compact")}>${tCols(["md", "md", "md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZBA REBUY</th></tr></thead><tbody><tr><td>${formatCellNumber(userTable10.buyIn)}</td><td>${formatCellNumber(userTable10.rebuyAddOn)}</td><td>${formatCellNumber(userTable10.sum)}</td><td>${formatCellNumber(userTable10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA14</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "md", "md", "md", "md"], "t-compact")}>${tCols(["xs", "md", "md", "md", "md"], "t-compact")}<thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(userTable11.percent)}</td><td>${formatCellNumber(userTable11.rake)}</td><td>${formatCellNumber(userTable11.buyIn)}</td><td>${formatCellNumber(userTable11.rebuyAddOn)}</td><td>${formatCellNumber(userTable11.pot)}</td></tr></tbody></table></div><h3>TABELA15</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md"], "t-compact")}>${tCols(["md", "md"], "t-compact")}<thead><tr><th>BUY-IN</th><th>PODZIAŁ</th></tr></thead><tbody><tr><td>${formatCellNumber(table15BuyIn)}</td><td>${formatCellNumber(table15Split)}</td></tr></tbody></table></div><h3>TABELA16</h3><div class="admin-table-scroll"><table ${tAttr(tColsAuto(renderTable16Header(), ["xs", "md", "md"], ["md"]), "t-fluid", "tournament-pool-table16")}>${tCols(tColsAuto(renderTable16Header(), ["xs", "md", "md"], ["md"]), "t-fluid")}<thead><tr>${renderTable16Header()}</tr></thead><tbody>${splitRows.map((row, idx) => renderTable16Row(row, idx)).join("") || '<tr><td colspan="8">Brak danych.</td></tr>'}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("pool", error);
          return;
        }
      }

      if (userTournamentSection === "group") {
        try {
          const { userStackValue, userRebuyStackValue, userGroupedByTable, userTotalGroupStackBase, userGroupRows, userGroupStripeClasses, userEliminatedRows, userSurvivorRowsWithValues } = buildAdvancedViewModel();
          dataMount.innerHTML = `<h3>TABELA17</h3><div class="admin-table-scroll"><table ${tAttr(["md", "md"], "t-compact")}>${tCols(["md", "md"], "t-compact")}<thead><tr><th>STACK GRACZA</th><th>REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(userStackValue)}</td><td>${formatCellNumber(userRebuyStackValue)}</td></tr></tbody></table></div><h3>TABELA18</h3><div class="admin-table-scroll"><table ${tAttr(new Array(userGroupedByTable.length + 1).fill("md"), "t-compact")}>${tCols(new Array(userGroupedByTable.length + 1).fill("md"), "t-compact")}<thead><tr>${userGroupedByTable.map(({ table }) => `<th class="table18-dynamic-header">${esc(table.name)}</th>`).join("")}<th>ŁĄCZNY STACK</th></tr></thead><tbody><tr>${userGroupedByTable.map(({ stack }) => `<td>${formatCellNumber(stack)}</td>`).join("")}<td>${formatCellNumber(userTotalGroupStackBase)}</td></tr></tbody></table></div><h3>TABELA19</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "flag", "md", "md"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "flag", "md", "md"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>ELIMINATED</th><th>STACK</th><th>REBUY/ADD-ON</th></tr></thead><tbody>${userGroupRows.map((row, idx) => `<tr class="${userGroupStripeClasses[idx]}"><td>${row.lp}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td>${row.eliminated ? "Tak" : "Nie"}</td><td>${formatCellNumber(row.stackAmount)}</td><td>${formatCellNumber(row.rebuyAddOnAmount)}</td></tr>`).join("") || '<tr><td colspan="6">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA19A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md"], "t-fluid")}>${tCols(["xs", "tmd", "md"], "t-fluid")}<thead><tr><th>LP</th><th>WYELIMINOWANI GRACZE</th><th>WYGRANA</th></tr></thead><tbody>${userEliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(toNumber(readonlyTournamentState.group?.eliminatedWins?.[row.playerId] || "0"))}</td></tr>`).join("") || '<tr><td colspan="3">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA19B</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tsm", "tmd", "md", "xs"], "t-fluid")}>${tCols(["xs", "tsm", "tmd", "md", "xs"], "t-fluid")}<thead><tr><th>LP</th><th>STÓŁ</th><th>GRACZ</th><th>STACK</th><th>%</th></tr></thead><tbody>${userSurvivorRowsWithValues.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.tableName)}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(row.survivorStack)}</td><td>${toPercentText(row.share)}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("group", error);
          return;
        }
      }

      if (userTournamentSection === "semi") {
        try {
          const { userSemiTables, userFinalPlayerRows, userTotalGroupStackBase, userSemiRowsAll, userSemiEliminatedRows } = buildAdvancedViewModel();
          const userCustomTables = userSemiTables.map((table, index) => `<article class="admin-table-card"><h4>STÓŁ PÓŁFINAŁOWY NUMER ${index + 1}</h4><div class="t-section-grid"><label>NAZWA <input class="admin-input" readonly value="${esc(table.name || "")}"></label><label>ŁĄCZNY STACK <input class="admin-input" readonly value="${formatCellNumber(table.totalStack)}"></label></div><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "flag"], "t-fluid")}>${tCols(["xs", "tmd", "md", "flag"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>ELIMINATED</th></tr></thead><tbody>${table.rows.map((row, rowIndex) => `<tr><td>${rowIndex + 1}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(row.semiStack)}</td><td>${row.semiEliminated ? "Tak" : "Nie"}</td></tr>`).join("") || '<tr><td colspan="4">Brak przypisanych graczy.</td></tr>'}</tbody></table></div></article>`).join("");
          const userSemiFinalRows = userFinalPlayerRows
            .filter((row) => !row.semiEliminated)
            .sort((a, b) => b.finalStack - a.finalStack)
            .map((row, idx) => {
              const finalShare = userTotalGroupStackBase > 0 ? row.finalStack / userTotalGroupStackBase : 0;
              return `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(row.finalStack)}</td><td>${esc(row.semiTableName)}</td><td>${toPercentText(finalShare)}</td></tr>`;
            }).join("");
          dataMount.innerHTML = `<h3>TABELA21</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "xs", "tsm"], "t-fluid")}>${tCols(["xs", "tmd", "md", "xs", "tsm"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>STÓŁ</th></tr></thead><tbody>${userSemiRowsAll.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(row.semiStack)}</td><td>${toPercentText(row.semiShare)}</td><td>${esc(row.semiTableName || "-")}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA22</h3><div class="semi-tables">${userCustomTables || "<p>Brak stołów półfinałowych.</p>"}</div><h3>TABELA22A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd"], "t-fluid")}>${tCols(["xs", "tmd"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th></tr></thead><tbody>${userSemiEliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td></tr>`).join("") || '<tr><td colspan="2">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA FINAŁOWA</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "tsm", "xs"], "t-fluid")}>${tCols(["xs", "tmd", "md", "tsm", "xs"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>STÓŁ</th><th>%</th></tr></thead><tbody>${userSemiFinalRows || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("semi", error);
          return;
        }
      }

      if (userTournamentSection === "final") {
        try {
          const { userSortedFinalPlayers, userTotalGroupStackBase, userFinalEliminatedRows } = buildAdvancedViewModel();
          dataMount.innerHTML = `<h3>TABELA23</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd", "md", "xs", "flag"], "t-fluid")}>${tCols(["xs", "tmd", "md", "xs", "flag"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>ELIMINATED</th></tr></thead><tbody>${userSortedFinalPlayers.map((player, i) => { const finalShare = userTotalGroupStackBase > 0 ? toDigitsNumber(player.stack) / userTotalGroupStackBase : 0; return `<tr><td>${i + 1}</td><td>${esc(player.name || "-")}</td><td>${formatCellNumber(toDigitsNumber(player.stack))}</td><td>${toPercentText(finalShare)}</td><td>${player.eliminated ? "Tak" : "Nie"}</td></tr>`; }).join("") || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div><h3>TABELA23A</h3><div class="admin-table-scroll"><table ${tAttr(["xs", "tmd"], "t-fluid")}>${tCols(["xs", "tmd"], "t-fluid")}<thead><tr><th>LP</th><th>GRACZ</th></tr></thead><tbody>${userFinalEliminatedRows.map((row, index) => `<tr><td>${index + 1}</td><td>${esc(row.playerName)}</td></tr>`).join("") || '<tr><td colspan="2">Brak danych.</td></tr>'}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("final", error);
          return;
        }
      }

      if (userTournamentSection === "payouts") {
        try {
          const { safeUserPlayers, userAdjustedRebuyValues } = buildAdvancedViewModel();
          const showInitial = !!readonlyTournamentState.payouts?.showInitial;
          const showFinal = !!readonlyTournamentState.payouts?.showFinal;
          const { userTable11 } = buildUserBaseViewModel();
          const { rowSums: payoutRowSums } = computePoolTable16({
            rows: getUserPoolRows(),
            buyIn: getUserPoolBuyIn(userTable11),
            rebuyColumnValues: userAdjustedRebuyValues,
            rebuyCells: readonlyTournamentState.pool?.rebuyCells
          });
          const payoutDefaults = getPayoutDefaultsFromTable16(payoutRowSums);
          const userGroupRowsQueue = syncOrderedPlayerIds(
            readonlyTournamentState.group?.eliminatedOrder,
            (readonlyTournamentState.players || []).filter((player) => readonlyTournamentState.group?.eliminated?.[player.id]).map((player) => ({ playerId: player.id, playerName: player.name || "-" }))
          ).map((playerId) => {
            const player = safeUserPlayers.find((item) => item.id === playerId);
            return { playerId, playerName: player?.name || "-" };
          });
          const userSemiRowsQueue = syncOrderedPlayerIds(
            readonlyTournamentState.semi?.eliminatedOrder,
            (readonlyTournamentState.players || []).filter((player) => {
              const assignment = readonlyTournamentState.semi?.assignments?.[player.id] || {};
              return assignment.tableId && assignment.eliminated;
            }).map((player) => ({ playerId: player.id, playerName: player.name || "-" }))
          ).map((playerId) => {
            const player = safeUserPlayers.find((item) => item.id === playerId);
            return { playerId, playerName: player?.name || "-" };
          });
          const userFinalEliminatedRowsQueue = syncOrderedPlayerIds(
            readonlyTournamentState.final?.eliminatedOrder,
            sortPlayersByStackDesc(readonlyTournamentState.finalPlayers || []).filter((player) => player.eliminated).map((player) => ({ playerId: player.id, playerName: player.name || "-" }))
          ).map((playerId) => {
            const player = safeUserPlayers.find((item) => item.id === playerId);
            return { playerId, playerName: player?.name || "-" };
          });
          const payoutRowsState = buildPlacementRowsFromQueues({
            players: safeUserPlayers,
            groupRows: userGroupRowsQueue,
            semiRows: userSemiRowsQueue,
            finalRows: userFinalEliminatedRowsQueue,
            payoutDefaults
          });
          const payoutRows = payoutRowsState.map((player) => `<tr><td>${player.place}</td><td>${player.playerName || "-"}</td>${showInitial ? `<td>${formatCellNumber(toNumber(player.initialWin))}</td>` : ""}${showFinal ? `<td>${formatCellNumber(toNumber(player.finalWin))}</td>` : ""}</tr>`).join("");
          dataMount.innerHTML = `<div class="admin-table-scroll"><table ${tAttr(["xs", "tmd"].concat(new Array(Number(showInitial) + Number(showFinal)).fill("md")))}>${tCols(["xs", "tmd"].concat(new Array(Number(showInitial) + Number(showFinal)).fill("md")))}<thead><tr><th>Miejsce</th><th>Gracz</th>${showInitial ? "<th>Początkowa wygrana</th>" : ""}${showFinal ? "<th>Końcowa wygrana</th>" : ""}</tr></thead><tbody>${payoutRows || `<tr><td colspan="${2 + Number(showInitial) + Number(showFinal)}">Brak danych.</td></tr>`}</tbody></table></div>`;
          return;
        } catch (error) {
          renderSectionError("payouts", error);
          return;
        }
      }

      dataMount.innerHTML = '<p class="builder-info">Dane tej sekcji są zapisywane do Firebase i dostępne w panelu administratora.</p>';
    } catch (error) {
      const diagnostics = {
        section: userTournamentSection,
        stage: "global",
        errorName: error?.name || "Error",
        errorMessage: error?.message || "Brak szczegółów błędu",
        playersCount: Array.isArray(userTournamentState.players) ? userTournamentState.players.length : 0,
        tablesCount: Array.isArray(userTournamentState.tables) ? userTournamentState.tables.length : 0,
        poolModsCount: Array.isArray(readonlyTournamentState?.pool?.mods) ? readonlyTournamentState.pool.mods.length : 0,
        semiCustomTablesCount: Array.isArray(readonlyTournamentState?.semi?.customTables) ? readonlyTournamentState.semi.customTables.length : 0
      };
      console.error("Błąd renderowania sekcji turnieju użytkownika:", {
        ...diagnostics,
        error
      });
      dataMount.innerHTML = `<p class="builder-info">Nie udało się wyrenderować sekcji „${esc(userTournamentSection)}” (etap: global). Sprawdź dane turniejowe i spróbuj odświeżyć.</p><p class="builder-info">Szczegóły: ${esc(`${diagnostics.errorName}: ${diagnostics.errorMessage}`)}</p>`;
    }
  };

  tournamentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.style.display === "none") {
        return;
      }
      const requestedSection = button.dataset.tournamentTarget || "players";
      navigateToUserTournamentSection(requestedSection, "sidebar_click");
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target || "updatesTab";
      if (button.dataset.requiresPlayerPin === "true" && !getSecondUserPinGateState()) {
        setActiveUserTab("updatesTab");
        if (userPinStatus) {
          userPinStatus.textContent = "Najpierw wpisz PIN gracza, aby odblokować zakładki.";
        }
        return;
      }
      setActiveUserTab(target);
    });
  });

  renderUserTournament();
  updateProtectedTabsVisibility();
  setActiveUserTab("updatesTab");

  if (userPinInput) {
    userPinInput.addEventListener("input", () => {
      userPinInput.value = digitsOnly(userPinInput.value).slice(0, 5);
    });
  }

  const verifyUserPin = () => {
    if (!isUserTournamentLoaded) {
      if (userPinStatus) {
        userPinStatus.textContent = "Trwa ładowanie danych turnieju. Spróbuj ponownie za chwilę.";
      }
      return;
    }

    const pin = digitsOnly(userPinInput?.value || "").slice(0, 5);
    if (pin.length !== 5) {
      if (userPinStatus) {
        userPinStatus.textContent = "Wpisz pełny PIN (5 cyfr).";
      }
      return;
    }

    const matchedPlayer = getTournamentPlayerByPin(pin);
    if (!matchedPlayer) {
      setSecondUserPinGateState(false);
      setSecondUserVerifiedPlayerId("");
      applyUserTournamentSession(null);
      if (userPinStatus) {
        userPinStatus.textContent = "Błędny PIN.";
      }
      updateProtectedTabsVisibility();
      renderUserTournament();
      return;
    }

    setSecondUserPinGateState(true);
    setSecondUserVerifiedPlayerId(matchedPlayer.id);
    applyUserTournamentSession(matchedPlayer);
    setActiveUserTab("updatesTab");
    if (userPinStatus) {
      userPinStatus.textContent = `PIN poprawny. Witaj ${matchedPlayer.name || "graczu"}.`;
    }
    updateProtectedTabsVisibility();
    renderUserTournament();
  };

  userPinOpenButton?.addEventListener("click", verifyUserPin);
  userPinInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyUserPin();
    }
  });

  if (userPanelRefreshButton) {
    userPanelRefreshButton.addEventListener("click", async () => {
      const activePanel = root.querySelector(".tab-panel.is-active");
      const activeTabId = activePanel?.id;
      userPanelRefreshButton.disabled = true;
      if (userPanelRefreshStatus) {
        userPanelRefreshStatus.textContent = "Odświeżanie danych...";
      }

      const setRefreshStatus = (message) => {
        if (userPanelRefreshStatus) {
          userPanelRefreshStatus.textContent = message;
        }
      };

      try {
        if (!firebaseApp) {
          setRefreshStatus("Brak połączenia z Firebase.");
          return;
        }

        const db = firebaseApp.firestore();

        if (activeTabId === "updatesTab") {
          await db.collection(SECOND_ADMIN_MESSAGES_COLLECTION).doc(SECOND_ADMIN_MESSAGES_DOCUMENT).get({ source: "server" });
          setRefreshStatus("Aktualności zostały odświeżone.");
          return;
        }

        if (activeTabId === "rulesTab") {
          await db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(RULES_DOCUMENT).get({ source: "server" });
          setRefreshStatus("Regulamin został odświeżony.");
          return;
        }

        if (activeTabId === "tournamentTab") {
          await db.collection(SECOND_TOURNAMENT_COLLECTION).doc(SECOND_TOURNAMENT_DOCUMENT).get({ source: "server" });
          setRefreshStatus("Turniej został odświeżony.");
          return;
        }

        setRefreshStatus("Dane tej zakładki odświeżają się automatycznie.");
      } catch (error) {
        setRefreshStatus("Nie udało się odświeżyć danych.");
      } finally {
        userPanelRefreshButton.disabled = false;
      }
    });
  }

  if (!firebaseApp) {
    if (newsStatus) {
      newsStatus.textContent = "Uzupełnij konfigurację Firebase, aby zobaczyć aktualności.";
    }
    if (rulesStatus) {
      rulesStatus.textContent = "Uzupełnij konfigurację Firebase, aby zobaczyć regulamin.";
    }
    if (userPinStatus) {
      userPinStatus.textContent = "Uzupełnij konfigurację Firebase, aby zweryfikować PIN gracza.";
    }
    if (userPinOpenButton) {
      userPinOpenButton.disabled = true;
    }
    return;
  }

  const db = firebaseApp.firestore();

  db.collection(SECOND_ADMIN_MESSAGES_COLLECTION).doc(SECOND_ADMIN_MESSAGES_DOCUMENT).onSnapshot(
    (snapshot) => {
      const data = snapshot.data();
      const text = typeof data?.message === "string" ? data.message.trim() : "";
      if (newsOutput) {
        newsOutput.value = text || "Brak wiadomości od administratora.";
      }
      if (newsStatus) {
        newsStatus.textContent = text ? "Pobrano najnowszą wiadomość." : "Brak opublikowanych wiadomości.";
      }
    },
    () => {
      if (newsStatus) {
        newsStatus.textContent = "Nie udało się pobrać aktualności z Firebase.";
      }
    }
  );

  db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(RULES_DOCUMENT).onSnapshot(
    (snapshot) => {
      const data = snapshot.data();
      const text = typeof data?.text === "string" ? data.text.trim() : "";
      if (rulesOutput) {
        rulesOutput.value = text || "Administrator jeszcze nie dodał regulaminu.";
      }
      if (rulesStatus) {
        rulesStatus.textContent = text ? "Regulamin został pobrany." : "Regulamin nie został jeszcze zapisany.";
      }
    },
    () => {
      if (rulesStatus) {
        rulesStatus.textContent = "Nie udało się pobrać regulaminu z Firebase.";
      }
    }
  );

  db.collection(SECOND_TOURNAMENT_COLLECTION).doc(SECOND_TOURNAMENT_DOCUMENT).onSnapshot(
    (snapshot) => {
      userTournamentState = normalizeTournamentState(snapshot.data());
      isUserTournamentLoaded = true;
      if (userPinOpenButton) {
        userPinOpenButton.disabled = false;
      }
      const verifiedUserPlayer = getVerifiedUserPlayer();
      if (!verifiedUserPlayer) {
        setSecondUserPinGateState(false);
        setSecondUserVerifiedPlayerId("");
        applyUserTournamentSession(null);
        if (userPinStatus) {
          userPinStatus.textContent = "Wpisz PIN gracza, aby odblokować zakładki.";
        }
      } else {
        applyUserTournamentSession(verifiedUserPlayer, { preserveSection: true });
      }
      updateProtectedTabsVisibility();
      logUserTournamentTransition("snapshot_applied", {
        requestedSection: userTournamentSection,
        playersCount: Array.isArray(userTournamentState.players) ? userTournamentState.players.length : 0,
        tablesCount: Array.isArray(userTournamentState.tables) ? userTournamentState.tables.length : 0
      });
      renderUserTournament();
    },
    () => {
      if (tournamentSection) {
        const mount = tournamentDataMount || tournamentSection;
        mount.innerHTML = '<p class="builder-info">Nie udało się pobrać danych turnieju z Firebase.</p>';
      }
    }
  );

  if (userPinStatus && getSecondUserPinGateState() && getVerifiedUserPlayer()) {
    const verifiedPlayer = getVerifiedUserPlayer();
    userPinStatus.textContent = `PIN poprawny. Witaj ${verifiedPlayer?.name || "graczu"}.`;
  } else if (userPinStatus) {
    userPinStatus.textContent = "Wpisz PIN gracza, aby odblokować zakładki.";
  }
  updateProtectedTabsVisibility();
};

const createUserViewNode = ({ withWrapperCard = true } = {}) => {
  const template = document.querySelector("#userViewTemplate");
  const fragment = template.content.cloneNode(true);
  const rootCard = fragment.querySelector(".user-card");

  setupUserView(rootCard);

  if (!withWrapperCard) {
    rootCard.classList.remove("card");
    rootCard.style.padding = "0";
    rootCard.style.border = "0";
    rootCard.style.boxShadow = "none";
    rootCard.style.background = "transparent";
  }

  return rootCard;
};

const setupAdminView = () => {
  const template = document.querySelector("#adminViewTemplate");
  const fragment = template.content.cloneNode(true);
  const rootCard = fragment.querySelector(".admin-panel-card");
  const previewMount = fragment.querySelector("#userPreviewMount");

  setupTabs({
    container: rootCard,
    buttonSelector: ".admin-panel-tab",
    panelSelector: ".admin-panel-content",
    getTarget: (button) => button.dataset.target,
    isPanelMatch: (panel, target) => panel.id === target
  });

  setupTournamentButtons(rootCard);

  const userPreview = createUserViewNode({ withWrapperCard: false });
  previewMount.appendChild(userPreview);

  appRoot.appendChild(fragment);

  const initAdminPanelRefresh = () => {
    const refreshButton = rootCard.querySelector("#adminPanelRefresh");
    const panelStatus = rootCard.querySelector("#adminPanelRefreshStatus");
    if (!refreshButton) {
      return;
    }

    const setPanelStatus = (message) => {
      if (panelStatus) {
        panelStatus.textContent = message;
      }
    };

    refreshButton.addEventListener("click", async () => {
      const activePanel = rootCard.querySelector(".admin-panel-content.is-active");
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

  const initAdminNotes = () => {
    const notesInput = rootCard.querySelector("#adminNotesInput");
    const notesSaveButton = rootCard.querySelector("#adminNotesSave");
    const notesStatus = rootCard.querySelector("#adminNotesStatus");

    if (!notesInput || !notesSaveButton || !notesStatus) {
      return;
    }

    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      notesInput.disabled = true;
      notesSaveButton.disabled = true;
      notesStatus.textContent = "Uzupełnij konfigurację Firebase, aby edytować notatki.";
      return;
    }

    const db = firebaseApp.firestore();
    const notesDocRef = db.collection(ADMIN_NOTES_COLLECTION).doc(SECOND_ADMIN_NOTES_DOCUMENT);
    let isSaving = false;
    let hasLocalEdits = false;

    const refreshNotesData = async () => {
      const snapshot = await notesDocRef.get({ source: "server" });
      const data = snapshot.data();
      const notesText = typeof data?.text === "string" ? data.text : "";
      notesInput.value = notesText;
      hasLocalEdits = false;
      notesStatus.textContent = notesText ? "Notatki są aktualne." : "Brak zapisanej treści notatek.";
      notesSaveButton.disabled = false;
    };

    registerAdminRefreshHandler("adminNotesTab", refreshNotesData);

    notesDocRef.onSnapshot(
      (snapshot) => {
        const data = snapshot.data();
        const notesText = typeof data?.text === "string" ? data.text : "";
        if (document.activeElement === notesInput && hasLocalEdits && !isSaving) {
          return;
        }
        notesInput.value = notesText;
        notesStatus.textContent = notesText ? "Notatki są aktualne." : "Brak zapisanej treści notatek.";
        notesSaveButton.disabled = false;
        isSaving = false;
      },
      () => {
        notesStatus.textContent = "Nie udało się pobrać notatek z Firebase.";
      }
    );

    notesInput.addEventListener("input", () => {
      hasLocalEdits = true;
    });

    notesInput.addEventListener("blur", () => {
      hasLocalEdits = false;
    });

    notesSaveButton.addEventListener("click", () => {
      if (isSaving) {
        return;
      }

      hasLocalEdits = false;
      isSaving = true;
      notesSaveButton.disabled = true;
      notesStatus.textContent = "Zapisywanie notatek...";

      void notesDocRef.set({
        text: notesInput.value,
        updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        updatedBy: "web-admin",
        module: "second"
      }, { merge: true })
        .catch(() => {
          isSaving = false;
          notesSaveButton.disabled = false;
          notesStatus.textContent = "Nie udało się zapisać notatek.";
        });
    });
  };

  const initAdminNews = () => {
    const input = rootCard.querySelector("#adminMessageInput");
    const sendButton = rootCard.querySelector("#adminMessageSend");
    const status = rootCard.querySelector("#adminMessageStatus");
    const firebaseApp = getFirebaseApp();

    if (!input || !sendButton || !status) {
      return;
    }

    if (!firebaseApp) {
      input.disabled = true;
      sendButton.disabled = true;
      status.textContent = "Uzupełnij konfigurację Firebase, aby wysyłać wiadomości.";
      return;
    }

    const db = firebaseApp.firestore();
    const newsRef = db.collection(SECOND_ADMIN_MESSAGES_COLLECTION).doc(SECOND_ADMIN_MESSAGES_DOCUMENT);

    registerAdminRefreshHandler("adminNewsTab", async () => {
      await newsRef.get({ source: "server" });
    });

    newsRef.onSnapshot((snapshot) => {
      const data = snapshot.data();
      const message = typeof data?.message === "string" ? data.message : "";
      input.value = message;
      status.textContent = message ? "Aktualna wiadomość została pobrana." : "Brak zapisanej wiadomości.";
    });

    sendButton.addEventListener("click", async () => {
      const message = input.value.trim();
      if (!message) {
        status.textContent = "Wpisz treść wiadomości przed wysłaniem.";
        return;
      }

      sendButton.disabled = true;
      status.textContent = "Wysyłanie wiadomości...";

      try {
        await newsRef.set({
          message,
          createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
          source: "web-admin"
        }, { merge: true });
        status.textContent = "Wiadomość wysłana do graczy.";
      } catch (error) {
        status.textContent = "Nie udało się wysłać wiadomości.";
      } finally {
        sendButton.disabled = false;
      }
    });
  };

  const initAdminRules = () => {
    const input = rootCard.querySelector("#adminRulesInput");
    const saveButton = rootCard.querySelector("#adminRulesSave");
    const status = rootCard.querySelector("#adminRulesStatus");
    const firebaseApp = getFirebaseApp();

    if (!input || !saveButton || !status) {
      return;
    }

    if (!firebaseApp) {
      input.disabled = true;
      saveButton.disabled = true;
      status.textContent = "Uzupełnij konfigurację Firebase, aby edytować regulamin.";
      return;
    }

    const db = firebaseApp.firestore();
    const rulesRef = db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(RULES_DOCUMENT);

    registerAdminRefreshHandler("adminRulesTab", async () => {
      await rulesRef.get({ source: "server" });
    });

    rulesRef.onSnapshot((snapshot) => {
      const data = snapshot.data();
      const text = typeof data?.text === "string" ? data.text : "";
      input.value = text;
      status.textContent = text ? "Regulamin jest aktualny." : "Brak zapisanej treści regulaminu.";
      saveButton.disabled = false;
    });

    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      status.textContent = "Zapisywanie regulaminu...";
      try {
        await rulesRef.set({
          text: input.value,
          updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
          source: "web-admin"
        }, { merge: true });
      } catch (error) {
        saveButton.disabled = false;
        status.textContent = "Nie udało się zapisać regulaminu.";
      }
    });
  };

  initAdminNews();
  initAdminRules();
  initAdminNotes();
  setupAdminTournament(rootCard);
  initAdminPanelRefresh();
};

const setupUserOnlyView = () => {
  const userView = createUserViewNode({ withWrapperCard: true });
  appRoot.appendChild(userView);
};

const initCustomsEmergencyModal = () => {
  const openButton = document.querySelector("#secondCustomsEmergencyButton");
  const modal = document.querySelector("#secondCustomsEmergencyModal");
  const closeButton = document.querySelector("#secondCustomsEmergencyClose");

  if (!openButton || !modal) {
    return;
  }

  const closeModal = () => {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const openModal = () => {
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
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

const runInitStep = (name, initializer) => {
  try {
    initializer();
  } catch (error) {
    console.error(`Nie udało się zainicjalizować sekcji "${name}".`, error);
  }
};

const bootstrap = async () => {
  let isAdminView = false;
  try {
    isAdminView = await resolveAdminMode();
  } catch (error) {
    console.error("Nie udało się ustalić trybu administratora.", error);
  }

  if (adminPasswordBypassNote) {
    adminPasswordBypassNote.hidden = true;
  }

  runInitStep("Modal instrukcji", initInstructionModal);
  runInitStep("Modal kontroli celno-skarbowej", initCustomsEmergencyModal);

  if (isAdminView) {
    runInitStep("Widok administratora", setupAdminView);
  } else {
    runInitStep("Widok użytkownika", setupUserOnlyView);
  }
};

void bootstrap();
