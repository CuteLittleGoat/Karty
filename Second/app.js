const AUTH_USERS_COLLECTION = "second_users";
const AUTH_SESSIONS_COLLECTION = "second_auth_sessions";
const AUTH_MODULE_KEY = "second";

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

const initAuthControls = () => {
  const emailInput = document.querySelector("#authEmailInput");
  const passwordInput = document.querySelector("#authPasswordInput");
  const loginButton = document.querySelector("#authLoginButton");
  const logoutButton = document.querySelector("#authLogoutButton");
  const resetButton = document.querySelector("#authResetPasswordButton");
  const status = document.querySelector("#authStatus");

  if (!emailInput || !passwordInput || !loginButton || !logoutButton || !resetButton || !status) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp || !firebaseApp.auth) {
    status.textContent = "Logowanie niedostępne: brak konfiguracji Firebase Auth.";
    loginButton.disabled = true;
    logoutButton.disabled = true;
    resetButton.disabled = true;
    return;
  }

  const auth = firebaseApp.auth();
  const db = firebaseApp.firestore();

  const setStatus = (message) => {
    status.textContent = message;
  };

  const persistSessionMetadata = async (user, profile) => {
    if (!user || !db) {
      return;
    }

    try {
      await db.collection(AUTH_SESSIONS_COLLECTION).doc(user.uid).set(
        {
          uid: user.uid,
          email: user.email ?? "",
          module: AUTH_MODULE_KEY,
          profileCollection: AUTH_USERS_COLLECTION,
          profileExists: Boolean(profile),
          lastLoginAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      setStatus("Zalogowano, ale zapis sesji do Firestore jest obecnie zablokowany przez Rules.");
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      logoutButton.disabled = true;
      setStatus("Nie zalogowano.");
      return;
    }

    logoutButton.disabled = false;

    try {
      const profileSnapshot = await db.collection(AUTH_USERS_COLLECTION).doc(user.uid).get();
      const profile = profileSnapshot.exists ? profileSnapshot.data() : null;
      const profileLabel = profile ? "Profil modułu Second znaleziony." : "Brak profilu modułu Second (second_users/{uid}).";
      setStatus(`Zalogowano: ${user.email || user.uid}. ${profileLabel}`);
      await persistSessionMetadata(user, profile);
    } catch (error) {
      setStatus(`Zalogowano: ${user.email || user.uid}. Nie udało się odczytać kolekcji ${AUTH_USERS_COLLECTION}.`);
    }
  });

  loginButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      setStatus("Podaj e-mail i hasło.");
      return;
    }

    setStatus("Logowanie...");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      passwordInput.value = "";
    } catch (error) {
      setStatus(`Nie udało się zalogować: ${error?.message || "nieznany błąd"}`);
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await auth.signOut();
      setStatus("Wylogowano.");
    } catch (error) {
      setStatus(`Nie udało się wylogować: ${error?.message || "nieznany błąd"}`);
    }
  });

  resetButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      setStatus("Podaj e-mail, aby wysłać reset hasła.");
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      setStatus(`Wysłano link resetu hasła na adres: ${email}.`);
    } catch (error) {
      setStatus(`Nie udało się wysłać resetu hasła: ${error?.message || "nieznany błąd"}`);
    }
  });
};

const appRoot = document.querySelector("#appRoot");

const isAdminView = new URLSearchParams(window.location.search).get("admin") === "1";
const instructionButton = document.querySelector("#secondInstructionButton");

if (instructionButton) {
  instructionButton.hidden = !isAdminView;
}

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

initAuthControls();

if (isAdminView) {
  setupAdminView();
} else {
  setupUserOnlyView();
}
