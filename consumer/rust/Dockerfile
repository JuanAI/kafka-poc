# Builder stage
FROM rust:latest as builder

# Set the working directory
WORKDIR /kafka-rust

# Copy the manifest files
COPY ./Cargo.toml ./Cargo.toml

# This trick is to cache the dependencies
# It avoids rebuilding them if they haven't changed
COPY ./src ./src
RUN cargo build --release
RUN rm -rf src/


# Final stage: Use a minimal runtime environment
FROM rust:latest 

# Copy the binary from the builder stage
COPY --from=builder /kafka-rust/target/release/kafka-rust /usr/local/bin/kafka-rust
