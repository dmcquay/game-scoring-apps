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
  
  const consumer = consume('messages', uuid.v4(), (msgs) => {
    msgs.forEach(msg => socket.emit('chat message', msg))
  })

  socket.on('chat message', (msg) => {
    publish('messages', msg)
    console.log('message: ' + msg)
  })

  let rosterActionConsumer
  socket.on('rosterSubscribe', (clientId) => {
    rosterActionConsumer = consume('rosterAction', clientId, (msgs) => {
      msgs.forEach(msg => socket.emit('rosterAction', msg))
    })
  })

  socket.on('rosterSubscribe', (msg) => {
    publish('rosterAction', msg)
    console.log('rosterAction: ' + msg)
  })

  socket.on('rosterAction', (msg) => {
    publish('rosterAction', msg)
    console.log('rosterAction: ' + msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    consumer.cancel()
    if (rosterActionConsumer != null) rosterActionConsumer.cancel()
  });
})

server.listen(3001, () => {
  console.log('listening on *:3001')
})