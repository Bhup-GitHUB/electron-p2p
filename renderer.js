const P2PManager = require("./p2p-manager");
const CodeExecutor = require("./code-executor");

let p2pManager;
let codeExecutor;
let currentRoomId = null;

const statusEl = document.getElementById("status");
const roomIdInput = document.getElementById("roomId");
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const peerInfoEl = document.getElementById("peerInfo");
const codeEditor = document.getElementById("codeEditor");
const languageSelect = document.getElementById("language");
const executeLocalBtn = document.getElementById("executeLocal");
const executeRemoteBtn = document.getElementById("executeRemote");
const outputEl = document.getElementById("output");
const logEl = document.getElementById("log");

function init() {
  codeExecutor = new CodeExecutor();
  p2pManager = new P2PManager("http://localhost:3000");

  setupEventListeners();
  addLog("Application started. Start signaling server and create/join a room.");
}

function setupEventListeners() {
  createRoomBtn.addEventListener("click", createRoom);
  joinRoomBtn.addEventListener("click", joinRoom);
  executeLocalBtn.addEventListener("click", executeLocally);
  executeRemoteBtn.addEventListener("click", executeRemotely);

  languageSelect.addEventListener("change", updateCodeTemplate);

  p2pManager.on("connected", handlePeerConnected);
  p2pManager.on("disconnected", handlePeerDisconnected);
  p2pManager.on("data", handlePeerData);
  p2pManager.on("error", handleError);
}

function createRoom() {
  currentRoomId = generateRoomId();
  roomIdInput.value = currentRoomId;
  p2pManager.createRoom(currentRoomId);
  addLog(`Created room: ${currentRoomId}`);
  peerInfoEl.textContent = `Room ID: ${currentRoomId} - Waiting for peer...`;
}

function joinRoom() {
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    addLog("Please enter a Room ID", "error");
    return;
  }

  currentRoomId = roomId;
  p2pManager.joinRoom(roomId);
  addLog(`Joining room: ${roomId}...`);
  peerInfoEl.textContent = `Connecting to room: ${roomId}...`;
}

function handlePeerConnected() {
  statusEl.textContent = "Connected";
  statusEl.classList.add("connected");
  executeRemoteBtn.disabled = false;
  addLog("Peer connected successfully!", "success");
  peerInfoEl.textContent = `Connected to room: ${currentRoomId}`;
}

function handlePeerDisconnected() {
  statusEl.textContent = "Disconnected";
  statusEl.classList.remove("connected");
  executeRemoteBtn.disabled = true;
  addLog("Peer disconnected", "warning");
  peerInfoEl.textContent = "Disconnected";
}

async function handlePeerData(data) {
  if (data.type === "execute") {
    addLog(`Received code execution request (${data.language})...`);

    try {
      const result = await codeExecutor.execute(data.language, data.code);
      p2pManager.send({
        type: "result",
        result: result,
      });
      addLog("Code executed and result sent back");
    } catch (error) {
      p2pManager.send({
        type: "result",
        error: error.message,
      });
      addLog(`Execution error: ${error.message}`, "error");
    }
  } else if (data.type === "result") {
    if (data.error) {
      displayOutput(`Error: ${data.error}`, "error");
    } else {
      displayOutput(data.result);
    }
  }
}

async function executeLocally() {
  const code = codeEditor.value;
  const language = languageSelect.value;

  displayOutput("Executing locally...");
  addLog(`Executing ${language} code locally...`);

  try {
    const result = await codeExecutor.execute(language, code);
    displayOutput(result);
    addLog("Local execution completed");
  } catch (error) {
    displayOutput(`Error: ${error.message}`, "error");
    addLog(`Local execution error: ${error.message}`, "error");
  }
}

function executeRemotely() {
  const code = codeEditor.value;
  const language = languageSelect.value;

  displayOutput("Sending code to remote peer...");
  addLog(`Sending ${language} code to remote peer...`);

  p2pManager.send({
    type: "execute",
    language: language,
    code: code,
  });
}

function updateCodeTemplate() {
  const language = languageSelect.value;
  if (language === "javascript") {
    codeEditor.value = `// JavaScript example
console.log('Hello from P2P!');
const sum = (a, b) => a + b;
console.log('5 + 3 =', sum(5, 3));`;
  } else if (language === "python") {
    codeEditor.value = `# Python example
print('Hello from P2P!')
def sum(a, b):
    return a + b
print('5 + 3 =', sum(5, 3))`;
  }
}

function displayOutput(text, type = "normal") {
  if (type === "error") {
    outputEl.innerHTML = `<span style="color: #ef4444;">${text}</span>`;
  } else {
    outputEl.textContent = text;
  }
}

function addLog(message, type = "info") {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const timestamp = new Date().toLocaleTimeString();

  let color = "#64748b";
  if (type === "success") color = "#10b981";
  if (type === "error") color = "#ef4444";
  if (type === "warning") color = "#f59e0b";

  entry.innerHTML = `<span style="color: ${color};">[${timestamp}]</span> ${message}`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function handleError(error) {
  addLog(`Error: ${error.message}`, "error");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
