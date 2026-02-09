const PIN_LENGTH = 5;
const PIN_STORAGE_KEY = "nextGamePinVerified";
let currentPin = "12345";

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
  initPinGate({ isAdmin });
  initLatestMessage();
  initInstructionModal();
};

void bootstrap();
