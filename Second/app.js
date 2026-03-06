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
    table11: { percent: "", rake: "", buyIn: "", rebuyAddOn: "", pot: "" }
  },
  pool: {
    splits: [{ id: crypto.randomUUID(), buyIn: "", split: "" }],
    mods: [{ id: crypto.randomUUID(), mod: "" }]
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
    state.pool.mods = [{ id: crypto.randomUUID(), mod: "" }];
  }
  return state;
};

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");
const normalizeTournamentPermissions = (value) => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)));
  }
  if (typeof value !== "string") {
    return [];
  }
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
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

  const esc = (v) => String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const saveState = async () => {
    try {
      await docRef.set({ ...tournamentState, updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp() }, { merge: true });
      tournamentStatusMessage = "";
      return true;
    } catch (error) {
      tournamentStatusMessage = "Nie udało się zapisać danych turnieju do Firebase. Sprawdź konfigurację i uprawnienia.";
      return false;
    }
  };

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

  const tableNameById = (tableId) => tournamentState.tables.find((table) => table.id === tableId)?.name || "-";
  const playerNameById = (playerId) => tournamentState.players.find((player) => player.id === playerId)?.name || "";
  const getPaymentStatusConfig = (status) => {
    const isPaid = status === "Opłacone";
    return {
      label: isPaid ? "Opłacone" : "Do zapłaty",
      className: isPaid ? "is-paid" : "is-unpaid"
    };
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
    if (activeSection === "players") {
      const playersRows = tournamentState.players.map((player) => `
        <tr>
          <td><label class="status-radio"><input data-role="player-status" data-player-id="${player.id}" type="checkbox" ${player.status ? "checked" : ""}><span></span></label></td>
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
      `).join("");

      const rakeValue = digitsOnly(tournamentState.rake);
      const rakeLabel = rakeValue ? `${rakeValue}%` : "";

      mount.innerHTML = `
        ${tournamentStatusMessage ? `<p class="builder-info">${esc(tournamentStatusMessage)}</p>` : ""}
        <div class="t-section-grid">
          <label>ORGANIZATOR <input class="admin-input" data-role="meta-organizer" type="text" value="${esc(tournamentState.organizer)}"></label>
          <label>BUY-IN <input class="admin-input" data-role="meta-buyin" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.buyIn)}"></label>
          <label>REBUY/ADD-ON <input class="admin-input" data-role="meta-rebuy" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyAddOn)}"></label>
          <label>RAKE <input class="admin-input" data-role="meta-rake" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rake)}">${rakeLabel ? `<small>${esc(rakeLabel)}</small>` : ""}</label>
          <label>STACK <input class="admin-input" data-role="meta-stack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.stack)}"></label>
          <label>REBUY/ADD-ON STACK <input class="admin-input" data-role="meta-rebuystack" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.rebuyStack)}"></label>
        </div>
        <p class="builder-info">Liczba dodanych graczy: ${tournamentState.players.length}</p>
        <div class="admin-table-scroll"><table class="admin-data-table players-table"><thead><tr><th>Status</th><th>Nazwa</th><th>PIN</th><th>Uprawnienia</th><th>Akcje</th></tr></thead><tbody>${playersRows || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div>
        <button type="button" class="secondary t-inline-add-button" data-role="add-player">Dodaj gracza</button>
      `;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "draw") {
      const rows = tournamentState.players.map((player) => {
        const assignment = tournamentState.assignments[player.id] || { status: "Do zapłaty", tableId: "" };
        const statusConfig = getPaymentStatusConfig(assignment.status);
        return `<tr><td>${esc(player.name)}</td><td><div class="payment-status-cell"><span class="payment-status-label ${statusConfig.className}">${statusConfig.label}</span><button type="button" class="secondary" data-role="assign-status-toggle" data-player-id="${player.id}">Zmień status</button></div></td><td><select class="admin-input" data-role="assign-table" data-player-id="${player.id}"><option value="">-</option>${tournamentState.tables.map((table) => `<option value="${table.id}" ${assignment.tableId === table.id ? "selected" : ""}>${esc(table.name)}</option>`).join("")}</select></td></tr>`;
      }).join("");

      const perTableBlocks = tournamentState.tables.map((table) => {
        const assignedPlayers = tournamentState.players.filter((player) => (tournamentState.assignments[player.id]?.tableId || "") === table.id);
        const entries = tournamentState.tableEntries[table.id] || {};
        const total = assignedPlayers.reduce((sum, player) => sum + Number(entries[player.id] || 0), 0);
        return `<article class="admin-table-card"><div class="t-section-grid"><label>Nazwa <input class="admin-input" data-role="table-name" data-table-id="${table.id}" type="text" value="${esc(table.name)}"></label><label>Łączna Suma <input class="admin-input" readonly value="${total}"></label></div><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Gracz</th><th>Wpisowe</th></tr></thead><tbody>${assignedPlayers.map((player) => `<tr><td>${esc(player.name)}</td><td><input class="admin-input" type="tel" inputmode="numeric" pattern="[0-9]*" data-role="table-entry" data-table-id="${table.id}" data-player-id="${player.id}" value="${esc(entries[player.id] || "")}"></td></tr>`).join("") || '<tr><td colspan="2">Brak przypisanych graczy.</td></tr>'}</tbody></table></div><button type="button" class="danger" data-role="delete-table" data-table-id="${table.id}">Usuń</button></article>`;
      }).join("");

      mount.innerHTML = `<div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Gracz</th><th>Status</th><th>Stół</th></tr></thead><tbody>${rows || '<tr><td colspan="3">Brak graczy.</td></tr>'}</tbody></table></div><div class="semi-tables">${perTableBlocks || "<p>Brak stołów.</p>"}</div><button type="button" class="secondary t-inline-add-button" data-role="add-table">Dodaj stół</button>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    const groupedDrawRows = buildGroupedRows(tournamentState.assignments);
    if (activeSection === "payments") {
      mount.innerHTML = `<h3>Tabela10</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Buy-in</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>licz. REBUY/ADD-ON</th></tr></thead><tbody><tr><td><input class="admin-input" data-role="pay-10-buyin" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table10.buyIn)}"></td><td><input class="admin-input" data-role="pay-10-rebuy" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table10.rebuyAddOn)}"></td><td><input class="admin-input" data-role="pay-10-sum" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table10.sum)}"></td><td><input class="admin-input" data-role="pay-10-count" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table10.rebuyCount)}"></td></tr></tbody></table></div><h3>Tabela11</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>%</th><th>Rake</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td><input class="admin-input" data-role="pay-11-percent" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table11.percent)}"></td><td><input class="admin-input" data-role="pay-11-rake" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table11.rake)}"></td><td><input class="admin-input" data-role="pay-11-buyin" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table11.buyIn)}"></td><td><input class="admin-input" data-role="pay-11-rebuy" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table11.rebuyAddOn)}"></td><td><input class="admin-input" data-role="pay-11-pot" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.payments.table11.pot)}"></td></tr></tbody></table></div><h3>Tabela12</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Stół</th><th>LP</th><th>Gracz</th><th>BUY-IN</th><th>REBUY/add-on</th><th>REBUY</th></tr></thead><tbody>${groupedDrawRows.map((row) => `<tr><td>${esc(row.tableName)}</td><td>${row.lp}</td><td>${esc(row.playerName)}</td><td></td><td></td><td></td></tr>`).join("") || '<tr><td colspan="6">Brak danych.</td></tr>'}</tbody></table></div>`;
      return;
    }

    if (activeSection === "pool") {
      mount.innerHTML = `<h3>Tabela13</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>SUMA</th><th>LICZBA REBUY</th></tr></thead><tbody><tr><td>${esc(tournamentState.payments.table10.buyIn)}</td><td>${esc(tournamentState.payments.table10.rebuyAddOn)}</td><td>${esc(tournamentState.payments.table10.sum)}</td><td>${esc(tournamentState.payments.table10.rebuyCount)}</td></tr></tbody></table></div><h3>Tabela14</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>%</th><th>Rake</th><th>BUY-IN</th><th>REBUY/ADD-ON</th><th>POT</th></tr></thead><tbody><tr><td>${esc(tournamentState.payments.table11.percent)}</td><td>${esc(tournamentState.payments.table11.rake)}</td><td>${esc(tournamentState.payments.table11.buyIn)}</td><td>${esc(tournamentState.payments.table11.rebuyAddOn)}</td><td>${esc(tournamentState.payments.table11.pot)}</td></tr></tbody></table></div><h3>Tabela15</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>BUY-IN</th><th>PODZIAŁ</th><th></th></tr></thead><tbody>${tournamentState.pool.splits.map((row, index) => `<tr><td><input class="admin-input" data-role="pool-buyin" data-id="${row.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(row.buyIn)}"></td><td><input class="admin-input" data-role="pool-split" data-id="${row.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(row.split)}"></td><td>${index === tournamentState.pool.splits.length - 1 ? `<button type="button" class="danger" data-role="remove-pool-row" data-id="${row.id}">Usuń</button>` : ""}</td></tr>`).join("")}</tbody></table></div><button class="secondary t-inline-add-button" type="button" data-role="add-pool-row">Dodaj</button><h3>Tabela16</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>Podział Puli</th><th>Kwota</th><th>Rebuy</th><th>Mod</th><th>Suma</th></tr></thead><tbody>${tournamentState.pool.mods.map((row, index) => `<tr><td>${index + 1}</td><td></td><td></td><td></td><td><input class="admin-input" data-role="pool-mod" data-id="${row.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(row.mod)}"></td><td></td></tr>`).join("")}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "group") {
      mount.innerHTML = `<h3>Tabela17</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>STACK GRACZA</th><th>REBUY/ADD-on(w żetonach na os)</th></tr></thead><tbody>${tournamentState.players.map((player) => `<tr><td><input class="admin-input" data-role="group-stack" data-player-id="${player.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.playerStacks[player.id] || "")}"></td><td></td></tr>`).join("") || '<tr><td colspan="2">Brak danych.</td></tr>'}</tbody></table></div><h3>Tabela17A</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>Gracz</th><th>Stack</th><th>%</th><th>Stół</th></tr></thead><tbody>${groupedDrawRows.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td><input class="admin-input" data-role="group-stack" data-player-id="${row.playerId}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(tournamentState.group.playerStacks[row.playerId] || "")}"></td><td></td><td>${esc(row.tableName)}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div><h3>Tabela18</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr>${tournamentState.tables.map((table) => `<th>${esc(table.name)}</th>`).join("")}<th>ŁĄCZNY STACK</th></tr></thead><tbody><tr>${tournamentState.tables.map(() => "<td></td>").join("")}<td></td></tr></tbody></table></div><h3>Tabela19</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>Stół</th><th>LP</th><th>Gracz</th><th>ELIMINATED</th><th>Stack</th><th>REBUY/add-on</th><th>REBUY</th></tr></thead><tbody>${groupedDrawRows.map((row) => `<tr><td>${esc(row.tableName)}</td><td>${row.lp}</td><td>${esc(row.playerName)}</td><td><input type="checkbox" data-role="group-eliminated" data-player-id="${row.playerId}" ${tournamentState.group.eliminated[row.playerId] ? "checked" : ""}></td><td></td><td></td><td></td></tr>`).join("") || '<tr><td colspan="7">Brak danych.</td></tr>'}</tbody></table></div>`;
      restoreTournamentEditableFocusState(container, focusState);
      return;
    }

    if (activeSection === "semi") {
      const survivors = groupedDrawRows.filter((row) => !tournamentState.group.eliminated[row.playerId]);
      const customTables = tournamentState.semi.customTables.map((table, index) => `<article class="admin-table-card"><h4>Stół Półfinałowy numer ${index + 1} <button type="button" class="danger" data-role="remove-semi-table" data-id="${table.id}">Usuń stół</button></h4><div class="t-section-grid"><label>Nazwa <input class="admin-input" data-role="semi-custom-name" data-id="${table.id}" type="text" value="${esc(table.name || "")}"></label><label>Łączny stack <input class="admin-input" readonly value="0"></label></div><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>Gracz</th><th>Stack</th><th>Eliminated</th><th>%</th></tr></thead><tbody><tr><td>1</td><td></td><td><input class="admin-input" data-role="semi-custom-stack" data-id="${table.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(table.stack || "")}"></td><td><input type="checkbox"></td><td></td></tr></tbody></table></div></article>`).join("");
      mount.innerHTML = `<h3>Tabela21</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>Gracz</th><th>STACK</th><th>%</th><th>Stół</th></tr></thead><tbody>${survivors.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td></td><td></td><td>${esc(tableNameById(tournamentState.semi.assignments[row.playerId]?.tableId || ""))}</td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div><h3>Tabela22</h3><button type="button" class="secondary t-inline-add-button" data-role="add-semi-table">Dodaj nowy stół</button><div class="semi-tables">${customTables}</div><h3>Tabela Finałowa</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>STÓŁ</th><th>%</th></tr></thead><tbody>${survivors.map((row, idx) => `<tr><td>${idx + 1}</td><td>${esc(row.playerName)}</td><td></td><td>${esc(tableNameById(tournamentState.semi.assignments[row.playerId]?.tableId || ""))}</td><td></td></tr>`).join("") || '<tr><td colspan="5">Brak danych.</td></tr>'}</tbody></table></div>`;
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
      mount.innerHTML = `<h3>Tabela23</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>LP</th><th>GRACZ</th><th>STACK</th><th>%</th><th>Eliminated</th></tr></thead><tbody>${finalPlayers.map((player, i) => `<tr><td>${i + 1}</td><td>${esc(player.name)}</td><td><input class="admin-input" data-role="final-stack" data-id="${player.id}" type="tel" inputmode="numeric" pattern="[0-9]*" value="${esc(player.stack)}"></td><td></td><td><input type="checkbox" data-role="final-eliminated" data-id="${player.id}" ${player.eliminated ? "checked" : ""}></td></tr>`).join("") || '<tr><td colspan="5">Brak graczy.</td></tr>'}</tbody></table></div><p class="test-controls-note">Przyciski testowe do sprawdzenia poprawności wyświetlania stołu.</p><div class="test-buttons"><button class="danger" type="button" data-role="add-final-player">Dodaj gracza</button><button class="danger" type="button" data-role="remove-final-player">Usuń gracza</button></div><svg viewBox="0 0 ${width} ${height}" class="poker-table-svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0d5f3f" stroke="#d4af37" stroke-width="6"></ellipse>${labels}</svg>`;
      return;
    }

    mount.innerHTML = `<h3>Tabela24</h3><div class="admin-table-scroll"><table class="admin-data-table"><thead><tr><th>MIEJSCE</th><th>GRACZ</th><th>POCZĄTKOWA WYGRANA <input type="checkbox" data-role="toggle-payout-initial" ${tournamentState.payouts.showInitial ? "checked" : ""}></th><th>KOŃCOWA WYGRANA <input type="checkbox" data-role="toggle-payout-final" ${tournamentState.payouts.showFinal ? "checked" : ""}></th></tr></thead><tbody>${tournamentState.finalPlayers.map((player, index) => `<tr><td>${index + 1}</td><td>${esc(player.name)}</td><td></td><td></td></tr>`).join("") || '<tr><td colspan="4">Brak danych.</td></tr>'}</tbody></table></div>`;
    restoreTournamentEditableFocusState(container, focusState);
  };

  const commitDeferredSnapshotIfSafe = () => {
    if (hasActiveEdit || pendingLocalWrites > 0 || !deferredSnapshotState) {
      return;
    }
    tournamentState = deferredSnapshotState;
    deferredSnapshotState = null;
    tournamentStatusMessage = "";
    render();
  };

  container.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
      return;
    }
    if (!target.dataset?.role) {
      return;
    }
    hasActiveEdit = true;
  });

  container.addEventListener("focusout", () => {
    window.setTimeout(() => {
      const activeElement = document.activeElement;
      const stillEditing = activeElement
        && container.contains(activeElement)
        && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLSelectElement || activeElement instanceof HTMLTextAreaElement)
        && !!activeElement.dataset?.role;

      if (stillEditing) {
        return;
      }

      hasActiveEdit = false;
      commitDeferredSnapshotIfSafe();
    }, 0);
  });

  container.addEventListener("input", async (event) => {
    const target = event.target;
    const role = target?.dataset?.role;
    if (!role) return;
    if (["meta-buyin", "meta-rebuy", "meta-rake", "meta-stack", "meta-rebuystack", "player-pin", "table-entry", "group-stack", "final-stack", "pool-buyin", "pool-split", "pool-mod", "pay-10-buyin", "pay-10-rebuy", "pay-10-sum", "pay-10-count", "pay-11-percent", "pay-11-rake", "pay-11-buyin", "pay-11-rebuy", "pay-11-pot", "semi-custom-stack"].includes(role)) {
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
      tournamentState.players = tournamentState.players.map((player) => player.id === target.dataset.playerId ? { ...player, pin: target.value } : player);
    }
    if (role === "table-name") tournamentState.tables = tournamentState.tables.map((table) => table.id === target.dataset.tableId ? { ...table, name: target.value } : table);
    if (["assign-status-toggle", "assign-table", "semi-assign-status", "semi-assign-table"].includes(role)) {
      return;
    }
    if (role === "table-entry") {
      tournamentState.tableEntries[target.dataset.tableId] = tournamentState.tableEntries[target.dataset.tableId] || {};
      tournamentState.tableEntries[target.dataset.tableId][target.dataset.playerId] = target.value;
      render();
    }
    if (role === "pay-10-buyin") tournamentState.payments.table10.buyIn = target.value;
    if (role === "pay-10-rebuy") tournamentState.payments.table10.rebuyAddOn = target.value;
    if (role === "pay-10-sum") tournamentState.payments.table10.sum = target.value;
    if (role === "pay-10-count") tournamentState.payments.table10.rebuyCount = target.value;
    if (role === "pay-11-percent") tournamentState.payments.table11.percent = target.value;
    if (role === "pay-11-rake") tournamentState.payments.table11.rake = target.value;
    if (role === "pay-11-buyin") tournamentState.payments.table11.buyIn = target.value;
    if (role === "pay-11-rebuy") tournamentState.payments.table11.rebuyAddOn = target.value;
    if (role === "pay-11-pot") tournamentState.payments.table11.pot = target.value;
    if (role === "group-stack") tournamentState.group.playerStacks[target.dataset.playerId] = target.value;
    if (role === "final-stack") tournamentState.finalPlayers = tournamentState.finalPlayers.map((player) => player.id === target.dataset.id ? { ...player, stack: target.value } : player);
    if (role === "pool-buyin") tournamentState.pool.splits = tournamentState.pool.splits.map((row) => row.id === target.dataset.id ? { ...row, buyIn: target.value } : row);
    if (role === "pool-split") tournamentState.pool.splits = tournamentState.pool.splits.map((row) => row.id === target.dataset.id ? { ...row, split: target.value } : row);
    if (role === "pool-mod") tournamentState.pool.mods = tournamentState.pool.mods.map((row) => row.id === target.dataset.id ? { ...row, mod: target.value } : row);
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
    if (role === "assign-table") tournamentState.assignments[target.dataset.playerId] = { ...(tournamentState.assignments[target.dataset.playerId] || {}), tableId: target.value, status: tournamentState.assignments[target.dataset.playerId]?.status || "Do zapłaty" };
    if (role === "semi-assign-status") tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), status: target.value, tableId: tournamentState.semi.assignments[target.dataset.playerId]?.tableId || "" };
    if (role === "semi-assign-table") tournamentState.semi.assignments[target.dataset.playerId] = { ...(tournamentState.semi.assignments[target.dataset.playerId] || {}), tableId: target.value, status: tournamentState.semi.assignments[target.dataset.playerId]?.status || "Do zapłaty" };
    if (role === "group-eliminated") tournamentState.group.eliminated[target.dataset.playerId] = target.checked;
    if (role === "final-eliminated") tournamentState.finalPlayers = tournamentState.finalPlayers.map((player) => player.id === target.dataset.id ? { ...player, eliminated: target.checked } : player);
    if (role === "toggle-payout-initial") tournamentState.payouts.showInitial = target.checked;
    if (role === "toggle-payout-final") tournamentState.payouts.showFinal = target.checked;
    if (["assign-table", "semi-assign-status", "semi-assign-table"].includes(role)) {
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

  container.addEventListener("click", async (event) => {
    const target = event.target;
    const role = target?.dataset?.role;
    if (!role) return;

    if (role === "add-player") {
      tournamentState.players.push({ id: crypto.randomUUID(), name: "", pin: "", permissions: "", status: false });
    }
    if (role === "player-pin-random") {
      const playerId = target.dataset.playerId;
      tournamentState.players = tournamentState.players.map((player) => player.id === playerId ? { ...player, pin: generateUniquePin(playerId) } : player);
    }
    if (role === "player-perm-edit") {
      const playerId = target.dataset.playerId;
      const currentPlayer = tournamentState.players.find((player) => player.id === playerId);
      const nextValue = window.prompt("Podaj uprawnienia oddzielone przecinkami (np. Aktualności, Czat).", normalizeTournamentPermissions(currentPlayer?.permissions).join(", "));
      if (nextValue !== null) {
        tournamentState.players = tournamentState.players.map((player) => player.id === playerId ? { ...player, permissions: nextValue } : player);
      }
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
    }
    if (role === "add-table") {
      tournamentState.tables.push({ id: crypto.randomUUID(), name: `Tabela${10 + tournamentState.tables.length}` });
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
    if (role === "add-pool-row") tournamentState.pool.splits.push({ id: crypto.randomUUID(), buyIn: "", split: "" });
    if (role === "remove-pool-row") tournamentState.pool.splits = tournamentState.pool.splits.filter((row) => row.id !== target.dataset.id);
    if (role === "add-semi-table") tournamentState.semi.customTables.push({ id: crypto.randomUUID(), name: "" });
    if (role === "remove-semi-table") tournamentState.semi.customTables = tournamentState.semi.customTables.filter((table) => table.id !== target.dataset.id);
    if (role === "add-final-player") tournamentState.finalPlayers.push({ id: crypto.randomUUID(), name: `Gracz ${tournamentState.finalPlayers.length + 1}`, stack: "", eliminated: false });
    if (role === "remove-final-player") tournamentState.finalPlayers.pop();
    if (role === "assign-status-toggle") {
      const playerId = target.dataset.playerId;
      const current = tournamentState.assignments[playerId]?.status || "Do zapłaty";
      const next = current === "Opłacone" ? "Do zapłaty" : "Opłacone";
      tournamentState.assignments[playerId] = {
        ...(tournamentState.assignments[playerId] || {}),
        status: next,
        tableId: tournamentState.assignments[playerId]?.tableId || ""
      };
    }

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
  const tournamentSection = root.querySelector("#tournamentTab .admin-games-section");
  const userPanelRefreshButton = root.querySelector("#userPanelRefresh");
  const userPanelRefreshStatus = root.querySelector("#userPanelRefreshStatus");
  const tournamentButtons = Array.from(root.querySelectorAll("#tournamentTab [data-tournament-target]"));

  let userTournamentState = createTournamentDefaultState();
  let userTournamentSection = "players";

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
    if (chatInput) {
      chatInput.disabled = true;
    }
    if (chatSendButton) {
      chatSendButton.disabled = true;
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
      renderUserTournament();
    },
    () => {
      if (tournamentSection) {
        tournamentSection.innerHTML = '<p class="builder-info">Nie udało się pobrać danych turnieju z Firebase.</p>';
      }
    }
  );

  chatSendButton?.addEventListener("click", async () => {
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
        authorName: "Gracz",
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
