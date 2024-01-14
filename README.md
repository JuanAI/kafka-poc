# Kafka POC

## Steps for running the app

Run the following command in the directory where your docker-compose.yml file is located:

```docker-compose up
```

Initialize your Node.js project (if you haven't already):

```npm init -y
```

Install Kafka Node.js client. There are several clients available; for this example, we'll use kafkajs:

```npm install kafkajs
```

Run producer1 or/and producer2

```node producer1.js
node producer2.js
```

Run consumer1 or/and consumer2

```node consumer1.js
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

### Kafka brokers vs Kafka clusters

- Kafka Brokers
  - Definition: A Kafka broker is a single Kafka server instance. It's responsible for storing and managing the data (messages or records). Each broker holds certain Kafka topics and partitions.
  - Role in Scalability and Fault Tolerance: Brokers are designed to work in concert. By having multiple brokers, Kafka achieves scalability, load balancing, and fault tolerance. If one broker fails, others can take over its duties.
  - Communication with Producers and Consumers: Producers send messages to brokers (which then store these messages), and consumers read messages from the brokers. The brokers handle all the details of which messages belong to which partitions and topics.
  
- Kafka Clusters
  - Definition: A Kafka cluster is a group of one or more brokers working together. The cluster is the complete Kafka instance encompassing all brokers.
  - Distributed Nature: The essence of a Kafka cluster is its distributed nature. This means it can scale horizontally by adding more brokers. The data (topics and partitions) is distributed across the cluster, providing high availability and redundancy.
  - Cluster Coordination: Originally, Kafka used ZooKeeper for managing cluster metadata, coordinating brokers, and electing leaders among partitions. However, newer versions of Kafka (2.8 and later) introduced KRaft mode, which allows Kafka to operate without ZooKeeper, with the coordination logic built directly into Kafka itself.
  - Leadership and Replication: In a cluster, one broker acts as the leader for a given partition, handling all reads and writes for that partition. Other brokers may replicate this partition for fault tolerance. The cluster manages this leader election and replication process.

- Key Differences
  - Granularity: A broker is a single Kafka server, whereas a cluster refers to the collective system of multiple brokers working together.
  - Scalability and Redundancy: While a single broker can handle Kafka operations, a cluster provides scalability and redundancy. In a cluster, responsibilities are distributed across multiple brokers.
  - Failure Handling: Clusters are more resilient to failures. If a broker in a cluster fails, other brokers in the cluster can take over its responsibilities, ensuring continued availability of the service.


Good references: 
- https://levelup.gitconnected.com/kraft-kafka-cluster-with-docker-e79a97d19f2c
- https://developer.confluent.io/learn/kraft/
- https://github.com/confluentinc/cp-all-in-one/blob/master/cp-all-in-one-kraft/docker-compose.yml
- https://github.com/conduktor/kafka-stack-docker-compose (with zookeeper)

TODO:

- [x] Create node consumer & producer
- [x] Kafka with and withouth zookeeper
- [x] Kafka single & multiple brokers
- [ ] Add consumer & producer in docker compose and enable communication
- [ ] Add Prometheus & Grafana for monitoring
- [ ] Add dependabot
- [ ] Include docker Swam, and learn how to use it
- [ ] Deploy infrastructure in AWS using TF ->  EC2 Spot Instances
- [ ] Use mechanism for spotting termination warning
