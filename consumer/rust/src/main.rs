use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use futures::StreamExt;
use std::sync::Arc;
use serde_json::Value;
use tokio;
use std::env;  // Add this for environment variable support

async fn process_message(msg: rdkafka::message::BorrowedMessage<'_>) {
    if let Some(payload) = msg.payload() {
        match serde_json::from_slice::<Value>(payload) {
            Ok(parsed_json) => println!("Received JSON: {:?}", parsed_json),
            Err(e) => eprintln!("Error parsing JSON: {:?}", e),
        }
    }
}

async fn run_consumer(consumer: Arc<StreamConsumer>, topic_name: &str) {
    consumer.subscribe(&[&topic_name])
        .expect("Can't subscribe to specified topic");

    println!("Kafka consumer setup complete. Starting to consume messages...");

    let mut message_stream = consumer.stream();
    while let Some(message) = message_stream.next().await {
        match message {
            Ok(msg) => process_message(msg).await,
            Err(e) => eprintln!("Error while consuming: {:?}", e),
        }
    }
}

#[tokio::main]  // This attribute macro creates the Tokio runtime
async fn main() {
    // Use environment variables
    let kafka_host = env::var("KF_HOST").unwrap_or_else(|_| "localhost".to_string());
    let kafka_port = env::var("KF_PORT").unwrap_or_else(|_| "9092".to_string());
    let kafka_topic = env::var("KF_TOPIC").unwrap_or_else(|_| "stock-market1".to_string());

    // Combine host and port into a single string
    let bootstrap_servers = format!("{}:{}", kafka_host, kafka_port);

    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rust-consumer-group")
        .set("bootstrap.servers", &bootstrap_servers)
        .set("enable.auto.commit", "true")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Consumer creation failed");

    let consumer = Arc::new(consumer);

    run_consumer(consumer, &kafka_topic).await;
}
