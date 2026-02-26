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

const resolveAdminMode = async () => {
  if (!shouldRequestAdminAccess()) {
    return false;
  }

  let storedHash = "";
  try {
    storedHash = await getAdminPasswordHash();
  } catch (error) {
    window.alert("Nie udało się odczytać hasła administratora. Otwieram widok użytkownika.");
    return false;
  }

  while (true) {
    const candidatePassword = window.prompt("Podaj hasło administratora");
    if (candidatePassword === null) {
      return false;
    }

    const isValid = await isAdminPasswordValid(candidatePassword, storedHash);
    if (isValid) {
      return true;
    }

    window.alert("Błędne hasło administratora. Spróbuj ponownie.");
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
