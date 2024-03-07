const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
require('dotenv').config()
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const botResponse = require('./utils/response')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//open redirect routes to rooms
app.use(express.static(path.join(__dirname)));

const botName = 'Admin';


//indicate connections
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, `Welcome to the room!`));

    //user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} joined`));

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on('chatMessage', async (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
    const responseString = await botResponse(msg, user.room);
    io.to(user.room).emit('message', formatMessage(botName, responseString));
  });

  //user disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} left`));
    }

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));