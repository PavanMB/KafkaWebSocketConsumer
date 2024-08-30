const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const kafka = require('kafka-node');
const cors = require('cors'); // Import cors


const app = express();
app.use(cors()); // Use cors
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Allow only this origin
      methods: ["GET", "POST"],
    }
  });

// Kafka Consumer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(
  client,
  [{ topic: 'test1', partition: 0 }],
  {
    autoCommit: true,
  }
);

consumer.on('message', (message) => {
  console.log('Received message:', message.value);
  // Emit data to WebSocket clients
  io.emit('data', message.value);
});

consumer.on('error', (err) => {
  console.error('Error in Kafka consumer:', err);
});

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
