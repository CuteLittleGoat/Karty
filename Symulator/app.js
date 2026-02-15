const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];
const BOT_ARCHETYPES = ["ostrożny", "agresywny", "blefujący", "zbalansowany"];
const PHASES = ["Preflop", "Flop", "Turn", "River", "Showdown"];

const state = {
  deck: [],
  community: [],
  phaseIndex: -1,
  participants: [],
  pot: 0,
  startingStack: 1000,
  autoPlay: false,
  handActive: false
};

const ui = {
  botCount: document.querySelector("#botCount"),
  botCountValue: document.querySelector("#botCountValue"),
  startingStack: document.querySelector("#startingStack"),
  startHandButton: document.querySelector("#startHandButton"),
  nextStreetButton: document.querySelector("#nextStreetButton"),
  autoPlayButton: document.querySelector("#autoPlayButton"),
  potValue: document.querySelector("#potValue"),
  potChip: document.querySelector("#potChip"),
  phaseValue: document.querySelector("#phaseValue"),
  playerStackValue: document.querySelector("#playerStackValue"),
  eventLog: document.querySelector("#eventLog"),
  deck: document.querySelector("#deck"),
  communityCards: document.querySelector("#communityCards"),
  botSeats: document.querySelector("#botSeats"),
  playerCards: document.querySelector("#playerCards"),
  playerSeat: document.querySelector("#playerSeat"),
  playerStatus: document.querySelector("#playerStatus")
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createDeck = () => {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit });
    }
  }
  return cards;
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const rankValue = (rank) => RANKS.indexOf(rank) + 2;

const addLog = (text) => {
  const item = document.createElement("li");
  item.textContent = text;
  ui.eventLog.prepend(item);
};

const updateStats = () => {
  const player = state.participants.find((item) => item.isPlayer);
  ui.potValue.textContent = state.pot;
  ui.potChip.textContent = `Pula: ${state.pot}`;
  ui.phaseValue.textContent = state.phaseIndex >= 0 ? PHASES[state.phaseIndex] : "-";
  ui.playerStackValue.textContent = player ? player.stack : "0";
};

const cardToText = (card) => `${card.rank}${card.suit}`;

const renderCard = (card, hidden = false) => {
  const div = document.createElement("div");
  div.className = `card${hidden ? " hidden" : ""}`;
  div.textContent = hidden ? "" : cardToText(card);
  return div;
};

const clearBoard = () => {
  ui.communityCards.innerHTML = "";
  ui.playerCards.innerHTML = "";
  ui.playerSeat.classList.remove("winner");
};

const placeBots = () => {
  ui.botSeats.innerHTML = "";
  const bots = state.participants.filter((item) => !item.isPlayer);
  const radiusX = 38;
  const radiusY = 31;

  bots.forEach((bot, index) => {
    const ratio = bots.length === 1 ? 0.5 : index / (bots.length - 1);
    const angle = Math.PI * (0.12 + 0.76 * ratio);
    const x = 50 + Math.cos(angle) * radiusX;
    const y = 58 - Math.sin(angle) * radiusY;

    const seat = document.createElement("div");
    seat.className = "seat";
    seat.style.left = `${x}%`;
    seat.style.top = `${y}%`;
    seat.dataset.id = bot.id;

    seat.innerHTML = `
      <div class="seat-label">${bot.name}</div>
      <div class="cards" id="cards-${bot.id}"></div>
      <div class="seat-status" id="status-${bot.id}">Czeka...</div>
    `;

    ui.botSeats.append(seat);
  });
};

const setupParticipants = () => {
  const botCount = Number(ui.botCount.value);
  state.startingStack = Math.max(100, Number(ui.startingStack.value) || 1000);
  state.participants = [
    { id: "player", name: "Gracz", isPlayer: true, stack: state.startingStack, cards: [], folded: false },
    ...Array.from({ length: botCount }).map((_, index) => ({
      id: `bot-${index + 1}`,
      name: `Bot ${index + 1}`,
      isPlayer: false,
      stack: state.startingStack,
      cards: [],
      folded: false,
      archetype: BOT_ARCHETYPES[Math.floor(Math.random() * BOT_ARCHETYPES.length)]
    }))
  ];

  ui.playerStatus.textContent = "Czeka na rozdanie...";
  placeBots();
  updateStats();
};

const animateShuffle = async () => {
  ui.deck.classList.add("shuffle");
  await delay(1400);
  ui.deck.classList.remove("shuffle");
};

const dealPrivateCards = async () => {
  for (let round = 0; round < 2; round += 1) {
    for (const participant of state.participants) {
      const card = state.deck.pop();
      participant.cards.push(card);

      const cardsNode = participant.isPlayer
        ? ui.playerCards
        : document.querySelector(`#cards-${participant.id}`);
      cardsNode.append(renderCard(card, !participant.isPlayer)).classList.add("dealt");
      await delay(150);
    }
  }
};

const evaluate7Cards = (cards) => {
  const counts = new Map();
  const suits = new Map();
  const uniqueRanks = [...new Set(cards.map((card) => rankValue(card.rank)))].sort((a, b) => b - a);

  cards.forEach((card) => {
    const rv = rankValue(card.rank);
    counts.set(rv, (counts.get(rv) || 0) + 1);
    suits.set(card.suit, (suits.get(card.suit) || []).concat(rv));
  });

  const sortedByCount = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flushSuit = [...suits.entries()].find((entry) => entry[1].length >= 5);

  const getStraightHigh = (values) => {
    const uniq = [...new Set(values)].sort((a, b) => b - a);
    if (uniq.includes(14)) {
      uniq.push(1);
    }
    for (let i = 0; i <= uniq.length - 5; i += 1) {
      const window = uniq.slice(i, i + 5);
      if (window[0] - window[4] === 4) {
        return window[0] === 1 ? 5 : window[0];
      }
    }
    return 0;
  };

  const straightHigh = getStraightHigh(uniqueRanks);
  let straightFlushHigh = 0;

  if (flushSuit) {
    straightFlushHigh = getStraightHigh(flushSuit[1]);
  }

  if (straightFlushHigh > 0) {
    return { score: 8, tiebreak: [straightFlushHigh], label: "Strit w kolorze" };
  }
  if (sortedByCount[0][1] === 4) {
    return { score: 7, tiebreak: [sortedByCount[0][0], sortedByCount[1][0]], label: "Kareta" };
  }
  if (sortedByCount[0][1] === 3 && sortedByCount[1]?.[1] >= 2) {
    return { score: 6, tiebreak: [sortedByCount[0][0], sortedByCount[1][0]], label: "Full" };
  }
  if (flushSuit) {
    const top = flushSuit[1].sort((a, b) => b - a).slice(0, 5);
    return { score: 5, tiebreak: top, label: "Kolor" };
  }
  if (straightHigh > 0) {
    return { score: 4, tiebreak: [straightHigh], label: "Strit" };
  }
  if (sortedByCount[0][1] === 3) {
    return { score: 3, tiebreak: [sortedByCount[0][0], ...uniqueRanks.filter((v) => v !== sortedByCount[0][0]).slice(0, 2)], label: "Trójka" };
  }
  if (sortedByCount[0][1] === 2 && sortedByCount[1]?.[1] === 2) {
    const highPair = Math.max(sortedByCount[0][0], sortedByCount[1][0]);
    const lowPair = Math.min(sortedByCount[0][0], sortedByCount[1][0]);
    const kicker = uniqueRanks.find((v) => v !== highPair && v !== lowPair) || 0;
    return { score: 2, tiebreak: [highPair, lowPair, kicker], label: "Dwie pary" };
  }
  if (sortedByCount[0][1] === 2) {
    const pair = sortedByCount[0][0];
    const kickers = uniqueRanks.filter((v) => v !== pair).slice(0, 3);
    return { score: 1, tiebreak: [pair, ...kickers], label: "Para" };
  }

  return { score: 0, tiebreak: uniqueRanks.slice(0, 5), label: "Wysoka karta" };
};

const compareHands = (a, b) => {
  if (a.score !== b.score) {
    return a.score - b.score;
  }
  for (let i = 0; i < Math.max(a.tiebreak.length, b.tiebreak.length); i += 1) {
    const diff = (a.tiebreak[i] || 0) - (b.tiebreak[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
};

const botAction = (bot) => {
  const roll = Math.random();
  const profiles = {
    ostrożny: { fold: 0.42, call: 0.5 },
    agresywny: { fold: 0.12, call: 0.45 },
    blefujący: { fold: 0.18, call: 0.35 },
    zbalansowany: { fold: 0.24, call: 0.5 }
  };

  const profile = profiles[bot.archetype] || profiles.zbalansowany;

  if (roll < profile.fold) {
    return "fold";
  }
  if (roll < profile.fold + profile.call) {
    return "call";
  }
  return "raise";
};

const runBettingRound = async () => {
  for (const participant of state.participants) {
    if (participant.folded || participant.stack <= 0) {
      continue;
    }

    if (participant.isPlayer) {
      const bet = Math.min(20, participant.stack);
      participant.stack -= bet;
      state.pot += bet;
      ui.playerStatus.textContent = `Dokładasz ${bet}`;
      addLog(`Gracz dokłada ${bet}.`);
    } else {
      const action = botAction(participant);
      const status = document.querySelector(`#status-${participant.id}`);

      if (action === "fold") {
        participant.folded = true;
        status.textContent = "Pas";
        addLog(`${participant.name} pasuje.`);
      } else if (action === "call") {
        const bet = Math.min(20, participant.stack);
        participant.stack -= bet;
        state.pot += bet;
        status.textContent = `Sprawdza ${bet}`;
        addLog(`${participant.name} sprawdza (${bet}).`);
      } else {
        const bet = Math.min(40, participant.stack);
        participant.stack -= bet;
        state.pot += bet;
        status.textContent = `Przebija ${bet}`;
        addLog(`${participant.name} przebija (${bet}).`);
      }
    }

    updateStats();
    await delay(240);
  }
};

const revealCommunity = async () => {
  let toDeal = 0;
  if (state.phaseIndex === 1) {
    toDeal = 3;
  } else if (state.phaseIndex === 2 || state.phaseIndex === 3) {
    toDeal = 1;
  }

  for (let i = 0; i < toDeal; i += 1) {
    const card = state.deck.pop();
    state.community.push(card);
    ui.communityCards.append(renderCard(card)).classList.add("dealt");
    await delay(260);
  }
};

const finishHand = () => {
  const active = state.participants.filter((participant) => !participant.folded);
  const ranked = active
    .map((participant) => ({
      participant,
      hand: evaluate7Cards([...participant.cards, ...state.community])
    }))
    .sort((left, right) => compareHands(right.hand, left.hand));

  const winner = ranked[0];
  winner.participant.stack += state.pot;

  if (winner.participant.isPlayer) {
    ui.playerSeat.classList.add("winner");
  } else {
    const seat = document.querySelector(`.seat[data-id="${winner.participant.id}"]`);
    seat?.classList.add("winner");
  }

  state.participants.filter((item) => !item.isPlayer).forEach((bot) => {
    const cardsNode = document.querySelector(`#cards-${bot.id}`);
    cardsNode.innerHTML = "";
    bot.cards.forEach((card) => cardsNode.append(renderCard(card)));
  });

  ui.playerStatus.textContent = `${winner.participant.name} wygrywa (${winner.hand.label})`;
  addLog(`${winner.participant.name} zgarnia pulę ${state.pot} (${winner.hand.label}).`);
  state.pot = 0;
  state.handActive = false;
  ui.nextStreetButton.disabled = true;
  updateStats();
};

const nextPhase = async () => {
  if (!state.handActive) {
    return;
  }

  state.phaseIndex += 1;
  updateStats();

  if (state.phaseIndex === 0) {
    await runBettingRound();
  } else if (state.phaseIndex < 4) {
    await revealCommunity();
    await runBettingRound();
  } else {
    finishHand();
    return;
  }

  if (state.phaseIndex >= 4) {
    finishHand();
  }
};

const startHand = async () => {
  state.deck = shuffleDeck(createDeck());
  state.community = [];
  state.phaseIndex = -1;
  state.pot = 0;
  state.handActive = true;

  clearBoard();
  setupParticipants();
  addLog("Rozpoczęto nowe rozdanie.");

  state.participants.forEach((participant) => {
    participant.cards = [];
    participant.folded = false;
    if (!participant.isPlayer) {
      const status = document.querySelector(`#status-${participant.id}`);
      if (status) {
        status.textContent = "W grze";
      }
    }
  });

  await animateShuffle();
  await dealPrivateCards();

  ui.nextStreetButton.disabled = false;
  ui.playerStatus.textContent = "Karty rozdane. Przejdź do kolejnej fazy.";
  updateStats();
};

const autoPlay = async () => {
  if (!state.handActive) {
    await startHand();
  }

  while (state.autoPlay && state.handActive) {
    await nextPhase();
    await delay(500);
  }
};

const init = () => {
  setupParticipants();

  ui.botCount.addEventListener("input", () => {
    ui.botCountValue.textContent = ui.botCount.value;
    setupParticipants();
  });

  ui.startingStack.addEventListener("change", setupParticipants);

  ui.startHandButton.addEventListener("click", () => {
    void startHand();
  });

  ui.nextStreetButton.addEventListener("click", () => {
    void nextPhase();
  });

  ui.autoPlayButton.addEventListener("click", () => {
    state.autoPlay = !state.autoPlay;
    ui.autoPlayButton.textContent = state.autoPlay ? "Zatrzymaj auto grę" : "Auto gra";
    if (state.autoPlay) {
      void autoPlay();
    }
  });
};

init();
