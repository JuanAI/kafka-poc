from confluent_kafka import Consumer, KafkaException
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Kafka configuration
kafkaHost = os.environ.get("KF_HOST", "localhost")
kafkaPort = os.environ.get("KF_PORT", "9092")
kafkaTopic = os.environ.get("KF_TOPIC", "stock-market")

# Redis configuration
redis_host = "redis-server"
redis_port = 6379

# Create Redis client
r = redis.Redis(host=redis_host, port=redis_port, db=0)

# Kafka consumer configuration
conf = {
    "bootstrap.servers": f"{kafkaHost}:{kafkaPort}",
    "group.id": "stock-group1",
    "auto.offset.reset": "earliest",
}
consumer = Consumer(conf)


def insert_data_into_redis(topic, message):
    r.lpush(topic, message)
    r.ltrim(topic, 0, 99)


def read_items_from_redis(topic, amount_of_data):
    return r.lrange(topic, 0, amount_of_data - 1)


def run():
    try:
        consumer.subscribe([kafkaTopic])

        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                raise KafkaException(msg.error())
            else:
                # Print the received message
                print(f"Received message: {msg.value().decode('utf-8')}")
                try:
                    # Insert data into Redis
                    insert_data_into_redis(kafkaTopic, msg.value().decode("utf-8"))
                except Exception as e:
                    print(f"Error inserting data into Redis: {e}")

                try:
                    # Read the last 10 items from Redis
                    prices = read_items_from_redis(kafkaTopic, 10)
                    print(f"Last 10 items from Redis DB: {prices}")
                except Exception as e:
                    print(f"Error fetching items from Redis: {e}")

    finally:
        # Close down consumer to commit final offsets.
        consumer.close()


if __name__ == "__main__":
    run()
