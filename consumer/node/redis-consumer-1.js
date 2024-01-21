const { Kafka } = require("kafkajs");
const redis = require("redis");

require("dotenv").config();

const kafkaHost = process.env.KF_HOST || "localhost";
const kafkaPort = process.env.KF_PORT || "9092";
const kafkaTopic = process.env.KF_TOPIC || "stock-market1";

const client = redis.createClient({
  socket: {
    host: "redis-server",
    port: 6379,
  },
});

const kafka = new Kafka({
  clientId: "consumer1",
  brokers: [`${kafkaHost}:${kafkaPort}`],
});
const consumer = kafka.consumer({ groupId: "stock-group1" });

// Connect to Redis client
client.connect();

// Function to insert data into Redis
async function insertDataIntoRedis(topic, message) {
  await client.lPush(topic, message);
  await client.lTrim(topic, 0, 99);
}

// Function to read items from Redis
async function readItemsFromRedis(topic, amountOfData) {
  return await client.lRange(topic, 0, amountOfData - 1);
}

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`[Consumer] Received message: ${message.value.toString()}`);
      try {
        await insertDataIntoRedis(topic, message.value.toString());
      } catch (error) {
        console.error("Error inserting data into Redis:", error);
      }

      try {
        const prices = await readItemsFromRedis(topic, 10);
        console.log("Last 10 items from Redis DB:", prices);
      } catch (error) {
        console.error("Error fetching items from Redis:", error);
      }
    },
  });
}

run().catch(console.error);
