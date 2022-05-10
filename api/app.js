const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const { consume, publish } = require("./pubsub")

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected')
  
  const consumer = consume('messages', (msgs) => {
    msgs.forEach(msg => socket.emit('chat message', msg))
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    consumer.cancel()
  });

  socket.on('chat message', (msg) => {
    publish('messages', msg)
    console.log('message: ' + msg)
    // io.emit('chat message', msg)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})