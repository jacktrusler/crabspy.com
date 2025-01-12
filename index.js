const socket = io('ws://localhost:55577');

// Grab all the elements, jank style
const join = document.getElementById("join-room")
const roomId = document.getElementById("room-id")
const startBtn = document.getElementById("start-btn")
const resetBtn = document.getElementById("reset-btn")
const player = document.getElementById('player');
const info = document.getElementById('info');
const timer = document.getElementById('timer');
const playersList = document.getElementById('players-list');
const roomName = document.getElementById('room-name');
const errorState = document.getElementById('error-state');
const changeName = document.getElementById('change-name');
const nameInput = document.getElementById('name-input');

// Log connection status
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
  document.getElementById('info').innerText = 'Connected to server';
});

// Current room name
let currentRoom = '';

// Function to log messages
function infoMessage(message) {
  info.innerText = message;
}


// ~~~~~~~~~~~~~~~~~~~
// All event listeners
// ~~~~~~~~~~~~~~~~~~~
join.addEventListener('click', () => {
  const roomName = roomId.value.trim();
  if (!roomName) {
    infoMessage('Please enter a room name.');
    return;
  }

  currentRoom = roomName;
  socket.emit('room/join', currentRoom);

  // Enable game buttons
  startBtn.disabled = false;
  resetBtn.disabled = false;
});

startBtn.addEventListener('click', () => {
  socket.emit('room/start', currentRoom);

  // Enable game buttons
  startBtn.disabled = false;
  resetBtn.disabled = false;
});

join.addEventListener('click', () => {
  const roomName = roomId.value.trim();
  if (!roomName) {
    infoMessage('Please enter a room name.');
    return;
  }

  currentRoom = roomName;
  socket.emit('room/join', currentRoom);

  // Enable game buttons
  startBtn.disabled = false;
  resetBtn.disabled = false;
});

// ~~~~~~~~~~~~~~~~~~~
// All socket events
// ~~~~~~~~~~~~~~~~~~~
socket.on("room/state", (state) => {
  console.log(state)
  playersList.innerHTML = "";
  state.players.forEach(player => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList.appendChild(li);
  });
  roomName.innerText = state.room
  errorState.innerText = ""
});

socket.on("room/gameStarted", (state) => {
  console.log(state)
  errorState.innerText = ""
  startBtn.disabled = true;
  resetBtn.disabled = true;
});

socket.on("room/error", (state) => {
  console.log(state)
  errorState.innerText = state
});

socket.on("room/userInfo", ({ id }) => {
  info.innerText = `Your ID: ${id}.`;
});

socket.on("room/role", ({ role, location }) => {
  if (role.toLowerCase() == 'spy') {
    info.innerText = `your role is Spy`
  } else {
    info.innerText = `your role is ${role} the location is ${location}`
  }
})

socket.on("room/timer", ({ remaining }) => {
  timer.innerText = remaining
})
