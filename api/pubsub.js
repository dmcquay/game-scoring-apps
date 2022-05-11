const topics = {}

// key=${consumerId}:${topicName}
// value=offset (starting at 0)
const consumerOffsets = {}

// key=topicName
// value={cb, consumerId}[]
let activeConsumersByTopic = {}

const publish = (topic, data) => {
  if (topics[topic] == null) {
    topics[topic] = []
  }
  topics[topic].push(data)
  emitBatchesForTopic(topic)
}

const consume = (topic, consumerId, cb) => {
  if (consumerOffsets[`${consumerId}:${topic}`] == null) {
    consumerOffsets[`${consumerId}:${topic}`] = 0
  }

  const consumer = {cb, id: consumerId}

  if (activeConsumersByTopic[topic] == null) {
    activeConsumersByTopic[topic] = []
  }
  activeConsumersByTopic[topic].push(consumer)

  emitBatchesForTopic(topic)

  return {
    cancel() {
      activeConsumersByTopic[topic] = activeConsumersByTopic[topic].filter(x => x !== consumer)
    }
  }
}

const emitBatch = (topic, consumer) => {
  if (topics[topic] == null) return
  if (consumerOffsets[`${consumer.id}:${topic}`] == topics[topic].length) return
  const messages = topics[topic].slice(consumerOffsets[`${consumer.id}:${topic}`])
  console.log(consumer)
  consumer.cb(messages)
  consumerOffsets[`${consumer.id}:${topic}`] = topics[topic].length
}

const emitBatchesForTopic = (topic) => {
  console.log('emitting batches for this may consumers of topic: ' + activeConsumersByTopic[topic])
  for (let consumer of activeConsumersByTopic[topic] || []) {
    emitBatch(topic, consumer)
  }
}

module.exports = {
  publish,
  consume
}