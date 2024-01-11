# Steps

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