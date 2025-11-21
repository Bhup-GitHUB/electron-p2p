# 🌐 P2P Code Executor

A peer-to-peer code execution application built with Electron that allows you to execute code (JavaScript and Python) on remote computers using their computing power over a direct P2P connection.

## ✨ Features

- **Peer-to-Peer Connection**: Direct WebRTC connection between two computers
- **Remote Code Execution**: Execute JavaScript and Python code on a remote peer's machine
- **Local Execution**: Test code locally before sending to remote peer
- **Real-time Communication**: Instant code execution and result retrieval
- **Room-based System**: Create or join rooms to connect with peers
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🎯 Use Cases

- **Distributed Computing**: Utilize remote computing power for heavy computations
- **Code Testing**: Test code on different environments
- **Collaborative Coding**: Share and execute code with teammates
- **Resource Sharing**: Leverage powerful machines for intensive tasks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (for Python code execution) - [Download](https://www.python.org/downloads/)
- **npm** (comes with Node.js)

## 🚀 Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

This will install:
- Electron
- SimplePeer (WebRTC wrapper)
- Socket.IO (for signaling server)
- Other required dependencies

## 🏃 Running the Application

The application requires **two components** to run:

### Step 1: Start the Signaling Server

Open a terminal and run:
```bash
npm run server
```

You should see:
```
Signaling server running on port 3000
```

**Keep this terminal open!** The signaling server must be running for peers to connect.

### Step 2: Start the Electron App

Open a **new terminal** and run:
```bash
npm start
```

This will launch the Electron application window.

### Step 3: Connect Two Peers

**Option A: Two Windows (Same Computer - For Testing)**

1. Open a second terminal and run `npm start` again
2. In **Window 1**: Click "Create Room"
3. Copy the generated Room ID
4. In **Window 2**: Paste the Room ID and click "Join Room"
5. Wait for "Connected" status

**Option B: Two Different Computers (Same Network)**

1. **Computer 1**: 
   - Start signaling server: `npm run server`
   - Start app: `npm start`
   - Click "Create Room"
   - Share the Room ID with Computer 2

2. **Computer 2**:
   - Start app: `npm start`
   - Enter the Room ID from Computer 1
   - Click "Join Room"

## 📖 Usage Guide

### Creating a Room

1. Click the **"Create Room"** button
2. A Room ID will be generated (e.g., "A3X9K2")
3. Share this Room ID with the peer you want to connect with
4. Wait for a peer to join

### Joining a Room

1. Enter the Room ID in the input field
2. Click the **"Join Room"** button
3. Wait for connection status to show "Connected"

### Executing Code

**Local Execution:**
- Write your code in the editor
- Select the language (JavaScript or Python)
- Click **"Execute Locally"** to run on your machine

**Remote Execution:**
- Ensure you're connected to a peer (status shows "Connected")
- Write your code in the editor
- Select the language
- Click **"Execute on Remote Peer"** to run on the remote peer's machine
- Results will appear in the Output panel

### Example Code

**JavaScript:**
```javascript
const os = require('os');
console.log('Computer Name:', os.hostname());
console.log('CPU Count:', os.cpus().length);
console.log('Total Memory:', Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB');
```

**Python:**
```python
import platform
import os

print(f"Computer Name: {platform.node()}")
print(f"OS: {platform.system()} {platform.release()}")
print(f"CPU Count: {os.cpu_count()}")
```

## 📁 Project Structure

```
electron-p2p/
├── main.js                 # Electron main process
├── renderer.js             # Renderer process (UI logic)
├── p2p-manager.js          # P2P connection manager
├── code-executor.js        # Code execution engine
├── signaling-server.js     # Signaling server for WebRTC
├── index.html              # Application UI
├── styles.css              # Application styles
├── package.json            # Project dependencies
└── README.md               # This file
```

## 🔧 How It Works

### Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Peer A    │◄─── P2P WebRTC ───►│   Peer B    │
│  (Client)   │                    │  (Worker)   │
└─────────────┘                    └─────────────┘
      │                                   │
      │  1. Send code                     │
      ├──────────────────────────────────►│
      │                                   │
      │                        2. Execute │
      │                        on Peer B  │
      │                                   │
      │  3. Return results                │
      ◄───────────────────────────────────┤
```

### Connection Flow

1. **Signaling Phase**: Peers connect to signaling server to exchange WebRTC signals
2. **P2P Establishment**: Direct peer-to-peer connection is established via WebRTC
3. **Code Execution**: Code is sent over P2P connection and executed on remote peer
4. **Result Return**: Execution results are sent back through P2P connection

## 🛠️ Technologies Used

- **Electron**: Desktop application framework
- **WebRTC**: Peer-to-peer communication protocol
- **SimplePeer**: WebRTC wrapper library
- **Socket.IO**: Real-time signaling server
- **Node.js VM**: JavaScript code execution
- **Child Process**: Python code execution

## 🐛 Troubleshooting

### Connection Issues

**Problem: "Connecting..." status never changes**

**Solutions:**
- ✅ Ensure signaling server is running (`npm run server`)
- ✅ Check if port 3000 is available
- ✅ Verify both peers are running the app
- ✅ Check DevTools console for error messages
- ✅ Try creating a new room

**Problem: "Room does not exist"**

**Solutions:**
- ✅ Create the room FIRST on one peer
- ✅ Then join from the other peer
- ✅ Use the exact Room ID (case-sensitive)
- ✅ Ensure both peers are connected to the same signaling server

**Problem: "Failed to connect to signaling server"**

**Solutions:**
- ✅ Start the signaling server: `npm run server`
- ✅ Check if port 3000 is blocked by firewall
- ✅ Verify the server URL in `renderer.js` (default: `http://localhost:3000`)

### Code Execution Issues

**Problem: Python code doesn't execute**

**Solutions:**
- ✅ Ensure Python is installed and accessible via `python` command
- ✅ Check Python path in system environment variables
- ✅ Try running `python --version` in terminal to verify installation

**Problem: JavaScript code errors**

**Solutions:**
- ✅ Check DevTools console for detailed error messages
- ✅ Ensure Node.js modules are available (if using `require()`)
- ✅ Verify code syntax is correct

### Network Issues

**Problem: Can't connect between different computers**

**Solutions:**
- ✅ Ensure both computers are on the same network
- ✅ Check firewall settings (allow port 3000)
- ✅ For internet connection, configure STUN/TURN servers in `p2p-manager.js`
- ✅ Verify signaling server is accessible from both computers

## 🔒 Security Notes

⚠️ **Warning**: This application executes code on remote machines. Only connect with trusted peers!

- Code execution happens with the same permissions as the user running the app
- No sandboxing is implemented (code can access file system, network, etc.)
- Use only with trusted peers on secure networks
- Consider implementing authentication and code validation for production use

## 📝 Scripts

- `npm start` - Start the Electron application
- `npm run server` - Start the signaling server

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

ISC

## 🎉 Enjoy!

Happy coding! If you encounter any issues, check the troubleshooting section or open an issue on GitHub.
