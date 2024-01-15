const { Kafka } = require('kafkajs');
require('dotenv').config();

// Accessing environment variables
const kafkaHost = process.env.KF_HOST;
const kafkaPort = process.env.KF_PORT;

// For external it should be "localhost:9092"
// const kafka = new Kafka({ clientId: "consumer1", brokers: ["kafka1:29092"] });
const kafka = new Kafka({ clientId: "consumer1", brokers: [`${kafkaHost}:${kafkaPort}`] });
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
