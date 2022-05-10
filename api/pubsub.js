const topics = {}
let consumers = {}

const publish = (topic, data) => {
  if (topics[topic] == null) {
    topics[topic] = []
  }
  topics[topic].push(data)
  emitBatchesForTopic(topic)
}

const consume = (topic, cb) => {
  const obj = {
    cb,
    index: 0
  }
  if (consumers[topic] == null) {
    consumers[topic] = []
  }
  consumers[topic].push(obj)
  emitBatchesForTopic(topic)
  return {
    cancel() {
      consumers[topic] = consumers[topic].filter(x => x !== obj)
    }
  }
}

const emitBatch = (topic, consumer) => {
  if (topics[topic] == null) return
  if (consumer.index == topics[topic].length) return
  const messages = topics[topic].slice(consumer.index)
  consumer.cb(messages)
  consumer.index = topics[topic].length
}

const emitBatchesForTopic = (topic) => {
  for (let consumer of consumers[topic]) {
    emitBatch(topic, consumer)
  }
}

module.exports = {
  publish,
  consume
}