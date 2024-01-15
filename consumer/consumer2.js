const { Kafka } = require('kafkajs');
require('dotenv').config();

// Accessing environment variables
const kafkaHost = process.env.KF_HOST;
const kafkaPort = process.env.KF_PORT;

// For external it should be "localhost:9093"
// const kafka = new Kafka({ clientId: "consumer2", brokers: ["kafka2:29092"] });
const kafka = new Kafka({ clientId: "consumer2", brokers: [`${kafkaHost}:${kafkaPort}`] });
const consumer = kafka.consumer({ groupId: "stock-group2" });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "stock-market2", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log(`[Consumer2] Received: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
