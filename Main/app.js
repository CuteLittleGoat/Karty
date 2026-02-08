const sampleTables = [
  {
    id: "Stół 1",
    status: "W trakcie",
    players: "4/4",
    leader: "Aneta"
  },
  {
    id: "Stół 2",
    status: "Start o 18:30",
    players: "3/4",
    leader: "Kuba"
  },
  {
    id: "Stół 3",
    status: "Oczekuje",
    players: "2/4",
    leader: "Ola"
  }
];

const samplePlayers = [
  {
    name: "Aneta Nowak",
    table: "Stół 1",
    entry: "40 zł",
    paid: true
  },
  {
    name: "Kuba Zieliński",
    table: "Stół 2",
    entry: "40 zł",
    paid: false
  },
  {
    name: "Ola Wiśniewska",
    table: "Stół 3",
    entry: "40 zł",
    paid: true
  }
];

const samplePayments = [
  {
    player: "Aneta Nowak",
    entry: "40 zł",
    winnings: "120 zł",
    balance: "+80 zł"
  },
  {
    player: "Kuba Zieliński",
    entry: "40 zł",
    winnings: "0 zł",
    balance: "-40 zł"
  },
  {
    player: "Ola Wiśniewska",
    entry: "40 zł",
    winnings: "60 zł",
    balance: "+20 zł"
  }
];

const nextGameInfo = [
  { label: "Data", value: "Piątek, 21.02.2025" },
  { label: "Start rejestracji", value: "18:00" },
  { label: "Start gry", value: "18:30" },
  { label: "Lokalizacja", value: "Kasyno Noir, sala VIP" },
  { label: "Wpisowe", value: "80 zł" },
  { label: "Stack", value: "20 000" },
  { label: "Organizator", value: "Aneta ( +48 501 234 567 )" }
];

const nextGameSchedule = [
  { time: "18:00", event: "Wejście i potwierdzanie miejsc" },
  { time: "18:30", event: "Start gry i rozdanie numerów stołów" },
  { time: "19:45", event: "Przerwa techniczna / serwis" },
  { time: "21:00", event: "Faza finałowa i wypłaty" }
];

const nextGameTables = [
  { table: "Stół A", limit: "6 osób", blind: "25 / 50" },
  { table: "Stół B", limit: "6 osób", blind: "25 / 50" },
  { table: "Stół C", limit: "4 osoby", blind: "50 / 100" }
];

const nextGamePlayers = [
  "Aneta",
  "Kuba",
  "Ola",
  "Michał",
  "Patrycja",
  "Bartek",
  "Ewa",
  "Marcin"
];

const nextGameUpdates = [
  {
    title: "Nowa lokalizacja",
    description: "Wejście od strony parkingu podziemnego, hasło: VIP 21."
  },
  {
    title: "Stawka wejściowa",
    description: "Wpisowe pozostaje bez zmian, możliwa płatność gotówką lub BLIK."
  },
  {
    title: "Regulamin",
    description: "Przypominamy o zasadzie ciszy po godzinie 22:00."
  }
];

const PIN_LENGTH = 5;
const PIN_STORAGE_KEY = "nextGamePinVerified";
let currentPin = "12345";

const getAdminMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("admin") === "1";
};

const updateViewBadge = (isAdmin) => {
  const badge = document.querySelector("#viewBadge");
  badge.textContent = isAdmin ? "Administrator" : "Użytkownik";
};

const toggleView = () => {
  const url = new URL(window.location.href);
  const isAdmin = url.searchParams.get("admin") === "1";
  if (isAdmin) {
    url.searchParams.delete("admin");
  } else {
    url.searchParams.set("admin", "1");
  }
  window.location.href = url.toString();
};

const initViewToggle = () => {
  const buttons = document.querySelectorAll(".view-toggle");
  if (!buttons.length) {
    return;
  }
  buttons.forEach((button) => {
    button.addEventListener("click", toggleView);
  });
};

const renderTables = () => {
  const container = document.querySelector("#tablesContainer");
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = "<span>Stół</span><span>Status</span><span>Gracze</span><span>Kapitan</span>";
  container.appendChild(header);

  sampleTables.forEach((table) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${table.id}</span>
      <span>${table.status}</span>
      <span>${table.players}</span>
      <span>${table.leader}</span>
    `;
    container.appendChild(row);
  });
};

const renderPlayers = () => {
  const container = document.querySelector("#playersContainer");
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = "<span>Gracz</span><span>Stół</span><span>Wpisowe</span><span>Status</span>";
  container.appendChild(header);

  samplePlayers.forEach((player) => {
    const row = document.createElement("div");
    row.className = "row";
    const statusLabel = player.paid ? "Opłacone" : "Do zapłaty";
    const statusClass = player.paid ? "badge" : "badge pending";
    row.innerHTML = `
      <span>${player.name}</span>
      <span>${player.table}</span>
      <span>${player.entry}</span>
      <span><span class="${statusClass}">${statusLabel}</span></span>
    `;
    container.appendChild(row);
  });
};

const renderPayments = () => {
  const container = document.querySelector("#paymentsContainer");
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = "<span>Gracz</span><span>Wpisowe</span><span>Wygrana</span><span>Saldo</span>";
  container.appendChild(header);

  samplePayments.forEach((payment) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${payment.player}</span>
      <span>${payment.entry}</span>
      <span>${payment.winnings}</span>
      <span>${payment.balance}</span>
    `;
    container.appendChild(row);
  });
};

const renderNextGameInfo = () => {
  const list = document.querySelector("#nextGameInfo");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  nextGameInfo.forEach((item) => {
    const entry = document.createElement("li");
    entry.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    list.appendChild(entry);
  });
};

const renderNextGameSchedule = () => {
  const list = document.querySelector("#nextGameSchedule");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  nextGameSchedule.forEach((item) => {
    const entry = document.createElement("li");
    entry.innerHTML = `<span class="timeline-time">${item.time}</span><span class="timeline-event">${item.event}</span>`;
    list.appendChild(entry);
  });
};

const renderNextGameTables = () => {
  const container = document.querySelector("#nextGameTables");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  const header = document.createElement("div");
  header.className = "row header row-3";
  header.innerHTML = "<span>Stół</span><span>Limit</span><span>Blindy</span>";
  container.appendChild(header);
  nextGameTables.forEach((table) => {
    const row = document.createElement("div");
    row.className = "row row-3";
    row.innerHTML = `<span>${table.table}</span><span>${table.limit}</span><span>${table.blind}</span>`;
    container.appendChild(row);
  });
};

const renderNextGamePlayers = () => {
  const list = document.querySelector("#nextGamePlayers");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  nextGamePlayers.forEach((player) => {
    const entry = document.createElement("li");
    entry.textContent = player;
    list.appendChild(entry);
  });
};

const renderNextGameUpdates = () => {
  const list = document.querySelector("#nextGameUpdates");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  nextGameUpdates.forEach((update) => {
    const entry = document.createElement("li");
    entry.innerHTML = `<strong>${update.title}</strong><span>${update.description}</span>`;
    list.appendChild(entry);
  });
};

const renderNextGame = () => {
  renderNextGameInfo();
  renderNextGameSchedule();
  renderNextGameTables();
  renderNextGamePlayers();
  renderNextGameUpdates();
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

const initUserTabs = ({ isAdmin }) => {
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

  const defaultTab = isAdmin ? "nextGameTab" : "updatesTab";
  setActiveTab(defaultTab);

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
          status.textContent = "Nie znaleziono jeszcze żadnych komunikatów.";
          return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        const message = typeof data.message === "string" ? data.message : "";

        output.value = message || "Brak wiadomości od administratora.";
        status.textContent = "Pole jest aktualizowane po każdej nowej wiadomości.";
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
  updateViewBadge(isAdmin);
  renderTables();
  renderPlayers();
  renderPayments();
  renderNextGame();
  initViewToggle();
  initUserTabs({ isAdmin });
  await loadPinFromFirestore();
  initAdminMessaging();
  initAdminPin();
  initPinGate({ isAdmin });
  initLatestMessage();
  initInstructionModal();
};

void bootstrap();
