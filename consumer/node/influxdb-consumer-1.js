require("dotenv").config();
const { Kafka } = require("kafkajs");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

// Load environment variables
const kafkaHost = process.env.KF_HOST || "localhost";
const kafkaPort = process.env.KF_PORT || "9092";
const kafkaTopic = process.env.KF_TOPIC || "stock-market1";

const influxdbUrl = process.env.INFLUXDB_URL || "http://localhost:8086";
const influxdbToken =
  process.env.INFLUXDB_TOKEN || "my-super-secret-auth-token";
const influxdbOrg = process.env.INFLUXDB_ORG || "my-org";
const influxdbBucket = process.env.INFLUXDB_BUCKET || "my-bucket";

// Create InfluxDB client
const influxDBClient = new InfluxDB({ url: influxdbUrl, token: influxdbToken });
const writeApi = influxDBClient.getWriteApi(influxdbOrg, influxdbBucket);
const queryApi = influxDBClient.getQueryApi(influxdbOrg);

// Kafka configuration
const kafka = new Kafka({
  clientId: "my-app",
  brokers: [`${kafkaHost}:${kafkaPort}`],
});

const consumer = kafka.consumer({ groupId: "stock-group1" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value.toString();

      console.log(`Received message: ${messageValue}`);

      // Write data to InfluxDB
      const point = new Point("messages")
        .tag("topic", kafkaTopic)
        .stringField("message", messageValue); // Use stringField for string data
      writeApi.writePoint(point);
      await writeApi.flush();

      // Query the last 10 messages from InfluxDB
      const query = `from(bucket: "${influxdbBucket}")
                |> range(start: -5s)
                |> filter(fn: (r) => r._measurement == "messages" and r.topic == "${kafkaTopic}")
                |> sort(desc: true)`;
      // |> limit(n:10)`;

      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const record = tableMeta.toObject(row);
          console.log(record);
        },
        error(error) {
          console.error(error);
          console.log("\\nFinished ERROR");
        },
        complete() {
          console.log("\\nFinished SUCCESS");
        },
      });
    },
  });
};

run().catch(console.error);
