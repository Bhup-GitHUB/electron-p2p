const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create', (roomId) => {
    handleCreate(socket, roomId);
  });

  socket.on('join', (roomId) => {
    handleJoin(socket, roomId);
  });

  socket.on('signal', (data) => {
    handleSignal(socket, data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    rooms.forEach((clients, room) => {
      const index = clients.indexOf(socket);
      if (index !== -1) {
        clients.splice(index, 1);
        if (clients.length === 0) {
          rooms.delete(room);
        }
      }
    });
  });
});

function handleCreate(socket, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, []);
  }
  rooms.get(roomId).push(socket);
  socket.emit('created');
  console.log(`Room created: ${roomId}`);
}

function handleJoin(socket, roomId) {
  if (!rooms.has(roomId)) {
    socket.emit('error', 'Room does not exist');
    return;
  }

  const clients = rooms.get(roomId);
  if (clients.length >= 2) {
    socket.emit('error', 'Room is full');
    return;
  }

  clients.push(socket);
  socket.emit('joined');
  
  clients.forEach(client => {
    client.emit('ready');
  });
  
  console.log(`Peer joined room: ${roomId}`);
}

function handleSignal(socket, data) {
  const roomId = data.room;
  if (!rooms.has(roomId)) return;
  
  const clients = rooms.get(roomId);
  clients.forEach(client => {
    if (client !== socket) {
      client.emit('signal', data.signal);
    }
  });
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

