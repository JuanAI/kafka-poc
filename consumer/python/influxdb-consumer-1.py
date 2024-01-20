from kafka import KafkaConsumer
import os
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS

# Load environment variables
load_dotenv()

# Kafka configuration
kafkaHost = os.environ.get("KF_HOST", "localhost")
kafkaPort = os.environ.get("KF_PORT", "9092")
kafkaTopic = os.environ.get("KF_TOPIC", "stock-market1")

# InfluxDB configuration
influxdb_url = os.environ.get("INFLUXDB_URL", "http://localhost:8086")
influxdb_token = os.environ.get("INFLUXDB_TOKEN", "my-super-secret-auth-token")
influxdb_org = os.environ.get("INFLUXDB_ORG", "my-org")
influxdb_bucket = os.environ.get("INFLUXDB_BUCKET", "my-bucket")

# Create InfluxDB client
client = InfluxDBClient(url=influxdb_url, token=influxdb_token, org=influxdb_org)
write_api = client.write_api(write_options=SYNCHRONOUS)
query_api = client.query_api()

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

        # Write data to InfluxDB
        point = Point("messages").tag("topic", kafkaTopic).field("message", message)
        write_api.write(bucket=influxdb_bucket, org=influxdb_org, record=point)

        # Query the last 10 messages from InfluxDB
        query = (
            f'from(bucket: "{influxdb_bucket}")'
            f" |> range(start: -1h)"
            f' |> filter(fn: (r) => r._measurement == "messages" and r.topic == "{kafkaTopic}")'
            f" |> sort(desc: true)"
            f" |> limit(n:10)"
        )
        result = query_api.query(org=influxdb_org, query=query)

        # Process query results
        last_messages = [
            record.get_value() for table in result for record in table.records
        ]
        print(f"Last 10 items from InfluxDB: {last_messages}")


if __name__ == "__main__":
    run()
