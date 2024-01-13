const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: "consumer1", brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "stock-group1" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "stock-market", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log(`[Consumer1] Received: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
