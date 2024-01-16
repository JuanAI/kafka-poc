const { Kafka } = require('kafkajs');
require('dotenv').config();

// Accessing environment variables
const kafkaHost = process.env.KF_HOST;
const kafkaPort = process.env.KF_PORT;
let kafkaTopic = process.env.KF_TOPIC;

// Set default topic if KF_TOPIC is null or undefined
kafkaTopic = kafkaTopic || "stock-market";

// For external it should be "localhost:9092"
// const kafka = new Kafka({ clientId: "consumer1", brokers: ["kafka1:29092"] });
const kafka = new Kafka({ clientId: "consumer1", brokers: [`${kafkaHost}:${kafkaPort}`] });
const consumer = kafka.consumer({ groupId: "stock-group1" });

// console.log(`[Consumer1] HOST:PORT: ${kafkaHost}:${kafkaPort}`);

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      // console.log(`[Consumer1] HOST:PORT: ${kafkaHost}:${kafkaPort}`);
      console.log(`[Consumer1] Received: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
