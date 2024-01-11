# Kafka POC
## Steps for running the app

Run the following command in the directory where your docker-compose.yml file is located:

```
docker-compose up
```

Initialize your Node.js project (if you haven't already):

```
npm init -y
```

Install Kafka Node.js client. There are several clients available; for this example, we'll use kafkajs:

```
npm install kafkajs
```

Run producer1 or/and producer2

```
node producer1.js
node producer2.js
```

Run consumer1 or/and consumer2

```
node consumer1.js
node consumer2.js
```

## Notes

- The Kafka setup used here is basic and suitable for development and testing. For production use, you'll need a more robust setup, possibly with multiple brokers, better error handling, and considerations for scalability and reliability.

### Kafka's Message Retention and Offset Management: No missing messages

- In Kafka, when you stop a consumer and then start it again, it's possible to see all the messages that were sent to the topic while the consumer was down. This behavior is due to Kafka's message retention policy and how consumer offsets are managed. Here's a breakdown of how this works:
  - `Message Retention`: Kafka stores messages for a configurable retention period. This means that messages are not immediately deleted once they are consumed. Instead, they are kept in the topic for a set period (which could be based on time or size), allowing consumers to read the messages later if needed.
  - `Consumer Offsets`: Kafka tracks the position of each consumer in the topic, known as the "offset." This offset indicates the next message the consumer should read. When a consumer reads a message, it typically commits the offset of the latest message read. If a consumer stops and then restarts, it will begin reading from the last committed offset.
  - `Scenarios Upon Restarting a Consumer`:
    - `Consumer with Committed Offset`: If the consumer had committed its offset before it stopped, when it restarts, it will resume consuming from the next message after the last committed offset. It will then process all messages that arrived in the topic while it was down, up to the latest message available.
    - `Consumer without Committed Offset`: If the consumer hadn’t committed its offset or if it's configured to read from the earliest offset, it will start consuming from the earliest message still retained in the topic (or from a specific offset if configured that way).
  - `Configurations Affecting this Behavior`:
    - `auto.offset.reset`: This consumer configuration determines where the consumer starts reading if no valid offset is found. It can be set to earliest (to start from the earliest message) or latest (to start from the next message after the consumer starts).
    - `Retention Policy`: The broker's configuration for message retention (`log.retention.hours`, `log.retention.bytes`, etc.) determines how long messages are stored.
  - `Use Cases`: This ability is particularly useful for scenarios where you need guaranteed message processing. If a consumer goes down temporarily (due to a crash, deployment, etc.), it can catch up on all missed messages once it's back online, ensuring no data is lost.
