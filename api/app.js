const express = require('express')
const uuid = require('uuid')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { consume, publish } = require("./pubsub")

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('chat message', (msg) => {
    publish('messages', msg)
    console.log('message: ' + msg)
  })

  socket.on('rosterState', (state) => {
    socket.broadcast.emit(state)
    console.log('broadcasting: ' + JSON.stringify(state))
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(3001, () => {
  console.log('listening on *:3001')
})