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

const getAdminMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("admin") === "1";
};

const updateViewBadge = (isAdmin) => {
  const badge = document.querySelector("#viewBadge");
  badge.textContent = isAdmin ? "Administrator" : "Użytkownik";
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
      status.textContent = "Wiadomość wysłana do aplikacji Android.";
    } catch (error) {
      status.textContent = "Nie udało się wysłać wiadomości. Sprawdź konfigurację.";
    } finally {
      sendButton.disabled = false;
    }
  });
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

const bootstrap = () => {
  const isAdmin = getAdminMode();
  document.body.classList.toggle("is-admin", isAdmin);
  updateViewBadge(isAdmin);
  renderTables();
  renderPlayers();
  renderPayments();
  initAdminMessaging();
  initInstructionModal();
};

bootstrap();
