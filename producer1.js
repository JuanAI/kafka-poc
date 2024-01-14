const { Kafka } = require('kafkajs');

// For external it should be "localhost:9092"
const kafka = new Kafka({ clientId: "broker1", brokers: ["kafka1:29092"] });
const producer = kafka.producer();
const brokerName = "Broker1";

async function run() {
  await producer.connect();
  setInterval(async () => {
    const price = (Math.random() * 1000).toFixed(2);
    const stock = { symbol: "AAPL", price, broker: brokerName };
    await producer.send({
      topic: "stock-market",
      messages: [{ value: JSON.stringify(stock) }],
    });
    console.log(`[${brokerName}] Sent: ${JSON.stringify(stock)}`);
  }, 2000);
}

run().catch(console.error);
