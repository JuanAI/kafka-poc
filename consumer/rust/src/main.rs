use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::Message;
use futures::StreamExt;
use std::sync::Arc;
use serde_json::Value;
use tokio;

async fn process_message(msg: rdkafka::message::BorrowedMessage<'_>) {
    if let Some(payload) = msg.payload() {
        match serde_json::from_slice::<Value>(payload) {
            Ok(parsed_json) => println!("Received JSON: {:?}", parsed_json),
            Err(e) => eprintln!("Error parsing JSON: {:?}", e),
        }
    }
}

async fn run_consumer(consumer: Arc<StreamConsumer>) {
    consumer.subscribe(&["stock-market1"])
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
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rust-consumer-group")
        .set("bootstrap.servers", "localhost:9092")
        .set("enable.auto.commit", "true")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Consumer creation failed");

    let consumer = Arc::new(consumer);

    run_consumer(consumer).await;
}
