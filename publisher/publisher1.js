const { Kafka } = require('kafkajs');
require('dotenv').config();

// Accessing environment variables
const kafkaHost = process.env.KF_HOST;
const kafkaPort = process.env.KF_PORT;
let kafkaTopic = process.env.KF_TOPIC;

// Set default topic if KF_TOPIC is null or undefined
kafkaTopic = kafkaTopic || "stock-market";

// For external it should be "localhost:9092"
// const kafka = new Kafka({ clientId: "broker1", brokers: ["kafka1:29092"] });
const kafka = new Kafka({ clientId: "broker1", brokers: [`${kafkaHost}:${kafkaPort}`] });
const producer = kafka.producer();
const brokerName = "Broker1";

// console.log(`[${brokerName}] HOST:PORT: ${kafkaHost}:${kafkaPort}`);

async function run() {
  await producer.connect();
  setInterval(async () => {
    const price = (Math.random() * 1000).toFixed(2);
    const stock = { symbol: "AAPL", price, broker: brokerName };
    await producer.send({
      topic: kafkaTopic,
      messages: [{ value: JSON.stringify(stock) }],
    });
    // console.log(`[${brokerName}] HOST:PORT: ${kafkaHost}:${kafkaPort}`);
    console.log(`[${brokerName}] Sent: ${JSON.stringify(stock)}`);
  }, 2000);
}

run().catch(console.error);
