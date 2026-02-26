const AUTH_USERS_COLLECTION = "second_users";
const AUTH_SESSIONS_COLLECTION = "second_auth_sessions";
const AUTH_MODULE_KEY = "second";

const authContextState = {
  user: null,
  profile: null
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

const normalizeEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
const isValidPassword = (value) => /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(value);

const applyAuthUiState = () => {
  const hasUser = Boolean(authContextState.user);
  const isApproved = authContextState.profile ? authContextState.profile.isApproved !== false : false;
  const isAuthenticated = hasUser && isApproved;
  document.body.classList.toggle("is-authenticated", isAuthenticated);
  document.body.classList.toggle("is-awaiting-approval", hasUser && !isApproved);
};

const initAuthControls = () => {
  const emailInput = document.querySelector("#authEmailInput");
  const passwordInput = document.querySelector("#authPasswordInput");
  const loginButton = document.querySelector("#authLoginButton");
  const registerButton = document.querySelector("#authRegisterButton");
  const logoutButton = document.querySelector("#authLogoutButton");
  const resetButton = document.querySelector("#authResetPasswordButton");
  const openResetViewButton = document.querySelector("#authOpenResetViewButton");
  const resetView = document.querySelector("#authResetView");
  const resetEmailInput = document.querySelector("#authResetEmailInput");
  const sendResetButton = document.querySelector("#authSendResetButton");
  const backToLoginButton = document.querySelector("#authBackToLoginButton");
  const status = document.querySelector("#authStatus");
  const currentUser = document.querySelector("#authCurrentUser");

  if (!emailInput || !passwordInput || !loginButton || !registerButton || !logoutButton || !resetButton || !status || !currentUser) {
    return;
  }

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp || !firebaseApp.auth) {
    status.textContent = "Logowanie niedostępne: brak konfiguracji Firebase Auth.";
    loginButton.disabled = true;
    registerButton.disabled = true;
    logoutButton.disabled = true;
    resetButton.disabled = true;
    return;
  }

  const auth = firebaseApp.auth();
  const db = firebaseApp.firestore();
  const setStatus = (message) => { status.textContent = message; };

  const formatFirebaseErrorDetails = (error) => {
    if (!error) return "kod: unknown; opis: nieznany błąd";
    const code = typeof error.code === "string" && error.code ? error.code : "unknown";
    const message = typeof error.message === "string" && error.message ? error.message : "Brak dodatkowego opisu";
    return `kod: ${code}; opis: ${message}`;
  };

  const getFirebaseErrorHint = (error, contextLabel) => {
    const code = error?.code;
    if (code === "permission-denied") return `Wskazówka: sprawdź Firestore Rules i kolekcję ${contextLabel}.`;
    if (code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-credential") return "Wskazówka: sprawdź e-mail i hasło.";
    if (code === "auth/too-many-requests") return "Wskazówka: zbyt wiele prób logowania — odczekaj chwilę i spróbuj ponownie.";
    return "";
  };

  const setDiagnosticStatus = ({ prefix, error, contextLabel }) => {
    const details = formatFirebaseErrorDetails(error);
    const hint = getFirebaseErrorHint(error, contextLabel);
    const suffix = hint ? ` ${hint}` : "";
    setStatus(`${prefix} (${details}).${suffix}`);
  };

  auth.setPersistence(firebaseApp.auth.Auth.Persistence.NONE).catch(() => {
    setStatus("Logowanie działa, ale przeglądarka nie pozwala wyłączyć trwałej sesji.");
  });
  const setResetViewVisible = (visible) => {
    if (!resetView || !openResetViewButton) return;
    resetView.classList.toggle("is-visible", visible);
    openResetViewButton.style.display = visible ? "none" : "inline";
  };

  auth.onAuthStateChanged(async (user) => {
    authContextState.user = user || null;
    if (!user) {
      authContextState.profile = null;
      logoutButton.disabled = true;
      currentUser.textContent = "Zalogowany: —";
      applyAuthUiState();
      renderRoleView();
      setStatus("Nie zalogowano.");
      return;
    }

    logoutButton.disabled = false;
    currentUser.textContent = `Zalogowany: ${user.email || user.uid}`;
    try {
      const profileSnapshot = await db.collection(AUTH_USERS_COLLECTION).doc(user.uid).get();
      authContextState.profile = profileSnapshot.exists ? profileSnapshot.data() : null;
      applyAuthUiState();
      renderRoleView();
      if (authContextState.profile && authContextState.profile.isApproved === false) {
        setStatus("Oczekiwanie na zatwierdzenie");
      } else {
        setStatus(`Zalogowano: ${user.email || user.uid}.`);
      }
    } catch (error) {
      console.error("[Second][Auth][profileRead]", {
        code: error?.code,
        message: error?.message,
        uid: user?.uid,
        collection: AUTH_USERS_COLLECTION
      });
      authContextState.profile = null;
      applyAuthUiState();
      renderRoleView();
      setDiagnosticStatus({
        prefix: `Zalogowano: ${user.email || user.uid}. Nie udało się odczytać kolekcji ${AUTH_USERS_COLLECTION}`,
        error,
        contextLabel: AUTH_USERS_COLLECTION
      });
    }
  });

  loginButton.addEventListener("click", async () => {
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;
    if (!email || !password) return setStatus("Podaj e-mail i hasło.");
    if (!isValidEmail(email)) return setStatus("Podaj poprawny adres e-mail.");
    try {
      await auth.signInWithEmailAndPassword(email, password);
      passwordInput.value = "";
    } catch (error) {
      console.error("[Second][Auth][signIn]", {
        code: error?.code,
        message: error?.message,
        email
      });
      setDiagnosticStatus({
        prefix: "Nie udało się zalogować",
        error,
        contextLabel: AUTH_USERS_COLLECTION
      });
    }
  });

  registerButton.addEventListener("click", async () => {
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;
    if (!email || !password) return setStatus("Podaj e-mail i hasło, aby utworzyć konto.");
    if (!isValidEmail(email)) return setStatus("Podaj poprawny adres e-mail.");
    if (!isValidPassword(password)) return setStatus("Hasło musi mieć min. 6 znaków, 1 cyfrę i 1 znak specjalny.");

    try {
      const existingSnapshot = await db.collection(AUTH_USERS_COLLECTION).where("email", "==", email).limit(1).get();
      if (!existingSnapshot.empty) return setStatus("Konto z tym adresem e-mail już istnieje.");
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection(AUTH_USERS_COLLECTION).doc(result.user.uid).set({
        uid: result.user.uid,
        email,
        name: email.split("@")[0],
        isActive: false,
        isApproved: false,
        permissions: [],
        statsYearsAccess: [],
        role: "user",
        createdAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseApp.firestore.FieldValue.serverTimestamp(),
        source: "self-register"
      }, { merge: true });
      passwordInput.value = "";
      setStatus("Oczekiwanie na zatwierdzenie");
    } catch (error) {
      console.error("[Second][Auth][register]", {
        code: error?.code,
        message: error?.message,
        email
      });
      setDiagnosticStatus({
        prefix: "Nie udało się utworzyć konta",
        error,
        contextLabel: AUTH_USERS_COLLECTION
      });
    }
  });

  logoutButton.addEventListener("click", async () => {
    try { await auth.signOut(); setStatus("Wylogowano."); }
    catch (error) {
      setDiagnosticStatus({
        prefix: "Nie udało się wylogować",
        error,
        contextLabel: AUTH_USERS_COLLECTION
      });
    }
  });

  const sendReset = async () => {
    const email = normalizeEmail((resetEmailInput?.value || emailInput.value));
    if (!email) return setStatus("Podaj e-mail, aby wysłać reset hasła.");
    if (!isValidEmail(email)) return setStatus("Podaj poprawny adres e-mail.");
    try { await auth.sendPasswordResetEmail(email); setStatus(`Wysłano link resetu hasła na adres: ${email}.`); }
    catch (error) {
      setDiagnosticStatus({
        prefix: "Nie udało się wysłać resetu hasła",
        error,
        contextLabel: AUTH_USERS_COLLECTION
      });
    }
  };

  resetButton.addEventListener("click", () => setResetViewVisible(true));
  openResetViewButton?.addEventListener("click", () => setResetViewVisible(true));
  backToLoginButton?.addEventListener("click", () => setResetViewVisible(false));
  sendResetButton?.addEventListener("click", () => { void sendReset(); });
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

const renderRoleView = () => {
  appRoot.innerHTML = "";

  if (!authContextState.user) {
    if (instructionButton) {
      instructionButton.hidden = true;
    }
    return;
  }

  const role = typeof authContextState.profile?.role === "string" ? authContextState.profile.role : "user";
  const isAdmin = role === "admin";
  document.body.classList.toggle("is-admin", isAdmin);

  if (instructionButton) {
    instructionButton.hidden = !isAdmin;
  }

  if (isAdmin) {
    setupAdminView();
  } else {
    setupUserOnlyView();
  }
};

applyAuthUiState();
renderRoleView();
initAuthControls();
