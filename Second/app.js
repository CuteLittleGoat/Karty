const appRoot = document.querySelector("#appRoot");

const state = {
  news: "Administrator jeszcze nie dodał aktualności.",
  players: [],
  messages: [
    { id: crypto.randomUUID(), author: "System", text: "Witamy w czacie modułu Second." }
  ],
  activeTournamentPage: "1"
};

const isAdminView = new URLSearchParams(window.location.search).get("admin") === "1";

const createUserViewNode = ({ withWrapperCard = true } = {}) => {
  const template = document.querySelector("#userViewTemplate");
  const fragment = template.content.cloneNode(true);
  const rootCard = fragment.querySelector(".user-card");

  setupTabs(rootCard);
  bindTournamentButtons(rootCard);

  const userNewsOutput = rootCard.querySelector("#userNewsOutput");
  userNewsOutput.value = state.news;

  const pinForm = rootCard.querySelector("#userPinForm");
  const pinInput = rootCard.querySelector("#userPinInput");
  const pinStatus = rootCard.querySelector("#userPinStatus");
  const messageForm = rootCard.querySelector("#userMessageForm");
  const messageInput = rootCard.querySelector("#userMessageInput");
  const chatList = rootCard.querySelector("#userChatList");

  const verifyPin = (pin) => state.players.find((player) => player.pin === pin && player.permissions.chat);

  pinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const player = verifyPin(pinInput.value.trim());
    if (!player) {
      pinStatus.textContent = "Nieprawidłowy PIN lub brak uprawnień do czatu.";
      return;
    }

    pinStatus.textContent = `PIN zaakceptowany. Zalogowano jako: ${player.name}.`;
    messageForm.classList.remove("is-hidden");
    messageForm.dataset.playerId = player.id;
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const playerId = messageForm.dataset.playerId;
    const player = state.players.find((item) => item.id === playerId);
    const text = messageInput.value.trim();

    if (!player || !text) {
      return;
    }

    state.messages.push({ id: crypto.randomUUID(), author: player.name, text });
    messageInput.value = "";
    renderChatList(chatList, { adminMode: false });
    syncUserMirrors();
  });

  renderChatList(chatList, { adminMode: false });

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

  setupTabs(rootCard);
  bindTournamentButtons(rootCard);

  const adminNewsInput = rootCard.querySelector("#adminNewsInput");
  adminNewsInput.value = state.news;
  adminNewsInput.addEventListener("input", () => {
    state.news = adminNewsInput.value.trim() || "Administrator jeszcze nie dodał aktualności.";
    syncUserMirrors();
  });

  const playerForm = rootCard.querySelector("#playerForm");
  const playersTableBody = rootCard.querySelector("#playersTableBody");
  const playerNameInput = rootCard.querySelector("#playerNameInput");
  const playerPinInput = rootCard.querySelector("#playerPinInput");
  const playerChatPermissionInput = rootCard.querySelector("#playerChatPermissionInput");

  playerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = playerNameInput.value.trim();
    const pin = playerPinInput.value.trim();
    if (!name || !/^\d{4}$/.test(pin)) {
      return;
    }

    state.players.push({
      id: crypto.randomUUID(),
      name,
      pin,
      permissions: { chat: Boolean(playerChatPermissionInput.checked) }
    });

    playerForm.reset();
    playerChatPermissionInput.checked = true;
    renderPlayersTable(playersTableBody);
  });

  renderPlayersTable(playersTableBody);

  const adminChatList = rootCard.querySelector("#adminChatList");
  renderChatList(adminChatList, { adminMode: true });

  const userPreview = createUserViewNode({ withWrapperCard: false });
  previewMount.appendChild(userPreview);

  appRoot.appendChild(fragment);
  syncUserMirrors();
};

const setupUserOnlyView = () => {
  const userView = createUserViewNode({ withWrapperCard: true });
  appRoot.appendChild(userView);
  syncUserMirrors();
};

const setupTabs = (container) => {
  const tabs = container.querySelectorAll(".admin-panel-tab");
  const panels = container.querySelectorAll(".admin-panel-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === target));
    });
  });
};

const bindTournamentButtons = (container) => {
  const buttons = container.querySelectorAll("[data-tournament-target]");
  const userText = container.querySelector("[data-user-tournament-text]");
  const adminText = container.querySelector("#tournamentText");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tournamentTarget;
      state.activeTournamentPage = target;

      buttons.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.tournamentTarget === target);
      });

      const message = `W budowie: Strona${target}`;
      if (userText) userText.textContent = message;
      if (adminText) adminText.textContent = message;
    });
  });
};

const renderPlayersTable = (tbody) => {
  tbody.innerHTML = "";

  if (!state.players.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4">Brak graczy. Dodaj pierwszego gracza przez formularz powyżej.</td>';
    tbody.appendChild(row);
    syncUserMirrors();
    return;
  }

  state.players.forEach((player) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(player.name)}</td>
      <td>${escapeHtml(player.pin)}</td>
      <td>${player.permissions.chat ? "Czat" : "Brak"}</td>
      <td><button class="danger" type="button" data-remove-player="${player.id}">Usuń</button></td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll("[data-remove-player]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removePlayer;
      state.players = state.players.filter((player) => player.id !== id);
      renderPlayersTable(tbody);
    });
  });

  syncUserMirrors();
};

const renderChatList = (container, { adminMode }) => {
  container.innerHTML = "";

  if (!state.messages.length) {
    const empty = document.createElement("p");
    empty.className = "status-text";
    empty.textContent = "Brak wiadomości.";
    container.appendChild(empty);
    return;
  }

  state.messages.forEach((message) => {
    const item = document.createElement("article");
    item.className = "chat-item";
    item.innerHTML = `
      <div class="chat-item-head">
        <strong>${escapeHtml(message.author)}</strong>
        ${adminMode ? `<button class="danger" type="button" data-remove-message="${message.id}">Usuń</button>` : ""}
      </div>
      <p>${escapeHtml(message.text)}</p>
    `;
    container.appendChild(item);
  });

  if (adminMode) {
    container.querySelectorAll("[data-remove-message]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.removeMessage;
        state.messages = state.messages.filter((message) => message.id !== id);
        syncUserMirrors();
      });
    });
  }
};

const syncUserMirrors = () => {
  document.querySelectorAll("#userNewsOutput").forEach((field) => {
    field.value = state.news;
  });

  document.querySelectorAll("#adminChatList").forEach((list) => renderChatList(list, { adminMode: true }));
  document.querySelectorAll("#userChatList").forEach((list) => renderChatList(list, { adminMode: false }));
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

if (isAdminView) {
  setupAdminView();
} else {
  setupUserOnlyView();
}
