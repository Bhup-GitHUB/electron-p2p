const SimplePeer = require('simple-peer');
const io = require('socket.io-client');
const EventEmitter = require('events');

class P2PManager extends EventEmitter {
  constructor(signalingServerUrl) {
    super();
    this.signalingServerUrl = signalingServerUrl;
    this.peer = null;
    this.socket = null;
    this.roomId = null;
  }

  createRoom(roomId) {
    this.roomId = roomId;
    this.isInitiator = true;
    this.connectToSignalingServer(() => {
      this.socket.emit('create', roomId);
    });
  }

  joinRoom(roomId) {
    this.roomId = roomId;
    this.isInitiator = false;
    this.connectToSignalingServer(() => {
      this.socket.emit('join', roomId);
    });
  }

  connectToSignalingServer(callback) {
    this.socket = io(this.signalingServerUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      if (callback) callback();
    });

    this.socket.on('created', () => {
      console.log('Room created, waiting for peer...');
    });

    this.socket.on('joined', () => {
      console.log('Joined room, initiating connection...');
      this.initPeer(false);
    });

    this.socket.on('ready', () => {
      console.log('Peer is ready');
      if (this.isInitiator) {
        this.initPeer(true);
      }
    });

    this.socket.on('signal', (data) => {
      if (this.peer) {
        this.peer.signal(data);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('error', new Error('Failed to connect to signaling server'));
    });

    this.socket.on('error', (error) => {
      this.emit('error', new Error(error));
    });
  }

  initPeer(initiator) {
    this.peer = new SimplePeer({
      initiator: initiator,
      trickle: false
    });

    this.peer.on('signal', (data) => {
      this.socket.emit('signal', { room: this.roomId, signal: data });
    });

    this.peer.on('connect', () => {
      console.log('P2P connection established!');
      this.emit('connected');
    });

    this.peer.on('data', (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        this.emit('data', parsedData);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    });

    this.peer.on('close', () => {
      console.log('Connection closed');
      this.emit('disconnected');
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      this.emit('error', error);
    });
  }

  send(data) {
    if (this.peer && this.peer.connected) {
      this.peer.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

module.exports = P2PManager;

