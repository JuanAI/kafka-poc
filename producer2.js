const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: "broker1", brokers: ["localhost:9092"] });
const producer = kafka.producer();
const brokerName = "Broker2";

async function run() {
  await producer.connect();
  setInterval(async () => {
    const price = (Math.random() * 1000).toFixed(2);
    const stock = { symbol: "AAPL", price, broker: brokerName };
    await producer.send({
      topic: "stock-market2",
      messages: [{ value: JSON.stringify(stock) }],
    });
    console.log(`[${brokerName}] Sent: ${JSON.stringify(stock)}`);
  }, 2000);
}

run().catch(console.error);
