use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use futures::StreamExt;
use std::sync::Arc;
use serde_json::Value;
use tokio;
use std::env;
use redis::{AsyncCommands, Client};  // Import Redis functionality

async fn process_message(msg: rdkafka::message::BorrowedMessage<'_>, redis_client: &Client) {
    if let Some(payload) = msg.payload() {
        let parsed_json: Value = match serde_json::from_slice(payload) {
            Ok(json) => json,
            Err(e) => {
                eprintln!("Error parsing JSON: {:?}", e);
                return;
            }
        };

        let mut redis_conn = redis_client.get_async_connection().await.unwrap();
        let _: () = redis_conn.lpush("kafka_messages", payload).await.unwrap();
        let _: () = redis_conn.ltrim("kafka_messages", 0, 9).await.unwrap();
        let messages: Vec<String> = redis_conn.lrange("kafka_messages", 0, 9).await.unwrap();

        println!("Received JSON: {:?}", parsed_json);
        println!("Last 10 messages: {:?}", messages);
    }
}

async fn run_consumer(consumer: Arc<StreamConsumer>, topic_name: &str, redis_client: Client) {
    consumer.subscribe(&[&topic_name])
        .expect("Can't subscribe to specified topic");

    println!("Kafka consumer setup complete. Starting to consume messages...");

    let mut message_stream = consumer.stream();
    while let Some(message) = message_stream.next().await {
        match message {
            Ok(msg) => process_message(msg, &redis_client).await,
            Err(e) => eprintln!("Error while consuming: {:?}", e),
        }
    }
}

#[tokio::main]
async fn main() {
    let kafka_host = env::var("KF_HOST").unwrap_or_else(|_| "localhost".to_string());
    let kafka_port = env::var("KF_PORT").unwrap_or_else(|_| "9092".to_string());
    let kafka_topic = env::var("KF_TOPIC").unwrap_or_else(|_| "stock-market1".to_string());
    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis-server:6379".to_string());


    let bootstrap_servers = format!("{}:{}", kafka_host, kafka_port);
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rust-consumer-group")
        .set("bootstrap.servers", &bootstrap_servers)
        .set("enable.auto.commit", "true")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Consumer creation failed");

    let redis_client = redis::Client::open(redis_url.to_string())
        .expect("Failed to create Redis client");

    let consumer = Arc::new(consumer);

    run_consumer(consumer, &kafka_topic, redis_client).await;
}
