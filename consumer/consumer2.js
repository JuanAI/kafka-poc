const { Kafka } = require('kafkajs');
require('dotenv').config();

// Accessing environment variables
const kafkaHost = process.env.KF_HOST;
const kafkaPort = process.env.KF_PORT;
let kafkaTopic = process.env.KF_TOPIC;

// Set default topic if KF_TOPIC is null or undefined
kafkaTopic = kafkaTopic || "stock-market2";

// For external it should be "localhost:9093"
// const kafka = new Kafka({ clientId: "consumer2", brokers: ["kafka2:29092"] });
const kafka = new Kafka({ clientId: "consumer2", brokers: [`${kafkaHost}:${kafkaPort}`] });
const consumer = kafka.consumer({ groupId: "stock-group2" });

// console.log(`[Consumer2] HOST:PORT: ${kafkaHost}:${kafkaPort}`);

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      // console.log(`[Consumer2] HOST:PORT: ${kafkaHost}:${kafkaPort}`);
      console.log(`[Consumer2] Received: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
