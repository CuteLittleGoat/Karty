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

const ADMIN_SECURITY_COLLECTION = "admin_security";
const ADMIN_SECURITY_DOCUMENT = "credentials";
const ADMIN_SECURITY_PASSWORD_FIELD = "passwordHash";

const shouldRequestAdminAccess = () => new URLSearchParams(window.location.search).get("admin") === "1";

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
const instructionButton = document.querySelector("#secondInstructionButton");

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
};

const setupUserOnlyView = () => {
  const userView = createUserViewNode({ withWrapperCard: true });
  appRoot.appendChild(userView);
};

const bootstrap = async () => {
  const isAdminView = await resolveAdminMode();
  if (instructionButton) {
    instructionButton.hidden = !isAdminView;
  }

  if (isAdminView) {
    setupAdminView();
  } else {
    setupUserOnlyView();
  }
};

void bootstrap();
