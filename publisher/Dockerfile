# Base stage for Node.js
FROM node:14 as base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Kafka tools stage
FROM confluentinc/cp-kafka:latest as kafka

# Final stage
FROM base as final

# Copy Kafka command-line tools from Kafka image
# Note: You might need to adjust the paths depending on where the tools are located in the Kafka image
COPY --from=kafka /usr/bin/kafka-* /usr/bin/
COPY --from=kafka /usr/share/java /usr/share/java

# Set working directory
WORKDIR /usr/src/app

# Set entrypoint to Node.js application
CMD sh -c "sleep 30 && node producer1.js"
