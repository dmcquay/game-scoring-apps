const { consume, publish } = require("./pubsub")

const consumer1 = consume('test', (msg) => {
  console.log('consumer 1 got message: ' + msg)
})

publish('test', 'message 1')
publish('test', 'message 2')

const consumer2 = consume('test', (msg) => {
  console.log('consumer 2 got message: ' + msg)
})

publish('test', 'message 3')

consumer2.cancel()

publish('test', 'message 4')