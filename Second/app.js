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
const PLAYER_ACCESS_DOCUMENT = "player_access";
const RULES_DOCUMENT = "rules";

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

const getPlayerIdentifier = (player = {}) => {
  const playerId = typeof player?.id === "string" ? player.id.trim() : "";
  if (playerId) {
    return `id:${playerId}`;
  }
  const playerName = typeof player?.name === "string" ? player.name.trim() : "";
  return playerName ? `name:${playerName}` : "";
};

const renderPlayersTable = (tableBody, players) => {
  if (!tableBody) {
    return;
  }

  const uniquePlayers = Array.isArray(players)
    ? Array.from(players.reduce((map, player) => {
      const identifier = getPlayerIdentifier(player);
      if (!identifier || map.has(identifier)) {
        return map;
      }
      map.set(identifier, player);
      return map;
    }, new Map()).values())
    : [];

  tableBody.innerHTML = "";

  if (!uniquePlayers.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Brak graczy.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  uniquePlayers.forEach((player) => {
    const row = document.createElement("tr");
    const appCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const pinCell = document.createElement("td");
    const permissionsCell = document.createElement("td");
    const actionsCell = document.createElement("td");

    appCell.textContent = typeof player.app === "string" ? player.app : "Second";
    nameCell.textContent = typeof player.name === "string" && player.name.trim() ? player.name : "—";
    pinCell.textContent = typeof player.pin === "string" && player.pin.trim() ? player.pin : "—";

    const permissions = Array.isArray(player.permissions)
      ? player.permissions.filter((entry) => typeof entry === "string" && entry.trim())
      : [];
    permissionsCell.textContent = permissions.length ? permissions.join(", ") : "Brak";
    actionsCell.textContent = "";

    row.append(appCell, nameCell, pinCell, permissionsCell, actionsCell);
    tableBody.appendChild(row);
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
  const playersBody = root.querySelector("#playersTableBody");
  const chatMessages = root.querySelector("#chatMessages");
  const chatInput = root.querySelector("#chatMessageInput");
  const chatSendButton = root.querySelector("#chatSendButton");
  const chatStatus = root.querySelector("#chatStatus");
  const userPanelRefreshButton = root.querySelector("#userPanelRefresh");
  const userPanelRefreshStatus = root.querySelector("#userPanelRefreshStatus");

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

        if (activeTabId === "playersTab") {
          await db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).get({ source: "server" });
          setRefreshStatus("Lista graczy została odświeżona.");
          return;
        }

        if (activeTabId === "chatTab") {
          await db.collection(SECOND_CHAT_COLLECTION).orderBy("createdAt", "asc").limit(200).get({ source: "server" });
          setRefreshStatus("Czat został odświeżony.");
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

  db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT).onSnapshot(
    (snapshot) => {
      const rawPlayers = Array.isArray(snapshot.data()?.players) ? snapshot.data().players : [];
      renderPlayersTable(playersBody, rawPlayers);
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

  const initAdminPlayers = () => {
    const tableBody = rootCard.querySelector("#adminPlayersTableBody");
    const countNode = rootCard.querySelector("#adminPlayersCount");
    const statusNode = rootCard.querySelector("#adminPlayersStatus");
    const firebaseApp = getFirebaseApp();

    if (!tableBody || !countNode || !statusNode) {
      return;
    }

    if (!firebaseApp) {
      statusNode.textContent = "Uzupełnij konfigurację Firebase, aby zobaczyć graczy.";
      return;
    }

    const db = firebaseApp.firestore();
    const playersRef = db.collection(SECOND_APP_SETTINGS_COLLECTION).doc(PLAYER_ACCESS_DOCUMENT);

    registerAdminRefreshHandler("adminPlayersTab", async () => {
      await playersRef.get({ source: "server" });
    });

    playersRef.onSnapshot(
      (snapshot) => {
        const players = Array.isArray(snapshot.data()?.players) ? snapshot.data().players : [];
        renderPlayersTable(tableBody, players);
        countNode.textContent = `Liczba dodanych graczy: ${players.length}`;
        statusNode.textContent = "Lista graczy zsynchronizowana z Firebase.";
      },
      () => {
        statusNode.textContent = "Nie udało się pobrać listy graczy.";
      }
    );
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
  initAdminPlayers();
  initAdminNotes();
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
