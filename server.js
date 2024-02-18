const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//open redirect routes to rooms
app.use(express.static(path.join(__dirname, 'public')));

//indicate connections
io.on('connection', socket => {
  console.log('New connection...')

  socket.emit('message', 'Start your Seedling.');

  //user connects
  socket.broadcast.emit('message', 'User joined');

  //user disconnects
  socket.on('disconnect', () => {
    io.emit('message', 'User left')
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));