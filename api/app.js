const express = require('express')
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
  
  const consumer = consume('messages', (msgs) => {
    msgs.forEach(msg => socket.emit('chat message', msg))
  })

  const rosterStateConsumer = consume('rosterState', (msgs) => {
    msgs.forEach(msg => socket.emit('rosterState', msg))
  })

  socket.on('chat message', (msg) => {
    publish('messages', msg)
    console.log('message: ' + msg)
  })

  socket.on('rosterState', (msg) => {
    publish('rosterState', msg)
    console.log('rosterState: ' + msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    consumer.cancel()
    rosterStateConsumer.cancel()
  });
})

server.listen(3001, () => {
  console.log('listening on *:3001')
})