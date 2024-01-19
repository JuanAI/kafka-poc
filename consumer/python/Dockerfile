# Use the official Python image that includes Python 3 and pip
FROM python:3.8-slim

# Create app directory
WORKDIR /usr/src/app

# Copy the Python requirements file into the container at /app
COPY requirements.txt ./

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

