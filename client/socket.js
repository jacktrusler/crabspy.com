const ONE_SECOND = 1000;
const EIGHT_MINUTES = 8 * 60 * ONE_SECOND;

function clearChildren(parentEl) {
  while (parentEl.firstChild) {
    parentEl.removeChild(parentEl.firstChild);
  }
}

function appendHeader(tParent, el1, el2, c1, c2) {
  const tr = document.createElement("tr");
  el1.textContent = c1;
  el2.textContent = c2;

  const tooltip = document.createElement("span");
  tooltip.innerText = "Unique id from the game server.";
  tooltip.classList.add("tooltip-text");
  el2.appendChild(tooltip);
  el2.className = "tooltip";

  tr.appendChild(el1);
  tr.appendChild(el2);
  tParent.appendChild(tr);
}

function appendRow(tParent, el1, el2, c1, c2) {
  const tr = document.createElement("tr");
  el1.textContent = c1;
  el2.textContent = c2;
  tr.appendChild(el1);
  tr.appendChild(el2);
  tParent.appendChild(tr);
}

// Server
const socket = io("wss://crabspy.com");
// Testing
//const socket = io('ws://localhost:55577');

// Grab all the elements, jank style
const join = document.getElementById("join-room");
const roomId = document.getElementById("room-id");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resumeBtn = document.getElementById("resume-btn");
const resetBtn = document.getElementById("reset-btn");
const player = document.getElementById("player");
const info = document.getElementById("info");
const playerId = document.getElementById("playerId");
const timer = document.getElementById("timer");
const playerTable = document.getElementById("player-table");
const playersList = document.getElementById("players-list");
const roomName = document.getElementById("room-name");
const errorInfo = document.getElementById("error-info");
const gameInfo = document.getElementById("game-info");
const changeName = document.getElementById("change-name");
const nameInput = document.getElementById("name-input");

let gameStates = {};
const gameTimer = new GameTimer(gameTimer);

// Log connection status
socket.on("connect", () => {
  console.log("Connected to the WebSocket server");
  document.getElementById("info").innerText = "Connected to the Server";
});

let currentRoom = "";

function infoMessage(message) {
  info.innerText = message;
}

// ~~~~~~~~~~~~~~~~~~~
// All event listeners
// ~~~~~~~~~~~~~~~~~~~
join.addEventListener("click", () => {
  const roomName = roomId.value.trim();
  if (!roomName) {
    infoMessage("Please enter a room name.");
    return;
  }

  currentRoom = roomName.toLowerCase();
  socket.emit("room/join", currentRoom);
});

startBtn.addEventListener("click", () => {
  socket.emit("room/start", currentRoom);
});

stopBtn.addEventListener("click", () => {
  socket.emit("room/stop", currentRoom);
});

resumeBtn.addEventListener("click", () => {
  socket.emit("room/resume", currentRoom);
});

resetBtn.addEventListener("click", () => {
  socket.emit("room/reset", currentRoom);
});

// ~~~~~~~~~~~~~~~~~~~
// All socket events
// ~~~~~~~~~~~~~~~~~~~
socket.on("allGameStates", (states) => {
  gameStates = states;
});

socket.on("room/state", (gameRoom) => {
  clearChildren(playerTable);

  const th1 = document.createElement("th");
  const th2 = document.createElement("th");

  appendHeader(playerTable, th1, th2, "Player", "Socket Id");

  gameRoom.players.forEach((player, i) => {
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    appendRow(playerTable, td1, td2, i + 1, player);
  });

  roomName.innerText = gameRoom.name;
  errorInfo.innerText = "";
});

socket.on("room/gameStarted", ({ gameState }) => {
  if (gameState.started) {
    errorInfo.innerText = "";
    startBtn.disabled = true;
    join.disabled = true;
    gameTimer.setTime(gameState.timer);
    gameTimer.start();
  }
});

socket.on("room/resume", ({ gameState }) => {
  stopBtn.style.display = "block";
  resumeBtn.style.display = "none";
  stopBtn.gameTimer.setTime(gameState.timer);
  gameTimer.start();
});

socket.on("room/stop", () => {
  stopBtn.style.display = "none";
  resumeBtn.style.display = "block";
  stopBtn.gameTimer.pause();
});

socket.on("room/gameReset", ({ gameState }) => {
  startBtn.disabled = false;
  join.disabled = false;
  gameTimer.setTime(gameState.timer);
  gameTimer.pause();
});

socket.on("room/error", (errorMsg) => {
  errorInfo.innerText = errorMsg;
});

socket.on("room/userInfo", ({ id }) => {
  playerId.innerText = `Your ID: ${id}`;
});

socket.on("room/role", ({ role, location }) => {
  if (role.toLowerCase() == "spy") {
    info.innerText = `your role is Spy`;
  } else {
    info.innerText = `your role is ${role} the location is ${location}`;
  }
});
