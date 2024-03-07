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

/*
const OpenAIApi = require('openai');
const openai = new OpenAIApi({
  api_key: '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'
});

const botResponse = async(msg) => {
  chatCompletion = await openai.chat.completions.create({
  model: "gpt-3-turbo",
  messages: [{"role": "user", "content": "Hello!"}],
  });
  console.log(chatCompletion.choices[0].message);
  //io.to(user.room).emit('message', formatMessage(botName, text));
}
*/


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