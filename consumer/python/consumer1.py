from kafka import KafkaConsumer
import redis
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Kafka configuration
kafkaHost = os.environ.get("KF_HOST", "localhost")
kafkaPort = os.environ.get("KF_PORT", "9092")
kafkaTopic = os.environ.get("KF_TOPIC", "stock-market1")

# Redis configuration
redis_host = "redis-server"
redis_port = 6379

# Create Redis client
r = redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)


# Function to insert data into Redis
def insert_data_to_redis(key, message):
    # Using LPUSH to insert data at the head of the list and LTRIM to limit the list to the last 100 items
    r.lpush(key, message)
    r.ltrim(key, 0, 99)


# Function to read last `n` items from Redis
def read_data_from_redis(key, n=100):
    # Using LRANGE to get the last `n` items from the list
    return r.lrange(key, 0, n - 1)


# Kafka consumer configuration
consumer = KafkaConsumer(
    kafkaTopic,
    group_id="stock-group1",
    bootstrap_servers=f"{kafkaHost}:{kafkaPort}",
)


def run():
    for msg in consumer:
        # Decode message to string
        message = msg.value.decode("utf-8")
        print(f"Received message: {message}")

        # Insert data to Redis
        insert_data_to_redis(kafkaTopic, message)

        # Read and print last 10 items from Redis
        last_messages = read_data_from_redis(kafkaTopic, 10)
        print(f"Last 10 items from Redis: {last_messages}")


if __name__ == "__main__":
    run()
