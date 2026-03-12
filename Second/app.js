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
const SECOND_CHAT_COLLECTION = "second_chat_messages";
const SECOND_APP_SETTINGS_COLLECTION = "second_app_settings";
const RULES_DOCUMENT = "rules";
const SECOND_TOURNAMENT_COLLECTION = "second_tournament";
const SECOND_TOURNAMENT_DOCUMENT = "state";
const SECOND_CHAT_PIN_STORAGE_KEY = "secondChatPinVerified";
const SECOND_CHAT_PLAYER_STORAGE_KEY = "secondChatPlayerId";

const shouldRequestAdminAccess = () => new URLSearchParams(window.location.search).get("admin") === "1";

// Funkcja tymczasowo wyłączona: na czas testów pomijamy wymaganie hasła administratora.
const TEMPORARILY_DISABLE_ADMIN_PASSWORD = true;

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

const formatChatTimestamp = (value) => {
  const date = value?.toDate instanceof Function ? value.toDate() : value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "przed chwilą";
  }
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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
    mods: [{ id: crypto.randomUUID(), mod1: "", mod2: "", mod3: "" }],
    rebuyValues: {}
  },
  group: {
    playerStacks: {},
    eliminated: {}
  },
  semi: {
    tables: [],
    assignments: {},
    customTables: []
  },
  finalPlayers: [],
  payouts: {
    showInitial: false,
    showFinal: false
  }
});

const normalizeTournamentState = (value) => {
  const state = {
    ...createTournamentDefaultState(),
    ...(value && typeof value === "object" ? value : {})
  };
  if (!Array.isArray(state.pool?.splits) || !state.pool.splits.length) {
    state.pool = state.pool || {};
    state.pool.splits = [{ id: crypto.randomUUID(), buyIn: "", split: "" }];
  }
  if (!Array.isArray(state.pool?.mods) || !state.pool.mods.length) {
    state.pool = state.pool || {};
    state.pool.mods = [{ id: crypto.randomUUID(), mod1: "", mod2: "", mod3: "" }];
  }
  state.pool.mods = state.pool.mods.map((row) => {
    if (row && typeof row === "object") {
      return {
        ...row,
        mod1: row.mod1 ?? row.mod ?? "",
        mod2: row.mod2 ?? "",
        mod3: row.mod3 ?? ""
      };
    }
    return { id: crypto.randomUUID(), split: "", mod1: "", mod2: "", mod3: "" };
  });

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
  return state;
};

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const ensureTable12RebuyEntryShape = (entry) => {
  const values = Array.isArray(entry?.values) ? entry.values.map((value) => digitsOnly(value)) : [];
  const indexes = Array.isArray(entry?.indexes) && entry.indexes.length === values.length
    ? entry.indexes.map((value, index) => {
      const parsed = Number.parseInt(String(value ?? ""), 10);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : index + 1;
    })
    : Array.from({ length: values.length }, (_, index) => index + 1);
  return { values, indexes };
};
const normalizeTournamentPermissions = (value) => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)));
  }
  if (typeof value !== "string") {
    return [];
  }
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
};

const SECOND_AVAILABLE_PLAYER_PERMISSIONS = [
  { key: "chatTab", label: "Czat" }
];

const getSecondChatPinGateState = () => sessionStorage.getItem(SECOND_CHAT_PIN_STORAGE_KEY) === "1";
const setSecondChatPinGateState = (isVerified) => {
  sessionStorage.setItem(SECOND_CHAT_PIN_STORAGE_KEY, isVerified ? "1" : "0");
};
const setSecondChatVerifiedPlayerId = (playerId) => {
  const normalized = String(playerId ?? "").trim();
  if (normalized) {
    sessionStorage.setItem(SECOND_CHAT_PLAYER_STORAGE_KEY, normalized);
    return;
  }
  sessionStorage.removeItem(SECOND_CHAT_PLAYER_STORAGE_KEY);
};
const getSecondChatVerifiedPlayerId = () => sessionStorage.getItem(SECOND_CHAT_PLAYER_STORAGE_KEY) || "";
const isSecondPlayerAllowedForChat = (player) => normalizeTournamentPermissions(player?.permissions).includes("Czat");

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
    && (element.dataset.id || "") === focusState.id);

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

  const commitDeferredSnapshotIfSafe = () => {
    if (hasActiveEdit || pendingLocalWrites > 0 || !deferredSnapshotState) {
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
    <div class="modal-card modal-card-sm" role="dialog" aria-modal="true" aria-labelledby="secondTable12RebuyTitle">
      <div class="modal-header">
        <h3 id="secondTable12RebuyTitle">Rebuy gracza</h3>
        <button type="button" class="icon-button" data-game-rebuy-close aria-label="Zamknij okno">×</button>
      </div>
      <div class="modal-body">
        <p class="builder-info" data-table12-rebuy-status hidden></p>
        <div class="admin-table-scroll">
          <table class="admin-data-table" id="adminCalculatorRebuyTable" data-game-rebuy-table></table>
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

  const persistTable12RebuyChanges = async (operationLabel = "zapis") => {
    if (!activeTable12RebuyPlayerId) {
      setTable12RebuyModalStatus("Nie można zapisać zmian: brak wskazanego gracza.");
      return false;
    }
    pendingLocalWrites += 1;
    try {
      const saved = await saveState();
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

  const closeTable12RebuyModal = () => {
    activeTable12RebuyPlayerId = "";
    setTable12RebuyModalStatus("");
    table12RebuyModal.classList.remove("is-visible");
    table12RebuyModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  const renderTable12RebuyModal = () => {
    if (!table12RebuyModalTable || !table12RebuyModalActions || !activeTable12RebuyPlayerId) return;
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    const rebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
    tournamentState.payments.table12Rebuys[activeTable12RebuyPlayerId] = rebuyState;

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
      input.addEventListener("input", async () => {
        rebuyState.values[index] = digitsOnly(input.value);
        input.value = rebuyState.values[index];
        await persistTable12RebuyChanges();
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
        const nextIndex = getNextGlobalTable12RebuyIndex();
        activeRebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
        activeRebuyState.values.push("");
        activeRebuyState.indexes.push(nextIndex);
        appended = true;
        const saved = await persistTable12RebuyChanges("Dodaj Rebuy");
        if (!saved) {
          activeRebuyState.values.pop();
          activeRebuyState.indexes.pop();
          renderTable12RebuyModal();
          return;
        }
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
      const backupTable12Rebuys = JSON.parse(JSON.stringify(tournamentState.payments.table12Rebuys || {}));
      const backupPoolRebuyValues = JSON.parse(JSON.stringify(tournamentState.pool?.rebuyValues || {}));
      const activeRebuyState = ensureTable12RebuyState(activeTable12RebuyPlayerId);
      const removedIndex = activeRebuyState.indexes[activeRebuyState.indexes.length - 1];
      activeRebuyState.values = activeRebuyState.values.slice(0, -1);
      activeRebuyState.indexes = activeRebuyState.indexes.slice(0, -1);
      compactTable12RebuyIndexesAfterRemoval(removedIndex);
      try {
        const saved = await persistTable12RebuyChanges("Usuń Rebuy");
        if (!saved) {
          tournamentState.payments.table12Rebuys = backupTable12Rebuys;
          tournamentState.pool = tournamentState.pool || {};
          tournamentState.pool.rebuyValues = backupPoolRebuyValues;
          renderTable12RebuyModal();
          return;
        }
        render();
        renderTable12RebuyModal();
      } catch (error) {
        tournamentState.payments.table12Rebuys = backupTable12Rebuys;
        tournamentState.pool = tournamentState.pool || {};
        tournamentState.pool.rebuyValues = backupPoolRebuyValues;
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

  const saveState = async () => {
    try {
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
  const toDigitsNumber = (value) => Number(digitsOnly(value));
  const toPercentDigits = (value) => {
    const normalized = digitsOnly(value).replace(/^0+(?=\d)/, "");
    return normalized || "0";
  };
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
  const formatPercentDisplay = (value) => {
    const rawDigits = digitsOnly(value);
    if (!rawDigits) return "";
    return `${toPercentDigits(rawDigits)}%`;
  };
  const formatCellNumber = (value) => {
    if (!Number.isFinite(value)) return "";
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2));
  };
  const toPercentText = (value) => `${Math.round((toNumber(value) * 100) * 100) / 100}%`;

  const ensureTable12RebuyState = (playerId) => {
    tournamentState.payments.table12Rebuys = tournamentState.payments.table12Rebuys || {};
    if (!tournamentState.payments.table12Rebuys[playerId]) {
      tournamentState.payments.table12Rebuys[playerId] = { values: [], indexes: [] };
    }
    const normalized = ensureTable12RebuyEntryShape(tournamentState.payments.table12Rebuys[playerId]);
    tournamentState.payments.table12Rebuys[playerId] = normalized;
    return normalized;
  };

  const getAllTable12RebuyEntries = () => Object.keys(tournamentState.payments.table12Rebuys || {})
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

  const getNextGlobalTable12RebuyIndex = () => {
    const maxIndex = getAllTable12RebuyEntries().reduce((max, entry) => Math.max(max, entry.index), 0);
    return maxIndex + 1;
  };

  const remapPoolRebuyValuesAfterRemoval = (removedIndex) => {
    if (!Number.isInteger(removedIndex) || removedIndex <= 0) {
      return;
    }
    tournamentState.pool = tournamentState.pool || {};
    tournamentState.pool.rebuyValues = tournamentState.pool.rebuyValues || {};
    Object.keys(tournamentState.pool.rebuyValues).forEach((rowId) => {
      const saved = tournamentState.pool.rebuyValues[rowId] || {};
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
      tournamentState.pool.rebuyValues[rowId] = remapped;
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
    const rebuyCount = allRebuyValues.length;
    const rebuyTotal = allRebuyValues.reduce((sum, value) => sum + value, 0);

    const table10 = {
      buyIn: toDigitsNumber(tournamentState.buyIn),
      rebuyAddOn: toDigitsNumber(tournamentState.rebuyAddOn),
      sum: totalBuyInFromDraw,
      rebuyCount
    };

    const rakePercent = percentInputToDecimal(tournamentState.rake);
    const table11 = {
      percent: rakePercent,
      rake: table10.sum * rakePercent,
      buyIn: table10.sum * (1 - rakePercent),
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

    if (activeSection === "players") {
      const playersRows = tournamentState.players.map((player) => {
        const assignment = tournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const statusConfig = getPaymentStatusConfig(assignment.status);
        const isPaid = assignment.status === "Opłacone";
        return `
        <tr>
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
        <div class="t-section-grid">
          <label>ORGANIZATOR <input class="admin-input" data-role="meta-organizer" type="text" value="${esc(tournamentState.organizer)}"></label>
          <label>BUY-IN <input class="admin-input" data-role="meta-buyin" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.buyIn)}"></label>
          <label>REBUY/ADD-ON <input class="admin-input" data-role="meta-rebuy" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyAddOn)}"></label>
          <label>RAKE <input class="admin-input" data-role="meta-rake" type="text" inputmode="numeric" value="${esc(formatPercentDisplay(tournamentState.rake))}"></label>
          <label>STACK <input class="admin-input" data-role="meta-stack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.stack)}"></label>
          <label>REBUY/ADD-ON STACK <input class="admin-input" data-role="meta-rebuystack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyStack)}"></label>
        </div>
        <p class="builder-info">Liczba dodanych graczy: ${tournamentState.players.length}</p>
        <div class="admin-table-scroll"><table class="admin-data-table players-table"><thead><tr><th>STATUS</th><th>NAZWA</th><th>PIN</th><th>UPRAWNIENIA</th><th>AKCJE</th></tr></thead><tbody>${playersRows || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>
        <button type="button" class="secondary t-inline-add-button" data-role="add-player">Dodaj gracza</button>
      `;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "draw") {
      const rows = tournamentState.players.map((player) => {
        const assignment = tournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const statusConfig = getPaymentStatusConfig(assignment.status);
        return `<tr><td>${esc(player.name)}</td><td><div class="payment-status-cell"><span class="payment-status-label ${statusConfig.className}">${statusConfig.label}</span></div></td><td><select class="admin-input" data-role="assign-table" data-player-id="${player.id}"><option value="">-</option>${tournamentState.tables.map((table) => `<option value="${table.id}" ${assignment.tableId === table.id ? "selected" : ""}>${esc(table.name)}</option>`).join("")}</select></td></tr>`;
      }).join("");

      const perTableBlocks = tournamentState.tables.map((table) => {
        const assignedPlayers = tournamentState.players.filter((player) => (tournamentState.assignments[player.id]?.tableId || "") === table.id);
        const total = drawTotalsByTable[table.id] || 0;
        return `<article class="admin-table-card"><div class="t-section-grid"><label>NAZWA <input class="admin-input" data-role="table-name" data-table-id="${table.id}" type="text" value="${esc(table.name)}"></label><label>ŁĄCZNA SUMA <input class="admin-input" readonly value="${formatCellNumber(total)}"></label></div><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>GRACZ</th><th>BUY-IN</th></tr></thead><tbody>${assignedPlayers.map((player) => `<tr><td>${esc(player.name)}</td><td>${formatCellNumber(buyInValue)}</td></tr>`).join("") || '<tr><td colspan="2">Brak przypisanych graczy.</td></tr>'}</tbody></table></div><button type="button" class="danger admin-row-delete draw-table-delete" data-role="delete-table" data-table-id="${table.id}">Usuń</button></article>`;
      }).join("");

      mount.innerHTML = `<div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>GRACZ</th><th>STATUS</th><th>STÓŁ</th></tr></thead><tbody>${rows || '<tr><td colspan="3">Brak graczy.</td></tr>'}</tbody></table></div><div class="semi-tables">${perTableBlocks || "<p>Brak stołów.</p>"}</div><button type="button" class="secondary t-inline-add-button" data-role="add-table">Dodaj stół</button>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "payments") {
      mount.innerHTML = `<h3>TABELA10</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZ. REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(table10.buyIn)}</td><td>${formatCellNumber(table10.rebuyAddOn)}</td><td>${formatCellNumber(table10.sum)}</td><td>${formatCellNumber(table10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA11</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(table11.percent)}</td><td>${formatCellNumber(table11.rake)}</td><td>${formatCellNumber(table11.buyIn)}</td><td>${formatCellNumber(table11.rebuyAddOn)}</td><td>${formatCellNumber(table11.pot)}</td></tr></tbody></table></div><h3>TABELA12</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>STÓŁ</th><th>LP</th><th>GRACZ</th><th>BUY-IN</th><th>REBUY</th></tr></thead><tbody>${groupedDrawRows.map((row) => `<tr><td>${esc(row.tableName)}</td><td>${row.lp}</td><td>${esc(row.playerName)}</td><td>${formatCellNumber(playerBuyInById[row.playerId] || 0)}</td><td><button class="secondary" type="button" data-role="open-table12-rebuy" data-player-id="${row.playerId}">${formatCellNumber(getPlayerRebuyTotal(row.playerId))}</button></td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "pool") {
      tournamentState.pool.mods = Array.isArray(tournamentState.pool.mods) ? tournamentState.pool.mods : [];
      while (tournamentState.pool.mods.length < 3) {
        tournamentState.pool.mods.push({ id: crypto.randomUUID(), split: "", mod1: "", mod2: "", mod3: "" });
      }
      const splitRows = tournamentState.pool.mods;
      const splitValues = splitRows.map((row, idx) => idx < 3 ? percentInputToDecimal(row.split) : toNumber(row.split));
      const sumFrom4th = splitValues.slice(3).reduce((sum, value) => sum + value, 0);
      const table15Pot = table11.pot;
      const table15Split = table15Pot - sumFrom4th;

      const rebuyLimit = 30;
      const distributed = allRebuyValues.slice(0, rebuyLimit);
      const overflow = allRebuyValues.slice(rebuyLimit).reduce((sum, value) => sum + value, 0);
      const rebuyColumns = distributed.length;
      tournamentState.pool.rebuyValues = tournamentState.pool.rebuyValues || {};

      const rebuyMatrix = splitRows.map(() => Array.from({ length: rebuyColumns }, () => ""));

      const rebuyRowMapping = [
        1, 2, 3, 4, 1, 2, 3, 4, 5, 1,
        2, 3, 4, 5, 6, 1, 2, 3, 4, 5,
        6, 7, 1, 2, 3, 4, 5, 6, 7, 8
      ];

      for (let colIdx = 0; colIdx < Math.min(30, rebuyColumns); colIdx += 1) {
        const mappedRow = rebuyRowMapping[colIdx] - 1;
        if (mappedRow >= 0 && mappedRow < splitRows.length) {
          rebuyMatrix[mappedRow][colIdx] = formatCellNumber(distributed[colIdx]);
        }
      }

      splitRows.forEach((row, rowIdx) => {
        const saved = tournamentState.pool.rebuyValues[row.id] || {};
        Object.keys(saved).forEach((colKey) => {
          const colIdx = Number(colKey);
          if (Number.isInteger(colIdx) && colIdx >= 30 && colIdx < rebuyColumns) {
            rebuyMatrix[rowIdx][colIdx] = saved[colKey];
          }
        });
      });

      const rowSums = splitRows.map((row, idx) => {
        const split = splitValues[idx] || 0;
        const amount = idx < 3 ? split * table15Split : split;
        const rebuySumRow = rebuyMatrix[idx].reduce((sum, value) => sum + toNumber(value), 0);
        const mod1 = toNumber(row.mod1);
        const mod2 = toNumber(row.mod2);
        const mod3 = toNumber(row.mod3);
        return {
          amount,
          total: amount + rebuySumRow + mod1 + mod2 + mod3
        };
      });

      const userRebuySum = rebuyMatrix.flat().reduce((sum, value) => sum + toNumber(value), 0);
      const undistributedRemainder = Math.max(0, overflow - Math.max(0, userRebuySum - distributed.reduce((sum, value) => sum + value, 0)));
      const modColumns = rebuyColumns > 20 ? ["mod1", "mod2", "mod3"] : rebuyColumns > 12 ? ["mod1", "mod2"] : ["mod1"];
      const getPoolSplitDisplay = (row, index) => {
        const fallback = index === 0 ? "50" : index === 1 ? "30" : index === 2 ? "20" : "";
        const value = row.split || fallback;
        return index < 3 ? formatPercentDisplay(value) : digitsOnly(value);
      };
      const renderModInput = (row, modKey) => `<td><input class="admin-input" data-role="pool-mod" data-mod-key="${modKey}" data-id="${row.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(row[modKey] || "")}"></td>`;
      const renderRebuyColumn = (row, rowIndex, colIdx) => {
        const rebuyNumber = colIdx + 1;
        const mappedRowIndex = rebuyNumber <= 30 ? (rebuyRowMapping[colIdx] - 1) : -1;
        const isAutoAssignedCell = rebuyNumber <= 30 ? mappedRowIndex === rowIndex : false;
        return `<td data-rebuy-column><input class="admin-input" data-role="pool-rebuy-value" data-id="${row.id}" data-col-index="${colIdx}" type="text" value="${esc(rebuyMatrix[rowIndex][colIdx] || '')}" ${isAutoAssignedCell ? "readonly" : ""}></td>`;
      };

      const renderTable16Header = () => {
        const cells = ['<th>LP</th>', '<th>PODZIAŁ PULI</th>', '<th>KWOTA</th>'];
        for (let idx = 0; idx < rebuyColumns; idx += 1) {
          cells.push(`<th data-rebuy-column>REBUY${idx + 1}</th>`);
          if (idx === 11 && modColumns.includes("mod1") && rebuyColumns > 12) cells.push('<th>MOD1</th>');
          if (idx === 19 && modColumns.includes("mod2") && rebuyColumns > 20) cells.push('<th>MOD2</th>');
        }
        if (rebuyColumns <= 12) cells.push('<th>MOD1</th>');
        if (rebuyColumns > 12 && rebuyColumns <= 20) cells.push('<th>MOD2</th>');
        if (rebuyColumns > 20) cells.push('<th>MOD3</th>');
        cells.push('<th>SUMA</th>');
        return cells.join('');
      };

      const renderTable16Row = (row, index) => {
        const cells = [`<td>${index + 1}</td>`, `<td><input class="admin-input" data-role="pool-split" data-id="${row.id}" value="${esc(getPoolSplitDisplay(row, index))}" type="text" inputmode="numeric"></td>`, `<td>${formatCellNumber(rowSums[index].amount)}</td>`];
        for (let colIdx = 0; colIdx < rebuyColumns; colIdx += 1) {
          cells.push(renderRebuyColumn(row, index, colIdx));
          if (colIdx === 11 && modColumns.includes("mod1") && rebuyColumns > 12) cells.push(renderModInput(row, "mod1"));
          if (colIdx === 19 && modColumns.includes("mod2") && rebuyColumns > 20) cells.push(renderModInput(row, "mod2"));
        }
        if (rebuyColumns <= 12) cells.push(renderModInput(row, "mod1"));
        if (rebuyColumns > 12 && rebuyColumns <= 20) cells.push(renderModInput(row, "mod2"));
        if (rebuyColumns > 20) cells.push(renderModInput(row, "mod3"));
        cells.push(`<td>${formatCellNumber(rowSums[index].total)}</td>`);
        return `<tr>${cells.join("")}</tr>`;
      };

      mount.innerHTML = `<h3>TABELA13</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZBA REBUY</th></tr></thead><tbody><tr><td>${formatCellNumber(table10.buyIn)}</td><td>${formatCellNumber(table10.rebuyAddOn)}</td><td>${formatCellNumber(table10.sum)}</td><td>${formatCellNumber(table10.rebuyCount)}</td></tr></tbody></table></div><h3>TABELA14</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>%</th><th>RAKE</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${toPercentText(table11.percent)}</td><td>${formatCellNumber(table11.rake)}</td><td>${formatCellNumber(table11.buyIn)}</td><td>${formatCellNumber(table11.rebuyAddOn)}</td><td>${formatCellNumber(table11.pot)}</td></tr></tbody></table></div><h3>TABELA15</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>POT</th><th>PODZIAŁ</th></tr></thead><tbody><tr><td>${formatCellNumber(table15Pot)}</td><td>${formatCellNumber(table15Split)}</td></tr></tbody></table></div>${undistributedRemainder > 0 ? `<p class="builder-info t-warning">Rebuy do rozdysponowania ${formatCellNumber(undistributedRemainder)}</p>` : ''}<h3>TABELA16</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr>${renderTable16Header()}</tr></thead><tbody>${splitRows.map((row, index) => renderTable16Row(row, index)).join('')}</tbody></table></div><div class="admin-table-actions"><button class="secondary t-inline-add-button" type="button" data-role="add-pool-mod-row">Dodaj</button><button class="danger t-inline-add-button" type="button" data-role="remove-pool-mod-row">Usuń</button></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "group") {
      const stackValue = toDigitsNumber(tournamentState.stack);
      const rebuyStackValue = toDigitsNumber(tournamentState.rebuyStack);
      const groupedByTable = tournamentState.tables.map((table) => {
        const rowsForTable = groupedDrawRows.filter((row) => row.tableId === table.id);
        return {
          table,
          stack: rowsForTable.length * stackValue
        };
      });
      const totalGroupStack = groupedDrawRows.length * stackValue;

      mount.innerHTML = `<h3>TABELA17</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>STACK GRACZA</th><th>REBUY/ADD-ON</th></tr></thead><tbody><tr><td>${formatCellNumber(stackValue)}</td><td>${formatCellNumber(rebuyStackValue)}</td></tr></tbody></table></div><h3>TABELA18</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr>${groupedByTable.map(({ table }) => `<th class="table18-dynamic-header">${esc(table.name)}</th>`).join("")}<th>ŁĄCZNY STACK</th></tr></thead><tbody><tr>${groupedByTable.map(({ stack }) => `<td>${formatCellNumber(stack)}</td>`).join("")}<td>${formatCellNumber(totalGroupStack)}</td></tr></tbody></table></div><h3>TABELA19</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>STÓŁ</th><th>LP</th><th>GRACZ</th><th>ELIMINATED</th><th>STACK</th><th>REBUY/ADD-ON</th><th>REBUY</th></tr></thead><tbody>${groupedDrawRows.map((row) => `<tr><td>${esc(row.tableName)}</td><td>${row.lp}</td><td>${esc(row.playerName)}</td><td><input type="checkbox" data-role="group-eliminated" data-player-id="${row.playerId}" ${tournamentState.group.eliminated[row.playerId] ? "checked" : ""}></td><td>${formatCellNumber(stackValue)}</td><td>${formatCellNumber(rebuyStackValue)}</td><td>${formatCellNumber(getPlayerRebuyTotal(row.playerId))}</td></tr>`).join("") || '<tr><td colspan="7">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "semi") {
      const survivors = groupedDrawRows.filter((row) => !tournamentState.group.eliminated[row.playerId]);
      const customTables = tournamentState.semi.customTables.map((table, index) => `<article class="admin-table-card"><h4>STÓŁ PÓŁFINAŁOWY NUMER ${index + 1} <button type="button" class="danger" data-role="remove-semi-table" data-id="${table.id}">Usuń stół</button></h4><div class="t-section-grid"><label>NAZWA <input class="admin-input" data-role="semi-custom-name" data-id="${table.id}" type="text" value="${esc(table.name || "")}"></label><label>ŁĄCZNY STACK <input class="admin-input" readonly value="0"></label></div><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>ELIMINATED</th><th>%</th></tr></thead><tbody><tr><td>1</td><td></td><td><input class="admin-input" data-role="semi-custom-stack" data-id="${table.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(table.stack || "")}"></td><td><input type="checkbox"></td><td></td></tr></tbody></table></div></article>`).join("");
      mount.innerHTML = `<h3>TABELA21</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>STÓŁ</th></tr></thead><tbody>${survivors.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td></td><td></td><td>${esc(tableNameById(tournamentState.semi.assignments[row.playerId]?.tableId || ""))}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div><h3>TABELA22</h3><button type="button" class="secondary t-inline-add-button" data-role="add-semi-table">Dodaj nowy stół</button><div class="semi-tables">${customTables}</div><h3>TABELA FINAŁOWA</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>STÓŁ</th><th>%</th></tr></thead><tbody>${survivors.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td></td><td>${esc(tableNameById(tournamentState.semi.assignments[row.playerId]?.tableId || ""))}</td><td></td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "final") {
      const finalPlayers = tournamentState.finalPlayers;
      const width = 700;
      const height = 360;
      const cx = width / 2;
      const cy = height / 2;
      const rx = 270;
      const ry = 130;
      const labels = finalPlayers.map((player, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(finalPlayers.length, 1) - Math.PI / 2;
        const x = cx + Math.cos(angle) * (rx + 90);
        const y = cy + Math.sin(angle) * (ry + 55);
        return `<text x="${x}" y="${y}" fill="#ededdf" text-anchor="middle" font-size="13">${esc(player.name || "Gracz")} (${esc(player.stack || 0)})</text>`;
      }).join("");
      mount.innerHTML = `<h3>TABELA23</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>ELIMINATED</th></tr></thead><tbody>${finalPlayers.map((player, i) => `<tr><td>${i + 1}</td><td>${esc(player.name)}</td><td><input class="admin-input" data-role="final-stack" data-id="${player.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(player.stack)}"></td><td></td><td><input type="checkbox" data-role="final-eliminated" data-id="${player.id}" ${player.eliminated ? "checked" : ""}></td></tr>`).join("") || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div><p class="test-controls-note">Przyciski testowe do sprawdzenia poprawności wyświetlania stołu.</p><div class="test-buttons"><button class="danger" type="button" data-role="add-final-player">Dodaj gracza</button><button class="danger" type="button" data-role="remove-final-player">Usuń gracza</button></div><svg viewBox="0 0 ${width} ${height}" class="poker-table-svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0d5f3f" stroke="#d4af37" stroke-width="6"></ellipse>${labels}</svg>`;
    }
  };

  container.addEventListener("input", async (event) => {
    const target = event.target;
    const role = target?.dataset?.role;
    if (!role) return;
    if (["meta-buyin", "meta-rebuy", "meta-rake", "meta-stack", "meta-rebuystack", "player-pin", "table-entry", "group-stack", "final-stack", "pool-split", "pool-mod", "pool-rebuy-value", "semi-custom-stack"].includes(role)) {
      target.value = digitsOnly(target.value);
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
    if (["player-payment-status", "assign-table", "semi-assign-status", "semi-assign-table"].includes(role)) {
      return;
    }
    if (role === "table-entry") {
      tournamentState.tableEntries[target.dataset.tableId] = tournamentState.tableEntries[target.dataset.tableId] || {};
      tournamentState.tableEntries[target.dataset.tableId][target.dataset.playerId] = target.value;
      render();
    }
    if (role === "group-stack") tournamentState.group.playerStacks[target.dataset.playerId] = target.value;
    if (role === "final-stack") tournamentState.finalPlayers = tournamentState.finalPlayers.map((player) => player.id === target.dataset.id ? { ...player, stack: target.value } : player);
    if (role === "pool-split") tournamentState.pool.mods = tournamentState.pool.mods.map((row) => row.id === target.dataset.id ? { ...row, split: target.value } : row);
    if (role === "pool-mod") {
      const modKey = target.dataset.modKey || "mod1";
      tournamentState.pool.mods = tournamentState.pool.mods.map((row) => row.id === target.dataset.id ? { ...row, [modKey]: target.value } : row);
    }
    if (role === "pool-rebuy-value") {
      tournamentState.pool.rebuyValues = tournamentState.pool.rebuyValues || {};
      tournamentState.pool.rebuyValues[target.dataset.id] = tournamentState.pool.rebuyValues[target.dataset.id] || {};
      tournamentState.pool.rebuyValues[target.dataset.id][target.dataset.colIndex] = target.value;
    }
    if (role === "semi-custom-name") tournamentState.semi.customTables = tournamentState.semi.customTables.map((table) => table.id === target.dataset.id ? { ...table, name: target.value } : table);
    if (role === "semi-custom-stack") tournamentState.semi.customTables = tournamentState.semi.customTables.map((table) => table.id === target.dataset.id ? { ...table, stack: target.value } : table);


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
    if (role === "semi-assign-status") tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), status: target.value, tableId: tournamentState.semi.assignments[target.dataset.playerId]?.tableId || "" };
    if (role === "semi-assign-table") tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), tableId: target.value, status: tournamentState.semi.assignments[target.dataset.playerId]?.status || "Do zapłaty" };
    if (role === "group-eliminated") tournamentState.group.eliminated[target.dataset.playerId] = target.checked;
    if (role === "final-eliminated") tournamentState.finalPlayers = tournamentState.finalPlayers.map((player) => player.id === target.dataset.id ? { ...player, eliminated: target.checked } : player);
    if (role === "toggle-payout-initial") tournamentState.payouts.showInitial = target.checked;
    if (role === "toggle-payout-final") tournamentState.payouts.showFinal = target.checked;
    if (["player-payment-status", "assign-table", "semi-assign-status", "semi-assign-table"].includes(role)) {
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
    "add-pool-mod-row",
    "remove-pool-mod-row",
    "open-table12-rebuy",
    "add-semi-table",
    "remove-semi-table",
    "add-final-player",
    "remove-final-player"
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
      delete tournamentState.semi.assignments[playerId];
      delete tournamentState.payments.table12Rebuys[playerId];
    }
    if (role === "add-table") {
      tournamentState.tables.push({ id: crypto.randomUUID(), name: `Stół${tournamentState.tables.length + 1}` });
    }
    if (role === "delete-table") {
      const tableId = target.dataset.tableId;
      tournamentState.tables = tournamentState.tables.filter((table) => table.id !== tableId);
      delete tournamentState.tableEntries[tableId];
      Object.keys(tournamentState.assignments).forEach((key) => {
        if (tournamentState.assignments[key]?.tableId === tableId) tournamentState.assignments[key].tableId = "";
      });
      Object.keys(tournamentState.semi.assignments).forEach((key) => {
        if (tournamentState.semi.assignments[key]?.tableId === tableId) tournamentState.semi.assignments[key].tableId = "";
      });
    }
    if (role === "open-table12-rebuy") {
      openTable12RebuyModal(target.dataset.playerId || "");
      return;
    }
    if (role === "add-pool-mod-row") tournamentState.pool.mods.push({ id: crypto.randomUUID(), split: "", mod1: "", mod2: "", mod3: "" });
    if (role === "remove-pool-mod-row" && tournamentState.pool.mods.length > 1) tournamentState.pool.mods = tournamentState.pool.mods.slice(0, -1);
    if (role === "add-semi-table") tournamentState.semi.customTables.push({ id: crypto.randomUUID(), name: "" });
    if (role === "remove-semi-table") tournamentState.semi.customTables = tournamentState.semi.customTables.filter((table) => table.id !== target.dataset.id);
    if (role === "add-final-player") tournamentState.finalPlayers.push({ id: crypto.randomUUID(), name: `Gracz ${tournamentState.finalPlayers.length + 1}`, stack: "", eliminated: false });
    if (role === "remove-final-player") tournamentState.finalPlayers.pop();
    render();
    pendingLocalWrites += 1;
    try {
      await saveState();
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
    if (hasActiveEdit || pendingLocalWrites > 0) {
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
  setupTabs({
    container: root,
    buttonSelector: ".tab-button",
    panelSelector: ".tab-panel",
    getTarget: (button) => button.dataset.target,
    isPanelMatch: (panel, target) => panel.id === target
  });

  setupTournamentButtons(root);

  const firebaseApp = getFirebaseApp();
  const newsOutput = root.querySelector("#latestMessageOutput");
  const newsStatus = root.querySelector("#newsOutputStatus");
  const rulesOutput = root.querySelector("#rulesOutput");
  const rulesStatus = root.querySelector("#rulesStatus");
  const chatMessages = root.querySelector("#chatMessages");
  const chatInput = root.querySelector("#chatMessageInput");
  const chatSendButton = root.querySelector("#chatSendButton");
  const chatStatus = root.querySelector("#chatStatus");
  const chatPinInput = root.querySelector("#chatPinInput");
  const chatPinOpenButton = root.querySelector("#chatPinOpenButton");
  const chatPinStatus = root.querySelector("#chatPinStatus");
  const chatGate = root.querySelector("#chatTab .pin-gate");
  const chatContent = root.querySelector("#chatTab .chat-content");
  const tournamentSection = root.querySelector("#tournamentTab .admin-games-section");
  const userPanelRefreshButton = root.querySelector("#userPanelRefresh");
  const userPanelRefreshStatus = root.querySelector("#userPanelRefreshStatus");
  const tournamentButtons = Array.from(root.querySelectorAll("#tournamentTab [data-tournament-target]"));

  let userTournamentState = createTournamentDefaultState();
  let userTournamentSection = "players";

  const getTournamentPlayerById = (playerId) => userTournamentState.players.find((player) => player.id === playerId) || null;
  const getTournamentPlayerByPin = (pin) => {
    const normalizedPin = digitsOnly(pin).slice(0, 5);
    if (normalizedPin.length !== 5) {
      return null;
    }
    return userTournamentState.players.find((player) => digitsOnly(player.pin).slice(0, 5) === normalizedPin) || null;
  };
  const getVerifiedChatPlayer = () => {
    const playerId = getSecondChatVerifiedPlayerId();
    if (!playerId) {
      return null;
    }
    return getTournamentPlayerById(playerId);
  };
  const updateSecondChatVisibility = () => {
    const verifiedPlayer = getVerifiedChatPlayer();
    const isAllowed = getSecondChatPinGateState() && Boolean(verifiedPlayer) && isSecondPlayerAllowedForChat(verifiedPlayer);
    if (chatGate) {
      chatGate.classList.toggle("is-hidden", isAllowed);
      chatGate.hidden = isAllowed;
    }
    if (chatContent) {
      chatContent.classList.toggle("is-visible", isAllowed);
    }
    if (chatInput) {
      chatInput.disabled = !isAllowed;
    }
    if (chatSendButton) {
      chatSendButton.disabled = !isAllowed;
    }
    return isAllowed;
  };

  const renderUserTournament = () => {
    if (!tournamentSection) {
      return;
    }

    if (userTournamentSection === "players") {
      tournamentSection.innerHTML = `<div class="admin-table-scroll"><table class="admin-data-table players-table"><thead><tr><th>Status</th><th>Gracz</th><th>PIN</th><th>Uprawnienia</th></tr></thead><tbody>${userTournamentState.players.map((player) => `<tr><td>${player.status ? "Aktywny" : "Nieaktywny"}</td><td>${player.name || "-"}</td><td>${digitsOnly(player.pin).slice(0, 5) || "-"}</td><td>${normalizeTournamentPermissions(player.permissions).join(", ") || "-"}</td></tr>`).join("") || '<tr><td colspan="4">Brak graczy.</td></tr>'}</tbody></table></div>`;
      return;
    }

    if (userTournamentSection === "draw") {
      tournamentSection.innerHTML = `<div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Gracz</th><th>Status wpłaty</th><th>Stół</th></tr></thead><tbody>${userTournamentState.players.map((player) => {
        const assignment = userTournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const tableName = userTournamentState.tables.find((table) => table.id === assignment.tableId)?.name || "-";
        return `<tr><td>${player.name || "-"}</td><td>${assignment.status || "Do zapłaty"}</td><td>${tableName}</td></tr>`;
      }).join("") || '<tr><td colspan="3">Brak przypisań.</td></tr>'}</tbody></table></div>`;
      return;
    }

    if (userTournamentSection === "payments") {
      const t10 = userTournamentState.payments?.table10 || {};
      const t11 = userTournamentState.payments?.table11 || {};
      tournamentSection.innerHTML = `<div class="t-section-grid"><label>Stół 10 — Buy-In <input class="admin-input" readonly value="${t10.buyIn || ""}"></label><label>Stół 10 — Rebuy/Add-On <input class="admin-input" readonly value="${t10.rebuyAddOn || ""}"></label><label>Stół 10 — Suma <input class="admin-input" readonly value="${t10.sum || ""}"></label><label>Stół 10 — Liczba Rebuy <input class="admin-input" readonly value="${t10.rebuyCount || ""}"></label><label>Stół 11 — Procent <input class="admin-input" readonly value="${t11.percent || ""}"></label><label>Stół 11 — Rake <input class="admin-input" readonly value="${t11.rake || ""}"></label><label>Stół 11 — Buy-In <input class="admin-input" readonly value="${t11.buyIn || ""}"></label><label>Stół 11 — Rebuy/Add-On <input class="admin-input" readonly value="${t11.rebuyAddOn || ""}"></label><label>Stół 11 — Pula <input class="admin-input" readonly value="${t11.pot || ""}"></label></div>`;
      return;
    }

    tournamentSection.innerHTML = '<p class="builder-info">Dane tej sekcji są zapisywane do Firebase i dostępne w panelu administratora.</p>';
  };

  tournamentButtons.forEach((button) => {
    button.addEventListener("click", () => {
      userTournamentSection = button.dataset.tournamentTarget || "players";
      renderUserTournament();
    });
  });

  renderUserTournament();

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

        if (activeTabId === "chatTab") {
          await db.collection(SECOND_CHAT_COLLECTION).orderBy("createdAt", "asc").limit(200).get({ source: "server" });
          setRefreshStatus("Czat został odświeżony.");
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
    if (chatStatus) {
      chatStatus.textContent = "Uzupełnij konfigurację Firebase, aby używać czatu.";
    }
    if (chatPinOpenButton) {
      chatPinOpenButton.disabled = true;
    }
    if (chatInput) {
      chatInput.disabled = true;
    }
    if (chatSendButton) {
      chatSendButton.disabled = true;
    }
    return;
  }

  const db = firebaseApp.firestore();

  if (chatPinInput) {
    chatPinInput.addEventListener("input", () => {
      chatPinInput.value = digitsOnly(chatPinInput.value).slice(0, 5);
    });
  }

  const verifyChatPin = () => {
    const pin = digitsOnly(chatPinInput?.value || "").slice(0, 5);
    if (pin.length !== 5) {
      if (chatPinStatus) {
        chatPinStatus.textContent = "Wpisz pełny PIN (5 cyfr).";
      }
      return;
    }

    const matchedPlayer = getTournamentPlayerByPin(pin);
    if (!matchedPlayer || !isSecondPlayerAllowedForChat(matchedPlayer)) {
      if (chatPinStatus) {
        chatPinStatus.textContent = "Błędny PIN lub brak uprawnień do zakładki Czat.";
      }
      setSecondChatPinGateState(false);
      setSecondChatVerifiedPlayerId("");
      updateSecondChatVisibility();
      return;
    }

    setSecondChatPinGateState(true);
    setSecondChatVerifiedPlayerId(matchedPlayer.id);
    if (chatPinStatus) {
      chatPinStatus.textContent = `PIN poprawny. Witaj ${matchedPlayer.name || "graczu"}.`;
    }
    updateSecondChatVisibility();
  };

  chatPinOpenButton?.addEventListener("click", verifyChatPin);
  chatPinInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifyChatPin();
    }
  });

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

  db.collection(SECOND_CHAT_COLLECTION).orderBy("createdAt", "asc").limit(200).onSnapshot(
    (snapshot) => {
      if (!chatMessages) {
        return;
      }

      const docs = snapshot.docs;
      chatMessages.innerHTML = "";
      if (!docs.length) {
        const empty = document.createElement("p");
        empty.className = "chat-empty";
        empty.textContent = "Brak wiadomości.";
        chatMessages.appendChild(empty);
      } else {
        docs.forEach((doc) => {
          const data = doc.data();
          const item = document.createElement("article");
          item.className = "admin-chat-item";

          const meta = document.createElement("div");
          meta.className = "admin-chat-meta";
          meta.textContent = `${typeof data.authorName === "string" ? data.authorName : "Gracz"} • ${formatChatTimestamp(data.createdAt)}`;

          const text = document.createElement("p");
          text.className = "admin-chat-text";
          text.textContent = typeof data.text === "string" ? data.text : "";

          item.append(meta, text);
          chatMessages.appendChild(item);
        });
      }
      if (chatStatus) {
        chatStatus.textContent = "Czat zsynchronizowany.";
      }
    },
    () => {
      if (chatStatus) {
        chatStatus.textContent = "Nie udało się pobrać czatu z Firebase.";
      }
    }
  );

  db.collection(SECOND_TOURNAMENT_COLLECTION).doc(SECOND_TOURNAMENT_DOCUMENT).onSnapshot(
    (snapshot) => {
      userTournamentState = normalizeTournamentState(snapshot.data());
      const verifiedPlayer = getVerifiedChatPlayer();
      if (!verifiedPlayer || !isSecondPlayerAllowedForChat(verifiedPlayer)) {
        setSecondChatPinGateState(false);
        setSecondChatVerifiedPlayerId("");
        if (chatPinStatus) {
          chatPinStatus.textContent = "Wpisz PIN z uprawnieniem Czat, aby odblokować wysyłanie wiadomości.";
        }
      }
      updateSecondChatVisibility();
      renderUserTournament();
    },
    () => {
      if (tournamentSection) {
        tournamentSection.innerHTML = '<p class="builder-info">Nie udało się pobrać danych turnieju z Firebase.</p>';
      }
    }
  );

  chatSendButton?.addEventListener("click", async () => {
    const verifiedPlayer = getVerifiedChatPlayer();
    if (!getSecondChatPinGateState() || !verifiedPlayer || !isSecondPlayerAllowedForChat(verifiedPlayer)) {
      if (chatStatus) {
        chatStatus.textContent = "Najpierw odblokuj czat PIN-em z uprawnieniem Czat.";
      }
      setSecondChatPinGateState(false);
      setSecondChatVerifiedPlayerId("");
      updateSecondChatVisibility();
      return;
    }

    const message = typeof chatInput?.value === "string" ? chatInput.value.trim() : "";
    if (!message) {
      if (chatStatus) {
        chatStatus.textContent = "Wpisz wiadomość przed wysłaniem.";
      }
      return;
    }

    if (chatSendButton) {
      chatSendButton.disabled = true;
    }
    if (chatStatus) {
      chatStatus.textContent = "Wysyłanie wiadomości...";
    }

    try {
      await db.collection(SECOND_CHAT_COLLECTION).add({
        text: message,
        authorName: verifiedPlayer.name || "Gracz",
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        expireAt: firebaseApp.firestore.Timestamp.fromDate(new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)))
      });
      if (chatInput) {
        chatInput.value = "";
      }
      if (chatStatus) {
        chatStatus.textContent = "Wiadomość wysłana do czatu.";
      }
    } catch (error) {
      if (chatStatus) {
        chatStatus.textContent = "Nie udało się wysłać wiadomości do czatu.";
      }
    } finally {
      if (chatSendButton) {
        chatSendButton.disabled = false;
      }
    }
  });

  if (chatPinStatus && getSecondChatPinGateState() && getVerifiedChatPlayer()) {
    const verifiedPlayer = getVerifiedChatPlayer();
    chatPinStatus.textContent = `PIN poprawny. Witaj ${verifiedPlayer?.name || "graczu"}.`;
  } else if (chatPinStatus) {
    chatPinStatus.textContent = "Wpisz PIN z uprawnieniem Czat, aby odblokować wysyłanie wiadomości.";
  }
  updateSecondChatVisibility();
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

  const initAdminChat = () => {
    const list = rootCard.querySelector("#adminChatList");
    const cleanupButton = rootCard.querySelector("#adminChatCleanup");
    const status = rootCard.querySelector("#adminChatStatus");
    const firebaseApp = getFirebaseApp();

    if (!list || !cleanupButton || !status) {
      return;
    }

    if (!firebaseApp) {
      cleanupButton.disabled = true;
      status.textContent = "Uzupełnij konfigurację Firebase, aby moderować czat.";
      return;
    }

    const db = firebaseApp.firestore();
    const chatQuery = db.collection(SECOND_CHAT_COLLECTION).orderBy("createdAt", "asc").limit(200);

    registerAdminRefreshHandler("adminChatTab", async () => {
      await chatQuery.get({ source: "server" });
    });

    chatQuery.onSnapshot((snapshot) => {
      list.innerHTML = "";
      if (snapshot.empty) {
        const empty = document.createElement("p");
        empty.className = "chat-empty";
        empty.textContent = "Brak wiadomości czatu do moderacji.";
        list.appendChild(empty);
        status.textContent = "Brak wiadomości do moderacji.";
        return;
      }

      snapshot.docs.forEach((doc) => {
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
            await db.collection(SECOND_CHAT_COLLECTION).doc(doc.id).delete();
            status.textContent = "Wiadomość usunięta.";
          } catch (error) {
            deleteButton.disabled = false;
            status.textContent = "Nie udało się usunąć wiadomości.";
          }
        });

        actions.appendChild(deleteButton);
        row.append(meta, text, actions);
        list.appendChild(row);
      });
      status.textContent = "Czat zsynchronizowany.";
    });

    cleanupButton.addEventListener("click", async () => {
      cleanupButton.disabled = true;
      status.textContent = "Czyszczenie wiadomości starszych niż 30 dni...";
      let deletedCount = 0;

      try {
        const now = firebaseApp.firestore.Timestamp.now();
        while (true) {
          const expiredSnapshot = await db.collection(SECOND_CHAT_COLLECTION)
            .where("expireAt", "<=", now)
            .limit(200)
            .get();
          if (expiredSnapshot.empty) {
            break;
          }
          const batch = db.batch();
          expiredSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            deletedCount += 1;
          });
          await batch.commit();
        }
        status.textContent = deletedCount ? `Usunięto wiadomości: ${deletedCount}.` : "Brak wiadomości starszych niż 30 dni.";
      } catch (error) {
        status.textContent = "Nie udało się wyczyścić starych wiadomości.";
      } finally {
        cleanupButton.disabled = false;
      }
    });
  };

  initAdminNews();
  initAdminChat();
  initAdminRules();
  initAdminNotes();
  setupAdminTournament(rootCard);
  initAdminPanelRefresh();
};

const setupUserOnlyView = () => {
  const userView = createUserViewNode({ withWrapperCard: true });
  appRoot.appendChild(userView);
};

const bootstrap = async () => {
  const isAdminView = await resolveAdminMode();
  if (adminPasswordBypassNote) {
    adminPasswordBypassNote.hidden = !isAdminView;
  }

  initInstructionModal();

  if (isAdminView) {
    setupAdminView();
  } else {
    setupUserOnlyView();
  }
};

void bootstrap();
