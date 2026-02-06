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

const bootstrap = () => {
  const isAdmin = getAdminMode();
  document.body.classList.toggle("is-admin", isAdmin);
  updateViewBadge(isAdmin);
  renderTables();
  renderPlayers();
  renderPayments();
};

bootstrap();
